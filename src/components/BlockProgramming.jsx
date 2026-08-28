// import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, useDisclosure, IconButton, Box } from '@chakra-ui/react';

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
//   MarkerType,
//   ReactFlowProvider,
//   useReactFlow,
//   ConnectionMode,
//   ConnectionLineType,
//   Panel,
//   useKeyPress,
// } from 'reactflow';
// import { NodeResizer } from '@reactflow/node-resizer';
// import 'reactflow/dist/style.css';
// import '@reactflow/node-resizer/dist/style.css';
// import { RotateCcw, RotateCw } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import EditorNavbar from './EditorNavbar';
// import FileExplorer from './FileExplorer';
// import './FileExplorer.css';
// import './BlockDiagramTest.css';
// import hexBg from '../assets/hex_bg.png';
// import { saveProjectFile, sanitizeSegment, ensureProjectFolder } from '../utils/workspaceStorage';
// import { saveAssetToScreenFolder } from '../utils/screenFileManager';
// import { useProject } from '../ProjectContext';
// import DiagramTabs from './DiagramTabs';
// import { WorkspaceTabsProvider, useWorkspaceTabs } from '../hooks/useWorkspaceTabs';
// import projectFileManager from '../utils/projectFileManager';
// import { useCanvasFileIntegration } from '../hooks/useCanvasFileIntegration';
// import ProjectFileExplorer from './ProjectFileExplorer';

// const DEFAULT_NODE_DATA = {
//   label: 'BLOCK',
//   variant: 'rectangle',
//   fill: '#ffffff',
//   stroke: '#111827',
//   text: '#111827',
//   strokeWidth: 3,
//   fontSize: 16,
//   rotation: 0,
// };

// // Update grid config for full screen
// const GRID_CONFIG = {
//   ROWS: 12,
//   COLUMNS: 9,
//   SPACING_X: 100,  // Reduced spacing
//   SPACING_Y: 60,   // Reduced spacing
//   START_X: 20,     // Adjusted start position
//   START_Y: 20
// };

// // Update default node dimensions
// const DEFAULT_NODE_DIMENSIONS = {
//   width: 120,  // Reduced from 180
//   height: 50   // Reduced from 80
// };

// const LOGIC_GROUPS = [
//   {
//     id: 'logic',
//     title: 'Logic Blocks',
//     items: [
//       { type: 'logic', label: 'IF', variant: 'rectangle' },
//       { type: 'logic', label: 'ELSE IF', variant: 'rectangle' },
//       { type: 'logic', label: 'ELIF', variant: 'rectangle' },
//       { type: 'logic', label: 'SWITCH', variant: 'rectangle' },
//       { type: 'logic', label: 'CASE', variant: 'rectangle' },
//       { type: 'logic', label: 'ELSE', variant: 'rectangle' },
//     ],
//   },
//   {
//     id: 'io',
//     title: 'Input / Output',
//     items: [
//       { type: 'logic', label: 'READ INPUT', variant: 'rectangle' },
//       { type: 'logic', label: 'READ GPIO', variant: 'rectangle' },
//       { type: 'logic', label: 'READ SWITCH', variant: 'rectangle' },
//       { type: 'logic', label: 'LED ON', variant: 'rectangle' },
//       { type: 'logic', label: 'LED OFF', variant: 'rectangle' },
//     ],
//   },
//   {
//     id: 'flow',
//     title: 'Flow Helpers',
//     items: [
//       { type: 'logic', label: 'START', variant: 'rectangle' },
//       { type: 'logic', label: 'STOP', variant: 'rectangle' },
//       { type: 'logic', label: 'LOOP', variant: 'rectangle' },
//     ],
//   },
// ];

// let logicId = 1;
// const getId = () => `logic_${logicId++}`;
// const createBlockProgrammingState = () => ({ nodes: [], edges: [], viewport: null, idSeed: 1 });

// const handleStyle = {
//   width: 8,
//   height: 8,
//   background: '#0f172a',
//   borderRadius: '50%',
// };

// // Generate initial grid nodes
// const generateGridNodes = () => {
//   const nodes = [];
//   for (let row = 0; row < GRID_CONFIG.ROWS; row++) {
//     for (let col = 0; col < GRID_CONFIG.COLUMNS; col++) {
//       const id = `grid_${row}_${col}`;
//       nodes.push({
//         id,
//         type: 'logic',
//         position: {
//           x: GRID_CONFIG.START_X + (col * GRID_CONFIG.SPACING_X),
//           y: GRID_CONFIG.START_Y + (row * GRID_CONFIG.SPACING_Y)
//         },
//         data: {
//           ...DEFAULT_NODE_DATA,
//           label: `Block ${row}-${col}`,
//         },
//         style: { 
//           width: DEFAULT_NODE_DIMENSIONS.width, 
//           height: DEFAULT_NODE_DIMENSIONS.height 
//         }
//       });
//     }
//   }
//   return nodes;
// };

// function LogicBlockNode({ id, data, selected }) {
//   const rf = useReactFlow();
//   const {
//     label = 'BLOCK',
//     fill = '#ffffff',
//     stroke = '#111827',
//     text = '#111827',
//     strokeWidth = 3,
//     fontSize = 16,
//     rotation = 0,
//   } = data || {};

//   const editLabel = useCallback(() => {
//     const next = window.prompt('Edit block label', label);
//     if (next != null) {
//       rf.setNodes((nodes) =>
//         nodes.map((node) =>
//           node.id === id ? { ...node, data: { ...node.data, label: next } } : node,
//         ),
//       );
//     }
//   }, [rf, id, label]);

//   // Rectangle handles on all sides
//   const handles = (
//     <>
//       <Handle id="top" type="target" position={Position.Top} style={handleStyle} />
//       <Handle id="right" type="source" position={Position.Right} style={handleStyle} />
//       <Handle id="bottom" type="source" position={Position.Bottom} style={handleStyle} />
//       <Handle id="left" type="target" position={Position.Left} style={handleStyle} />
//     </>
//   );

//   // Always render a rectangle SVG
//   return (
//     <div className="logic-node" onDoubleClick={editLabel}>
//       <NodeResizer isVisible={selected} minWidth={80} minHeight={40} color={stroke} />
//       <div className="logic-node__content" style={{ transform: `rotate(${rotation}deg)` }}>
//         <svg viewBox="0 0 120 50" width="100%" height="100%">
//           <rect
//             x="0"
//             y="0"
//             width="120"
//             height="50"
//             fill={fill}
//             stroke={stroke}
//             strokeWidth={strokeWidth}
//             rx="8"
//             ry="8"
//           />
//         </svg>
//         <div className="logic-node__label" style={{ 
//           color: text, 
//           fontSize: `${fontSize * 0.8}px`,
//           padding: '4px'
//         }}>
//           {label}
//         </div>
//       </div>
//       {handles}
//     </div>
//   );
// }


// const nodeTypes = { logic: LogicBlockNode };

// function BlockProgrammingCanvas() {
//   const reactFlowWrapper = useRef(null);
//   const [nodes, setNodes, onNodesChange] = useNodesState([]);
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
//   const [openGroups, setOpenGroups] = useState({ logic: true, io: true, flow: true });
//   const [paletteSearch, setPaletteSearch] = useState('');
//   const [selected, setSelected] = useState(null);
//   const [isExplorerVisible, setIsExplorerVisible] = useState('blocks');
//   const deletePressed = useKeyPress('Delete');
//   const backspacePressed = useKeyPress('Backspace');
//   const rf = useReactFlow();
//   const { activeTab, tabs, loading: tabsLoading, createTab, updateActiveTabState, activeTabId, selectTab } = useWorkspaceTabs();
//   const hydratingRef = useRef(false);
//   const navigate = useNavigate();
//   const { user, activeProjectId, activeProjectName, setActiveProjectId } = useProject?.() ?? {};
//   const userId = user?.userId || user?._id || user?.id;

//   // Canvas file integration for Block Programming
//   const canvasIntegration = useCanvasFileIntegration('Block Programming');

//   // Project management state
//   const [hasProjects, setHasProjects] = useState(false);

//   const nodesRef = useRef(nodes);
//   const edgesRef = useRef(edges);
//   const snapshotTimeoutRef = useRef(null);

//   useEffect(() => {
//     nodesRef.current = nodes;
//   }, [nodes]);

//   useEffect(() => {
//     edgesRef.current = edges;
//   }, [edges]);

//   const historyRef = useRef({ entries: [], index: -1 });

//   const pushSnapshot = useCallback(() => {
//     const snapshot = {
//       nodes: nodesRef.current,
//       edges: edgesRef.current,
//       viewport: rf.getViewport(),
//     };
//     const entries = historyRef.current.entries.slice(0, historyRef.current.index + 1);
//     entries.push(JSON.parse(JSON.stringify(snapshot)));
//     historyRef.current.entries = entries;
//     historyRef.current.index = entries.length - 1;
//   }, [rf]);

//   // Project management integration
//   useEffect(() => {
//     const checkProjects = async () => {
//       // Fix: Get all projects using projectFileManager
//       const allProjects = projectFileManager.getAllProjects() || {};
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
//   }, [activeProjectId, setActiveProjectId, userId]);

//   // File click handler for project integration
//   const handleFileClick = useCallback(async (filePath, fileName, parsedContent, fileData) => {
//     try {
//       console.log('File clicked in Block Programming:', fileName, filePath);

//       // Load file using canvas integration
//       const result = await canvasIntegration.loadFileToCanvas(filePath, fileName, parsedContent, fileData);

//       if (result.success) {
//         // Apply content to canvas if it's JSON block programming data
//         if (fileName.endsWith('.json') && parsedContent && typeof parsedContent === 'object') {
//           if (parsedContent.blocks && parsedContent.connections) {
//             // Convert blocks to nodes and connections to edges
//             const nodes = parsedContent.blocks || [];
//             const edges = parsedContent.connections || [];

//             setNodes(nodes);
//             setEdges(edges);

//             // Apply canvas settings if available
//             if (parsedContent.canvas?.position && parsedContent.canvas?.zoom && rf) {
//               setTimeout(() => {
//                 rf.setViewport({
//                   x: parsedContent.canvas.position.x || 0,
//                   y: parsedContent.canvas.position.y || 0,
//                   zoom: parsedContent.canvas.zoom || 1
//                 });
//               }, 100);
//             }
//           } else if (parsedContent.nodes && parsedContent.edges) {
//             // Fallback to standard ReactFlow format
//             setNodes(parsedContent.nodes || []);
//             setEdges(parsedContent.edges || []);

//             if (parsedContent.viewport && rf) {
//               setTimeout(() => {
//                 rf.setViewport(parsedContent.viewport);
//               }, 100);
//             }
//           }
//         }

//         console.log(`Loaded ${fileName} into Block Programming canvas`);
//       } else {
//         console.error('Failed to load file:', result.error);
//       }
//     } catch (error) {
//       console.error('Failed to handle file click:', error);
//     }
//   }, [canvasIntegration, setNodes, setEdges, rf]);

//   // Setup auto-save functionality for Block Programming
//   useEffect(() => {
//     const activeProject = projectFileManager.getActiveProject();
//     if (!activeProject) return;

//     // Debounced save trigger
//     const timer = setTimeout(() => {
//       const content = {
//         blocks: nodes,
//         connections: edges,
//         canvas: {
//           zoom: rf.getViewport().zoom,
//           position: {
//             x: rf.getViewport().x,
//             y: rf.getViewport().y
//           }
//         }
//       };
//       canvasIntegration.saveCanvasToFile(content, 'BlockProgramming/logic_blocks.json', activeProject.id);
//     }, 1000);

//     return () => clearTimeout(timer);
//   }, [nodes, edges, rf, canvasIntegration]);

//   useEffect(() => {
//     pushSnapshot();
//   }, [pushSnapshot]);

//   useEffect(() => {
//     if (!tabsLoading && tabs.length === 0) {
//       createTab();
//     }
//   }, [tabsLoading, tabs, createTab]);

//   useEffect(() => {
//     if (!activeTab) return;
//     hydratingRef.current = true;
//     const state = activeTab.state || createBlockProgrammingState();
//     logicId = state.idSeed || 1;
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
//           idSeed: logicId,
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
//     updateActiveTabState((prev = createBlockProgrammingState()) => ({
//       ...prev,
//       nodes: nodesRef.current,
//       edges: edgesRef.current,
//       viewport: rf.getViewport(),
//       idSeed: logicId,
//     }));
//   }, [rf, updateActiveTabState]);

//   useEffect(() => () => {
//     if (snapshotTimeoutRef.current) {
//       clearTimeout(snapshotTimeoutRef.current);
//     }
//   }, []);

//   const scheduleSnapshot = useCallback(() => {
//     if (snapshotTimeoutRef.current) {
//       clearTimeout(snapshotTimeoutRef.current);
//     }
//     snapshotTimeoutRef.current = setTimeout(() => {
//       pushSnapshot();
//       persistCurrentState();
//       snapshotTimeoutRef.current = null;
//     }, 300);
//   }, [persistCurrentState, pushSnapshot]);

