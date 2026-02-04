'use server'

/* Next / React */

/* Prisma */
import { prisma } from '@/lib/db';

/* Spotify API */
 
export async function checkArtistStatus(artistSpotifyId: string): Promise<boolean> {
    const artist = await prisma.artist.findUnique({
        where: { spotifyId: artistSpotifyId },
        select: { 
            tracksStatus: true,
            albumsStatus: true,
            imagesStatus: true,
        },
    });
    return artist ? artist.tracksStatus === 'COMPLETE' && artist.albumsStatus === 'COMPLETE' && artist.imagesStatus === 'COMPLETE' : false;
}