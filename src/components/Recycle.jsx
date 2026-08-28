// import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
// import ReactFlow, {
//   Background,
//   Controls,
//   ControlButton,
//   MiniMap,
//   Handle,
//   Position,
//   useNodesState,
//   useEdgesState,
//   addEdge,
//   ConnectionLineType,
//   MarkerType,
//   ReactFlowProvider,
//   useReactFlow,
//   BaseEdge,
//   EdgeLabelRenderer,
//   getSmoothStepPath,
//   ConnectionMode,
// } from 'reactflow';
// import { useNavigate } from 'react-router-dom';
// import { NodeResizer } from '@reactflow/node-resizer';
// import { toPng } from 'html-to-image';
// import 'reactflow/dist/style.css';
// import '@reactflow/node-resizer/dist/style.css';
// import './BlockDiagramTest.css';
// import FileExplorer from './FileExplorer';
// import './FileExplorer.css';
// import EditorNavbar from './EditorNavbar';
// import DiagramTabs from './DiagramTabs';
// import { Settings, ArrowLeftRight, RotateCcw, RotateCw } from 'lucide-react';
// import hexBg from '../assets/hex_bg.png';
// import { useProject } from '../ProjectContext';
// import PropertiesPanel from './PropertiesPanel';
// import { saveProjectFile, sanitizeSegment, ensureProjectFolder } from '../utils/workspaceStorage';
// import { saveAssetToScreenFolder } from '../utils/screenFileManager';
// import { WorkspaceTabsProvider, useWorkspaceTabs } from '../hooks/useWorkspaceTabs';
// import DefineProductButton from './shared/DefineProductButton';
// import projectFileManager from '../utils/projectFileManager';
// import { useCanvasFileIntegration } from '../hooks/useCanvasFileIntegration';
// import ProjectFileExplorer from './ProjectFileExplorer';


// // Simple id helpers
// let nodeId = 1;
// const getId = () => `n_${nodeId++}`;

// const createFlowchartState = () => ({
//   nodes: [],
//   edges: [],
//   viewport: null,
// });

// export const ItemTypes = {
//   SHAPE: 'shape',
// };


// export const shapeData = {
//   'Flowchart': [
//     {
//       id: 'flow-rectangle',
//       name: 'Rectangle',
//       icon: { viewBox: '0 0 100 60', path: 'M0 0 H100 V60 H0 Z' },
//       anchors: [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 30 }, { x: 100, y: 60 }, { x: 50, y: 60 }, { x: 0, y: 60 }, { x: 0, y: 30 }],
//       getHandles: () => [
//         { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
//         { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
//       ]
//     },
//     {
//       id: 'flow-diamond', name: 'Diamond', icon: { viewBox: '0 0 100 100', path: 'M50 0 L100 50 L50 100 L0 50 Z' }, anchors: [{ x: 50, y: 0 }, { x: 100, y: 50 }, { x: 50, y: 100 }, { x: 0, y: 50 }], getHandles: () => [
//         { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
//         { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
//       ]
//     },
//     {
//       id: 'flow-oval', name: 'Oval', icon: { viewBox: '0 0 100 60', path: 'M50,0 A50,30 0 1,0 50,60 A50,30 0 1,0 50,0' }, anchors: [{ x: 50, y: 0 }, { x: 100, y: 30 }, { x: 50, y: 60 }, { x: 0, y: 30 }], getHandles: () => [
//         { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
//         { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
//       ]
//     },
//     {
//       id: 'flow-parallelogram',
//       name: 'Parallelogram',
//       icon: { viewBox: '0 0 100 60', path: 'M20 0 H100 L80 60 H0 Z' },
//       anchors: [{ x: 20, y: 0 }, { x: 100, y: 0 }, { x: 80, y: 60 }, { x: 0, y: 60 }, { x: 60, y: 0 }, { x: 90, y: 30 }, { x: 40, y: 60 }, { x: 10, y: 30 }],
//       getHandles: () => {
//         // Path: M20 0 H100 L80 60 H0 Z
//         const slant = 20; // The horizontal offset of the slanted sides
//         const width = 100;
//         const leftOffset = slant / width;


//         return [
//           { id: 'top', position: Position.Top, style: { top: '0%', left: '60%' } }, // Midpoint of top edge (20,0) to (100,0)
//           { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '40%' } }, // Midpoint of bottom edge (80,60) to (0,60)
//           { id: 'left', position: Position.Left, style: { top: '50%', left: `${leftOffset * 50}%` } }, // Midpoint of left edge (0,60) to (20,0)
//           { id: 'right', position: Position.Right, style: { top: '50%', left: `${100 - (leftOffset * 50)}%` } }, // Midpoint of right edge (100,0) to (80,60)
//         ];
//       }
//     },
//     {
//       id: 'flow-triangle', name: 'Triangle', icon: { viewBox: '0 0 100 86.6', path: 'M50 0 L100 86.6 H0 Z' }, anchors: [{ x: 50, y: 0 }, { x: 100, y: 86.6 }, { x: 0, y: 86.6 }, { x: 75, y: 43.3 }, { x: 25, y: 43.3 }], getHandles: () => [
//         { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'bottom-left', position: Position.Bottom, style: { top: '100%', left: '25%', transform: 'translate(-50%, -50%)' } },
//         { id: 'bottom-right', position: Position.Bottom, style: { top: '100%', left: '75%', transform: 'translate(-50%, -50%)' } },
//         { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
//         { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
//       ]
//     },
//     {
//       id: 'flow-cylinder', name: 'Cylinder', icon: { viewBox: '0 0 100 100', path: 'M50 0 C22.386 0 0 15 0 15 V85 C0 85 22.386 100 50 100 C77.614 100 100 85 100 85 V15 C100 15 77.614 0 50 0 Z M0 15 C0 15 22.386 30 50 30 C77.614 30 100 15 100 15' }, anchors: [{ x: 50, y: 0 }, { x: 100, y: 15 }, { x: 100, y: 85 }, { x: 50, y: 100 }, { x: 0, y: 85 }, { x: 0, y: 15 }], getHandles: () => [
//         { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
//         { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
//       ]
//     },
//     {
//       id: 'flow-circle', name: 'Circle', icon: { viewBox: '0 0 100 100', path: 'M50,0 C22.386,0 0,22.386 0,50 C0,77.614 22.386,100 50,100 C77.614,100 100,77.614 100,50 C100,22.386 77.614,0 50,0 Z' }, anchors: [{ x: 50, y: 0 }, { x: 100, y: 50 }, { x: 50, y: 100 }, { x: 0, y: 50 }], getHandles: () => [
//         { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
//         { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
//       ]
//     },
//     {
//       id: 'flow-right-arrow', name: 'Right Arrow', icon: { viewBox: '0 0 100 60', path: 'M0 20 H70 L70 0 L100 30 L70 60 V40 H0 Z' }, anchors: [{ x: 0, y: 30 }, { x: 70, y: 30 }, { x: 100, y: 30 }, { x: 70, y: 0 }, { x: 70, y: 60 }], getHandles: () => [
//         { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
//         { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
//         { id: 'top', position: Position.Top, style: { top: '0%', left: '70%', transform: 'translate(-50%, -50%)' } },
//         { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '70%', transform: 'translate(-50%, -50%)' } },
//       ]
//     },
//     { id: 'flow-bracket-open', name: 'Bracket Open', icon: { viewBox: '0 0 30 100', path: 'M20 0 H10 V100 H20' } },
//     { id: 'flow-bracket-close', name: 'Bracket Close', icon: { viewBox: '0 0 30 100', path: 'M10 0 H20 V100 H10' } },
//     { id: 'flow-brace-open', name: 'Brace Open', icon: { viewBox: '0 0 30 100', path: 'M20 0 H10 C5 0 5 25 10 25 V75 C5 75 5 100 10 100 H20' } },
//     { id: 'flow-brace-close', name: 'Brace Close', icon: { viewBox: '0 0 30 100', path: 'M10 0 H20 C25 0 25 25 20 25 V75 C25 75 25 100 20 100 H10' } },
//     { id: 'flow-square', name: 'Square', icon: { viewBox: '0 0 100 100', path: 'M0 0 H100 V100 H0 Z' }, anchors: [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 50 }, { x: 100, y: 100 }, { x: 50, y: 100 }, { x: 0, y: 100 }, { x: 0, y: 50 }] },
//     { id: 'flow-hourglass', name: 'Hourglass', icon: { viewBox: '0 0 100 100', path: 'M0 0 H100 L0 100 H100 Z' } },
//     { id: 'flow-document-wavy', name: 'Document', icon: { viewBox: '0 0 100 100', path: 'M0 0 H100 V80 C 75 70, 25 90, 0 80 Z' } },
//     { id: 'flow-magnetic-drum', name: 'Magnetic Drum', icon: { viewBox: '0 0 100 100', path: 'M15 0 C15 22, 0 22, 0 50 C0 78, 15 78, 15 100 H85 C85 78, 100 78, 100 50 C100 22, 85 22, 85 0 Z' } },
//     { id: 'flow-manual-input', name: 'Manual Input', icon: { viewBox: '0 0 100 60', path: 'M0 60 H100 V0 H20 Z' } },
//     { id: 'flow-document-cut', name: 'Document', icon: { viewBox: '0 0 100 100', path: 'M0 0 H75 L100 25 V100 H0 Z' } },
//     { id: 'flow-trapezoid', name: 'Trapezoid', icon: { viewBox: '0 0 100 60', path: 'M20 0 H80 L100 60 H0 Z' } },
//     { id: 'flow-inverted-trapezoid', name: 'Inverted Trapezoid', icon: { viewBox: '0 0 100 60', path: 'M0 0 H100 L80 60 H20 Z' } },
//     { id: 'flow-inverted-triangle', name: 'Inverted Triangle', icon: { viewBox: '0 0 100 86.6', path: 'M0 0 H100 L50 86.6 Z' } },
//     { id: 'flow-shield', name: 'Shield', icon: { viewBox: '0 0 100 100', path: 'M0 20 L50 0 L100 20 V80 C50 100, 50 100, 0 80 Z' } },
//     { id: 'flow-cross', name: 'Cross', icon: { viewBox: '0 0 100 100', path: 'M50 0 C22.4 0 0 22.4 0 50 C0 77.6 22.4 100 50 100 C77.6 100 100 77.6 100 50 C100 22.4 77.6 0 50 0 Z M50 20 V80 M20 50 H80' } },
//     { id: 'flow-flag', name: 'Flag', icon: { viewBox: '0 0 100 100', path: 'M0 0 V100 V0 H50 C 60 10, 90 10, 100 0 V50 C 90 40, 60 40, 50 50 H0 Z' } },
//     { id: 'flow-equals-diamonds', name: 'Equals', icon: { viewBox: '0 0 120 100', path: 'M10 50 L25 35 L40 50 L25 65 Z M45 50 L60 35 L75 50 L60 65 Z M80 50 L95 35 L110 50 L95 65 Z' } },
//     { id: 'flow-hexagon-arrow', name: 'Hexagon Arrow', icon: { viewBox: '0 0 100 86.6', path: 'M0 43.3 L25 0 H75 L100 43.3 L75 86.6 H25 Z' } },
//     { id: 'flow-circle-x', name: 'Circle X', icon: { viewBox: '0 0 100 100', path: 'M50 0 C22.4 0 0 22.4 0 50 C0 77.6 22.4 100 50 100 C77.6 100 100 77.6 100 50 C100 22.4 77.6 0 50 0 Z M20 20 L80 80 M80 20 L20 80' } },
//     { id: 'flow-fat-arrow', name: 'Fat Arrow', icon: { viewBox: '0 0 100 100', path: 'M0 25 H50 V0 L100 50 L50 100 V75 H0 Z' } },
//     { id: 'flow-pentagon', name: 'Pentagon', icon: { viewBox: '0 0 100 95.1', path: 'M50 0 L100 36.3 L80.9 95.1 H19.1 L0 36.3 Z' }, anchors: [{ x: 50, y: 0 }, { x: 100, y: 36.3 }, { x: 80.9, y: 95.1 }, { x: 19.1, y: 95.1 }, { x: 0, y: 36.3 }, { x: 75, y: 65.7 }, { x: 25, y: 65.7 }] },
//     { id: 'flow-hexagon', name: 'Hexagon', icon: { viewBox: '0 0 100 86.6', path: 'M25 0 L75 0 L100 43.3 L75 86.6 H25 L0 43.3 Z' }, anchors: [{ x: 25, y: 0 }, { x: 75, y: 0 }, { x: 100, y: 43.3 }, { x: 75, y: 86.6 }, { x: 25, y: 86.6 }, { x: 0, y: 43.3 }, { x: 50, y: 0 }, { x: 100, y: 65 }, { x: 50, y: 86.6 }, { x: 0, y: 21.6 }] },
//     { id: 'flow-stored-data', name: 'Stored Data', icon: { viewBox: '0 0 100 60', path: 'M20 0 C 30 0, 70 0, 80 0 H 100 V 60 H 20 C 10 60, -10 60, 0 60 V 0 H 20' } },
//     { id: 'flow-internal-storage', name: 'Internal Storage', icon: { viewBox: '0 0 100 100', path: 'M0 0 H100 V100 H0 Z M0 20 H100 M20 0 V100' } },
//     { id: 'block-cloud', name: 'Cloud', icon: { viewBox: '0 0 100 60', path: 'M20,40 Q10,30 20,20 Q15,5 35,10 Q40,0 55,10 Q70,0 75,15 Q95,15 90,35 Q100,45 85,50 Q80,60 65,55 Q55,65 45,55 Q30,65 25,50 Q5,50 20,40 Z', stroke: '#000', strokeWidth: 2, fill: 'white' } },
//     { id: 'flow-paper-tape', name: 'Paper Tape', icon: { viewBox: '0 0 100 120', path: 'M0 20 C 25 10, 75 10, 100 20 V 100 C 75 110, 25 110, 0 100 Z' } }
//   ],

//   'Block Diagram': [
//     {
//       id: 'block-process',
//       name: 'Process',
//       icon: { viewBox: '0 0 100 60', path: 'M0 0 H100 V60 H0 Z' },
//       anchors: [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 30 }, { x: 100, y: 60 }, { x: 50, y: 60 }, { x: 0, y: 60 }, { x: 0, y: 30 }],
//       getHandles: () => [
//         { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
//         { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
//       ]
//     },
//     {
//       id: 'block-decision',
//       name: 'Decision',
//       icon: { viewBox: '0 0 100 100', path: 'M50 0 L100 50 L50 100 L0 50 Z' },
//       anchors: [{ x: 50, y: 0 }, { x: 100, y: 50 }, { x: 50, y: 100 }, { x: 0, y: 50 }],
//       getHandles: () => [
//         { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
//         { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
//       ]
//     },
//     {
//       id: 'block-data',
//       name: 'Data',
//       icon: { viewBox: '0 0 100 60', path: 'M0 0 H100 V60 H0 Z M0 10 H100 M0 20 H100 M0 30 H100 M0 40 H100 M0 50 H100' },
//       anchors: [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 30 }, { x: 100, y: 60 }, { x: 50, y: 60 }, { x: 0, y: 60 }, { x: 0, y: 30 }],
//       getHandles: () => [
//         { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
//         { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
//       ]
//     },
//     {
//       id: 'block-terminal',
//       name: 'Terminal',
//       icon: { viewBox: '0 0 100 60', path: 'M20 0 H80 Q100 0 100 20 V40 Q100 60 80 60 H20 Q0 60 0 40 V20 Q0 0 20 0 Z' },
//       anchors: [{ x: 20, y: 0 }, { x: 50, y: 0 }, { x: 80, y: 0 }, { x: 100, y: 20 }, { x: 100, y: 40 }, { x: 80, y: 60 }, { x: 50, y: 60 }, { x: 20, y: 60 }, { x: 0, y: 40 }, { x: 0, y: 20 }],
//       getHandles: () => [
//         { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
//         { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
//       ]
//     },
//     {
//       id: 'block-connector',
//       name: 'Connector',
//       icon: { viewBox: '0 0 100 100', path: 'M50 0 A50 50 0 1 0 50.001 0 Z' },
//       anchors: [{ x: 50, y: 0 }, { x: 100, y: 50 }, { x: 50, y: 100 }, { x: 0, y: 50 }],
//       getHandles: () => [
//         { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
//         { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
//       ]
//     },
//     {
//       id: 'block-off-page',
//       name: 'Off Page',
//       icon: { viewBox: '0 0 100 60', path: 'M0 0 H100 V60 H0 Z M0 10 H100 M0 20 H100 M0 30 H100 M0 40 H100 M0 50 H100 M10 0 V60 M20 0 V60 M30 0 V60 M40 0 V60 M50 0 V60 M60 0 V60 M70 0 V60 M80 0 V60 M90 0 V60' },
//       anchors: [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 30 }, { x: 100, y: 60 }, { x: 50, y: 60 }, { x: 0, y: 60 }, { x: 0, y: 30 }],
//       getHandles: () => [
//         { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
//         { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
//       ]
//     },
//     {
//       id: 'block-summing',
//       name: 'Summing',
//       icon: { viewBox: '0 0 100 100', path: 'M50 0 A50 50 0 1 0 50.001 0 Z M50 20 A30 30 0 1 0 50.001 20 Z' },
//       anchors: [{ x: 50, y: 0 }, { x: 100, y: 50 }, { x: 50, y: 100 }, { x: 0, y: 50 }],
//       getHandles: () => [
//         { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
//         { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
//       ]
//     },
//     {
//       id: 'block-delay',
//       name: 'Delay',
//       icon: { viewBox: '0 0 100 60', path: 'M0 0 H100 V60 H0 Z M0 15 H100 M0 30 H100 M0 45 H100' },
//       anchors: [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 30 }, { x: 100, y: 60 }, { x: 50, y: 60 }, { x: 0, y: 60 }, { x: 0, y: 30 }],
//       getHandles: () => [
//         { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
//         { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
//       ]
//     }
//   ],

