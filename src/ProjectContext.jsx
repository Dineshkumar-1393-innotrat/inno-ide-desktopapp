import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { getUserInfo, baseURL, productAPIBase } from "./utilities";
import axios from "axios";
import { autoSaveManager } from "./utils/autoSaveManager";

const ProjectContext = globalThis.__ProjectContext || createContext();
if (import.meta.env?.DEV) {
  globalThis.__ProjectContext = ProjectContext;
}

// Helper to map React Flow nodes to the specific symbol format required by the Block Diagram API
const mapNodesToSymbols = (nodes) => {
  return (nodes || []).map(node => {
    let src = '/src/images/Rectangle 1809.svg';
    let name = node.data?.label || 'Symbol';

    const type = node.type;
    switch (type) {
      case 'process': src = '/src/images/Rectangle 1809.svg'; name = node.data?.label || 'Process'; break;
      case 'decision': src = '/src/images/Polygon 1.svg'; name = node.data?.label || 'Decision'; break;
      case 'terminator': src = '/src/images/Rectangle 1812.svg'; name = node.data?.label || 'Terminator'; break;
      case 'ellipse': src = '/src/images/Ellipse 4.svg'; name = node.data?.label || 'Circle'; break;
      case 'data': src = '/src/images/Rectangle 1811.svg'; name = node.data?.label || 'Data'; break;
      case 'database': src = '/src/images/Group 37262.svg'; name = node.data?.label || 'Database'; break;
      case 'connector': src = '/src/images/Ellipse 5.svg'; name = node.data?.label || 'Connector'; break;
      case 'summing': src = '/src/images/Ellipse 5.svg'; name = node.data?.label || 'Summing'; break;
    }

    return {
      symbol: {
        type: 'svg',
        src: src,
        name: name
      },
      x: Math.round(node.position?.x || 0),
      y: Math.round(node.position?.y || 0),
      width: Math.round(node.width || node.style?.width || 120),
      height: Math.round(node.height || node.style?.height || 60)
    };
  });
};

