import React, { useState, useRef, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Rnd } from "react-rnd";
import {
  Maximize,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
  ArrowRight,
  Files,
} from "lucide-react";
import { FiTrash } from "react-icons/fi";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import {
  InputGroup,
  InputLeftElement,
  Input,
  Alert,
  chakra,
  Box,
  Heading,
  Center,
  IconButton,
  Tooltip,
  Button,
} from "@chakra-ui/react";
import { FaSearch } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";

import BlockDiagramOne from "./BlockDiagramOne";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./Flowchart.css";
import "./FileExplorer.css";
import Navbarone from "./Navbarone";
import ProjectChangePopup from "./ProjectSelectionPopup/ProjectSelectionPopup";
import ProjectSelectionModal from "./ProjectSelectionModal/ProjectSelectionModal";
import Vector from "../images/Vector.svg";
import Vector11 from "../images/Vector 11.svg";
import Vector10 from "../images/Vector 10.svg";
import Vector9 from "../images/Vector 9.svg";
import Vector8 from "../images/Vector 8.svg";
import Vector7 from "../images/Vector 7.svg";
import Vector6 from "../images/Vector 6.svg";
import Vector5 from "../images/Vector 5.svg";
import Vector4 from "../images/Vector 4.svg";
import Ellipse4 from "../images/Ellipse 4.svg";
import Ellipse5 from "../images/Ellipse 5.svg";
import Group36763 from "../images/Group 36763.svg";
import line76 from "../images/line_76.svg";
import line77 from "../images/line_77.svg";
import Polygon1 from "../images/Polygon 1.svg";
import Polygon2 from "../images/Polygon 2.svg";
import Rectangle1809 from "../images/Rectangle 1809.svg";
import Rectangle1810 from "../images/Rectangle 1810.svg";
import Rectangle1811 from "../images/Rectangle 1811.svg";
import Rectangle1812 from "../images/Rectangle 1812.svg";
import Vector2 from "../images/Vector 2.svg";
import Vector3 from "../images/Vector 3.svg";
import newlinea from "../images/newlinea.svg";
import newlineb from "../images/newlineb.svg";
import newlinec from "../images/newlinec.svg";
import newlined from "../images/newlined.svg";
import diamon from "../images/diamon.svg";
import arrowdown from "../images/arrowdown.svg";
import arrowup from "../images/arrowup.svg";
import verticalline from "../images/verticalline.svg";
import { color } from "framer-motion";
import { useProject } from "../ProjectContext";
import { checkProductDefinition } from "./EmbeddedFileManagement/EmbeddedFileManagement";
import CreateProductDefintionModal from "./Product/ProductDefinitionModal/CreateProductDefintionModal";
import { fetchFileSystem } from "./EmbeddedFileManagement/EmbeddedFileManagement";
import ProductEditModal from "./Product/ProductEdit/ProductEditModal";
import { buildTree } from "./EmbeddedFileManagement/EmbeddedFileManagement";
import DefineProductButton from "./shared/DefineProductButton";
import axios from "axios";
import { IoIosRefresh } from "react-icons/io";
import { baseURL } from "../utilities";
import FileExplorer from "./FileExplorer";

