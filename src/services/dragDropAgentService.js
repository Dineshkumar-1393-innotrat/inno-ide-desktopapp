/**
 * Drag and Drop Agent Service
 * Integrates with https://drag-and-drop-agent-1.onrender.com/api/agent/chat
 */

export const AGENT_API_URL = "https://drag-and-drop-agent-1.onrender.com/api/agent/chat";

/**
 * Send command to the Drag-and-Drop Agent API
 * Supports Electron IPC (no CORS), Vite Proxy, and direct HTTP
 * 
 * @param {string} command - Natural language command (e.g. "Add ESP32")
 * @param {number} timeoutMs - Request timeout in milliseconds (default: 30000)
 * @returns {Promise<{ status: string, message: string, commands: Array, results: Array }>}
 */
export async function sendAgentCommand(command, timeoutMs = 30000) {
  const payload = { command: String(command).trim() };

  // 1. Try Electron IPC if available (native Node.js fetch, bypasses any browser CORS)
  if (typeof window !== "undefined" && window.electronAPI?.agent?.chat) {
    try {
      const ipcResult = await window.electronAPI.agent.chat(payload.command);
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
    AGENT_API_URL
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
 * @param {object} context - context callbacks: { symbolsData, onAddSymbolAtPosition, onRemoveSymbol, onMoveSymbol, onConnectSymbols }
 * @returns {Array} executedActions - list of executed actions
 */
export function executeAgentCommands(commands = [], results = [], context = {}) {
  const {
    symbolsData = [],
    onAddSymbolAtPosition,
    onRemoveSymbol,
    onMoveSymbol,
    onConnectSymbols
  } = context;

  const executedActions = [];

  if (!Array.isArray(commands) || commands.length === 0) {
    return executedActions;
  }

  commands.forEach((cmd, idx) => {
    const method = cmd.method;
    const params = cmd.params || {};

    if (method === "canvas.addComponent") {
      let componentId = params.componentId;

      // Also check if search_component tool in results has the resolved name
      const searchTool = results.find(r => r.tool === "search_component" && r.result?.component?.name);
      if (!componentId && searchTool) {
        componentId = searchTool.result.component.name;
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
    } else if (method === "canvas.removeComponent" || method === "canvas.deleteComponent") {
      const targetId = params.componentId || params.id;
      if (typeof onRemoveSymbol === "function" && targetId) {
        const removed = onRemoveSymbol(targetId);
        executedActions.push({
          method: "canvas.removeComponent",
          componentId: targetId,
          success: !!removed
        });
      }
    } else if (method === "canvas.moveComponent") {
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
    } else if (method === "canvas.connectComponents" || method === "canvas.addConnection") {
      const source = params.sourceComponentId || params.source;
      const target = params.targetComponentId || params.target;
      if (typeof onConnectSymbols === "function" && source && target) {
        const conn = onConnectSymbols(source, target);
        executedActions.push({
          method: "canvas.connectComponents",
          source,
          target,
          success: !!conn
        });
      }
    }
  });

  return executedActions;
}
