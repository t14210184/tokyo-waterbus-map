import https from 'https';
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Node-Fetch', 'Cache-Control': 'no-cache, no-store' } }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: body, headers: res.headers }));
    }).on('error', reject);
  });
}

async function diagnose() {
  console.log('🔍 Diagnosing Live Deployment for RC.3.19...');

  const rootUrl = 'https://t14210184.github.io/tokyo-waterbus-map/?t=' + Date.now();
  const rootRes = await fetchUrl(rootUrl);
  console.log('Root HTML Status:', rootRes.status);

  const scriptMatch = rootRes.data.match(/src=["'](\.?\/assets\/index-atlas[^"']*)["']/i);
  const scriptPath = scriptMatch ? scriptMatch[1] : 'assets/index-atlas.js';
  console.log('Root HTML script src:', scriptPath);

  const jsUrl = 'https://t14210184.github.io/tokyo-waterbus-map/' + scriptPath.replace(/^\.\//, '') + '?t=' + Date.now();
  const jsRes = await fetchUrl(jsUrl);
  const liveHash = crypto.createHash('sha256').update(jsRes.data, 'utf8').digest('hex');

  console.log('Live JS URL:', jsUrl);
  console.log('Live JS Status:', jsRes.status);
  console.log('Live JS Length:', jsRes.data.length);
  console.log('Live JS SHA-256:', liveHash);
  console.log('Live JS contains "RGR-sumida-river-13":', jsRes.data.includes('RGR-sumida-river-13'));
  console.log('Live JS contains "service-status":', jsRes.data.includes('SERVICE_STATUS_REGISTRY') || jsRes.data.includes('tokyo-mizube-line'));
  console.log('Live JS contains "btn-theme-toggle":', jsRes.data.includes('btn-theme-toggle'));

  const localJsPath = path.join(rootDir, 'dist', 'assets', 'index-atlas.js');
  if (fs.existsSync(localJsPath)) {
    const localData = fs.readFileSync(localJsPath, 'utf8');
    const localHash = crypto.createHash('sha256').update(localData, 'utf8').digest('hex');
    console.log('\nLocal dist JS Length:', localData.length);
    console.log('Local dist JS SHA-256:', localHash);
    console.log('SHA-256 Match:', liveHash === localHash);
  }
}

diagnose();
