import React, { useState } from 'react';
import { useAutoSaveTabs } from '../hooks/useAutoSaveTabs';
import EnhancedFileExplorer from './EnhancedFileExplorer';

/**
 * Demo component showing the complete tab-file integration
 * This demonstrates how tabs are automatically saved and can be reopened from file explorer
 */
const TabFileIntegrationDemo = () => {
  const [selectedView, setSelectedView] = useState('tabs');

  // Initialize auto-save tabs
  const {
    tabs,
    activeTab,
    addNewTab,
    closeTab,
    updateTabContent,
    renameTab,
    handleTabClick,
    openFileAsTab,
    getFolderInfo,
    tabManager
  } = useAutoSaveTabs([
    { id: 1, name: "main.c", content: "// Main program\nint main() {\n    printf(\"Hello World!\");\n    return 0;\n}", dirty: false }
  ], {
    maxTabs: 10,
    defaultTabName: "file",
    defaultContent: "// New file\n"
  });

  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const folderInfo = getFolderInfo();

  // Handle file click from enhanced file explorer
  const handleFileClick = async (fileId, fileName, fileContent) => {
    try {
      await openFileAsTab(fileId, fileName, fileContent);
      setSelectedView('tabs'); // Switch to tabs view when file is opened
    } catch (error) {
      console.error('Failed to open file:', error);
    }
  };

  // Get currently open file IDs for highlighting
  const currentScreenFiles = tabs
    .filter(tab => tab.fileId)
    .map(tab => tab.fileId);

  // Handle tab rename
  const handleTabRename = (tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    const newName = window.prompt('Rename file:', tab.name);
    if (newName && newName.trim() !== tab.name) {
      renameTab(tabId, newName.trim());
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      fontFamily: 'Inter, system-ui, sans-serif',
      backgroundColor: '#f8fafc'
    }}>
      {/* Left Panel - Navigation */}
      <div style={{ 
        width: '250px', 
        backgroundColor: '#1e293b', 
        color: 'white', 
        padding: '20px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>
          Tab-File Integration Demo
        </h2>
        
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '500', marginBottom: '10px', color: '#94a3b8' }}>
            Screen: {folderInfo.folderName}
          </h3>
          <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
            Files will be saved to the "{folderInfo.folderName}" folder with {folderInfo.defaultExtension} extension
          </p>
        </div>

        <nav style={{ flex: 1 }}>
          <button
            onClick={() => setSelectedView('tabs')}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '8px',
              backgroundColor: selectedView === 'tabs' ? '#3b82f6' : 'transparent',
              color: 'white',
              border: '1px solid ' + (selectedView === 'tabs' ? '#3b82f6' : '#374151'),
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              textAlign: 'left'
            }}
          >
            📝 Tab Editor ({tabs.length})
          </button>
          
          <button
            onClick={() => setSelectedView('explorer')}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: selectedView === 'explorer' ? '#3b82f6' : 'transparent',
              color: 'white',
              border: '1px solid ' + (selectedView === 'explorer' ? '#3b82f6' : '#374151'),
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              textAlign: 'left'
            }}
          >
            🗂️ File Explorer
          </button>
        </nav>

        <div style={{ 
          padding: '15px', 
          backgroundColor: '#0f172a', 
          borderRadius: '8px',
          fontSize: '11px',
          color: '#94a3b8',
          lineHeight: '1.4'
        }}>
          <strong>How it works:</strong><br/>
          1. Create/edit tabs above<br/>
          2. Files auto-save to project<br/>
          3. Click files in explorer to reopen as tabs<br/>
          4. Green dot = file is open as tab
        </div>
      </div>

      {/* Right Panel - Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedView === 'tabs' ? (
          // Tab Editor View
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Tab Bar */}
            <div style={{ 
              borderBottom: '1px solid #e2e8f0', 
              backgroundColor: 'white',
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              minHeight: '60px'
            }}>
              {tabs.map(tab => (
                <div
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  onDoubleClick={() => handleTabRename(tab.id)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: activeTab === tab.id ? '#3b82f6' : '#f1f5f9',
                    color: activeTab === tab.id ? 'white' : '#334155',
                    border: '1px solid ' + (activeTab === tab.id ? '#3b82f6' : '#e2e8f0'),
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    position: 'relative',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tab.name}
                  {tab.dirty && <span style={{ color: '#ef4444' }}>●</span>}
                  {tab.fileId && <span style={{ color: '#22c55e', fontSize: '10px' }}>💾</span>}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      cursor: 'pointer',
                      fontSize: '16px',
                      padding: '0',
                      marginLeft: '4px',
                      opacity: 0.7
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              
              <button
                onClick={addNewTab}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                + New Tab
              </button>
            </div>

            {/* Editor Content */}
            {activeTabData ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ 
                  padding: '10px 20px', 
                  backgroundColor: '#f8fafc', 
                  borderBottom: '1px solid #e2e8f0',
                  fontSize: '13px',
                  color: '#64748b'
                }}>
                  <span style={{ fontWeight: '500' }}>File:</span> {activeTabData.name}
                  {activeTabData.filePath && (
                    <span style={{ marginLeft: '15px' }}>
                      <span style={{ fontWeight: '500' }}>Path:</span> {activeTabData.filePath}
                    </span>
                  )}
                  <span style={{ marginLeft: '15px' }}>
                    <span style={{ fontWeight: '500' }}>Status:</span> {
                      activeTabData.dirty ? 
                        <span style={{ color: '#ef4444' }}>Modified (auto-saving...)</span> : 
                        <span style={{ color: '#22c55e' }}>Saved</span>
                    }
                  </span>
                </div>
                
                <textarea
                  value={activeTabData.content}
                  onChange={(e) => updateTabContent(activeTabData.id, e.target.value)}
                  style={{
                    flex: 1,
                    margin: '20px',
                    padding: '20px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontFamily: 'JetBrains Mono, Consolas, monospace',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    resize: 'none',
                    outline: 'none'
                  }}
                  placeholder="Start typing your code here..."
                />
              </div>
            ) : (
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#64748b',
                fontSize: '16px'
              }}>
                No tab selected. Click "New Tab" to create a file.
              </div>
            )}
          </div>
        ) : (
          // File Explorer View
          <div style={{ flex: 1, padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                File Explorer
              </h2>
              <p style={{ color: '#64748b', fontSize: '14px' }}>
                Click on files from the "{folderInfo.folderName}" folder to open them as tabs.
                Files with a green indicator are currently open.
              </p>
            </div>
            
            <div style={{ 
              border: '1px solid #e2e8f0', 
              borderRadius: '8px', 
              backgroundColor: 'white',
              height: 'calc(100% - 100px)'
            }}>
              <EnhancedFileExplorer
                variant="diagram"
                onFileClick={handleFileClick}
                currentScreenFiles={currentScreenFiles}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabFileIntegrationDemo;
