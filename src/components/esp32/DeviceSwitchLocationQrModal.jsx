import React from "react";
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
  Input,
  Badge,
  useToast
} from "@chakra-ui/react";
import {
  FaMapMarkerAlt,
  FaCopy,
  FaExternalLinkAlt,
  FaMobileAlt
} from "react-icons/fa";
import SafeQRCode from "./SafeQRCode.jsx";

export default function DeviceSwitchLocationQrModal({
  isOpen,
  onClose,
  bgCard,
  borderColor,
  bgCyanCard,
  locationQrModalData,
  deviceDetectedLocation,
  liveLedToggle,
  companionNetworkMode,
  remoteTunnelState,
  localCompanionUrl,
  companionServerInfo
}) {
  const toast = useToast();

  const qrUrl =
    companionNetworkMode === "cloud" && remoteTunnelState?.url
      ? `${remoteTunnelState.url}#location`
      : localCompanionUrl || `http://${companionServerInfo?.ip || "localhost"}:5055`;

  const mapLat = locationQrModalData?.lat || deviceDetectedLocation?.lat || "";
  const mapLng = locationQrModalData?.lng || deviceDetectedLocation?.lng || "";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay backdropFilter="blur(6px)" bg="blackAlpha.700" />
      <ModalContent
        borderRadius="2xl"
        overflow="hidden"
        bg={bgCard}
        boxShadow="0 25px 60px -15px rgba(0, 0, 0, 0.5)"
        border="1px solid"
        borderColor={borderColor}
      >
        <ModalHeader pb={1} pt={4} px={5}>
          <HStack spacing={2.5}>
            <Box p={2} bg="cyan.50" color="cyan.600" borderRadius="xl">
              <FaMapMarkerAlt size={16} />
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontSize="md" fontWeight="bold">
                Device Switch Location QR
              </Text>
              <Text fontSize="xs" color="gray.400">
                Scan on phone to view location &amp; control switch
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={4} px={5}>
          <VStack spacing={4} align="stretch">
            {/* Event & Coordinates Banner */}
            <Box p={3} bg={bgCyanCard} borderRadius="xl" border="1px solid" borderColor="cyan.200">
              <HStack justify="space-between" mb={1}>
                <HStack spacing={2}>
                  <Badge
                    colorScheme={locationQrModalData?.event === "ON" ? "green" : "red"}
                    fontSize="10px"
                    px={2}
                    py={0.5}
                    borderRadius="md"
                  >
                    SWITCH {locationQrModalData?.event || (liveLedToggle ? "ON" : "OFF")}
                  </Badge>
                  <Text fontWeight="bold" fontSize="xs">
                    {locationQrModalData?.city || deviceDetectedLocation?.city || "Live Device Location"}
                  </Text>
                </HStack>
                <Text fontSize="10px" color="gray.400" fontFamily="monospace">
                  {locationQrModalData?.time || "Active"}
                </Text>
              </HStack>
              <Text fontSize="11px" color="gray.600" noOfLines={2}>
                📍 {locationQrModalData?.address || deviceDetectedLocation?.address || "Live coordinates pending"}
              </Text>
              <Text fontSize="10px" color="cyan.600" fontFamily="monospace" fontWeight="bold" mt={1}>
                GPS: {locationQrModalData?.lat ?? deviceDetectedLocation?.lat ?? "--"}° N, {locationQrModalData?.lng ?? deviceDetectedLocation?.lng ?? "--"}° E
              </Text>
            </Box>

            {/* QR Code Container */}
            <Box display="flex" justifyContent="center" alignItems="center" p={3}>
              <Box
                p={3.5}
                borderRadius="2xl"
                border="3px solid #06b6d4"
                bg="white"
                boxShadow="0 0 25px rgba(6, 182, 212, 0.2)"
              >
                <SafeQRCode
                  value={qrUrl}
                  size={200}
                  level="L"
                  includeMargin={true}
                />
              </Box>
            </Box>

            {/* Direct Google Maps & Web App Links */}
            <VStack align="stretch" spacing={2}>
              <HStack spacing={2}>
                <Input
                  size="sm"
                  isReadOnly
                  fontSize="xs"
                  fontFamily="monospace"
                  value={qrUrl}
                  borderRadius="lg"
                />
                <Button
                  size="sm"
                  colorScheme="purple"
                  borderRadius="lg"
                  leftIcon={<FaCopy size={11} />}
                  onClick={() => {
                    navigator.clipboard.writeText(qrUrl);
                    toast({ title: "URL Copied to Clipboard", status: "success", duration: 2000 });
                  }}
                >
                  Copy
                </Button>
              </HStack>

              <HStack spacing={2}>
                <Button
                  size="sm"
                  flex="1"
                  colorScheme="cyan"
                  variant="outline"
                  as="a"
                  href={`https://www.google.com/maps?q=${mapLat},${mapLng}`}
                  target="_blank"
                  rel="noreferrer"
                  leftIcon={<FaExternalLinkAlt size={10} />}
                  borderRadius="lg"
                >
                  Open in Google Maps
                </Button>
                <Button
                  size="sm"
                  flex="1"
                  colorScheme="cyan"
                  variant="solid"
                  as="a"
                  href={qrUrl}
                  target="_blank"
                  rel="noreferrer"
                  leftIcon={<FaMobileAlt size={10} />}
                  borderRadius="lg"
                >
                  Open Mobile App
                </Button>
              </HStack>
            </VStack>
          </VStack>
        </ModalBody>
        <ModalFooter pt={0} pb={4} px={5}>
          <Button size="sm" onClick={onClose} borderRadius="lg" w="100%">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
