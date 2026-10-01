/**
 * Simulation Validation Rules
 * Validates virtual simulation state, behavioral verification, and runtime correctness.
 */

import { ValidationSeverity, ValidationAction } from '../types.js';
import { extractProductComponents, matchesComponent } from './blockDiagramRules.js';

export const extractSimulationComponents = (context = {}) => {
  let comps =
    context.simulation?.droppedItems ||
    context.simulation?.components ||
    context.simulation?.symbols ||
    context.droppedItems ||
    context.symbols ||
    context.components ||
    context.diagramData?.simulation?.data?.symbols ||
    context.diagramData?.simulation?.data?.simulationDiagram ||
    context.diagramData?.simulation?.data?.components;

  if (Array.isArray(comps) && comps.length > 0) {
    return comps;
  }

  // Handle simulation tabs if passed
  if (Array.isArray(context.simulation?.tabs)) {
    const allSymbols = [];
    context.simulation.tabs.forEach((t) => {
      const syms = t?.symbols || t?.state?.symbols || t?.state?.nodes || [];
      if (Array.isArray(syms)) allSymbols.push(...syms);
    });
    if (allSymbols.length > 0) return allSymbols;
  }

  // Try localStorage if available in browser
  if (typeof localStorage !== 'undefined') {
    const projId = context.projectId || context.project?.id || localStorage.getItem('activeProjectId');
    const projName = context.projectName || context.project?.name || localStorage.getItem('activeProjectName');
    const userId = context.userId || localStorage.getItem('userId') || 'default';

    const keysToTry = [
      projId && `innoide:autosave:${userId}:${projId}:simulation:canvas`,
      projId && `innoide:autosave:${userId}:${projId}:/simulation`,
      projName && `innoide:autosave:${userId}:${projName}:simulation:canvas`,
      projName && `innoide:autosave:${userId}:${projName}:/simulation`,
      'innoide:simulation_canvas',
      'innoide:simulation_data',
    ].filter(Boolean);

    for (const key of keysToTry) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          const found =
            parsed?.droppedItems ||
            parsed?.symbols ||
            parsed?.components ||
            parsed?.data?.droppedItems ||
            parsed?.data?.symbols ||
            parsed?.data?.components;
          if (Array.isArray(found) && found.length > 0) {
            return found;
          }
          if (Array.isArray(parsed?.tabs)) {
            const allSyms = [];
            parsed.tabs.forEach((t) => {
              if (Array.isArray(t?.symbols)) allSyms.push(...t.symbols);
            });
            if (allSyms.length > 0) return allSyms;
          }
        }
      } catch (e) {}
    }
  }

  return Array.isArray(comps) ? comps : [];
};

