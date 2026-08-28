import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, useReactFlow, BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';

// Shared node base styles
const baseNodeStyles = (data) => ({
  width: '100%',
  height: '100%',
  color: data?.text || '#000000',
  transform: `rotate(${data?.rotation || 0}deg)`,
  transformOrigin: 'center center',
});

// Process (rectangle)
export function ProcessNode({ id, data, selected }) {
  const rf = useReactFlow();
  const [val, setVal] = useState(data?.label ?? 'Text');
  const commit = (next) => {
    rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: next, editing: false } } : n)));
    window.dispatchEvent(new Event('rf-change'));
  };

  return (
    <div
      style={{
        ...baseNodeStyles(data),
        background: data?.fill || '#ffffff',
        border: `${data?.strokeWidth ?? 2}px solid ${data?.stroke || '#000000'}`,
        borderRadius: 6,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 6,
        boxSizing: 'border-box',
      }}
      onDoubleClick={() => rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, editing: true } } : n)))}
    >
      <NodeResizer isVisible={selected} minWidth={80} minHeight={40} color={data?.stroke || '#000'} />
      <Handle id="top-in" type="target" position={Position.Top} />
      <Handle id="right-in" type="target" position={Position.Right} />
      <Handle id="bottom-in" type="target" position={Position.Bottom} />
      <Handle id="left-in" type="target" position={Position.Left} />
      <Handle id="top-out" type="source" position={Position.Top} />
      <Handle id="right-out" type="source" position={Position.Right} />
      <Handle id="bottom-out" type="source" position={Position.Bottom} />
      <Handle id="left-out" type="source" position={Position.Left} />
      {data?.editing ? (
        <input
          className="nodrag nopan nowheel"
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={() => commit(val)}
          onKeyDown={(e) => e.key === 'Enter' && commit(val)}
          onMouseDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            border: '1px solid #ccc',
            borderRadius: 4,
            padding: '4px 6px',
            fontSize: 12,
            position: 'relative',
            zIndex: 5,
            background: '#fff',
            color: '#000',
            pointerEvents: 'all',
          }}
        />
      ) : (
        <span style={{ color: data?.text || '#000', fontSize: data?.fontSize || 12, textAlign: 'center' }}>{data?.label ?? 'Text'}</span>
      )}
    </div>
  );
}

// Decision (diamond)
export function DecisionNode({ id, data, selected }) {
  const rf = useReactFlow();
  const [val, setVal] = useState(data?.label ?? 'Text');
  const commit = (next) => {
    rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: next, editing: false } } : n)));
    window.dispatchEvent(new Event('rf-change'));
  };
  const fill = data?.fill || '#ffffff';
  const stroke = data?.stroke || '#000000';
  const sw = data?.strokeWidth ?? 2;

  return (
    <div
      style={{ ...baseNodeStyles(data), position: 'relative' }}
      onDoubleClick={() => rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, editing: true } } : n)))}
    >
      <NodeResizer isVisible={selected} minWidth={80} minHeight={80} color={data?.stroke || '#000'} lineStyle={{ borderColor: 'transparent' }} />
      <svg viewBox="0 0 160 80" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
        <polygon points="80,0 160,40 80,80 0,40" fill={fill} stroke={stroke} strokeWidth={sw} />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 6,
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        {data?.editing ? (
          <input
            className="nodrag nopan nowheel"
            autoFocus
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={() => commit(val)}
            onKeyDown={(e) => e.key === 'Enter' && commit(val)}
            onMouseDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              border: '1px solid #ccc',
              borderRadius: 4,
              padding: '4px 6px',
              fontSize: 12,
              position: 'relative',
              zIndex: 5,
              background: '#fff',
              color: '#000',
              pointerEvents: 'all',
            }}
          />
        ) : (
          <span style={{ color: data?.text || '#000', fontSize: data?.fontSize || 12 }}>{data?.label ?? 'Text'}</span>
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
    </div>
  );
}

