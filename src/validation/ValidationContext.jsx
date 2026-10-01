/**
 * InnoIDE Validation Context & Provider
 * Distributes validation state, action guards, violation popups, and report modals
 * throughout the React component hierarchy.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { validationManager } from './ValidationManager';
import { workflowValidator } from './workflow/workflowValidator';
import { WORKFLOW_EVENTS, dispatchOpenCreateProject, dispatchOpenDefineProduct, dispatchOpenViewProduct } from './workflow/workflowEvents';
import { STAGE_METADATA } from './types';
import ValidationViolationModal from './components/ValidationViolationModal';
import ValidationReportModal from './components/ValidationReportModal';

const ValidationContext = createContext(null);

export const ValidationProvider = ({ children }) => {
  const navigate = useNavigate();
  const [stageStatuses, setStageStatuses] = useState(() => validationManager.getAllStageStatuses());
  const [activeViolation, setActiveViolation] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Sync state changes from ValidationManager
  useEffect(() => {
    const unsubState = validationManager.onStateChange((newStatuses) => {
      setStageStatuses(newStatuses);
    });

    const unsubViolation = validationManager.onViolation((violation) => {
      setActiveViolation(violation);
    });

    // Also listen to window events for decoupled components
    const handleGlobalViolation = (e) => {
      if (e.detail) {
        setActiveViolation(e.detail);
      }
    };

    window.addEventListener(WORKFLOW_EVENTS.VIOLATION, handleGlobalViolation);

    return () => {
      unsubState();
      unsubViolation();
      window.removeEventListener(WORKFLOW_EVENTS.VIOLATION, handleGlobalViolation);
    };
  }, []);

  const showViolation = useCallback((violation) => {
    validationManager.setActiveViolation(violation);
  }, []);

  const closeViolation = useCallback(() => {
    validationManager.clearActiveViolation();
    setActiveViolation(null);
  }, []);

  const validateAction = useCallback(async (action, context = {}) => {
    return await validationManager.validateAction(action, context);
  }, []);

  const canEnterStage = useCallback((stage, context = {}) => {
    return workflowValidator.canEnterStage(stage, context);
  }, []);

  const handleNavigateToProblem = useCallback((violation) => {
    if (!violation) return;
    closeViolation();

    const targetAction = violation.targetAction;
    const targetRoute = violation.targetRoute;

    if (targetAction === 'open-create-project') {
      if (window.location.pathname !== '/editor') {
        navigate('/editor');
        setTimeout(() => {
          dispatchOpenCreateProject();
        }, 150);
      } else {
        dispatchOpenCreateProject();
      }
      return;
    }

    if (
      targetAction === 'open-view-product' ||
      targetAction === 'open-define-product' ||
      violation.targetScreen === 'View Product' ||
      violation.targetScreen === 'Define Product' ||
      violation.requiredStage === 'View Product' ||
      violation.requiredStage === 'Define Product'
    ) {
      dispatchOpenViewProduct();
      dispatchOpenDefineProduct();
      setTimeout(() => {
        const viewBtn = Array.from(document.querySelectorAll('button')).find(
          (b) => b.textContent?.trim().toLowerCase().includes('view product')
        );
        if (viewBtn) {
          viewBtn.click();
        }
      }, 50);
      return;
    }

    if (targetRoute) {
      navigate(targetRoute);
    } else if (violation.targetScreen) {
      // Find route from metadata
      const meta = Object.values(STAGE_METADATA).find(
        (m) => m.title === violation.targetScreen || m.shortName === violation.targetScreen
      );
      if (meta?.route) {
        navigate(meta.route);
      }
    }
  }, [closeViolation, navigate]);

  const handleAutoFix = useCallback(async (violation) => {
    if (!violation || !violation.canAutoFix) return;

    if (violation.autoFixAction === 'release_serial_port') {
      // Release serial port lock
      if (typeof window !== 'undefined') {
        window.__INNOIDE_SERIAL_MONITOR_ACTIVE__ = false;
        window.dispatchEvent(new CustomEvent('innoide:serial-disconnect'));
      }
      closeViolation();
      // Re-trigger validation
      if (violation.blockingAction) {
        await validationManager.validateAction(violation.blockingAction);
      }
    }
  }, [closeViolation]);

  const openReportModal = useCallback(() => setIsReportOpen(true), []);
  const closeReportModal = useCallback(() => setIsReportOpen(false), []);

  const contextValue = {
    stageStatuses,
    activeViolation,
    showViolation,
    closeViolation,
    validateAction,
    canEnterStage,
    openReportModal,
    closeReportModal,
    isReportOpen,
    handleNavigateToProblem,
    handleAutoFix,
  };

  return (
    <ValidationContext.Provider value={contextValue}>
      {children}

      {/* Global Workflow Violation Modal */}
      <ValidationViolationModal
        open={Boolean(activeViolation)}
        violation={activeViolation}
        onClose={closeViolation}
        onNavigate={handleNavigateToProblem}
        onAutoFix={handleAutoFix}
      />

      {/* Global Validation Report Modal */}
      <ValidationReportModal
        isOpen={isReportOpen}
        onClose={closeReportModal}
      />
    </ValidationContext.Provider>
  );
};

export const useValidationContext = () => {
  const ctx = useContext(ValidationContext);
  if (!ctx) {
    // Graceful fallback outside Provider
    return {
      stageStatuses: validationManager.getAllStageStatuses(),
      activeViolation: null,
      showViolation: (v) => validationManager.setActiveViolation(v),
      closeViolation: () => validationManager.clearActiveViolation(),
      validateAction: (a, c) => validationManager.validateAction(a, c),
      canEnterStage: (s, c) => workflowValidator.canEnterStage(s, c),
      openReportModal: () => {},
      closeReportModal: () => {},
      isReportOpen: false,
      handleNavigateToProblem: () => {},
      handleAutoFix: () => {},
    };
  }
  return ctx;
};