//   const undo = useCallback(() => {
//     const { entries, index } = historyRef.current;
//     if (index > 0) {
//       const snapshot = entries[index - 1];
//       historyRef.current.index = index - 1;
//       setNodes(snapshot.nodes || []);
//       setEdges(snapshot.edges || []);
//       if (snapshot.viewport) rf.setViewport(snapshot.viewport);
//     }
//   }, [rf, setEdges, setNodes]);

//   const redo = useCallback(() => {
//     const { entries, index } = historyRef.current;
//     if (index < entries.length - 1) {
//       const snapshot = entries[index + 1];
//       historyRef.current.index = index + 1;
//       setNodes(snapshot.nodes || []);
//       setEdges(snapshot.edges || []);
//       if (snapshot.viewport) rf.setViewport(snapshot.viewport);
//     }
//   }, [rf, setEdges, setNodes]);

//   const onConnect = useCallback(
//     (params) => {
//       setEdges((eds) =>
//         addEdge(
//           {
//             ...params,
//             type: 'step',
//             markerEnd: { type: MarkerType.ArrowClosed },
//             style: { stroke: '#111827', strokeWidth: 2 },
//             labelBgPadding: [6, 4],
//           },
//           eds,
//         ),
//       );
//       scheduleSnapshot();
//     },
//     [scheduleSnapshot],
//   );

//   const onDrop = useCallback(
//     (event) => {
//       event.preventDefault();
//       const payload = event.dataTransfer.getData('application/reactflow');
//       if (!payload) return;

//       let item;
//       try {
//         item = JSON.parse(payload);
//       } catch (err) {
//         item = null;
//       }

//       if (!item) return;

//       const position = rf.screenToFlowPosition({ x: event.clientX, y: event.clientY });
//       const id = getId();
//       logicId += 1;

//       const baseWidth = item.variant === 'rectangle' ? 180 : 160;
//       const baseHeight = item.variant === 'rectangle' ? 160 : 80;

//       setNodes((nds) =>
//         nds.concat({
//           id,
//           type: 'logic',
//           position,
//           data: {
//             ...DEFAULT_NODE_DATA,
//             label: item.label,
//             variant: item.variant,
//           },
//           style: { 
//             width: DEFAULT_NODE_DIMENSIONS.width, 
//             height: DEFAULT_NODE_DIMENSIONS.height 
//           },
//         }),
//       );
//       setSelected({ kind: 'node', id });
//       scheduleSnapshot();
//     },
//     [rf, scheduleSnapshot, setNodes],
//   );

//   const onDragStart = (event, entry) => {
//     event.dataTransfer.setData('application/reactflow', JSON.stringify(entry));
//     event.dataTransfer.effectAllowed = 'move';
//   };

//   const onDragOver = useCallback((event) => {
//     event.preventDefault();
//     event.dataTransfer.dropEffect = 'move';
//   }, []);

//   const handleNodesChange = useCallback(
//     (changes) => {
//       onNodesChange(changes);
//       scheduleSnapshot();
//     },
//     [onNodesChange, scheduleSnapshot],
//   );

//   const handleEdgesChange = useCallback(
//     (changes) => {
//       onEdgesChange(changes);
//       scheduleSnapshot();
//     },
//     [onEdgesChange, scheduleSnapshot],
//   );

//   const onSelectionChange = useCallback(({ nodes: selectedNodes, edges: selectedEdges }) => {
//     if (selectedNodes?.length) {
//       setSelected({ kind: 'node', id: selectedNodes[0].id, data: selectedNodes[0].data });
//     } else if (selectedEdges?.length) {
//       setSelected({ kind: 'edge', id: selectedEdges[0].id });
//     } else {
//       setSelected(null);
//     }
//   }, []);

//   const selectedEntity = useMemo(() => {
//     if (!selected || selected.kind !== 'node') return null;
//     return nodes.find((node) => node.id === selected.id) || null;
//   }, [nodes, selected]);

//   const isNodeSelected = selected?.kind === 'node' && Boolean(selectedEntity);

//   const updateSelectedNode = useCallback(
//     (mapper) => {
//       if (!isNodeSelected) return;
//       setNodes((nds) => nds.map((node) => (node.id === selected.id ? mapper(node) : node)));
//       scheduleSnapshot();
//     },
//     [isNodeSelected, scheduleSnapshot, selected, setNodes],
//   );

//   const handleEditText = useCallback(() => {
//     if (!isNodeSelected || !selectedEntity) return;
//     const current = selectedEntity.data?.label ?? '';
//     const next = window.prompt('Block label', current);
//     if (next != null) {
//       updateSelectedNode((node) => ({ ...node, data: { ...node.data, label: next } }));
//     }
//   }, [isNodeSelected, selectedEntity, updateSelectedNode]);

//   const filteredGroups = useMemo(() => {
//     const query = paletteSearch.trim().toLowerCase();
//     if (!query) return LOGIC_GROUPS;
//     return LOGIC_GROUPS.map((group) => ({
//       ...group,
//       items: group.items.filter((item) => item.label.toLowerCase().includes(query)),
//     })).filter((group) => group.items.length > 0);
//   }, [paletteSearch]);

//   const hasSearch = paletteSearch.trim().length > 0;

//   const handleTabChange = useCallback(
//     (tab) => {
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
//     },
//     [navigate],
//   );

//   const saveDiagram = useCallback(() => {
//     const snapshot = {
//       nodes: nodesRef.current,
//       edges: edgesRef.current,
//       viewport: rf.getViewport(),
//     };
//     const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = 'block-programming.json';
//     link.click();
//     URL.revokeObjectURL(url);
//   }, [rf]);

//   const loadDiagram = useCallback(() => {
//     const input = document.createElement('input');
//     input.type = 'file';
//     input.accept = '.json,application/json';
//     input.onchange = (event) => {
//       const file = event.target.files?.[0];
//       if (!file) return;
//       const reader = new FileReader();
//       reader.onload = () => {
//         try {
//           const parsed = JSON.parse(reader.result);
//           setNodes(parsed.nodes || []);
//           setEdges(parsed.edges || []);
//           if (parsed.viewport) {
//             rf.setViewport(parsed.viewport);
//           }
//           scheduleSnapshot();
//         } catch (error) {
//           console.error('Invalid block programming JSON', error);
//         }
//       };
//       reader.readAsText(file);
//     };
//     input.click();
//   }, [rf, scheduleSnapshot, setEdges, setNodes]);

//   const showExportPreview = useCallback((dataUrl, fileName) => {
//     const host = reactFlowWrapper.current;
//     if (!host) return;
//     if (getComputedStyle(host).position === 'static') {
//       host.style.position = 'relative';
//     }

//     const existing = host.querySelector('.diagram-export-preview');
//     if (existing) {
//       existing.remove();
//     }

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
//     openBtn.textContent = 'Open';
//     Object.assign(openBtn.style, {
//       padding: '6px 10px',
//       borderRadius: '6px',
//       border: '1px solid rgba(59,130,246,0.4)',
//       background: '#1d4ed8',
//       color: '#f8fafc',
//       fontSize: '12px',
//       cursor: 'pointer',
//     });
//     openBtn.onclick = () => window.open(dataUrl, '_blank', 'noopener');

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
//       watermark.appendChild(img);
//       const span = document.createElement('span');
//       span.textContent = 'made with innotrat labs';
//       watermark.appendChild(span);
//       container.appendChild(watermark);

//       const dataUrl = await toPng(container, {
//         cacheBust: true,
//         backgroundColor: '#ffffff',
//         pixelRatio: 2,
//         filter: (node) => {
//           if (!(node instanceof Element)) return true;
//           const classes = node.classList;
//           if (!classes) return true;
//           if (
//             classes.contains('export-ignore') ||
//             classes.contains('react-flow__background') ||
//             classes.contains('react-flow__attribution')
//           ) {
//             return false;
//           }
//           return true;
//         },
//       });

//       const activeProject = projectFileManager.getActiveProject();
//       const projectSegment = sanitizeSegment(activeProject?.name || activeProjectName || 'project');
//       const timeSegment = sanitizeSegment(new Date().toISOString());
//       const fileName = `${projectSegment}_blockprogramming_${timeSegment}.png`;

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

//       const link = document.createElement('a');
//       link.href = dataUrl;
//       link.download = fileName;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);

//       window.dispatchEvent(
//         new CustomEvent('diagram:export-preview', {
//           detail: {
//             kind: 'BlockProgramming',
//             fileName,
//             dataUrl,
//             timestamp: Date.now(),
//           },
//         })
//       );

//       showExportPreview(dataUrl, fileName);
//     } catch (error) {
//       console.error('Failed to export block programming PNG', error);
//     } finally {
//       if (watermark && watermark.parentNode) {
//         watermark.parentNode.removeChild(watermark);
//       }
//     }
//   }, [canvasIntegration, activeProjectName, reactFlowWrapper, showExportPreview]);

//   // Add keyboard deletion handler
//   useEffect(() => {
//     if ((deletePressed || backspacePressed) && selected) {
//       if (selected.kind === 'node') {
//         setNodes(nodes => nodes.filter(n => n.id !== selected.id));
//       } else if (selected.kind === 'edge') {
//         setEdges(edges => edges.filter(e => e.id !== selected.id));
//       }
//       setSelected(null);
//     }
//   }, [deletePressed, backspacePressed, selected, setNodes, setEdges]);

//   // Update ReactFlow render with new controls
//   return (
//     <div className="diagram-builder">
//       <EditorNavbar
//         activeTab="Block Programming"
//         onTabChange={handleTabChange}
//         onSaveJSON={saveDiagram}
//         onLoadJSON={loadDiagram}
//         onExportPNG={handleExportPNG}
//         onUndo={undo}
//         onRedo={redo}
//       />
//       <div className="content">
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
//               className={`sidebar-tab ${isExplorerVisible === 'blocks' ? 'active' : ''}`}
//               onClick={() => setIsExplorerVisible('blocks')}
//             >
//               Blocks
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
//                   <div className="palette-title">Logic Blocks</div>
//                 </div>
//                 <div className="palette-search">
//                   <input
//                     type="text"
//                     placeholder="Search blocks..."
//                     value={paletteSearch}
//                     onChange={(e) => setPaletteSearch(e.target.value)}
//                   />
//                 </div>
//                 <div className="palette-wrapper">
//                   {filteredGroups.length ? (
//                     filteredGroups.map((group) => {
//                       const isExpanded = hasSearch ? true : openGroups[group.id] ?? true;
//                       const toggleGroup = () => {
//                         if (hasSearch) return;
//                         setOpenGroups((prev) => ({
//                           ...prev,
//                           [group.id]: !(prev[group.id] ?? true),
//                         }));
//                       };
//                       return (
//                         <div className="palette-group" key={group.id}>
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
//                             <div className="palette-title">{group.title}</div>
//                             <span className="palette-chevron">{isExpanded ? '▾' : '▸'}</span>
//                           </div>
//                           {isExpanded && (
//                             <div className="palette-grid">
//                               {group.items.map((item) => {
//                                 const [primary, ...rest] = item.label.split(' ');
//                                 const secondary = rest.join(' ');
//                                 return (
//                                   <div
//                                     key={`${group.id}-${item.label}`}
//                                     className="shape-card"
//                                     draggable
//                                     onDragStart={(e) => onDragStart(e, item)}
//                                   >
//                                     <div className="shape-svg logic-shape-preview">
//                                       <span className="logic-shape-preview__primary">{primary}</span>
//                                       {secondary ? (
//                                         <span className="logic-shape-preview__secondary">{secondary}</span>
//                                       ) : null}
//                                     </div>
//                                     <div className="shape-label">{item.label}</div>
//                                   </div>
//                                 );
//                               })}
//                             </div>
//                           )}
//                         </div>
//                       );
//                     })
//                   ) : (
//                     <div className="palette-empty">No blocks found.</div>
//                   )}
//                 </div>
//                 <div className="palette-hint">Drag blocks into the workspace and connect them.</div>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="diagram-container">
//           <div style={{ padding: '8px 12px', background: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
//             <DiagramTabs title="Block Programming Workspace" />
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
//                 onSelectionChange={onSelectionChange}
//                 nodeTypes={nodeTypes}
//                 fitView
//                 connectionLineType={ConnectionLineType.Step}
//                 connectionMode={ConnectionMode.Strict}
//                 snapToGrid
//                 snapGrid={[16, 16]}
//               >
//                 <MiniMap className="export-ignore" />
//                 <Controls className="export-ignore">
//                   <ControlButton onClick={undo} title="Undo">
//                     <RotateCcw size={20} />
//                   </ControlButton>
//                   <ControlButton onClick={redo} title="Redo">
//                     <RotateCw size={20} />
//                   </ControlButton>
//                 </Controls>
//                 <Background className="export-ignore" gap={16} size={1} />
//               </ReactFlow>
//             </div>
//           </div>
//         </div>

