# Electron Migration Audit Report

## 1. Project Overview & Root Identification
- **Project Name:** `innotrat-texteditor` (InnoView IDE / InnoIDE V1.9)
- **Project Root Directory:** `d:\ide-desktop-app`
- **Application Type:** Complex IoT/MERN Visual & Code IDE with Flowcharts, Block Diagrams, Math Editor, Dyte Meetings, Rule Engine, and Hardware/Serial integration.

---

## 2. Technical Stack Audit

### Core Frameworks & Versions
- **React Version:** `^18.3.1` (`react-dom` `^18.3.1`)
- **Build System:** Vite `^7.2.2` with `@vitejs/plugin-react` (`^4.3.1`) & `@tailwindcss/vite` (`^4.3.3`)
- **TypeScript Config:** JS/JSX codebase using `jsconfig.json` with `@/` path alias pointing to `./src`.
- **Frontend Entry Point:** `index.html` -> `src/main.jsx` -> `src/App.jsx`.

### Router
- **Library:** `react-router-dom` `^6.26.2`
- **Router Implementation:** `createBrowserRouter` in `src/main.jsx` rendering `<App />` with splat route `/*`. `App.jsx` handles internal `<Routes>` (`/`, `/editor`, `/flowcharttest`, `/blockdiagram`, `/blockprogramming`, `/embedded`, etc.).

### State Management
- **Primary Redux Store:** `@reduxjs/toolkit` (`^2.11.0`) with `redux-persist` (`^6.0.0`) in `src/store/store.js`.
- **Slices:** `blockDiagramSlice`, `blockProgrammingSlice`, `editorSlice`, `flowchartSlice`, `mathEditorSlice`, `simulationSlice`.
- **React Contexts:** `ProjectContext` (`src/ProjectContext.jsx`), `WorkspaceStateContext`, `AuthContext`, `MeetingContext`, `ZoomContext`.

### UI Frameworks & Styling
- `@chakra-ui/react` (`^2.10.0`) & `@chakra-ui/icons`
- `@mui/material` (`^6.4.4`) & `@mui/icons-material`
- Tailwind CSS (`^4.3.3`) & `bootstrap` (`^5.3.3`)
- `framer-motion` (`^11.18.2`), `lucide-react`, `react-icons`

### API & Backend Communication Layer
- **HTTP Client:** `axios` (`^1.7.7`)
- **API Configurations:** Centralized in `src/config/api.js`, `src/utilities.js`, `src/api.js`.
- **Vite Proxies:** In development, `/api/v1`, `/product-api`, `/auth`, `/product` proxy to `http://localhost:5004`.
- **Environment Variables:**
  - `VITE_API_BASE_URL` (Defaults to `http://localhost:5004` or remote backend endpoint)
  - `VITE_ADMIN_API_BASE_URL`
  - `VITE_GITHUB_API_BASE_URL`
  - `VITE_CLOUDINARY_URL`
  - `VITE_GOOGLE_CLIENT_ID`
  - `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`

### Authentication & Identity
- Google OAuth (`@react-oauth/google`), Auth0 (`@auth0/auth0-react`), Token/UserData in `localStorage` / `js-cookie`.

### WebSocket & Media
- Dyte SDK (`@dytesdk/react-web-core`, `@dytesdk/react-ui-kit`) for real-time video/collaboration meetings.

### Code Editor & Visual Programming
- **Code Editor:** `@monaco-editor/react` (`^4.6.0`) with `monaco-editor` (`^0.52.0`).
- **Flowchart & Visual Programming:** `reactflow` (`^11.10.0`), `@reactflow/node-resizer`, `react-konva`, `react-dnd`, `react-dnd-html5-backend`.

### File Management & Storage Architecture
- Currently uses web-based virtual file management via `localStorage` (`projectManager.js`, `projectFileManager.js`, `workspaceStorage.js`, `autoSaveManager.js`).
- Needs Electron IPC bridge to support opening, saving, and managing real local directories on the host operating system (`fs`, native dialogs).

### Device Management & Serial Capabilities
- Web Serial (`navigator.serial`) references in `src/utils/espIdfUtils.js`, `src/utils/ledBlinkIntegration.js`, `src/components/Flash.jsx`.
- Code execution via external Piston API (`https://emkc.org/api/v2/piston`) and hardware flashing triggers via backend.

---

## 3. Potential Electron Compatibility Challenges & Mitigations

1. **Routing Mode on Local `file://` Protocol:**
   - *Problem:* `createBrowserRouter` (HTML5 History API) causes broken route resolution when bundled into Electron static files loaded via `file://`.
   - *Mitigation:* Configure Vite `base: './'` and switch router to `createHashRouter` or detect Electron runtime to use hash routing, preserving standard web behavior in dev mode.

2. **API Base URL Resolution in Electron:**
   - *Problem:* Relative `/api/v1` calls rely on Vite dev server proxy. In packaged Electron desktop apps, relative requests fail.
   - *Mitigation:* Ensure `VITE_API_BASE_URL` defaults to `http://localhost:5004` (or configured backend URL) when running in Electron.

3. **Web Serial & Native Device Communication:**
   - *Problem:* `navigator.serial` relies on Web Serial permission prompts in browsers, which can be inconsistent inside Electron BrowserWindow.
   - *Mitigation:* Provide native IPC serial service via `serialport` module in Electron main process exposed through secure `window.electronAPI.serial` bridge with web fallback.

4. **Security & Sandbox Isolation:**
   - *Problem:* Directly enabling `nodeIntegration: true` exposes node native security risks.
   - *Mitigation:* Keep `contextIsolation: true`, `nodeIntegration: false`, and `sandbox: true` (or safe process model), exposing safe APIs exclusively via `preload.js`.

5. **Build & Bundling Packaging:**
   - *Problem:* Electron main process & preload scripts must be compiled/packaged along with Vite renderer output.
   - *Mitigation:* Configure `electron/main.js` and `electron/preload.js` (or compile TypeScript/ESM electron files) and setup `electron-builder` configuration in `electron-builder.yml` and `package.json`.

---

## 4. Migration Roadmap
- **Phase 1:** Complete initial repository audit (This Document).
- **Phase 2:** Electron shell architecture setup (`electron/main.js`, `electron/preload.js`, BrowserWindow config).
- **Phase 3:** Secure IPC Channel definition (`filesystem`, `project`, `device`, `serial`, `process`, `app`).
- **Phase 4:** Abstract platform layer (`src/platform/`) to seamlessly bridge Web vs Desktop features without breaking existing React components.
- **Phase 5:** Native filesystem integration (Open Project, Save Project, Save As, Local File Watcher).
- **Phase 6:** Express REST API integration and CORS verification.
- **Phase 7:** Native Menus and Keyboard Shortcuts.
- **Phase 8:** Packaging setup with `electron-builder` for Windows (`NSIS` installer & Portable `.exe`).
