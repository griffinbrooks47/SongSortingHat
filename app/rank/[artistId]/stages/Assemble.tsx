'use client'

/* React / Next */
import { useCallback, useEffect, useRef, useState, memo, useMemo } from 'react';
import Image from "next/image";

/* UI Carousel */
import { type CarouselApi } from "@/components/ui/carousel"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"

/* Framer Motion */
import { motion } from "motion/react";

/* Types */
import { AlbumWithImages, TrackWithImages } from '../page';

import { IconMusic, IconPointerFilled, IconArrowBadgeLeft, IconArrowBadgeRight } from "@tabler/icons-react";

export default function Assemble(
    { tracks, onEnd }: { tracks: TrackWithImages[], onEnd: (selectedIds: string[]) => void }
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
        const chunks: TrackWithImages[][] = [];
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
        <div className="min-h-[calc(100vh-4rem)] w-full px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 mb-0 flex flex-col items-center">
            <nav className="w-full max-w-[800px] flex flex-row justify-between items-center gap-2">
                <button
                    className="btn btn-sm sm:btn-md btn-outline btn-disabled bg-base-100 rounded-md"
                    onClick={() => {
                        // Back to Artist functionality
                    }}
                >
                    <span className="hidden sm:inline">Prev</span>
                    <span className="sm:hidden">←</span>
                </button>
                <header className="flex flex-row items-center font-semibold gap-1 sm:gap-2">
                    <IconMusic className="w-5 h-5 sm:w-6 sm:h-6" />
                    <h1 className="text-base sm:text-xl">Choose Songs</h1>
                </header>   
                {canContinue 
                    ? 
                    <button 
                        className={`btn btn-sm sm:btn-md btn-outline bg-secondary rounded-md`}
                        onClick={() => {
                            onEnd(Array.from(selectedIds))
                        }}
                    >
                        <span className="hidden sm:inline">Next</span>
                        <span className="sm:hidden">→</span>
                    </button>
                    : 
                    <button 
                        className={`btn btn-sm sm:btn-md btn-outline bg-secondary rounded-md btn-disabled`}
                        onClick={() => {
                            onEnd(Array.from(selectedIds))
                        }}
                    >
                        <span className="hidden sm:inline">Next</span>
                        <span className="sm:hidden">→</span>
                    </button>
                
                }
            </nav>
            <hr className="border-black opacity-10 w-full max-w-[800px] mx-auto mt-1"></hr>
            <header className="mt-4 sm:mt-6 mb-4 sm:mb-6 flex justify-center items-center px-2">
                <div className="badge badge-outline badge-black bg-secondary text-xs sm:text-sm">
                    <IconPointerFilled className="size-3 sm:size-4" />
                    <p className="text-center opacity-80 text-black pr-1">{`Select the songs you want to include!`}</p>
                </div>
            </header>
            <Carousel setApi={setApi} className="w-full max-w-7xl">
                <CarouselContent>
                    {slides.map((trackChunk, index) => (
                        <CarouselItem className="w-full" key={index}>
                            <MemoCarouselPage 
                                tracks={trackChunk}
                                toggleId={toggleIdToRemove}
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
            
            <section className="mt-4 sm:mt-6 flex flex-row items-center justify-center w-full pb-6">
                <div className="flex items-center gap-3 sm:gap-4">
                    <button 
                        className="btn btn-outline btn-sm sm:btn-md rounded-full"
                        onClick={() => api?.scrollPrev()}
                        disabled={currentSlide === 0}
                    >
                        <IconArrowBadgeLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <div className="text-center text-xs sm:text-sm text-muted-foreground min-w-[60px] sm:min-w-[80px]">
                        {currentSlide + 1} of {totalSlides}
                    </div>
                    <button 
                        className="btn btn-outline btn-sm sm:btn-md rounded-full"
                        onClick={() => api?.scrollNext()}
                        disabled={currentSlide === totalSlides - 1}
                    >
                        <IconArrowBadgeRight className="w-5 h-5 sm:w-6 sm:h-6" />
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
    tracks: TrackWithImages[], 
    toggleId: (id: string) => void 
}) {
    return (
        <div className="h-full flex items-center justify-center py-2 px-2 sm:px-4">
            <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 place-items-center w-full max-w-7xl">
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
    track: TrackWithImages, 
    onClick: (id: string) => void 
}) {
    const [isSelected, setIsSelected] = useState<boolean>(false);

    const handleClick = useCallback(() => {
        onClick(track.spotifyId);
        setIsSelected(prev => !prev);
    }, [onClick, track.spotifyId]);

    return (
        <motion.div 
            className={`relative h-16 sm:h-20 w-full max-w-md cursor-pointer rounded-md ${
                isSelected 
                    ? 'shadow-sm border-black bg-accent border-2' 
                    : 'shadow-md border-black bg-base-100 border-2'
            }`}
            onClick={handleClick}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            <div className={`relative flex flex-row w-full h-full p-1.5 sm:p-2 rounded-sm gap-2 sm:gap-3 transition-opacity ${
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
                    <strong className="text-xs sm:text-sm font-bold truncate">
                        {track.title}
                    </strong>
                    {track.artists.length > 1 && (
                        <p className="text-[9px] sm:text-xs truncate text-muted-foreground">
                            {track.artists.map(artist => artist.name).join(", ")}
                        </p>
                    )}
                </div>
            </div>
            
            {/* Framer Motion hover overlay */}
            <motion.div 
                className="w-full h-full inset-0 bg-black/90 border-2 border-black rounded-sm absolute flex items-center justify-center px-3 sm:px-4"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.075 }}
            >
                <strong className="text-xs sm:text-sm text-white font-bold truncate">
                    {track.title}
                </strong>
            </motion.div>
        </motion.div>
    );
});