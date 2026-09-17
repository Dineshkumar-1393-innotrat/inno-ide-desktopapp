import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  Box,
  HStack,
  VStack,
  Text,
  Button,
  useColorModeValue,
  useToast
} from "@chakra-ui/react";
import { FaBolt, FaCog, FaExternalLinkAlt } from "react-icons/fa";

/**
 * EspIdfSetupModal
 * First-step wizard modal informing the user about ESP-IDF toolchain requirements
 * before proceeding to the Device Firmware Flasher & App Companion.
 */
const EspIdfSetupModal = ({ isOpen, onClose, onContinue }) => {
  const toast = useToast();
  const [isInstalling, setIsInstalling] = useState(false);

  const bgCard = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const card1Bg = useColorModeValue("blue.50", "gray.800");
  const card1Border = useColorModeValue("blue.100", "blue.900");
  const card1TitleColor = useColorModeValue("blue.900", "blue.200");
  const card1TextColor = useColorModeValue("gray.600", "gray.300");
  const card2Bg = useColorModeValue("gray.50", "gray.800");
  const footerBg = useColorModeValue("gray.50", "gray.800");

  const handleNo = () => {
    localStorage.setItem("innoide:idf-setup-prompt-dismissed", "true");
    toast({
      title: "Continuing Flashing Workflow",
      description: "Proceeding with device detection and flashing steps.",
      status: "info",
      duration: 3000,
      isClosable: true
    });
    if (onContinue) {
      onContinue();
    } else if (onClose) {
      onClose();
    }
  };

  const handleYes = () => {
    setIsInstalling(true);
    localStorage.setItem("innoide:idf-setup-prompt-dismissed", "true");

    setTimeout(() => {
      const espIdfUrl = "https://dl.espressif.com/dl/esp-idf/";
      if (window.electronAPI?.app?.openExternal) {
        window.electronAPI.app.openExternal(espIdfUrl);
      } else {
        window.open(espIdfUrl, "_blank", "noopener,noreferrer");
      }
      toast({
        title: "Opening ESP-IDF Installer Page",
        description: "Redirecting to official Espressif tools download page in your browser...",
        status: "info",
        duration: 4000,
        isClosable: true
      });
      setIsInstalling(false);
      if (onContinue) {
        onContinue();
      } else if (onClose) {
        onClose();
      }
    }, 800);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.700" />
      <ModalContent
        borderRadius="3xl"
        overflow="hidden"
        p={0}
        bg={bgCard}
        border="1px solid"
        borderColor={borderColor}
        shadow="2xl"
        maxW="540px"
      >
        {/* Header with Blue Gradient & Bolt Icon */}
        <Box bg="linear-gradient(135deg, #1e40af 0%, #2563eb 100%)" p={6} color="white">
          <HStack spacing={3.5} align="center">
            <Box p={3} bg="whiteAlpha.200" borderRadius="2xl" shadow="sm">
              <FaBolt size={26} color="#facc15" />
            </Box>
            <VStack align="start" spacing={0.5}>
              <Text fontWeight="extrabold" fontSize="lg" letterSpacing="tight">
                ESP-IDF Toolchain Setup
              </Text>
              <Text fontSize="xs" color="whiteAlpha.900">
                Required toolchain for compiling &amp; flashing ESP32 firmware
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* Modal Body with 2 Info Cards */}
        <ModalBody p={6}>
          <VStack spacing={4} align="stretch">
            {/* Card 1: Toolchain requirement */}
            <Box
              p={4}
              bg={card1Bg}
              borderRadius="2xl"
              border="1px solid"
              borderColor={card1Border}
            >
              <HStack align="start" spacing={3}>
                <Box pt={0.5}>
                  <FaCog size={22} color="#a5b4fc" />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="xs" fontWeight="bold" color={card1TitleColor}>
                    Flashing requires ESP-IDF Tools
                  </Text>
                  <Text fontSize="xs" color={card1TextColor} lineHeight="tall">
                    To compile and flash firmware to physical ESP32 boards, the official{" "}
                    <strong>ESP-IDF (Espressif IoT Development Framework)</strong> toolchain needs to be installed on your computer.
                  </Text>
                </VStack>
              </HStack>
            </Box>

            {/* Card 2: Question & Options */}
            <Box
              p={4}
              bg={card2Bg}
              borderRadius="2xl"
              border="1px solid"
              borderColor={borderColor}
            >
              <Text fontSize="xs" fontWeight="bold" mb={2} color={useColorModeValue("gray.800", "white")}>
                Do you need to install the ESP-IDF tool for flashing?
              </Text>
              <Text fontSize="11px" color={useColorModeValue("gray.500", "gray.400")} lineHeight="tall">
                • <strong>Yes:</strong> Redirects to the official Espressif website to download the ESP-IDF installer.<br />
                • <strong>No:</strong> Skip and proceed with the next steps in the flashing wizard.
              </Text>
            </Box>
          </VStack>
        </ModalBody>

        {/* Modal Footer with Actions */}
        <ModalFooter
          p={5}
          borderTop="1px"
          borderColor={borderColor}
          bg={footerBg}
        >
          <HStack spacing={3} w="100%" justify="space-between">
            <Button
              variant="outline"
              bg={useColorModeValue("white", "gray.700")}
              borderColor={useColorModeValue("gray.300", "gray.600")}
              color={useColorModeValue("gray.700", "gray.200")}
              _hover={{ bg: useColorModeValue("gray.100", "gray.600") }}
              borderRadius="xl"
              onClick={handleNo}
              size="md"
              fontSize="xs"
              fontWeight="semibold"
              isDisabled={isInstalling}
            >
              No, Continue to Next Step
            </Button>
            <Button
              colorScheme="blue"
              bg="#2563eb"
              _hover={{ bg: "#1d4ed8" }}
              borderRadius="xl"
              onClick={handleYes}
              size="md"
              fontSize="xs"
              fontWeight="bold"
              isLoading={isInstalling}
              loadingText="Opening..."
              isDisabled={isInstalling}
              rightIcon={<FaExternalLinkAlt size={11} />}
              shadow="md"
            >
              Yes, Install ESP-IDF (Open Website)
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EspIdfSetupModal;
