/**
 * Tokyo Waterbus Atlas - Main Application Entry (Phase 4B v1.0.0-RC.1)
 * Uses centralized display formatters, pure vector SVG icons, single-sheet panel state machine,
 * and high-resolution Navigation Timing instrumentation for canonical performance auditing.
 */

// Import Styles
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/map.css';
import './styles/responsive.css';

// Import Core Data & Modules
import { ROUTES } from './data/routes.js';
import { PIERS } from './data/piers.js';
import { VESSELS } from './data/vessels.js';
import { SOURCES } from './data/sources.js';
import { MAP_DEFAULTS } from './core/constants.js';
import { loadLeafletResiliently, renderMapFallbackUI } from './core/load-leaflet.js';
import { atlasStore } from './core/store.js';
import { createSimulationEngine } from './core/simulation.js';
import { getRouteEngine } from './core/route-engine.js';
import { ICONS } from './assets/icons.js';
import { displayText } from './core/itinerary-formatters.js';

// Import UI & Map Modules
import { initI18n, subscribeI18n } from './i18n/index.js';
import { createUIShell } from './ui/shell.js';
import { createWaterbusMap } from './map/create-map.js';
import { setupRouteLayers } from './map/route-layers.js';
import { setupPierMarkers } from './map/pier-markers.js';
import { setupVesselMarkers } from './map/vessel-markers.js';
import { setupItineraryLayers } from './map/itinerary-layers.js';
import { createMapCamera } from './map/map-camera.js';
import { renderRoutePanel } from './ui/route-panel.js';
import { renderFleetPanel } from './ui/fleet-panel.js';
import { renderPierPanel } from './ui/pier-panel.js';
import { renderPierDetailDrawer } from './ui/pier-detail-drawer.js';
import { renderGuidePanel } from './ui/guide-panel.js';
import { renderEnvironmentPanel } from './ui/environment-panel.js';
import { renderReviewPortalPanel } from './ui/review-portal-panel.js';

const appNavStartTime = performance.now();

// Initialize Global Debug Object for Verification
window.__atlasDebug = {
  appStatus: 'booting',
  mapStatus: 'loading',
  simulationStatus: 'idle',
  playbackRate: 1,
  vesselMarkerCount: 0,
  selectedVesselId: null,
  followedVesselId: null,
  selectedPierId: null,
  pierDrawerOpen: false,
  plannerStatus: 'idle',
  plannerOriginPierId: null,
  plannerDestinationPierId: null,
  plannerPreference: 'fastest',
  itineraryCount: 0,
  selectedItineraryId: null,
  itineraryLayerStatus: 'idle',
  routeGraph: { nodeCount: 0, edgeCount: 0, transferEdgeCount: 0 },
  simulationTickCount: 0,
  renderedRouteCards: 0,
  renderedPierMarkers: 0,
  lastError: null,
  plannerLastError: null,
  lastSimulationError: null,
  timings: {
    shellInteractiveMs: null,
    appReadyMs: null,
    mapReadyMs: null
  }
};

let activeFocusRouteId = null;
let mapInstance = null;
let routeLayersHandler = null;
let pierMarkersHandler = null;
let vesselMarkersHandler = null;
let itineraryLayersHandler = null;
let mapCameraHandler = null;
let simEngine = null;
let routeEngine = null;

