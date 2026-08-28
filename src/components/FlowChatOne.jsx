


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
//   const fill = data?.fill || '#0cfd48ff';
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

// // Generic Shape Node
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
//     id: shape.id,
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

// // Main DiagramEditor component
// function DiagramEditor() {
//   const [isExplorerVisible, setIsExplorerVisible] = useState('shapes');
//   const reactFlowWrapper = useRef(null);
//   const [nodes, setNodes, onNodesChange] = useNodesState([]);
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
//   const [selected, setSelected] = useState(null);
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
//   const { activeTab, tabs, loading: tabsLoading, createTab, updateActiveTabState } = useWorkspaceTabs();
//   const hydratingRef = useRef(false);

//   // Canvas file integration for Flowchart
//   const canvasIntegration = useCanvasFileIntegration('Flowchart');

//   // Project management state
//   const [hasProjects, setHasProjects] = useState(false);
//   const { user, activeProjectId, activeProjectName, setActiveProjectId } = useProject?.() ?? {};
//   const userId = user?.userId || user?._id || user?.id;

//   // History & snapshots
//   const HISTORY_LIMIT = 100;
//   const historyRef = useRef({ entries: [], index: -1 });
//   const debounceRef = useRef(null);
//   const nodesRef = useRef(nodes);
//   const edgesRef = useRef(edges);
//   const isUndoRedoRef = useRef(false);
//   const lastSnapshotRef = useRef('');
  
//   useEffect(() => { nodesRef.current = nodes; }, [nodes]);
//   useEffect(() => { edgesRef.current = edges; }, [edges]);

//   const pushSnapshot = useCallback(() => {
//     if (hydratingRef.current) return;
//     const nodesCurrent = rf.getNodes();
//     const edgesCurrent = rf.getEdges();
//     const viewport = rf.getViewport();

//     nodesRef.current = nodesCurrent;
//     edgesRef.current = edgesCurrent;

//     const snapshot = {
//       nodes: nodesCurrent,
//       edges: edgesCurrent,
//       viewport,
//     };
//     const serialized = JSON.stringify(snapshot);
//     if (serialized === lastSnapshotRef.current) return;
//     lastSnapshotRef.current = serialized;

//     const baseEntries = historyRef.current.entries.slice(0, historyRef.current.index + 1);
//     baseEntries.push(JSON.parse(serialized));
//     const trimmed = baseEntries.length > HISTORY_LIMIT ? baseEntries.slice(baseEntries.length - HISTORY_LIMIT) : baseEntries;

//     historyRef.current = {
//       entries: trimmed,
//       index: trimmed.length - 1,
//     };
//   }, [rf]);

//   const flushPendingSnapshot = useCallback(() => {
//     if (debounceRef.current) {
//       clearTimeout(debounceRef.current);
//       debounceRef.current = null;
//     }
//     pushSnapshot();
//   }, [pushSnapshot]);

//   const persistCurrentState = useCallback(() => {
//     if (hydratingRef.current) return;
//     updateActiveTabState((prev = createFlowchartState()) => ({
//       ...prev,
//       nodes: nodesRef.current,
//       edges: edgesRef.current,
//       viewport: rf.getViewport(),
//     }));
//   }, [rf, updateActiveTabState]);

//   const scheduleSnapshot = useCallback(() => {
//     if (isUndoRedoRef.current || hydratingRef.current) return;
//     if (debounceRef.current) clearTimeout(debounceRef.current);
//     debounceRef.current = setTimeout(() => {
//       pushSnapshot();
//       persistCurrentState();
//     }, 400);
//   }, [persistCurrentState, pushSnapshot]);

//   useEffect(() => {
//     const handleRfChange = () => {
//       scheduleSnapshot();
//     };

//     window.addEventListener('rf-change', handleRfChange);
//     return () => window.removeEventListener('rf-change', handleRfChange);
//   }, [scheduleSnapshot]);

//   useEffect(() => {
//     if (hydratingRef.current || isUndoRedoRef.current) return;
//     scheduleSnapshot();
//   }, [nodes, edges, scheduleSnapshot]);

//   const applySnapshot = useCallback((snapshot, nextIndex) => {
//     if (!snapshot) return;
//     if (debounceRef.current) {
//       clearTimeout(debounceRef.current);
//       debounceRef.current = null;
//     }

//     hydratingRef.current = true;
//     isUndoRedoRef.current = true;

//     historyRef.current.index = nextIndex;

//     const nextNodes = snapshot.nodes || [];
//     const nextEdges = snapshot.edges || [];

//     nodesRef.current = nextNodes;
//     edgesRef.current = nextEdges;

//     setNodes(nextNodes);
//     setEdges(nextEdges);

//     const serialized = JSON.stringify(snapshot);

//     requestAnimationFrame(() => {
//       if (snapshot.viewport) rf.setViewport(snapshot.viewport);
//       lastSnapshotRef.current = serialized;
//       updateActiveTabState(
//         () => ({
//           nodes: nextNodes,
//           edges: nextEdges,
//           viewport: snapshot.viewport || rf.getViewport(),
//         }),
//         { markDirty: false, scheduleSave: false }
//       );
//       hydratingRef.current = false;
//       isUndoRedoRef.current = false;
//     });
//   }, [rf, setEdges, setNodes, updateActiveTabState]);

//   const undo = useCallback(() => {
//     flushPendingSnapshot();

//     const { entries, index } = historyRef.current;
//     if (index <= 0) return;
//     const nextIndex = index - 1;
//     applySnapshot(entries[nextIndex], nextIndex);
//   }, [applySnapshot, flushPendingSnapshot]);

//   const redo = useCallback(() => {
//     flushPendingSnapshot();

//     const { entries, index } = historyRef.current;
//     if (index >= entries.length - 1) return;
//     const nextIndex = index + 1;
//     applySnapshot(entries[nextIndex], nextIndex);
//   }, [applySnapshot, flushPendingSnapshot]);

//   const handleNodesChange = useCallback((changes) => {
//     onNodesChange(changes);
//     if (!isUndoRedoRef.current) {
//       const meaningfulChange = changes.some(
//         (change) => change.type !== 'select' && change.type !== 'selectNodes'
//       );
//       if (meaningfulChange) {
//         scheduleSnapshot();
//       }
//     }
//   }, [onNodesChange, scheduleSnapshot]);

//   const handleEdgesChange = useCallback((changes) => {
//     onEdgesChange(changes);
//     if (!isUndoRedoRef.current) {
//       const meaningfulChange = changes.some(
//         (change) => change.type !== 'select' && change.type !== 'selectNodes'
//       );
//       if (meaningfulChange) {
//         scheduleSnapshot();
//       }
//     }
//   }, [onEdgesChange, scheduleSnapshot]);

//   const onConnect = useCallback(
//     (params) => {
//       setEdges((eds) =>
//         addEdge(
//           {
//             ...params,
//             type: 'editable',
//             markerEnd: { type: MarkerType.ArrowClosed },
//             label: 'Label',
//             style: { stroke: '#000000', strokeWidth: 2 },
//             labelStyle: { fill: '#000000', fontSize: 12 },
//             data: { showLabel: false },
//           },
//           eds
//         )
//       );
//       scheduleSnapshot();
//     },
//     [setEdges, scheduleSnapshot]
//   );

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

//     const initialSnapshot = { nodes: nextNodes, edges: nextEdges, viewport: nextViewport };
//     const serialized = JSON.stringify(initialSnapshot);
//     lastSnapshotRef.current = serialized;
//     historyRef.current = {
//       entries: [JSON.parse(serialized)],
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
//       scheduleSnapshot();
//     });
//     return () => cancelAnimationFrame(frame);
//   }, [activeTab, rf, setEdges, setNodes, updateActiveTabState]);

//   const onNodeDragStop = useCallback(() => {
//     scheduleSnapshot();
//   }, [scheduleSnapshot]);

