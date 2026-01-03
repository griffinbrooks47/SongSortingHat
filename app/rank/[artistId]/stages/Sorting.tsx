/* React / Next */
import { useState } from "react";
import Image from "next/image";

/* Framer Motion */
import { motion, Reorder } from "motion/react";

/* Icons */
import { IconArrowsTransferUpDown, IconPointerFilled } from "@tabler/icons-react";

/* Types */
import { TrackWithImages } from "../page";

export default function Sorting(
    { tracks, onEnd }: { tracks: TrackWithImages[], onEnd: (selectedIds: string[]) => void }
) {

    const [isSubmit, setIsSubmit] = useState(false);
    const [orderedTracks, setOrderedTracks] = useState(tracks);

    const handleSave = () => {
        if(isSubmit) return;
        setIsSubmit(true);

        const orderedIds = orderedTracks.map(track => track.spotifyId);
        onEnd(orderedIds);
    };

    return (
        <main className="min-h-[calc(100vh-4rem)] w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-8 flex flex-col items-center">
            {/* Navigation */}
            <nav className="w-full flex flex-row justify-between items-center gap-2 mb-4">
                <button
                    className="btn btn-sm sm:btn-md btn-outline btn-disabled bg-base-100 rounded-md"
                    onClick={() => {
                        // Back to Artist functionality
                    }}
                >
                    <span className="hidden sm:inline">Prev</span>
                    <span className="sm:hidden">←</span>
                </button>
                <header className="flex flex-row items-center font-semibold gap-2">
                    <IconArrowsTransferUpDown className="w-5 h-5 sm:w-6 sm:h-6" />
                    <h1 className="text-lg sm:text-xl">Your Sorting</h1>
                </header>   
                <button 
                    className={`btn btn-sm sm:btn-md btn-outline bg-secondary rounded-md ${isSubmit ? 'loading' : ''}`}
                    onClick={handleSave}
                    disabled={isSubmit}
                >
                    {isSubmit ? 'Saving...' : 'Done'}
                </button>
            </nav>

            <hr className="border-black opacity-10 w-full max-w-3xl mx-auto"></hr>

            {/* Instruction Badge */}
            <header className="mt-4 sm:mt-6 mb-4 sm:mb-6 flex justify-center items-center">
                <div className="badge badge-outline badge-black bg-primary px-3 py-3">
                    <IconPointerFilled className="w-3 h-3 sm:w-4 sm:h-4" />
                    <p className="text-xs sm:text-sm text-center opacity-80 text-black ml-1">
                        Drag to rearrange!
                    </p>
                </div>
            </header>
         
            {/* Sortable List */}
            <section className="w-full max-w-2xl flex flex-col gap-3">
                <Reorder.Group 
                    axis="y" 
                    values={orderedTracks} 
                    onReorder={setOrderedTracks}
                    className="flex flex-col gap-2 sm:gap-3"
                >
                    {orderedTracks.map((track: TrackWithImages, index: number) => (
                        <Reorder.Item
                            key={track.spotifyId}
                            value={track}
                            className="flex items-center gap-2 sm:gap-3 cursor-grab active:cursor-grabbing"
                            whileDrag={{ scale: 1.02, zIndex: 10 }}
                        >
                            {/* Rank Number */}
                            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-base-200 font-bold text-xs sm:text-sm shrink-0">
                                {index + 1}
                            </div>
                            
                            <SongCard trackId={track.spotifyId} track={track} />
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            </section>
        </main>
    );
}

function SongCard(
    { trackId, track } : { trackId: string, track: TrackWithImages }
) {
    return (
        <div 
            key={trackId}
            className="relative w-full h-16 sm:h-18 rounded-md border-2 border-black bg-base-100 overflow-hidden flex flex-row gap-2 p-1.5 sm:p-2 transition-shadow hover:shadow-md"
        >
            {/* Album Cover */}
            <figure className="h-full aspect-square rounded-sm shrink-0 overflow-hidden">
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
                <strong className="text-xs sm:text-sm font-bold truncate leading-tight">
                    {track.title}
                </strong>
                <p className="text-[0.6rem] sm:text-[0.65rem] truncate text-gray-500 leading-tight">
                    {track.artists.slice(0, 2).map(a => a.name).join(', ')}
                    {track.artists.length > 2 && '...'}
                </p>
            </div>

            {/* Drag Handle Indicator */}
            <div className="hidden sm:flex items-center pr-1 opacity-30">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                    <circle cx="4" cy="4" r="1.5"/>
                    <circle cx="4" cy="8" r="1.5"/>
                    <circle cx="4" cy="12" r="1.5"/>
                    <circle cx="8" cy="4" r="1.5"/>
                    <circle cx="8" cy="8" r="1.5"/>
                    <circle cx="8" cy="12" r="1.5"/>
                </svg>
            </div>
        </div>
    )
}