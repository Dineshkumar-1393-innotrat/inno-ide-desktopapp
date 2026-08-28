import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  ControlButton,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
  ConnectionMode,
} from 'reactflow';
import { useNavigate } from 'react-router-dom';
import 'reactflow/dist/style.css';
import '@reactflow/node-resizer/dist/style.css';
import './BlockDiagramTest.css';
import FileExplorer from './FileExplorer';
import './FileExplorer.css';
import EditorNavbar from './EditorNavbar';
import { Settings, ArrowLeftRight, RotateCcw, RotateCw } from 'lucide-react';
import { useProject } from '../ProjectContext';
import { saveProjectFile, sanitizeSegment } from '../utils/workspaceStorage';

let nodeId = 1;
const getId = () => `n_${nodeId++}`;

const DiagramEditorInternal = ({ 
  activeTab, 
  onTabChange, 
  paletteGroups, 
  nodeTypes, 
  edgeTypes, 
  initialNodes = [], 
  initialEdges = [] 
}) => {
  const { project, projectFile, setProjectFile } = useProject();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selected, setSelected] = useState(null);
  const [openGroups, setOpenGroups] = useState(() => {
    const initialState = {};
    (paletteGroups || []).forEach(g => initialState[g.id] = true);
    return initialState;
  });
  const rf = useReactFlow();

  // History & snapshots
  const historyRef = useRef({ entries: [], index: -1 });

  const takeSnapshot = useCallback(() => {
    const history = historyRef.current;
    const snapshot = { nodes: rf.getNodes(), edges: rf.getEdges() };

    // Truncate any future states if we are in the middle of the history
    if (history.index < history.entries.length - 1) {
      history.entries.splice(history.index + 1);
    }

    history.entries.push(snapshot);
    history.index = history.entries.length - 1;
  }, [rf]);

  const undo = useCallback(() => {
    const history = historyRef.current;
    if (history.index > 0) {
      history.index -= 1;
      const { nodes, edges } = history.entries[history.index];
      rf.setNodes(nodes);
      rf.setEdges(edges);
    }
  }, [rf]);

  const redo = useCallback(() => {
    const history = historyRef.current;
    if (history.index < history.entries.length - 1) {
      history.index += 1;
      const { nodes, edges } = history.entries[history.index];
      rf.setNodes(nodes);
      rf.setEdges(edges);
    }
  }, [rf]);

  // Save & Load
  const saveDiagram = useCallback(async () => {
    if (!project) return;
    const diagram = rf.toObject();
    const filePath = `src/${sanitizeSegment(activeTab)}.json`;
    await saveProjectFile(project.name, filePath, JSON.stringify(diagram, null, 2));
    alert(`${activeTab} saved!`);
  }, [rf, project, activeTab]);

  const loadDiagram = useCallback((data) => {
    if (data) {
      rf.setNodes(data.nodes || []);
      rf.setEdges(data.edges || []);
    }
  }, [rf]);

  // Handlers
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
  const onNodeDragStop = useCallback(() => takeSnapshot(), [takeSnapshot]);
  const onSelectionChange = useCallback(({ nodes, edges }) => {
    if (nodes.length === 1 && edges.length === 0) {
      setSelected({ kind: 'node', id: nodes[0].id, ref: nodes[0] });
    } else if (edges.length === 1 && nodes.length === 0) {
      setSelected({ kind: 'edge', id: edges[0].id, ref: edges[0] });
    } else {
      setSelected(null);
    }
  }, []);

  const onDragStart = (event, node) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(node));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const reactFlowBounds = rf.project(event.clientX, event.clientY);
    const data = JSON.parse(event.dataTransfer.getData('application/reactflow'));

    const newNode = {
      id: getId(),
      type: data.type,
      position: reactFlowBounds,
      data: { label: `${data.label}` },
    };

    setNodes((nds) => nds.concat(newNode));
    takeSnapshot();
  }, [rf, setNodes, takeSnapshot]);

  // Effect for keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'z') undo();
      if (e.ctrlKey && e.key === 'y') redo();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [undo, redo]);

  return (
    <div className="diagram-builder">
      <EditorNavbar 
        activeTab={activeTab} 
        onTabChange={onTabChange}
        onSaveJSON={saveDiagram}
      />
      <div className="editor-container">
        <div className="sidebar">
            {paletteGroups.map((g) => (
              <div key={g.id} className="palette-group">
                <div className="palette-header" onClick={() => setOpenGroups(st => ({ ...st, [g.id]: !st[g.id] }))}>
                  <div className="palette-title">{g.name}</div>
                  <span className="palette-chevron">{openGroups[g.id] ? '▾' : '▸'}</span>
                </div>
                {openGroups[g.id] && (
                  <div className="palette-grid">
                    {g.items.map((s) => (
                      <div
                        key={s.id}
                        className="palette-card"
                        draggable
                        onDragStart={(e) => onDragStart(e, { type: s.type || 'custom', label: s.name, ...s })}
                      >
                        <div className="palette-icon">
                          <svg viewBox={s.icon.viewBox}><path d={s.icon.path} /></svg>
                        </div>
                        <div className="palette-label">{s.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
        <div className="react-flow-wrapper" onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDragStop={onNodeDragStop}
            onSelectionChange={onSelectionChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            connectionLineType={ConnectionLineType.SmoothStep}
            defaultEdgeOptions={{ type: 'editable', markerEnd: { type: MarkerType.ArrowClosed } }}
            connectionMode={ConnectionMode.Strict}
            snapToGrid
            snapGrid={[16, 16]}
          >
            <MiniMap className="export-ignore" />
            <Controls className="export-ignore">
              <ControlButton onClick={undo} title="undo"><RotateCcw /></ControlButton>
              <ControlButton onClick={redo} title="redo"><RotateCw /></ControlButton>
            </Controls>
            <Background className="export-ignore" gap={16} size={1} />
          </ReactFlow>
        </div>
        <div className="properties-panel">
          <h3>Properties</h3>
          {/* Properties panel content will go here */}
        </div>
      </div>
    </div>
  );
};

const DiagramEditor = (props) => (
  <ReactFlowProvider>
    <DiagramEditorInternal {...props} />
  </ReactFlowProvider>
);

export default DiagramEditor;