//   'Basic': [
//     {
//       id: 'basic-square',
//       name: 'Square',
//       icon: {
//         viewBox: '0 0 100 100',
//         path: 'M0 0 H100 V100 H0 Z'
//       },
//       anchors: [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 50 }, { x: 100, y: 100 }, { x: 50, y: 100 }, { x: 0, y: 100 }, { x: 0, y: 50 }],
//       getHandles: () => [
//         { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
//         { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
//       ]
//     },
//     {
//       id: 'basic-circle',
//       name: 'Circle',
//       icon: {
//         viewBox: '0 0 100 100',
//         path: 'M50,0 A50,50 0 1,0 50.001,0'
//       },
//       anchors: [{ x: 50, y: 0 }, { x: 100, y: 50 }, { x: 50, y: 100 }, { x: 0, y: 50 }],
//       getHandles: () => [
//         { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
//         { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
//       ]
//     },
//     {
//       id: 'basic-diamond',
//       name: 'Diamond',
//       icon: {
//         viewBox: '0 0 100 100',
//         path: 'M50 0 L100 50 L50 100 L0 50 Z'
//       },
//       anchors: [{ x: 50, y: 0 }, { x: 100, y: 50 }, { x: 50, y: 100 }, { x: 0, y: 50 }],
//       getHandles: () => [
//         { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
//         { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
//       ]
//     },
//     {
//       id: 'basic-triangle-up',
//       name: 'Triangle Up',
//       icon: {
//         viewBox: '0 0 100 86.6',
//         path: 'M50 0 L100 86.6 H0 Z'
//       }
//     },
//     {
//       id: 'basic-triangle-down',
//       name: 'Triangle Down',
//       icon: {
//         viewBox: '0 0 100 86.6',
//         path: 'M0 0 H100 L50 86.6 Z'
//       }
//     },
//     {
//       id: 'basic-ellipse',
//       name: 'Ellipse',
//       icon: {
//         viewBox: '0 0 100 60',
//         path: 'M50 0 C22 0 0 27 0 30 C0 33 22 60 50 60 C78 60 100 33 100 30 C100 27 78 0 50 0 Z'
//       }
//     },
//     {
//       id: 'basic-pentagon',
//       name: 'Pentagon',
//       icon: {
//         viewBox: '0 0 100 95.1',
//         path: 'M50 0 L100 36.3 L80.9 95.1 H19.1 L0 36.3 Z'
//       }
//     },
//     {
//       id: 'basic-octagon',
//       name: 'Octagon',
//       icon: {
//         viewBox: '0 0 100 100',
//         path: 'M30 0 H70 L100 30 V70 L70 100 H30 L0 70 V30 Z'
//       }
//     },
//     {
//       id: 'basic-plus',
//       name: 'Plus',
//       icon: {
//         viewBox: '0 0 100 100',
//         path: 'M40 0 H60 V40 H100 V60 H60 V100 H40 V60 H0 V40 H40 Z'
//       }
//     },
//     {
//       id: 'basic-left-arrow',
//       name: 'Left Arrow',
//       icon: {
//         viewBox: '0 0 100 60',
//         path: 'M100 20 H30 V0 L0 30 L30 60 V40 H100 Z'
//       }
//     },
//     {
//       id: 'basic-right-arrow',
//       name: 'Right Arrow',
//       icon: {
//         viewBox: '0 0 100 60',
//         path: 'M0 20 H70 V0 L100 30 L70 60 V40 H0 Z'
//       }
//     },
//     {
//       id: 'basic-chevron',
//       name: 'Chevron',
//       icon: {
//         viewBox: '0 0 100 100',
//         path: 'M0 0 L50 50 L0 100'
//       }
//     },
//     {
//       id: 'basic-star',
//       name: 'Star',
//       icon: {
//         viewBox: '0 0 100 100',
//         path: 'M50 0 L61 35 H98 L68 57 L79 91 L50 70 L21 91 L32 57 L2 35 H39 Z'
//       }
//     },
//     {
//       id: 'basic-chat-bubble',
//       name: 'Chat Bubble',
//       icon: {
//         viewBox: '0 0 100 100',
//         path: 'M0 0 H100 V80 H30 L0 100 Z'
//       }
//     }
//   ],

//   'UML Use Case Diagram': [
//     {
//       id: 'use-case',
//       name: 'Use Case',
//       icon: {
//         viewBox: '0 0 100 60',
//         path: 'M50 0 C22 0 0 27 0 30 C0 33 22 60 50 60 C78 60 100 33 100 30 C100 27 78 0 50 0 Z'
//       }
//     },
//     {
//       id: 'actor',
//       name: 'Actor',
//       icon: {
//         viewBox: '0 0 100 140',
//         // Use two arcs to draw a full circle for the head to avoid renderer inconsistencies
//         path: 'M50 20 m -20 0 a 20 20 0 1 0 40 0 a 20 20 0 1 0 -40 0 M50 40 V90 M20 60 H80 M50 90 L20 130 M50 90 L80 130',
//         stroke: '#000',
//         strokeWidth: 4,
//         fill: 'none'
//       }
//     },
//     {
//       id: 'extension-point',
//       name: 'Extension Point',
//       icon: {
//         viewBox: '0 0 100 20',
//         path: 'M0 10 H100'
//       }
//     }
//   ],

//   'UML Sequence Diagram': [
//     {
//       id: 'lifeline',
//       name: 'Lifeline',
//       icon: {
//         viewBox: '0 0 100 100',
//         path: 'M50 0 V100 M45 0 H55'
//       }
//     },
//     {
//       id: 'message',
//       name: 'Message',
//       icon: {
//         viewBox: '0 0 100 10',
//         path: 'M0 5 H90 L80 0 M90 5 L80 10'
//       }
//     },
//     {
//       id: 'activation-bar',
//       name: 'Activation Bar',
//       icon: {
//         viewBox: '0 0 20 80',
//         path: 'M0 0 H20 V80 H0 Z'
//       }
//     }
//   ],

//   'UML Timing Diagram': [
//     {
//       id: 'time-line',
//       name: 'Time Line',
//       icon: {
//         viewBox: '0 0 100 10',
//         path: 'M0 5 H100 M10 0 V10 M30 0 V10 M50 0 V10'
//       }
//     },
//     {
//       id: 'state-transition',
//       name: 'State Transition',
//       icon: {
//         viewBox: '0 0 100 100',
//         path: 'M0 50 H50 V100 H100'
//       }
//     },
//     {
//       id: 'timing-box',
//       name: 'Timing Box',
//       icon: {
//         viewBox: '0 0 100 50',
//         path: 'M0 0 H100 V50 H0 Z'
//       }
//     }
//   ],

//   'Data Structures': [
//     {
//       id: 'dsa-array',
//       name: 'Array',
//       icon: { viewBox: '0 0 100 25', path: 'M0 0 H20 V25 H0 Z M25 0 H45 V25 H25 Z M50 0 H70 V25 H50 Z M75 0 H95 V25 H75 Z' },
//       slotGrid: { rows: 1, cols: 4, margin: 3, inset: { top: 10, right: 2, bottom: 10, left: 2 } },
//       slotDefaults: { format: '{i}' }
//     },
//     {
//       id: 'dsa-linked-list',
//       name: 'Linked List',
//       icon: { viewBox: '0 0 120 25', path: 'M0 0 H20 V25 H0 Z M20 12.5 H35 M35 12.5 L30 7.5 M35 12.5 L30 17.5 M40 0 H60 V25 H40 Z M60 12.5 H75 M75 12.5 L70 7.5 M75 12.5 L70 17.5 M80 0 H100 V25 H80 Z' },
//       slotGrid: { rows: 1, cols: 3, margin: 3, inset: { top: 10, right: 2, bottom: 10, left: 2 } },
//       slotDefaults: { format: '{n}' }
//     },
//     {
//       id: 'dsa-stack',
//       name: 'Stack',
//       icon: { viewBox: '0 0 50 100', path: 'M0 0 V100 H50 V0 M0 25 H50 M0 50 H50 M0 75 H50' },
//       slotGrid: { rows: 4, cols: 1, margin: 6, inset: { top: 4, right: 6, bottom: 4, left: 6 } },
//       slotDefaults: { format: '{n}' }
//     },
//     {
//       id: 'dsa-queue',
//       name: 'Queue',
//       icon: { viewBox: '0 0 100 40', path: 'M0 10 V30 H80 V10 H0 M15 0 V10 M15 30 V40 M80 20 L100 20 M95 15 L100 20 L95 25' },
//       slotGrid: { rows: 1, cols: 3, margin: 4, inset: { top: 20, right: 20, bottom: 20, left: 4 } },
//       slotDefaults: { format: '{n}' }
//     },
//     {
//       id: 'dsa-heap',
//       name: 'Heap',
//       icon: { viewBox: '0 0 100 100', path: 'M50 10 A10 10 0 1 1 49.9 10 M50 20 L30 40 M30 50 A10 10 0 1 1 29.9 50 M50 20 L70 40 M70 50 A10 10 0 1 1 69.9 50 M30 60 L20 80 M20 90 A10 10 0 1 1 19.9 90 M30 60 L40 80 M40 90 A10 10 0 1 1 39.9 90' }
//     },
//     {
//       id: 'dsa-priority-queue',
//       name: 'Priority Queue',
//       icon: { viewBox: '0 0 100 60', path: 'M10 30 L20 30 M30 10 L40 10 M50 30 L60 30 M70 10 L80 10 M90 30 L100 30 M40 10 L50 30 L30 10 M60 30 L70 10 L50 30 M80 10 L90 30 L70 10 M20 30 L30 10 M10 30 L20 50 L30 30' }
//     },
//     {
//       id: 'dsa-circular-buffer',
//       name: 'Circular Buffer',
//       icon: { viewBox: '0 0 100 100', path: 'M50 10 A 40 40 0 1 1 10 50 M10 50 L0 40 M10 50 L20 40 M50 10 A 40 40 0 1 0 90 50' }
//     },
//     {
//       id: 'dsa-hash-table',
//       name: 'Hash Table',
//       icon: { viewBox: '0 0 100 100', path: 'M0 0 H100 V100 H0 Z M0 25 H100 M0 50 H100 M0 75 H100 M25 0 V100 M50 0 V100 M75 0 V100' },
//       slotGrid: { rows: 4, cols: 4, margin: 3, inset: { top: 2, right: 2, bottom: 2, left: 2 } },
//       slotDefaults: { format: 'r{r}c{c}' }
//     },
//     {
//       id: 'dsa-binary-tree',
//       name: 'Binary Tree',
//       icon: { viewBox: '0 0 100 100', path: 'M50 10 A10 10 0 1 1 49.9 10 M50 20 L30 40 M30 50 A10 10 0 1 1 29.9 50 M50 20 L70 40 M70 50 A10 10 0 1 1 69.9 50 M30 60 L20 80 M20 90 A10 10 0 1 1 19.9 90 M30 60 L40 80 M40 90 A10 10 0 1 1 39.9 90' }
//     },
//     {
//       id: 'dsa-heap-2',
//       name: 'Heap',
//       icon: { viewBox: '0 0 100 100', path: 'M50 10 A10 10 0 1 1 49.9 10 M50 20 L30 40 M30 50 A10 10 0 1 1 29.9 50 M50 20 L70 40 M70 50 A10 10 0 1 1 69.9 50 M30 60 L20 80 M20 90 A10 10 0 1 1 19.9 90 M30 60 L40 80 M40 90 A10 10 0 1 1 39.9 90 M70 60 L60 80 M60 90 A10 10 0 1 1 59.9 90' }
//     },
//     {
//       id: 'dsa-graph',
//       name: 'Graph',
//       icon: { viewBox: '0 0 100 100', path: 'M10 50 A10 10 0 1 1 9.9 50 M20 50 L40 30 M50 20 A10 10 0 1 1 49.9 20 M60 20 L80 30 M90 40 A10 10 0 1 1 89.9 40 M90 60 L80 70 M90 80 A10 10 0 1 1 89.9 80 M50 80 L40 70 M30 60 A10 10 0 1 1 29.9 60 M40 70 L20 50' }
//     },
//     {
//       id: 'dsa-red-black-tree',
//       name: 'Red-Black Tree',
//       icon: { viewBox: '0 0 100 100', path: 'M50 10 A10 10 0 1 1 49.9 10 M50 20 L30 40 M30 50 A10 10 0 1 1 29.9 50 M50 20 L70 40 M70 50 A10 10 0 1 1 69.9 50 M30 60 L20 80 M20 90 A10 10 0 1 1 19.9 90' }
//     },
//     {
//       id: 'dsa-trie',
//       name: 'Trie',
//       icon: { viewBox: '0 0 100 100', path: 'M50 10 A10 10 0 1 1 49.9 10 M50 20 L30 40 M30 50 A10 10 0 1 1 29.9 50 M50 20 L50 40 M50 50 A10 10 0 1 1 49.9 50 M50 20 L70 40 M70 50 A10 10 0 1 1 69.9 50' }
//     },
//     {
//       id: 'dsa-bitmask',
//       name: 'Bitmask',
//       icon: { viewBox: '0 0 100 100', path: 'M0 0 H100 V100 H0 Z M12.5 25 H25 V75 H12.5 Z M37.5 25 H50 V75 H37.5 Z M62.5 25 H75 V75 H62.5 Z M87.5 25 H100 V75 H87.5 Z' },
//       slotGrid: { rows: 1, cols: 4, margin: 6, inset: { top: 20, right: 6, bottom: 20, left: 6 } },
//       slotDefaults: { format: '0' }
//     },
//     {
//       id: 'dsa-state-table',
//       name: 'State Table',
//       icon: { viewBox: '0 0 100 100', path: 'M0 0 H100 V100 H0 Z M0 25 H100 M0 50 H100 M0 75 H100 M25 0 V100 M50 0 V100 M75 0 V100' },
//       slotGrid: { rows: 4, cols: 4, margin: 3, inset: { top: 2, right: 2, bottom: 2, left: 2 } },
//       slotDefaults: { format: 'r{r}c{c}' }
//     },
//     {
//       id: 'dsa-doubly-linked-list',
//       name: 'Doubly Linked List',
//       icon: { viewBox: '0 0 120 25', path: 'M0 0 H20 V25 H0 Z M20 7.5 H35 M35 7.5 L30 2.5 M35 7.5 L30 12.5 M20 17.5 H35 M20 17.5 L25 12.5 M20 17.5 L25 22.5 M40 0 H60 V25 H40 Z M60 7.5 H75 M75 7.5 L70 2.5 M75 7.5 L70 12.5 M60 17.5 H75 M60 17.5 L65 12.5 M60 17.5 L65 22.5 M80 0 H100 V25 H80 Z' },
//       slotGrid: { rows: 1, cols: 3, margin: 3, inset: { top: 10, right: 2, bottom: 10, left: 2 } },
//       slotDefaults: { format: '{n}' }
//     },
//     {
//       id: 'dsa-red-black-tree-2',
//       name: 'Red-Black Tree',
//       icon: { viewBox: '0 0 100 100', path: 'M50 10 A10 10 0 1 1 49.9 10 M50 20 L30 40 M30 50 A10 10 0 1 1 29.9 50 M50 20 L70 40 M70 50 A10 10 0 1 1 69.9 50 M30 60 L20 80 M20 90 A10 10 0 1 1 19.9 90' }
//     },
//     {
//       id: 'dsa-task-control-block',
//       name: 'Task Control Block',
//       icon: { viewBox: '0 0 100 100', path: 'M10 30 H90 V90 H10 Z M20 40 H80 M20 50 H80 M20 60 H80 M20 70 H80 M20 80 H80' }
//     },
//     {
//       id: 'dsa-graph-adjacency-list',
//       name: 'Graph Adjacency List',
//       icon: { viewBox: '0 0 100 100', path: 'M0 0 H20 V100 H0 Z M30 10 H50 V30 H30 Z M60 10 H80 V30 H60 Z M30 40 H50 V60 H30 Z M60 40 H80 V60 H60 Z M30 70 H50 V90 H30 Z' },
//       slotGrid: { rows: 3, cols: 2, margin: 3, inset: { top: 10, right: 10, bottom: 10, left: 30 } },
//       slotDefaults: { format: 'v{n}' }
//     },
//     {
//       id: 'dsa-interrupt-vector-table',
//       name: 'Interrupt Vector Table',
//       icon: { viewBox: '0 0 100 100', path: 'M0 0 H100 V100 H0 Z M0 25 H100 M0 50 H100 M0 75 H100 M25 0 V100 M50 0 V100 M75 0 V100' },
//       slotGrid: { rows: 4, cols: 4, margin: 3, inset: { top: 2, right: 2, bottom: 2, left: 2 } },
//       slotDefaults: { format: 'r{r}c{c}' }
//     },
//     {
//       id: 'dsa-semaphore',
//       name: 'Semaphore',
//       icon: { viewBox: '0 0 100 100', path: 'M50 70 A20 20 0 0 0 50 30 A20 20 0 0 0 50 70 M30 50 H70 M50 30 V10 M40 10 H60' }
//     },
//     {
//       id: 'dsa-mutex',
//       name: 'Mutex',
//       icon: { viewBox: '0 0 100 100', path: 'M50 70 A20 20 0 0 0 50 30 A20 20 0 0 0 50 70 M30 50 H70 M50 30 V10 M40 10 H60' }
//     },
//     {
//       id: 'dsa-lru-cache',
//       name: 'LRU Cache',
//       icon: { viewBox: '0 0 100 100', path: 'M0 0 H100 V20 H0 Z M0 30 H100 V50 H0 Z M0 60 H100 V80 H0 Z' },
//       slotGrid: { rows: 3, cols: 1, margin: 6, inset: { top: 6, right: 6, bottom: 6, left: 6 } },
//       slotDefaults: { format: '{n}' }
//     },
//     {
//       id: 'dsa-buffer-pool',
//       name: 'Buffer Pool',
//       icon: { viewBox: '0 0 100 100', path: 'M0 0 H100 V100 H0 Z M0 25 H100 M0 50 H100 M0 75 H100 M25 0 V100 M50 0 V100 M75 0 V100' },
//       slotGrid: { rows: 4, cols: 4, margin: 3, inset: { top: 2, right: 2, bottom: 2, left: 2 } },
//       slotDefaults: { format: 'r{r}c{c}' }
//     }
//   ],