//         <div className="properties-panel" style={{ display: 'none' }}>
//           <h3>Properties</h3>
//           <div style={{ fontSize: 12, marginBottom: 8 }}>
//             Selected: {isNodeSelected ? 'Block' : 'None'}
//           </div>

//           <div className="prop-row">
//             <label>Fill</label>
//             <input
//               type="color"
//               disabled={!isNodeSelected}
//               value={selectedEntity?.data?.fill ?? '#ffffff'}
//               onChange={(event) => {
//                 const value = event.target.value;
//                 updateSelectedNode((node) => ({ ...node, data: { ...node.data, fill: value } }));
//               }}
//             />
//           </div>

//           <div className="prop-row">
//             <label>Border</label>
//             <input
//               type="color"
//               disabled={!isNodeSelected}
//               value={selectedEntity?.data?.stroke ?? '#111827'}
//               onChange={(event) => {
//                 const value = event.target.value;
//                 updateSelectedNode((node) => ({ ...node, data: { ...node.data, stroke: value } }));
//               }}
//             />
//           </div>

//           <div className="prop-row">
//             <label>Text</label>
//             <input
//               type="color"
//               disabled={!isNodeSelected}
//               value={selectedEntity?.data?.text ?? '#111827'}
//               onChange={(event) => {
//                 const value = event.target.value;
//                 updateSelectedNode((node) => ({ ...node, data: { ...node.data, text: value } }));
//               }}
//             />
//           </div>

//           <div className="prop-row">
//             <label>Border W</label>
//             <input
//               type="range"
//               min={1}
//               max={12}
//               step={1}
//               disabled={!isNodeSelected}
//               value={Number(selectedEntity?.data?.strokeWidth ?? 3)}
//               onChange={(event) => {
//                 const value = Number(event.target.value);
//                 updateSelectedNode((node) => ({ ...node, data: { ...node.data, strokeWidth: value } }));
//               }}
//             />
//           </div>

//           <div className="prop-row">
//             <label>Text Size</label>
//             <input
//               type="range"
//               min={10}
//               max={48}
//               step={1}
//               disabled={!isNodeSelected}
//               value={Number(selectedEntity?.data?.fontSize ?? 16)}
//               onChange={(event) => {
//                 const value = Number(event.target.value);
//                 updateSelectedNode((node) => ({ ...node, data: { ...node.data, fontSize: value } }));
//               }}
//             />
//           </div>

//           <div className="prop-row">
//             <label>Rotate</label>
//             <input
//               type="range"
//               min={0}
//               max={359}
//               step={1}
//               disabled={!isNodeSelected}
//               value={Number(selectedEntity?.data?.rotation ?? 0)}
//               onChange={(event) => {
//                 const value = Number(event.target.value);
//                 updateSelectedNode((node) => ({ ...node, data: { ...node.data, rotation: value } }));
//               }}
//             />
//           </div>

