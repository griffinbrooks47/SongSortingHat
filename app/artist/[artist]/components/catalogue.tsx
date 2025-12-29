'use client'

/* React */
import { useState } from "react";

/* Components */
import { AlbumCard } from "./albumCard";

/* Types */
import { AlbumWithImages } from "../page";

/* Icons */
import { IconAlbum, IconDisc } from "@tabler/icons-react";

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