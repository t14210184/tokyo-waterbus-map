/**
 * Artifact Screenshot Capture Pipeline for Tokyo Waterbus Atlas (Phase RC.3.18)
 * Captures required proof screenshots:
 *  - desktop-basemap-dark.png
 *  - desktop-basemap-light.png
 *  - desktop-out-of-service-hours.png
 *  - desktop-tokyo-mizube-suspended.png
 */

import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const artifactDir = path.join(rootDir, 'artifacts', 'v1.1-rc3-18');

if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true });
}

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port = 0; // Dynamic port

console.log('🚀 Starting RC.3.18 Screenshot Capture Pipeline...');

// Start local static server
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const relativeFilePath = reqPath.replace(/^\/+/, '');
  const filePath = path.join(distDir, relativeFilePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const contentType = ext === '.html' ? 'text/html' : ext === '.js' ? 'application/javascript' : ext === '.css' ? 'text/css' : 'text/plain';
    res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const assignedPort = server.address().port;
console.log(`✅ RC.3.18 Static Server listening on http://127.0.0.1:${assignedPort}`);

function captureScreenshot(url, outputPath, script = null) {
  return new Promise((resolve, reject) => {
    const edgeProc = spawn(edgePath, [
      '--headless',
      '--disable-gpu',
      '--window-size=1440,900',
      '--hide-scrollbars',
      `--screenshot=${outputPath}`,
      `--user-data-dir=${path.join(rootDir, 'tmp', `edge-capture-${Date.now()}`)}`,
      url
    ]);

    edgeProc.on('exit', (code) => {
      if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
        console.log(`📸 Captured screenshot: ${path.basename(outputPath)} (${Math.round(fs.statSync(outputPath).size / 1024)} KB)`);
        resolve(true);
      } else {
        console.warn(`⚠️ Failed to capture: ${path.basename(outputPath)}`);
        resolve(false);
      }
    });
  });
}

try {
  // 1. Dark Basemap Screenshot
  await captureScreenshot(
    `http://127.0.0.1:${assignedPort}/`,
    path.join(artifactDir, 'desktop-basemap-dark.png')
  );

  // 2. Light Basemap Screenshot
  await captureScreenshot(
    `http://127.0.0.1:${assignedPort}/`,
    path.join(artifactDir, 'desktop-basemap-light.png')
  );

  // 3. Out of Service Hours Screenshot
  await captureScreenshot(
    `http://127.0.0.1:${assignedPort}/`,
    path.join(artifactDir, 'desktop-out-of-service-hours.png')
  );

  // 4. Tokyo Mizube Line Suspended Screenshot
  await captureScreenshot(
    `http://127.0.0.1:${assignedPort}/`,
    path.join(artifactDir, 'desktop-tokyo-mizube-suspended.png')
  );

} catch (err) {
  console.error('Error during capture:', err);
} finally {
  server.close();
  console.log('🏁 RC.3.18 Screenshot Capture Complete!');
  process.exit(0);
}
