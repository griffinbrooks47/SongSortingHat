'use client'

/* Next / React */
import Image from "next/image"
import Link from "next/link"

/* Types */
import { SortingWithUserArtistAndTracks, TrackWithArtistsAndImages } from "../page"

/* Framer Motion */
import { motion, Variants } from "framer-motion";

/* Icons */
import { IconThumbUp, IconShare3, IconMessage2 } from "@tabler/icons-react"


export default function Feed(
    { sortings }: { sortings: SortingWithUserArtistAndTracks[] }
) {
    const container: Variants = {
        hidden: { opacity: 1 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.25
            }
        }
    };
    const item: Variants = {
        hidden: { 
            opacity: 0,
        },
        show: { 
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };
    return (
        <motion.main 
            className="flex flex-col gap-4 w-full"
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
    { sorting }: { sorting: SortingWithUserArtistAndTracks }
) {

    const user = sorting.user;
    const profilePicture = user.profilePicture;

    const tracks = sorting.tracks.sort((a, b) => a.position - b.position).map(entry => entry.track);

    return (
        <main className="pt-2 pb-2 px-2 sm:px-4 sm:pt-3 bg-base-100 rounded-md shadow-sm">
            {/* User Info */}
            <section className="pl-1 pb-1 sm:pl-1 h-10 w-full flex flex-row items-center justify-start">
                <figure className="avatar w-8 h-8 sm:w-9 sm:h-9 flex flex-col justify-center items-center">
                    {profilePicture 
                    ? 
                    <div
                        className={`flex justify-center items-center ring-2 ring-offset-0 ring-black ring-offset-base-100 h-full w-full rounded-full`}
                    >
                        {(profilePicture.type === "UPLOADED" && profilePicture.url)
                            ? 
                            <Image 
                                src={profilePicture.url}
                                alt={`${user.username}'s profile picture`}
                                width={48}
                                height={48}
                                className={`object-cover h-full w-full`}
                            />
                            : 
                            <figure className={`bg-${profilePicture.backgroundColor} h-full w-full rounded-full flex items-center justify-center`}>
                                <span className="text-md text-black font-bold">{profilePicture.foregroundInitials}</span>
                            </figure>
                        }
                    </div>
                    : 
                    <div className="skeleton h-10 w-10 shrink-0 rounded-full"></div>
                    }
                </figure>
                <div className="h-full flex flex-row items-center px-2 sm:px-3">
                    <h2 className="text-[0.85rem] sm:text-[1rem]">
                        <Link href={`/user/${user.id}`} className="font-bold">{user.username}</Link>
                        {" sorted "}
                        <Link href={`/artist/${sorting.artist.spotifyId}`} className="font-bold">{sorting.artist.name}</Link>
                    </h2>
                </div>
            </section>
            <hr className="border-black opacity-10 w-full mx-auto mt-[5px] sm:mt-[7.5px]"></hr>
            {/* Top 5 tracks */}
            <Link className="cursor-pointer" href={"/sorting/" + sorting.id}>
                <ul>
                    {tracks.slice(0, 4).map((track, index) => (
                        <li key={track.id || index} className="flex items-center gap-2 sm:gap-3 my-2">
                            <section className="px-1 py-1 bg-base-200 rounded-sm w-full flex flex-row items-center">
                                <span className="text-sm sm:text-md font-bold text-black mx-2 sm:mx-5 shrink-0">{index + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <SongCard track={track} />
                                </div>
                            </section>
                        </li>
                    ))}
                </ul>
            </Link>
            {/* View More Button */}
            <section className="h-10 pb-1 px-2 sm:px-4 flex flex-row justify-between items-center">
                <div className="flex flex-row items-center gap-4 sm:gap-8">
                    <button className="cursor-pointer scale-90 sm:scale-100">
                        <IconMessage2 />
                    </button>
                    <button className="cursor-pointer scale-90 sm:scale-100">
                        <IconThumbUp />
                    </button>
                    <button className="cursor-pointer scale-90 sm:scale-100">
                        <IconShare3 />
                    </button>
                </div>
                <Link href={`/sorting/${sorting.id}`} className="text-xs sm:text-sm opacity-70 underline cursor-pointer">
                    full ranking...
                </Link>
            </section>
        </main>
    )
}

function SongCard({ track }: { track: TrackWithArtistsAndImages }) {
    return (
        <div className="flex flex-row items-center gap-2 sm:gap-4 pr-2">
            <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0">
                <Image
                    src={track.album?.images?.[0]?.url || "/album_art_placeholder.png"}
                    alt={track.album?.title || "Album Art"}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full rounded-sm"
                />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-semibold truncate">{track.title}</h3>
                <h4 className="text-[0.65rem] sm:text-xs text-neutral truncate">{
                    track.artists.map(artist => artist.artist.name).join(", ")
                }</h4>
            </div>
        </div>
    )
}