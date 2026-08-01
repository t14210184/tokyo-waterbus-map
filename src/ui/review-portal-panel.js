/**
 * Human Geographic Review Portal UI Panel Component for Tokyo Waterbus Atlas (v1.1.0-RC.3.13)
 * Provides 13 canonical review items view, downloadable templates, and local-only CSV format pre-validation.
 */

import { ICONS } from '../assets/icons.js';

const CANONICAL_REVIEW_ITEMS = [
  { reviewId: "RGR-sumida-river-13", routeId: "sumida-river", segmentIndex: 13, routeName: "隅田川線", scopeClassification: "riverbank-limited", lengthMeters: 620, initialDecision: "NEEDS_HUMAN_GEOGRAPHIC_REVIEW" },
  { reviewId: "RGR-sumida-river-14", routeId: "sumida-river", segmentIndex: 14, routeName: "隅田川線", scopeClassification: "riverbank-limited", lengthMeters: 580, initialDecision: "NEEDS_HUMAN_GEOGRAPHIC_REVIEW" },
  { reviewId: "RGR-asakusa-odaiba-direct-11", routeId: "asakusa-odaiba-direct", segmentIndex: 11, routeName: "淺草-台場直航線", scopeClassification: "riverbank-limited", lengthMeters: 640, initialDecision: "NEEDS_HUMAN_GEOGRAPHIC_REVIEW" },
  { reviewId: "RGR-asakusa-odaiba-direct-12", routeId: "asakusa-odaiba-direct", segmentIndex: 12, routeName: "淺草-台場直航線", scopeClassification: "riverbank-limited", lengthMeters: 610, initialDecision: "NEEDS_HUMAN_GEOGRAPHIC_REVIEW" },
  { reviewId: "RGR-hinode-odaiba-3", routeId: "hinode-odaiba", segmentIndex: 3, routeName: "日之出-台場線", scopeClassification: "coastal-bay-supported", lengthMeters: 890, initialDecision: "NEEDS_HUMAN_GEOGRAPHIC_REVIEW" },
  { reviewId: "RGR-hinode-odaiba-4", routeId: "hinode-odaiba", segmentIndex: 4, routeName: "日之出-台場線", scopeClassification: "coastal-bay-supported", lengthMeters: 920, initialDecision: "NEEDS_HUMAN_GEOGRAPHIC_REVIEW" },
  { reviewId: "RGR-hamarikyu-6", routeId: "hamarikyu", segmentIndex: 6, routeName: "濱離宮線", scopeClassification: "inner-harbor-limited", lengthMeters: 310, initialDecision: "NEEDS_HUMAN_GEOGRAPHIC_REVIEW" },
  { reviewId: "RGR-hamarikyu-7", routeId: "hamarikyu", segmentIndex: 7, routeName: "濱離宮線", scopeClassification: "inner-harbor-limited", lengthMeters: 290, initialDecision: "NEEDS_HUMAN_GEOGRAPHIC_REVIEW" },
  { reviewId: "RGR-mizube-line-1", routeId: "mizube-line", segmentIndex: 1, routeName: "東京水邊線", scopeClassification: "riverbank-limited", lengthMeters: 730, initialDecision: "NEEDS_HUMAN_GEOGRAPHIC_REVIEW" },
  { reviewId: "RGR-mizube-line-2", routeId: "mizube-line", segmentIndex: 2, routeName: "東京水邊線", scopeClassification: "riverbank-limited", lengthMeters: 710, initialDecision: "NEEDS_HUMAN_GEOGRAPHIC_REVIEW" },
  { reviewId: "RGR-mizube-line-9", routeId: "mizube-line", segmentIndex: 9, routeName: "東京水邊線", scopeClassification: "canal-limited", lengthMeters: 450, initialDecision: "NEEDS_HUMAN_GEOGRAPHIC_REVIEW" },
  { reviewId: "RGR-mizube-line-10", routeId: "mizube-line", segmentIndex: 10, routeName: "東京水邊線", scopeClassification: "canal-limited", lengthMeters: 480, initialDecision: "NEEDS_HUMAN_GEOGRAPHIC_REVIEW" },
  { reviewId: "RGR-mizube-line-11", routeId: "mizube-line", segmentIndex: 11, routeName: "東京水邊線", scopeClassification: "canal-limited", lengthMeters: 460, initialDecision: "NEEDS_HUMAN_GEOGRAPHIC_REVIEW" }
];

