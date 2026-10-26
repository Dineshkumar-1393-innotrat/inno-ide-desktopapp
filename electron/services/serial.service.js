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

// Common Microcontroller & USB-to-UART Chipset Exact Signatures
const EXACT_USB_IDS = {
  // Espressif Systems
  '303A:1001': { name: 'Espressif ESP32-S3 (USB-Serial/JTAG)', chip: 'esp32s3', manufacturer: 'Espressif Systems' },
  '303A:1002': { name: 'Espressif ESP32-S2 (USB CDC)', chip: 'esp32s2', manufacturer: 'Espressif Systems' },
  '303A:1000': { name: 'Espressif USB-JTAG/Serial debug unit', chip: 'esp32', manufacturer: 'Espressif Systems' },
  '303A:0002': { name: 'Espressif ESP32-S2 OTG USB', chip: 'esp32s2', manufacturer: 'Espressif Systems' },
  '303A:4001': { name: 'Espressif ESP32-C3 / C6 (USB-Serial/JTAG)', chip: 'esp32c3', manufacturer: 'Espressif Systems' },

  // WCH (Jiangsu Qinheng)
  '1A86:7523': { name: 'WCH CH340 USB-to-Serial', chip: 'esp32', manufacturer: 'WCH' },
  '1A86:5523': { name: 'WCH CH341 USB-to-Serial', chip: 'esp32', manufacturer: 'WCH' },
  '1A86:55D4': { name: 'WCH CH9102 / CH343 High-Speed USB-to-UART', chip: 'esp32', manufacturer: 'WCH (wch.cn)' },
  '1A86:55D3': { name: 'WCH CH343 USB-to-UART Bridge', chip: 'esp32', manufacturer: 'WCH' },
  '1A86:5512': { name: 'WCH CH341A Programmer', chip: 'esp32', manufacturer: 'WCH' },

  // Silicon Labs
  '10C4:EA60': { name: 'Silicon Labs CP2102/CP2104 USB-to-UART Bridge', chip: 'esp32', manufacturer: 'Silicon Labs' },
  '10C4:EA70': { name: 'Silicon Labs CP2105 Dual USB-to-UART', chip: 'esp32', manufacturer: 'Silicon Labs' },
  '10C4:EA71': { name: 'Silicon Labs CP2108 Quad USB-to-UART', chip: 'esp32', manufacturer: 'Silicon Labs' },
  '10C4:EA80': { name: 'Silicon Labs CP2110 HID USB-to-UART', chip: 'esp32', manufacturer: 'Silicon Labs' },

  // FTDI
  '0403:6001': { name: 'FTDI FT232R USB-to-Serial UART', chip: 'esp32', manufacturer: 'FTDI' },
  '0403:6010': { name: 'FTDI FT2232D/H Dual USB-to-UART/FIFO', chip: 'esp32', manufacturer: 'FTDI' },
  '0403:6011': { name: 'FTDI FT4232H Quad USB-to-UART', chip: 'esp32', manufacturer: 'FTDI' },
  '0403:6014': { name: 'FTDI FT232H Single High-Speed USB-to-UART', chip: 'esp32', manufacturer: 'FTDI' },
  '0403:6015': { name: 'FTDI FT-X Series USB UART', chip: 'esp32', manufacturer: 'FTDI' },

  // Raspberry Pi
  '2E8A:0003': { name: 'Raspberry Pi Pico (RP2040 USB CDC)', chip: 'rp2040', manufacturer: 'Raspberry Pi' },
  '2E8A:0005': { name: 'Raspberry Pi Pico (RP2040 MicroPython)', chip: 'rp2040', manufacturer: 'Raspberry Pi' },
  '2E8A:000A': { name: 'Raspberry Pi Pico (RP2040 Picoprobe)', chip: 'rp2040', manufacturer: 'Raspberry Pi' },

  // Arduino
  '2341:0043': { name: 'Arduino Uno', chip: 'arduino', manufacturer: 'Arduino LLC' },
  '2A03:0043': { name: 'Arduino Uno', chip: 'arduino', manufacturer: 'Arduino LLC' },
  '2341:0042': { name: 'Arduino Mega 2560', chip: 'arduino', manufacturer: 'Arduino LLC' },
  '2A03:0042': { name: 'Arduino Mega 2560', chip: 'arduino', manufacturer: 'Arduino LLC' },
  '2341:0036': { name: 'Arduino Leonardo', chip: 'arduino', manufacturer: 'Arduino LLC' },
  '2341:8036': { name: 'Arduino Leonardo CDC', chip: 'arduino', manufacturer: 'Arduino LLC' },
  '2341:0070': { name: 'Arduino Nano ESP32', chip: 'esp32s3', manufacturer: 'Arduino LLC' },

  // STMicroelectronics
  '0483:3748': { name: 'STMicroelectronics ST-Link V2', chip: 'stm32', manufacturer: 'STMicroelectronics' },
  '0483:374B': { name: 'STMicroelectronics ST-Link V2-1 / V3 VCP', chip: 'stm32', manufacturer: 'STMicroelectronics' },
  '0483:5740': { name: 'STMicroelectronics Virtual COM Port (STM32 CDC)', chip: 'stm32', manufacturer: 'STMicroelectronics' },

  // Prolific
  '067B:2303': { name: 'Prolific PL2303 USB-to-Serial', chip: 'esp32', manufacturer: 'Prolific' }
};

