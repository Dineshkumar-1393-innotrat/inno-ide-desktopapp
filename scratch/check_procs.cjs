const { execSync } = require('child_process');

try {
  const out = execSync('powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"name = \'electron.exe\'\\" | Select-Object ProcessId, ParentProcessId, CommandLine | ConvertTo-Json -Compress"', { encoding: 'utf8' });
  console.log(out);
} catch (e) {
  console.error(e.message);
}
