import { isElectron } from './index.js';

export const devicePlatform = {
  async listDevices() {
    if (isElectron) {
      return await window.electronAPI.device.list();
    }
    return [
      { id: 'web-device-1', name: 'Web Connected Device (Simulated)', status: 'available' }
    ];
  },

  async getStatus(id) {
    if (isElectron) {
      return await window.electronAPI.device.getStatus(id);
    }
    return { id, connected: false };
  }
};
