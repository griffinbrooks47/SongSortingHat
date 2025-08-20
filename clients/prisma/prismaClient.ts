/* Spotify API Wrapper. */
//import spotify from "@/clients/spotify/spotifyClient";

/* Import prisma client module. */
import { prisma } from "../../lib/db";
import { Prisma } from '@prisma/client'

/* Universal artist types. */
import { Album, Artist, Genre, Img, Track } from "../../types/artist";

/* Database types. */
import { DBAlbumImg, DBArtist, DBArtistImg, DBGenre, PrismaClient } from "@prisma/client";

/* 
    Fields included when querying an artist. 

    Album:
    - images
    - tracks: 
        - id
        - spotifyId
        - artists:
            - id
            - name
            - spotifyId
            - last_updated
            - followers
    - external_urls
    - artist (with images, genres, sortings)
    - tracks (with images, artists)
    
    Track: 
    - images
    - artists (with images, genres, sortings)
    - external_urls
    - album (with images, artist)

*/
const artistInclude = Prisma.validator<Prisma.DBArtistInclude>()({
    external_urls: true,
    images:        true,
    genres:        true,
    sortings: {
        include: { tracks: true }
    },
    albums: {
        include: {
            images:        true,
            tracks:        {
                include: {
                    artists:     true,
                }
            },
            external_urls: true,
            artists: true,
        }
    },
    tracks: {
        include: { 
            images: true,
            artists: true
        }
    }
});

/* 
    Fields included when querying an Album
*/
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const albumInclude = Prisma.validator<Prisma.DBAlbumInclude>()({ 
    images: true, 
    artists: true, 
    tracks: {
        include: {
            artists: true,
        }
    }, 
    external_urls: true 
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const trackInclude = Prisma.validator<Prisma.DBTrackInclude>()({
    images: true, 
    artists: true, 
});

/** 
 *  * Prisma wrapper to add, update, delete, and query data from the database.
    Functions:
    ~ getArtist(spotifyId: string): Promise<Artist | null>
    ~ createArtist(artist: Artist): Promise<void>
*/
class PrismaWrapper {
  
    private static instance: PrismaWrapper;

    /* Static prisma client. */
    private static prisma: PrismaClient = prisma;

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
            const dbArtist = await prisma.dBArtist.findUnique({
                where: { spotifyId },
                include: artistInclude // Use predefined prisma validator. 
            });

            /* If artist not found, return null. */
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
    private parseArtist(dbArtist: Prisma.DBArtistGetPayload<{ include: typeof artistInclude }>): Artist {

        /* Package Artist Albums */
        const albums: Album[] = dbArtist.albums.map((album) => 
            this.parseAlbum(album)
        );
        /* Package Artist Tracks */
        const tracks: Track[] = dbArtist.tracks.map((track) => 
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
    private parseAlbum(dbAlbum: Prisma.DBAlbumGetPayload<{ include: typeof albumInclude }>): Album {

        /* Package Album Artists */
        const artists: Artist[] = dbAlbum.artists.map((artist: DBArtist) => ({
            /* Artist Data */
            spotifyId: artist.spotifyId,
            name: artist.name,
            followers: artist.followers,
            external_urls: {
                /* !!! Add external urls later */
            }
        }));

        /* Package Album Imgs */
        const images: Img[] = dbAlbum.images.map((img: DBAlbumImg) => ({
            width: img.width,
            height: img.height,
            url: img.url,
        }));

        /* Package Album Tracks */
        const tracks: Track[] = dbAlbum.tracks.map((track) => ({
            /* Artist Data */
            id: track.id,
            spotifyId: track.spotifyId,
            title: track.title,
            track_type: "track",
            album_title: dbAlbum.title,

            /* Relational Data */
            artists: track.artists.map((artist: DBArtist) => ({
                id: artist.id,
                spotifyId: artist.spotifyId,
                name: artist.name,
                followers: artist.followers,
                external_urls: {
                    /* !!!Add relational urls later */
                },
            })),
            images: images,
        }));

        return ({
            /* Album Data */
            spotifyId: dbAlbum.spotifyId,
            total_tracks: dbAlbum.total_tracks,
            external_urls: {
                spotify: dbAlbum.external_urls?.spotify_url || "",
            },
            title: dbAlbum.title,
            release_date: dbAlbum.release_date,

            /* Relational Data */
            images: images,
            artists: artists,
            tracks: tracks,
        })

    }

    /* 
        Parse a DBTrack (with relations) into a universal Track.
    */
    private parseTrack(dbTrack: Prisma.DBTrackGetPayload<{ include: typeof trackInclude }>): Track {

        /* Package artists. */
        const artists: Artist[] = dbTrack.artists.map((artist: DBArtist) => ({
            id: artist.id,
            spotifyId: artist.spotifyId,
            name: artist.name,
            followers: artist.followers,
            external_urls: {
                /* !!! Add external urls later */
            },
        }));

        const images: Img[] = dbTrack.images.map((img: DBAlbumImg) => ({
            width: img.width,
            height: img.height,
            url: img.url,
        }));

        return (
            {
                spotifyId: dbTrack.spotifyId,
                title: dbTrack.title,
                track_type: "album track",
                artists: artists,
                album_title: dbTrack.title,
                images: images,
            }
        )
    }
    
    /* 
        Create a new artist in the database.
    */
    public async createArtist(artist: Artist): Promise<void> {
        "use server";

        const artistImgs: Img[] = artist.images || [];
        const albums: Album[] = artist.albums || [];
        const tracks: Track[] = artist.tracks || [];

        /* Check if artist already exists. */
        const existingArtist = await this.getArtist(artist.spotifyId);
        
        
    }
          

}
export default PrismaWrapper.getInstance();