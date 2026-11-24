const { app, BrowserWindow } = require('electron');
const fs = require('fs');

const outFile = 'D:\\ide-desktop-app\\scratch\\dom_inspect.txt';
fs.writeFileSync(outFile, '--- START DOM INSPECTION ---\n');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    show: false,
    webPreferences: {
      preload: 'C:\\Users\\Dell 5530\\AppData\\Local\\Programs\\InnoIDE\\resources\\app.asar\\electron\\preload.cjs',
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.webContents.on('console-message', (e, level, msg) => {
    fs.appendFileSync(outFile, `[Console L${level}] ${msg}\n`);
  });

  const indexPath = 'C:\\Users\\Dell 5530\\AppData\\Local\\Programs\\InnoIDE\\resources\\app.asar\\dist\\index.html';
  await win.loadFile(indexPath);

  await new Promise(r => setTimeout(r, 4000));

  const dom = await win.webContents.executeJavaScript('document.body.innerHTML');
  const url = win.webContents.getURL();

  fs.appendFileSync(outFile, `URL: ${url}\nDOM Length: ${dom.length}\nDOM Preview: ${dom.slice(0, 1500)}\n`);
  
  app.quit();
});
