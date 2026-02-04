'use client'

/* React / Next */
import { useEffect, useState } from "react";
import Image from "next/image";

/* Framer Motion */
import { motion } from "motion/react";

/* Types */
import { TrackWithRelations } from "../page";

/* Custom Hooks */
import { useRanker } from "../hooks/useRanker"

/* Icons */
import { IconAB, IconPointerFilled } from "@tabler/icons-react";
import { AlbumImage } from "@/prisma/generated/prisma/client";

export default function Rank(
    { tracks, trackToImage, onEnd }: { tracks: TrackWithRelations[], trackToImage: Map<string, AlbumImage>, onEnd: (finalList: string[]) => void }) {

    const [trackMap, setTrackMap] = useState<Map<string, TrackWithRelations>>(new Map());
    const { currentMatchup, initilize, makeChoice, isComplete, finalSorting, reverseScoreMap } = useRanker();

    /* Intialize ranker instance*/
    useEffect(() => {
        if(tracks.length > 0) {
            const newMap: Map<string, TrackWithRelations> = new Map();
            for(const track of tracks) {
                newMap.set(track.id, track);
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

    const track1: TrackWithRelations | undefined = trackMap.get(currentMatchup[0]);
    const track1Image: AlbumImage | undefined = track1 ? trackToImage.get(track1.id) : undefined;

    const track2: TrackWithRelations | undefined = trackMap.get(currentMatchup[1]);
    const track2Image: AlbumImage | undefined = track2 ? trackToImage.get(track2.id) : undefined;

    if(!track1 || !track2) {
        return <div>No track names</div>
    }

    return (
    <main className="min-h-[calc(100vh-4rem)] w-full max-w-[900px] px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 mb-0 flex flex-col items-center">
        <nav className="w-full flex flex-row justify-between items-center gap-2">
            <button
                className="btn btn-sm sm:btn-md btn-outline btn-disabled bg-base-100 rounded-md"
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
                className={`btn btn-sm sm:btn-md btn-outline bg-secondary rounded-md`}
            >
                Next
            </button>
        </nav>
        <hr className="border-black opacity-10 w-200 mx-auto mt-1"></hr>
        <header className="mt-6 mb-6 flex justify-center items-center">
            <div className="badge badge-outline badge-black bg-primary">
                <IconPointerFilled className="size-4" />
                <p className="text-center opacity-80 text-black pr-1">{`Choose the better song!`}</p>
            </div>
        </header>
        {isComplete && 
            <div>Complete!</div>
        }
        {!isComplete &&
            <section className="flex flex-col justify-center items-center gap-4 w-full">

                {/* Rank Choices */}
                <menu className="flex gap-4 w-full justify-center">
                    <motion.button
                        className="relative sm:h-80 w-[50%] sm:w-[16rem] cursor-pointer rounded-md shadow-md border-black bg-base-100 border-2 p-2"
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
                                    src={track1Image?.url || ''}
                                    width={track1Image?.width || 300}
                                    height={track1Image?.height || 300}
                                    alt={track1.title}
                                    className="object-cover"
                                    priority={false}
                                    loading="lazy"
                                />
                            </figure>
                            <div className="flex flex-col items-center py-1 -mt-1">
                                <strong className="text-sm font-bold truncate max-w-[14ch]">
                                    {track1.title}
                                </strong>
                                <p className="text-xs mt-0 truncate max-w-[40ch]">
                                    {track1.artists.map(artist => artist.artist.name).join(', ')}
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
                        className="relative sm:h-80 w-[50%] sm:w-[16rem] cursor-pointer rounded-md shadow-md border-black bg-base-100 border-2 p-2"
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
                                    src={track2Image?.url || ''}
                                    width={track2Image?.width || 300}
                                    height={track2Image?.height || 300}
                                    alt={track2.title}
                                    className="object-cover"
                                    priority={false}
                                    loading="lazy"
                                />
                            </figure>
                            <div className="flex flex-col items-center py-1 -mt-1">
                                <strong className="text-sm font-bold truncate max-w-[14ch]">
                                    {track2.title}
                                </strong>
                                <p className="text-xs mt-0 truncate max-w-[14ch]">
                                    {track2.artists.map(artist => artist.artist.name).join(', ')}
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
                <footer className="w-full max-w-7xl mx-auto mt-8 flex flex-col gap-2 p-4 bg-base-200 rounded-md">
                    <h3 className="text-center font-bold text-lg sm:text-xl">Current Rankings</h3>
                    <hr className="w-full border-black opacity-10 mx-auto mt-1"></hr>
                    <div className="flex flex-col gap-3 sm:gap-4">
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
                                    .filter((item): item is { trackId: string; track: TrackWithRelations } => item !== null)
                                    .slice(0, maxTracks - trackCount);
                                
                                trackCount += tracks.length;
                                
                                if (tracks.length === 0) return null;
                                
                                return (
                                    <div key={score} className="flex flex-col gap-2">
                                        {/* Rank Header */}
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-base sm:text-lg text-black py-1">
                                                #{rank}
                                            </span>
                                            {tracks.length > 1 && (
                                                <span className="text-xs sm:text-sm text-gray-500">
                                                    ({tracks.length} tied)
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* Songs in this rank - Responsive grid */}
                                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-3">
                                            {tracks.map(({ trackId, track }) => {
                                                const image = trackToImage.get(track.id);
                                                if(!image) return null;
                                                return (
                                                    <SongCard
                                                        key={trackId}
                                                        trackId={trackId}
                                                        track={track}
                                                        image={image}
                                                    />
                                                )
                                            })}
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
    { trackId, track, image } : { trackId: string, track: TrackWithRelations, image: AlbumImage }
) {
    return (
        <div 
            key={trackId}
            className="relative h-16 w-36 shrink-0 rounded-md border-2 border-black bg-base-100 overflow-hidden flex flex-row gap-2 p-1"
        >
            {/* Album Cover */}
            <figure className="h-full aspect-square rounded-sm shrink-0 overflow-hidden">
                <Image 
                    src={image.url}
                    width={image.width || 100}
                    height={image.height || 100}
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
                    {track.artists.map(a => a.artist.name).join(', ')}
                </p>
            </div>
        </div>
    )
}