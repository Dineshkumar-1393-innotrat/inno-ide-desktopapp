import React from "react";
import { Box, Text, useColorMode } from "@chakra-ui/react";
import { FaExclamationTriangle, FaExclamationCircle, FaCheckCircle } from "react-icons/fa"; // Icons for Error, Warning, and Success

const OutputStatus = ({ errorLine }) => {
  const { colorMode } = useColorMode();

  return (
    <Box mt={4} display="flex" alignItems="center" justifyContent="flex-start">
      <Box display="flex" alignItems="center" mr={4}>
        <FaExclamationCircle color="red.500" size="20px" />
        <Text ml={2} color={colorMode === "dark" ? "gray.300" : "gray.800"}>
          1 Error
        </Text>
        {errorLine && (
          <Text ml={2} color={colorMode === "dark" ? "gray.300" : "gray.800"}>
            (Line: {errorLine.line}, Row: {errorLine.row})
          </Text>
        )}
      </Box>
      <Box display="flex" alignItems="center" mr={4}>
        <FaExclamationTriangle color="yellow.500" size="20px" />
        <Text ml={2} color={colorMode === "dark" ? "gray.300" : "gray.800"}>
          1 Warning
        </Text>
      </Box>
      <Box display="flex" alignItems="center">
        <FaCheckCircle color="green.500" size="20px" />
        <Text ml={2} color={colorMode === "dark" ? "gray.300" : "gray.800"}>
          1 Branch Created
        </Text>
      </Box>
    </Box>
  );
};

export default OutputStatus;
