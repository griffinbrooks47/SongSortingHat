'use client'

import { Track } from "@/types/artist"

import { useRanker } from "../hooks/useRanker"
import { useEffect, useState } from "react";
import { motion } from "motion/react";

import Image from "next/image";
import { IconAB, IconPointerFilled } from "@tabler/icons-react";

export default function Rank(
    { tracks, onEnd }: { tracks: Track[] , onEnd: (finalList: string[]) => void }) {

    const [trackMap, setTrackMap] = useState<Map<string, Track>>(new Map());
    const { currentMatchup, initilize, makeChoice, isComplete, finalSorting, reverseScoreMap } = useRanker();

    /* Intialize ranker instance*/
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

    /* Handle completion */
    useEffect(() => {
        if(isComplete && finalSorting) {
            onEnd(finalSorting);
        }
    }, [isComplete, finalSorting, onEnd])

    if(!currentMatchup || trackMap.size === 0) {
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
    <main className="h-[calc(100vh-4rem)] w-full pt-[2rem] mb-[0rem] flex flex-col items-center">
        <nav className="w-[50rem] flex flex-row justify-between items-center">
            <button
                className="btn btn-md btn-outline btn-disabled bg-base-100 rounded-md"
                onClick={() => {
                    // Back to Artist functionality
                }}
            >
                Prev
            </button>
            <header className="flex flex-row items-center font-semibold gap-2">
                <IconAB />
                <h1 className="text-xl">Song Showdown</h1>
            </header>   
            <button 
                className="btn btn-outline btn-disabled bg-secondary btn-md rounded-md"
            >
                Next
            </button>
        </nav>
        <hr className="border-black opacity-10 w-[50rem] mx-auto mt-1"></hr>
        <header className="mt-6 mb-6 flex justify-center items-center">
            <div className="badge badge-outline badge-black bg-primary">
                <IconPointerFilled className="size-[1rem]" />
                <p className="text-center opacity-80 text-black pr-[0.25rem]">{`Choose the better song!`}</p>
            </div>
        </header>
        {isComplete && 
            <div>Complete!</div>
        }
        {!isComplete &&
            <section className="flex flex-col justify-center items-center gap-4">

                {/* Rank Choices */}
                <menu className="flex gap-4">
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
                </menu>

                {/* Current Sorting */}
                <footer className="w-[50rem] mt-[2rem] flex flex-col gap-2 p-4 bg-base-200 rounded-md">
                    <h3 className="text-center font-bold text-lg">Current Rankings</h3>
                    <hr className="w-full border-black opacity-10 mx-auto mt-1"></hr>
                    <div className="flex flex-col gap-3">
                        {(() => {
                            const sortedScores = Array.from(reverseScoreMap.keys()).sort((a, b) => b - a);
                            let currentRank = 1;
                            let trackCount = 0;
                            const maxTracks = 10;
                            
                            return sortedScores.map((score) => {
                                if (trackCount >= maxTracks) return null;
                                
                                const trackIds = reverseScoreMap.get(score);
                                if (!trackIds) return null;
                                
                                const rank = currentRank;
                                currentRank += trackIds.size;
                                
                                const tracks = Array.from(trackIds)
                                    .map((trackId) => {
                                        const track = trackMap.get(trackId);
                                        return track ? { trackId, track } : null;
                                    })
                                    .filter((item): item is { trackId: string; track: Track } => item !== null)
                                    .slice(0, maxTracks - trackCount);
                                
                                trackCount += tracks.length;
                                
                                if (tracks.length === 0) return null;
                                
                                return (
                                    <div key={score} className="flex flex-col gap-2">
                                        {/* Rank Header */}
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-lg text-black py-1">
                                                #{rank}
                                            </span>
                                            {tracks.length > 1 && (
                                                <span className="text-xs text-gray-500">
                                                    ({tracks.length} tied)
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* Songs in this rank */}
                                        <div className="grid grid-cols-5 gap-2">
                                            {tracks.map(({ trackId, track }) => (
                                                <SongCard 
                                                    key={trackId}
                                                    trackId={trackId} 
                                                    track={track}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            }).filter(Boolean);
                        })()}
                    </div>
                </footer>

            </section>
        }
    </main>
)}

function SongCard(
    { trackId, track } : { trackId: string, track: Track}
) {
    return (
        <div 
            key={trackId}
            className="relative h-[4rem] w-[9rem] flex-shrink-0 rounded-md border-2 border-black bg-base-100 overflow-hidden flex flex-row gap-2 p-1"
        >
            {/* Album Cover */}
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
            
            {/* Track Info */}
            <div className="flex flex-col justify-center flex-1 min-w-0 gap-0.5">
                <strong className="text-xs font-bold truncate leading-tight">
                    {track.title}
                </strong>
                <p className="text-[0.65rem] truncate text-gray-500 leading-tight">
                    {track.artists[0].name}
                </p>
            </div>
        </div>
    )
}