const symbols = [
  {
    category: "BLOCK DIAGRAM ▼",
    items: [
      { type: "svg", src: Ellipse4, name: "Circle" },
      { type: "svg", src: Ellipse5, name: "Dotted Circle" },
      { type: "svg", src: Group36763, name: "Oval" },
      { type: "svg", src: line76, name: "Slant Line" },
      { type: "svg", src: line77, name: "Dotted Slant Line" },
      { type: "svg", src: newlinea, name: "Straight Line" },
      { type: "svg", src: Polygon1, name: "Triangle" },
      { type: "svg", src: Polygon2, name: "Dotted Triangle" },
      { type: "svg", src: Rectangle1809, name: "Rectangle" },
      { type: "svg", src: Rectangle1810, name: "Square" },
      { type: "svg", src: Rectangle1811, name: "Dotted Square" },
      { type: "svg", src: Rectangle1812, name: "Dotted Square" },
      { type: "svg", src: Vector, name: "Text Box" },
      { type: "svg", src: Vector11, name: "Hexagon" },
      { type: "svg", src: Vector10, name: "Curve" },
      { type: "svg", src: Vector9, name: "Required Interface" },
      { type: "svg", src: Vector8, name: "0 to many Optimal" },
      { type: "svg", src: Vector7, name: "Off page Connector" },
      { type: "svg", src: Vector6, name: "Chevron Arrow" },
      { type: "svg", src: Vector5, name: "Dotted Decision" },
      { type: "svg", src: Vector4, name: "Dotted Arrow" },
      { type: "svg", src: Vector3, name: "Arrow" },
      { type: "svg", src: newlineb, name: "Left Arrow" },
      { type: "svg", src: newlinec, name: "Right Arrow" },
      { type: "svg", src: newlined, name: "Upward Arrow" },
      { type: "svg", src: Vector2, name: "Decision Box" },
      { type: "svg", src: diamon, name: "Decision Box" },
      // { type: "svg", src: arrowdown , name: "Arrow Down" },
      // { type: "svg", src: arrowup , name: "Arrow up" },
      // { type: "svg", src: verticalline , name: "Vertical Line" , color:"white" },
    ],
  },

  {
    category: "ARROW & LINE  ▼",
    items: [
      { type: "svg", src: newlinea, name: "Straight line" },
      { type: "svg", src: newlineb, name: "Left Arrow" },
      { type: "svg", src: newlinec, name: "Right Arrow" },
      { type: "svg", src: newlined, name: "Upward Arrow" },
      { type: "svg", src: arrowdown, name: "Arrow Down" },
      { type: "svg", src: arrowup, name: "Arrow up" },
      { type: "svg", src: verticalline, name: "Vertical Line" },
    ],
  },
];

