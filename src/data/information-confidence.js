/**
 * Authoritative Information Confidence Model for Tokyo Waterbus Atlas (Phase 0)
 * Classifies data trust levels cleanly without falsely conflating timetables or offline demos with live vessel tracking.
 */

export const INFORMATION_CONFIDENCE_LEVELS = {
  OFFICIAL_CONFIRMED: {
    id: 'OFFICIAL_CONFIRMED',
    labelKey: 'confidence.officialConfirmed',
    disclosureKey: 'confidence.officialConfirmedDesc',
    badgeClass: 'badge-confidence-official',
    symbol: '🟢',
    canAnimate: false,
    canShowBoarding: true, // Only when official HTTPS boarding link is available
    canShowPredictedPosition: false,
    sourceRequired: true,
    publishedTimeAllowed: true,
    checkedTimeAllowed: true,
    fetchedTimeAllowed: false,
    freshnessRequired: true
  },
  TIMETABLE_ESTIMATE: {
    id: 'TIMETABLE_ESTIMATE',
    labelKey: 'confidence.timetableEstimate',
    disclosureKey: 'confidence.timetableEstimateDesc',
    badgeClass: 'badge-confidence-timetable',
    symbol: '🔵',
    canAnimate: false, // Must be false in Phase 0
    canShowBoarding: false,
    canShowPredictedPosition: false, // Must be false in Phase 0
    sourceRequired: true,
    publishedTimeAllowed: true,
    checkedTimeAllowed: true,
    fetchedTimeAllowed: false,
    freshnessRequired: false
  },
  OFFLINE_STORY_DEMO: {
    id: 'OFFLINE_STORY_DEMO',
    labelKey: 'confidence.offlineStoryDemo',
    disclosureKey: 'confidence.offlineStoryDemoDesc',
    badgeClass: 'badge-confidence-demo',
    symbol: '🟠',
    canAnimate: true, // Only after explicit user activation
    canShowBoarding: false,
    canShowPredictedPosition: false,
    sourceRequired: false,
    publishedTimeAllowed: false,
    checkedTimeAllowed: false,
    fetchedTimeAllowed: false,
    freshnessRequired: false
  },
  SUSPENDED_OR_UNKNOWN: {
    id: 'SUSPENDED_OR_UNKNOWN',
    labelKey: 'confidence.suspendedOrUnknown',
    disclosureKey: 'confidence.suspendedOrUnknownDesc',
    badgeClass: 'badge-confidence-suspended',
    symbol: '🔴',
    canAnimate: false,
    canShowBoarding: false,
    canShowPredictedPosition: false,
    sourceRequired: true,
    publishedTimeAllowed: true,
    checkedTimeAllowed: true,
    fetchedTimeAllowed: false,
    freshnessRequired: false
  }
};

export function getConfidenceModel(levelId) {
  return INFORMATION_CONFIDENCE_LEVELS[levelId] || INFORMATION_CONFIDENCE_LEVELS.SUSPENDED_OR_UNKNOWN;
}
