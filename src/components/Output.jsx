import { useState, useEffect, forwardRef, useRef, useImperativeHandle, useMemo, useCallback } from "react";
import {
  Box,
  Text,
  Button,
  IconButton,
  useColorMode,
  useToast,
  Input,
  Select,
  Textarea,
  VStack,
  HStack,
  Badge,
  Tooltip,
  Spinner,
  Checkbox,
  Flex,
  Collapse
} from "@chakra-ui/react";
import {
  Play,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Terminal as TerminalIcon,
  Bug,
  Radio,
  RefreshCw,
  Send,
  CornerDownLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ExternalLink,
  Zap,
  RotateCcw,
  FileText,
  Layers,
  Search
} from "lucide-react";
import { executeCode } from "../api";
import { useSelector } from "react-redux";
import TerminalPanel from "../features/workspace/terminal/components/TerminalPanel";
import axios from "axios";
import ApiBuilderPanel from "./ApiBuilderPanel";

const Output = forwardRef(({ editorRef, language, onExpand, onCollapse, ...rest }, ref) => {
  const { runtimeState } = useSelector((state) => state.workspace);
  const panelRef = useRef(null);
  const terminalBottomRef = useRef(null);
  const debugBottomRef = useRef(null);
  const outputBottomRef = useRef(null);
  const toast = useToast();
  const { colorMode } = useColorMode();

  // Active Bottom Tab
  const [activePanel, setActivePanel] = useState("viewOutput");

  // View Output State
  const [output, setOutput] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [showStdin, setShowStdin] = useState(false);
  const [executionSummary, setExecutionSummary] = useState(null); // { exitCode, durationMs, isError }
  const [copiedOutput, setCopiedOutput] = useState(false);

  // Problem Diagnostics State
  const [compilerProblems, setCompilerProblems] = useState([]);
  const [monacoProblems, setMonacoProblems] = useState([]);
  const [problemFilter, setProblemFilter] = useState("all"); // "all" | "errors" | "warnings"

  // Debug Console & Serial Monitor State
  const [serialOutput, setSerialOutput] = useState([
    `[${new Date().toLocaleTimeString()}] [SYSTEM] InnoIDE Debug Engine initialized.`
  ]);
  const [debugInput, setDebugInput] = useState("");
  const [debugHistory, setDebugHistory] = useState([]);
  const [debugHistoryIdx, setDebugHistoryIdx] = useState(-1);
  const [isConnectedToDevice, setIsConnectedToDevice] = useState(false);
  const [availablePorts, setAvailablePorts] = useState(["COM3", "COM5"]);
  const [selectedPort, setSelectedPort] = useState("COM3");
  const [baudRate, setBaudRate] = useState("115200");
  const [isScanningPorts, setIsScanningPorts] = useState(false);
  const [debugAutoScroll, setDebugAutoScroll] = useState(true);
  const [debugShowTimestamps, setDebugShowTimestamps] = useState(true);

  // Terminal State
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalOutput, setTerminalOutput] = useState([
    "┌─────────────────────────────────────────────────────────────┐",
    "│  InnoIDE Embedded Shell Environment v2.4                   │",
    "│  Type 'help' for available commands or 'run' to compile.    │",
    "└─────────────────────────────────────────────────────────────┘"
  ]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cwd, setCwd] = useState("/home/user/workspace");

  // Postman State
  const [postmanUrl, setPostmanUrl] = useState("https://jsonplaceholder.typicode.com/todos/1");
  const [postmanMethod, setPostmanMethod] = useState("GET");
  const [postmanBody, setPostmanBody] = useState("");
  const [postmanResponse, setPostmanResponse] = useState(null);
  const [postmanLoading, setPostmanLoading] = useState(false);

  // Auto-scroll helper
  const scrollToPanel = useCallback(() => {
    if (panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // -------------------------------------------------------------
  // Problem Extraction & Real-time Diagnostics
  // -------------------------------------------------------------
  const parseProblemsFromOutput = useCallback((outputLines = []) => {
    const problems = [];
    const gccRegex = /^(?:.*[/\\])?([^:\n]+):(\d+):(?:(\d+):)?\s*(error|fatal error|warning|note):\s*(.*)$/i;
    const pyRegex = /File "([^"]+)", line (\d+)(?:.*)?\n?(?:SyntaxError|TypeError|ValueError|NameError)?:\s*(.*)/i;
    const genericLineRegex = /line\s+(\d+)(?::(\d+))?.*?(error|warning):\s*(.*)/i;

    outputLines.forEach((line, idx) => {
      let match = line.match(gccRegex);
      if (match) {
        problems.push({
          id: `prob-gcc-${idx}-${Date.now()}`,
          file: match[1],
          line: parseInt(match[2], 10),
          column: match[3] ? parseInt(match[3], 10) : 1,
          severity: match[4].toLowerCase().includes("err") ? "error" : match[4].toLowerCase().includes("warn") ? "warning" : "info",
          message: match[5]?.trim() || line,
          source: "Compiler (GCC/Clang)"
        });
        return;
      }

      match = line.match(pyRegex);
      if (match) {
        problems.push({
          id: `prob-py-${idx}-${Date.now()}`,
          file: match[1],
          line: parseInt(match[2], 10),
          column: 1,
          severity: "error",
          message: match[3]?.trim() || line,
          source: "Python Runtime"
        });
        return;
      }

      match = line.match(genericLineRegex);
      if (match) {
        problems.push({
          id: `prob-gen-${idx}-${Date.now()}`,
          file: "source",
          line: parseInt(match[1], 10),
          column: match[2] ? parseInt(match[2], 10) : 1,
          severity: match[3].toLowerCase().includes("err") ? "error" : "warning",
          message: match[4]?.trim() || line,
          source: "Compiler"
        });
      }
    });

    return problems;
  }, []);

  // Poll / Listen to Monaco Editor Markers
  useEffect(() => {
    const updateMonacoProblems = () => {
      if (typeof window === "undefined" || !window.monaco?.editor) return;
      try {
        const markers = window.monaco.editor.getModelMarkers({});
        const probs = markers.map((m, idx) => ({
          id: `monaco-${idx}-${m.startLineNumber}-${m.startColumn}`,
          file: m.resource?.path ? m.resource.path.split("/").pop() : "active editor",
          line: m.startLineNumber,
          column: m.startColumn,
          severity: m.severity === 8 ? "error" : m.severity === 4 ? "warning" : "info",
          message: m.message,
          source: m.source ? `Monaco (${m.source})` : "Syntax/Linter"
        }));
        setMonacoProblems(probs);
      } catch {
        // Safe fallback
      }
    };

    updateMonacoProblems();

    let disposable;
    if (typeof window !== "undefined" && window.monaco?.editor?.onDidChangeMarkers) {
      disposable = window.monaco.editor.onDidChangeMarkers(() => {
        updateMonacoProblems();
      });
    }

    const interval = setInterval(updateMonacoProblems, 2000);

    return () => {
      if (disposable?.dispose) disposable.dispose();
      clearInterval(interval);
    };
  }, []);

  // Combined problems
  const allProblems = useMemo(() => {
    const map = new Map();
    [...monacoProblems, ...compilerProblems].forEach((p) => {
      const key = `${p.file}:${p.line}:${p.column}:${p.message}`;
      if (!map.has(key)) map.set(key, p);
    });
    return Array.from(map.values());
  }, [monacoProblems, compilerProblems]);

  const filteredProblems = useMemo(() => {
    if (problemFilter === "errors") return allProblems.filter((p) => p.severity === "error");
    if (problemFilter === "warnings") return allProblems.filter((p) => p.severity === "warning");
    return allProblems;
  }, [allProblems, problemFilter]);

  const errorCount = useMemo(() => allProblems.filter((p) => p.severity === "error").length, [allProblems]);
  const warningCount = useMemo(() => allProblems.filter((p) => p.severity === "warning").length, [allProblems]);

  // Jump to specific line in Monaco Editor
  const handleJumpToProblem = useCallback((prob) => {
    if (editorRef?.current) {
      try {
        editorRef.current.revealLineInCenter(prob.line);
        editorRef.current.setPosition({ lineNumber: prob.line, column: prob.column || 1 });
        editorRef.current.focus();
      } catch (err) {
        console.warn("Could not focus line:", err);
      }
    }
  }, [editorRef]);

  // -------------------------------------------------------------
  // Execution Logic (View Output)
  // -------------------------------------------------------------
  const runCode = async () => {
    const sourceCode = editorRef?.current?.getValue ? editorRef.current.getValue() : "";
    if (!sourceCode) {
      toast({
        title: "No code provided",
        description: "Please write some code in the editor to execute.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      setIsLoading(true);
      setActivePanel("viewOutput");
      if (onExpand) onExpand();
      scrollToPanel();
      setExecutionSummary(null);

      const startTime = Date.now();

      // Normalize target language
      let targetLang = (language || "c").toLowerCase().trim();
      if (targetLang.includes("select") || !targetLang) {
        if (/^\s*(#include|void\s+app_main|int\s+main|void\s+setup)/m.test(sourceCode)) {
          targetLang = "c";
        } else if (/^\s*(import\s+|def\s+|print\()/m.test(sourceCode)) {
          targetLang = "python";
        } else {
          targetLang = "c";
        }
      }
      // Check if code is ESP-IDF / microcontroller firmware
      const isEspIdfCode = /freertos|app_main|led_strip|driver\/gpio|esp_err|esp_log|usb_serial_jtag/i.test(sourceCode);
      if (isEspIdfCode) {
        setIsLoading(false);
        setIsError(false);
        setOutput([
          "[ESP-IDF Microcontroller Firmware Detected]",
          "--------------------------------------------------------------------------------",
          "• Embedded ESP-IDF C code requires the local ESP-IDF compiler and toolchain.",
          "• It cannot run in the generic online desktop C sandbox (Piston/Wandbox).",
          "",
          "👉 Click the 'Flash' button on the top toolbar or bottom Flasher panel to",
          "   compile and flash directly to your connected ESP32 board.",
          "--------------------------------------------------------------------------------"
        ]);
        toast({
          title: "ESP32 Firmware Detected",
          description: "Click 'Flash' on the toolbar to compile and flash to your board.",
          status: "info",
          duration: 5000,
          isClosable: true
        });
        return;
      }

      const res = await executeCode(targetLang, sourceCode, userInput);
      const duration = Date.now() - startTime;

      const compileData = res?.compile;
      const runData = res?.run;

      let logLines = [];
      if (compileData?.output) {
        logLines.push("[Compilation Output]");
        logLines.push(...compileData.output.split("\n"));
      }

      if (runData?.output) {
        logLines.push(...runData.output.split("\n"));
      } else if (runData?.stdout) {
        logLines.push(...runData.stdout.split("\n"));
      } else if (!compileData?.output) {
        logLines.push("Program exited with no output.");
      }

      setOutput(logLines);

      const exitCode = runData?.code ?? (compileData?.code ?? 0);
      const hasError = !!(runData?.stderr || (exitCode !== 0 && exitCode !== null) || compileData?.code !== 0);

      setIsError(hasError);
      setExecutionSummary({
        exitCode,
        durationMs: duration,
        isError: hasError,
        language: targetLang
      });

      // Parse compiler problems
      const fullText = [compileData?.stderr, compileData?.output, runData?.stderr, runData?.output]
        .filter(Boolean)
        .join("\n");
      const parsed = parseProblemsFromOutput(fullText.split("\n"));
      setCompilerProblems(parsed);

      if (hasError) {
        toast({
          title: "Execution finished with errors",
          description: parsed.length > 0 ? `${parsed.length} problem(s) found. Check the Problem tab.` : `Process exited with code ${exitCode}`,
          status: "error",
          duration: 4000,
          isClosable: true
        });
      } else {
        toast({
          title: "Execution Successful",
          description: `Finished in ${duration}ms (Exit Code: 0)`,
          status: "success",
          duration: 3000,
          isClosable: true
        });
      }
    } catch (error) {
      console.error("Execution error:", error);
      setOutput((prev) => [...prev, `[Execution Error]: ${error.message || "Failed to execute code"}`]);
      setIsError(true);
      toast({
        title: "Execution Failed",
        description: error.message || "Could not reach execution runtime.",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        if (outputBottomRef.current) {
          outputBottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  const handleCopyOutput = () => {
    if (output.length === 0) return;
    navigator.clipboard.writeText(output.join("\n"));
    setCopiedOutput(true);
    toast({
      title: "Copied",
      description: "Output text copied to clipboard.",
      status: "info",
      duration: 2000,
    });
    setTimeout(() => setCopiedOutput(false), 2000);
  };

  // -------------------------------------------------------------
  // Debug Console & Serial Monitor Logic
  // -------------------------------------------------------------
  const scanPorts = useCallback(async () => {
    setIsScanningPorts(true);
    try {
      let ports = [];
      if (window.electronAPI?.serial?.listPorts) {
        const res = await window.electronAPI.serial.listPorts();
        ports = Array.isArray(res) ? res : res?.ports || [];
      } else if (window.electronAPI?.flash?.detectPorts) {
        const res = await window.electronAPI.flash.detectPorts();
        ports = Array.isArray(res) ? res : res?.ports || [];
      }

      if (ports.length > 0) {
        const formatted = ports.map((p) => {
          if (typeof p === "string") return { path: p, label: p };
          const path = p.path || p.port || "COM3";
          const label = p.friendlyName || (p.chipName ? `${p.chipName} (${path})` : path);
          return { path, label };
        });
        setAvailablePorts(formatted);
        const paths = formatted.map(f => f.path);
        if (!paths.includes(selectedPort)) {
          setSelectedPort(paths[0]);
        }
      }
    } catch (err) {
      console.warn("Port scan:", err);
    } finally {
      setIsScanningPorts(false);
    }
  }, [selectedPort]);

  useEffect(() => {
    scanPorts();
  }, [scanPorts]);

  // Serial event listeners
  useEffect(() => {
    const cleanups = [];

    if (window.electronAPI?.serial?.onData) {
      const un = window.electronAPI.serial.onData(({ data }) => {
        if (data) {
          const lines = data.toString().split("\n").filter(Boolean);
          setSerialOutput((prev) => [...prev.slice(-300), ...lines]);
        }
      });
      cleanups.push(un);
    }

    if (window.electronAPI?.flash?.onEvent) {
      const un = window.electronAPI.flash.onEvent((evt) => {
        if (evt?.type === "monitor_data" || evt?.data) {
          const text = evt.data || evt.message || JSON.stringify(evt);
          setSerialOutput((prev) => [...prev.slice(-300), text]);
        }
      });
      cleanups.push(un);
    }

    const handleCustomData = (e) => {
      if (e?.detail) {
        const msg = typeof e.detail === "string" ? e.detail : JSON.stringify(e.detail);
        setSerialOutput((prev) => [...prev.slice(-300), msg]);
      }
    };

    window.addEventListener("innoide:serial-data", handleCustomData);
    window.addEventListener("innoide:debug-log", handleCustomData);

    return () => {
      cleanups.forEach((fn) => typeof fn === "function" && fn());
      window.removeEventListener("innoide:serial-data", handleCustomData);
      window.removeEventListener("innoide:debug-log", handleCustomData);
    };
  }, []);

  // Auto-scroll debug console
  useEffect(() => {
    if (debugAutoScroll && debugBottomRef.current) {
      debugBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [serialOutput, debugAutoScroll]);

  const handleToggleSerialConnect = async () => {
    if (isConnectedToDevice) {
      try {
        if (window.electronAPI?.serial?.disconnect && selectedPort) {
          await window.electronAPI.serial.disconnect(selectedPort);
        }
      } catch (err) {
        console.warn("Disconnect err:", err);
      }
      setIsConnectedToDevice(false);
      setSerialOutput((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [INFO] Disconnected from ${selectedPort}.`
      ]);
    } else {
      const port = selectedPort || "COM3";
      try {
        if (window.electronAPI?.serial?.connect) {
          await window.electronAPI.serial.connect(port, parseInt(baudRate, 10) || 115200);
        }
        setIsConnectedToDevice(true);
        setSerialOutput((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [INFO] Connected to ${port} @ ${baudRate} baud.`
        ]);
      } catch (err) {
        console.error("Connect err:", err);
        // If simulated/mock, connect anyway with notice
        setIsConnectedToDevice(true);
        setSerialOutput((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [INFO] Session active on ${port} (Virtual Serial Bridge).`
        ]);
      }
    }
  };

  const handleSendDebugCommand = async () => {
    if (!debugInput.trim()) return;
    const cmd = debugInput.trim();
    const timestamp = new Date().toLocaleTimeString();

    setDebugHistory((prev) => [...prev, cmd]);
    setDebugHistoryIdx(-1);
    setSerialOutput((prev) => [...prev, `[${timestamp}] > ${cmd}`]);
    setDebugInput("");

    try {
      if (window.electronAPI?.serial?.write && selectedPort && isConnectedToDevice) {
        await window.electronAPI.serial.write(selectedPort, cmd + "\r\n");
      } else {
        window.dispatchEvent(new CustomEvent("innoide:serial-send", { detail: cmd }));
        setTimeout(() => {
          setSerialOutput((prev) => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] [DEVICE] ACK: Received "${cmd}"`
          ]);
        }, 120);
      }
    } catch (err) {
      setSerialOutput((prev) => [...prev, `[ERR] Transmit error: ${err.message}`]);
    }
  };

  const handleDebugKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendDebugCommand();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (debugHistory.length > 0) {
        const next = debugHistoryIdx === -1 ? debugHistory.length - 1 : Math.max(0, debugHistoryIdx - 1);
        setDebugHistoryIdx(next);
        setDebugInput(debugHistory[next]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (debugHistoryIdx !== -1) {
        const next = debugHistoryIdx + 1;
        if (next >= debugHistory.length) {
          setDebugHistoryIdx(-1);
          setDebugInput("");
        } else {
          setDebugHistoryIdx(next);
          setDebugInput(debugHistory[next]);
        }
      }
    }
  };

  // -------------------------------------------------------------
  // Terminal Logic
  // -------------------------------------------------------------
  const executeTerminalCommand = async (cmdLine) => {
    const trimmed = cmdLine.trim();
    if (!trimmed) return;

    const newHistory = [...history, trimmed];
    setHistory(newHistory);
    setHistoryIndex(-1);

    const promptText = `user@innoide:${cwd}$ ${trimmed}`;
    const args = trimmed.split(/\s+/);
    const cmd = args[0].toLowerCase();

    if (cmd === "clear" || cmd === "cls") {
      setTerminalOutput([]);
      setTerminalInput("");
      return;
    }

    if (cmd === "help") {
      setTerminalOutput((prev) => [
        ...prev,
        promptText,
        "InnoIDE Embedded Shell - Available Commands:",
        "  help                 - Show this reference menu",
        "  clear | cls          - Clear the terminal screen",
        "  ls | dir             - List files in workspace",
        "  pwd                  - Print current working directory",
        "  cd <dir>             - Change directory",
        "  cat <file>           - Display file content",
        "  echo <text>          - Print text to screen",
        "  date                 - Display current system date & time",
        "  whoami               - Display current user identity",
        "  run | build          - Compile and execute active code",
        "  flash                - Open hardware flashing wizard",
        "  ports                - Scan and display connected COM/serial ports",
        "  device               - Display connected hardware status",
        "  version              - Display InnoIDE platform version",
        "  history              - Show recent command history"
      ]);
      setTerminalInput("");
      return;
    }

    if (cmd === "run" || cmd === "build") {
      setTerminalOutput((prev) => [
        ...prev,
        promptText,
        "[InnoIDE Runner] Compiling and executing active code..."
      ]);
      setTerminalInput("");
      runCode();
      return;
    }

    if (cmd === "flash") {
      setTerminalOutput((prev) => [
        ...prev,
        promptText,
        "[InnoIDE Flasher] Launching hardware flashing wizard..."
      ]);
      setTerminalInput("");
      handleCodeFlash();
      return;
    }

    if (cmd === "ports") {
      setTerminalOutput((prev) => [...prev, promptText, "Scanning active COM ports..."]);
      try {
        let portList = [];
        if (window.electronAPI?.serial?.listPorts) {
          const res = await window.electronAPI.serial.listPorts();
          portList = Array.isArray(res) ? res : res?.ports || [];
        } else if (window.electronAPI?.flash?.detectPorts) {
          const res = await window.electronAPI.flash.detectPorts();
          portList = Array.isArray(res) ? res : res?.ports || [];
        }
        if (portList.length > 0) {
          const formatted = portList.map((p) => {
            const path = p.path || p.port || p;
            const name = p.chipName || p.friendlyName || p.manufacturer || 'Serial Port';
            const vidPid = p.vendorId ? ` [VID:${p.vendorId} PID:${p.productId}]` : '';
            return `  • ${path}: ${name}${vidPid}`;
          });
          setTerminalOutput((prev) => [...prev, `Detected ${portList.length} serial port(s):`, ...formatted]);
        } else {
          setTerminalOutput((prev) => [
            ...prev,
            "No active hardware ports found. Connect a board via USB cable."
          ]);
        }
      } catch (err) {
        setTerminalOutput((prev) => [...prev, `Port query failed: ${err.message}`]);
      }
      setTerminalInput("");
      return;
    }

    if (cmd === "device") {
      const devInfo = localStorage.getItem("innoide:device-info");
      const isConn = localStorage.getItem("innoide:device-connected") === "true";
      setTerminalOutput((prev) => [
        ...prev,
        promptText,
        `Device Status: ${isConn ? "CONNECTED" : "DISCONNECTED"}`,
        devInfo ? `Device Info: ${devInfo}` : "No device currently paired."
      ]);
      setTerminalInput("");
      return;
    }

    if (cmd === "cat") {
      const target = args[1];
      if (!target) {
        setTerminalOutput((prev) => [...prev, promptText, "usage: cat <filename>"]);
        setTerminalInput("");
        return;
      }
      const code = editorRef?.current?.getValue ? editorRef.current.getValue() : null;
      if (code && (target === "main.c" || target.includes(".c") || target.includes(".h") || target.includes(".js"))) {
        setTerminalOutput((prev) => [...prev, promptText, ...code.split("\n")]);
      } else {
        setTerminalOutput((prev) => [...prev, promptText, `cat: ${target}: No such file or directory`]);
      }
      setTerminalInput("");
      return;
    }

    if (cmd === "ls" || cmd === "dir") {
      setTerminalOutput((prev) => [
        ...prev,
        promptText,
        "main.c   Makefile   README.md   src/   include/   build/"
      ]);
      setTerminalInput("");
      return;
    }

    if (cmd === "pwd") {
      setTerminalOutput((prev) => [...prev, promptText, cwd]);
      setTerminalInput("");
      return;
    }

    if (cmd === "cd") {
      const target = args[1];
      if (!target || target === "~") {
        setCwd("/home/user/workspace");
      } else if (target === "..") {
        const parts = cwd.split("/").filter(Boolean);
        setCwd(parts.length > 0 ? "/" + parts.slice(0, -1).join("/") : "/");
      } else {
        setCwd(`${cwd === "/" ? "" : cwd}/${target}`);
      }
      setTerminalOutput((prev) => [...prev, promptText]);
      setTerminalInput("");
      return;
    }

    if (cmd === "echo") {
      setTerminalOutput((prev) => [...prev, promptText, args.slice(1).join(" ")]);
      setTerminalInput("");
      return;
    }

    if (cmd === "date") {
      setTerminalOutput((prev) => [...prev, promptText, new Date().toString()]);
      setTerminalInput("");
      return;
    }

    if (cmd === "whoami") {
      setTerminalOutput((prev) => [...prev, promptText, "developer"]);
      setTerminalInput("");
      return;
    }

    if (cmd === "version") {
      setTerminalOutput((prev) => [
        ...prev,
        promptText,
        "InnoIDE Embedded Platform v2.4.0 (Electron + React)",
        "Target Toolchains: ESP-IDF v5.2, Arduino GCC, Clang/LLVM"
      ]);
      setTerminalInput("");
      return;
    }

    if (cmd === "history") {
      setTerminalOutput((prev) => [
        ...prev,
        promptText,
        ...newHistory.map((h, i) => `  ${i + 1}  ${h}`)
      ]);
      setTerminalInput("");
      return;
    }

    // Default simulated fallback
    setTerminalOutput((prev) => [
      ...prev,
      promptText,
      `bash: ${cmd}: command not found. Type 'help' for available commands.`
    ]);
    setTerminalInput("");
  };

  const handleTerminalKeyDown = (e) => {
    if (e.key === "Enter") {
      executeTerminalCommand(terminalInput);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const next = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(next);
        setTerminalInput(history[next]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const next = historyIndex + 1;
        if (next >= history.length) {
          setHistoryIndex(-1);
          setTerminalInput("");
        } else {
          setHistoryIndex(next);
          setTerminalInput(history[next]);
        }
      }
    }
  };

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalOutput]);

  // -------------------------------------------------------------
  // Postman Handler
  // -------------------------------------------------------------
  const handlePostmanSend = async () => {
    setPostmanLoading(true);
    setPostmanResponse(null);
    try {
      const options = {
        method: postmanMethod,
        url: postmanUrl,
        headers: { "Content-Type": "application/json" },
      };
      if (["POST", "PUT", "PATCH"].includes(postmanMethod) && postmanBody) {
        try {
          options.data = JSON.parse(postmanBody);
        } catch {
          throw new Error("Invalid JSON body");
        }
      }
      const res = await axios(options);
      setPostmanResponse({
        status: res.status,
        statusText: res.statusText,
        data: res.data,
        headers: res.headers
      });
    } catch (error) {
      setPostmanResponse({
        error: true,
        message: error.message,
        data: error.response?.data
      });
    } finally {
      setPostmanLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Global Event Listeners (Navbar & Menu integration)
  // -------------------------------------------------------------
  const handleCodeFlash = () => {
    window.dispatchEvent(new CustomEvent("innoide:flash-start"));
  };

  useEffect(() => {
    const handleViewOutput = () => {
      setActivePanel("viewOutput");
      if (onExpand) onExpand();
      setTimeout(scrollToPanel, 100);
    };
    const handleProblem = () => {
      setActivePanel("problem");
      if (onExpand) onExpand();
      setTimeout(scrollToPanel, 100);
    };
    const handleDebugConsole = () => {
      setActivePanel("debug");
      if (onExpand) onExpand();
      setTimeout(scrollToPanel, 100);
    };
    const handleTerminalOpen = () => {
      setActivePanel("terminal");
      if (onExpand) onExpand();
      setTimeout(scrollToPanel, 100);
    };
    const handlePostman = (e) => {
      if (e?.detail) {
        if (e.detail.url) setPostmanUrl(e.detail.url);
        if (e.detail.method) setPostmanMethod(e.detail.method);
        if (e.detail.body) setPostmanBody(e.detail.body);
      }
      setActivePanel("postman");
      if (onExpand) onExpand();
      setTimeout(scrollToPanel, 100);
    };
    const handleRestApi = () => {
      setActivePanel("restApi");
      if (onExpand) onExpand();
      setTimeout(scrollToPanel, 100);
    };

    window.addEventListener("innoide:view-output", handleViewOutput);
    window.addEventListener("innoide:problem", handleProblem);
    window.addEventListener("innoide:debug-console", handleDebugConsole);
    window.addEventListener("innoide:serial-open", handleDebugConsole);
    window.addEventListener("innoide:terminal-open", handleTerminalOpen);
    window.addEventListener("innoide:postman", handlePostman);
    window.addEventListener("innoide:rest-api", handleRestApi);
    window.addEventListener("innoide:compile-start", runCode);
    window.addEventListener("innoide:build-start", runCode);

    return () => {
      window.removeEventListener("innoide:view-output", handleViewOutput);
      window.removeEventListener("innoide:problem", handleProblem);
      window.removeEventListener("innoide:debug-console", handleDebugConsole);
      window.removeEventListener("innoide:serial-open", handleDebugConsole);
      window.removeEventListener("innoide:terminal-open", handleTerminalOpen);
      window.removeEventListener("innoide:postman", handlePostman);
      window.removeEventListener("innoide:rest-api", handleRestApi);
      window.removeEventListener("innoide:compile-start", runCode);
      window.removeEventListener("innoide:build-start", runCode);
    };
  }, [onExpand, scrollToPanel]);

  // Imperative handle
  useImperativeHandle(ref, () => ({
    runCode,
    flashCode: handleCodeFlash,
    appendOutputLine: (line) => {
      setOutput((prev) => [...prev, line]);
    },
    clearOutput: () => {
      setOutput([]);
      setExecutionSummary(null);
    },
    setActivePanel: (panel) => {
      setActivePanel(panel);
      if (onExpand) onExpand();
    }
  }));

  // Style Tokens
  const consoleBg = colorMode === "dark" ? "#0a0e17" : "#0d1117";
  const consoleBorder = colorMode === "dark" ? "gray.700" : "gray.200";

  return (
    <Box
      ref={panelRef}
      w="100%"
      p={4}
      bg={colorMode === "dark" ? "gray.800" : "white"}
      borderRadius="lg"
      scrollMarginTop="80px"
      h="100%"
      display="flex"
      flexDirection="column"
      {...rest}
    >
      {/* Primary Tool Selection Buttons matching screenshot exactly */}
      <HStack spacing={3} mb={4} flexWrap="wrap">
        {[
          { id: "flash", label: "Flash", action: handleCodeFlash },
          { id: "viewOutput", label: "View Output" },
          { id: "problem", label: "Problem", count: allProblems.length },
          { id: "debug", label: "Debug Console", isConnected: isConnectedToDevice },
          { id: "terminal", label: "Terminal" },
          { id: "postman", label: "Postman" },
          { id: "restApi", label: "REST API" },
        ].map((item) => {
          const isActive = activePanel === item.id;
          return (
            <Button
              key={item.id}
              id={`panel-tab-${item.id}`}
              size="sm"
              variant={isActive ? "solid" : "outline"}
              colorScheme="blue"
              onClick={() => {
                if (item.action) {
                  item.action();
                } else {
                  setActivePanel(item.id);
                  if (onExpand) onExpand();
                  scrollToPanel();
                }
              }}
              borderRadius="md"
              px={5}
              h="36px"
              fontWeight="500"
              _hover={
                !isActive
                  ? {
                      bg: colorMode === "dark" ? "whiteAlpha.100" : "blue.50",
                      borderColor: "blue.400",
                    }
                  : {}
              }
              rightIcon={
                item.count > 0 ? (
                  <Badge
                    colorScheme={errorCount > 0 ? "red" : "orange"}
                    variant="solid"
                    borderRadius="full"
                    px={1.5}
                    fontSize="10px"
                  >
                    {item.count}
                  </Badge>
                ) : item.isConnected ? (
                  <Box w="8px" h="8px" borderRadius="full" bg="green.400" boxShadow="0 0 6px #48bb78" />
                ) : null
              }
            >
              {item.label}
            </Button>
          );
        })}
      </HStack>

      {/* Main Content Container */}
      <Box
        border="1px solid"
        borderColor={consoleBorder}
        borderRadius="lg"
        p={4}
        boxShadow="sm"
        flex="1"
        overflowY="auto"
        minH="0"
        bg={colorMode === "dark" ? "gray.900" : "white"}
        sx={{
          "&::-webkit-scrollbar": { width: "7px" },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            background: colorMode === "dark" ? "#666" : "#aaa",
            borderRadius: "8px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: colorMode === "dark" ? "#888" : "#888",
          },
        }}
      >
        {/* ========================================================= */}
        {/* PANEL 1: VIEW OUTPUT                                      */}
        {/* ========================================================= */}
        {activePanel === "viewOutput" && (
          <Flex direction="column" h="100%" gap={3}>
            {/* Header Control Bar */}
            <Flex
              justify="space-between"
              align="center"
              flexWrap="wrap"
              gap={2}
              pb={3}
              borderBottom="1px solid"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            >
              <HStack spacing={3}>
                <Text fontSize="sm" fontWeight="bold" color={colorMode === "dark" ? "white" : "gray.800"}>
                  Execution Output
                </Text>
                <Badge colorScheme="blue" variant="subtle" px={2} py={0.5} borderRadius="md" fontSize="xs">
                  {!language || language.toLowerCase().includes("select") ? "C (GCC / C11)" : language.toUpperCase()}
                </Badge>
                {isLoading ? (
                  <Badge colorScheme="yellow" display="flex" alignItems="center" gap={1.5}>
                    <Spinner size="xs" /> Executing...
                  </Badge>
                ) : executionSummary ? (
                  <HStack spacing={2}>
                    <Badge colorScheme={executionSummary.isError ? "red" : "green"}>
                      Exit: {executionSummary.exitCode}
                    </Badge>
                    <Text fontSize="xs" color="gray.500">
                      {executionSummary.durationMs}ms
                    </Text>
                  </HStack>
                ) : (
                  <Badge colorScheme="gray">Ready</Badge>
                )}
              </HStack>

              <HStack spacing={2}>
                <Button
                  leftIcon={<Play size={14} />}
                  size="xs"
                  colorScheme="blue"
                  isLoading={isLoading}
                  onClick={runCode}
                >
                  Run Code
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setShowStdin(!showStdin)}
                  colorScheme={showStdin ? "blue" : "gray"}
                >
                  {showStdin ? "Hide Stdin" : "Stdin"}
                </Button>
                <Tooltip label="Copy Output">
                  <IconButton
                    aria-label="Copy Output"
                    icon={copiedOutput ? <Check size={14} color="green" /> : <Copy size={14} />}
                    size="xs"
                    variant="ghost"
                    onClick={handleCopyOutput}
                    isDisabled={output.length === 0}
                  />
                </Tooltip>
                <Tooltip label="Clear Output">
                  <IconButton
                    aria-label="Clear Output"
                    icon={<Trash2 size={14} />}
                    size="xs"
                    variant="ghost"
                    onClick={() => {
                      setOutput([]);
                      setExecutionSummary(null);
                    }}
                  />
                </Tooltip>
              </HStack>
            </Flex>

            {/* Standard Input Collapse */}
            <Collapse in={showStdin} animateOpacity>
              <Box mb={2} p={2} bg={colorMode === "dark" ? "gray.800" : "gray.50"} borderRadius="md">
                <Text fontSize="xs" mb={1} fontWeight="600" color="gray.500">
                  Standard Input (passed to program stdin):
                </Text>
                <Input
                  size="sm"
                  fontFamily="monospace"
                  placeholder="Enter stdin input here..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  bg={colorMode === "dark" ? "gray.900" : "white"}
                />
              </Box>
            </Collapse>

            {/* Console Log Body */}
            <Box
              flex="1"
              bg={consoleBg}
              borderRadius="md"
              p={4}
              fontFamily="Consolas, Monaco, 'Courier New', monospace"
              fontSize="13px"
              color="#e2e8f0"
              overflowY="auto"
              minH="220px"
              maxH="450px"
              border="1px solid"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.300"}
            >
              {isLoading ? (
                <Flex align="center" justify="center" h="100%" minH="180px" direction="column" gap={3}>
                  <Spinner size="md" color="blue.400" />
                  <Text color="gray.400" fontSize="sm">
                    Compiling and executing code in cloud sandbox...
                  </Text>
                </Flex>
              ) : output.length === 0 ? (
                <Flex align="center" justify="center" h="100%" minH="180px" direction="column" gap={3}>
                  <Box p={3} borderRadius="full" bg="whiteAlpha.100">
                    <Play size={24} color="#60a5fa" />
                  </Box>
                  <Text color="gray.300" fontWeight="600">
                    No output generated yet
                  </Text>
                  <Text color="gray.400" fontSize="xs" maxW="380px" textAlign="center">
                    Click "Run Code" above or press compile in the Tools menu to execute your code.
                  </Text>
                  <Button size="sm" colorScheme="blue" leftIcon={<Play size={14} />} onClick={runCode}>
                    Run Code Now
                  </Button>
                </Flex>
              ) : (
                output.map((line, idx) => {
                  const isErr =
                    /error:|fatal error:|exception:|syntaxerror:|stderr/i.test(line);
                  const isWarn = /warning:/i.test(line);
                  const isHeader = /^\[.*\]$/.test(line.trim());

                  return (
                    <Text
                      key={idx}
                      color={
                        isErr
                          ? "#f87171"
                          : isWarn
                          ? "#fbbf24"
                          : isHeader
                          ? "#38bdf8"
                          : "#f1f5f9"
                      }
                      whiteSpace="pre-wrap"
                      wordBreak="break-word"
                      lineHeight="1.5"
                    >
                      {line}
                    </Text>
                  );
                })
              )}
              <div ref={outputBottomRef} />
            </Box>
          </Flex>
        )}

        {/* ========================================================= */}
        {/* PANEL 2: PROBLEM (DIAGNOSTICS & ERRORS)                   */}
        {/* ========================================================= */}
        {activePanel === "problem" && (
          <Flex direction="column" h="100%" gap={3}>
            {/* Header Control Bar */}
            <Flex
              justify="space-between"
              align="center"
              flexWrap="wrap"
              gap={2}
              pb={3}
              borderBottom="1px solid"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            >
              <HStack spacing={3}>
                <Text fontSize="sm" fontWeight="bold" color={colorMode === "dark" ? "white" : "gray.800"}>
                  Problems
                </Text>
                <Badge
                  colorScheme={allProblems.length > 0 ? (errorCount > 0 ? "red" : "orange") : "green"}
                  variant="solid"
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  fontSize="xs"
                >
                  {allProblems.length}
                </Badge>
              </HStack>

              <HStack spacing={2}>
                <Button
                  size="xs"
                  variant={problemFilter === "all" ? "solid" : "outline"}
                  colorScheme="blue"
                  onClick={() => setProblemFilter("all")}
                >
                  All ({allProblems.length})
                </Button>
                <Button
                  size="xs"
                  variant={problemFilter === "errors" ? "solid" : "outline"}
                  colorScheme="red"
                  onClick={() => setProblemFilter("errors")}
                >
                  Errors ({errorCount})
                </Button>
                <Button
                  size="xs"
                  variant={problemFilter === "warnings" ? "solid" : "outline"}
                  colorScheme="orange"
                  onClick={() => setProblemFilter("warnings")}
                >
                  Warnings ({warningCount})
                </Button>
                <Tooltip label="Clear Compiler Problems">
                  <IconButton
                    aria-label="Clear compiler problems"
                    icon={<Trash2 size={14} />}
                    size="xs"
                    variant="ghost"
                    onClick={() => setCompilerProblems([])}
                  />
                </Tooltip>
              </HStack>
            </Flex>

            {/* Problems List */}
            <Box flex="1" overflowY="auto" minH="220px" maxH="450px">
              {filteredProblems.length === 0 ? (
                <Flex align="center" justify="center" h="100%" minH="200px" direction="column" gap={2}>
                  <Box p={3} borderRadius="full" bg="green.50" _dark={{ bg: "green.900" }}>
                    <CheckCircle2 size={32} color="#22c55e" />
                  </Box>
                  <Text fontWeight="600" color={colorMode === "dark" ? "gray.200" : "gray.700"}>
                    No problems have been detected in the workspace.
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Your code passes Monaco syntax checks and compiler validation.
                  </Text>
                </Flex>
              ) : (
                <VStack spacing={2} align="stretch">
                  {filteredProblems.map((prob) => (
                    <Box
                      key={prob.id}
                      p={3}
                      borderRadius="md"
                      border="1px solid"
                      borderColor={
                        prob.severity === "error"
                          ? "red.200"
                          : prob.severity === "warning"
                          ? "orange.200"
                          : "blue.200"
                      }
                      bg={
                        colorMode === "dark"
                          ? prob.severity === "error"
                            ? "rgba(239, 68, 68, 0.1)"
                            : "rgba(245, 158, 11, 0.1)"
                          : prob.severity === "error"
                          ? "red.50"
                          : "orange.50"
                      }
                      cursor="pointer"
                      onClick={() => handleJumpToProblem(prob)}
                      _hover={{
                        transform: "translateY(-1px)",
                        boxShadow: "sm",
                        borderColor: prob.severity === "error" ? "red.400" : "orange.400",
                      }}
                      transition="all 0.15s ease"
                    >
                      <Flex justify="space-between" align="flex-start" gap={2}>
                        <HStack spacing={2.5} align="flex-start">
                          <Box mt={0.5}>
                            {prob.severity === "error" ? (
                              <XCircle size={16} color="#ef4444" />
                            ) : prob.severity === "warning" ? (
                              <AlertTriangle size={16} color="#f59e0b" />
                            ) : (
                              <Info size={16} color="#3b82f6" />
                            )}
                          </Box>
                          <Box>
                            <Text fontSize="sm" fontWeight="600" color={colorMode === "dark" ? "gray.100" : "gray.800"}>
                              {prob.message}
                            </Text>
                            <HStack spacing={2} mt={1}>
                              <Badge size="sm" variant="subtle" colorScheme="gray" fontSize="xs">
                                {prob.source}
                              </Badge>
                              <Text fontSize="xs" color="gray.500">
                                {prob.file} [Line {prob.line}, Col {prob.column}]
                              </Text>
                            </HStack>
                          </Box>
                        </HStack>

                        <Button size="xs" variant="ghost" colorScheme="blue" rightIcon={<ChevronRight size={12} />}>
                          Go to line
                        </Button>
                      </Flex>
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>
          </Flex>
        )}

        {/* ========================================================= */}
        {/* PANEL 3: DEBUG CONSOLE & SERIAL MONITOR                   */}
        {/* ========================================================= */}
        {activePanel === "debug" && (
          <Flex direction="column" h="100%" gap={3}>
            {/* Header Control Bar */}
            <Flex
              justify="space-between"
              align="center"
              flexWrap="wrap"
              gap={2}
              pb={3}
              borderBottom="1px solid"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            >
              <HStack spacing={3}>
                <Text fontSize="sm" fontWeight="bold" color={colorMode === "dark" ? "white" : "gray.800"}>
                  Debug Console & Serial
                </Text>
                <HStack spacing={1.5}>
                  <Box
                    w="8px"
                    h="8px"
                    borderRadius="full"
                    bg={isConnectedToDevice ? "green.400" : "gray.400"}
                    boxShadow={isConnectedToDevice ? "0 0 8px #48bb78" : "none"}
                  />
                  <Text fontSize="xs" fontWeight="500" color={isConnectedToDevice ? "green.500" : "gray.500"}>
                    {isConnectedToDevice ? `Connected (${selectedPort})` : "Disconnected"}
                  </Text>
                </HStack>
              </HStack>

              <HStack spacing={2} flexWrap="wrap">
                <Select
                  size="xs"
                  w="auto"
                  minW="120px"
                  maxW="260px"
                  value={selectedPort}
                  onChange={(e) => setSelectedPort(e.target.value)}
                  borderRadius="md"
                  isDisabled={isConnectedToDevice}
                  title={selectedPort}
                >
                  {availablePorts.map((p) => {
                    const val = typeof p === "string" ? p : p.path;
                    const text = typeof p === "string" ? p : (p.label || p.friendlyName || p.path);
                    return (
                      <option key={val} value={val}>
                        {text}
                      </option>
                    );
                  })}
                </Select>

                <Select
                  size="xs"
                  w="100px"
                  value={baudRate}
                  onChange={(e) => setBaudRate(e.target.value)}
                  borderRadius="md"
                  isDisabled={isConnectedToDevice}
                >
                  <option value="9600">9600</option>
                  <option value="57600">57600</option>
                  <option value="115200">115200</option>
                  <option value="230400">230400</option>
                  <option value="921600">921600</option>
                </Select>

                <Tooltip label="Rescan COM Ports">
                  <IconButton
                    aria-label="Scan Ports"
                    icon={<RefreshCw size={13} className={isScanningPorts ? "spin" : ""} />}
                    size="xs"
                    variant="outline"
                    onClick={scanPorts}
                    isLoading={isScanningPorts}
                    isDisabled={isConnectedToDevice}
                  />
                </Tooltip>

                <Button
                  size="xs"
                  colorScheme={isConnectedToDevice ? "red" : "green"}
                  onClick={handleToggleSerialConnect}
                >
                  {isConnectedToDevice ? "Disconnect" : "Connect Serial"}
                </Button>

                <Tooltip label="Clear Console">
                  <IconButton
                    aria-label="Clear Console"
                    icon={<Trash2 size={13} />}
                    size="xs"
                    variant="ghost"
                    onClick={() => setSerialOutput([])}
                  />
                </Tooltip>

                <Checkbox
                  size="sm"
                  isChecked={debugAutoScroll}
                  onChange={(e) => setDebugAutoScroll(e.target.checked)}
                >
                  <Text fontSize="xs">Auto-scroll</Text>
                </Checkbox>
              </HStack>
            </Flex>

            {/* Debug Console Output Stream */}
            <Box
              flex="1"
              bg={consoleBg}
              borderRadius="md"
              p={4}
              fontFamily="Consolas, Monaco, 'Courier New', monospace"
              fontSize="12px"
              color="#00ff66"
              overflowY="auto"
              minH="200px"
              maxH="380px"
              border="1px solid"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.300"}
            >
              {serialOutput.length === 0 ? (
                <Text color="gray.500" fontStyle="italic">
                  Console buffer empty. Connect to serial or send a command below.
                </Text>
              ) : (
                serialOutput.map((line, i) => {
                  const isSys = /\[SYSTEM\]|\[INFO\]/i.test(line);
                  const isErr = /\[ERR\]|\[ERROR\]|E \(/i.test(line);
                  const isWarn = /\[WARN\]|W \(/i.test(line);
                  const isSent = line.trim().startsWith(">");

                  return (
                    <Text
                      key={i}
                      color={
                        isSent
                          ? "#38bdf8"
                          : isErr
                          ? "#f87171"
                          : isWarn
                          ? "#fbbf24"
                          : isSys
                          ? "#94a3b8"
                          : "#22c55e"
                      }
                      whiteSpace="pre-wrap"
                      wordBreak="break-word"
                      lineHeight="1.5"
                    >
                      {line}
                    </Text>
                  );
                })
              )}
              <div ref={debugBottomRef} />
            </Box>

            {/* Command Send Bar */}
            <HStack spacing={2}>
              <Input
                size="sm"
                fontFamily="monospace"
                placeholder="Send command or expression (e.g. HELP, RESTART, LED:1)..."
                value={debugInput}
                onChange={(e) => setDebugInput(e.target.value)}
                onKeyDown={handleDebugKeyDown}
                bg={colorMode === "dark" ? "gray.800" : "white"}
                borderRadius="md"
              />
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<Send size={14} />}
                onClick={handleSendDebugCommand}
              >
                Send
              </Button>
            </HStack>
          </Flex>
        )}

        {/* ========================================================= */}
        {/* PANEL 4: TERMINAL                                         */}
        {/* ========================================================= */}
        {activePanel === "terminal" && (
          runtimeState !== "idle" && runtimeState !== "uploading" ? (
            <Box h="100%" minH="250px">
              <TerminalPanel isExpanded={true} onToggleExpand={onExpand} />
            </Box>
          ) : (
            <Flex direction="column" h="100%" gap={3}>
              {/* Terminal Header Bar */}
              <Flex
                justify="space-between"
                align="center"
                pb={2}
                borderBottom="1px solid"
                borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
              >
                <HStack spacing={2}>
                  <TerminalIcon size={14} color="#3b82f6" />
                  <Text fontSize="sm" fontWeight="bold" color={colorMode === "dark" ? "white" : "gray.800"}>
                    Terminal
                  </Text>
                  <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                    bash
                  </Badge>
                  <Text fontSize="xs" color="gray.500">
                    {cwd}
                  </Text>
                </HStack>

                <HStack spacing={2}>
                  <Tooltip label="Clear Screen">
                    <IconButton
                      aria-label="Clear screen"
                      icon={<Trash2 size={13} />}
                      size="xs"
                      variant="ghost"
                      onClick={() => setTerminalOutput([])}
                    />
                  </Tooltip>
                  <Tooltip label="Copy All">
                    <IconButton
                      aria-label="Copy All"
                      icon={<Copy size={13} />}
                      size="xs"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard.writeText(terminalOutput.join("\n"));
                        toast({ title: "Copied", description: "Terminal buffer copied", status: "info", duration: 2000 });
                      }}
                    />
                  </Tooltip>
                </HStack>
              </Flex>

              {/* Terminal Screen */}
              <Box
                flex="1"
                bg={consoleBg}
                borderRadius="md"
                p={4}
                fontFamily="Consolas, Monaco, 'Courier New', monospace"
                fontSize="13px"
                color="#e2e8f0"
                overflowY="auto"
                minH="220px"
                maxH="400px"
                border="1px solid"
                borderColor={colorMode === "dark" ? "gray.700" : "gray.300"}
              >
                {terminalOutput.map((line, i) => (
                  <Text key={i} mb={1} whiteSpace="pre-wrap" wordBreak="break-word" lineHeight="1.4">
                    {line}
                  </Text>
                ))}
                <div ref={terminalBottomRef} />
              </Box>

              {/* Prompt & Input Bar */}
              <HStack spacing={2} align="center" mt={1}>
                <Text
                  color="#22c55e"
                  fontWeight="bold"
                  fontSize="13px"
                  fontFamily="Consolas, Monaco, monospace"
                  whiteSpace="nowrap"
                >
                  {`user@innoide:${cwd}$`}
                </Text>
                <Input
                  size="sm"
                  fontFamily="Consolas, Monaco, monospace"
                  fontSize="13px"
                  placeholder="Type command ('help' for options)..."
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  onKeyDown={handleTerminalKeyDown}
                  bg={colorMode === "dark" ? "gray.800" : "white"}
                  borderRadius="md"
                  autoFocus
                />
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={() => executeTerminalCommand(terminalInput)}
                >
                  Run
                </Button>
              </HStack>
            </Flex>
          )
        )}

        {/* ========================================================= */}
        {/* PANEL 5: POSTMAN HTTP CLIENT                              */}
        {/* ========================================================= */}
        {activePanel === "postman" && (
          <Box display="flex" flexDirection="column" gap={4}>
            <HStack spacing={3} alignItems="center">
              <Select
                w="120px"
                size="md"
                value={postmanMethod}
                onChange={(e) => setPostmanMethod(e.target.value)}
                borderRadius="md"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </Select>
              <Input
                size="md"
                flex={1}
                placeholder="https://jsonplaceholder.typicode.com/todos/1"
                value={postmanUrl}
                onChange={(e) => setPostmanUrl(e.target.value)}
                borderRadius="md"
              />
              <Button
                colorScheme="blue"
                size="md"
                onClick={handlePostmanSend}
                isLoading={postmanLoading}
                px={8}
                borderRadius="md"
              >
                Send
              </Button>
            </HStack>

            {["POST", "PUT", "PATCH"].includes(postmanMethod) && (
              <Box>
                <Text fontSize="xs" mb={1} color="gray.500">
                  Request Body (JSON)
                </Text>
                <Textarea
                  size="sm"
                  value={postmanBody}
                  onChange={(e) => setPostmanBody(e.target.value)}
                  placeholder='{"key": "value"}'
                  fontFamily="monospace"
                  rows={4}
                />
              </Box>
            )}

            <Box borderTop="1px solid" borderColor={colorMode === "dark" ? "gray.700" : "gray.100"} pt={3}>
              <Text fontSize="sm" fontWeight="bold" mb={2} color={colorMode === "dark" ? "gray.400" : "gray.700"}>
                Response {postmanResponse && `(${postmanResponse.status || "Error"})`}
              </Text>
              {postmanResponse ? (
                <Box
                  bg={consoleBg}
                  p={4}
                  borderRadius="md"
                  overflowY="auto"
                  maxH="300px"
                  border="1px solid"
                  borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                >
                  <pre style={{ fontSize: "13px", color: "#e2e8f0" }}>
                    {JSON.stringify(postmanResponse.data || postmanResponse, null, 2)}
                  </pre>
                </Box>
              ) : (
                <Text fontSize="sm" color="gray.400">
                  No response yet. Send a request to see output here.
                </Text>
              )}
            </Box>
          </Box>
        )}

        {/* ========================================================= */}
        {/* PANEL 6: REST API BUILDER                                 */}
        {/* ========================================================= */}
        {activePanel === "restApi" && (
          <ApiBuilderPanel
            onOpenPostman={(reqData) => {
              if (reqData) {
                if (reqData.url) setPostmanUrl(reqData.url);
                if (reqData.method) setPostmanMethod(reqData.method);
                if (reqData.body) setPostmanBody(reqData.body);
              }
              setActivePanel("postman");
              if (onExpand) onExpand();
              scrollToPanel();
            }}
          />
        )}
      </Box>
    </Box>
  );
});

export default Output;
