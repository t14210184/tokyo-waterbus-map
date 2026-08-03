import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { SERVICE_STATUS_REGISTRY, getPierDerivedStatus } from '../src/data/service-status.js';
import { PIERS } from '../src/data/piers.js';
import { displayPierStatus } from '../src/core/itinerary-formatters.js';
import { zhTW } from '../src/i18n/locales/zh-TW.js';
import { en } from '../src/i18n/locales/en.js';
import { ja } from '../src/i18n/locales/ja.js';
import { ko } from '../src/i18n/locales/ko.js';

console.log('🔍 Executing Audit: Mizube Pier Status Operational Truth...');

const failures = [];

// Check 1: Tokyo Mizube Line is recorded as SUSPENDED with effective date 2026-01-19
const mizubeOp = SERVICE_STATUS_REGISTRY.operators['tokyo-mizube-line'];
if (!mizubeOp) {
  failures.push('Tokyo Mizube Line operator record missing in SERVICE_STATUS_REGISTRY');
} else {
  if (mizubeOp.serviceState !== 'SUSPENDED') {
    failures.push(`Tokyo Mizube Line serviceState is ${mizubeOp.serviceState}, expected SUSPENDED`);
  }
  if (mizubeOp.effectiveFrom !== '2026-01-19') {
    failures.push(`Tokyo Mizube Line effectiveFrom is ${mizubeOp.effectiveFrom}, expected 2026-01-19`);
  }
  if (!mizubeOp.sourceUrl || !mizubeOp.sourceUrl.startsWith('https://')) {
    failures.push(`Tokyo Mizube Line sourceUrl is non-HTTPS or missing: ${mizubeOp.sourceUrl}`);
  }
}

// Check 2: All Mizube-only piers must resolve to SUSPENDED status
const mizubeOnlyPierIds = [
  'etchujima',
  'ryogoku',
  'sumida-office',
  'asakusa-nitenmon',
  'seiruka-garden',
  'waters-takeshiba',
  'kasai-rinkai'
];

for (const pierId of mizubeOnlyPierIds) {
  const pier = PIERS.find(p => p.id === pierId);
  if (!pier) {
    failures.push(`Pier [${pierId}] not found in PIERS database`);
    continue;
  }

  const derived = getPierDerivedStatus(pier);
  if (derived.statusState !== 'SUSPENDED') {
    failures.push(`Pier [${pierId}] derived status is ${derived.statusState}, expected SUSPENDED`);
  }

  if (pier.status !== 'suspended') {
    failures.push(`Pier [${pierId}] database status is ${pier.status}, expected suspended`);
  }

  const statusBadge = displayPierStatus(pier);
  if (statusBadge.class === 'status-active') {
    failures.push(`Pier [${pierId}] badge class is status-active, green normal-operation badge rendered`);
  }

  const forbiddenStrings = ['常態營運', 'Operating normally', '通常運航', '정상 운항'];
  if (forbiddenStrings.includes(statusBadge.text)) {
    failures.push(`Pier [${pierId}] badge text is "${statusBadge.text}", false normal-operation label rendered`);
  }

  if (!pier.officialUrl || !pier.officialUrl.startsWith('https://')) {
    failures.push(`Pier [${pierId}] officialUrl is missing or non-HTTPS: ${pier.officialUrl}`);
  }
}

// Check 3: Check locale dictionary coverage
const locales = { zhTW, en, ja, ko };
const requiredKeys = ['mizubeSuspensionTitle', 'mizubeSuspensionBody', 'mizubeSuspensionLink', 'statusSuspended'];

for (const [locName, dict] of Object.entries(locales)) {
  const pc = dict.pierCard || {};
  for (const k of requiredKeys) {
    if (!pc[k] || typeof pc[k] !== 'string' || pc[k].trim().length === 0) {
      failures.push(`Locale [${locName}] missing required pierCard key: ${k}`);
    }
  }
}

// Check 4: Check humanDecisionIngestionEnabled === false in main.js
const mainJsPath = path.resolve(process.cwd(), 'src', 'main.js');
const mainJsCode = fs.readFileSync(mainJsPath, 'utf8');
if (mainJsCode.includes('humanDecisionIngestionEnabled: true')) {
  failures.push('humanDecisionIngestionEnabled is set to true in src/main.js');
}

// Check 5: Check protected file diffs
const protectedFiles = [
  'src/data/route-geometries.js',
  'src/data/routes.js',
  'src/data/route-geometry-sources.js',
  'package-lock.json',
  '.github/workflows/deploy-pages.yml'
];

for (const pf of protectedFiles) {
  try {
    const diff = execSync(`git diff -- "${pf}"`, { encoding: 'utf8' }).trim();
    if (diff.length > 0) {
      failures.push(`Protected file modified: ${pf}`);
    }
  } catch (e) {
    failures.push(`Failed to check git diff for protected file: ${pf}`);
  }
}

// Result Reporting
if (failures.length > 0) {
  console.error('\n❌ Audit Mizube Pier Status Truth FAILED with errors:');
  failures.forEach(f => console.error(`  - ${f}`));
  process.exit(1);
} else {
  console.log('\n✅ Audit Mizube Pier Status Truth PASSED! (0 violations found)');
  process.exit(0);
}
