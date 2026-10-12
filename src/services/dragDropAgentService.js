/**
 * Drag and Drop Agent Service
 * Integrates with https://drag-and-drop-agent-1.onrender.com
 * POST /api/agent/chat (application/json)
 * POST /api/agent/voice (multipart/form-data)
 */

export const AGENT_BASE_URL = "https://drag-and-drop-agent-1.onrender.com";
export const AGENT_API_URL = `${AGENT_BASE_URL}/api/agent/chat`;
export const AGENT_CHAT_URL = `${AGENT_BASE_URL}/api/agent/chat`;
export const AGENT_VOICE_URL = `${AGENT_BASE_URL}/api/agent/voice`;

import { setTabSymbolsAndConnections } from "../store/slices/simulationSlice.js";

/**
 * Builds canvas_state conforming to the required API schema:
 * {
 *   "tabId": <active tab id>,
 *   "tabName": "<tab name>",
 *   "components": [{"id": <instance id>, "name": "...", "label": "...", "x": 0, "y": 0}],
 *   "connections": [{"connectionKey": "<id1>-<id2>", "sourceId": <id1>, "targetId": <id2>}]
 * }
 * 
 * @param {Array} droppedItems - list of components placed on canvas
 * @param {Array} connections - list of wire connections
 * @param {object} activeTab - active tab object
 * @param {string|number} activeTabId - active tab identifier
 * @returns {object} canvas_state
 */
export function buildCanvasState(droppedItems = [], connections = [], activeTab = null, activeTabId = null) {
  const tabId = activeTabId || activeTab?.id || 1;
  const tabName = activeTab?.name || `Simulation ${tabId}`;

  const components = (droppedItems || []).map((item) => {
    let numId = item.id;
    if (typeof item.id === "string" && !isNaN(Number(item.id))) {
      numId = Number(item.id);
    }
    const name = item.symbol?.name || item.name || "";
    const label = item.symbol?.label || item.label || name || "";
    const x = Math.round(item.x ?? 0);
    const y = Math.round(item.y ?? 0);
    return {
      id: numId,
      name,
      label,
      x,
      y
    };
  });

  const formattedConnections = (connections || []).map((conn) => {
    if (typeof conn === "string") {
      const parts = conn.split("-");
      const sId = parts[0] ? (!isNaN(Number(parts[0])) ? Number(parts[0]) : parts[0]) : null;
      const tId = parts[1] ? (!isNaN(Number(parts[1])) ? Number(parts[1]) : parts[1]) : null;
      return {
        connectionKey: conn,
        sourceId: sId,
        targetId: tId
      };
    }
    if (conn && typeof conn === "object") {
      const key = conn.connectionKey || `${conn.sourceId}-${conn.targetId}`;
      return {
        connectionKey: key,
        sourceId: conn.sourceId,
        targetId: conn.targetId
      };
    }
    return null;
  }).filter(Boolean);

  return {
    tabId,
    tabName,
    components,
    connections: formattedConnections
  };
}

/**
 * Send command to the Drag-and-Drop Agent Chat API
 * POST /api/agent/chat (application/json)
 * Body: { "command": "<user text>", "canvas_state": { ... } }
 * 
 * @param {string} command - Natural language command (e.g. "Add ESP32")
 * @param {object|null} canvasState - Canvas state object
 * @param {number} timeoutMs - Request timeout in milliseconds (default: 45000)
 * @returns {Promise<{ status: string, message: string, commands: Array, results: Array }>}
 */
export async function sendAgentCommand(command, canvasState = null, timeoutMs = 45000) {
  const payload = {
    command: String(command).trim(),
    canvas_state: canvasState || {
      tabId: 1,
      tabName: "Simulation 1",
      components: [],
      connections: []
    }
  };

  // 1. Try Electron IPC if available (native Node.js fetch, bypasses browser CORS)
  if (typeof window !== "undefined" && window.electronAPI?.agent?.chat) {
    try {
      const ipcResult = await window.electronAPI.agent.chat(payload);
      if (ipcResult && ipcResult.success && ipcResult.data) {
        return ipcResult.data;
      }
    } catch (ipcErr) {
      console.warn("[AgentService] Electron IPC fetch failed, falling back to HTTP:", ipcErr);
    }
  }

  // 2. HTTP endpoints to try (Vite proxy first to bypass local CORS, then direct URL)
  const endpoints = [
    "/api/agent/chat",
    AGENT_CHAT_URL
  ];

  let lastError = null;

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timer);

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        const errorText = await response.text().catch(() => "");
        console.warn(`[AgentService] POST ${url} returned ${response.status}: ${errorText}`);
      }
    } catch (err) {
      lastError = err;
      console.warn(`[AgentService] POST ${url} attempt failed:`, err.message);
    }
  }

  throw lastError || new Error("Failed to connect to Drag and Drop Agent API");
}

