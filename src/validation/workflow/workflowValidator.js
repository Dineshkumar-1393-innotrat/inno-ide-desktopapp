/**
 * InnoIDE Centralized Workflow Validator
 * Evaluates whether workflow stage transitions and actions comply with the
 * InnoIDE General Development Workflow Guide prerequisites.
 */

import { WorkflowStage, ValidationSeverity, ValidationAction, STAGE_METADATA } from '../types.js';
import { WORKFLOW_DEPENDENCIES } from './workflowRules.js';

class WorkflowValidator {
  /**
   * Evaluates if a user action or stage entry is permitted based on workflow state.
   * @param {string} stage Target WorkflowStage
   * @param {Object} context Environmental context (project, product, diagramData, etc.)
   * @returns {{ allowed: boolean, violation?: Object }}
   */
  canEnterStage(stage, context = {}) {
    const dependency = WORKFLOW_DEPENDENCIES[stage];
    if (!dependency) {
      return { allowed: true };
    }

    // Step 1: Create Project has no previous prerequisites
    if (stage === WorkflowStage.CREATE_PROJECT) {
      return { allowed: true };
    }

    // Resolve context state from parameters or fallback storage
    const resolvedContext = this.resolveContext(context);

    // Step 2: Define Product requires Create Project
    if (stage === WorkflowStage.DEFINE_PRODUCT) {
      if (!this.isProjectComplete(resolvedContext)) {
        return {
          allowed: false,
          violation: {
            id: 'workflow.order.define-product.missing-project',
            type: 'WORKFLOW_ORDER_VIOLATION',
            severity: ValidationSeverity.ERROR,
            title: 'Workflow Validation Violation',
            currentStage: 'Create Product',
            requiredStage: 'Create Project',
            ruleName: 'Workflow Sequence: Create Project Required',
            message: 'You cannot create a Product yet.',
            displayMessage: 'Please create a project before defining a product.',
            reason: 'No project has been created or selected. The project workspace must be created before a product can be defined.',
            recommendation: 'Please create a project first.',
            sourceScreen: resolvedContext.currentScreen || 'App',
            targetScreen: 'Create Project',
            targetAction: 'open-create-project',
            targetRoute: '/editor',
            canAutoFix: false,
            blockingAction: resolvedContext.action || 'product.create',
          },
        };
      }
      return { allowed: true };
    }

    // Step 3: Block Diagram requires Define Product
    if (stage === WorkflowStage.BLOCK_DIAGRAM) {
      if (!this.isProjectComplete(resolvedContext)) {
        return this.createOrderViolation(
          'Block Diagram',
          'Create Project',
          'Block Diagram cannot be created yet.',
          'No project workspace exists. A project must be established first.',
          'Please create a project first.',
          'open-create-project',
          '/editor',
          resolvedContext
        );
      }
      if (!this.isProductComplete(resolvedContext)) {
        return this.createOrderViolation(
          'Block Diagram',
          'Define Product',
          'Block Diagram cannot be created yet.',
          'Product configuration has not been completed. The block diagram represents the physical components defined by the product.',
          'Complete the Product definition first.',
          'open-define-product',
          '/editor',
          resolvedContext
        );
      }
      return { allowed: true };
    }

    // Step 4: Logic Diagram (Flowchart) requires Block Diagram
    if (stage === WorkflowStage.LOGIC_DIAGRAM) {
      if (!this.isProjectComplete(resolvedContext)) {
        return this.createOrderViolation(
          'Logic Diagram',
          'Create Project',
          'Logic Diagram cannot be created yet.',
          'No project workspace exists.',
          'Please create a project first.',
          'open-create-project',
          '/editor',
          resolvedContext
        );
      }
      if (!this.isProductComplete(resolvedContext)) {
        return this.createOrderViolation(
          'Logic Diagram',
          'Define Product',
          'Logic Diagram cannot be created yet.',
          'Product definition is missing. System components must be defined before mapping logic.',
          'Complete the Product definition first.',
          'open-define-product',
          '/editor',
          resolvedContext
        );
      }
      if (!this.isBlockDiagramComplete(resolvedContext)) {
        return this.createOrderViolation(
          'Logic Diagram',
          'Block Diagram',
          'Logic Diagram cannot be created yet.',
          'Block Diagram must be designed before creating functional logic flowcharts.',
          'Create the Block Diagram first.',
          'navigate-stage',
          '/BlockDiagram',
          resolvedContext
        );
      }
      return { allowed: true };
    }

    // Step 5: Simulate requires Block Diagram & Logic Diagram
    if (stage === WorkflowStage.SIMULATE) {
      if (!this.isProjectComplete(resolvedContext)) {
        return this.createOrderViolation(
          'Simulation',
          'Create Project',
          'Simulation cannot start yet.',
          'No project workspace exists.',
          'Please create a project first.',
          'open-create-project',
          '/editor',
          resolvedContext
        );
      }
      if (!this.isProductComplete(resolvedContext)) {
        return this.createOrderViolation(
          'Simulation',
          'Define Product',
          'Simulation cannot start yet.',
          'The system requires a defined Product configuration before simulation.',
          'Complete the Product definition first.',
          'open-define-product',
          '/editor',
          resolvedContext
        );
      }
      if (
        resolvedContext.action !== ValidationAction.SIMULATION_VALIDATE &&
        resolvedContext.action !== ValidationAction.SIMULATION_SAVE
      ) {
        if (!this.isBlockDiagramComplete(resolvedContext)) {
          return this.createOrderViolation(
            'Simulation',
            'Block Diagram',
            'Simulation cannot start yet.',
            'The Block Diagram must be mapped out with valid hardware components before running virtual simulation.',
            'Complete and validate the Block Diagram first.',
            'navigate-stage',
            '/BlockDiagram',
            resolvedContext
          );
        }
        if (!this.isLogicDiagramComplete(resolvedContext)) {
          return this.createOrderViolation(
            'Simulation',
            'Logic Diagram',
            'Simulation cannot start yet.',
            'The system logic flow or flowchart must be completed before running simulation.',
            'Complete the Logic Diagram first.',
            'navigate-stage',
            '/FlowchartTest',
            resolvedContext
          );
        }
      }
      return { allowed: true };
    }

    // Step 6: Write Code requires Simulation validation
    if (stage === WorkflowStage.WRITE_CODE) {
      if (!this.isProjectComplete(resolvedContext)) {
        return this.createOrderViolation(
          'Write Code',
          'Create Project',
          'Code generation cannot start yet.',
          'No project workspace exists.',
          'Please create a project first.',
          'open-create-project',
          '/editor',
          resolvedContext
        );
      }
      if (!this.isProductComplete(resolvedContext)) {
        return this.createOrderViolation(
          'Write Code',
          'Define Product',
          'Code generation cannot start yet.',
          'Product hardware configuration is missing.',
          'Complete the Product definition first.',
          'open-define-product',
          '/editor',
          resolvedContext
        );
      }
      if (!this.isBlockDiagramComplete(resolvedContext)) {
        return this.createOrderViolation(
          'Write Code',
          'Block Diagram',
          'Code generation cannot start yet.',
          'Block Diagram architecture is required to generate system pinouts and component interfaces.',
          'Complete the Block Diagram first.',
          'navigate-stage',
          '/BlockDiagram',
          resolvedContext
        );
      }
      if (!this.isSimulationComplete(resolvedContext)) {
        return this.createOrderViolation(
          'Write Code',
          'Simulation',
          'Code generation cannot start yet.',
          'The system logic must be validated through simulation before generating or writing code.',
          'Run and validate simulation first.',
          'navigate-stage',
          '/simulation',
          resolvedContext
        );
      }
      return { allowed: true };
    }

    // Step 7: Flash stage - allow hardware flashing directly without blocking workflow popups
    if (stage === WorkflowStage.FLASH) {
      return { allowed: true };
    }

    return { allowed: true };
  }

