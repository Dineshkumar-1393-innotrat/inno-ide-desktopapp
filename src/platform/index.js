export const isElectron = Boolean(typeof window !== 'undefined' && window.electronAPI);

export function getPlatformInfo() {
  return {
    isElectron,
    isWeb: !isElectron,
    platformName: isElectron ? 'Electron Desktop' : 'Web Browser'
  };
}

export * from './filesystem.platform.js';
export * from './device.platform.js';
export * from './serial.platform.js';
export * from './process.platform.js';
