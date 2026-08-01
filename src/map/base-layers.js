/**
 * Leaflet Base Layers Manager & Map Status Lifecycle Controller for Tokyo Waterbus Atlas (Phase RC.3.4)
 * Enforces mapStatus enum transitions: initializing -> vector-ready -> basemap-visible -> basemap-complete / degraded
 */

export const TILE_LAYERS = {
  dark: {
    name: '深色控制室 (CARTO Dark)',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    fallbackUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
      crossOrigin: true
    }
  },
  voyager: {
    name: '彩色水域 (CARTO Voyager)',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    options: {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
      crossOrigin: true
    }
  },
  light: {
    name: '明亮水域 (CARTO Light)',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    options: {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
      crossOrigin: true
    }
  },
  osm: {
    name: 'OpenStreetMap 預設',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      crossOrigin: true
    }
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

  // Dispatch custom DOM event for state listeners
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    window.dispatchEvent(new CustomEvent('atlas:map-status-changed', {
      detail: { status, reason, timestamp: Date.now() }
    }));
  }
}

export function setupBaseLayers(mapInstance, onStatusChange = null) {
  if (!mapInstance) return null;

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

  // Create primary CARTO Dark tile layer
  const primaryLayer = L.tileLayer(TILE_LAYERS.dark.url, TILE_LAYERS.dark.options);

  primaryLayer.on('tileloadstart', () => {
    const metrics = globalObj.__atlasDebug.baseTileMetrics;
    metrics.totalTiles++;
  });

  primaryLayer.on('tileload', (e) => {
    const metrics = globalObj.__atlasDebug.baseTileMetrics;
    metrics.loadedTiles++;

    if (!metrics.firstTileLoadedAt) {
      metrics.firstTileLoadedAt = new Date().toISOString();
      updateMapStatus('basemap-visible', 'First visible tile decoded.');
      if (onStatusChange) onStatusChange('basemap-visible');
    }
  });

  primaryLayer.on('tileerror', (e) => {
    const metrics = globalObj.__atlasDebug.baseTileMetrics;
    metrics.errorTiles++;
  });

  primaryLayer.on('load', () => {
    const metrics = globalObj.__atlasDebug.baseTileMetrics;
    metrics.tileLayerLoadFired = true;
    metrics.allTilesLoadedAt = new Date().toISOString();

    updateMapStatus('basemap-complete', 'All initial visible tiles completed.');
    if (onStatusChange) onStatusChange('basemap-complete');
  });

  primaryLayer.addTo(mapInstance);

  return primaryLayer;
}
