/**
 * Route Graph Builder & Diagnostics for Tokyo Waterbus Atlas (Phase 4A)
 * Generates directed multigraph nodes and edges from ROUTES and PIERS data.
 */

export const DEFAULT_TRANSFER_BUFFER_MINUTES = 15;

export function buildRouteGraph(routes = [], piers = []) {
  const nodes = new Map();
  const edges = [];

  // 1. Build Nodes from Piers
  piers.forEach(pier => {
    nodes.set(pier.id, {
      id: pier.id,
      name: pier.name,
      operator: pier.operator,
      coordinates: pier.coordinates,
      routes: pier.routes || []
    });
  });

  // 2. Build Route Segment Edges
  routes.forEach(route => {
    const stopIds = route.piers || [];
    if (stopIds.length < 2) return;

    // Parse duration estimate (e.g. "40–50 分鐘" -> 45 mins)
    let totalMins = 30; // fallback default
    if (typeof route.approxDurationMinutes === 'string') {
      const nums = route.approxDurationMinutes.match(/\d+/g);
      if (nums && nums.length > 0) {
        const parsed = nums.map(Number);
        totalMins = Math.round(parsed.reduce((a, b) => a + b, 0) / parsed.length);
      }
    }

    const numSegments = stopIds.length - 1;
    const segMins = Math.max(5, Math.round(totalMins / numSegments));
    const confidence = route.dataConfidence?.duration || 'planning-estimate';

    // Outbound Edges
    for (let i = 0; i < stopIds.length - 1; i++) {
      const fromId = stopIds[i];
      const toId = stopIds[i + 1];

      edges.push({
        id: `${route.id}:${fromId}->${toId}`,
        routeId: route.id,
        routeName: route.name,
        operator: route.operator,
        color: route.color || '#13b9c7',
        from: fromId,
        to: toId,
        durationMinutes: segMins,
        confidence,
        isTransfer: false,
        sourceUrl: route.sourceUrl
      });
    }

    // Inbound Edges (Bi-directional water service)
    for (let i = stopIds.length - 1; i > 0; i--) {
      const fromId = stopIds[i];
      const toId = stopIds[i - 1];

      edges.push({
        id: `${route.id}:${fromId}->${toId}:return`,
        routeId: route.id,
        routeName: route.name,
        operator: route.operator,
        color: route.color || '#13b9c7',
        from: fromId,
        to: toId,
        durationMinutes: segMins,
        confidence,
        isTransfer: false,
        sourceUrl: route.sourceUrl
      });
    }
  });

  // 3. Build Transfer Edges (Transfers at same Pier between different Routes)
  nodes.forEach(node => {
    const routeList = node.routes || [];
    if (routeList.length > 1) {
      for (let i = 0; i < routeList.length; i++) {
        for (let j = 0; j < routeList.length; j++) {
          if (i !== j) {
            const r1 = routeList[i];
            const r2 = routeList[j];
            edges.push({
              id: `transfer:${node.id}:${r1}->${r2}`,
              routeId: 'transfer',
              routeName: { zhHant: '碼頭轉乘', ja: '乗り換え', en: 'Transfer' },
              operator: 'Transfer',
              color: '#8f6cff',
              from: node.id,
              to: node.id,
              fromRouteId: r1,
              toRouteId: r2,
              durationMinutes: DEFAULT_TRANSFER_BUFFER_MINUTES,
              confidence: 'planning-estimate',
              isTransfer: true,
              transferType: 'same-pier'
            });
          }
        }
      }
    }
  });

  return {
    nodes,
    edges,
    getDiagnostics: () => ({
      nodeCount: nodes.size,
      edgeCount: edges.filter(e => !e.isTransfer).length,
      transferEdgeCount: edges.filter(e => e.isTransfer).length
    })
  };
}
