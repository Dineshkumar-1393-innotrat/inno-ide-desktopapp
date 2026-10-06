import { useState, useCallback } from "react";
import { sanitizeWidgets } from "./geologHelpers.js";

/**
 * Custom hook to manage saved IoT companion app profiles,
 * auto-persistence to localStorage, profile switching, and canvas clearing.
 */
export default function useAppPersistence({
  initialProjectName,
  projectName,
  setProjectName,
  widgets,
  setWidgets,
  logicBlocks,
  setLogicBlocks,
  setHistory,
  setHistoryIndex,
  setSelectedWidgetId,
  selectedDevice,
  toast
}) {
  // Saved Companion Apps / Screens List (CRUD: Read & Manage App Profiles)
  const [savedApps, setSavedApps] = useState(() => {
    try {
      const raw = localStorage.getItem("innoide:companion-apps-list");
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) return list;
      }
    } catch (e) { }
    return [{ name: initialProjectName, widgetCount: 0, ruleCount: 0, updatedAt: new Date().toISOString() }];
  });

  // Register saved app in the list index
  const registerSavedApp = useCallback((name, widgetCount, ruleCount) => {
    try {
      const raw = localStorage.getItem("innoide:companion-apps-list");
      let list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) list = [];
      const entry = {
        name,
        widgetCount,
        ruleCount,
        updatedAt: new Date().toISOString()
      };
      const existingIdx = list.findIndex((a) => a.name === name);
      if (existingIdx >= 0) {
        list[existingIdx] = entry;
      } else {
        list.push(entry);
      }
      localStorage.setItem("innoide:companion-apps-list", JSON.stringify(list));
      setSavedApps(list);
    } catch (e) { }
  }, []);

  // Auto-persist app state to localStorage
  const autoPersistApp = useCallback(
    (newWidgets, newBlocks = logicBlocks, name = projectName) => {
      try {
        const appConfig = {
          projectName: name,
          savedAt: new Date().toISOString(),
          widgets: newWidgets,
          logicBlocks: newBlocks,
          device: selectedDevice
        };
        localStorage.setItem(`innoide:companion-app:${name}`, JSON.stringify(appConfig));
        registerSavedApp(name, newWidgets.length, newBlocks.length);
      } catch (e) { }
    },
    [logicBlocks, projectName, selectedDevice, registerSavedApp]
  );

  // Load an existing app profile from localStorage
  const handleLoadApp = (targetName) => {
    try {
      const raw = localStorage.getItem(`innoide:companion-app:${targetName}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        const rawWidgets = Array.isArray(parsed.widgets) ? parsed.widgets : [];
        const loadedWidgets = sanitizeWidgets(rawWidgets);
        const loadedBlocks = Array.isArray(parsed.logicBlocks) ? parsed.logicBlocks : [];
        setProjectName(targetName);
        setWidgets(loadedWidgets);
        setLogicBlocks(loadedBlocks);
        setHistory([loadedWidgets]);
        setHistoryIndex(0);
        setSelectedWidgetId(loadedWidgets[0]?.id || null);
        if (toast) {
          toast({
            title: "App Screen Loaded",
            description: `Loaded "${targetName}" with ${loadedWidgets.length} components.`,
            status: "info",
            duration: 2000
          });
        }
        return;
      }
    } catch (e) { }
    // If not found in detailed storage, switch to blank with that name
    setProjectName(targetName);
    setWidgets([]);
    setLogicBlocks([]);
    setHistory([[]]);
    setHistoryIndex(0);
    setSelectedWidgetId(null);
  };

  // Create a new blank app profile
  const handleCreateNewApp = (name) => {
    const trimmed = (name || "").trim();
    if (!trimmed) return;
    setProjectName(trimmed);
    setWidgets([]);
    setLogicBlocks([]);
    setHistory([[]]);
    setHistoryIndex(0);
    setSelectedWidgetId(null);
    autoPersistApp([], [], trimmed);
    if (toast) {
      toast({
        title: "New App Created",
        description: `Created blank app screen "${trimmed}".`,
        status: "success",
        duration: 2200
      });
    }
  };

  // Rename current app profile
  const handleRenameApp = (oldName, newName) => {
    const trimmed = (newName || "").trim();
    if (!trimmed || trimmed === oldName) return;
    try {
      const existing = localStorage.getItem(`innoide:companion-app:${oldName}`);
      if (existing) {
        localStorage.setItem(`innoide:companion-app:${trimmed}`, existing);
        localStorage.removeItem(`innoide:companion-app:${oldName}`);
      }
      const raw = localStorage.getItem("innoide:companion-apps-list");
      let list = raw ? JSON.parse(raw) : [];
      list = list.map((a) => (a.name === oldName ? { ...a, name: trimmed } : a));
      localStorage.setItem("innoide:companion-apps-list", JSON.stringify(list));
      setSavedApps(list);
      setProjectName(trimmed);
      if (toast) {
        toast({
          title: "App Renamed",
          description: `Renamed to "${trimmed}".`,
          status: "success",
          duration: 2000
        });
      }
    } catch (e) { }
  };

  // Delete an app profile
  const handleDeleteApp = (nameToDelete) => {
    try {
      localStorage.removeItem(`innoide:companion-app:${nameToDelete}`);
      const raw = localStorage.getItem("innoide:companion-apps-list");
      let list = raw ? JSON.parse(raw) : [];
      list = list.filter((a) => a.name !== nameToDelete);
      localStorage.setItem("innoide:companion-apps-list", JSON.stringify(list));
      setSavedApps(list);

      if (toast) {
        toast({
          title: "App Screen Deleted",
          description: `"${nameToDelete}" was removed.`,
          status: "info",
          duration: 2000
        });
      }

      if (nameToDelete === projectName) {
        const next = list[0]?.name || "default_app";
        handleLoadApp(next);
      }
    } catch (e) { }
  };

  // Clear all components from canvas
  const handleClearAllWidgets = () => {
    setWidgets([]);
    setHistory([[]]);
    setHistoryIndex(0);
    setSelectedWidgetId(null);
    autoPersistApp([]);
    setLogicBlocks((prev) =>
      prev.map((b) => (b.triggerType === "component" ? { ...b, enabled: false, isStale: true } : b))
    );
    if (toast) {
      toast({
        title: "Canvas Cleared",
        description: "All components removed from mobile app. Component rules marked invalid.",
        status: "info",
        duration: 2000
      });
    }
  };

  // Save Companion App Configuration
  const handleSaveApp = () => {
    try {
      const appConfig = {
        projectName,
        savedAt: new Date().toISOString(),
        widgets,
        logicBlocks,
        device: selectedDevice
      };
      localStorage.setItem(`innoide:companion-app:${projectName}`, JSON.stringify(appConfig));
      registerSavedApp(projectName, widgets.length, logicBlocks.length);
      if (toast) {
        toast({
          title: "Companion App Saved",
          description: `"${projectName}" saved with ${widgets.length} components and ${logicBlocks.length} logic rules.`,
          status: "success",
          duration: 2500,
          isClosable: true
        });
      }
    } catch (e) {
      if (toast) {
        toast({ title: "Save Error", description: e.message, status: "error", duration: 3000 });
      }
    }
  };

  return {
    savedApps,
    setSavedApps,
    registerSavedApp,
    autoPersistApp,
    handleLoadApp,
    handleCreateNewApp,
    handleRenameApp,
    handleDeleteApp,
    handleClearAllWidgets,
    handleSaveApp
  };
}
