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
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Grid,
  useToast,
  useColorModeValue,
  Divider
} from "@chakra-ui/react";
import {
  FaShareAlt,
  FaWhatsapp,
  FaCopy,
  FaDownload,
  FaImage,
  FaFileCode,
  FaLink,
  FaCheck
} from "react-icons/fa";
import SafeQRCode from "./SafeQRCode.jsx";
import {
  getQrSvgElement,
  copyQrImageToClipboard,
  downloadQrImagePng,
  downloadQrImageSvg,
  buildShareMessage,
  shareViaNativeApi,
  openSocialShare
} from "./qrShareUtils.js";

export default function ShareQrModal({
  isOpen,
  onClose,
  projectName = "Companion App",
  qrPayloadMode = "webapp",
  companionNetworkMode = "local",
  activeQrPayload = "",
  webAppQrPayload = "",
  widgets = [],
  logicBlocks = [],
  isCloudActive = false
}) {
  const toast = useToast();

  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [isDownloadingPng, setIsDownloadingPng] = useState(false);
  const [copiedKey, setCopiedKey] = useState("");

  const bgCard = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.750");
  const previewBoxBg = useColorModeValue("#F8FAFC", "#0B1120");
  const channelCardBg = useColorModeValue("gray.50", "gray.800");
  const channelCardHover = useColorModeValue("gray.100", "gray.750");

  const isBundle = qrPayloadMode === "bundle";
  const isCloud = companionNetworkMode === "cloud" || isCloudActive;

  const modeLabel = isBundle
    ? "UI & Logics Bundle"
    : isCloud
    ? "Cloud Remote (4G/5G Accessible)"
    : "Local Wi-Fi Network";

  const effectiveUrl = webAppQrPayload || activeQrPayload;

  const shareText = buildShareMessage({
    projectName,
    qrPayloadMode,
    companionNetworkMode,
    activeQrPayload,
    webAppQrPayload,
    widgetsCount: widgets.length,
    rulesCount: logicBlocks.length
  });

  const getSvg = () => {
    return (
      getQrSvgElement("share-modal-qr-container") ||
      getQrSvgElement("publish-companion-qr-container")
    );
  };

  const markCopied = (key) => {
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? "" : prev));
    }, 2000);
  };

  // Copy QR Image as PNG to Clipboard
  const handleCopyImage = async () => {
    try {
      setIsCopyingImage(true);
      const svg = getSvg();
      if (!svg) throw new Error("QR Code preview not ready");

      await copyQrImageToClipboard({
        svgElement: svg,
        projectName,
        modeLabel,
        detailText: isBundle ? `${widgets.length} UI • ${logicBlocks.length} Rules` : effectiveUrl
      });

      markCopied("image");
      toast({
        title: "QR Code Image Copied!",
        description: "Paste (Ctrl+V) directly into WhatsApp, Slack, Teams, Word, or Docs.",
        status: "success",
        duration: 3000,
        isClosable: true
      });
    } catch (err) {
      toast({
        title: "Could not copy image",
        description: err.message || "Your environment does not support clipboard images.",
        status: "warning",
        duration: 3500,
        isClosable: true
      });
    } finally {
      setIsCopyingImage(false);
    }
  };

  // Download QR Code as PNG
  const handleDownloadPng = async () => {
    try {
      setIsDownloadingPng(true);
      const svg = getSvg();
      if (!svg) throw new Error("QR Code preview not ready");

      await downloadQrImagePng({
        svgElement: svg,
        projectName,
        modeLabel,
        detailText: isBundle ? `${widgets.length} UI • ${logicBlocks.length} Rules` : effectiveUrl
      });

      toast({
        title: "QR Code Image Downloaded",
        description: "Saved branded high-resolution PNG image to your downloads.",
        status: "success",
        duration: 2500,
        isClosable: true
      });
    } catch (err) {
      toast({
        title: "Download Failed",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } finally {
      setIsDownloadingPng(false);
    }
  };

  // Download QR Code as SVG
  const handleDownloadSvg = () => {
    try {
      const svg = getSvg();
      if (!svg) throw new Error("QR Code preview not ready");
      const safeName = (projectName || "companion").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      downloadQrImageSvg(svg, `${safeName}-qr.svg`);
      toast({
        title: "Vector SVG Downloaded",
        description: "Lossless vector QR code saved.",
        status: "success",
        duration: 2500,
        isClosable: true
      });
    } catch (err) {
      toast({
        title: "SVG Download Failed",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  // Trigger Native Web Share API
  const handleNativeShare = async () => {
    try {
      const svg = getSvg();
      const res = await shareViaNativeApi({
        projectName,
        shareText,
        shareUrl: isBundle ? "" : effectiveUrl,
        svgElement: svg,
        modeLabel
      });

      if (res.success) {
        toast({
          title: "Shared successfully!",
          status: "success",
          duration: 2000
        });
      } else if (res.reason === "unsupported") {
        // Fallback: copy share message
        navigator.clipboard.writeText(shareText);
        markCopied("text");
        toast({
          title: "Copied Share Message to Clipboard",
          description: "System share sheet not available in this window. Paste the message anywhere!",
          status: "info",
          duration: 3500
        });
      }
    } catch (err) {
      toast({
        title: "Share canceled or unavailable",
        description: err.message,
        status: "info",
        duration: 2000
      });
    }
  };

  // Open Messaging Channel
  const handleSocialShare = (channel) => {
    openSocialShare(channel, {
      shareText,
      shareUrl: isBundle ? "" : effectiveUrl,
      projectName
    });
    toast({
      title: `Opening ${channel.charAt(0).toUpperCase() + channel.slice(1)}...`,
      status: "info",
      duration: 2000
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      isCentered
      scrollBehavior="inside"
      containerProps={{ zIndex: 2500 }}
    >
      <ModalOverlay bg="blackAlpha.750" zIndex={2400} />
      <ModalContent
        borderRadius="2xl"
        overflow="hidden"
        bg={bgCard}
        border="1px solid"
        borderColor={borderColor}
        boxShadow="0 25px 60px -15px rgba(0, 0, 0, 0.6)"
        zIndex={2501}
      >
        {/* Header */}
        <ModalHeader p={5} borderBottom="1px solid" borderColor={borderColor}>
          <HStack justify="space-between" align="center" pr={6}>
            <HStack spacing={3}>
              <Box
                p={2.5}
                bg="linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(139,92,246,0.2) 100%)"
                color={isBundle || isCloud ? "#A855F7" : "#06B6D4"}
                borderRadius="xl"
                border="1px solid"
                borderColor={isBundle || isCloud ? "rgba(168,85,247,0.3)" : "rgba(6,182,212,0.3)"}
              >
                <FaShareAlt size={18} />
              </Box>
              <VStack align="start" spacing={0}>
                <HStack spacing={2}>
                  <Text fontWeight="extrabold" fontSize="md">
                    Share Companion QR Code
                  </Text>
                  <Badge
                    colorScheme={isBundle ? "purple" : isCloud ? "purple" : "cyan"}
                    fontSize="9px"
                    px={2}
                    py={0.5}
                    borderRadius="full"
                  >
                    {isBundle ? "BUNDLE" : isCloud ? "CLOUD REMOTE" : "LOCAL WI-FI"}
                  </Badge>
                </HStack>
                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                  {projectName} • Instant Multi-Device Connection
                </Text>
              </VStack>
            </HStack>
          </HStack>
          <ModalCloseButton top={5} right={5} />
        </ModalHeader>

        <ModalBody p={5} overflowY="auto">
          <VStack spacing={4} align="stretch">
            {/* Top Preview Card with QR and Quick Image Actions */}
            <Box
              p={4}
              bg={previewBoxBg}
              borderRadius="xl"
              border="1px solid"
              borderColor={borderColor}
            >
              <Grid
                templateColumns={{ base: "1fr", sm: "140px 1fr" }}
                gap={4}
                alignItems="center"
              >
                {/* QR Code Container with designated ID for canvas rendering */}
                <Box
                  id="share-modal-qr-container"
                  bg="white"
                  p={2}
                  borderRadius="xl"
                  border="2px solid"
                  borderColor={isBundle || isCloud ? "#A855F7" : "#22D3EE"}
                  boxShadow="0 4px 15px rgba(0,0,0,0.06)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  w="140px"
                  h="140px"
                  mx={{ base: "auto", sm: 0 }}
                >
                  <SafeQRCode
                    value={activeQrPayload}
                    size={124}
                    level="L"
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    style={{ display: "block" }}
                  />
                </Box>

                {/* Info & Quick Image Actions */}
                <VStack align={{ base: "center", sm: "start" }} spacing={2.5}>
                  <HStack spacing={2} wrap="wrap">
                    <Badge
                      colorScheme={isBundle ? "purple" : isCloud ? "green" : "cyan"}
                      fontSize="10px"
                      px={2}
                      py={0.5}
                      borderRadius="md"
                    >
                      {isBundle
                        ? `📦 ${widgets.length} UI • ${logicBlocks.length} LOGICS`
                        : isCloud
                        ? "🌐 4G/5G LIVE RELAY"
                        : "📶 SAME WI-FI NETWORK"}
                    </Badge>
                    <Text fontSize="11px" color="gray.500" fontWeight="600">
                      {isBundle ? "Schema Payload" : "Web App Controller"}
                    </Text>
                  </HStack>

                  <Text
                    fontSize="xs"
                    fontFamily="monospace"
                    bg={useColorModeValue("white", "gray.900")}
                    px={2.5}
                    py={1.5}
                    borderRadius="md"
                    border="1px solid"
                    borderColor={borderColor}
                    w="100%"
                    noOfLines={1}
                    color={useColorModeValue("gray.700", "gray.300")}
                    title={activeQrPayload}
                  >
                    {activeQrPayload}
                  </Text>

                  {/* QR Image Buttons Row */}
                  <HStack spacing={2} wrap="wrap">
                    <Button
                      size="xs"
                      colorScheme="purple"
                      variant="solid"
                      bg="#8B5CF6"
                      _hover={{ bg: "#7C3AED" }}
                      leftIcon={copiedKey === "image" ? <FaCheck size={11} /> : <FaImage size={11} />}
                      isLoading={isCopyingImage}
                      loadingText="Copying..."
                      onClick={handleCopyImage}
                    >
                      {copiedKey === "image" ? "Image Copied!" : "Copy QR Image"}
                    </Button>
                    <Button
                      size="xs"
                      colorScheme="cyan"
                      variant="outline"
                      leftIcon={<FaDownload size={11} />}
                      isLoading={isDownloadingPng}
                      loadingText="Saving..."
                      onClick={handleDownloadPng}
                    >
                      Save PNG
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="gray"
                      leftIcon={<FaFileCode size={11} />}
                      onClick={handleDownloadSvg}
                    >
                      Save SVG
                    </Button>
                  </HStack>
                </VStack>
              </Grid>
            </Box>

            {/* Direct Messaging & Social Sharing */}
            <VStack align="stretch" spacing={2}>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                1-Click Messaging &amp; Sharing
              </Text>
              <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={2.5}>
                {/* WhatsApp */}
                <HStack
                  p={3}
                  bg={channelCardBg}
                  _hover={{ bg: channelCardHover, transform: "translateY(-1px)", shadow: "sm" }}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={borderColor}
                  cursor="pointer"
                  transition="all 0.15s"
                  onClick={() => handleSocialShare("whatsapp")}
                  justify="space-between"
                >
                  <HStack spacing={3}>
                    <Box p={2.5} bg="rgba(37,211,102,0.15)" color="#25D366" borderRadius="lg">
                      <FaWhatsapp size={18} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xs" fontWeight="bold">
                        WhatsApp
                      </Text>
                      <Text fontSize="10px" color="gray.500">
                        Send message &amp; direct link
                      </Text>
                    </VStack>
                  </HStack>
                  <Badge colorScheme="green" fontSize="9px">
                    OPEN
                  </Badge>
                </HStack>



                {/* Native OS Share */}
                <HStack
                  p={3}
                  bg={channelCardBg}
                  _hover={{ bg: channelCardHover, transform: "translateY(-1px)", shadow: "sm" }}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={borderColor}
                  cursor="pointer"
                  transition="all 0.15s"
                  onClick={handleNativeShare}
                  justify="space-between"
                >
                  <HStack spacing={3}>
                    <Box p={2.5} bg="rgba(168,85,247,0.15)" color="#A855F7" borderRadius="lg">
                      <FaShareAlt size={18} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xs" fontWeight="bold">
                        System Share
                      </Text>
                      <Text fontSize="10px" color="gray.500">
                        Windows / OS share sheet
                      </Text>
                    </VStack>
                  </HStack>
                  <Badge colorScheme="purple" fontSize="9px">
                    NATIVE
                  </Badge>
                </HStack>
              </Grid>
            </VStack>

            <Divider borderColor={borderColor} />

            {/* Clipboard & Link Options */}
            <VStack align="stretch" spacing={2}>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                Clipboard &amp; Link Options
              </Text>
              <HStack spacing={2} wrap="wrap">
                <Button
                  flex={{ base: "1 1 100%", sm: "1" }}
                  size="sm"
                  variant="outline"
                  borderRadius="xl"
                  leftIcon={copiedKey === "text" ? <FaCheck size={12} /> : <FaCopy size={12} />}
                  colorScheme={copiedKey === "text" ? "green" : "gray"}
                  onClick={() => {
                    navigator.clipboard.writeText(shareText);
                    markCopied("text");
                    toast({
                      title: "Share Message Copied",
                      description: "Ready to paste into Discord, Teams, Slack, or documents.",
                      status: "success",
                      duration: 2000
                    });
                  }}
                >
                  {copiedKey === "text" ? "Message Copied!" : "Copy Share Message"}
                </Button>

                <Button
                  flex={{ base: "1 1 100%", sm: "1" }}
                  size="sm"
                  variant="outline"
                  borderRadius="xl"
                  leftIcon={copiedKey === "payload" ? <FaCheck size={12} /> : <FaLink size={12} />}
                  colorScheme={copiedKey === "payload" ? "green" : "gray"}
                  onClick={() => {
                    navigator.clipboard.writeText(activeQrPayload);
                    markCopied("payload");
                    toast({
                      title: isBundle ? "Bundle Payload Copied" : "Companion Link Copied",
                      description: activeQrPayload,
                      status: "success",
                      duration: 2000
                    });
                  }}
                >
                  {copiedKey === "payload" ? "Copied!" : isBundle ? "Copy Schema JSON" : "Copy Direct URL"}
                </Button>
              </HStack>
            </VStack>

            {/* Network Guidance Callout */}
            <Box
              p={3}
              borderRadius="xl"
              bg={
                isBundle
                  ? "rgba(168,85,247,0.08)"
                  : isCloud
                  ? "rgba(34,197,94,0.08)"
                  : "rgba(56,189,248,0.08)"
              }
              border="1px solid"
              borderColor={
                isBundle
                  ? "rgba(168,85,247,0.25)"
                  : isCloud
                  ? "rgba(34,197,94,0.25)"
                  : "rgba(56,189,248,0.25)"
              }
            >
              <HStack spacing={2.5} align="start">
                <Text fontSize="14px">
                  {isBundle ? "📦" : isCloud ? "🌐" : "📶"}
                </Text>
                <VStack align="start" spacing={0.5}>
                  <Text
                    fontSize="11px"
                    fontWeight="bold"
                    color={
                      isBundle
                        ? "purple.300"
                        : isCloud
                        ? "green.300"
                        : "cyan.300"
                    }
                  >
                    {isBundle
                      ? "UI + Logic Automation Schema"
                      : isCloud
                      ? "Cloud Relay (4G/5G Accessible Worldwide)"
                      : "Local Wi-Fi Network Mode"}
                  </Text>
                  <Text fontSize="10px" color="gray.400">
                    {isBundle
                      ? "Recipients can scan this QR code or import the schema to clone all widgets and automation rules."
                      : isCloud
                      ? "The recipient phone can connect from any mobile carrier data (4G/5G) or outside Wi-Fi network."
                      : "Ensure the scanning smartphone is connected to the same Wi-Fi router as this computer."}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter p={4} borderTop="1px solid" borderColor={borderColor}>
          <Button w="100%" size="sm" borderRadius="xl" colorScheme="blue" onClick={onClose}>
            Done
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
