import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import zlib from 'zlib';

const rootDir = process.cwd();
const artifactDir = path.join(rootDir, 'artifacts', 'phase1a-i18n-pier-cards');

if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true });
}

function safeWriteFileSync(filePath, content) {
  const fd = fs.openSync(filePath, 'w');
  fs.writeFileSync(fd, content, 'utf8');
  fs.fsyncSync(fd);
  fs.closeSync(fd);
}

function safeWriteBufferSync(filePath, buffer) {
  const fd = fs.openSync(filePath, 'w');
  fs.writeFileSync(fd, buffer);
  fs.fsyncSync(fd);
  fs.closeSync(fd);
}

function parsePngMetrics(buffer) {
  if (buffer.readUInt32BE(0) !== 0x89504e47 || buffer.readUInt32BE(4) !== 0x0d0a1a0a) {
    throw new Error('Not a PNG file');
  }

  let offset = 8;
  let width = 0, height = 0, bitDepth = 0, colorType = 0;
  const idatChunks = [];
  let palette = null;

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === 'PLTE') {
      palette = data;
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }
  }

  const compressed = Buffer.concat(idatChunks);
  const decompressed = zlib.inflateSync(compressed);

  let bytesPerPixel = 3;
  if (colorType === 6) bytesPerPixel = 4;
  else if (colorType === 0 || colorType === 3) bytesPerPixel = 1;

  const stride = width * bytesPerPixel;
  const rawPixels = Buffer.alloc(width * height * 3);

  let srcOffset = 0;
  const prevLine = Buffer.alloc(stride);
  const currentLine = Buffer.alloc(stride);

  for (let y = 0; y < height; y++) {
    const filter = decompressed[srcOffset++];
    const lineData = decompressed.subarray(srcOffset, srcOffset + stride);
    srcOffset += stride;

    for (let i = 0; i < stride; i++) {
      const x = lineData[i];
      const a = i >= bytesPerPixel ? currentLine[i - bytesPerPixel] : 0;
      const b = prevLine[i];
      const c = i >= bytesPerPixel ? prevLine[i - bytesPerPixel] : 0;

      let val = 0;
      if (filter === 0) val = x;
      else if (filter === 1) val = (x + a) & 0xff;
      else if (filter === 2) val = (x + b) & 0xff;
      else if (filter === 3) val = (x + Math.floor((a + b) / 2)) & 0xff;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        let pr = c;
        if (pa <= pb && pa <= pc) pr = a;
        else if (pb <= pc) pr = b;
        val = (x + pr) & 0xff;
      }
      currentLine[i] = val;
    }

    for (let px = 0; px < width; px++) {
      const outIdx = (y * width + px) * 3;
      if (colorType === 2 || colorType === 6) {
        rawPixels[outIdx] = currentLine[px * bytesPerPixel];
        rawPixels[outIdx + 1] = currentLine[px * bytesPerPixel + 1];
        rawPixels[outIdx + 2] = currentLine[px * bytesPerPixel + 2];
      } else if (colorType === 3 && palette) {
        const idx = currentLine[px];
        rawPixels[outIdx] = palette[idx * 3];
        rawPixels[outIdx + 1] = palette[idx * 3 + 1];
        rawPixels[outIdx + 2] = palette[idx * 3 + 2];
      } else {
        const g = currentLine[px];
        rawPixels[outIdx] = g;
        rawPixels[outIdx + 1] = g;
        rawPixels[outIdx + 2] = g;
      }
    }

    currentLine.copy(prevLine);
  }

  const totalPixels = width * height;
  const colorMap = new Map();
  let dominantColorHex = '#000000';
  let maxCount = 0;
  let nonBgCount = 0;

  // Background RGB: [7, 25, 35] (#071923)
  for (let i = 0; i < totalPixels; i++) {
    const r = rawPixels[i * 3];
    const g = rawPixels[i * 3 + 1];
    const b = rawPixels[i * 3 + 2];

    if (r !== 7 || g !== 25 || b !== 35) {
      nonBgCount++;
    }

    const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    const count = (colorMap.get(hex) || 0) + 1;
    colorMap.set(hex, count);
    if (count > maxCount) {
      maxCount = count;
      dominantColorHex = hex;
    }
  }

  return {
    width,
    height,
    pngSizeBytes: buffer.length,
    uniqueColorCount: colorMap.size,
    dominantColorHex,
    dominantRatio: totalPixels > 0 ? maxCount / totalPixels : 0,
    nonBackgroundRatio: totalPixels > 0 ? nonBgCount / totalPixels : 0
  };
}