  createOrderViolation(currentStage, requiredStage, message, reason, recommendation, targetAction, targetRoute, context) {
    return {
      allowed: false,
      violation: {
        id: `workflow.order.${currentStage.toLowerCase().replace(/\s+/g, '-')}.prerequisite`,
        type: 'WORKFLOW_ORDER_VIOLATION',
        severity: ValidationSeverity.ERROR,
        title: 'Workflow Validation Violation',
        currentStage,
        requiredStage,
        ruleName: `Workflow Sequence: ${requiredStage} Required`,
        message,
        reason,
        recommendation,
        sourceScreen: context.currentScreen || 'App',
        targetScreen: requiredStage,
        targetAction,
        targetRoute,
        canAutoFix: false,
        blockingAction: context.action || currentStage,
      },
    };
  }

  resolveContext(ctx = {}) {
    let projectId = ctx.projectId || ctx.project?.id || ctx.activeProjectId;
    let projectName = ctx.projectName || ctx.project?.name || ctx.activeProjectName;
    let productId = ctx.productId || ctx.product?.id || ctx.activeProductId;
    let productName = ctx.productName || ctx.product?.name || ctx.activeProductName;

    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      if (!projectId) projectId = localStorage.getItem('activeProjectId');
      if (!projectName) projectName = localStorage.getItem('activeProjectName');
      if (!productId) productId = localStorage.getItem('activeProductId');
      if (!productName) productName = localStorage.getItem('activeProductName');
    }

