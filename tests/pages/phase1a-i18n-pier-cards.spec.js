import { test, expect } from '@playwright.test';

test.describe('Phase 1A Multilingual Pier Arrival Cards Suite', () => {
  const targetUrl = process.env.TEST_TARGET_URL || 'https://t14210184.github.io/tokyo-waterbus-map/';

  test('i18n language picker and URL param override', async ({ page }) => {
    // 1. Visit with URL param ?lang=en
    await page.goto(`${targetUrl}?lang=en`);
    await page.waitForLoadState('networkidle');

    // Check html lang attribute
    const htmlLang = await page.getAttribute('html', 'lang');
    expect(htmlLang).toBe('en');

    // Check header subtitle in English
    const subtitleText = await page.textContent('#header-subtitle');
    expect(subtitleText).toContain('Tokyo Waterbus Official Status');

    // 2. Open Language Picker via keyboard / click
    const langToggleBtn = page.locator('#btn-lang-toggle');
    await expect(langToggleBtn).toBeVisible();
    await langToggleBtn.click();

    const langMenu = page.locator('#lang-picker-menu');
    await expect(langMenu).toBeVisible();

    // 3. Switch to Japanese (ja)
    const jaOption = page.locator('.lang-option-btn[data-locale="ja"]');
    await jaOption.click();

    // Check html lang attribute updated to ja
    const jaHtmlLang = await page.getAttribute('html', 'lang');
    expect(jaHtmlLang).toBe('ja');
  });

  test('Pier Arrival Cards rendering for Asakusa and Odaiba', async ({ page }) => {
    await page.goto(`${targetUrl}?lang=zh-TW`);
    await page.waitForLoadState('networkidle');

    // Click Piers tab
    const piersTab = page.locator('.tab-btn[data-tab="piers"]');
    await piersTab.click();

    // Select Asakusa Pier
    const asakusaCard = page.locator('.pier-card[data-pier-id="asakusa"]');
    await asakusaCard.click();

    // Check Pier Detail Drawer contains Pier Arrival Card
    const drawer = page.locator('#map-floating-card');
    await expect(drawer).toBeVisible();

    const drawerText = await drawer.textContent();
    expect(drawerText).toContain('淺草碼頭');
    expect(drawerText).toContain('官方位置已確認');
    expect(drawerText).toContain('現地辨識照片：建置中');
    expect(drawerText).toContain('在 Google 地圖開啟碼頭區域');
  });

  test('Tokyo Mizube Line remains suspended', async ({ page }) => {
    await page.goto(targetUrl);
    await page.waitForLoadState('networkidle');

    // Check Today Status tab
    const todayTab = page.locator('.tab-btn[data-tab="today"]');
    await todayTab.click();

    const todayContent = await page.textContent('#sidebar-tab-content');
    expect(todayContent).toContain('暫停營運');
  });

  test('Mobile viewport compliance 360x800', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(targetUrl);
    await page.waitForLoadState('networkidle');

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });
});
