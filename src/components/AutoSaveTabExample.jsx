import React from 'react';
import { useAutoSaveTabs } from '../hooks/useAutoSaveTabs';

/**
 * Example component showing how to use the auto-save tabs system
 * This component can be integrated into any screen for automatic file management
 */
const AutoSaveTabExample = () => {
  // Initialize the auto-save tabs hook with default settings
  const {
    tabs,
    activeTab,
    addNewTab,
    closeTab,
    updateTabContent,
    renameTab,
    handleTabClick,
    saveTab,
    saveAsset,
    getActiveTab,
    getFolderInfo
  } = useAutoSaveTabs([
    // Initial tabs - will be auto-saved to appropriate screen folder
    { id: 1, name: "example.c", content: "// Example code\nint main() {\n    return 0;\n}", dirty: false }
  ], {
    maxTabs: 10,
    defaultTabName: "file",
    defaultContent: "// New file\n"
  });

  const activeTabData = getActiveTab();
  const folderInfo = getFolderInfo();

  // Handle content changes (auto-save is handled internally)
  const handleContentChange = (newContent) => {
    if (activeTab) {
      updateTabContent(activeTab, newContent);
    }
  };

  // Handle tab rename
  const handleRename = (tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    const newName = window.prompt('Rename file:', tab.name);
    if (newName && newName.trim() !== tab.name) {
      renameTab(tabId, newName.trim());
    }
  };

  // Export current content as an asset
  const handleExport = async () => {
    if (!activeTabData) return;

    const fileName = `${activeTabData.name}_export.txt`;
    const result = await saveAsset(fileName, activeTabData.content, 'export');
    
    if (result) {
      alert(`File exported to: ${result.folderName}/${fileName}`);
    } else {
      alert('Export failed');
    }
  };

  // Force save current tab
  const handleForceSave = async () => {
    if (!activeTab) return;

    const result = await saveTab(activeTab);
    if (result) {
      alert(`File saved to: ${result.folderName}/${result.fileName}`);
    } else {
      alert('Save failed');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Auto-Save Tabs Example</h2>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <strong>Folder Info:</strong>
        <p>Screen Folder: {folderInfo.folderName}</p>
        <p>Default Extension: {folderInfo.defaultExtension}</p>
        <p>Auto-save Enabled: {folderInfo.autoSaveEnabled ? 'Yes' : 'No'}</p>
      </div>

      {/* Tab Bar */}
      <div style={{ marginBottom: '10px', borderBottom: '1px solid #ccc' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            onDoubleClick={() => handleRename(tab.id)}
            style={{
              padding: '8px 16px',
              marginRight: '5px',
              backgroundColor: activeTab === tab.id ? '#007bff' : '#f8f9fa',
              color: activeTab === tab.id ? 'white' : 'black',
              border: '1px solid #dee2e6',
              borderBottom: activeTab === tab.id ? '1px solid #007bff' : '1px solid #dee2e6',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0'
            }}
          >
            {tab.name} {tab.dirty && '*'}
            <span
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              style={{ marginLeft: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ×
            </span>
          </button>
        ))}
        <button
          onClick={addNewTab}
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginLeft: '10px'
          }}
        >
          + New Tab
        </button>
      </div>

      {/* Content Area */}
      {activeTabData ? (
        <div>
          <textarea
            value={activeTabData.content}
            onChange={(e) => handleContentChange(e.target.value)}
            style={{
              width: '100%',
              height: '300px',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontFamily: 'Consolas, monospace',
              fontSize: '14px'
            }}
            placeholder="Enter your code here..."
          />
          
          <div style={{ marginTop: '10px' }}>
            <button
              onClick={handleForceSave}
              style={{
                padding: '8px 16px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Force Save
            </button>
            
            <button
              onClick={handleExport}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6f42c1',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Export File
            </button>
          </div>
          
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            <p>File: {activeTabData.name}</p>
            <p>Auto-save: Content is automatically saved 2 seconds after changes</p>
            <p>Last saved: {activeTabData.lastSaved ? activeTabData.lastSaved.toLocaleString() : 'Never'}</p>
            <p>Status: {activeTabData.dirty ? 'Modified (unsaved changes)' : 'Saved'}</p>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
          No tab selected. Click "New Tab" to create a file.
        </div>
      )}

      {/* Usage Instructions */}
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
        <h3>How It Works:</h3>
        <ul>
          <li><strong>Automatic Saving:</strong> Files are saved to screen-specific folders (e.g., "Code Editor", "Simulation", etc.)</li>
          <li><strong>Auto-save Delay:</strong> Changes are saved 2 seconds after you stop typing</li>
          <li><strong>File Organization:</strong> Each screen has its own folder in the project</li>
          <li><strong>Tab Management:</strong> Create, rename, and close tabs with automatic file management</li>
          <li><strong>Export Assets:</strong> Save additional files like exports, screenshots, etc.</li>
        </ul>
        
        <h3>Screen Folders:</h3>
        <ul>
          <li>/simulation → "Simulation" folder → .c files</li>
          <li>/blockprogramming → "Block Programming" folder → .json files</li>
          <li>/FlowchartTest → "Flowchart" folder → .json files</li>
          <li>/BlockDiagram → "Block Diagram" folder → .json files</li>
          <li>/editor → "Code Editor" folder → .c files</li>
        </ul>
      </div>
    </div>
  );
};

export default AutoSaveTabExample;
