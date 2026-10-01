/**
 * Product Validation Rules
 * Validates Product ID, target MCU, hardware parameters, and peripheral components.
 */

import { ValidationSeverity, ValidationAction } from '../types.js';

export const productRules = [
  {
    id: 'product:id-required',
    workflowArea: 'define-product',
    ruleName: 'Product ID Required',
    severity: ValidationSeverity.ERROR,
    trigger: [
      ValidationAction.PRODUCT_SAVE,
      ValidationAction.BLOCK_DIAGRAM_SAVE,
      ValidationAction.SIMULATION_START,
      ValidationAction.FLASH_START,
    ],
    validate: async (context) => {
      const productId = context.productId || context.product?.id || context.product?.productID;
      if (!productId || typeof productId !== 'string' || productId.trim().length === 0) {
        return {
          valid: false,
          violationCode: 'PRODUCT_ID_MISSING',
          title: 'Workflow Rule Violation',
          ruleName: 'Product ID Required',
          message: 'Product configuration is incomplete.',
          reason: 'A unique Product ID is required to bind hardware configurations and diagram schemas.',
          recommendation: 'Specify a valid Product ID in the product definition.',
          targetScreen: 'View Product',
          targetAction: 'open-view-product',
          canAutoFix: false,
        };
      }
      return { valid: true };
    },
  },
  {
    id: 'product:mcu-required',
    workflowArea: 'define-product',
    ruleName: 'Target MCU Specified',
    severity: ValidationSeverity.ERROR,
    trigger: [
      ValidationAction.PRODUCT_SAVE,
      ValidationAction.CODE_GENERATE,
      ValidationAction.CODE_COMPILE,
      ValidationAction.FLASH_START,
    ],
    validate: async (context) => {
      const mcu = context.product?.mcu || context.product?.targetMCU || context.productDefinition?.mcu;
      // If product definition exists, ensure MCU is defined
      if (context.product && !mcu) {
        return {
          valid: false,
          violationCode: 'TARGET_MCU_MISSING',
          title: 'Workflow Rule Violation',
          ruleName: 'Target MCU Required',
          message: 'Target MCU hardware architecture is not specified.',
          reason: 'The hardware configuration must declare the target microcontroller (e.g. ESP32-S3, STM32, NRF52) to compile firmware correctly.',
          recommendation: 'Select the target MCU in Define Product configuration.',
          targetScreen: 'View Product',
          targetAction: 'open-view-product',
          canAutoFix: false,
        };
      }
      return { valid: true };
    },
  },
  {
    id: 'product:hardware-configuration-valid',
    workflowArea: 'define-product',
    ruleName: 'Hardware Configuration Valid',
    severity: ValidationSeverity.WARNING,
    trigger: [ValidationAction.PRODUCT_SAVE, ValidationAction.SIMULATION_START],
    validate: async (context) => {
      const hw = context.product?.hardware || context.productDefinition?.hardware;
      if (context.product && hw && typeof hw === 'object' && Object.keys(hw).length === 0) {
        return {
          valid: false,
          violationCode: 'HARDWARE_CONFIG_EMPTY',
          title: 'Workflow Warning',
          ruleName: 'Hardware Configuration Incomplete',
          message: 'Hardware parameters have not been fully configured.',
          reason: 'Peripheral pins, clock frequencies, or power settings were left as defaults.',
          recommendation: 'Review and confirm hardware settings before deployment.',
          canAutoFix: false,
        };
      }
      return { valid: true };
    },
  },
  {
    id: 'product:component-definition-valid',
    workflowArea: 'define-product',
    ruleName: 'Component Definitions Valid',
    severity: ValidationSeverity.ERROR,
    trigger: [
      ValidationAction.PRODUCT_SAVE,
      ValidationAction.BLOCK_DIAGRAM_SAVE,
      ValidationAction.SIMULATION_START,
    ],
    validate: async (context) => {
      const components = context.product?.components || context.productDefinition?.components;
      if (Array.isArray(components)) {
        const invalid = components.filter(
          (c) => typeof c !== 'string' && (!c || !c.name || !c.type)
        );
        if (invalid.length > 0) {
          return {
            valid: false,
            violationCode: 'INVALID_COMPONENT_DEFINITION',
            title: 'Workflow Rule Violation',
            ruleName: 'Component Definitions Valid',
            message: 'One or more defined product components are missing required name or type fields.',
            reason: 'Every component must specify its functional name and sensor/actuator type.',
            recommendation: 'Edit the product component table and fill in all required fields.',
            targetScreen: 'View Product',
            targetAction: 'open-view-product',
            canAutoFix: false,
          };
        }
      }
      return { valid: true };
    },
  },
];
