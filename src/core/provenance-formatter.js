/**
 * Reusable Provenance Formatter & Component (Phase 0 Stage 6)
 * Strictly separates publishedAt, checkedAt, and fetchedAt timestamps without substitution.
 */
import { getConfidenceModel } from '../data/information-confidence.js';
import { t } from '../i18n/index.js';

export function formatTimestampJst(isoString) {
  if (!isoString) return null;
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }) + ' JST';
  } catch (e) {
    return null;
  }
}

export function formatProvenanceMetadata({
  confidenceLevelId = 'SUSPENDED_OR_UNKNOWN',
  sourceType = 'official-operator',
  officialUrl = '',
  publishedAt = null,
  checkedAt = null,
  fetchedAt = null,
  limitationText = ''
}) {
  const model = getConfidenceModel(confidenceLevelId);

  const formattedPublished = formatTimestampJst(publishedAt);
  const formattedChecked = formatTimestampJst(checkedAt);
  const formattedFetched = formatTimestampJst(fetchedAt);

  let hasTime = Boolean(formattedPublished || formattedChecked || formattedFetched);
  let timeNoticeText = hasTime ? '' : t('provenance.referenceOnly', '參考資料。出發前請向營運商官方頁面確認當日實際營運班次與航線。');

  return {
    confidenceModel: model,
    sourceType,
    officialUrl: officialUrl && officialUrl.startsWith('https://') ? officialUrl : '',
    publishedAtJst: formattedPublished,
    checkedAtJst: formattedChecked,
    fetchedAtJst: formattedFetched, // Null for static content
    hasTime,
    timeNoticeText,
    limitationText: limitationText || t('provenance.defaultLimitation', '非即時 GPS/AIS 追蹤。資料僅供旅遊行程參考。')
  };
}

export function renderProvenanceHtml(metadata) {
  const meta = formatProvenanceMetadata(metadata);
  const model = meta.confidenceModel;

  return `
    <div class="provenance-disclosure-box" style="margin-top: 0.6rem; padding: 0.5rem 0.75rem; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 6px; font-size: 0.72rem; color: #cbd5e1;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem; flex-wrap: wrap; gap: 0.35rem;">
        <span class="badge ${model.badgeClass}" style="display: inline-flex; align-items: center; gap: 0.3rem;">
          <span>${model.symbol}</span>
          <span>${t(model.labelKey)}</span>
        </span>
        ${meta.officialUrl ? `
          <a href="${meta.officialUrl}" target="_blank" rel="noopener" style="color: #38bdf8; text-decoration: none; display: inline-flex; align-items: center; gap: 0.2rem; font-weight: 500;">
            ${t('provenance.officialSourceLink', '官方來源頁面 ↗')}
          </a>
        ` : ''}
      </div>

      <div style="font-size: 0.7rem; color: #94a3b8; line-height: 1.45;">
        ${meta.publishedAtJst ? `<div><strong>${t('provenance.publishedAt', '官方發布時間')}:</strong> ${meta.publishedAtJst}</div>` : ''}
        ${meta.checkedAtJst ? `<div><strong>${t('provenance.checkedAt', '人工校驗時間')}:</strong> ${meta.checkedAtJst}</div>` : ''}
        ${meta.fetchedAtJst ? `<div><strong>${t('provenance.fetchedAt', '自動抓取時間')}:</strong> ${meta.fetchedAtJst}</div>` : ''}
        ${!meta.hasTime ? `<div style="color: #f59e0b;">${meta.timeNoticeText}</div>` : ''}
        <div style="margin-top: 0.25rem; opacity: 0.85;">${meta.limitationText}</div>
      </div>
    </div>
  `;
}