const BlockDiagram = () => {
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [diagramId, setDiagramId] = useState(null); // ✅ Store document ID for updates
  const [selectedProject, setSelectedProject] = useState(null);
  const [isProductDefined, setIsProductDefined] = useState(null);
  const [fileSystem, setFileSystem] = useState({});
  const {
    activeProjectName,
    activeProjectId,
    activeProductId,
    activeProductName,

    user,
  } = useProject();

  const [isFetched, setIsFetched] = useState(false); // New flag to track fetch success

  const fetchDiagrams = async () => {
    try {
      if (!activeProductId || !activeProjectId) return;

      const url = `${baseURL}/api/v1/getStoredBlockDiagramData/${activeProductId}/${activeProjectId}`;
      console.log("Fetching from:", url);

      let response = await axios.get(url);
      console.log("Raw Response:", response.data);

      if (
        response.data?.data[0]?.blockDiagram &&
        Array.isArray(response?.data?.data[0]?.blockDiagram)
      ) {
        const doc = response.data.data[0];
        setDiagramId(doc._id); // ✅ Store ID for future updates
        
        const fetchedDiagrams = doc.blockDiagram.map(
          (diagram) => ({
            ...diagram,
            symbols:
              diagram.symbols?.map((symbol) => ({
                ...symbol,
                symbol: {
                  ...symbol.symbol,
                  src: decodeURIComponent(symbol.symbol.src),
                },
              })) || [],
          })
        );

        console.log("Decoded block diagrams:", fetchedDiagrams);

        if (fetchedDiagrams.length > 0) {
          setTabs(fetchedDiagrams);
          setActiveTab(fetchedDiagrams[0]?.id || null);
        } else {
          console.warn("No block diagrams found, initializing default.");
          const defaultDiagram = [{ id: 1, name: "Diagram 1", symbols: [] }];
          setTabs(defaultDiagram);
          setActiveTab(1);
          saveData(defaultDiagram);
        }
      } else {
        console.warn("No block diagrams found, initializing default.");
        console.warn("Checking local storage first.");
        const storageKey = `block_diagram_tabs_${activeProductId}_${activeProjectId}`;
        let localData = localStorage.getItem(storageKey);
        
        // Fallback to recover yesterday's block diagram which was saved under a global key
        if (!localData) {
          localData = localStorage.getItem("block_diagram_tabs");
        }
        
        let defaultDiagram = [{ id: 1, name: "Diagram 1", symbols: [] }];
        if (localData) {
          try {
            const parsed = JSON.parse(localData);
            if (Array.isArray(parsed) && parsed.length > 0) {
              defaultDiagram = parsed;
              console.log("Recovered from local storage:", defaultDiagram);
            }
          } catch (e) {
            console.error("Failed to parse local storage diagrams", e);
          }
        }
        setTabs(defaultDiagram);
        setActiveTab(defaultDiagram[0].id);
        // setIsFetched(true); // ✅ Allow saving
        saveData(defaultDiagram); // ✅ Auto-save default diagram
      }
    } catch (err) {
      if (
        err.response &&
        err.response.data?.message ===
        "No diagrams found for the given productId and projectId"
      ) {
        // ✅ No diagrams exist, so create the default and store it
        console.warn("No diagrams exist yet. Checking local storage first.");
        const storageKey = `block_diagram_tabs_${activeProductId}_${activeProjectId}`;
        let localData = localStorage.getItem(storageKey);
        
        // Fallback to recover yesterday's block diagram which was saved under a global key
        if (!localData) {
          localData = localStorage.getItem("block_diagram_tabs");
        }
        
        let defaultDiagram = [{ id: 1, name: "Diagram 1", symbols: [] }];
        if (localData) {
          try {
            const parsed = JSON.parse(localData);
            if (Array.isArray(parsed) && parsed.length > 0) {
              defaultDiagram = parsed;
              console.log("Recovered from local storage:", defaultDiagram);
            }
          } catch (e) {
            console.error("Failed to parse local storage diagrams", e);
          }
        }
        setTabs(defaultDiagram);
        setActiveTab(defaultDiagram[0].id);
        // setIsFetched(true); // ✅ Allow saving
        saveData(defaultDiagram); // ✅ Store the recovered or default diagram
      } else {
        console.error("Error fetching diagrams:", err);
        console.warn("Fetch failed, setting default locally.");
        setTabs([{ id: 1, name: "Diagram 1", symbols: [] }]);
        setActiveTab(1);
        // setIsFetched(false); // ❌ Fetch actually failed
      }
    }
  };

  // Fetch block diagrams from API on mount or when activeProjectId/activeProductId changes
  useEffect(() => {
    if (!activeProductId || !activeProjectId) return;
    fetchDiagrams();
  }, [activeProductId, activeProjectId]);

  const saveData = async (data = tabs) => {
    try {
      if (!activeProductId || !activeProjectId || !data.length) return;

      const payload = {
        fileORFolderId: activeProjectId,
        productId: activeProductId,
        userId: user.userId,
        blockDiagram: data,
      };

      console.log("Saving or updating block diagram:", payload);

      let existingDiagramId = diagramId;

      if (!existingDiagramId) {
        try {
          // Step 1: Check if a diagram exists if we don't have the ID yet
          const fetchUrl = `${baseURL}/api/v1/getStoredBlockDiagramData/${activeProductId}/${activeProjectId}`;
          const response = await axios.get(fetchUrl);
          existingDiagramId = response?.data?.data[0]?._id;
          if (existingDiagramId) setDiagramId(existingDiagramId);
          console.log("Existing diagram ID found:", existingDiagramId);
        } catch (error) {
          if (
            error.response &&
            error.response.status === 404 &&
            error.response.data?.message ===
            "No diagrams found for the given productId and projectId"
          ) {
            console.warn("No diagrams exist. Proceeding with new save.");
            existingDiagramId = null;
          } else {
            console.error("Error checking existing diagrams:", error);
            return;
          }
        }
      }

      if (existingDiagramId) {
        // Step 2: Update existing diagram
        await axios.put(
          `${baseURL}/api/v1/updateStoredBlockDiagramData/${existingDiagramId}`,
          payload
        );
        console.log("Block diagram updated successfully!");
      } else {
        // Step 3: Save a new diagram
        const response = await axios.post(`${baseURL}/api/v1/storeBlockDiagramData`, payload);
        if (response.data?.data?._id) {
          setDiagramId(response.data.data._id);
        }
        console.log("Block diagram saved successfully!");
      }
    } catch (error) {
      console.error("Error saving/updating block diagram data:", error);
    }
  };

  // Save data every 30 seconds and when activeTab changes
  const lastSavedTabs = useRef(null);

  useEffect(() => {
    if (!tabs?.length) return;

    // ✅ Only save if tabs have actually changed
    if (JSON.stringify(lastSavedTabs.current) !== JSON.stringify(tabs)) {
      saveData();
      lastSavedTabs.current = tabs; // Store last saved state
    }

    const interval = setInterval(() => saveData(), 5000);
    return () => clearInterval(interval);
  }, [activeTab, tabs]);

  useEffect(() => {
    try {
      fetchFileSystem(user.userId, setFileSystem, buildTree);
    } catch (error) {
      console.log(error);
    }
  }, []);

  console.log(
    "active product id and project id",
    activeProductId,
    activeProjectId
  );

  const fetchProductDefinition = async (
    activeProductId,
    setIsProductDefined
  ) => {
    if (!activeProductId) {
      setIsProductDefined(null); // Reset state if no product is selected
      return;
    }

    console.log("Fetching definition for activeProductId:", activeProductId);

    try {
      await checkProductDefinition(activeProductId, setIsProductDefined);
    } catch (error) {
      console.error("Error fetching product definition:", error);
      setIsProductDefined(false); // Assume false if an error occurs
    }
  };

  useEffect(() => {
    fetchProductDefinition(activeProductId, setIsProductDefined);
  }, [activeProductId]); // Only depend on activeProductId

  useEffect(() => {
    // Save to localStorage whenever tabs change
    if (tabs && tabs.length > 0 && activeProductId && activeProjectId) {
      const storageKey = `block_diagram_tabs_${activeProductId}_${activeProjectId}`;
      localStorage.setItem(storageKey, JSON.stringify(tabs));
    }
  }, [tabs, activeProductId, activeProjectId]);

  const [openCategories, setOpenCategories] = useState({}); // Moved here
  const [isExplorerVisible, setIsExplorerVisible] = useState('blocks');
  const MAX_TABS = 5;
  const navigate = useNavigate();

  const addNewTab = () => {
    if (tabs?.length >= MAX_TABS) {
      alert("Maximum of 5 tabs allowed.");
      return;
    }
    const newTabId = tabs.length + 1;
    const newTab = { id: newTabId, name: `Diagram ${newTabId}`, symbols: [] };
    setTabs([...tabs, newTab]);
    setActiveTab(newTabId);
  };

  const handleTabClick = (tabId) => setActiveTab(tabId);

  const closeTab = (tabId, event) => {
    event.stopPropagation();
    const newTabs = tabs.filter((tab) => tab.id !== tabId);
    if (newTabs?.length > 0) {
      if (activeTab === tabId) {
        setActiveTab(newTabs[newTabs.length - 1].id);
      }
    } else {
      const newTab = { id: 1, name: "Diagram 1", symbols: [] };
      setTabs([newTab]);
      setActiveTab(1);
    }
    setTabs(newTabs);
  };

  const toggleCategory = (category) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const SymbolItem = ({ symbol }) => {
    const [, drag] = useDrag(() => ({
      type: "symbol",
      item: { symbol },
    }));

    return (
      // <button ref={drag} className="symbol-button" style={{ cursor: "grab" }}>
      //   {symbol.type === "unicode" ? (
      //     symbol.symbol
      //   ) : (
      //     <img src={symbol.src} alt="SVG Symbol" className="svg-icon" />
      //   )}
      //   {/* added for naming things  */}
      //    <div style={{ marginTop: "4px", fontSize: "20px", color: "white" }}>
      //     {symbol.name}
      //   </div>
      // </button>
      <button
        ref={drag}
        className="symbol-button"
        style={{
          cursor: "grab",
          height: "120px", // Set a specific height
          width: "100px", // Optional: set a specific width
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {symbol.type === "unicode" ? (
          symbol.symbol
        ) : (
          <img src={symbol.src} alt="SVG Symbol" className="svg-icon" />
        )}
        <div
          style={{
            marginTop: "4px",
            fontSize: "18px",
            color: "white",
          }}
        >
          {symbol.name}
        </div>
      </button>
    );
  };

  // start
  // Add this custom hook to handle click outside
  const useClickOutside = (ref, handler) => {
    useEffect(() => {
      const listener = (event) => {
        if (!ref.current || ref.current.contains(event.target)) {
          return;
        }
        handler(event);
      };
      document.addEventListener("mousedown", listener);
      document.addEventListener("touchstart", listener);
      return () => {
        document.removeEventListener("mousedown", listener);
        document.removeEventListener("touchstart", listener);
      };
    }, [ref, handler]);
  };

  // end

  const Canvas = () => {
    const [contextMenu, setContextMenu] = useState(null);
    const [activeSymbol, setActiveSymbol] = useState(null);
    const contextMenuRef = useRef(null);

    useClickOutside(contextMenuRef, () => setContextMenu(null));

    const [, drop] = useDrop(() => ({
      accept: "symbol",
      drop: (item, monitor) => {
        const offset = monitor.getClientOffset();
        if (item && item.symbol && offset) {
          const newSymbol = {
            symbol: item.symbol,
            x: offset.x - 100,
            y: offset.y - 100,
            width: 120,
            height: 120,
          };
          setTabs((prevTabs) =>
            prevTabs.map((tab) =>
              tab.id === activeTab
                ? { ...tab, symbols: [...tab.symbols, newSymbol] }
                : tab
            )
          );
        }
      },
    }));

    const activeTabSymbols =
      tabs?.find((tab) => tab.id === activeTab)?.symbols || [];

    const handleContextMenu = (e, index) => {
      e.preventDefault();
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        symbolIndex: index,
      });
    };

    const handleDelete = () => {
      if (contextMenu) {
        setTabs((prevTabs) =>
          prevTabs.map((tab) =>
            tab.id === activeTab
              ? {
                ...tab,
                symbols: tab.symbols.filter(
                  (_, index) => index !== contextMenu.symbolIndex
                ),
              }
              : tab
          )
        );
        setContextMenu(null);
        alert("Symbol deleted successfully!");
      }
    };

    return (
      <div
        ref={drop}
        className="canvas-placeholder"
        style={{
          position: "relative",
          height: "700px",
          border: "none",
          background: "white",
        }}
        onClick={() => setActiveSymbol(null)} // Clear active symbol when clicking canvas
      >
        {activeTabSymbols.map((item, index) => (
          <Rnd
            key={index}
            default={{
              x: item.x,
              y: item.y,
              width: item.width,
              height: item.height,
            }}
            style={{
              border: activeSymbol === index ? "2px solid #4299e1" : "none",
              borderRadius: "4px",
              transition: "border 0.2s ease",
              boxShadow:
                activeSymbol === index
                  ? "0 0 10px rgba(66, 153, 225, 0.3)"
                  : "none",
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setActiveSymbol(index);
            }}
            onContextMenu={(e) => handleContextMenu(e, index)}
            onDragStart={() => setActiveSymbol(index)}
            onResizeStart={() => setActiveSymbol(index)}
            onDragStop={(e, d) => {
              setTabs((prevTabs) =>
                prevTabs.map((tab) =>
                  tab.id === activeTab
                    ? {
                      ...tab,
                      symbols: tab.symbols.map((symbol, i) =>
                        i === index ? { ...symbol, x: d.x, y: d.y } : symbol
                      ),
                    }
                    : tab
                )
              );
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
              setTabs((prevTabs) =>
                prevTabs.map((tab) =>
                  tab.id === activeTab
                    ? {
                      ...tab,
                      symbols: tab.symbols.map((symbol, i) =>
                        i === index
                          ? {
                            ...symbol,
                            width: ref.offsetWidth,
                            height: ref.offsetHeight,
                            ...position,
                          }
                          : symbol
                      ),
                    }
                    : tab
                )
              );
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                cursor: "move",
                position: "relative",
              }}
            >
              {item.symbol.type === "unicode" ? (
                <div style={{ fontSize: "24px" }}>{item.symbol.symbol}</div>
              ) : (
                <img
                  src={item.symbol.src}
                  alt="SVG Element"
                  style={{
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none", // Prevents image from interfering with drag
                    filter: "brightness(0)", // Makes the SVG black
                  }}
                />
              )}
            </div>
          </Rnd>
        ))}

        {contextMenu && (
          <div
            ref={contextMenuRef}
            style={{
              position: "fixed",
              top: contextMenu.y,
              left: contextMenu.x,
              backgroundColor: "white",
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "8px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              zIndex: 1000,
            }}
          >
            <button
              onClick={handleDelete}
              style={{
                backgroundColor: "red",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flowchart-container" style={{ backgroundColor: "#ffffff" }}>
        <Navbarone />
        <div className="top-controls">
          {/* <div>
            <BlockDiagramOne /> 
          </div> */}

          {/* <button className="control-button">
  <FiTrash size={25} />
</button>
          <button className="control-button">
            <Maximize size={25} />
          </button>
          <button className="control-button">
            <ZoomIn size={25} />
          </button>
          <button className="control-button">
            <ZoomOut size={25} />
          </button>
          <button className="control-button">
            <ArrowLeft size={25} />
          </button>
          <button className="control-button">
            <ArrowRight size={25} />
          </button>
          <button className='control-button' style={{opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none'}}>Generate</button> */}
        </div>
        <div className="main-content">
          {/* <div className="sidebar"style={{ background: 'linear-gradient(to bottom right, rgb(226, 232, 240),rgb(226, 232, 240))'}}> */}
          <div className="sidebarr">
            <div className="sidebar-toggle-bar" style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '10px' }}>
              <button
                type="button"
                className={`sidebar-tab ${isExplorerVisible === 'explorer' ? 'active' : ''}`}
                onClick={() => setIsExplorerVisible('explorer')}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: isExplorerVisible === 'explorer' ? '#fff' : 'transparent',
                  border: 'none',
                  borderBottom: isExplorerVisible === 'explorer' ? '2px solid #3182ce' : 'none',
                  cursor: 'pointer',
                  fontWeight: isExplorerVisible === 'explorer' ? '600' : '400',
                }}
              >
                Explorer
              </button>
              <button
                type="button"
                className={`sidebar-tab ${isExplorerVisible === 'blocks' ? 'active' : ''}`}
                onClick={() => setIsExplorerVisible('blocks')}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: isExplorerVisible === 'blocks' ? '#fff' : 'transparent',
                  border: 'none',
                  borderBottom: isExplorerVisible === 'blocks' ? '2px solid #3182ce' : 'none',
                  cursor: 'pointer',
                  fontWeight: isExplorerVisible === 'blocks' ? '600' : '400',
                }}
              >
                Blocks
              </button>
            </div>
            <div className="sidebar-body">
              {isExplorerVisible === 'explorer' ? (
                <FileExplorer variant="diagram" />
              ) : (
                <div className="symbol-grid">
                  {/* start  */}
                  <div
                    className="top-buttons"
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: "10px",
                      alignItems: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <button
                      onClick={() => navigate("/blockdiagramtest")}
                      style={{
                        padding: "8px 15px",
                        backgroundColor: "#1A202C",
                        color: "#fff",
                        borderRadius: "5px",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "sm",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      Block Diagram
                    </button>
                    <button
                      onClick={() => navigate("/flowchart")}
                      style={{
                        padding: "8px 15px",
                        backgroundColor: "#1A202C",
                        color: "#fff",
                        borderRadius: "5px",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "sm",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      Flow Diagram
                    </button>
                  </div>

                  {/* <div>  
                <button
                  onClick={(e) => {
                    const button = e.currentTarget;
                    button.style.backgroundColor = 'red';
                    button.style.color = '#fff';
                    setTimeout(() => {
                      button.style.backgroundColor = '#1A202C';
                      button.style.color = 'white';
                    }, 3000);
                    alert("Deleted Successfully");
                  }}
                  style={{
                    padding: '18px 15px',
                    backgroundColor: '#1A202C',
                    color: 'white',
                    borderRadius: '20px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'sm',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '70px',
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    style={{ width: '25px', height: '25px' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 9.75l-.867 9.84a2.25 2.25 0 01-2.243 2.085H7.61a2.25 2.25 0 01-2.243-2.085L4.5 9.75m2.25 0V7.125A2.625 2.625 0 019.375 4.5h5.25a2.625 2.625 0 012.625 2.625V9.75M10.125 12.375v6.75M13.875 12.375v6.75M3 9.75h18"
                    />
                  </svg>
                  Drag and Click to Remove
                </button>
              </div> */}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "10px 14px", // Increased padding for better spacing
                    }}
                  >
                    {/* SEARCH BOX OPEN  */}
                    <InputGroup size="sm">
                      <InputLeftElement
                        pointerEvents="none"
                        children={<FaSearch color="gray.400" />}
                      />
                      <Input
                        type="text"
                        placeholder="Search..."
                        borderRadius="md"
                        borderColor="gray.300"
                      />
                    </InputGroup>
                    {/* SEARCH BOX CLOSE  */}
                  </div>

                  {/* end  */}
                  {symbols.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="symbol-section">
                      <h3
                        onClick={() => toggleCategory(section.category)}
                        style={{ cursor: "pointer" }}
                      >
                        {section.category}
                      </h3>
                      {openCategories[section.category] && (
                        <div
                          className="symbol-items"
                          style={{ borderLeft: "1px solid white" }}
                        >
                          {section.items.map((symbol, symbolIndex) => (
                            <SymbolItem key={symbolIndex} symbol={symbol} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="main-area">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#0f0a19",
                padding: "8px",
                borderRadius: "4px",
                marginBottom: "10px",
                overflowX: "auto",
              }}
            >
              {tabs?.map((tab) => (
                <div
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor:
                      activeTab === tab.id ? "#2d3748" : "#4A5568",
                    color: "white",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    marginRight: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    minWidth: "fit-content",
                  }}
                >
                  <span style={{ marginRight: "8px" }}>{tab.name}</span>
                  {/* <button
                    onClick={(e) => closeTab(tab.id, e)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "white",
                      cursor: "pointer",
                      padding: "0 4px",
                    }}
                  >
                    ✕
                  </button> */}
                </div>
              ))}
              <Tooltip
                aria-label="Add New Block Diagram"
                label="Add New Block Diagrams"
              >
                <IconButton
                  onClick={addNewTab}
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                // style={{
                //   padding: "4px 8px",
                //   backgroundColor: "black",
                //   border: "none",
                //   borderRadius: "4px",
                //   cursor: "pointer",
                //   marginLeft: "4px",
                // }}
                >
                  <FaPlus />
                </IconButton>
              </Tooltip>

              <Tooltip
                label="Reload Block Diagrams"
                aria-label="Reload tooltip"
              >
                <IconButton
                  size="sm"
                  ml={2}
                  aria-label="Reload Block Diagrams"
                  icon={<IoIosRefresh />}
                  colorScheme="blue"
                  variant="outline"
                  onClick={fetchDiagrams} // Ensure this function is defined and working
                />
              </Tooltip>

              <Box
                display="flex"
                justifyContent="flex-end"
                width={"100%"}
                gap={4}
              >
                {/* {selectedProject?.name && (
                  <ProjectChangePopup
                    selectedProject={selectedProject}
                    onProjectChange={setSelectedProject}
                    fileSystem={fileSystem}
                  />
                )} */}
                <DefineProductButton position="flex-end" />
              </Box>
            </div>

            {activeProjectName && (
              <Center>
                <Heading size={"md"}>{activeProjectName}</Heading>
              </Center>
            )}
            {/* Show modal on initial load */}
            {/* {!selectedProject?.name && (
              <ProjectSelectionModal
                onProjectSelect={setSelectedProject}
                fileSystem={fileSystem}
              />
            )} */}

            {/* Show floating popup after project selection */}

            <Canvas />
          </div>
        </div>
        {/* <Footer /> */}
      </div>
  );
};

export default BlockDiagram;
