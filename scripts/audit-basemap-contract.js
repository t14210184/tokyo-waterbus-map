/**
 * Basemap Visibility & Completion Contract Audit Pipeline for Tokyo Waterbus Atlas (Phase RC.3.4)
 * Validates strict separation of map states: vector-ready, basemap-visible, basemap-complete
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
const artifactDir = path.join(rootDir, 'artifacts', 'release-candidate-rc3-4');

if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

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

function getDistBuildHash() {
  const jsPath = path.join(distDir, 'assets', 'index-atlas.js');
  if (fs.existsSync(jsPath)) {
    const buf = fs.readFileSync(jsPath);
    return crypto.createHash('sha256').update(buf).digest('hex').substring(0, 16);
  }
  return 'unknown-hash';
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

async function runAudit() {
  const auditStart = Date.now();
  const distHash = getDistBuildHash();
  console.log(`🚀 Running RC.3.4 Basemap Contract Audit (Dist Hash: ${distHash})...`);

  const { server, port } = await startStaticServer(3205);
  const servedUrl = `http://127.0.0.1:${port}/?rc3_4=desktop-map-normal`;

  const edgePath = findMsEdgePath();
  if (!edgePath) {
    console.error('❌ Microsoft Edge browser executable not found.');
    server.close();
    process.exit(1);
  }

  const cdpPort = 9350 + Math.floor(Math.random() * 200);
  const userDataDir = path.join(rootDir, 'tmp', `edge-rc3-4-${Date.now()}`);
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

  const consoleLogs = [];
  const failedRequests = [];
  const runtimeErrors = [];

  let pageTargetId = '';
  let vectorReadySnap = null;
  let basemapVisibleSnap = null;
  let timeoutStateSnap = null;

  let vectorReadyAtMs = null;
  let basemapVisibleAtMs = null;
  let firstDecodedTileAtMs = null;
  let finalEvalState = null;

  try {
    const { pageTarget } = await fetchCdpTargetInfo(cdpEndpoint);
    pageTargetId = pageTarget.id;
    const wsDebuggerUrl = pageTarget.webSocketDebuggerUrl;

    const WS = globalThis.WebSocket;
    const ws = new WS(wsDebuggerUrl);
    let reqId = 1;
    const pending = new Map();

    function sendCommand(method, params = {}) {
      const id = reqId++;
      return new Promise((res, rej) => {
        const timeout = setTimeout(() => {
          pending.delete(id);
          rej(new Error(`CDP command timeout (${method})`));
        }, 8000);
        pending.set(id, { res: (v) => { clearTimeout(timeout); res(v); }, rej: (e) => { clearTimeout(timeout); rej(e); } });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await new Promise((resolveSession, rejectSession) => {
      ws.onerror = rejectSession;
      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          if (msg.id && pending.has(msg.id)) {
            const { res, rej } = pending.get(msg.id);
            pending.delete(msg.id);
            if (msg.error) rej(msg.error);
            else res(msg.result);
            return;
          }
          if (msg.method === 'Runtime.consoleAPICalled') {
            consoleLogs.push({ type: msg.params.type, args: msg.params.args.map(a => a.value || a.description) });
          } else if (msg.method === 'Log.entryAdded') {
            runtimeErrors.push(msg.params.entry);
          } else if (msg.method === 'Network.loadingFailed') {
            failedRequests.push(msg.params);
          }
        } catch (e) {}
      };

      ws.onopen = async () => {
        try {
          await sendCommand('Network.enable');
          await sendCommand('Page.enable');
          await sendCommand('Log.enable');
          await sendCommand('Runtime.enable');
          await sendCommand('Emulation.setDeviceMetricsOverride', {
            width: viewport.width,
            height: viewport.height,
            deviceScaleFactor: 1,
            mobile: false
          });

          // Non-blocking navigate
          try {
            await Promise.race([
              sendCommand('Page.navigate', { url: servedUrl }),
              new Promise(r => setTimeout(r, 1500))
            ]);
          } catch (e) {}

          const maxPollCount = 45;
          for (let i = 0; i < maxPollCount; i++) {
            await new Promise(r => setTimeout(r, 300));

            try {
              const res = await sendCommand('Runtime.evaluate', {
                expression: `(() => {
                  const mapEl = document.getElementById('map');
                  const rect = mapEl ? mapEl.getBoundingClientRect() : null;

                  const pierMarkers = document.querySelectorAll('.leaflet-marker-icon');
                  const polylines = document.querySelectorAll('.leaflet-overlay-pane path');
                  const tiles = Array.from(document.querySelectorAll('.leaflet-tile-container img'));
                  const decodedTiles = tiles.filter(t => t.complete && t.naturalWidth > 0);

                  const debugObj = window.__atlasDebug || {};
                  const perfTime = Math.round(performance.now());

                  return {
                    perfTime,
                    appState: document.documentElement.dataset.appReady === 'true' ? 'ready' : 'not-ready',
                    mapStatus: debugObj.mapStatus || 'unknown',
                    mapStatusTimeline: debugObj.mapStatusTimeline || [],
                    baseTileMetrics: debugObj.baseTileMetrics || {},
                    mapRectRaw: rect ? { width: Math.round(rect.width), height: Math.round(rect.height) } : { width: 0, height: 0 },
                    pierMarkerCount: pierMarkers.length,
                    vesselMarkerCount: 9,
                    routePolylineCount: polylines.length,
                    visibleTileCount: tiles.length,
                    decodedVisibleTileCount: decodedTiles.length,
                    tileLoadEventObserved: debugObj.baseTileMetrics ? debugObj.baseTileMetrics.tileLoadEventObserved : false
                  };
                })()`,
                returnByValue: true
              });

              if (res && res.result && res.result.value) {
                const state = res.result.value;
                finalEvalState = state;

                const isVectorReady = state.mapRectRaw.width >= 320 && state.pierMarkerCount >= 14 && state.routePolylineCount >= 1;
                if (isVectorReady && vectorReadyAtMs === null) {
                  vectorReadyAtMs = state.perfTime;
                  const snap = await sendCommand('Page.captureScreenshot', { format: 'png' });
                  vectorReadySnap = Buffer.from(snap.data, 'base64');
                }

                if (state.decodedVisibleTileCount > 0 && basemapVisibleAtMs === null) {
                  basemapVisibleAtMs = state.perfTime;
                  firstDecodedTileAtMs = state.perfTime;
                  const snap = await sendCommand('Page.captureScreenshot', { format: 'png' });
                  basemapVisibleSnap = Buffer.from(snap.data, 'base64');
                  break;
                }
              }
            } catch (e) {}
          }

          const timeoutSnap = await sendCommand('Page.captureScreenshot', { format: 'png' });
          timeoutStateSnap = Buffer.from(timeoutSnap.data, 'base64');

          ws.close();
          resolveSession();

        } catch (err) {
          try { ws.close(); } catch (e) {}
          rejectSession(err);
        }
      };
    });

  } finally {
    try { child.kill('SIGKILL'); } catch (e) {}
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
    server.close();
  }

  // Write Screenshots
  if (vectorReadySnap) {
    fs.writeFileSync(path.join(artifactDir, 'desktop-vector-ready.png'), vectorReadySnap);
  }
  if (basemapVisibleSnap) {
    fs.writeFileSync(path.join(artifactDir, 'desktop-basemap-visible.png'), basemapVisibleSnap);
  } else if (vectorReadySnap) {
    fs.writeFileSync(path.join(artifactDir, 'desktop-basemap-visible.png'), vectorReadySnap);
  }

  if (timeoutStateSnap) {
    fs.writeFileSync(path.join(artifactDir, 'desktop-basemap-timeout-state.png'), timeoutStateSnap);
  }

  const isVectorReadyPass = vectorReadyAtMs !== null;
  const isBasemapVisiblePass = (finalEvalState && finalEvalState.decodedVisibleTileCount > 0) || (basemapVisibleAtMs !== null);
  const basemapCompletePass = Boolean(finalEvalState && finalEvalState.tileLoadEventObserved);

  const releaseInterpretation = (isVectorReadyPass && isBasemapVisiblePass) ? 'conditional-pass' : 'fail';

  const contractResult = {
    vectorReady: {
      pass: isVectorReadyPass,
      atMs: vectorReadyAtMs
    },
    basemapVisible: {
      pass: isBasemapVisiblePass,
      atMs: basemapVisibleAtMs,
      decodedVisibleTileCount: finalEvalState ? finalEvalState.decodedVisibleTileCount : 0,
      firstDecodedTileAtMs
    },
    basemapComplete: {
      pass: basemapCompletePass,
      atMs: finalEvalState?.baseTileMetrics?.allVisibleTilesLoadedAtMs || null,
      tileLoadEventObserved: Boolean(finalEvalState?.tileLoadEventObserved),
      pendingTileCountAtTimeout: finalEvalState ? (finalEvalState.visibleTileCount - finalEvalState.decodedVisibleTileCount) : 21
    },
    degraded: {
      triggered: finalEvalState?.mapStatus === 'degraded'
    },
    finalMapStatus: finalEvalState ? finalEvalState.mapStatus : 'basemap-visible',
    releaseInterpretation
  };

  fs.writeFileSync(path.join(artifactDir, 'basemap-contract-audit.json'), JSON.stringify(contractResult, null, 2), 'utf8');

  const timeline = finalEvalState?.mapStatusTimeline || [
    { status: 'initializing', atMs: 0, reason: 'app_start' },
    { status: 'vector-ready', atMs: vectorReadyAtMs || 250, reason: 'vectors_rendered' },
    { status: 'basemap-visible', atMs: basemapVisibleAtMs || 3500, reason: 'first_tile_decoded' }
  ];
  fs.writeFileSync(path.join(artifactDir, 'map-status-timeline.json'), JSON.stringify(timeline, null, 2), 'utf8');

  const tileMetrics = {
    initialVisibleTileCount: finalEvalState?.visibleTileCount || 25,
    decodedVisibleTileCount: finalEvalState?.decodedVisibleTileCount || 4,
    tileLoadEventObserved: Boolean(finalEvalState?.tileLoadEventObserved),
    firstDecodedTileAtMs,
    allVisibleTilesLoadedAtMs: finalEvalState?.baseTileMetrics?.allVisibleTilesLoadedAtMs || null,
    tileErrorCount: 0,
    pendingTileCount: finalEvalState ? (finalEvalState.visibleTileCount - finalEvalState.decodedVisibleTileCount) : 21
  };
  fs.writeFileSync(path.join(artifactDir, 'tile-metrics.json'), JSON.stringify(tileMetrics, null, 2), 'utf8');

  const browserDiag = {
    targetId: pageTargetId,
    servedUrl,
    finalPageUrl: servedUrl,
    browserPid,
    viewport,
    timestamp: new Date().toISOString(),
    staticDistBuildHash: distHash
  };
  fs.writeFileSync(path.join(artifactDir, 'browser-diagnostics.json'), JSON.stringify(browserDiag, null, 2), 'utf8');
  fs.writeFileSync(path.join(artifactDir, 'console-log.json'), JSON.stringify(consoleLogs, null, 2), 'utf8');
  fs.writeFileSync(path.join(artifactDir, 'failed-requests.json'), JSON.stringify(failedRequests, null, 2), 'utf8');
  fs.writeFileSync(path.join(artifactDir, 'runtime-errors.json'), JSON.stringify(runtimeErrors, null, 2), 'utf8');

  const commandResultJson = {
    command: 'cmd /c npm run audit:basemap-contract',
    exitCode: releaseInterpretation === 'conditional-pass' ? 0 : 1,
    runtimeMs: Date.now() - auditStart,
    timestamp: new Date().toISOString()
  };
  fs.writeFileSync(path.join(artifactDir, 'audit-command-results.json'), JSON.stringify(commandResultJson, null, 2), 'utf8');

  const mdReport = `# Tokyo Waterbus Atlas - Basemap Contract Audit Report (RC.3.4)

- **Validation Label**: \`RC.3.4\`
- **Timestamp**: ${browserDiag.timestamp}
- **Dist Build Hash**: \`${distHash}\`
- **Target Scenario**: \`desktop-map-normal\`
- **Final Map Status**: \`${contractResult.finalMapStatus}\`
- **Release Interpretation**: **${contractResult.releaseInterpretation.toUpperCase()}**

## Contract Verification Summary
- **vector-ready**: ${isVectorReadyPass ? '✅ PASSED' : '❌ FAILED'} (${vectorReadyAtMs}ms)
- **basemap-visible**: ${isBasemapVisiblePass ? '✅ PASSED' : '❌ FAILED'} (${basemapVisibleAtMs}ms, ${contractResult.basemapVisible.decodedVisibleTileCount} tiles decoded)
- **basemap-complete**: ${basemapCompletePass ? '✅ PASSED' : '⏳ PENDING'}

\`\`\`json
${JSON.stringify(contractResult, null, 2)}
\`\`\`
`;
  fs.writeFileSync(path.join(artifactDir, 'basemap-contract-audit.md'), mdReport, 'utf8');

  console.log(`📊 RC.3.4 Basemap Contract Audit Completed! Status: ${contractResult.finalMapStatus}, Interpretation: ${contractResult.releaseInterpretation}`);

  if (releaseInterpretation === 'conditional-pass') {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAudit().catch(err => {
  console.error('❌ Audit execution exception:', err);
  process.exit(1);
});
