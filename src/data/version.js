/**
 * Canonical Build Identity Module for Tokyo Waterbus Atlas
 * Shared single source of truth for UI shell header, footer disclosures, and build assets.
 * Automatically injected/updated during `npm run build`.
 */

export const productVersion = '1.0.0';
export const SHORT_SHA = '8829629';
export const FULL_SHA = '88296299eae4b5f85fe203242203c5064bf4a64e';
export const BUILD_ENVIRONMENT = 'production';
export const BUILD_TIMESTAMP = '2026-08-03T12:27:51.485Z';
export const displayLabel = 'v1.0.0 · 8829629';

export function getBuildMetadata() {
  return {
    productVersion,
    fullCommit: FULL_SHA,
    shortCommit: SHORT_SHA,
    buildEnvironment: BUILD_ENVIRONMENT,
    displayLabel,
    buildTimestamp: BUILD_TIMESTAMP,
    version: `v${productVersion}`,
    shortSha: SHORT_SHA,
    fullVersion: displayLabel
  };
}
