/**
 * Human Decision Ingestion Eligibility Audit Script for Tokyo Waterbus Atlas (Phase v1.1.0-RC.3.10)
 * Evaluates review-decision-template.csv rows for reviewer sign-off metadata and locks geometry ingestion.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const artifactDir = path.join(rootDir, 'artifacts', 'v1.1-rc3-10');

if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

const templateCsvPath = path.join(rootDir, 'artifacts', 'v1.1-rc3-9', 'review-decision-template.csv');

function runEligibilityAudit() {
  console.log('🚀 Running Human Decision Eligibility Audit (v1.1.0-RC.3.10)...');

  if (!fs.existsSync(templateCsvPath)) {
    console.error('❌ Decision template CSV missing at RC.3.9.');
    process.exit(1);
  }

  const csvContent = fs.readFileSync(templateCsvPath, 'utf8').trim();
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');
  const dataLines = lines.slice(1);

  const records = [];
  let eligibleCount = 0;

  const allowedCandidateDecisions = ['TRUE_LAND_INTERSECTION', 'TERMINAL_SNAP_ONLY', 'BOUNDARY_ALIGNMENT_AMBIGUITY'];

  dataLines.forEach(line => {
    if (!line.trim()) return;
    const parts = line.split(',');
    const reviewId = parts[0] ? parts[0].trim() : '';
    const reviewer = parts[1] ? parts[1].trim() : '';
    const reviewedAt = parts[2] ? parts[2].trim() : '';
    const decision = parts[3] ? parts[3].trim() : 'NOT_REVIEWED';
    const evidenceSourceName = parts[4] ? parts[4].trim() : '';
    const evidenceSourceUrl = parts[5] ? parts[5].trim() : '';
    const evidenceLicense = parts[6] ? parts[6].trim() : '';
    const evidenceRetrievedAt = parts[7] ? parts[7].trim() : '';
    const evidenceNotes = parts[8] ? parts[8].trim() : '';
    const proposedAction = parts[9] ? parts[9].trim() : '';

    const reviewerPresent = reviewer.length > 0;
    const reviewedAtValid = Boolean(reviewedAt && !isNaN(Date.parse(reviewedAt)));
    const evidenceSourceNamePresent = evidenceSourceName.length > 0;
    const evidenceSourceUrlValid = Boolean(evidenceSourceUrl && evidenceSourceUrl.startsWith('https://'));
    const evidenceLicensePresent = evidenceLicense.length > 0;
    const evidenceRetrievedAtValid = Boolean(evidenceRetrievedAt && !isNaN(Date.parse(evidenceRetrievedAt)));
    const evidenceNotesPresent = evidenceNotes.length >= 30;
    const proposedActionPresent = proposedAction.length > 0;

    const isDecisionAllowed = allowedCandidateDecisions.includes(decision);

    const eligibleForGeometryChange = isDecisionAllowed &&
                                      reviewerPresent &&
                                      reviewedAtValid &&
                                      evidenceSourceNamePresent &&
                                      evidenceSourceUrlValid &&
                                      evidenceLicensePresent &&
                                      evidenceRetrievedAtValid &&
                                      evidenceNotesPresent &&
                                      proposedActionPresent;

    if (eligibleForGeometryChange) eligibleCount++;

    let reason = "Decision is NOT_REVIEWED or lacks complete human reviewer sign-off metadata.";
    if (decision === 'NOT_REVIEWED') {
      reason = "Decision is NOT_REVIEWED; human sign-off pending.";
    } else if (!isDecisionAllowed) {
      reason = `Decision ${decision} cannot trigger automatic geometry change.`;
    }

    records.push({
      reviewId,
      decision,
      reviewerPresent,
      reviewedAtValid,
      evidenceSourceNamePresent,
      evidenceSourceUrlValid,
      evidenceLicensePresent,
      evidenceRetrievedAtValid,
      evidenceNotesPresent,
      proposedActionPresent,
      decisionAllowed: isDecisionAllowed,
      eligibleForGeometryChange,
      reason
    });
  });

  const humanDecisionIngestionEnabled = (eligibleCount > 0);

  const summary = {
    timestamp: new Date().toISOString(),
    totalDecisionRows: records.length,
    eligibleForGeometryChangeCount: eligibleCount,
    humanDecisionIngestionEnabled,
    phaseGate: "DECISION_INGESTION_LOCKED_PENDING_HUMAN_SIGNOFF",
    records
  };

  fs.writeFileSync(
    path.join(artifactDir, 'human-decision-eligibility.json'),
    JSON.stringify(summary, null, 2),
    'utf8'
  );

  const mdReport = `# Human Decision Ingestion Eligibility Audit Report (v1.1.0-RC.3.10)

- **Audit Timestamp**: ${summary.timestamp}
- **Total Decision Rows Evaluated**: ${records.length}
- **Eligible for Geometry Change Count**: **\`${eligibleCount}\`**
- **Human Decision Ingestion Enabled**: **\`${humanDecisionIngestionEnabled}\`**
- **Phase Gate**: **\`${summary.phaseGate}\`**

## Decision Eligibility Matrix

| Review ID | Decision | Reviewer Signed | Valid Metadata | Notes >= 30 chars | Eligible for Change | Reason |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
${records.map(r => `| \`${r.reviewId}\` | \`${r.decision}\` | ${r.reviewerPresent} | ${r.reviewedAtValid} | ${r.evidenceNotesPresent} | \`${r.eligibleForGeometryChange}\` | ${r.reason} |`).join('\n')}
`;

  fs.writeFileSync(path.join(artifactDir, 'human-decision-eligibility.md'), mdReport, 'utf8');

  console.log(`📊 Human Decision Eligibility Results:`);
  console.log(`   - Total Decision Rows: ${records.length}`);
  console.log(`   - Eligible for Geometry Change Count: ${eligibleCount}`);
  console.log(`   - Ingestion Enabled: ${humanDecisionIngestionEnabled}`);
  console.log(`   - Phase Gate: ${summary.phaseGate}\n`);

  process.exit(0);
}

runEligibilityAudit();
