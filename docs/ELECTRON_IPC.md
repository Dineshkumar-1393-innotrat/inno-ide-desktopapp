# Electron IPC Contract Specification

## Overview
All communications between the React Renderer and Electron Main Process are governed by strongly typed IPC channels exposed through `window.electronAPI`.

---

## 1. Application & Info Channel (`app:*`)
| Channel | Method | Returns | Description |
| :--- | :--- | :--- | :--- |
| `app:get-info` | `window.electronAPI.app.getInfo()` | `Promise<{ name, version, electronVersion, nodeVersion, platform }>` | Retrieves system runtime environment details |

---

## 2. Filesystem Channel (`fs:*`)
| Channel | Method | Returns | Description |
| :--- | :--- | :--- | :--- |
| `fs:select-directory` | `window.electronAPI.filesystem.selectDirectory(options)` | `Promise<string \| null>` | Displays native directory picker |
| `fs:select-file` | `window.electronAPI.filesystem.selectFile(options)` | `Promise<string \| null>` | Displays native file picker |
| `fs:select-save-file` | `window.electronAPI.filesystem.selectSaveFile(options)` | `Promise<string \| null>` | Displays native save-as file dialog |
| `fs:read-file` | `window.electronAPI.filesystem.readFile(path, encoding)` | `Promise<string>` | Reads local file content |
| `fs:write-file` | `window.electronAPI.filesystem.writeFile(path, content, encoding)` | `Promise<{ success, path }>` | Writes file safely to local disk |
| `fs:create-directory` | `window.electronAPI.filesystem.createDirectory(path)` | `Promise<{ success, path }>` | Creates local directory recursively |
| `fs:delete` | `window.electronAPI.filesystem.delete(path)` | `Promise<{ success, path }>` | Deletes local file or folder |
| `fs:rename` | `window.electronAPI.filesystem.rename(oldPath, newPath)` | `Promise<{ success, oldPath, newPath }>` | Renames local file or folder |
| `fs:list-directory` | `window.electronAPI.filesystem.listDirectory(path)` | `Promise<Array<{ name, path, type }>>` | Lists contents of folder |

---

## 3. Project Management Channel (`project:*`)
| Channel | Method | Returns | Description |
| :--- | :--- | :--- | :--- |
| `project:get-recent` | `window.electronAPI.project.getRecent()` | `Promise<Array<{ name, path, lastOpened }>>` | Gets list of recently opened projects |
| `project:create` | `window.electronAPI.project.create(path, metadata)` | `Promise<{ success, project, path }>` | Initializes desktop project folder and manifest |
| `project:open` | `window.electronAPI.project.open(path)` | `Promise<{ success, manifest, path }>` | Loads project manifest & records in recent projects |

---

## 4. Serial & Device Channel (`serial:*`, `device:*`)
| Channel | Method | Returns | Description |
| :--- | :--- | :--- | :--- |
| `device:list` | `window.electronAPI.device.list()` | `Promise<Array<Device>>` | Scans available hardware devices |
| `serial:list-ports` | `window.electronAPI.serial.listPorts()` | `Promise<Array<SerialPortInfo>>` | Lists available COM / USB serial ports |
| `serial:connect` | `window.electronAPI.serial.connect(path, baudRate)` | `Promise<{ success, port }>` | Opens connection to serial port |
| `serial:disconnect` | `window.electronAPI.serial.disconnect(path)` | `Promise<{ success, port }>` | Closes active serial port |
| `serial:write` | `window.electronAPI.serial.write(path, data)` | `Promise<{ success, bytesWritten }>` | Transmits string/buffer data |
| `serial:data` | `window.electronAPI.serial.onData(callback)` | `UnsubscribeFn` | Listens to inbound serial stream data |

---

## 5. Process Execution Channel (`process:*`)
| Channel | Method | Returns | Description |
| :--- | :--- | :--- | :--- |
| `process:execute` | `window.electronAPI.process.execute(command, args, options)` | `Promise<{ processId }>` | Spawns child process securely |
| `process:cancel` | `window.electronAPI.process.cancel(processId)` | `Promise<{ success }>` | Kills running spawned process |
| `process:stdout` | `window.electronAPI.process.onStdout(callback)` | `UnsubscribeFn` | Listens to stdout stream |
| `process:stderr` | `window.electronAPI.process.onStderr(callback)` | `UnsubscribeFn` | Listens to stderr stream |
| `process:exit` | `window.electronAPI.process.onExit(callback)` | `UnsubscribeFn` | Receives process exit code |
