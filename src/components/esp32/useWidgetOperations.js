import { useState, useCallback } from "react";

/**
 * Custom hook to manage Widget CRUD operations,
 * Drag & Drop hierarchy reordering, canvas drop handling,
 * and hardware actuator dispatch on widget state changes.
 */
export default function useWidgetOperations({
  widgets,
  setWidgets,
  selectedWidgetId,
  setSelectedWidgetId,
  pushWidgetsToHistory,
  autoPersistApp,
  logicBlocks,
  setLogicBlocks,
  selectedDevice,
  activePort,
  setLiveLedToggle,
  handleToggleHardwareLed,
  setSerialTrafficLogs,
  evaluateRulesForWidget,
  toast
}) {
  // Drag and Drop (DnD) State for App Builder Canvas & Palette
  const [draggedPaletteItem, setDraggedPaletteItem] = useState(null);
  const [draggedWidgetId, setDraggedWidgetId] = useState(null);
  const [dropInsertIndex, setDropInsertIndex] = useState(null);
  const [isDraggingOverPhone, setIsDraggingOverPhone] = useState(false);
  const isDraggingActive = Boolean(draggedPaletteItem || draggedWidgetId || isDraggingOverPhone);

  // Add Component to App Builder (supports optional insertIndex for Drag & Drop)
  const handleAddComponent = useCallback((type, title, defaultBinding, insertIndex = -1) => {
    const newId = `w-${Date.now()}`;
    const newWidget = {
      id: newId,
      type,
      title: title || (
        type === "location" ? "Location Button" :
        type === "top_button" ? "Top Button" :
        type === "bottom_button" ? "Bottom Button" :
        type === "left_button" ? "Left Button" :
        type === "right_button" ? "Right Button" :
        type === "dpad" ? "Directional D-Pad" :
        type === "crud_table" ? "Data Records" :
        type === "divider" ? "Divider" :
        type === "fab" ? "Floating Action" :
        type === "card" ? "Info Card" :
        type === "image" ? "Camera / Image" :
        type === "progress" ? "Status Progress" :
        type === "textfield" ? "Google Form Field" :
        type === "label" ? "Text Label" :
        type === "button" ? "Action Button" : `New ${type}`
      ),
      boundTarget: defaultBinding || (
        type === "location" ? "GPS / Geolocation" :
        type === "top_button" ? "GPIO 13 (Motor A)" :
        type === "bottom_button" ? "GPIO 14 (Motor B)" :
        type === "left_button" ? "GPIO 12 (Steer Left)" :
        type === "right_button" ? "GPIO 15 (Steer Right)" :
        type === "dpad" ? "GPIO Multi-Motor" :
        type === "crud_table" ? "Local Storage / Device Data" :
        type === "button" ? "GPIO 2 (Relay)" :
        type === "slider" ? "GPIO 18 (PWM)" :
        type === "gauge" ? "GPIO 34 (ADC Temp)" :
        type === "switch" ? "GPIO 4 (LED)" :
        type === "chart" ? "GPIO 35 (Sensor Stream)" :
        type === "textfield" ? "Dynamic Form Stream" :
        type === "label" ? "Telemetry Stream" : "GPIO Pin"
      ),
      boundTargetName: `Bound → ${defaultBinding || (
        type === "location" ? "GPS / Geolocation" :
        type === "top_button" ? "GPIO 13 (Motor A)" :
        type === "bottom_button" ? "GPIO 14 (Motor B)" :
        type === "left_button" ? "GPIO 12 (Steer Left)" :
        type === "right_button" ? "GPIO 15 (Steer Right)" :
        type === "dpad" ? "GPIO Multi-Motor" :
        type === "crud_table" ? "Local Storage" :
        type === "button" ? "GPIO 2 (Relay)" :
        type === "slider" ? "GPIO 18 (PWM)" :
        type === "gauge" ? "GPIO 34 (ADC)" :
        type === "switch" ? "GPIO 4 (LED)" :
        type === "chart" ? "GPIO 35 (Sensor)" :
        type === "textfield" ? "Dynamic Form Stream" :
        type === "label" ? "Telemetry" : "GPIO Pin"
      )}`,
      action: (
        type === "location" ? "Track Switch Events" :
        type === "switch" ? "Turn ON / OFF" :
        type === "slider" ? "Set PWM Angle" :
        type === "gauge" ? "Read Telemetry" :
        type === "top_button" ? "Forward (Top) Pulse" :
        type === "bottom_button" ? "Reverse (Bottom) Pulse" :
        type === "left_button" ? "Steer Left Pulse" :
        type === "right_button" ? "Steer Right Pulse" :
        type === "dpad" ? "4-Way Directional Control" :
        type === "crud_table" ? "CRUD Storage" : "Execute Action"
      ),
      state: false,
      value: type === "slider" ? 50 : type === "gauge" ? 25.0 : 0,
      min: 0,
      max: type === "slider" ? 180 : type === "gauge" ? 100 : 100,
      unit: type === "slider" ? "°" : type === "gauge" ? "°C" : "",
      color: (
        type === "location" ? "#0284c7" :
        type === "gauge" ? "#ef4444" :
        type === "slider" ? "#8b5cf6" :
        type === "switch" ? "#2563eb" :
        type === "top_button" ? "#2563eb" :
        type === "bottom_button" ? "#0284c7" :
        type === "left_button" ? "#7c3aed" :
        type === "right_button" ? "#9333ea" :
        type === "dpad" ? "#1e293b" :
        type === "crud_table" ? "#2563eb" :
        type === "button" ? "#ea580c" :
        type === "fab" ? "#2563eb" : "#10b981"
      ),
      cornerRadius: 16,
      visible: true,
      lastLocation: type === "location" ? null : undefined,
      locationHistory: type === "location" ? [] : undefined,
      questions: type === "textfield" ? [] : undefined,
      responses: type === "textfield" ? [] : undefined,
      records: type === "crud_table" ? [
        { id: "rec-1", name: "Device Status", value: "Active", status: "Active", timestamp: "10:00 AM" },
        { id: "rec-2", name: "Temperature Alert", value: "24.5°C", status: "Normal", timestamp: "10:15 AM" },
        { id: "rec-3", name: "GPIO Relay", value: "Closed", status: "Active", timestamp: "10:30 AM" }
      ] : undefined
    };

    let updated;
    if (typeof insertIndex === "number" && insertIndex >= 0 && insertIndex <= widgets.length) {
      updated = [...widgets];
      updated.splice(insertIndex, 0, newWidget);
    } else {
      updated = [...widgets, newWidget];
    }

    setWidgets(updated);
    if (pushWidgetsToHistory) pushWidgetsToHistory(updated);
    if (setSelectedWidgetId) setSelectedWidgetId(newId);
    if (autoPersistApp) autoPersistApp(updated);

    if (toast) {
      toast({
        title: "Component Added",
        description: `Added "${newWidget.title}" to your mobile app canvas.`,
        status: "success",
        duration: 1800
      });
    }
  }, [widgets, setWidgets, pushWidgetsToHistory, setSelectedWidgetId, autoPersistApp, toast]);

  // Update Widget Attribute
  const handleUpdateWidget = useCallback((prop, value, customWidgetId = null) => {
    const targetId = customWidgetId || selectedWidgetId;
    if (!targetId) return;

    let targetWidget = null;
    let nextWidgets = null;

    setWidgets((prev) => {
      targetWidget = prev.find((w) => w.id === targetId);
      nextWidgets = prev.map((w) => (w.id === targetId ? { ...w, [prop]: value } : w));
      return nextWidgets;
    });

    if (nextWidgets && autoPersistApp) {
      autoPersistApp(nextWidgets);
    }

    // Real-time hardware serial communication on state/value change OUTSIDE setWidgets
    if (prop === "state" || prop === "value") {
      const tgt = targetWidget || widgets.find((w) => w.id === targetId);
      const targetPort = selectedDevice?.port || activePort || "COM9";
      if (tgt) {
        if (tgt.type === "switch" || /led|light/i.test(tgt.title || "") || targetId === "w-led") {
          if (setLiveLedToggle) setLiveLedToggle(Boolean(value));
          if (handleToggleHardwareLed) handleToggleHardwareLed(Boolean(value));
        } else if (window.electronAPI?.serial?.write && targetPort) {
          const cmd = `SET ${tgt.title.replace(/\s+/g, "_").toUpperCase()}=${value}\r\n`;
          window.electronAPI.serial.write(targetPort, cmd).catch(() => { });
          if (setSerialTrafficLogs) {
            setSerialTrafficLogs((logs) => [
              ...logs.slice(-20),
              { id: Date.now(), type: "tx", text: `TX -> ${targetPort}: ${cmd.trim()}`, time: new Date().toLocaleTimeString() }
            ]);
          }
        }
      }
      // If it is w-led, handleToggleHardwareLed already dispatched the LED command.
      // Avoid duplicate simultaneous writes for the same widget.
      if (tgt && evaluateRulesForWidget) {
        evaluateRulesForWidget(tgt, prop, value);
      }
    }
  }, [
    selectedWidgetId,
    widgets,
    setWidgets,
    autoPersistApp,
    selectedDevice,
    activePort,
    setLiveLedToggle,
    handleToggleHardwareLed,
    setSerialTrafficLogs,
    evaluateRulesForWidget
  ]);

  // Delete Component
  const handleDeleteWidget = useCallback((id) => {
    const deletedWidget = widgets.find((w) => w.id === id);
    const updated = widgets.filter((w) => w.id !== id);
    setWidgets(updated);
    if (pushWidgetsToHistory) pushWidgetsToHistory(updated);
    if (selectedWidgetId === id && setSelectedWidgetId) {
      setSelectedWidgetId(updated[0]?.id || "");
    }
    if (autoPersistApp) autoPersistApp(updated);

    // Prevent stale component references in rules
    const affectedRules = logicBlocks.filter((b) => b.triggerWidgetId === id);
    if (affectedRules.length > 0) {
      setLogicBlocks((prev) =>
        prev.map((b) =>
          b.triggerWidgetId === id ? { ...b, enabled: false, isStale: true } : b
        )
      );
      if (toast) {
        toast({
          title: "Component Removed",
          description: `"${deletedWidget?.title || "Component"}" was deleted. ${affectedRules.length} rule(s) referencing it marked as invalid.`,
          status: "warning",
          duration: 3500,
          isClosable: true
        });
      }
    } else if (toast) {
      toast({ title: "Component Removed", status: "info", duration: 1500 });
    }
  }, [
    widgets,
    setWidgets,
    pushWidgetsToHistory,
    selectedWidgetId,
    setSelectedWidgetId,
    autoPersistApp,
    logicBlocks,
    setLogicBlocks,
    toast
  ]);

  // Move Component Up / Down in Tree
  const handleMoveWidget = useCallback((id, direction) => {
    const index = widgets.findIndex((w) => w.id === id);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === widgets.length - 1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const reordered = [...widgets];
    const [movedItem] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, movedItem);

    setWidgets(reordered);
    if (pushWidgetsToHistory) pushWidgetsToHistory(reordered);
    if (autoPersistApp) autoPersistApp(reordered);
  }, [widgets, setWidgets, pushWidgetsToHistory, autoPersistApp]);

  // Reorder Component via Drag & Drop
  const handleReorderWidget = useCallback((fromIndex, toIndex) => {
    if (fromIndex === undefined || fromIndex === null || toIndex === undefined || toIndex === null) return;
    if (fromIndex < 0 || fromIndex >= widgets.length) return;
    if (fromIndex === toIndex || (fromIndex < toIndex && toIndex === fromIndex + 1)) return;

    const reordered = [...widgets];
    const [movedItem] = reordered.splice(fromIndex, 1);
    const targetIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
    reordered.splice(targetIndex, 0, movedItem);

    setWidgets(reordered);
    if (pushWidgetsToHistory) pushWidgetsToHistory(reordered);
    if (autoPersistApp) autoPersistApp(reordered);
    if (setSelectedWidgetId) setSelectedWidgetId(movedItem.id);
  }, [widgets, setWidgets, pushWidgetsToHistory, autoPersistApp, setSelectedWidgetId]);

  // Drag & Drop Handlers for Canvas & Widgets
  const handleWidgetDragOver = useCallback((e, idx) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = draggedWidgetId ? "move" : "copy";
    setIsDraggingOverPhone(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const targetIdx = e.clientY < midY ? idx : idx + 1;
    if (dropInsertIndex !== targetIdx) {
      setDropInsertIndex(targetIdx);
    }
  }, [draggedWidgetId, dropInsertIndex]);

  const handlePhoneDrop = useCallback((e, targetIndex = null) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverPhone(false);
    const insertIdx = targetIndex !== null ? targetIndex : (dropInsertIndex !== null ? dropInsertIndex : widgets.length);
    setDropInsertIndex(null);

    try {
      const rawData = e.dataTransfer.getData("application/json");
      if (!rawData) return;
      const data = JSON.parse(rawData);

      if (data.source === "palette") {
        handleAddComponent(data.type, data.title, data.defaultBinding, insertIdx);
      } else if (data.source === "widget-reorder") {
        handleReorderWidget(data.fromIndex, insertIdx);
        if (toast) {
          toast({
            title: "Component Reordered",
            description: `Moved "${widgets[data.fromIndex]?.title || "Component"}" to new position.`,
            status: "info",
            duration: 1400,
            isClosable: true
          });
        }
      }
    } catch (err) {
      console.error("DnD Drop error:", err);
    } finally {
      setDraggedPaletteItem(null);
      setDraggedWidgetId(null);
    }
  }, [dropInsertIndex, widgets, handleAddComponent, handleReorderWidget, toast]);

  // Duplicate Component
  const handleDuplicateWidget = useCallback((id) => {
    const item = widgets.find((w) => w.id === id);
    if (!item) return;
    const clone = {
      ...item,
      id: `w-${Date.now()}`,
      title: `${item.title} (Copy)`
    };
    const updated = [...widgets, clone];
    setWidgets(updated);
    if (pushWidgetsToHistory) pushWidgetsToHistory(updated);
    if (setSelectedWidgetId) setSelectedWidgetId(clone.id);
    if (autoPersistApp) autoPersistApp(updated);
    if (toast) {
      toast({ title: "Component Duplicated", status: "success", duration: 1500 });
    }
  }, [widgets, setWidgets, pushWidgetsToHistory, setSelectedWidgetId, autoPersistApp, toast]);

  // Toggle Visibility
  const handleToggleVisibility = useCallback((id) => {
    let nextWidgets = null;
    setWidgets((prev) => {
      nextWidgets = prev.map((w) => (w.id === id ? { ...w, visible: w.visible === false ? true : false } : w));
      return nextWidgets;
    });
    if (nextWidgets) {
      if (pushWidgetsToHistory) pushWidgetsToHistory(nextWidgets);
      if (autoPersistApp) autoPersistApp(nextWidgets);
    }
  }, [setWidgets, pushWidgetsToHistory, autoPersistApp]);

  return {
    draggedPaletteItem,
    setDraggedPaletteItem,
    draggedWidgetId,
    setDraggedWidgetId,
    dropInsertIndex,
    setDropInsertIndex,
    isDraggingOverPhone,
    setIsDraggingOverPhone,
    isDraggingActive,
    handleAddComponent,
    handleUpdateWidget,
    handleDeleteWidget,
    handleMoveWidget,
    handleReorderWidget,
    handleDuplicateWidget,
    handleToggleVisibility,
    handleWidgetDragOver,
    handlePhoneDrop
  };
}
