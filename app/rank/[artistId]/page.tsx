
/* Auth */
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/* SSH Types */
import { Album, Track } from "@/types/artist";

/* Components */
import RankerInterface from "./stages/RankerInterface";

/* Database Wrapper. */
import prisma from "@/utils/prismaClient";

export default async function Rank({
    params,
    }: {
    params: Promise<{ artistId: string }>
}) {

    /* Check if user is logged in. */
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        redirect("/login");
    }

    /* Artist ID */
    const artistId = (await params).artistId;

    /* Get the tracks by the request artist. */
    const albums: Album[] | null = await prisma.getAlbumsByArtist(artistId);
    const singles: Track[] | null = await prisma.getSinglesByArtist(artistId);    

    return (
        <main className="flex justify-center items-center h-screen pt-[4rem]">
            <RankerInterface 
                artistSpotifyId={artistId}
                albums={albums || []}
                singles={singles || []}
            />
        </main>
    );
}