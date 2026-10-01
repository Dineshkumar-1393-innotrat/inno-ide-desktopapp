/**
 * InnoIDE ValidationViolationModal
 * Reusable modal displayed immediately upon any workflow rule or order violation.
 * Provides a clean, modern, simplified popup matching all IDE screens.
 */

import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Text,
} from '@chakra-ui/react';
import { ArrowRight, Wrench } from 'lucide-react';

const normalizeScreen = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[\s\-_/]+/g, '');

const ValidationViolationModal = ({
  open,
  violation,
  onClose,
  onNavigate,
  onAutoFix,
}) => {
  if (!violation) return null;

  // 1. Resolve Target / Required Stage
  let rawRequiredStage = violation.requiredStage || violation.targetScreen || '';
  if (
    violation.id === 'blockDiagram:product-consistency' ||
    violation.id === 'flowchart:product-consistency' ||
    violation.id === 'simulation:product-consistency' ||
    violation.ruleName === 'Product ↔ Block Diagram Consistency' ||
    violation.ruleName === 'Product ↔ Flowchart Consistency' ||
    violation.ruleName === 'Product ↔ Simulation Consistency'
  ) {
    rawRequiredStage = 'View Product';
  }

  const requiredStage =
    rawRequiredStage === 'Define Product'
      ? 'View Product'
      : rawRequiredStage ||
        (violation.id?.includes('define-product.missing-project')
          ? 'Create Project'
          : '');

  // 2. Resolve Friendly Display Text
  let displayText =
    violation.displayMessage ||
    violation.message ||
    'Action cannot continue due to a workflow violation.';

  if (
    violation.id === 'diagram:has-start' ||
    violation.violationCode === 'START_NODE_MISSING' ||
    violation.ruleName === 'Flowchart Start Node Required' ||
    violation.ruleName === 'Start Node Exists'
  ) {
    displayText =
      'The flowchart does not contain an entry point (Start / Terminator node).';
  } else if (
    violation.id === 'blockDiagram:product-consistency' ||
    violation.ruleName === 'Product ↔ Block Diagram Consistency'
  ) {
    displayText =
      'The defined product does not match the product specified in the block diagram.';
  } else if (
    violation.id === 'flowchart:product-consistency' ||
    violation.ruleName === 'Product ↔ Flowchart Consistency'
  ) {
    displayText =
      'The defined product does not match the product specified in the flowchart.';
  } else if (
    violation.id === 'simulation:product-consistency' ||
    violation.ruleName === 'Product ↔ Simulation Consistency'
  ) {
    displayText =
      'The defined product does not match the product specified in the simulation.';
  } else if (
    violation.id === 'workflow.order.define-product.missing-project' ||
    violation.ruleName === 'Workflow Sequence: Create Project Required' ||
    violation.violationCode === 'PROJECT_MISSING'
  ) {
    displayText = 'Please create a project before defining a product.';
  } else if (
    violation.id === 'blockDiagram:has-components' ||
    violation.violationCode === 'BLOCK_DIAGRAM_EMPTY'
  ) {
    displayText = 'The Block Diagram contains no components.';
  } else if (
    violation.id === 'simulation:has-components' ||
    violation.violationCode === 'SIMULATION_EMPTY'
  ) {
    displayText = 'The Simulation contains no components.';
  } else if (
    violation.id === 'simulation:valid' ||
    violation.ruleName === 'Simulation Valid'
  ) {
    displayText = 'All defined product components match the Simulation.';
  } else if (
    violation.id === 'flowchart:valid' ||
    violation.ruleName === 'Flowchart Valid'
  ) {
    displayText = 'All defined product components match the Flowchart.';
  } else if (
    violation.id === 'blockDiagram:valid' ||
    violation.ruleName === 'Block Diagram Valid'
  ) {
    displayText = 'All defined product components match the Block Diagram.';
  } else if (
    violation.reason &&
    (violation.message === 'Flowchart validation failed.' ||
      violation.message === 'Action cannot continue due to a workflow violation.' ||
      !violation.message)
  ) {
    displayText = violation.reason;
  }

  // 3. Determine if user is already on the target screen (to prevent redundant "Go to Logic Diagram" when already on Flowchart)
  const isSuccess = Boolean(violation.isSuccess || violation.status === 'success');
  const currentScreen =
    violation.currentScreen ||
    violation.sourceScreen ||
    violation.currentStage ||
    violation.workflowArea ||
    '';

  const currentPath =
    typeof window !== 'undefined' ? window.location?.pathname || '' : '';

  const normCurrent = normalizeScreen(currentScreen);
  const normPath = normalizeScreen(currentPath);
  const normTarget = normalizeScreen(requiredStage);

  const isLogicDiagram =
    normTarget === 'logicdiagram' ||
    normTarget === 'flowchart' ||
    normTarget === 'flowcharttest';

  const isBlockDiagram = normTarget === 'blockdiagram';

  const isSimulation = normTarget === 'simulation';

  const isSameScreen = Boolean(
    requiredStage &&
      (normTarget === normCurrent ||
        normTarget === normPath ||
        (isLogicDiagram &&
          (normCurrent.includes('logic') ||
            normCurrent.includes('flowchart') ||
            normPath.includes('flowchart'))) ||
        (isBlockDiagram &&
          (normCurrent.includes('block') || normPath.includes('block'))) ||
        (isSimulation &&
          (normCurrent.includes('simul') || normPath.includes('simul'))))
  );

  const showNavButton = Boolean(requiredStage && !isSameScreen && !isSuccess);
  const canAutoFix = Boolean(violation.canAutoFix && !isSuccess);

  return (
    <Modal
      isOpen={Boolean(open)}
      onClose={onClose}
      isCentered
      size="md"
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent
        bg="white"
        borderRadius="xl"
        boxShadow="2xl"
        border="1px solid"
        borderColor="gray.200"
        overflow="hidden"
        mx={4}
      >
        <ModalCloseButton color="gray.500" top={3} right={3} zIndex={10} />

        <ModalBody px={6} pt={8} pb={6}>
          <Text
            fontSize="md"
            fontWeight="medium"
            color="gray.800"
            textAlign="center"
            lineHeight="tall"
          >
            {displayText}
          </Text>
        </ModalBody>

        <ModalFooter
          bg="gray.50"
          px={6}
          py={4}
          borderTop="1px solid"
          borderColor="gray.100"
          gap={3}
          justifyContent="flex-end"
        >
          {canAutoFix && (
            <Button
              size="sm"
              colorScheme="purple"
              leftIcon={<Wrench size={16} />}
              onClick={() => onAutoFix?.(violation)}
            >
              {violation.autoFixLabel || 'Auto Fix'}
            </Button>
          )}

          {showNavButton && (
            <Button
              size="sm"
              colorScheme="red"
              rightIcon={<ArrowRight size={16} />}
              onClick={() =>
                onNavigate?.({
                  ...violation,
                  targetScreen: requiredStage,
                  targetAction:
                    requiredStage === 'View Product'
                      ? 'open-view-product'
                      : violation.targetAction,
                })
              }
            >
              Go to {requiredStage}
            </Button>
          )}

          <Button size="sm" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ValidationViolationModal;
