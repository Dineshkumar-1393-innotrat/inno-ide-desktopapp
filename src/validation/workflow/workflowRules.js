/**
 * InnoIDE Workflow Rules & Dependencies
 * Defines the sequential prerequisites and staleness graph between workflow stages.
 */

import { WorkflowStage, ValidationAction } from '../types.js';

export const WORKFLOW_DEPENDENCIES = {
  [WorkflowStage.CREATE_PROJECT]: {
    previous: null,
    required: [],
    displayName: 'Create Project',
    actionTriggers: [ValidationAction.PROJECT_CREATE, ValidationAction.PROJECT_SAVE],
  },

  [WorkflowStage.DEFINE_PRODUCT]: {
    previous: WorkflowStage.CREATE_PROJECT,
    required: ['project'],
    displayName: 'Define Product',
    actionTriggers: [ValidationAction.PRODUCT_CREATE, ValidationAction.PRODUCT_SAVE],
  },

  [WorkflowStage.BLOCK_DIAGRAM]: {
    previous: WorkflowStage.DEFINE_PRODUCT,
    required: ['project', 'product'],
    displayName: 'Block Diagram',
    actionTriggers: [ValidationAction.BLOCK_DIAGRAM_SAVE, ValidationAction.BLOCK_DIAGRAM_VALIDATE],
  },

  [WorkflowStage.LOGIC_DIAGRAM]: {
    previous: WorkflowStage.BLOCK_DIAGRAM,
    required: ['project', 'product', 'blockDiagram'],
    displayName: 'Logic Diagram',
    actionTriggers: [ValidationAction.FLOWCHART_SAVE, ValidationAction.FLOWCHART_VALIDATE],
  },

  [WorkflowStage.SIMULATE]: {
    previous: WorkflowStage.LOGIC_DIAGRAM,
    required: ['project', 'product', 'blockDiagram', 'logicDiagram'],
    displayName: 'Simulate',
    actionTriggers: [
      ValidationAction.SIMULATION_START,
      ValidationAction.SIMULATION_STEP,
      ValidationAction.SIMULATION_VALIDATE,
      ValidationAction.SIMULATION_SAVE,
    ],
  },

  [WorkflowStage.WRITE_CODE]: {
    previous: WorkflowStage.SIMULATE,
    required: ['project', 'product', 'blockDiagram', 'logicDiagram', 'simulation'],
    displayName: 'Write Code',
    actionTriggers: [ValidationAction.CODE_GENERATE, ValidationAction.CODE_COMPILE, ValidationAction.CODE_SAVE],
  },

  [WorkflowStage.FLASH]: {
    previous: WorkflowStage.WRITE_CODE,
    required: ['project', 'product', 'blockDiagram', 'logicDiagram', 'simulation', 'code'],
    displayName: 'Flash',
    actionTriggers: [ValidationAction.FLASH_START],
  },
};

/**
 * Dependency Graph for Staleness:
 * When an upstream stage's configuration or artifact changes, all downstream dependent
 * stages are marked as STALE so that revalidation is triggered before actions execute.
 */
export const STALENESS_GRAPH = {
  [WorkflowStage.CREATE_PROJECT]: [
    WorkflowStage.DEFINE_PRODUCT,
    WorkflowStage.BLOCK_DIAGRAM,
    WorkflowStage.LOGIC_DIAGRAM,
    WorkflowStage.SIMULATE,
    WorkflowStage.WRITE_CODE,
    WorkflowStage.FLASH,
  ],
  [WorkflowStage.DEFINE_PRODUCT]: [
    WorkflowStage.BLOCK_DIAGRAM,
    WorkflowStage.LOGIC_DIAGRAM,
    WorkflowStage.SIMULATE,
    WorkflowStage.WRITE_CODE,
    WorkflowStage.FLASH,
  ],
  [WorkflowStage.BLOCK_DIAGRAM]: [
    WorkflowStage.LOGIC_DIAGRAM,
    WorkflowStage.SIMULATE,
    WorkflowStage.WRITE_CODE,
    WorkflowStage.FLASH,
  ],
  [WorkflowStage.LOGIC_DIAGRAM]: [
    WorkflowStage.SIMULATE,
    WorkflowStage.WRITE_CODE,
    WorkflowStage.FLASH,
  ],
  [WorkflowStage.SIMULATE]: [
    WorkflowStage.WRITE_CODE,
    WorkflowStage.FLASH,
  ],
  [WorkflowStage.WRITE_CODE]: [
    WorkflowStage.FLASH,
  ],
  [WorkflowStage.FLASH]: [],
};
