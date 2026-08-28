
import React, { useState, useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Rnd } from 'react-rnd';
import { Search, ChevronDown, Plus, X, Maximize, ZoomIn, ZoomOut, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { InputGroup, InputLeftElement, Input } from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa';
import { FiTrash } from 'react-icons/fi';

import Navbar from './Navbar';
import Footer from './Footer';
import '../components/FlowchartTest.css';
import DefineProductButton from './shared/DefineProductButton';

// Import the SVG file
import Group37176 from '../images/Group 37176.svg';
import Group37177 from '../images/Group 37177.svg';
import Group37179 from '../images/Group 37179.svg';
import Group37181 from '../images/Group 37181.svg';
import Group37184 from '../images/Group 37184.svg';
import Group37186 from '../images/Group 37186.svg';
import Group37189 from '../images/Group 37189.svg';
import Group37191 from '../images/Group 37191.svg';
import Group37193 from '../images/Group 37193.svg';
import Group37195 from '../images/Group 37195.svg';
import Group37197 from '../images/Group 37197.svg';
import Group37204 from '../images/Group 37204.svg';
import Group37205 from '../images/Group 37205.svg';
import Group37207 from '../images/Group 37207.svg';
import Group37209 from '../images/Group 37209.svg';
import Group37212 from '../images/Group 37212.svg';
import Group37213 from '../images/Group 37213.svg';
import Group37216 from '../images/Group 37216.svg';
import Group37218 from '../images/Group 37218.svg';
import Group37219 from '../images/Group 37219.svg';
import Group37224 from '../images/Group 37224.svg';
import Group37228 from '../images/Group 37228.svg';
import Group37235 from '../images/Group 37235.svg';
import Group37236 from '../images/Group 37236.svg';
import Group36874 from '../images/Group 36874.svg';
import Group36873 from '../images/Group 36873.svg';
import Group36872 from '../images/Group 36872.svg';
import Ellipse24 from '../images/Ellipse 24.svg';
import Ellipse23 from '../images/Ellipse 23.svg';
import Rectangl1809 from '../images/Rectangle 1809.svg';
import t from '../images/t.svg';
import Group37094 from '../images/Group 37094.svg';
import Group37097 from '../images/Group 37097.svg';
import Group37098 from '../images/Group 37098.svg';
import Vector147 from '../images/Vector 147.svg';
import Vector148 from '../images/Vector 148.svg';
import Group36793 from '../images/Group 36793.svg';
import Group37080 from '../images/Group 37080.svg';
import Group37081 from '../images/Group 37081.svg';
import Group37082 from '../images/Group 37082.svg';
import Group37083 from '../images/Group 37083.svg';
import Group37084 from '../images/Group 37084.svg';
import Rectangle1883 from '../images/Rectangle 1883.svg';
import Ad8 from '../images/AD8.svg';
import Ad9 from '../images/AD9.svg';
import Ad10 from '../images/AD10.svg';
import Ad11 from '../images/AD11.svg';
import Ad12 from '../images/AD12.svg';
import Ad13 from '../images/AD13.svg';
import Ad14 from '../images/AD14.svg';
import Ad15 from '../images/AD15.svg';
import Ad17 from '../images/AD17.svg';
import Navbarone from './Navbarone';


const symbols = [
  {
    category: "FOR DATA STRUCTURE   ▼",
    items: [
      { type: "svg", src: Group37176, name: "Array" },
      { type: "svg", src: Group37177, name: "Linked List" },
      { type: "svg", src: Group37179, name: "Stack" },
      { type: "svg", src: Group37181, name: "Queue" },
      { type: "svg", src: Group37184, name: "Circular Buffer" },
      { type: "svg", src: Group37186, name: "Binary Tree" },
      { type: "svg", src: Group37189, name: "Heap" },
      { type: "svg", src: Group37191, name: "Graph" },
      { type: "svg", src: Group37193, name: " C Struct " },
      { type: "svg", src: Group37195, name: "Binary Tree" },
      { type: "svg", src: Group37197, name: "Tries" },
      // { type: "svg", src: Group37204 , name: "Doubly Linkedlist" },
      { type: "svg", src: Group37204, name: "Bloom Table" },
      { type: "svg", src: Group37205, name: "Doubly Linkedlist" },
      { type: "svg", src: Group37207, name: "Tries" },
      { type: "svg", src: Group37209, name: "Binary Table" },
      { type: "svg", src: Group37212, name: "Lookup Table" },
      { type: "svg", src: Group37213, name: "Semaphore" },
      { type: "svg", src: Group37216, name: "Mutex" },
      { type: "svg", src: Group37218, name: "Task Control Block" },
      { type: "svg", src: Group37219, name: "Graph Adjacency List" },
      { type: "svg", src: Group37224, name: "Interrupt Vector" },
      { type: "svg", src: Group37228, name: "LRU CACHE" },
      { type: "svg", src: Group37235, name: "Buffer Pool" },
      { type: "svg", src: Group37236, name: "Union" },
    ],
  },
  {
    category: "UML USE CASE DIAGRAM ▼",
    items: [
      { type: "svg", src: Ellipse24, name: "Start" },
      { type: "svg", src: Ellipse23, name: "Ellipse" },
      { type: "svg", src: Group36874, name: "Note" },
      { type: "svg", src: Group36873, name: "Use Case" },
      { type: "svg", src: Group36872, name: "Actor" },
      { type: "svg", src: Rectangl1809, name: "Rectangle" },
      { type: "svg", src: t, name: "Text Box" },
    ],
  },
  {
    category: "UML TIMING DIAGRAM ▼",
    items: [
      { type: "svg", src: Group37094, name: "Text Box" },
      { type: "svg", src: Group37097, name: "Found Message" },
      { type: "svg", src: Group37098, name: "Generalized" },
      { type: "svg", src: Vector147, name: "1 to Many" },
      { type: "svg", src: Vector148, name: "Transfer" },
    ],
  },
  {
    category: "UML SEQUENCE DIAGRAM ▼",
    items: [
      { type: "svg", src: Group36793, name: "Name" },
      { type: "svg", src: Group36872, name: "Actor" },
      { type: "svg", src: Group37080, name: "Alternative" },
      { type: "svg", src: Group37081, name: "Loop" },
      { type: "svg", src: Group37082, name: "Reference" },
      { type: "svg", src: Group37083, name: "Entity Object" },
      { type: "svg", src: Group37084, name: "Boundary Object" },
      { type: "svg", src: Rectangle1883, name: "Dark Line" },
    ],
  },
  {
    category: "ACTIVITY & STATE DIAGRAM ▼",
    items: [
      { type: "svg", src: Ad8, name: "Text Box" },
      { type: "svg", src: Ad9, name: "Object" },
      { type: "svg", src: Ad10, name: "Rectangle" },
      { type: "svg", src: Ad11, name: "Name" },
      { type: "svg", src: Rectangle1883, name: "Dark Lines" },
      { type: "svg", src: Ad12, name: "Straight Line" },
      { type: "svg", src: Ad13, name: "Straight Line" },
      { type: "svg", src: Ad14, name: "Decision Box" },
      { type: "svg", src: Ad15, name: "Collate" },
      { type: "svg", src: Ad17, name: "Pointer" },
    ],
  },

];


const Flowchart = () => {
  const [tabs, setTabs] = useState([
    { id: 1, name: "Diagram 1", symbols: [] }
  ]);
  const [activeTab, setActiveTab] = useState(1);
  const [openCategories, setOpenCategories] = useState({});
  const MAX_TABS = 5;
  const navigate = useNavigate();

  const addNewTab = () => {
    if (tabs.length >= MAX_TABS) {
      alert("Maximum of 5 tabs allowed.");
      return;
    }
    const newTabId = tabs.length + 1;
    const newTab = { id: newTabId, name: `Diagram ${newTabId}`, symbols: [] };
    setTabs([...tabs, newTab]);
    setActiveTab(newTabId);
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const closeTab = (tabId, event) => {
    event.stopPropagation();
    const newTabs = tabs.filter((tab) => tab.id !== tabId);
    if (newTabs.length > 0) {
      if (activeTab === tabId) {
        setActiveTab(newTabs[newTabs.length - 1].id);
      }
    } else {
      // Add a new blank tab if all tabs are closed
      const newTab = { id: 1, name: "Flowchart 1", symbols: [] };
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
      //   {symbol.type === 'unicode' ? (
      //     symbol.symbol
      //   ) : (
      //     <img src={symbol.src} alt="SVG Symbol" className="svg-icon" />
      //   )}
      //    {/* added for naming things  */}
      //    <div style={{ marginTop: "4px", fontSize: "12px", color: "white" }}>
      //     {symbol.name}
      //   </div>
      // </button>
      <>
        <h1>Flowchart</h1>

        <button
          ref={drag}
          className="symbol-button"
          style={{
            cursor: "grab",
            height: "120px",  // Set a specific height
            width: "100px",   // Optional: set a specific width
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {symbol.type === "unicode" ? (
            symbol.symbol
          ) : (
            <img src={symbol.src} alt="SVG Symbol" className="svg-icon" />
          )}
          <div style={{
            marginTop: "4px",
            fontSize: "18px",
            color: "white"
          }}>
            {symbol.name}
          </div>
        </button>
      </>
    );
  };
  // start for delte things 
  // Add this custom hook to handle click outside
  const useClickOutside = (ref, handler) => {
    useEffect(() => {
      const listener = (event) => {
        if (!ref.current || ref.current.contains(event.target)) {
          return;
        }
        handler(event);
      };
      document.addEventListener('mousedown', listener);
      document.addEventListener('touchstart', listener);
      return () => {
        document.removeEventListener('mousedown', listener);
        document.removeEventListener('touchstart', listener);
      };
    }, [ref, handler]);
  };
  // end for delete things 


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

    const activeTabSymbols = tabs.find((tab) => tab.id === activeTab)?.symbols || [];

    const handleContextMenu = (e, index) => {
      e.preventDefault();
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        symbolIndex: index
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
        style={{ position: "relative", height: "700px", border: "none", background: "white" }}
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
              border: activeSymbol === index ? '2px solid #4299e1' : 'none',
              borderRadius: '4px',
              transition: 'border 0.2s ease',
              boxShadow: activeSymbol === index ? '0 0 10px rgba(66, 153, 225, 0.3)' : 'none'
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setActiveSymbol(index);
            }}
            onContextMenu={(e) => handleContextMenu(e, index)}
            onDragStart={() => setActiveSymbol(index)}
            onResizeStart={() => setActiveSymbol(index)}
            onDragStop={(e, d) => {
              // Removed tab management logic
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
              // Removed tab management logic
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                cursor: 'move',
                position: 'relative'
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
                    pointerEvents: 'none',
                    filter: 'brightness(0)'
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
              position: 'fixed',
              top: contextMenu.y,
              left: contextMenu.x,
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              zIndex: 1000
            }}
          >
            <button
              onClick={handleDelete}
              style={{
                backgroundColor: 'red',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
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
          <button className="control-button">
            <FiTrash size={25} />
          </button>
          <button className="control-button"><Maximize size={25} /></button>
          <button className="control-button"><ZoomIn size={25} /></button>
          <button className="control-button"><ZoomOut size={25} /></button>
          <button className="control-button"><ArrowLeft size={25} /></button>
          <button className="control-button"><ArrowRight size={25} /></button>
          <button
            className="control-button"
            style={{
              display: 'inline-block',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: 'none',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = '0 0 15px 2px white';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = 'none';
              e.target.style.transform = 'scale(1)';
            }}
          >
            Generate
          </button>
        </div>
        <div className="main-content">
          <div className="sidebar">
            <div className="symbol-grid">
              <div
                className="top-buttons"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '10px',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}
              >
                <button
                  onClick={() => navigate('/blockdiagram')}
                  style={{
                    padding: '8px 15px',
                    backgroundColor: '#1A202C',
                    color: '#fff',
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'sm',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  Block Diagram
                </button>
                <button
                  onClick={() => navigate('/flowchart')}
                  style={{
                    padding: '8px 15px',
                    backgroundColor: '#1A202C',
                    color: '#fff',
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'sm',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
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
                    border : 'none',
                    cursor: 'pointer',
                    fontWeight: 'sm',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '64px',
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


              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 14px', // Increased padding for better spacing

              }}>
                {/* SEARCH BOX OPEN  */}
                <InputGroup size="sm">
                  <InputLeftElement pointerEvents="none" children={<FaSearch color="gray.400" />} />
                  <Input
                    type="text"
                    placeholder="Search..."
                    borderRadius="md"
                    borderColor="gray.300"
                  />
                </InputGroup>
                {/* SEARCH BOX CLOSE  */}
              </div>

              {symbols.map((section, sectionIndex) => (
                <div key={sectionIndex} className="symbol-section">
                  <h3
                    onClick={() => toggleCategory(section.category)}
                    style={{ cursor: 'pointer' }}
                  >
                    {section.category}
                  </h3>
                  {openCategories[section.category] && (
                    <div className="symbol-items" style={{ borderLeft: 'none' }}>
                      {section.items.map((symbol, symbolIndex) => (
                        <SymbolItem key={symbolIndex} symbol={symbol} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="main-area">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#0f0a19',
                padding: '8px',
                borderRadius: '4px',
                marginBottom: '10px',
                overflowX: 'auto'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center'
              }}>
                {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: activeTab === tab.id ? '#2d3748' : '#4A5568',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      marginRight: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      minWidth: 'fit-content'
                    }}
                  >
                    <span style={{ marginRight: '8px' }}>{tab.name}</span>
                    <button
                      onClick={(e) => closeTab(tab.id, e)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        padding: '0 4px'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={addNewTab}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginLeft: '4px'
                  }}
                >
                  +
                </button>
              </div>
              <DefineProductButton position="inline" />
            </div>
            <Canvas />
          </div>
        </div>
        {/* <Footer /> */}
      </div>
  );
};

export default Flowchart;