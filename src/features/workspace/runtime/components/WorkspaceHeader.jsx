import React from "react";
import { Flex, HStack, Button, Text, useColorModeValue } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { Play, Square, RotateCw, Download, Trash2, ExternalLink, Package } from "lucide-react";
import ProjectStatus from "./ProjectStatus";
import { useProject } from "../../../../ProjectContext";
import { 
  setRuntimeState, 
  appendTerminalLog, 
  clearTerminalLogs,
  startChildApp,
  stopChildApp,
  installChildApp,
  fetchChildAppLogs
} from "../../store/workspaceSlice";

const WorkspaceHeader = () => {
  const dispatch = useDispatch();
  const { 
    runtimeState, 
    projectName, 
    projectType, 
    previewUrl, 
    terminalLogs,
    rootFolderId,
    activeSubApp 
  } = useSelector((state) => state.workspace);
  const { activeProjectName } = useProject();
  const displayName = projectName || activeProjectName || localStorage.getItem("activeProjectName") || "Untitled Project";
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const isProcessing = ["uploading", "extracting", "detecting", "installing", "starting"].includes(runtimeState);
  const isRunning = runtimeState === "running";
  const targetRootId = rootFolderId || localStorage.getItem("activeProjectId");
  const targetSubApp = activeSubApp || "_root";

  if (!targetRootId && !projectName && runtimeState === "idle") return null;

  const handleStart = () => {
    dispatch(startChildApp({ rootFolderId: targetRootId, subAppName: targetSubApp }));
  };

  const handleStop = () => {
    dispatch(stopChildApp({ rootFolderId: targetRootId, subAppName: targetSubApp }));
  };

  const handleRestart = async () => {
    await dispatch(stopChildApp({ rootFolderId: targetRootId, subAppName: targetSubApp }));
    dispatch(startChildApp({ rootFolderId: targetRootId, subAppName: targetSubApp }));
  };

  const handleInstall = () => {
    dispatch(installChildApp({ rootFolderId: targetRootId, subAppName: targetSubApp }));
  };

  const handleClear = () => {
    dispatch(clearTerminalLogs());
  };

  const handlePreview = () => {
    const url = previewUrl || (targetRootId ? `http://localhost:5004/preview/${targetRootId}/${targetSubApp}` : null);
    if (url) {
      window.open(url, "_blank");
    }
  };

  const handleFetchLogs = async () => {
    const res = await dispatch(fetchChildAppLogs({ rootFolderId: targetRootId, subAppName: targetSubApp }));
    if (res.payload) {
      const element = document.createElement("a");
      const file = new Blob([res.payload], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `${projectName || "project"}-logs.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <Flex 
      w="100%" 
      p={3} 
      bg={bgColor} 
      borderBottom="1px solid" 
      borderColor={borderColor}
      alignItems="center"
      justifyContent="space-between"
    >
      <HStack spacing={4}>
        <Text fontWeight="bold" fontSize="md">
          {displayName}
        </Text>
        <ProjectStatus status={runtimeState} projectType={projectType} />
      </HStack>

      <HStack spacing={2}>
        <Button size="xs" leftIcon={<Play size={14} />} isDisabled={isRunning || isProcessing} colorScheme="green" onClick={handleStart}>
          Start
        </Button>
        <Button size="xs" leftIcon={<Square size={14} />} isDisabled={!isRunning && !isProcessing} colorScheme="red" onClick={handleStop}>
          Stop
        </Button>
        <Button size="xs" leftIcon={<RotateCw size={14} />} isDisabled={!isRunning} variant="outline" onClick={handleRestart}>
          Restart
        </Button>
        <Button size="xs" leftIcon={<Package size={14} />} isDisabled={isRunning || isProcessing} variant="outline" onClick={handleInstall}>
          Install
        </Button>
        <Button size="xs" leftIcon={<ExternalLink size={14} />} isDisabled={!previewUrl} variant="outline" onClick={handlePreview}>
          Preview
        </Button>
        <Button size="xs" leftIcon={<Trash2 size={14} />} variant="ghost" colorScheme="red" title="Clear Terminal" onClick={handleClear}>
          Clear
        </Button>
        <Button size="xs" leftIcon={<Download size={14} />} variant="ghost" title="Download Logs" onClick={handleFetchLogs}>
          Logs
        </Button>
      </HStack>
    </Flex>
  );
};

export default WorkspaceHeader;
