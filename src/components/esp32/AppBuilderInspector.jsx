import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Select,
  Input,
  Badge,
  IconButton,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Divider,
  GridItem,
  Spinner,
  useToast,
  useColorModeValue
} from "@chakra-ui/react";
import {
  FaFolder,
  FaCogs,
  FaPlus,
  FaMobileAlt,
  FaTrashAlt,
  FaGripVertical,
  FaLightbulb,
  FaSlidersH,
  FaTemperatureHigh,
  FaTag,
  FaEye,
  FaEyeSlash,
  FaArrowUp,
  FaArrowDown,
  FaBolt,
  FaEdit,
  FaMapMarkerAlt,
  FaExternalLinkAlt,
  FaCrosshairs,
  FaWpforms,
  FaPaperPlane
} from "react-icons/fa";
import {
  isHardcodedTextFieldQuestion,
  isHardcodedTextFieldResponse,
  isStaleTestGeolog,
  getLogTimestampMs,
  formatGeologTime
} from "./geologHelpers.js";

// Curated palettes for widget customization
const THEME_COLORS = [
  "#2563eb", // Royal Blue
  "#0284c7", // Sky Blue
  "#06b6d4", // Ocean Cyan
  "#10b981", // Emerald
  "#059669", // Forest Green
  "#f59e0b", // Amber Gold
  "#ea580c", // Coral Orange
  "#ef4444", // Ruby Red
  "#e11d48", // Rose Crimson
  "#8b5cf6", // Violet Purple
  "#7c3aed", // Electric Purple
  "#ec4899", // Neon Pink
  "#334155"  // Slate Steel
];

