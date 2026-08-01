/**
 * Leaflet Route Polyline Layers & Focus Mode Manager for Tokyo Waterbus Atlas (Phase v1.1.0-RC.1)
 * Renders waterway-aligned polylines from ROUTE_GEOMETRIES database.
 */

import { ROUTE_GEOMETRIES } from '../data/route-geometries.js';

export function setupRouteLayers(map, routes, onRouteSelect) {
  const L = window.L;
  const routePolylineMap = new Map();

  if (!map || !L || !Array.isArray(routes)) {
    return { routePolylineMap, focusRoute: () => {}, clearFocus: () => {} };
  }

  // Create lookup map for verified route geometries
  const geometryMap = new Map();
  ROUTE_GEOMETRIES.forEach(g => {
    if (g.coordinates && Array.isArray(g.coordinates)) {
      // Convert WGS84 [lng, lat] -> Leaflet [lat, lng]
      const leafletCoords = g.coordinates.map(([lng, lat]) => [lat, lng]);
      geometryMap.set(g.routeId, leafletCoords);
    }
  });

  routes.forEach(route => {
    // Prefer verified ROUTE_GEOMETRIES, fallback to route.path
    const coords = geometryMap.get(route.id) || (route.path ? route.path : null);
    if (!coords || !Array.isArray(coords)) return;

    // Glowing underlay polyline
    const glowPolyline = L.polyline(coords, {
      color: route.color || '#13b9c7',
      weight: 10,
      opacity: 0.35,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Core interactive polyline
    const mainPolyline = L.polyline(coords, {
      color: route.color || '#13b9c7',
      weight: 5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    const zhName = route.name?.zhHant || route.id;
    const operator = route.operator || '';
    const duration = route.approxDurationMinutes || '';

    // Hover tooltip
    mainPolyline.bindTooltip(`
      <div style="font-family: system-ui; font-weight: 600;">
        <span style="color: ${route.color || '#13b9c7'};">●</span> ${zhName}
        <br/><span style="font-size: 0.75rem; opacity: 0.8;">${operator} | ${duration}</span>
      </div>
    `, { sticky: true, className: 'route-tooltip' });

    // Click handler -> Trigger Focus Mode
    mainPolyline.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      if (onRouteSelect) onRouteSelect(route.id);
    });

    routePolylineMap.set(route.id, { glow: glowPolyline, main: mainPolyline, route, coords });
  });

  /**
   * Enters Focus Mode for a single route
   */
  function focusRoute(routeId) {
    if (!routeId) {
      clearFocus();
      return;
    }

    let targetBounds = null;
    routePolylineMap.forEach((entry, id) => {
      if (id === routeId) {
        entry.main.setStyle({ opacity: 1.0, weight: 7 });
        entry.glow.setStyle({ opacity: 0.6, weight: 14 });
        targetBounds = entry.main.getBounds();
      } else {
        entry.main.setStyle({ opacity: 0.15, weight: 3 });
        entry.glow.setStyle({ opacity: 0.05, weight: 5 });
      }
    });

    if (targetBounds && map) {
      const isDesktop = window.innerWidth >= 1024;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const paddingOptions = isDesktop ? {
        paddingTopLeft: [390, 32],
        paddingBottomRight: [32, 64],
        animate: !prefersReducedMotion,
        duration: prefersReducedMotion ? 0 : 0.6
      } : {
        padding: [40, 40],
        animate: !prefersReducedMotion,
        duration: prefersReducedMotion ? 0 : 0.6
      };

      map.fitBounds(targetBounds, paddingOptions);
    }
  }

  /**
   * Resets Focus Mode, restoring all route layers
   */
  function clearFocus() {
    routePolylineMap.forEach((entry) => {
      entry.main.setStyle({ opacity: 0.95, weight: 5 });
      entry.glow.setStyle({ opacity: 0.35, weight: 10 });
    });
  }

  return { routePolylineMap, focusRoute, clearFocus };
}
