/**
 * Pier Detail Drawer Component for Tokyo Waterbus Atlas
 * Integrates Pier Arrival Guidance Registry & Provenance Formatter.
 */

import { ICONS } from '../assets/icons.js';
import { ROUTES } from '../data/routes.js';
import { LANDMARKS } from '../data/landmarks.js';
import { t } from '../i18n/index.js';
import { getPierDerivedStatus } from '../data/service-status.js';
import { getPierArrivalGuidance } from '../data/pier-arrival-guidance.js';
import { renderProvenanceHtml } from '../core/provenance-formatter.js';
import {
  displayLocalizedName,
  displayOperator,
  displayPierStatus,
  displayConfidence,
  displayTransit
} from '../core/itinerary-formatters.js';

export function renderPierDetailDrawer(container, pier, onClose, onFocusPierOnMap, onFocusRoute, onPrefillPlanner) {
  if (!container || !pier) return;

  const nameInfo = displayLocalizedName(pier);
  const statusInfo = displayPierStatus(pier);
  const derivedStatus = getPierDerivedStatus(pier);
  const isSuspended = derivedStatus.statusState === 'SUSPENDED' || pier.status === 'suspended';

  const opText = displayOperator(pier);
  const isTokyoCruise = opText.includes('TOKYO');
  const operatorBadgeClass = isTokyoCruise ? 'badge-tokyo-cruise' : 'badge-mizube-line';

  // Arrival Guidance Integration (Phase 0 Stage 7)
  const arrivalGuidance = getPierArrivalGuidance(pier.id);
  const isHinode = pier.id === 'hinode';

  let arrivalGuidanceHtml = '';
  if (isHinode) {
    arrivalGuidanceHtml = `
      <div class="arrival-guidance-card card" style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 6px; padding: 0.75rem; margin-bottom: 0.85rem;">
        <div style="font-weight: 700; color: #38bdf8; font-size: 0.85rem; margin-bottom: 0.4rem; display: flex; align-items: center; justify-content: space-between;">
          <span>📍 ${t('arrival.title', '碼頭到達指引 (VERIFIED)')}</span>
          <span class="badge badge-confidence-official" style="font-size: 0.68rem;">🟢 官方核驗</span>
        </div>

        <div class="arrival-guidance-address" style="font-size: 0.76rem; color: #f8fafc; margin-bottom: 0.4rem;">
          <strong>${t('arrival.addressLabel', '地址')}:</strong> ${arrivalGuidance.address}
        </div>

        <div class="arrival-guidance-stations" style="font-size: 0.74rem; color: #cbd5e1; margin-bottom: 0.4rem; line-height: 1.45;">
          <strong>${t('arrival.stationsLabel', '鄰近車站與步行指引')}:</strong>
          <ul style="margin: 0.25rem 0 0 1.2rem; padding: 0;">
            ${arrivalGuidance.nearestStations.map(st => `<li>${st.name} (${st.walkMinutes} min)</li>`).join('')}
          </ul>
        </div>

        <div class="arrival-guidance-accessibility-status" style="margin-top: 0.4rem; font-size: 0.72rem; color: #f59e0b; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); padding: 0.3rem 0.5rem; border-radius: 4px;">
          ⚠️ ${t('arrival.accessibilityPendingNotice', '無障礙設施與照片導覽：待官方現場核驗 (PENDING)')}
        </div>

        <div style="margin-top: 0.5rem;">
          <a href="${arrivalGuidance.officialBoardingUrl}" target="_blank" rel="noopener noreferrer" class="arrival-guidance-boarding-link btn btn-secondary" style="font-size: 0.72rem; text-decoration: none; color: #38bdf8; border-color: #38bdf8;">
            ${ICONS.externalLink} ${t('arrival.officialBoardingLink', 'TOKYO CRUISE 日之出碼頭官方乘車/導覽頁面')}
          </a>
        </div>
      </div>
    `;
  } else {
    arrivalGuidanceHtml = `
      <div class="arrival-guidance-card card" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; padding: 0.65rem; margin-bottom: 0.85rem;">
        <div class="arrival-guidance-status" style="font-size: 0.75rem; color: #94a3b8; display: flex; align-items: center; justify-content: space-between;">
          <span>📍 ${t('arrival.title', '碼頭到達指引')}</span>
          <span class="badge badge-confidence-suspended" style="font-size: 0.68rem;">🔴 待官方核驗 (PENDING)</span>
        </div>
        <div style="font-size: 0.72rem; color: #64748b; margin-top: 0.3rem;">
          ${t('arrival.nonHinodePendingNotice', '本碼頭無障礙詳細資訊與照片導覽尚未經官方現場核驗，狀態維持 PENDING。')}
        </div>
      </div>
    `;
  }

  const confidenceInfo = displayConfidence(pier.confidence || 'official-reference');

  const availableRoutes = (pier.routes || []).map(rId => {
    return ROUTES.find(r => r.id === rId) || { id: rId, name: { zhHant: rId }, color: '#13b9c7' };
  });

  const nearbyLandmarks = (pier.landmarks || []).map(lId => {
    return LANDMARKS.find(l => l.id === lId) || { id: lId, name: { zhHant: lId }, category: '景點' };
  });

  const transitList = displayTransit(pier.nearestTransit);

  const suspensionNoticeHtml = isSuspended ? `
    <div class="mizube-suspension-disclosure" style="background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; border-radius: 6px; padding: 0.75rem; margin-bottom: 0.85rem;">
      <div style="font-weight: 700; color: #ef4444; font-size: 0.85rem; margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.35rem;">
        <span>⚠️</span> ${t('pierCard.mizubeSuspensionTitle', '東京水辺ライン：暫停營運')}
      </div>
      <div style="font-size: 0.76rem; color: #fca5a5; line-height: 1.5; margin-bottom: 0.5rem;">
        ${t('pierCard.mizubeSuspensionBody', '自 2026 年 1 月 19 日起暫停營運，復航日期尚待官方公告。目前無法在此搭乘東京水辺ライン。出發前請查看官方公告。')}
      </div>
      <a href="${pier.officialUrl || 'https://www.tokyo-park.or.jp/water/waterbus/'}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="font-size: 0.73rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.3rem; border-color: rgba(239, 68, 68, 0.5); color: #fca5a5; background: rgba(239, 68, 68, 0.1);">
        ${ICONS.externalLink} ${t('pierCard.mizubeSuspensionLink', '開啟東京水辺ライン官方營運公告')}
      </a>
    </div>
  ` : '';

  const pierProvenanceHtml = renderProvenanceHtml({
    confidenceLevelId: isSuspended ? 'SUSPENDED_OR_UNKNOWN' : 'OFFICIAL_CONFIRMED',
    sourceType: 'official-operator',
    officialUrl: pier.officialUrl || 'https://www.tokyo-park.or.jp/water/waterbus/',
    publishedAt: isSuspended ? '2026-01-19T00:00:00Z' : '2026-01-01T00:00:00Z',
    checkedAt: '2026-08-03T00:00:00Z',
    fetchedAt: null,
    limitationText: isSuspended
      ? t('pierCard.mizubeLimitation', '東京水辺ライン全線暫停營運。無登船 CTA、無船位預測。出發前請確認官方告示。')
      : t('pierCard.generalLimitation', '碼頭營運與航班表以營運商官方最新公告為準。')
  });

  container.innerHTML = `
    <div class="pier-drawer-wrapper card" style="
      background: var(--surface-dark);
      border: 1px solid var(--ocean-500);
      border-radius: var(--border-radius-md);
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.7);
      padding: 1rem;
      max-height: 80vh;
      overflow-y: auto;
      position: relative;
    ">
      <!-- Drawer Header -->
      <div style="display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.75rem; margin-bottom: 0.85rem;">
        <div>
          <div style="font-size: 0.7rem; color: var(--ocean-300); text-transform: uppercase; font-weight: 600; margin-bottom: 0.2rem;">
            碼頭詳細資訊 (PIER DETAILS)
          </div>
          <h2 style="font-size: 1.15rem; font-weight: 700; color: #ffffff; margin: 0 0 0.15rem 0; line-height: 1.3;">
            ${nameInfo.main}
          </h2>
          ${nameInfo.sub ? `<div style="font-size: 0.78rem; color: var(--ink-400);">${nameInfo.sub}</div>` : ''}
        </div>
        <button id="btn-close-pier-drawer" class="btn btn-secondary" aria-label="關閉碼頭詳情抽屜" style="padding: 0.35rem 0.5rem; min-height: 32px; color: var(--ocean-200);">
          ${ICONS.close}
        </button>
      </div>

      ${suspensionNoticeHtml}
      ${arrivalGuidanceHtml}

      <!-- Metadata Badges & Notice -->
      <div style="display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap; margin-bottom: 0.75rem;">
        <span class="badge ${operatorBadgeClass}">${opText}</span>
        <span class="badge ${statusInfo.class}" aria-label="${statusInfo.ariaLabel}">
          ${statusInfo.text}
        </span>
        <span class="badge badge-confidence-official">${confidenceInfo.text}</span>
      </div>

      <!-- Action Toolbar -->
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.95rem;">
        <button id="btn-drawer-focus-map" class="btn btn-secondary" style="font-size: 0.76rem; padding: 0.35rem 0.65rem;">
          ${ICONS.resetView} 在地圖上定位
        </button>
        <button id="btn-drawer-prefill-planner" class="btn btn-secondary" style="font-size: 0.76rem; padding: 0.35rem 0.65rem; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border-color: #38bdf8;">
          ${ICONS.compass} 從此碼頭規劃行程
        </button>
        ${pier.officialUrl ? `
          <a href="${pier.officialUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="font-size: 0.76rem; padding: 0.35rem 0.65rem; text-decoration: none;">
            ${ICONS.externalLink} 官方頁面
          </a>
        ` : ''}
      </div>

      <!-- Nearest Transit Section -->
      <div style="margin-bottom: 0.9rem;">
        <div style="font-size: 0.75rem; font-weight: 600; color: var(--ocean-200); margin-bottom: 0.35rem;">
          鄰近交通車站
        </div>
        <div style="font-size: 0.78rem; color: #cbd5e1; background: rgba(0, 0, 0, 0.3); padding: 0.5rem 0.65rem; border-radius: 4px; line-height: 1.45;">
          ${transitList}
        </div>
      </div>

      ${pierProvenanceHtml}
    </div>
  `;

  // Bind Drawer Event Listeners
  const closeBtn = container.querySelector('#btn-close-pier-drawer');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      container.style.display = 'none';
      if (typeof onClose === 'function') onClose();
    });
  }

  const focusMapBtn = container.querySelector('#btn-drawer-focus-map');
  if (focusMapBtn) {
    focusMapBtn.addEventListener('click', () => {
      if (typeof onFocusPierOnMap === 'function') onFocusPierOnMap(pier);
    });
  }

  const prefillPlannerBtn = container.querySelector('#btn-drawer-prefill-planner');
  if (prefillPlannerBtn) {
    prefillPlannerBtn.addEventListener('click', () => {
      if (typeof onPrefillPlanner === 'function') onPrefillPlanner(pier);
    });
  }
}
