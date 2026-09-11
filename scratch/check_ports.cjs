const { execSync } = require('child_process');

try {
  console.log('InnoIDEBackend:');
  console.log(execSync('powershell -NoProfile -Command "Get-ChildItem -Path d:\\InnoIDEBackend -Recurse -File -Exclude node_modules,*git* | Select-String -Pattern \'COM9|SerialPort\' | Select-Object -First 10 | ForEach-Object { $_.Path + \':\' + $_.LineNumber }" ', { encoding: 'utf8' }));
} catch (e) {
  console.error(e.message);
}

try {
  console.log('flash-code:');
  console.log(execSync('powershell -NoProfile -Command "Get-ChildItem -Path d:\\flash-code -Recurse -File -Exclude node_modules,*git* | Select-String -Pattern \'COM9|SerialPort\' | Select-Object -First 10 | ForEach-Object { $_.Path + \':\' + $_.LineNumber }" ', { encoding: 'utf8' }));
} catch (e) {
  console.error(e.message);
}
