// ============================================
// FILE: scripts/update-sync-status.ts
// ============================================
// Run with: npx tsx scripts/update-sync-status.ts

import { prisma } from "@/lib/db";

/**
 * Updates all existing artists with null sync status to 'completed'
 * This is a one-time migration script for existing data
 */
async function updateExistingArtistsSyncStatus() {
  console.log('🔍 Checking for artists with null sync status...\n');

  try {
    // First, count how many artists need updating
    const artistsToUpdate = await prisma.dBArtist.count({
      where: { tracks_sync_status: null }
    });

    console.log(`📊 Found ${artistsToUpdate} artists with null sync status\n`);

    if (artistsToUpdate === 0) {
      console.log('✅ All artists already have a sync status set!');
      return;
    }

    // Get a sample of artists that will be updated
    const sampleArtists = await prisma.dBArtist.findMany({
      where: { tracks_sync_status: null },
      take: 5,
      select: {
        name: true,
        spotifyId: true,
        _count: {
          select: {
            tracks: true,
            albums: true
          }
        }
      }
    });

    console.log('Sample artists to update:');
    sampleArtists.forEach((artist, index) => {
      console.log(`${index + 1}. ${artist.name} (${artist.spotifyId})`);
      console.log(`   - Tracks: ${artist._count.tracks}`);
      console.log(`   - Albums: ${artist._count.albums}\n`);
    });

    if (artistsToUpdate > 5) {
      console.log(`... and ${artistsToUpdate - 5} more\n`);
    }

    console.log('⚠️  About to update these artists to tracks_sync_status: "completed"\n');

    // Prompt for confirmation
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Type "UPDATE" to confirm: ', async (answer: string) => {
      rl.close();
      
      if (answer === 'UPDATE') {
        console.log('\n🔄 Updating artists...\n');
        
        const result = await prisma.dBArtist.updateMany({
          where: { tracks_sync_status: null },
          data: { 
            tracks_sync_status: 'completed',
            tracks_synced_at: new Date() // Also set the sync timestamp
          }
        });

        console.log(`✅ Successfully updated ${result.count} artists!`);
        console.log(`   All artists now have tracks_sync_status: "completed"\n`);
        
        await prisma.$disconnect();
      } else {
        console.log('❌ Cancelled. No updates were made.');
        await prisma.$disconnect();
      }
    });

  } catch (error) {
    console.error('❌ Error updating sync status:', error);
    await prisma.$disconnect();
    throw error;
  }
}

/**
 * Alternative: Set status based on whether tracks exist
 * Handles artists that already have 'pending' as default
 */
async function updateSyncStatusIntelligently() {
  console.log('🔍 Intelligently updating sync status based on track count...\n');

  try {
    // Get all artists with 'pending' or null status
    const artists = await prisma.dBArtist.findMany({
      where: { 
        OR: [
          { tracks_sync_status: 'pending' },
          { tracks_sync_status: null }
        ]
      },
      select: {
        id: true,
        name: true,
        spotifyId: true,
        tracks_sync_status: true,
        _count: {
          select: { tracks: true }
        }
      }
    });

    if (artists.length === 0) {
      console.log('✅ No artists with "pending" or null status found!');
      return;
    }

    console.log(`📊 Found ${artists.length} artists with "pending" or null status\n`);

    // Artists with tracks should be marked as completed
    const artistsWithTracks = artists.filter(a => a._count.tracks > 0);
    // Artists without tracks stay as pending
    const artistsWithoutTracks = artists.filter(a => a._count.tracks === 0);

    console.log(`   - ${artistsWithTracks.length} have tracks → will set to "completed"`);
    console.log(`   - ${artistsWithoutTracks.length} have no tracks → will remain "pending"\n`);

    if (artistsWithTracks.length === 0) {
      console.log('✅ No artists to update (all without tracks are already "pending")');
      return;
    }

    // Show sample of artists that will be updated
    console.log('Sample artists that will be marked as "completed":');
    artistsWithTracks.slice(0, 5).forEach((artist, index) => {
      console.log(`${index + 1}. ${artist.name} (${artist.spotifyId})`);
      console.log(`   - Tracks: ${artist._count.tracks}\n`);
    });

    if (artistsWithTracks.length > 5) {
      console.log(`... and ${artistsWithTracks.length - 5} more\n`);
    }

    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Type "UPDATE" to confirm: ', async (answer: string) => {
      rl.close();
      
      if (answer === 'UPDATE') {
        console.log('\n🔄 Updating artists with tracks to "completed"...\n');
        
        // Update artists with tracks to 'completed'
        const completedResult = await prisma.dBArtist.updateMany({
          where: { 
            id: { in: artistsWithTracks.map(a => a.id) }
          },
          data: { 
            tracks_sync_status: 'completed',
            tracks_synced_at: new Date()
          }
        });
        
        console.log(`✅ Set ${completedResult.count} artists to "completed"`);
        console.log(`ℹ️  ${artistsWithoutTracks.length} artists remain "pending" (no tracks yet)\n`);
        
        await prisma.$disconnect();
      } else {
        console.log('❌ Cancelled. No updates were made.');
        await prisma.$disconnect();
      }
    });

  } catch (error) {
    console.error('❌ Error updating sync status:', error);
    await prisma.$disconnect();
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const useIntelligent = args.includes('--smart') || args.includes('--intelligent');

  if (useIntelligent) {
    console.log('Using intelligent update (based on track count)\n');
    await updateSyncStatusIntelligently();
  } else {
    console.log('Using simple update (all to "completed")\n');
    await updateExistingArtistsSyncStatus();
  }
}

// Run the script
main().catch(console.error);