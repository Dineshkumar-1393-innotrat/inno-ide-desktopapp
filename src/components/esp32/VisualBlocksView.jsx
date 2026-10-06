import React, { useState } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  Select,
  Input,
  Badge,
  IconButton,
  Tooltip,
  Switch,
  Grid,
  useToast
} from "@chakra-ui/react";
import {
  FaPlus,
  FaBolt,
  FaEdit,
  FaTrashAlt,
  FaCogs
} from "react-icons/fa";

/**
 * VisualBlocksView
 * Automation & Hardware Rules editor (Visual Blocks View).
 * Connects mobile UI events to physical ESP32 GPIOs and hardware telemetry routines.
 */
export default function VisualBlocksView({
  logicBlocks,
  setLogicBlocks,
  widgets,
  handleOpenAddRule,
  handleExecuteRule,
  handleOpenEditRule,
  handleToggleLogicBlock,
  handleDeleteLogicBlock
}) {
  const toast = useToast();
  const [ruleSearchQuery, setRuleSearchQuery] = useState("");
  const [ruleComponentFilter, setRuleComponentFilter] = useState("all");

  return (
    <Box w="100%" maxW="780px" p={4}>
      {/* Header with Title and Add Button */}
      <Flex justify="space-between" align={{ base: "start", sm: "center" }} direction={{ base: "column", sm: "row" }} gap={3} mb={4}>
        <VStack align="start" spacing={0.5}>
          <Text fontWeight="extrabold" fontSize="md" color="gray.800">
            Automation & Hardware Rules
          </Text>
          <Text fontSize="xs" color="gray.500">
            Connect UI events to physical ESP32 GPIOs and hardware telemetry routines.
          </Text>
        </VStack>
        <Button
          size="sm"
          colorScheme="blue"
          bg="#2563eb"
          _hover={{ bg: "#1d4ed8" }}
          leftIcon={<FaPlus size={11} />}
          onClick={() => handleOpenAddRule(0)}
          borderRadius="lg"
          fontWeight="bold"
          shadow="sm"
        >
          Add Automation Rule
        </Button>
      </Flex>

      {/* Search / Filter Bar & Count */}
      <Flex mb={3} gap={2} align="center" wrap="wrap">
        <Input
          size="sm"
          placeholder="Search rules by name, event, pin, or action..."
          value={ruleSearchQuery}
          onChange={(e) => setRuleSearchQuery(e.target.value)}
          borderRadius="lg"
          bg="white"
          borderColor="gray.200"
          _focus={{ borderColor: "blue.400" }}
          flex="1"
          minW="200px"
        />
        {/* Filter by Added Mobile Component */}
        <Select
          size="sm"
          maxW="210px"
          borderRadius="lg"
          bg="white"
          borderColor="gray.200"
          value={ruleComponentFilter}
          onChange={(e) => setRuleComponentFilter(e.target.value)}
          fontSize="xs"
        >
          <option value="all">All Components ({logicBlocks.length})</option>
          {widgets.map((w) => (
            <option key={w.id} value={w.id}>
              {w.title} ({w.type})
            </option>
          ))}
        </Select>

        {ruleSearchQuery && (
          <Button size="xs" variant="ghost" onClick={() => setRuleSearchQuery("")}>
            Clear
          </Button>
        )}
        <Badge colorScheme="blue" variant="subtle" px={2} py={1} borderRadius="md" whiteSpace="nowrap">
          {logicBlocks.length} Active {logicBlocks.length === 1 ? "Rule" : "Rules"}
        </Badge>
      </Flex>

      {/* Rules List */}
      <VStack spacing={3.5} align="stretch">
        {logicBlocks
          .filter((block) => {
            if (ruleComponentFilter !== "all" && block.triggerWidgetId !== ruleComponentFilter) {
              return false;
            }
            if (!ruleSearchQuery.trim()) return true;
            const q = ruleSearchQuery.toLowerCase();
            return (
              block.name.toLowerCase().includes(q) ||
              (block.triggerName && block.triggerName.toLowerCase().includes(q)) ||
              (block.event && block.event.toLowerCase().includes(q)) ||
              (block.condition && block.condition.toLowerCase().includes(q)) ||
              (block.action && block.action.toLowerCase().includes(q)) ||
              (block.targetHardware && block.targetHardware.toLowerCase().includes(q))
            );
          })
          .map((block, idx) => {
            const linkedWidget = widgets.find((w) => w.id === block.triggerWidgetId);
            const isComponentTrigger = block.triggerType === "component" || (!block.triggerWidgetId?.startsWith("telem_") && !block.triggerWidgetId?.startsWith("timer"));
            const isStale = isComponentTrigger && Boolean(block.triggerWidgetId) && !linkedWidget;
            const liveTriggerName = linkedWidget ? linkedWidget.title : (block.triggerName || "Trigger Source");
            const liveBinding = linkedWidget ? (linkedWidget.boundTargetName || linkedWidget.boundTarget || "GPIO Pin") : block.targetHardware;

            return (
              <Box
                key={block.id}
                p={4}
                bg="white"
                borderRadius="2xl"
                border="1.5px solid"
                borderColor={isStale ? "red.300" : block.enabled ? "blue.200" : "gray.200"}
                shadow="sm"
                opacity={block.enabled && !isStale ? 1 : 0.7}
                transition="all 0.15s ease"
                _hover={{ shadow: "md", borderColor: isStale ? "red.400" : "blue.400" }}
              >
                {/* Header Row of Rule Card */}
                <HStack justify="space-between" mb={3}>
                  <HStack spacing={2.5}>
                    <Badge
                      colorScheme={isStale ? "red" : "blue"}
                      variant="solid"
                      bg={isStale ? "red.500" : "blue.500"}
                      borderRadius="md"
                      px={2}
                      py={0.5}
                      fontSize="10px"
                      fontWeight="extrabold"
                    >
                      RULE #{idx + 1}
                    </Badge>
                    <Text fontWeight="extrabold" fontSize="sm" color="gray.800">
                      {block.name}
                    </Text>
                    {isStale && (
                      <Badge colorScheme="red" variant="subtle" fontSize="9px">
                        ⚠️ Component Deleted
                      </Badge>
                    )}
                  </HStack>

                  {/* Quick Actions (Test, Edit, Toggle, Delete) */}
                  <HStack spacing={2}>
                    <Tooltip
                      label={isStale ? "Cannot test: referenced component was removed from mobile app" : "Test run this rule immediately"}
                      fontSize="xs"
                    >
                      <Button
                        size="xs"
                        variant="outline"
                        colorScheme={isStale ? "gray" : "orange"}
                        isDisabled={isStale}
                        leftIcon={<FaBolt size={10} />}
                        onClick={async () => {
                          const res = await handleExecuteRule(block, 1);
                          toast({
                            title: "Rule Executed",
                            description: res?.text || `Sent command for ${block.name}`,
                            status: res?.success ? "success" : "warning",
                            duration: 2500
                          });
                        }}
                      >
                        Test
                      </Button>
                    </Tooltip>
                    <Tooltip label="Edit Rule Configuration" fontSize="xs">
                      <IconButton
                        icon={<FaEdit size={12} />}
                        size="xs"
                        variant="outline"
                        colorScheme="blue"
                        onClick={() => handleOpenEditRule(block, 0)}
                        aria-label="Edit rule"
                      />
                    </Tooltip>
                    <Switch
                      size="sm"
                      colorScheme="blue"
                      isChecked={block.enabled && !isStale}
                      isDisabled={isStale}
                      onChange={() => handleToggleLogicBlock(block.id)}
                    />
                    <Tooltip label="Delete Rule" fontSize="xs">
                      <IconButton
                        icon={<FaTrashAlt size={11} />}
                        size="xs"
                        variant="ghost"
                        color="red.500"
                        _hover={{ bg: "red.50" }}
                        onClick={() => handleDeleteLogicBlock(block.id)}
                        aria-label="Delete rule"
                      />
                    </Tooltip>
                  </HStack>
                </HStack>

                {/* Stale Component Warning Banner */}
                {isStale && (
                  <Box p={2.5} bg="red.50" borderRadius="xl" border="1px solid" borderColor="red.200" mb={3}>
                    <HStack justify="space-between" align="center">
                      <HStack spacing={2}>
                        <Text fontSize="12px">⚠️</Text>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs" fontWeight="bold" color="red.800">
                            Component Removed from Designer
                          </Text>
                          <Text fontSize="11px" color="red.600">
                            The component "{block.triggerName}" (ID: {block.triggerWidgetId}) was removed from the mobile app. Click Edit to reassign this rule.
                          </Text>
                        </VStack>
                      </HStack>
                      <Button size="xs" colorScheme="red" variant="outline" onClick={() => handleOpenEditRule(block, 0)}>
                        Reassign
                      </Button>
                    </HStack>
                  </Box>
                )}

                {/* Visual Blocks Interlocking Nodes - Clickable to configure each segment */}
                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={2.5} alignItems="stretch">
                  {/* Block 1: Trigger Node */}
                  <Box
                    p={3}
                    bg={isStale ? "#fef2f2" : "#fffbeb"}
                    border="1.5px solid"
                    borderColor={isStale ? "#fecaca" : "#fde68a"}
                    borderRadius="xl"
                    cursor="pointer"
                    transition="all 0.15s ease"
                    _hover={{ borderColor: isStale ? "#ef4444" : "#f59e0b", bg: isStale ? "#fee2e2" : "#fef3c7", transform: "translateY(-1px)" }}
                    onClick={() => handleOpenEditRule(block, 0)}
                  >
                    <HStack justify="space-between">
                      <Text fontSize="9px" fontWeight="extrabold" color={isStale ? "#b91c1c" : "#92400e"} letterSpacing="0.5px" textTransform="uppercase">
                        ⚡ TRIGGER EVENT
                      </Text>
                      <FaEdit size={9} color={isStale ? "#b91c1c" : "#b45309"} />
                    </HStack>
                    <Text fontSize="xs" fontWeight="bold" color={isStale ? "red.700" : "gray.900"} mt={1} noOfLines={1}>
                      {liveTriggerName}
                    </Text>
                    <HStack spacing={1} mt={0.5}>
                      <Text fontSize="11px" color={isStale ? "red.600" : "#b45309"} fontWeight="medium">
                        {block.event || "on_trigger"}
                      </Text>
                      {linkedWidget && (
                        <Text fontSize="10px" color="gray.400">
                          • {linkedWidget.type}
                        </Text>
                      )}
                    </HStack>
                  </Box>

                  {/* Block 2: Condition Node */}
                  <Box
                    p={3}
                    bg="#faf5ff"
                    border="1.5px solid"
                    borderColor="#e9d5ff"
                    borderRadius="xl"
                    cursor="pointer"
                    transition="all 0.15s ease"
                    _hover={{ borderColor: "#a855f7", bg: "#f3e8ff", transform: "translateY(-1px)" }}
                    onClick={() => handleOpenEditRule(block, 1)}
                  >
                    <HStack justify="space-between">
                      <Text fontSize="9px" fontWeight="extrabold" color="#6b21a8" letterSpacing="0.5px" textTransform="uppercase">
                        👁 CONDITION
                      </Text>
                      <FaEdit size={9} color="#7e22ce" />
                    </HStack>
                    <Text fontSize="xs" fontWeight="bold" color="gray.900" mt={1} noOfLines={1}>
                      {block.condition || "Always"}
                    </Text>
                    <Text fontSize="11px" color="#7e22ce" fontWeight="medium" mt={0.5}>
                      Pass check
                    </Text>
                  </Box>

                  {/* Block 3: Action Node */}
                  <Box
                    p={3}
                    bg="#f0fdf4"
                    border="1.5px solid"
                    borderColor="#bbf7d0"
                    borderRadius="xl"
                    cursor="pointer"
                    transition="all 0.15s ease"
                    _hover={{ borderColor: "#22c55e", bg: "#dcfce7", transform: "translateY(-1px)" }}
                    onClick={() => handleOpenEditRule(block, 2)}
                  >
                    <HStack justify="space-between">
                      <Text fontSize="9px" fontWeight="extrabold" color="#166534" letterSpacing="0.5px" textTransform="uppercase">
                        🪄 HARDWARE ACTION
                      </Text>
                      <FaEdit size={9} color="#15803d" />
                    </HStack>
                    <Text fontSize="xs" fontWeight="bold" color="gray.900" mt={1} noOfLines={1}>
                      {block.action || "Hardware Command"}
                    </Text>
                    <Text fontSize="11px" color="#15803d" fontWeight="semibold" mt={0.5} noOfLines={1}>
                      → {liveBinding || block.targetHardware || "ESP32 GPIO"}
                    </Text>
                  </Box>
                </Grid>
              </Box>
            );
          })}

        {logicBlocks.length === 0 && (
          <Box p={8} textAlign="center" bg="white" borderRadius="2xl" border="1px dashed" borderColor="gray.300">
            <FaCogs size={32} color="#94a3b8" style={{ margin: "0 auto 8px auto" }} />
            <Text fontWeight="bold" fontSize="sm" color="gray.700">No Automation Rules Configured</Text>
            <Text fontSize="xs" color="gray.500" mt={1} mb={4}>
              Connect your mobile UI components directly to physical ESP32 pins.
            </Text>
            <HStack justify="center" spacing={3}>
              <Button
                size="sm"
                colorScheme="blue"
                bg="#2563eb"
                _hover={{ bg: "#1d4ed8" }}
                leftIcon={<FaPlus size={11} />}
                onClick={() => handleOpenAddRule(0)}
                fontWeight="bold"
                shadow="sm"
              >
                + Add First Automation Rule
              </Button>
              <Button
                size="sm"
                variant="outline"
                colorScheme="purple"
                leftIcon={<FaBolt size={11} />}
                onClick={() => {
                  const generated = [];
                  const switchWidget = widgets.find((w) => w.type === "switch");
                  const sliderWidget = widgets.find((w) => w.type === "slider");
                  const buttonWidget = widgets.find((w) => w.type === "button");

                  if (switchWidget) {
                    generated.push({
                      id: `b-${Date.now()}-1`,
                      name: `${switchWidget.title} Sync`,
                      triggerType: "component",
                      triggerWidgetId: switchWidget.id,
                      triggerName: switchWidget.title,
                      event: "on_toggle",
                      condition: "Always",
                      conditionType: "Always",
                      action: "Send Serial Command",
                      payload: "LED:{state}",
                      targetHardware: switchWidget.boundTargetName || switchWidget.boundTarget || "GPIO 2 (Onboard LED)",
                      targetPin: switchWidget.pin || "GPIO 2",
                      enabled: true
                    });
                  }
                  if (sliderWidget) {
                    generated.push({
                      id: `b-${Date.now()}-2`,
                      name: `${sliderWidget.title} Driver`,
                      triggerType: "component",
                      triggerWidgetId: sliderWidget.id,
                      triggerName: sliderWidget.title,
                      event: "on_change",
                      condition: "Always",
                      conditionType: "Always",
                      action: "Write PWM Duty / Angle",
                      payload: "SERVO:{value}",
                      targetHardware: sliderWidget.boundTargetName || sliderWidget.boundTarget || "GPIO 4 (PWM Servo)",
                      targetPin: sliderWidget.pin || "GPIO 4",
                      enabled: true
                    });
                  }
                  if (buttonWidget) {
                    generated.push({
                      id: `b-${Date.now()}-3`,
                      name: `${buttonWidget.title} Trigger`,
                      triggerType: "component",
                      triggerWidgetId: buttonWidget.id,
                      triggerName: buttonWidget.title,
                      event: "on_press",
                      condition: "Always",
                      conditionType: "Always",
                      action: "Toggle GPIO Pin",
                      payload: "TOGGLE",
                      targetHardware: buttonWidget.boundTargetName || buttonWidget.boundTarget || "GPIO 2 (Onboard LED)",
                      targetPin: buttonWidget.pin || "GPIO 2",
                      enabled: true
                    });
                  }
                  // Telemetry rule
                  generated.push({
                    id: `b-${Date.now()}-telem`,
                    name: "High Temperature Guard",
                    triggerType: "telemetry",
                    triggerWidgetId: "telem_temp",
                    triggerName: "Temperature Sensor (ADC)",
                    event: "threshold_above",
                    condition: "Value > 30°C",
                    conditionType: "Value >",
                    conditionThreshold: "30",
                    conditionUnit: "°C",
                    action: "Send Serial Command",
                    payload: "ALARM:HIGH_TEMP",
                    targetHardware: "GPIO 2 (Alert Buzzer)",
                    targetPin: "GPIO 2",
                    enabled: true
                  });

                  setLogicBlocks(generated);
                  toast({
                    title: "Templates Loaded",
                    description: `Generated ${generated.length} rules synchronized with your active components.`,
                    status: "success",
                    duration: 2500
                  });
                }}
              >
                + Quick Templates
              </Button>
            </HStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
