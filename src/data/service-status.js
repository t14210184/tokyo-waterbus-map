/**
 * Operational Truth & Service Status Registry for Tokyo Waterbus Atlas
 * Current Reference Date: 2026-08-02
 */

export const SERVICE_STATUS_REGISTRY = {
  operators: {
    'tokyo-mizube-line': {
      operatorId: 'tokyo-mizube-line',
      name: '東京水辺ライン (Tokyo Mizube Line)',
      serviceState: 'SUSPENDED',
      effectiveFrom: '2026-01-19',
      expectedResume: '2026-summer',
      expectedResumeIsConfirmed: false,
      simulationAllowed: false,
      planningAllowed: false,
      publicLabel: '暫停營運中',
      publicMessage: '東京水辺ライン自 2026-01-19 起當面暫停營運。復航時間以官方公告為準。',
      sourceName: '東京水辺ライン官方網站',
      sourceUrl: 'https://www.tokyo-park.or.jp/water/waterbus/',
      sourceRetrievedAt: '2026-08-02T00:00:00Z',
      lastVerifiedAt: '2026-08-02T00:00:00Z'
    },
    'tokyo-cruise': {
      operatorId: 'tokyo-cruise',
      name: 'TOKYO CRUISE (東京都觀光汽船)',
      serviceState: 'OPERATING',
      effectiveFrom: '2026-01-01',
      simulationAllowed: false,
      planningAllowed: true,
      publicLabel: '日間營運中',
      publicMessage: '請參考 TOKYO CRUISE 官方當日時程公告。非即時 GPS。',
      sourceName: 'TOKYO CRUISE 官方網站',
      sourceUrl: 'https://www.suijobus.co.jp/',
      sourceRetrievedAt: '2026-08-02T00:00:00Z',
      lastVerifiedAt: '2026-08-02T00:00:00Z'
    }
  },
  routes: {
    'sumida-river': {
      routeId: 'sumida-river',
      operatorId: 'tokyo-cruise',
      hasNeedsReviewSegments: true,
      operatingHoursJst: { start: 9, end: 19 },
      officialScheduleUrl: 'https://www.suijobus.co.jp/system/operating/'
    },
    'asakusa-odaiba-direct': {
      routeId: 'asakusa-odaiba-direct',
      operatorId: 'tokyo-cruise',
      hasNeedsReviewSegments: true,
      operatingHoursJst: { start: 9, end: 19 },
      officialScheduleUrl: 'https://www.suijobus.co.jp/system/operating/'
    },
    'hinode-odaiba': {
      routeId: 'hinode-odaiba',
      operatorId: 'tokyo-cruise',
      hasNeedsReviewSegments: true,
      operatingHoursJst: { start: 9, end: 19 },
      officialScheduleUrl: 'https://www.suijobus.co.jp/system/operating/'
    },
    'hamarikyu': {
      routeId: 'hamarikyu',
      operatorId: 'tokyo-cruise',
      hasNeedsReviewSegments: true,
      operatingHoursJst: { start: 9, end: 19 },
      officialScheduleUrl: 'https://www.suijobus.co.jp/system/operating/'
    },
    'mizube-line': {
      routeId: 'mizube-line',
      operatorId: 'tokyo-mizube-line',
      hasNeedsReviewSegments: true,
      operatingHoursJst: null,
      officialScheduleUrl: 'https://www.tokyo-park.or.jp/water/waterbus/'
    }
  }
};

