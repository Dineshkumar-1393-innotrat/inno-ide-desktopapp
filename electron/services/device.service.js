import { serialService } from './serial.service.js';
import { logger } from '../utils/logger.js';

export class DeviceService {
  async listDevices() {
    try {
      const ports = await serialService.listPorts();
      if (!ports || ports.length === 0) {
        return [];
      }

      return ports.map((p, idx) => ({
        id: `device-${p.path || idx}`,
        name: p.friendlyName || `Hardware Device (${p.path})`,
        type: 'microcontroller',
        status: 'available',
        port: p.path,
        manufacturer: p.manufacturer,
        isUsb: p.isUsb
      }));
    } catch (error) {
      logger.error('Error listing devices:', error.message);
      return [];
    }
  }

  async getDeviceStatus(deviceId) {
    try {
      const ports = await serialService.listPorts();
      const found = ports.find((p, idx) => `device-${p.path || idx}` === deviceId || p.path === deviceId);
      return {
        id: deviceId,
        connected: Boolean(found),
        port: found?.path,
        timestamp: new Date().toISOString()
      };
    } catch {
      return {
        id: deviceId,
        connected: false,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const deviceService = new DeviceService();

