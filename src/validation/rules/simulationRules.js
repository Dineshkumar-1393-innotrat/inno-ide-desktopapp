/**
 * Simulation Validation Rules
 * Validates virtual simulation state, behavioral verification, and runtime correctness.
 */

import { ValidationSeverity, ValidationAction } from '../types.js';

export const simulationRules = [
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
