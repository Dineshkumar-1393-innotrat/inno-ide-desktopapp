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

  const mcu = context.product?.mcu || context.productDefinition?.mcu;
  if (mcu && typeof mcu === 'string' && mcu.trim() && !list.includes(mcu.trim())) {
    list.unshift(mcu.trim());
  }

  return list;
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

export const matchesComponent = (compName, nodeLabels) => {
  const normComp = normalizeText(compName);
  if (!normComp) return false;

  return nodeLabels.some((nodeLabel) => {
    const normNode = normalizeText(nodeLabel);
    if (!normNode) return false;

    // 1. Exact match
    if (normNode === normComp) return true;

    // 2. Substring match
    if (normNode.includes(normComp) || normComp.includes(normNode)) return true;

    // 3. Significant word token overlap (words of length >= 3)
    const compWords = compName.toLowerCase().split(/[\s\-_/]+/).filter((w) => w.length >= 3);
    const nodeWords = nodeLabel.toLowerCase().split(/[\s\-_/]+/).filter((w) => w.length >= 3);
    const hasWordOverlap = compWords.some((cw) =>
      nodeWords.some((nw) => nw.includes(cw) || cw.includes(nw))
    );
    if (hasWordOverlap) return true;

    // 4. Semantic aliases
    const aliases = {
      esp32: ['mcu', 'microcontroller', 'controller', 'processor', 'esp'],
      mcu: ['esp32', 'esp', 'stm32', 'arduino', 'controller', 'processor', 'rp2040'],
      microcontroller: ['esp32', 'esp', 'stm32', 'arduino', 'mcu', 'processor'],
      temperature: ['temp', 'dht11', 'dht22', 'lm35', 'bmp280', 'sensor'],
      humidity: ['dht11', 'dht22', 'moisture', 'sensor'],
      sensor: ['detector', 'probe'],
      switch: ['button', 'pushbutton', 'toggle', 'key', 'btn'],
      button: ['switch', 'pushbutton', 'toggle', 'key'],
      led: ['light', 'diode', 'indicator'],
      display: ['oled', 'lcd', 'screen'],
      oled: ['display', 'screen'],
      lcd: ['display', 'screen'],
      motor: ['actuator', 'servo', 'stepper'],
      buzzer: ['alarm', 'beeper', 'speaker', 'sounder', 'audio'],
      relay: ['switch', 'contactor'],
      potentiometer: ['pot', 'dial', 'knob', 'resistor'],
    };

    for (const [key, syns] of Object.entries(aliases)) {
      const compMatchesKey = normComp.includes(key);
      const nodeMatchesKey = normNode.includes(key);
      const compMatchesSyn = syns.some((s) => normComp.includes(s));
      const nodeMatchesSyn = syns.some((s) => normNode.includes(s));

      if ((compMatchesKey && nodeMatchesSyn) || (compMatchesSyn && nodeMatchesKey)) {
        return true;
      }
    }

    return false;
  });
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
