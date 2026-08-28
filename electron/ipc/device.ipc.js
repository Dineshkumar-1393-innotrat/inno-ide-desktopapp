import { ipcMain } from 'electron';
import { deviceService } from '../services/device.service.js';

export function registerDeviceIPC() {
  ipcMain.handle('device:list', async () => {
    return await deviceService.listDevices();
  });

  ipcMain.handle('device:get-status', async (event, deviceId) => {
    return await deviceService.getDeviceStatus(deviceId);
  });
}
