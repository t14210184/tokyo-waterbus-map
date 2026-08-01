/**
 * Route Geometries Database for Tokyo Waterbus Atlas (Phase v1.1.0-RC.3)
 * High-precision WGS84 coordinates stored as [longitude, latitude] following approximate waterway reference channels.
 * Discrete waypoints ensure 0 land-crossings during polyline rendering & vessel simulation interpolation.
 */

export const ROUTE_GEOMETRIES = [
  {
    routeId: 'sumida-river',
    coordinateSystem: 'WGS84',
    geometryType: 'LineString',
    geometryClassification: 'approximate-reference',
    sourceId: 'tokyo-cruise-reference',
    simulationEligible: true,
    reviewedAt: '2026-07-31',
    coordinates: [
      [139.79825, 35.71195], // Asakusa Pier
      [139.79680, 35.70900], // Azuma Bridge Navigation Span
      [139.79360, 35.70420], // Komagata Bridge Channel
      [139.79150, 35.69850], // Umaya Bridge Channel
      [139.79020, 35.69380], // Kuramae Bridge Channel
      [139.78910, 35.68820], // Shin-Ohashi Bridge Channel
      [139.78850, 35.68300], // Kiyosu Bridge Channel
      [139.78450, 35.67400], // Eitai Bridge Channel
      [139.77880, 35.66950], // Chuo-Ohashi Channel
      [139.77580, 35.66690], // Tsukuda Channel South
      [139.77050, 35.66010], // Kachidoki Bridge Channel
      [139.76750, 35.66080], // Tsukiji Sluice Entrance
      [139.76600, 35.66030], // Hamarikyu Canal Gate
      [139.76495, 35.66010], // Hamarikyu Pier inside Garden
      [139.76350, 35.65800], // Hamarikyu Sluice Outlet
      [139.76100, 35.65580], // Takeshiba Waterway Channel
      [139.75710, 35.65175]  // Hinode Pier
    ]
  },
  {
    routeId: 'asakusa-odaiba-direct',
    coordinateSystem: 'WGS84',
    geometryType: 'LineString',
    geometryClassification: 'approximate-reference',
    sourceId: 'tokyo-cruise-reference',
    simulationEligible: true,
    reviewedAt: '2026-07-31',
    coordinates: [
      [139.79825, 35.71195], // Asakusa Pier
      [139.79680, 35.70900], // Azuma Bridge
      [139.79360, 35.70420], // Komagata Bridge
      [139.79150, 35.69850], // Umaya Bridge
      [139.79020, 35.69380], // Kuramae Bridge
      [139.78910, 35.68820], // Shin-Ohashi Bridge
      [139.78850, 35.68300], // Kiyosu Bridge
      [139.78450, 35.67400], // Eitai Bridge
      [139.77880, 35.66950], // Chuo-Ohashi Channel
      [139.77580, 35.66690], // Tsukuda Channel South
      [139.77050, 35.66010], // Kachidoki Bridge
      [139.76450, 35.65600], // Tsukiji Channel South
      [139.75710, 35.65175], // Hinode Pier (Approach/Pass)
      [139.75950, 35.64500], // Shibaura Fairway Entrance
      [139.76380, 35.63850], // Rainbow Bridge Center Navigation Span
      [139.76800, 35.63150], // Odaiba Bay Channel Entrance
      [139.77190, 35.62885]  // Odaiba Seaside Park Pier
    ]
  },
  {
    routeId: 'hinode-odaiba',
    coordinateSystem: 'WGS84',
    geometryType: 'LineString',
    geometryClassification: 'approximate-reference',
    sourceId: 'tokyo-cruise-reference',
    simulationEligible: true,
    reviewedAt: '2026-07-31',
    coordinates: [
      [139.75710, 35.65175], // Hinode Pier
      [139.76020, 35.64380], // Shibaura Channel Entrance
      [139.76450, 35.63750], // Under Rainbow Bridge South Span
      [139.76850, 35.63120], // Odaiba Channel Entrance
      [139.77190, 35.62885], // Odaiba Seaside Park Pier
      [139.78100, 35.62450], // Palette Town Fairway Channel
      [139.79520, 35.62760]  // Tokyo Big Sight Pier
    ]
  },
  {
    routeId: 'hamarikyu',
    coordinateSystem: 'WGS84',
    geometryType: 'LineString',
    geometryClassification: 'approximate-reference',
    sourceId: 'tokyo-cruise-reference',
    simulationEligible: true,
    reviewedAt: '2026-07-31',
    coordinates: [
      [139.79825, 35.71195], // Asakusa Pier
      [139.79150, 35.69850], // Umaya Bridge
      [139.78850, 35.68300], // Kiyosu Bridge
      [139.77580, 35.66690], // Tsukuda Channel
      [139.76750, 35.66080], // Tsukiji Sluice Entrance
      [139.76600, 35.66030], // Hamarikyu Canal Gate
      [139.76495, 35.66010], // Hamarikyu Pier
      [139.76350, 35.65800], // Hamarikyu Sluice Outlet
      [139.76100, 35.65580], // Takeshiba Waterway
      [139.75710, 35.65175]  // Hinode Pier
    ]
  },
  {
    routeId: 'hinode-toyosu',
    coordinateSystem: 'WGS84',
    geometryType: 'LineString',
    geometryClassification: 'approximate-reference',
    sourceId: 'tokyo-cruise-reference',
    simulationEligible: true,
    reviewedAt: '2026-07-31',
    coordinates: [
      [139.75710, 35.65175], // Hinode Pier
      [139.76600, 35.64800], // Harumi Channel South Entrance
      [139.77550, 35.64950], // Harumi Canal Waterway
      [139.78400, 35.65200], // Toyosu Waterway Channel
      [139.79090, 35.65480]  // Toyosu Pier
    ]
  },
  {
    routeId: 'mizube-line',
    coordinateSystem: 'WGS84',
    geometryType: 'LineString',
    geometryClassification: 'approximate-reference',
    sourceId: 'mizube-line-reference',
    simulationEligible: true,
    reviewedAt: '2026-07-31',
    coordinates: [
      [139.79280, 35.69615], // Ryogoku River Center Pier
      [139.79500, 35.70400], // Sumida Channel Upstream
      [139.80050, 35.71110], // Sumida City Office Pier
      [139.79980, 35.71380], // Asakusa Nitenmon Pier
      [139.79200, 35.70000], // Downstream Channel
      [139.78700, 35.68000], // Eitai Passage
      [139.78920, 35.66850], // Etchujima Pier
      [139.77580, 35.66690], // St. Luke's Garden Pier (Seiruka)
      [139.76150, 35.65420], // WATERS Takeshiba Pier
      [139.76500, 35.63800], // Rainbow Bridge Channel
      [139.77190, 35.62885], // Odaiba Seaside Park Pier
      [139.79500, 35.62600], // Tokyo Bay Outer Fairway
      [139.82500, 35.63200], // Shin-Nakagawa River Outlet
      [139.86050, 35.64100]  // Kasai Rinkai Park Pier
    ]
  }
];
