import { test, expect } from '@playwright/test';

test.describe('Phase 1A Evidence Repair Suite', () => {
  const targetUrl = process.env.TEST_TARGET_URL || 'https://t14210184.github.io/tokyo-waterbus-map/';

  test('Multilingual language switching and URL parameter override', async ({ page }) => {
    await page.goto(`${targetUrl}?lang=en`);
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts?.ready);

    const htmlLang = await page.getAttribute('html', 'lang');
    expect(htmlLang).toBe('en');

    const subtitleText = await page.textContent('#header-subtitle');
    expect(subtitleText).toContain('Tokyo Waterbus Official Status');

    const toggleBtn = page.locator('#btn-lang-toggle');
    await toggleBtn.click();

    const menu = page.locator('#lang-picker-menu');
    await expect(menu).toBeVisible();

    const jaBtn = page.locator('.lang-option-btn[data-locale="ja"]');
    await jaBtn.click();

    const jaHtmlLang = await page.getAttribute('html', 'lang');
    expect(jaHtmlLang).toBe('ja');
  });

  test('Pier Arrival Cards render properly for Asakusa Pier', async ({ page }) => {
    await page.goto(`${targetUrl}?lang=zh-TW`);
    await page.waitForLoadState('networkidle');

    const piersTab = page.locator('.tab-btn[data-tab="piers"]');
    await piersTab.click();

    const card = page.locator('.pier-card[data-pier-id="asakusa"]');
    await card.click();

    const drawer = page.locator('#map-floating-card');
    await expect(drawer).toBeVisible();

    const drawerText = await drawer.textContent();
    expect(drawerText).toContain('淺草碼頭');
    expect(drawerText).toContain('官方位置已確認');
    expect(drawerText).toContain('現地辨識照片：建置中');
  });

  test('Tokyo Mizube Line remains suspended', async ({ page }) => {
    await page.goto(targetUrl);
    await page.waitForLoadState('networkidle');

    const todayTab = page.locator('.tab-btn[data-tab="today"]');
    await todayTab.click();

    const content = await page.textContent('#sidebar-tab-content');
    expect(content).toContain('暫停營運');
  });

  test('Mobile viewports 360x800 and 390x844 have no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(targetUrl);
    await page.waitForLoadState('networkidle');

    const overflow360 = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow360).toBe(false);

    await page.setViewportSize({ width: 390, height: 844 });
    const overflow390 = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow390).toBe(false);
  });
});
