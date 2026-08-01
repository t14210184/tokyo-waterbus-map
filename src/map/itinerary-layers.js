/**
 * Map Itinerary Layers Manager for Tokyo Waterbus Atlas (Phase 4A.1 Emoji Audit)
 * 100% pure SVG vector icons. Zero unicode pictographic emojis.
 */

import { PIERS } from '../data/piers.js';
import { ROUTES } from '../data/routes.js';

export function setupItineraryLayers(map) {
  const L = window.L;
  const itineraryPolylineGroup = L ? L.layerGroup().addTo(map) : null;
  const itineraryMarkerGroup = L ? L.layerGroup().addTo(map) : null;

  if (!map || !L) {
    return {
      showItinerary: () => {},
      clearItinerary: () => {}
    };
  }

  function showItinerary(itinerary) {
    clearItinerary();
    if (!itinerary || !Array.isArray(itinerary.legs)) return;

    // Highlight Itinerary Route Segments
    itinerary.legs.forEach(leg => {
      if (leg.isTransfer) return;
      const route = ROUTES.find(r => r.id === leg.routeId);
      if (!route || !route.path) return;

      const polyline = L.polyline(route.path, {
        color: leg.color || '#13b9c7',
        weight: 9,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: '1, 1'
      });

      itineraryPolylineGroup.addLayer(polyline);
    });

    // Add Origin Pin Marker (Green SVG pin)
    const originPier = PIERS.find(p => p.id === itinerary.originPierId);
    if (originPier && originPier.coordinates) {
      const originIcon = L.divIcon({
        className: 'itinerary-pin-origin',
        html: `
          <div style="background: #16a15b; color: #fff; padding: 4px 8px; border-radius: 12px; font-weight: 700; font-size: 0.72rem; border: 2px solid #ffffff; box-shadow: 0 0 12px #16a15b; display: inline-flex; align-items: center; gap: 4px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
            <span>出發: ${originPier.name?.zhHant}</span>
          </div>
        `,
        iconSize: [110, 26],
        iconAnchor: [55, 13]
      });
      const originMarker = L.marker(originPier.coordinates, { icon: originIcon });
      itineraryMarkerGroup.addLayer(originMarker);
    }

    // Add Destination Pin Marker (Coral Red SVG pin)
    const destPier = PIERS.find(p => p.id === itinerary.destinationPierId);
    if (destPier && destPier.coordinates) {
      const destIcon = L.divIcon({
        className: 'itinerary-pin-dest',
        html: `
          <div style="background: #ff5c64; color: #fff; padding: 4px 8px; border-radius: 12px; font-weight: 700; font-size: 0.72rem; border: 2px solid #ffffff; box-shadow: 0 0 12px #ff5c64; display: inline-flex; align-items: center; gap: 4px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            <span>抵達: ${destPier.name?.zhHant}</span>
          </div>
        `,
        iconSize: [110, 26],
        iconAnchor: [55, 13]
      });
      const destMarker = L.marker(destPier.coordinates, { icon: destIcon });
      itineraryMarkerGroup.addLayer(destMarker);
    }

    // Fit map bounds to itinerary origin & destination
    if (originPier && destPier && originPier.coordinates && destPier.coordinates) {
      const bounds = L.latLngBounds([originPier.coordinates, destPier.coordinates]);
      map.fitBounds(bounds, { padding: [80, 80], animate: true, duration: 0.8 });
    }
  }

  function clearItinerary() {
    if (itineraryPolylineGroup) itineraryPolylineGroup.clearLayers();
    if (itineraryMarkerGroup) itineraryMarkerGroup.clearLayers();
  }

  return {
    showItinerary,
    clearItinerary
  };
}
