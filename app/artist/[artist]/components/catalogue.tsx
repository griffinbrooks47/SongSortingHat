'use client'

/* React */
import { useState } from "react";

/* Components */
import { AlbumCard } from "./albumCard";

/* Types */
import { Album, Track } from "@/types/artist"

/* Icons */
import { IconAlbum, IconDisc } from "@tabler/icons-react";

/* Conditional CSS */
const iconStyle = "h-[1.15rem]";
const buttonStyle = "h-10 px-2 mx-1 text-[0.85rem] flex flex-row cursor-pointer justify-center items-center"

export default function Catalogue(
    { albums, tracks } : { albums: Album[], tracks: Track[] }
) {

    const [page, setPage] = useState<number>(0);

    return (
        <main className="flex justify-center items-start flex-col mt-8">
            
            {/* Music Navigation */}
            <h1 className="text-md font-bold">Albums</h1>
            <hr className="border-black opacity-10 w-200 mt-1 mb-4"></hr>

            {/* Catalogue Grid */}
            {(page == 0) && 
                <section>
                    {/* Albums Grid */}
                    <div className="grid grid-cols-4 gap-3">
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
                <section>

                </section>
            }
        </main>
    )
}