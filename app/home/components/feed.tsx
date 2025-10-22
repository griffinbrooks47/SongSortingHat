
import { Track } from "@/types/artist"
import { TSorting } from "@/types/sorting"
import { IconUser } from "@tabler/icons-react"

import Image from "next/image"
import Link from "next/link"

export default function Feed(
    { sortings }: { sortings: TSorting[] }
) {
    return (
        <div className="flex flex-col gap-4">
            {sortings.map((sorting) => (
                <FeedItem key={sorting.id} sorting={sorting} />
            ))}
        </div>
    )
}

function FeedItem({ sorting }: { sorting: TSorting }) {
    return (
        <div className="w-full rounded-md card-sm py-[0.5rem]">
            <div className="flex flex-col">
                {/* User Info */}
                <div 
                className="h-14 px-4 rounded-md shadow-sm bg-base-100 flex flex-row items-center">
                    <div className="avatar w-8">
                        <div className="ring-black ring-offset-base-100 bg-secondary w-full rounded-full ring-2 ring-offset-2">
                            <IconUser className="h-full w-full"/>
                        </div>
                    </div>
                    <div className="h-full flex flex-row items-center px-[1rem]">
                        <h2 className="text-[1rem]">
                            <Link href={`/user/${sorting.user.id}`} className="font-bold">{sorting.user.name}</Link>
                            {" sorted "}
                            <span className="font-bold">{sorting.artist.name}</span>
                        </h2>
                    </div>
                </div>

                {/* Top 3 Tracks */}
                <div className="flex flex-col gap-2 mt-4 px-[0.5rem]">
                    {sorting.tracks.slice(0, 3).map((track, index) => (
                        <div key={track.id || index} className="flex items-center gap-3">
                            <span className="text-lg font-bold text-black w-[1rem] flex-shrink-0">{index + 1}</span>
                            <div className="flex-1">
                                <SongCard track={track} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Read More Button */}
                <div className="card-actions justify-start mt-4">
                    <Link href={`/sorting/${sorting.id}`} className="btn btn-outline bg-base-300 border-2 rounded-sm btn-sm">
                        View sorting...
                    </Link>
                </div>
            </div>
        </div>
    )
}


function SongCard({ track }: { track: Track }) {
    return (
        <div className="relative h-[4.5rem] pr-auto flex-shrink-0 rounded-sm border-2 border-black bg-base-100 overflow-hidden flex flex-row items-center gap-2 p-1">
            {/* Album Cover */}
            {track.images && track.images.length > 0 && (
                <figure className="h-full aspect-square rounded-sm flex-shrink-0 overflow-hidden">
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