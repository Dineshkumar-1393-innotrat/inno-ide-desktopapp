import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook to discover, monitor, and manage serial COM ports and Wi-Fi devices.
 */
export default function useDeviceScanner({ connectionType, wizardStep, toast }) {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const selectedDevice = devices.find((d) => d.id === selectedDeviceId) || devices[0] || null;
  const [isScanning, setIsScanning] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [manualWifiIp, setManualWifiIp] = useState("192.168.1.105:8888");

  const handleAddManualWifiDevice = useCallback(() => {
    if (!manualWifiIp || !manualWifiIp.trim()) return;
    const cleanIp = manualWifiIp.trim().replace(/^TCP:/i, "");
    const fullPort = `TCP:${cleanIp.includes(":") ? cleanIp : `${cleanIp}:8888`}`;
    const newDev = {
      id: `esp32-manual-${cleanIp}`,
      name: `ESP32-S3 Wireless Node (${cleanIp.split(":")[0]})`,
      ip: cleanIp.split(":")[0],
      firmware: "Firmware v1.2.1 (Wi-Fi)",
      port: fullPort,
      chip: "esp32s3",
      manufacturer: "Wi-Fi Socket Node",
      signal: 5,
      battery: 100,
      isUsb: false,
      isNetwork: true,
      selected: true
    };
    setDevices((prev) => [newDev, ...prev.filter((d) => d.port !== fullPort)]);
    setSelectedDeviceId(newDev.id);
    if (toast) {
      toast({
        title: "🌐 Wi-Fi Target Linked",
        description: `Targeting wireless node at ${fullPort}`,
        status: "success",
        duration: 3500
      });
    }
  }, [manualWifiIp, toast]);

  // Scan Real Ports & Discovered Wi-Fi Devices via Electron IPC
  const handleRefreshDevices = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      setIsScanning(true);
    }
    try {
      let ports = [];
      let wifiNodes = [];

      if (window.electronAPI?.device?.discoverWifi) {
        try {
          wifiNodes = await window.electronAPI.device.discoverWifi();
        } catch { }
      }

      if (window.electronAPI?.flash?.detectPorts) {
        ports = await window.electronAPI.flash.detectPorts();
      } else if (window.electronAPI?.serial?.listPorts) {
        ports = await window.electronAPI.serial.listPorts();
      }

      const allDevices = [];

      if (ports && ports.length > 0) {
        ports.forEach((p, idx) => {
          if (p.isNetwork) {
            allDevices.push({
              id: `esp32-wifi-${p.path || idx}`,
              name: p.friendlyName || `ESP32-S3 Wireless Node`,
              chipName: p.chipName || p.friendlyName || `ESP32-S3 Wireless Node`,
              friendlyName: p.friendlyName || `ESP32-S3 Wireless Node`,
              ip: p.ip || (p.path ? p.path.replace(/^TCP:/i, "") : "192.168.1.105"),
              firmware: "Firmware v1.2.1 (Wi-Fi)",
              port: p.path,
              chip: "esp32s3",
              manufacturer: "Wi-Fi Socket (:8888)",
              signal: 5,
              battery: 95,
              isUsb: false,
              isBluetooth: false,
              isNetwork: true,
              recognized: true,
              selected: false
            });
          } else {
            // Physical USB devices, standard COM ports, and Bluetooth serial ports
            allDevices.push({
              id: `esp32-detected-${p.path || idx}`,
              name: p.friendlyName || `${p.chipName || "Serial Device"} (${p.path})`,
              chipName: p.chipName || p.friendlyName || `Device (${p.path})`,
              friendlyName: p.friendlyName || `${p.chipName || "Device"} (${p.path})`,
              ip: `COM Port (${p.path})`,
              firmware: p.recognized ? `${(p.chip || "ESP32").toUpperCase()} Firmware` : "Serial Device",
              port: p.path,
              chip: p.chip || "esp32s3",
              manufacturer: p.manufacturer || (p.isUsb ? "USB Serial Device" : "Serial Port"),
              vendorId: p.vendorId,
              productId: p.productId,
              signal: p.isUsb ? 5 : 2,
              battery: 85 + (idx * 5) % 15,
              isUsb: p.isUsb !== false,
              isBluetooth: Boolean(p.isBluetooth),
              isNetwork: false,
              recognized: Boolean(p.recognized),
              selected: idx === 0
            });
          }
        });
      }

      if (wifiNodes && wifiNodes.length > 0) {
        wifiNodes.forEach((wn) => {
          const exists = allDevices.some((d) => d.port === wn.port || d.ip === wn.ip);
          if (!exists) {
            allDevices.unshift({
              id: `esp32-wifi-${wn.ip}`,
              name: wn.name || `ESP32-S3 Wireless Node (${wn.ip})`,
              chipName: wn.name || `ESP32-S3 Wireless Node`,
              friendlyName: wn.name || `ESP32-S3 Wireless Node (${wn.ip})`,
              ip: wn.ip,
              firmware: "Firmware v1.2.1 (Wi-Fi)",
              port: wn.port || `TCP:${wn.ip}:${wn.tcpPort || 8888}`,
              chip: "esp32s3",
              manufacturer: "Wi-Fi Broadcast (:8888)",
              signal: 5,
              battery: 100,
              isUsb: false,
              isBluetooth: false,
              isNetwork: true,
              recognized: true,
              selected: false
            });
          }
        });
      }

      // Filter based on active connectionType
      let filtered = allDevices;
      if (connectionType === "wifi") {
        const netDevs = allDevices.filter((d) => d.isNetwork);
        filtered = netDevs.length > 0 ? netDevs : allDevices;
      } else if (connectionType === "usb") {
        const usbDevs = allDevices.filter((d) => !d.isNetwork);
        filtered = usbDevs.length > 0 ? usbDevs : allDevices;
      }

      if (filtered && filtered.length > 0) {
        setDevices(filtered);
        setSelectedDeviceId((prevId) => {
          const exists = filtered.some((d) => d.id === prevId);
          if (exists) return prevId;
          const preferred =
            filtered.find((d) => d.isUsb && d.recognized && d.chip?.includes("esp32")) ||
            filtered.find((d) => d.isUsb && d.recognized) ||
            filtered.find((d) => d.isUsb) ||
            filtered[0];
          return preferred?.id || filtered[0]?.id;
        });
      } else {
        setDevices([]);
        setSelectedDeviceId(null);
      }
    } catch (err) {
      console.warn("Device refresh warning:", err);
      setDevices([]);
      setSelectedDeviceId(null);
    } finally {
      if (!isSilent) {
        setIsScanning(false);
      }
    }
  }, [connectionType]);

  // Run initial scan on mount
  useEffect(() => {
    handleRefreshDevices(false);
  }, [handleRefreshDevices]);

  // Auto-refresh devices polling when on 'devices' step
  useEffect(() => {
    if (wizardStep !== "devices") return;

    // Run initial scan on entering devices step
    handleRefreshDevices(false);

    if (!autoRefresh) return;

    const timer = setInterval(() => {
      handleRefreshDevices(true);
    }, 3000);

    return () => clearInterval(timer);
  }, [wizardStep, autoRefresh, handleRefreshDevices]);

  return {
    devices,
    setDevices,
    selectedDeviceId,
    setSelectedDeviceId,
    selectedDevice,
    isScanning,
    autoRefresh,
    setAutoRefresh,
    manualWifiIp,
    setManualWifiIp,
    handleAddManualWifiDevice,
    handleRefreshDevices
  };
}
