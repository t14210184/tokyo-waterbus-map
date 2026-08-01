/**
 * Ride Guide & Scenario Recommendation Data for Tokyo Waterbus Atlas
 */

export const GUIDES = [
  {
    id: 'first-timer',
    icon: '✨',
    tag: '新手推薦',
    title: {
      zhHant: '第一次搭東京水上巴士？經典淺草航線指南',
      ja: '初めての水上バス？浅草発の王道ルート案内',
      en: 'First Time Riding Tokyo Waterbus? Classic Asakusa Route'
    },
    recommendation: {
      routeId: 'sumida-river',
      originPier: 'asakusa',
      destinationPier: 'hinode'
    },
    summary: {
      zhHant: '強烈推薦從「淺草碼頭」出發！沿隅田川南下可一次看盡吾妻橋、清洲橋、勝鬨橋與晴空塔，抵達日之出再轉乘至台場。',
      en: 'Depart from Asakusa Pier down Sumida River for iconic bridge and Skytree views.'
    },
    checklist: [
      '建議提早 15–20 分鐘抵達淺草碼頭購票與排隊登船',
      '沿線將通過 12 座歷史名橋，選擇甲板或靠窗座位視野佳',
      '抵達日之出碼頭後可順遊 Hi-NODE 或一鍵轉乘台場線'
    ],
    officialTip: '當日船班與船型請於出發當天至 TOKYO CRUISE 官方頁面確認。'
  },
  {
    id: 'rainbow-bridge-view',
    icon: '🌉',
    tag: '景觀攝影',
    title: {
      zhHant: '想要近距離仰望彩虹大橋？最佳灣岸航線',
      ja: 'レインボーブリッジを真下から仰ぐ絶景ルート',
      en: 'Want Up-Close Rainbow Bridge Views?'
    },
    recommendation: {
      routeId: 'hinode-odaiba',
      originPier: 'hinode',
      destinationPier: 'odaiba-kaihinkouen'
    },
    summary: {
      zhHant: '選「日之出－台場線」僅需 15–20 分鐘，船隻會直接從彩虹大橋兩座巨大橋墩正下方穿越，航拍視野無敵。',
      en: '15-20 min short route navigating right beneath Rainbow Bridge spans.'
    },
    checklist: [
      '黃昏與傍晚航次可同時捕捉彩虹大橋點燈與東京灣夕陽',
      '船隻進入台場灣時可準備相機拍攝自由女神像與球體展望台'
    ],
    officialTip: '強風特報發布時彩虹大橋下水域易有浪，請預先確認運航狀況。'
  },
  {
    id: 'futuristic-ships',
    icon: '🚀',
    tag: '松本零士作品',
    title: {
      zhHant: '想搭 Himiko / Hotaluna 未來感銀河船艦？',
      ja: 'ヒミコ・ホタルナ・エメラルダスに乗りたい！',
      en: 'Futuristic Vessels: Himiko, Hotaluna & Emeraldas'
    },
    recommendation: {
      routeId: 'asakusa-odaiba-direct',
      originPier: 'asakusa',
      destinationPier: 'odaiba-kaihinkouen'
    },
    summary: {
      zhHant: '由日本國寶級漫畫家松本零士親自設計之太空水滴型船艦，配備 360 度觀景玻璃與《銀河鐵道 999》船內廣播。',
      en: 'Space-age glass teardrop vessels designed by anime legend Leiji Matsumoto.'
    },
    checklist: [
      'Himiko 與 Hotaluna 為指定班次營運，非所有淺草班次均為未來船',
      'Hotaluna 與 Emeraldas 配備屋頂外步道甲板，航行中可登頂觀景',
      '客滿率較高，建議熱門假日提前完成預約'
    ],
    officialTip: '未來感船隻可能因定期檢修暫時替換為一般船型，出發前請以官方當日公告為準。'
  },
  {
    id: 'skytree-bridges',
    icon: '📸',
    tag: '打卡地標',
    title: {
      zhHant: '想拍東京晴空塔與名橋巡禮？',
      ja: '東京スカイツリーと12の名橋を撮り尽くす',
      en: 'Photographing Skytree & Historic Bridges'
    },
    recommendation: {
      routeId: 'sumida-river',
      originPier: 'asakusa',
      destinationPier: 'hamarikyu'
    },
    summary: {
      zhHant: '隅田川航線行經吾妻橋、清洲橋、永代橋與勝鬨橋。從淺草離港前幾分鐘，能拍到晴空塔與金色雲朵同框的黃金視角。',
      en: 'Frame Tokyo Skytree with the Asahi Flame and iconic red bridges.'
    },
    checklist: [
      '出淺草港時請坐在右舷靠窗或甲板後方，可捕捉晴空塔全景',
      '行經清洲橋時留意橋樑線條與遠處高樓群對比'
    ],
    officialTip: '河川航線受潮汐水位影響，特殊大潮日可能調整過橋航速。'
  },
  {
    id: 'family-short-trip',
    icon: '👨‍👩‍👧',
    tag: '親子輕鬆',
    title: {
      zhHant: '帶著長輩或小孩？短程無負擔水上體驗',
      ja: 'ファミリー・シニア向け短時間お気楽ルート',
      en: 'Family & Senior Friendly Short Cruise'
    },
    recommendation: {
      routeId: 'hinode-odaiba',
      originPier: 'hinode',
      destinationPier: 'odaiba-kaihinkouen'
    },
    summary: {
      zhHant: '日之出至台場僅 15–20 分鐘，航程平穩不易暈船，碼頭均具備完整無障礙斜坡與電梯，輕鬆串接台場商場。',
      en: '15-20 min smooth sailing with full accessibility and shopping access.'
    },
    checklist: [
      '日之出碼頭候船室設有乾淨洗手間與室內休息座椅',
      '台場海濱公園碼頭出站即為沙灘與 DECKS 購物中心'
    ],
    officialTip: '推車與輪椅可順暢上船，登船前服務人員會予以協助。'
  },
  {
    id: 'multi-spot-mizube',
    icon: '🌿',
    tag: '深度廣域',
    title: {
      zhHant: '想從水路深入兩國、越中島與葛西臨海公園？',
      ja: '両国・越中島・葛西臨海公園への広域水路旅',
      en: 'Explore Wide Waterways: Tokyo Mizube Line'
    },
    recommendation: {
      routeId: 'mizube-line',
      originPier: 'ryogoku',
      destinationPier: 'kasai-rinkai'
    },
    summary: {
      zhHant: '搭乘東京都公園協會營運的「東京水辺ライン」，可直達兩國相撲街、聖路加花園與葛西臨海水族園。',
      en: 'Hop between cultural spots like Ryogoku Sumo Hall and Kasai Rinkai Park.'
    },
    checklist: [
      '水辺ライン班次較稀疏（部分區間 1-2 小時一班），務必先確認時刻表',
      '兩國 River Center 碼頭周邊有江戶東京主題餐飲區'
    ],
    officialTip: '水辺ライン屬獨立營運商，票價與 TOKYO CRUISE 不通用。'
  },
  {
    id: 'weather-backup',
    icon: '🌧️',
    tag: '雨天備案',
    title: {
      zhHant: '天候不佳或強風特報？搭乘決策與備案',
      ja: '雨天・強風時の運休確認と代替アクセス',
      en: 'Rainy Day or High Wind Weather Backup'
    },
    recommendation: {
      routeId: 'sumida-river',
      originPier: 'asakusa',
      destinationPier: 'hinode'
    },
    summary: {
      zhHant: '水上巴士全船均設有室內全景玻璃艙，小雨不影響搭乘；但若遇到颱風、濃霧或強風，官方可能隨時停駛。',
      en: 'All vessels feature indoor panoramic glass. High winds may cause suspension.'
    },
    checklist: [
      '切勿單依據模擬動態畫面做搭乘決策！',
      '請直接點擊本站「官方當日營運狀態」連結確認實時公告',
      '若水上巴士停駛，可改搭百合海鷗號或都營淺草線替代'
    ],
    officialTip: '請注意：強風警報發布時，台場線與葛西臨海公園線停駛機率高於河川線。'
  }
];
