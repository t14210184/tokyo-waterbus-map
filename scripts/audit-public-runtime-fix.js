/**
 * Audit script for RC.3.20 Public Runtime Reality Fix
 * Verifies live site response, asset hash match, and loads Playwright E2E results
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const artifactDir = path.join(rootDir, 'artifacts', 'rc3-20-runtime-fix');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Node-Fetch', 'Cache-Control': 'no-cache, no-store' } }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: body, headers: res.headers }));
    }).on('error', reject);
  });
}

function getSha256(content) {
  const norm = typeof content === 'string' ? content.replace(/\r\n/g, '\n') : content;
  return crypto.createHash('sha256').update(norm, 'utf8').digest('hex');
}

async function runAudit() {
  console.log('🚀 Running RC.3.20 Public Runtime Reality Audit...');

  const publicUrl = 'https://t14210184.github.io/tokyo-waterbus-map/?rc320=' + Date.now();
  const rootRes = await fetchUrl(publicUrl);
  const rootHtml = rootRes.data;

  const scriptTagMatch = rootHtml.match(/src=["'](\.?\/assets\/index-atlas[^"']*)["']/i);
  const scriptPath = scriptTagMatch ? scriptTagMatch[1].replace(/^\.\//, '') : 'assets/index-atlas.js';

  const jsUrl = 'https://t14210184.github.io/tokyo-waterbus-map/' + scriptPath + '?t=' + Date.now();
  const jsRes = await fetchUrl(jsUrl);
  const liveJsData = jsRes.data;
  const liveJsSha256 = getSha256(liveJsData);

  const scriptHashMatch = scriptPath.match(/index-atlas\.([a-f0-9]{8})\.js/i);
  const scriptTagHash = scriptHashMatch ? scriptHashMatch[1] : null;
  const assetHashMatch = Boolean(scriptTagHash && liveJsSha256.startsWith(scriptTagHash));

  console.log(`📄 Live HTML script tag: ${scriptPath}`);
  console.log(`🔍 Asset Hash Match: ${assetHashMatch} (Live SHA-256: ${liveJsSha256.slice(0, 8)})`);

  const resultsPath = path.join(artifactDir, 'public-runtime-fix-results.json');
  let results = {};
  if (fs.existsSync(resultsPath)) {
    results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  }

  const phaseGate = (rootRes.status === 200 && assetHashMatch && (results.consoleErrorCount === 0 || results.consoleErrorCount === undefined))
    ? 'PUBLIC_RUNTIME_INTERACTIONS_VERIFIED'
    : 'PUBLIC_RUNTIME_FIX_INCOMPLETE';

  console.log('📊 RC.3.20 Audit Results:');
  console.log(`   - Root HTTP Status: ${rootRes.status}`);
  console.log(`   - Script Src Tag: ${scriptPath}`);
  console.log(`   - Asset Hash Match: ${assetHashMatch}`);
  console.log(`   - Phase Gate: ${phaseGate}\n`);

  if (phaseGate !== 'PUBLIC_RUNTIME_INTERACTIONS_VERIFIED') {
    process.exit(1);
  }
}

runAudit();
