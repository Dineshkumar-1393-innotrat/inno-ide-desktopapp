import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    tabs: [],
    activeTabId: null,
};

const blockProgrammingSlice = createSlice({
    name: "blockProgramming",
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
            const { tabId, nodes, edges, viewport, idSeed, markDirty = true } = action.payload;
            const tab = state.tabs.find((t) => t.id === tabId);
            if (tab) {
                if (nodes !== undefined) tab.state.nodes = nodes;
                if (edges !== undefined) tab.state.edges = edges;
                if (viewport !== undefined) tab.state.viewport = viewport;
                if (idSeed !== undefined) tab.state.idSeed = idSeed;
                if (markDirty) {
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
    },
});

export const {
    setTabs,
    setActiveTab,
    addTab,
    closeTab,
    renameTab,
    updateTabState,
    markTabClean,
} = blockProgrammingSlice.actions;

export default blockProgrammingSlice.reducer;
