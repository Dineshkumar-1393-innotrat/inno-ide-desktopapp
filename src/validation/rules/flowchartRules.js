/**
 * Flowchart / Logic Diagram Validation Rules
 * Validates algorithmic logic flows, decision branches, connectivity, and pin assignments.
 */

import { ValidationSeverity, ValidationAction } from '../types.js';
import { extractProductComponents, matchesComponent } from './blockDiagramRules.js';

export const extractFlowchartNodes = (context = {}) => {
  let nodes = context.flowchart?.nodes || context.nodes || context.diagramData?.flowchart?.data;
  if (Array.isArray(nodes) && nodes.length > 0) {
    return nodes;
  }

  if (typeof localStorage !== 'undefined') {
    const projId = context.projectId || context.project?.id || localStorage.getItem('activeProjectId');
    const projName = context.projectName || context.project?.name || localStorage.getItem('activeProjectName');
    const userId = context.userId || 'default';

    const keysToTry = [
      projId && `innoide:flowchart_tabs:${userId}:${projId}`,
      projId && `innoide:flowchart_tabs:${projId}`,
      projName && `innoide:flowchart_tabs:${projName}`,
      'innoide:flowchart_nodes',
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

export const flowchartRules = [
  {
    id: 'diagram:has-start',
    workflowArea: 'logic-diagram',
    ruleName: 'Start Node Exists',
    severity: ValidationSeverity.ERROR,
    trigger: [
      ValidationAction.FLOWCHART_VALIDATE,
      ValidationAction.SIMULATION_START,
      ValidationAction.CODE_GENERATE,
    ],
    validate: async (context) => {
      const nodes = context.flowchart?.nodes || context.diagramData?.flowchart?.data || [];
      if (nodes.length === 0) return { valid: true };

      const hasStart = nodes.some((n) => {
        const type = (n.type || '').toLowerCase();
        const label = (n.data?.label || n.name || '').toLowerCase();
        return type === 'terminator' || type === 'start' || label.includes('start') || label.includes('begin');
      });

      if (!hasStart) {
        return {
          valid: false,
          violationCode: 'START_NODE_MISSING',
          title: 'Workflow Rule Violation',
          ruleName: 'Flowchart Start Node Required',
          message: 'The flowchart does not contain an entry point (Start / Terminator node).',
          displayMessage: 'The flowchart does not contain an entry point (Start / Terminator node).',
          reason: 'The flowchart does not contain an entry point (Start / Terminator node).',
          recommendation: 'Add a Start node to define where code execution begins.',
          sourceScreen: context.currentScreen || 'Flowchart',
          targetScreen: 'Logic Diagram',
          targetRoute: '/FlowchartTest',
          canAutoFix: false,
        };
      }
      return { valid: true };
    },
  },

  {
    id: 'diagram:decision-branches',
    workflowArea: 'logic-diagram',
    ruleName: 'Decision Branches Valid',
    severity: ValidationSeverity.ERROR,
    trigger: [
      ValidationAction.FLOWCHART_VALIDATE,
      ValidationAction.SIMULATION_START,
      ValidationAction.CODE_GENERATE,
    ],
    validate: async (context) => {
      const nodes = context.flowchart?.nodes || context.diagramData?.flowchart?.data || [];
      const edges = context.flowchart?.edges || context.diagramData?.flowchart?.connections || [];

      // Find decision nodes (diamond / condition)
      const decisionNodes = nodes.filter((n) => {
        const type = (n.type || '').toLowerCase();
        const label = (n.data?.label || n.name || '').toLowerCase();
        return type === 'decision' || type === 'condition' || label.startsWith('if') || label.includes('?');
      });

      for (const decNode of decisionNodes) {
        const outgoingEdges = edges.filter((e) => e.source === decNode.id);
        if (outgoingEdges.length < 2) {
          const decLabel = decNode.data?.label || decNode.name || 'Decision';
          return {
            valid: false,
            violationCode: 'DECISION_BRANCHES_INCOMPLETE',
            title: 'Workflow Rule Violation',
            ruleName: 'Decision Branches Required',
            message: `The Decision node "${decLabel}" does not contain the required outgoing branches.`,
            displayMessage: `The Decision node "${decLabel}" does not contain the required outgoing branches.`,
            reason: `The Decision node "${decLabel}" does not contain the required outgoing branches.`,
            details: {
              nodeId: decNode.id,
              nodeLabel: decLabel,
              expectedBranches: ['TRUE / FALSE', 'YES / NO'],
              currentBranchesCount: outgoingEdges.length,
            },
            recommendation: 'Connect at least two outgoing branches (e.g. TRUE/FALSE or YES/NO) from the Decision node.',
            sourceScreen: context.currentScreen || 'Flowchart',
            targetScreen: 'Logic Diagram',
            targetRoute: '/FlowchartTest',
            targetElementId: decNode.id,
            canAutoFix: false,
          };
        }
      }

      return { valid: true };
    },
  },

  {
    id: 'diagram:no-orphans',
    workflowArea: 'logic-diagram',
    ruleName: 'No Disconnected Nodes',
    severity: ValidationSeverity.WARNING,
    trigger: [
      ValidationAction.FLOWCHART_VALIDATE,
      ValidationAction.SIMULATION_START,
    ],
    validate: async (context) => {
      const nodes = context.flowchart?.nodes || context.diagramData?.flowchart?.data || [];
      const edges = context.flowchart?.edges || context.diagramData?.flowchart?.connections || [];

      if (nodes.length <= 1) return { valid: true };

      const connectedNodeIds = new Set();
      edges.forEach((e) => {
        if (e.source) connectedNodeIds.add(e.source);
        if (e.target) connectedNodeIds.add(e.target);
      });

      const orphanNodes = nodes.filter((n) => !connectedNodeIds.has(n.id));
      if (orphanNodes.length > 0) {
        const names = orphanNodes.map((n) => n.data?.label || n.name || n.id);
        return {
          valid: false,
          violationCode: 'ORPHAN_NODES_DETECTED',
          title: 'Workflow Warning',
          ruleName: 'Disconnected Diagram Nodes',
          message: `Disconnected nodes found in logic diagram: ${names.join(', ')}.`,
          displayMessage: `Disconnected nodes found in logic diagram: ${names.join(', ')}.`,
          reason: `The following node(s) are not connected to the execution flow: ${names.join(', ')}.`,
          details: { orphanNodes: names },
          recommendation: 'Connect or remove unused nodes to ensure all logic steps are reachable.',
          sourceScreen: context.currentScreen || 'Flowchart',
          targetScreen: 'Logic Diagram',
          targetRoute: '/FlowchartTest',
          canAutoFix: false,
        };
      }
      return { valid: true };
    },
  },

  {
    id: 'diagram:pin-collision',
    workflowArea: 'logic-diagram',
    ruleName: 'No GPIO Pin Collisions',
    severity: ValidationSeverity.ERROR,
    trigger: [
      ValidationAction.FLOWCHART_VALIDATE,
      ValidationAction.CODE_GENERATE,
      ValidationAction.FLASH_START,
    ],
    validate: async (context) => {
      const nodes = context.flowchart?.nodes || [];
      const assignedPins = new Map();

      for (const node of nodes) {
        const pin = node.data?.pin || node.data?.gpio;
        if (pin !== undefined && pin !== null && pin !== '') {
          if (assignedPins.has(pin)) {
            const conflicting = assignedPins.get(pin);
            return {
              valid: false,
              violationCode: 'GPIO_PIN_COLLISION',
              title: 'Workflow Rule Violation',
              ruleName: 'Hardware Pin Collision',
              message: `Both "${conflicting}" and "${node.data?.label || 'Node'}" are assigned to GPIO ${pin}.`,
              displayMessage: `Both "${conflicting}" and "${node.data?.label || 'Node'}" are assigned to GPIO ${pin}.`,
              reason: `Both "${conflicting}" and "${node.data?.label || 'Node'}" are assigned to GPIO ${pin}.`,
              details: {
                pin,
                firstComponent: conflicting,
                secondComponent: node.data?.label,
              },
              recommendation: `Reassign one of the components to an alternate unused GPIO pin before continuing.`,
              sourceScreen: context.currentScreen || 'Flowchart',
              targetScreen: 'Logic Diagram',
              targetRoute: '/FlowchartTest',
              canAutoFix: false,
            };
          }
          assignedPins.set(pin, node.data?.label || `Node ${node.id}`);
        }
      }
      return { valid: true };
    },
  },

  {
    id: 'flowchart:product-consistency',
    workflowArea: 'logic-diagram',
    ruleName: 'Product ↔ Flowchart Consistency',
    severity: ValidationSeverity.ERROR,
    trigger: [
      ValidationAction.FLOWCHART_VALIDATE,
      ValidationAction.FLOWCHART_SAVE,
    ],
    validate: async (context) => {
      const productComponents = extractProductComponents(context);
      if (productComponents.length === 0) {
        return { valid: true };
      }

      const nodes = extractFlowchartNodes(context);
      if (nodes.length === 0) {
        return { valid: true };
      }

      const nodeLabels = nodes
        .map((n) => {
          return (
            n.data?.label ||
            n.data?.name ||
            n.data?.component ||
            n.data?.text ||
            n.data?.action ||
            n.label ||
            n.name ||
            n.type ||
            ''
          );
        })
        .filter(Boolean);

      const missingComponents = productComponents.filter(
        (comp) => !matchesComponent(comp, nodeLabels)
      );

      if (missingComponents.length > 0) {
        return {
          valid: false,
          violationCode: 'PRODUCT_FLOWCHART_MISSING',
          title: 'Workflow Rule Violation',
          ruleName: 'Product ↔ Flowchart Consistency',
          message: 'The defined product does not match the product specified in the flowchart.',
          reason: `The Product defines ${productComponents.length} component(s) (${productComponents.join(', ')}), but the Flowchart is missing ${missingComponents.length} of them: ${missingComponents.join(', ')}.`,
          details: {
            definedComponents: productComponents,
            missingComponents: missingComponents,
            canvasComponents: nodeLabels,
          },
          recommendation: `Add or reference the missing component(s): ${missingComponents.join(', ')} in the Flowchart before proceeding.`,
          sourceScreen: context.currentScreen || 'Flowchart',
          targetScreen: 'Logic Diagram',
          targetRoute: '/FlowchartTest',
          affectedComponents: missingComponents,
          canAutoFix: false,
        };
      }

      return { valid: true };
    },
  },
];
