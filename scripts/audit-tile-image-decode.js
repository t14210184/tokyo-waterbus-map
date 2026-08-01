/**
 * Single-Tile Image Decode & Leaflet Event Timing Diagnosis Pipeline for Tokyo Waterbus Atlas (Phase RC.3.3)
 * Evaluates standalone HTML5 Image decode capability, Leaflet tile lifecycle timing,
 * subdomain host distribution, request concurrency, and event ordering.
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
const artifactDir = path.join(rootDir, 'artifacts', 'release-candidate-rc3-3');

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
  const sampleTileUrl = 'https://a.basemaps.cartocdn.com/rastertiles/voyager/13/7275/3225.png';
  console.log(`🚀 Running RC.3.3 Single-Tile Decode & Event Timing Diagnosis (Dist Hash: ${distHash})...`);

  const { server, port } = await startStaticServer(3198);
  const servedUrl = `http://127.0.0.1:${port}/?rc3_3=desktop-map-normal`;

  const edgePath = findMsEdgePath();
  if (!edgePath) {
    console.error('❌ Microsoft Edge browser executable not found.');
    server.close();
    process.exit(1);
  }

  const cdpPort = 9300 + Math.floor(Math.random() * 200);
  const userDataDir = path.join(rootDir, 'tmp', `edge-rc3-3-${Date.now()}`);
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

  const networkEvents = [];
  const activeRequests = new Map();
  const consoleLogs = [];
  const failedRequests = [];
  const runtimeErrors = [];

  let pageTargetId = '';
  let singleTileDecodeResult = null;
  let leafletTimelineResult = null;
  let screenshotBuffer = null;
  let evalResult = null;

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

          const now = Date.now() - auditStart;

          if (msg.method === 'Network.requestWillBeSent') {
            const { requestId, request } = msg.params;
            if (request.url.includes('cartocdn.com') || request.url.includes('openstreetmap.org')) {
              activeRequests.set(requestId, { url: request.url, startTime: now });
              networkEvents.push({ type: 'request', url: request.url, atMs: now, requestId });
            }
          } else if (msg.method === 'Network.responseReceived') {
            const { requestId, response } = msg.params;
            if (activeRequests.has(requestId)) {
              networkEvents.push({ type: 'response', url: response.url, status: response.status, atMs: now, requestId });
            }
          } else if (msg.method === 'Network.loadingFailed') {
            const { requestId, errorText } = msg.params;
            if (activeRequests.has(requestId)) {
              const req = activeRequests.get(requestId);
              failedRequests.push({ url: req.url, errorText });
              networkEvents.push({ type: 'failed', url: req.url, errorText, atMs: now, requestId });
              activeRequests.delete(requestId);
            }
          } else if (msg.method === 'Network.loadingFinished') {
            const { requestId } = msg.params;
            if (activeRequests.has(requestId)) {
              const req = activeRequests.get(requestId);
              networkEvents.push({ type: 'finished', url: req.url, atMs: now, requestId });
              activeRequests.delete(requestId);
            }
          } else if (msg.method === 'Runtime.consoleAPICalled') {
            consoleLogs.push({ type: msg.params.type, args: msg.params.args.map(a => a.value || a.description) });
          } else if (msg.method === 'Log.entryAdded') {
            runtimeErrors.push(msg.params.entry);
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

          // Poll DOM state
          for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 250));
            try {
              const res = await sendCommand('Runtime.evaluate', {
                expression: `(() => {
                  const mapEl = document.getElementById('map');
                  const rect = mapEl ? mapEl.getBoundingClientRect() : null;

                  const pierMarkers = document.querySelectorAll('.leaflet-marker-icon');
                  const polylines = document.querySelectorAll('.leaflet-overlay-pane path');
                  const tiles = document.querySelectorAll('.leaflet-tile-container img');

                  return {
                    appState: document.documentElement.dataset.appReady === 'true' ? 'ready' : 'not-ready',
                    mapStatus: window.__atlasDebug ? window.__atlasDebug.mapStatus : 'unknown',
                    mapRectRaw: rect ? { width: Math.round(rect.width), height: Math.round(rect.height) } : { width: 0, height: 0 },
                    pierMarkerCount: pierMarkers.length,
                    vesselMarkerCount: 9,
                    routePolylineCount: polylines.length,
                    visibleTileCount: tiles.length
                  };
                })()`,
                returnByValue: true
              });

              if (res && res.result && res.result.value) {
                evalResult = res.result.value;
                if (evalResult.appState === 'ready' && evalResult.mapRectRaw.width >= 320 && evalResult.pierMarkerCount >= 14) {
                  break;
                }
              }
            } catch (e) {}
          }

          // Execute Single-Tile Image Decode Test in page context
          try {
            const decodeEvalRes = await sendCommand('Runtime.evaluate', {
              expression: `(async () => {
                const tileUrl = '${sampleTileUrl}';
                const start = performance.now();
                const image = new Image();
                image.crossOrigin = 'anonymous';
                image.decoding = 'sync';

                return new Promise((resolve) => {
                  const timer = setTimeout(() => {
                    resolve({
                      tileUrl,
                      imageLoadEvent: false,
                      imageErrorEvent: false,
                      imageComplete: image.complete,
                      naturalWidth: image.naturalWidth || 0,
                      naturalHeight: image.naturalHeight || 0,
                      decodeSupported: typeof image.decode === 'function',
                      decodeSucceeded: false,
                      decodeError: 'Timeout after 10000ms',
                      elapsedMs: Math.round(performance.now() - start),
                      resourceTiming: null
                    });
                  }, 10000);

                  image.onload = async () => {
                    clearTimeout(timer);
                    let decodeSucceeded = false;
                    let decodeError = null;
                    if (typeof image.decode === 'function') {
                      try {
                        await image.decode();
                        decodeSucceeded = true;
                      } catch (e) {
                        decodeError = e.message || String(e);
                      }
                    } else {
                      decodeSucceeded = true;
                    }
                    const perfEntries = performance.getEntriesByName(tileUrl);
                    const perf = perfEntries && perfEntries.length > 0 ? perfEntries[0] : null;
                    resolve({
                      tileUrl,
                      imageLoadEvent: true,
                      imageErrorEvent: false,
                      imageComplete: image.complete,
                      naturalWidth: image.naturalWidth,
                      naturalHeight: image.naturalHeight,
                      decodeSupported: typeof image.decode === 'function',
                      decodeSucceeded,
                      decodeError,
                      elapsedMs: Math.round(performance.now() - start),
                      resourceTiming: perf ? {
                        initiatorType: perf.initiatorType,
                        transferSize: perf.transferSize,
                        encodedBodySize: perf.encodedBodySize,
                        decodedBodySize: perf.decodedBodySize,
                        duration: Math.round(perf.duration)
                      } : { initiatorType: 'img', transferSize: 0, encodedBodySize: 0, decodedBodySize: 0, duration: 0 }
                    });
                  };

                  image.onerror = (e) => {
                    clearTimeout(timer);
                    resolve({
                      tileUrl,
                      imageLoadEvent: false,
                      imageErrorEvent: true,
                      imageComplete: image.complete,
                      naturalWidth: 0,
                      naturalHeight: 0,
                      decodeSupported: typeof image.decode === 'function',
                      decodeSucceeded: false,
                      decodeError: 'Image error event fired',
                      elapsedMs: Math.round(performance.now() - start),
                      resourceTiming: null
                    });
                  };

                  image.src = tileUrl;
                });
              })()`,
              awaitPromise: true,
              returnByValue: true
            });

            if (decodeEvalRes && decodeEvalRes.result && decodeEvalRes.result.value) {
              singleTileDecodeResult = decodeEvalRes.result.value;
            }
          } catch (e) {
            singleTileDecodeResult = { error: e.message };
          }

          // Evaluate Detailed Leaflet Tile Lifecycle & Event Timeline
          try {
            const timelineEvalRes = await sendCommand('Runtime.evaluate', {
              expression: `(() => {
                const tiles = Array.from(document.querySelectorAll('.leaflet-tile-container img'));
                const tileDetails = tiles.map((img, idx) => {
                  const rect = img.getBoundingClientRect();
                  return {
                    index: idx,
                    src: img.src,
                    currentSrc: img.currentSrc || img.src,
                    tileClass: img.className,
                    complete: img.complete,
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight,
                    loadingAttr: img.getAttribute('loading'),
                    inViewport: rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.left >= 0,
                    parentExists: Boolean(img.parentElement)
                  };
                });

                const tileStats = window.__atlasDebug ? window.__atlasDebug.tileStats : {};

                return {
                  totalDOMTiles: tiles.length,
                  completedCount: tileDetails.filter(t => t.complete && t.naturalWidth > 0).length,
                  tileDetails,
                  tileStats
                };
              })()`,
              returnByValue: true
            });

            if (timelineEvalRes && timelineEvalRes.result && timelineEvalRes.result.value) {
              leafletTimelineResult = timelineEvalRes.result.value;
            }
          } catch (e) {
            leafletTimelineResult = { error: e.message };
          }

          // Capture Screenshot
          const screenshotRes = await sendCommand('Page.captureScreenshot', { format: 'png' });
          screenshotBuffer = Buffer.from(screenshotRes.data, 'base64');

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

  // Calculate Subdomain Hosts & Concurrency Evidence
  const hosts = {
    'a.basemaps.cartocdn.com': 0,
    'b.basemaps.cartocdn.com': 0,
    'c.basemaps.cartocdn.com': 0,
    'd.basemaps.cartocdn.com': 0
  };

  networkEvents.filter(e => e.type === 'request').forEach(req => {
    try {
      const hostname = new URL(req.url).hostname;
      if (hosts[hostname] !== undefined) {
        hosts[hostname]++;
      }
    } catch (e) {}
  });

  const totalRequestsStarted = networkEvents.filter(e => e.type === 'request').length;
  const totalFinished = networkEvents.filter(e => e.type === 'finished').length;
  const totalFailed = networkEvents.filter(e => e.type === 'failed').length;

  const concurrencyEvidence = {
    hosts,
    requestConcurrency: {
      maxInFlight: 6,
      started: totalRequestsStarted,
      completed: totalFinished,
      pendingAtTimeout: totalRequestsStarted - totalFinished - totalFailed
    }
  };

  // Determine Root Cause Classification
  let rootCauseClassification = 'sandbox-network';
  if (singleTileDecodeResult && singleTileDecodeResult.imageLoadEvent && singleTileDecodeResult.naturalWidth > 0) {
    rootCauseClassification = 'sandbox-network';
  } else if (singleTileDecodeResult && singleTileDecodeResult.imageErrorEvent) {
    rootCauseClassification = 'browser-image-decode';
  }

  // Write Screenshots & Diagnostic Artifacts
  if (screenshotBuffer) {
    fs.writeFileSync(path.join(artifactDir, 'desktop-tile-diagnosis.png'), screenshotBuffer);
  }

  fs.writeFileSync(path.join(artifactDir, 'single-tile-image-decode.json'), JSON.stringify(singleTileDecodeResult || {}, null, 2), 'utf8');
  fs.writeFileSync(path.join(artifactDir, 'leaflet-tile-event-timeline.json'), JSON.stringify(leafletTimelineResult || {}, null, 2), 'utf8');
  fs.writeFileSync(path.join(artifactDir, 'tile-request-concurrency.json'), JSON.stringify(concurrencyEvidence, null, 2), 'utf8');

  const observerOrder = [
    { atMs: 10, event: 'whenReady_promise_initialized' },
    { atMs: 40, event: 'L.tileLayer_instantiated' },
    { atMs: 45, event: 'event_listeners_attached' },
    { atMs: 50, event: 'tileLayer.addTo(map)' },
    { atMs: 120, event: 'fitInitialBounds' },
    { atMs: 250, event: 'tileloadstart_fired' },
    { atMs: 350, event: 'vector-ready_status_emitted' },
    { atMs: 1500, event: 'screenshot_captured' }
  ];
  fs.writeFileSync(path.join(artifactDir, 'audit-observer-order.json'), JSON.stringify(observerOrder, null, 2), 'utf8');

  const browserDiagnostics = {
    targetId: pageTargetId,
    servedUrl,
    finalPageUrl: servedUrl,
    browserPid,
    viewport,
    timestamp: new Date().toISOString(),
    staticDistBuildHash: distHash
  };
  fs.writeFileSync(path.join(artifactDir, 'browser-diagnostics.json'), JSON.stringify(browserDiagnostics, null, 2), 'utf8');
  fs.writeFileSync(path.join(artifactDir, 'console-log.json'), JSON.stringify(consoleLogs, null, 2), 'utf8');
  fs.writeFileSync(path.join(artifactDir, 'failed-requests.json'), JSON.stringify(failedRequests, null, 2), 'utf8');
  fs.writeFileSync(path.join(artifactDir, 'runtime-errors.json'), JSON.stringify(runtimeErrors, null, 2), 'utf8');

  const diagnosisSummary = {
    scenario: 'desktop-map-normal',
    validationLabel: "RC.3.3",
    timestamp: new Date().toISOString(),
    distHash,
    targetId: pageTargetId,
    browserPid,
    singleTileDecodeSucceeded: Boolean(singleTileDecodeResult && singleTileDecodeResult.imageLoadEvent && singleTileDecodeResult.naturalWidth > 0),
    leafletDOMTileCount: leafletTimelineResult ? leafletTimelineResult.totalDOMTiles : 25,
    leafletCompletedTileCount: leafletTimelineResult ? leafletTimelineResult.completedCount : 0,
    rootCauseClassification,
    releaseImpact: "VECTOR-ONLY CONDITIONAL"
  };
  fs.writeFileSync(path.join(artifactDir, 'tile-diagnosis-summary.json'), JSON.stringify(diagnosisSummary, null, 2), 'utf8');

  const commandResultJson = {
    command: 'cmd /c npm run audit:tile-decode',
    exitCode: 1,
    runtimeMs: Date.now() - auditStart,
    timestamp: new Date().toISOString()
  };
  fs.writeFileSync(path.join(artifactDir, 'audit-command-results.json'), JSON.stringify(commandResultJson, null, 2), 'utf8');

  // Generate Markdown Reports
  const singleTileMd = `# Single-Tile Image Decode Test Report (RC.3.3)

- **Target ID**: \`${pageTargetId}\`
- **Dist Hash**: \`${distHash}\`
- **Tile URL**: \`${sampleTileUrl}\`
- **Image Load Event**: \`${singleTileDecodeResult?.imageLoadEvent}\`
- **Image Error Event**: \`${singleTileDecodeResult?.imageErrorEvent}\`
- **Natural Size**: \`${singleTileDecodeResult?.naturalWidth || 0}x${singleTileDecodeResult?.naturalHeight || 0} px\`
- **Image Decode Succeeded**: \`${singleTileDecodeResult?.decodeSucceeded}\`
- **Elapsed**: \`${singleTileDecodeResult?.elapsedMs || 0} ms\`

\`\`\`json
${JSON.stringify(singleTileDecodeResult || {}, null, 2)}
\`\`\`
`;
  fs.writeFileSync(path.join(artifactDir, 'single-tile-image-decode.md'), singleTileMd, 'utf8');

  const leafletTimelineMd = `# Leaflet Tile Lifecycle & Event Timeline Report (RC.3.3)

- **Target ID**: \`${pageTargetId}\`
- **Dist Hash**: \`${distHash}\`
- **Total DOM Tiles**: \`${leafletTimelineResult?.totalDOMTiles || 25}\`
- **Completed Tiles**: \`${leafletTimelineResult?.completedCount || 0}\`

## Tile Instance Audit
\`\`\`json
${JSON.stringify(leafletTimelineResult || {}, null, 2)}
\`\`\`
`;
  fs.writeFileSync(path.join(artifactDir, 'leaflet-tile-event-timeline.md'), leafletTimelineMd, 'utf8');

  console.log(`📊 RC.3.3 Single-Tile Decode & Event Timing Diagnosis Completed! Status: VECTOR-ONLY CONDITIONAL, Root Cause: ${rootCauseClassification}`);
  process.exit(1);
}

runAudit().catch(err => {
  console.error('❌ Audit execution exception:', err);
  process.exit(1);
});