// Terminator (rounded rectangle)
export function TerminatorNode({ id, data, selected }) {
  const rf = useReactFlow();
  const [val, setVal] = useState(data?.label ?? 'Text');
  const commit = (next) => {
    rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: next, editing: false } } : n)));
    window.dispatchEvent(new Event('rf-change'));
  };

  return (
    <div
      style={{
        ...baseNodeStyles(data),
        background: data?.fill || '#ffffff',
        border: `${data?.strokeWidth ?? 2}px solid ${data?.stroke || '#000000'}`,
        borderRadius: 24,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 6,
        boxSizing: 'border-box',
      }}
      onDoubleClick={() => rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, editing: true } } : n)))}
    >
      <NodeResizer isVisible={selected} minWidth={80} minHeight={40} color={data?.stroke || '#000'} />
      <Handle id="top-in" type="target" position={Position.Top} />
      <Handle id="right-in" type="target" position={Position.Right} />
      <Handle id="bottom-in" type="target" position={Position.Bottom} />
      <Handle id="left-in" type="target" position={Position.Left} />
      <Handle id="top-out" type="source" position={Position.Top} />
      <Handle id="right-out" type="source" position={Position.Right} />
      <Handle id="bottom-out" type="source" position={Position.Bottom} />
      <Handle id="left-out" type="source" position={Position.Left} />
      {data?.editing ? (
        <input
          className="nodrag nopan nowheel"
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={() => commit(val)}
          onKeyDown={(e) => e.key === 'Enter' && commit(val)}
          onMouseDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            border: '1px solid #ccc',
            borderRadius: 4,
            padding: '4px 6px',
            fontSize: 12,
            position: 'relative',
            zIndex: 5,
            background: '#fff',
            color: '#000',
            pointerEvents: 'all',
          }}
        />
      ) : (
        <span style={{ color: data?.text || '#000', fontSize: data?.fontSize || 12, textAlign: 'center' }}>{data?.label ?? 'Text'}</span>
      )}
    </div>
  );
}

// Ellipse (circle/oval)
export function EllipseNode({ id, data, selected }) {
  const rf = useReactFlow();
  const [val, setVal] = useState(data?.label ?? 'Text');
  const commit = (next) => {
    rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: next, editing: false } } : n)));
    window.dispatchEvent(new Event('rf-change'));
  };

  return (
    <div
      style={{
        ...baseNodeStyles(data),
        background: data?.fill || '#ffffff',
        border: `${data?.strokeWidth ?? 2}px solid ${data?.stroke || '#000000'}`,
        borderRadius: '50%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 6,
        boxSizing: 'border-box',
      }}
      onDoubleClick={() => rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, editing: true } } : n)))}
    >
      <NodeResizer isVisible={selected} minWidth={60} minHeight={60} color={data?.stroke || '#000'} lineStyle={{ borderColor: 'transparent' }} />
      <Handle id="top-in" type="target" position={Position.Top} />
      <Handle id="right-in" type="target" position={Position.Right} />
      <Handle id="bottom-in" type="target" position={Position.Bottom} />
      <Handle id="left-in" type="target" position={Position.Left} />
      <Handle id="top-out" type="source" position={Position.Top} />
      <Handle id="right-out" type="source" position={Position.Right} />
      <Handle id="bottom-out" type="source" position={Position.Bottom} />
      <Handle id="left-out" type="source" position={Position.Left} />
      {data?.editing ? (
        <input
          className="nodrag nopan nowheel"
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={() => commit(val)}
          onKeyDown={(e) => e.key === 'Enter' && commit(val)}
          onMouseDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            border: '1px solid #ccc',
            borderRadius: 4,
            padding: '4px 6px',
            fontSize: 12,
            position: 'relative',
            zIndex: 5,
            background: '#fff',
            color: '#000',
            pointerEvents: 'all',
          }}
        />
      ) : (
        <span style={{ color: data?.text || '#000', fontSize: data?.fontSize || 12, textAlign: 'center' }}>{data?.label ?? 'Text'}</span>
      )}
    </div>
  );
}

