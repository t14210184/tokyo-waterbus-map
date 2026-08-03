/**
 * Traditional Chinese (zh-TW) Locale Dictionary
 */
export const zhTW = {
  header: {
    title: 'Tokyo Waterbus Atlas',
    subtitle: '東京水上巴士 官方狀態・時刻指引・碼頭探索',
    languageBadge: '語言: 繁體中文'
  },
  tabs: {
    today: '今天狀態',
    routes: '航線',
    piers: '碼頭',
    planner: '行程規劃',
    guide: '攻略',
    explore: '探索'
  },
  statusChip: {
    noSimulation: '● 目前無可驗證的模擬航行',
    offlineDemoActive: '● 離線示範中，不代表即時船位或實際營運',
    startDemoBtn: '▶ 啟動離線示範',
    stopDemoBtn: '⏹ 停止示範',
    resetDemoBtn: '重設示範'
  },
  disclaimer: {
    bannerText: '離線示範：非 GPS/AIS、非即時船位、非當日班次。航線為概略參考，不可用於導航或安全判斷。',
    understandDataLevels: '了解資料層級',
    close: '關閉 ×'
  },
  theme: {
    toggleBtn: '切換底圖：',
    dark: '深色',
    light: '淺色',
    none: '無 (參考資料)'
  },
  todayPanel: {
    title: '今日營運狀態與官方連結',
    badge: '官方連結驗證',
    intro: '● 本系統提供官方驗證入口，不虛構即時船位。東京水上巴士 Atlas 為參考導覽工具，幫助您快速前往各航商當日最新官方營運頁面與時刻表。搭乘前請務必確認官方最新公告。',
    tokyoCruiseTitle: 'TOKYO CRUISE (東京都觀光汽船)',
    tokyoCruiseStatus: '正常狀態待官方確認',
    tokyoCruiseDesc: '隅田川線、淺草-台場直航線、日之出-台場線等常態航班，請點擊下方官方連結查看今日最新動態與航班表。',
    tokyoCruiseAction: 'TOKYO CRUISE 今日運航狀況',
    tokyoCruiseTimetableAction: '官方時刻表與票價',
    mizubeStatusLabel: '暫停營運',
    checkBasis: '查核依據：公開時刻表與官方告示 ｜ 查核時間：2026-08-02',
    mizubeAction: '點此開啟東京水辺ライン官方營運公告',
    footerDisclosure: 'This app tells me where to check today\'s official answer; it does not invent it. 本系統純屬旅遊導覽參考，不代表官方發言或航行保障。'
  },
  pierCard: {
    sectionTitle: '碼頭到達與搭乘卡',
    featuredBadge: '重點推薦碼頭',
    whatUsefulFor: '這座碼頭適合在哪裡使用：',
    addressLabel: '官方位置與地址：',
    nearestTransitLabel: '最近車站與步行時間：',
    checklistTitle: '出發前必看檢查清單：',
    checkItem1: '確認今日官方營運狀況（受強風暴潮影響可能臨時停航）',
    checkItem2: '查看官方最新時刻表與票價',
    checkItem3: '預留至少 15 分鐘購票與候船時間',
    actionPierPage: '開啟官方碼頭頁面',
    actionTodayStatus: '查看今日營運狀態',
    actionTimetable: '查看官方時刻表',
    actionGoogleMaps: '在 Google 地圖開啟碼頭區域',
    confidenceLabel: '地點驗證與照片狀態：',
    photoStatus: '現地辨識照片：建置中',
    confidenceConfirmed: '官方位置已確認',
    accessibilityTitle: '無障礙設施與設施：',
    facilitiesUnconfirmed: '無障礙詳細資訊需依官方現場確認',
    missedFallbackTitle: '錯過班次或臨時停航應變：',
    missedFallbackDesc: '請即時查看官方告示，並依需求改搭地下鐵或 JR 鐵路路線。',
    provenanceTitle: '資料來源與校驗：',
    provenanceDesc: '資料來源：官方網站公告 ｜ 最後校驗時間：',
    mizubeSuspensionTitle: '東京水辺ライン：暫停營運',
    mizubeSuspensionBody: '自 2026 年 1 月 19 日起暫停營運，復航日期尚待官方公告。目前無法在此搭乘東京水辺ライン。出發前請查看官方公告。',
    mizubeSuspensionLink: '開啟東京水辺ライン官方營運公告',
    statusActive: '常態營運',
    statusSuspended: '暫停營運',
    statusPartial: '部分營運（包含暫停航線）',
    statusVerify: '請向官方確認'
  },
  footer: {
    officialPortal: '官方營運資訊門戶',
    lastValidated: '最後資料校驗:',
    secondaryReviewBtn: '資料品質與審核 (RGR)'
  },
  confidence: {
    officialConfirmed: '官方核驗',
    officialConfirmedDesc: '直接連結當日官方營運及公告頁面。',
    timetableEstimate: '時刻表參考',
    timetableEstimateDesc: '依據公開官方班表推算之服務區間，非 AIS/GPS 即時船位。',
    offlineStoryDemo: '離線示範',
    offlineStoryDemoDesc: '使用者手動觸發之純概念幾何示範動畫。',
    suspendedOrUnknown: '暫停或待確認',
    suspendedOrUnknownDesc: '官方宣布暫停營運或缺乏當日驗證資料。'
  },
  provenance: {
    officialSourceLink: '官方來源頁面 ↗',
    publishedAt: '官方發布時間',
    checkedAt: '人工校驗時間',
    fetchedAt: '自動抓取時間',
    referenceOnly: '參考資料。出發前請向營運商官方頁面確認當日實際營運班次與航線。',
    defaultLimitation: '非即時 GPS/AIS 追蹤。資料僅供旅遊行程參考。'
  },
  arrival: {
    title: '碼頭到達指引',
    addressLabel: '地址',
    stationsLabel: '鄰近車站與步行指引',
    officialBoardingLink: '官方乘車/導覽頁面 ↗',
    accessibilityPendingNotice: '無障礙設施與照片導覽：待官方現場核驗 (PENDING)',
    nonHinodePendingNotice: '本碼頭無障礙詳細資訊與照片導覽尚未經官方現場核驗，狀態維持 PENDING。'
  }
};