//           <button className="edit-text-btn" disabled={!isNodeSelected} onClick={handleEditText}>
//             Edit Text
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function BlockProgrammingWorkspace() {
//   return (
//     <WorkspaceTabsProvider kind="blockprogramming" createInitialState={createBlockProgrammingState}>
//       <BlockProgrammingCanvas />
//     </WorkspaceTabsProvider>
//   );
// }

// const BlockProgramming = () => (
//   <ReactFlowProvider>
//     <BlockProgrammingWorkspace />
//   </ReactFlowProvider>
// );

// export default BlockProgramming;


//12-11-25
// import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
//   MarkerType,
//   ReactFlowProvider,
//   useReactFlow,
//   ConnectionMode,
//   ConnectionLineType,
//   Panel,
//   useKeyPress,
// } from 'reactflow';
// import { NodeResizer } from '@reactflow/node-resizer';
// import 'reactflow/dist/style.css';
// import '@reactflow/node-resizer/dist/style.css';
// import { RotateCcw, RotateCw } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import EditorNavbar from './EditorNavbar';
// import FileExplorer from './FileExplorer';
// import './FileExplorer.css';
// import './BlockDiagramTest.css';
// import hexBg from '../assets/hex_bg.png';
// import { saveProjectFile, sanitizeSegment, ensureProjectFolder } from '../utils/workspaceStorage';
// import { saveAssetToScreenFolder } from '../utils/screenFileManager';
// import { useProject } from '../ProjectContext';
// import DiagramTabs from './DiagramTabs';
// import { WorkspaceTabsProvider, useWorkspaceTabs } from '../hooks/useWorkspaceTabs';
// import projectFileManager from '../utils/projectFileManager';
// import { useCanvasFileIntegration } from '../hooks/useCanvasFileIntegration';
// import ProjectFileExplorer from './ProjectFileExplorer';
// import { toPng } from 'html-to-image';


// // Color scheme for different block types
// const BLOCK_COLORS = {
//   // Logic blocks - Purple/Violet theme
//   logic: {
//     fill: '#DDD6FE',      // Light purple
//     stroke: '#7C3AED',    // Deep purple
//     text: '#4C1D95',      // Dark purple
//   },
//   // Input/Output blocks - Blue theme
//   io: {
//     fill: '#DBEAFE',      // Light blue
//     stroke: '#2563EB',    // Blue
//     text: '#1E3A8A',      // Dark blue
//   },
//   // Flow control blocks - Green theme
//   flow: {
//     fill: '#D1FAE5',      // Light green
//     stroke: '#059669',    // Green
//     text: '#064E3B',      // Dark green
//   },
//   // Default/Custom blocks - Gray theme
//   default: {
//     fill: '#F3F4F6',      // Light gray
//     stroke: '#6B7280',    // Gray
//     text: '#1F2937',      // Dark gray
//   },
// };


// const DEFAULT_NODE_DATA = {
//   label: 'BLOCK',
//   variant: 'rectangle',
//   fill: BLOCK_COLORS.default.fill,
//   stroke: BLOCK_COLORS.default.stroke,
//   text: BLOCK_COLORS.default.text,
//   strokeWidth: 3,
//   fontSize: 16,
//   rotation: 0,
//   category: 'default', // Track block category
// };


// // Update grid config for full screen
// const GRID_CONFIG = {
//   ROWS: 12,
//   COLUMNS: 9,
//   SPACING_X: 100,
//   SPACING_Y: 60,
//   START_X: 20,
//   START_Y: 20
// };


// // Update default node dimensions
// const DEFAULT_NODE_DIMENSIONS = {
//   width: 120,
//   height: 50
// };


// const LOGIC_GROUPS = [
// {
//   id: 'logic',
//     title: 'Logic Blocks',
//       category: 'logic',
//         items: [
//           { type: 'logic', label: 'IF', variant: 'rectangle', category: 'logic' },
//           { type: 'logic', label: 'ELSE IF', variant: 'rectangle', category: 'logic' },
//           { type: 'logic', label: 'SWITCH', variant: 'rectangle', category: 'logic' },
//           { type: 'logic', label: 'CASE', variant: 'rectangle', category: 'logic' },
//           { type: 'logic', label: 'ELSE', variant: 'rectangle', category: 'logic' },
//           { type: 'logic', label: 'DEFAULT', variant: 'rectangle', category: 'logic' },
//         ],
//   },
// {
//   id: 'io',
//     title: 'Input / Output',
//       category: 'io',
//         items: [
//           { type: 'logic', label: 'READ INPUT', variant: 'rectangle', category: 'io' },
//           { type: 'logic', label: 'READ GPIO', variant: 'rectangle', category: 'io' },
//           { type: 'logic', label: 'READ SWITCH', variant: 'rectangle', category: 'io' },
//           { type: 'logic', label: 'LED ON', variant: 'rectangle', category: 'io' },
//           { type: 'logic', label: 'LED OFF', variant: 'rectangle', category: 'io' },
//         ],
//   },
// {
//   id: 'flow',
//     title: 'Flow Helpers',
//       category: 'flow',
//         items: [
//           { type: 'logic', label: 'START', variant: 'rectangle', category: 'flow' },
//           { type: 'logic', label: 'STOP', variant: 'rectangle', category: 'flow' },
//           { type: 'logic', label: 'LOOP', variant: 'rectangle', category: 'flow' },
//           { type: 'logic', label: 'BREAK', variant: 'rectangle', category: 'flow' },
//           { type: 'logic', label: 'CONTINUE', variant: 'rectangle', category: 'flow' },
//           { type: 'logic', label: 'DELAY', variant: 'rectangle', category: 'flow' },
//         ],
//   },
// ];


// let logicId = 1;
// const getId = () => `logic_${logicId++}`;
// const createBlockProgrammingState = () => ({ nodes: [], edges: [], viewport: null, idSeed: 1 });


// const handleStyle = {
//   width: 8,
//   height: 8,
//   background: '#0f172a',
//   borderRadius: '50%',
// };


// // Generate initial grid nodes
// const generateGridNodes = () => {
//   const nodes = [];
//   for (let row = 0; row < GRID_CONFIG.ROWS; row++) {
//     for (let col = 0; col < GRID_CONFIG.COLUMNS; col++) {
//       const id = `grid_${row}_${col}`;
//       nodes.push({
//         id,
//         type: 'logic',
//         position: {
//           x: GRID_CONFIG.START_X + (col * GRID_CONFIG.SPACING_X),
//           y: GRID_CONFIG.START_Y + (row * GRID_CONFIG.SPACING_Y)
//         },
//         data: {
//           ...DEFAULT_NODE_DATA,
//           label: `Block ${row}-${col}`,
//         },
//         style: { 
//           width: DEFAULT_NODE_DIMENSIONS.width, 
//           height: DEFAULT_NODE_DIMENSIONS.height 
//         }
//       });
//     }
//   }
//   return nodes;
// };


// function LogicBlockNode({ id, data, selected }) {
//   const rf = useReactFlow();
//   const {
//     label = 'BLOCK',
//     fill = '#ffffff',
//     stroke = '#111827',
//     text = '#111827',
//     strokeWidth = 3,
//     fontSize = 16,
//     rotation = 0,
//     category = 'default',
//   } = data || {};


//   const editLabel = useCallback(() => {
//     const next = window.prompt('Edit block label', label);
//     if (next != null) {
//       rf.setNodes((nodes) =>
//         nodes.map((node) =>
//           node.id === id ? { ...node, data: { ...node.data, label: next } } : node,
//         ),
//       );
//     }
//   }, [rf, id, label]);


//   // Rectangle handles on all sides
//   const handles = (
//     <>
//       <Handle id="top" type="target" position={Position.Top} style={handleStyle} />
//       <Handle id="right" type="source" position={Position.Right} style={handleStyle} />
//       <Handle id="bottom" type="source" position={Position.Bottom} style={handleStyle} />
//       <Handle id="left" type="target" position={Position.Left} style={handleStyle} />
//     </>
//   );


//   // Always render a rectangle SVG
//   return (
//     <div className="logic-node" onDoubleClick={editLabel}>
//       <NodeResizer isVisible={selected} minWidth={80} minHeight={40} color={stroke} />
//       <div className="logic-node__content" style={{ transform: `rotate(${rotation}deg)` }}>
//         <svg viewBox="0 0 120 50" width="100%" height="100%">
//           <rect
//             x="0"
//             y="0"
//             width="120"
//             height="50"
//             fill={fill}
//             stroke={stroke}
//             strokeWidth={strokeWidth}
//             rx="8"
//             ry="8"
//           />
//         </svg>
//         <div className="logic-node__label" style={{ 
//           color: text, 
//           fontSize: `${fontSize * 0.8}px`,
//           padding: '4px',
//           fontWeight: '600',
//         }}>
//           {label}
//         </div>
//       </div>
//       {handles}
//     </div>
//   );
// }



// const nodeTypes = { logic: LogicBlockNode };


// function BlockProgrammingCanvas() {
//   const reactFlowWrapper = useRef(null);
//   const [nodes, setNodes, onNodesChange] = useNodesState([]);
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
//   const [openGroups, setOpenGroups] = useState({ logic: true, io: true, flow: true });
//   const [paletteSearch, setPaletteSearch] = useState('');
//   const [selected, setSelected] = useState(null);
//   const [isExplorerVisible, setIsExplorerVisible] = useState('blocks');
//   const deletePressed = useKeyPress('Delete');
//   const backspacePressed = useKeyPress('Backspace');
//   const rf = useReactFlow();
//   const { activeTab, tabs, loading: tabsLoading, createTab, updateActiveTabState, activeTabId, selectTab } = useWorkspaceTabs();
//   const hydratingRef = useRef(false);
//   const navigate = useNavigate();
//   const { user, activeProjectId, activeProjectName, setActiveProjectId } = useProject?.() ?? {};
//   const userId = user?.userId || user?._id || user?.id;


//   // Canvas file integration for Block Programming
//   const canvasIntegration = useCanvasFileIntegration('Block Programming');

//   // Project management state
//   const [hasProjects, setHasProjects] = useState(false);


//   const nodesRef = useRef(nodes);
//   const edgesRef = useRef(edges);
//   const snapshotTimeoutRef = useRef(null);


//   useEffect(() => {
//     nodesRef.current = nodes;
//   }, [nodes]);


//   useEffect(() => {
//     edgesRef.current = edges;
//   }, [edges]);


//   const historyRef = useRef({ entries: [], index: -1 });


//   const pushSnapshot = useCallback(() => {
//     const snapshot = {
//       nodes: nodesRef.current,
//       edges: edgesRef.current,
//       viewport: rf.getViewport(),
//     };
//     const entries = historyRef.current.entries.slice(0, historyRef.current.index + 1);
//     entries.push(JSON.parse(JSON.stringify(snapshot)));
//     historyRef.current.entries = entries;
//     historyRef.current.index = entries.length - 1;
//   }, [rf]);


//   // Project management integration
//   useEffect(() => {
//     const checkProjects = async () => {
//       const allProjects = projectFileManager.getAllProjects() || {};
//       const projects = Object.values(allProjects);
//       setHasProjects(projects.length > 0);

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
//   }, [activeProjectId, setActiveProjectId, userId]);


//   const handleFileClick = useCallback(async (filePath, fileName, parsedContent, fileData) => {
//     try {
//       console.log('File clicked in Block Programming:', fileName, filePath);

//       const result = await canvasIntegration.loadFileToCanvas(filePath, fileName, parsedContent, fileData);

//       if (result.success) {
//         if (fileName.endsWith('.json') && parsedContent && typeof parsedContent === 'object') {
//           if (parsedContent.blocks && parsedContent.connections) {
//             const nodes = parsedContent.blocks || [];
//             const edges = parsedContent.connections || [];

//             setNodes(nodes);
//             setEdges(edges);

//             if (parsedContent.canvas?.position && parsedContent.canvas?.zoom && rf) {
//               setTimeout(() => {
//                 rf.setViewport({
//                   x: parsedContent.canvas.position.x || 0,
//                   y: parsedContent.canvas.position.y || 0,
//                   zoom: parsedContent.canvas.zoom || 1
//                 });
//               }, 100);
//             }
//           } else if (parsedContent.nodes && parsedContent.edges) {
//             setNodes(parsedContent.nodes || []);
//             setEdges(parsedContent.edges || []);

//             if (parsedContent.viewport && rf) {
//               setTimeout(() => {
//                 rf.setViewport(parsedContent.viewport);
//               }, 100);
//             }
//           }
//         }

//         console.log(`Loaded ${fileName} into Block Programming canvas`);
//       } else {
//         console.error('Failed to load file:', result.error);
//       }
//     } catch (error) {
//       console.error('Failed to handle file click:', error);
//     }
//   }, [canvasIntegration, setNodes, setEdges, rf]);


//   useEffect(() => {
//     const activeProject = projectFileManager.getActiveProject();
//     if (!activeProject) return;


//     const timer = setTimeout(() => {
//       const content = {
//         blocks: nodes,
//         connections: edges,
//         canvas: {
//           zoom: rf.getViewport().zoom,
//           position: {
//             x: rf.getViewport().x,
//             y: rf.getViewport().y
//           }
//         }
//       };
//       canvasIntegration.saveCanvasToFile(content, 'BlockProgramming/logic_blocks.json', activeProject.id);
//     }, 1000);


//     return () => clearTimeout(timer);
//   }, [nodes, edges, rf, canvasIntegration]);


//   useEffect(() => {
//     pushSnapshot();
//   }, [pushSnapshot]);


//   useEffect(() => {
//     if (!tabsLoading && tabs.length === 0) {
//       createTab();
//     }
//   }, [tabsLoading, tabs, createTab]);


//   useEffect(() => {
//     if (!activeTab) return;
//     hydratingRef.current = true;
//     const state = activeTab.state || createBlockProgrammingState();
//     logicId = state.idSeed || 1;
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
//           idSeed: logicId,
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
//     updateActiveTabState((prev = createBlockProgrammingState()) => ({
//       ...prev,
//       nodes: nodesRef.current,
//       edges: edgesRef.current,
//       viewport: rf.getViewport(),
//       idSeed: logicId,
//     }));
//   }, [rf, updateActiveTabState]);


//   useEffect(() => () => {
//     if (snapshotTimeoutRef.current) {
//       clearTimeout(snapshotTimeoutRef.current);
//     }
//   }, []);


//   const scheduleSnapshot = useCallback(() => {
//     if (snapshotTimeoutRef.current) {
//       clearTimeout(snapshotTimeoutRef.current);
//     }
//     snapshotTimeoutRef.current = setTimeout(() => {
//       pushSnapshot();
//       persistCurrentState();
//       snapshotTimeoutRef.current = null;
//     }, 300);
//   }, [persistCurrentState, pushSnapshot]);


//   const undo = useCallback(() => {
//     const { entries, index } = historyRef.current;
//     if (index > 0) {
//       const snapshot = entries[index - 1];
//       historyRef.current.index = index - 1;
//       setNodes(snapshot.nodes || []);
//       setEdges(snapshot.edges || []);
//       if (snapshot.viewport) rf.setViewport(snapshot.viewport);
//     }
//   }, [rf, setEdges, setNodes]);


//   const redo = useCallback(() => {
//     const { entries, index } = historyRef.current;
//     if (index < entries.length - 1) {
//       const snapshot = entries[index + 1];
//       historyRef.current.index = index + 1;
//       setNodes(snapshot.nodes || []);
//       setEdges(snapshot.edges || []);
//       if (snapshot.viewport) rf.setViewport(snapshot.viewport);
//     }
//   }, [rf, setEdges, setNodes]);


//   const onConnect = useCallback(
//     (params) => {
//       setEdges((eds) =>
//         addEdge(
//           {
//             ...params,
//             type: 'step',
//             markerEnd: { type: MarkerType.ArrowClosed },
//             style: { stroke: '#111827', strokeWidth: 2 },
//             labelBgPadding: [6, 4],
//           },
//           eds,
//         ),
//       );
//       scheduleSnapshot();
//     },
//     [scheduleSnapshot, setEdges],
//   );


//   const onDrop = useCallback(
//     (event) => {
//       event.preventDefault();
//       const payload = event.dataTransfer.getData('application/reactflow');
//       if (!payload) return;


//       let item;
//       try {
//         item = JSON.parse(payload);
//       } catch (err) {
//         item = null;
//       }


//       if (!item) return;


//       const position = rf.screenToFlowPosition({ x: event.clientX, y: event.clientY });
//       const id = getId();
//       logicId += 1;


//       // Get colors based on block category
//       const category = item.category || 'default';
//       const colors = BLOCK_COLORS[category] || BLOCK_COLORS.default;


//       setNodes((nds) =>
//         nds.concat({
//           id,
//           type: 'logic',
//           position,
//           data: {
//             ...DEFAULT_NODE_DATA,
//             label: item.label,
//             variant: item.variant,
//             category: category,
//             fill: colors.fill,
//             stroke: colors.stroke,
//             text: colors.text,
//           },
//           style: { 
//             width: DEFAULT_NODE_DIMENSIONS.width, 
//             height: DEFAULT_NODE_DIMENSIONS.height 
//           },
//         }),
//       );
//       setSelected({ kind: 'node', id });
//       scheduleSnapshot();
//     },
//     [rf, scheduleSnapshot, setNodes],
//   );


//   const onDragStart = (event, entry) => {
//     event.dataTransfer.setData('application/reactflow', JSON.stringify(entry));
//     event.dataTransfer.effectAllowed = 'move';
//   };


//   const onDragOver = useCallback((event) => {
//     event.preventDefault();
//     event.dataTransfer.dropEffect = 'move';
//   }, []);


//   const handleNodesChange = useCallback(
//     (changes) => {
//       onNodesChange(changes);
//       scheduleSnapshot();
//     },
//     [onNodesChange, scheduleSnapshot],
//   );


//   const handleEdgesChange = useCallback(
//     (changes) => {
//       onEdgesChange(changes);
//       scheduleSnapshot();
//     },
//     [onEdgesChange, scheduleSnapshot],
//   );


//   const onSelectionChange = useCallback(({ nodes: selectedNodes, edges: selectedEdges }) => {
//     if (selectedNodes?.length) {
//       setSelected({ kind: 'node', id: selectedNodes[0].id, data: selectedNodes[0].data });
//     } else if (selectedEdges?.length) {
//       setSelected({ kind: 'edge', id: selectedEdges[0].id });
//     } else {
//       setSelected(null);
//     }
//   }, []);


//   const selectedEntity = useMemo(() => {
//     if (!selected || selected.kind !== 'node') return null;
//     return nodes.find((node) => node.id === selected.id) || null;
//   }, [nodes, selected]);


//   const isNodeSelected = selected?.kind === 'node' && Boolean(selectedEntity);


//   const updateSelectedNode = useCallback(
//     (mapper) => {
//       if (!isNodeSelected) return;
//       setNodes((nds) => nds.map((node) => (node.id === selected.id ? mapper(node) : node)));
//       scheduleSnapshot();
//     },
//     [isNodeSelected, scheduleSnapshot, selected, setNodes],
//   );


//   const handleEditText = useCallback(() => {
//     if (!isNodeSelected || !selectedEntity) return;
//     const current = selectedEntity.data?.label ?? '';
//     const next = window.prompt('Block label', current);
//     if (next != null) {
//       updateSelectedNode((node) => ({ ...node, data: { ...node.data, label: next } }));
//     }
//   }, [isNodeSelected, selectedEntity, updateSelectedNode]);


//   const filteredGroups = useMemo(() => {
//     const query = paletteSearch.trim().toLowerCase();
//     if (!query) return LOGIC_GROUPS;
//     return LOGIC_GROUPS.map((group) => ({
//       ...group,
//       items: group.items.filter((item) => item.label.toLowerCase().includes(query)),
//     })).filter((group) => group.items.length > 0);
//   }, [paletteSearch]);


//   const hasSearch = paletteSearch.trim().length > 0;


//   const handleTabChange = useCallback(
//     (tab) => {
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
//     },
//     [navigate],
//   );


//   const saveDiagram = useCallback(() => {
//     const snapshot = {
//       nodes: nodesRef.current,
//       edges: edgesRef.current,
//       viewport: rf.getViewport(),
//     };
//     const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = 'block-programming.json';
//     link.click();
//     URL.revokeObjectURL(url);
//   }, [rf]);


//   const loadDiagram = useCallback(() => {
//     const input = document.createElement('input');
//     input.type = 'file';
//     input.accept = '.json,application/json';
//     input.onchange = (event) => {
//       const file = event.target.files?.[0];
//       if (!file) return;
//       const reader = new FileReader();
//       reader.onload = () => {
//         try {
//           const parsed = JSON.parse(reader.result);
//           setNodes(parsed.nodes || []);
//           setEdges(parsed.edges || []);
//           if (parsed.viewport) {
//             rf.setViewport(parsed.viewport);
//           }
//           scheduleSnapshot();
//         } catch (error) {
//           console.error('Invalid block programming JSON', error);
//         }
//       };
//       reader.readAsText(file);
//     };
//     input.click();
//   }, [rf, scheduleSnapshot, setEdges, setNodes]);


//   const showExportPreview = useCallback((dataUrl, fileName) => {
//     const host = reactFlowWrapper.current;
//     if (!host) return;
//     if (getComputedStyle(host).position === 'static') {
//       host.style.position = 'relative';
//     }


//     const existing = host.querySelector('.diagram-export-preview');
//     if (existing) {
//       existing.remove();
//     }


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
//     openBtn.textContent = 'Open';
//     Object.assign(openBtn.style, {
//       padding: '6px 10px',
//       borderRadius: '6px',
//       border: '1px solid rgba(59,130,246,0.4)',
//       background: '#1d4ed8',
//       color: '#f8fafc',
//       fontSize: '12px',
//       cursor: 'pointer',
//     });
//     openBtn.onclick = () => window.open(dataUrl, '_blank', 'noopener');


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
//       watermark.appendChild(img);
//       const span = document.createElement('span');
//       span.textContent = 'made with innotrat labs';
//       watermark.appendChild(span);
//       container.appendChild(watermark);


//       const dataUrl = await toPng(container, {
//         cacheBust: true,
//         backgroundColor: '#ffffff',
//         pixelRatio: 2,
//         filter: (node) => {
//           if (!(node instanceof Element)) return true;
//           const classes = node.classList;
//           if (!classes) return true;
//           if (
//             classes.contains('export-ignore') ||
//             classes.contains('react-flow__background') ||
//             classes.contains('react-flow__attribution')
//           ) {
//             return false;
//           }
//           return true;
//         },
//       });


//       const activeProject = projectFileManager.getActiveProject();
//       const projectSegment = sanitizeSegment(activeProject?.name || activeProjectName || 'project');
//       const timeSegment = sanitizeSegment(new Date().toISOString());
//       const fileName = `${projectSegment}_blockprogramming_${timeSegment}.png`;


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


//       const link = document.createElement('a');
//       link.href = dataUrl;
//       link.download = fileName;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);


//       window.dispatchEvent(
//         new CustomEvent('diagram:export-preview', {
//           detail: {
//             kind: 'BlockProgramming',
//             fileName,
//             dataUrl,
//             timestamp: Date.now(),
//           },
//         })
//       );


//       showExportPreview(dataUrl, fileName);
//     } catch (error) {
//       console.error('Failed to export block programming PNG', error);
//     } finally {
//       if (watermark && watermark.parentNode) {
//         watermark.parentNode.removeChild(watermark);
//       }
//     }
//   }, [canvasIntegration, activeProjectName, reactFlowWrapper, showExportPreview]);


//   useEffect(() => {
//     if ((deletePressed || backspacePressed) && selected) {
//       if (selected.kind === 'node') {
//         setNodes(nodes => nodes.filter(n => n.id !== selected.id));
//       } else if (selected.kind === 'edge') {
//         setEdges(edges => edges.filter(e => e.id !== selected.id));
//       }
//       setSelected(null);
//     }
//   }, [deletePressed, backspacePressed, selected, setNodes, setEdges]);


//   return (
//     <div className="diagram-builder">
//       <EditorNavbar
//         activeTab="Block Programming"
//         onTabChange={handleTabChange}
//         onSaveJSON={saveDiagram}
//         onLoadJSON={loadDiagram}
//         onExportPNG={handleExportPNG}
//         onUndo={undo}
//         onRedo={redo}
//       />
//       <div className="content">
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
//               className={`sidebar-tab ${isExplorerVisible === 'blocks' ? 'active' : ''}`}
//               onClick={() => setIsExplorerVisible('blocks')}
//             >
//               Blocks
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
//                   <div className="palette-title">Logic Blocks</div>
//                 </div>
//                 <div className="palette-search">
//                   <input
//                     type="text"
//                     placeholder="Search blocks..."
//                     value={paletteSearch}
//                     onChange={(e) => setPaletteSearch(e.target.value)}
//                   />
//                 </div>
//                 <div className="palette-wrapper">
//                   {filteredGroups.length ? (
//                     filteredGroups.map((group) => {
//                       const isExpanded = hasSearch ? true : openGroups[group.id] ?? true;
//                       const toggleGroup = () => {
//                         if (hasSearch) return;
//                         setOpenGroups((prev) => ({
//                           ...prev,
//                           [group.id]: !(prev[group.id] ?? true),
//                         }));
//                       };
//                       const colors = BLOCK_COLORS[group.category] || BLOCK_COLORS.default;

//                       return (
//                         <div className="palette-group" key={group.id}>
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
//                             <div className="palette-title">{group.title}</div>
//                             <span className="palette-chevron">{isExpanded ? '▾' : '▸'}</span>
//                           </div>
//                           {isExpanded && (
//                             <div className="palette-grid">
//                               {group.items.map((item) => {
//                                 const [primary, ...rest] = item.label.split(' ');
//                                 const secondary = rest.join(' ');
//                                 const itemColors = BLOCK_COLORS[item.category] || BLOCK_COLORS.default;

//                                 return (
//                                   <div
//                                     key={`${group.id}-${item.label}`}
//                                     className="shape-card"
//                                     draggable
//                                     onDragStart={(e) => onDragStart(e, item)}
//                                     style={{
//                                       background: itemColors.fill,
//                                       border: `2px solid ${itemColors.stroke}`,
//                                       borderRadius: '8px',
//                                       padding: '12px 8px',
//                                       cursor: 'grab',
//                                       transition: 'all 0.2s',
//                                     }}
//                                   >
//                                     <div className="shape-svg logic-shape-preview" style={{
//                                       color: itemColors.text,
//                                       fontWeight: '600',
//                                       textAlign: 'center',
//                                     }}>
//                                       <span className="logic-shape-preview__primary">{primary}</span>
//                                       {secondary ? (
//                                         <span className="logic-shape-preview__secondary" style={{
//                                           display: 'block',
//                                           fontSize: '0.85em',
//                                           marginTop: '2px',
//                                         }}>{secondary}</span>
//                                       ) : null}
//                                     </div>
//                                     <div className="shape-label" style={{
//                                       fontSize: '10px',
//                                       marginTop: '6px',
//                                       color: itemColors.text,
//                                       opacity: 0.8,
//                                     }}>{item.label}</div>
//                                   </div>
//                                 );
//                               })}
//                             </div>
//                           )}
//                         </div>
//                       );
//                     })
//                   ) : (
//                     <div className="palette-empty">No blocks found.</div>
//                   )}
//                 </div>
//                 <div className="palette-hint">Drag blocks into the workspace and connect them.</div>
//               </div>
//             )}
//           </div>
//         </div>


//         <div className="diagram-container">
//           <div style={{ padding: '8px 12px', background: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
//             <DiagramTabs title="Block Programming Workspace" />
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
//                 onSelectionChange={onSelectionChange}
//                 nodeTypes={nodeTypes}
//                 fitView
//                 connectionLineType={ConnectionLineType.Step}
//                 connectionMode={ConnectionMode.Strict}
//                 snapToGrid
//                 snapGrid={[16, 16]}
//               >
//                 <MiniMap className="export-ignore" />
//                 <Controls className="export-ignore">
//                   <ControlButton onClick={undo} title="Undo">
//                     <RotateCcw size={20} />
//                   </ControlButton>
//                   <ControlButton onClick={redo} title="Redo">
//                     <RotateCw size={20} />
//                   </ControlButton>
//                 </Controls>
//                 <Background className="export-ignore" gap={16} size={1} />
//               </ReactFlow>
//             </div>
//           </div>
//         </div>


//         <div className="properties-panel">
//           <h3>Properties</h3>
//           <div style={{ fontSize: 12, marginBottom: 8 }}>
//             Selected: {isNodeSelected ? 'Block' : 'None'}
//           </div>


//           <div className="prop-row">
//             <label>Fill</label>
//             <input
//               type="color"
//               disabled={!isNodeSelected}
//               value={selectedEntity?.data?.fill ?? '#ffffff'}
//               onChange={(event) => {
//                 const value = event.target.value;
//                 updateSelectedNode((node) => ({ ...node, data: { ...node.data, fill: value } }));
//               }}
//             />
//           </div>


//           <div className="prop-row">
//             <label>Border</label>
//             <input
//               type="color"
//               disabled={!isNodeSelected}
//               value={selectedEntity?.data?.stroke ?? '#111827'}
//               onChange={(event) => {
//                 const value = event.target.value;
//                 updateSelectedNode((node) => ({ ...node, data: { ...node.data, stroke: value } }));
//               }}
//             />
//           </div>


//           <div className="prop-row">
//             <label>Text</label>
//             <input
//               type="color"
//               disabled={!isNodeSelected}
//               value={selectedEntity?.data?.text ?? '#111827'}
//               onChange={(event) => {
//                 const value = event.target.value;
//                 updateSelectedNode((node) => ({ ...node, data: { ...node.data, text: value } }));
//               }}
//             />
//           </div>


//           <div className="prop-row">
//             <label>Border W</label>
//             <input
//               type="range"
//               min={1}
//               max={12}
//               step={1}
//               disabled={!isNodeSelected}
//               value={Number(selectedEntity?.data?.strokeWidth ?? 3)}
//               onChange={(event) => {
//                 const value = Number(event.target.value);
//                 updateSelectedNode((node) => ({ ...node, data: { ...node.data, strokeWidth: value } }));
//               }}
//             />
//           </div>


//           <div className="prop-row">
//             <label>Text Size</label>
//             <input
//               type="range"
//               min={10}
//               max={48}
//               step={1}
//               disabled={!isNodeSelected}
//               value={Number(selectedEntity?.data?.fontSize ?? 16)}
//               onChange={(event) => {
//                 const value = Number(event.target.value);
//                 updateSelectedNode((node) => ({ ...node, data: { ...node.data, fontSize: value } }));
//               }}
//             />
//           </div>


//           <div className="prop-row">
//             <label>Rotate</label>
//             <input
//               type="range"
//               min={0}
//               max={359}
//               step={1}
//               disabled={!isNodeSelected}
//               value={Number(selectedEntity?.data?.rotation ?? 0)}
//               onChange={(event) => {
//                 const value = Number(event.target.value);
//                 updateSelectedNode((node) => ({ ...node, data: { ...node.data, rotation: value } }));
//               }}
//             />
//           </div>


//           <button className="edit-text-btn" disabled={!isNodeSelected} onClick={handleEditText}>
//             Edit Text
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


// function BlockProgrammingWorkspace() {
//   return (
//     <WorkspaceTabsProvider kind="blockprogramming" createInitialState={createBlockProgrammingState}>
//       <BlockProgrammingCanvas />
//     </WorkspaceTabsProvider>
//   );
// }


// const BlockProgramming = () => (
//   <ReactFlowProvider>
//     <BlockProgrammingWorkspace />
//   </ReactFlowProvider>
// );


// export default BlockProgramming;
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  ControlButton,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
  ConnectionMode,
  ConnectionLineType,
  Panel,
  useKeyPress,
} from 'reactflow';
import { useDispatch, useSelector } from 'react-redux';
import {
  setTabs,
  setActiveTab,
  addTab,
  closeTab,
  updateTabState,
  markTabClean,
} from '../store/slices/blockProgrammingSlice';
import { NodeResizer } from '@reactflow/node-resizer';
import 'reactflow/dist/style.css';
import '@reactflow/node-resizer/dist/style.css';
import { RotateCcw, RotateCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toPng } from 'html-to-image';
import EditorNavbar from './EditorNavbar';
import FileExplorer from './FileExplorer';
import './FileExplorer.css';
import './BlockProgramming.css';
import hexBg from '../assets/hex_bg.png';
import { saveProjectFile, sanitizeSegment, ensureProjectFolder } from '../utils/workspaceStorage';
import { saveAssetToScreenFolder } from '../utils/screenFileManager';
import { useProject } from '../ProjectContext';
import DiagramTabs from './DiagramTabs';
import projectFileManager from '../utils/projectFileManager';
import { useCanvasFileIntegration } from '../hooks/useCanvasFileIntegration';
import ProjectFileExplorer from './ProjectFileExplorer';
import { useResizableSidebar } from '../hooks/useResizableSidebar';

