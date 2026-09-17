import { execSync, exec } from 'child_process';
import { promisify } from 'util';
const execPromise = promisify(exec);
import fs from 'fs';
import net from 'net';
import { logger } from '../utils/logger.js';
import { networkDiscoveryService } from './network_discovery.service.js';

export function isNetworkPort(portPath) {
  if (!portPath || typeof portPath !== 'string') return false;
  return /^(TCP:|WIFI:)/i.test(portPath) || /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/.test(portPath.trim());
}

export function parseNetworkPort(portPath) {
  const clean = portPath.trim().replace(/^(TCP:|WIFI:)/i, '');
  const [host, portStr] = clean.split(':');
  return {
    host,
    port: parseInt(portStr || '8888', 10)
  };
}

// Common Microcontroller & USB-to-UART Chipset Signatures
const KNOWN_CHIPSETS = [
  { match: /303A/i, name: 'Espressif ESP32 (Native USB CDC / JTAG)', manufacturer: 'Espressif Systems', isUsb: true },
  { match: /10C4/i, name: 'Silicon Labs CP210x USB-to-UART', manufacturer: 'Silicon Labs', isUsb: true },
  { match: /1A86/i, name: 'WCH CH340 / CH341 USB-to-Serial', manufacturer: 'WCH', isUsb: true },
  { match: /0403/i, name: 'FTDI USB-to-Serial UART', manufacturer: 'FTDI', isUsb: true },
  { match: /067B/i, name: 'Prolific PL2303 USB-to-Serial', manufacturer: 'Prolific', isUsb: true },
  { match: /2341|2A03/i, name: 'Arduino Microcontroller', manufacturer: 'Arduino LLC', isUsb: true },
  { match: /2E8A/i, name: 'Raspberry Pi RP2040 (Pico)', manufacturer: 'Raspberry Pi', isUsb: true },
  { match: /0483/i, name: 'STMicroelectronics ST-Link / STM32', manufacturer: 'STMicroelectronics', isUsb: true }
];

export class SerialService {
  constructor() {
    this.activePorts = new Map();
    this.pendingConnects = new Map();
    this.writeQueues = new Map();
    this.lockedPorts = new Set(); // Ports locked during flash (prevents auto-reconnect)
    this.SerialPort = null;
    this.initPromise = this.initNativeSerial();
  }

  async initNativeSerial() {
    try {
      const module = await import('serialport');
      this.SerialPort = module.SerialPort;
      logger.info('Native serialport module successfully loaded.');
    } catch {
      logger.warn('Native serialport module not available. Will use multi-tier OS fallback.');
    }
  }

  identifyDevice(pnpId = '', friendlyName = '', manufacturer = '', vendorId = '', productId = '') {
    const raw = `${vendorId} ${productId} ${pnpId} ${friendlyName} ${manufacturer}`.toUpperCase();

    for (const chip of KNOWN_CHIPSETS) {
      if (chip.match.test(raw)) {
        return {
          chipName: chip.name,
          manufacturer: chip.manufacturer || manufacturer,
          isUsb: true,
          recognized: true
        };
      }
    }

    const isBluetooth = /BTH|BTHENUM|BLUETOOTH/i.test(raw);
    const isUsb = (/USB|USBSER|FTDIBUS|SILABSER|CH34/i.test(raw) || /COM\d+/i.test(raw)) && !isBluetooth;

    return {
      chipName: isBluetooth ? 'Bluetooth Serial Link' : (isUsb ? 'USB Serial Device' : 'Standard Serial Port'),
      manufacturer: manufacturer || (isUsb ? 'USB-UART Bridge' : 'Generic Serial'),
      isUsb,
      recognized: false
    };
  }

