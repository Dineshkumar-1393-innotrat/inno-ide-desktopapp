import React from "react";
import { Box, Progress, Text, VStack } from "@chakra-ui/react";

const UploadProgress = ({ progress, fileName }) => {
  return (
    <VStack align="stretch" spacing={4} py={4}>
      <Box textAlign="center">
        <Text fontWeight="semibold" mb={1}>Uploading {fileName}</Text>
        <Text fontSize="sm" color="gray.500">{progress}% Complete</Text>
      </Box>
      <Progress value={progress} size="sm" colorScheme="blue" borderRadius="md" hasStripe isAnimated />
    </VStack>
  );
};

export default UploadProgress;
