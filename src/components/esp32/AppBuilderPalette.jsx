import React, { useState, useMemo } from "react";
import {
  GridItem,
  VStack,
  HStack,
  Box,
  Flex,
  Text,
  Badge,
  Input,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useColorModeValue
} from "@chakra-ui/react";
import {
  FaMobileAlt,
  FaPlus,
  FaMicrochip,
  FaGripVertical,
  FaLightbulb,
  FaCircle,
  FaMapMarkerAlt,
  FaTag,
  FaWpforms,
  FaSync,
  FaSlidersH,
  FaTemperatureHigh,
  FaTable,
  FaChartLine,
  FaPalette,
  FaGamepad,
  FaImage,
  FaIdCard,
  FaTasks,
  FaPlusCircle,
  FaMinus,
  FaBoxes,
  FaArrowUp,
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight
} from "react-icons/fa";

// Static palette items for App Builder to avoid recreation on every render
export const UI_PALETTE_ITEMS = [
  { type: "button", title: "Button", desc: "Tap action", icon: <FaCircle size={13} /> },
  { type: "location", title: "Location Button", desc: "Device switch geolog & QR", icon: <FaMapMarkerAlt size={13} /> },
  { type: "label", title: "Label", desc: "Display text", icon: <FaTag size={13} /> },
  { type: "textfield", title: "Text Field", desc: "Dynamic Google form", icon: <FaWpforms size={13} /> },
  { type: "switch", title: "Switch", desc: "Toggle on/off", icon: <FaSync size={13} /> },
  { type: "slider", title: "Slider", desc: "Range input", icon: <FaSlidersH size={13} /> },
  { type: "gauge", title: "Gauge", desc: "Telemetry meter", icon: <FaTemperatureHigh size={13} /> },
  { type: "crud_table", title: "CRUD Table", desc: "Data records manager", icon: <FaTable size={13} /> },
  { type: "chart", title: "Chart / Graph", desc: "Live plotting", icon: <FaChartLine size={13} /> },
  { type: "colorpicker", title: "Color Picker", desc: "RGB light picker", icon: <FaPalette size={13} /> },
  { type: "joystick", title: "Joystick", desc: "4-way motor control", icon: <FaGamepad size={13} /> },
  { type: "image", title: "Image", desc: "Show image", icon: <FaImage size={13} /> },
  { type: "card", title: "Card", desc: "Content card", icon: <FaIdCard size={13} /> },
  { type: "progress", title: "Progress Bar", desc: "Progress meter", icon: <FaTasks size={13} /> },
  { type: "fab", title: "Floating Button", desc: "Action button", icon: <FaPlusCircle size={13} /> },
  { type: "divider", title: "Divider", desc: "Separator", icon: <FaMinus size={13} /> }
];

export const LAYOUT_PALETTE_ITEMS = [
  { type: "card", title: "Vertical Stack Card", desc: "Vertical flex container", icon: <FaBoxes color="#3b82f6" size={13} />, defaultBinding: "Layout Container" },
  { type: "top_button", title: "Top Button", desc: "Top / Header action button", icon: <FaArrowUp color="#2563eb" size={13} />, defaultBinding: "GPIO 13 (Motor A)" },
  { type: "bottom_button", title: "Bottom Button", desc: "Bottom / Footer action button", icon: <FaArrowDown color="#0284c7" size={13} />, defaultBinding: "GPIO 14 (Motor B)" },
  { type: "left_button", title: "Left Button", desc: "Left side action button", icon: <FaArrowLeft color="#7c3aed" size={13} />, defaultBinding: "GPIO 12 (Steer Left)" },
  { type: "right_button", title: "Right Button", desc: "Right side action button", icon: <FaArrowRight color="#9333ea" size={13} />, defaultBinding: "GPIO 15 (Steer Right)" }
];

/**
 * AppBuilderPalette
 * Left sidebar palette for the App Builder Studio.
 * - In Rules/Blocks mode: Lists added components synchronized with the mobile app.
 * - In Designer mode: Displays searchable Control Panel & Layout Component palettes with drag-and-drop triggers.
 */
