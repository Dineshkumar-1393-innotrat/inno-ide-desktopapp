import React, {
  useCallback,
  useRef,
  useState,
  useEffect,
  useMemo,
} from "react";
import ReactFlow, {
  Background,
  Controls,
  ControlButton,
  MiniMap,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  ConnectionLineType,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,

  getStraightPath,
  ConnectionMode,
  NodeResizer,
  getRectOfNodes,
  getTransformForBounds,
} from "reactflow";
import { useDispatch, useSelector } from "react-redux";
import {
  setTabs,
  setActiveTab,
  addTab,
  closeTab,
  updateTabState,
  markTabClean,
} from "../store/slices/flowchartSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { toPng } from "html-to-image";
import "reactflow/dist/style.css";
import "./FlowChartTest.css";
import FileExplorer from "./FileExplorer";
import "./FileExplorer.css";
import EditorNavbar from "./EditorNavbar";
import DiagramTabs from "./DiagramTabs";
import MobileMenuButton from "./MobileMenuButton";
import { useResponsiveSidebar } from "../hooks/useResponsiveSidebar";
import { useResizableSidebar } from "../hooks/useResizableSidebar";
import { useToast } from "@chakra-ui/react";
import { Settings, ArrowLeftRight, RotateCcw, RotateCw, Monitor, Loader2, Trash, CheckCircle } from "lucide-react";

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
      Please Drag The Shapes
    </div>
  </div>
);
import hexBg from "../assets/hex_bg.png";
import { useProject } from "../ProjectContext";
import PropertiesPanel from "./PropertiesPanel";
import {
  saveProjectFile,
  sanitizeSegment,
  ensureProjectFolder,
} from "../utils/workspaceStorage";
import { saveAssetToScreenFolder } from "../utils/screenFileManager";
import CreateProductButton from "./shared/CreateProductButton";
import projectFileManager from "../utils/projectFileManager";
import { useCanvasFileIntegration } from "../hooks/useCanvasFileIntegration";
import axios from "axios";
import { baseURL } from "../utilities";
import { loadSequenceDiagram } from "../utils/sequenceDiagramLoader";

// Helper hook for updating node data via Redux
// This ensures changes persist even when the controlled flow is re-rendered from the store
const useNodeDataUpdate = () => {
  const dispatch = useDispatch();
  const { activeTabId } = useSelector((state) => state.flowchart);
  const rf = useReactFlow();

  return useCallback((nodeId, updateFn) => {
    // Get current nodes from ReactFlow instance to ensure we have latest state
    const currentNodes = rf.getNodes();
    const nextNodes = currentNodes.map(n =>
      n.id === nodeId ? updateFn(n) : n
    );

    // Dispatch to Redux
    dispatch(updateTabState({
      tabId: activeTabId,
      nodes: nextNodes
    }));
  }, [dispatch, activeTabId, rf]);
};

// Helper hook for updating edge data via Redux
const useEdgeDataUpdate = () => {
  const dispatch = useDispatch();
  const { activeTabId } = useSelector((state) => state.flowchart);
  const rf = useReactFlow();

  return useCallback((edgeId, updateFn) => {
    const currentEdges = rf.getEdges();
    const nextEdges = currentEdges.map(e =>
      e.id === edgeId ? updateFn(e) : e
    );
    dispatch(updateTabState({
      tabId: activeTabId,
      edges: nextEdges
    }));
  }, [dispatch, activeTabId, rf]);
};

