import React, { useEffect, useCallback } from 'react';
import { useProjectCreation } from '../hooks/useProjectCreation';
import { projectManager } from '../utils/projectManager';

/**
 * Extract project data from form elements
 */
const extractProjectData = (form, formData) => {
  const projectData = {};
  
  // Get project name from various possible input names/placeholders
  const projectNameInput = form.querySelector('input[name="projectName"], input[placeholder*="project name" i], input[placeholder*="Enter project name" i]');
  projectData.projectName = projectNameInput?.value || formData.get('projectName') || '';
  
  // Get project type (radio buttons)
  const projectTypeInput = form.querySelector('input[name="projectType"]:checked, input[type="radio"]:checked');
  projectData.projectType = projectTypeInput?.value || projectTypeInput?.nextElementSibling?.textContent || 'Bare Metal';
  
  // Get board selection
  const boardInput = form.querySelector('input[name="board"]:checked, select[name="board"]');
  projectData.board = boardInput?.value || boardInput?.nextElementSibling?.textContent || 'STM32 U5';
  
  // Get additional options (checkboxes)
  const additionalOptions = {};
  const checkboxes = form.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    const label = checkbox.nextElementSibling?.textContent || checkbox.name || checkbox.id;
    if (label) {
      const key = label.toLowerCase().replace(/\s+/g, '');
      additionalOptions[key] = checkbox.checked;
      
      // Map specific labels to our expected format
      if (label.toLowerCase().includes('write code')) {
        additionalOptions.writeCode = checkbox.checked;
      }
      if (label.toLowerCase().includes('flow chart')) {
        additionalOptions.flowChart = checkbox.checked;
      }
      if (label.toLowerCase().includes('block diagram')) {
        additionalOptions.blockDiagram = checkbox.checked;
      }
      if (label.toLowerCase().includes('simulation')) {
        additionalOptions.simulation = checkbox.checked;
      }
      if (label.toLowerCase().includes('block programming')) {
        additionalOptions.blockProgramming = checkbox.checked;
      }
    }
  });
  
  projectData.additionalOptions = additionalOptions;
  
  return projectData;
};

/**
 * Integration component that listens for project creation events
 * and processes them with the enhanced project structure
 */
