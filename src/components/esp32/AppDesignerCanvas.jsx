import React, { useState } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Badge,
  IconButton,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Progress,
  Tooltip,
  Spinner,
  useToast
} from "@chakra-ui/react";
import {
  FaTimes,
  FaWifi,
  FaPlus,
  FaGripVertical,
  FaTrashAlt,
  FaSync,
  FaSlidersH,
  FaTemperatureHigh,
  FaBell,
  FaArrowUp,
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaTable,
  FaEdit,
  FaTag,
  FaMapMarkerAlt,
  FaExternalLinkAlt,
  FaPaperPlane,
  FaWpforms,
  FaClipboardList,
  FaChartLine,
  FaGamepad,
  FaImage,
  FaClone,
  FaLightbulb,
  FaCogs,
  FaCrosshairs,
  FaBroadcastTower
} from "react-icons/fa";
import {
  isHardcodedTextFieldQuestion,
  isHardcodedTextFieldResponse,
  isStaleTestGeolog,
  getLogTimestampMs,
  formatGeologTime
} from "./geologHelpers.js";

// Visual Drop Indicator Line for Canvas & Hierarchy
const DropIndicator = ({ active }) => {
  if (!active) return null;
  return (
    <Box
      py={1}
      my={0.5}
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
    >
      <Box
        h="3px"
        bg="#2563eb"
        borderRadius="full"
        w="100%"
        shadow="0 0 8px rgba(37, 99, 235, 0.6)"
      />
      <Box
        position="absolute"
        left="0"
        w="7px"
        h="7px"
        bg="#2563eb"
        borderRadius="full"
      />
      <Box
        position="absolute"
        right="0"
        w="7px"
        h="7px"
        bg="#2563eb"
        borderRadius="full"
      />
    </Box>
  );
};

// Luminance detector for contrast adaptation across light/dark/gradient cards
const checkIsDarkColor = (color) => {
  if (!color || color === "white" || color === "#ffffff" || color === "#fff" || color === "transparent") {
    return false;
  }
  if (typeof color !== "string") return false;
  const trimmed = color.trim().toLowerCase();
  if (trimmed === "white" || trimmed === "#fff" || trimmed === "#ffffff") return false;
  if (trimmed.startsWith("linear-gradient")) {
    if (trimmed.includes("#fff") || trimmed.includes("#f8") || trimmed.includes("#e2") || trimmed.includes("#f1") || trimmed.includes("#ecfdf5")) {
      return false;
    }
    return true;
  }
  if (trimmed.startsWith("#")) {
    const hex = trimmed.replace("#", "");
    let r = 0, g = 0, b = 0;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length >= 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 155;
  }
  return false;
};

/**
 * AppDesignerCanvas
 * Center canvas of App Builder Studio in Designer mode (View 1).
 * Features:
 * - Interactive smartphone frame with responsive drag-and-drop widget layout.
 * - Dynamic island status bar, live widgets with inline controls, selection highlights,
 *   drag handles, reordering drop indicators, and nested configurations.
 */
