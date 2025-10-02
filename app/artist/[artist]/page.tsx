/* Next Imports. */
import Link from "next/link";
import Image from "next/image"
import { unstable_cache } from 'next/cache';
import { cache } from 'react';

/* Universal Types */
import { Artist, Album } from "@/types/artist";

/* Spotify API Wrapper. */
import spotify from "@/utils/spotifyClient";

/* Database Wrapper. */
import prisma from "@/utils/prismaClient";

/* React Components */
import { AlbumCard } from "./components/albumCard";

/* UI Components. */
import { IconHeart, IconSwitch } from "@tabler/icons-react";


// React cache for request deduplication during render
const getCachedArtistFromDB = cache(async (artistId: string) => {
  console.log(`[${new Date().toISOString()}] DB Query: Fetching artist ${artistId}`);
  return await prisma.getArtist(artistId);
});


// Next.js cache for persistent caching across requests
const getCachedArtistData = unstable_cache(
  async (artistId: string): Promise<{ artist: Artist; albums: Album[] }> => {
    console.log(`[${new Date().toISOString()}] Cache Miss: Processing artist ${artistId}`);
    
    // First try DB
    const artist = await getCachedArtistFromDB(artistId);
    const albums = artist?.albums || null;

    if (artist && albums) {
      console.log(`[${new Date().toISOString()}] Cache: Artist found in DB`);
      return { artist, albums };
    }

    // If not in DB, fetch from Spotify
    console.log(`[${new Date().toISOString()}] Cache: Artist not in DB, fetching from Spotify`);
    
    const spotifyArtist = await spotify.getArtist(artistId);
    const spotifyAlbums = spotifyArtist?.albums || null;

    if (!spotifyArtist || !spotifyAlbums) {
      throw new Error("Artist or albums not found from Spotify.");
    }

    // Save to DB (fire and forget to avoid blocking)
    await prisma.createArtist(spotifyArtist).catch(error => {
      console.error(`Failed to save artist ${artistId} to DB:`, error);
    });

    console.log(`[${new Date().toISOString()}] Cache: Artist fetched from Spotify and saved`);
    return { artist: spotifyArtist, albums: spotifyAlbums };
  },
  ['artist-data'], // Cache key prefix
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['artist-data'], // Individual cache invalidation
  }
);

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ artist: string }>
}) {
  const artistId = (await params).artist;
  
  const { artist, albums } = await getCachedArtistData(artistId);
  if (!artist) {
    throw new Error("Artist not found.");
  }
  if (!albums) {
    throw new Error("Albums not found.");
  }   
  if (!artist.images || artist.images.length === 0) {
    throw new Error("No artist images found.");
  }
   
  return (
    <main className="page flex justify-center items-center flex-col">
      <div className="mt-[5rem]">
        <div className="relative h-[17.5rem] mb-[2rem] flex flex-row justify-between items-start rounded-md">
          <section className="pt-[0rem] mt-[0.5rem] mb-[2rem] flex flex-row min-w-[30rem]">
            <div className="ml-[1.5rem] pr-[5rem] my-auto">
              <p
                className="text-[2.75rem] font-bold break-words overflow-hidden 
                        line-clamp-2 text-ellipsis max-w-full leading-[3.65rem]"
                style={{
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  whiteSpace: "normal",
                }}
              >
                {artist.name.length > 40 ? artist.name.slice(0, 40) + "..." : artist.name}
              </p>
              <p className="text-[1.15rem] mt-[0rem] font-semibold opacity-80 truncate max-w-[40ch] leading-[1.25rem]">
                {artist.followers.toLocaleString()} followers
              </p>
              <p className="text-[0.95rem] my-[0.25rem] font-semibold uppercase opacity-60 truncate max-w-[40ch] leading-[1rem]">
                {albums.length} projects
              </p>
              <div className="flex">
                <button className="mr-[0.5rem] my-[0.5rem] w-[3.25rem] h-[3.25rem] border-2 border-neutral opacity-80 flex rounded-full justify-center items-center hover:opacity-100 transition-opacity">
                  <IconHeart className="w-8 h-8" />
                </button>
              </div>
            </div>
          </section>
          <div className="h-full">
            <figure className="h-full z-10 aspect-w-1 aspect-h-1">
              <Image
                src={artist.images[0].url}
                width={280} 
                height={280}
                alt={`${artist.name} profile picture`}
                className="h-full rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.8)] object-cover"
                priority // Load artist image immediately
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
            </figure>
          </div>
        </div>
      </div>
      
      <section className="relative">
        {/* Future content area */}
      </section>
      
      <section className="flex justify-center items-start flex-col mt-[0.5rem]">
        <ul className="flex justify-center items-center w-full my-[0.5rem]">
          <li className="mx-[0.25rem]">
            <Link 
              href={`/rank/${artist.spotifyId}`} 
              className="mt-auto px-[1.5rem] py-[0.5rem] border-2 bg-accent border-neutral shadow-sm opacity-80 flex rounded-md justify-center items-center hover:opacity-100 transition-opacity group"
            >
              <p className="font-semibold text-[1rem] color-accent mr-2">Start Sorting</p>
              <IconSwitch className="w-8 h-8 group-hover:rotate-180 transition-transform duration-300" />
            </Link>
          </li>
        </ul>
        
        <hr className="border-black opacity-10 w-full my-[0.05rem]" />
        
        <div className="flex ml-[1rem] justify-between w-full">
          <ul className="ml-auto my-[1rem] mr-[2rem] bg-base-100 shadow-sm rounded-md flex justify-center items-center py-[0.25rem]">
            <li>
              <button className="h-[2.5rem] rounded-sm flex justify-center items-center px-[1rem] ml-[0.25rem] mr-[0.25rem] bg-base-200 transition-colors hover:bg-base-300">
                Albums
              </button>
            </li>
            <li>
              <button className="h-[2.5rem] rounded-sm flex justify-center items-center px-[1rem] mr-[0.25rem] bg-base-100 transition-colors hover:bg-base-200">
                Songs
              </button>
            </li>
            <li>
              <button className="h-[2.5rem] rounded-sm flex justify-center items-center px-[1rem] mr-[0.25rem] bg-base-100 transition-colors hover:bg-base-200">
                Lists
              </button>
            </li>
          </ul>
        </div>
        
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
    </main>
  )
}

// Optional: Add function to manually invalidate cache when needed
// export async function revalidateArtist(a