import { test, expect } from '@playwright/test';

test.describe('Public GitHub Pages Live Deployment E2E Audit (RC.3.19)', () => {
  const publicUrl = 'https://t14210184.github.io/tokyo-waterbus-map/';

  test('should verify live deployment assets, basemap toggle, safe lockout, and review portal', async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];
    const networkRequests = [];

    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    page.on('pageerror', err => {
      pageErrors.push(err.message);
    });

    page.on('request', req => {
      networkRequests.push({ url: req.url(), method: req.method() });
    });

    // 1. Load Live Public Root URL with Cachebuster
    const targetUrl = `${publicUrl}?rc319=${Date.now()}`;
    const response = await page.goto(targetUrl, { waitUntil: 'networkidle' });
    expect(response.status()).toBe(200);

    // 2. Verify Safe Lockout Header & Active Vessel Markers
    const statusChip = page.locator('#status-chip-simulation');
    await expect(statusChip).toBeVisible();
    await expect(statusChip).toContainText('● 目前無可驗證的模擬航行');

    const vesselMarkers = page.locator('.vessel-marker');
    await expect(vesselMarkers).toHaveCount(0);

    // 3. Verify Basemap Toggle Button Cycle (dark -> light -> none -> dark)
    const toggleBtn = page.locator('#btn-theme-toggle');
    await expect(toggleBtn).toBeVisible();
    await expect(toggleBtn).toContainText('切換底圖：深色');

    // Click 1: Light
    await toggleBtn.click();
    await expect(toggleBtn).toContainText('切換底圖：淺色');
    await expect(toggleBtn).toHaveAttribute('aria-pressed', 'true');

    // Click 2: None
    await toggleBtn.click();
    await expect(toggleBtn).toContainText('切換底圖：無 (參考資料)');

    // Click 3: Dark
    await toggleBtn.click();
    await expect(toggleBtn).toContainText('切換底圖：深色');
    await expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');

    // 4. Verify Review Portal Tab Navigation & 13 Canonical IDs
    const reviewTab = page.locator('.sidebar-tabs button[data-tab="data"]');
    await expect(reviewTab).toBeVisible();
    await reviewTab.click();

    const reviewPortalPanel = page.locator('.review-portal-wrapper');
    await expect(reviewPortalPanel).toBeVisible();

    const canonicalItems = page.locator('.review-item-card');
    await expect(canonicalItems).toHaveCount(13);

    const fileInput = page.locator('#input-human-csv');
    await expect(fileInput).toBeAttached();

    expect(consoleErrors.length).toBe(0);
    expect(pageErrors.length).toBe(0);
  });
});
