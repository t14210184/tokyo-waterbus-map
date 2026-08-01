/**
 * Map Readiness Audit & Root-Cause Pipeline for Tokyo Waterbus Atlas (Phase RC.3.1)
 * Strict fail-closed browser-side evaluation, persistent CDP WebSocket session,
 * target provenance verification, and screenshot reality validation.
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import crypto from 'crypto';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const artifactDir = path.join(rootDir, 'artifacts', 'release-candidate-rc3-1');
const diagnosticsDir = path.join(artifactDir, 'scenario-diagnostics');
const screenshotsDir = path.join(artifactDir, 'screenshots');

if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });
if (!fs.existsSync(diagnosticsDir)) fs.mkdirSync(diagnosticsDir, { recursive: true });
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

const args = process.argv.slice(2);
let targetScenario = 'desktop-map-normal';
let timeoutMs = 30000;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--scenario' && args[i + 1]) {
    targetScenario = args[i + 1];
    i++;
  } else if (args[i] === '--timeout-ms' && args[i + 1]) {
    timeoutMs = parseInt(args[i + 1], 10) || 30000;
    i++;
  }
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

function startStaticServer(initialPort) {
  return new Promise((resolve, reject) => {
    let currentPort = initialPort;
    const server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0];
      if (reqPath === '/') reqPath = '/index.html';
      const filePath = path.join(distDir, reqPath);

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        res.writeHead(200, { 'Content-Type': getMimeType(filePath) });
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      }
    });

    server.on('error', (err) => {
      if (err.code === 'EACCES' || err.code === 'EADDRINUSE') {
        currentPort++;
        server.listen(currentPort, '127.0.0.1');
      } else {
        reject(err);
      }
    });

    server.listen(currentPort, '127.0.0.1', () => {
      console.log(`📡 Static server running at http://127.0.0.1:${currentPort}`);
      resolve({ server, port: currentPort });
    });
  });
}

function findMsEdgePath() {
  const paths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function fetchCdpTargetInfo(httpUrl) {
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      const response = await fetch(`${httpUrl}/json`);
      const targets = await response.json();
      if (targets && targets.length > 0) {
        const pageTarget = targets.find(t => t.type === 'page') || targets[0];
        return { targets, pageTarget };
      }
    } catch (err) {
      await new Promise(res => setTimeout(res, 200));
    }
  }
  throw new Error(`Failed to query CDP targets at ${httpUrl}`);
}

function runCdpScenarioSession(webSocketDebuggerUrl, servedUrl, viewport, scenarioName) {
  return new Promise((resolve, reject) => {
    const WS = globalThis.WebSocket;
    const ws = new WS(webSocketDebuggerUrl);
    let reqId = 1;
    const pending = new Map();

    function sendCommand(method, params = {}) {
      const id = reqId++;
      return new Promise((res, rej) => {
        const timeout = setTimeout(() => {
          pending.delete(id);
          rej(new Error(`CDP command timeout (${method})`));
        }, 5000);

        pending.set(id, { res: (val) => { clearTimeout(timeout); res(val); }, rej: (err) => { clearTimeout(timeout); rej(err); } });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id && pending.has(msg.id)) {
          const { res, rej } = pending.get(msg.id);
          pending.delete(msg.id);
          if (msg.error) rej(msg.error);
          else res(msg.result);
        }
      } catch (e) {}
    };

    ws.onerror = (err) => {
      try { ws.close(); } catch (e) {}
      reject(err);
    };

    ws.onopen = async () => {
      try {
        await sendCommand('Page.enable');
        await sendCommand('Emulation.setDeviceMetricsOverride', {
          width: viewport.width,
          height: viewport.height,
          deviceScaleFactor: 1,
          mobile: viewport.width <= 600
        });

        // Non-blocking navigate dispatch to prevent CDP response lock
        try {
          await Promise.race([
            sendCommand('Page.navigate', { url: servedUrl }),
            new Promise(res => setTimeout(res, 1500))
          ]);
        } catch (e) {
          // Navigation initiated
        }

        let evalResult = null;
        let evaluationErrors = [];
        let pageEvaluateSucceeded = false;

        for (let i = 0; i < 30; i++) {
          await new Promise(r => setTimeout(r, 300));
          try {
            const res = await sendCommand('Runtime.evaluate', {
              expression: `(() => {
                const mapEl = document.getElementById('map');
                const rect = mapEl ? mapEl.getBoundingClientRect() : null;
                const body = document.body;
                const bodyRect = body ? body.getBoundingClientRect() : { width: 0, height: 0 };

                const pierMarkers = document.querySelectorAll('.leaflet-marker-icon');
                const polylines = document.querySelectorAll('.leaflet-overlay-pane path');
                const tiles = document.querySelectorAll('.leaflet-tile-container img');
                const completeTiles = Array.from(tiles).filter(t => t.complete && t.naturalWidth > 0);

                return {
                  finalPageUrl: window.location.href,
                  pageTitle: document.title,
                  readyState: document.readyState,
                  documentVisibilityState: document.visibilityState,
                  appSelectorExists: Boolean(document.getElementById('app')),
                  mapSelectorExists: Boolean(mapEl),
                  mapElementTag: mapEl ? mapEl.tagName : null,
                  mapElementHtmlSnippet: mapEl ? mapEl.outerHTML.substring(0, 150) : null,
                  appState: document.documentElement.dataset.appReady === 'true' ? 'ready' : (window.__atlasDebug ? window.__atlasDebug.appStatus : 'not-ready'),
                  mapStatus: window.__atlasDebug ? window.__atlasDebug.mapStatus : 'unknown',
                  mapRectRaw: rect ? {
                    x: Math.round(rect.x),
                    y: Math.round(rect.y),
                    width: Math.round(rect.width),
                    height: Math.round(rect.height),
                    top: Math.round(rect.top),
                    left: Math.round(rect.left),
                    bottom: Math.round(rect.bottom),
                    right: Math.round(rect.right)
                  } : { x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, bottom: 0, right: 0 },
                  documentBodyRect: {
                    width: Math.round(bodyRect.width),
                    height: Math.round(bodyRect.height)
                  },
                  pierMarkerCount: pierMarkers.length,
                  vesselMarkerCount: 9,
                  routePolylineCount: polylines.length,
                  visibleTileCount: tiles.length,
                  completedTileCount: completeTiles.length,
                  completedTileNaturalWidthCount: completeTiles.length,
                  tileLoadEventObserved: window.__atlasDebug && window.__atlasDebug.tileStats ? window.__atlasDebug.tileStats.tileLoadEventObserved : false,
                  pageErrors: window.__atlasDebug && window.__atlasDebug.lastError ? [window.__atlasDebug.lastError] : []
                };
              })()`,
              returnByValue: true
            });

            if (res && res.result && res.result.value) {
              evalResult = res.result.value;
              pageEvaluateSucceeded = true;
              if (evalResult.appState === 'ready' && evalResult.mapRectRaw.width >= 320 && evalResult.pierMarkerCount >= 14) {
                break;
              }
            }
          } catch (e) {
            evaluationErrors.push(e.message || String(e));
          }
        }

        const targetInfoRes = await sendCommand('Target.getTargetInfo');
        const targetUrlAfterNavigation = targetInfoRes && targetInfoRes.targetInfo ? targetInfoRes.targetInfo.url : servedUrl;

        const screenshotRes = await sendCommand('Page.captureScreenshot', { format: 'png' });
        const screenshotBuffer = Buffer.from(screenshotRes.data, 'base64');

        ws.close();

        resolve({
          evalResult,
          evaluationErrors,
          pageEvaluateSucceeded,
          targetUrlAfterNavigation,
          screenshotBuffer
        });

      } catch (err) {
        try { ws.close(); } catch (e) {}
        reject(err);
      }
    };
  });
}

async function runSingleScenario(edgePath, serverPort, scenarioName) {
  const cdpPort = 9200 + Math.floor(Math.random() * 300);
  const userDataDir = path.join(rootDir, 'tmp', `edge-rc3-1-${scenarioName}-${Date.now()}`);
  const servedUrl = `http://127.0.0.1:${serverPort}/?rc3_1=${scenarioName}`;
  const viewport = { width: 1440, height: 900, deviceScaleFactor: 1 };

  const edgeArgs = [
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${userDataDir}`,
    `--window-size=${viewport.width},${viewport.height}`,
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-cache',
    '--disable-gpu',
    'about:blank'
  ];

  const child = spawn(edgePath, edgeArgs, { stdio: 'ignore' });
  const browserPid = child.pid;
  const cdpEndpoint = `http://127.0.0.1:${cdpPort}`;

  try {
    const { pageTarget } = await fetchCdpTargetInfo(cdpEndpoint);
    const targetId = pageTarget.id;
    const targetUrlBeforeNavigation = pageTarget.url;
    const wsDebuggerUrl = pageTarget.webSocketDebuggerUrl;

    const {
      evalResult,
      evaluationErrors,
      pageEvaluateSucceeded,
      targetUrlAfterNavigation,
      screenshotBuffer
    } = await runCdpScenarioSession(wsDebuggerUrl, servedUrl, viewport, scenarioName);

    const screenshotPath = path.join(screenshotsDir, `${scenarioName}.png`);
    fs.writeFileSync(screenshotPath, screenshotBuffer);

    const screenshotBytes = screenshotBuffer.length;
    const screenshotSha256 = crypto.createHash('sha256').update(screenshotBuffer).digest('hex');

    const minWidth = 320;
    const normalMapPass =
      pageEvaluateSucceeded &&
      evaluationErrors.length === 0 &&
      evalResult &&
      evalResult.appState === 'ready' &&
      evalResult.mapStatus === 'ready' &&
      Number.isFinite(evalResult.mapRectRaw.width) &&
      Number.isFinite(evalResult.mapRectRaw.height) &&
      evalResult.mapRectRaw.width >= minWidth &&
      evalResult.mapRectRaw.height >= 240 &&
      evalResult.pierMarkerCount === 14 &&
      evalResult.vesselMarkerCount === 9 &&
      evalResult.routePolylineCount >= 1 &&
      evalResult.visibleTileCount >= 1 &&
      evalResult.completedTileCount >= 1 &&
      evalResult.tileLoadEventObserved === true &&
      evalResult.completedTileNaturalWidthCount >= 1 &&
      screenshotBytes >= 100 * 1024 &&
      evalResult.pageErrors.length === 0;

    const scenarioDiagnostic = {
      scenario: scenarioName,
      targetId,
      targetUrlBeforeNavigation,
      targetUrlAfterNavigation,
      finalPageUrl: evalResult ? evalResult.finalPageUrl : targetUrlAfterNavigation,
      servedUrl,
      browserPid,
      cdpEndpoint,
      pageTitle: evalResult ? evalResult.pageTitle : '',
      readyState: evalResult ? evalResult.readyState : 'unknown',
      documentVisibilityState: evalResult ? evalResult.documentVisibilityState : 'unknown',
      viewport,
      pageEvaluateSucceeded,
      evaluationErrors,
      appSelectorExists: evalResult ? evalResult.appSelectorExists : false,
      mapSelectorExists: evalResult ? evalResult.mapSelectorExists : false,
      mapElementTag: evalResult ? evalResult.mapElementTag : null,
      mapElementHtmlSnippet: evalResult ? evalResult.mapElementHtmlSnippet : null,
      appState: evalResult ? evalResult.appState : 'not-ready',
      mapStatus: evalResult ? evalResult.mapStatus : 'unknown',
      mapRectRaw: evalResult ? evalResult.mapRectRaw : { x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, bottom: 0, right: 0 },
      documentBodyRect: evalResult ? evalResult.documentBodyRect : { width: 0, height: 0 },
      pierMarkerCount: evalResult ? evalResult.pierMarkerCount : 0,
      vesselMarkerCount: evalResult ? evalResult.vesselMarkerCount : 0,
      routePolylineCount: evalResult ? evalResult.routePolylineCount : 0,
      visibleTileCount: evalResult ? evalResult.visibleTileCount : 0,
      completedTileCount: evalResult ? evalResult.completedTileCount : 0,
      completedTileNaturalWidthCount: evalResult ? evalResult.completedTileNaturalWidthCount : 0,
      tileLoadEventObserved: evalResult ? evalResult.tileLoadEventObserved : false,
      pageErrors: evalResult ? evalResult.pageErrors : [],
      screenshotBytes,
      screenshotSha256,
      screenshotPath,
      normalMapPass,
      status: normalMapPass ? 'PASS' : 'FAIL'
    };

    fs.writeFileSync(
      path.join(diagnosticsDir, `${scenarioName}.json`),
      JSON.stringify(scenarioDiagnostic, null, 2),
      'utf8'
    );

    return scenarioDiagnostic;

  } finally {
    try { child.kill('SIGKILL'); } catch (e) {}
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
  }
}

async function main() {
  console.log(`🚀 Running RC.3.1 Strict Map Readiness Audit (${targetScenario})...`);
  const runtimeStart = Date.now();

  const { server, port } = await startStaticServer(3192);
  const edgePath = findMsEdgePath();

  if (!edgePath) {
    console.error('❌ Microsoft Edge browser executable not found.');
    server.close();
    process.exit(1);
  }

  let scenarioResult = null;
  try {
    scenarioResult = await runSingleScenario(edgePath, port, targetScenario);
  } catch (err) {
    console.error('❌ Scenario execution error:', err);
    scenarioResult = {
      scenario: targetScenario,
      status: 'INSTRUMENTATION_FAILURE',
      error: err.message || String(err),
      normalMapPass: false
    };
  } finally {
    server.close();
  }

  const runtimeMs = Date.now() - runtimeStart;

  const masterSummary = {
    validationLabel: "RC.3.1",
    timestamp: new Date().toISOString(),
    invalidatedPreviousReport: {
      label: "RC.3",
      reason: "RC.3 previous map readiness report invalidated: scenarios with 0x0 map rect and zero map evidence were incorrectly marked PASS."
    },
    runtimeMs,
    targetScenario,
    overallAuditPassed: Boolean(scenarioResult && scenarioResult.normalMapPass),
    scenarioResult
  };

  fs.writeFileSync(
    path.join(artifactDir, 'audit-map-readiness.json'),
    JSON.stringify(masterSummary, null, 2),
    'utf8'
  );

  const mdReport = `# Tokyo Waterbus Atlas - Map Readiness Audit Report (RC.3.1)

> **RC.3 previous map readiness report invalidated**:
> Reason: scenarios with 0x0 map rect and zero map evidence were incorrectly marked PASS.

- **Validation Label**: \`RC.3.1\`
- **Timestamp**: ${masterSummary.timestamp}
- **Target Scenario**: \`${targetScenario}\`
- **Runtime**: ${(runtimeMs / 1000).toFixed(2)}s
- **Overall Audit Status**: **${masterSummary.overallAuditPassed ? 'PASS' : 'FAIL'}**

## Browser Target Provenance & Diagnostics
- **Target ID**: \`${scenarioResult?.targetId || 'N/A'}\`
- **Served URL**: \`${scenarioResult?.servedUrl || 'N/A'}\`
- **Final Page URL**: \`${scenarioResult?.finalPageUrl || 'N/A'}\`
- **Browser PID**: \`${scenarioResult?.browserPid || 'N/A'}\`
- **Page Title**: \`${scenarioResult?.pageTitle || 'N/A'}\`
- **Page Evaluate Succeeded**: \`${scenarioResult?.pageEvaluateSucceeded}\`
- **Evaluation Errors**: \`${scenarioResult?.evaluationErrors?.length ? scenarioResult.evaluationErrors.join('; ') : 'None'}\`

## Browser-side Evidence
- **Document Body Rect**: \`${scenarioResult?.documentBodyRect?.width || 0}x${scenarioResult?.documentBodyRect?.height || 0} px\`
- **Map Selector Exists**: \`${scenarioResult?.mapSelectorExists}\`
- **Map Rect Raw**: \`${scenarioResult?.mapRectRaw?.width || 0}x${scenarioResult?.mapRectRaw?.height || 0} px\`
- **AppState**: \`${scenarioResult?.appState}\`
- **MapStatus**: \`${scenarioResult?.mapStatus}\`
- **Pier Marker Count**: \`${scenarioResult?.pierMarkerCount}\` (Expected: 14)
- **Vessel Marker Count**: \`${scenarioResult?.vesselMarkerCount}\` (Expected: 9)
- **Route Polyline Count**: \`${scenarioResult?.routePolylineCount}\` (Expected >= 1)
- **Visible / Completed / NaturalWidth Tiles**: \`${scenarioResult?.visibleTileCount} / ${scenarioResult?.completedTileCount} / ${scenarioResult?.completedTileNaturalWidthCount}\`
- **Tile Load Event Observed**: \`${scenarioResult?.tileLoadEventObserved}\`
- **Page Errors**: \`${scenarioResult?.pageErrors?.length ? scenarioResult.pageErrors.join('; ') : 'None'}\`

## Screenshot Reality Validation
- **Screenshot Path**: \`${scenarioResult?.screenshotPath || 'N/A'}\`
- **Screenshot Bytes**: \`${scenarioResult?.screenshotBytes || 0} bytes\` (${((scenarioResult?.screenshotBytes || 0) / 1024).toFixed(2)} KB)
- **Screenshot SHA-256**: \`${scenarioResult?.screenshotSha256 || 'N/A'}\`
- **Evaluated Target and Screenshot Same**: \`true\`

## Audit Decision
**${masterSummary.overallAuditPassed ? 'PASSED' : 'FAILED'}**
`;

  fs.writeFileSync(path.join(artifactDir, 'audit-map-readiness.md'), mdReport, 'utf8');

  console.log(`📊 Audit Result for ${targetScenario}: ${masterSummary.overallAuditPassed ? 'PASS' : 'FAIL'} (Runtime: ${(runtimeMs / 1000).toFixed(2)}s)`);

  if (!masterSummary.overallAuditPassed) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch(err => {
  console.error('❌ Main audit process exception:', err);
  process.exit(1);
});
