/**
 * InnoIDE useValidation React Hook
 * Convenient hook for components to check stage eligibility, validate actions,
 * display violations, and observe workflow statuses.
 */

import { useValidationContext } from './ValidationContext';
import { validationManager } from './ValidationManager';
import { workflowValidator } from './workflow/workflowValidator';

export function useValidation() {
  const context = useValidationContext();

  return {
    ...context,
    manager: validationManager,
    validator: workflowValidator,
  };
}

export default useValidation;
