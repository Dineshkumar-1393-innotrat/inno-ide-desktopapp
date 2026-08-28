/**
 * AutoSaveDemo Component
 * A test component to verify auto-save functionality across the IDE
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Textarea,
  Input,
  Heading,
  Badge,
  Divider,
  useColorMode,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Code,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { useAutoSave, useGlobalAutoSave } from '../hooks/useAutoSave';
import { autoSaveManager } from '../utils/autoSaveManager';
import AutoSaveStatus, { SaveButton } from './AutoSaveStatus';

/**
 * Demo section for testing basic auto-save
 */
const BasicAutoSaveTest = () => {
  const [testData, setTestData] = useState({
    text: '',
    counter: 0,
    timestamp: null,
  });
  const { colorMode } = useColorMode();
  const toast = useToast();

  const {
    isSaving,
    lastSaveTime,
    saveError,
    saveNow,
    scheduleSave,
    isLoaded,
    clearSavedData,
  } = useAutoSave({
    screenKey: '/demo/basic',
    data: testData,
    autoSaveDelay: 1500,
    priority: 1,
    onSave: (data) => {
      console.log('[Demo] Basic auto-save completed:', data);
      toast({
        title: 'Auto-saved',
        description: 'Basic data saved successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    },
    onLoad: (loadedData) => {
      console.log('[Demo] Basic data loaded:', loadedData);
      if (loadedData) {
        setTestData(loadedData);
        toast({
          title: 'Data restored',
          description: 'Previous session data loaded',
          status: 'info',
          duration: 2000,
          isClosable: true,
        });
      }
    },
    onError: (error) => {
      console.error('[Demo] Auto-save error:', error);
      toast({
        title: 'Save failed',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleTextChange = (e) => {
    const newData = { ...testData, text: e.target.value, timestamp: Date.now() };
    setTestData(newData);
    scheduleSave();
  };

  const handleIncrement = () => {
    const newData = { ...testData, counter: testData.counter + 1, timestamp: Date.now() };
    setTestData(newData);
    scheduleSave();
  };

  const handleClear = () => {
    clearSavedData();
    setTestData({ text: '', counter: 0, timestamp: null });
    toast({
      title: 'Data cleared',
      description: 'Auto-save data has been cleared',
      status: 'warning',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box
      p={4}
      borderRadius="lg"
      bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'}
      border="1px solid"
      borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
    >
      <Heading size="sm" mb={4}>Basic Auto-Save Test</Heading>

      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Badge colorScheme={isLoaded ? 'green' : 'yellow'}>
            {isLoaded ? 'Data Loaded' : 'Loading...'}
          </Badge>
          <Badge colorScheme={isSaving ? 'blue' : 'gray'}>
            {isSaving ? 'Saving...' : 'Idle'}
          </Badge>
          {lastSaveTime && (
            <Badge colorScheme="green">
              Last saved: {new Date(lastSaveTime).toLocaleTimeString()}
            </Badge>
          )}
          {saveError && (
            <Badge colorScheme="red">Error: {saveError}</Badge>
          )}
        </HStack>

        <Textarea
          value={testData.text}
          onChange={handleTextChange}
          placeholder="Type something here... (auto-saves after 1.5s of inactivity)"
          size="sm"
          rows={4}
        />

        <HStack>
          <Text>Counter: {testData.counter}</Text>
          <Button size="sm" onClick={handleIncrement}>Increment</Button>
        </HStack>

        <HStack>
          <Button size="sm" colorScheme="blue" onClick={saveNow}>
            Save Now
          </Button>
          <Button size="sm" colorScheme="red" onClick={handleClear}>
            Clear Data
          </Button>
        </HStack>

        {testData.timestamp && (
          <Text fontSize="xs" color="gray.500">
            Last modified: {new Date(testData.timestamp).toLocaleString()}
          </Text>
        )}
      </VStack>
    </Box>
  );
};

/**
 * Demo section for canvas-like data
 */
const CanvasAutoSaveTest = () => {
  const [items, setItems] = useState([]);
  const { colorMode } = useColorMode();

  const {
    isSaving,
    lastSaveTime,
    saveNow,
    scheduleSave,
  } = useAutoSave({
    screenKey: '/demo/canvas',
    data: { items },
    autoSaveDelay: 2000,
    priority: 3,
    onLoad: (loadedData) => {
      if (loadedData && loadedData.items) {
        setItems(loadedData.items);
      }
    },
  });

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      x: Math.floor(Math.random() * 200),
      y: Math.floor(Math.random() * 100),
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    };
    setItems([...items, newItem]);
    scheduleSave();
  };

  const clearItems = () => {
    setItems([]);
    scheduleSave();
  };

  return (
    <Box
      p={4}
      borderRadius="lg"
      bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'}
      border="1px solid"
      borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
    >
      <Heading size="sm" mb={4}>Canvas Auto-Save Test</Heading>

      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Badge colorScheme={isSaving ? 'blue' : 'gray'}>
            {isSaving ? 'Saving...' : 'Idle'}
          </Badge>
          <Text fontSize="sm">Items: {items.length}</Text>
        </HStack>

        <Box
          h="150px"
          bg={colorMode === 'dark' ? 'gray.800' : 'white'}
          borderRadius="md"
          border="1px dashed"
          borderColor="gray.400"
          position="relative"
          overflow="hidden"
        >
          {items.map((item) => (
            <Box
              key={item.id}
              position="absolute"
              left={`${item.x}px`}
              top={`${item.y}px`}
              w="30px"
              h="30px"
              bg={item.color}
              borderRadius="md"
            />
          ))}
        </Box>

        <HStack>
          <Button size="sm" colorScheme="green" onClick={addItem}>
            Add Item
          </Button>
          <Button size="sm" colorScheme="red" onClick={clearItems}>
            Clear
          </Button>
          <Button size="sm" colorScheme="blue" onClick={saveNow}>
            Force Save
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

/**
 * Global auto-save statistics
 */
const GlobalStatsPanel = () => {
  const [stats, setStats] = useState(null);
  const { saveAll, getGlobalStats, cleanup } = useGlobalAutoSave();
  const { colorMode } = useColorMode();
  const toast = useToast();

  const refreshStats = useCallback(() => {
    setStats(getGlobalStats());
  }, [getGlobalStats]);

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 2000);
    return () => clearInterval(interval);
  }, [refreshStats]);

  const handleSaveAll = async () => {
    await saveAll();
    refreshStats();
    toast({
      title: 'All screens saved',
      status: 'success',
      duration: 2000,
    });
  };

  const handleCleanup = () => {
    cleanup(0); // Clear all
    refreshStats();
    toast({
      title: 'Auto-save data cleared',
      status: 'warning',
      duration: 2000,
    });
  };

  return (
    <Box
      p={4}
      borderRadius="lg"
      bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'}
      border="1px solid"
      borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
    >
      <Heading size="sm" mb={4}>Global Auto-Save Statistics</Heading>

      {stats && (
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <Text>Total Screens: {stats.totalScreens}</Text>
            <Text>Total Saves: {stats.totalSaves}</Text>
            <Text>Errors: {stats.totalErrors}</Text>
          </HStack>

          {stats.lastSaveTime && (
            <Text fontSize="sm">
              Last global save: {new Date(stats.lastSaveTime).toLocaleString()}
            </Text>
          )}

          {Object.keys(stats.screens).length > 0 && (
            <Box overflowX="auto">
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Screen</Th>
                    <Th>Saves</Th>
                    <Th>Errors</Th>
                    <Th>Last Save</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {Object.entries(stats.screens).map(([key, screen]) => (
                    <Tr key={key}>
                      <Td><Code fontSize="xs">{key}</Code></Td>
                      <Td>{screen.saveCount}</Td>
                      <Td>{screen.errorCount}</Td>
                      <Td>
                        {screen.lastSaveTime
                          ? new Date(screen.lastSaveTime).toLocaleTimeString()
                          : 'Never'}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}

          <HStack>
            <Button size="sm" colorScheme="blue" onClick={handleSaveAll}>
              Save All Screens
            </Button>
            <Button size="sm" colorScheme="red" onClick={handleCleanup}>
              Clear All Data
            </Button>
            <Button size="sm" onClick={refreshStats}>
              Refresh Stats
            </Button>
          </HStack>
        </VStack>
      )}
    </Box>
  );
};

/**
 * Storage inspector
 */
const StorageInspector = () => {
  const [storageData, setStorageData] = useState([]);
  const { colorMode } = useColorMode();

  const refreshStorage = () => {
    const data = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('innoide:')) {
        try {
          const value = localStorage.getItem(key);
          const parsed = JSON.parse(value);
          data.push({
            key,
            size: value.length,
            timestamp: parsed.metadata?.timestamp || parsed.lastSaved,
          });
        } catch (e) {
          data.push({ key, size: localStorage.getItem(key)?.length || 0, error: true });
        }
      }
    }
    setStorageData(data);
  };

  useEffect(() => {
    refreshStorage();
    const interval = setInterval(refreshStorage, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      p={4}
      borderRadius="lg"
      bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'}
      border="1px solid"
      borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
    >
      <HStack justify="space-between" mb={4}>
        <Heading size="sm">Storage Inspector</Heading>
        <Button size="xs" onClick={refreshStorage}>Refresh</Button>
      </HStack>

      <Box maxH="200px" overflowY="auto">
        {storageData.length === 0 ? (
          <Text fontSize="sm" color="gray.500">No auto-save data found</Text>
        ) : (
          <VStack spacing={2} align="stretch">
            {storageData.map((item) => (
              <HStack key={item.key} justify="space-between" fontSize="xs">
                <Code>{item.key.replace('innoide:', '')}</Code>
                <Text>{(item.size / 1024).toFixed(2)} KB</Text>
                {item.timestamp && (
                  <Text color="gray.500">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </Text>
                )}
              </HStack>
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  );
};

/**
 * Main Demo Component
 */
const AutoSaveDemo = () => {
  const { colorMode } = useColorMode();

  return (
    <Box
      p={6}
      maxW="1200px"
      mx="auto"
      bg={colorMode === 'dark' ? 'gray.800' : 'white'}
      minH="100vh"
    >
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">Auto-Save System Demo</Heading>
          <HStack>
            <AutoSaveStatus size="sm" />
            <SaveButton label="Save All" />
          </HStack>
        </HStack>

        <Text color="gray.500">
          Test the auto-save functionality by making changes below. Data persists across
          page refreshes, tab switches, and navigation.
        </Text>

        <Divider />

        <Accordion allowMultiple defaultIndex={[0, 1, 2, 3]}>
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left" fontWeight="bold">
                Basic Auto-Save Test
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <BasicAutoSaveTest />
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left" fontWeight="bold">
                Canvas Auto-Save Test
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <CanvasAutoSaveTest />
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left" fontWeight="bold">
                Global Statistics
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <GlobalStatsPanel />
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left" fontWeight="bold">
                Storage Inspector
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <StorageInspector />
            </AccordionPanel>
          </AccordionItem>
        </Accordion>

        <Box
          p={4}
          bg={colorMode === 'dark' ? 'blue.900' : 'blue.50'}
          borderRadius="md"
        >
          <Heading size="xs" mb={2}>Testing Instructions:</Heading>
          <VStack align="start" spacing={1} fontSize="sm">
            <Text>1. Make changes in the test sections above</Text>
            <Text>2. Watch the auto-save indicators update</Text>
            <Text>3. Refresh the page - data should persist</Text>
            <Text>4. Switch browser tabs and return - data should be saved</Text>
            <Text>5. Check the Storage Inspector to see saved data</Text>
          </VStack>
        </Box>
      </VStack>

      {/* Corner status indicator */}
      <AutoSaveStatus position="corner" />
    </Box>
  );
};

export default AutoSaveDemo;
