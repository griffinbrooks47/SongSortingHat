import { Track } from "@/types/artist";
import { motion } from "motion/react";

import Image from "next/image";


export default function Sorting(
    { tracks, onEnd }: { tracks: Track[], onEnd: (selectedIds: string[]) => void }
) {
    return (
        <main className="max-h-[calc(100vh-4rem)] bg-base-200 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">Your Top 10</h1>
                    <p className="text-lg text-base-content/70">
                        Drag to reorder your final rankings
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {tracks.slice(0, 10).map((track, index) => (
                        <motion.div
                            key={track.spotifyId}
                            className="relative flex items-center gap-4 p-4 rounded-md shadow-md border-2 border-black bg-base-100"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <div className="text-3xl font-bold text-base-content/30 min-w-[3rem]">
                                #{index + 1}
                            </div>
                            
                            <figure className="w-24 h-24 rounded-sm border-2 border-black overflow-hidden flex-shrink-0">
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

                            <div className="flex flex-col flex-1 min-w-0">
                                <strong className="text-lg font-bold truncate">
                                    {track.title}
                                </strong>
                                <p className="text-sm text-base-content/70 truncate">
                                    {track.artists[0].name}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="flex justify-center">
                    <motion.button
                        className="btn btn-lg border-2 border-black bg-accent hover:bg-accent/90 shadow-md px-8"
                        onClick={() => onEnd(tracks.slice(0, 10).map(t => t.spotifyId))}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                        Confirm Rankings
                    </motion.button>
                </div>
            </div>
        </main>
    );
}