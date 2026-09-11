const { execSync } = require('child_process');
try {
  const out = execSync('powershell "Get-CimInstance Win32_Process | Where-Object { $_.Name -match \'node|python|electron\' } | Select-Object ProcessId, Name, CommandLine | Format-Table -AutoSize | Out-String -Width 4096"').toString();
  console.log(out);
} catch (e) {
  console.error(e);
}
