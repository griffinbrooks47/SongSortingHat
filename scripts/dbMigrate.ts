/* eslint-disable @typescript-eslint/no-explicit-any */
import "dotenv/config";
import { prisma } from "@/lib/db"
import fs from 'fs';
import path from 'path';

interface ImportData {
  user: any[];
  account: any[];
  session: any[];
  verification: any[];
  dbProfilePicture: any[];
  dbArtist: any[];
  dbGenre: any[];
  dbArtistImg: any[];
  dbAlbum: any[];
  dbAlbumImg: any[];
  dbTrack: any[];
  dbSorting: any[];
  dbSortingEntry: any[];
  dbFavoriteArtist: any[];
}

async function importDatabase(exportPath: string) {
  try {
    console.log(`Starting database import from: ${exportPath}\n`);
    console.log('⚠️  WARNING: This will DELETE all existing data and replace it with imported data!\n');

    const fullExportPath = path.join(exportPath, 'full-export.json');
    
    if (!fs.existsSync(fullExportPath)) {
      throw new Error(`Export file not found: ${fullExportPath}`);
    }

    const rawData = fs.readFileSync(fullExportPath, 'utf-8');
    const data: ImportData = JSON.parse(rawData);

    // Clear all tables (order matters due to foreign keys)
    console.log('Clearing existing data...\n');
    
    await prisma.dBSortingEntry.deleteMany({});
    console.log('✓ Cleared dbSortingEntry');
    
    await prisma.dBFavoriteArtist.deleteMany({});
    console.log('✓ Cleared dbFavoriteArtist');
    
    await prisma.dBSorting.deleteMany({});
    console.log('✓ Cleared dbSorting');
    
    await prisma.session.deleteMany({});
    console.log('✓ Cleared session');
    
    await prisma.account.deleteMany({});
    console.log('✓ Cleared account');
    
    await prisma.dBAlbumImg.deleteMany({});
    console.log('✓ Cleared dbAlbumImg');
    
    await prisma.dBTrack.deleteMany({});
    console.log('✓ Cleared dbTrack');
    
    await prisma.dBArtistImg.deleteMany({});
    console.log('✓ Cleared dbArtistImg');
    
    await prisma.dBAlbum.deleteMany({});
    console.log('✓ Cleared dbAlbum');
    
    await prisma.dBGenre.deleteMany({});
    console.log('✓ Cleared dbGenre');
    
    await prisma.dBArtist.deleteMany({});
    console.log('✓ Cleared dbArtist');
    
    await prisma.verification.deleteMany({});
    console.log('✓ Cleared verification');
    
    await prisma.user.deleteMany({});
    console.log('✓ Cleared user\n');

    // Import user
    if (data.user && data.user.length > 0) {
      try {
        for (const record of data.user) {
          await prisma.user.create({ data: record });
        }
        console.log(`✓ Imported user: ${data.user.length} records`);
      } catch (error) {
        console.error('✗ Error importing user:', error);
      }
    }

    // Import account
    if (data.account && data.account.length > 0) {
      try {
        for (const record of data.account) {
          await prisma.account.create({ data: record });
        }
        console.log(`✓ Imported account: ${data.account.length} records`);
      } catch (error) {
        console.error('✗ Error importing account:', error);
      }
    }

    // Import session
    if (data.session && data.session.length > 0) {
      try {
        for (const record of data.session) {
          await prisma.session.create({ data: record });
        }
        console.log(`✓ Imported session: ${data.session.length} records`);
      } catch (error) {
        console.error('✗ Error importing session:', error);
      }
    }

    // Import verification
    if (data.verification && data.verification.length > 0) {
      try {
        for (const record of data.verification) {
          await prisma.verification.create({ data: record });
        }
        console.log(`✓ Imported verification: ${data.verification.length} records`);
      } catch (error) {
        console.error('✗ Error importing verification:', error);
      }
    }

    // Import dbArtist
    if (data.dbArtist && data.dbArtist.length > 0) {
      try {
        for (const record of data.dbArtist) {
          await prisma.dBArtist.create({ data: record });
        }
        console.log(`✓ Imported dbArtist: ${data.dbArtist.length} records`);
      } catch (error) {
        console.error('✗ Error importing dbArtist:', error);
      }
    }

    // Import dbGenre
    if (data.dbGenre && data.dbGenre.length > 0) {
      try {
        for (const record of data.dbGenre) {
          await prisma.dBGenre.create({ data: record });
        }
        console.log(`✓ Imported dbGenre: ${data.dbGenre.length} records`);
      } catch (error) {
        console.error('✗ Error importing dbGenre:', error);
      }
    }

    // Import dbArtistImg
    if (data.dbArtistImg && data.dbArtistImg.length > 0) {
      try {
        for (const record of data.dbArtistImg) {
          await prisma.dBArtistImg.create({ data: record });
        }
        console.log(`✓ Imported dbArtistImg: ${data.dbArtistImg.length} records`);
      } catch (error) {
        console.error('✗ Error importing dbArtistImg:', error);
      }
    }

    // Import dbAlbum
    if (data.dbAlbum && data.dbAlbum.length > 0) {
      try {
        for (const record of data.dbAlbum) {
          await prisma.dBAlbum.create({ data: record });
        }
        console.log(`✓ Imported dbAlbum: ${data.dbAlbum.length} records`);
      } catch (error) {
        console.error('✗ Error importing dbAlbum:', error);
      }
    }

    // Import dbAlbumImg
    if (data.dbAlbumImg && data.dbAlbumImg.length > 0) {
      try {
        for (const record of data.dbAlbumImg) {
          await prisma.dBAlbumImg.create({ data: record });
        }
        console.log(`✓ Imported dbAlbumImg: ${data.dbAlbumImg.length} records`);
      } catch (error) {
        console.error('✗ Error importing dbAlbumImg:', error);
      }
    }

    // Import dbTrack - strip all nested relations
    if (data.dbTrack && data.dbTrack.length > 0) {
      try {
        for (const record of data.dbTrack) {
          const { artists, album, sortingEntries, images, sortings, ...trackData } = record;
          await prisma.dBTrack.create({
            data: {
              ...trackData,
              artists: {
                connect: (artists || []).map((artist: any) => ({ id: artist.id }))
              }
            }
          });
        }
        console.log(`✓ Imported dbTrack: ${data.dbTrack.length} records`);
      } catch (error) {
        console.error('✗ Error importing dbTrack:', error);
      }
    }

    // Import dbSorting - strip nested relations
    if (data.dbSorting && data.dbSorting.length > 0) {
      try {
        for (const record of data.dbSorting) {
          const { entries, tracks, ...sortingData } = record;
          await prisma.dBSorting.create({ data: sortingData });
        }
        console.log(`✓ Imported dbSorting: ${data.dbSorting.length} records`);
      } catch (error) {
        console.error('✗ Error importing dbSorting:', error);
      }
    }

    // Import dbSortingEntry
    if (data.dbSortingEntry && data.dbSortingEntry.length > 0) {
      try {
        for (const record of data.dbSortingEntry) {
          await prisma.dBSortingEntry.create({ data: record });
        }
        console.log(`✓ Imported dbSortingEntry: ${data.dbSortingEntry.length} records`);
      } catch (error) {
        console.error('✗ Error importing dbSortingEntry:', error);
      }
    }

    // Import dbFavoriteArtist
    if (data.dbFavoriteArtist && data.dbFavoriteArtist.length > 0) {
      try {
        for (const record of data.dbFavoriteArtist) {
          await prisma.dBFavoriteArtist.create({ data: record });
        }
        console.log(`✓ Imported dbFavoriteArtist: ${data.dbFavoriteArtist.length} records`);
      } catch (error) {
        console.error('✗ Error importing dbFavoriteArtist:', error);
      }
    }

    console.log(`\n✓ Import complete!`);

  } catch (error) {
    console.error('Fatal error during import:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get the export path from command line arguments
const exportPath = process.argv[2];
if (!exportPath) {
  console.error('Usage: npx tsx scripts/dbImport.ts <path-to-export-directory>');
  console.error('Example: npx tsx scripts/dbImport.ts ./db-export-2025-11-22T20-12-33-122Z');
  process.exit(1);
}

importDatabase(exportPath);