//   const onDragStart = (event, shape) => {
//     let payload;
//     if (shape.type === 'genericShape') {
//       payload = JSON.stringify({ type: 'genericShape', data: { shapeId: shape.shapeId, label: shape.label } });
//     } else if (shape.svgSrc) {
//       payload = JSON.stringify({ type: shape.type, data: { src: shape.svgSrc, label: shape.label } });
//     } else {
//       payload = shape.type;
//     }
//     event.dataTransfer.setData('application/reactflow', payload);
//     event.dataTransfer.effectAllowed = 'move';
//   };

//   const onDragOver = useCallback((event) => {
//     event.preventDefault();
//     event.dataTransfer.dropEffect = 'move';
//   }, []);

//   const filteredGroups = useMemo(() => {
//     const query = paletteSearch.trim().toLowerCase();
//     if (!query) {
//       return PALETTE_GROUPS;
//     }
//     return PALETTE_GROUPS
//       .map((group) => ({
//         ...group,
//         items: group.items.filter((item) => item.label.toLowerCase().includes(query)),
//       }))
//       .filter((group) => group.items.length > 0);
//   }, [paletteSearch]);

//   const hasSearch = Boolean(paletteSearch.trim());

//   const onDrop = useCallback(
//     (event) => {
//       event.preventDefault();
//       const payloadStr = event.dataTransfer.getData('application/reactflow');
//       if (!payloadStr) return;

//       let type = payloadStr;
//       let extraData = {};
//       try {
//         const parsed = JSON.parse(payloadStr);
//         if (parsed && parsed.type) {
//           type = parsed.type;
//           extraData = parsed.data || {};
//         }
//       } catch (_) {
//         // not JSON, fall back to string type
//       }

//       const position = rf.screenToFlowPosition({ x: event.clientX, y: event.clientY });
//       const id = getId();
//       const baseData = { label: '', fill: '#ffffff', stroke: '#000000', text: '#000000', strokeWidth: 2, rotation: 0, fontSize: 12 };
//       const shapeConfig = type === 'genericShape' ? findShapeConfigById(extraData.shapeId) : null;
//       const slots = shapeConfig ? buildSlotValues(shapeConfig, extraData.slots) : undefined;

//       // Compute appropriate initial size based on shape type
//       let initialWidth = 120;
//       let initialHeight = 80;

//       if (type === 'decision' || type === 'ellipse') {
//         initialWidth = 100;
//         initialHeight = 100;
//       } else if (type === 'terminator') {
//         initialWidth = 120;
//         initialHeight = 60;
//       } else if (type === 'text') {
//         initialWidth = 100;
//         initialHeight = 40;
//       }

//       setNodes((nds) =>
//         nds.concat({
//           id,
//           type,
//           position,
//           data: {
//             ...baseData,
//             ...extraData,
//             ...(slots ? { slots } : {}),
//           },
//           style: { width: initialWidth, height: initialHeight },
//         })
//       );
//     },
//     [rf, setNodes]
//   );

//   const onSelectionChange = useCallback(({ nodes: nds, edges: eds }) => {
//     if (nds && nds.length) {
//       setSelected({ kind: 'node', id: nds[0].id });
//     } else if (eds && eds.length) {
//       setSelected({ kind: 'edge', id: eds[0].id });
//     } else {
//       setSelected(null);
//     }
//   }, []);

//   const exitEditing = useCallback(() => {
//     setNodes((nds) => nds.map((n) => (n.data?.editing ? { ...n, data: { ...n.data, editing: false } } : n)));
//   }, [setNodes]);

//   // Clipboard state
//   const [clipboard, setClipboard] = useState({ nodes: [], edges: [] });

//   // Get selected nodes and edges
//   const getSelectedItems = useCallback(() => {
//     const selectedNodes = nodes.filter(node => node.selected);
//     const selectedEdges = edges.filter(edge => edge.selected);
//     return { selectedNodes, selectedEdges };
//   }, [nodes, edges]);

//   // Copy functionality
//   const copySelected = useCallback(() => {
//     const { selectedNodes, selectedEdges } = getSelectedItems();
//     if (selectedNodes.length > 0 || selectedEdges.length > 0) {
//       setClipboard({ nodes: selectedNodes, edges: selectedEdges });
//       console.log(`Copied ${selectedNodes.length} nodes and ${selectedEdges.length} edges`);
//     }
//   }, [getSelectedItems]);

//   // Paste functionality
//   const pasteFromClipboard = useCallback(() => {
//     if (clipboard.nodes.length === 0 && clipboard.edges.length === 0) return;

//     const nodeIdMap = new Map();
//     const newNodes = clipboard.nodes.map(node => {
//       const newId = getId();
//       nodeIdMap.set(node.id, newId);
//       return {
//         ...node,
//         id: newId,
//         position: {
//           x: node.position.x + 50, // Offset pasted items
//           y: node.position.y + 50
//         },
//         selected: true // Select pasted items
//       };
//     });

//     const newEdges = clipboard.edges.map(edge => {
//       const sourceId = nodeIdMap.get(edge.source);
//       const targetId = nodeIdMap.get(edge.target);
      
//       // Only paste edges if both source and target nodes are being pasted
//       if (sourceId && targetId) {
//         return {
//           ...edge,
//           id: getId(),
//           source: sourceId,
//           target: targetId,
//           selected: true
//         };
//       }
//       return null;
//     }).filter(Boolean);

//     // Deselect all existing items
//     setNodes(nds => nds.map(n => ({ ...n, selected: false })).concat(newNodes));
//     setEdges(eds => eds.map(e => ({ ...e, selected: false })).concat(newEdges));
    
//     scheduleSnapshot();
//     console.log(`Pasted ${newNodes.length} nodes and ${newEdges.length} edges`);
//   }, [clipboard, setNodes, setEdges, scheduleSnapshot]);

//   // Select all functionality
//   const selectAll = useCallback(() => {
//     setNodes(nds => nds.map(n => ({ ...n, selected: true })));
//     setEdges(eds => eds.map(e => ({ ...e, selected: true })));
//   }, [setNodes, setEdges]);

//   // Delete selected items
//   const deleteSelected = useCallback(() => {
//     const { selectedNodes, selectedEdges } = getSelectedItems();
//     if (selectedNodes.length > 0 || selectedEdges.length > 0) {
//       setNodes(nds => nds.filter(n => !n.selected));
//       setEdges(eds => eds.filter(e => !e.selected));
//       scheduleSnapshot();
//       console.log(`Deleted ${selectedNodes.length} nodes and ${selectedEdges.length} edges`);
//     }
//   }, [getSelectedItems, setNodes, setEdges, scheduleSnapshot]);

//   useEffect(() => {
//     const onKeyDown = (e) => {
//       // Check if we're in an input field
//       const isInputActive = document.activeElement?.tagName === 'INPUT' || 
//                            document.activeElement?.tagName === 'TEXTAREA' ||
//                            document.activeElement?.contentEditable === 'true';

//       // F2 for editing node labels
//       if (e.key === 'F2' && selected?.kind === 'node') {
//         e.preventDefault();
//         setNodes((nds) => nds.map((n) => (n.id === selected.id ? { ...n, data: { ...n.data, editing: true } } : n)));
//         return;
//       }

//       // Skip keyboard shortcuts if user is typing in an input
//       if (isInputActive) return;

//       // Keyboard shortcuts
//       if (e.ctrlKey || e.metaKey) {
//         switch (e.key.toLowerCase()) {
//           case 'z':
//             if (e.shiftKey) {
//               // Ctrl+Shift+Z or Ctrl+Y for redo
//               e.preventDefault();
//               redo();
//             } else {
//               // Ctrl+Z for undo
//               e.preventDefault();
//               undo();
//             }
//             break;
//           case 'y':
//             // Ctrl+Y for redo
//             e.preventDefault();
//             redo();
//             break;
//           case 'c':
//             // Ctrl+C for copy
//             e.preventDefault();
//             copySelected();
//             break;
//           case 'v':
//             // Ctrl+V for paste
//             e.preventDefault();
//             pasteFromClipboard();
//             break;
//           case 'a':
//             // Ctrl+A for select all
//             e.preventDefault();
//             selectAll();
//             break;
//           default:
//             break;
//         }
//       } else {
//         // Non-Ctrl shortcuts
//         switch (e.key) {
//           case 'Delete':
//           case 'Backspace':
//             e.preventDefault();
//             deleteSelected();
//             break;
//           case 'Escape':
//             // Deselect all
//             setNodes(nds => nds.map(n => ({ ...n, selected: false })));
//             setEdges(eds => eds.map(e => ({ ...e, selected: false })));
//             setSelected(null);
//             break;
//           default:
//             break;
//         }
//       }
//     };

