/**
 * Canonical Build Identity Module for Tokyo Waterbus Atlas
 * Shared single source of truth for UI shell header, footer disclosures, and build assets.
 * Automatically injected/updated during `npm run build`.
 */

export const productVersion = '1.0.0';
export const SHORT_SHA = '35c1f86';
export const FULL_SHA = '35c1f86887c0bd588724b85fbf6bfae1e5a57eb3';
export const BUILD_ENVIRONMENT = 'production';
export const BUILD_TIMESTAMP = '2026-08-03T05:28:20.946Z';
export const displayLabel = 'v1.0.0 · 35c1f86';

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
