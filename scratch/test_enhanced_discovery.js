import { execSync } from 'child_process';
import { SerialPort } from 'serialport';

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

export function identifyDevice({ pnpId = '', friendlyName = '', manufacturer = '', vendorId = '', productId = '' } = {}) {
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
  if (/ESP32/i.test(raw)) {
    return { chipName: 'Espressif ESP32', chip: 'esp32', manufacturer: manufacturer || 'Espressif Systems', vendorId: vid, productId: pid, isUsb: true, isBluetooth: false, recognized: true };
  }
  if (/CH9102/i.test(raw)) {
    return { chipName: 'WCH CH9102 High-Speed USB-to-UART', chip: 'esp32', manufacturer: manufacturer || 'WCH', vendorId: vid, productId: pid, isUsb: true, isBluetooth: false, recognized: true };
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

async function listAllPorts() {
  const discovered = new Map();

  const addPort = (p) => {
    if (!p || !p.path) return;
    const key = p.path.toUpperCase();
    const info = identifyDevice({
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
    }
  };

  // Tier 1: Node-serialport native listing
  try {
    const nativePorts = await SerialPort.list();
    if (Array.isArray(nativePorts)) {
      for (const np of nativePorts) {
        addPort({
          path: np.path,
          vendorId: np.vendorId,
          productId: np.productId,
          pnpId: np.pnpId,
          friendlyName: np.friendlyName,
          manufacturer: np.manufacturer,
          isUsb: Boolean(np.vendorId || np.productId || (np.pnpId && !np.pnpId.includes('BTH')))
        });
      }
    }
  } catch (err) {
    console.warn("SerialPort.list() error:", err.message);
  }

  // Tier 2: Windows PnP & Registry scan (enrich and find any additional ports)
  if (process.platform === 'win32') {
    try {
      const psScript = `
$ProgressPreference = 'SilentlyContinue';
$res = @()
try {
  $pnp = Get-CimInstance Win32_PnPEntity | Where-Object { $_.PNPClass -eq 'Ports' -or $_.Caption -match '\\(COM\\d+\\)' }
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
    $reg = Get-ItemProperty -Path 'HKLM:\\HARDWARE\\DEVICEMAP\\SERIALCOMM'
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
      const out = execSync(`powershell -NoProfile -NonInteractive -EncodedCommand ${enc}`, { encoding: 'utf8', timeout: 5000 });
      if (out && out.trim()) {
        const raw = out.trim();
        // Skip possible non-json header
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
    } catch (e) {
      console.warn("Tier 2 Windows scan error:", e.message);
    }
  }

  // Sort discovered ports: USB devices first, then alphabetically by COM number
  const list = Array.from(discovered.values()).sort((a, b) => {
    if (a.isUsb && !b.isUsb) return -1;
    if (!a.isUsb && b.isUsb) return 1;
    const numA = parseInt((a.path || '').replace(/\D/g, ''), 10) || 0;
    const numB = parseInt((b.path || '').replace(/\D/g, ''), 10) || 0;
    return numA - numB;
  });

  return list;
}

const all = await listAllPorts();
console.log("FINAL COMPLETE PORT LIST:\n", JSON.stringify(all, null, 2));
