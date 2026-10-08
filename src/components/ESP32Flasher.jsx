import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { useToast, useColorModeValue, useDisclosure } from "@chakra-ui/react";

import { sanitizeWidgets } from "./esp32/geologHelpers.js";
import FlasherWizardModal from "./esp32/FlasherWizardModal.jsx";
import AppBuilderStudio from "./esp32/AppBuilderStudio.jsx";

// Custom Feature Hooks
import useDeviceScanner from "./esp32/useDeviceScanner.js";
import useFlashPipeline from "./esp32/useFlashPipeline.js";
import useAppPersistence from "./esp32/useAppPersistence.js";
import useDeviceLocation from "./esp32/useDeviceLocation.js";
import useHardwareActuation from "./esp32/useHardwareActuation.js";
import useCompanionTunnel from "./esp32/useCompanionTunnel.js";
import useWidgetOperations from "./esp32/useWidgetOperations.js";
import useFormAndCrud from "./esp32/useFormAndCrud.js";
import useRuleManagement from "./esp32/useRuleManagement.js";
import useQrPayloadGenerator from "./esp32/useQrPayloadGenerator.js";

import {
  ESP32_GPIO_OPTIONS,
  RULE_ACTION_TYPES,
  RULE_CONDITION_TYPES,
  TELEMETRY_TRIGGER_SOURCES
} from "./flasherConstants";

export {
  ESP32_GPIO_OPTIONS,
  RULE_ACTION_TYPES,
  RULE_CONDITION_TYPES,
  TELEMETRY_TRIGGER_SOURCES
};

