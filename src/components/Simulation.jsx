

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Rnd } from "react-rnd";
import { Maximize, ZoomIn, ZoomOut, ArrowLeft, ArrowRight, Plus, Save } from "lucide-react";
import { FiTrash } from "react-icons/fi";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Monitor, Loader2 } from "lucide-react";

// --- Gold Standard Transition Components ---
const DiagramLoader = () => (
  <div className="diagram-loader-overlay">
    <div className="diagram-spinner" />
    <span className="diagram-loader-text">Switching Project...</span>
  </div>
);

const DiagramEmptyState = () => (
  <div
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 10,
      pointerEvents: "none",
      textAlign: "center",
      width: "100%",
      animation: "blink-canvas 2s ease-in-out infinite",
    }}
  >
    <style>{`
      @keyframes blink-canvas {
        0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        50% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.98); }
      }
    `}</style>
    <div
      style={{
        fontWeight: "bold",
        fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
        color: "rgba(7, 52, 148, 0.15)",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        userSelect: "none",
      }}
    >
      PLEASE DRAG THE COMPONENTS
    </div>
  </div>
);

// Import all your existing SVG icons
import SoundAndVibrationsSensor from "../images/sound and vibrarions sensor.svg";
import ServoMotors from "../images/servo motors.png";
import RGBLights from "../images/rgb lights.svg";
import PowerSupply from "../images/powersupply.svg";
import OpticalSensor from "../images/optical sensor.svg";
import OledDisplays from "../images/oled displays.svg";
import MotionSensor from "../images/motion sensor.svg";
import Microcontroller from "../images/microcontroller 1.svg";
import EnvironmentalSensor from "../images/environmental sensor.svg";
// import ElectricalAndMagneticsSensor from "../images/ElectricalAndMagneticsSensor.svg";
import DistanceAndRangeSensor from "../images/distance and range sensor.svg";
import Connectors from "../images/connectors.svg";
import ChemicalSensor from "../images/chemaical sensor.svg";
import Buzzer from "../images/buzzer.svg";
import Amplifier from "../images/amplifier.svg";
import ActuatorsRelay from "../images/actuators relay.svg";
import Wire from "../images/wire.svg";
import VibrationsMotors from "../images/vibrations motors.svg";
import TouchAndForceSensor from "../images/touch and force sensor.svg";
import TemperatureSensor from "../images/temperature sensor.svg";
import SimulationPopup from "./SimulationPopup"; // Import the popup component
import BlackWire from "../images/blackwire.svg";
import GreenWire from "../images/greenwire.svg";
import RedWire from "../images/redwire.svg";
import Connectorone from "../images/connectorzoneone.svg";
import Connectortwo from "../images/connectorzonetwo.svg";
import Connectorthree from "../images/connectorzonethree.svg";
import Connectorfour from "../images/connectorzonefour.svg";
import Connectorfive from "../images/connectorzonefive.svg";
import SimulationOne from "./SimulationOne";
import { useAutoSaveTabs } from "../hooks/useAutoSaveTabs";
import { useSimulationAutoSave, useGlobalAutoSave } from "../hooks/useAutoSave";
import { autoSaveManager } from "../utils/autoSaveManager";
import Phsensor from "../images/phsensor.svg";
import Moisturesensor from "../images/moisturesensor.svg";
import Lightsensor from "../images/lightsensor.svg";
import Irsensor from "../images/irsensor.svg";
import Heartbeatsensor from "../images/heartbeatsensor.svg";
import Gassensor from "../images/gassensor.svg";
import Airqualitysensor from "../images/airqualitysensor.svg";
import Airqualitysensorone from "../images/airqualitysensorone.svg";
import Accelerometer from "../images/accelerometer.svg";
import Accelerometerone from "../images/accelerometerone.svg";
import Bluelight from "../images/bluelight.svg";
import Redlight from "../images/redlight.svg";
import Greenlight from "../images/greenlight.svg";
import hooterOff from "../images/hooterOff.svg";
import hooterOn from "../images/hooterOn.svg";
import ledBlueOn from "../images/ledBlueOn.svg";
import powerButtonOff from "../images/powerButtonOff.svg";
import powerButtonOn from "../images/powerButtonOn.svg";
import RGBLED from "../images/RGBLED.svg";
import toggleOff from "../images/toggleOff.svg";
import toggleOn from "../images/toggleOn.svg";
import pushButtonOff from "../images/pushButtonOff.svg";
import pushButtonOn from "../images/pushButtonOn.svg";

import EditorNavbar from "./EditorNavbar";
import { useProject } from "../ProjectContext";
import { checkProductDefinition } from "./EmbeddedFileManagement/EmbeddedFileManagement";
import { fetchFileSystem } from "./EmbeddedFileManagement/EmbeddedFileManagement";
import { buildTree } from "./EmbeddedFileManagement/EmbeddedFileManagement";
import CreateProductButton from "./shared/CreateProductButton";
import ProjectSelectionModal from "./ProjectSelectionModal/ProjectSelectionModal";
import ProjectChangePopup from "./ProjectSelectionPopup/ProjectSelectionPopup";
// ... (rest of your imports)

import Navbar from "./Navbar";
import FileExplorer from "./FileExplorer";
import "./Flowchart.css";
import Output from "./Output";
import {
  Box,
  Text,
  Button,
  Center,
  Heading,
  InputGroup,
  InputLeftElement,
  Input,
  VStack,
  Stack,
  chakra,
  Tooltip,
  useToast,
  SimpleGrid,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  IconButton,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
} from "@chakra-ui/react";
import { ToggleSwitch } from "./Toggle/Toggle";
import { baseURL } from "../utilities";
import CodeDrawer from "./codeDrawer/CodeDrawer";

