const fs = require('fs');
const path = require('path');

// Read PNG files and prepare for GitHub API
const files = [
  'apple-touch-icon.png',
  'favicon-192.png',
  'favicon-512.png',
  'favicon.ico'
];

const publicDir = path.join(__dirname, 'public');
const fileData = [];

files.forEach(filename => {
  const filePath = path.join(publicDir, filename);
  if (fs.existsSync(filePath)) {
    const buffer = fs.readFileSync(filePath);
    const base64 = buffer.toString('base64');
    fileData.push({
      path: `public/${filename}`,
      content: base64
    });
    console.log(`✓ Read ${filename} (${buffer.length} bytes)`);
  } else {
    console.error(`✗ File not found: ${filename}`);
  }
});

console.log(`\nPrepared ${fileData.length} files for upload.`);
console.log('Files:', fileData.map(f => f.path).join(', '));