//   'Activity & State Diagram': [
//     {
//       id: 'activity',
//       name: 'Activity',
//       icon: {
//         viewBox: '0 0 100 60',
//         path: 'M0 0 H100 V60 H0 Z'
//       },
//       anchors: [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 30 }, { x: 100, y: 60 }, { x: 50, y: 60 }, { x: 0, y: 60 }, { x: 0, y: 30 }],
//       getHandles: () => [
//         { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
//         { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
//       ]
//     },
//     {
//       id: 'decision',
//       name: 'Decision',
//       icon: {
//         viewBox: '0 0 100 100',
//         path: 'M50 0 L100 50 L50 100 L0 50 Z'
//       },
//       anchors: [{ x: 50, y: 0 }, { x: 100, y: 50 }, { x: 50, y: 100 }, { x: 0, y: 50 }],
//       getHandles: () => [
//         { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
//         { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
//       ]
//     },
//     {
//       id: 'start-state',
//       name: 'Start',
//       icon: {
//         viewBox: '0 0 100 100',
//         path: 'M50 0 A50 50 0 1 0 50.001 0 Z'
//       },
//       anchors: [{ x: 50, y: 0 }, { x: 100, y: 50 }, { x: 50, y: 100 }, { x: 0, y: 50 }],
//       getHandles: () => [
//         { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
//         { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
//       ]
//     },
//     {
//       id: 'end-state',
//       name: 'End',
//       icon: {
//         viewBox: '0 0 100 100',
//         path: 'M50 0 A50 50 0 1 0 50.001 0 Z M20 20 A30 30 0 1 0 20.001 20 Z'
//       },
//       anchors: [{ x: 50, y: 0 }, { x: 100, y: 50 }, { x: 50, y: 100 }, { x: 0, y: 50 }],
//       getHandles: () => [
//         { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
//         { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
//         { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
//       ]
//     },
//     {
//       id: 'note',
//       name: 'Note',
//       icon: {
//         viewBox: '0 0 100 100',
//         path: 'M0 0 H70 L100 30 V100 H0 Z M70 0 V30 H100'
//       }
//     }
//   ],
// };

// const findShapeConfigById = (shapeId) => {
//   if (!shapeId) return null;
//   for (const group of Object.values(shapeData)) {
//     const match = group.find((shape) => shape.id === shapeId);
//     if (match) return match;
//   }
//   return null;
// };

// const buildSlotValues = (shape, existing = []) => {
//   const slotGrid = shape?.slotGrid;
//   if (!slotGrid?.rows || !slotGrid?.cols) return [];

//   const total = slotGrid.rows * slotGrid.cols;
//   const values = new Array(total);

//   for (let idx = 0; idx < total; idx += 1) {
//     if (Array.isArray(existing) && idx < existing.length && existing[idx] !== undefined) {
//       values[idx] = existing[idx];
//       continue;
//     }

//     values[idx] = '';
//   }

//   return values;
// };

// // Shared node base styles
// const baseNodeStyles = (data) => ({
//   width: '100%',
//   height: '100%',
//   color: data?.text || '#000000',
//   fontSize: data?.fontSize || 12,
//   transform: `rotate(${data?.rotation || 0}deg)`,
//   transformOrigin: 'center center',
// });

// const HANDLE_POSITIONS = {
//   top: { top: 0, left: '50%', transform: 'translate(-50%, -50%)' },
//   right: { top: '50%', right: 0, transform: 'translate(50%, -50%)' },
//   bottom: { bottom: 0, left: '50%', transform: 'translate(-50%, 50%)' },
//   left: { top: '50%', left: 0, transform: 'translate(-50%, -50%)' },
// };

// const baseHandleStyle = (data) => ({
//   width: 12,
//   height: 12,
//   borderRadius: '50%',
//   background: data?.stroke || '#27374D',
//   border: `2px solid ${data?.fill || '#ffffff'}`,
// });

// // Process (rectangle)
// function ProcessNode({ id, data, selected }) {
//   const rf = useReactFlow();
//   const [val, setVal] = useState(data?.label ?? 'Text');
//   const commit = (next) => {
//     rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: next, editing: false } } : n)));
//     window.dispatchEvent(new Event('rf-change'));
//   };

//   return (
//     <div
//       style={{
//         ...baseNodeStyles(data),
//         background: data?.fill || '#ffffff',
//         border: `${data?.strokeWidth ?? 2}px solid ${data?.stroke || '#000000'}`,
//         borderRadius: 6,
//         position: 'relative',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         boxSizing: 'border-box'
//       }}
//       onDoubleClick={() => rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, editing: true } } : n)))}
//     >
//       <NodeResizer
//         isVisible={selected}
//         minWidth={80}
//         minHeight={40}
//         color={data?.stroke || '#000'}
//         lineStyle={data?.strokeWidth ? { strokeWidth: data.strokeWidth } : undefined}
//       />
//       <Handle id="top-in" type="target" position={Position.Top} style={{ ...HANDLE_POSITIONS.top, ...baseHandleStyle(data) }} />
//       <Handle id="right-in" type="target" position={Position.Right} style={{ ...HANDLE_POSITIONS.right, ...baseHandleStyle(data) }} />
//       <Handle id="bottom-in" type="target" position={Position.Bottom} style={{ ...HANDLE_POSITIONS.bottom, ...baseHandleStyle(data) }} />
//       <Handle id="left-in" type="target" position={Position.Left} style={{ ...HANDLE_POSITIONS.left, ...baseHandleStyle(data) }} />
//       <Handle id="top-out" type="source" position={Position.Top} style={{ ...HANDLE_POSITIONS.top, ...baseHandleStyle(data) }} />
//       <Handle id="right-out" type="source" position={Position.Right} style={{ ...HANDLE_POSITIONS.right, ...baseHandleStyle(data) }} />
//       <Handle id="bottom-out" type="source" position={Position.Bottom} style={{ ...HANDLE_POSITIONS.bottom, ...baseHandleStyle(data) }} />
//       <Handle id="left-out" type="source" position={Position.Left} style={{ ...HANDLE_POSITIONS.left, ...baseHandleStyle(data) }} />
//       {data?.editing ? (
//         <input
//           className="nodrag nopan nowheel"
//           autoFocus
//           value={val}
//           onChange={(e) => setVal(e.target.value)}
//           onBlur={() => commit(val)}
//           onKeyDown={(e) => e.key === 'Enter' && commit(val)}
//           onMouseDown={(e) => e.stopPropagation()}
//           onDoubleClick={(e) => e.stopPropagation()}
//           style={{
//             width: 'calc(100% - 12px)',
//             border: '1px solid #ccc',
//             borderRadius: 4,
//             padding: '4px 6px',
//             fontSize: 12,
//             position: 'relative',
//             zIndex: 5,
//             background: '#fff',
//             pointerEvents: 'all',
//             textAlign: 'center',
//           }}
//         />
//       ) : (
//         <span
//           style={{
//             color: data?.text || '#000',
//             fontSize: data?.fontSize || 12,
//             textAlign: 'center',
//             margin: '0 12px',
//             display: 'block',
//           }}
//         >
//           {data?.label ?? 'Text'}
//         </span>
//       )}
//     </div>
//   );
// }

// // Decision (diamond)
// function DecisionNode({ id, data, selected }) {
//   const rf = useReactFlow();
//   const [val, setVal] = useState(data?.label ?? 'Text');
//   const commit = (next) => {
//     rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: next, editing: false } } : n)));
//     window.dispatchEvent(new Event('rf-change'));
//   };
//   const fill = data?.fill || '#ffffff';
//   const stroke = data?.stroke || '#000000';
//   const sw = data?.strokeWidth ?? 2;

//   return (
//     <div
//       style={{ ...baseNodeStyles(data), position: 'relative' }}
//       onDoubleClick={() => rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, editing: true } } : n)))}
//     >
//       <NodeResizer
//         isVisible={selected}
//         minWidth={80}
//         minHeight={80}
//         color={data?.stroke || '#000'}
//         lineStyle={data?.strokeWidth ? { strokeWidth: data.strokeWidth } : undefined}
//       />
//       {/* Diamond shape filling the bounds so handles align to corners */}
//       <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
//         <polygon points="50,0 100,50 50,100 0,50" fill={fill} stroke={stroke} strokeWidth={sw} vectorEffect="non-scaling-stroke" />
//       </svg>
//       {/* Label overlay */}
//       <div
//         style={{
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           padding: 6,
//           textAlign: 'center',
//           pointerEvents: 'none',
//         }}
//       >
//         {data?.editing ? (
//           <input
//             className="nodrag nopan nowheel"
//             autoFocus
//             value={val}
//             onChange={(e) => setVal(e.target.value)}
//             onBlur={() => commit(val)}
//             onKeyDown={(e) => e.key === 'Enter' && commit(val)}
//             onMouseDown={(e) => e.stopPropagation()}
//             onDoubleClick={(e) => e.stopPropagation()}
//             style={{
//               width: '100%',
//               border: '1px solid #ccc',
//               borderRadius: 4,
//               padding: '4px 6px',
//               fontSize: 12,
//               position: 'relative',
//               zIndex: 5,
//               background: '#fff',
//               pointerEvents: 'all',
//               textAlign: 'center',
//             }}
//           />
//         ) : (
//           <span style={{ color: data?.text || '#000', fontSize: data?.fontSize || 12, textAlign: 'center', display: 'block', width: '100%' }}>{data?.label ?? 'Text'}</span>
//         )}
//       </div>
//       <Handle id="top-in" type="target" position={Position.Top} style={{ ...HANDLE_POSITIONS.top, ...baseHandleStyle(data) }} />
//       <Handle id="right-in" type="target" position={Position.Right} style={{ ...HANDLE_POSITIONS.right, ...baseHandleStyle(data) }} />
//       <Handle id="bottom-in" type="target" position={Position.Bottom} style={{ ...HANDLE_POSITIONS.bottom, ...baseHandleStyle(data) }} />
//       <Handle id="left-in" type="target" position={Position.Left} style={{ ...HANDLE_POSITIONS.left, ...baseHandleStyle(data) }} />
//       <Handle id="top-out" type="source" position={Position.Top} style={{ ...HANDLE_POSITIONS.top, ...baseHandleStyle(data) }} />
//       <Handle id="right-out" type="source" position={Position.Right} style={{ ...HANDLE_POSITIONS.right, ...baseHandleStyle(data) }} />
//       <Handle id="bottom-out" type="source" position={Position.Bottom} style={{ ...HANDLE_POSITIONS.bottom, ...baseHandleStyle(data) }} />
//       <Handle id="left-out" type="source" position={Position.Left} style={{ ...HANDLE_POSITIONS.left, ...baseHandleStyle(data) }} />
//     </div>
//   );
// }

// // Terminator (rounded rectangle)
// function TerminatorNode({ id, data, selected }) {
//   const rf = useReactFlow();
//   const [val, setVal] = useState(data?.label ?? 'Text');
//   const commit = (next) => {
//     rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: next, editing: false } } : n)));
//     window.dispatchEvent(new Event('rf-change'));
//   };

//   return (
//     <div
//       style={{
//         ...baseNodeStyles(data),
//         background: data?.fill || '#ffffff',
//         border: `${data?.strokeWidth ?? 2}px solid ${data?.stroke || '#000000'}`,
//         borderRadius: 24,
//         position: 'relative',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         boxSizing: 'border-box'
//       }}
//       onDoubleClick={() => rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, editing: true } } : n)))}
//     >
//       <NodeResizer
//         isVisible={selected}
//         minWidth={80}
//         minHeight={40}
//         color={data?.stroke || '#000'}
//         lineStyle={data?.strokeWidth ? { strokeWidth: data.strokeWidth } : undefined}
//       />
//       <Handle id="top-in" type="target" position={Position.Top} style={{ ...HANDLE_POSITIONS.top, ...baseHandleStyle(data) }} />
//       <Handle id="right-in" type="target" position={Position.Right} style={{ ...HANDLE_POSITIONS.right, ...baseHandleStyle(data) }} />
//       <Handle id="bottom-in" type="target" position={Position.Bottom} style={{ ...HANDLE_POSITIONS.bottom, ...baseHandleStyle(data) }} />
//       <Handle id="left-in" type="target" position={Position.Left} style={{ ...HANDLE_POSITIONS.left, ...baseHandleStyle(data) }} />
//       <Handle id="top-out" type="source" position={Position.Top} style={{ ...HANDLE_POSITIONS.top, ...baseHandleStyle(data) }} />
//       <Handle id="right-out" type="source" position={Position.Right} style={{ ...HANDLE_POSITIONS.right, ...baseHandleStyle(data) }} />
//       <Handle id="bottom-out" type="source" position={Position.Bottom} style={{ ...HANDLE_POSITIONS.bottom, ...baseHandleStyle(data) }} />
//       <Handle id="left-out" type="source" position={Position.Left} style={{ ...HANDLE_POSITIONS.left, ...baseHandleStyle(data) }} />
//       {data?.editing ? (
//         <input
//           className="nodrag nopan nowheel"
//           autoFocus
//           value={val}
//           onChange={(e) => setVal(e.target.value)}
//           onBlur={() => commit(val)}
//           onKeyDown={(e) => e.key === 'Enter' && commit(val)}
//           onMouseDown={(e) => e.stopPropagation()}
//           onDoubleClick={(e) => e.stopPropagation()}
//           style={{
//             width: '100%',
//             border: '1px solid #ccc',
//             borderRadius: 4,
//             padding: '4px 6px',
//             fontSize: 12,
//             position: 'relative',
//             zIndex: 5,
//             background: '#fff',
//             pointerEvents: 'all',
//             textAlign: 'center',
//           }}
//         />
//       ) : (
//         <span style={{ color: data?.text || '#000', fontSize: data?.fontSize || 12, textAlign: 'center' }}>{data?.label ?? 'Text'}</span>
//       )}
//     </div>
//   );
// }

