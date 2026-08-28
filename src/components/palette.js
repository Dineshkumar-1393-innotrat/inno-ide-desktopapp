import { Position } from 'reactflow';

export const PALETTE_GROUPS = [
  {
    id: 'flowchart',
    name: 'Flowchart',
    items: [
      { id: 'flow-rectangle', type: 'process', name: 'Rectangle', icon: { viewBox: '0 0 100 60', path: 'M0 0 H100 V60 H0 Z' } },
      { id: 'flow-diamond', type: 'decision', name: 'Diamond', icon: { viewBox: '0 0 100 100', path: 'M50 0 L100 50 L50 100 L0 50 Z' } },
      { id: 'flow-oval', type: 'terminator', name: 'Oval', icon: { viewBox: '0 0 100 60', path: 'M50,0 A50,30 0 1,0 50,60 A50,30 0 1,0 50,0' } },
      { id: 'flow-parallelogram', type: 'data', name: 'Parallelogram', icon: { viewBox: '0 0 100 60', path: 'M20 0 H100 L80 60 H0 Z' } },
      { id: 'flow-triangle', type: 'triangle', name: 'Triangle', icon: { viewBox: '0 0 100 86.6', path: 'M50 0 L100 86.6 H0 Z' } },
      { id: 'flow-cylinder', type: 'database', name: 'Cylinder', icon: { viewBox: '0 0 100 100', path: 'M50 0 C22.386 0 0 15 0 15 V85 C0 85 22.386 100 50 100 C77.614 100 100 85 100 85 V15 C100 15 77.614 0 50 0 Z M0 15 C0 15 22.386 30 50 30 C77.614 30 100 15 100 15' } },
      { id: 'flow-circle', type: 'ellipse', name: 'Circle', icon: { viewBox: '0 0 100 100', path: 'M50,0 C22.386,0 0,22.386 0,50 C0,77.614 22.386,100 50,100 C77.614,100 100,77.614 100,50 C100,22.386 77.614,0 50,0 Z' } },
      { id: 'flow-document-wavy', type: 'document', name: 'Document', icon: { viewBox: '0 0 100 100', path: 'M0 0 H100 V80 C 75 70, 25 90, 0 80 Z' } },
      { id: 'flow-manual-input', type: 'manualInput', name: 'Manual Input', icon: { viewBox: '0 0 100 60', path: 'M0 60 H100 V0 H20 Z' } },
      { id: 'flow-hexagon', type: 'hexagon', name: 'Hexagon', icon: { viewBox: '0 0 100 86.6', path: 'M25 0 L75 0 L100 43.3 L75 86.6 H25 L0 43.3 Z' } },
    ]
  },
  {
    id: 'blockdiagram',
    name: 'Block Diagram',
    items: [
      { id: 'block-process', type: 'process', name: 'Process', icon: { viewBox: '0 0 100 60', path: 'M0 0 H100 V60 H0 Z' } },
      { id: 'block-decision', type: 'decision', name: 'Decision', icon: { viewBox: '0 0 100 100', path: 'M50 0 L100 50 L50 100 L0 50 Z' } },
      { id: 'block-data', type: 'data', name: 'Data', icon: { viewBox: '0 0 100 60', path: 'M20 0 H100 L80 60 H0 Z' } },
      { id: 'block-terminal', type: 'terminator', name: 'Terminal', icon: { viewBox: '0 0 100 60', path: 'M20 0 H80 Q100 0 100 20 V40 Q100 60 80 60 H20 Q0 60 0 40 V20 Q0 0 20 0 Z' } },
    ]
  }
];

  'Block Diagram': [
    { 
      id: 'block-process', 
      name: 'Process', 
      icon: { viewBox: '0 0 100 60', path: 'M0 0 H100 V60 H0 Z' }, 
      anchors: [ {x:0,y:0},{x:50,y:0},{x:100,y:0},{x:100,y:30},{x:100,y:60},{x:50,y:60},{x:0,y:60},{x:0,y:30} ],
      getHandles: () => [
        { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
        { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
        { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
        { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
      ]
    },
    { 
      id: 'block-decision', 
      name: 'Decision', 
      icon: { viewBox: '0 0 100 100', path: 'M50 0 L100 50 L50 100 L0 50 Z' }, 
      anchors: [ {x:50,y:0},{x:100,y:50},{x:50,y:100},{x:0,y:50} ],
      getHandles: () => [
        { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
        { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
        { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
        { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
      ]
    },
    { 
      id: 'block-data', 
      name: 'Data', 
      icon: { viewBox: '0 0 100 60', path: 'M0 0 H100 V60 H0 Z M0 10 H100 M0 20 H100 M0 30 H100 M0 40 H100 M0 50 H100' }, 
      anchors: [ {x:0,y:0},{x:50,y:0},{x:100,y:0},{x:100,y:30},{x:100,y:60},{x:50,y:60},{x:0,y:60},{x:0,y:30} ],
      getHandles: () => [
        { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
        { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
        { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
        { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
      ]
    },
    { 
      id: 'block-terminal', 
      name: 'Terminal', 
      icon: { viewBox: '0 0 100 60', path: 'M20 0 H80 Q100 0 100 20 V40 Q100 60 80 60 H20 Q0 60 0 40 V20 Q0 0 20 0 Z' }, 
      anchors: [ {x:20,y:0},{x:50,y:0},{x:80,y:0},{x:100,y:20},{x:100,y:40},{x:80,y:60},{x:50,y:60},{x:20,y:60},{x:0,y:40},{x:0,y:20} ],
      getHandles: () => [
        { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
        { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
        { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
        { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
      ]
    },
    { 
      id: 'block-connector', 
      name: 'Connector', 
      icon: { viewBox: '0 0 100 100', path: 'M50 0 A50 50 0 1 0 50.001 0 Z' }, 
      anchors: [ {x:50,y:0},{x:100,y:50},{x:50,y:100},{x:0,y:50} ],
      getHandles: () => [
        { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
        { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
        { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
        { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
      ]
    },
    { 
      id: 'block-off-page', 
      name: 'Off Page', 
      icon: { viewBox: '0 0 100 60', path: 'M0 0 H100 V60 H0 Z M0 10 H100 M0 20 H100 M0 30 H100 M0 40 H100 M0 50 H100 M10 0 V60 M20 0 V60 M30 0 V60 M40 0 V60 M50 0 V60 M60 0 V60 M70 0 V60 M80 0 V60 M90 0 V60' }, 
      anchors: [ {x:0,y:0},{x:50,y:0},{x:100,y:0},{x:100,y:30},{x:100,y:60},{x:50,y:60},{x:0,y:60},{x:0,y:30} ],
      getHandles: () => [
        { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
        { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
        { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
        { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
      ]
    },
    { 
      id: 'block-summing', 
      name: 'Summing', 
      icon: { viewBox: '0 0 100 100', path: 'M50 0 A50 50 0 1 0 50.001 0 Z M50 20 A30 30 0 1 0 50.001 20 Z' }, 
      anchors: [ {x:50,y:0},{x:100,y:50},{x:50,y:100},{x:0,y:50} ],
      getHandles: () => [
        { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
        { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
        { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
        { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
      ]
    },
    { 
      id: 'block-delay', 
      name: 'Delay', 
      icon: { viewBox: '0 0 100 60', path: 'M0 0 H100 V60 H0 Z M0 15 H100 M0 30 H100 M0 45 H100' }, 
      anchors: [ {x:0,y:0},{x:50,y:0},{x:100,y:0},{x:100,y:30},{x:100,y:60},{x:50,y:60},{x:0,y:60},{x:0,y:30} ],
      getHandles: () => [
        { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
        { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
        { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
        { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
      ]
    }
    { id: 'flow-cylinder', name: 'Cylinder', icon: { viewBox: '0 0 100 100', path: 'M50 0 C22.386 0 0 15 0 15 V85 C0 85 22.386 100 50 100 C77.614 100 100 85 100 85 V15 C100 15 77.614 0 50 0 Z M0 15 C0 15 22.386 30 50 30 C77.614 30 100 15 100 15' }, anchors: [ {x:50,y:0},{x:100,y:15},{x:100,y:85},{x:50,y:100},{x:0,y:85},{x:0,y:15} ], getHandles: () => [
        { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
        { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
        { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
        { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
      ] },
    { id: 'flow-circle', name: 'Circle', icon: { viewBox: '0 0 100 100', path: 'M50,0 C22.386,0 0,22.386 0,50 C0,77.614 22.386,100 50,100 C77.614,100 100,77.614 100,50 C100,22.386 77.614,0 50,0 Z' }, anchors: [ {x:50,y:0},{x:100,y:50},{x:50,y:100},{x:0,y:50} ], getHandles: () => [
        { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
        { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
        { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
        { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
      ] },
    { id: 'flow-right-arrow', name: 'Right Arrow', icon: { viewBox: '0 0 100 60', path: 'M0 20 H70 L70 0 L100 30 L70 60 V40 H0 Z' }, anchors: [ {x:0,y:30},{x:70,y:30},{x:100,y:30},{x:70,y:0},{x:70,y:60} ], getHandles: () => [
        { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
        { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
        { id: 'top', position: Position.Top, style: { top: '0%', left: '70%', transform: 'translate(-50%, -50%)' } },
        { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '70%', transform: 'translate(-50%, -50%)' } },
      ] },
    { id: 'flow-paper-tape', name: 'Paper Tape', icon: { viewBox: '0 0 100 120', path: 'M0 20 C 25 10, 75 10, 100 20 V 100 C 75 110, 25 110, 0 100 Z' } }
  ],
  'Block Diagram': [
    { 
      id: 'block-process', 
      name: 'Process', 
      icon: { viewBox: '0 0 100 60', path: 'M0 0 H100 V60 H0 Z' }, 
      getHandles: () => [
        { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
        { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
        { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
        { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
      ]
    },
    { 
      id: 'block-decision', 
      name: 'Decision', 
      icon: { viewBox: '0 0 100 100', path: 'M50 0 L100 50 L50 100 L0 50 Z' }, 
      getHandles: () => [
        { id: 'top', position: Position.Top, style: { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' } },
        { id: 'bottom', position: Position.Bottom, style: { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' } },
        { id: 'left', position: Position.Left, style: { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' } },
        { id: 'right', position: Position.Right, style: { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' } },
      ]
    }
  ]
};