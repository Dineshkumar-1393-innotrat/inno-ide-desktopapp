import React, { useCallback, useEffect, useState } from 'react';
import FileExplorer from './FileExplorer';
import { useProject } from '../ProjectContext';
import { getScreenFolderName } from '../utils/screenFileManager';
import { useLocation } from 'react-router-dom';

/**
 * Enhanced File Explorer that integrates with tab management
 * Handles file clicks to open files as tabs in the current screen
 */
const EnhancedFileExplorer = ({ 
  variant = "diagram", 
  onFileClick, 
  currentScreenFiles = [],
  ...props 
}) => {
  const { activeProjectId, user } = useProject();
  const location = useLocation();
  const [screenFolderName, setScreenFolderName] = useState('');

  // Get the screen folder name for the current location
  useEffect(() => {
    const folderName = getScreenFolderName(location.pathname);
    setScreenFolderName(folderName);
  }, [location.pathname]);

  // Handle file click from the explorer
  const handleFileClick = useCallback(async (file) => {
    try {
      // Check if this file belongs to the current screen's folder
      const isCurrentScreenFile = file.path && file.path.includes(screenFolderName);
      
      if (isCurrentScreenFile && onFileClick) {
        // Fetch file content if needed
        const fileContent = file.content || '';
        
        // Call the provided onFileClick handler (will open as tab)
        await onFileClick(file._id, file.name, fileContent);
        
        console.log(`Opened file as tab: ${file.name}`);
      }
    } catch (error) {
      console.error('Error opening file as tab:', error);
    }
  }, [screenFolderName, onFileClick]);

  // Custom file list processor to highlight current screen files
  const processFileList = useCallback((files) => {
    if (!files || !Array.isArray(files)) return files;
    
    return files.map(file => ({
      ...file,
      isCurrentScreenFile: file.path && file.path.includes(screenFolderName),
      isOpenAsTab: currentScreenFiles.includes(file._id)
    }));
  }, [screenFolderName, currentScreenFiles]);

  return (
    <div className="enhanced-file-explorer">
      <FileExplorer 
        variant={variant}
        onFileClick={handleFileClick}
        processFileList={processFileList}
        currentScreenFolder={screenFolderName}
        {...props}
      />
      
      <style>{`
        .enhanced-file-explorer {
          height: 100%;
        }

        .enhanced-file-explorer .file-item.current-screen-file {
          background-color: rgba(59, 130, 246, 0.1);
          border-left: 3px solid #3b82f6;
        }

        .enhanced-file-explorer .file-item.open-as-tab {
          background-color: rgba(34, 197, 94, 0.1);
          border-left: 3px solid #22c55e;
        }

        .enhanced-file-explorer .file-item.open-as-tab::after {
          content: " ●";
          color: #22c55e;
          font-weight: bold;
        }

        .enhanced-file-explorer .file-item.current-screen-file:hover {
          background-color: rgba(59, 130, 246, 0.2);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default EnhancedFileExplorer;
