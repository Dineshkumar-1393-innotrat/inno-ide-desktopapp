/**
 * AutoSaveStatus Component
 * Displays the current auto-save status to users
 * Shows saving indicator, last save time, and any errors
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  HStack,
  Text,
  Tooltip,
  Spinner,
  Icon,
  Badge,
  useColorMode,
} from '@chakra-ui/react';
import { CheckCircle, AlertCircle, Cloud, CloudOff, Save } from 'lucide-react';
import { autoSaveManager } from '../utils/autoSaveManager';

/**
 * Format relative time (e.g., "2 minutes ago")
 */
const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Never';

  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 1000) return 'Just now';
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

  return new Date(timestamp).toLocaleDateString();
};

/**
 * AutoSaveStatus Component
 */
const AutoSaveStatus = ({
  screenKey = null,
  showDetails = false,
  size = 'sm',
  position = 'inline',
}) => {
  const { colorMode } = useColorMode();
  const [status, setStatus] = useState({
    isSaving: false,
    lastSaveTime: null,
    error: null,
    isOnline: navigator.onLine,
  });

  // Update status from auto-save manager
  const updateStatus = useCallback(() => {
    const stats = autoSaveManager.getStats();

    if (screenKey && stats.screens[screenKey]) {
      const screenStats = stats.screens[screenKey];
      setStatus((prev) => ({
        ...prev,
        lastSaveTime: screenStats.lastSaveTime,
        error: screenStats.errorCount > 0 ? 'Save failed' : null,
      }));
    } else {
      setStatus((prev) => ({
        ...prev,
        lastSaveTime: stats.lastSaveTime,
        error: stats.totalErrors > 0 ? 'Some saves failed' : null,
      }));
    }
  }, [screenKey]);

  // Listen for auto-save events
  useEffect(() => {
    const handleSaveStart = () => {
      setStatus((prev) => ({ ...prev, isSaving: true, error: null }));
    };

    const handleSaveComplete = (event) => {
      const { screenKey: savedScreenKey, timestamp } = event.detail || {};

      // Only update if it's the screen we're tracking or we're tracking all
      if (!screenKey || screenKey === savedScreenKey) {
        setStatus((prev) => ({
          ...prev,
          isSaving: false,
          lastSaveTime: timestamp || Date.now(),
          error: null,
        }));
      }
    };

    const handleSaveError = (event) => {
      const { screenKey: errorScreenKey, error } = event.detail || {};

      if (!screenKey || screenKey === errorScreenKey) {
        setStatus((prev) => ({
          ...prev,
          isSaving: false,
          error: error?.message || 'Save failed',
        }));
      }
    };

    const handleAllSaved = (event) => {
      const { timestamp, failed } = event.detail || {};

      setStatus((prev) => ({
        ...prev,
        isSaving: false,
        lastSaveTime: timestamp || Date.now(),
        error: failed > 0 ? `${failed} save(s) failed` : null,
      }));
    };

    const handleOnlineStatus = () => {
      setStatus((prev) => ({ ...prev, isOnline: navigator.onLine }));
    };

    // Add event listeners
    window.addEventListener('autosave:saving', handleSaveStart);
    window.addEventListener('autosave:screen-saved', handleSaveComplete);
    window.addEventListener('autosave:error', handleSaveError);
    window.addEventListener('autosave:all-saved', handleAllSaved);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    // Initial status update
    updateStatus();

    // Poll for status updates every 5 seconds
    const pollInterval = setInterval(updateStatus, 5000);

    return () => {
      window.removeEventListener('autosave:saving', handleSaveStart);
      window.removeEventListener('autosave:screen-saved', handleSaveComplete);
      window.removeEventListener('autosave:error', handleSaveError);
      window.removeEventListener('autosave:all-saved', handleAllSaved);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      clearInterval(pollInterval);
    };
  }, [screenKey, updateStatus]);

  // Determine status icon and color
  const getStatusDisplay = () => {
    if (!status.isOnline) {
      return {
        icon: CloudOff,
        color: 'orange.400',
        text: 'Offline',
        tooltip: 'You are offline. Changes will be saved locally.',
      };
    }

    if (status.isSaving) {
      return {
        icon: null,
        color: 'blue.400',
        text: 'Saving...',
        tooltip: 'Saving your changes...',
        showSpinner: true,
      };
    }

    if (status.error) {
      return {
        icon: AlertCircle,
        color: 'red.400',
        text: 'Error',
        tooltip: status.error,
      };
    }

    if (status.lastSaveTime) {
      return {
        icon: CheckCircle,
        color: 'green.400',
        text: `Saved ${formatRelativeTime(status.lastSaveTime)}`,
        tooltip: `Last saved: ${new Date(status.lastSaveTime).toLocaleString()}`,
      };
    }

    return {
      icon: Cloud,
      color: 'gray.400',
      text: 'Auto-save enabled',
      tooltip: 'Your changes will be automatically saved.',
    };
  };

  const statusDisplay = getStatusDisplay();


  // Compact inline indicator
  if (size === 'xs') {
    return (
      <Tooltip label={statusDisplay.tooltip}>
        <HStack spacing={1} cursor="default">
          {statusDisplay.showSpinner ? (
            <Spinner size="xs" color={statusDisplay.color} />
          ) : (
            <Icon
              as={statusDisplay.icon}
              boxSize={3}
              color={statusDisplay.color}
            />
          )}
        </HStack>
      </Tooltip>
    );
  }

  // Standard inline indicator
  return (
    <Tooltip label={statusDisplay.tooltip}>
      <HStack
        spacing={2}
        px={2}
        py={1}
        borderRadius="md"
        bg={colorMode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)'}
        cursor="default"
      >
        {statusDisplay.showSpinner ? (
          <Spinner size="xs" color={statusDisplay.color} />
        ) : (
          <Icon
            as={statusDisplay.icon}
            boxSize={size === 'sm' ? 4 : 5}
            color={statusDisplay.color}
          />
        )}
        <Text
          fontSize={size === 'sm' ? 'xs' : 'sm'}
          color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}
          fontWeight="medium"
        >
          {statusDisplay.text}
        </Text>
        {showDetails && status.lastSaveTime && !status.isSaving && (
          <Badge
            size="sm"
            colorScheme={status.error ? 'red' : 'green'}
            variant="subtle"
          >
            {status.error ? 'Error' : 'Synced'}
          </Badge>
        )}
      </HStack>
    </Tooltip>
  );
};

