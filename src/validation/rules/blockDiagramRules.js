/**
 * Block Diagram Validation Rules
 * Validates visual block diagram architecture and product consistency.
 * As explicitly required by the InnoIDE Workflow Guide:
 * "Match the product definition with block diagrams created if one components is missing a error message has to be shown."
 */

import { ValidationSeverity, ValidationAction } from '../types.js';

/**
 * Helper to resolve defined product components from all sources:
 * 1. Explicit context (product, productDefinition, productDetails)
 * 2. LocalStorage cache (innoide:product_details_*, innoide:last_product_details)
 */
export const extractProductComponents = (context = {}) => {
  let raw =
    context.product?.components ||
    context.productDefinition?.components ||
    context.productDetails?.components ||
    context.productDetails?.componentsPayload ||
    context.product?.componentsPayload;

  if (!raw && typeof localStorage !== 'undefined') {
    const prodId = context.productId || context.product?.id || localStorage.getItem('activeProductId');
    const projId = context.projectId || context.project?.id || localStorage.getItem('activeProjectId');
    const prodName = context.productName || context.product?.name || localStorage.getItem('activeProductName');
    const projName = context.projectName || context.project?.name || localStorage.getItem('activeProjectName');

    const keysToTry = [
      prodId && `innoide:product_details_${prodId}`,
      projId && `innoide:product_details_${projId}`,
      prodName && `innoide:product_details_${prodName}`,
      projName && `innoide:product_details_${projName}`,
      'innoide:last_product_details',
    ].filter(Boolean);

    for (const key of keysToTry) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          raw = parsed?.components || parsed?.componentsPayload || parsed?.data?.components;
          if (raw && (Array.isArray(raw) ? raw.length > 0 : Object.keys(raw).length > 0)) {
            break;
          }
        }
      } catch (e) {}
    }
  }

  const list = [];
  if (Array.isArray(raw)) {
    raw.forEach((item) => {
      if (typeof item === 'string') {
        const trimmed = item.trim();
        if (trimmed && !list.includes(trimmed)) list.push(trimmed);
      } else if (item && typeof item === 'object') {
        const name = item.name || item.componentName || item.label || item.title || item.typeName;
        if (name && typeof name === 'string' && name.trim()) {
          const trimmed = name.trim();
          if (!list.includes(trimmed)) list.push(trimmed);
        }
      }
    });
  } else if (raw && typeof raw === 'object') {
    Object.keys(raw).forEach((key) => {
      const trimmed = key.trim();
      if (trimmed && trimmed !== 'undefined' && trimmed !== 'null' && !list.includes(trimmed)) {
        list.push(trimmed);
      }
    });
  }

  const mcu =
    context.product?.mcu ||
    context.product?.targetMCU ||
    context.productDefinition?.mcu ||
    context.productDefinition?.targetMCU ||
    context.productDetails?.mcu ||
    context.productDetails?.targetMCU;
  if (mcu && typeof mcu === 'string' && mcu.trim() && !list.includes(mcu.trim())) {
    list.unshift(mcu.trim());
  }

  return list;
};

export const MCU_KEYWORDS = [
  'microcontroller',
  'micro-controller',
  'mcu',
  'esp32',
  'esp8266',
  'stm32',
  'nrf52',
  'nrf32',
  'arduino',
  'rp2040',
  'pic',
  'atmega',
  'attiny',
  'cortex',
  'processor',
];

export const isMCU = (nameOrObj) => {
  if (!nameOrObj) return false;
  let text = '';
  if (typeof nameOrObj === 'string') {
    text = nameOrObj;
  } else if (typeof nameOrObj === 'object') {
    text = `${nameOrObj.symbol?.name || ''} ${nameOrObj.name || ''} ${nameOrObj.title || ''} ${nameOrObj.label || ''} ${nameOrObj.componentName || ''} ${nameOrObj.type || ''} ${nameOrObj.componentType || ''}`;
  }
  const clean = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  return MCU_KEYWORDS.some((kw) => clean.includes(kw.replace(/[^a-z0-9]/g, '')));
};

