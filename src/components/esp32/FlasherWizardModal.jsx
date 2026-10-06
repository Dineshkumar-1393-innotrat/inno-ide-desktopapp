import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Progress,
  Switch,
  Input,
  Grid,
  useColorModeValue
} from "@chakra-ui/react";
import {
  FaCheck,
  FaMobileAlt,
  FaChevronRight,
  FaChevronLeft,
  FaBolt,
  FaCogs,
  FaUsb,
  FaWifi,
  FaBroadcastTower,
  FaSync,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimes
} from "react-icons/fa";
import EspIdfSetupModal from "../EspIdfSetupModal";

export default function FlasherWizardModal({
  wizardStep,
  setWizardStep,
  connectionType,
  setConnectionType,
  devices = [],
  selectedDeviceId,
  setSelectedDeviceId,
  selectedDevice,
  autoRefresh,
  setAutoRefresh,
  isScanning,
  handleRefreshDevices,
  manualWifiIp,
  setManualWifiIp,
  handleAddManualWifiDevice,
  compatibilityChecks = [],
  handleStartFlash,
  flashProgress = 0,
  flashTimeRemaining = 0,
  flashStatusText = "",
  flashTerminalLogs = [],
  terminalEndRef,
  isIdfPromptOpen,
  setIsIdfPromptOpen,
  onClose,
  projectName,
  bgCard,
  borderColor
}) {
  const bgMain = useColorModeValue("gray.50", "gray.900");
  const textTitleColor = useColorModeValue("gray.800", "white");
  const orangeCardBg = useColorModeValue("orange.50", "gray.800");
  const orangeBorderColor = useColorModeValue("orange.300", "orange.500");
  const blueCardBg = useColorModeValue("blue.50", "gray.800");
  const graySubtleBg = useColorModeValue("gray.50", "gray.800");
  const textSubtle = useColorModeValue("gray.700", "gray.300");
  const textMuted = useColorModeValue("gray.600", "gray.400");
  const textDark = useColorModeValue("gray.800", "gray.200");
  const toggleBg = useColorModeValue("gray.100", "gray.800");
  const wifiHeaderColor = useColorModeValue("blue.800", "blue.200");
  const orangeTitleColor = useColorModeValue("orange.800", "orange.200");
  const checklistBg = useColorModeValue("white", "gray.900");
  const checklistBorder = useColorModeValue("orange.200", "gray.700");

  // Stepper Header renderer for Screens 9, 10, 11, 12
  const renderStepperHeader = (currentStepIndex) => {
    const steps = [
      { id: 1, label: "Connection" },
      { id: 2, label: "Discover Devices" },
      { id: 3, label: "Compatibility" },
      { id: 4, label: "Flash Firmware" }
    ];

    return (
      <Box bg="linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)" p={5} color="white">
        <HStack justify="space-between" mb={5} flexWrap="wrap" gap={2}>
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
          <HStack spacing={2}>
            <Button
              size="xs"
              variant="solid"
              bg="whiteAlpha.200"
              color="white"
              _hover={{ bg: "whiteAlpha.300" }}
              borderRadius="full"
              leftIcon={<FaCogs size={11} />}
              onClick={() => setIsIdfPromptOpen(true)}
              title="View ESP-IDF Toolchain setup info"
            >
              ESP-IDF Setup
            </Button>
            <Button
              size="xs"
              variant="solid"
              bg="whiteAlpha.300"
              color="white"
              _hover={{ bg: "whiteAlpha.400", transform: "scale(1.02)" }}
              _active={{ transform: "scale(0.98)" }}
              borderRadius="full"
              leftIcon={<FaMobileAlt size={11} />}
              onClick={() => setWizardStep("app_builder")}
              title="Skip flashing and jump directly to App Builder & Publish QR screen"
              fontWeight="bold"
              shadow="sm"
            >
              Skip to App Builder ➔
            </Button>
          </HStack>
        </HStack>

        {/* Stepper progress indicator — Clickable for instant jumping */}
        <HStack spacing={2} justify="space-between" align="center" px={1}>
          {steps.map((s, idx) => {
            const stepMapping = { 1: "connection", 2: "devices", 3: "compatibility", 4: "flashing" };
            const isCompleted = s.id < currentStepIndex;
            const isActive = s.id === currentStepIndex;
            return (
              <React.Fragment key={s.id}>
                <HStack
                  spacing={2}
                  align="center"
                  cursor="pointer"
                  onClick={() => setWizardStep(stepMapping[s.id])}
                  opacity={isActive ? 1 : 0.85}
                  _hover={{ opacity: 1 }}
                  title={`Jump to Step ${s.id}: ${s.label}`}
                >
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
                    transition="all 0.2s"
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
  // SCREEN 13: SUCCESS CELEBRATION MODAL
  // ==========================================
  if (wizardStep === "success") {
    return (
      <Box
        w="100%"
        h="100%"
        minH="100%"
        flex="1"
        bg={bgMain}
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
      >
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
              >
                <FaCheck size={48} />
              </Box>

              {/* Title & Description */}
              <VStack spacing={2}>
                <Text fontSize="2xl" fontWeight="black" color={textTitleColor}>
                  Firmware Flashed Successfully!
                </Text>
                <Text fontSize="xl">🎉</Text>
                <Text color="gray.500" fontSize="sm" maxW="440px" lineHeight="tall">
                  Your hardware is ready and running. Now let's build a <Text as="span" fontWeight="bold" color={textTitleColor}>mobile app</Text> to control and monitor your connected device — no coding required.
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
                  onClick={() => {
                    try {
                      localStorage.removeItem("inno_flasher_active_step");
                    } catch (e) { }
                    if (onClose) {
                      onClose();
                    } else {
                      setWizardStep("connection");
                    }
                  }}
                >
                  Back to Workspace
                </Button>
              </VStack>
            </VStack>
          </Box>
        </Box>
      </Box>
    );
  }

  // =========================================================
  // SCREENS 9, 10, 11, 12: WIZARD MODAL WORKFLOW CONTAINER
  // =========================================================
  return (
    <Box
      w="100%"
      h="100%"
      minH="100%"
      flex="1"
      bg={bgMain}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={{ base: 2, md: 6 }}
      overflowY="auto"
    >
      <Box
        w="100%"
        maxW={{ base: "100%", md: "740px", lg: "800px" }}
        mx="auto"
        my="auto"
        bg={bgCard}
        borderRadius="2xl"
        shadow="2xl"
        overflow="hidden"
        border="1px"
        borderColor={borderColor}
      >
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
              <Text fontSize="lg" fontWeight="extrabold" color={textTitleColor}>
                Choose Connection Type
              </Text>

              <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                {/* USB Port Option Card */}
                <Box
                  p={5}
                  borderRadius="2xl"
                  border="2px solid"
                  borderColor={connectionType === "usb" ? "#2563eb" : borderColor}
                  bg={connectionType === "usb" ? blueCardBg : bgCard}
                  _hover={{ borderColor: "#2563eb", transform: "translateY(-2px)" }}
                  cursor="pointer"
                  transition="all 0.2s"
                  textAlign="center"
                  onClick={() => setConnectionType("usb")}
                  position="relative"
                >
                  <VStack spacing={3}>
                    <Box
                      p={3}
                      bg={connectionType === "usb" ? "blue.500" : "gray.100"}
                      color={connectionType === "usb" ? "white" : "gray.600"}
                      borderRadius="2xl"
                      shadow="sm"
                      display="inline-flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <FaUsb size={28} />
                    </Box>
                    <VStack spacing={0.5}>
                      <HStack spacing={1.5} justify="center">
                        <Text fontWeight="extrabold" fontSize="md">
                          USB Port
                        </Text>
                        <Badge colorScheme="purple" fontSize="9px" px={2} borderRadius="full">
                          Direct COM
                        </Badge>
                      </HStack>
                      <Text fontSize="11px" color="gray.500">
                        Connect via USB cable
                      </Text>
                    </VStack>
                  </VStack>
                </Box>

                {/* WiFi Option Card (Recommended) */}
                <Box
                  p={5}
                  borderRadius="2xl"
                  border="2px solid"
                  borderColor={connectionType === "wifi" ? "#2563eb" : borderColor}
                  bg={connectionType === "wifi" ? blueCardBg : bgCard}
                  _hover={{ borderColor: "#2563eb", transform: "translateY(-2px)" }}
                  cursor="pointer"
                  transition="all 0.2s"
                  textAlign="center"
                  onClick={() => setConnectionType("wifi")}
                  position="relative"
                >
                  <VStack spacing={3}>
                    <Box
                      p={3}
                      bg={connectionType === "wifi" ? "blue.500" : "gray.100"}
                      color={connectionType === "wifi" ? "white" : "gray.600"}
                      borderRadius="2xl"
                      shadow="sm"
                      display="inline-flex"
                      alignItems="center"
                      justifyContent="center"
                    >
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
                  bg={connectionType === "cellular" ? blueCardBg : bgCard}
                  _hover={{ borderColor: "#2563eb", transform: "translateY(-2px)" }}
                  cursor="pointer"
                  transition="all 0.2s"
                  textAlign="center"
                  onClick={() => setConnectionType("cellular")}
                >
                  <VStack spacing={3}>
                    <Box
                      p={3}
                      bg={connectionType === "cellular" ? "blue.500" : "gray.100"}
                      color={connectionType === "cellular" ? "white" : "gray.600"}
                      borderRadius="2xl"
                      shadow="sm"
                      display="inline-flex"
                      alignItems="center"
                      justifyContent="center"
                    >
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

              {/* Bottom Action & Skip Link */}
              <VStack spacing={2} pt={1}>
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
                <Button
                  variant="ghost"
                  colorScheme="blue"
                  size="sm"
                  fontSize="xs"
                  fontWeight="semibold"
                  onClick={() => setWizardStep("app_builder")}
                  _hover={{ textDecoration: "underline", bg: blueCardBg }}
                >
                  Already flashed or designing? Skip to App Builder &amp; Publish QR →
                </Button>
              </VStack>
            </VStack>
          )}

          {/* ========================================== */}
          {/* SCREEN 10: STEP 2 - DISCOVER DEVICES */}
          {/* ========================================== */}
          {wizardStep === "devices" && (
            <VStack align="stretch" spacing={5}>
              <HStack justify="space-between" align="center" flexWrap="wrap" gap={2}>
                <VStack align="start" spacing={0}>
                  <Text fontSize="lg" fontWeight="extrabold" color={textTitleColor}>
                    Select Device
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {devices.length} {devices.length === 1 ? "device" : "devices"} found
                  </Text>
                </VStack>

                <HStack spacing={3}>
                  <HStack spacing={1.5} bg={toggleBg} px={2.5} py={1} borderRadius="lg">
                    <Switch
                      size="sm"
                      colorScheme="blue"
                      isChecked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                    />
                    <Text fontSize="xs" color={textSubtle} fontWeight="semibold">
                      Auto-refresh
                    </Text>
                    {autoRefresh && (
                      <Box
                        w="6px"
                        h="6px"
                        bg="green.500"
                        borderRadius="full"
                        title="Auto-refresh active (3s polling)"
                      />
                    )}
                  </HStack>

                  <Button
                    size="xs"
                    variant="outline"
                    colorScheme="blue"
                    isLoading={isScanning}
                    leftIcon={<FaSync size={11} />}
                    onClick={() => handleRefreshDevices(false)}
                  >
                    Refresh
                  </Button>
                </HStack>
              </HStack>

              {/* Wi-Fi Direct IP Connect Toolbar */}
              {connectionType === "wifi" && (
                <Box
                  p={3.5}
                  bg={blueCardBg}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="blue.200"
                >
                  <VStack align="stretch" spacing={2.5}>
                    <HStack justify="space-between">
                      <HStack spacing={2}>
                        <FaWifi size={13} color="#2563eb" />
                        <Text fontSize="xs" fontWeight="bold" color={wifiHeaderColor}>
                          Connect Wireless ESP32-S3 via Wi-Fi IP
                        </Text>
                      </HStack>
                      <Badge colorScheme="blue" fontSize="9px">TCP Socket :8888</Badge>
                    </HStack>
                    <HStack spacing={2}>
                      <Input
                        size="sm"
                        bg="white"
                        borderRadius="lg"
                        placeholder="e.g. 192.168.1.105:8888 or 192.168.4.1:8888"
                        value={manualWifiIp}
                        onChange={(e) => setManualWifiIp(e.target.value)}
                        fontSize="xs"
                        fontFamily="monospace"
                      />
                      <Button
                        size="sm"
                        colorScheme="blue"
                        px={4}
                        fontSize="xs"
                        onClick={handleAddManualWifiDevice}
                        leftIcon={<FaBolt size={10} />}
                      >
                        Connect
                      </Button>
                    </HStack>
                  </VStack>
                </Box>
              )}

              {/* Discovered Device Cards List / Empty State */}
              {devices.length === 0 ? (
                <Box
                  p={5}
                  bg={orangeCardBg}
                  border="1px dashed"
                  borderColor={orangeBorderColor}
                  borderRadius="2xl"
                  textAlign="center"
                >
                  <VStack spacing={3}>
                    <Box p={3} bg="orange.100" color="orange.600" borderRadius="full">
                      {connectionType === "wifi" ? <FaWifi size={22} /> : <FaExclamationTriangle size={22} />}
                    </Box>
                    <VStack spacing={1}>
                      <Text fontWeight="bold" fontSize="sm" color={orangeTitleColor}>
                        {connectionType === "wifi" ? "No Wireless ESP32 Devices Discovered" : "No Serial / USB Devices Detected"}
                      </Text>
                      <Text fontSize="xs" color={textMuted} maxW="440px">
                        {connectionType === "wifi"
                          ? "Power on your ESP32-S3 with battery or wall adapter. Enter the IP above or connect to SoftAP 'InnoIDE-ESP32-S3' (IP: 192.168.4.1)."
                          : "Connect your ESP32 board to your PC via USB and click Scan for Devices."}
                      </Text>
                    </VStack>

                    <Box
                      p={3}
                      bg={checklistBg}
                      borderRadius="xl"
                      border="1px solid"
                      borderColor={checklistBorder}
                      textAlign="left"
                      w="100%"
                      maxW="440px"
                      fontSize="xs"
                      color={textSubtle}
                    >
                      <Text fontWeight="semibold" mb={1} color={textDark}>
                        {connectionType === "wifi" ? "Wireless Checklist:" : "Hardware Checklist:"}
                      </Text>
                      <VStack align="start" spacing={1}>
                        {connectionType === "wifi" ? (
                          <>
                            <Text>• <b>Initial Flash:</b> Ensure the board has been flashed once with Wi-Fi enabled firmware.</Text>
                            <Text>• <b>Power:</b> Ensure ESP32-S3 is powered via battery, power bank, or 5V USB charger.</Text>
                            <Text>• <b>Same Network:</b> Ensure laptop and ESP32 are connected to the same 2.4GHz Wi-Fi.</Text>
                          </>
                        ) : (
                          <>
                            <Text>• <b>Data Cable:</b> Verify your USB cable supports data transfer (not a power-only cable).</Text>
                            <Text>• <b>Driver:</b> Ensure CP2102, CH340, or FTDI drivers are installed if required.</Text>
                            <Text>• <b>Bootloader Mode:</b> If using native ESP32-S3 USB, hold <b>BOOT</b>, tap <b>RST</b>, then release <b>BOOT</b>.</Text>
                          </>
                        )}
                      </VStack>
                    </Box>

                    <Button
                      size="sm"
                      colorScheme="blue"
                      leftIcon={<FaSync size={12} />}
                      isLoading={isScanning}
                      onClick={() => handleRefreshDevices(false)}
                    >
                      Scan for Devices
                    </Button>
                  </VStack>
                </Box>
              ) : (
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
                        bg={isSelected ? blueCardBg : bgCard}
                        _hover={{ borderColor: isSelected ? "#2563eb" : "gray.300" }}
                        cursor="pointer"
                        transition="all 0.15s"
                        onClick={() => setSelectedDeviceId(device.id)}
                      >
                        <HStack justify="space-between">
                          <HStack spacing={3}>
                            <Box p={2.5} bg={isSelected ? "blue.500" : "gray.100"} color={isSelected ? "white" : "gray.600"} borderRadius="xl" position="relative">
                              {connectionType === "usb" ? (
                                <FaUsb size={16} />
                              ) : connectionType === "wifi" ? (
                                <FaWifi size={16} />
                              ) : (
                                <FaBroadcastTower size={16} />
                              )}
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
                            <VStack align="start" spacing={0.5}>
                              <HStack spacing={2} align="center" flexWrap="wrap">
                                <Text fontWeight="extrabold" fontSize="sm">
                                  {device.chipName || device.name}
                                </Text>
                                <Badge colorScheme={device.isUsb ? "green" : (device.isNetwork ? "blue" : "gray")} fontSize="10px" borderRadius="md" px={1.5}>
                                  {device.port}
                                </Badge>
                                {device.chip && (
                                  <Badge colorScheme="purple" fontSize="9px" borderRadius="md" px={1.5}>
                                    {device.chip.toUpperCase()}
                                  </Badge>
                                )}
                              </HStack>
                              <Text fontSize="11px" color="gray.500">
                                {device.manufacturer || device.ip} {device.vendorId ? `(VID: ${device.vendorId}, PID: ${device.productId})` : ""}
                              </Text>
                              <Text fontSize="10px" color="gray.400">
                                Port: {device.port} • {device.isUsb ? "USB Serial Interface" : (device.isBluetooth ? "Bluetooth Serial" : (device.isNetwork ? "Wi-Fi Network" : "Standard Serial"))}
                              </Text>
                            </VStack>
                          </HStack>

                          <HStack spacing={3}>
                            <Box color="green.600">
                              <FaWifi size={13} />
                            </Box>

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
              )}

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
                  isDisabled={!selectedDevice || devices.length === 0}
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
              <Text fontSize="lg" fontWeight="extrabold" color={textTitleColor}>
                Compatibility Check
              </Text>

              {/* Pill items for validation checklist */}
              <VStack align="stretch" spacing={2.5}>
                {compatibilityChecks.map((item) => (
                  <HStack
                    key={item.id}
                    p={3}
                    bg={graySubtleBg}
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
                      ) : item.status === "fail" ? (
                        <Box color="red.500">
                          <FaTimes size={16} />
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
                      <Badge colorScheme={item.status === "pass" ? "green" : item.status === "fail" ? "red" : "orange"} fontSize="10px" borderRadius="md" px={2}>
                        {item.value}
                      </Badge>
                    )}
                  </HStack>
                ))}
              </VStack>

              {/* Status Summary Banner */}
              {selectedDevice ? (
                <HStack p={3.5} bg="green.50" borderRadius="xl" border="1px solid" borderColor="green.200" spacing={2.5}>
                  <Box color="green.600">
                    <FaCheckCircle size={18} />
                  </Box>
                  <Text fontSize="xs" fontWeight="bold" color="green.800">
                    Hardware check passed: {selectedDevice.chipName || selectedDevice.name} on {selectedDevice.port} is ready for flash.
                  </Text>
                </HStack>
              ) : (
                <HStack p={3.5} bg="red.50" borderRadius="xl" border="1px solid" borderColor="red.200" spacing={2.5}>
                  <Box color="red.600">
                    <FaExclamationTriangle size={18} />
                  </Box>
                  <Text fontSize="xs" fontWeight="bold" color="red.800">
                    No device connected. Please go back and connect an ESP32 hardware device.
                  </Text>
                </HStack>
              )}

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
                  isDisabled={!selectedDevice}
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
              <Text fontSize="lg" fontWeight="extrabold" color={textTitleColor}>
                Flashing Firmware
              </Text>

              {/* Central Animated Circular Progress Ring */}
              <Box display="flex" flexDirection="column" alignItems="center" py={4}>
                <Box position="relative" w="140px" h="140px" display="flex" alignItems="center" justifyContent="center">
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
                  <Text color="gray.500">{"// Terminal initializing..."}</Text>
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

      {/* ========================================== */}
      {/* ESP-IDF SETUP PROMPT MODAL */}
      {/* ========================================== */}
      <EspIdfSetupModal
        isOpen={isIdfPromptOpen}
        onClose={() => setIsIdfPromptOpen(false)}
        onContinue={() => setIsIdfPromptOpen(false)}
      />
    </Box>
  );
}
