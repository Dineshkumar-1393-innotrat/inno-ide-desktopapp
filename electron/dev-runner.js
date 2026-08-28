import { spawn } from 'child_process';
import http from 'http';

const VITE_PORT = 5173;
const DEV_URL = `http://localhost:${VITE_PORT}`;

console.log('Starting Vite development server...');

const viteProcess = spawn('npx', ['vite', '--port', String(VITE_PORT)], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

function checkViteReady(retryCount = 0) {
  if (retryCount > 60) {
    console.error('Vite dev server failed to start in 30 seconds.');
    viteProcess.kill();
    process.exit(1);
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
    viteProcess.kill();
    process.exit(code || 0);
  });
}

setTimeout(() => checkViteReady(), 1000);
