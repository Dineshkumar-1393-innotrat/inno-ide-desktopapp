import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  IconButton,
  Input,
  Text,
  HStack,
  VStack,
  Badge,
  useDisclosure,
  useToast,
  Tooltip,
  SimpleGrid,
  Divider
} from "@chakra-ui/react";
import {
  Bot,
  Send,
  Trash2,
  Copy,
  Check,
  Sparkles,
  X,
  Code,
  HelpCircle,
  AlertCircle,
  Cpu,
  PlusCircle,
  CheckCircle2,
  Layers,
  Activity,
  Zap
} from "lucide-react";
import {
  sendAgentCommand,
  executeAgentCommands,
  findSymbolForComponent
} from "../../services/dragDropAgentService";
import {
  analyzeCanvasState,
  processLocalAIQuery
} from "./circuitIntelligenceEngine";
import { addSymbolToTab } from "../../store/slices/simulationSlice";

export const SimulationAIAssistant = ({
  droppedItems = [],
  connections = [],
  activeTab = null,
  activeTabId = null,
  activeProjectName = "",
  activeProductName = "",
  symbolsData = [],
  onAddSymbolAtPosition = null,
  onRemoveSymbol = null,
  onMoveSymbol = null,
  onConnectSymbols = null
}) => {
  const dispatch = useDispatch();
  const reduxActiveTab = useSelector((state) => state.simulation.activeTab);
  const currentTabId = activeTabId || reduxActiveTab || activeTab?.id || 1;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "ai",
      text: "Hello! I'm your AI Assistant. How can I help you with your simulation or circuit today?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      commandsExecuted: null,
      results: null
    }
  ]);
  const [input, setInput] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [agentStatus, setAgentStatus] = useState("ready"); // "ready" | "busy" | "error"
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const toast = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Local fallback add handler if parent didn't provide one
  const handleAddSymbolFallback = useCallback((symbol, pos) => {
    if (typeof onAddSymbolAtPosition === "function") {
      return onAddSymbolAtPosition(symbol, pos);
    }
    const componentWidth = 100;
    const componentHeight = 100;
    const x = pos?.x ?? 200;
    const y = pos?.y ?? 200;
    const newSymbol = {
      symbol,
      x: Math.max(10, x),
      y: Math.max(10, y),
      width: componentWidth,
      height: componentHeight,
      rotation: 0,
      id: Date.now() + Math.random()
    };
    dispatch(addSymbolToTab({ tabId: currentTabId, symbol: newSymbol }));
    return newSymbol;
  }, [currentTabId, dispatch, onAddSymbolAtPosition]);

  // Handle user query submission with remote Drag-and-Drop agent API
  const handleSendQuery = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || isTyping) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setAgentStatus("busy");

    try {
      // 1. Call Drag and Drop Agent endpoint: POST https://drag-and-drop-agent-1.onrender.com/api/agent/chat
      const data = await sendAgentCommand(text);

      if (data && data.status === "success" && Array.isArray(data.commands) && data.commands.length > 0) {
        // Execute canvas commands
        const executed = executeAgentCommands(data.commands, data.results || [], {
          symbolsData,
          onAddSymbolAtPosition: handleAddSymbolFallback,
          onRemoveSymbol,
          onMoveSymbol,
          onConnectSymbols,
          droppedItems
        });

        // Show toast notification for each placed component
        executed.forEach((ex) => {
          if (ex.method === "canvas.addComponent") {
            toast({
              title: `✨ Added ${ex.name}`,
              description: `Position: (${ex.position?.x ?? 200}, ${ex.position?.y ?? 200})`,
              status: "success",
              duration: 2500,
              isClosable: true,
              position: "top"
            });
          } else if (ex.method === "canvas.removeComponent") {
            toast({
              title: `🗑️ Removed ${ex.componentId}`,
              status: "info",
              duration: 2000,
              isClosable: true,
              position: "top"
            });
          }
        });

        // Format conversational reply
        let replyText = `**${data.message || "Command executed successfully"}**\n\n`;
        executed.forEach((ex) => {
          if (ex.method === "canvas.addComponent") {
            replyText += `• Added **${ex.name}** onto your simulation canvas at position \`(${ex.position?.x ?? 200}, ${ex.position?.y ?? 200})\`.\n`;
          } else if (ex.method === "canvas.removeComponent") {
            replyText += `• Removed component \`${ex.componentId}\` from the canvas.\n`;
          } else if (ex.method === "canvas.connectComponents") {
            replyText += `• Connected \`${ex.source}\` ↔ \`${ex.target}\`.\n`;
          }
        });

        replyText += `\n💡 *Tip: Wire your sensors and actuators to Microcontroller connector zones (Z1 - Z6), or ask me to "Generate Arduino code"!*`;

        const aiMsg = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          commandsExecuted: executed,
          results: data.results || []
        };
        setMessages((prev) => [...prev, aiMsg]);
        setAgentStatus("ready");
      } else {
        // Agent returned error status or no commands (e.g. conversational question like "Explain circuit")
        const lowerQ = text.toLowerCase();
        const isGeneralQuestion =
          lowerQ.includes("explain") ||
          lowerQ.includes("circuit") ||
          lowerQ.includes("code") ||
          lowerQ.includes("arduino") ||
          lowerQ.includes("wire") ||
          lowerQ.includes("pin") ||
          lowerQ.includes("safety") ||
          lowerQ.includes("bom") ||
          lowerQ.includes("hello") ||
          lowerQ.includes("hi") ||
          lowerQ.includes("error") ||
          lowerQ.includes("debug");

        if (isGeneralQuestion) {
          // Use intelligent circuit analysis engine
          const analysis = analyzeCanvasState(droppedItems, connections, activeTab, activeProjectName, activeProductName);
          const localResponse = processLocalAIQuery(text, analysis);

          const aiMsg = {
            id: (Date.now() + 1).toString(),
            sender: "ai",
            text: localResponse.content,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          };
          setMessages((prev) => [...prev, aiMsg]);
        } else {
          // Unrecognized command advice
          const msg = data?.message || "No execution plan could be created for this request.";
          const aiMsg = {
            id: (Date.now() + 1).toString(),
            sender: "ai",
            text: `⚠️ **${msg}**\n\nYou can use natural drag-and-drop commands:\n• **"Add ESP32"** — Places the central Microcontroller\n• **"Add Temperature Sensor"** — Adds temperature sensing module\n• **"Add Servo Motors"** — Places a servo motor actuator\n• **"Add Buzzer"** — Adds an audio indicator\n• **"Add LED"** — Adds RGB status LED\n• **"Remove ESP32"** — Deletes component\n\nOr ask questions about wiring, pinouts, and Arduino code!`,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          };
          setMessages((prev) => [...prev, aiMsg]);
        }
        setAgentStatus("ready");
      }
    } catch (err) {
      console.warn("[SimulationAIAssistant] Remote agent error, trying local handler:", err);
      setAgentStatus("error");

      // Local fallback for "Add ..." commands if network is interrupted or server cold-starting
      const lower = text.toLowerCase().trim();
      if (lower.startsWith("add ") || lower.startsWith("insert ") || lower.startsWith("place ")) {
        const compQuery = text.replace(/^(add|insert|place)\s+/i, "").trim();
        const symbol = findSymbolForComponent(compQuery, symbolsData);

        if (symbol) {
          const added = handleAddSymbolFallback(symbol, { x: 200, y: 200 });
          toast({
            title: `✨ Added ${symbol.label || symbol.name}`,
            description: "Placed on canvas via local agent fallback",
            status: "success",
            duration: 2500,
            isClosable: true,
            position: "top"
          });

          const aiMsg = {
            id: (Date.now() + 1).toString(),
            sender: "ai",
            text: `✅ **Placed ${symbol.label || symbol.name} onto canvas** at position \`(200, 200)\`.\n\n*(Executed via local fallback while remote agent is syncing)*`,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            commandsExecuted: [
              {
                method: "canvas.addComponent",
                name: symbol.label || symbol.name,
                position: { x: 200, y: 200 },
                success: true
              }
            ]
          };
          setMessages((prev) => [...prev, aiMsg]);
          setIsTyping(false);
          return;
        }
      }

      // Default fallback response
      const analysis = analyzeCanvasState(droppedItems, connections, activeTab, activeProjectName, activeProductName);
      const localResponse = processLocalAIQuery(text, analysis);

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: localResponse.content,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: "ai",
        text: "Hello! I'm your AI Assistant. How can I help you with your simulation or circuit today?",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        commandsExecuted: null,
        results: null
      }
    ]);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copied to clipboard", status: "success", duration: 1500 });
  };

  const dragDropPrompts = [
    { label: "Add ESP32", query: "Add ESP32", icon: <Cpu size={12} color="#7c3aed" /> },
    { label: "Add Temp Sensor", query: "Add Temperature Sensor", icon: <PlusCircle size={12} color="#059669" /> },
    { label: "Add Servo Motors", query: "Add Servo Motors", icon: <PlusCircle size={12} color="#2563eb" /> },
    { label: "Add Buzzer", query: "Add Buzzer", icon: <PlusCircle size={12} color="#d97706" /> }
  ];

  const intelligencePrompts = [
    { label: "Explain Circuit", query: "Explain my circuit", icon: <Activity size={12} /> },
    { label: "Arduino Code", query: "Generate Arduino code", icon: <Code size={12} /> },
    { label: "Wiring Guide", query: "How to connect components?", icon: <HelpCircle size={12} /> },
    { label: "Check Errors", query: "Check for errors", icon: <AlertCircle size={12} /> }
  ];

  return (
    <>
      {/* AI Assistant Button */}
      <Button
        size="sm"
        bg="#7c3aed"
        color="#ffffff"
        _hover={{ bg: "#6d28d9", transform: "translateY(-1px)", boxShadow: "md" }}
        _active={{ transform: "translateY(0)" }}
        borderRadius="full"
        height="32px"
        px={3.5}
        fontWeight="600"
        fontSize="13px"
        onClick={onOpen}
        leftIcon={<Bot size={15} />}
        flexShrink={0}
        whiteSpace="nowrap"
      >
        AI Assistant
      </Button>

      {/* Modern AI Assistant Chatbot Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="sm">
        <DrawerOverlay bg="rgba(15, 23, 42, 0.4)" backdropFilter="blur(2px)" />
        <DrawerContent
          bg="#ffffff"
          color="#1e293b"
          maxW={{ base: "100%", sm: "400px" }}
          w="100%"
          display="flex"
          flexDirection="column"
          boxShadow="-6px 0 24px rgba(0, 0, 0, 0.12)"
        >
          {/* Header */}
          <DrawerHeader
            bg="#ffffff"
            borderBottom="1px solid #f1f5f9"
            py={3.5}
            px={4}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <HStack spacing={3}>
              <Box
                w="36px"
                h="36px"
                borderRadius="10px"
                bg="linear-gradient(135deg, #7c3aed, #6366f1)"
                color="white"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0 2px 8px rgba(124, 58, 237, 0.3)"
              >
                <Bot size={20} />
              </Box>
              <VStack align="start" spacing={0}>
                <HStack spacing={2} align="center">
                  <Text fontWeight="700" fontSize="15px" color="#0f172a" lineHeight="1.2">
                    AI Assistant
                  </Text>
                  <Badge
                    bg="#dcfce7"
                    color="#15803d"
                    fontSize="10px"
                    fontWeight="600"
                    borderRadius="full"
                    px={2}
                    py="1px"
                    textTransform="uppercase"
                    display="inline-flex"
                    alignItems="center"
                    gap="3px"
                  >
                    <Box w="5px" h="5px" borderRadius="full" bg="#22c55e" />
                    Online
                  </Badge>
                </HStack>
                <Text fontSize="11px" color="#64748b" mt="2px">
                  Simulation & Circuit Chatbot
                </Text>
              </VStack>
            </HStack>

            <HStack spacing={1}>
              <Tooltip label="Clear conversation" fontSize="xs">
                <IconButton
                  icon={<Trash2 size={16} />}
                  size="sm"
                  variant="ghost"
                  color="#94a3b8"
                  borderRadius="full"
                  _hover={{ color: "#ef4444", bg: "#fef2f2" }}
                  aria-label="Clear chat"
                  onClick={handleClear}
                />
              </Tooltip>
              <Tooltip label="Close assistant" fontSize="xs">
                <IconButton
                  icon={<X size={18} />}
                  size="sm"
                  variant="ghost"
                  color="#94a3b8"
                  borderRadius="full"
                  _hover={{ color: "#0f172a", bg: "#f1f5f9" }}
                  aria-label="Close"
                  onClick={onClose}
                />
              </Tooltip>
            </HStack>
          </DrawerHeader>

          {/* Quick Drag & Drop Action Prompts */}
          <Box px={3.5} py={2} bg="#f8fafc" borderBottom="1px solid #e2e8f0">
            <HStack justify="space-between" mb={1.5}>
              <Text fontSize="10.5px" fontWeight="700" color="#64748b" textTransform="uppercase" letterSpacing="0.04em">
                Drag & Drop Actions
              </Text>
              <Badge fontSize="9px" colorScheme="purple" borderRadius="full" px={1.5}>
                API Powered
              </Badge>
            </HStack>
            <SimpleGrid columns={2} spacing={1.5} mb={2}>
              {dragDropPrompts.map((p, idx) => (
                <Button
                  key={`dnd-${idx}`}
                  size="xs"
                  variant="outline"
                  leftIcon={p.icon}
                  justifyContent="flex-start"
                  h="28px"
                  px={2}
                  fontSize="11px"
                  fontWeight="600"
                  borderRadius="md"
                  borderColor="#e2e8f0"
                  bg="#ffffff"
                  color="#1e293b"
                  boxShadow="0 1px 2px rgba(0,0,0,0.03)"
                  _hover={{ bg: "#f5f3ff", borderColor: "#7c3aed", color: "#7c3aed" }}
                  onClick={() => handleSendQuery(p.query)}
                  whiteSpace="nowrap"
                  overflow="hidden"
                >
                  <Text isTruncated>{p.label}</Text>
                </Button>
              ))}
            </SimpleGrid>

            <SimpleGrid columns={2} spacing={1.5}>
              {intelligencePrompts.map((p, idx) => (
                <Button
                  key={`intel-${idx}`}
                  size="xs"
                  variant="ghost"
                  leftIcon={<span style={{ color: "#7c3aed", display: "flex", alignItems: "center" }}>{p.icon}</span>}
                  justifyContent="flex-start"
                  h="26px"
                  px={2}
                  fontSize="11px"
                  fontWeight="500"
                  borderRadius="md"
                  bg="transparent"
                  color="#475569"
                  _hover={{ bg: "#f1f5f9", color: "#0f172a" }}
                  onClick={() => handleSendQuery(p.query)}
                  whiteSpace="nowrap"
                  overflow="hidden"
                >
                  <Text isTruncated>{p.label}</Text>
                </Button>
              ))}
            </SimpleGrid>
          </Box>

          {/* Chat Messages Body */}
          <DrawerBody p={4} display="flex" flexDirection="column" gap={3} overflowY="auto" bg="#ffffff">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              const isCode = msg.text.includes("```");

              return (
                <Box
                  key={msg.id}
                  display="flex"
                  flexDirection="column"
                  alignItems={isUser ? "flex-end" : "flex-start"}
                  w="100%"
                >
                  <HStack
                    spacing={2}
                    align="flex-start"
                    maxW="92%"
                    justify={isUser ? "flex-end" : "flex-start"}
                  >
                    {!isUser && (
                      <Box
                        w="26px"
                        h="26px"
                        borderRadius="full"
                        bg="#7c3aed"
                        color="white"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                        mt="2px"
                      >
                        <Bot size={14} />
                      </Box>
                    )}

                    <Box display="flex" flexDirection="column" alignItems={isUser ? "flex-end" : "flex-start"} w="100%">
                      <Box
                        bg={isUser ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "#f8fafc"}
                        color={isUser ? "#ffffff" : "#1e293b"}
                        px={3.5}
                        py={2.5}
                        borderRadius={isUser ? "16px 16px 4px 16px" : "4px 16px 16px 16px"}
                        border={isUser ? "none" : "1px solid #e2e8f0"}
                        fontSize="13px"
                        lineHeight="1.55"
                        boxShadow="0 1px 2px rgba(0, 0, 0, 0.05)"
                        wordBreak="break-word"
                        whiteSpace="pre-wrap"
                      >
                        {isCode ? (
                          <Box>
                            {msg.text.split("```").map((chunk, i) => {
                              if (i % 2 === 1) {
                                const cleanedCode = chunk.replace(/^[a-zA-Z0-9_-]+\n/, "");
                                return (
                                  <Box
                                    key={i}
                                    my={2}
                                    bg="#0f172a"
                                    color="#f8fafc"
                                    borderRadius="8px"
                                    fontSize="12px"
                                    fontFamily="monospace"
                                    overflow="hidden"
                                    border="1px solid #334155"
                                  >
                                    <HStack
                                      justify="space-between"
                                      px={3}
                                      py={1.5}
                                      bg="#1e293b"
                                      borderBottom="1px solid #334155"
                                    >
                                      <Text fontSize="10px" fontWeight="600" color="#94a3b8" letterSpacing="0.05em">
                                        FIRMWARE CODE
                                      </Text>
                                      <Button
                                        size="xs"
                                        height="20px"
                                        variant="ghost"
                                        color="#cbd5e1"
                                        _hover={{ color: "white", bg: "#334155" }}
                                        leftIcon={copiedId === msg.id ? <Check size={11} color="#4ade80" /> : <Copy size={11} />}
                                        onClick={() => handleCopy(cleanedCode, msg.id)}
                                      >
                                        {copiedId === msg.id ? "Copied" : "Copy"}
                                      </Button>
                                    </HStack>
                                    <pre style={{ margin: 0, padding: "10px 12px", overflowX: "auto", whiteSpace: "pre" }}>
                                      {cleanedCode}
                                    </pre>
                                  </Box>
                                );
                              }
                              return <span key={i}>{chunk}</span>;
                            })}
                          </Box>
                        ) : (
                          msg.text
                        )}

                        {/* Executed Canvas Commands Card */}
                        {msg.commandsExecuted && msg.commandsExecuted.length > 0 && (
                          <Box
                            mt={2.5}
                            p={2.5}
                            bg="#f0fdf4"
                            border="1px solid #bbf7d0"
                            borderRadius="8px"
                            fontSize="11.5px"
                          >
                            <HStack spacing={1.5} color="#166534" fontWeight="600" mb={1.5}>
                              <CheckCircle2 size={13} color="#16a34a" />
                              <Text>Executed Canvas Actions ({msg.commandsExecuted.length})</Text>
                            </HStack>
                            <VStack align="stretch" spacing={1}>
                              {msg.commandsExecuted.map((cmd, cIdx) => (
                                <HStack
                                  key={cIdx}
                                  justify="space-between"
                                  bg="white"
                                  px={2}
                                  py={1}
                                  borderRadius="6px"
                                  border="1px solid #dcfce7"
                                >
                                  <HStack spacing={1.5}>
                                    <Badge colorScheme="purple" fontSize="9px" px={1.5}>
                                      {cmd.method}
                                    </Badge>
                                    <Text fontWeight="600" color="#1e293b" fontSize="11px">
                                      {cmd.name || cmd.componentId}
                                    </Text>
                                  </HStack>
                                  {cmd.position && (
                                    <Text fontSize="10px" color="#64748b" fontFamily="mono">
                                      ({cmd.position.x}, {cmd.position.y})
                                    </Text>
                                  )}
                                </HStack>
                              ))}
                            </VStack>
                          </Box>
                        )}
                      </Box>
                      <Text fontSize="10px" color="#94a3b8" mt="3px" px="2px">
                        {msg.time}
                      </Text>
                    </Box>
                  </HStack>
                </Box>
              );
            })}

            {isTyping && (
              <HStack spacing={2} align="center" mt={1}>
                <Box
                  w="26px"
                  h="26px"
                  borderRadius="full"
                  bg="#7c3aed"
                  color="white"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                >
                  <Bot size={14} />
                </Box>
                <Box
                  bg="#f8fafc"
                  border="1px solid #e2e8f0"
                  px={3}
                  py={2}
                  borderRadius="4px 16px 16px 16px"
                  fontSize="12px"
                  color="#64748b"
                >
                  <HStack spacing={1.5}>
                    <Sparkles size={13} color="#7c3aed" />
                    <Text fontSize="12px" fontWeight="500">Agent is executing command...</Text>
                  </HStack>
                </Box>
              </HStack>
            )}
            <div ref={messagesEndRef} />
          </DrawerBody>

          {/* Footer Input Bar */}
          <DrawerFooter p={3} borderTop="1px solid #f1f5f9" bg="#ffffff">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuery();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                gap: "8px",
                margin: 0,
                padding: 0
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: "40px",
                  minHeight: "40px",
                  maxHeight: "40px",
                  backgroundColor: isInputFocused ? "#ffffff" : "#f8fafc",
                  border: isInputFocused ? "1.5px solid #7c3aed" : "1.5px solid #cbd5e1",
                  borderRadius: "9999px",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 16px",
                  boxShadow: isInputFocused ? "0 0 0 2px rgba(124, 58, 237, 0.15)" : "none",
                  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                  cursor: "text",
                  boxSizing: "border-box"
                }}
                onClick={() => inputRef.current?.focus()}
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder='e.g. "Add ESP32" or "Add Temperature Sensor"'
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSendQuery();
                    }
                  }}
                  style={{
                    width: "100%",
                    height: "22px",
                    lineHeight: "22px",
                    fontSize: "13px",
                    color: "#0f172a",
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    padding: 0,
                    margin: 0,
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                aria-label="Send message"
                style={{
                  width: "40px",
                  height: "40px",
                  minWidth: "40px",
                  maxWidth: "40px",
                  minHeight: "40px",
                  maxHeight: "40px",
                  borderRadius: "50%",
                  backgroundColor: input.trim() ? "#7c3aed" : "#e2e8f0",
                  color: input.trim() ? "#ffffff" : "#94a3b8",
                  border: "none",
                  outline: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: input.trim() && !isTyping ? "pointer" : "default",
                  flexShrink: 0,
                  transition: "background-color 0.15s ease, color 0.15s ease",
                  boxSizing: "border-box"
                }}
              >
                <Send size={16} style={{ display: "block", transform: "translate(-0.5px, 0.5px)" }} />
              </button>
            </form>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SimulationAIAssistant;
