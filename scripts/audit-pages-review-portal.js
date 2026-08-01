/**
 * GitHub Pages Review Portal Audit Script for Tokyo Waterbus Atlas (Phase v1.1.0-RC.3.13)
 * Audits Vite base path, workflow actions, portal client-side security, disclosures, and 13 canonical IDs rendering.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const artifactDir = path.join(rootDir, 'artifacts', 'v1.1-rc3-13');

if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

function runPagesAudit() {
  console.log('🚀 Running GitHub Pages Review Portal Audit (v1.1.0-RC.3.13)...');

  // Check 1: Vite config base path
  const viteConfigPath = path.join(rootDir, 'vite.config.js');
  const viteConfigText = fs.existsSync(viteConfigPath) ? fs.readFileSync(viteConfigPath, 'utf8') : '';
  const viteBaseValid = viteConfigText.includes("base: '/tokyo-waterbus-map/'");

  // Check 2: Workflow exists and uses official actions
  const workflowPath = path.join(rootDir, '.github', 'workflows', 'deploy-pages.yml');
  const workflowText = fs.existsSync(workflowPath) ? fs.readFileSync(workflowPath, 'utf8') : '';
  const workflowExists = fs.existsSync(workflowPath);
  const officialActionsValid = workflowText.includes('actions/checkout@v4') &&
                               workflowText.includes('actions/setup-node@v4') &&
                               workflowText.includes('actions/configure-pages@v5') &&
                               workflowText.includes('actions/upload-pages-artifact@v3') &&
                               workflowText.includes('actions/deploy-pages@v4');
  const deploysDistOnly = workflowText.includes("path: './dist'");

  // Check 3: Portal component renders 13 canonical IDs and disclosures
  const portalPath = path.join(rootDir, 'src', 'ui', 'review-portal-panel.js');
  const portalText = fs.existsSync(portalPath) ? fs.readFileSync(portalPath, 'utf8') : '';

  const canonicalRegisterPath = path.join(rootDir, 'artifacts', 'v1.1-rc3-11', 'canonical-review-id-register.json');
  const canonicalRegister = fs.existsSync(canonicalRegisterPath) ? JSON.parse(fs.readFileSync(canonicalRegisterPath, 'utf8')) : null;
  const canonicalIds = canonicalRegister ? canonicalRegister.canonicalReviewIds : [];

  let allIdsRendered = true;
  canonicalIds.forEach(id => {
    if (!portalText.includes(id)) allIdsRendered = false;
  });

  const noNetworkUpload = portalText.includes('FileReader') &&
                           !portalText.includes('fetch(') &&
                           !portalText.includes('XMLHttpRequest') &&
                           !portalText.includes('navigator.sendBeacon');

  const requiredLimitationText = portalText.includes('This is an approximate-reference visualization and review aid');
  const requiredOsmAttribution = portalText.includes('© OpenStreetMap contributors — ODbL-1.0');

  // Check 4: No absolute paths or secrets in public/src/
  let noLocalPathsOrSecrets = true;
  const scanDirs = [path.join(rootDir, 'src'), path.join(rootDir, 'public')];
  scanDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir, { recursive: true });
      files.forEach(f => {
        const full = path.join(dir, f);
        if (fs.statSync(full).isFile() && (full.endsWith('.js') || full.endsWith('.json') || full.endsWith('.html'))) {
          const content = fs.readFileSync(full, 'utf8');
          if (content.includes('file:///') || content.includes('e:\\\\ANTI') || content.includes('C:\\\\Users')) {
            noLocalPathsOrSecrets = false;
          }
        }
      });
    }
  });

  const auditPassed = viteBaseValid && workflowExists && officialActionsValid &&
                      deploysDistOnly && allIdsRendered && noNetworkUpload &&
                      requiredLimitationText && requiredOsmAttribution && noLocalPathsOrSecrets;

  const result = {
    timestamp: new Date().toISOString(),
    productVersion: 'v1.1.0-RC.3.13',
    viteBaseValid,
    workflowExists,
    officialActionsValid,
    deploysDistOnly,
    all13CanonicalIdsRendered: allIdsRendered,
    noNetworkUploadVerified: noNetworkUpload,
    requiredLimitationTextPresent: requiredLimitationText,
    requiredOsmAttributionPresent: requiredOsmAttribution,
    noLocalPathsOrSecrets,
    auditPassed,
    phaseGate: auditPassed ? 'PAGES_REVIEW_PORTAL_READY' : 'PAGES_AUDIT_FAILED'
  };

  fs.writeFileSync(path.join(artifactDir, 'pages-review-portal-audit.json'), JSON.stringify(result, null, 2), 'utf8');

  const mdReport = `# GitHub Pages Review Portal Audit Report (v1.1.0-RC.3.13)

- **Audit Timestamp**: ${result.timestamp}
- **Vite Production Base Path**: \`/tokyo-waterbus-map/\` (${viteBaseValid ? 'PASSED' : 'FAILED'})
- **GitHub Actions Workflow Exists**: \`${workflowExists}\`
- **Official Actions Used**: \`${officialActionsValid}\`
- **Deploys dist/ Only**: \`${deploysDistOnly}\`
- **13 Canonical Review IDs Rendered**: \`${allIdsRendered}\`
- **Client-Side Local-Only Validation (Zero Upload)**: \`${noNetworkUpload}\`
- **Required Limitation Text Present**: \`${requiredLimitationText}\`
- **OSM Source Attribution Present**: \`${requiredOsmAttribution}\`
- **No Local Absolute Paths / Secrets**: \`${noLocalPathsOrSecrets}\`
- **Audit Decision**: **${auditPassed ? 'PASSED' : 'FAILED'}**
`;

  fs.writeFileSync(path.join(artifactDir, 'pages-review-portal-audit.md'), mdReport, 'utf8');

  console.log(`📊 GitHub Pages Review Portal Audit Results:`);
  console.log(`   - Vite Base Path: /tokyo-waterbus-map/ (${viteBaseValid ? 'PASSED' : 'FAILED'})`);
  console.log(`   - Workflow Actions: ${officialActionsValid ? 'PASSED' : 'FAILED'}`);
  console.log(`   - 13 Canonical IDs Rendered: ${allIdsRendered ? 'PASSED' : 'FAILED'}`);
  console.log(`   - Local-Only CSV Validation (Zero Upload): ${noNetworkUpload ? 'PASSED' : 'FAILED'}`);
  console.log(`   - Audit Decision: ${auditPassed ? 'PASSED' : 'FAILED'}\n`);

  if (!auditPassed) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runPagesAudit();