  async listPorts() {
    // Ensure native serial module is initialized
    if (this.initPromise) {
      await this.initPromise.catch(() => {});
    }

    const discovered = new Map();

    const addPort = (p) => {
      if (!p || !p.path) return;
      const key = p.path.toUpperCase();
      if (!discovered.has(key)) {
        discovered.set(key, {
          path: p.path,
          friendlyName: p.friendlyName || p.name || `Serial Port (${p.path})`,
          manufacturer: p.manufacturer || (p.isUsb ? 'USB Serial Device' : undefined),
          isUsb: p.isUsb !== false,
          pnpId: p.pnpId
        });
      } else {
        const existing = discovered.get(key);
        if (p.friendlyName && (!existing.friendlyName || existing.friendlyName === `Serial Port (${p.path})`)) {
          existing.friendlyName = p.friendlyName;
        }
        if (p.manufacturer && !existing.manufacturer) {
          existing.manufacturer = p.manufacturer;
        }
        if (p.isUsb !== undefined) {
          existing.isUsb = existing.isUsb || p.isUsb;
        }
      }
    };

    // Tier 1: Node-serialport native listing
    if (this.SerialPort && typeof this.SerialPort.list === 'function') {
      try {
        const nativePorts = await this.SerialPort.list();
        if (Array.isArray(nativePorts)) {
          for (const np of nativePorts) {
            addPort({
              path: np.path,
              vendorId: np.vendorId,
              productId: np.productId,
              pnpId: np.pnpId,
              friendlyName: np.friendlyName || (np.pnpId ? `${np.pnpId} (${np.path})` : undefined),
              isUsb: Boolean(np.vendorId || np.productId || (np.pnpId && !np.pnpId.includes('BTH')))
            });
          }
        }
      } catch (err) {
        logger.warn('Native SerialPort.list() error:', err.message);
      }
    }

    // Tier 2: Windows Registry SERIALCOMM & PnPEntity (run if no ports found via native)
    if (process.platform === 'win32' && discovered.size === 0) {
      try {
        const psScript = `
$res = @()
try {
  if (Test-Path 'HKLM:\\HARDWARE\\DEVICEMAP\\SERIALCOMM') {
    $reg = Get-ItemProperty -Path 'HKLM:\\HARDWARE\\DEVICEMAP\\SERIALCOMM'
    $reg.PSObject.Properties | Where-Object { $_.Name -notmatch '^PS' } | ForEach-Object {
      $res += [PSCustomObject]@{
        Path = [string]$_.Value
        Name = ('Serial Port (' + $_.Value + ')')
        PNPDeviceID = [string]$_.Name
        Manufacturer = ''
      }
    }
  }
} catch {}
try {
  $pnp = Get-CimInstance Win32_PnPEntity | Where-Object { $_.PNPClass -eq 'Ports' -or $_.Caption -match '\\(COM\\d+\\)' }
  foreach ($dev in $pnp) {
    if ($dev.Caption -match '\\((COM\\d+)\\)') {
      $res += [PSCustomObject]@{ Path = $Matches[1]; Name = $dev.Name; PNPDeviceID = $dev.PNPDeviceID; Manufacturer = $dev.Manufacturer }
    }
  }
} catch {}
$res | ConvertTo-Json -Compress
`;
        const { stdout } = await execPromise(`powershell -NoProfile -NonInteractive -Command "${psScript.replace(/"/g, '\\"')}"`, { timeout: 4000 });
        if (stdout && stdout.trim()) {
          const raw = stdout.trim();
          const list = raw.startsWith('[') ? JSON.parse(raw) : [JSON.parse(raw)];
          for (const item of list) {
            if (item && item.Path) {
              addPort({ path: item.Path, friendlyName: item.Name, pnpId: item.PNPDeviceID, manufacturer: item.Manufacturer });
            }
          }
        }
      } catch (psErr) {
        logger.warn('Windows PowerShell serial port scan warning:', psErr.message);
      }
    }

    // Tier 3: Unix / Linux / macOS device scanning
    if (process.platform === 'linux' || process.platform === 'darwin') {
      try {
        const devDir = '/dev';
        if (fs.existsSync(devDir)) {
          const files = fs.readdirSync(devDir);
          for (const file of files) {
            if (/^(ttyUSB|ttyACM|tty\.usbserial|tty\.usbmodem|cu\.usbserial|cu\.usbmodem)/.test(file)) {
              addPort({ path: `${devDir}/${file}`, friendlyName: `USB Serial (${file})`, isUsb: true });
            }
          }
        }
      } catch (unixErr) {
        logger.warn('Unix /dev port scan warning:', unixErr.message);
      }
    }

    // Tier 4: Discovered Wi-Fi Devices
    try {
      const netDevices = networkDiscoveryService.getDevices();
      for (const netDev of netDevices) {
        addPort({
          path: netDev.path,
          friendlyName: netDev.friendlyName,
          isUsb: false,
          isNetwork: true,
          ip: netDev.ip
        });
      }
    } catch { }

    return Array.from(discovered.values());
  }

