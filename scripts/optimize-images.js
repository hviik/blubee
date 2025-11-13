const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const config = {
  png: {
    quality: 90,
    compressionLevel: 9,
    adaptiveFiltering: true,
  },
  jpg: {
    quality: 90,
    mozjpeg: true,
  },
};

const filesToOptimize = [
  'public/assets/destinations/brazil.png',
  'public/assets/destinations/india.png',
  'public/assets/destinations/laos.png',
  'public/assets/destinations/malaysia.png',
  'public/assets/destinations/maldives.png',
  'public/assets/destinations/peru.png',
  'public/assets/destinations/philippines.png',
  'public/assets/destinations/vietnam.png',
  'public/assets/cloud.png',
  'public/assets/flags/brazil.png',
  'public/assets/flags/peru.png',
  'public/assets/flags/philippines.png',
  'public/assets/favicon/android-chrome-192x192.png',
  'public/assets/favicon/android-chrome-512x512.png',
  'public/assets/favicon/apple-touch-icon.png',
];

async function optimizeImage(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      return;
    }

    const stats = fs.statSync(fullPath);
    const originalSize = stats.size;
    const backupPath = fullPath + '.backup';
    fs.copyFileSync(fullPath, backupPath);

    await sharp(fullPath)
      .png({
        quality: config.png.quality,
        compressionLevel: config.png.compressionLevel,
        adaptiveFiltering: config.png.adaptiveFiltering,
      })
      .toFile(fullPath + '.optimized');
    
    fs.renameSync(fullPath + '.optimized', fullPath);
    
    const newStats = fs.statSync(fullPath);
    const newSize = newStats.size;

    if (newSize < originalSize) {
      fs.unlinkSync(backupPath);
    } else {
      fs.copyFileSync(backupPath, fullPath);
      fs.unlinkSync(backupPath);
    }
  } catch (error) {
    return;
  }
}

async function optimizeAll() {
  for (const file of filesToOptimize) {
    await optimizeImage(file);
  }
}

optimizeAll();