/**
 * Send recorded audio to the Drag-and-Drop Agent Voice API
 * POST /api/agent/voice (multipart/form-data)
 * Form field: audio = <recorded audio file> (webm / ogg / mp4 / wav / mp3 / flac, max 25 MB, English only)
 * 
 * @param {Blob|File} audioBlob - Recorded audio file
 * @param {number} timeoutMs - Request timeout in milliseconds (default: 60000)
 * @returns {Promise<{ status: string, message: string, commands: Array, results: Array, transcript: string, normalized_command: string }>}
 */
export async function sendAgentVoiceCommand(audioBlob, timeoutMs = 60000) {
  if (!audioBlob) {
    throw new Error("No audio recording provided for voice command");
  }

  // Check 25 MB size limit
  const maxBytes = 25 * 1024 * 1024;
  if (audioBlob.size > maxBytes) {
    throw new Error("Audio file exceeds maximum size limit of 25 MB");
  }

  const formData = new FormData();
  let filename = "voice_command.webm";
  if (audioBlob.name) {
    filename = audioBlob.name;
  } else if (audioBlob.type?.includes("ogg")) {
    filename = "voice_command.ogg";
  } else if (audioBlob.type?.includes("wav")) {
    filename = "voice_command.wav";
  } else if (audioBlob.type?.includes("mp4")) {
    filename = "voice_command.mp4";
  } else if (audioBlob.type?.includes("mp3")) {
    filename = "voice_command.mp3";
  } else if (audioBlob.type?.includes("flac")) {
    filename = "voice_command.flac";
  }

  formData.append("audio", audioBlob, filename);

  const endpoints = [
    "/api/agent/voice",
    AGENT_VOICE_URL
  ];

  let lastError = null;

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      // Do NOT set Content-Type header manually for FormData, browser sets multipart/form-data boundary
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timer);

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        const errorText = await response.text().catch(() => "");
        console.warn(`[AgentService] POST ${url} returned ${response.status}: ${errorText}`);
      }
    } catch (err) {
      lastError = err;
      console.warn(`[AgentService] POST ${url} attempt failed:`, err.message);
    }
  }

  throw lastError || new Error("Failed to connect to Drag and Drop Agent Voice API");
}

/**
 * Find matching symbol from symbolsData for a given component identifier
 * 
 * @param {string} componentId - Component name or ID (e.g. "ESP32", "esp32", "Temperature Sensor")
 * @param {Array} symbolsData - Categories of symbols from Simulation.jsx
 * @returns {object|null} - Symbol object ready for canvas placement
 */
