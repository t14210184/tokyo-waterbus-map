/**
 * Static Build Integrity Audit Script for Tokyo Waterbus Atlas (Phase 4A.2)
 * Verifies production static bundle assets, LEAFLET_CDN_ENDPOINTS declaration scope, and zero unresolved imports.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const artifactDir = path.join(rootDir, 'artifacts', 'phase-4a-2');

if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true });
}

console.log('🚀 Running Static Build Integrity Audit...');

const indexHtmlPath = path.join(distDir, 'index.html');
const jsBundlePath = path.join(distDir, 'assets', 'index-atlas.js');
const cssBundlePath = path.join(distDir, 'assets', 'index-atlas.css');

const indexExists = fs.existsSync(indexHtmlPath);
const jsBundleExists = fs.existsSync(jsBundlePath) && fs.statSync(jsBundlePath).size > 0;
const cssBundleExists = fs.existsSync(cssBundlePath) && fs.statSync(cssBundlePath).size > 0;

let jsContent = '';
if (jsBundleExists) {
  jsContent = fs.readFileSync(jsBundlePath, 'utf8');
}

// Audit LEAFLET_CDN_ENDPOINTS declaration & scope
const endpointsDeclMatch = jsContent.match(/const\s+LEAFLET_CDN_ENDPOINTS\s*=/g);
const declarationCount = endpointsDeclMatch ? endpointsDeclMatch.length : 0;

const declIndex = jsContent.indexOf('LEAFLET_CDN_ENDPOINTS');
const usageIndex = jsContent.indexOf('LEAFLET_CDN_ENDPOINTS.length');
const scopeVerified = declarationCount >= 1 && (usageIndex === -1 || declIndex < usageIndex);

// Audit Unresolved Internal Imports
const unresolvedImports = [];
const lines = jsContent.split('\n');
lines.forEach((line, idx) => {
  if (/import\s+.*from\s+['"]\.\.?\//.test(line) || /export\s+.*from\s+['"]\.\.?\//.test(line)) {
    unresolvedImports.push({ line: idx + 1, text: line.trim() });
  }
});

// Missing Assets Audit
const missingAssets = [];
if (indexExists) {
  const htmlText = fs.readFileSync(indexHtmlPath, 'utf8');
  if (htmlText.includes('index-atlas.js') && !jsBundleExists) missingAssets.push('dist/assets/index-atlas.js');
  if (htmlText.includes('index-atlas.css') && !cssBundleExists) missingAssets.push('dist/assets/index-atlas.css');
} else {
  missingAssets.push('dist/index.html');
}

const isValid = indexExists && jsBundleExists && cssBundleExists && scopeVerified && unresolvedImports.length === 0 && missingAssets.length === 0;

const auditData = {
  timestamp: new Date().toISOString(),
  distExists: fs.existsSync(distDir),
  indexExists,
  jsBundleExists,
  cssBundleExists,
  jsBundleSizeBytes: jsBundleExists ? fs.statSync(jsBundlePath).size : 0,
  cssBundleSizeBytes: cssBundleExists ? fs.statSync(cssBundlePath).size : 0,
  leafletEndpoints: {
    declarationCount,
    referenceCount: (jsContent.match(/LEAFLET_CDN_ENDPOINTS/g) || []).length,
    scopeVerified
  },
  unresolvedInternalImports: unresolvedImports,
  missingAssets,
  valid: isValid
};

fs.writeFileSync(path.join(artifactDir, 'static-build-audit.json'), JSON.stringify(auditData, null, 2), 'utf8');

const mdReport = `# Tokyo Waterbus Atlas - Static Build Integrity Audit Report

- **Timestamp**: ${auditData.timestamp}
- **Index HTML Exists**: ${indexExists}
- **JS Bundle Exists**: ${jsBundleExists} (${(auditData.jsBundleSizeBytes / 1024).toFixed(2)} KB)
- **CSS Bundle Exists**: ${cssBundleExists} (${(auditData.cssBundleSizeBytes / 1024).toFixed(2)} KB)
- **LEAFLET_CDN_ENDPOINTS Declaration Count**: ${declarationCount}
- **LEAFLET_CDN_ENDPOINTS Scope Verified**: ${scopeVerified}
- **Unresolved Internal Imports Count**: ${unresolvedImports.length}
- **Missing Assets**: ${missingAssets.length === 0 ? 'None' : missingAssets.join(', ')}
- **Audit Result**: ${isValid ? 'PASSED' : 'FAILED'}
`;

fs.writeFileSync(path.join(artifactDir, 'static-build-audit.md'), mdReport, 'utf8');

console.log(`📊 Static Build Audit Results:
   - Index Exists: ${indexExists}
   - JS Bundle: ${jsBundleExists} (${(auditData.jsBundleSizeBytes / 1024).toFixed(2)} KB)
   - LEAFLET_CDN_ENDPOINTS Declaration Count: ${declarationCount}
   - Scope Verified: ${scopeVerified}
   - Unresolved Imports: ${unresolvedImports.length}
   - Audit Status: ${isValid ? 'PASSED' : 'FAILED'}
`);

if (!isValid) {
  console.error('❌ STATIC BUILD AUDIT FAILED!');
  process.exit(1);
} else {
  console.log('✅ STATIC BUILD AUDIT PASSED!');
  process.exit(0);
}
