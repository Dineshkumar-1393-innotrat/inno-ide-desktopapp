import React, { useMemo } from 'react';
import { API } from '@/config';
import { Plus, Save, Loader2, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setActiveTab as setFlowchartActiveTab,
  addTab as addFlowchartTab,
  closeTab as closeFlowchartTab,
  renameTab as renameFlowchartTab
} from '../store/slices/flowchartSlice';
import {
  setActiveTab as setBlockDiagramActiveTab,
  addTab as addBlockDiagramTab,
  closeTab as closeBlockDiagramTab,
  renameTab as renameBlockDiagramTab
} from '../store/slices/blockDiagramSlice';
import {
  setActiveTab as setBlockProgrammingActiveTab,
  addTab as addBlockProgrammingTab,
  closeTab as closeBlockProgrammingTab,
  renameTab as renameBlockProgrammingTab
} from '../store/slices/blockProgrammingSlice';
import { WorkspaceTabsContext } from '../hooks/useWorkspaceTabs';
import { useContext } from 'react';
import axios from 'axios';
import { useProject } from '../ProjectContext';
import { getUserInfo } from '../utilities';
import { ensureProjectFolder } from '../utils/workspaceStorage';
import { useToast } from '@chakra-ui/react';
import './DiagramTabs.css';

const DiagramTabs = ({ title = 'Tabs', kind, onSaveJSON }) => {
  const dispatch = useDispatch();
  const toast = useToast();
  const projectContext = useProject() || {}; // Use project context safely
  const { activeProjectId } = projectContext;

  // Try to get state from Redux based on 'kind'
  const flowchartState = useSelector(state => state.flowchart);
  const blockDiagramState = useSelector(state => state.blockDiagram);
  const blockProgrammingState = useSelector(state => state.blockProgramming);

  let reduxTabs, reduxActiveTabId;

  if (kind === 'flowchart') {
    reduxTabs = flowchartState.tabs;
    reduxActiveTabId = flowchartState.activeTabId;
  } else if (kind === 'blockDiagram') {
    reduxTabs = blockDiagramState.tabs;
    reduxActiveTabId = blockDiagramState.activeTabId;
  } else if (kind === 'blockProgramming') {
    reduxTabs = blockProgrammingState.tabs;
    reduxActiveTabId = blockProgrammingState.activeTabId;
  }

  // Use context safely if available
  const context = useContext(WorkspaceTabsContext) || {};

  const tabs = reduxTabs || context.tabs || [];
  const activeTabId = reduxActiveTabId || context.activeTabId;

  const selectTab = (id) => {
    if (id === activeTabId) return; // Prevent redundant updates if already active

    if (reduxTabs) {
      if (kind === 'flowchart') dispatch(setFlowchartActiveTab(id));
      else if (kind === 'blockDiagram') dispatch(setBlockDiagramActiveTab(id));
      else if (kind === 'blockProgramming') dispatch(setBlockProgrammingActiveTab(id));
    } else {
      context.selectTab?.(id);
    }
  };

  const createTab = async () => {
    if (reduxTabs) {
      const newId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      let newTab = { id: newId, name: `Tab ${tabs.length + 1}`, state: { nodes: [], edges: [] }, dirty: true };

      try {
        let folderName = 'misc';
        let extension = '.json';
        let baseFileName = 'misc';
        if (kind === 'flowchart') {
          folderName = 'Flowchart'; // Use capitalized folder names for consistency
          baseFileName = 'flowchart';
        } else if (kind === 'blockDiagram') {
          folderName = 'BlockDiagram';
          baseFileName = 'blockdiagram';
        } else if (kind === 'blockProgramming') {
          folderName = 'BlockProgramming';
          baseFileName = 'blockprogramming';
        }

        const userInfo = getUserInfo();
        if (userInfo && userInfo.userId && activeProjectId) {
          console.log(`[DiagramTabs] Ensuring parent folder exists for module: ${folderName}`);
          const folderId = await ensureProjectFolder({
            userId: userInfo.userId,
            projectId: activeProjectId,
            folderName
          });

          if (!folderId) {
             throw new Error("Failed to resolve parent folder ID");
          }

          const formattedTabName = newTab.name.replace(/\s+/g, '');
          const fileName = `${baseFileName}_${formattedTabName}${extension}`;

          console.log(`[DiagramTabs] Creating individual diagram file: ${fileName} in folder: ${folderName}`);
          const { data } = await axios.post(`${API.MAIN}/api/v1/createFileAndFolder`, {
            parentId: folderId,
            name: fileName,
            type: "file",
            userId: userInfo.userId
          });

          if (data && data.success && data.file && data.file._id) {
            newTab.fileId = data.file._id;
            newTab.folderId = folderId; // Store folderId for reference
            window.dispatchEvent(new Event('file-system-refresh'));
          }
        }
      } catch (err) {
        console.error("Error creating file for new tab:", err);
      }

      if (kind === 'flowchart') dispatch(addFlowchartTab(newTab));
      else if (kind === 'blockDiagram') dispatch(addBlockDiagramTab(newTab));
      else if (kind === 'blockProgramming') dispatch(addBlockProgrammingTab(newTab));
    } else {
      context.createTab?.();
    }
  };

  const closeTab = async (id) => {
    const tabToClose = tabs.find(t => t.id === id);
    if (tabToClose && tabToClose.fileId) {
      try {
        await axios.delete(`${API.MAIN}/api/v1/deleteFileAndFolder`, {
          data: { fileId: tabToClose.fileId }
        });
        window.dispatchEvent(new Event('file-system-refresh'));
      } catch (err) {
        console.error("Error deleting file for closed tab:", err);
      }
    }

    if (reduxTabs) {
      if (kind === 'flowchart') dispatch(closeFlowchartTab(id));
      else if (kind === 'blockDiagram') dispatch(closeBlockDiagramTab(id));
      else if (kind === 'blockProgramming') dispatch(closeBlockProgrammingTab(id));
    } else {
      context.closeTab?.(id);
    }
  };

  const renameTab = (id, nextName) => {
    if (reduxTabs) {
      if (kind === 'flowchart') dispatch(renameFlowchartTab({ id, name: nextName }));
      else if (kind === 'blockDiagram') dispatch(renameBlockDiagramTab({ id, name: nextName }));
      else if (kind === 'blockProgramming') dispatch(renameBlockProgrammingTab({ id, name: nextName }));
    } else {
      context.renameTab?.(id, nextName);
    }
  };

  const {
    savingTabIds = [],
    saveActiveTabNow = () => Promise.resolve(),
  } = context || {};

  const savingIds = useMemo(() => new Set(savingTabIds), [savingTabIds]);

  const handleRename = (tabId, currentName) => {
    const nextName = window.prompt('Rename tab', currentName || 'Tab');
    if (nextName && nextName.trim().length) {
      renameTab(tabId, nextName.trim());
    }
  };

  return (
    <div className="diagram-tabs">
      <div className="diagram-tabs__actions">
        <button type="button" className="diagram-tabs__action" onClick={createTab} title="Add tab">
          <Plus size={16} />
        </button>
        <button
          type="button"
          className="diagram-tabs__action"
          onClick={async () => {
            await saveActiveTabNow();
            if (onSaveJSON) onSaveJSON();
          }}
          title="Save"
          disabled={!activeTabId}
        >
          <Save size={16} />
        </button>
      </div>
      <div className="diagram-tabs__list" role="tablist" aria-label={title}>
        {tabs.map((tab) => {
          if (!tab) return null;
          const isActive = tab.id === activeTabId;
          const isSaving = savingIds.has(tab.id);
          return (
            <div
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
              className={`diagram-tabs__tab ${isActive ? 'is-active' : ''}`}
              onClick={() => selectTab(tab.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  selectTab(tab.id);
                }
              }}
            >
              <span
                className="diagram-tabs__label"
                onDoubleClick={(event) => {
                  event.stopPropagation();
                  handleRename(tab.id, tab.name);
                }}
              >
                {tab.name}
                {tab.dirty && <span className="diagram-tabs__dirty-dot" title="Unsaved changes" />}
              </span>
              <button
                type="button"
                className="diagram-tabs__close"
                onClick={(event) => {
                  event.stopPropagation();
                  closeTab(tab.id);
                }}
                aria-label={`Close ${tab.name}`}
              >
                {isSaving ? <Loader2 className="diagram-tabs__spinner" size={14} /> : <X size={14} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DiagramTabs;
