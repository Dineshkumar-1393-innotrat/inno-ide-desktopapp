const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const STATUS_FILE = path.join(__dirname, 'active_tunnel.json');

let currentProc = null;
let consecutiveFailures = 0;

function cleanupStatus() {
  try {
    if (fs.existsSync(STATUS_FILE)) {
      try {
        const cur = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
        if (cur && cur.active === false && cur.url === '') {
          return;
        }
      } catch {}
    }
    fs.writeFileSync(STATUS_FILE, JSON.stringify({
      url: '',
      timestamp: Date.now(),
      active: false
    }, null, 2));
  } catch {}
}

process.on('SIGINT', () => {
  cleanupStatus();
  if (currentProc) { try { currentProc.kill(); } catch {} }
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanupStatus();
  if (currentProc) { try { currentProc.kill(); } catch {} }
  process.exit(0);
});

process.on('exit', () => {
  cleanupStatus();
});

let stabilityTimer = null;

function startTunnel() {
  // Rotate providers if repeated drops occur: 0-1: localhost.run, 2-3: serveo.net, 4+: alternate
  const useServeo = (consecutiveFailures >= 2 && consecutiveFailures % 4 < 2);
  const targetHost = useServeo ? 'serveo.net' : 'nokey@localhost.run';
  const providerName = useServeo ? 'serveo' : 'localhost.run';

  console.log(`[TunnelDaemon] Starting SSH tunnel via ${providerName} (${targetHost}) for port 5055 (attempt ${consecutiveFailures + 1})...`);

  if (currentProc) {
    try { currentProc.kill(); } catch {}
    currentProc = null;
  }

  const proc = spawn('ssh', [
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'ServerAliveInterval=15',
    '-o', 'ServerAliveCountMax=3',
    '-o', 'TCPKeepAlive=yes',
    '-o', 'ExitOnForwardFailure=yes',
    '-R', '80:127.0.0.1:5055',
    targetHost
  ]);

  currentProc = proc;
  let activeUrl = null;

  const handleOutput = (chunk) => {
    const text = chunk.toString();
    const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.(?:lhr\.life|serveousercontent\.com|serveo\.net)/i);
    if (match && (!activeUrl || activeUrl !== match[0])) {
      activeUrl = match[0];
      console.log('>>> [LIVE CLOUD TUNNEL URL]: ' + activeUrl + ' <<<');
      fs.writeFileSync(STATUS_FILE, JSON.stringify({
        url: activeUrl,
        timestamp: Date.now(),
        active: true,
        provider: providerName
      }, null, 2));

      // Only mark tunnel as fully stable after remaining connected for 1 minute (60s)
      if (stabilityTimer) clearTimeout(stabilityTimer);
      stabilityTimer = setTimeout(() => {
        if (currentProc === proc) {
          console.log(`[TunnelDaemon] Tunnel via ${providerName} is stable (uptime > 60s).`);
          consecutiveFailures = 0;
        }
      }, 60000);
    }
  };

  proc.stdout.on('data', handleOutput);
  proc.stderr.on('data', handleOutput);

  proc.on('close', (code) => {
    if (currentProc === proc) {
      currentProc = null;
    }
    if (stabilityTimer) clearTimeout(stabilityTimer);
    consecutiveFailures++;
    cleanupStatus();

    const delay = Math.min(2000 + (consecutiveFailures * 1500), 12000);
    console.warn(`[TunnelDaemon] SSH tunnel exited with code ${code}. Reconnecting via ${useServeo ? 'serveo' : 'localhost.run'} in ${delay / 1000}s...`);
    setTimeout(startTunnel, delay);
  });

  proc.on('error', (err) => {
    console.error('[TunnelDaemon] SSH error:', err.message);
    if (stabilityTimer) clearTimeout(stabilityTimer);
    consecutiveFailures++;
  });
}

startTunnel();
