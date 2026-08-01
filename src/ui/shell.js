/**
 * Main UI Shell Component for Tokyo Waterbus Atlas (Phase 2B)
 */
import { SOURCES } from '../data/sources.js';
import { ICONS } from '../assets/icons.js';

export function createUIShell(appContainer) {
  appContainer.innerHTML = `
    <div class="app-shell">
      <!-- Header -->
      <header class="app-header">
        <div class="brand-area">
          <div class="brand-icon">${ICONS.anchor}</div>
          <div>
            <div class="brand-title">
              Tokyo Waterbus Atlas
              <span class="badge badge-tokyo-cruise" style="font-size: 0.65rem;">v1.0</span>
            </div>
            <div class="brand-subtitle">
              Navigate Tokyo by water — routes, piers, live-status gateway & simulated movement
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div class="status-pill num-tabular" id="status-chip-simulation" title="Simulation engine active">
            ● 模擬航行中 (SIMULATED)
          </div>
          <button id="btn-theme-toggle" class="btn btn-secondary" aria-label="切換地圖底圖" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">
            ${ICONS.layers} 切換底圖
          </button>
        </div>
      </header>

      <!-- Main Body -->
      <div class="app-body">
        <!-- Left Sidebar Control Center -->
        <aside class="control-sidebar" id="control-sidebar">
          <div class="sidebar-drag-handle"></div>
          
          <!-- Navigation Tabs with SVG Icons -->
          <nav class="sidebar-tabs" role="tablist">
            <button class="tab-btn active" data-tab="routes" role="tab" aria-selected="true" aria-label="航線總覽">
              <span class="tab-icon">${ICONS.map}</span>
              <span>航線總覽</span>
            </button>
            <button class="tab-btn" data-tab="fleet" role="tab" aria-selected="false" aria-label="船隊動態">
              <span class="tab-icon">${ICONS.ship}</span>
              <span>船隊動態</span>
            </button>
            <button class="tab-btn" data-tab="piers" role="tab" aria-selected="false" aria-label="碼頭列表">
              <span class="tab-icon">${ICONS.pier}</span>
              <span>碼頭列表</span>
            </button>
            <button class="tab-btn" data-tab="guide" role="tab" aria-selected="false" aria-label="搭乘攻略">
              <span class="tab-icon">${ICONS.compass}</span>
              <span>搭乘攻略</span>
            </button>
            <button class="tab-btn" data-tab="data" role="tab" aria-selected="false" aria-label="關於資料">
              <span class="tab-icon">${ICONS.data}</span>
              <span>關於資料</span>
            </button>
          </nav>

          <!-- Tab Content Panel -->
          <div class="sidebar-content" id="sidebar-tab-content">
            <!-- Dynamic tab content mounts here -->
          </div>
        </aside>

        <!-- Right Map Canvas Container (Full 100% width of remaining space) -->
        <main class="map-canvas-container" id="map-workspace">
          <div id="map"></div>

          <!-- Top-Right Floating Controls -->
          <div class="map-overlay-controls">
            <div id="env-context-widget"></div>
            <button id="btn-reset-map-view" class="btn btn-icon" aria-label="重置地圖視角" title="重置地圖視角 (Fit Tokyo Bay Bounds)">
              ${ICONS.resetView}
            </button>
          </div>

          <!-- Bottom-Right Floating Card Slot -->
          <div class="map-floating-card" id="map-floating-card"></div>
        </main>
      </div>

      <!-- Footer Status Gateway Bar (Leaves Bottom-Right for Leaflet Attribution) -->
      <footer class="status-bar-footer">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="color: var(--emerald-500); font-weight: 600; display: flex; align-items: center; gap: 0.35rem;">
            ${ICONS.check} 官方營運資訊門戶
          </span>
          <span style="opacity: 0.6; font-size: 0.7rem;">最後資料校驗: ${SOURCES.lastUpdated}</span>
        </div>
        <div style="display: flex; gap: 0.85rem; padding-right: 180px;">
          <a href="https://www.suijobus.co.jp/en/today-operation/" target="_blank" rel="noopener" style="color: var(--ocean-300); text-decoration: none; display: flex; align-items: center; gap: 0.25rem;">
            ${ICONS.externalLink} TOKYO CRUISE 官方公告
          </a>
          <a href="https://www.tokyo-park.or.jp/water/bus/" target="_blank" rel="noopener" style="color: #a78bfa; text-decoration: none; display: flex; align-items: center; gap: 0.25rem;">
            ${ICONS.externalLink} 水辺ライン 官方公告
          </a>
        </div>
      </footer>
    </div>
  `;
}
