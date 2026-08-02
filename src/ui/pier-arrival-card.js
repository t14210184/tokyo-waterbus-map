/**
 * Multilingual Pier Arrival Card UI Component (Phase 1A)
 */
import { getLocale, t } from '../i18n/index.js';
import { PIER_ARRIVAL_CARDS } from '../data/pier-arrival-cards.js';
import { ICONS } from '../assets/icons.js';

export function renderPierArrivalCard(cardData, containerEl) {
  if (!cardData || !containerEl) return;

  const locale = getLocale();
  const localizedName = cardData.name[locale] || cardData.name['zh-TW'] || cardData.id;
  const usefulText = cardData.usefulFor[locale] || cardData.usefulFor['zh-TW'] || '';
  const addressText = cardData.officialAddress[locale] || cardData.officialAddress['zh-TW'] || '';
  const transitList = cardData.nearestTransit[locale] || cardData.nearestTransit['zh-TW'] || [];
  const notesText = cardData.officialNotes ? (cardData.officialNotes[locale] || cardData.officialNotes['zh-TW']) : null;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cardData.googleMapsQuery)}`;

  containerEl.innerHTML = `
    <div class="pier-arrival-card" style="background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 8px; padding: 0.85rem; margin-bottom: 0.85rem; box-shadow: 0 4px 16px rgba(0,0,0,0.4);">
      <!-- Header Bar -->
      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.5rem;">
        <div>
          <span class="badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid #38bdf8; font-size: 0.65rem; text-transform: uppercase;">
            ${t('pierCard.featuredBadge', '重點推薦碼頭')}
          </span>
          <h3 style="font-size: 1.1rem; font-weight: 700; color: #ffffff; margin: 0.25rem 0 0.1rem 0;">
            ${localizedName}
          </h3>
          <div style="font-size: 0.75rem; color: #94a3b8;">
            ${cardData.officialJapaneseName} (${cardData.romanizedName})
          </div>
        </div>
        <span class="badge" style="background: rgba(16, 185, 129, 0.18); color: #10b981; border: 1px solid #10b981; font-size: 0.65rem;">
          ${t('pierCard.confidenceConfirmed', '官方位置已確認')}
        </span>
      </div>

      <!-- Useful For Context -->
      <div style="font-size: 0.78rem; color: #cbd5e1; background: rgba(7, 25, 35, 0.7); padding: 0.5rem; border-radius: 4px; margin-bottom: 0.6rem; border-left: 3px solid #38bdf8;">
        <strong style="color: #38bdf8;">${t('pierCard.whatUsefulFor', '這座碼頭適合在哪裡使用：')}</strong><br/>
        ${usefulText}
      </div>

      ${notesText ? `
        <div style="font-size: 0.75rem; color: #f59e0b; background: rgba(245, 158, 11, 0.1); padding: 0.45rem; border-radius: 4px; margin-bottom: 0.6rem; border: 1px solid rgba(245, 158, 11, 0.3);">
          ⚠️ <strong>提示：</strong> ${notesText}
        </div>
      ` : ''}

      <!-- Location & Transit -->
      <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.6rem; line-height: 1.45;">
        <div style="margin-bottom: 0.3rem;">
          <strong style="color: #ffffff;">📍 ${t('pierCard.addressLabel', '官方位置與地址：')}</strong> ${addressText}
        </div>
        <div>
          <strong style="color: #ffffff;">🚆 ${t('pierCard.nearestTransitLabel', '最近車站與步行時間：')}</strong>
          <ul style="margin: 0.2rem 0 0 1.2rem; padding: 0; color: #cbd5e1;">
            ${transitList.map(tItem => `<li>${tItem}</li>`).join('')}
          </ul>
        </div>
      </div>

      <!-- Before Leaving Checklist -->
      <div style="font-size: 0.73rem; color: #cbd5e1; background: rgba(255, 255, 255, 0.04); padding: 0.5rem; border-radius: 4px; margin-bottom: 0.65rem; border: 1px solid rgba(255, 255, 255, 0.1);">
        <strong style="color: #10b981;">📋 ${t('pierCard.checklistTitle', '出發前必看檢查清單：')}</strong>
        <ul style="margin: 0.2rem 0 0 1.2rem; padding: 0; line-height: 1.45;">
          <li>${t('pierCard.checkItem1', '確認今日官方營運狀況（受強風暴潮影響可能臨時停航）')}</li>
          <li>${t('pierCard.checkItem2', '查看官方最新時刻表與票價')}</li>
          <li>${t('pierCard.checkItem3', '預留至少 15 分鐘購票與候船時間')}</li>
        </ul>
      </div>

      <!-- Action Buttons -->
      <div style="display: flex; gap: 0.45rem; flex-wrap: wrap; margin-bottom: 0.65rem;">
        <a href="${cardData.officialPierUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="font-size: 0.72rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.25rem; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border-color: #38bdf8;">
          ${ICONS.externalLink} ${t('pierCard.actionPierPage', '開啟官方碼頭頁面')}
        </a>
        <a href="${cardData.officialTodayStatusUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="font-size: 0.72rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.25rem;">
          ${ICONS.externalLink} ${t('pierCard.actionTodayStatus', '查看今日營運狀態')}
        </a>
        <a href="${cardData.officialTimetableUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="font-size: 0.72rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.25rem;">
          ${ICONS.externalLink} ${t('pierCard.actionTimetable', '查看官方時刻表')}
        </a>
        <!-- Non-deceptive Google Maps area handoff -->
        <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="font-size: 0.72rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.25rem; border-color: rgba(16, 185, 129, 0.4); color: #6ee7b7;">
          🗺️ ${t('pierCard.actionGoogleMaps', '在 Google 地圖開啟碼頭區域')}
        </a>
      </div>

      <!-- Photo Readiness & Facilities -->
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; font-size: 0.7rem; color: #94a3b8; background: rgba(0,0,0,0.3); padding: 0.4rem 0.6rem; border-radius: 4px; margin-bottom: 0.5rem;">
        <span>🖼️ ${t('pierCard.photoStatus', '現地辨識照片：建置中')}</span>
        <span>♿ ${t('pierCard.facilitiesUnconfirmed', '無障礙詳細資訊需依官方現場確認')}</span>
      </div>

      <!-- Missed Service Fallback -->
      <div style="font-size: 0.7rem; color: #fca5a5; margin-bottom: 0.4rem;">
        🚨 <strong>${t('pierCard.missedFallbackTitle', '錯過班次或臨時停航應變：')}</strong> ${t('pierCard.missedFallbackDesc', '請即時查看官方告示，並依需求改搭地下鐵或 JR 鐵路路線。')}
      </div>

      <!-- Provenance Footer -->
      <div style="font-size: 0.68rem; color: #64748b; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 0.35rem; margin-top: 0.4rem;">
        ${t('pierCard.provenanceDesc', '資料來源：官方網站公告 ｜ 最後校驗時間：')} ${cardData.retrievedAtUtc}
      </div>
    </div>
  `;
}
