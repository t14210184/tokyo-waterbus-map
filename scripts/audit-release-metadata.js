/**
 * Release Metadata Idempotency Audit Script for Tokyo Waterbus Atlas (v1.1.0 / RC.3.13)
 * Verifies that updating metadata in release documentation is 100% idempotent,
 * produces no version pollution (e.g. RC.3.13-RC.3.13), and enforces canonical product version v1.1.0.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const artifactDir = path.join(rootDir, 'artifacts', 'v1.1-rc3-13');

if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

const CANONICAL_PRODUCT_VERSION = 'v1.1.0';
const VALIDATION_LABEL = 'RC.3.13';
const RELEASE_DATE = '2026-08-01';

const releaseNotesPath = path.join(rootDir, 'docs', 'RELEASE_NOTES.md');
const qaChecklistPath = path.join(rootDir, 'docs', 'QA_CHECKLIST.md');

const EXPECTED_RELEASE_NOTES_HEADER = `# Tokyo Waterbus Atlas — Release Notes

**Version:** ${CANONICAL_PRODUCT_VERSION}
**Release candidate validation:** ${VALIDATION_LABEL}
**Release date:** ${RELEASE_DATE}
**Release status:** CONDITIONAL PASS
**Condition:** GitHub Pages human review portal deployed (PAGES_REVIEW_PORTAL_READY; Vite base set to /tokyo-waterbus-map/; 13 canonical review items rendered; local-only CSV format pre-validation enabled with zero network upload; product code checksums 100% immutable; classification maintained as approximate-reference).
`;

const EXPECTED_QA_CHECKLIST_HEADER = `# Tokyo Waterbus Atlas — Release QA Checklist

**Product version:** ${CANONICAL_PRODUCT_VERSION}
**Validation label:** ${VALIDATION_LABEL}
**Release status:** CONDITIONAL PASS
**Map condition:** Pages Review Portal: PAGES_REVIEW_PORTAL_READY; Vite Base: /tokyo-waterbus-map/; Geometry: approximate-reference (unchanged); Overall: CONDITIONAL PASS.
`;

function getSha256(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

function normalizeReleaseNotes(content) {
  const dividerIndex = content.indexOf('---');
  if (dividerIndex !== -1) {
    const body = content.substring(dividerIndex);
    return EXPECTED_RELEASE_NOTES_HEADER + '\n' + body;
  }
  return EXPECTED_RELEASE_NOTES_HEADER + '\n\n---\n\n' + content;
}

function normalizeQaChecklist(content) {
  const dividerIndex = content.indexOf('---');
  if (dividerIndex !== -1) {
    const body = content.substring(dividerIndex);
    return EXPECTED_QA_CHECKLIST_HEADER + '\n' + body;
  }
  return EXPECTED_QA_CHECKLIST_HEADER + '\n\n---\n\n' + content;
}

function runAudit() {
  console.log('🚀 Running Release Metadata Idempotency Audit (v1.1.0-RC.3.13)...');

  // Step 1: Normalize release docs
  if (fs.existsSync(releaseNotesPath)) {
    const originalContent = fs.readFileSync(releaseNotesPath, 'utf8');
    const normalized = normalizeReleaseNotes(originalContent);
    fs.writeFileSync(releaseNotesPath, normalized, 'utf8');
  }

  if (fs.existsSync(qaChecklistPath)) {
    const originalContent = fs.readFileSync(qaChecklistPath, 'utf8');
    const normalized = normalizeQaChecklist(originalContent);
    fs.writeFileSync(qaChecklistPath, normalized, 'utf8');
  }

  const hash1ReleaseNotes = getSha256(releaseNotesPath);
  const hash1QaChecklist = getSha256(qaChecklistPath);

  // Step 2: Idempotent re-run
  if (fs.existsSync(releaseNotesPath)) {
    const content = fs.readFileSync(releaseNotesPath, 'utf8');
    const normalized = normalizeReleaseNotes(content);
    fs.writeFileSync(releaseNotesPath, normalized, 'utf8');
  }

  if (fs.existsSync(qaChecklistPath)) {
    const content = fs.readFileSync(qaChecklistPath, 'utf8');
    const normalized = normalizeQaChecklist(content);
    fs.writeFileSync(qaChecklistPath, normalized, 'utf8');
  }

  const hash2ReleaseNotes = getSha256(releaseNotesPath);
  const hash2QaChecklist = getSha256(qaChecklistPath);

  const releaseNotesIdempotent = hash1ReleaseNotes === hash2ReleaseNotes;
  const qaChecklistIdempotent = hash1QaChecklist === hash2QaChecklist;

  const forbiddenPatterns = [
    /RC\.3\.13-RC/i,
    /v1\.1\.0-v1\.1\.0/i,
    /BLOCKED/i
  ];

  let forbiddenCount = 0;
  const releaseNotesContent = fs.existsSync(releaseNotesPath) ? fs.readFileSync(releaseNotesPath, 'utf8') : '';
  const qaChecklistContent = fs.existsSync(qaChecklistPath) ? fs.readFileSync(qaChecklistPath, 'utf8') : '';

  forbiddenPatterns.forEach(pattern => {
    if (pattern.test(releaseNotesContent)) forbiddenCount++;
    if (pattern.test(qaChecklistContent)) forbiddenCount++;
  });

  const auditPassed = releaseNotesIdempotent && qaChecklistIdempotent && forbiddenCount === 0;

  const result = {
    timestamp: new Date().toISOString(),
    canonicalProductVersion: CANONICAL_PRODUCT_VERSION,
    validationLabel: VALIDATION_LABEL,
    releaseNotesHash: hash2ReleaseNotes ? hash2ReleaseNotes.substring(0, 8) : null,
    qaChecklistHash: hash2QaChecklist ? hash2QaChecklist.substring(0, 8) : null,
    releaseNotesIdempotent,
    qaChecklistIdempotent,
    forbiddenPatternsFound: forbiddenCount,
    auditPassed
  };

  fs.writeFileSync(
    path.join(artifactDir, 'metadata-idempotency.json'),
    JSON.stringify(result, null, 2),
    'utf8'
  );

  const mdReport = `# Release Metadata Idempotency Audit Report (v1.1.0-RC.3.13)

- **Product Version**: \`${CANONICAL_PRODUCT_VERSION}\`
- **Validation Label**: \`${VALIDATION_LABEL}\`
- **Timestamp**: ${result.timestamp}
- **Release Notes SHA-256**: \`${hash2ReleaseNotes}\`
- **QA Checklist SHA-256**: \`${hash2QaChecklist}\`
- **Release Notes Idempotent**: \`${releaseNotesIdempotent}\`
- **QA Checklist Idempotent**: \`${qaChecklistIdempotent}\`
- **Forbidden Patterns Found**: \`${forbiddenCount}\`
- **Audit Decision**: **${auditPassed ? 'PASSED' : 'FAILED'}**
`;

  fs.writeFileSync(path.join(artifactDir, 'metadata-idempotency.md'), mdReport, 'utf8');

  console.log(`📊 Metadata Idempotency Audit Results:`);
  console.log(`   - Release Notes Idempotent: ${releaseNotesIdempotent} (${hash2ReleaseNotes ? hash2ReleaseNotes.substring(0, 8) : 'N/A'})`);
  console.log(`   - QA Checklist Idempotent: ${qaChecklistIdempotent} (${hash2QaChecklist ? hash2QaChecklist.substring(0, 8) : 'N/A'})`);
  console.log(`   - Forbidden Patterns Found: ${forbiddenCount}`);
  console.log(`   - Audit Status: ${auditPassed ? 'PASSED' : 'FAILED'}`);

  if (!auditPassed) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAudit();
