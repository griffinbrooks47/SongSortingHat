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
        <div className="max-w-[75%] mb-[0rem] flex flex-col justify-center">
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
            <section className="mt-8 flex flex-row items-center justify-between w-full">
                    <button className="btn btn-outline btn-lg rounded-sm">
                        Back to Artist
                    </button>
                    
                    <div className="flex items-center gap-4">
                        <button 
                            className="btn btn-outline btn-md rounded-sm"
                            onClick={() => api?.scrollPrev()}
                            disabled={currentSlide === 0}
                        >
                            Prev
                        </button>
                        <div className="text-center text-sm text-muted-foreground">
                            {currentSlide + 1} of {totalSlides}
                        </div>
                        <button 
                            className="btn btn-outline btn-md rounded-sm"
                            onClick={() => api?.scrollNext()}
                            disabled={currentSlide === totalSlides - 1}
                        >
                            Next
                        </button>
                    </div>
                    
                    <button 
                        className="btn btn-outline btn-lg rounded-sm"
                        onClick={() => onEnd(Array.from(selectedIds))}
                    >
                        Next Stage
                    </button>
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
            <main className="grid grid-cols-5 grid-rows-3 gap-4">
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
            className={`relative h-[11rem] w-[11rem] cursor-pointer rounded-md ${
                isSelected 
                    ? 'shadow-sm border-black bg-accent border-2' 
                    : 'shadow-md border-black bg-base-100 border-2'
            }`}
            onClick={handleClick}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            <div className={`relative card w-full h-full p-2 rounded-sm transition-opacity ${
                isSelected 
                    ? 'opacity-100' 
                    : 'opacity-100'
            }`}>
                <figure className={`h-full w-full aspect-square rounded-sm border-2 border-black overflow-hidden`}>
                    <Image 
                        src={track.images[0].url}
                        width={track.images[0].width}
                        height={track.images[0].height}
                        alt={track.title}
                        className="object-cover"
                        priority={false}
                        loading="lazy"
                    />
                </figure>
                <div className="flex flex-col items-center py-1">
                    <strong className="text-sm font-bold truncate max-w-[14ch]">
                        {track.title}
                    </strong>
                    <p className="text-xs mt-[-0.25rem] truncate max-w-[14ch]">
                        {track.artists[0].name}
                    </p>
                </div>
            </div>
            
            {/* Framer Motion hover overlay */}
            <motion.div 
                className="w-full h-full inset-0 bg-black/90 border-2 border-black rounded-sm absolute flex items-center justify-center"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.075 }}
            >
                <strong className="text-sm text-white font-bold truncate max-w-[14ch]">
                    {track.title}
                </strong>
            </motion.div>
        </motion.div>
    );
});