// // Ellipse (circle/oval)
// function EllipseNode({ id, data, selected }) {
//   const rf = useReactFlow();
//   const [val, setVal] = useState(data?.label ?? 'Text');
//   const commit = (next) => {
//     rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: next, editing: false } } : n)));
//     window.dispatchEvent(new Event('rf-change'));
//   };

//   return (
//     <div
//       style={{
//         ...baseNodeStyles(data),
//         background: data?.fill || '#ffffff',
//         border: `${data?.strokeWidth ?? 2}px solid ${data?.stroke || '#000000'}`,
//         borderRadius: '50%',
//         position: 'relative',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         boxSizing: 'border-box'
//       }}
//       onDoubleClick={() => rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, editing: true } } : n)))}
//     >
//       <NodeResizer isVisible={selected} minWidth={60} minHeight={60} color={data?.stroke || '#000'} />
//       <Handle id="top-in" type="target" position={Position.Top} style={{ ...HANDLE_POSITIONS.top, ...baseHandleStyle(data) }} />
//       <Handle id="right-in" type="target" position={Position.Right} style={{ ...HANDLE_POSITIONS.right, ...baseHandleStyle(data) }} />
//       <Handle id="bottom-in" type="target" position={Position.Bottom} style={{ ...HANDLE_POSITIONS.bottom, ...baseHandleStyle(data) }} />
//       <Handle id="left-in" type="target" position={Position.Left} style={{ ...HANDLE_POSITIONS.left, ...baseHandleStyle(data) }} />
//       <Handle id="top-out" type="source" position={Position.Top} style={{ ...HANDLE_POSITIONS.top, ...baseHandleStyle(data) }} />
//       <Handle id="right-out" type="source" position={Position.Right} style={{ ...HANDLE_POSITIONS.right, ...baseHandleStyle(data) }} />
//       <Handle id="bottom-out" type="source" position={Position.Bottom} style={{ ...HANDLE_POSITIONS.bottom, ...baseHandleStyle(data) }} />
//       <Handle id="left-out" type="source" position={Position.Left} style={{ ...HANDLE_POSITIONS.left, ...baseHandleStyle(data) }} />
//       {data?.editing ? (
//         <input
//           className="nodrag nopan nowheel"
//           autoFocus
//           value={val}
//           onChange={(e) => setVal(e.target.value)}
//           onBlur={() => commit(val)}
//           onKeyDown={(e) => e.key === 'Enter' && commit(val)}
//           onMouseDown={(e) => e.stopPropagation()}
//           onDoubleClick={(e) => e.stopPropagation()}
//           style={{
//             width: '100%',
//             border: '1px solid #ccc',
//             borderRadius: 4,
//             padding: '4px 6px',
//             fontSize: 12,
//             position: 'relative',
//             zIndex: 5,
//             background: '#fff',
//             pointerEvents: 'all',
//           }}
//         />
//       ) : (
//         <span style={{ color: data?.text || '#000', fontSize: data?.fontSize || 12, textAlign: 'center' }}>{data?.label ?? 'Text'}</span>
//       )}
//     </div>
//   );
// }

// // Data (parallelogram)
// function DataNode({ id, data, selected }) {
//   const rf = useReactFlow();
//   const [val, setVal] = useState(data?.label ?? 'Text');
//   const commit = (next) => {
//     rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: next, editing: false } } : n)));
//     window.dispatchEvent(new Event('rf-change'));
//   };

//   return (
//     <div
//       style={{ ...baseNodeStyles(data), position: 'relative' }}
//       onDoubleClick={() => rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, editing: true } } : n)))}
//     >
//       <NodeResizer isVisible={selected} minWidth={80} minHeight={40} color={data?.stroke || '#000'} />
//       <div
//         style={{
//           width: '80%',
//           height: '70%',
//           position: 'absolute',
//           top: '50%',
//           left: '50%',
//           transform: 'translate(-50%, -50%) skewX(-20deg)',
//           background: data?.fill || '#ffffff',
//           border: `${data?.strokeWidth ?? 2}px solid ${data?.stroke || '#000000'}`,
//           pointerEvents: 'none',
//         }}
//       />
//       <div
//         style={{
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           padding: 6,
//           pointerEvents: 'none',
//         }}
//       >
//         {data?.editing ? (
//           <input
//             className="nodrag nopan nowheel"
//             autoFocus
//             value={val}
//             onChange={(e) => setVal(e.target.value)}
//             onBlur={() => commit(val)}
//             onKeyDown={(e) => e.key === 'Enter' && commit(val)}
//             onMouseDown={(e) => e.stopPropagation()}
//             onDoubleClick={(e) => e.stopPropagation()}
//             style={{
//               width: '100%',
//               border: '1px solid #ccc',
//               borderRadius: 4,
//               padding: '4px 6px',
//               fontSize: 12,
//               position: 'relative',
//               zIndex: 5,
//               background: '#fff',
//               pointerEvents: 'all',
//               textAlign: 'center',
//             }}
//           />
//         ) : (
//           <span style={{ color: data?.text || '#000', fontSize: data?.fontSize || 12 }}>{data?.label ?? 'Text'}</span>
//         )}
//       </div>
//       <Handle id="top-in" type="target" position={Position.Top} />
//       <Handle id="right-in" type="target" position={Position.Right} />
//       <Handle id="bottom-in" type="target" position={Position.Bottom} />
//       <Handle id="left-in" type="target" position={Position.Left} />
//       <Handle id="top-out" type="source" position={Position.Top} />
//       <Handle id="right-out" type="source" position={Position.Right} />
//       <Handle id="bottom-out" type="source" position={Position.Bottom} />
//       <Handle id="left-out" type="source" position={Position.Left} />
//     </div>
//   );
// }

// // Database (cylinder)
// function DatabaseNode({ id, data, selected }) {
//   const rf = useReactFlow();
//   const [val, setVal] = useState(data?.label ?? 'Text');
//   const commit = (next) => {
//     rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: next, editing: false } } : n)));
//     window.dispatchEvent(new Event('rf-change'));
//   };
//   const fill = data?.fill || '#ffffff';
//   const stroke = data?.stroke || '#000000';
//   const sw = data?.strokeWidth ?? 2;
//   return (
//     <div style={{ ...baseNodeStyles(data), position: 'relative' }}
//       onDoubleClick={() => rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, editing: true } } : n)))}>
//       <NodeResizer isVisible={selected} minWidth={80} minHeight={60} color={stroke} />
//       <svg viewBox="0 0 160 80" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
//         <ellipse cx="80" cy="15" rx="70" ry="12" fill={fill} stroke={stroke} strokeWidth={sw} />
//         <rect x="10" y="15" width="140" height="50" fill={fill} stroke={stroke} strokeWidth={sw} />
//         <ellipse cx="80" cy="65" rx="70" ry="12" fill="none" stroke={stroke} strokeWidth={sw} />
//       </svg>
//       <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6, pointerEvents: 'none' }}>
//         {data?.editing ? (
//           <input
//             className="nodrag nopan nowheel"
//             autoFocus
//             value={val}
//             onChange={(e) => setVal(e.target.value)}
//             onBlur={() => commit(val)}
//             onKeyDown={(e) => e.key === 'Enter' && commit(val)}
//             onMouseDown={(e) => e.stopPropagation()}
//             onDoubleClick={(e) => e.stopPropagation()}
//             style={{
//               width: '100%',
//               border: '1px solid #ccc',
//               borderRadius: 4,
//               padding: '4px 6px',
//               fontSize: 12,
//               position: 'relative',
//               zIndex: 5,
//               background: '#fff',
//               pointerEvents: 'all',
//             }}
//           />
//         ) : (
//           <span style={{ color: data?.text || '#000', fontSize: data?.fontSize || 12, textAlign: 'center', display: 'block', width: '100%' }}>{data?.label ?? 'Database'}</span>
//         )}
//       </div>
//       <Handle id="top-in" type="target" position={Position.Top} style={HANDLE_POSITIONS.top} />
//       <Handle id="right-in" type="target" position={Position.Right} style={HANDLE_POSITIONS.right} />
//       <Handle id="bottom-in" type="target" position={Position.Bottom} style={HANDLE_POSITIONS.bottom} />
//       <Handle id="left-in" type="target" position={Position.Left} style={HANDLE_POSITIONS.left} />
//       <Handle id="top-out" type="source" position={Position.Top} style={HANDLE_POSITIONS.top} />
//       <Handle id="right-out" type="source" position={Position.Right} style={HANDLE_POSITIONS.right} />
//       <Handle id="bottom-out" type="source" position={Position.Bottom} style={HANDLE_POSITIONS.bottom} />
//       <Handle id="left-out" type="source" position={Position.Left} style={HANDLE_POSITIONS.left} />
//     </div>
//   );
// }

// // Manual Input (trapezoid)
// function ManualInputNode({ id, data, selected }) {
//   const rf = useReactFlow();
//   const [val, setVal] = useState(data?.label ?? 'Text');
//   const commit = (next) => {
//     rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: next, editing: false } } : n)));
//     window.dispatchEvent(new Event('rf-change'));
//   };
//   const fill = data?.fill || '#ffffff';
//   const stroke = data?.stroke || '#000000';
//   const sw = data?.strokeWidth ?? 2;
//   return (
//     <div style={{ ...baseNodeStyles(data), position: 'relative' }}
//       onDoubleClick={() => rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, editing: true } } : n)))}>
//       <NodeResizer isVisible={selected} minWidth={80} minHeight={40} color={stroke} />
//       <svg viewBox="0 0 160 80" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
//         <polygon points="20,5 155,5 140,75 5,75" fill={fill} stroke={stroke} strokeWidth={sw} />
//       </svg>
//       <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6, pointerEvents: 'none' }}>
//         {data?.editing ? (
//           <input
//             className="nodrag nopan nowheel"
//             autoFocus
//             value={val}
//             onChange={(e) => setVal(e.target.value)}
//             onBlur={() => commit(val)}
//             onKeyDown={(e) => e.key === 'Enter' && commit(val)}
//             onMouseDown={(e) => e.stopPropagation()}
//             onDoubleClick={(e) => e.stopPropagation()}
//             style={{
//               width: '100%',
//               border: '1px solid #ccc',
//               borderRadius: 4,
//               padding: '4px 6px',
//               fontSize: 12,
//               position: 'relative',
//               zIndex: 5,
//               background: '#fff',
//               pointerEvents: 'all',
//             }}
//           />
//         ) : (
//           <span style={{ color: data?.text || '#000', fontSize: data?.fontSize || 12, textAlign: 'center', display: 'block', width: '100%' }}>{data?.label ?? 'Manual Input'}</span>
//         )}
//       </div>
//       <Handle id="top-in" type="target" position={Position.Top} />
//       <Handle id="right-in" type="target" position={Position.Right} />
//       <Handle id="bottom-in" type="target" position={Position.Bottom} />
//       <Handle id="left-in" type="target" position={Position.Left} />
//       <Handle id="top-out" type="source" position={Position.Top} />
//       <Handle id="right-out" type="source" position={Position.Right} />
//       <Handle id="bottom-out" type="source" position={Position.Bottom} />
//       <Handle id="left-out" type="source" position={Position.Left} />
//     </div>
//   );
// }

// // Document (wavy bottom)
// function DocumentNode({ id, data, selected }) {
//   const rf = useReactFlow();
//   const [val, setVal] = useState(data?.label ?? 'Text');
//   const commit = (next) => {
//     rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: next, editing: false } } : n)));
//     window.dispatchEvent(new Event('rf-change'));
//   };
//   const fill = data?.fill || '#ffffff';
//   const stroke = data?.stroke || '#000000';
//   const sw = data?.strokeWidth ?? 2;
//   return (
//     <div style={{ ...baseNodeStyles(data), position: 'relative' }}
//       onDoubleClick={() => rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, editing: true } } : n)))}>
//       <NodeResizer isVisible={selected} minWidth={80} minHeight={50} color={stroke} />
//       <svg viewBox="0 0 160 80" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
//         <rect x="5" y="5" width="150" height="55" fill={fill} stroke={stroke} strokeWidth={sw} />
//         <path d="M5 60 C 35 50, 65 70, 95 60 S 155 70, 155 60" fill="none" stroke={stroke} strokeWidth={sw} />
//       </svg>
//       <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6, pointerEvents: 'none' }}>
//         {data?.editing ? (
//           <input
//             className="nodrag nopan nowheel"
//             autoFocus
//             value={val}
//             onChange={(e) => setVal(e.target.value)}
//             onBlur={() => commit(val)}
//             onKeyDown={(e) => e.key === 'Enter' && commit(val)}
//             onMouseDown={(e) => e.stopPropagation()}
//             onDoubleClick={(e) => e.stopPropagation()}
//             style={{
//               width: '100%',
//               border: '1px solid #ccc',
//               borderRadius: 4,
//               padding: '4px 6px',
//               fontSize: 12,
//               position: 'relative',
//               zIndex: 5,
//               background: '#fff',
//               pointerEvents: 'all',
//             }}
//           />
//         ) : (
//           <span style={{ color: data?.text || '#000', fontSize: data?.fontSize || 12, textAlign: 'center', display: 'block', width: '100%' }}>{data?.label ?? 'Document'}</span>
//         )}
//       </div>
//       <Handle id="top-in" type="target" position={Position.Top} style={HANDLE_POSITIONS.top} />
//       <Handle id="right-in" type="target" position={Position.Right} style={HANDLE_POSITIONS.right} />
//       <Handle id="bottom-in" type="target" position={Position.Bottom} style={HANDLE_POSITIONS.bottom} />
//       <Handle id="left-in" type="target" position={Position.Left} style={HANDLE_POSITIONS.left} />
//       <Handle id="top-out" type="source" position={Position.Top} style={HANDLE_POSITIONS.top} />
//       <Handle id="right-out" type="source" position={Position.Right} style={HANDLE_POSITIONS.right} />
//       <Handle id="bottom-out" type="source" position={Position.Bottom} style={HANDLE_POSITIONS.bottom} />
//       <Handle id="left-out" type="source" position={Position.Left} style={HANDLE_POSITIONS.left} />
//     </div>
//   );
// }