//     window.addEventListener('keydown', onKeyDown);
//     return () => window.removeEventListener('keydown', onKeyDown);
//   }, [selected, setNodes, setEdges, undo, redo, copySelected, pasteFromClipboard, selectAll, deleteSelected, setSelected]);

//   // Save / Load as JSON
//   const saveDiagram = () => {
//     const payload = {
//       nodes,
//       edges,
//       viewport: rf.getViewport(),
//     };
//     const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'diagram.json';
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const loadDiagram = () => {
//     const input = document.createElement('input');
//     input.type = 'file';
//     input.accept = '.json,application/json';
//     input.onchange = (e) => {
//       const file = e.target.files?.[0];
//       if (!file) return;
//       const reader = new FileReader();
//       reader.onload = () => {
//         try {
//           const parsed = JSON.parse(reader.result);
//           setNodes(parsed.nodes || []);
//           setEdges(parsed.edges || []);
//           if (parsed.viewport) rf.setViewport(parsed.viewport);
//         } catch (err) {
//           console.error('Invalid diagram JSON', err);
//         }
//       };
//       reader.readAsText(file);
//     };
//     input.click();
//   };

//   // Property panel handlers
//   const updateSelectedNode = (mapper) => {
//     if (!selected || selected.kind !== 'node') return;
//     setNodes((nds) => nds.map((n) => (n.id === selected.id ? mapper(n) : n)));
//     scheduleSnapshot();
//   };

//   const getSelectedEntity = () => {
//     if (!selected) return null;
//     if (selected.kind === 'node') return nodes.find((n) => n.id === selected.id) || null;
//     return edges.find((e) => e.id === selected.id) || null;
//   };

//   const selectedEntity = getSelectedEntity();

//   const navigate = useNavigate();
//   const handleTabChange = useCallback((tab) => {
//     const routes = {
//       Simulation: '/simulation',
//       Flowchart: '/Flowchartone',
//       'Block Diagram': '/BlockDiagram',
//       'Block Programming': '/blockprogramming',
//       'Code Editor': '/editor',
//     };
//     const next = routes[tab];
//     if (next) {
//       navigate(next);
//     }
//   }, [navigate]);

//   // Project management integration
//   useEffect(() => {
//     const checkProjects = async () => {
//       const allProjects = projectFileManager.getAllProjects();
//       const projects = Object.values(allProjects);
//       setHasProjects(projects.length > 0);

//       // Set active project if available
//       if (projects.length > 0 && !activeProjectId && setActiveProjectId) {
//         const activeProject = projectFileManager.getActiveProject();
//         if (activeProject) {
//           setActiveProjectId(activeProject.id);
//         } else {
//           setActiveProjectId(projects[0].id);
//           projectFileManager.setActiveProject(projects[0].id);
//         }
//       }
//     };

//     checkProjects();

//     // Listen for project changes
//     const handleProjectChange = () => {
//       const allProjects = projectFileManager.getAllProjects();
//       const projects = Object.values(allProjects);
//       setHasProjects(projects.length > 0);
//     };

//     const handleProjectCreated = () => {
//       checkProjects();
//     };

//     window.addEventListener('project:change', handleProjectChange);
//     window.addEventListener('project-created', handleProjectCreated);
//     window.addEventListener('file-system-refresh', checkProjects);

//     return () => {
//       window.removeEventListener('project:change', handleProjectChange);
//       window.removeEventListener('project-created', handleProjectCreated);
//       window.removeEventListener('file-system-refresh', checkProjects);
//     };
//   }, [activeProjectId, userId]);

//   // File click handler for project integration
//   const handleFileClick = useCallback(async (filePath, fileName, parsedContent, fileData) => {
//     try {
//       console.log('File clicked in Flowchart:', fileName, filePath);

//       // Load file using canvas integration
//       const result = await canvasIntegration.loadFileToCanvas(filePath, fileName, parsedContent, fileData);

//       if (result.success) {
//         // Apply content to canvas if it's JSON diagram data
//         if (fileName.endsWith('.json') && parsedContent && typeof parsedContent === 'object') {
//           if (parsedContent.nodes && parsedContent.edges) {
//             setNodes(parsedContent.nodes || []);
//             setEdges(parsedContent.edges || []);

//             // Apply viewport if available
//             if (parsedContent.viewport && rf) {
//               setTimeout(() => {
//                 rf.setViewport(parsedContent.viewport);
//               }, 100);
//             }
//           }
//         }

//         console.log(`Loaded ${fileName} into Flowchart canvas`);
//       } else {
//         console.error('Failed to load file:', result.error);
//       }
//     } catch (error) {
//       console.error('Failed to handle file click:', error);
//     }
//   }, [canvasIntegration, setNodes, setEdges, rf]);

//   // Setup auto-save functionality for Flowchart
//   useEffect(() => {
//     const activeProject = projectFileManager.getActiveProject();
//     if (!activeProject) return;

//     // Debounced save trigger
//     const timer = setTimeout(() => {
//       const content = {
//         nodes,
//         edges,
//         viewport: rf.getViewport()
//       };
//       canvasIntegration.saveCanvasToFile(content, 'Flowchart/main_flow.json', activeProject.id);
//     }, 1000);

//     return () => clearTimeout(timer);
//   }, [nodes, edges, rf, canvasIntegration]);

//   const showExportPreview = useCallback((dataUrl, fileName) => {
//     const host = reactFlowWrapper.current;
//     if (!host) return;
//     if (getComputedStyle(host).position === 'static') {
//       host.style.position = 'relative';
//     }

//     const existing = host.querySelector('.diagram-export-preview');
//     if (existing) existing.remove();

//     const overlay = document.createElement('div');
//     overlay.className = 'diagram-export-preview';
//     Object.assign(overlay.style, {
//       position: 'absolute',
//       top: '16px',
//       right: '16px',
//       width: '260px',
//       maxHeight: '80%',
//       background: 'rgba(15,23,42,0.94)',
//       border: '1px solid rgba(148,163,184,0.25)',
//       borderRadius: '12px',
//       boxShadow: '0 18px 48px rgba(15,23,42,0.45)',
//       padding: '14px 14px 12px',
//       zIndex: '1300',
//       color: '#e2e8f0',
//       display: 'flex',
//       flexDirection: 'column',
//       gap: '10px',
//       backdropFilter: 'blur(8px)',
//     });

//     const title = document.createElement('div');
//     title.textContent = 'PNG exported';
//     title.style.fontSize = '14px';
//     title.style.fontWeight = '600';
//     overlay.appendChild(title);

//     const img = new Image();
//     img.src = dataUrl;
//     img.alt = fileName;
//     Object.assign(img.style, {
//       width: '100%',
//       maxHeight: '160px',
//       objectFit: 'contain',
//       borderRadius: '8px',
//       border: '1px solid rgba(148,163,184,0.3)',
//       background: '#0f172a',
//     });
//     overlay.appendChild(img);

//     const meta = document.createElement('div');
//     meta.textContent = fileName;
//     meta.style.fontSize = '11px';
//     meta.style.opacity = '0.75';
//     overlay.appendChild(meta);

//     const actions = document.createElement('div');
//     Object.assign(actions.style, {
//       display: 'flex',
//       justifyContent: 'flex-end',
//       gap: '8px',
//     });

//     const openBtn = document.createElement('button');
//     openBtn.type = 'button';
//     openBtn.textContent = 'Download';
//     Object.assign(openBtn.style, {
//       padding: '6px 10px',
//       borderRadius: '6px',
//       border: '1px solid rgba(59,130,246,0.4)',
//       background: '#1d4ed8',
//       color: '#f8fafc',
//       fontSize: '12px',
//       cursor: 'pointer',
//     });
//     openBtn.onclick = () => {
//       const a = document.createElement('a');
//       a.href = dataUrl;
//       a.download = fileName;
//       a.click();
//     };

//     const closeBtn = document.createElement('button');
//     closeBtn.type = 'button';
//     closeBtn.textContent = 'Close';
//     Object.assign(closeBtn.style, {
//       padding: '6px 10px',
//       borderRadius: '6px',
//       border: '1px solid rgba(148,163,184,0.35)',
//       background: 'transparent',
//       color: '#cbd5f5',
//       fontSize: '12px',
//       cursor: 'pointer',
//     });
//     closeBtn.onclick = () => overlay.remove();

//     actions.appendChild(closeBtn);
//     actions.appendChild(openBtn);
//     overlay.appendChild(actions);

//     host.appendChild(overlay);
//   }, []);

//   const handleExportPNG = useCallback(async () => {
//     const container = reactFlowWrapper.current?.querySelector('.react-flow');
//     if (!container) return;

//     let watermark;
//     try {
//       watermark = document.createElement('div');
//       watermark.className = 'export-watermark';
//       Object.assign(watermark.style, {
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
//       img.alt = 'InnoIDE';
//       img.style.width = '32px';
//       img.style.height = '32px';
//       img.style.opacity = '0.9';

//       // Wait for image to load before adding to watermark
//       await new Promise((resolve, reject) => {
//         img.onload = resolve;
//         img.onerror = reject;
//         // Fallback timeout
//         setTimeout(resolve, 1000);
//       });

//       watermark.appendChild(img);
//       const span = document.createElement('span');
//       span.textContent = 'made with innotrat labs';
//       watermark.appendChild(span);
//       container.appendChild(watermark);

//       // Small delay to ensure everything is rendered including edges
//       await new Promise(resolve => setTimeout(resolve, 100));

//       const dataUrl = await toPng(container, {
//         cacheBust: true,
//         backgroundColor: '#ffffff',
//         pixelRatio: 2,
//         filter: (node) => {
//           if (!(node instanceof Element)) return true;
//           const classes = node.classList;
//           if (!classes) return true;
//           // Exclude background, attribution, controls, and minimap
//           if (
//             classes.contains('export-ignore') ||
//             classes.contains('react-flow__background') ||
//             classes.contains('react-flow__attribution') ||
//             classes.contains('react-flow__controls') ||
//             classes.contains('react-flow__minimap')
//           ) {
//             return false;
//           }
//           return true;
//         },
//       });

//       const activeProject = projectFileManager.getActiveProject();
//       const projectSegment = sanitizeSegment(activeProject?.name || activeProjectName || 'project');
//       const timeSegment = sanitizeSegment(new Date().toISOString());
//       const fileName = `${projectSegment}_flowchart_${timeSegment}.png`;

//       // Save to project using new project file manager
//       if (activeProject) {
//         try {
//           const pngPath = await canvasIntegration.exportCanvasAsPNG(dataUrl, fileName, activeProject.id);
//           if (pngPath) {
//             console.log('PNG exported to project:', pngPath);
//           }
//         } catch (error) {
//           console.error('Failed to save PNG to project:', error);
//         }
//       }

//       window.dispatchEvent(
//         new CustomEvent('diagram:export-preview', {
//           detail: {
//             kind: 'Flowchart',
//             fileName,
//             dataUrl,
//             timestamp: Date.now(),
//           },
//         })
//       );

//       showExportPreview(dataUrl, fileName);
//     } catch (error) {
//       console.error('Failed to export PNG', error);
//     } finally {
//       if (watermark && watermark.parentNode) {
//         watermark.parentNode.removeChild(watermark);
//       }
//     }
//   }, [canvasIntegration, activeProjectName, reactFlowWrapper, showExportPreview]);

//   return (
//     <div className="diagram-builder">
//       <EditorNavbar
//         activeTab="Flowchart"
//         onTabChange={handleTabChange}
//         onSaveJSON={saveDiagram}
//         onLoadJSON={loadDiagram}
//         onExportPNG={handleExportPNG}
//         onUndo={undo}
//         onRedo={redo}
//       />
//       <div className="content">
//         {/* Left palette */}
//         <div className="sidebarr">
//           <div className="sidebar-toggle-bar">
//             <button
//               type="button"
//               className={`sidebar-tab ${isExplorerVisible === 'explorer' ? 'active' : ''}`}
//               onClick={() => setIsExplorerVisible('explorer')}
//             >
//               Explorer
//             </button>
//             <button
//               type="button"
//               className={`sidebar-tab ${isExplorerVisible === 'shapes' ? 'active' : ''}`}
//               onClick={() => setIsExplorerVisible('shapes')}
//             >
//               Shapes
//             </button>
//           </div>

//           <div className="sidebar-body">
//             {isExplorerVisible === 'explorer' ? (
//               hasProjects ? (
//                 <ProjectFileExplorer
//                   variant="diagram"
//                   onFileClick={handleFileClick}
//                   currentScreenFiles={[]}
//                   activeProjectId={activeProjectId}
//                 />
//               ) : (
//                 <FileExplorer variant="diagram" />
//               )
//             ) : (
//               <div className="palette-frame">
//                 <div className="palette-header">
//                   <div className="palette-title">Shapes</div>
//                 </div>
//                 <div className="palette-search">
//                   <input
//                     type="text"
//                     placeholder="Search shapes..."
//                     value={paletteSearch}
//                     onChange={(e) => setPaletteSearch(e.target.value)}
//                   />
//                 </div>
//                 <div className="palette-wrapper">
//                   {filteredGroups.length ? (
//                     filteredGroups.map((g) => {
//                       const isExpanded = hasSearch ? true : openGroups[g.id] ?? true;
//                       const toggleGroup = () => {
//                         if (hasSearch) return;
//                         setOpenGroups((st) => ({ ...st, [g.id]: !st[g.id] }));
//                       };
//                       return (
//                         <div key={g.id} className="palette-group">
//                           <div
//                             className="palette-header"
//                             onClick={toggleGroup}
//                             style={{
//                               cursor: hasSearch ? 'default' : 'pointer',
//                               display: 'flex',
//                               alignItems: 'center',
//                               justifyContent: 'space-between',
//                             }}
//                           >
//                             <div className="palette-title">{g.title}</div>
//                             <span className="palette-chevron">{isExpanded ? '▾' : '▸'}</span>
//                           </div>
//                           {isExpanded && (
//                             <div className="palette-grid">
//                               {g.items.map((s) => (
//                                 <div
//                                   key={s.id || `${s.type}-${s.label}`}
//                                   className="shape-card"
//                                   draggable
//                                   onDragStart={(e) => onDragStart(e, s)}
//                                   title={s.label}
//                                 >
//                                   <div className="shape-svg">{s.icon}</div>
//                                   <div className="shape-label">{s.label}</div>
//                                 </div>
//                               ))}
//                             </div>
//                           )}
//                         </div>
//                       );
//                     })
//                   ) : (
//                     <div className="palette-empty">No shapes match your search.</div>
//                   )}
//                 </div>
//                 <div className="palette-hint">Drag from node handles to connect.</div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Canvas */}
//         <div className="diagram-container">
//           <div style={{
//             padding: '8px 12px',
//             background: '#ffffff',
//             borderBottom: '1px solid #e5e7eb',
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center'
//           }}>
//             <DiagramTabs title="Flowchart Workspace" />
//             <DefineProductButton position="inline" />
//           </div>
//           <div className="canvas-frame">
//             <div
//               className="rf-wrapper"
//               ref={reactFlowWrapper}
//               onDrop={onDrop}
//               onDragOver={onDragOver}
//             >
//               <ReactFlow
//                 nodes={nodes}
//                 edges={edges}
//                 onNodesChange={handleNodesChange}
//                 onEdgesChange={handleEdgesChange}
//                 onConnect={onConnect}
//                 onNodeDragStop={onNodeDragStop}
//                 onSelectionChange={onSelectionChange}
//                 onPaneClick={exitEditing}
//                 nodeTypes={nodeTypes}
//                 edgeTypes={edgeTypes}
//                 fitView
//                 connectionLineType={ConnectionLineType.SmoothStep}
//                 defaultEdgeOptions={{ type: 'editable', markerEnd: { type: MarkerType.ArrowClosed } }}
//                 connectOnClick={false}
//                 connectionMode={ConnectionMode.Strict}
//                 isValidConnection={(c) => Boolean(c.sourceHandle && c.targetHandle)}
//                 snapToGrid
//                 snapGrid={[16, 16]}
//               >
//                 <MiniMap className="export-ignore" />
//                 <Controls className="export-ignore">
//                   <ControlButton onClick={undo} title="Undo (Ctrl+Z)">
//                     <RotateCcw />
//                   </ControlButton>
//                   <ControlButton onClick={redo} title="Redo (Ctrl+Y)">
//                     <RotateCw />
//                   </ControlButton>
//                 </Controls>
//                 <Background className="export-ignore" gap={16} size={1} />
//               </ReactFlow>
//             </div>
//           </div>
//         </div>

//         {/* Right properties panel */}
//         <PropertiesPanel
//           selectedNode={selected?.kind === 'node' ? selectedEntity : null}
//           onNodeUpdate={(nodeId, property, value) => {
//             updateSelectedNode((n) => ({
//               ...n,
//               data: { ...n.data, [property]: value }
//             }));
//           }}
//         />
//       </div>
//     </div>
//   );
// }

// function FlowchartWorkspace() {
//   return (
//     <WorkspaceTabsProvider kind="flowchart" createInitialState={createFlowchartState}>
//       <DiagramEditor />
//     </WorkspaceTabsProvider>
//   );
// }

// function App() {
//   return (
//     <ReactFlowProvider>
//       <FlowchartWorkspace />
//     </ReactFlowProvider>
//   );
// }

// export default App;


import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
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
  ConnectionLineType,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  ConnectionMode,
} from 'reactflow';
import { useNavigate } from 'react-router-dom';
import { NodeResizer } from '@reactflow/node-resizer';
import { toPng } from 'html-to-image';
import 'reactflow/dist/style.css';
import '@reactflow/node-resizer/dist/style.css';
import './BlockDiagramTest.css';
import FileExplorer from './FileExplorer';
import './FileExplorer.css';
import EditorNavbar from './EditorNavbar';
import DiagramTabs from './DiagramTabs';
import { Settings, ArrowLeftRight, RotateCcw, RotateCw } from 'lucide-react';
import hexBg from '../assets/hex_bg.png';
import { useProject } from '../ProjectContext';
import PropertiesPanel from './PropertiesPanel';
import './FlowchartTest.css';
import {
  saveProjectFile,
  sanitizeSegment,
  ensureProjectFolder,
} from '../utils/workspaceStorage';
import { saveAssetToScreenFolder } from '../utils/screenFileManager';
import {
  WorkspaceTabsProvider,
  useWorkspaceTabs,
} from '../hooks/useWorkspaceTabs';
import DefineProductButton from './shared/DefineProductButton';
import projectFileManager from '../utils/projectFileManager';
import { useCanvasFileIntegration } from '../hooks/useCanvasFileIntegration';
import ProjectFileExplorer from './ProjectFileExplorer';

