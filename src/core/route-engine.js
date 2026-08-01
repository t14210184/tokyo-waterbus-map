/**
 * Origin-Destination Pathfinding Route Engine for Tokyo Waterbus Atlas (Phase 4A.2)
 * Pure computational pathfinding algorithm supporting fastest, fewest-transfers, and scenic preferences.
 * Strict transfer semantics: Every route change at a pier automatically incurs 1 transfer leg and 1 transfer buffer.
 */

import { ROUTES } from '../data/routes.js';
import { PIERS } from '../data/piers.js';
import { buildRouteGraph, DEFAULT_TRANSFER_BUFFER_MINUTES } from './graph-utils.js';

let engineInstance = null;

export function createRouteEngine(customData = {}) {
  const routesData = customData.routes || ROUTES;
  const piersData = customData.piers || PIERS;

  const graph = buildRouteGraph(routesData, piersData);

  function findItineraries({ originPierId, destinationPierId, preference = 'fastest', maxResults = 3 }) {
    if (!originPierId || !destinationPierId) return { itineraries: [], error: 'missing-parameters' };
    if (originPierId === destinationPierId) return { itineraries: [], error: 'same-origin-destination' };

    const originNode = graph.nodes.get(originPierId);
    const destNode = graph.nodes.get(destinationPierId);
    if (!originNode || !destNode) return { itineraries: [], error: 'node-not-found' };

    // Water route edges only (excluding explicit transfer edges to prevent duplicate traversal)
    const waterEdges = graph.edges.filter(e => !e.isTransfer);

    const candidates = [];
    const queue = [
      {
        currentNodeId: originPierId,
        currentRouteId: null,
        pathNodes: [originPierId],
        edges: [],
        transfers: 0,
        totalWaterMins: 0,
        totalTransferMins: 0
      }
    ];

    const visitedPaths = new Set();

    while (queue.length > 0 && candidates.length < 50) {
      // Sort queue by cost depending on preference
      queue.sort((a, b) => {
        const costA = a.totalWaterMins + a.totalTransferMins + (a.transfers * 30);
        const costB = b.totalWaterMins + b.totalTransferMins + (b.transfers * 30);
        return costA - costB;
      });

      const current = queue.shift();
      const { currentNodeId, currentRouteId, pathNodes, edges, transfers, totalWaterMins, totalTransferMins } = current;

      if (currentNodeId === destinationPierId) {
        candidates.push(current);
        continue;
      }

      if (pathNodes.length > 10 || transfers > 2) continue;

      const outgoingWaterEdges = waterEdges.filter(e => e.from === currentNodeId);

      for (const edge of outgoingWaterEdges) {
        const nextNodeId = edge.to;
        if (pathNodes.includes(nextNodeId)) continue; // Prevent cycles

        const isRouteChange = currentRouteId !== null && currentRouteId !== edge.routeId;
        const nextTransfers = isRouteChange ? transfers + 1 : transfers;
        if (nextTransfers > 2) continue;

        const nextWaterMins = totalWaterMins + (edge.durationMinutes || 10);
        const nextTransferMins = isRouteChange ? totalTransferMins + DEFAULT_TRANSFER_BUFFER_MINUTES : totalTransferMins;

        const pathKey = `${pathNodes.join('->')}:${edge.routeId}`;
        if (visitedPaths.has(pathKey)) continue;
        visitedPaths.add(pathKey);

        queue.push({
          currentNodeId: nextNodeId,
          currentRouteId: edge.routeId,
          pathNodes: [...pathNodes, nextNodeId],
          edges: [...edges, edge],
          transfers: nextTransfers,
          totalWaterMins: nextWaterMins,
          totalTransferMins: nextTransferMins
        });
      }
    }

    // Format Candidate Itineraries with Exact Transfer Legs
    const formatted = candidates.map((cand, idx) => {
      const legs = [];
      let currentWaterLeg = null;

      cand.edges.forEach(edge => {
        if (!currentWaterLeg) {
          currentWaterLeg = {
            routeId: edge.routeId,
            routeName: edge.routeName?.zhHant || edge.routeId,
            operator: edge.operator,
            color: edge.color,
            fromPierId: edge.from,
            toPierId: edge.to,
            durationMinutes: edge.durationMinutes || 10,
            confidence: edge.confidence,
            isTransfer: false
          };
        } else if (currentWaterLeg.routeId === edge.routeId) {
          currentWaterLeg.toPierId = edge.to;
          currentWaterLeg.durationMinutes += (edge.durationMinutes || 10);
        } else {
          // Route Change -> Push previous water leg, push transfer leg, start new water leg
          legs.push(currentWaterLeg);

          const transferPierId = currentWaterLeg.toPierId;
          legs.push({
            routeId: 'transfer',
            routeName: '碼頭轉乘',
            operator: 'Transfer',
            color: '#8f6cff',
            fromPierId: transferPierId,
            toPierId: transferPierId,
            durationMinutes: DEFAULT_TRANSFER_BUFFER_MINUTES,
            confidence: 'planning-estimate',
            isTransfer: true
          });

          currentWaterLeg = {
            routeId: edge.routeId,
            routeName: edge.routeName?.zhHant || edge.routeId,
            operator: edge.operator,
            color: edge.color,
            fromPierId: edge.from,
            toPierId: edge.to,
            durationMinutes: edge.durationMinutes || 10,
            confidence: edge.confidence,
            isTransfer: false
          };
        }
      });
      if (currentWaterLeg) legs.push(currentWaterLeg);

      const waterLegs = legs.filter(l => !l.isTransfer);
      const transferLegs = legs.filter(l => l.isTransfer);

      const waterTravelMinutes = waterLegs.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
      const transferBufferMinutes = transferLegs.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
      const totalEstimateMinutes = waterTravelMinutes + transferBufferMinutes;
      const transferCount = transferLegs.length;

      const operators = Array.from(new Set(waterLegs.map(l => l.operator)));
      const warnings = [];

      if (operators.length > 1) {
        warnings.push('可能涉及不同營運商與票務規則，請分別確認。');
      }
      if (legs.some(l => l.confidence === 'planning-estimate')) {
        warnings.push('區段時間為依公開全程時間分配之規劃估計。');
      }

      let scenicScore = 50;
      if (waterLegs.some(l => l.routeId === 'asakusa-odaiba-direct')) scenicScore += 40;
      if (waterLegs.some(l => l.routeId === 'sumida-river')) scenicScore += 30;

      return {
        id: `itinerary-${idx + 1}-${preference}`,
        originPierId,
        destinationPierId,
        legs,
        routeIds: Array.from(new Set(waterLegs.map(l => l.routeId))),
        operators,
        waterTravelMinutes,
        transferBufferMinutes,
        totalEstimateMinutes,
        transferCount,
        confidence: legs.some(l => l.confidence === 'planning-estimate') ? 'planning-estimate' : 'official-reference',
        warnings,
        scenicScore,
        requiresOfficialConfirmation: true
      };
    });

    // Deduplicate by routeIds sequence
    const uniqueMap = new Map();
    formatted.forEach(item => {
      const key = `${item.routeIds.join('-')}:${item.transferCount}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });

    let itineraries = Array.from(uniqueMap.values());

    if (preference === 'fewest-transfers') {
      itineraries.sort((a, b) => a.transferCount - b.transferCount || (a.totalEstimateMinutes || 0) - (b.totalEstimateMinutes || 0));
    } else if (preference === 'scenic') {
      itineraries.sort((a, b) => b.scenicScore - a.scenicScore || (a.totalEstimateMinutes || 0) - (b.totalEstimateMinutes || 0));
    } else {
      itineraries.sort((a, b) => (a.totalEstimateMinutes || 0) - (b.totalEstimateMinutes || 0) || a.transferCount - b.transferCount);
    }

    return {
      itineraries: itineraries.slice(0, maxResults),
      error: null
    };
  }

  engineInstance = {
    findItineraries,
    getGraphDiagnostics: graph.getDiagnostics
  };

  return engineInstance;
}

export function getRouteEngine() {
  if (!engineInstance) {
    return createRouteEngine();
  }
  return engineInstance;
}