// Your existing symbols array
const symbolsData = [
  {
    category: "SENSORS ▼",
    items: [
      {
        type: "svg",
        src: SoundAndVibrationsSensor,
        name: "Sound and Vibrations Sensor",
      },
      { type: "svg", src: OpticalSensor, name: "Optical Sensor" },
      { type: "svg", src: EnvironmentalSensor, name: "Environmental Sensor" },
      //  {
      //  type: "svg",
      //  src: ElectricalAndMagneticsSensor,
      //  name: "Electrical and Magnetics Sensor",
      //  },
      {
        type: "svg",
        src: DistanceAndRangeSensor,
        name: "Distance and Range Sensor",
      },
      { type: "svg", src: ChemicalSensor, name: "Chemical Sensor" },
      { type: "svg", src: MotionSensor, name: "Motion Sensor" },
      { type: "svg", src: TouchAndForceSensor, name: "Touch and Force Sensor" },
      { type: "svg", src: TemperatureSensor, name: "Temperature Sensor" },
      { type: "svg", src: Phsensor, name: "pH Sensor" },
      { type: "svg", src: Moisturesensor, name: "Moisture Sensor" },
      { type: "svg", src: Lightsensor, name: "Light Sensor" },
      { type: "svg", src: Irsensor, name: "IR Sensor" },
      { type: "svg", src: Heartbeatsensor, name: "Heartbeat Sensor" },
      { type: "svg", src: Gassensor, name: "Gas Sensor" },
      { type: "svg", src: Airqualitysensor, name: "Air Quality Sensor" },
      { type: "svg", src: Airqualitysensorone, name: "Air Quality Sensor" },
      { type: "svg", src: Accelerometer, name: "Accelerometer" },
      { type: "svg", src: Accelerometerone, name: "Accelerometer" },
    ],
  },
  {
    category: "ACTUATORS ▼",
    items: [
      { type: "png", src: ServoMotors, name: "Servo Motors" },
      { type: "svg", src: VibrationsMotors, name: "Vibrations Motors" },
      { type: "svg", src: ActuatorsRelay, name: " Relay" },
      { type: "svg", src: powerButtonOff, name: "Power Button" },
      { type: "svg", src: pushButtonOff, name: " Push Button" },
      { type: "svg", src: toggleOff, name: " Toggle Button" },
    ],
  },
  {
    category: "DISPLAY AND INDICATORS ▼",
    items: [
      { type: "svg", src: OledDisplays, name: "OLED Displays" },
      // { type: "svg", src: RGBLights, name: "RGB Lights" },
      { type: "svg", src: Buzzer, name: "Buzzer" },
      { type: "svg", src: Redlight, name: "Redlight" },
      { type: "svg", src: Greenlight, name: "Green Light " },
      { type: "svg", src: Bluelight, name: "Blue Light " },
      { type: "svg", src: RGBLED, name: "RGB LED" },
      // { type: "svg", src: ledBlueOn, name: "Blue LED ON" },
      { type: "svg", src: hooterOff, name: "Hooter" },
    ],
  },
  {
    category: "POWER ▼",
    items: [{ type: "svg", src: PowerSupply, name: "Power Supply" }],
  },
  
  {
    category: "AMPLIFIERS ▼",
    items: [{ type: "svg", src: Amplifier, name: "Amplifier" }],
  },
  {
    category: "MICROCONTROLLERS ▼",
    items: [{ type: "svg", src: Microcontroller, name: "Microcontroller" }],
  },
];

import { useDispatch, useSelector } from "react-redux";
import {
  setTabs,
  addTab,
  closeTab,
  setActiveTab,
  addSymbolToTab,
  updateSymbolInTab,
  removeSymbolFromTab,
  addConnectionToTab,
  setTabSymbolsAndConnections,
  updateTabContent,
  renameTab
} from "../store/slices/simulationSlice";
import { useResizableSidebar } from '../hooks/useResizableSidebar';

const SimulationNode = React.memo(({
  item,
  index,
  dragPos,
  isActive,
  rotation,
  hasConn,
  onSelect,
  onDrag,
  onDragStop,
  onResizeStop,
  onRotateStart,
  onContextMenu
}) => {
  return (
    <Rnd
      position={{
        x: dragPos?.x ?? item.x,
        y: dragPos?.y ?? item.y
      }}
      size={{ width: item.width, height: item.height }}
      enableResizing={isActive}
      disableDragging={false}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(index);
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onSelect(index);
      }}
      onDrag={onDrag}
      onResizeStop={onResizeStop}
      onDragStop={onDragStop}
      style={{
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center",
        position: "absolute",
        cursor: "move",
      }}
      onContextMenu={(e) => onContextMenu(e, index)}
    >
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {isActive && (
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <polygon
              points="50,10 90,30 90,70 50,90 10,70 10,30"
              fill="none"
              stroke="blue"
              strokeWidth="2"
              strokeDasharray="5,5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}
        <Tooltip
          label={item.symbol.name}
          placement="top"
          hasArrow
          bg="gray.700"
          color="white"
          fontSize="sm"
          px={3}
          py={2}
          borderRadius="md"
        >
          <img
            src={item.symbol.src}
            alt={item.symbol.name}
            style={{
              width: "100%",
              height: "100%",
              pointerEvents: "all",
              transform: `rotate(${item.rotation}deg)`,
            }}
          />
        </Tooltip>

        {item.symbol.name === "Microcontroller" && !hasConn && (
          <>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)', background: '#3b82f6', color: 'white', fontSize: '10px', padding: '2px 4px', borderRadius: '4px', zIndex: 10 }}>Z1</div>
            <div style={{ position: 'absolute', top: '25%', right: 0, transform: 'translate(50%, -50%)', background: '#3b82f6', color: 'white', fontSize: '10px', padding: '2px 4px', borderRadius: '4px', zIndex: 10 }}>Z2</div>
            <div style={{ position: 'absolute', top: '75%', right: 0, transform: 'translate(50%, -50%)', background: '#3b82f6', color: 'white', fontSize: '10px', padding: '2px 4px', borderRadius: '4px', zIndex: 10 }}>Z3</div>
            <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translate(-50%, 50%)', background: '#3b82f6', color: 'white', fontSize: '10px', padding: '2px 4px', borderRadius: '4px', zIndex: 10 }}>Z4</div>
            <div style={{ position: 'absolute', top: '75%', left: 0, transform: 'translate(-50%, -50%)', background: '#3b82f6', color: 'white', fontSize: '10px', padding: '2px 4px', borderRadius: '4px', zIndex: 10 }}>Z5</div>
            <div style={{ position: 'absolute', top: '25%', left: 0, transform: 'translate(-50%, -50%)', background: '#3b82f6', color: 'white', fontSize: '10px', padding: '2px 4px', borderRadius: '4px', zIndex: 10 }}>Z6</div>
          </>
        )}

        {isActive && (
          <div
            className="rotate-handle"
            style={{
              position: "absolute",
              top: "-25px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "30px",
              height: "30px",
              background: "rgba(0, 0, 255, 0.7)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "url('https://upload.wikimedia.org/wikipedia/commons/0/02/Rotate_cursor.svg'), auto",
              transition: "transform 0.2s ease-in-out",
            }}
            onMouseDown={(e) => {
              e.target.style.cursor = "grabbing";
              onRotateStart(index, e);
            }}
            onMouseUp={(e) => {
              e.target.style.cursor = "url('https://upload.wikimedia.org/wikipedia/commons/0/02/Rotate_cursor.svg'), auto";
            }}
          >
            🔄
          </div>
        )}
      </div>
    </Rnd>
  );
});