let nodeId = 1;
const getId = () => `n_${nodeId++}`;

const createFlowchartState = () => ({
  nodes: [],
  edges: [],
  viewport: null,
});

const createEmptyHistory = () => ({
  entries: [],
  index: -1,
});

// Shape / node data
const shapeData = [
  {
    id: 'process',
    label: 'Process',
    description: 'Represents a process or action step',
    category: 'General',
    shapeProps: { width: 160, height: 80, borderRadius: 8, backgroundColor: '#f0f0f0' },
  },
  {
    id: 'decision',
    label: 'Decision',
    description: 'Represents a decision point or branching in the flow',
    category: 'General',
    shapeProps: { width: 160, height: 100, rotation: 45, backgroundColor: '#fff3cd' },
  },
  {
    id: 'terminator',
    label: 'Terminator',
    description: 'Represents start or end of a process',
    category: 'General',
    shapeProps: { width: 160, height: 60, borderRadius: 30, backgroundColor: '#d4edda' },
  },
  {
    id: 'ellipse',
    label: 'Ellipse',
    description: 'General purpose ellipse shape',
    category: 'General',
    shapeProps: { width: 160, height: 80, borderRadius: 80, backgroundColor: '#e2e3e5' },
  },
  {
    id: 'data',
    label: 'Data',
    description: 'Represents information or data',
    category: 'General',
    shapeProps: { width: 160, height: 80, backgroundColor: '#d1ecf1' },
  },
  {
    id: 'database',
    label: 'Database',
    description: 'Represents a database or storage',
    category: 'General',
    shapeProps: { width: 160, height: 100, backgroundColor: '#f8d7da' },
  },
  {
    id: 'manualInput',
    label: 'Manual Input',
    description: 'Represents manual input to the system',
    category: 'General',
    shapeProps: { width: 160, height: 80, backgroundColor: '#fff3cd' },
  },
  {
    id: 'hexagon',
    label: 'Preparation',
    description: 'Represents preparation or instruction',
    category: 'General',
    shapeProps: { width: 160, height: 80, backgroundColor: '#e2e3e5' },
  },
  {
    id: 'textNode',
    label: 'Text',
    description: 'Text annotation or label',
    category: 'Text',
    shapeProps: { width: 200, height: 50, backgroundColor: 'transparent' },
  },
];

