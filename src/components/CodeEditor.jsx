import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { API } from '@/config';
import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Input,
  VStack,
  chakra,
  useColorMode,
  useToast,
  Text,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import ProductDefinition from "./CreateProduct";
import ProductEditModal from "./Product/ProductEdit/ProductEditModal";
import { Editor } from "@monaco-editor/react";
import { AddIcon, CloseIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { Save } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS, MONACO_LANGUAGE_MAP } from "../constants";
import Output from "./Output";
import { useCodeEditorAutoSave, useGlobalAutoSave } from "../hooks/useAutoSave";
import { autoSaveManager } from "../utils/autoSaveManager";
import { useResizableSidebar } from "../hooks/useResizableSidebar";
import { useDispatch, useSelector } from "react-redux";
import {
  setTabs,
  setActiveTab,
  addTab,
  closeTab,
  renameTab,
  updateTabContent as updateReduxTabContent,
} from "../store/slices/editorSlice";

import IconBar from "./IconBar";
import FileExplorer from "./FileExplorer";
import Debug from "./Debug";
import Flash from "./Flash";
import ESP32Flasher from "./ESP32Flasher";
import CreateProductButton from "./shared/CreateProductButton";
import WorkspaceHeader from "../features/workspace/runtime/components/WorkspaceHeader";
import ProcessingTimeline from "../features/workspace/runtime/components/ProcessingTimeline";
import TerminalPanel from "../features/workspace/terminal/components/TerminalPanel";
import PreviewPanel from "../features/workspace/preview/components/PreviewPanel";

// Component to handle FileExplorer and Flash panel layout
const FileExplorerWithFlash = ({
  isFlashing,
  onFlashComplete,
  onFlashStart,
  colorMode,
}) => {
  const [isDeviceConnected, setIsDeviceConnected] = useState(() => {
    // Check localStorage for persisted device connection state
    const savedState = localStorage.getItem("innoide:device-connected");
    return savedState === "true";
  });

  useEffect(() => {
    const handleDeviceConnect = () => {
      setIsDeviceConnected(true);
      localStorage.setItem("innoide:device-connected", "true");
    };
    const handleDeviceDisconnect = () => {
      setIsDeviceConnected(false);
      localStorage.setItem("innoide:device-connected", "false");
    };

    window.addEventListener(
      "innoide:device-detect-complete",
      handleDeviceConnect,
    );
    window.addEventListener(
      "innoide:device-disconnect",
      handleDeviceDisconnect,
    );

    return () => {
      window.removeEventListener(
        "innoide:device-detect-complete",
        handleDeviceConnect,
      );
      window.removeEventListener(
        "innoide:device-disconnect",
        handleDeviceDisconnect,
      );
    };
  }, []);

  if (isFlashing) {
    return (
      <Box flex="1" p={2} overflowY="auto">
        <Flash onFlashComplete={onFlashComplete} onFlashStart={onFlashStart} />
      </Box>
    );
  }

  return (
    <Box flex="1" display="flex" flexDirection="column" overflow="hidden">
      <Box
        flex={isDeviceConnected ? "1" : "auto"}
        overflowY="auto"
        p={2}
        minH={isDeviceConnected ? "240px" : "auto"}
        h={isDeviceConnected ? "50%" : "100%"}
      >
        <FileExplorer variant="diagram" />
      </Box>
      {/* Only show Flash panel when device is connected */}
      <Box
        display="none" // Hidden as per user request
        borderTop="1px solid"
        borderColor={
          colorMode === "dark"
            ? "rgba(148,163,184,0.12)"
            : "rgba(15,23,42,0.08)"
        }
        p={2}
        maxH="240px"
        minH="200px"
        h="50%"
        overflowY="auto"
        transition="all 0.3s ease"
      >
        <Flash onFlashComplete={onFlashComplete} onFlashStart={onFlashStart} />
      </Box>
    </Box>
  );
};
import Erase from "./Erase";
import LibraryManager from "./LibraryManager";
// import Navbar from "./Navbar";
// import Navbartwo from "./Navbartwo";
import EditorNavbar from "./EditorNavbar";

const parseJSON = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Failed to parse stored value", error);
    return null;
  }
};

const buildIdentity = (data) => {
  if (!data || typeof data !== "object") {
    return null;
  }

  const email = (data.email || data.userEmail || "").trim();
  const phone = (
    data.phone ||
    data.mobileNumber ||
    data.phoneNumber ||
    ""
  ).trim();
  const name = (
    data.name ||
    data.fullName ||
    data.username ||
    data.userName ||
    ""
  ).trim();

  const primaryName = name || email || phone || "";

  if (!primaryName && !email && !phone) {
    return null;
  }

  return {
    name: primaryName,
    email,
    phone,
  };
};

const getStoredIdentity = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const identitySources = [
    () => sessionStorage.getItem("currentUserIdentity"),
    () => localStorage.getItem("currentUserIdentity"),
  ];

  for (const getSource of identitySources) {
    const parsed = buildIdentity(parseJSON(getSource()));
    if (parsed) {
      return parsed;
    }
  }

  const userDataSources = [
    () => sessionStorage.getItem("userData"),
    () => localStorage.getItem("userData"),
  ];

  for (const getSource of userDataSources) {
    const parsed = buildIdentity(parseJSON(getSource()));
    if (parsed) {
      return parsed;
    }
  }

  return null;
};

