/**
 * Reactive State Store for Tokyo Waterbus Atlas (Phase 4A.3 Responsive Panel State Extension)
 */

function createStore(initialState) {
  let state = { ...initialState };
  const listeners = new Set();

  function getState() {
    return state;
  }

  function setState(partialOrUpdater) {
    const nextPartial = typeof partialOrUpdater === 'function' ? partialOrUpdater(state) : partialOrUpdater;
    const nextState = { ...state, ...nextPartial };

    let hasChanged = false;
    for (const key in nextPartial) {
      if (nextState[key] !== state[key]) {
        hasChanged = true;
        break;
      }
    }

    if (!hasChanged) return;

    const prevState = state;
    state = nextState;

    listeners.forEach((entry) => {
      try {
        const { selector, callback, lastSelectedValue } = entry;
        const currentSelectedValue = selector ? selector(state) : state;
        if (currentSelectedValue !== lastSelectedValue) {
          entry.lastSelectedValue = currentSelectedValue;
          callback(currentSelectedValue, selector ? selector(prevState) : prevState);
        }
      } catch (err) {
        console.error('Store listener error:', err);
      }
    });
  }

  function subscribe(selectorOrListener, listener) {
    let sel = null;
    let cb = selectorOrListener;

    if (typeof listener === 'function') {
      sel = selectorOrListener;
      cb = listener;
    }

    const entry = {
      selector: sel,
      callback: cb,
      lastSelectedValue: sel ? sel(state) : state
    };

    listeners.add(entry);

    return function unsubscribe() {
      listeners.delete(entry);
    };
  }

  function destroy() {
    listeners.clear();
  }

  return { getState, setState, subscribe, destroy };
}

export const atlasStore = createStore({
  ui: {
    activeTab: 'routes',
    pierDrawerOpen: false,
    plannerPanelOpen: false,
    mobileSheetMode: 'none' // 'none' | 'pier' | 'planner' | 'fleet'
  },
  simulation: {
    isPaused: false,
    playbackRate: 1,
    selectedVesselId: null,
    followedVesselId: null,
    lastUiUpdateAt: 0,
    offlineDemoActive: false
  },
  pierExplorer: {
    query: '',
    operatorFilter: 'all',
    statusFilter: 'all',
    routeFilter: 'all',
    selectedPierId: null,
    drawerOpen: false
  },
  planner: {
    originPierId: null,
    destinationPierId: null,
    preference: 'fastest',
    itineraries: [],
    selectedItineraryId: null,
    isCalculating: false
  }
});
