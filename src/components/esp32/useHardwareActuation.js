import { useState, useCallback } from "react";

/**
 * Custom hook to handle real serial port actuation (USB/COM/TCP),
 * hardware LED toggle commands, pulse signals, automation rule execution,
 * and serial traffic logging.
 */
export default function useHardwareActuation({
  selectedDevice,
  activePort,
  logicBlocks,
  setWidgets,
  recordSwitchLocation,
  toast
}) {
  const [liveLedToggle, setLiveLedToggle] = useState(false); // Hardware LED state toggle
  const [ledHardwareError, setLedHardwareError] = useState(null); // Serial write error message
  const [serialTrafficLogs, setSerialTrafficLogs] = useState([
    { id: 1, type: "rx", text: "ESP32-S3 IoT Node Online. Baud: 115200", time: "12:00:01" },
    { id: 2, type: "rx", text: "Free Heap: 284,520 bytes | Wi-Fi: Connected (192.168.0.104)", time: "12:00:02" },
    { id: 3, type: "rx", text: "Ready for companion app telemetry & commands", time: "12:00:03" }
  ]);

  // Direct hardware LED toggle helper
  const handleToggleHardwareLed = async (nextVal) => {
    const targetPort = selectedDevice?.port || activePort || "COM9";
    const cmd = nextVal ? "LED:1\r\n" : "LED:0\r\n";
    const body = JSON.stringify({ payload: cmd, port: targetPort, value: nextVal, SwitchStatus: nextVal ? 1 : 0 });
    const headers = { "Content-Type": "application/json" };

    setLiveLedToggle(nextVal);
    setLedHardwareError(null);

    // Sync corresponding switch widget in canvas
    if (setWidgets) {
      setWidgets((prev) =>
        prev.map((w) =>
          w.id === "w-led" || w.type === "switch" || /led|light/i.test(w.title || "")
            ? { ...w, state: nextVal, value: nextVal }
            : w
        )
      );
    }

    // Geotag switch location
    if (recordSwitchLocation) {
      recordSwitchLocation(nextVal, "LED Switch");
    }

    let hardwareActuated = false;
    let lastError = null;
    try {
      // PRIMARY: Electron IPC
      if (window.electronAPI?.serial?.write) {
        try {
          const result = await window.electronAPI.serial.write(targetPort, cmd);
          if (result?.skipped) {
            console.warn(`[LED Toggle] Write skipped (port locked): ${result.reason}`);
          } else {
            hardwareActuated = true;
          }
        } catch (e) {
          lastError = e.message;
          if (window.electronAPI?.serial?.connect) {
            try {
              await window.electronAPI.serial.connect(targetPort, 115200);
              const result2 = await window.electronAPI.serial.write(targetPort, cmd);
              if (!result2?.skipped) {
                hardwareActuated = true;
                lastError = null;
              }
            } catch (e2) {
              lastError = e2.message;
            }
          }
        }
      }

      // SECONDARY: Companion HTTP server (port 5055)
      if (!hardwareActuated) {
        try {
          const r = await fetch("http://localhost:5055/api/action", { method: "POST", headers, body });
          if (r.ok) {
            const d = await r.json();
            if (d?.success) {
              hardwareActuated = true;
              lastError = null;
            } else if (d?.error) {
              lastError = d.error;
            }
          }
        } catch (e) {
          lastError = lastError || e.message;
        }
      }

      // Broadcast state
      try {
        const syncBody = JSON.stringify({
          payload: cmd,
          port: targetPort,
          value: nextVal,
          SwitchStatus: nextVal ? 1 : 0,
          syncOnly: true
        });
        fetch("http://localhost:5055/api/action", { method: "POST", headers, body: syncBody }).catch(() => { });
      } catch (e) { }

      try {
        await fetch("http://localhost:5004/setSwitchStatus", {
          method: "POST",
          headers,
          body: JSON.stringify({ SwitchStatus: nextVal ? 1 : 0, value: nextVal, port: targetPort })
        });
      } catch (e) { }

      // Log traffic to Serial Monitor
      setSerialTrafficLogs((logs) => [
        ...logs.slice(-25),
        {
          id: Date.now(),
          type: "tx",
          text: `TX -> ${targetPort}: ${cmd.trim()} (${nextVal ? "LED ON" : "LED OFF"}) ${
            hardwareActuated ? "[OK]" : `[FAILED: ${lastError || "port unavailable"}]`
          }`,
          time: new Date().toLocaleTimeString()
        }
      ]);

      if (hardwareActuated) {
        setLedHardwareError(null);
        if (toast) {
          toast({
            title: nextVal ? "💡 LED ON" : "⚫ LED OFF",
            description: `Command sent to ${targetPort}`,
            status: "success",
            duration: 1500
          });
        }
      } else {
        const errMsg = lastError || "Port unavailable";
        setLedHardwareError(errMsg);
        setLiveLedToggle(!nextVal);
        if (toast) {
          toast({
            title: "⚠️ Hardware Unreachable",
            description: `Could not send to ${targetPort}: ${errMsg}. Flash reactive firmware first.`,
            status: "error",
            duration: 5000,
            isClosable: true
          });
        }
      }
    } catch (err) {
      setLedHardwareError(err.message);
      setLiveLedToggle(!nextVal);
      if (toast) {
        toast({
          title: "Hardware Toggle Error",
          description: err.message,
          status: "error",
          duration: 2500
        });
      }
    }
  };

  // Test Hardware Signal (Send Serial Pulse)
  const handleTestHardwareSignal = async (widget) => {
    if (!widget) return;
    const targetPort = activePort;
    const testCmd = `TEST:${widget.boundTarget || "GPIO"}:PULSE\r\n`;

    if (window.electronAPI?.serial?.write && selectedDevice?.port) {
      try {
        try {
          await window.electronAPI.serial.write(selectedDevice.port, testCmd);
        } catch (initialErr) {
          if (initialErr.message?.includes("not connected") && window.electronAPI.serial.connect) {
            await window.electronAPI.serial.connect(selectedDevice.port, 115200);
            await window.electronAPI.serial.write(selectedDevice.port, testCmd);
          } else {
            throw initialErr;
          }
        }
        setSerialTrafficLogs((logs) => [
          ...logs.slice(-20),
          { id: Date.now(), type: "tx", text: `TX -> ${targetPort}: ${testCmd.trim()}`, time: new Date().toLocaleTimeString() }
        ]);
        if (toast) {
          toast({
            title: "Hardware Signal Sent",
            description: `Pulse transmitted to ${targetPort} (${widget.boundTarget || "Pin"}).`,
            status: "success",
            duration: 2000
          });
        }
      } catch (err) {
        setSerialTrafficLogs((logs) => [
          ...logs.slice(-20),
          { id: Date.now(), type: "sim", text: `[SIMULATED] TX -> ${targetPort}: ${testCmd.trim()}`, time: new Date().toLocaleTimeString() }
        ]);
        if (toast) {
          toast({
            title: "Simulated Signal",
            description: `Port ${targetPort} not connected. Simulated pulse for ${widget.title || "Widget"}.`,
            status: "info",
            duration: 2500
          });
        }
      }
    } else {
      setSerialTrafficLogs((logs) => [
        ...logs.slice(-20),
        { id: Date.now(), type: "sim", text: `[SIMULATED] TX -> ${targetPort}: ${testCmd.trim()}`, time: new Date().toLocaleTimeString() }
      ]);
      if (toast) {
        toast({
          title: "Signal Simulated",
          description: `Simulated pulse triggered for ${widget.title} (${widget.boundTarget || "GPIO Pin"}).`,
          status: "info",
          duration: 2000
        });
      }
    }
  };

  // Execute Rule Action (real serial + telemetry log)
  const handleExecuteRule = async (rule, triggerVal = null) => {
    if (!rule) return;
    const targetPort = activePort;
    let formattedPayload = rule.payload || "CMD";

    if (triggerVal !== null) {
      if (typeof triggerVal === "boolean") {
        formattedPayload = formattedPayload
          .replace(/{state}/g, triggerVal ? "1" : "0")
          .replace(/{state_str}/g, triggerVal ? "HIGH" : "LOW")
          .replace(/{value}/g, triggerVal ? "1" : "0");
      } else {
        formattedPayload = formattedPayload
          .replace(/{value}/g, String(triggerVal))
          .replace(/{state}/g, String(triggerVal));
      }
    }

    const serialMsg = `${formattedPayload}\r\n`;

    if (window.electronAPI?.serial?.write && targetPort) {
      try {
        if (window.electronAPI.serial.connect) {
          try {
            await window.electronAPI.serial.connect(targetPort, 115200);
          } catch (_) { }
        }
        await window.electronAPI.serial.write(targetPort, serialMsg);
        try {
          fetch("http://localhost:5055/api/action", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payload: serialMsg, port: targetPort, value: triggerVal, SwitchStatus: triggerVal ? 1 : 0 })
          }).catch(() => { });
        } catch (_) { }
        setSerialTrafficLogs((logs) => [
          ...logs.slice(-20),
          {
            id: Date.now(),
            type: "tx",
            text: `[RULE TX] ${rule.name} -> ${targetPort} (${rule.targetHardware || "Hardware"}): ${serialMsg.trim()}`,
            time: new Date().toLocaleTimeString()
          }
        ]);
        return { success: true, text: `Transmitted: "${serialMsg.trim()}" to ${targetPort} via ${rule.targetHardware || "Hardware"}` };
      } catch (err) {
        if (window.electronAPI.serial.connect) {
          try {
            await window.electronAPI.serial.connect(targetPort, 115200);
            await window.electronAPI.serial.write(targetPort, serialMsg);
            setSerialTrafficLogs((logs) => [
              ...logs.slice(-20),
              {
                id: Date.now(),
                type: "tx",
                text: `[RULE TX] ${rule.name} -> ${targetPort}: ${serialMsg.trim()}`,
                time: new Date().toLocaleTimeString()
              }
            ]);
            return { success: true, text: `Transmitted: "${serialMsg.trim()}" to ${targetPort}` };
          } catch (retryErr) {
            return { success: false, text: `Serial write error: ${retryErr.message}` };
          }
        }
        return { success: false, text: `Serial write error: ${err.message}` };
      }
    } else {
      setSerialTrafficLogs((logs) => [
        ...logs.slice(-20),
        {
          id: Date.now(),
          type: "sim",
          text: `[RULE SIM] ${rule.name} -> ${targetPort} (${rule.targetHardware || "Hardware"}): ${serialMsg.trim()}`,
          time: new Date().toLocaleTimeString()
        }
      ]);
      return { success: true, text: `Simulated: "${serialMsg.trim()}" targeted at ${rule.targetHardware || "Hardware"}` };
    }
  };

  // Evaluate Automation Rules when a widget changes in Preview or Live mode
  const evaluateRulesForWidget = useCallback(
    (targetWidget, prop, value) => {
      if (!targetWidget || !logicBlocks) return;
      const activeRules = logicBlocks.filter((b) => b.enabled && b.triggerWidgetId === targetWidget.id);

      activeRules.forEach((rule) => {
        let conditionMet = false;
        const cond = rule.condition || "Always";

        if (cond === "Always") {
          conditionMet = true;
        } else if (cond.startsWith("Value >")) {
          const thresh = parseFloat(rule.conditionThreshold || cond.replace(/[^0-9.-]/g, "") || 0);
          conditionMet = parseFloat(value) > thresh;
        } else if (cond.startsWith("Value <")) {
          const thresh = parseFloat(rule.conditionThreshold || cond.replace(/[^0-9.-]/g, "") || 0);
          conditionMet = parseFloat(value) < thresh;
        } else if (cond.startsWith("Value ==")) {
          const thresh = rule.conditionThreshold || "1";
          conditionMet = String(value) === String(thresh) || (typeof value === "boolean" && (value ? "1" : "0") === thresh);
        } else if (cond.startsWith("Value !=")) {
          const thresh = rule.conditionThreshold || "0";
          conditionMet = String(value) !== String(thresh);
        } else {
          conditionMet = true;
        }

        if (conditionMet) {
          handleExecuteRule(rule, value);
        }
      });
    },
    [logicBlocks]
  );

  return {
    liveLedToggle,
    setLiveLedToggle,
    ledHardwareError,
    setLedHardwareError,
    serialTrafficLogs,
    setSerialTrafficLogs,
    handleToggleHardwareLed,
    handleTestHardwareSignal,
    handleExecuteRule,
    evaluateRulesForWidget
  };
}
