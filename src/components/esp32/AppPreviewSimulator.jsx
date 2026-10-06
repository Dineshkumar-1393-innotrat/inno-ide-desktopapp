import React, { useState } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Badge,
  IconButton,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Progress
} from "@chakra-ui/react";
import {
  FaTerminal,
  FaWifi,
  FaMobileAlt,
  FaBell,
  FaArrowUp,
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaTable,
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaTag,
  FaMapMarkerAlt,
  FaExternalLinkAlt,
  FaWpforms,
  FaClipboardList,
  FaChartLine,
  FaImage
} from "react-icons/fa";
import {
  isHardcodedTextFieldQuestion,
  isHardcodedTextFieldResponse,
  formatGeologTime
} from "./geologHelpers.js";

/**
 * AppPreviewSimulator
 * Live smartphone simulator (View 3 of App Builder Studio).
 * Renders interactive smartphone frame with live hardware controls, sensor displays,
 * form feedback widgets, and real-time serial traffic log console.
 */
export default function AppPreviewSimulator({
  visibleWidgets,
  projectName,
  activePort,
  serialTrafficLogs,
  setSerialTrafficLogs,
  handleUpdateWidget,
  handleTestHardwareSignal,
  handleOpenAddCrudRecord,
  handleOpenEditCrudRecord,
  handleDeleteCrudRecord,
  deviceDetectedLocation,
  newAnswerInputs,
  setNewAnswerInputs,
  handleSubmitFormAnswer
}) {
  const [isSerialTrafficOpen, setIsSerialTrafficOpen] = useState(false);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" w="100%">
      <HStack justify="center" spacing={3} mb={3}>
        <Badge colorScheme="green" px={3} py={1} borderRadius="full">
          ● Simulator Running
        </Badge>
        <Button
          size="xs"
          variant="outline"
          leftIcon={<FaTerminal size={11} />}
          onClick={() => setIsSerialTrafficOpen(!isSerialTrafficOpen)}
        >
          {isSerialTrafficOpen ? "Hide Serial Traffic" : "View Serial Traffic"}
        </Button>
      </HStack>

      {/* Smartphone Preview Frame */}
      <Box
        w="340px"
        minH="620px"
        bg="white"
        borderRadius="42px"
        border="10px solid #0f172a"
        shadow="2xl"
        overflow="hidden"
        display="flex"
        flexDirection="column"
        mb={4}
      >
        {/* Status Bar */}
        <HStack justify="space-between" px={6} pt={3} pb={1} fontSize="10px" color="gray.700" fontWeight="bold">
          <Text>9:41</Text>
          <HStack spacing={1.5}>
            <FaWifi size={10} />
            <Text fontSize="9px">5G</Text>
          </HStack>
        </HStack>

        {/* App Screen Content in Live Mode */}
        <Box flex="1" p={4} bg="#f8fafc" overflowY="auto">
          <HStack justify="space-between" mb={4}>
            <HStack spacing={2}>
              <Text fontSize="md">🌱</Text>
              <Text fontWeight="extrabold" fontSize="md">{projectName}</Text>
            </HStack>
            <Badge colorScheme="green" fontSize="9px">Online</Badge>
          </HStack>

          <VStack spacing={3} align="stretch" minH="240px">
            {visibleWidgets.length === 0 ? (
              <Flex
                direction="column"
                align="center"
                justify="center"
                h="260px"
                border="2px dashed"
                borderColor="gray.300"
                borderRadius="2xl"
                p={6}
                textAlign="center"
                my={4}
              >
                <Box p={3} bg="gray.100" color="gray.400" borderRadius="full" mb={2.5}>
                  <FaMobileAlt size={20} />
                </Box>
                <Text fontSize="xs" fontWeight="bold" color="gray.600">
                  No Components to Preview
                </Text>
                <Text fontSize="11px" color="gray.400" mt={1} maxW="210px">
                  Switch back to Designer mode to add components to this screen.
                </Text>
              </Flex>
            ) : visibleWidgets.map((w) => (
              <Box
                key={w.id}
                p={3.5}
                bg={w.bgColor || "white"}
                borderRadius={`${w.cornerRadius || 16}px`}
                shadow="sm"
              >
                {w.type === "switch" && (
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" fontSize="sm">{w.title}</Text>
                      <Text fontSize="10px" color="gray.400">{w.boundTargetName || w.boundTarget}</Text>
                    </VStack>
                    <Switch
                      colorScheme="green"
                      isChecked={w.state}
                      onChange={(e) => handleUpdateWidget("state", e.target.checked, w.id)}
                    />
                  </HStack>
                )}

                {w.type === "slider" && (
                  <VStack align="stretch" spacing={1.5}>
                    <HStack justify="space-between">
                      <Text fontWeight="bold" fontSize="sm">{w.title}</Text>
                      <Text fontWeight="extrabold" color="purple.600">{w.value}{w.unit || "°"}</Text>
                    </HStack>
                    <Slider
                      value={w.value}
                      min={w.min || 0}
                      max={w.max || 180}
                      onChange={(val) => handleUpdateWidget("value", val, w.id)}
                    >
                      <SliderTrack bg="gray.100">
                        <SliderFilledTrack bg="purple.500" />
                      </SliderTrack>
                      <SliderThumb boxSize={3.5} />
                    </Slider>
                  </VStack>
                )}

                {w.type === "gauge" && (
                  <VStack align="stretch" spacing={1}>
                    <HStack justify="space-between">
                      <Text fontWeight="bold" fontSize="sm">{w.title}</Text>
                      <Badge colorScheme="red" fontSize="9px">Live Sensor</Badge>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="black" color="red.500">
                      {w.value}{w.unit || "°C"}
                    </Text>
                  </VStack>
                )}

                {w.type === "button" && (
                  <Button
                    w="100%"
                    colorScheme="orange"
                    borderRadius="xl"
                    leftIcon={<FaBell size={13} />}
                    onClick={() => handleTestHardwareSignal(w)}
                  >
                    {w.title}
                  </Button>
                )}

                {w.type === "top_button" && (
                  <Button
                    w="100%"
                    colorScheme="blue"
                    borderRadius="xl"
                    leftIcon={<FaArrowUp size={13} />}
                    onClick={() => handleTestHardwareSignal(w)}
                    fontWeight="bold"
                  >
                    {w.title}
                  </Button>
                )}

                {w.type === "bottom_button" && (
                  <Button
                    w="100%"
                    colorScheme="cyan"
                    color="white"
                    borderRadius="xl"
                    leftIcon={<FaArrowDown size={13} />}
                    onClick={() => handleTestHardwareSignal(w)}
                    fontWeight="bold"
                  >
                    {w.title}
                  </Button>
                )}

                {w.type === "left_button" && (
                  <Button
                    w="100%"
                    colorScheme="purple"
                    borderRadius="xl"
                    leftIcon={<FaArrowLeft size={13} />}
                    onClick={() => handleTestHardwareSignal(w)}
                    fontWeight="bold"
                  >
                    {w.title}
                  </Button>
                )}

                {w.type === "right_button" && (
                  <Button
                    w="100%"
                    colorScheme="purple"
                    borderRadius="xl"
                    leftIcon={<FaArrowRight size={13} />}
                    onClick={() => handleTestHardwareSignal(w)}
                    fontWeight="bold"
                  >
                    {w.title}
                  </Button>
                )}

                {w.type === "dpad" && (
                  <VStack align="center" spacing={2} p={1}>
                    <HStack justify="space-between" w="100%">
                      <Text fontWeight="bold" fontSize="xs">{w.title}</Text>
                      <Badge colorScheme="blue" fontSize="9px">4-Way D-Pad</Badge>
                    </HStack>
                    <Box p={2.5} bg="gray.100" borderRadius="2xl" border="1px solid" borderColor="gray.300">
                      <VStack spacing={1}>
                        <Button
                          size="xs"
                          colorScheme="blue"
                          w="44px"
                          h="32px"
                          borderRadius="lg"
                          onClick={() => handleTestHardwareSignal({ ...w, boundTarget: "GPIO 13", title: "Top Button (Forward)" })}
                        >
                          <FaArrowUp size={11} />
                        </Button>
                        <HStack spacing={1}>
                          <Button
                            size="xs"
                            colorScheme="purple"
                            w="44px"
                            h="32px"
                            borderRadius="lg"
                            onClick={() => handleTestHardwareSignal({ ...w, boundTarget: "GPIO 12", title: "Left Button (Steer Left)" })}
                          >
                            <FaArrowLeft size={11} />
                          </Button>
                          <Box w="36px" h="32px" bg="gray.300" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                            <Text fontSize="10px" fontWeight="black" color="gray.600">●</Text>
                          </Box>
                          <Button
                            size="xs"
                            colorScheme="purple"
                            w="44px"
                            h="32px"
                            borderRadius="lg"
                            onClick={() => handleTestHardwareSignal({ ...w, boundTarget: "GPIO 15", title: "Right Button (Steer Right)" })}
                          >
                            <FaArrowRight size={11} />
                          </Button>
                        </HStack>
                        <Button
                          size="xs"
                          colorScheme="blue"
                          w="44px"
                          h="32px"
                          borderRadius="lg"
                          onClick={() => handleTestHardwareSignal({ ...w, boundTarget: "GPIO 14", title: "Bottom Button (Reverse)" })}
                        >
                          <FaArrowDown size={11} />
                        </Button>
                      </VStack>
                    </Box>
                  </VStack>
                )}

                {/* CRUD Table Widget in Preview Mode */}
                {w.type === "crud_table" && (
                  <VStack align="stretch" spacing={2.5}>
                    <HStack justify="space-between" align="center">
                      <HStack spacing={1.5}>
                        <Box color="blue.500">
                          <FaTable size={13} />
                        </Box>
                        <Text fontWeight="bold" fontSize="xs" color="gray.800">
                          {w.title}
                        </Text>
                      </HStack>
                      <Button
                        size="xs"
                        colorScheme="blue"
                        variant="solid"
                        leftIcon={<FaPlus size={9} />}
                        h="22px"
                        px={2.5}
                        fontSize="10px"
                        onClick={() => handleOpenAddCrudRecord(w.id)}
                      >
                        Add
                      </Button>
                    </HStack>

                    <VStack align="stretch" spacing={1.5}>
                      {(w.records || []).length === 0 ? (
                        <Box py={3} textAlign="center" bg="gray.50" borderRadius="lg" border="1px dashed" borderColor="gray.200">
                          <Text fontSize="10px" color="gray.400">No records yet. Click '+ Add' to create one.</Text>
                        </Box>
                      ) : (
                        (w.records || []).map((rec) => (
                          <HStack
                            key={rec.id}
                            p={2}
                            bg="gray.50"
                            borderRadius="lg"
                            border="1px solid"
                            borderColor="gray.200"
                            justify="space-between"
                            fontSize="11px"
                          >
                            <VStack align="start" spacing={0} maxW="160px">
                              <Text fontWeight="bold" fontSize="11px" color="gray.800" isTruncated>
                                {rec.name}
                              </Text>
                              <HStack spacing={1.5}>
                                <Badge
                                  colorScheme={rec.status === "Active" ? "green" : rec.status === "Alert" ? "red" : "blue"}
                                  fontSize="8px"
                                  px={1}
                                  borderRadius="sm"
                                >
                                  {rec.value || rec.status || "OK"}
                                </Badge>
                                <Text fontSize="9px" color="gray.400">{rec.timestamp}</Text>
                              </HStack>
                            </VStack>

                            <HStack spacing={1}>
                              <IconButton
                                icon={<FaEdit size={9} />}
                                size="xs"
                                h="22px"
                                minW="22px"
                                variant="ghost"
                                color="blue.500"
                                onClick={() => handleOpenEditCrudRecord(w.id, rec)}
                                aria-label="Edit Record"
                              />
                              <IconButton
                                icon={<FaTrashAlt size={9} />}
                                size="xs"
                                h="22px"
                                minW="22px"
                                variant="ghost"
                                color="red.400"
                                onClick={() => handleDeleteCrudRecord(w.id, rec.id)}
                                aria-label="Delete Record"
                              />
                            </HStack>
                          </HStack>
                        ))
                      )}
                    </VStack>
                  </VStack>
                )}

                {/* Label Widget in Preview Mode */}
                {w.type === "label" && (
                  <HStack justify="space-between" align="center">
                    <HStack spacing={2.5}>
                      <Box p={1.5} bg={w.bgColor ? "whiteAlpha.300" : "blue.50"} color={w.color || "blue.500"} borderRadius="md">
                        <FaTag size={13} />
                      </Box>
                      <Text
                        fontWeight="bold"
                        fontSize={w.fontSize ? `${w.fontSize}px` : "sm"}
                        color={w.color || "gray.800"}
                      >
                        {w.title}
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                      {w.value !== undefined && w.value !== 0 && w.value !== ""
                        ? `${w.value}${w.unit || ""}`
                        : (w.boundTargetName || w.boundTarget || "Telemetry")}
                    </Text>
                  </HStack>
                )}

                {/* Location Widget in Preview Mode */}
                {w.type === "location" && (() => {
                  const hist = Array.isArray(w.locationHistory) ? w.locationHistory : [];
                  const lastOnLoc = hist.find(h => h.event === "ON") || null;
                  const lastOffLoc = hist.find(h => h.event === "OFF") || null;
                  const esp32Loc = deviceDetectedLocation;
                  return (
                    <VStack align="stretch" spacing={2}>
                      {/* Header */}
                      <HStack justify="space-between">
                        <HStack spacing={2}>
                          <Box p={1.5} bg="cyan.50" color="cyan.600" borderRadius="lg">
                            <FaMapMarkerAlt size={13} />
                          </Box>
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="bold" fontSize="xs" color="gray.800">{w.title || "Device Location"}</Text>
                            <Text fontSize="9px" color="gray.400">GPS & Switch Geologger</Text>
                          </VStack>
                        </HStack>
                        <HStack spacing={1}>
                          {lastOnLoc && <Badge colorScheme="green" fontSize="7px" px={1}>ON</Badge>}
                          {lastOffLoc && <Badge colorScheme="red" fontSize="7px" px={1}>OFF</Badge>}
                        </HStack>
                      </HStack>

                      {/* ESP32-S3 Device Location */}
                      <Box p={2} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
                        <HStack spacing={1} mb={1}>
                          <Box w="6px" h="6px" borderRadius="full" bg="blue.500" />
                          <Text fontSize="9px" fontWeight="extrabold" color="blue.600" textTransform="uppercase">ESP32-S3 Device</Text>
                          <Badge colorScheme="blue" fontSize="6px">{esp32Loc?.source?.includes("Calibrated") ? "Calibrated" : "IP Geo"}</Badge>
                        </HStack>
                        {esp32Loc && esp32Loc.lat ? (
                          <>
                            <Text fontSize="11px" fontWeight="bold" color="blue.800">📍 {esp32Loc.city}{esp32Loc.country ? `, ${esp32Loc.country}` : ""}</Text>
                            <Text fontSize="9px" color="blue.500" fontFamily="monospace">{esp32Loc.lat}° N, {esp32Loc.lng}° E</Text>
                          </>
                        ) : (
                          <Text fontSize="10px" color="blue.400" fontStyle="italic">Detecting location...</Text>
                        )}
                      </Box>

                      {/* Switch ON Location */}
                      <Box p={2} bg="green.50" borderRadius="lg" border="1px solid" borderColor={lastOnLoc ? "green.300" : "green.100"}>
                        <HStack spacing={1} mb={1}>
                          <Box w="6px" h="6px" borderRadius="full" bg={lastOnLoc ? "green.500" : "gray.300"} />
                          <Text fontSize="9px" fontWeight="extrabold" color={lastOnLoc ? "green.600" : "gray.400"} textTransform="uppercase">Switch ON Location</Text>
                        </HStack>
                        {lastOnLoc ? (
                          <>
                            <Text fontSize="11px" fontWeight="bold" color="green.800">🟢 {lastOnLoc.city}</Text>
                            <HStack justify="space-between">
                              <Text fontSize="9px" color="green.500" fontFamily="monospace">{lastOnLoc.lat ? `${lastOnLoc.lat}° N, ${lastOnLoc.lng}° E` : "Pending"}</Text>
                              <Text fontSize="8px" color="green.400">{formatGeologTime(lastOnLoc)}</Text>
                            </HStack>
                            {lastOnLoc.lat && (
                              <Button size="xs" colorScheme="green" variant="ghost" leftIcon={<FaExternalLinkAlt size={8} />} fontSize="9px"
                                as="a" href={`https://www.google.com/maps?q=${lastOnLoc.lat},${lastOnLoc.lng}`} target="_blank" rel="noreferrer">
                                Maps
                              </Button>
                            )}
                          </>
                        ) : (
                          <Text fontSize="9px" color="gray.400" fontStyle="italic">Toggle switch ON to capture location</Text>
                        )}
                      </Box>

                      {/* Switch OFF Location */}
                      <Box p={2} bg="red.50" borderRadius="lg" border="1px solid" borderColor={lastOffLoc ? "red.300" : "red.100"}>
                        <HStack spacing={1} mb={1}>
                          <Box w="6px" h="6px" borderRadius="full" bg={lastOffLoc ? "red.500" : "gray.300"} />
                          <Text fontSize="9px" fontWeight="extrabold" color={lastOffLoc ? "red.600" : "gray.400"} textTransform="uppercase">Switch OFF Location</Text>
                        </HStack>
                        {lastOffLoc ? (
                          <>
                            <Text fontSize="11px" fontWeight="bold" color="red.800">🔴 {lastOffLoc.city}</Text>
                            <HStack justify="space-between">
                              <Text fontSize="9px" color="red.500" fontFamily="monospace">{lastOffLoc.lat ? `${lastOffLoc.lat}° N, ${lastOffLoc.lng}° E` : "Pending"}</Text>
                              <Text fontSize="8px" color="red.400">{formatGeologTime(lastOffLoc)}</Text>
                            </HStack>
                            {lastOffLoc.lat && (
                              <Button size="xs" colorScheme="red" variant="ghost" leftIcon={<FaExternalLinkAlt size={8} />} fontSize="9px"
                                as="a" href={`https://www.google.com/maps?q=${lastOffLoc.lat},${lastOffLoc.lng}`} target="_blank" rel="noreferrer">
                                Maps
                              </Button>
                            )}
                          </>
                        ) : (
                          <Text fontSize="9px" color="gray.400" fontStyle="italic">Toggle switch OFF to capture location</Text>
                        )}
                      </Box>

                      {/* Full History Log in Preview */}
                      {hist.length > 0 && (
                        <Box pt={0.5}>
                          <Text fontSize="9px" fontWeight="bold" color="gray.400" mb={1} textTransform="uppercase" letterSpacing="wider">
                            Switch Geolog History ({hist.length})
                          </Text>
                          <VStack align="stretch" spacing={1} maxH="110px" overflowY="auto">
                            {hist.slice(0, 10).map((item, idx) => {
                              const isON = item.event === "ON";
                              const isOFF = item.event === "OFF";
                              const badgeColor = isON ? "green" : (isOFF ? "red" : "blue");
                              return (
                                <HStack key={item.id || idx} justify="space-between" p={1} bg={isON ? "green.50" : (isOFF ? "red.50" : "blue.50")} borderRadius="md" fontSize="8px">
                                  <HStack spacing={1}>
                                    <Badge colorScheme={badgeColor} fontSize="6px" px={1}>{item.event || "LOG"}</Badge>
                                    <Text fontWeight="semibold" color="gray.700" noOfLines={1} maxW="75px">{item.city || "Location"}</Text>
                                    {item.lat && <Text color="gray.400" fontFamily="monospace" fontSize="7px">{Number(item.lat).toFixed(3)}°</Text>}
                                  </HStack>
                                  <Text color="gray.400" fontFamily="monospace">{formatGeologTime(item)}</Text>
                                </HStack>
                              );
                            })}
                          </VStack>
                        </Box>
                      )}
                    </VStack>
                  );
                })()}

                {/* Google Form Widget in Preview Mode */}
                {w.type === "textfield" && (() => {
                  const safeQuestions = (w.questions || []).filter((q) => !isHardcodedTextFieldQuestion(q));
                  const safeResponses = (w.responses || []).filter((r) => !isHardcodedTextFieldResponse(r));
                  return (
                    <VStack align="stretch" spacing={2.5}>
                      <HStack justify="space-between" align="center">
                        <HStack spacing={1.5}>
                          <FaWpforms color="#8b5cf6" size={13} />
                          <Text fontWeight="bold" fontSize="xs" color="gray.800">{w.title || "Feedback Form"}</Text>
                        </HStack>
                        <Badge fontSize="8px" colorScheme="purple">Form</Badge>
                      </HStack>

                      {safeQuestions.length > 0 ? (
                        <VStack align="stretch" spacing={2}>
                          {safeQuestions.map((q, idx) => {
                            const inputKey = `${w.id}_${q.id}`;
                            const currentAns = newAnswerInputs[inputKey] || "";
                            return (
                              <Box key={q.id || idx} p={2} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="purple.100">
                                <Text fontSize="11px" fontWeight="bold" color="purple.900" mb={1.5}>
                                  {idx + 1}. {q.text} {q.required !== false && <Text as="span" color="red.500">*</Text>}
                                </Text>
                                <HStack spacing={1.5}>
                                  <Input
                                    size="xs"
                                    placeholder="Type your answer..."
                                    bg="white"
                                    borderRadius="md"
                                    value={currentAns}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setNewAnswerInputs((prev) => ({ ...prev, [inputKey]: val }));
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleSubmitFormAnswer(w.id, q.id, q.text, currentAns, "Mobile Preview");
                                      }
                                    }}
                                  />
                                  <Button
                                    size="xs"
                                    colorScheme="purple"
                                    borderRadius="md"
                                    px={2.5}
                                    onClick={() => handleSubmitFormAnswer(w.id, q.id, q.text, currentAns, "Mobile Preview")}
                                  >
                                    Submit
                                  </Button>
                                </HStack>
                              </Box>
                            );
                          })}
                        </VStack>
                      ) : (
                        <Box p={2.5} bg="gray.50" borderRadius="lg" textAlign="center">
                          <Text fontSize="10px" color="gray.500">
                            No questions created yet. Add questions on the designer canvas to render here.
                          </Text>
                        </Box>
                      )}

                      {/* Submitted Answers / Responses in Mobile Preview */}
                      {safeResponses.length > 0 && (
                        <Box p={2.5} bg="purple.50" borderRadius="lg" border="1px solid" borderColor="purple.200" mt={1}>
                          <HStack justify="space-between" mb={1.5}>
                            <HStack spacing={1.5}>
                              <FaClipboardList size={11} color="#8b5cf6" />
                              <Text fontSize="10px" fontWeight="bold" color="purple.900">
                                Submitted Answers ({safeResponses.length})
                              </Text>
                            </HStack>
                            <Badge fontSize="8px" colorScheme="purple">Live Feed</Badge>
                          </HStack>
                          <VStack align="stretch" spacing={1.5} maxH="160px" overflowY="auto">
                            {safeResponses.map((resp, rIdx) => (
                              <Box key={resp.id || rIdx} p={2} bg="white" borderRadius="md" border="1px solid" borderColor="purple.100" fontSize="10px">
                                <HStack justify="space-between" mb={0.5}>
                                  <Text fontWeight="bold" color="purple.800" noOfLines={1} fontSize="9px">
                                    {resp.questionText || resp.question || "Answer"}
                                  </Text>
                                  <Text color="gray.400" fontSize="8px">{resp.timestamp || resp.time || "Just now"}</Text>
                                </HStack>
                                <Text color="gray.800" fontWeight="semibold" fontSize="11px">💬 {resp.answer}</Text>
                                <Text color="gray.400" fontSize="8px" mt={0.5}>Source: {resp.source || "Mobile UI"}</Text>
                              </Box>
                            ))}
                          </VStack>
                        </Box>
                      )}
                    </VStack>
                  );
                })()}

                {/* Chart / Graph Widget in Preview Mode */}
                {w.type === "chart" && (
                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between">
                      <HStack spacing={2}>
                        <FaChartLine color="#2563eb" />
                        <Text fontWeight="bold" fontSize="xs">{w.title}</Text>
                      </HStack>
                      <Badge colorScheme="blue" fontSize="9px">● Live Stream</Badge>
                    </HStack>
                    <Box h="50px" w="100%" bg="blue.50" borderRadius="lg" p={1} display="flex" alignItems="flex-end">
                      <svg width="100%" height="100%" viewBox="0 0 200 40" preserveAspectRatio="none">
                        <path d="M0,35 Q30,10 60,25 T120,15 T180,30 T200,8" fill="none" stroke="#2563eb" strokeWidth="2.5" />
                      </svg>
                    </Box>
                  </VStack>
                )}

                {/* Color Picker Widget in Preview Mode */}
                {w.type === "colorpicker" && (
                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between">
                      <Text fontWeight="bold" fontSize="xs">{w.title}</Text>
                      <Box w="14px" h="14px" borderRadius="full" bg={w.selectedColor || "#2563eb"} />
                    </HStack>
                    <HStack spacing={2} justify="center">
                      {["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"].map((c) => (
                        <Box
                          key={c}
                          w="24px"
                          h="24px"
                          borderRadius="full"
                          bg={c}
                          cursor="pointer"
                          border={w.selectedColor === c ? "2px solid black" : "none"}
                          onClick={() => handleUpdateWidget("selectedColor", c, w.id)}
                        />
                      ))}
                    </HStack>
                  </VStack>
                )}

                {/* Joystick Widget in Preview Mode */}
                {w.type === "joystick" && (
                  <VStack align="center" spacing={2}>
                    <Text fontWeight="bold" fontSize="xs">{w.title}</Text>
                    <Box w="74px" h="74px" borderRadius="full" bg="gray.100" border="2px dashed" borderColor="gray.300" display="flex" alignItems="center" justifyContent="center">
                      <Box w="32px" h="32px" borderRadius="full" bg="blue.500" shadow="md" />
                    </Box>
                  </VStack>
                )}

                {/* Image Widget in Preview Mode */}
                {w.type === "image" && (
                  <VStack align="stretch" spacing={1.5}>
                    <HStack justify="space-between">
                      <Text fontWeight="bold" fontSize="xs">{w.title}</Text>
                      <Badge colorScheme="blue" fontSize="9px">Image Feed</Badge>
                    </HStack>
                    <Box
                      h="85px"
                      w="100%"
                      bg="gray.100"
                      borderRadius="xl"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      border="1px dashed"
                      borderColor="gray.300"
                      color="gray.400"
                    >
                      <VStack spacing={1}>
                        <FaImage size={24} />
                        <Text fontSize="10px">Live Camera Stream</Text>
                      </VStack>
                    </Box>
                  </VStack>
                )}

                {/* Card Widget in Preview Mode */}
                {w.type === "card" && (
                  <VStack align="stretch" spacing={1.5}>
                    <HStack justify="space-between">
                      <Text fontWeight="bold" fontSize="xs">{w.title}</Text>
                      <Badge colorScheme="purple" fontSize="9px">Container</Badge>
                    </HStack>
                    <Box p={3} bg="gray.50" borderRadius="lg" border="1px dashed" borderColor="gray.300">
                      <Text fontSize="11px" color="gray.600">Container Card Content</Text>
                    </Box>
                  </VStack>
                )}

                {/* Progress Bar Widget in Preview Mode */}
                {w.type === "progress" && (
                  <VStack align="stretch" spacing={1.5}>
                    <HStack justify="space-between">
                      <Text fontWeight="bold" fontSize="xs">{w.title}</Text>
                      <Text fontSize="xs" color="blue.600" fontWeight="bold">75%</Text>
                    </HStack>
                    <Progress value={75} size="xs" colorScheme="blue" borderRadius="full" />
                  </VStack>
                )}

                {/* Floating Action Button Widget in Preview Mode */}
                {w.type === "fab" && (
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" fontSize="xs">{w.title}</Text>
                      <Text fontSize="10px" color="gray.400">Quick Trigger</Text>
                    </VStack>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      borderRadius="full"
                      w="38px"
                      h="38px"
                      p={0}
                      onClick={() => handleTestHardwareSignal(w)}
                    >
                      <FaPlus size={13} />
                    </Button>
                  </HStack>
                )}

                {/* Divider Widget in Preview Mode */}
                {w.type === "divider" && (
                  <Box py={2}>
                    <Box h="1px" bg="gray.200" w="100%" />
                  </Box>
                )}

                {/* Fallback for other components in Preview Mode */}
                {!["location", "switch", "slider", "gauge", "button", "top_button", "bottom_button", "left_button", "right_button", "dpad", "crud_table", "label", "textfield", "chart", "colorpicker", "joystick", "image", "card", "progress", "fab", "divider"].includes(w.type) && (
                  <HStack justify="space-between">
                    <Text fontWeight="bold" fontSize="sm">{w.title}</Text>
                    <Badge fontSize="9px">{w.type}</Badge>
                  </HStack>
                )}
              </Box>
            ))}
          </VStack>
        </Box>
      </Box>

      {/* Collapsible Serial Traffic Log Console */}
      {isSerialTrafficOpen && (
        <Box w="100%" maxW="600px" p={3} bg="#090d16" color="#38bdf8" borderRadius="xl" fontFamily="monospace" fontSize="11px" shadow="lg">
          <HStack justify="space-between" mb={2} color="gray.400">
            <HStack spacing={1.5}>
              <FaTerminal size={10} />
              <Text fontWeight="bold">Live Hardware Serial Traffic ({activePort})</Text>
            </HStack>
            <Button size="xs" variant="ghost" color="gray.400" onClick={() => setSerialTrafficLogs([])}>Clear</Button>
          </HStack>
          <VStack align="stretch" spacing={1} maxH="120px" overflowY="auto">
            {serialTrafficLogs.map((log) => (
              <Text key={log.id} color={log.type === "tx" ? "#4ade80" : log.type === "rx" ? "#38bdf8" : "#fbbf24"}>
                [{log.time}] {log.text}
              </Text>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
}
