import React from "react";
import { HStack, Text, Badge, Icon, Spinner } from "@chakra-ui/react";
import { CheckCircle, AlertCircle, PlayCircle, Square, Clock } from "lucide-react";

const ProjectStatus = ({ status, projectType }) => {
  const getStatusConfig = () => {
    switch (status) {
      case "idle":
        return { color: "gray", icon: Clock, label: "Idle" };
      case "uploading":
      case "extracting":
      case "detecting":
      case "installing":
      case "starting":
        return { color: "blue", icon: Spinner, label: status.charAt(0).toUpperCase() + status.slice(1) };
      case "running":
        return { color: "green", icon: PlayCircle, label: "Running" };
      case "stopped":
        return { color: "gray", icon: Square, label: "Stopped" };
      case "failed":
        return { color: "red", icon: AlertCircle, label: "Failed" };
      default:
        return { color: "gray", icon: Clock, label: "Unknown" };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <HStack spacing={3}>
      <Badge colorScheme={config.color} px={2} py={1} borderRadius="md" display="flex" alignItems="center">
        {config.icon === Spinner ? (
          <Spinner size="xs" mr={2} />
        ) : (
          <Icon as={StatusIcon} size={14} mr={2} />
        )}
        {config.label}
      </Badge>
      
      {projectType && (
        <Badge variant="outline" colorScheme="purple">
          {projectType.toUpperCase()}
        </Badge>
      )}
    </HStack>
  );
};

export default ProjectStatus;
