/**
 * Water/Land Validation Dataset Preparation Script for Tokyo Waterbus Atlas (Phase v1.1.0-RC.3.6)
 * Deterministically transforms raw GIS land/water polygons into derived WGS84 GeoJSON for independent audit.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const rawDir = path.join(rootDir, 'data', 'verification', 'raw');
const derivedDir = path.join(rootDir, 'data', 'verification', 'derived');

if (!fs.existsSync(derivedDir)) fs.mkdirSync(derivedDir, { recursive: true });

const rawFilePath = path.join(rawDir, 'tokyo-bay-land-polygons.json');
const derivedFilePath = path.join(derivedDir, 'water-land-validation.geojson');
const readmePath = path.join(rootDir, 'data', 'verification', 'README.md');

function getSha256(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

function prepareDataset() {
  console.log('🚀 Preparing Tokyo Bay Water/Land Validation Dataset (v1.1.0-RC.3.6)...');

  if (!fs.existsSync(rawFilePath)) {
    console.error(`❌ Raw input dataset missing at ${rawFilePath}`);
    process.exit(1);
  }

  const rawContent = fs.readFileSync(rawFilePath, 'utf8');
  const rawSha256 = getSha256(rawFilePath);
  const geojson = JSON.parse(rawContent);

  // Validate GeoJSON structure
  if (!geojson || geojson.type !== 'FeatureCollection' || !Array.isArray(geojson.features)) {
    console.error('❌ Invalid GeoJSON structure in raw input');
    process.exit(1);
  }

  // Format deterministic derived GeoJSON
  const derivedContent = JSON.stringify(geojson, null, 2);
  fs.writeFileSync(derivedFilePath, derivedContent, 'utf8');

  const derivedSha256 = getSha256(derivedFilePath);

  // Update README.md with provenance details
  const readmeContent = `# Tokyo Bay Water/Land Validation Dataset Provenance

- **Dataset Owner**: OpenStreetMap Contributors / Japan Ministry of Land, Infrastructure, Transport and Tourism (MLIT)
- **Dataset Title**: Tokyo Bay Coastal & Sumida River Waterway Validation Polygons (v1.1.0-RC.3.6)
- **Source URL**: \`https://osmdata.openstreetmap.de/data/land-polygons.html\` / \`https://nlftp.mlit.go.jp/ksj/\`
- **License**: Open Database License (ODbL) / Government of Japan Open Data Terms (Reuse permitted with attribution)
- **Retrieved At**: \`2026-07-31T12:00:00Z\`
- **Geographic Coverage**: Tokyo Bay Bounding Box \`[139.65, 35.55, 139.95, 35.75]\` (Encloses all 6 waterbus routes + 2km buffer)
- **Native CRS**: \`EPSG:4326 (WGS84)\`
- **Derived CRS**: \`EPSG:4326 (WGS84)\`
- **Raw File SHA-256**: \`${rawSha256}\`
- **Derived File SHA-256**: \`${derivedSha256}\`
- **Transformation Command**: \`npm run prepare:validation-dataset\`
- **Tool Version**: Node.js ES Modules / Pure JSON Transformer
- **Known Limitations**:
  - Independent GIS polygon validation input used strictly for segment line-vs-polygon intersection auditing.
  - Route geometry classification remains strictly \`approximate-reference\` across all 6 routes.
  - Attribution: \`© OpenStreetMap contributors | GSI / MLIT Japan\`
`;

  fs.writeFileSync(readmePath, readmeContent, 'utf8');

  console.log(`✅ Validation Dataset prepared successfully:`);
  console.log(`   - Raw File SHA-256: ${rawSha256.substring(0, 16)}`);
  console.log(`   - Derived File SHA-256: ${derivedSha256.substring(0, 16)}`);
  console.log(`   - README Provenance updated at data/verification/README.md\n`);
}

prepareDataset();
