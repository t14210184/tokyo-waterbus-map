/**
 * Geometry & Geographic Utilities for Tokyo Waterbus Atlas
 */

/**
 * Calculates Haversine distance in meters between two lat/lon pairs
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates bearing angle in degrees (0-360) from p1 to p2
 */
export function calculateHeading(lat1, lon1, lat2, lon2) {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  const brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
}

/**
 * Interpolates between two lat/lon coordinates given a ratio t (0 <= t <= 1)
 */
export function interpolatePoint(p1, p2, t) {
  return [
    p1[0] + (p2[0] - p1[0]) * t,
    p1[1] + (p2[1] - p1[1]) * t
  ];
}

/**
 * Computes total length of a polyline in meters
 */
export function calculatePolylineLength(polyline) {
  let total = 0;
  for (let i = 0; i < polyline.length - 1; i++) {
    total += haversineDistance(
      polyline[i][0], polyline[i][1],
      polyline[i + 1][0], polyline[i + 1][1]
    );
  }
  return total;
}

/**
 * Given a polyline coordinates array and target distance (meters),
 * returns point [lat, lon], segmentIndex, and heading in degrees.
 */
export function getPolylinePointAtDistance(polyline, targetDist) {
  if (!polyline || polyline.length === 0) return { point: [0, 0], heading: 0, segmentIndex: 0 };
  if (polyline.length === 1) return { point: polyline[0], heading: 0, segmentIndex: 0 };

  let accumulated = 0;
  for (let i = 0; i < polyline.length - 1; i++) {
    const p1 = polyline[i];
    const p2 = polyline[i + 1];
    const segDist = haversineDistance(p1[0], p1[1], p2[0], p2[1]);

    if (accumulated + segDist >= targetDist) {
      const remaining = targetDist - accumulated;
      const ratio = segDist > 0 ? remaining / segDist : 0;
      const point = interpolatePoint(p1, p2, ratio);
      const heading = calculateHeading(p1[0], p1[1], p2[0], p2[1]);
      return { point, heading, segmentIndex: i };
    }
    accumulated += segDist;
  }

  // If targetDist exceeds total length, clamp to last point
  const lastIndex = polyline.length - 1;
  const prevPoint = polyline[lastIndex - 1];
  const lastPoint = polyline[lastIndex];
  const heading = calculateHeading(prevPoint[0], prevPoint[1], lastPoint[0], lastPoint[1]);
  return { point: lastPoint, heading, segmentIndex: lastIndex - 1 };
}