async function runDiagnostic() {
  const runId = crypto.randomUUID();
  const startedAtUtc = new Date().toISOString();

  // Delete pre-existing success/failure output PNGs to prevent stale artifact reuse
  const successPngPath = path.join(artifactDir, 'diagnostic-zhTW-asakusa-card.png');
  const oldFailPath = path.join(artifactDir, 'diagnostic-failure-state.png');
  if (fs.existsSync(successPngPath)) fs.unlinkSync(successPngPath);
  if (fs.existsSync(oldFailPath)) fs.unlinkSync(oldFailPath);

  const timestamp = Date.now();
  const targetUrl = `https://t14210184.github.io/tokyo-waterbus-map/?lang=zh-TW&cdpdiag=${timestamp}`;
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const cdpPort = 9395;
  const userDataDir = path.resolve(rootDir, 'tmp', `cdp-diag-${timestamp}`);

  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }

  const result = {
    schemaVersion: 1,
    runId,
    startedAtUtc,
    completedAtUtc: "",
    publicUrl: targetUrl,
    cdpTargetInitialUrl: "about:blank",
    finalPageUrl: "",
    pageTitle: "",
    lifecycleReady: false,
    fontReady: false,
    shellReady: false,
    tabPostconditionPassed: false,
    pierPostconditionPassed: false,
    expectedTextPassed: false,
    consoleErrorCount: 0,
    pageExceptionCount: 0,
    screenshotWritten: false,
    outputPngSha256: "",
    screenshotPixelValidationPassed: false,
    pixelMetrics: null,
    failureReasons: [],
    microGate: "CDP_SINGLE_STATE_CAPTURE_BLOCKED"
  };

  console.log(`🔍 Starting Authoritative CDP Diagnostic [RunID: ${runId}]...`);

  const edgeProc = spawn(edgePath, [
    '--headless',
    '--disable-gpu',
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ], { windowsHide: true, stdio: 'ignore' });

  const runtimeErrors = [];
  let currentPhase = 'navigation';

  let cdpTarget = null;
  let lastErr = null;
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 300));
    try {
      const res = await fetch(`http://127.0.0.1:${cdpPort}/json`);
      const targets = await res.json();
      cdpTarget = targets.find(t => t.type === 'page');
      if (cdpTarget) break;
    } catch (e) {
      lastErr = e;
    }
  }

  if (!cdpTarget) {
    result.failureReasons.push(`Could not connect to CDP target on port ${cdpPort}: ${lastErr?.message}`);
    edgeProc.kill();
    finishRun(result, artifactDir, runtimeErrors);
  }

  result.cdpTargetInitialUrl = cdpTarget.url || 'about:blank';
  console.log('Connected to CDP target:', cdpTarget.webSocketDebuggerUrl);

  const ws = new globalThis.WebSocket(cdpTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));

  let msgId = 1;
  const pendingRequests = new Map();

  function sendCdp(method, params = {}) {
    const id = msgId++;
    return new Promise((resolve) => {
      pendingRequests.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evalInBrowser(expression) {
    const res = await sendCdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (!res) return undefined;
    if (res.result && res.result.value !== undefined) return res.result.value;
    if (res.value !== undefined) return res.value;
    return res;
  }

  ws.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pendingRequests.has(data.id)) {
      const resolve = pendingRequests.get(data.id);
      pendingRequests.delete(data.id);
      resolve(data.result);
    } else if (data.method === 'Runtime.exceptionThrown') {
      const details = data.params.exceptionDetails || {};
      const exceptionObj = {
        timestamp: Date.now(),
        type: 'Runtime.exceptionThrown',
        text: details.text || 'Uncaught Exception',
        exceptionDescription: details.exception?.description || details.text || '',
        url: details.url || '',
        lineNumber: details.lineNumber || 0,
        columnNumber: details.columnNumber || 0,
        stackTrace: details.stackTrace?.callFrames || [],
        phase: currentPhase
      };
      runtimeErrors.push(exceptionObj);
      result.pageExceptionCount++;
    } else if (data.method === 'Runtime.consoleAPICalled') {
      const type = data.params.type;
      if (type === 'error' || type === 'warning') {
        const text = data.params.args?.map(a => a.value || a.description).join(' ') || type;
        runtimeErrors.push({
          timestamp: Date.now(),
          type: `Console.${type}`,
          text,
          exceptionDescription: text,
          url: data.params.stackTrace?.callFrames?.[0]?.url || '',
          lineNumber: data.params.stackTrace?.callFrames?.[0]?.lineNumber || 0,
          columnNumber: data.params.stackTrace?.callFrames?.[0]?.columnNumber || 0,
          stackTrace: data.params.stackTrace?.callFrames || [],
          phase: currentPhase
        });
        if (type === 'error') result.consoleErrorCount++;
      }
    } else if (data.method === 'Log.entryAdded') {
      const entry = data.params.entry || {};
      if (entry.level === 'error') {
        runtimeErrors.push({
          timestamp: Date.now(),
          type: 'Log.entryAdded',
          text: entry.text || '',
          exceptionDescription: entry.text || '',
          url: entry.url || '',
          lineNumber: entry.lineNumber || 0,
          columnNumber: 0,
          stackTrace: [],
          phase: currentPhase
        });
        result.consoleErrorCount++;
      }
    } else if (data.method === 'Network.loadingFailed') {
      runtimeErrors.push({
        timestamp: Date.now(),
        type: 'Network.loadingFailed',
        text: data.params.errorText || 'Loading failed',
        exceptionDescription: data.params.errorText || '',
        url: data.params.requestId || '',
        lineNumber: 0,
        columnNumber: 0,
        stackTrace: [],
        phase: currentPhase
      });
    }
  });

  // Enable all diagnostic domains
  await sendCdp('Page.enable');
  await sendCdp('Runtime.enable');
  await sendCdp('DOM.enable');
  await sendCdp('Network.enable');
  await sendCdp('Log.enable');

  await sendCdp('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  console.log(`🌐 Navigating to ${targetUrl}...`);
  currentPhase = 'navigation';
  await sendCdp('Page.navigate', { url: targetUrl });

  // Phase 1: Shell Readiness & Lifecycle Check
  currentPhase = 'shell-ready';
  for (let i = 0; i < 50; i++) {
    await new Promise(r => setTimeout(r, 250));
    const status = await evalInBrowser(`
      (() => {
        const shell = document.querySelector('.app-shell');
        const tab = document.querySelector('.tab-btn[data-tab="piers"]');
        const dbg = window.__atlasDebug;
        return {
          docReady: document.readyState === 'complete',
          fontLoaded: document.fonts ? document.fonts.status === 'loaded' : true,
          shellMounted: Boolean(shell),
          tabMounted: Boolean(tab),
          appReady: Boolean(dbg && dbg.appStatus === 'ready')
        };
      })()
    `);

    if (status) {
      if (status.docReady) result.lifecycleReady = true;
      if (status.fontLoaded) result.fontReady = true;
      if (status.shellMounted && status.tabMounted && status.appReady) {
        result.shellReady = true;
        break;
      }
    }
  }

  if (!result.shellReady) {
    result.failureReasons.push('Application shell or appStatus !== "ready" failed within timeout.');
  }

  // Stabilization delay & requestAnimationFrame
  await new Promise(r => setTimeout(r, 800));
  await evalInBrowser(`new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))`);

  result.finalPageUrl = await evalInBrowser(`window.location.href`) || targetUrl;
  result.pageTitle = await evalInBrowser(`document.title`) || 'Tokyo Waterbus Atlas';

  // Phase 2: Piers Tab Click Interaction
  if (result.shellReady) {
    currentPhase = 'tab-click';
    console.log('👆 Attempting Tab Activation...');

    // Execute Native DOM click first for deterministic listener invocation
    await evalInBrowser(`
      (() => {
        const el = document.querySelector('.tab-btn[data-tab="piers"]');
        if (el) { el.focus(); el.click(); }
      })()
    `);

    for (let i = 0; i < 25; i++) {
      await new Promise(r => setTimeout(r, 250));
      const postA = await evalInBrowser(`
        (() => {
          const tab = document.querySelector('.tab-btn[data-tab="piers"]');
          const list = document.querySelector('.piers-list');
          const asakusa = document.querySelector('.pier-card[data-pier-id="asakusa"]');
          return {
            isActive: tab ? tab.classList.contains('active') : false,
            listVisible: Boolean(list),
            asakusaVisible: Boolean(asakusa)
          };
        })()
      `);

      if (postA?.isActive && postA?.listVisible && postA?.asakusaVisible) {
        result.tabPostconditionPassed = true;
        break;
      }
    }

    if (!result.tabPostconditionPassed) {
      result.failureReasons.push('Piers tab activation failed DOM postconditions (active class, piers list, Asakusa trigger).');
    }
  }

  // Phase 3: Asakusa Pier Trigger Click Interaction
  if (result.tabPostconditionPassed) {
    currentPhase = 'pier-click';
    console.log('👆 Attempting Asakusa Pier Card Activation...');

    await evalInBrowser(`
      (() => {
        const el = document.querySelector('.pier-card[data-pier-id="asakusa"]');
        if (el) { el.focus(); el.click(); }
      })()
    `);

    for (let i = 0; i < 25; i++) {
      await new Promise(r => setTimeout(r, 250));
      const postB = await evalInBrowser(`
        (() => {
          const drawer = document.querySelector('#map-floating-card .pier-arrival-card');
          if (!drawer) return { visible: false };
          const rect = drawer.getBoundingClientRect();
          const cs = window.getComputedStyle(drawer);
          const text = drawer.innerText || '';
          const visible = rect.width > 0 && rect.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0;
          const textMatches = text.includes('淺草碼頭') && text.includes('官方位置已確認');
          return { visible, textMatches };
        })()
      `);

      if (postB?.visible) {
        result.pierPostconditionPassed = true;
        if (postB?.textMatches) result.expectedTextPassed = true;
        break;
      }
    }

    if (!result.pierPostconditionPassed) {
      result.failureReasons.push('Asakusa Pier Arrival Card activation failed DOM postconditions (drawer visibility).');
    } else if (!result.expectedTextPassed) {
      result.failureReasons.push('Asakusa Pier Arrival Card missing expected zh-TW text ("淺草碼頭", "官方位置已確認").');
    }
  }

  currentPhase = 'pre-screenshot';

  // Phase 4: Screenshot Capture & Real PNG Pixel Validation
  const canAttemptSuccessScreenshot =
    result.lifecycleReady &&
    result.fontReady &&
    result.shellReady &&
    result.tabPostconditionPassed &&
    result.pierPostconditionPassed &&
    result.expectedTextPassed &&
    result.pageExceptionCount === 0;

  if (canAttemptSuccessScreenshot) {
    console.log('📸 Conditions met. Capturing diagnostic screenshot...');
    await evalInBrowser(`new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))`);

    const screenshotRes = await sendCdp('Page.captureScreenshot', { format: 'png' });
    const pngBuffer = Buffer.from(screenshotRes.data, 'base64');
    safeWriteBufferSync(successPngPath, pngBuffer);

    result.screenshotWritten = true;
    result.outputPngSha256 = crypto.createHash('sha256').update(pngBuffer).digest('hex');

    try {
      const metrics = parsePngMetrics(pngBuffer);
      result.pixelMetrics = metrics;

      const pixelValid =
        metrics.width === 1440 &&
        metrics.height === 900 &&
        metrics.uniqueColorCount > 64 &&
        metrics.dominantRatio < 0.98 &&
        metrics.nonBackgroundRatio > 0.01 &&
        metrics.pngSizeBytes > 10240;

      if (pixelValid) {
        result.screenshotPixelValidationPassed = true;
      } else {
        result.failureReasons.push(`PNG pixel validation failed: uniqueColors=${metrics.uniqueColorCount} (req >64), dominantRatio=${metrics.dominantRatio.toFixed(3)} (req <0.98), nonBgRatio=${metrics.nonBackgroundRatio.toFixed(3)} (req >0.01), size=${metrics.pngSizeBytes}B (req >10KB).`);
      }
    } catch (err) {
      result.failureReasons.push(`PNG pixel decoding error: ${err.message}`);
    }
  } else {
    console.error('❌ Diagnostic interaction or exception conditions failed. Capturing failure screenshot...');
    const screenshotRes = await sendCdp('Page.captureScreenshot', { format: 'png' });
    const pngBuffer = Buffer.from(screenshotRes.data, 'base64');
    const failurePngPath = path.join(artifactDir, `failure-${runId}.png`);
    safeWriteBufferSync(failurePngPath, pngBuffer);
    result.failureReasons.push(`Failure state screenshot written to failure-${runId}.png`);
  }

  ws.close();
  edgeProc.kill();

  finishRun(result, artifactDir, runtimeErrors);
}