// Utility to find shape config
const findShapeConfigById = (id) => {
  const found = shapeData.find((s) => s.id === id);
  if (found) return found;
  return shapeData[0];
};

// Common node resize handle
const ResizeHandles = ({ isConnectable }) => (
  <>
    <NodeResizer
      color="#1890ff"
      isVisible={true}
      minWidth={80}
      minHeight={40}
      handleStyle={{
        width: 8,
        height: 8,
        borderRadius: 4,
        background: '#1890ff',
        border: 'none',
      }}
    />
    <Handle
      type="source"
      position={Position.Right}
      style={{ background: '#555', borderRadius: 0 }}
      isConnectable={isConnectable}
    />
    <Handle
      type="target"
      position={Position.Left}
      style={{ background: '#555', borderRadius: 0 }}
      isConnectable={isConnectable}
    />
  </>
);

// Process node
const ProcessNode = ({ data, selected, isConnectable }) => {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label || 'Process');

  useEffect(() => {
    setLabel(data.label || 'Process');
  }, [data.label]);

  const handleDoubleClick = () => {
    setEditing(true);
  };

  const handleBlur = () => {
    setEditing(false);
    if (data.onLabelChange) {
      data.onLabelChange(label);
    }
  };

  return (
    <div
      className={`rf-node process-node ${selected ? 'selected' : ''}`}
      onDoubleClick={handleDoubleClick}
    >
      <ResizeHandles isConnectable={isConnectable} />
      {editing ? (
        <input
          autoFocus
          className="node-label-input"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
            if (e.key === 'Escape') {
              setLabel(data.label || 'Process');
              setEditing(false);
            }
          }}
        />
      ) : (
        <div className="node-label">{label}</div>
      )}
    </div>
  );
};

// Decision node
const DecisionNode = ({ data, selected, isConnectable }) => {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label || 'Decision');

  useEffect(() => {
    setLabel(data.label || 'Decision');
  }, [data.label]);

  const handleDoubleClick = () => {
    setEditing(true);
  };

  const handleBlur = () => {
    setEditing(false);
    if (data.onLabelChange) {
      data.onLabelChange(label);
    }
  };

  return (
    <div
      className={`rf-node decision-node ${selected ? 'selected' : ''}`}
      onDoubleClick={handleDoubleClick}
    >
      <ResizeHandles isConnectable={isConnectable} />
      {editing ? (
        <input
          autoFocus
          className="node-label-input"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
            if (e.key === 'Escape') {
              setLabel(data.label || 'Decision');
              setEditing(false);
            }
          }}
        />
      ) : (
        <div className="node-label">{label}</div>
      )}
    </div>
  );
};

