/**
 * InnoIDE Centralized Validation Manager
 * Manages rule registration, action-aware validation, workflow order checks,
 * staleness propagation, and global validation reporting.
 */

import { WorkflowStage, ValidationSeverity, ValidationStatus } from './types.js';
import { workflowValidator } from './workflow/workflowValidator.js';
import { WORKFLOW_DEPENDENCIES, STALENESS_GRAPH } from './workflow/workflowRules.js';
import { dispatchWorkflowViolation, dispatchWorkflowStateChanged } from './workflow/workflowEvents.js';

// Import all stage rules
import { projectRules } from './rules/projectRules.js';
import { productRules } from './rules/productRules.js';
import { blockDiagramRules } from './rules/blockDiagramRules.js';
import { flowchartRules } from './rules/flowchartRules.js';
import { simulationRules } from './rules/simulationRules.js';
import { codeRules } from './rules/codeRules.js';
import { flasherRules } from './rules/flasherRules.js';

class ValidationManager {
  constructor() {
    this.rules = new Map();
    this.stageStatuses = {
      [WorkflowStage.CREATE_PROJECT]: ValidationStatus.NOT_VALIDATED,
      [WorkflowStage.DEFINE_PRODUCT]: ValidationStatus.NOT_VALIDATED,
      [WorkflowStage.BLOCK_DIAGRAM]: ValidationStatus.NOT_VALIDATED,
      [WorkflowStage.LOGIC_DIAGRAM]: ValidationStatus.NOT_VALIDATED,
      [WorkflowStage.SIMULATE]: ValidationStatus.NOT_VALIDATED,
      [WorkflowStage.WRITE_CODE]: ValidationStatus.NOT_VALIDATED,
      [WorkflowStage.FLASH]: ValidationStatus.NOT_VALIDATED,
    };
    this.lastReport = null;
    this.activeViolation = null;
    this.listeners = new Set();
    this.violationListeners = new Set();

    // Register all default workflow rules
    this.registerRules([
      ...projectRules,
      ...productRules,
      ...blockDiagramRules,
      ...flowchartRules,
      ...simulationRules,
      ...codeRules,
      ...flasherRules,
    ]);
  }

  registerRule(rule) {
    if (!rule || !rule.id) return;
    this.rules.set(rule.id, rule);
  }

  registerRules(rules = []) {
    rules.forEach((r) => this.registerRule(r));
  }

  /**
   * Action-Aware Validation Entry Point:
   * Validates both workflow-order prerequisites and specific semantic rules
   * for an operation boundary (e.g. 'product.create', 'simulation.start', 'flash.start').
   */
  async validateAction(action, context = {}) {
    const enrichedContext = { ...context, action };

    // 1. Identify which workflow stage this action belongs to
    let targetStage = null;
    for (const [stg, meta] of Object.entries(WORKFLOW_DEPENDENCIES)) {
      if (meta.actionTriggers?.includes(action)) {
        targetStage = stg;
        break;
      }
    }

    // 2. Perform Workflow Order Check
    if (targetStage) {
      const orderCheck = workflowValidator.canEnterStage(targetStage, enrichedContext);
      if (!orderCheck.allowed && orderCheck.violation) {
        this.setActiveViolation(orderCheck.violation);
        return {
          valid: false,
          violation: orderCheck.violation,
          allViolations: [orderCheck.violation],
          warnings: [],
          infos: [],
        };
      }
    }

    // 3. Find and run all rules triggered by this action
    const triggeredRules = Array.from(this.rules.values()).filter(
      (r) => Array.isArray(r.trigger) && r.trigger.includes(action)
    );

    const violations = [];
    const warnings = [];
    const infos = [];

    for (const rule of triggeredRules) {
      try {
        const result = await rule.validate(enrichedContext);
        if (!result.valid) {
          const item = {
            id: rule.id,
            severity: rule.severity || ValidationSeverity.ERROR,
            ruleName: rule.ruleName,
            workflowArea: rule.workflowArea,
            ...result,
            blockingAction: action,
          };

          if (rule.severity === ValidationSeverity.ERROR) {
            violations.push(item);
          } else if (rule.severity === ValidationSeverity.WARNING) {
            warnings.push(item);
          } else {
            infos.push(item);
          }
        }
      } catch (err) {
        console.error(`[ValidationManager] Error executing rule ${rule.id}:`, err);
      }
    }

    // 4. Update stage status
    if (targetStage) {
      if (violations.length > 0) {
        this.setStageStatus(targetStage, ValidationStatus.INVALID);
      } else if (warnings.length > 0) {
        this.setStageStatus(targetStage, ValidationStatus.WARNING);
      } else {
        this.setStageStatus(targetStage, ValidationStatus.VALID);
      }
    }

    // 5. Handle blocking violations
    if (violations.length > 0) {
      const primaryViolation = violations[0];
      this.setActiveViolation(primaryViolation);
      return {
        valid: false,
        violation: primaryViolation,
        violations,
        allViolations: violations,
        warnings,
        infos,
      };
    }

    // If no blocking errors exist, clear active violation for this action
    if (this.activeViolation?.blockingAction === action) {
      this.clearActiveViolation();
    }

    return {
      valid: true,
      violation: null,
      violations: [],
      allViolations: [],
      warnings,
      infos,
    };
  }