function finishRun(result, artifactDir, runtimeErrors) {
  result.completedAtUtc = new Date().toISOString();

  // Authoritative Gate Formula
  const success =
    result.lifecycleReady === true &&
    result.fontReady === true &&
    result.shellReady === true &&
    result.tabPostconditionPassed === true &&
    result.pierPostconditionPassed === true &&
    result.expectedTextPassed === true &&
    result.pageExceptionCount === 0 &&
    result.screenshotWritten === true &&
    result.screenshotPixelValidationPassed === true;

  result.microGate = success
    ? "CDP_SINGLE_STATE_CAPTURE_VERIFIED"
    : "CDP_SINGLE_STATE_CAPTURE_BLOCKED";

  // Write Authoritative JSON Artifacts synchronously with fsync
  safeWriteFileSync(path.join(artifactDir, 'cdp-state-diagnosis.json'), JSON.stringify(result, null, 2));
  safeWriteFileSync(path.join(artifactDir, 'cdp-runtime-errors.json'), JSON.stringify(runtimeErrors, null, 2));

  // Write Authoritative Markdown Artifact
  const diagMd = `# Phase 1A CDP State Synchronization Diagnostic Report

- **Run ID**: \`${result.runId}\`
- **Started At**: ${result.startedAtUtc}
- **Completed At**: ${result.completedAtUtc}
- **Target Public URL**: [${result.publicUrl}](${result.publicUrl})
- **Final Page URL**: ${result.finalPageUrl}
- **Document Ready**: ${result.lifecycleReady}
- **Font Ready**: ${result.fontReady}
- **Shell Ready**: ${result.shellReady}
- **Piers Tab Postcondition**: ${result.tabPostconditionPassed}
- **Asakusa Pier Postcondition**: ${result.pierPostconditionPassed}
- **Expected Localized Text**: ${result.expectedTextPassed}
- **Page Exceptions**: ${result.pageExceptionCount}
- **Console Errors**: ${result.consoleErrorCount}
- **Screenshot Written**: ${result.screenshotWritten}
- **Screenshot SHA-256**: \`${result.outputPngSha256 || 'N/A'}\`
- **Pixel Validation Passed**: ${result.screenshotPixelValidationPassed}
- **Failure Reasons**: ${result.failureReasons.length > 0 ? result.failureReasons.join('; ') : 'None'}
- **Micro-Gate**: \`${result.microGate}\`
`;

  safeWriteFileSync(path.join(artifactDir, 'cdp-state-diagnosis.md'), diagMd);

  console.log(`📊 Single-State Diagnostic Complete [RunID: ${result.runId}]. Micro-Gate: ${result.microGate}`);

  if (result.microGate !== 'CDP_SINGLE_STATE_CAPTURE_VERIFIED') {
    console.error(`❌ Diagnostic BLOCKED! Exit Code 1. Reasons:`, result.failureReasons);
    process.exit(1);
  } else {
    console.log(`✅ Diagnostic VERIFIED! Exit Code 0.`);
    process.exit(0);
  }
}

runDiagnostic().catch(err => {
  console.error('Unhandled error in runDiagnostic:', err);
  process.exit(1);
});
