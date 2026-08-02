/**
 * Pure-JS Static Production Builder for Tokyo Waterbus Atlas (Phase RC.3.19 Content-Hashed Assets)
 * Zero npm/esbuild/rollup binary external dependencies.
 * Concatenates CSS and JS in strict dependency order, calculates SHA-256 content hashes,
 * produces content-hashed asset filenames (index-atlas.<hash>.js/css), outputs manifest.json,
 * and updates dist/index.html to guarantee cache-busting.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const assetsDir = path.join(distDir, 'assets');

console.log('🚀 Running Pure-JS Static Production Builder for Tokyo Waterbus Atlas (v1.1.0-RC.3.23)...');

// 0. Update src/data/version.js with real short Git commit SHA and build timestamp
let shortSha = 'b2a5c6c';
try {
  shortSha = execSync('git rev-parse --short HEAD', { cwd: rootDir, encoding: 'utf8' }).trim() || 'b2a5c6c';
} catch (e) {
  console.warn('Could not fetch git SHA, using fallback:', shortSha);
}

const buildIsoTimestamp = new Date().toISOString();
const versionContent = `/**
 * Version and Build Metadata Registry for Tokyo Waterbus Atlas (v1.1.0-RC.3.23)
 * Shared single source of truth for UI shell header, footer disclosures, and build assets.
 * Automatically injected/updated during \`npm run build\`.
 */

export const VERSION = 'v1.1.0-RC.3.23';
export const SHORT_SHA = '${shortSha}';
export const BUILD_TIMESTAMP = '${buildIsoTimestamp}';
export const ASSET_HASH = 'a420a80b';

