const cp = require('child_process');
try {
  const stdout = cp.execSync('wmic process where "name=\'node.exe\' or name=\'electron.exe\'" get ProcessId,CommandLine', { encoding: 'utf-8' });
  console.log(stdout);
} catch (e) {
  console.error(e.message);
}
