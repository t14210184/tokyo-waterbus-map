/**
 * Route Geometry Source Registry for Tokyo Waterbus Atlas (Phase v1.1.0-RC.3)
 * Documents origin and approximate-reference geometry classification for all 6 waterbus routes.
 */

export const ROUTE_GEOMETRY_SOURCES = [
  {
    routeId: 'sumida-river',
    operator: 'TOKYO CRUISE',
    geometryClassification: 'approximate-reference',
    geometrySource: {
      name: 'TOKYO CRUISE Official Sumida River Route Map & Navigation Fairway',
      url: 'https://www.suijobus.co.jp/en/price/',
      license: 'Public Operator Route Reference / Fair Use Disclosures',
      accessedAt: '2026-07-31',
      sourceType: 'official-route-map',
      notes: 'Sumida River main channel fairway aligned across Azuma, Komagata, Umaya, Kuramae, Shin-Ohashi, Kiyosu, Eitai, Chuo, Kachidoki bridges down to Tsukiji Sluice and Hamarikyu Gardens.'
    },
    waterwayAlignmentMethod: 'Waterway-centered discrete waypoints snapped to official pier coordinates (80m snapping tolerance).',
    knownLimitations: [
      'Geometry provides approximate waterway alignment reference and is not an official Maritime Safety AIS live track.',
      'Sluice gate passage at Hamarikyu is subject to tidal lock opening schedules.'
    ],
    approvedForSimulation: true
  },
  {
    routeId: 'asakusa-odaiba-direct',
    operator: 'TOKYO CRUISE',
    geometryClassification: 'approximate-reference',
    geometrySource: {
      name: 'TOKYO CRUISE Asakusa-Odaiba Direct Line Navigation Guide',
      url: 'https://www.suijobus.co.jp/en/price/',
      license: 'Public Operator Route Reference / Fair Use Disclosures',
      accessedAt: '2026-07-31',
      sourceType: 'official-route-map',
      notes: 'Direct fairway for Himiko / Hotaluna / Emeraldas vessels running from Asakusa down Sumida River, passing Hinode/Takeshiba, under Rainbow Bridge center span to Odaiba Seaside Park.'
    },
    waterwayAlignmentMethod: 'Sumida River channel -> Rainbow Bridge central navigation channel -> Odaiba Seaside Park Fairway.',
    knownLimitations: [
      'High-speed express vessels maintain strict fairway alignment through Rainbow Bridge center span.',
      'Positions represent client-side simulated progress along approved waterway polylines.'
    ],
    approvedForSimulation: true
  },
  {
    routeId: 'hinode-odaiba',
    operator: 'TOKYO CRUISE',
    geometryClassification: 'approximate-reference',
    geometrySource: {
      name: 'TOKYO CRUISE Hinode-Odaiba-BigSight Waterfront Line Guide',
      url: 'https://www.suijobus.co.jp/en/price/',
      license: 'Public Operator Route Reference / Fair Use Disclosures',
      accessedAt: '2026-07-31',
      sourceType: 'official-route-map',
      notes: 'Short waterfront connector between Hinode Pier, Rainbow Bridge South Channel, Odaiba Seaside Park Pier, and Tokyo Big Sight Pier.'
    },
    waterwayAlignmentMethod: 'Shibaura Fairway -> Rainbow Bridge South Navigation Channel -> Odaiba Bay -> Palette Town Fairway -> Big Sight Pier.',
    knownLimitations: [
      'Vessels turn around inside Odaiba Kaihin Park fairway before proceeding toward Tokyo Big Sight.'
    ],
    approvedForSimulation: true
  },
  {
    routeId: 'hamarikyu',
    operator: 'TOKYO CRUISE',
    geometryClassification: 'approximate-reference',
    geometrySource: {
      name: 'TOKYO CRUISE Hamarikyu Gardens Sluice Navigation Guide',
      url: 'https://www.suijobus.co.jp/en/cruise/hamarikyu/',
      license: 'Public Operator Route Reference / Fair Use Disclosures',
      accessedAt: '2026-07-31',
      sourceType: 'official-route-map',
      notes: 'Special garden route navigating through Shiodome river sluice gate directly into Hamarikyu Gardens Shioiri-no-ike inlet.'
    },
    waterwayAlignmentMethod: 'Sumida River -> Tsukiji Sluice Entrance -> Hamarikyu Shiodome Gate -> Hamarikyu Pier -> Takeshiba Outlet -> Hinode Pier.',
    knownLimitations: [
      'Requires garden admission ticket for disembarking at Hamarikyu Pier.'
    ],
    approvedForSimulation: true
  },
  {
    routeId: 'hinode-toyosu',
    operator: 'TOKYO CRUISE',
    geometryClassification: 'approximate-reference',
    geometrySource: {
      name: 'TOKYO CRUISE Hinode-Toyosu Urban Dock Route Map',
      url: 'https://www.suijobus.co.jp/en/cruise/toyosu/',
      license: 'Public Operator Route Reference / Fair Use Disclosures',
      accessedAt: '2026-07-31',
      sourceType: 'official-route-map',
      notes: 'Harumi Canal waterway connecting Hinode Pier across Harumi Railway Bridge site to Toyosu LaLaport Urban Dock Pier.'
    },
    waterwayAlignmentMethod: 'Hinode Fairway -> Harumi Canal Entrance -> Harumi Waterway -> Toyosu Urban Dock Entrance Pier.',
    knownLimitations: [
      'Navigates underneath Harumi Bridge and Toyosu Bridge.'
    ],
    approvedForSimulation: true
  },
  {
    routeId: 'mizube-line',
    operator: '東京水辺ライン',
    geometryClassification: 'approximate-reference',
    geometrySource: {
      name: 'Tokyo Metropolitan Park Association Mizube Line Navigation Chart',
      url: 'https://www.tokyo-park.or.jp/water/bus/',
      license: 'Public Metropolitan Park Association Disclosures',
      accessedAt: '2026-07-31',
      sourceType: 'official-route-map',
      notes: 'Wide-area public waterbus system connecting Ryogoku, Sumida, Asakusa Nitenmon, Etchujima, St. Lukes, Takeshiba, Odaiba, and Kasai Rinkai Park.'
    },
    waterwayAlignmentMethod: 'Upper Sumida River -> Etchujima Canal -> Takeshiba Fairway -> Rainbow Bridge Channel -> Tokyo Bay Outer Fairway -> Shin-Nakagawa River Outlet -> Kasai Rinkai Park Pier.',
    knownLimitations: [
      'Wide-area system with complex multi-stop loops; geometry aligned along official public waterway channels.'
    ],
    approvedForSimulation: true
  }
];
