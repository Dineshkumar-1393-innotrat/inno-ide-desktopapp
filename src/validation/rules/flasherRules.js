/**
 * Flasher Validation Rules
 * Validates pre-flash prerequisites, hardware connection, serial port exclusivity, and firmware binaries.
 */

import { ValidationSeverity, ValidationAction } from '../types.js';

export const flasherRules = [
  {
    id: 'flash:serial-port-available',
    workflowArea: 'flash',
    ruleName: 'Serial Port Exclusivity',
    severity: ValidationSeverity.ERROR,
    trigger: [ValidationAction.FLASH_START],
    validate: async (context) => {
      const port = context.hardware?.port || context.selectedPort;
      const isSerialMonitorActive = Boolean(
        context.isSerialActive ||
        context.hardware?.isSerialMonitorOpen ||
        (typeof window !== 'undefined' && window.__INNOIDE_SERIAL_MONITOR_ACTIVE__)
      );

      if (isSerialMonitorActive && port) {
        return {
          valid: false,
          violationCode: 'SERIAL_PORT_LOCKED',
          title: 'Workflow Rule Violation',
          ruleName: 'Serial Port Exclusivity Required',
          message: `Serial port ${port} is currently in use by the Serial Monitor.`,
          reason: `Flashing requires exclusive access to ${port}. The active Serial Monitor connection must be closed before the programmer can open the port.`,
          details: { lockedPort: port },
          recommendation: `Disconnect the Serial Monitor or click [Release ${port} Automatically] to continue.`,
          canAutoFix: true,
          autoFixLabel: `Release ${port} Automatically`,
          autoFixAction: 'release_serial_port',
          sourceScreen: context.currentScreen || 'Flasher',
          targetScreen: 'Flash',
          targetRoute: '/flasher',
        };
      }
      return { valid: true };
    },
  },

  {
    id: 'flash:hardware-connected',
    workflowArea: 'flash',
    ruleName: 'Hardware Target Connected',
    severity: ValidationSeverity.ERROR,
    trigger: [ValidationAction.FLASH_START],
    validate: async (context) => {
      const port = context.hardware?.port || context.selectedPort;
      const connectedDevices = context.hardware?.connectedDevices || [];

      if (!port && (!Array.isArray(connectedDevices) || connectedDevices.length === 0)) {
        return {
          valid: false,
          violationCode: 'HARDWARE_NOT_CONNECTED',
          title: 'Workflow Rule Violation',
          ruleName: 'Target Hardware Connected',
          message: 'No hardware target detected or selected.',
          reason: 'Flashing requires a physical USB/Serial connection to the target development board (e.g. ESP32, STM32, NRF).',
          recommendation: 'Connect your device via USB cable and select the active COM port.',
          sourceScreen: context.currentScreen || 'Flasher',
          targetScreen: 'Flash',
          targetRoute: '/flasher',
          canAutoFix: false,
        };
      }
      return { valid: true };
    },
  },

  {
    id: 'flash:firmware-available',
    workflowArea: 'flash',
    ruleName: 'Compiled Binary Available',
    severity: ValidationSeverity.ERROR,
    trigger: [ValidationAction.FLASH_START],
    validate: async (context) => {
      const hasBin = context.firmware?.binary || context.hasCompiledBinary;
      const code = context.code?.content || context.codeContent;

      if (!hasBin && (!code || code.trim().length === 0)) {
        return {
          valid: false,
          violationCode: 'FIRMWARE_BINARY_MISSING',
          title: 'Workflow Rule Violation',
          ruleName: 'Compiled Firmware Required',
          message: 'No compiled firmware binary found.',
          reason: 'Flash requires a compiled .bin file or valid source code ready for compilation.',
          recommendation: 'Open the Code Editor, compile your program, and retry flashing.',
          sourceScreen: context.currentScreen || 'Flasher',
          targetScreen: 'Write Code',
          targetRoute: '/editor',
          canAutoFix: false,
        };
      }
      return { valid: true };
    },
  },
];
