// import { forwardRef, useImperativeHandle, useMemo, useState, useEffect } from "react";
import { API } from '@/config';
// import {
//   Box,
//   Badge,
//   Text,
//   Button,
//   useColorMode,
//   useToast,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalCloseButton,
//   ModalBody,
//   ModalFooter,
//   RadioGroup,
//   Radio,
//   Stack,
//   Input,
//   HStack,
// } from "@chakra-ui/react";
// import { executeCode, submitCodeToDevice } from "../api";
// import { buildProject, buildAndFlash } from "../utils/espIdfUtils";

// import axios from "axios";

// const Output = forwardRef(({ editorRef, language, onFlashComplete, onFlashStart, ...rest }, ref) => {
//   const toast = useToast();
//   const { colorMode } = useColorMode();
//   const [output, setOutput] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isError, setIsError] = useState(false);
//   const [userInput, setUserInput] = useState("");
//   const [response, setResponse] = useState("");
//   const [activePanel, setActivePanel] = useState("problem");
//   const [runSummary, setRunSummary] = useState({ status: "idle", reason: "" });
//   const [terminalInput, setTerminalInput] = useState("");
//   const [terminalOutput, setTerminalOutput] = useState([]);
//   const [serialOutput, setSerialOutput] = useState([]);
//   const [isConnectedToDevice, setIsConnectedToDevice] = useState(false);

//   // Initialize device connection state from localStorage immediately
//   const [isDeviceConnectedForActions, setIsDeviceConnectedForActions] = useState(() => {
//     const savedState = localStorage.getItem('innoide:device-connected');
//     console.log('Initial device state from localStorage:', savedState);
//     return savedState === 'true';
//   });

//   const [selectedDeviceInfo, setSelectedDeviceInfo] = useState(() => {
//     const savedDeviceInfo = localStorage.getItem('innoide:device-info');
//     if (savedDeviceInfo) {
//       try {
//         return JSON.parse(savedDeviceInfo);
//       } catch (e) {
//         return null;
//       }
//     }
//     return null;
//   });

//   const handlePanelChange = (panel) => {
//     setActivePanel(panel);
//   };


//   const handleTerminalCommand = () => {
//     if (!terminalInput.trim()) return;

//     // Add the command to terminal output
//     setTerminalOutput(prev => [
//       ...prev,
//       `$ ${terminalInput}`,
//       // Simulate command output
//       ...simulateCommandOutput(terminalInput)
//     ]);
//     setTerminalInput("");
//   };

//   const simulateCommandOutput = (command) => {
//     const cmd = command.toLowerCase().trim();

//     if (cmd === 'help') {
//       return [
//         'Available commands:',
//         '  help - Show this help message',
//         '  ls - List files',
//         '  pwd - Show current directory',
//         '  date - Show current date',
//         '  clear - Clear terminal',
//         '  echo <text> - Echo text back'
//       ];
//     } else if (cmd === 'ls') {
//       return ['main.c', 'Makefile', 'README.md', 'src/', 'build/'];
//     } else if (cmd === 'pwd') {
//       return ['/workspace/project'];
//     } else if (cmd === 'date') {
//       return [new Date().toString()];
//     } else if (cmd === 'clear') {
//       setTerminalOutput([]);
//       return [];
//     } else if (cmd.startsWith('echo ')) {
//       return [cmd.substring(5)];
//     } else {
//       return [`bash: ${cmd}: command not found`];
//     }
//   };

//   // Read real serial output from connected device using Web Serial API
//   useEffect(() => {
//     if (!isConnectedToDevice) return;

//     let reader;
//     let keepReading = true;
//     let currentPort = null;
//     let cleanupInterval = null;

//     const readSerialData = async () => {
//       // Check if we have a serial port from the device connection
//       const deviceInfoStr = localStorage.getItem('innoide:device-info');
//       if (!deviceInfoStr) {
//         console.log('No device info found');
//         return;
//       }

//       try {
//         const deviceInfo = JSON.parse(deviceInfoStr);

//         // If simulated device, use simulation
//         if (deviceInfo.isSimulated) {
//           console.log('Simulated device detected, using simulation mode');
//           cleanupInterval = startSimulation();
//           return;
//         }

//         // Try to get the actual serial port
//         if ('serial' in navigator) {
//           const ports = await navigator.serial.getPorts();

//           if (ports.length === 0) {
//             console.log('No serial ports available');
//             setSerialOutput(prev => [
//               ...prev.slice(-50),
//               `[${new Date().toTimeString().split(' ')[0]}] [INFO] No serial ports detected. Please connect a device.`
//             ]);
//             return;
//           }

//           // Find the matching port based on device info
//           let matchedPort = null;
//           if (deviceInfo.port?.usbVendorId && deviceInfo.port?.usbProductId) {
//             for (const port of ports) {
//               const info = await port.getInfo();
//               if (info.usbVendorId === deviceInfo.port.usbVendorId &&
//                 info.usbProductId === deviceInfo.port.usbProductId) {
//                 matchedPort = port;
//                 break;
//               }
//             }
//           }

//           currentPort = matchedPort || ports[0]; // Use matched port or first available

//           // Open port if not already open
//           if (!currentPort.readable && !currentPort.writable) {
//             try {
//               await currentPort.open({ baudRate: 115200 });
//               console.log('✅ Serial port opened successfully at 115200 baud');

//               setSerialOutput(prev => [
//                 ...prev.slice(-50),
//                 `[${new Date().toTimeString().split(' ')[0]}] [INFO] Serial port opened successfully`,
//                 `[${new Date().toTimeString().split(' ')[0]}] [INFO] Listening for device output...`
//               ]);
//             } catch (openError) {
//               if (openError.message.includes('already open')) {
//                 console.log('⚠️ Port already open, continuing...');
//               } else {
//                 console.error('Failed to open serial port:', openError);
//                 setSerialOutput(prev => [
//                   ...prev.slice(-50),
//                   `[${new Date().toTimeString().split(' ')[0]}] [ERROR] Failed to open serial port: ${openError.message}`
//                 ]);
//                 return;
//               }
//             }
//           }

//           // Only create new reader if port is readable
//           if (currentPort.readable) {
//             try {
//               const textDecoder = new TextDecoderStream();
//               const readableStreamClosed = currentPort.readable.pipeTo(textDecoder.writable);
//               reader = textDecoder.readable.getReader();

//               console.log('✅ Serial reader created, reading real data from device...');

//               // Read data from serial port
//               while (keepReading) {
//                 try {
//                   const { value, done } = await reader.read();
//                   if (done) {
//                     console.log('⚠️ Serial stream ended');
//                     setSerialOutput(prev => [
//                       ...prev.slice(-50),
//                       `[${new Date().toTimeString().split(' ')[0]}] [INFO] Serial stream ended`
//                     ]);
//                     break;
//                   }

//                   if (value) {
//                     const timestamp = new Date().toTimeString().split(' ')[0];
//                     const lines = value.split('\n').filter(line => line.trim());

