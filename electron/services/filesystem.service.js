import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { dialog, app } from 'electron';
import { logger } from '../utils/logger.js';

export class FilesystemService {
  constructor() {
    this.watchers = new Map();
  }

  async selectDirectory(browserWindow, options = {}) {
    const result = await dialog.showOpenDialog(browserWindow, {
      properties: ['openDirectory', 'createDirectory'],
      title: options.title || 'Select Folder',
      buttonLabel: options.buttonLabel || 'Select Folder',
      ...options
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  }

  async selectFile(browserWindow, options = {}) {
    const result = await dialog.showOpenDialog(browserWindow, {
      properties: ['openFile'],
      title: options.title || 'Select File',
      filters: options.filters || [{ name: 'All Files', extensions: ['*'] }],
      ...options
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  }

  async selectSaveFile(browserWindow, options = {}) {
    const result = await dialog.showSaveDialog(browserWindow, {
      title: options.title || 'Save File',
      defaultPath: options.defaultPath,
      filters: options.filters || [{ name: 'All Files', extensions: ['*'] }],
      ...options
    });

    if (result.canceled || !result.filePath) {
      return null;
    }
    return result.filePath;
  }

  async readFile(filePath, encoding = 'utf8') {
    try {
      await fsPromises.access(filePath);
      return await fsPromises.readFile(filePath, encoding);
    } catch (error) {
      logger.error(`Error reading file ${filePath}:`, error.message);
      throw error;
    }
  }

  async writeFile(filePath, content, encoding = 'utf8') {
    try {
      await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
      await fsPromises.writeFile(filePath, content, encoding);
      logger.info(`File saved successfully: ${filePath}`);
      return { success: true, path: filePath };
    } catch (error) {
      logger.error(`Error writing file ${filePath}:`, error.message);
      throw error;
    }
  }

  async createDirectory(dirPath) {
    try {
      await fsPromises.mkdir(dirPath, { recursive: true });
      return { success: true, path: dirPath };
    } catch (error) {
      logger.error(`Error creating directory ${dirPath}:`, error.message);
      throw error;
    }
  }

  async deletePath(targetPath) {
    try {
      await fsPromises.rm(targetPath, { recursive: true, force: true });
      return { success: true, path: targetPath };
    } catch (error) {
      logger.error(`Error deleting path ${targetPath}:`, error.message);
      throw error;
    }
  }

  async renamePath(oldPath, newPath) {
    try {
      await fsPromises.rename(oldPath, newPath);
      return { success: true, oldPath, newPath };
    } catch (error) {
      logger.error(`Error renaming ${oldPath} to ${newPath}:`, error.message);
      throw error;
    }
  }

  async listDirectory(dirPath) {
    try {
      const items = await fsPromises.readdir(dirPath, { withFileTypes: true });
      const tree = [];

      for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        if (item.isDirectory()) {
          tree.push({
            name: item.name,
            path: fullPath,
            type: 'directory'
          });
        } else {
          tree.push({
            name: item.name,
            path: fullPath,
            type: 'file'
          });
        }
      }

      return tree;
    } catch (error) {
      logger.error(`Error listing directory ${dirPath}:`, error.message);
      throw error;
    }
  }

  getProjectsRootDir() {
    try {
      if (process.platform === 'win32') {
        if (fs.existsSync('D:\\')) {
          const dDir = 'D:\\InnoIDE_Projects';
          if (!fs.existsSync(dDir)) {
            fs.mkdirSync(dDir, { recursive: true });
          }
          return dDir;
        }
      }
    } catch (e) {
      logger.warn('[FilesystemService] Could not access D drive root, falling back to documents:', e.message);
    }

    try {
      const docDir = path.join(app.getPath('documents'), 'InnoIDE_Projects');
      if (!fs.existsSync(docDir)) {
        fs.mkdirSync(docDir, { recursive: true });
      }
      return docDir;
    } catch {
      const fallback = path.join(process.cwd(), 'InnoIDE_Projects');
      if (!fs.existsSync(fallback)) {
        fs.mkdirSync(fallback, { recursive: true });
      }
      return fallback;
    }
  }

  async saveProjectFileLocal({ projectName, subFolder, fileName, content, rawFileName, rawContent }) {
    try {
      const rootDir = this.getProjectsRootDir();
      const safeProject = (projectName || 'Untitled_Project')
        .toString()
        .trim()
        .replace(/[<>:"/\\|?*]/g, '_');
      const safeSub = subFolder
        ? subFolder.toString().trim().replace(/[<>:"/\\|?*]/g, '_')
        : '';
      let safeFile = (fileName || 'diagram.json')
        .toString()
        .trim()
        .replace(/[<>:"/\\|?*]/g, '_');

      if (!safeFile.toLowerCase().endsWith('.json') && !rawFileName) {
        safeFile = `${safeFile}.json`;
      }

      const projectDir = path.join(rootDir, safeProject);
      const targetDir = safeSub ? path.join(projectDir, safeSub) : projectDir;

      await fsPromises.mkdir(targetDir, { recursive: true });

      // Maintain project manifest
      const manifestPath = path.join(projectDir, 'project.json');
      let manifest = {
        name: safeProject,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        files: []
      };

      try {
        const existingData = await fsPromises.readFile(manifestPath, 'utf8');
        manifest = { ...manifest, ...JSON.parse(existingData), updatedAt: new Date().toISOString() };
      } catch {
        // Manifest does not exist yet
      }

      const relPath = safeSub ? `${safeSub}/${safeFile}` : safeFile;
      if (!manifest.files) manifest.files = [];
      if (!manifest.files.includes(relPath)) {
        manifest.files.push(relPath);
      }
      await fsPromises.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

      // Write target JSON file
      const filePath = path.join(targetDir, safeFile);
      const fileData = typeof content === 'object' ? JSON.stringify(content, null, 2) : String(content);
      await fsPromises.writeFile(filePath, fileData, 'utf8');

      // If raw file content also provided (e.g. main.c for Code Editor)
      let rawFilePath = null;
      if (rawFileName && rawContent !== undefined) {
        const safeRaw = rawFileName.toString().trim().replace(/[<>:"/\\|?*]/g, '_');
        rawFilePath = path.join(targetDir, safeRaw);
        await fsPromises.writeFile(rawFilePath, String(rawContent), 'utf8');
      }

      logger.info(`[FilesystemService] Project file saved to local drive: ${filePath}`);
      return {
        success: true,
        path: filePath,
        rawPath: rawFilePath,
        projectDir,
        targetDir,
        fileName: safeFile
      };
    } catch (error) {
      logger.error('[FilesystemService] Error saving project file locally:', error.message);
      throw error;
    }
  }
}

export const filesystemService = new FilesystemService();
