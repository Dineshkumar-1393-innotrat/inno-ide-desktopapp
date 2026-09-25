import { execSync } from 'child_process';
import { SerialPort } from 'serialport';

console.log("=== Node SerialPort.list() ===");
try {
  const ports = await SerialPort.list();
  console.log(JSON.stringify(ports, null, 2));
} catch (e) {
  console.error(e);
}

console.log("\n=== Windows CIM Win32_PnPEntity ===");
try {
  const psCmd = `Get-CimInstance Win32_PnPEntity | Where-Object { $_.PNPClass -eq 'Ports' -or $_.Caption -match '\\(COM\\d+\\)' } | Select-Object Caption, DeviceID, PNPDeviceID, Manufacturer, Description | ConvertTo-Json -Compress`;
  const out = execSync(`powershell -NoProfile -NonInteractive -Command "${psCmd}"`, { encoding: 'utf8', timeout: 5000 });
  console.log("CIM Output:", out);
} catch (e) {
  console.error("CIM error:", e.message);
}

console.log("\n=== Registry SERIALCOMM ===");
try {
  const regCmd = `Get-ItemProperty -Path 'HKLM:\\HARDWARE\\DEVICEMAP\\SERIALCOMM' -ErrorAction SilentlyContinue | ConvertTo-Json -Compress`;
  const out2 = execSync(`powershell -NoProfile -NonInteractive -Command "${regCmd}"`, { encoding: 'utf8', timeout: 5000 });
  console.log("REG Output:", out2);
} catch (e) {
  console.error("REG error:", e.message);
}
