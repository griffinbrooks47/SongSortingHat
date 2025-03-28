'use client'

import { motion } from "motion/react";
import Image from "next/image"
import { useRouter } from 'next/navigation'

interface Artist {
    id: string;
    name: string;
    images: Image[];
}
interface Image {
    width: number;
    height: number;
    url: string;
}

export const ArtistCard = (props: {artist: Artist, img: string, width: number, height: number}) => {

    const router = useRouter();

    return (
        <div className="w-[15rem] h-[15rem] overflow-hidden cursor-pointer relative group cursor-pointer rounded-sm shadow-md"
            onClick={() => {
                /* Add selected artist to local storage cache. */                
                localStorage.setItem(`${props.artist.name}`, JSON.stringify(props.artist))
                router.push(`/artist/${props.artist.id}`)
            }}
        >
            <Image
                src={props.img}
                priority={true}
                alt="Artist Picture"
                width={props.width} height={props.height}
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
                    {props.artist.name.length > 30 ? props.artist.name.slice(0, 30) + "..." : props.artist.name}
                </p>
            </motion.div>
        </div>
    )
}