
/* Import prisma client module. */
import { prisma } from "../../lib/db";

/* Universal artist types. */
import { Album, Artist, Genre, Img, Track } from "../../types/artist";

/* Database types. */
import { DBAlbum, DBAlbumImg, DBArtist, DBArtistImg, DBGenre, DBSorting, DBTrack, DBArtistUrls, DBAlbumUrls, PrismaClient } from "@prisma/client";

/* 
    Define types that include relational data. 
*/
type DBArtistWithRelations = DBArtist & {
    /* Relational Data */
    albums: DBAlbumWithRelations[];
    tracks: DBTrackWithRelations[];
    sortings: DBSortingWithRelations[];
    
    /* Non Relational Data */
    images: DBArtistImg[];
    genres: DBGenre[];
    external_urls: DBArtistUrls | null;
};

/* 
    Nested data types within DBArtist
*/
type DBAlbumWithRelations = DBAlbum & {
    images: DBAlbumImg[];
    artists: DBArtist[];
    tracks: DBTrack[]; 
    external_urls: DBAlbumUrls | null;
};
type DBTrackWithRelations = DBTrack & {
    artists: DBArtist[];
    images: DBAlbumImg[];
}
type DBSortingWithRelations = DBSorting & {
    tracks: DBTrack[]; 
};



/* 
    Prisma wrapper to add, update, delete, and query data from the database.
    
    Functions:
    ~ getArtist(spotifyId: string): Promise<Artist | null>
    
    ~ createArtist(artist: Artist): Promise<void>
    ~ createAlbum(album: Album): Promise<Album>
    ~ createTrack(track: Track): Promise<Track>
    ~ createGenre(genre: Genre): Promise<Genre>
*/
class PrismaWrapper {
  
    private static instance: PrismaWrapper;

    /* Static prisma client. */
    private static prisma: PrismaClient = prisma

    /* 
        Prisma client instance. 
        This is a singleton, so only one instance of the client will be created.
    */
    public static getInstance(): PrismaWrapper {
        if (!PrismaWrapper.instance) {
        PrismaWrapper.instance = new PrismaWrapper();
        }
        return PrismaWrapper.instance;
    }

    /* 
        Get an artist by Spotify ID.
    */
    public async getArtist(spotifyId: string): Promise<Artist | null> {
        try {
            const dbArtist: DBArtistWithRelations | null = await PrismaWrapper.prisma.dBArtist.findUnique({
                where: { spotifyId },
                include: {
                    sortings: {
                        include: {
                            tracks: true, // Include tracks in sortings
                        },
                    }, // DBSortingWithRelations[]
                    images: true,  // DBArtistImg[]
                    genres: true, // DBGenre[]
                    external_urls: true, // DBUrls
                    albums: {
                        include: {
                            images: true, // DBAlbumImg[]
                            tracks: true,  // DBTrack[]
                            artists: true,  // Include album artist(s)
                            external_urls: true, // Include external URLs for albums
                        },
                    },
                    tracks: {
                        include: {
                            artists: true, // DBArtist[]
                            images: true, // DBAlbumImg[]
                        }
                    },
                },
            });
            if (!dbArtist) return null;
            return this.parseArtist(dbArtist);
        } catch (error) {
            console.error("Error in getArtist:", error);
            throw error;
        }
    }
    
    /*
        Parse a DBArtist (with relations) into a universal Artist.
    */
    private parseArtist(dbArtist: DBArtistWithRelations): Artist {

        /* Package Artist Albums */
        const albums: Album[] = dbArtist.albums.map((album: DBAlbumWithRelations) => 
            this.parseAlbum(album)
        );
        /* Package Artist Tracks */
        const tracks: Track[] = dbArtist.tracks.map((track: DBTrackWithRelations) => 
            this.parseTrack(track)
        );

        /* Package Artist Imgs */
        const images: Img[] = dbArtist.images.map((img: DBArtistImg) => ({
            width: img.width,
            height: img.height,
            url: img.url,
        }));
        /* Package Artist Genres */
        const genres: Genre[] = dbArtist.genres.map((g: DBGenre) => ({
            id: g.id,
            name: g.name,
        }));
        /* Package external urls */
        const external_urls = {
            spotify: dbArtist.external_urls?.spotify_url || "",
        };

        return {
            /* Relational data */
            albums: albums,
            tracks: tracks,
            genres: genres,
            images: images,

            /* Non relational data */
            spotifyId: dbArtist.spotifyId,
            name: dbArtist.name,
            external_urls: external_urls,
            followers: dbArtist.followers,
        };
    }

    /* 
        Parse a DBAlbum (with relations) into a universal Album.
    */
    private parseAlbum(dbAlbum: DBAlbumWithRelations): Album {

        /* Package Album Imgs */
        const images: Img[] = dbAlbum.images.map((img: DBAlbumImg) => ({
            width: img.width,
            height: img.height,
            url: img.url,
        }));
        /* Package Album Artists */
        const artists: Artist[] = dbAlbum.artists.map((artist: DBArtist) => ({
            spotifyId: artist.spotifyId,
            name: artist.name,
            followers: artist.followers,
        }));
        /* Package Album Tracks */
        const tracks: Track[] = dbAlbum.tracks.map((track: DBTrack, index: number) => ({
            spotifyId: track.spotifyId,
            name: track.title,
            track_number: index,
            artists: artists,
            album_title: dbAlbum.title,
            images: images,
        }));

        return ({
            spotifyId: dbAlbum.spotifyId,
            total_tracks: dbAlbum.total_tracks,
            external_urls: {
                spotify: dbAlbum.external_urls?.spotify_url || "",
            },
            name: dbAlbum.title,
            release_date: dbAlbum.release_date,

            images: images,
            artists: artists,
            tracks: {
                total: dbAlbum.total_tracks,
                items: tracks,
            }
        })

    }

