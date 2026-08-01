/**
 * Pier Database for Tokyo Waterbus Atlas
 */

export const PIERS = [
  {
    id: 'asakusa',
    name: {
      zhHant: '淺草碼頭',
      ja: '浅草',
      en: 'Asakusa Pier'
    },
    operatorPierIds: ['tokyo-cruise-asakusa'],
    status: 'active',
    coordinates: [35.71195, 139.79825],
    routes: ['sumida-river', 'asakusa-odaiba-direct', 'hamarikyu'],
    nearestTransit: [
      '東京 Metro 銀座線 淺草站 (步行 1 分鐘)',
      '都營淺草線 淺草站 (步行 3 分鐘)',
      '東武晴空塔線 淺草站 (步行 1 分鐘)'
    ],
    highlights: ['吾妻橋 & 金色雲朵標誌', '淺草寺雷門', '東京晴空塔正面全景'],
    facilities: ['室內售票處', '自動售票機', '候船大廳', '無障礙斜坡'],
    officialUrl: 'https://www.suijobus.co.jp/en/cruise/asakusa/',
    confidence: 'official-reference'
  },
  {
    id: 'hamarikyu',
    name: {
      zhHant: '濱離宮碼頭',
      ja: '浜離宮',
      en: 'Hamarikyu Pier'
    },
    operatorPierIds: ['tokyo-cruise-hamarikyu'],
    status: 'active',
    coordinates: [35.66010, 139.76495],
    routes: ['sumida-river', 'hamarikyu'],
    nearestTransit: [
      '都營大江戶線 汐留站 (步行 7 分鐘)',
      'JR 山手線 / 都營淺草線 新橋站 (步行 12 分鐘)'
    ],
    highlights: ['濱離宮恩賜庭園 (潮入之池)', '將軍御茶屋', '高樓群與回遊式庭園強烈對比'],
    facilities: ['庭園門票乘船聯票處', '庭園休憩所', '水門景點'],
    officialUrl: 'https://www.suijobus.co.jp/en/cruise/hamarikyu/',
    confidence: 'official-reference',
    notes: '進入濱離宮碼頭登船需購買濱離宮恩賜庭園門票。'
  },
  {
    id: 'hinode',
    name: {
      zhHant: '日之出碼頭',
      ja: '日の出',
      en: 'Hinode Pier'
    },
    operatorPierIds: ['tokyo-cruise-hinode'],
    status: 'active',
    coordinates: [35.65175, 139.75710],
    routes: ['sumida-river', 'asakusa-odaiba-direct', 'hinode-odaiba', 'hamarikyu', 'hinode-toyosu'],
    nearestTransit: [
      '百合海鷗號 日之出站 (步行 2 分鐘)',
      'JR 山手線 濱松町站 (步行 8 分鐘)',
      '都營大江戶線 大門站 (步行 10 分鐘)'
    ],
    highlights: ['TOKYO CRUISE 主要轉乘樞紐', '彩景灣岸海景觀景台', 'Hi-NODE 水岸複合餐廳'],
    facilities: ['大型遊客服務中心', '輕食咖啡廳', '多語言自動售票機', '無障礙乘船通道'],
    officialUrl: 'https://www.suijobus.co.jp/en/cruise/hinode/',
    confidence: 'official-reference'
  },
  {
    id: 'odaiba-kaihinkouen',
    name: {
      zhHant: '台場海濱公園碼頭',
      ja: 'お台場海浜公園',
      en: 'Odaiba Seaside Park Pier'
    },
    operatorPierIds: ['tokyo-cruise-odaiba', 'mizube-odaiba'],
    status: 'active',
    coordinates: [35.62885, 139.77190],
    routes: ['asakusa-odaiba-direct', 'hinode-odaiba', 'mizube-line'],
    nearestTransit: [
      '百合海鷗號 台場海濱公園站 (步行 5 分鐘)',
      '臨海線 東京電訊站 (Teleport) (步行 10 分鐘)'
    ],
    highlights: ['彩虹大橋絕佳仰望視角', '自由女神像重製版', 'DECKS 東京 Beach 沙灘'],
    facilities: ['海景候船亭', '周邊購物中心與洗手間', '木棧道無障礙通廊'],
    officialUrl: 'https://www.suijobus.co.jp/en/cruise/odaiba/',
    confidence: 'official-reference'
  },
  {
    id: 'toyosu',
    name: {
      zhHant: '豐洲碼頭',
      ja: '豊洲',
      en: 'Toyosu Pier'
    },
    operatorPierIds: ['tokyo-cruise-toyosu'],
    status: 'active',
    coordinates: [35.65480, 139.79090],
    routes: ['hinode-toyosu'],
    nearestTransit: [
      '東京 Metro 有樂町線 豐洲站 (步行 6 分鐘)',
      '百合海鷗號 豐洲站 (步行 5 分鐘)'
    ],
    highlights: ['Urban Dock LaLaport 豐洲親水公園', '豐洲千客萬來 (溫泉與海鮮街)', '灣岸造船廠歷史景觀吊車'],
    facilities: ['LaLaport 購物中心設施', '水岸步道', 'Ticket Desk'],
    officialUrl: 'https://www.suijobus.co.jp/en/cruise/toyosu/',
    confidence: 'official-reference'
  },
  {
    id: 'tokyo-big-sight',
    name: {
      zhHant: '東京 Big Sight 碼頭',
      ja: '東京ビッグサイト',
      en: 'Tokyo Big Sight Pier'
    },
    operatorPierIds: ['tokyo-cruise-bigsight'],
    status: 'active',
    coordinates: [35.62760, 139.79520],
    routes: ['hinode-odaiba'],
    nearestTransit: [
      '百合海鷗號 東京 Big Sight 站 (步行 7 分鐘)',
      '臨海線 國際展示場站 (步行 10 分鐘)'
    ],
    highlights: ['東京國際展示場 (倒金字塔建築)', '有明灣岸展覽園區'],
    facilities: ['展館連通道', '大型候船棚'],
    officialUrl: 'https://www.suijobus.co.jp/en/cruise/bigsight/',
    confidence: 'official-reference'
  },
  {
    id: 'palette-town',
    name: {
      zhHant: 'Palette Town 碼頭 (歷史/核驗)',
      ja: 'パレットタウン',
      en: 'Palette Town Pier (Historical/Verify)'
    },
    operatorPierIds: ['tokyo-cruise-palettetown'],
    status: 'verification-needed',
    coordinates: [35.62580, 139.78160],
    routes: ['hinode-odaiba'],
    nearestTransit: [
      '百合海鷗號 青海站 (步行 3 分鐘)'
    ],
    highlights: ['青海灣岸再開發區 (歷史摩天輪舊址)', 'Zepp DiverCity 附近'],
    facilities: ['候船站台 (營運狀態請見當日公告)'],
    officialUrl: 'https://www.suijobus.co.jp/en/today-operation/',
    confidence: 'operator-reference',
    notes: '舊 Palette Town 摩天輪區經再開發，班次與運航狀態請以官方當日公告為準。'
  },
  {
    id: 'ryogoku',
    name: {
      zhHant: '兩國 River Center 碼頭',
      ja: '両国リバーセンター',
      en: 'Ryogoku River Center Pier'
    },
    operatorPierIds: ['mizube-ryogoku'],
    status: 'active',
    coordinates: [35.69615, 139.79280],
    routes: ['mizube-line'],
    nearestTransit: [
      'JR 總武線 兩國站 (西口步行 3 分鐘)',
      '都營大江戶線 兩國站 (步行 8 分鐘)'
    ],
    highlights: ['兩國國技館 (相撲大賽)', '江戶東京博物館', '兩國 River Center 複合館'],
    facilities: ['水辺ライン主要乘船大廳', '防災水邊碼頭處', '洗手洗手間與休息區'],
    officialUrl: 'https://www.tokyo-park.or.jp/water/bus/',
    confidence: 'operator-reference'
  },
  {
    id: 'sumida-office',
    name: {
      zhHant: '墨田區役所前碼頭',
      ja: '墨田区役所前',
      en: 'Sumida City Office Pier'
    },
    operatorPierIds: ['mizube-sumida-office'],
    status: 'active',
    coordinates: [35.71110, 139.80050],
    routes: ['mizube-line'],
    nearestTransit: [
      '東武 / 地鐵 淺草站 (步行 5 分鐘)',
      '本所吾妻橋站 (步行 6 分鐘)'
    ],
    highlights: ['墨田區役所大樓', '勝海舟銅像', '隅田公園櫻花名所'],
    facilities: ['親水公園步道', '無障礙通道'],
    officialUrl: 'https://www.tokyo-park.or.jp/water/bus/',
    confidence: 'operator-reference'
  },
  {
    id: 'asakusa-nitenmon',
    name: {
      zhHant: '淺草二天門碼頭',
      ja: '浅草二天門',
      en: 'Asakusa Nitenmon Pier'
    },
    operatorPierIds: ['mizube-asakusa-nitenmon'],
    status: 'active',
    coordinates: [35.71380, 139.79980],
    routes: ['mizube-line'],
    nearestTransit: [
      '東武晴空塔線 淺草站 (步行 4 分鐘)',
      '東京 Metro 銀座線 淺草站 (步行 6 分鐘)'
    ],
    highlights: ['淺草寺二天門直達入口', '隅田川水岸步道', '東武鐵道橋景觀'],
    facilities: ['東京水辺ライン專用浮碼頭'],
    officialUrl: 'https://www.tokyo-park.or.jp/water/bus/',
    confidence: 'operator-reference'
  },
  {
    id: 'etchujima',
    name: {
      zhHant: '越中島碼頭',
      ja: '越中島',
      en: 'Etchujima Pier'
    },
    operatorPierIds: ['mizube-etchujima'],
    status: 'active',
    coordinates: [35.66850, 139.78920],
    routes: ['mizube-line'],
    nearestTransit: [
      'JR 京葉線 越中島站 (步行 5 分鐘)',
      '東京 Metro 東陽町 / 門前仲町站 (步行 10 分鐘)'
    ],
    highlights: ['越中島公園 (東京海洋大學周邊)', '晴海運河眺望點'],
    facilities: ['公園公共洗手間', '無障礙步道'],
    officialUrl: 'https://www.tokyo-park.or.jp/water/bus/',
    confidence: 'operator-reference'
  },
  {
    id: 'seiruka-garden',
    name: {
      zhHant: '聖路加花園前碼頭',
      ja: '聖路加ガーデン前',
      en: "St. Luke's Garden Pier"
    },
    operatorPierIds: ['mizube-seiruka'],
    status: 'active',
    coordinates: [35.66690, 139.77580],
    routes: ['mizube-line'],
    nearestTransit: [
      '東京 Metro 日比谷線 築地站 (步行 7 分鐘)',
      '東京 Metro 有樂町線 新富町站 (步行 8 分鐘)'
    ],
    highlights: ['聖路加國際醫院與摩天樓群', '築地場外市場 (步行距離)'],
    facilities: ['明石町河岸公園設施'],
    officialUrl: 'https://www.tokyo-park.or.jp/water/bus/',
    confidence: 'operator-reference'
  },
  {
    id: 'waters-takeshiba',
    name: {
      zhHant: 'WATERS takeshiba (竹芝碼頭)',
      ja: 'WATERS takeshiba（竹芝）',
      en: 'WATERS takeshiba Pier'
    },
    operatorPierIds: ['mizube-takeshiba'],
    status: 'active',
    coordinates: [35.65420, 139.76150],
    routes: ['mizube-line'],
    nearestTransit: [
      '百合海鷗號 竹芝站 (步行 3 分鐘)',
      'JR 山手線 濱松町站 (步行 6 分鐘)'
    ],
    highlights: ['WATERS takeshiba 綜合商業區', '劇團四季劇場', '濱離宮庭園水門視角'],
    facilities: ['無障礙水岸廣場', '複合餐飲中心'],
    officialUrl: 'https://www.tokyo-park.or.jp/water/bus/',
    confidence: 'operator-reference'
  },
  {
    id: 'kasai-rinkai',
    name: {
      zhHant: '葛西臨海公園碼頭',
      ja: '葛西臨海公園',
      en: 'Kasai Rinkai Park Pier'
    },
    operatorPierIds: ['mizube-kasai-rinkai'],
    status: 'active',
    coordinates: [35.64100, 139.86050],
    routes: ['mizube-line'],
    nearestTransit: [
      'JR 京葉線 葛西臨海公園站 (步行 8 分鐘)'
    ],
    highlights: ['葛西臨海公園大觀覽車 (鑽石與花大摩天輪)', '葛西臨海水族園', '東京灣外海闊景'],
    facilities: ['水族園休息站', '公園大型遊客中心'],
    officialUrl: 'https://www.tokyo-park.or.jp/water/bus/',
    confidence: 'operator-reference'
  }
];