export const simulationRules = [
  {
    id: 'simulation:has-components',
    workflowArea: 'simulate',
    ruleName: 'Simulation Components Required',
    severity: ValidationSeverity.ERROR,
    trigger: [
      ValidationAction.SIMULATION_VALIDATE,
      ValidationAction.SIMULATION_SAVE,
    ],
    validate: async (context) => {
      const items = extractSimulationComponents(context);
      if (!Array.isArray(items) || items.length === 0) {
        return {
          valid: false,
          violationCode: 'SIMULATION_EMPTY',
          title: 'Workflow Rule Violation',
          ruleName: 'Simulation Components Required',
          message: 'The Simulation contains no components.',
          displayMessage: 'The Simulation contains no components.',
          reason: 'At least one component must be placed on the Simulation canvas before validating.',
          recommendation: 'Drag sensors, actuators, or microcontrollers from the left palette onto the Simulation canvas.',
          sourceScreen: context.currentScreen || 'Simulation',
          targetScreen: 'Simulation',
          targetRoute: '/simulation',
          canAutoFix: false,
        };
      }
      return { valid: true };
    },
  },

  {
    id: 'simulation:product-consistency',
    workflowArea: 'simulate',
    ruleName: 'Product ↔ Simulation Consistency',
    severity: ValidationSeverity.ERROR,
    trigger: [
      ValidationAction.SIMULATION_SAVE,
      ValidationAction.SIMULATION_VALIDATE,
      ValidationAction.SIMULATION_START,
    ],
    validate: async (context) => {
      const productComponents = extractProductComponents(context);
      if (productComponents.length === 0) {
        return { valid: true };
      }

      const simItems = extractSimulationComponents(context);
      const simLabels = simItems
        .map((item) => {
          return (
            item?.symbol?.name ||
            item?.symbol?.title ||
            item?.symbol?.label ||
            item?.name ||
            item?.title ||
            item?.label ||
            item?.type ||
            (typeof item === 'string' ? item : '')
          );
        })
        .filter(Boolean);

      const missingComponents = productComponents.filter(
        (comp) => !matchesComponent(comp, simLabels)
      );

      if (missingComponents.length > 0) {
        return {
          valid: false,
          violationCode: 'PRODUCT_SIMULATION_MISSING',
          title: 'Workflow Rule Violation',
          ruleName: 'Product ↔ Simulation Consistency',
          message: 'The defined product does not match the product specified in the simulation.',
          reason: `The Product defines ${productComponents.length} component(s) (${productComponents.join(', ')}), but the Simulation is missing ${missingComponents.length} of them: ${missingComponents.join(', ')}.`,
          details: {
            definedComponents: productComponents,
            missingComponents: missingComponents,
            canvasComponents: simLabels,
          },
          recommendation: `Add the missing component(s): ${missingComponents.join(', ')} to the Simulation canvas before proceeding.`,
          sourceScreen: context.currentScreen || 'Simulation',
          targetScreen: 'View Product',
          targetRoute: '/simulation',
          targetAction: 'open-view-product',
          affectedComponents: missingComponents,
          canAutoFix: false,
        };
      }

      return { valid: true };
    },
  },
  {
    id: 'simulation:diagram-consistency',
    workflowArea: 'simulate',
    ruleName: 'Diagram Simulation Parity',
    severity: ValidationSeverity.ERROR,
    trigger: [
      ValidationAction.SIMULATION_START,
      ValidationAction.CODE_GENERATE,
      ValidationAction.FLASH_START,
    ],
    validate: async (context) => {
      const simComponents = context.simulation?.components || context.simulation?.tabs || [];
      const diagramNodes = context.blockDiagram?.nodes || context.diagramData?.blockDiagram?.data || [];

      if (diagramNodes.length > 0 && Array.isArray(simComponents)) {
        const unmodeled = diagramNodes.filter((node) => {
          const label = (node.data?.label || node.name || '').toLowerCase();
          if (!label) return false;
          return !simComponents.some((c) => {
            const cName = (c.name || c.title || '').toLowerCase();
            return cName.includes(label) || label.includes(cName);
          });
        });

        if (unmodeled.length > 0 && simComponents.length > 0) {
          const names = unmodeled.map((n) => n.data?.label || n.name);
          return {
            valid: false,
            violationCode: 'SIMULATION_COMPONENT_UNRESOLVED',
            title: 'Workflow Rule Violation',
            ruleName: 'Simulation / Diagram Consistency',
            message: 'Simulation validation failed.',
            reason: `The simulation model contains unresolved components: ${names.join(', ')}.`,
            details: { unresolvedComponents: names },
            recommendation: 'Configure virtual simulation parameters for all diagram blocks to verify complete system behavior.',
            sourceScreen: context.currentScreen || 'Simulation',
            targetScreen: 'Simulation',
            targetRoute: '/simulation',
            canAutoFix: false,
          };
        }
      }
      return { valid: true };
    },
  },

  {
    id: 'simulation:no-runtime-errors',
    workflowArea: 'simulate',
    ruleName: 'Virtual Execution Valid',
    severity: ValidationSeverity.ERROR,
    trigger: [
      ValidationAction.SIMULATION_START,
      ValidationAction.CODE_GENERATE,
      ValidationAction.FLASH_START,
    ],
    validate: async (context) => {
      if (context.simulation?.runtimeError) {
        return {
          valid: false,
          violationCode: 'SIMULATION_RUNTIME_EXCEPTION',
          title: 'Workflow Rule Violation',
          ruleName: 'Simulation Execution Error',
          message: 'Virtual simulation encountered a runtime exception.',
          reason: context.simulation.runtimeError,
          recommendation: 'Debug virtual memory or logic loops in the simulation environment before generating code.',
          sourceScreen: context.currentScreen || 'Simulation',
          targetScreen: 'Simulation',
          targetRoute: '/simulation',
          canAutoFix: false,
        };
      }
      return { valid: true };
    },
  },

  {
    id: 'simulation:expected-behavior',
    workflowArea: 'simulate',
    ruleName: 'Expected Output Behavior',
    severity: ValidationSeverity.WARNING,
    trigger: [
      ValidationAction.SIMULATION_START,
      ValidationAction.CODE_GENERATE,
    ],
    validate: async (context) => {
      if (context.simulation?.observedOutputs && context.simulation?.expectedOutputs) {
        const mismatches = [];
        for (const [key, expVal] of Object.entries(context.simulation.expectedOutputs)) {
          const obsVal = context.simulation.observedOutputs[key];
          if (obsVal !== expVal) {
            mismatches.push(`${key}: expected ${expVal}, got ${obsVal}`);
          }
        }
        if (mismatches.length > 0) {
          return {
            valid: false,
            violationCode: 'SIMULATION_ASSERTION_FAILED',
            title: 'Workflow Warning',
            ruleName: 'Expected Behavior Divergence',
            message: 'Simulation completed, but expected output state was not observed.',
            reason: mismatches.join('; '),
            recommendation: 'Review the timing assertions in the simulation logic.',
            sourceScreen: context.currentScreen || 'Simulation',
            targetScreen: 'Simulation',
            targetRoute: '/simulation',
            canAutoFix: false,
          };
        }
      }
      return { valid: true };
    },
  },
];
