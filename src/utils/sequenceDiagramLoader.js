
export const loadSequenceDiagram = async (fileName = '/device_sequence_diagram.json') => {
    try {
        const response = await fetch(fileName);
        if (!response.ok) {
            throw new Error(`Failed to load sequence diagram: ${response.statusText}`);
        }
        const data = await response.json();
        return layoutSequenceDiagram(data);
    } catch (error) {
        console.error("Error loading sequence diagram:", error);
        return null;
    }
};

const layoutSequenceDiagram = (data) => {
    // Normalize schema to handle both formats
    const sequenceData = data.sequenceDiagram;
    const actors = sequenceData.actors || sequenceData.participants || [];
    const messages = sequenceData.messages || sequenceData.interactions || [];

    const nodes = [];
    const edges = [];

    const actorXSpacing = 400; // Wider spacing for clarity
    const startY = 50;
    const stepHeight = 90; // Increased spacing for larger text

    // Create Actor Nodes
    actors.forEach((actor, index) => {
        nodes.push({
            id: actor.id,
            type: 'genericShape',
            data: {
                shapeId: 'uml-seq-actor',
                label: actor.name,
                fill: '#ffffff',
                stroke: '#000000',
                strokeWidth: 2
            },
            position: { x: index * actorXSpacing, y: startY },
            style: {
                width: 160,
                height: 60
            }
        });

        // Lifeline (Line)
        const lifelineHeight = (messages.length + 1) * stepHeight;
        nodes.push({
            id: `${actor.id}-lifeline`,
            type: 'genericShape',
            data: {
                shapeId: 'uml-seq-lifeline',
                label: '',
                strokeDasharray: '4 4'
            },
            position: { x: index * actorXSpacing + 80, y: startY + 60 }, // Center of 160 is 80
            style: {
                width: 20, // Specific width for lifeline shape
                height: lifelineHeight,
            },
            draggable: false,
            selectable: false,
            zIndex: -1
        });
    });

    // Process Messages
    messages.forEach((msg, index) => {
        const yPos = startY + 80 + (index * stepHeight);

        const sourceActorIndex = actors.findIndex(a => a.id === msg.from);
        const targetActorIndex = actors.findIndex(a => a.id === msg.to);

        if (sourceActorIndex === -1 || targetActorIndex === -1) return;

        // Determine direction for anchors
        const isRightDir = targetActorIndex > sourceActorIndex;

        // Use the lifeline nodes as source/target
        const sourceNodeId = `${msg.from}-lifeline`;
        const targetNodeId = `${msg.to}-lifeline`;

        // Normalize message properties
        const label = msg.action || msg.message || "";
        const stateChange = msg.stateChange || msg.state || null;

        // Edge - Editable and Straight
        edges.push({
            id: `edge_${msg.step}`,
            source: sourceNodeId,
            target: targetNodeId,
            // We don't specify handles here; genericShape lifeline handles are dynamic. 
            // Ideally we'd calculate the handle ID based on percentage, but for now allow auto-attach 
            // or we use points as before if handles are tricky.
            // Reverting to "points" approach for precise positioning if handles aren't easy to target programmatically.
            // BUT, the user wants "drag and drop" behavior.
            // Let's use the points approach for initial layout, but make them invisible "junction" nodes
            // or just tiny connection nodes which is what the previous code effectively did.
            // Actually, to make it behave like "drag and drop", we should probably link to the lifeline handles.
            // But calculating the exact handle ID `v-${pct}` is hard without precise height math.
            // Let's stick to the "Point" nodes for now, but ensure they look clean.
            label: label,
            type: 'editable',
            markerEnd: { type: 'arrowclosed', color: '#000', width: 20, height: 20 },
            style: { stroke: '#000', strokeWidth: 2 },
            labelStyle: { fill: '#000', fontSize: 14, fontWeight: 'bold', background: 'white', padding: 4 },
            data: {
                label: label,
                pathType: 'straight',
                showLabel: true
            }
        });

        // Wait, if we use sourceNodeId as the lifeline, the edge will snap to the center/top/bottom of the lifeline node, 
        // not the specific Y position.
        // So we MUST use the "invisible point" nodes (Anchors) paradigm for *programmatic* layout 
        // to force the exact Y position.
        // This is still "drag and drop" compatible in the sense that the user can later delete these edges 
        // and draw new ones using the handles if they want.

        // Let's restore the Anchor Nodes logic but keep it clean.

        const anchorSourceId = `point_${msg.from}_${msg.step}`;
        const anchorTargetId = `point_${msg.to}_${msg.step}`;

        nodes.push({
            id: anchorSourceId,
            type: 'default',
            data: { label: '' },
            position: { x: sourceActorIndex * actorXSpacing + 80, y: yPos },
            style: { width: 1, height: 1, opacity: 0, padding: 0, border: 'none' },
            draggable: false, selectable: false
        });

        nodes.push({
            id: anchorTargetId,
            type: 'default',
            data: { label: '' },
            position: { x: targetActorIndex * actorXSpacing + 80, y: yPos },
            style: { width: 1, height: 1, opacity: 0, padding: 0, border: 'none' },
            draggable: false, selectable: false
        });

        // Override edge source/target to use anchors
        edges[edges.length - 1].source = anchorSourceId;
        edges[edges.length - 1].target = anchorTargetId;


        // Handle Data/Payload display - Editable Text Node
        if (msg.data && msg.data.length > 0) {
            const noteX = isRightDir
                ? (sourceActorIndex * actorXSpacing) + 110
                : (targetActorIndex * actorXSpacing) + 110;

            nodes.push({
                id: `data_${msg.step}`,
                type: 'text',
                data: { label: `[ ${msg.data.join(', ')} ]`, fontSize: 13, text: '#333' },
                position: { x: noteX + 150, y: yPos - 15 },
                style: {
                    background: '#fff',
                    padding: '4px',
                    border: 'none',
                    width: 'auto',
                    fontStyle: 'italic',
                    fontWeight: 600,
                    fontSize: '13px',
                    minWidth: 50
                }
            });
        }

        // State Change Note (Yellow Box) - Using Generic Shape 'uml-seq-note'
        if (stateChange) {
            nodes.push({
                id: `state_${msg.step}`,
                type: 'genericShape',
                data: {
                    shapeId: 'uml-seq-note',
                    label: `State = ${stateChange}`,
                    fill: '#ffff88',
                    stroke: '#000000',
                    fontSize: 14
                },
                position: { x: targetActorIndex * actorXSpacing + 90, y: yPos - 10 },
                style: {
                    width: 150,
                    height: 50,
                }
            });
        }
    });

    return { nodes, edges, viewport: { x: 0, y: 0, zoom: 0.7 } };
};