export function findSymbolForComponent(componentId, symbolsData = []) {
  if (!componentId) return null;

  const rawQuery = String(componentId).trim();
  const cleanQ = rawQuery.toLowerCase().replace(/[^a-z0-9]/g, "");

  // Flatten symbols from categories
  const allSymbols = (symbolsData || []).flatMap(category => category.items || []);

  if (allSymbols.length === 0) return null;

  // 1. Special Case: ESP32 / Microcontroller / Arduino
  if (
    cleanQ.includes("esp32") ||
    cleanQ.includes("esp") ||
    cleanQ.includes("microcontroller") ||
    cleanQ.includes("arduino") ||
    cleanQ.includes("mcu") ||
    cleanQ.includes("nodemcu")
  ) {
    const mc = allSymbols.find(s => s.name?.toLowerCase().includes("microcontroller"));
    if (mc) {
      return {
        ...mc,
        name: "Microcontroller",
        label: cleanQ.includes("esp") ? "ESP32" : (mc.label || mc.name)
      };
    }
  }

  // 2. Special Case: LED
  if (cleanQ === "led" || cleanQ.includes("rgbled") || cleanQ.includes("rgb")) {
    const rgb = allSymbols.find(s => s.name?.toLowerCase().includes("rgb led")) ||
                allSymbols.find(s => s.name?.toLowerCase().includes("redlight")) ||
                allSymbols.find(s => s.name?.toLowerCase().includes("green light")) ||
                allSymbols.find(s => s.name?.toLowerCase().includes("blue light"));
    if (rgb) {
      return { ...rgb, label: "LED" };
    }
  }

  // 3. Exact normalized match
  const exact = allSymbols.find(s => {
    const sClean = s.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    return sClean === cleanQ;
  });
  if (exact) {
    return { ...exact, label: rawQuery };
  }

  // 4. Substring normalized match
  const sub = allSymbols.find(s => {
    const sClean = s.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    return sClean.includes(cleanQ) || cleanQ.includes(sClean);
  });
  if (sub) {
    return { ...sub, label: rawQuery };
  }

  // 5. Token overlap score
  const qTokens = rawQuery.toLowerCase().split(/\s+/).filter(t => t.length > 1);
  let best = null;
  let bestScore = 0;

  for (const s of allSymbols) {
    const sTokens = s.name.toLowerCase().split(/\s+/).filter(t => t.length > 1);
    let score = 0;
    for (const qt of qTokens) {
      if (sTokens.includes(qt)) {
        score += 3;
      } else if (sTokens.some(st => st.includes(qt) || qt.includes(st))) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = s;
    }
  }

  if (best && bestScore > 0) {
    return { ...best, label: rawQuery };
  }

  // 6. Fallback to first available symbol with custom label if nothing else matched
  const fallback = allSymbols[0];
  return {
    ...fallback,
    name: rawQuery,
    label: rawQuery
  };
}

/**
 * Execute agent commands on the simulation canvas
 * 
 * @param {Array} commands - commands array from agent response
 * @param {Array} results - results array from agent response
 * @param {object} context - context callbacks: { symbolsData, onAddSymbolAtPosition, onRemoveSymbol, onMoveSymbol, onConnectSymbols, onDisconnectSymbols, connections, droppedItems, activeTabId, dispatch }
 * @returns {Array} executedActions - list of executed actions
 */
