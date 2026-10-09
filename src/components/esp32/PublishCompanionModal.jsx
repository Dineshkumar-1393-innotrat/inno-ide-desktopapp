/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Badge,
  Switch,
  Grid,
  useColorModeValue,
  useToast
} from "@chakra-ui/react";
import {
  FaRocket,
  FaCogs,
  FaGlobe,
  FaWifi,
  FaSync,
  FaCopy,
  FaExternalLinkAlt,
  FaLightbulb,
  FaCode,
  FaDownload,
  FaFileCode,
  FaSave,
  FaChevronRight,
  FaShareAlt,
  FaImage,
  FaWhatsapp
} from "react-icons/fa";
import SafeQRCode from "./SafeQRCode.jsx";
import ShareQrModal from "./ShareQrModal.jsx";
import {
  getQrSvgElement,
  copyQrImageToClipboard,
  downloadQrImagePng,
  buildShareMessage,
  openSocialShare
} from "./qrShareUtils.js";

export default function PublishCompanionModal({
  isOpen,
  onClose,
  projectName,
  borderColor,
  bgCard,
  qrPayloadMode,
  setQrPayloadMode,
  companionNetworkMode,
  widgets = [],
  logicBlocks = [],
  cleanUiList = [],
  cleanLogicsList = [],
  remoteTunnelState = {},
  handleToggleCloudRemote,
  activeQrPayload = "",
  webAppQrPayload = "",
  liveLedToggle,
  setLiveLedToggle,
  handleToggleHardwareLed,
  activePort,
  ledHardwareError,
  handleExportExpoZip,
  expoSdkVersion,
  handleOpenExpoSnack,
  handleCopyAppJsCode,
  handleExportHtmlWebApp,
  isCloudActive,
  resolvedHostIp,
  resolvedHostPort,
  effectiveDeviceId,
  effectiveDeviceName,
  effectiveDeviceType
}) {
  const toast = useToast();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isShareExpanded, setIsShareExpanded] = useState(false);
  const [isQuickCopying, setIsQuickCopying] = useState(false);
  const [isQuickSaving, setIsQuickSaving] = useState(false);

  const inputBg = useColorModeValue("gray.50", "gray.800");
  const cardBg = useColorModeValue("white", "gray.850");
  const borderCard = useColorModeValue("gray.200", "gray.700");
  const urlBoxBg = useColorModeValue("gray.50", "gray.900");
  const urlBoxBorder = useColorModeValue("gray.200", "gray.750");
  const urlTextColor = useColorModeValue("gray.800", "gray.100");

  const isCloud = companionNetworkMode === "cloud" || isCloudActive;
  const currentModeLabel = qrPayloadMode === "bundle"
    ? "UI & Logics Bundle"
    : isCloud ? "Cloud Remote (4G/5G Accessible)" : "Local Wi-Fi Network";

  const handleQuickCopyImage = async () => {
    try {
      setIsQuickCopying(true);
      const svg = getQrSvgElement("publish-companion-qr-container");
      if (!svg) throw new Error("QR Code preview not found");

      await copyQrImageToClipboard({
        svgElement: svg,
        projectName,
        modeLabel: currentModeLabel,
        detailText: qrPayloadMode === "bundle" ? `${widgets.length} UI • ${logicBlocks.length} Rules` : (webAppQrPayload || activeQrPayload)
      });

      toast({
        title: "QR Image Copied!",
        description: "Paste (Ctrl+V) directly into WhatsApp, Slack, Teams, or documents.",
        status: "success",
        duration: 2500
      });
    } catch (err) {
      toast({
        title: "Could not copy image",
        description: err.message || "Clipboard image copying not supported.",
        status: "warning",
        duration: 3000
      });
    } finally {
      setIsQuickCopying(false);
    }
  };

  const handleQuickDownloadPng = async () => {
    try {
      setIsQuickSaving(true);
      const svg = getQrSvgElement("publish-companion-qr-container");
      if (!svg) throw new Error("QR Code preview not found");

      await downloadQrImagePng({
        svgElement: svg,
        projectName,
        modeLabel: currentModeLabel,
        detailText: qrPayloadMode === "bundle" ? `${widgets.length} UI • ${logicBlocks.length} Rules` : (webAppQrPayload || activeQrPayload)
      });

      toast({
        title: "QR Image Downloaded",
        description: "Saved high-resolution PNG image to your downloads.",
        status: "success",
        duration: 2500
      });
    } catch (err) {
      toast({
        title: "Download failed",
        description: err.message,
        status: "error",
        duration: 2500
      });
    } finally {
      setIsQuickSaving(false);
    }
  };

  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      isCentered
      scrollBehavior="inside"
    >
      <ModalOverlay backdropFilter="blur(6px)" bg="blackAlpha.700" />
      <ModalContent
        maxW={{ base: "95vw", md: "880px", lg: "940px" }}
        maxH="92vh"
        borderRadius="2xl"
        overflow="hidden"
        p={0}
        bg={bgCard}
        boxShadow="0 25px 60px -15px rgba(0, 0, 0, 0.5)"
      >
        {/* Modal Header */}
        <ModalHeader p={5} borderBottom="1px" borderColor={borderColor}>
          <HStack spacing={3}>
            <Box p={2.5} bg="pink.50" color="pink.500" borderRadius="xl">
              <FaRocket size={18} />
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontWeight="extrabold" fontSize="lg">
                Publish Companion App
              </Text>
              <Text fontSize="xs" color="gray.500">
                {projectName}
              </Text>
            </VStack>
          </HStack>
          <ModalCloseButton top={5} right={5} />
        </ModalHeader>

        <ModalBody p={{ base: 4, md: 6 }} overflowY="auto">
          <Grid templateColumns={{ base: "1fr", md: "1.05fr 0.95fr" }} gap={6} alignItems="start">
            {/* Left Column: QR Code & Companion App Scanner — Scanner-Style Dark Theme */}
            <VStack align="stretch" spacing={4}>
              <Box
                p={0}
                bg="#0F172A"
                borderRadius="2xl"
                overflow="hidden"
                border="1px solid"
                borderColor="rgba(34,211,238,0.25)"
                textAlign="center"
                position="relative"
                boxShadow="0 0 40px rgba(34,211,238,0.08), inset 0 1px 0 rgba(255,255,255,0.03)"
              >
                {/* Top bar */}
                <Box bg="rgba(34,211,238,0.08)" px={4} py={2.5} borderBottom="1px solid" borderColor="rgba(34,211,238,0.15)">
                  <HStack justify="space-between" align="center">
                    <HStack spacing={2}>
                      <Box
                        px={2.5}
                        py={1}
                        bg={qrPayloadMode === "bundle" ? "rgba(168,85,247,0.2)" : (companionNetworkMode === "cloud" ? "rgba(168,85,247,0.2)" : "rgba(34,211,238,0.15)")}
                        borderRadius="full"
                        border="1px solid"
                        borderColor={qrPayloadMode === "bundle" ? "rgba(168,85,247,0.4)" : (companionNetworkMode === "cloud" ? "rgba(168,85,247,0.4)" : "rgba(34,211,238,0.3)")}
                      >
                        <Text fontSize="9px" fontWeight="800" color={qrPayloadMode === "bundle" ? "#C084FC" : (companionNetworkMode === "cloud" ? "#C084FC" : "#22D3EE")} letterSpacing="wider">
                          ● {qrPayloadMode === "bundle" ? "UI & LOGICS BUNDLE QR" : (companionNetworkMode === "cloud" ? "CLOUD REMOTE QR" : "COMPANION WEB APP QR")}
                        </Text>
                      </Box>
                    </HStack>
                    <Badge colorScheme={qrPayloadMode === "bundle" ? "purple" : (companionNetworkMode === "cloud" ? "purple" : "green")} variant="solid" bg={qrPayloadMode === "bundle" ? "#7C3AED" : (companionNetworkMode === "cloud" ? "#7C3AED" : "#059669")} color="white" fontSize="9px" px={2.5} py={0.5} borderRadius="full">
                      {qrPayloadMode === "bundle" ? `${widgets.length} UI • ${logicBlocks.length} LOGICS` : (companionNetworkMode === "cloud" ? "INTERNET & 4G/5G" : "LOCAL WI-FI")}
                    </Badge>
                  </HStack>
                </Box>

                {/* QR Payload Type Switcher: UI & Logics Bundle vs Web App URL */}
                <Box px={4} pt={3}>
                  <HStack bg="#0B1120" p={1} borderRadius="xl" border="1px solid" borderColor="rgba(56,189,248,0.2)" spacing={1.5}>
                    <Button
                      flex={1}
                      size="xs"
                      height="32px"
                      borderRadius="lg"
                      fontWeight="700"
                      fontSize="11px"
                      leftIcon={<FaCogs size={12} />}
                      variant={qrPayloadMode === "bundle" ? "solid" : "ghost"}
                      color={qrPayloadMode === "bundle" ? "white" : "gray.400"}
                      bg={qrPayloadMode === "bundle" ? "#8B5CF6" : "transparent"}
                      _hover={{ bg: qrPayloadMode === "bundle" ? "#7C3AED" : "whiteAlpha.100" }}
                      onClick={() => setQrPayloadMode("bundle")}
                    >
                      UI &amp; Logics Bundle
                    </Button>
                    <Button
                      flex={1}
                      size="xs"
                      height="32px"
                      borderRadius="lg"
                      fontWeight="700"
                      fontSize="11px"
                      leftIcon={<FaGlobe size={12} />}
                      variant={qrPayloadMode === "webapp" ? "solid" : "ghost"}
                      color={qrPayloadMode === "webapp" ? "gray.900" : "gray.400"}
                      bg={qrPayloadMode === "webapp" ? "#22D3EE" : "transparent"}
                      _hover={{ bg: qrPayloadMode === "webapp" ? "#06B6D4" : "whiteAlpha.100" }}
                      onClick={() => setQrPayloadMode("webapp")}
                    >
                      Web App URL
                    </Button>
                  </HStack>
                </Box>

                {/* Network Mode Switcher: Local Wi-Fi vs Cloud Remote (Mobile 4G/5G / WAN) */}
                <Box px={4} pt={2}>
                  <HStack bg="#0B1120" p={1} borderRadius="xl" border="1px solid" borderColor="rgba(56,189,248,0.15)" spacing={1.5}>
                    <Button
                      flex={1}
                      size="xs"
                      height="28px"
                      borderRadius="lg"
                      fontWeight="600"
                      fontSize="10px"
                      leftIcon={<FaWifi size={11} />}
                      variant={companionNetworkMode === "local" ? "solid" : "ghost"}
                      color={companionNetworkMode === "local" ? "gray.900" : "gray.400"}
                      bg={companionNetworkMode === "local" ? "#22D3EE" : "transparent"}
                      _hover={{ bg: companionNetworkMode === "local" ? "#06B6D4" : "whiteAlpha.100" }}
                      onClick={() => handleToggleCloudRemote(false)}
                    >
                      Local Wi-Fi
                    </Button>
                    <Button
                      flex={1}
                      size="xs"
                      height="28px"
                      borderRadius="lg"
                      fontWeight="600"
                      fontSize="10px"
                      isLoading={remoteTunnelState.loading}
                      loadingText="Connecting..."
                      leftIcon={<FaGlobe size={11} />}
                      variant={companionNetworkMode === "cloud" ? "solid" : "ghost"}
                      color={companionNetworkMode === "cloud" ? "white" : "gray.400"}
                      bg={companionNetworkMode === "cloud" ? "#8B5CF6" : "transparent"}
                      _hover={{ bg: companionNetworkMode === "cloud" ? "#7C3AED" : "whiteAlpha.100" }}
                      onClick={() => handleToggleCloudRemote(true, companionNetworkMode === "cloud")}
                    >
                      Cloud Remote (4G/5G)
                    </Button>
                  </HStack>
                </Box>

                {/* QR Payload Info Banner */}
                <Box px={4} pt={2}>
                  <HStack bg="#090D16" p={2.5} borderRadius="xl" border="1px solid" borderColor={qrPayloadMode === "bundle" ? "rgba(168,85,247,0.3)" : (companionNetworkMode === "cloud" ? "rgba(168,85,247,0.3)" : "rgba(34,211,238,0.2)")} justify="space-between">
                    <HStack spacing={2} px={1} overflow="hidden">
                      <Badge
                        colorScheme={qrPayloadMode === "bundle" ? "purple" : (companionNetworkMode === "cloud" ? "purple" : "green")}
                        fontSize="9px"
                        px={2}
                        py={0.5}
                        borderRadius="md"
                      >
                        {qrPayloadMode === "bundle"
                          ? "📦 UI + LOGICS BUNDLE"
                          : (companionNetworkMode === "cloud" ? "🌐 HTTPS RELAY" : "📶 SAME NETWORK")}
                      </Badge>
                      <Text fontSize="11px" color="#94A3B8" fontWeight="medium" noOfLines={1}>
                        {qrPayloadMode === "bundle"
                          ? `Contains ${widgets.length} UI components & ${logicBlocks.length} automation rules`
                          : (companionNetworkMode === "cloud"
                            ? "Works on 4G, 5G cellular data & remote networks"
                            : "Devices must be on same local Wi-Fi router")}
                      </Text>
                    </HStack>
                    <Badge variant="outline" colorScheme={qrPayloadMode === "bundle" ? "purple" : "cyan"} fontSize="9px" px={1.5} py={0.5}>
                      ⚡ MULTI-DEVICE SYNC
                    </Badge>
                  </HStack>
                </Box>

                {/* QR Title & Scanner Hint */}
                <Text fontSize="12px" fontWeight="700" color="#E2E8F0" letterSpacing="wide" mt={2.5} mb={0.5}>
                  {qrPayloadMode === "bundle"
                    ? `SCAN TO IMPORT UI & LOGICS (${widgets.length} COMPONENTS, ${logicBlocks.length} RULES)`
                    : (companionNetworkMode === "cloud" ? "SCAN FROM ANY PHONE / ANY NETWORK" : "SCAN WITH ANY PHONE CAMERA")}
                </Text>
                <Text fontSize="10px" color="#94A3B8" mb={2} px={4}>
                  {qrPayloadMode === "bundle"
                    ? "Point your smartphone camera or companion app scanner at this QR code. Encodes all UI widgets, actions, and logic rules directly into the QR code."
                    : (companionNetworkMode === "cloud"
                      ? "Point your smartphone camera at this QR code. Works instantly across mobile 4G/5G networks and remote internet without shared Wi-Fi."
                      : "Point your smartphone camera at this QR code to launch companion controls on your local network.")}
                </Text>

                {/* Cloud Relay Status Banner */}
                {companionNetworkMode === "cloud" && (
                  <Box px={4} pb={2}>
                    {!remoteTunnelState.active || remoteTunnelState.error ? (
                      <HStack bg="rgba(239,68,68,0.12)" p={2} borderRadius="xl" border="1px solid" borderColor="rgba(239,68,68,0.3)" justify="space-between">
                        <HStack spacing={2} overflow="hidden">
                          <Text fontSize="13px">⚠️</Text>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="10px" fontWeight="700" color="red.300">
                              Cloud Tunnel Disconnected (Old URL Expired)
                            </Text>
                            <Text fontSize="9px" color="gray.400" noOfLines={1}>
                              SSH session closed. Tap Reconnect to generate a live link.
                            </Text>
                          </VStack>
                        </HStack>
                        <Button
                          size="xs"
                          colorScheme="red"
                          height="22px"
                          fontSize="10px"
                          px={2.5}
                          isLoading={remoteTunnelState.loading}
                          leftIcon={<FaSync size={9} />}
                          onClick={() => handleToggleCloudRemote(true, true)}
                        >
                          Reconnect
                        </Button>
                      </HStack>
                    ) : (
                      <HStack bg="rgba(34,197,94,0.1)" p={2} borderRadius="xl" border="1px solid" borderColor="rgba(34,197,94,0.25)" justify="space-between">
                        <HStack spacing={2} overflow="hidden">
                          <Box w="7px" h="7px" borderRadius="full" bg="#22C55E" />
                          <Text fontSize="10px" fontWeight="700" color="#4ADE80" noOfLines={1}>
                            Live Cloud Relay Active • 4G/5G Accessible
                          </Text>
                        </HStack>
                        <Badge colorScheme="green" fontSize="9px" px={1.5} py={0.5}>
                          ONLINE
                        </Badge>
                      </HStack>
                    )}
                  </Box>
                )}

                {/* QR Code Scanner Frame */}
                <Box display="flex" justifyContent="center" alignItems="center" pb={3} px={4}>
                  <Box position="relative" display="inline-block">
                    <Box
                      position="relative"
                      p="16px"
                      borderRadius="20px"
                      border={`3px solid ${qrPayloadMode === "bundle" || companionNetworkMode === "cloud" ? "#A855F7" : "#22D3EE"}`}
                      bg={qrPayloadMode === "bundle" || companionNetworkMode === "cloud" ? "rgba(168,85,247,0.03)" : "rgba(34,211,238,0.03)"}
                      boxShadow={qrPayloadMode === "bundle" || companionNetworkMode === "cloud" ? "0 0 30px rgba(168,85,247,0.15)" : "0 0 30px rgba(34,211,238,0.12)"}
                    >
                      <Box position="absolute" top="-2px" left="-2px" w="20px" h="20px" borderTop={`4px solid ${qrPayloadMode === "bundle" || companionNetworkMode === "cloud" ? "#A855F7" : "#22D3EE"}`} borderLeft={`4px solid ${qrPayloadMode === "bundle" || companionNetworkMode === "cloud" ? "#A855F7" : "#22D3EE"}`} borderTopLeftRadius="12px" />
                      <Box position="absolute" top="-2px" right="-2px" w="20px" h="20px" borderTop={`4px solid ${qrPayloadMode === "bundle" || companionNetworkMode === "cloud" ? "#A855F7" : "#22D3EE"}`} borderRight={`4px solid ${qrPayloadMode === "bundle" || companionNetworkMode === "cloud" ? "#A855F7" : "#22D3EE"}`} borderTopRightRadius="12px" />
                      <Box position="absolute" bottom="-2px" left="-2px" w="20px" h="20px" borderBottom={`4px solid ${qrPayloadMode === "bundle" || companionNetworkMode === "cloud" ? "#A855F7" : "#22D3EE"}`} borderLeft={`4px solid ${qrPayloadMode === "bundle" || companionNetworkMode === "cloud" ? "#A855F7" : "#22D3EE"}`} borderBottomLeftRadius="12px" />
                      <Box position="absolute" bottom="-2px" right="-2px" w="20px" h="20px" borderBottom={`4px solid ${qrPayloadMode === "bundle" || companionNetworkMode === "cloud" ? "#A855F7" : "#22D3EE"}`} borderRight={`4px solid ${qrPayloadMode === "bundle" || companionNetworkMode === "cloud" ? "#A855F7" : "#22D3EE"}`} borderBottomRightRadius="12px" />

                      <Box id="publish-companion-qr-container" bg="white" borderRadius="16px" p={3} position="relative" zIndex={1} minW="240px" minH="240px" display="flex" alignItems="center" justifyContent="center">
                        <SafeQRCode
                          value={activeQrPayload}
                          size={240}
                          level="L"
                          includeMargin={true}
                          bgColor="#ffffff"
                          fgColor="#000000"
                          style={{ display: "block" }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* QR Quick Action Bar (Share, Copy Image, Download PNG) */}
                <Box px={4} pb={2}>
                  <HStack
                    bg="#080E1A"
                    p={1.5}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="rgba(255,255,255,0.08)"
                    justify="center"
                    spacing={2}
                  >
                    <Button
                      size="xs"
                      colorScheme="teal"
                      bg={isShareExpanded ? "#059669" : (qrPayloadMode === "bundle" || companionNetworkMode === "cloud" ? "#8B5CF6" : "#06B6D4")}
                      color="white"
                      _hover={{ bg: isShareExpanded ? "#047857" : (qrPayloadMode === "bundle" || companionNetworkMode === "cloud" ? "#7C3AED" : "#0891B2") }}
                      h="28px"
                      px={3}
                      borderRadius="lg"
                      fontWeight="700"
                      fontSize="11px"
                      leftIcon={<FaShareAlt size={11} />}
                      onClick={() => setIsShareExpanded((prev) => !prev)}
                    >
                      {isShareExpanded ? "Hide Share" : "Share QR..."}
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      colorScheme="purple"
                      borderColor="rgba(168,85,247,0.4)"
                      color="#C084FC"
                      _hover={{ bg: "rgba(168,85,247,0.15)" }}
                      h="28px"
                      px={2.5}
                      borderRadius="lg"
                      fontWeight="600"
                      fontSize="11px"
                      isLoading={isQuickCopying}
                      leftIcon={<FaImage size={11} />}
                      onClick={handleQuickCopyImage}
                      title="Copy QR Code image as PNG to clipboard"
                    >
                      Copy Image
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      colorScheme="cyan"
                      borderColor="rgba(34,211,238,0.4)"
                      color="#22D3EE"
                      _hover={{ bg: "rgba(34,211,238,0.15)" }}
                      h="28px"
                      px={2.5}
                      borderRadius="lg"
                      fontWeight="600"
                      fontSize="11px"
                      isLoading={isQuickSaving}
                      leftIcon={<FaDownload size={10} />}
                      onClick={handleQuickDownloadPng}
                      title="Download branded QR Code image (PNG)"
                    >
                      Save PNG
                    </Button>
                  </HStack>
                </Box>

                {/* Inline Share Options Hub (Direct 1-Click sharing without modal overlay) */}
                {isShareExpanded && (
                  <Box px={4} pb={2}>
                    <Box
                      p={3}
                      borderRadius="xl"
                      bg="#070D18"
                      border="1px solid"
                      borderColor={qrPayloadMode === "bundle" || companionNetworkMode === "cloud" ? "rgba(168,85,247,0.35)" : "rgba(34,211,238,0.35)"}
                      boxShadow="0 4px 20px rgba(0,0,0,0.3)"
                    >
                      <HStack justify="space-between" mb={2}>
                        <HStack spacing={1.5}>
                          <Text fontSize="12px">📤</Text>
                          <Text fontSize="11px" fontWeight="bold" color="#E2E8F0">
                            Quick Share Channels
                          </Text>
                        </HStack>
                        <HStack spacing={1.5}>
                          <Button
                            size="xs"
                            variant="link"
                            colorScheme="purple"
                            fontSize="10px"
                            onClick={() => setIsShareModalOpen(true)}
                          >
                            Full Dialog ↗
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            colorScheme="gray"
                            h="20px"
                            fontSize="10px"
                            onClick={() => setIsShareExpanded(false)}
                          >
                            ✕
                          </Button>
                        </HStack>
                      </HStack>

                      {/* WhatsApp Direct Share */}
                      <Button
                        size="xs"
                        h="32px"
                        w="100%"
                        mb={2}
                        bg="rgba(37,211,102,0.18)"
                        color="#25D366"
                        _hover={{ bg: "rgba(37,211,102,0.3)" }}
                        border="1px solid rgba(37,211,102,0.35)"
                        leftIcon={<FaWhatsapp size={14} />}
                        fontWeight="bold"
                        fontSize="11px"
                        onClick={() => {
                          openSocialShare("whatsapp", {
                            shareText: buildShareMessage({
                              projectName,
                              qrPayloadMode,
                              companionNetworkMode,
                              activeQrPayload,
                              webAppQrPayload,
                              widgetsCount: widgets.length,
                              rulesCount: logicBlocks.length
                            }),
                            shareUrl: qrPayloadMode === "bundle" ? "" : (webAppQrPayload || activeQrPayload),
                            projectName
                          });
                          toast({ title: "Opening WhatsApp...", status: "info", duration: 1500 });
                        }}
                      >
                        Share via WhatsApp
                      </Button>

                      {/* Secondary Quick Actions */}
                      <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                        <Button
                          size="xs"
                          h="26px"
                          variant="outline"
                          colorScheme="purple"
                          borderColor="rgba(168,85,247,0.4)"
                          color="#C084FC"
                          fontSize="10px"
                          leftIcon={<FaImage size={10} />}
                          isLoading={isQuickCopying}
                          onClick={handleQuickCopyImage}
                        >
                          Copy Image
                        </Button>
                        <Button
                          size="xs"
                          h="26px"
                          variant="outline"
                          colorScheme="cyan"
                          borderColor="rgba(34,211,238,0.4)"
                          color="#22D3EE"
                          fontSize="10px"
                          leftIcon={<FaDownload size={10} />}
                          isLoading={isQuickSaving}
                          onClick={handleQuickDownloadPng}
                        >
                          Save PNG
                        </Button>
                        <Button
                          size="xs"
                          h="26px"
                          variant="outline"
                          colorScheme="teal"
                          borderColor="rgba(20,184,166,0.4)"
                          color="#2DD4BF"
                          fontSize="10px"
                          leftIcon={<FaCopy size={10} />}
                          onClick={() => {
                            const msg = buildShareMessage({
                              projectName,
                              qrPayloadMode,
                              companionNetworkMode,
                              activeQrPayload,
                              webAppQrPayload,
                              widgetsCount: widgets.length,
                              rulesCount: logicBlocks.length
                            });
                            navigator.clipboard.writeText(msg);
                            toast({ title: "Share Message Copied", status: "success", duration: 2000 });
                          }}
                        >
                          Copy Msg
                        </Button>
                      </Grid>
                    </Box>
                  </Box>
                )}

                {/* Google Lens / Camera Guidance Notice */}
                {qrPayloadMode === "bundle" ? (
                  <Box px={4} pb={2}>
                    <HStack bg="rgba(56,189,248,0.08)" border="1px solid" borderColor="rgba(56,189,248,0.25)" borderRadius="xl" p={2.5} justify="space-between">
                      <HStack spacing={2} overflow="hidden">
                        <Text fontSize="13px">🔍</Text>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="10px" fontWeight="700" color="#38BDF8">
                            Scanning with Google Lens or Phone Camera?
                          </Text>
                          <Text fontSize="9px" color="#94A3B8" noOfLines={1}>
                            Switch to &quot;Web App URL&quot; above to open the full UI &amp; logic in Chrome/Safari.
                          </Text>
                        </VStack>
                      </HStack>
                      <Button size="xs" colorScheme="cyan" height="24px" fontSize="10px" px={2.5} onClick={() => setQrPayloadMode("webapp")}>
                        Switch
                      </Button>
                    </HStack>
                  </Box>
                ) : (
                  <Box px={4} pb={2}>
                    <HStack bg="rgba(34,197,94,0.08)" border="1px solid" borderColor="rgba(34,197,94,0.25)" borderRadius="xl" p={2} justify="space-between">
                      <HStack spacing={2} overflow="hidden">
                        <Text fontSize="12px">✅</Text>
                        <Text fontSize="10px" fontWeight="600" color="#4ADE80" noOfLines={1}>
                          100% compatible with Google Lens, iPhone Camera &amp; Chrome/Safari
                        </Text>
                      </HStack>
                    </HStack>
                  </Box>
                )}

                {/* QR Payload Box with Copy & Open Buttons */}
                <Box px={4} pb={4} pt={1}>
                  <HStack justify="space-between" mb={1.5}>
                    <Text fontSize="11px" fontWeight="semibold" color="gray.400" textAlign="left">
                      {qrPayloadMode === "bundle" ? "Project Payload (UI + Logics JSON)" : "Web App URL"}
                    </Text>
                    <HStack spacing={1}>
                      <Badge colorScheme={qrPayloadMode === "bundle" ? "purple" : (companionNetworkMode === "cloud" ? "purple" : "cyan")} fontSize="9px">
                        {qrPayloadMode === "bundle" ? `${widgets.length} UI • ${logicBlocks.length} Logics` : (companionNetworkMode === "cloud" ? (remoteTunnelState.provider || "HTTPS") : "Local Wi-Fi")}
                      </Badge>
                      <Text fontSize="10px" color={qrPayloadMode === "bundle" || companionNetworkMode === "cloud" ? "purple.300" : "cyan.400"} fontFamily="monospace">
                        {qrPayloadMode === "bundle" ? "Full Bundle Schema" : (companionNetworkMode === "cloud" ? "Public Cloud Relay (4G/5G)" : "Local Wi-Fi Companion")}
                      </Text>
                    </HStack>
                  </HStack>
                  <VStack
                    align="stretch"
                    spacing={2.5}
                    bg={cardBg}
                    p={2.5}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor={borderCard}
                    shadow="sm"
                  >
                    {/* URL Input Box */}
                    <HStack
                      bg={urlBoxBg}
                      px={3}
                      py={1.5}
                      borderRadius="lg"
                      border="1px solid"
                      borderColor={urlBoxBorder}
                      spacing={2}
                    >
                      <Input
                        value={activeQrPayload}
                        isReadOnly
                        fontSize="xs"
                        variant="unstyled"
                        fontFamily="monospace"
                        color={urlTextColor}
                        fontWeight="600"
                        p={0}
                        h="24px"
                        border="none"
                        outline="none"
                        _focus={{ border: "none", boxShadow: "none" }}
                      />
                    </HStack>

                    {/* Action Buttons Row — Cleanly aligned without overlap */}
                    <Flex justify="space-between" align="center" gap={2} flexWrap="wrap">
                      <Box>
                        {companionNetworkMode === "cloud" && (
                          <Button
                            size="xs"
                            colorScheme="purple"
                            variant="outline"
                            h="28px"
                            px={3}
                            borderRadius="lg"
                            fontWeight="600"
                            fontSize="11px"
                            flexShrink={0}
                            isLoading={remoteTunnelState.loading}
                            loadingText="Reconnecting..."
                            leftIcon={<FaSync size={10} />}
                            onClick={() => handleToggleCloudRemote(true, true)}
                            title="Generate a fresh live HTTPS tunnel"
                          >
                            Refresh Tunnel
                          </Button>
                        )}
                      </Box>

                      <HStack spacing={2} flexShrink={0}>
                        <Button
                          size="xs"
                          colorScheme="teal"
                          bg={isShareExpanded ? "#059669" : (qrPayloadMode === "bundle" || companionNetworkMode === "cloud" ? "#8B5CF6" : "#06B6D4")}
                          color="white"
                          _hover={{ bg: isShareExpanded ? "#047857" : (qrPayloadMode === "bundle" || companionNetworkMode === "cloud" ? "#7C3AED" : "#0891B2") }}
                          h="28px"
                          px={3}
                          borderRadius="lg"
                          fontWeight="bold"
                          fontSize="11px"
                          flexShrink={0}
                          leftIcon={<FaShareAlt size={11} />}
                          onClick={() => setIsShareExpanded((prev) => !prev)}
                          title="Toggle Quick Share Channels"
                        >
                          {isShareExpanded ? "Share ▾" : "Share"}
                        </Button>
                        <Button
                          size="xs"
                          colorScheme={qrPayloadMode === "bundle" || companionNetworkMode === "cloud" ? "purple" : "cyan"}
                          h="28px"
                          px={3.5}
                          borderRadius="lg"
                          fontWeight="bold"
                          fontSize="11px"
                          flexShrink={0}
                          leftIcon={<FaCopy size={11} />}
                          onClick={() => {
                            navigator.clipboard.writeText(activeQrPayload);
                            toast({
                              title: qrPayloadMode === "bundle" ? "Copied UI & Logics Schema" : "Copied URL to Clipboard",
                              description: qrPayloadMode === "bundle"
                                ? `JSON schema containing ${widgets.length} widgets and ${logicBlocks.length} logic rules copied.`
                                : `${activeQrPayload} copied.`,
                              status: "success",
                              duration: 2000
                            });
                          }}
                        >
                          Copy
                        </Button>
                        {qrPayloadMode === "webapp" && (
                          <Button
                            size="xs"
                            colorScheme="blue"
                            h="28px"
                            px={3.5}
                            borderRadius="lg"
                            fontWeight="bold"
                            fontSize="11px"
                            flexShrink={0}
                            leftIcon={<FaExternalLinkAlt size={10} />}
                            onClick={() => {
                              window.open(webAppQrPayload, "_blank");
                            }}
                          >
                            Open
                          </Button>
                        )}
                      </HStack>
                    </Flex>
                  </VStack>
                </Box>
              </Box>
            </VStack>

            {/* Right Column: Hardware Test & Export Options */}
            <VStack align="stretch" spacing={3}>
              {/* Live Hardware LED Control Card */}
              <Box
                p={3.5}
                borderRadius="2xl"
                border="2px solid"
                borderColor={liveLedToggle ? "cyan.400" : "gray.300"}
                bg={liveLedToggle ? "cyan.50" : inputBg}
                shadow="sm"
                transition="all 0.2s"
              >
                <HStack justify="space-between" align="center">
                  <HStack spacing={3}>
                    <Box
                      p={2.5}
                      borderRadius="xl"
                      bg={liveLedToggle ? "cyan.500" : "gray.400"}
                      color="white"
                      shadow="sm"
                    >
                      <FaLightbulb size={18} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <HStack spacing={2}>
                        <Text fontWeight="extrabold" fontSize="xs" color={liveLedToggle ? "cyan.900" : "gray.700"}>
                          Hardware Light Test ({activePort})
                        </Text>
                        <Badge colorScheme={liveLedToggle ? "cyan" : "gray"} fontSize="9px" px={2} py={0.5} borderRadius="full">
                          {liveLedToggle ? "BLINKING (ON)" : "OFF (STOPPED)"}
                        </Badge>
                      </HStack>
                      <Text fontSize="11px" color={liveLedToggle ? "cyan.700" : "gray.500"}>
                        {liveLedToggle ? "Light is blinking. Toggle switch to turn OFF." : "Light is OFF. Toggle switch to start blinking."}
                      </Text>
                    </VStack>
                  </HStack>
                  <Switch
                    size="md"
                    colorScheme="cyan"
                    isChecked={liveLedToggle}
                    onChange={async (e) => {
                      const nextVal = e.target.checked;
                      setLiveLedToggle(nextVal);
                      await handleToggleHardwareLed(nextVal);
                    }}
                  />
                </HStack>
              </Box>

              {/* Error banner when serial write fails */}
              {ledHardwareError && (
                <Box mt={2} p={2.5} bg="red.50" border="1px solid" borderColor="red.300" borderRadius="lg">
                  <Text fontSize="10px" fontWeight="bold" color="red.700" mb={0.5}>⚠️ Hardware Unreachable</Text>
                  <Text fontSize="10px" color="red.600" mb={1.5}>
                    {ledHardwareError.includes("Access is denied") || ledHardwareError.includes("busy")
                      ? "COM port is locked. The ESP32 has old blink firmware — it must be reflashed."
                      : `Serial error: ${ledHardwareError}`}
                  </Text>
                  <Text fontSize="10px" color="red.500">
                    👉 <strong>Unplug &amp; replug the ESP32</strong>, then click <strong>Flash Firmware</strong> again to install the reactive firmware. After flashing, the toggle will work.
                  </Text>
                </Box>
              )}

              <Text fontSize="xs" fontWeight="extrabold" color="gray.500" letterSpacing="wider" mb={1}>
                Export &amp; React Native Options
              </Text>

              {/* Share Companion App & QR Code */}
              <HStack
                p={3.5}
                borderRadius="2xl"
                border="2px solid"
                borderColor="teal.300"
                bg="teal.50"
                _hover={{ borderColor: "teal.500", bg: "teal.100", transform: "translateY(-1px)" }}
                cursor="pointer"
                transition="all 0.15s"
                justify="space-between"
                shadow="sm"
                onClick={() => setIsShareModalOpen(true)}
              >
                <HStack spacing={3}>
                  <Box p={2.5} bg="teal.500" color="white" borderRadius="xl" shadow="sm">
                    <FaShareAlt size={16} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <HStack spacing={1.5}>
                      <Text fontWeight="extrabold" fontSize="xs" color="teal.950">
                        Share Companion QR &amp; App
                      </Text>
                      <Badge colorScheme="teal" fontSize="9px" px={1.5}>
                        WhatsApp • Image • Link
                      </Badge>
                    </HStack>
                    <Text fontSize="11px" color="teal.800">
                      Share QR image, WhatsApp link, or native share sheet
                    </Text>
                  </VStack>
                </HStack>
                <FaShareAlt size={13} color="#0d9488" />
              </HStack>

              {/* Option 1: Export React Native Expo Project (.zip) */}
              <HStack
                p={3.5}
                borderRadius="2xl"
                border="2px solid"
                borderColor="purple.300"
                bg="purple.50"
                _hover={{ borderColor: "purple.500", bg: "purple.100", transform: "translateY(-1px)" }}
                cursor="pointer"
                transition="all 0.15s"
                justify="space-between"
                shadow="sm"
                onClick={handleExportExpoZip}
              >
                <HStack spacing={3}>
                  <Box p={2.5} bg="purple.500" color="white" borderRadius="xl" shadow="sm">
                    <FaCode size={16} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <HStack spacing={1.5}>
                      <Text fontWeight="extrabold" fontSize="xs" color="purple.950">
                        Export React Native App (.zip)
                      </Text>
                      <Badge colorScheme="purple" fontSize="9px" px={1.5}>
                        SDK {expoSdkVersion}
                      </Badge>
                    </HStack>
                    <Text fontSize="11px" color="purple.800">
                      Includes App.js, package.json (expo ~{expoSdkVersion}), app.json
                    </Text>
                  </VStack>
                </HStack>
                <FaDownload size={14} color="#7c3aed" />
              </HStack>

              {/* Option 2: Open in Expo Snack */}
              <HStack
                p={3}
                borderRadius="2xl"
                border="1px solid"
                borderColor={borderColor}
                _hover={{ borderColor: "blue.400", bg: inputBg }}
                transition="all 0.15s"
                justify="space-between"
              >
                <HStack spacing={3} cursor="pointer" onClick={handleOpenExpoSnack} flex={1}>
                  <Box p={2.5} bg="blue.50" color="blue.500" borderRadius="xl">
                    <FaExternalLinkAlt size={14} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <HStack spacing={1.5}>
                      <Text fontWeight="bold" fontSize="xs">
                        Open in Expo Snack (Web)
                      </Text>
                      <Badge colorScheme="blue" fontSize="9px">
                        v{expoSdkVersion}
                      </Badge>
                    </HStack>
                    <Text fontSize="11px" color="gray.500">
                      Run in browser React Native simulator (SDK 54)
                    </Text>
                  </VStack>
                </HStack>
                <Button
                  size="xs"
                  colorScheme="blue"
                  variant="outline"
                  borderRadius="lg"
                  leftIcon={<FaCopy size={11} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyAppJsCode();
                  }}
                >
                  Copy App.js
                </Button>
              </HStack>

              {/* Option 3: Standalone Single-File Web App */}
              <HStack
                p={3}
                borderRadius="2xl"
                border="1px solid"
                borderColor={borderColor}
                _hover={{ borderColor: "blue.400", bg: inputBg }}
                cursor="pointer"
                transition="all 0.15s"
                justify="space-between"
                onClick={handleExportHtmlWebApp}
              >
                <HStack spacing={3}>
                  <Box p={2.5} bg="green.50" color="green.600" borderRadius="xl">
                    <FaFileCode size={15} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <HStack spacing={1.5}>
                      <Text fontWeight="bold" fontSize="xs">
                        Standalone Web App (.html)
                      </Text>
                      <Badge colorScheme="green" fontSize="9px">
                        Instant
                      </Badge>
                    </HStack>
                    <Text fontSize="11px" color="gray.500">
                      Single-file HTML runnable on any phone
                    </Text>
                  </VStack>
                </HStack>
                <FaDownload size={12} color="gray" />
              </HStack>

              {/* Option 4: Export Project Schema JSON */}
              <HStack
                p={3}
                borderRadius="2xl"
                border="1px solid"
                borderColor={borderColor}
                _hover={{ borderColor: "blue.400", bg: inputBg }}
                cursor="pointer"
                transition="all 0.15s"
                justify="space-between"
                onClick={() => {
                  const bridgeBaseUrl = isCloudActive ? remoteTunnelState.url : `http://${resolvedHostIp}:${resolvedHostPort}`;
                  const exportObj = {
                    projectName,
                    id: effectiveDeviceId,
                    name: effectiveDeviceName,
                    deviceType: effectiveDeviceType,
                    port: activePort || "COM9",
                    serverUrl: bridgeBaseUrl,
                    bridgeUrl: `${bridgeBaseUrl}/api/action`,
                    widgets: cleanUiList,
                    rules: cleanLogicsList
                  };
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
                  const dlAnchor = document.createElement("a");
                  dlAnchor.setAttribute("href", dataStr);
                  dlAnchor.setAttribute("download", `${projectName.toLowerCase().replace(/\s+/g, "-")}-config.json`);
                  dlAnchor.click();
                  toast({ title: "Project configuration exported as JSON", status: "success", duration: 2000 });
                }}
              >
                <HStack spacing={3}>
                  <Box p={2.5} bg="orange.50" color="orange.500" borderRadius="xl">
                    <FaSave size={15} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold" fontSize="xs">
                      Export Project Schema (JSON)
                    </Text>
                    <Text fontSize="11px" color="gray.500">
                      Save UI widgets and logic rules JSON
                    </Text>
                  </VStack>
                </HStack>
                <FaChevronRight size={12} color="gray" />
              </HStack>
            </VStack>
          </Grid>
        </ModalBody>

        <ModalFooter p={5} borderTop="1px" borderColor={borderColor}>
          <Button w="100%" size="md" colorScheme="blue" borderRadius="xl" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

    {/* Share QR Code Modal */}
    <ShareQrModal
      isOpen={isShareModalOpen}
      onClose={() => setIsShareModalOpen(false)}
      projectName={projectName}
      qrPayloadMode={qrPayloadMode}
      companionNetworkMode={companionNetworkMode}
      activeQrPayload={activeQrPayload}
      webAppQrPayload={webAppQrPayload}
      widgets={widgets}
      logicBlocks={logicBlocks}
      isCloudActive={isCloudActive}
      remoteTunnelState={remoteTunnelState}
    />
    </>
  );
}
