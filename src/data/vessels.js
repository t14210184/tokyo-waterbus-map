/**
 * Vessel Database for Tokyo Waterbus Atlas
 */

export const VESSELS = [
  {
    id: 'hotaluna-01',
    displayName: 'HOTALUNA (ホタルナ)',
    type: 'futuristic-vessel',
    operator: 'TOKYO CRUISE',
    routeId: 'asakusa-odaiba-direct',
    routeColor: '#13b9c7',
    simulation: {
      serviceStart: '09:00',
      serviceEnd: '18:30',
      frequencyMinutes: 90,
      travelScale: 1.0,
      dwellSeconds: 25,
      scheduleOffsetMinutes: 14
    },
    dataMode: 'simulated',
    specs: {
      designer: '松本零士 (Leiji Matsumoto)',
      capacity: '約 160 名',
      feature: '360 度玻璃船艙、屋頂步道觀景台、螢火蟲意象流線造型'
    }
  },
  {
    id: 'himiko-01',
    displayName: 'HIMIKO (ヒミコ)',
    type: 'futuristic-vessel',
    operator: 'TOKYO CRUISE',
    routeId: 'asakusa-odaiba-direct',
    routeColor: '#13b9c7',
    simulation: {
      serviceStart: '10:00',
      serviceEnd: '17:30',
      frequencyMinutes: 90,
      travelScale: 0.95,
      dwellSeconds: 20,
      scheduleOffsetMinutes: 59
    },
    dataMode: 'simulated',
    specs: {
      designer: '松本零士 (Leiji Matsumoto)',
      capacity: '約 150 名',
      feature: '淚滴型水滴體、經典動畫銀河鐵道 999 語音廣播'
    }
  },
  {
    id: 'emeraldas-01',
    displayName: 'EMERALDAS (エメラルダス)',
    type: 'futuristic-vessel',
    operator: 'TOKYO CRUISE',
    routeId: 'sumida-river',
    routeColor: '#007ea7',
    simulation: {
      serviceStart: '09:30',
      serviceEnd: '18:00',
      frequencyMinutes: 60,
      travelScale: 1.05,
      dwellSeconds: 22,
      scheduleOffsetMinutes: 0
    },
    dataMode: 'simulated',
    specs: {
      designer: '松本零士 (Leiji Matsumoto)',
      capacity: '約 100 名',
      feature: '松本零士系列三號艦、奢華座位佈局與景觀吧台'
    }
  },
  {
    id: 'ryoma-01',
    displayName: 'RYOMA (竜馬)',
    type: 'sightseeing-vessel',
    operator: 'TOKYO CRUISE',
    routeId: 'sumida-river',
    routeColor: '#007ea7',
    simulation: {
      serviceStart: '08:45',
      serviceEnd: '17:45',
      frequencyMinutes: 45,
      travelScale: 1.0,
      dwellSeconds: 30,
      scheduleOffsetMinutes: 20
    },
    dataMode: 'simulated',
    specs: {
      designer: 'TOKYO CRUISE Standard',
      capacity: '約 300 名',
      feature: '雙層經典河川觀光船、露天甲板觀橋首選'
    }
  },
  {
    id: 'kaishu-01',
    displayName: 'KAISHU (海舟)',
    type: 'sightseeing-vessel',
    operator: 'TOKYO CRUISE',
    routeId: 'hamarikyu',
    routeColor: '#16a15b',
    simulation: {
      serviceStart: '09:15',
      serviceEnd: '16:45',
      frequencyMinutes: 60,
      travelScale: 1.0,
      dwellSeconds: 35,
      scheduleOffsetMinutes: 10
    },
    dataMode: 'simulated',
    specs: {
      designer: 'TOKYO CRUISE Standard',
      capacity: '約 300 名',
      feature: '庭園與歷史河川巡航船、高視角河畔展望'
    }
  },
  {
    id: 'sea-serenade-01',
    displayName: 'SEA SERENADE (小百合號)',
    type: 'coastal-ferry',
    operator: 'TOKYO CRUISE',
    routeId: 'hinode-odaiba',
    routeColor: '#ff5c64',
    simulation: {
      serviceStart: '09:40',
      serviceEnd: '19:00',
      frequencyMinutes: 30,
      travelScale: 1.1,
      dwellSeconds: 18,
      scheduleOffsetMinutes: 5
    },
    dataMode: 'simulated',
    specs: {
      designer: 'TOKYO CRUISE Coastal',
      capacity: '約 250 名',
      feature: '東京灣短程高頻快艇、穿梭彩虹大橋首選'
    }
  },
  {
    id: 'bay-breeze-01',
    displayName: 'BAY BREEZE (灣岸風號)',
    type: 'coastal-ferry',
    operator: 'TOKYO CRUISE',
    routeId: 'hinode-toyosu',
    routeColor: '#f5a623',
    simulation: {
      serviceStart: '10:15',
      serviceEnd: '18:15',
      frequencyMinutes: 60,
      travelScale: 1.0,
      dwellSeconds: 20,
      scheduleOffsetMinutes: 30
    },
    dataMode: 'simulated',
    specs: {
      designer: 'TOKYO CRUISE Waterfront',
      capacity: '約 180 名',
      feature: '運河微風快艇、專為豐洲購物親水線設計'
    }
  },
  {
    id: 'mizube-sakura-01',
    displayName: 'SAKURA (さくら - 水辺ライン)',
    type: 'sightseeing-vessel',
    operator: '東京水辺ライン',
    routeId: 'mizube-line',
    routeColor: '#8f6cff',
    simulation: {
      serviceStart: '09:00',
      serviceEnd: '17:00',
      frequencyMinutes: 120,
      travelScale: 1.0,
      dwellSeconds: 40,
      scheduleOffsetMinutes: 15
    },
    dataMode: 'simulated',
    specs: {
      designer: '東京都公園協會',
      capacity: '約 200 名',
      feature: '平底低水門可動式桅桿船、專為過橋水域設計'
    }
  },
  {
    id: 'mizube-ajisai-01',
    displayName: 'AJISAI (あじさい - 水辺ライン)',
    type: 'sightseeing-vessel',
    operator: '東京水辺ライン',
    routeId: 'mizube-line',
    routeColor: '#8f6cff',
    simulation: {
      serviceStart: '10:30',
      serviceEnd: '16:30',
      frequencyMinutes: 120,
      travelScale: 1.0,
      dwellSeconds: 40,
      scheduleOffsetMinutes: 75
    },
    dataMode: 'simulated',
    specs: {
      designer: '東京都公園協會',
      capacity: '約 200 名',
      feature: '全天候冷暖氣觀光船、兩國至葛西臨海公園長途巡航'
    }
  }
];