    /* 
        Parse a DBTrack (with relations) into a universal Track.
    */
    private parseTrack(dbTrack: DBTrackWithRelations): Track {

        /* Package artists. */
        const artists: Artist[] = dbTrack.artists.map((artist: DBArtist) => ({
            spotifyId: artist.spotifyId,
            name: artist.name,
            followers: artist.followers,
        }));

        return (
            {
                spotifyId: dbTrack.spotifyId,
                name: dbTrack.title,
                artists: artists,
                album_title: dbTrack.title,
                images: dbTrack.images.map((img: DBAlbumImg) => ({
                    width: img.width,
                    height: img.height,
                    url: img.url,
                })),
            }
        )
    }
    
    /* 
        Create a new artist in the database.
    */
    public async createArtist(artist: Artist): Promise<DBArtist> {

        return prisma.dBArtist.upsert({
            where: { spotifyId: artist.spotifyId },
            update: {
              // — scalar fields
              name:      artist.name,
              followers: artist.followers,
        
              // — one‑to‑one external_urls
              external_urls: artist.external_urls
                ? {
                    upsert: {
                      create: { spotify_url: artist.external_urls.spotify },
                      update: { spotify_url: artist.external_urls.spotify },
                    },
                  }
                : undefined,
        
              // — replace images
              images: artist.images
                ? {
                    deleteMany: {},                     // drop any old images
                    create: artist.images.map((img) => ({
                      url:    img.url,
                      width:  img.width,
                      height: img.height,
                    })),
                  }
                : undefined,
        
              // — reset & reconnect genres
              genres: artist.genres
                ? {
                    set: [],                            // clear old links
                    connectOrCreate: artist.genres.map((g) => ({
                      where: { name: g.name },
                      create: { name: g.name },
                    })),
                  }
                : undefined,
        
              // — link or create albums
              albums: artist.albums
                ? {
                    connectOrCreate: artist.albums.map((a: Album) => ({
                      where: { spotifyId: a.spotifyId },
                      create: {
                        spotifyId:   a.spotifyId,
                        title:       a.name,
                        release_date:a.release_date,
                        total_tracks:a.total_tracks,
                        artistId:    artist.spotifyId, // Include the required artistId field
                        // nested create of the one‑to‑one URL if you want:
                        external_urls: a.external_urls
                          ? { create: { spotify_url: a.external_urls.spotify } }
                          : undefined,
                      },
                    })),
                  }
                : undefined,
        
              // — link or create tracks
              tracks: artist.tracks
                ? {
                    connectOrCreate: artist.tracks.map((t: Track) => ({
                      where: { spotifyId: t.spotifyId },
                      create: {
                        spotifyId:  t.spotifyId,
                        title:      t.name,
                        album_title:t.album_title ?? "",     // adjust if your field name differs
                      },
                    })),
                  }
                : undefined,
            },
        
            create: {
              // — scalars
              spotifyId: artist.spotifyId,
              name:      artist.name,
              followers: artist.followers,
        
              // — one‑to‑one URL
              external_urls: artist.external_urls
                ? { create: { spotify_url: artist.external_urls.spotify } }
                : undefined,
        
              // — images
              images: artist.images
                ? {
                    create: artist.images.map((img) => ({
                      url:    img.url,
                      width:  img.width,
                      height: img.height,
                    })),
                  }
                : undefined,
        
              // — genres
              genres: artist.genres
                ? {
                    connectOrCreate: artist.genres.map((g) => ({
                      where: { name: g.name },
                      create: { name: g.name },
                    })),
                  }
                : undefined,
        
              // — albums
              albums: artist.albums
                ? {
                    connectOrCreate: artist.albums.map((a: Album) => ({
                      where: { spotifyId: a.spotifyId },
                      create: {
                        spotifyId:   a.spotifyId,
                        title:       a.name,
                        release_date:a.release_date,
                        total_tracks:a.total_tracks,
                        artistId:    artist.spotifyId, // Include the required artistId field
                        external_urls: a.external_urls
                          ? { create: { spotify_url: a.external_urls.spotify } }
                          : undefined,
                      },
                    })),
                  }
                : undefined,
        
              // — tracks
              tracks: artist.tracks
                ? {
                    connectOrCreate: artist.tracks.map((t: Track) => ({
                      where: { spotifyId: t.spotifyId },
                      create: {
                        spotifyId:  t.spotifyId,
                        title:      t.name,
                        album_title:t.album_title ?? "",
                      },
                    })),
                  }
                : undefined,
            },
        });

    } 

}
export default PrismaWrapper.getInstance();