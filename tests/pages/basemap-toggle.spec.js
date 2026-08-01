import { test, expect } from '@playwright/test';

test.describe('Basemap Toggle Operations', () => {
  test('should toggle map basemap between dark, light, and none fallback modes', async ({ page }) => {
    await page.goto('/');

    const toggleBtn = page.locator('#btn-theme-toggle');
    await expect(toggleBtn).toBeVisible();

    // Initial state: Dark
    await expect(toggleBtn).toContainText('切換底圖：深色');

    // Click 1: Light mode
    await toggleBtn.click();
    await expect(toggleBtn).toContainText('切換底圖：淺色');
    await expect(toggleBtn).toHaveAttribute('aria-pressed', 'true');

    // Click 2: None / Data reference mode
    await toggleBtn.click();
    await expect(toggleBtn).toContainText('切換底圖：無 (參考資料)');

    // Click 3: Back to Dark mode
    await toggleBtn.click();
    await expect(toggleBtn).toContainText('切換底圖：深色');
    await expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');
  });
});
