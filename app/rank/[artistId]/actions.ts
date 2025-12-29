'use server'

/* Auth */
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/* Prisma */
import { prisma } from "@/lib/db";

export async function saveSorting(artistSpotifyId: string, sortingSpotifyIds: string[]) {
    
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    
    if (!session) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const result = await prisma.dBSorting.create({
        data: {
            userId: userId,
            artistId: artistSpotifyId,
            entries: {
                createMany: {
                    data: sortingSpotifyIds.map((spotifyId, index) => ({
                        position: index + 1,
                        trackId: spotifyId,
                    })),
                },
            },
            tracks: {
                connect: sortingSpotifyIds.map((spotifyId) => ({
                    spotifyId: spotifyId,
                })),
            }
        }
    });
    return result;
}