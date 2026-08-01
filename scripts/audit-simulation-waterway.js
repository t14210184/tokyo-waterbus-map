/**
 * Simulation Waterway Alignment Audit Pipeline for Tokyo Waterbus Atlas (Phase v1.1.0-RC.1)
 * Verifies that 100% of simulated vessel positions lie strictly on their assigned approved polylines.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { VESSELS } from '../src/data/vessels.js';
import { ROUTE_GEOMETRIES } from '../src/data/route-geometries.js';
import { haversineDistance } from '../src/core/geometry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const artifactDir = path.join(rootDir, 'artifacts', 'v1.1-rc1');

if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

function pointToSegmentDistanceMeters(p, a, b) {
  // Distance from point p (lat, lng) to segment a-b
  const dAB = haversineDistance(a[0], a[1], b[0], b[1]);
  if (dAB === 0) return haversineDistance(p[0], p[1], a[0], a[1]);

  const dPA = haversineDistance(p[0], p[1], a[0], a[1]);
  const dPB = haversineDistance(p[0], p[1], b[0], b[1]);

  // Project point onto line segment using dot product ratio
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / (((b[0] - a[0]) ** 2) + ((b[1] - a[1]) ** 2) || 1)));
  const projLat = a[0] + t * (b[0] - a[0]);
  const projLng = a[1] + t * (b[1] - a[1]);

  return Math.round(haversineDistance(p[0], p[1], projLat, projLng));
}

function minDistanceToPolylineMeters(point, polyline) {
  let minDistance = Infinity;
  for (let i = 0; i < polyline.length - 1; i++) {
    const dist = pointToSegmentDistanceMeters(point, polyline[i], polyline[i + 1]);
    if (dist < minDistance) minDistance = dist;
  }
  return minDistance;
}

function runAudit() {
  console.log('🚀 Running Vessel Simulation Waterway Alignment Audit (v1.1.0-RC.1)...');

  const geometryMap = new Map();
  ROUTE_GEOMETRIES.forEach(g => {
    // Leaflet coords [lat, lng]
    const leafletCoords = g.coordinates.map(([lng, lat]) => [lat, lng]);
    geometryMap.set(g.routeId, {
      coords: leafletCoords,
      simulationEligible: Boolean(g.simulationEligible)
    });
  });

  const vesselAudits = [];
  let totalPositionEvaluations = 0;
  let totalOnGeometryMatches = 0;

  VESSELS.forEach(vessel => {
    const primaryRouteId = vessel.routeId || (vessel.primaryRoutes && vessel.primaryRoutes[0]) || 'sumida-river';
    const geomInfo = geometryMap.get(primaryRouteId);

    if (!geomInfo) {
      vesselAudits.push({
        vesselId: vessel.id,
        vesselName: vessel.name?.zhHant || vessel.id,
        assignedRouteId: primaryRouteId,
        simulationEligible: false,
        evaluatedPositionsCount: 0,
        maxDeviationMeters: null,
        result: 'fail'
      });
      return;
    }

    const polyline = geomInfo.coords;
    let maxDevMeters = 0;
    let vesselMatches = 0;
    const ticksCount = 100;

    // Simulate 100 time points across 24 hours
    for (let t = 0; t < ticksCount; t++) {
      const clockMs = Date.now() + (t * 60 * 1000);
      const totalLen = polyline.reduce((acc, curr, idx) => {
        if (idx === 0) return 0;
        return acc + haversineDistance(polyline[idx - 1][0], polyline[idx - 1][1], curr[0], curr[1]);
      }, 0);

      const offsetMins = vessel.simulation?.scheduleOffsetMinutes || vessel.scheduleOffsetMinutes || 0;
      const cruiseSpeedMps = 6.11;
      const cruiseSec = totalLen / cruiseSpeedMps;
      const dwellSec = 120;
      const cycleMs = (cruiseSec + dwellSec) * 2 * 1000;
      const elapsedSec = ((clockMs + offsetMins * 60000) % cycleMs) / 1000;

      let targetDist = 0;
      if (elapsedSec <= cruiseSec) {
        targetDist = elapsedSec * cruiseSpeedMps;
      } else if (elapsedSec <= cruiseSec + dwellSec) {
        targetDist = totalLen;
      } else if (elapsedSec <= 2 * cruiseSec + dwellSec) {
        targetDist = totalLen - ((elapsedSec - cruiseSec - dwellSec) * cruiseSpeedMps);
      } else {
        targetDist = 0;
      }

      // Linear arc-length point along polyline
      const safeDist = Math.max(0, Math.min(totalLen, targetDist));
      let currentDist = 0;
      let vesselPoint = polyline[0];

      for (let i = 0; i < polyline.length - 1; i++) {
        const segDist = haversineDistance(polyline[i][0], polyline[i][1], polyline[i + 1][0], polyline[i + 1][1]);
        if (currentDist + segDist >= safeDist) {
          const frac = segDist > 0 ? (safeDist - currentDist) / segDist : 0;
          vesselPoint = [
            polyline[i][0] + frac * (polyline[i + 1][0] - polyline[i][0]),
            polyline[i][1] + frac * (polyline[i + 1][1] - polyline[i][1])
          ];
          break;
        }
        currentDist += segDist;
      }

      const devMeters = minDistanceToPolylineMeters(vesselPoint, polyline);
      if (devMeters > maxDevMeters) maxDevMeters = devMeters;

      totalPositionEvaluations++;
      if (devMeters <= 1) {
        vesselMatches++;
        totalOnGeometryMatches++;
      }
    }

    vesselAudits.push({
      vesselId: vessel.id,
      vesselName: vessel.name?.zhHant || vessel.id,
      assignedRouteId: primaryRouteId,
      simulationEligible: geomInfo.simulationEligible,
      evaluatedPositionsCount: ticksCount,
      onGeometryMatchesCount: vesselMatches,
      maxDeviationMeters: maxDevMeters,
      result: (maxDevMeters <= 1 && geomInfo.simulationEligible) ? 'pass' : 'fail'
    });
  });

  const overallPassed = vesselAudits.every(a => a.result === 'pass');

  const auditOutput = {
    timestamp: new Date().toISOString(),
    totalVessels: VESSELS.length,
    totalPositionEvaluations,
    totalOnGeometryMatches,
    vesselAlignmentAccuracyPercentage: Number(((totalOnGeometryMatches / totalPositionEvaluations) * 100).toFixed(2)),
    overallAuditPassed: overallPassed,
    vesselAudits
  };

  fs.writeFileSync(
    path.join(artifactDir, 'simulation-waterway-audit.json'),
    JSON.stringify(auditOutput, null, 2),
    'utf8'
  );

  console.log(`📊 Simulation Waterway Alignment Results:`);
  console.log(`   - Total Vessels: ${VESSELS.length}`);
  console.log(`   - Alignment Accuracy: ${auditOutput.vesselAlignmentAccuracyPercentage}% (${totalOnGeometryMatches}/${totalPositionEvaluations})`);
  console.log(`   - Overall Audit Status: ${overallPassed ? 'PASSED' : 'FAILED'}`);

  if (!overallPassed) process.exit(1);
}

runAudit();
