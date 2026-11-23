// Native HTTP Server with zero external dependencies and ESP32-CAM stream proxy
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.webm': 'video/webm'
};

const server = http.createServer((req, res) => {
  // CORS Headers for camera and media streaming
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);

  // ESP32-CAM MJPEG Stream Proxy Endpoint (Solves CORS and mixed-content issues)
  if (parsedUrl.pathname === '/api/esp-stream') {
    const targetUrl = parsedUrl.query.url;
    if (!targetUrl) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Missing target ESP-CAM URL');
      return;
    }

    try {
      const espUrl = new URL(targetUrl);
      const client = espUrl.protocol === 'https:' ? https : http;

      const proxyReq = client.get(targetUrl, { timeout: 8000 }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, {
          'Content-Type': proxyRes.headers['content-type'] || 'multipart/x-mixed-replace; boundary=123456789000000000000987654321',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        });
        proxyRes.pipe(res);
      });

      proxyReq.on('error', (err) => {
        console.warn('ESP-CAM connection error:', err.message);
        if (!res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'text/plain' });
          res.end(`ESP-CAM unavailable at ${targetUrl}: ${err.message}`);
        }
      });

      req.on('close', () => {
        proxyReq.destroy();
      });
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end(`Invalid ESP-CAM URL: ${err.message}`);
    }
    return;
  }

  // Normalize static file path
  let safePath = path.normalize(decodeURI(parsedUrl.pathname));
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, safePath);

  // Security check: ensure path is within PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache'
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`  SignBridge Live (with ESP32-CAM Support)           `);
  console.log(`  Local URL:   http://localhost:${PORT}              `);
  console.log(`  Network URL: http://127.0.0.1:${PORT}              `);
  console.log(`====================================================`);
});
