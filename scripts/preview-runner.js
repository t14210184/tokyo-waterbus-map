/**
 * Preview Runner & Automated Visual Testing Pipeline for Tokyo Waterbus Atlas
 */
import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const artifactDir = path.join(rootDir, 'artifacts', 'phase-1c');

if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true });
}

console.log('🚀 Starting Phase 1C Preview & Browser Verification Pipeline...');

// 1. Start Local Preview Server with encoded path
const serveUrl = 'file:///e:/ANTI/%E6%9D%B1%E4%BA%AC%E6%B0%B4%E4%B8%8A%E5%B7%B4%E5%A3%AB%E5%AF%A6%E5%A2%83%E5%9C%B0%E7%90%86%E8%B7%AF%E7%B7%9A%E5%9C%96/scripts/serve.js';
const serverProcess = spawn('node', ['-e', `import('${serveUrl}')`], {
  cwd: rootDir,
  stdio: 'inherit'
});

console.log(`🌐 Started Preview Server PID: ${serverProcess.pid}`);

// Retry poll for server to listen
function checkServer() {
  return new Promise((resolve) => {
    http.get('http://127.0.0.1:3000/', (res) => resolve(res.statusCode === 200)).on('error', () => resolve(false));
  });
}

let isUp = false;
for (let i = 0; i < 15; i++) {
  await new Promise(r => setTimeout(r, 400));
  isUp = await checkServer();
  if (isUp) break;
}

if (!isUp) {
  console.error('❌ Preview server failed to respond on 127.0.0.1:3000');
  serverProcess.kill();
  process.exit(1);
}

console.log('✅ Preview Server verified on http://127.0.0.1:3000');

// 2. Run Playwright Tests with Edge Channel
console.log('🧪 Executing Playwright Visual & Interactive Tests...');

const pwProcess = spawn('npx', ['playwright', 'test'], {
  cwd: rootDir,
  shell: true,
  stdio: 'inherit'
});

const exitCode = await new Promise((resolve) => {
  pwProcess.on('close', code => resolve(code));
});

console.log(`🧪 Playwright finished with exit code: ${exitCode}`);

// 3. Teardown Preview Server
console.log('🧹 Shutting down Preview Server...');
await new Promise(resolve => {
  http.get('http://127.0.0.1:3000/__shutdown', () => resolve(true)).on('error', () => resolve(false));
});

if (serverProcess && !serverProcess.killed) {
  serverProcess.kill();
}

console.log('✅ Pipeline Teardown Complete.');
process.exit(exitCode || 0);
