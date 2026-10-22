import { useState, useCallback } from "react";
import { useDisclosure } from "@chakra-ui/react";
import { ESP32_GPIO_OPTIONS } from "../flasherConstants";

/**
 * Custom hook to manage RuleBuilderModal state,
 * automation logic block CRUD, and rule toggling.
 */
export default function useRuleManagement({
  widgets,
  logicBlocks,
  setLogicBlocks,
  toast
}) {
  const { isOpen: isRuleModalOpen, onOpen: onRuleModalOpen, onClose: onRuleModalClose } = useDisclosure();
  const [editingRule, setEditingRule] = useState(null);
  const [ruleModalTab, setRuleModalTab] = useState(0); // 0: Trigger, 1: Condition, 2: Action, 3: Test
  const [testRuleResult, setTestRuleResult] = useState(null);
  const [isTestingRule, setIsTestingRule] = useState(false);

  // Logic Blocks Management & Interactive Rule Builder
  const handleOpenAddRule = useCallback((initialTab = 0, specificWidget = null, preset = null) => {
    const targetWidget = specificWidget || widgets[0];
    const defaultGpio = ESP32_GPIO_OPTIONS[0];
    const isLocationPreset = preset === "location";

    setEditingRule({
      id: `b-${Date.now()}`,
      name: isLocationPreset
        ? `${targetWidget?.title || "Switch"} Location & OTP Guard`
        : (targetWidget ? `${targetWidget.title} Sync` : `Automation Rule #${logicBlocks.length + 1}`),
      triggerType: targetWidget ? "component" : "telemetry",
      triggerWidgetId: targetWidget?.id || "telem_temp",
      triggerName: targetWidget?.title || "Temperature Telemetry",
      event: isLocationPreset
        ? "on_toggle"
        : (targetWidget
          ? (targetWidget.type === "switch" ? "on_toggle" : targetWidget.type === "slider" ? "on_change" : targetWidget.type === "button" ? "on_press" : "on_update")
          : "threshold_above"),
      condition: isLocationPreset
        ? "Location Mismatch on Turn OFF (> 100m OTP)"
        : "Always",
      conditionType: isLocationPreset
        ? "Location Mismatch on Turn OFF (OTP Guard)"
        : "Always",
      conditionThreshold: isLocationPreset ? "100" : "30",
      conditionUnit: isLocationPreset ? "m" : "°C",
      action: isLocationPreset
        ? "Send Serial Command (Location Verified)"
        : (defaultGpio.defaultAction || "Send Serial Command"),
      payload: defaultGpio.defaultPayload || "LED:{state}",
      targetHardware: targetWidget?.boundTargetName || targetWidget?.boundTarget || (`${defaultGpio.pin} (${defaultGpio.defaultTarget})`),
      targetPin: targetWidget?.pin || defaultGpio.pin,
      enabled: true
    });
    setRuleModalTab(initialTab);
    setTestRuleResult(null);
    onRuleModalOpen();
  }, [widgets, logicBlocks.length, onRuleModalOpen]);

  // Dedicated quick helper for Location & OTP Rule
  const handleOpenAddLocationRule = useCallback((specificWidget = null) => {
    const switchWidget = specificWidget || widgets.find((w) => w.type === "switch") || widgets[0];
    handleOpenAddRule(1, switchWidget, "location"); // open directly on Condition tab
  }, [widgets, handleOpenAddRule]);

  const handleOpenEditRule = useCallback((rule, tabIndex = 0) => {
    const isLocMismatch = rule.conditionType === "Location Mismatch on Turn OFF (OTP Guard)" || rule.condition?.includes("Location Mismatch");
    const isWithinGeofence = rule.conditionType === "Within Geofence (<= Distance)" || rule.condition?.includes("Within Geofence");
    const isOutsideGeofence = rule.conditionType === "Outside Geofence (> Distance)" || rule.condition?.includes("Outside Geofence");
    const isGpsVerified = rule.conditionType === "GPS Location Verified" || rule.condition?.includes("GPS Location");

    let resolvedConditionType = "Always";
    if (rule.conditionType) {
      resolvedConditionType = rule.conditionType;
    } else if (isLocMismatch) {
      resolvedConditionType = "Location Mismatch on Turn OFF (OTP Guard)";
    } else if (isWithinGeofence) {
      resolvedConditionType = "Within Geofence (<= Distance)";
    } else if (isOutsideGeofence) {
      resolvedConditionType = "Outside Geofence (> Distance)";
    } else if (isGpsVerified) {
      resolvedConditionType = "GPS Location Verified";
    } else if (rule.condition?.includes(">")) {
      resolvedConditionType = "Value >";
    } else if (rule.condition?.includes("<")) {
      resolvedConditionType = "Value <";
    } else if (rule.condition?.includes("==")) {
      resolvedConditionType = "Value ==";
    }

    setEditingRule({
      ...rule,
      triggerType: rule.triggerType || (rule.triggerWidgetId?.startsWith("telem_") ? "telemetry" : rule.triggerWidgetId?.startsWith("timer") ? "timer" : "component"),
      targetPin: rule.targetPin || rule.targetHardware?.split(" ")[0] || "GPIO 2",
      conditionType: resolvedConditionType,
      conditionUnit: rule.conditionUnit || (resolvedConditionType.includes("Geofence") || resolvedConditionType.includes("Location") ? "m" : "°C")
    });
    setRuleModalTab(tabIndex);
    setTestRuleResult(null);
    onRuleModalOpen();
  }, [onRuleModalOpen]);

  const handleSaveRuleModal = useCallback(() => {
    if (!editingRule) return;
    setLogicBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === editingRule.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = editingRule;
        return next;
      }
      return [...prev, editingRule];
    });

    if (toast) {
      toast({
        title: "Rule Saved",
        description: `Rule "${editingRule.name}" configuration saved and active.`,
        status: "success",
        duration: 2000
      });
    }
    onRuleModalClose();
  }, [editingRule, setLogicBlocks, onRuleModalClose, toast]);

  const handleDeleteLogicBlock = useCallback((id) => {
    setLogicBlocks((prev) => prev.filter((b) => b.id !== id));
    if (toast) {
      toast({ title: "Rule Deleted", status: "info", duration: 1500 });
    }
  }, [setLogicBlocks, toast]);

  const handleToggleLogicBlock = useCallback((id) => {
    setLogicBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b))
    );
  }, [setLogicBlocks]);

  return {
    isRuleModalOpen,
    onRuleModalOpen,
    onRuleModalClose,
    editingRule,
    setEditingRule,
    ruleModalTab,
    setRuleModalTab,
    testRuleResult,
    setTestRuleResult,
    isTestingRule,
    setIsTestingRule,
    handleOpenAddRule,
    handleOpenAddLocationRule,
    handleOpenEditRule,
    handleSaveRuleModal,
    handleDeleteLogicBlock,
    handleToggleLogicBlock
  };
}
