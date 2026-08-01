/**
 * Route Database for Tokyo Waterbus Atlas
 */

export const ROUTES = [
  {
    id: 'sumida-river',
    name: {
      zhHant: '隅田川線',
      ja: '隅田川ライン',
      en: 'Sumida River Line'
    },
    operator: 'TOKYO CRUISE',
    color: '#007ea7',
    approxDurationMinutes: '40–50 分鐘',
    piers: ['asakusa', 'hamarikyu', 'hinode'],
    dataConfidence: {
      routeGeometry: 'curated-geographic',
      duration: 'official-reference',
      timetable: 'official-live-link',
      vesselPosition: 'simulated'
    },
    sourceUrl: 'https://www.suijobus.co.jp/en/price/',
    description: {
      zhHant: '經典河川航線，穿梭於隅田川歷史名橋（吾妻橋、清洲橋、勝鬨橋）之間，一路延伸至濱離宮與日之出。',
      ja: '浅草から日の出桟橋を結ぶ伝統的な水上ライン。隅田川にかかる数々の名橋をくぐり抜けます。',
      en: 'Classic Sumida River route passing under famous historic bridges down to Hamarikyu and Hinode Pier.'
    },
    path: [
      [35.71195, 139.79825], // Asakusa Pier
      [35.70900, 139.79680], // Azuma Bridge
      [35.70420, 139.79360], // Komagata Bridge
      [35.69850, 139.79150], // Umaya Bridge
      [35.69380, 139.79020], // Kuramae Bridge
      [35.68820, 139.78910], // Shin-Ohashi
      [35.68300, 139.78850], // Kiyosu Bridge
      [35.67400, 139.78450], // Eitai Bridge
      [35.66690, 139.77580], // Tsukuda / Chuo Bridge (near St. Luke's)
      [35.66010, 139.77050], // Kachidoki Bridge
      [35.65800, 139.76600], // Tsukiji Lock Approach
      [35.66010, 139.76495], // Hamarikyu Pier
      [35.65580, 139.76100], // Takeshiba Waterway
      [35.65175, 139.75710]  // Hinode Pier
    ]
  },
  {
    id: 'asakusa-odaiba-direct',
    name: {
      zhHant: '淺草－台場直達線',
      ja: '浅草・お台場直通ライン',
      en: 'Asakusa-Odaiba Direct Line'
    },
    operator: 'TOKYO CRUISE',
    color: '#13b9c7',
    approxDurationMinutes: '50–75 分鐘',
    piers: ['asakusa', 'hinode', 'odaiba-kaihinkouen'],
    dataConfidence: {
      routeGeometry: 'curated-geographic',
      duration: 'official-reference',
      timetable: 'official-live-link',
      vesselPosition: 'simulated'
    },
    sourceUrl: 'https://www.suijobus.co.jp/en/price/',
    description: {
      zhHant: '採用 Himiko、Hotaluna、Emeraldas 等松本零士設計之未來感船艦，從淺草一氣呵成直達台場海濱公園。',
      ja: '「ヒミコ」「ホタルナ」などの近未来船で浅草からお台場海浜公園まで直行する人気ルート。',
      en: 'Futuristic vessel direct line (Himiko/Hotaluna) from Asakusa through Tokyo Bay to Odaiba Seaside Park.'
    },
    path: [
      [35.71195, 139.79825], // Asakusa Pier
      [35.70420, 139.79360], // Komagata
      [35.69380, 139.79020], // Kuramae
      [35.68300, 139.78850], // Kiyosu
      [35.67400, 139.78450], // Eitai
      [35.66010, 139.77050], // Kachidoki
      [35.65175, 139.75710], // Hinode Pier (Pass/Touch)
      [35.64500, 139.75950], // Rainbow Bridge Channel North
      [35.63850, 139.76380], // Under Rainbow Bridge
      [35.63150, 139.76800], // Odaiba Bay Channel
      [35.62885, 139.77190]  // Odaiba Seaside Park Pier
    ]
  },
  {
    id: 'hinode-odaiba',
    name: {
      zhHant: '日之出－台場線',
      ja: '日の出・お台場ライン',
      en: 'Hinode-Odaiba Line'
    },
    operator: 'TOKYO CRUISE',
    color: '#ff5c64',
    approxDurationMinutes: '15–20 分鐘',
    piers: ['hinode', 'odaiba-kaihinkouen', 'tokyo-big-sight'],
    dataConfidence: {
      routeGeometry: 'curated-geographic',
      duration: 'official-reference',
      timetable: 'official-live-link',
      vesselPosition: 'simulated'
    },
    sourceUrl: 'https://www.suijobus.co.jp/en/price/',
    description: {
      zhHant: '連接港區日之出與台場海濱公園的短程灣岸航線，途中穿越彩虹大橋橋墩下方，海景視野極佳。',
      ja: '日の出桟橋とお台場を約15〜20分で結ぶベイエリアの定番ショートアクセス。レインボーブリッジを真下から見上げます。',
      en: 'Short scenic Tokyo Bay connector between Hinode and Odaiba passing directly under Rainbow Bridge.'
    },
    path: [
      [35.65175, 139.75710], // Hinode Pier
      [35.64380, 139.76020], // Rainbow Bridge North Entrance
      [35.63750, 139.76450], // Under Rainbow Bridge Span
      [35.63120, 139.76850], // Odaiba Entrance
      [35.62885, 139.77190], // Odaiba Seaside Park Pier
      [35.62450, 139.78100], // Palette Town Fairway
      [35.62760, 139.79520]  // Tokyo Big Sight Pier
    ]
  },
  {
    id: 'hamarikyu',
    name: {
      zhHant: '濱離宮線',
      ja: '浜離宮ライン',
      en: 'Hamarikyu Line'
    },
    operator: 'TOKYO CRUISE',
    color: '#16a15b',
    approxDurationMinutes: '35–40 分鐘',
    piers: ['asakusa', 'hamarikyu', 'hinode'],
    dataConfidence: {
      routeGeometry: 'curated-geographic',
      duration: 'official-reference',
      timetable: 'official-live-link',
      vesselPosition: 'simulated'
    },
    sourceUrl: 'https://www.suijobus.co.jp/en/cruise/hamarikyu/',
    description: {
      zhHant: '專門駛入德川將軍家別邸「濱離宮恩賜庭園」水門之航線，結合大名庭園水景色與水上交通。',
      ja: '徳川将軍家ゆかりの浜離宮恩賜庭園の水門へ直接乗り入れる歴史感じる優雅なライン。',
      en: 'Special garden route navigating through the floodgate directly into Hamarikyu Gardens.'
    },
    path: [
      [35.71195, 139.79825], // Asakusa Pier
      [35.69850, 139.79150], // Umaya
      [35.68300, 139.78850], // Kiyosu
      [35.66690, 139.77580], // Tsukuda
      [35.66080, 139.76750], // Hamarikyu Gate Entry
      [35.66010, 139.76495], // Hamarikyu Pier inside Garden
      [35.65800, 139.76350], // Lock Outlet
      [35.65175, 139.75710]  // Hinode Pier
    ]
  },
  {
    id: 'hinode-toyosu',
    name: {
      zhHant: '日之出－豐洲連絡線',
      ja: '日の出・豊洲ライン',
      en: 'Hinode-Toyosu Line'
    },
    operator: 'TOKYO CRUISE',
    color: '#f5a623',
    approxDurationMinutes: '20–35 分鐘',
    piers: ['hinode', 'toyosu'],
    dataConfidence: {
      routeGeometry: 'curated-geographic',
      duration: 'operator-reference',
      timetable: 'official-live-link',
      vesselPosition: 'simulated'
    },
    sourceUrl: 'https://www.suijobus.co.jp/en/cruise/toyosu/',
    description: {
      zhHant: '連結日之出與豐洲 Urban Dock 的灣岸運河航線，方便串連豐洲市場、千客萬來與 LaLaport 購物中心。',
      ja: '日の出とおもちゃ・食の街豊洲を結ぶ運河ルート。アーバンドックららぽーと豊洲に直結。',
      en: 'Waterfront channel connecting Hinode with Toyosu Urban Dock, LaLaport, and Senkyaku Banrai.'
    },
    path: [
      [35.65175, 139.75710], // Hinode Pier
      [35.64800, 139.76600], // Harumi Canal Entrance
      [35.64950, 139.77550], // Harumi Railway Bridge site
      [35.65200, 139.78400], // Toyosu Waterway
      [35.65480, 139.79090]  // Toyosu Pier
    ]
  },
  {
    id: 'mizube-line',
    name: {
      zhHant: '東京水辺ライン (廣域水路)',
      ja: '東京水辺ライン（広域水路）',
      en: 'Tokyo Mizube Line (Wide Waterway)'
    },
    operator: '東京水辺ライン',
    color: '#8f6cff',
    approxDurationMinutes: '依區間 (30–110 分鐘)',
    piers: [
      'ryogoku', 'sumida-office', 'asakusa-nitenmon',
      'etchujima', 'seiruka-garden', 'waters-takeshiba',
      'odaiba-kaihinkouen', 'kasai-rinkai'
    ],
    dataConfidence: {
      routeGeometry: 'curated-geographic',
      duration: 'operator-reference',
      timetable: 'manual-reference',
      vesselPosition: 'simulated'
    },
    sourceUrl: 'https://www.tokyo-park.or.jp/water/bus/',
    description: {
      zhHant: '東京都公園協會營運之獨立水上巴士系統，連接兩國、墨田、二天門、竹芝、台場至葛西臨海公園等廣域碼頭。',
      ja: '東京都公園協会が運営する広域水上バス。両国・浅草二天門から竹芝・お台場・葛西臨海公園まで周遊。',
      en: 'Wide-area public waterbus system operated by Tokyo Metropolitan Park Association connecting Ryogoku, Asakusa Nitenmon, Takeshiba, Odaiba, and Kasai Rinkai Park.'
    },
    path: [
      [35.69615, 139.79280], // Ryogoku River Center
      [35.70400, 139.79500], // Sumida Channel
      [35.71110, 139.80050], // Sumida City Office
      [35.71380, 139.79980], // Asakusa Nitenmon
      [35.70000, 139.79200], // Downstream
      [35.68000, 139.78700], // Eitai Passage
      [35.66850, 139.78920], // Etchujima Pier
      [35.66690, 139.77580], // St. Luke's Garden
      [35.65420, 139.76150], // WATERS takeshiba
      [35.63800, 139.76500], // Rainbow Bridge Channel
      [35.62885, 139.77190], // Odaiba Seaside Park Pier
      [35.62600, 139.79500], // Tokyo Bay Outer Fairway
      [35.63200, 139.82500], // Shin-Nakagawa Outlet
      [35.64100, 139.86050]  // Kasai Rinkai Park Pier
    ]
  }
];
