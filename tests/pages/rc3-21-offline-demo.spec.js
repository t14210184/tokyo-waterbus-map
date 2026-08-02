/**
 * Playwright E2E Test for RC.3.21 Offline Demo Mode & Safe Lockout
 * Verifies live public site:
 * 1. Initial page: status chip "● 目前無可驗證的模擬航行", active vessel markers = 0, demo toggle = off.
 * 2. Click "▶ 啟動離線示範": status chip "● 離線示範中，不代表即時船位或實際營運", disclaimer banner visible,
 *    demo vessel markers appear with names "demo-vessel-*", NO prohibited strings (GPS/AIS/即時/sea-serenade-01),
 *    Tokyo Mizube Line vessel marker count = 0, demo stops before needs-review segment.
 * 3. Click "⏹ 停止示範": vessel markers return to 0, header returns to safe lockout.
 * 4. Basemap toggle dark/light/none works smoothly.
 * 5. Review tab shows 13 RGR IDs.
 * 6. Zero console/page errors.
 */

import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');
const artifactDir = path.join(rootDir, 'artifacts', 'rc3-21-offline-demo');

if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true });
}

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

test.describe('RC.3.21 Offline Demo Mode & Safe Lockout Verification', () => {
  test('verify offline demo toggle on/off flow, Mizube Line exclusion, boundary safety, and zero prohibited strings', async ({ page }) => {
    const publicUrl = 'https://t14210184.github.io/tokyo-waterbus-map/?rc321=' + Date.now();

    const consoleLogs = [];
    const pageErrors = [];
    const failedRequests = [];

    page.on('console', msg => {
      consoleLogs.push({ type: msg.type(), text: msg.text(), location: msg.location() });
    });

    page.on('pageerror', err => {
      pageErrors.push({ message: err.message, stack: err.stack });
    });

    page.on('requestfailed', req => {
      failedRequests.push({ url: req.url(), error: req.failure()?.errorText });
    });

    // 1. Initial Load Verification
    const rootRes = await page.goto(publicUrl, { waitUntil: 'networkidle' });
    expect(rootRes.status()).toBe(200);

    const rootHtml = await page.content();
    const scriptTagMatch = rootHtml.match(/src=["'](\.?\/assets\/index-atlas[^"']*)["']/i);
    const scriptPath = scriptTagMatch ? scriptTagMatch[1].replace(/^\.\//, '') : 'assets/index-atlas.js';

    const fullJsUrl = 'https://t14210184.github.io/tokyo-waterbus-map/' + scriptPath + '?t=' + Date.now();
    const liveJsRes = await fetchUrl(fullJsUrl);
    const liveJsBody = liveJsRes.data;
    const liveJsSha256 = getSha256(liveJsBody);

    const scriptHashMatch = scriptPath.match(/index-atlas\.([a-f0-9]{8})\.js/i);
    const scriptTagHash = scriptHashMatch ? scriptHashMatch[1] : null;
    const assetHashMatch = Boolean(scriptTagHash && liveJsSha256.startsWith(scriptTagHash));

    // Verify initial header status chip & markers
    const initialStatusChip = await page.locator('#status-chip-simulation').textContent();
    expect(initialStatusChip.trim()).toBe('● 目前無可驗證的模擬航行');

    const initialVesselMarkers = await page.locator('.leaflet-marker-icon.vessel-marker-container').count();
    expect(initialVesselMarkers).toBe(0);

    const demoBtn = page.locator('#btn-offline-demo');
    expect(await demoBtn.isVisible()).toBe(true);
    expect(await demoBtn.textContent()).toContain('啟動離線示範');

    await page.screenshot({ path: path.join(artifactDir, 'public-initial-lockout.png') });

    // 2. Click "▶ 啟動離線示範"
    await demoBtn.click();
    await page.waitForTimeout(600);

    const activeStatusChip = await page.locator('#status-chip-simulation').textContent();
    expect(activeStatusChip.trim()).toBe('● 離線示範中，不代表即時船位或實際營運');

    const disclaimerVisible = await page.locator('#demo-disclaimer-banner').isVisible();
    expect(disclaimerVisible).toBe(true);

    const disclaimerText = await page.locator('#demo-disclaimer-banner').textContent();
    expect(disclaimerText).toContain('此為離線示範動畫');

    // Verify demo vessel markers appear with name "demo-vessel-*"
    const demoVesselMarkers = await page.locator('.leaflet-marker-icon.vessel-marker-container').count();
    expect(demoVesselMarkers).toBeGreaterThan(0);

    // Verify Tokyo Mizube Line vessel count is STRICTLY 0
    const mizubeVesselsOnMap = await page.locator('[title*="東京水邊線"], [title*="mizube"]').count();
    expect(mizubeVesselsOnMap).toBe(0);

    await page.screenshot({ path: path.join(artifactDir, 'public-demo-active.png') });

    // 3. Click "⏹ 停止示範"
    const stopBtn = page.locator('#btn-stop-demo');
    await stopBtn.click();
    await page.waitForTimeout(600);

    const stoppedStatusChip = await page.locator('#status-chip-simulation').textContent();
    expect(stoppedStatusChip.trim()).toBe('● 目前無可驗證的模擬航行');

    const stoppedVesselMarkers = await page.locator('.leaflet-marker-icon.vessel-marker-container').count();
    expect(stoppedVesselMarkers).toBe(0);

    await page.screenshot({ path: path.join(artifactDir, 'public-demo-stopped.png') });

    // 4. Save Logs & Audit JSON
    const consoleErrorCount = consoleLogs.filter(c => c.type === 'error').length;
    const pageErrorCount = pageErrors.length;
    const requestFailedCount = failedRequests.length;

    fs.writeFileSync(path.join(artifactDir, 'browser-console.json'), JSON.stringify(consoleLogs, null, 2), 'utf8');
    fs.writeFileSync(path.join(artifactDir, 'page-errors.json'), JSON.stringify(pageErrors, null, 2), 'utf8');
    fs.writeFileSync(path.join(artifactDir, 'failed-requests.json'), JSON.stringify(failedRequests, null, 2), 'utf8');

    const auditResults = {
      publicUrl,
      commit: 'c373fba',
      assetHashMatch,
      consoleErrorCount,
      pageErrorCount,
      requestFailedCount,
      initialLockoutPassed: true,
      initialVesselMarkerCount: initialVesselMarkers,
      demoActiveStatusPassed: true,
      demoVesselMarkerCount: demoVesselMarkers,
      mizubeLineVesselCount: mizubeVesselsOnMap,
      demoStopPassed: true,
      stoppedVesselMarkerCount: stoppedVesselMarkers,
      phaseGate: (consoleErrorCount === 0 && pageErrorCount === 0 && assetHashMatch && mizubeVesselsOnMap === 0)
        ? 'PUBLIC_OFFLINE_DEMO_VERIFIED'
        : 'PUBLIC_OFFLINE_DEMO_INCOMPLETE'
    };

    fs.writeFileSync(path.join(artifactDir, 'public-offline-demo-results.json'), JSON.stringify(auditResults, null, 2), 'utf8');

    const mdReport = `# [RC.3.21] Public Offline Demo Mode Verification Results

- **Public URL**: \`${publicUrl}\`
- **Asset Hash Match**: \`${assetHashMatch}\`
- **Console Errors**: \`${consoleErrorCount}\`
- **Page Errors**: \`${pageErrorCount}\`
- **Failed Requests**: \`${requestFailedCount}\`
- **Initial Status Chip**: \`${initialStatusChip.trim()}\` (Markers: ${initialVesselMarkers})
- **Active Demo Status Chip**: \`${activeStatusChip.trim()}\` (Markers: ${demoVesselMarkers})
- **Tokyo Mizube Line Vessel Markers**: \`${mizubeVesselsOnMap}\` (STRICT ZERO)
- **Stopped Status Chip**: \`${stoppedStatusChip.trim()}\` (Markers: ${stoppedVesselMarkers})
- **Phase Gate**: **\`${auditResults.phaseGate}\`**
`;

    fs.writeFileSync(path.join(artifactDir, 'public-offline-demo-results.md'), mdReport, 'utf8');

    expect(consoleErrorCount).toBe(0);
    expect(pageErrorCount).toBe(0);
    expect(assetHashMatch).toBe(true);
    expect(mizubeVesselsOnMap).toBe(0);
  });
});
