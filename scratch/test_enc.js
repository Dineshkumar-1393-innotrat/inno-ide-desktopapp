import { execSync } from 'child_process';

const psScript = `
$res = @()
try {
  $pnp = Get-CimInstance Win32_PnPEntity | Where-Object { $_.PNPClass -eq 'Ports' -or $_.Caption -match '\\(COM\\d+\\)' }
  foreach ($dev in $pnp) {
    if ($dev.Caption -match '\\((COM\\d+)\\)') {
      $res += [PSCustomObject]@{
        Path = $Matches[1]
        Name = $dev.Name
        PNPDeviceID = $dev.PNPDeviceID
        Manufacturer = $dev.Manufacturer
      }
    }
  }
} catch {}

try {
  if (Test-Path 'HKLM:\\HARDWARE\\DEVICEMAP\\SERIALCOMM') {
    $reg = Get-ItemProperty -Path 'HKLM:\\HARDWARE\\DEVICEMAP\\SERIALCOMM'
    $reg.PSObject.Properties | Where-Object { $_.Name -notmatch '^PS' } | ForEach-Object {
      $comPort = [string]$_.Value
      if (-not ($res | Where-Object { $_.Path -eq $comPort })) {
        $res += [PSCustomObject]@{
          Path = $comPort
          Name = ('Serial Port (' + $comPort + ')')
          PNPDeviceID = [string]$_.Name
          Manufacturer = ''
        }
      }
    }
  }
} catch {}

$res | ConvertTo-Json -Compress
`;

const enc = Buffer.from(psScript, 'utf16le').toString('base64');
const out = execSync(`powershell -NoProfile -NonInteractive -EncodedCommand ${enc}`, { encoding: 'utf8' });
console.log("EncodedCommand RESULT:", out);