  /**
   * Validates all rules associated with a specific workflow stage.
   */
  async validateStage(stage, context = {}) {
    const stageRules = Array.from(this.rules.values()).filter(
      (r) => r.workflowArea === stage
    );

    const violations = [];
    const warnings = [];

    for (const rule of stageRules) {
      try {
        const result = await rule.validate(context);
        if (!result.valid) {
          if (rule.severity === ValidationSeverity.ERROR) {
            violations.push({ id: rule.id, ...result });
          } else {
            warnings.push({ id: rule.id, ...result });
          }
        }
      } catch (e) {
        console.error(`[ValidationManager] Stage check error:`, e);
      }
    }

    if (violations.length > 0) {
      this.setStageStatus(stage, ValidationStatus.INVALID);
    } else if (warnings.length > 0) {
      this.setStageStatus(stage, ValidationStatus.WARNING);
    } else {
      this.setStageStatus(stage, ValidationStatus.VALID);
    }

    return {
      status: this.stageStatuses[stage],
      violations,
      warnings,
    };
  }

  /**
   * Generates a global validation report across all 7 stages.
   */
  async validateAll(context = {}) {
    const stages = Object.values(WorkflowStage);
    const report = {};

    for (const stage of stages) {
      report[stage] = await this.validateStage(stage, context);
    }

    this.lastReport = report;
    this.notifyListeners();
    return report;
  }

  /**
   * Marks dependent stages as STALE when upstream configuration changes.
   */
  markStageStale(stage) {
    const dependents = STALENESS_GRAPH[stage] || [];
    dependents.forEach((depStage) => {
      if (this.stageStatuses[depStage] !== ValidationStatus.NOT_VALIDATED) {
        this.stageStatuses[depStage] = ValidationStatus.STALE;
      }
    });
    this.notifyListeners();
  }

  canEnterStage(stage, context = {}) {
    return workflowValidator.canEnterStage(stage, context);
  }

  setStageStatus(stage, status) {
    if (this.stageStatuses[stage] !== status) {
      this.stageStatuses[stage] = status;
      this.notifyListeners();
    }
  }

  getStageStatus(stage) {
    return this.stageStatuses[stage] || ValidationStatus.NOT_VALIDATED;
  }

  getAllStageStatuses() {
    return { ...this.stageStatuses };
  }

  setActiveViolation(violation) {
    this.activeViolation = violation;
    dispatchWorkflowViolation(violation);
    this.violationListeners.forEach((listener) => {
      try {
        listener(violation);
      } catch (e) {
        console.error('[ValidationManager] Error in violation listener:', e);
      }
    });
  }

  clearActiveViolation() {
    this.activeViolation = null;
    this.violationListeners.forEach((listener) => {
      try {
        listener(null);
      } catch (e) {
        console.error('[ValidationManager] Error in violation listener:', e);
      }
    });
  }

  onStateChange(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onViolation(listener) {
    this.violationListeners.add(listener);
    return () => this.violationListeners.delete(listener);
  }

  notifyListeners() {
    const snapshot = this.getAllStageStatuses();
    dispatchWorkflowStateChanged(snapshot);
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (e) {
        console.error('[ValidationManager] Error in state listener:', e);
      }
    });
  }
}

export const validationManager = new ValidationManager();
export { ValidationManager };
export default validationManager;
