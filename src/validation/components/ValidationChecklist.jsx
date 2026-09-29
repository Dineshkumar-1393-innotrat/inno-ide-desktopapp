/**
 * InnoIDE ValidationChecklist
 * Compact horizontal or vertical checklist showing development workflow progression.
 */

import React from 'react';
import { Box, HStack, VStack, Text, Tooltip } from '@chakra-ui/react';
import { CheckCircle, AlertTriangle, XCircle, Clock, RotateCcw } from 'lucide-react';
import { useValidation } from '../useValidation';
import { STAGE_METADATA, ValidationStatus } from '../types';

export const ValidationChecklist = ({ orientation = 'horizontal' }) => {
  const { stageStatuses, openReportModal } = useValidation();
  const stages = Object.values(STAGE_METADATA);

  const renderIcon = (status) => {
    switch (status) {
      case ValidationStatus.VALID:
        return <CheckCircle size={14} color="#16a34a" />;
      case ValidationStatus.WARNING:
        return <AlertTriangle size={14} color="#ca8a04" />;
      case ValidationStatus.INVALID:
        return <XCircle size={14} color="#dc2626" />;
      case ValidationStatus.STALE:
        return <RotateCcw size={14} color="#9333ea" />;
      default:
        return <Clock size={14} color="#94a3b8" />;
    }
  };

  const Wrapper = orientation === 'vertical' ? VStack : HStack;

  return (
    <Wrapper
      spacing={2}
      align={orientation === 'vertical' ? 'stretch' : 'center'}
      cursor="pointer"
      onClick={openReportModal}
    >
      {stages.map((stage) => {
        const status = stageStatuses[stage.id] || ValidationStatus.NOT_VALIDATED;
        return (
          <Tooltip key={stage.id} label={`${stage.title}: ${status.replace('-', ' ')}`} hasArrow>
            <HStack
              spacing={1.5}
              px={2}
              py={1}
              borderRadius="md"
              bg="gray.50"
              border="1px solid"
              borderColor="gray.200"
              fontSize="xs"
              _hover={{ bg: 'blue.50', borderColor: 'blue.200' }}
            >
              {renderIcon(status)}
              <Text fontWeight="medium" color="gray.700">
                {stage.shortName}
              </Text>
            </HStack>
          </Tooltip>
        );
      })}
    </Wrapper>
  );
};

export default ValidationChecklist;
