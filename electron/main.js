import { app, BrowserWindow, Menu, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { logger } from './utils/logger.js';
import { registerAllIPCHandlers } from './ipc/index.js';
import { setupApplicationMenu } from './menu.js';
import { flashService } from './services/flash.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Performance switches: optimize V8 memory & caching for desktop execution
app.commandLine.appendSwitch('disable-http-cache', 'false');
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=4096');

let mainWindow = null;

// In packaged mode, ensure single instance lock so COM ports and flash processes are never locked by a duplicate process
if (app.isPackaged) {
  const gotSingleInstanceLock = app.requestSingleInstanceLock();
  if (!gotSingleInstanceLock) {
    app.quit();
  } else {
    app.on('second-instance', () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      }
    });
  }
}

function getMainWindow() {
  return mainWindow;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: 'InnoIDE Desktop',
    backgroundColor: '#0f172a',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  // Log renderer console messages and lifecycle events to persistent log
  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    logger.info(`[Renderer Console L${level}] ${message} (${sourceId}:${line})`);
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    logger.error(`[Renderer Load Fail] ${errorCode}: ${errorDescription} (${validatedURL})`);
  });

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    logger.error(`[Renderer Process Gone] reason: ${details.reason}, exitCode: ${details.exitCode}`);
  });

  const standardChromeUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

  mainWindow.webContents.setUserAgent(standardChromeUserAgent);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // If the window is a Google OAuth popup or Auth0/OAuth flow, allow it inside Electron so window.opener & postMessage work
    if (
      url.includes('accounts.google.com') ||
      url.includes('google.com/gsi') ||
      url.includes('oauth2') ||
      url.includes('auth0.com')
    ) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 520,
          height: 650,
          autoHideMenuBar: true,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            userAgent: standardChromeUserAgent
          }
        }
      };
    }

    // For all other external URLs (documentation, downloads, etc.), open in system browser
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('did-create-window', (childWindow) => {
    childWindow.webContents.setUserAgent(standardChromeUserAgent);
    childWindow.setMenu(null);
  });

  mainWindow.setMenu(null);

  // Enable F12 & Ctrl+Shift+I DevTools shortcuts
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown') {
      if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i') || (input.meta && input.alt && input.key.toLowerCase() === 'i')) {
        mainWindow.webContents.toggleDevTools();
        event.preventDefault();
      }
    }
  });

  // Enable Right-Click -> Inspect Element Context Menu
  mainWindow.webContents.on('context-menu', (event, props) => {
    const { x, y } = props;
    Menu.buildFromTemplate([
      {
        label: 'Inspect Element',
        click: () => {
          mainWindow.webContents.inspectElement(x, y);
        }
      },
      {
        label: 'Toggle Developer Tools',
        click: () => {
          mainWindow.webContents.toggleDevTools();
        }
      }
    ]).popup({ window: mainWindow });
  });

  // Enable graceful window display when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    logger.info('Main window displayed.');
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  const isDev = !app.isPackaged && Boolean(devUrl);

  if (isDev) {
    mainWindow.loadURL(devUrl).catch(err => {
      logger.error(`Failed to load dev server URL ${devUrl}:`, err.message);
    });
  } else {
    const appPath = app.getAppPath();
    const candidatePaths = [
      path.join(appPath, 'dist/index.html'),
      path.join(__dirname, '../dist/index.html'),
      path.join(process.resourcesPath || '', 'app.asar/dist/index.html'),
      path.join(process.resourcesPath || '', 'app/dist/index.html')
    ];

    let targetPath = candidatePaths[0];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        targetPath = p;
        break;
      }
    }

    logger.info(`Loading production HTML: ${targetPath}`);
    mainWindow.loadFile(targetPath).catch(err => {
      logger.error(`Failed to load production HTML ${targetPath}:`, err.message);
      mainWindow.loadFile('dist/index.html').catch(err2 => {
        logger.error(`Fallback loadFile('dist/index.html') also failed:`, err2.message);
      });
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  logger.init();
  logger.info('Electron app ready.');

  registerAllIPCHandlers(getMainWindow);
  setupApplicationMenu(getMainWindow);
  createWindow();
  flashService.startPortMonitoring(getMainWindow);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  try {
    flashService.cleanup();
  } catch (_) {}
});
