import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    tabs: [],
    activeTabId: null,
};

const flowchartSlice = createSlice({
    name: "flowchart",
    initialState,
    reducers: {
        setTabs: (state, action) => {
            state.tabs = action.payload;
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
            if (state.activeTabId === tabId) {
                state.activeTabId = state.tabs[0]?.id || null;
            }
        },
        renameTab: (state, action) => {
            const { id, name } = action.payload;
            const tab = state.tabs.find((t) => t.id === id);
            if (tab) {
                tab.name = name;
            }
        },
        updateTabState: (state, action) => {
            const { tabId, nodes, edges, viewport } = action.payload;
            const tab = state.tabs.find((t) => t.id === tabId);
            if (tab && tab.state) {
                if (nodes !== undefined) {
                    tab.state.nodes = nodes;
                    tab.dirty = true;
                }
                if (edges !== undefined) {
                    tab.state.edges = edges;
                    tab.dirty = true;
                }
                if (viewport !== undefined) {
                    tab.state.viewport = viewport;
                    tab.dirty = true;
                }
                console.log(`[flowchartSlice] Updated tab ${tabId}. Nodes: ${tab.state.nodes?.length}`);
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
} = flowchartSlice.actions;

export default flowchartSlice.reducer;
