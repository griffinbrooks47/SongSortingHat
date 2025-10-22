'use server'

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/utils/prismaClient";

export async function saveSorting(artistSpotifyId: string, sortingSpotifyIds: string[]) {
    
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    
    if (!session) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const result = await prisma.createSorting(userId, artistSpotifyId, sortingSpotifyIds);
    return result;
}