// Simple id helpers
const getId = () => `n_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const createFlowchartState = () => ({
  nodes: [],
  edges: [],
  viewport: null,
});

const ItemTypes = {
  SHAPE: "shape",
};

const shapeData = {
  Flowchart: [
    {
      id: "flow-rectangle",
      name: "Rectangle",
      icon: { viewBox: "0 0 100 60", path: "M0 0 H100 V60 H0 Z" },
      anchors: [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 30 },
        { x: 100, y: 60 },
        { x: 50, y: 60 },
        { x: 0, y: 60 },
        { x: 0, y: 30 },
      ],
      getHandles: () => [
        {
          id: "top",
          position: Position.Top,
          style: { transform: "translate(-50%, -50%)" },
        },
        {
          id: "bottom",
          position: Position.Bottom,
          style: { transform: "translate(-50%, -50%)" },
        },
        {
          id: "left",
          position: Position.Left,
          style: { transform: "translate(-50%, -50%)" },
        },
        {
          id: "right",
          position: Position.Right,
          style: { transform: "translate(-50%, -50%)" },
        },
      ],
    },
    {
      id: "flow-diamond",
      name: "Diamond",
      icon: { viewBox: "0 0 100 100", path: "M50 0 L100 50 L50 100 L0 50 Z" },
      anchors: [
        { x: 50, y: 0 },
        { x: 100, y: 50 },
        { x: 50, y: 100 },
        { x: 0, y: 50 },
      ],
      getHandles: () => [
        {
          id: "top",
          position: Position.Top,
          style: { transform: "translate(-50%, -50%)" },
        },
        {
          id: "bottom",
          position: Position.Bottom,
          style: { transform: "translate(-50%, -50%)" },
        },
        {
          id: "left",
          position: Position.Left,
          style: { transform: "translate(-50%, -50%)" },
        },
        {
          id: "right",
          position: Position.Right,
          style: { transform: "translate(-50%, -50%)" },
        },
      ],
    },
    {
      id: "flow-oval",
      name: "Oval",
      icon: {
        viewBox: "0 0 100 60",
        path: "M50,0 A50,30 0 1,0 50,60 A50,30 0 1,0 50,0",
      },
      anchors: [
        { x: 50, y: 0 },
        { x: 100, y: 30 },
        { x: 50, y: 60 },
        { x: 0, y: 30 },
      ],
      getHandles: () => [
        {
          id: "top",
          position: Position.Top,
          style: { transform: "translate(-50%, -50%)" },
        },
        {
          id: "bottom",
          position: Position.Bottom,
          style: { transform: "translate(-50%, -50%)" },
        },
        {
          id: "left",
          position: Position.Left,
          style: { transform: "translate(-50%, -50%)" },
        },
        {
          id: "right",
          position: Position.Right,
          style: { transform: "translate(-50%, -50%)" },
        },
      ],
    },
    {
      id: "flow-parallelogram",
      name: "Parallelogram",
      icon: { viewBox: "0 0 100 60", path: "M20 0 H100 L80 60 H0 Z" },
      anchors: [
        { x: 20, y: 0 },
        { x: 100, y: 0 },
        { x: 80, y: 60 },
        { x: 0, y: 60 },
        { x: 60, y: 0 },
        { x: 90, y: 30 },
        { x: 40, y: 60 },
        { x: 10, y: 30 },
      ],
      getHandles: () => {
        // Path: M20 0 H100 L80 60 H0 Z
        const slant = 20; // The horizontal offset of the slanted sides
        const width = 100;
        const leftOffset = slant / width;

        return [
          {
            id: "top",
            position: Position.Top,
            style: { top: "0%", left: "60%" },
          }, // Midpoint of top edge (20,0) to (100,0)
          {
            id: "bottom",
            position: Position.Bottom,
            style: { top: "100%", left: "40%" },
          }, // Midpoint of bottom edge (80,60) to (0,60)
          {
            id: "left",
            position: Position.Left,
            style: { top: "50%", left: `${leftOffset * 50}%` },
          }, // Midpoint of left edge (0,60) to (20,0)
          {
            id: "right",
            position: Position.Right,
            style: { top: "50%", left: `${100 - leftOffset * 50}%` },
          }, // Midpoint of right edge (100,0) to (80,60)
        ];
      },
    },
    {
      id: "flow-triangle",
      name: "Triangle",
      icon: { viewBox: "0 0 100 86.6", path: "M50 0 L100 86.6 H0 Z" },
      anchors: [
        { x: 50, y: 0 },
        { x: 100, y: 86.6 },
        { x: 0, y: 86.6 },
        { x: 75, y: 43.3 },
        { x: 25, y: 43.3 },
      ],
      getHandles: () => [
        {
          id: "top",
          position: Position.Top,
          style: { top: "0%", left: "50%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "bottom-left",
          position: Position.Bottom,
          style: {
            top: "100%",
            left: "25%",
            transform: "translate(-50%, -50%)",
          },
        },
        {
          id: "bottom-right",
          position: Position.Bottom,
          style: {
            top: "100%",
            left: "75%",
            transform: "translate(-50%, -50%)",
          },
        },
        {
          id: "left",
          position: Position.Left,
          style: { top: "50%", left: "0%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "right",
          position: Position.Right,
          style: {
            top: "50%",
            left: "100%",
            transform: "translate(-50%, -50%)",
          },
        },
      ],
    },
    {
      id: "flow-cylinder",
      name: "Cylinder",
      icon: {
        viewBox: "0 0 100 100",
        path: "M50 0 C22.386 0 0 15 0 15 V85 C0 85 22.386 100 50 100 C77.614 100 100 85 100 85 V15 C100 15 77.614 0 50 0 Z M0 15 C0 15 22.386 30 50 30 C77.614 30 100 15 100 15",
      },
      anchors: [
        { x: 50, y: 0 },
        { x: 100, y: 15 },
        { x: 100, y: 85 },
        { x: 50, y: 100 },
        { x: 0, y: 85 },
        { x: 0, y: 15 },
      ],
      getHandles: () => [
        {
          id: "top",
          position: Position.Top,
          style: { top: "0%", left: "50%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "bottom",
          position: Position.Bottom,
          style: {
            top: "100%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          },
        },
        {
          id: "left",
          position: Position.Left,
          style: { top: "50%", left: "0%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "right",
          position: Position.Right,
          style: {
            top: "50%",
            left: "100%",
            transform: "translate(-50%, -50%)",
          },
        },
      ],
    },
    {
      id: "flow-circle",
      name: "Circle",
      icon: {
        viewBox: "0 0 100 100",
        path: "M50,0 C22.386,0 0,22.386 0,50 C0,77.614 22.386,100 50,100 C77.614,100 100,77.614 100,50 C100,22.386 77.614,0 50,0 Z",
      },
      anchors: [
        { x: 50, y: 0 },
        { x: 100, y: 50 },
        { x: 50, y: 100 },
        { x: 0, y: 50 },
      ],
      getHandles: () => [
        {
          id: "top",
          position: Position.Top,
          style: { top: "0%", left: "50%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "bottom",
          position: Position.Bottom,
          style: {
            top: "100%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          },
        },
        {
          id: "left",
          position: Position.Left,
          style: { top: "50%", left: "0%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "right",
          position: Position.Right,
          style: {
            top: "50%",
            left: "100%",
            transform: "translate(-50%, -50%)",
          },
        },
      ],
    },
    {
      id: "flow-right-arrow",
      name: "Right Arrow",
      icon: {
        viewBox: "0 0 100 60",
        path: "M0 20 H70 L70 0 L100 30 L70 60 V40 H0 Z",
      },
      anchors: [
        { x: 0, y: 30 },
        { x: 70, y: 30 },
        { x: 100, y: 30 },
        { x: 70, y: 0 },
        { x: 70, y: 60 },
      ],
      getHandles: () => [
        {
          id: "left",
          position: Position.Left,
          style: { top: "50%", left: "0%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "right",
          position: Position.Right,
          style: {
            top: "50%",
            left: "100%",
            transform: "translate(-50%, -50%)",
          },
        },
        {
          id: "top",
          position: Position.Top,
          style: { top: "0%", left: "70%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "bottom",
          position: Position.Bottom,
          style: {
            top: "100%",
            left: "70%",
            transform: "translate(-50%, -50%)",
          },
        },
      ],
    },
    // {
    //   id: "flow-bracket-open",
    //   name: "Bracket Open",
    //   icon: { viewBox: "0 0 30 100", path: "M20 0 H10 V100 H20" },
    // },
    // {
    //   id: "flow-bracket-close",
    //   name: "Bracket Close",
    //   icon: { viewBox: "0 0 30 100", path: "M10 0 H20 V100 H10" },
    // },
    // {
    //   id: "flow-brace-open",
    //   name: "Brace Open",
    //   icon: {
    //     viewBox: "0 0 30 100",
    //     path: "M20 0 H10 C5 0 5 25 10 25 V75 C5 75 5 100 10 100 H20",
    //   },
    // },
    // {
    //   id: "flow-brace-close",
    //   name: "Brace Close",
    //   icon: {
    //     viewBox: "0 0 30 100",
    //     path: "M10 0 H20 C25 0 25 25 20 25 V75 C25 75 25 100 20 100 H10",
    //   },
    // },
    {
      id: "flow-square",
      name: "Square",
      icon: { viewBox: "0 0 100 100", path: "M0 0 H100 V100 H0 Z" },
      anchors: [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 50 },
        { x: 100, y: 100 },
        { x: 50, y: 100 },
        { x: 0, y: 100 },
        { x: 0, y: 50 },
      ],
    },
    {
      id: "flow-hourglass",
      name: "Hourglass",
      icon: { viewBox: "0 0 100 100", path: "M0 0 H100 L0 100 H100 Z" },
    },
    {
      id: "flow-document-wavy",
      name: "Document",
      icon: {
        viewBox: "0 0 100 100",
        path: "M0 0 H100 V80 C 75 70, 25 90, 0 80 Z",
      },
    },
    {
      id: "flow-magnetic-drum",
      name: "Magnetic Drum",
      icon: {
        viewBox: "0 0 100 100",
        path: "M15 0 C15 22, 0 22, 0 50 C0 78, 15 78, 15 100 H85 C85 78, 100 78, 100 50 C100 22, 85 22, 85 0 Z",
      },
    },
    {
      id: "flow-manual-input",
      name: "Manual Input",
      icon: { viewBox: "0 0 100 60", path: "M0 60 H100 V0 H20 Z" },
    },
    {
      id: "flow-document-cut",
      name: "Document",
      icon: { viewBox: "0 0 100 100", path: "M0 0 H75 L100 25 V100 H0 Z" },
    },
    {
      id: "flow-trapezoid",
      name: "Trapezoid",
      icon: { viewBox: "0 0 100 60", path: "M20 0 H80 L100 60 H0 Z" },
    },
    {
      id: "flow-inverted-trapezoid",
      name: "Inverted Trapezoid",
      icon: { viewBox: "0 0 100 60", path: "M0 0 H100 L80 60 H20 Z" },
    },
    {
      id: "flow-inverted-triangle",
      name: "Inverted Triangle",
      icon: { viewBox: "0 0 100 86.6", path: "M0 0 H100 L50 86.6 Z" },
    },
    {
      id: "flow-shield",
      name: "Shield",
      icon: {
        viewBox: "0 0 100 100",
        path: "M0 20 L50 0 L100 20 V80 C50 100, 50 100, 0 80 Z",
      },
    },
    {
      id: "flow-cross",
      name: "Cross",
      icon: {
        viewBox: "0 0 100 100",
        path: "M50 0 C22.4 0 0 22.4 0 50 C0 77.6 22.4 100 50 100 C77.6 100 100 77.6 100 50 C100 22.4 77.6 0 50 0 Z M50 20 V80 M20 50 H80",
      },
    },
    {
      id: "flow-flag",
      name: "Flag",
      icon: {
        viewBox: "0 0 100 100",
        path: "M0 0 V100 V0 H50 C 60 10, 90 10, 100 0 V50 C 90 40, 60 40, 50 50 H0 Z",
      },
    },
    {
      id: "flow-equals-diamonds",
      name: "Equals",
      icon: {
        viewBox: "0 0 120 100",
        path: "M10 50 L25 35 L40 50 L25 65 Z M45 50 L60 35 L75 50 L60 65 Z M80 50 L95 35 L110 50 L95 65 Z",
      },
    },
    {
      id: "flow-hexagon-arrow",
      name: "Hexagon Arrow",
      icon: {
        viewBox: "0 0 100 86.6",
        path: "M0 43.3 L25 0 H75 L100 43.3 L75 86.6 H25 Z",
      },
    },
    {
      id: "flow-circle-x",
      name: "Circle X",
      icon: {
        viewBox: "0 0 100 100",
        path: "M50 0 C22.4 0 0 22.4 0 50 C0 77.6 22.4 100 50 100 C77.6 100 100 77.6 100 50 C100 22.4 77.6 0 50 0 Z M20 20 L80 80 M80 20 L20 80",
      },
    },
    {
      id: "flow-fat-arrow",
      name: "Fat Arrow",
      icon: {
        viewBox: "0 0 100 100",
        path: "M0 25 H50 V0 L100 50 L50 100 V75 H0 Z",
      },
    },
    {
      id: "flow-pentagon",
      name: "Pentagon",
      icon: {
        viewBox: "0 0 100 95.1",
        path: "M50 0 L100 36.3 L80.9 95.1 H19.1 L0 36.3 Z",
      },
      anchors: [
        { x: 50, y: 0 },
        { x: 100, y: 36.3 },
        { x: 80.9, y: 95.1 },
        { x: 19.1, y: 95.1 },
        { x: 0, y: 36.3 },
        { x: 75, y: 65.7 },
        { x: 25, y: 65.7 },
      ],
    },
    {
      id: "flow-hexagon",
      name: "Hexagon",
      icon: {
        viewBox: "0 0 100 86.6",
        path: "M25 0 L75 0 L100 43.3 L75 86.6 H25 L0 43.3 Z",
      },
      anchors: [
        { x: 25, y: 0 },
        { x: 75, y: 0 },
        { x: 100, y: 43.3 },
        { x: 75, y: 86.6 },
        { x: 25, y: 86.6 },
        { x: 0, y: 43.3 },
        { x: 50, y: 0 },
        { x: 100, y: 65 },
        { x: 50, y: 86.6 },
        { x: 0, y: 21.6 },
      ],
    },
    {
      id: "flow-stored-data",
      name: "Stored Data",
      icon: {
        viewBox: "0 0 100 60",
        path: "M20 0 C 30 0, 70 0, 80 0 H 100 V 60 H 20 C 10 60, -10 60, 0 60 V 0 H 20",
      },
    },
    {
      id: "flow-internal-storage",
      name: "Internal Storage",
      icon: {
        viewBox: "0 0 100 100",
        path: "M0 0 H100 V100 H0 Z M0 20 H100 M20 0 V100",
      },
    },
    {
      id: "block-cloud",
      name: "Cloud",
      icon: {
        viewBox: "0 0 100 60",
        path: "M20,40 Q10,30 20,20 Q15,5 35,10 Q40,0 55,10 Q70,0 75,15 Q95,15 90,35 Q100,45 85,50 Q80,60 65,55 Q55,65 45,55 Q30,65 25,50 Q5,50 20,40 Z",
        stroke: "#000",
        strokeWidth: 2,
        fill: "white",
      },
    },
    {
      id: "flow-paper-tape",
      name: "Paper Tape",
      icon: {
        viewBox: "0 0 100 120",
        path: "M0 20 C 25 10, 75 10, 100 20 V 100 C 75 110, 25 110, 0 100 Z",
      },
    },
  ],

  "Block Diagram": [
    {
      id: "block-process",
      name: "Process",
      icon: { viewBox: "0 0 100 60", path: "M0 0 H100 V60 H0 Z" },
      anchors: [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 30 },
        { x: 100, y: 60 },
        { x: 50, y: 60 },
        { x: 0, y: 60 },
        { x: 0, y: 30 },
      ],
      getHandles: () => [
        {
          id: "top",
          position: Position.Top,
          style: { top: "0%", left: "50%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "bottom",
          position: Position.Bottom,
          style: {
            top: "100%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          },
        },
        {
          id: "left",
          position: Position.Left,
          style: { top: "50%", left: "0%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "right",
          position: Position.Right,
          style: {
            top: "50%",
            left: "100%",
            transform: "translate(-50%, -50%)",
          },
        },
      ],
    },
    {
      id: "block-decision",
      name: "Decision",
      icon: { viewBox: "0 0 100 100", path: "M50 0 L100 50 L50 100 L0 50 Z" },
      anchors: [
        { x: 50, y: 0 },
        { x: 100, y: 50 },
        { x: 50, y: 100 },
        { x: 0, y: 50 },
      ],
      getHandles: () => [
        {
          id: "top",
          position: Position.Top,
          style: { top: "0%", left: "50%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "bottom",
          position: Position.Bottom,
          style: {
            top: "100%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          },
        },
        {
          id: "left",
          position: Position.Left,
          style: { top: "50%", left: "0%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "right",
          position: Position.Right,
          style: {
            top: "50%",
            left: "100%",
            transform: "translate(-50%, -50%)",
          },
        },
      ],
    },
    {
      id: "block-data",
      name: "Data",
      icon: {
        viewBox: "0 0 100 60",
        path: "M0 0 H100 V60 H0 Z M0 10 H100 M0 20 H100 M0 30 H100 M0 40 H100 M0 50 H100",
      },
      anchors: [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 30 },
        { x: 100, y: 60 },
        { x: 50, y: 60 },
        { x: 0, y: 60 },
        { x: 0, y: 30 },
      ],
      getHandles: () => [
        {
          id: "top",
          position: Position.Top,
          style: { top: "0%", left: "50%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "bottom",
          position: Position.Bottom,
          style: {
            top: "100%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          },
        },
        {
          id: "left",
          position: Position.Left,
          style: { top: "50%", left: "0%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "right",
          position: Position.Right,
          style: {
            top: "50%",
            left: "100%",
            transform: "translate(-50%, -50%)",
          },
        },
      ],
    },
    {
      id: "block-terminal",
      name: "Terminal",
      icon: {
        viewBox: "0 0 100 60",
        path: "M20 0 H80 Q100 0 100 20 V40 Q100 60 80 60 H20 Q0 60 0 40 V20 Q0 0 20 0 Z",
      },
      anchors: [
        { x: 20, y: 0 },
        { x: 50, y: 0 },
        { x: 80, y: 0 },
        { x: 100, y: 20 },
        { x: 100, y: 40 },
        { x: 80, y: 60 },
        { x: 50, y: 60 },
        { x: 20, y: 60 },
        { x: 0, y: 40 },
        { x: 0, y: 20 },
      ],
      getHandles: () => [
        {
          id: "top",
          position: Position.Top,
          style: { top: "0%", left: "50%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "bottom",
          position: Position.Bottom,
          style: {
            top: "100%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          },
        },
        {
          id: "left",
          position: Position.Left,
          style: { top: "50%", left: "0%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "right",
          position: Position.Right,
          style: {
            top: "50%",
            left: "100%",
            transform: "translate(-50%, -50%)",
          },
        },
      ],
    },
    {
      id: "block-connector",
      name: "Connector",
      icon: { viewBox: "0 0 100 100", path: "M50 0 A50 50 0 1 0 50.001 0 Z" },
      anchors: [
        { x: 50, y: 0 },
        { x: 100, y: 50 },
        { x: 50, y: 100 },
        { x: 0, y: 50 },
      ],
      getHandles: () => [
        {
          id: "top",
          position: Position.Top,
          style: { top: "0%", left: "50%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "bottom",
          position: Position.Bottom,
          style: {
            top: "100%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          },
        },
        {
          id: "left",
          position: Position.Left,
          style: { top: "50%", left: "0%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "right",
          position: Position.Right,
          style: {
            top: "50%",
            left: "100%",
            transform: "translate(-50%, -50%)",
          },
        },
      ],
    },
    {
      id: "block-off-page",
      name: "Off Page",
      icon: {
        viewBox: "0 0 100 60",
        path: "M0 0 H100 V60 H0 Z M0 10 H100 M0 20 H100 M0 30 H100 M0 40 H100 M0 50 H100 M10 0 V60 M20 0 V60 M30 0 V60 M40 0 V60 M50 0 V60 M60 0 V60 M70 0 V60 M80 0 V60 M90 0 V60",
      },
      anchors: [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 30 },
        { x: 100, y: 60 },
        { x: 50, y: 60 },
        { x: 0, y: 60 },
        { x: 0, y: 30 },
      ],
      getHandles: () => [
        {
          id: "top",
          position: Position.Top,
          style: { top: "0%", left: "50%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "bottom",
          position: Position.Bottom,
          style: {
            top: "100%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          },
        },
        {
          id: "left",
          position: Position.Left,
          style: { top: "50%", left: "0%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "right",
          position: Position.Right,
          style: {
            top: "50%",
            left: "100%",
            transform: "translate(-50%, -50%)",
          },
        },
      ],
    },
    {
      id: "block-summing",
      name: "Summing",
      icon: {
        viewBox: "0 0 100 100",
        path: "M50 0 A50 50 0 1 0 50.001 0 Z M50 20 A30 30 0 1 0 50.001 20 Z",
      },
      anchors: [
        { x: 50, y: 0 },
        { x: 100, y: 50 },
        { x: 50, y: 100 },
        { x: 0, y: 50 },
      ],
      getHandles: () => [
        {
          id: "top",
          position: Position.Top,
          style: { top: "0%", left: "50%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "bottom",
          position: Position.Bottom,
          style: {
            top: "100%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          },
        },
        {
          id: "left",
          position: Position.Left,
          style: { top: "50%", left: "0%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "right",
          position: Position.Right,
          style: {
            top: "50%",
            left: "100%",
            transform: "translate(-50%, -50%)",
          },
        },
      ],
    },
    {
      id: "block-delay",
      name: "Delay",
      icon: {
        viewBox: "0 0 100 60",
        path: "M0 0 H100 V60 H0 Z M0 15 H100 M0 30 H100 M0 45 H100",
      },
      anchors: [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 30 },
        { x: 100, y: 60 },
        { x: 50, y: 60 },
        { x: 0, y: 60 },
        { x: 0, y: 30 },
      ],
      getHandles: () => [
        {
          id: "top",
          position: Position.Top,
          style: { top: "0%", left: "50%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "bottom",
          position: Position.Bottom,
          style: {
            top: "100%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          },
        },
        {
          id: "left",
          position: Position.Left,
          style: { top: "50%", left: "0%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "right",
          position: Position.Right,
          style: {
            top: "50%",
            left: "100%",
            transform: "translate(-50%, -50%)",
          },
        },
      ],
    },
  ],

  Basic: [
    {
      id: "basic-square",
      name: "Square",
      icon: {
        viewBox: "0 0 100 100",
        path: "M0 0 H100 V100 H0 Z",
      },
      anchors: [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 50 },
        { x: 100, y: 100 },
        { x: 50, y: 100 },
        { x: 0, y: 100 },
        { x: 0, y: 50 },
      ],
      getHandles: () => [
        {
          id: "top",
          position: Position.Top,
          style: { top: "0%", left: "50%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "bottom",
          position: Position.Bottom,
          style: {
            top: "100%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          },
        },
        {
          id: "left",
          position: Position.Left,
          style: { top: "50%", left: "0%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "right",
          position: Position.Right,
          style: {
            top: "50%",
            left: "100%",
            transform: "translate(-50%, -50%)",
          },
        },
      ],
    },
    {
      id: "basic-circle",
      name: "Circle",
      icon: {
        viewBox: "0 0 100 100",
        path: "M50,0 A50,50 0 1,0 50.001,0",
      },
      anchors: [
        { x: 50, y: 0 },
        { x: 100, y: 50 },
        { x: 50, y: 100 },
        { x: 0, y: 50 },
      ],
      getHandles: () => [
        {
          id: "top",
          position: Position.Top,
          style: { top: "0%", left: "50%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "bottom",
          position: Position.Bottom,
          style: {
            top: "100%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          },
        },
        {
          id: "left",
          position: Position.Left,
          style: { top: "50%", left: "0%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "right",
          position: Position.Right,
          style: {
            top: "50%",
            left: "100%",
            transform: "translate(-50%, -50%)",
          },
        },
      ],
    },
    {
      id: "basic-diamond",
      name: "Diamond",
      icon: {
        viewBox: "0 0 100 100",
        path: "M50 0 L100 50 L50 100 L0 50 Z",
      },
      anchors: [
        { x: 50, y: 0 },
        { x: 100, y: 50 },
        { x: 50, y: 100 },
        { x: 0, y: 50 },
      ],
      getHandles: () => [
        {
          id: "top",
          position: Position.Top,
          style: { top: "0%", left: "50%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "bottom",
          position: Position.Bottom,
          style: {
            top: "100%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          },
        },
        {
          id: "left",
          position: Position.Left,
          style: { top: "50%", left: "0%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "right",
          position: Position.Right,
          style: {
            top: "50%",
            left: "100%",
            transform: "translate(-50%, -50%)",
          },
        },
      ],
    },
    {
      id: "basic-triangle-up",
      name: "Triangle Up",
      icon: {
        viewBox: "0 0 100 86.6",
        path: "M50 0 L100 86.6 H0 Z",
      },
    },
    {
      id: "basic-triangle-down",
      name: "Triangle Down",
      icon: {
        viewBox: "0 0 100 86.6",
        path: "M0 0 H100 L50 86.6 Z",
      },
    },
    {
      id: "basic-ellipse",
      name: "Ellipse",
      icon: {
        viewBox: "0 0 100 60",
        path: "M50 0 C22 0 0 27 0 30 C0 33 22 60 50 60 C78 60 100 33 100 30 C100 27 78 0 50 0 Z",
      },
    },
    {
      id: "basic-pentagon",
      name: "Pentagon",
      icon: {
        viewBox: "0 0 100 95.1",
        path: "M50 0 L100 36.3 L80.9 95.1 H19.1 L0 36.3 Z",
      },
    },
    {
      id: "basic-octagon",
      name: "Octagon",
      icon: {
        viewBox: "0 0 100 100",
        path: "M30 0 H70 L100 30 V70 L70 100 H30 L0 70 V30 Z",
      },
    },
    {
      id: "basic-plus",
      name: "Plus",
      icon: {
        viewBox: "0 0 100 100",
        path: "M40 0 H60 V40 H100 V60 H60 V100 H40 V60 H0 V40 H40 Z",
      },
    },
    {
      id: "basic-left-arrow",
      name: "Left Arrow",
      icon: {
        viewBox: "0 0 100 60",
        path: "M100 20 H30 V0 L0 30 L30 60 V40 H100 Z",
      },
    },
    {
      id: "basic-right-arrow",
      name: "Right Arrow",
      icon: {
        viewBox: "0 0 100 60",
        path: "M0 20 H70 V0 L100 30 L70 60 V40 H0 Z",
      },
    },
    {
      id: "basic-chevron",
      name: "Chevron",
      icon: {
        viewBox: "0 0 100 100",
        path: "M0 0 L50 50 L0 100",
      },
    },
    {
      id: "basic-star",
      name: "Star",
      icon: {
        viewBox: "0 0 100 100",
        path: "M50 0 L61 35 H98 L68 57 L79 91 L50 70 L21 91 L32 57 L2 35 H39 Z",
      },
    },
    {
      id: "basic-chat-bubble",
      name: "Chat Bubble",
      icon: {
        viewBox: "0 0 100 100",
        path: "M0 0 H100 V80 H30 L0 100 Z",
      },
    },
  ],

  "UML Use Case Diagram": [
    {
      id: "use-case",
      name: "Use Case",
      icon: {
        viewBox: "0 0 100 60",
        path: "M50 0 C22 0 0 27 0 30 C0 33 22 60 50 60 C78 60 100 33 100 30 C100 27 78 0 50 0 Z",
      },
    },
    {
      id: "actor",
      name: "Actor",
      icon: {
        viewBox: "0 0 100 140",
        // Use two arcs to draw a full circle for the head to avoid renderer inconsistencies
        path: "M50 20 m -20 0 a 20 20 0 1 0 40 0 a 20 20 0 1 0 -40 0 M50 40 V90 M20 60 H80 M50 90 L20 130 M50 90 L80 130",
        stroke: "#000",
        strokeWidth: 4,
        fill: "none",
      },
    },
    {
      id: "extension-point",
      name: "Extension Point",
      icon: {
        viewBox: "0 0 100 20",
        path: "M0 10 H100",
      },
    },
  ],

  "UML Sequence Diagram": [
    {
      id: "uml-seq-actor",
      name: "Actor",
      icon: {
        viewBox: "0 0 100 100",
        path: "M0 0 H100 V100 H0 Z",
        fill: "#ffffff",
        stroke: "#000000",
      },
    },
    {
      id: "uml-seq-lifeline",
      name: "Lifeline",
      icon: {
        viewBox: "0 0 100 100",
        path: "M50 0 V100",
        stroke: "#000000",
        strokeWidth: 2,
        strokeDasharray: "4 4",
      },
      anchors: [
        { x: 50, y: 0 },
        { x: 50, y: 100 },
      ],
      getHandles: () => {
        const handles = [];
        for (let i = 0; i <= 100; i += 5) {
          handles.push({
            id: `v-${i}`,
            position: Position.Left,
            style: { top: `${i}%`, left: "50%", transform: "translate(-50%, -50%)" },
          });
        }
        return handles;
      },
    },
    /*
    {
      id: "uml-seq-activation",
      name: "Activation",
      icon: {
        viewBox: "0 0 20 100",
        path: "M0 0 H20 V100 H0 Z",
        fill: "#ffffff",
      },
      anchors: [
        { x: 0, y: 0 }, { x: 20, y: 0 }, { x: 20, y: 100 }, { x: 0, y: 100 }
      ],
    },
    */
    {
      id: "uml-seq-note",
      name: "Note",
      icon: {
        viewBox: "0 0 100 100",
        path: "M0 0 H80 L100 20 V100 H0 Z M80 0 V20 H100",
        fill: "#ffff88",
        stroke: "#000000",
      },
    },
    {
      id: "uml-seq-boundary",
      name: "Boundary",
      icon: {
        viewBox: "0 0 100 100",
        path: "M10 0 H100 V100 H10 Z M0 20 H10 M0 80 H10",
        fill: "#ffffff",
      },
    },
  ],

  "UML Timing Diagram": [
    {
      id: "time-line",
      name: "Time Line",
      icon: {
        viewBox: "0 0 100 10",
        path: "M0 5 H100 M10 0 V10 M30 0 V10 M50 0 V10",
      },
    },
    {
      id: "state-transition",
      name: "State Transition",
      icon: {
        viewBox: "0 0 100 100",
        path: "M0 50 H50 V100 H100",
      },
    },
    {
      id: "timing-box",
      name: "Timing Box",
      icon: {
        viewBox: "0 0 100 50",
        path: "M0 0 H100 V50 H0 Z",
      },
    },
  ],

  "Data Structures": [
    {
      id: "dsa-array",
      name: "Array",
      icon: {
        viewBox: "0 0 100 25",
        path: "M0 0 H20 V25 H0 Z M25 0 H45 V25 H25 Z M50 0 H70 V25 H50 Z M75 0 H95 V25 H75 Z",
      },
      slotGrid: {
        rows: 1,
        cols: 4,
        margin: 3,
        inset: { top: 10, right: 2, bottom: 10, left: 2 },
      },
      slotDefaults: { format: "{i}" },
    },
    {
      id: "dsa-linked-list",
      name: "Linked List",
      icon: {
        viewBox: "0 0 120 25",
        path: "M0 0 H20 V25 H0 Z M20 12.5 H35 M35 12.5 L30 7.5 M35 12.5 L30 17.5 M40 0 H60 V25 H40 Z M60 12.5 H75 M75 12.5 L70 7.5 M75 12.5 L70 17.5 M80 0 H100 V25 H80 Z",
      },
      slotGrid: {
        rows: 1,
        cols: 3,
        margin: 3,
        inset: { top: 10, right: 2, bottom: 10, left: 2 },
      },
      slotDefaults: { format: "{n}" },
    },
    {
      id: "dsa-stack",
      name: "Stack",
      icon: {
        viewBox: "0 0 50 100",
        path: "M0 0 V100 H50 V0 M0 25 H50 M0 50 H50 M0 75 H50",
      },
      slotGrid: {
        rows: 4,
        cols: 1,
        margin: 6,
        inset: { top: 4, right: 6, bottom: 4, left: 6 },
      },
      slotDefaults: { format: "{n}" },
    },
    {
      id: "dsa-queue",
      name: "Queue",
      icon: {
        viewBox: "0 0 100 40",
        path: "M0 10 V30 H80 V10 H0 M15 0 V10 M15 30 V40 M80 20 L100 20 M95 15 L100 20 L95 25",
      },
      slotGrid: {
        rows: 1,
        cols: 3,
        margin: 4,
        inset: { top: 20, right: 20, bottom: 20, left: 4 },
      },
      slotDefaults: { format: "{n}" },
    },
    {
      id: "dsa-heap",
      name: "Heap",
      icon: {
        viewBox: "0 0 100 100",
        path: "M50 10 A10 10 0 1 1 49.9 10 M50 20 L30 40 M30 50 A10 10 0 1 1 29.9 50 M50 20 L70 40 M70 50 A10 10 0 1 1 69.9 50 M30 60 L20 80 M20 90 A10 10 0 1 1 19.9 90 M30 60 L40 80 M40 90 A10 10 0 1 1 39.9 90",
      },
    },
    {
      id: "dsa-priority-queue",
      name: "Priority Queue",
      icon: {
        viewBox: "0 0 100 60",
        path: "M10 30 L20 30 M30 10 L40 10 M50 30 L60 30 M70 10 L80 10 M90 30 L100 30 M40 10 L50 30 L30 10 M60 30 L70 10 L50 30 M80 10 L90 30 L70 10 M20 30 L30 10 M10 30 L20 50 L30 30",
      },
    },
    {
      id: "dsa-circular-buffer",
      name: "Circular Buffer",
      icon: {
        viewBox: "0 0 100 100",
        path: "M50 10 A 40 40 0 1 1 10 50 M10 50 L0 40 M10 50 L20 40 M50 10 A 40 40 0 1 0 90 50",
      },
    },
    {
      id: "dsa-hash-table",
      name: "Hash Table",
      icon: {
        viewBox: "0 0 100 100",
        path: "M0 0 H100 V100 H0 Z M0 25 H100 M0 50 H100 M0 75 H100 M25 0 V100 M50 0 V100 M75 0 V100",
      },
      slotGrid: {
        rows: 4,
        cols: 4,
        margin: 3,
        inset: { top: 2, right: 2, bottom: 2, left: 2 },
      },
      slotDefaults: { format: "r{r}c{c}" },
    },
    {
      id: "dsa-binary-tree",
      name: "Binary Tree",
      icon: {
        viewBox: "0 0 100 100",
        path: "M50 10 A10 10 0 1 1 49.9 10 M50 20 L30 40 M30 50 A10 10 0 1 1 29.9 50 M50 20 L70 40 M70 50 A10 10 0 1 1 69.9 50 M30 60 L20 80 M20 90 A10 10 0 1 1 19.9 90 M30 60 L40 80 M40 90 A10 10 0 1 1 39.9 90",
      },
    },
    {
      id: "dsa-heap-2",
      name: "Heap",
      icon: {
        viewBox: "0 0 100 100",
        path: "M50 10 A10 10 0 1 1 49.9 10 M50 20 L30 40 M30 50 A10 10 0 1 1 29.9 50 M50 20 L70 40 M70 50 A10 10 0 1 1 69.9 50 M30 60 L20 80 M20 90 A10 10 0 1 1 19.9 90 M30 60 L40 80 M40 90 A10 10 0 1 1 39.9 90 M70 60 L60 80 M60 90 A10 10 0 1 1 59.9 90",
      },
    },
    {
      id: "dsa-graph",
      name: "Graph",
      icon: {
        viewBox: "0 0 100 100",
        path: "M10 50 A10 10 0 1 1 9.9 50 M20 50 L40 30 M50 20 A10 10 0 1 1 49.9 20 M60 20 L80 30 M90 40 A10 10 0 1 1 89.9 40 M90 60 L80 70 M90 80 A10 10 0 1 1 89.9 80 M50 80 L40 70 M30 60 A10 10 0 1 1 29.9 60 M40 70 L20 50",
      },
    },
    {
      id: "dsa-red-black-tree",
      name: "Red-Black Tree",
      icon: {
        viewBox: "0 0 100 100",
        path: "M50 10 A10 10 0 1 1 49.9 10 M50 20 L30 40 M30 50 A10 10 0 1 1 29.9 50 M50 20 L70 40 M70 50 A10 10 0 1 1 69.9 50 M30 60 L20 80 M20 90 A10 10 0 1 1 19.9 90",
      },
    },
    {
      id: "dsa-trie",
      name: "Trie",
      icon: {
        viewBox: "0 0 100 100",
        path: "M50 10 A10 10 0 1 1 49.9 10 M50 20 L30 40 M30 50 A10 10 0 1 1 29.9 50 M50 20 L50 40 M50 50 A10 10 0 1 1 49.9 50 M50 20 L70 40 M70 50 A10 10 0 1 1 69.9 50",
      },
    },
    {
      id: "dsa-bitmask",
      name: "Bitmask",
      icon: {
        viewBox: "0 0 100 100",
        path: "M0 0 H100 V100 H0 Z M12.5 25 H25 V75 H12.5 Z M37.5 25 H50 V75 H37.5 Z M62.5 25 H75 V75 H62.5 Z M87.5 25 H100 V75 H87.5 Z",
      },
      slotGrid: {
        rows: 1,
        cols: 4,
        margin: 6,
        inset: { top: 20, right: 6, bottom: 20, left: 6 },
      },
      slotDefaults: { format: "0" },
    },
    {
      id: "dsa-state-table",
      name: "State Table",
      icon: {
        viewBox: "0 0 100 100",
        path: "M0 0 H100 V100 H0 Z M0 25 H100 M0 50 H100 M0 75 H100 M25 0 V100 M50 0 V100 M75 0 V100",
      },
      slotGrid: {
        rows: 4,
        cols: 4,
        margin: 3,
        inset: { top: 2, right: 2, bottom: 2, left: 2 },
      },
      slotDefaults: { format: "r{r}c{c}" },
    },
    {
      id: "dsa-doubly-linked-list",
      name: "Doubly Linked List",
      icon: {
        viewBox: "0 0 120 25",
        path: "M0 0 H20 V25 H0 Z M20 7.5 H35 M35 7.5 L30 2.5 M35 7.5 L30 12.5 M20 17.5 H35 M20 17.5 L25 12.5 M20 17.5 L25 22.5 M40 0 H60 V25 H40 Z M60 7.5 H75 M75 7.5 L70 2.5 M75 7.5 L70 12.5 M60 17.5 H75 M60 17.5 L65 12.5 M60 17.5 L65 22.5 M80 0 H100 V25 H80 Z",
      },
      slotGrid: {
        rows: 1,
        cols: 3,
        margin: 3,
        inset: { top: 10, right: 2, bottom: 10, left: 2 },
      },
      slotDefaults: { format: "{n}" },
    },
    {
      id: "dsa-red-black-tree-2",
      name: "Red-Black Tree",
      icon: {
        viewBox: "0 0 100 100",
        path: "M50 10 A10 10 0 1 1 49.9 10 M50 20 L30 40 M30 50 A10 10 0 1 1 29.9 50 M50 20 L70 40 M70 50 A10 10 0 1 1 69.9 50 M30 60 L20 80 M20 90 A10 10 0 1 1 19.9 90",
      },
    },
    {
      id: "dsa-task-control-block",
      name: "Task Control Block",
      icon: {
        viewBox: "0 0 100 100",
        path: "M10 30 H90 V90 H10 Z M20 40 H80 M20 50 H80 M20 60 H80 M20 70 H80 M20 80 H80",
      },
    },
    {
      id: "dsa-graph-adjacency-list",
      name: "Graph Adjacency List",
      icon: {
        viewBox: "0 0 100 100",
        path: "M0 0 H20 V100 H0 Z M30 10 H50 V30 H30 Z M60 10 H80 V30 H60 Z M30 40 H50 V60 H30 Z M60 40 H80 V60 H60 Z M30 70 H50 V90 H30 Z",
      },
      slotGrid: {
        rows: 3,
        cols: 2,
        margin: 3,
        inset: { top: 10, right: 10, bottom: 10, left: 30 },
      },
      slotDefaults: { format: "v{n}" },
    },
    {
      id: "dsa-interrupt-vector-table",
      name: "Interrupt Vector Table",
      icon: {
        viewBox: "0 0 100 100",
        path: "M0 0 H100 V100 H0 Z M0 25 H100 M0 50 H100 M0 75 H100 M25 0 V100 M50 0 V100 M75 0 V100",
      },
      slotGrid: {
        rows: 4,
        cols: 4,
        margin: 3,
        inset: { top: 2, right: 2, bottom: 2, left: 2 },
      },
      slotDefaults: { format: "r{r}c{c}" },
    },
    {
      id: "dsa-semaphore",
      name: "Semaphore",
      icon: {
        viewBox: "0 0 100 100",
        path: "M50 70 A20 20 0 0 0 50 30 A20 20 0 0 0 50 70 M30 50 H70 M50 30 V10 M40 10 H60",
      },
    },
    {
      id: "dsa-mutex",
      name: "Mutex",
      icon: {
        viewBox: "0 0 100 100",
        path: "M50 70 A20 20 0 0 0 50 30 A20 20 0 0 0 50 70 M30 50 H70 M50 30 V10 M40 10 H60",
      },
    },
    {
      id: "dsa-lru-cache",
      name: "LRU Cache",
      icon: {
        viewBox: "0 0 100 100",
        path: "M0 0 H100 V20 H0 Z M0 30 H100 V50 H0 Z M0 60 H100 V80 H0 Z",
      },
      slotGrid: {
        rows: 3,
        cols: 1,
        margin: 6,
        inset: { top: 6, right: 6, bottom: 6, left: 6 },
      },
      slotDefaults: { format: "{n}" },
    },
    {
      id: "dsa-buffer-pool",
      name: "Buffer Pool",
      icon: {
        viewBox: "0 0 100 100",
        path: "M0 0 H100 V100 H0 Z M0 25 H100 M0 50 H100 M0 75 H100 M25 0 V100 M50 0 V100 M75 0 V100",
      },
      slotGrid: {
        rows: 4,
        cols: 4,
        margin: 3,
        inset: { top: 2, right: 2, bottom: 2, left: 2 },
      },
      slotDefaults: { format: "r{r}c{c}" },
    },
  ],

  "Activity & State Diagram": [
    {
      id: "activity",
      name: "Activity",
      icon: {
        viewBox: "0 0 100 60",
        path: "M0 0 H100 V60 H0 Z",
      },
      anchors: [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 30 },
        { x: 100, y: 60 },
        { x: 50, y: 60 },
        { x: 0, y: 60 },
        { x: 0, y: 30 },
      ],
      getHandles: () => [
        {
          id: "top",
          position: Position.Top,
          style: { top: "0%", left: "50%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "bottom",
          position: Position.Bottom,
          style: {
            top: "100%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          },
        },
        {
          id: "left",
          position: Position.Left,
          style: { top: "50%", left: "0%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "right",
          position: Position.Right,
          style: {
            top: "50%",
            left: "100%",
            transform: "translate(-50%, -50%)",
          },
        },
      ],
    },
    {
      id: "decision",
      name: "Decision",
      icon: {
        viewBox: "0 0 100 100",
        path: "M50 0 L100 50 L50 100 L0 50 Z",
      },
      anchors: [
        { x: 50, y: 0 },
        { x: 100, y: 50 },
        { x: 50, y: 100 },
        { x: 0, y: 50 },
      ],
      getHandles: () => [
        {
          id: "top",
          position: Position.Top,
          style: { top: "0%", left: "50%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "bottom",
          position: Position.Bottom,
          style: {
            top: "100%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          },
        },
        {
          id: "left",
          position: Position.Left,
          style: { top: "50%", left: "0%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "right",
          position: Position.Right,
          style: {
            top: "50%",
            left: "100%",
            transform: "translate(-50%, -50%)",
          },
        },
      ],
    },
    {
      id: "start-state",
      name: "Start",
      icon: {
        viewBox: "0 0 100 100",
        path: "M50 0 A50 50 0 1 0 50.001 0 Z",
      },
      anchors: [
        { x: 50, y: 0 },
        { x: 100, y: 50 },
        { x: 50, y: 100 },
        { x: 0, y: 50 },
      ],
      getHandles: () => [
        {
          id: "top",
          position: Position.Top,
          style: { top: "0%", left: "50%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "bottom",
          position: Position.Bottom,
          style: {
            top: "100%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          },
        },
        {
          id: "left",
          position: Position.Left,
          style: { top: "50%", left: "0%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "right",
          position: Position.Right,
          style: {
            top: "50%",
            left: "100%",
            transform: "translate(-50%, -50%)",
          },
        },
      ],
    },
    {
      id: "end-state",
      name: "End",
      icon: {
        viewBox: "0 0 100 100",
        path: "M50 0 A50 50 0 1 0 50.001 0 Z M20 20 A30 30 0 1 0 20.001 20 Z",
      },
      anchors: [
        { x: 50, y: 0 },
        { x: 100, y: 50 },
        { x: 50, y: 100 },
        { x: 0, y: 50 },
      ],
      getHandles: () => [
        {
          id: "top",
          position: Position.Top,
          style: { top: "0%", left: "50%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "bottom",
          position: Position.Bottom,
          style: {
            top: "100%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          },
        },
        {
          id: "left",
          position: Position.Left,
          style: { top: "50%", left: "0%", transform: "translate(-50%, -50%)" },
        },
        {
          id: "right",
          position: Position.Right,
          style: {
            top: "50%",
            left: "100%",
            transform: "translate(-50%, -50%)",
          },
        },
      ],
    },
    {
      id: "note",
      name: "Note",
      icon: {
        viewBox: "0 0 100 100",
        path: "M0 0 H70 L100 30 V100 H0 Z M70 0 V30 H100",
      },
    },
  ],
};

const findShapeConfigById = (shapeId) => {
  if (!shapeId) return null;
  for (const group of Object.values(shapeData)) {
    const match = group.find((shape) => shape.id === shapeId);
    if (match) return match;
  }
  return null;
};

const buildSlotValues = (shape, existing = []) => {
  const slotGrid = shape?.slotGrid;
  if (!slotGrid?.rows || !slotGrid?.cols) return [];

  const total = slotGrid.rows * slotGrid.cols;
  const values = new Array(total);

  for (let idx = 0; idx < total; idx += 1) {
    if (
      Array.isArray(existing) &&
      idx < existing.length &&
      existing[idx] !== undefined
    ) {
      values[idx] = existing[idx];
      continue;
    }

    values[idx] = "";
  }

  return values;
};

// Shared node base styles
const baseNodeStyles = (data) => ({
  width: "100%",
  height: "100%",
  color: data?.text || "#000000",
  fontSize: data?.fontSize || 12,
  transform: `rotate(${data?.rotation || 0}deg)`,
  transformOrigin: "center center",
});

const HANDLE_POSITIONS = {
  top: { top: 0, left: "50%", transform: "translate(-50%, -50%)" },
  right: { top: "50%", right: 0, transform: "translate(50%, -50%)" },
  bottom: { bottom: 0, left: "50%", transform: "translate(-50%, 50%)" },
  left: { top: "50%", left: 0, transform: "translate(-50%, -50%)" },
};

const baseHandleStyle = (data) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: data?.stroke || "#27374D",
  border: `2px solid ${data?.fill || "#ffffff"}`,
});

// Process (rectangle)
function ProcessNode({ id, data, selected }) {
  const updateNodeData = useNodeDataUpdate();
  const [val, setVal] = useState(data?.label ?? "Text");
  const commit = (next) => {
    updateNodeData(id, (n) => ({
      ...n,
      data: { ...n.data, label: next, editing: false },
    }));
  };

  return (
    <div
      style={{
        ...baseNodeStyles(data),
        background: data?.fill || "#ffffff",
        border: `${data?.strokeWidth ?? 2}px solid ${data?.stroke || "#000000"}`,
        borderRadius: 6,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
      onDoubleClick={() =>
        updateNodeData(id, (n) => ({
          ...n,
          data: { ...n.data, editing: true },
        }))
      }
    >
      <Handle
        id="top-in"
        type="target"
        position={Position.Top}
        style={{ ...HANDLE_POSITIONS.top, ...baseHandleStyle(data) }}
      />
      <Handle
        id="right-in"
        type="target"
        position={Position.Right}
        style={{ ...HANDLE_POSITIONS.right, ...baseHandleStyle(data) }}
      />
      <Handle
        id="bottom-in"
        type="target"
        position={Position.Bottom}
        style={{ ...HANDLE_POSITIONS.bottom, ...baseHandleStyle(data) }}
      />
      <Handle
        id="left-in"
        type="target"
        position={Position.Left}
        style={{ ...HANDLE_POSITIONS.left, ...baseHandleStyle(data) }}
      />
      <Handle
        id="top-out"
        type="source"
        position={Position.Top}
        style={{ ...HANDLE_POSITIONS.top, ...baseHandleStyle(data) }}
      />
      <Handle
        id="right-out"
        type="source"
        position={Position.Right}
        style={{ ...HANDLE_POSITIONS.right, ...baseHandleStyle(data) }}
      />
      <Handle
        id="bottom-out"
        type="source"
        position={Position.Bottom}
        style={{ ...HANDLE_POSITIONS.bottom, ...baseHandleStyle(data) }}
      />
      <Handle
        id="left-out"
        type="source"
        position={Position.Left}
        style={{ ...HANDLE_POSITIONS.left, ...baseHandleStyle(data) }}
      />
      {data?.editing ? (
        <input
          className="nodrag nopan nowheel"
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={() => commit(val)}
          onKeyDown={(e) => e.key === "Enter" && commit(val)}
          onMouseDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          style={{
            width: "calc(100% - 12px)",
            border: "1px solid #ccc",
            borderRadius: 4,
            padding: "4px 6px",
            fontSize: 12,
            position: "relative",
            zIndex: 5,
            background: "#fff",
            color: "#000",
            pointerEvents: "all",
            textAlign: "center",
          }}
        />
      ) : (
        <span
          style={{
            color: data?.text || "#000",
            fontSize: data?.fontSize || 12,
            textAlign: "center",
            margin: "0 12px",
            display: "block",
          }}
        >
          {data?.label ?? "Text"}
        </span>
      )}
      <NodeResizer
        isVisible={selected}
        minWidth={80}
        minHeight={40}
        handleStyle={{
          background: data?.stroke || "#000",
          width: 12,
          height: 12,
          borderRadius: 2,
          zIndex: 100
        }}
        lineStyle={{ border: "1px solid #0041d0" }}
      />
    </div>
  );
}

// Decision (diamond)
function DecisionNode({ id, data, selected }) {
  const updateNodeData = useNodeDataUpdate();
  const [val, setVal] = useState(data?.label ?? "Text");
  const commit = (next) => {
    updateNodeData(id, (n) => ({
      ...n,
      data: { ...n.data, label: next, editing: false },
    }));
  };
  const fill = data?.fill || "#ffffff";
  const stroke = data?.stroke || "#000000";
  const sw = data?.strokeWidth ?? 2;

  return (
    <div
      style={{ ...baseNodeStyles(data), position: "relative" }}
      onDoubleClick={() =>
        updateNodeData(id, (n) => ({
          ...n,
          data: { ...n.data, editing: true },
        }))
      }
    >
      {/* Diamond shape filling the bounds so handles align to corners */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <polygon
          points="50,0 100,50 50,100 0,50"
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {/* Label overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 6,
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        {data?.editing ? (
          <input
            className="nodrag nopan nowheel"
            autoFocus
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={() => commit(val)}
            onKeyDown={(e) => e.key === "Enter" && commit(val)}
            onMouseDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              border: "1px solid #ccc",
              borderRadius: 4,
              padding: "4px 6px",
              fontSize: 12,
              position: "relative",
              zIndex: 5,
              background: "#fff",
              color: "#000",
              pointerEvents: "all",
              textAlign: "center",
            }}
          />
        ) : (
          <span
            style={{
              color: data?.text || "#000",
              fontSize: data?.fontSize || 12,
              textAlign: "center",
              display: "block",
              width: "100%",
            }}
          >
            {data?.label ?? "Text"}
          </span>
        )}
      </div>
      <Handle
        id="top-in"
        type="target"
        position={Position.Top}
        style={{ ...HANDLE_POSITIONS.top, ...baseHandleStyle(data) }}
      />
      <Handle
        id="right-in"
        type="target"
        position={Position.Right}
        style={{ ...HANDLE_POSITIONS.right, ...baseHandleStyle(data) }}
      />
      <Handle
        id="bottom-in"
        type="target"
        position={Position.Bottom}
        style={{ ...HANDLE_POSITIONS.bottom, ...baseHandleStyle(data) }}
      />
      <Handle
        id="left-in"
        type="target"
        position={Position.Left}
        style={{ ...HANDLE_POSITIONS.left, ...baseHandleStyle(data) }}
      />
      <Handle
        id="top-out"
        type="source"
        position={Position.Top}
        style={{ ...HANDLE_POSITIONS.top, ...baseHandleStyle(data) }}
      />
      <Handle
        id="right-out"
        type="source"
        position={Position.Right}
        style={{ ...HANDLE_POSITIONS.right, ...baseHandleStyle(data) }}
      />
      <Handle
        id="bottom-out"
        type="source"
        position={Position.Bottom}
        style={{ ...HANDLE_POSITIONS.bottom, ...baseHandleStyle(data) }}
      />
      <Handle
        id="left-out"
        type="source"
        position={Position.Left}
        style={{ ...HANDLE_POSITIONS.left, ...baseHandleStyle(data) }}
      />
      <NodeResizer
        isVisible={selected}
        minWidth={80}
        minHeight={80}
        handleStyle={{
          background: data?.stroke || "#000",
          width: 12,
          height: 12,
          zIndex: 100,
        }}
        lineStyle={{ border: "1px solid #0041d0" }}
      />
    </div>
  );
}

// Terminator (rounded rectangle)
function TerminatorNode({ id, data, selected }) {
  const updateNodeData = useNodeDataUpdate();
  const [val, setVal] = useState(data?.label ?? "Text");
  const commit = (next) => {
    updateNodeData(id, (n) => ({
      ...n,
      data: { ...n.data, label: next, editing: false },
    }));
  };

  return (
    <div
      style={{
        ...baseNodeStyles(data),
        background: data?.fill || "#ffffff",
        border: `${data?.strokeWidth ?? 2}px solid ${data?.stroke || "#000000"}`,
        borderRadius: 24,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
      onDoubleClick={() =>
        updateNodeData(id, (n) => ({
          ...n,
          data: { ...n.data, editing: true },
        }))
      }
    >
      <Handle
        id="top-in"
        type="target"
        position={Position.Top}
        style={{ ...HANDLE_POSITIONS.top, ...baseHandleStyle(data) }}
      />
      <Handle
        id="right-in"
        type="target"
        position={Position.Right}
        style={{ ...HANDLE_POSITIONS.right, ...baseHandleStyle(data) }}
      />
      <Handle
        id="bottom-in"
        type="target"
        position={Position.Bottom}
        style={{ ...HANDLE_POSITIONS.bottom, ...baseHandleStyle(data) }}
      />
      <Handle
        id="left-in"
        type="target"
        position={Position.Left}
        style={{ ...HANDLE_POSITIONS.left, ...baseHandleStyle(data) }}
      />
      <Handle
        id="top-out"
        type="source"
        position={Position.Top}
        style={{ ...HANDLE_POSITIONS.top, ...baseHandleStyle(data) }}
      />
      <Handle
        id="right-out"
        type="source"
        position={Position.Right}
        style={{ ...HANDLE_POSITIONS.right, ...baseHandleStyle(data) }}
      />
      <Handle
        id="bottom-out"
        type="source"
        position={Position.Bottom}
        style={{ ...HANDLE_POSITIONS.bottom, ...baseHandleStyle(data) }}
      />
      <Handle
        id="left-out"
        type="source"
        position={Position.Left}
        style={{ ...HANDLE_POSITIONS.left, ...baseHandleStyle(data) }}
      />
      {data?.editing ? (
        <input
          className="nodrag nopan nowheel"
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={() => commit(val)}
          onKeyDown={(e) => e.key === "Enter" && commit(val)}
          onMouseDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          style={{
            width: "calc(100% - 12px)",
            border: "1px solid #ccc",
            borderRadius: 4,
            padding: "4px 6px",
            fontSize: 12,
            position: "relative",
            zIndex: 5,
            background: "#fff",
            color: "#000",
            pointerEvents: "all",
            textAlign: "center",
          }}
        />
      ) : (
        <span
          style={{
            color: data?.text || "#000",
            fontSize: data?.fontSize || 12,
            textAlign: "center",
          }}
        >
          {data?.label ?? "Text"}
        </span>
      )}
      <NodeResizer
        isVisible={selected}
        minWidth={80}
        minHeight={40}
        handleStyle={{
          background: data?.stroke || "#000",
          width: 12,
          height: 12,
          borderRadius: 2,
          zIndex: 100
        }}
        lineStyle={{ border: "1px solid #0041d0" }}
      />
    </div>
  );
}

// Ellipse (circle/oval)
function EllipseNode({ id, data, selected }) {
  const updateNodeData = useNodeDataUpdate();
  const [val, setVal] = useState(data?.label ?? "Text");
  const commit = (next) => {
    updateNodeData(id, (n) => ({
      ...n,
      data: { ...n.data, label: next, editing: false },
    }));
  };

  return (
    <div
      style={{
        ...baseNodeStyles(data),
        background: data?.fill || "#ffffff",
        border: `${data?.strokeWidth ?? 2}px solid ${data?.stroke || "#000000"}`,
        borderRadius: "50%",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
      onDoubleClick={() =>
        updateNodeData(id, (n) => ({
          ...n,
          data: { ...n.data, editing: true },
        }))
      }
    >
      <Handle
        id="top-in"
        type="target"
        position={Position.Top}
        style={{ ...HANDLE_POSITIONS.top, ...baseHandleStyle(data) }}
      />
      <Handle
        id="right-in"
        type="target"
        position={Position.Right}
        style={{ ...HANDLE_POSITIONS.right, ...baseHandleStyle(data) }}
      />
      <Handle
        id="bottom-in"
        type="target"
        position={Position.Bottom}
        style={{ ...HANDLE_POSITIONS.bottom, ...baseHandleStyle(data) }}
      />
      <Handle
        id="left-in"
        type="target"
        position={Position.Left}
        style={{ ...HANDLE_POSITIONS.left, ...baseHandleStyle(data) }}
      />
      <Handle
        id="top-out"
        type="source"
        position={Position.Top}
        style={{ ...HANDLE_POSITIONS.top, ...baseHandleStyle(data) }}
      />
      <Handle
        id="right-out"
        type="source"
        position={Position.Right}
        style={{ ...HANDLE_POSITIONS.right, ...baseHandleStyle(data) }}
      />
      <Handle
        id="bottom-out"
        type="source"
        position={Position.Bottom}
        style={{ ...HANDLE_POSITIONS.bottom, ...baseHandleStyle(data) }}
      />
      <Handle
        id="left-out"
        type="source"
        position={Position.Left}
        style={{ ...HANDLE_POSITIONS.left, ...baseHandleStyle(data) }}
      />
      {data?.editing ? (
        <input
          className="nodrag nopan nowheel"
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={() => commit(val)}
          onKeyDown={(e) => e.key === "Enter" && commit(val)}
          onMouseDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          style={{
            width: "calc(100% - 12px)",
            border: "1px solid #ccc",
            borderRadius: 4,
            padding: "4px 6px",
            fontSize: 12,
            position: "relative",
            zIndex: 5,
            background: "#fff",
            color: "#000",
            pointerEvents: "all",
          }}
        />
      ) : (
        <span
          style={{
            color: data?.text || "#000",
            fontSize: data?.fontSize || 12,
            textAlign: "center",
          }}
        >
          {data?.label ?? "Text"}
        </span>
      )}
      <NodeResizer
        isVisible={selected}
        minWidth={60}
        minHeight={60}
        handleStyle={{
          background: data?.stroke || "#000",
          width: 12,
          height: 12,
          zIndex: 100,
        }}
        lineStyle={{ border: "1px solid #0041d0" }}
      />
    </div>
  );
}

// Data (parallelogram)
function DataNode({ id, data, selected }) {
  const updateNodeData = useNodeDataUpdate();
  const [val, setVal] = useState(data?.label ?? "Text");
  const commit = (next) => {
    updateNodeData(id, (n) => ({
      ...n,
      data: { ...n.data, label: next, editing: false },
    }));
  };

  return (
    <div
      style={{ ...baseNodeStyles(data), position: "relative" }}
      onDoubleClick={() =>
        updateNodeData(id, (n) => ({
          ...n,
          data: { ...n.data, editing: true },
        }))
      }
    >
      <div
        style={{
          width: "80%",
          height: "70%",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) skewX(-20deg)",
          background: data?.fill || "#ffffff",
          border: `${data?.strokeWidth ?? 2}px solid ${data?.stroke || "#000000"}`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 6,
          pointerEvents: "none",
        }}
      >
        {data?.editing ? (
          <input
            className="nodrag nopan nowheel"
            autoFocus
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={() => commit(val)}
            onKeyDown={(e) => e.key === "Enter" && commit(val)}
            onMouseDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              border: "1px solid #ccc",
              borderRadius: 4,
              padding: "4px 6px",
              fontSize: 12,
              position: "relative",
              zIndex: 5,
              background: "#fff",
              color: "#000",
              pointerEvents: "all",
              textAlign: "center",
            }}
          />
        ) : (
          <span
            style={{
              color: data?.text || "#000",
              fontSize: data?.fontSize || 12,
            }}
          >
            {data?.label ?? "Text"}
          </span>
        )}
      </div>
      <Handle id="top-in" type="target" position={Position.Top} />
      <Handle id="right-in" type="target" position={Position.Right} />
      <Handle id="bottom-in" type="target" position={Position.Bottom} />
      <Handle id="left-in" type="target" position={Position.Left} />
      <Handle id="top-out" type="source" position={Position.Top} />
      <Handle id="right-out" type="source" position={Position.Right} />
      <Handle id="bottom-out" type="source" position={Position.Bottom} />
      <Handle id="left-out" type="source" position={Position.Left} />
      <NodeResizer
        isVisible={selected}
        minWidth={80}
        minHeight={40}
        handleStyle={{
          background: data?.stroke || "#000",
          width: 12,
          height: 12,
          zIndex: 100,
        }}
        lineStyle={{ border: "1px solid #0041d0" }}
      />
    </div>
  );
}

// Database (cylinder)
function DatabaseNode({ id, data, selected }) {
  const updateNodeData = useNodeDataUpdate();
  const [val, setVal] = useState(data?.label ?? "Text");
  const commit = (next) => {
    updateNodeData(id, (n) => ({
      ...n,
      data: { ...n.data, label: next, editing: false },
    }));
  };
  const fill = data?.fill || "#ffffff";
  const stroke = data?.stroke || "#000000";
  const sw = data?.strokeWidth ?? 2;
  return (
    <div
      style={{ ...baseNodeStyles(data), position: "relative" }}
      onDoubleClick={() =>
        updateNodeData(id, (n) => ({
          ...n,
          data: { ...n.data, editing: true },
        }))
      }
    >
      <svg
        viewBox="0 0 160 80"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <ellipse
          cx="80"
          cy="15"
          rx="70"
          ry="12"
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
        <rect
          x="10"
          y="15"
          width="140"
          height="50"
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
        <ellipse
          cx="80"
          cy="65"
          rx="70"
          ry="12"
          fill="none"
          stroke={stroke}
          strokeWidth={sw}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 6,
          pointerEvents: "none",
        }}
      >
        {data?.editing ? (
          <input
            className="nodrag nopan nowheel"
            autoFocus
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={() => commit(val)}
            onKeyDown={(e) => e.key === "Enter" && commit(val)}
            onMouseDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              border: "1px solid #ccc",
              borderRadius: 4,
              padding: "4px 6px",
              fontSize: 12,
              position: "relative",
              zIndex: 5,
              background: "#fff",
              color: "#000",
              pointerEvents: "all",
            }}
          />
        ) : (
          <span
            style={{
              color: data?.text || "#000",
              fontSize: data?.fontSize || 12,
              textAlign: "center",
              display: "block",
              width: "100%",
            }}
          >
            {data?.label ?? "Database"}
          </span>
        )}
      </div>
      <Handle
        id="top-in"
        type="target"
        position={Position.Top}
        style={HANDLE_POSITIONS.top}
      />
      <Handle
        id="right-in"
        type="target"
        position={Position.Right}
        style={HANDLE_POSITIONS.right}
      />
      <Handle
        id="bottom-in"
        type="target"
        position={Position.Bottom}
        style={HANDLE_POSITIONS.bottom}
      />
      <Handle
        id="left-in"
        type="target"
        position={Position.Left}
        style={HANDLE_POSITIONS.left}
      />
      <Handle
        id="top-out"
        type="source"
        position={Position.Top}
        style={HANDLE_POSITIONS.top}
      />
      <Handle
        id="right-out"
        type="source"
        position={Position.Right}
        style={HANDLE_POSITIONS.right}
      />
      <Handle
        id="bottom-out"
        type="source"
        position={Position.Bottom}
        style={HANDLE_POSITIONS.bottom}
      />
      <Handle
        id="left-out"
        type="source"
        position={Position.Left}
        style={HANDLE_POSITIONS.left}
      />
      <NodeResizer
        isVisible={selected}
        minWidth={80}
        minHeight={60}
        handleStyle={{
          background: stroke,
          width: 12,
          height: 12,
          zIndex: 100,
        }}
        lineStyle={{ border: "1px solid #0041d0" }}
      />
    </div>
  );
}

// Manual Input (trapezoid)
function ManualInputNode({ id, data, selected }) {
  const updateNodeData = useNodeDataUpdate();
  const [val, setVal] = useState(data?.label ?? "Text");
  const commit = (next) => {
    updateNodeData(id, (n) => ({
      ...n,
      data: { ...n.data, label: next, editing: false },
    }));
  };
  const fill = data?.fill || "#ffffff";
  const stroke = data?.stroke || "#000000";
  const sw = data?.strokeWidth ?? 2;
  return (
    <div
      style={{ ...baseNodeStyles(data), position: "relative" }}
      onDoubleClick={() =>
        updateNodeData(id, (n) => ({
          ...n,
          data: { ...n.data, editing: true },
        }))
      }
    >
      <svg
        viewBox="0 0 160 80"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <polygon
          points="20,5 155,5 140,75 5,75"
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 6,
          pointerEvents: "none",
        }}
      >
        {data?.editing ? (
          <input
            className="nodrag nopan nowheel"
            autoFocus
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={() => commit(val)}
            onKeyDown={(e) => e.key === "Enter" && commit(val)}
            onMouseDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              border: "1px solid #ccc",
              borderRadius: 4,
              padding: "4px 6px",
              fontSize: 12,
              position: "relative",
              zIndex: 5,
              background: "#fff",
              color: "#000",
              pointerEvents: "all",
            }}
          />
        ) : (
          <span
            style={{
              color: data?.text || "#000",
              fontSize: data?.fontSize || 12,
              textAlign: "center",
              display: "block",
              width: "100%",
            }}
          >
            {data?.label ?? "Manual Input"}
          </span>
        )}
      </div>
      <Handle id="top-in" type="target" position={Position.Top} />
      <Handle id="right-in" type="target" position={Position.Right} />
      <Handle id="bottom-in" type="target" position={Position.Bottom} />
      <Handle id="left-in" type="target" position={Position.Left} />
      <Handle id="top-out" type="source" position={Position.Top} />
      <Handle id="right-out" type="source" position={Position.Right} />
      <Handle id="bottom-out" type="source" position={Position.Bottom} />
      <Handle id="left-out" type="source" position={Position.Left} />
      <NodeResizer
        isVisible={selected}
        minWidth={80}
        minHeight={40}
        handleStyle={{
          background: stroke,
          width: 12,
          height: 12,
          zIndex: 100,
        }}
        lineStyle={{ border: "1px solid #0041d0" }}
      />
    </div>
  );
}

// Document (wavy bottom)
function DocumentNode({ id, data, selected }) {
  const updateNodeData = useNodeDataUpdate();
  const [val, setVal] = useState(data?.label ?? "Text");
  const commit = (next) => {
    updateNodeData(id, (n) => ({
      ...n,
      data: { ...n.data, label: next, editing: false },
    }));
  };
  const fill = data?.fill || "#0cfd48ff";
  const stroke = data?.stroke || "#000000";
  const sw = data?.strokeWidth ?? 2;
  return (
    <div
      style={{ ...baseNodeStyles(data), position: "relative" }}
      onDoubleClick={() =>
        updateNodeData(id, (n) => ({
          ...n,
          data: { ...n.data, editing: true },
        }))
      }
    >
      <svg
        viewBox="0 0 160 80"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <rect
          x="5"
          y="5"
          width="150"
          height="55"
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
        <path
          d="M5 60 C 35 50, 65 70, 95 60 S 155 70, 155 60"
          fill="none"
          stroke={stroke}
          strokeWidth={sw}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 6,
          pointerEvents: "none",
        }}
      >
        {data?.editing ? (
          <input
            className="nodrag nopan nowheel"
            autoFocus
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={() => commit(val)}
            onKeyDown={(e) => e.key === "Enter" && commit(val)}
            onMouseDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              border: "1px solid #ccc",
              borderRadius: 4,
              padding: "4px 6px",
              fontSize: 12,
              position: "relative",
              zIndex: 5,
              background: "#fff",
              color: "#000",
              pointerEvents: "all",
            }}
          />
        ) : (
          <span
            style={{
              color: data?.text || "#000",
              fontSize: data?.fontSize || 12,
              textAlign: "center",
              display: "block",
              width: "100%",
            }}
          >
            {data?.label ?? "Document"}
          </span>
        )}
      </div>
      <Handle
        id="top-in"
        type="target"
        position={Position.Top}
        style={HANDLE_POSITIONS.top}
      />
      <Handle
        id="right-in"
        type="target"
        position={Position.Right}
        style={HANDLE_POSITIONS.right}
      />
      <Handle
        id="bottom-in"
        type="target"
        position={Position.Bottom}
        style={HANDLE_POSITIONS.bottom}
      />
      <Handle
        id="left-in"
        type="target"
        position={Position.Left}
        style={HANDLE_POSITIONS.left}
      />
      <Handle
        id="top-out"
        type="source"
        position={Position.Top}
        style={HANDLE_POSITIONS.top}
      />
      <Handle
        id="right-out"
        type="source"
        position={Position.Right}
        style={HANDLE_POSITIONS.right}
      />
      <Handle
        id="bottom-out"
        type="source"
        position={Position.Bottom}
        style={HANDLE_POSITIONS.bottom}
      />
      <Handle
        id="left-out"
        type="source"
        position={Position.Left}
        style={HANDLE_POSITIONS.left}
      />
      <NodeResizer
        isVisible={selected}
        minWidth={80}
        minHeight={50}
        handleStyle={{
          background: stroke,
          width: 12,
          height: 12,
          zIndex: 100,
        }}
        lineStyle={{ border: "1px solid #0041d0" }}
      />
    </div>
  );
}

// Triangle
function TriangleNode({ id, data, selected }) {
  const updateNodeData = useNodeDataUpdate();
  const [val, setVal] = useState(data?.label ?? "Text");
  const commit = (next) => {
    updateNodeData(id, (n) => ({
      ...n,
      data: { ...n.data, label: next, editing: false },
    }));
  };
  const fill = data?.fill || "#ffffff";
  const stroke = data?.stroke || "#000000";
  const sw = data?.strokeWidth ?? 2;
  return (
    <div
      style={{ ...baseNodeStyles(data), position: "relative" }}
      onDoubleClick={() =>
        updateNodeData(id, (n) => ({
          ...n,
          data: { ...n.data, editing: true },
        }))
      }
    >
      <svg
        viewBox="0 0 160 80"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <polygon
          points="80,5 155,75 5,75"
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 6,
          pointerEvents: "none",
        }}
      >
        {data?.editing ? (
          <input
            className="nodrag nopan nowheel"
            autoFocus
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={() => commit(val)}
            onKeyDown={(e) => e.key === "Enter" && commit(val)}
            onMouseDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              border: "1px solid #ccc",
              borderRadius: 4,
              padding: "4px 6px",
              fontSize: 12,
              position: "relative",
              zIndex: 5,
              background: "#fff",
              color: "#000",
              pointerEvents: "all",
            }}
          />
        ) : (
          <span
            style={{
              color: data?.text || "#000",
              fontSize: data?.fontSize || 12,
              textAlign: "center",
              display: "block",
              width: "100%",
            }}
          >
            {data?.label ?? "Triangle"}
          </span>
        )}
      </div>
      <Handle
        id="top-in"
        type="target"
        position={Position.Top}
        style={HANDLE_POSITIONS.top}
      />
      <Handle
        id="right-in"
        type="target"
        position={Position.Right}
        style={HANDLE_POSITIONS.right}
      />
      <Handle
        id="bottom-in"
        type="target"
        position={Position.Bottom}
        style={HANDLE_POSITIONS.bottom}
      />
      <Handle
        id="left-in"
        type="target"
        position={Position.Left}
        style={HANDLE_POSITIONS.left}
      />
      <Handle
        id="top-out"
        type="source"
        position={Position.Top}
        style={HANDLE_POSITIONS.top}
      />
      <Handle
        id="right-out"
        type="source"
        position={Position.Right}
        style={HANDLE_POSITIONS.right}
      />
      <Handle
        id="bottom-out"
        type="source"
        position={Position.Bottom}
        style={HANDLE_POSITIONS.bottom}
      />
      <Handle
        id="left-out"
        type="source"
        position={Position.Left}
        style={HANDLE_POSITIONS.left}
      />
      <NodeResizer
        isVisible={selected}
        minWidth={60}
        minHeight={50}
        handleStyle={{
          background: stroke,
          width: 12,
          height: 12,
          zIndex: 100,
        }}
        lineStyle={{ border: "1px solid #0041d0" }}
      />
    </div>
  );
}

// Hexagon
function HexagonNode({ id, data, selected }) {
  const updateNodeData = useNodeDataUpdate();
  const [val, setVal] = useState(data?.label ?? "Text");
  const commit = (next) => {
    updateNodeData(id, (n) => ({
      ...n,
      data: { ...n.data, label: next, editing: false },
    }));
  };
  const fill = data?.fill || "#ffffff";
  const stroke = data?.stroke || "#000000";
  const sw = data?.strokeWidth ?? 2;
  return (
    <div
      style={{ ...baseNodeStyles(data), position: "relative" }}
      onDoubleClick={() =>
        updateNodeData(id, (n) => ({
          ...n,
          data: { ...n.data, editing: true },
        }))
      }
    >
      <svg
        viewBox="0 0 160 80"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <polygon
          points="30,5 130,5 155,40 130,75 30,75 5,40"
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 6,
          pointerEvents: "none",
        }}
      >
        {data?.editing ? (
          <input
            className="nodrag nopan nowheel"
            autoFocus
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={() => commit(val)}
            onKeyDown={(e) => e.key === "Enter" && commit(val)}
            onMouseDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              border: "1px solid #ccc",
              borderRadius: 4,
              padding: "4px 6px",
              fontSize: 12,
              position: "relative",
              zIndex: 5,
              background: "#fff",
              color: "#000",
              pointerEvents: "all",
            }}
          />
        ) : (
          <span
            style={{
              color: data?.text || "#000",
              fontSize: data?.fontSize || 12,
              textAlign: "center",
              display: "block",
              width: "100%",
            }}
          >
            {data?.label ?? "Hexagon"}
          </span>
        )}
      </div>
      <Handle
        id="top-in"
        type="target"
        position={Position.Top}
        style={{ top: 0, left: "50%" }}
      />
      <Handle
        id="right-in"
        type="target"
        position={Position.Right}
        style={{ top: "50%", right: 0 }}
      />
      <Handle
        id="bottom-in"
        type="target"
        position={Position.Bottom}
        style={{ bottom: 0, left: "50%" }}
      />
      <Handle
        id="left-in"
        type="target"
        position={Position.Left}
        style={{ top: "50%", left: 0 }}
      />
      <Handle
        id="top-out"
        type="source"
        position={Position.Top}
        style={{ top: 0, left: "50%" }}
      />
      <Handle
        id="right-out"
        type="source"
        position={Position.Right}
        style={{ top: "50%", right: 0 }}
      />
      <Handle
        id="bottom-out"
        type="source"
        position={Position.Bottom}
        style={{ bottom: 0, left: "50%" }}
      />
      <Handle
        id="left-out"
        type="source"
        position={Position.Left}
        style={{ top: "50%", left: 0 }}
      />
      <NodeResizer
        isVisible={selected}
        minWidth={80}
        minHeight={50}
        handleStyle={{
          background: stroke,
          width: 12,
          height: 12,
          zIndex: 100,
        }}
        lineStyle={{ border: "1px solid #0041d0" }}
      />
    </div>
  );
}

// Generic SVG stamp node (renders imported SVGs as resizable nodes)
function SvgStampNode({ id, data, selected }) {
  const updateNodeData = useNodeDataUpdate();
  return (
    <div
      style={{ ...baseNodeStyles(data), position: "relative" }}
      onDoubleClick={() =>
        updateNodeData(id, (n) => ({
          ...n,
          data: { ...n.data, editing: true },
        }))
      }
    >
      <Handle
        id="top-in"
        type="target"
        position={Position.Top}
        style={{ top: 0, left: "50%" }}
      />
      <Handle
        id="right-in"
        type="target"
        position={Position.Right}
        style={{ top: "50%", right: 0 }}
      />
      <Handle
        id="bottom-in"
        type="target"
        position={Position.Bottom}
        style={{ bottom: 0, left: "50%" }}
      />
      <Handle
        id="left-in"
        type="target"
        position={Position.Left}
        style={{ top: "50%", left: 0 }}
      />
      <Handle
        id="top-out"
        type="source"
        position={Position.Top}
        style={{ top: 0, left: "50%" }}
      />
      <Handle
        id="right-out"
        type="source"
        position={Position.Right}
        style={{ top: "50%", right: 0 }}
      />
      <Handle
        id="bottom-out"
        type="source"
        position={Position.Bottom}
        style={{ bottom: 0, left: "50%" }}
      />
      <Handle
        id="left-out"
        type="source"
        position={Position.Left}
        style={{ top: "50%", left: 0 }}
      />
      <img
        src={data?.src}
        alt={data?.label || "stamp"}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          pointerEvents: "none",
        }}
      />
      <NodeResizer
        isVisible={selected}
        minWidth={40}
        minHeight={40}
        handleStyle={{
          background: data?.stroke || "#000",
          width: 12,
          height: 12,
          zIndex: 100,
        }}
        lineStyle={{ border: "1px solid #0041d0" }}
      />
    </div>
  );
}

// Node for adding editable text to the canvas
// Junction Node - small connector for branching connections
function JunctionNode({ id, data, selected }) {
  const fill = data?.fill || "#000000";
  const stroke = data?.stroke || "#000000";
  const size = data?.size || 20;

  // Handles hidden by default, visible on hover or selection
  const handleStyle = {
    width: 8,
    height: 8,
    background: "#555",
    border: "2px solid #fff",
    borderRadius: "50%",
    opacity: selected ? 1 : 0,
    transition: "opacity 0.2s",
  };

  return (
    <div
      className="junction-node"
      style={{
        width: size,
        height: size,
        position: "relative",
      }}
      onMouseEnter={(e) => {
        // Show handles on hover
        const handles = e.currentTarget.querySelectorAll(".react-flow__handle");
        handles.forEach((h) => (h.style.opacity = 1));
      }}
      onMouseLeave={(e) => {
        // Hide handles on leave if not selected
        if (!selected) {
          const handles = e.currentTarget.querySelectorAll(
            ".react-flow__handle",
          );
          handles.forEach((h) => (h.style.opacity = 0));
        }
      }}
    >
      <Handle
        id="top-in"
        type="target"
        position={Position.Top}
        style={handleStyle}
      />
      <Handle
        id="right-in"
        type="target"
        position={Position.Right}
        style={handleStyle}
      />
      <Handle
        id="bottom-in"
        type="target"
        position={Position.Bottom}
        style={handleStyle}
      />
      <Handle
        id="left-in"
        type="target"
        position={Position.Left}
        style={handleStyle}
      />
      <Handle
        id="top-out"
        type="source"
        position={Position.Top}
        style={handleStyle}
      />
      <Handle
        id="right-out"
        type="source"
        position={Position.Right}
        style={handleStyle}
      />
      <Handle
        id="bottom-out"
        type="source"
        position={Position.Bottom}
        style={handleStyle}
      />
      <Handle
        id="left-out"
        type="source"
        position={Position.Left}
        style={handleStyle}
      />
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: fill,
          border: `2px solid ${stroke}`,
          boxShadow: selected ? "0 0 0 2px #3b82f6" : "none",
        }}
      />
    </div>
  );
}

function TextNode({ id, data, selected }) {
  const updateNodeData = useNodeDataUpdate();
  const [label, setLabel] = useState(data.label || "Text");

  const handleStyle = {
    width: 8,
    height: 8,
    background: "#555",
    borderRadius: "50%",
  };

  const onBlur = (evt) => {
    const newLabel = evt.currentTarget.textContent;
    updateNodeData(id, (n) => ({ ...n, data: { ...n.data, label: newLabel } }));
  };

  return (
    <div
      style={{
        padding: "10px",
        border: selected ? "1px solid #007bff" : "1px solid transparent",
        borderRadius: "2px",
        fontSize: data.fontSize || 16,
        color: data.text || "#000000",
        position: "relative",
        minWidth: 30,
        minHeight: 20,
      }}
    >
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        style={handleStyle}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        style={handleStyle}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        style={handleStyle}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        style={handleStyle}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        style={handleStyle}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        style={handleStyle}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        style={handleStyle}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        style={handleStyle}
      />

      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={onBlur}
        style={{ outline: "none", cursor: "text" }}
      >
        {label}
      </div>
    </div>
  );
}

// Generic Shape Node
function GenericShapeNode({ id, data, selected }) {
  const rf = useReactFlow();
  const updateNodeData = useNodeDataUpdate();
  const [val, setVal] = useState(data?.label ?? "");
  const [editingSlot, setEditingSlot] = useState(null);
  const [slotDraft, setSlotDraft] = useState("");

  // Sync local state when data.label changes externally
  useEffect(() => {
    setVal(data?.label ?? "");
  }, [data?.label]);

  const shape = findShapeConfigById(data?.shapeId);

  const fallbackHandles = [
    {
      id: "top",
      position: Position.Top,
      style: { transform: "translate(-50%, -50%)" },
    },
    {
      id: "right",
      position: Position.Right,
      style: { transform: "translate(-50%, -50%)" },
    },
    {
      id: "bottom",
      position: Position.Bottom,
      style: { transform: "translate(-50%, -50%)" },
    },
    {
      id: "left",
      position: Position.Left,
      style: { transform: "translate(-50%, -50%)" },
    },
  ];

  const handles =
    shape && typeof shape.getHandles === "function"
      ? shape.getHandles()
      : fallbackHandles;
  const slotGrid = shape?.slotGrid;
  const slots = slotGrid ? buildSlotValues(shape, data?.slots) : null;
  const hasSlots = !!(slotGrid && slots && slots.length > 0);

  const commit = useCallback(
    (next) => {
      updateNodeData(id, (n) => ({
        ...n,
        data: { ...n.data, label: next, editing: false }
      }));
      // rf-change event will be triggered by the redux update cascading down, 
      // but we can trigger it here if immediate local effects are needed?
      // Redux update is sufficient.
      // window.dispatchEvent(new Event("rf-change")); 
    },
    [id, updateNodeData],
  );

  useEffect(() => {
    if (!shape || !slotGrid?.rows || !slotGrid?.cols) return;
    const expected = slotGrid.rows * slotGrid.cols;
    const existing = Array.isArray(data?.slots) ? data.slots : [];
    if (existing.length === expected && existing.every((v) => v !== undefined))
      return;

    const nextSlots = buildSlotValues(shape, existing);
    // Use setTimeout to avoid render-loop if this effect triggers immediately
    // or just rely on the fact that updateNodeData is stable.
    // However, calling dispatch inside useEffect is fine.

    // We can't use updateNodeData here easily because we need the *current* state of nodes which we have, 
    // but updateNodeData gets it from rf.getNodes(). That should be fine.
    updateNodeData(id, n => ({ ...n, data: { ...n.data, slots: nextSlots } }));
  }, [slotGrid, data?.slots, id, updateNodeData, shape]);

  const startSlotEdit = useCallback((index, initialValue) => {
    setEditingSlot(index);
    setSlotDraft(initialValue ?? "");
  }, []);

  const commitSlotEdit = useCallback(
    (index, value) => {
      if (index == null || index < 0) {
        setEditingSlot(null);
        setSlotDraft("");
        return;
      }

      updateNodeData(id, (n) => {
        const shapeCfg = findShapeConfigById(n.data?.shapeId);
        if (!shapeCfg) return n; // No change
        const next = buildSlotValues(shapeCfg, n.data?.slots);
        if (index < next.length) next[index] = value;
        return { ...n, data: { ...n.data, slots: next } };
      });

      setEditingSlot(null);
      setSlotDraft("");
    },
    [id, updateNodeData],
  );

  const cancelSlotEdit = useCallback(() => {
    setEditingSlot(null);
    setSlotDraft("");
  }, []);

  // Handle missing shape after all hooks have been called
  if (!shape) {
    console.error(`Shape with id ${data?.shapeId} not found.`);
    return (
      <div
        style={{
          ...baseNodeStyles(data),
          border: "1px solid red",
          background: "#fee",
        }}
      >
        Shape not found
      </div>
    );
  }

  return (
    <div
      style={{
        ...baseNodeStyles(data),
        position: "relative",
        backgroundColor: "transparent",
        pointerEvents: "all", // Ensure consistent click capture
      }}
      onDoubleClick={() => {
        if (hasSlots) return;
        updateNodeData(id, n => ({ ...n, data: { ...n.data, editing: true } }));
      }}
    >
      <svg
        viewBox={shape.icon.viewBox}
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}
      >
        <path
          d={shape.icon.path}
          fill={data.fill ?? shape.icon.fill ?? "#ffffff"}
          stroke={data.stroke ?? shape.icon.stroke ?? "#000000"}
          strokeWidth={data.strokeWidth ?? shape.icon.strokeWidth ?? 2}
          strokeDasharray={data.strokeDasharray ?? shape.icon.strokeDasharray}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {!hasSlots && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 6,
            pointerEvents: data?.editing ? "auto" : "none",
            zIndex: 4,
            cursor: "text",
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (!data?.editing) {
              updateNodeData(id, n => ({ ...n, data: { ...n.data, editing: true } }));
            }
          }}
        >
          {data?.editing ? (
            <input
              className="nodrag nopan nowheel"
              autoFocus
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onBlur={() => commit(val)}
              onKeyDown={(e) => e.key === "Enter" && commit(val)}
              onMouseDown={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                border: "1px solid #ccc",
                borderRadius: 4,
                padding: "4px 6px",
                fontSize: data?.fontSize || 12,
                position: "relative",
                zIndex: 6,
                background: "#fff",
                color: "#000",
                pointerEvents: "all",
              }}
            />
          ) : (
            <span
              style={{
                color: data?.text || "#000",
                fontSize: data?.fontSize || 12,
                textAlign: "center",
                display: "block",
                width: "100%",
                pointerEvents: "auto",
                cursor: "text",
              }}
              onClick={(e) => {
                if (selected) {
                  e.stopPropagation();
                  updateNodeData(id, n => ({ ...n, data: { ...n.data, editing: true } }));
                }
              }}
            >
              {data?.label}
            </span>
          )}
        </div>
      )}
      {hasSlots && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            gridTemplateRows: `repeat(${slotGrid.rows}, 1fr)`,
            gridTemplateColumns: `repeat(${slotGrid.cols}, 1fr)`,
            margin: slotGrid.margin ?? 0,
            pointerEvents: "none",
            zIndex: 7,
          }}
        >
          {slots.map((slotValue, index) => {
            const inset = slotGrid.inset || {};
            const paddingStyle = {
              paddingTop: inset.top ?? 0,
              paddingRight: inset.right ?? 0,
              paddingBottom: inset.bottom ?? 0,
              paddingLeft: inset.left ?? 0,
            };

            return (
              <div
                key={`${id}-slot-${index}`}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "all",
                  cursor: "text",
                  textAlign: "center",
                  ...paddingStyle,
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  startSlotEdit(index, slotValue);
                }}
              >
                {editingSlot === index ? (
                  <input
                    className="nodrag nopan nowheel"
                    autoFocus
                    value={slotDraft}
                    onChange={(e) => setSlotDraft(e.target.value)}
                    onBlur={() => commitSlotEdit(index, slotDraft)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        commitSlotEdit(index, slotDraft);
                      } else if (e.key === "Escape") {
                        cancelSlotEdit();
                      }
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onDoubleClick={(e) => e.stopPropagation()}
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "1px solid #ccc",
                      borderRadius: 3,
                      padding: "2px 4px",
                      fontSize: 11,
                      background: "#fff",
                      color: "#000",
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: 11,
                      color: data?.text || "#000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      height: "100%",
                      userSelect: "none",
                      textAlign: "center",
                    }}
                  >
                    {slotValue}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
      {handles.map((handle) => (
        <React.Fragment key={`${id}-${handle.id}`}>
          <Handle
            type="target"
            position={handle.position}
            id={`${handle.id}-in`}
            style={{ ...baseHandleStyle(data), ...(handle.style || {}) }}
          />
          <Handle
            type="source"
            position={handle.position}
            id={`${handle.id}-out`}
            style={{ ...baseHandleStyle(data), ...(handle.style || {}) }}
          />
        </React.Fragment>
      ))}
      <NodeResizer
        isVisible={selected}
        minWidth={10}
        minHeight={10}
        handleStyle={{
          background: data?.stroke || "#000",
          width: 12,
          height: 12,
          borderRadius: 2,
          zIndex: 2000
        }}
        lineStyle={{ border: "1px solid #0041d0" }}
      />
    </div>
  );
}

// Custom editable edge with inline label + options menu
function EditableEdge(edgeProps) {
  const {
    id,
    source,
    target,
    sourceHandle,
    targetHandle,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
    markerStart,
    markerEnd,
    label,
    labelStyle,
    selected,
    data,
  } = edgeProps;
  const rf = useReactFlow();
  const updateEdgeData = useEdgeDataUpdate();
  const pathFn = data?.pathType === 'straight' ? getStraightPath : getSmoothStepPath;
  const [edgePath, labelX, labelY] = pathFn({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });
  const [editing, setEditing] = useState(false);
  const initialLabel = label ?? data?.label ?? "";
  const [text, setText] = useState(initialLabel);
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setText(label ?? data?.label ?? "");
  }, [label, data?.label]);

  // close options popover on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      // clicks anywhere inside the label+button+menu container should NOT close
      if (containerRef.current && containerRef.current.contains(e.target))
        return;
      setOpen(false);
      setEditing(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setEditing(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const updateEdge = (mapper) => {
    updateEdgeData(id, mapper);
  };

  const commit = () => {
    const next = text.trim();
    updateEdge((e) => ({
      ...e,
      label: next,
      data: { ...(e.data || {}), label: next, showLabel: next !== "" },
    }));
    setText(next);
    setEditing(false);
  };

  const setArrowMode = (mode) => {
    if (mode === "none") {
      updateEdge((e) => ({
        ...e,
        markerStart: undefined,
        markerEnd: undefined,
      }));
    } else if (mode === "single") {
      updateEdge((e) => ({
        ...e,
        markerStart: undefined,
        markerEnd: { type: MarkerType.ArrowClosed },
      }));
    } else if (mode === "double") {
      updateEdge((e) => ({
        ...e,
        markerStart: { type: MarkerType.ArrowClosed },
        markerEnd: { type: MarkerType.ArrowClosed },
      }));
    }
  };

  const flip = () => {
    try {
      rf.updateEdge(
        { id, source, target, sourceHandle, targetHandle },
        {
          id,
          source: target,
          target: source,
          sourceHandle: targetHandle,
          targetHandle: sourceHandle,
        },
      );
    } catch (_) {
      updateEdge((e) => ({
        ...e,
        source: e.target,
        target: e.source,
        sourceHandle: e.targetHandle,
        targetHandle: e.sourceHandle,
      }));
    }
    // swap arrowheads
    updateEdge((e) => ({
      ...e,
      markerStart: e.markerEnd,
      markerEnd: e.markerStart,
    }));
  };

  const stroke = (style && style.stroke) || "#000000";
  const textColor = (labelStyle && labelStyle.fill) || "#000000";
  const currentArrow =
    markerStart && markerEnd ? "double" : markerEnd ? "single" : "none";
  const hasStoredLabel = initialLabel.trim().length > 0;
  const showLabelFlag = data?.showLabel;
  const showLabel =
    (typeof showLabelFlag === "boolean" ? showLabelFlag : hasStoredLabel) &&
    hasStoredLabel;
  const shouldRenderLabel = editing || showLabel;

  // draw style with round caps to remove tiny visual gaps
  const drawStyle = {
    ...(style || {}),
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  // shift label/gear to the side of the edge so they don't sit on top of the stroke
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len; // perpendicular (normalized)
  const ny = dx / len;
  const SIDE_OFFSET = 14; // px
  const labelOffsetX = nx * SIDE_OFFSET;
  const labelOffsetY = ny * SIDE_OFFSET;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={drawStyle}
        markerStart={markerStart}
        markerEnd={markerEnd}
      />
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={16}
        style={{ pointerEvents: "stroke", cursor: "pointer" }}
        onClick={(e) => {
          e.stopPropagation();
          updateEdgeData(id, (ed) => ({ ...ed, selected: true }));
          // Note: deselecting other edges is tricky with single update. 
          // But standard ReactFlow selection should handle single click if we don't interfere.
          // However, if we want to mimic setEdges behavior for selection:
          // rf.setEdges... enables multiselection logic. 
          // Here we just want to ensure THIS edge is selected?
          // The original code was:
          /*
          rf.setEdges((eds) =>
            eds.map((ed) =>
              ed.id === id
                ? { ...ed, selected: true }
                : { ...ed, selected: false },
            ),
          );
          */
          // Since we use Redux, we should update Redux.
          // But deselecting others requires iterating all edges.
          // We can just use updateEdgeData which iterates all edges and applies mapper.
          updateEdgeData(id, (ed) => ({ ...ed, selected: true }));
          // Wait, updateEdgeData only updates target edge.
          // For selection handling, typically RF handles it. 
          // If we want manual control:
          // We should probably leave selection logic to RF or use a proper helper.
          // But let's try to pass the updateEdgeData.
          // Actually, for selection, maybe we should just rely on RF's native behavior?
          // But the code had an explicit onClick.
          // Let's replicate strict behavior using dispatch directly if needed.
          // Or just update this single edge and let others be.
          // The original code cleared selection of others.
          // I will use dispatch directly for this one case.
          // But I don't have dispatch here cleanly.
          // I'll skip selection logic update here and trust RF handles click selection, 
          // OR simply update this edge to selected.
          // Changing strict selection behavior is risky but maybe acceptable.
          // I'll stick to updating this edge only for now.
          updateEdgeData(id, (ed) => ({ ...ed, selected: true }));
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setEditing(true);
          // double-click: reveal label and select
          updateEdgeData(id, (ed) => ({
            ...ed,
            selected: true,
            data: { ...(ed.data || {}), showLabel: true },
          }));
        }}
      />
      <EdgeLabelRenderer>
        {open && <div className="edge-backdrop" />}
        <div
          ref={containerRef}
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
            display: "flex",
            alignItems: "center",
            gap: 6,
            zIndex: open ? 30 : 10,
          }}
        >
          {shouldRenderLabel &&
            (editing ? (
              <input
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commit();
                  if (e.key === "Escape") setEditing(false);
                }}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  padding: "2px 4px",
                  fontSize: 12,
                  position: "relative",
                  zIndex: 5,
                  background: "#fff",
                  pointerEvents: "all",
                  color: "#000",
                }}
              />
            ) : (
              <div
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditing(true);
                }}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e5e5",
                  borderRadius: 8,
                  padding: "2px 6px",
                  fontSize: 12,
                  color: textColor,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                }}
                title="Double-click to edit label"
              >
                {initialLabel || "Label"}
              </div>
            ))}
          {(selected || open) && (
            <button
              ref={btnRef}
              title={open ? "Close options" : "Edge options"}
              aria-haspopup="dialog"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="edge-icon-btn"
            >
              <Settings size={12} />
            </button>
          )}
          {open && (
            <div
              ref={menuRef}
              className="edge-popover"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="segmented">
                <button
                  className={currentArrow === "none" ? "active" : ""}
                  onClick={() => setArrowMode("none")}
                >
                  None
                </button>
                <button
                  className={currentArrow === "single" ? "active" : ""}
                  onClick={() => setArrowMode("single")}
                >
                  Single
                </button>
                <button
                  className={currentArrow === "double" ? "active" : ""}
                  onClick={() => setArrowMode("double")}
                >
                  Double
                </button>
                <button className="icon" onClick={flip} title="Flip direction">
                  <ArrowLeftRight size={14} />
                </button>
              </div>
              <div className="row">
                <span>Border</span>
                <input
                  type="color"
                  value={stroke}
                  onChange={(e) => {
                    const v = e.target.value;
                    updateEdge((edge) => ({
                      ...edge,
                      style: { ...(edge.style || {}), stroke: v },
                    }));
                  }}
                />
              </div>
              <div className="row">
                <span>Text</span>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => {
                    const v = e.target.value;
                    updateEdge((edge) => ({
                      ...edge,
                      labelStyle: { ...(edge.labelStyle || {}), fill: v },
                    }));
                  }}
                />
              </div>
            </div>
          )}
        </div>
        {/* Connection Handle for Edge Splitting */}
        <div
          className="edge-connection-handle"
          data-edge-id={id}
          data-x={labelX}
          data-y={labelY}
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
            width: 12,
            height: 12,
            background: "#000",
            borderRadius: "50%",
            cursor: "crosshair",
            zIndex: 20,
            opacity: 0, // Hidden by default, shown on hover via CSS
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
        />
      </EdgeLabelRenderer>
    </>
  );
}

const nodeTypes = {
  process: ProcessNode,
  decision: DecisionNode,
  terminator: TerminatorNode,
  ellipse: EllipseNode,
  data: DataNode,
  database: DatabaseNode,
  manualInput: ManualInputNode,
  document: DocumentNode,
  triangle: TriangleNode,
  hexagon: HexagonNode,
  svgStamp: SvgStampNode,
  genericShape: GenericShapeNode,
  text: TextNode,
  junction: JunctionNode,
};

const edgeTypes = { editable: EditableEdge };

// Helper function to convert shapeData to palette items
const createPaletteItemsFromShapeData = (categoryName) => {
  const shapes = shapeData[categoryName] || [];
  return shapes.map((shape) => ({
    id: shape.id,
    type: "genericShape",
    label: shape.name,
    shapeId: shape.id,
    icon: (
      <svg
        viewBox={shape.icon.viewBox}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "100%" }}
      >
        <path
          d={shape.icon.path}
          fill={shape.icon.fill || "#fff"}
          stroke={shape.icon.stroke || "#111"}
          strokeWidth={shape.icon.strokeWidth || 2}
        />
      </svg>
    ),
  }));
};

// Modern sidebar shape previews organized into dropdown groups
const PALETTE_GROUPS = [
  {
    id: "flowchart",
    title: "Flowchart",
    items: createPaletteItemsFromShapeData("Flowchart"),
  },
  {
    id: "basic",
    title: "Basic Shapes",
    items: [
      ...createPaletteItemsFromShapeData("Basic"),
      {
        type: "text",
        label: "Text",
        icon: <div style={{ fontSize: 24, fontWeight: "bold" }}>T</div>,
      },
      {
        type: "junction",
        label: "Junction",
        icon: (
          <svg
            viewBox="0 0 80 80"
            preserveAspectRatio="xMidYMid meet"
            style={{ width: "56px", height: "36px" }}
          >
            <circle
              cx="40"
              cy="40"
              r="8"
              fill="#000"
              stroke="#111"
              strokeWidth="2"
            />
          </svg>
        ),
      },
    ],
  },
  {
    id: "dsa",
    title: "Data Structures",
    items: createPaletteItemsFromShapeData("Data Structures"),
  },
  {
    id: "uml-usecase",
    title: "UML Use Case",
    items: createPaletteItemsFromShapeData("UML Use Case Diagram"),
  },
  {
    id: "uml-sequence",
    title: "UML Sequence",
    items: createPaletteItemsFromShapeData("UML Sequence Diagram"),
  },
  {
    id: "uml-timing",
    title: "UML Timing",
    items: createPaletteItemsFromShapeData("UML Timing Diagram"),
  },
  {
    id: "activity-state",
    title: "Activity & State",
    items: createPaletteItemsFromShapeData("Activity & State Diagram"),
  },
];

// Main DiagramEditor component
function DiagramEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { tabs, activeTabId } = useSelector((state) => state.flowchart);
  const activeTab = useMemo(
    () => tabs.find((t) => t?.id === activeTabId),
    [tabs, activeTabId],
  );

  const [isExplorerVisible, setIsExplorerVisible] = useState("shapes");
  const reactFlowWrapper = useRef(null);
  const { sidebarWidth, startResizing } = useResizableSidebar(240, 160, 480);

  // Derive nodes and edges from active tab
  const nodes = activeTab?.state?.nodes || [];
  const edges = activeTab?.state?.edges || [];

  const setNodes = useCallback(
    (nds) => {
      const nextNodes = typeof nds === "function" ? nds(nodes) : nds;
      dispatch(updateTabState({ tabId: activeTabId, nodes: nextNodes }));
    },
    [dispatch, activeTabId, nodes],
  );

  const setEdges = useCallback(
    (eds) => {
      const nextEdges = typeof eds === "function" ? eds(edges) : eds;
      dispatch(updateTabState({ tabId: activeTabId, edges: nextEdges }));
    },
    [dispatch, activeTabId, edges],
  );

  const onNodesChange = useCallback(
    (changes) => {
      const nextNodes = applyNodeChanges(changes, nodes);
      dispatch(updateTabState({ tabId: activeTabId, nodes: nextNodes }));
    },
    [dispatch, activeTabId, nodes],
  );

  const onEdgesChange = useCallback(
    (changes) => {
      const nextEdges = applyEdgeChanges(changes, edges);
      dispatch(updateTabState({ tabId: activeTabId, edges: nextEdges }));
    },
    [dispatch, activeTabId, edges],
  );

  const [selected, setSelected] = useState(null);
  const [openGroups, setOpenGroups] = useState({
    flowchart: false,
    blocks: true,
    basic: false,
    dsa: false,
    "uml-usecase": false,
    "uml-sequence": false,
    "uml-timing": false,
    "activity-state": false,
    connectors: true,
  });
  const [paletteSearch, setPaletteSearch] = useState("");
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const {
    user,
    activeProjectId,
    activeProjectName,
    activeProductId,
    setActiveProjectId,
    diagramData,
    setDiagramData,
    saveDiagramData,
    isSwitchingProject,
    isHydrated,
    isRestoring,
    hasFetchedOnce,
    transitionError
  } = useProject?.() ?? {};

  const rf = useReactFlow();
  const hydratingRef = useRef(false);

  // --- API Integration for Save/Load ---
  const fetchFlowchart = useCallback(async () => {
    if (!activeProductId || !activeProjectId) return;
    try {
      const url = `${baseURL}/api/v1/getFlowDiagram/${activeProductId}/${activeProjectId}`;
      console.log("[Flowchart] Fetching from API:", url);
      const response = await axios.get(url);

      if (response.data?.success && response.data?.data?.[0]) {
        const doc = response.data.data[0];

        // Handle root-level nodes/edges from the specified API response
        if (doc.nodes && Array.isArray(doc.nodes)) {
          console.log("[Flowchart] API Data loaded (root-level structure)");

          const fetchedState = {
            nodes: doc.nodes,
            edges: doc.edges || [],
            viewport: doc.viewport || { x: 0, y: 0, zoom: 1 }
          };

          // Update Redux state. Since the specified API uses a single set of nodes/edges, 
          // we map it to the active tab or a default tab.
          dispatch(updateTabState({
            tabId: activeTabId,
            nodes: fetchedState.nodes,
            edges: fetchedState.edges,
            viewport: fetchedState.viewport
          }));

          if (doc.viewport) {
            rf.setViewport(doc.viewport);
          }
        } else if (Array.isArray(doc.flowDiagram)) {
          // Legacy support for multi-tab flowDiagram array
          const flowchartData = doc.flowDiagram;
          if (flowchartData.length > 0) {
            console.log("[Flowchart] API Data loaded (legacy array structure):", flowchartData.length, "tabs");
            dispatch(setTabs(flowchartData));
            const currentTabExists = flowchartData.some(t => t.id === activeTabId);
            if (!activeTabId || !currentTabExists) {
              dispatch(setActiveTab(flowchartData[0].id));
            }
          }
        }
      }
    } catch (error) {
      console.error("[Flowchart] API fetch error:", error);
    }
  }, [activeProductId, activeProjectId, activeTabId, dispatch, rf]);

  const saveFlowchart = useCallback(async () => {
    const userId = user?.userId || user?._id || user?.id;
    if (!activeProductId || !activeProjectId || !userId) {
      console.warn("[Flowchart] Missing IDs for save:", { activeProductId, activeProjectId, userId });
      return;
    }

    try {
      // Re-aligning with specified API requirement: root-level keys
      const payload = {
        productId: activeProductId,
        fileORFolderId: activeProjectId,
        userId: userId,
        nodes: nodes,
        edges: edges,
        viewport: rf.getViewport(),
      };

      const diagramId = diagramData?.flowchart?.id;

      if (diagramId) {
        console.log("[Flowchart] Updating existing via PUT:", diagramId);
        await axios.put(`${baseURL}/api/v1/updateFlowDiagram/${diagramId}`, payload);
        console.log("[Flowchart] Updated successfully");
      } else {
        console.log("[Flowchart] Adding new via POST");
        const response = await axios.post(`${baseURL}/api/v1/addFlowDiagram`, payload);
        if (response.data?.data?._id) {
          // Update the ID in project context to enable PUT for subsequent saves
          setDiagramData(prev => ({
            ...prev,
            flowchart: { ...prev.flowchart, id: response.data.data._id }
          }));
        }
        console.log("[Flowchart] Added successfully");
      }
    } catch (error) {
      console.error("[Flowchart] API save error:", error);
    }
  }, [activeProductId, activeProjectId, user, nodes, edges, rf, diagramData?.flowchart?.id, setDiagramData]);

  // Fetch data on mount or project switch
  useEffect(() => {
    if (activeProjectId && activeProductId) {
      fetchFlowchart();
    }
  }, [activeProjectId, activeProductId, fetchFlowchart]);

  // Initialize first tab if none exists
  useEffect(() => {
    if (tabs.length === 0) {
      const newId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      dispatch(
        addTab({
          id: newId,
          name: "Tab 1",
          state: createFlowchartState(),
          dirty: true,
        }),
      );
    }
  }, [tabs.length, dispatch]);

  const createTab = useCallback(() => {
    const newId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    dispatch(
      addTab({
        id: newId,
        name: `Tab ${tabs.length + 1}`,
        state: createFlowchartState(),
        dirty: true,
      }),
    );
  }, [dispatch, tabs.length]);

  const updateActiveTabState = useCallback(
    (updater) => {
      if (!activeTabId || !activeTab) return;
      const nextState =
        typeof updater === "function" ? updater(activeTab.state) : updater;
      dispatch(updateTabState({ tabId: activeTabId, ...nextState }));
    },
    [dispatch, activeTabId, activeTab],
  );

  // Canvas file integration for Flowchart
  const canvasIntegration = useCanvasFileIntegration("Flowchart");

  // Canvas auto-save REMOVED from backend sync - kept only for local persistence if needed
  // We will now rely on explicit Save button

  // --- Sync Redux Tabs with Central Project Data ---
  useEffect(() => {
    // GUARD: If a file was just loaded from the explorer, SKIP this sync to prevent overwrite
    if (lastLoadedFilePathRef.current !== null) {
      console.log("[Flowchart] Sync skipped: Manual file load in progress");
      return;
    }

    const data = diagramData?.flowchart?.data;
    if (data && Array.isArray(data) && data.length > 0) {
      // ONLY hydrate from context if Redux is currently empty
      // This prevents switching screens from overwriting local unsaved changes with stale backend data
      if (tabs.length === 0) {
        console.log("[Flowchart] Hydrating Redux tabs from central data:", data.length, "tabs");
        hydratingRef.current = true;
        dispatch(setTabs(data));

        // Set active tab if it's not set
        const firstTabId = data[0].id;
        if (!activeTabId || !data.find(t => t.id === activeTabId)) {
          dispatch(setActiveTab(firstTabId));
        }

        setTimeout(() => hydratingRef.current = false, 100);
      }
    }
  }, [diagramData?.flowchart?.data, dispatch, tabs.length]);

  const userId = user?.userId || user?._id || user?.id;

  // History & snapshots
  const HISTORY_LIMIT = 100;
  const historyRef = useRef({ entries: [], index: -1 });
  const debounceRef = useRef(null);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const isUndoRedoRef = useRef(false);
  const lastSnapshotRef = useRef("");
  const lastActiveTabIdRef = useRef(null);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);
  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  // Create ref for updateActiveTabState to use in unmount cleanup
  const updateActiveTabStateRef = useRef(updateActiveTabState);
  useEffect(() => {
    updateActiveTabStateRef.current = updateActiveTabState;
  }, [updateActiveTabState]);

  // Sync canvas state with workspace tabs on tab switch
  // PART 1: Save state before switching (via event)
  useEffect(() => {
    const handleBeforeTabSwitch = () => {
      // Save current canvas state to active tab before switching
      if (updateActiveTabState) {
        console.log("[FlowchartTest] Saving canvas state before tab switch");
        updateActiveTabState(
          (prev) => ({
            ...prev,
            nodes: nodesRef.current,
            edges: edgesRef.current,
            viewport: rf.getViewport(),
          }),
          { markDirty: true, scheduleSave: true },
        );
      }
    };

    window.addEventListener(
      "workspace:before-tab-switch",
      handleBeforeTabSwitch,
    );

    return () => {
      window.removeEventListener(
        "workspace:before-tab-switch",
        handleBeforeTabSwitch,
      );
    };
  }, [updateActiveTabState, rf]);

  // PART 2: Restore state when active tab changes
  useEffect(() => {
    if (activeTab) {
      const isInitialMount = lastActiveTabIdRef.current === null;
      const isTabSwitch = lastActiveTabIdRef.current !== activeTab?.id;

      lastActiveTabIdRef.current = activeTab?.id;

      // If initial mount and tab is empty, SKIP restore to allow AutoSave to load data
      if (isInitialMount) {
        const isEmpty =
          !activeTab.state ||
          !activeTab.state.nodes ||
          activeTab.state.nodes.length === 0;
        if (isEmpty) {
          console.log(
            "[FlowchartTest] Initial mount with empty tab - Skipping restore to let AutoSave load",
          );
          return;
        }
      }

      if ((isTabSwitch || isInitialMount) && activeTab.state) {
        console.log(
          "[FlowchartTest] Active tab changed, restoring canvas state:",
          activeTab.name,
        );

        const newState = activeTab.state;
        if (newState.nodes) {
          setNodes(newState.nodes);
          nodesRef.current = newState.nodes;
        }
        if (newState.edges) {
          setEdges(newState.edges);
          edgesRef.current = newState.edges;
        }

        if (newState.viewport && rf) {
          setTimeout(() => {
            rf.setViewport(newState.viewport);
            // If it's a manual file load, also perform fitView (limited to maxZoom 1)
            if (lastLoadedFilePathRef.current) {
              rf.fitView({ padding: 0.2, duration: 400, maxZoom: 1 });
              // Reset the ref after viewing to allow future syncs if needed
              setTimeout(() => {
                lastLoadedFilePathRef.current = null;
              }, 1000);
            }
          }, 50);
        }
      }
    }
  }, [activeTab, setNodes, setEdges, rf]);

  const pushSnapshot = useCallback(() => {
    if (hydratingRef.current) {
      console.log("pushSnapshot: hydrating, skipping");
      return;
    }

    // Use refs to get the latest state, as rf.getNodes() might be stale relative to the render cycle
    const nodesCurrent = nodesRef.current;
    const edgesCurrent = edgesRef.current;
    const viewport = rf.getViewport();

    console.log(
      "pushSnapshot: Attempting to push. Nodes:",
      nodesCurrent.length,
      "Edges:",
      edgesCurrent.length,
    );

    const snapshot = {
      nodes: nodesCurrent,
      edges: edgesCurrent,
      viewport,
    };
    const serialized = JSON.stringify(snapshot);

    if (serialized === lastSnapshotRef.current) {
      console.log("pushSnapshot: State unchanged, skipping");
      return;
    }

    lastSnapshotRef.current = serialized;

    const baseEntries = historyRef.current.entries.slice(
      0,
      historyRef.current.index + 1,
    );
    baseEntries.push(JSON.parse(serialized));
    const trimmed =
      baseEntries.length > HISTORY_LIMIT
        ? baseEntries.slice(baseEntries.length - HISTORY_LIMIT)
        : baseEntries;

    historyRef.current = {
      entries: trimmed,
      index: trimmed.length - 1,
    };
    console.log(
      "Snapshot pushed. New history length:",
      trimmed.length,
      "Index:",
      trimmed.length - 1,
    );
  }, [rf]);

  // Initialize history with the initial state
  useEffect(() => {
    // Only push if history is empty and we are not hydrating
    if (!hydratingRef.current && historyRef.current.index === -1) {
      console.log("Initializing history with initial state");
      // Small timeout to ensure React Flow is ready
      setTimeout(() => {
        pushSnapshot();
      }, 100);
    }
  }, [pushSnapshot]);

  const flushPendingSnapshot = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    pushSnapshot();
  }, [pushSnapshot]);

  const persistCurrentState = useCallback(() => {
    if (hydratingRef.current) {
      console.log("[PERSIST] Skipped - hydrating");
      return;
    }
    console.log(
      "[PERSIST] Saving state. Nodes:",
      nodesRef.current.length,
      "Edges:",
      edgesRef.current.length,
    );
    updateActiveTabState((prev = createFlowchartState()) => ({
      ...prev,
      nodes: nodesRef.current,
      edges: edgesRef.current,
      viewport: rf.getViewport(),
    }));
    console.log("[PERSIST] State save initiated");
  }, [rf, updateActiveTabState]);

  const scheduleSnapshot = useCallback(() => {
    if (isUndoRedoRef.current || hydratingRef.current) {
      console.log("scheduleSnapshot: Skipped (isUndoRedo or hydrating)");
      return;
    }
    console.log("scheduleSnapshot: Scheduled");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushSnapshot();
      persistCurrentState();
    }, 400);
  }, [persistCurrentState, pushSnapshot]);

  useEffect(() => {
    const handleRfChange = () => {
      scheduleSnapshot();
    };

    window.addEventListener("rf-change", handleRfChange);
    return () => window.removeEventListener("rf-change", handleRfChange);
  }, [scheduleSnapshot]);

  useEffect(() => {
    if (hydratingRef.current || isUndoRedoRef.current) return;
    scheduleSnapshot();
  }, [nodes, edges, scheduleSnapshot]);

  // Save state when component unmounts (e.g., switching screens)
  // This effect has NO dependencies so it only runs once on mount and cleanup on unmount
  useEffect(() => {
    console.log("[UNMOUNT EFFECT] Registered (stable)");
    return () => {
      console.log("========================================");
      console.log("[UNMOUNT] FlowchartTest is unmounting!");
      console.log("[UNMOUNT] Current nodes:", nodesRef.current.length);
      console.log("[UNMOUNT] Current edges:", edgesRef.current.length);

      // Clear any pending debounced save
      if (debounceRef.current) {
        console.log("[UNMOUNT] Clearing pending debounce");
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }

      // Push snapshot to history
      console.log("[UNMOUNT] Pushing final snapshot");
      const snapshot = {
        nodes: nodesRef.current,
        edges: edgesRef.current,
        viewport: rf.getViewport(),
      };
      const serialized = JSON.stringify(snapshot);
      if (serialized !== lastSnapshotRef.current) {
        lastSnapshotRef.current = serialized;
        const entry = JSON.parse(serialized);
        const history = historyRef.current;
        const base = history.entries.slice(0, history.index + 1);
        base.push(entry);
        const trimmed =
          base.length > HISTORY_LIMIT
            ? base.slice(base.length - HISTORY_LIMIT)
            : base;
        historyRef.current = { entries: trimmed, index: trimmed.length - 1 };
        console.log("[UNMOUNT] Snapshot pushed to history");
      }

      // Force immediate state save to workspace tabs
      console.log("[UNMOUNT] Saving to workspace tabs");
      if (updateActiveTabStateRef.current) {
        updateActiveTabStateRef.current(() => ({
          nodes: nodesRef.current,
          edges: edgesRef.current,
          viewport: rf.getViewport(),
        }));
        console.log("[UNMOUNT] State saved to active tab");
      }

      console.log("[UNMOUNT] Cleanup complete");
      console.log("========================================");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run on mount/unmount

  const applySnapshot = useCallback(
    (snapshot, nextIndex) => {
      if (!snapshot) return;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }

      hydratingRef.current = true;
      isUndoRedoRef.current = true;

      historyRef.current.index = nextIndex;

      const nextNodes = snapshot.nodes || [];
      const nextEdges = snapshot.edges || [];

      nodesRef.current = nextNodes;
      edgesRef.current = nextEdges;

      setNodes(nextNodes);
      setEdges(nextEdges);

      const serialized = JSON.stringify(snapshot);

      requestAnimationFrame(() => {
        if (snapshot.viewport) rf.setViewport(snapshot.viewport);
        lastSnapshotRef.current = serialized;
        updateActiveTabState(
          () => ({
            nodes: nextNodes,
            edges: nextEdges,
            viewport: snapshot.viewport || rf.getViewport(),
          }),
          { markDirty: false, scheduleSave: false },
        );
        hydratingRef.current = false;
        isUndoRedoRef.current = false;
      });
    },
    [rf, setEdges, setNodes, updateActiveTabState],
  );

  const undo = useCallback(() => {
    console.log("Undo called. History index:", historyRef.current.index);
    flushPendingSnapshot();

    const { entries, index } = historyRef.current;
    if (index <= 0) {
      console.log("Undo: No more history to undo");
      return;
    }
    const nextIndex = index - 1;
    console.log("Undo: Applying snapshot at index", nextIndex);
    applySnapshot(entries[nextIndex], nextIndex);
  }, [applySnapshot, flushPendingSnapshot]);

  const redo = useCallback(() => {
    console.log("Redo called. History index:", historyRef.current.index);
    flushPendingSnapshot();

    const { entries, index } = historyRef.current;
    if (index >= entries.length - 1) {
      console.log("Redo: No more history to redo");
      return;
    }
    const nextIndex = index + 1;
    console.log("Redo: Applying snapshot at index", nextIndex);
    applySnapshot(entries[nextIndex], nextIndex);
  }, [applySnapshot, flushPendingSnapshot]);

  const handleNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      // Sync ref immediately for persistence
      setNodes((nds) => {
        nodesRef.current = nds;
        return nds;
      });

      if (!isUndoRedoRef.current) {
        const meaningfulChange = changes.some(
          (change) => change.type !== "select" && change.type !== "selectNodes",
        );
        if (meaningfulChange) {
          scheduleSnapshot();
        }
      }
    },
    [onNodesChange, scheduleSnapshot, setNodes],
  );

  const handleEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      // Sync ref immediately for persistence
      setEdges((eds) => {
        edgesRef.current = eds;
        return eds;
      });

      if (!isUndoRedoRef.current) {
        const meaningfulChange = changes.some(
          (change) => change.type !== "select" && change.type !== "selectNodes",
        );
        if (meaningfulChange) {
          scheduleSnapshot();
        }
      }
    },
    [onEdgesChange, scheduleSnapshot, setEdges],
  );

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => {
        const newEdges = addEdge(
          {
            ...params,
            type: "editable",
            markerEnd: { type: MarkerType.ArrowClosed },
            label: "Label",
            style: { stroke: "#000000", strokeWidth: 2 },
            labelStyle: { fill: "#000000", fontSize: 12 },
            data: { showLabel: false },
          },
          eds,
        );
        edgesRef.current = newEdges;
        return newEdges;
      });
      scheduleSnapshot();
    },
    [setEdges, scheduleSnapshot],
  );

  const connectionStartParams = useRef(null);

  const onConnectStart = useCallback((_, params) => {
    connectionStartParams.current = params;
  }, []);

  const onConnectEnd = useCallback(
    (event) => {
      const target = event.target;
      const edgeHandle = target.closest(".edge-connection-handle");

      if (edgeHandle && connectionStartParams.current) {
        const edgeId = edgeHandle.getAttribute("data-edge-id");
        const x = parseFloat(edgeHandle.getAttribute("data-x"));
        const y = parseFloat(edgeHandle.getAttribute("data-y"));
        const { nodeId: sourceNodeId, handleId: sourceHandleId } =
          connectionStartParams.current;

        // Find the target edge
        const targetEdge = edges.find((e) => e.id === edgeId);
        if (!targetEdge) return;

        // Create Junction Node
        const junctionId = `junction-${Date.now()}`;
        const junctionNode = {
          id: junctionId,
          type: "junction",
          position: { x, y }, // Position at the edge midpoint
          data: { label: "Junction", size: 2 }, // Very small size to look like a point/hidden
          // Adjust position to center the node (size is 2)
          //   position: { x: x - 1, y: y - 1 },
        };

        // Create new edges
        const edge1 = {
          id: `e-${targetEdge.source}-${junctionId}`,
          source: targetEdge.source,
          target: junctionId,
          sourceHandle: targetEdge.sourceHandle,
          targetHandle: "left-in",
          type: "editable",
          style: targetEdge.style,
          markerEnd: undefined, // No arrow
        };

        const edge2 = {
          id: `e-${junctionId}-${targetEdge.target}`,
          source: junctionId,
          target: targetEdge.target,
          sourceHandle: "right-out",
          targetHandle: targetEdge.targetHandle,
          type: "editable",
          style: targetEdge.style,
          markerEnd: targetEdge.markerEnd, // Keep original end marker if any (usually arrow)
        };

        const edge3 = {
          id: `e-${sourceNodeId}-${junctionId}-new`,
          source: sourceNodeId,
          target: junctionId,
          sourceHandle: sourceHandleId,
          targetHandle: "bottom-in",
          type: "editable",
          style: { strokeWidth: 2, stroke: "#000000" },
          markerEnd: undefined, // No arrow for the joining line
        };

        // Update state
        setNodes((nds) => nds.concat(junctionNode));
        setEdges(
          (eds) =>
            eds
              .filter((e) => e.id !== edgeId) // Remove old edge
              .concat([edge1, edge2, edge3]), // Add new edges
        );
        scheduleSnapshot();
      }
      connectionStartParams.current = null;
    },
    [edges, nodes, setEdges, setNodes, scheduleSnapshot],
  );


  useEffect(() => {
    if (!activeTab) return;

    console.log("[Flowchart] Active tab changed or loaded. ID:", activeTab?.id);

    // If we're already viewing the correct state, don't trigger updates
    hydratingRef.current = true;
    const state = activeTab.state || createFlowchartState();
    const nextNodes = state.nodes || [];
    const nextEdges = state.edges || [];
    const nextViewport = state.viewport || null;

    // We no longer call setNodes/setEdges here because nodes/edges are
    // already derived directly from activeTab in Redux.
    // Calling them here causes an infinite loop.

    nodesRef.current = nextNodes;
    edgesRef.current = nextEdges;

    historyRef.current = {
      entries: [JSON.parse(JSON.stringify({ nodes: nextNodes, edges: nextEdges, viewport: nextViewport }))],
      index: 0,
    };

    if (nextViewport && rf) {
      // Use a slightly longer delay to ensure React Flow is ready
      setTimeout(() => {
        rf.setViewport(nextViewport);
        hydratingRef.current = false;
      }, 100);
    } else {
      hydratingRef.current = false;
    }

    if (!activeTab.state) {
      updateActiveTabState(
        () => ({
          nodes: nextNodes,
          edges: nextEdges,
          viewport: nextViewport || rf.getViewport(),
        }),
        { markDirty: false, scheduleSave: false },
      );
    }

    const frame = requestAnimationFrame(() => {
      hydratingRef.current = false;
      scheduleSnapshot();
    });

    // Cleanup: Save current state before switching tabs or unmounting
    return () => {
      cancelAnimationFrame(frame);
      const currentTabId = activeTab?.id;
      if (currentTabId) {
        console.log("[TAB SWITCH] Switching from tab:", currentTabId);
        console.log(
          "[TAB SWITCH] Nodes:",
          nodesRef.current.length,
          "Edges:",
          edgesRef.current.length,
        );

        // Flush any pending debounced save
        if (debounceRef.current) {
          console.log("[TAB SWITCH] Clearing pending debounce");
          clearTimeout(debounceRef.current);
          debounceRef.current = null;
        }

        // Immediately save current state using the captured values
        const currentState = {
          nodes: nodesRef.current,
          edges: edgesRef.current,
          viewport: rf.getViewport(),
        };

        console.log("[TAB SWITCH] Saving state for tab", currentTabId);

        // Use the ref to avoid dependency cycles
        if (updateActiveTabStateRef.current) {
          updateActiveTabStateRef.current(() => currentState, {
            markDirty: true,
            scheduleSave: false,
          });
        }

        console.log("[TAB SWITCH] Cleanup complete");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab?.id, rf]);

  const onNodeDragStop = useCallback(() => {
    scheduleSnapshot();
  }, [scheduleSnapshot]);

  const handlePaletteDragStart = useCallback((event, item) => {
    let payload;
    if (item.id && item.label) {
      payload = JSON.stringify({
        type: "genericShape",
        data: { shapeId: item.id, label: item.label },
      });
    } else {
      payload = item.type || JSON.stringify(item);
    }
    event.dataTransfer.setData("application/reactflow", payload);
    event.dataTransfer.effectAllowed = "move";
  }, []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const filteredGroups = useMemo(() => {
    const query = paletteSearch.trim().toLowerCase();
    if (!query) {
      return PALETTE_GROUPS;
    }
    return PALETTE_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.label.toLowerCase().includes(query),
      ),
    })).filter((group) => group.items.length > 0);
  }, [paletteSearch]);

  const hasSearch = Boolean(paletteSearch.trim());

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const payload = event.dataTransfer.getData("application/reactflow");
      if (!payload) {
        console.warn("[Flowchart] onDrop: No payload found");
        return;
      }

      let type = payload;
      let extraData = {};
      try {
        const parsed = JSON.parse(payload);
        if (parsed && parsed.type) {
          type = parsed.type;
          extraData = parsed.data || {};
        }
      } catch (_) {
        // not JSON, fall back to string type
      }

      const position = rf.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const id = getId();
      const baseData = {
        label: "",
        fill: "#ffffff",
        stroke: "#000000",
        text: "#000000",
        strokeWidth: 2,
        rotation: 0,
        fontSize: 12,
      };
      const shapeConfig =
        type === "genericShape" ? findShapeConfigById(extraData.shapeId) : null;
      const slots = shapeConfig
        ? buildSlotValues(shapeConfig, extraData.slots)
        : undefined;

      // Compute appropriate initial size based on shape type
      let initialWidth = 80;
      let initialHeight = 80;

      // Special handling for common flowchart shapes to have better aspect ratios
      if (extraData.shapeId?.includes('diamond')) {
        initialWidth = 80;
        initialHeight = 80;
      } else if (extraData.shapeId?.includes('rectangle') || extraData.shapeId?.includes('process')) {
        initialWidth = 100;
        initialHeight = 60;
      } else if (extraData.shapeId?.includes('oval') || extraData.shapeId?.includes('terminator')) {
        initialWidth = 100;
        initialHeight = 50;
      }

      if (type === "decision" || type === "ellipse") {
        initialWidth = 60;
        initialHeight = 60;
      } else if (type === "terminator") {
        initialWidth = 80;
        initialHeight = 40;
      } else if (type === "text") {
        initialWidth = 80;
        initialHeight = 30;
      } else if (extraData.shapeId === "uml-seq-lifeline") {
        initialWidth = 20;
        initialHeight = 250;
      } else if (extraData.shapeId === "uml-seq-actor") {
        initialWidth = 100;
        initialHeight = 60;
      }

      setNodes((nds) => {
        const newNodes = nds.concat({
          id,
          type,
          position,
          data: {
            ...baseData,
            ...extraData,
            ...(slots ? { slots } : {}),
          },
          style: { width: initialWidth, height: initialHeight },
        });
        console.log("[Flowchart] setNodes new count:", newNodes.length);
        return newNodes;
      });
    },
    [rf, setNodes],
  );

  const onSelectionChange = useCallback(({ nodes: nds, edges: eds }) => {
    if (nds && nds.length) {
      setSelected({ kind: "node", id: nds[0].id });
    } else if (eds && eds.length) {
      setSelected({ kind: "edge", id: eds[0].id });
    } else {
      setSelected(null);
    }
  }, []);

  const exitEditing = useCallback(() => {
    setNodes((nds) =>
      nds.map((n) =>
        n.data?.editing ? { ...n, data: { ...n.data, editing: false } } : n,
      ),
    );
  }, [setNodes]);

  // Clipboard state
  const [clipboard, setClipboard] = useState({ nodes: [], edges: [] });

  // Get selected nodes and edges
  const getSelectedItems = useCallback(() => {
    const selectedNodes = nodes.filter((node) => node.selected);
    const selectedEdges = edges.filter((edge) => edge.selected);
    return { selectedNodes, selectedEdges };
  }, [nodes, edges]);

  // Copy functionality
  const copySelected = useCallback(() => {
    const { selectedNodes, selectedEdges } = getSelectedItems();
    if (selectedNodes.length > 0 || selectedEdges.length > 0) {
      setClipboard({ nodes: selectedNodes, edges: selectedEdges });
      console.log(
        `Copied ${selectedNodes.length} nodes and ${selectedEdges.length} edges`,
      );
    }
  }, [getSelectedItems]);

  // Paste functionality
  const pasteFromClipboard = useCallback(() => {
    if (clipboard.nodes.length === 0 && clipboard.edges.length === 0) return;

    const nodeIdMap = new Map();
    const newNodes = clipboard.nodes.map((node) => {
      const newId = getId();
      nodeIdMap.set(node.id, newId);
      return {
        ...node,
        id: newId,
        position: {
          x: node.position.x + 50, // Offset pasted items
          y: node.position.y + 50,
        },
        selected: true, // Select pasted items
      };
    });

    const newEdges = clipboard.edges
      .map((edge) => {
        const sourceId = nodeIdMap.get(edge.source);
        const targetId = nodeIdMap.get(edge.target);

        // Only paste edges if both source and target nodes are being pasted
        if (sourceId && targetId) {
          return {
            ...edge,
            id: getId(),
            source: sourceId,
            target: targetId,
            selected: true,
          };
        }
        return null;
      })
      .filter(Boolean);

    // Deselect all existing items
    setNodes((nds) =>
      nds.map((n) => ({ ...n, selected: false })).concat(newNodes),
    );
    setEdges((eds) =>
      eds.map((e) => ({ ...e, selected: false })).concat(newEdges),
    );

    scheduleSnapshot();
    console.log(`Pasted ${newNodes.length} nodes and ${newEdges.length} edges`);
  }, [clipboard, setNodes, setEdges, scheduleSnapshot]);

  // Select all functionality
  const selectAll = useCallback(() => {
    setNodes((nds) => nds.map((n) => ({ ...n, selected: true })));
    setEdges((eds) => eds.map((e) => ({ ...e, selected: true })));
  }, [setNodes, setEdges]);

  // Delete selected items
  const deleteSelected = useCallback(() => {
    const { selectedNodes, selectedEdges } = getSelectedItems();
    if (selectedNodes.length > 0 || selectedEdges.length > 0) {
      setNodes((nds) => nds.filter((n) => !n.selected));
      setEdges((eds) => eds.filter((e) => !e.selected));
      scheduleSnapshot();
      console.log(
        `Deleted ${selectedNodes.length} nodes and ${selectedEdges.length} edges`,
      );
    }
  }, [getSelectedItems, setNodes, setEdges, scheduleSnapshot]);

  useEffect(() => {
    const onKeyDown = (e) => {
      // Check if we're in an input field
      const isInputActive =
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.contentEditable === "true";

      // F2 for editing node labels
      if (e.key === "F2" && selected?.kind === "node") {
        e.preventDefault();
        setNodes((nds) =>
          nds.map((n) =>
            n.id === selected.id
              ? { ...n, data: { ...n.data, editing: true } }
              : n,
          ),
        );
        return;
      }

      // Skip keyboard shortcuts if user is typing in an input
      if (isInputActive) return;

      // Keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "z":
            if (e.shiftKey) {
              // Ctrl+Shift+Z or Ctrl+Y for redo
              e.preventDefault();
              redo();
            } else {
              // Ctrl+Z for undo
              e.preventDefault();
              undo();
            }
            break;
          case "y":
            // Ctrl+Y for redo
            e.preventDefault();
            redo();
            break;
          case "c":
            // Ctrl+C for copy
            e.preventDefault();
            copySelected();
            break;
          case "v":
            // Ctrl+V for paste
            e.preventDefault();
            pasteFromClipboard();
            break;
          case "a":
            // Ctrl+A for select all
            e.preventDefault();
            selectAll();
            break;
          default:
            break;
        }
      } else {
        // Non-Ctrl shortcuts
        switch (e.key) {
          case "Delete":
          case "Backspace":
            e.preventDefault();
            deleteSelected();
            break;
          case "Escape":
            // Deselect all
            setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
            setEdges((eds) => eds.map((e) => ({ ...e, selected: false })));
            setSelected(null);
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    selected,
    setNodes,
    setEdges,
    undo,
    redo,
    copySelected,
    pasteFromClipboard,
    selectAll,
    deleteSelected,
    setSelected,
  ]);

  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const saveDiagram = async () => {
    if (!activeTabId || !activeTab) return;

    setIsSaving(true);
    const payloadContent = {
      nodes,
      edges,
      viewport: rf.getViewport(),
    };

    console.log("------------------------------------------");
    console.log("[Flowchart] EXPLICIT SAVE TRIGGERED");
    console.log("[Flowchart] Nodes Count:", nodes.length);
    console.log("[Flowchart] Edges Count:", edges.length);
    console.log("------------------------------------------");

    try {
      // 1. Save to the specialized Flowchart backend API
      // Update Redux tabs state first to ensure consistency
      const latestTabs = tabs.map(t =>
        t.id === activeTabId
          ? { ...t, state: payloadContent }
          : t
      );

      await saveDiagramData(payloadContent, 'flowchart');

      // 2. Save to the individual project file
      if (activeProjectId) {
        const tabName = activeTab.name || "flow_diagram";
        const sanitizedName = sanitizeSegment(tabName);
        const fileName = `${sanitizedName}.json`;

        await canvasIntegration.saveCanvasToFile(
          payloadContent,
          `Flowchart/${fileName}`,
          activeProjectId,
        );
        console.log(`[Flowchart] Saved to project file: Flowchart/${fileName}`);
      }

      // 3. Mark tab as clean in Redux
      dispatch(markTabClean(activeTabId));

      toast({
        title: "Flowchart Saved",
        description: `"${activeTab.name}" has been saved successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error) {
      console.error("[Flowchart] Save failed:", error);
      toast({
        title: "Save Failed",
        description: error.message || "An error occurred while saving.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const loadDiagram = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          setNodes(parsed.nodes || []);
          setEdges(parsed.edges || []);
          if (parsed.viewport) rf.setViewport(parsed.viewport);
        } catch (err) {
          console.error("Invalid diagram JSON", err);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Property panel handlers
  const updateSelectedNode = (mapper) => {
    if (!selected || selected.kind !== "node") return;
    setNodes((nds) => nds.map((n) => (n.id === selected.id ? mapper(n) : n)));
    scheduleSnapshot();
  };

  const getSelectedEntity = () => {
    if (!selected) return null;
    if (selected.kind === "node")
      return nodes.find((n) => n.id === selected.id) || null;
    return edges.find((e) => e.id === selected.id) || null;
  };

  const selectedEntity = getSelectedEntity();

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
    [navigate],
  );

  // Project management integration
  useEffect(() => {
    const checkProjects = async () => {
      const allProjects = projectFileManager.getAllProjects();
      const projects = Object.values(allProjects);
      setHasProjects(projects.length > 0);

      // Set active project if available
      if (projects.length > 0 && !activeProjectId && setActiveProjectId) {
        const activeProject = projectFileManager.getActiveProject();
        if (activeProject) {
          setActiveProjectId(activeProject.id);
        } else {
          setActiveProjectId(projects[0].id);
          projectFileManager.setActiveProject(projects[0].id);
        }
      }
    };

    checkProjects();

    // Listen for project changes
    const handleProjectChange = () => {
      const allProjects = projectFileManager.getAllProjects();
      const projects = Object.values(allProjects);
      setHasProjects(projects.length > 0);
    };

    const handleProjectCreated = () => {
      checkProjects();
    };

    window.addEventListener("project:change", handleProjectChange);
    window.addEventListener("project-created", handleProjectCreated);
    window.addEventListener("file-system-refresh", checkProjects);

    return () => {
      window.removeEventListener("project:change", handleProjectChange);
      window.removeEventListener("project-created", handleProjectCreated);
      window.removeEventListener("file-system-refresh", checkProjects);
    };
  }, [activeProjectId, userId]);

  // (useEffect removed from here and moved below handleFileClick)


  // File click handler for project integration
  const handleFileClick = useCallback(
    async (filePath, fileName, parsedContent, fileData) => {
      try {
        // Basic validation
        if (!parsedContent || typeof parsedContent !== 'object') {
          console.error("[Flowchart] Invalid parsed content for file:", fileName);
          return;
        }

        // Extract diagram state (handle both flat and nested formats)
        const diagramState = parsedContent.nodes ? parsedContent : (parsedContent.state || parsedContent);
        const hasNodes = diagramState.nodes && Array.isArray(diagramState.nodes);
        const hasEdges = diagramState.edges && Array.isArray(diagramState.edges);

        console.log("------------------------------------------");
        console.log("[Flowchart] File Clicked:", fileName);
        console.log("[Flowchart] File Path:", filePath);
        console.log("[Flowchart] Nodes Count:", diagramState?.nodes?.length || 0);
        console.log("[Flowchart] Edges Count:", diagramState?.edges?.length || 0);
        console.log("------------------------------------------");

        // Check if tab already exists for this file (Improved matching)
        const strippedFileName = fileName.replace(/\.json$/, "");
        const normalize = (s) => (s || "").replace(/blockdiagram_|flowchart_/gi, "").replace(/[\s\-_]/g, "").toLowerCase();
        const normalizedStripped = normalize(strippedFileName);

        const existingTab = tabs.find(
          (tab) => tab.fileId === filePath || normalize(tab.name) === normalizedStripped
        );

        if (existingTab) {
          // Only update if needed
          const hasNodes = parsedContent.nodes && Array.isArray(parsedContent.nodes);
          const hasEdges = parsedContent.edges && Array.isArray(parsedContent.edges);

          if (activeTabId !== existingTab.id) {
            console.log("[Flowchart] Found existing tab. Switching to ID:", existingTab.id);
            dispatch(setActiveTab(existingTab.id));
          }

          console.log("[Flowchart] Force-updating existing tab from file content");
          dispatch(updateTabState({
            tabId: existingTab.id,
            nodes: diagramState.nodes || [],
            edges: diagramState.edges || [],
            viewport: diagramState.viewport || null
          }));
        } else {
          console.log("[Flowchart] Creating new tab for:", fileName);
          // Load file into a NEW tab
          const newId = `tab-${Date.now()}`;
          dispatch(
            addTab({
              id: newId,
              name: strippedFileName,
              fileId: filePath,
              state: {
                nodes: diagramState?.nodes || [],
                edges: diagramState?.edges || [],
                viewport: diagramState?.viewport || null,
              },
              dirty: false,
            })
          );
        }

        // Force viewport update on next tick
        if (parsedContent.viewport && rf) {
          setTimeout(() => {
            rf.setViewport(parsedContent.viewport);
            rf.fitView({ padding: 0.2, duration: 400, maxZoom: 1 });
          }, 100);
        }

        // Load file using canvas integration (for backend sync if needed)
        await canvasIntegration.loadFileToCanvas(
          filePath,
          fileName,
          parsedContent,
          fileData,
        );

      } catch (error) {
        console.error("[Flowchart] Failed to handle file click:", error);
      }
    },
    [canvasIntegration, dispatch, tabs, activeTabId],
  );

  // Use a ref to track the last loaded file path to avoid redundant loading
  const lastLoadedFilePathRef = useRef(null);

  // Handle incoming file from navigation state (sidebar click)
  useEffect(() => {
    const state = location.state;
    if (state?.filePath && activeProjectId) {
      const { filePath, fileContent } = state;

      // Skip if this file was just loaded
      if (filePath === lastLoadedFilePathRef.current) {
        return;
      }

      const fileName = filePath.split("/").pop();
      console.log("[Flowchart] Loading file from navigation state:", filePath);

      // Use fileContent if passed from Explorer, otherwise load from projectFileManager
      const content = fileContent || projectFileManager.loadFile(activeProjectId, filePath);

      if (content) {
        try {
          // Only parse if it's a string
          const parsed = typeof content === "string" ? JSON.parse(content) : content;
          console.log("[Flowchart] Parsed JSON Content:", parsed);

          lastLoadedFilePathRef.current = filePath;
          handleFileClick(filePath, fileName, parsed, {
            projectId: activeProjectId,
          });

          // Reset the ref after a delay to allow background syncs to resume later
          setTimeout(() => {
            lastLoadedFilePathRef.current = null;
            if (rf && rf.fitView) {
              rf.fitView({ padding: 0.2, duration: 400, maxZoom: 1 });
            }
          }, 2000);

          // Clear state after loading to prevent re-loads on other state changes
          navigate(location.pathname, { replace: true, state: {} });
        } catch (e) {
          console.error("[Flowchart] Failed to parse diagram file:", e);
        }
      }
    }
  }, [
    location.state,
    activeProjectId,
    handleFileClick,
    navigate,
    location.pathname,
  ]);

  // Auto-save REMOVED - Using manual Save button instead

  const showExportPreview = useCallback((dataUrl, fileName) => {
    const host = reactFlowWrapper.current;
    if (!host) return;
    if (getComputedStyle(host).position === "static") {
      host.style.position = "relative";
    }

    const existing = host.querySelector(".diagram-export-preview");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.className = "diagram-export-preview";
    Object.assign(overlay.style, {
      position: "absolute",
      top: "16px",
      right: "16px",
      width: "260px",
      maxHeight: "80%",
      background: "rgba(15,23,42,0.94)",
      border: "1px solid rgba(148,163,184,0.25)",
      borderRadius: "12px",
      boxShadow: "0 18px 48px rgba(15,23,42,0.45)",
      padding: "14px 14px 12px",
      zIndex: "1300",
      color: "#e2e8f0",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      backdropFilter: "blur(8px)",
    });

    const title = document.createElement("div");
    title.textContent = "PNG exported";
    title.style.fontSize = "14px";
    title.style.fontWeight = "600";
    overlay.appendChild(title);

    const img = new Image();
    img.src = dataUrl;
    img.alt = fileName;
    Object.assign(img.style, {
      width: "100%",
      maxHeight: "160px",
      objectFit: "contain",
      borderRadius: "8px",
      border: "1px solid rgba(148,163,184,0.3)",
      background: "#0f172a",
    });
    overlay.appendChild(img);

    const meta = document.createElement("div");
    meta.textContent = fileName;
    meta.style.fontSize = "11px";
    meta.style.opacity = "0.75";
    overlay.appendChild(meta);

    const actions = document.createElement("div");
    Object.assign(actions.style, {
      display: "flex",
      justifyContent: "flex-end",
      gap: "8px",
    });

    const openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.textContent = "Download";
    Object.assign(openBtn.style, {
      padding: "6px 10px",
      borderRadius: "6px",
      border: "1px solid rgba(59,130,246,0.4)",
      background: "#1d4ed8",
      color: "#f8fafc",
      fontSize: "12px",
      cursor: "pointer",
    });
    openBtn.onclick = () => {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = fileName;
      a.click();
    };

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.textContent = "Close";
    Object.assign(closeBtn.style, {
      padding: "6px 10px",
      borderRadius: "6px",
      border: "1px solid rgba(148,163,184,0.35)",
      background: "transparent",
      color: "#cbd5f5",
      fontSize: "12px",
      cursor: "pointer",
    });
    closeBtn.onclick = () => overlay.remove();

    actions.appendChild(closeBtn);
    actions.appendChild(openBtn);
    overlay.appendChild(actions);

    host.appendChild(overlay);
  }, []);

  const handleExportPNG = useCallback(async () => {
    // We target the Viewport to ensure we capture exactly the nodes and edges,
    // without interference from the container's current pan/zoom state.
    const viewportElem = reactFlowWrapper.current?.querySelector('.react-flow__viewport');
    if (!viewportElem) return;

    // Force strict sync of nodes/edges references
    const currentNodes = nodesRef.current || nodes;

    if (currentNodes.length === 0) {
      console.warn("[Flowchart] No nodes to export");
      return;
    }

    let watermark;
    try {
      // Calculate the bounding box of ALL nodes
      const nodesBounds = getRectOfNodes(currentNodes);

      // Define margins
      const padding = 50;
      const watermarkHeight = 120;

      // Calculate dimensions of the export image
      const imageWidth = nodesBounds.width + (padding * 2);
      const imageHeight = nodesBounds.height + (padding * 2) + watermarkHeight;

      // Transform logic:
      // We want the top-left of the bounding box (nodesBounds.x, nodesBounds.y)
      // to be positioned at (padding, padding) in the exported image.
      // So we need to translate by (-nodesBounds.x + padding, -nodesBounds.y + padding).
      const viewportTransform = `translate(${-nodesBounds.x + padding}px, ${-nodesBounds.y + padding}px) scale(1)`;

      // Create watermark and append it to the VIEWPORT so it moves with the coordinate system
      // We position it absolute relative to the viewport's coordinate space.
      // We place it at the bottom-right of the *content*.
      watermark = document.createElement("div");
      watermark.className = "export-watermark";
      Object.assign(watermark.style, {
        position: "absolute",
        left: `${nodesBounds.x + nodesBounds.width - 200}px`, // 200px approx width
        top: `${nodesBounds.y + nodesBounds.height + 80}px`,  // 80px below content
        width: "fit-content",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "rgba(255,255,255,0.9)",
        border: "1px solid #e5e5e5",
        borderRadius: "8px",
        padding: "6px 10px",
        fontSize: "12px",
        color: "#111",
        pointerEvents: "none",
        zIndex: "1000",
      });
      const img = new Image();
      img.src = hexBg;
      img.alt = "InnoIDE";
      img.style.width = "32px";
      img.style.height = "32px";
      img.style.opacity = "0.9";

      // Wait for image to load before adding to watermark
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        // Fallback timeout
        setTimeout(resolve, 1000);
      });

      watermark.appendChild(img);
      const span = document.createElement("span");
      span.textContent = "made with innotrat labs";
      watermark.appendChild(span);

      // Append strictly to viewport
      viewportElem.appendChild(watermark);

      // Small delay to ensure everything is rendered including edges
      await new Promise((resolve) => setTimeout(resolve, 100));

      const dataUrl = await toPng(viewportElem, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        width: imageWidth,
        height: imageHeight,
        style: {
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
          transform: viewportTransform,
        },
      });

      const activeProject = projectFileManager.getActiveProject();
      const projectSegment = sanitizeSegment(
        activeProject?.name || activeProjectName || "project",
      );
      const timeSegment = sanitizeSegment(new Date().toISOString());
      const fileName = `${projectSegment}_flowchart_${timeSegment}.png`;

      // Save to project using new project file manager
      if (activeProject) {
        try {
          const pngPath = await canvasIntegration.exportCanvasAsPNG(
            dataUrl,
            fileName,
            activeProject.id,
          );
          if (pngPath) {
            console.log("PNG exported to project:", pngPath);
          }
        } catch (error) {
          console.error("Failed to save PNG to project:", error);
        }
      }

      window.dispatchEvent(
        new CustomEvent("diagram:export-preview", {
          detail: {
            kind: "Flowchart",
            fileName,
            dataUrl,
            timestamp: Date.now(),
          },
        }),
      );

      showExportPreview(dataUrl, fileName);
    } catch (error) {
      console.error("Failed to export PNG", error);
    } finally {
      if (watermark && watermark.parentNode) {
        watermark.parentNode.removeChild(watermark);
      }
    }
  }, [
    canvasIntegration,
    activeProjectName,
    reactFlowWrapper,
    showExportPreview,
    nodes,
    edges
  ]);

  // Keep React Flow layout in sync with container size changes.
  // Some layout updates (e.g. sidebar toggle, window resize) may not
  // automatically propagate into the React Flow internals. Observe the
  // rf wrapper and force the current viewport to be reapplied which
  // causes React Flow to recalculate canvas dimensions.
  useEffect(() => {
    const host = reactFlowWrapper.current;
    if (!host) return undefined;

    const handleResize = () => {
      if (!reactFlowInstance) return;
      try {
        const vp = reactFlowInstance.getViewport();
        // Reapply viewport on next tick to allow layout to settle
        setTimeout(() => reactFlowInstance.setViewport(vp), 0);
      } catch (err) {
        // ignore errors during rapid mount/unmount
      }
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(host);
    window.addEventListener("resize", handleResize);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [reactFlowInstance]);

  const [showProperties, setShowProperties] = useState(false);


  return (
    <div className="diagram-builder">
      <EditorNavbar
        activeTab="Flowchart"
        onTabChange={handleTabChange}
        onSaveJSON={saveDiagram}
        onLoadJSON={loadDiagram}
        onExportPNG={handleExportPNG}
        onUndo={undo}
        onRedo={redo}
      />
      <div className="content">
        {/* Left palette */}
        <div
          className="sidebarr fc-sidebar-scope"
          style={{ width: sidebarWidth, minWidth: sidebarWidth, maxWidth: sidebarWidth, flex: `0 0 ${sidebarWidth}px` }}
        >
          <div className="sidebar-toggle-bar">
            <button
              type="button"
              className={`sidebar-tab ${isExplorerVisible === "explorer" ? "active" : ""}`}
              onClick={() => setIsExplorerVisible("explorer")}
            >
              Explorer
            </button>
            <button
              type="button"
              className={`sidebar-tab ${isExplorerVisible === "shapes" ? "active" : ""}`}
              onClick={() => setIsExplorerVisible("shapes")}
            >
              Shapes
            </button>
          </div>

          <div className="sidebar-body">
            {isExplorerVisible === "explorer" ? (
              <FileExplorer variant="diagram" />
            ) : (
              <div className="palette-frame">
                {/* <div className="palette-header">
                  <div className="palette-title">Shapes</div>
                </div> */}
                <div className="palette-search">
                  <input
                    type="text"
                    placeholder="Search shapes..."
                    value={paletteSearch}
                    onChange={(e) => setPaletteSearch(e.target.value)}
                  />
                </div>
                <div className="palette-wrapper">
                  {filteredGroups.length ? (
                    filteredGroups.map((g) => {
                      const isExpanded = hasSearch
                        ? true
                        : (openGroups[g.id] ?? true);
                      const toggleGroup = () => {
                        if (hasSearch) return;
                        setOpenGroups((st) => ({ ...st, [g.id]: !st[g.id] }));
                      };
                      return (
                        <div key={g.id} className="palette-group">
                          <div
                            className="palette-header"
                            onClick={toggleGroup}
                            style={{
                              cursor: hasSearch ? "default" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <div className="palette-title">{g.title}</div>
                            <span className="palette-chevron">
                              {isExpanded ? "▾" : "▸"}
                            </span>
                          </div>
                          {isExpanded && (
                            <div className="palette-grid">
                              {g.items.map((s) => (
                                <div
                                  key={s.id || `${s.type}-${s.label}`}
                                  className="shape-card"
                                  draggable
                                  onDragStart={(e) => handlePaletteDragStart(e, s)}
                                  title={s.label}
                                >
                                  <div className="shape-svg">{s.icon}</div>
                                  <div className="shape-label">{s.label}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="palette-empty">
                      No shapes match your search.
                    </div>
                  )}
                </div>
                <div className="palette-hint">
                  Drag from node handles to connect.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Drag Handle */}
        <div
          style={{
            width: '6px',
            background: 'transparent',
            cursor: 'col-resize',
            zIndex: 10,
          }}
          className="sidebar-resizer"
          onMouseDown={startResizing}
        />

        {/* Canvas */}
        <div className="diagram-container">
          <div
            style={{
              padding: "8px 12px",
              background: "#ffffff",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <DiagramTabs title="Flowchart Workspace" kind="flowchart" onSaveJSON={saveDiagram} />
            <div style={{ display: 'flex', gap: '8px' }}>
              {/* <button
                onClick={async () => {
                  const result = await loadSequenceDiagram('/deepseek_json_20260102_a52fe1.json');
                  if (result) {
                    const newId = `sequence-${Date.now()}`;
                    dispatch(addTab({
                      id: newId,
                      name: "Deepseek Sequence",
                      state: {
                        nodes: result.nodes,
                        edges: result.edges,
                        viewport: result.viewport
                      },
                      dirty: true
                    }));
                  }
                }}
                title="Load Device Sequence Diagram"
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ArrowLeftRight size={14} />
                Load Sequence
              </button> */}
              <CreateProductButton />
            </div>
          </div>
          <div className="canvas-frame" onDrop={onDrop} onDragOver={onDragOver}>
            {isSwitchingProject && <DiagramLoader />}

            {hasFetchedOnce && !isSwitchingProject && nodes.length === 0 && (
              <DiagramEmptyState />
            )}

            <div
              className="rf-wrapper"
              ref={reactFlowWrapper}
              style={{
                width: '100%',
                height: '100%',
                opacity: (isSwitchingProject || !isHydrated) ? 0.6 : 1,
                pointerEvents: isSwitchingProject ? 'none' : 'all',
                transition: 'opacity 0.2s ease'
              }}
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onConnectStart={onConnectStart}
                onConnectEnd={onConnectEnd}
                onInit={setReactFlowInstance}
                onNodeDragStop={onNodeDragStop}
                onSelectionChange={onSelectionChange}
                onPaneClick={(e) => { exitEditing(e); setShowProperties(false); }}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                connectionLineType={ConnectionLineType.SmoothStep}
                defaultEdgeOptions={{
                  type: "editable",
                  markerEnd: { type: MarkerType.ArrowClosed },
                }}
                connectOnClick={false}
                connectionMode={ConnectionMode.Strict}
                isValidConnection={(c) =>
                  Boolean(c.sourceHandle && c.targetHandle)
                }
                snapToGrid
                snapGrid={[16, 16]}
                minZoom={0.1}
                maxZoom={4}
                fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
              >
                <MiniMap className="export-ignore" />
                <Controls className="export-ignore">
                  <ControlButton onClick={undo} title="Undo (Ctrl+Z)">
                    <RotateCcw size={16} />
                  </ControlButton>
                  <ControlButton onClick={redo} title="Redo (Ctrl+Y)">
                    <RotateCw size={16} />
                  </ControlButton>
                </Controls>
                <Background className="export-ignore" gap={16} size={1} />
              </ReactFlow>
            </div>

            {/* Floating Properties Toggle Button */}
            {!showProperties && (
              <button
                className="floating-props-toggle"
                onClick={() => setShowProperties(true)}
                title="Show Properties"
                aria-label="Show Properties Panel"
              >
                <Settings size={16} />
              </button>
            )}

            {/* Floating Properties Panel */}
            <div className={`floating-properties-panel${showProperties ? ' is-visible' : ''}`}>
              <div className="floating-props-header">
                <span>Properties</span>
                <button
                  className="floating-props-close"
                  onClick={() => setShowProperties(false)}
                  title="Close"
                  aria-label="Close Properties Panel"
                >
                  ✕
                </button>
              </div>
              <PropertiesPanel
                selectedNode={selected?.kind === "node" ? selectedEntity : null}
                onNodeUpdate={(nodeId, property, value) => {
                  updateSelectedNode((n) => ({
                    ...n,
                    data: { ...n.data, [property]: value },
                  }));
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowchartWorkspace() {
  return (
    <DiagramEditor />
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <FlowchartWorkspace />
    </ReactFlowProvider>
  );
}

export default App;
