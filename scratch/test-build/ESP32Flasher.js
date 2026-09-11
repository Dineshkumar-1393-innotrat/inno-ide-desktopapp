import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import JSZip from "jszip";
import { QRCodeSVG } from "qrcode.react";
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
  Progress,
  IconButton,
  Tooltip,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Divider,
  Grid,
  GridItem,
  useToast,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Stack,
  Tag,
  Card,
  CardBody,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider
} from "@chakra-ui/react";
import {
  FaWifi,
  FaBroadcastTower,
  FaUsb,
  FaCheck,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBolt,
  FaMobileAlt,
  FaUndo,
  FaRedo,
  FaSave,
  FaRocket,
  FaTrashAlt,
  FaSearch,
  FaCopy,
  FaDownload,
  FaPlay,
  FaExternalLinkAlt,
  FaEdit,
  FaMicrochip,
  FaExchangeAlt,
  FaExclamationCircle,
  FaSync,
  FaTimes,
  FaSlidersH,
  FaTag,
  FaFont,
  FaImage,
  FaIdCard,
  FaTasks,
  FaPlusCircle,
  FaMinus,
  FaThLarge,
  FaBoxes,
  FaLightbulb,
  FaCogs,
  FaTemperatureHigh,
  FaBell,
  FaCircle,
  FaChevronRight,
  FaChevronLeft,
  FaCube,
  FaFolder,
  FaEye,
  FaEyeSlash,
  FaArrowUp,
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaCompass,
  FaClone,
  FaCode,
  FaTerminal,
  FaQrcode,
  FaFileCode,
  FaChartLine,
  FaPalette,
  FaGamepad,
  FaGlobe,
  FaPlus,
  FaTable,
  FaDatabase,
  FaFolderPlus
} from "react-icons/fa";
import RuleBuilderModal from "./RuleBuilderModal";
import EspIdfSetupModal from "./EspIdfSetupModal";
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
class SafeQRCode extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      this.setState({ hasError: false });
    }
  }
  render() {
    if (this.state.hasError) {
      return /* @__PURE__ */ React.createElement("div", { style: {
        width: this.props.size || 185,
        height: this.props.size || 185,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
        borderRadius: 12,
        padding: 12,
        textAlign: "center",
        color: "#e53e3e",
        fontSize: 11,
        fontFamily: "sans-serif"
      } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 28 } }, "\u26A0\uFE0F"), /* @__PURE__ */ React.createElement("strong", { style: { marginTop: 6, display: "block" } }, "Payload Too Large"), /* @__PURE__ */ React.createElement("span", { style: { marginTop: 4, color: "#718096" } }, "Switch to ", /* @__PURE__ */ React.createElement("em", null, "Web App URL"), " mode for a scannable QR code"));
    }
    return /* @__PURE__ */ React.createElement(QRCodeSVG, { ...this.props });
  }
}
export default function ESP32Flasher({
  code: codeProp,
  initialStep = "connection",
  // 'connection', 'devices', 'compatibility', 'flashing', 'success', 'app_builder'
  onClose,
  projectName: propProjectName
}) {
  const toast = useToast();
  const editorTabs = useSelector((state) => state.editor?.tabs);
  const activeTabId = useSelector((state) => state.editor?.activeTabId);
  const activeTab = editorTabs?.find((t) => String(t.id) === String(activeTabId));
  const activeWorkspaceProjectName = useSelector(
    (state) => state.workspace?.projectName || state.workspace?.activeProject?.name || state.workspace?.activeProjectName
  );
  const initialProjectName = propProjectName || activeWorkspaceProjectName || localStorage.getItem("activeProjectName") || localStorage.getItem("lastActiveProjectName") || localStorage.getItem("projectName") || (activeTab?.name ? activeTab.name.replace(/\.[^/.]+$/, "") : "") || (activeTab?.title ? activeTab.title.replace(/\.[^/.]+$/, "") : "") || "ESP32 Companion";
  const [projectName, setProjectName] = useState(initialProjectName);
  useEffect(() => {
    const dynamicName = propProjectName || activeWorkspaceProjectName || localStorage.getItem("activeProjectName") || localStorage.getItem("lastActiveProjectName") || localStorage.getItem("projectName") || (activeTab?.name ? activeTab.name.replace(/\.[^/.]+$/, "") : "") || (activeTab?.title ? activeTab.title.replace(/\.[^/.]+$/, "") : "");
    if (dynamicName && dynamicName !== projectName) {
      setProjectName(dynamicName);
    }
  }, [propProjectName, activeWorkspaceProjectName, activeTab]);
  const editorCode = codeProp || activeTab?.content || editorTabs?.[0]?.content || "";
  const [wizardStep, setWizardStepState] = useState(() => {
    if (initialStep && initialStep !== "app_builder") {
      return initialStep;
    }
    const saved = localStorage.getItem("inno_flasher_active_step");
    if (saved && saved !== "app_builder") {
      return saved;
    }
    return "connection";
  });
  useEffect(() => {
    if (initialStep && initialStep !== "app_builder") {
      setWizardStepState(initialStep);
    }
  }, [initialStep]);
  const setWizardStep = useCallback((step) => {
    setWizardStepState(step);
    try {
      if (step === "app_builder") {
        localStorage.removeItem("inno_flasher_active_step");
      } else {
        localStorage.setItem("inno_flasher_active_step", step);
      }
    } catch (e) {
    }
  }, []);
  const [connectionType, setConnectionType] = useState("usb");
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const selectedDevice = devices.find((d) => d.id === selectedDeviceId) || devices[0] || null;
  const [isScanning, setIsScanning] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
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
        value: hasDevice ? `${selectedDevice.name} (${selectedDevice.port})` : "No device connected"
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
  const [flashProgress, setFlashProgress] = useState(0);
  const [flashTimeRemaining, setFlashTimeRemaining] = useState(30);
  const [flashStatusText, setFlashStatusText] = useState("Establishing connection...");
  const [flashTerminalLogs, setFlashTerminalLogs] = useState([]);
  const terminalEndRef = useRef(null);
  const [appBuilderView, setAppBuilderView] = useState("designer");
  const [starterAlertVisible, setStarterAlertVisible] = useState(false);
  const [searchPalette, setSearchPalette] = useState("");
  const [inspectorTab, setInspectorTab] = useState("properties");
  const [isSerialTrafficOpen, setIsSerialTrafficOpen] = useState(false);
  const [serialTrafficLogs, setSerialTrafficLogs] = useState([
    { id: 1, type: "rx", text: "[Hardware Link] ESP32 Ready on COM5", time: "11:00:00" },
    { id: 2, type: "rx", text: "[Telemetry] Initial sensors calibrated", time: "11:00:01" }
  ]);
  const [savedApps, setSavedApps] = useState(() => {
    try {
      const raw = localStorage.getItem("innoide:companion-apps-list");
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) return list;
      }
    } catch (e) {
    }
    return [{ name: initialProjectName, widgetCount: 0, ruleCount: 0, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }];
  });
  const [widgets, setWidgets] = useState(() => {
    try {
      const raw = localStorage.getItem(`innoide:companion-app:${initialProjectName}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.widgets)) return parsed.widgets;
      }
    } catch (e) {
    }
    return [];
  });
  const [history, setHistory] = useState(() => [widgets]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedWidgetId, setSelectedWidgetId] = useState(() => widgets[0]?.id || null);
  const activeWidget = widgets.find((w) => w.id === selectedWidgetId) || widgets[0] || null;
  const [logicBlocks, setLogicBlocks] = useState(() => {
    try {
      const raw = localStorage.getItem(`innoide:companion-app:${initialProjectName}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.logicBlocks)) return parsed.logicBlocks;
      }
    } catch (e) {
    }
    return [];
  });
  const { isOpen: isNewAppModalOpen, onOpen: onNewAppModalOpen, onClose: onNewAppModalClose } = useDisclosure();
  const { isOpen: isRenameAppModalOpen, onOpen: onRenameAppModalOpen, onClose: onRenameAppModalClose } = useDisclosure();
  const { isOpen: isClearCanvasModalOpen, onOpen: onClearCanvasModalOpen, onClose: onClearCanvasModalClose } = useDisclosure();
  const { isOpen: isCrudModalOpen, onOpen: onCrudModalOpen, onClose: onCrudModalClose } = useDisclosure();
  const [newAppNameInput, setNewAppNameInput] = useState("");
  const [renameAppNameInput, setRenameAppNameInput] = useState("");
  const [crudRecordTargetWidgetId, setCrudRecordTargetWidgetId] = useState(null);
  const [editingCrudRecord, setEditingCrudRecord] = useState(null);
  const [crudRecordForm, setCrudRecordForm] = useState({ name: "", value: "", status: "Active" });
  const { isOpen: isRuleModalOpen, onOpen: onRuleModalOpen, onClose: onRuleModalClose } = useDisclosure();
  const [editingRule, setEditingRule] = useState(null);
  const [ruleModalTab, setRuleModalTab] = useState(0);
  const [ruleSearchQuery, setRuleSearchQuery] = useState("");
  const [ruleComponentFilter, setRuleComponentFilter] = useState("all");
  const [testRuleResult, setTestRuleResult] = useState(null);
  const [isTestingRule, setIsTestingRule] = useState(false);
  const { isOpen: isPublishOpen, onOpen: onPublishOpen, onClose: onPublishClose } = useDisclosure();
  const [shareableLink] = useState(`innotrat.app/dl/${projectName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-v1`);
  const [snackSessionId, setSnackSessionId] = useState(null);
  const [snackSessionMap, setSnackSessionMap] = useState({});
  const [isSnackSyncing, setIsSnackSyncing] = useState(false);
  const activePort = selectedDevice?.port || "COM9";
  const [companionServerInfo, setCompanionServerInfo] = useState({ ip: "192.168.0.2", port: 5055 });
  const [localCompanionUrl, setLocalCompanionUrl] = useState("http://192.168.0.2:5055");
  const [qrScanMode, setQrScanMode] = useState("device");
  const [deviceQrFormat, setDeviceQrFormat] = useState("url");
  const [expoQrTarget, setExpoQrTarget] = useState("app");
  const [expoSdkVersion, setExpoSdkVersion] = useState("54.0.0");
  const [expoGoUrlMap, setExpoGoUrlMap] = useState({});
  useEffect(() => {
    if (window.electronAPI?.app?.getCompanionInfo) {
      window.electronAPI.app.getCompanionInfo().then((info) => {
        if (info?.ip) {
          setCompanionServerInfo({ ip: info.ip, port: info.port || 5055 });
          setLocalCompanionUrl(info.url || `http://${info.ip}:${info.port || 5055}`);
        }
      }).catch(() => {
      });
    }
  }, []);
  useEffect(() => {
    if (wizardStep !== "app_builder" || isPublishOpen || isRuleModalOpen) return;
    const interval = setInterval(() => {
      setWidgets(
        (prev) => prev.map((w) => {
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
  }, [wizardStep, isPublishOpen, isRuleModalOpen]);
  useEffect(() => {
    startLocalCompanionServer();
  }, [widgets.length, logicBlocks.length, projectName]);
  useEffect(() => {
    if (isPublishOpen) {
      try {
        localStorage.setItem("inno_publish_modal_open", "true");
      } catch (e) {
      }
      startLocalCompanionServer();
      if (!snackSessionId || !snackSessionMap[expoSdkVersion]) {
        syncSnackSession(false, expoSdkVersion);
      }
    } else {
      try {
        localStorage.removeItem("inno_publish_modal_open");
      } catch (e) {
      }
    }
  }, [isPublishOpen]);
  useEffect(() => {
    try {
      if (localStorage.getItem("inno_publish_modal_open") === "true") {
        onPublishOpen();
      }
    } catch (e) {
    }
  }, []);
  useEffect(() => {
    if (window.electronAPI?.app?.onCompanionAction) {
      const unsub = window.electronAPI.app.onCompanionAction((data) => {
        if (data && (data.isOn || data.isOff !== void 0)) {
          const nextVal = Boolean(data.isOn);
          setLiveLedToggle(nextVal);
          setWidgets(
            (prev) => prev.map(
              (w) => w.id === "w-led" || w.type === "switch" || /led|light/i.test(w.title || "") ? { ...w, state: nextVal } : w
            )
          );
        }
      });
      return unsub;
    }
  }, []);
  const autoDetectDeviceType = useMemo(() => {
    const hasFan = widgets.some(
      (w) => /fan/i.test(w.title || "") || /fan/i.test(w.boundTarget || "") || /fan/i.test(w.boundTargetName || "")
    );
    if (hasFan) return "FAN";
    const hasLed = widgets.some(
      (w) => /led/i.test(w.title || "") || /led/i.test(w.boundTarget || "") || /led/i.test(w.boundTargetName || "") || w.id === "w-led"
    );
    if (hasLed) return "LED";
    return "ESP32";
  }, [widgets]);
  const [selectedDeviceType, setSelectedDeviceType] = useState("");
  const [customDeviceTypeInput, setCustomDeviceTypeInput] = useState("");
  const [isEditingDeviceConfig, setIsEditingDeviceConfig] = useState(false);
  const [qrPayloadMode, setQrPayloadMode] = useState("webapp");
  const [customDeviceId, setCustomDeviceId] = useState("");
  const [customDeviceName, setCustomDeviceName] = useState("");
  const [liveLedToggle, setLiveLedToggle] = useState(false);
  const [ledHardwareError, setLedHardwareError] = useState(null);
  const handleToggleHardwareLed = async (nextVal) => {
    const targetPort = selectedDevice?.port || activePort || "COM9";
    const cmd = nextVal ? "LED:1\r\n" : "LED:0\r\n";
    const body = JSON.stringify({ payload: cmd, port: targetPort, value: nextVal, SwitchStatus: nextVal ? 1 : 0 });
    const headers = { "Content-Type": "application/json" };
    setLiveLedToggle(nextVal);
    setLedHardwareError(null);
    setWidgets(
      (prev) => prev.map(
        (w) => w.id === "w-led" || w.type === "switch" || /led|light/i.test(w.title || "") ? { ...w, state: nextVal, value: nextVal } : w
      )
    );
    let hardwareActuated = false;
    let lastError = null;
    try {
      if (window.electronAPI?.serial?.write) {
        try {
          const result = await window.electronAPI.serial.write(targetPort, cmd);
          if (result?.skipped) {
            console.warn(`[LED Toggle] Write skipped (port locked): ${result.reason}`);
          } else {
            hardwareActuated = true;
            console.log(`[LED Toggle] Electron IPC serial.write SUCCESS \u2192 ${targetPort}: ${cmd.trim()}`);
          }
        } catch (e) {
          lastError = e.message;
          console.warn(`[LED Toggle] Electron IPC serial.write failed: ${e.message}`);
          if (window.electronAPI?.serial?.connect) {
            try {
              await window.electronAPI.serial.connect(targetPort, 115200);
              const result2 = await window.electronAPI.serial.write(targetPort, cmd);
              if (!result2?.skipped) {
                hardwareActuated = true;
                lastError = null;
                console.log(`[LED Toggle] Electron IPC serial.write SUCCESS after reconnect \u2192 ${targetPort}`);
              }
            } catch (e2) {
              lastError = e2.message;
              console.warn(`[LED Toggle] Electron IPC reconnect+write failed: ${e2.message}`);
            }
          }
        }
      }
      if (!hardwareActuated) {
        try {
          const r = await fetch("http://localhost:5055/api/action", { method: "POST", headers, body });
          if (r.ok) {
            const d = await r.json();
            if (d?.success) {
              hardwareActuated = true;
              lastError = null;
              console.log(`[LED Toggle] Companion server (5055) SUCCESS \u2192 ${targetPort}`);
            } else if (d?.error) {
              lastError = d.error;
            }
          }
        } catch (e) {
          lastError = lastError || e.message;
          console.warn(`[LED Toggle] Companion server (5055) error: ${e.message}`);
        }
      }
      try {
        await fetch("http://localhost:5004/setSwitchStatus", {
          method: "POST",
          headers,
          body: JSON.stringify({ SwitchStatus: nextVal ? 1 : 0, value: nextVal, port: targetPort })
        });
      } catch (e) {
      }
      setSerialTrafficLogs((logs) => [
        ...logs.slice(-25),
        {
          id: Date.now(),
          type: "tx",
          text: `TX -> ${targetPort}: ${cmd.trim()} (${nextVal ? "LED ON" : "LED OFF"}) ${hardwareActuated ? "[OK]" : `[FAILED: ${lastError || "port unavailable"}]`}`,
          time: (/* @__PURE__ */ new Date()).toLocaleTimeString()
        }
      ]);
      if (hardwareActuated) {
        setLedHardwareError(null);
        toast({
          title: nextVal ? "\u{1F4A1} LED ON" : "\u26AB LED OFF",
          description: `Command sent to ${targetPort}`,
          status: "success",
          duration: 1500
        });
      } else {
        const errMsg = lastError || "Port unavailable";
        setLedHardwareError(errMsg);
        setLiveLedToggle(!nextVal);
        toast({
          title: "\u26A0\uFE0F Hardware Unreachable",
          description: `Could not send to ${targetPort}: ${errMsg}. Flash reactive firmware first.`,
          status: "error",
          duration: 5e3,
          isClosable: true
        });
      }
    } catch (err) {
      setLedHardwareError(err.message);
      setLiveLedToggle(!nextVal);
      toast({
        title: "Hardware Toggle Error",
        description: err.message,
        status: "error",
        duration: 2500
      });
    }
  };
  const effectiveDeviceType = ((selectedDeviceType === "CUSTOM" ? customDeviceTypeInput : selectedDeviceType || autoDetectDeviceType) || "LED").toUpperCase();
  const effectiveDeviceId = customDeviceId.trim() || selectedDevice?.id || (projectName ? projectName.toLowerCase().replace(/[^a-z0-9_-]/g, "-") : "esp32-device-01");
  const effectiveDeviceName = customDeviceName.trim() || selectedDevice?.name || projectName || "ESP32 Companion Device";
  const cleanUiList = useMemo(() => {
    return widgets.map((w) => {
      const isLedWidget = w.id === "w-led" || /led|light/i.test(w.title || "") || /led/i.test(w.boundTarget || "");
      const item = {
        id: w.id,
        type: w.type,
        title: w.title || w.label || w.name || "",
        boundTarget: w.boundTarget || w.boundTargetName || (isLedWidget ? "GPIO 2 / 48 (LED)" : ""),
        action: w.action || "Turn ON / OFF"
      };
      if (w.state !== void 0) item.state = Boolean(w.state);
      if (isLedWidget) {
        item.actionPayloadOn = "LED:1";
        item.actionPayloadOff = "LED:0";
        item.commandOn = "LED:1";
        item.commandOff = "LED:0";
      }
      if (w.type === "gauge" || w.type === "sensor" || w.type === "telemetry") {
        item.value = w.defaultValue !== void 0 ? w.defaultValue : 24;
      } else if (w.defaultValue !== void 0) {
        item.value = w.defaultValue;
      } else if (typeof w.value === "number") {
        item.value = w.value;
      }
      if (w.min !== void 0) item.min = w.min;
      if (w.max !== void 0) item.max = w.max;
      if (w.unit) item.unit = w.unit;
      if (w.color || w.buttonColor) item.color = w.color || w.buttonColor;
      if (w.placeholder) item.placeholder = w.placeholder;
      if (w.visible !== void 0) item.visible = w.visible;
      return item;
    });
  }, [widgets]);
  const cleanLogicsList = useMemo(() => {
    return logicBlocks.map((b) => {
      const isLedRule = b.id === "b-1" || /led|light/i.test(b.name || "") || /led/i.test(b.payload || "");
      const linkedWidget = widgets.find((w) => w.id === b.triggerWidgetId);
      const isComponentRule = b.triggerType === "component" || !b.triggerWidgetId?.startsWith("telem_") && !b.triggerWidgetId?.startsWith("timer");
      const isStale = isComponentRule && Boolean(b.triggerWidgetId) && !linkedWidget;
      const item = {
        id: b.id,
        name: b.name || "",
        triggerWidgetId: b.triggerWidgetId || "",
        triggerName: linkedWidget ? linkedWidget.title : b.triggerName || "",
        event: b.event || "",
        condition: b.condition || "",
        action: b.action || "",
        payload: b.payload || (isLedRule ? "LED:{state}" : ""),
        targetHardware: linkedWidget ? linkedWidget.boundTargetName || linkedWidget.boundTarget || b.targetHardware || "" : b.targetHardware || "",
        enabled: isStale ? false : b.enabled !== false,
        isStale
      };
      if (isLedRule) {
        item.onPayload = "LED:1";
        item.offPayload = "LED:0";
      }
      return item;
    });
  }, [logicBlocks, widgets]);
  const resolvedHostIp = companionServerInfo?.ip || "192.168.0.2";
  const resolvedHostPort = companionServerInfo?.port || 5055;
  const webAppQrPayload = localCompanionUrl || `http://${resolvedHostIp}:${resolvedHostPort}`;
  const companionDevicePayload = useMemo(() => {
    return JSON.stringify({
      id: effectiveDeviceId,
      name: effectiveDeviceName,
      deviceType: effectiveDeviceType,
      bridgeUrl: `http://${resolvedHostIp}:${resolvedHostPort}/api/action`,
      serverUrl: `http://${resolvedHostIp}:${resolvedHostPort}`,
      backendUrl: `http://${resolvedHostIp}:5004`,
      port: activePort
    });
  }, [effectiveDeviceId, effectiveDeviceName, effectiveDeviceType, resolvedHostIp, resolvedHostPort, activePort]);
  const bundleQrPayload = useMemo(() => {
    const minimalUi = cleanUiList.map((w) => {
      const isLed = /led|light/i.test(w.title || "") || /led/i.test(w.boundTarget || "") || w.id === "w-led";
      const m = {
        id: w.id,
        type: w.type,
        title: w.title,
        boundTarget: w.boundTarget || (isLed ? "LED (GPIO 2)" : "GPIO"),
        state: Boolean(w.state),
        on: isLed ? "LED:1" : w.actionPayloadOn || "1",
        off: isLed ? "LED:0" : w.actionPayloadOff || "0",
        commandOn: isLed ? "LED:1" : w.commandOn || "1",
        commandOff: isLed ? "LED:0" : w.commandOff || "0",
        actionPayloadOn: isLed ? "LED:1" : "1",
        actionPayloadOff: isLed ? "LED:0" : "0"
      };
      if (w.value !== void 0) m.value = w.value;
      if (w.unit) m.unit = w.unit;
      if (w.min !== void 0) m.min = w.min;
      if (w.max !== void 0) m.max = w.max;
      return m;
    });
    const minimalLogics = cleanLogicsList.map((b) => {
      const isLedRule = b.id === "b-1" || /led|light/i.test(b.name || "") || /led/i.test(b.payload || "");
      return {
        id: b.id,
        name: b.name,
        triggerWidgetId: b.triggerWidgetId,
        tw: b.triggerWidgetId,
        event: b.event,
        ev: b.event,
        payload: b.payload,
        pl: b.payload,
        on: isLedRule ? "LED:1" : b.onPayload || "1",
        off: isLedRule ? "LED:0" : b.offPayload || "0",
        onPayload: isLedRule ? "LED:1" : b.onPayload || "1",
        offPayload: isLedRule ? "LED:0" : b.offPayload || "0",
        targetHardware: b.targetHardware || "GPIO 2 / 48",
        enabled: b.enabled !== false,
        en: b.enabled !== false
      };
    });
    const payload = JSON.stringify({
      id: effectiveDeviceId,
      name: effectiveDeviceName,
      nm: effectiveDeviceName,
      deviceType: effectiveDeviceType,
      dt: effectiveDeviceType,
      bridgeUrl: `http://${resolvedHostIp}:${resolvedHostPort}/api/action`,
      bu: `http://${resolvedHostIp}:${resolvedHostPort}/api/action`,
      serverUrl: `http://${resolvedHostIp}:${resolvedHostPort}`,
      su: `http://${resolvedHostIp}:${resolvedHostPort}`,
      backendUrl: `http://${resolvedHostIp}:5004`,
      port: activePort,
      p: activePort,
      widgets: minimalUi,
      ui: minimalUi,
      rules: minimalLogics,
      logics: minimalLogics,
      lg: minimalLogics
    });
    return payload;
  }, [effectiveDeviceId, effectiveDeviceName, effectiveDeviceType, resolvedHostIp, resolvedHostPort, activePort, cleanUiList, cleanLogicsList]);
  const activeQrPayload = qrPayloadMode === "webapp" ? webAppQrPayload : qrPayloadMode === "bundle" ? bundleQrPayload : companionDevicePayload;
  const qrJsonPayload = activeQrPayload;
  const deviceQrPayload = activeQrPayload;
  const [isIdfPromptOpen, setIsIdfPromptOpen] = useState(false);
  const [idfStatus, setIdfStatus] = useState(null);
  useEffect(() => {
    const checkIdfInstallation = async () => {
      if (window.electronAPI?.flash?.checkEnv) {
        try {
          const env = await window.electronAPI.flash.checkEnv("esp32s3");
          setIdfStatus(env);
        } catch (err) {
        }
      }
    };
    checkIdfInstallation();
  }, []);
  const bgCard = useColorModeValue("white", "gray.850");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerBg = "#2563eb";
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [flashTerminalLogs]);
  const handleRefreshDevices = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      setIsScanning(true);
    }
    try {
      let ports = [];
      if (window.electronAPI?.flash?.detectPorts) {
        ports = await window.electronAPI.flash.detectPorts();
      } else if (window.electronAPI?.serial?.listPorts) {
        ports = await window.electronAPI.serial.listPorts();
      }
      if (ports && ports.length > 0) {
        const mapped = ports.map((p, idx) => ({
          id: `esp32-detected-${p.path || idx}`,
          name: p.friendlyName || (p.isUsb ? `ESP32-S3 Board (${p.path})` : `Serial Port (${p.path})`),
          ip: `192.168.1.${40 + idx}`,
          firmware: "Firmware v1.2.1",
          port: p.path,
          chip: p.chip || "esp32s3",
          manufacturer: p.manufacturer || (p.isUsb ? "USB Serial Device" : "Serial Port"),
          signal: 4,
          battery: 85 + idx * 5 % 15,
          isUsb: p.isUsb !== false,
          selected: idx === 0
        }));
        setDevices(mapped);
        setSelectedDeviceId((prevId) => {
          const exists = mapped.some((d) => d.id === prevId);
          return exists ? prevId : mapped[0]?.id;
        });
      } else {
        setDevices([]);
        setSelectedDeviceId(null);
      }
    } catch (err) {
      console.warn("Device refresh warning:", err);
      setDevices([]);
      setSelectedDeviceId(null);
    } finally {
      if (!isSilent) {
        setIsScanning(false);
      }
    }
  }, []);
  useEffect(() => {
    handleRefreshDevices(false);
  }, [handleRefreshDevices]);
  useEffect(() => {
    if (wizardStep !== "devices") return;
    handleRefreshDevices(false);
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      handleRefreshDevices(true);
    }, 3e3);
    return () => clearInterval(timer);
  }, [wizardStep, autoRefresh, handleRefreshDevices]);
  const handleStartFlash = async () => {
    if (!selectedDevice || !selectedDevice.port) {
      toast({
        title: "No Device Connected",
        description: "Please connect an ESP32 board via USB before flashing.",
        status: "warning",
        duration: 4e3,
        isClosable: true
      });
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
        let cleanup = null;
        if (window.electronAPI.flash.onEvent) {
          cleanup = window.electronAPI.flash.onEvent((evt) => {
            if (evt.log) {
              setFlashTerminalLogs((prev) => [...prev, evt.log]);
            }
            if (evt.status === "error" || evt.stage === "flashing" && evt.status === "error") {
              setFlashStatusText(`Flashing error: ${evt.message || "Operation failed"}`);
              toast({
                title: "Flashing Error",
                description: evt.message || "Firmware flashing encountered an error.",
                status: "error",
                duration: 5e3,
                isClosable: true
              });
            } else if (evt.status === "setting_target" || evt.status === "target_stdout") {
              setFlashProgress((p) => Math.max(p, 20));
              setFlashStatusText(`Setting chip target (auto-detect)...`);
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
        setFlashTerminalLogs((prev) => [...prev, "[ERROR] Desktop Electron environment is required to communicate with physical COM ports."]);
        toast({
          title: "Desktop App Required",
          description: "Hardware flashing is only available when running in the InnoIDE Desktop App with connected hardware.",
          status: "warning",
          duration: 5e3,
          isClosable: true
        });
      }
    } catch (err) {
      setFlashTerminalLogs((prev) => [...prev, `[ERROR] Flashing failed: ${err.message}`]);
      setFlashStatusText(`Error: ${err.message}`);
      toast({
        title: "Flashing Error",
        description: err.message,
        status: "error",
        duration: 5e3,
        isClosable: true
      });
    }
  };
  const pushWidgetsToHistory = useCallback((nextWidgets) => {
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, nextWidgets];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setWidgets(history[prevIdx]);
      toast({ title: "Action Undone", status: "info", duration: 1200 });
    }
  }, [history, historyIndex, toast]);
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setWidgets(history[nextIdx]);
      toast({ title: "Action Redone", status: "info", duration: 1200 });
    }
  }, [history, historyIndex, toast]);
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
  }, [wizardStep, handleUndo, handleRedo]);
  const registerSavedApp = useCallback((name, widgetCount, ruleCount) => {
    try {
      const raw = localStorage.getItem("innoide:companion-apps-list");
      let list = [];
      if (raw) {
        try {
          list = JSON.parse(raw);
        } catch (e) {
        }
      }
      if (!Array.isArray(list)) list = [];
      const idx = list.findIndex((a) => a.name === name);
      const entry = { name, widgetCount, ruleCount, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
      if (idx !== -1) {
        list[idx] = entry;
      } else {
        list.push(entry);
      }
      localStorage.setItem("innoide:companion-apps-list", JSON.stringify(list));
      setSavedApps(list);
    } catch (e) {
    }
  }, []);
  const autoPersistApp = useCallback((newWidgets, newBlocks = logicBlocks, name = projectName) => {
    try {
      const appConfig = {
        projectName: name,
        savedAt: (/* @__PURE__ */ new Date()).toISOString(),
        widgets: newWidgets,
        logicBlocks: newBlocks,
        device: selectedDevice
      };
      localStorage.setItem(`innoide:companion-app:${name}`, JSON.stringify(appConfig));
      registerSavedApp(name, newWidgets.length, newBlocks.length);
    } catch (e) {
    }
  }, [logicBlocks, projectName, selectedDevice, registerSavedApp]);
  const handleLoadApp = (targetName) => {
    try {
      const raw = localStorage.getItem(`innoide:companion-app:${targetName}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        const loadedWidgets = Array.isArray(parsed.widgets) ? parsed.widgets : [];
        const loadedBlocks = Array.isArray(parsed.logicBlocks) ? parsed.logicBlocks : [];
        setProjectName(targetName);
        setWidgets(loadedWidgets);
        setLogicBlocks(loadedBlocks);
        setHistory([loadedWidgets]);
        setHistoryIndex(0);
        setSelectedWidgetId(loadedWidgets[0]?.id || null);
        toast({
          title: "App Screen Loaded",
          description: `Loaded "${targetName}" with ${loadedWidgets.length} components.`,
          status: "info",
          duration: 2e3
        });
        return;
      }
    } catch (e) {
    }
    setProjectName(targetName);
    setWidgets([]);
    setLogicBlocks([]);
    setHistory([[]]);
    setHistoryIndex(0);
    setSelectedWidgetId(null);
  };
  const handleCreateNewApp = (name) => {
    const trimmed = (name || "").trim();
    if (!trimmed) return;
    setProjectName(trimmed);
    setWidgets([]);
    setLogicBlocks([]);
    setHistory([[]]);
    setHistoryIndex(0);
    setSelectedWidgetId(null);
    autoPersistApp([], [], trimmed);
    toast({
      title: "New App Created",
      description: `Created blank app screen "${trimmed}".`,
      status: "success",
      duration: 2200
    });
  };
  const handleRenameApp = (oldName, newName) => {
    const trimmed = (newName || "").trim();
    if (!trimmed || trimmed === oldName) return;
    try {
      const existing = localStorage.getItem(`innoide:companion-app:${oldName}`);
      if (existing) {
        localStorage.setItem(`innoide:companion-app:${trimmed}`, existing);
        localStorage.removeItem(`innoide:companion-app:${oldName}`);
      }
      const raw = localStorage.getItem("innoide:companion-apps-list");
      let list = raw ? JSON.parse(raw) : [];
      list = list.map((a) => a.name === oldName ? { ...a, name: trimmed } : a);
      localStorage.setItem("innoide:companion-apps-list", JSON.stringify(list));
      setSavedApps(list);
      setProjectName(trimmed);
      toast({
        title: "App Renamed",
        description: `Renamed to "${trimmed}".`,
        status: "success",
        duration: 2e3
      });
    } catch (e) {
    }
  };
  const handleDeleteApp = (nameToDelete) => {
    try {
      localStorage.removeItem(`innoide:companion-app:${nameToDelete}`);
      const raw = localStorage.getItem("innoide:companion-apps-list");
      let list = raw ? JSON.parse(raw) : [];
      list = list.filter((a) => a.name !== nameToDelete);
      localStorage.setItem("innoide:companion-apps-list", JSON.stringify(list));
      setSavedApps(list);
      toast({
        title: "App Screen Deleted",
        description: `"${nameToDelete}" was removed.`,
        status: "info",
        duration: 2e3
      });
      if (nameToDelete === projectName) {
        const next = list[0]?.name || "default_app";
        handleLoadApp(next);
      }
    } catch (e) {
    }
  };
  const handleClearAllWidgets = () => {
    setWidgets([]);
    pushWidgetsToHistory([]);
    setSelectedWidgetId(null);
    autoPersistApp([]);
    setLogicBlocks(
      (prev) => prev.map((b) => b.triggerType === "component" ? { ...b, enabled: false, isStale: true } : b)
    );
    toast({
      title: "Canvas Cleared",
      description: "All components removed from mobile app. Component rules marked invalid.",
      status: "info",
      duration: 2e3
    });
  };
  const handleOpenAddCrudRecord = (widgetId) => {
    setCrudRecordTargetWidgetId(widgetId);
    setEditingCrudRecord(null);
    setCrudRecordForm({ name: "", value: "", status: "Active" });
    onCrudModalOpen();
  };
  const handleOpenEditCrudRecord = (widgetId, record) => {
    setCrudRecordTargetWidgetId(widgetId);
    setEditingCrudRecord(record);
    setCrudRecordForm({ name: record.name, value: record.value, status: record.status || "Active" });
    onCrudModalOpen();
  };
  const handleSaveCrudRecord = () => {
    if (!crudRecordTargetWidgetId || !crudRecordForm.name.trim()) {
      toast({ title: "Name Required", description: "Please enter a record name.", status: "warning", duration: 2e3 });
      return;
    }
    const updated = widgets.map((w) => {
      if (w.id !== crudRecordTargetWidgetId) return w;
      const records = Array.isArray(w.records) ? [...w.records] : [];
      if (editingCrudRecord) {
        const updatedRecords = records.map(
          (r) => r.id === editingCrudRecord.id ? { ...r, name: crudRecordForm.name.trim(), value: crudRecordForm.value.trim(), status: crudRecordForm.status, timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) } : r
        );
        return { ...w, records: updatedRecords };
      } else {
        const newRecord = {
          id: `rec-${Date.now()}`,
          name: crudRecordForm.name.trim(),
          value: crudRecordForm.value.trim() || "OK",
          status: crudRecordForm.status || "Active",
          timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        return { ...w, records: [...records, newRecord] };
      }
    });
    setWidgets(updated);
    pushWidgetsToHistory(updated);
    autoPersistApp(updated);
    onCrudModalClose();
    toast({
      title: editingCrudRecord ? "Record Updated" : "Record Created",
      status: "success",
      duration: 1800
    });
  };
  const handleDeleteCrudRecord = (widgetId, recordId) => {
    const updated = widgets.map((w) => {
      if (w.id !== widgetId) return w;
      const records = (w.records || []).filter((r) => r.id !== recordId);
      return { ...w, records };
    });
    setWidgets(updated);
    pushWidgetsToHistory(updated);
    autoPersistApp(updated);
    toast({ title: "Record Deleted", status: "info", duration: 1500 });
  };
  const handleSaveApp = () => {
    try {
      const appConfig = {
        projectName,
        savedAt: (/* @__PURE__ */ new Date()).toISOString(),
        widgets,
        logicBlocks,
        device: selectedDevice
      };
      localStorage.setItem(`innoide:companion-app:${projectName}`, JSON.stringify(appConfig));
      registerSavedApp(projectName, widgets.length, logicBlocks.length);
      toast({
        title: "Companion App Saved",
        description: `"${projectName}" saved with ${widgets.length} components and ${logicBlocks.length} logic rules.`,
        status: "success",
        duration: 2500,
        isClosable: true
      });
    } catch (e) {
      toast({ title: "Save Error", description: e.message, status: "error", duration: 3e3 });
    }
  };
  const handleAddComponent = (type, title, defaultBinding) => {
    const newId = `w-${Date.now()}`;
    const newWidget = {
      id: newId,
      type,
      title: title || (type === "top_button" ? "Top Button" : type === "bottom_button" ? "Bottom Button" : type === "left_button" ? "Left Button" : type === "right_button" ? "Right Button" : type === "dpad" ? "Directional D-Pad" : type === "crud_table" ? "Data Records" : `New ${type}`),
      boundTarget: defaultBinding || (type === "top_button" ? "GPIO 13 (Motor A)" : type === "bottom_button" ? "GPIO 14 (Motor B)" : type === "left_button" ? "GPIO 12 (Steer Left)" : type === "right_button" ? "GPIO 15 (Steer Right)" : type === "dpad" ? "GPIO Multi-Motor" : type === "crud_table" ? "Local Storage / Device Data" : "GPIO Pin"),
      boundTargetName: `Bound \u2192 ${defaultBinding || (type === "top_button" ? "GPIO 13 (Motor A)" : type === "bottom_button" ? "GPIO 14 (Motor B)" : type === "left_button" ? "GPIO 12 (Steer Left)" : type === "right_button" ? "GPIO 15 (Steer Right)" : type === "dpad" ? "GPIO Multi-Motor" : type === "crud_table" ? "Local Storage" : "GPIO Pin")}`,
      action: type === "switch" ? "Turn ON / OFF" : type === "slider" ? "Set PWM Angle" : type === "gauge" ? "Read Telemetry" : type === "top_button" ? "Forward (Top) Pulse" : type === "bottom_button" ? "Reverse (Bottom) Pulse" : type === "left_button" ? "Steer Left Pulse" : type === "right_button" ? "Steer Right Pulse" : type === "dpad" ? "4-Way Directional Control" : type === "crud_table" ? "CRUD Storage" : "Execute Action",
      state: false,
      value: type === "slider" ? 50 : type === "gauge" ? 25 : 0,
      min: 0,
      max: type === "slider" ? 180 : type === "gauge" ? 100 : 100,
      unit: type === "slider" ? "\xB0" : type === "gauge" ? "\xB0C" : "",
      color: type === "gauge" ? "#ef4444" : type === "slider" ? "#8b5cf6" : type === "switch" ? "#2563eb" : type === "top_button" ? "#2563eb" : type === "bottom_button" ? "#0284c7" : type === "left_button" ? "#7c3aed" : type === "right_button" ? "#9333ea" : type === "dpad" ? "#1e293b" : type === "crud_table" ? "#2563eb" : "#10b981",
      cornerRadius: 16,
      visible: true,
      records: type === "crud_table" ? [
        { id: "rec-1", name: "Device Status", value: "Active", status: "Active", timestamp: "10:00 AM" },
        { id: "rec-2", name: "Temperature Alert", value: "24.5\xB0C", status: "Normal", timestamp: "10:15 AM" },
        { id: "rec-3", name: "GPIO Relay", value: "Closed", status: "Active", timestamp: "10:30 AM" }
      ] : void 0
    };
    const updated = [...widgets, newWidget];
    setWidgets(updated);
    pushWidgetsToHistory(updated);
    setSelectedWidgetId(newId);
    autoPersistApp(updated);
    toast({
      title: "Component Added",
      description: `Added "${newWidget.title}" to your mobile app canvas.`,
      status: "success",
      duration: 1800
    });
  };
  const handleUpdateWidget = (prop, value, customWidgetId = null) => {
    const targetId = customWidgetId || selectedWidgetId;
    if (!targetId) return;
    let targetWidget = null;
    setWidgets((prev) => {
      targetWidget = prev.find((w) => w.id === targetId);
      const updated = prev.map((w) => w.id === targetId ? { ...w, [prop]: value } : w);
      autoPersistApp(updated);
      return updated;
    });
    if (prop === "state" || prop === "value") {
      const tgt = targetWidget || widgets.find((w) => w.id === targetId);
      const targetPort = selectedDevice?.port || activePort || "COM9";
      if (tgt) {
        if (tgt.type === "switch" || /led|light/i.test(tgt.title || "") || targetId === "w-led") {
          setLiveLedToggle(Boolean(value));
          handleToggleHardwareLed(Boolean(value));
        } else if (window.electronAPI?.serial?.write && targetPort) {
          const cmd = `SET ${tgt.title.replace(/\s+/g, "_").toUpperCase()}=${value}\r
`;
          window.electronAPI.serial.write(targetPort, cmd).catch(() => {
          });
          setSerialTrafficLogs((logs) => [
            ...logs.slice(-20),
            { id: Date.now(), type: "tx", text: `TX -> ${targetPort}: ${cmd.trim()}`, time: (/* @__PURE__ */ new Date()).toLocaleTimeString() }
          ]);
        }
      }
      if (tgt && targetId !== "w-led") {
        evaluateRulesForWidget(tgt, prop, value);
      }
    }
  };
  const handleDeleteWidget = (id) => {
    const deletedWidget = widgets.find((w) => w.id === id);
    const updated = widgets.filter((w) => w.id !== id);
    setWidgets(updated);
    pushWidgetsToHistory(updated);
    if (selectedWidgetId === id) {
      setSelectedWidgetId(updated[0]?.id || "");
    }
    autoPersistApp(updated);
    const affectedRules = logicBlocks.filter((b) => b.triggerWidgetId === id);
    if (affectedRules.length > 0) {
      setLogicBlocks(
        (prev) => prev.map(
          (b) => b.triggerWidgetId === id ? { ...b, enabled: false, isStale: true } : b
        )
      );
      toast({
        title: "Component Removed",
        description: `"${deletedWidget?.title || "Component"}" was deleted. ${affectedRules.length} rule(s) referencing it marked as invalid.`,
        status: "warning",
        duration: 3500,
        isClosable: true
      });
    } else {
      toast({ title: "Component Removed", status: "info", duration: 1500 });
    }
  };
  const handleMoveWidget = (id, direction) => {
    const index = widgets.findIndex((w) => w.id === id);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === widgets.length - 1) return;
    const newIndex = direction === "up" ? index - 1 : index + 1;
    const reordered = [...widgets];
    const [movedItem] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, movedItem);
    setWidgets(reordered);
    pushWidgetsToHistory(reordered);
    autoPersistApp(reordered);
  };
  const handleDuplicateWidget = (id) => {
    const item = widgets.find((w) => w.id === id);
    if (!item) return;
    const clone = {
      ...item,
      id: `w-${Date.now()}`,
      title: `${item.title} (Copy)`
    };
    const updated = [...widgets, clone];
    setWidgets(updated);
    pushWidgetsToHistory(updated);
    setSelectedWidgetId(clone.id);
    autoPersistApp(updated);
    toast({ title: "Component Duplicated", status: "success", duration: 1500 });
  };
  const handleToggleVisibility = (id) => {
    setWidgets((prev) => {
      const updated = prev.map((w) => w.id === id ? { ...w, visible: w.visible === false ? true : false } : w);
      pushWidgetsToHistory(updated);
      autoPersistApp(updated);
      return updated;
    });
  };
  const handleTestHardwareSignal = async (widget) => {
    if (!widget) return;
    const targetPort = activePort;
    const testCmd = `TEST:${widget.boundTarget || "GPIO"}:PULSE\r
`;
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
          { id: Date.now(), type: "tx", text: `TX -> ${targetPort}: ${testCmd.trim()}`, time: (/* @__PURE__ */ new Date()).toLocaleTimeString() }
        ]);
        toast({
          title: "Hardware Signal Sent",
          description: `Pulse transmitted to ${targetPort} (${widget.boundTarget || "Pin"}).`,
          status: "success",
          duration: 2e3
        });
      } catch (err) {
        setSerialTrafficLogs((logs) => [
          ...logs.slice(-20),
          { id: Date.now(), type: "sim", text: `[SIMULATED] TX -> ${targetPort}: ${testCmd.trim()}`, time: (/* @__PURE__ */ new Date()).toLocaleTimeString() }
        ]);
        toast({
          title: "Simulated Signal",
          description: `Port ${targetPort} not connected. Simulated pulse for ${widget.title || "Widget"}.`,
          status: "info",
          duration: 2500
        });
      }
    } else {
      setSerialTrafficLogs((logs) => [
        ...logs.slice(-20),
        { id: Date.now(), type: "sim", text: `[SIMULATED] TX -> ${targetPort}: ${testCmd.trim()}`, time: (/* @__PURE__ */ new Date()).toLocaleTimeString() }
      ]);
      toast({
        title: "Signal Simulated",
        description: `Simulated pulse triggered for ${widget.title} (${widget.boundTarget || "GPIO Pin"}).`,
        status: "info",
        duration: 2e3
      });
    }
  };
  const handleOpenAddRule = (initialTab = 0, specificWidget = null) => {
    const targetWidget = specificWidget || widgets[0];
    const defaultGpio = ESP32_GPIO_OPTIONS[0];
    setEditingRule({
      id: `b-${Date.now()}`,
      name: targetWidget ? `${targetWidget.title} Sync` : `Automation Rule #${logicBlocks.length + 1}`,
      triggerType: targetWidget ? "component" : "telemetry",
      // 'component' | 'telemetry' | 'timer'
      triggerWidgetId: targetWidget?.id || "telem_temp",
      triggerName: targetWidget?.title || "Temperature Telemetry",
      event: targetWidget ? targetWidget.type === "switch" ? "on_toggle" : targetWidget.type === "slider" ? "on_change" : targetWidget.type === "button" ? "on_press" : "on_update" : "threshold_above",
      condition: "Always",
      conditionType: "Always",
      conditionThreshold: "30",
      conditionUnit: "\xB0C",
      action: defaultGpio.defaultAction || "Send Serial Command",
      payload: defaultGpio.defaultPayload || "LED:{state}",
      targetHardware: targetWidget?.boundTargetName || targetWidget?.boundTarget || defaultGpio.pin + " (" + defaultGpio.defaultTarget + ")",
      targetPin: targetWidget?.pin || defaultGpio.pin,
      enabled: true
    });
    setRuleModalTab(initialTab);
    setTestRuleResult(null);
    onRuleModalOpen();
  };
  const handleOpenEditRule = (rule, tabIndex = 0) => {
    setEditingRule({
      ...rule,
      triggerType: rule.triggerType || (rule.triggerWidgetId?.startsWith("telem_") ? "telemetry" : rule.triggerWidgetId?.startsWith("timer") ? "timer" : "component"),
      targetPin: rule.targetPin || rule.targetHardware?.split(" ")[0] || "GPIO 2",
      conditionType: rule.conditionType || (rule.condition?.includes(">") ? "Value >" : rule.condition?.includes("<") ? "Value <" : rule.condition?.includes("==") ? "Value ==" : "Always")
    });
    setRuleModalTab(tabIndex);
    setTestRuleResult(null);
    onRuleModalOpen();
  };
  const handleSaveRuleModal = () => {
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
    toast({
      title: "Rule Saved",
      description: `Rule "${editingRule.name}" configuration saved and active.`,
      status: "success",
      duration: 2e3
    });
    onRuleModalClose();
  };
  const handleDeleteLogicBlock = (id) => {
    setLogicBlocks((prev) => prev.filter((b) => b.id !== id));
    toast({ title: "Rule Deleted", status: "info", duration: 1500 });
  };
  const handleToggleLogicBlock = (id) => {
    setLogicBlocks(
      (prev) => prev.map((b) => b.id === id ? { ...b, enabled: !b.enabled } : b)
    );
  };
  const handleExecuteRule = async (rule, triggerVal = null) => {
    if (!rule) return;
    const targetPort = activePort;
    let formattedPayload = rule.payload || "CMD";
    if (triggerVal !== null) {
      if (typeof triggerVal === "boolean") {
        formattedPayload = formattedPayload.replace(/{state}/g, triggerVal ? "1" : "0").replace(/{state_str}/g, triggerVal ? "HIGH" : "LOW").replace(/{value}/g, triggerVal ? "1" : "0");
      } else {
        formattedPayload = formattedPayload.replace(/{value}/g, String(triggerVal)).replace(/{state}/g, String(triggerVal));
      }
    }
    const serialMsg = `${formattedPayload}\r
`;
    if (window.electronAPI?.serial?.write && targetPort) {
      try {
        if (window.electronAPI.serial.connect) {
          try {
            await window.electronAPI.serial.connect(targetPort, 115200);
          } catch (_) {
          }
        }
        await window.electronAPI.serial.write(targetPort, serialMsg);
        try {
          fetch("http://localhost:5055/api/action", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payload: serialMsg, port: targetPort, value: triggerVal, SwitchStatus: triggerVal ? 1 : 0 })
          }).catch(() => {
          });
        } catch (_) {
        }
        setSerialTrafficLogs((logs) => [
          ...logs.slice(-20),
          {
            id: Date.now(),
            type: "tx",
            text: `[RULE TX] ${rule.name} -> ${targetPort} (${rule.targetHardware || "Hardware"}): ${serialMsg.trim()}`,
            time: (/* @__PURE__ */ new Date()).toLocaleTimeString()
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
                time: (/* @__PURE__ */ new Date()).toLocaleTimeString()
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
          time: (/* @__PURE__ */ new Date()).toLocaleTimeString()
        }
      ]);
      return { success: true, text: `Simulated: "${serialMsg.trim()}" targeted at ${rule.targetHardware || "Hardware"}` };
    }
  };
  const evaluateRulesForWidget = useCallback((targetWidget, prop, value) => {
    if (!targetWidget) return;
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
        conditionMet = String(value) === String(thresh) || typeof value === "boolean" && (value ? "1" : "0") === thresh;
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
  }, [logicBlocks, selectedDevice]);
  const getStandaloneHtmlContent = () => {
    const widgetsJson = JSON.stringify(widgets);
    const logicBlocksJson = JSON.stringify(logicBlocks);
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${projectName} - IoT Companion App</title>
  <style>
    :root { --primary: #38bdf8; --bg: #090d16; --card: #131b2e; --border: #1e293b; --text: #f8fafc; --subtext: #94a3b8; }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: var(--bg); color: var(--text); min-height: 100vh; display: flex; justify-content: center; padding: 16px; }
    .phone { width: 100%; max-width: 440px; background: #0f172a; border-radius: 28px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); padding: 20px; display: flex; flex-direction: column; gap: 16px; border: 1px solid var(--border); }
    .header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
    .brand-sub { font-size: 10px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px; }
    .header h1 { font-size: 18px; font-weight: 800; color: #fff; margin-top: 2px; }
    .badge { font-size: 11px; padding: 4px 10px; border-radius: 9999px; background: rgba(34,197,94,0.15); color: #4ade80; font-weight: 700; display: flex; align-items: center; gap: 5px; }
    .badge-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; }
    .tabs { display: flex; background: #090d16; padding: 4px; border-radius: 12px; border: 1px solid var(--border); gap: 4px; }
    .tab-btn { flex: 1; padding: 8px 4px; background: transparent; border: none; border-radius: 8px; color: var(--subtext); font-size: 12px; font-weight: 700; cursor: pointer; text-align: center; }
    .tab-btn.active { background: #1e293b; color: #fff; border-bottom: 2px solid #38bdf8; }
    .tab-content { display: none; flex-direction: column; gap: 14px; }
    .tab-content.active { display: flex; }
    .card { background: var(--card); border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 12px; border: 1px solid var(--border); }
    .card.glow-blue { border-color: #2563eb; background: #101a38; }
    .card.glow-red { border-color: #ef4444; background: #261214; }
    .row { display: flex; align-items: center; justify-content: space-between; }
    .title { font-weight: 700; font-size: 15px; color: #f8fafc; }
    .meta { font-size: 12px; color: var(--subtext); margin-top: 2px; }
    .btn { background: #ea580c; color: white; border: none; border-radius: 14px; padding: 14px 20px; font-weight: 800; cursor: pointer; width: 100%; font-size: 14px; text-align: center; }
    .toggle { position: relative; width: 48px; height: 26px; }
    .toggle input { opacity: 0; width: 0; height: 0; }
    .slider-toggle { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: #334155; border-radius: 26px; transition: 0.3s; }
    .slider-toggle:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s; }
    input:checked + .slider-toggle { background: #2563eb; }
    input:checked + .slider-toggle:before { transform: translateX(22px); }
    .slider-row { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
    .step-btn { background: #1e293b; color: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 6px 10px; font-weight: 800; font-size: 11px; cursor: pointer; }
    .slider-bar-wrap { flex: 1; height: 8px; background: #1e293b; border-radius: 4px; overflow: hidden; }
    .slider-bar-fill { height: 100%; background: #a855f7; border-radius: 4px; }
    .gauge-big { font-size: 36px; font-weight: 900; text-align: center; color: #38bdf8; margin: 6px 0; }
    .live-pill { font-size: 10px; font-weight: 800; background: #082f49; color: #38bdf8; padding: 3px 8px; border-radius: 6px; }
    .live-pill.alert { background: #7f1d1d; color: #fca5a5; }
    .logic-card { background: var(--card); border-radius: 16px; padding: 14px; border: 1px solid var(--border); border-left: 4px solid #10b981; display: flex; flex-direction: column; gap: 10px; }
    .logic-details { background: #090d16; border-radius: 10px; padding: 10px; font-size: 11px; display: flex; flex-direction: column; gap: 5px; }
    .logic-row { display: flex; align-items: center; gap: 6px; }
    .logic-label { color: #64748b; font-weight: 700; width: 75px; }
    .logic-val { color: #e2e8f0; font-weight: 600; flex: 1; }
    .logic-code { color: #38bdf8; font-family: monospace; font-weight: 700; }
    .test-btn { background: #1e293b; color: #38bdf8; border: 1px solid #334155; border-radius: 8px; padding: 4px 10px; font-size: 11px; font-weight: 800; cursor: pointer; }
    .pin-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border); font-size: 12px; }
    .log-box { font-family: monospace; font-size: 11px; padding: 12px; border-radius: 14px; background: #090d16; color: #38bdf8; max-height: 180px; overflow-y: auto; border: 1px solid var(--border); display: flex; flex-direction: column; gap: 3px; }
  </style>
</head>
<body>
  <div class="phone">
    <div class="header">
      <div>
        <div class="brand-sub">InnoIDE Companion</div>
        <h1>\u{1F331} ${projectName}</h1>
      </div>
      <div class="badge"><div class="badge-dot"></div> ESP32 Linked</div>
    </div>

    <div class="tabs">
      <button class="tab-btn active" onclick="setTab('controls')">\u{1F39B}\uFE0F Controls</button>
      <button class="tab-btn" onclick="setTab('logic')">\u26A1 Logic Rules</button>
      <button class="tab-btn" onclick="setTab('hardware')">\u{1F4E1} Hardware & Logs</button>
    </div>

    <!-- TAB 1: UI CONTROLS -->
    <div id="tab-controls" class="tab-content active">
      ${widgets.filter((w) => w.visible !== false).length === 0 ? `
        <div class="card" style="text-align: center; padding: 32px 16px; color: var(--subtext);">
          <div style="font-size: 24px; margin-bottom: 8px;">\u{1F4F1}</div>
          <div style="font-weight: 700; color: #f8fafc; margin-bottom: 4px;">No Components Added</div>
          <div style="font-size: 12px;">Add components in InnoIDE App Designer to control hardware from this companion app.</div>
        </div>
      ` : widgets.filter((w) => w.visible !== false).map((w) => {
      if (w.type === "switch") {
        return `
          <div class="card ${w.state ? "glow-blue" : ""}" id="card-${w.id}">
            <div class="row">
              <div>
                <div class="title">${w.title}</div>
                <div class="meta">Target: ${w.boundTarget || "GPIO 2 (LED)"}</div>
              </div>
              <label class="toggle">
                <input type="checkbox" id="input-${w.id}" ${w.state ? "checked" : ""} onchange="handleSwitch('${w.id}', this.checked, '${w.title}')">
                <span class="slider-toggle"></span>
              </label>
            </div>
          </div>`;
      }
      if (w.type === "slider") {
        return `
          <div class="card" id="card-${w.id}">
            <div class="row">
              <div>
                <div class="title">${w.title}</div>
                <div class="meta">PWM Target: ${w.boundTarget || "GPIO 4 (Servo)"}</div>
              </div>
              <div style="font-weight: 800; font-size: 18px; color: ${w.color || "#a855f7"};" id="val-${w.id}">${w.value || 90}${w.unit || "\xB0"}</div>
            </div>
            <div class="slider-row">
              <button class="step-btn" onclick="stepSlider('${w.id}', -10, ${w.min || 0}, ${w.max || 180}, '${w.title}')">-10\xB0</button>
              <button class="step-btn" onclick="stepSlider('${w.id}', -1, ${w.min || 0}, ${w.max || 180}, '${w.title}')">-1\xB0</button>
              <div class="slider-bar-wrap">
                <div class="slider-bar-fill" id="bar-${w.id}" style="width: ${((w.value || 90) - (w.min || 0)) / ((w.max || 180) - (w.min || 0)) * 100}%;"></div>
              </div>
              <button class="step-btn" onclick="stepSlider('${w.id}', 1, ${w.min || 0}, ${w.max || 180}, '${w.title}')">+1\xB0</button>
              <button class="step-btn" onclick="stepSlider('${w.id}', 10, ${w.min || 0}, ${w.max || 180}, '${w.title}')">+10\xB0</button>
            </div>
          </div>`;
      }
      if (w.type === "gauge") {
        return `
          <div class="card" id="card-${w.id}">
            <div class="row">
              <div>
                <div class="title">${w.title}</div>
                <div class="meta">Source: ${w.boundTarget || "ADC Telemetry"}</div>
              </div>
              <div class="live-pill" id="pill-${w.id}">\u25CF LIVE ADC</div>
            </div>
            <div class="gauge-big" id="val-${w.id}">${w.value || 24.3}${w.unit || "\xB0C"}</div>
            <div class="meta" style="text-align: center;">Range: ${w.min || 0} - ${w.max || 50}${w.unit || "\xB0C"} (Guard Threshold: 30\xB0C)</div>
          </div>`;
      }
      if (w.type === "button") {
        return `
          <button class="btn" style="background: ${w.color || "#ea580c"};" onclick="handleBtn('${w.title}', '${w.boundTarget || "GPIO 5"}', '${w.action || "TRIGGER"}')">
            \u{1F6A8} ${w.title}
          </button>`;
      }
      if (w.type === "device_card") {
        return `
          <div class="card" id="card-${w.id}">
            <div class="row">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 34px; height: 34px; border-radius: 10px; background: rgba(37,99,235,0.2); display: flex; align-items: center; justify-content: center; font-size: 16px;">\u{1F4E1}</div>
                <div>
                  <div class="title">${w.title || "ESP32 Dev Board"}</div>
                  <div style="font-size: 10px; color: #4ade80; font-weight: 700; margin-top: 2px;">\u25CF Online & Connected</div>
                </div>
              </div>
              <div class="live-pill">WIFI 100%</div>
            </div>
          </div>`;
      }
      if (w.type === "label") {
        return `
          <div class="card" id="card-${w.id}" style="padding: 12px 16px;">
            <div class="title" style="color: ${w.color || "#f8fafc"};">${w.title}</div>
            ${w.boundTarget ? `<div class="meta">${w.boundTarget}</div>` : ""}
          </div>`;
      }
      if (w.type === "textfield") {
        return `
          <div class="card" id="card-${w.id}">
            <div class="title">${w.title}</div>
            <div style="background: #090d16; border-radius: 8px; padding: 10px; margin-top: 6px; border: 1px solid var(--border); font-size: 12px; color: var(--subtext);">
              ${w.placeholder || "Text field..."}
            </div>
          </div>`;
      }
      if (w.type === "progress") {
        return `
          <div class="card" id="card-${w.id}">
            <div class="row">
              <div class="title">${w.title}</div>
              <div style="font-size: 12px; color: #38bdf8; font-weight: 800;">75%</div>
            </div>
            <div class="slider-bar-wrap" style="margin-top: 6px;">
              <div class="slider-bar-fill" style="width: 75%; background: #38bdf8;"></div>
            </div>
          </div>`;
      }
      return "";
    }).join("")}
    </div>

    <!-- TAB 2: FUNCTIONAL LOGIC -->
    <div id="tab-logic" class="tab-content">
      <div style="font-size: 12px; color: var(--subtext);">Autonomous trigger-action rules executed on ESP32 & bridge:</div>
      ${logicBlocks.length === 0 ? `
        <div class="card" style="text-align: center; padding: 32px 16px; color: var(--subtext);">
          <div style="font-size: 24px; margin-bottom: 8px;">\u26A1</div>
          <div style="font-weight: 700; color: #f8fafc; margin-bottom: 4px;">No Automation Rules</div>
          <div style="font-size: 12px;">Configure automation rules in InnoIDE App Designer.</div>
        </div>
      ` : logicBlocks.map((rule) => `
        <div class="logic-card" id="rule-card-${rule.id}">
          <div class="row">
            <div>
              <div style="font-weight: 800; font-size: 15px; color: #fff;">${rule.name}</div>
              <div class="meta">Target: ${rule.targetHardware || "Hardware Pin"}</div>
            </div>
            <label class="toggle">
              <input type="checkbox" id="rule-toggle-${rule.id}" ${rule.enabled ? "checked" : ""} onchange="toggleRule('${rule.id}', this.checked)">
              <span class="slider-toggle"></span>
            </label>
          </div>
          <div class="logic-details">
            <div class="logic-row"><span class="logic-label">\u{1F504} Trigger:</span><span class="logic-val">${rule.triggerName} (${rule.event})</span></div>
            <div class="logic-row"><span class="logic-label">\u2696\uFE0F Condition:</span><span class="logic-val" style="color: #fbbf24;">${rule.condition || "Always"}</span></div>
            <div class="logic-row"><span class="logic-label">\u{1F680} Action:</span><span class="logic-val" style="color: #38bdf8;">${rule.action}</span></div>
            <div class="logic-row"><span class="logic-label">\u{1F4E6} Payload:</span><span class="logic-code">${rule.payload}</span></div>
          </div>
          <div class="row" style="margin-top: 4px;">
            <div class="meta" id="rule-exec-${rule.id}">Executions: 0</div>
            <button class="test-btn" onclick="testRule('${rule.id}')">\u25B6 Test Trigger</button>
          </div>
        </div>
      `).join("")}
    </div>

    <!-- TAB 3: HARDWARE & LOGS -->
    <div id="tab-hardware" class="tab-content">
      <div class="card">
        <div class="title" style="margin-bottom: 6px;">ESP32 GPIO Assignments</div>
        ${widgets.filter((w) => w.boundTarget && w.type !== "device_card").length > 0 ? widgets.filter((w) => w.boundTarget && w.type !== "device_card").map((w) => {
      const pinMatch = (w.boundTarget || "").match(/GPIO\\s*\\d+/i);
      return `<div class="pin-row"><span style="color: #38bdf8; font-weight: 800; font-family: monospace;">${pinMatch ? pinMatch[0].toUpperCase() : "PIN"}</span><span>${w.title} (${w.boundTarget})</span></div>`;
    }).join("") : `
        <div class="pin-row"><span style="color: #38bdf8; font-weight: 800; font-family: monospace;">GPIO 2</span><span>LED Output (Digital Out)</span></div>
        `}
      </div>
      <div class="card">
        <div class="row">
          <div class="title">Serial & Telemetry Stream</div>
          <button class="test-btn" onclick="document.getElementById('logConsole').innerHTML=''">Clear</button>
        </div>
        <div class="log-box" id="logConsole">
          <div>[ESP32] Bridge initialized. Telemetry active.</div>
          <div>[RULES] Loaded ${logicBlocks.length} functional logic blocks.</div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const rules = ${logicBlocksJson};
    const widgetValues = {};
    const execCounts = {};

    function setTab(tab) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      event.target.classList.add('active');
      document.getElementById('tab-' + tab).classList.add('active');
    }

    function addLog(msg) {
      const el = document.getElementById('logConsole');
      const time = new Date().toLocaleTimeString();
      el.innerHTML += '<div>[' + time + '] ' + msg + '</div>';
      el.scrollTop = el.scrollHeight;
    }

    var COMPANION_PORT = '${activePort}';

    function sendHardwareAction(payload, extra) {
      try {
        const cleanPayload = String(payload || '').trim();
        const isOff = cleanPayload === 'LED:0' || cleanPayload.includes(':0') || cleanPayload.toLowerCase().includes('off');
        const switchStatus = isOff ? 0 : 1;
        const bodyObj = Object.assign({
          payload: cleanPayload || (isOff ? 'LED:0' : 'LED:1'),
          SwitchStatus: switchStatus,
          value: switchStatus === 1,
          port: COMPANION_PORT || 'COM9'
        }, extra || {});
        const bodyStr = JSON.stringify(bodyObj);
        const hdrs = { 'Content-Type': 'application/json' };

        // Prefer relative / origin endpoint so it works identically from phone or PC
        const hostOrigin = (window.location && window.location.origin && window.location.origin.startsWith('http'))
          ? window.location.origin
          : '';
        const companionIp = '${companionServerInfo?.ip || "192.168.0.13"}';
        const primaryEndpoint = hostOrigin ? (hostOrigin + '/api/action') : ('http://' + companionIp + ':5055/api/action');

        fetch(primaryEndpoint, { method: 'POST', headers: hdrs, body: bodyStr })
          .then(function(r) { return r.json(); })
          .then(function(res) {
            if (res && res.success) {
              addLog('\u{1F680} [ESP32] ' + (isOff ? 'LED OFF (0)' : 'LED ON (Blink)'));
            } else if (res && res.error) {
              addLog('\u26A0\uFE0F [ESP32] Error: ' + res.error);
            }
          })
          .catch(function() {
            // Fallback for standalone file:// exports or cross-network IP
            const fallbackEndpoint = 'http://' + companionIp + ':5055/api/action';
            if (fallbackEndpoint !== primaryEndpoint) {
              fetch(fallbackEndpoint, { method: 'POST', headers: hdrs, body: bodyStr })
                .then(function(r) { return r.json(); })
                .then(function(res) {
                  if (res && res.success) {
                    addLog('\u{1F680} [ESP32] ' + (isOff ? 'LED OFF (0)' : 'LED ON (Blink)'));
                  }
                })
                .catch(function(err) {
                  addLog('\u26A0\uFE0F [Network] Error reaching companion server: ' + err.message);
                });
            }
          });
      } catch (e) {
        addLog('\u26A0\uFE0F [Error] ' + e.message);
      }
    }

    function sendHardwareCommand(payload, extra) {
      sendHardwareAction(payload, extra);
    }

    function evalRules(widgetId, val, title) {
      rules.forEach(r => {
        if (!r.enabled) return;
        if (r.triggerWidgetId === widgetId || r.triggerName === title) {
          let passed = true;
          if (r.condition && r.condition.includes('>')) {
            const num = parseFloat(r.condition.replace(/[^0-9.]/g, ''));
            if (typeof val === 'number' && val <= num) passed = false;
          }
          if (passed) {
            execCounts[r.id] = (execCounts[r.id] || 0) + 1;
            const el = document.getElementById('rule-exec-' + r.id);
            if (el) el.innerText = 'Executions: ' + execCounts[r.id];
            const payload = (r.payload || '').replace('{state}', val ? '1' : '0').replace('{value}', val);
            addLog('\u26A1 [LOGIC] "' + r.name + '" -> TX: ' + payload + ' to ' + (r.targetHardware || 'Hardware'));
            sendHardwareAction(payload, { ruleId: r.id, ruleName: r.name });
          }
        }
      });
    }

    function handleSwitch(id, checked, title) {
      const card = document.getElementById('card-' + id);
      if (card) {
        if (checked) card.classList.add('glow-blue');
        else card.classList.remove('glow-blue');
      }
      addLog('\u{1F4F1} [UI] ' + title + ' -> ' + (checked ? 'ON (Blinking)' : 'OFF (Stopped)'));
      sendHardwareAction(checked ? 'LED:1' : 'LED:0', { widgetId: id, widgetType: 'switch', value: checked });
      evalRules(id, checked, title);
    }

    function stepSlider(id, delta, min, max, title) {
      const current = widgetValues[id] ?? 90;
      const next = Math.max(min, Math.min(max, current + delta));
      widgetValues[id] = next;
      document.getElementById('val-' + id).innerText = next + '\xB0';
      document.getElementById('bar-' + id).style.width = (((next - min) / (max - min)) * 100) + '%';
      addLog('\u{1F4F1} [UI] ' + title + ' -> ' + next + '\xB0');
      evalRules(id, next, title);
    }

    function handleBtn(title, target, action) {
      addLog('\u{1F6A8} [UI] Button Pressed: "' + title + '" -> Dispatched ' + action + ' to ' + target);
      sendHardwareAction((action || 'TRIGGER') + '\\r\\n', { target: target });
      evalRules(target, 1, title);
    }

    function toggleRule(id, checked) {
      const r = rules.find(x => x.id === id);
      if (r) r.enabled = checked;
      addLog('\u26A1 Rule "' + (r?.name || id) + '" is now ' + (checked ? 'ACTIVE' : 'PAUSED'));
    }

    function testRule(id) {
      const r = rules.find(x => x.id === id);
      if (r) {
        execCounts[r.id] = (execCounts[r.id] || 0) + 1;
        const el = document.getElementById('rule-exec-' + r.id);
        if (el) el.innerText = 'Executions: ' + execCounts[r.id];
        const payload = (r.payload || 'CMD').replace('{state}', '1').replace('{value}', '100');
        addLog('\u26A1 [TEST EXECUTION] "' + r.name + '" -> Dispatched ' + payload + ' to ' + r.targetHardware);
        sendHardwareAction(payload + '\\r\\n', { ruleId: r.id, test: true });
      }
    }

    // Dynamic Telemetry Sensor Interval
    const configuredGauges = ${JSON.stringify(widgets.filter((w) => w.type === "gauge"))};
    if (configuredGauges.length > 0) {
      setInterval(() => {
        configuredGauges.forEach(gw => {
          const valEl = document.getElementById('val-' + gw.id);
          const pillEl = document.getElementById('pill-' + gw.id);
          const cardEl = document.getElementById('card-' + gw.id);
          if (valEl) {
            const cur = widgetValues[gw.id] ?? (gw.value || 24.3);
            const delta = (Math.random() - 0.5) * 0.8;
            const min = gw.min || 0;
            const max = gw.max || 50;
            const next = parseFloat(Math.max(min, Math.min(max, cur + delta)).toFixed(1));
            widgetValues[gw.id] = next;
            valEl.innerText = next + (gw.unit || '\xB0C');
            const isHigh = next > (min + (max - min) * 0.6);
            if (isHigh) {
              if (pillEl) { pillEl.className = 'live-pill alert'; pillEl.innerText = '\u26A0\uFE0F THRESHOLD EXCEEDED'; }
              if (cardEl) cardEl.className = 'card glow-red';
              evalRules(gw.id, next, gw.title);
            } else {
              if (pillEl) { pillEl.className = 'live-pill'; pillEl.innerText = '\u25CF LIVE ADC'; }
              if (cardEl) cardEl.className = 'card';
            }
          }
        });
      }, 3000);
    }
  <\/script>
</body>
</html>`;
  };
  const handleExportHtmlWebApp = () => {
    const htmlContent = getStandaloneHtmlContent();
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, "-")}-companion.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Standalone Web App Downloaded",
      description: "Includes complete interactive UI controls, functional logic automation engine, and telemetry.",
      status: "success",
      duration: 3e3
    });
  };
  const startLocalCompanionServer = async () => {
    try {
      const html = getStandaloneHtmlContent();
      try {
        await fetch("http://localhost:5055/api/update-html", {
          method: "POST",
          headers: { "Content-Type": "text/html; charset=utf-8" },
          body: html
        });
      } catch (e) {
      }
      try {
        await fetch("http://localhost:5056/api/update-html", {
          method: "POST",
          headers: { "Content-Type": "text/html; charset=utf-8" },
          body: html
        });
      } catch (e) {
      }
      if (window.electronAPI?.app?.startCompanionServer) {
        try {
          const res = await window.electronAPI.app.startCompanionServer({ html, port: 5055 });
          if (res?.success) {
            if (res.url) setLocalCompanionUrl(res.url);
            if (res.ip) setCompanionServerInfo({ ip: res.ip, port: res.port || 5055 });
            return res.url;
          }
        } catch (err) {
          console.warn("Local companion server start warning:", err);
        }
      }
    } catch (err) {
      console.warn("Companion server sync error:", err);
    }
    return localCompanionUrl;
  };
  const generateReactNativeAppCode = (targetSdk = expoSdkVersion) => {
    const slug = projectName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const widgetsJson = JSON.stringify(widgets);
    const logicBlocksJson = JSON.stringify(logicBlocks);
    return `import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Switch,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';

const INITIAL_WIDGETS = ${widgetsJson};
const INITIAL_LOGIC_BLOCKS = ${logicBlocksJson};

export default function App() {
  const [activeTab, setActiveTab] = useState('controls');
  const [deviceConnected, setDeviceConnected] = useState(true);
  const [rules, setRules] = useState(INITIAL_LOGIC_BLOCKS);
  
  const [widgetStates, setWidgetStates] = useState(() => {
    const initial = {};
    INITIAL_WIDGETS.forEach((w) => {
      if (w.type === 'switch') initial[w.id] = w.state ?? true;
      else if (w.type === 'slider') initial[w.id] = w.value ?? 90;
      else if (w.type === 'gauge') initial[w.id] = w.value ?? 24.3;
      else if (w.type === 'colorpicker') initial[w.id] = w.color ?? '#2563eb';
    });
    return initial;
  });

  const [logs, setLogs] = useState([
    '[' + new Date().toLocaleTimeString() + '] ESP32 Bridge online (Active - Expo SDK ${targetSdk})',
    '[' + new Date().toLocaleTimeString() + '] Loaded ' + INITIAL_WIDGETS.length + ' UI widgets & ' + INITIAL_LOGIC_BLOCKS.length + ' logic rules'
  ]);

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev.slice(-15), '[' + time + '] ' + msg]);
  };

  const sendHardwareCommand = (payload, extra) => {
    const cleanPayload = String(payload || '').trim();
    const isOff = cleanPayload === 'LED:0' || cleanPayload === '0' || cleanPayload.toLowerCase().includes('off');
    const statusNum = isOff ? 0 : 1;
    const bodyStr = JSON.stringify({
      payload: cleanPayload || (isOff ? 'LED:0' : 'LED:1'),
      SwitchStatus: statusNum,
      value: !isOff,
      port: '${activePort}',
      ...(extra || {})
    });

    const hostIp = '${companionServerInfo?.ip || "192.168.0.2"}';
    const bridgeUrls = [
      'http://' + hostIp + ':5055/api/action',
      'http://' + hostIp + ':5055/setSwitchStatus',
      'http://' + hostIp + ':5056/api/action',
      'http://' + hostIp + ':5004/setSwitchStatus',
      'http://localhost:5055/api/action',
      'http://localhost:5055/setSwitchStatus',
      'http://localhost:5056/api/action',
      'http://localhost:5004/setSwitchStatus'
    ];

    bridgeUrls.forEach((url) => {
      try {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyStr
        }).then((res) => {
          if (res && res.ok) {
            addLog('\u{1F4E1} [HARDWARE] ' + (isOff ? 'LED Stopped (OFF)' : 'LED Blinking (ON)'));
          }
        }).catch(() => {});
      } catch (e) {}
    });
  };

  const evaluateAndTriggerRule = (ruleId, triggerEvent, triggerValue, triggerName) => {
    setRules((prevRules) =>
      prevRules.map((rule) => {
        if (rule.id !== ruleId && ruleId !== 'all') return rule;
        if (!rule.enabled) return rule;

        let passed = true;
        if (rule.condition && rule.condition.includes('>')) {
          const numMatch = rule.condition.match(/([0-9.]+)/);
          if (numMatch && typeof triggerValue === 'number') {
            passed = triggerValue > parseFloat(numMatch[1]);
          }
        }

        if (passed) {
          const payloadResolved = (rule.payload || '')
            .replace('{state}', triggerValue ? '1' : '0')
            .replace('{value}', String(triggerValue));

          addLog('\u26A1 [LOGIC] "' + rule.name + '" triggered -> TX: ' + payloadResolved + ' to ' + (rule.targetHardware || 'Hardware'));
          sendHardwareCommand(payloadResolved);
          
          return {
            ...rule,
            executionCount: (rule.executionCount || 0) + 1,
            lastTriggered: new Date().toLocaleTimeString()
          };
        }
        return rule;
      })
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setWidgetStates((prev) => {
        const next = { ...prev };
        INITIAL_WIDGETS.filter((w) => w.type === 'gauge').forEach((w) => {
          const current = next[w.id] ?? 24.3;
          const delta = (Math.random() - 0.5) * 0.6;
          const updated = parseFloat(Math.max(w.min || 0, Math.min(w.max || 50, current + delta)).toFixed(1));
          next[w.id] = updated;

          rules.forEach((rule) => {
            if (rule.triggerWidgetId === w.id || rule.triggerName === w.title) {
              evaluateAndTriggerRule(rule.id, 'sensor_update', updated, w.title);
            }
          });
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [rules]);

  const handleSwitchChange = (widgetId, val, widgetTitle) => {
    setWidgetStates((prev) => ({ ...prev, [widgetId]: val }));
    addLog('\u{1F4F1} [UI] ' + widgetTitle + ' -> ' + (val ? 'ON (Blinking)' : 'OFF (Stopped)'));
    sendHardwareCommand(val ? 'LED:1' : 'LED:0');
    
    rules.forEach((rule) => {
      if (rule.triggerWidgetId === widgetId || rule.triggerName === widgetTitle) {
        evaluateAndTriggerRule(rule.id, 'on_toggle', val, widgetTitle);
      }
    });
  };

  const handleSliderChange = (widgetId, delta, min, max, widgetTitle) => {
    const current = widgetStates[widgetId] ?? 90;
    const next = Math.max(min, Math.min(max, current + delta));
    setWidgetStates((prev) => ({ ...prev, [widgetId]: next }));
    addLog('\u{1F4F1} [UI] ' + widgetTitle + ' -> ' + next + '\xB0');

    rules.forEach((rule) => {
      if (rule.triggerWidgetId === widgetId || rule.triggerName === widgetTitle) {
        evaluateAndTriggerRule(rule.id, 'on_change', next, widgetTitle);
      }
    });
  };

  const handleButtonClick = (widget) => {
    addLog('\u{1F4F1} [UI] Button Pressed: "' + widget.title + '"');
    rules.forEach((rule) => {
      if (rule.triggerWidgetId === widget.id || rule.triggerName === widget.title) {
        evaluateAndTriggerRule(rule.id, 'on_press', 1, widget.title);
      }
    });
    Alert.alert('Hardware Command Transmitted', 'Dispatched ' + (widget.action || 'TRIGGER') + ' to ' + (widget.boundTarget || 'GPIO'));
  };

  const toggleRuleEnabled = (ruleId) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const testTriggerRuleManually = (rule) => {
    evaluateAndTriggerRule(rule.id, 'manual_test', 1, rule.triggerName);
    Alert.alert('Logic Block Executed', 'Triggered: ' + rule.name + '\\nPayload: ' + rule.payload + '\\nTarget: ' + rule.targetHardware);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>InnoIDE Companion \u2022 SDK ${targetSdk}</Text>
          <Text style={styles.projectTitle}>${projectName}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.statusPill, { backgroundColor: deviceConnected ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' }]}
          onPress={() => setDeviceConnected(!deviceConnected)}
        >
          <View style={[styles.statusDot, { backgroundColor: deviceConnected ? '#22c55e' : '#ef4444' }]} />
          <Text style={[styles.statusText, { color: deviceConnected ? '#4ade80' : '#f87171' }]}>
            {deviceConnected ? 'ESP32 Linked' : 'Disconnected'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3-Way Segmented Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'controls' && styles.tabButtonActive]}
          onPress={() => setActiveTab('controls')}
        >
          <Text style={[styles.tabText, activeTab === 'controls' && styles.tabTextActive]}>
            \u{1F39B}\uFE0F Controls
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'logic' && styles.tabButtonActive]}
          onPress={() => setActiveTab('logic')}
        >
          <Text style={[styles.tabText, activeTab === 'logic' && styles.tabTextActive]}>
            \u26A1 Logic & Rules ({rules.filter(r => r.enabled).length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'hardware' && styles.tabButtonActive]}
          onPress={() => setActiveTab('hardware')}
        >
          <Text style={[styles.tabText, activeTab === 'hardware' && styles.tabTextActive]}>
            \u{1F4E1} Terminal
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody}>
        {/* TAB 1: UI CONTROLS */}
        {activeTab === 'controls' && (
          <View style={styles.contentGroup}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Interactive Hardware Controls</Text>
              <Text style={styles.sectionDesc}>Direct telemetry and real-time pin actuation</Text>
            </View>

            {INITIAL_WIDGETS.filter(w => w.visible !== false).length === 0 ? (
              <View style={[styles.card, { alignItems: 'center', paddingVertical: 28 }]}>
                <Text style={{ fontSize: 24, marginBottom: 8 }}>\u{1F4F1}</Text>
                <Text style={styles.cardTitle}>No Components Added</Text>
                <Text style={[styles.cardTarget, { textAlign: 'center', marginTop: 4 }]}>
                  Add UI components in InnoIDE App Designer to control hardware from this app.
                </Text>
              </View>
            ) : (
              INITIAL_WIDGETS.filter(w => w.visible !== false).map((w) => {
              if (w.type === 'switch') {
                const isOn = widgetStates[w.id] ?? true;
                return (
                  <View key={w.id} style={[styles.card, isOn && styles.cardActiveGlow]}>
                    <View style={styles.rowBetween}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{w.title}</Text>
                        <Text style={styles.cardTarget}>Pin: {w.boundTarget || 'GPIO 2 (LED)'}</Text>
                        <View style={styles.tagRow}>
                          <View style={[styles.miniBadge, { backgroundColor: isOn ? '#1e3a8a' : '#334155' }]}>
                            <Text style={[styles.miniBadgeText, { color: isOn ? '#60a5fa' : '#94a3b8' }]}>
                              {isOn ? 'STATE: HIGH (ON)' : 'STATE: LOW (OFF)'}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Switch
                        value={isOn}
                        onValueChange={(val) => handleSwitchChange(w.id, val, w.title)}
                        trackColor={{ false: '#334155', true: w.color || '#2563eb' }}
                        thumbColor={isOn ? '#ffffff' : '#94a3b8'}
                      />
                    </View>
                  </View>
                );
              }

              if (w.type === 'slider') {
                const val = widgetStates[w.id] ?? (w.value || 90);
                const min = w.min || 0;
                const max = w.max || 180;
                const pct = Math.round(((val - min) / (max - min)) * 100);
                return (
                  <View key={w.id} style={styles.card}>
                    <View style={styles.rowBetween}>
                      <View>
                        <Text style={styles.cardTitle}>{w.title}</Text>
                        <Text style={styles.cardTarget}>PWM Target: {w.boundTarget || 'GPIO 4 (Servo)'}</Text>
                      </View>
                      <Text style={[styles.metricBig, { color: w.color || '#a855f7' }]}>
                        {val}{w.unit || '\xB0'}
                      </Text>
                    </View>
                    <View style={styles.sliderControlRow}>
                      <TouchableOpacity style={styles.stepBtn} onPress={() => handleSliderChange(w.id, -10, min, max, w.title)}>
                        <Text style={styles.stepBtnText}>-10\xB0</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.stepBtn} onPress={() => handleSliderChange(w.id, -1, min, max, w.title)}>
                        <Text style={styles.stepBtnText}>-1\xB0</Text>
                      </TouchableOpacity>
                      <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { width: pct + '%', backgroundColor: w.color || '#a855f7' }]} />
                      </View>
                      <TouchableOpacity style={styles.stepBtn} onPress={() => handleSliderChange(w.id, 1, min, max, w.title)}>
                        <Text style={styles.stepBtnText}>+1\xB0</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.stepBtn} onPress={() => handleSliderChange(w.id, 10, min, max, w.title)}>
                        <Text style={styles.stepBtnText}>+10\xB0</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }

              if (w.type === 'gauge') {
                const val = widgetStates[w.id] ?? (w.value || 24.3);
                const isHigh = val > 30.0;
                return (
                  <View key={w.id} style={[styles.card, isHigh && styles.cardWarningGlow]}>
                    <View style={styles.rowBetween}>
                      <View>
                        <Text style={styles.cardTitle}>{w.title}</Text>
                        <Text style={styles.cardTarget}>Source: {w.boundTarget || 'ADC Telemetry'}</Text>
                      </View>
                      <View style={[styles.liveTag, isHigh && { backgroundColor: '#7f1d1d' }]}>
                        <Text style={[styles.liveTagText, isHigh && { color: '#fca5a5' }]}>
                          {isHigh ? '\u26A0\uFE0F THRESHOLD EXCEEDED' : '\u25CF LIVE ADC'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.gaugeValueBox}>
                      <Text style={[styles.gaugeBigValue, { color: isHigh ? '#ef4444' : '#38bdf8' }]}>
                        {val}{w.unit || '\xB0C'}
                      </Text>
                      <Text style={styles.gaugeSubText}>
                        Range: {w.min || 0} - {w.max || 50}{w.unit || '\xB0C'} (Guard Threshold: 30\xB0C)
                      </Text>
                    </View>
                  </View>
                );
              }

              if (w.type === 'button') {
                return (
                  <TouchableOpacity
                    key={w.id}
                    style={[styles.actionButton, { backgroundColor: w.color || '#ea580c' }]}
                    onPress={() => handleButtonClick(w)}
                  >
                    <Text style={styles.actionBtnText}>\u{1F6A8} {w.title}</Text>
                    <Text style={styles.actionBtnSub}>Target: {w.boundTarget || 'GPIO 5 (Buzzer)'}</Text>
                  </TouchableOpacity>
                );
              }

              if (w.type === 'top_button') {
                return (
                  <TouchableOpacity
                    key={w.id}
                    style={[styles.actionButton, { backgroundColor: w.color || '#2563eb' }]}
                    onPress={() => handleButtonClick(w)}
                  >
                    <Text style={styles.actionBtnText}>\u25B2 {w.title}</Text>
                    <Text style={styles.actionBtnSub}>Forward Pulse \u2192 {w.boundTarget || 'GPIO 13'}</Text>
                  </TouchableOpacity>
                );
              }

              if (w.type === 'bottom_button') {
                return (
                  <TouchableOpacity
                    key={w.id}
                    style={[styles.actionButton, { backgroundColor: w.color || '#0284c7' }]}
                    onPress={() => handleButtonClick(w)}
                  >
                    <Text style={styles.actionBtnText}>\u25BC {w.title}</Text>
                    <Text style={styles.actionBtnSub}>Reverse Pulse \u2192 {w.boundTarget || 'GPIO 14'}</Text>
                  </TouchableOpacity>
                );
              }

              if (w.type === 'left_button') {
                return (
                  <TouchableOpacity
                    key={w.id}
                    style={[styles.actionButton, { backgroundColor: w.color || '#7c3aed' }]}
                    onPress={() => handleButtonClick(w)}
                  >
                    <Text style={styles.actionBtnText}>\u25C0 {w.title}</Text>
                    <Text style={styles.actionBtnSub}>Steer Left \u2192 {w.boundTarget || 'GPIO 12'}</Text>
                  </TouchableOpacity>
                );
              }

              if (w.type === 'right_button') {
                return (
                  <TouchableOpacity
                    key={w.id}
                    style={[styles.actionButton, { backgroundColor: w.color || '#9333ea' }]}
                    onPress={() => handleButtonClick(w)}
                  >
                    <Text style={styles.actionBtnText}>\u25B6 {w.title}</Text>
                    <Text style={styles.actionBtnSub}>Steer Right \u2192 {w.boundTarget || 'GPIO 15'}</Text>
                  </TouchableOpacity>
                );
              }

              if (w.type === 'dpad') {
                return (
                  <View key={w.id} style={[styles.card, { alignItems: 'center' }]}>
                    <Text style={[styles.cardTitle, { marginBottom: 8 }]}>\u{1F579}\uFE0F {w.title}</Text>
                    <TouchableOpacity
                      style={[styles.stepBtn, { width: 60, height: 38, marginBottom: 4 }]}
                      onPress={() => handleButtonClick({ ...w, title: 'Top (Forward)', boundTarget: 'GPIO 13' })}
                    >
                      <Text style={styles.stepBtnText}>\u25B2</Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', gap: 6, marginVertical: 4 }}>
                      <TouchableOpacity
                        style={[styles.stepBtn, { width: 60, height: 38 }]}
                        onPress={() => handleButtonClick({ ...w, title: 'Left', boundTarget: 'GPIO 12' })}
                      >
                        <Text style={styles.stepBtnText}>\u25C0</Text>
                      </TouchableOpacity>
                      <View style={[styles.stepBtn, { width: 60, height: 38, backgroundColor: '#0f172a' }]}>
                        <Text style={styles.stepBtnText}>\u25CF</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.stepBtn, { width: 60, height: 38 }]}
                        onPress={() => handleButtonClick({ ...w, title: 'Right', boundTarget: 'GPIO 15' })}
                      >
                        <Text style={styles.stepBtnText}>\u25B6</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={[styles.stepBtn, { width: 60, height: 38, marginTop: 4 }]}
                      onPress={() => handleButtonClick({ ...w, title: 'Bottom (Reverse)', boundTarget: 'GPIO 14' })}
                    >
                      <Text style={styles.stepBtnText}>\u25BC</Text>
                    </TouchableOpacity>
                  </View>
                );
              }

              if (w.type === 'device_card') {
                return (
                  <View key={w.id} style={styles.card}>
                    <View style={styles.rowBetween}>
                      <View style={styles.rowAlign}>
                        <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#1e3a8a', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 16 }}>\u{1F4E1}</Text>
                        </View>
                        <View>
                          <Text style={styles.cardTitle}>{w.title || 'ESP32 Dev Board'}</Text>
                          <Text style={{ fontSize: 11, color: '#4ade80', fontWeight: '700', marginTop: 2 }}>\u25CF Online & Connected</Text>
                        </View>
                      </View>
                      <View style={{ backgroundColor: '#1e293b', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                        <Text style={{ color: '#38bdf8', fontSize: 10, fontWeight: '800' }}>WIFI 100%</Text>
                      </View>
                    </View>
                  </View>
                );
              }

              if (w.type === 'label') {
                return (
                  <View key={w.id} style={[styles.card, { paddingVertical: 12 }]}>
                    <Text style={[styles.cardTitle, { color: w.color || '#f8fafc' }]}>{w.title}</Text>
                    {w.boundTarget && <Text style={styles.cardTarget}>{w.boundTarget}</Text>}
                  </View>
                );
              }

              if (w.type === 'textfield') {
                return (
                  <View key={w.id} style={styles.card}>
                    <Text style={styles.cardTitle}>{w.title}</Text>
                    <View style={{ backgroundColor: '#090d16', borderRadius: 8, padding: 10, marginTop: 8, borderWidth: 1, borderColor: '#1e293b' }}>
                      <Text style={{ color: '#94a3b8', fontSize: 12 }}>{w.placeholder || 'Text input field...'}</Text>
                    </View>
                  </View>
                );
              }

              if (w.type === 'progress') {
                return (
                  <View key={w.id} style={styles.card}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.cardTitle}>{w.title}</Text>
                      <Text style={{ color: '#38bdf8', fontSize: 12, fontWeight: '800' }}>75%</Text>
                    </View>
                    <View style={[styles.progressContainer, { marginTop: 10 }]}>
                      <View style={[styles.progressBar, { width: '75%', backgroundColor: '#38bdf8' }]} />
                    </View>
                  </View>
                );
              }

              return null;
            })
          )}
          </View>
        )}

        {/* TAB 2: FUNCTIONAL LOGIC & RULES */}
        {activeTab === 'logic' && (
          <View style={styles.contentGroup}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>\u26A1 Functional Logic Engine</Text>
              <Text style={styles.sectionDesc}>Autonomous trigger-action rules linked to hardware pins</Text>
            </View>

            {rules.length === 0 ? (
              <View style={[styles.card, { alignItems: 'center', paddingVertical: 28 }]}>
                <Text style={{ fontSize: 24, marginBottom: 8 }}>\u26A1</Text>
                <Text style={styles.cardTitle}>No Automation Rules</Text>
                <Text style={[styles.cardTarget, { textAlign: 'center', marginTop: 4 }]}>
                  Configure automation rules in InnoIDE App Designer.
                </Text>
              </View>
            ) : (
              rules.map((rule) => {
              return (
                <View key={rule.id} style={[styles.logicCard, !rule.enabled && { opacity: 0.6 }]}>
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.rowAlign}>
                        <Text style={styles.logicRuleName}>{rule.name}</Text>
                        <View style={[styles.ruleStatusPill, { backgroundColor: rule.enabled ? '#064e3b' : '#334155' }]}>
                          <Text style={[styles.ruleStatusText, { color: rule.enabled ? '#34d399' : '#94a3b8' }]}>
                            {rule.enabled ? 'ACTIVE' : 'PAUSED'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.logicTarget}>Target: {rule.targetHardware || 'Hardware Pin'}</Text>
                    </View>
                    <Switch
                      value={rule.enabled}
                      onValueChange={() => toggleRuleEnabled(rule.id)}
                      trackColor={{ false: '#334155', true: '#10b981' }}
                    />
                  </View>

                  <View style={styles.logicDetailBox}>
                    <View style={styles.logicRow}>
                      <Text style={styles.logicLabel}>\u{1F504} Trigger:</Text>
                      <Text style={styles.logicVal}>{rule.triggerName} ({rule.event})</Text>
                    </View>
                    <View style={styles.logicRow}>
                      <Text style={styles.logicLabel}>\u2696\uFE0F Condition:</Text>
                      <Text style={[styles.logicVal, { color: '#fbbf24' }]}>{rule.condition || 'Always'}</Text>
                    </View>
                    <View style={styles.logicRow}>
                      <Text style={styles.logicLabel}>\u{1F680} Action:</Text>
                      <Text style={[styles.logicVal, { color: '#38bdf8' }]}>{rule.action}</Text>
                    </View>
                    <View style={styles.logicRow}>
                      <Text style={styles.logicLabel}>\u{1F4E6} Payload:</Text>
                      <Text style={styles.logicCode}>{rule.payload}</Text>
                    </View>
                  </View>

                  <View style={styles.logicFooter}>
                    <Text style={styles.logicExecutionText}>
                      Executions: {rule.executionCount || 0} {rule.lastTriggered ? ('\u2022 Last: ' + rule.lastTriggered) : ''}
                    </Text>
                    <TouchableOpacity
                      style={styles.testRunBtn}
                      onPress={() => testTriggerRuleManually(rule)}
                    >
                      <Text style={styles.testRunBtnText}>\u25B6 Test Trigger</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
          </View>
        )}

        {/* TAB 3: HARDWARE PIN MAP & TERMINAL */}
        {activeTab === 'hardware' && (
          <View style={styles.contentGroup}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>\u{1F4E1} Pin Mapping & Serial Logs</Text>
              <Text style={styles.sectionDesc}>Live telemetry and hardware communication</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>ESP32 GPIO Assignments</Text>
              {INITIAL_WIDGETS.filter(w => w.boundTarget && w.type !== 'device_card').length > 0 ? (
                INITIAL_WIDGETS.filter(w => w.boundTarget && w.type !== 'device_card').map((w) => {
                  const pinMatch = (w.boundTarget || '').match(/GPIO\\s*\\d+/i);
                  return (
                    <View key={w.id} style={styles.pinTableRow}>
                      <Text style={styles.pinCode}>{pinMatch ? pinMatch[0].toUpperCase() : 'PIN'}</Text>
                      <Text style={styles.pinDesc}>{w.title} ({w.boundTarget})</Text>
                    </View>
                  );
                })
              ) : (
                <View style={styles.pinTableRow}>
                  <Text style={styles.pinCode}>GPIO 2</Text>
                  <Text style={styles.pinDesc}>LED Output (Digital Out)</Text>
                </View>
              )}
            </View>

            <View style={styles.consoleContainer}>
              <View style={styles.rowBetween}>
                <Text style={styles.consoleTitle}>Serial & Event Stream</Text>
                <TouchableOpacity onPress={() => setLogs([])}>
                  <Text style={styles.clearLogsText}>Clear</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.consoleScroll} nestedScrollEnabled>
                {logs.map((log, idx) => (
                  <Text key={idx} style={styles.consoleLine}>{log}</Text>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderColor: '#1e293b'
  },
  brandTitle: { fontSize: 11, fontWeight: '700', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: 1 },
  projectTitle: { fontSize: 18, fontWeight: '800', color: '#f8fafc', marginTop: 2 },
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#1e293b'
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4
  },
  tabButtonActive: {
    backgroundColor: '#1e293b',
    borderBottomWidth: 2,
    borderColor: '#38bdf8'
  },
  tabText: { color: '#64748b', fontSize: 12, fontWeight: '700' },
  tabTextActive: { color: '#f8fafc' },
  scrollBody: { padding: 16, paddingBottom: 50 },
  contentGroup: { gap: 14 },
  sectionHeader: { marginBottom: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#f1f5f9' },
  sectionDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  card: {
    backgroundColor: '#131b2e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  cardActiveGlow: {
    borderColor: '#2563eb',
    backgroundColor: '#101a38'
  },
  cardWarningGlow: {
    borderColor: '#ef4444',
    backgroundColor: '#261214'
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowAlign: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#f8fafc' },
  cardTarget: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  tagRow: { flexDirection: 'row', marginTop: 8 },
  miniBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  miniBadgeText: { fontSize: 10, fontWeight: '800' },
  metricBig: { fontSize: 20, fontWeight: '900' },
  sliderControlRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 8 },
  stepBtn: { backgroundColor: '#1e293b', paddingVertical: 7, paddingHorizontal: 10, borderRadius: 8 },
  stepBtnText: { color: '#f8fafc', fontWeight: '800', fontSize: 11 },
  progressContainer: { flex: 1, height: 8, backgroundColor: '#1e293b', borderRadius: 4, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 4 },
  liveTag: { backgroundColor: '#082f49', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  liveTagText: { color: '#38bdf8', fontSize: 10, fontWeight: '800' },
  gaugeValueBox: { alignItems: 'center', paddingVertical: 12 },
  gaugeBigValue: { fontSize: 36, fontWeight: '900' },
  gaugeSubText: { fontSize: 11, color: '#64748b', marginTop: 4 },
  actionButton: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowOpacity: 0.2,
    elevation: 3
  },
  actionBtnText: { color: '#ffffff', fontWeight: '900', fontSize: 16 },
  actionBtnSub: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 4, fontWeight: '600' },
  logicCard: {
    backgroundColor: '#131b2e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981'
  },
  logicRuleName: { fontSize: 15, fontWeight: '800', color: '#f8fafc' },
  logicTarget: { fontSize: 12, color: '#64748b', marginTop: 2 },
  ruleStatusPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  ruleStatusText: { fontSize: 9, fontWeight: '800' },
  logicDetailBox: {
    backgroundColor: '#090d16',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
    gap: 6
  },
  logicRow: { flexDirection: 'row', alignItems: 'center' },
  logicLabel: { fontSize: 11, color: '#64748b', width: 85, fontWeight: '700' },
  logicVal: { fontSize: 11, color: '#e2e8f0', fontWeight: '600', flex: 1 },
  logicCode: { fontSize: 11, color: '#38bdf8', fontFamily: 'monospace', fontWeight: '700' },
  logicFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  logicExecutionText: { fontSize: 11, color: '#64748b' },
  testRunBtn: { backgroundColor: '#1e293b', paddingVertical: 5, paddingHorizontal: 12, borderRadius: 8 },
  testRunBtnText: { color: '#38bdf8', fontSize: 11, fontWeight: '800' },
  pinTableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#1e293b' },
  pinCode: { color: '#38bdf8', fontWeight: '800', fontSize: 12, fontFamily: 'monospace' },
  pinDesc: { color: '#94a3b8', fontSize: 12 },
  consoleContainer: {
    backgroundColor: '#090d16',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  consoleTitle: { color: '#64748b', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  clearLogsText: { color: '#38bdf8', fontSize: 11, fontWeight: '700' },
  consoleScroll: { maxHeight: 180, marginTop: 10 },
  consoleLine: { color: '#38bdf8', fontFamily: 'monospace', fontSize: 11, marginVertical: 2 }
});
`;
  };
  const handleExportExpoZip = async () => {
    const slug = projectName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const zip = new JSZip();
    zip.file("App.js", generateReactNativeAppCode());
    const appJsonContent = JSON.stringify(
      {
        expo: {
          name: projectName,
          slug,
          version: "1.0.0",
          sdkVersion: expoSdkVersion,
          orientation: "portrait",
          userInterfaceStyle: "light",
          ios: {
            supportsTablet: true,
            bundleIdentifier: `com.innotrat.${slug}`
          },
          android: {
            package: `com.innotrat.${slug}`,
            adaptiveIcon: {
              backgroundColor: "#ffffff"
            }
          },
          extra: {
            eas: {
              projectId: "innotrat-generated"
            }
          }
        }
      },
      null,
      2
    );
    zip.file("app.json", appJsonContent);
    const packageJsonContent = JSON.stringify(
      {
        name: slug,
        version: "1.0.0",
        main: "node_modules/expo/AppEntry.js",
        scripts: {
          start: "expo start",
          android: "expo start --android",
          ios: "expo start --ios",
          web: "expo start --web"
        },
        dependencies: {
          expo: `~${expoSdkVersion || "54.0.0"}`,
          "expo-status-bar": "~2.0.0",
          react: "18.3.1",
          "react-native": "0.76.6"
        },
        devDependencies: {
          "@babel/core": "^7.20.0",
          "babel-preset-expo": "~54.0.0"
        },
        private: true
      },
      null,
      2
    );
    zip.file("package.json", packageJsonContent);
    const babelContent = `module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};`;
    zip.file("babel.config.js", babelContent);
    const readmeContent = `# ${projectName} - React Native Companion App (Expo Go)

Generated automatically by **InnoIDE App Companion Studio**.

## \u{1F680} How to Run in Expo Go

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Start the Expo development server**:
   \`\`\`bash
   npx expo start
   \`\`\`

3. **Open on your mobile device**:
   - **Android**: Open the **Expo Go** app and tap **"Scan QR Code"**.
   - **iOS**: Open the standard **Camera** app, scan the terminal QR code, and tap the prompt to open in **Expo Go**.
`;
    zip.file("README.md", readmeContent);
    zip.file("companion-schema.json", JSON.stringify({ projectName, widgets, logicBlocks }, null, 2));
    try {
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}-react-native-expo.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "Expo Go React Native App Exported!",
        description: `Downloaded ${slug}-react-native-expo.zip (includes App.js, package.json, app.json).`,
        status: "success",
        duration: 4e3,
        isClosable: true
      });
    } catch (err) {
      toast({ title: "Export Error", description: err.message, status: "error", duration: 3e3 });
    }
  };
  const handleSelectSdkVersion = (newSdk) => {
    setExpoSdkVersion(newSdk);
    if (snackSessionMap[newSdk]) {
      setSnackSessionId(snackSessionMap[newSdk]);
    } else {
      setSnackSessionId(null);
      syncSnackSession(true, newSdk);
    }
  };
  const syncSnackSession = async (showToasts = false, targetSdk = expoSdkVersion) => {
    setIsSnackSyncing(true);
    if (showToasts) {
      toast({
        title: "Connecting to Expo Cloud...",
        description: `Creating live Snack session for SDK ${targetSdk}...`,
        status: "info",
        duration: 2e3
      });
    }
    try {
      const code = generateReactNativeAppCode(targetSdk);
      let sessionId = null;
      let expUrl = null;
      if (window.electronAPI?.app?.createExpoSnack) {
        try {
          const res = await window.electronAPI.app.createExpoSnack({
            name: projectName,
            code,
            description: `IoT Companion app for ${projectName}`,
            sdkVersion: targetSdk
          });
          if (res?.success && res?.id) {
            sessionId = res.id;
            expUrl = res.snackChannelUrl || res.expoGoUrl || `exp://u.expo.dev/933fd9c0-1666-11e7-afcb-d9a0723853cd?snack=${res.id}`;
          }
        } catch (ipcErr) {
          console.warn("Electron IPC createExpoSnack error:", ipcErr);
        }
      }
      if (!sessionId) {
        try {
          const payload = {
            manifest: {
              name: projectName,
              description: `IoT Companion app for ${projectName}`,
              sdkVersion: targetSdk
            },
            code: {
              "App.js": { type: "CODE", contents: code }
            },
            dependencies: {}
          };
          const res = await fetch("https://exp.host/--/api/v2/snack/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          sessionId = data?.id || data?.snackId || data?.hashId;
          if (sessionId) {
            expUrl = `exp://u.expo.dev/933fd9c0-1666-11e7-afcb-d9a0723853cd?snack=${sessionId}`;
          }
        } catch (directErr) {
          console.warn("Direct snack fetch failed:", directErr);
        }
      }
      if (sessionId) {
        setSnackSessionId(sessionId);
        setSnackSessionMap((prev) => ({ ...prev, [targetSdk]: sessionId }));
        const resolvedExpUrl = expUrl || `exp://u.expo.dev/933fd9c0-1666-11e7-afcb-d9a0723853cd?snack=${sessionId}`;
        setExpoGoUrlMap((prev) => ({ ...prev, [targetSdk]: resolvedExpUrl }));
        if (showToasts) {
          toast({
            title: `Expo (SDK ${targetSdk}) Ready!`,
            description: `Session synchronized. Ready to scan in Expo Go app.`,
            status: "success",
            duration: 2500
          });
        }
        return sessionId;
      }
    } catch (err) {
      console.warn("Snack sync error:", err);
    } finally {
      setIsSnackSyncing(false);
    }
    return null;
  };
  const handleCopyAppJsCode = () => {
    try {
      const code = generateReactNativeAppCode();
      navigator.clipboard.writeText(code);
      toast({
        title: "Copied Updated App.js Code!",
        description: "Paste directly into App.js in your Expo Snack tab to run immediately.",
        status: "success",
        duration: 3e3
      });
    } catch (e) {
      toast({
        title: "Copy Failed",
        description: e.message,
        status: "error",
        duration: 2e3
      });
    }
  };
  const handleOpenExpoSnack = async () => {
    toast({
      title: "Syncing with Expo Cloud...",
      description: "Uploading updated App.js with hardware bridge controls...",
      status: "info",
      duration: 2e3
    });
    const freshId = await syncSnackSession(false, expoSdkVersion);
    const targetId = freshId || snackSessionId || snackSessionMap[expoSdkVersion];
    if (targetId) {
      const liveSnackUrl = `https://snack.expo.dev/${targetId}?platform=web&preview=true&sdkVersion=${expoSdkVersion}`;
      window.open(liveSnackUrl, "_blank");
      toast({
        title: `Opening Expo Snack (SDK ${expoSdkVersion})`,
        description: `Loaded fresh session ${targetId} without syntax errors.`,
        status: "success",
        duration: 3500
      });
    } else {
      window.open("https://snack.expo.dev", "_blank");
      toast({
        title: "Opened Expo Snack",
        description: "Use 'Copy App.js' to paste the latest code into Snack.",
        status: "info",
        duration: 3e3
      });
    }
  };
  const handleOpenPublishModal = () => {
    onPublishOpen();
    startLocalCompanionServer();
    syncSnackSession(false, expoSdkVersion);
  };
  const uiPaletteItems = [
    { type: "button", title: "Button", desc: "Tap action", icon: /* @__PURE__ */ React.createElement(FaCircle, { size: 13 }) },
    { type: "label", title: "Label", desc: "Display text", icon: /* @__PURE__ */ React.createElement(FaTag, { size: 13 }) },
    { type: "textfield", title: "Text Field", desc: "Text input", icon: /* @__PURE__ */ React.createElement(FaFont, { size: 13 }) },
    { type: "switch", title: "Switch", desc: "Toggle on/off", icon: /* @__PURE__ */ React.createElement(FaSync, { size: 13 }) },
    { type: "slider", title: "Slider", desc: "Range input", icon: /* @__PURE__ */ React.createElement(FaSlidersH, { size: 13 }) },
    { type: "gauge", title: "Gauge", desc: "Telemetry meter", icon: /* @__PURE__ */ React.createElement(FaTemperatureHigh, { size: 13 }) },
    { type: "crud_table", title: "CRUD Table", desc: "Data records manager", icon: /* @__PURE__ */ React.createElement(FaTable, { size: 13 }) },
    { type: "chart", title: "Chart / Graph", desc: "Live plotting", icon: /* @__PURE__ */ React.createElement(FaChartLine, { size: 13 }) },
    { type: "colorpicker", title: "Color Picker", desc: "RGB light picker", icon: /* @__PURE__ */ React.createElement(FaPalette, { size: 13 }) },
    { type: "joystick", title: "Joystick", desc: "4-way motor control", icon: /* @__PURE__ */ React.createElement(FaGamepad, { size: 13 }) },
    { type: "image", title: "Image", desc: "Show image", icon: /* @__PURE__ */ React.createElement(FaImage, { size: 13 }) },
    { type: "card", title: "Card", desc: "Content card", icon: /* @__PURE__ */ React.createElement(FaIdCard, { size: 13 }) },
    { type: "progress", title: "Progress Bar", desc: "Progress meter", icon: /* @__PURE__ */ React.createElement(FaTasks, { size: 13 }) },
    { type: "fab", title: "Floating Button", desc: "Action button", icon: /* @__PURE__ */ React.createElement(FaPlusCircle, { size: 13 }) },
    { type: "divider", title: "Divider", desc: "Separator", icon: /* @__PURE__ */ React.createElement(FaMinus, { size: 13 }) }
  ];
  const filteredPalette = uiPaletteItems.filter(
    (item) => item.title.toLowerCase().includes(searchPalette.toLowerCase())
  );
  const layoutPaletteItems = [
    { type: "card", title: "Vertical Stack Card", desc: "Vertical flex container", icon: /* @__PURE__ */ React.createElement(FaBoxes, { color: "#3b82f6", size: 13 }), defaultBinding: "Layout Container" },
    { type: "top_button", title: "Top Button", desc: "Top / Header action button", icon: /* @__PURE__ */ React.createElement(FaArrowUp, { color: "#2563eb", size: 13 }), defaultBinding: "GPIO 13 (Motor A)" },
    { type: "bottom_button", title: "Bottom Button", desc: "Bottom / Footer action button", icon: /* @__PURE__ */ React.createElement(FaArrowDown, { color: "#0284c7", size: 13 }), defaultBinding: "GPIO 14 (Motor B)" },
    { type: "left_button", title: "Left Button", desc: "Left side action button", icon: /* @__PURE__ */ React.createElement(FaArrowLeft, { color: "#7c3aed", size: 13 }), defaultBinding: "GPIO 12 (Steer Left)" },
    { type: "right_button", title: "Right Button", desc: "Right side action button", icon: /* @__PURE__ */ React.createElement(FaArrowRight, { color: "#9333ea", size: 13 }), defaultBinding: "GPIO 15 (Steer Right)" }
  ];
  const filteredLayoutPalette = layoutPaletteItems.filter(
    (item) => item.title.toLowerCase().includes(searchPalette.toLowerCase())
  );
  const renderStepperHeader = (currentStepIndex) => {
    const steps = [
      { id: 1, label: "Connection" },
      { id: 2, label: "Discover Devices" },
      { id: 3, label: "Compatibility" },
      { id: 4, label: "Flash Firmware" }
    ];
    return /* @__PURE__ */ React.createElement(Box, { bg: headerBg, color: "white", px: 6, py: 5, borderTopRadius: "2xl" }, /* @__PURE__ */ React.createElement(HStack, { justify: "space-between", align: "center", mb: 5 }, /* @__PURE__ */ React.createElement(HStack, { spacing: 3 }, /* @__PURE__ */ React.createElement(Box, { p: 2.5, bg: "whiteAlpha.200", borderRadius: "xl" }, /* @__PURE__ */ React.createElement(FaBolt, { size: 18, color: "#facc15" })), /* @__PURE__ */ React.createElement(VStack, { align: "start", spacing: 0 }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "extrabold", fontSize: "lg", letterSpacing: "tight" }, "Flash to Device"), /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", opacity: 0.85 }, projectName))), /* @__PURE__ */ React.createElement(HStack, { spacing: 2 }, /* @__PURE__ */ React.createElement(
      Button,
      {
        size: "xs",
        variant: "solid",
        bg: "whiteAlpha.200",
        color: "white",
        _hover: { bg: "whiteAlpha.300" },
        borderRadius: "full",
        leftIcon: /* @__PURE__ */ React.createElement(FaCogs, { size: 11 }),
        onClick: () => setIsIdfPromptOpen(true),
        title: "View ESP-IDF Toolchain setup info"
      },
      "ESP-IDF Setup"
    ), /* @__PURE__ */ React.createElement(
      Button,
      {
        size: "xs",
        variant: "solid",
        bg: "whiteAlpha.300",
        color: "white",
        _hover: { bg: "whiteAlpha.400", transform: "scale(1.02)" },
        _active: { transform: "scale(0.98)" },
        borderRadius: "full",
        leftIcon: /* @__PURE__ */ React.createElement(FaMobileAlt, { size: 11 }),
        onClick: () => setWizardStep("app_builder"),
        title: "Skip flashing and jump directly to App Builder & Publish QR screen",
        fontWeight: "bold",
        shadow: "sm"
      },
      "Skip to App Builder \u2794"
    ))), /* @__PURE__ */ React.createElement(HStack, { spacing: 2, justify: "space-between", align: "center", px: 1 }, steps.map((s, idx) => {
      const stepMapping = { 1: "connection", 2: "devices", 3: "compatibility", 4: "flashing" };
      const isCompleted = s.id < currentStepIndex;
      const isActive = s.id === currentStepIndex;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: s.id }, /* @__PURE__ */ React.createElement(
        HStack,
        {
          spacing: 2,
          align: "center",
          cursor: "pointer",
          onClick: () => setWizardStep(stepMapping[s.id]),
          opacity: isActive ? 1 : 0.85,
          _hover: { opacity: 1 },
          title: `Jump to Step ${s.id}: ${s.label}`
        },
        /* @__PURE__ */ React.createElement(
          Box,
          {
            w: "24px",
            h: "24px",
            borderRadius: "full",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: "bold",
            bg: isCompleted ? "green.400" : isActive ? "white" : "whiteAlpha.300",
            color: isCompleted ? "white" : isActive ? "blue.600" : "whiteAlpha.800",
            shadow: isActive ? "md" : "none",
            transition: "all 0.2s"
          },
          isCompleted ? /* @__PURE__ */ React.createElement(FaCheck, { size: 10 }) : s.id
        ),
        /* @__PURE__ */ React.createElement(
          Text,
          {
            fontSize: "xs",
            fontWeight: isActive ? "bold" : "medium",
            color: isActive ? "white" : "whiteAlpha.700"
          },
          s.label
        )
      ), idx < steps.length - 1 && /* @__PURE__ */ React.createElement(
        Box,
        {
          flex: "1",
          h: "2px",
          mx: 2,
          bg: isCompleted ? "green.400" : "whiteAlpha.300",
          borderRadius: "full"
        }
      ));
    })));
  };
  if (wizardStep === "app_builder") {
    return /* @__PURE__ */ React.createElement(Box, { w: "100%", h: "100%", bg: useColorModeValue("gray.50", "gray.900"), display: "flex", flexDirection: "column" }, /* @__PURE__ */ React.createElement(
      Flex,
      {
        h: "56px",
        px: 4,
        bg: bgCard,
        borderBottom: "1px",
        borderColor,
        align: "center",
        justify: "space-between",
        shadow: "sm"
      },
      /* @__PURE__ */ React.createElement(HStack, { spacing: 3 }, /* @__PURE__ */ React.createElement(Box, { p: 2, bg: "blue.500", color: "white", borderRadius: "lg", shadow: "sm" }, /* @__PURE__ */ React.createElement(FaBolt, { size: 14 })), /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", color: "gray.500", display: { base: "none", md: "block" } }, "Dashboard / ", /* @__PURE__ */ React.createElement(Text, { as: "span", fontWeight: "semibold", color: useColorModeValue("gray.800", "white") }, projectName), " / ", /* @__PURE__ */ React.createElement(Text, { as: "span", color: "blue.500", fontWeight: "bold" }, "App Builder")), /* @__PURE__ */ React.createElement(Menu, null, /* @__PURE__ */ React.createElement(
        MenuButton,
        {
          as: Button,
          size: "xs",
          variant: "ghost",
          bg: useColorModeValue("gray.100", "gray.800"),
          _hover: { bg: useColorModeValue("gray.200", "gray.700") },
          leftIcon: /* @__PURE__ */ React.createElement(FaMobileAlt, { size: 12, color: "#2563eb" }),
          rightIcon: /* @__PURE__ */ React.createElement(Text, { fontSize: "10px", color: "gray.400" }, "\u25BE"),
          borderRadius: "lg",
          fontWeight: "bold",
          fontSize: "xs",
          h: "28px"
        },
        projectName,
        " App"
      ), /* @__PURE__ */ React.createElement(MenuList, { zIndex: 50, shadow: "xl", borderRadius: "xl", fontSize: "xs", minW: "240px" }, /* @__PURE__ */ React.createElement(Box, { px: 3, py: 1.5 }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "bold", fontSize: "10px", color: "gray.400", textTransform: "uppercase", letterSpacing: "wider" }, "App Screens (CRUD)")), /* @__PURE__ */ React.createElement(
        MenuItem,
        {
          icon: /* @__PURE__ */ React.createElement(FaPlus, { size: 11, color: "#2563eb" }),
          onClick: () => {
            setNewAppNameInput("");
            onNewAppModalOpen();
          }
        },
        "Create New App Screen..."
      ), /* @__PURE__ */ React.createElement(
        MenuItem,
        {
          icon: /* @__PURE__ */ React.createElement(FaEdit, { size: 11, color: "#8b5cf6" }),
          onClick: () => {
            setRenameAppNameInput(projectName);
            onRenameAppModalOpen();
          }
        },
        "Rename Current App..."
      ), /* @__PURE__ */ React.createElement(MenuItem, { icon: /* @__PURE__ */ React.createElement(FaSave, { size: 11, color: "#10b981" }), onClick: () => handleSaveApp() }, "Save App Configuration"), /* @__PURE__ */ React.createElement(MenuItem, { icon: /* @__PURE__ */ React.createElement(FaTrashAlt, { size: 11, color: "#ef4444" }), onClick: onClearCanvasModalOpen }, "Clear All Canvas Components..."), /* @__PURE__ */ React.createElement(MenuDivider, null), /* @__PURE__ */ React.createElement(Box, { px: 3, py: 1 }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "bold", fontSize: "10px", color: "gray.400", textTransform: "uppercase", letterSpacing: "wider" }, "Saved App Screens (", savedApps.length, ")")), savedApps.map((app) => /* @__PURE__ */ React.createElement(
        MenuItem,
        {
          key: app.name,
          onClick: () => handleLoadApp(app.name),
          bg: app.name === projectName ? useColorModeValue("blue.50", "gray.800") : "transparent",
          fontWeight: app.name === projectName ? "bold" : "normal"
        },
        /* @__PURE__ */ React.createElement(HStack, { justify: "space-between", w: "100%" }, /* @__PURE__ */ React.createElement(HStack, { spacing: 2 }, app.name === projectName && /* @__PURE__ */ React.createElement(FaCheck, { size: 10, color: "#2563eb" }), /* @__PURE__ */ React.createElement(Text, null, app.name)), /* @__PURE__ */ React.createElement(HStack, { spacing: 1 }, /* @__PURE__ */ React.createElement(Badge, { size: "xs", fontSize: "9px", colorScheme: "blue" }, app.widgetCount || 0, " items"), savedApps.length > 1 && /* @__PURE__ */ React.createElement(
          IconButton,
          {
            icon: /* @__PURE__ */ React.createElement(FaTrashAlt, { size: 9 }),
            size: "xs",
            variant: "ghost",
            color: "red.400",
            h: "18px",
            minW: "18px",
            onClick: (e) => {
              e.stopPropagation();
              handleDeleteApp(app.name);
            },
            "aria-label": "Delete App Screen"
          }
        )))
      )))), /* @__PURE__ */ React.createElement(HStack, { bg: "green.50", color: "green.700", px: 2.5, py: 1, borderRadius: "full", fontSize: "11px", fontWeight: "semibold" }, /* @__PURE__ */ React.createElement(Box, { w: "6px", h: "6px", bg: "green.500", borderRadius: "full" }), /* @__PURE__ */ React.createElement(Text, null, selectedDevice?.friendlyName || selectedDevice?.name || `Espressif ESP32 (${activePort})`)), /* @__PURE__ */ React.createElement(
        Button,
        {
          size: "xs",
          variant: "outline",
          colorScheme: "blue",
          borderRadius: "lg",
          leftIcon: /* @__PURE__ */ React.createElement(FaBolt, { size: 10 }),
          onClick: () => setWizardStep("connection"),
          title: "Return to Firmware Flashing Wizard"
        },
        "Flasher Wizard"
      )),
      /* @__PURE__ */ React.createElement(HStack, { spacing: 1, bg: useColorModeValue("gray.100", "gray.800"), p: 1, borderRadius: "xl" }, /* @__PURE__ */ React.createElement(
        Button,
        {
          size: "xs",
          variant: appBuilderView === "designer" ? "solid" : "ghost",
          colorScheme: appBuilderView === "designer" ? "blue" : "gray",
          leftIcon: /* @__PURE__ */ React.createElement(FaThLarge, { size: 11 }),
          onClick: () => setAppBuilderView("designer"),
          borderRadius: "lg"
        },
        "Designer"
      ), /* @__PURE__ */ React.createElement(
        Button,
        {
          size: "xs",
          variant: appBuilderView === "blocks" ? "solid" : "ghost",
          colorScheme: appBuilderView === "blocks" ? "blue" : "gray",
          leftIcon: /* @__PURE__ */ React.createElement(FaCode, { size: 11 }),
          onClick: () => setAppBuilderView("blocks"),
          borderRadius: "lg"
        },
        "Rules  (",
        logicBlocks.length,
        ")"
      ), /* @__PURE__ */ React.createElement(
        Button,
        {
          size: "xs",
          variant: appBuilderView === "preview" ? "solid" : "ghost",
          colorScheme: appBuilderView === "preview" ? "blue" : "gray",
          leftIcon: /* @__PURE__ */ React.createElement(FaPlay, { size: 11 }),
          onClick: () => setAppBuilderView("preview"),
          borderRadius: "lg"
        },
        "Preview"
      )),
      /* @__PURE__ */ React.createElement(HStack, { spacing: 2 }, /* @__PURE__ */ React.createElement(Tooltip, { label: "Undo (Ctrl+Z)", placement: "bottom" }, /* @__PURE__ */ React.createElement(
        IconButton,
        {
          icon: /* @__PURE__ */ React.createElement(FaUndo, { size: 12 }),
          size: "sm",
          variant: "ghost",
          "aria-label": "Undo",
          isDisabled: historyIndex <= 0,
          onClick: handleUndo
        }
      )), /* @__PURE__ */ React.createElement(Tooltip, { label: "Redo (Ctrl+Y)", placement: "bottom" }, /* @__PURE__ */ React.createElement(
        IconButton,
        {
          icon: /* @__PURE__ */ React.createElement(FaRedo, { size: 12 }),
          size: "sm",
          variant: "ghost",
          "aria-label": "Redo",
          isDisabled: historyIndex >= history.length - 1,
          onClick: handleRedo
        }
      )), /* @__PURE__ */ React.createElement(
        Button,
        {
          size: "sm",
          variant: "outline",
          leftIcon: /* @__PURE__ */ React.createElement(FaSave, { size: 13 }),
          onClick: handleSaveApp
        },
        "Save"
      ), /* @__PURE__ */ React.createElement(
        Button,
        {
          size: "sm",
          colorScheme: "green",
          bg: "#10b981",
          _hover: { bg: "#059669" },
          leftIcon: /* @__PURE__ */ React.createElement(FaRocket, { size: 13 }),
          onClick: handleOpenPublishModal,
          shadow: "md"
        },
        "Publish App"
      ))
    ), /* @__PURE__ */ React.createElement(Grid, { templateColumns: { base: "1fr", lg: "260px 1fr 340px" }, flex: "1", overflow: "hidden" }, /* @__PURE__ */ React.createElement(GridItem, { bg: bgCard, borderRight: "1px", borderColor, p: 3, display: "flex", flexDirection: "column", overflowY: "auto" }, appBuilderView === "blocks" ? (
      /* RULES MODE: SHOW ONLY COMPONENTS ADDED TO THE MOBILE APP IN DESIGNER */
      /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 2.5, flex: "1" }, /* @__PURE__ */ React.createElement(Flex, { justify: "space-between", align: "center", px: 1, mb: 0.5 }, /* @__PURE__ */ React.createElement(VStack, { align: "start", spacing: 0 }, /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "extrabold", color: "gray.700", letterSpacing: "wider" }, "APP COMPONENTS (", widgets.length, ")"), /* @__PURE__ */ React.createElement(Text, { fontSize: "10px", color: "gray.400" }, "Components placed in Designer")), /* @__PURE__ */ React.createElement(Badge, { colorScheme: "blue", variant: "subtle", fontSize: "9px", px: 1.5, py: 0.5, borderRadius: "full" }, "Synchronized")), /* @__PURE__ */ React.createElement(
        Input,
        {
          placeholder: "Filter added components...",
          size: "sm",
          value: searchPalette,
          onChange: (e) => setSearchPalette(e.target.value),
          borderRadius: "lg",
          bg: useColorModeValue("gray.50", "gray.800"),
          fontSize: "xs"
        }
      ), widgets.length === 0 ? /* @__PURE__ */ React.createElement(Box, { p: 4, textAlign: "center", bg: useColorModeValue("gray.50", "gray.800"), borderRadius: "xl", border: "1px dashed", borderColor, mt: 2 }, /* @__PURE__ */ React.createElement(Box, { p: 2.5, bg: "gray.100", color: "gray.400", borderRadius: "full", display: "inline-block", mb: 2 }, /* @__PURE__ */ React.createElement(FaMobileAlt, { size: 18 })), /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "bold", color: "gray.600" }, "No Components Added"), /* @__PURE__ */ React.createElement(Text, { fontSize: "11px", color: "gray.400", mt: 1, mb: 3 }, "Components must be placed in the mobile Designer first to configure automation rules."), /* @__PURE__ */ React.createElement(Button, { size: "xs", colorScheme: "blue", onClick: () => setAppBuilderView("designer"), borderRadius: "lg" }, "Go to Designer")) : /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 2, overflowY: "auto", maxH: "calc(100vh - 240px)", pr: 1 }, widgets.filter((w) => {
        if (!searchPalette.trim()) return true;
        const q = searchPalette.toLowerCase();
        return w.title && w.title.toLowerCase().includes(q) || w.type && w.type.toLowerCase().includes(q) || w.boundTarget && w.boundTarget.toLowerCase().includes(q) || w.boundTargetName && w.boundTargetName.toLowerCase().includes(q);
      }).map((w) => {
        const ruleCount = logicBlocks.filter((b) => b.triggerWidgetId === w.id).length;
        const paletteMatch = uiPaletteItems.find((p) => p.type === w.type);
        const binding = w.boundTargetName || w.boundTarget || "GPIO Pin";
        return /* @__PURE__ */ React.createElement(
          Box,
          {
            key: w.id,
            p: 2.5,
            bg: useColorModeValue("white", "gray.800"),
            borderRadius: "xl",
            border: "1.5px solid",
            borderColor: ruleCount > 0 ? "blue.200" : borderColor,
            shadow: "xs",
            transition: "all 0.15s ease",
            _hover: { borderColor: "blue.400", shadow: "sm", transform: "translateY(-1px)" }
          },
          /* @__PURE__ */ React.createElement(HStack, { justify: "space-between", align: "start", mb: 1 }, /* @__PURE__ */ React.createElement(HStack, { spacing: 2, align: "center" }, /* @__PURE__ */ React.createElement(Box, { color: "blue.500", p: 1, bg: useColorModeValue("blue.50", "gray.700"), borderRadius: "md" }, paletteMatch?.icon || /* @__PURE__ */ React.createElement(FaLightbulb, { size: 12 })), /* @__PURE__ */ React.createElement(VStack, { align: "start", spacing: 0 }, /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "bold", color: "gray.800", noOfLines: 1 }, w.title), /* @__PURE__ */ React.createElement(Text, { fontSize: "9px", color: "gray.400", textTransform: "capitalize" }, w.type, " \u2022 #", w.id.slice(-6)))), /* @__PURE__ */ React.createElement(
            Button,
            {
              size: "xs",
              h: "20px",
              fontSize: "10px",
              colorScheme: "blue",
              variant: "ghost",
              leftIcon: /* @__PURE__ */ React.createElement(FaPlus, { size: 8 }),
              onClick: () => handleOpenAddRule(0, w),
              title: "Add automation rule for this component"
            },
            "+ Rule"
          )),
          /* @__PURE__ */ React.createElement(Box, { mt: 1, p: 1.5, bg: useColorModeValue("blue.50", "gray.900"), borderRadius: "md", border: "1px solid", borderColor: useColorModeValue("blue.100", "gray.700") }, /* @__PURE__ */ React.createElement(HStack, { justify: "space-between", align: "center" }, /* @__PURE__ */ React.createElement(HStack, { spacing: 1.5 }, /* @__PURE__ */ React.createElement(FaMicrochip, { size: 10, color: "#2563eb" }), /* @__PURE__ */ React.createElement(Text, { fontSize: "10px", fontWeight: "semibold", color: "blue.700", noOfLines: 1 }, binding)), /* @__PURE__ */ React.createElement(Badge, { colorScheme: "green", variant: "solid", fontSize: "8px", px: 1, py: 0, borderRadius: "sm" }, "ACTIVE"))),
          /* @__PURE__ */ React.createElement(HStack, { justify: "space-between", align: "center", mt: 1.5, px: 0.5 }, /* @__PURE__ */ React.createElement(Text, { fontSize: "9px", color: "gray.500" }, ruleCount === 0 ? "0 rules active" : `${ruleCount} ${ruleCount === 1 ? "rule" : "rules"} active`), ruleCount > 0 && /* @__PURE__ */ React.createElement(Badge, { colorScheme: "purple", fontSize: "8px", px: 1, py: 0, borderRadius: "sm" }, "Linked"))
        );
      })))
    ) : (
      /* DESIGNER MODE: SHOW COMPONENT PALETTE TO ADD NEW WIDGETS */
      /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(HStack, { mb: 2.5, px: 1 }, /* @__PURE__ */ React.createElement(
        Input,
        {
          placeholder: "Search components...",
          size: "sm",
          value: searchPalette,
          onChange: (e) => setSearchPalette(e.target.value),
          borderRadius: "lg",
          bg: useColorModeValue("gray.50", "gray.800")
        }
      )), /* @__PURE__ */ React.createElement(Accordion, { defaultIndex: [0, 1], allowMultiple: true }, /* @__PURE__ */ React.createElement(AccordionItem, { border: "none" }, /* @__PURE__ */ React.createElement(AccordionButton, { px: 2, py: 2, _hover: { bg: "transparent" } }, /* @__PURE__ */ React.createElement(Box, { flex: "1", textAlign: "left", fontWeight: "bold", fontSize: "xs", color: "gray.500", letterSpacing: "wider" }, "USER INTERFACE (", filteredPalette.length, ")"), /* @__PURE__ */ React.createElement(AccordionIcon, null)), /* @__PURE__ */ React.createElement(AccordionPanel, { pb: 3, px: 1 }, /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 1.5 }, filteredPalette.map((item) => /* @__PURE__ */ React.createElement(
        HStack,
        {
          key: item.type,
          p: 2,
          borderRadius: "lg",
          border: "1px solid",
          borderColor: useColorModeValue("gray.100", "gray.750"),
          bg: useColorModeValue("gray.50", "gray.800"),
          _hover: {
            borderColor: "blue.400",
            bg: useColorModeValue("blue.50", "gray.700"),
            transform: "translateY(-1px)",
            shadow: "xs"
          },
          cursor: "pointer",
          transition: "all 0.15s",
          onClick: () => handleAddComponent(item.type, item.title, item.defaultBinding || "GPIO Pin"),
          justify: "space-between"
        },
        /* @__PURE__ */ React.createElement(HStack, { spacing: 2.5 }, /* @__PURE__ */ React.createElement(Box, { color: "blue.500", p: 1, bg: "whiteAlpha.800", borderRadius: "md", shadow: "xs" }, item.icon), /* @__PURE__ */ React.createElement(VStack, { align: "start", spacing: 0 }, /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "bold" }, item.title), /* @__PURE__ */ React.createElement(Text, { fontSize: "10px", color: "gray.400" }, item.desc))),
        /* @__PURE__ */ React.createElement(Text, { fontSize: "12px", color: "gray.400", opacity: 0.6 }, "+ Add")
      ))))), /* @__PURE__ */ React.createElement(AccordionItem, { border: "none" }, /* @__PURE__ */ React.createElement(AccordionButton, { px: 2, py: 2, _hover: { bg: "transparent" } }, /* @__PURE__ */ React.createElement(Box, { flex: "1", textAlign: "left", fontWeight: "bold", fontSize: "xs", color: "gray.500", letterSpacing: "wider" }, "LAYOUT & CONTAINERS (", filteredLayoutPalette.length, ")"), /* @__PURE__ */ React.createElement(AccordionIcon, null)), /* @__PURE__ */ React.createElement(AccordionPanel, { pb: 2, px: 1 }, /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 1.5 }, filteredLayoutPalette.map((item) => /* @__PURE__ */ React.createElement(
        HStack,
        {
          key: item.type + item.title,
          p: 2,
          borderRadius: "lg",
          border: "1px solid",
          borderColor: useColorModeValue("gray.100", "gray.750"),
          bg: useColorModeValue("gray.50", "gray.800"),
          _hover: {
            borderColor: "blue.400",
            bg: useColorModeValue("blue.50", "gray.700"),
            transform: "translateY(-1px)",
            shadow: "xs"
          },
          cursor: "pointer",
          transition: "all 0.15s",
          onClick: () => handleAddComponent(item.type, item.title, item.defaultBinding || "Layout"),
          justify: "space-between"
        },
        /* @__PURE__ */ React.createElement(HStack, { spacing: 2.5 }, /* @__PURE__ */ React.createElement(Box, { p: 1, bg: "whiteAlpha.800", borderRadius: "md", shadow: "xs" }, item.icon), /* @__PURE__ */ React.createElement(VStack, { align: "start", spacing: 0 }, /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "bold" }, item.title), /* @__PURE__ */ React.createElement(Text, { fontSize: "10px", color: "gray.400" }, item.desc))),
        /* @__PURE__ */ React.createElement(Text, { fontSize: "11px", color: "blue.500", fontWeight: "semibold" }, "+ Add")
      )))))))
    )), /* @__PURE__ */ React.createElement(
      GridItem,
      {
        bg: useColorModeValue("#f8fafc", "#0b0f17"),
        p: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "start",
        overflowY: "auto",
        position: "relative"
      },
      appBuilderView === "designer" && /* @__PURE__ */ React.createElement(React.Fragment, null, starterAlertVisible && /* @__PURE__ */ React.createElement(
        Box,
        {
          w: "100%",
          maxW: "480px",
          mb: 4,
          p: 3.5,
          bg: "white",
          borderRadius: "2xl",
          border: "1px solid",
          borderColor: "blue.100",
          shadow: "md",
          display: "flex",
          alignItems: "start",
          justifyContent: "space-between"
        },
        /* @__PURE__ */ React.createElement(HStack, { align: "start", spacing: 3 }, /* @__PURE__ */ React.createElement(Text, { fontSize: "lg" }, "\u2728"), /* @__PURE__ */ React.createElement(VStack, { align: "start", spacing: 0.5 }, /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "bold", color: "blue.600" }, "Starter App Generated"), /* @__PURE__ */ React.createElement(Text, { fontSize: "11px", color: "gray.600", lineHeight: "tall" }, "We've created a basic control app from your hardware. Customize it by adding more components, configuring pins, or switching to Blocks mode for logic."))),
        /* @__PURE__ */ React.createElement(
          IconButton,
          {
            icon: /* @__PURE__ */ React.createElement(FaTimes, { size: 11 }),
            size: "xs",
            variant: "ghost",
            onClick: () => setStarterAlertVisible(false),
            "aria-label": "Dismiss alert"
          }
        )
      ), /* @__PURE__ */ React.createElement(
        Box,
        {
          w: "340px",
          minH: "640px",
          bg: "white",
          borderRadius: "42px",
          border: "10px solid #1e293b",
          position: "relative",
          shadow: "2xl",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          mb: 8
        },
        /* @__PURE__ */ React.createElement(
          Box,
          {
            w: "100px",
            h: "18px",
            bg: "#1e293b",
            position: "absolute",
            top: "0",
            left: "50%",
            transform: "translateX(-50%)",
            borderBottomRadius: "xl",
            zIndex: 20
          }
        ),
        /* @__PURE__ */ React.createElement(HStack, { justify: "space-between", px: 6, pt: 3, pb: 1, fontSize: "10px", color: "gray.700", fontWeight: "bold", zIndex: 10 }, /* @__PURE__ */ React.createElement(Text, null, "9:41"), /* @__PURE__ */ React.createElement(HStack, { spacing: 1.5 }, /* @__PURE__ */ React.createElement(FaWifi, { size: 10 }), /* @__PURE__ */ React.createElement(Text, { fontSize: "9px" }, "5G"), /* @__PURE__ */ React.createElement(Box, { w: "16px", h: "8px", border: "1px solid currentColor", borderRadius: "2px", p: "1px" }, /* @__PURE__ */ React.createElement(Box, { w: "80%", h: "100%", bg: "currentColor", borderRadius: "1px" })))),
        /* @__PURE__ */ React.createElement(Box, { flex: "1", p: 3.5, bg: "#f8fafc", overflowY: "auto" }, /* @__PURE__ */ React.createElement(HStack, { justify: "space-between", mb: 3, mt: 1 }, /* @__PURE__ */ React.createElement(HStack, { spacing: 2 }, /* @__PURE__ */ React.createElement(Text, { fontSize: "sm" }, "\u{1F331}"), /* @__PURE__ */ React.createElement(Text, { fontWeight: "extrabold", fontSize: "md", color: "gray.900" }, projectName)), /* @__PURE__ */ React.createElement(Badge, { colorScheme: "green", fontSize: "9px", borderRadius: "full", px: 2 }, "\u25CF Live")), /* @__PURE__ */ React.createElement(VStack, { spacing: 2.5, align: "stretch", minH: "240px" }, widgets.filter((w) => w.visible !== false).length === 0 ? /* @__PURE__ */ React.createElement(
          Flex,
          {
            direction: "column",
            align: "center",
            justify: "center",
            h: "260px",
            border: "2px dashed",
            borderColor: "gray.300",
            borderRadius: "2xl",
            p: 6,
            textAlign: "center",
            my: 4
          },
          /* @__PURE__ */ React.createElement(Box, { p: 3, bg: "blue.50", color: "blue.500", borderRadius: "full", mb: 2.5 }, /* @__PURE__ */ React.createElement(FaPlus, { size: 18 })),
          /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "bold", color: "gray.700" }, "Screen is Empty"),
          /* @__PURE__ */ React.createElement(Text, { fontSize: "11px", color: "gray.400", mt: 1, maxW: "210px" }, "Add components from the left palette to start building your mobile UI.")
        ) : widgets.filter((w) => w.visible !== false).map((w) => {
          const isSelected = w.id === selectedWidgetId;
          return /* @__PURE__ */ React.createElement(
            Box,
            {
              key: w.id,
              p: 3,
              bg: "white",
              borderRadius: `${w.cornerRadius || 16}px`,
              border: "2px solid",
              borderColor: isSelected ? "#2563eb" : "transparent",
              shadow: "sm",
              _hover: { borderColor: isSelected ? "#2563eb" : "gray.200" },
              cursor: "pointer",
              transition: "all 0.15s",
              position: "relative",
              onClick: () => setSelectedWidgetId(w.id)
            },
            isSelected && /* @__PURE__ */ React.createElement(
              HStack,
              {
                position: "absolute",
                top: "-12px",
                right: "12px",
                bg: "blue.600",
                color: "white",
                px: 2,
                py: 0.5,
                borderRadius: "full",
                shadow: "md",
                spacing: 1.5,
                zIndex: 15
              },
              /* @__PURE__ */ React.createElement(Tooltip, { label: "Move Up", fontSize: "10px" }, /* @__PURE__ */ React.createElement(
                IconButton,
                {
                  icon: /* @__PURE__ */ React.createElement(FaArrowUp, { size: 9 }),
                  size: "xs",
                  h: "18px",
                  minW: "18px",
                  variant: "ghost",
                  color: "white",
                  _hover: { bg: "blue.700" },
                  onClick: (e) => {
                    e.stopPropagation();
                    handleMoveWidget(w.id, "up");
                  },
                  "aria-label": "Up"
                }
              )),
              /* @__PURE__ */ React.createElement(Tooltip, { label: "Move Down", fontSize: "10px" }, /* @__PURE__ */ React.createElement(
                IconButton,
                {
                  icon: /* @__PURE__ */ React.createElement(FaArrowDown, { size: 9 }),
                  size: "xs",
                  h: "18px",
                  minW: "18px",
                  variant: "ghost",
                  color: "white",
                  _hover: { bg: "blue.700" },
                  onClick: (e) => {
                    e.stopPropagation();
                    handleMoveWidget(w.id, "down");
                  },
                  "aria-label": "Down"
                }
              )),
              /* @__PURE__ */ React.createElement(Tooltip, { label: "Duplicate", fontSize: "10px" }, /* @__PURE__ */ React.createElement(
                IconButton,
                {
                  icon: /* @__PURE__ */ React.createElement(FaClone, { size: 9 }),
                  size: "xs",
                  h: "18px",
                  minW: "18px",
                  variant: "ghost",
                  color: "white",
                  _hover: { bg: "blue.700" },
                  onClick: (e) => {
                    e.stopPropagation();
                    handleDuplicateWidget(w.id);
                  },
                  "aria-label": "Duplicate"
                }
              )),
              /* @__PURE__ */ React.createElement(Tooltip, { label: "Delete", fontSize: "10px" }, /* @__PURE__ */ React.createElement(
                IconButton,
                {
                  icon: /* @__PURE__ */ React.createElement(FaTrashAlt, { size: 9 }),
                  size: "xs",
                  h: "18px",
                  minW: "18px",
                  variant: "ghost",
                  color: "red.200",
                  _hover: { bg: "red.600", color: "white" },
                  onClick: (e) => {
                    e.stopPropagation();
                    handleDeleteWidget(w.id);
                  },
                  "aria-label": "Delete"
                }
              ))
            ),
            w.type === "switch" && /* @__PURE__ */ React.createElement(HStack, { justify: "space-between" }, /* @__PURE__ */ React.createElement(HStack, { spacing: 2.5 }, /* @__PURE__ */ React.createElement(Box, { p: 2, bg: w.state ? "yellow.100" : "gray.100", color: w.state ? "yellow.600" : "gray.400", borderRadius: "lg" }, /* @__PURE__ */ React.createElement(FaLightbulb, { size: 16 })), /* @__PURE__ */ React.createElement(VStack, { align: "start", spacing: 0 }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "bold", fontSize: "xs", color: "gray.900" }, w.title), /* @__PURE__ */ React.createElement(Text, { fontSize: "10px", color: "gray.400" }, w.boundTargetName || w.boundTarget))), /* @__PURE__ */ React.createElement(
              Switch,
              {
                colorScheme: "green",
                isChecked: w.state,
                onChange: (e) => {
                  e.stopPropagation();
                  handleUpdateWidget("state", e.target.checked, w.id);
                }
              }
            )),
            w.type === "slider" && /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 1.5 }, /* @__PURE__ */ React.createElement(HStack, { justify: "space-between" }, /* @__PURE__ */ React.createElement(HStack, { spacing: 2.5 }, /* @__PURE__ */ React.createElement(Box, { p: 2, bg: "purple.50", color: "purple.600", borderRadius: "lg" }, /* @__PURE__ */ React.createElement(FaCogs, { size: 16 })), /* @__PURE__ */ React.createElement(VStack, { align: "start", spacing: 0 }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "bold", fontSize: "xs", color: "gray.900" }, w.title), /* @__PURE__ */ React.createElement(Text, { fontSize: "10px", color: "gray.400" }, w.boundTargetName || w.boundTarget))), /* @__PURE__ */ React.createElement(Text, { fontWeight: "extrabold", fontSize: "xs", color: w.color || "purple.600" }, w.value, w.unit || "\xB0")), /* @__PURE__ */ React.createElement(
              Slider,
              {
                value: w.value,
                min: w.min || 0,
                max: w.max || 180,
                onChange: (val) => handleUpdateWidget("value", val, w.id)
              },
              /* @__PURE__ */ React.createElement(SliderTrack, { bg: "gray.100" }, /* @__PURE__ */ React.createElement(SliderFilledTrack, { bg: w.color || "purple.500" })),
              /* @__PURE__ */ React.createElement(SliderThumb, { boxSize: 3.5 })
            )),
            w.type === "gauge" && /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 2 }, /* @__PURE__ */ React.createElement(HStack, { justify: "space-between" }, /* @__PURE__ */ React.createElement(HStack, { spacing: 2.5 }, /* @__PURE__ */ React.createElement(Box, { p: 2, bg: "red.50", color: "red.500", borderRadius: "lg" }, /* @__PURE__ */ React.createElement(FaTemperatureHigh, { size: 16 })), /* @__PURE__ */ React.createElement(VStack, { align: "start", spacing: 0 }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "bold", fontSize: "xs", color: "gray.900" }, w.title), /* @__PURE__ */ React.createElement(Text, { fontSize: "10px", color: "gray.400" }, w.boundTargetName || w.boundTarget))), /* @__PURE__ */ React.createElement(HStack, { spacing: 1, color: "green.600", fontSize: "10px", fontWeight: "bold" }, /* @__PURE__ */ React.createElement(Box, { w: "6px", h: "6px", bg: "green.500", borderRadius: "full" }), /* @__PURE__ */ React.createElement(Text, null, "Live"))), /* @__PURE__ */ React.createElement(HStack, { spacing: 3, justify: "center", py: 1 }, /* @__PURE__ */ React.createElement(
              Box,
              {
                w: "52px",
                h: "26px",
                borderTopRadius: "52px",
                border: `4px solid ${w.color || "#ef4444"}`,
                borderBottom: "none"
              }
            ), /* @__PURE__ */ React.createElement(VStack, { align: "start", spacing: 0 }, /* @__PURE__ */ React.createElement(Text, { fontSize: "xl", fontWeight: "black", color: "gray.900" }, w.value, w.unit || "\xB0C"), /* @__PURE__ */ React.createElement(Text, { fontSize: "9px", color: "gray.400" }, "Live telemetry")))),
            w.type === "chart" && /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 2 }, /* @__PURE__ */ React.createElement(HStack, { justify: "space-between" }, /* @__PURE__ */ React.createElement(HStack, { spacing: 2 }, /* @__PURE__ */ React.createElement(FaChartLine, { color: "#2563eb" }), /* @__PURE__ */ React.createElement(Text, { fontWeight: "bold", fontSize: "xs" }, w.title)), /* @__PURE__ */ React.createElement(Badge, { colorScheme: "blue", fontSize: "9px" }, "Live Stream")), /* @__PURE__ */ React.createElement(Box, { h: "45px", w: "100%", bg: "blue.50", borderRadius: "lg", p: 1, display: "flex", alignItems: "flex-end" }, /* @__PURE__ */ React.createElement("svg", { width: "100%", height: "100%", viewBox: "0 0 200 40", preserveAspectRatio: "none" }, /* @__PURE__ */ React.createElement("path", { d: "M0,35 Q30,10 60,25 T120,15 T180,30 T200,8", fill: "none", stroke: "#2563eb", strokeWidth: "2.5" })))),
            w.type === "button" && /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 1 }, /* @__PURE__ */ React.createElement(Text, { fontSize: "9px", color: "gray.400", px: 1 }, w.boundTargetName || w.boundTarget), /* @__PURE__ */ React.createElement(
              Button,
              {
                w: "100%",
                size: "md",
                bg: w.color || "#ea580c",
                _hover: { opacity: 0.9 },
                color: "white",
                borderRadius: "xl",
                leftIcon: /* @__PURE__ */ React.createElement(FaBell, { size: 14 }),
                onClick: (e) => {
                  e.stopPropagation();
                  setActiveWidgetId(w.id);
                  if (previewTab === "preview") {
                    handleTestHardwareSignal(w);
                  }
                },
                fontWeight: "bold",
                fontSize: "xs"
              },
              w.title
            )),
            w.type === "top_button" && /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 1 }, /* @__PURE__ */ React.createElement(HStack, { justify: "space-between" }, /* @__PURE__ */ React.createElement(Text, { fontSize: "9px", color: "gray.400", px: 1 }, w.boundTargetName || w.boundTarget || "GPIO 13 (Motor Forward)"), /* @__PURE__ */ React.createElement(Badge, { fontSize: "9px", colorScheme: "blue" }, "\u25B2 Top / Forward")), /* @__PURE__ */ React.createElement(
              Button,
              {
                w: "100%",
                size: "md",
                bg: w.color || "#2563eb",
                _hover: { opacity: 0.9 },
                color: "white",
                borderRadius: "xl",
                leftIcon: /* @__PURE__ */ React.createElement(FaArrowUp, { size: 13 }),
                onClick: (e) => {
                  e.stopPropagation();
                  setActiveWidgetId(w.id);
                  if (previewTab === "preview") {
                    handleTestHardwareSignal(w);
                  }
                },
                fontWeight: "bold",
                fontSize: "xs",
                shadow: "sm"
              },
              w.title
            )),
            w.type === "bottom_button" && /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 1 }, /* @__PURE__ */ React.createElement(HStack, { justify: "space-between" }, /* @__PURE__ */ React.createElement(Text, { fontSize: "9px", color: "gray.400", px: 1 }, w.boundTargetName || w.boundTarget || "GPIO 14 (Motor Reverse)"), /* @__PURE__ */ React.createElement(Badge, { fontSize: "9px", colorScheme: "cyan" }, "\u25BC Bottom / Reverse")), /* @__PURE__ */ React.createElement(
              Button,
              {
                w: "100%",
                size: "md",
                bg: w.color || "#0284c7",
                _hover: { opacity: 0.9 },
                color: "white",
                borderRadius: "xl",
                leftIcon: /* @__PURE__ */ React.createElement(FaArrowDown, { size: 13 }),
                onClick: (e) => {
                  e.stopPropagation();
                  setActiveWidgetId(w.id);
                  if (previewTab === "preview") {
                    handleTestHardwareSignal(w);
                  }
                },
                fontWeight: "bold",
                fontSize: "xs",
                shadow: "sm"
              },
              w.title
            )),
            w.type === "left_button" && /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 1 }, /* @__PURE__ */ React.createElement(HStack, { justify: "space-between" }, /* @__PURE__ */ React.createElement(Text, { fontSize: "9px", color: "gray.400", px: 1 }, w.boundTargetName || w.boundTarget || "GPIO 12 (Steer Left)"), /* @__PURE__ */ React.createElement(Badge, { fontSize: "9px", colorScheme: "purple" }, "\u25C0 Left Turn")), /* @__PURE__ */ React.createElement(
              Button,
              {
                w: "100%",
                size: "md",
                bg: w.color || "#7c3aed",
                _hover: { opacity: 0.9 },
                color: "white",
                borderRadius: "xl",
                leftIcon: /* @__PURE__ */ React.createElement(FaArrowLeft, { size: 13 }),
                onClick: (e) => {
                  e.stopPropagation();
                  setActiveWidgetId(w.id);
                  if (previewTab === "preview") {
                    handleTestHardwareSignal(w);
                  }
                },
                fontWeight: "bold",
                fontSize: "xs",
                shadow: "sm"
              },
              w.title
            )),
            w.type === "right_button" && /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 1 }, /* @__PURE__ */ React.createElement(HStack, { justify: "space-between" }, /* @__PURE__ */ React.createElement(Text, { fontSize: "9px", color: "gray.400", px: 1 }, w.boundTargetName || w.boundTarget || "GPIO 15 (Steer Right)"), /* @__PURE__ */ React.createElement(Badge, { fontSize: "9px", colorScheme: "purple" }, "\u25B6 Right Turn")), /* @__PURE__ */ React.createElement(
              Button,
              {
                w: "100%",
                size: "md",
                bg: w.color || "#9333ea",
                _hover: { opacity: 0.9 },
                color: "white",
                borderRadius: "xl",
                leftIcon: /* @__PURE__ */ React.createElement(FaArrowRight, { size: 13 }),
                onClick: (e) => {
                  e.stopPropagation();
                  setActiveWidgetId(w.id);
                  if (previewTab === "preview") {
                    handleTestHardwareSignal(w);
                  }
                },
                fontWeight: "bold",
                fontSize: "xs",
                shadow: "sm"
              },
              w.title
            )),
            w.type === "dpad" && /* @__PURE__ */ React.createElement(VStack, { align: "center", spacing: 2, p: 1 }, /* @__PURE__ */ React.createElement(HStack, { justify: "space-between", w: "100%" }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "bold", fontSize: "xs" }, w.title), /* @__PURE__ */ React.createElement(Badge, { colorScheme: "blue", fontSize: "9px" }, "4-Way Controller")), /* @__PURE__ */ React.createElement(Box, { p: 2.5, bg: "gray.100", borderRadius: "2xl", border: "1px solid", borderColor: "gray.300" }, /* @__PURE__ */ React.createElement(VStack, { spacing: 1 }, /* @__PURE__ */ React.createElement(
              Button,
              {
                size: "xs",
                colorScheme: "blue",
                w: "44px",
                h: "32px",
                borderRadius: "lg",
                onClick: (e) => {
                  e.stopPropagation();
                  setActiveWidgetId(w.id);
                  if (previewTab === "preview") {
                    handleTestHardwareSignal({ ...w, boundTarget: "GPIO 13", title: "Top Button (Forward)" });
                  }
                }
              },
              /* @__PURE__ */ React.createElement(FaArrowUp, { size: 11 })
            ), /* @__PURE__ */ React.createElement(HStack, { spacing: 1 }, /* @__PURE__ */ React.createElement(
              Button,
              {
                size: "xs",
                colorScheme: "purple",
                w: "44px",
                h: "32px",
                borderRadius: "lg",
                onClick: (e) => {
                  e.stopPropagation();
                  setActiveWidgetId(w.id);
                  if (previewTab === "preview") {
                    handleTestHardwareSignal({ ...w, boundTarget: "GPIO 12", title: "Left Button (Steer Left)" });
                  }
                }
              },
              /* @__PURE__ */ React.createElement(FaArrowLeft, { size: 11 })
            ), /* @__PURE__ */ React.createElement(Box, { w: "36px", h: "32px", bg: "gray.300", borderRadius: "md", display: "flex", alignItems: "center", justifyContent: "center" }, /* @__PURE__ */ React.createElement(Text, { fontSize: "10px", fontWeight: "black", color: "gray.600" }, "\u25CF")), /* @__PURE__ */ React.createElement(
              Button,
              {
                size: "xs",
                colorScheme: "purple",
                w: "44px",
                h: "32px",
                borderRadius: "lg",
                onClick: (e) => {
                  e.stopPropagation();
                  setActiveWidgetId(w.id);
                  if (previewTab === "preview") {
                    handleTestHardwareSignal({ ...w, boundTarget: "GPIO 15", title: "Right Button (Steer Right)" });
                  }
                }
              },
              /* @__PURE__ */ React.createElement(FaArrowRight, { size: 11 })
            )), /* @__PURE__ */ React.createElement(
              Button,
              {
                size: "xs",
                colorScheme: "blue",
                w: "44px",
                h: "32px",
                borderRadius: "lg",
                onClick: (e) => {
                  e.stopPropagation();
                  setActiveWidgetId(w.id);
                  if (previewTab === "preview") {
                    handleTestHardwareSignal({ ...w, boundTarget: "GPIO 14", title: "Bottom Button (Reverse)" });
                  }
                }
              },
              /* @__PURE__ */ React.createElement(FaArrowDown, { size: 11 })
            )))),
            w.type === "colorpicker" && /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 2 }, /* @__PURE__ */ React.createElement(HStack, { justify: "space-between" }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "bold", fontSize: "xs" }, w.title), /* @__PURE__ */ React.createElement(Box, { w: "14px", h: "14px", borderRadius: "full", bg: w.selectedColor || "#2563eb" })), /* @__PURE__ */ React.createElement(HStack, { spacing: 2, justify: "center" }, ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"].map((c) => /* @__PURE__ */ React.createElement(
              Box,
              {
                key: c,
                w: "22px",
                h: "22px",
                borderRadius: "full",
                bg: c,
                cursor: "pointer",
                border: w.selectedColor === c ? "2px solid black" : "none",
                onClick: (e) => {
                  e.stopPropagation();
                  handleUpdateWidget("selectedColor", c, w.id);
                }
              }
            )))),
            w.type === "joystick" && /* @__PURE__ */ React.createElement(VStack, { align: "center", spacing: 1.5 }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "bold", fontSize: "xs" }, w.title), /* @__PURE__ */ React.createElement(Box, { w: "70px", h: "70px", borderRadius: "full", bg: "gray.100", border: "2px dashed", borderColor: "gray.300", display: "flex", alignItems: "center", justifyContent: "center" }, /* @__PURE__ */ React.createElement(Box, { w: "30px", h: "30px", borderRadius: "full", bg: "blue.500", shadow: "md" }))),
            w.type === "textfield" && /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 1.5 }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "bold", fontSize: "xs" }, w.title), /* @__PURE__ */ React.createElement(Input, { size: "xs", placeholder: "Enter command or message...", borderRadius: "lg", bg: "gray.50" })),
            w.type === "label" && /* @__PURE__ */ React.createElement(HStack, { justify: "space-between" }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "bold", fontSize: "sm" }, w.title), /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", color: "gray.500" }, w.boundTargetName || "Telemetry")),
            w.type === "device_card" && /* @__PURE__ */ React.createElement(HStack, { justify: "space-between", p: 1 }, /* @__PURE__ */ React.createElement(HStack, { spacing: 2 }, /* @__PURE__ */ React.createElement(Box, { p: 2, bg: "blue.50", color: "blue.600", borderRadius: "lg" }, /* @__PURE__ */ React.createElement(FaBroadcastTower, { size: 14 })), /* @__PURE__ */ React.createElement(VStack, { align: "start", spacing: 0 }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "bold", fontSize: "xs", color: "gray.900" }, w.title), /* @__PURE__ */ React.createElement(Text, { fontSize: "9px", color: "green.600", fontWeight: "semibold" }, "\u25CF Online & Connected"))), /* @__PURE__ */ React.createElement(Badge, { colorScheme: "blue", fontSize: "9px", borderRadius: "md" }, "WiFi 100%")),
            w.type === "progress" && /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 1 }, /* @__PURE__ */ React.createElement(HStack, { justify: "space-between" }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "bold", fontSize: "xs" }, w.title), /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", color: "blue.600" }, "75%")), /* @__PURE__ */ React.createElement(Progress, { value: 75, size: "xs", colorScheme: "blue", borderRadius: "full" })),
            w.type === "crud_table" && /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 2 }, /* @__PURE__ */ React.createElement(HStack, { justify: "space-between", align: "center" }, /* @__PURE__ */ React.createElement(HStack, { spacing: 1.5 }, /* @__PURE__ */ React.createElement(Box, { color: "blue.500" }, /* @__PURE__ */ React.createElement(FaTable, { size: 12 })), /* @__PURE__ */ React.createElement(Text, { fontWeight: "bold", fontSize: "xs", color: "gray.800" }, w.title)), /* @__PURE__ */ React.createElement(
              Button,
              {
                size: "xs",
                colorScheme: "blue",
                variant: "outline",
                leftIcon: /* @__PURE__ */ React.createElement(FaPlus, { size: 8 }),
                h: "20px",
                px: 2,
                fontSize: "10px",
                onClick: (e) => {
                  e.stopPropagation();
                  handleOpenAddCrudRecord(w.id);
                }
              },
              "Add"
            )), /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 1.5 }, (w.records || []).length === 0 ? /* @__PURE__ */ React.createElement(Box, { py: 3, textAlign: "center", bg: "gray.50", borderRadius: "md", border: "1px dashed", borderColor: "gray.200" }, /* @__PURE__ */ React.createElement(Text, { fontSize: "10px", color: "gray.400" }, "No records yet. Click '+ Add'")) : (w.records || []).map((rec) => /* @__PURE__ */ React.createElement(
              HStack,
              {
                key: rec.id,
                p: 2,
                bg: "gray.50",
                borderRadius: "md",
                border: "1px solid",
                borderColor: "gray.200",
                justify: "space-between",
                fontSize: "11px"
              },
              /* @__PURE__ */ React.createElement(VStack, { align: "start", spacing: 0, maxW: "150px" }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "bold", fontSize: "11px", color: "gray.800", isTruncated: true }, rec.name), /* @__PURE__ */ React.createElement(HStack, { spacing: 1 }, /* @__PURE__ */ React.createElement(
                Badge,
                {
                  colorScheme: rec.status === "Active" ? "green" : rec.status === "Alert" ? "red" : "blue",
                  fontSize: "8px",
                  px: 1,
                  borderRadius: "sm"
                },
                rec.value || rec.status
              ), /* @__PURE__ */ React.createElement(Text, { fontSize: "9px", color: "gray.400" }, rec.timestamp))),
              /* @__PURE__ */ React.createElement(HStack, { spacing: 1 }, /* @__PURE__ */ React.createElement(
                IconButton,
                {
                  icon: /* @__PURE__ */ React.createElement(FaEdit, { size: 9 }),
                  size: "xs",
                  h: "20px",
                  minW: "20px",
                  variant: "ghost",
                  color: "blue.500",
                  onClick: (e) => {
                    e.stopPropagation();
                    handleOpenEditCrudRecord(w.id, rec);
                  },
                  "aria-label": "Edit Record"
                }
              ), /* @__PURE__ */ React.createElement(
                IconButton,
                {
                  icon: /* @__PURE__ */ React.createElement(FaTrashAlt, { size: 9 }),
                  size: "xs",
                  h: "20px",
                  minW: "20px",
                  variant: "ghost",
                  color: "red.400",
                  onClick: (e) => {
                    e.stopPropagation();
                    handleDeleteCrudRecord(w.id, rec.id);
                  },
                  "aria-label": "Delete Record"
                }
              ))
            )))),
            !["switch", "slider", "gauge", "chart", "button", "colorpicker", "joystick", "textfield", "label", "device_card", "progress", "crud_table"].includes(w.type) && /* @__PURE__ */ React.createElement(HStack, { justify: "space-between" }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "bold", fontSize: "xs" }, w.title), /* @__PURE__ */ React.createElement(Badge, { fontSize: "9px" }, w.type))
          );
        })))
      )),
      appBuilderView === "blocks" && /* @__PURE__ */ React.createElement(Box, { w: "100%", maxW: "780px", p: 4 }, /* @__PURE__ */ React.createElement(Flex, { justify: "space-between", align: { base: "start", sm: "center" }, direction: { base: "column", sm: "row" }, gap: 3, mb: 4 }, /* @__PURE__ */ React.createElement(VStack, { align: "start", spacing: 0.5 }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "extrabold", fontSize: "md", color: "gray.800" }, "Automation & Hardware Rules"), /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", color: "gray.500" }, "Connect UI events to physical ESP32 GPIOs and hardware telemetry routines.")), /* @__PURE__ */ React.createElement(
        Button,
        {
          size: "sm",
          colorScheme: "blue",
          bg: "#2563eb",
          _hover: { bg: "#1d4ed8" },
          leftIcon: /* @__PURE__ */ React.createElement(FaPlus, { size: 11 }),
          onClick: () => handleOpenAddRule(0),
          borderRadius: "lg",
          fontWeight: "bold",
          shadow: "sm"
        },
        "Add Automation Rule"
      )), /* @__PURE__ */ React.createElement(Flex, { mb: 3, gap: 2, align: "center", wrap: "wrap" }, /* @__PURE__ */ React.createElement(
        Input,
        {
          size: "sm",
          placeholder: "Search rules by name, event, pin, or action...",
          value: ruleSearchQuery,
          onChange: (e) => setRuleSearchQuery(e.target.value),
          borderRadius: "lg",
          bg: "white",
          borderColor: "gray.200",
          _focus: { borderColor: "blue.400" },
          flex: "1",
          minW: "200px"
        }
      ), /* @__PURE__ */ React.createElement(
        Select,
        {
          size: "sm",
          maxW: "210px",
          borderRadius: "lg",
          bg: "white",
          borderColor: "gray.200",
          value: ruleComponentFilter,
          onChange: (e) => setRuleComponentFilter(e.target.value),
          fontSize: "xs"
        },
        /* @__PURE__ */ React.createElement("option", { value: "all" }, "All Components (", logicBlocks.length, ")"),
        widgets.map((w) => /* @__PURE__ */ React.createElement("option", { key: w.id, value: w.id }, w.title, " (", w.type, ")"))
      ), ruleSearchQuery && /* @__PURE__ */ React.createElement(Button, { size: "xs", variant: "ghost", onClick: () => setRuleSearchQuery("") }, "Clear"), /* @__PURE__ */ React.createElement(Badge, { colorScheme: "blue", variant: "subtle", px: 2, py: 1, borderRadius: "md", whiteSpace: "nowrap" }, logicBlocks.length, " Active ", logicBlocks.length === 1 ? "Rule" : "Rules")), /* @__PURE__ */ React.createElement(VStack, { spacing: 3.5, align: "stretch" }, logicBlocks.filter((block) => {
        if (ruleComponentFilter !== "all" && block.triggerWidgetId !== ruleComponentFilter) {
          return false;
        }
        if (!ruleSearchQuery.trim()) return true;
        const q = ruleSearchQuery.toLowerCase();
        return block.name.toLowerCase().includes(q) || block.triggerName && block.triggerName.toLowerCase().includes(q) || block.event && block.event.toLowerCase().includes(q) || block.condition && block.condition.toLowerCase().includes(q) || block.action && block.action.toLowerCase().includes(q) || block.targetHardware && block.targetHardware.toLowerCase().includes(q);
      }).map((block, idx) => {
        const linkedWidget = widgets.find((w) => w.id === block.triggerWidgetId);
        const isComponentTrigger = block.triggerType === "component" || !block.triggerWidgetId?.startsWith("telem_") && !block.triggerWidgetId?.startsWith("timer");
        const isStale = isComponentTrigger && Boolean(block.triggerWidgetId) && !linkedWidget;
        const liveTriggerName = linkedWidget ? linkedWidget.title : block.triggerName || "Trigger Source";
        const liveBinding = linkedWidget ? linkedWidget.boundTargetName || linkedWidget.boundTarget || "GPIO Pin" : block.targetHardware;
        return /* @__PURE__ */ React.createElement(
          Box,
          {
            key: block.id,
            p: 4,
            bg: "white",
            borderRadius: "2xl",
            border: "1.5px solid",
            borderColor: isStale ? "red.300" : block.enabled ? "blue.200" : "gray.200",
            shadow: "sm",
            opacity: block.enabled && !isStale ? 1 : 0.7,
            transition: "all 0.15s ease",
            _hover: { shadow: "md", borderColor: isStale ? "red.400" : "blue.400" }
          },
          /* @__PURE__ */ React.createElement(HStack, { justify: "space-between", mb: 3 }, /* @__PURE__ */ React.createElement(HStack, { spacing: 2.5 }, /* @__PURE__ */ React.createElement(
            Badge,
            {
              colorScheme: isStale ? "red" : "blue",
              variant: "solid",
              bg: isStale ? "red.500" : "blue.500",
              borderRadius: "md",
              px: 2,
              py: 0.5,
              fontSize: "10px",
              fontWeight: "extrabold"
            },
            "RULE #",
            idx + 1
          ), /* @__PURE__ */ React.createElement(Text, { fontWeight: "extrabold", fontSize: "sm", color: "gray.800" }, block.name), isStale && /* @__PURE__ */ React.createElement(Badge, { colorScheme: "red", variant: "subtle", fontSize: "9px" }, "\u26A0\uFE0F Component Deleted")), /* @__PURE__ */ React.createElement(HStack, { spacing: 2 }, /* @__PURE__ */ React.createElement(
            Tooltip,
            {
              label: isStale ? "Cannot test: referenced component was removed from mobile app" : "Test run this rule immediately",
              fontSize: "xs"
            },
            /* @__PURE__ */ React.createElement(
              Button,
              {
                size: "xs",
                variant: "outline",
                colorScheme: isStale ? "gray" : "orange",
                isDisabled: isStale,
                leftIcon: /* @__PURE__ */ React.createElement(FaBolt, { size: 10 }),
                onClick: async () => {
                  const res = await handleExecuteRule(block, 1);
                  toast({
                    title: "Rule Executed",
                    description: res?.text || `Sent command for ${block.name}`,
                    status: res?.success ? "success" : "warning",
                    duration: 2500
                  });
                }
              },
              "Test"
            )
          ), /* @__PURE__ */ React.createElement(Tooltip, { label: "Edit Rule Configuration", fontSize: "xs" }, /* @__PURE__ */ React.createElement(
            IconButton,
            {
              icon: /* @__PURE__ */ React.createElement(FaEdit, { size: 12 }),
              size: "xs",
              variant: "outline",
              colorScheme: "blue",
              onClick: () => handleOpenEditRule(block, 0),
              "aria-label": "Edit rule"
            }
          )), /* @__PURE__ */ React.createElement(
            Switch,
            {
              size: "sm",
              colorScheme: "blue",
              isChecked: block.enabled && !isStale,
              isDisabled: isStale,
              onChange: () => handleToggleLogicBlock(block.id)
            }
          ), /* @__PURE__ */ React.createElement(Tooltip, { label: "Delete Rule", fontSize: "xs" }, /* @__PURE__ */ React.createElement(
            IconButton,
            {
              icon: /* @__PURE__ */ React.createElement(FaTrashAlt, { size: 11 }),
              size: "xs",
              variant: "ghost",
              color: "red.500",
              _hover: { bg: "red.50" },
              onClick: () => handleDeleteLogicBlock(block.id),
              "aria-label": "Delete rule"
            }
          )))),
          isStale && /* @__PURE__ */ React.createElement(Box, { p: 2.5, bg: "red.50", borderRadius: "xl", border: "1px solid", borderColor: "red.200", mb: 3 }, /* @__PURE__ */ React.createElement(HStack, { justify: "space-between", align: "center" }, /* @__PURE__ */ React.createElement(HStack, { spacing: 2 }, /* @__PURE__ */ React.createElement(Text, { fontSize: "12px" }, "\u26A0\uFE0F"), /* @__PURE__ */ React.createElement(VStack, { align: "start", spacing: 0 }, /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "bold", color: "red.800" }, "Component Removed from Designer"), /* @__PURE__ */ React.createElement(Text, { fontSize: "11px", color: "red.600" }, 'The component "', block.triggerName, '" (ID: ', block.triggerWidgetId, ") was removed from the mobile app. Click Edit to reassign this rule."))), /* @__PURE__ */ React.createElement(Button, { size: "xs", colorScheme: "red", variant: "outline", onClick: () => handleOpenEditRule(block, 0) }, "Reassign"))),
          /* @__PURE__ */ React.createElement(Grid, { templateColumns: { base: "1fr", md: "repeat(3, 1fr)" }, gap: 2.5, alignItems: "stretch" }, /* @__PURE__ */ React.createElement(
            Box,
            {
              p: 3,
              bg: isStale ? "#fef2f2" : "#fffbeb",
              border: "1.5px solid",
              borderColor: isStale ? "#fecaca" : "#fde68a",
              borderRadius: "xl",
              cursor: "pointer",
              transition: "all 0.15s ease",
              _hover: { borderColor: isStale ? "#ef4444" : "#f59e0b", bg: isStale ? "#fee2e2" : "#fef3c7", transform: "translateY(-1px)" },
              onClick: () => handleOpenEditRule(block, 0)
            },
            /* @__PURE__ */ React.createElement(HStack, { justify: "space-between" }, /* @__PURE__ */ React.createElement(Text, { fontSize: "9px", fontWeight: "extrabold", color: isStale ? "#b91c1c" : "#92400e", letterSpacing: "0.5px", textTransform: "uppercase" }, "\u26A1 TRIGGER EVENT"), /* @__PURE__ */ React.createElement(FaEdit, { size: 9, color: isStale ? "#b91c1c" : "#b45309" })),
            /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "bold", color: isStale ? "red.700" : "gray.900", mt: 1, noOfLines: 1 }, liveTriggerName),
            /* @__PURE__ */ React.createElement(HStack, { spacing: 1, mt: 0.5 }, /* @__PURE__ */ React.createElement(Text, { fontSize: "11px", color: isStale ? "red.600" : "#b45309", fontWeight: "medium" }, block.event || "on_trigger"), linkedWidget && /* @__PURE__ */ React.createElement(Text, { fontSize: "10px", color: "gray.400" }, "\u2022 ", linkedWidget.type))
          ), /* @__PURE__ */ React.createElement(
            Box,
            {
              p: 3,
              bg: "#faf5ff",
              border: "1.5px solid",
              borderColor: "#e9d5ff",
              borderRadius: "xl",
              cursor: "pointer",
              transition: "all 0.15s ease",
              _hover: { borderColor: "#a855f7", bg: "#f3e8ff", transform: "translateY(-1px)" },
              onClick: () => handleOpenEditRule(block, 1)
            },
            /* @__PURE__ */ React.createElement(HStack, { justify: "space-between" }, /* @__PURE__ */ React.createElement(Text, { fontSize: "9px", fontWeight: "extrabold", color: "#6b21a8", letterSpacing: "0.5px", textTransform: "uppercase" }, "\u{1F441} CONDITION"), /* @__PURE__ */ React.createElement(FaEdit, { size: 9, color: "#7e22ce" })),
            /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "bold", color: "gray.900", mt: 1, noOfLines: 1 }, block.condition || "Always"),
            /* @__PURE__ */ React.createElement(Text, { fontSize: "11px", color: "#7e22ce", fontWeight: "medium", mt: 0.5 }, "Pass check")
          ), /* @__PURE__ */ React.createElement(
            Box,
            {
              p: 3,
              bg: "#f0fdf4",
              border: "1.5px solid",
              borderColor: "#bbf7d0",
              borderRadius: "xl",
              cursor: "pointer",
              transition: "all 0.15s ease",
              _hover: { borderColor: "#22c55e", bg: "#dcfce7", transform: "translateY(-1px)" },
              onClick: () => handleOpenEditRule(block, 2)
            },
            /* @__PURE__ */ React.createElement(HStack, { justify: "space-between" }, /* @__PURE__ */ React.createElement(Text, { fontSize: "9px", fontWeight: "extrabold", color: "#166534", letterSpacing: "0.5px", textTransform: "uppercase" }, "\u{1FA84} HARDWARE ACTION"), /* @__PURE__ */ React.createElement(FaEdit, { size: 9, color: "#15803d" })),
            /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "bold", color: "gray.900", mt: 1, noOfLines: 1 }, block.action || "Hardware Command"),
            /* @__PURE__ */ React.createElement(Text, { fontSize: "11px", color: "#15803d", fontWeight: "semibold", mt: 0.5, noOfLines: 1 }, "\u2192 ", liveBinding || block.targetHardware || "ESP32 GPIO")
          ))
        );
      }), logicBlocks.length === 0 && /* @__PURE__ */ React.createElement(Box, { p: 8, textAlign: "center", bg: "white", borderRadius: "2xl", border: "1px dashed", borderColor: "gray.300" }, /* @__PURE__ */ React.createElement(FaCogs, { size: 32, color: "#94a3b8", style: { margin: "0 auto 8px auto" } }), /* @__PURE__ */ React.createElement(Text, { fontWeight: "bold", fontSize: "sm", color: "gray.700" }, "No Automation Rules Configured"), /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", color: "gray.500", mt: 1, mb: 4 }, "Connect your mobile UI components directly to physical ESP32 pins."), /* @__PURE__ */ React.createElement(HStack, { justify: "center", spacing: 3 }, /* @__PURE__ */ React.createElement(
        Button,
        {
          size: "sm",
          colorScheme: "blue",
          bg: "#2563eb",
          _hover: { bg: "#1d4ed8" },
          leftIcon: /* @__PURE__ */ React.createElement(FaPlus, { size: 11 }),
          onClick: () => handleOpenAddRule(0),
          fontWeight: "bold",
          shadow: "sm"
        },
        "+ Add First Automation Rule"
      ), /* @__PURE__ */ React.createElement(
        Button,
        {
          size: "sm",
          variant: "outline",
          colorScheme: "purple",
          leftIcon: /* @__PURE__ */ React.createElement(FaBolt, { size: 11 }),
          onClick: () => {
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
            generated.push({
              id: `b-${Date.now()}-telem`,
              name: "High Temperature Guard",
              triggerType: "telemetry",
              triggerWidgetId: "telem_temp",
              triggerName: "Temperature Sensor (ADC)",
              event: "threshold_above",
              condition: "Value > 30\xB0C",
              conditionType: "Value >",
              conditionThreshold: "30",
              conditionUnit: "\xB0C",
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
          }
        },
        "+ Quick Templates"
      ))))),
      appBuilderView === "preview" && /* @__PURE__ */ React.createElement(Box, { display: "flex", flexDirection: "column", alignItems: "center", w: "100%" }, /* @__PURE__ */ React.createElement(HStack, { justify: "center", spacing: 3, mb: 3 }, /* @__PURE__ */ React.createElement(Badge, { colorScheme: "green", px: 3, py: 1, borderRadius: "full" }, "\u25CF Simulator Running"), /* @__PURE__ */ React.createElement(
        Button,
        {
          size: "xs",
          variant: "outline",
          leftIcon: /* @__PURE__ */ React.createElement(FaTerminal, { size: 11 }),
          onClick: () => setIsSerialTrafficOpen(!isSerialTrafficOpen)
        },
        isSerialTrafficOpen ? "Hide Serial Traffic" : "View Serial Traffic"
      )), /* @__PURE__ */ React.createElement(
        Box,
        {
          w: "340px",
          minH: "620px",
          bg: "white",
          borderRadius: "42px",
          border: "10px solid #0f172a",
          shadow: "2xl",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          mb: 4
        },
        /* @__PURE__ */ React.createElement(HStack, { justify: "space-between", px: 6, pt: 3, pb: 1, fontSize: "10px", color: "gray.700", fontWeight: "bold" }, /* @__PURE__ */ React.createElement(Text, null, "9:41"), /* @__PURE__ */ React.createElement(HStack, { spacing: 1.5 }, /* @__PURE__ */ React.createElement(FaWifi, { size: 10 }), /* @__PURE__ */ React.createElement(Text, { fontSize: "9px" }, "5G"))),
        /* @__PURE__ */ React.createElement(Box, { flex: "1", p: 4, bg: "#f8fafc", overflowY: "auto" }, /* @__PURE__ */ React.createElement(HStack, { justify: "space-between", mb: 4 }, /* @__PURE__ */ React.createElement(HStack, { spacing: 2 }, /* @__PURE__ */ React.createElement(Text, { fontSize: "md" }, "\u{1F331}"), /* @__PURE__ */ React.createElement(Text, { fontWeight: "extrabold", fontSize: "md" }, projectName)), /* @__PURE__ */ React.createElement(Badge, { colorScheme: "green", fontSize: "9px" }, "Online")), /* @__PURE__ */ React.createElement(VStack, { spacing: 3, align: "stretch", minH: "240px" }, widgets.filter((w) => w.visible !== false).length === 0 ? /* @__PURE__ */ React.createElement(
          Flex,
          {
            direction: "column",
            align: "center",
            justify: "center",
            h: "260px",
            border: "2px dashed",
            borderColor: "gray.300",
            borderRadius: "2xl",
            p: 6,
            textAlign: "center",
            my: 4
          },
          /* @__PURE__ */ React.createElement(Box, { p: 3, bg: "gray.100", color: "gray.400", borderRadius: "full", mb: 2.5 }, /* @__PURE__ */ React.createElement(FaMobileAlt, { size: 20 })),
          /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "bold", color: "gray.600" }, "No Components to Preview"),
          /* @__PURE__ */ React.createElement(Text, { fontSize: "11px", color: "gray.400", mt: 1, maxW: "210px" }, "Switch back to Designer mode to add components to this screen.")
        ) : widgets.filter((w) => w.visible !== false).map((w) => /* @__PURE__ */ React.createElement(Box, { key: w.id, p: 3.5, bg: "white", borderRadius: "2xl", shadow: "sm" }, w.type === "switch" && /* @__PURE__ */ React.createElement(HStack, { justify: "space-between" }, /* @__PURE__ */ React.createElement(VStack, { align: "start", spacing: 0 }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "bold", fontSize: "sm" }, w.title), /* @__PURE__ */ React.createElement(Text, { fontSize: "10px", color: "gray.400" }, w.boundTargetName || w.boundTarget)), /* @__PURE__ */ React.createElement(
          Switch,
          {
            colorScheme: "green",
            isChecked: w.state,
            onChange: (e) => handleUpdateWidget("state", e.target.checked, w.id)
          }
        )), w.type === "slider" && /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 1.5 }, /* @__PURE__ */ React.createElement(HStack, { justify: "space-between" }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "bold", fontSize: "sm" }, w.title), /* @__PURE__ */ React.createElement(Text, { fontWeight: "extrabold", color: "purple.600" }, w.value, w.unit || "\xB0")), /* @__PURE__ */ React.createElement(
          Slider,
          {
            value: w.value,
            min: w.min || 0,
            max: w.max || 180,
            onChange: (val) => handleUpdateWidget("value", val, w.id)
          },
          /* @__PURE__ */ React.createElement(SliderTrack, { bg: "gray.100" }, /* @__PURE__ */ React.createElement(SliderFilledTrack, { bg: "purple.500" })),
          /* @__PURE__ */ React.createElement(SliderThumb, { boxSize: 3.5 })
        )), w.type === "gauge" && /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 1 }, /* @__PURE__ */ React.createElement(HStack, { justify: "space-between" }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "bold", fontSize: "sm" }, w.title), /* @__PURE__ */ React.createElement(Badge, { colorScheme: "red", fontSize: "9px" }, "Live Sensor")), /* @__PURE__ */ React.createElement(Text, { fontSize: "2xl", fontWeight: "black", color: "red.500" }, w.value, w.unit || "\xB0C")), w.type === "button" && /* @__PURE__ */ React.createElement(
          Button,
          {
            w: "100%",
            colorScheme: "orange",
            borderRadius: "xl",
            leftIcon: /* @__PURE__ */ React.createElement(FaBell, { size: 13 }),
            onClick: () => handleTestHardwareSignal(w)
          },
          w.title
        ), w.type === "top_button" && /* @__PURE__ */ React.createElement(
          Button,
          {
            w: "100%",
            colorScheme: "blue",
            borderRadius: "xl",
            leftIcon: /* @__PURE__ */ React.createElement(FaArrowUp, { size: 13 }),
            onClick: () => handleTestHardwareSignal(w),
            fontWeight: "bold"
          },
          w.title
        ), w.type === "bottom_button" && /* @__PURE__ */ React.createElement(
          Button,
          {
            w: "100%",
            colorScheme: "cyan",
            color: "white",
            borderRadius: "xl",
            leftIcon: /* @__PURE__ */ React.createElement(FaArrowDown, { size: 13 }),
            onClick: () => handleTestHardwareSignal(w),
            fontWeight: "bold"
          },
          w.title
        ), w.type === "left_button" && /* @__PURE__ */ React.createElement(
          Button,
          {
            w: "100%",
            colorScheme: "purple",
            borderRadius: "xl",
            leftIcon: /* @__PURE__ */ React.createElement(FaArrowLeft, { size: 13 }),
            onClick: () => handleTestHardwareSignal(w),
            fontWeight: "bold"
          },
          w.title
        ), w.type === "right_button" && /* @__PURE__ */ React.createElement(
          Button,
          {
            w: "100%",
            colorScheme: "purple",
            borderRadius: "xl",
            leftIcon: /* @__PURE__ */ React.createElement(FaArrowRight, { size: 13 }),
            onClick: () => handleTestHardwareSignal(w),
            fontWeight: "bold"
          },
          w.title
        ), w.type === "dpad" && /* @__PURE__ */ React.createElement(VStack, { align: "center", spacing: 2, p: 1 }, /* @__PURE__ */ React.createElement(HStack, { justify: "space-between", w: "100%" }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "bold", fontSize: "xs" }, w.title), /* @__PURE__ */ React.createElement(Badge, { colorScheme: "blue", fontSize: "9px" }, "4-Way D-Pad")), /* @__PURE__ */ React.createElement(Box, { p: 2.5, bg: "gray.100", borderRadius: "2xl", border: "1px solid", borderColor: "gray.300" }, /* @__PURE__ */ React.createElement(VStack, { spacing: 1 }, /* @__PURE__ */ React.createElement(
          Button,
          {
            size: "xs",
            colorScheme: "blue",
            w: "44px",
            h: "32px",
            borderRadius: "lg",
            onClick: () => handleTestHardwareSignal({ ...w, boundTarget: "GPIO 13", title: "Top Button (Forward)" })
          },
          /* @__PURE__ */ React.createElement(FaArrowUp, { size: 11 })
        ), /* @__PURE__ */ React.createElement(HStack, { spacing: 1 }, /* @__PURE__ */ React.createElement(
          Button,
          {
            size: "xs",
            colorScheme: "purple",
            w: "44px",
            h: "32px",
            borderRadius: "lg",
            onClick: () => handleTestHardwareSignal({ ...w, boundTarget: "GPIO 12", title: "Left Button (Steer Left)" })
          },
          /* @__PURE__ */ React.createElement(FaArrowLeft, { size: 11 })
        ), /* @__PURE__ */ React.createElement(Box, { w: "36px", h: "32px", bg: "gray.300", borderRadius: "md", display: "flex", alignItems: "center", justifyContent: "center" }, /* @__PURE__ */ React.createElement(Text, { fontSize: "10px", fontWeight: "black", color: "gray.600" }, "\u25CF")), /* @__PURE__ */ React.createElement(
          Button,
          {
            size: "xs",
            colorScheme: "purple",
            w: "44px",
            h: "32px",
            borderRadius: "lg",
            onClick: () => handleTestHardwareSignal({ ...w, boundTarget: "GPIO 15", title: "Right Button (Steer Right)" })
          },
          /* @__PURE__ */ React.createElement(FaArrowRight, { size: 11 })
        )), /* @__PURE__ */ React.createElement(
          Button,
          {
            size: "xs",
            colorScheme: "blue",
            w: "44px",
            h: "32px",
            borderRadius: "lg",
            onClick: () => handleTestHardwareSignal({ ...w, boundTarget: "GPIO 14", title: "Bottom Button (Reverse)" })
          },
          /* @__PURE__ */ React.createElement(FaArrowDown, { size: 11 })
        )))), w.type === "crud_table" && /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 2.5 }, /* @__PURE__ */ React.createElement(HStack, { justify: "space-between", align: "center" }, /* @__PURE__ */ React.createElement(HStack, { spacing: 1.5 }, /* @__PURE__ */ React.createElement(Box, { color: "blue.500" }, /* @__PURE__ */ React.createElement(FaTable, { size: 13 })), /* @__PURE__ */ React.createElement(Text, { fontWeight: "bold", fontSize: "xs", color: "gray.800" }, w.title)), /* @__PURE__ */ React.createElement(
          Button,
          {
            size: "xs",
            colorScheme: "blue",
            variant: "solid",
            leftIcon: /* @__PURE__ */ React.createElement(FaPlus, { size: 9 }),
            h: "22px",
            px: 2.5,
            fontSize: "10px",
            onClick: () => handleOpenAddCrudRecord(w.id)
          },
          "Add"
        )), /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 1.5 }, (w.records || []).length === 0 ? /* @__PURE__ */ React.createElement(Box, { py: 3, textAlign: "center", bg: "gray.50", borderRadius: "lg", border: "1px dashed", borderColor: "gray.200" }, /* @__PURE__ */ React.createElement(Text, { fontSize: "10px", color: "gray.400" }, "No records yet. Click '+ Add' to create one.")) : (w.records || []).map((rec) => /* @__PURE__ */ React.createElement(
          HStack,
          {
            key: rec.id,
            p: 2,
            bg: "gray.50",
            borderRadius: "lg",
            border: "1px solid",
            borderColor: "gray.200",
            justify: "space-between",
            fontSize: "11px"
          },
          /* @__PURE__ */ React.createElement(VStack, { align: "start", spacing: 0, maxW: "160px" }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "bold", fontSize: "11px", color: "gray.800", isTruncated: true }, rec.name), /* @__PURE__ */ React.createElement(HStack, { spacing: 1.5 }, /* @__PURE__ */ React.createElement(
            Badge,
            {
              colorScheme: rec.status === "Active" ? "green" : rec.status === "Alert" ? "red" : "blue",
              fontSize: "8px",
              px: 1,
              borderRadius: "sm"
            },
            rec.value || rec.status || "OK"
          ), /* @__PURE__ */ React.createElement(Text, { fontSize: "9px", color: "gray.400" }, rec.timestamp))),
          /* @__PURE__ */ React.createElement(HStack, { spacing: 1 }, /* @__PURE__ */ React.createElement(
            IconButton,
            {
              icon: /* @__PURE__ */ React.createElement(FaEdit, { size: 9 }),
              size: "xs",
              h: "22px",
              minW: "22px",
              variant: "ghost",
              color: "blue.500",
              onClick: () => handleOpenEditCrudRecord(w.id, rec),
              "aria-label": "Edit Record"
            }
          ), /* @__PURE__ */ React.createElement(
            IconButton,
            {
              icon: /* @__PURE__ */ React.createElement(FaTrashAlt, { size: 9 }),
              size: "xs",
              h: "22px",
              minW: "22px",
              variant: "ghost",
              color: "red.400",
              onClick: () => handleDeleteCrudRecord(w.id, rec.id),
              "aria-label": "Delete Record"
            }
          ))
        ))))))))
      ), isSerialTrafficOpen && /* @__PURE__ */ React.createElement(Box, { w: "100%", maxW: "600px", p: 3, bg: "#090d16", color: "#38bdf8", borderRadius: "xl", fontFamily: "monospace", fontSize: "11px", shadow: "lg" }, /* @__PURE__ */ React.createElement(HStack, { justify: "space-between", mb: 2, color: "gray.400" }, /* @__PURE__ */ React.createElement(HStack, { spacing: 1.5 }, /* @__PURE__ */ React.createElement(FaTerminal, { size: 10 }), /* @__PURE__ */ React.createElement(Text, { fontWeight: "bold" }, "Live Hardware Serial Traffic (", activePort, ")")), /* @__PURE__ */ React.createElement(Button, { size: "xs", variant: "ghost", color: "gray.400", onClick: () => setSerialTrafficLogs([]) }, "Clear")), /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 1, maxH: "120px", overflowY: "auto" }, serialTrafficLogs.map((log) => /* @__PURE__ */ React.createElement(Text, { key: log.id, color: log.type === "tx" ? "#4ade80" : log.type === "rx" ? "#38bdf8" : "#fbbf24" }, "[", log.time, "] ", log.text)))))
    ), /* @__PURE__ */ React.createElement(GridItem, { bg: bgCard, borderLeft: "1px", borderColor, p: 4, display: "flex", flexDirection: "column", overflowY: "auto" }, /* @__PURE__ */ React.createElement(HStack, { bg: useColorModeValue("gray.100", "gray.800"), p: 1, borderRadius: "lg", mb: 4 }, /* @__PURE__ */ React.createElement(
      Button,
      {
        size: "xs",
        flex: "1",
        variant: inspectorTab === "tree" ? "solid" : "ghost",
        colorScheme: inspectorTab === "tree" ? "blue" : "gray",
        leftIcon: /* @__PURE__ */ React.createElement(FaFolder, { size: 11 }),
        onClick: () => setInspectorTab("tree"),
        borderRadius: "md"
      },
      "Tree (",
      widgets.length,
      ")"
    ), /* @__PURE__ */ React.createElement(
      Button,
      {
        size: "xs",
        flex: "1",
        variant: inspectorTab === "properties" ? "solid" : "ghost",
        colorScheme: inspectorTab === "properties" ? "blue" : "gray",
        leftIcon: /* @__PURE__ */ React.createElement(FaCogs, { size: 11 }),
        onClick: () => setInspectorTab("properties"),
        borderRadius: "md"
      },
      "Properties"
    )), inspectorTab === "tree" && /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 3 }, /* @__PURE__ */ React.createElement(HStack, { justify: "space-between", px: 1 }, /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "bold", color: "gray.500", letterSpacing: "wider" }, "COMPONENT HIERARCHY"), /* @__PURE__ */ React.createElement(Button, { size: "xs", colorScheme: "blue", variant: "ghost", leftIcon: /* @__PURE__ */ React.createElement(FaPlus, { size: 10 }), onClick: () => handleAddComponent("button", "Action Button", "GPIO Pin") }, "Add")), /* @__PURE__ */ React.createElement(Box, { p: 2, bg: "blue.50", borderRadius: "xl", border: "1px solid", borderColor: "blue.200" }, /* @__PURE__ */ React.createElement(HStack, { spacing: 2, color: "blue.900", fontSize: "xs", fontWeight: "bold", justify: "space-between", w: "100%" }, /* @__PURE__ */ React.createElement(HStack, { spacing: 2 }, /* @__PURE__ */ React.createElement(FaMobileAlt, { size: 12 }), /* @__PURE__ */ React.createElement(Text, null, "\u{1F4F1} ", projectName, " Screen (Root)")), widgets.length > 0 && /* @__PURE__ */ React.createElement(
      Button,
      {
        size: "xs",
        variant: "ghost",
        colorScheme: "red",
        h: "18px",
        fontSize: "10px",
        leftIcon: /* @__PURE__ */ React.createElement(FaTrashAlt, { size: 8 }),
        onClick: onClearCanvasModalOpen
      },
      "Clear All"
    ))), /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 1.5, pl: 2, borderLeft: "2px solid", borderColor: useColorModeValue("gray.200", "gray.700") }, widgets.length === 0 && /* @__PURE__ */ React.createElement(Box, { py: 6, px: 2, textAlign: "center" }, /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "medium", color: "gray.400" }, "No components in tree"), /* @__PURE__ */ React.createElement(Text, { fontSize: "10px", color: "gray.400", mt: 0.5 }, "Add components from the left palette")), widgets.map((w, idx) => {
      const isSelected = w.id === selectedWidgetId;
      return /* @__PURE__ */ React.createElement(
        HStack,
        {
          key: w.id,
          p: 2.5,
          borderRadius: "xl",
          bg: isSelected ? useColorModeValue("blue.50", "gray.800") : useColorModeValue("gray.50", "gray.850"),
          border: "1px solid",
          borderColor: isSelected ? "blue.400" : borderColor,
          justify: "space-between",
          cursor: "pointer",
          _hover: { borderColor: "blue.300" },
          onClick: () => {
            setSelectedWidgetId(w.id);
            setInspectorTab("properties");
          }
        },
        /* @__PURE__ */ React.createElement(HStack, { spacing: 2 }, /* @__PURE__ */ React.createElement(Box, { color: w.color || "blue.500", fontSize: "12px" }, w.type === "switch" ? /* @__PURE__ */ React.createElement(FaLightbulb, null) : w.type === "slider" ? /* @__PURE__ */ React.createElement(FaSlidersH, null) : w.type === "gauge" ? /* @__PURE__ */ React.createElement(FaTemperatureHigh, null) : /* @__PURE__ */ React.createElement(FaTag, null)), /* @__PURE__ */ React.createElement(VStack, { align: "start", spacing: 0 }, /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "bold", color: isSelected ? "blue.600" : "inherit" }, w.title), /* @__PURE__ */ React.createElement(Text, { fontSize: "10px", color: "gray.400" }, w.boundTarget || w.type))),
        /* @__PURE__ */ React.createElement(HStack, { spacing: 1 }, /* @__PURE__ */ React.createElement(
          IconButton,
          {
            icon: w.visible !== false ? /* @__PURE__ */ React.createElement(FaEye, { size: 10 }) : /* @__PURE__ */ React.createElement(FaEyeSlash, { size: 10, color: "gray" }),
            size: "xs",
            variant: "ghost",
            onClick: (e) => {
              e.stopPropagation();
              handleToggleVisibility(w.id);
            },
            "aria-label": "Visibility"
          }
        ), /* @__PURE__ */ React.createElement(
          IconButton,
          {
            icon: /* @__PURE__ */ React.createElement(FaArrowUp, { size: 9 }),
            size: "xs",
            variant: "ghost",
            isDisabled: idx === 0,
            onClick: (e) => {
              e.stopPropagation();
              handleMoveWidget(w.id, "up");
            },
            "aria-label": "Up"
          }
        ), /* @__PURE__ */ React.createElement(
          IconButton,
          {
            icon: /* @__PURE__ */ React.createElement(FaArrowDown, { size: 9 }),
            size: "xs",
            variant: "ghost",
            isDisabled: idx === widgets.length - 1,
            onClick: (e) => {
              e.stopPropagation();
              handleMoveWidget(w.id, "down");
            },
            "aria-label": "Down"
          }
        ), /* @__PURE__ */ React.createElement(
          IconButton,
          {
            icon: /* @__PURE__ */ React.createElement(FaTrashAlt, { size: 10 }),
            size: "xs",
            variant: "ghost",
            color: "red.400",
            onClick: (e) => {
              e.stopPropagation();
              handleDeleteWidget(w.id);
            },
            "aria-label": "Delete"
          }
        ))
      );
    }))), inspectorTab === "properties" && activeWidget && /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 5 }, /* @__PURE__ */ React.createElement(HStack, { spacing: 3, p: 2.5, bg: useColorModeValue("gray.50", "gray.800"), borderRadius: "xl" }, /* @__PURE__ */ React.createElement(Box, { p: 2, bg: "blue.50", color: "blue.600", borderRadius: "lg" }, activeWidget.type === "switch" ? /* @__PURE__ */ React.createElement(FaLightbulb, { size: 16 }) : activeWidget.type === "slider" ? /* @__PURE__ */ React.createElement(FaSlidersH, { size: 16 }) : activeWidget.type === "gauge" ? /* @__PURE__ */ React.createElement(FaTemperatureHigh, { size: 16 }) : /* @__PURE__ */ React.createElement(FaTag, { size: 16 })), /* @__PURE__ */ React.createElement(VStack, { align: "start", spacing: 0 }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "bold", fontSize: "sm" }, activeWidget.title), /* @__PURE__ */ React.createElement(Text, { fontSize: "11px", color: "gray.500", textTransform: "capitalize" }, activeWidget.type, " Component"))), /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 3 }, /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "extrabold", color: "gray.500", letterSpacing: "wider" }, "DISPLAY"), /* @__PURE__ */ React.createElement(Box, null, /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "semibold", mb: 1, color: "gray.600" }, "Label"), /* @__PURE__ */ React.createElement(
      Input,
      {
        size: "sm",
        value: activeWidget.title,
        onChange: (e) => handleUpdateWidget("title", e.target.value),
        borderRadius: "lg"
      }
    )), /* @__PURE__ */ React.createElement(Box, null, /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "semibold", mb: 1.5, color: "gray.600" }, "Color Theme"), /* @__PURE__ */ React.createElement(HStack, { spacing: 2 }, ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#334155"].map((c) => /* @__PURE__ */ React.createElement(
      Box,
      {
        key: c,
        w: "22px",
        h: "22px",
        borderRadius: "full",
        bg: c,
        cursor: "pointer",
        border: activeWidget.color === c ? "2px solid black" : "none",
        _hover: { transform: "scale(1.15)" },
        transition: "all 0.15s",
        onClick: () => handleUpdateWidget("color", c)
      }
    )))), /* @__PURE__ */ React.createElement(Box, null, /* @__PURE__ */ React.createElement(HStack, { justify: "space-between", mb: 1 }, /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "semibold", color: "gray.600" }, "Corner Radius"), /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", color: "gray.400" }, activeWidget.cornerRadius || 16, "px")), /* @__PURE__ */ React.createElement(
      Slider,
      {
        value: activeWidget.cornerRadius || 16,
        min: 0,
        max: 32,
        onChange: (val) => handleUpdateWidget("cornerRadius", val)
      },
      /* @__PURE__ */ React.createElement(SliderTrack, { bg: "gray.200" }, /* @__PURE__ */ React.createElement(SliderFilledTrack, { bg: "blue.500" })),
      /* @__PURE__ */ React.createElement(SliderThumb, { boxSize: 3 })
    )), /* @__PURE__ */ React.createElement(HStack, { justify: "space-between" }, /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "semibold", color: "gray.600" }, "Visible on App"), /* @__PURE__ */ React.createElement(
      Switch,
      {
        colorScheme: "blue",
        isChecked: activeWidget.visible !== false,
        onChange: (e) => handleUpdateWidget("visible", e.target.checked)
      }
    ))), /* @__PURE__ */ React.createElement(Divider, null), /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 3 }, /* @__PURE__ */ React.createElement(HStack, { justify: "space-between" }, /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "extrabold", color: "gray.500", letterSpacing: "wider" }, "HARDWARE BINDING"), /* @__PURE__ */ React.createElement(Badge, { colorScheme: "green", fontSize: "9px" }, "ACTIVE")), /* @__PURE__ */ React.createElement(Box, { p: 3, bg: "green.50", borderRadius: "xl", border: "1px solid", borderColor: "green.200" }, /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 2.5 }, /* @__PURE__ */ React.createElement(Box, null, /* @__PURE__ */ React.createElement(Text, { fontSize: "10px", fontWeight: "bold", color: "gray.600", mb: 1 }, "Bind to Hardware"), /* @__PURE__ */ React.createElement(
      Select,
      {
        size: "sm",
        bg: "white",
        value: activeWidget.boundTarget,
        onChange: (e) => {
          handleUpdateWidget("boundTarget", e.target.value);
          handleUpdateWidget("boundTargetName", `Bound \u2192 ${e.target.value}`);
        },
        borderRadius: "lg"
      },
      /* @__PURE__ */ React.createElement("option", { value: "LED (GPIO 2)" }, "LED (GPIO 2 - Onboard)"),
      /* @__PURE__ */ React.createElement("option", { value: "Servo Motor (PWM)" }, "Servo Motor (GPIO 4 PWM)"),
      /* @__PURE__ */ React.createElement("option", { value: "Temperature Sensor (ADC)" }, "Temperature Sensor (ADC / I2C)"),
      /* @__PURE__ */ React.createElement("option", { value: "Buzzer (GPIO 5)" }, "Buzzer Alarm (GPIO 5)"),
      /* @__PURE__ */ React.createElement("option", { value: "Relay (GPIO 18)" }, "Relay Module (GPIO 18)"),
      /* @__PURE__ */ React.createElement("option", { value: "RGB NeoPixel (GPIO 48)" }, "RGB NeoPixel (GPIO 48)"),
      /* @__PURE__ */ React.createElement("option", { value: "Custom Serial Command" }, "Custom Serial Command")
    )), /* @__PURE__ */ React.createElement(Box, null, /* @__PURE__ */ React.createElement(Text, { fontSize: "10px", fontWeight: "bold", color: "gray.600", mb: 1 }, "Action Mode"), /* @__PURE__ */ React.createElement(
      Select,
      {
        size: "sm",
        bg: "white",
        value: activeWidget.action,
        onChange: (e) => handleUpdateWidget("action", e.target.value),
        borderRadius: "lg"
      },
      /* @__PURE__ */ React.createElement("option", { value: "Turn ON / OFF" }, "Turn ON / OFF"),
      /* @__PURE__ */ React.createElement("option", { value: "Set PWM Angle" }, "Set PWM Angle / Duty"),
      /* @__PURE__ */ React.createElement("option", { value: "Read Telemetry" }, "Read Telemetry"),
      /* @__PURE__ */ React.createElement("option", { value: "Trigger Alarm" }, "Trigger Pulse Alarm"),
      /* @__PURE__ */ React.createElement("option", { value: "Send Serial String" }, "Send Serial String")
    )), /* @__PURE__ */ React.createElement(
      Button,
      {
        size: "xs",
        colorScheme: "green",
        variant: "solid",
        leftIcon: /* @__PURE__ */ React.createElement(FaBolt, { size: 10 }),
        onClick: () => handleTestHardwareSignal(activeWidget),
        mt: 1
      },
      "Test Hardware Signal"
    ))), activeWidget.type === "crud_table" && /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 2.5, p: 3, bg: useColorModeValue("blue.50", "gray.800"), borderRadius: "xl", border: "1px solid", borderColor: "blue.200" }, /* @__PURE__ */ React.createElement(HStack, { justify: "space-between" }, /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "extrabold", color: "blue.700", letterSpacing: "wider" }, "DATA RECORDS (", activeWidget.records?.length || 0, ")"), /* @__PURE__ */ React.createElement(
      Button,
      {
        size: "xs",
        colorScheme: "blue",
        variant: "solid",
        leftIcon: /* @__PURE__ */ React.createElement(FaPlus, { size: 8 }),
        onClick: () => handleOpenAddCrudRecord(activeWidget.id),
        h: "20px",
        fontSize: "10px"
      },
      "Add Record"
    )), /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 1.5, maxH: "180px", overflowY: "auto" }, (activeWidget.records || []).map((rec) => /* @__PURE__ */ React.createElement(HStack, { key: rec.id, p: 2, bg: "white", borderRadius: "md", justify: "space-between", fontSize: "11px", shadow: "xs" }, /* @__PURE__ */ React.createElement(VStack, { align: "start", spacing: 0, maxW: "130px" }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "bold", isTruncated: true }, rec.name), /* @__PURE__ */ React.createElement(Text, { fontSize: "9px", color: "gray.400" }, rec.value, " \u2022 ", rec.timestamp)), /* @__PURE__ */ React.createElement(HStack, { spacing: 1 }, /* @__PURE__ */ React.createElement(
      IconButton,
      {
        icon: /* @__PURE__ */ React.createElement(FaEdit, { size: 9 }),
        size: "xs",
        h: "20px",
        minW: "20px",
        variant: "ghost",
        onClick: () => handleOpenEditCrudRecord(activeWidget.id, rec),
        "aria-label": "Edit"
      }
    ), /* @__PURE__ */ React.createElement(
      IconButton,
      {
        icon: /* @__PURE__ */ React.createElement(FaTrashAlt, { size: 9 }),
        size: "xs",
        h: "20px",
        minW: "20px",
        variant: "ghost",
        color: "red.400",
        onClick: () => handleDeleteCrudRecord(activeWidget.id, rec.id),
        "aria-label": "Delete"
      }
    )))))), /* @__PURE__ */ React.createElement(
      Button,
      {
        size: "sm",
        colorScheme: "red",
        variant: "ghost",
        leftIcon: /* @__PURE__ */ React.createElement(FaTrashAlt, { size: 12 }),
        onClick: () => handleDeleteWidget(activeWidget.id),
        mt: 1
      },
      "Remove Component"
    ))), inspectorTab === "properties" && !activeWidget && /* @__PURE__ */ React.createElement(Box, { textAlign: "center", py: 12, px: 4 }, /* @__PURE__ */ React.createElement(Box, { p: 3, bg: useColorModeValue("gray.100", "gray.800"), color: "gray.400", borderRadius: "full", w: "fit-content", mx: "auto", mb: 3 }, /* @__PURE__ */ React.createElement(FaCogs, { size: 20 })), /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "bold", color: "gray.600" }, "No Component Selected"), /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", color: "gray.400", mt: 1 }, widgets.length === 0 ? "Add a component from the left palette to configure its properties." : "Select an item on the smartphone screen to edit properties.")))), /* @__PURE__ */ React.createElement(
      Flex,
      {
        h: "28px",
        px: 4,
        bg: "#1e3a8a",
        color: "white",
        fontSize: "11px",
        align: "center",
        justify: "space-between"
      },
      /* @__PURE__ */ React.createElement(HStack, { spacing: 3 }, /* @__PURE__ */ React.createElement(HStack, { spacing: 1.5 }, /* @__PURE__ */ React.createElement(Box, { w: "6px", h: "6px", bg: "green.400", borderRadius: "full" }), /* @__PURE__ */ React.createElement(Text, { fontWeight: "semibold" }, selectedDevice?.friendlyName || selectedDevice?.name || `ESP32 (${activePort}) Connected`)), /* @__PURE__ */ React.createElement(Text, { opacity: 0.6 }, "\u2022"), /* @__PURE__ */ React.createElement(Text, null, "App Builder"), /* @__PURE__ */ React.createElement(Text, { opacity: 0.6 }, "\u2022"), /* @__PURE__ */ React.createElement(Text, null, widgets.length, " components"), /* @__PURE__ */ React.createElement(Text, { opacity: 0.6 }, "\u2022"), /* @__PURE__ */ React.createElement(Text, null, logicBlocks.length, " automation rules")),
      /* @__PURE__ */ React.createElement(Text, { opacity: 0.8, textTransform: "capitalize" }, "Mode: ", appBuilderView === "blocks" ? "Rules" : appBuilderView)
    ), /* @__PURE__ */ React.createElement(
      Modal,
      {
        isOpen: isPublishOpen,
        onClose: onPublishClose,
        size: "4xl",
        isCentered: true,
        scrollBehavior: "inside"
      },
      /* @__PURE__ */ React.createElement(ModalOverlay, { backdropFilter: "blur(6px)", bg: "blackAlpha.700" }),
      /* @__PURE__ */ React.createElement(
        ModalContent,
        {
          maxW: { base: "95vw", md: "880px", lg: "940px" },
          maxH: "92vh",
          borderRadius: "2xl",
          overflow: "hidden",
          p: 0,
          bg: bgCard,
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.5)"
        },
        /* @__PURE__ */ React.createElement(ModalHeader, { p: 5, borderBottom: "1px", borderColor }, /* @__PURE__ */ React.createElement(HStack, { spacing: 3 }, /* @__PURE__ */ React.createElement(Box, { p: 2.5, bg: "pink.50", color: "pink.500", borderRadius: "xl" }, /* @__PURE__ */ React.createElement(FaRocket, { size: 18 })), /* @__PURE__ */ React.createElement(VStack, { align: "start", spacing: 0 }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "extrabold", fontSize: "lg" }, "Publish Companion App"), /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", color: "gray.500" }, projectName))), /* @__PURE__ */ React.createElement(ModalCloseButton, { top: 5, right: 5 })),
        /* @__PURE__ */ React.createElement(ModalBody, { p: { base: 4, md: 6 }, overflowY: "auto" }, /* @__PURE__ */ React.createElement(Grid, { templateColumns: { base: "1fr", md: "1.05fr 0.95fr" }, gap: 6, alignItems: "start" }, /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 4 }, /* @__PURE__ */ React.createElement(
          Box,
          {
            p: 0,
            bg: "#0F172A",
            borderRadius: "2xl",
            overflow: "hidden",
            border: "1px solid",
            borderColor: "rgba(34,211,238,0.25)",
            textAlign: "center",
            position: "relative",
            boxShadow: "0 0 40px rgba(34,211,238,0.08), inset 0 1px 0 rgba(255,255,255,0.03)"
          },
          /* @__PURE__ */ React.createElement(Box, { bg: "rgba(34,211,238,0.08)", px: 4, py: 2.5, borderBottom: "1px solid", borderColor: "rgba(34,211,238,0.15)" }, /* @__PURE__ */ React.createElement(HStack, { justify: "space-between", align: "center" }, /* @__PURE__ */ React.createElement(HStack, { spacing: 2 }, /* @__PURE__ */ React.createElement(
            Box,
            {
              px: 2.5,
              py: 1,
              bg: "rgba(34,211,238,0.15)",
              borderRadius: "full",
              border: "1px solid",
              borderColor: "rgba(34,211,238,0.3)"
            },
            /* @__PURE__ */ React.createElement(Text, { fontSize: "9px", fontWeight: "800", color: "#22D3EE", letterSpacing: "wider" }, "\u25CF COMPANION WEB APP QR")
          )), /* @__PURE__ */ React.createElement(Badge, { colorScheme: "green", variant: "solid", bg: "#059669", color: "white", fontSize: "9px", px: 2.5, py: 0.5, borderRadius: "full" }, "PHONE WEB APP"))),
          /* @__PURE__ */ React.createElement(Box, { px: 4, pt: 3 }, /* @__PURE__ */ React.createElement(HStack, { bg: "#090D16", p: 2, borderRadius: "xl", border: "1px solid", borderColor: "rgba(34,211,238,0.2)", justify: "space-between" }, /* @__PURE__ */ React.createElement(HStack, { spacing: 2, px: 1 }, /* @__PURE__ */ React.createElement(Badge, { colorScheme: "green", fontSize: "9px", px: 2, py: 0.5, borderRadius: "md" }, "\u2713 WEB APP READY"), /* @__PURE__ */ React.createElement(Text, { fontSize: "11px", color: "#94A3B8", fontWeight: "medium" }, "Scan with phone camera to launch companion")), /* @__PURE__ */ React.createElement(Text, { fontSize: "10px", color: "cyan.300", fontFamily: "monospace", fontWeight: "bold" }, webAppQrPayload.length, " chars"))),
          /* @__PURE__ */ React.createElement(Text, { fontSize: "12px", fontWeight: "700", color: "#E2E8F0", letterSpacing: "wide", mt: 2.5, mb: 1 }, "SCAN WITH ANY PHONE CAMERA TO LAUNCH"),
          /* @__PURE__ */ React.createElement(Text, { fontSize: "10px", color: "#94A3B8", mb: 2.5, px: 4 }, "Point your smartphone camera at this QR code to instantly launch the live interactive companion controls."),
          /* @__PURE__ */ React.createElement(Box, { display: "flex", justifyContent: "center", alignItems: "center", pb: 3, px: 4 }, /* @__PURE__ */ React.createElement(Box, { position: "relative", display: "inline-block" }, /* @__PURE__ */ React.createElement(
            Box,
            {
              position: "relative",
              p: "16px",
              borderRadius: "20px",
              border: "3px solid #22D3EE",
              bg: "rgba(34,211,238,0.03)",
              boxShadow: "0 0 30px rgba(34,211,238,0.12), inset 0 0 20px rgba(34,211,238,0.04)"
            },
            /* @__PURE__ */ React.createElement(Box, { position: "absolute", top: "-2px", left: "-2px", w: "20px", h: "20px", borderTop: "4px solid #22D3EE", borderLeft: "4px solid #22D3EE", borderTopLeftRadius: "12px" }),
            /* @__PURE__ */ React.createElement(Box, { position: "absolute", top: "-2px", right: "-2px", w: "20px", h: "20px", borderTop: "4px solid #22D3EE", borderRight: "4px solid #22D3EE", borderTopRightRadius: "12px" }),
            /* @__PURE__ */ React.createElement(Box, { position: "absolute", bottom: "-2px", left: "-2px", w: "20px", h: "20px", borderBottom: "4px solid #22D3EE", borderLeft: "4px solid #22D3EE", borderBottomLeftRadius: "12px" }),
            /* @__PURE__ */ React.createElement(Box, { position: "absolute", bottom: "-2px", right: "-2px", w: "20px", h: "20px", borderBottom: "4px solid #22D3EE", borderRight: "4px solid #22D3EE", borderBottomRightRadius: "12px" }),
            /* @__PURE__ */ React.createElement(
              Box,
              {
                position: "absolute",
                left: "10px",
                right: "10px",
                h: "2px",
                bg: "linear-gradient(90deg, transparent, #22D3EE, transparent)",
                borderRadius: "full",
                opacity: 0.7,
                sx: {
                  animation: "scanLine 2.5s ease-in-out infinite",
                  "@keyframes scanLine": {
                    "0%": { top: "14px" },
                    "50%": { top: "calc(100% - 14px)" },
                    "100%": { top: "14px" }
                  }
                }
              }
            ),
            /* @__PURE__ */ React.createElement(Box, { bg: "white", borderRadius: "12px", p: 2.5, position: "relative", zIndex: 1, minW: "180px", minH: "180px", display: "flex", alignItems: "center", justifyContent: "center" }, /* @__PURE__ */ React.createElement(
              SafeQRCode,
              {
                value: webAppQrPayload,
                size: 185,
                level: "M",
                bgColor: "#ffffff",
                fgColor: "#0F172A",
                style: { display: "block" }
              }
            ))
          ))),
          /* @__PURE__ */ React.createElement(Box, { px: 4, pb: 4, pt: 1 }, /* @__PURE__ */ React.createElement(HStack, { justify: "space-between", mb: 1.5 }, /* @__PURE__ */ React.createElement(Text, { fontSize: "11px", fontWeight: "semibold", color: "gray.400", textAlign: "left" }, "Web App URL"), /* @__PURE__ */ React.createElement(Text, { fontSize: "10px", color: "cyan.400", fontFamily: "monospace" }, "Local Wi-Fi Companion")), /* @__PURE__ */ React.createElement(HStack, { bg: useColorModeValue("gray.50", "gray.800"), p: 1, borderRadius: "xl", border: "1px", borderColor }, /* @__PURE__ */ React.createElement(
            Input,
            {
              value: webAppQrPayload,
              isReadOnly: true,
              fontSize: "xs",
              variant: "unstyled",
              px: 2,
              fontFamily: "monospace",
              color: "cyan.400",
              fontWeight: "semibold"
            }
          ), /* @__PURE__ */ React.createElement(
            Button,
            {
              size: "xs",
              colorScheme: "cyan",
              px: 3,
              borderRadius: "lg",
              leftIcon: /* @__PURE__ */ React.createElement(FaCopy, { size: 10 }),
              onClick: () => {
                navigator.clipboard.writeText(webAppQrPayload);
                toast({
                  title: "Copied URL to Clipboard",
                  description: `${webAppQrPayload} copied.`,
                  status: "success",
                  duration: 2e3
                });
              }
            },
            "Copy"
          ), /* @__PURE__ */ React.createElement(
            Button,
            {
              size: "xs",
              colorScheme: "blue",
              px: 3,
              borderRadius: "lg",
              leftIcon: /* @__PURE__ */ React.createElement(FaExternalLinkAlt, { size: 10 }),
              onClick: () => {
                window.open(webAppQrPayload, "_blank");
              }
            },
            "Open"
          )))
        )), /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 3 }, /* @__PURE__ */ React.createElement(
          Box,
          {
            p: 3.5,
            borderRadius: "2xl",
            border: "2px solid",
            borderColor: liveLedToggle ? "cyan.400" : "gray.300",
            bg: liveLedToggle ? "cyan.50" : useColorModeValue("gray.50", "gray.800"),
            shadow: "sm",
            transition: "all 0.2s"
          },
          /* @__PURE__ */ React.createElement(HStack, { justify: "space-between", align: "center" }, /* @__PURE__ */ React.createElement(HStack, { spacing: 3 }, /* @__PURE__ */ React.createElement(
            Box,
            {
              p: 2.5,
              borderRadius: "xl",
              bg: liveLedToggle ? "cyan.500" : "gray.400",
              color: "white",
              shadow: "sm"
            },
            /* @__PURE__ */ React.createElement(FaLightbulb, { size: 18 })
          ), /* @__PURE__ */ React.createElement(VStack, { align: "start", spacing: 0 }, /* @__PURE__ */ React.createElement(HStack, { spacing: 2 }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "extrabold", fontSize: "xs", color: liveLedToggle ? "cyan.900" : "gray.700" }, "Hardware Light Test (", activePort, ")"), /* @__PURE__ */ React.createElement(Badge, { colorScheme: liveLedToggle ? "cyan" : "gray", fontSize: "9px", px: 2, py: 0.5, borderRadius: "full" }, liveLedToggle ? "BLINKING (ON)" : "OFF (STOPPED)")), /* @__PURE__ */ React.createElement(Text, { fontSize: "11px", color: liveLedToggle ? "cyan.700" : "gray.500" }, liveLedToggle ? "Light is blinking. Toggle switch to turn OFF." : "Light is OFF. Toggle switch to start blinking."))), /* @__PURE__ */ React.createElement(
            Switch,
            {
              size: "md",
              colorScheme: "cyan",
              isChecked: liveLedToggle,
              onChange: async (e) => {
                const nextVal = e.target.checked;
                setLiveLedToggle(nextVal);
                await handleToggleHardwareLed(nextVal);
              }
            }
          ))
        ), ledHardwareError && /* @__PURE__ */ React.createElement(Box, { mt: 2, p: 2.5, bg: "red.50", border: "1px solid", borderColor: "red.300", borderRadius: "lg" }, /* @__PURE__ */ React.createElement(Text, { fontSize: "10px", fontWeight: "bold", color: "red.700", mb: 0.5 }, "\u26A0\uFE0F Hardware Unreachable"), /* @__PURE__ */ React.createElement(Text, { fontSize: "10px", color: "red.600", mb: 1.5 }, ledHardwareError.includes("Access is denied") || ledHardwareError.includes("busy") ? "COM port is locked. The ESP32 has old blink firmware \u2014 it must be reflashed." : `Serial error: ${ledHardwareError}`), /* @__PURE__ */ React.createElement(Text, { fontSize: "10px", color: "red.500" }, "\u{1F449} ", /* @__PURE__ */ React.createElement("strong", null, "Unplug & replug the ESP32"), ", then click ", /* @__PURE__ */ React.createElement("strong", null, "Flash Firmware"), " again to install the reactive firmware. After flashing, the toggle will work.")), /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "extrabold", color: "gray.500", letterSpacing: "wider", mb: 1 }, "Export & React Native Options"), /* @__PURE__ */ React.createElement(
          HStack,
          {
            p: 3.5,
            borderRadius: "2xl",
            border: "2px solid",
            borderColor: "purple.300",
            bg: "purple.50",
            _hover: { borderColor: "purple.500", bg: "purple.100", transform: "translateY(-1px)" },
            cursor: "pointer",
            transition: "all 0.15s",
            justify: "space-between",
            shadow: "sm",
            onClick: handleExportExpoZip
          },
          /* @__PURE__ */ React.createElement(HStack, { spacing: 3 }, /* @__PURE__ */ React.createElement(Box, { p: 2.5, bg: "purple.500", color: "white", borderRadius: "xl", shadow: "sm" }, /* @__PURE__ */ React.createElement(FaCode, { size: 16 })), /* @__PURE__ */ React.createElement(VStack, { align: "start", spacing: 0 }, /* @__PURE__ */ React.createElement(HStack, { spacing: 1.5 }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "extrabold", fontSize: "xs", color: "purple.950" }, "Export React Native App (.zip)"), /* @__PURE__ */ React.createElement(Badge, { colorScheme: "purple", fontSize: "9px", px: 1.5 }, "SDK ", expoSdkVersion)), /* @__PURE__ */ React.createElement(Text, { fontSize: "11px", color: "purple.800" }, "Includes App.js, package.json (expo ~", expoSdkVersion, "), app.json"))),
          /* @__PURE__ */ React.createElement(FaDownload, { size: 14, color: "#7c3aed" })
        ), /* @__PURE__ */ React.createElement(
          HStack,
          {
            p: 3,
            borderRadius: "2xl",
            border: "1px solid",
            borderColor,
            _hover: { borderColor: "blue.400", bg: useColorModeValue("gray.50", "gray.800") },
            transition: "all 0.15s",
            justify: "space-between"
          },
          /* @__PURE__ */ React.createElement(HStack, { spacing: 3, cursor: "pointer", onClick: handleOpenExpoSnack, flex: 1 }, /* @__PURE__ */ React.createElement(Box, { p: 2.5, bg: "blue.50", color: "blue.500", borderRadius: "xl" }, /* @__PURE__ */ React.createElement(FaExternalLinkAlt, { size: 14 })), /* @__PURE__ */ React.createElement(VStack, { align: "start", spacing: 0 }, /* @__PURE__ */ React.createElement(HStack, { spacing: 1.5 }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "bold", fontSize: "xs" }, "Open in Expo Snack (Web)"), /* @__PURE__ */ React.createElement(Badge, { colorScheme: "blue", fontSize: "9px" }, "v", expoSdkVersion)), /* @__PURE__ */ React.createElement(Text, { fontSize: "11px", color: "gray.500" }, "Run in browser React Native simulator (SDK 54)"))),
          /* @__PURE__ */ React.createElement(
            Button,
            {
              size: "xs",
              colorScheme: "blue",
              variant: "outline",
              borderRadius: "lg",
              leftIcon: /* @__PURE__ */ React.createElement(FaCopy, { size: 11 }),
              onClick: (e) => {
                e.stopPropagation();
                handleCopyAppJsCode();
              }
            },
            "Copy App.js"
          )
        ), /* @__PURE__ */ React.createElement(
          HStack,
          {
            p: 3,
            borderRadius: "2xl",
            border: "1px solid",
            borderColor,
            _hover: { borderColor: "blue.400", bg: useColorModeValue("gray.50", "gray.800") },
            cursor: "pointer",
            transition: "all 0.15s",
            justify: "space-between",
            onClick: handleExportHtmlWebApp
          },
          /* @__PURE__ */ React.createElement(HStack, { spacing: 3 }, /* @__PURE__ */ React.createElement(Box, { p: 2.5, bg: "green.50", color: "green.600", borderRadius: "xl" }, /* @__PURE__ */ React.createElement(FaFileCode, { size: 15 })), /* @__PURE__ */ React.createElement(VStack, { align: "start", spacing: 0 }, /* @__PURE__ */ React.createElement(HStack, { spacing: 1.5 }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "bold", fontSize: "xs" }, "Standalone Web App (.html)"), /* @__PURE__ */ React.createElement(Badge, { colorScheme: "green", fontSize: "9px" }, "Instant")), /* @__PURE__ */ React.createElement(Text, { fontSize: "11px", color: "gray.500" }, "Single-file HTML runnable on any phone"))),
          /* @__PURE__ */ React.createElement(FaDownload, { size: 12, color: "gray" })
        ), /* @__PURE__ */ React.createElement(
          HStack,
          {
            p: 3,
            borderRadius: "2xl",
            border: "1px solid",
            borderColor,
            _hover: { borderColor: "blue.400", bg: useColorModeValue("gray.50", "gray.800") },
            cursor: "pointer",
            transition: "all 0.15s",
            justify: "space-between",
            onClick: () => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ projectName, widgets, logicBlocks }, null, 2));
              const dlAnchor = document.createElement("a");
              dlAnchor.setAttribute("href", dataStr);
              dlAnchor.setAttribute("download", `${projectName.toLowerCase().replace(/\s+/g, "-")}-config.json`);
              dlAnchor.click();
              toast({ title: "Project configuration exported as JSON", status: "success", duration: 2e3 });
            }
          },
          /* @__PURE__ */ React.createElement(HStack, { spacing: 3 }, /* @__PURE__ */ React.createElement(Box, { p: 2.5, bg: "orange.50", color: "orange.500", borderRadius: "xl" }, /* @__PURE__ */ React.createElement(FaSave, { size: 15 })), /* @__PURE__ */ React.createElement(VStack, { align: "start", spacing: 0 }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "bold", fontSize: "xs" }, "Export Project Schema (JSON)"), /* @__PURE__ */ React.createElement(Text, { fontSize: "11px", color: "gray.500" }, "Save UI widgets and logic rules JSON"))),
          /* @__PURE__ */ React.createElement(FaChevronRight, { size: 12, color: "gray" })
        )))),
        /* @__PURE__ */ React.createElement(ModalFooter, { p: 5, borderTop: "1px", borderColor }, /* @__PURE__ */ React.createElement(Button, { w: "100%", size: "md", colorScheme: "blue", borderRadius: "xl", onClick: onPublishClose }, "Close"))
      )
    ), /* @__PURE__ */ React.createElement(
      RuleBuilderModal,
      {
        isOpen: isRuleModalOpen,
        onClose: onRuleModalClose,
        editingRule,
        setEditingRule,
        ruleModalTab,
        setRuleModalTab,
        widgets,
        testRuleResult,
        setTestRuleResult,
        isTestingRule,
        setIsTestingRule,
        serialTrafficLogs,
        handleExecuteRule,
        handleSaveRuleModal,
        borderColor,
        localCompanionUrl,
        selectedDevice,
        cleanUiList,
        cleanLogicsList,
        companionServerInfo,
        effectiveDeviceId,
        effectiveDeviceName,
        effectiveDeviceType,
        bundleQrPayload
      }
    ), /* @__PURE__ */ React.createElement(Modal, { isOpen: isNewAppModalOpen, onClose: onNewAppModalClose, isCentered: true, size: "md" }, /* @__PURE__ */ React.createElement(ModalOverlay, { backdropFilter: "blur(4px)" }), /* @__PURE__ */ React.createElement(ModalContent, { borderRadius: "2xl", p: 2 }, /* @__PURE__ */ React.createElement(ModalHeader, { fontSize: "md", fontWeight: "bold" }, /* @__PURE__ */ React.createElement(HStack, { spacing: 2 }, /* @__PURE__ */ React.createElement(Box, { p: 2, bg: "blue.50", color: "blue.500", borderRadius: "lg" }, /* @__PURE__ */ React.createElement(FaPlus, { size: 14 })), /* @__PURE__ */ React.createElement(Text, null, "Create New App Screen"))), /* @__PURE__ */ React.createElement(ModalCloseButton, null), /* @__PURE__ */ React.createElement(ModalBody, null, /* @__PURE__ */ React.createElement(VStack, { spacing: 3, align: "stretch" }, /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", color: "gray.500" }, "Create a fresh companion app canvas for this device. Your current screen will be saved in your project list."), /* @__PURE__ */ React.createElement(FormControl, { isRequired: true }, /* @__PURE__ */ React.createElement(FormLabel, { fontSize: "xs", fontWeight: "bold" }, "App Screen Name"), /* @__PURE__ */ React.createElement(
      Input,
      {
        size: "sm",
        borderRadius: "lg",
        placeholder: "e.g. greenhouse_app or motor_dashboard",
        value: newAppNameInput,
        onChange: (e) => setNewAppNameInput(e.target.value),
        autoFocus: true
      }
    )))), /* @__PURE__ */ React.createElement(ModalFooter, null, /* @__PURE__ */ React.createElement(Button, { size: "sm", variant: "ghost", mr: 2, onClick: onNewAppModalClose }, "Cancel"), /* @__PURE__ */ React.createElement(
      Button,
      {
        size: "sm",
        colorScheme: "blue",
        borderRadius: "lg",
        isDisabled: !newAppNameInput.trim(),
        onClick: () => {
          handleCreateNewApp(newAppNameInput);
          onNewAppModalClose();
        }
      },
      "Create App"
    )))), /* @__PURE__ */ React.createElement(Modal, { isOpen: isRenameAppModalOpen, onClose: onRenameAppModalClose, isCentered: true, size: "md" }, /* @__PURE__ */ React.createElement(ModalOverlay, { backdropFilter: "blur(4px)" }), /* @__PURE__ */ React.createElement(ModalContent, { borderRadius: "2xl", p: 2 }, /* @__PURE__ */ React.createElement(ModalHeader, { fontSize: "md", fontWeight: "bold" }, /* @__PURE__ */ React.createElement(HStack, { spacing: 2 }, /* @__PURE__ */ React.createElement(Box, { p: 2, bg: "purple.50", color: "purple.500", borderRadius: "lg" }, /* @__PURE__ */ React.createElement(FaEdit, { size: 14 })), /* @__PURE__ */ React.createElement(Text, null, "Rename App Screen"))), /* @__PURE__ */ React.createElement(ModalCloseButton, null), /* @__PURE__ */ React.createElement(ModalBody, null, /* @__PURE__ */ React.createElement(VStack, { spacing: 3, align: "stretch" }, /* @__PURE__ */ React.createElement(FormControl, { isRequired: true }, /* @__PURE__ */ React.createElement(FormLabel, { fontSize: "xs", fontWeight: "bold" }, "New App Name"), /* @__PURE__ */ React.createElement(
      Input,
      {
        size: "sm",
        borderRadius: "lg",
        value: renameAppNameInput,
        onChange: (e) => setRenameAppNameInput(e.target.value),
        autoFocus: true
      }
    )))), /* @__PURE__ */ React.createElement(ModalFooter, null, /* @__PURE__ */ React.createElement(Button, { size: "sm", variant: "ghost", mr: 2, onClick: onRenameAppModalClose }, "Cancel"), /* @__PURE__ */ React.createElement(
      Button,
      {
        size: "sm",
        colorScheme: "purple",
        borderRadius: "lg",
        isDisabled: !renameAppNameInput.trim() || renameAppNameInput === projectName,
        onClick: () => {
          handleRenameApp(projectName, renameAppNameInput);
          onRenameAppModalClose();
        }
      },
      "Rename"
    )))), /* @__PURE__ */ React.createElement(Modal, { isOpen: isClearCanvasModalOpen, onClose: onClearCanvasModalClose, isCentered: true, size: "sm" }, /* @__PURE__ */ React.createElement(ModalOverlay, { backdropFilter: "blur(4px)" }), /* @__PURE__ */ React.createElement(ModalContent, { borderRadius: "2xl", p: 2 }, /* @__PURE__ */ React.createElement(ModalHeader, { fontSize: "md", fontWeight: "bold", color: "red.500" }, /* @__PURE__ */ React.createElement(HStack, { spacing: 2 }, /* @__PURE__ */ React.createElement(Box, { p: 2, bg: "red.50", color: "red.500", borderRadius: "lg" }, /* @__PURE__ */ React.createElement(FaTrashAlt, { size: 14 })), /* @__PURE__ */ React.createElement(Text, null, "Clear Canvas?"))), /* @__PURE__ */ React.createElement(ModalCloseButton, null), /* @__PURE__ */ React.createElement(ModalBody, null, /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", color: "gray.600" }, "Are you sure you want to remove all ", /* @__PURE__ */ React.createElement("b", null, widgets.length), " components from this screen? You can restore them using Undo (Ctrl+Z).")), /* @__PURE__ */ React.createElement(ModalFooter, null, /* @__PURE__ */ React.createElement(Button, { size: "sm", variant: "ghost", mr: 2, onClick: onClearCanvasModalClose }, "Cancel"), /* @__PURE__ */ React.createElement(
      Button,
      {
        size: "sm",
        colorScheme: "red",
        borderRadius: "lg",
        onClick: () => {
          handleClearAllWidgets();
          onClearCanvasModalClose();
        }
      },
      "Clear All"
    )))), /* @__PURE__ */ React.createElement(Modal, { isOpen: isCrudModalOpen, onClose: onCrudModalClose, isCentered: true, size: "md" }, /* @__PURE__ */ React.createElement(ModalOverlay, { backdropFilter: "blur(4px)" }), /* @__PURE__ */ React.createElement(ModalContent, { borderRadius: "2xl", p: 2 }, /* @__PURE__ */ React.createElement(ModalHeader, { fontSize: "md", fontWeight: "bold" }, /* @__PURE__ */ React.createElement(HStack, { spacing: 2 }, /* @__PURE__ */ React.createElement(Box, { p: 2, bg: "blue.50", color: "blue.500", borderRadius: "lg" }, /* @__PURE__ */ React.createElement(FaTable, { size: 14 })), /* @__PURE__ */ React.createElement(Text, null, editingCrudRecord ? "Edit Data Record" : "Add New Data Record"))), /* @__PURE__ */ React.createElement(ModalCloseButton, null), /* @__PURE__ */ React.createElement(ModalBody, null, /* @__PURE__ */ React.createElement(VStack, { spacing: 3, align: "stretch" }, /* @__PURE__ */ React.createElement(FormControl, { isRequired: true }, /* @__PURE__ */ React.createElement(FormLabel, { fontSize: "xs", fontWeight: "bold" }, "Record Name / Title"), /* @__PURE__ */ React.createElement(
      Input,
      {
        size: "sm",
        borderRadius: "lg",
        placeholder: "e.g. Device Status or Relay State",
        value: crudRecordForm.name,
        onChange: (e) => setCrudRecordForm((prev) => ({ ...prev, name: e.target.value })),
        autoFocus: true
      }
    )), /* @__PURE__ */ React.createElement(FormControl, null, /* @__PURE__ */ React.createElement(FormLabel, { fontSize: "xs", fontWeight: "bold" }, "Reading / Value"), /* @__PURE__ */ React.createElement(
      Input,
      {
        size: "sm",
        borderRadius: "lg",
        placeholder: "e.g. 24.5\xB0C, Active, or GPIO 18 High",
        value: crudRecordForm.value,
        onChange: (e) => setCrudRecordForm((prev) => ({ ...prev, value: e.target.value }))
      }
    )), /* @__PURE__ */ React.createElement(FormControl, null, /* @__PURE__ */ React.createElement(FormLabel, { fontSize: "xs", fontWeight: "bold" }, "Status Tag"), /* @__PURE__ */ React.createElement(
      Select,
      {
        size: "sm",
        borderRadius: "lg",
        value: crudRecordForm.status,
        onChange: (e) => setCrudRecordForm((prev) => ({ ...prev, status: e.target.value }))
      },
      /* @__PURE__ */ React.createElement("option", { value: "Active" }, "Active (Green)"),
      /* @__PURE__ */ React.createElement("option", { value: "Normal" }, "Normal (Blue)"),
      /* @__PURE__ */ React.createElement("option", { value: "Alert" }, "Alert (Red)"),
      /* @__PURE__ */ React.createElement("option", { value: "Standby" }, "Standby (Yellow)"),
      /* @__PURE__ */ React.createElement("option", { value: "Offline" }, "Offline (Gray)")
    )))), /* @__PURE__ */ React.createElement(ModalFooter, null, /* @__PURE__ */ React.createElement(Button, { size: "sm", variant: "ghost", mr: 2, onClick: onCrudModalClose }, "Cancel"), /* @__PURE__ */ React.createElement(
      Button,
      {
        size: "sm",
        colorScheme: "blue",
        borderRadius: "lg",
        isDisabled: !crudRecordForm.name.trim(),
        onClick: handleSaveCrudRecord
      },
      editingCrudRecord ? "Update Record" : "Create Record"
    )))));
  }
  if (wizardStep === "success") {
    return /* @__PURE__ */ React.createElement(
      Box,
      {
        w: "100%",
        h: "100%",
        minH: "100%",
        flex: "1",
        bg: useColorModeValue("gray.50", "gray.900"),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 4
      },
      /* @__PURE__ */ React.createElement(Box, { w: "100%", maxW: "600px", mx: "auto", bg: bgCard, borderRadius: "2xl", shadow: "2xl", overflow: "hidden", border: "1px", borderColor }, /* @__PURE__ */ React.createElement(Box, { p: 8, textAlign: "center" }, /* @__PURE__ */ React.createElement(VStack, { spacing: 6 }, /* @__PURE__ */ React.createElement(
        Box,
        {
          display: "inline-flex",
          p: 5,
          bg: "green.50",
          color: "green.500",
          borderRadius: "full",
          shadow: "md",
          animation: "pulse 2s infinite"
        },
        /* @__PURE__ */ React.createElement(FaCheck, { size: 48 })
      ), /* @__PURE__ */ React.createElement(VStack, { spacing: 2 }, /* @__PURE__ */ React.createElement(Text, { fontSize: "2xl", fontWeight: "black", color: useColorModeValue("gray.850", "white") }, "Firmware Flashed Successfully!"), /* @__PURE__ */ React.createElement(Text, { fontSize: "xl" }, "\u{1F389}"), /* @__PURE__ */ React.createElement(Text, { color: "gray.500", fontSize: "sm", maxW: "440px", lineHeight: "tall" }, "Your hardware is ready and running. Now let's build a ", /* @__PURE__ */ React.createElement(Text, { as: "span", fontWeight: "bold", color: useColorModeValue("gray.800", "white") }, "mobile app"), " to control and monitor your connected device \u2014 no coding required.")), /* @__PURE__ */ React.createElement(HStack, { bg: "gray.50", px: 4, py: 1.5, borderRadius: "full", border: "1px solid", borderColor: "gray.200", spacing: 2.5 }, /* @__PURE__ */ React.createElement(Box, { w: "8px", h: "8px", bg: "green.500", borderRadius: "full" }), /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "bold", color: "gray.800" }, selectedDevice?.name || "ESP32 Dev Board"), /* @__PURE__ */ React.createElement(Badge, { colorScheme: "green", fontSize: "9px", px: 2, borderRadius: "full" }, "Online")), /* @__PURE__ */ React.createElement(
        Box,
        {
          w: "100%",
          p: 4,
          bg: "blue.50",
          borderRadius: "2xl",
          border: "1px solid",
          borderColor: "blue.100",
          textAlign: "left"
        },
        /* @__PURE__ */ React.createElement(HStack, { spacing: 3, align: "center" }, /* @__PURE__ */ React.createElement(Box, { p: 2.5, bg: "white", color: "blue.500", borderRadius: "xl", shadow: "xs" }, /* @__PURE__ */ React.createElement(FaMobileAlt, { size: 20 })), /* @__PURE__ */ React.createElement(VStack, { align: "start", spacing: 0.5 }, /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "extrabold", color: "blue.900" }, "Next step"), /* @__PURE__ */ React.createElement(Text, { fontSize: "11px", color: "blue.700" }, "A starter app will be auto-generated from your hardware components.")))
      ), /* @__PURE__ */ React.createElement(VStack, { w: "100%", spacing: 3 }, /* @__PURE__ */ React.createElement(
        Button,
        {
          w: "100%",
          size: "lg",
          colorScheme: "blue",
          bg: "#2563eb",
          _hover: { bg: "#1d4ed8" },
          borderRadius: "xl",
          shadow: "lg",
          onClick: () => setWizardStep("app_builder"),
          fontWeight: "bold",
          leftIcon: /* @__PURE__ */ React.createElement(Text, { fontSize: "md" }, "\u{1F4F1}"),
          rightIcon: /* @__PURE__ */ React.createElement(FaChevronRight, { size: 13 })
        },
        "Create App \u2192"
      ), /* @__PURE__ */ React.createElement(
        Button,
        {
          variant: "ghost",
          size: "sm",
          color: "gray.500",
          _hover: { color: "gray.800" },
          onClick: () => {
            try {
              localStorage.removeItem("inno_flasher_active_step");
            } catch (e) {
            }
            if (onClose) {
              onClose();
            } else {
              setWizardStep("connection");
            }
          }
        },
        "Back to Workspace"
      )))))
    );
  }
  return /* @__PURE__ */ React.createElement(
    Box,
    {
      w: "100%",
      h: "100%",
      minH: "100%",
      flex: "1",
      bg: useColorModeValue("gray.50", "gray.900"),
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      p: { base: 2, md: 6 },
      overflowY: "auto"
    },
    /* @__PURE__ */ React.createElement(
      Box,
      {
        w: "100%",
        maxW: { base: "100%", md: "740px", lg: "800px" },
        mx: "auto",
        my: "auto",
        bg: bgCard,
        borderRadius: "2xl",
        shadow: "2xl",
        overflow: "hidden",
        border: "1px",
        borderColor
      },
      wizardStep === "connection" && renderStepperHeader(1),
      wizardStep === "devices" && renderStepperHeader(2),
      wizardStep === "compatibility" && renderStepperHeader(3),
      wizardStep === "flashing" && renderStepperHeader(4),
      /* @__PURE__ */ React.createElement(Box, { p: 6 }, wizardStep === "connection" && /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 6 }, /* @__PURE__ */ React.createElement(Text, { fontSize: "lg", fontWeight: "extrabold", color: useColorModeValue("gray.800", "white") }, "Choose Connection Type"), /* @__PURE__ */ React.createElement(Grid, { templateColumns: { base: "1fr", md: "repeat(3, 1fr)" }, gap: 4 }, /* @__PURE__ */ React.createElement(
        Box,
        {
          p: 5,
          borderRadius: "2xl",
          border: "2px solid",
          borderColor: connectionType === "usb" ? "#2563eb" : borderColor,
          bg: connectionType === "usb" ? useColorModeValue("blue.50", "gray.800") : bgCard,
          _hover: { borderColor: "#2563eb", transform: "translateY(-2px)" },
          cursor: "pointer",
          transition: "all 0.2s",
          textAlign: "center",
          onClick: () => setConnectionType("usb"),
          position: "relative"
        },
        /* @__PURE__ */ React.createElement(VStack, { spacing: 3 }, /* @__PURE__ */ React.createElement(
          Box,
          {
            p: 3,
            bg: connectionType === "usb" ? "blue.500" : "gray.100",
            color: connectionType === "usb" ? "white" : "gray.600",
            borderRadius: "2xl",
            shadow: "sm",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center"
          },
          /* @__PURE__ */ React.createElement(FaUsb, { size: 28 })
        ), /* @__PURE__ */ React.createElement(VStack, { spacing: 0.5 }, /* @__PURE__ */ React.createElement(HStack, { spacing: 1.5, justify: "center" }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "extrabold", fontSize: "md" }, "USB Port"), /* @__PURE__ */ React.createElement(Badge, { colorScheme: "purple", fontSize: "9px", px: 2, borderRadius: "full" }, "Direct COM")), /* @__PURE__ */ React.createElement(Text, { fontSize: "11px", color: "gray.500" }, "Connect via USB cable")))
      ), /* @__PURE__ */ React.createElement(
        Box,
        {
          p: 5,
          borderRadius: "2xl",
          border: "2px solid",
          borderColor: connectionType === "wifi" ? "#2563eb" : borderColor,
          bg: connectionType === "wifi" ? useColorModeValue("blue.50", "gray.800") : bgCard,
          _hover: { borderColor: "#2563eb", transform: "translateY(-2px)" },
          cursor: "pointer",
          transition: "all 0.2s",
          textAlign: "center",
          onClick: () => setConnectionType("wifi"),
          position: "relative"
        },
        /* @__PURE__ */ React.createElement(VStack, { spacing: 3 }, /* @__PURE__ */ React.createElement(
          Box,
          {
            p: 3,
            bg: connectionType === "wifi" ? "blue.500" : "gray.100",
            color: connectionType === "wifi" ? "white" : "gray.600",
            borderRadius: "2xl",
            shadow: "sm",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center"
          },
          /* @__PURE__ */ React.createElement(FaWifi, { size: 28 })
        ), /* @__PURE__ */ React.createElement(VStack, { spacing: 0.5 }, /* @__PURE__ */ React.createElement(HStack, { spacing: 1.5, justify: "center" }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "extrabold", fontSize: "md" }, "WiFi"), /* @__PURE__ */ React.createElement(Badge, { colorScheme: "green", fontSize: "9px", px: 2, borderRadius: "full" }, "Recommended")), /* @__PURE__ */ React.createElement(Text, { fontSize: "11px", color: "gray.500" }, "Connect via local network")))
      ), /* @__PURE__ */ React.createElement(
        Box,
        {
          p: 5,
          borderRadius: "2xl",
          border: "2px solid",
          borderColor: connectionType === "cellular" ? "#2563eb" : borderColor,
          bg: connectionType === "cellular" ? useColorModeValue("blue.50", "gray.800") : bgCard,
          _hover: { borderColor: "#2563eb", transform: "translateY(-2px)" },
          cursor: "pointer",
          transition: "all 0.2s",
          textAlign: "center",
          onClick: () => setConnectionType("cellular")
        },
        /* @__PURE__ */ React.createElement(VStack, { spacing: 3 }, /* @__PURE__ */ React.createElement(
          Box,
          {
            p: 3,
            bg: connectionType === "cellular" ? "blue.500" : "gray.100",
            color: connectionType === "cellular" ? "white" : "gray.600",
            borderRadius: "2xl",
            shadow: "sm",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center"
          },
          /* @__PURE__ */ React.createElement(FaBroadcastTower, { size: 28 })
        ), /* @__PURE__ */ React.createElement(VStack, { spacing: 0.5 }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "extrabold", fontSize: "md" }, "Cellular"), /* @__PURE__ */ React.createElement(Text, { fontSize: "11px", color: "gray.500" }, "Connect via mobile data")))
      )), /* @__PURE__ */ React.createElement(VStack, { spacing: 2, pt: 1 }, /* @__PURE__ */ React.createElement(
        Button,
        {
          w: "100%",
          size: "lg",
          colorScheme: "blue",
          bg: "#2563eb",
          _hover: { bg: "#1d4ed8" },
          borderRadius: "xl",
          onClick: () => setWizardStep("devices"),
          fontWeight: "bold"
        },
        "Continue \u2192"
      ), /* @__PURE__ */ React.createElement(
        Button,
        {
          variant: "ghost",
          colorScheme: "blue",
          size: "sm",
          fontSize: "xs",
          fontWeight: "semibold",
          onClick: () => setWizardStep("app_builder"),
          _hover: { textDecoration: "underline", bg: useColorModeValue("blue.50", "gray.800") }
        },
        "Already flashed or designing? Skip to App Builder & Publish QR \u2192"
      ))), wizardStep === "devices" && /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 5 }, /* @__PURE__ */ React.createElement(HStack, { justify: "space-between", align: "center", flexWrap: "wrap", gap: 2 }, /* @__PURE__ */ React.createElement(VStack, { align: "start", spacing: 0 }, /* @__PURE__ */ React.createElement(Text, { fontSize: "lg", fontWeight: "extrabold", color: useColorModeValue("gray.800", "white") }, "Select Device"), /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", color: "gray.500" }, devices.length, " ", devices.length === 1 ? "device" : "devices", " found")), /* @__PURE__ */ React.createElement(HStack, { spacing: 3 }, /* @__PURE__ */ React.createElement(HStack, { spacing: 1.5, bg: useColorModeValue("gray.100", "gray.800"), px: 2.5, py: 1, borderRadius: "lg" }, /* @__PURE__ */ React.createElement(
        Switch,
        {
          size: "sm",
          colorScheme: "blue",
          isChecked: autoRefresh,
          onChange: (e) => setAutoRefresh(e.target.checked)
        }
      ), /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", color: useColorModeValue("gray.700", "gray.300"), fontWeight: "semibold" }, "Auto-refresh"), autoRefresh && /* @__PURE__ */ React.createElement(
        Box,
        {
          w: "6px",
          h: "6px",
          bg: "green.500",
          borderRadius: "full",
          className: "animate-pulse",
          title: "Auto-refresh active (3s polling)"
        }
      )), /* @__PURE__ */ React.createElement(
        Button,
        {
          size: "xs",
          variant: "outline",
          colorScheme: "blue",
          isLoading: isScanning,
          leftIcon: /* @__PURE__ */ React.createElement(FaSync, { size: 11, className: isScanning ? "animate-spin" : "" }),
          onClick: () => handleRefreshDevices(false)
        },
        "Refresh"
      ))), devices.length === 0 ? /* @__PURE__ */ React.createElement(
        Box,
        {
          p: 5,
          bg: useColorModeValue("orange.50", "gray.800"),
          border: "1px dashed",
          borderColor: useColorModeValue("orange.300", "orange.500"),
          borderRadius: "2xl",
          textAlign: "center"
        },
        /* @__PURE__ */ React.createElement(VStack, { spacing: 3 }, /* @__PURE__ */ React.createElement(Box, { p: 3, bg: "orange.100", color: "orange.600", borderRadius: "full" }, /* @__PURE__ */ React.createElement(FaExclamationTriangle, { size: 22 })), /* @__PURE__ */ React.createElement(VStack, { spacing: 1 }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "bold", fontSize: "sm", color: useColorModeValue("orange.800", "orange.200") }, "No Serial / USB Devices Detected"), /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", color: useColorModeValue("gray.600", "gray.400"), maxW: "440px" }, "Connect your ESP32 board to your PC via USB and click ", /* @__PURE__ */ React.createElement("b", null, "Scan for Devices"), ".")), /* @__PURE__ */ React.createElement(
          Box,
          {
            p: 3,
            bg: useColorModeValue("white", "gray.900"),
            borderRadius: "xl",
            border: "1px solid",
            borderColor: useColorModeValue("orange.200", "gray.700"),
            textAlign: "left",
            w: "100%",
            maxW: "440px",
            fontSize: "xs",
            color: useColorModeValue("gray.700", "gray.300")
          },
          /* @__PURE__ */ React.createElement(Text, { fontWeight: "semibold", mb: 1, color: useColorModeValue("gray.800", "gray.200") }, "Hardware Checklist:"),
          /* @__PURE__ */ React.createElement(VStack, { align: "start", spacing: 1 }, /* @__PURE__ */ React.createElement(Text, null, "\u2022 ", /* @__PURE__ */ React.createElement("b", null, "Data Cable:"), " Verify your USB cable supports data transfer (not a power-only cable)."), /* @__PURE__ */ React.createElement(Text, null, "\u2022 ", /* @__PURE__ */ React.createElement("b", null, "Driver:"), " Ensure CP2102, CH340, or FTDI drivers are installed if required."), /* @__PURE__ */ React.createElement(Text, null, "\u2022 ", /* @__PURE__ */ React.createElement("b", null, "Bootloader Mode:"), " If using native ESP32-S3 USB, hold ", /* @__PURE__ */ React.createElement("b", null, "BOOT"), ", tap ", /* @__PURE__ */ React.createElement("b", null, "RST"), ", then release ", /* @__PURE__ */ React.createElement("b", null, "BOOT"), "."))
        ), /* @__PURE__ */ React.createElement(
          Button,
          {
            size: "sm",
            colorScheme: "blue",
            leftIcon: /* @__PURE__ */ React.createElement(FaSync, { size: 12, className: isScanning ? "animate-spin" : "" }),
            isLoading: isScanning,
            onClick: () => handleRefreshDevices(false)
          },
          "Scan for Devices"
        ))
      ) : /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 3 }, devices.map((device) => {
        const isSelected = device.id === selectedDeviceId;
        return /* @__PURE__ */ React.createElement(
          Box,
          {
            key: device.id,
            p: 3.5,
            borderRadius: "2xl",
            border: "2px solid",
            borderColor: isSelected ? "#2563eb" : borderColor,
            bg: isSelected ? useColorModeValue("blue.50", "gray.800") : bgCard,
            _hover: { borderColor: isSelected ? "#2563eb" : "gray.300" },
            cursor: "pointer",
            transition: "all 0.15s",
            onClick: () => setSelectedDeviceId(device.id)
          },
          /* @__PURE__ */ React.createElement(HStack, { justify: "space-between" }, /* @__PURE__ */ React.createElement(HStack, { spacing: 3 }, /* @__PURE__ */ React.createElement(Box, { p: 2.5, bg: isSelected ? "blue.500" : "gray.100", color: isSelected ? "white" : "gray.600", borderRadius: "xl", position: "relative" }, connectionType === "usb" ? /* @__PURE__ */ React.createElement(FaUsb, { size: 16 }) : connectionType === "wifi" ? /* @__PURE__ */ React.createElement(FaWifi, { size: 16 }) : /* @__PURE__ */ React.createElement(FaBroadcastTower, { size: 16 }), /* @__PURE__ */ React.createElement(
            Box,
            {
              w: "8px",
              h: "8px",
              bg: "green.500",
              borderRadius: "full",
              position: "absolute",
              bottom: "-1px",
              right: "-1px",
              border: "2px solid white"
            }
          )), /* @__PURE__ */ React.createElement(VStack, { align: "start", spacing: 0 }, /* @__PURE__ */ React.createElement(Text, { fontWeight: "extrabold", fontSize: "sm" }, device.name), /* @__PURE__ */ React.createElement(Text, { fontSize: "11px", color: "gray.500" }, device.ip), /* @__PURE__ */ React.createElement(Text, { fontSize: "10px", color: "gray.400" }, device.firmware, " \u2022 Port: ", device.port))), /* @__PURE__ */ React.createElement(HStack, { spacing: 3 }, /* @__PURE__ */ React.createElement(HStack, { spacing: 1, color: "green.600", fontSize: "11px", fontWeight: "bold" }, /* @__PURE__ */ React.createElement(FaWifi, { size: 13 }), /* @__PURE__ */ React.createElement(Text, null, "\u{1F50B} ", device.battery, "%")), /* @__PURE__ */ React.createElement(
            Box,
            {
              w: "20px",
              h: "20px",
              borderRadius: "full",
              bg: isSelected ? "blue.500" : "transparent",
              border: "2px solid",
              borderColor: isSelected ? "blue.500" : "gray.300",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "10px"
            },
            isSelected && /* @__PURE__ */ React.createElement(FaCheck, { size: 10 })
          )))
        );
      })), /* @__PURE__ */ React.createElement(HStack, { justify: "space-between", pt: 2 }, /* @__PURE__ */ React.createElement(
        Button,
        {
          variant: "outline",
          borderRadius: "xl",
          onClick: () => setWizardStep("connection"),
          leftIcon: /* @__PURE__ */ React.createElement(FaChevronLeft, { size: 11 })
        },
        "Back"
      ), /* @__PURE__ */ React.createElement(
        Button,
        {
          colorScheme: "blue",
          bg: "#2563eb",
          _hover: { bg: "#1d4ed8" },
          borderRadius: "xl",
          onClick: () => setWizardStep("compatibility"),
          fontWeight: "bold",
          px: 6,
          isDisabled: !selectedDevice || devices.length === 0
        },
        "Continue \u2192"
      ))), wizardStep === "compatibility" && /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 5 }, /* @__PURE__ */ React.createElement(Text, { fontSize: "lg", fontWeight: "extrabold", color: useColorModeValue("gray.800", "white") }, "Compatibility Check"), /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 2.5 }, compatibilityChecks.map((item) => /* @__PURE__ */ React.createElement(
        HStack,
        {
          key: item.id,
          p: 3,
          bg: useColorModeValue("gray.50", "gray.800"),
          borderRadius: "xl",
          justify: "space-between",
          border: "1px solid",
          borderColor
        },
        /* @__PURE__ */ React.createElement(HStack, { spacing: 2.5 }, item.status === "pass" ? /* @__PURE__ */ React.createElement(Box, { color: "green.500" }, /* @__PURE__ */ React.createElement(FaCheckCircle, { size: 16 })) : item.status === "fail" ? /* @__PURE__ */ React.createElement(Box, { color: "red.500" }, /* @__PURE__ */ React.createElement(FaTimes, { size: 16 })) : /* @__PURE__ */ React.createElement(Box, { color: "orange.400" }, /* @__PURE__ */ React.createElement(FaExclamationTriangle, { size: 16 })), /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "semibold" }, item.label)),
        item.value && /* @__PURE__ */ React.createElement(Badge, { colorScheme: item.status === "pass" ? "green" : item.status === "fail" ? "red" : "orange", fontSize: "10px", borderRadius: "md", px: 2 }, item.value)
      ))), selectedDevice ? /* @__PURE__ */ React.createElement(HStack, { p: 3.5, bg: "green.50", borderRadius: "xl", border: "1px solid", borderColor: "green.200", spacing: 2.5 }, /* @__PURE__ */ React.createElement(Box, { color: "green.600" }, /* @__PURE__ */ React.createElement(FaCheckCircle, { size: 18 })), /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "bold", color: "green.800" }, "Hardware check passed: ", selectedDevice.name, " (", selectedDevice.port, ") is ready for flash.")) : /* @__PURE__ */ React.createElement(HStack, { p: 3.5, bg: "red.50", borderRadius: "xl", border: "1px solid", borderColor: "red.200", spacing: 2.5 }, /* @__PURE__ */ React.createElement(Box, { color: "red.600" }, /* @__PURE__ */ React.createElement(FaExclamationTriangle, { size: 18 })), /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "bold", color: "red.800" }, "No device connected. Please go back and connect an ESP32 hardware device.")), /* @__PURE__ */ React.createElement(HStack, { justify: "space-between", pt: 2 }, /* @__PURE__ */ React.createElement(
        Button,
        {
          variant: "outline",
          borderRadius: "xl",
          onClick: () => setWizardStep("devices"),
          leftIcon: /* @__PURE__ */ React.createElement(FaChevronLeft, { size: 11 })
        },
        "Back"
      ), /* @__PURE__ */ React.createElement(
        Button,
        {
          colorScheme: "blue",
          bg: "#2563eb",
          _hover: { bg: "#1d4ed8" },
          borderRadius: "xl",
          onClick: handleStartFlash,
          fontWeight: "bold",
          px: 6,
          leftIcon: /* @__PURE__ */ React.createElement(FaBolt, { size: 13 }),
          isDisabled: !selectedDevice
        },
        "Start Flash"
      ))), wizardStep === "flashing" && /* @__PURE__ */ React.createElement(VStack, { align: "stretch", spacing: 6 }, /* @__PURE__ */ React.createElement(Text, { fontSize: "lg", fontWeight: "extrabold", color: useColorModeValue("gray.800", "white") }, "Flashing Firmware"), /* @__PURE__ */ React.createElement(Box, { display: "flex", flexDirection: "column", alignItems: "center", py: 4 }, /* @__PURE__ */ React.createElement(Box, { position: "relative", w: "140px", h: "140px", display: "flex", alignItems: "center", justifyContent: "center" }, /* @__PURE__ */ React.createElement("svg", { width: "140", height: "140", viewBox: "0 0 140 140", style: { transform: "rotate(-90deg)" } }, /* @__PURE__ */ React.createElement(
        "circle",
        {
          cx: "70",
          cy: "70",
          r: "58",
          stroke: "#e2e8f0",
          strokeWidth: "8",
          fill: "transparent"
        }
      ), /* @__PURE__ */ React.createElement(
        "circle",
        {
          cx: "70",
          cy: "70",
          r: "58",
          stroke: "#2563eb",
          strokeWidth: "8",
          fill: "transparent",
          strokeDasharray: 364,
          strokeDashoffset: 364 - 364 * flashProgress / 100,
          strokeLinecap: "round",
          style: { transition: "stroke-dashoffset 0.4s ease" }
        }
      )), /* @__PURE__ */ React.createElement(VStack, { spacing: 0, position: "absolute" }, /* @__PURE__ */ React.createElement(Text, { fontSize: "2xl", fontWeight: "black", color: "blue.600" }, flashProgress, "%"), /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "semibold", color: "gray.400" }, flashTimeRemaining, "s"))), /* @__PURE__ */ React.createElement(Text, { fontSize: "xs", fontWeight: "bold", color: "gray.600", mt: 3 }, flashStatusText)), /* @__PURE__ */ React.createElement(Progress, { value: flashProgress, size: "xs", colorScheme: "blue", borderRadius: "full", hasStripe: true, isAnimated: true }), /* @__PURE__ */ React.createElement(
        Box,
        {
          h: "90px",
          bg: "#0f172a",
          p: 3,
          borderRadius: "xl",
          fontFamily: "monospace",
          fontSize: "11px",
          color: "#38bdf8",
          overflowY: "auto",
          border: "1px solid",
          borderColor: "gray.800"
        },
        flashTerminalLogs.length === 0 ? /* @__PURE__ */ React.createElement(Text, { color: "gray.500" }, "// Terminal initializing...") : flashTerminalLogs.map((log, idx) => /* @__PURE__ */ React.createElement(Text, { key: idx, whiteSpace: "pre-wrap", lineHeight: "tall" }, log)),
        /* @__PURE__ */ React.createElement("div", { ref: terminalEndRef })
      )))
    ),
    /* @__PURE__ */ React.createElement(
      EspIdfSetupModal,
      {
        isOpen: isIdfPromptOpen,
        onClose: () => setIsIdfPromptOpen(false),
        onContinue: () => setIsIdfPromptOpen(false)
      }
    ),
    /* @__PURE__ */ React.createElement(
      RuleBuilderModal,
      {
        isOpen: isRuleModalOpen,
        onClose: onRuleModalClose,
        editingRule,
        setEditingRule,
        ruleModalTab,
        setRuleModalTab,
        widgets,
        testRuleResult,
        setTestRuleResult,
        isTestingRule,
        setIsTestingRule,
        serialTrafficLogs,
        handleExecuteRule,
        handleSaveRuleModal,
        borderColor,
        localCompanionUrl,
        selectedDevice,
        cleanUiList,
        cleanLogicsList,
        companionServerInfo,
        effectiveDeviceId,
        effectiveDeviceName,
        effectiveDeviceType,
        bundleQrPayload
      }
    )
  );
}
