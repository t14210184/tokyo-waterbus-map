/**
 * Source-Aware Pier Arrival Guidance Registry (Phase 0 Final Closure)
 * Strictly distinguishes verified arrival guidance fields from unsupported/pending fields.
 */

export const PIER_ARRIVAL_GUIDANCE = {
  hinode: {
    pierId: 'hinode',
    status: 'PARTIAL', // Address, station & walking guidance verified from official TOKYO CRUISE source
    displayNames: {
      ja: '日の出桟橋',
      romaji: 'Hinode Sanbashi',
      'zh-TW': '日之出碼頭',
      en: 'Hinode Pier',
      ko: '히노데 선착장'
    },
    officialBoardingUrl: 'https://www.suijobus.co.jp/en/cruise/hinode/',
    address: '2-7-104 Kaigan, Minato-ku, Tokyo 105-0022',
    nearestStations: [
      { name: 'Yurikamome Hinode Station', walkMinutes: 2 },
      { name: 'JR Yamanote / Keihin-Tohoku Line Hamamatsucho Station', walkMinutes: 8 }
    ],
    walkingGuidance: [
      'From Yurikamome Hinode Station, exit towards Kaigan-dori and walk approx 2 minutes east directly to the pier terminal building.',
      'From JR Hamamatsucho Station, follow the pedestrian route towards Hinode Pier (approx 8 minutes walk).'
    ],
    mapLinks: {
      google: 'https://www.google.com/maps/search/?api=1&query=Hinode+Pier+Tokyo+2-7-104+Kaigan',
      apple: 'https://maps.apple.com/?address=2-7-104,Kaigan,Minato-ku,Tokyo'
    },
    accessibility: {
      status: 'PENDING', // Not inferred from imagery, awaiting official accessibility audit
      officialUrl: 'https://www.suijobus.co.jp/en/cruise/hinode/',
      notesKey: 'arrival.accessibilityPending'
    },
    fallbackTransport: {
      status: 'VERIFIED',
      notesKey: 'arrival.hinodeFallback'
    },
    sources: [
      {
        sourceType: 'official-operator',
        url: 'https://www.suijobus.co.jp/en/cruise/hinode/',
        title: 'TOKYO CRUISE Hinode Pier Boarding & Access Guide',
        publishedAt: '2026-01-01',
        checkedAt: '2026-08-03',
        supportsFields: ['address', 'nearestStations', 'walkingGuidance', 'officialBoardingUrl']
      }
    ]
  }
};

export function getPierArrivalGuidance(pierId) {
  if (PIER_ARRIVAL_GUIDANCE[pierId]) {
    return PIER_ARRIVAL_GUIDANCE[pierId];
  }

  // Default PENDING record for unverified piers
  return {
    pierId,
    status: 'PENDING',
    displayNames: { ja: '', romaji: '', 'zh-TW': '', en: '', ko: '' },
    officialBoardingUrl: '',
    address: '',
    nearestStations: [],
    walkingGuidance: [],
    mapLinks: { google: '', apple: '' },
    accessibility: { status: 'PENDING', officialUrl: '', notesKey: 'arrival.accessibilityPending' },
    fallbackTransport: { status: 'PENDING', notesKey: 'arrival.transportPending' },
    sources: []
  };
}
