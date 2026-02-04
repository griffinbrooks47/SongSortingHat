'use client';

/* Next / React */
import { memo } from "react";
import Image from "next/image";
import Link from "next/link";

/* Types */
import { SortingWithArtistAndTracks } from "../page";
import { Artist, ArtistImage } from "@/prisma/generated/prisma/client";

export const UserSortings = memo(function UserSortings({
  sortings,
}: {
  sortings: SortingWithArtistAndTracks[];
}) {
  return (
    <section className="mb-auto flex flex-col items-start">
        <h1 className="text-md font-bold">Sortings</h1>
        <hr className="border-black opacity-10 w-200 mt-1"></hr>
        <div className="mt-4 grid grid-cols-3 gap-2">
            {sortings && sortings.map((sorting) => (
                <SortingPreviewCard key={sorting.id} sorting={sorting} />
            ))}
        </div>
    </section>
  );
});

const SortingPreviewCard = memo(function SortingPreviewCard({
  sorting,
}: {
  sorting: SortingWithArtistAndTracks;
}) {

    const id = sorting.id;
    const numTracks = sorting.tracks.length;
  
    const artist: Artist & { images: ArtistImage[] } = sorting.artist;
    const artistImage: ArtistImage | null = artist.images && artist.images.length > 0 ? artist.images[0] : null;

    return (
        <Link
        href={`/sorting/${id}`}
        className="group relative w-64 rounded-md overflow-hidden border-2 border-black/10 bg-base-100 shadow-xs hover:shadow-md hover:border-black transition-all duration-150"
        >
            {/* Artist Section */}
            <section 
                key={sorting.id}
                className="relative h-18 w-full shrink-0 rounded-sm overflow-hidden flex flex-row gap-2 p-2"
            >
                {/* Artist Image */}
                <figure className="h-full aspect-square rounded-sm shrink-0 overflow-hidden">
                    {artistImage &&
                        <Image 
                            src={artistImage.url}
                            width={artistImage.width || 100}
                            height={artistImage.height || 100}
                            alt={artist.name}
                            className="object-cover w-full h-full"
                            priority={false}
                            loading="lazy"
                        />
                    }
                </figure>
            
                {/* Artist Info */}
                <div className="px-1 flex flex-col items-start justify-center flex-1 min-w-0">
                    <strong className="text-md font-bold truncate leading-tight">
                        {artist.name}
                    </strong>
                    <p className="text-[0.75rem] truncate leading-tight text-gray-600">
                        {numTracks} {numTracks === 1 ? "track" : "tracks"}
                    </p>
                </div>

            </section>
        
        </Link>
    );
});

/* 

<hr className="border-black opacity-10 w-200"></hr>

        
        <section className="pt-0 pb-1">
            {topTracks.map((track, index) => (
                <div 
                    key={track.id}
                    className="h-12 flex flex-row items-center transition-colors duration-150"
                >
                    <span className="w-14 text-sm font-bold font-medium text-center text-gray-600">
                        {index + 1}.
                    </span>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold max-w-[20ch] truncate leading-tight">
                            {track.title}
                        </span>
                        <span className="text-xs text-gray-600 max-w-[20ch] truncate leading-tight">
                            {track.artists.map((artist) => artist.name).join(", ")}
                        </span>
                    </div>
                </div>
            ))}
        </section>
*/