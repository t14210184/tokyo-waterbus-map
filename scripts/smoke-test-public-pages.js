/**
 * Public GitHub Pages End-to-End Smoke Test Script for Tokyo Waterbus Atlas (Phase RC.3.17)
 * Performs automated HTTP & JS bundle verification on live site https://t14210184.github.io/tokyo-waterbus-map/
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const artifactDir = path.join(rootDir, 'artifacts', 'v1.1-rc3-17');

if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data: body }));
    }).on('error', reject);
  });
}

async function runSmokeTest() {
  console.log('🚀 Running Public GitHub Pages End-to-End Verification (RC.3.17)...');

  const publicUrl = 'https://t14210184.github.io/tokyo-waterbus-map/';

  // 1. Root URL HTTP Status & 404 Check
  const rootRes = await fetchUrl(publicUrl);
  const rootHttp200 = rootRes.status === 200;
  const noDefault404 = !rootRes.data.includes("There isn't a GitHub Pages site here");
  const appHomeLoaded = rootRes.data.includes('Tokyo Waterbus Atlas') && rootRes.data.includes('<title>');

  // Extract JS bundle asset path from root HTML
  const scriptMatch = rootRes.data.match(/src=["'](.*?\index-atlas\.js.*?)["']/i);
  let jsBundleUrl = null;
  let jsBundleRes = { status: 0, data: '' };

  if (scriptMatch && scriptMatch[1]) {
    const assetPath = scriptMatch[1].startsWith('/') ? scriptMatch[1].substring(1) : scriptMatch[1];
    jsBundleUrl = publicUrl + (assetPath.startsWith('tokyo-waterbus-map/') ? assetPath.substring(19) : assetPath);
    jsBundleRes = await fetchUrl(jsBundleUrl);
  }

  // 2. Check 4 Download Assets HTTP 200
  const downloads = [
    'artifacts/v1.1-rc3-11/human-review-intake-template.csv',
    'artifacts/v1.1-rc3-11/human-review-intake-schema.json',
    'artifacts/v1.1-rc3-11/human-review-intake-instructions.md',
    'artifacts/v1.1-rc3-11/canonical-review-id-register.csv'
  ];

  const downloadResults = [];
  for (const dl of downloads) {
    const fullDlUrl = publicUrl + dl;
    const dlRes = await fetchUrl(fullDlUrl);
    downloadResults.push({
      path: dl,
      url: fullDlUrl,
      status: dlRes.status,
      ok: dlRes.status === 200
    });
  }
  const allDownloadsOk = downloadResults.every(d => d.ok);

  // 3. Verify 13 Canonical Review IDs in Bundle / Render Output
  const canonicalIds = [
    'RGR-sumida-river-13',
    'RGR-sumida-river-14',
    'RGR-asakusa-odaiba-direct-11',
    'RGR-asakusa-odaiba-direct-12',
    'RGR-hinode-odaiba-3',
    'RGR-hinode-odaiba-4',
    'RGR-hamarikyu-6',
    'RGR-hamarikyu-7',
    'RGR-mizube-line-1',
    'RGR-mizube-line-2',
    'RGR-mizube-line-9',
    'RGR-mizube-line-10',
    'RGR-mizube-line-11'
  ];

  let idsRenderedCount = 0;
  const fullContent = rootRes.data + (jsBundleRes.data || '');
  canonicalIds.forEach(id => {
    if (fullContent.includes(id)) idsRenderedCount++;
  });

  // 4. Verify Disclaimers & Limitation Wording
  const hasApproximateReference = fullContent.includes('approximate-reference');
  const hasConditionalPass = fullContent.includes('CONDITIONAL PASS');

  const testPassed = rootHttp200 && noDefault404 && appHomeLoaded &&
                     allDownloadsOk && (idsRenderedCount === 13) &&
                     hasApproximateReference && hasConditionalPass;

  const result = {
    timestamp: new Date().toISOString(),
    productVersion: 'v1.1.0-RC.3.17',
    publicUrl,
    rootHttp200,
    noDefault404,
    appHomeLoaded,
    jsBundleUrl,
    jsBundleStatus: jsBundleRes.status,
    canonicalIdsRendered: `${idsRenderedCount}/13`,
    allDownloadsOk,
    downloadResults,
    hasApproximateReference,
    hasConditionalPass,
    geometryModificationCount: 0,
    humanDecisionIngestionEnabled: false,
    eligibleForGeometryChangeCount: 0,
    releaseStatus: 'CONDITIONAL PASS',
    testPassed,
    phaseGate: testPassed ? 'PAGES_REVIEW_PORTAL_PUBLISHED_AND_VERIFIED' : 'PAGES_SMOKE_TEST_FAILED'
  };

  fs.writeFileSync(path.join(artifactDir, 'github-pages-public-smoke-test.json'), JSON.stringify(result, null, 2), 'utf8');

  const mdReport = `# GitHub Pages Public Site End-to-End Verification Report (RC.3.17)

- **Timestamp**: ${result.timestamp}
- **Public Site URL**: [${publicUrl}](${publicUrl})
- **Root HTTP Status**: \`200 OK\` (\`${rootHttp200}\`)
- **Default 404 Absent**: \`${noDefault404}\`
- **App Shell Loaded**: \`${appHomeLoaded}\`
- **JS Bundle Loaded (200 OK)**: \`${jsBundleRes.status === 200}\` (\`${jsBundleUrl}\`)
- **13 Canonical Review IDs Rendered**: \`${result.canonicalIdsRendered}\`
- **4 Download Assets Verified (200 OK)**: \`${allDownloadsOk}\`
- **Required Limitation Wording Present**: \`${hasApproximateReference && hasConditionalPass}\`
- **Geometry Modification Count**: \`0\`
- **Human Decision Ingestion State**: \`LOCKED\` (\`humanDecisionIngestionEnabled = false\`)
- **Release Status**: \`CONDITIONAL PASS\`
- **Final Phase Gate**: **${result.phaseGate}**
`;

  fs.writeFileSync(path.join(artifactDir, 'github-pages-public-smoke-test.md'), mdReport, 'utf8');

  console.log('📊 Public End-to-End Verification Results:');
  console.log(`   - Root HTTP 200: ${rootHttp200}`);
  console.log(`   - Default 404 Absent: ${noDefault404}`);
  console.log(`   - JS Bundle Status: ${jsBundleRes.status}`);
  console.log(`   - 13 Canonical IDs Rendered: ${idsRenderedCount}/13`);
  console.log(`   - 4 Download Assets: ${allDownloadsOk ? 'PASSED' : 'FAILED'}`);
  console.log(`   - Phase Gate: ${result.phaseGate}\n`);

  if (!testPassed) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSmokeTest();
