import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  Select,
  Input,
  Badge,
  Progress,
  IconButton,
  Tooltip,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Divider,
  Grid,
  GridItem,
  useToast,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon
} from "@chakra-ui/react";
import {
  FaWifi,
  FaBroadcastTower,
  FaCheck,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBolt,
  FaMobileAlt,
  FaUndo,
  FaRedo,
  FaSave,
  FaRocket,
  FaTrashAlt,
  FaSearch,
  FaCopy,
  FaDownload,
  FaPlay,
  FaExternalLinkAlt,
  FaSync,
  FaTimes,
  FaSlidersH,
  FaTag,
  FaFont,
  FaImage,
  FaIdCard,
  FaTasks,
  FaPlusCircle,
  FaMinus,
  FaThLarge,
  FaBoxes,
  FaLightbulb,
  FaCogs,
  FaTemperatureHigh,
  FaBell,
  FaCircle,
  FaChevronRight,
  FaChevronLeft,
  FaCube,
  FaFolder
} from "react-icons/fa";

export default function ESP32Flasher({
  code: codeProp,
  initialStep = "connection", // 'connection', 'devices', 'compatibility', 'flashing', 'success', 'app_builder'
  onClose,
  projectName: propProjectName = "Smart Garden Monitor"
}) {
  const toast = useToast();

  // Redux & Project info
  const editorTabs = useSelector((state) => state.editor?.tabs);
  const activeTabId = useSelector((state) => state.editor?.activeTabId);
  const activeTab = editorTabs?.find((t) => String(t.id) === String(activeTabId));
  const activeProjectName = useSelector((state) => state.workspace?.projectName);
  const projectName = propProjectName || activeProjectName || "Smart Garden Monitor";
  const editorCode = codeProp || activeTab?.content || (editorTabs?.[0]?.content) || "";

  // Active Wizard Step: 'connection' | 'devices' | 'compatibility' | 'flashing' | 'success' | 'app_builder'
  const [wizardStep, setWizardStep] = useState(initialStep);

  // Step 1: Connection Type ('wifi' | 'cellular')
  const [connectionType, setConnectionType] = useState("wifi");

  // Step 2: Selected Device & Device Discovery
  const [devices, setDevices] = useState([
    {
      id: "esp32-dev-1",
      name: "ESP32 Dev Board",
      ip: "192.168.1.42",
      firmware: "Firmware v1.2.1",
      port: "COM3",
      signal: 4,
      battery: 87,
      isUsb: true,
      selected: true
    },
    {
      id: "esp32-sensor-2",
      name: "ESP32 Room Sensor",
      ip: "192.168.1.55",
      firmware: "Firmware v1.1.0",
      port: "COM7",
      signal: 3,
      battery: 62,
      isUsb: false,
      selected: false
    },
    {
      id: "esp8266-garden-3",
      name: "ESP8266 Garden",
      ip: "192.168.1.71",
      firmware: "Firmware v0.9.8",
      port: "COM4",
      signal: 2,
      battery: 44,
      isUsb: false,
      selected: false
    }
  ]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("esp32-dev-1");
  const selectedDevice = devices.find((d) => d.id === selectedDeviceId) || devices[0];
  const [isScanning, setIsScanning] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Step 3: Compatibility Checklist Status
  const [compatibilityChecks] = useState([
    { id: "syntax", label: "Project syntax valid", status: "pass" },
    { id: "board", label: "Board compatibility", status: "pass" },
    { id: "pins", label: "All pins assigned", status: "pass" },
    { id: "libraries", label: "Libraries available", status: "pass" },
    { id: "memory", label: "Memory usage within limits", status: "warn", value: "78% used" },
    { id: "conflicts", label: "No conflicting pins", status: "pass" }
  ]);

  // Step 4: Flashing State & Progress
  const [flashProgress, setFlashProgress] = useState(0);
  const [flashTimeRemaining, setFlashTimeRemaining] = useState(30);
  const [flashStatusText, setFlashStatusText] = useState("Establishing connection...");
  const [flashTerminalLogs, setFlashTerminalLogs] = useState([]);
  const terminalEndRef = useRef(null);

  // Step 6: App Builder State
  const [appBuilderView, setAppBuilderView] = useState("designer"); // 'designer' | 'blocks' | 'preview'
  const [starterAlertVisible, setStarterAlertVisible] = useState(true);
  const [searchPalette, setSearchPalette] = useState("");
  const [inspectorTab, setInspectorTab] = useState("properties"); // 'tree' | 'properties'

  // Widgets in the Smartphone Mockup
  const [widgets, setWidgets] = useState([
    {
      id: "w-led",
      type: "switch",
      title: "LED Control",
      boundTarget: "LED",
      boundTargetName: "Bound → LED",
      action: "Turn ON / OFF",
      state: true,
      color: "blue",
      cornerRadius: 16,
      visible: true
    },
    {
      id: "w-servo",
      type: "slider",
      title: "Servo Angle",
      boundTarget: "Servo Motor",
      boundTargetName: "Bound → Servo Motor",
      action: "Set PWM Angle",
      value: 90,
      min: 0,
      max: 180,
      unit: "°",
      color: "purple",
      cornerRadius: 16,
      visible: true
    },
    {
      id: "w-temp",
      type: "gauge",
      title: "Temperature",
      boundTarget: "Temperature Sensor",
      boundTargetName: "Bound → Temperature Sensor",
      action: "Read Telemetry",
      value: 24.3,
      unit: "°C",
      live: true,
      color: "red",
      cornerRadius: 16,
      visible: true
    },
    {
      id: "w-alarm",
      type: "button",
      title: "Sound Alarm",
      boundTarget: "Buzzer",
      boundTargetName: "Bound → Buzzer",
      action: "Trigger Alarm",
      buttonColor: "orange",
      cornerRadius: 12,
      visible: true
    },
    {
      id: "w-device-status",
      type: "device_card",
      title: "ESP32 Dev Board",
      boundTarget: "Device",
      boundTargetName: "Hardware Link",
      online: true,
      cornerRadius: 16,
      visible: true
    }
  ]);
  const [selectedWidgetId, setSelectedWidgetId] = useState("w-led");
  const activeWidget = widgets.find((w) => w.id === selectedWidgetId) || widgets[0];

  // Step 7: Publish Modal
  const { isOpen: isPublishOpen, onOpen: onPublishOpen, onClose: onPublishClose } = useDisclosure();
  const [shareableLink] = useState("innotrat.app/dl/garden-monitor-v1");

  // Dynamic Theme Colors
  const bgCard = useColorModeValue("white", "gray.850");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerBg = "#2563eb"; // Royal Blue matching reference images

  // Auto-scroll terminal logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [flashTerminalLogs]);

  // Scan Real Ports via Electron IPC if available
  const handleRefreshDevices = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      setIsScanning(true);
    }
    try {
      if (window.electronAPI?.flash?.detectPorts) {
        const ports = await window.electronAPI.flash.detectPorts();
        if (ports && ports.length > 0) {
          const mapped = ports.map((p, idx) => ({
            id: `esp32-detected-${p.path || idx}`,
            name: p.friendlyName || `ESP32 Device (${p.path})`,
            ip: `192.168.1.${40 + idx}`,
            firmware: "Firmware v1.2.1",
            port: p.path,
            signal: 4,
            battery: 85 + (idx * 5) % 15,
            isUsb: p.isUsb !== false,
            selected: idx === 0
          }));
          setDevices(mapped);
          setSelectedDeviceId((prevId) => {
            const exists = mapped.some((d) => d.id === prevId);
            return exists ? prevId : mapped[0]?.id;
          });
        }
      }
    } catch (err) {
      console.warn("Device refresh warning:", err);
    } finally {
      if (!isSilent) {
        setIsScanning(false);
      }
    }
  }, []);

  // Auto-refresh devices polling when on 'devices' step
  useEffect(() => {
    if (wizardStep !== "devices") return;

    // Run initial scan on entering devices step
    handleRefreshDevices(false);

    if (!autoRefresh) return;

    const timer = setInterval(() => {
      handleRefreshDevices(true);
    }, 3000);

    return () => clearInterval(timer);
  }, [wizardStep, autoRefresh, handleRefreshDevices]);

  // Run Flash Pipeline
  const handleStartFlash = async () => {
    setWizardStep("flashing");
    setFlashProgress(5);
    setFlashTimeRemaining(30);
    setFlashStatusText("Establishing connection...");
    setFlashTerminalLogs(["[SYSTEM] Initializing ESP-IDF flashing toolchain pipeline..."]);

    const targetPort = selectedDevice?.port || "COM3";
    const targetChip = "esp32s3";

    try {
      if (window.electronAPI?.flash?.runPipeline) {
        // Real Electron IPC Flash Execution
        let cleanup = null;
        if (window.electronAPI.flash.onEvent) {
          cleanup = window.electronAPI.flash.onEvent((evt) => {
            if (evt.log) {
              setFlashTerminalLogs((prev) => [...prev, evt.log]);
            }
            if (evt.status === "setting_target" || evt.status === "target_stdout") {
              setFlashProgress((p) => Math.max(p, 20));
              setFlashStatusText("Setting chip target esp32s3...");
            } else if (evt.status === "building" || evt.status === "build_stdout") {
              setFlashProgress((p) => Math.min(Math.max(p, 45), 75));
              setFlashStatusText("Compiling firmware modules with ESP-IDF...");
            } else if (evt.status === "flashing" || evt.status === "flash_stdout") {
              setFlashProgress((p) => Math.min(Math.max(p, 80), 95));
              setFlashStatusText("Writing sectors to Flash memory at 460800 baud...");
            } else if (evt.status === "flash_success" || evt.status === "pipeline_completed") {
              setFlashProgress(100);
              setFlashStatusText("Firmware successfully written & verified!");
              setTimeout(() => {
                if (cleanup) cleanup();
                setWizardStep("success");
              }, 1200);
            }
          });
        }

        await window.electronAPI.flash.runPipeline({
          port: targetPort,
          target: targetChip,
          code: editorCode,
          apiUrl: "http://localhost:5010/check-code"
        });
      } else {
        // Emulated step sequence for preview / testing
        const milestones = [
          { p: 15, sec: 25, status: "Establishing connection...", log: "Connecting to ESP32 on port COM3 (baud 460800)..." },
          { p: 35, sec: 21, status: "Writing source files...", log: "Writing workspace/main/main.c and updating CMakeLists.txt..." },
          { p: 55, sec: 16, status: "Compiling firmware modules...", log: "[1/12] Building C object main.c.obj\n[8/12] Linking ESP32-S3 application binary..." },
          { p: 75, sec: 10, status: "Writing sectors to Flash memory...", log: "Writing at 0x00010000... (78%)\nWriting at 0x00020000... (100%)" },
          { p: 92, sec: 4, status: "Verifying sectors & hash...", log: "Hash of data verified. Leaving 3D secure boot mode..." },
          { p: 100, sec: 0, status: "Resetting board...", log: "Hard resetting via RTS pin...\nFirmware ready!" }
        ];

        milestones.forEach((m, idx) => {
          setTimeout(() => {
            setFlashProgress(m.p);
            setFlashTimeRemaining(m.sec);
            setFlashStatusText(m.status);
            setFlashTerminalLogs((prev) => [...prev, m.log]);

            if (m.p === 100) {
              setTimeout(() => {
                setWizardStep("success");
              }, 1000);
            }
          }, (idx + 1) * 1400);
        });
      }
    } catch (err) {
      setFlashTerminalLogs((prev) => [...prev, `[ERROR] Flashing failed: ${err.message}`]);
      toast({
        title: "Flashing Error",
        description: err.message,
        status: "error",
        duration: 4000
      });
    }
  };

  // Add Component to App Builder
  const handleAddComponent = (type, title, defaultBinding) => {
    const newId = `w-${Date.now()}`;
    const newWidget = {
      id: newId,
      type,
      title: title || `New ${type}`,
      boundTarget: defaultBinding || "GPIO Pin",
      boundTargetName: `Bound → ${defaultBinding || "GPIO Pin"}`,
      action: "Execute Action",
      state: false,
      value: 50,
      color: "blue",
      cornerRadius: 16,
      visible: true
    };
    setWidgets((prev) => [...prev, newWidget]);
    setSelectedWidgetId(newId);
    toast({
      title: "Component Added",
      description: `Added "${title}" to your mobile app canvas.`,
      status: "success",
      duration: 2000
    });
  };

  // Update Widget Attribute
  const handleUpdateWidget = (prop, value) => {
    if (!activeWidget) return;
    setWidgets((prev) =>
      prev.map((w) => (w.id === activeWidget.id ? { ...w, [prop]: value } : w))
    );
  };

  // Delete Component
  const handleDeleteWidget = (id) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
    if (selectedWidgetId === id) {
      setSelectedWidgetId(widgets[0]?.id || "");
    }
  };

  // Palette Items for Screen 14
  const uiPaletteItems = [
    { type: "button", title: "Button", desc: "Tap action", icon: <FaCircle size={13} /> },
    { type: "label", title: "Label", desc: "Display text", icon: <FaTag size={13} /> },
    { type: "textfield", title: "Text Field", desc: "Text input", icon: <FaFont size={13} /> },
    { type: "switch", title: "Switch", desc: "Toggle on/off", icon: <FaSync size={13} /> },
    { type: "slider", title: "Slider", desc: "Range input", icon: <FaSlidersH size={13} /> },
    { type: "image", title: "Image", desc: "Show image", icon: <FaImage size={13} /> },
    { type: "card", title: "Card", desc: "Content card", icon: <FaIdCard size={13} /> },
    { type: "progress", title: "Progress Bar", desc: "Progress", icon: <FaTasks size={13} /> },
    { type: "fab", title: "Floating Button", desc: "Action button", icon: <FaPlusCircle size={13} /> },
    { type: "divider", title: "Divider", desc: "Separator", icon: <FaMinus size={13} /> }
  ];

  const filteredPalette = uiPaletteItems.filter((item) =>
    item.title.toLowerCase().includes(searchPalette.toLowerCase())
  );

  // Stepper Header renderer for Screens 9, 10, 11, 12
  const renderStepperHeader = (currentStepIndex) => {
    const steps = [
      { id: 1, label: "Connection" },
      { id: 2, label: "Discover Devices" },
      { id: 3, label: "Compatibility" },
      { id: 4, label: "Flash Firmware" }
    ];

    return (
      <Box bg={headerBg} color="white" px={6} py={5} borderTopRadius="2xl">
        {/* Title row */}
        <HStack justify="space-between" align="center" mb={5}>
          <HStack spacing={3}>
            <Box p={2.5} bg="whiteAlpha.200" borderRadius="xl">
              <FaBolt size={18} color="#facc15" />
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontWeight="extrabold" fontSize="lg" letterSpacing="tight">
                Flash to Device
              </Text>
              <Text fontSize="xs" opacity={0.85}>
                {projectName}
              </Text>
            </VStack>
          </HStack>
          <IconButton
            icon={<FaTimes size={14} />}
            variant="ghost"
            color="white"
            _hover={{ bg: "whiteAlpha.300" }}
            size="sm"
            onClick={onClose}
            aria-label="Close"
            borderRadius="full"
          />
        </HStack>

        {/* Stepper progress indicator */}
        <HStack spacing={2} justify="space-between" align="center" px={1}>
          {steps.map((s, idx) => {
            const isCompleted = s.id < currentStepIndex;
            const isActive = s.id === currentStepIndex;
            return (
              <React.Fragment key={s.id}>
                <HStack spacing={2} align="center">
                  <Box
                    w="24px"
                    h="24px"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="11px"
                    fontWeight="bold"
                    bg={isCompleted ? "green.400" : isActive ? "white" : "whiteAlpha.300"}
                    color={isCompleted ? "white" : isActive ? "blue.600" : "whiteAlpha.800"}
                    shadow={isActive ? "md" : "none"}
                  >
                    {isCompleted ? <FaCheck size={10} /> : s.id}
                  </Box>
                  <Text
                    fontSize="xs"
                    fontWeight={isActive ? "bold" : "medium"}
                    color={isActive ? "white" : "whiteAlpha.700"}
                  >
                    {s.label}
                  </Text>
                </HStack>

                {idx < steps.length - 1 && (
                  <Box
                    flex="1"
                    h="2px"
                    mx={2}
                    bg={isCompleted ? "green.400" : "whiteAlpha.300"}
                    borderRadius="full"
                  />
                )}
              </React.Fragment>
            );
          })}
        </HStack>
      </Box>
    );
  };

  // ==========================================
  // SCREEN 14: FULL APP BUILDER VIEW
  // ==========================================
  if (wizardStep === "app_builder") {
    return (
      <Box w="100%" h="100%" bg={useColorModeValue("gray.50", "gray.900")} display="flex" flexDirection="column">
        {/* Top App Builder Header Bar */}
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
            <Box p={2} bg="blue.500" color="white" borderRadius="lg">
              <FaBolt size={14} />
            </Box>
            <Text fontSize="xs" color="gray.500" display={{ base: "none", md: "block" }}>
              Dashboard / <Text as="span" fontWeight="semibold" color={useColorModeValue("gray.800", "white")}>{projectName}</Text> / <Text as="span" color="blue.500" fontWeight="bold">App Builder</Text>
            </Text>
            <HStack bg={useColorModeValue("gray.100", "gray.800")} px={3} py={1} borderRadius="lg" spacing={2} cursor="pointer">
              <FaMobileAlt size={13} color="var(--chakra-colors-blue-500)" />
              <Text fontSize="xs" fontWeight="bold">Garden Monitor App</Text>
              <Text fontSize="10px" color="gray.400">▾</Text>
            </HStack>
            <HStack bg="green.50" color="green.700" px={2.5} py={1} borderRadius="full" fontSize="11px" fontWeight="semibold">
              <Box w="6px" h="6px" bg="green.500" borderRadius="full" />
              <Text>{selectedDevice?.name || "ESP32 Dev Board"}</Text>
            </HStack>
          </HStack>

          {/* Center Mode Switcher */}
          <HStack spacing={1} bg={useColorModeValue("gray.100", "gray.800")} p={1} borderRadius="xl">
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
              leftIcon={<FaCogs size={11} />}
              onClick={() => setAppBuilderView("blocks")}
              borderRadius="lg"
            >
              Blocks
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
            <IconButton icon={<FaUndo size={12} />} size="sm" variant="ghost" aria-label="Undo" />
            <IconButton icon={<FaRedo size={12} />} size="sm" variant="ghost" aria-label="Redo" />
            <Button
              size="sm"
              variant="outline"
              leftIcon={<FaSave size={13} />}
              onClick={() => toast({ title: "App Saved", status: "success", duration: 2000 })}
            >
              Save
            </Button>
            <Button
              size="sm"
              colorScheme="green"
              bg="#10b981"
              _hover={{ bg: "#059669" }}
              leftIcon={<FaRocket size={13} />}
              onClick={onPublishOpen}
              shadow="md"
            >
              Publish App
            </Button>
            <IconButton
              icon={<FaTimes size={13} />}
              size="sm"
              variant="ghost"
              aria-label="Close"
              onClick={onClose}
            />
          </HStack>
        </Flex>

        {/* 3-Column Layout: Palette | Smartphone Canvas | Properties Inspector */}
        <Grid templateColumns={{ base: "1fr", lg: "260px 1fr 340px" }} flex="1" overflow="hidden">
          {/* 1. Left Component Palette */}
          <GridItem bg={bgCard} borderRight="1px" borderColor={borderColor} p={3} display="flex" flexDirection="column" overflowY="auto">
            <HStack mb={3} px={1}>
              <Input
                placeholder="Search components..."
                size="sm"
                value={searchPalette}
                onChange={(e) => setSearchPalette(e.target.value)}
                borderRadius="lg"
                bg={useColorModeValue("gray.50", "gray.800")}
              />
            </HStack>

            <Accordion defaultIndex={[0, 1]} allowMultiple>
              <AccordionItem border="none">
                <AccordionButton px={2} py={2} _hover={{ bg: "transparent" }}>
                  <Box flex="1" textAlign="left" fontWeight="bold" fontSize="xs" color="gray.500" letterSpacing="wider">
                    USER INTERFACE
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={3} px={1}>
                  <VStack align="stretch" spacing={1.5}>
                    {filteredPalette.map((item) => (
                      <HStack
                        key={item.type}
                        p={2}
                        borderRadius="lg"
                        border="1px solid"
                        borderColor={useColorModeValue("gray.100", "gray.750")}
                        bg={useColorModeValue("gray.50", "gray.800")}
                        _hover={{
                          borderColor: "blue.400",
                          bg: useColorModeValue("blue.50", "gray.700"),
                          transform: "translateY(-1px)",
                          shadow: "xs"
                        }}
                        cursor="pointer"
                        transition="all 0.15s"
                        onClick={() => handleAddComponent(item.type, item.title, "GPIO Pin")}
                        justify="space-between"
                      >
                        <HStack spacing={2.5}>
                          <Box color="blue.500" p={1} bg="whiteAlpha.800" borderRadius="md" shadow="xs">
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
                        <Text fontSize="12px" color="gray.400" opacity={0.6}>
                          ⋮⋮
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem border="none">
                <AccordionButton px={2} py={2} _hover={{ bg: "transparent" }}>
                  <Box flex="1" textAlign="left" fontWeight="bold" fontSize="xs" color="gray.500" letterSpacing="wider">
                    LAYOUT
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={2} px={1}>
                  <VStack align="stretch" spacing={1.5}>
                    <HStack
                      p={2}
                      borderRadius="lg"
                      border="1px solid"
                      borderColor={useColorModeValue("gray.100", "gray.750")}
                      bg={useColorModeValue("gray.50", "gray.800")}
                      cursor="pointer"
                      onClick={() => handleAddComponent("card", "Container Card", "Layout")}
                    >
                      <FaBoxes color="#3b82f6" />
                      <Text fontSize="xs" fontWeight="semibold">Vertical Stack</Text>
                    </HStack>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </GridItem>

          {/* 2. Center Canvas: Smartphone Mockup */}
          <GridItem
            bg={useColorModeValue("#f8fafc", "#0b0f17")}
            p={4}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="start"
            overflowY="auto"
            position="relative"
          >
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
                      We've created a basic control app from your hardware. Customize it by dragging more components or rearranging the layout.
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
              w="330px"
              minH="620px"
              bg="white"
              borderRadius="42px"
              border="10px solid #1e293b"
              position="relative"
              shadow="2xl"
              display="flex"
              flexDirection="column"
              overflow="hidden"
              mb={8}
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
              <Box flex="1" p={3.5} bg="#f8fafc" overflowY="auto">
                {/* App Title Header */}
                <HStack justify="space-between" mb={3} mt={1}>
                  <HStack spacing={2}>
                    <Text fontSize="sm">🌱</Text>
                    <Text fontWeight="extrabold" fontSize="md" color="gray.900">
                      {projectName}
                    </Text>
                  </HStack>
                  <Text color="gray.400" fontSize="xs">•••</Text>
                </HStack>

                {/* Sub-banner inside phone */}
                <Box p={2.5} bg="orange.50" border="1px solid" borderColor="orange.200" borderRadius="xl" mb={3}>
                  <HStack align="start" spacing={2}>
                    <Text fontSize="12px">✨</Text>
                    <Text fontSize="10px" color="orange.800" fontWeight="medium">
                      Starter app generated from your hardware. Customize it by dragging more components.
                    </Text>
                  </HStack>
                </Box>

                {/* Render Interactive Phone Widgets */}
                <VStack spacing={2.5} align="stretch">
                  {widgets.map((w) => {
                    const isSelected = w.id === selectedWidgetId;
                    return (
                      <Box
                        key={w.id}
                        p={3}
                        bg="white"
                        borderRadius="xl"
                        border="2px solid"
                        borderColor={isSelected ? "#2563eb" : "transparent"}
                        shadow="sm"
                        _hover={{ borderColor: isSelected ? "#2563eb" : "gray.200" }}
                        cursor="pointer"
                        transition="all 0.15s"
                        onClick={() => setSelectedWidgetId(w.id)}
                      >
                        {/* 1. LED Switch Widget */}
                        {w.type === "switch" && (
                          <HStack justify="space-between">
                            <HStack spacing={2.5}>
                              <Box p={2} bg="yellow.50" color="yellow.600" borderRadius="lg">
                                <FaLightbulb size={16} />
                              </Box>
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="bold" fontSize="xs" color="gray.900">
                                  {w.title}
                                </Text>
                                <Text fontSize="10px" color="gray.400">
                                  {w.boundTargetName}
                                </Text>
                              </VStack>
                            </HStack>
                            <Switch
                              colorScheme="green"
                              isChecked={w.state}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleUpdateWidget("state", e.target.checked);
                              }}
                            />
                          </HStack>
                        )}

                        {/* 2. Servo Angle Slider Widget */}
                        {w.type === "slider" && (
                          <VStack align="stretch" spacing={1.5}>
                            <HStack justify="space-between">
                              <HStack spacing={2.5}>
                                <Box p={2} bg="purple.50" color="purple.600" borderRadius="lg">
                                  <FaCogs size={16} />
                                </Box>
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="bold" fontSize="xs" color="gray.900">
                                    {w.title}
                                  </Text>
                                  <Text fontSize="10px" color="gray.400">
                                    {w.boundTargetName}
                                  </Text>
                                </VStack>
                              </HStack>
                              <Text fontWeight="extrabold" fontSize="xs" color="purple.600">
                                {w.value}°
                              </Text>
                            </HStack>
                            <Slider
                              value={w.value}
                              min={w.min || 0}
                              max={w.max || 180}
                              onChange={(val) => handleUpdateWidget("value", val)}
                            >
                              <SliderTrack bg="gray.100">
                                <SliderFilledTrack bg="purple.500" />
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
                                <Box p={2} bg="red.50" color="red.500" borderRadius="lg">
                                  <FaTemperatureHigh size={16} />
                                </Box>
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="bold" fontSize="xs" color="gray.900">
                                    {w.title}
                                  </Text>
                                  <Text fontSize="10px" color="gray.400">
                                    {w.boundTargetName}
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
                                w="48px"
                                h="24px"
                                borderTopRadius="48px"
                                border="4px solid #ef4444"
                                borderBottom="none"
                              />
                              <VStack align="start" spacing={0}>
                                <Text fontSize="xl" fontWeight="black" color="gray.900">
                                  {w.value}°C
                                </Text>
                                <Text fontSize="9px" color="gray.400">
                                  Live reading
                                </Text>
                              </VStack>
                            </HStack>
                          </VStack>
                        )}

                        {/* 4. Sound Alarm Button Widget */}
                        {w.type === "button" && (
                          <VStack align="stretch" spacing={1}>
                            <Text fontSize="9px" color="gray.400" px={1}>
                              {w.boundTargetName}
                            </Text>
                            <Button
                              w="100%"
                              size="md"
                              bg="#ea580c"
                              _hover={{ bg: "#c2410c" }}
                              color="white"
                              borderRadius="xl"
                              leftIcon={<FaBell size={14} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                toast({ title: "Buzzer Alarm Triggered", status: "warning", duration: 1500 });
                              }}
                              fontWeight="bold"
                              fontSize="xs"
                            >
                              {w.title}
                            </Button>
                          </VStack>
                        )}

                        {/* 5. Device Link Status Card Widget */}
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

                        {/* Generic New Added Components */}
                        {!["switch", "slider", "gauge", "button", "device_card"].includes(w.type) && (
                          <HStack justify="space-between">
                            <Text fontWeight="bold" fontSize="xs">
                              {w.title}
                            </Text>
                            <Badge fontSize="9px">{w.type}</Badge>
                          </HStack>
                        )}
                      </Box>
                    );
                  })}
                </VStack>
              </Box>
            </Box>
          </GridItem>

          {/* 3. Right Inspector & Properties Panel */}
          <GridItem bg={bgCard} borderLeft="1px" borderColor={borderColor} p={4} display="flex" flexDirection="column" overflowY="auto">
            {/* Tab switch: Tree vs Properties */}
            <HStack bg={useColorModeValue("gray.100", "gray.800")} p={1} borderRadius="lg" mb={4}>
              <Button
                size="xs"
                flex="1"
                variant={inspectorTab === "tree" ? "solid" : "ghost"}
                colorScheme={inspectorTab === "tree" ? "blue" : "gray"}
                leftIcon={<FaFolder size={11} />}
                onClick={() => setInspectorTab("tree")}
                borderRadius="md"
              >
                Tree
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

            {activeWidget ? (
              <VStack align="stretch" spacing={5}>
                {/* Active Component Title & Type */}
                <HStack spacing={3} p={2} bg={useColorModeValue("gray.50", "gray.800")} borderRadius="xl">
                  <Box p={2} bg="yellow.50" color="yellow.600" borderRadius="lg">
                    <FaLightbulb size={16} />
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
                      Color
                    </Text>
                    <HStack spacing={2}>
                      {["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"].map((c) => (
                        <Box
                          key={c}
                          w="20px"
                          h="20px"
                          borderRadius="full"
                          bg={c}
                          cursor="pointer"
                          border={activeWidget.color === c ? "2px solid black" : "none"}
                          _hover={{ transform: "scale(1.15)" }}
                          transition="all 0.15s"
                          onClick={() => handleUpdateWidget("color", c)}
                        />
                      ))}
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
                      Visible
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
                      KEY
                    </Badge>
                  </HStack>

                  <Box p={2.5} bg="green.50" borderRadius="xl" border="1px solid" borderColor="green.200">
                    <HStack spacing={2} color="green.800" fontSize="xs" fontWeight="bold" mb={2}>
                      <FaLightbulb size={12} />
                      <Text>{activeWidget.type} component</Text>
                    </HStack>

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
                          <option value="LED">LED</option>
                          <option value="Servo Motor">Servo Motor</option>
                          <option value="Temperature Sensor">Temperature Sensor</option>
                          <option value="Buzzer">Buzzer</option>
                          <option value="GPIO 2">GPIO 2 (Onboard)</option>
                          <option value="GPIO 4">GPIO 4 (PWM)</option>
                        </Select>
                      </Box>

                      <Box>
                        <Text fontSize="10px" fontWeight="bold" color="gray.600" mb={1}>
                          Action
                        </Text>
                        <Select
                          size="sm"
                          bg="white"
                          value={activeWidget.action}
                          onChange={(e) => handleUpdateWidget("action", e.target.value)}
                          borderRadius="lg"
                        >
                          <option value="Turn ON / OFF">Turn ON / OFF</option>
                          <option value="Set PWM Angle">Set PWM Angle</option>
                          <option value="Read Telemetry">Read Telemetry</option>
                          <option value="Trigger Alarm">Trigger Alarm</option>
                        </Select>
                      </Box>

                      <HStack color="green.700" fontSize="11px" fontWeight="bold" mt={1}>
                        <FaCheck size={11} />
                        <Text>Bound to {activeWidget.boundTarget}</Text>
                      </HStack>
                    </VStack>
                  </Box>

                  {/* Remove Component Button */}
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    leftIcon={<FaTrashAlt size={12} />}
                    onClick={() => handleDeleteWidget(activeWidget.id)}
                    mt={2}
                  >
                    Remove Component
                  </Button>
                </VStack>
              </VStack>
            ) : (
              <Text fontSize="xs" color="gray.400" textAlign="center" py={10}>
                Select an item on the smartphone screen to edit properties.
              </Text>
            )}
          </GridItem>
        </Grid>

        {/* Bottom Status Bar */}
        <Flex
          h="28px"
          px={4}
          bg="#1e3a8a"
          color="white"
          fontSize="11px"
          align="center"
          justify="space-between"
        >
          <HStack spacing={3}>
            <HStack spacing={1.5}>
              <Box w="6px" h="6px" bg="green.400" borderRadius="full" />
              <Text fontWeight="semibold">ESP32 Connected</Text>
            </HStack>
            <Text opacity={0.6}>•</Text>
            <Text>App Builder</Text>
            <Text opacity={0.6}>•</Text>
            <Text>{widgets.length} components</Text>
            <Text opacity={0.6}>•</Text>
            <Text>5 hardware bindings</Text>
          </HStack>
          <Text opacity={0.8}>Mode: Designer</Text>
        </Flex>

        {/* ========================================== */}
        {/* SCREEN 15: PUBLISH COMPANION APP MODAL */}
        {/* ========================================== */}
        <Modal isOpen={isPublishOpen} onClose={onPublishClose} size="xl" isCentered>
          <ModalOverlay backdropFilter="blur(6px)" />
          <ModalContent borderRadius="3xl" overflow="hidden" p={0} bg={bgCard}>
            {/* Modal Header */}
            <ModalHeader p={5} borderBottom="1px" borderColor={borderColor}>
              <HStack spacing={3}>
                <Box p={2.5} bg="pink.50" color="pink.500" borderRadius="xl">
                  <FaRocket size={18} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="extrabold" fontSize="lg">
                    Publish App
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {projectName}
                  </Text>
                </VStack>
              </HStack>
              <ModalCloseButton top={5} right={5} />
            </ModalHeader>

            <ModalBody p={6}>
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                {/* Left Column: QR Code & Direct Link */}
                <VStack align="stretch" spacing={4}>
                  <Box
                    p={4}
                    bg={useColorModeValue("gray.50", "gray.800")}
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor={borderColor}
                    textAlign="center"
                  >
                    <Text fontSize="10px" fontWeight="extrabold" color="gray.500" letterSpacing="wider" mb={3}>
                      SCAN TO INSTALL
                    </Text>

                    {/* High-Fidelity SVG QR Code */}
                    <Box display="inline-block" p={3} bg="white" borderRadius="2xl" shadow="sm">
                      <svg width="150" height="150" viewBox="0 0 150 150" style={{ shapeRendering: "crispEdges" }}>
                        <rect width="150" height="150" fill="white" />
                        {/* Top-left marker */}
                        <path d="M10,10 h40 v40 h-40 z M20,20 v20 h20 v-20 z" fill="#0f172a" />
                        <rect x="25" y="25" width="10" height="10" fill="#0f172a" />
                        {/* Top-right marker */}
                        <path d="M100,10 h40 v40 h-40 z M110,20 v20 h20 v-20 z" fill="#0f172a" />
                        <rect x="115" y="25" width="10" height="10" fill="#0f172a" />
                        {/* Bottom-left marker */}
                        <path d="M10,100 h40 v40 h-40 z M20,110 v20 h20 v-20 z" fill="#0f172a" />
                        <rect x="25" y="115" width="10" height="10" fill="#0f172a" />
                        {/* QR Pattern dots */}
                        <rect x="60" y="15" width="8" height="8" fill="#0f172a" />
                        <rect x="75" y="15" width="8" height="8" fill="#0f172a" />
                        <rect x="60" y="35" width="8" height="8" fill="#0f172a" />
                        <rect x="80" y="35" width="8" height="8" fill="#0f172a" />
                        <rect x="60" y="60" width="8" height="8" fill="#0f172a" />
                        <rect x="75" y="75" width="8" height="8" fill="#0f172a" />
                        <rect x="90" y="60" width="8" height="8" fill="#0f172a" />
                        <rect x="15" y="65" width="8" height="8" fill="#0f172a" />
                        <rect x="35" y="75" width="8" height="8" fill="#0f172a" />
                        <rect x="105" y="65" width="8" height="8" fill="#0f172a" />
                        <rect x="125" y="75" width="8" height="8" fill="#0f172a" />
                        <rect x="60" y="105" width="8" height="8" fill="#0f172a" />
                        <rect x="80" y="115" width="8" height="8" fill="#0f172a" />
                        <rect x="110" y="105" width="8" height="8" fill="#0f172a" />
                        <rect x="125" y="125" width="8" height="8" fill="#0f172a" />
                        <rect x="95" y="130" width="8" height="8" fill="#0f172a" />
                      </svg>
                    </Box>

                    <HStack justify="center" spacing={1.5} mt={3} color="gray.600" fontSize="11px">
                      <FaMobileAlt size={12} />
                      <Text>Point your phone camera at the QR code</Text>
                    </HStack>
                  </Box>

                  {/* Shareable Link Input */}
                  <Box>
                    <Text fontSize="11px" fontWeight="semibold" color="gray.500" mb={1.5}>
                      Or share the link
                    </Text>
                    <HStack bg={useColorModeValue("gray.50", "gray.800")} p={1} borderRadius="xl" border="1px" borderColor={borderColor}>
                      <Input
                        value={shareableLink}
                        isReadOnly
                        fontSize="xs"
                        variant="unstyled"
                        px={2}
                        fontFamily="monospace"
                        color="blue.600"
                      />
                      <Button
                        size="xs"
                        colorScheme="blue"
                        px={3}
                        borderRadius="lg"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://${shareableLink}`);
                          toast({ title: "Link Copied to Clipboard", status: "success", duration: 2000 });
                        }}
                      >
                        Copy
                      </Button>
                    </HStack>
                  </Box>

                  {/* App Ready Card */}
                  <HStack p={2.5} bg="blue.50" borderRadius="xl" justify="space-between">
                    <HStack spacing={2}>
                      <Text fontSize="sm">📱</Text>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" fontWeight="bold" color="blue.900">
                          {projectName}
                        </Text>
                        <Text fontSize="10px" color="blue.700">
                          v1.0.0 • {widgets.length} components • ESP32
                        </Text>
                      </VStack>
                    </HStack>
                    <Badge colorScheme="green" borderRadius="md" px={2}>
                      Ready
                    </Badge>
                  </HStack>
                </VStack>

                {/* Right Column: Export Options */}
                <VStack align="stretch" spacing={3}>
                  <Text fontSize="xs" fontWeight="extrabold" color="gray.500" letterSpacing="wider" mb={1}>
                    Export Options
                  </Text>

                  {/* Option 1: Download APK */}
                  <HStack
                    p={3}
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor={borderColor}
                    _hover={{ borderColor: "blue.400", bg: useColorModeValue("gray.50", "gray.800") }}
                    cursor="pointer"
                    transition="all 0.15s"
                    justify="space-between"
                    onClick={() => toast({ title: "Downloading APK...", status: "info", duration: 2000 })}
                  >
                    <HStack spacing={3}>
                      <Box p={2.5} bg="orange.50" color="orange.500" borderRadius="xl">
                        <FaDownload size={15} />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <HStack spacing={1.5}>
                          <Text fontWeight="bold" fontSize="xs">
                            Download APK
                          </Text>
                          <Badge colorScheme="blue" fontSize="9px">
                            Direct install
                          </Badge>
                        </HStack>
                        <Text fontSize="11px" color="gray.500">
                          Install directly on Android
                        </Text>
                      </VStack>
                    </HStack>
                    <FaChevronRight size={12} color="gray" />
                  </HStack>

                  {/* Option 2: App Bundle */}
                  <HStack
                    p={3}
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor={borderColor}
                    _hover={{ borderColor: "blue.400", bg: useColorModeValue("gray.50", "gray.800") }}
                    cursor="pointer"
                    transition="all 0.15s"
                    justify="space-between"
                    onClick={() => toast({ title: "Generating AAB App Bundle...", status: "info", duration: 2000 })}
                  >
                    <HStack spacing={3}>
                      <Box p={2.5} bg="red.50" color="red.500" borderRadius="xl">
                        <FaCube size={15} />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <HStack spacing={1.5}>
                          <Text fontWeight="bold" fontSize="xs">
                            App Bundle
                          </Text>
                          <Badge colorScheme="purple" fontSize="9px">
                            Play Store
                          </Badge>
                        </HStack>
                        <Text fontSize="11px" color="gray.500">
                          For Google Play Store
                        </Text>
                      </VStack>
                    </HStack>
                    <FaChevronRight size={12} color="gray" />
                  </HStack>

                  {/* Option 3: Preview on Device */}
                  <HStack
                    p={3}
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor={borderColor}
                    _hover={{ borderColor: "blue.400", bg: useColorModeValue("gray.50", "gray.800") }}
                    cursor="pointer"
                    transition="all 0.15s"
                    justify="space-between"
                    onClick={() => toast({ title: "Opening live companion on device...", status: "success", duration: 2000 })}
                  >
                    <HStack spacing={3}>
                      <Box p={2.5} bg="blue.50" color="blue.500" borderRadius="xl">
                        <FaBroadcastTower size={15} />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <HStack spacing={1.5}>
                          <Text fontWeight="bold" fontSize="xs">
                            Preview on Device
                          </Text>
                          <Badge colorScheme="green" fontSize="9px">
                            Live
                          </Badge>
                        </HStack>
                        <Text fontSize="11px" color="gray.500">
                          Open instantly on phone
                        </Text>
                      </VStack>
                    </HStack>
                    <FaChevronRight size={12} color="gray" />
                  </HStack>

                  {/* Option 4: Export Project */}
                  <HStack
                    p={3}
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor={borderColor}
                    _hover={{ borderColor: "blue.400", bg: useColorModeValue("gray.50", "gray.800") }}
                    cursor="pointer"
                    transition="all 0.15s"
                    justify="space-between"
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(widgets, null, 2));
                      const dlAnchor = document.createElement("a");
                      dlAnchor.setAttribute("href", dataStr);
                      dlAnchor.setAttribute("download", `${projectName}-app.json`);
                      dlAnchor.click();
                      toast({ title: "Project exported as JSON", status: "success", duration: 2000 });
                    }}
                  >
                    <HStack spacing={3}>
                      <Box p={2.5} bg="purple.50" color="purple.500" borderRadius="xl">
                        <FaSave size={15} />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" fontSize="xs">
                          Export Project
                        </Text>
                        <Text fontSize="11px" color="gray.500">
                          Save project configuration file
                        </Text>
                      </VStack>
                    </HStack>
                    <FaChevronRight size={12} color="gray" />
                  </HStack>
                </VStack>
              </Grid>
            </ModalBody>

            <ModalFooter p={5} borderTop="1px" borderColor={borderColor}>
              <Button w="100%" size="md" colorScheme="blue" borderRadius="xl" onClick={onPublishClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    );
  }

  // ==========================================
  // SCREEN 13: SUCCESS CELEBRATION MODAL
  // ==========================================
  if (wizardStep === "success") {
    return (
      <Box w="100%" maxW="600px" mx="auto" bg={bgCard} borderRadius="2xl" shadow="2xl" overflow="hidden" border="1px" borderColor={borderColor}>
        <Box p={8} textAlign="center">
          <VStack spacing={6}>
            {/* Celebration Green Icon Badge */}
            <Box
              display="inline-flex"
              p={5}
              bg="green.50"
              color="green.500"
              borderRadius="full"
              shadow="md"
              animation="pulse 2s infinite"
            >
              <FaCheck size={48} />
            </Box>

            {/* Title & Description */}
            <VStack spacing={2}>
              <Text fontSize="2xl" fontWeight="black" color={useColorModeValue("gray.850", "white")}>
                Firmware Flashed Successfully!
              </Text>
              <Text fontSize="xl">🎉</Text>
              <Text color="gray.500" fontSize="sm" maxW="440px" lineHeight="tall">
                Your hardware is ready and running. Now let's build a <Text as="span" fontWeight="bold" color={useColorModeValue("gray.800", "white")}>mobile app</Text> to control and monitor your connected device — no coding required.
              </Text>
            </VStack>

            {/* Device Online Status Pill */}
            <HStack bg="gray.50" px={4} py={1.5} borderRadius="full" border="1px solid" borderColor="gray.200" spacing={2.5}>
              <Box w="8px" h="8px" bg="green.500" borderRadius="full" />
              <Text fontSize="xs" fontWeight="bold" color="gray.800">
                {selectedDevice?.name || "ESP32 Dev Board"}
              </Text>
              <Badge colorScheme="green" fontSize="9px" px={2} borderRadius="full">
                Online
              </Badge>
            </HStack>

            {/* Next Step Informational Card */}
            <Box
              w="100%"
              p={4}
              bg="blue.50"
              borderRadius="2xl"
              border="1px solid"
              borderColor="blue.100"
              textAlign="left"
            >
              <HStack spacing={3} align="center">
                <Box p={2.5} bg="white" color="blue.500" borderRadius="xl" shadow="xs">
                  <FaMobileAlt size={20} />
                </Box>
                <VStack align="start" spacing={0.5}>
                  <Text fontSize="xs" fontWeight="extrabold" color="blue.900">
                    Next step
                  </Text>
                  <Text fontSize="11px" color="blue.700">
                    A starter app will be auto-generated from your hardware components.
                  </Text>
                </VStack>
              </HStack>
            </Box>

            {/* Action Buttons */}
            <VStack w="100%" spacing={3}>
              <Button
                w="100%"
                size="lg"
                colorScheme="blue"
                bg="#2563eb"
                _hover={{ bg: "#1d4ed8" }}
                borderRadius="xl"
                shadow="lg"
                onClick={() => setWizardStep("app_builder")}
                fontWeight="bold"
                leftIcon={<Text fontSize="md">📱</Text>}
                rightIcon={<FaChevronRight size={13} />}
              >
                Create App →
              </Button>

              <Button
                variant="ghost"
                size="sm"
                color="gray.500"
                _hover={{ color: "gray.800" }}
                onClick={() => (onClose ? onClose() : setWizardStep("connection"))}
              >
                Back to Workspace
              </Button>
            </VStack>
          </VStack>
        </Box>
      </Box>
    );
  }

  // =========================================================
  // SCREENS 9, 10, 11, 12: WIZARD MODAL WORKFLOW CONTAINER
  // =========================================================
  return (
    <Box w="100%" maxW="640px" mx="auto" bg={bgCard} borderRadius="2xl" shadow="2xl" overflow="hidden" border="1px" borderColor={borderColor}>
      {/* 4-Step Stepper Header */}
      {wizardStep === "connection" && renderStepperHeader(1)}
      {wizardStep === "devices" && renderStepperHeader(2)}
      {wizardStep === "compatibility" && renderStepperHeader(3)}
      {wizardStep === "flashing" && renderStepperHeader(4)}

      <Box p={6}>
        {/* ========================================== */}
        {/* SCREEN 9: STEP 1 - CHOOSE CONNECTION TYPE */}
        {/* ========================================== */}
        {wizardStep === "connection" && (
          <VStack align="stretch" spacing={6}>
            <Text fontSize="lg" fontWeight="extrabold" color={useColorModeValue("gray.800", "white")}>
              Choose Connection Type
            </Text>

            <Grid templateColumns="1fr 1fr" gap={4}>
              {/* WiFi Option Card (Recommended) */}
              <Box
                p={5}
                borderRadius="2xl"
                border="2px solid"
                borderColor={connectionType === "wifi" ? "#2563eb" : borderColor}
                bg={connectionType === "wifi" ? useColorModeValue("blue.50", "gray.800") : bgCard}
                _hover={{ borderColor: "#2563eb", transform: "translateY(-2px)" }}
                cursor="pointer"
                transition="all 0.2s"
                textAlign="center"
                onClick={() => setConnectionType("wifi")}
                position="relative"
              >
                <VStack spacing={3}>
                  <Box p={3} bg={connectionType === "wifi" ? "blue.500" : "gray.100"} color={connectionType === "wifi" ? "white" : "gray.600"} borderRadius="2xl" shadow="sm">
                    <FaWifi size={28} />
                  </Box>
                  <VStack spacing={0.5}>
                    <HStack spacing={1.5} justify="center">
                      <Text fontWeight="extrabold" fontSize="md">
                        WiFi
                      </Text>
                      <Badge colorScheme="green" fontSize="9px" px={2} borderRadius="full">
                        Recommended
                      </Badge>
                    </HStack>
                    <Text fontSize="11px" color="gray.500">
                      Connect via local network
                    </Text>
                  </VStack>
                </VStack>
              </Box>

              {/* Cellular Option Card */}
              <Box
                p={5}
                borderRadius="2xl"
                border="2px solid"
                borderColor={connectionType === "cellular" ? "#2563eb" : borderColor}
                bg={connectionType === "cellular" ? useColorModeValue("blue.50", "gray.800") : bgCard}
                _hover={{ borderColor: "#2563eb", transform: "translateY(-2px)" }}
                cursor="pointer"
                transition="all 0.2s"
                textAlign="center"
                onClick={() => setConnectionType("cellular")}
              >
                <VStack spacing={3}>
                  <Box p={3} bg={connectionType === "cellular" ? "blue.500" : "gray.100"} color={connectionType === "cellular" ? "white" : "gray.600"} borderRadius="2xl" shadow="sm">
                    <FaBroadcastTower size={28} />
                  </Box>
                  <VStack spacing={0.5}>
                    <Text fontWeight="extrabold" fontSize="md">
                      Cellular
                    </Text>
                    <Text fontSize="11px" color="gray.500">
                      Connect via mobile data
                    </Text>
                  </VStack>
                </VStack>
              </Box>
            </Grid>

            {/* Bottom Button */}
            <Button
              w="100%"
              size="lg"
              colorScheme="blue"
              bg="#2563eb"
              _hover={{ bg: "#1d4ed8" }}
              borderRadius="xl"
              onClick={() => setWizardStep("devices")}
              fontWeight="bold"
            >
              Continue →
            </Button>
          </VStack>
        )}

        {/* ========================================== */}
        {/* SCREEN 10: STEP 2 - DISCOVER DEVICES */}
        {/* ========================================== */}
        {wizardStep === "devices" && (
          <VStack align="stretch" spacing={5}>
            <HStack justify="space-between" align="center" flexWrap="wrap" gap={2}>
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="extrabold" color={useColorModeValue("gray.800", "white")}>
                  Select Device
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {devices.length} {devices.length === 1 ? "device" : "devices"} found
                </Text>
              </VStack>

              <HStack spacing={3}>
                <HStack spacing={1.5} bg={useColorModeValue("gray.100", "gray.800")} px={2.5} py={1} borderRadius="lg">
                  <Switch
                    size="sm"
                    colorScheme="blue"
                    isChecked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                  />
                  <Text fontSize="xs" color={useColorModeValue("gray.700", "gray.300")} fontWeight="semibold">
                    Auto-refresh
                  </Text>
                  {autoRefresh && (
                    <Box
                      w="6px"
                      h="6px"
                      bg="green.500"
                      borderRadius="full"
                      className="animate-pulse"
                      title="Auto-refresh active (3s polling)"
                    />
                  )}
                </HStack>

                <Button
                  size="xs"
                  variant="outline"
                  colorScheme="blue"
                  isLoading={isScanning}
                  leftIcon={<FaSync size={11} className={isScanning ? "animate-spin" : ""} />}
                  onClick={() => handleRefreshDevices(false)}
                >
                  Refresh
                </Button>
              </HStack>
            </HStack>

            {/* Discovered Device Cards List */}
            <VStack align="stretch" spacing={3}>
              {devices.map((device) => {
                const isSelected = device.id === selectedDeviceId;
                return (
                  <Box
                    key={device.id}
                    p={3.5}
                    borderRadius="2xl"
                    border="2px solid"
                    borderColor={isSelected ? "#2563eb" : borderColor}
                    bg={isSelected ? useColorModeValue("blue.50", "gray.800") : bgCard}
                    _hover={{ borderColor: isSelected ? "#2563eb" : "gray.300" }}
                    cursor="pointer"
                    transition="all 0.15s"
                    onClick={() => setSelectedDeviceId(device.id)}
                  >
                    <HStack justify="space-between">
                      <HStack spacing={3}>
                        <Box p={2.5} bg={isSelected ? "blue.500" : "gray.100"} color={isSelected ? "white" : "gray.600"} borderRadius="xl" position="relative">
                          <FaBroadcastTower size={16} />
                          <Box
                            w="8px"
                            h="8px"
                            bg="green.500"
                            borderRadius="full"
                            position="absolute"
                            bottom="-1px"
                            right="-1px"
                            border="2px solid white"
                          />
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="extrabold" fontSize="sm">
                            {device.name}
                          </Text>
                          <Text fontSize="11px" color="gray.500">
                            {device.ip}
                          </Text>
                          <Text fontSize="10px" color="gray.400">
                            {device.firmware}
                          </Text>
                        </VStack>
                      </HStack>

                      <HStack spacing={3}>
                        <HStack spacing={1} color="green.600" fontSize="11px" fontWeight="bold">
                          <FaWifi size={13} />
                          <Text>🔋 {device.battery}%</Text>
                        </HStack>

                        {/* Selected Radio Badge */}
                        <Box
                          w="20px"
                          h="20px"
                          borderRadius="full"
                          bg={isSelected ? "blue.500" : "transparent"}
                          border="2px solid"
                          borderColor={isSelected ? "blue.500" : "gray.300"}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          color="white"
                          fontSize="10px"
                        >
                          {isSelected && <FaCheck size={10} />}
                        </Box>
                      </HStack>
                    </HStack>
                  </Box>
                );
              })}
            </VStack>

            {/* Bottom Actions */}
            <HStack justify="space-between" pt={2}>
              <Button
                variant="outline"
                borderRadius="xl"
                onClick={() => setWizardStep("connection")}
                leftIcon={<FaChevronLeft size={11} />}
              >
                Back
              </Button>
              <Button
                colorScheme="blue"
                bg="#2563eb"
                _hover={{ bg: "#1d4ed8" }}
                borderRadius="xl"
                onClick={() => setWizardStep("compatibility")}
                fontWeight="bold"
                px={6}
              >
                Continue →
              </Button>
            </HStack>
          </VStack>
        )}

        {/* ========================================== */}
        {/* SCREEN 11: STEP 3 - COMPATIBILITY CHECK */}
        {/* ========================================== */}
        {wizardStep === "compatibility" && (
          <VStack align="stretch" spacing={5}>
            <Text fontSize="lg" fontWeight="extrabold" color={useColorModeValue("gray.800", "white")}>
              Compatibility Check
            </Text>

            {/* Pill items for validation checklist */}
            <VStack align="stretch" spacing={2.5}>
              {compatibilityChecks.map((item) => (
                <HStack
                  key={item.id}
                  p={3}
                  bg={useColorModeValue("gray.50", "gray.800")}
                  borderRadius="xl"
                  justify="space-between"
                  border="1px solid"
                  borderColor={borderColor}
                >
                  <HStack spacing={2.5}>
                    {item.status === "pass" ? (
                      <Box color="green.500">
                        <FaCheckCircle size={16} />
                      </Box>
                    ) : (
                      <Box color="orange.400">
                        <FaExclamationTriangle size={16} />
                      </Box>
                    )}
                    <Text fontSize="xs" fontWeight="semibold">
                      {item.label}
                    </Text>
                  </HStack>

                  {item.value && (
                    <Badge colorScheme="orange" fontSize="10px" borderRadius="md" px={2}>
                      {item.value}
                    </Badge>
                  )}
                </HStack>
              ))}
            </VStack>

            {/* All checks passed Green Banner */}
            <HStack p={3.5} bg="green.50" borderRadius="xl" border="1px solid" borderColor="green.200" spacing={2.5}>
              <Box color="green.600">
                <FaCheckCircle size={18} />
              </Box>
              <Text fontSize="xs" fontWeight="bold" color="green.800">
                All checks passed! Ready to flash.
              </Text>
            </HStack>

            {/* Bottom Actions */}
            <HStack justify="space-between" pt={2}>
              <Button
                variant="outline"
                borderRadius="xl"
                onClick={() => setWizardStep("devices")}
                leftIcon={<FaChevronLeft size={11} />}
              >
                Back
              </Button>
              <Button
                colorScheme="blue"
                bg="#2563eb"
                _hover={{ bg: "#1d4ed8" }}
                borderRadius="xl"
                onClick={handleStartFlash}
                fontWeight="bold"
                px={6}
                leftIcon={<FaBolt size={13} />}
              >
                Start Flash
              </Button>
            </HStack>
          </VStack>
        )}

        {/* ========================================== */}
        {/* SCREEN 12: STEP 4 - FLASHING FIRMWARE */}
        {/* ========================================== */}
        {wizardStep === "flashing" && (
          <VStack align="stretch" spacing={6}>
            <Text fontSize="lg" fontWeight="extrabold" color={useColorModeValue("gray.800", "white")}>
              Flashing Firmware
            </Text>

            {/* Central Animated Circular Progress Ring */}
            <Box display="flex" flexDirection="column" alignItems="center" py={4}>
              <Box position="relative" w="140px" h="140px" display="flex" alignItems="center" justifyContent="center">
                {/* SVG Circular Progress Ring */}
                <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
                  <circle
                    cx="70"
                    cy="70"
                    r="58"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="70"
                    cy="70"
                    r="58"
                    stroke="#2563eb"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={364}
                    strokeDashoffset={364 - (364 * flashProgress) / 100}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.4s ease" }}
                  />
                </svg>

                {/* Inner Percentage & Seconds Count */}
                <VStack spacing={0} position="absolute">
                  <Text fontSize="2xl" fontWeight="black" color="blue.600">
                    {flashProgress}%
                  </Text>
                  <Text fontSize="xs" fontWeight="semibold" color="gray.400">
                    {flashTimeRemaining}s
                  </Text>
                </VStack>
              </Box>

              {/* Dynamic Status Text */}
              <Text fontSize="xs" fontWeight="bold" color="gray.600" mt={3}>
                {flashStatusText}
              </Text>
            </Box>

            {/* Linear Progress Bar */}
            <Progress value={flashProgress} size="xs" colorScheme="blue" borderRadius="full" hasStripe isAnimated />

            {/* Live Streaming Console Terminal Strip */}
            <Box
              h="90px"
              bg="#0f172a"
              p={3}
              borderRadius="xl"
              fontFamily="monospace"
              fontSize="11px"
              color="#38bdf8"
              overflowY="auto"
              border="1px solid"
              borderColor="gray.800"
            >
              {flashTerminalLogs.length === 0 ? (
                <Text color="gray.500">// Terminal initializing...</Text>
              ) : (
                flashTerminalLogs.map((log, idx) => (
                  <Text key={idx} whiteSpace="pre-wrap" lineHeight="tall">
                    {log}
                  </Text>
                ))
              )}
              <div ref={terminalEndRef} />
            </Box>
          </VStack>
        )}
      </Box>
    </Box>
  );
}