async function initApp() {
  const appContainer = document.getElementById('app');
  if (!appContainer) {
    window.__atlasDebug.appStatus = 'error';
    window.__atlasDebug.lastError = 'Missing #app element in DOM';
    return;
  }

  appContainer.dataset.appState = 'booting';

  try {
    // 0. Initialize i18n Core Engine
    initI18n();

    // 1. Build Shell UI Structure
    createUIShell(appContainer);

    // 2. Setup Navigation Tabs & Resize Listeners
    setupTabNavigation();
    setupResizeListeners();

    // Subscribe to i18n locale updates
    subscribeI18n(() => {
      createUIShell(appContainer);
      setupTabNavigation();
      renderActiveTab();
    });

    // 3. Initialize Route Engine Graph
    initRouteGraphEngine();

    // 4. Render Initial Tab 1 (Routes) & Ambient Environment Context
    renderActiveTab();
    const envWidgetEl = document.getElementById('env-context-widget');
    if (envWidgetEl) renderEnvironmentPanel(envWidgetEl);

    // Record Shell Interactive Timing
    window.__atlasDebug.timings.shellInteractiveMs = Math.round(performance.now() - appNavStartTime);

    // Update rendered route cards count
    const cardElements = document.querySelectorAll('.route-card');
    window.__atlasDebug.renderedRouteCards = cardElements.length;

    // 5. Initialize Core Simulation Engine
    initSimulationEngine();

    // 6. Setup Store Subscriptions
    setupStoreSubscriptions();

    // 7. Resiliently Load Leaflet CDN & Map Rendering
    await initMapEngine();

  } catch (err) {
    console.error('[App] Initialization failure:', err);
    window.__atlasDebug.appStatus = 'error';
    window.__atlasDebug.lastError = err.message || String(err);
    appContainer.dataset.appState = 'error';
    
    appContainer.innerHTML = `
      <div style="width: 100vw; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #071923; color: #ffffff; font-family: sans-serif; padding: 2rem; text-align: center;">
        <h2 style="color: #ff5c64; margin-bottom: 1rem;">Tokyo Waterbus Atlas 載入發生異常</h2>
        <p style="color: #7b9eb3; max-width: 500px; margin-bottom: 1.5rem;">${displayText(err.message || err)}</p>
        <button onclick="window.location.reload()" style="padding: 0.6rem 1.2rem; background: #13b9c7; color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
          重新嘗試載入頁面
        </button>
      </div>
    `;
  }
}

function initRouteGraphEngine() {
  try {
    routeEngine = getRouteEngine();
    const diag = routeEngine.getGraphDiagnostics();
    window.__atlasDebug.routeGraph = diag;
    window.__atlasDebug.plannerStatus = 'ready';
  } catch (err) {
    console.error('[RouteEngine] Graph build error:', err);
    window.__atlasDebug.plannerStatus = 'error';
    window.__atlasDebug.plannerLastError = err.message || String(err);
  }
}

function setupStoreSubscriptions() {
  atlasStore.subscribe(state => state.pierExplorer.selectedPierId, (selectedPierId) => {
    if (window.__atlasDebug) window.__atlasDebug.selectedPierId = selectedPierId;
    if (pierMarkersHandler && selectedPierId) {
      pierMarkersHandler.highlightPier(selectedPierId);
    }
  });

  atlasStore.subscribe(state => state.pierExplorer.drawerOpen, (drawerOpen) => {
    if (window.__atlasDebug) window.__atlasDebug.pierDrawerOpen = drawerOpen;
    const drawerContainer = document.getElementById('map-floating-card');
    const selectedPierId = atlasStore.getState().pierExplorer.selectedPierId;
    const pier = PIERS.find(p => p.id === selectedPierId);

    if (drawerOpen && pier && drawerContainer) {
      atlasStore.setState({
        simulation: { ...atlasStore.getState().simulation, followedVesselId: null },
        ui: { ...atlasStore.getState().ui, pierDrawerOpen: true, mobileSheetMode: 'pier' }
      });

      renderPierDetailDrawer(
        drawerContainer,
        pier,
        () => handleClosePierDrawer(),
        (pId) => handleFocusPierOnMap(pId),
        (rId) => handleRouteFocusFromDrawer(rId),
        (type, pId) => handlePrefillPlanner(type, pId)
      );
    } else if (drawerContainer) {
      drawerContainer.innerHTML = '';
    }

    if (mapInstance) {
      mapInstance.invalidateSize({ animate: false });
    }
  });

  atlasStore.subscribe(state => state.planner.selectedItineraryId, (selectedItineraryId) => {
    if (window.__atlasDebug) window.__atlasDebug.selectedItineraryId = selectedItineraryId;
    const itineraries = atlasStore.getState().planner.itineraries || [];
    const selectedItinerary = itineraries.find(i => i.id === selectedItineraryId);

    if (itineraryLayersHandler && selectedItinerary) {
      atlasStore.setState({
        simulation: { ...atlasStore.getState().simulation, followedVesselId: null }
      });

      itineraryLayersHandler.showItinerary(selectedItinerary);
      if (window.__atlasDebug) window.__atlasDebug.itineraryLayerStatus = 'active';
    }
  });
}