export const extractProductMCU = (context = {}) => {
  // Check direct mcu / targetMCU fields
  const directMcu =
    context.product?.mcu ||
    context.product?.targetMCU ||
    context.productDefinition?.mcu ||
    context.productDefinition?.targetMCU ||
    context.productDetails?.mcu ||
    context.productDetails?.targetMCU ||
    context.board;
  if (directMcu && typeof directMcu === 'string' && directMcu.trim()) {
    return directMcu.trim();
  }

  // Check product components for MCU
  const comps = extractProductComponents(context);
  const mcuComp = comps.find((c) => isMCU(c));
  if (mcuComp) return mcuComp;

  // Check localStorage product details
  if (typeof localStorage !== 'undefined') {
    const prodId = context.productId || context.product?.id || localStorage.getItem('activeProductId');
    const projId = context.projectId || context.project?.id || localStorage.getItem('activeProjectId');
    const prodName = context.productName || context.product?.name || localStorage.getItem('activeProductName');
    const projName = context.projectName || context.project?.name || localStorage.getItem('activeProjectName');

    const keys = [
      prodId && `innoide:product_details_${prodId}`,
      projId && `innoide:product_details_${projId}`,
      prodName && `innoide:product_details_${prodName}`,
      projName && `innoide:product_details_${projName}`,
      'innoide:last_product_details',
    ].filter(Boolean);

    for (const key of keys) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          const found = parsed?.mcu || parsed?.targetMCU || parsed?.basicInformation?.mcu;
          if (found && typeof found === 'string' && found.trim()) return found.trim();
          if (Array.isArray(parsed?.components)) {
            const m = parsed.components.find((c) => {
              const name = c?.componentName || c?.name || c;
              const type = c?.componentType || c?.type;
              return isMCU(name) || isMCU(type);
            });
            if (m) return m.componentName || m.name || (typeof m === 'string' ? m : 'Microcontroller');
          }
          if (Array.isArray(parsed?.devices)) {
            const dev = parsed.devices.find((d) => d?.mcu || isMCU(d?.deviceName) || isMCU(d?.name));
            if (dev?.mcu) return dev.mcu;
          }
        }
      } catch (e) {}
    }
  }

  return null;
};

/**
 * Helper to resolve block diagram nodes from all sources:
 * 1. Explicit context (blockDiagram.nodes, nodes, diagramData.blockDiagram.data)
 * 2. LocalStorage tabs cache (innoide:block_diagram_tabs_*)
 */
export const extractBlockDiagramNodes = (context = {}) => {
  let nodes = context.blockDiagram?.nodes || context.nodes || context.diagramData?.blockDiagram?.data;
  if (Array.isArray(nodes) && nodes.length > 0) {
    return nodes;
  }

  if (typeof localStorage !== 'undefined') {
    const projId = context.projectId || context.project?.id || localStorage.getItem('activeProjectId');
    const projName = context.projectName || context.project?.name || localStorage.getItem('activeProjectName');
    const userId = context.userId || 'default';

    const keysToTry = [
      projId && `innoide:block_diagram_tabs:${userId}:${projId}`,
      projId && `innoide:block_diagram_tabs:${projId}`,
      projName && `innoide:block_diagram_tabs:${projName}`,
      'innoide:block_diagram_nodes',
    ].filter(Boolean);

    for (const key of keysToTry) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
          if (Array.isArray(parsed?.tabs)) {
            const tabWithNodes = parsed.tabs.find((t) => Array.isArray(t?.state?.nodes) && t.state.nodes.length > 0);
            if (tabWithNodes) {
              return tabWithNodes.state.nodes;
            }
          }
        }
      } catch (e) {}
    }
  }

  return Array.isArray(nodes) ? nodes : [];
};

const normalizeText = (str) => {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
};

export const tokenizeComponentName = (str) => {
  if (!str || typeof str !== 'string') return [];
  const deCamel = str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
  return deCamel
    .toLowerCase()
    .split(/[\s\-_/]+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ''))
    .filter((w) => w.length >= 2);
};

export const GENERIC_CATEGORY_WORDS = new Set([
  'sensor', 'sensors', 'censor', 'censors',
  'actuator', 'actuators',
  'switch', 'switches',
  'button', 'buttons',
  'indicator', 'indicators',
  'display', 'displays',
  'controller', 'controllers',
  'module', 'modules',
  'device', 'devices',
  'component', 'components',
  'board', 'boards',
  'unit', 'units',
  'and', 'the', 'for', 'with', 'type', 'name'
]);

export const getIdentifyingTokens = (str) => {
  return tokenizeComponentName(str).filter((w) => !GENERIC_CATEGORY_WORDS.has(w));
};

