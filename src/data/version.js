/**
 * Canonical Build Identity Module for Tokyo Waterbus Atlas
 * Shared single source of truth for UI shell header, footer disclosures, and build assets.
 * Automatically injected/updated during `npm run build`.
 */

export const productVersion = '1.0.0';
export const SHORT_SHA = 'e1b4064';
export const FULL_SHA = 'e1b406467bd9df67cea6a76931b4e7f66079c6f4';
export const BUILD_ENVIRONMENT = 'production';
export const BUILD_TIMESTAMP = '2026-08-03T05:37:02.265Z';
export const displayLabel = 'v1.0.0 · e1b4064';

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
