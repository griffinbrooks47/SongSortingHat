'use server'

/* Auth */
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/* Prisma */
import { prisma } from "@/lib/db";

export async function saveSorting(artistSpotifyId: string, sortingTrackIds: string[]) {
    
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    
    if (!session) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const result = await prisma.$transaction(async (tx) => {
        const artist = await tx.artist.findUnique({
            where: { spotifyId: artistSpotifyId },
            select: { id: true },
        });
        if (!artist) {
            throw new Error("Artist not found");
        }
        const sorting = await tx.sorting.create({
            data: {
                userId: userId,
                artistId: artist.id,
            }
        });
        await tx.sortingTrack.createMany({
            data: sortingTrackIds.map((trackId, index) => ({
                position: index + 1,
                trackId: trackId,
                sortingId: sorting.id,
            })),
        });
        return sorting;
    });
    return result;
}