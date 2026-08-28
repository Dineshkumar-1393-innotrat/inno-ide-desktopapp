import { ipcMain } from 'electron';
import { processService } from '../services/process.service.js';

export function registerProcessIPC(getMainWindow) {
  ipcMain.handle('process:execute', async (event, { command, args, options }) => {
    const mainWindow = getMainWindow();

    const processId = processService.execute(
      command,
      args,
      options,
      (pid, stdout) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('process:stdout', { processId: pid, data: stdout });
        }
      },
      (pid, stderr) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('process:stderr', { processId: pid, data: stderr });
        }
      },
      (pid, exitCode) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('process:exit', { processId: pid, exitCode });
        }
      }
    );

    return { processId };
  });

  ipcMain.handle('process:cancel', async (event, processId) => {
    return processService.cancel(processId);
  });
}
