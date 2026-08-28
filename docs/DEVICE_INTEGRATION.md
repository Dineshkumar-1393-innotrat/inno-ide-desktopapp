# Device & Serial Hardware Integration

## Overview
InnoView IDE Desktop provides native serial port communication and micro-controller support for boards such as ESP32, ESP8266, and Arduino.

---

## Hardware Communication Pipeline

```
React Component (Flash.jsx / Console)
       │
       ▼
window.electronAPI.serial
       │
       ▼
Preload Bridge (preload.cjs)
       │
       ▼
Electron Main Process (serial.ipc.js)
       │
       ▼
Serial Service (serial.service.js)
       │
       ▼
USB COM Port (ESP32 / Arduino)
```

---

## Features Supported
1. **Serial Port Listing:** Automatically enumerates system COM and USB TTY ports.
2. **Streaming Logs:** Sends real-time device logs via IPC event `serial:data`.
3. **Command Execution & Flashing:** Native `child_process.spawn` launches board tools (`esptool`, `arduino-cli`, `platformio`) without invoking unvalidated shell strings.
