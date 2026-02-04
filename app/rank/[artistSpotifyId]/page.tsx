
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

const trackInclude = {
    artists: {
        include: {
            artist: true,
        }
    },
} satisfies Prisma.TrackInclude;
export type TrackWithRelations = Prisma.TrackGetPayload<{ include: typeof trackInclude  }>;

const albumInclude = {
    images: true,
    tracks: {
        include: trackInclude,
    },
} satisfies Prisma.AlbumInclude;
export type AlbumWithRelations = Prisma.AlbumGetPayload<{ include: typeof albumInclude  }>;

const artistInclude = {
    images: true,
    albums: {
        include: {
            album: {
                include: albumInclude,
            }
        }
    },
    tracks: {
        include: {
            track: {
                include: trackInclude,
            }
        }
    }
} satisfies Prisma.ArtistInclude;
export type ArtistWithRelations = Prisma.ArtistGetPayload<{ include: typeof artistInclude  }>;


export default async function Rank({
    params,
    }: {
    params: Promise<{ artistSpotifyId: string }>
}) {

    /* Check if user is logged in. */
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        redirect("/login");
    }

    const artistSpotifyId = (await params).artistSpotifyId;
    const artist: ArtistWithRelations | null = await prisma.artist.findUnique({
        where: {
            spotifyId: artistSpotifyId,
        },
        include: artistInclude,
    });
    if (!artist) {
        redirect(`/artist/${artistSpotifyId}`);
    }

    /* Separate albums and features. */
    const albums: AlbumWithRelations[] = artist.albums.map(a => a.album);
    const features: TrackWithRelations[] = artist.tracks.map(t => t.track);

    if(!albums.length && !features.length) {
        return (
            <main className="flex justify-center items-center h-screen pt-16">
                <p className="text-center text-muted-foreground">
                    No albums or features found for this artist.
                </p>
            </main>
        )
    }

    return (
        <main className="flex justify-center items-center h-screen pt-16">
            <RankerInterface 
                artistSpotifyId={artistSpotifyId}
                albums={albums}
            />
        </main>
    );
}