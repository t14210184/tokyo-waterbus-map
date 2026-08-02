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
              <span class="badge badge-tokyo-cruise" style="font-size: 0.65rem;">v1.0 (RC.3.19)</span>
            </div>
            <div class="brand-subtitle">
              Navigate Tokyo by water — routes, piers, live-status gateway & simulated movement
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div class="status-pill num-tabular" id="status-chip-simulation" title="Simulation status" style="color: #f59e0b;">
            ● 目前無可驗證的模擬航行
          </div>
          <button id="btn-offline-demo" class="btn btn-secondary" aria-label="啟動離線示範" aria-pressed="false" title="開啟概念離線示範動畫" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4);">
            ▶ 啟動離線示範
          </button>
          <button id="btn-theme-toggle" class="btn btn-secondary" aria-label="切換地圖底圖" aria-pressed="false" title="切換深色/淺色/參考資料底圖" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">
            ${ICONS.layers} 切換底圖：深色
          </button>
        </div>
      </header>

      <!-- Offline Demo Disclaimer Banner (Shown only when offline demo is active) -->
      <div id="demo-disclaimer-banner" style="display: none; background: rgba(15, 23, 42, 0.95); border-bottom: 1px solid rgba(56, 189, 248, 0.4); padding: 0.5rem 1rem; font-size: 0.73rem; color: #38bdf8; align-items: center; justify-content: space-between; gap: 1rem;">
        <div>
          <strong>此為離線示範動畫。</strong>不代表即時 GPS、AIS、目前船位、歷史軌跡、班次或可搭乘服務。航線幾何為 approximate-reference，不能用於導航或安全判斷。
        </div>
        <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">
          <button id="btn-reset-demo" class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.7rem;">重設示範</button>
          <button id="btn-stop-demo" class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.7rem; background: #ef4444; color: #fff; border: none;">停止示範</button>
        </div>
      </div>

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
            <button class="tab-btn" data-tab="review" role="tab" aria-selected="false" aria-label="地理審核門戶">
              <span class="tab-icon">${ICONS.compass}</span>
              <span>地理審核</span>
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
