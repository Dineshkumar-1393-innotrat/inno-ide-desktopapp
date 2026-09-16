const { contextBridge, ipcRenderer } = require('electron');

const electronAPI = {
  app: {
    getInfo: () => ipcRenderer.invoke('app:get-info'),
    openExternal: (url) => ipcRenderer.invoke('app:open-external', url),
    createExpoSnack: (params) => ipcRenderer.invoke('app:create-expo-snack', params),
    startCompanionServer: (params) => ipcRenderer.invoke('app:start-companion-server', params),
    getCompanionInfo: () => ipcRenderer.invoke('app:get-companion-info'),
    stopCompanionServer: () => ipcRenderer.invoke('app:stop-companion-server'),
    startRemoteTunnel: (port, forceRestart = false) => ipcRenderer.invoke('app:start-remote-tunnel', port, forceRestart),
    stopRemoteTunnel: () => ipcRenderer.invoke('app:stop-remote-tunnel'),
    getRemoteTunnel: () => ipcRenderer.invoke('app:get-remote-tunnel'),
    onCompanionAction: (callback) => {
      const listener = (_event, value) => callback(value);
      ipcRenderer.on('companion:action', listener);
      return () => ipcRenderer.removeListener('companion:action', listener);
    },
    onTunnelStatus: (callback) => {
      const listener = (_event, value) => callback(value);
      ipcRenderer.on('companion:tunnel-status', listener);
      return () => ipcRenderer.removeListener('companion:tunnel-status', listener);
    }
  },

  project: {
    getRecent: () => ipcRenderer.invoke('project:get-recent'),
    create: (path, metadata) => ipcRenderer.invoke('project:create', { path, metadata }),
    open: (path) => ipcRenderer.invoke('project:open', path)
  },

  filesystem: {
    selectDirectory: (options) => ipcRenderer.invoke('fs:select-directory', options),
    selectFile: (options) => ipcRenderer.invoke('fs:select-file', options),
    selectSaveFile: (options) => ipcRenderer.invoke('fs:select-save-file', options),
    readFile: (path, encoding) => ipcRenderer.invoke('fs:read-file', { path, encoding }),
    writeFile: (path, content, encoding) => ipcRenderer.invoke('fs:write-file', { path, content, encoding }),
    createDirectory: (path) => ipcRenderer.invoke('fs:create-directory', path),
    delete: (path) => ipcRenderer.invoke('fs:delete', path),
    rename: (oldPath, newPath) => ipcRenderer.invoke('fs:rename', { oldPath, newPath }),
    listDirectory: (path) => ipcRenderer.invoke('fs:list-directory', path)
  },

  device: {
    list: () => ipcRenderer.invoke('device:list'),
    getStatus: (id) => ipcRenderer.invoke('device:get-status', id)
  },

  serial: {
    listPorts: () => ipcRenderer.invoke('serial:list-ports'),
    connect: (path, baudRate) => ipcRenderer.invoke('serial:connect', { path, baudRate }),
    disconnect: (path) => ipcRenderer.invoke('serial:disconnect', path),
    write: (path, data) => ipcRenderer.invoke('serial:write', { path, data }),
    onData: (callback) => {
      const listener = (_event, value) => callback(value);
      ipcRenderer.on('serial:data', listener);
      return () => ipcRenderer.removeListener('serial:data', listener);
    }
  },

  process: {
    execute: (command, args, options) => ipcRenderer.invoke('process:execute', { command, args, options }),
    cancel: (processId) => ipcRenderer.invoke('process:cancel', processId),
    onStdout: (callback) => {
      const listener = (_event, data) => callback(data);
      ipcRenderer.on('process:stdout', listener);
      return () => ipcRenderer.removeListener('process:stdout', listener);
    },
    onStderr: (callback) => {
      const listener = (_event, data) => callback(data);
      ipcRenderer.on('process:stderr', listener);
      return () => ipcRenderer.removeListener('process:stderr', listener);
    },
    onExit: (callback) => {
      const listener = (_event, data) => callback(data);
      ipcRenderer.on('process:exit', listener);
      return () => ipcRenderer.removeListener('process:exit', listener);
    }
  },

  flash: {
    checkEnv: (target, port) => ipcRenderer.invoke('flash:check-env', target, port),
    detectPorts: () => ipcRenderer.invoke('flash:detect-ports'),
    runPipeline: (config) => ipcRenderer.invoke('flash:run-pipeline', config),
    startMonitor: (config) => ipcRenderer.invoke('flash:start-monitor', config),
    stopMonitor: () => ipcRenderer.invoke('flash:stop-monitor'),
    cancel: () => ipcRenderer.invoke('flash:cancel'),
    getConfig: () => ipcRenderer.invoke('flash:get-config'),
    saveConfig: (config) => ipcRenderer.invoke('flash:save-config', config),
    browseIdfPath: () => ipcRenderer.invoke('flash:browse-idf-path'),
    validateIdfPath: (path) => ipcRenderer.invoke('flash:validate-idf-path', path),
    testPort: (portPath) => ipcRenderer.invoke('flash:test-port', portPath),
    onEvent: (callback) => {
      const listener = (_event, data) => callback(data);
      ipcRenderer.on('flash:event', listener);
      return () => ipcRenderer.removeListener('flash:event', listener);
    }
  }
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
