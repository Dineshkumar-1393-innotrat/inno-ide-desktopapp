# InnoIDE Desktop Application

[![Electron](https://img.shields.io/badge/Electron-Desktop-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Chakra UI](https://img.shields.io/badge/Chakra_UI-Design_System-319795?logo=chakraui&logoColor=white)](https://chakra-ui.com/)
[![ESP-IDF](https://img.shields.io/badge/ESP--IDF-v5.x-E7352C?logo=espressif&logoColor=white)](https://docs.espressif.com/projects/esp-idf/)
[![License](https://img.shields.io/badge/License-Proprietary-blue.svg)](#)

**InnoIDE** is an integrated development desktop environment tailored for IoT, embedded systems, and microcontroller firmware programming. It bridges visual block programming, circuit simulation, code editing, and direct-to-hardware flashing for Espressif microcontrollers (ESP32, ESP32-S2, ESP32-S3, ESP32-C3, ESP32-C6, and ESP8266).

---

## 🌟 Key Features

### 1. Dual Development Paradigm
- **Visual Block Programming & Flowcharts**: Drag-and-drop node-based logic generation, sequence diagrams, and block-based hardware control.
- **Embedded C/C++ Code Editor**: Monaco-powered code editor with syntax highlighting, IntelliSense, auto-completion, and multi-tab workspace management.

### 2. Zero-Configuration ESP32 Flashing Pipeline
- **Auto-Detection**: Dynamically detects ESP-IDF installations (`C:\Espressif\frameworks\esp-idf-v5.x`) and captures the build environment via `export.bat` without manual PATH configuration.
- **Automatic Port Discovery & Auto-Refresh**: Background COM port scanner detects connected microcontrollers every 3 seconds, filters out virtual/Bluetooth modems, and handles plug/unplug events dynamically.
- **High-Speed Flashing (460,800 Baud)**: Uses direct `esptool.py` memory writes driven by `flasher_args.json` offsets, bypassing CMake toolchain overhead.
- **Dual-Stage Recovery Engine**: Automatic fallback to 115,200 baud with manual bootloader mode instructions if USB-CDC auto-reset times out.
- **Port Conflict Guard**: Automatically disconnects active serial monitor sessions before flashing to prevent `Access Denied (COM Busy)` locks on Windows.

### 3. IoT Mobile Companion Studio & Real-Time Sync
- **Zero-Install Web App (Instant Camera Scan)**: Point any smartphone camera at the generated QR code to immediately launch full interactive hardware controls in the mobile browser.
- **Dual Network Connectivity Modes**:
  - 📶 **Local Wi-Fi Mode**: High-speed, low-latency control via local IPv4 LAN broadcast (`http://<lan-ip>:5055`).
  - 🌐 **Cloud Remote Tunnel (Mobile 4G/5G & WAN)**: Instant public HTTPS relay engine (`localhost.run` SSH tunnel with `localtunnel` fallback). Allows phones on cellular data (5G, 4G, LTE) or remote internet connections to control physical microcontrollers without requiring devices to share the same Wi-Fi.
- **Multi-Device Real-Time Synchronization**:
  - Centralized server state store (`companionState`) tracking component states, versions, and active serial ports.
  - Sub-50ms real-time state push via Server-Sent Events (SSE `GET /api/events`).
  - Resilient polling fallback (`GET /api/state`) every 1.5s for seamless synchronization across restrictive cellular NATs, mobile webviews, and proxies.
  - Bi-directional lockstep: Phone A ➔ Phone B, Phone ➔ Desktop IDE, and Desktop IDE ➔ Mobile Devices.
- **Resilient 4-Tier Communication Protocol**:
  - Full CORS and Chrome Private Network Access (`Access-Control-Allow-Private-Network: true`).
  - Tier 1: JSON POST ➔ Tier 2: Simple Text POST (bypasses preflights) ➔ Tier 3: GET Query String ➔ Tier 4: 1x1 Transparent GIF Image Beacon (bypasses all sandboxes and webview firewalls).
- **Export & React Native Options**:
  - Standalone single-file HTML Web App export.
  - React Native Expo project bundle (`.zip`) with stable SDK 54 (`App.js`, `package.json`, `app.json`).
  - One-click Expo Snack Web session sync.

### 4. Device Discovery & Hardware Diagnostics
- **Clean Hardware Card UI**: Focused device discovery cards displaying detected port, device name, IP, and Wi-Fi link status (removed simulated battery icons for accurate serial representation).
- **Live Hardware Light Test**: Instant diagnostic toggle for reactive firmware actuation on GPIO 2/48 with auto-reconnect fallback.
- **Autonomous Rule Engine**: Trigger-action rules (`on_toggle`, `sensor_update`, `on_press`) with condition evaluation (`>`, `<`, `==`, `between`) and payload interpolation.

### 5. Simulation & Diagnostics
- Integrated circuit simulation, rule engine validation, mathematical scratchpad, and terminal log stream.

---

## 🏗️ System Architecture

```
inno-ide-desktopapp/
├── electron/                   # Electron desktop layer
│   ├── ipc/                    # IPC handlers (flash, serial, filesystem, process, companion server & cloud tunnel)
│   ├── services/               # Background services (flash.service.js, serial.service.js)
│   ├── dev-runner.js           # Concurrent Vite + Electron dev runner
│   ├── main.js                 # Electron main window lifecycle
│   └── preload.cjs             # Secure Context Isolation API bridge
├── python/                     # Embedded hardware workers
│   └── flash_agent.py          # ESP-IDF compilation & esptool write pipeline
├── src/                        # React Frontend
│   ├── components/             # UI components (ESP32Flasher, RuleBuilderModal, CodeEditor, BlockProgramming)
│   ├── features/               # Workspace features, terminal panel, runtime preview
│   ├── services/               # API clients, GitHub integration, calculator
│   ├── store/                  # Redux Toolkit state slices
│   └── platform/               # IPC abstractions and platform adapters
├── docs/                       # Architectural and feature documentation
├── ESP32_Firmware_Flashing_Pipeline_Report.pdf  # Technical flashing report (PDF)
├── ESP32_Flashing_Pipeline_Report.html          # Technical flashing report (HTML)
└── package.json
```

---

## ⚡ Flashing Subsystem Overview

The flashing pipeline connects the React UI to physical hardware through an isolated multi-process workflow:

```mermaid
flowchart LR
    A[React UI: ESP32Flasher] -->|IPC: flash:run-pipeline| B[Electron: flash.service.js]
    B -->|Capture export.bat env| C[Python: flash_agent.py]
    C -->|idf.py build| D[CMake & Ninja Compilers]
    D -->|flasher_args.json| E[esptool.py Engine]
    E -->|460800 Baud Flash Write| F[ESP32 Microcontroller]
    C -.->|Real-time JSON Logs| A
```

### Memory Map & Binary Layout

| Component | Offset | Target File | Purpose |
| :--- | :--- | :--- | :--- |
| **Bootloader** | `0x0` / `0x1000` | `build/bootloader/bootloader.bin` | Hardware initialization & partition loading |
| **Partition Table** | `0x8000` | `build/partition_table/partition-table.bin` | Partition layout (NVS, OTA, Factory app) |
| **Application Firmware**| `0x10000` | `build/ESP32_Firmware_Project.bin` | Compiled user firmware & FreeRTOS tasks |

Detailed technical documentation is available in [ESP32_Firmware_Flashing_Pipeline_Report.pdf](./ESP32_Firmware_Flashing_Pipeline_Report.pdf).

---

## 🌐 IoT Companion & Remote Subsystem Architecture

```mermaid
flowchart TD
    subgraph Mobile Devices
        P1[Phone A: Local Wi-Fi]
        P2[Phone B: 5G Cellular]
    end

    subgraph Cloud Infrastructure
        T[Cloud Relay Tunnel: localhost.run / localtunnel]
    end

    subgraph InnoIDE Desktop
        CS[Companion Server: Port 5055]
        SS[Serial Service: COM9]
        DUI[Desktop IDE UI: ESP32Flasher]
    end

    ESP[Physical ESP32 Hardware]

    P1 -->|Local HTTP / SSE| CS
    P2 -->|Public HTTPS / SSE| T
    T -->|Forward 80:127.0.0.1:5055| CS
    CS -->|IPC Serial Write| SS
    SS -->|UART TX/RX| ESP
    CS <-->|Bi-directional Sync / onCompanionAction| DUI
    CS -->|SSE Broadcast & State Push| P1
    CS -->|SSE Broadcast & State Push| P2
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Python**: v3.10+ (for flashing engine)
- **ESP-IDF**: v5.0+ (Optional for local flashing; installer supported)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Dineshkumar-1393-innotrat/inno-ide-desktopapp.git
   cd inno-ide-desktopapp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start Development Server (Vite + Electron):**
   ```bash
   npm run electron:dev
   ```

   *Or run Vite web server standalone:*
   ```bash
   npm run dev
   ```

---

## 📦 Build & Packaging

Build production desktop binaries for Windows:

```bash
# Build Vite assets and package Electron executable
npm run dist:win
```

Output installers and portable executables will be generated in `dist-desktop/` and `release/`.

---

## 📋 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite React frontend in development mode |
| `npm run electron:dev` | Launches both Vite and the Electron desktop application concurrently |
| `npm run build` | Compiles the React application into production `dist/` bundle |
| `npm run electron:build` | Compiles frontend assets for Electron distribution |
| `npm run dist:win` | Builds Windows desktop installer (`.exe`) via `electron-builder` |
| `npm run lint` | Runs ESLint syntax verification across the codebase |

---

## 📝 Version History & Contributions

- **InnoIDE V2.0 (Branch: `ide-desktop-app-V0-11-09-2026`)**:
  - **Cloud Remote Tunneling**: Integrated SSH `localhost.run` and `localtunnel` engine for instant remote hardware control over mobile 5G/4G networks without shared Wi-Fi.
  - **Real-Time Multi-Device State Sync**: Centralized state store, Server-Sent Events (SSE `/api/events`), and fallback polling (`/api/state`) for sub-50ms synchronized control across multiple phones and desktop.
  - **4-Tier Action Dispatch & PNA Headers**: Chrome Private Network Access support with transparent GIF image beacon fallbacks.
  - **Clean Hardware Card**: Removed artificial battery percentage display, keeping device cards focused on clean hardware connectivity (COM Port, IP, Wi-Fi status).
  - **Publish Modal Switcher**: Interactive selector between Local Wi-Fi and Cloud Remote with QR code payload swapping and live status badges.
- **InnoIDE V1.9**: Complete ESP32 flasher integration, dual-stage recovery engine, auto-refresh port scanner, and companion app designer.
- **InnoIDE V1.4**: Project explorer, auto-save integration, and dynamic rule engine.
- **InnoIDE V1.0**: Initial block programming and terminal integration.

---

## 🔒 License & Copyright

Copyright © 2026 **Innotrat Labs**. All rights reserved.
Proprietary software for internal and authorized commercial deployment.

