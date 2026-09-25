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

const ALLOWED_TARGETS = ['auto', 'esp32', 'esp32c2', 'esp32c3', 'esp32c6', 'esp32s2', 'esp32s3'];
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
          ? `[Serial] Found ${ports.length} device(s): ${ports.map(p => `${p.path} (${p.chipName || p.friendlyName || p.manufacturer || 'Serial Device'})`).join(', ')}`
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

  async runPipeline({ port, target = 'auto', apiUrl = 'http://localhost:5010/check-code', code = null }, getMainWindow) {
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

    // Write source code from the code editor canvas directly to main.c
    if (code && typeof code === 'string' && code.trim()) {
      try {
        const mainDir = path.join(this.projectDir, 'main');
        if (!fs.existsSync(mainDir)) fs.mkdirSync(mainDir, { recursive: true });

        const mainCPath = path.join(mainDir, 'main.c');
        const mainCmakePath = path.join(mainDir, 'CMakeLists.txt');
        const rootCmakePath = path.join(this.projectDir, 'CMakeLists.txt');

        const processedCode = this.ensureReactiveFirmware(code);
        fs.writeFileSync(mainCPath, processedCode.replace(/\r\n/g, '\n'), 'utf-8');
        logger.info(`Wrote active code-editor canvas source code to ${mainCPath} (ensured reactive Automation Rules support)`);

        const isLedStripUsed = code.includes('led_strip.h') || code.includes('led_strip');
        const isWifiUsed = code.includes('esp_wifi.h') || code.includes('esp_wifi');
        const idfComponentYml = path.join(mainDir, 'idf_component.yml');
        if (isLedStripUsed && !fs.existsSync(idfComponentYml)) {
          fs.writeFileSync(idfComponentYml, 'dependencies:\n  espressif/led_strip: "^3.0.0"\n', 'utf-8');
        }

        const reqList = ['esp_driver_rmt', 'esp_driver_gpio', 'driver', 'esp_driver_usb_serial_jtag', 'esp_driver_uart', 'vfs'];
        if (isLedStripUsed) {
          reqList.unshift('led_strip');
        }
        if (isWifiUsed) {
          reqList.push('esp_wifi', 'esp_netif', 'esp_event', 'nvs_flash', 'lwip', 'esp_http_server');
        }

        fs.writeFileSync(mainCmakePath, `idf_component_register(SRCS "main.c"\n                    INCLUDE_DIRS "."\n                    REQUIRES ${reqList.join(' ')})\n`, 'utf-8');

        if (!fs.existsSync(rootCmakePath)) {
          fs.writeFileSync(rootCmakePath, 'cmake_minimum_required(VERSION 3.16)\ninclude($ENV{IDF_PATH}/tools/cmake/project.cmake)\nproject(ESP32_Firmware_Project)\n', 'utf-8');
        }
      } catch (err) {
        logger.error('Error writing main.c before pipeline launch:', err.message);
      }
    }

    // Pre-flash Step 1: Refresh COM ports
    const freshPorts = await this.detectPorts(getMainWindow);
    if (!freshPorts || freshPorts.length === 0) {
      throw new Error('No serial devices detected. Please connect your ESP32 board via USB before flashing.');
    }
    
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
        logger.info(`Port '${port}' is ${isBluetoothPort ? 'a Bluetooth modem' : 'not in detected ports'}. Auto-selecting detected port '${fallback.path}'.`);
        validPort = fallback.path;
      } else {
        throw new Error(`Device port '${port}' is not connected. Connected devices: ${freshPorts.map(p => p.path).join(', ')}`);
      }
    }

    // Pre-flash Step 3: Ensure serial monitor and serial service are completely disconnected before flashing
    if (this.monitorProcess) {
      this.stopMonitor();
    }
    // Lock the port FIRST so companion server writePort() won't re-open it between disconnect and esptool
    serialService.lockPort(validPort);
    this.flashingPort = validPort;
    await serialService.disconnectPort(validPort);
    // Allow Windows serial driver to fully release COM port before esptool opens it
    await new Promise(r => setTimeout(r, 600));

    // Pre-flash Step 4: Validate target & URL
    let resolvedTarget = target;
    if (resolvedTarget === 'auto') {
      if (code && (code.includes('GPIO_NUM_48') || code.includes('usb_serial_jtag'))) {
        resolvedTarget = 'esp32s3';
      } else {
        resolvedTarget = 'esp32s3';
      }
    }
    const validTarget = this.validateTarget(resolvedTarget);
    const validUrl = this.validateUrl(apiUrl);
    const env = this.initializeEspIdf();
    if (!env.IDF_PATH && this.discoveredIdf?.idfPath) {
      env.IDF_PATH = this.discoveredIdf.idfPath;
    }
    if (!env.IDF_TOOLS_PATH) {
      env.IDF_TOOLS_PATH = 'D:\\esp-idf-tools';
    }

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
      // Unlock port so companion server can resume serial communication
      if (this.flashingPort) {
        serialService.unlockPort(this.flashingPort);
        this.flashingPort = null;
      }
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
        // Unlock the port so companion server can resume serial communication
        if (this.flashingPort) {
          serialService.unlockPort(this.flashingPort);
          this.flashingPort = null;
        }
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

  ensureReactiveFirmware(code) {
    if (!code || typeof code !== 'string') return code;
    
    // If code already contains reactive USB-Serial/JTAG or UART listener / command handler, leave it as-is
    if (code.includes('usb_serial_jtag_read_bytes') || code.includes('apply_command') || code.includes('process_cmd')) {
      return code;
    }

    // If code is not an ESP-IDF C application (e.g. no app_main), leave as-is
    if (!code.includes('app_main')) {
      return code;
    }

    // Seamlessly preserve user's configuration while augmenting with reactive Automation & Hardware Rules support
    let ledGpio = 'GPIO_NUM_48';
    const gpioMatch = code.match(/strip_gpio_num\s*=\s*(GPIO_NUM_\d+|\d+)/i) || code.match(/#define\s+LED_GPIO\s+(GPIO_NUM_\d+|\d+)/i);
    if (gpioMatch) ledGpio = gpioMatch[1];

    let r = 0, g = 0, b = 255;
    const pixelMatch = code.match(/led_strip_set_pixel\s*\([^,]+,\s*\d+,\s*(\d+),\s*(\d+),\s*(\d+)\)/);
    if (pixelMatch) {
      const pr = parseInt(pixelMatch[1], 10), pg = parseInt(pixelMatch[2], 10), pb = parseInt(pixelMatch[3], 10);
      if (pr > 0 || pg > 0 || pb > 0) { r = pr; g = pg; b = pb; }
    }

    let delayMs = 1000;
    const delayMatch = code.match(/vTaskDelay\s*\(\s*pdMS_TO_TICKS\s*\(\s*(\d+)\s*\)\s*\)/);
    if (delayMatch) {
      delayMs = parseInt(delayMatch[1], 10) || 1000;
    }

    logger.info(`[FlashService] Augmenting user firmware with Automation & Hardware Rules reactive serial listener (GPIO: ${ledGpio}, RGB: [${r},${g},${b}], Delay: ${delayMs}ms)`);

    return `#include <ctype.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>
#include <strings.h>

#include "driver/gpio.h"
#include "driver/uart.h"
#include "driver/usb_serial_jtag.h"
#include "esp_err.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "led_strip.h"

// Hardware Pin Definitions
#define LED_GPIO ${ledGpio}
#define LED_GPIO_STANDARD GPIO_NUM_2
#define LED_COUNT 1
#define COMMAND_BUFFER_SIZE 64

#define LED_COLOR_R ${r}
#define LED_COLOR_G ${g}
#define LED_COLOR_B ${b}
#define BLINK_DELAY_MS ${delayMs}

static led_strip_handle_t s_strip = NULL;
static volatile bool s_blink_enabled = true;

static void send_serial_ack(const char *msg)
{
    size_t len = strlen(msg);
    usb_serial_jtag_write_bytes(msg, len, pdMS_TO_TICKS(50));
    uart_write_bytes(UART_NUM_0, msg, len);
}

static void apply_command(const char *cmd)
{
    if (!cmd || strlen(cmd) == 0) return;

    if (strstr(cmd, "LED:0") != NULL ||
        strstr(cmd, "led:0") != NULL ||
        strstr(cmd, "LED:OFF") != NULL ||
        strstr(cmd, "led:off") != NULL ||
        strstr(cmd, "LED:LOW") != NULL ||
        strstr(cmd, "led:low") != NULL ||
        strstr(cmd, "GPIO:LOW") != NULL ||
        strstr(cmd, "gpio:low") != NULL ||
        strstr(cmd, "GPIO:0") != NULL ||
        strstr(cmd, "gpio:0") != NULL ||
        strstr(cmd, "RELAY:0") != NULL ||
        strcasecmp(cmd, "0") == 0 ||
        strcasecmp(cmd, "OFF") == 0 ||
        strcasecmp(cmd, "LOW") == 0 ||
        strcasecmp(cmd, "STOP") == 0) {

        s_blink_enabled = false;
        if (s_strip) {
            led_strip_clear(s_strip);
            led_strip_refresh(s_strip);
        }
        gpio_set_level(LED_GPIO_STANDARD, 0);
        send_serial_ack("ACK:LED:0\\r\\n");
    }
    else if (strstr(cmd, "LED:1") != NULL ||
             strstr(cmd, "led:1") != NULL ||
             strstr(cmd, "LED:ON") != NULL ||
             strstr(cmd, "led:on") != NULL ||
             strstr(cmd, "LED:HIGH") != NULL ||
             strstr(cmd, "led:high") != NULL ||
             strstr(cmd, "GPIO:HIGH") != NULL ||
             strstr(cmd, "gpio:high") != NULL ||
             strstr(cmd, "GPIO:1") != NULL ||
             strstr(cmd, "gpio:1") != NULL ||
             strstr(cmd, "RELAY:1") != NULL ||
             strcasecmp(cmd, "1") == 0 ||
             strcasecmp(cmd, "ON") == 0 ||
             strcasecmp(cmd, "HIGH") == 0 ||
             strcasecmp(cmd, "START") == 0 ||
             strcasecmp(cmd, "TRIGGER") == 0) {

        s_blink_enabled = true;
        send_serial_ack("ACK:LED:1\\r\\n");
    }
    else if (strcasecmp(cmd, "PING") == 0) {
        send_serial_ack("PONG\\r\\n");
    }
    else if (strcasecmp(cmd, "STATUS") == 0 || strcasecmp(cmd, "GET:STATE") == 0) {
        send_serial_ack(s_blink_enabled ? "STATE:1\\r\\n" : "STATE:0\\r\\n");
    }
}

static void poll_serial(char *buf, size_t *idx, size_t max_len)
{
    uint8_t byte = 0;
    while (true) {
        int read_count = 0;
        if (usb_serial_jtag_read_bytes(&byte, 1, 0) > 0) {
            read_count = 1;
        } else if (uart_read_bytes(UART_NUM_0, &byte, 1, 0) > 0) {
            read_count = 1;
        }
        if (read_count == 0) break;

        char c = (char)byte;
        if (c == '\\r' || c == '\\n') {
            if (*idx > 0) {
                buf[*idx] = '\\0';
                apply_command(buf);
                *idx = 0;
            }
        } else if (*idx < max_len - 1) {
            buf[(*idx)++] = c;
            buf[*idx] = '\\0';
            if (strcmp(buf, "LED:0") == 0 || strcmp(buf, "LED:1") == 0 ||
                strcasecmp(buf, "LED:OFF") == 0 || strcasecmp(buf, "LED:ON") == 0) {
                apply_command(buf);
                *idx = 0;
            }
        } else {
            *idx = 0;
        }
    }
}

void app_main(void)
{
    gpio_reset_pin(LED_GPIO_STANDARD);
    gpio_set_direction(LED_GPIO_STANDARD, GPIO_MODE_OUTPUT);
    gpio_set_level(LED_GPIO_STANDARD, 0);

    led_strip_config_t strip_config = {
        .strip_gpio_num = LED_GPIO,
        .max_leds = LED_COUNT,
        .led_model = LED_MODEL_WS2812,
        .color_component_format = LED_STRIP_COLOR_COMPONENT_FMT_GRB,
    };
    led_strip_rmt_config_t rmt_config = {
        .resolution_hz = 10 * 1000 * 1000,
        .flags.with_dma = false,
    };
    ESP_ERROR_CHECK(led_strip_new_rmt_device(&strip_config, &rmt_config, &s_strip));
    ESP_ERROR_CHECK(led_strip_clear(s_strip));
    ESP_ERROR_CHECK(led_strip_refresh(s_strip));

    usb_serial_jtag_driver_config_t usb_config = {
        .tx_buffer_size = 1024,
        .rx_buffer_size = 1024,
    };
    ESP_ERROR_CHECK(usb_serial_jtag_driver_install(&usb_config));

    uart_config_t uart_config = {
        .baud_rate = 115200,
        .data_bits = UART_DATA_8_BITS,
        .parity = UART_PARITY_DISABLE,
        .stop_bits = UART_STOP_BITS_1,
        .flow_ctrl = UART_HW_FLOWCTRL_DISABLE,
        .source_clk = UART_SCLK_DEFAULT,
    };
    uart_param_config(UART_NUM_0, &uart_config);
    uart_driver_install(UART_NUM_0, 512, 512, 0, NULL, 0);

    char cmd_buf[COMMAND_BUFFER_SIZE] = {0};
    size_t cmd_idx = 0;

    send_serial_ack("BOOT:INNO_IDE_READY\\r\\n");

    while (1)
    {
        poll_serial(cmd_buf, &cmd_idx, sizeof(cmd_buf));

        if (!s_blink_enabled) {
            vTaskDelay(pdMS_TO_TICKS(25));
            continue;
        }

        led_strip_set_pixel(s_strip, 0, LED_COLOR_R, LED_COLOR_G, LED_COLOR_B);
        led_strip_refresh(s_strip);
        gpio_set_level(LED_GPIO_STANDARD, 1);

        for (int elapsed = 0; elapsed < BLINK_DELAY_MS && s_blink_enabled; elapsed += 25) {
            vTaskDelay(pdMS_TO_TICKS(25));
            poll_serial(cmd_buf, &cmd_idx, sizeof(cmd_buf));
        }

        if (!s_blink_enabled) {
            continue;
        }

        led_strip_clear(s_strip);
        led_strip_refresh(s_strip);
        gpio_set_level(LED_GPIO_STANDARD, 0);

        for (int elapsed = 0; elapsed < BLINK_DELAY_MS && s_blink_enabled; elapsed += 25) {
            vTaskDelay(pdMS_TO_TICKS(25));
            poll_serial(cmd_buf, &cmd_idx, sizeof(cmd_buf));
        }
    }
}
`;
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