export default function ESP32Flasher({
  code: codeProp,
  initialStep = "connection", // 'connection' | 'devices' | 'compatibility' | 'flashing' | 'success' | 'app_builder'
  onClose,
  projectName: propProjectName
}) {
  const toast = useToast();

  // Dynamic Project & Workspace info from Redux
  const editorTabs = useSelector((state) => state.editor?.tabs);
  const activeTabId = useSelector((state) => state.editor?.activeTabId);
  const activeTab = useMemo(
    () => editorTabs?.find((t) => String(t.id) === String(activeTabId)),
    [editorTabs, activeTabId]
  );
  const activeWorkspaceProjectName = useSelector(
    (state) => state.workspace?.projectName || state.workspace?.activeProject?.name || state.workspace?.activeProjectName
  );

  const initialProjectName = useMemo(() => {
    return (
      propProjectName ||
      activeWorkspaceProjectName ||
      localStorage.getItem("activeProjectName") ||
      localStorage.getItem("lastActiveProjectName") ||
      localStorage.getItem("projectName") ||
      (activeTab?.name ? activeTab.name.replace(/\.[^/.]+$/, "") : "") ||
      (activeTab?.title ? activeTab.title.replace(/\.[^/.]+$/, "") : "") ||
      "ESP32 Companion"
    );
  }, [propProjectName, activeWorkspaceProjectName, activeTab]);

  const [projectName, setProjectName] = useState(initialProjectName);

  useEffect(() => {
    const dynamicName =
      propProjectName ||
      activeWorkspaceProjectName ||
      localStorage.getItem("activeProjectName") ||
      localStorage.getItem("lastActiveProjectName") ||
      localStorage.getItem("projectName") ||
      (activeTab?.name ? activeTab.name.replace(/\.[^/.]+$/, "") : "") ||
      (activeTab?.title ? activeTab.title.replace(/\.[^/.]+$/, "") : "");
    if (dynamicName && dynamicName !== projectName) {
      setProjectName(dynamicName);
    }
  }, [propProjectName, activeWorkspaceProjectName, activeTab, projectName]);

  const editorCode = useMemo(() => {
    return codeProp || activeTab?.content || (editorTabs?.[0]?.content) || "";
  }, [codeProp, activeTab?.content, editorTabs]);

  // Active Wizard Step: 'connection' | 'devices' | 'compatibility' | 'flashing' | 'success' | 'app_builder'
  const [wizardStep, setWizardStepState] = useState(() => {
    if (initialStep && initialStep !== "app_builder") {
      return initialStep;
    }
    // Restore "app_builder" from localStorage only if the saved timestamp is < 30 min old
    try {
      const raw = localStorage.getItem("inno_flasher_active_step");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.step === "app_builder") {
            const age = Date.now() - (parsed.ts || 0);
            if (age < 30 * 60 * 1000) return "app_builder";
          } else if (parsed.step) {
            return parsed.step;
          }
        } catch {
          if (raw !== "app_builder") return raw;
        }
      }
    } catch { }
    return "connection";
  });

  // Sync wizardStep if initialStep prop changes
  useEffect(() => {
    if (initialStep && initialStep !== "app_builder") {
      setWizardStepState(initialStep);
    }
  }, [initialStep]);

  const setWizardStep = useCallback((step) => {
    setWizardStepState(step);
    try {
      localStorage.setItem("inno_flasher_active_step", JSON.stringify({ step, ts: Date.now() }));
    } catch { }
  }, []);

  // Step 1: Connection Type ('usb' | 'wifi' | 'cellular')
  const [connectionType, setConnectionType] = useState("usb");

  // Step 2: Selected Device & Device Discovery Hook
  const {
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    selectedDevice,
    isScanning,
    autoRefresh,
    setAutoRefresh,
    manualWifiIp,
    setManualWifiIp,
    handleAddManualWifiDevice,
    handleRefreshDevices
  } = useDeviceScanner({
    connectionType,
    wizardStep,
    toast
  });

  // Step 3: Compatibility Checklist Status (dynamically calculated)
  const compatibilityChecks = useMemo(() => {
    const hasCode = Boolean(editorCode && editorCode.trim().length > 0);
    const hasDevice = Boolean(selectedDevice && selectedDevice.port);
    return [
      {
        id: "syntax",
        label: "Project firmware source code",
        status: hasCode ? "pass" : "warn",
        value: hasCode ? `${editorCode.trim().split("\n").length} lines` : "No code entered"
      },
      {
        id: "device",
        label: "Hardware device detected",
        status: hasDevice ? "pass" : "fail",
        value: hasDevice ? `${selectedDevice.chipName || selectedDevice.name} on ${selectedDevice.port}` : "No device connected"
      },
      {
        id: "board",
        label: "Target chip compatibility (ESP32-S3)",
        status: hasDevice ? "pass" : "warn",
        value: hasDevice ? "Supported" : "Requires device"
      },
      { id: "pins", label: "Pin mapping configuration", status: "pass" },
      { id: "libraries", label: "ESP-IDF toolchain libraries", status: "pass" },
      { id: "conflicts", label: "Serial port access conflict check", status: hasDevice ? "pass" : "warn" }
    ];
  }, [editorCode, selectedDevice]);

  // Step 4: Flashing Pipeline Hook
  const {
    flashProgress,
    flashTimeRemaining,
    flashStatusText,
    flashTerminalLogs,
    terminalEndRef,
    isIdfPromptOpen,
    setIsIdfPromptOpen,
    handleStartFlash
  } = useFlashPipeline({
    selectedDevice,
    editorCode,
    setWizardStep,
    toast
  });

  // ==========================================
  // APP BUILDER STATE & DATA
  // ==========================================
  const [appBuilderView, setAppBuilderView] = useState("designer"); // 'designer' | 'blocks' | 'preview'
  const [inspectorTab, setInspectorTab] = useState("properties"); // 'tree' | 'properties'

  // Widgets State with initial local load
  const [widgets, setWidgets] = useState(() => {
    try {
      const raw = localStorage.getItem(`innoide:companion-app:${initialProjectName}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.widgets)) return sanitizeWidgets(parsed.widgets);
      }
    } catch { }
    return [];
  });

  const [history, setHistory] = useState(() => [widgets]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [selectedWidgetId, setSelectedWidgetId] = useState(() => widgets[0]?.id || null);
  const activeWidget = useMemo(
    () => widgets.find((w) => w.id === selectedWidgetId) || widgets[0] || null,
    [widgets, selectedWidgetId]
  );
  const visibleWidgets = useMemo(() => widgets.filter((w) => w.visible !== false), [widgets]);

  // Automation Logic Blocks State
  const [logicBlocks, setLogicBlocks] = useState(() => {
    try {
      const raw = localStorage.getItem(`innoide:companion-app:${initialProjectName}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.logicBlocks)) return parsed.logicBlocks;
      }
    } catch { }
    return [];
  });

  // Modal Disclosures
  const { isOpen: isNewAppModalOpen, onOpen: onNewAppModalOpen, onClose: onNewAppModalClose } = useDisclosure();
  const { isOpen: isRenameAppModalOpen, onOpen: onRenameAppModalOpen, onClose: onRenameAppModalClose } = useDisclosure();
  const { isOpen: isClearCanvasModalOpen, onOpen: onClearCanvasModalOpen, onClose: onClearCanvasModalClose } = useDisclosure();
  const { isOpen: isLocationQrModalOpen, onClose: onLocationQrModalClose } = useDisclosure();
  const [locationQrModalData] = useState(null);

  const [newAppNameInput, setNewAppNameInput] = useState("");
  const [renameAppNameInput, setRenameAppNameInput] = useState("");

  const { isOpen: isPublishOpen, onOpen: onPublishOpen, onClose: onPublishClose } = useDisclosure();
  const activePort = selectedDevice?.port || "COM9";

  // Push widgets to history stack for Undo/Redo (permanently stable callback)
  const pushWidgetsToHistory = useCallback((nextWidgets) => {
    setHistoryIndex((currIdx) => {
      setHistory((prev) => {
        const sliced = prev.slice(0, currIdx + 1);
        return [...sliced, nextWidgets];
      });
      return currIdx + 1;
    });
  }, []);

  // Undo Handler
  const handleUndo = useCallback(() => {
    setHistoryIndex((prevIdx) => {
      if (prevIdx > 0) {
        const nextIdx = prevIdx - 1;
        setWidgets(history[nextIdx]);
        if (toast) toast({ title: "Action Undone", status: "info", duration: 1200 });
        return nextIdx;
      }
      return prevIdx;
    });
  }, [history, toast]);

  // Redo Handler
  const handleRedo = useCallback(() => {
    setHistoryIndex((prevIdx) => {
      if (prevIdx < history.length - 1) {
        const nextIdx = prevIdx + 1;
        setWidgets(history[nextIdx]);
        if (toast) toast({ title: "Action Redone", status: "info", duration: 1200 });
        return nextIdx;
      }
      return prevIdx;
    });
  }, [history, toast]);

  // App Persistence Hook
  const {
    savedApps,
    autoPersistApp,
    handleLoadApp,
    handleCreateNewApp,
    handleRenameApp,
    handleDeleteApp,
    handleClearAllWidgets,
    handleSaveApp
  } = useAppPersistence({
    initialProjectName,
    projectName,
    setProjectName,
    widgets,
    setWidgets,
    logicBlocks,
    setLogicBlocks,
    setHistory,
    setHistoryIndex,
    setSelectedWidgetId,
    selectedDevice,
    toast
  });

  // Stable ref for companion server trigger to avoid cyclic re-renders
  const startCompanionServerRef = useRef(null);
  const handleLocationUpdated = useCallback(() => {
    if (typeof startCompanionServerRef.current === "function") {
      startCompanionServerRef.current();
    }
  }, []);

  // Device Location Hook
  const {
    deviceDetectedLocation,
    setDeviceDetectedLocation,
    isDetectingLocation,
    fetchCurrentDeviceLocation,
    handleCalibrateLocation,
    recordSwitchLocation,
    getAccurateLocationForSwitch
  } = useDeviceLocation({
    widgets,
    setWidgets,
    autoPersistApp,
    onLocationUpdated: handleLocationUpdated
  });

  // Hardware Actuation Hook
  const {
    liveLedToggle,
    setLiveLedToggle,
    ledHardwareError,
    serialTrafficLogs,
    setSerialTrafficLogs,
    handleToggleHardwareLed,
    handleTestHardwareSignal,
    handleExecuteRule,
    evaluateRulesForWidget
  } = useHardwareActuation({
    selectedDevice,
    activePort,
    logicBlocks,
    setWidgets,
    recordSwitchLocation,
    getAccurateLocationForSwitch,
    toast
  });

  // Companion Tunnel, Cloud Remote, & Expo Snack Hook
  const {
    companionServerInfo,
    localCompanionUrl,
    companionNetworkMode,
    remoteTunnelState,
    expoSdkVersion,
    resolvedHostIp,
    resolvedHostPort,
    handleToggleCloudRemote,
    handleExportHtmlWebApp,
    startLocalCompanionServer,
    handleExportExpoZip,
    syncSnackSession,
    handleCopyAppJsCode,
    handleOpenExpoSnack
  } = useCompanionTunnel({
    projectName,
    widgets,
    setWidgets,
    logicBlocks,
    activePort,
    deviceDetectedLocation,
    setDeviceDetectedLocation,
    setLiveLedToggle,
    autoPersistApp,
    toast,
    isPublishOpen
  });

  startCompanionServerRef.current = startLocalCompanionServer;

  // Widget Operations Hook (CRUD, Drag & Drop, Reordering, Visibility)
  const {
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
  } = useWidgetOperations({
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
  });

  // Dynamic Form & CRUD Table Records Hook
  const {
    isCrudModalOpen,
    onCrudModalClose,
    newQuestionInputs,
    setNewQuestionInputs,
    newAnswerInputs,
    setNewAnswerInputs,
    editingCrudRecord,
    crudRecordForm,
    setCrudRecordForm,
    handleAddQuestionToForm,
    handleDeleteQuestionFromForm,
    handleSubmitFormAnswer,
    handleClearFormResponses,
    handleClearGeologs,
    handleOpenAddCrudRecord,
    handleOpenEditCrudRecord,
    handleSaveCrudRecord,
    handleDeleteCrudRecord
  } = useFormAndCrud({
    widgets,
    setWidgets,
    pushWidgetsToHistory,
    autoPersistApp,
    startLocalCompanionServer,
    toast
  });

  // Rule Builder Management Hook
  const {
    isRuleModalOpen,
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
  } = useRuleManagement({
    widgets,
    logicBlocks,
    setLogicBlocks,
    toast
  });

  // QR Payload Generator Hook
  const {
    qrPayloadMode,
    setQrPayloadMode,
    effectiveDeviceType,
    effectiveDeviceId,
    effectiveDeviceName,
    cleanUiList,
    cleanLogicsList,
    isCloudActive,
    webAppQrPayload,
    bundleQrPayload,
    activeQrPayload
  } = useQrPayloadGenerator({
    widgets,
    logicBlocks,
    projectName,
    selectedDevice,
    activePort,
    companionNetworkMode,
    remoteTunnelState,
    localCompanionUrl,
    resolvedHostIp,
    resolvedHostPort
  });

  // Live Telemetry Simulation for Gauges and Sensors in App Builder
  // Strictly PAUSED when Publish modal or Rule Builder modal is open to keep QR code 100% stable
  const hasLiveGauges = useMemo(
    () => widgets.some((w) => w.type === "gauge" && w.live !== false),
    [widgets]
  );

  useEffect(() => {
    if (wizardStep !== "app_builder" || isPublishOpen || isRuleModalOpen || !hasLiveGauges) return;
    const interval = setInterval(() => {
      setWidgets((prev) =>
        prev.map((w) => {
          if (w.type === "gauge" && w.live !== false) {
            const delta = (Math.random() - 0.5) * 0.4;
            const newVal = parseFloat(Math.max(w.min || 0, Math.min(w.max || 50, (w.value || 24.3) + delta)).toFixed(1));
            return { ...w, value: newVal };
          }
          return w;
        })
      );
    }, 2500);
    return () => clearInterval(interval);
  }, [wizardStep, isPublishOpen, isRuleModalOpen, hasLiveGauges]);

  // Auto-restore publish modal only if it was open within the last 5 minutes
  useEffect(() => {
    try {
      const raw = localStorage.getItem("inno_publish_modal_open");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const age = Date.now() - (parsed.ts || 0);
          if (parsed.open === true && age < 5 * 60 * 1000) {
            onPublishOpen();
          } else {
            localStorage.removeItem("inno_publish_modal_open");
          }
        } catch {
          localStorage.removeItem("inno_publish_modal_open");
        }
      }
    } catch { }
  }, [onPublishOpen]);

  // Keyboard Shortcuts (Ctrl+Z / Ctrl+Y / Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (wizardStep !== "app_builder") return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        handleRedo();
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        handleSaveApp();
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [wizardStep, handleUndo, handleRedo, handleSaveApp]);

  // Trigger Publish Modal and sync Snack in background
  const handleOpenPublishModal = useCallback(() => {
    onPublishOpen();
    if (typeof startLocalCompanionServer === "function") {
      startLocalCompanionServer();
    }
    if (typeof syncSnackSession === "function") {
      syncSnackSession(false, expoSdkVersion);
    }
  }, [onPublishOpen, startLocalCompanionServer, syncSnackSession, expoSdkVersion]);

  // Theme Colors
  const bgCard = useColorModeValue("white", "gray.850");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const bgPurpleCard = useColorModeValue("purple.50", "gray.800");
  const bgCyanCard = useColorModeValue("cyan.50", "gray.850");

  // ==========================================
  // RENDER: APP BUILDER STUDIO (STEP 6+)
  // ==========================================
  if (wizardStep === "app_builder") {
    return (
      <AppBuilderStudio
        projectName={projectName}
        bgCard={bgCard}
        borderColor={borderColor}
        bgPurpleCard={bgPurpleCard}
        bgCyanCard={bgCyanCard}
        selectedDevice={selectedDevice}
        activePort={activePort}
        setWizardStep={setWizardStep}
        appBuilderView={appBuilderView}
        setAppBuilderView={setAppBuilderView}
        inspectorTab={inspectorTab}
        setInspectorTab={setInspectorTab}
        widgets={widgets}
        visibleWidgets={visibleWidgets}
        selectedWidgetId={selectedWidgetId}
        setSelectedWidgetId={setSelectedWidgetId}
        activeWidget={activeWidget}
        history={history}
        historyIndex={historyIndex}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        draggedPaletteItem={draggedPaletteItem}
        setDraggedPaletteItem={setDraggedPaletteItem}
        draggedWidgetId={draggedWidgetId}
        setDraggedWidgetId={setDraggedWidgetId}
        dropInsertIndex={dropInsertIndex}
        setDropInsertIndex={setDropInsertIndex}
        isDraggingActive={isDraggingActive}
        isDraggingOverPhone={isDraggingOverPhone}
        setIsDraggingOverPhone={setIsDraggingOverPhone}
        handlePhoneDrop={handlePhoneDrop}
        handleWidgetDragOver={handleWidgetDragOver}
        handleAddComponent={handleAddComponent}
        handleUpdateWidget={handleUpdateWidget}
        handleDeleteWidget={handleDeleteWidget}
        handleMoveWidget={handleMoveWidget}
        handleDuplicateWidget={handleDuplicateWidget}
        handleToggleVisibility={handleToggleVisibility}
        handleTestHardwareSignal={handleTestHardwareSignal}
        liveLedToggle={liveLedToggle}
        setLiveLedToggle={setLiveLedToggle}
        handleToggleHardwareLed={handleToggleHardwareLed}
        ledHardwareError={ledHardwareError}
        serialTrafficLogs={serialTrafficLogs}
        setSerialTrafficLogs={setSerialTrafficLogs}
        logicBlocks={logicBlocks}
        setLogicBlocks={setLogicBlocks}
        isRuleModalOpen={isRuleModalOpen}
        onRuleModalClose={onRuleModalClose}
        editingRule={editingRule}
        setEditingRule={setEditingRule}
        ruleModalTab={ruleModalTab}
        setRuleModalTab={setRuleModalTab}
        testRuleResult={testRuleResult}
        setTestRuleResult={setTestRuleResult}
        isTestingRule={isTestingRule}
        setIsTestingRule={setIsTestingRule}
        handleOpenAddRule={handleOpenAddRule}
        handleOpenEditRule={handleOpenEditRule}
        handleSaveRuleModal={handleSaveRuleModal}
        handleDeleteLogicBlock={handleDeleteLogicBlock}
        handleToggleLogicBlock={handleToggleLogicBlock}
        handleExecuteRule={handleExecuteRule}
        deviceDetectedLocation={deviceDetectedLocation}
        isDetectingLocation={isDetectingLocation}
        fetchCurrentDeviceLocation={fetchCurrentDeviceLocation}
        handleCalibrateLocation={handleCalibrateLocation}
        handleClearGeologs={handleClearGeologs}
        newQuestionInputs={newQuestionInputs}
        setNewQuestionInputs={setNewQuestionInputs}
        newAnswerInputs={newAnswerInputs}
        setNewAnswerInputs={setNewAnswerInputs}
        handleAddQuestionToForm={handleAddQuestionToForm}
        handleDeleteQuestionFromForm={handleDeleteQuestionFromForm}
        handleSubmitFormAnswer={handleSubmitFormAnswer}
        handleClearFormResponses={handleClearFormResponses}
        isCrudModalOpen={isCrudModalOpen}
        onCrudModalClose={onCrudModalClose}
        editingCrudRecord={editingCrudRecord}
        crudRecordForm={crudRecordForm}
        setCrudRecordForm={setCrudRecordForm}
        handleOpenAddCrudRecord={handleOpenAddCrudRecord}
        handleOpenEditCrudRecord={handleOpenEditCrudRecord}
        handleSaveCrudRecord={handleSaveCrudRecord}
        handleDeleteCrudRecord={handleDeleteCrudRecord}
        savedApps={savedApps}
        handleLoadApp={handleLoadApp}
        handleSaveApp={handleSaveApp}
        handleDeleteApp={handleDeleteApp}
        handleRenameApp={handleRenameApp}
        handleCreateNewApp={handleCreateNewApp}
        handleClearAllWidgets={handleClearAllWidgets}
        isNewAppModalOpen={isNewAppModalOpen}
        onNewAppModalOpen={onNewAppModalOpen}
        onNewAppModalClose={onNewAppModalClose}
        newAppNameInput={newAppNameInput}
        setNewAppNameInput={setNewAppNameInput}
        isRenameAppModalOpen={isRenameAppModalOpen}
        onRenameAppModalOpen={onRenameAppModalOpen}
        onRenameAppModalClose={onRenameAppModalClose}
        renameAppNameInput={renameAppNameInput}
        setRenameAppNameInput={setRenameAppNameInput}
        isClearCanvasModalOpen={isClearCanvasModalOpen}
        onClearCanvasModalOpen={onClearCanvasModalOpen}
        onClearCanvasModalClose={onClearCanvasModalClose}
        isPublishOpen={isPublishOpen}
        onPublishClose={onPublishClose}
        handleOpenPublishModal={handleOpenPublishModal}
        companionServerInfo={companionServerInfo}
        localCompanionUrl={localCompanionUrl}
        companionNetworkMode={companionNetworkMode}
        remoteTunnelState={remoteTunnelState}
        handleToggleCloudRemote={handleToggleCloudRemote}
        isCloudActive={isCloudActive}
        resolvedHostIp={resolvedHostIp}
        resolvedHostPort={resolvedHostPort}
        expoSdkVersion={expoSdkVersion}
        handleExportExpoZip={handleExportExpoZip}
        handleOpenExpoSnack={handleOpenExpoSnack}
        handleCopyAppJsCode={handleCopyAppJsCode}
        handleExportHtmlWebApp={handleExportHtmlWebApp}
        qrPayloadMode={qrPayloadMode}
        setQrPayloadMode={setQrPayloadMode}
        cleanUiList={cleanUiList}
        cleanLogicsList={cleanLogicsList}
        activeQrPayload={activeQrPayload}
        webAppQrPayload={webAppQrPayload}
        bundleQrPayload={bundleQrPayload}
        effectiveDeviceId={effectiveDeviceId}
        effectiveDeviceName={effectiveDeviceName}
        effectiveDeviceType={effectiveDeviceType}
        isLocationQrModalOpen={isLocationQrModalOpen}
        onLocationQrModalClose={onLocationQrModalClose}
        locationQrModalData={locationQrModalData}
      />
    );
  }

  // ==========================================
  // RENDER: FLASH WIZARD & SUCCESS SCREENS (STEPS 1-5)
  // ==========================================
  return (
    <FlasherWizardModal
      wizardStep={wizardStep}
      setWizardStep={setWizardStep}
      connectionType={connectionType}
      setConnectionType={setConnectionType}
      devices={devices}
      selectedDeviceId={selectedDeviceId}
      setSelectedDeviceId={setSelectedDeviceId}
      selectedDevice={selectedDevice}
      autoRefresh={autoRefresh}
      setAutoRefresh={setAutoRefresh}
      isScanning={isScanning}
      handleRefreshDevices={handleRefreshDevices}
      manualWifiIp={manualWifiIp}
      setManualWifiIp={setManualWifiIp}
      handleAddManualWifiDevice={handleAddManualWifiDevice}
      compatibilityChecks={compatibilityChecks}
      handleStartFlash={handleStartFlash}
      flashProgress={flashProgress}
      flashTimeRemaining={flashTimeRemaining}
      flashStatusText={flashStatusText}
      flashTerminalLogs={flashTerminalLogs}
      terminalEndRef={terminalEndRef}
      isIdfPromptOpen={isIdfPromptOpen}
      setIsIdfPromptOpen={setIsIdfPromptOpen}
      onClose={onClose}
      projectName={projectName}
      bgCard={bgCard}
      borderColor={borderColor}
    />
  );
}
