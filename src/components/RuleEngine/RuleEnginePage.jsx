import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EditorNavbar from '../EditorNavbar';
import FileExplorer from '../FileExplorer';
import Flash from '../Flash';
import RuleEngineApp from './RuleEngineApp';
import { Folder, ChevronRight } from 'lucide-react';
import '../BlockDiagramTest.css';

const RuleEnginePage = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isResizing, setIsResizing] = useState(false);

  const handleTabChange = (tabId) => {
    if (tabId === 'Code Editor') {
      navigate('/editor');
    } else if (tabId === 'Flowchart') {
      navigate('/FlowchartTest');
    } else if (tabId === 'Simulation') {
      navigate('/simulation');
    } else if (tabId === 'Block Diagram') {
      navigate('/BlockDiagram');
    } else if (tabId === 'Block Programming') {
      navigate('/blockprogramming');
    } else if (tabId === 'MathCodeEditor') {
      navigate('/mathcodeeditor');
    } else if (tabId === 'Dynamic Rule Engine') {
      navigate('/rule-engine');
    }
  };

  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = Math.min(Math.max(e.clientX, 180), 480);
      setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
      <EditorNavbar
        activeTab="Dynamic Rule Engine"
        onTabChange={handleTabChange}
      />
      <div style={{ marginTop: '60px', flex: 1, height: 'calc(100vh - 60px)', display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Left File Explorer Sidebar matching BlockDiagram UI */}
        {isSidebarOpen ? (
          <div style={{ display: 'flex', height: '100%', flexShrink: 0 }}>
            <div className="sidebarr bd-sidebar-scope" style={{ width: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px`, height: '100%' }}>
              {/* Sidebar toggle bar matching BlockDiagram screen */}
              <div className="sidebar-toggle-bar">
                <button
                  type="button"
                  className="sidebar-tab active"
                >
                  Explorer
                </button>
              </div>

              {/* Sidebar Body */}
              <div className="sidebar-body">
                <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
                  <FileExplorer variant="diagram" />
                </div>
                <div style={{ borderTop: '1px solid #e2e8f0', padding: '6px', maxHeight: '260px', minHeight: '180px', overflowY: 'auto', backgroundColor: '#ffffff' }}>
                  <Flash />
                </div>
              </div>
            </div>

            {/* Sidebar Resizer Handle */}
            <div
              onMouseDown={startResizing}
              style={{
                width: '4px',
                height: '100%',
                cursor: 'col-resize',
                backgroundColor: isResizing ? '#2563eb' : 'transparent',
                transition: 'background-color 0.15s',
                zIndex: 15,
              }}
              title="Drag to resize sidebar"
            />
          </div>
        ) : (
          <button
            onClick={() => setIsSidebarOpen(true)}
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              zIndex: 20,
              backgroundColor: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'all 0.2s',
            }}
            title="Expand Explorer"
          >
            <Folder size={14} color="#2563eb" />
            <span>Explorer</span>
            <ChevronRight size={14} />
          </button>
        )}

        {/* Right Main Rule Engine Workspace */}
        <div style={{ flex: 1, height: '100%', overflow: 'hidden', minWidth: 0 }}>
          <RuleEngineApp />
        </div>
      </div>
    </div>
  );
};

export default RuleEnginePage;
