/**
 * Leaflet Map Creation, Contract & Controller for Tokyo Waterbus Atlas (Phase RC.3)
 * Unified Map Lifecycle Controller enforcing Leaflet Initialization Contract,
 * debounced ResizeObserver, layout-frame timing, and single-instance management.
 */

import { MAP_DEFAULTS } from '../core/constants.js';
import { setupBaseLayers } from './base-layers.js';

let activeMapController = null;

export function checkMapContainerContract(containerId) {
  const mapElement = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  if (!mapElement) return { valid: false, reason: 'Element missing' };

  const rect = mapElement.getBoundingClientRect();
  const style = window.getComputedStyle(mapElement);
  const inBody = document.body.contains(mapElement);

  const isWidthValid = rect.width >= 320 || (window.innerWidth <= 600 && rect.width >= 280);
  const isHeightValid = rect.height >= 240;
  const isDisplayValid = style.display !== 'none';
  const isVisibilityValid = style.visibility !== 'hidden';

  const valid = isWidthValid && isHeightValid && inBody && isDisplayValid && isVisibilityValid;

  return {
    valid,
    rect: { width: Math.round(rect.width), height: Math.round(rect.height) },
    style: { display: style.display, visibility: style.visibility },
    inBody,
    reason: valid ? 'Valid contract' : `Invalid rect (${Math.round(rect.width)}x${Math.round(rect.height)}), display=${style.display}`
  };
}

export function createWaterbusMapController(containerId, options = {}) {
  if (activeMapController) {
    activeMapController.destroy();
    activeMapController = null;
  }

  const mapElement = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  if (!mapElement) {
    throw new Error(`Map container #${containerId} not found`);
  }

  let mapInstance = null;
  let baseLayers = null;
  let resizeObserver = null;
  let rafId = null;
  let lastWidth = 0;
  let lastHeight = 0;

  const L = typeof window.L !== 'undefined' ? window.L : (typeof globalThis.L !== 'undefined' ? globalThis.L : null);
  if (!L || typeof L.map !== 'function') {
    throw new Error('Leaflet library window.L is not loaded');
  }

  function create() {
    const contract = checkMapContainerContract(mapElement);
    if (!contract.valid) {
      console.warn('[MapController] Cannot initialize map: contract invalid', contract);
      return false;
    }

    mapElement.innerHTML = '';

    mapInstance = L.map(mapElement, {
      center: options.center || MAP_DEFAULTS.CENTER,
      zoom: options.zoom || MAP_DEFAULTS.ZOOM,
      minZoom: MAP_DEFAULTS.MIN_ZOOM,
      maxZoom: MAP_DEFAULTS.MAX_ZOOM,
      zoomControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(mapInstance);

    // Vector-only fallback notice element
    let noticeEl = document.getElementById('map-tile-notice');
    if (!noticeEl && mapElement) {
      noticeEl = document.createElement('div');
      noticeEl.id = 'map-tile-notice';
      noticeEl.className = 'map-tile-loading-notice';
      noticeEl.innerText = '底圖載入中；航線與碼頭仍可使用。';
      mapElement.appendChild(noticeEl);
    }

    baseLayers = setupBaseLayers(mapInstance, (status) => {
      if ((status === 'basemap-visible' || status === 'basemap-complete') && noticeEl) {
        noticeEl.style.opacity = '0';
        setTimeout(() => { try { noticeEl.remove(); } catch(e){} }, 400);
      }
    });

    lastWidth = contract.rect.width;
    lastHeight = contract.rect.height;

    setupDebouncedResizeObserver();
    return true;
  }

  function setupDebouncedResizeObserver() {
    if (!window.ResizeObserver || !mapElement) return;

    resizeObserver = new ResizeObserver(entries => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (!mapInstance || !mapElement) return;
        const rect = mapElement.getBoundingClientRect();
        const w = Math.round(rect.width);
        const h = Math.round(rect.height);

        // Only invalidate when width/height genuinely changed by > 4px
        if (Math.abs(w - lastWidth) > 4 || Math.abs(h - lastHeight) > 4) {
          lastWidth = w;
          lastHeight = h;
          if (w >= 280 && h >= 200) {
            mapInstance.invalidateSize({ animate: false, pan: false });
          }
        }
      });
    });

    resizeObserver.observe(mapElement);
  }

  function ensureSize() {
    if (!mapInstance || !mapElement) return false;
    const rect = mapElement.getBoundingClientRect();
    if (rect.width >= 280 && rect.height >= 200) {
      mapInstance.invalidateSize({ animate: false, pan: false });
      return true;
    }
    return false;
  }

  function fitInitialBounds(bounds) {
    if (!mapInstance || !bounds) return;
    try {
      mapInstance.fitBounds(bounds, { padding: [30, 30], maxZoom: 14, animate: false });
      requestAnimationFrame(() => {
        if (mapInstance) mapInstance.invalidateSize({ animate: false, pan: false });
      });
    } catch (err) {
      console.warn('[MapController] fitBounds error:', err);
    }
  }

  function invalidateAfterLayoutChange() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      ensureSize();
    });
  }

  function destroy() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    if (mapInstance) {
      try {
        mapInstance.remove();
      } catch (err) {
        console.warn('[MapController] Map remove error:', err);
      }
      mapInstance = null;
    }
    baseLayers = null;
  }

  const controller = {
    create,
    ensureSize,
    fitInitialBounds,
    invalidateAfterLayoutChange,
    destroy,
    getMap: () => mapInstance,
    getBaseLayers: () => baseLayers,
    getContract: () => checkMapContainerContract(mapElement)
  };

  activeMapController = controller;
  return controller;
}

// Backward-compatibility wrapper for legacy calls
export function createWaterbusMap(containerId) {
  const controller = createWaterbusMapController(containerId);
  const success = controller.create();
  if (!success) {
    throw new Error(`Map initialization failed contract check for #${containerId}`);
  }
  return {
    map: controller.getMap(),
    layers: controller.getBaseLayers(),
    controller
  };
}
