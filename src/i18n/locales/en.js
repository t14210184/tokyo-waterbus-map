/**
 * English (en) Locale Dictionary
 */
export const en = {
  header: {
    title: 'Tokyo Waterbus Atlas',
    subtitle: 'Tokyo Waterbus Official Status, Timetable Guidance & Pier Reference',
    languageBadge: 'Language: English'
  },
  tabs: {
    today: 'Today Status',
    routes: 'Routes',
    piers: 'Piers',
    planner: 'Trip Planner',
    guide: 'Guide',
    explore: 'Explore'
  },
  statusChip: {
    noSimulation: '● No Verified Simulation Running',
    offlineDemoActive: '● Offline Demo Mode Active (Not Live Tracking)',
    startDemoBtn: '▶ Start Offline Demo',
    stopDemoBtn: '⏹ Stop Demo',
    resetDemoBtn: 'Reset Demo'
  },
  disclaimer: {
    bannerText: 'Offline Demo: Not live GPS/AIS, not real-time vessel tracking, not daily schedule. Geometries are approximate reference only.',
    understandDataLevels: 'Data Trust Levels',
    close: 'Close ×'
  },
  theme: {
    toggleBtn: 'Basemap: ',
    dark: 'Dark',
    light: 'Light',
    none: 'None (Reference)'
  },
  todayPanel: {
    title: 'Today\'s Service Status & Official Gateway Links',
    badge: 'Official Verification',
    intro: '● Provides official verification gateways. Does not fabricate real-time vessel positions. Tokyo Waterbus Atlas is a reference tool connecting travellers directly to daily official status pages and timetables.',
    tokyoCruiseTitle: 'TOKYO CRUISE (Tokyo Sightseeing Cruise)',
    tokyoCruiseStatus: 'Normal Status (Subject to Official Confirmation)',
    tokyoCruiseDesc: 'For Sumida River, Asakusa-Odaiba Direct, and Hinode-Odaiba regular cruises, click official links below to check today\'s live status.',
    tokyoCruiseAction: 'TOKYO CRUISE Today\'s Operation Status',
    tokyoCruiseTimetableAction: 'Official Timetables & Fares',
    mizubeStatusLabel: 'SUSPENDED',
    checkBasis: 'Verification basis: Public timetables & official notices | Verified: 2026-08-02',
    mizubeAction: 'Open Tokyo Mizube Line Official Announcement',
    footerDisclosure: 'This app tells me where to check today\'s official answer; it does not invent it.'
  },
  pierCard: {
    sectionTitle: 'Pier Arrival Card',
    featuredBadge: 'Featured Pier',
    whatUsefulFor: 'What this pier is useful for:',
    addressLabel: 'Official Location & Address:',
    nearestTransitLabel: 'Nearest Station & Walking Time:',
    checklistTitle: 'Before Leaving Checklist:',
    checkItem1: 'Check today\'s official operating status (may be cancelled due to wind/tide)',
    checkItem2: 'Review official timetable & fare charts',
    checkItem3: 'Allow at least 15 minutes for ticketing and boarding process',
    actionPierPage: 'Open Official Pier Page',
    actionTodayStatus: 'Check Today\'s Operation Status',
    actionTimetable: 'View Official Timetables',
    actionGoogleMaps: 'Open Official Pier Area in Google Maps',
    confidenceLabel: 'Location & Photo Status:',
    photoStatus: 'Photo wayfinding: planned',
    confidenceConfirmed: 'Official Location Confirmed',
    accessibilityTitle: 'Accessibility & Facilities:',
    facilitiesUnconfirmed: 'Accessibility details require official on-site confirmation',
    missedFallbackTitle: 'Missed Service or Cancellation Fallback:',
    missedFallbackDesc: 'Check operator notices immediately and use standard railway or bus routes as needed.',
    provenanceTitle: 'Data Sources & Verification:',
    provenanceDesc: 'Source: Official operator announcements | Last verified: ',
    mizubeSuspensionTitle: 'Tokyo Mizube Line: Service Suspended',
    mizubeSuspensionBody: 'Service suspended since January 19, 2026. Reopening date subject to official announcement. Boarding Tokyo Mizube Line is currently unavailable at this pier. Please check official announcements before departure.',
    mizubeSuspensionLink: 'Open Tokyo Mizube Line Official Announcement',
    statusActive: 'Operating normally',
    statusSuspended: 'Service Suspended',
    statusPartial: 'Partial Service (Contains Suspended Routes)',
    statusVerify: 'Subject to Official Confirmation'
  },
  footer: {
    officialPortal: 'Official Operator Portals',
    lastValidated: 'Last Verified:',
    secondaryReviewBtn: 'Data Quality & Review (RGR)'
  }
};
