import { createSlice } from "@reduxjs/toolkit";
import { RESET_WORKSPACE } from "../resetAction";

const createDefaultTab = () => ({
    id: "tab_1",
    name: "Tab 1",
    state: {
        nodes: [],
        edges: [],
        viewport: null,
    },
    dirty: false,
});

const initialState = {
    tabs: [createDefaultTab()],
    activeTabId: "tab_1",
};

const blockDiagramSlice = createSlice({
    name: "blockDiagram",
    initialState,
    reducers: {
        setTabs: (state, action) => {
            state.tabs = (Array.isArray(action.payload) && action.payload.length > 0)
                ? action.payload
                : [createDefaultTab()];
            if (!state.activeTabId || !state.tabs.some((t) => t.id === state.activeTabId)) {
                state.activeTabId = state.tabs[0]?.id || "tab_1";
            }
        },
        setActiveTab: (state, action) => {
            state.activeTabId = action.payload;
        },
        addTab: (state, action) => {
            state.tabs.push(action.payload);
            state.activeTabId = action.payload.id;
        },
        closeTab: (state, action) => {
            const tabId = action.payload;
            state.tabs = state.tabs.filter((tab) => tab.id !== tabId);
            if (state.tabs.length === 0) {
                const freshTab = createDefaultTab();
                state.tabs = [freshTab];
                state.activeTabId = freshTab.id;
            } else if (state.activeTabId === tabId) {
                state.activeTabId = state.tabs[0]?.id || null;
            }
        },
        renameTab: (state, action) => {
            const { id, name } = action.payload;
            const tab = state.tabs.find((t) => t.id === id);
            if (tab) {
                tab.name = name;
                tab.dirty = true;
            }
        },
        updateTabState: (state, action) => {
            const { tabId, ...updates } = action.payload;
            const tab = state.tabs.find((t) => t.id === tabId);
            if (tab) {
                tab.state = { ...(tab.state || {}), ...updates };
                // If the update contains nodes, edges, or viewport, it's a content change
                if (updates.nodes !== undefined || updates.edges !== undefined || updates.viewport !== undefined) {
                    tab.dirty = true;
                }
            }
        },
        markTabClean: (state, action) => {
            const tabId = action.payload;
            const tab = state.tabs.find((t) => t.id === tabId);
            if (tab) {
                tab.dirty = false;
            }
        },
        setTabNodesAndEdges: (state, action) => {
            const { tabId, nodes, edges } = action.payload;
            const tab = state.tabs.find((t) => t.id === tabId);
            if (tab) {
                tab.state.nodes = nodes;
                tab.state.edges = edges;
            }
        },
    },
  extraReducers: (builder) => {
    builder.addCase(RESET_WORKSPACE, () => ({
        tabs: [createDefaultTab()],
        activeTabId: "tab_1",
    }));
  },
});

export const {
    setTabs,
    setActiveTab,
    addTab,
    closeTab,
    renameTab,
    updateTabState,
    setTabNodesAndEdges,
    markTabClean,
} = blockDiagramSlice.actions;

export default blockDiagramSlice.reducer;