const CreateProjectIntegration = () => {
  const { createProjectFromForm, isCreating, creationError } = useProjectCreation();

  // Simple notification system
  const showNotification = useCallback((message, type = 'info') => {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      max-width: 350px;
      word-wrap: break-word;
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);

    // Add slide-in animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    if (!document.head.querySelector('[data-notifications-style]')) {
      style.setAttribute('data-notifications-style', 'true');
      document.head.appendChild(style);
    }

    // Remove notification after delay
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 5000);

    // Allow clicking to dismiss
    notification.addEventListener('click', () => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    });
  }, []);

  // Listen for project creation form submissions
  useEffect(() => {
    const handleFormSubmit = async (event) => {
      // Look for the Create New Project form - check multiple possible selectors
      const form = event.target.closest('form');
      const projectNameInput = form?.querySelector('input[name="projectName"], input[placeholder*="project name" i], input[placeholder*="Enter project name" i]');
      
      if (!form || !projectNameInput) {
        return; // Not our target form
      }

      event.preventDefault();
      event.stopPropagation();

      try {
        console.log('Intercepted project creation form submission');
        
        // Extract project data from form
        const formData = new FormData(form);
        const projectData = extractProjectData(form, formData);
        
        if (!projectData.projectName) {
          throw new Error('Project name is required');
        }
        
        console.log('Creating project with data:', projectData);
        
        // Create project with enhanced structure
        const project = await createProjectFromForm(form);
        
        console.log('Project created successfully:', project);
        
        // Close the dialog (assuming it has a close button or similar)
        const dialog = form.closest('[role="dialog"], .modal, .popup');
        if (dialog) {
          const closeButton = dialog.querySelector('[data-testid="close"], .close, button[aria-label*="close"], button[aria-label*="Cancel"]');
          if (closeButton) {
            closeButton.click();
          }
        }

        // Show success message
        const successEvent = new CustomEvent('project:creation-success', {
          detail: { project, message: `Project "${project.name}" created successfully with organized structure!` }
        });
        window.dispatchEvent(successEvent);

      } catch (error) {
        console.error('Failed to create project:', error);
        
        // Show error message
        const errorEvent = new CustomEvent('project:creation-error', {
          detail: { error: error.message }
        });
        window.dispatchEvent(errorEvent);
      }
    };

    // Also listen for button clicks (in case form submission isn't used)
    const handleButtonClick = async (event) => {
      const button = event.target;
      
      // Check if this is a "Create" button in the project dialog
      if (button.textContent?.toLowerCase().includes('create') || 
          button.textContent?.toLowerCase().includes('submit')) {
        
        const form = button.closest('form') || button.closest('[role="dialog"], .modal, .popup')?.querySelector('form');
        const projectNameInput = form?.querySelector('input[name="projectName"], input[placeholder*="project name" i], input[placeholder*="Enter project name" i]');
        
        if (form && projectNameInput) {
          event.preventDefault();
          event.stopPropagation();
          
          try {
            console.log('Intercepted Create button click');
            
            // Extract project data directly
            const formData = new FormData(form);
            const projectData = extractProjectData(form, formData);
            
            if (!projectData.projectName) {
              throw new Error('Project name is required');
            }
            
            console.log('Creating project from button click:', projectData);
            
            // Create project using direct data
            const project = await projectManager.createProject({
              projectName: projectData.projectName,
              projectType: projectData.projectType,
              board: projectData.board,
              selectedDiagramTypes: getSelectedDiagramTypes(projectData.additionalOptions),
              userId: 'user_' + Date.now(), // Fallback user ID
              additionalOptions: projectData.additionalOptions
            });
            
            // Close dialog
            const dialog = form.closest('[role="dialog"], .modal, .popup, .dialog');
            if (dialog) {
              const closeButton = dialog.querySelector('[data-testid="close"], .close, button[aria-label*="close"], button[aria-label*="Cancel"]');
              if (closeButton) {
                closeButton.click();
              } else {
                // Try to hide the dialog directly
                dialog.style.display = 'none';
                dialog.remove();
              }
            }

            // Success notification
            showNotification(`Project "${project.name}" created successfully with organized structure!`, 'success');
            
            // Trigger project change event for file explorer update
            window.dispatchEvent(new CustomEvent('project:change', {
              detail: { project, action: 'created' }
            }));

          } catch (error) {
            console.error('Failed to create project:', error);
            showNotification(`Failed to create project: ${error.message}`, 'error');
          }
        }
      }
    };

    // Helper function to determine selected diagram types from options
    const getSelectedDiagramTypes = (options) => {
      const types = [];
      if (options.writeCode) types.push('Code Editor');
      if (options.flowChart) types.push('Flowchart');
      if (options.blockDiagram) types.push('Block Diagram');
      if (options.simulation) types.push('Simulation');
      if (options.blockProgramming) types.push('Block Programming');
      
      // Always include Block Diagram as default if none selected
      if (types.length === 0) {
        types.push('Block Diagram');
      }
      
      return types;
    };

    // Add event listeners
    document.addEventListener('submit', handleFormSubmit, true);
    document.addEventListener('click', handleButtonClick, true);

    return () => {
      document.removeEventListener('submit', handleFormSubmit, true);
      document.removeEventListener('click', handleButtonClick, true);
    };
  }, [createProjectFromForm]);

  // Listen for success/error events to show notifications
  useEffect(() => {
    const handleSuccess = (event) => {
      const { project, message } = event.detail;
      
      // Create a simple notification
      showNotification(message, 'success');
      
      console.log('Project creation success:', project);
    };

    const handleError = (event) => {
      const { error } = event.detail;
      
      showNotification(`Failed to create project: ${error}`, 'error');
      
      console.error('Project creation error:', error);
    };

    window.addEventListener('project:creation-success', handleSuccess);
    window.addEventListener('project:creation-error', handleError);

    return () => {
      window.removeEventListener('project:creation-success', handleSuccess);
      window.removeEventListener('project:creation-error', handleError);
    };
  }, [showNotification]);

  // This component doesn't render anything visible
  return null;
};

export default CreateProjectIntegration;
