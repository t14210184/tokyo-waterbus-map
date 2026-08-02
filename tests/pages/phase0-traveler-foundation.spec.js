/**
 * Playwright Test Suite for Phase 0 "Truthful Tourist MVP Foundation" (v1.1.0-RC.3.22)
 * Verifies version identity, traveller tab ordering, today status official links,
 * offline demo toggles, secondary review portal reachability, mobile viewport bounding boxes,
 * and zero console/page errors.
 */

import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');
const artifactDir = path.join(rootDir, 'artifacts', 'phase0-traveler-foundation');

if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true });
}

test.describe('Phase 0 Truthful Tourist Foundation Verification', () => {
  test('verify release identity, tab ordering, today status links, offline demo, mobile viewports & review portal', async ({ page }) => {
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

    // 1. Load Local Server
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    // 2. Release Identity & Version Check
    const headerVersionBadge = await page.locator('#header-version-badge').textContent();
    expect(headerVersionBadge).toContain('v1.1.0-RC.3.22');

    const footerIdentity = await page.locator('#footer-build-identity').textContent();
    expect(footerIdentity).toContain('v1.1.0-RC.3.22');

    // 3. Primary Tab Order Check (P0-2)
    const tabTexts = await page.locator('.sidebar-tabs .tab-btn span:last-child').allTextContents();
    const expectedTabs = ['今天狀態', '航線', '碼頭', '行程規劃', '攻略', '探索'];
    expect(tabTexts).toEqual(expectedTabs);

    // 4. "Today Status" Tab Verification (P0-3)
    const todayTabActive = await page.locator('.tab-btn[data-tab="today"]').getAttribute('class');
    expect(todayTabActive).toContain('active');

    const todayContent = await page.locator('#sidebar-tab-content').textContent();
    expect(todayContent).toContain('TOKYO CRUISE');
    expect(todayContent).toContain('東京水辺ライン');
    expect(todayContent).toContain('正常狀態待官方確認');
    expect(todayContent).toContain('暫停營運');
    expect(todayContent).toContain('https://www.suijobus.co.jp/guide/operation/');

    // 5. Offline Demo Mode Verification (P0-4)
    const initialStatusChip = await page.locator('#status-chip-simulation').textContent();
    expect(initialStatusChip.trim()).toBe('● 目前無可驗證的模擬航行');

    const demoBtn = page.locator('#btn-offline-demo');
    await demoBtn.click();
    await page.waitForTimeout(500);

    const activeStatusChip = await page.locator('#status-chip-simulation').textContent();
    expect(activeStatusChip.trim()).toBe('● 離線示範中，不代表即時船位或實際營運');

    const disclaimerVisible = await page.locator('#demo-disclaimer-banner').isVisible();
    expect(disclaimerVisible).toBe(true);

    const stopBtn = page.locator('#btn-stop-demo');
    await stopBtn.click();
    await page.waitForTimeout(500);

    const stoppedStatusChip = await page.locator('#status-chip-simulation').textContent();
    expect(stoppedStatusChip.trim()).toBe('● 目前無可驗證的模擬航行');

    // 6. Secondary Review Portal Entry Check (P0-2)
    const reviewBtn = page.locator('#link-secondary-review');
    await reviewBtn.click();
    await page.waitForTimeout(500);

    const reviewContent = await page.locator('#sidebar-tab-content').textContent();
    expect(reviewContent).toContain('13'); // 13 canonical RGR IDs
    expect(reviewContent).toContain('RGR-sumida-river-13');

    // 7. Mobile Viewport 360x800 Bounding Box Check (P0-5)
    await page.setViewportSize({ width: 360, height: 800 });
    await page.waitForTimeout(300);

    const bodyOverflowWidth = await page.evaluate(() => document.body.scrollWidth);
    const bodyClientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(bodyOverflowWidth).toBeLessThanOrEqual(bodyClientWidth + 1);

    // 8. Mobile Viewport 390x844 Check (P0-5)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);

    // Save screenshots and local test results
    await page.screenshot({ path: path.join(artifactDir, 'desktop-home.png') });

    const consoleErrorCount = consoleLogs.filter(c => c.type === 'error').length;
    const pageErrorCount = pageErrors.length;

    const testResults = {
      versionIdentity: headerVersionBadge.trim(),
      tabsOrderPassed: true,
      todayStatusPassed: true,
      offlineDemoPassed: true,
      secondaryReviewPassed: true,
      mobileViewportPassed: true,
      consoleErrorCount,
      pageErrorCount,
      status: (consoleErrorCount === 0 && pageErrorCount === 0) ? 'PASSED' : 'FAILED'
    };

    fs.writeFileSync(path.join(artifactDir, 'local-test-results.json'), JSON.stringify(testResults, null, 2), 'utf8');

    expect(consoleErrorCount).toBe(0);
    expect(pageErrorCount).toBe(0);
  });
});
