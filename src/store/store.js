import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import { combineReducers } from "redux";
import simulationReducer from "./slices/simulationSlice";
import flowchartReducer from "./slices/flowchartSlice";
import blockDiagramReducer from "./slices/blockDiagramSlice";
import blockProgrammingReducer from "./slices/blockProgrammingSlice";
import editorReducer from "./slices/editorSlice";
import mathEditorReducer from "./slices/mathEditorSlice";
import {
  createAutoSaveMiddleware,
  autoSaveEventMiddleware,
} from "./middleware/autoSaveMiddleware";
import workspaceReducer from "../features/workspace/store/workspaceSlice";
import { autoSaveManager } from "../utils/autoSaveManager";

const rootReducer = combineReducers({
  simulation: simulationReducer,
  flowchart: flowchartReducer,
  blockDiagram: blockDiagramReducer,
  blockProgramming: blockProgrammingReducer,
  editor: editorReducer,
  mathEditor: mathEditorReducer,
  workspace: workspaceReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: [
    "simulation",
    "flowchart",
    "blockDiagram",
    "blockProgramming",
    "editor",
    "mathEditor",
  ], // persist state for all relevant screens
};

// Create auto-save middleware with custom configuration
const autoSaveMiddleware = createAutoSaveMiddleware({
  actions: [
    "simulation/setDroppedItems",
    "simulation/addDroppedItem",
    "simulation/updateDroppedItem",
    "simulation/removeDroppedItem",
    "simulation/setConnections",
    "simulation/addConnection",
    "simulation/setTabs",
    "simulation/setActiveTab",
    "simulation/updateTabContent",
  ],
  debounceDelay: 2000,
  priority: 2,
  skipEmpty: true,
  enableLogging: process.env.NODE_ENV === "development",
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "AUTO_SAVE_REQUEST",
          "AUTO_SAVE_CLEAR",
          "AUTO_SAVE_LOAD",
          "AUTO_SAVE_LOADED",
        ],
      },
    }).concat(autoSaveMiddleware, autoSaveEventMiddleware),
});

// Register Redux store state with auto-save manager
autoSaveManager.registerSaveStrategy(
  "redux:global",
  () => {
    const state = store.getState();
    return {
      simulation: state.simulation,
      timestamp: Date.now(),
    };
  },
  { priority: 2, skipEmpty: true },
);

// Listen for auto-save events from the manager
window.addEventListener("autosave:request", () => {
  store.dispatch({ type: "AUTO_SAVE_REQUEST" });
});

// Save Redux state before page unload
window.addEventListener("beforeunload", () => {
  const state = store.getState();
  try {
    localStorage.setItem(
      "innoide:redux:emergency-save",
      JSON.stringify({
        simulation: state.simulation,
        timestamp: Date.now(),
      }),
    );
  } catch (e) {
    console.error("Emergency Redux save failed:", e);
  }
});

// Restore emergency save on load if needed
try {
  const emergencySave = localStorage.getItem("innoide:redux:emergency-save");
  if (emergencySave) {
    const savedState = JSON.parse(emergencySave);
    const savedAge = Date.now() - (savedState.timestamp || 0);
    // Only restore if saved within last 5 minutes
    if (savedAge < 5 * 60 * 1000) {
      console.log(
        "[Redux Store] Found recent emergency save, will be restored by persist",
      );
    }
    // Clear emergency save after checking
    localStorage.removeItem("innoide:redux:emergency-save");
  }
} catch (e) {
  console.error("Failed to check emergency save:", e);
}

export const persistor = persistStore(store);
