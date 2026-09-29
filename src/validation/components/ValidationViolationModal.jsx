/**
 * InnoIDE ValidationViolationModal
 * Reusable modal displayed immediately upon any workflow rule or order violation.
 * Explains: What failed, Why it failed, How to fix it, and provides direct navigation.
 */

import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Box,
  Flex,
  Text,
  Badge,
  VStack,
  HStack,
  List,
  ListItem,
  ListIcon,
  Divider,
} from '@chakra-ui/react';
import { AlertTriangle, ArrowRight, CheckCircle2, Wrench, XCircle } from 'lucide-react';

const ValidationViolationModal = ({
  open,
  violation,
  onClose,
  onNavigate,
  onAutoFix,
}) => {
  if (!violation) return null;

  const title = violation.title || 'Workflow Validation Violation';
  const message = violation.message || 'Action cannot continue due to a workflow violation.';
  const requiredStage = violation.requiredStage || violation.targetScreen;
  const currentStage = violation.currentStage || violation.workflowArea || 'Current Action';
  const reason = violation.reason || violation.details?.reason || '';
  const recommendation = violation.recommendation || 'Satisfy the workflow requirements to proceed.';
  const details = violation.details;
  const canAutoFix = Boolean(violation.canAutoFix);

  return (
    <Modal
      isOpen={Boolean(open)}
      onClose={onClose}
      isCentered
      size="lg"
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.700" />
      <ModalContent
        bg="white"
        borderRadius="xl"
        boxShadow="2xl"
        border="1px solid"
        borderColor="gray.200"
        overflow="hidden"
        mx={4}
      >
        <ModalCloseButton color="red.700" top={4} right={4} zIndex={10} />
        {/* Header Banner */}
        <Box bg="red.50" px={6} py={5} borderBottom="1px solid" borderColor="red.100">
          <Flex align="center" gap={3}>
            <Flex
              w="44px"
              h="44px"
              borderRadius="full"
              bg="red.100"
              color="red.600"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <AlertTriangle size={24} />
            </Flex>
            <Box flex="1">
              <Text fontSize="lg" fontWeight="bold" color="red.800" lineHeight="short">
                {title}
              </Text>
              {violation.ruleName && (
                <Text fontSize="xs" color="red.600" fontWeight="medium" mt={0.5}>
                  Rule: {violation.ruleName}
                </Text>
              )}
            </Box>
          </Flex>
        </Box>

        <ModalBody px={6} py={5}>
          <VStack align="stretch" spacing={4}>
            {/* Primary message */}
            <Text fontSize="md" fontWeight="semibold" color="gray.800">
              {message}
            </Text>

            {/* Stages overview card */}
            {(requiredStage || currentStage) && (
              <Box bg="gray.50" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200">
                <HStack spacing={4} justify="space-between" align="center">
                  <Box flex="1">
                    <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase">
                      Current Action
                    </Text>
                    <Badge colorScheme="purple" px={2.5} py={1} borderRadius="md" mt={1} fontSize="xs">
                      {currentStage}
                    </Badge>
                  </Box>
                  <ArrowRight size={18} color="#94a3b8" />
                  <Box flex="1" textAlign="right">
                    <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase">
                      Required Stage
                    </Text>
                    <Badge colorScheme="red" px={2.5} py={1} borderRadius="md" mt={1} fontSize="xs">
                      {requiredStage || 'Prerequisite'}
                    </Badge>
                  </Box>
                </HStack>
              </Box>
            )}

            {/* Reason */}
            {reason && (
              <Box>
                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={1}>
                  Reason
                </Text>
                <Text fontSize="sm" color="gray.700" lineHeight="tall">
                  {reason}
                </Text>
              </Box>
            )}

            {/* Detailed list breakdown (if missing components or GPIO errors) */}
            {details?.missingComponents && Array.isArray(details.missingComponents) && details.missingComponents.length > 0 && (
              <Box bg="red.50" p={3.5} borderRadius="lg" border="1px dashed" borderColor="red.200">
                <Text fontSize="xs" fontWeight="bold" color="red.800" mb={2}>
                  Missing Component(s):
                </Text>
                <List spacing={1}>
                  {details.missingComponents.map((comp, idx) => (
                    <ListItem key={idx} fontSize="xs" color="red.700" display="flex" alignItems="center">
                      <ListIcon as={XCircle} color="red.500" />
                      <Text as="span" fontWeight="semibold">{comp}</Text>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {details?.mismatches && Array.isArray(details.mismatches) && details.mismatches.length > 0 && (
              <Box bg="red.50" p={3.5} borderRadius="lg" border="1px dashed" borderColor="red.200">
                <Text fontSize="xs" fontWeight="bold" color="red.800" mb={2}>
                  Configuration Mismatches:
                </Text>
                <List spacing={1}>
                  {details.mismatches.map((item, idx) => (
                    <ListItem key={idx} fontSize="xs" color="red.700" display="flex" alignItems="center">
                      <ListIcon as={XCircle} color="red.500" />
                      <Text as="span">{item}</Text>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            <Divider borderColor="gray.100" />

            {/* Recommended action */}
            <Box bg="blue.50" p={3.5} borderRadius="lg" border="1px solid" borderColor="blue.100">
              <HStack align="flex-start" spacing={2.5}>
                <CheckCircle2 size={18} color="#2563eb" style={{ marginTop: '2px', flexShrink: 0 }} />
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="blue.900">
                    Required Action
                  </Text>
                  <Text fontSize="xs" color="blue.800" mt={0.5}>
                    {recommendation}
                  </Text>
                </Box>
              </HStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter bg="gray.50" px={6} py={4} borderTop="1px solid" borderColor="gray.100" gap={3}>
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

          {requiredStage && (
            <Button
              size="sm"
              colorScheme="red"
              rightIcon={<ArrowRight size={16} />}
              onClick={() => onNavigate?.(violation)}
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
