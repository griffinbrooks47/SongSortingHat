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
const buttonStyle = "h-[2.5rem] px-[0.75rem] mx-[0.25rem] flex flex-row cursor-pointer justify-center items-center"

export default function Catalogue(
    { albums, tracks } : { albums: Album[], tracks: Track[] }
) {

    const [page, setPage] = useState<number>(0);

    return (
        <main className="flex justify-center items-start flex-col mt-[1rem]">
            
            {/* Music Navigation */}
            <ul className="py-[0.25rem] bg-base-100 shadow-sm rounded-md flex flex-row">
                <a className={`rounded-md ${page == 0 ? "bg-base-200" : ""} ${buttonStyle}`}
                    onClick={() => {
                        setPage(0);
                    }}
                >
                    <IconAlbum className={`${iconStyle}`} />
                    <div className="font-semibold mx-[0.25rem]">Albums</div>
                </a>
        

                <a className={`rounded-md ${page == 1 ? "bg-base-200" : ""} ${buttonStyle}`}
                    onClick={() => {
                        setPage(1);
                    }}
                >
                    <IconDisc className={`${iconStyle}`} />
                    <div className="font-semibold mx-[0.25rem]">Tracks</div>
                </a>
            </ul>

            <hr className="border-black opacity-10 w-[100%] mx-auto mt-2 mb-4"></hr>

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