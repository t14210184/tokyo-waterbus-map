/**
 * Resilient Leaflet CDN Loader for Tokyo Waterbus Atlas (Phase 4A.1)
 * 100% pure SVG / Text. Zero unicode pictographic emojis.
 */

import { LEAFLET_CDN_ENDPOINTS, LEAFLET_INTEGRITY } from './constants.js';

let leafletLoadPromise = null;

export async function loadLeafletResiliently() {
  if (window.L) {
    return { success: true, loadedFrom: 'already-loaded' };
  }

  if (leafletLoadPromise) {
    return leafletLoadPromise;
  }

  leafletLoadPromise = (async () => {
    for (let i = 0; i < LEAFLET_CDN_ENDPOINTS.length; i++) {
      const cdn = LEAFLET_CDN_ENDPOINTS[i];
      try {
        await loadCssFile(cdn.css, LEAFLET_INTEGRITY.css);
        await loadJsFile(cdn.js, LEAFLET_INTEGRITY.js);

        if (window.L) {
          console.log(`[LeafletLoader] Successfully loaded Leaflet from Endpoint ${i + 1} (${cdn.name})`);
          return { success: true, loadedFrom: cdn.name };
        }
      } catch (err) {
        console.warn(`[LeafletLoader] Endpoint ${i + 1} (${cdn.name}) failed:`, err);
      }
    }

    return {
      success: false,
      error: 'All Leaflet CDN endpoints failed to load'
    };
  })();

  return leafletLoadPromise;
}

function loadCssFile(href, integrity) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`link[href="${href}"]`);
    if (existing) {
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    if (integrity) {
      link.integrity = integrity;
      link.crossOrigin = '';
    }

    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
    document.head.appendChild(link);
  });
}

function loadJsFile(src, integrity) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    if (integrity) {
      script.integrity = integrity;
      script.crossOrigin = '';
    }

    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load JS: ${src}`));
    document.head.appendChild(script);
  });
}

export function renderMapFallbackUI(containerId, onRetry) {
  const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  if (!container) return;

  container.innerHTML = `
    <div style="width: 100%; height: 100%; min-height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #071923; color: #ffffff; padding: 2rem; text-align: center; font-family: system-ui;">
      <div style="color: #ff5c64; font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;">
        地圖模組載入超時 (Leaflet Load Degraded)
      </div>
      <p style="color: #7b9eb3; font-size: 0.85rem; max-width: 450px; margin-bottom: 1.25rem; line-height: 1.5;">
        網路連線或 CDN 存取遭遇限制。目前控制中心功能、碼頭資料與模擬計算仍保持運作。
      </p>
      <button id="btn-retry-map" style="padding: 0.55rem 1.2rem; background: #13b9c7; color: #ffffff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem;">
        重新連接地圖 CDN
      </button>
    </div>
  `;

  const btn = container.querySelector('#btn-retry-map');
  if (btn && onRetry) {
    btn.addEventListener('click', () => onRetry());
  }
}
