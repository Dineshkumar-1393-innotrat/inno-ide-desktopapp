import { ipcMain } from 'electron';
import { flashService } from '../services/flash.service.js';

export function registerFlashIPC(getMainWindow) {
  ipcMain.handle('flash:check-env', async (_event, target, port) => {
    return await flashService.checkEnvironment(target, port);
  });

  ipcMain.handle('flash:detect-ports', async () => {
    return await flashService.detectPorts(getMainWindow);
  });

  ipcMain.handle('flash:test-port', async (_event, portPath) => {
    return await flashService.testPort(portPath);
  });

  ipcMain.handle('flash:run-pipeline', async (_event, { port, target, apiUrl, code }) => {
    return flashService.runPipeline({ port, target, apiUrl, code }, getMainWindow);
  });

  ipcMain.handle('flash:start-monitor', async (_event, { port }) => {
    return flashService.startMonitor({ port }, getMainWindow);
  });

  ipcMain.handle('flash:stop-monitor', async () => {
    return flashService.stopMonitor();
  });

  ipcMain.handle('flash:cancel', async () => {
    return flashService.cancelPipeline();
  });

  ipcMain.handle('flash:get-config', async () => {
    return flashService.loadConfig();
  });

  ipcMain.handle('flash:save-config', async (_event, config) => {
    return flashService.saveConfig(config);
  });

  ipcMain.handle('flash:browse-idf-path', async () => {
    return await flashService.browseIdfDirectory();
  });

  ipcMain.handle('flash:validate-idf-path', async (_event, targetPath) => {
    return flashService.validateIdfPath(targetPath);
  });
}
