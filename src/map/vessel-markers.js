/**
 * Leaflet Vessel Markers Manager for Tokyo Waterbus Atlas (Phase 4A.1)
 * 100% pure SVG vector icons. Zero unicode pictographic emojis.
 */

import { VESSELS } from '../data/vessels.js';

export function setupVesselMarkers(map, onVesselSelect) {
  const L = window.L;
  const vesselMarkerMap = new Map();

  if (!map || !L) {
    return {
      updateVessels: () => {},
      highlightVessel: () => {}
    };
  }

  function getVesselColor(vessel) {
    if (vessel.operator === 'TOKYO CRUISE') return '#13b9c7';
    if (vessel.operator === '東京水辺ライン') return '#8f6cff';
    return '#38bdf8';
  }

  // Register standard vessels
  VESSELS.forEach(vessel => {
    const color = getVesselColor(vessel);

    const customIcon = L.divIcon({
      className: 'vessel-marker-container',
      html: `
        <div class="vessel-marker-pin" style="background: ${color}; border: 2px solid #ffffff; box-shadow: 0 0 10px ${color}; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;" title="${vessel.name?.zhHant || ''}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
            <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.03"/>
            <path d="M12 10V4"/>
            <path d="M12 4L7 7"/>
          </svg>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    const initialPos = [35.655, 139.775];
    const marker = L.marker(initialPos, { icon: customIcon });

    marker.on('click', () => {
      if (onVesselSelect) onVesselSelect(vessel.id);
    });

    vesselMarkerMap.set(vessel.id, marker);
  });

  // Register demo vessels (demo-vessel-01 .. demo-vessel-04)
  const DEMO_IDS = ['demo-vessel-01', 'demo-vessel-02', 'demo-vessel-03', 'demo-vessel-04'];
  DEMO_IDS.forEach(demoId => {
    const customIcon = L.divIcon({
      className: 'vessel-marker-container demo-vessel-marker',
      html: `
        <div class="vessel-marker-pin" style="background: #38bdf8; border: 2px solid #ffffff; box-shadow: 0 0 10px #38bdf8; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;" title="${demoId}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
            <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.03"/>
            <path d="M12 10V4"/>
            <path d="M12 4L7 7"/>
          </svg>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    const marker = L.marker([35.655, 139.775], { icon: customIcon });
    vesselMarkerMap.set(demoId, marker);
  });

  function updateVessels(snapshots = [], selectedVesselId = null) {
    const activeIds = new Set(snapshots.map(s => s.vesselId));

    // Remove inactive markers from map
    vesselMarkerMap.forEach((marker, vesselId) => {
      if (!activeIds.has(vesselId)) {
        if (map.hasLayer(marker)) {
          map.removeLayer(marker);
        }
      }
    });

    // Add / Update active markers
    snapshots.forEach(snap => {
      const marker = vesselMarkerMap.get(snap.vesselId);
      if (!marker) return;

      if (!map.hasLayer(marker)) {
        marker.addTo(map);
      }

      marker.setLatLng([snap.lat, snap.lng]);

      const isDemo = snap.dataMode === 'offline-demo';
      const popupTitle = isDemo ? '離線示範動畫' : '位置資訊';
      const disclaimer = isDemo ? '概念離線示範，不代表即時船位或營運狀態' : '依公開班表參考';

      const popupContent = `
        <div style="font-family: system-ui; padding: 4px; max-width: 220px;">
          <div style="font-size: 0.7rem; color: #38bdf8; text-transform: uppercase; font-weight: 700;">${popupTitle}</div>
          <h4 style="margin: 2px 0 4px 0; color: #ffffff; font-size: 0.95rem;">${snap.vesselName}</h4>
          <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 6px;">航線: ${snap.routeName || ''}</div>
          <div style="font-size: 0.75rem; color: #bcecf0; margin-bottom: 4px;">狀態: ${snap.status}</div>
          <div style="font-size: 0.72rem; color: #f59e0b; margin-top: 4px; border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 4px;">
            ${disclaimer}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
    });
  }

  function highlightVessel(vesselId) {
    vesselMarkerMap.forEach((marker, id) => {
      const el = marker.getElement();
      if (el) {
        if (id === vesselId) {
          el.classList.add('vessel-marker-selected');
        } else {
          el.classList.remove('vessel-marker-selected');
        }
      }
    });
  }

  return { vesselMarkerMap, updateVessels, highlightVessel };
}