function initSimulationEngine() {
  try {
    simEngine = createSimulationEngine({
      isPaused: false,
      playbackRate: 1
    });

    window.__atlasDebug.simulationStatus = 'running';
    window.__atlasDebug.vesselMarkerCount = 0;

    updateStatusChip();

    atlasStore.subscribe(state => state.simulation.isPaused, (isPaused) => {
      if (simEngine) simEngine.setPaused(isPaused);
      updateStatusChip();
    });

    atlasStore.subscribe(state => state.simulation.playbackRate, (rate) => {
      if (simEngine) simEngine.setPlaybackRate(rate);
      if (window.__atlasDebug) window.__atlasDebug.playbackRate = rate;
    });

    atlasStore.subscribe(state => state.simulation.selectedVesselId, (selectedId) => {
      if (window.__atlasDebug) window.__atlasDebug.selectedVesselId = selectedId;
      if (vesselMarkersHandler) vesselMarkersHandler.highlightVessel(selectedId);
    });

    atlasStore.subscribe(state => state.simulation.followedVesselId, (followedId) => {
      if (window.__atlasDebug) window.__atlasDebug.followedVesselId = followedId;
      if (mapCameraHandler) {
        if (followedId) {
          mapCameraHandler.startFollow(followedId);
        } else {
          mapCameraHandler.stopFollow();
        }
      }
    });

    simEngine.subscribe('map', (snapshots) => {
      const demoActive = atlasStore.getState().simulation.offlineDemoActive;
      if (vesselMarkersHandler) {
        if (demoActive) {
          vesselMarkersHandler.updateVessels(snapshots, null);
        } else {
          vesselMarkersHandler.updateVessels([], null);
        }
      }
    });

    simEngine.subscribe('panel', () => {
      if (activeTab === 'fleet') {
        const container = document.getElementById('sidebar-tab-content');
        if (container) {
          updateFleetPanelValues(container);
        }
      }
    });

    // Expose store state on window for simEngine
    window.__atlasStoreState = atlasStore.getState();
    atlasStore.subscribe(state => {
      window.__atlasStoreState = state;
    });

  } catch (err) {
    console.error('[SimulationEngine] Initialization warning:', err);
    window.__atlasDebug.simulationStatus = 'error';
    window.__atlasDebug.lastSimulationError = err.message || String(err);
  }
}

async function initMapEngine() {
  const appContainer = document.getElementById('app');
  const result = await loadLeafletResiliently();

  if (!result.success) {
    console.warn('[LeafletLoader] Load failed:', result.error);
    window.__atlasDebug.mapStatus = 'degraded';
    window.__atlasDebug.appStatus = 'ready';
    if (appContainer) appContainer.dataset.appState = 'map-degraded';
    document.documentElement.dataset.appReady = 'true';

    window.__atlasDebug.timings.appReadyMs = Math.round(performance.now() - appNavStartTime);

    renderMapFallbackUI('map', () => {
      initMapEngine();
    });
    return;
  }

  requestAnimationFrame(() => {
    try {
      const mapEl = document.getElementById('map');
      if (!mapEl) return;

      const mapController = createWaterbusMapController(mapEl);
      const created = mapController.create();

      if (!created) {
        console.warn('[MapEngine] Container contract not satisfied, retrying layout frame...');
        requestAnimationFrame(() => initMapEngine());
        return;
      }

      mapInstance = mapController.getMap();
      const layers = mapController.getBaseLayers();

      routeLayersHandler = setupRouteLayers(mapInstance, ROUTES, (routeId) => {
        handleFocusRoute(routeId);
      });

      pierMarkersHandler = setupPierMarkers(mapInstance, PIERS, (pierId) => {
        handlePierSelect(pierId);
      });

      vesselMarkersHandler = setupVesselMarkers(mapInstance, (vesselId) => {
        handleVesselSelect(vesselId);
      });

      itineraryLayersHandler = setupItineraryLayers(mapInstance);

      mapCameraHandler = createMapCamera(mapInstance, () => {
        atlasStore.setState({
          simulation: { ...atlasStore.getState().simulation, followedVesselId: null }
        });
        renderActiveTab();
      });

      if (simEngine && vesselMarkersHandler) {
        vesselMarkersHandler.updateVessels([], null);
      }

      requestAnimationFrame(() => {
        if (mapController) mapController.ensureSize();
      });

      const nowMs = Math.round(performance.now() - appNavStartTime);
      window.__atlasDebug.timings.appReadyMs = nowMs;
      window.__atlasDebug.timings.mapReadyMs = nowMs;

      window.__atlasDebug.renderedPierMarkers = PIERS.length;
      if (window.__atlasDebug.mapStatus !== 'basemap-ready') {
        window.__atlasDebug.mapStatus = 'vector-ready';
      }
      window.__atlasDebug.appStatus = 'ready';
      if (appContainer) appContainer.dataset.appState = 'ready';
      document.documentElement.dataset.appReady = 'true';

      setupMapControlListeners(layers);

    } catch (err) {
      console.error('[MapEngine] Initialization error:', err);
      window.__atlasDebug.mapStatus = 'error';
      window.__atlasDebug.lastError = err.message || String(err);
      window.__atlasDebug.appStatus = 'ready';
      if (appContainer) appContainer.dataset.appState = 'map-degraded';
      document.documentElement.dataset.appReady = 'true';

      renderMapFallbackUI('map', () => {
        initMapEngine();
      });
    }
  });
}