export function getRouteOperationalState(routeId, referenceTimeMs = Date.now()) {
  const routeMeta = SERVICE_STATUS_REGISTRY.routes[routeId];
  if (!routeMeta) {
    return {
      routeId,
      serviceState: 'NO_OFFICIAL_DATA',
      sourceName: '未知來源',
      sourceUrl: '',
      sourceRetrievedAt: new Date().toISOString(),
      effectiveFrom: '2026-08-02',
      effectiveTo: null,
      lastVerifiedAt: '2026-08-02T00:00:00Z',
      simulationAllowed: false,
      planningAllowed: false,
      publicMessage: '無官方營運資料'
    };
  }

  const operator = SERVICE_STATUS_REGISTRY.operators[routeMeta.operatorId];
  if (operator && operator.serviceState === 'SUSPENDED') {
    return {
      routeId,
      operatorId: operator.operatorId,
      serviceState: 'SUSPENDED',
      sourceName: operator.sourceName,
      sourceUrl: operator.sourceUrl,
      sourceRetrievedAt: operator.sourceRetrievedAt,
      effectiveFrom: operator.effectiveFrom,
      effectiveTo: null,
      lastVerifiedAt: operator.lastVerifiedAt,
      simulationAllowed: false,
      planningAllowed: false,
      publicMessage: operator.publicMessage
    };
  }

  // Calculate Tokyo Time (JST = UTC+9)
  const now = new Date(referenceTimeMs);
  const utcHours = now.getUTCHours();
  const tokyoHours = (utcHours + 9) % 24;

  const hours = routeMeta.operatingHoursJst;
  const isOperatingHours = hours ? (tokyoHours >= hours.start && tokyoHours < hours.end) : false;

  if (!isOperatingHours) {
    return {
      routeId,
      operatorId: routeMeta.operatorId,
      serviceState: 'OUT_OF_SERVICE_HOURS',
      sourceName: operator ? operator.sourceName : '官方網站',
      sourceUrl: routeMeta.officialScheduleUrl,
      sourceRetrievedAt: '2026-08-02T00:00:00Z',
      effectiveFrom: '2026-08-02',
      effectiveTo: null,
      lastVerifiedAt: '2026-08-02T00:00:00Z',
      simulationAllowed: false,
      planningAllowed: true,
      publicMessage: '目前不在日間服務時段 (09:00 - 19:00 JST)'
    };
  }

  if (routeMeta.hasNeedsReviewSegments) {
    return {
      routeId,
      operatorId: routeMeta.operatorId,
      serviceState: 'GEOMETRY_REVIEW_REQUIRED',
      sourceName: operator ? operator.sourceName : '官方網站',
      sourceUrl: routeMeta.officialScheduleUrl,
      sourceRetrievedAt: '2026-08-02T00:00:00Z',
      effectiveFrom: '2026-08-02',
      effectiveTo: null,
      lastVerifiedAt: '2026-08-02T00:00:00Z',
      simulationAllowed: false,
      planningAllowed: true,
      publicMessage: '航線地理資料包含待審核區段，已安全停用動態模擬航行。'
    };
  }

  return {
    routeId,
    operatorId: routeMeta.operatorId,
    serviceState: 'OPERATING',
    sourceName: operator ? operator.sourceName : '官方網站',
    sourceUrl: routeMeta.officialScheduleUrl,
    sourceRetrievedAt: '2026-08-02T00:00:00Z',
    effectiveFrom: '2026-08-02',
    effectiveTo: null,
    lastVerifiedAt: '2026-08-02T00:00:00Z',
    simulationAllowed: false,
    planningAllowed: true,
    publicMessage: '日間營運中 (待官方班表確認)'
  };
}

/**
 * Derived Operational Status for a Pier based on its serving operators & routes.
 */
export function getPierDerivedStatus(pier) {
  if (!pier) {
    return { statusState: 'UNKNOWN', activeOperators: [], suspendedOperators: [] };
  }

  const routes = pier.routes || [];
  const operatorIds = new Set();

  for (const routeId of routes) {
    const routeMeta = SERVICE_STATUS_REGISTRY.routes[routeId];
    if (routeMeta && routeMeta.operatorId) {
      operatorIds.add(routeMeta.operatorId);
    }
  }

  if (operatorIds.size === 0) {
    if (pier.status === 'suspended') {
      return { statusState: 'SUSPENDED', activeOperators: [], suspendedOperators: ['tokyo-mizube-line'] };
    }
    return { statusState: pier.status === 'active' ? 'ACTIVE' : 'UNKNOWN', activeOperators: [], suspendedOperators: [] };
  }

  const activeOperators = [];
  const suspendedOperators = [];

  for (const opId of operatorIds) {
    const op = SERVICE_STATUS_REGISTRY.operators[opId];
    if (op && op.serviceState === 'SUSPENDED') {
      suspendedOperators.push(op);
    } else {
      activeOperators.push(op || { operatorId: opId });
    }
  }

  if (activeOperators.length === 0 && suspendedOperators.length > 0) {
    return {
      statusState: 'SUSPENDED',
      activeOperators: [],
      suspendedOperators,
      primarySuspendedOperator: suspendedOperators[0]
    };
  }

  if (activeOperators.length > 0 && suspendedOperators.length > 0) {
    return {
      statusState: 'PARTIAL',
      activeOperators,
      suspendedOperators
    };
  }

  return {
    statusState: 'ACTIVE',
    activeOperators,
    suspendedOperators: []
  };
}
