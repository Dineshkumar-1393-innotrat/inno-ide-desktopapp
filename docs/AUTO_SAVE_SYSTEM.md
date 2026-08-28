# InnoView IDE Auto-Save System Documentation

## Overview

The InnoView IDE features a comprehensive auto-save system designed to prevent data loss across all IDE screens. The system automatically saves user work on:

- Tab changes
- Screen/route navigation
- Browser tab switching (visibility change)
- Window blur (clicking outside the IDE)
- Page refresh
- Before logout
- At regular intervals (every 30 seconds)
- On network status changes

## Architecture

The auto-save system consists of several integrated components:

### Core Components

1. **AutoSaveManager** (`src/utils/autoSaveManager.js`)
   - Singleton class managing all auto-save operations
   - Registers save strategies for different screens
   - Handles debouncing and prioritization
   - Manages browser event listeners

2. **WorkspaceStateContext** (`src/contexts/WorkspaceStateContext.jsx`)
   - React Context for global workspace state
   - Integrates with AutoSaveManager
   - Handles emergency saves

3. **useAutoSave Hook** (`src/hooks/useAutoSave.js`)
   - Component-level auto-save integration
   - Specialized hooks for different screen types
   - Automatic registration with AutoSaveManager

4. **Redux Auto-Save Middleware** (`src/store/middleware/autoSaveMiddleware.js`)
   - Intercepts Redux actions to trigger auto-saves
   - Integrates with redux-persist

5. **AutoSaveStatus Component** (`src/components/AutoSaveStatus.jsx`)
   - Visual indicator of save status
   - Shows saving progress, last save time, and errors

## Usage Guide

### Basic Usage with useAutoSave Hook

```jsx
import { useAutoSave } from '../hooks/useAutoSave';

const MyComponent = () => {
  const [data, setData] = useState({ /* ... */ });

  const {
    isSaving,
    lastSaveTime,
    saveNow,
    scheduleSave,
    isLoaded
  } = useAutoSave({
    screenKey: '/my-screen',
    data: data,
    autoSaveDelay: 2000,
    priority: 2,
    onSave: (savedData) => console.log('Saved:', savedData),
    onLoad: (loadedData) => setData(loadedData),
    onError: (error) => console.error('Save error:', error)
  });

  // Data changes trigger auto-save via scheduleSave()
  const handleChange = (newData) => {
    setData(newData);
    scheduleSave();
  };

  return (/* ... */);
};
```

### Canvas/Diagram Auto-Save

```jsx
import { useCanvasAutoSave } from '../hooks/useAutoSave';

const DiagramEditor = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });

  const {
    isSaving,
    saveNow,
    scheduleSave
  } = useCanvasAutoSave(nodes, edges, viewport, {
    screenKey: '/BlockDiagram',
    priority: 3
  });

  // Canvas changes trigger auto-save
  useEffect(() => {
    scheduleSave();
  }, [nodes, edges, viewport]);

  return (/* ... */);
};
```

### Simulation Auto-Save

```jsx
import { useSimulationAutoSave } from '../hooks/useAutoSave';

const SimulationCanvas = () => {
  const droppedItems = useSelector(state => state.simulation.droppedItems);
  const connections = useSelector(state => state.simulation.connections);

  const {
    isSaving,
    saveNow,
    scheduleSave
  } = useSimulationAutoSave(droppedItems, connections, {
    screenKey: '/simulation',
    onLoad: (data) => {
      if (data.droppedItems) dispatch(setDroppedItems(data.droppedItems));
      if (data.connections) dispatch(setConnections(data.connections));
    }
  });

  return (/* ... */);
};
```

### Code Editor Auto-Save

```jsx
import { useCodeEditorAutoSave } from '../hooks/useAutoSave';

const CodeEditor = () => {
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);

  const {
    isSaving,
    saveNow,
    scheduleSave
  } = useCodeEditorAutoSave(
    tabs.find(t => t.id === activeTab)?.content || '',
    {
      screenKey: '/editor',
      tabs,
      activeTab,
      priority: 2
    }
  );

  return (/* ... */);
};
```

### Manual Save Operations

```jsx
import { autoSaveManager } from '../utils/autoSaveManager';

// Save a specific screen
await autoSaveManager.saveScreen('/simulation');

// Save all screens
await autoSaveManager.saveAll();

// Schedule a debounced save
autoSaveManager.scheduleSave('/editor', 2000);

// Load saved data
const data = autoSaveManager.loadData('/simulation');

// Clear saved data
autoSaveManager.clearData('/simulation');
```

### Using AutoSaveStatus Component

```jsx
import AutoSaveStatus from '../components/AutoSaveStatus';

// Corner position (floating indicator)
<AutoSaveStatus position="corner" />

// Inline status
<AutoSaveStatus screenKey="/editor" size="sm" />

// With details
<AutoSaveStatus screenKey="/simulation" showDetails={true} />
```

