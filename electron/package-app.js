import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();
const stagingDir = path.join(rootDir, 'release-staging');
const releaseDir = path.join(rootDir, 'release');
const winUnpackedDir = path.join(releaseDir, 'win-unpacked');
const electronDistDir = path.join(rootDir, 'node_modules', 'electron', 'dist');

console.log('--- InnoView IDE Executable Packager ---');

// 1. Ensure win-unpacked directory has Electron distribution
if (!fs.existsSync(winUnpackedDir)) {
  fs.mkdirSync(winUnpackedDir, { recursive: true });
}

console.log('1. Copying Electron runtime binaries...');
// Copy electron runtime files into win-unpacked
fs.cpSync(electronDistDir, winUnpackedDir, { recursive: true, overwrite: false });

// 2. Prepare staging folder for app.asar
console.log('2. Preparing application bundle staging...');
if (fs.existsSync(stagingDir)) {
  fs.rmSync(stagingDir, { recursive: true, force: true });
}
fs.mkdirSync(stagingDir, { recursive: true });

// Copy dist and electron
fs.cpSync(path.join(rootDir, 'dist'), path.join(stagingDir, 'dist'), { recursive: true });
fs.cpSync(path.join(rootDir, 'electron'), path.join(stagingDir, 'electron'), { recursive: true });

// Minimal runtime package.json
const runtimePkg = {
  name: 'innotrat-texteditor',
  productName: 'InnoView IDE',
  version: '1.0.0',
  description: 'InnoView IDE Desktop Application',
  main: 'electron/main.js',
  type: 'module'
};
fs.writeFileSync(path.join(stagingDir, 'package.json'), JSON.stringify(runtimePkg, null, 2), 'utf-8');

// 3. Pack staging directory into app.asar
const resourcesDir = path.join(winUnpackedDir, 'resources');
if (!fs.existsSync(resourcesDir)) {
  fs.mkdirSync(resourcesDir, { recursive: true });
}
const appAsarPath = path.join(resourcesDir, 'app.asar');
console.log('3. Generating app.asar with asar...');
execSync(`npx asar pack "${stagingDir}" "${appAsarPath}"`, { stdio: 'inherit' });

// Remove default_app.asar to keep resources clean
const defaultAppAsar = path.join(resourcesDir, 'default_app.asar');
if (fs.existsSync(defaultAppAsar)) {
  try {
    fs.rmSync(defaultAppAsar, { force: true });
  } catch {
    // ignore
  }
}

// 4. Create InnoViewIDE.exe executable in win-unpacked
const electronExe = path.join(winUnpackedDir, 'electron.exe');
const innoviewExe = path.join(winUnpackedDir, 'InnoViewIDE.exe');
if (fs.existsSync(electronExe)) {
  fs.copyFileSync(electronExe, innoviewExe);
  console.log(`4. Created standalone executable: ${innoviewExe}`);
}

// 5. Clean up staging folder
fs.rmSync(stagingDir, { recursive: true, force: true });

console.log('--- Packaging Complete! ---');
console.log(`Executable located at: ${innoviewExe}`);