// // Triangle
// function TriangleNode({ id, data, selected }) {
//   const rf = useReactFlow();
//   const [val, setVal] = useState(data?.label ?? 'Text');
//   const commit = (next) => {
//     rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: next, editing: false } } : n)));
//     window.dispatchEvent(new Event('rf-change'));
//   };
//   const fill = data?.fill || '#ffffff';
//   const stroke = data?.stroke || '#000000';
//   const sw = data?.strokeWidth ?? 2;
//   return (
//     <div style={{ ...baseNodeStyles(data), position: 'relative' }}
//       onDoubleClick={() => rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, editing: true } } : n)))}>
//       <NodeResizer isVisible={selected} minWidth={60} minHeight={50} color={stroke} />
//       <svg viewBox="0 0 160 80" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
//         <polygon points="80,5 155,75 5,75" fill={fill} stroke={stroke} strokeWidth={sw} />
//       </svg>
//       <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6, pointerEvents: 'none' }}>
//         {data?.editing ? (
//           <input
//             className="nodrag nopan nowheel"
//             autoFocus
//             value={val}
//             onChange={(e) => setVal(e.target.value)}
//             onBlur={() => commit(val)}
//             onKeyDown={(e) => e.key === 'Enter' && commit(val)}
//             onMouseDown={(e) => e.stopPropagation()}
//             onDoubleClick={(e) => e.stopPropagation()}
//             style={{
//               width: '100%',
//               border: '1px solid #ccc',
//               borderRadius: 4,
//               padding: '4px 6px',
//               fontSize: 12,
//               position: 'relative',
//               zIndex: 5,
//               background: '#fff',
//               pointerEvents: 'all',
//             }}
//           />
//         ) : (
//           <span style={{ color: data?.text || '#000', fontSize: data?.fontSize || 12, textAlign: 'center', display: 'block', width: '100%' }}>{data?.label ?? 'Triangle'}</span>
//         )}
//       </div>
//       <Handle id="top-in" type="target" position={Position.Top} style={HANDLE_POSITIONS.top} />
//       <Handle id="right-in" type="target" position={Position.Right} style={HANDLE_POSITIONS.right} />
//       <Handle id="bottom-in" type="target" position={Position.Bottom} style={HANDLE_POSITIONS.bottom} />
//       <Handle id="left-in" type="target" position={Position.Left} style={HANDLE_POSITIONS.left} />
//       <Handle id="top-out" type="source" position={Position.Top} style={HANDLE_POSITIONS.top} />
//       <Handle id="right-out" type="source" position={Position.Right} style={HANDLE_POSITIONS.right} />
//       <Handle id="bottom-out" type="source" position={Position.Bottom} style={HANDLE_POSITIONS.bottom} />
//       <Handle id="left-out" type="source" position={Position.Left} style={HANDLE_POSITIONS.left} />
//     </div>
//   );
// }

// // Hexagon
// function HexagonNode({ id, data, selected }) {
//   const rf = useReactFlow();
//   const [val, setVal] = useState(data?.label ?? 'Text');
//   const commit = (next) => {
//     rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: next, editing: false } } : n)));
//     window.dispatchEvent(new Event('rf-change'));
//   };
//   const fill = data?.fill || '#ffffff';
//   const stroke = data?.stroke || '#000000';
//   const sw = data?.strokeWidth ?? 2;
//   return (
//     <div style={{ ...baseNodeStyles(data), position: 'relative' }}
//       onDoubleClick={() => rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, editing: true } } : n)))}>
//       <NodeResizer isVisible={selected} minWidth={80} minHeight={50} color={stroke} />
//       <svg viewBox="0 0 160 80" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
//         <polygon points="30,5 130,5 155,40 130,75 30,75 5,40" fill={fill} stroke={stroke} strokeWidth={sw} />
//       </svg>
//       <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6, pointerEvents: 'none' }}>
//         {data?.editing ? (
//           <input
//             className="nodrag nopan nowheel"
//             autoFocus
//             value={val}
//             onChange={(e) => setVal(e.target.value)}
//             onBlur={() => commit(val)}
//             onKeyDown={(e) => e.key === 'Enter' && commit(val)}
//             onMouseDown={(e) => e.stopPropagation()}
//             onDoubleClick={(e) => e.stopPropagation()}
//             style={{
//               width: '100%',
//               border: '1px solid #ccc',
//               borderRadius: 4,
//               padding: '4px 6px',
//               fontSize: 12,
//               position: 'relative',
//               zIndex: 5,
//               background: '#fff',
//               pointerEvents: 'all',
//             }}
//           />
//         ) : (
//           <span style={{ color: data?.text || '#000', fontSize: data?.fontSize || 12, textAlign: 'center', display: 'block', width: '100%' }}>{data?.label ?? 'Hexagon'}</span>
//         )}
//       </div>
//       <Handle id="top-in" type="target" position={Position.Top} style={{ top: 0, left: '50%' }} />
//       <Handle id="right-in" type="target" position={Position.Right} style={{ top: '50%', right: 0 }} />
//       <Handle id="bottom-in" type="target" position={Position.Bottom} style={{ bottom: 0, left: '50%' }} />
//       <Handle id="left-in" type="target" position={Position.Left} style={{ top: '50%', left: 0 }} />
//       <Handle id="top-out" type="source" position={Position.Top} style={{ top: 0, left: '50%' }} />
//       <Handle id="right-out" type="source" position={Position.Right} style={{ top: '50%', right: 0 }} />
//       <Handle id="bottom-out" type="source" position={Position.Bottom} style={{ bottom: 0, left: '50%' }} />
//       <Handle id="left-out" type="source" position={Position.Left} style={{ top: '50%', left: 0 }} />
//     </div>
//   );
// }

// // Generic SVG stamp node (renders imported SVGs as resizable nodes)
// function GenericShapeNode({ id, data, selected }) {
//   const rf = useReactFlow();
//   const [val, setVal] = useState(data?.label ?? '');
//   const [editingSlot, setEditingSlot] = useState(null);
//   const [slotDraft, setSlotDraft] = useState('');
//   const commit = (next) => {
//     rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: next, editing: false } } : n)));
//     window.dispatchEvent(new Event('rf-change'));
//   };

//   const shape = findShapeConfigById(data.shapeId);

//   const fallbackHandles = [
//     { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
//     { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
//     { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
//     { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
//   ];

//   if (!shape) {
//     console.error(`Shape with id ${data.shapeId} not found.`);
//     return <div style={{ ...baseNodeStyles(data), border: '1px solid red', background: '#fee' }}>Shape not found</div>;
//   }

//   const handles = typeof shape.getHandles === 'function' ? shape.getHandles() : fallbackHandles;
//   const slotGrid = shape.slotGrid;
//   const slots = slotGrid ? buildSlotValues(shape, data?.slots) : null;
//   const hasSlots = !!(slotGrid && slots && slots.length > 0);

//   useEffect(() => {
//     if (!slotGrid?.rows || !slotGrid?.cols) return;
//     const expected = slotGrid.rows * slotGrid.cols;
//     const existing = Array.isArray(data?.slots) ? data.slots : [];
//     if (existing.length === expected && existing.every((val) => val !== undefined)) return;

//     const nextSlots = buildSlotValues(shape, existing);
//     rf.setNodes((nds) =>
//       nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, slots: nextSlots } } : n))
//     );
//     window.dispatchEvent(new Event('rf-change'));
//   }, [slotGrid, data?.slots, id, rf, shape]);

//   const startSlotEdit = useCallback((index, initialValue) => {
//     setEditingSlot(index);
//     setSlotDraft(initialValue ?? '');
//   }, []);

//   const commitSlotEdit = useCallback(
//     (index, value) => {
//       if (index == null || index < 0) {
//         setEditingSlot(null);
//         setSlotDraft('');
//         return;
//       }

//       rf.setNodes((nds) =>
//         nds.map((n) => {
//           if (n.id !== id) return n;
//           const shapeCfg = findShapeConfigById(n.data?.shapeId);
//           if (!shapeCfg) return n;
//           const next = buildSlotValues(shapeCfg, n.data?.slots);
//           if (index < next.length) next[index] = value;
//           return { ...n, data: { ...n.data, slots: next } };
//         })
//       );
//       window.dispatchEvent(new Event('rf-change'));
//       setEditingSlot(null);
//       setSlotDraft('');
//     },
//     [id, rf]
//   );

//   const cancelSlotEdit = useCallback(() => {
//     setEditingSlot(null);
//     setSlotDraft('');
//   }, []);

//   return (
//     <div
//       style={{
//         ...baseNodeStyles(data),
//         position: 'relative',
//       }}
//       onDoubleClick={() => {
//         if (hasSlots) return;
//         rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, editing: true } } : n)));
//       }}
//     >
//       <NodeResizer isVisible={selected} minWidth={80} minHeight={40} color={data?.stroke || '#000'} />
//       <svg viewBox={shape.icon.viewBox} preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', inset: 0 }}>
//         <path
//           d={shape.icon.path}
//           fill={data.fill ?? shape.icon.fill ?? '#ffffff'}
//           stroke={data.stroke ?? shape.icon.stroke ?? '#000000'}
//           strokeWidth={data.strokeWidth ?? shape.icon.strokeWidth ?? 2}
//           vectorEffect="non-scaling-stroke"
//         />
//       </svg>
//       {!hasSlots && (
//         <div
//           style={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             padding: 6,
//             pointerEvents: 'none',
//             zIndex: 4,
//           }}
//         >
//           {data?.editing ? (
//             <input
//               className="nodrag nopan nowheel"
//               autoFocus
//               value={val}
//               onChange={(e) => setVal(e.target.value)}
//               onBlur={() => commit(val)}
//               onKeyDown={(e) => e.key === 'Enter' && commit(val)}
//               onMouseDown={(e) => e.stopPropagation()}
//               onDoubleClick={(e) => e.stopPropagation()}
//               style={{
//                 width: '100%',
//                 border: '1px solid #ccc',
//                 borderRadius: 4,
//                 padding: '4px 6px',
//                 fontSize: 12,
//                 position: 'relative',
//                 zIndex: 6,
//                 background: '#fff',
//                 pointerEvents: 'all',
//               }}
//             />
//           ) : (
//             <span style={{ color: data?.text || '#000', fontSize: data?.fontSize || 12, textAlign: 'center', display: 'block', width: '100%' }}>{data?.label ?? ''}</span>
//           )}
//         </div>
//       )}
//       {hasSlots && (
//         <div
//           style={{
//             position: 'absolute',
//             inset: 0,
//             display: 'grid',
//             gridTemplateRows: `repeat(${slotGrid.rows}, 1fr)`,
//             gridTemplateColumns: `repeat(${slotGrid.cols}, 1fr)`,
//             margin: slotGrid.margin ?? 0,
//             pointerEvents: 'none',
//             zIndex: 7,
//           }}
//         >
//           {slots.map((slotValue, index) => {
//             const inset = slotGrid.inset || {};
//             const paddingStyle = {
//               paddingTop: inset.top ?? 0,
//               paddingRight: inset.right ?? 0,
//               paddingBottom: inset.bottom ?? 0,
//               paddingLeft: inset.left ?? 0,
//             };

//             return (
//               <div
//                 key={`${id}-slot-${index}`}
//                 style={{
//                   position: 'relative',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   pointerEvents: 'all',
//                   cursor: 'text',
//                   textAlign: 'center',
//                   ...paddingStyle,
//                 }}
//                 onDoubleClick={(e) => {
//                   e.stopPropagation();
//                   startSlotEdit(index, slotValue);
//                 }}
//               >
//                 {editingSlot === index ? (
//                   <input
//                     className="nodrag nopan nowheel"
//                     autoFocus
//                     value={slotDraft}
//                     onChange={(e) => setSlotDraft(e.target.value)}
//                     onBlur={() => commitSlotEdit(index, slotDraft)}
//                     onKeyDown={(e) => {
//                       if (e.key === 'Enter') {
//                         commitSlotEdit(index, slotDraft);
//                       } else if (e.key === 'Escape') {
//                         cancelSlotEdit();
//                       }
//                     }}
//                     onMouseDown={(e) => e.stopPropagation()}
//                     onDoubleClick={(e) => e.stopPropagation()}
//                     style={{
//                       width: '100%',
//                       height: '100%',
//                       border: '1px solid #ccc',
//                       borderRadius: 3,
//                       padding: '2px 4px',
//                       fontSize: 11,
//                       background: '#fff',
//                       textAlign: 'center',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                     }}
//                   />
//                 ) : (
//                   <span
//                     style={{
//                       fontSize: 11,
//                       color: data?.text || '#000',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       width: '100%',
//                       height: '100%',
//                       userSelect: 'none',
//                       textAlign: 'center',
//                     }}
//                   >
//                     {slotValue}
//                   </span>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       )}
//       {handles.map((handle) => (
//         <React.Fragment key={`${id}-${handle.id}`}>
//           <Handle
//             type="target"
//             position={handle.position}
//             id={`${handle.id}-in`}
//             style={handle.style}
//           />
//           <Handle
//             type="source"
//             position={handle.position}
//             id={`${handle.id}-out`}
//             style={handle.style}
//           />
//         </React.Fragment>
//       ))}
//     </div>
//   );
// }

// // Generic SVG stamp node (renders imported SVGs as resizable nodes)
// function SvgStampNode({ id, data, selected }) {
//   const rf = useReactFlow();
//   return (
//     <div style={{ ...baseNodeStyles(data), position: 'relative' }} onDoubleClick={() => rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, editing: true } } : n)))}>
//       <NodeResizer isVisible={selected} minWidth={40} minHeight={40} color={data?.stroke || '#000'} />
//       <Handle id="top-in" type="target" position={Position.Top} style={{ top: 0, left: '50%' }} />
//       <Handle id="right-in" type="target" position={Position.Right} style={{ top: '50%', right: 0 }} />
//       <Handle id="bottom-in" type="target" position={Position.Bottom} style={{ bottom: 0, left: '50%' }} />
//       <Handle id="left-in" type="target" position={Position.Left} style={{ top: '50%', left: 0 }} />
//       <Handle id="top-out" type="source" position={Position.Top} style={{ top: 0, left: '50%' }} />
//       <Handle id="right-out" type="source" position={Position.Right} style={{ top: '50%', right: 0 }} />
//       <Handle id="bottom-out" type="source" position={Position.Bottom} style={{ bottom: 0, left: '50%' }} />
//       <Handle id="left-out" type="source" position={Position.Left} style={{ top: '50%', left: 0 }} />
//       <img src={data?.src} alt={data?.label || 'stamp'} style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
//     </div>
//   );
// }

// // Node for adding editable text to the canvas
// function TextNode({ id, data, selected }) {
//   const { setNodes } = useReactFlow();
//   const [label, setLabel] = useState(data.label || 'Text');

//   const handleStyle = {
//     width: 8,
//     height: 8,
//     background: '#555',
//     borderRadius: '50%',
//   };

//   const onBlur = (evt) => {
//     const newLabel = evt.currentTarget.textContent;
//     setNodes((nodes) =>
//       nodes.map((node) => {
//         if (node.id === id) {
//           return { ...node, data: { ...node.data, label: newLabel } };
//         }
//         return node;
//       })
//     );
//     window.dispatchEvent(new Event('rf-change'));
//   };

//   return (
//     <div
//       style={{
//         padding: '10px',
//         border: selected ? '1px solid #007bff' : '1px solid transparent',
//         borderRadius: '2px',
//         fontSize: data.fontSize || 16,
//         color: data.text || '#000000',
//         position: 'relative',
//         minWidth: 30,
//         minHeight: 20,
//       }}
//     >
//       <Handle type="source" position={Position.Top} id="top-source" style={handleStyle} />
//       <Handle type="source" position={Position.Right} id="right-source" style={handleStyle} />
//       <Handle type="source" position={Position.Bottom} id="bottom-source" style={handleStyle} />
//       <Handle type="source" position={Position.Left} id="left-source" style={handleStyle} />
//       <Handle type="target" position={Position.Top} id="top-target" style={handleStyle} />
//       <Handle type="target" position={Position.Right} id="right-target" style={handleStyle} />
//       <Handle type="target" position={Position.Bottom} id="bottom-target" style={handleStyle} />
//       <Handle type="target" position={Position.Left} id="left-target" style={handleStyle} />

//       <div
//         contentEditable
//         suppressContentEditableWarning
//         onBlur={onBlur}
//         style={{ outline: 'none', cursor: 'text' }}
//       >
//         {label}
//       </div>
//     </div>
//   );
// }

// // Custom editable edge with inline label + options menu
// function EditableEdge(edgeProps) {
//   const {
//     id,
//     source, target,
//     sourceHandle, targetHandle,
//     sourceX, sourceY, targetX, targetY,
//     sourcePosition, targetPosition,
//     style,
//     markerStart, markerEnd,
//     label,
//     labelStyle,
//     selected,
//     data,
//   } = edgeProps;
//   const rf = useReactFlow();
//   const [edgePath, labelX, labelY] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
//   const [editing, setEditing] = useState(false);
//   const initialLabel = label ?? data?.label ?? '';
//   const [text, setText] = useState(initialLabel);
//   const [open, setOpen] = useState(false);
//   const btnRef = useRef(null);
//   const menuRef = useRef(null);
//   const containerRef = useRef(null);

