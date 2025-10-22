"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useCallback, memo } from 'react';

interface ImageProps {
    width: number;
    height: number;
    url: string;
}

interface AlbumCardProps {
    image: ImageProps;
    name: string;
    priority?: boolean; // For above-fold albums
    onClick?: () => void; // Optional click handler
    className?: string;
}

// Memoized component to prevent unnecessary re-renders
const AlbumCard = memo(({ image, name, priority = false, onClick, className = "" }: AlbumCardProps) => {
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
            className={`w-[12rem] h-[12rem] overflow-hidden relative cursor-pointer rounded-sm shadow-md hover:shadow-xl transition-shadow duration-300 group ${className}`}
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
                    width={240} // Fixed optimal size for 15rem container
                    height={240}
                    alt={`${name} album cover`}
                    className={`w-full h-full object-cover transition-all duration-500 group-hover:brightness-75 ${
                        imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                    }`}
                    priority={priority}
                    onLoad={handleImageLoad}
                    sizes="240px"
                />
                
                {/* Loading skeleton */}
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
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
                className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold pointer-events-none px-4"
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