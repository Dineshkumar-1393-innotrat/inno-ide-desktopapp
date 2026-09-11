import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Box,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Select,
  Switch,
  RadioGroup,
  Radio,
  Stack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from "@chakra-ui/react";
import { FaCogs } from "react-icons/fa";
import {
  ESP32_GPIO_OPTIONS,
  RULE_ACTION_TYPES,
  RULE_CONDITION_TYPES,
  TELEMETRY_TRIGGER_SOURCES
} from "./flasherConstants";

export default function RuleBuilderModal({
  isOpen,
  onClose,
  editingRule,
  setEditingRule,
  ruleModalTab,
  setRuleModalTab,
  widgets = [],
  testRuleResult,
  setTestRuleResult,
  isTestingRule,
  setIsTestingRule,
  serialTrafficLogs = [],
  handleExecuteRule,
  handleSaveRuleModal,
  borderColor = "gray.200",
  localCompanionUrl = "",
  companionServerInfo = null,
  selectedDevice = null,
  cleanUiList = [],
  cleanLogicsList = [],
  effectiveDeviceId = "esp32-companion-01",
  effectiveDeviceName = "ESP32 Companion",
  effectiveDeviceType = "LED",
  bundleQrPayload = ""
}) {
  const effectivePort = selectedDevice?.port || "COM9";

  if (!editingRule) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
      <ModalContent borderRadius="2xl" shadow="2xl" overflow="hidden">
        <ModalHeader bg="gray.50" borderBottom="1px" borderColor={borderColor} py={4}>
          <HStack justify="space-between" pr={6}>
            <HStack spacing={2}>
              <Box p={2} bg="blue.50" color="blue.600" borderRadius="lg">
                <FaCogs size={16} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontSize="md" fontWeight="extrabold" color="gray.800">
                  Rule Builder & Hardware Automation
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Configure trigger, condition, and ESP32 hardware binding
                </Text>
              </VStack>
            </HStack>
            <HStack spacing={2}>
              <Badge colorScheme={effectivePort ? "blue" : "gray"} fontSize="10px" px={2} py={0.5} borderRadius="full">
                {effectivePort}
              </Badge>
              <Badge colorScheme={editingRule.enabled ? "green" : "gray"} px={2} py={0.5} borderRadius="full">
                {editingRule.enabled ? "Rule Active" : "Rule Disabled"}
              </Badge>
            </HStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton top={4} right={4} />

        <ModalBody p={5}>
          <VStack spacing={4} align="stretch">
            {/* Rule Friendly Name & Active Status */}
            <HStack spacing={3} align="flex-end">
              <FormControl isRequired flex="1">
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.700">
                  Rule Name
                </FormLabel>
                <Input
                  size="sm"
                  borderRadius="lg"
                  value={editingRule.name || ""}
                  onChange={(e) => setEditingRule((r) => ({ ...r, name: e.target.value }))}
                  placeholder="e.g. LED Switch Sync, High Temp Alarm"
                  fontWeight="semibold"
                />
              </FormControl>
              <FormControl w="auto">
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.700">
                  Enabled
                </FormLabel>
                <Switch
                  colorScheme="blue"
                  isChecked={editingRule.enabled}
                  onChange={(e) => setEditingRule((r) => ({ ...r, enabled: e.target.checked }))}
                />
              </FormControl>
            </HStack>

            {/* 3 Interactive Configuration Tabs */}
            <Tabs index={ruleModalTab} onChange={(idx) => setRuleModalTab(idx)} variant="enclosed" colorScheme="blue">
              <TabList mb="1em">
                <Tab fontSize="xs" fontWeight="bold">
                  ⚡ 1. Trigger
                </Tab>
                <Tab fontSize="xs" fontWeight="bold">
                  👁 2. Condition
                </Tab>
                <Tab fontSize="xs" fontWeight="bold">
                  🪄 3. Hardware Action
                </Tab>
              </TabList>

              <TabPanels>
                {/* TAB 1: TRIGGER CONFIGURATION */}
                <TabPanel p={1}>
                  <VStack spacing={3.5} align="stretch">
                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="bold">
                        Trigger Source Type
                      </FormLabel>
                      <RadioGroup
                        value={editingRule.triggerType || "component"}
                        onChange={(val) => {
                          if (val === "component") {
                            const w = widgets[0];
                            setEditingRule((r) => ({
                              ...r,
                              triggerType: "component",
                              triggerWidgetId: w?.id || "",
                              triggerName: w?.title || "Mobile Component",
                              event: w?.type === "switch" ? "on_toggle" : w?.type === "slider" ? "on_change" : "on_press"
                            }));
                          } else if (val === "telemetry") {
                            const t = TELEMETRY_TRIGGER_SOURCES[0];
                            setEditingRule((r) => ({
                              ...r,
                              triggerType: "telemetry",
                              triggerWidgetId: t.id,
                              triggerName: t.name,
                              event: "threshold_above",
                              conditionThreshold: t.defaultThreshold,
                              conditionUnit: t.unit
                            }));
                          } else {
                            setEditingRule((r) => ({
                              ...r,
                              triggerType: "timer",
                              triggerWidgetId: "timer_periodic",
                              triggerName: "Hardware Heartbeat Timer",
                              event: "timer_interval"
                            }));
                          }
                        }}
                      >
                        <Stack direction="row" spacing={4}>
                          <Radio value="component" size="sm">
                            Mobile UI Component
                          </Radio>
                          <Radio value="telemetry" size="sm">
                            ESP32 Telemetry Stream
                          </Radio>
                          <Radio value="timer" size="sm">
                            Periodic Timer Interval
                          </Radio>
                        </Stack>
                      </RadioGroup>
                    </FormControl>

                    {/* UI Component Picker */}
                    {editingRule.triggerType !== "telemetry" && editingRule.triggerType !== "timer" && (() => {
                      const activeChosenWidget = widgets.find((w) => w.id === editingRule.triggerWidgetId);
                      const isReferencedWidgetMissing = Boolean(
                        editingRule.triggerWidgetId && !activeChosenWidget
                      );

                      return (
                        <FormControl isRequired>
                          <FormLabel fontSize="xs" fontWeight="bold">
                            Select UI Component (from Designer)
                          </FormLabel>

                          {isReferencedWidgetMissing && (
                            <Box p={3} bg="red.50" border="1px solid" borderColor="red.200" borderRadius="lg" mb={2.5}>
                              <Text fontSize="xs" color="red.700" fontWeight="bold">
                                ⚠️ Component Not Found in Mobile App
                              </Text>
                              <Text fontSize="11px" color="red.600" mt={0.5}>
                                The component "{editingRule.triggerName}" (ID: {editingRule.triggerWidgetId}) was removed from the Designer. Please select an available component from the list below.
                              </Text>
                            </Box>
                          )}

                          {widgets.length === 0 ? (
                            <Box p={3} bg="orange.50" border="1px solid" borderColor="orange.200" borderRadius="lg">
                              <Text fontSize="xs" color="orange.700" fontWeight="medium">
                                No mobile UI components have been added to the mobile app yet. Please switch to the Designer to add components, or select Telemetry / Timer as the trigger source above.
                              </Text>
                            </Box>
                          ) : (
                            <Select
                              size="sm"
                              borderRadius="lg"
                              value={activeChosenWidget ? editingRule.triggerWidgetId : ""}
                              placeholder={isReferencedWidgetMissing ? "-- Select an active component --" : undefined}
                              onChange={(e) => {
                                const chosen = widgets.find((w) => w.id === e.target.value);
                                if (chosen) {
                                  const defEvent = chosen.type === "switch" ? "on_toggle" : chosen.type === "slider" ? "on_change" : chosen.type === "button" ? "on_press" : "on_update";
                                  setEditingRule((r) => ({
                                    ...r,
                                    triggerWidgetId: chosen.id,
                                    triggerName: chosen.title,
                                    event: defEvent,
                                    targetPin: chosen.pin || r.targetPin,
                                    targetHardware: chosen.boundTargetName || chosen.boundTarget || r.targetHardware,
                                    isStale: false
                                  }));
                                }
                              }}
                            >
                              {widgets.map((w) => (
                                <option key={w.id} value={w.id}>
                                  {w.title} ({w.type}) — Binding: {w.boundTargetName || w.boundTarget || "None"} [ID: {w.id}]
                                </option>
                              ))}
                            </Select>
                          )}
                        </FormControl>
                      );
                    })()}

                    {/* Telemetry Sensor Picker */}
                    {editingRule.triggerType === "telemetry" && (
                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">
                          Select Telemetry Sensor
                        </FormLabel>
                        <Select
                          size="sm"
                          borderRadius="lg"
                          value={editingRule.triggerWidgetId}
                          onChange={(e) => {
                            const chosen = TELEMETRY_TRIGGER_SOURCES.find((t) => t.id === e.target.value);
                            if (chosen) {
                              setEditingRule((r) => ({
                                ...r,
                                triggerWidgetId: chosen.id,
                                triggerName: chosen.name,
                                conditionThreshold: chosen.defaultThreshold,
                                conditionUnit: chosen.unit
                              }));
                            }
                          }}
                        >
                          {TELEMETRY_TRIGGER_SOURCES.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} (Pin: {t.pin}) [{t.unit}]
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    )}

                    {/* Trigger Event Type */}
                    <FormControl isRequired>
                      <FormLabel fontSize="xs" fontWeight="bold">
                        Trigger Event
                      </FormLabel>
                      <Select
                        size="sm"
                        borderRadius="lg"
                        value={editingRule.event || "on_toggle"}
                        onChange={(e) => setEditingRule((r) => ({ ...r, event: e.target.value }))}
                      >
                        <option value="on_toggle">on_toggle (Switch turned ON / OFF)</option>
                        <option value="on_change">on_change (Slider or analog value moved)</option>
                        <option value="on_press">on_press (Button tapped)</option>
                        <option value="threshold_above">threshold_above (Sensor value exceeds limit)</option>
                        <option value="threshold_below">threshold_below (Sensor value drops below limit)</option>
                        <option value="timer_interval">timer_interval (Periodic hardware polling)</option>
                      </Select>
                      <FormHelperText fontSize="10px">
                        Defines when this automation sequence will be evaluated.
                      </FormHelperText>
                    </FormControl>

                    {/* Visual Summary Box */}
                    {(() => {
                      const linked = widgets.find((w) => w.id === editingRule.triggerWidgetId);
                      return (
                        <Box p={3} bg="amber.50" borderRadius="xl" border="1px solid" borderColor="amber.200">
                          <Text fontSize="xs" fontWeight="bold" color="amber.900">
                            Trigger Summary:
                          </Text>
                          <Text fontSize="xs" color="amber.800" mt={0.5}>
                            When <strong>{linked?.title || editingRule.triggerName}</strong>
                            {linked && ` (${linked.type})`} fires <code>{editingRule.event}</code>
                          </Text>
                          {linked && (linked.boundTargetName || linked.boundTarget) && (
                            <Text fontSize="11px" color="amber.700" mt={0.5}>
                              Hardware Binding: <strong>{linked.boundTargetName || linked.boundTarget}</strong>
                            </Text>
                          )}
                        </Box>
                      );
                    })()}
                  </VStack>
                </TabPanel>

                {/* TAB 2: CONDITION CONFIGURATION */}
                <TabPanel p={1}>
                  <VStack spacing={3.5} align="stretch">
                    <FormControl isRequired>
                      <FormLabel fontSize="xs" fontWeight="bold">
                        Condition Operator
                      </FormLabel>
                      <Select
                        size="sm"
                        borderRadius="lg"
                        value={editingRule.conditionType || (editingRule.condition?.includes(">") ? "Value >" : editingRule.condition?.includes("<") ? "Value <" : editingRule.condition?.includes("==") ? "Value ==" : "Always")}
                        onChange={(e) => {
                          const val = e.target.value;
                          const condObj = RULE_CONDITION_TYPES.find((c) => c.value === val);
                          let newCond = val;
                          if (val === "Always") {
                            newCond = "Always";
                          } else if (val === "Value >") {
                            newCond = `Value > ${editingRule.conditionThreshold || condObj?.defaultThreshold || "30"}${editingRule.conditionUnit || "°C"}`;
                          } else if (val === "Value <") {
                            newCond = `Value < ${editingRule.conditionThreshold || condObj?.defaultThreshold || "10"}${editingRule.conditionUnit || "°C"}`;
                          } else if (val === "Value ==") {
                            newCond = `Value == ${editingRule.conditionThreshold || "1"}`;
                          } else if (val === "Value !=") {
                            newCond = `Value != ${editingRule.conditionThreshold || "0"}`;
                          }
                          setEditingRule((r) => ({
                            ...r,
                            conditionType: val,
                            condition: newCond
                          }));
                        }}
                      >
                        {RULE_CONDITION_TYPES.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </Select>
                      <FormHelperText fontSize="10px">
                        Evaluate incoming trigger data before deciding to execute the hardware action.
                      </FormHelperText>
                    </FormControl>

                    {/* Threshold & Unit */}
                    {editingRule.conditionType && editingRule.conditionType !== "Always" && (
                      <Grid templateColumns="2fr 1fr" gap={2}>
                        <FormControl isRequired>
                          <FormLabel fontSize="xs" fontWeight="bold">
                            Threshold Value
                          </FormLabel>
                          <Input
                            size="sm"
                            borderRadius="lg"
                            value={editingRule.conditionThreshold || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditingRule((r) => ({
                                ...r,
                                conditionThreshold: val,
                                condition: `${r.conditionType || "Value >"} ${val}${r.conditionUnit || ""}`
                              }));
                            }}
                            placeholder="e.g. 30"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="bold">
                            Unit
                          </FormLabel>
                          <Input
                            size="sm"
                            borderRadius="lg"
                            value={editingRule.conditionUnit || ""}
                            onChange={(e) => {
                              const u = e.target.value;
                              setEditingRule((r) => ({
                                ...r,
                                conditionUnit: u,
                                condition: `${r.conditionType || "Value >"} ${r.conditionThreshold || "30"}${u}`
                              }));
                            }}
                            placeholder="e.g. °C, %, V"
                          />
                        </FormControl>
                      </Grid>
                    )}

                    <Box p={3} bg="purple.50" borderRadius="xl" border="1px solid" borderColor="purple.200">
                      <Text fontSize="xs" fontWeight="bold" color="purple.900">
                        Evaluated Logic Check:
                      </Text>
                      <Text fontSize="xs" color="purple.800" mt={0.5}>
                        Condition formula: <code>{editingRule.condition || "Always (Pass check)"}</code>
                      </Text>
                    </Box>
                  </VStack>
                </TabPanel>

                {/* TAB 3: HARDWARE ACTION CONFIGURATION */}
                <TabPanel p={1}>
                  <VStack spacing={3.5} align="stretch">
                    <FormControl isRequired>
                      <FormLabel fontSize="xs" fontWeight="bold">
                        Hardware Action Type
                      </FormLabel>
                      <Select
                        size="sm"
                        borderRadius="lg"
                        value={editingRule.action || "Send Serial Command"}
                        onChange={(e) => {
                          const act = e.target.value;
                          const actObj = RULE_ACTION_TYPES.find((a) => a.value === act);
                          setEditingRule((r) => ({
                            ...r,
                            action: act,
                            payload: actObj?.defaultPayload || r.payload
                          }));
                        }}
                      >
                        {RULE_ACTION_TYPES.map((a) => (
                          <option key={a.value} value={a.value}>
                            {a.label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Component Hardware Binding Helper */}
                    {(() => {
                      const linked = widgets.find((w) => w.id === editingRule.triggerWidgetId);
                      const bindingStr = linked?.boundTargetName || linked?.boundTarget;
                      if (!bindingStr) return null;
                      return (
                        <HStack justify="space-between" bg="blue.50" p={2.5} borderRadius="lg" border="1px solid" borderColor="blue.200">
                          <VStack align="start" spacing={0}>
                            <Text fontSize="10px" color="blue.600" fontWeight="bold" textTransform="uppercase">
                              Component Hardware Binding
                            </Text>
                            <Text fontSize="xs" color="blue.900" fontWeight="extrabold">
                              {bindingStr}
                            </Text>
                          </VStack>
                          <Button
                            size="xs"
                            colorScheme="blue"
                            variant="outline"
                            onClick={() => {
                              const foundGpio = ESP32_GPIO_OPTIONS.find(
                                (g) =>
                                  (linked.pin && g.pin === linked.pin) ||
                                  (linked.boundTarget && (g.defaultTarget?.toLowerCase().includes(linked.boundTarget.toLowerCase()) || linked.boundTarget.toLowerCase().includes(g.pin.toLowerCase()))) ||
                                  (linked.boundTargetName && (g.defaultTarget?.toLowerCase().includes(linked.boundTargetName.toLowerCase()) || linked.boundTargetName.toLowerCase().includes(g.pin.toLowerCase())))
                              );
                              if (foundGpio) {
                                setEditingRule((r) => ({
                                  ...r,
                                  targetPin: foundGpio.pin,
                                  targetHardware: `${foundGpio.pin} (${foundGpio.defaultTarget})`,
                                  payload: r.payload || foundGpio.defaultPayload
                                }));
                              }
                            }}
                          >
                            Sync with Binding
                          </Button>
                        </HStack>
                      );
                    })()}

                    <FormControl isRequired>
                      <FormLabel fontSize="xs" fontWeight="bold">
                        Target ESP32 GPIO Pin / Target
                      </FormLabel>
                      <Select
                        size="sm"
                        borderRadius="lg"
                        value={editingRule.targetPin || editingRule.targetHardware?.split(" ")[0] || "GPIO 2"}
                        onChange={(e) => {
                          const pinVal = e.target.value;
                          const gpio = ESP32_GPIO_OPTIONS.find((g) => g.pin === pinVal);
                          if (gpio) {
                            setEditingRule((r) => ({
                              ...r,
                              targetPin: gpio.pin,
                              targetHardware: `${gpio.pin} (${gpio.defaultTarget})`,
                              payload: r.payload || gpio.defaultPayload
                            }));
                          }
                        }}
                      >
                        {ESP32_GPIO_OPTIONS.map((g) => (
                          <option key={g.pin} value={g.pin}>
                            {g.label} — [{g.role}]
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontSize="xs" fontWeight="bold">
                        Serial Payload / Command String
                      </FormLabel>
                      <Input
                        size="sm"
                        fontFamily="monospace"
                        borderRadius="lg"
                        value={editingRule.payload || ""}
                        onChange={(e) => setEditingRule((r) => ({ ...r, payload: e.target.value }))}
                        placeholder="e.g. LED:{state}, SET LED={state}, SERVO:{value}"
                      />
                      <FormHelperText fontSize="10px">
                        Placeholders: <code>{"{state}"}</code> (0 or 1), <code>{"{value}"}</code> (number), <code>{"{state_str}"}</code> (HIGH or LOW).
                      </FormHelperText>
                    </FormControl>

                    <Box p={3} bg="green.50" borderRadius="xl" border="1px solid" borderColor="green.200">
                      <Text fontSize="xs" fontWeight="bold" color="green.900">
                        Hardware Action Target:
                      </Text>
                      <Text fontSize="xs" color="green.800" mt={0.5}>
                        Execute <strong>{editingRule.action}</strong> on <strong>{editingRule.targetHardware || "GPIO"}</strong> with payload <code>{editingRule.payload || "LED:{state}"}</code>
                      </Text>
                    </Box>
                  </VStack>
                </TabPanel>

              </TabPanels>
            </Tabs>
          </VStack>
        </ModalBody>

        <ModalFooter p={4} borderTop="1px" borderColor={borderColor} bg="gray.50">
          <HStack spacing={3} justify="space-between" w="100%">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              colorScheme="blue"
              bg="#2563eb"
              _hover={{ bg: "#1d4ed8" }}
              onClick={handleSaveRuleModal}
              fontWeight="bold"
              px={5}
            >
              Save Rule
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
