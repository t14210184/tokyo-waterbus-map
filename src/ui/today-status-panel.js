/**
 * "Today Status" (今天狀態) Panel Renderer for Tokyo Waterbus Atlas
 * Truthful status layer with official operator links, timestamps, and service states.
 * Consumes Information Confidence Model & Provenance Formatter.
 */

import { ICONS } from '../assets/icons.js';
import { SERVICE_STATUS_REGISTRY } from '../data/service-status.js';
import { renderProvenanceHtml } from '../core/provenance-formatter.js';
import { getConfidenceModel } from '../data/information-confidence.js';
import { t } from '../i18n/index.js';

export function renderTodayStatusPanel(container) {
  if (!container) return;

  const mizubeStatus = SERVICE_STATUS_REGISTRY.operators['tokyo-mizube-line'];

  const tokyoCruiseModel = getConfidenceModel('TIMETABLE_ESTIMATE');
  const mizubeModel = getConfidenceModel('SUSPENDED_OR_UNKNOWN');

  const tokyoCruiseProvenanceHtml = renderProvenanceHtml({
    confidenceLevelId: 'TIMETABLE_ESTIMATE',
    sourceType: 'official-operator',
    officialUrl: 'https://www.suijobus.co.jp/guide/operation/',
    publishedAt: '2026-01-01T00:00:00Z',
    checkedAt: '2026-08-03T00:00:00Z',
    fetchedAt: null,
    limitationText: t('todayPanel.tokyoCruiseLimitation', '此為官方班表與營運連結參考，非即時 AIS/GPS 船位。')
  });

  const mizubeProvenanceHtml = renderProvenanceHtml({
    confidenceLevelId: 'SUSPENDED_OR_UNKNOWN',
    sourceType: 'official-operator',
    officialUrl: mizubeStatus.sourceUrl,
    publishedAt: '2026-01-19T00:00:00Z',
    checkedAt: '2026-08-03T00:00:00Z',
    fetchedAt: null,
    limitationText: t('todayPanel.mizubeLimitation', '東京水辺ライン全線暫停營運。目前不提供即時船位、預測位置或登船 CTA。出發前請造訪官方營運公告。')
  });

  container.innerHTML = `
    <div class="today-status-panel-wrapper" style="padding: 0.15rem 0;">
      <!-- Truthful Status Header Card -->
      <div class="card" style="margin-bottom: 0.75rem; padding: 0.75rem; background: var(--surface-dark-elevated); border-color: var(--ocean-500);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.45rem;">
          <h2 style="font-size: 1rem; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 0.4rem;">
            ${ICONS.ship} ${t('todayPanel.title', '今日營運狀態與官方連結')}
          </h2>
          <span class="badge ${tokyoCruiseModel.badgeClass}" style="font-size: 0.68rem; font-weight: 600;">
            ${tokyoCruiseModel.symbol} ${t('todayPanel.badge', 'OFFICIAL LINKS')}
          </span>
        </div>

        <div style="font-size: 0.75rem; color: #cbd5e1; line-height: 1.5; background: rgba(7, 25, 35, 0.8); padding: 0.6rem; border-radius: 4px; border: 1px solid rgba(56, 189, 248, 0.2);">
          ${t('todayPanel.intro', '● 本系統提供官方驗證入口，不虛構即時船位。東京水上巴士 Atlas 為參考導覽工具，幫助您快速前往各航商當日最新官方營運頁面與時刻表。搭乘前請務必確認官方最新公告。')}
        </div>
      </div>

      <!-- Operator 1: TOKYO CRUISE -->
      <div class="card" style="margin-bottom: 0.75rem; padding: 0.75rem; border-left: 4px solid #38bdf8; background: #0f172a;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem;">
          <h3 style="font-size: 0.95rem; font-weight: 700; color: #ffffff; margin: 0;">
            ${t('todayPanel.tokyoCruiseTitle', 'TOKYO CRUISE (東京都觀光汽船)')}
          </h3>
          <span class="badge ${tokyoCruiseModel.badgeClass}" style="font-weight: 600;">
            ${tokyoCruiseModel.symbol} ${t('todayPanel.tokyoCruiseStatus', '正常狀態待官方確認')}
          </span>
        </div>

        <div style="font-size: 0.78rem; color: #cbd5e1; margin-bottom: 0.6rem; line-height: 1.45;">
          ${t('todayPanel.tokyoCruiseDesc', '隅田川線、淺草-台場直航線、日之出-台場線等常態航班，請點擊下方官方連結查看今日最新動態與航班表。')}
        </div>

        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.5rem;">
          <a href="https://www.suijobus.co.jp/guide/operation/" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="font-size: 0.73rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.3rem; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid #38bdf8;">
            ${ICONS.externalLink} ${t('todayPanel.tokyoCruiseAction', 'TOKYO CRUISE 今日運航狀況')}
          </a>
          <a href="https://www.suijobus.co.jp/guide/timetable/" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="font-size: 0.73rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.3rem;">
            ${ICONS.externalLink} ${t('todayPanel.tokyoCruiseTimetableAction', '官方時刻表與票價')}
          </a>
        </div>

        ${tokyoCruiseProvenanceHtml}
      </div>

      <!-- Operator 2: 東京水辺ライン (SUSPENDED) -->
      <div class="card" style="margin-bottom: 0.75rem; padding: 0.75rem; border-left: 4px solid #ef4444; background: #0f172a;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem;">
          <h3 style="font-size: 0.95rem; font-weight: 700; color: #ffffff; margin: 0;">
            ${mizubeStatus.name}
          </h3>
          <span class="badge ${mizubeModel.badgeClass}" style="font-weight: 600;">
            ${mizubeModel.symbol} ${t('todayPanel.mizubeStatusLabel', '暫停營運')}
          </span>
        </div>

        <div style="font-size: 0.78rem; color: #cbd5e1; margin-bottom: 0.5rem; line-height: 1.45;">
          ${mizubeStatus.publicMessage}
        </div>

        <a href="${mizubeStatus.sourceUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="font-size: 0.73rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.3rem; border-color: rgba(239, 68, 68, 0.4); color: #fca5a5; margin-bottom: 0.5rem;">
          ${ICONS.externalLink} ${t('todayPanel.mizubeAction', '點此開啟東京水辺ライン官方營運公告')}
        </a>

        ${mizubeProvenanceHtml}
      </div>

      <!-- Footer Disclosure Statement -->
      <div style="font-size: 0.7rem; color: #64748b; text-align: center; margin-top: 0.8rem; line-height: 1.4;">
        ${t('todayPanel.footerDisclosure', 'This app tells me where to check today\'s official answer; it does not invent it.')}
      </div>
    </div>
  `;
}
