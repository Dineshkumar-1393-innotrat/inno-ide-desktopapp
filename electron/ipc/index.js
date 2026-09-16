import { registerFilesystemIPC } from './filesystem.ipc.js';
import { registerProjectIPC } from './project.ipc.js';
import { registerDeviceIPC } from './device.ipc.js';
import { registerSerialIPC } from './serial.ipc.js';
import { registerProcessIPC } from './process.ipc.js';
import { registerFlashIPC } from './flash.ipc.js';
import { serialService } from '../services/serial.service.js';
import { ipcMain, app, shell } from 'electron';
import http from 'http';
import os from 'os';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let companionServer = null;

// Multi-Device Synchronized State Store
let companionState = {
  version: 1,
  lastUpdate: Date.now(),
  states: {
    'w-led': false
  },
  lastPayload: 'LED:0',
  activePort: 'COM9'
};

const sseClients = new Set();

function broadcastStateUpdate(extraData = {}) {
  companionState.version += 1;
  companionState.lastUpdate = Date.now();
  const eventPayload = JSON.stringify({
    version: companionState.version,
    lastUpdate: companionState.lastUpdate,
    states: companionState.states,
    lastPayload: companionState.lastPayload,
    activePort: companionState.activePort,
    ...extraData
  });

  for (const client of sseClients) {
    try {
      client.write(`data: ${eventPayload}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Remote Public Tunnel Manager (Works across different mobile networks / 4G / 5G / WAN)
let remoteTunnelProcess = null;
let remoteTunnelLt = null;
let currentRemoteUrl = '';
let remoteTunnelProvider = '';
let tunnelStartingPromise = null;
let globalGetMainWindow = null;

function saveTunnelStatus(active, url, provider) {
  try {
    const statusFile = path.join(__dirname, '../../scratch/active_tunnel.json');
    fs.writeFileSync(statusFile, JSON.stringify({
      url: active ? url : '',
      timestamp: Date.now(),
      active: Boolean(active),
      provider: provider || ''
    }, null, 2));
  } catch {}
}

function notifyTunnelStatus(active, url, provider, status) {
  try {
    const win = globalGetMainWindow?.();
    if (win && !win.isDestroyed()) {
      win.webContents.send('companion:tunnel-status', {
        active,
        url,
        provider,
        status
      });
    }
  } catch {}
}

async function startRemoteTunnel(port = currentCompanionPort, forceRestart = false) {
  // If force restart requested or previous process died, clean up first
  if (forceRestart || (remoteTunnelProcess && remoteTunnelProcess.exitCode !== null)) {
    await stopRemoteTunnel();
  } else if (currentRemoteUrl && remoteTunnelProcess && !remoteTunnelProcess.killed && remoteTunnelProcess.exitCode === null) {
    return { success: true, url: currentRemoteUrl, provider: remoteTunnelProvider };
  }

  if (tunnelStartingPromise) return await tunnelStartingPromise;

  tunnelStartingPromise = (async () => {
    // Clean up any stale process before starting fresh
    if (remoteTunnelProcess) {
      try { remoteTunnelProcess.kill(); } catch {}
      remoteTunnelProcess = null;
    }

    // Provider 1: localhost.run via SSH (Instant HTTPS, zero-setup, direct access across all networks)
    try {
      const lhrUrl = await new Promise((resolve, reject) => {
        const sshTimeout = setTimeout(() => {
          if (remoteTunnelProcess) {
            try { remoteTunnelProcess.kill(); } catch {}
            remoteTunnelProcess = null;
          }
          reject(new Error('localhost.run SSH connection timed out'));
        }, 14000);

        const proc = spawn('ssh', [
          '-o', 'StrictHostKeyChecking=no',
          '-o', 'ServerAliveInterval=15',
          '-o', 'ServerAliveCountMax=4',
          '-o', 'ExitOnForwardFailure=yes',
          '-R', `80:127.0.0.1:${port}`,
          'nokey@localhost.run'
        ], { stdio: ['ignore', 'pipe', 'pipe'] });

        remoteTunnelProcess = proc;

        const checkOutput = (chunk) => {
          const text = chunk.toString();
          const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.lhr\.life/i);
          if (match && match[0]) {
            clearTimeout(sshTimeout);
            resolve(match[0]);
          }
        };

        proc.stdout.on('data', checkOutput);
        proc.stderr.on('data', checkOutput);

        proc.on('error', (err) => {
          clearTimeout(sshTimeout);
          remoteTunnelProcess = null;
          reject(err);
        });

        proc.on('close', () => {
          remoteTunnelProcess = null;
          if (remoteTunnelProvider === 'localhost.run') {
            currentRemoteUrl = '';
            remoteTunnelProvider = '';
          }
          saveTunnelStatus(false, '', '');
          notifyTunnelStatus(false, '', '', 'disconnected');
        });
      });

      if (lhrUrl) {
        currentRemoteUrl = lhrUrl;
        remoteTunnelProvider = 'localhost.run';
        console.log(`[RemoteTunnel] Public HTTPS tunnel active via localhost.run: ${lhrUrl}`);
        saveTunnelStatus(true, lhrUrl, 'localhost.run');
        notifyTunnelStatus(true, lhrUrl, 'localhost.run', 'active');
        return { success: true, url: lhrUrl, provider: 'localhost.run' };
      }
    } catch (sshErr) {
      console.warn('[RemoteTunnel] localhost.run attempt notice:', sshErr.message);
    }

    // Provider 2: Serveo via SSH fallback
    try {
      const serveoUrl = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          if (remoteTunnelProcess) {
            try { remoteTunnelProcess.kill(); } catch {}
            remoteTunnelProcess = null;
          }
          reject(new Error('Serveo SSH connection timed out'));
        }, 12000);

        const proc = spawn('ssh', [
          '-o', 'StrictHostKeyChecking=no',
          '-o', 'ServerAliveInterval=15',
          '-o', 'ServerAliveCountMax=4',
          '-R', `80:127.0.0.1:${port}`,
          'serveo.net'
        ], { stdio: ['ignore', 'pipe', 'pipe'] });

        remoteTunnelProcess = proc;

        const checkOutput = (chunk) => {
          const text = chunk.toString();
          const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.(?:serveousercontent\.com|serveo\.net)/i);
          if (match && match[0]) {
            clearTimeout(timeout);
            resolve(match[0]);
          }
        };

        proc.stdout.on('data', checkOutput);
        proc.stderr.on('data', checkOutput);

        proc.on('error', (err) => {
          clearTimeout(timeout);
          remoteTunnelProcess = null;
          reject(err);
        });

        proc.on('close', () => {
          remoteTunnelProcess = null;
          if (remoteTunnelProvider === 'serveo') {
            currentRemoteUrl = '';
            remoteTunnelProvider = '';
          }
          saveTunnelStatus(false, '', '');
          notifyTunnelStatus(false, '', '', 'disconnected');
        });
      });

      if (serveoUrl) {
        currentRemoteUrl = serveoUrl;
        remoteTunnelProvider = 'serveo';
        console.log(`[RemoteTunnel] Public HTTPS tunnel active via Serveo: ${serveoUrl}`);
        saveTunnelStatus(true, serveoUrl, 'serveo');
        notifyTunnelStatus(true, serveoUrl, 'serveo', 'active');
        return { success: true, url: serveoUrl, provider: 'serveo' };
      }
    } catch (serveoErr) {
      console.warn('[RemoteTunnel] Serveo fallback attempt notice:', serveoErr.message);
    }

    saveTunnelStatus(false, '', '');
    notifyTunnelStatus(false, '', '', 'failed');
    return { success: false, error: 'Could not establish SSH cloud tunnel to localhost.run or Serveo' };
  })();

  try {
    return await tunnelStartingPromise;
  } finally {
    tunnelStartingPromise = null;
  }
}

async function stopRemoteTunnel() {
  if (remoteTunnelProcess) {
    try { remoteTunnelProcess.kill(); } catch {}
    remoteTunnelProcess = null;
  }
  if (remoteTunnelLt) {
    try { remoteTunnelLt.close(); } catch {}
    remoteTunnelLt = null;
  }
  currentRemoteUrl = '';
  remoteTunnelProvider = '';
  saveTunnelStatus(false, '', '');
  notifyTunnelStatus(false, '', '', 'disconnected');
  return { success: true };
}
let currentCompanionHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>InnoIDE Companion App</title>
  <style>
    :root { --primary: #38bdf8; --bg: #090d16; --card: #131b2e; --border: #1e293b; --text: #f8fafc; --subtext: #94a3b8; }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: var(--bg); color: var(--text); min-height: 100vh; display: flex; justify-content: center; padding: 16px; }
    .phone { width: 100%; max-width: 440px; background: #0f172a; border-radius: 28px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); padding: 20px; display: flex; flex-direction: column; gap: 16px; border: 1px solid var(--border); }
    .header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
    .brand-sub { font-size: 10px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px; }
    .header h1 { font-size: 18px; font-weight: 800; color: #fff; margin-top: 2px; }
    .badge { font-size: 11px; padding: 4px 10px; border-radius: 9999px; background: rgba(34,197,94,0.15); color: #4ade80; font-weight: 700; display: flex; align-items: center; gap: 5px; }
    .badge-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; }
    .card { background: var(--card); border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 12px; border: 1px solid var(--border); }
    .card.glow-blue { border-color: #2563eb; background: #101a38; }
    .row { display: flex; align-items: center; justify-content: space-between; }
    .title { font-weight: 700; font-size: 15px; color: #f8fafc; }
    .meta { font-size: 12px; color: var(--subtext); margin-top: 2px; }
    .toggle { position: relative; width: 48px; height: 26px; }
    .toggle input { opacity: 0; width: 0; height: 0; }
    .slider-toggle { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: #334155; border-radius: 26px; transition: 0.3s; }
    .slider-toggle:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s; }
    input:checked + .slider-toggle { background: #2563eb; }
    input:checked + .slider-toggle:before { transform: translateX(22px); }
    .log-box { font-family: monospace; font-size: 11px; padding: 12px; border-radius: 14px; background: #090d16; color: #38bdf8; max-height: 180px; overflow-y: auto; border: 1px solid var(--border); display: flex; flex-direction: column; gap: 3px; }
  </style>
</head>
<body>
  <div class="phone">
    <div class="header">
      <div>
        <div class="brand-sub">InnoIDE Companion</div>
        <h1>ESP32 Hardware Controller</h1>
      </div>
      <div class="badge"><div class="badge-dot"></div> ESP32 Linked</div>
    </div>
    <div class="card" id="card-led">
      <div class="row">
        <div>
          <div class="title">LED Light Control</div>
          <div class="meta" id="status-desc">Target: GPIO 2 / 48 (COM9)</div>
        </div>
        <label class="toggle">
          <input type="checkbox" id="input-led" onchange="toggleLed(this.checked)">
          <span class="slider-toggle"></span>
        </label>
      </div>
    </div>
    <div class="log-box" id="logConsole">
      <div>[SYSTEM] InnoIDE Companion Online</div>
      <div>[SYSTEM] Flip toggle switch to control physical ESP32 LED</div>
    </div>
  </div>
  <script>
    function addLog(msg) {
      const el = document.getElementById('logConsole');
      const time = new Date().toLocaleTimeString();
      el.innerHTML += '<div>[' + time + '] ' + msg + '</div>';
      el.scrollTop = el.scrollHeight;
    }
    function toggleLed(checked) {
      const card = document.getElementById('card-led');
      if (checked) card.classList.add('glow-blue');
      else card.classList.remove('glow-blue');
      const cmd = checked ? 'LED:1' : 'LED:0';
      addLog('📱 [UI] LED Toggle -> ' + (checked ? 'ON (Blinking)' : 'OFF (Stopped)'));

      const payloadObj = { payload: cmd, SwitchStatus: checked ? 1 : 0, value: checked, port: 'COM9' };
      const bodyStr = JSON.stringify(payloadObj);
      const qs = 'payload=' + encodeURIComponent(cmd) + '&SwitchStatus=' + (checked ? 1 : 0) + '&value=' + checked + '&port=COM9';

      // Tier 1: Standard POST with JSON
      fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr
      }).then(r => r.json()).then(res => {
        if (res && res.success) {
          addLog('📡 [HARDWARE] ' + (checked ? 'LED Blinking (ON)' : 'LED Stopped (OFF)'));
        }
      }).catch(() => {
        // Tier 2: Simple text/plain POST (bypasses CORS preflight)
        fetch('/api/action', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: bodyStr,
          mode: 'no-cors'
        }).then(() => {
          addLog('📡 [HARDWARE] ' + (checked ? 'LED Blinking (ON)' : 'LED Stopped (OFF)'));
        }).catch(() => {
          // Tier 3: GET query request
          fetch('/api/action?' + qs, { method: 'GET', mode: 'no-cors' }).catch(() => {});
          // Tier 4: Image Beacon (bypasses all sandbox and CORS restrictions)
          new Image().src = '/api/action?' + qs + '&_img=1&_t=' + Date.now();
          addLog('📡 [HARDWARE] ' + (checked ? 'LED Blinking (ON)' : 'LED Stopped (OFF)'));
        });
      });
    }

    // Multi-device synchronization: sync state across all connected phones and desktop
    function applySyncState(data) {
      if (!data || !data.states) return;
      const isLedOn = Boolean(data.states['w-led'] || data.states['led']);
      const input = document.getElementById('input-led');
      const card = document.getElementById('card-led');
      if (input && input.checked !== isLedOn) {
        input.checked = isLedOn;
        if (card) {
          if (isLedOn) card.classList.add('glow-blue');
          else card.classList.remove('glow-blue');
        }
        addLog('🔄 [SYNC] LED updated from connected device -> ' + (isLedOn ? 'ON' : 'OFF'));
      }
    }

    function initSync() {
      // 1. Initial State Fetch
      fetch('/api/state').then(r => r.json()).then(applySyncState).catch(() => {});
      // 2. Real-time Push via SSE (sub-50ms sync)
      if (window.EventSource) {
        try {
          const es = new EventSource('/api/events');
          es.onmessage = (e) => {
            try { applySyncState(JSON.parse(e.data)); } catch {}
          };
        } catch {}
      }
      // 3. Resilient Polling Fallback (every 1.5s for seamless sync over cellular / restricted networks)
      setInterval(() => {
        fetch('/api/state').then(r => r.json()).then(applySyncState).catch(() => {});
      }, 1500);
    }
    window.addEventListener('load', initSync);
  </script>
</body>
</html>`;
let currentCompanionPort = 5055;

function getLocalIPv4() {
  const ifaces = os.networkInterfaces();
  const physicalCandidates = [];
  const otherCandidates = [];
  for (const name of Object.keys(ifaces)) {
    const isVirtual = /virtual|vbox|vmnet|vethernet|hyper-v|loopback|docker|wsl|tailscale|zerotier/i.test(name);
    const isPreferred = /wi-fi|wireless|wlan|ethernet|local area connection/i.test(name);
    for (const net of ifaces[name]) {
      if (net.family === 'IPv4' && !net.internal && !net.address.startsWith('127.') && !net.address.startsWith('169.254.')) {
        if (!isVirtual && (net.address.startsWith('192.168.') || net.address.startsWith('10.') || net.address.startsWith('172.'))) {
          if (isPreferred) {
            physicalCandidates.unshift(net.address);
          } else {
            physicalCandidates.push(net.address);
          }
        } else if (!isVirtual) {
          otherCandidates.push(net.address);
        }
      }
    }
  }
  return physicalCandidates[0] || otherCandidates[0] || '192.168.0.6';
}

export function registerAllIPCHandlers(getMainWindow) {
  globalGetMainWindow = getMainWindow;
  registerFilesystemIPC(getMainWindow);
  registerProjectIPC();
  registerDeviceIPC();
  registerSerialIPC(getMainWindow);
  registerProcessIPC(getMainWindow);
  registerFlashIPC(getMainWindow);

  ipcMain.handle('app:get-info', async () => {
    return {
      name: app.getName(),
      version: app.getVersion(),
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node,
      platform: process.platform
    };
  });

  ipcMain.handle('app:open-external', async (_event, url) => {
    if (!url || typeof url !== 'string') {
      return { success: false, error: 'Invalid URL' };
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      await shell.openExternal(url);
      return { success: true };
    }
    return { success: false, error: 'Invalid URL protocol' };
  });

  // Local Companion HTTP Server for instant phone camera scanning
  async function ensureCompanionServer(port = 5055) {
    if (companionServer) {
      const ip = getLocalIPv4();
      return { success: true, url: `http://${ip}:${currentCompanionPort}`, ip, port: currentCompanionPort };
    }
    currentCompanionPort = port;

    companionServer = http.createServer(async (req, res) => {
      // Comprehensive CORS & Private Network Access (PNA) Headers for mobile browsers and in-app scanners
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Range');
      res.setHeader('Access-Control-Allow-Private-Network', 'true');
      res.setHeader('Access-Control-Max-Age', '86400');

      if (req.method === 'OPTIONS') {
        res.writeHead(204, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Range',
          'Access-Control-Allow-Private-Network': 'true',
          'Access-Control-Max-Age': '86400'
        });
        return res.end();
      }

      let pathname = '/';
      let searchParams = new URLSearchParams();
      try {
        const parsed = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        pathname = parsed.pathname;
        searchParams = parsed.searchParams;
      } catch {
        pathname = (req.url || '/').split('?')[0];
      }

      // Hardware control API endpoints from phone companion app & backend (support both POST and GET)
      const isReleaseAction = req.method === 'POST' && (
        pathname === '/api/release' ||
        pathname === '/api/disconnect'
      );

      if (isReleaseAction) {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const targetPort = data.port || 'COM9';
            await serialService.disconnectPort(targetPort);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, released: targetPort }));
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: e.message }));
          }
        });
        return;
      }

      const isActionEndpoint = (
        pathname === '/api/action' ||
        pathname === '/api/serial' ||
        pathname === '/setSwitchStatus' ||
        pathname === '/api/setSwitchStatus' ||
        pathname === '/api/switch' ||
        pathname === '/device/control' ||
        pathname === '/api/device/control'
      );

      if (isActionEndpoint) {
        const executeAction = async (data) => {
          try {
            console.log(`[CompanionServer] Received ${req.method} ${pathname}:`, data);

            let targetPort = data.port;
            const active = Array.from(serialService.activePorts.keys());
            if (active.length > 0 && (!targetPort || !active.includes(targetPort))) {
              targetPort = active[0];
            }
            if (!targetPort) {
              try {
                const ports = await serialService.listPorts();
                const esp32Port = ports.find(p => p.recognized || /cp210|ch340|ftdi|usb/i.test(`${p.manufacturer || ''} ${p.friendlyName || ''}`)) || ports[0];
                if (esp32Port?.path) targetPort = esp32Port.path;
              } catch {}
            }
            if (!targetPort) targetPort = 'COM9';

            // Detect switch OFF states
            const isExplicitOff =
              data.SwitchStatus === 0 || data.SwitchStatus === false || data.SwitchStatus === '0' || String(data.SwitchStatus).toLowerCase() === 'off' ||
              data.status === 0 || data.status === false || data.status === '0' || String(data.status).toLowerCase() === 'off' ||
              data.state === 0 || data.state === false || data.state === '0' || String(data.state).toLowerCase() === 'off' ||
              data.value === 0 || data.value === false || data.value === '0' || String(data.value).toLowerCase() === 'off' ||
              (typeof data.payload === 'string' && (/LED:0|BLINK:0|0\b|OFF/i.test(data.payload)));

            // Detect switch ON states
            const isExplicitOn =
              data.SwitchStatus === 1 || data.SwitchStatus === true || data.SwitchStatus === '1' || String(data.SwitchStatus).toLowerCase() === 'on' ||
              data.status === 1 || data.status === true || data.status === '1' || String(data.status).toLowerCase() === 'on' ||
              data.state === 1 || data.state === true || data.state === '1' || String(data.state).toLowerCase() === 'on' ||
              data.value === 1 || data.value === true || data.value === '1' || String(data.value).toLowerCase() === 'on' ||
              (typeof data.payload === 'string' && (/LED:1|BLINK:1|1\b|ON/i.test(data.payload)));

            let payload = data.payload;
            if (isExplicitOff) {
              payload = 'LED:0\r\n';
            } else if (isExplicitOn) {
              payload = 'LED:1\r\n';
            } else if (!payload) {
              if (data.action) {
                payload = `${data.action}\r\n`;
              } else {
                payload = 'PING\r\n';
              }
            }

            if (!payload.endsWith('\n')) payload += '\r\n';

            console.log(`[CompanionServer] Dispatching to ${targetPort}:`, payload.trim());
            const writeResult = await serialService.writePort(targetPort, payload);

            // Multi-device synchronization: update state store in memory
            const widgetId = data.widgetId || 'w-led';
            if (isExplicitOff) {
              companionState.states[widgetId] = false;
              companionState.states['w-led'] = false;
            } else if (isExplicitOn) {
              companionState.states[widgetId] = true;
              companionState.states['w-led'] = true;
            } else if (data.value !== undefined) {
              companionState.states[widgetId] = data.value;
            }
            companionState.lastPayload = payload.trim();
            companionState.activePort = targetPort;

            // Broadcast to all connected phones (SSE stream)
            broadcastStateUpdate({
              port: targetPort,
              isOn: isExplicitOn,
              isOff: isExplicitOff,
              widgetId: widgetId,
              value: data.value
            });

            const mainWindow = getMainWindow();
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('companion:action', {
                port: targetPort,
                isOn: isExplicitOn,
                isOff: isExplicitOff,
                payload: payload.trim()
              });
            }

            // Image beacon support: return 1x1 transparent GIF if requested via <img>
            if (searchParams.has('_img') || req.headers.accept?.includes('image')) {
              const gif1x1 = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
              res.writeHead(200, { 'Content-Type': 'image/gif', 'Cache-Control': 'no-cache, no-store' });
              return res.end(gif1x1);
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({
              success: true,
              port: targetPort,
              payload: payload.trim(),
              writeResult,
              version: companionState.version,
              states: companionState.states
            }));
          } catch (err) {
            console.error('[CompanionServer] Error processing action:', err.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: err.message }));
          }
        };

        if (req.method === 'GET') {
          const queryData = Object.fromEntries(searchParams.entries());
          return await executeAction(queryData);
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          let data = {};
          if (body) {
            try {
              data = JSON.parse(body);
            } catch {
              try {
                data = Object.fromEntries(new URLSearchParams(body).entries());
              } catch {
                data = { payload: body };
              }
            }
          }
          for (const [k, v] of searchParams.entries()) {
            if (data[k] === undefined) data[k] = v;
          }
          await executeAction(data);
        });
        return;
      }

      // Server-Sent Events (SSE) Endpoint for Instant Multi-Device State Streaming
      if (pathname === '/api/events') {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*'
        });
        res.write(`data: ${JSON.stringify({
          version: companionState.version,
          lastUpdate: companionState.lastUpdate,
          states: companionState.states,
          lastPayload: companionState.lastPayload,
          activePort: companionState.activePort
        })}\n\n`);

        sseClients.add(res);
        req.on('close', () => {
          sseClients.delete(res);
        });
        return;
      }

      // Multi-Device Current State Endpoint (Polling Fallback)
      if (pathname === '/api/state') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: true,
          version: companionState.version,
          lastUpdate: companionState.lastUpdate,
          states: companionState.states,
          lastPayload: companionState.lastPayload,
          activePort: companionState.activePort,
          connectedClients: sseClients.size
        }));
      }

      // HTML update endpoint — allows React renderer to push a fresh companion app page
      if (req.method === 'POST' && pathname === '/api/update-html') {
        let htmlBody = '';
        req.on('data', chunk => { htmlBody += chunk; });
        req.on('end', () => {
          if (htmlBody) currentCompanionHtml = htmlBody;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, bytes: htmlBody.length }));
        });
        return;
      }

      if (pathname === '/api/status' || pathname === '/api/getSwitchStatus' || pathname === '/status') {
        const activePorts = Array.from(serialService.activePorts.keys());
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          activePorts,
          port: currentCompanionPort,
          ip: getLocalIPv4(),
          remoteUrl: currentRemoteUrl,
          tunnelActive: Boolean(currentRemoteUrl),
          version: companionState.version,
          states: companionState.states,
          success: true
        }));
      }

      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
      });
      res.end(currentCompanionHtml || '<h1>InnoIDE Companion App Loading...</h1>');
    });

    try {
      await new Promise((resolve, reject) => {
        companionServer.listen(currentCompanionPort, '0.0.0.0', () => resolve());
        companionServer.on('error', (err) => reject(err));
      });
    } catch (listenErr) {
      console.warn(`[CompanionServer] Port ${currentCompanionPort} in use, skipping creation:`, listenErr.message);
    }

    const ip = getLocalIPv4();
    return {
      success: true,
      url: `http://${ip}:${currentCompanionPort}`,
      ip,
      port: currentCompanionPort
    };
  }

  // Auto-start companion HTTP server on port 5055
  ensureCompanionServer(5055).catch(err => {
    console.warn('[CompanionServer] Auto-start notice:', err.message);
  });

  ipcMain.handle('app:start-companion-server', async (_event, { html, port = 5055 }) => {
    if (html) currentCompanionHtml = html;
    return await ensureCompanionServer(port);
  });

  ipcMain.handle('app:get-companion-info', async () => {
    const ip = getLocalIPv4();
    return {
      success: true,
      url: `http://${ip}:${currentCompanionPort}`,
      ip,
      port: currentCompanionPort
    };
  });

  ipcMain.handle('app:stop-companion-server', async () => {
    if (companionServer) {
      companionServer.close();
      companionServer = null;
    }
    await stopRemoteTunnel();
    return { success: true };
  });

  ipcMain.handle('app:start-remote-tunnel', async (_event, port = 5055, forceRestart = false) => {
    return await startRemoteTunnel(port, forceRestart);
  });

  ipcMain.handle('app:stop-remote-tunnel', async () => {
    return await stopRemoteTunnel();
  });

  ipcMain.handle('app:get-remote-tunnel', async () => {
    try {
      const statusFile = path.join(__dirname, '../../scratch/active_tunnel.json');
      if (fs.existsSync(statusFile)) {
        const raw = fs.readFileSync(statusFile, 'utf8');
        const data = JSON.parse(raw);
        const isFresh = data?.timestamp && (Date.now() - data.timestamp < 1000 * 60 * 15);
        if (data && data.active && data.url && isFresh) {
          currentRemoteUrl = data.url;
          remoteTunnelProvider = data.provider || 'localhost.run';
          return {
            active: true,
            url: data.url,
            provider: remoteTunnelProvider
          };
        }
      }
    } catch {}

    const isProcessAlive = remoteTunnelProcess && !remoteTunnelProcess.killed && remoteTunnelProcess.exitCode === null;
    return {
      active: Boolean(isProcessAlive && currentRemoteUrl),
      url: isProcessAlive ? currentRemoteUrl : '',
      provider: isProcessAlive ? remoteTunnelProvider : ''
    };
  });

  ipcMain.handle('app:create-expo-snack', async (_event, { name, code, description, sdkVersion = '54.0.0' }) => {
    try {
      const targetSdkVersion = sdkVersion || '54.0.0';
      const payload = JSON.stringify({
        manifest: {
          name: name || 'Companion App',
          description: description || 'IoT Companion App',
          sdkVersion: targetSdkVersion
        },
        code: {
          'App.js': { type: 'CODE', contents: code }
        },
        dependencies: {}
      });

      const response = await fetch('https://exp.host/--/api/v2/snack/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': String(Buffer.byteLength(payload))
        },
        body: payload
      });

      const data = await response.json();
      const id = data?.id || data?.snackId || data?.hashId;
      if (id) {
        return {
          success: true,
          id,
          webUrl: `https://snack.expo.dev/${id}?platform=web&preview=true&sdkVersion=${targetSdkVersion}`,
          expoGoUrl: `exp://exp.host/@snack/${id}`,
          snackChannelUrl: `exp://u.expo.dev/933fd9c0-1666-11e7-afcb-d9a0723853cd?snack=${id}`
        };
      }
      return { success: false, error: 'Failed to obtain snack ID', data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });
}

