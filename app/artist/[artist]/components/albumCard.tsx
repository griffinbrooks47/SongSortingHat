"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface ImageProps {
    width: number;
    height: number;
    url: string;
}

export const AlbumCard = (props: { image: ImageProps; name: string }) => {
    return (
        <div className="w-[15rem] h-[15rem] overflow-hidden relative group cursor-pointer">
            {/* Album Image */}
            <Image
                src={props.image.url}
                width={props.image.width}
                height={props.image.height}
                alt={props.name}
                className="object-cover"
            />

            {/* Dark Overlay (Becomes Visible on Hover) */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-85 transition-all duration-300" />
            {/* Overlay Title (Hidden by Default, Shows on Hover) */}
            <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
                <p
                    className="flex justify-center items-center text-center w-full 
                            line-clamp-2 text-ellipsis overflow-hidden 
                            max-w-[15rem] break-words px-2"
                    style={{
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                        whiteSpace: "normal",
                    }}
                >
                    {props.name.length > 30 ? props.name.slice(0, 30) + "..." : props.name}
                </p>
            </motion.div>
        </div>
    );
};
