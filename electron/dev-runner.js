import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const VITE_PORT = 5173;
const DEV_URL = `http://localhost:${VITE_PORT}`;

console.log('Starting Vite development server...');

const viteProcess = spawn('npx', ['vite', '--port', String(VITE_PORT)], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

// Start Cloud Tunnel Daemon for remote 4G/5G mobile companion access
const tunnelDaemon = spawn('node', [path.join(PROJECT_ROOT, 'scratch/cloud_tunnel_daemon.cjs')], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

function cleanupProcesses(code = 0) {
  try { tunnelDaemon.kill(); } catch {}
  try { viteProcess.kill(); } catch {}
  process.exit(code);
}

process.on('SIGINT', () => cleanupProcesses(0));
process.on('SIGTERM', () => cleanupProcesses(0));

function checkViteReady(retryCount = 0) {
  if (retryCount > 60) {
    console.error('Vite dev server failed to start in 30 seconds.');
    cleanupProcesses(1);
  }

  http.get(DEV_URL, (res) => {
    if (res.statusCode === 200 || res.statusCode === 304 || res.statusCode === 404) {
      console.log('Vite server is ready! Launching Electron...');
      launchElectron();
    } else {
      setTimeout(() => checkViteReady(retryCount + 1), 500);
    }
  }).on('error', () => {
    setTimeout(() => checkViteReady(retryCount + 1), 500);
  });
}

function launchElectron() {
  const electronProcess = spawn('npx', ['electron', 'electron/main.js'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, VITE_DEV_SERVER_URL: DEV_URL, NODE_ENV: 'development' }
  });

  electronProcess.on('close', (code) => {
    console.log(`Electron closed with exit code ${code}`);
    cleanupProcesses(code || 0);
  });
}

setTimeout(() => checkViteReady(), 1000);
