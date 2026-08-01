/**
 * Official Sources Metadata for Tokyo Waterbus Atlas
 */

export const SOURCES = {
  lastUpdated: '2026-07-29',
  disclaimer: {
    zhHant: '本平台所有船隻位置均為瀏覽器端平滑模擬動態，非即時 AIS 或官方 GPS 真實船位。搭乘前請務必點擊連結確認當日官方營運狀態。',
    ja: '本プラットフォームの船舶位置はすべてブラウザ上のシミュレーションであり、リアルタイムAISや公式GPSデータではありません。ご乗車前に必ず公式ページをご確認ください。',
    en: 'All vessel positions displayed are browser-based smooth simulations, not live AIS or official GPS feeds. Please verify official operation status before travel.'
  },
  operators: [
    {
      id: 'TOKYO CRUISE',
      name: 'TOKYO CRUISE (東京都觀光汽船)',
      officialSite: 'https://www.suijobus.co.jp/en/',
      priceSite: 'https://www.suijobus.co.jp/en/price/',
      todayStatusSite: 'https://www.suijobus.co.jp/en/today-operation/',
      confidence: 'official-reference',
      notes: '涵蓋淺草、濱離宮、日之出、台場海濱公園、豐洲等主要水上觀光航線。'
    },
    {
      id: '東京水辺ライン',
      name: '東京水辺ライン (東京都公園協會)',
      officialSite: 'https://www.tokyo-park.or.jp/water/bus/',
      priceSite: 'https://www.tokyo-park.or.jp/water/bus/',
      todayStatusSite: 'https://www.tokyo-park.or.jp/water/bus/',
      confidence: 'operator-reference',
      notes: '涵蓋兩國、墨田區役所前、淺草二天門、越中島、竹芝、台場、葛西臨海公園等廣域水路。'
    }
  ]
};