    return {
      ...ctx,
      projectId: projectId || null,
      projectName: projectName || null,
      productId: productId || null,
      productName: productName || null,
    };
  }

  isProjectComplete(ctx) {
    const projId = ctx.projectId || ctx.project?.id || (typeof localStorage !== 'undefined' && localStorage.getItem('activeProjectId'));
    const projName = ctx.projectName || ctx.project?.name || (typeof localStorage !== 'undefined' && localStorage.getItem('activeProjectName'));
    return Boolean(projId && projId.trim().length > 0 && projName && projName.trim().length > 0);
  }

  isProductComplete(ctx) {
    if (!this.isProjectComplete(ctx)) return false;
    if (ctx.isProductDefined !== undefined) return Boolean(ctx.isProductDefined);

    const prodId = ctx.productId || ctx.product?.id || (typeof localStorage !== 'undefined' && localStorage.getItem('activeProductId'));
    
    // Check if product is marked as defined in storage or context
    if (typeof localStorage !== 'undefined') {
      const status = localStorage.getItem(`innoide:project_status_${ctx.projectId}`);
      if (status === 'completed') return true;
      if (ctx.projectId && localStorage.getItem(`innoide:product_details_${ctx.projectId}`)) return true;
      if (prodId && localStorage.getItem(`innoide:product_details_${prodId}`)) return true;
      if (localStorage.getItem('innoide:last_product_details')) return true;
    }
    return Boolean(prodId && prodId !== 'default' && prodId !== 'undefined');
  }

  isBlockDiagramComplete(ctx) {
    if (!this.isProductComplete(ctx)) return false;
    const nodes = ctx.blockDiagram?.nodes || ctx.nodes || ctx.diagramData?.blockDiagram?.data;
    if (Array.isArray(nodes) && nodes.length > 0) return true;
    // Check localStorage fallback for block diagram
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('innoide:block_diagram_nodes');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return true;
        } catch (_) {}
      }
      const tabsStored = localStorage.getItem(`innoide:block_diagram_tabs:${ctx.projectId}`);
      if (tabsStored) {
        try {
          const parsed = JSON.parse(tabsStored);
          if (Array.isArray(parsed?.tabs) && parsed.tabs.some((t) => t.state?.nodes?.length > 0)) return true;
        } catch (_) {}
      }
    }
    return Boolean(ctx.blockDiagram?.completed);
  }

  isLogicDiagramComplete(ctx) {
    if (!this.isBlockDiagramComplete(ctx)) return false;
    const nodes = ctx.flowchart?.nodes || ctx.diagramData?.flowchart?.data;
    if (Array.isArray(nodes) && nodes.length > 0) return true;
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('innoide:flowchart_nodes');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return true;
        } catch (_) {}
      }
    }
    return Boolean(ctx.flowchart?.completed || ctx.logicDiagram?.completed);
  }

  isSimulationComplete(ctx) {
    if (!this.isLogicDiagramComplete(ctx)) return false;
    if (ctx.simulation?.completed || ctx.simulation?.isValid) return true;
    if (typeof localStorage !== 'undefined') {
      const passed = localStorage.getItem(`innoide:simulation_passed_${ctx.projectId}`);
      if (passed === 'true') return true;
    }
    return false;
  }

  isCodeComplete(ctx) {
    if (!this.isProductComplete(ctx)) return false;
    const code = ctx.code?.content || ctx.codeContent;
    if (code && typeof code === 'string' && code.trim().length > 20) return true;
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('innoide:code_content');
      if (stored && stored.trim().length > 20) return true;
    }
    return Boolean(ctx.code?.completed);
  }
}

export const workflowValidator = new WorkflowValidator();
