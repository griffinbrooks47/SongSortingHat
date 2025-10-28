import { Track } from "@/types/artist";
import { IconArrowsTransferUpDown, IconPointerFilled } from "@tabler/icons-react";
import { motion, Reorder } from "motion/react";

import Image from "next/image";
import { useState } from "react";


export default function Sorting(
    { tracks, onEnd }: { tracks: Track[], onEnd: (selectedIds: string[]) => void }
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
        <main className="min-h-[calc(100vh-4rem)] w-full pt-8 mb-0 flex flex-col items-center">
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
                    <IconArrowsTransferUpDown />
                    <h1 className="text-xl">Your Sorting</h1>
                </header>   
                <button 
                    className={`btn btn-outline bg-secondary btn-md rounded-md ${isSubmit ? "btn-disabled" : ""}`}
                    onClick={handleSave}
                >
                    Done
                </button>
            </nav>
            <hr className="border-black opacity-10 w-200 mx-auto mt-1"></hr>
            <header className="mt-6 mb-6 flex justify-center items-center">
                <div className="badge badge-outline badge-black bg-primary">
                    <IconPointerFilled className="size-4" />
                    <p className="text-center opacity-80 text-black pr-1">{`Drag to rearrange!`}</p>
                </div>
            </header>
         
            <section className="w-200 flex flex-col gap-3 pb-8 flex flex-col items-center">
                <Reorder.Group 
                    axis="y" 
                    values={orderedTracks} 
                    onReorder={setOrderedTracks}
                    className="flex flex-col gap-3"
                >
                    {orderedTracks.map((track: Track, index: number) => (
                        <Reorder.Item
                            key={track.spotifyId}
                            value={track}
                            className="flex items-center gap-3 mr-8"
                        >
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-base-200 font-bold text-sm shrink-0">
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
    { trackId, track } : { trackId: string, track: Track}
) {
    return (
        <div 
            key={trackId}
            className="relative h-18 w-140 shrink-0 rounded-md border-2 border-black bg-base-100 overflow-hidden flex flex-row gap-2 p-1"
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
                <strong className="text-sm font-bold truncate leading-tight">
                    {track.title}
                </strong>
                <p className="text-[0.65rem] truncate text-gray-500 leading-tight">
                    {track.artists[0].name}
                </p>
            </div>
        </div>
    )
}