function updateStatusChip() {
  const statusChip = document.getElementById('status-chip-simulation');
  const demoBanner = document.getElementById('demo-disclaimer-banner');
  const demoBtn = document.getElementById('btn-offline-demo');
  if (!statusChip) return;

  const demoActive = atlasStore.getState().simulation?.offlineDemoActive;

  if (demoActive) {
    statusChip.innerHTML = '● 離線示範中，不代表即時船位或實際營運';
    statusChip.style.color = '#38bdf8';
    if (demoBanner) demoBanner.style.display = 'flex';
    if (demoBtn) {
      demoBtn.innerHTML = '⏹ 停止示範';
      demoBtn.setAttribute('aria-pressed', 'true');
      demoBtn.style.background = 'rgba(239, 68, 68, 0.2)';
      demoBtn.style.color = '#ff5c64';
      demoBtn.style.borderColor = 'rgba(239, 68, 68, 0.4)';
    }
  } else {
    statusChip.innerHTML = '● 目前無可驗證的模擬航行';
    statusChip.style.color = '#f59e0b';
    if (demoBanner) demoBanner.style.display = 'none';
    if (demoBtn) {
      demoBtn.innerHTML = '▶ 啟動離線示範';
      demoBtn.setAttribute('aria-pressed', 'false');
      demoBtn.style.background = 'rgba(56, 189, 248, 0.12)';
      demoBtn.style.color = '#38bdf8';
      demoBtn.style.borderColor = 'rgba(56, 189, 248, 0.4)';
    }
  }
}

function updateFleetPanelValues(container) {
  if (!simEngine) return;
  const snapshots = simEngine.getAllVesselSnapshots();
  container.querySelectorAll('.vessel-card').forEach(card => {
    const vesselId = card.getAttribute('data-vessel-id');
    const snap = snapshots.find(s => s.vesselId === vesselId);
    if (snap) {
      const badge = card.querySelector('.badge');
      if (badge) {
        if (snap.status === 'docked' || snap.status === 'boarding') {
          badge.className = 'badge conf-operator';
          badge.innerHTML = `${ICONS.anchor} 靠港中`;
        } else if (snap.status === 'approaching') {
          badge.className = 'badge conf-simulated';
          badge.innerHTML = `${ICONS.focus} 進港中`;
        } else {
          badge.className = 'badge conf-official';
          badge.innerHTML = `${ICONS.ship} 航行中`;
        }
      }
    }
  });
}

function setupTabNavigation() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      const targetBtn = e.currentTarget;
      targetBtn.classList.add('active');
      targetBtn.setAttribute('aria-selected', 'true');
      activeTab = targetBtn.getAttribute('data-tab');

      if (activeTab === 'guide') {
        atlasStore.setState({
          pierExplorer: { ...atlasStore.getState().pierExplorer, drawerOpen: false },
          ui: { activeTab: 'guide', pierDrawerOpen: false, mobileSheetMode: 'planner' }
        });
      } else if (activeTab === 'fleet') {
        atlasStore.setState({
          pierExplorer: { ...atlasStore.getState().pierExplorer, drawerOpen: false },
          ui: { activeTab: 'fleet', pierDrawerOpen: false, mobileSheetMode: 'fleet' }
        });
      } else {
        atlasStore.setState({
          ui: { ...atlasStore.getState().ui, activeTab, mobileSheetMode: 'none' }
        });
      }

      renderActiveTab();

      if (mapInstance) {
        mapInstance.invalidateSize({ animate: false });
      }
    });
  });
}

