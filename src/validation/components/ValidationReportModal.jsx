/**
 * InnoIDE ValidationReportModal
 * Comprehensive overview of the 7 workflow stages with status badges,
 * detected warnings/errors, and guidance.
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Box,
  Flex,
  Text,
  Badge,
  VStack,
  HStack,
  Divider,
  Spinner,
} from '@chakra-ui/react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  RotateCcw,
  FileCheck,
} from 'lucide-react';
import { validationManager } from '../ValidationManager';
import { STAGE_METADATA, ValidationStatus } from '../types';

const statusIcons = {
  [ValidationStatus.VALID]: <CheckCircle size={18} color="#16a34a" />,
  [ValidationStatus.WARNING]: <AlertTriangle size={18} color="#ca8a04" />,
  [ValidationStatus.INVALID]: <XCircle size={18} color="#dc2626" />,
  [ValidationStatus.STALE]: <RotateCcw size={18} color="#9333ea" />,
  [ValidationStatus.NOT_VALIDATED]: <Clock size={18} color="#64748b" />,
};

const statusColors = {
  [ValidationStatus.VALID]: 'green',
  [ValidationStatus.WARNING]: 'yellow',
  [ValidationStatus.INVALID]: 'red',
  [ValidationStatus.STALE]: 'purple',
  [ValidationStatus.NOT_VALIDATED]: 'gray',
};

const ValidationReportModal = ({ isOpen, onClose }) => {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runFullReport = async () => {
    setIsLoading(true);
    try {
      const res = await validationManager.validateAll();
      setReport(res);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runFullReport();
    }
  }, [isOpen]);

  const stages = Object.values(STAGE_METADATA);

  return (
    <Modal isOpen={Boolean(isOpen)} onClose={onClose} size="2xl" scrollBehavior="inside" isCentered>
      <ModalOverlay bg="blackAlpha.700" />
      <ModalContent borderRadius="xl" overflow="hidden" boxShadow="2xl">
        <ModalHeader bg="gray.50" borderBottom="1px solid" borderColor="gray.100" py={4} px={6}>
          <Flex align="center" justify="space-between">
            <HStack spacing={3}>
              <FileCheck size={22} color="#2563eb" />
              <Box>
                <Text fontSize="lg" fontWeight="bold" color="gray.800">
                  InnoIDE Workflow Validation Report
                </Text>
                <Text fontSize="xs" color="gray.500" fontWeight="normal">
                  Development progression and rule-based consistency check
                </Text>
              </Box>
            </HStack>
            <Button size="xs" variant="outline" colorScheme="blue" onClick={runFullReport} isLoading={isLoading}>
              Revalidate All
            </Button>
          </Flex>
        </ModalHeader>

        <ModalBody p={6}>
          {isLoading && !report ? (
            <Flex justify="center" align="center" minH="200px">
              <Spinner color="blue.500" size="lg" />
            </Flex>
          ) : (
            <VStack spacing={3} align="stretch">
              {stages.map((stage) => {
                const stageStatus = validationManager.getStageStatus(stage.id);
                const stageDetails = report?.[stage.id];

                return (
                  <Box
                    key={stage.id}
                    p={3.5}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="gray.200"
                    bg="white"
                    _hover={{ borderColor: 'blue.200', bg: 'gray.50' }}
                    transition="all 0.15s ease"
                  >
                    <Flex justify="space-between" align="center">
                      <HStack spacing={3}>
                        <Flex
                          w="28px"
                          h="28px"
                          borderRadius="full"
                          bg="gray.100"
                          align="center"
                          justify="center"
                          fontSize="xs"
                          fontWeight="bold"
                          color="gray.600"
                        >
                          {stage.stepNumber}
                        </Flex>
                        <Box>
                          <HStack spacing={2}>
                            <Text fontSize="sm" fontWeight="bold" color="gray.800">
                              {stage.title}
                            </Text>
                            <Badge
                              size="sm"
                              colorScheme={statusColors[stageStatus] || 'gray'}
                              borderRadius="full"
                              px={2}
                              textTransform="capitalize"
                              fontSize="xs"
                            >
                              {stageStatus.replace('-', ' ')}
                            </Badge>
                          </HStack>
                          <Text fontSize="xs" color="gray.500" noOfLines={1} mt={0.5}>
                            {stage.description}
                          </Text>
                        </Box>
                      </HStack>

                      <Box>{statusIcons[stageStatus] || statusIcons[ValidationStatus.NOT_VALIDATED]}</Box>
                    </Flex>

                    {/* Stage Violations / Warnings breakdown */}
                    {stageDetails?.violations && stageDetails.violations.length > 0 && (
                      <Box mt={2.5} pt={2} borderTop="1px dashed" borderColor="gray.100">
                        {stageDetails.violations.map((v, i) => (
                          <Text key={i} fontSize="xs" color="red.600" fontWeight="medium">
                            • {v.message || v.reason}
                          </Text>
                        ))}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </VStack>
          )}
        </ModalBody>

        <ModalFooter bg="gray.50" borderTop="1px solid" borderColor="gray.100" py={3} px={6}>
          <Button size="sm" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ValidationReportModal;
