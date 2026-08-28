/**
 * Auto-Save Redux Middleware
 * Integrates Redux state changes with the global auto-save manager
 */
import { autoSaveManager } from '../../utils/autoSaveManager';

// Actions that should trigger auto-save
const AUTO_SAVE_ACTIONS = [
  'simulation/setDroppedItems',
  'simulation/addDroppedItem',
  'simulation/updateDroppedItem',
  'simulation/removeDroppedItem',
  'simulation/setConnections',
  'simulation/addConnection',
  'simulation/updateTabContent',
  'simulation/setTabs',
  'simulation/setActiveTab',
  // Add more actions as needed
];

// Debounce configuration
const DEBOUNCE_DELAY = 2000; // 2 seconds
let debounceTimer = null;

/**
 * Auto-save middleware factory
 * @param {Object} options - Middleware configuration
 * @returns {Function} - Redux middleware
 */
export const createAutoSaveMiddleware = (options = {}) => {
  const {
    actions = AUTO_SAVE_ACTIONS,
    debounceDelay = DEBOUNCE_DELAY,
    priority = 2,
    skipEmpty = true,
    enableLogging = true
  } = options;

  return (store) => (next) => (action) => {
    // Call the next middleware/reducer first
    const result = next(action);

    // Check if this action should trigger auto-save
    if (actions.includes(action.type)) {
      const state = store.getState();

      if (enableLogging) {
        console.log(`[AutoSave Middleware] Action ${action.type} triggered auto-save`);
      }

      // Clear existing debounce timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Schedule debounced save
      debounceTimer = setTimeout(() => {
        saveReduxState(state, action.type, {
          priority,
          skipEmpty,
          enableLogging
        });
        debounceTimer = null;
      }, debounceDelay);
    }

    return result;
  };
};

/**
 * Save Redux state to auto-save manager
 * @param {Object} state - Redux state
 * @param {string} actionType - Action that triggered the save
 * @param {Object} options - Save options
 */
const saveReduxState = async (state, actionType, options = {}) => {
  const { priority, skipEmpty, enableLogging } = options;

  try {
    // Register different save strategies for different parts of the state
    if (state.simulation) {
      const simulationSaveFunction = () => {
        return {
          ...state.simulation,
          lastSaved: Date.now(),
          lastAction: actionType
        };
      };

      // Register simulation state auto-save
      if (!autoSaveManager.saveStrategies.has('redux:simulation')) {
        autoSaveManager.registerSaveStrategy('redux:simulation', simulationSaveFunction, {
          priority: priority + 1, // Higher priority for simulation
          skipEmpty,
          async: true
        });
      }

      // Trigger immediate save for simulation
      await autoSaveManager.saveScreen('redux:simulation');
    }

    // Add more state slices as needed
    if (state.editor) {
      const editorSaveFunction = () => {
        return {
          ...state.editor,
          lastSaved: Date.now(),
          lastAction: actionType
        };
      };

      if (!autoSaveManager.saveStrategies.has('redux:editor')) {
        autoSaveManager.registerSaveStrategy('redux:editor', editorSaveFunction, {
          priority,
          skipEmpty,
          async: true
        });
      }

      await autoSaveManager.saveScreen('redux:editor');
    }

    if (enableLogging) {
      console.log(`[AutoSave Middleware] Successfully saved Redux state after ${actionType}`);
    }
  } catch (error) {
    if (enableLogging) {
      console.error(`[AutoSave Middleware] Failed to save Redux state after ${actionType}:`, error);
    }
  }
};

/**
 * Load Redux state from auto-save manager
 * @param {string} stateKey - State slice key
 * @returns {Object|null} - Loaded state or null
 */
export const loadReduxState = (stateKey) => {
  try {
    const savedState = autoSaveManager.loadData(`redux:${stateKey}`);

    if (savedState) {
      console.log(`[AutoSave Middleware] Loaded ${stateKey} state from auto-save`);
      return savedState;
    }

    return null;
  } catch (error) {
    console.error(`[AutoSave Middleware] Failed to load ${stateKey} state:`, error);
    return null;
  }
};

