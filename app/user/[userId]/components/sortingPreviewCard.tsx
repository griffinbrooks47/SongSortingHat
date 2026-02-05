'use client';

/* Next / React */
import { memo } from "react";
import Image from "next/image";
import Link from "next/link";

/* Types */
import { SortingWithRelations } from "../page";
import { Artist, ArtistImage } from "@/prisma/generated/prisma/client";

export const UserSortings = memo(function UserSortings({
  sortings,
}: {
  sortings: SortingWithRelations[];
}) {
  return (
    <section className="mb-auto flex flex-col items-start w-[90%] mx-auto sm:max-w-3xl">
        <h1 className="text-md font-bold">Sortings</h1>
        <hr className="border-black opacity-10 w-full mt-1"></hr>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 w-full">
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
  sorting: SortingWithRelations;
}) {

    const id = sorting.id;
    const numTracks = sorting.tracks.length;
  
    const artist: Artist & { images: ArtistImage[] } = sorting.artist;
    const artistImage: ArtistImage | null = artist.images && artist.images.length > 0 ? artist.images[0] : null;

    return (
        <Link
        href={`/sorting/${id}`}
        className="group relative w-full rounded-md overflow-hidden border-2 border-black/10 bg-base-100 shadow-xs hover:shadow-md hover:border-black transition-all duration-150"
        >
            {/* Artist Section */}
            <section 
                key={sorting.id}
                className="relative h-16 sm:h-18 w-full shrink-0 rounded-sm overflow-hidden flex flex-row gap-2 p-2"
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
                    <strong className="text-sm sm:text-md font-bold truncate leading-tight w-full">
                        {artist.name}
                    </strong>
                    <p className="text-[0.7rem] sm:text-[0.75rem] truncate leading-tight text-gray-600 w-full">
                        {numTracks} {numTracks === 1 ? "track" : "tracks"}
                    </p>
                </div>

            </section>
        
        </Link>
    );
});