import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const releaseDir = path.resolve('release');

if (fs.existsSync(releaseDir)) {
  try {
    fs.rmSync(releaseDir, { recursive: true, force: true });
  } catch (e) {
    console.log('Cleanup warning:', e.message);
  }
}

console.log('Starting electron-builder...');
try {
  execSync('npx electron-builder --win', { stdio: 'inherit' });
} catch (err) {
  console.error('Build execution error:', err.message);
  process.exit(1);
}
