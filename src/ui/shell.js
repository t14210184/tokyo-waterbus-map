/**
 * Main UI Shell Component for Tokyo Waterbus Atlas (Phase 1A Multilingual v1.1.0-RC.3.23)
 */
import { SOURCES } from '../data/sources.js';
import { ICONS } from '../assets/icons.js';
import { getFullVersionString, getBuildMetadata } from '../data/version.js';
import { t } from '../i18n/index.js';
import { createLanguagePicker } from './language-picker.js';

export function createUIShell(appContainer) {
  const meta = getBuildMetadata();

  appContainer.innerHTML = `
    <div class="app-shell">
      <!-- Header -->
      <header class="app-header">
        <div class="brand-area">
          <div class="brand-icon">${ICONS.anchor}</div>
          <div>
            <div class="brand-title" style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <span>${t('header.title', 'Tokyo Waterbus Atlas')}</span>
              <span id="header-version-badge" class="badge badge-tokyo-cruise" style="font-size: 0.65rem;" title="Build UTC: ${meta.buildTimestamp} | Hash: ${meta.assetHash}">
                ${meta.fullVersion}
              </span>
              <div id="lang-picker-container" style="display: inline-block;"></div>
            </div>
            <div class="brand-subtitle" id="header-subtitle">
              ${t('header.subtitle', 'Official service status, timetable guidance, pier finder & traveller reference')}
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
          <div class="status-pill num-tabular" id="status-chip-simulation" title="Simulation status" style="color: #f59e0b;">
            ${t('statusChip.noSimulation', '● 目前無可驗證的模擬航行')}
          </div>
          <button id="btn-offline-demo" class="btn btn-secondary" aria-label="${t('statusChip.startDemoBtn', '▶ 啟動離線示範')}" aria-pressed="false" title="開啟概念離線示範動畫" style="padding: 0.35rem 0.65rem; min-height: 32px; font-size: 0.75rem; background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4);">
            ${t('statusChip.startDemoBtn', '▶ 啟動離線示範')}
          </button>
          <button id="btn-theme-toggle" class="btn btn-secondary" aria-label="切換地圖底圖" aria-pressed="false" title="切換深色/淺色/參考資料底圖" style="padding: 0.35rem 0.65rem; min-height: 32px; font-size: 0.75rem;">
            ${ICONS.layers} ${t('theme.toggleBtn', '切換底圖：')}${t('theme.dark', '深色')}
          </button>
        </div>
      </header>

      <!-- Offline Demo Disclaimer Banner (P0-4 & P1A) -->
      <div id="demo-disclaimer-banner" style="display: none; background: rgba(15, 23, 42, 0.95); border-bottom: 1px solid rgba(56, 189, 248, 0.4); padding: 0.5rem 1rem; font-size: 0.73rem; color: #38bdf8; align-items: center; justify-content: space-between; gap: 1rem;">
        <div>
          <strong>${t('disclaimer.bannerText', '離線示範：非 GPS/AIS、非即時船位、非當日班次。航線為概略參考，不可用於導航或安全判斷。')}</strong>
          <button id="btn-toggle-data-levels" class="btn btn-secondary" style="font-size: 0.68rem; padding: 0.15rem 0.4rem; margin-left: 0.5rem; text-decoration: underline;">${t('disclaimer.understandDataLevels', '了解資料層級')}</button>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">
          <button id="btn-reset-demo" class="btn btn-secondary" style="padding: 0.25rem 0.55rem; min-height: 28px; font-size: 0.7rem;">${t('statusChip.resetDemoBtn', '重設示範')}</button>
          <button id="btn-stop-demo" class="btn btn-secondary" style="padding: 0.25rem 0.55rem; min-height: 28px; font-size: 0.7rem; background: #ef4444; color: #fff; border: none;">${t('statusChip.stopDemoBtn', '停止示範')}</button>
        </div>
      </div>

      <!-- Data Trust Levels Info Drawer (P0-4 & P1A) -->
      <div id="data-levels-modal" style="display: none; background: rgba(7, 25, 35, 0.96); border-bottom: 1px solid rgba(56, 189, 248, 0.3); padding: 0.75rem 1.25rem; font-size: 0.75rem; color: #cbd5e1;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem;">
          <strong style="color: #38bdf8; font-size: 0.85rem;">📊 Data Trust Model (${t('disclaimer.understandDataLevels', '資料可信度層級說明')})</strong>
          <button id="btn-close-data-levels" class="btn btn-secondary" style="padding: 0.15rem 0.4rem; font-size: 0.7rem;">${t('disclaimer.close', '關閉 ×')}</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.6rem; font-size: 0.72rem;">
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; padding: 0.4rem; border-radius: 4px;">
            <strong style="color: #10b981;">Level A｜官方狀態</strong><br/>直接連結當日官方營運及公告頁面。
          </div>
          <div style="background: rgba(56, 189, 248, 0.1); border: 1px solid #38bdf8; padding: 0.4rem; border-radius: 4px;">
            <strong style="color: #38bdf8;">Level B｜時刻表參考</strong><br/>依據公開官方班表推算之服務區間。
          </div>
          <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid #f59e0b; padding: 0.4rem; border-radius: 4px;">
            <strong style="color: #f59e0b;">Level C｜離線示範</strong><br/>使用者手動觸發之純概念幾何動畫。
          </div>
          <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; padding: 0.4rem; border-radius: 4px;">
            <strong style="color: #ef4444;">Level D｜停航或未知</strong><br/>官方宣布停航或缺乏當日驗證資料。
          </div>
        </div>
      </div>

      <!-- Main Body -->
      <div class="app-body">
        <!-- Left Sidebar Control Center -->
        <aside class="control-sidebar" id="control-sidebar">
          <div class="sidebar-drag-handle"></div>
          
          <!-- Navigation Tabs in Traveller-First Order (P0-2 & P1A) -->
          <nav class="sidebar-tabs" role="tablist">
            <button class="tab-btn active" data-tab="today" role="tab" aria-selected="true" aria-label="${t('tabs.today', '今天狀態')}">
              <span class="tab-icon">${ICONS.ship}</span>
              <span class="tab-label">${t('tabs.today', '今天狀態')}</span>
            </button>
            <button class="tab-btn" data-tab="routes" role="tab" aria-selected="false" aria-label="${t('tabs.routes', '航線')}">
              <span class="tab-icon">${ICONS.map}</span>
              <span class="tab-label">${t('tabs.routes', '航線')}</span>
            </button>
            <button class="tab-btn" data-tab="piers" role="tab" aria-selected="false" aria-label="${t('tabs.piers', '碼頭')}">
              <span class="tab-icon">${ICONS.pier}</span>
              <span class="tab-label">${t('tabs.piers', '碼頭')}</span>
            </button>
            <button class="tab-btn" data-tab="planner" role="tab" aria-selected="false" aria-label="${t('tabs.planner', '行程規劃')}">
              <span class="tab-icon">${ICONS.compass}</span>
              <span class="tab-label">${t('tabs.planner', '行程規劃')}</span>
            </button>
            <button class="tab-btn" data-tab="explore" role="tab" aria-selected="false" aria-label="${t('tabs.explore', '探索')}">
              <span class="tab-icon">${ICONS.compass}</span>
              <span class="tab-label">${t('tabs.explore', '探索')}</span>
            </button>
          </nav>

          <!-- Tab Content Panel -->
          <div class="sidebar-content" id="sidebar-tab-content">
            <!-- Dynamic tab content mounts here -->
          </div>
        </aside>

        <!-- Right Map Canvas Container -->
        <main class="map-canvas-container" id="map-workspace">
          <div id="map"></div>

          <!-- Top-Right Floating Controls -->
          <div class="map-overlay-controls">
            <div id="env-context-widget"></div>
            <button id="btn-reset-map-view" class="btn btn-icon" aria-label="重置地圖視角" title="重置地圖視角 (Fit Tokyo Bay Bounds)" style="min-width: 36px; min-height: 36px;">
              ${ICONS.resetView}
            </button>
          </div>

          <!-- Bottom-Right Floating Card Slot -->
          <div class="map-floating-card" id="map-floating-card"></div>
        </main>
      </div>

      <!-- Footer Status Gateway Bar & Build Identity Disclosure -->
      <footer class="status-bar-footer">
        <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
          <span style="color: var(--emerald-500); font-weight: 600; display: flex; align-items: center; gap: 0.35rem;">
            ${ICONS.check} ${t('footer.officialPortal', '官方營運資訊門戶')}
          </span>
          <span style="opacity: 0.6; font-size: 0.7rem;">${t('footer.lastValidated', '最後資料校驗:')} ${SOURCES.lastUpdated}</span>
          <span id="footer-build-identity" style="opacity: 0.75; font-size: 0.7rem; color: #38bdf8;" title="Build UTC: ${meta.buildTimestamp} | Asset Hash: ${meta.assetHash}">
            Release: ${meta.fullVersion}
          </span>
        </div>
        <div style="display: flex; gap: 0.85rem; align-items: center; flex-wrap: wrap; padding-right: 140px;">
          <a href="https://www.suijobus.co.jp/guide/operation/" target="_blank" rel="noopener" style="color: var(--ocean-300); text-decoration: none; display: flex; align-items: center; gap: 0.25rem;">
            ${ICONS.externalLink} TOKYO CRUISE
          </a>
          <a href="https://www.tokyo-park.or.jp/water/waterbus/" target="_blank" rel="noopener" style="color: #a78bfa; text-decoration: none; display: flex; align-items: center; gap: 0.25rem;">
            ${ICONS.externalLink} 水辺ライン
          </a>
          <!-- Secondary Entry for Human Geographic Review Portal -->
          <button id="link-secondary-review" class="btn btn-secondary" style="font-size: 0.7rem; padding: 0.2rem 0.5rem; background: rgba(255,255,255,0.06); color: #94a3b8; border: 1px solid rgba(255,255,255,0.15);" title="開啟 13 筆 RGR Canonical IDs 人工地理審核門戶">
            ${t('footer.secondaryReviewBtn', '資料品質與審核 (RGR)')}
          </button>
        </div>
      </footer>
    </div>
  `;

  // Mount Accessible Language Picker Component
  const langContainer = appContainer.querySelector('#lang-picker-container');
  if (langContainer) {
    createLanguagePicker(langContainer);
  }
}

