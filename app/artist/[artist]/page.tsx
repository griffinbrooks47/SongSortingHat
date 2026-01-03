
/* Next / React */
import { cache } from 'react';
import Link from "next/link";
import Image from "next/image"
import { unstable_cache } from 'next/cache';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/* Spotify API Wrapper. */
import spotify, { SpotifyAlbums } from "@/utils/spotifyService";

/* Database Wrapper. */
import { prisma } from "@/lib/db";

/* Types */
import { Prisma, DBArtistImg } from "@/prisma/generated/prisma/client";

/* Components */
import Catalogue from "./components/catalogue";

/* UI Components. */
import { IconHeart, IconArrowsTransferUpDown } from "@tabler/icons-react";
import { ar } from 'zod/v4/locales';


const albumInclude = {
  images: true,
} satisfies Prisma.DBAlbumInclude;
export type AlbumWithImages = Prisma.DBAlbumGetPayload<{ include: typeof albumInclude  }>;

const trackInclude = {

} satisfies Prisma.DBTrackInclude;

const artistInclude = {
  images: true,
  albums: {
    include: albumInclude,
  },
}
export type ArtistWithImagesAndAlbums = Prisma.DBArtistGetPayload<{ include: typeof artistInclude  }>;

const getCachedArtistFromDB = cache(async (artistId: string) => {
  console.log(`[${new Date().toISOString()}] DB Query: Fetching artist ${artistId}`);
  return await prisma.dBArtist.findUnique({
    where: { spotifyId: artistId },
    include: artistInclude,
  });
});

