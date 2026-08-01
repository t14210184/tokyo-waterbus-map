/**
 * Leaflet Pier Markers Manager for Tokyo Waterbus Atlas (Phase 4A.1 Emoji Audit)
 * 100% pure SVG vector icons. Zero unicode pictographic emojis.
 */

export function setupPierMarkers(map, piers, onPierSelect) {
  const L = window.L;
  const pierMarkerMap = new Map();

  if (!map || !L || !Array.isArray(piers)) {
    return { pierMarkerMap, highlightPier: () => {} };
  }

  piers.forEach(pier => {
    const isVerification = pier.status === 'verification-needed';
    const borderColor = isVerification ? '#f5a623' : '#13b9c7';

    const customIcon = L.divIcon({
      className: 'pier-marker-container',
      html: `
        <div class="pier-marker-pin" style="border-color: ${borderColor};" title="${pier.name?.zhHant || ''}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${borderColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const coords = pier.coordinates || [35.655, 139.775];
    const marker = L.marker(coords, { icon: customIcon }).addTo(map);

    const zhName = pier.name?.zhHant || '';
    const jaName = pier.name?.ja || '';
    const enName = pier.name?.en || '';
    const transit = (pier.nearestTransit && pier.nearestTransit[0]) ? pier.nearestTransit[0] : '車站';
    const routeList = Array.isArray(pier.routes) ? pier.routes.join(', ') : '';

    const popupContent = `
      <div style="font-family: system-ui; padding: 4px; max-width: 240px;">
        <h4 style="margin: 0 0 4px 0; color: #ffffff; font-size: 0.95rem;">${zhName} (${jaName})</h4>
        <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 6px;">${enName}</div>
        <div style="font-size: 0.75rem; color: #bcecf0; margin-bottom: 4px;">車站: ${transit}</div>
        <div style="font-size: 0.75rem; color: #13b9c7; margin-bottom: 8px;">可搭航線: ${routeList}</div>
      </div>
    `;

    marker.bindPopup(popupContent);

    marker.on('click', () => {
      if (onPierSelect) onPierSelect(pier.id);
    });

    pierMarkerMap.set(pier.id, marker);
  });

  function highlightPier(pierId) {
    pierMarkerMap.forEach((marker, id) => {
      const el = marker.getElement();
      if (el) {
        if (id === pierId) {
          el.classList.add('pier-marker-selected');
        } else {
          el.classList.remove('pier-marker-selected');
        }
      }
    });
  }

  return { pierMarkerMap, highlightPier };
}