// Sound effect paths (Blockly inspired)
const SOUND_PATHS = {
  CLICK: 'https://github.com/google/blockly/raw/master/media/click.mp3',
  DELETE: 'https://github.com/google/blockly/raw/master/media/delete.mp3',
  DISCONNECT: 'https://github.com/google/blockly/raw/master/media/disconnect.mp3',
};

const playSound = (path) => {
  const audio = new Audio(path);
  audio.volume = 0.5;
  audio.play().catch(e => console.warn('Sound play failed:', e));
};

// Block color scheme - each block type has unique colors
const BLOCK_COLORS = {
  "IF": { fill: "#DBEAFE", stroke: "#1E40AF", text: "#1E3A8A" },
  "ELSE IF": { fill: "#FED7AA", stroke: "#C2410C", text: "#7C2D12" },
  "SWITCH": { fill: "#E9D5FF", stroke: "#6B21A8", text: "#581C87" },
  "CASE": { fill: "#FECACA", stroke: "#B91C1C", text: "#7F1D1D" },
  "ELSE": { fill: "#BBF7D0", stroke: "#15803D", text: "#14532D" },
  "DEFAULT": { fill: "#FEE2E2", stroke: "#991B1B", text: "#7F1D1D" },
  "READ INPUT": { fill: "#BFDBFE", stroke: "#1D4ED8", text: "#1E3A8A" },
  "READ GPIO": { fill: "#93C5FD", stroke: "#2563EB", text: "#1E40AF" },
  "READ SWITCH": { fill: "#60A5FA", stroke: "#3B82F6", text: "#1E40AF" },
  "LED ON": { fill: "#FDE047", stroke: "#CA8A04", text: "#713F12" },
  "LED OFF": { fill: "#FEF08A", stroke: "#EAB308", text: "#854D0E" },
  "START": { fill: "#D1FAE5", stroke: "#059669", text: "#064E3B" },
  "STOP": { fill: "#FECDD3", stroke: "#DC2626", text: "#7F1D1D" },
  "LOOP": { fill: "#C7D2FE", stroke: "#4F46E5", text: "#312E81" },
  "BREAK": { fill: "#F1F5F9", stroke: "#475569", text: "#1E293B" },
  "CONTINUE": { fill: "#F1F5F9", stroke: "#475569", text: "#1E293B" },
  "DELAY": { fill: "#E0F2FE", stroke: "#0369A1", text: "#0C4A6E" },
};

const DEFAULT_NODE_DATA = {
  label: 'BLOCK',
  variant: 'rectangle',
  fill: '#ffffff',
  stroke: '#111827',
  text: '#111827',
  strokeWidth: 3,
  fontSize: 16,
  rotation: 0,
};