export function ProjectProvider({ children }) {
  // --- Core Identity & Project State ---
  const [user, setUser] = useState(getUserInfo);

  const [activeProjectId, setActiveProjectId] = useState(() => {
    return localStorage.getItem("activeProjectId") || null;
  });
  const [activeProjectName, setActiveProjectName] = useState(() => {
    return localStorage.getItem("activeProjectName") || null;
  });
  const [activeProductId, setActiveProductId] = useState(() => {
    return localStorage.getItem("activeProductId") || null;
  });
  const [activeProductName, setActiveProductName] = useState(() => {
    return localStorage.getItem("activeProductName") || null;
  });
  const [activeDeviceId, setActiveDeviceId] = useState(() => {
    return localStorage.getItem("activeDeviceId") || null;
  });

  const [projectProductMap, setProjectProductMap] = useState(() => {
    try {
      const stored = localStorage.getItem("projectProductMap");
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  });

  const [isSwitchingProject, setIsSwitchingProject] = useState(false);

  // --- Identity Synchronization ---
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "userData") {
        const freshUser = getUserInfo();
        setUser(freshUser);
        console.log("[ProjectContext] User identity updated from storage.");
      }
    };

    const handleProjectDeleted = (e) => {
      if (e.detail?.projectId && e.detail.projectId === activeProjectId) {
        console.log("[ProjectContext] Active project deleted, resetting context state.");
        setActiveProjectId(null);
        setActiveProjectName(null);
        setActiveProductId(null);
        setActiveProductName(null);
        setDiagramData({ 
          blockDiagram: { data: [], id: null, version: 0 },
          flowchart: { data: [], id: null, version: 0 },
          simulation: { data: [], id: null, version: 0 }
        });
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("project-deleted", handleProjectDeleted);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("project-deleted", handleProjectDeleted);
    };
  }, [activeProjectId]);
  const [isHydrated, setIsHydrated] = useState(true); // Initially true if we have a project
  const [isRestoring, setIsRestoring] = useState(false);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const [diagramData, setDiagramData] = useState({ 
    blockDiagram: { data: [], id: null, version: 0 },
    flowchart: { data: [], id: null, version: 0 },
    simulation: { data: [], id: null, version: 0 }
  });
  const [transitionError, setTransitionError] = useState(null);

  // --- Refs for Concurrency & Elite Safeguards ---
  const switchIdRef = useRef(0);
  const activeControllersRef = useRef([]);
  const isInitialMount = useRef(true);

  // --- Request Registry Helpers ---
  const registerController = useCallback((controller) => {
    activeControllersRef.current.push(controller);
    controller.signal.addEventListener("abort", () => {
      activeControllersRef.current = activeControllersRef.current.filter(c => c !== controller);
    });
  }, []);

  const cancelAllRequests = useCallback(() => {
    activeControllersRef.current.forEach(c => c.abort());
    activeControllersRef.current = [];
  }, []);

  // --- Deterministic Fetch Logic ---
  const fetchDiagramData = useCallback(async (projectId, productId, switchId) => {
    const controller = new AbortController();
    registerController(controller);

    try {
      const userId = user?.userId || user?._id || user?.id;
      if (!projectId || !productId || !userId) return null;

      // Fetch all diagram types in parallel for atomic hydration
      const endpoints = [
        { key: 'blockDiagram', url: `${baseURL}/api/v1/getStoredBlockDiagramData/${productId}/${projectId}` },
        { key: 'flowchart', url: `${baseURL}/api/v1/getFlowDiagram/${productId}/${projectId}` },
        { key: 'simulation', url: `${baseURL}/api/v1/getSimulationData/${productId}/${projectId}` }
      ];

      const results = await Promise.all(
        endpoints.map(async (ep) => {
          try {
            const res = await axios.get(ep.url, { signal: controller.signal });
            if (res.data?.success && res.data?.data?.[0]) {
              const doc = res.data.data[0];
              // Normalize data field names (some use blockDiagram, some flowDiagram, some use root nodes/edges)
              let data;
              if (ep.key === 'flowchart') {
                // Support both legacy nested and new root-level structures
                data = doc.nodes ? { nodes: doc.nodes, edges: doc.edges, viewport: doc.viewport } : (doc.flowDiagram || doc.data || []);
              } else {
                data = doc.blockDiagram || doc.simulation || doc.data || [];
              }
              return { 
                key: ep.key, 
                value: { data, id: doc._id, version: doc.version || 0 } 
              };
            }
          } catch (e) {
            console.warn(`[ProjectContext] Failed to fetch ${ep.key}:`, e.message);
          }
          return { key: ep.key, value: { data: [], id: null, version: 0 } };
        })
      );

      if (switchId !== switchIdRef.current) return null;

      return results.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {});
    } catch (error) {
      if (axios.isCancel(error)) return null;
      throw error;
    }
  }, [registerController, user]);

  // --- Atomic Switch Function ---
  const switchProject = useCallback(async ({ projectId, projectName, productId, productName }) => {
    const switchId = ++switchIdRef.current;
    
    // 0. Avoid redundant switches, but allow product updates if provided
    if (projectId === activeProjectId && activeProjectId !== null) {
      if (productId && productId !== activeProductId) {
        console.log("[ProjectContext] Updating productId for current project:", productId);
        setActiveProductId(productId);
        if (productName) setActiveProductName(productName);
        
        // Update mapping (keyed by userId for session isolation)
        const userId = user?.userId || user?._id || user?.id;
        if (userId) {
          setProjectProductMap(prev => ({
            ...prev,
            [userId]: { ...(prev[userId] || {}), [projectId]: productId }
          }));
        }
      }
      console.log("[ProjectContext] Redundant project switch detected, skipping full reset.");
      setIsSwitchingProject(false);
      return;
    }

    // 1. Enter Switching State
    setIsSwitchingProject(true);
    setIsHydrated(false);
    setTransitionError(null);

    // 2. Flush pending changes instead of just abandoning them!
    await autoSaveManager.saveAll({ parallel: true });
    autoSaveManager.clearAll();
    cancelAllRequests();

    try {
      // 3. Clear Stale Product Data to prevent cross-project contamination
      setActiveProductId(null);
      setActiveProductName(null);
      localStorage.removeItem("activeProductId");
      localStorage.removeItem("activeProductName");

      // 4. Update Sync State (Local Storage)
      if (projectId) {
        setActiveProjectId(projectId);
        localStorage.setItem("activeProjectId", projectId);
      }
      if (projectName) {
        setActiveProjectName(projectName);
        localStorage.setItem("activeProjectName", projectName);
      }
      
      // Only set if explicitly provided (e.g. from sidebar folder metadata)
      if (productId) {
        setActiveProductId(productId);
        localStorage.setItem("activeProductId", productId);
        
        // Update mapping (keyed by userId)
        const userId = user?.userId || user?._id || user?.id;
        if (userId) {
          setProjectProductMap(prev => ({
            ...prev,
            [userId]: { ...(prev[userId] || {}), [projectId]: productId }
          }));
        }
      }
      if (productName) {
        setActiveProductName(productName);
        localStorage.setItem("activeProductName", productName);
      }

      // 4. Preload Data (using explicit IDs, never trust React state yet)
      const data = await fetchDiagramData(projectId, productId, switchId);

      // 5. Atomic Commit
      if (switchId === switchIdRef.current) {
        if (data) {
          setIsRestoring(true); // Silent hydration guard
          setDiagramData(data);
          // We use setTimeout to ensure the restoration flag stays true 
          // until AFTER the subsequent re-render triggered by setDiagramData
          setTimeout(() => setIsRestoring(false), 0);
        } else {
          setDiagramData({
            blockDiagram: { data: [], id: null, version: 0 },
            flowchart: { data: [], id: null, version: 0 },
            simulation: { data: [], id: null, version: 0 }
          });
        }
        setHasFetchedOnce(true);
        setIsHydrated(true);
        setIsSwitchingProject(false);
        window.dispatchEvent(new CustomEvent("project-switched", {
          detail: { projectId, projectName, productId, productName }
        }));
        console.log(`[ProjectContext] Switch to ${projectName} (ID: ${projectId}) completed successfully.`);
      }
    } catch (err) {
      if (switchId === switchIdRef.current) {
        console.error("[ProjectContext] Switch failed:", err);
        setTransitionError(err.message);
        setIsSwitchingProject(false);
      }
    }
  }, [cancelAllRequests, fetchDiagramData]);

  const saveDiagramData = useCallback(async (content, type = 'blockDiagram') => {
    try {
      const userId = user?.userId || user?._id || user?.id;
      if (!activeProjectId || !activeProductId || !userId) {
        console.warn("[ProjectContext] Skipping save: Missing IDs", { activeProjectId, activeProductId, userId });
        return;
      }

      console.log(`[ProjectContext] Saving ${type} data...`, { activeProjectId, activeProductId, userId });

      const current = diagramData[type];
      const nextVersion = (current.version || 0) + 1;

      // Prepare payload based on type
      const payload = {
        fileORFolderId: activeProjectId,
        productId: activeProductId,
        userId: userId,
        version: nextVersion
      };

      // Map content to specific folder/field expected by backend
      if (type === 'blockDiagram') {
        const tabs = Array.isArray(content) ? content : [{
          id: 'default',
          name: 'Main Diagram',
          state: { nodes: content.nodes || [], edges: content.edges || [], viewport: content.viewport || null }
        }];

        payload.blockDiagram = tabs.map(tab => ({
          id: tab.id,
          name: tab.name,
          symbols: mapNodesToSymbols(tab.state?.nodes),
          // We preserve the technical state for React Flow restoration
          state: tab.state 
        }));
      } else if (type === 'flowchart') {
        // Re-aligning with specified API requirement: nodes, edges, viewport at root level
        payload.nodes = content.nodes || [];
        payload.edges = content.edges || [];
        payload.viewport = content.viewport || null;
      } else if (type === 'simulation') {
        payload.simulation = content;
      }

      const config = {
        'blockDiagram': { 
          add: '/api/v1/storeBlockDiagramData', 
          update: `/api/v1/updateStoredBlockDiagramData/${current.id}` 
        },
        'flowchart': { 
          add: '/api/v1/addFlowDiagram', 
          update: `/api/v1/updateFlowDiagram/${current.id}` 
        },
        'simulation': { 
          add: '/api/v1/storeSimulationData', 
          update: `/api/v1/updateSimulationData/${current.id}` 
        }
      }[type];

      if (current.id) {
        console.log(`[ProjectContext] UPDATING ${type}: ${baseURL}${config.update}`);
        await axios.put(`${baseURL}${config.update}`, payload);
      } else {
        console.log(`[ProjectContext] STORING NEW ${type}: ${baseURL}${config.add}`);
        const response = await axios.post(`${baseURL}${config.add}`, payload);
        if (response.data?.data?._id) {
          setDiagramData(prev => ({
            ...prev,
            [type]: { ...prev[type], id: response.data.data._id }
          }));
        }
      }
      
      setDiagramData(prev => ({
        ...prev,
        [type]: { ...prev[type], version: nextVersion }
      }));
      console.log(`[ProjectContext] ${type} saved successfully (v${nextVersion})`);
    } catch (error) {
      console.error(`[ProjectContext] ${type} save failed:`, error);
      if (error.response?.status === 409) {
        alert("Version conflict: The diagram has been updated elsewhere. Please refresh.");
      }
      throw error;
    }
  }, [activeProjectId, activeProductId, user, diagramData]);

  // --- Reset Project State (isolation) ---
  const logout = useCallback(async () => {
    console.log("[ProjectContext] Performing project context logout cleanup...");
    
    // 1. Flush any pending auto-saves
    await autoSaveManager.saveAll({ parallel: true });
    autoSaveManager.clearAll();
    cancelAllRequests();

    // 2. Clear LocalStorage keys
    [
      "activeProjectId", "activeProjectName", 
      "activeProductId", "activeProductName", 
      "activeDeviceId", "userData"
    ].forEach(k => localStorage.removeItem(k));

    // 3. Reset Local State
    setActiveProjectId(null);
    setActiveProjectName(null);
    setActiveProductId(null);
    setActiveProductName(null);
    setActiveDeviceId(null);
    setDiagramData({ 
      blockDiagram: { data: [], id: null, version: 0 },
      flowchart: { data: [], id: null, version: 0 },
      simulation: { data: [], id: null, version: 0 }
    });
    setHasFetchedOnce(false);
    setIsHydrated(false);
    setUser(null);
  }, [cancelAllRequests]);

  // --- Identity Guard: Reset project state if user identity changes ---
  useEffect(() => {
    const userId = user?.userId || user?._id || user?.id;
    if (userId) {
       const storedUserId = localStorage.getItem("lastUserId");
       if (storedUserId && storedUserId !== String(userId)) {
         console.warn("[ProjectContext] User identity mismatch detected. Resetting project context.");
         // Reset state but keep the new user
         setActiveProjectId(null);
         setActiveProjectName(null);
         setActiveProductId(null);
         setActiveProductName(null);
         setDiagramData({ 
           blockDiagram: { data: [], id: null, version: 0 },
           flowchart: { data: [], id: null, version: 0 },
           simulation: { data: [], id: null, version: 0 }
         });
       }
       localStorage.setItem("lastUserId", String(userId));
    }
  }, [user]);

  // --- Side Effects for LocalStorage Sync ---
  useEffect(() => {
    if (activeProjectId) localStorage.setItem("activeProjectId", activeProjectId);
    else localStorage.removeItem("activeProjectId");
  }, [activeProjectId]);

  useEffect(() => {
    if (activeProjectName) localStorage.setItem("activeProjectName", activeProjectName);
    else localStorage.removeItem("activeProjectName");
  }, [activeProjectName]);

  useEffect(() => {
    if (activeProductId) localStorage.setItem("activeProductId", activeProductId);
    else localStorage.removeItem("activeProductId");
  }, [activeProductId]);

  useEffect(() => {
    if (activeProductName) localStorage.setItem("activeProductName", activeProductName);
    else localStorage.removeItem("activeProductName");
  }, [activeProductName]);

  useEffect(() => {
    if (activeDeviceId) localStorage.setItem("activeDeviceId", activeDeviceId);
    else localStorage.removeItem("activeDeviceId");
  }, [activeDeviceId]);

  useEffect(() => {
    localStorage.setItem("projectProductMap", JSON.stringify(projectProductMap));
  }, [projectProductMap]);

  // --- Initial Cleanup ---
  useEffect(() => {
    return () => cancelAllRequests();
  }, [cancelAllRequests]);

  // --- Backend Sync Effect ---
  // Ensures that whenever a project is selected, we have the correct product ID from the backend
  useEffect(() => {
    const syncProductWithBackend = async () => {
      try {
        const userId = user?.userId || user?._id || user?.id;
        
        if (!userId || !activeProjectId) {
          return;
        }

        // 1. Check local mapping first (keyed by userId)
        const userMap = projectProductMap[userId] || {};
        const localMappedProductId = userMap[activeProjectId];
        
        if (localMappedProductId) {
          if (activeProductId !== localMappedProductId) {
            setActiveProductId(localMappedProductId);
          }
          return;
        }

        // 2. Check localStorage cached product details
        try {
          const cachedByProj = localStorage.getItem(`innoide:product_details_${activeProjectId}`);
          if (cachedByProj) {
            const parsed = JSON.parse(cachedByProj);
            const foundId = parsed.productId || parsed.productID || parsed._id;
            if (foundId) {
              if (activeProductId !== foundId) setActiveProductId(foundId);
              if (parsed.productName && activeProductName !== parsed.productName) setActiveProductName(parsed.productName);
              setProjectProductMap(prev => ({
                ...prev,
                [userId]: { ...(prev[userId] || {}), [activeProjectId]: foundId }
              }));
              return;
            }
          }

          if (activeProjectName) {
            const cachedByName = localStorage.getItem(`innoide:product_details_${activeProjectName}`);
            if (cachedByName) {
              const parsed = JSON.parse(cachedByName);
              const foundId = parsed.productId || parsed.productID || parsed._id;
              if (foundId) {
                if (activeProductId !== foundId) setActiveProductId(foundId);
                setProjectProductMap(prev => ({
                  ...prev,
                  [userId]: { ...(prev[userId] || {}), [activeProjectId]: foundId }
                }));
                return;
              }
            }
          }

          const storedProdId = localStorage.getItem("activeProductId");
          const storedProjId = localStorage.getItem("activeProjectId");
          if (storedProdId && storedProjId === activeProjectId) {
            if (activeProductId !== storedProdId) setActiveProductId(storedProdId);
            setProjectProductMap(prev => ({
              ...prev,
              [userId]: { ...(prev[userId] || {}), [activeProjectId]: storedProdId }
            }));
            return;
          }
        } catch (storageErr) {
          console.warn("[ProjectContext] Storage check error:", storageErr);
        }

        // 3. Query the actual valid backend files/folders endpoint to locate product ID linked to project
        try {
          const filesUrl = `${baseURL}/api/v1/files/${userId}`;
          const res = await axios.get(filesUrl);
          if (res.data?.success && Array.isArray(res.data.files)) {
            const matchingFolder = res.data.files.find(f => 
              f.type === 'folder' && (f._id === activeProjectId || (activeProjectName && f.name === activeProjectName))
            );
            if (matchingFolder?.productId) {
              console.log("[ProjectContext] Found product from project folder:", matchingFolder.productId);
              if (activeProductId !== matchingFolder.productId) {
                setActiveProductId(matchingFolder.productId);
              }
              setProjectProductMap(prev => ({
                ...prev,
                [userId]: { ...(prev[userId] || {}), [activeProjectId]: matchingFolder.productId }
              }));
              return;
            }
          }
        } catch (filesErr) {
          console.warn("[ProjectContext] Backend files sync warning:", filesErr.message);
        }

      } catch (globalError) {
        console.error("[ProjectContext] Error in syncProductWithBackend:", globalError);
      }
    };

    syncProductWithBackend();
  }, [activeProjectId, activeProjectName, user]); 

  // --- Initial Hydration Effect ---
  useEffect(() => {
    const hydrateDiagrams = async () => {
      // Use direct IDs from current state/storage for initial load
      const currentProjId = activeProjectId || localStorage.getItem("activeProjectId");
      let currentProdId = activeProductId || localStorage.getItem("activeProductId");

      if (currentProjId && !hasFetchedOnce) {
        try {
          // If we have a project but no product, we might need a quick sync check first
          // though usually we trust the stored mapping for speed.
          
          const data = await fetchDiagramData(currentProjId, currentProdId, 0);
          if (data) {
             setDiagramData(data);
             // If we found a product ID in the diagram data that we didn't have before, update it
             if (!currentProdId && data.blockDiagram?.productId) {
                currentProdId = data.blockDiagram.productId;
                setActiveProductId(currentProdId);
             }
          }
          setHasFetchedOnce(true);
        } catch (error) {
          console.error("[ProjectContext] Initial hydration failed:", error);
          setHasFetchedOnce(true);
        }
      } else {
        setHasFetchedOnce(true);
      }
    };

    if (isInitialMount.current) {
      isInitialMount.current = false;
      hydrateDiagrams();
    }
  }, [activeProjectId, activeProductId, hasFetchedOnce, fetchDiagramData]);

  return (
    <ProjectContext.Provider
      value={{
        // Identity
        user,
        setUser,
        
        // Active IDs
        activeProjectId,
        activeProjectName,
        activeProductId,
        activeProductName,
        activeDeviceId,
        
        // Control Function
        switchProject,
        saveDiagramData,
        logout,
        
        // Detailed Transition State
        isSwitchingProject,
        isHydrated,
        hasFetchedOnce,
        isRestoring,
        transitionError,
        
        // Diagram Store
        diagramData,
        setDiagramData,
        
        // Setter overrides (Legacy Support - though switchProject is preferred)
        setActiveProjectId,
        setActiveProjectName,
        setActiveProductId,
        setActiveProductName,
        setActiveDeviceId,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}

