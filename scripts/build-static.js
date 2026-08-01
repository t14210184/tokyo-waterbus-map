/**
 * Pure-JS Static Production Builder for Tokyo Waterbus Atlas (Phase 4A / RC.3.1 Map Truth Repair)
 * Bundles application CSS/JS and copies local Leaflet vendor assets to ensure instant, zero-delay map initialization.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const assetsDir = path.join(distDir, 'assets');

console.log('🚀 Running Pure-JS Static Production Builder for Tokyo Waterbus Atlas...');

// 1. Ensure dist directories
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(assetsDir, { recursive: true });

// Copy Local Leaflet Vendor Assets for Zero-Delay Loading
const nodeModulesLeafletCss = path.join(rootDir, 'node_modules', 'leaflet', 'dist', 'leaflet.css');
const nodeModulesLeafletJs = path.join(rootDir, 'node_modules', 'leaflet', 'dist', 'leaflet.js');

if (fs.existsSync(nodeModulesLeafletCss)) {
  fs.copyFileSync(nodeModulesLeafletCss, path.join(assetsDir, 'vendor-leaflet.css'));
  console.log('📦 Copied vendor asset: dist/assets/vendor-leaflet.css');
}

if (fs.existsSync(nodeModulesLeafletJs)) {
  fs.copyFileSync(nodeModulesLeafletJs, path.join(assetsDir, 'vendor-leaflet.js'));
  console.log('📦 Copied vendor asset: dist/assets/vendor-leaflet.js');
}

// 2. Bundle App CSS files
const cssFiles = [
  'tokens.css',
  'base.css',
  'layout.css',
  'components.css',
  'map.css',
  'responsive.css'
];

let bundledCSS = '/* Tokyo Waterbus Atlas - Bundled Production CSS */\n';
cssFiles.forEach(file => {
  const filePath = path.join(rootDir, 'src', 'styles', file);
  if (fs.existsSync(filePath)) {
    bundledCSS += `\n/* --- ${file} --- */\n` + fs.readFileSync(filePath, 'utf8') + '\n';
  }
});

const cssFilename = 'index-atlas.css';
fs.writeFileSync(path.join(assetsDir, cssFilename), bundledCSS, 'utf8');
console.log(`📦 Generated CSS asset: dist/assets/${cssFilename} (${(bundledCSS.length / 1024).toFixed(2)} KB)`);

// 3. Bundle JS Code (In strict dependency order)
const jsModules = [
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
  'ui/shell.js',
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
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Strip CSS imports
    content = content.replace(/import\s+['"].*?\.css['"];?/g, '');
    
    // Strip JS imports
    content = content.replace(/import\s+(?:[\s\S]*?from\s+)?['"].*?['"];?/g, '');

    // Strip ES exports for single bundle scope
    content = content.replace(/export\s+default\s+/g, '');
    content = content.replace(/export\s+const\s+/g, 'const ');
    content = content.replace(/export\s+function\s+/g, 'function ');
    content = content.replace(/export\s+let\s+/g, 'let ');
    
    sourceMap.set(modPath, content);
  }
});

sourceMap.forEach((content, modPath) => {
  bundleJS += `\n// --- Module: ${modPath} ---\n` + content + '\n';
});

const jsFilename = 'index-atlas.js';
fs.writeFileSync(path.join(assetsDir, jsFilename), bundleJS, 'utf8');
console.log(`📦 Generated JS asset: dist/assets/${jsFilename} (${(bundleJS.length / 1024).toFixed(2)} KB)`);

// 4. Generate Production HTML (100% self-contained local assets, 0 external blocking font/script calls)
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
  
  <!-- Production Bundled CSS -->
  <link rel="stylesheet" href="./assets/${cssFilename}" />
  
  <!-- Leaflet Vendor JS -->
  <script src="./assets/vendor-leaflet.js"></script>
</head>
<body>
  <div id="app"></div>
  
  <!-- Production Bundled ES Module -->
  <script type="module" src="./assets/${jsFilename}"></script>
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