export const COMPONENT_ALIASES = {
  esp32: ['esp', 'esp32s3', 'esp8266', 'mcu', 'microcontroller', 'nodemcu'],
  stm32: ['mcu', 'microcontroller', 'nucleo', 'arm'],
  arduino: ['mcu', 'microcontroller', 'uno', 'nano', 'mega'],
  mcu: ['microcontroller', 'processor', 'esp32', 'stm32', 'arduino', 'rp2040'],
  microcontroller: ['mcu', 'processor', 'esp32', 'stm32', 'arduino', 'rp2040'],
  temperature: ['temp', 'dht11', 'dht22', 'lm35', 'bmp280', 'ds18b20'],
  humidity: ['moisture', 'dht11', 'dht22'],
  flame: ['fire', 'flamesensor'],
  touch: ['touchandforce', 'capacitive', 'touchscreen'],
  force: ['touchandforce', 'pressure', 'fsr', 'loadcell', 'strain'],
  light: ['ldr', 'lux', 'photodiode', 'optical', 'bh1750', 'tsl2561', 'lightsensor'],
  gas: ['mq2', 'mq', 'co2', 'sgp30', 'smoke', 'airquality', 'methane'],
  motion: ['pir', 'radar', 'presence'],
  distance: ['ultrasonic', 'range', 'sonar', 'vl53l0x', 'hcsr04', 'lidar', 'tof'],
  heartbeat: ['pulse', 'heartrate', 'ky039', 'ecg', 'ppg'],
  sound: ['audio', 'mic', 'microphone', 'acoustic'],
  relay: ['contactor', 'solenoid'],
  buzzer: ['alarm', 'beeper', 'speaker', 'hooter', 'siren'],
  oled: ['display', 'screen', 'oleddisplay'],
  motor: ['servo', 'stepper', 'servomotor', 'vibrationmotor'],
  led: ['rgb', 'rgbled', 'diode', 'neopixel', 'light', 'redlight', 'bluelight', 'greenlight'],
};

export const isComponentMatch = (compA, compB) => {
  if (!compA || !compB) return false;
  const strA = typeof compA === 'string' ? compA : (compA.name || compA.label || compA.componentName || compA.symbol?.name || '');
  const strB = typeof compB === 'string' ? compB : (compB.name || compB.label || compB.componentName || compB.symbol?.name || '');

  const normA = normalizeText(strA);
  const normB = normalizeText(strB);
  if (!normA || !normB) return false;

  // 1. Exact normalized match (e.g. "FlameSensor" === "Flame Sensor")
  if (normA === normB) return true;

  // 2. MCU check
  const aIsMCU = isMCU(strA);
  const bIsMCU = isMCU(strB);
  if (aIsMCU && bIsMCU) {
    return true;
  }
  if (aIsMCU !== bIsMCU) {
    return false;
  }

  // 3. Substring check if neither string is pure generic category
  if (!GENERIC_CATEGORY_WORDS.has(normA) && !GENERIC_CATEGORY_WORDS.has(normB)) {
    const shorter = normA.length <= normB.length ? normA : normB;
    const longer = normA.length > normB.length ? normA : normB;
    if (longer.includes(shorter) && shorter.length >= 4) {
      const shorterTokens = getIdentifyingTokens(shorter);
      if (shorterTokens.length > 0) {
        return true;
      }
    }
  }

  // 4. Identifying token check
  const tokensA = getIdentifyingTokens(strA);
  const tokensB = getIdentifyingTokens(strB);

  // If neither has distinguishing tokens (e.g. "Microcontroller" vs "Microcontroller")
  if (tokensA.length === 0 && tokensB.length === 0) {
    return normA === normB;
  }

  // If one has distinguishing tokens but other has none (e.g. "Sensor" vs "FlameSensor")
  if (tokensA.length === 0 || tokensB.length === 0) {
    return false;
  }

  // Check token overlap
  const hasTokenOverlap = tokensA.some((tA) =>
    tokensB.some((tB) => tA === tB || (tA.length >= 4 && tB.length >= 4 && (tA.includes(tB) || tB.includes(tA))))
  );
  if (hasTokenOverlap) return true;

  // Check semantic aliases
  for (const [key, syns] of Object.entries(COMPONENT_ALIASES)) {
    const aHasKey = tokensA.includes(key);
    const bHasKey = tokensB.includes(key);
    const aHasSyn = tokensA.some((t) => syns.includes(t));
    const bHasSyn = tokensB.some((t) => syns.includes(t));

    if ((aHasKey && bHasSyn) || (bHasKey && aHasSyn) || (aHasSyn && bHasSyn)) {
      return true;
    }
  }

  return false;
};

