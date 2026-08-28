import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    tabs: [],
    activeTabId: null,
};

const editorSlice = createSlice({
    name: "editor",
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
            state.tabs = state.tabs.filter((tab) => String(tab.id) !== String(tabId));
            if (String(state.activeTabId) === String(tabId)) {
                state.activeTabId = state.tabs[0]?.id || null;
            }
        },
        updateTabContent: (state, action) => {
            const { tabId, content } = action.payload;
            const tab = state.tabs.find((t) => String(t.id) === String(tabId));
            if (tab) {
                tab.content = content;
                tab.dirty = true;
            }
        },
        renameTab: (state, action) => {
            const { tabId, name } = action.payload;
            const tab = state.tabs.find((t) => String(t.id) === String(tabId));
            if (tab) {
                tab.name = name;
            }
        },
        markTabClean: (state, action) => {
            const tabId = action.payload;
            const tab = state.tabs.find((t) => String(t.id) === String(tabId));
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
    updateTabContent,
    renameTab,
    markTabClean,
} = editorSlice.actions;

export default editorSlice.reducer;