/**
 * Hook to trigger manual save and get status
 */
export const useAutoSaveActions = (screenKey = null) => {
  const [isSaving, setIsSaving] = useState(false);

  const triggerSave = useCallback(async () => {
    setIsSaving(true);
    try {
      if (screenKey) {
        await autoSaveManager.saveScreen(screenKey);
      } else {
        await autoSaveManager.saveAll();
      }
    } finally {
      setIsSaving(false);
    }
  }, [screenKey]);

  const getStats = useCallback(() => {
    return autoSaveManager.getStats();
  }, []);

  return {
    triggerSave,
    isSaving,
    getStats,
  };
};

/**
 * Save Button with status indicator
 */
export const SaveButton = ({
  screenKey = null,
  label = 'Save',
  size = 'sm',
  variant = 'ghost',
  ...props
}) => {
  const { triggerSave, isSaving } = useAutoSaveActions(screenKey);
  const { colorMode } = useColorMode();

  return (
    <Tooltip label={isSaving ? 'Saving...' : 'Save now'}>
      <Box
        as="button"
        display="flex"
        alignItems="center"
        gap={2}
        px={3}
        py={1.5}
        borderRadius="md"
        fontSize={size === 'sm' ? 'xs' : 'sm'}
        fontWeight="medium"
        bg={colorMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
        color={colorMode === 'dark' ? 'gray.200' : 'gray.700'}
        _hover={{
          bg: colorMode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
        }}
        _active={{
          bg: colorMode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
        }}
        disabled={isSaving}
        onClick={triggerSave}
        {...props}
      >
        {isSaving ? (
          <Spinner size="xs" />
        ) : (
          <Icon as={Save} boxSize={4} />
        )}
        <Text>{label}</Text>
      </Box>
    </Tooltip>
  );
};

export default AutoSaveStatus;
