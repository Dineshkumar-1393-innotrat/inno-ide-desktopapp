# Electron Desktop Architecture - InnoView IDE

## Overview
InnoView IDE Desktop is structured into a multi-process architecture consisting of the Electron Main Process (desktop shell and native hardware/OS capabilities) and the React Renderer Process (UI, editors, visual block/flowchart diagrams, and meeting integration).

```
                                  ELECTRON DESKTOP
                                         │
                    ┌────────────────────┴────────────────────┐
                    │                                         │
              Electron Main                            React Renderer
                    │                                         │
            Native Desktop Services                    Existing Frontend
         (Filesystem, Serial, Process)             (Monaco, Flowchart, Dyte)
                    │                                         │
                    └────────────────── IPC ──────────────────┘
                                         │
                                         ▼
                             Existing Express REST API
                                         │
                                         ▼
                                      MongoDB
```

---

## 1. Process Separation & Security Boundary
- **Main Process (`electron/main.js`):** Runs in Node.js environment. Manages BrowserWindow lifecycle, native system menus, native dialogs, filesystem, device serial access, and child process execution.
- **Preload Bridge (`electron/preload.cjs`):** Uses `contextBridge` with `contextIsolation: true` and `nodeIntegration: false`. Exposes controlled `window.electronAPI` channels.
- **Renderer Process (`src/`):** Existing React application. Operates safely without direct access to Node native modules. Uses platform adapters in `src/platform/` to communicate with Electron when available.

---

## 2. Platform Abstraction Layer
The platform layer (`src/platform/index.js`) automatically detects runtime environment:
```javascript
export const isElectron = Boolean(typeof window !== 'undefined' && window.electronAPI);
```
Components depend on unified adapter functions (`filesystemPlatform`, `serialPlatform`, `devicePlatform`, `processPlatform`), preserving Web browser compatibility while enabling full desktop hardware features inside Electron.
