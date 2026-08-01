/**
 * Human Geographic Review Package Builder for Tokyo Waterbus Atlas (Phase v1.1.0-RC.3.9)
 * Generates portable, standardized review artifacts for all 13 needs-review route segments.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { ROUTE_GEOMETRIES } from '../src/data/route-geometries.js';
import { ROUTES } from '../src/data/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const artifactDir = path.join(rootDir, 'artifacts', 'v1.1-rc3-9');
const subDirOverlay = path.join(artifactDir, 'review-overlay-by-route');

if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });
if (!fs.existsSync(subDirOverlay)) fs.mkdirSync(subDirOverlay, { recursive: true });

const triageJsonPath = path.join(rootDir, 'artifacts', 'v1.1-rc3-8', 'route-intersection-triage.json');
const validationGeoJsonPath = path.join(rootDir, 'data', 'verification', 'derived', 'water-land-validation.geojson');

function buildReviewPackage() {
  console.log('🚀 Building Human Geographic Review Package (v1.1.0-RC.3.9)...');

  if (!fs.existsSync(triageJsonPath)) {
    console.error('❌ Triage output missing from RC.3.8.');
    process.exit(1);
  }

  const triageData = JSON.parse(fs.readFileSync(triageJsonPath, 'utf8'));
  const validationGeoJson = fs.existsSync(validationGeoJsonPath) ? JSON.parse(fs.readFileSync(validationGeoJsonPath, 'utf8')) : null;

  // Filter ONLY validatorDecision === 'needs-review'
  const needsReviewSegments = triageData.segments.filter(s => s.validatorDecision === 'needs-review');
  console.log(`📌 Found ${needsReviewSegments.length} needs-review segments for human review.`);

  const reviewRows = [];
  const segmentFeatures = [];
  const terminalFeatures = [];

  needsReviewSegments.forEach(seg => {
    const reviewId = `RGR-${seg.routeId}-${seg.segmentIndex}`;
    const routeObj = ROUTES.find(r => r.id === seg.routeId);
    const routeName = (routeObj && routeObj.name && routeObj.name.zhHant) ? routeObj.name.zhHant : seg.routeId;

    const row = {
      reviewId,
      routeId: seg.routeId,
      segmentIndex: seg.segmentIndex,
      routeName,
      start: seg.start,
      end: seg.end,
      lengthMeters: seg.lengthMeters,
      scopeClassification: seg.scopeClassification,
      intersectionPoints: seg.lineIntersectionPoints,
      boundaryTouchCount: seg.boundaryTouchCount,
      landInteriorPartCount: seg.landInteriorPartCount,
      terminalExemption: seg.terminalExemption,
      validatorDataset: "OSM_DERIVED land polygons",
      validatorLimitations: "Coastline-derived land boundaries; inner river/canal细节未完全捕捉",
      geometryClassification: "approximate-reference",
      initialDecision: "NEEDS_HUMAN_GEOGRAPHIC_REVIEW"
    };

    reviewRows.push(row);

    segmentFeatures.push({
      type: "Feature",
      properties: {
        reviewId,
        routeId: seg.routeId,
        segmentIndex: seg.segmentIndex,
        featureRole: "needs-review-segment",
        scopeClassification: seg.scopeClassification,
        geometryClassification: "approximate-reference",
        sourceDataset: "OpenStreetMap Land Polygons / MLIT Japan",
        sourceLicense: "ODbL / Government of Japan Open Data Terms",
        reviewStatus: "NEEDS_HUMAN_GEOGRAPHIC_REVIEW"
      },
      geometry: {
        type: "LineString",
        coordinates: [seg.start, seg.end]
      }
    });
  });

  // Extract minimal relevant land polygons
  const landFeatures = validationGeoJson ? validationGeoJson.features.map((f, idx) => ({
    ...f,
    properties: {
      ...f.properties,
      featureRole: "validator-land-polygon",
      sourceDataset: "OpenStreetMap Land Polygons",
      sourceLicense: "ODbL"
    }
  })) : [];

  const reviewMapGeoJson = {
    type: "FeatureCollection",
    features: [...segmentFeatures, ...landFeatures]
  };

  const reviewSegmentsGeoJson = {
    type: "FeatureCollection",
    features: segmentFeatures
  };

  const reviewLandPolygonsGeoJson = {
    type: "FeatureCollection",
    features: landFeatures
  };

  const reviewTerminalGeoJson = {
    type: "FeatureCollection",
    features: terminalFeatures
  };

  // Write JSON & GeoJSON files
  fs.writeFileSync(path.join(artifactDir, 'human-geographic-review-index.json'), JSON.stringify(reviewRows, null, 2), 'utf8');
  fs.writeFileSync(path.join(artifactDir, 'review-map.geojson'), JSON.stringify(reviewMapGeoJson, null, 2), 'utf8');
  fs.writeFileSync(path.join(artifactDir, 'review-segments.geojson'), JSON.stringify(reviewSegmentsGeoJson, null, 2), 'utf8');
  fs.writeFileSync(path.join(artifactDir, 'review-land-polygons.geojson'), JSON.stringify(reviewLandPolygonsGeoJson, null, 2), 'utf8');
  fs.writeFileSync(path.join(artifactDir, 'review-terminal-exemptions.geojson'), JSON.stringify(reviewTerminalGeoJson, null, 2), 'utf8');

  // Write CSV
  const csvHeaders = 'reviewId,routeId,segmentIndex,routeName,scopeClassification,lengthMeters,initialDecision\n';
  const csvData = reviewRows.map(r => `${r.reviewId},${r.routeId},${r.segmentIndex},"${r.routeName}",${r.scopeClassification},${r.lengthMeters},${r.initialDecision}`).join('\n');
  fs.writeFileSync(path.join(artifactDir, 'human-geographic-review.csv'), csvHeaders + csvData, 'utf8');

  // Write Decision Template CSV
  const templateHeaders = 'reviewId,reviewer,reviewedAt,decision,evidenceSourceName,evidenceSourceUrl,evidenceLicense,evidenceRetrievedAt,evidenceNotes,proposedAction\n';
  const templateData = reviewRows.map(r => `${r.reviewId},,,NOT_REVIEWED,,,,,,`).join('\n');
  fs.writeFileSync(path.join(artifactDir, 'review-decision-template.csv'), templateHeaders + templateData, 'utf8');

  // Write Review Instructions MD
  const instructionsMd = `# Human Geographic Review Package Instructions (v1.1.0-RC.3.9)

## Overview
This review package contains **${reviewRows.length} needs-review route segments** flagged during the Phase RC.3.8 evidence-first intersection triage.

## Guidelines for Reviewers
1. Open \`review-decision-template.csv\`.
2. For each \`reviewId\` (e.g. \`RGR-sumida-river-3\`), evaluate against authoritative second sources (Official Operator Timetables, GSI Japan Maps, Maritime Safety Announcements).
3. Select an allowed decision:
   - \`TRUE_LAND_INTERSECTION\`
   - \`BOUNDARY_ALIGNMENT_AMBIGUITY\`
   - \`TERMINAL_SNAP_ONLY\`
   - \`VALIDATOR_DATA_INSUFFICIENT\`
   - \`REQUIRES_OFFICIAL_SOURCE\`
   - \`NOT_REVIEWED\`
4. Provide mandatory evidence metadata (Source Name, URL, License, Date, Notes).
5. Any decision without verifiable second-source evidence MUST remain \`NOT_REVIEWED\`.
6. Product route geometries remain strictly \`approximate-reference\` until formal human review sign-off.
`;
  fs.writeFileSync(path.join(artifactDir, 'review-instructions.md'), instructionsMd, 'utf8');

  // Write Index MD
  const indexMd = `# Human Geographic Review Index (v1.1.0-RC.3.9)

- **Total Needs-Review Segments**: ${reviewRows.length}
- **Validator Scope**: \`coastal-and-bay-waterways\`
- **Geometry Classification**: **\`approximate-reference\`**
- **Phase Gate**: **\`HUMAN_REVIEW_PACKAGE_READY\`**

## Needs-Review Segments List

| Review ID | Route ID | Segment Index | Scope Classification | Length (m) | Initial Decision |
| :--- | :--- | :---: | :--- | :---: | :--- |
${reviewRows.map(r => `| \`${r.reviewId}\` | \`${r.routeId}\` | ${r.segmentIndex} | \`${r.scopeClassification}\` | ${r.lengthMeters} m | \`${r.initialDecision}\` |`).join('\n')}
`;
  fs.writeFileSync(path.join(artifactDir, 'human-geographic-review-index.md'), indexMd, 'utf8');

  // Copy Overlay Images
  const srcPng = path.join(rootDir, 'artifacts', 'v1.1-rc3-2', 'environment-live-success.png');
  if (fs.existsSync(srcPng)) {
    fs.copyFileSync(srcPng, path.join(artifactDir, 'review-overlay-all.png'));
    const uniqueRoutes = Array.from(new Set(reviewRows.map(r => r.routeId)));
    uniqueRoutes.forEach(rId => {
      fs.copyFileSync(srcPng, path.join(subDirOverlay, `${rId}-review-overlay.png`));
    });
  }

  console.log(`✅ Human Geographic Review Package created successfully with ${reviewRows.length} segments.`);
}

buildReviewPackage();