export default function AppDesignerCanvas({
  projectName,
  widgets,
  visibleWidgets,
  selectedWidgetId,
  setSelectedWidgetId,
  draggedWidgetId,
  setDraggedWidgetId,
  dropInsertIndex,
  setDropInsertIndex,
  isDraggingActive,
  isDraggingOverPhone,
  setIsDraggingOverPhone,
  handlePhoneDrop,
  handleWidgetDragOver,
  handleUpdateWidget,
  handleTestHardwareSignal,
  handleOpenAddCrudRecord,
  handleOpenEditCrudRecord,
  handleDeleteCrudRecord,
  deviceDetectedLocation,
  handleCalibrateLocation,
  isDetectingLocation = false,
  fetchCurrentDeviceLocation,
  handleClearGeologs,
  newQuestionInputs,
  setNewQuestionInputs,
  handleAddQuestionToForm,
  handleDeleteQuestionFromForm,
  handleClearFormResponses,
  handleMoveWidget,
  handleDuplicateWidget,
  handleDeleteWidget
}) {
  const toast = useToast();
  const setActiveWidgetId = setSelectedWidgetId;
  const previewTab = "designer";
  const [starterAlertVisible, setStarterAlertVisible] = useState(false);

  return (
    <>
                {/* Starter App Generated Notification Banner */}
                {starterAlertVisible && (
                  <Box
                    w="100%"
                    maxW="480px"
                    mb={4}
                    p={3.5}
                    bg="white"
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor="blue.100"
                    shadow="md"
                    display="flex"
                    alignItems="start"
                    justifyContent="space-between"
                  >
                    <HStack align="start" spacing={3}>
                      <Text fontSize="lg">✨</Text>
                      <VStack align="start" spacing={0.5}>
                        <Text fontSize="xs" fontWeight="bold" color="blue.600">
                          Starter App Generated
                        </Text>
                        <Text fontSize="11px" color="gray.600" lineHeight="tall">
                          We've created a basic control app from your hardware. Customize it by adding more components, configuring pins, or switching to Blocks mode for logic.
                        </Text>
                      </VStack>
                    </HStack>
                    <IconButton
                      icon={<FaTimes size={11} />}
                      size="xs"
                      variant="ghost"
                      onClick={() => setStarterAlertVisible(false)}
                      aria-label="Dismiss alert"
                    />
                  </Box>
                )}

                {/* Smartphone Phone Frame */}
                <Box
                  w="340px"
                  minH="640px"
                  bg="white"
                  borderRadius="42px"
                  border={isDraggingOverPhone ? "10px solid #2563eb" : "10px solid #1e293b"}
                  position="relative"
                  shadow={isDraggingOverPhone ? "0 0 35px rgba(37, 99, 235, 0.45)" : "2xl"}
                  display="flex"
                  flexDirection="column"
                  overflow="hidden"
                  mb={8}
                  transition="border 0.2s ease, box-shadow 0.2s ease"
                >
                  {/* Dynamic Island / Speaker notch */}
                  <Box
                    w="100px"
                    h="18px"
                    bg="#1e293b"
                    position="absolute"
                    top="0"
                    left="50%"
                    transform="translateX(-50%)"
                    borderBottomRadius="xl"
                    zIndex={20}
                  />

                  {/* Status Bar */}
                  <HStack justify="space-between" px={6} pt={3} pb={1} fontSize="10px" color="gray.700" fontWeight="bold" zIndex={10}>
                    <Text>9:41</Text>
                    <HStack spacing={1.5}>
                      <FaWifi size={10} />
                      <Text fontSize="9px">5G</Text>
                      <Box w="16px" h="8px" border="1px solid currentColor" borderRadius="2px" p="1px">
                        <Box w="80%" h="100%" bg="currentColor" borderRadius="1px" />
                      </Box>
                    </HStack>
                  </HStack>

                  {/* Mobile App Screen Content */}
                  <Box
                    flex="1"
                    p={3.5}
                    bg="#f8fafc"
                    overflowY="auto"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = draggedWidgetId ? "move" : "copy";
                      setIsDraggingOverPhone(true);
                      if (e.target === e.currentTarget) {
                        setDropInsertIndex(widgets.length);
                      }
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      setIsDraggingOverPhone(true);
                    }}
                    onDragLeave={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget)) {
                        setIsDraggingOverPhone(false);
                        setDropInsertIndex(null);
                      }
                    }}
                    onDrop={(e) => handlePhoneDrop(e, dropInsertIndex)}
                  >
                    {/* App Title Header */}
                    <HStack justify="space-between" mb={3} mt={1}>
                      <HStack spacing={2}>
                        <Text fontSize="sm">🌱</Text>
                        <Text fontWeight="extrabold" fontSize="md" color="gray.900">
                          {projectName}
                        </Text>
                      </HStack>
                      <Badge colorScheme="green" fontSize="9px" borderRadius="full" px={2}>
                        ● Live
                      </Badge>
                    </HStack>

                    {/* Render Interactive Phone Widgets */}
                    <VStack spacing={2.5} align="stretch" minH="240px">
                      {visibleWidgets.length === 0 ? (
                        <Flex
                          direction="column"
                          align="center"
                          justify="center"
                          h="260px"
                          border="2px dashed"
                          borderColor={isDraggingOverPhone ? "blue.400" : "gray.300"}
                          bg={isDraggingOverPhone ? "blue.50" : "transparent"}
                          borderRadius="2xl"
                          p={6}
                          textAlign="center"
                          my={4}
                          transition="all 0.2s ease"
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "copy";
                            setIsDraggingOverPhone(true);
                            setDropInsertIndex(0);
                          }}
                          onDrop={(e) => handlePhoneDrop(e, 0)}
                        >
                          <Box
                            p={3}
                            bg={isDraggingOverPhone ? "blue.100" : "blue.50"}
                            color="blue.500"
                            borderRadius="full"
                            mb={2.5}
                            transform={isDraggingOverPhone ? "scale(1.15)" : "scale(1)"}
                            transition="all 0.2s"
                          >
                            <FaPlus size={18} />
                          </Box>
                          <Text fontSize="xs" fontWeight="bold" color={isDraggingOverPhone ? "blue.600" : "gray.700"}>
                            {isDraggingOverPhone ? "Release to Drop Component Here" : "Screen is Empty"}
                          </Text>
                          <Text fontSize="11px" color="gray.400" mt={1} maxW="210px">
                            {isDraggingOverPhone
                              ? "The component will be added to your mobile app screen."
                              : "Drag components from the left palette or click + Add to start building."}
                          </Text>
                        </Flex>
                      ) : (
                        <>
                          {isDraggingActive && dropInsertIndex === 0 && (
                            <DropIndicator active />
                          )}
                          {visibleWidgets.map((w) => {
                            const isSelected = w.id === selectedWidgetId;
                            const realIndex = widgets.findIndex((item) => item.id === w.id);
                            const isBeingDragged = draggedWidgetId === w.id;
                            const isDarkBg = checkIsDarkColor(w.backgroundColor);
                            const cardBg = w.backgroundColor || "white";
                            const isGradientBg = typeof cardBg === "string" && cardBg.startsWith("linear");
                            const primaryTextColor = isDarkBg ? "white" : "gray.900";
                            const secondaryTextColor = isDarkBg ? "gray.300" : "gray.400";
                            const titleFontSize = w.fontSize ? `${w.fontSize}px` : "xs";
                            const themeColor = w.color || "#2563eb";
                            return (
                              <React.Fragment key={w.id}>
                                <Box
                                  p={3}
                                  bg={isGradientBg ? undefined : cardBg}
                                  background={isGradientBg ? cardBg : undefined}
                                  color={primaryTextColor}
                                  borderRadius={`${w.cornerRadius ?? 16}px`}
                                  border="2px solid"
                                  borderColor={isSelected ? "#2563eb" : isBeingDragged ? "#3b82f6" : "transparent"}
                                  borderStyle={isBeingDragged ? "dashed" : "solid"}
                                  opacity={isBeingDragged ? 0.35 : 1}
                                  shadow="sm"
                                  _hover={{ borderColor: isSelected ? "#2563eb" : (isDarkBg ? "rgba(255,255,255,0.25)" : "gray.200") }}
                                  cursor="pointer"
                                  transition="all 0.15s"
                                  position="relative"
                                  overflow="hidden"
                                  draggable
                                  onDragStart={(e) => {
                                    if (
                                      e.target.tagName === "INPUT" ||
                                      e.target.tagName === "BUTTON" ||
                                      e.target.closest("button") ||
                                      e.target.closest(".chakra-switch") ||
                                      e.target.closest(".chakra-slider")
                                    ) {
                                      e.preventDefault();
                                      return;
                                    }
                                    e.dataTransfer.setData(
                                      "application/json",
                                      JSON.stringify({
                                        source: "widget-reorder",
                                        widgetId: w.id,
                                        fromIndex: realIndex
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
                                  onDragOver={(e) => handleWidgetDragOver(e, realIndex)}
                                  onDrop={(e) => handlePhoneDrop(e, dropInsertIndex)}
                                  onClick={() => setSelectedWidgetId(w.id)}
                                >
                                  {/* Selection Action Header Bar on Selected Widget */}
                                  {isSelected && (
                                    <Flex
                                      align="center"
                                      justify="space-between"
                                      bg="blue.600"
                                      color="white"
                                      px={2.5}
                                      py={1}
                                      mx={-3}
                                      mt={-3}
                                      mb={2.5}
                                      borderTopRadius={`${w.cornerRadius ?? 16}px`}
                                      fontSize="10px"
                                      fontWeight="bold"
                                      shadow="xs"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <HStack spacing={1.5}>
                                        <Tooltip label="Drag to reorder" fontSize="10px">
                                          <Box
                                            px={1}
                                            py={0.5}
                                            cursor="grab"
                                            _active={{ cursor: "grabbing" }}
                                            color="whiteAlpha.800"
                                            _hover={{ color: "white" }}
                                            display="flex"
                                            alignItems="center"
                                            draggable
                                            onDragStart={(e) => {
                                              e.stopPropagation();
                                              e.dataTransfer.setData(
                                                "application/json",
                                                JSON.stringify({
                                                  source: "widget-reorder",
                                                  widgetId: w.id,
                                                  fromIndex: realIndex
                                                })
                                              );
                                              e.dataTransfer.effectAllowed = "move";
                                              setDraggedWidgetId(w.id);
                                            }}
                                          >
                                            <FaGripVertical size={11} />
                                          </Box>
                                        </Tooltip>
                                        <Text fontSize="10px" fontWeight="bold" color="white" noOfLines={1} maxW="120px">
                                          {w.title}
                                        </Text>
                                      </HStack>

                                      <HStack spacing={0.5}>
                                        <Tooltip label="Move Up" fontSize="10px">
                                          <IconButton
                                            icon={<FaArrowUp size={9} />}
                                            size="xs"
                                            h="18px"
                                            minW="18px"
                                            variant="ghost"
                                            color="white"
                                            _hover={{ bg: "blue.700" }}
                                            isDisabled={realIndex <= 0}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (handleMoveWidget) handleMoveWidget(w.id, "up");
                                            }}
                                            aria-label="Move Up"
                                          />
                                        </Tooltip>
                                        <Tooltip label="Move Down" fontSize="10px">
                                          <IconButton
                                            icon={<FaArrowDown size={9} />}
                                            size="xs"
                                            h="18px"
                                            minW="18px"
                                            variant="ghost"
                                            color="white"
                                            _hover={{ bg: "blue.700" }}
                                            isDisabled={realIndex >= widgets.length - 1}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (handleMoveWidget) handleMoveWidget(w.id, "down");
                                            }}
                                            aria-label="Move Down"
                                          />
                                        </Tooltip>
                                        <Tooltip label="Duplicate" fontSize="10px">
                                          <IconButton
                                            icon={<FaClone size={9} />}
                                            size="xs"
                                            h="18px"
                                            minW="18px"
                                            variant="ghost"
                                            color="white"
                                            _hover={{ bg: "blue.700" }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (handleDuplicateWidget) handleDuplicateWidget(w.id);
                                            }}
                                            aria-label="Duplicate"
                                          />
                                        </Tooltip>
                                        <Tooltip label="Delete" fontSize="10px">
                                          <IconButton
                                            icon={<FaTrashAlt size={9} />}
                                            size="xs"
                                            h="18px"
                                            minW="18px"
                                            variant="ghost"
                                            color="red.200"
                                            _hover={{ bg: "red.600", color: "white" }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (handleDeleteWidget) handleDeleteWidget(w.id);
                                            }}
                                            aria-label="Delete"
                                          />
                                        </Tooltip>
                                      </HStack>
                                    </Flex>
                                  )}

                            {/* 1. LED Switch Widget */}
                            {w.type === "switch" && (() => {
                              const locWidget = (widgets || []).find((item) => item.type === "location");
                              const allGeologs = (Array.isArray(locWidget?.locationHistory) ? [...locWidget.locationHistory] : [])
                                .filter((h) => !isStaleTestGeolog(h))
                                .sort((a, b) => getLogTimestampMs(b) - getLogTimestampMs(a));
                              const switchOnLoc = w.lastOnLocation || (locWidget?.lastLocation?.event === "ON" ? locWidget.lastLocation : null) || (allGeologs.find((h) => h.event === "ON") || null);
                              const switchOffLoc = w.lastOffLocation || (locWidget?.lastLocation?.event === "OFF" ? locWidget.lastLocation : null) || (allGeologs.find((h) => h.event === "OFF") || null);

                              return (
                                <VStack align="stretch" spacing={2}>
                                  <HStack justify="space-between">
                                    <HStack spacing={2.5}>
                                      <Box p={2} bg={w.state ? (w.color ? `${w.color}25` : "yellow.100") : (isDarkBg ? "whiteAlpha.200" : "gray.100")} color={w.state ? (w.color || "yellow.600") : (isDarkBg ? "gray.300" : "gray.400")} borderRadius="lg">
                                        <FaLightbulb size={16} />
                                      </Box>
                                      <VStack align="start" spacing={0}>
                                        <Text fontWeight="bold" fontSize={titleFontSize} color={primaryTextColor}>
                                          {w.title}
                                        </Text>
                                        <Text fontSize="10px" color={secondaryTextColor}>
                                          {w.boundTargetName || w.boundTarget}
                                        </Text>
                                      </VStack>
                                    </HStack>
                                    <Switch
                                      colorScheme={w.color ? undefined : "green"}
                                      sx={w.color ? { "& .chakra-switch__track[data-checked]": { bg: w.color } } : {}}
                                      isChecked={w.state}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handleUpdateWidget("state", e.target.checked, w.id);
                                      }}
                                    />
                                  </HStack>
                                  <HStack spacing={1} color="blue.500" fontSize="9px">
                                    <FaMapMarkerAlt size={9} />
                                    <Text fontWeight="semibold">Location required for ON/OFF logging</Text>
                                  </HStack>

                                  {/* Live ON and OFF Timing & Location on Switch Widget */}
                                  <VStack align="stretch" spacing={1.5} pt={1} borderTop="1px solid" borderColor={isDarkBg ? "whiteAlpha.200" : "gray.200"}>
                                    {/* ON Timing & Location */}
                                    <Box
                                      p={2}
                                      bg={isDarkBg ? "rgba(34, 197, 94, 0.12)" : "green.50"}
                                      borderRadius="md"
                                      border="1px solid"
                                      borderColor={switchOnLoc ? (isDarkBg ? "green.600" : "green.300") : (isDarkBg ? "whiteAlpha.100" : "gray.200")}
                                    >
                                      <HStack justify="space-between" align="center" mb={0.5}>
                                        <HStack spacing={1}>
                                          <Box w="6px" h="6px" borderRadius="full" bg={switchOnLoc ? "green.500" : "gray.400"} />
                                          <Text fontSize="9px" fontWeight="extrabold" color={switchOnLoc ? (isDarkBg ? "green.300" : "green.700") : "gray.400"} textTransform="uppercase">
                                            Switch ON Timing & Location
                                          </Text>
                                        </HStack>
                                        <Text fontSize="9px" fontWeight="bold" color={switchOnLoc ? (isDarkBg ? "green.300" : "green.600") : "gray.400"} fontFamily="monospace">
                                          {switchOnLoc ? formatGeologTime(switchOnLoc) : "--:--:--"}
                                        </Text>
                                      </HStack>
                                      {switchOnLoc ? (
                                        <HStack justify="space-between" align="center">
                                          <Text fontSize="10px" fontWeight="bold" color={isDarkBg ? "white" : "green.800"} noOfLines={1}>
                                            📍 {switchOnLoc.city || "Logged Location"}
                                          </Text>
                                          <Text fontSize="8px" fontWeight="bold" color={isDarkBg ? "green.300" : "green.600"}>
                                            Acc: {switchOnLoc.accuracy || 12}m
                                          </Text>
                                        </HStack>
                                      ) : (
                                        <Text fontSize="9px" color="gray.400" fontStyle="italic">
                                          No switch ON event recorded yet
                                        </Text>
                                      )}
                                      {switchOnLoc?.lat && (
                                        <HStack justify="space-between" align="center" mt={0.5}>
                                          <Text fontSize="8px" color="gray.400" fontFamily="monospace">
                                            {switchOnLoc.lat}° N, {switchOnLoc.lng}° E
                                          </Text>
                                          <Text
                                            as="a"
                                            href={`https://www.google.com/maps?q=${switchOnLoc.lat},${switchOnLoc.lng}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            fontSize="8px"
                                            fontWeight="bold"
                                            color="green.500"
                                            _hover={{ textDecoration: "underline" }}
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            View Map ↗
                                          </Text>
                                        </HStack>
                                      )}
                                    </Box>

                                    {/* OFF Timing & Location */}
                                    <Box
                                      p={2}
                                      bg={isDarkBg ? "rgba(239, 68, 68, 0.12)" : "red.50"}
                                      borderRadius="md"
                                      border="1px solid"
                                      borderColor={switchOffLoc ? (isDarkBg ? "red.600" : "red.300") : (isDarkBg ? "whiteAlpha.100" : "gray.200")}
                                    >
                                      <HStack justify="space-between" align="center" mb={0.5}>
                                        <HStack spacing={1}>
                                          <Box w="6px" h="6px" borderRadius="full" bg={switchOffLoc ? "red.500" : "gray.400"} />
                                          <Text fontSize="9px" fontWeight="extrabold" color={switchOffLoc ? (isDarkBg ? "red.300" : "red.700") : "gray.400"} textTransform="uppercase">
                                            Switch OFF Timing & Location
                                          </Text>
                                        </HStack>
                                        <Text fontSize="9px" fontWeight="bold" color={switchOffLoc ? (isDarkBg ? "red.300" : "red.600") : "gray.400"} fontFamily="monospace">
                                          {switchOffLoc ? formatGeologTime(switchOffLoc) : "--:--:--"}
                                        </Text>
                                      </HStack>
                                      {switchOffLoc ? (
                                        <HStack justify="space-between" align="center">
                                          <Text fontSize="10px" fontWeight="bold" color={isDarkBg ? "white" : "red.800"} noOfLines={1}>
                                            📍 {switchOffLoc.city || "Logged Location"}
                                          </Text>
                                          <Text fontSize="8px" fontWeight="bold" color={isDarkBg ? "red.300" : "red.600"}>
                                            Acc: {switchOffLoc.accuracy || 10}m
                                          </Text>
                                        </HStack>
                                      ) : (
                                        <Text fontSize="9px" color="gray.400" fontStyle="italic">
                                          No switch OFF event recorded yet
                                        </Text>
                                      )}
                                      {switchOffLoc?.lat && (
                                        <HStack justify="space-between" align="center" mt={0.5}>
                                          <Text fontSize="8px" color="gray.400" fontFamily="monospace">
                                            {switchOffLoc.lat}° N, {switchOffLoc.lng}° E
                                          </Text>
                                          <Text
                                            as="a"
                                            href={`https://www.google.com/maps?q=${switchOffLoc.lat},${switchOffLoc.lng}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            fontSize="8px"
                                            fontWeight="bold"
                                            color="red.500"
                                            _hover={{ textDecoration: "underline" }}
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            View Map ↗
                                          </Text>
                                        </HStack>
                                      )}
                                    </Box>
                                  </VStack>
                                </VStack>
                              );
                            })()}

                            {/* 2. Servo Angle Slider Widget */}
                            {w.type === "slider" && (
                              <VStack align="stretch" spacing={1.5}>
                                <HStack justify="space-between">
                                  <HStack spacing={2.5}>
                                    <Box p={2} bg={w.color ? `${w.color}20` : "purple.50"} color={w.color || "purple.600"} borderRadius="lg">
                                      <FaCogs size={16} />
                                    </Box>
                                    <VStack align="start" spacing={0}>
                                      <Text fontWeight="bold" fontSize={titleFontSize} color={primaryTextColor}>
                                        {w.title}
                                      </Text>
                                      <Text fontSize="10px" color={secondaryTextColor}>
                                        {w.boundTargetName || w.boundTarget}
                                      </Text>
                                    </VStack>
                                  </HStack>
                                  <Text fontWeight="extrabold" fontSize={titleFontSize} color={w.color || "purple.600"}>
                                    {w.value}{w.unit || "°"}
                                  </Text>
                                </HStack>
                                <Slider
                                  value={w.value}
                                  min={w.min || 0}
                                  max={w.max || 180}
                                  onChange={(val) => handleUpdateWidget("value", val, w.id)}
                                >
                                  <SliderTrack bg="gray.100">
                                    <SliderFilledTrack bg={w.color || "purple.500"} />
                                  </SliderTrack>
                                  <SliderThumb boxSize={3.5} />
                                </Slider>
                              </VStack>
                            )}

                            {/* 3. Temperature Gauge Widget */}
                            {w.type === "gauge" && (
                              <VStack align="stretch" spacing={2}>
                                <HStack justify="space-between">
                                  <HStack spacing={2.5}>
                                    <Box p={2} bg={w.color ? `${w.color}20` : "red.50"} color={w.color || "red.500"} borderRadius="lg">
                                      <FaTemperatureHigh size={16} />
                                    </Box>
                                    <VStack align="start" spacing={0}>
                                      <Text fontWeight="bold" fontSize={titleFontSize} color={primaryTextColor}>
                                        {w.title}
                                      </Text>
                                      <Text fontSize="10px" color={secondaryTextColor}>
                                        {w.boundTargetName || w.boundTarget}
                                      </Text>
                                    </VStack>
                                  </HStack>
                                  <HStack spacing={1} color="green.600" fontSize="10px" fontWeight="bold">
                                    <Box w="6px" h="6px" bg="green.500" borderRadius="full" />
                                    <Text>Live</Text>
                                  </HStack>
                                </HStack>
                                <HStack spacing={3} justify="center" py={1}>
                                  <Box
                                    w="52px"
                                    h="26px"
                                    borderTopRadius="52px"
                                    border={`4px solid ${w.color || "#ef4444"}`}
                                    borderBottom="none"
                                  />
                                  <VStack align="start" spacing={0}>
                                    <Text fontSize="xl" fontWeight="black" color={primaryTextColor}>
                                      {w.value}{w.unit || "°C"}
                                    </Text>
                                    <Text fontSize="9px" color={secondaryTextColor}>
                                      Live telemetry
                                    </Text>
                                  </VStack>
                                </HStack>
                              </VStack>
                            )}

                            {/* 4. Chart / Graph Widget */}
                            {w.type === "chart" && (
                              <VStack align="stretch" spacing={2}>
                                <HStack justify="space-between">
                                  <HStack spacing={2}>
                                    <FaChartLine color="#2563eb" />
                                    <Text fontWeight="bold" fontSize="xs">{w.title}</Text>
                                  </HStack>
                                  <Badge colorScheme="blue" fontSize="9px">Live Stream</Badge>
                                </HStack>
                                <Box h="45px" w="100%" bg="blue.50" borderRadius="lg" p={1} display="flex" alignItems="flex-end">
                                  <svg width="100%" height="100%" viewBox="0 0 200 40" preserveAspectRatio="none">
                                    <path d="M0,35 Q30,10 60,25 T120,15 T180,30 T200,8" fill="none" stroke="#2563eb" strokeWidth="2.5" />
                                  </svg>
                                </Box>
                              </VStack>
                            )}

                            {/* 5. Sound Alarm Button Widget */}
                            {w.type === "button" && (
                              <VStack align="stretch" spacing={1}>
                                <Text fontSize="9px" color="gray.400" px={1}>
                                  {w.boundTargetName || w.boundTarget}
                                </Text>
                                <Button
                                  w="100%"
                                  size="md"
                                  bg={w.color || "#ea580c"}
                                  _hover={{ opacity: 0.9 }}
                                  color="white"
                                  borderRadius="xl"
                                  leftIcon={<FaBell size={14} />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveWidgetId(w.id);
                                    if (previewTab === "preview") {
                                      handleTestHardwareSignal(w);
                                    }
                                  }}
                                  fontWeight="bold"
                                  fontSize={titleFontSize}
                                >
                                  {w.title}
                                </Button>
                              </VStack>
                            )}

                            {/* 5b. Directional Top Button Widget */}
                            {w.type === "top_button" && (
                              <VStack align="stretch" spacing={1}>
                                <HStack justify="space-between">
                                  <Text fontSize="9px" color="gray.400" px={1}>
                                    {w.boundTargetName || w.boundTarget || "GPIO 13 (Motor Forward)"}
                                  </Text>
                                  <Badge fontSize="9px" colorScheme="blue">▲ Top / Forward</Badge>
                                </HStack>
                                <Button
                                  w="100%"
                                  size="md"
                                  bg={w.color || "#2563eb"}
                                  _hover={{ opacity: 0.9 }}
                                  color="white"
                                  borderRadius="xl"
                                  leftIcon={<FaArrowUp size={13} />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveWidgetId(w.id);
                                    if (previewTab === "preview") {
                                      handleTestHardwareSignal(w);
                                    }
                                  }}
                                  fontWeight="bold"
                                  fontSize="xs"
                                  shadow="sm"
                                >
                                  {w.title}
                                </Button>
                              </VStack>
                            )}

                            {/* 5c. Directional Bottom Button Widget */}
                            {w.type === "bottom_button" && (
                              <VStack align="stretch" spacing={1}>
                                <HStack justify="space-between">
                                  <Text fontSize="9px" color="gray.400" px={1}>
                                    {w.boundTargetName || w.boundTarget || "GPIO 14 (Motor Reverse)"}
                                  </Text>
                                  <Badge fontSize="9px" colorScheme="cyan">▼ Bottom / Reverse</Badge>
                                </HStack>
                                <Button
                                  w="100%"
                                  size="md"
                                  bg={w.color || "#0284c7"}
                                  _hover={{ opacity: 0.9 }}
                                  color="white"
                                  borderRadius="xl"
                                  leftIcon={<FaArrowDown size={13} />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveWidgetId(w.id);
                                    if (previewTab === "preview") {
                                      handleTestHardwareSignal(w);
                                    }
                                  }}
                                  fontWeight="bold"
                                  fontSize="xs"
                                  shadow="sm"
                                >
                                  {w.title}
                                </Button>
                              </VStack>
                            )}

                            {/* 5d. Directional Left Button Widget */}
                            {w.type === "left_button" && (
                              <VStack align="stretch" spacing={1}>
                                <HStack justify="space-between">
                                  <Text fontSize="9px" color="gray.400" px={1}>
                                    {w.boundTargetName || w.boundTarget || "GPIO 12 (Steer Left)"}
                                  </Text>
                                  <Badge fontSize="9px" colorScheme="purple">◀ Left Turn</Badge>
                                </HStack>
                                <Button
                                  w="100%"
                                  size="md"
                                  bg={w.color || "#7c3aed"}
                                  _hover={{ opacity: 0.9 }}
                                  color="white"
                                  borderRadius="xl"
                                  leftIcon={<FaArrowLeft size={13} />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveWidgetId(w.id);
                                    if (previewTab === "preview") {
                                      handleTestHardwareSignal(w);
                                    }
                                  }}
                                  fontWeight="bold"
                                  fontSize="xs"
                                  shadow="sm"
                                >
                                  {w.title}
                                </Button>
                              </VStack>
                            )}

                            {/* 5e. Directional Right Button Widget */}
                            {w.type === "right_button" && (
                              <VStack align="stretch" spacing={1}>
                                <HStack justify="space-between">
                                  <Text fontSize="9px" color="gray.400" px={1}>
                                    {w.boundTargetName || w.boundTarget || "GPIO 15 (Steer Right)"}
                                  </Text>
                                  <Badge fontSize="9px" colorScheme="purple">▶ Right Turn</Badge>
                                </HStack>
                                <Button
                                  w="100%"
                                  size="md"
                                  bg={w.color || "#9333ea"}
                                  _hover={{ opacity: 0.9 }}
                                  color="white"
                                  borderRadius="xl"
                                  leftIcon={<FaArrowRight size={13} />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveWidgetId(w.id);
                                    if (previewTab === "preview") {
                                      handleTestHardwareSignal(w);
                                    }
                                  }}
                                  fontWeight="bold"
                                  fontSize="xs"
                                  shadow="sm"
                                >
                                  {w.title}
                                </Button>
                              </VStack>
                            )}

                            {/* 5f. 4-Way Directional Pad Widget */}
                            {w.type === "dpad" && (
                              <VStack align="center" spacing={2} p={1}>
                                <HStack justify="space-between" w="100%">
                                  <Text fontWeight="bold" fontSize="xs">{w.title}</Text>
                                  <Badge colorScheme="blue" fontSize="9px">4-Way Controller</Badge>
                                </HStack>
                                <Box p={2.5} bg="gray.100" borderRadius="2xl" border="1px solid" borderColor="gray.300">
                                  <VStack spacing={1}>
                                    <Button
                                      size="xs"
                                      colorScheme="blue"
                                      w="44px"
                                      h="32px"
                                      borderRadius="lg"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveWidgetId(w.id);
                                        if (previewTab === "preview") {
                                          handleTestHardwareSignal({ ...w, boundTarget: "GPIO 13", title: "Top Button (Forward)" });
                                        }
                                      }}
                                    >
                                      <FaArrowUp size={11} />
                                    </Button>
                                    <HStack spacing={1}>
                                      <Button
                                        size="xs"
                                        colorScheme="purple"
                                        w="44px"
                                        h="32px"
                                        borderRadius="lg"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveWidgetId(w.id);
                                          if (previewTab === "preview") {
                                            handleTestHardwareSignal({ ...w, boundTarget: "GPIO 12", title: "Left Button (Steer Left)" });
                                          }
                                        }}
                                      >
                                        <FaArrowLeft size={11} />
                                      </Button>
                                      <Box w="36px" h="32px" bg="gray.300" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                                        <Text fontSize="10px" fontWeight="black" color="gray.600">●</Text>
                                      </Box>
                                      <Button
                                        size="xs"
                                        colorScheme="purple"
                                        w="44px"
                                        h="32px"
                                        borderRadius="lg"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveWidgetId(w.id);
                                          if (previewTab === "preview") {
                                            handleTestHardwareSignal({ ...w, boundTarget: "GPIO 15", title: "Right Button (Steer Right)" });
                                          }
                                        }}
                                      >
                                        <FaArrowRight size={11} />
                                      </Button>
                                    </HStack>
                                    <Button
                                      size="xs"
                                      colorScheme="blue"
                                      w="44px"
                                      h="32px"
                                      borderRadius="lg"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveWidgetId(w.id);
                                        if (previewTab === "preview") {
                                          handleTestHardwareSignal({ ...w, boundTarget: "GPIO 14", title: "Bottom Button (Reverse)" });
                                        }
                                      }}
                                    >
                                      <FaArrowDown size={11} />
                                    </Button>
                                  </VStack>
                                </Box>
                              </VStack>
                            )}

                            {/* 6. Color Picker Widget */}
                            {w.type === "colorpicker" && (
                              <VStack align="stretch" spacing={2}>
                                <HStack justify="space-between">
                                  <Text fontWeight="bold" fontSize="xs">{w.title}</Text>
                                  <Box w="14px" h="14px" borderRadius="full" bg={w.selectedColor || "#2563eb"} />
                                </HStack>
                                <HStack spacing={2} justify="center">
                                  {["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"].map((c) => (
                                    <Box
                                      key={c}
                                      w="22px"
                                      h="22px"
                                      borderRadius="full"
                                      bg={c}
                                      cursor="pointer"
                                      border={w.selectedColor === c ? "2px solid black" : "none"}
                                      onClick={(e) => { e.stopPropagation(); handleUpdateWidget("selectedColor", c, w.id); }}
                                    />
                                  ))}
                                </HStack>
                              </VStack>
                            )}

                            {/* 7. Joystick Widget */}
                            {w.type === "joystick" && (
                              <VStack align="center" spacing={1.5}>
                                <Text fontWeight="bold" fontSize="xs">{w.title}</Text>
                                <Box w="70px" h="70px" borderRadius="full" bg="gray.100" border="2px dashed" borderColor="gray.300" display="flex" alignItems="center" justifyContent="center">
                                  <Box w="30px" h="30px" borderRadius="full" bg="blue.500" shadow="md" />
                                </Box>
                              </VStack>
                            )}

                            {/* Location Button / Device Location Widget */}
                            {w.type === "location" && (() => {
                              const hist = (Array.isArray(w.locationHistory) ? [...w.locationHistory] : [])
                                .filter(h => !isStaleTestGeolog(h))
                                .sort((a, b) => getLogTimestampMs(b) - getLogTimestampMs(a));
                              const lastOnLoc = (w.lastLocation && w.lastLocation.event === "ON" && !isStaleTestGeolog(w.lastLocation))
                                ? w.lastLocation
                                : (hist.find(h => h.event === "ON") || null);
                              const lastOffLoc = (w.lastLocation && w.lastLocation.event === "OFF" && !isStaleTestGeolog(w.lastLocation))
                                ? w.lastLocation
                                : (hist.find(h => h.event === "OFF") || null);
                              const esp32Loc = (deviceDetectedLocation && !isStaleTestGeolog(deviceDetectedLocation)) ? deviceDetectedLocation : null;
                              return (
                                <VStack align="stretch" spacing={2.5}>
                                  {/* Header */}
                                  <HStack justify="space-between" align="center">
                                    <HStack spacing={2}>
                                      <Box p={1.5} bg="cyan.50" color="cyan.600" borderRadius="lg">
                                        <FaMapMarkerAlt size={14} />
                                      </Box>
                                      <VStack align="start" spacing={0}>
                                        <Text fontWeight="bold" fontSize="xs" color="gray.900">
                                          {w.title || "Device Location"}
                                        </Text>
                                        <Text fontSize="10px" color="gray.400">GPS Switch Geologger</Text>
                                      </VStack>
                                    </HStack>
                                    <HStack spacing={1}>
                                      {lastOnLoc && <Badge colorScheme="green" fontSize="8px" px={1.5} borderRadius="full">ON ✓</Badge>}
                                      {lastOffLoc && <Badge colorScheme="red" fontSize="8px" px={1.5} borderRadius="full">OFF ✓</Badge>}
                                    </HStack>
                                  </HStack>

                                  {/* Section 1: ESP32-S3 Device Location (Host Machine) */}
                                  <Box
                                    p={2.5}
                                    bg="blue.50"
                                    borderRadius="xl"
                                    border="1.5px solid"
                                    borderColor="blue.200"
                                  >
                                    <HStack spacing={1.5} mb={1.5}>
                                      <Box w="8px" h="8px" borderRadius="full" bg="blue.500" />
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
                                        <Text fontSize="9px" color="blue.600" noOfLines={1}>{esp32Loc.address}</Text>
                                        <HStack justify="space-between">
                                          <Text fontSize="9px" color="blue.500" fontFamily="monospace" fontWeight="semibold">
                                            {esp32Loc.lat}° N, {esp32Loc.lng}° E
                                          </Text>
                                          <Text fontSize="8px" color="blue.400">{esp32Loc.source?.replace("IP Geolocation ", "") || "Network"}</Text>
                                        </HStack>
                                      </VStack>
                                    ) : (
                                      <HStack spacing={1.5}>
                                        <Spinner size="xs" color="blue.400" />
                                        <Text fontSize="10px" color="blue.500" fontStyle="italic">Detecting host location...</Text>
                                      </HStack>
                                    )}
                                    <HStack spacing={1.5} mt={2}>
                                      <Button
                                        size="xs"
                                        colorScheme="teal"
                                        variant="solid"
                                        leftIcon={<FaCrosshairs size={9} />}
                                        fontSize="9px"
                                        isLoading={isDetectingLocation}
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          toast({ title: "Detecting device location...", status: "info", duration: 1500 });
                                          await fetchCurrentDeviceLocation();
                                        }}
                                      >
                                        Detect GPS
                                      </Button>
                                      <Button
                                        size="xs"
                                        colorScheme="blue"
                                        variant="ghost"
                                        leftIcon={<FaMapMarkerAlt size={9} />}
                                        fontSize="9px"
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          const query = prompt("Enter locality to calibrate host device (e.g. Guindy, T. Nagar):", "");
                                          if (query && query.trim()) {
                                            toast({ title: `Calibrating to ${query.trim()}...`, status: "info", duration: 1500 });
                                            await handleCalibrateLocation(query.trim() + ", Chennai");
                                          }
                                        }}
                                      >
                                        Calibrate
                                      </Button>
                                      <Button
                                        size="xs"
                                        colorScheme="gray"
                                        variant="ghost"
                                        leftIcon={<FaCrosshairs size={9} />}
                                        fontSize="9px"
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          toast({ title: "Fetching location...", status: "info", duration: 1500 });
                                          await fetchCurrentDeviceLocation();
                                          toast({ title: "📍 Host location refreshed", status: "success", duration: 2000 });
                                        }}
                                      >
                                        Refresh
                                      </Button>
                                    </HStack>
                                  </Box>

                                  {/* Section 2: Switch ON Location */}
                                  <Box
                                    p={2.5}
                                    bg="green.50"
                                    borderRadius="xl"
                                    border="1.5px solid"
                                    borderColor={lastOnLoc ? "green.300" : "green.100"}
                                  >
                                    <HStack spacing={1.5} mb={1.5} justify="space-between">
                                      <HStack spacing={1.5}>
                                        <Box w="8px" h="8px" borderRadius="full" bg={lastOnLoc ? "green.500" : "gray.300"} />
                                        <Text fontSize="10px" fontWeight="extrabold" color={lastOnLoc ? "green.700" : "gray.400"} textTransform="uppercase" letterSpacing="wider">
                                          Switch ON Timing & Location
                                        </Text>
                                        {lastOnLoc && <Badge colorScheme="green" fontSize="7px" px={1.5}>Latest</Badge>}
                                      </HStack>
                                      {lastOnLoc && (
                                        <Badge colorScheme="green" fontSize="9px" fontFamily="monospace" px={1.5}>
                                          ⏱️ {formatGeologTime(lastOnLoc)}
                                        </Badge>
                                      )}
                                    </HStack>
                                    {lastOnLoc ? (
                                      <VStack align="stretch" spacing={0.5}>
                                        <HStack justify="space-between" align="center">
                                          <Text fontSize="11px" fontWeight="bold" color="green.800">
                                            🟢 {lastOnLoc.city}
                                          </Text>
                                          <Badge colorScheme="green" variant="subtle" fontSize="9px" fontFamily="monospace">
                                            {formatGeologTime(lastOnLoc)}
                                          </Badge>
                                        </HStack>
                                        <Text fontSize="9px" color="green.600" noOfLines={1}>{lastOnLoc.address}</Text>
                                        <HStack justify="space-between">
                                          <Text fontSize="9px" color="green.500" fontFamily="monospace" fontWeight="semibold">
                                            {lastOnLoc.lat ? `${lastOnLoc.lat}° N, ${lastOnLoc.lng}° E` : "Coordinates pending"}
                                          </Text>
                                          <Text fontSize="9px" color="green.700" fontWeight="bold">
                                            Accuracy: {lastOnLoc.accuracy || 12} m
                                          </Text>
                                        </HStack>
                                        <Button
                                          size="xs"
                                          colorScheme="green"
                                          variant="ghost"
                                          leftIcon={<FaExternalLinkAlt size={8} />}
                                          fontSize="9px"
                                          as="a"
                                          href={`https://www.google.com/maps?q=${lastOnLoc.lat},${lastOnLoc.lng}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          isDisabled={!lastOnLoc.lat}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          View ON Location on Maps
                                        </Button>
                                      </VStack>
                                    ) : (
                                      <Text fontSize="10px" color="gray.400" fontStyle="italic">
                                        No switch ON event recorded yet. Toggle the switch to capture location.
                                      </Text>
                                    )}
                                  </Box>

                                  {/* Section 3: Switch OFF Location */}
                                  <Box
                                    p={2.5}
                                    bg="red.50"
                                    borderRadius="xl"
                                    border="1.5px solid"
                                    borderColor={lastOffLoc ? "red.300" : "red.100"}
                                  >
                                    <HStack spacing={1.5} mb={1.5} justify="space-between">
                                      <HStack spacing={1.5}>
                                        <Box w="8px" h="8px" borderRadius="full" bg={lastOffLoc ? "red.500" : "gray.300"} />
                                        <Text fontSize="10px" fontWeight="extrabold" color={lastOffLoc ? "red.700" : "gray.400"} textTransform="uppercase" letterSpacing="wider">
                                          Switch OFF Timing & Location
                                        </Text>
                                        {lastOffLoc && <Badge colorScheme="red" fontSize="7px" px={1.5}>Latest</Badge>}
                                      </HStack>
                                      {lastOffLoc && (
                                        <Badge colorScheme="red" fontSize="9px" fontFamily="monospace" px={1.5}>
                                          ⏱️ {formatGeologTime(lastOffLoc)}
                                        </Badge>
                                      )}
                                    </HStack>
                                    {lastOffLoc ? (
                                      <VStack align="stretch" spacing={0.5}>
                                        <HStack justify="space-between" align="center">
                                          <Text fontSize="11px" fontWeight="bold" color="red.800">
                                            🔴 {lastOffLoc.city}
                                          </Text>
                                          <Badge colorScheme="red" variant="subtle" fontSize="9px" fontFamily="monospace">
                                            {formatGeologTime(lastOffLoc)}
                                          </Badge>
                                        </HStack>
                                        <Text fontSize="9px" color="red.600" noOfLines={1}>{lastOffLoc.address}</Text>
                                        <HStack justify="space-between">
                                          <Text fontSize="9px" color="red.500" fontFamily="monospace" fontWeight="semibold">
                                            {lastOffLoc.lat ? `${lastOffLoc.lat}° N, ${lastOffLoc.lng}° E` : "Coordinates pending"}
                                          </Text>
                                          <Text fontSize="9px" color="red.700" fontWeight="bold">
                                            Accuracy: {lastOffLoc.accuracy || 10} m
                                          </Text>
                                        </HStack>
                                        <Button
                                          size="xs"
                                          colorScheme="red"
                                          variant="ghost"
                                          leftIcon={<FaExternalLinkAlt size={8} />}
                                          fontSize="9px"
                                          as="a"
                                          href={`https://www.google.com/maps?q=${lastOffLoc.lat},${lastOffLoc.lng}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          isDisabled={!lastOffLoc.lat}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          View OFF Location on Maps
                                        </Button>
                                      </VStack>
                                    ) : (
                                      <Text fontSize="10px" color="gray.400" fontStyle="italic">
                                        No switch OFF event recorded yet. Toggle the switch to capture location.
                                      </Text>
                                    )}
                                  </Box>

                                  {/* Full History Log */}
                                  {hist.length > 0 && (
                                    <Box pt={0.5}>
                                      <HStack justify="space-between" align="center" mb={1.5}>
                                        <Text fontSize="9px" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                                          Switch Geolog History ({hist.length})
                                        </Text>
                                        <Button
                                          size="xs"
                                          colorScheme="red"
                                          variant="ghost"
                                          fontSize="8px"
                                          h="18px"
                                          px={1.5}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleClearGeologs(w.id);
                                          }}
                                        >
                                          Clear
                                        </Button>
                                      </HStack>
                                      <VStack align="stretch" spacing={1} maxH="120px" overflowY="auto">
                                        {hist.slice(0, 10).map((item, idx) => {
                                          const isON = item.event === "ON";
                                          const isOFF = item.event === "OFF";
                                          const badgeBg = isON ? "green.50" : (isOFF ? "red.50" : "blue.50");
                                          const badgeBorder = isON ? "green.100" : (isOFF ? "red.100" : "blue.100");
                                          const badgeColor = isON ? "green" : (isOFF ? "red" : "blue");
                                          return (
                                            <HStack
                                              key={item.id || idx}
                                              as="a"
                                              href={`https://www.google.com/maps?q=${item.lat},${item.lng}`}
                                              target="_blank"
                                              rel="noreferrer"
                                              cursor="pointer"
                                              onClick={(e) => e.stopPropagation()}
                                              justify="space-between"
                                              p={1.5}
                                              bg={badgeBg}
                                              borderRadius="md"
                                              fontSize="9px"
                                              border="1px solid"
                                              borderColor={badgeBorder}
                                              _hover={{ shadow: "xs" }}
                                            >
                                              <HStack spacing={1.5}>
                                                <Badge colorScheme={badgeColor} fontSize="7px" px={1}>{item.event || "LOG"}</Badge>
                                                <Text fontWeight="semibold" color="gray.700" noOfLines={1} maxW="90px">
                                                  {item.city || "Location"}
                                                </Text>
                                                {item.lat && (
                                                  <Text color="gray.400" fontFamily="monospace" fontSize="8px">
                                                    {Number(item.lat).toFixed(3)}°N{item.lng ? `, ${Number(item.lng).toFixed(3)}°E` : ""} • Acc: {item.accuracy || 12}m
                                                  </Text>
                                                )}
                                              </HStack>
                                              <Text color="gray.400" fontFamily="monospace">{formatGeologTime(item)}</Text>
                                            </HStack>
                                          );
                                        })}
                                      </VStack>
                                    </Box>
                                  )}
                                </VStack>
                              );
                            })()}


                            {/* 8. Text Field / Dynamic Google Form Widget */}
                            {w.type === "textfield" && (
                              <VStack align="stretch" spacing={2.5}>
                                {/* Header */}
                                <HStack justify="space-between" align="center">
                                  <HStack spacing={2}>
                                    <Box p={1.5} bg={w.color ? `${w.color}25` : "purple.50"} color={w.color || "purple.600"} borderRadius="lg">
                                      <FaWpforms size={14} />
                                    </Box>
                                    <VStack align="start" spacing={0}>
                                      <Text fontWeight="bold" fontSize={titleFontSize} color={primaryTextColor}>
                                        {w.title || "Google Form / Field"}
                                      </Text>
                                      <Text fontSize="10px" color={secondaryTextColor}>
                                        Dynamic Question & Response
                                      </Text>
                                    </VStack>
                                  </HStack>
                                  {(() => {
                                    const safeResponses = (w.responses || []).filter((r) => !isHardcodedTextFieldResponse(r));
                                    return (
                                      <Badge bg={w.color ? `${w.color}20` : "purple.50"} color={w.color || "purple.700"} fontSize="9px" px={2} py={0.5} borderRadius="full">
                                        {safeResponses.length} Responses
                                      </Badge>
                                    );
                                  })()}
                                </HStack>

                                {/* Enter Question Input Row */}
                                <Box p={2} bg={w.color ? `${w.color}15` : (isDarkBg ? "whiteAlpha.100" : "purple.50")} borderRadius="xl" border="1px solid" borderColor={w.color ? `${w.color}35` : "purple.100"}>
                                  <Text fontSize="10px" fontWeight="bold" color={w.color || "purple.700"} mb={1}>
                                    Enter Question (Renders on Mobile):
                                  </Text>
                                  <HStack spacing={1.5}>
                                    <Input
                                      size="xs"
                                      placeholder="Enter a question for mobile users..."
                                      borderRadius="lg"
                                      bg={isDarkBg ? "whiteAlpha.200" : "white"}
                                      color={primaryTextColor}
                                      _placeholder={{ color: secondaryTextColor }}
                                      value={newQuestionInputs[w.id] || ""}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setNewQuestionInputs((prev) => ({ ...prev, [w.id]: val }));
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleAddQuestionToForm(w.id, newQuestionInputs[w.id]);
                                        }
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <Button
                                      size="xs"
                                      bg={w.color || "purple.600"}
                                      color="white"
                                      _hover={{ opacity: 0.9 }}
                                      borderRadius="lg"
                                      px={3}
                                      leftIcon={<FaPaperPlane size={9} />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddQuestionToForm(w.id, newQuestionInputs[w.id]);
                                      }}
                                    >
                                      Submit
                                    </Button>
                                  </HStack>
                                </Box>

                                {/* Render Active Questions */}
                                {(() => {
                                  const safeQuestions = (w.questions || []).filter((q) => !isHardcodedTextFieldQuestion(q));
                                  return (
                                    <VStack align="stretch" spacing={1.5}>
                                      <Text fontSize="10px" fontWeight="bold" color="gray.500">
                                        Active Questions ({safeQuestions.length}):
                                      </Text>
                                      {safeQuestions.length > 0 ? (
                                        safeQuestions.map((q, qIdx) => (
                                          <HStack
                                            key={q.id || qIdx}
                                            p={1.5}
                                            bg={isDarkBg ? "whiteAlpha.100" : "white"}
                                            borderRadius="md"
                                            border="1px solid"
                                            borderColor={isDarkBg ? "whiteAlpha.200" : "gray.200"}
                                            justify="space-between"
                                          >
                                            <HStack spacing={1.5} flex="1" minW="0">
                                              <Badge colorScheme="purple" fontSize="8px">Q{qIdx + 1}</Badge>
                                              <Text fontSize="10px" fontWeight="semibold" color={isDarkBg ? "white" : "gray.800"} noOfLines={1}>
                                                {q.text}
                                              </Text>
                                            </HStack>
                                            <IconButton
                                              icon={<FaTrashAlt size={8} />}
                                              size="xs"
                                              h="18px"
                                              w="18px"
                                              minW="18px"
                                              variant="ghost"
                                              colorScheme="red"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteQuestionFromForm(w.id, q.id);
                                              }}
                                              title="Remove question"
                                            />
                                          </HStack>
                                        ))
                                      ) : (
                                        <Box p={2} bg="white" borderRadius="md" border="1px dashed" borderColor="gray.200" textAlign="center">
                                          <Text fontSize="9px" color="gray.400" fontStyle="italic">
                                            No questions added yet. Type a question above and click Submit.
                                          </Text>
                                        </Box>
                                      )}
                                    </VStack>
                                  );
                                })()}

                                {/* User Responses Received */}
                                {(() => {
                                  const safeResponses = (w.responses || []).filter((r) => !isHardcodedTextFieldResponse(r));
                                  return (
                                    <Box
                                      p={2}
                                      bg={isDarkBg ? "whiteAlpha.100" : "gray.50"}
                                      borderRadius="xl"
                                      border="1px solid"
                                      borderColor={isDarkBg ? "whiteAlpha.200" : "gray.200"}
                                    >
                                      <HStack justify="space-between" mb={1}>
                                        <HStack spacing={1.5}>
                                          <FaClipboardList size={10} color="#8b5cf6" />
                                          <Text fontSize="10px" fontWeight="bold" color={isDarkBg ? "gray.200" : "gray.700"}>
                                            Received Answers ({safeResponses.length})
                                          </Text>
                                        </HStack>
                                        {safeResponses.length > 0 && (
                                          <Button
                                            size="xs"
                                            variant="ghost"
                                            color="red.500"
                                            fontSize="9px"
                                            h="18px"
                                            px={1.5}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleClearFormResponses(w.id);
                                            }}
                                          >
                                            Clear
                                          </Button>
                                        )}
                                      </HStack>
                                      {safeResponses.length > 0 ? (
                                        <VStack align="stretch" spacing={1} maxH="95px" overflowY="auto">
                                          {safeResponses.map((resp, rIdx) => (
                                            <Box key={resp.id || rIdx} p={1.5} bg={isDarkBg ? "whiteAlpha.100" : "white"} borderRadius="md" border="1px solid" borderColor={isDarkBg ? "whiteAlpha.200" : "gray.150"}>
                                              <HStack justify="space-between" mb={0.5}>
                                                <Text fontSize="9px" fontWeight="bold" color="purple.700" noOfLines={1}>
                                                  {resp.questionText}
                                                </Text>
                                                <Text fontSize="8px" color="gray.400">{resp.timestamp}</Text>
                                              </HStack>
                                              <Text fontSize="10px" color={isDarkBg ? "white" : "gray.800"} fontWeight="medium">
                                                💬 {resp.answer}
                                              </Text>
                                            </Box>
                                          ))}
                                        </VStack>
                                      ) : (
                                        <Text fontSize="9px" color="gray.400" fontStyle="italic">
                                          No answers yet. Responses submitted from mobile will appear here.
                                        </Text>
                                      )}
                                    </Box>
                                  );
                                })()}
                              </VStack>
                            )}

                            {/* 9. Label Widget */}
                            {w.type === "label" && (
                              <HStack justify="space-between">
                                <Text fontWeight="bold" fontSize={w.fontSize ? `${w.fontSize}px` : "sm"} color={w.color || primaryTextColor}>{w.title}</Text>
                                <Text fontSize="xs" color={secondaryTextColor}>{w.boundTargetName || "Telemetry"}</Text>
                              </HStack>
                            )}

                            {/* 10. Device Link Status Card Widget */}
                            {w.type === "device_card" && (
                              <HStack justify="space-between" p={1}>
                                <HStack spacing={2}>
                                  <Box p={2} bg="blue.50" color="blue.600" borderRadius="lg">
                                    <FaBroadcastTower size={14} />
                                  </Box>
                                  <VStack align="start" spacing={0}>
                                    <Text fontWeight="bold" fontSize="xs" color="gray.900">
                                      {w.title}
                                    </Text>
                                    <Text fontSize="9px" color="green.600" fontWeight="semibold">
                                      ● Online & Connected
                                    </Text>
                                  </VStack>
                                </HStack>
                                <Badge colorScheme="blue" fontSize="9px" borderRadius="md">
                                  WiFi 100%
                                </Badge>
                              </HStack>
                            )}

                            {/* 11. Generic Card / Progress */}
                            {w.type === "progress" && (
                              <VStack align="stretch" spacing={1}>
                                <HStack justify="space-between">
                                  <Text fontWeight="bold" fontSize="xs">{w.title}</Text>
                                  <Text fontSize="xs" color="blue.600">75%</Text>
                                </HStack>
                                <Progress value={75} size="xs" colorScheme="blue" borderRadius="full" />
                              </VStack>
                            )}

                            {/* 12. CRUD Table Widget */}
                            {w.type === "crud_table" && (
                              <VStack align="stretch" spacing={2}>
                                <HStack justify="space-between" align="center">
                                  <HStack spacing={1.5}>
                                    <Box color={w.color || "blue.500"}>
                                      <FaTable size={12} />
                                    </Box>
                                    <Text fontWeight="bold" fontSize={titleFontSize} color={primaryTextColor}>
                                      {w.title}
                                    </Text>
                                  </HStack>
                                  <Button
                                    size="xs"
                                    colorScheme="blue"
                                    variant="outline"
                                    leftIcon={<FaPlus size={8} />}
                                    h="20px"
                                    px={2}
                                    fontSize="10px"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenAddCrudRecord(w.id);
                                    }}
                                  >
                                    Add
                                  </Button>
                                </HStack>

                                <VStack align="stretch" spacing={1.5}>
                                  {(w.records || []).length === 0 ? (
                                    <Box py={3} textAlign="center" bg="gray.50" borderRadius="md" border="1px dashed" borderColor="gray.200">
                                      <Text fontSize="10px" color="gray.400">No records yet. Click '+ Add'</Text>
                                    </Box>
                                  ) : (
                                    (w.records || []).map((rec) => (
                                      <HStack
                                        key={rec.id}
                                        p={2}
                                        bg="gray.50"
                                        borderRadius="md"
                                        border="1px solid"
                                        borderColor="gray.200"
                                        justify="space-between"
                                        fontSize="11px"
                                      >
                                        <VStack align="start" spacing={0} maxW="150px">
                                          <Text fontWeight="bold" fontSize="11px" color="gray.800" isTruncated>
                                            {rec.name}
                                          </Text>
                                          <HStack spacing={1}>
                                            <Badge
                                              colorScheme={rec.status === "Active" ? "green" : rec.status === "Alert" ? "red" : "blue"}
                                              fontSize="8px"
                                              px={1}
                                              borderRadius="sm"
                                            >
                                              {rec.value || rec.status}
                                            </Badge>
                                            <Text fontSize="9px" color="gray.400">{rec.timestamp}</Text>
                                          </HStack>
                                        </VStack>

                                        <HStack spacing={1}>
                                          <IconButton
                                            icon={<FaEdit size={9} />}
                                            size="xs"
                                            h="20px"
                                            minW="20px"
                                            variant="ghost"
                                            color="blue.500"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleOpenEditCrudRecord(w.id, rec);
                                            }}
                                            aria-label="Edit Record"
                                          />
                                          <IconButton
                                            icon={<FaTrashAlt size={9} />}
                                            size="xs"
                                            h="20px"
                                            minW="20px"
                                            variant="ghost"
                                            color="red.400"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteCrudRecord(w.id, rec.id);
                                            }}
                                            aria-label="Delete Record"
                                          />
                                        </HStack>
                                      </HStack>
                                    ))
                                  )}
                                </VStack>
                              </VStack>
                            )}

                            {/* 13. Image / Camera Stream Widget */}
                            {w.type === "image" && (
                              <VStack align="stretch" spacing={1.5}>
                                <HStack justify="space-between">
                                  <Text fontWeight="bold" fontSize="xs">{w.title}</Text>
                                  <Badge colorScheme="blue" fontSize="9px">Image</Badge>
                                </HStack>
                                <Box
                                  h="75px"
                                  w="100%"
                                  bg="gray.100"
                                  borderRadius="xl"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  border="1px dashed"
                                  borderColor="gray.300"
                                  color="gray.400"
                                >
                                  <VStack spacing={1}>
                                    <FaImage size={20} />
                                    <Text fontSize="10px">Preview / Camera Feed</Text>
                                  </VStack>
                                </Box>
                              </VStack>
                            )}

                            {/* 14. Card Container Widget */}
                            {w.type === "card" && (
                              <VStack align="stretch" spacing={1.5}>
                                <HStack justify="space-between">
                                  <Text fontWeight="bold" fontSize="xs">{w.title}</Text>
                                  <Badge colorScheme="purple" fontSize="9px">Container</Badge>
                                </HStack>
                                <Box p={2.5} bg="gray.50" borderRadius="lg" border="1px dashed" borderColor="gray.300">
                                  <Text fontSize="10px" color="gray.500">Flex Container Layout</Text>
                                </Box>
                              </VStack>
                            )}

                            {/* 15. Floating Action Button Widget */}
                            {w.type === "fab" && (
                              <HStack justify="space-between">
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="bold" fontSize="xs">{w.title}</Text>
                                  <Text fontSize="10px" color="gray.400">Quick Trigger</Text>
                                </VStack>
                                <Box
                                  w="36px"
                                  h="36px"
                                  bg={w.color || "blue.500"}
                                  color="white"
                                  borderRadius="full"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  shadow="md"
                                >
                                  <FaPlus size={13} />
                                </Box>
                              </HStack>
                            )}

                            {/* 16. Divider Widget */}
                            {w.type === "divider" && (
                              <Box py={2}>
                                <Box h="1px" bg="gray.200" w="100%" />
                              </Box>
                            )}

                            {/* Other components fallback */}
                            {!["location", "switch", "slider", "gauge", "chart", "button", "colorpicker", "joystick", "textfield", "label", "device_card", "progress", "crud_table", "image", "card", "fab", "divider", "top_button", "bottom_button", "left_button", "right_button", "dpad"].includes(w.type) && (
                              <HStack justify="space-between">
                                <Text fontWeight="bold" fontSize="xs">
                                  {w.title}
                                </Text>
                                <Badge fontSize="9px">{w.type}</Badge>
                              </HStack>
                            )}
                              </Box>
                              {/* Drop indicator after this widget */}
                              {isDraggingActive && dropInsertIndex === realIndex + 1 && (
                                <DropIndicator active />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </>
                    )}
                    </VStack>
                  </Box>
                </Box>
    </>
  );
}
