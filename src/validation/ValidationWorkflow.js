/**
 * InnoIDE Validation Workflow Integration
 * High-level orchestration helper for workflow progression, action protection,
 * and state transitions between InnoIDE stages.
 */

import { validationManager } from './ValidationManager';
import { workflowValidator } from './workflow/workflowValidator';
import { WORKFLOW_DEPENDENCIES, STALENESS_GRAPH } from './workflow/workflowRules';
import {
  dispatchOpenCreateProject,
  dispatchOpenDefineProduct,
  dispatchRevalidate,
} from './workflow/workflowEvents';

export class ValidationWorkflow {
  static canProceed(stage, context) {
    return workflowValidator.canEnterStage(stage, context);
  }

  static async executeGuardedAction(action, context, onAllowed) {
    const result = await validationManager.validateAction(action, context);
    if (!result.valid) {
      return { executed: false, violation: result.violation };
    }
    if (typeof onAllowed === 'function') {
      await onAllowed();
    }
    return { executed: true, violation: null };
  }

  static onProductChanged() {
    validationManager.markStageStale('define-product');
  }

  static onBlockDiagramChanged() {
    validationManager.markStageStale('block-diagram');
  }

  static onLogicDiagramChanged() {
    validationManager.markStageStale('logic-diagram');
  }

  static onCodeChanged() {
    validationManager.markStageStale('write-code');
  }

  static triggerCreateProject() {
    dispatchOpenCreateProject();
  }

  static triggerDefineProduct() {
    dispatchOpenDefineProduct();
  }

  static requestRevalidation(stage) {
    dispatchRevalidate(stage);
  }
}

export { WORKFLOW_DEPENDENCIES, STALENESS_GRAPH };
