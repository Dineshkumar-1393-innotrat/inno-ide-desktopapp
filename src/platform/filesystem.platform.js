import { isElectron } from './index.js';

export const filesystemPlatform = {
  async selectDirectory(options) {
    if (isElectron) {
      return await window.electronAPI.filesystem.selectDirectory(options);
    }
    console.warn('[FilesystemPlatform] Native directory selection fallback to Web API.');
    return null;
  },

  async selectFile(options) {
    if (isElectron) {
      return await window.electronAPI.filesystem.selectFile(options);
    }
    return null;
  },

  async readFile(filePath, encoding = 'utf8') {
    if (isElectron) {
      return await window.electronAPI.filesystem.readFile(filePath, encoding);
    }
    const key = `web_fs_${filePath}`;
    return localStorage.getItem(key) || '';
  },

  async writeFile(filePath, content, encoding = 'utf8') {
    if (isElectron) {
      return await window.electronAPI.filesystem.writeFile(filePath, content, encoding);
    }
    const key = `web_fs_${filePath}`;
    localStorage.setItem(key, content);
    return { success: true, path: filePath };
  },

  async listDirectory(dirPath) {
    if (isElectron) {
      return await window.electronAPI.filesystem.listDirectory(dirPath);
    }
    return [];
  }
};