export function renderReviewPortalPanel(container) {
  const baseUrl = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;

  container.innerHTML = `
    <div style="padding: 0.25rem 0;" class="review-portal-container">
      <h2 style="font-size: 1.05rem; font-weight: 700; color: #ffffff; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.4rem;">
        ${ICONS.compass} 人工地理審核入口 (Human Review Portal)
      </h2>

      <!-- Limitation Disclaimer Banner -->
      <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.3); padding: 0.75rem; border-radius: 6px; font-size: 0.75rem; color: #94a3b8; margin-bottom: 1rem;">
        <div style="color: #38bdf8; font-weight: 600; margin-bottom: 0.25rem;">Disclaimer / 注意事項</div>
        This is an approximate-reference visualization and review aid. It is not an official navigation chart, operational routing system, or maritime safety service.
      </div>

      <!-- Status Chips Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem; font-size: 0.72rem;">
        <div style="background: #0f172a; padding: 0.5rem 0.6rem; border-radius: 4px; border: 1px solid #1e293b;">
          <span style="color: #94a3b8;">Status:</span> <strong style="color: #f59e0b;">Awaiting authentic human input</strong>
        </div>
        <div style="background: #0f172a; padding: 0.5rem 0.6rem; border-radius: 4px; border: 1px solid #1e293b;">
          <span style="color: #94a3b8;">Eligible changes:</span> <strong style="color: #ef4444;">0</strong>
        </div>
        <div style="background: #0f172a; padding: 0.5rem 0.6rem; border-radius: 4px; border: 1px solid #1e293b;">
          <span style="color: #94a3b8;">Classification:</span> <strong style="color: #38bdf8;">approximate-reference</strong>
        </div>
        <div style="background: #0f172a; padding: 0.5rem 0.6rem; border-radius: 4px; border: 1px solid #1e293b;">
          <span style="color: #94a3b8;">Release status:</span> <strong style="color: #10b981;">CONDITIONAL PASS</strong>
        </div>
      </div>

      <!-- Download Template Links -->
      <div class="card" style="margin-bottom: 1rem; padding: 0.75rem;">
        <h3 class="card-title" style="font-size: 0.85rem; margin-bottom: 0.5rem;">📥 審核檔案與範本下載</h3>
        <div style="display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.75rem;">
          <a href="${baseUrl}artifacts/v1.1-rc3-11/human-review-intake-template.csv" download class="btn btn-secondary" style="text-align: left; text-decoration: none; padding: 0.4rem 0.6rem;">
            ${ICONS.externalLink} 下載 CSV 簽核範本 (human-review-intake-template.csv)
          </a>
          <a href="${baseUrl}artifacts/v1.1-rc3-11/human-review-intake-schema.json" download class="btn btn-secondary" style="text-align: left; text-decoration: none; padding: 0.4rem 0.6rem;">
            ${ICONS.externalLink} 下載 JSON Schema (human-review-intake-schema.json)
          </a>
          <a href="${baseUrl}artifacts/v1.1-rc3-11/human-review-intake-instructions.md" download class="btn btn-secondary" style="text-align: left; text-decoration: none; padding: 0.4rem 0.6rem;">
            ${ICONS.externalLink} 下載審核指引 (human-review-intake-instructions.md)
          </a>
          <a href="${baseUrl}artifacts/v1.1-rc3-11/canonical-review-id-register.csv" download class="btn btn-secondary" style="text-align: left; text-decoration: none; padding: 0.4rem 0.6rem;">
            ${ICONS.externalLink} 下載 13 個 Canonical ID 清冊 (canonical-review-id-register.csv)
          </a>
        </div>
      </div>

      <!-- Local-Only CSV Format Pre-Validator -->
      <div class="card" style="margin-bottom: 1rem; padding: 0.75rem; background: #0b1320; border: 1px solid #1e293b;">
        <h3 class="card-title" style="font-size: 0.85rem; margin-bottom: 0.4rem;">🔍 本機 CSV 格式預檢 (Local-Only Format Check)</h3>

        <div style="background: rgba(245, 158, 11, 0.1); border-left: 3px solid #f59e0b; padding: 0.5rem; border-radius: 4px; font-size: 0.72rem; color: #fbbf24; margin-bottom: 0.6rem;">
          🔒 此工具僅在您的瀏覽器本機檢查檔案格式。檔案不會上傳、儲存、提交、批准或修改任何航線資料。
        </div>

        <label for="input-csv-file" style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.3rem;">
          選擇要預檢的 CSV 檔案：
        </label>
        <input type="file" id="input-csv-file" accept=".csv,text/csv" style="width: 100%; font-size: 0.75rem; margin-bottom: 0.5rem; color: #cbd5e1;" />

        <div id="csv-validation-output" aria-live="polite" style="font-size: 0.75rem; margin-top: 0.5rem;"></div>
      </div>

      <!-- Render 13 Canonical Items List -->
      <div style="margin-bottom: 1rem;">
        <h3 style="font-size: 0.85rem; font-weight: 600; color: #ffffff; margin-bottom: 0.5rem;">
          📍 13 個 Canonical Needs-Review Segments
        </h3>

        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          ${CANONICAL_REVIEW_ITEMS.map(item => `
            <div class="card" style="padding: 0.6rem; font-size: 0.75rem; background: #0f172a; border: 1px solid #1e293b;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                <code style="color: #38bdf8; font-weight: 600;">${item.reviewId}</code>
                <span class="badge" style="background: #334155; color: #f8fafc; font-size: 0.65rem;">${item.scopeClassification}</span>
              </div>
              <div style="color: #cbd5e1;"><strong>${item.routeName}</strong> (Route: \`${item.routeId}\`, Segment: #${item.segmentIndex})</div>
              <div style="color: #94a3b8; font-size: 0.7rem; margin-top: 0.2rem;">Length: ${item.lengthMeters}m | Initial Decision: ${item.initialDecision}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Source Attribution Footer -->
      <div style="font-size: 0.7rem; color: #64748b; text-align: center; border-top: 1px solid #1e293b; padding-top: 0.5rem;">
        © OpenStreetMap contributors — ODbL-1.0
      </div>
    </div>
  `;

  // Attach Local-Only CSV File Validation Event Listener (100% Client-Side FileReader in Browser Memory)
  const fileInput = container.querySelector('#input-csv-file');
  const outputDiv = container.querySelector('#csv-validation-output');

  if (fileInput && outputDiv) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) {
        outputDiv.innerHTML = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const result = parseAndValidateCsvClientSide(text);

        if (result.valid) {
          outputDiv.innerHTML = `
            <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; padding: 0.6rem; border-radius: 4px; color: #34d399;">
              <strong>✅ 格式預檢通過</strong><br/>
              格式預檢通過；這不是人類簽核，也不會啟用幾何修改。請依 human-review-intake-instructions.md 完成真實的獨立人工審核與提交流程。
            </div>
          `;
        } else {
          outputDiv.innerHTML = `
            <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; padding: 0.6rem; border-radius: 4px; color: #f87171;">
              <strong>❌ 格式預檢失敗:</strong> ${result.error}
            </div>
          `;
        }
      };

      reader.readAsText(file);
    });
  }
}

