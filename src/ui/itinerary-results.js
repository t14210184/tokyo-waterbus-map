/**
 * Candidate Itinerary Results Renderer for Tokyo Waterbus Atlas (Phase 4A.3 Display Integrity Audit)
 * 100% pure SVG vector icons. Uses formatters to guarantee zero user-facing 'undefined' or missing values.
 */

import { ICONS } from '../assets/icons.js';
import { PIERS } from '../data/piers.js';
import { SOURCES } from '../data/sources.js';
import {
  MANDATORY_TRIP_DISCLAIMER,
  formatTotalTime,
  formatTransferBadge,
  displayLocalizedName,
  displayText
} from '../core/itinerary-formatters.js';

export function renderItineraryResults(container, itineraries, selectedItineraryId, onSelectItinerary) {
  if (!container) return;

  if (!Array.isArray(itineraries) || itineraries.length === 0) {
    container.innerHTML = `
      <div style="background: rgba(7, 25, 35, 0.8); border: 1px solid var(--glass-border); padding: 1.5rem; border-radius: var(--border-radius-md); text-align: center; margin-top: 1rem;">
        <div style="font-size: 0.95rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem;">
          目前公開路線資料未找到可連接的水路規劃
        </div>
        <div style="font-size: 0.78rem; color: var(--ink-400); margin-bottom: 0.85rem; line-height: 1.45;">
          請嘗試切換偏好條件，或向官方營運商查詢特約包船／季節性特別航班。
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="itinerary-results-list" style="margin-top: 0.85rem;">
      <!-- Mandatory Trip Disclaimer Banner -->
      <div style="background: rgba(255, 92, 100, 0.1); border-left: 3px solid var(--coral-500); padding: 0.65rem 0.85rem; border-radius: var(--border-radius-sm); font-size: 0.73rem; color: var(--coral-400); margin-bottom: 0.85rem; line-height: 1.45; display: flex; gap: 0.4rem; align-items: flex-start;">
        <span style="flex-shrink: 0; margin-top: 2px;">${ICONS.alert}</span>
        <div>
          <strong>規劃免責說明:</strong> ${MANDATORY_TRIP_DISCLAIMER}
        </div>
      </div>

      ${itineraries.map((itinerary, idx) => {
        const isSelected = itinerary.id === selectedItineraryId;
        const transferBadge = formatTransferBadge(itinerary.transferCount);
        const totalTimeText = formatTotalTime(itinerary.totalEstimateMinutes);

        return `
          <div class="card itinerary-card ${isSelected ? 'focused' : ''}" data-itinerary-id="${itinerary.id}" style="margin-bottom: 0.85rem; padding: 0.85rem; border-color: ${isSelected ? 'var(--ocean-500)' : 'var(--glass-border)'};">
            <!-- Header: Option Index & Badges -->
            <div class="card-header" style="margin-bottom: 0.45rem;">
              <div>
                <span style="font-size: 0.7rem; color: var(--ocean-300); text-transform: uppercase; font-weight: 700;">
                  方案 ${idx + 1}
                </span>
                <h3 class="card-title" style="font-size: 0.95rem; margin-top: 0.1rem;">
                  ${totalTimeText}
                </h3>
              </div>
              <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem;">
                <span class="badge ${itinerary.transferCount === 0 ? 'conf-official' : 'conf-operator'}">
                  ${transferBadge}
                </span>
                <span class="badge conf-official" style="font-size: 0.65rem;">
                  ${itinerary.confidence === 'official-reference' ? '官方基準' : '規劃推估'}
                </span>
              </div>
            </div>

            <!-- Leg Breakdown Timeline -->
            ${(itinerary.legs || []).some(l => l.routeId === 'mizube-line' || (l.operator && l.operator.includes('水辺'))) ? `
              <div style="font-size: 0.72rem; color: #ef4444; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); padding: 0.45rem 0.65rem; border-radius: 4px; margin: 0.4rem 0; line-height: 1.4;">
                ⚠️ 此行程包含暫停營運之「東京水辺ライン」（自 2026-01-19 起當面停航），目前不可作為可用行程。
              </div>
            ` : ''}
            <div style="background: rgba(7, 25, 35, 0.6); padding: 0.65rem 0.75rem; border-radius: 6px; border: 1px solid var(--glass-border); margin: 0.5rem 0;">
              ${itinerary.legs.map((leg, lIdx) => {
                const fromPier = PIERS.find(p => p.id === leg.fromPierId);
                const toPier = PIERS.find(p => p.id === leg.toPierId);
                const fromName = fromPier ? displayLocalizedName(fromPier).main : displayText(leg.fromPierId);
                const toName = toPier ? displayLocalizedName(toPier).main : displayText(leg.toPierId);

                if (leg.isTransfer) {
                  return `
                    <div style="font-size: 0.73rem; color: #a78bfa; padding: 0.35rem 0; border-top: 1px dashed var(--glass-border); margin-top: 0.35rem; display: flex; align-items: center; gap: 0.35rem;">
                      ${ICONS.transfer}
                      <span><strong>${fromName}</strong> 站內水路轉乘 (規劃緩衝 ${leg.durationMinutes} 分鐘)</span>
                    </div>
                  `;
                }

                const opStr = displayText(leg.operator, '營運商資訊');
                const isTokyo = opStr.includes('TOKYO');
                const badgeClass = isTokyo ? 'badge-tokyo-cruise' : 'badge-mizube-line';

                return `
                  <div style="font-size: 0.75rem; color: var(--ocean-200); margin-bottom: 0.35rem; ${lIdx > 0 ? 'border-top: 1px dashed var(--glass-border); padding-top: 0.35rem;' : ''}">
                    <div style="display: flex; align-items: center; justify-content: space-between; font-weight: 600; color: #ffffff; margin-bottom: 0.15rem;">
                      <span style="display: flex; align-items: center; gap: 0.3rem;">
                        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${leg.color || '#13b9c7'};"></span>
                        ${displayText(leg.routeName, '水上航線')}
                      </span>
                      <span class="badge ${badgeClass}" style="font-size: 0.65rem;">
                        ${opStr}
                      </span>
                    </div>
                    <div style="font-size: 0.72rem; color: var(--ink-400); display: flex; align-items: center; justify-content: space-between;">
                      <span style="display: inline-flex; align-items: center; gap: 0.2rem;">
                        ${ICONS.origin} ${fromName} → ${ICONS.destination} ${toName}
                      </span>
                      <span>約 ${leg.durationMinutes} 分鐘</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Warnings Notice -->
            ${itinerary.warnings && itinerary.warnings.length > 0 ? `
              <div style="font-size: 0.71rem; color: #f5a623; background: rgba(245, 166, 35, 0.1); padding: 0.4rem 0.6rem; border-radius: 4px; margin-bottom: 0.55rem; line-height: 1.35;">
                ${itinerary.warnings.map(w => `<div style="display: flex; align-items: center; gap: 0.25rem;">${ICONS.alert} ${displayText(w)}</div>`).join('')}
              </div>
            ` : ''}

            <!-- Action Buttons -->
            <div style="display: flex; gap: 0.45rem; margin-top: 0.6rem;">
              <button class="btn ${isSelected ? 'btn-secondary' : 'btn-primary'} btn-select-itinerary" data-itinerary-id="${itinerary.id}" aria-label="在地圖檢視方案 ${idx + 1}" style="flex: 1; font-size: 0.73rem; min-height: 34px;">
                ${ICONS.map} ${isSelected ? '地圖高亮中' : '在地圖查看航程'}
              </button>
              <a href="${SOURCES.operators[0].todayStatusSite}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" aria-label="前往官方公告頁面確認" style="flex: 1; text-decoration: none; font-size: 0.73rem; min-height: 34px;">
                ${ICONS.externalLink} 官方確認
              </a>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Attach Event Listeners
  container.querySelectorAll('.btn-select-itinerary').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const itId = e.currentTarget.getAttribute('data-itinerary-id');
      const it = itineraries.find(i => i.id === itId);
      if (onSelectItinerary && it) onSelectItinerary(it);
    });
  });
}