// Terminator node
const TerminatorNode = ({ data, selected, isConnectable }) => {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label || 'Start / End');

  useEffect(() => {
    setLabel(data.label || 'Start / End');
  }, [data.label]);

  const handleDoubleClick = () => setEditing(true);
  const handleBlur = () => {
    setEditing(false);
    if (data.onLabelChange) data.onLabelChange(label);
  };

  return (
    <div
      className={`rf-node terminator-node ${selected ? 'selected' : ''}`}
      onDoubleClick={handleDoubleClick}
    >
      <ResizeHandles isConnectable={isConnectable} />
      {editing ? (
        <input
          autoFocus
          className="node-label-input"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
            if (e.key === 'Escape') {
              setLabel(data.label || 'Start / End');
              setEditing(false);
            }
          }}
        />
      ) : (
        <div className="node-label">{label}</div>
      )}
    </div>
  );
};

// Ellipse node
const EllipseNode = ({ data, selected, isConnectable }) => {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label || 'Ellipse');

  useEffect(() => {
    setLabel(data.label || 'Ellipse');
  }, [data.label]);

  const handleDoubleClick = () => setEditing(true);
  const handleBlur = () => {
    setEditing(false);
    if (data.onLabelChange) data.onLabelChange(label);
  };

  return (
    <div
      className={`rf-node ellipse-node ${selected ? 'selected' : ''}`}
      onDoubleClick={handleDoubleClick}
    >
      <ResizeHandles isConnectable={isConnectable} />
      {editing ? (
        <input
          autoFocus
          className="node-label-input"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
            if (e.key === 'Escape') {
              setLabel(data.label || 'Ellipse');
              setEditing(false);
            }
          }}
        />
      ) : (
        <div className="node-label">{label}</div>
      )}
    </div>
  );
};

// Data node
const DataNode = ({ data, selected, isConnectable }) => {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label || 'Data');

  useEffect(() => {
    setLabel(data.label || 'Data');
  }, [data.label]);

  const handleDoubleClick = () => setEditing(true);
  const handleBlur = () => {
    setEditing(false);
    if (data.onLabelChange) data.onLabelChange(label);
  };

  return (
    <div
      className={`rf-node data-node ${selected ? 'selected' : ''}`}
      onDoubleClick={handleDoubleClick}
    >
      <ResizeHandles isConnectable={isConnectable} />
      {editing ? (
        <input
          autoFocus
          className="node-label-input"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
            if (e.key === 'Escape') {
              setLabel(data.label || 'Data');
              setEditing(false);
            }
          }}
        />
      ) : (
        <div className="node-label">{label}</div>
      )}
    </div>
  );
};

// Database node
const DatabaseNode = ({ data, selected, isConnectable }) => {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label || 'Database');

  useEffect(() => {
    setLabel(data.label || 'Database');
  }, [data.label]);

  const handleDoubleClick = () => setEditing(true);
  const handleBlur = () => {
    setEditing(false);
    if (data.onLabelChange) data.onLabelChange(label);
  };

  return (
    <div
      className={`rf-node database-node ${selected ? 'selected' : ''}`}
      onDoubleClick={handleDoubleClick}
    >
      <ResizeHandles isConnectable={isConnectable} />
      {editing ? (
        <input
          autoFocus
          className="node-label-input"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
            if (e.key === 'Escape') {
              setLabel(data.label || 'Database');
              setEditing(false);
            }
          }}
        />
      ) : (
        <div className="node-label">{label}</div>
      )}
    </div>
  );
};

// Manual input node
const ManualInputNode = ({ data, selected, isConnectable }) => {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label || 'Manual Input');

  useEffect(() => {
    setLabel(data.label || 'Manual Input');
  }, [data.label]);

  const handleDoubleClick = () => setEditing(true);
  const handleBlur = () => {
    setEditing(false);
    if (data.onLabelChange) data.onLabelChange(label);
  };

  return (
    <div
      className={`rf-node manual-input-node ${selected ? 'selected' : ''}`}
      onDoubleClick={handleDoubleClick}
    >
      <ResizeHandles isConnectable={isConnectable} />
      {editing ? (
        <input
          autoFocus
          className="node-label-input"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
            if (e.key === 'Escape') {
              setLabel(data.label || 'Manual Input');
              setEditing(false);
            }
          }}
        />
      ) : (
        <div className="node-label">{label}</div>
      )}
    </div>
  );
};

// Hexagon node
const HexagonNode = ({ data, selected, isConnectable }) => {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label || 'Preparation');

  useEffect(() => {
    setLabel(data.label || 'Preparation');
  }, [data.label]);

  const handleDoubleClick = () => setEditing(true);
  const handleBlur = () => {
    setEditing(false);
    if (data.onLabelChange) data.onLabelChange(label);
  };

  return (
    <div
      className={`rf-node hexagon-node ${selected ? 'selected' : ''}`}
      onDoubleClick={handleDoubleClick}
    >
      <ResizeHandles isConnectable={isConnectable} />
      {editing ? (
        <input
          autoFocus
          className="node-label-input"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
            if (e.key === 'Escape') {
              setLabel(data.label || 'Preparation');
              setEditing(false);
            }
          }}
        />
      ) : (
        <div className="node-label">{label}</div>
      )}
    </div>
  );
};
// Text node
const TextNode = ({ data, selected, isConnectable }) => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(data.text || 'Text');

  useEffect(() => {
    setText(data.text || 'Text');
  }, [data.text]);

  const handleDoubleClick = () => setEditing(true);
  const handleBlur = () => {
    setEditing(false);
    if (data.onTextChange) data.onTextChange(text);
  };

  return (
    <div
      className={`rf-node text-node ${selected ? 'selected' : ''}`}
      onDoubleClick={handleDoubleClick}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: 'transparent', borderRadius: 0 }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: 'transparent', borderRadius: 0 }}
        isConnectable={isConnectable}
      />
      {editing ? (
        <textarea
          autoFocus
          className="node-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setText(data.text || 'Text');
              setEditing(false);
            }
          }}
        />
      ) : (
        <div className="node-text-content">{text}</div>
      )}
    </div>
  );
};

// Generic shape node
const GenericShapeNode = ({ data, selected, isConnectable }) => {
  const {
    label = 'Shape',
    text = '',
    width = 160,
    height = 80,
    borderRadius = 8,
    backgroundColor = '#f0f0f0',
    borderColor = '#333',
    borderWidth = 1,
    rotation = 0,
    fontSize = 14,
    fontWeight = 'normal',
    textAlign = 'center',
    verticalAlign = 'middle',
    padding = 8,
    onContentChange,
  } = data;

  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(text || label);

  useEffect(() => {
    setContent(text || label);
  }, [text, label]);

  const handleDoubleClick = () => {
    setEditing(true);
  };

  const handleBlur = () => {
    setEditing(false);
    if (onContentChange) {
      onContentChange(content);
    }
  };

  const containerStyle = {
    width,
    height,
    borderRadius,
    backgroundColor,
    border: `${borderWidth}px solid ${borderColor}`,
    transform: `rotate(${rotation}deg)`,
    fontSize,
    fontWeight,
    textAlign,
    padding,
    display: 'flex',
    alignItems:
      verticalAlign === 'top'
        ? 'flex-start'
        : verticalAlign === 'bottom'
        ? 'flex-end'
        : 'center',
    justifyContent:
      textAlign === 'left'
        ? 'flex-start'
        : textAlign === 'right'
        ? 'flex-end'
        : 'center',
  };

  return (
    <div
      className={`rf-node generic-shape-node ${selected ? 'selected' : ''}`}
      style={containerStyle}
      onDoubleClick={handleDoubleClick}
    >
      <NodeResizer
        color="#1890ff"
        isVisible={true}
        minWidth={60}
        minHeight={40}
        handleStyle={{
          width: 8,
          height: 8,
          borderRadius: 4,
          background: '#1890ff',
          border: 'none',
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555', borderRadius: 0 }}
        isConnectable={isConnectable}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', borderRadius: 0 }}
        isConnectable={isConnectable}
      />
      {editing ? (
        <textarea
          autoFocus
          className="node-textarea"
          style={{ width: '100%', height: '100%', resize: 'none', border: 'none' }}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setContent(text || label);
              setEditing(false);
            }
          }}
        />
      ) : (
        <div className="node-text-content">{content}</div>
      )}
    </div>
  );
};

