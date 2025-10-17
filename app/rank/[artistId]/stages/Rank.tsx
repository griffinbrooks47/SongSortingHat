'use client'

import { Track } from "@/types/artist"

import { useRanker } from "../hooks/useRanker"
import { useEffect, useState } from "react";
import { motion } from "motion/react";

import Image from "next/image";

export default function Rank(
    { tracks, onEnd }: { tracks: Track[] , onEnd: (finalList: string[]) => void }) {

    const [trackMap, setTrackMap] = useState<Map<string, Track>>(new Map());
    const { currentMatchup, initilize, makeChoice, isComplete, finalSorting, reverseScoreMap } = useRanker();

    useEffect(() => {
        if(tracks.length > 0) {
            const newMap: Map<string, Track> = new Map();
            for(const track of tracks) {
                newMap.set(track.spotifyId, track);
            }
            setTrackMap(newMap);
            initilize(Array.from(newMap.keys()));
        }
    }, [tracks, initilize])

    useEffect(() => {
        if(isComplete && finalSorting) {
            onEnd(finalSorting);
        }
    }, [isComplete, finalSorting, onEnd])

    if(!currentMatchup) {
        return (
            <main>
                Loading
            </main>
        )
    }

    const track1: Track | undefined = trackMap.get(currentMatchup[0]);
    const track2: Track | undefined = trackMap.get(currentMatchup[1]);
    if(!track1 || !track2) {
        return <div>No track names</div>
    }

    return (
    <main>
        {isComplete && 
            <div>Complete!</div>
        }
        {!isComplete &&
            <section className="flex gap-4">
                <motion.button
                    className="relative h-[20rem] w-[16rem] cursor-pointer rounded-md shadow-md border-black bg-base-100 border-2 p-2"
                    onClick={() => {
                        makeChoice(currentMatchup[0], currentMatchup[1])
                    }}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                    <div className="flex flex-col items-center h-full gap-2">
                        <figure className="w-full aspect-square rounded-sm border-2 border-black overflow-hidden">
                            <Image 
                                src={track1.images[0].url || ''}
                                width={track1.images[0].width || 300}
                                height={track1.images[0].height || 300}
                                alt={track1.title}
                                className="object-cover"
                                priority={false}
                                loading="lazy"
                            />
                        </figure>
                        <div className="flex flex-col items-center py-1">
                            <strong className="text-sm font-bold truncate max-w-[14ch]">
                                {track1.title}
                            </strong>
                            <p className="text-xs mt-[-0.25rem] truncate max-w-[40ch]">
                                {track2.artists.map(artist => artist.name).join(', ')}
                            </p>
                        </div>
                    </div>
                    
                    {/* Hover overlay */}
                    <motion.div 
                        className="w-full h-full inset-0 bg-black/90 border-2 border-black rounded-sm absolute flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 0.9 }}
                        transition={{ duration: 0.075 }}
                    >
                        <strong className="text-sm text-white font-bold text-center px-2">
                            {track1.title}
                        </strong>
                    </motion.div>
                </motion.button>

                <motion.button
                    className="relative h-[20rem] w-[16rem] cursor-pointer rounded-md shadow-md border-black bg-base-100 border-2 p-2"
                    onClick={() => {
                        makeChoice(currentMatchup[1], currentMatchup[0])
                    }}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                    <div className="flex flex-col items-center h-full gap-2">
                        <figure className="w-full aspect-square rounded-sm border-2 border-black overflow-hidden">
                            <Image 
                                src={track2.images[0].url || ''}
                                width={track2.images[0].width || 300}
                                height={track2.images[0].height || 300}
                                alt={track2.title}
                                className="object-cover"
                                priority={false}
                                loading="lazy"
                            />
                        </figure>
                        <div className="flex flex-col items-center py-1">
                            <strong className="text-sm font-bold truncate max-w-[14ch]">
                                {track2.title}
                            </strong>
                            <p className="text-xs mt-[-0.25rem] truncate max-w-[14ch]">
                                {track2.artists[0].name}
                            </p>
                        </div>
                    </div>
                    
                    {/* Hover overlay */}
                    <motion.div 
                        className="w-full h-full inset-0 bg-black/90 border-2 border-black rounded-sm absolute flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 0.9 }}
                        transition={{ duration: 0.075 }}
                    >
                        <strong className="text-sm text-white font-bold text-center px-2">
                            {track2.title}
                        </strong>
                    </motion.div>
                </motion.button>
                <div className="flex flex-col gap-2 p-4 bg-base-200 rounded-md border-2 border-black max-w-md">
                    <h3 className="font-bold text-lg mb-2">Current Rankings</h3>
                    <div className="flex flex-col gap-1">
                        {Array.from(reverseScoreMap.keys())
                            .sort((a, b) => b - a)
                            .map((score) => {
                                const trackIds = reverseScoreMap.get(score);
                                if (!trackIds) return null;
                                
                                return Array.from(trackIds).map((trackId) => {
                                    const track = trackMap.get(trackId);
                                    if (!track) return null;
                                    
                                    return (
                                        <div 
                                            key={trackId}
                                            className="flex items-center gap-2 text-sm p-2 bg-base-100 rounded border border-gray-300"
                                        >
                                            <span className="font-mono text-xs text-gray-500 w-8">
                                                {score}
                                            </span>
                                            <span className="truncate">
                                                {track.title}
                                            </span>
                                        </div>
                                    );
                                });
                            })}
                    </div>
                </div>
            </section>
        }
    </main>
)}