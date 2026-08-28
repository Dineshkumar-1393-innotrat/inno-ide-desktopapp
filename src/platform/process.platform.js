import { isElectron } from './index.js';

export const processPlatform = {
  async execute(command, args = [], options = {}) {
    if (isElectron) {
      return await window.electronAPI.process.execute(command, args, options);
    }
    console.warn('[ProcessPlatform] Process execution requested on Web browser mode.');
    return { processId: 'web_proc_stub' };
  },

  async cancel(processId) {
    if (isElectron) {
      return await window.electronAPI.process.cancel(processId);
    }
    return { success: false };
  },

  onStdout(callback) {
    if (isElectron) {
      return window.electronAPI.process.onStdout(callback);
    }
    return () => {};
  },

  onStderr(callback) {
    if (isElectron) {
      return window.electronAPI.process.onStderr(callback);
    }
    return () => {};
  },

  onExit(callback) {
    if (isElectron) {
      return window.electronAPI.process.onExit(callback);
    }
    return () => {};
  }
};