//                     if (lines.length > 0) {
//                       setSerialOutput(prev => [
//                         ...prev.slice(-50),
//                         ...lines.map(line => `[${timestamp}] ${line.trim()}`)
//                       ]);
//                     }
//                   }
//                 } catch (error) {
//                   console.error('Error reading serial data:', error);
//                   if (error.message.includes('device has been lost') ||
//                     error.message.includes('The device has been lost')) {
//                     console.log('⚠️ Device disconnected');
//                     setSerialOutput(prev => [
//                       ...prev.slice(-50),
//                       `[${new Date().toTimeString().split(' ')[0]}] [ERROR] Device disconnected`
//                     ]);
//                     break;
//                   }
//                 }
//               }
//             } catch (error) {
//               console.error('Error creating serial reader:', error);
//               setSerialOutput(prev => [
//                 ...prev.slice(-50),
//                 `[${new Date().toTimeString().split(' ')[0]}] [ERROR] Failed to create serial reader: ${error.message}`
//               ]);
//             }
//           } else {
//             console.log('Port not readable');
//             setSerialOutput(prev => [
//               ...prev.slice(-50),
//               `[${new Date().toTimeString().split(' ')[0]}] [ERROR] Serial port is not readable`
//             ]);
//           }
//         } else {
//           console.log('Web Serial API not supported');
//           setSerialOutput(prev => [
//             ...prev.slice(-50),
//             `[${new Date().toTimeString().split(' ')[0]}] [ERROR] Web Serial API not supported in this browser`,
//             `[${new Date().toTimeString().split(' ')[0]}] [INFO] Please use Chrome, Edge, or Opera browser`
//           ]);
//         }
//       } catch (error) {
//         console.error('Error setting up serial communication:', error);
//         setSerialOutput(prev => [
//           ...prev.slice(-50),
//           `[${new Date().toTimeString().split(' ')[0]}] [ERROR] Serial setup failed: ${error.message}`
//         ]);
//       }
//     };

//     // Fallback simulation function - only for demo purposes when no real device
//     const startSimulation = () => {
//       console.log('⚠️ Starting simulation mode (demo data only)');
//       setSerialOutput(prev => [
//         ...prev.slice(-50),
//         `[${new Date().toTimeString().split(' ')[0]}] [INFO] ========================================`,
//         `[${new Date().toTimeString().split(' ')[0]}] [INFO] SIMULATION MODE - Demo Data Only`,
//         `[${new Date().toTimeString().split(' ')[0]}] [INFO] Connect a real device to see actual output`,
//         `[${new Date().toTimeString().split(' ')[0]}] [INFO] ========================================`
//       ]);

//       let ledState = false;
//       const interval = setInterval(() => {
//         const timestamp = new Date().toTimeString().split(' ')[0];

//         if (ledState) {
//           setSerialOutput(prev => [
//             ...prev.slice(-50),
//             `[${timestamp}] [DEMO] LED OFF`
//           ]);
//         } else {
//           setSerialOutput(prev => [
//             ...prev.slice(-50),
//             `[${timestamp}] [DEMO] LED ON`
//           ]);
//         }

//         ledState = !ledState;

//         if (Math.random() > 0.7) {
//           const additionalMessages = [
//             '[DEMO] Device initialized',
//             '[DEMO] GPIO pin 2 set HIGH',
//             '[DEMO] GPIO pin 2 set LOW',
//             '[DEMO] Loop iteration completed',
//             `[DEMO] Sensor reading: ${Math.floor(Math.random() * 100)}`,
//             '[DEMO] Memory usage: 85%'
//           ];
//           const randomMessage = additionalMessages[Math.floor(Math.random() * additionalMessages.length)];
//           const msgTimestamp = new Date().toTimeString().split(' ')[0];

//           setSerialOutput(prev => [
//             ...prev.slice(-50),
//             `[${msgTimestamp}] ${randomMessage}`
//           ]);
//         }
//       }, 1000);

//       return () => clearInterval(interval);
//     };

//     readSerialData();

//     return () => {
//       keepReading = false;
//       if (reader) {
//         reader.cancel().catch(err => console.log('Reader cleanup:', err.message));
//       }
//       if (cleanupInterval) {
//         cleanupInterval();
//       }
//       // Don't close the port on cleanup to maintain connection
//       // Port will be closed when user explicitly disconnects
//       console.log('Serial reader cleanup complete, port remains open');
//     };
//   }, [isConnectedToDevice]);


//   // Listen for device connection events for action buttons and persist state
//   useEffect(() => {
//     console.log('Output component mounted');
//     console.log('Initial device connected state:', isDeviceConnectedForActions);
//     console.log('Initial device info:', selectedDeviceInfo);

//     const handleDeviceConnect = (event) => {
//       console.log('✅ Output: Device connect event received', event.detail);
//       setIsDeviceConnectedForActions(true);
//       localStorage.setItem('innoide:device-connected', 'true');

//       if (event.detail) {
//         setSelectedDeviceInfo(event.detail);
//         localStorage.setItem('innoide:device-info', JSON.stringify(event.detail));
//       }

//       console.log('✅ Output: Device connection state updated to TRUE');
//     };

//     const handleDeviceDisconnect = () => {
//       console.log('❌ Output: Device disconnect event received');
//       setIsDeviceConnectedForActions(false);
//       setSelectedDeviceInfo(null);
//       localStorage.setItem('innoide:device-connected', 'false');
//       localStorage.removeItem('innoide:device-info');
//     };

//     const handleDeviceFailed = () => {
//       console.log('⚠️ Output: Device detection failed');
//       setIsDeviceConnectedForActions(false);
//       setSelectedDeviceInfo(null);
//       localStorage.setItem('innoide:device-connected', 'false');
//       localStorage.removeItem('innoide:device-info');
//     };

//     window.addEventListener('innoide:device-detect-complete', handleDeviceConnect);
//     window.addEventListener('innoide:device-disconnect', handleDeviceDisconnect);
//     window.addEventListener('innoide:device-detect-failed', handleDeviceFailed);

//     return () => {
//       window.removeEventListener('innoide:device-detect-complete', handleDeviceConnect);
//       window.removeEventListener('innoide:device-disconnect', handleDeviceDisconnect);
//       window.removeEventListener('innoide:device-detect-failed', handleDeviceFailed);
//     };
//   }, []);

//   // Listen for physical device removal via Web Serial API
//   useEffect(() => {
//     if (!('serial' in navigator)) return;

//     const handleHardwareDisconnect = (event) => {
//       console.log('⚠️ Output: Hardware serial disconnect detected', event?.target);
//       setIsConnectedToDevice(false);
//       setIsDeviceConnectedForActions(false);
//       setSelectedDeviceInfo(null);
//       localStorage.setItem('innoide:device-connected', 'false');
//       localStorage.removeItem('innoide:device-info');

//       // Notify other components about disconnect
//       window.dispatchEvent(new CustomEvent('innoide:device-disconnect'));
//     };

//     navigator.serial.addEventListener('disconnect', handleHardwareDisconnect);

//     return () => {
//       navigator.serial.removeEventListener('disconnect', handleHardwareDisconnect);
//     };
//   }, []);

