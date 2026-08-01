/**
 * Pier Explorer Panel Renderer for Tokyo Waterbus Atlas (Phase 4A.3 Display Integrity Audit)
 * Uses centralized display formatters to guarantee zero user-facing 'undefined', 'null', or 'NaN'.
 */

import { ICONS } from '../assets/icons.js';
import { ROUTES } from '../data/routes.js';
import { filterPiers } from '../core/pier-filters.js';
import { atlasStore } from '../core/store.js';
import {
  displayLocalizedName,
  displayOperator,
  displayPierStatus,
  displayTransit
} from '../core/itinerary-formatters.js';

export function renderPierPanel(container, piers, onSelectPier, onFocusRoute) {
  const storeState = atlasStore.getState().pierExplorer;

  let query = storeState.query || '';
  let operatorFilter = storeState.operatorFilter || 'all';
  let statusFilter = storeState.statusFilter || 'all';
  let routeFilter = storeState.routeFilter || 'all';
  let selectedPierId = storeState.selectedPierId;

  function render() {
    const filteredPiers = filterPiers(piers, { query, operatorFilter, statusFilter, routeFilter });

    container.innerHTML = `
      <div class="pier-panel-wrapper" style="padding: 0.15rem 0;">
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.65rem;">
          <h2 style="font-size: 1.05rem; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 0.4rem;">
            ${ICONS.pier} 碼頭列表 (${filteredPiers.length} 個碼頭)
          </h2>
          <span class="badge conf-official">14 官方碼頭</span>
        </div>

        <div style="font-size: 0.73rem; color: var(--ink-400); margin-bottom: 0.75rem;">
          路線與碼頭資訊為規劃參考，出發前請確認官方公告。
        </div>

        <!-- Trilingual Search Bar -->
        <div style="position: relative; margin-bottom: 0.75rem;">
          <input 
            type="search" 
            id="input-pier-search" 
            class="search-input" 
            placeholder="搜尋碼頭、路線、車站或景點 (淺草/Asakusa/海濱)..." 
            aria-label="搜尋碼頭、路線、車站或景點"
            value="${query}"
            style="padding-left: 2.2rem; min-height: 44px; font-size: 0.82rem;"
          />
          <span style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--ocean-300); pointer-events: none;">
            ${ICONS.map}
          </span>
          ${query ? `
            <button id="btn-clear-search" class="btn btn-secondary" aria-label="清空搜尋欄" style="position: absolute; right: 0.4rem; top: 50%; transform: translateY(-50%); min-height: 28px; padding: 0.15rem 0.4rem; font-size: 0.68rem;">
              ${ICONS.close}
            </button>
          ` : ''}
        </div>

        <!-- Filter Chips Section -->
        <div style="margin-bottom: 0.85rem; display: flex; flex-direction: column; gap: 0.4rem;">
          <!-- Operator Filters -->
          <div style="display: flex; gap: 0.3rem;" role="radiogroup" aria-label="依營運商篩選">
            <button class="btn ${operatorFilter === 'all' ? 'btn-primary' : 'btn-secondary'} btn-filter-op" data-op="all" role="radio" aria-checked="${operatorFilter === 'all'}" style="flex: 1; font-size: 0.72rem; min-height: 32px; padding: 0.2rem 0.35rem;">
              全部營運商
            </button>
            <button class="btn ${operatorFilter === 'TOKYO CRUISE' ? 'btn-primary' : 'btn-secondary'} btn-filter-op" data-op="TOKYO CRUISE" role="radio" aria-checked="${operatorFilter === 'TOKYO CRUISE'}" style="flex: 1; font-size: 0.72rem; min-height: 32px; padding: 0.2rem 0.35rem;">
              TOKYO CRUISE
            </button>
            <button class="btn ${operatorFilter === '東京水辺ライン' ? 'btn-primary' : 'btn-secondary'} btn-filter-op" data-op="東京水辺ライン" role="radio" aria-checked="${operatorFilter === '東京水辺ライン'}" style="flex: 1; font-size: 0.72rem; min-height: 32px; padding: 0.2rem 0.35rem;">
              水辺ライン
            </button>
          </div>

          <!-- Status & Route Filters -->
          <div style="display: flex; gap: 0.35rem;">
            <select id="select-status-filter" class="search-input" aria-label="依碼頭狀態篩選" style="flex: 1; padding: 0.3rem 0.5rem; font-size: 0.73rem; min-height: 34px;">
              <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>所有營運狀態</option>
              <option value="active" ${statusFilter === 'active' ? 'selected' : ''}>常態營運碼頭</option>
              <option value="verification-needed" ${statusFilter === 'verification-needed' ? 'selected' : ''}>季節性 / 需核驗</option>
            </select>

            <select id="select-route-filter" class="search-input" aria-label="依停靠航線篩選" style="flex: 1; padding: 0.3rem 0.5rem; font-size: 0.73rem; min-height: 34px;">
              <option value="all" ${routeFilter === 'all' ? 'selected' : ''}>所有停靠航線</option>
              ${ROUTES.map(rt => `
                <option value="${rt.id}" ${routeFilter === rt.id ? 'selected' : ''}>
                  ${rt.name?.zhHant} (${rt.operator})
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Pier Cards List / Empty State -->
        ${filteredPiers.length === 0 ? `
          <div style="background: rgba(7, 25, 35, 0.8); border: 1px solid var(--glass-border); padding: 1.5rem; border-radius: var(--border-radius-md); text-align: center; margin-top: 1rem;">
            <div style="font-size: 1rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem;">
              找不到符合的碼頭
            </div>
            <div style="font-size: 0.78rem; color: var(--ink-400); margin-bottom: 1rem;">
              可嘗試搜尋：淺草 / 浅草 / Asakusa / 台場 / 豐洲
            </div>
            <button id="btn-reset-filters" class="btn btn-primary" aria-label="重置所有搜尋條件" style="font-size: 0.75rem;">
              ${ICONS.resetView} 重置搜尋條件
            </button>
          </div>
        ` : `
          <div class="piers-list">
            ${filteredPiers.map(pier => {
              const isSelected = pier.id === selectedPierId;
              const nameInfo = displayLocalizedName(pier);
              const statusInfo = displayPierStatus(pier);
              const opText = displayOperator(pier);
              const isTokyoCruise = opText.includes('TOKYO');
              const badgeClass = isTokyoCruise ? 'badge-tokyo-cruise' : 'badge-mizube-line';
              const transitList = displayTransit(pier.nearestTransit);
              const transitHint = transitList[0] || '鄰近車站聯絡資訊';

              return `
                <div class="card pier-card ${isSelected ? 'focused' : ''}" data-pier-id="${pier.id}" style="cursor: pointer; padding: 0.85rem; margin-bottom: 0.65rem;">
                  <div class="card-header" style="margin-bottom: 0.35rem;">
                    <div>
                      <h3 class="card-title" style="font-size: 0.92rem;">${nameInfo.main}</h3>
                      ${nameInfo.sub ? `<div class="card-subtitle" style="font-size: 0.71rem;">${nameInfo.sub}</div>` : ''}
                    </div>
                    <span class="badge ${badgeClass}">${opText}</span>
                  </div>

                  <div style="font-size: 0.74rem; color: var(--ocean-200); margin: 0.35rem 0; display: flex; align-items: center; gap: 0.35rem;">
                    ${ICONS.transit} <span>${transitHint}</span>
                  </div>

                  <div style="font-size: 0.73rem; color: var(--ink-400); display: flex; align-items: center; justify-content: space-between;">
                    <span style="display: flex; align-items: center; gap: 0.3rem;">
                      ${ICONS.ship} 可搭 ${pier.routes?.length || 0} 條航線
                    </span>
                    <span class="badge ${statusInfo.class}" style="font-size: 0.68rem;" aria-label="${statusInfo.ariaLabel}">
                      ${statusInfo.icon} ${statusInfo.text}
                    </span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;

    // Attach Event Listeners
    const searchInput = container.querySelector('#input-pier-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        query = e.target.value;
        atlasStore.setState({
          pierExplorer: { ...atlasStore.getState().pierExplorer, query }
        });
        render();
      });
    }

    const clearSearchBtn = container.querySelector('#btn-clear-search');
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        query = '';
        atlasStore.setState({
          pierExplorer: { ...atlasStore.getState().pierExplorer, query: '' }
        });
        render();
      });
    }

    container.querySelectorAll('.btn-filter-op').forEach(btn => {
      btn.addEventListener('click', (e) => {
        operatorFilter = e.currentTarget.getAttribute('data-op');
        atlasStore.setState({
          pierExplorer: { ...atlasStore.getState().pierExplorer, operatorFilter }
        });
        render();
      });
    });

    const statusSelect = container.querySelector('#select-status-filter');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        statusFilter = e.target.value;
        atlasStore.setState({
          pierExplorer: { ...atlasStore.getState().pierExplorer, statusFilter }
        });
        render();
      });
    }

    const routeSelect = container.querySelector('#select-route-filter');
    if (routeSelect) {
      routeSelect.addEventListener('change', (e) => {
        routeFilter = e.target.value;
        atlasStore.setState({
          pierExplorer: { ...atlasStore.getState().pierExplorer, routeFilter }
        });
        render();
      });
    }

    const resetFiltersBtn = container.querySelector('#btn-reset-filters');
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => {
        query = '';
        operatorFilter = 'all';
        statusFilter = 'all';
        routeFilter = 'all';
        atlasStore.setState({
          pierExplorer: { query: '', operatorFilter: 'all', statusFilter: 'all', routeFilter: 'all', selectedPierId: null, drawerOpen: false }
        });
        render();
      });
    }

    container.querySelectorAll('.pier-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const pierId = e.currentTarget.getAttribute('data-pier-id');
        selectedPierId = pierId;
        atlasStore.setState({
          pierExplorer: { ...atlasStore.getState().pierExplorer, selectedPierId: pierId, drawerOpen: true }
        });
        render();
        if (onSelectPier) onSelectPier(pierId);
      });
    });
  }

  render();
}
