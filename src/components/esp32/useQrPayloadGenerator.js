import { useState, useMemo } from "react";

/**
 * Custom hook to generate memoized clean UI and automation rule lists,
 * and format stable QR payloads for device pairing, web apps, and full project bundles.
 */
export default function useQrPayloadGenerator({
  widgets,
  logicBlocks,
  projectName,
  selectedDevice,
  activePort,
  companionNetworkMode,
  remoteTunnelState,
  localCompanionUrl,
  resolvedHostIp,
  resolvedHostPort,
  qrGeneratedAt,
  qrExpiresAt
}) {
  const [selectedDeviceType, setSelectedDeviceType] = useState("");
  const [customDeviceTypeInput, setCustomDeviceTypeInput] = useState("");
  const [qrPayloadMode, setQrPayloadMode] = useState("webapp"); // "webapp" | "bundle" | "device"
  const [customDeviceId, setCustomDeviceId] = useState("");
  const [customDeviceName, setCustomDeviceName] = useState("");

  // Companion App Device Type Auto-Detection
  const autoDetectDeviceType = useMemo(() => {
    const hasFan = widgets.some(
      (w) =>
        /fan/i.test(w.title || "") ||
        /fan/i.test(w.boundTarget || "") ||
        /fan/i.test(w.boundTargetName || "")
    );
    if (hasFan) return "FAN";
    return "LED";
  }, [widgets]);

  // The Android APK supports "LED" and "FAN" controls.
  const effectiveDeviceType = useMemo(() => {
    const resolvedType = (
      selectedDeviceType === "CUSTOM"
        ? customDeviceTypeInput
        : (selectedDeviceType || autoDetectDeviceType)
    ) || "LED";
    return resolvedType.toUpperCase().trim() === "FAN" ? "FAN" : "LED";
  }, [selectedDeviceType, customDeviceTypeInput, autoDetectDeviceType]);

  const effectiveDeviceId = useMemo(() => {
    return (
      customDeviceId.trim() ||
      selectedDevice?.id ||
      (projectName ? projectName.toLowerCase().replace(/[^a-z0-9_-]/g, "-") : "esp32-device-01")
    );
  }, [customDeviceId, selectedDevice?.id, projectName]);

  const effectiveDeviceName = useMemo(() => {
    return (
      customDeviceName.trim() ||
      selectedDevice?.name ||
      projectName ||
      "ESP32 Companion Device"
    );
  }, [customDeviceName, selectedDevice?.name, projectName]);

  // Build clean JSON payload containing UI styling and functional logics
  const cleanUiList = useMemo(() => {
    return widgets.map((w) => {
      const isLedWidget = w.id === "w-led" || /led|light/i.test(w.title || "") || /led/i.test(w.boundTarget || "");
      const isFanWidget = /fan/i.test(w.title || "") || /fan/i.test(w.boundTarget || "");
      const item = {
        id: w.id,
        type: w.type,
        title: w.title || w.label || w.name || "",
        boundTarget: w.boundTarget || w.boundTargetName || (isLedWidget ? "GPIO 2 / 48 (LED)" : (isFanWidget ? "GPIO 4 (FAN)" : "")),
        target: w.boundTarget || w.target || (isLedWidget ? "GPIO 2 (LED)" : (isFanWidget ? "GPIO 4 (FAN)" : "GPIO Pin")),
        action: w.action || "Turn ON / OFF",
        fontSize: w.fontSize || 15,
        backgroundColor: w.backgroundColor || w.bgColor || (w.state ? "#101a38" : "#131b2e"),
        color: w.color || (isLedWidget ? "#2563eb" : "#38bdf8"),
        textColor: w.textColor || "#f8fafc",
        cornerRadius: w.cornerRadius || 16
      };
      if (w.state !== undefined) item.state = Boolean(w.state);
      if (isLedWidget) {
        item.actionPayloadOn = "LED:1";
        item.actionPayloadOff = "LED:0";
        item.commandOn = "LED:1";
        item.commandOff = "LED:0";
        item.on = "1";
        item.off = "0";
      } else if (isFanWidget) {
        item.actionPayloadOn = "FAN:1";
        item.actionPayloadOff = "FAN:0";
        item.on = "FAN:1";
        item.off = "FAN:0";
      } else {
        if (w.on !== undefined) item.on = w.on;
        if (w.off !== undefined) item.off = w.off;
      }
      // Lock telemetry/gauge/sensor values to fixed default value to guarantee stable QR code without flickering
      if (w.type === "gauge" || w.type === "sensor" || w.type === "telemetry") {
        item.value = w.defaultValue !== undefined ? w.defaultValue : 24.0;
      } else if (w.defaultValue !== undefined) {
        item.value = w.defaultValue;
      } else if (typeof w.value === "number") {
        item.value = w.value;
      }
      if (w.min !== undefined) item.min = w.min;
      if (w.max !== undefined) item.max = w.max;
      if (w.unit) item.unit = w.unit;
      if (w.placeholder) item.placeholder = w.placeholder;
      if (w.visible !== undefined) item.visible = w.visible;
      return item;
    });
  }, [widgets]);

  const cleanLogicsList = useMemo(() => {
    return logicBlocks.map((b) => {
      const isLedRule = b.id === "b-1" || /led|light/i.test(b.name || "") || /led/i.test(b.payload || "");
      const linkedWidget = widgets.find((w) => w.id === b.triggerWidgetId);
      const isComponentRule = b.triggerType === "component" || (!b.triggerWidgetId?.startsWith("telem_") && !b.triggerWidgetId?.startsWith("timer"));
      const isStale = isComponentRule && Boolean(b.triggerWidgetId) && !linkedWidget;
      const isLocationRule = b.conditionType?.includes("Location") || b.condition?.includes("Location") || b.action?.includes("Location");
      const item = {
        id: b.id,
        name: b.name || "",
        trigger: b.triggerWidgetId || b.trigger || "",
        triggerWidgetId: b.triggerWidgetId || "",
        triggerName: linkedWidget ? linkedWidget.title : (b.triggerName || "Trigger"),
        event: b.event || "on_toggle",
        condition: b.condition || "Always",
        conditionType: b.conditionType || (isLocationRule ? "Location Mismatch on Turn OFF (OTP Guard)" : "Always"),
        conditionThreshold: b.conditionThreshold !== undefined ? String(b.conditionThreshold) : (isLocationRule ? "50" : undefined),
        conditionUnit: b.conditionUnit || "m",
        action: b.action || "Send Hardware Command",
        payload: b.payload || (isLedRule ? "LED:{state}" : "1"),
        target: linkedWidget ? (linkedWidget.boundTargetName || linkedWidget.boundTarget || b.targetHardware || "Bound → GPIO Pin") : (b.targetHardware || "Bound → GPIO Pin"),
        targetHardware: linkedWidget ? (linkedWidget.boundTargetName || linkedWidget.boundTarget || b.targetHardware || "GPIO Pin") : (b.targetHardware || "GPIO Pin"),
        enabled: isStale ? false : (b.enabled !== false),
        isStale: isStale
      };
      if (isLedRule) {
        item.onPayload = "LED:1";
        item.offPayload = "LED:0";
      }
      return item;
    });
  }, [logicBlocks, widgets]);

  const isCloudActive = Boolean(companionNetworkMode === "cloud" && remoteTunnelState?.active && remoteTunnelState?.url);

  const effectiveSessionTs = qrGeneratedAt || Date.now();
  const effectiveExpiresAtTs = qrExpiresAt || (effectiveSessionTs + 1200 * 1000);

  const webAppQrPayload = useMemo(() => {
    const baseUrl = isCloudActive
      ? remoteTunnelState.url
      : (localCompanionUrl || `http://${resolvedHostIp}:${resolvedHostPort}`);
    if (!baseUrl) return "";
    const cleanUrl = baseUrl.replace(/[?&]qr_session=\d+/g, "").replace(/[?&]qr_exp=\d+/g, "");
    const joinChar = cleanUrl.includes("?") ? "&" : "?";
    return `${cleanUrl}${joinChar}qr_session=${effectiveSessionTs}&qr_exp=${effectiveExpiresAtTs}`;
  }, [isCloudActive, remoteTunnelState?.url, localCompanionUrl, resolvedHostIp, resolvedHostPort, effectiveSessionTs, effectiveExpiresAtTs]);

  // Mode 1: Compact Device Pairing QR
  const companionDevicePayload = useMemo(() => {
    const bridgeBaseUrl = isCloudActive ? remoteTunnelState.url : `http://${resolvedHostIp}:${resolvedHostPort}`;
    return JSON.stringify({
      id: effectiveDeviceId,
      name: effectiveDeviceName,
      deviceType: effectiveDeviceType,
      status: false,
      leds: [{ id: "led-1", name: effectiveDeviceName, pin: 2, state: false }],
      serverUrl: bridgeBaseUrl,
      bridgeUrl: `${bridgeBaseUrl}/api/action`,
      backendUrl: `http://${resolvedHostIp}:5004`,
      port: activePort || "COM9"
    });
  }, [effectiveDeviceId, effectiveDeviceName, effectiveDeviceType, resolvedHostIp, resolvedHostPort, activePort, isCloudActive, remoteTunnelState?.url]);

  // Mode 2: Full Project Bundle QR
  const bundleQrPayload = useMemo(() => {
    const bridgeBaseUrl = isCloudActive ? remoteTunnelState.url : `http://${resolvedHostIp}:${resolvedHostPort}`;
    const compactWidgets = cleanUiList.map((w) => {
      const item = {
        id: w.id,
        type: w.type,
        title: w.title,
        target: w.target || w.boundTarget || "GPIO Pin",
        state: Boolean(w.state),
        on: "1",
        off: "0",
        fontSize: w.fontSize || 15,
        color: w.color || "#2563eb",
        bg: w.backgroundColor || (w.state ? "#101a38" : "#131b2e"),
        radius: w.cornerRadius || 16
      };
      if (w.value !== undefined) item.val = w.value;
      if (w.unit) item.unit = w.unit;
      return item;
    });

    const compactRules = cleanLogicsList.map((b) => ({
      id: b.id,
      name: b.name,
      trigger: b.trigger || b.triggerWidgetId,
      event: b.event || "on_toggle",
      condition: b.condition || "Always",
      action: b.action || "Command",
      payload: b.payload || "LED:{state}",
      target: b.targetHardware || b.target || "GPIO Pin",
      enabled: b.enabled !== false
    }));

    return JSON.stringify({
      id: effectiveDeviceId,
      name: effectiveDeviceName,
      deviceType: effectiveDeviceType,
      status: false,
      leds: [{ id: "led-1", name: effectiveDeviceName, pin: 2, state: false }],
      serverUrl: bridgeBaseUrl,
      bridgeUrl: `${bridgeBaseUrl}/api/action`,
      port: activePort || "COM9",
      widgets: compactWidgets,
      rules: compactRules
    });
  }, [effectiveDeviceId, effectiveDeviceName, effectiveDeviceType, resolvedHostIp, resolvedHostPort, activePort, cleanUiList, cleanLogicsList, isCloudActive, remoteTunnelState?.url]);

  // Active QR payload based on selected QR mode
  const activeQrPayload = useMemo(() => {
    if (qrPayloadMode === "webapp") return webAppQrPayload;
    if (qrPayloadMode === "bundle") return bundleQrPayload;
    return companionDevicePayload;
  }, [qrPayloadMode, webAppQrPayload, bundleQrPayload, companionDevicePayload]);

  return {
    selectedDeviceType,
    setSelectedDeviceType,
    customDeviceTypeInput,
    setCustomDeviceTypeInput,
    customDeviceId,
    setCustomDeviceId,
    customDeviceName,
    setCustomDeviceName,
    qrPayloadMode,
    setQrPayloadMode,
    autoDetectDeviceType,
    effectiveDeviceType,
    effectiveDeviceId,
    effectiveDeviceName,
    cleanUiList,
    cleanLogicsList,
    isCloudActive,
    webAppQrPayload,
    companionDevicePayload,
    bundleQrPayload,
    activeQrPayload
  };
}
