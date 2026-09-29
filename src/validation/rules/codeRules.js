/**
 * Code Validation Rules
 * Validates written or generated C/C++ firmware code against the Product definition and Block Diagram.
 * As required by the PDF: "Check with defined product for validation."
 */

import { ValidationSeverity, ValidationAction } from '../types.js';

export const codeRules = [
  {
    id: 'code:exists',
    workflowArea: 'write-code',
    ruleName: 'Firmware Code Exists',
    severity: ValidationSeverity.ERROR,
    trigger: [
      ValidationAction.CODE_COMPILE,
      ValidationAction.FLASH_START,
    ],
    validate: async (context) => {
      const code = context.code?.content || context.codeContent;
      if (!code || typeof code !== 'string' || code.trim().length === 0) {
        return {
          valid: false,
          violationCode: 'CODE_EMPTY',
          title: 'Workflow Rule Violation',
          ruleName: 'Source Code Required',
          message: 'No firmware source code found to compile or flash.',
          reason: 'Firmware must be generated from diagrams or written manually before compiling.',
          recommendation: 'Open the Code Editor and implement the firmware program.',
          sourceScreen: context.currentScreen || 'CodeEditor',
          targetScreen: 'Write Code',
          targetRoute: '/editor',
          canAutoFix: false,
        };
      }
      return { valid: true };
    },
  },

  {
    id: 'code:entry-point',
    workflowArea: 'write-code',
    ruleName: 'Entry Point Function Defined',
    severity: ValidationSeverity.ERROR,
    trigger: [
      ValidationAction.CODE_COMPILE,
      ValidationAction.FLASH_START,
    ],
    validate: async (context) => {
      const code = context.code?.content || context.codeContent || '';
      if (!code) return { valid: true };

      const hasEntryPoint =
        code.includes('app_main') ||
        code.includes('main(') ||
        (code.includes('setup(') && code.includes('loop('));

      if (!hasEntryPoint) {
        return {
          valid: false,
          violationCode: 'CODE_MISSING_ENTRY_POINT',
          title: 'Workflow Rule Violation',
          ruleName: 'Firmware Entry Point Required',
          message: 'Code validation failed: Missing entry point.',
          reason: 'The firmware code does not declare an executable entry point such as "void app_main(void)" or "int main(void)".',
          recommendation: 'Add the main application entry point to your code.',
          sourceScreen: context.currentScreen || 'CodeEditor',
          targetScreen: 'Write Code',
          targetRoute: '/editor',
          canAutoFix: false,
        };
      }
      return { valid: true };
    },
  },

  {
    id: 'code:product-consistency',
    workflowArea: 'write-code',
    ruleName: 'Code / Product GPIO Consistency',
    severity: ValidationSeverity.ERROR,
    trigger: [
      ValidationAction.CODE_COMPILE,
      ValidationAction.FLASH_START,
    ],
    validate: async (context) => {
      const code = context.code?.content || context.codeContent || '';
      if (!code) return { valid: true };

      const productConfig = context.product || context.productDefinition;
      const expectedPins = productConfig?.pins || productConfig?.gpioMap;

      if (expectedPins && typeof expectedPins === 'object') {
        const mismatches = [];
        for (const [componentName, expectedPin] of Object.entries(expectedPins)) {
          // Look for #define COMPONENT_PIN or const int COMPONENT_PIN in code
          const regex = new RegExp(`(?:#define|const\\s+int)\\s+${componentName}[_A-Za-z0-9]*\\s+(\\d+)`, 'i');
          const match = code.match(regex);
          if (match && match[1] && parseInt(match[1], 10) !== parseInt(expectedPin, 10)) {
            mismatches.push(`${componentName}: Product specifies GPIO ${expectedPin}, but Code uses GPIO ${match[1]}`);
          }
        }

        if (mismatches.length > 0) {
          return {
            valid: false,
            violationCode: 'CODE_PRODUCT_GPIO_MISMATCH',
            title: 'Workflow Rule Violation',
            ruleName: 'Code ↔ Product Hardware Mismatch',
            message: 'Code / Product mismatch detected.',
            reason: mismatches.join('. '),
            details: { mismatches },
            recommendation: 'Align the GPIO definitions in code with the defined Product hardware parameters before compiling.',
            sourceScreen: context.currentScreen || 'CodeEditor',
            targetScreen: 'Write Code',
            targetRoute: '/editor',
            canAutoFix: false,
          };
        }
      }

      return { valid: true };
    },
  },
];
