import { test, expect } from '@playwright/test';

test.describe('Operational Status & Safe Simulation Lockout', () => {
  test('should display safe lockout chip and suspended notice for Tokyo Mizube Line', async ({ page }) => {
    await page.goto('/');

    // Check header status chip
    const statusChip = page.locator('#status-chip-simulation');
    await expect(statusChip).toBeVisible();
    await expect(statusChip).toContainText('● 目前無可驗證的模擬航行');

    // Switch to Fleet panel
    const fleetTab = page.locator('.tab-btn[data-tab="fleet"]');
    await fleetTab.click();

    // Check Tokyo Mizube Line suspension card
    const mizubeCard = page.locator('text=東京水辺ライン自 2026-01-19 起當面暫停營運');
    await expect(mizubeCard).toBeVisible();

    // Check official source link
    const mizubeLink = page.locator('a[href*="tokyo-park.or.jp/water/waterbus/"]');
    await expect(mizubeLink).toBeVisible();
  });
});
