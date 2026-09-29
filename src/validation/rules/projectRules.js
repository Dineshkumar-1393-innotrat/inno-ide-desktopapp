/**
 * Project Validation Rules
 * Validates project creation, naming, metadata, and workspace structure.
 */

import { ValidationSeverity, ValidationAction } from '../types.js';

export const projectRules = [
  {
    id: 'project:name-required',
    workflowArea: 'create-project',
    ruleName: 'Project Name Required',
    severity: ValidationSeverity.ERROR,
    trigger: [ValidationAction.PROJECT_CREATE, ValidationAction.PROJECT_SAVE],
    validate: async (context) => {
      const name = context.projectName || context.project?.name;
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return {
          valid: false,
          violationCode: 'PROJECT_NAME_EMPTY',
          title: 'Workflow Rule Violation',
          ruleName: 'Project Name Required',
          message: 'Project name is required.',
          reason: 'A project must have a valid non-empty identifier name to establish its workspace.',
          recommendation: 'Enter a valid name for the project before proceeding.',
          canAutoFix: false,
        };
      }
      return { valid: true };
    },
  },
  {
    id: 'project:description-valid',
    workflowArea: 'create-project',
    ruleName: 'Project Description',
    severity: ValidationSeverity.WARNING,
    trigger: [ValidationAction.PROJECT_CREATE, ValidationAction.PROJECT_SAVE],
    validate: async (context) => {
      const desc = context.projectDescription || context.project?.description;
      if (desc && desc.length > 500) {
        return {
          valid: false,
          violationCode: 'PROJECT_DESCRIPTION_TOO_LONG',
          title: 'Workflow Warning',
          ruleName: 'Project Description Limit',
          message: 'Project description exceeds 500 characters.',
          reason: 'Long descriptions may be truncated in project summary views.',
          recommendation: 'Consider shortening the project description.',
          canAutoFix: false,
        };
      }
      return { valid: true };
    },
  },
  {
    id: 'project:structure-valid',
    workflowArea: 'create-project',
    ruleName: 'Project Workspace Structure',
    severity: ValidationSeverity.ERROR,
    trigger: [ValidationAction.PROJECT_CREATE, ValidationAction.PROJECT_SAVE, ValidationAction.PRODUCT_CREATE],
    validate: async (context) => {
      const id = context.projectId || context.project?.id;
      if (!id) {
        return {
          valid: false,
          violationCode: 'PROJECT_NOT_INITIALIZED',
          title: 'Workflow Rule Violation',
          ruleName: 'Project Workspace Structure',
          message: 'Project workspace structure is not initialized.',
          reason: 'The workspace requires a root project folder and ID.',
          recommendation: 'Initialize or create a project workspace.',
          targetAction: 'open-create-project',
          canAutoFix: false,
        };
      }
      return { valid: true };
    },
  },
];
