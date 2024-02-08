const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

// Serve the Declauncher launcher files
app.use('/launcher', express.static(__dirname + '/launcher'));

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// Add some custom logic to handle special cases or dynamic behavior
if (process.env.NODE_ENV === 'production') {
  // Redirect all non-HTTPS traffic to HTTPS
  app.use((req, res, next) => {
    if (!req.secure && req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    next();
  });
}

// Handle serving static assets
function sendAsset(res, assetPath, mimeType) {
  const assetStream = fs.createReadStream(assetPath);
  res.setHeader('Content-Length', assetStream.length);
  res.setHeader('Content-Type', mimeType || 'application/octet-stream');
  assetStream.pipe(res);
}

// Example endpoint for handling a custom request
app.get('/api/version', (req, res) => {
  const declauncherVersion = '1.2.3';
  res.json({ declauncherVersion });
});

// Custom middleware for handling custom routes
app.use((req, res, next) => {
  switch (req.path) {
    case '/':
      sendAsset(res, __dirname + '/index.html', 'text/html');
      break;
    case '/manifest.webmanifest':
      sendAsset(res, __dirname + '/manifest.webmanifest', 'application/manifest+json');
      break;
    default:
      next();
  }
});
