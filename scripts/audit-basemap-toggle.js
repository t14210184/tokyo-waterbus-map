/**
 * Basemap Toggle Integrity Audit Script for Tokyo Waterbus Atlas (v1.1.0-RC.3.18)
 * Verifies dark/light/none base map layer configuration, accessibility attributes, fallback modes, and controller methods.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const artifactDir = path.join(rootDir, 'artifacts', 'v1.1-rc3-18');

if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

function runBasemapToggleAudit() {
  console.log('🚀 Running Basemap Toggle Audit (v1.1.0-RC.3.18)...');

  // Check 1: base-layers.js exports TILE_LAYERS with dark, light, and none
  const baseLayersPath = path.join(rootDir, 'src', 'map', 'base-layers.js');
  const baseLayersText = fs.existsSync(baseLayersPath) ? fs.readFileSync(baseLayersPath, 'utf8') : '';

  const hasDarkConfig = baseLayersText.includes("id: 'dark'") && baseLayersText.includes('cartocdn.com/dark_all');
  const hasLightConfig = baseLayersText.includes("id: 'light'") && baseLayersText.includes('cartocdn.com/light_all');
  const hasNoneFallbackConfig = baseLayersText.includes("id: 'none'") && baseLayersText.includes('無 (參考資料圖層)');
  const hasToggleMethods = baseLayersText.includes('setMode:') && baseLayersText.includes('toggle:');
  const hasOsmAttribution = baseLayersText.includes('OpenStreetMap') || baseLayersText.includes('OSM');

  // Check 2: create-map.js exposes toggleBaseMap, setBaseMapMode, getBaseMapMode
  const createMapPath = path.join(rootDir, 'src', 'map', 'create-map.js');
  const createMapText = fs.existsSync(createMapPath) ? fs.readFileSync(createMapPath, 'utf8') : '';
  const exposesToggleMethods = createMapText.includes('toggleBaseMap:') && createMapText.includes('setBaseMapMode:') && createMapText.includes('getBaseMapMode:');

  // Check 3: shell.js contains btn-theme-toggle with accessibility attributes
  const shellPath = path.join(rootDir, 'src', 'ui', 'shell.js');
  const shellText = fs.existsSync(shellPath) ? fs.readFileSync(shellPath, 'utf8') : '';
  const hasThemeToggleBtn = shellText.includes('id="btn-theme-toggle"') && shellText.includes('aria-label="切換地圖底圖"') && shellText.includes('aria-pressed=');

  // Check 4: main.js binds click handler to btn-theme-toggle
  const mainPath = path.join(rootDir, 'src', 'main.js');
  const mainText = fs.existsSync(mainPath) ? fs.readFileSync(mainPath, 'utf8') : '';
  const hasClickHandler = mainText.includes("getElementById('btn-theme-toggle')") && mainText.includes('layers.toggle');

  const auditPassed = hasDarkConfig && hasLightConfig && hasNoneFallbackConfig &&
                      hasToggleMethods && exposesToggleMethods && hasThemeToggleBtn &&
                      hasClickHandler && hasOsmAttribution;

  const result = {
    timestamp: new Date().toISOString(),
    productVersion: 'v1.1.0-RC.3.18',
    hasDarkConfig,
    hasLightConfig,
    hasNoneFallbackConfig,
    hasToggleMethods,
    exposesToggleMethods,
    hasThemeToggleBtn,
    hasClickHandler,
    hasOsmAttribution,
    auditPassed,
    phaseGate: auditPassed ? 'BASEMAP_TOGGLE_AUDIT_PASSED' : 'BASEMAP_TOGGLE_AUDIT_FAILED'
  };

  fs.writeFileSync(path.join(artifactDir, 'basemap-toggle-audit.json'), JSON.stringify(result, null, 2), 'utf8');

  const mdReport = `# Basemap Toggle Integrity Audit Report (RC.3.18)

- **Audit Timestamp**: ${result.timestamp}
- **Dark Mode Layer Config**: \`${hasDarkConfig}\`
- **Light Mode Layer Config**: \`${hasLightConfig}\`
- **None/Data Fallback Config**: \`${hasNoneFallbackConfig}\`
- **Controller Toggle Methods Exposed**: \`${hasToggleMethods && exposesToggleMethods}\`
- **UI Button Accessibility Attributes**: \`${hasThemeToggleBtn}\`
- **Main Event Handler Bound**: \`${hasClickHandler}\`
- **OSM / ODbL Attribution Present**: \`${hasOsmAttribution}\`
- **Audit Decision**: **${auditPassed ? 'PASSED' : 'FAILED'}**
`;

  fs.writeFileSync(path.join(artifactDir, 'basemap-toggle-audit.md'), mdReport, 'utf8');

  console.log('📊 Basemap Toggle Audit Results:');
  console.log(`   - Dark/Light/None Modes: ${hasDarkConfig && hasLightConfig && hasNoneFallbackConfig}`);
  console.log(`   - Controller Toggle Methods: ${exposesToggleMethods}`);
  console.log(`   - Accessibility Attributes: ${hasThemeToggleBtn}`);
  console.log(`   - Audit Decision: ${auditPassed ? 'PASSED' : 'FAILED'}\n`);

  if (!auditPassed) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runBasemapToggleAudit();
