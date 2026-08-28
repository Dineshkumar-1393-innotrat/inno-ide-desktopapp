import React from "react";
import { Box, VStack, HStack, Text, Icon, Spinner, useColorModeValue } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { CheckCircle2, Clock } from "lucide-react";

const STEPS = [
  { id: "extracting", label: "Extracting Files" },
  { id: "detecting", label: "Detecting Framework" },
  { id: "installing", label: "Installing Dependencies" },
  { id: "starting", label: "Starting Development Server" },
];

const ProcessingTimeline = () => {
  const { runtimeState } = useSelector((state) => state.workspace);
  const bgColor = useColorModeValue("white", "gray.800");

  const getStepStatus = (stepId) => {
    const order = ["idle", "uploading", "extracting", "detecting", "installing", "starting", "running", "stopped", "failed"];
    const currentIndex = order.indexOf(runtimeState);
    const stepIndex = order.indexOf(stepId);

    if (currentIndex > stepIndex) return "completed";
    if (currentIndex === stepIndex) return "current";
    return "pending";
  };

  if (["idle", "uploading", "running", "stopped", "failed"].includes(runtimeState)) {
    return null;
  }

  return (
    <Box p={6} bg={bgColor} borderRadius="md" shadow="sm" m={4} maxW="500px">
      <Text fontSize="lg" fontWeight="bold" mb={4}>Setting up workspace...</Text>
      <VStack align="stretch" spacing={4}>
        <HStack>
           <Icon as={CheckCircle2} color="green.500" />
           <Text>Upload Complete</Text>
        </HStack>
        {STEPS.map((step) => {
          const status = getStepStatus(step.id);
          return (
            <HStack key={step.id}>
              {status === "completed" && <Icon as={CheckCircle2} color="green.500" />}
              {status === "current" && <Spinner size="sm" color="blue.500" />}
              {status === "pending" && <Icon as={Clock} color="gray.400" />}
              <Text color={status === "pending" ? "gray.400" : "inherit"}>
                {step.label}
              </Text>
            </HStack>
          );
        })}
      </VStack>
    </Box>
  );
};

export default ProcessingTimeline;
