const { spawn, execSync } = require('child_process');
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('HELLO FROM ESP32 COMPANION SERVER');
});

server.listen(5055, () => {
  console.log('Local server listening on 5055');
  const proc = spawn('ssh', [
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'ServerAliveInterval=15',
    '-o', 'ServerAliveCountMax=3',
    '-R', '80:127.0.0.1:5055',
    'nokey@localhost.run'
  ]);

  let foundUrl = null;
  const check = (chunk) => {
    const text = chunk.toString();
    const m = text.match(/https:\/\/[a-zA-Z0-9-]+\.lhr\.life/i);
    if (m && !foundUrl) {
      foundUrl = m[0];
      console.log('Found tunnel URL:', foundUrl);
      setTimeout(() => {
        try {
          const out = execSync('curl.exe -s -i ' + foundUrl).toString();
          console.log('CURL RESULT:\n' + out);
        } catch (e) {
          console.log('CURL ERROR:', e.message);
        }
        proc.kill();
        server.close();
        process.exit(0);
      }, 3000);
    }
  };

  proc.stdout.on('data', check);
  proc.stderr.on('data', check);
  proc.on('close', (code) => {
    console.log('SSH closed with code', code);
    server.close();
  });
});
