// ============================================
// FILE: scripts/cleanup-unused-artists.ts
// ============================================
// Run with: npx tsx scripts/cleanup-unused-artists.ts
// Or add to package.json scripts: "cleanup:artists": "tsx scripts/cleanup-unused-artists.ts"

import { prisma } from "@/lib/db";

/**
 * Cleans all nested relational data (albums, tracks, images) 
 * for artists that don't have any sortings created by users
 * KEEPS the artist record itself
 */
async function cleanupUnusedArtistData(dryRun: boolean = true) {
  console.log('🔍 Starting cleanup process...');
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE (will delete data)'}\n`);

  try {
    // Step 1: Find all artists that have NO sortings
    const artistsWithoutSortings = await prisma.dBArtist.findMany({
      where: {
        sortings: {
          none: {} // Artists with zero sortings
        }
      },
      select: {
        id: true,
        spotifyId: true,
        name: true,
        _count: {
          select: {
            albums: true,
            tracks: true,
            images: true,
            sortings: true,
          }
        }
      }
    });

    console.log(`📊 Found ${artistsWithoutSortings.length} artists without sortings:\n`);

    if (artistsWithoutSortings.length === 0) {
      console.log('✅ No unused artists to clean up!');
      return;
    }

    // Display what will be deleted
    let totalAlbums = 0;
    let totalTracks = 0;
    let totalImages = 0;

    artistsWithoutSortings.forEach((artist, index) => {
      console.log(`${index + 1}. ${artist.name} (${artist.spotifyId})`);
      console.log(`   - Albums: ${artist._count.albums}`);
      console.log(`   - Tracks: ${artist._count.tracks}`);
      console.log(`   - Images: ${artist._count.images}`);
      console.log(`   - Sortings: ${artist._count.sortings}\n`);

      totalAlbums += artist._count.albums;
      totalTracks += artist._count.tracks;
      totalImages += artist._count.images;
    });

    console.log('📈 Summary:');
    console.log(`   Artists to clean (keeping artist record): ${artistsWithoutSortings.length}`);
    console.log(`   Total albums to remove: ${totalAlbums}`);
    console.log(`   Total tracks to remove: ${totalTracks}`);
    console.log(`   Total artist images to delete: ${totalImages}\n`);

    if (dryRun) {
      console.log('⚠️  DRY RUN MODE - No data was deleted');
      console.log('   Run with --live to actually delete this data\n');
      return;
    }

    // Step 2: Clean nested data for each artist
    console.log('🗑️  Starting cleanup process...\n');

    const artistIds = artistsWithoutSortings.map(a => a.id);

    // Get all albums for these artists (need to handle many-to-many)
    const albumsToClean = await prisma.dBAlbum.findMany({
      where: {
        artists: {
          some: {
            id: { in: artistIds }
          }
        }
      },
      select: {
        id: true,
        spotifyId: true,
        title: true,
        _count: {
          select: {
            artists: true
          }
        }
      }
    });

    // Separate albums: those that ONLY belong to artists being cleaned vs shared albums
    const albumsToDelete = albumsToClean.filter(a => a._count.artists === 1);
    const sharedAlbums = albumsToClean.filter(a => a._count.artists > 1);

    console.log(`   Albums exclusively owned: ${albumsToDelete.length} (will be deleted)`);
    console.log(`   Shared albums: ${sharedAlbums.length} (will only disconnect artist)\n`);

    let cleanedCount = 0;

    for (const artist of artistsWithoutSortings) {
      await prisma.$transaction(async (tx) => {
        console.log(`   Processing: ${artist.name}...`);

        // 1. Delete artist images
        const deletedArtistImages = await tx.dBArtistImg.deleteMany({
          where: { artistId: artist.id }
        });
        console.log(`     - Deleted ${deletedArtistImages.count} artist images`);

        // 2. Get tracks for this artist
        const artistTracks = await tx.dBTrack.findMany({
          where: {
            artists: {
              some: { id: artist.id }
            }
          },
          select: {
            id: true,
            _count: { select: { artists: true } }
          }
        });

        const exclusiveTracks = artistTracks.filter(t => t._count.artists === 1);
        const sharedTracks = artistTracks.filter(t => t._count.artists > 1);

        // 3. Get albums for this artist
        const artistAlbums = await tx.dBAlbum.findMany({
          where: {
            artists: {
              some: { id: artist.id }
            }
          },
          select: {
            id: true,
            _count: { select: { artists: true } }
          }
        });

        const exclusiveAlbums = artistAlbums.filter(a => a._count.artists === 1);
        const sharedAlbums = artistAlbums.filter(a => a._count.artists > 1);

        // 4. Delete album images for exclusive albums
        if (exclusiveAlbums.length > 0) {
          const deletedAlbumImages = await tx.dBAlbumImg.deleteMany({
            where: {
              albumId: { in: exclusiveAlbums.map(a => a.id) }
            }
          });
          console.log(`     - Deleted ${deletedAlbumImages.count} album images`);
        }

        // 5. Delete exclusive tracks
        if (exclusiveTracks.length > 0) {
          const deletedTracks = await tx.dBTrack.deleteMany({
            where: {
              id: { in: exclusiveTracks.map(t => t.id) }
            }
          });
          console.log(`     - Deleted ${deletedTracks.count} exclusive tracks`);
        }

        // 6. Disconnect shared tracks
        for (const track of sharedTracks) {
          await tx.dBTrack.update({
            where: { id: track.id },
            data: {
              artists: {
                disconnect: { id: artist.id }
              }
            }
          });
        }
        if (sharedTracks.length > 0) {
          console.log(`     - Disconnected from ${sharedTracks.length} shared tracks`);
        }

        // 7. Delete exclusive albums
        if (exclusiveAlbums.length > 0) {
          const deletedAlbums = await tx.dBAlbum.deleteMany({
            where: {
              id: { in: exclusiveAlbums.map(a => a.id) }
            }
          });
          console.log(`     - Deleted ${deletedAlbums.count} exclusive albums`);
        }

        // 8. Disconnect shared albums
        for (const album of sharedAlbums) {
          await tx.dBAlbum.update({
            where: { id: album.id },
            data: {
              artists: {
                disconnect: { id: artist.id }
              }
            }
          });
        }
        if (sharedAlbums.length > 0) {
          console.log(`     - Disconnected from ${sharedAlbums.length} shared albums`);
        }

        // 9. Reset sync status
        await tx.dBArtist.update({
          where: { id: artist.id },
          data: {
            tracks_sync_status: 'pending',
            tracks_synced_at: null
          }
        });

        console.log(`     ✓ Cleaned data for ${artist.name} (artist record kept)\n`);
      },
      {
        timeout: 300_000, // 5 minutes
      }
    );
      cleanedCount++;
    }


    console.log(`✅ Successfully cleaned ${cleanedCount} artists (kept artist records)`);
  

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const isLive = args.includes('--live') || args.includes('--force');

  if (isLive) {
    console.log('⚠️  WARNING: Running in LIVE mode. Data will be permanently deleted!\n');
    console.log('Note: Artist records will be KEPT, only their albums/tracks/images will be removed.\n');
    
    // Optional: Add confirmation prompt using dynamic import
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Type "CLEAN" to confirm: ', async (answer: string) => {
      rl.close();
      
      if (answer === 'CLEAN') {
        await cleanupUnusedArtistData(false);
      } else {
        console.log('❌ Cancelled. Data was not deleted.');
      }
    });
  } else {
    // Dry run by default
    await cleanupUnusedArtistData(true);
    console.log('💡 To actually delete the data, run: npx tsx scripts/cleanup-unused-artists.ts --live');
  }
}

