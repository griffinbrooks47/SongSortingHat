'use client'

import { Track } from "@/types/artist"
import { TSorting } from "@/types/sorting"
import { TUser } from "@/types/user"
import { IconUser, IconThumbUp, IconShare3, IconMessage2 } from "@tabler/icons-react"

import Image from "next/image"
import Link from "next/link"
import { motion, Variants } from "framer-motion";

export default function Feed(
    { sortings }: { sortings: TSorting[] }
) {
    const container: Variants = {
        hidden: { opacity: 1 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const item: Variants = {
        hidden: { 
            opacity: 0,
            scale: 0.975
        },
        show: { 
            opacity: 1,
            scale: 1,
            transition: {
                duration: 1,
                ease: "easeOut"
            }
        }
    };

    return (
        <motion.main 
            className="flex flex-col gap-8"
            variants={container}
            initial="hidden"
            animate="show"
        >
            {sortings.map((sorting) => (
                <motion.div
                    key={sorting.id}
                    variants={item}
                >
                    <FeedSorting sorting={sorting} />
                </motion.div>
            ))}
        </motion.main>
    )
}
/* 
    Content:
    - User Info
    - Top 3 Tracks
    - Link to full sorting
    - Like/Comment actions
*/
function FeedSorting(
    { sorting }: { sorting: TSorting }
) {

    const user: TUser = sorting.user;

    const tracks: Track[] = sorting.tracks;

    return (
        <main className="py-2 px-4 bg-base-100 rounded-md shadow-sm">
            {/* User Info */}
            <section className="pl-2 h-12 w-full flex flex-row">
                <div className="avatar w-9 h-9 my-auto">
                    <div className={`ring-black ring-offset-base-100 rounded-full ring-2 ring-offset-2 bg-${user.profilePicture?.backgroundColor || "secondary"}`}>
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
            <hr className="border-black opacity-10 w-full mx-auto mt-[5px]"></hr>
            {/* Top 5 tracks */}
            <Link className="cursor-pointer" href={"/sorting/" + sorting.id}>
                <ul>
                    {tracks.slice(0, 4).map((track, index) => (
                        <li key={track.id || index} className="flex items-center gap-3 my-2">
                            <section className="px-1 py-1 bg-base-200 rounded-sm w-full flex flex-row items-center">
                                <span className="text-md font-bold text-black mx-5 shrink-0">{index + 1}</span>
                                <div className="flex-1">
                                    <SongCard track={track} />
                                </div>
                            </section>
                        </li>
                    ))}
                </ul>
            </Link>
            {/* View More Button */}
            <section className="h-10 pb-1 px-4 flex flex-row justify-between items-center">
                <div className="flex flex-row items-center gap-8">
                    <button className="cursor-pointer">
                        <IconMessage2 />
                    </button>
                    <button className="cursor-pointer">
                        <IconThumbUp />
                    </button>
                    <button className="cursor-pointer">
                        <IconShare3 />
                    </button>
                </div>
                <div className="text-sm opacity-70 underline cursor-pointer">
                    full ranking...
                </div>
            </section>
        </main>
    )
}

function SongCard({ track }: { track: Track }) {
    return (
        <div className="flex flex-row items-center gap-4">
            <div className="w-14 h-14">
                <Image
                    src={track.images?.[0]?.url || "/album_art_placeholder.png"}
                    alt={track.album_title || "Album Art"}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full rounded-sm"
                />
            </div>
            <div className="flex flex-col">
                <h3 className="text-sm font-semibold">{track.title}</h3>
                <h4 className="text-xs text-neutral">{
                    track.artists.map(artist => artist.name).join(", ")
                }</h4>
            </div>
        </div>
    )
}   