const CodeEditor = ({ currentPanel, onDebugClick, onFlashClick }) => {
  const editorRef = useRef();
  const outputRef = useRef(null);

  const dispatch = useDispatch();
  const { tabs, activeTabId } = useSelector((state) => state.editor);
  const { runtimeState } = useSelector((state) => state.workspace);
  const activeTab = useMemo(
    () => tabs.find((t) => String(t.id) === String(activeTabId)),
    [tabs, activeTabId],
  );

  const addNewTab = useCallback(() => {
    const newId = Date.now();
    dispatch(
      addTab({
        id: newId,
        name: `file-${tabs.length + 1}.c`,
        content: CODE_SNIPPETS["C"] || "",
        dirty: true,
      }),
    );
  }, [dispatch, tabs.length]);

  const updateTabContent = useCallback(
    (id, content) => {
      dispatch(updateReduxTabContent({ tabId: id, content }));
    },
    [dispatch],
  );

  const handleTabClick = useCallback(
    (id) => {
      dispatch(setActiveTab(id));
    },
    [dispatch],
  );

  const closeTabHandler = useCallback(
    (id) => {
      dispatch(closeTab(id));
    },
    [dispatch],
  );

  // Initialize first tab if none exists
  useEffect(() => {
    if (tabs.length === 0) {
      addNewTab();
    }
  }, [tabs.length, addNewTab]);

  // Enhanced auto-save for code editor state
  const {
    isSaving: isAutoSaving,
    lastSaveTime: lastAutoSaveTime,
    saveNow: saveEditorNow,
    scheduleSave: scheduleEditorSave,
    isLoaded: isAutoSaveLoaded,
  } = useCodeEditorAutoSave(
    activeTab?.content || "",
    {
      screenKey: "/editor",
      tabs,
      activeTab: activeTabId,
      autoSaveDelay: 2000,
      priority: 2,
      onSave: (data) => {
        console.log("[CodeEditor] Auto-saved editor state:", data);
      },
      onLoad: (loadedData) => {
        console.log("[CodeEditor] Loading saved editor state:", loadedData);
        if (loadedData && loadedData.tabs && loadedData.tabs.length > 0) {
          dispatch(setTabs(loadedData.tabs));
          if (loadedData.activeTab) {
            dispatch(setActiveTab(loadedData.activeTab));
          } else {
            dispatch(setActiveTab(loadedData.tabs[0].id));
          }
        }
      },
      onError: (error) => {
        console.error("[CodeEditor] Auto-save error:", error);
      },
    },
  );

  const { saveAll: saveAllScreens } = useGlobalAutoSave();

  const [language, setLanguage] = useState("Select Languages");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarMode, setSidebarMode] = useState("explorer");
  const [activeToolPanel, setActiveToolPanel] = useState(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);
  const [isEraseOpen, setEraseOpen] = useState(false);
  const [isLibraryManagerOpen, setLibraryManagerOpen] = useState(false);
  const [isOutputExpanded, setIsOutputExpanded] = useState(false);

  const {
    isOpen: isSidebarOpen,
    onToggle: onToggleSidebar,
    onClose: onCloseSidebar
  } = useDisclosure({ defaultIsOpen: true });

  const {
    isOpen: isCreateProductModalOpen,
    onOpen: handleOpenCreateProductModal,
    onClose: handleCloseCreateProductModal
  } = useDisclosure();

  const {
    isOpen: isFlashModalOpen,
    onOpen: onOpenFlashModal,
    onClose: onCloseFlashModal
  } = useDisclosure();
  const { sidebarWidth, isResizing, startResizing } = useResizableSidebar(240, 160, 480);
  const [debugStatus, setDebugStatus] = useState("idle");
  const [debugLastAction, setDebugLastAction] = useState(null);
  const [debugBusy, setDebugBusy] = useState(false);
  const [debugLogs, setDebugLogs] = useState([]);
  const [debugThreads, setDebugThreads] = useState([
    { id: "thread-main", name: "Main Thread", state: "idle" },
  ]);
  const [debugVariables, setDebugVariables] = useState([]);
  const [debugBreakpoints, setDebugBreakpoints] = useState([]);
  const { colorMode } = useColorMode();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const identityFromLocation = location.state?.identity;

  const computeIdentity = useCallback(() => {
    const fromLocation = buildIdentity(identityFromLocation);
    if (fromLocation) {
      if (typeof window !== "undefined") {
        const serialised = JSON.stringify(fromLocation);
        sessionStorage.setItem("currentUserIdentity", serialised);
        localStorage.setItem("currentUserIdentity", serialised);
      }
      return fromLocation;
    }

    return getStoredIdentity();
  }, [identityFromLocation]);

  const [userIdentity, setUserIdentity] = useState(() => computeIdentity());

  useEffect(() => {
    setUserIdentity(computeIdentity());
  }, [computeIdentity]);

  const MAX_TABS = 10;
  const activeTabName = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId)?.name || "main",
    [tabs, activeTabId],
  );

  // Save editor state when tabs or content change
  useEffect(() => {
    if (tabs.length > 0) {
      scheduleEditorSave();
    }
  }, [tabs, activeTab, scheduleEditorSave]);

  // Save before navigating away or page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveEditorNow();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        saveEditorNow();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Save when unmounting (navigating away)
      saveEditorNow();
    };
  }, [saveEditorNow]);

  // Register code editor save strategy with auto-save manager
  useEffect(() => {
    const saveFunction = () => ({
      tabs: tabs.map((t) => ({
        id: t.id,
        name: t.name,
        content: t.content,
        dirty: t.dirty,
      })),
      activeTab,
      timestamp: Date.now(),
    });

    autoSaveManager.registerSaveStrategy("codeeditor:tabs", saveFunction, {
      priority: 2,
      skipEmpty: false,
    });

    return () => {
      autoSaveManager.unregisterSaveStrategy("codeeditor:tabs");
    };
  }, [tabs, activeTab]);

  // Tab Renaming State
  const [editingTabId, setEditingTabId] = useState(null);
  const [tempName, setTempName] = useState("");

  const startRenaming = (e, tab) => {
    e.stopPropagation();
    setEditingTabId(tab.id);
    setTempName(tab.name);
  };

  const handleRenameChange = (e) => {
    setTempName(e.target.value);
  };

  const handleRenameSubmit = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      finishRenaming();
    } else if (e.key === "Escape") {
      setEditingTabId(null);
      setTempName("");
    }
  };

  const finishRenaming = () => {
    if (editingTabId && tempName.trim()) {
      dispatch(renameTab({ tabId: editingTabId, name: tempName.trim() }));
    }
    setEditingTabId(null);
    setTempName("");
  };

  const onSelect = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    const newContent = CODE_SNIPPETS[selectedLanguage] || "";
    if (activeTabId) {
      updateTabContent(activeTabId, newContent);
    }
  };

  const togglePanel = useCallback((panel) => {
    setActiveToolPanel((prev) => (prev === panel ? null : panel));
  }, []);

  const handleFlashComplete = useCallback(() => {
    setIsFlashing(false);
  }, []);

  const handleFlashStart = useCallback(() => {
    setIsFlashing(true);
  }, []);

  const handleEditorChange = (newValue) => {
    const targetId = activeTabId ?? tabs[0]?.id;
    if (targetId !== undefined && targetId !== null) {
      updateTabContent(targetId, newValue ?? "");
    }
  };

  const handleTabClose = (tabId, event) => {
    event.stopPropagation();
    dispatch(closeTab(tabId));
  };

  // Listen for device connection events and persist state
  useEffect(() => {
    // Initialize from localStorage
    const savedState = localStorage.getItem("innoide:device-connected");
    if (savedState === "true") {
      setIsDeviceConnected(true);
    }

    const handleDeviceConnect = () => {
      setIsDeviceConnected(true);
      localStorage.setItem("innoide:device-connected", "true");
    };
    const handleDeviceDisconnect = () => {
      setIsDeviceConnected(false);
      localStorage.setItem("innoide:device-connected", "false");
    };
    const handleDeviceFailed = () => {
      setIsDeviceConnected(false);
      localStorage.setItem("innoide:device-connected", "false");
    };

    window.addEventListener(
      "innoide:device-detect-complete",
      handleDeviceConnect,
    );
    window.addEventListener(
      "innoide:device-disconnect",
      handleDeviceDisconnect,
    );
    window.addEventListener("innoide:device-detect-failed", handleDeviceFailed);

    return () => {
      window.removeEventListener(
        "innoide:device-detect-complete",
        handleDeviceConnect,
      );
      window.removeEventListener(
        "innoide:device-disconnect",
        handleDeviceDisconnect,
      );
      window.removeEventListener(
        "innoide:device-detect-failed",
        handleDeviceFailed,
      );
    };
  }, []);

  const handleFlashClick = useCallback(() => {
    onOpenFlashModal();
  }, [onOpenFlashModal]);

  // Listen for navbar flash event
  useEffect(() => {
    window.addEventListener('innoide:flash-start', handleFlashClick);
    return () => {
      window.removeEventListener('innoide:flash-start', handleFlashClick);
    };
  }, [handleFlashClick]);

  const handleEraseClick = useCallback(() => {
    setEraseOpen(true);
    setActiveToolPanel(null);
  }, []);

  const handleScrollToOutput = useCallback(() => {
    const node = document.getElementById("code-editor-output");
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setActiveToolPanel(null);
  }, []);

  const pushDebugLog = useCallback((message, meta = {}) => {
    if (!message) return;
    const entry = {
      timestamp: new Date().toISOString(),
      message,
      ...meta,
    };
    setDebugLogs((prev) => [...prev.slice(-59), entry]);
  }, []);

  const pushDebugOutput = useCallback((line) => {
    if (!line) return;
    const formatted = line.startsWith("[debug]") ? line : `[debug] ${line}`;
    outputRef.current?.appendOutputLine?.(formatted);
  }, []);

  const setThreadState = useCallback((state) => {
    setDebugThreads([{ id: "thread-main", name: "Main Thread", state }]);
  }, []);

  const inferVariablesFromStdout = useCallback((stdout) => {
    if (!stdout) return [];
    return stdout
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 6)
      .map((line, index) => {
        if (line.includes("=")) {
          const [name, value] = line.split(/=(.+)/);
          return { name: name.trim(), value: (value ?? "").trim() };
        }
        return { name: `out${index + 1}`, value: line };
      });
  }, []);

  const bumpPseudoFrame = useCallback((label) => {
    setDebugVariables((prev) => {
      const filtered = prev.filter(
        (item) => !["lastStep", "currentLine"].includes(item.name),
      );
      const currentLine = prev.find((item) => item.name === "currentLine");
      const nextLine = currentLine
        ? Number.parseInt(currentLine.value, 10) + 1
        : 1;
      return [
        { name: "lastStep", value: label },
        { name: "currentLine", value: `${nextLine}` },
        ...filtered.slice(0, 5),
      ];
    });
  }, []);

  const runProgram = useCallback(
    async ({ reason = "run", append = false, label = "Run" } = {}) => {
      const runner = outputRef.current?.runCode;
      if (!runner) {
        pushDebugLog("Output console not ready; cannot execute program.");
        return { ok: false, reason: "no-runner" };
      }

      setDebugBusy(true);
      setDebugLastAction(label);
      setDebugStatus("running");
      setThreadState("running");
      pushDebugLog(`${label} started.`);
      pushDebugOutput(`${label} started.`);

      const result = await runner({ append, reason });

      setDebugBusy(false);

      if (!result?.ok) {
        const message =
          result?.error?.message || result?.reason || "unknown error";
        setDebugStatus("error");
        setThreadState("error");
        setDebugVariables([]);
        pushDebugLog(`${label} failed: ${message}`);
        pushDebugOutput(`${label} failed: ${message}`);
        return result;
      }

      const hasStdErr = Boolean(result.stderr && result.stderr.trim());
      const finalStatus = hasStdErr ? "completed-with-errors" : "completed";
      setDebugStatus(finalStatus);
      setThreadState(finalStatus);
      setDebugVariables(inferVariablesFromStdout(result.stdout));
      setDebugBreakpoints((prev) =>
        prev.length > 0
          ? prev
          : [
            {
              path: activeTabName,
              line: 1,
            },
          ],
      );
      pushDebugLog(
        hasStdErr
          ? `${label} completed with stderr output.`
          : `${label} completed successfully.`,
      );
      if (hasStdErr) {
        pushDebugOutput(`${label} completed with stderr output.`);
      } else if (!result.stdout?.trim()) {
        pushDebugOutput(`${label} completed with no stdout.`);
      }

      return result;
    },
    [
      activeTabName,
      inferVariablesFromStdout,
      pushDebugLog,
      pushDebugOutput,
      setThreadState,
    ],
  );

  const handleRunAndDebug = useCallback(async () => {
    setActiveToolPanel("debug");
    await runProgram({
      reason: "run-debug",
      append: false,
      label: "Run & Debug",
    });
  }, [runProgram]);

  const handleDebugRestart = useCallback(async () => {
    setActiveToolPanel("debug");
    await runProgram({ reason: "restart", append: false, label: "Restart" });
  }, [runProgram]);

  const handleDebugContinue = useCallback(() => {
    setDebugLastAction("Continue");
    setDebugStatus("running");
    setThreadState("running");
    pushDebugLog("Continue requested.");
    pushDebugOutput("Continue requested.");
  }, [pushDebugLog, pushDebugOutput, setThreadState]);

  const handleDebugStepInto = useCallback(() => {
    setDebugLastAction("Step Into");
    setDebugStatus("paused");
    setThreadState("paused");
    bumpPseudoFrame("step-into");
    pushDebugLog("Step into executed.");
    pushDebugOutput("Step into executed.");
  }, [bumpPseudoFrame, pushDebugLog, pushDebugOutput, setThreadState]);

  const handleDebugStepOut = useCallback(() => {
    setDebugLastAction("Step Out");
    setDebugStatus("paused");
    setThreadState("paused");
    bumpPseudoFrame("step-out");
    pushDebugLog("Step out executed.");
    pushDebugOutput("Step out executed.");
  }, [bumpPseudoFrame, pushDebugLog, pushDebugOutput, setThreadState]);

  const handleDebugStepOver = useCallback(() => {
    setDebugLastAction("Step Over");
    setDebugStatus("paused");
    setThreadState("paused");
    bumpPseudoFrame("step-over");
    pushDebugLog("Step over executed.");
    pushDebugOutput("Step over executed.");
  }, [bumpPseudoFrame, pushDebugLog, pushDebugOutput, setThreadState]);

  const handleDebugStop = useCallback(() => {
    setDebugLastAction("Stop");
    setDebugStatus("stopped");
    setThreadState("stopped");
    setDebugBusy(false);
    pushDebugLog("Debug session stopped.");
    pushDebugOutput("Debug session stopped.");
  }, [pushDebugLog, pushDebugOutput, setThreadState]);

  const handleBuildClick = useCallback(async () => {
    // Use ESP-IDF build from Output component
    const buildRunner = outputRef.current?.buildProject;

    if (typeof buildRunner === "function") {
      setActiveToolPanel("build");
      await buildRunner();
    } else {
      // Fallback to old method
      setActiveToolPanel("build");
      await runProgram({ reason: "build", append: false, label: "Build" });
    }
  }, [runProgram]);

  const handleDebugClick = useCallback(() => {
    if (activeToolPanel === "debug") {
      setActiveToolPanel(null);
      return;
    }
    setActiveToolPanel("debug");
    handleRunAndDebug();
  }, [activeToolPanel, handleRunAndDebug]);

  const handleLibrariesClick = useCallback(() => {
    setLibraryManagerOpen(true);
  }, []);

  const handleInsertLibraryCode = useCallback(
    (code) => {
      const activeTabData = tabs.find((tab) => tab.id === activeTab);
      if (!activeTabData) return;

      // Insert code at the beginning of the file (for includes) or at cursor position
      const currentContent = activeTabData.content || "";
      const newContent = code.startsWith("#include")
        ? code + "\n\n" + currentContent // Add includes at the top
        : currentContent + "\n" + code; // Add other code at the bottom

      setTabs(
        tabs.map((tab) =>
          tab.id === activeTab ? { ...tab, content: newContent } : tab,
        ),
      );

      // Update editor if it exists
      if (editorRef.current) {
        editorRef.current.setValue(newContent);
      }
    },
    [tabs, activeTab],
  );

  const [hasProduct, setHasProduct] = useState(() => !!localStorage.getItem("activeProjectIds"));

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.focus();
  };


  const goToFlowchart = () => {
    navigate("/flowchart");
  };

  const handleTabChange = useCallback(
    async (tab) => {
      // Save current editor state before navigating
      try {
        await saveEditorNow();
        await saveAllScreens();
        console.log("[CodeEditor] Saved state before tab change to:", tab);
      } catch (error) {
        console.error("[CodeEditor] Failed to save before tab change:", error);
      }

      const routes = {
        Simulation: "/simulation",
        Flowchart: "/FlowchartTest",
        BlockDiagram: "/BlockDiagram",
        BlockProgramming: "/blockprogramming",
        CodeEditor: "/editor",
      };
      const next = routes[tab];
      if (next) {
        navigate(next);
      }
    },
    [navigate],
  );

  const editorTheme = colorMode === "dark" ? "vs-dark" : "vs-light";
  const activeTabContent = activeTab?.content || "";
  const monacoLanguage = MONACO_LANGUAGE_MAP[language] || language;

  // Determine platform for library manager
  const currentPlatform =
    language === "esp32" || language === "arduino" ? "esp32" : "stm32";

  const filteredFiles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return null;
    return (tabs || []).filter((tab) => tab.name.toLowerCase().includes(query));
  }, [tabs, searchQuery]);
  const visibleTabs = filteredFiles || tabs;

  return (
    <>
      <EditorNavbar
        activeTab="Code Editor"
        onTabChange={handleTabChange}
        onLibrariesClick={handleLibrariesClick}
        user={userIdentity}
      />

      <Flex
        direction="column"
        h="calc(100vh - 72px)"
        w="100%"
        pt={0}
        pb={0}
        mt="72px"
        px={0}
        bg={colorMode === "dark" ? "#0b1220" : "#f5f7fb"}
        gap={0}
        overflow="hidden"
      >
        <Flex flex="1" gap={0} overflow="hidden" align="stretch">
          {/* Sidebar Drawer for Mobile */}
          <Drawer
            isOpen={isSidebarOpen}
            placement="left"
            onClose={onCloseSidebar}
            size="xs"
          >
            <DrawerOverlay display={{ base: "block", lg: "none" }} />
            <DrawerContent
              display={{ base: "block", lg: "none" }}
              bg={colorMode === "dark" ? "gray.800" : "white"}
            >
              <DrawerCloseButton />
              <DrawerHeader borderBottomWidth="1px" fontSize="sm">Explorer</DrawerHeader>
              <DrawerBody p={0}>
                <FileExplorerWithFlash
                  isFlashing={isFlashing}
                  onFlashComplete={handleFlashComplete}
                  onFlashStart={handleFlashStart}
                  colorMode={colorMode}
                />
              </DrawerBody>
            </DrawerContent>
          </Drawer>

          {/* Desktop Fixed Sidebar */}
          <Box
            display={{ base: "none", lg: "flex" }}
            width={`${sidebarWidth}px`}
            minW={`${sidebarWidth}px`}
            maxW={`${sidebarWidth}px`}
            flex={`0 0 ${sidebarWidth}px`}
            bg={colorMode === "dark" ? "rgba(15,23,42,0.72)" : "white"}
            px={1}
            py={2}
            flexDirection="column"
            gap={2}
            h="100%"
            overflowY="auto"
            css={{
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background:
                  colorMode === "dark"
                    ? "rgba(15,23,42,0.3)"
                    : "rgba(15,23,42,0.05)",
              },
              "&::-webkit-scrollbar-thumb": {
                background:
                  colorMode === "dark"
                    ? "rgba(148,163,184,0.3)"
                    : "rgba(148,163,184,0.4)",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background:
                  colorMode === "dark"
                    ? "rgba(148,163,184,0.5)"
                    : "rgba(148,163,184,0.6)",
              },
            }}
          >
            <Box
              flex="1"
              display="flex"
              flexDirection="column"
              gap={2}
              bg={
                colorMode === "dark"
                  ? "rgba(11,18,32,0.85)"
                  : "rgba(15,23,42,0.02)"
              }
              overflow="hidden"
            >
              <FileExplorerWithFlash
                isFlashing={isFlashing}
                onFlashComplete={handleFlashComplete}
                onFlashStart={handleFlashStart}
                colorMode={colorMode}
              />
            </Box>
          </Box>

          {/* Sidebar Drag Handle */}
          <Box
            display={{ base: "none", lg: "block" }}
            w="6px"
            bg="transparent"
            cursor="col-resize"
            className="sidebar-resizer"
            onMouseDown={startResizing}
            _hover={{ bg: colorMode === "dark" ? "rgba(59,130,246,0.35)" : "rgba(37,99,235,0.25)" }}
            transition="background 0.2s"
            zIndex={10}
          />

          <Flex
            id="editor-main-scroll-container"
            flex="1"
            direction="column"
            gap={1}
            minW={0}
            h="100%"
            overflow="hidden"
            css={{
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background:
                  colorMode === "dark"
                    ? "rgba(15,23,42,0.3)"
                    : "rgba(15,23,42,0.05)",
              },
              "&::-webkit-scrollbar-thumb": {
                background:
                  colorMode === "dark"
                    ? "rgba(148,163,184,0.3)"
                    : "rgba(148,163,184,0.4)",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background:
                  colorMode === "dark"
                    ? "rgba(148,163,184,0.5)"
                    : "rgba(148,163,184,0.6)",
              },
            }}
          >
            <Box
              position="relative"
              bg={colorMode === "dark" ? "rgba(15,23,42,0.72)" : "white"}
              p={2}
              display="flex"
              flexDirection="column"
              gap={2}
              flex="1"
              minH={0}
              overflow="hidden"
            >
              <WorkspaceHeader />
              <Flex
                align="center"
                flexWrap="wrap"
                gap={2}
                py={1}
              >
                {/* Mobile Sidebar Toggle */}
                <IconButton
                  display={{ base: "flex", lg: "none" }}
                  icon={<span>📁</span>}
                  size="xs"
                  onClick={onToggleSidebar}
                  aria-label="Toggle explorer"
                  variant="ghost"
                  color={colorMode === "dark" ? "white" : "gray.600"}
                  mr={2}
                />

                <HStack spacing={1} flex="1" overflowX="auto">
                  {tabs.map((tab) => {
                    const isActive = activeTabId === tab.id;
                    return (
                      <Flex
                        key={tab.id}
                        align="center"
                        onClick={() => handleTabClick(tab.id)}
                        px={2}
                        py={1.5}
                        bg={
                          isActive
                            ? "linear-gradient(135deg,#2563eb,#38bdf8)"
                            : "transparent"
                        }
                        color={
                          isActive
                            ? "white"
                            : colorMode === "dark"
                              ? "rgba(226,232,240,0.8)"
                              : "#0f172a"
                        }
                        fontSize="xs"
                        flexShrink={0}
                        whiteSpace="nowrap"
                        cursor="pointer"
                        transition="all 0.2s ease"
                        _hover={{
                          bg: isActive
                            ? "linear-gradient(135deg,#1d4ed8,#22d3ee)"
                            : "rgba(148,163,184,0.18)",
                        }}
                        maxW="120px"
                        textOverflow="ellipsis"
                        overflow="hidden"
                        gap={1}
                      >
                        <Flex align="center" gap={1} flex={1} minW={0}>
                          {editingTabId === tab.id ? (
                            <Input
                              size="xs"
                              value={tempName}
                              onChange={handleRenameChange}
                              onBlur={finishRenaming}
                              onKeyDown={handleRenameSubmit}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                              bg="white"
                              color="black"
                              borderColor="blue.500"
                              _focus={{ borderColor: "blue.500", boxShadow: "none" }}
                              h="20px"
                              minW="80px"
                            />
                          ) : (
                            <Text
                              noOfLines={1}
                              onDoubleClick={(e) => startRenaming(e, tab)}
                              title="Double-click to rename"
                              fontSize="xs"
                              userSelect="none"
                              display="flex"
                              alignItems="center"
                              gap="4px"
                            >
                              {tab.name}
                              {tab.dirty && (
                                <Box as="span" w="6px" h="6px" borderRadius="50%" bg={isActive ? "#fca5a5" : "#ef4444"} display="inline-block" flexShrink={0} />
                              )}
                            </Text>
                          )}
                        </Flex>
                        <IconButton
                          icon={<CloseIcon fontSize="6px" />}
                          size="xs"
                          aria-label="Close tab"
                          variant="ghost"
                          color={
                            isActive
                              ? "white"
                              : colorMode === "dark"
                                ? "rgba(226,232,240,0.7)"
                                : "#0f172a"
                          }
                          onClick={(event) => handleTabClose(tab.id, event)}
                          _hover={{
                            bg: isActive
                              ? "rgba(255,255,255,0.14)"
                              : "rgba(148,163,184,0.3)",
                          }}
                          minW="auto"
                          w="16px"
                          h="16px"
                        />
                      </Flex>
                    );
                  })}
                  <IconButton
                    icon={<AddIcon />}
                    size="xs"
                    onClick={addNewTab}
                    aria-label="Add new tab"
                    variant="outline"
                    borderColor={
                      colorMode === "dark"
                        ? "rgba(148,163,184,0.4)"
                        : "rgba(15,23,42,0.15)"
                    }
                    color={
                      colorMode === "dark" ? "rgba(226,232,240,0.9)" : "#0f172a"
                    }
                    _hover={{ bg: "rgba(56,189,248,0.2)" }}
                  />
                  <IconButton
                    icon={<Save size={14} />}
                    size="xs"
                    onClick={() => {
                      saveEditorNow();
                      toast({
                        title: "Code Saved",
                        description: "Your code has been saved successfully.",
                        status: "success",
                        duration: 2000,
                        isClosable: true,
                        position: "top-right"
                      });
                    }}
                    aria-label="Save code"
                    variant="outline"
                    borderColor={
                      colorMode === "dark"
                        ? "rgba(148,163,184,0.4)"
                        : "rgba(15,23,42,0.15)"
                    }
                    color={
                      colorMode === "dark" ? "rgba(226,232,240,0.9)" : "#0f172a"
                    }
                    _hover={{ bg: "rgba(56,189,248,0.2)" }}
                  />
                </HStack>

                <Flex align="center" gap={3}>
                  <CreateProductButton />
                  <Box display="none">
                    <LanguageSelector language={language} onSelect={onSelect} />
                  </Box>
                  <Box display="none">
                    <IconBar
                      placement="inline"
                      direction="row"
                      buttonSize="sm"
                      gap={2}
                      onBuildClick={handleBuildClick}
                      onDebugClick={handleDebugClick}
                      onFlashClick={handleFlashClick}
                      onEraseClick={handleEraseClick}
                      isDeviceConnected={isDeviceConnected}
                    />
                  </Box>
                </Flex>
              </Flex>

              <Box
                flex="1"
                borderRadius="xl"
                border="1px solid"
                borderColor={
                  colorMode === "dark"
                    ? "rgba(148,163,184,0.14)"
                    : "rgba(15,23,42,0.1)"
                }
                bg={
                  colorMode === "dark"
                    ? "rgba(11,18,32,0.78)"
                    : "rgba(15,23,42,0.02)"
                }
                overflow="hidden"
                position="relative"
                onClickCapture={() => {
                  if (isOutputExpanded) {
                    setIsOutputExpanded(false);
                  }
                }}
              >
                {/* Blinking canvas hint - disappears when user starts writing code */}
                {(!activeTab?.content || activeTab.content.trim() === (CODE_SNIPPETS["c"] || CODE_SNIPPETS["C"]).trim() || activeTab.content.trim() === "") && (
                  <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    zIndex={10}
                    pointerEvents="none"
                    textAlign="center"
                    width="100%"
                    animation="blink-canvas 2s ease-in-out infinite"
                  >
                    <Text
                      fontWeight="bold"
                      fontSize={{ base: "xl", md: "2xl", lg: "4xl" }}
                      color={colorMode === "dark" ? "rgba(153, 219, 248, 0.15)" : "rgba(7, 52, 148, 0.1)"}
                      letterSpacing="widest"
                      textTransform="uppercase"
                      userSelect="none"
                    >
                      USE ONLY C PROGRAMMING LANGUAGE
                    </Text>
                  </Box>
                )}
                <style>
                  {`
                    @keyframes blink-canvas {
                      0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                      50% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.98); }
                    }
                  `}
                </style>

                {["starting", "running", "ready", "stopped", "failed", "installing"].includes(runtimeState) ? (
                  <Flex h="100%">
                    <Box flex="1" h="100%">
                      <Editor
                        options={{
                          minimap: { enabled: false },
                          readOnly: false,
                          domReadOnly: false,
                          automaticLayout: true,
                          fontSize: 14,
                          scrollBeyondLastLine: false,
                          tabSize: 2,
                          wordWrap: "on"
                        }}
                        height="100%"
                        width="100%"
                        theme={editorTheme}
                        language={monacoLanguage}
                        value={activeTabContent}
                        onMount={handleEditorDidMount}
                        onChange={handleEditorChange}
                      />
                    </Box>
                    <PreviewPanel />
                  </Flex>
                ) : runtimeState !== "idle" && runtimeState !== "uploading" ? (
                  <ProcessingTimeline />
                ) : (
                  <Editor
                    options={{
                      minimap: { enabled: false },
                      readOnly: false,
                      domReadOnly: false,
                      automaticLayout: true,
                      fontSize: 14,
                      scrollBeyondLastLine: false,
                      tabSize: 2,
                      wordWrap: "on"
                    }}
                    height="100%"
                    width="100%"
                    theme={editorTheme}
                    language={monacoLanguage}
                    value={activeTabContent}
                    onMount={handleEditorDidMount}
                    onChange={handleEditorChange}
                  />
                )}
              </Box>
            </Box>
            <Box
              borderRadius="2xl"
              bg={colorMode === "dark" ? "rgba(15,23,42,0.72)" : "white"}
              border="1px solid"
              borderColor={
                colorMode === "dark"
                  ? "rgba(148,163,184,0.14)"
                  : "rgba(15,23,42,0.1)"
              }
              boxShadow={
                colorMode === "dark"
                  ? "0 30px 60px rgba(8,15,32,0.45)"
                  : "0 24px 60px rgba(15,23,42,0.06)"
              }
              p={2}
              h={isOutputExpanded ? { base: "300px", lg: "420px" } : { base: "160px", lg: "220px" }}
              transition="height 0.3s ease-in-out"
              flexShrink={0}
              display="flex"
              flexDirection="column"
              overflow="hidden"
            >
              <Output
                ref={outputRef}
                editorRef={editorRef}
                language={language}
                id="code-editor-output"
                onFlashComplete={handleFlashComplete}
                onFlashStart={handleFlashStart}
                onExpand={() => setIsOutputExpanded(true)}
                onCollapse={() => setIsOutputExpanded(false)}
              />
            </Box>
          </Flex>
        </Flex>
      </Flex>

      {activeToolPanel === "build" && (
        <Box
          position="fixed"
          top={{ base: "70px", md: "120px" }}
          right={{ base: "0", md: "24px" }}
          width={{ base: "100%", md: "240px" }}
          zIndex={1200}
        >
          <Box
            bg={colorMode === "dark" ? "rgba(15,23,42,0.92)" : "white"}
            p={5}
            display="flex"
            flexDirection="column"
            gap={4}
          >
            <Flex justify="space-between" align="center">
              <Text fontWeight="bold">Build Console</Text>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setActiveToolPanel(null)}
              >
                Close
              </Button>
            </Flex>
            <Text
              fontSize="sm"
              color={colorMode === "dark" ? "gray.300" : "gray.600"}
            >
              Access compiler output, serial logs, or the integrated terminal
              from the console panel below.
            </Text>
            <Button size="sm" colorScheme="blue" onClick={handleScrollToOutput}>
              Jump to Console
            </Button>
          </Box>
        </Box>
      )}

      {activeToolPanel === "debug" && (
        <Box position="fixed" top={{ base: "70px", md: "120px" }} right={{ base: "0", md: "24px" }} width={{ base: "100%", md: "auto" }} zIndex={1200}>
          <Box position="relative">
            <Button
              size="xs"
              variant="ghost"
              position="absolute"
              top={2}
              right={2}
              onClick={() => setActiveToolPanel(null)}
              zIndex={1}
            >
              Close
            </Button>
            <Debug
              status={debugStatus}
              lastAction={debugLastAction}
              isBusy={debugBusy}
              onRun={handleRunAndDebug}
              onContinue={handleDebugContinue}
              onRestart={handleDebugRestart}
              onStepInto={handleDebugStepInto}
              onStepOut={handleDebugStepOut}
              onStepOver={handleDebugStepOver}
              onStop={handleDebugStop}
              threads={debugThreads}
              breakpoints={debugBreakpoints}
              variables={debugVariables}
              logs={debugLogs}
            />
          </Box>
        </Box>
      )}

      <Erase isOpen={isEraseOpen} onClose={() => setEraseOpen(false)} />

      <LibraryManager
        isOpen={isLibraryManagerOpen}
        onClose={() => setLibraryManagerOpen(false)}
        onInsertCode={handleInsertLibraryCode}
        currentPlatform={currentPlatform}
      />

      {/* Create Product Modal */}
      <Modal
        isOpen={isCreateProductModalOpen}
        onClose={handleCloseCreateProductModal}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Product Configuration</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <ProductDefinition
              onSuccess={() => {
                setHasProduct(true);
                handleCloseCreateProductModal();
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* ESP32 Firmware Flasher Wizard & App Companion */}
      <Modal
        isOpen={isFlashModalOpen}
        onClose={onCloseFlashModal}
        size="6xl"
        isCentered
        scrollBehavior="inside"
      >
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
        <ModalContent
          bg={colorMode === "dark" ? "gray.900" : "white"}
          borderRadius="2xl"
          overflow="hidden"
          maxW="1400px"
        >
          <ModalHeader
            py={3}
            px={5}
            borderBottom="1px solid"
            borderColor={colorMode === "dark" ? "gray.800" : "gray.200"}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text fontSize="md" fontWeight="bold">Device Firmware Flasher & App Companion</Text>
            <ModalCloseButton position="relative" top="0" right="0" />
          </ModalHeader>
          <ModalBody p={4} maxH="85vh" overflowY="auto">
            <ESP32Flasher
              code={activeTab?.content}
              onClose={onCloseFlashModal}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CodeEditor;