function setupResizeListeners() {
  window.addEventListener('resize', () => {
    if (mapInstance) {
      mapInstance.invalidateSize({ animate: false });
    }
  });
}

let activeTab = 'today';

function renderActiveTab() {
  const container = document.getElementById('sidebar-tab-content');
  if (!container) return;

  if (activeTab === 'today') {
    renderTodayStatusPanel(container);
  } else if (activeTab === 'routes') {
    renderRoutePanel(
      container,
      ROUTES,
      activeFocusRouteId,
      (routeId) => handleFocusRoute(routeId),
      () => handleClearFocus()
    );
  } else if (activeTab === 'piers') {
    renderPierPanel(
      container,
      PIERS,
      (pierId) => handlePierSelect(pierId),
      (routeId) => handleRouteFocusFromDrawer(routeId)
    );
  } else if (activeTab === 'planner') {
    renderTripPlanner(
      container,
      PIERS,
      routeEngine,
      (itineraryId) => handleSelectItinerary(itineraryId)
    );
  } else if (activeTab === 'guide') {
    renderGuidePanel(container, (itinerary) => handleSelectItinerary(itinerary));
  } else if (activeTab === 'explore') {
    renderFleetPanel(container, VESSELS);
  } else if (activeTab === 'review') {
    renderReviewPortalPanel(container);
  }
}

function handleFocusRoute(routeId) {
  activeFocusRouteId = routeId;
  if (itineraryLayersHandler) itineraryLayersHandler.clearItinerary();
  if (routeLayersHandler) {
    routeLayersHandler.focusRoute(routeId);
  }
  renderActiveTab();
}

function handleClearFocus() {
  activeFocusRouteId = null;
  if (itineraryLayersHandler) itineraryLayersHandler.clearItinerary();
  if (routeLayersHandler) {
    routeLayersHandler.clearFocus();
  }
  if (mapInstance) {
    mapInstance.setView(MAP_DEFAULTS.CENTER, MAP_DEFAULTS.ZOOM, { animate: true });
  }
  renderActiveTab();
}

function handlePierSelect(pierId) {
  const pier = PIERS.find(p => p.id === pierId);
  if (!pier) return;

  atlasStore.setState({
    simulation: { ...atlasStore.getState().simulation, followedVesselId: null },
    pierExplorer: { ...atlasStore.getState().pierExplorer, selectedPierId: pierId, drawerOpen: true },
    ui: { ...atlasStore.getState().ui, pierDrawerOpen: true, mobileSheetMode: 'pier' }
  });

  handleFocusPierOnMap(pierId);
}

function handleFocusPierOnMap(pierId) {
  const pier = PIERS.find(p => p.id === pierId);
  if (!pier || !mapInstance) return;

  mapInstance.flyTo(pier.coordinates, 15, { animate: true, duration: 0.8 });
  if (pierMarkersHandler) {
    pierMarkersHandler.highlightPier(pierId);
  }
}

function handleClosePierDrawer() {
  atlasStore.setState({
    pierExplorer: { ...atlasStore.getState().pierExplorer, selectedPierId: null, drawerOpen: false },
    ui: { ...atlasStore.getState().ui, pierDrawerOpen: false, mobileSheetMode: 'none' }
  });
}

function handleRouteFocusFromDrawer(routeId) {
  activeTab = 'routes';
  switchActiveTabBtn('routes');
  handleFocusRoute(routeId);
}

function handlePrefillPlanner(type, pierId) {
  activeTab = 'guide';
  switchActiveTabBtn('guide');

  const pState = atlasStore.getState().planner;
  if (type === 'origin') {
    atlasStore.setState({ planner: { ...pState, originPierId: pierId } });
  } else if (type === 'destination') {
    atlasStore.setState({ planner: { ...pState, destinationPierId: pierId } });
  }

  renderActiveTab();
}