// SVG stamp node (example simple node for future extension)
const SvgStampNode = ({ data, selected, isConnectable }) => {
  const { svgContent, label = 'Stamp' } = data;
  return (
    <div className={`rf-node svg-stamp-node ${selected ? 'selected' : ''}`}>
      <ResizeHandles isConnectable={isConnectable} />
      <div className="svg-stamp-label">{label}</div>
      <div
        className="svg-stamp-content"
        dangerouslySetInnerHTML={{ __html: svgContent || '' }}
      />
    </div>
  );
};

// Editable edge with label
const EditableEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data?.label || '');

  useEffect(() => {
    setLabel(data?.label || '');
  }, [data?.label]);

  const handleDoubleClick = () => setEditing(true);
  const handleBlur = () => {
    setEditing(false);
    if (data?.onLabelChange) {
      data.onLabelChange(label);
    }
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? '#1890ff' : '#555',
          strokeWidth: selected ? 2 : 1.5,
          ...style,
        }}
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            fontSize: 12,
            background: 'white',
            padding: '2px 4px',
            borderRadius: 4,
            border: selected ? '1px solid #1890ff' : '1px solid #ccc',
          }}
          className="nodrag nopan"
          onDoubleClick={handleDoubleClick}
        >
          {editing ? (
            <input
              autoFocus
              style={{
                fontSize: 12,
                border: 'none',
                outline: 'none',
                width: '100%',
              }}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
                if (e.key === 'Escape') {
                  setLabel(data?.label || '');
                  setEditing(false);
                }
              }}
            />
          ) : (
            <span>{label}</span>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

// Sidebar shape group
const ShapeCategory = ({ title, shapes, onDragStart }) => (
  <div className="shape-category">
    <div className="shape-category-title">{title}</div>
    <div className="shape-category-items">
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className="shape-item"
          draggable
          onDragStart={(event) => onDragStart(event, shape.id)}
          title={shape.description}
        >
          <div className="shape-item-label">{shape.label}</div>
        </div>
      ))}
    </div>
  </div>
);

// Build slot values (if you were using any slot-based meta; kept as-is)
const buildSlotValues = (nodes) => {
  return nodes.map((node) => ({
    id: node.id,
    type: node.type,
    label: node.data?.label || node.data?.text || '',
  }));
};

// Utility: export canvas as PNG
const exportToPng = async (selector = '.react-flow') => {
  const element = document.querySelector(selector);
  if (!element) return;

  try {
    const dataUrl = await toPng(element, {
      backgroundColor: '#ffffff',
      pixelRatio: 2,
    });
    const link = document.createElement('a');
    link.download = 'diagram.png';
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Error exporting PNG:', error);
  }
};

// Utility: save canvas as screen asset (used by DefineProductButton)
const saveCanvasAsScreen = async ({ userId, projectId, screenName }) => {
  const element = document.querySelector('.react-flow');
  if (!element) return;

  try {
    const dataUrl = await toPng(element, {
      backgroundColor: '#ffffff',
      pixelRatio: 2,
    });

    const screenPath = await saveAssetToScreenFolder({
      userId,
      projectId,
      screenName,
      dataUrl,
      extension: 'png',
    });

    return screenPath;
  } catch (error) {
    console.error('Error saving canvas as screen:', error);
    throw error;
  }
};


