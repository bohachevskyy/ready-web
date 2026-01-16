const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const buildPath = path.join(__dirname, 'build');

console.log('Starting server...');
console.log('PORT:', PORT);
console.log('Build path:', buildPath);
console.log('Build exists:', fs.existsSync(buildPath));

// Check if build directory exists
if (!fs.existsSync(buildPath)) {
  console.error('ERROR: Build directory does not exist! Run npm run build first.');
  process.exit(1);
}

// Serve static files from the build directory
app.use(express.static(buildPath));

// Handle React routing - return index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
