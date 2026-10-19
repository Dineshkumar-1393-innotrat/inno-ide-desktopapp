/**
 * Local Disk Persistence Service for InnoIDE
 * Handles saving diagrams, simulation states, and code files to the local drive
 * inside an organized project folder structure with automatic directory creation.
 */

export const sanitizePathSegment = (name) => {
  return (name || '')
    .toString()
    .trim()
    .replace(/[<>:"/\\|?*]+/g, '_')
    .replace(/\s+/g, '_');
};

/**
 * Returns the configured or detected local drive root directory
 */
export const getLocalDriveProjectsRoot = async () => {
  if (window.electronAPI?.filesystem?.getProjectsRoot) {
    try {
      const root = await window.electronAPI.filesystem.getProjectsRoot();
      if (root) return root;
    } catch (e) {
      console.warn('[LocalDiskService] getProjectsRoot error:', e);
    }
  }
  return 'D:/InnoIDE_Projects';
};

/**
 * Save project file directly to the local drive inside the project folder.
 * 
 * @param {Object} options
 * @param {string} [options.projectName] - Name of the project (e.g. 'IoT_Sensor_Hub')
 * @param {string} [options.subFolder] - Screen subfolder ('BlockDiagram', 'Flowchart', 'Simulation', 'Code', etc.)
 * @param {string} [options.fileName] - Name of the file to save (e.g. 'Main_Tab.json')
 * @param {Object|string} [options.data] - Diagram or file JSON payload
 * @param {string} [options.rawFileName] - Optional raw source code filename (e.g. 'main.c')
 * @param {string} [options.rawContent] - Optional raw source code content
 * @returns {Promise<{success: boolean, path: string, projectDir?: string, targetDir?: string, fileName?: string}>}
 */
export const saveToLocalDrive = async ({
  projectName = 'Untitled_Project',
  subFolder = '',
  fileName = 'diagram.json',
  data = {},
  rawFileName = null,
  rawContent = null,
}) => {
  const effectiveProjectName = projectName || localStorage.getItem('activeProjectName') || 'Untitled_Project';
  const safeProject = sanitizePathSegment(effectiveProjectName) || 'Untitled_Project';
  const safeSub = sanitizePathSegment(subFolder || '');
  let safeFile = (fileName || 'diagram.json').toString().trim().replace(/[<>:"/\\|?*]+/g, '_');

  if (!safeFile.toLowerCase().endsWith('.json') && !rawFileName) {
    safeFile = `${safeFile}.json`;
  }

  const jsonStr = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);

  // 1. Electron Native Filesystem Bridge
  if (window.electronAPI?.filesystem) {
    try {
      // If specialized IPC handler is available
      if (typeof window.electronAPI.filesystem.saveProjectFileLocal === 'function') {
        const res = await window.electronAPI.filesystem.saveProjectFileLocal({
          projectName: safeProject,
          subFolder: safeSub,
          fileName: safeFile,
          content: jsonStr,
          rawFileName,
          rawContent,
        });

        if (res && res.success) {
          console.log(`[LocalDiskService] Project file saved to: ${res.path}`);
          window.dispatchEvent(new CustomEvent('local-file-saved', { detail: res }));
          return res;
        }
      }

      // Universal Electron Fallback: direct writeFile
      // Note: writeFile in filesystem.service.js uses fsPromises.mkdir(path.dirname, { recursive: true })
      const baseRoot = 'D:/InnoIDE_Projects';
      const projectDir = `${baseRoot}/${safeProject}`;
      const targetDir = safeSub ? `${projectDir}/${safeSub}` : projectDir;
      const targetFilePath = `${targetDir}/${safeFile}`;

      // Write JSON file (creates all parent folders recursively)
      await window.electronAPI.filesystem.writeFile(targetFilePath, jsonStr, 'utf8');

      // Create or update project manifest
      const manifestPath = `${projectDir}/project.json`;
      const manifestData = JSON.stringify(
        {
          name: safeProject,
          updatedAt: new Date().toISOString(),
          lastSaved: `${safeSub ? safeSub + '/' : ''}${safeFile}`
        },
        null,
        2
      );
      window.electronAPI.filesystem.writeFile(manifestPath, manifestData, 'utf8').catch(() => {});

      // If raw file also provided (e.g. main.c)
      let rawFilePath = null;
      if (rawFileName && rawContent !== null && rawContent !== undefined) {
        const safeRaw = rawFileName.toString().trim().replace(/[<>:"/\\|?*]+/g, '_');
        rawFilePath = `${targetDir}/${safeRaw}`;
        await window.electronAPI.filesystem.writeFile(rawFilePath, String(rawContent), 'utf8');
      }

      console.log(`[LocalDiskService] Saved via writeFile bridge to: ${targetFilePath}`);
      const result = {
        success: true,
        path: targetFilePath,
        rawPath: rawFilePath,
        projectDir,
        targetDir,
        fileName: safeFile,
      };

      window.dispatchEvent(new CustomEvent('local-file-saved', { detail: result }));
      return result;
    } catch (fsErr) {
      console.error('[LocalDiskService] Error writing to local drive via Electron:', fsErr);
    }
  }

  // 2. Browser LocalStorage Fallback (when not running inside Electron)
  try {
    const fallbackKey = `innoide_local_${safeProject}_${safeSub}_${safeFile}`;
    localStorage.setItem(fallbackKey, jsonStr);
    return {
      success: true,
      path: `localStorage://${fallbackKey}`,
      projectDir: safeProject,
      isFallback: true,
    };
  } catch (err) {
    console.error('[LocalDiskService] Local storage fallback failed:', err);
    return { success: false, error: err.message };
  }
};