//   // Periodically verify that the saved device is still attached
//   useEffect(() => {
//     if (!('serial' in navigator)) return;
//     if (!isDeviceConnectedForActions) return;

//     let cancelled = false;
//     let intervalId = null;

//     const handleMissingDevice = () => {
//       if (cancelled) return;
//       console.log('⚠️ Output: Stored device no longer available, resetting state');
//       setIsConnectedToDevice(false);
//       setIsDeviceConnectedForActions(false);
//       setSelectedDeviceInfo(null);
//       localStorage.setItem('innoide:device-connected', 'false');
//       localStorage.removeItem('innoide:device-info');
//       window.dispatchEvent(new CustomEvent('innoide:device-disconnect'));
//     };

//     const checkPorts = async () => {
//       try {
//         const ports = await navigator.serial.getPorts();
//         if (!ports.length) {
//           handleMissingDevice();
//           return;
//         }

//         const savedDeviceInfoRaw = localStorage.getItem('innoide:device-info');
//         if (!savedDeviceInfoRaw) {
//           handleMissingDevice();
//           return;
//         }

//         let savedDeviceInfo;
//         try {
//           savedDeviceInfo = JSON.parse(savedDeviceInfoRaw);
//         } catch (error) {
//           console.warn('Failed to parse saved device info while verifying ports');
//           handleMissingDevice();
//           return;
//         }

//         if (savedDeviceInfo?.port?.usbVendorId && savedDeviceInfo?.port?.usbProductId) {
//           const portInfos = await Promise.all(ports.map(port => port.getInfo?.() ?? {}));
//           const matched = portInfos.some(info =>
//             info?.usbVendorId === savedDeviceInfo.port.usbVendorId &&
//             info?.usbProductId === savedDeviceInfo.port.usbProductId
//           );

//           if (!matched) {
//             handleMissingDevice();
//           }
//         }
//       } catch (error) {
//         console.warn('Failed to verify serial ports:', error);
//       }
//     };

//     checkPorts();
//     intervalId = window.setInterval(checkPorts, 5000);

//     const handleVisibility = () => {
//       if (!document.hidden) {
//         checkPorts();
//       }
//     };

//     window.addEventListener('visibilitychange', handleVisibility);
//     window.addEventListener('focus', handleVisibility);

//     return () => {
//       cancelled = true;
//       if (intervalId) {
//         clearInterval(intervalId);
//       }
//       window.removeEventListener('visibilitychange', handleVisibility);
//       window.removeEventListener('focus', handleVisibility);
//     };
//   }, [isDeviceConnectedForActions]);

//   const panelTitle = useMemo(() => {
//     switch (activePanel) {
//       case "serial":
//         return "Serial Console";
//       case "terminal":
//         return "Terminal";
//       default:
//         return "Problem Output";
//     }
//   }, [activePanel]);

//   const panelDescription = useMemo(() => {
//     switch (activePanel) {
//       case "serial":
//         return "Monitor device logs and USART output in real time.";
//       case "terminal":
//         return "Run shell commands against the configured workspace";
//       default:
//         return "View compiler messages, build logs, and program output.";
//     }
//   }, [activePanel]);

//   const responseStyle = {
//     marginTop: "20px",
//     padding: "10px",
//     backgroundColor: colorMode === "dark" ? "#2D3748" : "#F7FAFC",
//     color: colorMode === "dark" ? "#E2E8F0" : "#2D3748",
//     borderRadius: "5px",
//     border: `1px solid ${colorMode === "dark" ? "#4A5568" : "#CBD5E0"}`,
//   };

//   const appendOutputLine = (line) => {
//     if (line === undefined || line === null) return;
//     const text = typeof line === "string" ? line : JSON.stringify(line);
//     setOutput((prevOutput) => [...prevOutput, text]);
//   };

//   const runCode = async ({ append, reason } = {}) => {
//     if (!isDeviceConnectedForActions) {
//       toast({
//         title: "No Device Connected!",
//         description: "Please connect a device before running code.",
//         status: "error",
//         duration: 6000,
//       });
//       return { ok: false, reason: "no-device" };
//     }

//     const sourceCode = editorRef?.current?.getValue?.() ?? "";

//     if (!sourceCode) {
//       toast({
//         title: "Empty Code!",
//         description: "Please write your code before running.",
//         status: "error",
//         duration: 6000,
//       });
//       return { ok: false, reason: "no-source" };
//     }

//     const effectiveLanguage =
//       language && language !== "Select Language" ? language : "c";

//     try {
//       setIsLoading(true);
//       setActivePanel("problem");
//       setRunSummary({ status: "running", reason });
//       if (!append) {
//         setOutput([]);
//       }

//       const { run: result } = await executeCode(
//         effectiveLanguage.toLowerCase(),
//         sourceCode,
//         userInput
//       );

//       const stdout = result?.output ?? "";
//       const stderr = result?.stderr ?? "";
//       const stdoutLines = stdout ? stdout.split("\n") : [];
//       const stderrLines = stderr
//         ? stderr.split("\n").map((line) => (line ? `stderr: ${line}` : line))
//         : [];

//       setOutput((prevOutput) =>
//         append ? [...prevOutput, ...stdoutLines, ...stderrLines] : [...stdoutLines, ...stderrLines]
//       );

//       setResponse(stdout);
//       const hadError = Boolean(stderr);
//       setIsError(hadError);
//       setRunSummary({
//         status: hadError ? "error" : "success",
//         reason,
//       });

//       if (stdoutLines.length === 0 && stderrLines.length === 0) {
//         appendOutputLine("(program exited with no output)");
//       }

//       return {
//         ok: true,
//         result,
//         stdout,
//         stderr,
//         reason,
//       };
//     } catch (error) {
//       console.error(error);
//       const message = error?.message || "Could not execute the code.";
//       toast({
//         title: "Error occurred while running.",
//         description: message,
//         status: "error",
//         duration: 6000,
//         isClosable: true,
//       });
//       setIsError(true);
//       if (append) {
//         appendOutputLine(`Error: ${message}`);
//       } else {
//         setOutput([`Error: ${message}`]);
//       }
//       setRunSummary({ status: "error", reason });

//       return {
//         ok: false,
//         error,
//         reason,
//       };
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // handle flash code with ESP-IDF workflow

//   const handleCodeFlash = async () => {
//     console.log('Flash button clicked. Device connected:', isDeviceConnectedForActions);
//     console.log('Selected device info:', selectedDeviceInfo);

//     if (!isDeviceConnectedForActions) {
//       console.error('Flash blocked: No device connected');
//       toast({
//         title: "No Device Connected!",
//         description: "Please connect a device before flashing.",
//         status: "error",
//         duration: 6000,
//       });
//       return { ok: false, reason: "no-device" };
//     }

//     onFlashStart?.();
//     const sourceCode = editorRef?.current?.getValue?.() ?? "";

//     if (!sourceCode) {
//       toast({
//         title: "No Source Code!",
//         description: "Please write or upload the firmware before flashing.",
//         status: "warning",
//         duration: 6000,
//       });
//       return { ok: false, reason: "no-source" };
//     }

