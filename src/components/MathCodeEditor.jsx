import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
} from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import { AddIcon, CloseIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { useLocation, useNavigate } from "react-router-dom";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS, MONACO_LANGUAGE_MAP } from "../constants";
import Output from "./Output";
import { useCodeEditorAutoSave, useGlobalAutoSave } from "../hooks/useAutoSave";
import { useResizableSidebar } from "../hooks/useResizableSidebar";
import { useDispatch, useSelector } from "react-redux";
import {
    setTabs,
    setActiveTab,
    addTab,
    closeTab,
    updateTabContent as updateReduxTabContent,
    renameTab as renameReduxTab,
} from "../store/slices/mathEditorSlice";

import IconBar from "./IconBar";
import FileExplorer from "./FileExplorer";
import Debug from "./Debug";
import Flash from "./Flash";
import DefineProductButton from "./shared/DefineProductButton";
import MathWidgetButton from "./shared/MathWidgetButton";
import ScientificCalculator from "./ScientificCalculator";
import { calculatorService } from "../services/calculatorService";
import { getUserInfo } from "../utils/platformUtils";
// Component to handle FileExplorer and Flash panel layout  
const FileExplorerWithFlash = ({ isFlashing, onFlashComplete, onFlashStart, colorMode }) => {
    const [isDeviceConnected, setIsDeviceConnected] = useState(() => {
        // Check localStorage for persisted device connection state
        const savedState = localStorage.getItem('innoide:device-connected');
        return savedState === 'true';
    });

    useEffect(() => {
        const handleDeviceConnect = () => {
            setIsDeviceConnected(true);
            localStorage.setItem('innoide:device-connected', 'true');
        };
        const handleDeviceDisconnect = () => {
            setIsDeviceConnected(false);
            localStorage.setItem('innoide:device-connected', 'false');
        };

        window.addEventListener('innoide:device-detect-complete', handleDeviceConnect);
        window.addEventListener('innoide:device-disconnect', handleDeviceDisconnect);

        return () => {
            window.removeEventListener('innoide:device-detect-complete', handleDeviceConnect);
            window.removeEventListener('innoide:device-disconnect', handleDeviceDisconnect);
        };
    }, []);

    if (isFlashing) {
        return (
            <Box flex="1" p={3} overflowY="auto">
                <Flash onFlashComplete={onFlashComplete} onFlashStart={onFlashStart} />
            </Box>
        );
    }

    return (
        <Box flex="1" display="flex" flexDirection="column" overflow="hidden">
            <Box
                flex="1"
                overflowY="auto"
                p={3}
                minH="300px"
                h="50%"
            >
                <FileExplorer variant="diagram" />
            </Box>
            {/* Always show Flash panel so users can connect their device */}
            <Box
                borderTop="1px solid"
                borderColor={colorMode === "dark" ? "rgba(148,163,184,0.12)" : "rgba(15,23,42,0.08)"}
                p={3}
                maxH="300px"
                minH="250px"
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
import { Save } from "lucide-react";

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
    const phone = (data.phone || data.mobileNumber || data.phoneNumber || "").trim();
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

const MathCodeEditor = ({ currentPanel, onDebugClick, onFlashClick }) => {
    const editorRef = useRef();
    const monacoRef = useRef();
    const outputRef = useRef(null);
    const { sidebarWidth, startResizing } = useResizableSidebar(340, 250, 600);

    const dispatch = useDispatch();
    const { tabs, activeTabId } = useSelector((state) => state.mathEditor);
    const activeTabObj = useMemo(
        () => tabs.find((t) => t.id === activeTabId),
        [tabs, activeTabId],
    );

    const {
        saveNow: saveEditorNow,
    } = useCodeEditorAutoSave(
        activeTabObj?.content || "",
        {
            screenKey: "/mathcodeeditor",
            tabs,
            activeTab: activeTabId,
        }
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

    const [language, setLanguage] = useState("Select Languages");
    const [searchQuery, setSearchQuery] = useState("");
    const [sidebarMode, setSidebarMode] = useState("explorer");
    const [activeToolPanel, setActiveToolPanel] = useState(null);
    const [isFlashing, setIsFlashing] = useState(false);
    const [isDeviceConnected, setIsDeviceConnected] = useState(false);
    const [isEraseOpen, setEraseOpen] = useState(false);
    const [isLibraryManagerOpen, setLibraryManagerOpen] = useState(false);
    const [debugStatus, setDebugStatus] = useState("idle");
    const [debugLastAction, setDebugLastAction] = useState(null);
    const [debugBusy, setDebugBusy] = useState(false);
    const [debugLogs, setDebugLogs] = useState([]);
    const [debugThreads, setDebugThreads] = useState([
        { id: "thread-main", name: "Main Thread", state: "idle" },
    ]);
    const [debugVariables, setDebugVariables] = useState([]);
    const [debugBreakpoints, setDebugBreakpoints] = useState([]);
    const [savedEquations, setSavedEquations] = useState([]);
    const [loadingEquations, setLoadingEquations] = useState(false);
    const [showEquationsList, setShowEquationsList] = useState(false);
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
        [tabs, activeTabId]
    );

    const handleRenameTab = useCallback(
        (tabId) => {
            const targetTab = tabs.find((tab) => tab.id === tabId);
            if (!targetTab) return;

            const requested = window.prompt('Rename tab', targetTab.name || '');
            if (requested === null) return;

            const trimmed = requested.trim();
            if (!trimmed || trimmed === targetTab.name) return;

            dispatch(renameReduxTab({ tabId, name: trimmed }));
        },
        [tabs, dispatch]
    );

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

    // Listen for device connection events and persist state
    useEffect(() => {
        // Initialize from localStorage
        const savedState = localStorage.getItem('innoide:device-connected');
        if (savedState === 'true') {
            setIsDeviceConnected(true);
        }

        const handleDeviceConnect = () => {
            setIsDeviceConnected(true);
            localStorage.setItem('innoide:device-connected', 'true');
        };
        const handleDeviceDisconnect = () => {
            setIsDeviceConnected(false);
            localStorage.setItem('innoide:device-connected', 'false');
        };
        const handleDeviceFailed = () => {
            setIsDeviceConnected(false);
            localStorage.setItem('innoide:device-connected', 'false');
        };

        window.addEventListener('innoide:device-detect-complete', handleDeviceConnect);
        window.addEventListener('innoide:device-disconnect', handleDeviceDisconnect);
        window.addEventListener('innoide:device-detect-failed', handleDeviceFailed);

        return () => {
            window.removeEventListener('innoide:device-detect-complete', handleDeviceConnect);
            window.removeEventListener('innoide:device-disconnect', handleDeviceDisconnect);
            window.removeEventListener('innoide:device-detect-failed', handleDeviceFailed);
        };
    }, []);

    const handleFlashClick = useCallback(async () => {
        if (!isDeviceConnected) {
            toast({
                title: "No device connected",
                description: "Please connect a device before flashing.",
                status: "warning",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        const flashRunner = outputRef.current?.flashCode;

        if (typeof flashRunner === "function") {
            setIsFlashing(true);
            await flashRunner();
        }
    }, [isDeviceConnected]);

    const handleEraseClick = useCallback(() => {
        if (!isDeviceConnected) {
            toast({
                title: "No device connected",
                description: "Please connect a device before erasing data.",
                status: "warning",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        setEraseOpen(true);
        setActiveToolPanel(null);
    }, [isDeviceConnected]);

    const handleScrollToOutput = useCallback(() => {
        const node = document.getElementById("code-editor-output");
        if (node) {
            node.scrollIntoView({ behavior: "smooth", block: "center" });
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
            const filtered = prev.filter((item) => !["lastStep", "currentLine"].includes(item.name));
            const currentLine = prev.find((item) => item.name === "currentLine");
            const nextLine = currentLine ? Number.parseInt(currentLine.value, 10) + 1 : 1;
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
                const message = result?.error?.message || result?.reason || "unknown error";
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
                    ]
            );
            pushDebugLog(
                hasStdErr
                    ? `${label} completed with stderr output.`
                    : `${label} completed successfully.`
            );
            if (hasStdErr) {
                pushDebugOutput(`${label} completed with stderr output.`);
            } else if (!result.stdout?.trim()) {
                pushDebugOutput(`${label} completed with no stdout.`);
            }

            return result;
        },
        [activeTabName, inferVariablesFromStdout, pushDebugLog, pushDebugOutput, setThreadState]
    );

    const handleRunAndDebug = useCallback(async () => {
        if (!isDeviceConnected) {
            toast({
                title: "No device connected",
                description: "Please connect a device before running.",
                status: "warning",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        setActiveToolPanel("debug");
        await runProgram({ reason: "run-debug", append: false, label: "Run & Debug" });
    }, [runProgram, isDeviceConnected]);

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
        if (!isDeviceConnected) {
            toast({
                title: "No device connected",
                description: "Please connect a device before building.",
                status: "warning",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

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
    }, [runProgram, isDeviceConnected]);

    const handleDebugClick = useCallback(() => {
        if (!isDeviceConnected) {
            toast({
                title: "No device connected",
                description: "Please connect a device before debugging.",
                status: "warning",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        if (activeToolPanel === "debug") {
            setActiveToolPanel(null);
            return;
        }
        setActiveToolPanel("debug");
        handleRunAndDebug();
    }, [activeToolPanel, handleRunAndDebug, isDeviceConnected]);

    const handleLibrariesClick = useCallback(() => {
        setLibraryManagerOpen(true);
    }, []);

    const handleInsertLibraryCode = useCallback((code) => {
        if (!activeTabObj) return;

        const currentContent = activeTabObj.content || "";
        const newContent = code.startsWith('#include')
            ? code + '\n\n' + currentContent
            : currentContent + '\n' + code;

        updateTabContent(activeTabId, newContent);

        if (editorRef.current) {
            editorRef.current.setValue(newContent);
        }
    }, [activeTabObj, activeTabId, updateTabContent]);

    const onMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        editor.focus();
    };

    const handleEditorChange = (newValue) => {
        if (activeTabId) {
            updateTabContent(activeTabId, newValue);
        }
    };

    const handleTabClose = (tabId, event) => {
        event.stopPropagation();
        dispatch(closeTab(tabId));
    };

    const goToFlowchart = () => {
        navigate("/flowchart");
    };

    const handleTabChange = useCallback(
        (tab) => {
            const routes = {
                Simulation: "/simulation",
                Flowchart: "/FlowchartTest",
                "Block Diagram": "/BlockDiagram",
                "Block Programming": "/blockprogramming",
                "Code Editor": "/editor",
            };
            const next = routes[tab];
            if (next) {
                navigate(next);
            }
        },
        [navigate]
    );

    const editorTheme = colorMode === "dark" ? "vs-dark" : "vs-light";
    const activeTabContent = activeTabObj?.content || "";
    const monacoLanguage = MONACO_LANGUAGE_MAP[language] || language;

    // Determine platform for library manager
    const currentPlatform = language === 'esp32' || language === 'arduino' ? 'esp32' : 'stm32';

    const filteredFiles = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return null;
        return (tabs || []).filter((tab) => tab.name.toLowerCase().includes(query));
    }, [tabs, searchQuery]);
    const visibleTabs = filteredFiles || tabs;

    // Resolve user credentials — fall back to the default admin account when not logged in
    const getEffectiveUserInfo = useCallback(() => {
        const userInfo = getUserInfo();
        return {
            userId: userInfo?.userId || userInfo?._id || "6926c69500610847a79be7eb",
            isAdmin: userInfo?.isAdmin ?? 1,
        };
    }, []);

    // Fetch saved equations from the backend
    const fetchEquations = useCallback(async () => {
        setLoadingEquations(true);
        try {
            const { userId, isAdmin } = getEffectiveUserInfo();
            const response = await calculatorService.getEquations(userId, isAdmin);
            const raw = response?.data ?? response ?? [];
            if (Array.isArray(raw)) {
                const normalised = raw.map((eq) => ({
                    id:         eq._id   || eq.id,
                    name:       eq.equationName || eq.name || 'Equation',
                    expression: eq.equation     || eq.expression || '',
                    result:     eq.result        || '',
                    timestamp:  eq.createdAt
                                    ? new Date(eq.createdAt).toLocaleString()
                                    : (eq.timestamp || ''),
                }));
                setSavedEquations(normalised);
            }
        } catch (error) {
            console.error('Failed to fetch equations:', error);
        } finally {
            setLoadingEquations(false);
        }
    }, [getEffectiveUserInfo]);

    // Load equations on mount
    useEffect(() => {
        fetchEquations();
    }, [fetchEquations]);

    // Handler for loading equation into editor
    const handleLoadEquation = useCallback((equation) => {
        const expr = equation.expression || equation.equation || '';
        if (activeTabId && expr) {
            const equationText = `// ${equation.name || equation.equationName || 'Equation'}
// Saved: ${equation.timestamp || ''}
${expr}
// Result: ${equation.result || ''}
`;
            updateTabContent(activeTabId, equationText);
        }
        setShowEquationsList(false);
    }, [activeTabId, updateTabContent]);

    // Re-fetch from backend after a save so the list stays in sync
    const handleSaveEquationFromCalculator = useCallback(() => {
        fetchEquations();
    }, [fetchEquations]);

    return (
        <>
            <EditorNavbar
                activeTab="MathCodeEditor"
                onTabChange={handleTabChange}
                onLibrariesClick={handleLibrariesClick}
                user={userIdentity}
            />
            <Flex
                direction="column"
                minH="calc(100vh - 64px)"
                w="100%"
                pt={2}
                pb={2}
                mt={14}
                px={{ base: 2, lg: 4 }}
                bg={colorMode === "dark" ? "#0b1220" : "#f5f7fb"}
                gap={2}
            >
                <Flex flex="1" gap={2} overflow="hidden" align="stretch" direction={{ base: "column", lg: "row" }}>
                    <Box
                        w={{ base: "100%", lg: `${sidebarWidth}px` }}
                        minW={{ lg: `${sidebarWidth}px` }}
                        maxW={{ lg: `${sidebarWidth}px` }}
                        flex={{ lg: `0 0 ${sidebarWidth}px` }}
                        bg={colorMode === "dark" ? "rgba(15,23,42,0.72)" : "white"}
                        border="1px solid"
                        borderColor={colorMode === "dark" ? "rgba(148,163,184,0.18)" : "rgba(15,23,42,0.08)"}
                        borderRadius="2xl"
                        boxShadow={colorMode === "dark" ? "0 30px 60px rgba(8,15,32,0.55)" : "0 24px 56px rgba(15,23,42,0.08)"}
                        p={0}
                        display="flex"
                        flexDirection="column"
                        backdropFilter="blur(16px)"
                        overflow="hidden"
                    >
                        <ScientificCalculator 
                            onSaveEquation={handleSaveEquationFromCalculator} 
                            onInsertResult={(value) => {
                                if (editorRef.current && monacoRef.current) {
                                  const editor = editorRef.current;
                                  const monacoInstance = monacoRef.current;
                                  const selection = editor.getSelection();
                                  const range = new monacoInstance.Range(
                                    selection.startLineNumber,
                                    selection.startColumn,
                                    selection.endLineNumber,
                                    selection.endColumn
                                  );
                                  editor.executeEdits("calculator-insert", [
                                    { range, text: value, forceMoveMarkers: true }
                                  ]);
                                  editor.focus();
                                }
                            }}
                        />
                    </Box>

                    {/* Sidebar Drag Handle */}
                    <Box
                        display={{ base: "none", lg: "block" }}
                        w="6px"
                        bg="transparent"
                        cursor="col-resize"
                        className="sidebar-resizer"
                        onMouseDown={startResizing}
                        zIndex={10}
                    />

                    <Flex flex="1" direction="column" gap={2} minW={0}>
                        <Box
                            position="relative"
                            borderRadius="2xl"
                            bg={colorMode === "dark" ? "rgba(15,23,42,0.72)" : "white"}
                            border="1px solid"
                            borderColor={colorMode === "dark" ? "rgba(148,163,184,0.14)" : "rgba(15,23,42,0.1)"}
                            boxShadow={colorMode === "dark" ? "0 40px 80px rgba(8,15,32,0.55)" : "0 32px 64px rgba(15,23,42,0.1)"}
                            px={{ base: 2, md: 3 }}
                            py={{ base: 2, md: 3 }}
                            display="flex"
                            flexDirection="column"
                            gap={2}
                            flex="1"
                            overflow="hidden"
                        >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
                                    <HStack spacing={2} flex="1" overflowX="auto">
                                        {tabs.map((tab) => {
                                            const isActive = activeTabId === tab.id;
                                            return (
                                                <Flex
                                                    key={tab.id}
                                                    align="center"
                                                    onClick={() => handleTabClick(tab.id)}
                                                    px={3}
                                                    py={2}
                                                    bg={isActive ? "linear-gradient(135deg,#2563eb,#38bdf8)" : "transparent"}
                                                    color={isActive ? "white" : colorMode === "dark" ? "rgba(226,232,240,0.8)" : "#0f172a"}
                                                    fontSize="sm"
                                                    flexShrink={0}
                                                    borderRadius="md"
                                                    whiteSpace="nowrap"
                                                    cursor="pointer"
                                                    transition="all 0.2s ease"
                                                    _hover={{ bg: isActive ? "linear-gradient(135deg,#1d4ed8,#22d3ee)" : "rgba(148,163,184,0.18)" }}
                                                    maxW="120px"
                                                    textOverflow="ellipsis"
                                                    overflow="hidden"
                                                    gap={1}
                                                >
                                                    <Text noOfLines={1} onDoubleClick={() => handleRenameTab(tab.id)} title="Double-click to rename" fontSize="xs" display="flex" alignItems="center" gap="4px">
                                                        {tab.name}
                                                        {tab.dirty && (
                                                            <Box as="span" w="6px" h="6px" borderRadius="50%" bg={isActive ? "#fca5a5" : "#ef4444"} display="inline-block" flexShrink={0} />
                                                        )}
                                                    </Text>
                                                    <IconButton
                                                        icon={<CloseIcon fontSize="6px" />}
                                                        size="xs"
                                                        aria-label="Close tab"
                                                        variant="ghost"
                                                        color={isActive ? "white" : colorMode === "dark" ? "rgba(226,232,240,0.7)" : "#0f172a"}
                                                        onClick={(event) => handleTabClose(tab.id, event)}
                                                        _hover={{ bg: isActive ? "rgba(255,255,255,0.14)" : "rgba(148,163,184,0.3)" }}
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
                                            borderColor={colorMode === "dark" ? "rgba(148,163,184,0.4)" : "rgba(15,23,42,0.15)"}
                                            color={colorMode === "dark" ? "rgba(226,232,240,0.9)" : "#0f172a"}
                                            _hover={{ bg: "rgba(56,189,248,0.2)" }}
                                        />
                                        <IconButton
                                            icon={<Save size={14} />}
                                            size="xs"
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                if (saveEditorNow) await saveEditorNow();
                                            }}
                                            aria-label="Save"
                                            variant="outline"
                                            borderColor={colorMode === "dark" ? "rgba(148,163,184,0.4)" : "rgba(15,23,42,0.15)"}
                                            color={colorMode === "dark" ? "rgba(226,232,240,0.9)" : "#0f172a"}
                                            _hover={{ bg: "rgba(56,189,248,0.2)" }}
                                        />
                                    </HStack>
                                </Flex>

                                <Box position="relative">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setShowEquationsList(!showEquationsList)}
                                        borderColor={colorMode === "dark" ? "rgba(148,163,184,0.4)" : "rgba(15,23,42,0.15)"}
                                        color={colorMode === "dark" ? "rgba(226,232,240,0.9)" : "#0f172a"}
                                        _hover={{ bg: "rgba(56,189,248,0.2)" }}
                                        rightIcon={
                                            <span style={{ fontSize: '10px' }}>▼</span>
                                        }
                                    >
                                        List
                                    </Button>
                                    {showEquationsList && (
                                        <Box
                                            position="absolute"
                                            top="calc(100% + 5px)"
                                            right="0"
                                            bg={colorMode === "dark" ? "rgba(15,23,42,0.95)" : "white"}
                                            border="1px solid"
                                            borderColor={colorMode === "dark" ? "rgba(148,163,184,0.2)" : "rgba(15,23,42,0.1)"}
                                            borderRadius="md"
                                            boxShadow="0 8px 24px rgba(0, 0, 0, 0.3)"
                                            minW="250px"
                                            maxW="300px"
                                            maxH="300px"
                                            overflowY="auto"
                                            zIndex={1000}
                                        >
                                            {loadingEquations ? (
                                                <Box p={3} textAlign="center" fontSize="sm" color={colorMode === "dark" ? "gray.400" : "gray.600"}>
                                                    Loading…
                                                </Box>
                                            ) : savedEquations.length === 0 ? (
                                                <Box p={3} textAlign="center" fontSize="sm" color={colorMode === "dark" ? "gray.400" : "gray.600"}>
                                                    No saved equations
                                                </Box>
                                            ) : (
                                                savedEquations.map((eq) => (
                                                    <Box
                                                        key={eq.id}
                                                        p={3}
                                                        borderBottom="1px solid"
                                                        borderColor={colorMode === "dark" ? "rgba(148,163,184,0.1)" : "rgba(15,23,42,0.05)"}
                                                        cursor="pointer"
                                                        transition="background 0.2s"
                                                        _hover={{ bg: colorMode === "dark" ? "rgba(148,163,184,0.1)" : "rgba(15,23,42,0.05)" }}
                                                        onClick={() => handleLoadEquation(eq)}
                                                    >
                                                        <Text fontSize="sm" fontWeight="600" color={colorMode === "dark" ? "gray.200" : "gray.800"} mb={1}>
                                                            {eq.name || eq.equationName || ('Equation ' + eq.id)}
                                                        </Text>
                                                        <Text fontSize="xs" color={colorMode === "dark" ? "gray.400" : "gray.600"} noOfLines={2}>
                                                            {eq.expression || eq.equation}
                                                        </Text>
                                                        {eq.timestamp && (
                                                            <Text fontSize="10px" color={colorMode === "dark" ? "gray.500" : "gray.500"} mt={1}>
                                                                {eq.timestamp}
                                                            </Text>
                                                        )}
                                                    </Box>
                                                ))
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            </div>

                            <Box
                                flex="1"
                                borderRadius="xl"
                                border="1px solid"
                                borderColor={colorMode === "dark" ? "rgba(148,163,184,0.14)" : "rgba(15,23,42,0.1)"}
                                bg={colorMode === "dark" ? "rgba(11,18,32,0.78)" : "rgba(15,23,42,0.02)"}
                                overflow="hidden"
                                position="relative"
                            >
                                {(!activeTabContent || activeTabContent.trim() === "") && (
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
                                        <style>{`
                                            @keyframes blink-canvas {
                                                0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                                                50% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.98); }
                                            }
                                        `}</style>
                                        <Text
                                            fontWeight="bold"
                                            fontSize={{ base: "xl", md: "2xl", lg: "4xl" }}
                                            color={colorMode === "dark" ? "rgba(153, 219, 248, 0.15)" : "rgba(7, 52, 148, 0.1)"}
                                            letterSpacing="widest"
                                            textTransform="uppercase"
                                            userSelect="none"
                                        >
                                            Advanced MathCode Workspace
                                        </Text>
                                    </Box>
                                )}
                                <Editor
                                    options={{
                                        minimap: { enabled: false },
                                    }}
                                    height="100%"
                                    width="100%"
                                    theme={editorTheme}
                                    language={monacoLanguage}
                                    value={activeTabContent}
                                    onMount={onMount}
                                    onChange={handleEditorChange}
                                />
                            </Box>

                        </Box>
                    </Flex>
                </Flex>
            </Flex>

            {activeToolPanel === "build" && (
                <Box
                    position="fixed"
                    top="120px"
                    right="24px"
                    width={{ base: "280px", md: "240px" }}
                    zIndex={1200}
                >
                    <Box
                        bg={colorMode === "dark" ? "rgba(15,23,42,0.92)" : "white"}
                        borderRadius="xl"
                        border="1px solid"
                        borderColor={colorMode === "dark" ? "rgba(148,163,184,0.2)" : "rgba(15,23,42,0.12)"}
                        boxShadow={colorMode === "dark" ? "0 40px 80px rgba(8,15,32,0.65)" : "0 24px 64px rgba(15,23,42,0.12)"}
                        p={5}
                        display="flex"
                        flexDirection="column"
                        gap={4}
                    >
                        <Flex justify="space-between" align="center">
                            <Text fontWeight="bold">Build Console</Text>
                            <Button size="xs" variant="ghost" onClick={() => setActiveToolPanel(null)}>
                                Close
                            </Button>
                        </Flex>
                        <Text fontSize="sm" color={colorMode === "dark" ? "gray.300" : "gray.600"}>
                            Access compiler output, serial logs, or the integrated terminal from the console panel below.
                        </Text>
                        <Button size="sm" colorScheme="blue" onClick={handleScrollToOutput}>
                            Jump to Console
                        </Button>
                    </Box>
                </Box>
            )}

            {activeToolPanel === "debug" && (
                <Box position="fixed" top="120px" right="24px" zIndex={1200}>
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
        </>
    );
};

export default MathCodeEditor;