const BlockDiagram = () => {
  const dispatch = useDispatch();
  const tabs = useSelector((state) => state.simulation.tabs);
  const activeTabId = useSelector((state) => state.simulation.activeTab);

  const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId) || tabs[0], [tabs, activeTabId]);
  const droppedItems = activeTab?.symbols || [];
  const connections = activeTab?.connections || [];

  // Internal simulation tab switching
  const handleSimulationTabClick = useCallback((id) => {
    console.log("🔵 handleSimulationTabClick called with id:", id);
    console.log("Current activeTabId:", activeTabId);
    console.log("All tabs:", tabs);
    dispatch(setActiveTab(id));
    console.log("✅ Dispatched setActiveTab");
  }, [dispatch, activeTabId, tabs]);

  const addNewSimulationTab = () => {
    console.log("🟢 Add Tab clicked");
    const newTabId = Date.now();
    const newTab = {
      id: newTabId,
      name: `Simulation ${tabs.length + 1}`,
      symbols: [],
      connections: [],
      content: "// Simulation code\n",
      dirty: false
    };
    console.log("🟢 Dispatching addTab:", newTab);
    dispatch(addTab(newTab));
    dispatch(setActiveTab(newTabId));
    console.log("✅ Add tab complete");
  };

  const closeSimulationTab = (id, e) => {
    console.log("🔴 closeSimulationTab called with id:", id);
    e?.stopPropagation();
    dispatch(closeTab(id));
    console.log("✅ Close tab complete");
  };

  // Enhanced auto-save for simulation canvas state
  const {
    isSaving: isAutoSaving,
    lastSaveTime: lastAutoSaveTime,
    saveNow: saveSimulationNow,
    scheduleSave: scheduleSimulationSave,
    isLoaded: isAutoSaveLoaded,
  } = useSimulationAutoSave(droppedItems, connections, {
    screenKey: "/simulation",
    autoSaveDelay: 2000,
    priority: 3,
    onSave: (data) => {
      console.log("[Simulation] Auto-saved canvas state locally:", data);
      // Use centralized save logic for Simulation
      saveDiagramData({
        symbols: data.droppedItems,
        connections: data.connections
      }, 'simulation');
    },
    onLoad: (loadedData) => {
      console.log("[Simulation] Loading saved canvas state:", loadedData);
      // Restore canvas state from auto-save
      if (loadedData) {
        dispatch(setTabSymbolsAndConnections({
          tabId: activeTabId,
          symbols: loadedData.droppedItems || [],
          connections: loadedData.connections || []
        }));
      }
    },
    onError: (error) => {
      console.error("[Simulation] Auto-save error:", error);
    },
  });

  const { saveAll: saveAllScreens } = useGlobalAutoSave();

  // Save canvas state when droppedItems or connections change
  useEffect(() => {
    if (droppedItems.length > 0 || connections.length > 0) {
      scheduleSimulationSave();
    }
  }, [droppedItems, connections, scheduleSimulationSave]);

  // Save before navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveSimulationNow();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        saveSimulationNow();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Save when unmounting (navigating away)
      saveSimulationNow();
    };
  }, [saveSimulationNow]);

  // Register simulation canvas save strategy with auto-save manager
  useEffect(() => {
    const saveFunction = () => ({
      droppedItems,
      connections: Array.isArray(connections) ? connections : [],
      timestamp: Date.now(),
      activeTab,
      tabs,
    });

    autoSaveManager.registerSaveStrategy("simulation:canvas", saveFunction, {
      priority: 3,
      skipEmpty: false,
    });

    return () => {
      autoSaveManager.unregisterSaveStrategy("simulation:canvas");
    };
  }, [droppedItems, connections, activeTab, tabs]);

  const [activeSymbol, setActiveSymbol] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const contextMenuRef = useRef(null);
  const [openCategories, setOpenCategories] = useState({}); // Moved here
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarMode, setSidebarMode] = useState("components");
  const navigate = useNavigate();
  const toast = useToast();
  // const [connections, setConnections] = useState(new Set()); // REMOVED - using Redux
  const [sparkEffects, setSparkEffects] = useState([]); // Track active spark animations
  const [rotatingItem, setRotatingItem] = useState(null); // Optimize rotation performance
  const { isOpen: isSidebarOpen, onToggle: onToggleSidebar, onClose: onCloseSidebar } = useDisclosure({ defaultIsOpen: true });
  const { sidebarWidth, startResizing } = useResizableSidebar(240, 160, 480);

  const [selectedProject, setSelectedProject] = useState(null);
  const [isProductDefined, setIsProductDefined] = useState(null);
  const [fileSystem, setFileSystem] = useState({});
  const [diagramId, setDiagramId] = useState(null);

  // Tab Renaming State
  const [editingTabId, setEditingTabId] = useState(null);
  const [tempName, setTempName] = useState("");

  const startRenaming = (e, tab) => {
    console.log("🟡 Double click detected for tab:", tab.id, tab.name);
    console.log("Event:", e);
    e.stopPropagation();
    setEditingTabId(tab.id);
    setTempName(tab.name);
    console.log("✅ Editing state set");
  };

  const handleRenameChange = (e) => {
    console.log("🟡 Rename input changed:", e.target.value);
    setTempName(e.target.value);
  };

  const handleRenameSubmit = (e) => {
    console.log("🟡 Key pressed:", e.key);
    if (e.key === 'Enter') {
      console.log("🟡 Enter key detected, finishing rename");
      finishRenaming();
    }
  };

  const finishRenaming = () => {
    console.log("🟡 Finishing renaming. ID:", editingTabId, "New Name:", tempName);
    if (editingTabId && tempName.trim()) {
      console.log("🟡 Dispatching renameTab action");
      dispatch(renameTab({ tabId: editingTabId, newName: tempName.trim() }));
      console.log("✅ Rename dispatched");
    } else {
      console.log("⚠️ No rename - ID or name missing");
    }
    setEditingTabId(null);
    setTempName("");
  };

  // Main Navigation (EditorNavbar) handler
  const handleTabChange = useCallback(
    async (tab) => {
      // Save current simulation state before navigating
      try {
        await saveSimulationNow();
        await saveAllScreens();
        console.log("[Simulation] Saved state before tab change to:", tab);
      } catch (error) {
        console.error("[Simulation] Failed to save before tab change:", error);
      }

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
    [navigate, saveSimulationNow, saveAllScreens],
  );

  const {
    activeProjectName,
    activeProjectId,
    activeProductId,
    activeProductName,
    user,
    diagramData,
    saveDiagramData,
    isSwitchingProject,
    isHydrated,
    isRestoring,
    hasFetchedOnce,
    transitionError
  } = useProject();

  // start
  // Add this effect to store productID in sessionStorage

  // --- Sync Redux Tabs with Central Project Data ---
  useEffect(() => {
    const data = diagramData?.simulation?.data;
    if (data) {
      console.log("[Simulation] Syncing Redux state with central data");
      // Simulation usually has a specific structure or single tab behavior in this file
      // If it's single-diagram, we update the active tab
      const symbols = data.symbols || data.simulationDiagram || [];
      const connections = data.connections || [];

      dispatch(setTabSymbolsAndConnections({
        tabId: activeTabId,
        symbols: symbols,
        connections: connections
      }));
    }
  }, [diagramData?.simulation?.data, dispatch, activeTabId]);

  useEffect(() => {
    try {
      fetchFileSystem(user.userId, setFileSystem, buildTree);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    checkProductDefinition(activeProductId, setIsProductDefined);
  }, [activeProductId]);

  // useEffect(() => {
  //   const savedData = localStorage.getItem("savedDesign");
  //   if (savedData) {
  //     setDroppedItems(JSON.parse(savedData));
  //   }
  // }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Delete" && activeSymbol !== null) {
        const itemToDelete = droppedItems[activeSymbol];
        if (itemToDelete) {
          dispatch(removeSymbolFromTab({ tabId: activeTabId, symbolId: itemToDelete.id }));
        }
        setActiveSymbol(null); // Reset active symbol after deletion
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeSymbol]); // Fix: Added activeSymbol as dependency

  // const newTabId = tabs.length + 1;
  // const newTab = { id: newTabId, name: `Simulation ${newTabId}`, symbols: [] };
  // setTabs([...tabs, newTab]);
  // setActiveTab(newTabId);

  const useClickOutside = (ref, handler) => {
    useEffect(() => {
      const listener = (event) => {
        if (!ref.current || ref.current.contains(event.target)) {
          return;
        }
        handler(event);
      };
      document.addEventListener("mousedown", listener);
      return () => {
        document.removeEventListener("mousedown", listener);
      };
    }, [ref, handler]);
  };

  useClickOutside(contextMenuRef, () => setContextMenu(null));

  const toggleCategory = (category) => {
    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const filteredSymbols = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return symbolsData;

    return symbolsData
      .map((section) => {
        const filteredItems = section.items.filter((item) =>
          item.name.toLowerCase().includes(query),
        );
        return filteredItems.length
          ? { ...section, items: filteredItems }
          : null;
      })
      .filter(Boolean);
  }, [searchQuery, symbolsData]);

  useEffect(() => {
    setOpenCategories((prev) => {
      const next = { ...prev };
      filteredSymbols.forEach((section) => {
        if (searchQuery) {
          next[section.category] = true;
        } else if (next[section.category] === undefined) {
          next[section.category] = true;
        }
      });
      return next;
    });
  }, [filteredSymbols, searchQuery]);

  const handleContextMenu = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, symbolIndex: index });
  };

  const handleDelete = () => {
    if (contextMenu) {
      const symbolToDelete = droppedItems[contextMenu.symbolIndex];
      if (symbolToDelete) {
        dispatch(removeSymbolFromTab({ tabId: activeTabId, symbolId: symbolToDelete.id }));
      }
      setContextMenu(null);
      setActiveSymbol(null);
      alert("Symbol deleted successfully!");
    }
  }; // Added missing closing brace for handleDelete

  // --- Hexagonal tiling neighbour offsets (flat-top orientation) ---
  // For a flat-top hexagon with bounding box W x H:
  //   Right neighbour:       (+W*0.75,  0)
  //   Left neighbour:        (-W*0.75,  0)
  //   Upper-right neighbour: (+W*0.375, -H*0.5)
  //   Lower-right neighbour: (+W*0.375, +H*0.5)
  //   Upper-left neighbour:  (-W*0.375, -H*0.5)
  //   Lower-left neighbour:  (-W*0.375, +H*0.5)
  const getHexNeighbourOffsets = (w, h) => [
    { dx:  w * 0.75,   dy:  0          }, // Right
    { dx: -w * 0.75,   dy:  0          }, // Left
    { dx:  w * 0.375,  dy: -h * 0.5   }, // Upper-right
    { dx:  w * 0.375,  dy:  h * 0.5   }, // Lower-right
    { dx: -w * 0.375,  dy: -h * 0.5   }, // Upper-left
    { dx: -w * 0.375,  dy:  h * 0.5   }, // Lower-left
  ];

  // Calculate the best snap position using hexagonal tiling math
  const calculateSnapPosition = (movedItem, allItems) => {
    let bestX = movedItem.x;
    let bestY = movedItem.y;
    let snapped = false;
    const SNAP_MARGIN = 60; // Generous threshold so user doesn't need pixel-perfect placement

    const movedCX = movedItem.x + movedItem.width / 2;
    const movedCY = movedItem.y + movedItem.height / 2;

    let bestDist = SNAP_MARGIN;

    allItems.forEach((item) => {
      if (item.id === movedItem.id) return;

      const w = (movedItem.width + item.width) / 2; // average width for offsets
      const h = (movedItem.height + item.height) / 2;
      const itemCX = item.x + item.width / 2;
      const itemCY = item.y + item.height / 2;

      // Check all 6 hex neighbour slots of the stationary item
      const offsets = getHexNeighbourOffsets(w, h);
      offsets.forEach(({ dx, dy }) => {
        const slotCX = itemCX + dx;
        const slotCY = itemCY + dy;
        const dist = Math.sqrt(
          Math.pow(movedCX - slotCX, 2) + Math.pow(movedCY - slotCY, 2)
        );
        if (dist < bestDist) {
          bestDist = dist;
          bestX = slotCX - movedItem.width / 2;
          bestY = slotCY - movedItem.height / 2;
          snapped = true;
        }
      });
    });

    return { x: bestX, y: bestY, snapped };
  };
  // Check proximity using center-to-center distance (works well with hex tiles)
  const checkProximity = (item1, item2, threshold = 200) => {
    const cx1 = item1.x + item1.width / 2;
    const cy1 = item1.y + item1.height / 2;
    const cx2 = item2.x + item2.width / 2;
    const cy2 = item2.y + item2.height / 2;
    const distance = Math.sqrt(Math.pow(cx2 - cx1, 2) + Math.pow(cy2 - cy1, 2));
    // A connected hex pair has center distance ≈ 0.75*W; allow up to 1.5*W
    const connectThreshold = Math.max(threshold, (item1.width + item2.width) * 0.75);
    return distance <= connectThreshold;
  };

  // Handle connection detection and notification
  // Handle connection detection and notification
  const handleConnectionDetection = (movedItem) => {
    console.log("🔍 Checking connections for component:", movedItem.id);
    console.log("Current position:", { x: movedItem.x, y: movedItem.y });
    console.log("Total components:", droppedItems.length);

    droppedItems.forEach((item) => {
      if (item.id === movedItem.id) return; // Skip self

      const distance = Math.sqrt(
        Math.pow(
          item.x + item.width / 2 - (movedItem.x + movedItem.width / 2),
          2,
        ) +
        Math.pow(
          item.y + item.height / 2 - (movedItem.y + movedItem.height / 2),
          2,
        ),
      );

      console.log(`Distance to component ${item.id}:`, distance);

      if (checkProximity(movedItem, item)) {
        // Create a consistent key based on sorted IDs
        const connectionKey = [movedItem.id, item.id].sort().join("-");
        console.log("✅ Connection detected within proximity!", connectionKey);

        // Check if connection exists in Redux state (passed via props/selector)
        // connections is array of strings (connectionKeys)
        const exists = connections.includes(connectionKey);

        // If the target or dragged item is a Microcontroller, snap it automatically
        if (item.symbol.name === "Microcontroller" || movedItem.symbol.name === "Microcontroller") {
          const mcItem = item.symbol.name === "Microcontroller" ? item : movedItem;
          const otherItem = item.symbol.name === "Microcontroller" ? movedItem : item;

          // Determine which zone (Z1-Z6) is closest to otherItem's center
          const ox = otherItem.x + otherItem.width / 2;
          const oy = otherItem.y + otherItem.height / 2;

          const zones = [
            { id: "Z1", x: mcItem.x + mcItem.width / 2, y: mcItem.y },
            { id: "Z2", x: mcItem.x + mcItem.width, y: mcItem.y + mcItem.height * 0.25 },
            { id: "Z3", x: mcItem.x + mcItem.width, y: mcItem.y + mcItem.height * 0.75 },
            { id: "Z4", x: mcItem.x + mcItem.width / 2, y: mcItem.y + mcItem.height },
            { id: "Z5", x: mcItem.x, y: mcItem.y + mcItem.height * 0.75 },
            { id: "Z6", x: mcItem.x, y: mcItem.y + mcItem.height * 0.25 },
          ];

          let closestZone = zones[0];
          let minDistance = Infinity;
          zones.forEach(z => {
            const dist = Math.sqrt(Math.pow(z.x - ox, 2) + Math.pow(z.y - oy, 2));
            if (dist < minDistance) {
              minDistance = dist;
              closestZone = z;
            }
          });

          // Snap the other component using hexagon tiling math to close the gap
          let finalX = mcItem.x;
          let finalY = mcItem.y;
          const w = mcItem.width;
          const h = mcItem.height;

          if (closestZone.id === "Z1") {
            finalY -= h;
          } else if (closestZone.id === "Z2") {
            finalX += w * 0.75;
            finalY -= h * 0.5;
          } else if (closestZone.id === "Z3") {
            finalX += w * 0.75;
            finalY += h * 0.5;
          } else if (closestZone.id === "Z4") {
            finalY += h;
          } else if (closestZone.id === "Z5") {
            finalX -= w * 0.75;
            finalY += h * 0.5;
          } else if (closestZone.id === "Z6") {
            finalX -= w * 0.75;
            finalY -= h * 0.5;
          }

          finalX += (w - otherItem.width) / 2;
          finalY += (h - otherItem.height) / 2;

          dispatch(updateSymbolInTab({
            tabId: activeTabId,
            symbolId: otherItem.id,
            updates: { x: finalX, y: finalY }
          }));

          if (!exists) {
            dispatch(addConnectionToTab({ tabId: activeTabId, connection: connectionKey }));
            
            // Optional spark effect
            const sparkId = Date.now();
            setSparkEffects((prev) => [
              ...prev,
              { id: sparkId, x: closestZone.x, y: closestZone.y },
            ]);
            setTimeout(() => {
              setSparkEffects((prev) => prev.filter((spark) => spark.id !== sparkId));
            }, 500);
          }
          return; // Stop processing further connections for this component
        }

        // --- Hexagonal side-by-side snap for ALL non-Microcontroller components ---
        // Find the closest hex neighbour slot of the stationary item and snap movedItem there
        const w = (movedItem.width + item.width) / 2;
        const h = (movedItem.height + item.height) / 2;
        const itemCX = item.x + item.width / 2;
        const itemCY = item.y + item.height / 2;
        const movedCX = movedItem.x + movedItem.width / 2;
        const movedCY = movedItem.y + movedItem.height / 2;

        const offsets = getHexNeighbourOffsets(w, h);
        let closestSlot = null;
        let minDist = Infinity;
        offsets.forEach(({ dx, dy }) => {
          const slotCX = itemCX + dx;
          const slotCY = itemCY + dy;
          const dist = Math.sqrt(
            Math.pow(movedCX - slotCX, 2) + Math.pow(movedCY - slotCY, 2)
          );
          if (dist < minDist) {
            minDist = dist;
            closestSlot = { cx: slotCX, cy: slotCY };
          }
        });

        if (closestSlot) {
          const snapX = closestSlot.cx - movedItem.width / 2;
          const snapY = closestSlot.cy - movedItem.height / 2;
          dispatch(updateSymbolInTab({
            tabId: activeTabId,
            symbolId: movedItem.id,
            updates: { x: snapX, y: snapY }
          }));
        }

        if (!exists) {
          console.log("🎉 New connection! Dispatching addConnection...");
          dispatch(addConnectionToTab({ tabId: activeTabId, connection: connectionKey }));

          // Calculate connection point (midpoint between components)
          const connectionX =
            (movedItem.x + movedItem.width / 2 + item.x + item.width / 2) / 2;
          const connectionY =
            (movedItem.y + movedItem.height / 2 + item.y + item.height / 2) / 2;

          // Create spark effect
          const sparkId = Date.now();
          setSparkEffects((prev) => [
            ...prev,
            { id: sparkId, x: connectionX, y: connectionY },
          ]);

          // Remove spark after animation (500ms)
          setTimeout(() => {
            setSparkEffects((prev) => prev.filter((s) => s.id !== sparkId));
          }, 500);

          try {
            // Play connection sound
            const audio = new Audio(
              "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2S57OihUQwOVqzn77BdGAg+ltv1xnMoBSh+zPLaizsKGGGy6OyrYBgINZXX9Mp5LQUohM/y3I4+CxVitOvtrGEaBkCY3PLJdysGKoLO8tuJNggTYbjs6qZTEAhMouDwumkkBSR4yPDck0MLHGW66+yjWBUIQ5zh8sNuIQUofcry2Ig0BhFYrOjuqF4YBzaU2PTJeiwGKIHN8t2LPAoVXrTq7qxgGQg4lNn0zHosBSaAy/DblUAOF2S36+yjVxUIRJ3h8sFuIAQnfsny2Yk3BxNWq+fuqF4WAzWS1vPKeS0GJ4DN8tz",
            );
            audio.volume = 0.5;
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              playPromise.catch(e => {
                console.warn("Audio play failed (autoplay policy?):", e);
              });
            }
          } catch (e) {
            console.error("Audio setup failed:", e);
          }

          // Show toast notification
          console.log("Showing toast for connection");
          toast({
            title: "⚡ Components Connected!",
            description: `${movedItem.symbol.name} ↔ ${item.symbol.name}`,
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "top",
          });
        } else {
          console.log("Connection already exists in state:", connectionKey);
        }
      }
    });
  };

  const handleSaveDesign = () => {
    localStorage.setItem("savedDesign", JSON.stringify(droppedItems));
    alert("Design saved successfully!");
  };

  const handleLoadDesign = () => {
    const savedData = localStorage.getItem("savedDesign");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      dispatch(
        setTabSymbolsAndConnections({
          tabId: activeTabId,
          symbols: parsedData.map((item) => ({
            ...item,
            x: item.x || 100,
            y: item.y || 100,
            width: item.width || 120,
            height: item.height || 120,
            rotation: item.rotation || 0,
          })),
          connections: [] // Assume no connections in manual load for now or update if stored
        }),
      );
      alert("Design loaded successfully!");
    } else {
      alert("No saved design found.");
    }
  };

  const SymbolItem = ({ symbol }) => {
    const [, drag] = useDrag(() => ({
      type: "symbol",
      item: { symbol },
    }));
    return (
      <Tooltip
        label={symbol.name}
        placement="right"
        hasArrow
        bg="#1e293b"
        color="#ffffff"
        fontSize="xs"
      >
        <chakra.button
          ref={drag}
          display="flex"
          alignItems="center"
          justifyContent="center"
          w="40px" // Fixed width for grid
          h="40px" // Fixed height for grid
          borderRadius="md"
          bg="#ffffff"
          border="1px solid #e2e8f0"
          _hover={{ bg: "#f1f5f9", transform: "scale(1.05)" }}
          transition="all 0.15s ease"
          cursor="grab"
        >
          <img
            src={symbol.src}
            alt={symbol.name}
            style={{ width: "28px", height: "28px" }} // Slightly smaller icon
          />
        </chakra.button>
      </Tooltip>
    );
  };

  const Canvas = () => {
    const [dragPositions, setDragPositions] = useState({});
    const canvasRef = useRef(null);

    const [, drop] = useDrop(
      () => ({
        accept: "symbol",
        drop: (item, monitor) => {
          const offset = monitor.getClientOffset();
          if (item && item.symbol && offset && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            // Calculate precise drop coordinate based on cursor offset and canvas bounding box
            const componentWidth = 100;
            const componentHeight = 100;
            const x = offset.x - rect.left - (componentWidth / 2);
            const y = offset.y - rect.top - (componentHeight / 2);
            
            // Add scroll offsets if the canvas is scrollable
            const scrollLeft = canvasRef.current.scrollLeft || 0;
            const scrollTop = canvasRef.current.scrollTop || 0;
            const newSymbol = {
              symbol: item.symbol,
              x: x + scrollLeft,
              y: y + scrollTop,
              width: componentWidth,
              height: componentHeight,
              rotation: 0,
              id: Date.now() + Math.random(),
            };
            dispatch(addSymbolToTab({ tabId: activeTabId, symbol: newSymbol }));
            setActiveSymbol(droppedItems.length);
          }
        },
      }),
      [droppedItems, activeTabId],
    );

    // Merge refs for the drop target
    const dropRef = useCallback((node) => {
      canvasRef.current = node;
      drop(node);
    }, [drop]);

    const handleRotateStart = (index, event) => {
      event.preventDefault();
      event.stopPropagation();

      const symbol = droppedItems[index];
      const centerX = symbol.x + symbol.width / 2;
      const centerY = symbol.y + symbol.height / 2;
      const startX = event.clientX;
      const startY = event.clientY;
      const startRotation = symbol.rotation || 0;

      let startAngle =
        Math.atan2(startY - centerY, startX - centerX) * (180 / Math.PI);

      const handleMouseMove = (e) => {
        const currentX = e.clientX;
        const currentY = e.clientY;
        const newAngle =
          Math.atan2(currentY - centerY, currentX - centerX) * (180 / Math.PI);

        const angleChange = newAngle - startAngle;
        const newRotation = startRotation + angleChange;

        setRotatingItem({ index, rotation: newRotation });
      };

      const handleMouseUp = (e) => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);

        // Dispatch final rotation
        // We need to calculate the final rotation again or use the last state?
        // Better to recalculate or just use the last known if we had a ref.
        // But since we are in a closure, we can just recalculate one last time or use the setRotatingItem value?
        // Actually, let's just recalculate to be safe and clean.

        const currentX = e.clientX;
        const currentY = e.clientY;
        const newAngle =
          Math.atan2(currentY - centerY, currentX - centerX) * (180 / Math.PI);
        const angleChange = newAngle - startAngle;

        dispatch(
          updateSymbolInTab({
            tabId: activeTabId,
            symbolId: symbol.id,
            updates: { rotation: startRotation + angleChange },
          }),
        );
        setRotatingItem(null);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    };

    const handleResizeStop = (index, _dir, ref, delta, position) => {
      const item = droppedItems[index];
      if (item) {
        dispatch(
          updateSymbolInTab({
            tabId: activeTabId,
            symbolId: item.id,
            updates: {
              width: ref.offsetWidth,
              height: ref.offsetHeight,
              x: position.x,
              y: position.y,
            },
          }),
        );
      }
    };

    const handleSelect = (index) => {
      setActiveSymbol(index);
    };

    const hasConnection = (itemId) => {
      return connections.some(conn => conn.includes(String(itemId)));
    };

    const getOccupiedZones = (mcItemId) => {
      const mcConns = connections.filter(conn => conn.includes(String(mcItemId)));
      const mcItem = droppedItems.find(i => String(i.id) === String(mcItemId));
      if (!mcItem || mcConns.length === 0) return [];

      const occupied = [];
      mcConns.forEach(conn => {
        const otherId = conn.split('-').find(id => id !== String(mcItemId));
        const otherItem = droppedItems.find(i => String(i.id) === otherId);
        if (!otherItem) return;

        const ox = otherItem.x + otherItem.width / 2;
        const oy = otherItem.y + otherItem.height / 2;

        const zones = [
          { id: "Z1", x: mcItem.x + mcItem.width / 2, y: mcItem.y },
          { id: "Z2", x: mcItem.x + mcItem.width, y: mcItem.y + mcItem.height * 0.25 },
          { id: "Z3", x: mcItem.x + mcItem.width, y: mcItem.y + mcItem.height * 0.75 },
          { id: "Z4", x: mcItem.x + mcItem.width / 2, y: mcItem.y + mcItem.height },
          { id: "Z5", x: mcItem.x, y: mcItem.y + mcItem.height * 0.75 },
          { id: "Z6", x: mcItem.x, y: mcItem.y + mcItem.height * 0.25 },
        ];

        let closestZone = zones[0];
        let minDistance = Infinity;
        zones.forEach(z => {
          const dist = Math.sqrt(Math.pow(z.x - ox, 2) + Math.pow(z.y - oy, 2));
          if (dist < minDistance) {
            minDistance = dist;
            closestZone = z;
          }
        });
        occupied.push(closestZone.id);
      });
      return occupied;
    };

    return (
      <>
        <style>
          {`
          @keyframes spark-scale {
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
          }
          @keyframes sparkPulse {
            0% { transform: scale(0); opacity: 1; }
            50% { opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
          }
          @keyframes sparkExpand {
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(2); opacity: 0; }
          }
          @keyframes sparkRotate {
            0% { transform: translate(-50%, -50%) rotate(0deg) scale(0); opacity: 0; }
            50% { opacity: 1; transform: translate(-50%, -50%) rotate(180deg) scale(1.2); }
            100% { transform: translate(-50%, -50%) rotate(360deg) scale(0); opacity: 0; }
          }
        `}
        </style>
        <div
          ref={dropRef}
          className="canvas-placeholder"
          style={{
            width: "100%",
            flex: 1,
            minHeight: 0,
            position: "relative",
            backgroundColor: "white",
            opacity: (isSwitchingProject || !isHydrated) ? 0.3 : 1,
            pointerEvents: (isSwitchingProject || !isHydrated) ? 'none' : 'all',
            transition: 'opacity 0.2s ease'
          }}
          onClick={() => setActiveSymbol(null)} // Deselects when clicking outside
        >
          {isSwitchingProject && <DiagramLoader />}

          {hasFetchedOnce && !isSwitchingProject && droppedItems.length === 0 && (
            <DiagramEmptyState />
          )}
          {/* Connection Lines Layer */}
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none", // Allow clicks to pass through to canvas/items
              zIndex: 0,
            }}
          >
            {connections.map((connKey) => {
              const [id1, id2] = connKey.split("-");
              // IDs are stored as strings in connection key, but might be numbers in items
              // Convert to string for comparison or just use loose equality if safe, but explicit is better.
              const item1 = droppedItems.find((i) => String(i.id) === id1);
              const item2 = droppedItems.find((i) => String(i.id) === id2);

              if (item1 && item2) {
                // Use intermediate drag coordinates if active, otherwise use Redux state coords
                const pos1 = dragPositions[id1] ? dragPositions[id1] : { x: item1.x, y: item1.y };
                const pos2 = dragPositions[id2] ? dragPositions[id2] : { x: item2.x, y: item2.y };
                
                return (
                  <line
                    key={connKey}
                    x1={pos1.x + item1.width / 2}
                    y1={pos1.y + item1.height / 2}
                    x2={pos2.x + item2.width / 2}
                    y2={pos2.y + item2.height / 2}
                    stroke="black"
                    strokeWidth="2"
                    strokeDasharray="5,5" // Optional: dashed line
                    style={{ pointerEvents: "none" }} // Ensure SVG lines do not block drag events
                  />
                );
              }
              return null;
            })}
          </svg>

          {/* Spark Effects Layer */}
          {sparkEffects.map((spark) => (
            <div
              key={spark.id}
              style={{
                position: "absolute",
                left: spark.x,
                top: spark.y,
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
                zIndex: 1000,
              }}
            >
              <div
                className="spark-animation"
                style={{
                  width: "40px",
                  height: "40px",
                  background:
                    "radial-gradient(circle, rgba(255,255,0,1) 0%, rgba(255,165,0,0) 70%)",
                  borderRadius: "50%",
                  animation: "spark-scale 0.5s ease-out forwards",
                }}
              />
            </div>
          ))}

          {droppedItems.map((item, index) => {
            const dragPos = dragPositions[item.id];
            const isActive = activeSymbol === index;
            const rotation = rotatingItem?.index === index ? rotatingItem.rotation : item.rotation;
            const hasConn = hasConnection(item.id);

            return (
              <SimulationNode
                key={item.id}
                item={item}
                index={index}
                dragPos={dragPos}
                isActive={isActive}
                rotation={rotation}
                hasConn={hasConn}
                onSelect={handleSelect}
                onDrag={(e, d) => {
                  setDragPositions(prev => ({
                    ...prev,
                    [item.id]: { x: d.x, y: d.y }
                  }));
                }}
                onResizeStop={(e, dir, ref, delta, position) =>
                  handleResizeStop(index, dir, ref, delta, position)
                }
                onDragStop={(e, d) => {
                  const currentItem = droppedItems[index];
                  if (currentItem) {
                    const rawItem = { ...currentItem, x: d.x, y: d.y };
                    const { x: snapX, y: snapY, snapped } = calculateSnapPosition(rawItem, droppedItems);
                    const finalX = snapped ? snapX : d.x;
                    const finalY = snapped ? snapY : d.y;
                    const updatedItem = { ...currentItem, x: finalX, y: finalY };

                    setDragPositions(prev => {
                      const newState = { ...prev };
                      delete newState[currentItem.id];
                      return newState;
                    });

                    dispatch(
                      updateSymbolInTab({
                        tabId: activeTabId,
                        symbolId: currentItem.id,
                        updates: { x: finalX, y: finalY },
                      }),
                    );

                    handleConnectionDetection(updatedItem);
                  }
                }}
                onRotateStart={handleRotateStart}
                onContextMenu={handleContextMenu}
              />
            );
          })}

          {/* Spark effects */}
          {sparkEffects.map((spark) => (
            <div
              key={spark.id}
              style={{
                position: "absolute",
                left: spark.x,
                top: spark.y,
                width: "60px",
                height: "60px",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
                zIndex: 9999,
              }}
            >
              {/* Spark animation */}
              <div
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, #FFD700 0%, #FFA500 30%, transparent 70%)",
                  animation: "sparkPulse 0.5s ease-out",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,215,0,0.5) 40%, transparent 70%)",
                  animation: "sparkExpand 0.5s ease-out",
                }}
              />
              {/* Lightning bolt emoji */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "32px",
                  animation: "sparkRotate 0.5s ease-out",
                }}
              >
                ⚡
              </div>
            </div>
          ))}

          {contextMenu && (
            <div
              ref={contextMenuRef}
              className="context-menu"
              style={{
                position: "fixed",
                top: contextMenu.y,
                left: contextMenu.x,
              }}
            >
              <button onClick={handleDelete} className="delete-button">
                <FiTrash size={16} /> Delete
              </button>
            </div>
          )}
        </div>
      </>
    );
  };

  const SidebarContent = (
  <>
<Box
              display="flex"
              flexDirection="column"
              px={2}
              py={3}
              h="100%"
              bg="#f8fafc"
              borderRight="1px solid #e2e8f0"
              gap={3}
            >
              <Stack direction="row" spacing={2}>
                <chakra.button
                  onClick={() => setSidebarMode("explorer")}
                  flex="1"
                  py={1}
                  borderRadius="md"
                  fontWeight="600"
                  fontSize="sm"
                  letterSpacing="0.05em"
                  textTransform="uppercase"
                  color={sidebarMode === "explorer" ? "#1e293b" : "#64748b"}
                  bg={
                    sidebarMode === "explorer"
                      ? "#e2e8f0"
                      : "transparent"
                  }
                  border={sidebarMode === "explorer" ? "1px solid #e2e8f0" : "1px solid transparent"}
                  transition="all 0.2s ease"
                  _hover={{
                    bg:
                      sidebarMode === "explorer"
                        ? "#ffffff"
                        : "rgba(0,0,0,0.05)",
                  }}
                  boxShadow={sidebarMode === "explorer" ? "sm" : "none"}
                >
                  Explorer
                </chakra.button>
                <chakra.button
                  onClick={() => setSidebarMode("components")}
                  flex="1"
                  py={2}
                  borderRadius="md"
                  fontWeight="600"
                  fontSize="sm"
                  letterSpacing="0.05em"
                  textTransform="uppercase"
                  color={sidebarMode === "components" ? "#1e293b" : "#64748b"}
                  bg={
                    sidebarMode === "components"
                      ? "#e2e8f0"
                      : "transparent"
                  }
                  border={sidebarMode === "components" ? "1px solid #e2e8f0" : "1px solid transparent"}
                  transition="all 0.2s ease"
                  _hover={{
                    bg:
                      sidebarMode === "components"
                        ? "#ffffff"
                        : "rgba(0,0,0,0.05)",
                  }}
                  boxShadow={sidebarMode === "components" ? "sm" : "none"}
                >
                  Components
                </chakra.button>
              </Stack>

              {sidebarMode === "explorer" ? (
                <Box
                  flex="1"
                  overflowY="auto"
                  borderRadius="lg"
                  border="1px solid #e2e8f0"
                  bg="#ffffff"
                  px={3}
                  py={4}
                >
                  <FileExplorer variant="diagram" />
                </Box>
              ) : (
                <Box flex="1" display="flex" flexDirection="column" gap={4}>
                  <InputGroup size="sm">
                    <InputLeftElement pointerEvents="none">
                      <FaSearch color="#94a3b8" />
                    </InputLeftElement>
                    <Input
                      type="text"
                      placeholder="Search sensors, actuators..."
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      borderRadius="full"
                      border="1px solid #e2e8f0"
                      bg="#ffffff"
                      color="#1e293b"
                      _placeholder={{ color: "#94a3b8" }}
                      _focus={{
                        borderColor: "#3b82f6",
                        boxShadow: "0 0 0 1px #3b82f6",
                      }}
                    />
                  </InputGroup>

                  <VStack
                    align="stretch"
                    spacing={5}
                    overflowY="auto"
                    className="symbol-grid"
                  >
                    {filteredSymbols.length === 0 ? (
                      <Center py={12}>
                        <Text color="#64748b">
                          No components found.
                        </Text>
                      </Center>
                    ) : (
                      filteredSymbols.map((section, sectionIndex) => (
                        <Box key={sectionIndex} className="symbol-section" style={{ backgroundColor: "transparent", border: "none", boxShadow: "none" }}>
                          <chakra.button
                            onClick={() => toggleCategory(section.category)}
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            width="100%"
                            px={3}
                            py={2}
                            borderRadius="md"
                            bg="#ffffff"
                            border="1px solid #e2e8f0"
                            color="#1e293b"
                            fontSize="xs"
                            fontWeight="700"
                            letterSpacing="0.08em"
                            textTransform="uppercase"
                            transition="all 0.2s ease"
                            _hover={{ bg: "#f8fafc" }}
                          >
                            {section.category.replace(" ▼", "")}
                            <Text fontSize="sm" color="#64748b">
                              {openCategories[section.category] ? "▲" : "▼"}
                            </Text>
                          </chakra.button>

                          {openCategories[section.category] && (
                            <SimpleGrid
                              columns={4}
                              mt={3}
                              spacing={2}
                              px={1}
                              className="symbol-items"
                            >
                              {section.items.map((symbol, symbolIndex) => (
                                <SymbolItem key={symbolIndex} symbol={symbol} />
                              ))}
                            </SimpleGrid>
                          )}
                        </Box>
                      ))
                    )}
                  </VStack>
                </Box>
              )}
            </Box>
  </>
);

  return (
    <div className="flowchart-container" style={{ backgroundColor: "#ffffff" }}>
        <EditorNavbar activeTab="Simulation" onTabChange={handleTabChange} />
        <div
          className="top-controls"

        // style={{ paddingTop: "1px", alignItems: "center" }}
        >
          <Box display="flex" justifyContent="flex-end" width={"100%"} gap={4}>
            {/* {selectedProject?.name && (
              <ProjectChangePopup
                selectedProject={selectedProject}
                onProjectChange={setSelectedProject}
                fileSystem={fileSystem}
              />
            )} */}
          </Box>

          {/* <Box display={"flex"} gap={4}> */}
          {/* <Button
              size="sm"
              width="auto"
              colorScheme="teal"
              onClick={handleSaveDesign}
            >
              Save Design
            </Button> */}
          {/* <Button
              size="sm"
              width="auto"
              colorScheme="teal"
              onClick={handleLoadDesign}
            >
              Load Design
            </Button> */}
          {/* </Box> */}

          <Box display="flex" alignItems="center" gap={3} justifyContent="flex-end" width="100%">
            <SimulationOne />

            {/* <SimulationPopup>
              <Button
                size="sm"
                colorScheme="teal"
                borderRadius="full"
                height="32px"
                px={6}
                className="control-button"
              >
                Code
              </Button>
            </SimulationPopup> */}

            <Button
              width="auto"
              colorScheme="teal"
              size="sm"
              borderRadius="full"
              height="32px"
              px={6}
              onClick={() => navigate("/view-data")}
            >
              View Data
            </Button>
            <CreateProductButton />
          </Box>
        </div>

        <div className="main-content" style={{ backgroundColor: "#ffffff" }}>
          
          {/* Mobile Sidebar */}
          <Drawer isOpen={isSidebarOpen} placement="left" onClose={onCloseSidebar} size="xs">
            <DrawerOverlay display={{ base: "block", lg: "none" }} />
            <DrawerContent display={{ base: "block", lg: "none" }} bg="#f8fafc">
              <DrawerCloseButton />
              <DrawerHeader borderBottomWidth="1px" fontSize="sm">Components</DrawerHeader>
              <DrawerBody p={0}>
                {SidebarContent}
              </DrawerBody>
            </DrawerContent>
          </Drawer>

          {/* Desktop Sidebar */}
          <Box 
            display={{ base: "none", lg: "block" }} 
            width={`${sidebarWidth}px`}
            minW={`${sidebarWidth}px`}
            maxW={`${sidebarWidth}px`}
            flex={`0 0 ${sidebarWidth}px`}
            h="100%" 
            bg="#f8fafc"
          >
            {SidebarContent}
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
<div className="main-area" style={{ backgroundColor: "#ffffff" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#ffffff",
                padding: "8px 12px",
                borderRadius: "0",
                marginBottom: "0px",
                borderBottom: "1px solid #e5e7eb",
                position: "relative",
                zIndex: 1000,
                pointerEvents: "auto"
              }}
            >
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', flex: 1, position: 'relative', zIndex: 1001, pointerEvents: 'auto' }}>
                <IconButton
                  display={{ base: "flex", lg: "none" }}
                  icon={<span>📁</span>}
                  size="xs"
                  onClick={onToggleSidebar}
                  aria-label="Toggle components"
                  variant="ghost"
                  color="#64748b"
                  mr={2}
                />
                
                <div className="diagram-tabs__actions" style={{ display: 'flex', gap: '4px', marginRight: '8px', paddingRight: '8px', borderRight: '1px solid #d1d5db', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="diagram-tabs__action"
                    onClick={(e) => {
                      e.stopPropagation();
                      addNewSimulationTab();
                    }}
                    title="Add tab"
                    style={{ zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', color: '#374151' }}
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    type="button"
                    className="diagram-tabs__action"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (saveSimulationNow) await saveSimulationNow();
                    }}
                    title="Save"
                    style={{ zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', color: '#374151' }}
                  >
                    <Save size={16} />
                  </button>
                </div>

                {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    onClick={(e) => {
                      console.log("🎯 TAB CLICKED! Event:", e);
                      e.stopPropagation();
                      handleSimulationTabClick(tab.id);
                    }}
                    onDoubleClick={(e) => {
                      console.log("🎯 TAB DOUBLE-CLICKED! Event:", e);
                      startRenaming(e, tab);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: activeTabId === tab.id ? '#3b82f6' : '#f1f5f9',
                      color: activeTabId === tab.id ? '#ffffff' : '#64748b',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      border: activeTabId === tab.id ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                      whiteSpace: 'nowrap',
                      minWidth: '120px',
                      userSelect: 'none',
                      position: 'relative',
                      zIndex: 1002,
                      pointerEvents: 'auto'
                    }}
                  >
                    {editingTabId === tab.id ? (
                      <input
                        type="text"
                        value={tempName}
                        onChange={handleRenameChange}
                        onBlur={finishRenaming}
                        onKeyDown={handleRenameSubmit}
                        autoFocus
                        style={{
                          background: '#ffffff',
                          color: '#000000',
                          border: '1px solid #3182ce',
                          borderRadius: '4px',
                          outline: 'none',
                          width: '100px',
                          padding: '2px 4px',
                          fontSize: '12px'
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onDoubleClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span style={{ marginRight: '8px', flex: 1, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {tab.name}
                        {tab.dirty && (
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: activeTabId === tab.id ? '#fca5a5' : '#ef4444', display: 'inline-block', flexShrink: 0 }} />
                        )}
                      </span>
                    )}

                    {!editingTabId && (
                      <Box
                        as="span"
                        onClick={(e) => closeSimulationTab(tab.id, e)}
                        _hover={{ color: '#ef4444', bg: activeTabId === tab.id ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)', borderRadius: '50%' }}
                        style={{ marginLeft: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                      >
                        ×
                      </Box>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Heading removed per user request */}
            {/*
            {!selectedProject?.name && (
              <ProjectSelectionModal
                onProjectSelect={setSelectedProject}
                fileSystem={fileSystem}
              />
            )} */}

            <Canvas />
          </div>
        </div>
      </div>
  );
};

export default BlockDiagram;
