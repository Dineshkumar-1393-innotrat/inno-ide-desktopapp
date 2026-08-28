import React, { useState, useEffect, useCallback } from 'react';
import projectFileManager from '../utils/projectFileManager';
import { useProject } from '../ProjectContext';
import { 
  ChevronRight, 
  ChevronDown, 
  File, 
  Folder, 
  FolderOpen,
  Plus,
  Download,
  Edit3,
  Trash2
} from 'lucide-react';

/**
 * Enhanced File Explorer with project structure support
 */
const ProjectFileExplorer = ({ 
  onFileClick,
  currentScreenFiles = [],
  activeProjectId,
  variant = "diagram"
}) => {
  const [projects, setProjects] = useState([]);
  const [expandedProjects, setExpandedProjects] = useState(new Set());
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [selectedFile, setSelectedFile] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const { user } = useProject();

  // Load projects on mount
  useEffect(() => {
    loadProjects();
    
    // Listen for project changes
    const handleProjectChange = (event) => {
      console.log('Project change detected:', event.detail);
      loadProjects();
    };

    const handleProjectCreated = (event) => {
      console.log('Project created:', event.detail);
      loadProjects();
    };

    const handleFileSystemRefresh = () => {
      loadProjects();
    };

    window.addEventListener('project:change', handleProjectChange);
    window.addEventListener('project-created', handleProjectCreated);
    window.addEventListener('file-system-refresh', handleFileSystemRefresh);
    
    return () => {
      window.removeEventListener('project:change', handleProjectChange);
      window.removeEventListener('project-created', handleProjectCreated);
      window.removeEventListener('file-system-refresh', handleFileSystemRefresh);
    };
  }, []);

  const loadProjects = useCallback(() => {
    const allProjects = projectFileManager.getAllProjects();
    setProjects(Object.values(allProjects));
    console.log('Loaded projects:', allProjects);
  }, []);

  const toggleProjectExpansion = useCallback((projectId) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  }, []);

  const toggleFolderExpansion = useCallback((folderId) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  }, []);

  const handleFileClick = useCallback(async (file, project) => {
    try {
      console.log('File clicked:', file);
      setSelectedFile(file.path);

      if (onFileClick) {
        // Load file content using new project file manager
        const content = projectFileManager.loadFile(project.id, file.path);
        if (content) {
          // Parse content based on file type
          let parsedContent = content;
          if (file.name.endsWith('.json')) {
            try {
              parsedContent = JSON.parse(content);
            } catch (e) {
              console.warn('Failed to parse JSON:', e);
            }
          }
          
          onFileClick(file.path, file.name, parsedContent, { 
            content, 
            parsedContent, 
            filePath: file.path,
            projectId: project.id
          });
        }
      }
    } catch (error) {
      console.error('Failed to handle file click:', error);
    }
  }, [onFileClick]);

  const handleContextMenu = useCallback((e, item, itemType, projectId) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item,
      itemType,
      projectId
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleContextAction = useCallback(async (action) => {
    const { item, itemType, projectId } = contextMenu;
    
    switch (action) {
      case 'rename':
        const newName = prompt(`Rename ${itemType}:`, item.name);
        if (newName && newName !== item.name) {
          // TODO: Implement rename functionality
          console.log('Rename:', item.name, 'to', newName);
        }
        break;
        
      case 'delete':
        if (confirm(`Delete ${itemType} "${item.name}"?`)) {
          // TODO: Implement delete functionality
          console.log('Delete:', item.name);
        }
        break;
        
      case 'export':
        // TODO: Implement export functionality
        console.log('Export:', item.name);
        break;
        
      case 'new_file':
        const fileName = prompt('Enter file name:');
        if (fileName) {
          const content = itemType === 'folder' && 
            (item.type === 'Flowchart' || item.type === 'Block Diagram') 
              ? '{"nodes":[],"edges":[],"viewport":null}' 
              : '// New file\n';
          
          await projectManager.addFileToProject(
            projectId, 
            item.id, 
            fileName, 
            content, 
            item.type
          );
          loadProjects();
        }
        break;
    }
    
    closeContextMenu();
  }, [contextMenu, loadProjects]);

  // Click outside to close context menu
  useEffect(() => {
    const handleClick = () => closeContextMenu();
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu, closeContextMenu]);

  const isFileOpen = (fileId) => currentScreenFiles.includes(fileId);

  return (
    <div className="project-file-explorer" style={{ height: '100%', overflow: 'auto' }}>
      {projects.length === 0 ? (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          color: '#666',
          fontSize: '14px'
        }}>
          <Folder size={48} style={{ opacity: 0.3, marginBottom: '10px' }} />
          <div>No projects found</div>
          <div style={{ fontSize: '12px', marginTop: '5px' }}>
            Create a new project to get started
          </div>
        </div>
      ) : (
        projects.map(project => {
          const isExpanded = expandedProjects.has(project.id);
          const projectFileTree = projectFileManager.getProjectFileTree(project.id);
          
          return (
            <div key={project.id} className="project-item">
              {/* Project Header */}
              <div 
                className="project-header"
                onClick={() => toggleProjectExpansion(project.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  backgroundColor: project.id === activeProjectId ? '#e3f2fd' : 'transparent',
                  borderRadius: '4px',
                  margin: '2px 0'
                }}
              >
                {isExpanded ? (
                  <ChevronDown size={16} style={{ marginRight: '4px' }} />
                ) : (
                  <ChevronRight size={16} style={{ marginRight: '4px' }} />
                )}
                <Folder size={16} style={{ marginRight: '8px', color: '#ffa726' }} />
                <span style={{ fontWeight: '500', fontSize: '14px' }}>
                  {project.name}
                </span>
                <span style={{ 
                  marginLeft: 'auto', 
                  fontSize: '11px', 
                  color: '#666',
                  opacity: 0.7
                }}>
                  {project.type}
                </span>
              </div>

              {/* Project Contents */}
              {isExpanded && projectFileTree && (
                <div style={{ marginLeft: '20px' }}>
                  {/* Folders */}
                  {projectFileTree.children?.filter(child => child.type === 'folder').map(folder => {
                    const isFolderExpanded = expandedFolders.has(folder.id);
                    
                    return (
                      <div key={folder.id} className="folder-item">
                        {/* Folder Header */}
                        <div
                          className="folder-header"
                          onClick={() => toggleFolderExpansion(folder.id)}
                          onContextMenu={(e) => handleContextMenu(e, folder, 'folder', project.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '6px 8px',
                            cursor: 'pointer',
                            borderRadius: '3px',
                            margin: '1px 0'
                          }}
                        >
                          {isFolderExpanded ? (
                            <ChevronDown size={14} style={{ marginRight: '4px' }} />
                          ) : (
                            <ChevronRight size={14} style={{ marginRight: '4px' }} />
                          )}
                          {isFolderExpanded ? (
                            <FolderOpen size={14} style={{ marginRight: '6px', color: '#42a5f5' }} />
                          ) : (
                            <Folder size={14} style={{ marginRight: '6px', color: '#42a5f5' }} />
                          )}
                          <span style={{ fontSize: '13px' }}>{folder.name}</span>
                          <span style={{ 
                            marginLeft: 'auto', 
                            fontSize: '10px', 
                            color: '#999',
                            backgroundColor: '#f0f0f0',
                            padding: '2px 6px',
                            borderRadius: '10px'
                          }}>
                            {folder.children?.length || 0}
                          </span>
                        </div>

                        {/* Folder Files */}
                        {isFolderExpanded && folder.children && (
                          <div style={{ marginLeft: '18px' }}>
                            {folder.children.map(file => (
                              <div
                                key={file.path || file.id}
                                className={`file-item ${isFileOpen(file.path) ? 'file-open' : ''} ${selectedFile === file.path ? 'file-selected' : ''}`}
                                onClick={() => handleFileClick(file, project)}
                                onContextMenu={(e) => handleContextMenu(e, file, 'file', project.id)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  padding: '4px 8px',
                                  cursor: 'pointer',
                                  borderRadius: '3px',
                                  margin: '1px 0',
                                  backgroundColor: selectedFile === file.path ? '#e8f5e8' : 
                                                   isFileOpen(file.path) ? '#fff3cd' : 'transparent',
                                  borderLeft: isFileOpen(file.path) ? '3px solid #28a745' : 'none'
                                }}
                              >
                                <File size={12} style={{ 
                                  marginRight: '6px', 
                                  color: file.name.endsWith('.json') ? '#ff7043' : 
                                         file.name.endsWith('.c') ? '#5c6bc0' : 
                                         file.name.endsWith('.png') ? '#ab47bc' : '#666'
                                }} />
                                <span style={{ fontSize: '12px', flex: 1 }}>
                                  {file.name}
                                </span>
                                {isFileOpen(file.path) && (
                                  <span style={{ 
                                    fontSize: '8px', 
                                    color: '#28a745',
                                    marginLeft: '4px' 
                                  }}>
                                    ●
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Root Files */}
                  {projectFileTree.children?.filter(child => child.type === 'file').map(file => (
                    <div
                      key={file.path || file.id}
                      className={`file-item ${isFileOpen(file.path) ? 'file-open' : ''} ${selectedFile === file.path ? 'file-selected' : ''}`}
                      onClick={() => handleFileClick(file, project)}
                      onContextMenu={(e) => handleContextMenu(e, file, 'file', project.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        borderRadius: '3px',
                        margin: '1px 0',
                        backgroundColor: selectedFile === file.path ? '#e8f5e8' : 
                                         isFileOpen(file.path) ? '#fff3cd' : 'transparent',
                        borderLeft: isFileOpen(file.path) ? '3px solid #28a745' : 'none'
                      }}
                    >
                      <File size={12} style={{ 
                        marginRight: '6px', 
                        color: file.name.endsWith('.json') ? '#ff7043' : 
                               file.name.endsWith('.c') ? '#5c6bc0' : 
                               file.name.endsWith('.png') ? '#ab47bc' : '#666'
                      }} />
                      <span style={{ fontSize: '12px', flex: 1 }}>
                        {file.name}
                      </span>
                      {isFileOpen(file.path) && (
                        <span style={{ 
                          fontSize: '8px', 
                          color: '#28a745',
                          marginLeft: '4px' 
                        }}>
                          ●
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            padding: '4px 0',
            zIndex: 1000,
            minWidth: '150px'
          }}
        >
          {contextMenu.itemType === 'folder' && (
            <button
              onClick={() => handleContextAction('new_file')}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              <Plus size={14} style={{ marginRight: '8px' }} />
              New File
            </button>
          )}
          
          <button
            onClick={() => handleContextAction('rename')}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '8px 12px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            <Edit3 size={14} style={{ marginRight: '8px' }} />
            Rename
          </button>
          
          {contextMenu.itemType === 'file' && (
            <button
              onClick={() => handleContextAction('export')}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              <Download size={14} style={{ marginRight: '8px' }} />
              Export
            </button>
          )}
          
          <button
            onClick={() => handleContextAction('delete')}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '8px 12px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#dc3545'
            }}
          >
            <Trash2 size={14} style={{ marginRight: '8px' }} />
            Delete
          </button>
        </div>
      )}

      <style jsx>{`
        .project-file-explorer {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        
        .file-item:hover {
          background-color: #f5f5f5 !important;
        }
        
        .folder-header:hover {
          background-color: #f0f0f0;
        }
        
        .project-header:hover {
          background-color: #e3f2fd !important;
        }
        
        .context-menu button:hover {
          background-color: #f5f5f5;
        }
      `}</style>
    </div>
  );
};

export default ProjectFileExplorer;
