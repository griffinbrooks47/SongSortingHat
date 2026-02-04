
/* Next / React */
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import Image from "next/image"
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/* Database Wrapper. */
import { prisma } from "@/lib/db";

/* Server Actions */
import { createDatabaseArtist } from "./actions/createArtist";

/* Types */
import { AlbumWithImages, ArtistWithImagesAndAlbums, artistInclude } from './actions/createArtist';
import { ArtistImage, Track, Artist, TrackArtistRole } from "@/prisma/generated/prisma/client";

/* Components */
import Catalogue from "./components/catalogue";
import SortArtistButton from './components/sortArtistButton';

/* UI Components. */
import { IconHeart } from "@tabler/icons-react";

const getCachedArtistFromDB = cache(async (artistSpotifyId: string) => {
  console.log(`[${new Date().toISOString()}] DB Query: Fetching artist ${artistSpotifyId}`);
  return await prisma.artist.findUnique({
    where: { spotifyId: artistSpotifyId },
    include: artistInclude,
  });
});

const getCachedArtistData = unstable_cache(
  async (artistSpotifyId: string): Promise<ArtistWithImagesAndAlbums | null> => {
    
    const cachedArtist = await getCachedArtistFromDB(artistSpotifyId);
    if (cachedArtist && cachedArtist.albums.length > 0) {
      return cachedArtist;
    }

    await createDatabaseArtist(artistSpotifyId);
    return await prisma.artist.findUnique({
      where: { spotifyId: artistSpotifyId },
      include: artistInclude,
    });
  },
  ['artist-data'],
  { revalidate: 3600, tags: ['artist-data'] }
);

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ artist: string }>
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
  }

  const artistSpotifyId = (await params).artist;
  
  let artist: ArtistWithImagesAndAlbums | null = null;
  let albums: AlbumWithImages[] | undefined;
  let artistImages: ArtistImage[] | undefined = [];

  try {
    artist = await getCachedArtistData(artistSpotifyId);
    albums = artist?.albums.map(a => a.album);
    artistImages = artist?.images;

    if (!artist || !albums || !artistImages) {
      return <div>Artist not found</div>;
    }

  } catch (error) {
    console.error("Error fetching artist data:", error);
    return <div>Error fetching artist data</div>;
  }

  /* Ensure tracks are synced before allowing users to navigate to /rank. */
  const syncStatus = { status: 'pending', syncedAt: null, trackCount: 0 };

  return (
    <main className="page w-full max-w-[900px] flex flex-col items-center mx-auto pb-16 px-4 sm:px-6 lg:px-8">
      <section className="relative w-full mt-12 sm:mt-16 mb-6 sm:mb-8 flex flex-col sm:flex-row justify-center items-center sm:items-start gap-4 sm:gap-0">
        <figure className="avatar flex-shrink-0">
          <div className="mask mask-squircle h-32 w-32 sm:h-36 sm:w-36 lg:h-44 lg:w-44">
            <Image
              src={artistImages[0]?.url ?? '/images/placeholder-280.png'}
              width={280} 
              height={280}
              alt={`${artist.name} profile picture`}
              priority
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              className="w-full h-full object-cover"
            />
          </div>
        </figure>
        
        <section className="sm:px-6 lg:px-12 text-center sm:text-left">
          <div className="mb-1 text-3xl sm:text-4xl lg:text-[2.7rem] font-bold leading-tight line-clamp-2 break-words">
            {artist.name.length > 40 ? artist.name.slice(0, 40) + "..." : artist.name}
          </div>
          
          <div className="space-y-1">
            <p className="text-base sm:text-lg lg:text-[1.1rem] font-semibold uppercase opacity-80 truncate leading-tight">
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
            <p className="text-sm sm:text-base lg:text-[0.9rem] font-semibold uppercase opacity-60 truncate leading-tight">
              {albums.length} projects
            </p>
          </div>

          <ul className="w-full my-3 sm:my-2 gap-2 flex justify-center sm:justify-start items-center">
            <li>
              <button className="my-1 btn btn-sm sm:btn-md btn-outline btn-circle border-black">
                <IconHeart className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </li>
            <li>
              <SortArtistButton 
                artistSpotifyId={artistSpotifyId}
              />
            </li>
          </ul>
        </section>
      </section>

      <Catalogue albums={albums} />
    </main>
  );
}