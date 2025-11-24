/* eslint-disable @typescript-eslint/no-explicit-any */
import "dotenv/config";

import { prisma } from '@/lib/db';

import fs from 'fs';
import path from 'path';

interface ExportData {
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

async function exportDatabase() {
  try {
    console.log('Starting database export...\n');
    console.log('DATABASE_URL:', process.env.OLD_DATABASE_URL ? 'Set' : 'NOT SET');
    console.log('Prisma client:', prisma ? 'Connected' : 'Not connected');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportDir = path.join(process.cwd(), `db-export-${timestamp}`);
    
    // Create export directory
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const exportData: ExportData = {
      user: [],
      account: [],
      session: [],
      verification: [],
      dbProfilePicture: [],
      dbArtist: [],
      dbGenre: [],
      dbArtistImg: [],
      dbAlbum: [],
      dbAlbumImg: [],
      dbTrack: [],
      dbSorting: [],
      dbSortingEntry: [],
      dbFavoriteArtist: [],
    };

    // Export user
    try {
      const data = await prisma.user.findMany();
      exportData.user = data;
      console.log(`✓ Exported user: ${data.length} records`);
      fs.writeFileSync(path.join(exportDir, 'user.json'), JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('✗ Error exporting user:', error);
    }

    // Export account
    try {
      const data = await prisma.account.findMany();
      exportData.account = data;
      console.log(`✓ Exported account: ${data.length} records`);
      fs.writeFileSync(path.join(exportDir, 'account.json'), JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('✗ Error exporting account:', error);
    }

    // Export session
    try {
      const data = await prisma.session.findMany();
      exportData.session = data;
      console.log(`✓ Exported session: ${data.length} records`);
      fs.writeFileSync(path.join(exportDir, 'session.json'), JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('✗ Error exporting session:', error);
    }

    // Export verification
    try {
      const data = await prisma.verification.findMany();
      exportData.verification = data;
      console.log(`✓ Exported verification: ${data.length} records`);
      fs.writeFileSync(path.join(exportDir, 'verification.json'), JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('✗ Error exporting verification:', error);
    }

    // Export dbProfilePicture
    try {
      const data = await prisma.dBProfilePicture.findMany();
      exportData.dbProfilePicture = data;
      console.log(`✓ Exported dbProfilePicture: ${data.length} records`);
      fs.writeFileSync(path.join(exportDir, 'dbProfilePicture.json'), JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('✗ Error exporting dbProfilePicture:', error);
    }

    // Export dbArtist
    try {
      const data = await prisma.dBArtist.findMany();
      exportData.dbArtist = data;
      console.log(`✓ Exported dbArtist: ${data.length} records`);
      fs.writeFileSync(path.join(exportDir, 'dbArtist.json'), JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('✗ Error exporting dbArtist:', error);
    }

    // Export dbGenre
    try {
      const data = await prisma.dBGenre.findMany();
      exportData.dbGenre = data;
      console.log(`✓ Exported dbGenre: ${data.length} records`);
      fs.writeFileSync(path.join(exportDir, 'dbGenre.json'), JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('✗ Error exporting dbGenre:', error);
    }

    // Export dbArtistImg
    try {
      const data = await prisma.dBArtistImg.findMany();
      exportData.dbArtistImg = data;
      console.log(`✓ Exported dbArtistImg: ${data.length} records`);
      fs.writeFileSync(path.join(exportDir, 'dbArtistImg.json'), JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('✗ Error exporting dbArtistImg:', error);
    }

    // Export dbAlbum
    try {
      const data = await prisma.dBAlbum.findMany();
      exportData.dbAlbum = data;
      console.log(`✓ Exported dbAlbum: ${data.length} records`);
      fs.writeFileSync(path.join(exportDir, 'dbAlbum.json'), JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('✗ Error exporting dbAlbum:', error);
    }

    // Export dbAlbumImg
    try {
      const data = await prisma.dBAlbumImg.findMany();
      exportData.dbAlbumImg = data;
      console.log(`✓ Exported dbAlbumImg: ${data.length} records`);
      fs.writeFileSync(path.join(exportDir, 'dbAlbumImg.json'), JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('✗ Error exporting dbAlbumImg:', error);
    }

    // Export dbTrack
    try {
      const data = await prisma.dBTrack.findMany({
        include: {
          artists: true, // Include related artists
          album: true,
          sortingEntries: true,
          images: true,
          sortings: true
        }
      });
      exportData.dbTrack = data;
      console.log(`✓ Exported dbTrack: ${data.length} records`);
      fs.writeFileSync(path.join(exportDir, 'dbTrack.json'), JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('✗ Error exporting dbTrack:', error);
    }

    // Export dbSorting
    try {
      const data = await prisma.dBSorting.findMany();
      exportData.dbSorting = data;
      console.log(`✓ Exported dbSorting: ${data.length} records`);
      fs.writeFileSync(path.join(exportDir, 'dbSorting.json'), JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('✗ Error exporting dbSorting:', error);
    }

    // Export dbSortingEntry
    try {
      const data = await prisma.dBSortingEntry.findMany();
      exportData.dbSortingEntry = data;
      console.log(`✓ Exported dbSortingEntry: ${data.length} records`);
      fs.writeFileSync(path.join(exportDir, 'dbSortingEntry.json'), JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('✗ Error exporting dbSortingEntry:', error);
    }

    // Export dbFavoriteArtist
    try {
      const data = await prisma.dBFavoriteArtist.findMany();
      exportData.dbFavoriteArtist = data;
      console.log(`✓ Exported dbFavoriteArtist: ${data.length} records`);
      fs.writeFileSync(path.join(exportDir, 'dbFavoriteArtist.json'), JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('✗ Error exporting dbFavoriteArtist:', error);
    }

    // Save combined export file
    const combinedFilePath = path.join(exportDir, 'full-export.json');
    fs.writeFileSync(combinedFilePath, JSON.stringify(exportData, null, 2));

    console.log(`\n✓ Export complete!`);
    console.log(`📁 Files saved to: ${exportDir}`);
    console.log(`📄 Combined export: ${combinedFilePath}`);

  } catch (error) {
    console.error('Fatal error during export:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportDatabase();