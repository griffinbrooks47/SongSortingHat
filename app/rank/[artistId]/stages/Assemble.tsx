'use client'

import { motion } from "motion/react";

/* SSH Types */
import { Track } from '@/types/artist';

/* React & Next */
import { useCallback, useEffect, useRef, useState, memo } from 'react';
import Image from "next/image";

import { type CarouselApi } from "@/components/ui/carousel"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 5
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1
  }
};

export default function Assemble(
    { tracks, onEnd }: { tracks: Track[] ,onEnd?: (removedIDs: string[]) => void }
) {

    const [idsToRemove, setIdsToRemove] = useState<Set<string>>(new Set());
    const toggleIdToRemove = (id: string) => {
        setIdsToRemove(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }

    /* Chunked Songs */
    const chunkTracks = (flatTracks: Track[], chunkSize: number = numTracksPerPage): Track[][] => {
        const chunks: Track[][] = [];
        for (let i = 0; i < flatTracks.length; i += chunkSize) {
            chunks.push(flatTracks.slice(i, i + chunkSize));
        }
        return chunks;
    }

    const numTracksPerPage: number = 15;
    const slides = chunkTracks(tracks, numTracksPerPage);

    /* If tracks change, reset the ids. */
    useEffect(() => {
        const newSet: Set<string> = new Set();
        for(const track of tracks) {
            newSet.add(track.spotifyId);
        }
        setIdsToRemove(newSet);
    }, [tracks])

    const [api, setApi] = useState<CarouselApi>();
    const currentSlideRef = useRef<number>(0);
    const totalSlidesRef = useRef<number>(0);
    const currentTextRef = useRef<HTMLSpanElement>(null);
    const countTextRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!api) {
            return;
        }

        totalSlidesRef.current = api.scrollSnapList().length;
        currentSlideRef.current = api.selectedScrollSnap();

        // Update text content
        if (currentTextRef.current) {
            currentTextRef.current.textContent = String(currentSlideRef.current + 1);
        }
        if (countTextRef.current) {
            countTextRef.current.textContent = String(totalSlidesRef.current);
        }

        const handleSelect = () => {
            currentSlideRef.current = api.selectedScrollSnap();
            
            // Update text content
            if (currentTextRef.current) {
                currentTextRef.current.textContent = String(currentSlideRef.current + 1);
            }
        };

        api.on("select", handleSelect);

        return () => {
            api.off("select", handleSelect);
        };
    }, [api]);

    return (
        <div className="w-full mb-[0rem]">
            <Carousel 
                className="w-full max-w-[90vw] mx-auto"
                setApi={setApi}
            >
                <CarouselContent>
                    {slides.map((trackChunk, index) => (
                        <CarouselItem className="w-full" key={index}>
                            <CarouselPage 
                                key={index} 
                                index={index} 
                                numSlides={slides.length} 
                                tracks={trackChunk} 
                                toggleId={toggleIdToRemove}
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
            <div className="py-8 text-center text-sm text-muted-foreground">
                <span ref={currentTextRef}>1</span> of <span ref={countTextRef}>{slides.length}</span>
            </div>
        </div>
    )
};

function CarouselPage({ tracks, index, numSlides, toggleId }: { tracks: Track[], index: number, numSlides: number, toggleId: (id: string) => void }) {
    return (
            <div className="w-full h-full flex items-center justify-center px-12">
                <main className="grid grid-cols-5 grid-rows-3 gap-4 mx-auto">
                    {tracks.map((track: Track) => {
                        return (
                            <SongCard key={track.spotifyId} track={track}
                                onClick={toggleId}
                            />
                        )
                    })}
                </main>
            </div>
    )
}

const SongCard = memo(function SongCard(props: {
    track: Track, 
    onClick: (id: string) => void 
}) {
    const [isSelected, setIsSelected] = useState<boolean>(false);

    const handleClick = useCallback(() => {
        props.onClick(props.track.spotifyId);
        setIsSelected(prev => !prev);
    }, [props.onClick, props.track.spotifyId]);

    return (
        <motion.main 
            className="relative h-[11rem] w-[11rem]"
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
        >
            <div 
                className={`relative card w-[11rem] h-[100%] p-[0.5rem] cursor-pointer
                    ${isSelected ? 'bg-accent border-2 border-accent rounded-sm shadow-lg' : 'bg-base-100 border-2 border-neutral rounded-sm shadow-md'}`}
            >
                <figure className="h-[100%] w-auto aspect-[1/1] rounded-sm border-2 border-neutral">
                    <Image 
                        src={props.track.images[0].url}
                        width={props.track.images[0].width}
                        height={props.track.images[0].height}
                        alt={props.track.title}
                        className="overflow-cover"
                        priority={false}
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzMzMyIvPjwvc3ZnPg=="
                    />
                </figure>
                <div className="m-auto flex justify-center items-center flex-col py-[0.25rem]">
                    <strong className="text-[0.9rem] font-bold block max-w-[14ch] truncate">
                        {props.track.title}
                    </strong>
                    <p className="text-[0.8rem] mt-[-0.25rem]">{props.track.artists[0].name}</p>
                </div>
            </div>
            {/* Opaque overlay */}
            <motion.div
                className="absolute h-[100%] flex justify-center items-center inset-0 bg-black/90 rounded-md cursor-pointer"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.025 }}
                onClick={handleClick}
            >
                <div className="text-white flex items-center justify-center">
                    <p className="font-bold text-[1rem]">Add Song</p>
                </div>
            </motion.div>
        </motion.main>
    );
}, (prevProps, nextProps) => {
    // Custom comparison: only re-render if track ID or onClick reference changes
    return prevProps.track.spotifyId === nextProps.track.spotifyId &&
           prevProps.onClick === nextProps.onClick;
});