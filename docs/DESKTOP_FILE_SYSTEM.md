# Desktop File System Integration Guide

## Overview
InnoView IDE Desktop transitions from in-browser virtual state storage (`localStorage` / IndexedDB) to native host directory and file management.

---

## Project Directory Standard Structure
When creating or opening an IDE project on the local disk, the folder structure is managed as follows:

```
MyProject/
├── project.json       # Desktop project configuration manifest
├── src/
│   ├── main.cpp       # Source files
│   └── config.h
├── diagrams/          # Visual flowcharts and block diagram JSON payloads
└── README.md
```

---

## Native Dialog Integration
- **Open Project:** Uses `dialog.showOpenDialog({ properties: ['openDirectory'] })` to select project root directory.
- **Save As:** Uses `dialog.showSaveDialog()` to export local files or diagram models.
- **File Tree Navigation:** Recursively scanned via `fsPromises.readdir` and rendered dynamically inside `ProjectFileExplorer`.
