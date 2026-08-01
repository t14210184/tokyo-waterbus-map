/**
 * Adversarial Geometry Validator Fixtures Audit Script for Tokyo Waterbus Atlas (Phase v1.1.0-RC.3.7)
 * Runs strict segment line-vs-polygon split & midpoint point-in-polygon algorithm against 7 synthetic fixtures.
 * Verifies zero false PASS decisions.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const fixturesDir = path.join(rootDir, 'tests', 'fixtures', 'geometry-validator');
const artifactDir = path.join(rootDir, 'artifacts', 'v1.1-rc3-7');

if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 2D Line Segment Intersection algorithm
function lineIntersect(p1, p2, p3, p4) {
  const x1 = p1[0], y1 = p1[1];
  const x2 = p2[0], y2 = p2[1];
  const x3 = p3[0], y3 = p3[1];
  const x4 = p4[0], y4 = p4[1];

  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denom === 0) return null; // Parallel or collinear

  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

  if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
    const ix = x1 + ua * (x2 - x1);
    const iy = y1 + ua * (y2 - y1);
    return [ix, iy];
  }
  return null;
}

// Point in Polygon algorithm (Ray casting)
function pointInPolygon(pt, ring) {
  const x = pt[0], y = pt[1];
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function evaluateFixture(fixture) {
  const { name, expectedOutcome, landPolygon, segment, pierCoordinates, datasetBbox } = fixture;

  const defaultBbox = [139.65, 35.55, 139.95, 35.75];
  const bbox = datasetBbox || defaultBbox;

  // Check 1: Coverage Gap
  const startInBbox = segment.start[0] >= bbox[0] && segment.start[0] <= bbox[2] && segment.start[1] >= bbox[1] && segment.start[1] <= bbox[3];
  const endInBbox = segment.end[0] >= bbox[0] && segment.end[0] <= bbox[2] && segment.end[1] >= bbox[1] && segment.end[1] <= bbox[3];

  if (!startInBbox || !endInBbox) {
    return { name, actualOutcome: 'OUT_OF_SCOPE', expectedOutcome, match: expectedOutcome === 'OUT_OF_SCOPE' };
  }

  // Check 2: Terminal Pier Exemption Radius (<= 80m)
  if (pierCoordinates) {
    const distStart = calculateDistanceMeters(segment.start[1], segment.start[0], pierCoordinates[1], pierCoordinates[0]);
    if (distStart <= 80) {
      return { name, actualOutcome: 'PASS_WITH_TERMINAL_EXEMPTION', expectedOutcome, match: expectedOutcome === 'PASS_WITH_TERMINAL_EXEMPTION' };
    }
  }

  // Check 3: Line Segment vs Land Polygon Intersections & Midpoint Check
  const polygons = landPolygon.geometry.type === 'MultiPolygon'
    ? landPolygon.geometry.coordinates
    : [landPolygon.geometry.coordinates];

  let intersections = [];
  let isBoundaryTouch = false;
  let isLandInterior = false;

  polygons.forEach(rings => {
    const outerRing = rings[0];
    for (let i = 0; i < outerRing.length - 1; i++) {
      const p3 = outerRing[i];
      const p4 = outerRing[i + 1];

      // Check collinear boundary overlap with 1D interval overlap check
      if (segment.start[1] === p3[1] && segment.end[1] === p4[1] && segment.start[1] === p4[1]) {
        const minSegX = Math.min(segment.start[0], segment.end[0]);
        const maxSegX = Math.max(segment.start[0], segment.end[0]);
        const minPolyX = Math.min(p3[0], p4[0]);
        const maxPolyX = Math.max(p3[0], p4[0]);
        if (Math.max(minSegX, minPolyX) < Math.min(maxSegX, maxPolyX)) {
          isBoundaryTouch = true;
        }
      } else if (segment.start[0] === p3[0] && segment.end[0] === p4[0] && segment.start[0] === p4[0]) {
        const minSegY = Math.min(segment.start[1], segment.end[1]);
        const maxSegY = Math.max(segment.start[1], segment.end[1]);
        const minPolyY = Math.min(p3[1], p4[1]);
        const maxPolyY = Math.max(p3[1], p4[1]);
        if (Math.max(minSegY, minPolyY) < Math.min(maxSegY, maxPolyY)) {
          isBoundaryTouch = true;
        }
      }

      const hit = lineIntersect(segment.start, segment.end, p3, p4);
      if (hit) intersections.push(hit);
    }
  });

  // Midpoint check
  const midPoint = [(segment.start[0] + segment.end[0]) / 2, (segment.start[1] + segment.end[1]) / 2];

  polygons.forEach(rings => {
    const inOuter = pointInPolygon(midPoint, rings[0]);
    let inHole = false;
    for (let h = 1; h < rings.length; h++) {
      if (pointInPolygon(midPoint, rings[h])) inHole = true;
    }
    if (inOuter && !inHole) isLandInterior = true;
  });

  let decision = 'PASS';
  if (isLandInterior || isBoundaryTouch || intersections.length > 0) {
    decision = 'NEEDS_REVIEW';
  }

  return {
    name,
    actualOutcome: decision,
    expectedOutcome,
    match: decision === expectedOutcome,
    intersectionCount: intersections.length,
    isLandInterior,
    isBoundaryTouch
  };
}

function runFixturesAudit() {
  console.log('🚀 Running Adversarial Geometry Validator Fixtures Audit (v1.1.0-RC.3.7)...');

  const fixtureFiles = [
    'crosses-land.geojson',
    'lies-in-water.geojson',
    'endpoint-only-near-pier.geojson',
    'boundary-overlap.geojson',
    'polygon-hole.geojson',
    'coverage-gap.geojson',
    'multi-crossing.geojson'
  ];

  const results = [];
  let passCount = 0;

  fixtureFiles.forEach(file => {
    const filePath = path.join(fixturesDir, file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Fixture file missing: ${file}`);
      process.exit(1);
    }

    const fixture = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const evalResult = evaluateFixture(fixture);
    if (evalResult.match) passCount++;
    results.push(evalResult);
  });

  const auditPassed = (passCount === fixtureFiles.length);

  fs.writeFileSync(
    path.join(artifactDir, 'geometry-validator-fixture-results.json'),
    JSON.stringify({ timestamp: new Date().toISOString(), totalFixtures: results.length, passCount, results, auditPassed }, null, 2),
    'utf8'
  );

  const mdReport = `# Adversarial Geometry Validator Fixtures Audit Report (v1.1.0-RC.3.7)

- **Audit Date**: ${new Date().toISOString()}
- **Total Fixtures Audited**: ${results.length}
- **Matches Expected Outcome**: ${passCount} / ${results.length}
- **Audit Decision**: **\`${auditPassed ? 'PASSED (VALIDATOR_READY_FOR_REPAIR)' : 'FAILED'}\`**

## Fixture Results Matrix

| Fixture Name | Expected Outcome | Actual Outcome | Outcome Match |
| :--- | :--- | :--- | :---: |
${results.map(r => `| \`${r.name}\` | \`${r.expectedOutcome}\` | \`${r.actualOutcome}\` | ${r.match ? '✅ MATCH' : '❌ MISMATCH'} |`).join('\n')}
`;

  fs.writeFileSync(path.join(artifactDir, 'geometry-validator-fixture-results.md'), mdReport, 'utf8');

  console.log(`📊 Fixture Audit Results:`);
  results.forEach(r => {
    console.log(`   - Fixture [${r.name}]: Expected=${r.expectedOutcome}, Actual=${r.actualOutcome} (${r.match ? 'MATCH' : 'MISMATCH'})`);
  });
  console.log(`   - Audit Decision: ${auditPassed ? 'PASSED' : 'FAILED'}\n`);

  if (!auditPassed) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runFixturesAudit();
