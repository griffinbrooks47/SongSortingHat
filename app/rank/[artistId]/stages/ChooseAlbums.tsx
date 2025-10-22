'use client'

import { Album, Track } from "@/types/artist"

import { memo, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, transformValue } from "framer-motion";

import { IconDisc } from "@tabler/icons-react";

export default function ChooseAlbums(
    { albums, singles, onEnd }: { albums: Album[], singles: Track[], onEnd: (selectedIds: string[]) => void }  
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
        <main className="h-[calc(100vh-4rem)] pt-8">
            <nav className="rounded-md flex flex-row flex justify-between items-center">
                <button 
                    className="btn btn-md btn-outline btn-disabled bg-base-100 rounded-md"
                >
                    Back
                </button>
                <header className="flex flex-row items-center font-semibold gap-2">
                    <IconDisc />
                    <h1 className="text-xl">Select Albums</h1>
                </header>    
                <button 
                    className="btn btn-outline bg-secondary btn-md rounded-md"
                    onClick={() => {
                        onEnd(Array.from(albumSet))
                    }}
                >
                    Next
                </button>
            </nav>
            <hr className="border-black opacity-10 w-full mx-auto mt-1"></hr>
            <header className="mt-6 mb-6 flex justify-center items-center">
                <div className="badge badge-outline badge-black bg-warning">
                    <svg className="size-[1em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="currentColor"><rect x="1.972" y="11" width="20.056" height="2" transform="translate(-4.971 12) rotate(-45)" fill="currentColor" strokeWidth={0}></rect><path d="m12,23c-6.065,0-11-4.935-11-11S5.935,1,12,1s11,4.935,11,11-4.935,11-11,11Zm0-20C7.038,3,3,7.037,3,12s4.038,9,9,9,9-4.037,9-9S16.962,3,12,3Z" strokeWidth={0} fill="currentColor"></path></g></svg>
                    <p className="text-center opacity-80 text-black">{`Remove any albums you don't want included  `}</p>
                </div>
            </header>
            <section className="grid grid-cols-4 gap-4 rounded-none">
                {
                    [...albums]
                    .filter((album: Album) => album.tracks && album.tracks.length > 2)
                    .map((album: Album) => (
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
    album: Album;
    onClick: (id: string) => void;
}) {
    const [isSelected, setIsSelected] = useState(true);

    const handleClick = useCallback(() => {
        onClick(album.spotifyId);
        setIsSelected((prev) => !prev);
    }, [album.spotifyId, onClick]);

    return (
        <motion.div
            className={`relative h-48 w-48 cursor-pointer rounded-md border-2 ${
                isSelected
                    ? "border-black bg-base-100 shadow-md"
                    : "border-black/10 bg-base-100/50"
            }`}
            onClick={handleClick}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            <div
                className={`relative card w-full h-full p-2 rounded-sm transition-opacity ${
                    isSelected ? "opacity-100" : "opacity-100"
                }`}
            >
                <figure className={`h-full w-full aspect-square rounded-sm border-2 overflow-hidden ${
                    isSelected ? "border-black" : "border-black/30"
                }`}>
                    <Image
                        src={album.images[0].url}
                        width={album.images[0].width}
                        height={album.images[0].height}
                        alt={album.title}
                        className={`object-cover ${isSelected ? "opacity-100" : "opacity-50"}`}
                        priority={false}
                        loading="lazy"
                    />
                </figure>
                <div className="flex flex-col items-center py-1">
                    <strong className={`text-sm font-bold truncate max-w-[14ch] ${
                        isSelected ? "opacity-100" : "opacity-30"
                    }`}>
                        {album.title}
                    </strong>
                    <p className={`text-xs -mt-1 truncate max-w-[40ch] ${
                        isSelected ? "opacity-100" : "opacity-30"
                    }`}>
                        {album.artists.map(artist => artist.name).join(', ')}
                    </p>
                </div>
            </div>

            {/* Hover overlay */}
            <motion.div
                className="w-full h-full inset-0 bg-black/80 border-2 border-black rounded-sm absolute flex flex-col items-center justify-center text-center px-2"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.075 }}
            >
                <strong className="text-sm text-white font-bold line-clamp-3 px-2">
                    {album.title}
                </strong>
            </motion.div>
        </motion.div>
    );
});