const BACKGROUND_PALETTES = {
  light: [
    { label: "Pure White", hex: "#ffffff" },
    { label: "Light Slate", hex: "#f8fafc" },
    { label: "Cool Gray", hex: "#f1f5f9" },
    { label: "Soft Zinc", hex: "#f4f4f5" },
    { label: "Ice Blue", hex: "#eff6ff" },
    { label: "Soft Mint", hex: "#ecfdf5" },
    { label: "Warm Cream", hex: "#fffbeb" },
    { label: "Soft Rose", hex: "#fff1f2" },
    { label: "Lavender", hex: "#faf5ff" },
    { label: "Soft Amber", hex: "#fef3c7" }
  ],
  dark: [
    { label: "Pitch Black", hex: "#000000" },
    { label: "Navy Dark", hex: "#101a38" },
    { label: "Midnight Blue", hex: "#131b2e" },
    { label: "Slate Dark", hex: "#0f172a" },
    { label: "Deep Slate", hex: "#1e293b" },
    { label: "Zinc Charcoal", hex: "#18181b" },
    { label: "Deep Indigo", hex: "#1e1b4b" },
    { label: "Emerald Night", hex: "#064e3b" },
    { label: "Deep Crimson", hex: "#261214" },
    { label: "Deep Violet", hex: "#2e1065" },
    { label: "Deep Teal", hex: "#042f2e" },
    { label: "Deep Coffee", hex: "#271c19" }
  ],
  vibrant: [
    { label: "Sapphire Blue", hex: "#2563eb" },
    { label: "Sky Blue", hex: "#0284c7" },
    { label: "Ocean Cyan", hex: "#06b6d4" },
    { label: "Emerald Green", hex: "#10b981" },
    { label: "Forest Green", hex: "#059669" },
    { label: "Amber Gold", hex: "#f59e0b" },
    { label: "Coral Orange", hex: "#ea580c" },
    { label: "Ruby Red", hex: "#ef4444" },
    { label: "Rose Crimson", hex: "#e11d48" },
    { label: "Violet Purple", hex: "#8b5cf6" },
    { label: "Electric Purple", hex: "#7c3aed" },
    { label: "Slate Steel", hex: "#334155" }
  ],
  gradient: [
    { label: "Midnight Sky", hex: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" },
    { label: "Royal Ocean", hex: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)" },
    { label: "Emerald Glow", hex: "linear-gradient(135deg, #064e3b 0%, #10b981 100%)" },
    { label: "Sunset Fire", hex: "linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)" },
    { label: "Purple Dream", hex: "linear-gradient(135deg, #2e1065 0%, #8b5cf6 100%)" },
    { label: "Crimson Night", hex: "linear-gradient(135deg, #450a0a 0%, #dc2626 100%)" },
    { label: "Cyber Teal", hex: "linear-gradient(135deg, #042f2e 0%, #06b6d4 100%)" },
    { label: "Soft Cloud", hex: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)" }
  ]
};

export default function AppBuilderInspector({
  bgCard,
  borderColor,
  bgPurpleCard,
  inspectorTab,
  setInspectorTab,
  widgets,
  selectedWidgetId,
  setSelectedWidgetId,
  activeWidget,
  projectName,
  handleAddComponent,
  onClearCanvasModalOpen,
  draggedWidgetId,
  setDraggedWidgetId,
  dropInsertIndex,
  setDropInsertIndex,
  handlePhoneDrop,
  handleWidgetDragOver,
  isDraggingActive,
  setIsDraggingOverPhone,
  handleToggleVisibility,
  handleMoveWidget,
  handleDeleteWidget,
  handleUpdateWidget,
  handleTestHardwareSignal,
  handleOpenAddCrudRecord,
  handleOpenEditCrudRecord,
  handleDeleteCrudRecord,
  deviceDetectedLocation,
  handleCalibrateLocation,
  isDetectingLocation,
  fetchCurrentDeviceLocation,
  handleClearGeologs,
  newQuestionInputs,
  setNewQuestionInputs,
  handleAddQuestionToForm,
  handleDeleteQuestionFromForm,
  handleClearFormResponses
}) {
  const toast = useToast();
  const [locationSearchInput, setLocationSearchInput] = useState("");
  const [bgFilter, setBgFilter] = useState("all");

  const tabBg = useColorModeValue("gray.100", "gray.800");
  const borderSubtle = useColorModeValue("gray.200", "gray.700");
  const selectedWidgetBg = useColorModeValue("blue.50", "gray.800");
  const unselectedWidgetBg = useColorModeValue("gray.50", "gray.850");
  const cardSubtleBg = useColorModeValue("gray.50", "gray.800");
  const crudSectionBg = useColorModeValue("blue.50", "gray.800");
  const iconSubtleBg = useColorModeValue("gray.100", "gray.800");

  return (
    <GridItem bg={bgCard} borderLeft="1px" borderColor={borderColor} p={4} display="flex" flexDirection="column" overflowY="auto">
      {/* Tab switch: Tree vs Properties */}
      <HStack bg={tabBg} p={1} borderRadius="lg" mb={4}>
        <Button
          size="xs"
          flex="1"
          variant={inspectorTab === "tree" ? "solid" : "ghost"}
          colorScheme={inspectorTab === "tree" ? "blue" : "gray"}
          leftIcon={<FaFolder size={11} />}
          onClick={() => setInspectorTab("tree")}
          borderRadius="md"
        >
          Tree ({widgets.length})
        </Button>
        <Button
          size="xs"
          flex="1"
          variant={inspectorTab === "properties" ? "solid" : "ghost"}
          colorScheme={inspectorTab === "properties" ? "blue" : "gray"}
          leftIcon={<FaCogs size={11} />}
          onClick={() => setInspectorTab("properties")}
          borderRadius="md"
        >
          Properties
        </Button>
      </HStack>

      {/* INSPECTOR TAB 1: TREE VIEW */}
      {inspectorTab === "tree" && (
        <VStack align="stretch" spacing={3}>
          <HStack justify="space-between" px={1}>
            <Text fontSize="xs" fontWeight="bold" color="gray.500" letterSpacing="wider">
              COMPONENT HIERARCHY
            </Text>
            <Button size="xs" colorScheme="blue" variant="ghost" leftIcon={<FaPlus size={10} />} onClick={() => handleAddComponent("button", "Action Button", "GPIO Pin")}>
              Add
            </Button>
          </HStack>

          <Box p={2} bg="blue.50" borderRadius="xl" border="1px solid" borderColor="blue.200">
            <HStack spacing={2} color="blue.900" fontSize="xs" fontWeight="bold" justify="space-between" w="100%">
              <HStack spacing={2}>
                <FaMobileAlt size={12} />
                <Text>📱 {projectName} Screen (Root)</Text>
              </HStack>
              {widgets.length > 0 && (
                <Button
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  h="18px"
                  fontSize="10px"
                  leftIcon={<FaTrashAlt size={8} />}
                  onClick={onClearCanvasModalOpen}
                >
                  Clear All
                </Button>
              )}
            </HStack>
          </Box>

          <VStack
            align="stretch"
            spacing={1.5}
            pl={2}
            borderLeft="2px solid"
            borderColor={borderSubtle}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = draggedWidgetId ? "move" : "copy";
              if (e.target === e.currentTarget) {
                setDropInsertIndex(widgets.length);
              }
            }}
            onDrop={(e) => handlePhoneDrop(e, dropInsertIndex)}
          >
            {widgets.length === 0 && (
              <Box
                py={6}
                px={2}
                textAlign="center"
                borderRadius="xl"
                border="1px dashed"
                borderColor={isDraggingActive ? "blue.400" : "gray.300"}
                bg={isDraggingActive ? "blue.50" : "transparent"}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "copy";
                  setDropInsertIndex(0);
                }}
                onDrop={(e) => handlePhoneDrop(e, 0)}
              >
                <Text fontSize="xs" fontWeight="medium" color={isDraggingActive ? "blue.600" : "gray.400"}>
                  {isDraggingActive ? "Drop component here" : "No components in tree"}
                </Text>
                <Text fontSize="10px" color="gray.400" mt={0.5}>
                  Drag or add components from the left palette
                </Text>
              </Box>
            )}
            {widgets.map((w, idx) => {
              const isSelected = w.id === selectedWidgetId;
              const isBeingDragged = draggedWidgetId === w.id;
              return (
                <HStack
                  key={w.id}
                  p={2.5}
                  borderRadius="xl"
                  bg={isSelected ? selectedWidgetBg : unselectedWidgetBg}
                  border="1px solid"
                  borderColor={isSelected ? "blue.400" : isBeingDragged ? "blue.300" : borderColor}
                  borderStyle={isBeingDragged ? "dashed" : "solid"}
                  opacity={isBeingDragged ? 0.4 : 1}
                  justify="space-between"
                  cursor="pointer"
                  _hover={{ borderColor: "blue.300" }}
                  draggable
                  onDragStart={(e) => {
                    if (e.target.tagName === "BUTTON" || e.target.closest("button")) {
                      e.preventDefault();
                      return;
                    }
                    e.dataTransfer.setData(
                      "application/json",
                      JSON.stringify({
                        source: "widget-reorder",
                        widgetId: w.id,
                        fromIndex: idx
                      })
                    );
                    e.dataTransfer.effectAllowed = "move";
                    setDraggedWidgetId(w.id);
                  }}
                  onDragEnd={() => {
                    setDraggedWidgetId(null);
                    setDropInsertIndex(null);
                    setIsDraggingOverPhone(false);
                  }}
                  onDragOver={(e) => handleWidgetDragOver(e, idx)}
                  onDrop={(e) => handlePhoneDrop(e, dropInsertIndex)}
                  onClick={() => {
                    setSelectedWidgetId(w.id);
                    setInspectorTab("properties");
                  }}
                >
                  <HStack spacing={2}>
                    <Box
                      cursor="grab"
                      _active={{ cursor: "grabbing" }}
                      color="gray.400"
                      _hover={{ color: "blue.500" }}
                      title="Drag to reorder in tree"
                    >
                      <FaGripVertical size={10} />
                    </Box>
                    <Box color={w.color || "blue.500"} fontSize="12px">
                      {w.type === "switch" ? <FaLightbulb /> : w.type === "slider" ? <FaSlidersH /> : w.type === "gauge" ? <FaTemperatureHigh /> : <FaTag />}
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xs" fontWeight="bold" color={isSelected ? "blue.600" : "inherit"}>
                        {w.title}
                      </Text>
                      <Text fontSize="10px" color="gray.400">
                        {w.boundTarget || w.type}
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack spacing={1}>
                    <IconButton
                      icon={w.visible !== false ? <FaEye size={10} /> : <FaEyeSlash size={10} color="gray" />}
                      size="xs"
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); handleToggleVisibility(w.id); }}
                      aria-label="Visibility"
                    />
                    <IconButton
                      icon={<FaArrowUp size={9} />}
                      size="xs"
                      variant="ghost"
                      isDisabled={idx === 0}
                      onClick={(e) => { e.stopPropagation(); handleMoveWidget(w.id, "up"); }}
                      aria-label="Up"
                    />
                    <IconButton
                      icon={<FaArrowDown size={9} />}
                      size="xs"
                      variant="ghost"
                      isDisabled={idx === widgets.length - 1}
                      onClick={(e) => { e.stopPropagation(); handleMoveWidget(w.id, "down"); }}
                      aria-label="Down"
                    />
                    <IconButton
                      icon={<FaTrashAlt size={10} />}
                      size="xs"
                      variant="ghost"
                      color="red.400"
                      onClick={(e) => { e.stopPropagation(); handleDeleteWidget(w.id); }}
                      aria-label="Delete"
                    />
                  </HStack>
                </HStack>
              );
            })}
          </VStack>
        </VStack>
      )}

      {/* INSPECTOR TAB 2: PROPERTIES VIEW */}
      {inspectorTab === "properties" && activeWidget && (
        <VStack align="stretch" spacing={5}>
          {/* Active Component Title & Type */}
          <HStack spacing={3} p={2.5} bg={cardSubtleBg} borderRadius="xl">
            <Box p={2} bg="blue.50" color="blue.600" borderRadius="lg">
              {activeWidget.type === "switch" ? <FaLightbulb size={16} /> : activeWidget.type === "slider" ? <FaSlidersH size={16} /> : activeWidget.type === "gauge" ? <FaTemperatureHigh size={16} /> : <FaTag size={16} />}
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold" fontSize="sm">
                {activeWidget.title}
              </Text>
              <Text fontSize="11px" color="gray.500" textTransform="capitalize">
                {activeWidget.type} Component
              </Text>
            </VStack>
          </HStack>

          {/* DISPLAY SECTION */}
          <VStack align="stretch" spacing={3}>
            <Text fontSize="xs" fontWeight="extrabold" color="gray.500" letterSpacing="wider">
              DISPLAY
            </Text>
            <Box>
              <Text fontSize="xs" fontWeight="semibold" mb={1} color="gray.600">
                Label
              </Text>
              <Input
                size="sm"
                value={activeWidget.title}
                onChange={(e) => handleUpdateWidget("title", e.target.value)}
                borderRadius="lg"
              />
            </Box>

            {/* Color Picker Palette */}
            <Box>
              <Text fontSize="xs" fontWeight="semibold" mb={1.5} color="gray.600">
                Color Theme
              </Text>
              <HStack spacing={1.5} wrap="wrap" align="center">
                {THEME_COLORS.map((c) => {
                  const isSelected = activeWidget.color === c;
                  return (
                    <Box
                      key={c}
                      w="20px"
                      h="20px"
                      borderRadius="full"
                      bg={c}
                      cursor="pointer"
                      border={isSelected ? "2px solid #2563eb" : "1px solid rgba(0,0,0,0.15)"}
                      boxShadow={isSelected ? "0 0 0 2px rgba(37,99,235,0.4)" : "none"}
                      _hover={{ transform: "scale(1.2)" }}
                      transition="all 0.12s"
                      onClick={() => handleUpdateWidget("color", c)}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {isSelected && <Box w="5px" h="5px" borderRadius="full" bg="white" />}
                    </Box>
                  );
                })}
                {/* Custom Theme Color Swatch with native color picker */}
                <Box
                  as="label"
                  w="20px"
                  h="20px"
                  borderRadius="full"
                  border="1.5px dashed"
                  borderColor="gray.400"
                  bg={activeWidget.color || "#2563eb"}
                  cursor="pointer"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  position="relative"
                  overflow="hidden"
                  title="Pick custom theme color"
                  _hover={{ transform: "scale(1.2)" }}
                  transition="all 0.12s"
                >
                  <input
                    type="color"
                    value={activeWidget.color && activeWidget.color.startsWith("#") ? activeWidget.color : "#2563eb"}
                    onChange={(e) => handleUpdateWidget("color", e.target.value)}
                    style={{
                      opacity: 0,
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      cursor: "pointer"
                    }}
                  />
                </Box>
              </HStack>
            </Box>

            {/* Font Size */}
            <Box>
              <HStack justify="space-between" mb={1}>
                <Text fontSize="xs" fontWeight="semibold" color="gray.600">
                  Font Size
                </Text>
                <Text fontSize="xs" color="gray.400">
                  {activeWidget.fontSize || 15}px
                </Text>
              </HStack>
              <Slider
                value={activeWidget.fontSize || 15}
                min={10}
                max={28}
                onChange={(val) => handleUpdateWidget("fontSize", val)}
              >
                <SliderTrack bg="gray.200">
                  <SliderFilledTrack bg="blue.500" />
                </SliderTrack>
                <SliderThumb boxSize={3} />
              </Slider>
            </Box>

            {/* Card Background Color - Extensive Multiple Options */}
            <Box>
              <HStack justify="space-between" mb={1.5} align="center">
                <Text fontSize="xs" fontWeight="semibold" color="gray.600">
                  Background Color
                </Text>
                {activeWidget.backgroundColor && activeWidget.backgroundColor !== "white" && activeWidget.backgroundColor !== "#ffffff" && (
                  <Button
                    size="xs"
                    variant="ghost"
                    h="18px"
                    fontSize="10px"
                    color="blue.500"
                    px={1.5}
                    onClick={() => handleUpdateWidget("backgroundColor", "#ffffff")}
                  >
                    Reset (White)
                  </Button>
                )}
              </HStack>

              {/* Category Filter Pills */}
              <HStack spacing={1} mb={2} wrap="wrap">
                {[
                  { id: "all", label: "All" },
                  { id: "light", label: "Light" },
                  { id: "dark", label: "Dark" },
                  { id: "vibrant", label: "Vibrant" },
                  { id: "gradient", label: "Gradient" }
                ].map((cat) => (
                  <Button
                    key={cat.id}
                    size="xs"
                    h="20px"
                    px={2}
                    fontSize="10px"
                    borderRadius="full"
                    variant={bgFilter === cat.id ? "solid" : "outline"}
                    colorScheme={bgFilter === cat.id ? "blue" : "gray"}
                    onClick={() => setBgFilter(cat.id)}
                  >
                    {cat.label}
                  </Button>
                ))}
              </HStack>

              {/* Swatches Container */}
              <Box maxH="140px" overflowY="auto" pr={1} py={1} css={{ "&::-webkit-scrollbar": { width: "4px" } }}>
                {bgFilter === "all" ? (
                  <VStack align="stretch" spacing={2.5}>
                    {Object.entries(BACKGROUND_PALETTES).map(([categoryKey, list]) => (
                      <Box key={categoryKey}>
                        <Text fontSize="9px" fontWeight="bold" textTransform="uppercase" color="gray.400" mb={1}>
                          {categoryKey}
                        </Text>
                        <HStack spacing={1.5} wrap="wrap">
                          {list.map((item) => {
                            const isSelected = activeWidget.backgroundColor === item.hex;
                            return (
                              <Box
                                key={item.hex}
                                w="22px"
                                h="22px"
                                borderRadius="md"
                                bg={item.hex.startsWith("linear") ? undefined : item.hex}
                                background={item.hex.startsWith("linear") ? item.hex : undefined}
                                cursor="pointer"
                                border={isSelected ? "2px solid #2563eb" : "1px solid rgba(0,0,0,0.15)"}
                                boxShadow={isSelected ? "0 0 0 2px rgba(37,99,235,0.4)" : "none"}
                                _hover={{ transform: "scale(1.18)", zIndex: 2 }}
                                transition="all 0.12s"
                                title={item.label}
                                onClick={() => handleUpdateWidget("backgroundColor", item.hex)}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                {isSelected && (
                                  <Box
                                    w="6px"
                                    h="6px"
                                    borderRadius="full"
                                    bg={item.hex === "#ffffff" || item.hex.includes("white") || item.hex.includes("#fff") || item.hex.includes("#f8") ? "#2563eb" : "white"}
                                  />
                                )}
                              </Box>
                            );
                          })}
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  <HStack spacing={1.5} wrap="wrap">
                    {(BACKGROUND_PALETTES[bgFilter] || []).map((item) => {
                      const isSelected = activeWidget.backgroundColor === item.hex;
                      return (
                        <Box
                          key={item.hex}
                          w="24px"
                          h="24px"
                          borderRadius="md"
                          bg={item.hex.startsWith("linear") ? undefined : item.hex}
                          background={item.hex.startsWith("linear") ? item.hex : undefined}
                          cursor="pointer"
                          border={isSelected ? "2px solid #2563eb" : "1px solid rgba(0,0,0,0.15)"}
                          boxShadow={isSelected ? "0 0 0 2px rgba(37,99,235,0.4)" : "none"}
                          _hover={{ transform: "scale(1.18)", zIndex: 2 }}
                          transition="all 0.12s"
                          title={item.label}
                          onClick={() => handleUpdateWidget("backgroundColor", item.hex)}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          {isSelected && (
                            <Box
                              w="6px"
                              h="6px"
                              borderRadius="full"
                              bg={item.hex === "#ffffff" || item.hex.includes("white") || item.hex.includes("#fff") || item.hex.includes("#f8") ? "#2563eb" : "white"}
                            />
                          )}
                        </Box>
                      );
                    })}
                  </HStack>
                )}
              </Box>

              {/* Custom Color Input Row (Native Picker + Hex input) */}
              <HStack spacing={2} mt={2} p={1.5} bg={cardSubtleBg} borderRadius="lg" border="1px solid" borderColor={borderSubtle} align="center">
                <Box
                  as="label"
                  w="26px"
                  h="26px"
                  borderRadius="md"
                  border="1.5px solid"
                  borderColor="gray.300"
                  bg={activeWidget.backgroundColor?.startsWith("linear") ? undefined : (activeWidget.backgroundColor || "#ffffff")}
                  background={activeWidget.backgroundColor?.startsWith("linear") ? activeWidget.backgroundColor : undefined}
                  cursor="pointer"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  position="relative"
                  overflow="hidden"
                  flexShrink={0}
                  title="Click to pick custom color"
                  _hover={{ borderColor: "blue.500" }}
                  transition="all 0.15s"
                >
                  <input
                    type="color"
                    value={
                      activeWidget.backgroundColor && activeWidget.backgroundColor.startsWith("#")
                        ? activeWidget.backgroundColor
                        : "#ffffff"
                    }
                    onChange={(e) => handleUpdateWidget("backgroundColor", e.target.value)}
                    style={{
                      opacity: 0,
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      cursor: "pointer"
                    }}
                  />
                </Box>
                <Input
                  size="xs"
                  placeholder="Custom Hex / Color (e.g. #1e293b)"
                  value={activeWidget.backgroundColor || ""}
                  onChange={(e) => handleUpdateWidget("backgroundColor", e.target.value)}
                  borderRadius="md"
                  fontFamily="mono"
                  fontSize="11px"
                  bg="white"
                />
              </HStack>
            </Box>

            {/* Corner Radius */}
            <Box>
              <HStack justify="space-between" mb={1}>
                <Text fontSize="xs" fontWeight="semibold" color="gray.600">
                  Corner Radius
                </Text>
                <Text fontSize="xs" color="gray.400">
                  {activeWidget.cornerRadius || 16}px
                </Text>
              </HStack>
              <Slider
                value={activeWidget.cornerRadius || 16}
                min={0}
                max={32}
                onChange={(val) => handleUpdateWidget("cornerRadius", val)}
              >
                <SliderTrack bg="gray.200">
                  <SliderFilledTrack bg="blue.500" />
                </SliderTrack>
                <SliderThumb boxSize={3} />
              </Slider>
            </Box>

            {/* Visible Switch */}
            <HStack justify="space-between">
              <Text fontSize="xs" fontWeight="semibold" color="gray.600">
                Visible on App
              </Text>
              <Switch
                colorScheme="blue"
                isChecked={activeWidget.visible !== false}
                onChange={(e) => handleUpdateWidget("visible", e.target.checked)}
              />
            </HStack>
          </VStack>

          <Divider />

          {/* HARDWARE BINDING SECTION */}
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between">
              <Text fontSize="xs" fontWeight="extrabold" color="gray.500" letterSpacing="wider">
                HARDWARE BINDING
              </Text>
              <Badge colorScheme="green" fontSize="9px">
                ACTIVE
              </Badge>
            </HStack>

            <Box p={3} bg="green.50" borderRadius="xl" border="1px solid" borderColor="green.200">
              <VStack align="stretch" spacing={2.5}>
                <Box>
                  <Text fontSize="10px" fontWeight="bold" color="gray.600" mb={1}>
                    Bind to Hardware
                  </Text>
                  <Select
                    size="sm"
                    bg="white"
                    value={activeWidget.boundTarget}
                    onChange={(e) => {
                      handleUpdateWidget("boundTarget", e.target.value);
                      handleUpdateWidget("boundTargetName", `Bound → ${e.target.value}`);
                    }}
                    borderRadius="lg"
                  >
                    <option value="LED (GPIO 2)">LED (GPIO 2 - Onboard)</option>
                    <option value="Servo Motor (PWM)">Servo Motor (GPIO 4 PWM)</option>
                    <option value="Temperature Sensor (ADC)">Temperature Sensor (ADC / I2C)</option>
                    <option value="Buzzer (GPIO 5)">Buzzer Alarm (GPIO 5)</option>
                    <option value="Relay (GPIO 18)">Relay Module (GPIO 18)</option>
                    <option value="RGB NeoPixel (GPIO 48)">RGB NeoPixel (GPIO 48)</option>
                    <option value="Custom Serial Command">Custom Serial Command</option>
                  </Select>
                </Box>

                <Box>
                  <Text fontSize="10px" fontWeight="bold" color="gray.600" mb={1}>
                    Action Mode
                  </Text>
                  <Select
                    size="sm"
                    bg="white"
                    value={activeWidget.action}
                    onChange={(e) => handleUpdateWidget("action", e.target.value)}
                    borderRadius="lg"
                  >
                    <option value="Turn ON / OFF">Turn ON / OFF</option>
                    <option value="Set PWM Angle">Set PWM Angle / Duty</option>
                    <option value="Read Telemetry">Read Telemetry</option>
                    <option value="Trigger Alarm">Trigger Pulse Alarm</option>
                    <option value="Send Serial String">Send Serial String</option>
                  </Select>
                </Box>

                <Button
                  size="xs"
                  colorScheme="green"
                  variant="solid"
                  leftIcon={<FaBolt size={10} />}
                  onClick={() => handleTestHardwareSignal(activeWidget)}
                  mt={1}
                >
                  Test Hardware Signal
                </Button>
              </VStack>
            </Box>

            {/* CRUD DATA RECORDS SECTION in Inspector */}
            {activeWidget.type === "crud_table" && (
              <VStack align="stretch" spacing={2.5} p={3} bg={crudSectionBg} borderRadius="xl" border="1px solid" borderColor="blue.200">
                <HStack justify="space-between">
                  <Text fontSize="xs" fontWeight="extrabold" color="blue.700" letterSpacing="wider">
                    DATA RECORDS ({activeWidget.records?.length || 0})
                  </Text>
                  <Button
                    size="xs"
                    colorScheme="blue"
                    variant="solid"
                    leftIcon={<FaPlus size={8} />}
                    onClick={() => handleOpenAddCrudRecord(activeWidget.id)}
                    h="20px"
                    fontSize="10px"
                  >
                    Add Record
                  </Button>
                </HStack>
                <VStack align="stretch" spacing={1.5} maxH="180px" overflowY="auto">
                  {(activeWidget.records || []).map((rec) => (
                    <HStack key={rec.id} p={2} bg="white" borderRadius="md" justify="space-between" fontSize="11px" shadow="xs">
                      <VStack align="start" spacing={0} maxW="130px">
                        <Text fontWeight="bold" isTruncated>{rec.name}</Text>
                        <Text fontSize="9px" color="gray.400">{rec.value} • {rec.timestamp}</Text>
                      </VStack>
                      <HStack spacing={1}>
                        <IconButton
                          icon={<FaEdit size={9} />}
                          size="xs"
                          h="20px"
                          minW="20px"
                          variant="ghost"
                          onClick={() => handleOpenEditCrudRecord(activeWidget.id, rec)}
                          aria-label="Edit"
                        />
                        <IconButton
                          icon={<FaTrashAlt size={9} />}
                          size="xs"
                          h="20px"
                          minW="20px"
                          variant="ghost"
                          color="red.400"
                          onClick={() => handleDeleteCrudRecord(activeWidget.id, rec.id)}
                          aria-label="Delete"
                        />
                      </HStack>
                    </HStack>
                  ))}
                </VStack>
              </VStack>
            )}

            {/* DEVICE LOCATION & SWITCH GEOLOG SECTION in Inspector */}
            {activeWidget.type === "location" && (() => {
              const hist = (Array.isArray(activeWidget.locationHistory) ? [...activeWidget.locationHistory] : [])
                .filter(h => !isStaleTestGeolog(h))
                .sort((a, b) => getLogTimestampMs(b) - getLogTimestampMs(a));
              const lastOnLoc = (activeWidget.lastLocation && activeWidget.lastLocation.event === "ON" && !isStaleTestGeolog(activeWidget.lastLocation))
                ? activeWidget.lastLocation
                : (hist.find(h => h.event === "ON") || null);
              const lastOffLoc = (activeWidget.lastLocation && activeWidget.lastLocation.event === "OFF" && !isStaleTestGeolog(activeWidget.lastLocation))
                ? activeWidget.lastLocation
                : (hist.find(h => h.event === "OFF") || null);
              const esp32Loc = (deviceDetectedLocation && !isStaleTestGeolog(deviceDetectedLocation)) ? deviceDetectedLocation : null;
              return (
                <VStack align="stretch" spacing={2.5} p={3} bg={cardSubtleBg} borderRadius="xl" border="1px solid" borderColor="gray.200">
                  {/* Header */}
                  <HStack justify="space-between">
                    <HStack spacing={1.5}>
                      <FaMapMarkerAlt color="#0284c7" size={12} />
                      <Text fontSize="xs" fontWeight="extrabold" color="cyan.800" letterSpacing="wider">
                        LOCATION & SWITCH GEOLOG
                      </Text>
                    </HStack>
                    <HStack spacing={1}>
                      {lastOnLoc && <Badge colorScheme="green" fontSize="7px" px={1.5}>ON ✓</Badge>}
                      {lastOffLoc && <Badge colorScheme="red" fontSize="7px" px={1.5}>OFF ✓</Badge>}
                    </HStack>
                  </HStack>

                  {/* Section 1: ESP32-S3 Device (Host) Location */}
                  <Box p={2.5} bg="blue.50" borderRadius="lg" border="1.5px solid" borderColor="blue.200">
                    <HStack spacing={1.5} mb={1}>
                      <Box w="7px" h="7px" borderRadius="full" bg="blue.500" />
                      <Text fontSize="10px" fontWeight="extrabold" color="blue.700" textTransform="uppercase" letterSpacing="wider">
                        ESP32-S3 Device (Host)
                      </Text>
                      <Badge colorScheme="blue" fontSize="7px" px={1.5}>{esp32Loc?.source?.includes("Calibrated") ? "Calibrated" : "IP Geo"}</Badge>
                    </HStack>
                    {esp32Loc && esp32Loc.lat ? (
                      <VStack align="stretch" spacing={0.5}>
                        <Text fontSize="11px" fontWeight="bold" color="blue.800">
                          📍 {esp32Loc.city}{esp32Loc.country ? `, ${esp32Loc.country}` : ""}
                        </Text>
                        <Text fontSize="9px" color="blue.600" noOfLines={2}>{esp32Loc.address}</Text>
                        <HStack justify="space-between" mt={0.5}>
                          <Text fontSize="9px" color="blue.500" fontFamily="monospace" fontWeight="bold">
                            {esp32Loc.lat}° N, {esp32Loc.lng}° E
                          </Text>
                          <Text fontSize="8px" color="blue.400">{esp32Loc.source?.replace("IP Geolocation ", "") || "Network"}</Text>
                        </HStack>
                        <Button
                          size="xs" colorScheme="blue" variant="ghost"
                          leftIcon={<FaExternalLinkAlt size={8} />} fontSize="9px"
                          as="a" href={`https://www.google.com/maps?q=${esp32Loc.lat},${esp32Loc.lng}`}
                          target="_blank" rel="noreferrer"
                        >
                          View ESP32 Location on Maps
                        </Button>
                      </VStack>
                    ) : (
                      <HStack spacing={1.5}>
                        <Spinner size="xs" color="blue.400" />
                        <Text fontSize="10px" color="blue.500" fontStyle="italic">Detecting host location via IP...</Text>
                      </HStack>
                    )}
                    <VStack align="stretch" spacing={1.5} mt={2}>
                      <HStack spacing={1.5}>
                        <Input
                          size="xs"
                          placeholder="Search locality (e.g. Guindy, T. Nagar)..."
                          value={locationSearchInput}
                          onChange={(e) => setLocationSearchInput(e.target.value)}
                          onKeyDown={async (e) => {
                            if (e.key === "Enter" && locationSearchInput.trim()) {
                              await handleCalibrateLocation(locationSearchInput.trim());
                              toast({ title: `📍 Calibrated to ${locationSearchInput.trim()}`, status: "success", duration: 2000 });
                            }
                          }}
                          bg="white"
                          fontSize="10px"
                        />
                        <Button
                          size="xs"
                          colorScheme="cyan"
                          fontSize="9px"
                          isLoading={isDetectingLocation}
                          onClick={async () => {
                            if (locationSearchInput.trim()) {
                              await handleCalibrateLocation(locationSearchInput.trim());
                              toast({ title: `📍 Calibrated to ${locationSearchInput.trim()}`, status: "success", duration: 2000 });
                            } else {
                              await handleCalibrateLocation("Chennai, Tamil Nadu");
                              toast({ title: "📍 Calibrated to Chennai", status: "success", duration: 2000 });
                            }
                          }}
                        >
                          Calibrate
                        </Button>
                      </HStack>
                      <HStack spacing={1.5}>
                        <Button
                          size="xs"
                          colorScheme="teal"
                          variant="outline"
                          fontSize="9px"
                          leftIcon={<FaCrosshairs size={8} />}
                          isLoading={isDetectingLocation}
                          onClick={async () => {
                            toast({ title: "Detecting device location...", status: "info", duration: 1200 });
                            await fetchCurrentDeviceLocation();
                          }}
                        >
                          Detect GPS
                        </Button>
                        <Button
                          size="xs" colorScheme="blue" variant="ghost"
                          leftIcon={<FaCrosshairs size={8} />} fontSize="9px"
                          onClick={async () => {
                            toast({ title: "Fetching location...", status: "info", duration: 1200 });
                            await fetchCurrentDeviceLocation();
                            toast({ title: "📍 Host location refreshed", status: "success", duration: 2000 });
                          }}
                        >
                          Refresh
                        </Button>
                      </HStack>
                    </VStack>
                  </Box>

                  {/* Section 2: Switch ON Location */}
                  <Box p={2.5} bg="green.50" borderRadius="lg" border="1.5px solid" borderColor={lastOnLoc ? "green.300" : "green.100"}>
                    <HStack spacing={1.5} mb={1}>
                      <Box w="7px" h="7px" borderRadius="full" bg={lastOnLoc ? "green.500" : "gray.300"} />
                      <Text fontSize="10px" fontWeight="extrabold" color={lastOnLoc ? "green.700" : "gray.400"} textTransform="uppercase" letterSpacing="wider">
                        Switch ON Location
                      </Text>
                      {lastOnLoc && <Badge colorScheme="green" fontSize="7px" px={1.5}>Latest</Badge>}
                    </HStack>
                    {lastOnLoc ? (
                      <VStack align="stretch" spacing={0.5}>
                        <Text fontSize="11px" fontWeight="bold" color="green.800">🟢 {lastOnLoc.city}</Text>
                        <Text fontSize="9px" color="green.600" noOfLines={2}>{lastOnLoc.address}</Text>
                        <HStack justify="space-between" mt={0.5}>
                          <Text fontSize="9px" color="green.500" fontFamily="monospace" fontWeight="bold">
                            {lastOnLoc.lat ? `${lastOnLoc.lat}° N, ${lastOnLoc.lng}° E` : "Coords pending"}
                          </Text>
                          <Text fontSize="8px" color="green.400">{formatGeologTime(lastOnLoc)}</Text>
                        </HStack>
                        {lastOnLoc.lat && (
                          <Button
                            size="xs" colorScheme="green" variant="ghost"
                            leftIcon={<FaExternalLinkAlt size={8} />} fontSize="9px"
                            as="a" href={`https://www.google.com/maps?q=${lastOnLoc.lat},${lastOnLoc.lng}`}
                            target="_blank" rel="noreferrer"
                          >
                            View ON Location on Maps
                          </Button>
                        )}
                      </VStack>
                    ) : (
                      <Text fontSize="10px" color="gray.400" fontStyle="italic">
                        No switch ON event recorded yet. Toggle a switch on mobile to capture location.
                      </Text>
                    )}
                  </Box>

                  {/* Section 3: Switch OFF Location */}
                  <Box p={2.5} bg="red.50" borderRadius="lg" border="1.5px solid" borderColor={lastOffLoc ? "red.300" : "red.100"}>
                    <HStack spacing={1.5} mb={1}>
                      <Box w="7px" h="7px" borderRadius="full" bg={lastOffLoc ? "red.500" : "gray.300"} />
                      <Text fontSize="10px" fontWeight="extrabold" color={lastOffLoc ? "red.700" : "gray.400"} textTransform="uppercase" letterSpacing="wider">
                        Switch OFF Location
                      </Text>
                      {lastOffLoc && <Badge colorScheme="red" fontSize="7px" px={1.5}>Latest</Badge>}
                    </HStack>
                    {lastOffLoc ? (
                      <VStack align="stretch" spacing={0.5}>
                        <Text fontSize="11px" fontWeight="bold" color="red.800">🔴 {lastOffLoc.city}</Text>
                        <Text fontSize="9px" color="red.600" noOfLines={2}>{lastOffLoc.address}</Text>
                        <HStack justify="space-between" mt={0.5}>
                          <Text fontSize="9px" color="red.500" fontFamily="monospace" fontWeight="bold">
                            {lastOffLoc.lat ? `${lastOffLoc.lat}° N, ${lastOffLoc.lng}° E` : "Coords pending"}
                          </Text>
                          <Text fontSize="8px" color="red.400">{formatGeologTime(lastOffLoc)}</Text>
                        </HStack>
                        {lastOffLoc.lat && (
                          <Button
                            size="xs" colorScheme="red" variant="ghost"
                            leftIcon={<FaExternalLinkAlt size={8} />} fontSize="9px"
                            as="a" href={`https://www.google.com/maps?q=${lastOffLoc.lat},${lastOffLoc.lng}`}
                            target="_blank" rel="noreferrer"
                          >
                            View OFF Location on Maps
                          </Button>
                        )}
                      </VStack>
                    ) : (
                      <Text fontSize="10px" color="gray.400" fontStyle="italic">
                        No switch OFF event recorded yet. Toggle a switch on mobile to capture location.
                      </Text>
                    )}
                  </Box>

                  {/* Full History */}
                  <Box>
                    <HStack justify="space-between" align="center" mb={1}>
                      <Text fontSize="10px" fontWeight="bold" color="cyan.800">
                        Switch Geologs ({hist.length}):
                      </Text>
                      {hist.length > 0 && (
                        <Button
                          size="xs"
                          colorScheme="red"
                          variant="ghost"
                          fontSize="8px"
                          h="18px"
                          px={1.5}
                          onClick={() => handleClearGeologs(activeWidget.id)}
                        >
                          Clear All
                        </Button>
                      )}
                    </HStack>
                    {hist.length === 0 ? (
                      <Text fontSize="10px" color="gray.400" fontStyle="italic">
                        No geologs recorded yet.
                      </Text>
                    ) : (
                      <VStack align="stretch" spacing={1} maxH="130px" overflowY="auto">
                        {hist.map((item, idx) => {
                          const isON = item.event === "ON";
                          const isOFF = item.event === "OFF";
                          const badgeColor = isON ? "green" : (isOFF ? "red" : "blue");
                          const bgBox = isON ? "green.50" : (isOFF ? "red.50" : "blue.50");
                          const borderBox = isON ? "green.100" : (isOFF ? "red.100" : "blue.100");
                          return (
                            <HStack key={item.id || idx} p={1.5}
                              bg={bgBox}
                              borderRadius="md" justify="space-between" fontSize="10px"
                              border="1px solid" borderColor={borderBox}
                            >
                              <HStack spacing={1.5}>
                                <Badge colorScheme={badgeColor} fontSize="8px">{item.event}</Badge>
                                <Text fontWeight="semibold" color="gray.800" noOfLines={1} maxW="100px">{item.city || "Device Location"}</Text>
                                {item.lat && <Text color="gray.400" fontSize="8px" fontFamily="monospace">{Number(item.lat).toFixed(3)}°N{item.lng ? `, ${Number(item.lng).toFixed(3)}°E` : ""}</Text>}
                              </HStack>
                              <Text color="gray.400" fontSize="9px">{formatGeologTime(item)}</Text>
                            </HStack>
                          );
                        })}
                      </VStack>
                    )}
                  </Box>
                </VStack>
              );
            })()}

            {/* GOOGLE FORM QUESTIONS & RESPONSES in Inspector */}
            {activeWidget.type === "textfield" && (() => {
              const safeQuestions = (activeWidget.questions || []).filter((q) => !isHardcodedTextFieldQuestion(q));
              const safeResponses = (activeWidget.responses || []).filter((r) => !isHardcodedTextFieldResponse(r));
              return (
                <VStack align="stretch" spacing={2.5} p={3} bg={bgPurpleCard} borderRadius="xl" border="1px solid" borderColor="purple.200">
                  <HStack justify="space-between">
                    <HStack spacing={1.5}>
                      <FaWpforms color="#8b5cf6" size={13} />
                      <Text fontSize="xs" fontWeight="extrabold" color="purple.800" letterSpacing="wider">
                        QUESTION & RESPONSE BUILDER
                      </Text>
                    </HStack>
                    <Badge colorScheme="purple" fontSize="9px">
                      {safeResponses.length} Answers
                    </Badge>
                  </HStack>

                  {/* Add Question Input */}
                  <Box p={2} bg="white" borderRadius="lg" border="1px solid" borderColor="purple.100">
                    <Text fontSize="10px" fontWeight="bold" color="purple.700" mb={1}>
                      Add Question (Syncs to Mobile UI):
                    </Text>
                    <HStack spacing={1.5}>
                      <Input
                        size="xs"
                        placeholder="Enter a question for mobile users..."
                        value={newQuestionInputs[activeWidget.id] || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewQuestionInputs((prev) => ({ ...prev, [activeWidget.id]: val }));
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddQuestionToForm(activeWidget.id, newQuestionInputs[activeWidget.id]);
                          }
                        }}
                      />
                      <Button
                        size="xs"
                        colorScheme="purple"
                        leftIcon={<FaPaperPlane size={8} />}
                        onClick={() => handleAddQuestionToForm(activeWidget.id, newQuestionInputs[activeWidget.id])}
                      >
                        Submit
                      </Button>
                    </HStack>
                  </Box>

                  {/* Questions List */}
                  <Box>
                    <Text fontSize="10px" fontWeight="bold" color="purple.800" mb={1}>
                      Form Questions ({safeQuestions.length}):
                    </Text>
                    {safeQuestions.length > 0 ? (
                      <VStack align="stretch" spacing={1} maxH="120px" overflowY="auto">
                        {safeQuestions.map((q, idx) => (
                          <HStack key={q.id || idx} p={1.5} bg="white" borderRadius="md" justify="space-between" fontSize="10px" border="1px solid" borderColor="purple.100">
                            <HStack spacing={1.5} flex="1" minW="0">
                              <Badge colorScheme="purple" fontSize="8px">Q{idx + 1}</Badge>
                              <Text fontWeight="semibold" color="gray.800" noOfLines={1}>{q.text}</Text>
                            </HStack>
                            <IconButton
                              icon={<FaTrashAlt size={8} />}
                              size="xs"
                              h="18px"
                              w="18px"
                              minW="18px"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleDeleteQuestionFromForm(activeWidget.id, q.id)}
                            />
                          </HStack>
                        ))}
                      </VStack>
                    ) : (
                      <Text fontSize="9px" color="gray.400" fontStyle="italic">
                        No questions added yet. Type a question above and click Submit.
                      </Text>
                    )}
                  </Box>

                  {/* Received Responses List */}
                  <Box>
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="10px" fontWeight="bold" color="purple.800">
                        Submitted Answers ({safeResponses.length}):
                      </Text>
                      {safeResponses.length > 0 && (
                        <Button
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          fontSize="9px"
                          h="16px"
                          px={1}
                          onClick={() => handleClearFormResponses(activeWidget.id)}
                        >
                          Clear All
                        </Button>
                      )}
                    </HStack>
                    {safeResponses.length > 0 ? (
                      <VStack align="stretch" spacing={1} maxH="130px" overflowY="auto">
                        {safeResponses.map((resp, idx) => (
                          <Box key={resp.id || idx} p={2} bg="white" borderRadius="md" border="1px solid" borderColor="gray.150" fontSize="10px">
                            <HStack justify="space-between" mb={0.5}>
                              <Text fontWeight="bold" color="purple.700" noOfLines={1}>{resp.questionText}</Text>
                              <Text color="gray.400" fontSize="8px">{resp.timestamp}</Text>
                            </HStack>
                            <Text color="gray.800" fontWeight="medium">💬 {resp.answer}</Text>
                            <Text color="gray.400" fontSize="8px" mt={0.5}>Source: {resp.source || "Mobile UI"}</Text>
                          </Box>
                        ))}
                      </VStack>
                    ) : (
                      <Text fontSize="9px" color="gray.400" fontStyle="italic">
                        No answers submitted yet. Responses from mobile will appear here.
                      </Text>
                    )}
                  </Box>
                </VStack>
              );
            })()}

            {/* Remove Component Button */}
            <Button
              size="sm"
              colorScheme="red"
              variant="ghost"
              leftIcon={<FaTrashAlt size={12} />}
              onClick={() => handleDeleteWidget(activeWidget.id)}
              mt={1}
            >
              Remove Component
            </Button>
          </VStack>
        </VStack>
      )}

      {inspectorTab === "properties" && !activeWidget && (
        <Box textAlign="center" py={12} px={4}>
          <Box p={3} bg={iconSubtleBg} color="gray.400" borderRadius="full" w="fit-content" mx="auto" mb={3}>
            <FaCogs size={20} />
          </Box>
          <Text fontSize="xs" fontWeight="bold" color="gray.600">
            No Component Selected
          </Text>
          <Text fontSize="xs" color="gray.400" mt={1}>
            {widgets.length === 0
              ? "Add a component from the left palette to configure its properties."
              : "Select an item on the smartphone screen to edit properties."}
          </Text>
        </Box>
      )}
    </GridItem>
  );
}
