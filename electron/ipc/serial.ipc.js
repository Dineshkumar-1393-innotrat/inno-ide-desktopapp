import { ipcMain } from 'electron';
import { serialService } from '../services/serial.service.js';

export function registerSerialIPC(getMainWindow) {
  ipcMain.handle('serial:list-ports', async () => {
    return await serialService.listPorts();
  });

  ipcMain.handle('serial:connect', async (event, { path: portPath, baudRate }) => {
    return await serialService.connectPort(portPath, { baudRate }, data => {
      const mainWindow = getMainWindow();
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('serial:data', { port: portPath, data });
      }
    });
  });

  ipcMain.handle('serial:disconnect', async (event, portPath) => {
    return await serialService.disconnectPort(portPath);
  });

  ipcMain.handle('serial:write', async (event, { path: portPath, data }) => {
    return await serialService.writePort(portPath, data);
  });
}
