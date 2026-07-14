// Minimal static file server for local dev (ES modules need http://).
// Usage: node server.js [port]
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = parseInt(process.argv[2] || process.env.PORT || '8766', 10);
const root = __dirname;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath.endsWith('/')) urlPath += 'index.html';
  const filePath = path.join(root, path.normalize(urlPath));
  if (!filePath.startsWith(root)) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found: ' + urlPath); return; }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(filePath)] || 'application/octet-stream',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',   // dev server: never cache, so a plain reload always shows the latest edit
      'Pragma': 'no-cache', 'Expires': '0',
    });
    res.end(data);
  });
}).listen(port, () => console.log('METHODUS dev server → http://localhost:' + port));