// Grid config for canvas
const GRID_CONFIG = {
  ROWS: 12,
  COLUMNS: 9,
  SPACING_X: 100,
  SPACING_Y: 60,
  START_X: 20,
  START_Y: 20
};

// Default node dimensions
const DEFAULT_NODE_DIMENSIONS = {
  width: 120,
  height: 50
};

const LOGIC_GROUPS = [
  {
    id: 'logic',
    title: 'Logic Blocks',
    items: [
      { type: 'logic', label: 'IF', variant: 'rectangle' },
      { type: 'logic', label: 'ELSE IF', variant: 'rectangle' },
      { type: 'logic', label: 'SWITCH', variant: 'rectangle' },
      { type: 'logic', label: 'CASE', variant: 'rectangle' },
      { type: 'logic', label: 'ELSE', variant: 'rectangle' },
      { type: 'logic', label: 'DEFAULT', variant: 'rectangle' },
    ],
  },
  {
    id: 'io',
    title: 'Input / Output',
    items: [
      { type: 'logic', label: 'READ INPUT', variant: 'rectangle' },
      { type: 'logic', label: 'READ GPIO', variant: 'rectangle' },
      { type: 'logic', label: 'READ SWITCH', variant: 'rectangle' },
      { type: 'logic', label: 'LED ON', variant: 'rectangle' },
      { type: 'logic', label: 'LED OFF', variant: 'rectangle' },
    ],
  },
  {
    id: 'flow',
    title: 'Flow Helpers',
    items: [
      { type: 'logic', label: 'START', variant: 'rectangle' },
      { type: 'logic', label: 'STOP', variant: 'rectangle' },
      { type: 'logic', label: 'LOOP', variant: 'rectangle' },
      { type: 'logic', label: 'BREAK', variant: 'rectangle' },
      { type: 'logic', label: 'CONTINUE', variant: 'rectangle' },
      { type: 'logic', label: 'DELAY', variant: 'rectangle' },
    ],
  },
];