export function executeAgentCommands(commands = [], results = [], context = {}) {
  const {
    symbolsData = [],
    onAddSymbolAtPosition,
    onRemoveSymbol,
    onMoveSymbol,
    onConnectSymbols,
    onDisconnectSymbols,
    connections = [],
    droppedItems = [],
    activeTabId = null,
    dispatch = null
  } = context;

  const executedActions = [];

  if (!Array.isArray(commands) || commands.length === 0) {
    return executedActions;
  }

  commands.forEach((cmd, idx) => {
    const rawMethod = String(cmd.method || "");
    const method = rawMethod.toLowerCase().replace(/[^a-z0-9]/g, "");
    const params = cmd.params || {};

    if (
      method === "canvasaddcomponent" ||
      method === "addcomponent"
    ) {
      let componentId = params.componentId || params.id;

      // Also check if search_component tool in results has the resolved name or id
      const searchTool = results.find(
        (r) => (r.tool === "search_component" || r.name === "search_component") && (r.result?.component?.name || r.result?.component?.id)
      );
      if (!componentId && searchTool) {
        componentId = searchTool.result.component.name || searchTool.result.component.id;
      }

      const symbol = findSymbolForComponent(componentId, symbolsData);
      if (symbol && typeof onAddSymbolAtPosition === "function") {
        const pos = params.position || { x: 200, y: 200 };
        const added = onAddSymbolAtPosition(symbol, pos);
        executedActions.push({
          method: "canvas.addComponent",
          componentId: componentId || symbol.name,
          name: symbol.label || symbol.name,
          position: pos,
          instanceId: added?.id,
          success: true
        });
      }
    } else if (
      method === "canvasremovecomponent" ||
      method === "canvasdeletecomponent" ||
      method === "removecomponent" ||
      method === "deletecomponent"
    ) {
      const targetId = params.componentId || params.id;
      if (typeof onRemoveSymbol === "function" && targetId) {
        const removed = onRemoveSymbol(targetId);
        executedActions.push({
          method: "canvas.removeComponent",
          componentId: targetId,
          success: !!removed
        });
      }
    } else if (
      method === "canvasmovecomponent" ||
      method === "movecomponent"
    ) {
      const targetId = params.componentId || params.id;
      const pos = params.position;
      if (typeof onMoveSymbol === "function" && targetId && pos) {
        const moved = onMoveSymbol(targetId, pos);
        executedActions.push({
          method: "canvas.moveComponent",
          componentId: targetId,
          position: pos,
          success: !!moved
        });
      }
    } else if (
      method === "canvasconnectcomponents" ||
      method === "canvasaddconnection" ||
      method === "connectcomponents" ||
      method === "addconnection"
    ) {
      const source = params.sourceComponentId || params.source;
      const target = params.targetComponentId || params.target;
      if (typeof onConnectSymbols === "function" && source && target) {
        const conn = onConnectSymbols(source, target);
        executedActions.push({
          method: "canvas.connectComponents",
          source,
          target,
          name: `${source} ↔ ${target}`,
          success: !!conn
        });
      }
    } else if (
      method === "canvasdisconnectcomponents" ||
      method === "canvasremoveconnection" ||
      method === "disconnectcomponents" ||
      method === "removeconnection"
    ) {
      const rawKey = params.connectionKey;
      let targetKey = rawKey;

      // 1. Check if raw key or reversed key exists directly in connections
      if (targetKey && !connections.includes(targetKey)) {
        const rev = targetKey.split("-").reverse().join("-");
        if (connections.includes(rev)) {
          targetKey = rev;
        }
      }

      // 2. Resolve via numeric/string sourceId & targetId
      if (!targetKey || !connections.includes(targetKey)) {
        const sId = params.sourceId ?? params.source;
        const tId = params.targetId ?? params.target;
        if (sId && tId) {
          const k1 = `${sId}-${tId}`;
          const k2 = `${tId}-${sId}`;
          if (connections.includes(k1)) targetKey = k1;
          else if (connections.includes(k2)) targetKey = k2;
        }
      }

      // 3. Resolve via sourceComponentId & targetComponentId (e.g. "ESP32", "Temperature Sensor")
      if (!targetKey || !connections.includes(targetKey)) {
        const srcName = params.sourceComponentId || params.source;
        const tgtName = params.targetComponentId || params.target;
        if (srcName && tgtName && Array.isArray(droppedItems)) {
          const sStr = String(srcName).toLowerCase().trim();
          const tStr = String(tgtName).toLowerCase().trim();
          const sItem = droppedItems.find(i =>
            String(i.id).toLowerCase() === sStr ||
            (i.symbol?.name && i.symbol.name.toLowerCase().includes(sStr)) ||
            (i.symbol?.label && i.symbol.label.toLowerCase().includes(sStr)) ||
            (i.name && i.name.toLowerCase().includes(sStr)) ||
            (i.label && i.label.toLowerCase().includes(sStr))
          );
          const tItem = droppedItems.find(i =>
            String(i.id).toLowerCase() === tStr ||
            (i.symbol?.name && i.symbol.name.toLowerCase().includes(tStr)) ||
            (i.symbol?.label && i.symbol.label.toLowerCase().includes(tStr)) ||
            (i.name && i.name.toLowerCase().includes(tStr)) ||
            (i.label && i.label.toLowerCase().includes(tStr))
          );
          if (sItem && tItem) {
            const k1 = `${sItem.id}-${tItem.id}`;
            const k2 = `${tItem.id}-${sItem.id}`;
            if (connections.includes(k1)) targetKey = k1;
            else if (connections.includes(k2)) targetKey = k2;
          }
        }
      }

      let removedKey = null;

      // Disconnect via provided callback if available
      if (typeof onDisconnectSymbols === "function") {
        removedKey = onDisconnectSymbols(targetKey || rawKey || params.sourceComponentId, params.targetComponentId || params.targetId || params.target);
      }

      // Disconnect via Redux if not handled by callback
      if (!removedKey && targetKey && Array.isArray(connections)) {
        const next = connections.filter(c => c !== targetKey && c !== rawKey);
        if (next.length < connections.length) {
          if (typeof dispatch === "function") {
            dispatch(setTabSymbolsAndConnections({ tabId: activeTabId, symbols: droppedItems, connections: next }));
          }
          removedKey = targetKey;
        }
      }

      if (removedKey) {
        const sourceName = params.sourceComponentId || params.source || "ESP32";
        const targetName = params.targetComponentId || params.target || "Temperature Sensor";
        executedActions.push({
          ...cmd,
          method: "canvas.disconnectComponents",
          connectionKey: removedKey,
          source: sourceName,
          target: targetName,
          name: `${sourceName} ↔ ${targetName}`,
          success: true
        });
      }
    }
  });

  return executedActions;
}