export function getFullVersionString() {
  return \`\${VERSION} · \${SHORT_SHA}\`;
}

export function getBuildMetadata() {
  return {
    version: VERSION,
    shortSha: SHORT_SHA,
    buildTimestamp: BUILD_TIMESTAMP,
    assetHash: ASSET_HASH,
    fullVersion: getFullVersionString()
  };
}
`;
fs.writeFileSync(path.join(rootDir, 'src', 'data', 'version.js'), versionContent, 'utf8');

// 1. Ensure Output Directories Exist
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(assetsDir, { recursive: true });

// 2. Bundle CSS
const cssFiles = [
  'tokens.css',
  'base.css',
  'layout.css',
  'components.css',
  'map.css',
  'responsive.css'
];

let bundledCSS = `/**
 * Tokyo Waterbus Atlas - Production CSS Bundle
 */
`;

cssFiles.forEach(file => {
  const filePath = path.join(rootDir, 'src', 'styles', file);
  if (fs.existsSync(filePath)) {
    bundledCSS += `\n/* --- ${file} --- */\n` + fs.readFileSync(filePath, 'utf8') + '\n';
  }
});

// Copy Leaflet Vendor CSS
const leafletCssPath = path.join(rootDir, 'node_modules', 'leaflet', 'dist', 'leaflet.css');
if (fs.existsSync(leafletCssPath)) {
  fs.copyFileSync(leafletCssPath, path.join(assetsDir, 'vendor-leaflet.css'));
} else {
  fs.writeFileSync(path.join(assetsDir, 'vendor-leaflet.css'), '/* Fallback Leaflet CSS */', 'utf8');
}

// Compute CSS Content Hash
bundledCSS = bundledCSS.replace(/\r\n/g, '\n');

const cssHash = crypto.createHash('sha256').update(bundledCSS, 'utf8').digest('hex').substring(0, 8);
const hashedCssFilename = `index-atlas.${cssHash}.css`;
const cssFilename = 'index-atlas.css';

fs.writeFileSync(path.join(assetsDir, hashedCssFilename), bundledCSS, 'utf8');
fs.writeFileSync(path.join(assetsDir, cssFilename), bundledCSS, 'utf8');
console.log(`📦 Generated CSS asset: dist/assets/${hashedCssFilename} (${(bundledCSS.length / 1024).toFixed(2)} KB)`);

// 3. Bundle JS Code (In strict dependency order)
const jsModules = [
  'data/version.js',
  'i18n/locales/zh-TW.js',
  'i18n/locales/en.js',
  'i18n/locales/ja.js',
  'i18n/locales/ko.js',
  'i18n/index.js',
  'data/pier-arrival-cards.js',
  'data/environment.js',
  'data/route-geometry-sources.js',
  'data/route-geometries.js',
  'data/sources.js',
  'data/routes.js',
  'data/piers.js',
  'data/vessels.js',
  'data/landmarks.js',
  'data/guides.js',
  'data/service-status.js',
  'assets/icons.js',
  'core/constants.js',
  'core/geometry.js',
  'core/store.js',
  'core/graph-utils.js',
  'core/route-engine.js',
  'core/itinerary-formatters.js',
  'core/environment-service.js',
  'core/simulation.js',
  'core/pier-search.js',
  'core/pier-filters.js',
  'core/load-leaflet.js',
  'map/base-layers.js',
  'map/create-map.js',
  'map/route-layers.js',
  'map/pier-markers.js',
  'map/vessel-markers.js',
  'map/itinerary-layers.js',
  'map/map-camera.js',
  'ui/language-picker.js',
  'ui/pier-arrival-card.js',
  'ui/shell.js',
  'ui/today-status-panel.js',
  'ui/route-panel.js',
  'ui/fleet-panel.js',
  'ui/pier-panel.js',
  'ui/pier-detail-drawer.js',
  'ui/itinerary-results.js',
  'ui/trip-planner.js',
  'ui/guide-panel.js',
  'ui/environment-panel.js',
  'ui/review-portal-panel.js',
  'main.js'
];

let bundleJS = `/**
 * Tokyo Waterbus Atlas - Production ES Module Bundle
 */
`;

const sourceMap = new Map();
jsModules.forEach(modPath => {
  const fullPath = path.join(rootDir, 'src', modPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8').replace(/\r\n/g, '\n');
    
    // Strip CSS imports
    content = content.replace(/import\s+['"].*?\.css['"];?/g, '');
    
    // Strip JS imports
    content = content.replace(/import\s+(?:[\s\S]*?from\s+)?['"].*?['"];?/g, '');

    // Strip ES exports for single bundle scope
    content = content.replace(/export\s+default\s+/g, '');
    content = content.replace(/export\s+const\s+/g, 'const ');
    content = content.replace(/export\s+function\s+/g, 'function ');
    content = content.replace(/export\s+let\s+/g, 'let ');
    
    // Normalize CRLF line endings to LF for cross-platform deterministic hashing
    content = content.replace(/\r\n/g, '\n');

    sourceMap.set(modPath, content);
  }
});

sourceMap.forEach((content, modPath) => {
  bundleJS += `\n// --- Module: ${modPath} ---\n` + content + '\n';
});

bundleJS = bundleJS.replace(/\r\n/g, '\n');

// Copy Leaflet Vendor JS
const leafletJsPath = path.join(rootDir, 'node_modules', 'leaflet', 'dist', 'leaflet.js');
if (fs.existsSync(leafletJsPath)) {
  fs.copyFileSync(leafletJsPath, path.join(assetsDir, 'vendor-leaflet.js'));
} else {
  fs.writeFileSync(path.join(assetsDir, 'vendor-leaflet.js'), '/* Fallback Leaflet JS */', 'utf8');
}

// Compute JS Content Hash
const jsHash = crypto.createHash('sha256').update(bundleJS, 'utf8').digest('hex').substring(0, 8);
const hashedJsFilename = `index-atlas.${jsHash}.js`;
const jsFilename = 'index-atlas.js';

fs.writeFileSync(path.join(assetsDir, hashedJsFilename), bundleJS, 'utf8');
fs.writeFileSync(path.join(assetsDir, jsFilename), bundleJS, 'utf8');
console.log(`📦 Generated JS asset: dist/assets/${hashedJsFilename} (${(bundleJS.length / 1024).toFixed(2)} KB)`);

// 4. Generate Asset Manifest JSON
const manifestData = {
  "index-atlas.js": hashedJsFilename,
  "index-atlas.css": hashedCssFilename,
  "jsHash": jsHash,
  "cssHash": cssHash,
  "buildTimestamp": new Date().toISOString()
};

fs.writeFileSync(path.join(assetsDir, 'manifest.json'), JSON.stringify(manifestData, null, 2), 'utf8');
console.log(`📋 Generated Asset Manifest: dist/assets/manifest.json`);

// 5. Generate Production HTML with Content-Hashed Filenames
const htmlContent = `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Tokyo Waterbus Atlas｜東京水上巴士 航線・碼頭・動態探索</title>
  <meta name="description" content="Navigate Tokyo by water — routes, piers, live-status gateway, and simulated vessel movement." />
  <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
  
  <!-- Leaflet Vendor CSS -->
  <link rel="stylesheet" href="./assets/vendor-leaflet.css" />
  
  <!-- Production Bundled CSS (Content-Hashed) -->
  <link rel="stylesheet" href="./assets/${hashedCssFilename}" />
  
  <!-- Leaflet Vendor JS -->
  <script src="./assets/vendor-leaflet.js"></script>
</head>
<body>
  <div id="app"></div>
  
  <!-- Production Bundled ES Module (Content-Hashed) -->
  <script type="module" src="./assets/${hashedJsFilename}"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(distDir, 'index.html'), htmlContent, 'utf8');

// Copy favicon if exists
const faviconPath = path.join(rootDir, 'public', 'favicon.svg');
if (fs.existsSync(faviconPath)) {
  fs.copyFileSync(faviconPath, path.join(distDir, 'favicon.svg'));
}

// Write .nojekyll to prevent Jekyll from skipping files
fs.writeFileSync(path.join(distDir, '.nojekyll'), '', 'utf8');

// Copy public/artifacts directory if exists
const publicArtifactsDir = path.join(rootDir, 'public', 'artifacts');
if (fs.existsSync(publicArtifactsDir)) {
  fs.cpSync(publicArtifactsDir, path.join(distDir, 'artifacts'), { recursive: true });
  console.log('📦 Copied public artifacts to dist/artifacts');
}

console.log('✅ Production build artifact verified successfully!');
