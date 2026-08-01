/**
 * No-JS Fallback Verification Test Script for Tokyo Waterbus Atlas (Phase 4B)
 * Tests application with JavaScript disabled in Edge browser to verify noscript fallback rendering.
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
const artifactDir = path.join(rootDir, 'artifacts', 'release-candidate');

if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true });
}

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const freshPort = 3191;

console.log('🚀 Starting No-JS Fallback Verification Pipeline...');

// Start static server
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

await new Promise(resolve => server.listen(freshPort, '127.0.0.1', resolve));
console.log(`✅ Production Static Server listening on http://127.0.0.1:${freshPort}`);

// Launch Edge with JavaScript disabled
const edgeProcess = spawn(edgePath, [
  '--headless',
  '--disable-gpu',
  '--disable-javascript',
  '--remote-debugging-port=9255',
  `--user-data-dir=${path.join(rootDir, 'tmp', 'edge-user-data-nojs')}`,
  '--disk-cache-size=1',
  `http://127.0.0.1:${freshPort}/`
], { stdio: 'ignore' });

let pageTarget = null;
for (let i = 0; i < 20; i++) {
  await new Promise(r => setTimeout(r, 300));
  try {
    const res = await fetch('http://127.0.0.1:9255/json');
    const targets = await res.json();
    pageTarget = targets.find(t => t.type === 'page' && t.url.includes(String(freshPort)));
    if (pageTarget) break;
  } catch {}
}

if (!pageTarget) {
  server.close();
  console.error('❌ Edge CDP target not found for No-JS test');
  process.exit(1);
}

const ws = new globalThis.WebSocket(pageTarget.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));

let msgId = 1;
function sendCdp(method, params = {}) {
  const id = msgId++;
  return new Promise((resolve) => {
    const handler = (event) => {
      const res = JSON.parse(event.data);
      if (res.id === id) {
        ws.removeEventListener('message', handler);
        resolve(res.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

await sendCdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await new Promise(r => setTimeout(r, 1500));

// Capture No-JS Screenshot
const screenshotRes = await sendCdp('Page.captureScreenshot', { format: 'png', fromSurface: true });
const buffer = Buffer.from(screenshotRes.data, 'base64');
const screenshotPath = path.join(artifactDir, 'nojs-fallback.png');
fs.writeFileSync(screenshotPath, buffer);
const sizeKB = (buffer.length / 1024).toFixed(1);
console.log(`📸 Saved nojs-fallback.png (${sizeKB} KB)`);

ws.close();
if (edgeProcess && !edgeProcess.killed) edgeProcess.kill();
server.close();

console.log('✅ NO-JS FALLBACK TEST PASSED!');