  async testPortOpen(portPath) {
    if (!portPath || typeof portPath !== 'string') return { openable: false, error: 'Invalid port' };
    await this.disconnectPort(portPath);

    if (isNetworkPort(portPath)) {
      const { host, port: netPort } = parseNetworkPort(portPath);
      return new Promise(resolve => {
        const testSock = new net.Socket();
        let done = false;
        const to = setTimeout(() => {
          if (!done) {
            done = true;
            try { testSock.destroy(); } catch {}
            resolve({ openable: false, error: 'Network device connection timed out' });
          }
        }, 2500);

        testSock.connect(netPort, host, () => {
          if (!done) {
            done = true;
            clearTimeout(to);
            testSock.destroy();
            resolve({ openable: true, port: portPath, isNetwork: true });
          }
        });

        testSock.on('error', err => {
          if (!done) {
            done = true;
            clearTimeout(to);
            resolve({ openable: false, error: err.message });
          }
        });
      });
    }

    if (this.SerialPort) {
      return new Promise(resolve => {
        const testPort = new this.SerialPort({ path: portPath, baudRate: 115200, autoOpen: false });
        testPort.open(err => {
          if (err) {
            resolve({ openable: false, error: err.message });
          } else {
            testPort.close(() => {
              setTimeout(() => resolve({ openable: true }), 150);
            });
          }
        });
      });
    }
    return { openable: true, port: portPath, virtual: true };
  }

  async connectPort(portPath, options = {}, dataCallback) {
    try {
      if (this.initPromise) await this.initPromise.catch(() => {});
      if (!portPath || typeof portPath !== 'string') throw new Error('Invalid port path specified');

      if (this.pendingConnects.has(portPath)) {
        await this.pendingConnects.get(portPath);
        const existing = this.activePorts.get(portPath);
        if (existing && (existing.virtual || existing.isOpen)) return { success: true, port: portPath, virtual: Boolean(existing.virtual), isNetwork: Boolean(existing.isNetwork) };
      }

      if (this.activePorts.has(portPath)) {
        const existing = this.activePorts.get(portPath);
        if (existing && !existing.virtual && existing.isOpen) return { success: true, message: 'Already connected', port: portPath, isNetwork: Boolean(existing.isNetwork) };
        if (existing && !existing.virtual && existing.opening) {
          await new Promise((resolve, reject) => {
            const to = setTimeout(() => reject(new Error(`Timeout waiting for port ${portPath} to open`)), 4000);
            existing.once('open', () => { clearTimeout(to); resolve(); });
            existing.once('error', (err) => { clearTimeout(to); reject(err); });
          });
          return { success: true, port: portPath };
        }
        this.activePorts.delete(portPath);
      }

      // Transparent Network Socket Connection (Wi-Fi ESP32)
      if (isNetworkPort(portPath)) {
        const { host, port: netPort } = parseNetworkPort(portPath);
        const connectPromise = new Promise((resolve, reject) => {
          const socket = new net.Socket();
          let connected = false;
          const to = setTimeout(() => {
            if (!connected) {
              try { socket.destroy(); } catch {}
              reject(new Error(`Timeout connecting to wireless device at ${host}:${netPort}`));
            }
          }, 4500);

          socket.connect(netPort, host, () => {
            connected = true;
            clearTimeout(to);
            socket.isOpen = true;
            socket.isNetwork = true;
            socket.path = portPath;
            this.activePorts.set(portPath, socket);
            logger.info(`Connected to wireless device ${portPath} (${host}:${netPort})`);
            resolve({ success: true, port: portPath, isNetwork: true });
          });

          socket.on('data', data => {
            if (dataCallback) dataCallback(data.toString('utf8'));
          });

          socket.on('error', err => {
            logger.warn(`Network socket error on ${portPath}:`, err.message);
            if (!connected) {
              clearTimeout(to);
              reject(err);
            }
          });

          socket.on('close', () => {
            socket.isOpen = false;
            this.activePorts.delete(portPath);
          });
        });

        this.pendingConnects.set(portPath, connectPromise);
        try { return await connectPromise; } finally { this.pendingConnects.delete(portPath); }
      }

      if (this.SerialPort) {
        const baudRate = options.baudRate || 115200;
        const connectPromise = new Promise((resolve, reject) => {
          try {
            const port = new this.SerialPort({ path: portPath, baudRate, autoOpen: false });
            port.on('error', (err) => logger.warn(`Serial port ${portPath} error:`, err?.message || err));
            if (dataCallback) port.on('data', data => dataCallback(data.toString('utf8')));
            port.open((openErr) => {
              if (openErr) {
                this.activePorts.delete(portPath);
                return reject(openErr);
              }
              this.activePorts.set(portPath, port);
              resolve({ success: true, port: portPath, baudRate });
            });
          } catch (createErr) { reject(createErr); }
        });

        this.pendingConnects.set(portPath, connectPromise);
        try { return await connectPromise; } finally { this.pendingConnects.delete(portPath); }
      }

      this.activePorts.set(portPath, { virtual: true, baudRate: options.baudRate || 115200 });
      return { success: true, port: portPath, virtual: true };
    } catch (error) {
      logger.error(`Error connecting to port ${portPath}:`, error.message);
      throw error;
    }
  }

