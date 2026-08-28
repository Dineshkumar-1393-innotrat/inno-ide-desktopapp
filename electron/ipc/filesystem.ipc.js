import { ipcMain } from 'electron';
import { filesystemService } from '../services/filesystem.service.js';

export function registerFilesystemIPC(getMainWindow) {
  ipcMain.handle('fs:select-directory', async (event, options) => {
    return await filesystemService.selectDirectory(getMainWindow(), options);
  });

  ipcMain.handle('fs:select-file', async (event, options) => {
    return await filesystemService.selectFile(getMainWindow(), options);
  });

  ipcMain.handle('fs:select-save-file', async (event, options) => {
    return await filesystemService.selectSaveFile(getMainWindow(), options);
  });

  ipcMain.handle('fs:read-file', async (event, { path: filePath, encoding }) => {
    return await filesystemService.readFile(filePath, encoding);
  });

  ipcMain.handle('fs:write-file', async (event, { path: filePath, content, encoding }) => {
    return await filesystemService.writeFile(filePath, content, encoding);
  });

  ipcMain.handle('fs:create-directory', async (event, dirPath) => {
    return await filesystemService.createDirectory(dirPath);
  });

  ipcMain.handle('fs:delete', async (event, targetPath) => {
    return await filesystemService.deletePath(targetPath);
  });

  ipcMain.handle('fs:rename', async (event, { oldPath, newPath }) => {
    return await filesystemService.renamePath(oldPath, newPath);
  });

  ipcMain.handle('fs:list-directory', async (event, dirPath) => {
    return await filesystemService.listDirectory(dirPath);
  });
}
