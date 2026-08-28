import React, { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Text,
  VStack,
  Divider,
  Flex,
  Collapse,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Checkbox,
  Input,
  useDisclosure,
} from "@chakra-ui/react";
import { MdPlayArrow, MdArrowDownward, MdArrowUpward, MdRefresh, MdStop } from "react-icons/md";
import { RiRestartLine } from "react-icons/ri";

const STATUS_COLOR_MAP = {
  running: "blue",
  restarting: "purple",
  paused: "yellow",
  completed: "green",
  "completed-with-errors": "orange",
  stopped: "gray",
  terminated: "gray",
  error: "red",
  idle: "gray",
};

const Debug = ({
  status = "idle",
  lastAction,
  isBusy = false,
  onRun,
  onContinue,
  onRestart,
  onStepInto,
  onStepOut,
  onStepOver,
  onStop,
  threads = [],
  breakpoints = [],
  variables = [],
  logs = [],
}) => {
  // collapse of sections section
  const [isThreadsOpen, setIsThreadsOpen] = useState(false);
  const [isVariablesOpen, setIsVariablesOpen] = useState(false);
  const [isBreakpointsOpen, setIsBreakpointsOpen] = useState(false);
  const [isVariableBreakdownOpen, setIsVariableBreakdownOpen] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isBreakpointEnabled, setBreakpointEnabled] = useState(false);
  const [isHitCountEnabled, setHitCountEnabled] = useState(false);
  const [hitCount, setHitCount] = useState(0);

  const bgColor = useColorModeValue("gray.100", "gray.700");
  const panelBgColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.600", "gray.200");
  const buttonBgColor = useColorModeValue("blue.500", "blue.300");
  const buttonTextColor = useColorModeValue("white", "black");

  const statusLabel = useMemo(() => status?.replace(/-/g, " ") || "idle", [status]);
  const statusColor = STATUS_COLOR_MAP[status] || STATUS_COLOR_MAP.idle;

  const invoke = (cb) => () => cb?.();

  const handleSetBreakpoint = () => {
    console.log("Breakpoint set:", isBreakpointEnabled, "Hit Count:", hitCount);
    onClose();
  };

  const toggleDropdown = (dropdown) => {
    if (dropdown === "threads") {
      setIsThreadsOpen((prev) => !prev);
      setIsVariablesOpen(false);
      setIsBreakpointsOpen(false);
      setIsVariableBreakdownOpen(false);
    } else if (dropdown === "variables") {
      setIsVariablesOpen((prev) => !prev);
      setIsThreadsOpen(false);
      setIsBreakpointsOpen(false);
      setIsVariableBreakdownOpen(false);
    } else if (dropdown === "breakpoints") {
      setIsBreakpointsOpen((prev) => !prev);
      setIsThreadsOpen(false);
      setIsVariablesOpen(false);
      setIsVariableBreakdownOpen(false);
    } else if (dropdown === "variableBreakdown") {
      setIsVariableBreakdownOpen((prev) => !prev);
      setIsThreadsOpen(false);
      setIsVariablesOpen(false);
      setIsBreakpointsOpen(false);
    }
  };

  return (
    <VStack
      spacing={3} 
      align="stretch"
      p={3} 
      mt={85} 
      bg={bgColor}
      height="80%"
      borderRadius="md"
      boxShadow="md"
    >
      {/* Section 1: Launch.json Information */}
      <Box>
        <Text fontSize="xs" fontWeight="bold" color={textColor}>
          Run and Debug
        </Text>
        <Text fontSize="sm">To customize Run and Debug, create a launch.json file.</Text>
      </Box>

      {/* Section 2: Run and Debug Buttons */}
      <Box display="flex" flexDirection="column" gap={3}>
        <Button
          leftIcon={<MdPlayArrow />}
          colorScheme="blue"
          bg={buttonBgColor}
          color={buttonTextColor}
          width="100%"
          mb={2}
          size="sm"
          onClick={invoke(onRun)}
          isLoading={isBusy}
        >
          Run & Debug
        </Button>
        <Flex justify="space-between" align="center">
          <Box>
            <Text fontSize="xs" color={textColor} textTransform="uppercase" letterSpacing="0.08em">
              Status
            </Text>
            <Badge colorScheme={statusColor} variant="solid" fontSize="0.7rem">
              {statusLabel}
            </Badge>
          </Box>
          {lastAction && (
            <Text fontSize="xs" color={textColor} textAlign="right">
              Last action: {lastAction}
            </Text>
          )}
        </Flex>
      </Box>

      <Divider borderColor={useColorModeValue("gray.300", "gray.500")} />

      {/* Section 3: Debug Panel */}
      <Box>
        <Text fontSize="sm" fontWeight="bold" color={textColor}>
          Debug Panel
        </Text>
      </Box>

      {/* Section 4: Step Control Icons */}
      <Flex justify="space-between" pt={2}>
        <Button
          variant="outline"
          leftIcon={<MdPlayArrow />}
          size="xs"
          onClick={invoke(onContinue)}
          isDisabled={!onContinue}
        />
        <Button
          variant="outline"
          leftIcon={<RiRestartLine />}
          size="xs"
          onClick={invoke(onRestart)}
          isDisabled={!onRestart}
        />
        <Button
          variant="outline"
          leftIcon={<MdArrowDownward />}
          size="xs"
          onClick={invoke(onStepInto)}
          isDisabled={!onStepInto}
        />
        <Button
          variant="outline"
          leftIcon={<MdArrowUpward />}
          size="xs"
          onClick={invoke(onStepOut)}
          isDisabled={!onStepOut}
        />
        <Button
          variant="outline"
          leftIcon={<MdRefresh />}
          size="xs"
          onClick={invoke(onStepOver)}
          isDisabled={!onStepOver}
        />
        <Button
          variant="outline"
          leftIcon={<MdStop />}
          size="xs"
          onClick={invoke(onStop)}
          isDisabled={!onStop}
        />
      </Flex>

      {/* Section 5: Threads */}
      <Box>
        <Text
          fontSize="xs"
          fontWeight="bold"
          color={textColor}
          onClick={() => toggleDropdown("threads")}
          cursor="pointer"
        >
          Threads
        </Text>
        <Collapse in={isThreadsOpen}>
          <Box bg={panelBgColor} borderRadius="md" p={2} mt={1}>
            {threads.length === 0 ? (
              <Text color={textColor} fontSize="sm">
                No active threads.
              </Text>
            ) : (
              threads.map((thread) => (
                <Text key={thread.id ?? thread.name} color={textColor} fontSize="sm">
                  {thread.name || `Thread ${thread.id}`} — {thread.state || "unknown"}
                </Text>
              ))
            )}
          </Box>
        </Collapse>
      </Box>

      <Divider borderColor={useColorModeValue("gray.300", "gray.500")} />

      {/* Section 6: Breakpoints */}
      <Box>
        <Text
          fontSize="xs"
          fontWeight="bold"
          color={textColor}
          onClick={() => toggleDropdown("breakpoints")}
          cursor="pointer"
        >
          Breakpoints
        </Text>
        <Collapse in={isBreakpointsOpen}>
          <Box bg={panelBgColor} borderRadius="md" p={2} mt={1}>
            {breakpoints.length === 0 ? (
              <Text color={textColor} fontSize="sm">
                No breakpoints configured.
              </Text>
            ) : (
              breakpoints.map((bp, index) => (
                <Text key={`${bp.path ?? "bp"}-${bp.line ?? index}`} color={textColor} fontSize="sm">
                  {(bp.path || "file") + (bp.line ? `:${bp.line}` : "")}
                </Text>
              ))
            )}
            <Button size="xs" onClick={onOpen} mt={2} colorScheme="blue">
              Configure Breakpoint
            </Button>
          </Box>
        </Collapse>
      </Box>

      <Divider borderColor={useColorModeValue("gray.300", "gray.500")} />

      {/* Section 7: Variable Breakdown */}
      <Box>
        <Text
          fontSize="xs"
          fontWeight="bold"
          color={textColor}
          onClick={() => toggleDropdown("variableBreakdown")}
          cursor="pointer"
        >
          Variable Breakdown
        </Text>
        <Collapse in={isVariableBreakdownOpen}>
          <Box bg={panelBgColor} borderRadius="md" p={2} mt={1}>
            {variables.length === 0 ? (
              <Text color={textColor} fontSize="sm">
                No variables captured for the current session.
              </Text>
            ) : (
              variables.map((variable, index) => (
                <Text key={variable.name ?? index} color={textColor} fontSize="sm">
                  {(variable.name || `var${index}`) + " = " + (variable.value ?? "undefined")}
                </Text>
              ))
            )}
          </Box>
        </Collapse>
      </Box>

      <Divider borderColor={useColorModeValue("gray.300", "gray.500")} />

      {logs.length > 0 && (
        <Box>
          <Text fontSize="xs" fontWeight="bold" color={textColor} mb={1}>
            Recent Events
          </Text>
          <VStack
            spacing={1}
            align="stretch"
            maxH="160px"
            overflowY="auto"
            borderRadius="md"
            border="1px solid rgba(148,163,184,0.35)"
            bg={useColorModeValue("rgba(226,232,240,0.35)", "rgba(30,41,59,0.55)")}
            p={2}
          >
            {logs
              .slice(-12)
              .reverse()
              .map((entry, idx) => (
                <Text key={`${entry.timestamp}-${idx}`} fontSize="xs" color={textColor} opacity={0.88}>
                  {new Date(entry.timestamp).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                  {": "}
                  {entry.message || entry.action}
                </Text>
              ))}
          </VStack>
        </Box>
      )}

      {/* Modal for setting breakpoints */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="sm">Set Breakpoint</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex alignItems="center" mb={2}>
              <Checkbox
                isChecked={isBreakpointEnabled}
                onChange={(e) => setBreakpointEnabled(e.target.checked)}
              >
                Enable Breakpoint
              </Checkbox>
            </Flex>
            <Flex alignItems="center">
              <Checkbox
                isChecked={isHitCountEnabled}
                onChange={(e) => setHitCountEnabled(e.target.checked)}
              >
                Enable Hit Count
              </Checkbox>
              {isHitCountEnabled && (
                <Input
                  size="xs"
                  value={hitCount}
                  onChange={(e) => setHitCount(e.target.value)}
                  ml={2}
                  placeholder="Hit Count"
                />
              )}
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" colorScheme="blue" onClick={handleSetBreakpoint}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default Debug;
