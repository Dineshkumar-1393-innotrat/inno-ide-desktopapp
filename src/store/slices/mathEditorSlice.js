import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    tabs: [],
    activeTabId: null,
};

const mathEditorSlice = createSlice({
    name: "mathEditor",
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
        updateTabContent: (state, action) => {
            const { tabId, content } = action.payload;
            const tab = state.tabs.find((t) => t.id === tabId);
            if (tab) {
                tab.content = content;
                tab.dirty = true;
            }
        },
        renameTab: (state, action) => {
            const { tabId, name } = action.payload;
            const tab = state.tabs.find((t) => t.id === tabId);
            if (tab) {
                tab.name = name;
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
    updateTabContent,
    renameTab,
    markTabClean,
} = mathEditorSlice.actions;

export default mathEditorSlice.reducer;
