/* Prisma */
import { prisma } from '@/lib/db';
import { Artist, Prisma, Track } from '@/prisma/generated/prisma/client';
import { ImageSource, AlbumType, AlbumArtistRole, TrackArtistRole, TrackArtistsStatus } from '@/prisma/generated/prisma/enums';

/* Spotify API */
import spotify from '@/utils/spotifyService';
import { SpotifyAlbums, SpotifyArtist } from '@/utils/spotifyService';
import { after } from 'next/server';

export const albumInclude = {
  images: true,
} satisfies Prisma.AlbumInclude;
export type AlbumWithImages = Prisma.AlbumGetPayload<{ include: typeof albumInclude  }>;

const trackInclude = {

} satisfies Prisma.TrackInclude;

export const artistInclude = {
  images: true,
  /* ArtistAlbum join table */
  albums: {
    include: {
      album: {
        include: albumInclude,
      }
    }
  },
} satisfies Prisma.ArtistInclude;
export type ArtistWithImagesAndAlbums = Prisma.ArtistGetPayload<{ include: typeof artistInclude  }>;
 
export async function createDatabaseArtist(artistSpotifyId: string) {
    'use server';
    
    /* Spotify API Fetches */
    const spotifyArtist = await spotify.getArtist(artistSpotifyId);
    if (!spotifyArtist) {
      throw new Error("Couldn't fetch artist from Spotify.");
    }
    const albumsAndSingles = await spotify.getAlbums(artistSpotifyId);
    if (!albumsAndSingles) {
      throw new Error("Couldn't fetch albums from Spotify.");
    }
    const albums: SpotifyAlbums['albums'] = albumsAndSingles.albums.concat(albumsAndSingles.singles);

    /* Split albums into new and existing */
    const albumSpotifyIds = albums.map(a => a.id);
    const existingAlbums = await prisma.album.findMany({
      where: { spotifyId: { in: albumSpotifyIds } },
      select: { spotifyId: true, id: true, artistsStatus: true, imagesStatus: true, updatedAt: true },
    });
    const fullAlbumMap = new Map<string, string>(existingAlbums.map(a => [a.spotifyId, a.id]));
    const newAlbums = albums.filter(a => !fullAlbumMap.has(a.id));
    const existingAlbumsToUpdate = albums.filter(a => {
      const existing = existingAlbums.find(e => e.spotifyId === a.id);
      if (!existing) return false;
      return (
        existing.artistsStatus !== 'COMPLETE' ||
        existing.imagesStatus !== 'COMPLETE' ||
        existing.updatedAt < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days
      );
    });

    const parseYearMonthUTC = (str: string): string => {
      if (!str) {
        throw new Error("Invalid date string: empty or undefined");
      }
      const parts = str.split("-");
      const year = parseInt(parts[0], 10);
      const month = parts[1] ? parseInt(parts[1], 10) - 1 : 0;
      const day = parts[2] ? parseInt(parts[2], 10) : 1;
      if (isNaN(year) || year < 1000 || year > 3000) {
        throw new Error(`Invalid year in date string: ${str}`);
      }
      return new Date(Date.UTC(year, month, day)).toISOString();
    };
  
    await prisma.$transaction(async (tx) => {
      /* Query 1: Upsert artist */
      const upsertedArtist = await tx.artist.upsert({
        where: { spotifyId: artistSpotifyId },
        create: {
          spotifyId: spotifyArtist.id,
          name: spotifyArtist.name,
          followers: spotifyArtist.followers.total,
          externalUrls: spotifyArtist.external_urls,
        },
        update: {
          name: spotifyArtist.name,
          followers: spotifyArtist.followers.total,
          externalUrls: spotifyArtist.external_urls,
        },
        select: { id: true, spotifyId: true, imagesStatus: true, albumsStatus: true },
      });

      /* Query 2: Upsert largest image & connect to artist */
      let imageUpdated = false;
      const largestImage = spotifyArtist.images.reduce((largest, img) => {
        if (!largest) return img;
        const largestArea = (largest.width ?? 0) * (largest.height ?? 0);
        const currentArea = (img.width ?? 0) * (img.height ?? 0);
        return currentArea > largestArea ? img : largest;
      }, null as typeof spotifyArtist.images[number] | null);
      if (largestImage) {
        try {
          await tx.artistImage.upsert({
            where: {
              artistId: upsertedArtist.id,
            },
            create: {
              artistId: upsertedArtist.id,
              url: largestImage.url,
              width: largestImage.width,
              height: largestImage.height,
              mimeType: 'image/jpeg',
              source: ImageSource.EXTERNAL,
              isPrimary: true,
            },
            update: {
              url: largestImage.url,
              width: largestImage.width,
              height: largestImage.height,
              mimeType: 'image/jpeg',
              source: ImageSource.EXTERNAL,
              isPrimary: true,
            }
          });
          imageUpdated = true;
        } catch (error) {
          console.error("Error upserting artist image:", error);
        }
      }

      /* Query 3: Create new albums */
      let newAlbumsCreated = false;
      if (newAlbums.length > 0) {
        let newAlbumImageStatuses = new Set<string>();
        let newAlbumArtistStatuses = new Set<string>();
        try {

          /* ALBUMS */
          const createdAlbumsData = newAlbums.map(album => ({
            spotifyId: album.id,
            title: album.name,
            totalTracks: album.total_tracks,
            releaseDate: parseYearMonthUTC(album.release_date),
            externalUrls: album.external_urls,
            type: album.total_tracks === 1 ? AlbumType.SINGLE : AlbumType.ALBUM,
          }));
          
          if(createdAlbumsData.length > 0) {
            try {
              const createdAlbums = await tx.album.createManyAndReturn({
                data: createdAlbumsData,
                skipDuplicates: true,
              });
              createdAlbums.forEach(album => {
                fullAlbumMap.set(album.spotifyId, album.id);
              });
            } catch (error) {
              throw new Error("Error creating albums: " + error);
            }
          }

          /* ALBUM IMAGES */
          const createdAlbumsImageData = newAlbums.map(album => {
            const largestImage = album.images?.reduce((largest, current) => {
              if (!largest) return current;
              const largestArea = (largest.width ?? 0) * (largest.height ?? 0);
              const currentArea = (current.width ?? 0) * (current.height ?? 0);
              return currentArea > largestArea ? current : largest;
            }, album.images[0]);
            return {
              albumId: fullAlbumMap.get(album.id)!, // Replace Spotify ID with DB album ID
              url: largestImage?.url || '',
              width: largestImage?.width ?? null,
              height: largestImage?.height ?? null,
              mimeType: 'image/jpeg',
              source: ImageSource.EXTERNAL,
              isPrimary: true,
            };
          });
          if (createdAlbumsImageData.length) {
            try {
              const createdAlbumImages = await tx.albumImage.createManyAndReturn({
                data: createdAlbumsImageData,
                skipDuplicates: true,
              });
              createdAlbumImages.forEach(image => {
                if(image.albumId)
                  newAlbumImageStatuses.add(image.albumId);
              });
            } catch (error) {
              throw new Error("Error creating album images: " + error);
            }
          }

          /* ALBUM ARTISTS - SOLO & COLLABORATORS */
          for (const spotifyAlbum of newAlbums) {
            const collaborators = [upsertedArtist.id];
            for(const spotifyArtist of spotifyAlbum.artists) {
              if(artistSpotifyId === spotifyArtist.id) {
                continue;
              }
              const artistUpsert = await tx.artist.upsert({
                where: { spotifyId: spotifyArtist.id },
                create: {
                  spotifyId: spotifyArtist.id,
                  name: spotifyArtist.name,
                  externalUrls: spotifyArtist.external_urls,
                  followers: spotifyArtist.followers.total || 0,
                },
                update: {
                  name: spotifyArtist.name,
                  externalUrls: spotifyArtist.external_urls,
                  followers: spotifyArtist.followers.total || 0,
                }
              });
              collaborators.push(artistUpsert.id);
            }

            const isSolo = spotifyAlbum.artists.length === 1;

            const createdAlbumArtists = await tx.albumArtist.createManyAndReturn({
              data: collaborators.map(artistId => ({
                artistId: artistId,
                albumId: fullAlbumMap.get(spotifyAlbum.id)!,
                role: isSolo ? AlbumArtistRole.SOLO : AlbumArtistRole.COLLABORATOR,
              })),
              skipDuplicates: true,
            });
            createdAlbumArtists.forEach(artist => {
              newAlbumArtistStatuses.add(artist.albumId);
            });
          }
        } catch (error) {
          console.error("Error creating new albums:", error);
        }

        /* ALBUM RELATIONAL STATUSES */
        await tx.album.updateMany({
          where: { id: { in: Array.from(newAlbumImageStatuses) } },
          data: { imagesStatus: 'COMPLETE' },
        });
        await tx.album.updateMany({
          where: { id: { in: Array.from(newAlbumArtistStatuses) } },
          data: { artistsStatus: 'COMPLETE' },
        });

        /* If no database operations fail, mark albums as created. */
        newAlbumsCreated = true;
      }

      /* Query 4: Update existing albums */
      let existingAlbumsUpdated = false ? existingAlbumsToUpdate.length > 0 : true;
      if (existingAlbumsToUpdate.length > 0) {
        let existingAlbumImageStatuses = new Set<string>();
        let existingAlbumNewArtistStatuses = new Set<string>();
        let existingAlbumExistingArtistStatuses = new Set<string>();
        try {

          /* ALBUMS  */
          const updatedAlbums = await Promise.all(
            existingAlbumsToUpdate.map(album =>
              tx.album.upsert({
                where: { spotifyId: fullAlbumMap.get(album.id)! },
                update: {
                  title: album.name,
                  totalTracks: album.total_tracks,
                  releaseDate: parseYearMonthUTC(album.release_date),
                  externalUrls: album.external_urls,
                },
                create: {
                  spotifyId: fullAlbumMap.get(album.id)!,
                  title: album.name,
                  totalTracks: album.total_tracks,
                  releaseDate: parseYearMonthUTC(album.release_date),
                  externalUrls: album.external_urls,
                },
              })
            )
          );

          /* ALBUM IMAGES */
          const updatedAlbumImageData = existingAlbumsToUpdate.map(album => {
            const largestImage = album.images?.reduce((largest, current) => {
              if (!largest) return current;
              const largestArea = (largest.width ?? 0) * (largest.height ?? 0);
              const currentArea = (current.width ?? 0) * (current.height ?? 0);
              return currentArea > largestArea ? current : largest;
            }, album.images[0]);
            return {
              albumId: fullAlbumMap.get(album.id)!, // Replace Spotify ID with DB album ID
              url: largestImage?.url || '',
              width: largestImage?.width ?? null,
              height: largestImage?.height ?? null,
              mimeType: 'image/jpeg',
              source: ImageSource.EXTERNAL,
              isPrimary: true,
            };
          });
          try {
            await tx.albumImage.deleteMany({
              where: {
                albumId: { in: updatedAlbums.map(a => a.id) }
              },
            });
            const updatedAlbumImages = await tx.albumImage.createManyAndReturn({
              data: updatedAlbumImageData,
              skipDuplicates: true,
            });
            updatedAlbumImages.forEach(image => {
              if(image.albumId)
                existingAlbumImageStatuses.add(image.albumId);
            });
          } catch (error) {
            throw new Error("Error updating existing album images: " + error);
          }

          const spotifyArtistIds = Array.from(
            new Set(existingAlbumsToUpdate.flatMap(album => album.artists.map(a => a.id)))
          );
          const spotifyArtistById = new Map(
            existingAlbumsToUpdate.flatMap(album => album.artists.map(a => [a.id, a]))
          );
          const existingArtists = await tx.artist.findMany({
            where: { spotifyId: { in: spotifyArtistIds } },
            select: { id: true, spotifyId: true },
          });
          const artistIdBySpotifyId = new Map(existingArtists.map(a => [a.spotifyId, a.id]));
          const missingSpotifyIds = spotifyArtistIds.filter(id => !artistIdBySpotifyId.has(id));

          /* EXISTING ALBUM, NEW ARTISTS */
          if (missingSpotifyIds.length > 0) {
            try {
              const newlyCreated  = await tx.artist.createManyAndReturn({
                data: missingSpotifyIds.map(id => {
                  const spotifyArtist = spotifyArtistById.get(id)!;
                  return {
                    spotifyId: spotifyArtist.id,
                    name: spotifyArtist.name ?? '',
                    followers: spotifyArtist.followers?.total ?? 0,
                    externalUrls: spotifyArtist.external_urls ?? {},
                  };
                }),
                skipDuplicates: true,
              });
              newlyCreated.forEach(a => {
                artistIdBySpotifyId.set(a.spotifyId, a.id);
                existingAlbumNewArtistStatuses.add(a.id);
              });
            } catch (error) {
              throw new Error("Error creating missing artists: " + error);
            }
          }

          /* EXISTING ALBUM, EXISTING ARTISTS */
          const albumArtistData = updatedAlbums.flatMap((album, i) => {
            const artists = existingAlbumsToUpdate[i].artists;
            const role = artists.length > 1 ? AlbumArtistRole.COLLABORATOR : AlbumArtistRole.SOLO;
            return artists.map(artist => ({
              albumId: album.id,
              artistId: artistIdBySpotifyId.get(artist.id)!,
              role,
            }));
          });
          try {
            await tx.albumArtist.deleteMany({
              where: {
                albumId: { in: updatedAlbums.map(a => a.id) }
              }
            });
            await tx.albumArtist.createMany({
              data: albumArtistData,
            });
            albumArtistData.forEach(rel => {
              existingAlbumExistingArtistStatuses.add(rel.artistId);
            });
            existingAlbumsUpdated = true;
          } catch (error) {
            throw new Error("Error updating album artists: " + error);
          }

          /* ALBUM RELATIONAL STATUSES */
          await tx.album.updateMany({
            where: { id: { in: Array.from(existingAlbumImageStatuses) } },
            data: { imagesStatus: 'COMPLETE' },
          });
          await tx.album.updateMany({
            where: { id: { in: Array.from(existingAlbumNewArtistStatuses) } },
            data: { artistsStatus: 'COMPLETE' },
          });
          await tx.album.updateMany({
            where: { id: { in: Array.from(existingAlbumExistingArtistStatuses) } },
            data: { artistsStatus: 'COMPLETE' },
          });

        } catch (error) {
          console.error("Error updating existing albums:", error);
        }
      }

      /* Finally update artist statuses */
      await tx.artist.update({
        where: { id: upsertedArtist.id },
        data: {
          imagesStatus: imageUpdated ? 'COMPLETE' : 'INCOMPLETE',
          albumsStatus: (newAlbumsCreated && existingAlbumsUpdated) ? 'COMPLETE' : 'INCOMPLETE',
        },
      });
    }, {
      maxWait: 15000,
      timeout: 30000
    });

    /* BACKGROUND TASK: Sync album tracks */
    after(async () => {
        const trackSpotifyIds = albums.flatMap(a => a.tracks.items).map(t => t.id);
        if(trackSpotifyIds.length === 0) {
            return;
        }
    
        /* Tracks */
        const existingTracks = await prisma.track.findMany({
            where: { spotifyId: { in: trackSpotifyIds }}
        });
        const fullTrackMap = new Map<string, Track>(existingTracks.map(existingTrack => [existingTrack.spotifyId, existingTrack]));
    
        await prisma.$transaction(async (tx) => {
            /* Create tracks in batches */
            for(const album of albums) {
        
                const newTrackData: Array<{
                spotifyId: string;
                title: string;
                duration: number | null;
                albumId: string;
                position: number;
                }> = [];
                const existingTrackData: Track[] = [];
        
                /* Categorize each track as NEW or EXISTING */
                album.tracks.items.forEach((track, idx) => {
                const existing = fullTrackMap.get(track.id);
                if(!existing) {
                    newTrackData.push({
                    spotifyId: track.id,
                    title: track.name,
                    duration: track.duration,
                    albumId: fullAlbumMap.get(album.id)!,
                    position: idx,
                    });
                } else {
                    if(existing.duration !== track.duration || existing.title !== track.name || existing.position !== idx || existing.albumId !== fullAlbumMap.get(album.id)!) {
                    existingTrackData.push({
                        ...existing,
                        title: track.name,
                        duration: track.duration,
                        albumId: fullAlbumMap.get(album.id)!,
                        position: idx,
                        spotifyId: existing.spotifyId,
                    });
                    }
                }
                });
        
                /* Query 1: Create new tracks for the current album. */
                try {
                const createdAlbumTracks = await tx.track.createManyAndReturn({
                    data: newTrackData,
                    skipDuplicates: true,
                });
                for(const track of createdAlbumTracks) {
                    fullTrackMap.set(track.spotifyId, track);
                    existingTracks.push(track);
                }
                    //console.log(`Created ${createdAlbumTracks.length} new tracks for album: ${album.name}`);
                } catch (error) {
                    //console.error(`Error creating tracks for album: ${album.name}`, error);
                }
                
                /* Query 2: Update existing tracks for the current album. */
                await Promise.all(
                existingTrackData
                /* Filter out tracks that do not need an update. */
                .filter(track => {
                    const isIncomplete = track.artistsStatus !== 'COMPLETE';
                    const isOutdated = track.updatedAt < new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
                    return isIncomplete || isOutdated;
                })
                .map(async (trackData) => {
                    await tx.track.update({
                    where: { id: trackData.id },
                    data: {
                        title: trackData.title,
                        duration: trackData.duration,
                        albumId: trackData.albumId,
                        position: trackData.position,
                    },
                    });
                    //console.log(`Updated track: ${trackData.title} (ID: ${trackData.id})`);
                })
                );
            }
        
            /* Artists */
            const artistSpotifyIds = new Set(
                albums.flatMap(a => a.tracks.items.flatMap(t => t.artists.map(ar => ar.id)))
            ); 
            
            const artistSpotifyIdArray = Array.from(artistSpotifyIds);
            const batchedSpotifyArtistIds: string[][] = [];
            for (let i = 0; i < artistSpotifyIdArray.length; i += 50) {
                batchedSpotifyArtistIds.push(artistSpotifyIdArray.slice(i, i + 50));
            }
            
            const allSpotifyArtists: SpotifyArtist[] = [];
            for(const batch of batchedSpotifyArtistIds) {
                const artistsBatch = await spotify.getArtists(batch);
                if(!artistsBatch) continue;
                allSpotifyArtists.push(...artistsBatch);
            }

            const spotifyIdToArtistId = new Map<string, string>();
            
            /* Query 3: Create any artists that do not exist. */
            if(allSpotifyArtists.length > 0) {
                const artistData = allSpotifyArtists.map(artist => ({
                    spotifyId: artist.id,
                    name: artist.name,
                    followers: artist.followers.total,
                    externalUrls: artist.external_urls,
                }));
                try {
                /* New Artists */
                const createdArtists = await tx.artist.createMany({
                    data: artistData,
                    skipDuplicates: true,
                });
                //console.log(`Created ${createdArtists.count} new artists.`);
                /* Existing Artists */
                const allArtistsFromDb = await tx.artist.findMany({
                    where: { spotifyId: { in: artistData.map(a => a.spotifyId) } }
                });
                for (const artist of allArtistsFromDb) {
                    spotifyIdToArtistId.set(artist.spotifyId, artist.id);
                }
                } catch (error) {
                throw new Error("Error creating track artists: " + error);
                }
            }
        
            /* Prisma Artist ID to Prisma Track ID*/
            const artistToTracksMap = new Map<string, Set<string>>();
            const primaryArtistToTracksMap = new Map<string, Set<string>>();
            const skippedRelationships: Array<{
                trackName: string;
                artistName: string;
                reason: string;
            }> = [];
        
            for(const album of albums) {
                const primarySpotifyArtists = new Set<string>(album.artists.map(a => a.id));
                for(const track of album.tracks.items) {
                for(const artist of track.artists) {
                    const artistId = spotifyIdToArtistId.get(artist.id);
                    const trackId = fullTrackMap.get(track.id)?.id;
                    if(!trackId) {
                    skippedRelationships.push({
                        trackName: track.name,
                        artistName: artist.name,
                        reason: 'Track not found in fullTrackMap'
                    });
                    continue;
                    }
                    if(!artistId) {
                    skippedRelationships.push({
                        trackName: track.name,
                        artistName: artist.name,
                        reason: 'Artist not found in spotifyIdToArtistId'
                    });
                    continue;
                    }
                    if(artistId && trackId) {
                    if(!artistToTracksMap.has(artistId)) {
                        artistToTracksMap.set(artistId, new Set<string>());
                    }
                    artistToTracksMap.get(artistId)!.add(trackId);
                    }
                    if(primarySpotifyArtists.has(artist.id) && artistId && trackId) {
                    if(!primaryArtistToTracksMap.has(artistId)) {
                        primaryArtistToTracksMap.set(artistId, new Set<string>());
                    }
                    primaryArtistToTracksMap.get(artistId)!.add(trackId);
                    }
                }
                }
            }
            if(skippedRelationships.length > 0) {
                console.warn(
                `Skipped ${skippedRelationships.length} track-artist relationships:`,
                skippedRelationships
                );
            }
        
            /* Track-Artist Joins */
            const existingTrackArtistJoins = await tx.trackArtist.findMany({
                where: {
                artistId: { in: Array.from(artistToTracksMap.keys()) },
                }
            });
            const trackArtistJoinsToUpdate = new Map<string, Set<string>>();
            const trackArtistJoinsToDelete = new Map<string, Set<string>>();
        
            existingTrackArtistJoins
            .filter(existingJoin => {
                const isOutdated = existingJoin.updatedAt < new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // 60 days
                if(isOutdated)
                return true;
                const isPrimaryRole = primaryArtistToTracksMap.has(existingJoin.artistId) && primaryArtistToTracksMap.get(existingJoin.artistId)!.has(existingJoin.trackId);
                const isInvalidRole = (existingJoin.role !== TrackArtistRole.PRIMARY && isPrimaryRole)
                if(isInvalidRole)
                return true;
            })
            .forEach(existingJoin => {
                /* Exists in old set and new set: update */
                if(artistToTracksMap.has(existingJoin.artistId) && artistToTracksMap.get(existingJoin.artistId)!.has(existingJoin.trackId)) {
                if(!trackArtistJoinsToUpdate.has(existingJoin.artistId)) {
                    trackArtistJoinsToUpdate.set(existingJoin.artistId, new Set<string>());
                }
                trackArtistJoinsToUpdate.get(existingJoin.artistId)!.add(existingJoin.trackId);
                }
                /* Exists in old set but not in new set: delete */
                else if(!artistToTracksMap.has(existingJoin.artistId) || !artistToTracksMap.get(existingJoin.artistId)!.has(existingJoin.trackId)) {
                if(!trackArtistJoinsToDelete.has(existingJoin.artistId)) {
                    trackArtistJoinsToDelete.set(existingJoin.artistId, new Set<string>());
                }
                trackArtistJoinsToDelete.get(existingJoin.artistId)!.add(existingJoin.trackId);
                }
            })
        
            const trackArtistJoinsToCreate = new Map<string, Set<string>>();
        
            for(const [artistId, trackIds] of artistToTracksMap.entries()) {
                for(const trackId of trackIds) {
                if(trackArtistJoinsToUpdate.has(artistId) && trackArtistJoinsToUpdate.get(artistId)!.has(trackId)) {
                    continue;
                }
                else if(trackArtistJoinsToDelete.has(artistId) && trackArtistJoinsToDelete.get(artistId)!.has(trackId)) {
                    continue;
                } 
                else {
                    if(!trackArtistJoinsToCreate.has(artistId)) {
                    trackArtistJoinsToCreate.set(artistId, new Set<string>());
                    }
                    trackArtistJoinsToCreate.get(artistId)!.add(trackId);
                }
                }
            }
        
            /* Query 4: Create new track-artist joins, delete invalid ones, and update existing ones */
            try {
                /* Deletes */
                for(const [artistId, trackIds] of trackArtistJoinsToDelete.entries()) {
                    for(const trackId of trackIds) {
                        const deletedTrackArtistJoins = await tx.trackArtist.deleteMany({
                        where: {
                            artistId,
                            trackId,
                        }
                        });
                        //console.log(`Deleted ${deletedTrackArtistJoins.count} track-artist joins for artistId: ${artistId}, trackId: ${trackId}`);
                    }  
                }
                /* Updates */
                for(const [artistId, trackIds] of trackArtistJoinsToUpdate.entries()) {
                    for(const trackId of trackIds) {
                        const isPrimary = primaryArtistToTracksMap.has(artistId) && primaryArtistToTracksMap.get(artistId)!.has(trackId);
                        const updatedTrackArtistJoins = await tx.trackArtist.updateMany({
                            where: {
                                artistId,
                                trackId,
                            },
                            data: {
                                role: isPrimary ? TrackArtistRole.PRIMARY : TrackArtistRole.FEATURED,
                            }
                        });
                        //console.log(`Updated ${updatedTrackArtistJoins.count} track-artist joins for artistId: ${artistId}, trackId: ${trackId}`);
                    }
                }
                /* Creates */
                const createdTrackArtistJoins = await tx.trackArtist.createMany({
                    data: Array.from(trackArtistJoinsToCreate.entries()).flatMap(([artistId, trackIds]) => 
                        Array.from(trackIds).map(trackId => {
                        const isPrimary = primaryArtistToTracksMap.has(artistId) && primaryArtistToTracksMap.get(artistId)!.has(trackId);
                        return {
                            artistId,
                            trackId,
                            role: isPrimary ? TrackArtistRole.PRIMARY : TrackArtistRole.FEATURED,
                        };
                        })
                    ),
                    skipDuplicates: true,
                });
                //console.log(`Created ${createdTrackArtistJoins.count} new track-artist joins.`);

                /* Finally, update track-artist statuses */
                const trackIds = Array.from(fullTrackMap.values()).map(track => track.id);
                await tx.track.updateMany({
                    where: { id: { in: trackIds } },
                    data: { 
                        artistsStatus: TrackArtistsStatus.COMPLETE 
                    },
                });
                //console.log(`Updated ${updatedTracks.count} tracks to COMPLETE artistsStatus.`);
                await tx.artist.update({
                  where: { id: spotifyIdToArtistId.get(artistSpotifyId)! },
                  data: {
                    tracksStatus: 'COMPLETE',
                  },
                })
                
        
            } catch(error) {
                throw new Error("Error creating/updating track-artist joins: " + error);
            }
            
        });
    });
}