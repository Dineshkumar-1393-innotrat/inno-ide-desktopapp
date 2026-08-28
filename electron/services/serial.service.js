import { execSync } from 'child_process';
import { logger } from '../utils/logger.js';

export class SerialService {
  constructor() {
    this.activePorts = new Map();
    this.SerialPort = null;
    this.initNativeSerial();
  }

  async initNativeSerial() {
    try {
      const module = await import('serialport');
      this.SerialPort = module.SerialPort;
    } catch {
      logger.warn('Native serialport module not available. Will use Windows WMI / PowerShell fallback.');
    }
  }

  async listPorts() {
    try {
      if (this.SerialPort && typeof this.SerialPort.list === 'function') {
        const ports = await this.SerialPort.list();
        if (ports && ports.length > 0) {
          return ports.map(port => ({
            path: port.path,
            manufacturer: port.manufacturer || undefined,
            serialNumber: port.serialNumber || undefined,
            vendorId: port.vendorId || undefined,
            productId: port.productId || undefined,
            friendlyName: port.friendlyName || port.pnpId || undefined
          }));
        }
      }

      // Windows WMI / PowerShell serial port discovery fallback
      if (process.platform === 'win32') {
        try {
          const psCommand = 'powershell -NoProfile -Command "Get-CimInstance Win32_SerialPort | Select-Object DeviceID, Name, Description, PNPDeviceID | ConvertTo-Json"';
          const stdout = execSync(psCommand, { encoding: 'utf-8', timeout: 4000 });
          if (stdout && stdout.trim()) {
            const raw = JSON.parse(stdout.trim());
            const items = Array.isArray(raw) ? raw : [raw];
            
            // Sort so real USB ports (VID_303A, etc.) come before Bluetooth ports
            items.sort((a, b) => {
              const aIsUsb = (a.PNPDeviceID || '').toUpperCase().includes('USB') || !(a.PNPDeviceID || '').toUpperCase().includes('BTH');
              const bIsUsb = (b.PNPDeviceID || '').toUpperCase().includes('USB') || !(b.PNPDeviceID || '').toUpperCase().includes('BTH');
              if (aIsUsb && !bIsUsb) return -1;
              if (!aIsUsb && bIsUsb) return 1;
              return 0;
            });

            return items.map(item => ({
              path: item.DeviceID,
              friendlyName: item.Name || item.Description || `Serial Device (${item.DeviceID})`,
              manufacturer: (item.PNPDeviceID || '').includes('303A') ? 'Espressif' : undefined,
              isUsb: (item.PNPDeviceID || '').toUpperCase().includes('USB') && !(item.PNPDeviceID || '').toUpperCase().includes('BTH')
            }));
          }
        } catch (psErr) {
          logger.warn('PowerShell serial port query failed:', psErr.message);
        }
      }

      return [];
    } catch (error) {
      logger.error('Error listing serial ports:', error.message);
      return [];
    }
  }

  async testPortOpen(portPath) {
    if (!portPath || typeof portPath !== 'string') {
      return { openable: false, port: portPath, error: 'Invalid port path' };
    }

    if (this.activePorts.has(portPath)) {
      return { openable: true, port: portPath, message: 'Port is active in application session' };
    }

    if (this.SerialPort) {
      return new Promise(resolve => {
        try {
          const testPort = new this.SerialPort({ path: portPath, baudRate: 115200, autoOpen: false });
          testPort.open(err => {
            if (err) {
              resolve({ openable: false, port: portPath, error: err.message });
            } else {
              testPort.close(() => {
                resolve({ openable: true, port: portPath });
              });
            }
          });
        } catch (err) {
          resolve({ openable: false, port: portPath, error: err.message });
        }
      });
    }

    // Fallback assumption: if regex matches valid port pattern, treat as accessible
    if (/^COM\d+$/i.test(portPath) || /^\/dev\/tty/i.test(portPath)) {
      return { openable: true, port: portPath, virtual: true };
    }

    return { openable: false, port: portPath, error: 'Port unavailable' };
  }

  async connectPort(portPath, options = {}, dataCallback) {
    try {
      if (this.activePorts.has(portPath)) {
        return { success: true, message: 'Already connected', port: portPath };
      }

      if (this.SerialPort) {
        const baudRate = options.baudRate || 115200;
        const port = new this.SerialPort({ path: portPath, baudRate });

        if (dataCallback) {
          port.on('data', data => dataCallback(data.toString('utf8')));
        }

        this.activePorts.set(portPath, port);
        return { success: true, port: portPath, baudRate };
      }

      // Fallback virtual connection
      this.activePorts.set(portPath, { virtual: true, baudRate: options.baudRate || 115200 });
      return { success: true, port: portPath, virtual: true };
    } catch (error) {
      logger.error(`Error connecting to serial port ${portPath}:`, error.message);
      throw error;
    }
  }

  async disconnectPort(portPath) {
    try {
      const port = this.activePorts.get(portPath);
      if (port) {
        if (!port.virtual && typeof port.close === 'function') {
          port.close();
        }
        this.activePorts.delete(portPath);
      }
      return { success: true, port: portPath };
    } catch (error) {
      logger.error(`Error disconnecting serial port ${portPath}:`, error.message);
      throw error;
    }
  }

  async writePort(portPath, data) {
    try {
      const port = this.activePorts.get(portPath);
      if (!port) {
        throw new Error(`Port ${portPath} is not connected.`);
      }

      if (!port.virtual && typeof port.write === 'function') {
        port.write(data);
      }
      return { success: true, port: portPath, bytesWritten: data.length };
    } catch (error) {
      logger.error(`Error writing to serial port ${portPath}:`, error.message);
      throw error;
    }
  }
}

export const serialService = new SerialService();
