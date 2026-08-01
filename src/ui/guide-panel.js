/**
 * Guide & Trip Planner Panel Renderer for Tokyo Waterbus Atlas (Tab 4) (Phase 4A.1 Emoji Audit)
 * 100% pure SVG vector icons. Zero unicode pictographic emojis.
 */

import { ICONS } from '../assets/icons.js';
import { GUIDES } from '../data/guides.js';
import { renderTripPlanner } from './trip-planner.js';

export function renderGuidePanel(container, onSelectItinerary) {
  if (!container) return;

  container.innerHTML = `
    <div class="guide-panel-wrapper" style="padding: 0.15rem 0;">
      <!-- Section 1: Trip Planner -->
      <div id="trip-planner-container" style="margin-bottom: 1.5rem;"></div>

      <!-- Section 2: Scenario Travel Guides -->
      <div style="border-top: 1px dashed var(--glass-border); padding-top: 1rem;">
        <h3 style="font-size: 1rem; font-weight: 700; color: #ffffff; margin: 0 0 0.85rem 0; display: flex; align-items: center; gap: 0.4rem;">
          ${ICONS.compass} 搭乘攻略與情境指南
        </h3>
        <div class="guides-list">
          ${GUIDES.map(guide => `
            <div class="card guide-card" style="margin-bottom: 0.75rem; padding: 0.8rem;">
              <div class="card-header" style="margin-bottom: 0.35rem;">
                <div>
                  <h4 class="card-title" style="font-size: 0.9rem;">${guide.title.zhHant}</h4>
                  <div class="card-subtitle" style="font-size: 0.7rem;">${guide.title.en}</div>
                </div>
                <span class="badge conf-operator">${guide.tag}</span>
              </div>
              <p class="card-summary" style="font-size: 0.76rem; margin: 0.35rem 0 0 0;">
                ${guide.summary.zhHant}
              </p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  const plannerEl = container.querySelector('#trip-planner-container');
  if (plannerEl) {
    renderTripPlanner(plannerEl, onSelectItinerary);
  }
}
