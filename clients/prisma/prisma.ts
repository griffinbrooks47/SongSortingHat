
/* Universal artist types. */
import { Album, Artist, Genre, Img, Track } from "@/types/artist";

/* Database types. */
import { prisma } from "@/lib/db";
import { DBAlbum, DBAlbumImg, DBArtist, DBArtistImg, DBGenre, DBSorting, DBTrack, DBArtistUrls, DBAlbumUrls, PrismaClient } from "@prisma/client";

/* 
    Define types that include relational data. 
*/
type DBArtistWithRelations = DBArtist & {
    /* Relational Data */
    albums: DBAlbumWithRelations[];
    sortings: DBSortingWithRelations[];
    
    /* Non Relational Data */
    tracks: DBTrack[];
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
type DBSortingWithRelations = DBSorting & {
    tracks: DBTrack[]; 
};



/* 
    Prisma wrapper to add, update, delete, and query data from the database.
    Singleton pattern to ensure that only one instance of PrismaClient is created.
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
    Get an artist by their Spotify ID.
    Returns Artist data in the following shape:
    
    export interface Artist {
      spotifyId: string;
      name: string;
      images: Img[];
      external_urls: {
          spotify: string;
      };
      followers: number;
      genres: Genre[];
      albums?: Album[];
      tracks?: Track[];
    };
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
                    tracks: true,
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
    export interface Artist {
        spotifyId: string;
        name: string;
        images: Img[];
        external_urls: {
            spotify: string;
        };
        followers: number;
        genres: Genre[];
        albums?: Album[];
        tracks?: Track[];
    };
    */

    /*
    Parse a DBArtist (with relations) into a universal Artist.
    Adjust the mapping below as needed if your universal types include additional properties.
    */
    private parseArtist(dbArtist: DBArtistWithRelations): Artist {
        
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

        /* Package Artist Albums */
        const albums: Album[] = dbArtist.albums.map((album: DBAlbumWithRelations) => 
            this.parseAlbum(album)
        );

        /* Package Artist Tracks */
        const tracks: Track[] = dbArtist.tracks.map((track: DBTrack) => (
            this.parseTrack(track)
        ));

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
    Album
    export interface Album {
        spotifyId: string;
        total_tracks: number;
        external_urls: {
            spotify: "string"
        },
        name: string;
        release_date: string;

        images: Img[];
        artists: Artist[];
        tracks: {
            total: number;
            items: Track[];
        }
    }
    */
    private parseAlbum(dbAlbum: DBAlbumWithRelations): Album {

        /* Package Album Imgs */


        return {
            spotifyId: dbAlbum.spotifyId,
            external_urls: {
                spotify: dbAlbum.external_urls?.spotify_url || "",
            },
            name: dbAlbum.name,
            release_date: dbAlbum.release_date,
            images: dbAlbum.images.map((img: DBAlbumImg) => ({
                width: img.width,
                height: img.height,
                url: img.url,
            })),
            artists: dbAlbum.artists.map((artist) => this.parseArtist(artist)),
            tracks: {
                total: dbAlbum.tracks.length,
                items: dbAlbum.tracks.map((track) => this.parseTrack(track)),
            },
        }

    }

    private parseTrack(dbTrack: DBTrack): Track {

    }
    
    /* 
        Create a new artist in the database.
    */
    public async createArtist(artist: Artist): Promise<void> {

        /* Artist data. */
        const albums: Album[] = artist.albums;

        /* Create the artist in the database.  */
        const dbArtist = await prisma.dBArtist.create({
            data: {
                spotifyId: spotifyId,
            },
        });

    }

    /* 
        Create a new album in the database.
    */
    public async createAlbum(album: Album): Promise<Album> {}

    /* 
        Create a new track in the database.
    */
    public async createTrack(track: Track): Promise<Track> {}
    
    /* 
        Create a new genre in the database.
    */
    public async createGenre(genre: Genre): Promise<Genre> {}

}
export default PrismaWrapper.getInstance();