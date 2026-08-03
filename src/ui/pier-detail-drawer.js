/**
 * Pier Detail Drawer Component for Tokyo Waterbus Atlas (Phase 4A.3 Display Integrity Audit)
 * 100% pure SVG vector icons. Uses centralized display formatters for zero user-facing 'undefined' or missing values.
 */

import { ICONS } from '../assets/icons.js';
import { ROUTES } from '../data/routes.js';
import { LANDMARKS } from '../data/landmarks.js';
import { atlasStore } from '../core/store.js';
import { PIER_ARRIVAL_CARDS } from '../data/pier-arrival-cards.js';
import { renderPierArrivalCard } from './pier-arrival-card.js';
import { t } from '../i18n/index.js';
import { getPierDerivedStatus } from '../data/service-status.js';
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

  const cardData = PIER_ARRIVAL_CARDS[pier.id];
  let cardHtml = '';
  if (cardData) {
    const dummyEl = document.createElement('div');
    renderPierArrivalCard(cardData, dummyEl);
    cardHtml = dummyEl.innerHTML;
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

      ${cardHtml}

      <!-- Metadata Badges & Notice -->
      <div style="display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap; margin-bottom: 0.75rem;">
        <span class="badge ${operatorBadgeClass}">${opText}</span>
        <span class="badge ${statusInfo.class}" aria-label="${statusInfo.ariaLabel}">
          ${statusInfo.icon} ${statusInfo.text}
        </span>
        <span class="badge ${confidenceInfo.class}">
          ${confidenceInfo.icon} ${confidenceInfo.text}
        </span>
      </div>

      ${suspensionNoticeHtml}

      <div style="background: rgba(255, 92, 100, 0.1); border-left: 3px solid var(--coral-500); padding: 0.55rem 0.75rem; border-radius: 4px; font-size: 0.73rem; color: var(--coral-400); margin-bottom: 0.85rem; line-height: 1.4; display: flex; gap: 0.4rem; align-items: flex-start;">
        <span style="flex-shrink: 0; margin-top: 2px;">${ICONS.alert}</span>
        <div>
          <strong>官方確認提醒:</strong> 出發前請向營運商官方頁面確認當日實際營運班次與航線。
        </div>
      </div>

      <!-- Available Routes Section -->
      <div style="margin-bottom: 0.85rem;">
        <h4 style="font-size: 0.82rem; font-weight: 700; color: #ffffff; margin: 0 0 0.45rem 0; display: flex; align-items: center; gap: 0.35rem;">
          ${ICONS.map} 可搭乘航線 (${availableRoutes.length} 條)
        </h4>
        <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
          ${availableRoutes.map(rt => `
            <button class="btn btn-secondary btn-drawer-route" data-route-id="${rt.id}" aria-label="查看 ${rt.name?.zhHant || rt.id} 航線" style="padding: 0.3rem 0.6rem; font-size: 0.73rem; border-color: ${rt.color}; color: #ffffff;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${rt.color}; margin-right: 0.3rem;"></span>
              ${rt.name?.zhHant || rt.id}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Nearest Transit Section -->
      <div style="margin-bottom: 0.85rem;">
        <h4 style="font-size: 0.82rem; font-weight: 700; color: #ffffff; margin: 0 0 0.45rem 0; display: flex; align-items: center; gap: 0.35rem;">
          ${ICONS.transit} 鄰近交通車站
        </h4>
        <div style="background: rgba(7, 25, 35, 0.6); padding: 0.55rem 0.75rem; border-radius: 6px; border: 1px solid var(--glass-border);">
          ${transitList.map(t => `
            <div style="font-size: 0.75rem; color: var(--ocean-200); margin-bottom: 0.25rem; display: flex; align-items: center; gap: 0.35rem;">
              <span>•</span> <span>${t}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Nearby Landmarks Section -->
      <div style="margin-bottom: 0.85rem;">
        <h4 style="font-size: 0.82rem; font-weight: 700; color: #ffffff; margin: 0 0 0.45rem 0; display: flex; align-items: center; gap: 0.35rem;">
          ${ICONS.compass} 周邊代表景點
        </h4>
        <div style="display: flex; flex-wrap: wrap; gap: 0.35rem;">
          ${nearbyLandmarks.map(lm => `
            <span style="font-size: 0.72rem; color: var(--ocean-200); background: rgba(19, 185, 199, 0.1); padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid rgba(19, 185, 199, 0.2); display: inline-flex; align-items: center; gap: 0.25rem;">
              ${ICONS.pier} ${lm.name?.zhHant || lm.id}
            </span>
          `).join('')}
        </div>
      </div>

      <!-- Prefill Planner Buttons -->
      <div style="display: flex; gap: 0.45rem; margin-bottom: 0.75rem; border-top: 1px dashed var(--glass-border); padding-top: 0.75rem;">
        <button id="btn-prefill-origin" class="btn btn-secondary" aria-label="將 ${nameInfo.main} 設為出發碼頭" style="flex: 1; font-size: 0.73rem; min-height: 34px; color: var(--emerald-500); border-color: rgba(22, 161, 91, 0.4);">
          ${ICONS.origin} 設為出發碼頭
        </button>
        <button id="btn-prefill-dest" class="btn btn-secondary" aria-label="將 ${nameInfo.main} 設為抵達碼頭" style="flex: 1; font-size: 0.73rem; min-height: 34px; color: var(--coral-400); border-color: rgba(255, 92, 100, 0.4);">
          ${ICONS.destination} 設為抵達碼頭
        </button>
      </div>

      <!-- Action Buttons -->
      <div style="display: flex; gap: 0.45rem; margin-top: 0.55rem;">
        <button id="btn-drawer-focus-pier" class="btn btn-primary" aria-label="在地圖聚焦 ${nameInfo.main}" style="flex: 1; font-size: 0.75rem; min-height: 36px;">
          ${ICONS.focus} 在地圖聚焦
        </button>
        <a href="${pier.officialUrl || 'https://www.suijobus.co.jp/en/'}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" aria-label="前往 ${opText} 官方網頁" style="flex: 1; text-decoration: none; font-size: 0.75rem; min-height: 36px;">
          ${ICONS.externalLink} 官方頁面
        </a>
      </div>

      <!-- Disclaimer Footer -->
      <div style="font-size: 0.68rem; color: var(--ink-400); margin-top: 0.85rem; text-align: center; border-top: 1px dashed var(--glass-border); padding-top: 0.55rem;">
        本頁為旅遊與路線規劃參考；季節、天候及營運調整請以官方公告為準。
      </div>
    </div>
  `;

  // Attach Event Listeners
  const closeBtn = container.querySelector('#btn-close-pier-drawer');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      atlasStore.setState({
        pierExplorer: { ...atlasStore.getState().pierExplorer, selectedPierId: null, drawerOpen: false },
        ui: { ...atlasStore.getState().ui, pierDrawerOpen: false, mobileSheetMode: 'none' }
      });
      if (onClose) onClose();
    });
  }

  const prefillOriginBtn = container.querySelector('#btn-prefill-origin');
  if (prefillOriginBtn) {
    prefillOriginBtn.addEventListener('click', () => {
      atlasStore.setState({
        planner: { ...atlasStore.getState().planner, originPierId: pier.id },
        pierExplorer: { ...atlasStore.getState().pierExplorer, drawerOpen: false },
        ui: { ...atlasStore.getState().ui, activeTab: 'guide', pierDrawerOpen: false, mobileSheetMode: 'planner' }
      });
      if (onPrefillPlanner) onPrefillPlanner('origin', pier.id);
    });
  }

  const prefillDestBtn = container.querySelector('#btn-prefill-dest');
  if (prefillDestBtn) {
    prefillDestBtn.addEventListener('click', () => {
      atlasStore.setState({
        planner: { ...atlasStore.getState().planner, destinationPierId: pier.id },
        pierExplorer: { ...atlasStore.getState().pierExplorer, drawerOpen: false },
        ui: { ...atlasStore.getState().ui, activeTab: 'guide', pierDrawerOpen: false, mobileSheetMode: 'planner' }
      });
      if (onPrefillPlanner) onPrefillPlanner('destination', pier.id);
    });
  }

  const focusPierBtn = container.querySelector('#btn-drawer-focus-pier');
  if (focusPierBtn) {
    focusPierBtn.addEventListener('click', () => {
      if (onFocusPierOnMap) onFocusPierOnMap(pier.id);
    });
  }

  container.querySelectorAll('.btn-drawer-route').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const rId = e.currentTarget.getAttribute('data-route-id');
      if (onFocusRoute) onFocusRoute(rId);
    });
  });
}
