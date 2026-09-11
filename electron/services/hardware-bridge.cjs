// hardware-bridge.cjs — Standalone HTTP-to-Serial Hardware Bridge for InnoIDE Companion
const http = require('http');
const fs = require('fs');
const path = require('path');
const { SerialPort } = require('serialport');

const HTTP_PORT = 5056;
const DEFAULT_SERIAL_PORT = 'COM9';
const BAUD_RATE = 115200;

let currentLedState = false;
let companionHtml = '';

// Helper to write to serial port: proxies to Electron Companion Server (port 5055) first,
// then falls back to direct SerialPort if Electron is not running.
function writeSerialCommand(portPath, command) {
  return new Promise((resolve, reject) => {
    const target = portPath || DEFAULT_SERIAL_PORT;
    const cleanCmd = command.endsWith('\n') ? command : command + '\r\n';

    const isOff = cleanCmd.includes('LED:0') || cleanCmd.includes(':0') || cleanCmd.toLowerCase().includes('off');
    const bodyObj = JSON.stringify({
      payload: cleanCmd.trim(),
      port: target,
      SwitchStatus: isOff ? 0 : 1,
      value: !isOff
    });

    // PRIMARY: Proxy to Electron Companion Server (port 5055) — it has the already-open serial port.
    // This avoids the 'Access denied' error when Electron holds the port.
    const proxyReq = http.request({
      hostname: 'localhost',
      port: 5055,
      path: '/api/action',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyObj) }
    }, (proxyRes) => {
      let data = '';
      proxyRes.on('data', chunk => { data += chunk; });
      proxyRes.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed && parsed.success) {
            console.log(`[Bridge] Proxied to Electron companion (5055) -> ${target}: ${cleanCmd.trim()}`);
            currentLedState = !isOff;
            return resolve({ success: true, port: target, command: cleanCmd.trim(), via: 'electron-companion' });
          }
        } catch (e) {}
        // Proxy responded but not success, fall through to direct serial
        tryDirectSerial();
      });
    });

    proxyReq.on('error', () => {
      // Electron companion not reachable, try direct serial
      tryDirectSerial();
    });

    proxyReq.setTimeout(1500, () => {
      proxyReq.destroy();
      tryDirectSerial();
    });

    proxyReq.write(bodyObj);
    proxyReq.end();

    function tryDirectSerial() {
      const sp = new SerialPort({ path: target, baudRate: BAUD_RATE }, (err) => {
        if (err) {
          console.error(`[Bridge] Error opening ${target}:`, err.message);
          // Return partial success — proxy may have worked even if response wasn't detected
          return reject(err);
        }
        sp.write(cleanCmd, (writeErr) => {
          if (writeErr) {
            sp.close();
            return reject(writeErr);
          }
          console.log(`[Bridge] Direct serial -> ${target}: ${cleanCmd.trim()}`);
          currentLedState = !isOff;
          setTimeout(() => {
            sp.close(() => resolve({ success: true, port: target, command: cleanCmd.trim(), via: 'direct-serial' }));
          }, 80);
        });
      });
    }
  });
}

function getDefaultHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>projec-08-09 - IoT Companion App</title>
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
    .card { background: var(--card); border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 12px; border: 1px solid var(--border); transition: all 0.2s; }
    .card.active { border-color: #2563eb; background: #101a38; }
    .row { display: flex; align-items: center; justify-content: space-between; }
    .title { font-weight: 700; font-size: 15px; color: #f8fafc; }
    .meta { font-size: 12px; color: var(--subtext); margin-top: 2px; }
    .toggle { position: relative; width: 52px; height: 28px; }
    .toggle input { opacity: 0; width: 0; height: 0; }
    .slider-toggle { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: #334155; border-radius: 28px; transition: 0.3s; }
    .slider-toggle:before { position: absolute; content: ""; height: 22px; width: 22px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s; }
    input:checked + .slider-toggle { background: #0284c7; }
    input:checked + .slider-toggle:before { transform: translateX(24px); }
    .log-box { font-family: monospace; font-size: 11px; padding: 12px; border-radius: 14px; background: #090d16; color: #38bdf8; max-height: 180px; overflow-y: auto; border: 1px solid var(--border); display: flex; flex-direction: column; gap: 4px; }
  </style>
</head>
<body>
  <div class="phone">
    <div class="header">
      <div>
        <div class="brand-sub">InnoIDE Companion Bridge</div>
        <h1>🌱 projec-08-09</h1>
      </div>
      <div class="badge"><div class="badge-dot"></div> ESP32 (COM9)</div>
    </div>

    <!-- Live LED Switch Card -->
    <div class="card" id="ledCard">
      <div class="row">
        <div>
          <div class="title">LED Light Control</div>
          <div class="meta" id="ledStatus">Status: OFF • Tap to toggle</div>
        </div>
        <label class="toggle">
          <input type="checkbox" id="ledSwitch" onchange="toggleLed(this.checked)">
          <span class="slider-toggle"></span>
        </label>
      </div>
    </div>

    <!-- Telemetry & Response Console -->
    <div class="card">
      <div class="row">
        <div class="title">Live Hardware Console</div>
        <button onclick="document.getElementById('logs').innerHTML=''" style="background:#1e293b;color:#38bdf8;border:1px solid #334155;border-radius:6px;padding:3px 8px;font-size:10px;cursor:pointer;">Clear</button>
      </div>
      <div class="log-box" id="logs">
        <div>[System] Companion Bridge active on COM9.</div>
      </div>
    </div>
  </div>

  <script>
    function addLog(msg) {
      const el = document.getElementById('logs');
      const time = new Date().toLocaleTimeString();
      el.innerHTML += '<div>[' + time + '] ' + msg + '</div>';
      el.scrollTop = el.scrollHeight;
    }

    async function toggleLed(checked) {
      const card = document.getElementById('ledCard');
      const statusText = document.getElementById('ledStatus');
      if (checked) {
        card.classList.add('active');
        statusText.innerText = 'Status: BLINKING (ON)';
      } else {
        card.classList.remove('active');
        statusText.innerText = 'Status: OFF (STOPPED)';
      }

      addLog('📱 Switch flipped -> ' + (checked ? 'ON (Blink)' : 'OFF (Stop)'));
      const payload = checked ? 'LED:1' : 'LED:0';

      try {
        const res = await fetch('/api/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payload: payload, value: checked, SwitchStatus: checked ? 1 : 0, port: 'COM9' })
        });
        const data = await res.json();
        if (data.success) {
          addLog('🚀 [ESP32 COM9] Success -> ' + (checked ? 'Blinking ON' : 'Turned OFF'));
        } else {
          addLog('⚠️ [Error] ' + (data.error || 'Failed'));
        }
      } catch (err) {
        addLog('⚠️ Connection error: ' + err.message);
      }
    }
  </script>
</body>
</html>`;
}

const server = http.createServer(async (req, res) => {
  // CORS & Chrome Private Network Access (PNA) Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Private-Network': 'true'
    });
    return res.end();
  }

  if (req.method === 'GET') {
    if (req.url === '/' || req.url === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(companionHtml || getDefaultHtml());
    }

    if (req.url === '/status' || req.url === '/api/status' || req.url === '/api/getSwitchStatus') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        online: true,
        port: DEFAULT_SERIAL_PORT,
        ledState: currentLedState,
        serverTime: new Date().toISOString()
      }));
    }
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        if (req.url === '/api/update-html') {
          companionHtml = body;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, bytes: body.length }));
        }

        const data = JSON.parse(body || '{}');
        console.log(`[Bridge] Received ${req.url}:`, data);

        let targetPort = data.port || DEFAULT_SERIAL_PORT;
        let payload = data.payload;

        // Detect switch OFF states
        const isExplicitOff =
          data.SwitchStatus === 0 || data.SwitchStatus === false || data.SwitchStatus === '0' || String(data.SwitchStatus).toLowerCase() === 'off' ||
          data.status === 0 || data.status === false || data.status === '0' || String(data.status).toLowerCase() === 'off' ||
          data.state === 0 || data.state === false || data.state === '0' || String(data.state).toLowerCase() === 'off' ||
          data.value === 0 || data.value === false || data.value === '0' || String(data.value).toLowerCase() === 'off';

        // Detect switch ON states
        const isExplicitOn =
          data.SwitchStatus === 1 || data.SwitchStatus === true || data.SwitchStatus === '1' || String(data.SwitchStatus).toLowerCase() === 'on' ||
          data.status === 1 || data.status === true || data.status === '1' || String(data.status).toLowerCase() === 'on' ||
          data.state === 1 || data.state === true || data.state === '1' || String(data.state).toLowerCase() === 'on' ||
          data.value === 1 || data.value === true || data.value === '1' || String(data.value).toLowerCase() === 'on';

        if (!payload) {
          if (isExplicitOff) {
            payload = 'LED:0\r\n';
            currentLedState = false;
          } else if (isExplicitOn) {
            payload = 'LED:1\r\n';
            currentLedState = true;
          } else if (data.action) {
            payload = `${data.action}\r\n`;
          } else {
            payload = 'PING\r\n';
          }
        } else {
          if (payload.includes('LED:0') || payload.includes('OFF') || payload.trim() === '0') {
            currentLedState = false;
          } else if (payload.includes('LED:1') || payload.includes('ON') || payload.trim() === '1') {
            currentLedState = true;
          }
        }

        const result = await writeSerialCommand(targetPort, payload);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, ledState: currentLedState, result }));
      } catch (err) {
        console.error('[Bridge] Error:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(HTTP_PORT, '0.0.0.0', () => {
  console.log(`[Bridge] Hardware Bridge Server listening on http://0.0.0.0:${HTTP_PORT}`);
  console.log(`[Bridge] Linked to hardware serial target: ${DEFAULT_SERIAL_PORT}`);
});
