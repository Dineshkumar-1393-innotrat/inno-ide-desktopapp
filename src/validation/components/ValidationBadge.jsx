/**
 * InnoIDE ValidationBadge
 * Interactive badge displaying current workflow status for a specific stage or global status.
 * Clicking opens the Validation Report Modal.
 */

import React from 'react';
import { Badge, HStack, Text } from '@chakra-ui/react';
import { CheckCircle, AlertTriangle, XCircle, RotateCcw, Clock } from 'lucide-react';
import { useValidation } from '../useValidation';
import { ValidationStatus } from '../types';

export const ValidationBadge = ({ stage, onClick }) => {
  const { stageStatuses, openReportModal } = useValidation();
  const status = stage
    ? stageStatuses[stage] || ValidationStatus.NOT_VALIDATED
    : Object.values(stageStatuses).includes(ValidationStatus.INVALID)
    ? ValidationStatus.INVALID
    : Object.values(stageStatuses).includes(ValidationStatus.WARNING)
    ? ValidationStatus.WARNING
    : Object.values(stageStatuses).includes(ValidationStatus.STALE)
    ? ValidationStatus.STALE
    : Object.values(stageStatuses).every((s) => s === ValidationStatus.VALID)
    ? ValidationStatus.VALID
    : ValidationStatus.NOT_VALIDATED;

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(e);
    } else {
      openReportModal();
    }
  };

  const getBadgeConfig = () => {
    switch (status) {
      case ValidationStatus.VALID:
        return { color: 'green', icon: <CheckCircle size={12} color="#16a34a" />, label: 'Valid' };
      case ValidationStatus.WARNING:
        return { color: 'yellow', icon: <AlertTriangle size={12} color="#ca8a04" />, label: 'Warning' };
      case ValidationStatus.INVALID:
        return { color: 'red', icon: <XCircle size={12} color="#dc2626" />, label: 'Violation' };
      case ValidationStatus.STALE:
        return { color: 'purple', icon: <RotateCcw size={12} color="#9333ea" />, label: 'Stale' };
      default:
        return { color: 'gray', icon: <Clock size={12} color="#64748b" />, label: 'Unverified' };
    }
  };

  const { color, icon, label } = getBadgeConfig();

  return (
    <Badge
      as="button"
      onClick={handleClick}
      colorScheme={color}
      borderRadius="full"
      px={2.5}
      py={0.5}
      fontSize="xs"
      fontWeight="semibold"
      cursor="pointer"
      transition="all 0.15s ease"
      _hover={{ transform: 'scale(1.04)', opacity: 0.9 }}
      _active={{ transform: 'scale(0.98)' }}
    >
      <HStack spacing={1.5}>
        {icon}
        <Text as="span">{label}</Text>
      </HStack>
    </Badge>
  );
};

export default ValidationBadge;