function parseAndValidateCsvClientSide(csvText) {
  const lines = csvText.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) {
    return { valid: false, error: 'CSV 檔案必須包含表頭與資料列' };
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const requiredHeaders = ['reviewId', 'reviewer', 'reviewedAt', 'decision', 'evidenceSourceName', 'evidenceSourceUrl', 'evidenceLicense', 'evidenceRetrievedAt', 'evidenceNotes', 'proposedAction'];

  for (const req of requiredHeaders) {
    if (!headers.includes(req)) {
      return { valid: false, error: `缺少必要欄位: ${req}` };
    }
  }

  const canonicalIdSet = new Set(CANONICAL_REVIEW_ITEMS.map(i => i.reviewId));
  const allowedDecisions = ['TRUE_LAND_INTERSECTION', 'BOUNDARY_ALIGNMENT_AMBIGUITY', 'TERMINAL_SNAP_ONLY', 'VALIDATOR_DATA_INSUFFICIENT', 'REQUIRES_OFFICIAL_SOURCE', 'NOT_REVIEWED'];
  const allowedActions = ['NO_CHANGE_REQUIRED', 'SEEK_OFFICIAL_SOURCE', 'PROPOSE_MINIMAL_WAYPOINT_EDIT', 'REQUEST_SECOND_REVIEW'];

  const dataLines = lines.slice(1);
  const seenIds = new Set();

  for (let i = 0; i < dataLines.length; i++) {
    const parts = dataLines[i].split(',').map(p => p.trim());
    const reviewId = parts[headers.indexOf('reviewId')] || '';
    const reviewer = parts[headers.indexOf('reviewer')] || '';
    const reviewedAt = parts[headers.indexOf('reviewedAt')] || '';
    const decision = parts[headers.indexOf('decision')] || '';
    const evidenceSourceName = parts[headers.indexOf('evidenceSourceName')] || '';
    const evidenceSourceUrl = parts[headers.indexOf('evidenceSourceUrl')] || '';
    const evidenceLicense = parts[headers.indexOf('evidenceLicense')] || '';
    const evidenceRetrievedAt = parts[headers.indexOf('evidenceRetrievedAt')] || '';
    const evidenceNotes = parts[headers.indexOf('evidenceNotes')] || '';
    const proposedAction = parts[headers.indexOf('proposedAction')] || '';

    if (!canonicalIdSet.has(reviewId)) {
      return { valid: false, error: `第 ${i + 2} 列 ID [${reviewId}] 非 13 個 Canonical Review ID 之一` };
    }

    if (seenIds.has(reviewId)) {
      return { valid: false, error: `第 ${i + 2} 列 ID [${reviewId}] 重複` };
    }
    seenIds.add(reviewId);

    if (!reviewer) return { valid: false, error: `第 ${i + 2} 列 (${reviewId}) 缺少 reviewer` };
    if (!reviewedAt || isNaN(Date.parse(reviewedAt))) return { valid: false, error: `第 ${i + 2} 列 (${reviewId}) reviewedAt 非有效 ISO-8601 時間` };
    if (!allowedDecisions.includes(decision)) return { valid: false, error: `第 ${i + 2} 列 (${reviewId}) decision 不在允許清單內` };
    if (!evidenceSourceName) return { valid: false, error: `第 ${i + 2} 列 (${reviewId}) 缺少 evidenceSourceName` };
    if (!evidenceSourceUrl || !evidenceSourceUrl.startsWith('https://')) return { valid: false, error: `第 ${i + 2} 列 (${reviewId}) evidenceSourceUrl 必須為 https URL` };
    if (!evidenceLicense) return { valid: false, error: `第 ${i + 2} 列 (${reviewId}) 缺少 evidenceLicense` };
    if (!evidenceRetrievedAt || isNaN(Date.parse(evidenceRetrievedAt))) return { valid: false, error: `第 ${i + 2} 列 (${reviewId}) evidenceRetrievedAt 非有效 ISO-8601 時間` };
    if (!evidenceNotes || evidenceNotes.length < 30) return { valid: false, error: `第 ${i + 2} 列 (${reviewId}) evidenceNotes 長度不足 30 字元` };
    if (!allowedActions.includes(proposedAction)) return { valid: false, error: `第 ${i + 2} 列 (${reviewId}) proposedAction 不在允許清單內` };
  }

  return { valid: true };
}
