import { useState, useEffect, useRef, useCallback } from "react";
import { validationManager, ValidationAction, ValidationSeverity } from "../../validation";

/**
 * Custom hook to manage ESP32 firmware flashing pipeline,
 * toolchain validation, IPC progress listening, and log streaming.
 */
export default function useFlashPipeline({
  selectedDevice,
  editorCode,
  setWizardStep,
  toast
}) {
  const [flashProgress, setFlashProgress] = useState(0);
  const [flashTimeRemaining, setFlashTimeRemaining] = useState(30);
  const [flashStatusText, setFlashStatusText] = useState("Establishing connection...");
  const [flashTerminalLogs, setFlashTerminalLogs] = useState([]);
  const terminalEndRef = useRef(null);

  const [isIdfPromptOpen, setIsIdfPromptOpen] = useState(false);
  const [idfStatus, setIdfStatus] = useState(null);

  // Check ESP-IDF environment for status badge
  useEffect(() => {
    let isMounted = true;
    const checkIdfInstallation = async () => {
      if (window.electronAPI?.flash?.checkEnv) {
        try {
          const env = await window.electronAPI.flash.checkEnv("esp32s3");
          if (isMounted) setIdfStatus(env);
        } catch {
          // Ignore error silently
        }
      }
    };
    checkIdfInstallation();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-scroll terminal logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [flashTerminalLogs]);

  // Run Flash Pipeline
  const handleStartFlash = useCallback(async () => {
    // 1. Centralized InnoIDE Workflow Validation for Flash
    try {
      const validationResult = await validationManager.validateAction(ValidationAction.FLASH_START, {
        selectedDevice,
        selectedPort: selectedDevice?.port,
        hardware: {
          port: selectedDevice?.port,
          chip: selectedDevice?.chip,
          connected: Boolean(selectedDevice?.port),
        },
        currentScreen: "Flasher",
        action: "flash.start",
      });

      if (!validationResult.valid && validationResult.violations?.length > 0) {
        const errorViolation = validationResult.violations.find((v) => v.severity === ValidationSeverity.ERROR);
        if (errorViolation) {
          validationManager.setActiveViolation(errorViolation);
          return;
        }
      }
    } catch (valErr) {
      console.warn("[ESP32Flasher] Flash validation check warning:", valErr);
    }

    if (!selectedDevice || !selectedDevice.port) {
      if (toast) {
        toast({
          title: "No Device Connected",
          description: "Please connect an ESP32 board via USB before flashing.",
          status: "warning",
          duration: 4000,
          isClosable: true
        });
      }
      setWizardStep("devices");
      return;
    }

    setWizardStep("flashing");
    setFlashProgress(5);
    setFlashTimeRemaining(30);
    setFlashStatusText(`Establishing connection to ${selectedDevice.port}...`);
    setFlashTerminalLogs([`[SYSTEM] Initializing ESP-IDF flashing toolchain pipeline for ${selectedDevice.port}...`]);

    const targetPort = selectedDevice.port;
    const targetChip = selectedDevice?.chip || "esp32s3";

    try {
      if (window.electronAPI?.flash?.runPipeline) {
        // Real Electron IPC Flash Execution
        let cleanup = null;
        if (window.electronAPI.flash.onEvent) {
          cleanup = window.electronAPI.flash.onEvent((evt) => {
            if (evt.log) {
              setFlashTerminalLogs((prev) => [...prev, evt.log]);
            }
            if (evt.status === "error" || (evt.stage === "flashing" && evt.status === "error")) {
              setFlashStatusText(`Flashing error: ${evt.message || "Operation failed"}`);
              if (toast) {
                toast({
                  title: "Flashing Error",
                  description: evt.message || "Firmware flashing encountered an error.",
                  status: "error",
                  duration: 5000,
                  isClosable: true
                });
              }
            } else if (evt.status === "setting_target" || evt.status === "target_stdout") {
              setFlashProgress((p) => Math.max(p, 20));
              setFlashStatusText("Setting chip target (auto-detect)...");
            } else if (evt.status === "building" || evt.status === "build_stdout") {
              setFlashProgress((p) => Math.min(Math.max(p, 45), 75));
              setFlashStatusText("Compiling firmware modules with ESP-IDF...");
            } else if (evt.status === "flashing" || evt.status === "flash_stdout") {
              setFlashProgress((p) => Math.min(Math.max(p, 80), 95));
              setFlashStatusText("Writing sectors to Flash memory at 460800 baud...");
            } else if (evt.status === "flash_success" || evt.status === "pipeline_completed") {
              setFlashProgress(100);
              setFlashStatusText("Firmware successfully written & verified!");
              setTimeout(() => {
                if (cleanup) cleanup();
                setWizardStep("success");
              }, 1200);
            }
          });
        }

        await window.electronAPI.flash.runPipeline({
          port: targetPort,
          target: targetChip,
          code: editorCode,
          apiUrl: "http://localhost:5010/check-code"
        });
      } else {
        setFlashStatusText("Desktop Electron environment required.");
        setFlashTerminalLogs((prev) => [
          ...prev,
          "[ERROR] Desktop Electron environment is required to communicate with physical COM ports."
        ]);
        if (toast) {
          toast({
            title: "Desktop App Required",
            description: "Hardware flashing is only available when running in the InnoIDE Desktop App with connected hardware.",
            status: "warning",
            duration: 5000,
            isClosable: true
          });
        }
      }
    } catch (err) {
      setFlashTerminalLogs((prev) => [...prev, `[ERROR] Flashing failed: ${err.message}`]);
      setFlashStatusText(`Error: ${err.message}`);
      if (toast) {
        toast({
          title: "Flashing Error",
          description: err.message,
          status: "error",
          duration: 5000,
          isClosable: true
        });
      }
    }
  }, [selectedDevice, editorCode, setWizardStep, toast]);

  return {
    flashProgress,
    setFlashProgress,
    flashTimeRemaining,
    setFlashTimeRemaining,
    flashStatusText,
    setFlashStatusText,
    flashTerminalLogs,
    setFlashTerminalLogs,
    terminalEndRef,
    isIdfPromptOpen,
    setIsIdfPromptOpen,
    idfStatus,
    handleStartFlash
  };
}
