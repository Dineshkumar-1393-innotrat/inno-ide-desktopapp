import React, { useState, useEffect } from 'react';
import ProjectFileExplorer from './ProjectFileExplorer';
import CreateProjectIntegration from './CreateProjectIntegration';
import { useProjectCreation } from '../hooks/useProjectCreation';
import { projectManager } from '../utils/projectManager';
import { canvasIntegration } from '../utils/canvasIntegration';
import { useProject } from '../ProjectContext';
import { 
  Play, 
  Plus, 
  FolderPlus, 
  FileText, 
  Settings, 
  Save,
  Loader,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';

/**
 * Complete Project System Demo
 * Shows all the integrated functionality working together
 */
const ProjectSystemDemo = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('Block Diagram');
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  
  const { createProject, isCreating, creationError } = useProjectCreation();
  const { activeProjectId, setActiveProjectId, user } = useProject();

  // Load projects on mount
  useEffect(() => {
    const loadProjects = () => {
      const allProjects = projectManager.getAllProjects();
      setProjects(allProjects);
      
      // Set first project as active if none selected
      if (!activeProjectId && allProjects.length > 0) {
        setActiveProjectId(allProjects[0].id);
      }
    };

    loadProjects();

    // Listen for project changes
    const handleProjectChange = () => {
      loadProjects();
    };

    window.addEventListener('project:change', handleProjectChange);
    return () => window.removeEventListener('project:change', handleProjectChange);
  }, [activeProjectId, setActiveProjectId]);

  // Handle creating a new project
  const handleCreateProject = async (formData) => {
    setIsLoading(true);
    try {
      const project = await createProject({
        projectName: formData.projectName,
        projectType: formData.projectType,
        board: formData.board,
        selectedDiagramTypes: formData.selectedDiagramTypes,
        userId: user?.userId || 'demo_user',
        additionalOptions: formData.additionalOptions
      });

      setShowCreateDialog(false);
      setActiveProjectId(project.id);
      
      return project;
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file click from explorer
  const handleFileClick = async (fileId, fileName, fileContent, fileData) => {
    console.log('Demo: File clicked:', fileName, fileData);
    
    if (fileData) {
      // Simulate loading into appropriate canvas based on diagram type
      const success = await canvasIntegration.loadFileToCanvas(fileData, fileData.projectId || activeProjectId);
      if (success) {
        setCurrentScreen(fileData.diagramType);
        console.log(`Loaded ${fileName} into ${fileData.diagramType} canvas`);
      }
    }
  };

  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f8fafc'
    }}>
      {/* Integration Component */}
      <CreateProjectIntegration />

      {/* Left Panel - Project Management */}
      <div style={{ 
        width: '350px', 
        backgroundColor: '#ffffff', 
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '20px', 
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#1e293b',
          color: 'white'
        }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '600' }}>
            Project System Demo
          </h2>
          <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>
            Enhanced file management with auto-organization
          </p>
        </div>

        {/* Project Actions */}
        <div style={{ 
          padding: '15px 20px', 
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <button
            onClick={() => setShowCreateDialog(true)}
            disabled={isCreating || isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '10px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {isCreating || isLoading ? (
              <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Plus size={16} />
            )}
            Create New Project
          </button>

          {creationError && (
            <div style={{
              marginTop: '10px',
              padding: '8px 12px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              color: '#dc2626',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <AlertCircle size={14} />
              {creationError}
            </div>
          )}
        </div>

        {/* Active Project Info */}
        {activeProject && (
          <div style={{ 
            padding: '15px 20px', 
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f0f9ff'
          }}>
            <div style={{ fontSize: '13px', color: '#374151', marginBottom: '5px' }}>
              Active Project
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
              {activeProject.name}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
              {activeProject.type} • {activeProject.diagramTypes?.length || 0} screens
            </div>
          </div>
        )}

        {/* File Explorer */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ 
            padding: '10px 20px', 
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc'
          }}>
            <h3 style={{ margin: '0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
              Project Files
            </h3>
          </div>
          
          <div style={{ height: 'calc(100% - 50px)', overflow: 'auto' }}>
            <ProjectFileExplorer
              onFileClick={handleFileClick}
              activeProjectId={activeProjectId}
              variant="demo"
            />
          </div>
        </div>
      </div>

      {/* Right Panel - Canvas/Demo Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Canvas Header */}
        <div style={{ 
          padding: '15px 25px', 
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
              {currentScreen} Canvas
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
              Click files in the explorer to load content here
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px'
            }}>
              <Save size={14} />
              Auto-Save On
            </button>
          </div>
        </div>

        {/* Canvas Content */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          position: 'relative'
        }}>
          {activeProject ? (
            <div style={{ 
              textAlign: 'center',
              maxWidth: '500px',
              padding: '40px'
            }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                backgroundColor: '#e0f2fe', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <FileText size={32} color="#0369a1" />
              </div>
              
              <h3 style={{ 
                margin: '0 0 10px 0', 
                fontSize: '20px', 
                fontWeight: '600',
                color: '#1f2937'
              }}>
                {currentScreen} Ready
              </h3>
              
              <p style={{ 
                margin: '0 0 20px 0', 
                fontSize: '14px', 
                color: '#6b7280',
                lineHeight: '1.5'
              }}>
                Your project structure is set up! Click on any file in the left explorer to load it into this canvas. 
                All changes will be automatically saved to the appropriate folders.
              </p>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginTop: '30px'
              }}>
                {activeProject.diagramTypes?.map(type => (
                  <div key={type} style={{
                    padding: '12px 16px',
                    backgroundColor: currentScreen === type ? '#dbeafe' : 'white',
                    border: `1px solid ${currentScreen === type ? '#3b82f6' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setCurrentScreen(type)}
                  >
                    <div style={{ 
                      fontSize: '13px', 
                      fontWeight: '500',
                      color: currentScreen === type ? '#1e40af' : '#374151'
                    }}>
                      {type}
                    </div>
                    <div style={{ 
                      fontSize: '11px', 
                      color: '#6b7280',
                      marginTop: '2px'
                    }}>
                      Click files to load
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center',
              maxWidth: '400px'
            }}>
              <FolderPlus size={64} color="#9ca3af" style={{ marginBottom: '20px' }} />
              <h3 style={{ 
                margin: '0 0 10px 0', 
                fontSize: '18px', 
                color: '#4b5563'
              }}>
                No Project Selected
              </h3>
              <p style={{ 
                margin: 0, 
                fontSize: '14px', 
                color: '#6b7280'
              }}>
                Create a new project to see the enhanced file management system in action.
              </p>
            </div>
          )}

          {/* Status Indicators */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            display: 'flex',
            gap: '10px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              fontSize: '12px',
              color: '#059669'
            }}>
              <CheckCircle size={12} />
              File System Ready
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              fontSize: '12px',
              color: '#0369a1'
            }}>
              <Settings size={12} />
              Auto-Organization On
            </div>
          </div>
        </div>
      </div>

      {/* Create Project Dialog */}
      {showCreateDialog && (
        <CreateProjectDialog 
          onClose={() => setShowCreateDialog(false)}
          onCreate={handleCreateProject}
          isCreating={isCreating}
        />
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

/**
 * Simple Create Project Dialog
 */
const CreateProjectDialog = ({ onClose, onCreate, isCreating }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    projectType: 'Bare Metal',
    board: 'STM32 L5',
    selectedDiagramTypes: ['Block Diagram', 'Flowchart'],
    additionalOptions: {
      writeCode: true,
      flowChart: true,
      blockDiagram: true,
      simulation: false
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.projectName.trim()) {
      onCreate(formData);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90%',
        overflow: 'auto'
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600' }}>
          Create New Project
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Project Name *
            </label>
            <input
              type="text"
              value={formData.projectName}
              onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              placeholder="Enter project name"
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Diagram Types
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {['Block Diagram', 'Flowchart', 'Block Programming', 'Simulation', 'Code Editor'].map(type => (
                <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={formData.selectedDiagramTypes.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          selectedDiagramTypes: [...prev.selectedDiagramTypes, type]
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          selectedDiagramTypes: prev.selectedDiagramTypes.filter(t => t !== type)
                        }));
                      }
                    }}
                  />
                  <span style={{ fontSize: '14px' }}>{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !formData.projectName.trim()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isCreating && <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />}
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectSystemDemo;