//     setIsLoading(true);
//     setActivePanel("serial");
//     setRunSummary({ status: "running", reason: "flash" });
//     setOutput([]);

//     // Clear and start serial output
//     setSerialOutput([]);

//     // Keep device connected during flash
//     // Don't change isConnectedToDevice state to avoid disconnecting serial reader
//     const wasConnected = isConnectedToDevice;
//     if (!wasConnected) {
//       setIsConnectedToDevice(true);
//     }

//     try {
//       // Submit code to device API
//       appendOutputLine("=== Submitting Code to Device ===");
//       appendOutputLine("Connecting to device...");

//       // Add initial serial output
//       const timestamp = new Date().toTimeString().split(' ')[0];
//       setSerialOutput(prev => [
//         ...prev,
//         `[${timestamp}] [INFO] Connecting to device...`,
//         `[${timestamp}] [INFO] Submitting code for flashing...`
//       ]);

//       const result = await submitCodeToDevice(sourceCode, language || "esp32");

//       if (result) {
//         const message = "Code submitted successfully! Device is flashing...";
//         setResponse(message);
//         appendOutputLine(`\n✓ ${message}`);

//         // Add success serial output
//         const successTimestamp = new Date().toTimeString().split(' ')[0];
//         setSerialOutput(prev => [
//           ...prev,
//           `[${successTimestamp}] [INFO] Code submitted successfully`,
//           `[${successTimestamp}] [INFO] Flashing firmware to device...`,
//           `[${successTimestamp}] [INFO] Device will reset and start running...`,
//           `[${successTimestamp}] [INFO] Waiting for device output...`
//         ]);

//         setRunSummary({ status: "success", reason: "flash" });

//         toast({
//           title: "Flash Successful!",
//           description: "Code submitted to device. Device will reset automatically.",
//           status: "success",
//           duration: 5000,
//         });

//         // Ensure device stays connected after flash
//         console.log('✅ Flash complete, maintaining device connection');

//         // Re-confirm device connection state
//         localStorage.setItem('innoide:device-connected', 'true');

//         onFlashComplete?.({ ok: true, message, result });
//         return { ok: true, message, result };
//       } else {
//         throw new Error("Code submission failed");
//       }
//     } catch (error) {
//       console.error("Flashing Error:", error);
//       const message = error?.message || "Firmware flashing failed.";

//       appendOutputLine(`\n✗ Flash error: ${message}`);

//       // Add error to serial output
//       const errorTimestamp = new Date().toTimeString().split(' ')[0];
//       setSerialOutput(prev => [
//         ...prev,
//         `[${errorTimestamp}] [ERROR] Flash failed: ${message}`
//       ]);

//       setRunSummary({ status: "error", reason: "flash" });

//       toast({
//         title: "Flash Failed!",
//         description: message,
//         status: "error",
//         duration: 6000,
//         isClosable: true,
//       });

//       onFlashComplete?.({ ok: false, error, message });
//       return { ok: false, error };
//     } finally {
//       setIsLoading(false);
//       // Ensure device connection is maintained
//       console.log('Flash operation complete, device connection state:', isDeviceConnectedForActions);
//     }
//   };

//   // Handle ESP-IDF build only
//   const handleBuildProject = async () => {
//     if (!isDeviceConnectedForActions) {
//       toast({
//         title: "No Device Connected!",
//         description: "Please connect a device before building.",
//         status: "error",
//         duration: 6000,
//       });
//       return { ok: false, reason: "no-device" };
//     }

//     const sourceCode = editorRef?.current?.getValue?.() ?? "";

//     if (!sourceCode) {
//       toast({
//         title: "No Source Code!",
//         description: "Please write code before building.",
//         status: "warning",
//         duration: 6000,
//       });
//       return { ok: false, reason: "no-source" };
//     }

//     setIsLoading(true);
//     setActivePanel("problem");
//     setRunSummary({ status: "running", reason: "build" });
//     setOutput([]);

//     try {
//       appendOutputLine("=== ESP-IDF Build ===");
//       appendOutputLine("Starting build process...");

//       const result = await buildProject({
//         projectPath: ".",
//         target: "esp32",
//         onProgress: (progress) => {
//           // Progress updates
//         },
//         onLog: (message) => {
//           appendOutputLine(message);
//         },
//       });

//       if (result.success) {
//         const message = "Build completed successfully!";
//         setResponse(message);
//         appendOutputLine(`\n✓ ${message}`);
//         appendOutputLine(`Bootloader: ${result.binaries?.bootloader || 'N/A'}`);
//         appendOutputLine(`Application: ${result.binaries?.application || 'N/A'}`);
//         setRunSummary({ status: "success", reason: "build" });

//         toast({
//           title: "Build Successful!",
//           description: message,
//           status: "success",
//           duration: 5000,
//         });

//         return { ok: true, message, result };
//       } else {
//         throw new Error("Build failed");
//       }
//     } catch (error) {
//       console.error("Build Error:", error);
//       const message = error?.message || "Build failed.";

//       appendOutputLine(`\n✗ Build error: ${message}`);
//       setRunSummary({ status: "error", reason: "build" });

//       toast({
//         title: "Build Failed!",
//         description: message,
//         status: "error",
//         duration: 6000,
//         isClosable: true,
//       });

