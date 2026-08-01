/**
 * Simulation Engine for Tokyo Waterbus Atlas (Phase v1.1.0-RC.1)
 * Pure computational engine with requestAnimationFrame driver & throttled listener callbacks.
 * Interpolates vessel movement strictly along approved ROUTE_GEOMETRIES polylines.
 */

import { VESSELS } from '../data/vessels.js';
import { ROUTES } from '../data/routes.js';
import { PIERS } from '../data/piers.js';
import { ROUTE_GEOMETRIES } from '../data/route-geometries.js';
import {
  calculatePolylineLength,
  getPolylinePointAtDistance
} from './geometry.js';

let instance = null;

export function createSimulationEngine(options = {}) {
  if (instance) {
    return instance;
  }

  let isPaused = options.isPaused || false;
  let playbackRate = options.playbackRate || 1;

  let virtualClockMs = Date.now();
  let lastFrameTime = performance.now();
  let animFrameId = null;

  let lastMapUpdateAt = 0;
  let lastPanelUpdateAt = 0;
  let tickCount = 0;

  const mapListeners = new Set();
  const panelListeners = new Set();

  // Build internal route metadata map using verified ROUTE_GEOMETRIES
  const routeMap = new Map();

  // Create geometry lookup (converting WGS84 [lng, lat] -> Leaflet [lat, lng])
  const geometryMap = new Map();
  ROUTE_GEOMETRIES.forEach(g => {
    if (g.coordinates && Array.isArray(g.coordinates)) {
      const leafletCoords = g.coordinates.map(([lng, lat]) => [lat, lng]);
      geometryMap.set(g.routeId, {
        coords: leafletCoords,
        simulationEligible: Boolean(g.simulationEligible)
      });
    }
  });

  ROUTES.forEach(route => {
    const geom = geometryMap.get(route.id);
    const pathCoords = geom ? geom.coords : route.path;
    const isEligible = geom ? geom.simulationEligible : true;

    const totalDist = calculatePolylineLength(pathCoords);
    routeMap.set(route.id, {
      route,
      pathCoords,
      simulationEligible: isEligible,
      totalLengthMeters: totalDist
    });
  });

  // Calculate snapshot for a given vessel at clockMs
  function computeVesselSnapshot(vessel, clockMs) {
    const primaryRouteId = vessel.routeId || (vessel.primaryRoutes && vessel.primaryRoutes[0]) || 'sumida-river';
    const routeMeta = routeMap.get(primaryRouteId) || routeMap.get('sumida-river');
    const route = routeMeta.route;
    const pathCoords = routeMeta.pathCoords;
    const totalLen = routeMeta.totalLengthMeters;
    const isEligible = routeMeta.simulationEligible;

    // Standard cruise speed: ~22 km/h (6.11 m/s)
    const cruiseSpeedMps = 6.11;
    const cruiseDurationSec = totalLen / cruiseSpeedMps;
    const dwellDurationSec = 120; // 2 minutes dwell at terminal pier

    // Full round trip duration (forward + dwell + return + dwell)
    const cycleDurationSec = (cruiseDurationSec + dwellDurationSec) * 2;
    const cycleMs = cycleDurationSec * 1000;

    // Deterministic offset per vessel
    const offsetMins = vessel.simulation?.scheduleOffsetMinutes || vessel.scheduleOffsetMinutes || 0;
    const vesselOffsetMs = offsetMins * 60 * 1000;
    const elapsedMs = (clockMs + vesselOffsetMs) % cycleMs;
    const elapsedSec = elapsedMs / 1000;

    let targetDist = 0;
    let isReturn = false;
    let status = 'cruising';
    let currentSpeedKph = 22;

    const leg1Duration = cruiseDurationSec;
    const leg1Dwell = leg1Duration + dwellDurationSec;
    const leg2Duration = leg1Dwell + cruiseDurationSec;

    if (!isEligible) {
      status = 'docked';
      currentSpeedKph = 0;
      targetDist = 0;
    } else if (elapsedSec <= leg1Duration) {
      // Outbound Leg
      targetDist = elapsedSec * cruiseSpeedMps;
      isReturn = false;
      status = elapsedSec > leg1Duration - 30 ? 'approaching' : 'cruising';
    } else if (elapsedSec <= leg1Dwell) {
      // Terminal Dwell Outbound
      targetDist = totalLen;
      isReturn = false;
      status = 'docked';
      currentSpeedKph = 0;
    } else if (elapsedSec <= leg2Duration) {
      // Inbound Leg (Return)
      const returnElapsedSec = elapsedSec - leg1Dwell;
      targetDist = totalLen - (returnElapsedSec * cruiseSpeedMps);
      isReturn = true;
      status = returnElapsedSec > (cruiseDurationSec - 30) ? 'approaching' : 'cruising';
    } else {
      // Terminal Dwell Inbound
      targetDist = 0;
      isReturn = true;
      status = 'boarding';
      currentSpeedKph = 0;
    }

    // Ensure targetDist is safely clamped
    const safeDist = Math.max(0, Math.min(totalLen, targetDist));
    const geo = getPolylinePointAtDistance(pathCoords, safeDist);

    // If returning, invert visual heading by 180deg
    const headingDegrees = isReturn ? (geo.heading + 180) % 360 : geo.heading;

    // Next & Previous Pier determination
    const routePierIds = route.piers || [];
    const pierProgress = totalLen > 0 ? safeDist / totalLen : 0;
    const pierIdx = Math.floor(pierProgress * Math.max(1, routePierIds.length - 1));
    const previousPierId = routePierIds[Math.max(0, Math.min(routePierIds.length - 1, pierIdx))] || '';
    const nextPierId = routePierIds[Math.max(0, Math.min(routePierIds.length - 1, isReturn ? pierIdx : pierIdx + 1))] || '';

    const remainingLegDist = isReturn ? safeDist : (totalLen - safeDist);
    const etaSeconds = Math.round(remainingLegDist / cruiseSpeedMps);
    const etaMinutes = Math.max(1, Math.round(etaSeconds / 60));

    const displayName = vessel.displayName || (vessel.name ? vessel.name.zhHant : vessel.id);

    return {
      vesselId: vessel.id,
      vesselName: displayName,
      operator: vessel.operator || 'TOKYO CRUISE',
      routeId: primaryRouteId,
      routeName: route.name?.zhHant || primaryRouteId,
      routeColor: route.color || '#13b9c7',
      status,
      lat: geo.point[0],
      lng: geo.point[1],
      headingDegrees: Math.round(headingDegrees),
      progress: totalLen > 0 ? safeDist / totalLen : 0,
      speedKph: currentSpeedKph,
      nextPierId,
      previousPierId,
      etaSeconds,
      etaLabel: `約 ${etaMinutes} 分鐘 (SIMULATED)`,
      dataMode: 'simulated',
      simulationEligible: isEligible,
      updatedAt: clockMs
    };
  }

  function getVesselSnapshot(vesselId, clockMs = virtualClockMs) {
    const vessel = VESSELS.find(v => v.id === vesselId);
    if (!vessel) return null;
    return computeVesselSnapshot(vessel, clockMs);
  }

  function getAllVesselSnapshots(clockMs = virtualClockMs) {
    return VESSELS.map(v => computeVesselSnapshot(v, clockMs));
  }

  function tick(now) {
    const deltaRealMs = Math.min(200, now - lastFrameTime);
    lastFrameTime = now;

    if (!isPaused) {
      virtualClockMs += deltaRealMs * playbackRate;
      tickCount++;

      // Map Markers throttled update (80ms)
      if (now - lastMapUpdateAt >= 80) {
        lastMapUpdateAt = now;
        const snapshots = getAllVesselSnapshots(virtualClockMs);
        mapListeners.forEach(fn => fn(snapshots));
      }

      // Side Panel throttled update (500ms)
      if (now - lastPanelUpdateAt >= 500) {
        lastPanelUpdateAt = now;
        const snapshots = getAllVesselSnapshots(virtualClockMs);
        panelListeners.forEach(fn => fn(snapshots));
      }
    }

    if (window.__atlasDebug) {
      window.__atlasDebug.simulationStatus = isPaused ? 'paused' : 'running';
      window.__atlasDebug.playbackRate = playbackRate;
      window.__atlasDebug.vesselMarkerCount = VESSELS.length;
      window.__atlasDebug.simulationTickCount = tickCount;
    }

    animFrameId = requestAnimationFrame(tick);
  }

  function start() {
    if (!animFrameId) {
      lastFrameTime = performance.now();
      animFrameId = requestAnimationFrame(tick);
    }
  }

  function setPlaybackRate(rate) {
    playbackRate = Number(rate) || 1;
    if (window.__atlasDebug) {
      window.__atlasDebug.playbackRate = playbackRate;
    }
  }

  function setPaused(paused) {
    isPaused = Boolean(paused);
    if (window.__atlasDebug) {
      window.__atlasDebug.simulationStatus = isPaused ? 'paused' : 'running';
    }
    const snapshots = getAllVesselSnapshots(virtualClockMs);
    mapListeners.forEach(fn => fn(snapshots));
    panelListeners.forEach(fn => fn(snapshots));
  }

  function getSimulationState() {
    return {
      isPaused,
      playbackRate,
      virtualClockMs,
      tickCount,
      vesselCount: VESSELS.length
    };
  }

  function subscribe(typeOrListener, listener) {
    let type = 'map';
    let callback = typeOrListener;

    if (typeof listener === 'function') {
      type = typeOrListener;
      callback = listener;
    }

    if (type === 'panel') {
      panelListeners.add(callback);
      return () => panelListeners.delete(callback);
    } else {
      mapListeners.add(callback);
      return () => mapListeners.delete(callback);
    }
  }

  function destroy() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    mapListeners.clear();
    panelListeners.clear();
    instance = null;
  }

  start();

  instance = {
    getVesselSnapshot,
    getAllVesselSnapshots,
    setPlaybackRate,
    setPaused,
    getSimulationState,
    subscribe,
    destroy
  };

  return instance;
}

export function getSimulationEngine() {
  return instance;
}