export { cleanupUnusedArtistData };

// Run the script
main().catch(console.error);


// ============================================
// BONUS: Clean a specific artist by Spotify ID
// ============================================
/**
 * Clean data for a specific artist by their Spotify ID
 */
export async function cleanupSpecificArtist(spotifyId: string, dryRun: boolean = true) {
  console.log(`🔍 Cleaning data for artist: ${spotifyId}\n`);

  const artist = await prisma.dBArtist.findUnique({
    where: { spotifyId },
    select: {
      id: true,
      spotifyId: true,
      name: true,
      _count: {
        select: {
          albums: true,
          tracks: true,
          images: true,
          sortings: true,
        }
      }
    }
  });

  if (!artist) {
    console.log('❌ Artist not found');
    return;
  }

  console.log(`Artist: ${artist.name}`);
  console.log(`- Albums: ${artist._count.albums}`);
  console.log(`- Tracks: ${artist._count.tracks}`);
  console.log(`- Images: ${artist._count.images}`);
  console.log(`- Sortings: ${artist._count.sortings}\n`);

  if (artist._count.sortings > 0) {
    console.log('⚠️  Warning: This artist has sortings. Consider if you want to delete their data.');
  }

  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No data was deleted\n');
    return;
  }

  // Use the same cleanup logic but for a single artist
  await prisma.$transaction(async (tx) => {
    // Delete artist images
    await tx.dBArtistImg.deleteMany({
      where: { artistId: artist.id }
    });

    // Get and handle tracks
    const tracks = await tx.dBTrack.findMany({
      where: {
        artists: { some: { id: artist.id } }
      },
      select: {
        id: true,
        _count: { select: { artists: true } }
      }
    });

    const exclusiveTracks = tracks.filter(t => t._count.artists === 1);
    const sharedTracks = tracks.filter(t => t._count.artists > 1);

    // Delete exclusive tracks
    if (exclusiveTracks.length > 0) {
      await tx.dBTrack.deleteMany({
        where: { id: { in: exclusiveTracks.map(t => t.id) } }
      });
    }

    // Disconnect from shared tracks
    for (const track of sharedTracks) {
      await tx.dBTrack.update({
        where: { id: track.id },
        data: { artists: { disconnect: { id: artist.id } } }
      });
    }

    // Get and handle albums
    const albums = await tx.dBAlbum.findMany({
      where: {
        artists: { some: { id: artist.id } }
      },
      select: {
        id: true,
        _count: { select: { artists: true } }
      }
    });

    const exclusiveAlbums = albums.filter(a => a._count.artists === 1);
    const sharedAlbums = albums.filter(a => a._count.artists > 1);

    // Delete album images for exclusive albums
    if (exclusiveAlbums.length > 0) {
      await tx.dBAlbumImg.deleteMany({
        where: { albumId: { in: exclusiveAlbums.map(a => a.id) } }
      });

      await tx.dBAlbum.deleteMany({
        where: { id: { in: exclusiveAlbums.map(a => a.id) } }
      });
    }

    // Disconnect from shared albums
    for (const album of sharedAlbums) {
      await tx.dBAlbum.update({
        where: { id: album.id },
        data: { artists: { disconnect: { id: artist.id } } }
      });
    }

    // Reset sync status
    await tx.dBArtist.update({
      where: { id: artist.id },
      data: {
        tracks_sync_status: 'pending',
        tracks_synced_at: null
      }
    });
  });

  console.log(`✅ Cleaned data for ${artist.name} (artist record kept)`);
}