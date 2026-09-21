import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
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

// ─── Project-aware storage adapter ─────────────────────────────────────────────
// IMPORTANT: Import the adapter BEFORE creating the store so that
// any initial context set by ProjectContext is already in place.
import projectAwareStorage, {
  updateProjectContext,
  getCurrentContext,
  buildPersistKey,
} from "../utils/projectStorage";

// ─── Root reducer ───────────────────────────────────────────────────────────────
const rootReducer = combineReducers({
  simulation: simulationReducer,
  flowchart: flowchartReducer,
  blockDiagram: blockDiagramReducer,
  blockProgramming: blockProgrammingReducer,
  editor: editorReducer,
  mathEditor: mathEditorReducer,
  workspace: workspaceReducer,
});

// ─── Persist config ─────────────────────────────────────────────────────────────
//
// KEY CHANGE from the previous implementation:
//   - `storage` is now `projectAwareStorage` — a custom adapter that namespaces
//     every read/write as `persist:ide:{userId}:{projectId}:{key}`.
//   - The persist key itself is kept as "root" (so redux-persist's internal key
//     management works the same way), but the ACTUAL localStorage key for each
//     item is `persist:ide:{userId}:{projectId}:root` etc.
//   - `workspace` is excluded from the whitelist because it holds runtime metadata.
//
const persistConfig = {
  key: "root",
  storage: projectAwareStorage,
  whitelist: [
    "simulation",
    "flowchart",
    "blockDiagram",
    "blockProgramming",
    "editor",
    "mathEditor",
  ],
};

// ─── Auto-save middleware ───────────────────────────────────────────────────────
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

// ─── Persistor ──────────────────────────────────────────────────────────────────
export const persistor = persistStore(store);

// ─── Project persistence switching API ─────────────────────────────────────────
//
// This is the ONLY function that should be called to switch the active project
// persistence bucket. It MUST be called by ProjectContext.switchProject()
// in the correct order:
//
//   1. Flush pending saves for old project
//   2. Dispatch RESET_WORKSPACE (clears in-memory state)
//   3. Call switchPersistenceToProject(userId, newProjectId)
//      → updates storage adapter context
//      → calls persistor.persist() to trigger rehydration from new bucket
//   4. Load backend data and merge
//
// This function does NOT delete any persisted data. It merely tells the adapter
// which bucket to read from next.
//
export const switchPersistenceToProject = (userId, projectId) => {
  // 1. Update the storage adapter context so future reads/writes target the new bucket
  updateProjectContext(userId, projectId);

  // 2. Trigger rehydration from the new bucket.
  //    persistor.persist() re-runs the REHYDRATE sequence using the current adapter context.
  persistor.persist();

  console.log(`[Store] Persistence switched to ${userId}:${projectId}`);
};

// ─── Register Redux store state with auto-save manager ──────────────────────────
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

// ─── Listen for auto-save events from the manager ──────────────────────────────
window.addEventListener("autosave:request", () => {
  store.dispatch({ type: "AUTO_SAVE_REQUEST" });
});

// ─── Emergency save before page unload ─────────────────────────────────────────
window.addEventListener("beforeunload", () => {
  const state = store.getState();
  try {
    // Synchronously build the emergency key using the active project context
    const { userId, projectId } = getCurrentContext();
    const emergencyKey = buildPersistKey(userId, projectId, "emergency-save");
    localStorage.setItem(
      emergencyKey,
      JSON.stringify({
        simulation: state.simulation,
        timestamp: Date.now(),
      }),
    );
  } catch (e) {
    console.error("Emergency Redux save failed:", e);
  }
});

// ─── Restore emergency save on load if needed ──────────────────────────────────
// Emergency saves are now keyed per project, so they are naturally isolated.
// The restore logic is handled by redux-persist's normal rehydration from the
// project-scoped bucket on startup.

export { updateProjectContext };
