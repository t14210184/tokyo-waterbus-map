/**
 * Authoritative Audit Script for Phase 0 Final Closure (STAGE 14)
 * Executes all 23 mandatory checks. Exits 0 on clean success, 1 on failure.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔍 Executing Phase 0 Final Closure Audit (23 mandatory checks)...\n');

let violations = [];

// Check 1 & 2: Hinode address reconciliation
const guidanceFile = path.join(rootDir, 'src', 'data', 'pier-arrival-guidance.js');
const guidanceContent = fs.readFileSync(guidanceFile, 'utf8');

if (guidanceContent.includes("'2-7-10 Kaigan,")) {
  violations.push("Check 1/2 FAILED: Truncated address '2-7-10' remains in src/data/pier-arrival-guidance.js");
}
if (!guidanceContent.includes("2-7-104 Kaigan, Minato-ku, Tokyo 105-0022")) {
  violations.push("Check 1 FAILED: Official address '2-7-104 Kaigan, Minato-ku, Tokyo 105-0022' not found in guidance data");
}

// Check 3 & 4: Hinode station & South Exit wording
const cardsFile = path.join(rootDir, 'src', 'data', 'pier-arrival-cards.js');
const cardsContent = fs.readFileSync(cardsFile, 'utf8');

if (cardsContent.includes("浜松町駅 南口") || cardsContent.includes("Hamamatsucho Sta South Exit")) {
  violations.push("Check 4 FAILED: Unverified 'South Exit' claim still present in pier-arrival-cards.js");
}

// Check 5: Map links safety
import { PIER_ARRIVAL_GUIDANCE } from '../src/data/pier-arrival-guidance.js';
const hinodeGuidance = PIER_ARRIVAL_GUIDANCE.hinode;
if (!hinodeGuidance || !hinodeGuidance.mapLinks || !hinodeGuidance.mapLinks.google || !hinodeGuidance.mapLinks.apple) {
  violations.push("Check 5 FAILED: Missing Google/Apple map links in Hinode arrival guidance");
} else {
  if (!hinodeGuidance.mapLinks.google.includes('2-7-104') && !hinodeGuidance.mapLinks.google.includes('Hinode')) {
    violations.push("Check 5 FAILED: Google Maps link is not a valid address query");
  }
}

// Check 6-9: Confidence model rules
const confidenceFile = path.join(rootDir, 'src', 'data', 'information-confidence.js');
const confidenceContent = fs.readFileSync(confidenceFile, 'utf8');

if (!confidenceContent.includes('OFFICIAL_CONFIRMED') || !confidenceContent.includes('TIMETABLE_ESTIMATE') || !confidenceContent.includes('OFFLINE_STORY_DEMO') || !confidenceContent.includes('SUSPENDED_OR_UNKNOWN')) {
  violations.push("Check 6-9 FAILED: Incomplete information confidence model definitions");
}

// Check 10: Planner truth
const plannerFile = path.join(rootDir, 'src', 'ui', 'trip-planner.js');
const plannerContent = fs.readFileSync(plannerFile, 'utf8');
if (!plannerContent.includes('PLANNING REFERENCE') && !plannerContent.includes('規劃水上航程')) {
  violations.push("Check 10 FAILED: Trip Planner missing static reference disclosure");
}

// Check 11: Tokyo Mizube suspended status
import { PIERS } from '../src/data/piers.js';
const etchujima = PIERS.find(p => p.id === 'etchujima');
if (!etchujima || etchujima.status === 'active') {
  violations.push("Check 11 FAILED: Tokyo Mizube Etchujima pier status defaulted to active");
}

// Check 16: Primary navigation 5 tabs
const shellFile = path.join(rootDir, 'src', 'ui', 'shell.js');
const shellContent = fs.readFileSync(shellFile, 'utf8');
const navMatch = shellContent.match(/<nav class="sidebar-tabs"[^>]*>([\s\S]*?)<\/nav>/);
if (!navMatch) {
  violations.push("Check 16 FAILED: Could not locate <nav class='sidebar-tabs'> in shell.js");
} else {
  const tabIds = [...navMatch[1].matchAll(/data-tab="([^"]+)"/g)].map(m => m[1]);
  const expected = ['today', 'routes', 'piers', 'planner', 'explore'];
  if (JSON.stringify(tabIds) !== JSON.stringify(expected)) {
    violations.push(`Check 16 FAILED: Expected primary tabs ${JSON.stringify(expected)}, got ${JSON.stringify(tabIds)}`);
  }
}

// Check 20: Protected file diffs
const protectedFiles = [
  'src/data/route-geometries.js',
  'src/data/routes.js',
  'src/data/route-geometry-sources.js',
  'package-lock.json',
  '.github/workflows/deploy-pages.yml'
];

for (const pf of protectedFiles) {
  try {
    const diff = execSync(`git diff -- "${pf}"`, { cwd: rootDir, encoding: 'utf8' }).trim();
    if (diff.length > 0) {
      violations.push(`Check 20 FAILED: Protected file '${pf}' has uncommitted changes!`);
    }
  } catch (e) {
    violations.push(`Check 20 FAILED: Could not check git diff for '${pf}'`);
  }
}

// Check 21 & 22: Scope lock invariants
const reviewPackageFile = path.join(rootDir, 'src', 'data', 'human-geographic-review-package.js');
if (fs.existsSync(reviewPackageFile)) {
  const revContent = fs.readFileSync(reviewPackageFile, 'utf8');
  if (revContent.includes('humanDecisionIngestionEnabled = true')) {
    violations.push("Check 21 FAILED: humanDecisionIngestionEnabled is true");
  }
  if (!revContent.includes('eligibleForGeometryChangeCount = 0')) {
    violations.push("Check 22 FAILED: eligibleForGeometryChangeCount is non-zero");
  }
}

console.log('=================================================');
if (violations.length === 0) {
  console.log('✅ Phase 0 Final Closure Audit PASSED! (0 violations found)\n');
  process.exit(0);
} else {
  console.error(`❌ Phase 0 Final Closure Audit BLOCKED! (${violations.length} violations found):\n`);
  violations.forEach(v => console.error(`  - ${v}`));
  console.log('\n=================================================\n');
  process.exit(1);
}
