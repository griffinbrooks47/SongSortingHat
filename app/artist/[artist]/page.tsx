
/* Next Imports. */
import Link from "next/link";
import Image from "next/image"
import { unstable_cache } from 'next/cache';
import { cache } from 'react';

/* Auth */
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/* Universal Types */
import { Artist, Album } from "@/types/artist";

/* Spotify API Wrapper. */
import spotify from "@/utils/spotifyClient";

/* Database Wrapper. */
import prisma from "@/utils/prismaClient";

/* React Components */
import { AlbumCard } from "./components/albumCard";

/* UI Components. */
import { IconHeart, IconSwitch, IconDirectionSign, IconCategoryPlus, IconHeartFilled } from "@tabler/icons-react";
import Catalogue from "./components/catalogue";


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

  /* Check if user is logged in. */
  const session = await auth.api.getSession({
      headers: await headers(),
  });
  if (!session) {
      redirect("/login");
  }

  const artistId = (await params).artist;
  let artist: Artist | null = null;
  let albums: Album[] | null = null;
  let images: { url: string; width: number; height: number }[] | undefined = [];

  try {
    const result = await getCachedArtistData(artistId);
    artist = result.artist;
    albums = result.albums;
    images = artist.images;

    if (!artist || !albums || !images) {
      return <div>Artist not found</div>;
    }
  } catch (error) {
    console.error("Error fetching artist data:", error);
    return <div>Error fetching artist data</div>;
  }

  return (
    <main className="page w-fit flex flex-col items-center mx-auto">

      {/* Artist Data */}
      <section className="relative w-full mt-[4rem] mb-[2rem] flex flex-row justify-center items-center">
        {/* Artist Image */}
        <figure className="avatar">
          <div className="mask mask-squircle h-[11rem]">
            <Image
              src={images?.[0]?.url ?? '/images/placeholder-280.png'}
              width={280} 
              height={280}
              alt={`${artist.name} profile picture`}
              priority
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
          </div>
        </figure>
        
        {/* Artist Info */}
        <section className="px-[3rem]">
          {/* Artist Name */}
          
          {/* Artist Metadata */}
          <div className="">
            <div className="mb-[0.25rem] text-[2.75rem] font-bold leading-[3.25rem] line-clamp-2">
              {artist.name.length > 40 ? artist.name.slice(0, 40) + "..." : artist.name}
            </div>
            <p className="text-[1.15rem] font-semibold uppercase opacity-80 truncate max-w-[40ch] leading-[1.15rem]">
              <span className={`drop-shadow-[0_0_0.5px_rgba(0,0,0,1)] ${
                artist.followers >= 30000000 
                  ? 'text-amber-400' 
                  : artist.followers >= 10000000 
                  ? 'text-purple-400' 
                  : artist.followers >= 1000000 
                  ? 'text-blue-400' 
                  : artist.followers >= 100000 
                  ? 'text-pink-700' 
                  : ''
              }`}>
                {artist.followers >= 1000000 
                  ? `${(artist.followers / 1000000).toFixed(1).replace(/\.0$/, '')}M` 
                  : artist.followers >= 1000 
                  ? `${(artist.followers / 1000).toFixed(1).replace(/\.0$/, '')}K` 
                  : artist.followers}
              </span>
              {' followers'}
            </p>
            <p className="text-[0.95rem] my-[0.25rem] font-semibold uppercase opacity-60 truncate max-w-[40ch] leading-[1.15rem]">
              {albums.length} projects
            </p>
            <button className="my-[0.25rem] btn btn-outline btn-circle">
              <IconHeart />
            </button>
          </div>

        </section>

      </section>

      {/* Navigation */}
      <ul className="w-full my-[2rem] flex justify-center items-center">
        <li>
          <Link 
            href={`/rank/${artist.spotifyId}`} 
            className="btn btn-lg btn-outline bg-secondary border-2 rounded-lg"
          >
            <IconCategoryPlus className="w-8 h-8 group-hover:rotate-180 transition-transform duration-300" />
            <p className="font-semibold text-[1rem] color-accent mr-2">Start Sorting</p>
          </Link>
        </li>
      </ul>

      
      {/* Artist Catalogue */}
      <Catalogue 
        albums={albums} 
        tracks={[]}
      />
    </main>
  )
}

// Optional: Add function to manually invalidate cache when needed
// export async function revalidateArtist(a