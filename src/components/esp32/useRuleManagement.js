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
  const handleOpenAddRule = useCallback((initialTab = 0, specificWidget = null) => {
    const targetWidget = specificWidget || widgets[0];
    const defaultGpio = ESP32_GPIO_OPTIONS[0];
    setEditingRule({
      id: `b-${Date.now()}`,
      name: targetWidget ? `${targetWidget.title} Sync` : `Automation Rule #${logicBlocks.length + 1}`,
      triggerType: targetWidget ? "component" : "telemetry",
      triggerWidgetId: targetWidget?.id || "telem_temp",
      triggerName: targetWidget?.title || "Temperature Telemetry",
      event: targetWidget
        ? (targetWidget.type === "switch" ? "on_toggle" : targetWidget.type === "slider" ? "on_change" : targetWidget.type === "button" ? "on_press" : "on_update")
        : "threshold_above",
      condition: "Always",
      conditionType: "Always",
      conditionThreshold: "30",
      conditionUnit: "°C",
      action: defaultGpio.defaultAction || "Send Serial Command",
      payload: defaultGpio.defaultPayload || "LED:{state}",
      targetHardware: targetWidget?.boundTargetName || targetWidget?.boundTarget || (`${defaultGpio.pin} (${defaultGpio.defaultTarget})`),
      targetPin: targetWidget?.pin || defaultGpio.pin,
      enabled: true
    });
    setRuleModalTab(initialTab);
    setTestRuleResult(null);
    onRuleModalOpen();
  }, [widgets, logicBlocks.length, onRuleModalOpen]);

  const handleOpenEditRule = useCallback((rule, tabIndex = 0) => {
    setEditingRule({
      ...rule,
      triggerType: rule.triggerType || (rule.triggerWidgetId?.startsWith("telem_") ? "telemetry" : rule.triggerWidgetId?.startsWith("timer") ? "timer" : "component"),
      targetPin: rule.targetPin || rule.targetHardware?.split(" ")[0] || "GPIO 2",
      conditionType: rule.conditionType || (rule.condition?.includes(">") ? "Value >" : rule.condition?.includes("<") ? "Value <" : rule.condition?.includes("==") ? "Value ==" : "Always")
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
    handleOpenEditRule,
    handleSaveRuleModal,
    handleDeleteLogicBlock,
    handleToggleLogicBlock
  };
}
