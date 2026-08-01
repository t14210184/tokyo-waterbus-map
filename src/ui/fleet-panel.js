/**
 * Fleet Operations Panel Renderer for Tokyo Waterbus Atlas (Phase 2B)
 * Accessibility-compliant, zero emoji controls, SVG icons, and visual hierarchy.
 */
import { ICONS } from '../assets/icons.js';
import { atlasStore } from '../core/store.js';
import { getSimulationEngine } from '../core/simulation.js';

export function renderFleetPanel(container, vessels) {
  const engine = getSimulationEngine();
  const state = atlasStore.getState();
  const simState = engine ? engine.getSimulationState() : { isPaused: false, playbackRate: 1 };
  const snapshots = engine ? engine.getAllVesselSnapshots() : [];

  const selectedVesselId = state.simulation.selectedVesselId;
  const followedVesselId = state.simulation.followedVesselId;

  const followedVesselObj = vessels.find(v => v.id === followedVesselId);
  const followedName = followedVesselObj ? (followedVesselObj.displayName || followedVesselObj.name?.zhHant || followedVesselId) : followedVesselId;

  container.innerHTML = `
    <div class="fleet-panel-wrapper" style="padding: 0.15rem 0;">
      <!-- Simulation Controls Header Bar -->
      <div class="card" style="margin-bottom: 0.75rem; padding: 0.75rem; background: var(--surface-dark-elevated); border-color: var(--ocean-500);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.55rem;">
          <h2 style="font-size: 1rem; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 0.4rem;">
            ${ICONS.ship} 船隊運航控制台
          </h2>
          <span class="badge conf-simulated">SIMULATED POSITION</span>
        </div>

        <!-- Play/Pause & Speed Controls -->
        <div style="display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap;">
          <button 
            id="btn-sim-play-pause" 
            class="btn ${simState.isPaused ? 'btn-secondary' : 'btn-primary'}" 
            aria-pressed="${!simState.isPaused}"
            aria-label="${simState.isPaused ? '啟動模擬航行' : '暫停模擬航行'}"
            style="flex: 1.2; min-height: 36px; padding: 0.3rem 0.6rem; font-size: 0.76rem;"
          >
            ${simState.isPaused ? `${ICONS.play} 啟動模擬航行` : `${ICONS.pause} 暫停模擬航行`}
          </button>

          <!-- Speed Segmented Control (radiogroup for accessibility) -->
          <div role="radiogroup" aria-label="模擬航行倍速" style="display: flex; gap: 0.2rem; background: rgba(7, 25, 35, 0.8); padding: 0.2rem; border-radius: var(--border-radius-sm); border: 1px solid var(--glass-border);">
            ${[1, 10, 30, 120].map(rate => `
              <button 
                class="btn btn-speed ${simState.playbackRate === rate ? 'btn-primary' : 'btn-secondary'}" 
                data-rate="${rate}" 
                role="radio"
                aria-checked="${simState.playbackRate === rate}"
                aria-label="${rate}倍速航行"
                style="padding: 0.2rem 0.4rem; font-size: 0.7rem; min-height: 28px;"
              >
                ${rate}x
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Follow Status Indicator -->
        ${followedVesselId ? `
          <div style="margin-top: 0.55rem; background: rgba(143, 108, 255, 0.15); border: 1px solid #8f6cff; padding: 0.4rem 0.65rem; border-radius: 4px; display: flex; align-items: center; justify-content: space-between;">
            <div style="font-size: 0.73rem; color: #a78bfa; font-weight: 600; display: flex; align-items: center; gap: 0.35rem;">
              ${ICONS.camera} 視角跟隨中: ${followedName}
            </div>
            <button id="btn-stop-follow" class="btn btn-secondary" aria-label="取消視角跟隨" style="padding: 0.15rem 0.45rem; font-size: 0.68rem; color: #ffffff;">
              取消跟隨
            </button>
          </div>
        ` : ''}
      </div>

      <!-- Simulation Disclosure Note -->
      <div style="background: rgba(255, 92, 100, 0.1); border-left: 3px solid var(--coral-500); padding: 0.55rem 0.75rem; border-radius: var(--border-radius-sm); font-size: 0.73rem; color: var(--coral-400); margin-bottom: 0.85rem; line-height: 1.4; display: flex; gap: 0.4rem; align-items: flex-start;">
        <span style="flex-shrink: 0; margin-top: 2px;">${ICONS.alert}</span>
        <div>
          <strong>模擬說明:</strong> 所有船位與時間均為瀏覽器端平滑模擬動態，非即時 AIS / GPS 訊號。
        </div>
      </div>

      <!-- Vessel Cards Roster -->
      <div class="vessels-cards-list">
        ${vessels.map(vessel => {
          const snap = snapshots.find(s => s.vesselId === vessel.id) || {
            status: 'cruising',
            speedKph: 22,
            nextPierId: 'hinode',
            etaLabel: '約 5 分鐘 (SIMULATED)',
            routeColor: '#13b9c7',
            routeName: '隅田川線'
          };

          const isSelected = vessel.id === selectedVesselId;
          const isFollowed = vessel.id === followedVesselId;
          const vName = vessel.displayName || vessel.name?.zhHant || vessel.id;

          let statusBadgeClass = 'conf-official';
          let statusText = `${ICONS.ship} 航行中`;
          if (snap.status === 'docked' || snap.status === 'boarding') {
            statusBadgeClass = 'conf-operator';
            statusText = `${ICONS.anchor} 靠港中`;
          } else if (snap.status === 'approaching') {
            statusBadgeClass = 'conf-simulated';
            statusText = `${ICONS.focus} 進港中`;
          }

          return `
            <div class="card vessel-card ${isSelected ? 'focused' : ''}" data-vessel-id="${vessel.id}" style="cursor: pointer; padding: 0.8rem; margin-bottom: 0.65rem;">
              <div class="card-header" style="margin-bottom: 0.3rem;">
                <div style="display: flex; align-items: center; gap: 0.45rem;">
                  <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${snap.routeColor}; box-shadow: 0 0 8px ${snap.routeColor};"></span>
                  <div>
                    <h3 class="card-title" style="font-size: 0.9rem;">${vName}</h3>
                    <div class="card-subtitle" style="font-size: 0.7rem;">${vessel.operator}</div>
                  </div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.2rem;">
                  <span class="badge ${statusBadgeClass}">${statusText}</span>
                  ${isFollowed ? `
                    <span class="badge" style="background: rgba(143, 108, 255, 0.2); color: #a78bfa; border: 1px solid #8f6cff; font-size: 0.65rem;">
                      ${ICONS.camera} 跟隨中
                    </span>
                  ` : ''}
                </div>
              </div>

              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.73rem; color: var(--ocean-200); margin: 0.35rem 0;">
                <span>航線: <strong style="color: ${snap.routeColor};">${snap.routeName}</strong></span>
                <span>航速: <strong>${snap.speedKph} km/h</strong></span>
              </div>

              <div style="font-size: 0.72rem; color: var(--ocean-300); margin-bottom: 0.45rem; display: flex; align-items: center; gap: 0.3rem;">
                <span>${ICONS.clock}</span>
                <span>下一站預估: <strong>${snap.etaLabel}</strong></span>
              </div>

              <!-- Action Buttons -->
              <div style="display: flex; gap: 0.35rem; margin-top: 0.45rem;">
                <button class="btn ${isSelected ? 'btn-secondary' : 'btn-primary'} btn-select-vessel" data-vessel-id="${vessel.id}" aria-label="在地圖標記選取 ${vName}" style="flex: 1; font-size: 0.73rem; min-height: 34px; padding: 0.25rem 0.4rem;">
                  ${ICONS.focus} ${isSelected ? '已選取' : '地圖選取'}
                </button>
                <button class="btn ${isFollowed ? 'btn-primary' : 'btn-secondary'} btn-toggle-follow" data-vessel-id="${vessel.id}" aria-label="視角跟隨 ${vName}" style="flex: 1; font-size: 0.73rem; min-height: 34px; padding: 0.25rem 0.4rem;">
                  ${ICONS.camera} ${isFollowed ? '停止跟隨' : '視角跟隨'}
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Attach Event Listeners
  const playPauseBtn = container.querySelector('#btn-sim-play-pause');
  if (playPauseBtn && engine) {
    playPauseBtn.addEventListener('click', () => {
      const nextState = !simState.isPaused;
      engine.setPaused(nextState);
      atlasStore.setState({
        simulation: { ...atlasStore.getState().simulation, isPaused: nextState }
      });
      renderFleetPanel(container, vessels);
    });
  }

  container.querySelectorAll('.btn-speed').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const rate = Number(e.currentTarget.getAttribute('data-rate'));
      if (engine) engine.setPlaybackRate(rate);
      atlasStore.setState({
        simulation: { ...atlasStore.getState().simulation, playbackRate: rate }
      });
      renderFleetPanel(container, vessels);
    });
  });

  const stopFollowBtn = container.querySelector('#btn-stop-follow');
  if (stopFollowBtn) {
    stopFollowBtn.addEventListener('click', () => {
      atlasStore.setState({
        simulation: { ...atlasStore.getState().simulation, followedVesselId: null }
      });
      renderFleetPanel(container, vessels);
    });
  }

  container.querySelectorAll('.vessel-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      const vesselId = e.currentTarget.getAttribute('data-vessel-id');
      atlasStore.setState({
        simulation: { ...atlasStore.getState().simulation, selectedVesselId: vesselId }
      });
      renderFleetPanel(container, vessels);
    });
  });

  container.querySelectorAll('.btn-select-vessel').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const vesselId = e.currentTarget.getAttribute('data-vessel-id');
      atlasStore.setState({
        simulation: { ...atlasStore.getState().simulation, selectedVesselId: vesselId }
      });
      renderFleetPanel(container, vessels);
    });
  });

  container.querySelectorAll('.btn-toggle-follow').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const vesselId = e.currentTarget.getAttribute('data-vessel-id');
      const currentFollowed = atlasStore.getState().simulation.followedVesselId;
      const nextFollowed = currentFollowed === vesselId ? null : vesselId;
      atlasStore.setState({
        simulation: { ...atlasStore.getState().simulation, followedVesselId: nextFollowed, selectedVesselId: vesselId }
      });
      renderFleetPanel(container, vessels);
    });
  });
}
