/**
 * Multilingual Pier Arrival Cards Dataset for Tokyo Waterbus Atlas (Phase 1A)
 * Data-driven source of truth for the 4 featured piers: Asakusa, Hinode, Hamarikyu, Odaiba Seaside Park.
 */

export const PIER_ARRIVAL_CARDS = {
  'asakusa': {
    id: 'asakusa',
    name: {
      'zh-TW': '淺草碼頭',
      'ja': '浅草',
      'en': 'Asakusa Pier',
      'ko': '아사쿠사 선착장'
    },
    officialJapaneseName: '浅草乗り場',
    romanizedName: 'Asakusa Pier',
    operator: 'TOKYO CRUISE (東京都觀光汽船)',
    coordinates: [35.71195, 139.79825],
    googleMapsQuery: 'Asakusa Pier Tokyo Sightseeing Cruise 浅草乗り場',
    usefulFor: {
      'zh-TW': '淺草寺、雷門、東京晴空塔與隅田川水上觀光核心出發點。',
      'en': 'Main terminal for Sensoji Temple, Kaminarimon, Tokyo Skytree view, and Sumida River cruises.',
      'ja': '浅草寺、雷門、東京スカイツリー展望、隅田川ラインの主要発着拠点。',
      'ko': '센소지, 카미나리몬, 도쿄 스카이트리 조망 및 스미다가와 크루즈의 주요 출발지.'
    },
    officialAddress: {
      'zh-TW': '東京都台東區花川戶 1-1-1 (吾妻橋頭)',
      'en': '1-1-1 Hanakawado, Taito-ku, Tokyo (Near Azuma Bridge)',
      'ja': '東京都台東区花川戸1-1-1 (吾妻橋たもと)',
      'ko': '도쿄도 타이토구 하나카와도 1-1-1 (아즈마바시 옆)'
    },
    nearestTransit: {
      'zh-TW': [
        '東京 Metro 銀座線 淺草站 1 號出口 (步行 1 分鐘)',
        '東武晴空塔線 淺草站 (步行 1 分鐘)',
        '都營淺草線 淺草站 A5 出口 (步行 3 分鐘)'
      ],
      'en': [
        'Tokyo Metro Ginza Line Asakusa Sta Exit 1 (1 min walk)',
        'Tobu Skytree Line Asakusa Sta (1 min walk)',
        'Toei Asakusa Line Asakusa Sta Exit A5 (3 min walk)'
      ],
      'ja': [
        '東京メトロ銀座線 浅草駅 1番出口 (徒歩1分)',
        '東武スカイツリーライン 浅草駅 (徒歩1分)',
        '都営浅草線 浅草駅 A5出口 (徒歩3分)'
      ],
      'ko': [
        '도쿄 메트로 긴자선 아사쿠사역 1번 출구 (도보 1분)',
        '토부 스카이트리선 아사쿠사역 (도보 1분)',
        '도에이 아사쿠사선 아사쿠사역 A5 출구 (도보 3분)'
      ]
    },
    officialPierUrl: 'https://www.suijobus.co.jp/en/cruise/asakusa/',
    officialTodayStatusUrl: 'https://www.suijobus.co.jp/guide/operation/',
    officialTimetableUrl: 'https://www.suijobus.co.jp/guide/timetable/',
    retrievedAtUtc: '2026-08-02T12:00:00Z',
    confidence: 'official-reference'
  },
  'hinode': {
    id: 'hinode',
    name: {
      'zh-TW': '日之出碼頭',
      'ja': '日の出',
      'en': 'Hinode Pier',
      'ko': '히노데 선착장'
    },
    officialJapaneseName: '日の出乗り場',
    romanizedName: 'Hinode Pier',
    operator: 'TOKYO CRUISE (東京都觀光汽船)',
    coordinates: [35.65175, 139.75710],
    googleMapsQuery: 'Hinode Pier Tokyo Cruise 日の出乗り場',
    usefulFor: {
      'zh-TW': 'TOKYO CRUISE 樞紐碼頭，轉乘前往台場、濱離宮與豐洲。',
      'en': 'Central hub terminal for TOKYO CRUISE transfers to Odaiba, Hamarikyu, and Toyosu.',
      'ja': 'TOKYO CRUISE の主要ハブ。お台場、浜離宮、豊洲方面への乗り換え拠点。',
      'ko': 'TOKYO CRUISE의 주요 환승 허브. 오다이바, 하마리큐, 토요스 방면 환승.'
    },
    officialAddress: {
      'zh-TW': '東京都港區海岸 2-7-104',
      'en': '2-7-104 Kaigan, Minato-ku, Tokyo',
      'ja': '東京都港区海岸2-7-104',
      'ko': '도쿄도 미나토구 카이간 2-7-104'
    },
    nearestTransit: {
      'zh-TW': [
        '百合海鷗號 日之出站 (步行 2 分鐘)',
        'JR 山手線 / 京濱東北線 濱松町站 南口 (步行 8 分鐘)',
        '都營淺草線 / 大江戶線 大門站 (步行 10 分鐘)'
      ],
      'en': [
        'Yurikamome Line Hinode Sta (2 min walk)',
        'JR Yamanote / Keihin-Tohoku Line Hamamatsucho Sta South Exit (8 min walk)',
        'Toei Asakusa / Oedo Line Daimon Sta (10 min walk)'
      ],
      'ja': [
        'ゆりかもめ 日の出駅 (徒歩2分)',
        'JR山手線・京浜東北線 浜松町駅 南口 (徒歩8分)',
        '都営浅草線・大江戸線 大門駅 (徒歩10分)'
      ],
      'ko': [
        '유리카모메 히노데역 (도보 2분)',
        'JR 야마노테선/케이힌토호쿠선 하마마츠초역 남쪽 출구 (도보 8분)',
        '도에이 아사쿠사선/오에도선 다이몬역 (도보 10분)'
      ]
    },
    officialPierUrl: 'https://www.suijobus.co.jp/en/cruise/hinode/',
    officialTodayStatusUrl: 'https://www.suijobus.co.jp/guide/operation/',
    officialTimetableUrl: 'https://www.suijobus.co.jp/guide/timetable/',
    retrievedAtUtc: '2026-08-02T12:00:00Z',
    confidence: 'official-reference'
  },
  'hamarikyu': {
    id: 'hamarikyu',
    name: {
      'zh-TW': '濱離宮碼頭',
      'ja': '浜離宮',
      'en': 'Hamarikyu Pier',
      'ko': '하마리큐 선착장'
    },
    officialJapaneseName: '浜離宮乗り場',
    romanizedName: 'Hamarikyu Pier',
    operator: 'TOKYO CRUISE (東京都觀光汽船)',
    coordinates: [35.66010, 139.76495],
    googleMapsQuery: 'Hamarikyu Gardens Waterbus Pier 浜離宮乗り場',
    usefulFor: {
      'zh-TW': '位於濱離宮恩賜庭園內，可從淺草搭船直達庭園水門。',
      'en': 'Located inside Hamarikyu Gardens. Direct water access from Asakusa to the historic garden water gate.',
      'ja': '浜離宮恩賜庭園内に位置し、浅草から庭園水門への直通アクセスが可能。',
      'ko': '하마리큐 온시 정원 내 위치. 아사쿠사에서 정원 수문으로 직통 입장 가능.'
    },
    officialAddress: {
      'zh-TW': '東京都中央區濱離宮庭園 1-1 (庭園內水門旁)',
      'en': '1-1 Hamarikyu-teien, Chuo-ku, Tokyo (Inside Gardens)',
      'ja': '東京都中央区浜離宮庭園1-1 (園内水門横)',
      'ko': '도쿄도 주오구 하마리큐테이엔 1-1 (정원 내)'
    },
    nearestTransit: {
      'zh-TW': [
        '都營大江戶線 汐留站 (步行 7 分鐘至園口)',
        'JR 山手線 新橋站 (步行 12 分鐘至園口)'
      ],
      'en': [
        'Toei Oedo Line Shiodome Sta (7 min walk to garden entrance)',
        'JR Yamanote Line Shimbashi Sta (12 min walk to garden entrance)'
      ],
      'ja': [
        '都営大江戸線 汐留駅 (庭園入口まで徒歩7分)',
        'JR山手線 新橋駅 (庭園入口まで徒歩12分)'
      ],
      'ko': [
        '도에이 오에도선 시오도메역 (정원 입구까지 도보 7분)',
        'JR 야마노테선 신바시역 (정원 입구까지 도보 12분)'
      ]
    },
    officialNotes: {
      'zh-TW': '登碼頭需購買濱離宮恩賜庭園門票。',
      'en': 'Admission ticket to Hamarikyu Gardens is required upon entry.',
      'ja': '浜離宮恩賜庭園への入園料が別途必要となります。',
      'ko': '하마리큐 온시 정원 입장권이 별도로 필요합니다.'
    },
    officialPierUrl: 'https://www.suijobus.co.jp/en/cruise/hamarikyu/',
    officialTodayStatusUrl: 'https://www.suijobus.co.jp/guide/operation/',
    officialTimetableUrl: 'https://www.suijobus.co.jp/guide/timetable/',
    retrievedAtUtc: '2026-08-02T12:00:00Z',
    confidence: 'official-reference'
  },
  'odaiba-kaihinkouen': {
    id: 'odaiba-kaihinkouen',
    name: {
      'zh-TW': '台場海濱公園碼頭',
      'ja': 'お台場海浜公園',
      'en': 'Odaiba Seaside Park Pier',
      'ko': '오다이바 해변공원 선착장'
    },
    officialJapaneseName: 'お台場海浜公園乗り場',
    romanizedName: 'Odaiba Seaside Park Pier',
    operator: 'TOKYO CRUISE (東京都觀光汽船) & 東京水辺ライン',
    coordinates: [35.62885, 139.77190],
    googleMapsQuery: 'Odaiba Seaside Park Pier お台場海浜公園乗り場',
    usefulFor: {
      'zh-TW': '台場購物商圈、彩虹大橋觀景台與沙灘步道乘船點。',
      'en': 'Access point for Odaiba shopping malls, Rainbow Bridge promenade, and beach park.',
      'ja': 'お台場ショッピングモール、レインボーブリッジ眺望、ビーチ公園への乗船拠点。',
      'ko': '오다이바 쇼핑몰, 레인보우 브릿지 조망 및 해변 공원 승선 거점.'
    },
    officialAddress: {
      'zh-TW': '東京都港區台場 1-4 (台場海濱公園沙灘前)',
      'en': '1-4 Daiba, Minato-ku, Tokyo (Odaiba Beachfront)',
      'ja': '東京都港区台場1-4 (お台場海浜公園砂浜前)',
      'ko': '도쿄도 미나토구 다이바 1-4 (오다이바 해변 공원 앞)'
    },
    nearestTransit: {
      'zh-TW': [
        '百合海鷗號 台場海濱公園站 (步行 5 分鐘)',
        '臨海線 東京電訊站 (Teleport) (步行 10 分鐘)'
      ],
      'en': [
        'Yurikamome Line Odaiba-kaihinkouen Sta (5 min walk)',
        'Rinkai Line Tokyo Teleport Sta (10 min walk)'
      ],
      'ja': [
        'ゆりかもめ お台場海浜公園駅 (徒歩5分)',
        'りんかい線 東京テレポート駅 (徒歩10分)'
      ],
      'ko': [
        '유리카모메 오다이바 해변공원역 (도보 5분)',
        '린카이선 도쿄 텔레포트역 (도보 10분)'
      ]
    },
    officialPierUrl: 'https://www.suijobus.co.jp/en/cruise/odaiba/',
    officialTodayStatusUrl: 'https://www.suijobus.co.jp/guide/operation/',
    officialTimetableUrl: 'https://www.suijobus.co.jp/guide/timetable/',
    retrievedAtUtc: '2026-08-02T12:00:00Z',
    confidence: 'official-reference'
  }
};