//   useEffect(() => {
//     setText(label ?? data?.label ?? '');
//   }, [label, data?.label]);

//   // close options popover on outside click or Escape
//   useEffect(() => {
//     if (!open) return;
//     const onPointerDown = (e) => {
//       // clicks anywhere inside the label+button+menu container should NOT close
//       if (containerRef.current && containerRef.current.contains(e.target)) return;
//       setOpen(false);
//       setEditing(false);
//     };
//     const onKey = (e) => {
//       if (e.key === 'Escape') {
//         setOpen(false);
//         setEditing(false);
//       }
//     };
//     document.addEventListener('pointerdown', onPointerDown);
//     document.addEventListener('keydown', onKey);
//     return () => {
//       document.removeEventListener('pointerdown', onPointerDown);
//       document.removeEventListener('keydown', onKey);
//     };
//   }, [open]);

//   const updateEdge = (mapper) => {
//     rf.setEdges((eds) =>
//       eds.map((e) => (e.id === id ? mapper(e) : e))
//     );
//     window.dispatchEvent(new Event('rf-change'));
//   };

//   const commit = () => {
//     const next = text.trim();
//     updateEdge((e) => ({
//       ...e,
//       label: next,
//       data: { ...(e.data || {}), label: next, showLabel: next !== '' },
//     }));
//     setText(next);
//     setEditing(false);
//   };

//   const setArrowMode = (mode) => {
//     if (mode === 'none') {
//       updateEdge((e) => ({ ...e, markerStart: undefined, markerEnd: undefined }));
//     } else if (mode === 'single') {
//       updateEdge((e) => ({ ...e, markerStart: undefined, markerEnd: { type: MarkerType.ArrowClosed } }));
//     } else if (mode === 'double') {
//       updateEdge((e) => ({ ...e, markerStart: { type: MarkerType.ArrowClosed }, markerEnd: { type: MarkerType.ArrowClosed } }));
//     }
//   };

//   const flip = () => {
//     try {
//       rf.updateEdge(
//         { id, source, target, sourceHandle, targetHandle },
//         { id, source: target, target: source, sourceHandle: targetHandle, targetHandle: sourceHandle }
//       );
//     } catch (_) {
//       updateEdge((e) => ({
//         ...e,
//         source: e.target,
//         target: e.source,
//         sourceHandle: e.targetHandle,
//         targetHandle: e.sourceHandle,
//       }));
//     }
//     // swap arrowheads
//     updateEdge((e) => ({ ...e, markerStart: e.markerEnd, markerEnd: e.markerStart }));
//   };

//   const stroke = (style && style.stroke) || '#000000';
//   const textColor = (labelStyle && labelStyle.fill) || '#000000';
//   const currentArrow = (markerStart && markerEnd) ? 'double' : (markerEnd ? 'single' : 'none');
//   const hasStoredLabel = initialLabel.trim().length > 0;
//   const showLabelFlag = data?.showLabel;
//   const showLabel = (typeof showLabelFlag === 'boolean' ? showLabelFlag : hasStoredLabel) && hasStoredLabel;
//   const shouldRenderLabel = editing || showLabel;

//   // draw style with round caps to remove tiny visual gaps
//   const drawStyle = { ...(style || {}), strokeLinecap: 'round', strokeLinejoin: 'round' };

//   // shift label/gear to the side of the edge so they don't sit on top of the stroke
//   const dx = targetX - sourceX;
//   const dy = targetY - sourceY;
//   const len = Math.hypot(dx, dy) || 1;
//   const nx = -dy / len; // perpendicular (normalized)
//   const ny = dx / len;
//   const SIDE_OFFSET = 14; // px
//   const labelOffsetX = nx * SIDE_OFFSET;
//   const labelOffsetY = ny * SIDE_OFFSET;

//   return (
//     <>
//       <BaseEdge id={id} path={edgePath} style={drawStyle} markerStart={markerStart} markerEnd={markerEnd} />
//       <path
//         d={edgePath}
//         fill="none"
//         stroke="transparent"
//         strokeWidth={16}
//         style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
//         onClick={(e) => {
//           e.stopPropagation();
//           rf.setEdges((eds) =>
//             eds.map((ed) =>
//               ed.id === id ? { ...ed, selected: true } : { ...ed, selected: false }
//             )
//           );
//         }}
//         onDoubleClick={(e) => {
//           e.stopPropagation();
//           setEditing(true);
//           // double-click: reveal label and select (atomic update)
//           rf.setEdges((eds) =>
//             eds.map((ed) =>
//               ed.id === id
//                 ? { ...ed, selected: true, data: { ...(ed.data || {}), showLabel: true } }
//                 : { ...ed, selected: false }
//             )
//           );
//         }}
//       />
//       <EdgeLabelRenderer>
//         {open && <div className="edge-backdrop" />}
//         <div
//           ref={containerRef}
//           style={{
//             position: 'absolute',
//             transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
//             pointerEvents: 'all',
//             display: 'flex',
//             alignItems: 'center',
//             gap: 6,
//             zIndex: open ? 30 : 10,
//           }}
//         >
//           {shouldRenderLabel && (
//             editing ? (
//               <input
//                 autoFocus
//                 value={text}
//                 onChange={(e) => setText(e.target.value)}
//                 onBlur={commit}
//                 onKeyDown={(e) => {
//                   if (e.key === 'Enter') commit();
//                   if (e.key === 'Escape') setEditing(false);
//                 }}
//                 style={{
//                   border: '1px solid #ccc',
//                   borderRadius: 4,
//                   padding: '2px 4px',
//                   fontSize: 12,
//                   position: 'relative',
//                   zIndex: 5,
//                   background: '#fff',
//                   pointerEvents: 'all',
//                 }}
//               />
//             ) : (
//               <div
//                 onDoubleClick={(e) => {
//                   e.stopPropagation();
//                   setEditing(true);
//                 }}
//                 style={{
//                   background: '#fff',
//                   border: '1px solid #e5e5e5',
//                   borderRadius: 8,
//                   padding: '2px 6px',
//                   fontSize: 12,
//                   color: textColor,
//                   boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
//                 }}
//                 title="Double-click to edit label"
//               >
//                 {initialLabel || 'Label'}
//               </div>
//             )
//           )}
//           {(selected || open) && (
//             <button
//               ref={btnRef}
//               title={open ? 'Close options' : 'Edge options'}
//               aria-haspopup="dialog"
//               aria-expanded={open}
//               onClick={() => setOpen((v) => !v)}
//               className="edge-icon-btn"
//             >
//               <Settings size={12} />
//             </button>
//           )}
//           {open && (
//             <div
//               ref={menuRef}
//               className="edge-popover"
//               onMouseDown={(e) => e.stopPropagation()}
//             >
//               <div className="segmented">
//                 <button className={currentArrow === 'none' ? 'active' : ''} onClick={() => setArrowMode('none')}>None</button>
//                 <button className={currentArrow === 'single' ? 'active' : ''} onClick={() => setArrowMode('single')}>Single</button>
//                 <button className={currentArrow === 'double' ? 'active' : ''} onClick={() => setArrowMode('double')}>Double</button>
//                 <button className="icon" onClick={flip} title="Flip direction">
//                   <ArrowLeftRight size={14} />
//                 </button>
//               </div>
//               <div className="row">
//                 <span>Border</span>
//                 <input type="color" value={stroke}
//                   onChange={(e) => {
//                     const v = e.target.value;
//                     updateEdge((edge) => ({ ...edge, style: { ...(edge.style || {}), stroke: v } }));
//                   }} />
//               </div>
//               <div className="row">
//                 <span>Text</span>
//                 <input type="color" value={textColor}
//                   onChange={(e) => {
//                     const v = e.target.value;
//                     updateEdge((edge) => ({ ...edge, labelStyle: { ...(edge.labelStyle || {}), fill: v } }));
//                   }} />
//               </div>
//             </div>
//           )}
//         </div>
//       </EdgeLabelRenderer>
//     </>
//   );
// }

// const nodeTypes = {
//   process: ProcessNode,
//   decision: DecisionNode,
//   terminator: TerminatorNode,
//   ellipse: EllipseNode,
//   data: DataNode,
//   database: DatabaseNode,
//   manualInput: ManualInputNode,
//   document: DocumentNode,
//   triangle: TriangleNode,
//   hexagon: HexagonNode,
//   svgStamp: SvgStampNode,
//   genericShape: GenericShapeNode,
//   text: TextNode,
// };

// const edgeTypes = { editable: EditableEdge };

// // Helper function to convert shapeData to palette items
// const createPaletteItemsFromShapeData = (categoryName) => {
//   const shapes = shapeData[categoryName] || [];
//   return shapes.map(shape => ({
//     type: 'genericShape',
//     label: shape.name,
//     shapeId: shape.id,
//     icon: (
//       <svg viewBox={shape.icon.viewBox} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
//         <path
//           d={shape.icon.path}
//           fill={shape.icon.fill || '#fff'}
//           stroke={shape.icon.stroke || '#111'}
//           strokeWidth={shape.icon.strokeWidth || 2}
//         />
//       </svg>
//     ),
//   }));
// };

// // Modern sidebar shape previews organized into dropdown groups
// const PALETTE_GROUPS = [
//   {
//     id: 'flowchart',
//     title: 'Flowchart',
//     items: createPaletteItemsFromShapeData('Flowchart'),
//   },
//   {
//     id: 'basic',
//     title: 'Basic Shapes',
//     items: [
//       ...createPaletteItemsFromShapeData('Basic'),
//       {
//         type: 'text',
//         label: 'Text',
//         icon: <div style={{ fontSize: 24, fontWeight: 'bold' }}>T</div>
//       },
//     ],
//   },
//   {
//     id: 'dsa',
//     title: 'Data Structures',
//     items: createPaletteItemsFromShapeData('Data Structures'),
//   },
//   {
//     id: 'uml-usecase',
//     title: 'UML Use Case',
//     items: createPaletteItemsFromShapeData('UML Use Case Diagram'),
//   },
//   {
//     id: 'uml-sequence',
//     title: 'UML Sequence',
//     items: createPaletteItemsFromShapeData('UML Sequence Diagram'),
//   },
//   {
//     id: 'uml-timing',
//     title: 'UML Timing',
//     items: createPaletteItemsFromShapeData('UML Timing Diagram'),
//   },
//   {
//     id: 'activity-state',
//     title: 'Activity & State',
//     items: createPaletteItemsFromShapeData('Activity & State Diagram'),
//   },

// ];

// function DiagramEditor() {
//   const [isExplorerVisible, setIsExplorerVisible] = useState('shapes');
//   const reactFlowWrapper = useRef(null);
//   const [nodes, setNodes, onNodesChange] = useNodesState([]);
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
//   const [selected, setSelected] = useState(null); // { kind: 'node'|'edge', id, ref }
//   const [openGroups, setOpenGroups] = useState({
//     flowchart: false,
//     blocks: true,
//     basic: false,
//     dsa: false,
//     'uml-usecase': false,
//     'uml-sequence': false,
//     'uml-timing': false,
//     'activity-state': false,
//     connectors: true
//   });
//   const [paletteSearch, setPaletteSearch] = useState('');
//   const rf = useReactFlow();
//   const { activeTab, tabs, loading: tabsLoading, createTab, updateActiveTabState, activeTabId, selectTab } = useWorkspaceTabs();
//   const hydratingRef = useRef(false);

//   // Canvas file integration for Flowchart
//   const canvasIntegration = useCanvasFileIntegration('Flowchart');

//   // Project management state
//   const [hasProjects, setHasProjects] = useState(false);
//   const { user, activeProjectId, activeProjectName, setActiveProjectId } = useProject?.() ?? {};
//   const userId = user?.userId || user?._id || user?.id;

//   // History & snapshots
//   const historyRef = useRef({ entries: [], index: -1 });
//   const debounceRef = useRef(null);
//   const nodesRef = useRef(nodes);
//   const edgesRef = useRef(edges);
//   const clipboardRef = useRef([]);
//   useEffect(() => { nodesRef.current = nodes; }, [nodes]);
//   useEffect(() => { edgesRef.current = edges; }, [edges]);

//   const pushSnapshot = useCallback(() => {
//     const snapshot = { nodes: nodesRef.current, edges: edgesRef.current, viewport: rf.getViewport() };
//     const entries = historyRef.current.entries.slice(0, historyRef.current.index + 1);
//     entries.push(JSON.parse(JSON.stringify(snapshot)));
//     historyRef.current.entries = entries;
//     historyRef.current.index = entries.length - 1;
//   }, [rf]);

//   useEffect(() => {
//     if (!tabsLoading && tabs.length === 0) {
//       createTab();
//     }
//   }, [tabsLoading, tabs, createTab]);

//   useEffect(() => {
//     if (!activeTab) return;
//     hydratingRef.current = true;
//     const state = activeTab.state || createFlowchartState();
//     const nextNodes = state.nodes || [];
//     const nextEdges = state.edges || [];
//     const nextViewport = state.viewport || null;

//     setNodes(nextNodes);
//     setEdges(nextEdges);
//     nodesRef.current = nextNodes;
//     edgesRef.current = nextEdges;

//     historyRef.current = {
//       entries: [JSON.parse(JSON.stringify({ nodes: nextNodes, edges: nextEdges, viewport: nextViewport }))],
//       index: 0,
//     };

//     if (nextViewport) {
//       requestAnimationFrame(() => rf.setViewport(nextViewport));
//     }

//     if (!activeTab.state) {
//       updateActiveTabState(
//         () => ({
//           nodes: nextNodes,
//           edges: nextEdges,
//           viewport: nextViewport || rf.getViewport(),
//         }),
//         { markDirty: false, scheduleSave: false }
//       );
//     }

//     const frame = requestAnimationFrame(() => {
//       hydratingRef.current = false;
//     });
//     return () => cancelAnimationFrame(frame);
//   }, [activeTab, rf, setEdges, setNodes, updateActiveTabState]);

//   const persistCurrentState = useCallback(() => {
//     if (hydratingRef.current) return;
//     updateActiveTabState((prev = createFlowchartState()) => ({
//       ...prev,
//       nodes: nodesRef.current,
//       edges: edgesRef.current,
//       viewport: rf.getViewport(),
//     }));
//   }, [rf, updateActiveTabState]);


//   // undo redo
//   function FlowchartCanvas() {
//     const rf = useReactFlow();
//     const [nodes, setNodes, onNodesChange] = useNodesState([]);
//     const [edges, setEdges, onEdgesChange] = useEdgesState([]);

//     // Add this ref with your other refs
//     const isUndoRedoRef = useRef(false);
//     const historyRef = useRef({ entries: [], index: -1 });
//     const debounceRef = useRef(null);

//     // ... rest of your state
//     const scheduleSnapshot = useCallback(() => {
//       if (isUndoRedoRef.current) return; // Don't snapshot during undo/redo
//       if (debounceRef.current) clearTimeout(debounceRef.current);
//       debounceRef.current = setTimeout(() => {
//         pushSnapshot();
//         persistCurrentState();
//       }, 400);
//     }, [persistCurrentState, pushSnapshot]);

//     const undo = useCallback(() => {
//       const { entries, index } = historyRef.current;
//       if (index > 0) {
//         isUndoRedoRef.current = true;
//         const s = entries[index - 1];
//         historyRef.current.index = index - 1;
//         setNodes(s.nodes || []);
//         setEdges(s.edges || []);
//         if (s.viewport) rf.setViewport(s.viewport);
//         setTimeout(() => {
//           isUndoRedoRef.current = false;
//         }, 100);
//       }
//     }, [setNodes, setEdges, rf]);

