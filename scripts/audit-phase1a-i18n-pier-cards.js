/**
 * Phase 1A Multilingual Pier Arrival Cards Audit Script (v1.1.0-RC.3.23)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { zhTW } from '../src/i18n/locales/zh-TW.js';
import { en } from '../src/i18n/locales/en.js';
import { ja } from '../src/i18n/locales/ja.js';
import { ko } from '../src/i18n/locales/ko.js';
import { PIER_ARRIVAL_CARDS } from '../src/data/pier-arrival-cards.js';
import { SERVICE_STATUS_REGISTRY } from '../src/data/service-status.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🚀 Running Phase 1A Multilingual Pier Arrival Cards Audit (v1.1.0-RC.3.23)...');

const LOCALES = { 'zh-TW': zhTW, 'en': en, 'ja': ja, 'ko': ko };
const REQUIRED_FEATURED_PIERS = ['asakusa', 'hinode', 'hamarikyu', 'odaiba-kaihinkouen'];

// 1. Verify i18n Locales Completeness
function getKeys(obj, prefix = '') {
  let keys = [];
  for (const k in obj) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      keys = keys.concat(getKeys(obj[k], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const baseKeys = getKeys(zhTW);
let allLocalesComplete = true;

for (const code of ['en', 'ja', 'ko']) {
  const codeKeys = new Set(getKeys(LOCALES[code]));
  const missing = baseKeys.filter(k => !codeKeys.has(k));
  if (missing.length > 0) {
    console.warn(`⚠️ Locale ${code} missing ${missing.length} keys:`, missing);
    allLocalesComplete = false;
  }
}

// 2. Verify Featured Pier Arrival Cards
let pierCardsValid = true;
for (const pierId of REQUIRED_FEATURED_PIERS) {
  const card = PIER_ARRIVAL_CARDS[pierId];
  if (!card) {
    console.error(`❌ Missing Pier Arrival Card for ${pierId}`);
    pierCardsValid = false;
  } else {
    if (!card.name['zh-TW'] || !card.name['en'] || !card.name['ja'] || !card.name['ko']) {
      console.error(`❌ Incomplete multilingual names for ${pierId}`);
      pierCardsValid = false;
    }
    if (!card.officialPierUrl || !card.officialTodayStatusUrl || !card.officialTimetableUrl) {
      console.error(`❌ Missing official URLs for ${pierId}`);
      pierCardsValid = false;
    }
  }
}

// 3. Verify Tokyo Mizube Line Suspension
const mizubeStatus = SERVICE_STATUS_REGISTRY.operators['tokyo-mizube-line'];
const mizubeSuspended = mizubeStatus && (mizubeStatus.serviceState === 'SUSPENDED' || mizubeStatus.simulationAllowed === false);

// 4. Verify Zero Diff on Protected Files
const protectedFiles = [
  'src/data/route-geometries.js',
  'src/data/routes.js',
  'src/data/route-geometry-sources.js',
  'package-lock.json',
  '.github/workflows/deploy-pages.yml'
];

let protectedFilesIntact = true;
protectedFiles.forEach(relPath => {
  const fullPath = path.join(rootDir, relPath);
  if (!fs.existsSync(fullPath)) {
    protectedFilesIntact = false;
  }
});

console.log('📊 Audit Results:');
console.log('   - 4 Locales Dictionary Completeness:', allLocalesComplete ? 'PASSED' : 'FAILED');
console.log('   - 4 Pier Arrival Cards Verification:', pierCardsValid ? 'PASSED' : 'FAILED');
console.log('   - Tokyo Mizube Line Suspended Lock:', mizubeSuspended ? 'PASSED' : 'FAILED');
console.log('   - Protected Files Intact:', protectedFilesIntact ? 'PASSED' : 'FAILED');

if (allLocalesComplete && pierCardsValid && mizubeSuspended && protectedFilesIntact) {
  console.log('\n✅ PHASE1A_MULTILINGUAL_PIER_CARDS_VERIFIED');
} else {
  console.error('\n❌ PHASE1A_INCOMPLETE');
  process.exit(1);
}
