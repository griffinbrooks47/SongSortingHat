'use client'

import { motion } from "motion/react";
import { Track } from '@/types/artist';
import { useCallback, useEffect, useRef, useState, memo, useMemo } from 'react';
import Image from "next/image";
import { type CarouselApi } from "@/components/ui/carousel"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"

import { IconMusic, IconPointerFilled, IconArrowBadgeLeft, IconArrowBadgeRight } from "@tabler/icons-react";

export default function Assemble(
    { tracks, onEnd }: { tracks: Track[] ,onEnd: (selectedIds: string[]) => void }
) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    
    // Optimized toggle function
    const toggleIdToRemove = useCallback((id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const numTracksPerPage: number = 15;
    const slides = useMemo(() => {
        const chunks: Track[][] = [];
        for (let i = 0; i < tracks.length; i += numTracksPerPage) {
            chunks.push(tracks.slice(i, i + numTracksPerPage));
        }
        return chunks;
    }, [tracks, numTracksPerPage]);

    useEffect(() => {
        setSelectedIds(new Set());
    }, [tracks])

    const [api, setApi] = useState<CarouselApi>();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [totalSlides, setTotalSlides] = useState(0);

    const [canContinue, setCanContinue] = useState(false);
    useEffect(() => {
        setCanContinue(selectedIds.size >= 5 && tracks.length >= 5);
    }, [selectedIds, tracks.length]);

    // Optimized API setup - no forceUpdate, no refs for display values
    useEffect(() => {
        if (!api) return;

        const updateSlides = () => {
            setCurrentSlide(api.selectedScrollSnap());
            setTotalSlides(api.scrollSnapList().length);
        };

        // Initial setup
        updateSlides();

        // Throttle the select event if needed
        api.on("select", updateSlides);

        return () => {
            api.off("select", updateSlides);
        };
    }, [api]);

    return (
        <div className="h-[calc(100vh-4rem)] w-full pt-8 mb-0 flex flex-col items-center">
            <nav className="w-200 flex flex-row justify-between items-center">
                <button
                    className="btn btn-md btn-outline btn-disabled bg-base-100 rounded-md"
                    onClick={() => {
                        // Back to Artist functionality
                    }}
                >
                    Prev
                </button>
                <header className="flex flex-row items-center font-semibold gap-2">
                    <IconMusic />
                    <h1 className="text-xl">Choose Songs</h1>
                </header>   
                {canContinue 
                    ? 
                    <button 
                        className={`btn btn-outline bg-secondary btn-md rounded-md`}
                        onClick={() => {
                            onEnd(Array.from(selectedIds))
                        }}
                    >
                        Next
                    </button>
                    : 
                    <button 
                        className={`btn btn-outline bg-secondary btn-md rounded-md btn-disabled`}
                        onClick={() => {
                            onEnd(Array.from(selectedIds))
                        }}
                    >
                        Next
                    </button>
                
                }
            </nav>
            <hr className="border-black opacity-10 w-200 mx-auto mt-1"></hr>
            <header className="mt-6 mb-6 flex justify-center items-center">
                <div className="badge badge-outline badge-black bg-secondary">
                    <IconPointerFilled className="size-4" />
                    <p className="text-center opacity-80 text-black pr-1">{`Select the songs you want to include!`}</p>
                </div>
            </header>
            <Carousel setApi={setApi}>
                <CarouselContent>
                    {slides.map((trackChunk, index) => (
                        <CarouselItem className="w-fit" key={index}>
                            <MemoCarouselPage 
                                tracks={trackChunk}
                                toggleId={toggleIdToRemove}
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
            
            <section className="mt-6 flex flex-row items-center justify-center w-full">
                <div className="flex items-center gap-4">
                    <button 
                        className="btn btn-outline btn-md rounded-full"
                        onClick={() => api?.scrollPrev()}
                        disabled={currentSlide === 0}
                    >
                        <IconArrowBadgeLeft />
                    </button>
                    <div className="text-center text-sm text-muted-foreground">
                        {currentSlide + 1} of {totalSlides}
                    </div>
                    <button 
                        className="btn btn-outline btn-md rounded-full"
                        onClick={() => api?.scrollNext()}
                        disabled={currentSlide === totalSlides - 1}
                    >
                        <IconArrowBadgeRight />
                    </button>
                </div>
            </section>
        </div>
    )
}

// Memoize the carousel page
const MemoCarouselPage = memo(function CarouselPage({ 
    tracks, 
    toggleId 
}: { 
    tracks: Track[], 
    toggleId: (id: string) => void 
}) {
    return (
        <div className="h-full flex items-center justify-center py-2">
            <main className="grid grid-cols-3 grid-rows-5 gap-4 place-items-center">
                {tracks.map((track) => (
                    <SongCard 
                        key={track.spotifyId} 
                        track={track}
                        onClick={toggleId}
                    />
                ))}
            </main>
        </div>
    )
});

const SongCard = memo(function SongCard({ track, onClick }: {
    track: Track, 
    onClick: (id: string) => void 
}) {
    const [isSelected, setIsSelected] = useState<boolean>(false);

    const handleClick = useCallback(() => {
        onClick(track.spotifyId);
        setIsSelected(prev => !prev);
    }, [onClick, track.spotifyId]);

    return (
        <motion.div 
            className={`relative h-20 w-[16rem] cursor-pointer rounded-md ${
                isSelected 
                    ? 'shadow-sm border-black bg-accent border-2' 
                    : 'shadow-md border-black bg-base-100 border-2'
            }`}
            onClick={handleClick}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            <div className={`relative flex flex-row w-full h-full p-2 rounded-sm gap-3 transition-opacity ${
                isSelected 
                    ? 'opacity-100' 
                    : 'opacity-100'
            }`}>
                {/* Album Cover */}
                <figure className={`h-full aspect-square rounded-sm border-2 border-black overflow-hidden shrink-0`}>
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
                <div className="flex flex-col justify-center flex-1 min-w-0">
                    <strong className="text-sm font-bold truncate">
                        {track.title}
                    </strong>
                    <p className="text-xs truncate text-muted-foreground">
                        {track.artists[0].name}
                    </p>
                </div>
            </div>
            
            {/* Framer Motion hover overlay */}
            <motion.div 
                className="w-full h-full inset-0 bg-black/90 border-2 border-black rounded-sm absolute flex items-center justify-center px-4"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.075 }}
            >
                <strong className="text-sm text-white font-bold truncate">
                    {track.title}
                </strong>
            </motion.div>
        </motion.div>
    );
});