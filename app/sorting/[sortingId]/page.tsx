
/* Next / React */
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";

/* Types */
import { Prisma, Track, Artist, ArtistImage, AlbumImage } from "@/prisma/generated/prisma/client";

/* Prisma */
import { prisma } from "@/lib/db";

/* Icons */
import { IconArrowsTransferUpDown } from "@tabler/icons-react";

const artistInclude = {
    images: true,
} satisfies Prisma.ArtistInclude;

type ArtistWithRelations = Prisma.ArtistGetPayload<{ include: typeof artistInclude }>;

const trackInclude = {
    artists: {
        include: {
            artist: true,
        }
    },
    album: {
        include: {
            images: true,
        }
    }
} satisfies Prisma.TrackInclude;

type TrackWithRelations = Prisma.TrackGetPayload<{ include: typeof trackInclude }>;

const sortingInclude = {
    user: true,
    artist: {
        include: artistInclude,
    },
    tracks: {
        include: {
            track: {
                include: trackInclude,
            },
        },
    },
} satisfies Prisma.SortingInclude;

type SortingWithUserArtistAndEntries = Prisma.SortingGetPayload<{ include: typeof sortingInclude }>;


export default async function SortingPage({
    params,
}: {
    params: Promise<{ sortingId: string }>;
}) {
    /* Check if user is logged in. */
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        redirect("/login");
    }

    const sortingId = (await params).sortingId;
    const sorting: SortingWithUserArtistAndEntries | null = await prisma.sorting.findUnique({
        where: {
            id: sortingId,
        },
        include: sortingInclude,
    });
    if (!sorting) {
        throw new Error("Sorting not found.");
    }

    const artist: ArtistWithRelations = sorting.artist;
    const tracks: TrackWithRelations[] = sorting.tracks.sort((a, b) => a.position - b.position).map(entry => entry.track);

    return (
        <main className="min-h-[calc(100vh-4rem)] w-full pt-8 sm:pt-10 md:pt-16 mb-8 flex flex-col items-center px-4 sm:px-6">
            {/* Artist Header */}
            <section className="relative w-full mt-12 sm:mt-12 md:mt-16 mb-4 sm:mb-8 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-0">
                {/* Artist Image */}
                {sorting.artist.images && sorting.artist.images.length > 0 && (
                    <figure className="avatar">
                        <div className="mask mask-squircle h-32 w-32 sm:h-36 sm:w-36 md:h-44 md:w-44">
                            <Image
                                src={sorting.artist.images[0].url}
                                width={280}
                                height={280}
                                alt={`${sorting.artist.name} profile picture`}
                                priority
                            />
                        </div>
                    </figure>
                )}

                {/* Artist Info */}
                <section className="w-full sm:w-auto sm:px-8 md:px-12 flex flex-col items-center sm:items-start text-center sm:text-left">
                    <div className="mb-1 text-xl sm:text-3xl md:text-[2.75rem] font-bold leading-tight sm:leading-13 line-clamp-2 w-full max-w-xs sm:max-w-md md:max-w-none">
                        {sorting.artist.name.length > 40
                            ? sorting.artist.name.slice(0, 40) + "..."
                            : sorting.artist.name}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <IconArrowsTransferUpDown className="opacity-60 w-4 h-4 sm:w-5 sm:h-5" />
                        <p className="text-base sm:text-md md:text-[1.15rem] font-semibold opacity-80">
                            Sorting by
                        </p>
                    </div>
                    <span className="text-black text-sm sm:text-base">
                        {sorting.user.username || "Anonymous"}
                    </span>
                    <p className="text-[0.7rem] sm:text-[0.7rem] md:text-[0.95rem] mt-1 font-semibold uppercase opacity-60">
                        {tracks.length} tracks
                    </p>
                </section>
            </section>

            <hr className="border-black opacity-10 w-full max-w-3xl sm:max-w-4xl md:w-200 mx-auto"></hr>

            {/* Sorted Tracks List */}
            <section className="flex flex-col items-center gap-2 sm:gap-3 pb-8 mt-6 sm:mt-8 w-full max-w-3xl sm:max-w-4xl md:max-w-none px-2 sm:px-0">
                {tracks.map((track, index) => {
                    const image = track.album.images[0];
                    if(!image) return null;
                    return (
                        <div
                            key={track.spotifyId}
                            className="flex items-center gap-2 sm:gap-3 w-full"
                        >
                            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-base-200 font-bold text-xs sm:text-sm shrink-0">
                                {index + 1}
                            </div>
                            <SongCard track={track} image={image} />
                        </div>
                    )
                })}
            </section>
        </main>
    );
}

function SongCard({ track, image }: { track: TrackWithRelations, image: AlbumImage }) {
    return (
        <div className="wrelative h-16 sm:h-18 md:h-20 w-[90%] mx-auto sm:w-140 shrink-0 rounded-md border-2 border-black bg-base-100 overflow-hidden flex flex-row gap-2 p-1">
            {/* Album Cover */}
            <figure className="h-full aspect-square rounded-sm shrink-0 overflow-hidden">
                <Image
                    src={image.url}
                    width={image.width || 300}
                    height={image.height || 300}
                    alt={track.title}
                    className="object-cover w-full h-full"
                    priority={false}
                    loading="lazy"
                />
            </figure>

            {/* Track Info */}
            <div className="flex flex-col justify-center flex-1 min-w-0 gap-0.5 pr-1">
                <strong className="text-xs sm:text-sm md:text-base font-bold truncate leading-tight">
                    {track.title}
                </strong>
                <p className="text-[0.6rem] sm:text-[0.65rem] md:text-xs truncate text-gray-500 leading-tight">
                    {track.artists[0].artist.name}
                </p>
            </div>
        </div>
    );
}