/**
 * Trip Planner Component for Tokyo Waterbus Atlas (Phase 4A.3 Display Integrity Audit)
 * 100% pure SVG vector icons. Uses displayComboboxLabel to guarantee zero user-facing 'undefined'.
 */

import { ICONS } from '../assets/icons.js';
import { PIERS } from '../data/piers.js';
import { getRouteEngine } from '../core/route-engine.js';
import { renderItineraryResults } from './itinerary-results.js';
import { atlasStore } from '../core/store.js';
import { displayComboboxLabel } from '../core/itinerary-formatters.js';

export function renderTripPlanner(container, onSelectItinerary) {
  if (!container) return;

  const plannerState = atlasStore.getState().planner;
  let originPierId = plannerState.originPierId || '';
  let destinationPierId = plannerState.destinationPierId || '';
  let preference = plannerState.preference || 'fastest';
  let itineraries = plannerState.itineraries || [];
  let selectedItineraryId = plannerState.selectedItineraryId;

  function render() {
    const isSamePier = originPierId && destinationPierId && originPierId === destinationPierId;
    const canPlan = originPierId && destinationPierId && !isSamePier;

    container.innerHTML = `
      <div class="trip-planner-wrapper" style="padding: 0.15rem 0;">
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.65rem;">
          <h2 style="font-size: 1.05rem; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 0.4rem;">
            ${ICONS.compass} 規劃水上航程
          </h2>
          <span class="badge conf-official">PLANNING REFERENCE</span>
        </div>

        <div style="font-size: 0.73rem; color: var(--ink-400); margin-bottom: 0.75rem;">
          非即時船班、非訂位服務。選擇起訖碼頭即可查看可行水路規劃。
        </div>

        <!-- Origin / Destination Selectors & Swap Button -->
        <div style="background: var(--surface-dark-elevated); border: 1px solid var(--glass-border); padding: 0.85rem; border-radius: var(--border-radius-md); margin-bottom: 0.85rem; position: relative;">
          <!-- Origin Pier Selector -->
          <div style="margin-bottom: 0.6rem;">
            <label for="select-origin-pier" style="display: flex; align-items: center; gap: 0.3rem; font-size: 0.73rem; font-weight: 600; color: var(--ocean-300); margin-bottom: 0.25rem;">
              ${ICONS.origin} 出發碼頭 (ORIGIN)
            </label>
            <select id="select-origin-pier" class="search-input" aria-label="選擇出發碼頭" style="font-size: 0.8rem; min-height: 38px;">
              <option value="">-- 請選擇出發碼頭 --</option>
              ${PIERS.map(p => `
                <option value="${p.id}" ${p.id === originPierId ? 'selected' : ''}>
                  ${displayComboboxLabel(p)}
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Swap Button -->
          <div style="display: flex; justify-content: center; margin: -0.2rem 0;">
            <button id="btn-swap-piers" class="btn btn-secondary" aria-label="交換出發與抵達碼頭" title="交換出發與抵達碼頭" style="min-height: 30px; padding: 0.2rem 0.6rem; font-size: 0.7rem; border-radius: 15px;">
              ${ICONS.resetView} 上下對調
            </button>
          </div>

          <!-- Destination Pier Selector -->
          <div style="margin-top: 0.4rem;">
            <label for="select-dest-pier" style="display: flex; align-items: center; gap: 0.3rem; font-size: 0.73rem; font-weight: 600; color: var(--coral-400); margin-bottom: 0.25rem;">
              ${ICONS.destination} 抵達碼頭 (DESTINATION)
            </label>
            <select id="select-dest-pier" class="search-input" aria-label="選擇抵達碼頭" style="font-size: 0.8rem; min-height: 38px;">
              <option value="">-- 請選擇抵達碼頭 --</option>
              ${PIERS.map(p => `
                <option value="${p.id}" ${p.id === destinationPierId ? 'selected' : ''}>
                  ${displayComboboxLabel(p)}
                </option>
              `).join('')}
            </select>
          </div>

          ${isSamePier ? `
            <div style="font-size: 0.72rem; color: #ff5c64; margin-top: 0.5rem; background: rgba(255, 92, 100, 0.1); padding: 0.35rem 0.55rem; border-radius: 4px; display: flex; align-items: center; gap: 0.3rem;">
              ${ICONS.alert} 出發與抵達碼頭相同，請選擇不同碼頭。
            </div>
          ` : ''}
        </div>

        <!-- Preference Segmented Radiogroup -->
        <div style="margin-bottom: 0.85rem;">
          <div style="font-size: 0.73rem; font-weight: 600; color: var(--ocean-200); margin-bottom: 0.3rem;">
            規劃偏好 (PREFERENCE)
          </div>
          <div role="radiogroup" aria-label="航程規劃偏好" style="display: flex; gap: 0.35rem;">
            <button class="btn ${preference === 'fastest' ? 'btn-primary' : 'btn-secondary'} btn-pref" data-pref="fastest" role="radio" aria-checked="${preference === 'fastest'}" style="flex: 1; font-size: 0.73rem; min-height: 34px; padding: 0.2rem 0.4rem;">
              最快
            </button>
            <button class="btn ${preference === 'fewest-transfers' ? 'btn-primary' : 'btn-secondary'} btn-pref" data-pref="fewest-transfers" role="radio" aria-checked="${preference === 'fewest-transfers'}" style="flex: 1; font-size: 0.73rem; min-height: 34px; padding: 0.2rem 0.4rem;">
              最少轉乘
            </button>
            <button class="btn ${preference === 'scenic' ? 'btn-primary' : 'btn-secondary'} btn-pref" data-pref="scenic" role="radio" aria-checked="${preference === 'scenic'}" style="flex: 1; font-size: 0.73rem; min-height: 34px; padding: 0.2rem 0.4rem;">
              景觀優先
            </button>
          </div>
        </div>

        <!-- Submit Button -->
        <button id="btn-submit-plan" class="btn btn-primary" aria-label="規劃航程" ${!canPlan ? 'disabled' : ''} style="width: 100%; min-height: 42px; font-size: 0.85rem; margin-bottom: 1rem;">
          ${ICONS.map} 規劃水上航程
        </button>

        <!-- Candidate Results Container -->
        <div id="planner-results-container"></div>
      </div>
    `;

    // Render Candidate Results if available
    const resultsEl = container.querySelector('#planner-results-container');
    if (resultsEl && itineraries && itineraries.length > 0) {
      renderItineraryResults(resultsEl, itineraries, selectedItineraryId, (it) => {
        selectedItineraryId = it.id;
        atlasStore.setState({
          planner: { ...atlasStore.getState().planner, selectedItineraryId: it.id }
        });
        if (onSelectItinerary) onSelectItinerary(it);
        render();
      });
    }

    // Attach Event Listeners
    const originSelect = container.querySelector('#select-origin-pier');
    if (originSelect) {
      originSelect.addEventListener('change', (e) => {
        originPierId = e.target.value;
        atlasStore.setState({
          planner: { ...atlasStore.getState().planner, originPierId }
        });
        render();
      });
    }

    const destSelect = container.querySelector('#select-dest-pier');
    if (destSelect) {
      destSelect.addEventListener('change', (e) => {
        destinationPierId = e.target.value;
        atlasStore.setState({
          planner: { ...atlasStore.getState().planner, destinationPierId }
        });
        render();
      });
    }

    const swapBtn = container.querySelector('#btn-swap-piers');
    if (swapBtn) {
      swapBtn.addEventListener('click', () => {
        const temp = originPierId;
        originPierId = destinationPierId;
        destinationPierId = temp;
        atlasStore.setState({
          planner: { ...atlasStore.getState().planner, originPierId, destinationPierId }
        });
        render();
      });
    }

    container.querySelectorAll('.btn-pref').forEach(btn => {
      btn.addEventListener('click', (e) => {
        preference = e.currentTarget.getAttribute('data-pref');
        atlasStore.setState({
          planner: { ...atlasStore.getState().planner, preference }
        });
        render();
      });
    });

    const submitBtn = container.querySelector('#btn-submit-plan');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        if (!canPlan) return;
        const engine = getRouteEngine();
        const res = engine.findItineraries({
          originPierId,
          destinationPierId,
          preference,
          maxResults: 3
        });

        itineraries = res.itineraries || [];
        selectedItineraryId = itineraries[0] ? itineraries[0].id : null;

        atlasStore.setState({
          planner: {
            ...atlasStore.getState().planner,
            itineraries,
            selectedItineraryId,
            isCalculating: false
          }
        });

        if (window.__atlasDebug) {
          window.__atlasDebug.plannerStatus = 'results';
          window.__atlasDebug.itineraryCount = itineraries.length;
          window.__atlasDebug.selectedItineraryId = selectedItineraryId;
        }

        render();

        if (itineraries[0] && onSelectItinerary) {
          onSelectItinerary(itineraries[0]);
        }
      });
    }
  }

  render();
}
