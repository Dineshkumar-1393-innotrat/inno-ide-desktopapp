/**
 * InnoIDE Centralized Validation Types & Enums
 * Based on the InnoIDE General Development Workflow Guide
 */

export const WorkflowStage = {
  CREATE_PROJECT: 'create-project',
  DEFINE_PRODUCT: 'define-product',
  BLOCK_DIAGRAM: 'block-diagram',
  LOGIC_DIAGRAM: 'logic-diagram',
  SIMULATE: 'simulate',
  WRITE_CODE: 'write-code',
  FLASH: 'flash',
};

export const ValidationSeverity = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

export const ValidationStatus = {
  VALID: 'valid',
  INVALID: 'invalid',
  WARNING: 'warning',
  STALE: 'stale',
  NOT_VALIDATED: 'not-validated',
};

export const ValidationAction = {
  PROJECT_CREATE: 'project.create',
  PROJECT_SAVE: 'project.save',
  PRODUCT_CREATE: 'product.create',
  PRODUCT_SAVE: 'product.save',
  BLOCK_DIAGRAM_SAVE: 'blockDiagram.save',
  BLOCK_DIAGRAM_VALIDATE: 'blockDiagram.validate',
  FLOWCHART_SAVE: 'flowchart.save',
  FLOWCHART_VALIDATE: 'flowchart.validate',
  SIMULATION_START: 'simulation.start',
  SIMULATION_STEP: 'simulation.step',
  CODE_GENERATE: 'code.generate',
  CODE_COMPILE: 'code.compile',
  CODE_SAVE: 'code.save',
  FLASH_START: 'flash.start',
};

export const STAGE_METADATA = {
  [WorkflowStage.CREATE_PROJECT]: {
    id: WorkflowStage.CREATE_PROJECT,
    stepNumber: 1,
    title: 'Create Project',
    shortName: 'Project',
    description: 'Initial setup phase establishing the foundational workspace, project name, description, and file structure.',
    route: '/editor',
    actionName: 'Create Project',
  },
  [WorkflowStage.DEFINE_PRODUCT]: {
    id: WorkflowStage.DEFINE_PRODUCT,
    stepNumber: 2,
    title: 'Define Product',
    shortName: 'Product',
    description: 'Configuration of product requirements, Product ID, target MCU, and hardware peripheral specifications.',
    route: '/editor',
    actionName: 'Define Product',
  },
  [WorkflowStage.BLOCK_DIAGRAM]: {
    id: WorkflowStage.BLOCK_DIAGRAM,
    stepNumber: 3,
    title: 'Block Diagram',
    shortName: 'Block Diagram',
    description: 'Visual system architecture and data-flow design mapping interactions between defined hardware components.',
    route: '/BlockDiagram',
    actionName: 'Design Block Diagram',
  },
  [WorkflowStage.LOGIC_DIAGRAM]: {
    id: WorkflowStage.LOGIC_DIAGRAM,
    stepNumber: 4,
    title: 'Logic Diagram',
    shortName: 'Flowchart',
    description: 'Algorithmic flowcharts, sequence diagrams, and state machines defining operational decision logic.',
    route: '/FlowchartTest',
    actionName: 'Create Logic Diagram',
  },
  [WorkflowStage.SIMULATE]: {
    id: WorkflowStage.SIMULATE,
    stepNumber: 5,
    title: 'Simulate',
    shortName: 'Simulation',
    description: 'Pre-hardware validation phase testing system behavior virtually to identify logic errors and prevent damage.',
    route: '/simulation',
    actionName: 'Run Simulation',
  },
  [WorkflowStage.WRITE_CODE]: {
    id: WorkflowStage.WRITE_CODE,
    stepNumber: 6,
    title: 'Write Code',
    shortName: 'Code',
    description: 'Implementation phase translating visual logic into functional firmware code checked against product hardware definitions.',
    route: '/editor',
    actionName: 'Write Code',
  },
  [WorkflowStage.FLASH]: {
    id: WorkflowStage.FLASH,
    stepNumber: 7,
    title: 'Flash',
    shortName: 'Flash',
    description: 'Final deployment operation compiling the firmware program and flashing it directly to target physical hardware.',
    route: '/flasher',
    actionName: 'Flash Hardware',
  },
};
