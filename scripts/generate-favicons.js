const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

async function generateFavicons() {
  // Read the main SVG file
  const svgPath = path.join(publicDir, 'favicon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  // Read the apple touch icon SVG
  const appleSvgPath = path.join(publicDir, 'apple-touch-icon.svg');
  const appleSvgBuffer = fs.readFileSync(appleSvgPath);

  console.log('Generating favicon-512.png...');
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'favicon-512.png'));

  console.log('Generating favicon-192.png...');
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'favicon-192.png'));

  console.log('Generating apple-touch-icon.png...');
  await sharp(appleSvgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  console.log('Generating favicon.ico (32x32 PNG as ICO)...');
  // Generate a 32x32 PNG for favicon.ico
  // Note: sharp doesn't support ICO natively, so we'll create a multi-size PNG
  // and rename it, or use a simpler approach with just 32x32
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32.png'));

  // For proper ICO, we'll create multiple sizes and combine them
  // Using sharp to create the base images
  const sizes = [16, 32, 48];
  const icoImages = [];
  
  for (const size of sizes) {
    const buffer = await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toBuffer();
    icoImages.push({ size, buffer });
  }

  // Create a simple ICO file manually
  // ICO format: header + directory entries + image data
  const numImages = icoImages.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = numImages * dirEntrySize;
  
  let offset = headerSize + dirSize;
  const dirEntries = [];
  
  for (const img of icoImages) {
    dirEntries.push({
      width: img.size,
      height: img.size,
      offset: offset,
      size: img.buffer.length
    });
    offset += img.buffer.length;
  }
  
  // Build ICO header
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);      // Reserved
  header.writeUInt16LE(1, 2);      // Type: 1 = ICO
  header.writeUInt16LE(numImages, 4); // Number of images
  
  // Build directory entries
  const directory = Buffer.alloc(dirSize);
  for (let i = 0; i < dirEntries.length; i++) {
    const entry = dirEntries[i];
    const entryOffset = i * dirEntrySize;
    directory.writeUInt8(entry.width === 256 ? 0 : entry.width, entryOffset);     // Width
    directory.writeUInt8(entry.height === 256 ? 0 : entry.height, entryOffset + 1); // Height
    directory.writeUInt8(0, entryOffset + 2);    // Color palette
    directory.writeUInt8(0, entryOffset + 3);    // Reserved
    directory.writeUInt16LE(1, entryOffset + 4); // Color planes
    directory.writeUInt16LE(32, entryOffset + 6); // Bits per pixel
    directory.writeUInt32LE(entry.size, entryOffset + 8);   // Image size
    directory.writeUInt32LE(entry.offset, entryOffset + 12); // Image offset
  }
  
  // Combine all parts
  const icoBuffer = Buffer.concat([
    header,
    directory,
    ...icoImages.map(img => img.buffer)
  ]);
  
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  
  // Clean up temp file
  fs.unlinkSync(path.join(publicDir, 'favicon-32.png'));

  console.log('All favicons generated successfully!');
}

generateFavicons().catch(err => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});
