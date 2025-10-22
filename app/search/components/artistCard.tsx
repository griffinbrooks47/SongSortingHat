'use client'
import { motion } from "framer-motion";
import Image from "next/image"
import { useRouter } from 'next/navigation'
import { useCallback, useState, memo } from 'react';

import { Artist } from "@/types/artist";

interface ArtistCardProps {
  artist: Artist;
  img: string;
  width: number;
  height: number;
  priority?: boolean; // For above-fold cards
  className?: string;
}

// Memoized component to prevent unnecessary re-renders
const ArtistCard = memo(({ artist, img, width, height, priority = false, className = "" }: ArtistCardProps) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Memoized click handler
  const handleClick = useCallback(() => {
    router.push(`/artist/${artist.id}`);
  }, [router, artist.id]);

  // Memoized hover handlers
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);
  const handleImageLoad = useCallback(() => setImageLoaded(true), []);

  // Optimized name truncation
  const displayName = artist.name.length > 30 ? `${artist.name.slice(0, 30)}...` : artist.name;

  // Animation variants for better performance
  const cardVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.025 },
    tap: { scale: 0.95 }
  };

  const overlayVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className={`w-60 h-60 overflow-hidden cursor-pointer relative rounded-sm shadow-sm hover:shadow-xl transition-shadow duration-300 ${className}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
      {/* Image with optimized loading */}
      <div className="relative w-full h-full">
        <Image
          src={img}
          priority={priority}
          alt={`${artist.name} profile picture`}
          width={width} 
          height={height}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjQwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI2RkZCIvPjwvc3ZnPg=="
          sizes="240px"
        />
        
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-linear-to-br from-gray-200 to-gray-300 animate-pulse" />
        )}
      </div>
             
      {/* Dark overlay with better performance */}
      <motion.div 
        className="absolute inset-0 bg-black pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.75 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />
      
      {/* Text overlay with framer-motion */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold pointer-events-none"
        variants={overlayVariants}
        initial="hidden"
        animate={isHovered ? "visible" : "hidden"}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <p
          className="text-center w-full px-4 leading-tight drop-shadow-lg"
          style={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
            overflow: "hidden",
            wordBreak: "break-word"
          }}
        >
          {displayName}
        </p>
      </motion.div>
    </motion.div>
  );
});

ArtistCard.displayName = 'ArtistCard';

export { ArtistCard };