function handleSelectItinerary(itinerary) {
  atlasStore.setState({
    planner: { ...atlasStore.getState().planner, selectedItineraryId: itinerary.id }
  });
  if (itineraryLayersHandler) {
    itineraryLayersHandler.showItinerary(itinerary);
  }
}

function switchActiveTabBtn(tabName) {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
    if (t.getAttribute('data-tab') === tabName) {
      t.classList.add('active');
      t.setAttribute('aria-selected', 'true');
    }
  });
}

function handleVesselSelect(vesselId) {
  atlasStore.setState({
    simulation: { ...atlasStore.getState().simulation, selectedVesselId: vesselId }
  });
  if (simEngine && mapInstance) {
    const snap = simEngine.getVesselSnapshot(vesselId);
    if (snap) {
      mapInstance.flyTo([snap.lat, snap.lng], 15, { animate: true, duration: 0.8 });
    }
  }
  if (activeTab === 'fleet') renderActiveTab();
}

function setupMapControlListeners(layers) {
  const resetBtn = document.getElementById('btn-reset-map-view');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      handleClearFocus();
    });
  }

  const themeBtn = document.getElementById('btn-theme-toggle');
  if (themeBtn && layers) {
    themeBtn.addEventListener('click', () => {
      const newMode = layers.toggle ? layers.toggle() : 'dark';
      const labelMap = {
        dark: '切換底圖：深色',
        light: '切換底圖：淺色',
        none: '切換底圖：無 (參考資料)'
      };
      const label = labelMap[newMode] || '切換底圖：深色';
      themeBtn.innerHTML = `${ICONS.layers} ${label}`;
      themeBtn.setAttribute('aria-pressed', newMode === 'light' ? 'true' : 'false');
    });
  }

  const offlineDemoBtn = document.getElementById('btn-offline-demo');
  if (offlineDemoBtn) {
    offlineDemoBtn.addEventListener('click', () => {
      const currentActive = atlasStore.getState().simulation?.offlineDemoActive;
      const nextActive = !currentActive;
      atlasStore.setState({
        simulation: { ...atlasStore.getState().simulation, offlineDemoActive: nextActive }
      });
      updateStatusChip();
      if (!nextActive && vesselMarkersHandler) {
        vesselMarkersHandler.updateVessels([], null);
      }
    });
  }

  const stopDemoBtn = document.getElementById('btn-stop-demo');
  if (stopDemoBtn) {
    stopDemoBtn.addEventListener('click', () => {
      atlasStore.setState({
        simulation: { ...atlasStore.getState().simulation, offlineDemoActive: false }
      });
      updateStatusChip();
      if (vesselMarkersHandler) {
        vesselMarkersHandler.updateVessels([], null);
      }
    });
  }

  const resetDemoBtn = document.getElementById('btn-reset-demo');
  if (resetDemoBtn) {
    resetDemoBtn.addEventListener('click', () => {
      if (simEngine && simEngine.resetDemoClock) {
        simEngine.resetDemoClock();
      }
    });
  }

  // Secondary Entry for Human Geographic Review Portal (P0-2)
  const secondaryReviewLink = document.getElementById('link-secondary-review');
  if (secondaryReviewLink) {
    secondaryReviewLink.addEventListener('click', (e) => {
      e.preventDefault();
      const tabs = document.querySelectorAll('.tab-btn');
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      activeTab = 'review';
      renderActiveTab();
    });
  }

  // Data Trust Levels Info Drawer (P0-4)
  const toggleDataLevelsBtn = document.getElementById('btn-toggle-data-levels');
  const closeDataLevelsBtn = document.getElementById('btn-close-data-levels');
  const dataLevelsModal = document.getElementById('data-levels-modal');

  if (toggleDataLevelsBtn && dataLevelsModal) {
    toggleDataLevelsBtn.addEventListener('click', () => {
      const isHidden = dataLevelsModal.style.display === 'none';
      dataLevelsModal.style.display = isHidden ? 'block' : 'none';
    });
  }

  if (closeDataLevelsBtn && dataLevelsModal) {
    closeDataLevelsBtn.addEventListener('click', () => {
      dataLevelsModal.style.display = 'none';
    });
  }
}

document.addEventListener('DOMContentLoaded', initApp);
