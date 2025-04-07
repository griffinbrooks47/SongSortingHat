
/* Universal artist types. */
import { Album, Artist, Genre, Track } from "@/types/artist";

/* Database types. */
import { prisma } from "@/lib/db";
import { DBArtist, PrismaClient } from "@prisma/client";

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
    */
    public async getArtist(spotifyId: string): Promise<Artist | null> {
        /* Query the database for the artist. */
        const dbArtist = await PrismaWrapper.prisma.dBArtist.findUnique({
            where: {
                spotifyId: spotifyId,
            },
        });

        /* If artist is not found, return null. */
        if(!dbArtist) return null;

        /* Convert database artist to universal artist. */
        return this.parseArtist(dbArtist);
    }
    
    
    /* 
        Create a new artist in the database.
    */
    public async createArtist(artist: Artist): Promise<Artist> {

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

    /* 
        Parse a database artist object to a universal artist object.
    */
    private parseArtist(artist: DBArtist): Artist {
        
    }



}
export default PrismaWrapper.getInstance();