//     const redo = useCallback(() => {
//       const { entries, index } = historyRef.current;
//       if (index < entries.length - 1) {
//         isUndoRedoRef.current = true;
//         const s = entries[index + 1];
//         historyRef.current.index = index + 1;
//         setNodes(s.nodes || []);
//         setEdges(s.edges || []);
//         if (s.viewport) rf.setViewport(s.viewport);
//         setTimeout(() => {
//           isUndoRedoRef.current = false;
//         }, 100);
//       }
//     }, [setNodes, setEdges, rf]);
//     const handleNodesChange = useCallback((changes) => {
//       onNodesChange(changes);
//       if (!isUndoRedoRef.current) {
//         const meaningfulChange = changes.some(
//           (change) => change.type === 'position' || change.type === 'dimensions' || change.type === 'remove'
//         );
//         if (meaningfulChange) {
//           scheduleSnapshot();
//         }
//       }
//     }, [onNodesChange, scheduleSnapshot]);

//     const handleEdgesChange = useCallback((changes) => {
//       onEdgesChange(changes);
//       if (!isUndoRedoRef.current) {
//         const meaningfulChange = changes.some(
//           (change) => change.type === 'remove' || change.type === 'add'
//         );
//         if (meaningfulChange) {
//           scheduleSnapshot();
//         }
//       }
//     }, [onEdgesChange, scheduleSnapshot]);

//     const onConnect = useCallback(
//       (params) => {
//         setEdges((eds) =>
//           addEdge(
//             {
//               ...params,
//               type: 'editable',
//               markerEnd: { type: MarkerType.ArrowClosed },
//               label: 'Label',
//               style: { stroke: '#000000', strokeWidth: 2 },
//               labelStyle: { fill: '#000000', fontSize: 12 },
//               data: { showLabel: false },
//             },
//             eds
//           )
//         );
//         scheduleSnapshot();
//       },
//       [setEdges, scheduleSnapshot]
//     );

//     useEffect(() => {
//       // initial snapshot
//       pushSnapshot();
//     }, [pushSnapshot]);


//     const onNodeDragStop = useCallback(() => {
//       scheduleSnapshot();
//     }, [scheduleSnapshot]);


//     const onDragStart = (event, shape) => {
//       // For stamp items, pass a JSON payload with src; for standard nodes, pass the type string
//       let payload;
//       if (shape.type === 'genericShape') {
//         payload = JSON.stringify({ type: 'genericShape', data: { shapeId: shape.shapeId, label: shape.label } });
//       } else if (shape.svgSrc) {
//         payload = JSON.stringify({ type: shape.type, data: { src: shape.svgSrc, label: shape.label } });
//       } else {
//         payload = shape.type;
//       }
//       event.dataTransfer.setData('application/reactflow', payload);
//       event.dataTransfer.effectAllowed = 'move';
//     };

//     const onDragOver = useCallback((event) => {
//       event.preventDefault();
//       event.dataTransfer.dropEffect = 'move';
//     }, []);

//     const filteredGroups = useMemo(() => {
//       const query = paletteSearch.trim().toLowerCase();
//       if (!query) {
//         return PALETTE_GROUPS;
//       }
//       return PALETTE_GROUPS
//         .map((group) => ({
//           ...group,
//           items: group.items.filter((item) => item.label.toLowerCase().includes(query)),
//         }))
//         .filter((group) => group.items.length > 0);
//     }, [paletteSearch]);

//     const hasSearch = Boolean(paletteSearch.trim());

//     const onDrop = useCallback(
//       (event) => {
//         event.preventDefault();
//         const payloadStr = event.dataTransfer.getData('application/reactflow');
//         if (!payloadStr) return;

//         let type = payloadStr;
//         let extraData = {};
//         try {
//           const parsed = JSON.parse(payloadStr);
//           if (parsed && parsed.type) {
//             type = parsed.type;
//             extraData = parsed.data || {};
//           }
//         } catch (_) {
//           // not JSON, fall back to string type
//         }

//         const position = rf.screenToFlowPosition({ x: event.clientX, y: event.clientY });
//         const id = getId();
//         const baseData = { label: '', fill: '#ffffff', stroke: '#000000', text: '#000000', strokeWidth: 2, rotation: 0, fontSize: 12 };
//         const shapeConfig = type === 'genericShape' ? findShapeConfigById(extraData.shapeId) : null;
//         const slots = shapeConfig ? buildSlotValues(shapeConfig, extraData.slots) : undefined;

//         // Compute appropriate initial size based on shape type
//         let initialWidth = 120;
//         let initialHeight = 80;

//         if (type === 'decision' || type === 'ellipse') {
//           initialWidth = 100;
//           initialHeight = 100;
//         } else if (type === 'terminator') {
//           initialWidth = 120;
//           initialHeight = 60;
//         } else if (type === 'text') {
//           initialWidth = 100;
//           initialHeight = 40;
//         }

//         setNodes((nds) =>
//           nds.concat({
//             id,
//             type,
//             position,
//             data: {
//               ...baseData,
//               ...extraData,
//               ...(slots ? { slots } : {}),
//             },
//             style: { width: initialWidth, height: initialHeight },
//           })
//         );
//       },
//       [rf, setNodes]
//     );

//     const onSelectionChange = useCallback(({ nodes: nds, edges: eds }) => {
//       if (nds && nds.length) {
//         setSelected({ kind: 'node', id: nds[0].id });
//       } else if (eds && eds.length) {
//         setSelected({ kind: 'edge', id: eds[0].id });
//       } else {
//         setSelected(null);
//       }
//     }, []);

//     const exitEditing = useCallback(() => {
//       setNodes((nds) => nds.map((n) => (n.data?.editing ? { ...n, data: { ...n.data, editing: false } } : n)));
//     }, [setNodes]);

//     useEffect(() => {
//       const onKeyDown = (e) => {
//         if (e.key === 'F2' && selected?.kind === 'node') {
//           e.preventDefault();
//           setNodes((nds) => nds.map((n) => (n.id === selected.id ? { ...n, data: { ...n.data, editing: true } } : n)));
//         }
//       };
//       window.addEventListener('keydown', onKeyDown);
//       return () => window.removeEventListener('keydown', onKeyDown);
//     }, [selected, setNodes]);

//     // Save / Load as JSON
//     const saveDiagram = () => {
//       const payload = {
//         nodes,
//         edges,
//         viewport: rf.getViewport(),
//       };
//       const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = 'diagram.json';
//       a.click();
//       URL.revokeObjectURL(url);
//     };

//     const loadDiagram = () => {
//       const input = document.createElement('input');
//       input.type = 'file';
//       input.accept = '.json,application/json';
//       input.onchange = (e) => {
//         const file = e.target.files?.[0];
//         if (!file) return;
//         const reader = new FileReader();
//         reader.onload = () => {
//           try {
//             const parsed = JSON.parse(reader.result);
//             setNodes(parsed.nodes || []);
//             setEdges(parsed.edges || []);
//             if (parsed.viewport) rf.setViewport(parsed.viewport);
//           } catch (err) {
//             console.error('Invalid diagram JSON', err);
//           }
//         };
//         reader.readAsText(file);
//       };
//       input.click();
//     };

//     // Property panel handlers
//     const updateSelectedNode = (mapper) => {
//       if (!selected || selected.kind !== 'node') return;
//       setNodes((nds) => nds.map((n) => (n.id === selected.id ? mapper(n) : n)));
//     };



//     const getSelectedEntity = () => {
//       if (!selected) return null;
//       if (selected.kind === 'node') return nodes.find((n) => n.id === selected.id) || null;
//       return edges.find((e) => e.id === selected.id) || null;
//     };

//     const selectedEntity = getSelectedEntity();
//     const isEdge = selected?.kind === 'edge';

//     const navigate = useNavigate();
//     const handleTabChange = useCallback((tab) => {
//       const routes = {
//         Simulation: '/simulation',
//         Flowchart: '/FlowchartTest',
//         'Block Diagram': '/BlockDiagram',
//         'Block Programming': '/blockprogramming',
//         'Code Editor': '/editor',
//       };
//       const next = routes[tab];
//       if (next) {
//         navigate(next);
//       }
//     }, [navigate]);

//     // Project management integration
//     useEffect(() => {
//       const checkProjects = async () => {
//         const allProjects = projectFileManager.getAllProjects();
//         const projects = Object.values(allProjects);
//         setHasProjects(projects.length > 0);

//         // Set active project if available
//         if (projects.length > 0 && !activeProjectId && setActiveProjectId) {
//           const activeProject = projectFileManager.getActiveProject();
//           if (activeProject) {
//             setActiveProjectId(activeProject.id);
//           } else {
//             setActiveProjectId(projects[0].id);
//             projectFileManager.setActiveProject(projects[0].id);
//           }
//         }
//       };

//       checkProjects();

//       // Listen for project changes
//       const handleProjectChange = () => {
//         const allProjects = projectFileManager.getAllProjects();
//         const projects = Object.values(allProjects);
//         setHasProjects(projects.length > 0);
//       };

//       const handleProjectCreated = () => {
//         checkProjects();
//       };

//       window.addEventListener('project:change', handleProjectChange);
//       window.addEventListener('project-created', handleProjectCreated);
//       window.addEventListener('file-system-refresh', checkProjects);

//       return () => {
//         window.removeEventListener('project:change', handleProjectChange);
//         window.removeEventListener('project-created', handleProjectCreated);
//         window.removeEventListener('file-system-refresh', checkProjects);
//       };
//     }, [activeProjectId, userId]);

//     // File click handler for project integration
//     const handleFileClick = useCallback(async (filePath, fileName, parsedContent, fileData) => {
//       try {
//         console.log('File clicked in Flowchart:', fileName, filePath);

//         // Load file using canvas integration
//         const result = await canvasIntegration.loadFileToCanvas(filePath, fileName, parsedContent, fileData);

//         if (result.success) {
//           // Apply content to canvas if it's JSON diagram data
//           if (fileName.endsWith('.json') && parsedContent && typeof parsedContent === 'object') {
//             if (parsedContent.nodes && parsedContent.edges) {
//               setNodes(parsedContent.nodes || []);
//               setEdges(parsedContent.edges || []);

//               // Apply viewport if available
//               if (parsedContent.viewport && rf) {
//                 setTimeout(() => {
//                   rf.setViewport(parsedContent.viewport);
//                 }, 100);
//               }
//             }
//           }

//           console.log(`Loaded ${fileName} into Flowchart canvas`);
//         } else {
//           console.error('Failed to load file:', result.error);
//         }
//       } catch (error) {
//         console.error('Failed to handle file click:', error);
//       }
//     }, [canvasIntegration, setNodes, setEdges, rf]);

//     // Setup auto-save functionality for Flowchart
//     useEffect(() => {
//       const activeProject = projectFileManager.getActiveProject();
//       if (!activeProject) return;

//       // Debounced save trigger
//       const timer = setTimeout(() => {
//         const content = {
//           nodes,
//           edges,
//           viewport: rf.getViewport()
//         };
//         canvasIntegration.saveCanvasToFile(content, 'Flowchart/main_flow.json', activeProject.id);
//       }, 1000);

//       return () => clearTimeout(timer);
//     }, [nodes, edges, rf, canvasIntegration]);

//     const showExportPreview = useCallback((dataUrl, fileName) => {
//       const host = reactFlowWrapper.current;
//       if (!host) return;
//       if (getComputedStyle(host).position === 'static') {
//         host.style.position = 'relative';
//       }

//       const existing = host.querySelector('.diagram-export-preview');
//       if (existing) existing.remove();

//       const overlay = document.createElement('div');
//       overlay.className = 'diagram-export-preview';
//       Object.assign(overlay.style, {
//         position: 'absolute',
//         top: '16px',
//         right: '16px',
//         width: '260px',
//         maxHeight: '80%',
//         background: 'rgba(15,23,42,0.94)',
//         border: '1px solid rgba(148,163,184,0.25)',
//         borderRadius: '12px',
//         boxShadow: '0 18px 48px rgba(15,23,42,0.45)',
//         padding: '14px 14px 12px',
//         zIndex: '1300',
//         color: '#e2e8f0',
//         display: 'flex',
//         flexDirection: 'column',
//         gap: '10px',
//         backdropFilter: 'blur(8px)',
//       });

//       const title = document.createElement('div');
//       title.textContent = 'PNG exported';
//       title.style.fontSize = '14px';
//       title.style.fontWeight = '600';
//       overlay.appendChild(title);

//       const img = new Image();
//       img.src = dataUrl;
//       img.alt = fileName;
//       Object.assign(img.style, {
//         width: '100%',
//         maxHeight: '160px',
//         objectFit: 'contain',
//         borderRadius: '8px',
//         border: '1px solid rgba(148,163,184,0.3)',
//         background: '#0f172a',
//       });
//       overlay.appendChild(img);

//       const meta = document.createElement('div');
//       meta.textContent = fileName;
//       meta.style.fontSize = '11px';
//       meta.style.opacity = '0.75';
//       overlay.appendChild(meta);

//       const actions = document.createElement('div');
//       Object.assign(actions.style, {
//         display: 'flex',
//         justifyContent: 'flex-end',
//         gap: '8px',
//       });

//       const openBtn = document.createElement('button');
//       openBtn.type = 'button';
//       openBtn.textContent = 'Download';
//       Object.assign(openBtn.style, {
//         padding: '6px 10px',
//         borderRadius: '6px',
//         border: '1px solid rgba(59,130,246,0.4)',
//         background: '#1d4ed8',
//         color: '#f8fafc',
//         fontSize: '12px',
//         cursor: 'pointer',
//       });
//       openBtn.onclick = () => {
//         const a = document.createElement('a');
//         a.href = dataUrl;
//         a.download = fileName;
//         a.click();
//       };

//       const closeBtn = document.createElement('button');
//       closeBtn.type = 'button';
//       closeBtn.textContent = 'Close';
//       Object.assign(closeBtn.style, {
//         padding: '6px 10px',
//         borderRadius: '6px',
//         border: '1px solid rgba(148,163,184,0.35)',
//         background: 'transparent',
//         color: '#cbd5f5',
//         fontSize: '12px',
//         cursor: 'pointer',
//       });
//       closeBtn.onclick = () => overlay.remove();

//       actions.appendChild(closeBtn);
//       actions.appendChild(openBtn);
//       overlay.appendChild(actions);

//       host.appendChild(overlay);
//     }, []);

//     const handleExportPNG = useCallback(async () => {
//       const container = reactFlowWrapper.current?.querySelector('.react-flow');
//       if (!container) return;

//       let watermark;
//       try {
//         watermark = document.createElement('div');
//         watermark.className = 'export-watermark';
//         Object.assign(watermark.style, {
//           position: 'absolute',
//           right: '16px',
//           bottom: '16px',
//           display: 'flex',
//           alignItems: 'center',
//           gap: '8px',
//           background: 'rgba(255,255,255,0.9)',
//           border: '1px solid #e5e5e5',
//           borderRadius: '8px',
//           padding: '6px 10px',
//           fontSize: '12px',
//           color: '#111',
//           pointerEvents: 'none',
//           zIndex: '1000',
//         });
//         const img = new Image();
//         img.src = hexBg;
//         img.alt = 'InnoIDE';
//         img.style.width = '32px';
//         img.style.height = '32px';
//         img.style.opacity = '0.9';

//         // Wait for image to load before adding to watermark
//         await new Promise((resolve, reject) => {
//           img.onload = resolve;
//           img.onerror = reject;
//           // Fallback timeout
//           setTimeout(resolve, 1000);
//         });

//         watermark.appendChild(img);
//         const span = document.createElement('span');
//         span.textContent = 'made with innotrat labs';
//         watermark.appendChild(span);
//         container.appendChild(watermark);

//         // Small delay to ensure everything is rendered including edges
//         await new Promise(resolve => setTimeout(resolve, 100));

//         const dataUrl = await toPng(container, {
//           cacheBust: true,
//           backgroundColor: '#ffffff',
//           pixelRatio: 2,
//           filter: (node) => {
//             if (!(node instanceof Element)) return true;
//             const classes = node.classList;
//             if (!classes) return true;
//             // Exclude background, attribution, controls, and minimap
//             if (
//               classes.contains('export-ignore') ||
//               classes.contains('react-flow__background') ||
//               classes.contains('react-flow__attribution') ||
//               classes.contains('react-flow__controls') ||
//               classes.contains('react-flow__minimap')
//             ) {
//               return false;
//             }
//             return true;
//           },
//         });

//         const activeProject = projectFileManager.getActiveProject();
//         const projectSegment = sanitizeSegment(activeProject?.name || activeProjectName || 'project');
//         const timeSegment = sanitizeSegment(new Date().toISOString());
//         const fileName = `${projectSegment}_flowchart_${timeSegment}.png`;

