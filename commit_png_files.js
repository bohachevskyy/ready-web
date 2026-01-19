const fs = require('fs');
const path = require('path');

// Read PNG files and prepare base64 for GitHub API
const publicDir = path.join(__dirname, 'public');
const files = [
  'apple-touch-icon.png',
  'favicon-192.png',
  'favicon-512.png',
  'favicon.ico'
];

const fileContents = [];

files.forEach(filename => {
  const filePath = path.join(publicDir, filename);
  if (fs.existsSync(filePath)) {
    const buffer = fs.readFileSync(filePath);
    const base64 = buffer.toString('base64');
    fileContents.push({
      path: `public/${filename}`,
      content: base64
    });
    console.log(`✓ Read ${filename} (${(buffer.length / 1024).toFixed(2)} KB)`);
  } else {
    console.error(`✗ File not found: ${filename}`);
  }
});

// Output JSON for GitHub API
console.log('\nFiles ready for GitHub API:');
console.log(JSON.stringify(fileContents.map(f => ({ path: f.path, size: f.content.length })), null, 2));

// Save to a file that can be used
const output = {
  files: fileContents
};
fs.writeFileSync(path.join(__dirname, 'png_files_data.json'), JSON.stringify(output, null, 2));
console.log('\n✓ Saved file data to png_files_data.json');
