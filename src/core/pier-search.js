/**
 * Trilingual Search Engine for Tokyo Waterbus Atlas Piers (Phase 3A)
 * Supports Traditional Chinese, Japanese, English, Landmarks, Transit, and Route Names.
 */

import { ROUTES } from '../data/routes.js';
import { LANDMARKS } from '../data/landmarks.js';

function normalizeString(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[！-～]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0)) // Full-width to half-width ASCII
    .replace(/[\s\-\_—（）\(\)\,\.\/]/g, ''); // Strip spaces and punctuation
}

export function searchPiers(piers, query) {
  if (!Array.isArray(piers)) return [];
  const q = normalizeString(query);
  if (!q) return [...piers];

  const results = [];

  piers.forEach(pier => {
    const zhName = pier.name?.zhHant || '';
    const jaName = pier.name?.ja || '';
    const enName = pier.name?.en || '';

    const normZh = normalizeString(zhName);
    const normJa = normalizeString(jaName);
    const normEn = normalizeString(enName);
    const normId = normalizeString(pier.id);

    // Collect related route names for this pier
    const routeNames = (pier.routes || []).map(rId => {
      const r = ROUTES.find(rt => rt.id === rId);
      return r ? `${r.name?.zhHant || ''} ${r.name?.ja || ''} ${r.name?.en || ''}` : rId;
    }).join(' ');
    const normRoutes = normalizeString(routeNames);

    // Collect related landmark names for this pier
    const landmarkNames = (pier.landmarks || []).map(lId => {
      const l = LANDMARKS.find(lm => lm.id === lId);
      return l ? `${l.name?.zhHant || ''} ${l.name?.ja || ''} ${l.name?.en || ''}` : lId;
    }).join(' ');
    const normLandmarks = normalizeString(landmarkNames);

    // Collect transit names
    const transitNames = (pier.nearestTransit || []).join(' ');
    const normTransit = normalizeString(transitNames);

    let matchRank = 0;

    if (normZh === q || normJa === q || normEn === q || normId === q) {
      matchRank = 1; // Exact name match
    } else if (normZh.startsWith(q) || normJa.startsWith(q) || normEn.startsWith(q) || normId.startsWith(q)) {
      matchRank = 2; // Name prefix match
    } else if (normZh.includes(q) || normJa.includes(q) || normEn.includes(q) || normId.includes(q)) {
      matchRank = 3; // Name substring match
    } else if (normRoutes.includes(q) || normLandmarks.includes(q) || normTransit.includes(q)) {
      matchRank = 4; // Related metadata match
    }

    if (matchRank > 0) {
      results.push({ pier, rank: matchRank });
    }
  });

  // Sort by rank ascending (1 is highest priority), then original order
  results.sort((a, b) => a.rank - b.rank);

  return results.map(r => r.pier);
}
