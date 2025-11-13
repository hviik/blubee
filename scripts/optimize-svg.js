const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function optimizeSVG(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      return;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const stats = fs.statSync(fullPath);
    const originalSize = stats.size;
    const base64Match = content.match(/data:image\/(png|jpeg|jpg);base64,([^"']+)/i);
    
    if (base64Match) {
      const imageFormat = base64Match[1];
      const base64Data = base64Match[2];
      const imageBuffer = Buffer.from(base64Data, 'base64');
      const backupPath = fullPath + '.backup';
      fs.copyFileSync(fullPath, backupPath);

      const optimizedBuffer = await sharp(imageBuffer)
        .png({
          quality: 85,
          compressionLevel: 9,
        })
        .toBuffer();
      
      const optimizedBase64 = optimizedBuffer.toString('base64');
      const optimizedContent = content.replace(
        base64Match[0],
        `data:image/png;base64,${optimizedBase64}`
      );

      fs.writeFileSync(fullPath, optimizedContent, 'utf8');
      
      const newStats = fs.statSync(fullPath);
      const newSize = newStats.size;

      if (newSize < originalSize) {
        fs.unlinkSync(backupPath);
      } else {
        fs.copyFileSync(backupPath, fullPath);
        fs.unlinkSync(backupPath);
      }
    }
  } catch (error) {
    return;
  }
}

async function optimizeAllSVGs() {
  const svgFiles = [
    'public/assets/997.svg',
  ];
  
  for (const file of svgFiles) {
    await optimizeSVG(file);
  }
}

optimizeAllSVGs();
