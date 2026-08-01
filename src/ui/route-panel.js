/**
 * Route Panel UI Renderer for Tokyo Waterbus Atlas (Tab 1)
 */
import { ICONS } from '../assets/icons.js';

export function renderRoutePanel(container, routes, activeFocusRouteId, onFocusRoute, onExitFocus) {
  let filterOperator = 'all';

  function render() {
    const filteredRoutes = routes.filter(r => {
      if (filterOperator === 'TOKYO CRUISE') return r.operator === 'TOKYO CRKYO' || r.operator === 'TOKYO CRUISE';
      if (filterOperator === '東京水辺ライン') return r.operator === '東京水辺ライン';
      return true;
    });

    const activeRoute = routes.find(r => r.id === activeFocusRouteId);

    container.innerHTML = `
      <div class="route-panel-header" style="margin-bottom: 0.85rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.65rem;">
          <h2 style="font-size: 1.05rem; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 0.4rem;">
            ${ICONS.map} 水上巴士航線 (${routes.length} 條)
          </h2>
          ${activeFocusRouteId ? `
            <button id="btn-exit-focus" class="btn btn-secondary" aria-label="退出聚焦模式" style="padding: 0.3rem 0.6rem; font-size: 0.72rem; color: var(--coral-400); border-color: rgba(255, 92, 100, 0.4);">
              ${ICONS.close} 退出 Focus
            </button>
          ` : ''}
        </div>

        ${activeRoute ? `
          <div style="background: rgba(19, 185, 199, 0.12); border: 1px solid var(--ocean-500); padding: 0.65rem 0.85rem; border-radius: var(--border-radius-sm); margin-bottom: 0.85rem; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-size: 0.7rem; color: var(--ocean-300); text-transform: uppercase; font-weight: 600;">聚焦模式中 (FOCUS MODE)</div>
              <div style="font-size: 0.92rem; font-weight: 700; color: #ffffff;">${activeRoute.name.zhHant}</div>
            </div>
            <span class="badge ${activeRoute.operator.includes('TOKYO') ? 'badge-tokyo-cruise' : 'badge-mizube-line'}">
              ${activeRoute.operator}
            </span>
          </div>
        ` : ''}

        <!-- Operator Filter Pills -->
        <div style="display: flex; gap: 0.35rem; margin-bottom: 0.75rem;" role="radiogroup" aria-label="依營運商篩選航線">
          <button class="btn ${filterOperator === 'all' ? 'btn-primary' : 'btn-secondary'} btn-filter" data-op="all" role="radio" aria-checked="${filterOperator === 'all'}" style="flex: 1; font-size: 0.73rem; min-height: 32px; padding: 0.2rem 0.4rem;">
            全部航線
          </button>
          <button class="btn ${filterOperator === 'TOKYO CRUISE' ? 'btn-primary' : 'btn-secondary'} btn-filter" data-op="TOKYO CRUISE" role="radio" aria-checked="${filterOperator === 'TOKYO CRUISE'}" style="flex: 1; font-size: 0.73rem; min-height: 32px; padding: 0.2rem 0.4rem;">
            TOKYO CRUISE
          </button>
          <button class="btn ${filterOperator === '東京水辺ライン' ? 'btn-primary' : 'btn-secondary'} btn-filter" data-op="東京水辺ライン" role="radio" aria-checked="${filterOperator === '東京水辺ライン'}" style="flex: 1; font-size: 0.73rem; min-height: 32px; padding: 0.2rem 0.4rem;">
            東京水辺ライン
          </button>
        </div>
      </div>

      <!-- Route Cards List -->
      <div class="route-cards-list">
        ${filteredRoutes.map(route => {
          const isFocused = route.id === activeFocusRouteId;
          const isTokyoCruise = route.operator.includes('TOKYO');
          const badgeClass = isTokyoCruise ? 'badge-tokyo-cruise' : 'badge-mizube-line';
          const summaryText = route.description?.zhHant || route.summary?.zhHant || '';

          return `
            <div class="card route-card ${isFocused ? 'focused' : ''}" data-route-id="${route.id}">
              <!-- Row 1: Identity & Color accent -->
              <div class="card-header">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${route.color}; box-shadow: 0 0 8px ${route.color};"></span>
                  <div>
                    <h3 class="card-title">${route.name.zhHant} (${route.name.ja})</h3>
                    <div class="card-subtitle">${route.name.en}</div>
                  </div>
                </div>
                <span class="badge ${badgeClass}">${route.operator}</span>
              </div>

              <!-- Row 2: Metadata Pills -->
              <div style="display: flex; align-items: center; gap: 0.5rem; margin: 0.45rem 0; flex-wrap: wrap;">
                <span style="font-size: 0.73rem; color: var(--ocean-200); background: rgba(19, 185, 199, 0.1); padding: 0.15rem 0.45rem; border-radius: 4px; border: 1px solid rgba(19, 185, 199, 0.2); display: inline-flex; align-items: center; gap: 0.25rem;">
                  ${ICONS.clock} 約 ${route.approxDurationMinutes}
                </span>
                <span class="badge ${route.dataConfidence?.duration === 'official-reference' ? 'conf-official' : 'conf-operator'}">
                  ${route.dataConfidence?.duration === 'official-reference' ? '官方基準' : '業者公佈'}
                </span>
                <span style="font-size: 0.72rem; color: var(--ink-400); display: inline-flex; align-items: center; gap: 0.25rem;">
                  ${ICONS.pier} 停靠 ${route.piers.length} 碼頭
                </span>
              </div>

              <!-- Row 3: Clamped Summary -->
              <p class="card-summary">
                ${summaryText}
              </p>

              <!-- Row 4: Action Buttons (Min-height 40px touch target) -->
              <div style="display: flex; gap: 0.5rem; margin-top: 0.6rem;">
                <button class="btn ${isFocused ? 'btn-secondary' : 'btn-primary'} btn-focus-route" data-route-id="${route.id}" aria-label="在地圖聚焦 ${route.name.zhHant}" style="flex: 2;">
                  ${ICONS.focus} ${isFocused ? '聚焦中' : '在地圖聚焦航線'}
                </button>
                <a href="${route.sourceUrl}" target="_blank" rel="noopener" class="btn btn-secondary" style="flex: 1; text-decoration: none;" aria-label="前往 ${route.operator} 官方網頁" title="前往 ${route.operator} 官方網頁">
                  ${ICONS.externalLink} 官方
                </a>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Attach Event Listeners
    container.querySelectorAll('.btn-filter').forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterOperator = e.currentTarget.getAttribute('data-op');
        render();
      });
    });

    container.querySelectorAll('.btn-focus-route').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const routeId = e.currentTarget.getAttribute('data-route-id');
        if (onFocusRoute) onFocusRoute(routeId);
      });
    });

    const exitBtn = container.querySelector('#btn-exit-focus');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        if (onExitFocus) onExitFocus();
      });
    }
  }

  render();
}