  // Lock a port so writePort will not auto-reconnect during flashing
  lockPort(portPath) {
    if (!portPath) return;
    const key = portPath.trim().toUpperCase();
    this.lockedPorts.add(key);
    logger.info(`[SerialService] Port ${portPath} LOCKED for flash — auto-reconnect disabled`);
  }

  // Unlock a port after flashing is done
  unlockPort(portPath) {
    if (!portPath) return;
    const key = portPath.trim().toUpperCase();
    this.lockedPorts.delete(key);
    logger.info(`[SerialService] Port ${portPath} UNLOCKED — auto-reconnect re-enabled`);
  }

  isPortLocked(portPath) {
    if (!portPath) return false;
    return this.lockedPorts.has(portPath.trim().toUpperCase());
  }

  async disconnectPort(portPath) {
    try {
      if (!portPath) return { success: true };
      const normalized = portPath.trim().toUpperCase();

      for (const [key, pending] of this.pendingConnects.entries()) {
        if (key.trim().toUpperCase() === normalized) {
          try { await pending; } catch {}
          this.pendingConnects.delete(key);
        }
      }

      for (const [key, port] of this.activePorts.entries()) {
        if (key.trim().toUpperCase() === normalized) {
          this.activePorts.delete(key);
          if (port.isNetwork) {
            try { port.end(); port.destroy(); } catch {}
          } else if (!port.virtual && typeof port.close === 'function') {
            if (port.isOpen) {
              await new Promise((resolve) => {
                port.close(() => resolve());
              });
            } else if (port.opening) {
              await new Promise((resolve) => {
                port.once('open', () => {
                  try { port.close(() => resolve()); } catch { resolve(); }
                });
                port.once('error', () => resolve());
                setTimeout(resolve, 2000);
              });
            }
          }
        }
      }
      await new Promise(r => setTimeout(r, 100));
      return { success: true, port: portPath };
    } catch (error) {
      logger.error(`Error disconnecting port ${portPath}:`, error.message);
      throw error;
    }
  }

  async writePort(portPath, data) {
    try {
      if (this.initPromise) await this.initPromise.catch(() => {});
      if (!portPath) throw new Error('Port path is required to write data');

      // Refuse writes when port is locked for flashing
      if (this.isPortLocked(portPath)) {
        logger.warn(`[SerialService] Write to ${portPath} skipped — port is locked for flash`);
        return { success: false, port: portPath, skipped: true, reason: 'Port locked for flash' };
      }

      let port = this.activePorts.get(portPath);
      if (!port || port.virtual || (!port.isOpen && !port.opening)) {
        // Do not reconnect if locked
        if (this.isPortLocked(portPath)) {
          return { success: false, port: portPath, skipped: true, reason: 'Port locked for flash' };
        }
        await this.connectPort(portPath, { baudRate: 115200 });
        port = this.activePorts.get(portPath);
      } else if (port.opening) {
        await new Promise((resolve, reject) => {
          const to = setTimeout(() => reject(new Error(`Timeout waiting for port ${portPath} to open`)), 4000);
          port.once('open', () => { clearTimeout(to); resolve(); });
          port.once('error', (err) => { clearTimeout(to); reject(err); });
        });
      }

      if (!port) throw new Error(`Port ${portPath} is not available and could not be connected.`);

      if (!port.virtual && typeof port.write === 'function') {
        if (!this.writeQueues.has(portPath)) this.writeQueues.set(portPath, Promise.resolve());
        const queue = this.writeQueues.get(portPath);
        const writeOperation = queue.then(() => {
          return new Promise((resolve, reject) => {
            if (!port.isOpen) return reject(new Error(`Cannot write: port ${portPath} is closed`));
            let finished = false;
            const safetyTimer = setTimeout(() => {
              if (!finished) {
                finished = true;
                resolve();
              }
            }, 600);

            try {
              port.write(data, (writeErr) => {
                if (finished) return;
                finished = true;
                clearTimeout(safetyTimer);
                if (writeErr) return reject(writeErr);
                resolve();
              });
            } catch (syncErr) {
              if (!finished) {
                finished = true;
                clearTimeout(safetyTimer);
                reject(syncErr);
              }
            }
          });
        });
        this.writeQueues.set(portPath, writeOperation.catch(() => {}));
        await writeOperation;
        return { success: true, port: portPath, bytesWritten: data.length, virtual: false };
      }
      return { success: true, port: portPath, bytesWritten: data.length, virtual: true };
    } catch (error) {
      logger.error(`Error writing to serial port ${portPath}:`, error.message);
      throw error;
    }
  }
}

export const serialService = new SerialService();
