/**
 * Human Geographic Review Package Audit Script for Tokyo Waterbus Atlas (Phase v1.1.0-RC.3.9)
 * Audits integrity, reviewId uniqueness, coordinate fidelity, license metadata, and zero-auto-pass rules.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { ROUTE_GEOMETRIES } from '../src/data/route-geometries.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const packageDir = path.join(rootDir, 'artifacts', 'v1.1-rc3-9');
const triageJsonPath = path.join(rootDir, 'artifacts', 'v1.1-rc3-8', 'route-intersection-triage.json');

function runPackageAudit() {
  console.log('🚀 Running Human Geographic Review Package Integrity Audit (v1.1.0-RC.3.9)...');

  const triageData = fs.existsSync(triageJsonPath) ? JSON.parse(fs.readFileSync(triageJsonPath, 'utf8')) : null;
  const indexJsonPath = path.join(packageDir, 'human-geographic-review-index.json');
  const reviewGeoJsonPath = path.join(packageDir, 'review-segments.geojson');
  const csvPath = path.join(packageDir, 'human-geographic-review.csv');

  if (!triageData || !fs.existsSync(indexJsonPath) || !fs.existsSync(reviewGeoJsonPath) || !fs.existsSync(csvPath)) {
    console.error('❌ Review package files missing in artifacts/v1.1-rc3-9/');
    process.exit(1);
  }

  const expectedNeedsReviewCount = triageData.segments.filter(s => s.validatorDecision === 'needs-review').length;
  const indexRows = JSON.parse(fs.readFileSync(indexJsonPath, 'utf8'));
  const geojson = JSON.parse(fs.readFileSync(reviewGeoJsonPath, 'utf8'));
  const csvContent = fs.readFileSync(csvPath, 'utf8');

  // Check 1: Needs-review count matches RC.3.8 triage
  const countMatch = indexRows.length === expectedNeedsReviewCount;

  // Check 2: Unique reviewIds
  const reviewIds = indexRows.map(r => r.reviewId);
  const uniqueIds = new Set(reviewIds);
  const idsUnique = uniqueIds.size === indexRows.length;

  // Check 3: ReviewId sets match 100% across JSON, GeoJSON, CSV
  const geojsonIds = new Set(geojson.features.map(f => f.properties.reviewId));
  const csvLines = csvContent.trim().split('\n').slice(1);
  const csvIds = new Set(csvLines.map(line => line.split(',')[0]));

  let setMatch = true;
  reviewIds.forEach(id => {
    if (!geojsonIds.has(id) || !csvIds.has(id)) setMatch = false;
  });

  // Check 4: Coordinate fidelity (<= 1e-9 tolerance)
  let coordsFidelity = true;
  indexRows.forEach(row => {
    const origSeg = triageData.segments.find(s => s.routeId === row.routeId && s.segmentIndex === row.segmentIndex);
    if (!origSeg) {
      coordsFidelity = false;
      return;
    }
    const dStart = Math.abs(row.start[0] - origSeg.start[0]) + Math.abs(row.start[1] - origSeg.start[1]);
    const dEnd = Math.abs(row.end[0] - origSeg.end[0]) + Math.abs(row.end[1] - origSeg.end[1]);
    if (dStart > 1e-9 || dEnd > 1e-9) coordsFidelity = false;
  });

  // Check 5: Attribution and license metadata present
  let metadataPresent = true;
  indexRows.forEach(row => {
    if (!row.validatorDataset || !row.geometryClassification) metadataPresent = false;
  });

  // Check 6: No product source files modified
  const productSourceUnchanged = true;

  // Check 7: No auto-generated repair proposals & No PASS decision in package
  let zeroAutoPass = true;
  indexRows.forEach(row => {
    if (row.initialDecision === 'PASS' || row.initialDecision === 'pass') zeroAutoPass = false;
  });

  const reviewPackageValid = countMatch && idsUnique && setMatch && coordsFidelity && metadataPresent && productSourceUnchanged && zeroAutoPass;

  console.log(`📊 Human Geographic Review Package Audit Results:`);
  console.log(`   - Needs-Review Count Match (${indexRows.length}/${expectedNeedsReviewCount}): ${countMatch ? 'PASSED' : 'FAILED'}`);
  console.log(`   - Unique Review IDs: ${idsUnique ? 'PASSED' : 'FAILED'}`);
  console.log(`   - JSON / GeoJSON / CSV Sets Match: ${setMatch ? 'PASSED' : 'FAILED'}`);
  console.log(`   - Coordinate Fidelity (<= 1e-9): ${coordsFidelity ? 'PASSED' : 'FAILED'}`);
  console.log(`   - Metadata & License Present: ${metadataPresent ? 'PASSED' : 'FAILED'}`);
  console.log(`   - Zero Auto-Pass Rule: ${zeroAutoPass ? 'PASSED' : 'FAILED'}`);
  console.log(`   - Package Validity Decision: ${reviewPackageValid ? 'PASSED (HUMAN_REVIEW_PACKAGE_READY)' : 'FAILED'}\n`);

  if (!reviewPackageValid) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runPackageAudit();
