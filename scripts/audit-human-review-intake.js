/**
 * Human Review Intake Audit Script for Tokyo Waterbus Atlas (Phase v1.1.0-RC.3.11)
 * Validates external user-provided human sign-off intake CSV against strict 13 canonical IDs and metadata schema.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const artifactDir = path.join(rootDir, 'artifacts', 'v1.1-rc3-11');

if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

const canonicalRegisterPath = path.join(artifactDir, 'canonical-review-id-register.json');
const canonicalRegister = fs.existsSync(canonicalRegisterPath) ? JSON.parse(fs.readFileSync(canonicalRegisterPath, 'utf8')) : null;
const canonicalIds = canonicalRegister ? canonicalRegister.canonicalReviewIds : [];

function runIntakeAudit() {
  console.log('🚀 Running Human Review Intake Audit (v1.1.0-RC.3.11)...');

  const inputPath = process.argv[2] ? path.resolve(process.argv[2]) : null;

  if (!inputPath || !fs.existsSync(inputPath)) {
    console.log('ℹ️ No external user-provided intake CSV specified. Defaulting to AWAITING_HUMAN_INPUT.');

    const summary = {
      timestamp: new Date().toISOString(),
      productVersion: 'v1.1.0-RC.3.11',
      result: 'AWAITING_HUMAN_INPUT',
      inputPath: null,
      canonicalIdCount: canonicalIds.length,
      userProvidedRowsCount: 0,
      eligibleForGeometryChangeCount: 0,
      humanDecisionIngestionEnabled: false,
      twoPersonApprovalsCount: 0,
      phaseGate: 'CANONICAL_REVIEW_INTAKE_READY_AWAITING_HUMAN_INPUT',
      requiredWording: 'geometryClassification = approximate-reference'
    };

    fs.writeFileSync(path.join(artifactDir, 'human-review-intake-audit.json'), JSON.stringify(summary, null, 2), 'utf8');

    const mdReport = `# Human Review Intake Audit Report (v1.1.0-RC.3.11)

- **Audit Timestamp**: ${summary.timestamp}
- **Intake Result**: **\`${summary.result}\`**
- **Canonical Review ID Count**: ${summary.canonicalIdCount}
- **User-Provided Intake Rows**: 0
- **Eligible for Geometry Change Count**: 0
- **Human Decision Ingestion Enabled**: \`false\`
- **Two-Person Approvals Count**: 0
- **Phase Gate**: **\`${summary.phaseGate}\`**
- **Geometry Classification**: **\`approximate-reference\`**
`;

    fs.writeFileSync(path.join(artifactDir, 'human-review-intake-audit.md'), mdReport, 'utf8');

    console.log(`📊 Intake Audit Summary:`);
    console.log(`   - Result: ${summary.result}`);
    console.log(`   - Ingestion Enabled: false`);
    console.log(`   - Phase Gate: ${summary.phaseGate}\n`);

    process.exit(0);
    return;
  }

  // Auditing user-provided intake CSV
  console.log(`📥 Auditing user-provided intake CSV at ${inputPath}...`);
  const content = fs.readFileSync(inputPath, 'utf8').trim();
  const lines = content.split('\n');
  const rows = lines.slice(1).filter(l => l.trim().length > 0);

  const allowedDecisions = [
    'TRUE_LAND_INTERSECTION',
    'BOUNDARY_ALIGNMENT_AMBIGUITY',
    'TERMINAL_SNAP_ONLY',
    'VALIDATOR_DATA_INSUFFICIENT',
    'REQUIRES_OFFICIAL_SOURCE',
    'NOT_REVIEWED'
  ];

  const allowedActions = [
    'NO_CHANGE_REQUIRED',
    'SEEK_OFFICIAL_SOURCE',
    'PROPOSE_MINIMAL_WAYPOINT_EDIT',
    'REQUEST_SECOND_REVIEW'
  ];

  let invalidRows = 0;
  const seenIds = new Set();
  const rowEvaluations = [];

  rows.forEach(line => {
    const parts = line.split(',');
    const reviewId = parts[0] ? parts[0].trim() : '';
    const reviewer = parts[1] ? parts[1].trim() : '';
    const reviewedAt = parts[2] ? parts[2].trim() : '';
    const decision = parts[3] ? parts[3].trim() : '';
    const evidenceSourceName = parts[4] ? parts[4].trim() : '';
    const evidenceSourceUrl = parts[5] ? parts[5].trim() : '';
    const evidenceLicense = parts[6] ? parts[6].trim() : '';
    const evidenceRetrievedAt = parts[7] ? parts[7].trim() : '';
    const evidenceNotes = parts[8] ? parts[8].trim() : '';
    const proposedAction = parts[9] ? parts[9].trim() : '';

    const isCanonical = canonicalIds.includes(reviewId);
    const isDuplicate = seenIds.has(reviewId);
    seenIds.add(reviewId);

    const reviewerValid = reviewer.length > 0;
    const reviewedAtValid = Boolean(reviewedAt && !isNaN(Date.parse(reviewedAt)));
    const decisionValid = allowedDecisions.includes(decision);
    const sourceNameValid = evidenceSourceName.length > 0;
    const sourceUrlValid = Boolean(evidenceSourceUrl && evidenceSourceUrl.startsWith('https://'));
    const licenseValid = evidenceLicense.length > 0;
    const retrievedAtValid = Boolean(evidenceRetrievedAt && !isNaN(Date.parse(evidenceRetrievedAt)));
    const notesValid = evidenceNotes.length >= 30;
    const actionValid = allowedActions.includes(proposedAction);

    const isValidRow = isCanonical && !isDuplicate && reviewerValid && reviewedAtValid &&
                       decisionValid && sourceNameValid && sourceUrlValid && licenseValid &&
                       retrievedAtValid && notesValid && actionValid;

    if (!isValidRow) invalidRows++;

    rowEvaluations.push({
      reviewId,
      isValidRow,
      isCanonical,
      reviewerValid,
      reviewedAtValid,
      decisionValid,
      sourceUrlValid,
      notesValid
    });
  });

  const auditPassed = invalidRows === 0 && seenIds.size === canonicalIds.length;
  const result = auditPassed ? 'INTAKE_VALIDATED' : 'INVALID_HUMAN_INPUT';

  const summary = {
    timestamp: new Date().toISOString(),
    productVersion: 'v1.1.0-RC.3.11',
    result,
    inputPath,
    canonicalIdCount: canonicalIds.length,
    userProvidedRowsCount: rows.length,
    invalidRows,
    eligibleForGeometryChangeCount: 0,
    humanDecisionIngestionEnabled: false,
    twoPersonApprovalsCount: 0,
    phaseGate: auditPassed ? 'CANONICAL_REVIEW_INTAKE_VALIDATED' : 'INVALID_HUMAN_INPUT'
  };

  fs.writeFileSync(path.join(artifactDir, 'human-review-intake-audit.json'), JSON.stringify(summary, null, 2), 'utf8');

  console.log(`📊 Intake Audit Results for ${inputPath}:`);
  console.log(`   - Result: ${result}`);
  console.log(`   - Validated Rows: ${rows.length - invalidRows} / ${canonicalIds.length}`);
  console.log(`   - Invalid Rows: ${invalidRows}`);
  console.log(`   - Ingestion Enabled: false (Product geometry locked)\n`);

  if (!auditPassed) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runIntakeAudit();