let logicId = 1;
const getId = () => `logic_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
const createBlockProgrammingState = () => ({ nodes: [], edges: [], viewport: null, idSeed: 1 });

const handleStyle = {
  width: 8,
  height: 8,
  background: '#0f172a',
  borderRadius: '50%',
};

// LogicBlockNode component with color support
function LogicBlockNode({ id, data, selected }) {
  const rf = useReactFlow();
  const {
    label = 'BLOCK',
    fill = '#ffffff',
    stroke = '#111827',
    text = '#111827',
    strokeWidth = 3,
    fontSize = 16,
    rotation = 0,
    isActive = false, // Added isActive property
  } = data || {};

  const editLabel = useCallback(() => {
    const next = window.prompt('Edit block label', label);
    if (next != null) {
      rf.setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id ? { ...node, data: { ...node.data, label: next } } : node,
        ),
      );
    }
  }, [rf, id, label]);

  // Rectangle handles on all sides
  const handles = (
    <>
      <Handle id="top" type="target" position={Position.Top} style={handleStyle} />
      <Handle id="right" type="source" position={Position.Right} style={handleStyle} />
      <Handle id="bottom" type="source" position={Position.Bottom} style={handleStyle} />
      <Handle id="left" type="target" position={Position.Left} style={handleStyle} />
    </>
  );

  return (
    <div className={`logic-node ${isActive ? 'active-executing' : ''}`} onDoubleClick={editLabel}>
      <NodeResizer isVisible={selected} minWidth={80} minHeight={40} color={stroke} />
      <div className="logic-node__content" style={{
        transform: `rotate(${rotation}deg)`,
        boxShadow: isActive ? `0 0 15px ${stroke}` : 'none',
        border: isActive ? `4px solid ${stroke}` : 'none',
        borderRadius: '8px'
      }}>
        <svg viewBox="0 0 120 50" width="100%" height="100%">
          <rect
            x="0"
            y="0"
            width="120"
            height="50"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            rx="8"
            ry="8"
          />
        </svg>
        <div className="logic-node__label" style={{
          color: text,
          fontSize: `${fontSize * 0.8}px`,
          padding: '4px',
          fontWeight: isActive ? 'bold' : 'normal'
        }}>
          {label}
        </div>
      </div>
      {handles}
    </div>
  );
}

const nodeTypes = { logic: LogicBlockNode };

function BlockProgrammingCanvas() {
  const { isOpen: isSidebarOpen, onToggle: onToggleSidebar, onClose: onCloseSidebar } = useDisclosure({ defaultIsOpen: true });
  const { sidebarWidth, startResizing } = useResizableSidebar(240, 160, 480);

  const dispatch = useDispatch();
  const { tabs, activeTabId } = useSelector((state) => state.blockProgramming);
  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeTabId),
    [tabs, activeTabId],
  );

  const reactFlowWrapper = useRef(null);

  // Derive nodes and edges from active tab
  const nodes = activeTab?.state?.nodes || [];
  const edges = activeTab?.state?.edges || [];

  const [openGroups, setOpenGroups] = useState({ logic: true, io: true, flow: true });
  const [paletteSearch, setPaletteSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [isExplorerVisible, setIsExplorerVisible] = useState('blocks');

  // Execution state
  const [showExecutionControl, setShowExecutionControl] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [executionLogs, setExecutionLogs] = useState([]);
  const [ledState, setLedState] = useState(false);
  const [switchState, setSwitchState] = useState(false); // Added switchState for logic verification

  // Refs for logic execution to avoid closure issues
  const ledStateRef = useRef(ledState);
  const switchStateRef = useRef(switchState);
  const logContainerRef = useRef(null);

  useEffect(() => { ledStateRef.current = ledState; }, [ledState]);
  useEffect(() => { switchStateRef.current = switchState; }, [switchState]);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [executionLogs]);

  const deletePressed = useKeyPress('Delete');
  const backspacePressed = useKeyPress('Backspace');
  const rf = useReactFlow();
  const hydratingRef = useRef(false);
  const navigate = useNavigate();
  const { user, activeProjectId, activeProjectName, setActiveProjectId } = useProject?.() ?? {};
  const userId = user?.userId || user?._id || user?.id;

  // Refs for stable state tracking
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const snapshotTimeoutRef = useRef(null);
  const isRunningRef = useRef(false);
  const activeTabRef = useRef(activeTab);
  const activeTabIdRef = useRef(activeTabId);
  const historyRef = useRef({ entries: [], index: -1 });

  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { edgesRef.current = edges; }, [edges]);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => { activeTabIdRef.current = activeTabId; }, [activeTabId]);

  // Default tab fallback
  useEffect(() => {
    if (tabs.length === 0) {
      console.log("[BlockProgramming] No tabs found, creating default");
      const defaultTab = {
        id: `tab-${Date.now()}`,
        name: "Main Logic",
        state: createBlockProgrammingState(),
        dirty: true,
      };
      dispatch(addTab(defaultTab));
      dispatch(setActiveTab(defaultTab.id));
    }
  }, [tabs.length, dispatch]);

  // Base snapshot utility
  const pushSnapshot = useCallback(() => {
    const snapshot = {
      nodes: nodesRef.current,
      edges: edgesRef.current,
      viewport: rf.getViewport(),
    };
    const entries = historyRef.current.entries.slice(0, historyRef.current.index + 1);
    entries.push(JSON.parse(JSON.stringify(snapshot)));
    historyRef.current.entries = entries;
    historyRef.current.index = entries.length - 1;
  }, [rf]);

  // Dispatch utilities
  const updateActiveTabState = useCallback(
    (updater) => {
      const tabId = activeTabIdRef.current;
      const tab = activeTabRef.current;
      if (!tabId || !tab) return;
      const nextState =
        typeof updater === "function" ? updater(tab.state) : updater;
      dispatch(updateTabState({ tabId, ...nextState }));
    },
    [dispatch],
  );

  const persistCurrentState = useCallback(() => {
    if (hydratingRef.current) return;
    updateActiveTabState((prev = createBlockProgrammingState()) => ({
      ...prev,
      nodes: nodesRef.current,
      edges: edgesRef.current,
      viewport: rf.getViewport(),
      idSeed: logicId,
    }));
  }, [rf, updateActiveTabState]);

  const scheduleSnapshot = useCallback(() => {
    if (snapshotTimeoutRef.current) {
      clearTimeout(snapshotTimeoutRef.current);
    }
    snapshotTimeoutRef.current = setTimeout(() => {
      pushSnapshot();
      persistCurrentState();
      snapshotTimeoutRef.current = null;
    }, 300);
  }, [persistCurrentState, pushSnapshot]);

  // Canvas setters
  const setNodes = useCallback(
    (nds) => {
      const currentNodes = nodesRef.current;
      const nextNodes = typeof nds === "function" ? nds(currentNodes) : nds;
      dispatch(updateTabState({ tabId: activeTabIdRef.current, nodes: nextNodes }));
    },
    [dispatch],
  );

  const setEdges = useCallback(
    (eds) => {
      const currentEdges = edgesRef.current;
      const nextEdges = typeof eds === "function" ? eds(currentEdges) : eds;
      dispatch(updateTabState({ tabId: activeTabIdRef.current, edges: nextEdges }));
    },
    [dispatch],
  );

  const undo = useCallback(() => {
    if (historyRef.current.index > 0) {
      const nextIndex = historyRef.current.index - 1;
      const snapshot = historyRef.current.entries[nextIndex];
      historyRef.current.index = nextIndex;
      setNodes(snapshot.nodes);
      setEdges(snapshot.edges);
      if (snapshot.viewport) rf.setViewport(snapshot.viewport);
    }
  }, [rf, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (historyRef.current.index < historyRef.current.entries.length - 1) {
      const nextIndex = historyRef.current.index + 1;
      const snapshot = historyRef.current.entries[nextIndex];
      historyRef.current.index = nextIndex;
      setNodes(snapshot.nodes);
      setEdges(snapshot.edges);
      if (snapshot.viewport) rf.setViewport(snapshot.viewport);
    }
  }, [rf, setNodes, setEdges]);

  const handleNodesChange = useCallback(
    (changes) => {
      const nextNodes = applyNodeChanges(changes, nodesRef.current);
      dispatch(updateTabState({ tabId: activeTabIdRef.current, nodes: nextNodes }));

      const shouldSnapshot = changes.some(c =>
        c.type === 'remove' || c.type === 'position' || c.type === 'dimensions' || c.type === 'select'
      );
      if (shouldSnapshot) {
        scheduleSnapshot();
      }
    },
    [dispatch, scheduleSnapshot],
  );

  const handleEdgesChange = useCallback(
    (changes) => {
      const nextEdges = applyEdgeChanges(changes, edgesRef.current);
      dispatch(updateTabState({ tabId: activeTabIdRef.current, edges: nextEdges }));
      scheduleSnapshot();
    },
    [dispatch, scheduleSnapshot],
  );

  // Canvas file integration for Block Programming
  const canvasIntegration = useCanvasFileIntegration('Block Programming');
  const [hasProjects, setHasProjects] = useState(false);


  // Project management integration
  useEffect(() => {
    const checkProjects = async () => {
      const allProjects = projectFileManager.getAllProjects() || {};
      const projects = Object.values(allProjects);
      setHasProjects(projects.length > 0);

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
  }, [activeProjectId, setActiveProjectId, userId]);

  // Execution utilities
  const logMessage = useCallback((msg) => {
    setExecutionLogs(prev => [...prev.slice(-9), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Run Program logic
  const runProgram = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setExecutionLogs([]);
    logMessage("🚀 Program started...");

    const startNode = nodes.find(n => n.data.label === 'START');
    if (!startNode) {
      logMessage("❌ Error: No START block found!");
      setIsRunning(false);
      return;
    }

    let currentNode = startNode;
    const visited = new Set();

    try {
      while (currentNode && isRunning === false) { // This is tricky due to closure, let's use a ref or just follow the flow
        // Actually since this is an async function in a component, 
        // we should check a ref for 'isRunning' if we want to stop it mid-execution.
      }
      // Re-implementing with isRunningRef
    } catch (err) {
      logMessage(`💥 Error: ${err.message}`);
    }

    // For now, let's keep it simple and just do a base implementation first
  };

  // Improved runProgram

  const handleRun = async () => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    setIsRunning(true);
    setExecutionLogs([]);
    logMessage("🚀 Program started...");

    const startNode = nodes.find(n => n.data.label === 'START');
    if (!startNode) {
      logMessage("❌ Error: No START block found!");
      isRunningRef.current = false;
      setIsRunning(false);
      return;
    }

    let currentNode = startNode;
    let iterationCount = 0;
    const MAX_ITERATIONS = 50;

    while (currentNode && isRunningRef.current) {
      const nodeId = currentNode.id;
      iterationCount++;

      if (iterationCount > MAX_ITERATIONS) {
        logMessage("⚠️ Loop limit reached (50). Stopping.");
        break;
      }

      // Highlight current block
      setNodes(nds => nds.map(n => ({
        ...n,
        data: { ...n.data, isActive: n.id === nodeId }
      })));

      const label = currentNode.data.label;
      const upperLabel = label.toUpperCase();

      logMessage(`⚡ Executing: ${label}`);

      // --- Part 1: Action Processing (Non-exclusive) ---

      // LED Controls
      if (upperLabel.includes('LED ON')) {
        setLedState(true);
        ledStateRef.current = true;
        playSound(SOUND_PATHS.CLICK);
      }
      if (upperLabel.includes('LED OFF')) {
        setLedState(false);
        ledStateRef.current = false;
        playSound(SOUND_PATHS.CLICK);
      }

      // Read Controls
      if (upperLabel.includes('READ SWITCH') || upperLabel.includes('READ INPUT')) {
        const newState = Math.random() > 0.5;
        setSwitchState(newState);
        switchStateRef.current = newState;
        logMessage(`🔌 Read Input: ${newState ? 'HIGH' : 'LOW'}`);
      }

      // Delay
      if (upperLabel.includes('DELAY')) {
        await sleep(1000);
      }

      // --- Part 2: Flow Control & Branching ---

      let nextEdge = null;

      if (upperLabel.includes('STOP')) {
        break;
      }

      // Logic Branching (IF, ELSE IF, CASE) with Semantic Label Matching
      if (upperLabel.includes('IF') || upperLabel.includes('CASE')) {
        // Detect polarity: if user wrote "LOW" or "OFF", invert the logic
        const isInverted = upperLabel.includes('LOW') || upperLabel.includes('OFF');
        const rawCondition = switchStateRef.current;
        const result = isInverted ? !rawCondition : rawCondition;

        logMessage(`❔ ${label}: Result is ${result ? 'YES' : 'NO'}`);

        // Get all outgoing edges from this node
        const outgoingEdges = edgesRef.current.filter(e => e.source === nodeId);

        // Semantic matching: find edges based on target node labels
        const yesKeywords = ['YES', 'TRUE', 'HIGH', '(IF)'];
        const noKeywords = ['NO', 'FALSE', 'LOW', 'ELSE', 'OFF'];

        let yesEdge = null;
        let noEdge = null;

        for (const edge of outgoingEdges) {
          const targetNode = nodesRef.current.find(n => n.id === edge.target);
          if (targetNode) {
            const targetLabel = targetNode.data.label.toUpperCase();
            // Check for YES-type keywords
            if (yesKeywords.some(kw => targetLabel.includes(kw))) {
              yesEdge = edge;
            }
            // Check for NO-type keywords
            if (noKeywords.some(kw => targetLabel.includes(kw))) {
              noEdge = edge;
            }
          }
        }

        // Select path based on result
        if (result && yesEdge) {
          nextEdge = yesEdge;
        } else if (!result && noEdge) {
          nextEdge = noEdge;
        } else {
          // Fallback to handle-based logic if semantic matching fails
          const handle = result ? 'right' : 'bottom';
          nextEdge = outgoingEdges.find(e => e.sourceHandle === handle);
          // Also try left handle as fallback
          if (!nextEdge) {
            nextEdge = outgoingEdges.find(e => e.sourceHandle === (result ? 'left' : 'bottom'));
          }
        }

        if (!nextEdge) {
          logMessage(`ℹ️ No ${result ? 'Yes' : 'No'} branch connected.`);
        }
      }
      // Unconditional Branching / Default Flow
      else if (upperLabel.includes('ELSE') || upperLabel.includes('DEFAULT') || upperLabel.includes('LOOP')) {
        if (upperLabel.includes('LOOP')) logMessage("🔄 Loop point...");
        // Follow standard path out
      }

      // Determine next node for standard flow (if not already branched by logic)
      if (!nextEdge) {
        nextEdge = edgesRef.current.find(e => e.source === nodeId && e.sourceHandle === 'bottom') ||
          edgesRef.current.find(e => e.source === nodeId && e.sourceHandle === 'right');
      }

      if (!nextEdge) {
        logMessage("🏁 End of path.");
        break;
      }

      currentNode = nodesRef.current.find(n => n.id === nextEdge.target);
      await sleep(300); // Visual gap
    }

    setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, isActive: false } })));
    isRunningRef.current = false;
    setIsRunning(false);
    logMessage("🏁 Program finished.");
  };

  const handleStop = () => {
    isRunningRef.current = false;
    setIsRunning(false);
    logMessage("🛑 Program stopped.");
  };

  const handleReset = () => {
    handleStop();
    setLedState(false);
    setExecutionLogs([]);
    setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, isActive: false } })));
    logMessage("♻️ Program reset.");
  };

  // Stabilized sound on deletion
  useEffect(() => {
    if ((deletePressed || backspacePressed) && selected) {
      if (selected.kind === 'node' || selected.kind === 'edge') {
        playSound(SOUND_PATHS.DELETE);

        // Deletion logic
        if (selected.kind === 'node') {
          setNodes(nds => nds.filter(n => n.id !== selected.id));
        } else if (selected.kind === 'edge') {
          setEdges(eds => eds.filter(e => e.id !== selected.id));
        }

        setSelected(null);
        scheduleSnapshot();
      }
    }
  }, [deletePressed, backspacePressed, selected, setNodes, setEdges, scheduleSnapshot]);

  // File click handler for project integration
  const handleFileClick = useCallback(async (filePath, fileName, parsedContent, fileData) => {
    try {
      console.log('File clicked in Block Programming:', fileName, filePath);

      const result = await canvasIntegration.loadFileToCanvas(filePath, fileName, parsedContent, fileData);

      if (result.success) {
        if (fileName.endsWith('.json') && parsedContent && typeof parsedContent === 'object') {
          let loadedNodes = [];
          let loadedEdges = [];
          let loadedViewport = null;

          if (parsedContent.blocks && parsedContent.connections) {
            loadedNodes = parsedContent.blocks || [];
            loadedEdges = parsedContent.connections || [];
            if (parsedContent.canvas?.position && parsedContent.canvas?.zoom) {
              loadedViewport = {
                x: parsedContent.canvas.position.x || 0,
                y: parsedContent.canvas.position.y || 0,
                zoom: parsedContent.canvas.zoom || 1
              };
            }
          } else if (parsedContent.nodes && parsedContent.edges) {
            loadedNodes = parsedContent.nodes || [];
            loadedEdges = parsedContent.edges || [];
            loadedViewport = parsedContent.viewport || null;
          }

          const newId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
          dispatch(
            addTab({
              id: newId,
              name: fileName,
              fileId: filePath,
              state: {
                nodes: loadedNodes,
                edges: loadedEdges,
                viewport: loadedViewport
              },
              dirty: false
            })
          );

          if (loadedViewport && rf) {
            setTimeout(() => rf.setViewport(loadedViewport), 100);
          }
        }

        console.log(`Loaded ${fileName} into Block Programming canvas and opened as tab`);
      } else {
        console.error('Failed to load file:', result.error);
      }
    } catch (error) {
      console.error('Failed to handle file click:', error);
    }
  }, [canvasIntegration, setNodes, setEdges, rf, dispatch]);

  // Setup auto-save functionality
  useEffect(() => {
    const activeProject = projectFileManager.getActiveProject();
    if (!activeProject) return;

    const timer = setTimeout(() => {
      const content = {
        blocks: nodes,
        connections: edges,
        canvas: {
          zoom: rf.getViewport().zoom,
          position: {
            x: rf.getViewport().x,
            y: rf.getViewport().y
          }
        }
      };
      canvasIntegration.saveCanvasToFile(content, 'BlockProgramming/logic_blocks.json', activeProject.id);
    }, 1000);

    return () => clearTimeout(timer);
  }, [nodes, edges, rf, canvasIntegration]);

  // Unify tabs functionality into Redux
  const createTab = useCallback(() => {
    const newId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    dispatch(
      addTab({
        id: newId,
        name: `Tab ${tabs.length + 1}`,
        state: createBlockProgrammingState(),
        dirty: true,
      }),
    );
  }, [dispatch, tabs.length]);

  // persistCurrentState, scheduleSnapshot moved up


  const onConnect = useCallback(
    (params) => {
      playSound(SOUND_PATHS.CLICK);
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'step',
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: '#111827', strokeWidth: 2 },
            labelBgPadding: [6, 4],
          },
          eds,
        ),
      );
      scheduleSnapshot();
    },
    [scheduleSnapshot, setEdges],
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const payload = event.dataTransfer.getData('application/reactflow');
      if (!payload) return;

      let item;
      try {
        item = JSON.parse(payload);
      } catch (err) {
        item = null;
      }

      if (!item) return;

      const position = rf.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const id = getId();
      logicId += 1;

      // Get colors for this block type
      const colors = BLOCK_COLORS[item.label] || {
        fill: '#ffffff',
        stroke: '#111827',
        text: '#111827'
      };

      setNodes((nds) =>
        nds.concat({
          id,
          type: 'logic',
          position,
          data: {
            ...DEFAULT_NODE_DATA,
            label: item.label,
            blockType: item.label, // Store original label as functional type
            variant: item.variant,
            fill: colors.fill,
            stroke: colors.stroke,
            text: colors.text,
          },
          style: {
            width: DEFAULT_NODE_DIMENSIONS.width,
            height: DEFAULT_NODE_DIMENSIONS.height
          },
        }),
      );
      setSelected({ kind: 'node', id });
      scheduleSnapshot();
    },
    [rf, scheduleSnapshot, setNodes],
  );

  const handlePaletteDragStart = useCallback((event, item) => {
    const payload = JSON.stringify({
      type: 'logic',
      label: item.label,
      variant: item.variant || 'rectangle'
    });
    event.dataTransfer.setData('application/reactflow', payload);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);


  const onSelectionChange = useCallback(({ nodes: selectedNodes, edges: selectedEdges }) => {
    if (selectedNodes?.length) {
      setSelected({ kind: 'node', id: selectedNodes[0].id, data: selectedNodes[0].data });
    } else if (selectedEdges?.length) {
      setSelected({ kind: 'edge', id: selectedEdges[0].id });
    } else {
      setSelected(null);
    }
  }, []);

  // Filter groups based on search
  const filteredGroups = useMemo(() => {
    const query = paletteSearch.trim().toLowerCase();
    if (!query) return LOGIC_GROUPS;
    return LOGIC_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => item.label.toLowerCase().includes(query)),
    })).filter((group) => group.items.length > 0);
  }, [paletteSearch]);

  const hasSearch = paletteSearch.trim().length > 0;

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
      if (next) {
        navigate(next);
      }
    },
    [navigate],
  );

  const saveDiagram = useCallback(() => {
    const snapshot = {
      nodes: nodesRef.current,
      edges: edgesRef.current,
      viewport: rf.getViewport(),
    };
    if (activeTabIdRef.current) {
      dispatch(markTabClean(activeTabIdRef.current));
    }
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'block-programming.json';
    link.click();
    URL.revokeObjectURL(url);
  }, [rf, dispatch]);

  const loadDiagram = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          setNodes(parsed.nodes || []);
          setEdges(parsed.edges || []);
          if (parsed.viewport) {
            rf.setViewport(parsed.viewport);
          }
          scheduleSnapshot();
        } catch (error) {
          console.error('Invalid block programming JSON', error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [rf, scheduleSnapshot, setEdges, setNodes]);

  const showExportPreview = useCallback((dataUrl, fileName) => {
    const host = reactFlowWrapper.current;
    if (!host) return;
    if (getComputedStyle(host).position === 'static') {
      host.style.position = 'relative';
    }

    const existing = host.querySelector('.diagram-export-preview');
    if (existing) {
      existing.remove();
    }

    const overlay = document.createElement('div');
    overlay.className = 'diagram-export-preview';
    Object.assign(overlay.style, {
      position: 'absolute',
      top: '16px',
      right: '16px',
      width: '260px',
      maxHeight: '80%',
      background: 'rgba(15,23,42,0.94)',
      border: '1px solid rgba(148,163,184,0.25)',
      borderRadius: '12px',
      boxShadow: '0 18px 48px rgba(15,23,42,0.45)',
      padding: '14px 14px 12px',
      zIndex: '1300',
      color: '#e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      backdropFilter: 'blur(8px)',
    });

    const title = document.createElement('div');
    title.textContent = 'PNG exported';
    title.style.fontSize = '14px';
    title.style.fontWeight = '600';
    overlay.appendChild(title);

    const img = new Image();
    img.src = dataUrl;
    img.alt = fileName;
    Object.assign(img.style, {
      width: '100%',
      maxHeight: '160px',
      objectFit: 'contain',
      borderRadius: '8px',
      border: '1px solid rgba(148,163,184,0.3)',
      background: '#0f172a',
    });
    overlay.appendChild(img);

    const meta = document.createElement('div');
    meta.textContent = fileName;
    meta.style.fontSize = '11px';
    meta.style.opacity = '0.75';
    overlay.appendChild(meta);

    const actions = document.createElement('div');
    Object.assign(actions.style, {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '8px',
    });

    const openBtn = document.createElement('button');
    openBtn.type = 'button';
    openBtn.textContent = 'Open';
    Object.assign(openBtn.style, {
      padding: '6px 10px',
      borderRadius: '6px',
      border: '1px solid rgba(59,130,246,0.4)',
      background: '#1d4ed8',
      color: '#f8fafc',
      fontSize: '12px',
      cursor: 'pointer',
    });
    openBtn.onclick = () => window.open(dataUrl, '_blank', 'noopener');

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.textContent = 'Close';
    Object.assign(closeBtn.style, {
      padding: '6px 10px',
      borderRadius: '6px',
      border: '1px solid rgba(148,163,184,0.35)',
      background: 'transparent',
      color: '#cbd5f5',
      fontSize: '12px',
      cursor: 'pointer',
    });
    closeBtn.onclick = () => overlay.remove();

    actions.appendChild(closeBtn);
    actions.appendChild(openBtn);
    overlay.appendChild(actions);

    host.appendChild(overlay);
  }, []);

  const handleExportPNG = useCallback(async () => {
    const container = reactFlowWrapper.current?.querySelector('.react-flow');
    if (!container) return;

    let watermark;
    try {
      watermark = document.createElement('div');
      watermark.className = 'export-watermark';
      Object.assign(watermark.style, {
        position: 'absolute',
        right: '16px',
        bottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(255,255,255,0.9)',
        border: '1px solid #e5e5e5',
        borderRadius: '8px',
        padding: '6px 10px',
        fontSize: '12px',
        color: '#111',
        pointerEvents: 'none',
        zIndex: '1000',
      });
      const img = new Image();
      img.src = hexBg;
      img.alt = 'InnoIDE';
      img.style.width = '32px';
      img.style.height = '32px';
      img.style.opacity = '0.9';
      watermark.appendChild(img);
      const span = document.createElement('span');
      span.textContent = 'made with innotrat labs';
      watermark.appendChild(span);
      container.appendChild(watermark);

      const dataUrl = await toPng(container, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        filter: (node) => {
          if (!(node instanceof Element)) return true;
          const classes = node.classList;
          if (!classes) return true;
          if (
            classes.contains('export-ignore') ||
            classes.contains('react-flow__background') ||
            classes.contains('react-flow__attribution')
          ) {
            return false;
          }
          return true;
        },
      });

      const activeProject = projectFileManager.getActiveProject();
      const projectSegment = sanitizeSegment(activeProject?.name || activeProjectName || 'project');
      const timeSegment = sanitizeSegment(new Date().toISOString());
      const fileName = `${projectSegment}_blockprogramming_${timeSegment}.png`;

      if (activeProject) {
        try {
          const pngPath = await canvasIntegration.exportCanvasAsPNG(dataUrl, fileName, activeProject.id);
          if (pngPath) {
            console.log('PNG exported to project:', pngPath);
          }
        } catch (error) {
          console.error('Failed to save PNG to project:', error);
        }
      }

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.dispatchEvent(
        new CustomEvent('diagram:export-preview', {
          detail: {
            kind: 'BlockProgramming',
            fileName,
            dataUrl,
            timestamp: Date.now(),
          },
        })
      );

      showExportPreview(dataUrl, fileName);
    } catch (error) {
      console.error('Failed to export block programming PNG', error);
    } finally {
      if (watermark && watermark.parentNode) {
        watermark.parentNode.removeChild(watermark);
      }
    }
  }, [canvasIntegration, activeProjectName, reactFlowWrapper, showExportPreview]);

  // Keyboard deletion handler - removed as it's merged above


  
const SidebarContent = (
  <div className="bp-sidebar-scope" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
<div className="sidebar-toggle-bar">
            <button
              type="button"
              className={`sidebar-tab ${isExplorerVisible === 'explorer' ? 'active' : ''}`}
              onClick={() => setIsExplorerVisible('explorer')}
            >
              Explorer
            </button>
            <button
              type="button"
              className={`sidebar-tab ${isExplorerVisible === 'blocks' ? 'active' : ''}`}
              onClick={() => setIsExplorerVisible('blocks')}
            >
              Blocks
            </button>
          </div>
          <div className="sidebar-body">
            {isExplorerVisible === 'explorer' ? (
              <FileExplorer variant="diagram" />
            ) : (
              <div className="palette-frame">
                <div className="palette-header">
                  <div className="palette-title">Logic Blocks</div>
                </div>
                <div className="palette-search">
                  <input
                    type="text"
                    placeholder="Search blocks..."
                    value={paletteSearch}
                    onChange={(e) => setPaletteSearch(e.target.value)}
                  />
                </div>
                <div className="palette-wrapper">
                  {filteredGroups.length ? (
                    filteredGroups.map((group) => {
                      const isExpanded = hasSearch ? true : openGroups[group.id] ?? true;
                      const toggleGroup = () => {
                        if (hasSearch) return;
                        setOpenGroups((prev) => ({
                          ...prev,
                          [group.id]: !(prev[group.id] ?? true),
                        }));
                      };
                      return (
                        <div className="palette-group" key={group.id}>
                          <div
                            className="palette-header"
                            onClick={toggleGroup}
                            style={{
                              cursor: hasSearch ? 'default' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div className="palette-title">{group.title}</div>
                            <span className="palette-chevron">{isExpanded ? '▾' : '▸'}</span>
                          </div>
                          {isExpanded && (
                            <div className="palette-grid">
                              {group.items.map((item) => {
                                const colors = BLOCK_COLORS[item.label] || {};
                                const [primary, ...rest] = item.label.split(' ');
                                const secondary = rest.join(' ');
                                return (
                                  <div
                                    key={`${group.id}-${item.label}`}
                                    className="shape-card"
                                    draggable
                                    onDragStart={(e) => {
                                      playSound(SOUND_PATHS.CLICK);
                                      handlePaletteDragStart(e, item);
                                    }}
                                    style={{
                                      backgroundColor: colors.fill || '#ffffff',
                                      border: `2px solid ${colors.stroke || '#111827'}`,
                                      borderRadius: '8px',
                                      padding: '8px',
                                      margin: '4px'
                                    }}
                                  >
                                    <div className="shape-svg logic-shape-preview">
                                      <span
                                        className="logic-shape-preview__primary"
                                        style={{ color: colors.text || '#111827' }}
                                      >
                                        {primary}
                                      </span>
                                      {secondary ? (
                                        <span
                                          className="logic-shape-preview__secondary"
                                          style={{ color: colors.text || '#111827' }}
                                        >
                                          {secondary}
                                        </span>
                                      ) : null}
                                    </div>
                                    <div
                                      className="shape-label"
                                      style={{ color: colors.text || '#111827' }}
                                    >
                                      {item.label}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="palette-empty">No blocks found.</div>
                  )}
                </div>
                <div className="palette-hint">Drag blocks into the workspace and connect them.</div>
              </div>
            )}
          </div>
  </div>
);
return (
    <div className="diagram-builder">
      <EditorNavbar
        activeTab="Block Programming"
        onTabChange={handleTabChange}
        onSaveJSON={saveDiagram}
        onLoadJSON={loadDiagram}
        onExportPNG={handleExportPNG}
        onUndo={undo}
        onRedo={redo}
      />
      <div className="content">
        
          {/* Mobile Sidebar */}
          <Drawer isOpen={isSidebarOpen} placement="left" onClose={onCloseSidebar} size="xs">
            <DrawerOverlay display={{ base: "block", lg: "none" }} />
            <DrawerContent display={{ base: "block", lg: "none" }} bg="#f8fafc">
              <DrawerCloseButton />
              <DrawerHeader borderBottomWidth="1px" fontSize="sm">Blocks</DrawerHeader>
              <DrawerBody p={0}>
                {SidebarContent}
              </DrawerBody>
            </DrawerContent>
          </Drawer>

          {/* Desktop Sidebar */}
          <Box
            display={{ base: "none", lg: "block" }}
            className="sidebarr"
            width={`${sidebarWidth}px`}
            minW={`${sidebarWidth}px`}
            maxW={`${sidebarWidth}px`}
            flex={`0 0 ${sidebarWidth}px`}
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

        <div className="diagram-container" style={{ flex: 1 }}>
          <div style={{ padding: '8px 12px', background: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
            
            <IconButton
              display={{ base: "inline-flex", lg: "none" }}
              icon={<span>📁</span>}
              size="xs"
              onClick={onToggleSidebar}
              aria-label="Toggle blocks"
              variant="ghost"
              color="#64748b"
              mr={2}
              verticalAlign="middle"
            />
            <DiagramTabs title="Block Programming Workspace" kind="blockProgramming" onSaveJSON={saveDiagram} />
          </div>
          <div className="canvas-frame" onDrop={onDrop} onDragOver={onDragOver}>
            <div
              className="rf-wrapper"
              ref={reactFlowWrapper}
              style={{ position: 'relative', width: '100%', height: '100%' }}
            >
              {nodes.length === 0 && (
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
                    DRAG BLOCKS HERE TO START PROGRAMMING
                  </div>
                </div>
              )}
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onConnect={onConnect}
                onSelectionChange={onSelectionChange}
                nodeTypes={nodeTypes}
                fitView
                connectionLineType={ConnectionLineType.Step}
                connectionMode={ConnectionMode.Strict}
                snapToGrid
                snapGrid={[16, 16]}
              >
                <style>{`
                  @keyframes pulse-executing {
                    0% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
                  }
                  .active-executing .logic-node__content {
                    animation: pulse-executing 1s infinite;
                    transform: scale(1.05);
                    transition: all 0.2s ease;
                  }
                  .rf-wrapper .react-flow__pane {
                    cursor: crosshair;
                  }
                  @keyframes blink-canvas {
                    0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    50% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.98); }
                  }
                `}</style>
                <Background className="export-ignore" gap={16} size={1} />
                {showExecutionControl ? (
                  <Panel position="top-right" style={{
                    background: 'rgba(255,255,255,0.95)',
                    padding: '16px',
                    borderRadius: '12px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    width: '50vw',
                    minWidth: '400px',
                    height: 'calc(100vh - 100px)',
                    maxHeight: 'calc(100vh - 100px)',
                    zIndex: 100
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1e293b' }}>Execution Control</div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <div style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            background: ledState ? '#ef4444' : '#94a3b8',
                            boxShadow: ledState ? '0 0 10px #ef4444' : 'none',
                            transition: 'all 0.3s'
                          }} title={ledState ? "LED is ON" : "LED is OFF"} />
                          <div style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '2px',
                            background: switchState ? '#3b82f6' : '#94a3b8',
                            boxShadow: switchState ? '0 0 10px #3b82f6' : 'none',
                            transition: 'all 0.3s'
                          }} title={switchState ? "Switch is HIGH" : "Switch is LOW"} />
                        </div>
                      </div>
                      <button
                        onClick={() => setShowExecutionControl(false)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '18px',
                          color: '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          borderRadius: '4px'
                        }}
                        title="Close Panel"
                        onMouseOver={(e) => e.target.style.background = '#f1f5f9'}
                        onMouseOut={(e) => e.target.style.background = 'transparent'}
                      >✕</button>
                    </div>
                  <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                    {!isRunning ? (
                      <button
                        onClick={handleRun}
                        style={{
                          flex: 1,
                          background: '#22c55e',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >Run Program</button>
                    ) : (
                      <button
                        onClick={handleStop}
                        style={{
                          flex: 1,
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >Stop</button>
                    )}
                    <button
                      onClick={handleReset}
                      style={{
                        flex: 0.5,
                        background: '#94a3b8',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                    >Reset</button>
                  </div>
                  <div
                    ref={logContainerRef}
                    style={{
                      background: '#1e1e1e',
                      flex: 1,
                      width: '100%',
                      borderRadius: '8px',
                      padding: '16px',
                      fontSize: '14px',
                      fontFamily: 'Consolas, Monaco, monospace',
                      overflowY: 'auto',
                      border: '1px solid #e2e8f0',
                      color: '#e2e8f0',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                    {executionLogs.length === 0 && <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '15px' }}>Logs will appear here...</div>}
                    {executionLogs.map((log, i) => <div key={i} style={{ marginBottom: '4px' }}>{log}</div>)}
                  </div>
                </Panel>
                ) : (
                  <Panel position="top-right">
                    <button
                      onClick={() => setShowExecutionControl(true)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '10px 16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1e293b',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>⚙️</span> Execution Control
                    </button>
                  </Panel>
                )}
                <Controls className="export-ignore">
                  <ControlButton onClick={undo} title="Undo (Ctrl+Z)">
                    <RotateCcw size={16} />
                  </ControlButton>
                  <ControlButton onClick={redo} title="Redo (Ctrl+Y)">
                    <RotateCw size={16} />
                  </ControlButton>
                </Controls>
              </ReactFlow>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BlockProgrammingWorkspace() {
  return (
    <BlockProgrammingCanvas />
  );
}

const BlockProgramming = () => (
  <ReactFlowProvider>
    <BlockProgrammingWorkspace />
  </ReactFlowProvider>
);

export default BlockProgramming;
