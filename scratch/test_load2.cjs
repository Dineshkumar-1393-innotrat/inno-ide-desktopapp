const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

const logFile = 'D:\\ide-desktop-app\\scratch\\test_output.txt';
function log(...args) {
  fs.appendFileSync(logFile, args.join(' ') + '\n');
}

fs.writeFileSync(logFile, '--- START TEST ---\n');

app.whenReady().then(async () => {
  const asarPath = 'C:\\Users\\Dell 5530\\AppData\\Local\\Programs\\InnoIDE\\resources\\app.asar\\dist\\index.html';
  log('Testing asarPath:', asarPath);
  log('fs.existsSync(asarPath):', fs.existsSync(asarPath));
  
  const win = new BrowserWindow({ show: false });
  
  try {
    log('Attempting win.loadFile(asarPath)...');
    await win.loadFile(asarPath);
    log('win.loadFile(asarPath) SUCCEEDED!');
  } catch (err) {
    log('win.loadFile(asarPath) FAILED:', err.message);
  }

  try {
    const fileUrl = url.pathToFileURL(asarPath).href;
    log('Attempting win.loadURL(fileUrl):', fileUrl);
    await win.loadURL(fileUrl);
    log('win.loadURL(fileUrl) SUCCEEDED!');
  } catch (err) {
    log('win.loadURL(fileUrl) FAILED:', err.message);
  }

  app.quit();
});
