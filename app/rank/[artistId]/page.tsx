
/* Auth */
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/* Database Wrapper. */
import { prisma } from "@/lib/db";

/* Types */
import { Prisma } from "@/prisma/generated/prisma/client";

/* Components */
import RankerInterface from "./stages/RankerInterface";
import { ArtistWithImagesAndAlbums } from "@/app/artist/[artist]/page";
import { Track } from "@/types/artist";

const trackInclude = {
    artists: true,
    images: true,
} satisfies Prisma.DBTrackInclude;
export type TrackWithImages = Prisma.DBTrackGetPayload<{ include: typeof trackInclude  }>;

const albumInclude = {
    artists: true,
    images: true,
    tracks: {
        include: trackInclude,
    },
} satisfies Prisma.DBAlbumInclude;
export type AlbumWithImages = Prisma.DBAlbumGetPayload<{ include: typeof albumInclude  }>;

const artistInclude = {
    images: true,
    albums: {
        include: albumInclude,
    },
}
export type ArtistWithImagesAlbumsAndTracks = Prisma.DBArtistGetPayload<{ include: typeof artistInclude  }>;


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
    const artist: ArtistWithImagesAlbumsAndTracks | null = await prisma.dBArtist.findUnique({
        where: {
            spotifyId: artistId,
        },
        include: artistInclude,
    });
    if (!artist) {
        redirect(`/artist/${artistId}`);
    }
    
    /* Separate albums and singles. */
    const albums: AlbumWithImages[] | null = artist.albums;
    const singles: TrackWithImages[] | null = await prisma.dBTrack.findMany({
        where: {
            artists: {
                some: {
                    spotifyId: artistId,
                },
            },
            albumId: null,
        },
        include: trackInclude,
    });

    return (
        <main className="flex justify-center items-center h-screen pt-16">
            <RankerInterface 
                artistSpotifyId={artistId}
                albums={albums || []}
                singles={singles || []}
            />
        </main>
    );
}