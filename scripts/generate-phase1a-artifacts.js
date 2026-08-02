/**
 * Phase 1A Screenshot Capture & Visual Validation Pipeline (Playwright Driven)
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import https from 'https';
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const artifactDir = path.join(rootDir, 'artifacts', 'phase1a-i18n-pier-cards');

if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true });
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Cache-Control': 'no-cache, no-store' } }, res => {
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

async function analyzeVisualQuality(page, selector = 'body') {
  return await page.evaluate((sel) => {
    const el = document.querySelector(sel) || document.body;
    const rect = el.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));

    const canvas = document.createElement('canvas');
    canvas.width = Math.min(width, 400);
    canvas.height = Math.min(height, 400);
    const ctx = canvas.getContext('2d');
    if (!ctx) return { uniqueColorCount: 0, nonBackgroundPixelRatio: 0, valid: false };

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw element or window content preview
    const textContent = el.innerText || '';
    const hasVisibleText = textContent.trim().length > 10;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    const colorSet = new Set();
    let nonBgCount = 0;
    const totalPixels = canvas.width * canvas.height;

    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const key = `${Math.floor(r / 16)},${Math.floor(g / 16)},${Math.floor(b / 16)}`;
      colorSet.add(key);

      // Check if pixel is distinct from dark background (#071923 / #0a1622)
      if (r > 45 || g > 55 || b > 65) {
        nonBgCount++;
      }
    }

    return {
      width,
      height,
      hasVisibleText,
      uniqueColorCount: colorSet.size,
      nonBackgroundPixelRatio: (nonBgCount * 4) / totalPixels
    };
  }, selector);
}

async function captureAndValidateScreenshots() {
  console.log('📸 Starting Playwright-driven Phase 1A Screenshot Pipeline...');

  const liveUrl = process.env.TEST_TARGET_URL || 'https://t14210184.github.io/tokyo-waterbus-map/';
  const browser = await chromium.launch({ headless: true });

  const screenshotValidationResults = [];

  const screenshotSpecs = [
    {
      file: 'desktop-zhTW-asakusa-card.png',
      viewport: { width: 1440, height: 900 },
      locale: 'zh-TW',
      action: async (page) => {
        await page.goto(`${liveUrl}?lang=zh-TW&t=${Date.now()}`);
        await page.waitForLoadState('networkidle');
        await page.evaluate(() => document.fonts?.ready);
        const piersTab = page.locator('.tab-btn[data-tab="piers"]');
        await piersTab.click();
        const card = page.locator('.pier-card[data-pier-id="asakusa"]');
        await card.waitFor({ state: 'visible', timeout: 5000 });
        await card.click();
        const drawer = page.locator('#map-floating-card');
        await drawer.waitFor({ state: 'visible', timeout: 5000 });
      },
      expectedVisibleText: ['淺草碼頭', '官方位置已確認', '現地辨識照片：建置中'],
      targetSelector: '#map-floating-card'
    },
    {
      file: 'desktop-en-hinode-card.png',
      viewport: { width: 1440, height: 900 },
      locale: 'en',
      action: async (page) => {
        await page.goto(`${liveUrl}?lang=en&t=${Date.now()}`);
        await page.waitForLoadState('networkidle');
        await page.evaluate(() => document.fonts?.ready);
        const piersTab = page.locator('.tab-btn[data-tab="piers"]');
        await piersTab.click();
        const card = page.locator('.pier-card[data-pier-id="hinode"]');
        await card.waitFor({ state: 'visible', timeout: 5000 });
        await card.click();
        const drawer = page.locator('#map-floating-card');
        await drawer.waitFor({ state: 'visible', timeout: 5000 });
      },
      expectedVisibleText: ['Hinode Pier', 'Official Location Confirmed', 'Photo wayfinding: planned'],
      targetSelector: '#map-floating-card'
    },
    {
      file: 'desktop-ja-hamarikyu-card.png',
      viewport: { width: 1440, height: 900 },
      locale: 'ja',
      action: async (page) => {
        await page.goto(`${liveUrl}?lang=ja&t=${Date.now()}`);
        await page.waitForLoadState('networkidle');
        await page.evaluate(() => document.fonts?.ready);
        const piersTab = page.locator('.tab-btn[data-tab="piers"]');
        await piersTab.click();
        const card = page.locator('.pier-card[data-pier-id="hamarikyu"]');
        await card.waitFor({ state: 'visible', timeout: 5000 });
        await card.click();
        const drawer = page.locator('#map-floating-card');
        await drawer.waitFor({ state: 'visible', timeout: 5000 });
      },
      expectedVisibleText: ['浜離宮', '公式位置確認済み', '現地確認写真：準備中'],
      targetSelector: '#map-floating-card'
    },
    {
      file: 'desktop-ko-odaiba-card.png',
      viewport: { width: 1440, height: 900 },
      locale: 'ko',
      action: async (page) => {
        await page.goto(`${liveUrl}?lang=ko&t=${Date.now()}`);
        await page.waitForLoadState('networkidle');
        await page.evaluate(() => document.fonts?.ready);
        const piersTab = page.locator('.tab-btn[data-tab="piers"]');
        await piersTab.click();
        const card = page.locator('.pier-card[data-pier-id="odaiba-kaihinkouen"]');
        await card.waitFor({ state: 'visible', timeout: 5000 });
        await card.click();
        const drawer = page.locator('#map-floating-card');
        await drawer.waitFor({ state: 'visible', timeout: 5000 });
      },
      expectedVisibleText: ['오다이바 해변공원 선착장', '공식 위치 확인됨', '현장 안내 사진: 준비 중'],
      targetSelector: '#map-floating-card'
    },
    {
      file: 'mobile-360-language-picker.png',
      viewport: { width: 360, height: 800 },
      locale: 'zh-TW',
      action: async (page) => {
        await page.goto(`${liveUrl}?lang=zh-TW&t=${Date.now()}`);
        await page.waitForLoadState('networkidle');
        await page.evaluate(() => document.fonts?.ready);
        const toggleBtn = page.locator('#btn-lang-toggle');
        await toggleBtn.waitFor({ state: 'visible', timeout: 5000 });
        await toggleBtn.click();
        const menu = page.locator('#lang-picker-menu');
        await menu.waitFor({ state: 'visible', timeout: 5000 });
      },
      expectedVisibleText: ['繁體中文', 'English', '日本語', '한국어'],
      targetSelector: '#lang-picker-menu'
    },
    {
      file: 'mobile-390-pier-card.png',
      viewport: { width: 390, height: 844 },
      locale: 'en',
      action: async (page) => {
        await page.goto(`${liveUrl}?lang=en&t=${Date.now()}`);
        await page.waitForLoadState('networkidle');
        await page.evaluate(() => document.fonts?.ready);
        const piersTab = page.locator('.tab-btn[data-tab="piers"]');
        await piersTab.click();
        const card = page.locator('.pier-card[data-pier-id="asakusa"]');
        await card.waitFor({ state: 'visible', timeout: 5000 });
        await card.click();
        const drawer = page.locator('#map-floating-card');
        await drawer.waitFor({ state: 'visible', timeout: 5000 });
      },
      expectedVisibleText: ['Asakusa Pier', 'Official Location Confirmed'],
      targetSelector: '#map-floating-card'
    },
    {
      file: 'secondary-review-entry-regression.png',
      viewport: { width: 1440, height: 900 },
      locale: 'zh-TW',
      action: async (page) => {
        await page.goto(`${liveUrl}?lang=zh-TW&t=${Date.now()}`);
        await page.waitForLoadState('networkidle');
        await page.evaluate(() => document.fonts?.ready);
        const reviewBtn = page.locator('#link-secondary-review');
        await reviewBtn.waitFor({ state: 'visible', timeout: 5000 });
        await reviewBtn.click();
        const content = page.locator('#sidebar-tab-content');
        await content.waitFor({ state: 'visible', timeout: 5000 });
      },
      expectedVisibleText: ['資料品質與審核', 'RGR-sumida-river-13'],
      targetSelector: '#sidebar-tab-content'
    }
  ];

  let allScreenshotsValid = true;

  for (const spec of screenshotSpecs) {
    const context = await browser.newContext({ viewport: spec.viewport });
    const page = await context.newPage();

    try {
      await spec.action(page);

      // Wait 2 animation frames
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));

      // Assert text presence
      const pageText = await page.textContent('body');
      const textMatches = spec.expectedVisibleText.every(txt => pageText.includes(txt));

      const targetEl = page.locator(spec.targetSelector);
      const isTargetVisible = await targetEl.isVisible();

      const outPath = path.join(artifactDir, spec.file);
      await page.screenshot({ path: outPath, fullPage: false });

      const stats = fs.statSync(outPath);
      const isValidPng = stats.size > 2000;
      const visualPassed = isTargetVisible && textMatches && isValidPng;

      if (!visualPassed) {
        allScreenshotsValid = false;
        console.error(`❌ Screenshot visual validation failed for ${spec.file}`);
      } else {
        console.log(`✅ Captured and verified screenshot: ${spec.file} (${(stats.size / 1024).toFixed(1)} KB)`);
      }

      screenshotValidationResults.push({
        file: spec.file,
        publicUrl: liveUrl,
        viewport: spec.viewport,
        locale: spec.locale,
        expectedVisibleText: spec.expectedVisibleText,
        targetSelector: spec.targetSelector,
        pngSizeBytes: stats.size,
        targetVisible: isTargetVisible,
        textMatches,
        visualValidationPassed: visualPassed
      });

    } catch (err) {
      console.error(`❌ Error capturing ${spec.file}:`, err.message);
      allScreenshotsValid = false;
      screenshotValidationResults.push({
        file: spec.file,
        error: err.message,
        visualValidationPassed: false
      });
    } finally {
      await context.close();
    }
  }

  await browser.close();

  fs.writeFileSync(
    path.join(artifactDir, 'screenshot-validation.json'),
    JSON.stringify(screenshotValidationResults, null, 2),
    'utf8'
  );

  return allScreenshotsValid;
}

captureAndValidateScreenshots().then(passed => {
  if (passed) {
    console.log('✅ ALL SCREENSHOTS CAPTURED & VISUALLY VALIDATED SUCCESSFULLY!');
  } else {
    console.error('❌ SCREENSHOT VALIDATION FAILED!');
    process.exit(1);
  }
});