function FlowchartCanvasInner() {
  const rf = useReactFlow();
  const navigate = useNavigate();
  const { userId } = useProject() || {};
  const canvasIntegration = useCanvasFileIntegration();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selected, setSelected] = useState(null);
  const [clipboard, setClipboard] = useState({ nodes: [], edges: [] });
  const [hasProjects, setHasProjects] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState(null);

  // current graph refs for snapshots
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);
  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  // history
  const historyRef = useRef(createEmptyHistory());
  const isUndoRedoRef = useRef(false);
  const snapshotTimeoutRef = useRef(null);

  const pushSnapshot = useCallback(() => {
    const snapshot = {
      nodes: JSON.parse(JSON.stringify(nodesRef.current)),
      edges: JSON.parse(JSON.stringify(edgesRef.current)),
      viewport: rf.getViewport(),
    };
    const history = historyRef.current;
    const base = history.entries.slice(0, history.index + 1);
    base.push(snapshot);

    const MAX = 50;
    let entries = base;
    let index = base.length - 1;
    if (entries.length > MAX) {
      entries = entries.slice(entries.length - MAX);
      index = entries.length - 1;
    }
    history.entries = entries;
    history.index = index;
  }, [rf]);

  const scheduleSnapshot = useCallback(() => {
    if (isUndoRedoRef.current) return;
    if (snapshotTimeoutRef.current) {
      clearTimeout(snapshotTimeoutRef.current);
    }
    snapshotTimeoutRef.current = setTimeout(() => {
      pushSnapshot();
      snapshotTimeoutRef.current = null;
    }, 200);
  }, [pushSnapshot]);

  useEffect(
    () => () => {
      if (snapshotTimeoutRef.current) {
        clearTimeout(snapshotTimeoutRef.current);
      }
    },
    []
  );

  // initialize history so first undo has a base
  useEffect(() => {
    if (historyRef.current.entries.length === 0) {
      pushSnapshot();
    }
  }, [pushSnapshot]);

  const undo = useCallback(() => {
    const history = historyRef.current;
    if (history.index <= 0) return;
    const nextIndex = history.index - 1;
    const snap = history.entries[nextIndex];

    isUndoRedoRef.current = true;
    history.index = nextIndex;

    setNodes(snap.nodes || []);
    setEdges(snap.edges || []);
    nodesRef.current = snap.nodes || [];
    edgesRef.current = snap.edges || [];

    if (snap.viewport) {
      requestAnimationFrame(() => rf.setViewport(snap.viewport));
    }
    setTimeout(() => {
      isUndoRedoRef.current = false;
    }, 50);
  }, [rf, setNodes, setEdges]);

  const redo = useCallback(() => {
    const history = historyRef.current;
    if (history.index >= history.entries.length - 1) return;
    const nextIndex = history.index + 1;
    const snap = history.entries[nextIndex];

    isUndoRedoRef.current = true;
    history.index = nextIndex;

    setNodes(snap.nodes || []);
    setEdges(snap.edges || []);
    nodesRef.current = snap.nodes || [];
    edgesRef.current = snap.edges || [];

    if (snap.viewport) {
      requestAnimationFrame(() => rf.setViewport(snap.viewport));
    }
    setTimeout(() => {
      isUndoRedoRef.current = false;
    }, 50);
  }, [rf, setNodes, setEdges]);

  // selection helpers
  const getSelectedItems = useCallback(() => {
    const selectedNodes = nodesRef.current.filter((n) => n.selected);
    const selectedEdges = edgesRef.current.filter((e) => e.selected);
    return { selectedNodes, selectedEdges };
  }, []);

  const copySelected = useCallback(() => {
    const { selectedNodes, selectedEdges } = getSelectedItems();
    if (!selectedNodes.length && !selectedEdges.length) return;
    setClipboard({ nodes: selectedNodes, edges: selectedEdges });
  }, [getSelectedItems]);

  const pasteFromClipboard = useCallback(() => {
    if (!clipboard || (!clipboard.nodes.length && !clipboard.edges.length)) return;
    const idMap = new Map();
    const newNodes = clipboard.nodes.map((n) => {
      const id = getId();
      idMap.set(n.id, id);
      return {
        ...n,
        id,
        position: { x: n.position.x + 50, y: n.position.y + 50 },
        selected: true,
      };
    });
    const newEdges = clipboard.edges
      .map((e) => {
        const s = idMap.get(e.source);
        const t = idMap.get(e.target);
        if (!s || !t) return null;
        return {
          ...e,
          id: getId(),
          source: s,
          target: t,
          selected: true,
        };
      })
      .filter(Boolean);

    setNodes((nds) => nds.map((n) => ({ ...n, selected: false })).concat(newNodes));
    setEdges((eds) => eds.map((e) => ({ ...e, selected: false })).concat(newEdges));
    scheduleSnapshot();
  }, [clipboard, setNodes, setEdges, scheduleSnapshot]);

  const selectAll = useCallback(() => {
    setNodes((nds) => nds.map((n) => ({ ...n, selected: true })));
    setEdges((eds) => eds.map((e) => ({ ...e, selected: true })));
  }, [setNodes, setEdges]);

  const deleteSelected = useCallback(() => {
    const { selectedNodes, selectedEdges } = getSelectedItems();
    if (!selectedNodes.length && !selectedEdges.length) return;
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) => eds.filter((e) => !e.selected));
    setSelected(null);
    scheduleSnapshot();
  }, [getSelectedItems, setNodes, setEdges, scheduleSnapshot]);

  // keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e) => {
      const active = document.activeElement;
      const isInputActive =
        active &&
        (active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.contentEditable === 'true');

      // F2: edit selected node label
      if (e.key === 'F2' && selected?.kind === 'node') {
        e.preventDefault();
        setNodes((nds) =>
          nds.map((n) =>
            n.id === selected.id
              ? { ...n, data: { ...n.data, editing: true } }
              : n
          )
        );
        return;
      }

      if (isInputActive) return;

      const isMod = e.ctrlKey || e.metaKey;

      if (isMod) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              // Ctrl+Shift+Z -> redo
              redo();
            } else {
              // Ctrl/Cmd+Z -> undo
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            // Ctrl+Y -> redo
            redo();
            break;
          case 'c':
            e.preventDefault();
            copySelected();
            break;
          case 'v':
            e.preventDefault();
            pasteFromClipboard();
            break;
          case 'a':
            e.preventDefault();
            selectAll();
            break;
          default:
            break;
        }
      } else {
        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            e.preventDefault();
            deleteSelected();
            break;
          case 'Escape':
            setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
            setEdges((eds) => eds.map((ed) => ({ ...ed, selected: false })));
            setSelected(null);
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
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

  // save/load diagram as JSON
  const saveDiagram = () => {
    const payload = { nodes, edges, viewport: rf.getViewport() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadDiagram = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
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
          pushSnapshot();
        } catch (err) {
          console.error('Invalid diagram JSON', err);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // property panel helpers
  const updateSelectedNode = (mapper) => {
    if (!selected || selected.kind !== 'node') return;
    setNodes((nds) => nds.map((n) => (n.id === selected.id ? mapper(n) : n)));
    scheduleSnapshot();
  };

  const getSelectedEntity = () => {
    if (!selected) return null;
    if (selected.kind === 'node') {
      return nodes.find((n) => n.id === selected.id) || null;
    }
    return edges.find((e) => e.id === selected.id) || null;
  };

  const selectedEntity = getSelectedEntity();

  // tab navigation
  const handleTabChange = useCallback(
    (tab) => {
      const routes = {
        Simulation: '/simulation',
        Flowchart: '/FlowchartTest',
        'Block Diagram': '/BlockDiagram',
        'Block Programming': '/blockprogramming',
        'Code Editor': '/editor',
      };
      const next = routes[tab];
      if (next) navigate(next);
    },
    [navigate]
  );

  // project integration
  useEffect(() => {
    const checkProjects = () => {
      const allProjects = projectFileManager.getAllProjects();
      const projects = Object.values(allProjects);
      setHasProjects(projects.length > 0);
      if (projects.length > 0 && !activeProjectId) {
        const active = projectFileManager.getActiveProject();
        if (active) {
          setActiveProjectId(active.id);
        } else {
          setActiveProjectId(projects[0].id);
          projectFileManager.setActiveProject(projects[0].id);
        }
      }
    };

    checkProjects();

    const handleProjectChange = () => {
      const allProjects = projectFileManager.getAllProjects();
      const projects = Object.values(allProjects);
      setHasProjects(projects.length > 0);
    };

    const handleProjectCreated = () => {
      checkProjects();
    };

    window.addEventListener('project:change', handleProjectChange);
    window.addEventListener('project-created', handleProjectCreated);
    window.addEventListener('file-system-refresh', checkProjects);

    return () => {
      window.removeEventListener('project:change', handleProjectChange);
      window.removeEventListener('project-created', handleProjectCreated);
      window.removeEventListener('file-system-refresh', checkProjects);
    };
  }, [activeProjectId, userId]);

  const handleFileClick = useCallback(
    async (filePath, fileName, parsedContent, fileData) => {
      try {
        const result = await canvasIntegration.loadFileToCanvas(
          filePath,
          fileName,
          parsedContent,
          fileData
        );
        if (result && result.nodes && result.edges) {
          setNodes(result.nodes);
          setEdges(result.edges);
          if (result.viewport) {
            rf.setViewport(result.viewport);
          }
          pushSnapshot();
        }
      } catch (err) {
        console.error('Error loading file to canvas:', err);
      }
    },
    [canvasIntegration, setNodes, setEdges, rf, pushSnapshot]
  );

  // node & edge types
  const nodeTypes = useMemo(
    () => ({
      process: ProcessNode,
      decision: DecisionNode,
      terminator: TerminatorNode,
      ellipse: EllipseNode,
      data: DataNode,
      database: DatabaseNode,
      manualInput: ManualInputNode,
      hexagon: HexagonNode,
      svgStamp: SvgStampNode,
      textNode: TextNode,
      genericShape: GenericShapeNode,
    }),
    []
  );

  const edgeTypes = useMemo(
    () => ({
      editable: EditableEdge,
    }),
    []
  );

  // ReactFlow handlers
  const handleNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      scheduleSnapshot();
    },
    [onNodesChange, scheduleSnapshot]
  );

  const handleEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      scheduleSnapshot();
    },
    [onEdgesChange, scheduleSnapshot]
  );

  const handleConnect = useCallback(
    (connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: 'editable',
            label: '',
          },
          eds
        )
      );
      scheduleSnapshot();
    },
    [setEdges, scheduleSnapshot]
  );

  const handleSelectionChange = useCallback((sel) => {
    if (!sel) {
      setSelected(null);
      return;
    }
    if (sel.nodes?.[0]) {
      setSelected({ kind: 'node', id: sel.nodes[0].id });
    } else if (sel.edges?.[0]) {
      setSelected({ kind: 'edge', id: sel.edges[0].id });
    } else {
      setSelected(null);
    }
  }, []);

  return (
    <div className="block-diagram-root">
      <EditorNavbar
        onSave={saveDiagram}
        onLoad={loadDiagram}
        onUndo={undo}
        onRedo={redo}
      />
      <DiagramTabs active="Block Diagram" onTabChange={handleTabChange} />
      <div className="block-diagram-layout">
        <div className="sidebar-left">
          <ProjectFileExplorer onFileClick={handleFileClick} />
          <FileExplorer />
        </div>
        <div className="canvas-wrapper">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={handleConnect}
            onSelectionChange={handleSelectionChange}
            connectionLineType={ConnectionLineType.SmoothStep}
            connectionMode={ConnectionMode.Loose}
            fitView
            minZoom={0.2}
            maxZoom={2}
          >
            <Background />
            <MiniMap />
            <Controls>
              <ControlButton onClick={undo} title="Undo (Ctrl+Z)">
                <RotateCcw size={16} />
              </ControlButton>
              <ControlButton onClick={redo} title="Redo (Ctrl+Y / Ctrl+Shift+Z)">
                <RotateCw size={16} />
              </ControlButton>
            </Controls>
          </ReactFlow>
        </div>
        <div className="sidebar-right">
          <PropertiesPanel
            selected={selectedEntity}
            onUpdateNode={updateSelectedNode}
            onDelete={deleteSelected}
          />
        </div>
      </div>
    </div>
  );
}

export default function BlockDiagramTest() {
  return (
    <WorkspaceTabsProvider>
      <ReactFlowProvider>
        <FlowchartCanvasInner />
      </ReactFlowProvider>
    </WorkspaceTabsProvider>
  );
}


