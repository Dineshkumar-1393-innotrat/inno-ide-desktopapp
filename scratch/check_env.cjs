const cp = require('child_process');
try {
  const out = cp.execSync('cmd.exe /c "set IDF_PATH=D:\\ESP-IDF && call D:\\ESP-IDF\\export.bat > nul && set"', {
    cwd: 'D:\\ESP-IDF',
    encoding: 'utf-8'
  });
  const env = {};
  out.split('\r\n').forEach(l => {
    const i = l.indexOf('=');
    if (i > 0) env[l.substring(0, i)] = l.substring(i + 1);
  });
  console.log('IDF_PATH:', env.IDF_PATH);
  console.log('IDF_PYTHON_ENV_PATH:', env.IDF_PYTHON_ENV_PATH);
  console.log('IDF_TOOLS_PATH:', env.IDF_TOOLS_PATH);
  console.log('PATH has python:', env.PATH && env.PATH.includes('python'));
} catch (e) {
  console.error(e);
}