export default function AppBuilderPalette({
  bgCard,
  borderColor,
  appBuilderView,
  setAppBuilderView,
  widgets,
  logicBlocks,
  handleOpenAddRule,
  setDraggedPaletteItem,
  setDropInsertIndex,
  setIsDraggingOverPhone,
  handleAddComponent
}) {
  const [searchPalette, setSearchPalette] = useState("");

  const itemBg = useColorModeValue("white", "gray.800");
  const inputBg = useColorModeValue("gray.50", "gray.800");
  const iconBg = useColorModeValue("blue.50", "gray.700");
  const bindingBg = useColorModeValue("blue.50", "gray.900");
  const bindingBorder = useColorModeValue("blue.100", "gray.700");
  const hoverBg = useColorModeValue("blue.50", "gray.800");

  const filteredPalette = useMemo(() => {
    const q = searchPalette.toLowerCase();
    return UI_PALETTE_ITEMS.filter((item) => item.title.toLowerCase().includes(q));
  }, [searchPalette]);

  const filteredLayoutPalette = useMemo(() => {
    const q = searchPalette.toLowerCase();
    return LAYOUT_PALETTE_ITEMS.filter((item) => item.title.toLowerCase().includes(q));
  }, [searchPalette]);

  return (
    <GridItem bg={bgCard} borderRight="1px" borderColor={borderColor} p={3} display="flex" flexDirection="column" overflowY="auto">
      {appBuilderView === "blocks" ? (
        /* RULES MODE: SHOW ONLY COMPONENTS ADDED TO THE MOBILE APP IN DESIGNER */
        <VStack align="stretch" spacing={2.5} flex="1">
          <Flex justify="space-between" align="center" px={1} mb={0.5}>
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" fontWeight="extrabold" color="gray.700" letterSpacing="wider">
                APP COMPONENTS ({widgets.length})
              </Text>
              <Text fontSize="10px" color="gray.400">
                Components placed in Designer
              </Text>
            </VStack>
            <Badge colorScheme="blue" variant="subtle" fontSize="9px" px={1.5} py={0.5} borderRadius="full">
              Synchronized
            </Badge>
          </Flex>

          {/* Filter among added components */}
          <Input
            placeholder="Filter added components..."
            size="sm"
            value={searchPalette}
            onChange={(e) => setSearchPalette(e.target.value)}
            borderRadius="lg"
            bg={inputBg}
            fontSize="xs"
          />

          {widgets.length === 0 ? (
            <Box p={4} textAlign="center" bg={inputBg} borderRadius="xl" border="1px dashed" borderColor={borderColor} mt={2}>
              <Box p={2.5} bg="gray.100" color="gray.400" borderRadius="full" display="inline-block" mb={2}>
                <FaMobileAlt size={18} />
              </Box>
              <Text fontSize="xs" fontWeight="bold" color="gray.600">No Components Added</Text>
              <Text fontSize="11px" color="gray.400" mt={1} mb={3}>
                Components must be placed in the mobile Designer first to configure automation rules.
              </Text>
              <Button size="xs" colorScheme="blue" onClick={() => setAppBuilderView("designer")} borderRadius="lg">
                Go to Designer
              </Button>
            </Box>
          ) : (
            <VStack align="stretch" spacing={2} overflowY="auto" maxH="calc(100vh - 240px)" pr={1}>
              {widgets
                .filter((w) => {
                  if (!searchPalette.trim()) return true;
                  const q = searchPalette.toLowerCase();
                  return (
                    (w.title && w.title.toLowerCase().includes(q)) ||
                    (w.type && w.type.toLowerCase().includes(q)) ||
                    (w.boundTarget && w.boundTarget.toLowerCase().includes(q)) ||
                    (w.boundTargetName && w.boundTargetName.toLowerCase().includes(q))
                  );
                })
                .map((w) => {
                  const ruleCount = logicBlocks.filter((b) => b.triggerWidgetId === w.id).length;
                  const paletteMatch = UI_PALETTE_ITEMS.find((p) => p.type === w.type);
                  const binding = w.boundTargetName || w.boundTarget || "GPIO Pin";

                  return (
                    <Box
                      key={w.id}
                      p={2.5}
                      bg={itemBg}
                      borderRadius="xl"
                      border="1.5px solid"
                      borderColor={ruleCount > 0 ? "blue.200" : borderColor}
                      shadow="xs"
                      transition="all 0.15s ease"
                      _hover={{ borderColor: "blue.400", shadow: "sm", transform: "translateY(-1px)" }}
                    >
                      <HStack justify="space-between" align="start" mb={1}>
                        <HStack spacing={2} align="center">
                          <Box color="blue.500" p={1} bg={iconBg} borderRadius="md">
                            {paletteMatch?.icon || <FaLightbulb size={12} />}
                          </Box>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" fontWeight="bold" color="gray.800" noOfLines={1}>
                              {w.title}
                            </Text>
                            <Text fontSize="9px" color="gray.400" textTransform="capitalize">
                              {w.type} • #{w.id.slice(-6)}
                            </Text>
                          </VStack>
                        </HStack>

                        <Button
                          size="xs"
                          h="20px"
                          fontSize="10px"
                          colorScheme="blue"
                          variant="ghost"
                          leftIcon={<FaPlus size={8} />}
                          onClick={() => handleOpenAddRule(0, w)}
                          title="Add automation rule for this component"
                        >
                          + Rule
                        </Button>
                      </HStack>

                      {/* Hardware Binding Row */}
                      <Box mt={1} p={1.5} bg={bindingBg} borderRadius="md" border="1px solid" borderColor={bindingBorder}>
                        <HStack justify="space-between" align="center">
                          <HStack spacing={1.5}>
                            <FaMicrochip size={10} color="#2563eb" />
                            <Text fontSize="10px" fontWeight="semibold" color="blue.700" noOfLines={1}>
                              {binding}
                            </Text>
                          </HStack>
                          <Badge colorScheme="green" variant="solid" fontSize="8px" px={1} py={0} borderRadius="sm">
                            ACTIVE
                          </Badge>
                        </HStack>
                      </Box>

                      {/* Rules Attached Footer */}
                      <HStack justify="space-between" align="center" mt={1.5} px={0.5}>
                        <Text fontSize="9px" color="gray.500">
                          {ruleCount === 0 ? "0 rules active" : `${ruleCount} ${ruleCount === 1 ? "rule" : "rules"} active`}
                        </Text>
                        {ruleCount > 0 && (
                          <Badge colorScheme="purple" fontSize="8px" px={1} py={0} borderRadius="sm">
                            Linked
                          </Badge>
                        )}
                      </HStack>
                    </Box>
                  );
                })}
            </VStack>
          )}
        </VStack>
      ) : (
        /* DESIGNER MODE: SHOW COMPONENT PALETTE TO ADD NEW WIDGETS */
        <>
          <HStack mb={2.5} px={1}>
            <Input
              placeholder="Search components..."
              size="sm"
              value={searchPalette}
              onChange={(e) => setSearchPalette(e.target.value)}
              borderRadius="lg"
              bg={inputBg}
            />
          </HStack>

          <Accordion defaultIndex={[0, 1]} allowMultiple>
            <AccordionItem border="none">
              <AccordionButton px={2} py={2} _hover={{ bg: "transparent" }}>
                <Box flex="1" textAlign="left" fontWeight="bold" fontSize="xs" color="gray.500" letterSpacing="wider">
                  CONTROL PANEL ({filteredPalette.length})
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} px={1}>
                <VStack align="stretch" spacing={1.5}>
                  {filteredPalette.map((item) => (
                    <HStack
                      key={item.title}
                      p={2}
                      borderRadius="lg"
                      border="1px solid"
                      borderColor={borderColor}
                      _hover={{
                        borderColor: "blue.400",
                        bg: hoverBg,
                        transform: "translateY(-1px)",
                        shadow: "xs"
                      }}
                      cursor="grab"
                      _active={{ cursor: "grabbing" }}
                      transition="all 0.15s"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData(
                          "application/json",
                          JSON.stringify({
                            source: "palette",
                            type: item.type,
                            title: item.title,
                            defaultBinding: item.defaultBinding || "GPIO Pin"
                          })
                        );
                        e.dataTransfer.effectAllowed = "copy";
                        setDraggedPaletteItem(item);
                      }}
                      onDragEnd={() => {
                        setDraggedPaletteItem(null);
                        setDropInsertIndex(null);
                        setIsDraggingOverPhone(false);
                      }}
                      onClick={() => handleAddComponent(item.type, item.title, item.defaultBinding || "GPIO Pin")}
                      justify="space-between"
                      title="Drag onto phone screen or click + Add"
                    >
                      <HStack spacing={2.5}>
                        <Box p={1} bg="whiteAlpha.800" borderRadius="md" shadow="xs">
                          {item.icon}
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs" fontWeight="bold">
                            {item.title}
                          </Text>
                          <Text fontSize="10px" color="gray.400">
                            {item.desc}
                          </Text>
                        </VStack>
                      </HStack>
                      <HStack spacing={1.5}>
                        <Text fontSize="11px" color="blue.500" fontWeight="semibold">
                          + Add
                        </Text>
                        <Box color="gray.350" _hover={{ color: "blue.500" }} title="Drag to add">
                          <FaGripVertical size={11} />
                        </Box>
                      </HStack>
                    </HStack>
                  ))}
                </VStack>
              </AccordionPanel>
            </AccordionItem>

            {/* Layout Palette */}
            <AccordionItem border="none">
              <AccordionButton px={2} py={2} _hover={{ bg: "transparent" }}>
                <Box flex="1" textAlign="left" fontWeight="bold" fontSize="xs" color="gray.500" letterSpacing="wider">
                  LAYOUT ({filteredLayoutPalette.length})
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} px={1}>
                <VStack align="stretch" spacing={1.5}>
                  {filteredLayoutPalette.map((item) => (
                    <HStack
                      key={item.title}
                      p={2}
                      borderRadius="lg"
                      border="1px solid"
                      borderColor={borderColor}
                      _hover={{
                        borderColor: "blue.400",
                        bg: hoverBg,
                        transform: "translateY(-1px)",
                        shadow: "xs"
                      }}
                      cursor="grab"
                      _active={{ cursor: "grabbing" }}
                      transition="all 0.15s"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData(
                          "application/json",
                          JSON.stringify({
                            source: "palette",
                            type: item.type,
                            title: item.title,
                            defaultBinding: item.defaultBinding || "Layout"
                          })
                        );
                        e.dataTransfer.effectAllowed = "copy";
                        setDraggedPaletteItem(item);
                      }}
                      onDragEnd={() => {
                        setDraggedPaletteItem(null);
                        setDropInsertIndex(null);
                        setIsDraggingOverPhone(false);
                      }}
                      onClick={() => handleAddComponent(item.type, item.title, item.defaultBinding || "Layout")}
                      justify="space-between"
                      title="Drag onto phone screen or click + Add"
                    >
                      <HStack spacing={2.5}>
                        <Box p={1} bg="whiteAlpha.800" borderRadius="md" shadow="xs">
                          {item.icon}
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs" fontWeight="bold">
                            {item.title}
                          </Text>
                          <Text fontSize="10px" color="gray.400">
                            {item.desc}
                          </Text>
                        </VStack>
                      </HStack>
                      <HStack spacing={1.5}>
                        <Text fontSize="11px" color="blue.500" fontWeight="semibold">
                          + Add
                        </Text>
                        <Box color="gray.350" _hover={{ color: "blue.500" }} title="Drag to add">
                          <FaGripVertical size={11} />
                        </Box>
                      </HStack>
                    </HStack>
                  ))}
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </>
      )}
    </GridItem>
  );
}