//       return { ok: false, error };
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useImperativeHandle(ref, () => ({
//     runCode,
//     flashCode: handleCodeFlash,
//     buildProject: handleBuildProject,
//     openPanel: handlePanelChange,
//     setPanel: handlePanelChange,
//     setUserInput,
//     appendOutputLine,
//     isRunning: () => isLoading,
//     getStdout: () => response,
//     getOutputLines: () => output.slice(),
//   }));

//   const statusColor = runSummary.status === "error"
//     ? "red"
//     : runSummary.status === "success"
//       ? "green"
//       : runSummary.status === "running"
//         ? "blue"
//         : "gray";

//   const statusLabel = (() => {
//     switch (runSummary.status) {
//       case "running":
//         return "Running";
//       case "success":
//         return "Success";
//       case "error":
//         return "Error";
//       default:
//         return "Idle";
//     }
//   })();

//   return (
//     <Box w="100%" p={4} borderRadius="md" {...rest}>
//       {/* Device Status Badge */}
//       {isDeviceConnectedForActions && selectedDeviceInfo ? (
//         <Box mb={3} p={2} bg={colorMode === "dark" ? "green.900" : "green.50"} borderRadius="md" border="1px solid" borderColor="green.400">
//           <HStack spacing={2}>
//             <Badge colorScheme="green" fontSize="xs">✓ Connected</Badge>
//             <Text fontSize="xs" fontWeight="semibold" color={colorMode === "dark" ? "green.200" : "green.700"}>
//               {selectedDeviceInfo.deviceType || "Device"}
//             </Text>
//             {selectedDeviceInfo.memory && (
//               <Text fontSize="xs" color={colorMode === "dark" ? "gray.400" : "gray.600"}>
//                 • {selectedDeviceInfo.memory}
//               </Text>
//             )}
//           </HStack>
//         </Box>
//       ) : (
//         <Box mb={3} p={2} bg={colorMode === "dark" ? "orange.900" : "orange.50"} borderRadius="md" border="1px solid" borderColor="orange.400">
//           <HStack spacing={2}>
//             <Badge colorScheme="orange" fontSize="xs">⚠ Not Connected</Badge>
//             <Text fontSize="xs" color={colorMode === "dark" ? "orange.200" : "orange.700"}>
//               Click "Select Port" or "Detect" in Flash panel to connect device
//             </Text>
//           </HStack>
//         </Box>
//       )}

//       <Box display="flex" alignItems="center" mb={4} gap={4} flexWrap="wrap">

//         <Button
//           loadingText="Flashing"
//           spinnerPlacement="start"
//           isLoading={isLoading && runSummary.reason === "flash"}
//           size={"sm"}
//           colorScheme="blue"
//           variant={isLoading ? "solid" : "outline"}
//           cursor="pointer"
//           onClick={handleCodeFlash}
//           title="Flash Code to Device"
//         >
//           Flash
//         </Button>

//         <Button
//           loadingText="Running"
//           spinnerPlacement="start"
//           isLoading={isLoading && runSummary.reason !== "flash"}
//           size="sm"
//           colorScheme="green"
//           variant={isLoading && runSummary.reason !== "flash" ? "solid" : "outline"}
//           onClick={() => runCode({ append: false, reason: "manual" })}
//           title="Run Code"
//         >
//           Run
//         </Button>

//         <Button
//           loadingText="Building"
//           spinnerPlacement="start"
//           isLoading={isLoading && runSummary.reason === "build"}
//           size="sm"
//           colorScheme="blue"
//           variant={isLoading && runSummary.reason === "build" ? "solid" : "outline"}
//           onClick={handleBuildProject}
//           title="Build Project (ESP-IDF)"
//         >
//           Build
//         </Button>
//         <Button
//           size="sm"
//           colorScheme="blue"
//           variant={activePanel === "serial" ? "solid" : "outline"}
//           onClick={() => handlePanelChange("serial")}
//         >
//           Serial Console
//         </Button>
//         <Button
//           size="sm"
//           colorScheme="blue"
//           variant={activePanel === "terminal" ? "solid" : "outline"}
//           onClick={() => handlePanelChange("terminal")}
//         >
//           Terminal
//         </Button>
//       </Box>

//       <Box mb={3}>
//         <Text fontSize="md" fontWeight="semibold">
//           {panelTitle}
//         </Text>
//         <Text fontSize="sm" color={colorMode === "dark" ? "gray.300" : "gray.600"}>
//           {panelDescription}
//         </Text>
//       </Box>

//       {activePanel === "problem" && <pre style={responseStyle}>{response || "Run or flash to see compiler output."}</pre>}
//       {activePanel === "serial" && (
//         <Box
//           border="1px solid"
//           borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
//           borderRadius="md"
//           p={3}
//           minH="120px"
//           bg={colorMode === "dark" ? "gray.900" : "white"}
//           display="flex"
//           flexDirection="column"
//           gap={2}
//         >
//           <Box display="flex" justifyContent="space-between" alignItems="center">
//             <Text fontSize="sm" fontWeight="semibold" color={colorMode === "dark" ? "gray.300" : "gray.600"}>
//               Serial Monitor
//             </Text>
//             <Box display="flex" gap={2}>
//               <Button
//                 size="xs"
//                 colorScheme="gray"
//                 variant="outline"
//                 onClick={() => setSerialOutput([])}
//               >
//                 Clear
//               </Button>
//               <Button
//                 size="xs"
//                 colorScheme={isConnectedToDevice ? "red" : "green"}
//                 onClick={() => setIsConnectedToDevice(!isConnectedToDevice)}
//               >
//                 {isConnectedToDevice ? "Disconnect" : "Connect"}
//               </Button>
//             </Box>
//           </Box>
//           <Box
//             flex="1"
//             overflowY="auto"
//             maxH="300px"
//             bg={colorMode === "dark" ? "gray.800" : "gray.50"}
//             p={2}
//             borderRadius="md"
//             fontFamily="monospace"
//             fontSize="sm"
//             minH="80px"
//           >
//             {serialOutput.length === 0 ? (
//               <Text color={colorMode === "dark" ? "gray.400" : "gray.500"}>
//                 {isConnectedToDevice ? "Waiting for serial data..." : "Click 'Flash' button to upload code and monitor serial output"}
//               </Text>
//             ) : (
//               serialOutput.map((line, index) => (
//                 <Text
//                   key={index}
//                   color={
//                     line.includes('[ERROR]') ? 'red.400' :
//                       line.includes('[INFO]') ? 'blue.400' :
//                         line.includes('[DEBUG]') ? 'yellow.400' :
//                           line.includes('[DATA]') ? 'green.400' :
//                             line.includes('LED ON') ? 'green.300' :
//                               line.includes('LED OFF') ? 'gray.400' :
//                                 colorMode === "dark" ? "gray.200" : "gray.700"
//                   }
//                   fontWeight={line.includes('LED') ? 'bold' : 'normal'}
//                 >
//                   {line}
//                 </Text>
//               ))
//             )}
//           </Box>
//         </Box>
//       )}
//       {activePanel === "terminal" && (
//         <Box
//           border="1px solid"
//           borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
//           borderRadius="md"
//           p={3}
//           minH="120px"
//           bg={colorMode === "dark" ? "gray.900" : "white"}
//           display="flex"
//           flexDirection="column"
//           gap={2}
//         >
//           <Text fontSize="sm" fontWeight="semibold" color={colorMode === "dark" ? "gray.300" : "gray.600"}>
//             Terminal
//           </Text>
//           <Box
//             flex="1"
//             overflowY="auto"
//             bg={colorMode === "dark" ? "gray.800" : "gray.50"}
//             p={2}
//             borderRadius="md"
//             fontFamily="monospace"
//             fontSize="sm"
//             minH="60px"
//           >
//             {terminalOutput.map((line, index) => (
//               <Text key={index} color={colorMode === "dark" ? "gray.200" : "gray.700"}>
//                 {line}
//               </Text>
//             ))}
//             {terminalOutput.length === 0 && (
//               <Text color={colorMode === "dark" ? "gray.400" : "gray.500"}>
//                 Type a command below to get started...
//               </Text>
//             )}
//           </Box>
//           <Box display="flex" gap={2}>
//             <Input
//               placeholder="Enter command..."
//               value={terminalInput}
//               onChange={(e) => setTerminalInput(e.target.value)}
//               onKeyPress={(e) => {
//                 if (e.key === 'Enter') {
//                   handleTerminalCommand();
//                 }
//               }}
//               size="sm"
//               fontFamily="monospace"
//             />
//             <Button
//               size="sm"
//               colorScheme="blue"
//               onClick={handleTerminalCommand}
//             >
//               Run
//             </Button>
//           </Box>
//         </Box>
//       )}

//       {/* Input box for stdin is this section i have added here */}
//       {/* <Box mb={4}>
//         <Text fontSize="sm" mb={4}>
//           Provide Input for Your Code:
//         </Text>
//         <Input
//           placeholder="Type input here"
//           value={userInput}
//           onChange={(e) => setUserInput(e.target.value)}
//         />
//       </Box> */}

//       {/* <Box
//         as="hr"
//         borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
//         mb={4}
//       /> */}

//       {/* <Box
//         width="100%"
//         height="18vh"
//         p={3}
//         color={
//           isError ? "red.400" : colorMode === "dark" ? "gray.300" : "gray.800"
//         }
//         bg={colorMode === "dark" ? "gray.900" : "#ffffff"}
//         border="1px solid"
//         borderColor={
//           isError ? "red.500" : colorMode === "dark" ? "gray.700" : "gray.300"
//         }
//         borderRadius="md"
//         overflowY="auto"
//       >
//         {output.length > 0
//           ? output.map((line, i) => <Text key={i}>{line}</Text>)
//           : 'Click "Run Code" to see the output here'}
//       </Box> */}

//     </Box>
//   );
// });

// export default Output;


import { useState, useEffect, forwardRef, useRef, useImperativeHandle } from "react";
import {
  Box,
  Text,
  Button,
  useColorMode,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  RadioGroup,
  Radio,
  Stack,
  Input,
  Select,
  Textarea,
  VStack,
  HStack,
  Badge
} from "@chakra-ui/react";
import { executeCode } from "../api";
import OutputStatus from "./OutputStatus";

import { useSelector } from "react-redux";
import TerminalPanel from "../features/workspace/terminal/components/TerminalPanel";
import axios from "axios";
import ApiBuilderPanel from "./ApiBuilderPanel";

const Output = forwardRef(({ editorRef, language, onExpand, onCollapse, ...rest }, ref) => {
  const { runtimeState } = useSelector((state) => state.workspace);
  const panelRef = useRef(null);
  const toast = useToast();
  const { colorMode } = useColorMode();
  const [output, setOutput] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isRunClicked, setIsRunClicked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alignment, setAlignment] = useState("left");
  const [userInput, setUserInput] = useState("");
  const [response, setResponse] = useState("");
  const [postmanUrl, setPostmanUrl] = useState("https://jsonplaceholder.typicode.com/todos/1");
  const [postmanMethod, setPostmanMethod] = useState("GET");
  const [postmanBody, setPostmanBody] = useState("");
  const [activePanel, setActivePanel] = useState("problem");
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [serialOutput, setSerialOutput] = useState([]);

  // Enhanced Terminal State
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cwd, setCwd] = useState("/home/user");

  // Serial Monitor State
  const [isConnectedToDevice, setIsConnectedToDevice] = useState(false);
  const [isDeviceConnectedForActions, setIsDeviceConnectedForActions] = useState(() => {
    const savedState = localStorage.getItem('innoide:device-connected');
    return savedState === 'true';
  });
  const [selectedDeviceInfo, setSelectedDeviceInfo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('innoide:device-info') || 'null');
    } catch { return null; }
  });
  const [postmanResponse, setPostmanResponse] = useState(null);
  const [postmanLoading, setPostmanLoading] = useState(false);

  // Helper function to scroll specifically to the Output panel
  const scrollToPanel = () => {
    if (panelRef.current) {
      // Use scrollIntoView with block: "start"
      // scrollMarginTop on the element will handle the offset for the sticky navbar
      panelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    if (runtimeState && runtimeState !== "idle") {
      setActivePanel("terminal");
    }
  }, [runtimeState]);

  // Serial Monitor Logic (Web Serial API)
  useEffect(() => {
    if (!isConnectedToDevice) return;
    let reader;
    let keepReading = true;
    let currentPort = null;
    const readSerialData = async () => {
      const deviceInfoStr = localStorage.getItem('innoide:device-info');
      if (!deviceInfoStr) return;
      try {
        const deviceInfo = JSON.parse(deviceInfoStr);
        if ('serial' in navigator) {
          const ports = await navigator.serial.getPorts();
          if (ports.length === 0) {
            setSerialOutput(prev => [...prev, `[INFO] No serial ports detected.`]);
            return;
          }
          currentPort = ports[0];
          if (!currentPort.readable && !currentPort.writable) {
            await currentPort.open({ baudRate: 115200 });
            setSerialOutput(prev => [...prev, `[INFO] Serial port opened.`]);
          }
          if (currentPort.readable) {
            const textDecoder = new TextDecoderStream();
            currentPort.readable.pipeTo(textDecoder.writable);
            reader = textDecoder.readable.getReader();
            while (keepReading) {
              const { value, done } = await reader.read();
              if (done) break;
              if (value) {
                const lines = value.split('\n').filter(l => l.trim());
                if (lines.length) setSerialOutput(prev => [...prev.slice(-100), ...lines]);
              }
            }
          }
        }
      } catch (error) {
        console.error('Serial error:', error);
      }
    };
    readSerialData();
    return () => { keepReading = false; if (reader) reader.cancel(); };
  }, [isConnectedToDevice]);

  // Enhanced Terminal Logic
  const handleTerminalCommand = () => {
    if (!terminalInput.trim()) return;
    const cmd = terminalInput.trim();
    const newHistory = [...history, cmd];
    setHistory(newHistory);
    setHistoryIndex(-1);

    setTerminalOutput(prev => [
      ...prev,
      `user@innoide:${cwd}$ ${cmd}`,
      ...simulateCommandOutput(cmd)
    ]);
    setTerminalInput("");
  };

  const simulateCommandOutput = (command) => {
    const args = command.trim().split(/\s+/);
    const cmd = args[0].toLowerCase();

    switch (cmd) {
      case 'help':
        return [
          'InnoIDE Mock Terminal v1.0.0',
          'Available commands:',
          '  help     - Show this menu',
          '  ls       - List files in current directory',
          '  pwd      - Print working directory',
          '  cd <dir> - Change directory',
          '  clear    - Clear the terminal screen',
          '  echo     - Print text to terminal',
          '  date     - Show current system date/time',
          '  whoami   - Show current user',
          '  uname    - Show system information',
          '  cat      - Read file content (mock)',
          '  mkdir    - Create directory (mock)',
          '  touch    - Create file (mock)'
        ];
      case 'ls':
        if (cwd === '/home/user') return ['main.c  src/  include/  Makefile  README.md  build/'];
        if (cwd.includes('src')) return ['main.c  utils.c  handlers.h'];
        return ['total 0'];
      case 'pwd':
        return [cwd];
      case 'cd':
        const target = args[1];
        if (!target || target === '~') {
          setCwd('/home/user');
        } else if (target === '..') {
          const parts = cwd.split('/').filter(Boolean);
          if (parts.length > 0) {
            setCwd('/' + parts.slice(0, -1).join('/'));
          } else {
            setCwd('/');
          }
        } else {
          const newPath = `${cwd === '/' ? '' : cwd}/${target}`;
          if (['/home/user/src', '/home/user/include', '/home/user/build', '/home/user'].includes(newPath)) {
            setCwd(newPath);
          } else {
            return [`bash: cd: ${target}: No such file or directory`];
          }
        }
        return [];
      case 'date':
        return [new Date().toString()];
      case 'whoami':
        return ['user'];
      case 'uname':
        return ['InnoIDE-WebOS 5.15.0-x86_64-GNU/Linux'];
      case 'clear':
        setTerminalOutput([]);
        return [];
      case 'echo':
        return [args.slice(1).join(' ')];
      case 'cat':
        if (!args[1]) return ['usage: cat <filename>'];
        if (args[1] === 'README.md') return ['# InnoIDE Project', 'This is a sample project for firmware development.', 'Use the Tools menu to build and flash.'];
        if (args[1] === 'main.c') return ['#include <stdio.h>', '', 'int main() {', '    printf("Hello InnoIDE!\\n");', '    return 0;', '}'];
        return [`cat: ${args[1]}: No such file or directory`];
      case 'mkdir':
      case 'touch':
        if (!args[1]) return [`usage: ${cmd} <name>`];
        return [`${cmd}: created ${args[1]} (simulated)`];
      default:
        return [`bash: ${cmd}: command not found`];
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTerminalCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setTerminalInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setTerminalInput("");
        } else {
          setHistoryIndex(newIndex);
          setTerminalInput(history[newIndex]);
        }
      }
    }
  };

  // Add listeners for navbar tool events
  useEffect(() => {
    const handleViewOutput = () => {
      setActivePanel("problem");
      setTimeout(scrollToPanel, 100);
    };
    const handleProblem = () => {
      setActivePanel("problem");
      setTimeout(scrollToPanel, 100);
    };
    const handleDebugConsole = () => {
      setActivePanel("debug");
      setTimeout(scrollToPanel, 100);
    };
    const handleTerminalOpen = () => {
      setActivePanel("terminal");
      setTimeout(scrollToPanel, 100);
    };
    const handlePostman = (e) => {
      if (e?.detail) {
        if (e.detail.url) setPostmanUrl(e.detail.url);
        if (e.detail.method) setPostmanMethod(e.detail.method);
        if (e.detail.body) setPostmanBody(e.detail.body);
      }
      setActivePanel("postman");
      setTimeout(scrollToPanel, 100);
    };
    const handleRestApi = () => {
      setActivePanel("restApi");
      setTimeout(scrollToPanel, 100);
    };

    window.addEventListener('innoide:view-output', handleViewOutput);
    window.addEventListener('innoide:problem', handleProblem);
    window.addEventListener('innoide:debug-console', handleDebugConsole);
    window.addEventListener('innoide:terminal-open', handleTerminalOpen);
    window.addEventListener('innoide:postman', handlePostman);
    window.addEventListener('innoide:rest-api', handleRestApi);

    return () => {
      window.removeEventListener('innoide:view-output', handleViewOutput);
      window.removeEventListener('innoide:problem', handleProblem);
      window.removeEventListener('innoide:debug-console', handleDebugConsole);
      window.removeEventListener('innoide:terminal-open', handleTerminalOpen);
      window.removeEventListener('innoide:postman', handlePostman);
      window.removeEventListener('innoide:rest-api', handleRestApi);
    };
  }, []);

  const handlePostmanSend = async () => {
    setPostmanLoading(true);
    setPostmanResponse(null);
    try {
      const options = {
        method: postmanMethod,
        url: postmanUrl,
        headers: { 'Content-Type': 'application/json' },
      };
      if (['POST', 'PUT', 'PATCH'].includes(postmanMethod) && postmanBody) {
        try {
          options.data = JSON.parse(postmanBody);
        } catch (e) {
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

  const responseStyle = {
    marginTop: "20px",
    padding: "10px",
    backgroundColor: colorMode === "dark" ? "#2D3748" : "#F7FAFC",
    color: colorMode === "dark" ? "#E2E8F0" : "#2D3748",
    borderRadius: "5px",
    border: `1px solid ${colorMode === "dark" ? "#4A5568" : "#CBD5E0"}`,
  };

  const runCode = async () => {
    // ... (existing runCode implementation)
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) {
      toast({
        title: "No code provided.",
        description: "Please write some code to execute.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      setIsLoading(true);
      setActivePanel("problem");
      const { run: result } = await executeCode("c", sourceCode, userInput); // Pass user input
      setOutput((prevOutput) => [...prevOutput, ...result.output.split("\n")]); // Append output
      setIsError(!!result.stderr);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error occurred.",
        description: error.message || "Could not execute the code.",
        status: "error",
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Global listener for USB Device Plug & Play hotplug events
  useEffect(() => {
    if (!window.electronAPI?.flash?.onEvent) return;

    const cleanup = window.electronAPI.flash.onEvent(evt => {
      if (evt.status === 'port_connected') {
        const connectedPort = evt.port || (evt.ports && evt.ports[0]?.path) || 'COM5';
        console.log('🔌 Auto-detected USB device connected:', connectedPort);
        setIsDeviceConnectedForActions(true);
        setSelectedDeviceInfo({ port: connectedPort, deviceType: 'ESP32' });
        localStorage.setItem('innoide:device-connected', 'true');
        localStorage.setItem('innoide:device-info', JSON.stringify({ port: connectedPort, deviceType: 'ESP32' }));
        window.dispatchEvent(new CustomEvent('innoide:device-connect', { detail: { port: connectedPort, deviceType: 'ESP32' } }));
      } else if (evt.status === 'port_disconnected') {
        console.log('❌ USB device disconnected:', evt.port);
        setIsDeviceConnectedForActions(false);
        setSelectedDeviceInfo(null);
        localStorage.setItem('innoide:device-connected', 'false');
        localStorage.removeItem('innoide:device-info');
        window.dispatchEvent(new CustomEvent('innoide:device-disconnect'));
      }
    });

    return () => cleanup();
  }, []);

  // Launch the Flash to Device 4-step wizard starting with Screen 9
  const handleCodeFlash = () => {
    window.dispatchEvent(new CustomEvent('innoide:flash-start'));
  };

  useImperativeHandle(ref, () => ({
    runCode,
    flashCode: handleCodeFlash,
    appendOutputLine: (line) => {
      setOutput((prev) => [...prev, line]);
      setResponse((prev) => (prev ? `${prev}\n${line}` : line));
    },
    clearOutput: () => {
      setOutput([]);
      setResponse("");
    },
  }));

  const handleRunClick = () => {
    setIsRunClicked(true);
    scrollToPanel();
    runCode();
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

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

      {/* Tool Selection Buttons */}
      <HStack spacing={4} mb={6} flexWrap="wrap">
        {[
          { id: "flash", label: "Flash", action: handleCodeFlash },
          { id: "viewOutput", label: "View Output", action: runCode },
          { id: "problem", label: "Problem" },
          { id: "debug", label: "Debug Console" },
          { id: "terminal", label: "Terminal" },
          { id: "postman", label: "Postman" },
          { id: "restApi", label: "REST API" },
        ].map((item) => (
          <Button
            key={item.id}
            size="sm"
            variant={activePanel === item.id ? "solid" : "outline"}
            colorScheme="blue"
            onClick={() => {
              if (activePanel === item.id && !item.action) {
                setActivePanel(null);
                if (onCollapse) onCollapse();
              } else {
                if (onExpand) onExpand();
                scrollToPanel();
                if (item.action) {
                  item.action();
                } else {
                  setActivePanel(item.id);
                }
              }
            }}
            borderRadius="md"
            px={6}
            h="36px"
            fontWeight="500"
            _hover={activePanel !== item.id ? { bg: "blue.50", borderColor: "blue.400" } : {}}
          >
            {item.label}
          </Button>
        ))}
      </HStack>

      {/* Main Content Container (Bordered Box) */}
      <Box
        border="1px solid"
        borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
        borderRadius="lg"
        p={6}
        boxShadow="sm"
        flex="1"
        overflowY="auto"
        minH="0"
        bg={colorMode === "dark" ? "gray.900" : "white"}
        sx={{
          '&::-webkit-scrollbar': { width: '7px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: colorMode === 'dark' ? '#666' : '#555', borderRadius: '8px' },
          '&::-webkit-scrollbar-thumb:hover': { background: colorMode === 'dark' ? '#888' : '#333' },
        }}
      >

        {/* REST API Builder Panel UI */}
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

        {/* Postman Panel UI - Rendered independently if toggled */}
        {activePanel === "postman" && (
          <Box display="flex" flexDirection="column" gap={6}>
            <HStack spacing={4} alignItems="center" h="56px" mb={4}>
              <Select
                w="120px"
                size="lg"
                h="48px"
                value={postmanMethod}
                onChange={(e) => setPostmanMethod(e.target.value)}
                borderRadius="md"
                bg={colorMode === "dark" ? "gray.800" : "white"}
                borderColor="gray.200"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </Select>
              <Input
                h="48px"
                width="85%"
                size="lg"
                flex={1}
                placeholder="https://jsonplaceholder.typicode.com/todos/1"
                textColor={colorMode === "dark" ? "white" : "black"}
                value={postmanUrl}
                onChange={(e) => setPostmanUrl(e.target.value)}
                bg={colorMode === "dark" ? "gray.800" : "white"}
                borderColor="gray.200"
                borderRadius="md"
                sx={{ margin: "0px !important" }}
              />
              <Button
                colorScheme="blue"
                size="lg"
                h="48px"
                onClick={handlePostmanSend}
                isLoading={postmanLoading}
                px={10}
                borderRadius="md"
              >
                Send
              </Button>
            </HStack>

            {['POST', 'PUT', 'PATCH'].includes(postmanMethod) && (
              <Box>
                <Text fontSize="xs" mb={1} color="gray.500">Request Body (JSON)</Text>
                <Textarea
                  size="sm"
                  value={postmanBody}
                  onChange={(e) => setPostmanBody(e.target.value)}
                  placeholder='{"key": "value"}'
                  fontFamily="monospace"
                  rows={4}
                  color={colorMode === "dark" ? "white" : "black"}
                  _placeholder={{ color: "gray.500" }}
                />
              </Box>
            )}

            <Box borderTop="1px solid" borderColor={colorMode === "dark" ? "gray.700" : "gray.100"} pt={4}>
              <Text fontSize="sm" fontWeight="bold" mb={2} color={colorMode === "dark" ? "gray.400" : "gray.700"}>
                Response
              </Text>
              {postmanResponse ? (
                <Box
                  bg={colorMode === "dark" ? "gray.800" : "gray.50"}
                  p={4}
                  borderRadius="md"
                  overflowY="auto"
                  maxH="400px"
                  border="1px solid"
                  borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                >
                  <pre style={{ fontSize: '13px', color: colorMode === "dark" ? '#e2e8f0' : '#1a202c' }}>
                    {JSON.stringify(postmanResponse.data, null, 2)}
                  </pre>
                </Box>
              ) : (
                <Text fontSize="sm" color="gray.400">
                  No response yet.
                </Text>
              )}
            </Box>
          </Box>
        )}

        {activePanel === "problem" && (
          <Box>
            <Text fontSize="sm" fontWeight="bold" mb={3} color={colorMode === "dark" ? "gray.500" : "black"}>Output</Text>
            <pre style={{ ...responseStyle, margin: 0, minHeight: "200px", fontSize: "13px" }}>
              {output.length > 0
                ? output.map((line, i) => <Text key={i}>{line}</Text>)
                : (response || "Run or flash to see output.")}
            </pre>
          </Box>
        )}

        {activePanel === "debug" && (
          <Box display="flex" flexDirection="column" gap={4}>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Text fontSize="sm" fontWeight="bold" color={colorMode === "dark" ? "gray.500" : "black"}>Debug Console</Text>
              <HStack spacing={2}>
                <Button size="xs" onClick={() => setIsConnectedToDevice(!isConnectedToDevice)} colorScheme={isConnectedToDevice ? "red" : "green"}>
                  {isConnectedToDevice ? "Disconnect" : "Connect Serial"}
                </Button>
                <Button size="xs" onClick={() => setSerialOutput([])}>Clear</Button>
              </HStack>
            </Box>
            <Box
              fontFamily="monospace"
              fontSize="13px"
              bg={colorMode === "dark" ? "black" : "gray.50"}
              p={4}
              borderRadius="md"
              maxH="400px"
              overflowY="auto"
            >
              {serialOutput.length === 0 ? (
                <Text color="gray.400">No debug output. Connect to a device.</Text>
              ) : (
                serialOutput.map((line, i) => <Text key={i}>{line}</Text>)
              )}
            </Box>
          </Box>
        )}

        {activePanel === "terminal" && (
          runtimeState !== "idle" ? (
            <Box h="100%" minH="250px">
              <TerminalPanel 
                isExpanded={true}
                onToggleExpand={onExpand}
              />
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={0} bg="white" border="1px solid" borderColor="gray.200" borderRadius="md" p={6} minH="300px">
              <Box
                fontFamily="monospace"
                fontSize="16px"
                mb={4}
                color="black"
                maxH="400px"
                overflowY="auto"
                sx={{
                  '&::-webkit-scrollbar': { width: '8px' },
                  '&::-webkit-scrollbar-thumb': { bg: 'gray.200', borderRadius: '4px' },
                }}
              >
                {terminalOutput.map((line, i) => (
                  <Text key={i} mb={1} whiteSpace="pre-wrap">
                    {line}
                  </Text>
                ))}
              </Box>
              <HStack spacing={3} alignItems="center" h="40px" mt={2} mb={0}>
                <Text color="green.600" fontWeight="bold" fontSize="16px" whiteSpace="nowrap" lineHeight="1">
                  {`user@innoide:${cwd}$`}
                </Text>
                <Input
                  variant="outline"
                  size="md"
                  fontSize="16px"
                  sx={{ margin: "0px !important", color: "black", _placeholder: { color: "gray.500" } }}
                  placeholder="Enter your input"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  borderColor="blue.500"
                  _hover={{ borderColor: "blue.400" }}
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                  color="black"
                  bg="transparent"
                  borderRadius="md"
                  maxW="400px"
                  h="36px"
                />
              </HStack>
            </Box>
          )
        )}
      </Box>
    </Box>
  );
});

export default Output;
