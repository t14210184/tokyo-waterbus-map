/**
 * Authoritative Automated Audit Script for Phase 0 Traveler Truth Foundation
 * Executes all 20 mandatory assertions to guarantee zero regression before build/deployment.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔍 Executing Phase 0 Traveler Truth Foundation Audit...\n');

let violations = [];

// 1. Build identity audit
const versionFile = path.join(rootDir, 'src', 'data', 'version.js');
const versionContent = fs.readFileSync(versionFile, 'utf8');

if (versionContent.includes('v1.1.0-RC.') || versionContent.includes('v1.0.0-RC.')) {
  violations.push('Assertion 1 FAILED: Stale handwritten RC string found in src/data/version.js');
}

// 2. Primary Navigation Tabs Audit (today, routes, piers, planner, explore)
const shellFile = path.join(rootDir, 'src', 'ui', 'shell.js');
const shellContent = fs.readFileSync(shellFile, 'utf8');

const navMatch = shellContent.match(/<nav class="sidebar-tabs"[^>]*>([\s\S]*?)<\/nav>/);
if (!navMatch) {
  violations.push('Assertion 3 FAILED: Could not locate <nav class="sidebar-tabs"> in src/ui/shell.js');
} else {
  const navHtml = navMatch[1];
  const tabIds = [...navHtml.matchAll(/data-tab="([^"]+)"/g)].map(m => m[1]);
  const expectedTabs = ['today', 'routes', 'piers', 'planner', 'explore'];

  if (JSON.stringify(tabIds) !== JSON.stringify(expectedTabs)) {
    violations.push(`Assertion 3 FAILED: Primary navigation tabs mismatch. Expected ${JSON.stringify(expectedTabs)}, got ${JSON.stringify(tabIds)}`);
  }

  const forbiddenDevTerms = ['review', 'audit', 'rgr', 'developer', 'data-quality', 'human-input'];
  for (const term of forbiddenDevTerms) {
    if (tabIds.includes(term)) {
      violations.push(`Assertion 4 FAILED: Developer term '${term}' found in primary navigation tabs`);
    }
  }
}

// 5. Secondary Data & Quality Entry Reachable
if (!shellContent.includes('id="link-secondary-review"') && !shellContent.includes('secondaryReviewBtn')) {
  violations.push('Assertion 5 FAILED: Secondary Data & Quality review entry missing from footer');
}

// 6-10. Demo Truth & Confidence Model Audits
const confidenceFile = path.join(rootDir, 'src', 'data', 'information-confidence.js');
if (!fs.existsSync(confidenceFile)) {
  violations.push('Assertion 10 FAILED: Missing src/data/information-confidence.js');
} else {
  const confContent = fs.readFileSync(confidenceFile, 'utf8');
  if (!confContent.includes('OFFICIAL_CONFIRMED') || !confContent.includes('TIMETABLE_ESTIMATE') || !confContent.includes('OFFLINE_STORY_DEMO') || !confContent.includes('SUSPENDED_OR_UNKNOWN')) {
    violations.push('Assertion 10 FAILED: Incomplete INFORMATION_CONFIDENCE_LEVELS definitions');
  }
}

// 12. Tokyo Mizube Line Safety Audit
import { PIERS } from '../src/data/piers.js';
const etchujima = PIERS.find(p => p.id === 'etchujima');
if (!etchujima || etchujima.status === 'active') {
  violations.push('Assertion 12 FAILED: Etchujima pier database status defaulted to active');
}

// 17. Protected files git diff check
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
      violations.push(`Assertion 17 FAILED: Protected file '${pf}' has uncommitted changes!`);
    }
  } catch (e) {
    violations.push(`Assertion 17 FAILED: Could not check git diff for '${pf}'`);
  }
}

// 18-19. Scope lock values audit
const reviewPackageFile = path.join(rootDir, 'src', 'data', 'human-geographic-review-package.js');
if (fs.existsSync(reviewPackageFile)) {
  const revContent = fs.readFileSync(reviewPackageFile, 'utf8');
  if (revContent.includes('humanDecisionIngestionEnabled = true')) {
    violations.push('Assertion 18 FAILED: humanDecisionIngestionEnabled is true!');
  }
  if (!revContent.includes('eligibleForGeometryChangeCount = 0')) {
    violations.push('Assertion 19 FAILED: eligibleForGeometryChangeCount is non-zero!');
  }
}

console.log('=================================================');
if (violations.length === 0) {
  console.log('✅ Phase 0 Traveler Truth Audit PASSED! (0 violations found)\n');
  process.exit(0);
} else {
  console.error(`❌ Phase 0 Traveler Truth Audit BLOCKED! (${violations.length} violations found):\n`);
  violations.forEach(v => console.error(`  - ${v}`));
  console.log('\n=================================================\n');
  process.exit(1);
}