### Using Save Button

```jsx
import { SaveButton } from '../components/AutoSaveStatus';

// Save button for specific screen
<SaveButton screenKey="/editor" label="Save Code" />

// Global save button
<SaveButton label="Save All" />
```

## Configuration

### AutoSaveManager Configuration

The AutoSaveManager can be configured with the following options:

```javascript
autoSaveManager.config = {
  autoSaveInterval: 30000,  // Global auto-save every 30 seconds
  debounceDelay: 2000,      // 2 seconds debounce for changes
  maxRetries: 3,            // Max retry attempts on failure
  retryDelay: 1000,         // Delay between retries
  enableLogging: true       // Enable/disable logging
};
```

### Save Strategy Priority

Higher priority strategies are saved first during `saveAll()`:

- Priority 3: Canvas data (Block Diagram, Flowchart, Simulation)
- Priority 2: Code editor tabs
- Priority 1: Form data, settings

## Storage Structure

Data is stored in localStorage with the following key structure:

```
innoide:autosave:{userId}:{projectId}:{screenKey}
```

Each stored entry contains:

```json
{
  "data": { /* screen-specific data */ },
  "metadata": {
    "screenKey": "/simulation",
    "timestamp": 1699876543210,
    "version": "1.0",
    "userAgent": "...",
    "url": "..."
  }
}
```

## Screen-Specific Data Structures

### Code Editor (`/editor`)
```json
{
  "tabs": [
    { "id": 1, "name": "main.c", "content": "...", "dirty": false }
  ],
  "activeTab": 1,
  "timestamp": 1699876543210
}
```

### Block Diagram (`/BlockDiagram`)
```json
{
  "nodes": [...],
  "edges": [...],
  "viewport": { "x": 0, "y": 0, "zoom": 1 },
  "timestamp": 1699876543210
}
```

### Flowchart (`/FlowchartTest`)
```json
{
  "nodes": [...],
  "edges": [...],
  "viewport": { "x": 0, "y": 0, "zoom": 1 },
  "timestamp": 1699876543210
}
```

### Simulation (`/simulation`)
```json
{
  "droppedItems": [...],
  "connections": [...],
  "timestamp": 1699876543210
}
```

## Events

The auto-save system dispatches the following custom events:

| Event | Description |
|-------|-------------|
| `autosave:screen-saved` | Fired when a screen is saved successfully |
| `autosave:all-saved` | Fired when saveAll() completes |
| `autosave:error` | Fired when a save operation fails |
| `autosave:request` | Listen for manual save requests |

### Listening to Events

```javascript
window.addEventListener('autosave:screen-saved', (event) => {
  const { screenKey, data, timestamp } = event.detail;
  console.log(`Saved ${screenKey} at ${new Date(timestamp)}`);
});

window.addEventListener('autosave:all-saved', (event) => {
  const { successful, failed, total } = event.detail;
  console.log(`Saved ${successful}/${total} screens`);
});
```

## Troubleshooting

### Data Not Being Saved

1. Check browser console for auto-save logs
2. Verify the screen has registered a save strategy
3. Check localStorage quota (typically 5-10MB)
4. Verify user and project IDs are available

### Data Not Loading on Refresh

1. Verify data exists in localStorage
2. Check that the `onLoad` callback is properly handling data
3. Verify user/project IDs match the saved data

### Clearing Auto-Save Data

```javascript
// Clear all auto-save data
autoSaveManager.cleanup(0); // 0 = clear all

// Clear specific screen
autoSaveManager.clearData('/simulation');

// Clear via browser console
localStorage.clear();
sessionStorage.clear();
```

## Best Practices

1. **Always use `onLoad` callback** to restore state when component mounts
2. **Set appropriate priority** for critical data (higher = saved first)
3. **Use `saveNow()` before navigation** to ensure data is persisted
4. **Handle errors gracefully** with the `onError` callback
5. **Test with browser DevTools** to verify data is being saved
6. **Periodically clean up old data** using `autoSaveManager.cleanup()`

## Migration Guide

If you have existing components that don't use auto-save:

1. Import the appropriate hook (`useAutoSave`, `useCanvasAutoSave`, etc.)
2. Replace local state with hook state management
3. Add `onLoad` callback to restore saved state
4. Call `scheduleSave()` when data changes
5. Call `saveNow()` before navigation or unmount

## Contributing

When adding new screens to the IDE:

1. Define a default state structure in `DEFAULT_SCREEN_STATES`
2. Create a save strategy using `autoSaveManager.registerSaveStrategy()`
3. Use the appropriate auto-save hook in your component
4. Add cleanup in component unmount to save final state