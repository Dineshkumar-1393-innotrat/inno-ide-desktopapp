const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

app.whenReady().then(async () => {
  const asarPath = 'C:\\Users\\Dell 5530\\AppData\\Local\\Programs\\InnoIDE\\resources\\app.asar\\dist\\index.html';
  console.log('Testing asarPath:', asarPath);
  
  const win = new BrowserWindow({ show: false });
  
  try {
    console.log('Attempting win.loadFile(asarPath)...');
    await win.loadFile(asarPath);
    console.log('loadFile succeeded!');
  } catch (err) {
    console.error('loadFile failed:', err.message);
  }

  try {
    const fileUrl = url.pathToFileURL(asarPath).href;
    console.log('Attempting win.loadURL(fileUrl):', fileUrl);
    await win.loadURL(fileUrl);
    console.log('loadURL with pathToFileURL succeeded!');
  } catch (err) {
    console.error('loadURL failed:', err.message);
  }

  try {
    console.log('Attempting win.loadFile relative to app.getAppPath()...');
    console.log('Current app.getAppPath():', app.getAppPath());
  } catch (err) {
    console.error(err);
  }

  app.quit();
});
