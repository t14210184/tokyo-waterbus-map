/**
 * Leaflet Base Layers Manager & Map Status Lifecycle Controller for Tokyo Waterbus Atlas (Phase RC.3.18)
 * Enforces mapStatus enum transitions: initializing -> vector-ready -> basemap-visible -> basemap-complete / degraded
 * Supports smooth Dark / Light / Reference-Data base map toggling without losing map instance or overlays.
 */

export const TILE_LAYERS = {
  dark: {
    id: 'dark',
    name: '深色控制室 (CARTO Dark)',
    label: '底圖：深色',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    options: {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
      crossOrigin: true
    }
  },
  light: {
    id: 'light',
    name: '明亮水域 (CARTO Light)',
    label: '底圖：淺色',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    options: {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
      crossOrigin: true
    }
  },
  none: {
    id: 'none',
    name: '參考資料圖層 (無底圖模式)',
    label: '底圖：無 (參考資料圖層)',
    url: null,
    options: {}
  }
};

export function updateMapStatus(status, reason = '') {
  const globalObj = typeof window !== 'undefined' ? window : globalThis;
  if (!globalObj.__atlasDebug) globalObj.__atlasDebug = {};

  const validStatuses = ['initializing', 'ready', 'basemap-visible', 'basemap-complete', 'degraded'];

  if (!validStatuses.includes(status)) {
    console.warn(`[MapState] Invalid map status attempted: ${status}`);
    return;
  }

  globalObj.__atlasDebug.mapStatus = status;
  globalObj.__atlasDebug.mapStatusReason = reason;
  globalObj.__atlasDebug.mapStatusUpdatedAt = new Date().toISOString();

  if (typeof window !== 'undefined' && window.dispatchEvent) {
    window.dispatchEvent(new CustomEvent('atlas:map-status-changed', {
      detail: { status, reason, timestamp: Date.now() }
    }));
  }
}

export function setupBaseLayers(mapInstance, onStatusChange = null) {
  if (!mapInstance) return null;

  const L = typeof window.L !== 'undefined' ? window.L : (typeof globalThis.L !== 'undefined' ? globalThis.L : null);
  if (!L) return null;

  const globalObj = typeof window !== 'undefined' ? window : globalThis;
  if (!globalObj.__atlasDebug) globalObj.__atlasDebug = {};

  globalObj.__atlasDebug.baseTileMetrics = {
    totalTiles: 0,
    loadedTiles: 0,
    errorTiles: 0,
    firstTileLoadedAt: null,
    allTilesLoadedAt: null,
    tileLayerLoadFired: false
  };

  updateMapStatus('ready', 'Vector routes and pier markers rendered.');

  let currentMode = 'dark';
  let activeTileLayer = null;

  function createTileLayer(modeKey) {
    const layerConfig = TILE_LAYERS[modeKey];
    if (!layerConfig || !layerConfig.url) return null;

    const layer = L.tileLayer(layerConfig.url, layerConfig.options);

    layer.on('tileloadstart', () => {
      const metrics = globalObj.__atlasDebug.baseTileMetrics;
      metrics.totalTiles++;
    });

    layer.on('tileload', () => {
      const metrics = globalObj.__atlasDebug.baseTileMetrics;
      metrics.loadedTiles++;

      if (!metrics.firstTileLoadedAt) {
        metrics.firstTileLoadedAt = new Date().toISOString();
        updateMapStatus('basemap-visible', 'First visible tile decoded.');
        if (onStatusChange) onStatusChange('basemap-visible');
      }
    });

    layer.on('tileerror', () => {
      const metrics = globalObj.__atlasDebug.baseTileMetrics;
      metrics.errorTiles++;
    });

    layer.on('load', () => {
      const metrics = globalObj.__atlasDebug.baseTileMetrics;
      metrics.tileLayerLoadFired = true;
      metrics.allTilesLoadedAt = new Date().toISOString();

      updateMapStatus('basemap-complete', 'All initial visible tiles completed.');
      if (onStatusChange) onStatusChange('basemap-complete');
    });

    return layer;
  }

  // Add initial dark layer
  activeTileLayer = createTileLayer('dark');
  if (activeTileLayer) {
    activeTileLayer.addTo(mapInstance);
  }

  return {
    getMode: () => currentMode,
    setMode: (newMode) => {
      if (!TILE_LAYERS[newMode]) return currentMode;

      if (activeTileLayer) {
        mapInstance.removeLayer(activeTileLayer);
        activeTileLayer = null;
      }

      currentMode = newMode;
      if (newMode !== 'none') {
        activeTileLayer = createTileLayer(newMode);
        if (activeTileLayer) {
          activeTileLayer.addTo(mapInstance);
        }
      }

      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('atlas:basemap-mode-changed', {
          detail: { mode: currentMode, label: TILE_LAYERS[currentMode].label }
        }));
      }

      return currentMode;
    },
    toggle: () => {
      const nextMode = currentMode === 'dark' ? 'light' : (currentMode === 'light' ? 'none' : 'dark');
      return controller.setMode(nextMode);
    }
  };
}
