
/* SSH Types */
import { Artist, Album, Track } from "@/types/artist";

/* Components */
import RankerInterface from "./stages/RankerInterface";

/* Database Wrapper. */
import prisma from "@/utils/prismaClient";

export default async function Rank({
    params,
    }: {
    params: Promise<{ artistId: string }>
}) {

    /* Artist ID */
    const artistId = (await params).artistId;

    /* Get the tracks by the request artist. */
    const tracks: Track[] | null = await prisma.getTracksByArtist(artistId);
    if(!tracks) {
        return;
    }
    const filteredTracks: Track[] = [];

    for(const track of tracks) {
        if(!track.images[0]) {
            console.log(track);
        } else {
            filteredTracks.push(track);
        }
    }

    return (
        <main className="flex justify-center items-center h-screen pt-[4rem]">
            <RankerInterface tracks={filteredTracks || []}/>
        </main>
    );
}