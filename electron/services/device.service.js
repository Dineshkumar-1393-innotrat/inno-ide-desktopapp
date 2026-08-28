import { logger } from '../utils/logger.js';

export class DeviceService {
  async listDevices() {
    try {
      // Stub for device detection, can be enhanced with node-usb or system device discovery
      return [
        { id: 'esp32-default', name: 'ESP32 Development Board', type: 'microcontroller', status: 'available' },
        { id: 'arduino-uno-default', name: 'Arduino Uno', type: 'microcontroller', status: 'available' }
      ];
    } catch (error) {
      logger.error('Error listing devices:', error.message);
      return [];
    }
  }

  async getDeviceStatus(deviceId) {
    return {
      id: deviceId,
      connected: false,
      timestamp: new Date().toISOString()
    };
  }
}

export const deviceService = new DeviceService();
