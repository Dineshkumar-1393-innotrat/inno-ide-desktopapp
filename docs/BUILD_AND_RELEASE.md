# Desktop Build & Packaging Guide

## Overview
This document covers building and packaging InnoView IDE into standalone Windows executables using Vite and `electron-builder`.

---

## Command Reference

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Runs web Vite dev server |
| `npm run build` | Builds web production bundle in `dist/` |
| `npm run electron:dev` | Launches Vite dev server & attaches Electron shell |
| `npm run electron:build` | Compiles Vite assets for desktop production |
| `npm run dist:win` | Bundles Windows NSIS Installer and Portable `.exe` in `dist-desktop/` |

---

## Production Packaging Deliverables
When running `npm run dist:win`, output files generated inside `dist-desktop/`:
- `InnoView IDE Setup 1.0.0.exe` (NSIS Installer with desktop/start menu shortcuts)
- `InnoViewIDE-Portable-1.0.0.exe` (Standalone portable application)
