import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { dialog } from 'electron';
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
}

export const filesystemService = new FilesystemService();
