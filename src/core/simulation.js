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

  // Operational Simulation is strictly LOCKED OUT for all routes
  const operationalSimulationAllowed = false;

  // Approved routes for user-initiated Offline Demo Mode
  const APPROVED_OFFLINE_DEMO_ROUTES = ['sumida-river', 'asakusa-odaiba-direct', 'hinode-odaiba', 'hamarikyu'];

  // Defined Demo Vessels (Mizube Line is EXCLUDED forever)
  const DEMO_VESSELS = [
    { id: 'demo-vessel-01', routeId: 'sumida-river', name: 'demo-vessel-01', operator: 'TOKYO CRUISE (離線示範)', color: '#13b9c7', offsetMins: 0 },
    { id: 'demo-vessel-02', routeId: 'asakusa-odaiba-direct', name: 'demo-vessel-02', operator: 'TOKYO CRUISE (離線示範)', color: '#13b9c7', offsetMins: 5 },
    { id: 'demo-vessel-03', routeId: 'hinode-odaiba', name: 'demo-vessel-03', operator: 'TOKYO CRUISE (離線示範)', color: '#13b9c7', offsetMins: 10 },
    { id: 'demo-vessel-04', routeId: 'hamarikyu', name: 'demo-vessel-04', operator: 'TOKYO CRUISE (離線示範)', color: '#13b9c7', offsetMins: 15 }
  ];

  function computeDemoVesselSnapshot(demoVessel, clockMs) {
    const routeMeta = routeMap.get(demoVessel.routeId) || routeMap.get('sumida-river');
    const pathCoords = routeMeta.pathCoords;
    const totalLen = routeMeta.totalLengthMeters;

    // Safety boundary: Stop before needs-review segments (clamp at 75% of route length)
    const maxSafeDist = totalLen * 0.75;
    const cruiseSpeedMps = 6.11;
    const cruiseDurationSec = maxSafeDist / cruiseSpeedMps;
    const dwellDurationSec = 60;
    const cycleMs = (cruiseDurationSec + dwellDurationSec) * 2 * 1000;

    const vesselOffsetMs = (demoVessel.offsetMins || 0) * 60 * 1000;
    const elapsedMs = (clockMs + vesselOffsetMs) % cycleMs;
    const elapsedSec = elapsedMs / 1000;

    let targetDist = 0;
    let isReturn = false;
    let statusText = '離線示範中';

    if (elapsedSec <= cruiseDurationSec) {
      targetDist = elapsedSec * cruiseSpeedMps;
      isReturn = false;
      statusText = '離線示範中';
    } else if (elapsedSec <= cruiseDurationSec + dwellDurationSec) {
      targetDist = maxSafeDist;
      isReturn = false;
      statusText = '示範已在待審參考區段前停止';
    } else if (elapsedSec <= (cruiseDurationSec * 2) + dwellDurationSec) {
      const returnSec = elapsedSec - (cruiseDurationSec + dwellDurationSec);
      targetDist = maxSafeDist - (returnSec * cruiseSpeedMps);
      isReturn = true;
      statusText = '離線示範中';
    } else {
      targetDist = 0;
      isReturn = true;
      statusText = '示範停靠中';
    }

    const safeDist = Math.max(0, Math.min(maxSafeDist, targetDist));
    const geo = getPolylinePointAtDistance(pathCoords, safeDist);
    const headingDegrees = isReturn ? (geo.heading + 180) % 360 : geo.heading;

    return {
      vesselId: demoVessel.id,
      vesselName: demoVessel.name,
      operator: demoVessel.operator,
      routeId: demoVessel.routeId,
      routeName: routeMeta.route.name?.zhHant || demoVessel.routeId,
      routeColor: demoVessel.color,
      status: statusText,
      lat: geo.point[0],
      lng: geo.point[1],
      headingDegrees: Math.round(headingDegrees),
      progress: totalLen > 0 ? safeDist / totalLen : 0,
      speedKph: 20,
      etaLabel: '離線示範動畫',
      dataMode: 'offline-demo',
      operationalSimulationAllowed: false,
      offlineDemoAllowed: true,
      updatedAt: clockMs
    };
  }

  function getAllDemoVesselSnapshots(clockMs = virtualClockMs, demoActive = false) {
    if (!demoActive) return [];
    return DEMO_VESSELS.map(v => computeDemoVesselSnapshot(v, clockMs));
  }

  function getVesselSnapshot(vesselId, clockMs = virtualClockMs, demoActive = false) {
    if (!demoActive) return null;
    const demoVessel = DEMO_VESSELS.find(v => v.id === vesselId);
    if (!demoVessel) return null;
    return computeDemoVesselSnapshot(demoVessel, clockMs);
  }

  function getAllVesselSnapshots(clockMs = virtualClockMs, demoActive = false) {
    return getAllDemoVesselSnapshots(clockMs, demoActive);
  }

  function resetDemoClock() {
    virtualClockMs = Date.now();
  }

  function tick(now) {
    const deltaRealMs = Math.min(200, now - lastFrameTime);
    lastFrameTime = now;

    if (!isPaused) {
      virtualClockMs += deltaRealMs * playbackRate;
      tickCount++;

      const globalStore = typeof window !== 'undefined' && window.__atlasStoreState;
      const demoActive = globalStore ? Boolean(globalStore.simulation?.offlineDemoActive) : false;

      // Map Markers throttled update (80ms)
      if (now - lastMapUpdateAt >= 80) {
        lastMapUpdateAt = now;
        const snapshots = getAllDemoVesselSnapshots(virtualClockMs, demoActive);
        mapListeners.forEach(fn => fn(snapshots));
      }

      // Side Panel throttled update (500ms)
      if (now - lastPanelUpdateAt >= 500) {
        lastPanelUpdateAt = now;
        const snapshots = getAllDemoVesselSnapshots(virtualClockMs, demoActive);
        panelListeners.forEach(fn => fn(snapshots));
      }
    }

    if (window.__atlasDebug) {
      window.__atlasDebug.simulationStatus = isPaused ? 'paused' : 'running';
      window.__atlasDebug.playbackRate = playbackRate;
      window.__atlasDebug.vesselMarkerCount = 0;
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
    const globalStore = typeof window !== 'undefined' && window.__atlasStoreState;
    const demoActive = globalStore ? Boolean(globalStore.simulation?.offlineDemoActive) : false;
    const snapshots = getAllDemoVesselSnapshots(virtualClockMs, demoActive);
    mapListeners.forEach(fn => fn(snapshots));
    panelListeners.forEach(fn => fn(snapshots));
  }

  function getSimulationState() {
    return {
      isPaused,
      playbackRate,
      virtualClockMs,
      tickCount,
      vesselCount: DEMO_VESSELS.length,
      operationalSimulationAllowed: false,
      offlineDemoAllowed: true
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
    getAllDemoVesselSnapshots,
    resetDemoClock,
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
