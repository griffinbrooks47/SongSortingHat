'use client'

/* React */
import { useState, useCallback, memo } from "react";
import Image from "next/image";
import { } from 'react';

/* Types */
import { AlbumWithImages } from "../actions/createArtist";

/* Framer Motion */
import { motion } from "framer-motion";
import { Album } from "@/types/artist";
import { AlbumImage } from "@/prisma/generated/prisma/client";


/* Conditional CSS */
const iconStyle = "h-[1.15rem]";
const buttonStyle = "h-10 px-2 mx-1 text-[0.85rem] flex flex-row cursor-pointer justify-center items-center"

export default function Catalogue(
    { albums } : { albums: AlbumWithImages[] }
) {

    const [page, setPage] = useState<number>(0);

    return (
        <main className="w-full flex justify-center items-start flex-col mt-6 sm:mt-8">
            
            {/* Music Navigation */}
            <h1 className="text-base sm:text-md font-bold">Albums</h1>
            <hr className="border-black opacity-10 w-full mt-1 mb-3 sm:mb-4"></hr>

            {/* Catalogue Grid */}
            {(page == 0) && 
                <section className="w-full">
                    {/* Albums Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2 sm:gap-3">
                    {albums.map((album) => (
                        <AlbumCard
                            image={album.images[0]}
                            name={album.title}
                            key={album.spotifyId}
                        />
                    ))}
                    </div>
                </section>
            }
            {(page == 1) && 
                <section className="w-full">

                </section>
            }
        </main>
    )
}



interface AlbumCardProps {
    image: AlbumImage;
    name: string;
    priority?: boolean; // For above-fold albums
    onClick?: () => void; // Optional click handler
    className?: string;
}

// Memoized component to prevent unnecessary re-renders
const AlbumCard = memo((
    { image, name, priority = false, onClick, className = "" }: { image: AlbumImage, name: string, priority?: boolean, onClick?: () => void, className?: string }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Memoized hover handlers
    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);
    const handleImageLoad = useCallback(() => setImageLoaded(true), []);

    // Optimized name truncation
    const displayName = name.length > 30 ? `${name.slice(0, 30)}...` : name;

    // Animation variants for better performance
    const cardVariants = {
        initial: { scale: 1 },
        hover: { scale: 1.01 },
        tap: { scale: 1 }
    };

    const overlayVariants = {
        hidden: { opacity: 0, y: 5 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            className={`w-full aspect-square overflow-hidden relative cursor-pointer rounded-sm shadow-md hover:shadow-xl transition-shadow duration-300 group ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            variants={cardVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 25,
                mass: 0.8
            }}
        >
            {/* Album Image with optimized loading */}
            <div className="relative w-full h-full">
                <Image
                    src={image.url}
                    fill
                    alt={`${name} album cover`}
                    className={`object-cover transition-all duration-500 group-hover:brightness-75 ${
                        imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                    }`}
                    priority={priority}
                    onLoad={handleImageLoad}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                />
                
                {/* Loading skeleton */}
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-linear-to-br from-gray-200 to-gray-300 animate-pulse" />
                )}
            </div>

            {/* Dark overlay with framer-motion */}
            <motion.div 
                className="absolute inset-0 bg-black pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 0.75 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            />
            
            {/* Text overlay with framer-motion */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center text-white text-sm sm:text-base lg:text-lg xl:text-xl font-bold pointer-events-none px-3 sm:px-4"
                variants={overlayVariants}
                initial="hidden"
                animate={isHovered ? "visible" : "hidden"}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                <p
                    className="text-center w-full leading-tight drop-shadow-lg"
                    style={{
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                        overflow: "hidden",
                        wordBreak: "break-word"
                    }}
                    title={name} // Show full name on hover
                >
                    {displayName}
                </p>
            </motion.div>

           
        </motion.div>
    );
});

AlbumCard.displayName = 'AlbumCard';

export { AlbumCard };