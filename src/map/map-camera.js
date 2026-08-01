/**
 * Map Camera & Follow Mode Manager for Tokyo Waterbus Atlas (Phase 2A)
 */

import { haversineDistance } from '../core/geometry.js';

export function createMapCamera(map, onFollowCancel) {
  let followedVesselId = null;
  let lastPanAt = 0;
  let lastPanLatLng = null;

  if (!map) {
    return {
      startFollow: () => {},
      stopFollow: () => {},
      isFollowing: () => false,
      updateFollow: () => {}
    };
  }

  // User manual drag/zoom cancels Follow Mode automatically
  function handleUserInteraction() {
    if (followedVesselId) {
      stopFollow();
      if (onFollowCancel) onFollowCancel();
    }
  }

  map.on('dragstart', handleUserInteraction);
  map.on('zoomstart', handleUserInteraction);

  function startFollow(vesselId) {
    followedVesselId = vesselId;
    lastPanAt = 0;
    lastPanLatLng = null;
  }

  function stopFollow() {
    followedVesselId = null;
    lastPanLatLng = null;
  }

  function isFollowing(vesselId) {
    if (vesselId) return followedVesselId === vesselId;
    return Boolean(followedVesselId);
  }

  function updateFollow(vesselSnap) {
    if (!followedVesselId || !vesselSnap || vesselSnap.vesselId !== followedVesselId) return;

    const now = performance.now();
    if (now - lastPanAt < 400) return; // Throttled max once every 400ms

    const currentLatLng = [vesselSnap.lat, vesselSnap.lng];

    if (lastPanLatLng) {
      const dist = haversineDistance(lastPanLatLng[0], lastPanLatLng[1], vesselSnap.lat, vesselSnap.lng);
      // Only pan if vessel moved at least 20 meters
      if (dist < 20) return;
    }

    lastPanAt = now;
    lastPanLatLng = currentLatLng;
    map.panTo(currentLatLng, { animate: true, duration: 0.6 });
  }

  return {
    startFollow,
    stopFollow,
    isFollowing,
    updateFollow
  };
}