export const matchesComponent = (compName, nodeLabels) => {
  if (!compName || !Array.isArray(nodeLabels) || nodeLabels.length === 0) return false;
  return nodeLabels.some((nodeLabel) => isComponentMatch(compName, nodeLabel));
};

export const blockDiagramRules = [
  {
    id: 'blockDiagram:has-components',
    workflowArea: 'block-diagram',
    ruleName: 'Diagram Has Components',
    severity: ValidationSeverity.ERROR,
    trigger: [
      ValidationAction.BLOCK_DIAGRAM_SAVE,
      ValidationAction.BLOCK_DIAGRAM_VALIDATE,
      ValidationAction.SIMULATION_START,
      ValidationAction.CODE_GENERATE,
      ValidationAction.FLASH_START,
    ],
    validate: async (context) => {
      const nodes = extractBlockDiagramNodes(context);
      if (!Array.isArray(nodes) || nodes.length === 0) {
        return {
          valid: false,
          violationCode: 'BLOCK_DIAGRAM_EMPTY',
          title: 'Workflow Rule Violation',
          ruleName: 'Block Diagram Component Required',
          message: 'The Block Diagram contains no components.',
          displayMessage: 'The Block Diagram contains no components.',
          reason: 'A visual block diagram must represent the hardware blocks and MCU before logic simulation or code generation can occur.',
          recommendation: 'Add the MCU and peripheral components to the Block Diagram canvas.',
          sourceScreen: context.currentScreen || 'BlockDiagram',
          targetScreen: 'Block Diagram',
          targetRoute: '/BlockDiagram',
          canAutoFix: false,
        };
      }
      return { valid: true };
    },
  },

  {
    id: 'blockDiagram:product-consistency',
    workflowArea: 'block-diagram',
    ruleName: 'Product / Block Diagram Compatibility',
    severity: ValidationSeverity.ERROR,
    trigger: [
      ValidationAction.BLOCK_DIAGRAM_SAVE,
      ValidationAction.BLOCK_DIAGRAM_VALIDATE,
      ValidationAction.SIMULATION_START,
      ValidationAction.CODE_GENERATE,
      ValidationAction.FLASH_START,
    ],
    validate: async (context) => {
      // Defined product components (from explicit context or cached product details)
      const productComponents = extractProductComponents(context);

      if (productComponents.length === 0) {
        return { valid: true }; // No specific required components declared
      }

      // Components on Block Diagram canvas
      const nodes = extractBlockDiagramNodes(context);
      const nodeLabels = nodes.map((n) => {
        return n.data?.label || n.data?.name || n.data?.componentName || n.data?.text || n.label || n.name || n.type || '';
      }).filter(Boolean);

      // Find missing components
      const missingComponents = productComponents.filter(
        (comp) => !matchesComponent(comp, nodeLabels)
      );

      if (missingComponents.length > 0) {
        return {
          valid: false,
          violationCode: 'PRODUCT_COMPONENT_MISSING',
          title: 'Workflow Rule Violation',
          ruleName: 'Product ↔ Block Diagram Consistency',
          message: 'The defined product does not match the product specified in the block diagram.',
          reason: `The Product defines ${productComponents.length} component(s) (${productComponents.join(', ')}), but the Block Diagram is missing ${missingComponents.length} of them: ${missingComponents.join(', ')}.`,
          details: {
            definedComponents: productComponents,
            missingComponents: missingComponents,
            canvasComponents: nodeLabels,
          },
          recommendation: `Add the missing component(s): ${missingComponents.join(', ')} to the Block Diagram canvas before proceeding.`,
          sourceScreen: context.currentScreen || 'BlockDiagram',
          targetScreen: 'Block Diagram',
          targetRoute: '/BlockDiagram',
          affectedComponents: missingComponents,
          canAutoFix: false,
        };
      }

      return { valid: true };
    },
  },

  {
    id: 'blockDiagram:component-connections',
    workflowArea: 'block-diagram',
    ruleName: 'Component Connections',
    severity: ValidationSeverity.WARNING,
    trigger: [
      ValidationAction.BLOCK_DIAGRAM_SAVE,
      ValidationAction.SIMULATION_START,
    ],
    validate: async (context) => {
      const edges = context.blockDiagram?.edges || context.edges || context.diagramData?.blockDiagram?.connections || [];
      const nodes = extractBlockDiagramNodes(context);

      if (nodes.length > 1 && edges.length === 0) {
        return {
          valid: false,
          violationCode: 'BLOCK_DIAGRAM_UNCONNECTED',
          title: 'Workflow Warning',
          ruleName: 'Block Diagram Unconnected Nodes',
          message: 'Block Diagram components are not interconnected.',
          reason: 'Hardware blocks exist on the canvas but no data or bus connections exist between them.',
          recommendation: 'Draw connections between the MCU and peripheral modules.',
          sourceScreen: context.currentScreen || 'BlockDiagram',
          targetScreen: 'Block Diagram',
          targetRoute: '/BlockDiagram',
          canAutoFix: false,
        };
      }
      return { valid: true };
    },
  },

  {
    id: 'blockDiagram:data-flow-valid',
    workflowArea: 'block-diagram',
    ruleName: 'Data Flow Valid',
    severity: ValidationSeverity.ERROR,
    trigger: [
      ValidationAction.BLOCK_DIAGRAM_VALIDATE,
      ValidationAction.SIMULATION_START,
    ],
    validate: async (context) => {
      const edges = context.blockDiagram?.edges || context.edges || [];
      const invalidEdges = edges.filter((e) => !e.source || !e.target);
      if (invalidEdges.length > 0) {
        return {
          valid: false,
          violationCode: 'INVALID_EDGE_TARGET',
          title: 'Workflow Rule Violation',
          ruleName: 'Block Diagram Connection Invalid',
          message: 'One or more connections in the Block Diagram have invalid or missing source/target endpoints.',
          reason: 'Dangling connection wires can cause ambiguity during firmware pin mapping.',
          recommendation: 'Remove or reconnect any dangling wires on the canvas.',
          sourceScreen: context.currentScreen || 'BlockDiagram',
          targetScreen: 'Block Diagram',
          targetRoute: '/BlockDiagram',
          canAutoFix: false,
        };
      }
      return { valid: true };
    },
  },

  {
    id: 'blockDiagram:no-missing-required-components',
    workflowArea: 'block-diagram',
    ruleName: 'Core MCU Represented',
    severity: ValidationSeverity.ERROR,
    trigger: [
      ValidationAction.BLOCK_DIAGRAM_SAVE,
      ValidationAction.SIMULATION_START,
      ValidationAction.CODE_GENERATE,
      ValidationAction.FLASH_START,
    ],
    validate: async (context) => {
      const nodes = extractBlockDiagramNodes(context);
      if (nodes.length === 0) return { valid: true };

      const productComponents = extractProductComponents(context);
      const mcuKeywords = ['esp32', 'mcu', 'stm32', 'nrf', 'microcontroller', 'processor', 'soc', 'controller', 'arduino', 'rp2040', 'pic'];

      const productRequiresMCU = Boolean(
        context.board ||
        context.product?.mcu ||
        context.productDefinition?.mcu ||
        productComponents.some((c) => mcuKeywords.some((kw) => c.toLowerCase().includes(kw)))
      );

      const hasMCU = nodes.some((n) => {
        const text = `${n.data?.label || ''} ${n.data?.name || ''} ${n.name || ''} ${n.symbol?.name || ''} ${n.type || ''}`.toLowerCase();
        return mcuKeywords.some((kw) => text.includes(kw));
      });

      if (!hasMCU && productRequiresMCU) {
        return {
          valid: false,
          violationCode: 'MCU_NODE_MISSING',
          title: 'Workflow Rule Violation',
          ruleName: 'Microcontroller Node Required',
          message: 'No Microcontroller (MCU) node found in the Block Diagram.',
          reason: 'The architecture requires a central MCU processing block to route sensor data and execute firmware.',
          recommendation: 'Add an MCU block (e.g. ESP32-S3, STM32, or NRF52) to the canvas.',
          sourceScreen: context.currentScreen || 'BlockDiagram',
          targetScreen: 'Block Diagram',
          targetRoute: '/BlockDiagram',
          canAutoFix: false,
        };
      }
      return { valid: true };
    },
  },
];
