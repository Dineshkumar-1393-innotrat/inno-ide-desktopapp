const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const STATUS_FILE = path.join(__dirname, 'active_tunnel.json');

let currentProc = null;
let consecutiveFailures = 0;

function cleanupStatus() {
  try {
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

function startTunnel() {
  const useServeo = consecutiveFailures >= 2;
  const targetHost = useServeo ? 'serveo.net' : 'nokey@localhost.run';
  const providerName = useServeo ? 'serveo' : 'localhost.run';

  console.log(`[TunnelDaemon] Starting SSH tunnel via ${providerName} (${targetHost}) for port 5055...`);

  const proc = spawn('ssh', [
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'ServerAliveInterval=15',
    '-o', 'ServerAliveCountMax=4',
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
      consecutiveFailures = 0;
      console.log('>>> [LIVE CLOUD TUNNEL URL]: ' + activeUrl + ' <<<');
      fs.writeFileSync(STATUS_FILE, JSON.stringify({
        url: activeUrl,
        timestamp: Date.now(),
        active: true,
        provider: providerName
      }, null, 2));
    }
  };

  proc.stdout.on('data', handleOutput);
  proc.stderr.on('data', handleOutput);

  proc.on('close', (code) => {
    currentProc = null;
    console.warn(`[TunnelDaemon] SSH tunnel exited with code ${code}. Auto-restarting in 2s...`);
    consecutiveFailures++;
    cleanupStatus();
    setTimeout(startTunnel, 2000);
  });

  proc.on('error', (err) => {
    console.error('[TunnelDaemon] SSH error:', err.message);
    consecutiveFailures++;
  });
}

startTunnel();
