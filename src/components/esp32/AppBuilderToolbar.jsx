import React from "react";
import {
  Flex,
  HStack,
  Box,
  Text,
  Button,
  IconButton,
  Tooltip,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorModeValue
} from "@chakra-ui/react";
import {
  FaBolt,
  FaMobileAlt,
  FaPlus,
  FaEdit,
  FaSave,
  FaTrashAlt,
  FaCheck,
  FaThLarge,
  FaCode,
  FaPlay,
  FaUndo,
  FaRedo,
  FaRocket
} from "react-icons/fa";

/**
 * AppBuilderToolbar
 * Top header toolbar in App Builder Studio.
 * Includes:
 * - Breadcrumb & App Screen profile switcher (CRUD operations on screen profiles)
 * - Hardware connected status & link back to firmware flasher wizard
 * - Center mode selector (Designer, Rules / Blocks, Preview Simulator)
 * - Undo/Redo history, Save, and Publish triggers
 */
export default function AppBuilderToolbar({
  bgCard,
  borderColor,
  projectName,
  setNewAppNameInput,
  onNewAppModalOpen,
  setRenameAppNameInput,
  onRenameAppModalOpen,
  handleSaveApp,
  onClearCanvasModalOpen,
  savedApps,
  handleLoadApp,
  handleDeleteApp,
  selectedDevice,
  activePort,
  setWizardStep,
  appBuilderView,
  setAppBuilderView,
  logicBlocks,
  historyIndex,
  history,
  handleUndo,
  handleRedo,
  handleOpenPublishModal
}) {
  const projectNameColor = useColorModeValue("gray.800", "white");
  const menuBtnBg = useColorModeValue("gray.100", "gray.800");
  const menuBtnHoverBg = useColorModeValue("gray.200", "gray.700");
  const activeAppBg = useColorModeValue("blue.50", "gray.800");
  const viewToggleBg = useColorModeValue("gray.100", "gray.800");

  return (
    <Flex
      h="56px"
      px={4}
      bg={bgCard}
      borderBottom="1px"
      borderColor={borderColor}
      align="center"
      justify="space-between"
      shadow="sm"
    >
      {/* Breadcrumb & Project Selector */}
      <HStack spacing={3}>
        <Box p={2} bg="blue.500" color="white" borderRadius="lg" shadow="sm">
          <FaBolt size={14} />
        </Box>
        <Text fontSize="xs" color="gray.500" display={{ base: "none", md: "block" }}>
          Dashboard / <Text as="span" fontWeight="semibold" color={projectNameColor}>{projectName}</Text> / <Text as="span" color="blue.500" fontWeight="bold">App Builder</Text>
        </Text>
        <Menu>
          <MenuButton
            as={Button}
            size="xs"
            variant="ghost"
            bg={menuBtnBg}
            _hover={{ bg: menuBtnHoverBg }}
            leftIcon={<FaMobileAlt size={12} color="#2563eb" />}
            rightIcon={<Text fontSize="10px" color="gray.400">▾</Text>}
            borderRadius="lg"
            fontWeight="bold"
            fontSize="xs"
            h="28px"
          >
            {projectName} App
          </MenuButton>
          <MenuList zIndex={50} shadow="xl" borderRadius="xl" fontSize="xs" minW="240px">
            <Box px={3} py={1.5}>
              <Text fontWeight="bold" fontSize="10px" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                App Screens (CRUD)
              </Text>
            </Box>
            <MenuItem
              icon={<FaPlus size={11} color="#2563eb" />}
              onClick={() => {
                setNewAppNameInput("");
                onNewAppModalOpen();
              }}
            >
              Create New App Screen...
            </MenuItem>
            <MenuItem
              icon={<FaEdit size={11} color="#8b5cf6" />}
              onClick={() => {
                setRenameAppNameInput(projectName);
                onRenameAppModalOpen();
              }}
            >
              Rename Current App...
            </MenuItem>
            <MenuItem icon={<FaSave size={11} color="#10b981" />} onClick={() => handleSaveApp()}>
              Save App Configuration
            </MenuItem>
            <MenuItem icon={<FaTrashAlt size={11} color="#ef4444" />} onClick={onClearCanvasModalOpen}>
              Clear All Canvas Components...
            </MenuItem>
            <MenuDivider />
            <Box px={3} py={1}>
              <Text fontWeight="bold" fontSize="10px" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                Saved App Screens ({savedApps.length})
              </Text>
            </Box>
            {savedApps.map((app) => (
              <MenuItem
                key={app.name}
                onClick={() => handleLoadApp(app.name)}
                bg={app.name === projectName ? activeAppBg : "transparent"}
                fontWeight={app.name === projectName ? "bold" : "normal"}
              >
                <HStack justify="space-between" w="100%">
                  <HStack spacing={2}>
                    {app.name === projectName && <FaCheck size={10} color="#2563eb" />}
                    <Text>{app.name}</Text>
                  </HStack>
                  <HStack spacing={1}>
                    <Badge size="xs" fontSize="9px" colorScheme="blue">
                      {app.widgetCount || 0} items
                    </Badge>
                    {savedApps.length > 1 && (
                      <IconButton
                        icon={<FaTrashAlt size={9} />}
                        size="xs"
                        variant="ghost"
                        color="red.400"
                        h="18px"
                        minW="18px"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteApp(app.name);
                        }}
                        aria-label="Delete App Screen"
                      />
                    )}
                  </HStack>
                </HStack>
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
        <HStack bg="green.50" color="green.700" px={2.5} py={1} borderRadius="full" fontSize="11px" fontWeight="semibold">
          <Box w="6px" h="6px" bg="green.500" borderRadius="full" />
          <Text>{selectedDevice?.friendlyName || selectedDevice?.name || `Espressif ESP32 (${activePort})`}</Text>
        </HStack>
        <Button
          size="xs"
          variant="outline"
          colorScheme="blue"
          borderRadius="lg"
          leftIcon={<FaBolt size={10} />}
          onClick={() => setWizardStep("connection")}
          title="Return to Firmware Flashing Wizard"
        >
          Flasher Wizard
        </Button>
      </HStack>

      {/* Center Mode Switcher */}
      <HStack spacing={1} bg={viewToggleBg} p={1} borderRadius="xl">
        <Button
          size="xs"
          variant={appBuilderView === "designer" ? "solid" : "ghost"}
          colorScheme={appBuilderView === "designer" ? "blue" : "gray"}
          leftIcon={<FaThLarge size={11} />}
          onClick={() => setAppBuilderView("designer")}
          borderRadius="lg"
        >
          Designer
        </Button>
        <Button
          size="xs"
          variant={appBuilderView === "blocks" ? "solid" : "ghost"}
          colorScheme={appBuilderView === "blocks" ? "blue" : "gray"}
          leftIcon={<FaCode size={11} />}
          onClick={() => setAppBuilderView("blocks")}
          borderRadius="lg"
        >
          Rules ({logicBlocks.length})
        </Button>
        <Button
          size="xs"
          variant={appBuilderView === "preview" ? "solid" : "ghost"}
          colorScheme={appBuilderView === "preview" ? "blue" : "gray"}
          leftIcon={<FaPlay size={11} />}
          onClick={() => setAppBuilderView("preview")}
          borderRadius="lg"
        >
          Preview
        </Button>
      </HStack>

      {/* Right Action Buttons */}
      <HStack spacing={2}>
        <Tooltip label="Undo (Ctrl+Z)" placement="bottom">
          <IconButton
            icon={<FaUndo size={12} />}
            size="sm"
            variant="ghost"
            aria-label="Undo"
            isDisabled={historyIndex <= 0}
            onClick={handleUndo}
          />
        </Tooltip>
        <Tooltip label="Redo (Ctrl+Y)" placement="bottom">
          <IconButton
            icon={<FaRedo size={12} />}
            size="sm"
            variant="ghost"
            aria-label="Redo"
            isDisabled={historyIndex >= history.length - 1}
            onClick={handleRedo}
          />
        </Tooltip>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<FaSave size={13} />}
          onClick={handleSaveApp}
        >
          Save
        </Button>
        <Button
          size="sm"
          colorScheme="green"
          bg="#10b981"
          _hover={{ bg: "#059669" }}
          leftIcon={<FaRocket size={13} />}
          onClick={handleOpenPublishModal}
          shadow="md"
        >
          Publish App
        </Button>
      </HStack>
    </Flex>
  );
}
