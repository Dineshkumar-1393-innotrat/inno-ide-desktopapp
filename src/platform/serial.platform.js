import { isElectron } from './index.js';

export const serialPlatform = {
  async listPorts() {
    if (isElectron) {
      return await window.electronAPI.serial.listPorts();
    }
    if ('serial' in navigator) {
      try {
        const ports = await navigator.serial.getPorts();
        return ports.map((p, idx) => ({ path: `WebSerialPort-${idx + 1}` }));
      } catch (err) {
        console.warn('WebSerial getPorts error:', err);
      }
    }
    return [];
  },

  async connect(path, baudRate = 115200) {
    if (isElectron) {
      return await window.electronAPI.serial.connect(path, baudRate);
    }
    if ('serial' in navigator) {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate });
      return { success: true, port: 'web-serial' };
    }
    throw new Error('Serial communication is not supported on this platform/browser.');
  },

  async disconnect(path) {
    if (isElectron) {
      return await window.electronAPI.serial.disconnect(path);
    }
    return { success: true };
  },

  async write(path, data) {
    if (isElectron) {
      return await window.electronAPI.serial.write(path, data);
    }
    return { success: false, message: 'Web serial write not connected' };
  },

  onData(callback) {
    if (isElectron) {
      return window.electronAPI.serial.onData(callback);
    }
    return () => {};
  }
};
