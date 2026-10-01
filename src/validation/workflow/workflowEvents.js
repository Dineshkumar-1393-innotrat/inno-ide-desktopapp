/**
 * InnoIDE Workflow Validation Event Bus
 * Dispatches and listens for workflow validation events across components.
 */

export const WORKFLOW_EVENTS = {
  VIOLATION: 'innoide:workflow-violation',
  STATE_CHANGED: 'innoide:workflow-state-changed',
  REVALIDATE: 'innoide:revalidate-requested',
  CREATE_PROJECT: 'innoide:create-new-project',
  DEFINE_PRODUCT: 'innoide:open-define-product',
  VIEW_PRODUCT: 'innoide:open-view-product',
  NAVIGATE_STAGE: 'innoide:navigate-stage',
};

export const dispatchWorkflowViolation = (violation) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(WORKFLOW_EVENTS.VIOLATION, {
      detail: violation,
      bubbles: true,
    })
  );
};

export const dispatchWorkflowStateChanged = (state) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(WORKFLOW_EVENTS.STATE_CHANGED, {
      detail: state,
      bubbles: true,
    })
  );
};

export const dispatchRevalidate = (stage) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(WORKFLOW_EVENTS.REVALIDATE, {
      detail: { stage },
      bubbles: true,
    })
  );
};

export const dispatchOpenCreateProject = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(WORKFLOW_EVENTS.CREATE_PROJECT));
};

export const dispatchOpenDefineProduct = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(WORKFLOW_EVENTS.DEFINE_PRODUCT));
};

export const dispatchOpenViewProduct = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(WORKFLOW_EVENTS.VIEW_PRODUCT));
};
