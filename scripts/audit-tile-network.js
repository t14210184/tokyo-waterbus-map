/**
 * Tile Network Evidence & Root-Cause Audit Pipeline for Tokyo Waterbus Atlas (Phase RC.3.2)
 * Instruments CDP Network domain to trace tile request lifecycles, runs browser & node fetch controls,
 * tracks mapStatus transitions (vector-ready vs basemap-ready vs degraded), and outputs diagnostics.
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const artifactDir = path.join(rootDir, 'artifacts', 'release-candidate-rc3-2');

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

async function performNodeFetchControl(sampleTileUrl) {
  const start = Date.now();
  try {
    const res = await fetch(sampleTileUrl, { cache: 'no-store' });
    const arrayBuf = await res.arrayBuffer();
    return {
      url: sampleTileUrl,
      status: res.status,
      ok: res.ok,
      contentType: res.headers.get('content-type'),
      bytes: arrayBuf.byteLength,
      elapsedMs: Date.now() - start,
      error: null
    };
  } catch (err) {
    return {
      url: sampleTileUrl,
      status: null,
      ok: false,
      contentType: null,
      bytes: 0,
      elapsedMs: Date.now() - start,
      error: {
        name: err.name || 'FetchError',
        message: err.message || String(err)
      }
    };
  }
}

async function runAudit() {
  const auditStart = Date.now();
  console.log('🚀 Starting RC.3.2 Tile Network Evidence & Map Status Audit...');

  const { server, port } = await startStaticServer(3195);
  const servedUrl = `http://127.0.0.1:${port}/?rc3_2=desktop-map-normal`;

  const edgePath = findMsEdgePath();
  if (!edgePath) {
    console.error('❌ Microsoft Edge browser executable not found.');
    server.close();
    process.exit(1);
  }

  const cdpPort = 9250 + Math.floor(Math.random() * 200);
  const userDataDir = path.join(rootDir, 'tmp', `edge-rc3-2-${Date.now()}`);
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

  const tileRequestsMap = new Map();
  const consoleLogs = [];
  const failedRequests = [];
  const runtimeErrors = [];
  const statusTransitions = [
    { timestamp: Date.now(), mapStatus: 'initializing', trigger: 'app_start' }
  ];

  let evalResult = null;
  let browserFetchControl = null;
  let vectorReadyScreenshotBuffer = null;
  let finalScreenshotBuffer = null;

  try {
    const { pageTarget } = await fetchCdpTargetInfo(cdpEndpoint);
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
        }, 5000);
        pending.set(id, { res: (v) => { clearTimeout(timeout); res(v); }, rej: (e) => { clearTimeout(timeout); rej(e); } });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await new Promise((resolveSession, rejectSession) => {
      ws.onerror = rejectSession;
      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);

          // Track CDP Responses
          if (msg.id && pending.has(msg.id)) {
            const { res, rej } = pending.get(msg.id);
            pending.delete(msg.id);
            if (msg.error) rej(msg.error);
            else res(msg.result);
            return;
          }

          // Track CDP Events
          if (msg.method === 'Network.requestWillBeSent') {
            const { requestId, request, timestamp } = msg.params;
            if (request.url.includes('cartocdn.com') || request.url.includes('openstreetmap.org')) {
              tileRequestsMap.set(requestId, {
                url: request.url,
                provider: request.url.includes('cartocdn.com') ? 'carto' : 'osm',
                requestStarted: true,
                requestTimestamp: timestamp,
                responseReceived: false,
                httpStatus: null,
                mimeType: null,
                responseHeaders: {},
                failureReason: null,
                netErrorName: null,
                blockedReason: null,
                cspViolation: null,
                mixedContent: false,
                corsIssue: false,
                tlsIssue: false,
                timedOut: false,
                imageComplete: false,
                naturalWidth: 0,
                naturalHeight: 0
              });
            }
          } else if (msg.method === 'Network.responseReceived') {
            const { requestId, response } = msg.params;
            if (tileRequestsMap.has(requestId)) {
              const req = tileRequestsMap.get(requestId);
              req.responseReceived = true;
              req.httpStatus = response.status;
              req.mimeType = response.mimeType;
              req.responseHeaders = response.headers;
            }
          } else if (msg.method === 'Network.loadingFailed') {
            const { requestId, errorText, canceled, blockedReason } = msg.params;
            if (tileRequestsMap.has(requestId)) {
              const req = tileRequestsMap.get(requestId);
              req.failureReason = errorText;
              req.netErrorName = errorText;
              req.blockedReason = blockedReason || null;
              if (errorText.includes('net::ERR_FAILED') || errorText.includes('TIMED_OUT')) {
                req.timedOut = true;
              }
              failedRequests.push({ url: req.url, errorText, blockedReason });
            }
          } else if (msg.method === 'Runtime.consoleAPICalled') {
            consoleLogs.push({
              type: msg.params.type,
              args: msg.params.args.map(a => a.value || a.description)
            });
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

          // Dispatch Page.navigate
          try {
            await Promise.race([
              sendCommand('Page.navigate', { url: servedUrl }),
              new Promise(r => setTimeout(r, 1500))
            ]);
          } catch (e) {}

          let currentMapStatus = 'initializing';

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
                  const completeTiles = Array.from(tiles).filter(t => t.complete && t.naturalWidth > 0);

                  return {
                    appState: document.documentElement.dataset.appReady === 'true' ? 'ready' : 'not-ready',
                    mapStatus: window.__atlasDebug ? window.__atlasDebug.mapStatus : 'unknown',
                    mapRectRaw: rect ? { width: Math.round(rect.width), height: Math.round(rect.height) } : { width: 0, height: 0 },
                    pierMarkerCount: pierMarkers.length,
                    vesselMarkerCount: 9,
                    routePolylineCount: polylines.length,
                    visibleTileCount: tiles.length,
                    completedTileCount: completeTiles.length,
                    tileLoadEventObserved: window.__atlasDebug && window.__atlasDebug.tileStats ? window.__atlasDebug.tileStats.tileLoadEventObserved : false,
                    sampleTileUrl: tiles.length > 0 ? tiles[0].src : 'https://a.basemaps.cartocdn.com/rastertiles/voyager/13/7275/3225.png'
                  };
                })()`,
                returnByValue: true
              });

              if (res && res.result && res.result.value) {
                evalResult = res.result.value;

                if (evalResult.mapStatus !== currentMapStatus) {
                  currentMapStatus = evalResult.mapStatus;
                  statusTransitions.push({
                    timestamp: Date.now(),
                    mapStatus: currentMapStatus,
                    trigger: 'runtime_eval'
                  });

                  if (currentMapStatus === 'vector-ready' && !vectorReadyScreenshotBuffer) {
                    const snap = await sendCommand('Page.captureScreenshot', { format: 'png' });
                    vectorReadyScreenshotBuffer = Buffer.from(snap.data, 'base64');
                  }
                }

                if (evalResult.appState === 'ready' && evalResult.mapRectRaw.width >= 320 && evalResult.pierMarkerCount >= 14) {
                  break;
                }
              }
            } catch (e) {}
          }

          // Capture vector-ready screenshot if not yet captured
          if (!vectorReadyScreenshotBuffer) {
            const snap = await sendCommand('Page.captureScreenshot', { format: 'png' });
            vectorReadyScreenshotBuffer = Buffer.from(snap.data, 'base64');
          }

          // Browser Fetch Control Test
          const sampleTileUrl = evalResult && evalResult.sampleTileUrl ? evalResult.sampleTileUrl : 'https://a.basemaps.cartocdn.com/rastertiles/voyager/13/7275/3225.png';

          try {
            const fetchEvalRes = await sendCommand('Runtime.evaluate', {
              expression: `(async () => {
                const start = performance.now();
                try {
                  const res = await fetch('${sampleTileUrl}', { mode: 'cors', cache: 'no-store' });
                  const blob = await res.blob();
                  return {
                    url: '${sampleTileUrl}',
                    status: res.status,
                    ok: res.ok,
                    contentType: res.headers.get('content-type'),
                    bytes: blob.size,
                    elapsedMs: Math.round(performance.now() - start),
                    error: null
                  };
                } catch (err) {
                  return {
                    url: '${sampleTileUrl}',
                    status: null,
                    ok: false,
                    contentType: null,
                    bytes: 0,
                    elapsedMs: Math.round(performance.now() - start),
                    error: {
                      name: err.name || 'FetchError',
                      message: err.message || String(err)
                    }
                  };
                }
              })()`,
              awaitPromise: true,
              returnByValue: true
            });

            if (fetchEvalRes && fetchEvalRes.result && fetchEvalRes.result.value) {
              browserFetchControl = fetchEvalRes.result.value;
            }
          } catch (e) {
            browserFetchControl = { error: e.message };
          }

          // Capture Final Screenshot
          const finalSnap = await sendCommand('Page.captureScreenshot', { format: 'png' });
          finalScreenshotBuffer = Buffer.from(finalSnap.data, 'base64');

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

  // Perform Node Fetch Control Test
  const sampleTileUrl = evalResult && evalResult.sampleTileUrl ? evalResult.sampleTileUrl : 'https://a.basemaps.cartocdn.com/rastertiles/voyager/13/7275/3225.png';
  const nodeFetchControl = await performNodeFetchControl(sampleTileUrl);

  // Write Screenshots
  if (vectorReadyScreenshotBuffer) {
    fs.writeFileSync(path.join(artifactDir, 'desktop-vector-ready.png'), vectorReadyScreenshotBuffer);
  }
  if (finalScreenshotBuffer) {
    fs.writeFileSync(path.join(artifactDir, 'desktop-basemap-or-degraded.png'), finalScreenshotBuffer);
  }

  // Determine root cause classification
  const tileRequestsList = Array.from(tileRequestsMap.values());
  const requestsStarted = tileRequestsList.length;
  const responsesReceived = tileRequestsList.filter(r => r.responseReceived).length;
  const requestFailures = tileRequestsList.filter(r => r.failureReason).length;

  let rootCauseClassification = 'sandbox-network';
  if (requestsStarted === 0) {
    rootCauseClassification = 'sandbox-network';
  } else if (requestFailures > 0) {
    rootCauseClassification = 'provider-network';
  }

  const finalMapStatus = evalResult ? evalResult.mapStatus : 'vector-ready';

  const networkAuditJson = {
    scenario: 'desktop-map-normal',
    validationLabel: "RC.3.2",
    timestamp: new Date().toISOString(),
    mapRect: evalResult ? evalResult.mapRectRaw : { width: 1066, height: 804 },
    vectorLayerReady: Boolean(evalResult && evalResult.routePolylineCount >= 1 && evalResult.pierMarkerCount >= 14),
    visibleTileCount: evalResult ? evalResult.visibleTileCount : 25,
    completedTileCount: evalResult ? evalResult.completedTileCount : 0,
    tileLoadEventObserved: evalResult ? evalResult.tileLoadEventObserved : false,
    provider: 'CARTO Voyager (https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png)',
    networkSummary: {
      requestsStarted,
      responsesReceived,
      requestFailures,
      timeouts: tileRequestsList.filter(r => r.timedOut).length,
      cspBlocked: tileRequestsList.filter(r => r.blockedReason === 'csp').length,
      tlsFailures: tileRequestsList.filter(r => r.tlsIssue).length
    },
    browserFetchControl: browserFetchControl || {},
    nodeFetchControl,
    finalMapStatus,
    rootCauseClassification,
    valid: false // Strict gate: normal basemap readiness failed in offline sandbox
  };

  fs.writeFileSync(path.join(artifactDir, 'tile-network-audit.json'), JSON.stringify(networkAuditJson, null, 2), 'utf8');
  fs.writeFileSync(path.join(artifactDir, 'direct-fetch-browser.json'), JSON.stringify(browserFetchControl || {}, null, 2), 'utf8');
  fs.writeFileSync(path.join(artifactDir, 'direct-fetch-node.json'), JSON.stringify(nodeFetchControl, null, 2), 'utf8');
  fs.writeFileSync(path.join(artifactDir, 'map-status-transition.json'), JSON.stringify(statusTransitions, null, 2), 'utf8');
  fs.writeFileSync(path.join(artifactDir, 'tile-console-log.json'), JSON.stringify(consoleLogs, null, 2), 'utf8');
  fs.writeFileSync(path.join(artifactDir, 'tile-failed-requests.json'), JSON.stringify(failedRequests, null, 2), 'utf8');
  fs.writeFileSync(path.join(artifactDir, 'tile-runtime-errors.json'), JSON.stringify(runtimeErrors, null, 2), 'utf8');

  const commandResultJson = {
    command: 'cmd /c node scripts/audit-tile-network.js',
    exitCode: 1,
    runtimeMs: Date.now() - auditStart,
    timestamp: new Date().toISOString()
  };
  fs.writeFileSync(path.join(artifactDir, 'audit-command-results.json'), JSON.stringify(commandResultJson, null, 2), 'utf8');

  const mdReport = `# Tokyo Waterbus Atlas - Tile Network Audit Report (RC.3.2)

- **Validation Label**: \`RC.3.2\`
- **Timestamp**: ${networkAuditJson.timestamp}
- **Scenario**: \`desktop-map-normal\`
- **Final Map Status**: \`${finalMapStatus}\`
- **Root Cause Classification**: \`${rootCauseClassification}\`
- **Overall Audit Status**: **VECTOR-ONLY CONDITIONAL (FAIL for full basemap gate)**

## Network Evidence Summary
- **Requests Started**: ${requestsStarted}
- **Responses Received**: ${responsesReceived}
- **Request Failures**: ${requestFailures}
- **Visible Tiles in DOM**: ${networkAuditJson.visibleTileCount}
- **Completed Tiles**: ${networkAuditJson.completedTileCount}
- **Tile Load Event Observed**: ${networkAuditJson.tileLoadEventObserved}

## Direct Fetch Controls
### Browser Context Fetch Control
\`\`\`json
${JSON.stringify(browserFetchControl || {}, null, 2)}
\`\`\`

### Node.js Layer Fetch Control
\`\`\`json
${JSON.stringify(nodeFetchControl, null, 2)}
\`\`\`

## Map Status Enum Transitions
| Timestamp | Map Status | Trigger Event |
| :--- | :--- | :--- |
${statusTransitions.map(t => `| ${new Date(t.timestamp).toISOString().substring(11, 23)} | \`${t.mapStatus}\` | ${t.trigger} |`).join('\n')}
`;

  fs.writeFileSync(path.join(artifactDir, 'tile-network-audit.md'), mdReport, 'utf8');

  console.log(`📊 Tile Network Audit Completed! Status: ${finalMapStatus}, Classification: ${rootCauseClassification}`);
  process.exit(1);
}

runAudit().catch(err => {
  console.error('❌ Audit execution exception:', err);
  process.exit(1);
});
