import { registerFilesystemIPC } from './filesystem.ipc.js';
import { registerProjectIPC } from './project.ipc.js';
import { registerDeviceIPC } from './device.ipc.js';
import { registerSerialIPC } from './serial.ipc.js';
import { registerProcessIPC } from './process.ipc.js';
import { registerFlashIPC } from './flash.ipc.js';
import { ipcMain, app } from 'electron';

export function registerAllIPCHandlers(getMainWindow) {
  registerFilesystemIPC(getMainWindow);
  registerProjectIPC();
  registerDeviceIPC();
  registerSerialIPC(getMainWindow);
  registerProcessIPC(getMainWindow);
  registerFlashIPC(getMainWindow);

  ipcMain.handle('app:get-info', async () => {
    return {
      name: app.getName(),
      version: app.getVersion(),
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node,
      platform: process.platform
    };
  });
}