// Vendor-Level Fallback Signatures
const KNOWN_VENDORS = [
  { match: /303A/i, name: 'Espressif ESP32 Board', chip: 'esp32', manufacturer: 'Espressif Systems', isUsb: true },
  { match: /10C4/i, name: 'Silicon Labs CP210x USB-to-UART', chip: 'esp32', manufacturer: 'Silicon Labs', isUsb: true },
  { match: /1A86/i, name: 'WCH CH340 / CH341 USB-to-Serial', chip: 'esp32', manufacturer: 'WCH', isUsb: true },
  { match: /0403/i, name: 'FTDI USB-to-Serial UART', chip: 'esp32', manufacturer: 'FTDI', isUsb: true },
  { match: /067B/i, name: 'Prolific PL2303 USB-to-Serial', chip: 'esp32', manufacturer: 'Prolific', isUsb: true },
  { match: /2341|2A03/i, name: 'Arduino Microcontroller', chip: 'arduino', manufacturer: 'Arduino LLC', isUsb: true },
  { match: /2E8A/i, name: 'Raspberry Pi RP2040 Device', chip: 'rp2040', manufacturer: 'Raspberry Pi', isUsb: true },
  { match: /0483/i, name: 'STMicroelectronics ST-Link / STM32', chip: 'stm32', manufacturer: 'STMicroelectronics', isUsb: true }
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

  identifyDevice(arg1 = '', arg2 = '', arg3 = '', arg4 = '', arg5 = '') {
    let pnpId = '';
    let friendlyName = '';
    let manufacturer = '';
    let vendorId = '';
    let productId = '';

    if (typeof arg1 === 'object' && arg1 !== null) {
      pnpId = arg1.pnpId || '';
      friendlyName = arg1.friendlyName || '';
      manufacturer = arg1.manufacturer || '';
      vendorId = arg1.vendorId || '';
      productId = arg1.productId || '';
    } else {
      pnpId = arg1 || '';
      friendlyName = arg2 || '';
      manufacturer = arg3 || '';
      vendorId = arg4 || '';
      productId = arg5 || '';
    }

    let vid = (vendorId || '').toUpperCase().trim();
    let pid = (productId || '').toUpperCase().trim();

    // If VID/PID not provided directly, extract from pnpId (e.g. USB\VID_303A&PID_1001\...)
    if (!vid && pnpId) {
      const vMatch = pnpId.match(/VID[_\:]([0-9A-Fa-f]{4})/i);
      if (vMatch) vid = vMatch[1].toUpperCase();
    }
    if (!pid && pnpId) {
      const pMatch = pnpId.match(/PID[_\:]([0-9A-Fa-f]{4})/i);
      if (pMatch) pid = pMatch[1].toUpperCase();
    }

    // Tier A: Exact VID:PID match
    if (vid && pid) {
      const key = `${vid}:${pid}`;
      if (EXACT_USB_IDS[key]) {
        const match = EXACT_USB_IDS[key];
        return {
          chipName: match.name,
          chip: match.chip,
          manufacturer: match.manufacturer || manufacturer,
          vendorId: vid,
          productId: pid,
          isUsb: true,
          isBluetooth: false,
          recognized: true
        };
      }
    }

    const raw = `${vid} ${pid} ${pnpId} ${friendlyName} ${manufacturer}`.toUpperCase();

    // Tier B: Vendor-level VID match
    if (vid) {
      for (const v of KNOWN_VENDORS) {
        if (v.match.test(vid)) {
          return {
            chipName: v.name,
            chip: v.chip,
            manufacturer: v.manufacturer || manufacturer,
            vendorId: vid,
            productId: pid || undefined,
            isUsb: true,
            isBluetooth: false,
            recognized: true
          };
        }
      }
    }

    // Tier C: String heuristic matching (e.g., driver friendly names)
    if (/ESP32-S3|ESP32S3/i.test(raw)) {
      return { chipName: 'Espressif ESP32-S3', chip: 'esp32s3', manufacturer: manufacturer || 'Espressif Systems', vendorId: vid, productId: pid, isUsb: true, isBluetooth: false, recognized: true };
    }
    if (/ESP32-S2|ESP32S2/i.test(raw)) {
      return { chipName: 'Espressif ESP32-S2', chip: 'esp32s2', manufacturer: manufacturer || 'Espressif Systems', vendorId: vid, productId: pid, isUsb: true, isBluetooth: false, recognized: true };
    }
    if (/ESP32-C3|ESP32C3/i.test(raw)) {
      return { chipName: 'Espressif ESP32-C3', chip: 'esp32c3', manufacturer: manufacturer || 'Espressif Systems', vendorId: vid, productId: pid, isUsb: true, isBluetooth: false, recognized: true };
    }
    if (/ESP32-C6|ESP32C6/i.test(raw)) {
      return { chipName: 'Espressif ESP32-C6', chip: 'esp32c6', manufacturer: manufacturer || 'Espressif Systems', vendorId: vid, productId: pid, isUsb: true, isBluetooth: false, recognized: true };
    }
    if (/ESP32/i.test(raw)) {
      return { chipName: 'Espressif ESP32', chip: 'esp32', manufacturer: manufacturer || 'Espressif Systems', vendorId: vid, productId: pid, isUsb: true, isBluetooth: false, recognized: true };
    }
    if (/CH9102/i.test(raw)) {
      return { chipName: 'WCH CH9102 High-Speed USB-to-UART', chip: 'esp32', manufacturer: manufacturer || 'WCH (wch.cn)', vendorId: vid, productId: pid, isUsb: true, isBluetooth: false, recognized: true };
    }
    if (/CH343/i.test(raw)) {
      return { chipName: 'WCH CH343 USB-to-UART Bridge', chip: 'esp32', manufacturer: manufacturer || 'WCH', vendorId: vid, productId: pid, isUsb: true, isBluetooth: false, recognized: true };
    }
    if (/CH340|CH341/i.test(raw)) {
      return { chipName: 'WCH CH340 USB-to-Serial', chip: 'esp32', manufacturer: manufacturer || 'WCH', vendorId: vid, productId: pid, isUsb: true, isBluetooth: false, recognized: true };
    }
    if (/CP210/i.test(raw)) {
      return { chipName: 'Silicon Labs CP210x USB-to-UART', chip: 'esp32', manufacturer: manufacturer || 'Silicon Labs', vendorId: vid, productId: pid, isUsb: true, isBluetooth: false, recognized: true };
    }
    if (/FT232|FT2232|FT4232|FTDI/i.test(raw)) {
      return { chipName: 'FTDI USB-to-Serial UART', chip: 'esp32', manufacturer: manufacturer || 'FTDI', vendorId: vid, productId: pid, isUsb: true, isBluetooth: false, recognized: true };
    }
    if (/ARDUINO/i.test(raw)) {
      return { chipName: 'Arduino Microcontroller', chip: 'arduino', manufacturer: manufacturer || 'Arduino LLC', vendorId: vid, productId: pid, isUsb: true, isBluetooth: false, recognized: true };
    }
    if (/RP2040|PICO/i.test(raw)) {
      return { chipName: 'Raspberry Pi RP2040', chip: 'rp2040', manufacturer: manufacturer || 'Raspberry Pi', vendorId: vid, productId: pid, isUsb: true, isBluetooth: false, recognized: true };
    }
    if (/STM32|ST-LINK|STLINK/i.test(raw)) {
      return { chipName: 'STMicroelectronics STM32', chip: 'stm32', manufacturer: manufacturer || 'STMicroelectronics', vendorId: vid, productId: pid, isUsb: true, isBluetooth: false, recognized: true };
    }

    // Tier D: Port category fallback (Bluetooth vs USB vs Motherboard)
    const isBluetooth = /BTH|BTHENUM|BLUETOOTH/i.test(raw);
    const isUsb = (/USB|USBSER|FTDIBUS|SILABSER|CH34/i.test(raw) || Boolean(vid)) && !isBluetooth;

    return {
      chipName: isBluetooth ? 'Bluetooth Serial Device' : (isUsb ? 'USB Serial Device' : 'Standard Serial Port'),
      chip: isUsb ? 'esp32' : undefined,
      manufacturer: manufacturer || (isBluetooth ? 'Bluetooth' : (isUsb ? 'USB Bridge' : 'Standard Serial')),
      vendorId: vid || undefined,
      productId: pid || undefined,
      isUsb,
      isBluetooth,
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
      const info = this.identifyDevice({
        pnpId: p.pnpId,
        friendlyName: p.friendlyName,
        manufacturer: p.manufacturer,
        vendorId: p.vendorId,
        productId: p.productId
      });

      if (!discovered.has(key)) {
        discovered.set(key, {
          path: p.path,
          friendlyName: `${info.chipName} (${p.path})`,
          chipName: info.chipName,
          chip: info.chip,
          manufacturer: info.manufacturer || p.manufacturer || (info.isUsb ? 'USB Serial Device' : 'Standard Serial Port'),
          vendorId: info.vendorId || p.vendorId,
          productId: info.productId || p.productId,
          pnpId: p.pnpId,
          isUsb: info.isUsb,
          isBluetooth: info.isBluetooth,
          recognized: info.recognized
        });
      } else {
        const existing = discovered.get(key);
        // Enrich if new info is recognized or more specific
        if (!existing.recognized && info.recognized) {
          existing.friendlyName = `${info.chipName} (${p.path})`;
          existing.chipName = info.chipName;
          existing.chip = info.chip;
          existing.manufacturer = info.manufacturer || existing.manufacturer;
          existing.recognized = true;
        }
        if (info.vendorId && !existing.vendorId) existing.vendorId = info.vendorId;
        if (info.productId && !existing.productId) existing.productId = info.productId;
        if (p.pnpId && !existing.pnpId) existing.pnpId = p.pnpId;
        if (info.isUsb !== undefined && existing.isUsb === undefined) existing.isUsb = info.isUsb;
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
              manufacturer: np.manufacturer,
              isUsb: Boolean(np.vendorId || np.productId || (np.pnpId && !np.pnpId.includes('BTH')))
            });
          }
        }
      } catch (err) {
        logger.warn('Native SerialPort.list() error:', err.message);
      }
    }

    // Tier 2: Windows PnP & Registry scan (run on win32 to enrich and catch all COM ports)
    if (process.platform === 'win32') {
      try {
        const psScript = `
$ProgressPreference = 'SilentlyContinue';
$res = @()
try {
  $pnp = Get-CimInstance -Query "SELECT Name, Caption, PNPDeviceID, Manufacturer FROM Win32_PnPEntity WHERE PNPClass = 'Ports' OR Caption LIKE '%(COM%)'" -ErrorAction SilentlyContinue
  foreach ($dev in $pnp) {
    if ($dev.Caption -match '\\((COM\\d+)\\)') {
      $res += [PSCustomObject]@{
        Path = $Matches[1]
        Name = $dev.Name
        PNPDeviceID = $dev.PNPDeviceID
        Manufacturer = $dev.Manufacturer
      }
    }
  }
} catch {}

try {
  if (Test-Path 'HKLM:\\HARDWARE\\DEVICEMAP\\SERIALCOMM') {
    $reg = Get-ItemProperty -Path 'HKLM:\\HARDWARE\\DEVICEMAP\\SERIALCOMM' -ErrorAction SilentlyContinue
    $reg.PSObject.Properties | Where-Object { $_.Name -notmatch '^PS' } | ForEach-Object {
      $comPort = [string]$_.Value
      if (-not ($res | Where-Object { $_.Path -eq $comPort })) {
        $res += [PSCustomObject]@{
          Path = $comPort
          Name = ('Serial Port (' + $comPort + ')')
          PNPDeviceID = [string]$_.Name
          Manufacturer = ''
        }
      }
    }
  }
} catch {}

$res | ConvertTo-Json -Compress
`;
        const enc = Buffer.from(psScript, 'utf16le').toString('base64');
        const { stdout } = await execPromise(`powershell -NoProfile -NonInteractive -EncodedCommand ${enc}`, { timeout: 10000 });
        if (stdout && stdout.trim()) {
          const raw = stdout.trim();
          const jsonStart = raw.indexOf('[');
          const jsonObjStart = raw.indexOf('{');
          const start = jsonStart !== -1 && (jsonObjStart === -1 || jsonStart < jsonObjStart) ? jsonStart : jsonObjStart;
          if (start !== -1) {
            const list = JSON.parse(raw.slice(start));
            const arr = Array.isArray(list) ? list : [list];
            for (const item of arr) {
              if (item && item.Path) {
                addPort({
                  path: item.Path,
                  friendlyName: item.Name,
                  pnpId: item.PNPDeviceID,
                  manufacturer: item.Manufacturer
                });
              }
            }
          }
        }
      } catch (psErr) {
        logger.warn('Windows PowerShell serial port scan warning:', psErr.killed ? 'PowerShell scan timed out' : (psErr.name || 'Scan failed'));
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

    // Sort ports: USB devices first (with ESP32 devices prioritized), then Wi-Fi, then Bluetooth/Standard, sorted by COM number
    const sorted = Array.from(discovered.values()).sort((a, b) => {
      // Prioritize recognized ESP32 devices
      const aIsEsp = a.isUsb && (a.chip?.includes('esp32') || a.chipName?.includes('ESP32'));
      const bIsEsp = b.isUsb && (b.chip?.includes('esp32') || b.chipName?.includes('ESP32'));
      if (aIsEsp && !bIsEsp) return -1;
      if (!aIsEsp && bIsEsp) return 1;

      // Prioritize USB over non-USB
      if (a.isUsb && !b.isUsb) return -1;
      if (!a.isUsb && b.isUsb) return 1;

      // Natural COM number sort (COM8 before COM9, COM9 before COM10)
      const numA = parseInt((a.path || '').replace(/\D/g, ''), 10) || 0;
      const numB = parseInt((b.path || '').replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });

    return sorted;
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
            }, 1500);

            try {
              port.write(data, (writeErr) => {
                if (finished) return;
                if (writeErr) {
                  finished = true;
                  clearTimeout(safetyTimer);
                  return reject(writeErr);
                }
                // Drain ensures data is fully flushed to the serial device,
                // not just buffered in the OS write buffer.
                if (typeof port.drain === 'function') {
                  port.drain((drainErr) => {
                    if (finished) return;
                    finished = true;
                    clearTimeout(safetyTimer);
                    if (drainErr) return reject(drainErr);
                    resolve();
                  });
                } else {
                  finished = true;
                  clearTimeout(safetyTimer);
                  resolve();
                }
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