/**
 * Enhanced persistence configuration for redux-persist integration
 */
export const createAutoSavePersistConfig = (key, storage, options = {}) => {
  const {
    whitelist = [],
    blacklist = [],
    version = 1,
    migrate = null,
    debug = false
  } = options;

  return {
    key,
    storage,
    whitelist,
    blacklist,
    version,
    migrate,
    debug,

    // Transform to integrate with auto-save manager
    transforms: [
      {
        in: (inboundState, key) => {
          // Save to auto-save manager when persisting
          if (inboundState) {
            const saveFunction = () => inboundState;
            autoSaveManager.registerSaveStrategy(`persist:${key}`, saveFunction, {
              priority: 1,
              skipEmpty: false
            });
          }
          return inboundState;
        },
        out: (outboundState, key) => {
          // Load from auto-save manager when rehydrating
          const autoSavedState = autoSaveManager.loadData(`persist:${key}`);
          if (autoSavedState && Object.keys(autoSavedState).length > 0) {
            console.log(`[AutoSave Middleware] Using auto-saved state for ${key}`);
            return { ...outboundState, ...autoSavedState };
          }
          return outboundState;
        }
      }
    ]
  };
};

/**
 * Auto-save enhancer for Redux store
 * @param {Function} createStore - Redux createStore function
 * @param {Object} options - Enhancer options
 * @returns {Function} - Enhanced createStore function
 */
export const autoSaveEnhancer = (options = {}) => (createStore) => (reducer, preloadedState, enhancer) => {
  const store = createStore(reducer, preloadedState, enhancer);

  // Register global store save strategy
  const storeSaveFunction = () => {
    const state = store.getState();
    return {
      ...state,
      metadata: {
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    };
  };

  autoSaveManager.registerSaveStrategy('redux:store', storeSaveFunction, {
    priority: 1,
    skipEmpty: false,
    async: true
  });

  // Add auto-save methods to store
  store.saveNow = () => autoSaveManager.saveAll();
  store.loadState = (stateKey) => loadReduxState(stateKey);
  store.getAutoSaveStats = () => autoSaveManager.getStats();

  // Subscribe to store changes for emergency saves
  store.subscribe(() => {
    // Trigger emergency save on critical actions
    const state = store.getState();
    if (state.emergency || state.criticalData) {
      autoSaveManager.saveScreen('redux:store');
    }
  });

  return store;
};

/**
 * Middleware for handling auto-save events
 */
export const autoSaveEventMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  // Handle auto-save specific events
  switch (action.type) {
    case 'AUTO_SAVE_REQUEST':
      autoSaveManager.saveAll();
      break;

    case 'AUTO_SAVE_CLEAR':
      if (action.payload && action.payload.screenKey) {
        autoSaveManager.clearData(action.payload.screenKey);
      }
      break;

    case 'AUTO_SAVE_LOAD':
      if (action.payload && action.payload.screenKey) {
        const loadedData = autoSaveManager.loadData(action.payload.screenKey);
        if (loadedData) {
          // Dispatch action to update state with loaded data
          store.dispatch({
            type: 'AUTO_SAVE_LOADED',
            payload: {
              screenKey: action.payload.screenKey,
              data: loadedData
            }
          });
        }
      }
      break;

    default:
      // No special handling needed
      break;
  }

  return result;
};

/**
 * Action creators for auto-save operations
 */
export const autoSaveActions = {
  requestSave: (screenKey = null) => ({
    type: 'AUTO_SAVE_REQUEST',
    payload: { screenKey }
  }),

  clearSave: (screenKey) => ({
    type: 'AUTO_SAVE_CLEAR',
    payload: { screenKey }
  }),

  loadSave: (screenKey) => ({
    type: 'AUTO_SAVE_LOAD',
    payload: { screenKey }
  })
};

// Default middleware instance
export const autoSaveMiddleware = createAutoSaveMiddleware();

export default autoSaveMiddleware;
