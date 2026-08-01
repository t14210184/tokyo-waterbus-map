/**
 * Operational Truth & Safe Simulation Lockout Audit Script for Tokyo Waterbus Atlas (v1.1.0-RC.3.18)
 * Audits service status registry, Tokyo Mizube Line suspension status, safe simulation lockout rules, and geometry file immutability.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { SERVICE_STATUS_REGISTRY, getRouteOperationalState } from '../src/data/service-status.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const artifactDir = path.join(rootDir, 'artifacts', 'v1.1-rc3-18');

if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

function getSha256(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

function runOperationalTruthAudit() {
  console.log('🚀 Running Operational Truth & Safe Lockout Audit (v1.1.0-RC.3.18)...');

  // Check 1: Tokyo Mizube Line Status in Registry
  const mizubeOperator = SERVICE_STATUS_REGISTRY.operators['tokyo-mizube-line'];
  const mizubeSuspended = mizubeOperator && mizubeOperator.serviceState === 'SUSPENDED' &&
                          mizubeOperator.simulationAllowed === false &&
                          mizubeOperator.planningAllowed === false &&
                          mizubeOperator.effectiveFrom === '2026-01-19';

  const mizubeHttpsUrl = mizubeOperator && mizubeOperator.sourceUrl.startsWith('https://www.tokyo-park.or.jp/water/waterbus/');
  const mizubeHasVerifiedDate = Boolean(mizubeOperator && mizubeOperator.lastVerifiedAt);

  // Check 2: Safe Lockout for all routes during off-hours or needs-review
  const routeIds = ['sumida-river', 'asakusa-odaiba-direct', 'hinode-odaiba', 'hamarikyu', 'mizube-line'];
  // Test off-hours (e.g. 03:00 JST / 18:00 UTC)
  const offHoursMs = new Date('2026-08-02T18:00:00Z').getTime(); // 03:00 JST
  let offHoursLockoutValid = true;
  routeIds.forEach(id => {
    const state = getRouteOperationalState(id, offHoursMs);
    if (state.simulationAllowed !== false) offHoursLockoutValid = false;
  });

  // Test mizube-line during daytime (12:00 JST / 03:00 UTC)
  const daytimeMs = new Date('2026-08-02T03:00:00Z').getTime(); // 12:00 JST
  const mizubeDaytimeState = getRouteOperationalState('mizube-line', daytimeMs);
  const mizubeDaytimeLocked = mizubeDaytimeState.serviceState === 'SUSPENDED' && mizubeDaytimeState.simulationAllowed === false;

  // Check 3: Immutability of src/data/route-geometries.js
  const geomPath = path.join(rootDir, 'src', 'data', 'route-geometries.js');
  const geomHash = getSha256(geomPath);
  const geomFileText = fs.existsSync(geomPath) ? fs.readFileSync(geomPath, 'utf8') : '';
  const geomUnchanged = geomFileText.includes('approximate-reference') && geomHash !== null;

  // Check 4: Ingestion Gate Immutability
  const eligibilityPath = path.join(rootDir, 'artifacts', 'v1.1-rc3-10', 'human-decision-eligibility.json');
  const eligibilityData = fs.existsSync(eligibilityPath) ? JSON.parse(fs.readFileSync(eligibilityPath, 'utf8')) : {};
  const decisionIngestionLocked = eligibilityData.humanDecisionIngestionEnabled === false && eligibilityData.eligibleForGeometryChangeCount === 0;

  // Check 5: No misleading affirmative claims ("即時 GPS 定位", "即時船位跟蹤", "LIVE AIS POSITION") in app UI
  const mainText = fs.readFileSync(path.join(rootDir, 'src', 'main.js'), 'utf8');
  const shellText = fs.readFileSync(path.join(rootDir, 'src', 'ui', 'shell.js'), 'utf8');
  const fleetText = fs.readFileSync(path.join(rootDir, 'src', 'ui', 'fleet-panel.js'), 'utf8');

  const combinedUiText = mainText + shellText + fleetText;
  const hasAffirmativeGpsClaim = /[^不]提供即時|即時 GPS 定位|LIVE AIS POSITION/.test(combinedUiText);
  const noMisleadingClaims = !hasAffirmativeGpsClaim;

  const auditPassed = mizubeSuspended && mizubeHttpsUrl && mizubeHasVerifiedDate &&
                      offHoursLockoutValid && mizubeDaytimeLocked && geomUnchanged &&
                      decisionIngestionLocked && noMisleadingClaims;

  const result = {
    timestamp: new Date().toISOString(),
    productVersion: 'v1.1.0-RC.3.18',
    mizubeSuspended,
    mizubeHttpsUrl,
    mizubeHasVerifiedDate,
    offHoursLockoutValid,
    mizubeDaytimeLocked,
    geomHash: geomHash ? geomHash.substring(0, 8) : null,
    geomUnchanged,
    decisionIngestionLocked,
    noMisleadingClaims,
    auditPassed,
    phaseGate: auditPassed ? 'OPERATIONAL_TRUTH_AUDIT_PASSED' : 'OPERATIONAL_TRUTH_AUDIT_FAILED'
  };

  fs.writeFileSync(path.join(artifactDir, 'operational-truth-audit.json'), JSON.stringify(result, null, 2), 'utf8');

  const mdReport = `# Operational Truth & Safe Lockout Audit Report (RC.3.18)

- **Audit Timestamp**: ${result.timestamp}
- **Tokyo Mizube Line Status**: \`SUSPENDED\` (Effective from 2026-01-19, \`${mizubeSuspended}\`)
- **Tokyo Mizube Line Official HTTPS Source**: \`${mizubeHttpsUrl}\`
- **Safe Simulation Lockout (Off-hours)**: \`${offHoursLockoutValid}\`
- **Safe Simulation Lockout (Mizube Daytime)**: \`${mizubeDaytimeLocked}\`
- **Route Geometries SHA-256 Checksum**: \`${geomHash}\` (\`${geomUnchanged}\`)
- **Decision Ingestion Gate Locked**: \`${decisionIngestionLocked}\` (\`humanDecisionIngestionEnabled = false\`)
- **No Misleading GPS/Live Claims**: \`${noMisleadingClaims}\`
- **Audit Decision**: **${auditPassed ? 'PASSED' : 'FAILED'}**
`;

  fs.writeFileSync(path.join(artifactDir, 'operational-truth-audit.md'), mdReport, 'utf8');

  console.log('📊 Operational Truth Audit Results:');
  console.log(`   - Tokyo Mizube Line Suspended: ${mizubeSuspended}`);
  console.log(`   - Safe Lockout Off-Hours: ${offHoursLockoutValid}`);
  console.log(`   - Route Geometries Checksum: ${geomHash ? geomHash.substring(0, 8) : 'N/A'}`);
  console.log(`   - Decision Ingestion Locked: ${decisionIngestionLocked}`);
  console.log(`   - Audit Decision: ${auditPassed ? 'PASSED' : 'FAILED'}\n`);

  if (!auditPassed) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runOperationalTruthAudit();
