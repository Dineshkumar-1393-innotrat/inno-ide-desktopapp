/**
 * InnoIDE Validation System Entry Point
 */

export * from './types.js';
import validationManager, { ValidationManager } from './ValidationManager.js';
export { validationManager, ValidationManager };
export default validationManager;
export { workflowValidator } from './workflow/workflowValidator.js';
export { WORKFLOW_DEPENDENCIES, STALENESS_GRAPH } from './workflow/workflowRules.js';
export {
  WORKFLOW_EVENTS,
  dispatchWorkflowViolation,
  dispatchWorkflowStateChanged,
  dispatchRevalidate,
  dispatchOpenCreateProject,
  dispatchOpenDefineProduct,
} from './workflow/workflowEvents.js';
export { ValidationWorkflow } from './ValidationWorkflow.js';
export { ValidationProvider, useValidationContext } from './ValidationContext.jsx';
export { useValidation } from './useValidation.js';

// Components
export { default as ValidationViolationModal } from './components/ValidationViolationModal.jsx';
export { default as ValidationReportModal } from './components/ValidationReportModal.jsx';
export { default as ValidationBadge } from './components/ValidationBadge.jsx';
export { default as ValidationStatusBadge } from './components/ValidationStatusBadge.jsx';
export { default as ValidationChecklist } from './components/ValidationChecklist.jsx';