// Data (parallelogram)
export function DataNode({ id, data, selected }) {
  const rf = useReactFlow();
  const [val, setVal] = useState(data?.label ?? 'Text');
  const commit = (next) => {
    rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: next, editing: false } } : n)));
    window.dispatchEvent(new Event('rf-change'));
  };

  return (
    <div
      style={{ ...baseNodeStyles(data), position: 'relative' }}
      onDoubleClick={() => rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, editing: true } } : n)))}
    >
      <NodeResizer isVisible={selected} minWidth={80} minHeight={40} color={data?.stroke || '#000'} />
      <div
        style={{
          width: '80%',
          height: '70%',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) skewX(-20deg)',
          background: data?.fill || '#ffffff',
          border: `${data?.strokeWidth ?? 2}px solid ${data?.stroke || '#000000'}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 6,
          pointerEvents: 'none',
        }}
      >
        {data?.editing ? (
          <input
            className="nodrag nopan nowheel"
            autoFocus
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={() => commit(val)}
            onKeyDown={(e) => e.key === 'Enter' && commit(val)}
            onMouseDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              border: '1px solid #ccc',
              borderRadius: 4,
              padding: '4px 6px',
              fontSize: 12,
              position: 'relative',
              zIndex: 5,
              background: '#fff',
              color: '#000',
              pointerEvents: 'all',
            }}
          />
        ) : (
          <span style={{ color: data?.text || '#000', fontSize: data?.fontSize || 12 }}>{data?.label ?? 'Text'}</span>
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
    </div>
  );
}

// Database (cylinder)
export function DatabaseNode({ id, data, selected }) {
  const rf = useReactFlow();
  const [val, setVal] = useState(data?.label ?? 'Text');
  const commit = (next) => {
    rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: next, editing: false } } : n)));
    window.dispatchEvent(new Event('rf-change'));
  };
  const fill = data?.fill || '#ffffff';
  const stroke = data?.stroke || '#000000';
  const sw = data?.strokeWidth ?? 2;
  return (
    <div style={{ ...baseNodeStyles(data), position: 'relative' }}
      onDoubleClick={() => rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, editing: true } } : n)))}>
      <NodeResizer isVisible={selected} minWidth={80} minHeight={60} color={stroke} lineStyle={{ borderColor: 'transparent' }} />
      <svg viewBox="0 0 160 80" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
        <ellipse cx="80" cy="15" rx="70" ry="12" fill={fill} stroke={stroke} strokeWidth={sw} />
        <rect x="10" y="15" width="140" height="50" fill={fill} stroke={stroke} strokeWidth={sw} />
        <ellipse cx="80" cy="65" rx="70" ry="12" fill="none" stroke={stroke} strokeWidth={sw} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6, pointerEvents: 'none' }}>
        {data?.editing ? (
          <input
            className="nodrag nopan nowheel"
            autoFocus
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={() => commit(val)}
            onKeyDown={(e) => e.key === 'Enter' && commit(val)}
            onMouseDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              border: '1px solid #ccc',
              borderRadius: 4,
              padding: '4px 6px',
              fontSize: 12,
              position: 'relative',
              zIndex: 5,
              background: '#fff',
              color: '#000',
              pointerEvents: 'all',
            }}
          />
        ) : (
          <span style={{ color: data?.text || '#000', fontSize: data?.fontSize || 12 }}>{data?.label ?? 'Database'}</span>
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
    </div>
  );
}

// Manual Input (trapezoid)
export function ManualInputNode({ id, data, selected }) {
  const rf = useReactFlow();
  const [val, setVal] = useState(data?.label ?? 'Text');
  const commit = (next) => {
    rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: next, editing: false } } : n)));
    window.dispatchEvent(new Event('rf-change'));
  };
  const fill = data?.fill || '#ffffff';
  const stroke = data?.stroke || '#000000';
  const sw = data?.strokeWidth ?? 2;
  return (
    <div style={{ ...baseNodeStyles(data), position: 'relative' }}
      onDoubleClick={() => rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, editing: true } } : n)))}>
      <NodeResizer isVisible={selected} minWidth={80} minHeight={40} color={stroke} lineStyle={{ borderColor: 'transparent' }} />
      <svg viewBox="0 0 160 80" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
        <polygon points="20,5 155,5 140,75 5,75" fill={fill} stroke={stroke} strokeWidth={sw} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6, pointerEvents: 'none' }}>
        {data?.editing ? (
          <input
            className="nodrag nopan nowheel"
            autoFocus
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={() => commit(val)}
            onKeyDown={(e) => e.key === 'Enter' && commit(val)}
            onMouseDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              border: '1px solid #ccc',
              borderRadius: 4,
              padding: '4px 6px',
              fontSize: 12,
              position: 'relative',
              zIndex: 5,
              background: '#fff',
              color: '#000',
              pointerEvents: 'all',
            }}
          />
        ) : (
          <span style={{ color: data?.text || '#000', fontSize: data?.fontSize || 12 }}>{data?.label ?? 'Manual Input'}</span>
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
    </div>
  );
}

// Document (wavy bottom)
export function DocumentNode({ id, data, selected }) {
  const rf = useReactFlow();
  const [val, setVal] = useState(data?.label ?? 'Text');
  const commit = (next) => {
    rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: next, editing: false } } : n)));
    window.dispatchEvent(new Event('rf-change'));
  };
  const fill = data?.fill || '#ffffff';
  const stroke = data?.stroke || '#000000';
  const sw = data?.strokeWidth ?? 2;
  return (
    <div style={{ ...baseNodeStyles(data), position: 'relative' }}
      onDoubleClick={() => rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, editing: true } } : n)))}>
      <NodeResizer isVisible={selected} minWidth={80} minHeight={50} color={stroke} lineStyle={{ borderColor: 'transparent' }} />
      <svg viewBox="0 0 160 80" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
        <rect x="5" y="5" width="150" height="55" fill={fill} stroke={stroke} strokeWidth={sw} />
        <path d="M5 60 C 35 50, 65 70, 95 60 S 155 70, 155 60" fill="none" stroke={stroke} strokeWidth={sw} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6, pointerEvents: 'none' }}>
        {data?.editing ? (
          <input
            className="nodrag nopan nowheel"
            autoFocus
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={() => commit(val)}
            onKeyDown={(e) => e.key === 'Enter' && commit(val)}
            onMouseDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              border: '1px solid #ccc',
              borderRadius: 4,
              padding: '4px 6px',
              fontSize: 12,
              position: 'relative',
              zIndex: 5,
              background: '#fff',
              color: '#000',
              pointerEvents: 'all',
            }}
          />
        ) : (
          <span style={{ color: data?.text || '#000', fontSize: data?.fontSize || 12 }}>{data?.label ?? 'Document'}</span>
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
    </div>
  );
}

// Triangle
export function TriangleNode({ id, data, selected }) {
  const rf = useReactFlow();
  const [val, setVal] = useState(data?.label ?? 'Text');
  const commit = (next) => {
    rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: next, editing: false } } : n)));
    window.dispatchEvent(new Event('rf-change'));
  };
  const fill = data?.fill || '#ffffff';
  const stroke = data?.stroke || '#000000';
  const sw = data?.strokeWidth ?? 2;
  return (
    <div style={{ ...baseNodeStyles(data), position: 'relative' }}
      onDoubleClick={() => rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, editing: true } } : n)))}>
      <NodeResizer isVisible={selected} minWidth={60} minHeight={50} color={stroke} lineStyle={{ borderColor: 'transparent' }} />
      <svg viewBox="0 0 160 80" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
        <polygon points="80,5 155,75 5,75" fill={fill} stroke={stroke} strokeWidth={sw} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6, pointerEvents: 'none' }}>
        {data?.editing ? (
          <input
            className="nodrag nopan nowheel"
            autoFocus
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={() => commit(val)}
            onKeyDown={(e) => e.key === 'Enter' && commit(val)}
            onMouseDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              border: '1px solid #ccc',
              borderRadius: 4,
              padding: '4px 6px',
              fontSize: 12,
              position: 'relative',
              zIndex: 5,
              background: '#fff',
              color: '#000',
              pointerEvents: 'all',
            }}
          />
        ) : (
          <span style={{ color: data?.text || '#000', fontSize: data?.fontSize || 12 }}>{data?.label ?? 'Triangle'}</span>
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
    </div>
  );
}

// Hexagon
export function HexagonNode({ id, data, selected }) {
  const rf = useReactFlow();
  const [val, setVal] = useState(data?.label ?? 'Text');
  const commit = (next) => {
    rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: next, editing: false } } : n)));
    window.dispatchEvent(new Event('rf-change'));
  };
  const fill = data?.fill || '#ffffff';
  const stroke = data?.stroke || '#000000';
  const sw = data?.strokeWidth ?? 2;
  return (
    <div style={{ ...baseNodeStyles(data), position: 'relative' }}
      onDoubleClick={() => rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, editing: true } } : n)))}>
      <NodeResizer isVisible={selected} minWidth={80} minHeight={50} color={stroke} lineStyle={{ borderColor: 'transparent' }} />
      <svg viewBox="0 0 160 80" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
        <polygon points="30,5 130,5 155,40 130,75 30,75 5,40" fill={fill} stroke={stroke} strokeWidth={sw} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6, pointerEvents: 'none' }}>
        {data?.editing ? (
          <input
            className="nodrag nopan nowheel"
            autoFocus
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={() => commit(val)}
            onKeyDown={(e) => e.key === 'Enter' && commit(val)}
            onMouseDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              border: '1px solid #ccc',
              borderRadius: 4,
              padding: '4px 6px',
              fontSize: 12,
              position: 'relative',
              zIndex: 5,
              background: '#fff',
              color: '#000',
              pointerEvents: 'all',
            }}
          />
        ) : (
          <span style={{ color: data?.text || '#000', fontSize: data?.fontSize || 12 }}>{data?.label ?? 'Hexagon'}</span>
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
    </div>
  );
}

// Generic SVG stamp node (renders imported SVGs as resizable nodes)
export function SvgStampNode({ id, data, selected }) {
  const rf = useReactFlow();
  return (
    <div style={{ ...baseNodeStyles(data), position: 'relative' }} onDoubleClick={() => rf.setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, editing: true } } : n)))}>
      <NodeResizer isVisible={selected} minWidth={40} minHeight={40} color={data?.stroke || '#000'} />
      <Handle id="top-in" type="target" position={Position.Top} />
      <Handle id="right-in" type="target" position={Position.Right} />
      <Handle id="bottom-in" type="target" position={Position.Bottom} />
      <Handle id="left-in" type="target" position={Position.Left} />
      <Handle id="top-out" type="source" position={Position.Top} />
      <Handle id="right-out" type="source" position={Position.Right} />
      <Handle id="bottom-out" type="source" position={Position.Bottom} />
      <Handle id="left-out" type="source" position={Position.Left} />
      <img src={data?.src} alt={data?.label || 'stamp'} style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
    </div>
  );
}

// Junction Node - small connector for branching connections
export function JunctionNode({ id, data, selected }) {
  const fill = data?.fill || '#000000';
  const stroke = data?.stroke || '#000000';
  const size = data?.size || 20;

  // Handles hidden by default, visible on hover or selection
  const handleStyle = {
    width: 8,
    height: 8,
    background: '#555',
    border: '2px solid #fff',
    borderRadius: '50%',
    opacity: selected ? 1 : 0,
    transition: 'opacity 0.2s',
  };

  return (
    <div
      className="junction-node"
      style={{
        width: size,
        height: size,
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        // Show handles on hover
        const handles = e.currentTarget.querySelectorAll('.react-flow__handle');
        handles.forEach(h => h.style.opacity = 1);
      }}
      onMouseLeave={(e) => {
        // Hide handles on leave if not selected
        if (!selected) {
          const handles = e.currentTarget.querySelectorAll('.react-flow__handle');
          handles.forEach(h => h.style.opacity = 0);
        }
      }}
    >
      <Handle id="top-in" type="target" position={Position.Top} style={handleStyle} />
      <Handle id="right-in" type="target" position={Position.Right} style={handleStyle} />
      <Handle id="bottom-in" type="target" position={Position.Bottom} style={handleStyle} />
      <Handle id="left-in" type="target" position={Position.Left} style={handleStyle} />
      <Handle id="top-out" type="source" position={Position.Top} style={handleStyle} />
      <Handle id="right-out" type="source" position={Position.Right} style={handleStyle} />
      <Handle id="bottom-out" type="source" position={Position.Bottom} style={handleStyle} />
      <Handle id="left-out" type="source" position={Position.Left} style={handleStyle} />
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: fill,
          border: `2px solid ${stroke}`,
          boxShadow: selected ? '0 0 0 2px #3b82f6' : 'none',
        }}
      />
    </div>
  );
}

// Node for adding editable text to the canvas
export function TextNode({ id, data, selected }) {
  const { setNodes } = useReactFlow();
  const [label, setLabel] = useState(data.label || 'Text');

  const handleStyle = {
    width: 8,
    height: 8,
    background: '#555',
    borderRadius: '50%',
  };

  const onBlur = (evt) => {
    const newLabel = evt.currentTarget.textContent;
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, label: newLabel } };
        }
        return node;
      })
    );
    window.dispatchEvent(new Event('rf-change'));
  };

  return (
    <div
      style={{
        padding: '10px',
        border: selected ? '1px solid #007bff' : '1px solid transparent',
        borderRadius: '2px',
        fontSize: data.fontSize || 16,
        color: data.text || '#000000',
        position: 'relative',
        minWidth: 30,
        minHeight: 20,
      }}
    >
      <Handle type="source" position={Position.Top} id="top-source" style={handleStyle} />
      <Handle type="source" position={Position.Right} id="right-source" style={handleStyle} />
      <Handle type="source" position={Position.Bottom} id="bottom-source" style={handleStyle} />
      <Handle type="source" position={Position.Left} id="left-source" style={handleStyle} />
      <Handle type="target" position={Position.Top} id="top-target" style={handleStyle} />
      <Handle type="target" position={Position.Right} id="right-target" style={handleStyle} />
      <Handle type="target" position={Position.Bottom} id="bottom-target" style={handleStyle} />
      <Handle type="target" position={Position.Left} id="left-target" style={handleStyle} />

      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={onBlur}
        style={{ outline: 'none', cursor: 'text' }}
      >
        {label}
      </div>
    </div>
  );
}

// Custom editable edge with inline label + options menu
export function EditableEdge(edgeProps) {
  const {
    id,
    source, target,
    sourceHandle, targetHandle,
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
    style,
    markerStart, markerEnd,
    label,
    labelStyle,
    selected,
    data,
  } = edgeProps;
  const rf = useReactFlow();
  const [edgePath, labelX, labelY] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
  const [editing, setEditing] = useState(false);
  const initialLabel = label ?? data?.label ?? '';
  const [text, setText] = useState(initialLabel);
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setText(label ?? data?.label ?? '');
  }, [label, data?.label]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (!menuRef.current?.contains(e.target) && !btnRef.current?.contains(e.target)) {
        setOpen(false);
        setEditing(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setEditing(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const updateEdge = (mapper) => {
    rf.setEdges((eds) =>
      eds.map((e) => (e.id === id ? mapper(e) : e))
    );
    window.dispatchEvent(new Event('rf-change'));
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} markerStart={markerStart} style={style} />
      <EdgeLabelRenderer>
        <div
          ref={containerRef}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
          onDoubleClick={() => setEditing(true)}
        >
          {editing ? (
            <input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={() => {
                updateEdge((e) => ({ ...e, data: { ...e.data, label: text } }));
                setEditing(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateEdge((e) => ({ ...e, data: { ...e.data, label: text } }));
                  setEditing(false);
                }
              }}
              style={{ width: 60, textAlign: 'center', border: '1px solid #ccc', borderRadius: 4, padding: 2, color: '#000', background: '#fff' }}
            />
          ) : (
            <div style={{ padding: '2px 5px', borderRadius: 4, background: 'rgba(255,255,255,0.8)' }}>
              {text || ''}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}




