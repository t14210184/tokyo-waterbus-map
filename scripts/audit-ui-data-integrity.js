/**
 * UI Data Display Integrity Audit Script for Tokyo Waterbus Atlas (Phase 4A.3)
 * Dual-layer audit: Source code static scan & Real-browser DOM text scan for blocking tokens ('undefined', 'null', 'NaN', '[object Object]').
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
const artifactDir = path.join(rootDir, 'artifacts', 'phase-4a-3');

if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true });
}

console.log('🚀 Running UI Data Display Integrity Audit...');

// --- Layer 1: Source Code Static Scan ---
const targetDirs = ['src/ui', 'src/map', 'src/core'];
const scannedFiles = [];
const sourceFindings = [];

function collectFiles(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) collectFiles(fullPath);
    else if (entry.isFile() && entry.name.endsWith('.js')) scannedFiles.push(fullPath);
  }
}
targetDirs.forEach(sub => collectFiles(path.join(rootDir, sub)));

const blockingTokens = ['undefined', 'null', 'NaN', '[object Object]'];

scannedFiles.forEach(fp => {
  const rel = path.relative(rootDir, fp);
  const content = fs.readFileSync(fp, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // Check for risky template literal patterns like `${pier.operator}` without fallback
    if (/\$\{.*(?:operator|status|nearestTransit|confidence)\s*\}/.test(line) && !line.includes('display') && !line.includes('||')) {
      sourceFindings.push({
        file: rel,
        line: idx + 1,
        category: 'blocking user-facing risk',
        snippet: line.trim()
      });
    }
  });
});

console.log(`🔍 Layer 1 Source Scan Finished: ${sourceFindings.length} potential risk findings in source code.`);

// --- Layer 2: Real-Browser DOM Scan on Fresh Production Server ---
const freshPort = 3195;
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

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

const edgeProcess = spawn(edgePath, [
  '--headless',
  '--disable-gpu',
  '--remote-debugging-port=9233',
  `--user-data-dir=${path.join(rootDir, 'tmp', 'edge-user-data-integrity')}`,
  '--disk-cache-size=1',
  `http://127.0.0.1:${freshPort}/`
], { stdio: 'ignore' });

let pageTarget = null;
for (let i = 0; i < 25; i++) {
  await new Promise(r => setTimeout(r, 400));
  try {
    const res = await fetch('http://127.0.0.1:9233/json');
    const targets = await res.json();
    pageTarget = targets.find(t => t.type === 'page' && t.url.includes(String(freshPort)));
    if (pageTarget) break;
  } catch {}
}

if (!pageTarget) {
  server.close();
  console.error('❌ Edge CDP target not found for integrity audit');
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

async function evalInPage(expr) {
  const res = await sendCdp('Runtime.evaluate', { expression: expr, returnByValue: true });
  return res?.result?.value;
}

// Poll for App Ready
for (let i = 0; i < 40; i++) {
  await new Promise(r => setTimeout(r, 400));
  const debug = await evalInPage('window.__atlasDebug');
  if (debug && debug.appStatus === 'ready') break;
}

const domFindings = [];
const scenarios = [];

async function scanDomText(scenarioName) {
  const bodyText = await evalInPage('document.body.innerText');
  const optionTexts = await evalInPage("Array.from(document.querySelectorAll('option')).map(o => o.textContent).join(' ')");
  const fullText = (bodyText || '') + ' ' + (optionTexts || '');

  const scenarioFindings = [];

  blockingTokens.forEach(token => {
    // Exact word match or literal substring check
    const regex = new RegExp(`\\b${token.replace('[', '\\[').replace(']', '\\]')}\\b`, 'g');
    const matches = fullText.match(regex);
    if (matches) {
      matches.forEach(() => {
        scenarioFindings.push({ scenario: scenarioName, token });
        domFindings.push({ scenario: scenarioName, token });
      });
    }
  });

  scenarios.push({
    scenarioName,
    textLength: fullText.length,
    blockingTokensFound: scenarioFindings.length
  });
}

// Scenario 1: Route Panel Initial
await scanDomText('Route Panel');

// Scenario 2: Fleet Panel
await evalInPage(`document.querySelector('.tab-btn[data-tab="fleet"]')?.click()`);
await new Promise(r => setTimeout(r, 400));
await scanDomText('Fleet Panel');

// Scenario 3: Pier List Panel
await evalInPage(`document.querySelector('.tab-btn[data-tab="piers"]')?.click()`);
await new Promise(r => setTimeout(r, 400));
await scanDomText('Pier List Panel');

// Scenario 4: Pier Drawer Hamarikyu
await evalInPage(`document.querySelector('.pier-card[data-pier-id="hamarikyu"]')?.click()`);
await new Promise(r => setTimeout(r, 500));
await scanDomText('Pier Drawer (Hamarikyu)');

// Scenario 5: Pier Drawer Asakusa
await evalInPage(`document.querySelector('.pier-card[data-pier-id="asakusa"]')?.click()`);
await new Promise(r => setTimeout(r, 500));
await scanDomText('Pier Drawer (Asakusa)');

// Scenario 6: Trip Planner & Results
await evalInPage(`document.querySelector('.tab-btn[data-tab="guide"]')?.click()`);
await new Promise(r => setTimeout(r, 500));
await evalInPage(`
  const oSelect = document.getElementById('select-origin-pier');
  const dSelect = document.getElementById('select-dest-pier');
  if (oSelect) oSelect.value = 'asakusa';
  if (dSelect) dSelect.value = 'odaiba-kaihinkouen';
  if (oSelect) oSelect.dispatchEvent(new Event('change', { bubbles: true }));
  if (dSelect) dSelect.dispatchEvent(new Event('change', { bubbles: true }));
`);
await new Promise(r => setTimeout(r, 400));
await evalInPage(`document.getElementById('btn-submit-plan')?.click()`);
await new Promise(r => setTimeout(r, 800));
await scanDomText('Trip Planner & Results');

ws.close();
if (edgeProcess && !edgeProcess.killed) edgeProcess.kill();
server.close();

const auditResult = {
  timestamp: new Date().toISOString(),
  sourceScan: {
    scannedFileCount: scannedFiles.length,
    blockingCount: sourceFindings.filter(f => f.category.includes('blocking')).length,
    potentialRiskCount: sourceFindings.length,
    findings: sourceFindings
  },
  browserScan: {
    scenarios,
    visibleBlockingTokenCount: domFindings.length,
    findings: domFindings
  },
  valid: domFindings.length === 0
};

fs.writeFileSync(path.join(artifactDir, 'ui-data-integrity.json'), JSON.stringify(auditResult, null, 2), 'utf8');

const mdReport = `# Tokyo Waterbus Atlas - UI Data Display Integrity Audit Report

- **Timestamp**: ${auditResult.timestamp}
- **Source Scanned Files**: ${scannedFiles.length}
- **Source Blocking Risk Count**: ${auditResult.sourceScan.blockingCount}
- **Browser Tested Scenarios**: ${scenarios.length}
- **Visible Blocking Tokens Count**: ${domFindings.length} ('undefined', 'null', 'NaN', '[object Object]')
- **Audit Result**: ${auditResult.valid ? 'PASSED' : 'FAILED'}

## Browser Scenarios Tested
${scenarios.map(s => `- **${s.scenarioName}**: ${s.blockingTokensFound} blocking tokens found (${s.textLength} chars scanned)`).join('\n')}
`;

fs.writeFileSync(path.join(artifactDir, 'ui-data-integrity.md'), mdReport, 'utf8');

console.log(`📊 UI Data Integrity Audit Summary:
   - Scanned Source Files: ${scannedFiles.length}
   - Tested Scenarios: ${scenarios.length}
   - Visible Blocking Tokens Found: ${domFindings.length}
   - Audit Status: ${auditResult.valid ? 'PASSED' : 'FAILED'}
`);

if (!auditResult.valid) {
  console.error('❌ UI DATA INTEGRITY AUDIT FAILED! Blocking tokens found in visible DOM.');
  process.exit(1);
} else {
  console.log('✅ UI DATA INTEGRITY AUDIT PASSED! Zero raw missing tokens in visible DOM.');
  process.exit(0);
}
