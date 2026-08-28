# Desktop Troubleshooting Guide

## Common Issues & Solutions

### 1. White Screen / Blank Window on Desktop Startup
- **Cause:** Relative paths not resolving under `file://` protocol.
- **Solution:** Verify `base: "./"` in `vite.config.js` and check that `src/main.jsx` uses `createHashRouter` in Electron mode.

### 2. REST API Requests Failing (`404` or `ERR_CONNECTION_REFUSED`)
- **Cause:** Renderer attempting relative requests to non-existent local web server.
- **Solution:** Verify `VITE_API_BASE_URL` or check that `src/utilities.js` resolves `http://localhost:5004` (the Express API backend target).

### 3. Native Serial Module Not Found
- **Cause:** `serialport` module missing or ABI mismatch with Electron version.
- **Solution:** InnoView IDE serial service features safe dynamic import fallback. To use native serial drivers, rebuild native modules using `electron-rebuild`.

### 4. Application Logs Location
- Desktop application logs are written to:
  `%APPDATA%\innotrat-texteditor\logs\app-YYYY-MM-DD.log`
