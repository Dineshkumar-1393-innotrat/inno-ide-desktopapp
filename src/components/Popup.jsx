import React from "react";
import { Box, VStack, Text, Button, useColorModeValue } from "@chakra-ui/react";
import { CheckIcon, WarningIcon } from '@chakra-ui/icons';

const Popup = ({ onClose }) => { // Add onClose prop
  // Dynamic colors based on light or dark mode
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.200");
  const buttonBgColor = useColorModeValue("blue.500", "blue.300");
  const buttonTextColor = useColorModeValue("white", "black");

  return (
    <Box
      w="300px"
      p={5}
      bg={bgColor}
      borderRadius="md"
      boxShadow="md"
      mt={10}
      position="absolute" // Position the popup appropriately
      right="10px" // Adjust position as needed
      top="10%" // Adjust position as needed
    >
      <VStack align="start" spacing={4}>
        {/* Device Info */}
        <Text fontWeight="bold" fontSize="lg" color={textColor}>
          Target Device: Microcontroller
        </Text>
        <Text color={textColor}>Port: USB</Text>
        <Text color={textColor}>Memory Capacity: 22,000</Text>
        <Text color={textColor}>Protocol: UART</Text>
        <Text color={textColor}>Connection: Connected</Text>

        {/* Buttons */}
        <VStack spacing={3} w="100%" pt={4}>
          <Button
            w="100%"
            bg={buttonBgColor}
            color={buttonTextColor}
            size="sm"
            _hover={{ bg: useColorModeValue("blue.600", "blue.400") }}
            leftIcon={<CheckIcon />}
            onClick={onClose} // Close the popup on click
          >
            Erase & Flash
          </Button>
          <Button
            w="100%"
            colorScheme="orange"
            size="sm"
            _hover={{ bg: useColorModeValue("orange.400", "orange.300") }}
            leftIcon={<WarningIcon />}
            onClick={onClose} // Close the popup on click
          >
            Flash
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
};

export default Popup;
