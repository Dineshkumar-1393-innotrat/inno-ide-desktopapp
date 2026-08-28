import { spawn, exec, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { app, dialog } from 'electron';
import { logger } from '../utils/logger.js';
import { serialService } from './serial.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_TARGETS = ['esp32', 'esp32c2', 'esp32c3', 'esp32c6', 'esp32s2', 'esp32s3'];
const PORT_REGEX = /^(COM\d+|\/dev\/tty(USB|ACM)\d+|\/dev\/cu\..+)$/i;

export class FlashService {
  constructor() {
    this.pipelineProcess = null;
    this.monitorProcess = null;
    this.projectDir = path.resolve(__dirname, '../../');
    this.pythonScript = path.resolve(__dirname, '../../python/flash_agent.py');
    this.configFilePath = null;
    this.preparedEnv = null;
    this.discoveredIdf = null;
    this.knownPorts = new Set();
    this.portMonitorInterval = null;
  }

  getConfigFilePath() {
    if (!this.configFilePath) {
      try {
        const userData = app.getPath('userData');
        this.configFilePath = path.join(userData, 'flash_config.json');
      } catch {
        this.configFilePath = path.join(this.projectDir, 'flash_config.json');
      }
    }
    return this.configFilePath;
  }

  loadConfig() {
    try {
      const configPath = this.getConfigFilePath();
      if (fs.existsSync(configPath)) {
        const raw = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      logger.warn('Failed loading flash_config.json:', err.message);
    }
    return { espIdfPath: '' };
  }

  saveConfig(config) {
    try {
      const configPath = this.getConfigFilePath();
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
      logger.info('Saved flash_config.json:', config);
      this.preparedEnv = null; // Reset prepared env so it re-initializes
      return { success: true };
    } catch (err) {
      logger.error('Failed saving flash_config.json:', err.message);
      return { success: false, message: err.message };
    }
  }

  validateTarget(target) {
    if (!target || !ALLOWED_TARGETS.includes(target.toLowerCase())) {
      throw new Error(`Invalid target '${target}'. Allowed targets: ${ALLOWED_TARGETS.join(', ')}`);
    }
    return target.toLowerCase();
  }

  validatePort(port) {
    if (!port || typeof port !== 'string' || !PORT_REGEX.test(port.trim())) {
      throw new Error(`Invalid serial port '${port}'. Must be a valid COM or /dev/tty port.`);
    }
    return port.trim();
  }

  validateUrl(url) {
    if (!url || typeof url !== 'string') {
      return 'http://localhost:5010/check-code';
    }
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('URL must use http or https protocol.');
      }
      return url;
    } catch {
      throw new Error(`Invalid URL format: ${url}`);
    }
  }

  /**
   * Discover ESP-IDF installation directory on Windows/Linux/macOS
   */
  discoverEspIdf() {
    const config = this.loadConfig();
    const candidates = [];

    // 1. Saved custom path
    if (config.espIdfPath && fs.existsSync(config.espIdfPath)) {
      candidates.push(config.espIdfPath);
    }

    // 2. IDF_PATH environment variable
    if (process.env.IDF_PATH && fs.existsSync(process.env.IDF_PATH)) {
      candidates.push(process.env.IDF_PATH);
    }

    // 3. Standard Espressif framework paths on Windows
    const home = os.homedir();
    const commonPaths = [
      'C:\\Espressif\\frameworks\\esp-idf-v5.3',
      'C:\\Espressif\\frameworks\\esp-idf-v5.2.2',
      'C:\\Espressif\\frameworks\\esp-idf-v5.2.1',
      'C:\\Espressif\\frameworks\\esp-idf-v5.2',
      'C:\\Espressif\\frameworks\\esp-idf-v5.1.4',
      'C:\\Espressif\\frameworks\\esp-idf-v5.1.2',
      'C:\\Espressif\\frameworks\\esp-idf-v5.1.1',
      'C:\\Espressif\\frameworks\\esp-idf-v5.1',
      'C:\\Espressif\\frameworks\\esp-idf-v5.0.4',
      'C:\\Espressif\\frameworks\\esp-idf-v5.0',
      'C:\\Espressif\\frameworks\\esp-idf-v4.4',
      'C:\\Espressif\\frameworks\\esp-idf',
      'C:\\esp-idf',
      'D:\\Espressif\\frameworks\\esp-idf-v5.3',
      'D:\\Espressif\\frameworks\\esp-idf-v5.2',
      'D:\\Espressif\\frameworks\\esp-idf-v5.1',
      'D:\\Espressif\\frameworks\\esp-idf-v5.0',
      'D:\\Espressif\\esp-idf',
      'D:\\esp-idf',
      path.join(home, 'esp', 'esp-idf'),
      path.join(home, '.espressif', 'esp-idf'),
      path.join(home, 'Desktop', 'esp-idf')
    ];

    // Scan C:\Espressif\frameworks and D:\Espressif\frameworks dynamically if existing
    ['C:\\Espressif\\frameworks', 'D:\\Espressif\\frameworks'].forEach(baseDir => {
      if (fs.existsSync(baseDir)) {
        try {
          const entries = fs.readdirSync(baseDir);
          for (const entry of entries) {
            if (entry.startsWith('esp-idf')) {
              commonPaths.unshift(path.join(baseDir, entry));
            }
          }
        } catch (e) {
          logger.warn(`Error reading ${baseDir}:`, e.message);
        }
      }
    });

    candidates.push(...commonPaths);

    for (const cand of candidates) {
      if (cand && fs.existsSync(cand)) {
        const exportBat = path.join(cand, 'export.bat');
        const idfPy = path.join(cand, 'tools', 'idf.py');
        const rootCMake = path.join(cand, 'tools', 'cmake', 'project.cmake');

        if (fs.existsSync(exportBat) || fs.existsSync(idfPy) || fs.existsSync(rootCMake)) {
          return {
            found: true,
            idfPath: cand,
            exportBat: fs.existsSync(exportBat) ? exportBat : null,
            idfPy: fs.existsSync(idfPy) ? idfPy : null
          };
        }
      }
    }

    return {
      found: false,
      message: 'No ESP-IDF installation found in standard paths. Please configure the ESP-IDF path in application settings.'
    };
  }

  /**
   * Run export.bat to capture the authoritative ESP-IDF environment variables
   */
  initializeEspIdf(customPath = null) {
    if (this.preparedEnv && !customPath) {
      return this.preparedEnv;
    }

    const discovery = customPath
      ? { found: true, idfPath: customPath, exportBat: path.join(customPath, 'export.bat'), idfPy: path.join(customPath, 'tools', 'idf.py') }
      : this.discoverEspIdf();

    if (!discovery.found) {
      logger.warn('ESP-IDF not discovered. Falling back to system environment.');
      this.preparedEnv = { ...process.env };
      this.discoveredIdf = discovery;
      return this.preparedEnv;
    }

    this.discoveredIdf = discovery;
    const idfPath = discovery.idfPath;
    const exportBat = discovery.exportBat;

    logger.info(`Initializing ESP-IDF environment from: ${idfPath}`);

    if (process.platform === 'win32' && exportBat && fs.existsSync(exportBat)) {
      try {
        // Execute cmd.exe /c "call <export.bat> && set" to capture environment output
        const cmd = `cmd.exe /c "set \"IDF_PATH=${idfPath}\" && call \"${exportBat}\" > nul && set"`;
        const stdout = execSync(cmd, { cwd: idfPath, encoding: 'utf-8', timeout: 20000 });

        const env = {};
        const lines = stdout.split('\r\n');
        for (const line of lines) {
          const idx = line.indexOf('=');
          if (idx > 0) {
            const key = line.substring(0, idx);
            const value = line.substring(idx + 1);
            env[key] = value;
          }
        }

        // Ensure IDF_PATH is explicitly set
        env.IDF_PATH = idfPath;
        this.preparedEnv = env;
        logger.info('Successfully captured ESP-IDF environment via export.bat!');
        return this.preparedEnv;
      } catch (err) {
        logger.error('Failed capturing export.bat output:', err.message);
      }
    }

    // Fallback environment construction
    const env = { ...process.env, IDF_PATH: idfPath };
    this.preparedEnv = env;
    return this.preparedEnv;
  }

  /**
   * Helper to execute a CLI tool with prepared environment and return stdout/error
   */
  _checkTool(command, args, env) {
    return new Promise(resolve => {
      try {
        const proc = spawn(command, args, { env, shell: process.platform === 'win32' });
        let out = '';
        let errOut = '';

        proc.stdout?.on('data', data => { out += data.toString('utf8'); });
        proc.stderr?.on('data', data => { errOut += data.toString('utf8'); });

        proc.on('close', code => {
          if (code === 0) {
            resolve({ found: true, output: out.trim() || errOut.trim() });
          } else {
            resolve({ found: false, error: errOut.trim() || `Exit code ${code}` });
          }
        });

        proc.on('error', err => {
          resolve({ found: false, error: err.message });
        });
      } catch (err) {
        resolve({ found: false, error: err.message });
      }
    });
  }

  /**
   * Complete toolchain environment check
   */
  async checkEnvironment(target = 'esp32c6', port = '') {
    const validTarget = this.validateTarget(target);
    const env = this.initializeEspIdf();
    const ports = await serialService.listPorts();

    // Check Python
    const pyCheck = await this._checkTool('python', ['--version'], env);
    const pythonInfo = {
      found: pyCheck.found,
      version: (pyCheck.output || pyCheck.error || '').split('\n')[0] || ''
    };

    // Check idf.py
    const idfCheck = await this._checkTool('idf.py', ['--version'], env);
    const idfPyInfo = {
      found: idfCheck.found,
      path: this.discoveredIdf?.idfPy || '',
      version: (idfCheck.output || idfCheck.error || '').split('\n')[0] || ''
    };

    // Check CMake
    const cmakeCheck = await this._checkTool('cmake', ['--version'], env);
    const cmakeInfo = {
      found: cmakeCheck.found,
      version: (cmakeCheck.output || cmakeCheck.error || '').split('\n')[0] || ''
    };

    // Check Ninja
    const ninjaCheck = await this._checkTool('ninja', ['--version'], env);
    const ninjaInfo = {
      found: ninjaCheck.found,
      version: (ninjaCheck.output || ninjaCheck.error || '').split('\n')[0] || ''
    };

    // Check esptool
    const esptoolCheck = await this._checkTool('esptool.py', ['version'], env);
    const esptoolInfo = {
      found: esptoolCheck.found || idfCheck.found // esptool is bundled with idf.py
    };

    // Check port accessibility
    let portAccessibility = { openable: true };
    if (port && /^COM\d+$/i.test(port)) {
      portAccessibility = await serialService.testPortOpen(port);
    }

    const isReady = Boolean(pythonInfo.found && idfPyInfo.found && this.discoveredIdf?.found);

    return {
      python: pythonInfo,
      espIdf: {
        found: Boolean(this.discoveredIdf?.found),
        path: this.discoveredIdf?.idfPath || ''
      },
      idfPy: idfPyInfo,
      cmake: cmakeInfo,
      ninja: ninjaInfo,
      esptool: esptoolInfo,
      target: { valid: true, value: validTarget },
      port: { valid: Boolean(port), value: port, available: ports, ...portAccessibility },
      ready: isReady
    };
  }

  startPortMonitoring(getMainWindow) {
    if (this.portMonitorInterval) return;

    this.portMonitorInterval = setInterval(async () => {
      try {
        const ports = await serialService.listPorts();
        const currentPathSet = new Set(ports.map(p => p.path));

        const mainWindow = typeof getMainWindow === 'function' ? getMainWindow() : null;

        // Detect connected ports
        for (const p of ports) {
          if (!this.knownPorts.has(p.path)) {
            logger.info(`[Serial] 🔌 USB device connected: ${p.path}`);
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('flash:event', {
                processType: 'system',
                status: 'port_connected',
                stream: 'system',
                port: p.path,
                ports: ports,
                log: `[Serial] 🔌 USB Device Connected: ${p.path}`
              });
            }
          }
        }

        // Detect disconnected ports
        for (const oldPath of this.knownPorts) {
          if (!currentPathSet.has(oldPath)) {
            logger.info(`[Serial] ❌ USB device disconnected: ${oldPath}`);
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('flash:event', {
                processType: 'system',
                status: 'port_disconnected',
                stream: 'system',
                port: oldPath,
                ports: ports,
                log: `[Serial] ❌ USB Device Disconnected: ${oldPath}`
              });
            }
          }
        }

        this.knownPorts = currentPathSet;
      } catch (err) {
        logger.warn('Port monitoring error:', err.message);
      }
    }, 1500);
  }

  async detectPorts(getMainWindow, verbose = false) {
    const ports = await serialService.listPorts();

    if (verbose) {
      const mainWindow = typeof getMainWindow === 'function' ? getMainWindow() : null;
      if (mainWindow && !mainWindow.isDestroyed()) {
        const text = ports.length > 0
          ? `[Serial] Found ${ports.length} device(s): ${ports.map(p => p.path).join(', ')}`
          : '[Serial] No serial devices detected.';
        mainWindow.webContents.send('flash:event', {
          processType: 'system',
          status: 'system_log',
          stream: 'system',
          log: text
        });
      }
    }

    return ports;
  }

  async testPort(portPath) {
    return await serialService.testPortOpen(portPath);
  }

  async runPipeline({ port, target = 'esp32s3', apiUrl = 'http://localhost:5010/check-code', code = null }, getMainWindow) {
    if (this.monitorProcess) {
      logger.info('Stopping active serial monitor process before starting flash pipeline...');
      this.stopMonitor();
    }

    if (this.pipelineProcess) {
      if (this.pipelineProcess.exitCode !== null || this.pipelineProcess.signalCode !== null || this.pipelineProcess.killed) {
        this.pipelineProcess = null;
      } else {
        try {
          // Check if process PID is actually alive on the system
          process.kill(this.pipelineProcess.pid, 0);
          logger.warn(`Cancelling existing flash pipeline (PID: ${this.pipelineProcess.pid}) to start new flash request...`);
          this.cancelPipeline();
        } catch {
          this.pipelineProcess = null;
        }
      }
    }

    // Write source code if provided directly
    if (code && typeof code === 'string' && code.trim()) {
      try {
        const mainDir = path.join(this.projectDir, 'main');
        if (!fs.existsSync(mainDir)) fs.mkdirSync(mainDir, { recursive: true });

        const mainCPath = path.join(mainDir, 'main.c');
        const mainCmakePath = path.join(mainDir, 'CMakeLists.txt');
        const rootCmakePath = path.join(this.projectDir, 'CMakeLists.txt');

        fs.writeFileSync(mainCPath, code.replace(/\r\n/g, '\n'), 'utf-8');
        logger.info(`Wrote active source code to ${mainCPath}`);

        const isLedStripUsed = code.includes('led_strip.h') || code.includes('led_strip');
        const idfComponentYml = path.join(mainDir, 'idf_component.yml');
        if (isLedStripUsed && !fs.existsSync(idfComponentYml)) {
          fs.writeFileSync(idfComponentYml, 'dependencies:\n  espressif/led_strip: "^3.0.0"\n', 'utf-8');
        }

        const requiresStr = isLedStripUsed
          ? 'REQUIRES led_strip esp_driver_rmt esp_driver_gpio driver'
          : 'REQUIRES esp_driver_rmt esp_driver_gpio driver';

        fs.writeFileSync(mainCmakePath, `idf_component_register(SRCS "main.c"\n                    INCLUDE_DIRS "."\n                    ${requiresStr})\n`, 'utf-8');

        if (!fs.existsSync(rootCmakePath)) {
          fs.writeFileSync(rootCmakePath, 'cmake_minimum_required(VERSION 3.16)\ninclude($ENV{IDF_PATH}/tools/cmake/project.cmake)\nproject(ESP32_Firmware_Project)\n', 'utf-8');
        }
      } catch (err) {
        logger.error('Error writing main.c before pipeline launch:', err.message);
      }
    }

    // Pre-flash Step 1: Refresh COM ports
    const freshPorts = await this.detectPorts(getMainWindow);
    
    // Pre-flash Step 2: Prefer USB serial ports (skip Bluetooth virtual ports)
    const usbPort = freshPorts.find(p => p.isUsb);
    let validPort;
    try {
      validPort = this.validatePort(port);
    } catch {
      validPort = null;
    }
    
    // If the requested port is a Bluetooth modem or not in the detected list, switch to USB port
    const matchedPort = validPort && freshPorts.find(p => p.path.toUpperCase() === validPort.toUpperCase());
    const isBluetoothPort = matchedPort && matchedPort.isUsb === false;
    
    if (!matchedPort || isBluetoothPort) {
      const fallback = usbPort || freshPorts[0];
      if (fallback) {
        logger.info(`Port '${port}' is ${isBluetoothPort ? 'a Bluetooth modem' : 'not connected'}. Auto-selecting USB port '${fallback.path}'.`);
        validPort = fallback.path;
      } else if (!validPort) {
        throw new Error('No serial ports detected. Please connect your ESP32 board via USB.');
      }
    }

    // Pre-flash Step 3: Test port accessibility & ensure it is disconnected in serial service
    const accessibility = await serialService.testPortOpen(validPort);
    await serialService.disconnectPort(validPort);
    if (!accessibility.openable && !accessibility.virtual) {
      throw new Error(`Port '${validPort}' is currently unavailable. Reasons: Another application is using the port, USB cable disconnected, or driver issue (${accessibility.error || 'Port locked'}).`);
    }

    // Pre-flash Step 4: Validate target & URL
    const validTarget = this.validateTarget(target);
    const validUrl = this.validateUrl(apiUrl);
    const env = this.initializeEspIdf();

    const pythonCmd = 'python';
    const mainCPath = path.join(this.projectDir, 'main', 'main.c');
    const args = [
      this.pythonScript,
      '--action', 'pipeline',
      '--target', validTarget,
      '--port', validPort,
      '--url', validUrl,
      '--project-dir', this.projectDir,
      '--code-file', mainCPath
    ];

    logger.info(`Starting flash pipeline with ESP-IDF env: ${pythonCmd} ${args.join(' ')}`);

    const child = spawn(pythonCmd, args, { env, shell: false });
    this.pipelineProcess = child;

    this._setupProcessListeners(child, getMainWindow, 'pipeline');

    return { success: true, message: 'Flash pipeline started' };
  }

  startMonitor({ port }, getMainWindow) {
    if (this.monitorProcess) {
      throw new Error('Serial monitor is already running.');
    }

    const validPort = this.validatePort(port);
    const env = this.initializeEspIdf();

    const pythonCmd = 'python';
    const args = [
      this.pythonScript,
      '--action', 'monitor',
      '--port', validPort,
      '--project-dir', this.projectDir
    ];

    logger.info(`Starting serial monitor with ESP-IDF env: ${pythonCmd} ${args.join(' ')}`);

    const child = spawn(pythonCmd, args, { env, shell: false });
    this.monitorProcess = child;

    this._setupProcessListeners(child, getMainWindow, 'monitor');

    return { success: true, message: 'Serial monitor started' };
  }

  stopMonitor() {
    if (this.monitorProcess) {
      this._killProcessTree(this.monitorProcess.pid);
      this.monitorProcess = null;
      logger.info('Stopped serial monitor.');
      return { success: true, message: 'Serial monitor stopped' };
    }
    return { success: false, message: 'No monitor process active' };
  }

  cancelPipeline() {
    if (this.pipelineProcess) {
      this._killProcessTree(this.pipelineProcess.pid);
      this.pipelineProcess = null;
      logger.info('Cancelled flash pipeline.');
      return { success: true, message: 'Flash pipeline cancelled' };
    }
    return { success: false, message: 'No pipeline active to cancel' };
  }

  async browseIdfDirectory() {
    const result = await dialog.showOpenDialog({
      title: 'Select ESP-IDF Installation Directory',
      properties: ['openDirectory']
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const selectedPath = result.filePaths[0];
      const exportBat = path.join(selectedPath, 'export.bat');
      const idfPy = path.join(selectedPath, 'tools', 'idf.py');

      const isValid = fs.existsSync(exportBat) || fs.existsSync(idfPy);
      return {
        path: selectedPath,
        valid: isValid,
        message: isValid ? 'Valid ESP-IDF directory' : 'Warning: export.bat or tools/idf.py not found in selected folder.'
      };
    }
    return { canceled: true };
  }

  validateIdfPath(targetPath) {
    if (!targetPath || !fs.existsSync(targetPath)) {
      return { valid: false, message: 'Path does not exist.' };
    }
    const exportBat = path.join(targetPath, 'export.bat');
    const idfPy = path.join(targetPath, 'tools', 'idf.py');
    const isValid = fs.existsSync(exportBat) || fs.existsSync(idfPy);

    return {
      valid: isValid,
      message: isValid ? 'Valid ESP-IDF installation directory.' : 'Missing export.bat or tools/idf.py.'
    };
  }

  _setupProcessListeners(child, getMainWindow, processType) {
    let buffer = '';

    child.stdout.on('data', data => {
      buffer += data.toString('utf8');
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep incomplete line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          try {
            const eventData = JSON.parse(trimmed);
            const mainWindow = getMainWindow();
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('flash:event', { processType, ...eventData });
            }
          } catch {
            this._sendRawLog(getMainWindow, processType, trimmed);
          }
        } else {
          this._sendRawLog(getMainWindow, processType, trimmed);
        }
      }
    });

    child.stderr.on('data', data => {
      const text = data.toString('utf8').trim();
      if (text) {
        this._sendRawLog(getMainWindow, processType, text, 'error');
      }
    });

    const resetProcessRef = () => {
      if (processType === 'pipeline') {
        this.pipelineProcess = null;
      } else if (processType === 'monitor') {
        this.monitorProcess = null;
      }
    };

    child.on('error', err => {
      resetProcessRef();
      const mainWindow = getMainWindow();
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('flash:event', {
          processType,
          status: 'error',
          message: `Process error: ${err.message}`
        });
      }
    });

    child.on('exit', () => {
      resetProcessRef();
    });

    child.on('close', code => {
      resetProcessRef();

      const mainWindow = getMainWindow();
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('flash:event', {
          processType,
          status: processType === 'pipeline' ? 'pipeline_exit' : 'monitor_exit',
          exitCode: code
        });
      }
    });
  }

  _sendRawLog(getMainWindow, processType, logText, level = 'info') {
    const mainWindow = getMainWindow();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('flash:event', {
        processType,
        status: `${processType}_log`,
        stream: processType,
        log: logText,
        level
      });
    }
  }

  _killProcessTree(pid) {
    if (!pid) return;
    if (process.platform === 'win32') {
      exec(`taskkill /F /T /PID ${pid}`, err => {
        if (err) logger.warn(`taskkill warning for PID ${pid}:`, err.message);
      });
    } else {
      try {
        process.kill(-pid, 'SIGKILL');
      } catch {
        try {
          process.kill(pid, 'SIGKILL');
        } catch {}
      }
    }
  }
}

export const flashService = new FlashService();
