'use client'

import { memo } from "react";
import { TSorting } from "@/types/sorting";
import { Artist } from "@/types/artist";
import Image from "next/image";
import Link from "next/link";

export const SortingCard = memo(function AlbumCard({
    sorting,
    isSelected = true,
}: {
    sorting: TSorting;
    isSelected?: boolean;
}) {

    const artist: Artist = sorting.artist;

    console.log(artist.images)

    return (
        <Link
            href={`/sorting/${sorting.id}`}
            className={`relative h-[12rem] w-[12rem] cursor-pointer rounded-md border-2 ${
                isSelected
                    ? "border-black bg-base-100 shadow-md"
                    : "border-black/10 bg-base-100/50"
            }`}
        >
            <div
                className={`relative card w-full h-full p-2 rounded-sm transition-opacity ${
                    isSelected ? "opacity-100" : "opacity-100"
                }`}
            >
                {artist.images && artist.images.length > 0 ? (
                    <figure className={`h-full w-full aspect-square rounded-sm border-2 overflow-hidden ${
                        isSelected ? "border-black" : "border-black/30"
                    }`}>
                        <Image
                            src={artist.images[0].url}
                            width={artist.images[0].width}
                            height={artist.images[0].height}
                            alt={artist.name}
                            className={`object-cover ${isSelected ? "opacity-100" : "opacity-50"}`}
                            priority={false}
                            loading="lazy"
                        />
                    </figure>
                ) : (
                    <figure className={`h-full w-full aspect-square rounded-sm border-2 overflow-hidden flex items-center justify-center bg-base-200 ${
                        isSelected ? "border-black" : "border-black/30"
                    }`}>
                        <span className="text-4xl opacity-30">🎵</span>
                    </figure>
                )}
                <div className="flex flex-col items-center py-2">
                    <strong className={`text-sm font-bold truncate max-w-[14ch] ${
                        isSelected ? "opacity-100" : "opacity-30"
                    }`}>
                        {sorting.artist.name}
                    </strong>
                </div>
            </div>

            {/* Hover overlay */}
            <div
                className="w-full h-full inset-0 bg-black/80 border-2 border-black rounded-sm absolute flex flex-col items-center justify-center text-center px-2 opacity-0 hover:opacity-100 transition-opacity duration-75"
            >
                <strong className="text-sm text-white font-bold line-clamp-3 px-2">
                    {artist.name}
                </strong>
            </div>
        </Link>
    );
});