//         // Save to project using new project file manager
//         if (activeProject) {
//           try {
//             const pngPath = await canvasIntegration.exportCanvasAsPNG(dataUrl, fileName, activeProject.id);
//             if (pngPath) {
//               console.log('PNG exported to project:', pngPath);
//             }
//           } catch (error) {
//             console.error('Failed to save PNG to project:', error);
//           }
//         }

//         window.dispatchEvent(
//           new CustomEvent('diagram:export-preview', {
//             detail: {
//               kind: 'Flowchart',
//               fileName,
//               dataUrl,
//               timestamp: Date.now(),
//             },
//           })
//         );

//         showExportPreview(dataUrl, fileName);
//       } catch (error) {
//         console.error('Failed to export PNG', error);
//       } finally {
//         if (watermark && watermark.parentNode) {
//           watermark.parentNode.removeChild(watermark);
//         }
//       }
//     }, [canvasIntegration, activeProjectName, reactFlowWrapper, showExportPreview]);

//     return (
//       <div className="diagram-builder">
//         <EditorNavbar
//           activeTab="Flowchart"
//           onTabChange={handleTabChange}
//           onSaveJSON={saveDiagram}
//           onLoadJSON={loadDiagram}
//           onExportPNG={handleExportPNG}
//         // onUndo={undo}
//         // onRedo={redo}
//         />
//         <div className="content">
//           {/* Left palette */}
//           <div className="sidebarr">
//             <div className="sidebar-toggle-bar">
//               <button
//                 type="button"
//                 className={`sidebar-tab ${isExplorerVisible === 'explorer' ? 'active' : ''}`}
//                 onClick={() => setIsExplorerVisible('explorer')}
//               >
//                 Explorer
//               </button>
//               <button
//                 type="button"
//                 className={`sidebar-tab ${isExplorerVisible === 'shapes' ? 'active' : ''}`}
//                 onClick={() => setIsExplorerVisible('shapes')}
//               >
//                 Shapes
//               </button>
//             </div>

//             <div className="sidebar-body">
//               {isExplorerVisible === 'explorer' ? (
//                 hasProjects ? (
//                   <ProjectFileExplorer
//                     variant="diagram"
//                     onFileClick={handleFileClick}
//                     currentScreenFiles={[]}
//                     activeProjectId={activeProjectId}
//                   />
//                 ) : (
//                   <FileExplorer variant="diagram" />
//                 )
//               ) : (
//                 <div className="palette-frame">
//                   <div className="palette-header">
//                     <div className="palette-title">Shapes</div>
//                   </div>
//                   <div className="palette-search">
//                     <input
//                       type="text"
//                       placeholder="Search shapes..."
//                       value={paletteSearch}
//                       onChange={(e) => setPaletteSearch(e.target.value)}
//                     />
//                   </div>
//                   <div className="palette-wrapper">
//                     {filteredGroups.length ? (
//                       filteredGroups.map((g) => {
//                         const isExpanded = hasSearch ? true : openGroups[g.id] ?? true;
//                         const toggleGroup = () => {
//                           if (hasSearch) return;
//                           setOpenGroups((st) => ({ ...st, [g.id]: !st[g.id] }));
//                         };
//                         return (
//                           <div key={g.id} className="palette-group">
//                             <div
//                               className="palette-header"
//                               onClick={toggleGroup}
//                               style={{
//                                 cursor: hasSearch ? 'default' : 'pointer',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 justifyContent: 'space-between',
//                               }}
//                             >
//                               <div className="palette-title">{g.title}</div>
//                               <span className="palette-chevron">{isExpanded ? '▾' : '▸'}</span>
//                             </div>
//                             {isExpanded && (
//                               <div className="palette-grid">
//                                 {g.items.map((s) => (
//                                   <div
//                                     key={`${s.type}-${s.label}`}
//                                     className="shape-card"
//                                     draggable
//                                     onDragStart={(e) => onDragStart(e, s)}
//                                     title={s.label}
//                                   >
//                                     <div className="shape-svg">{s.icon}</div>
//                                     <div className="shape-label">{s.label}</div>
//                                   </div>
//                                 ))}
//                               </div>
//                             )}
//                           </div>
//                         );
//                       })
//                     ) : (
//                       <div className="palette-empty">No shapes match your search.</div>
//                     )}
//                   </div>
//                   <div className="palette-hint">Drag from node handles to connect.</div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Canvas */}
//           <div className="diagram-container">
//             <div style={{
//               padding: '8px 12px',
//               background: '#ffffff',
//               borderBottom: '1px solid #e5e7eb',
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center'
//             }}>
//               <DiagramTabs title="Flowchart Workspace" />
//               <DefineProductButton position="inline" />
//             </div>
//             <div className="canvas-frame">
//               <div
//                 className="rf-wrapper"
//                 ref={reactFlowWrapper}
//                 onDrop={onDrop}
//                 onDragOver={onDragOver}
//               >
//                 <ReactFlow
//                   nodes={nodes}
//                   edges={edges}
//                   onNodesChange={handleNodesChange}
//                   onEdgesChange={handleEdgesChange}
//                   onConnect={onConnect}
//                   onNodeDragStop={onNodeDragStop}
//                   onSelectionChange={onSelectionChange}
//                   onPaneClick={exitEditing}
//                   nodeTypes={nodeTypes}
//                   edgeTypes={edgeTypes}
//                   fitView
//                   connectionLineType={ConnectionLineType.SmoothStep}
//                   defaultEdgeOptions={{ type: 'editable', markerEnd: { type: MarkerType.ArrowClosed } }}
//                   connectOnClick={false}
//                   connectionMode={ConnectionMode.Strict}
//                   isValidConnection={(c) => Boolean(c.sourceHandle && c.targetHandle)}
//                   snapToGrid
//                   snapGrid={[16, 16]}
//                 >
//                   <MiniMap className="export-ignore" />
//                   <Controls className="export-ignore">
//                     <ControlButton onClick={undo} title="undo">
//                       <RotateCcw />
//                     </ControlButton>
//                     <ControlButton onClick={redo} title="redo">
//                       <RotateCw />
//                     </ControlButton>
//                   </Controls>
//                   <Background className="export-ignore" gap={16} size={1} />
//                 </ReactFlow>
//               </div>
//             </div>
//           </div>

//           {/* Right properties panel */}
//           <PropertiesPanel
//             selectedNode={selected?.kind === 'node' ? selectedEntity : null}
//             onNodeUpdate={(nodeId, property, value) => {
//               updateSelectedNode((n) => ({
//                 ...n,
//                 data: { ...n.data, [property]: value }
//               }));
//             }}
//           />
//         </div>
//       </div>
//     );
//   }





//   function FlowchartWorkspace() {
//     return (
//       <WorkspaceTabsProvider kind="flowchart" createInitialState={createFlowchartState}>
//         <DiagramEditor />
//       </WorkspaceTabsProvider>
//     );
//   }


//   function App() {
//     return (
//       <ReactFlowProvider>
//         <FlowchartWorkspace />
//       </ReactFlowProvider>
//     );
//   }

//   export default App;

//   // Export PNG
//   const exportPNG = async () => {
//     const el = document.querySelector('.react-flow');
//     if (!el) return;
//     try {
//       // add watermark only for the export snapshot
//       const wm = document.createElement('div');
//       wm.className = 'export-watermark';
//       Object.assign(wm.style, {
//         position: 'absolute',
//         right: '16px',
//         bottom: '16px',
//         display: 'flex',
//         alignItems: 'center',
//         gap: '8px',
//         background: 'rgba(255,255,255,0.9)',
//         border: '1px solid #e5e5e5',
//         borderRadius: '8px',
//         padding: '6px 10px',
//         fontSize: '12px',
//         color: '#111',
//         pointerEvents: 'none',
//         zIndex: '1000',
//       });
//       const img = new Image();
//       img.src = hexBg;
//       img.alt = 'Innotrat Labs';
//       img.style.width = '20px';
//       img.style.height = '20px';
//       img.style.opacity = '0.9';
//       wm.appendChild(img);
//       const span = document.createElement('span');
//       span.textContent = 'made with innotrat labs';
//       wm.appendChild(span);
//       el.appendChild(wm);

//       const url = await toPng(el, {
//         cacheBust: true,
//         backgroundColor: '#ffffff',
//         pixelRatio: 2,
//         filter: (node) => {
//           if (!(node instanceof Element)) return true;
//           const cl = node.classList;
//           if (!cl) return true;
//           // exclude background grid, minimap, controls, RF attribution, and transient popovers/backdrops
//           if (
//             cl.contains('react-flow__background') ||
//             cl.contains('react-flow__minimap') ||
//             cl.contains('react-flow__controls') ||
//             cl.contains('react-flow__attribution') ||
//             cl.contains('edge-backdrop') ||
//             cl.contains('edge-popover')
//           ) {
//             return false;
//           }
//           return true;
//         },
//       });

//       const a = document.createElement('a');
//       a.href = url;
//       a.download = 'diagram.png';
//       a.click();
//       URL.revokeObjectURL(url);
//       wm.remove();
//     } catch (err) {
//       console.error('PNG export failed', err);
//     }
//   };


//   import './Flowchart.css';

//   // Import the SVG file
//   import Group37176 from '../images/Group 37176.svg';
//   import Group37177 from '../images/Group 37177.svg';
//   import Group37179 from '../images/Group 37179.svg';
//   import Group37181 from '../images/Group 37181.svg';
//   import Group37184 from '../images/Group 37184.svg';
//   import Group37186 from '../images/Group 37186.svg';
//   import Group37189 from '../images/Group 37189.svg';
//   import Group37191 from '../images/Group 37191.svg';
//   import Group37193 from '../images/Group 37193.svg';
//   import Group37195 from '../images/Group 37195.svg';
//   import Group37197 from '../images/Group 37197.svg';
//   import Group37204 from '../images/Group 37204.svg';
//   import Group37205 from '../images/Group 37205.svg';
//   import Group37207 from '../images/Group 37207.svg';
//   import Group37209 from '../images/Group 37209.svg';
//   import Group37212 from '../images/Group 37212.svg';
//   import Group37213 from '../images/Group 37213.svg';
//   import Group37216 from '../images/Group 37216.svg';
//   import Group37218 from '../images/Group 37218.svg';
//   import Group37219 from '../images/Group 37219.svg';
//   import Group37224 from '../images/Group 37224.svg';
//   import Group37228 from '../images/Group 37228.svg';
//   import Group37235 from '../images/Group 37235.svg';
//   import Group37236 from '../images/Group 37236.svg';
//   import Group36874 from '../images/Group 36874.svg';
//   import Group36873 from '../images/Group 36873.svg';
//   import Group36872 from '../images/Group 36872.svg';
//   import Ellipse24 from '../images/Ellipse 24.svg';
//   import Ellipse23 from '../images/Ellipse 23.svg';
//   import Rectangl1809 from '../images/Rectangle 1809.svg';
//   import t from '../images/t.svg';
//   import Group37094 from '../images/Group 37094.svg';
//   import Group37097 from '../images/Group 37097.svg';
//   import Group37098 from '../images/Group 37098.svg';
//   import Vector147 from '../images/Vector 147.svg';
//   import Vector148 from '../images/Vector 148.svg';
//   import Group36793 from '../images/Group 36793.svg';
//   import Group37080 from '../images/Group 37080.svg';
//   import Group37081 from '../images/Group 37081.svg';
//   import Group37082 from '../images/Group 37082.svg';
//   import Group37083 from '../images/Group 37083.svg';
//   import Group37084 from '../images/Group 37084.svg';
//   import Rectangle1883 from '../images/Rectangle 1883.svg';
//   import Ad8 from '../images/AD8.svg';
//   import Ad9 from '../images/AD9.svg';
//   import Ad10 from '../images/AD10.svg';
//   import Ad11 from '../images/AD11.svg';
//   import Ad12 from '../images/AD12.svg';
//   import Ad13 from '../images/AD13.svg';
//   import Ad14 from '../images/AD14.svg';
//   import Ad15 from '../images/AD15.svg';
//   import Ad17 from '../images/AD17.svg';


//   const symbols = [
//     {
//       category: "FOR DATA STRUCTURE   ▼",
//       items: [
//         { type: "svg", src: Group37176, name: "Array" },
//         { type: "svg", src: Group37177, name: "Linked List" },
//         { type: "svg", src: Group37179, name: "Stack" },
//         { type: "svg", src: Group37181, name: "Queue" },
//         { type: "svg", src: Group37184, name: "Circular Buffer" },
//         { type: "svg", src: Group37186, name: "Binary Tree" },
//         { type: "svg", src: Group37189, name: "Heap" },
//         { type: "svg", src: Group37191, name: "Graph" },
//         { type: "svg", src: Group37193, name: " C Struct " },
//         { type: "svg", src: Group37195, name: "Binary Tree" },
//         { type: "svg", src: Group37197, name: "Tries" },
//         // { type: "svg", src: Group37204 , name: "Doubly Linkedlist" },
//         { type: "svg", src: Group37204, name: "Bloom Table" },
//         { type: "svg", src: Group37205, name: "Doubly Linkedlist" },
//         { type: "svg", src: Group37207, name: "Tries" },
//         { type: "svg", src: Group37209, name: "Binary Table" },
//         { type: "svg", src: Group37212, name: "Lookup Table" },
//         { type: "svg", src: Group37213, name: "Semaphore" },
//         { type: "svg", src: Group37216, name: "Mutex" },
//         { type: "svg", src: Group37218, name: "Task Control Block" },
//         { type: "svg", src: Group37219, name: "Graph Adjacency List" },
//         { type: "svg", src: Group37224, name: "Interrupt Vector" },
//         { type: "svg", src: Group37228, name: "LRU CACHE" },
//         { type: "svg", src: Group37235, name: "Buffer Pool" },
//         { type: "svg", src: Group37236, name: "Union" },
//       ],
//     },
//     {
//       category: "UML USE CASE DIAGRAM ▼",
//       items: [
//         { type: "svg", src: Ellipse24, name: "Start" },
//         { type: "svg", src: Ellipse23, name: "Ellipse" },
//         { type: "svg", src: Group36874, name: "Note" },
//         { type: "svg", src: Group36873, name: "Use Case" },
//         { type: "svg", src: Group36872, name: "Actor" },
//         { type: "svg", src: Rectangl1809, name: "Rectangle" },
//         { type: "svg", src: t, name: "Text Box" },
//       ],
//     },
//     {
//       category: "UML TIMING DIAGRAM ▼",
//       items: [
//         { type: "svg", src: Group37094, name: "Text Box" },
//         { type: "svg", src: Group37097, name: "Found Message" },
//         { type: "svg", src: Group37098, name: "Generalized" },
//         { type: "svg", src: Vector147, name: "1 to Many" },
//         { type: "svg", src: Vector148, name: "Transfer" },
//       ],
//     },
//     {
//       category: "UML SEQUENCE DIAGRAM ▼",
//       items: [
//         { type: "svg", src: Group36793, name: "Name" },
//         { type: "svg", src: Group36872, name: "Actor" },
//         { type: "svg", src: Group37080, name: "Alternative" },
//         { type: "svg", src: Group37081, name: "Loop" },
//         { type: "svg", src: Group37082, name: "Reference" },
//         { type: "svg", src: Group37083, name: "Entity Object" },
//         { type: "svg", src: Group37084, name: "Boundary Object" },
//         { type: "svg", src: Rectangle1883, name: "Dark Line" },
//       ],
//     },
//     {
//       category: "ACTIVITY & STATE DIAGRAM ▼",
//       items: [
//         { type: "svg", src: Ad8, name: "Text Box" },
//         { type: "svg", src: Ad9, name: "Object" },
//         { type: "svg", src: Ad10, name: "Rectangle" },
//         { type: "svg", src: Ad11, name: "Name" },
//         { type: "svg", src: Rectangle1883, name: "Dark Lines" },
//         { type: "svg", src: Ad12, name: "Straight Line" },
//         { type: "svg", src: Ad13, name: "Straight Line" },
//         { type: "svg", src: Ad14, name: "Decision Box" },
//         { type: "svg", src: Ad15, name: "Collate" },
//         { type: "svg", src: Ad17, name: "Pointer" },
//       ],
//     },

//   ];