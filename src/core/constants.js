/**
 * System Constants for Tokyo Waterbus Atlas (Phase 4A.2 P0 Fix)
 * Single authoritative source for operators, confidence levels, Leaflet CDN endpoints, and map defaults.
 */

export const OPERATORS = {
  TOKYO_CRUISE: {
    id: 'TOKYO CRUISE',
    name: {
      zhHant: 'TOKYO CRUISE (東京都觀光汽船)',
      ja: 'TOKYO CRUISE（東京都観光汽船）',
      en: 'TOKYO CRUISE (Tokyo Cruise Ship Co., Ltd.)'
    },
    url: 'https://www.suijobus.co.jp/en/',
    todayUrl: 'https://www.suijobus.co.jp/en/today-operation/',
    color: '#13b9c7',
    badgeClass: 'badge-tokyo-cruise'
  },
  MIZUBE_LINE: {
    id: '東京水辺ライン',
    name: {
      zhHant: '東京水辺ライン (東京都公園協會)',
      ja: '東京水辺ライン（東京都公園協会）',
      en: 'Tokyo Mizube Line (Tokyo Metropolitan Park Association)'
    },
    url: 'https://www.tokyo-park.or.jp/water/bus/',
    todayUrl: 'https://www.tokyo-park.or.jp/water/bus/',
    color: '#8f6cff',
    badgeClass: 'badge-mizube-line'
  }
};

export const DATA_CONFIDENCE = {
  OFFICIAL_REF: {
    key: 'official-reference',
    label: { zhHant: '官方參考資料', ja: '公式参考データ', en: 'Official Reference' },
    class: 'conf-official'
  },
  OPERATOR_REF: {
    key: 'operator-reference',
    label: { zhHant: '營運商／觀光局資料', ja: '事業者/観光局参考', en: 'Operator Reference' },
    class: 'conf-operator'
  },
  PLANNING_ESTIMATE: {
    key: 'planning-estimate',
    label: { zhHant: '旅遊規劃預估', ja: '計画推計値', en: 'Planning Estimate' },
    class: 'conf-estimate'
  },
  SIMULATED: {
    key: 'simulated',
    label: { zhHant: '模擬動態 (非AIS)', ja: '模擬動態（非AIS）', en: 'Simulated Position' },
    class: 'conf-simulated'
  }
};

export const LEAFLET_CDN_ENDPOINTS = [
  {
    name: 'unpkg',
    css: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    js: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
  },
  {
    name: 'cdnjs',
    css: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
    js: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
  },
  {
    name: 'jsdelivr',
    css: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css',
    js: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js'
  }
];

export const LEAFLET_INTEGRITY = {
  css: 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=',
  js: 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
};

export const SIMULATION_SPEEDS = [1, 10, 30, 120];

export const MAP_DEFAULTS = {
  CENTER: [35.655, 139.775],
  ZOOM: 13,
  MIN_ZOOM: 11,
  MAX_ZOOM: 18
};
