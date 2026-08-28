import React, { useState, useMemo, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  VStack,
  HStack,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Code,
  Divider,
  IconButton,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { FaBook, FaCode, FaDownload, FaPlus, FaCopy, FaMicrochip } from 'react-icons/fa';
import { ESP32_LIBRARIES, LIBRARY_CATEGORIES } from '../data/esp32Libraries';
import { STM32_LIBRARIES, STM32_CATEGORIES } from '../data/stm32Libraries';
import { ARDUINO_LIBRARIES, ARDUINO_CATEGORIES } from '../data/arduinoLibraries';

const LibraryManager = ({ isOpen, onClose, onInsertCode, currentPlatform = 'esp32' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState(currentPlatform);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const codeBg = useColorModeValue('gray.100', 'gray.900');

  // Select libraries based on platform
  const platformData = useMemo(() => ({
    esp32: {
      libraries: ESP32_LIBRARIES,
      categories: LIBRARY_CATEGORIES,
    },
    stm32: {
      libraries: STM32_LIBRARIES,
      categories: STM32_CATEGORIES,
    },
    arduino: {
      libraries: ARDUINO_LIBRARIES,
      categories: ARDUINO_CATEGORIES,
    },
  }), []);

  const { libraries, categories } = platformData[selectedPlatform] || platformData.esp32;

  useEffect(() => {
    setSelectedCategory('All');
  }, [selectedPlatform]);

  // Filter libraries
  const filteredLibraries = useMemo(() => {
    return libraries.filter((lib) => {
      const matchesSearch = 
        lib.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lib.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lib.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === 'All' || lib.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [libraries, searchQuery, selectedCategory]);

  const handleInsertInclude = (includes) => {
    if (!includes || includes.length === 0) {
      toast({
        title: 'No includes available',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    const includeCode = includes.map(inc => `#include <${inc}>`).join('\n');
    
    if (onInsertCode) {
      onInsertCode(includeCode);
    }

    toast({
      title: 'Library included',
      description: `Added ${includes.length} include(s) to your code`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleInsertExample = (exampleCode) => {
    if (onInsertCode) {
      onInsertCode(exampleCode);
    }

    toast({
      title: 'Example inserted',
      description: 'Example code added to editor',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      status: 'success',
      duration: 1500,
      isClosable: true,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader>
          <HStack>
            <FaBook />
            <Text>Library Manager</Text>
            <Badge colorScheme="blue" fontSize="sm">
              {filteredLibraries.length} libraries
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody pb={6}>
          <VStack align="stretch" spacing={4}>
            {/* Platform Selector */}
            <HStack spacing={3}>
              <Text fontWeight="bold" fontSize="sm">Platform:</Text>
              <Button
                size="sm"
                leftIcon={<FaMicrochip />}
                colorScheme={selectedPlatform === 'esp32' ? 'blue' : 'gray'}
                variant={selectedPlatform === 'esp32' ? 'solid' : 'outline'}
                onClick={() => setSelectedPlatform('esp32')}
              >
                ESP32 Arduino
              </Button>
              <Button
                size="sm"
                leftIcon={<FaMicrochip />}
                colorScheme={selectedPlatform === 'arduino' ? 'orange' : 'gray'}
                variant={selectedPlatform === 'arduino' ? 'solid' : 'outline'}
                onClick={() => setSelectedPlatform('arduino')}
              >
                Arduino AVR
              </Button>
              <Button
                size="sm"
                leftIcon={<FaMicrochip />}
                colorScheme={selectedPlatform === 'stm32' ? 'green' : 'gray'}
                variant={selectedPlatform === 'stm32' ? 'solid' : 'outline'}
                onClick={() => setSelectedPlatform('stm32')}
              >
                STM32 HAL
              </Button>
            </HStack>

            <Divider />

            {/* Search */}
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search libraries by name, description, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>

            {/* Category Filters */}
            <HStack spacing={2} flexWrap="wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  size="sm"
                  variant={selectedCategory === category ? 'solid' : 'outline'}
                  colorScheme={selectedCategory === category ? 'blue' : 'gray'}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </HStack>

            <Divider />

            {/* Libraries List */}
            {filteredLibraries.length === 0 ? (
              <Box textAlign="center" py={10}>
                <Text color="gray.500">No libraries found matching your criteria</Text>
              </Box>
            ) : (
              <Accordion allowMultiple>
                {filteredLibraries.map((lib) => (
                  <AccordionItem key={lib.id} border="1px solid" borderColor={borderColor} borderRadius="md" mb={2}>
                    <h2>
                      <AccordionButton _hover={{ bg: hoverBg }}>
                        <Box flex="1" textAlign="left">
                          <HStack spacing={3}>
                            <Text fontWeight="bold" fontSize="md">{lib.name}</Text>
                            <Badge colorScheme="purple" fontSize="xs">{lib.version}</Badge>
                            {lib.category && (
                              <Badge colorScheme="cyan" fontSize="xs">{lib.category}</Badge>
                            )}
                          </HStack>
                          <Text fontSize="sm" color="gray.600" mt={1}>
                            {lib.description}
                          </Text>
                          {lib.author && (
                            <Text fontSize="xs" color="gray.500" mt={1}>
                              by {lib.author}
                            </Text>
                          )}
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <Tabs variant="enclosed" size="sm">
                        <TabList>
                          <Tab>Includes</Tab>
                          {lib.examples && lib.examples.length > 0 && (
                            <Tab>Examples ({lib.examples.length})</Tab>
                          )}
                          <Tab>Info</Tab>
                        </TabList>

                        <TabPanels>
                          {/* Includes Tab */}
                          <TabPanel>
                            {lib.includes && lib.includes.length > 0 ? (
                              <VStack align="stretch" spacing={3}>
                                <Text fontSize="sm" fontWeight="bold">
                                  Required includes:
                                </Text>
                                <Box bg={codeBg} p={3} borderRadius="md">
                                  {lib.includes.map((inc, idx) => (
                                    <HStack key={idx} justify="space-between" mb={1}>
                                      <Code fontSize="sm">#include &lt;{inc}&gt;</Code>
                                      <Tooltip label="Copy">
                                        <IconButton
                                          size="xs"
                                          icon={<FaCopy />}
                                          onClick={() => handleCopyToClipboard(`#include <${inc}>`)}
                                        />
                                      </Tooltip>
                                    </HStack>
                                  ))}
                                </Box>
                                <Button
                                  leftIcon={<FaPlus />}
                                  colorScheme="blue"
                                  size="sm"
                                  onClick={() => handleInsertInclude(lib.includes)}
                                >
                                  Add to Editor
                                </Button>
                              </VStack>
                            ) : (
                              <Text fontSize="sm" color="gray.500">
                                No specific includes required for this library
                              </Text>
                            )}
                          </TabPanel>

                          {/* Examples Tab */}
                          {lib.examples && lib.examples.length > 0 && (
                            <TabPanel>
                              <VStack align="stretch" spacing={4}>
                                {lib.examples.map((example, idx) => (
                                  <Box key={idx} borderWidth="1px" borderRadius="md" p={3}>
                                    <HStack justify="space-between" mb={2}>
                                      <Text fontWeight="bold" fontSize="sm">
                                        {example.name}
                                      </Text>
                                      <HStack>
                                        <Tooltip label="Copy code">
                                          <IconButton
                                            size="xs"
                                            icon={<FaCopy />}
                                            onClick={() => handleCopyToClipboard(example.code)}
                                          />
                                        </Tooltip>
                                        <Button
                                          leftIcon={<FaCode />}
                                          size="xs"
                                          colorScheme="green"
                                          onClick={() => handleInsertExample(example.code)}
                                        >
                                          Insert
                                        </Button>
                                      </HStack>
                                    </HStack>
                                    <Box
                                      bg={codeBg}
                                      p={3}
                                      borderRadius="md"
                                      fontSize="xs"
                                      fontFamily="monospace"
                                      maxH="200px"
                                      overflowY="auto"
                                      whiteSpace="pre-wrap"
                                    >
                                      {example.code}
                                    </Box>
                                  </Box>
                                ))}
                              </VStack>
                            </TabPanel>
                          )}

                          {/* Info Tab */}
                          <TabPanel>
                            <VStack align="stretch" spacing={2}>
                              <HStack>
                                <Text fontWeight="bold" fontSize="sm">Library Name:</Text>
                                <Text fontSize="sm">{lib.name}</Text>
                              </HStack>
                              <HStack>
                                <Text fontWeight="bold" fontSize="sm">Version:</Text>
                                <Text fontSize="sm">{lib.version}</Text>
                              </HStack>
                              {lib.author && (
                                <HStack>
                                  <Text fontWeight="bold" fontSize="sm">Author:</Text>
                                  <Text fontSize="sm">{lib.author}</Text>
                                </HStack>
                              )}
                              <HStack>
                                <Text fontWeight="bold" fontSize="sm">Category:</Text>
                                <Badge colorScheme="cyan">{lib.category}</Badge>
                              </HStack>
                              <Box>
                                <Text fontWeight="bold" fontSize="sm" mb={1}>Description:</Text>
                                <Text fontSize="sm">{lib.description}</Text>
                              </Box>
                            </VStack>
                          </TabPanel>
                        </TabPanels>
                      </Tabs>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LibraryManager;