const getCachedArtistData = unstable_cache(
  async (artistId: string): Promise<ArtistWithImagesAndAlbums | null> => {
    
    /* Check if artist data is cached in the database. */
    const artist = await getCachedArtistFromDB(artistId);

    if (artist) {
      if(artist.albums.length > 0) {
        console.log(`[${new Date().toISOString()}] Cache: Artist found in DB`);
        return artist;
      }
    }
    
    return await prisma.$transaction(async (tx) => {
     
      const spotifyArtist = await spotify.getArtist(artistId);
      if(!spotifyArtist) {
        throw new Error("Couldn't fetch artist from Spotify.");
      }

      const albumsAndSingles = await spotify.getAlbums(artistId);
      if (!albumsAndSingles) {
        throw new Error("Couldn't fetch albums from Spotify.");
      }

      const artist = await tx.dBArtist.upsert({
        where: { spotifyId: artistId },
        create: {
          spotifyId: spotifyArtist.id,
          name: spotifyArtist.name,
          followers: spotifyArtist.followers.total,
          external_urls: spotifyArtist.external_urls,
          images: {
            createMany: {
              data: spotifyArtist.images.map(img => ({
                url: img.url,
                width: img.width,
                height: img.height,
              })),
            }
          }
        },
        update: {
          name: spotifyArtist.name,
          followers: spotifyArtist.followers.total,
          external_urls: spotifyArtist.external_urls,
        },
        select: { id: true }
      });

      const albumBatchSize = 10;
      const createdAlbums = [];
      
      for (let i = 0; i < albumsAndSingles.albums.length; i += albumBatchSize) {
        const albumBatch = albumsAndSingles.albums.slice(i, i + albumBatchSize);
        const batchResults = await Promise.all(
          albumBatch.map(async (album) => {
            const dbAlbum = await tx.dBAlbum.upsert({
              where: { spotifyId: album.id },
              create: {
                spotifyId: album.id,
                title: album.name,
                total_tracks: album.total_tracks,
                release_date: album.release_date,
                external_urls: album.external_urls,
                artists: {
                  connect: { id: artist.id }
                },
                images: {
                  createMany: {
                    data: album.images.map(img => ({
                      url: img.url,
                      width: img.width,
                      height: img.height,
                    })),
                  }
                }
              },
              update: {
                title: album.name,
                total_tracks: album.total_tracks,
                release_date: album.release_date,
                external_urls: album.external_urls,
                artists: {
                  connect: { id: artist.id }
                }
              },
              select: {
                id: true,
                spotifyId: true,
                images: {
                  select: { id: true, url: true }
                }
              }
            });

            const trackBatchSize = 50;
            const albumTracks = album.tracks.items;
            
            for (let j = 0; j < albumTracks.length; j += trackBatchSize) {
              const trackBatch = albumTracks.slice(j, j + trackBatchSize);
              
              const trackCreations = trackBatch.map(track => ({
                spotifyId: track.id,
                title: track.name,
                albumTitle: album.name,
                albumId: dbAlbum.id,
              }));

              await tx.$executeRaw`
                INSERT INTO "DBTrack" (id, "spotifyId", title, "albumTitle", "albumId", "updatedAt")
                VALUES ${Prisma.join(
                  trackCreations.map(t => 
                    Prisma.sql`(gen_random_uuid(), ${t.spotifyId}, ${t.title}, ${t.albumTitle}, ${t.albumId}, NOW())`
                  )
                )}
                ON CONFLICT ("spotifyId") 
                DO UPDATE SET 
                  "albumTitle" = EXCLUDED."albumTitle",
                  "albumId" = EXCLUDED."albumId",
                  "updatedAt" = NOW()
              `;

              if (dbAlbum.images.length > 0) {
                const trackIds = await tx.dBTrack.findMany({
                  where: {
                    spotifyId: { in: trackBatch.map(t => t.id) }
                  },
                  select: { id: true }
                });

                const imageRelations = trackIds.flatMap(track =>
                  dbAlbum.images.map(image => ({
                    trackId: track.id,
                    albumImgId: image.id,
                  }))
                );
              }
            }

            return dbAlbum;
          })
        );
        
        createdAlbums.push(...batchResults);
      }

      if (albumsAndSingles.singles.length > 0) {
        const singleBatchSize = 20;
        
        for (let i = 0; i < albumsAndSingles.singles.length; i += singleBatchSize) {
          const singleBatch = albumsAndSingles.singles.slice(i, i + singleBatchSize);
          
          await Promise.all(
            singleBatch.map(async (single) => {
              const track = single.tracks.items[0];
              const images = single.images;
              
              return await tx.dBTrack.upsert({
                where: { spotifyId: track.id },
                create: {
                  spotifyId: track.id,
                  title: track.name,
                  albumTitle: null,
                  albumId: null,
                  artists: {
                    connect: { id: artist.id }
                  },
                  images: {
                    create: images.map(img => ({
                      url: img.url,
                      width: img.width,
                      height: img.height,
                    }))
                  }
                },
                update: {
                  artists: {
                    connect: { id: artist.id }
                  }
                }
              });
            })
          );
        }
      }

      return await tx.dBArtist.findUnique({
        where: { spotifyId: artistId },
        include: {
          images: true,
          albums: {
            include: {
              images: true,
              tracks: {
                include: {
                  images: true
                }
              }
            }
          }
        }
      });
    }, {
      maxWait: 30000,
      timeout: 60000
    });

  },
  ['artist-data'],
  {
    revalidate: 3600,
    tags: ['artist-data'],
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
  
  let artist: ArtistWithImagesAndAlbums | null = null;
  let albums: AlbumWithImages[] | undefined;
  let artistImages: DBArtistImg[] | undefined = [];

  try {
    
    artist = await getCachedArtistData(artistId);
    albums = artist?.albums;
    
    artistImages = artist?.images;

    if (!artist || !albums || !artistImages) {
      return <div>Artist not found</div>;
    }
  } catch (error) {
    console.error("Error fetching artist data:", error);
    return <div>Error fetching artist data</div>;
  }

  return (
    <main className="page w-full max-w-[900px] flex flex-col items-center mx-auto pb-16 px-4 sm:px-6 lg:px-8">

      {/* Artist Data */}
      <section className="relative w-full mt-12 sm:mt-16 mb-6 sm:mb-8 flex flex-col sm:flex-row justify-center items-center sm:items-start gap-4 sm:gap-0">
        {/* Artist Image */}
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
        
        {/* Artist Info */}
        <section className="sm:px-6 lg:px-12 text-center sm:text-left">
          {/* Artist Name */}
          <div className="mb-1 text-3xl sm:text-4xl lg:text-[2.7rem] font-bold leading-tight line-clamp-2 break-words">
            {artist.name.length > 40 ? artist.name.slice(0, 40) + "..." : artist.name}
          </div>
          
          {/* Artist Metadata */}
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

          {/* Navigation */}
          <ul className="w-full my-3 sm:my-2 gap-2 flex justify-center sm:justify-start items-center">
            <li>
              <Link 
                href={`/rank/${artist.spotifyId}`} 
                className="px-3 sm:px-4 btn btn-sm sm:btn-md btn-outline bg-secondary border-2 rounded-sm"
              >
                <p className="font-semibold text-sm sm:text-base color-accent mr-0">Sort</p>
                <IconArrowsTransferUpDown className="px-0 w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-180 transition-transform duration-300" />
              </Link>
            </li>
            <li>
              <button className="my-1 btn btn-sm sm:btn-md btn-outline btn-circle border-black">
                <IconHeart className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </li>
          </ul>

        </section>

      </section>

      {/* Artist Catalogue */}
      <Catalogue 
        albums={albums}
      />
    </main>
  )
}