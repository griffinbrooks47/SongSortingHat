'use client'

/* React / Next */
import { memo, useState, useCallback, useEffect } from "react";
import Image from "next/image";

/* Types */
import { AlbumWithImages, TrackWithImages } from "../page";

/* Framer Motion */
import { motion, transformValue } from "framer-motion";

/* Icons */
import { IconDisc } from "@tabler/icons-react";

export default function ChooseAlbums(
    { albums, singles, onEnd }: { albums: AlbumWithImages[], singles: TrackWithImages[], onEnd: (selectedIds: string[]) => void }  
) {
    const [albumSet, setAlbumSet] = useState<Set<string>>(new Set())
    const toggleAlbum = useCallback((id: string) => {
        setAlbumSet(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    useEffect(() => {
        const allAlbumIds: Set<string> = new Set();
        albums.forEach(album => allAlbumIds.add(album.spotifyId));
        setAlbumSet(allAlbumIds)
    }, [albums])

    return (
        <main className="min-h-[calc(100vh-4rem)] w-full max-w-[900px] px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 mb-0 flex flex-col items-center">
            <nav className="w-full flex flex-row justify-between items-center gap-2">
                <button 
                    className="btn btn-sm sm:btn-md btn-outline btn-disabled bg-base-100 rounded-md"
                >
                    <span className="hidden sm:inline">Prev</span>
                    <span className="sm:hidden">←</span>
                </button>
                <header className="flex flex-row items-center font-semibold gap-1 sm:gap-2">
                    <IconDisc className="w-5 h-5 sm:w-6 sm:h-6" />
                    <h1 className="text-base sm:text-xl">Remove Albums</h1>
                </header>    
                <button 
                    className={`btn btn-sm sm:btn-md btn-outline bg-secondary rounded-md`}
                    onClick={() => {
                        onEnd(Array.from(albumSet))
                    }}
                >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">→</span>
                </button>
            </nav>
            <hr className="border-black opacity-10 w-full mx-auto my-2"></hr>
            <header className="mt-0 mb-2 flex justify-center items-center">
            </header>
            <section className="grid grid-cols-3 sm:grid-cols-4 gap-3 rounded-none">
                {
                    [...albums]
                    .filter((album: AlbumWithImages) => album.tracks && album.tracks.length > 2)
                    .map((album: AlbumWithImages) => (
                        <AlbumCard 
                            key={album.spotifyId}
                            album={album} 
                            onClick={toggleAlbum} 
                        />))
                }
            </section>
        </main>
    )
}

export const AlbumCard = memo(function AlbumCard({
    album,
    onClick,
}: {
    album: AlbumWithImages;
    onClick: (id: string) => void;
}) {
    const [isSelected, setIsSelected] = useState(true);

    const handleClick = useCallback(() => {
        onClick(album.spotifyId);
        setIsSelected((prev) => !prev);
    }, [album.spotifyId, onClick]);

    return (
        <motion.div
            className={`relative aspect-square w-28 lg:w-48 cursor-pointer rounded-sm sm:rounded-md border-2 ${
                isSelected
                    ? "border-black bg-base-100 shadow-md"
                    : "border-black/10 bg-base-100/50"
            }`}
            onClick={handleClick}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            <div className="relative w-full h-full rounded-sm p-1 sm:p-2 flex flex-col">
                {/* Image takes remaining space */}
                <figure className={`w-full flex-1 rounded-sm border-2 overflow-hidden ${
                    isSelected ? "border-black" : "border-black/30"
                }`}>
                    <Image
                        src={album.images[0].url}
                        width={album.images[0].width}
                        height={album.images[0].height}
                        alt={album.title}
                        className={`w-full h-full object-cover ${isSelected ? "opacity-100" : "opacity-50"}`}
                        priority={false}
                        loading="lazy"
                    />
                </figure>
                
                {/* Fixed height title area */}
                <div className="w-full h-8 flex-shrink-0 flex items-center justify-center mt-[2px] mb-0 sm:mt-2 sm:mb-1">
                    <strong className={`text-[0.7rem] sm:text-sm font-bold text-center line-clamp-2 leading-tight ${
                        isSelected ? "opacity-100" : "opacity-30"
                    }`}>
                        {album.title}
                    </strong>
                </div>
            </div>

            {/* Hover overlay */}
            <motion.div
                className="absolute inset-0 bg-black/80 border-2 border-black rounded-sm flex items-center justify-center px-4"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.075 }}
            >
                <strong className="text-sm text-white font-bold line-clamp-3 text-center">
                    {album.title}
                </strong>
            </motion.div>
        </motion.div>
    );
});