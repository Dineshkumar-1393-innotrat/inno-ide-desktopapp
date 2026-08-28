import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    tabs: [
        {
            id: 1,
            name: "Simulation 1",
            symbols: [],
            connections: [],
            content: "// Simulation code\n",
            dirty: false
        }
    ],
    activeTab: 1,
};

const simulationSlice = createSlice({
    name: 'simulation',
    initialState,
    reducers: {
        setTabs: (state, action) => {
            state.tabs = action.payload;
        },
        addTab: (state, action) => {
            state.tabs.push(action.payload);
        },
        closeTab: (state, action) => {
            const tabId = action.payload;
            state.tabs = state.tabs.filter(tab => tab.id !== tabId);
            if (state.activeTab === tabId) {
                state.activeTab = state.tabs.length > 0 ? state.tabs[state.tabs.length - 1].id : null;
            }
            if (state.tabs.length === 0) {
                state.tabs = [{ id: Date.now(), name: "Simulation 1", symbols: [], connections: [], content: "// Simulation code\n", dirty: false }];
                state.activeTab = state.tabs[0].id;
            }
        },
        setActiveTab: (state, action) => {
            state.activeTab = action.payload;
        },
        addSymbolToTab: (state, action) => {
            const { tabId, symbol } = action.payload;
            const tab = state.tabs.find(t => t.id === tabId);
            if (tab) {
                tab.symbols.push(symbol);
                tab.dirty = true;
            }
        },
        updateSymbolInTab: (state, action) => {
            const { tabId, symbolId, updates } = action.payload;
            const tab = state.tabs.find(t => t.id === tabId);
            if (tab) {
                const index = tab.symbols.findIndex(s => s.id === symbolId);
                if (index !== -1) {
                    tab.symbols[index] = { ...tab.symbols[index], ...updates };
                    tab.dirty = true;
                }
            }
        },
        removeSymbolFromTab: (state, action) => {
            const { tabId, symbolId } = action.payload;
            const tab = state.tabs.find(t => t.id === tabId);
            if (tab) {
                tab.symbols = tab.symbols.filter(s => s.id !== symbolId);
                tab.dirty = true;
            }
        },
        addConnectionToTab: (state, action) => {
            const { tabId, connection } = action.payload;
            const tab = state.tabs.find(t => t.id === tabId);
            if (tab && !tab.connections.includes(connection)) {
                tab.connections.push(connection);
                tab.dirty = true;
            }
        },
        setTabSymbolsAndConnections: (state, action) => {
            const { tabId, symbols, connections } = action.payload;
            const tab = state.tabs.find(t => t.id === tabId);
            if (tab) {
                tab.symbols = symbols || [];
                tab.connections = connections || [];
            }
        },
        updateTabContent: (state, action) => {
            const { id, content } = action.payload;
            const tab = state.tabs.find(t => t.id === id);
            if (tab) {
                tab.content = content;
                tab.dirty = true;
            }
        },
        renameTab: (state, action) => {
            const { tabId, newName } = action.payload;
            const tab = state.tabs.find(t => t.id === tabId);
            if (tab) {
                tab.name = newName;
            }
        }
    },
});

export const {
    setTabs,
    addTab,
    closeTab,
    setActiveTab,
    addSymbolToTab,
    updateSymbolInTab,
    removeSymbolFromTab,
    addConnectionToTab,
    setTabSymbolsAndConnections,
    updateTabContent,
    renameTab
} = simulationSlice.actions;

export default simulationSlice.reducer;
