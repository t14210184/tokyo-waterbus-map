/**
 * Version and Build Metadata Registry for Tokyo Waterbus Atlas (v1.1.0-RC.3.22)
 * Shared single source of truth for UI shell header, footer disclosures, and build assets.
 * Automatically injected/updated during `npm run build`.
 */

export const VERSION = 'v1.1.0-RC.3.22';
export const SHORT_SHA = '5e049b2';
export const BUILD_TIMESTAMP = '2026-08-02T04:06:07.607Z';
export const ASSET_HASH = 'a420a80b';

export function getFullVersionString() {
  return `${VERSION} · ${SHORT_SHA}`;
}

export function getBuildMetadata() {
  return {
    version: VERSION,
    shortSha: SHORT_SHA,
    buildTimestamp: BUILD_TIMESTAMP,
    assetHash: ASSET_HASH,
    fullVersion: getFullVersionString()
  };
}
