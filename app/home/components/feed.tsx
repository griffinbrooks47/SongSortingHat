
import { Track } from "@/types/artist"
import { TSorting } from "@/types/sorting"
import { TUser } from "@/types/user"
import { IconUser } from "@tabler/icons-react"

import Image from "next/image"
import Link from "next/link"

export function Feed(
    { sortings }: { sortings: TSorting[] }
) {
    return (
        <div className="flex flex-col gap-12">
            {sortings.map((sorting) => (
                <FeedItem key={sorting.id} sorting={sorting} />
            ))}
        </div>
    )
}

function FeedItem({ sorting }: { sorting: TSorting }) {

    const user: TUser = sorting.user

    return (
        <main className="w-full rounded-md card-sm py-2">
            <div className="flex flex-col">
                {/* User Info */}
                <section className="h-14 px-4 rounded-md shadow-sm border-black border-2 bg-base-100 flex flex-row items-center">
                    <div className="avatar w-8">
                        <div className="ring-black ring-offset-base-100 bg-secondary w-full rounded-full ring-2 ring-offset-2">
                            <Image
                                src={user.profilePicture?.url || "/profile_icons/default_profile_icon.png"}
                                alt={user.username}
                                width={32}
                                height={32}
                                className={`object-cover w-full h-full bg-${user.profilePicture?.backgroundColor || "accent"}`}
                            />
                        </div>
                    </div>
                    <div className="h-full flex flex-row items-center px-4">
                        <h2 className="text-[1rem]">
                            <Link href={`/user/${user.id}`} className="font-bold">{user.username}</Link>
                            {" sorted "}
                            <Link href={`/artist/${sorting.artist.spotifyId}`} className="font-bold">{sorting.artist.name}</Link>
                        </h2>
                    </div>
                </section>

                {/* Top 3 Tracks */}
                <div className="flex flex-col gap-2 mt-4 pl-2">
                    {sorting.tracks.slice(0, 3).map((track, index) => (
                        <div key={track.id || index} className="flex items-center gap-3">
                            <span className="text-lg font-bold text-black w-4 shrink-0">{index + 1}</span>
                            <div className="flex-1">
                                <SongCard track={track} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Read More Button */}
                <div className="card-actions justify-end mt-2">
                    <Link href={`/sorting/${sorting.id}`} className="btn btn-outline bg-secondary border-2 rounded-sm btn-sm">
                        View sorting...
                    </Link>
                </div>
            </div>
        </main>
    )
}


function SongCard({ track }: { track: Track }) {
    return (
        <div className="relative h-18 pr-auto shrink-0 rounded-sm border-2 border-black bg-base-100 overflow-hidden flex flex-row items-center gap-2 p-1">
            {/* Album Cover */}
            {track.images && track.images.length > 0 && (
                <figure className="h-full aspect-square rounded-sm shrink-0 overflow-hidden">
                    <Image
                        src={track.images[0].url}
                        width={track.images[0].width}
                        height={track.images[0].height}
                        alt={track.title}
                        className="object-cover w-full h-full"
                        priority={false}
                        loading="lazy"
                    />
                </figure>
            )}

            {/* Track Info */}
            <div className="flex flex-col justify-center flex-1 min-w-0 gap-0.5">
                <strong className="text-sm font-bold truncate leading-tight">
                    {track.title}
                </strong>
                <p className="text-[0.65rem] truncate text-gray-500 leading-tight">
                    {track.artists[0].name}
                </p>
            </div>
        </div>
    );
}


export function SkeletonFeed({ count = 3 }: { count?: number }) {
    return (
        <div className="flex flex-col gap-12">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonFeedItem key={i} />
            ))}
        </div>
    )
}

function SkeletonFeedItem() {
    return (
        <div className="w-full rounded-md card-sm py-2 animate-pulse">
            <div className="flex flex-col">
                {/* User Info Skeleton */}
                <div className="h-14 px-4 rounded-md shadow-sm border-black border-2 bg-base-100 flex flex-row items-center">
                    <div className="avatar w-8">
                        <div className="ring-black ring-offset-base-100 bg-gray-300 w-full rounded-full ring-2 ring-offset-2"></div>
                    </div>
                    <div className="h-full flex flex-row items-center px-4 flex-1">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    </div>
                </div>

                {/* Top 3 Tracks Skeleton */}
                <div className="flex flex-col gap-2 mt-4 pl-2">
                    {[1, 2, 3].map((index) => (
                        <div key={index} className="flex items-center gap-3">
                            <span className="text-lg font-bold text-gray-300 w-4 shrink-0">{index}</span>
                            <div className="flex-1">
                                <SkeletonSongCard />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Button Skeleton */}
                <div className="card-actions justify-end mt-2">
                    <div className="h-8 w-32 bg-gray-300 rounded-sm"></div>
                </div>
            </div>
        </div>
    )
}

function SkeletonSongCard() {
    return (
        <div className="relative h-18 pr-auto shrink-0 rounded-sm border-2 border-black bg-base-100 overflow-hidden flex flex-row items-center gap-2 p-1">
            {/* Album Cover Skeleton */}
            <div className="h-full aspect-square rounded-sm shrink-0 overflow-hidden bg-gray-300"></div>

            {/* Track Info Skeleton */}
            <div className="flex flex-col justify-center flex-1 min-w-0 gap-2">
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                <div className="h-2 bg-gray-300 rounded w-1/2"></div>
            </div>
        </div>
    )
}
