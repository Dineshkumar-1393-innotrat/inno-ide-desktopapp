import React, { useEffect, useRef } from "react";
import { Box, Flex, Text, IconButton, Tooltip, Badge, HStack, useColorModeValue } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { Maximize2, Minimize2, Trash2 } from "lucide-react";
import { clearTerminalLogs } from "../../store/workspaceSlice";

const TerminalPanel = ({ onToggleExpand, isExpanded }) => {
  const dispatch = useDispatch();
  const { terminalLogs, runtimeState } = useSelector((state) => state.workspace);
  const bottomRef = useRef(null);

  const bgColor = useColorModeValue("gray.900", "#0d1117");
  const textColor = useColorModeValue("gray.100", "gray.200");
  const headerBg = useColorModeValue("gray.800", "#161b22");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLogs]);

  const handleClear = () => {
    dispatch(clearTerminalLogs());
  };

  if (runtimeState === "idle" || runtimeState === "uploading") {
    return null;
  }

  return (
    <Flex direction="column" h="100%" w="100%" bg={bgColor} borderRadius="md" overflow="hidden">
      {/* Terminal Header Bar */}
      <Flex h="32px" bg={headerBg} px={3} align="center" justify="space-between" borderBottom="1px solid" borderColor="gray.700" flexShrink={0}>
        <HStack spacing={2}>
          <Text fontSize="xs" fontWeight="bold" color="gray.300" letterSpacing="wide">
            TERMINAL
          </Text>
          <Badge size="sm" colorScheme={runtimeState === "running" ? "green" : runtimeState === "starting" || runtimeState === "installing" ? "yellow" : "gray"}>
            {runtimeState}
          </Badge>
        </HStack>

        <HStack spacing={1}>
          <Tooltip label="Clear Logs">
            <IconButton
              aria-label="Clear logs"
              icon={<Trash2 size={13} />}
              size="xs"
              variant="ghost"
              color="gray.400"
              _hover={{ color: "red.400", bg: "whiteAlpha.200" }}
              onClick={handleClear}
            />
          </Tooltip>
          {onToggleExpand && (
            <Tooltip label={isExpanded ? "Collapse Terminal" : "Expand Terminal"}>
              <IconButton
                aria-label="Toggle terminal height"
                icon={isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                size="xs"
                variant="ghost"
                color="gray.400"
                _hover={{ color: "white", bg: "whiteAlpha.200" }}
                onClick={onToggleExpand}
              />
            </Tooltip>
          )}
        </HStack>
      </Flex>

      {/* Scrollable Terminal Output */}
      <Box
        flex="1"
        p={3}
        fontFamily="Consolas, Monaco, 'Courier New', monospace"
        fontSize="12px"
        lineHeight="1.5"
        color={textColor}
        overflowY="auto"
        sx={{
          "&::-webkit-scrollbar": { width: "8px" },
          "&::-webkit-scrollbar-track": { bg: "rgba(0,0,0,0.2)" },
          "&::-webkit-scrollbar-thumb": { bg: "rgba(255,255,255,0.25)", borderRadius: "4px" },
          "&::-webkit-scrollbar-thumb:hover": { bg: "rgba(255,255,255,0.45)" },
        }}
      >
        {terminalLogs.length === 0 ? (
          <Text color="gray.500" fontStyle="italic">Terminal output will appear here...</Text>
        ) : (
          terminalLogs.map((log, index) => (
            <Text key={index} whiteSpace="pre-wrap" wordBreak="break-word" mb={0.5}>
              {log}
            </Text>
          ))
        )}
        <div ref={bottomRef} />
      </Box>
    </Flex>
  );
};

export default TerminalPanel;
