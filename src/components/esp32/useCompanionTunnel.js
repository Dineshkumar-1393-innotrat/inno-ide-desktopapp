import { useState, useEffect, useCallback, useMemo } from "react";
import { getStandaloneHtmlContent as generateCompanionHtml } from "./companionHtmlGenerator.js";
import {
  generateReactNativeAppCode as generateReactNativeAppCodeBase,
  exportExpoProjectZip
} from "./reactNativeCodeGenerator.js";
import { isHardcodedTextFieldResponse, isStaleTestGeolog, getLogTimestampMs } from "./geologHelpers.js";

/**
 * Custom hook to manage Companion HTTP/WebSocket Server, Cloud Remote Tunnels (localhost.run/cloudflare),
 * multi-device SSE event synchronization, and React Native / Expo Snack project exports.
 */
export default function useCompanionTunnel({
  projectName,
  widgets,
  setWidgets,
  logicBlocks,
  activePort,
  deviceDetectedLocation,
  setDeviceDetectedLocation,
  setLiveLedToggle,
  autoPersistApp,
  toast,
  isPublishOpen
}) {
  const [companionServerInfo, setCompanionServerInfo] = useState({ ip: "192.168.0.2", port: 5055 });
  const [localCompanionUrl, setLocalCompanionUrl] = useState("http://192.168.0.2:5055");
  const [companionNetworkMode, setCompanionNetworkMode] = useState("local"); // "local" | "cloud"
  const [remoteTunnelState, setRemoteTunnelState] = useState({
    active: false,
    url: "",
    provider: "",
    loading: false,
    error: null
  });

  const [snackSessionId, setSnackSessionId] = useState(null);
  const [snackSessionMap, setSnackSessionMap] = useState({});
  const [isSnackSyncing, setIsSnackSyncing] = useState(false);
  const [expoSdkVersion, setExpoSdkVersion] = useState("54.0.0"); // Stable Expo Go SDK 54.0.0
  const [expoGoUrlMap, setExpoGoUrlMap] = useState({});

  // Query actual host LAN IP from Electron Companion Server and check existing remote tunnel on mount
  useEffect(() => {
    if (window.electronAPI?.app?.getCompanionInfo) {
      window.electronAPI.app
        .getCompanionInfo()
        .then((info) => {
          if (info?.ip) {
            setCompanionServerInfo({ ip: info.ip, port: info.port || 5055 });
            setLocalCompanionUrl(info.url || `http://${info.ip}:${info.port || 5055}`);
          }
        })
        .catch(() => { });
    }
    if (window.electronAPI?.app?.getRemoteTunnel) {
      window.electronAPI.app
        .getRemoteTunnel()
        .then((res) => {
          if (res?.active && res?.url) {
            setRemoteTunnelState({ active: true, url: res.url, provider: res.provider, loading: false, error: null });
          }
        })
        .catch(() => { });
    }

    // Auto-sync with background cloud tunnel status file
    const syncWithDaemonTunnel = async () => {
      try {
        if (window.electronAPI?.filesystem?.readFile) {
          const content = await window.electronAPI.filesystem.readFile(
            "d:/ide-desktop-app/scratch/active_tunnel.json",
            "utf8"
          );
          if (content) {
            const data = JSON.parse(content);
            const isFresh = data?.timestamp && Date.now() - data.timestamp < 1000 * 60 * 15;
            if (data?.active && data?.url && isFresh) {
              setRemoteTunnelState((prev) => {
                if (prev.url !== data.url || !prev.active) {
                  return {
                    active: true,
                    url: data.url,
                    provider: data.provider || "localhost.run",
                    loading: false,
                    error: null
                  };
                }
                return prev;
              });
            } else if (data?.active === false) {
              setRemoteTunnelState((prev) => {
                if (prev.active) {
                  return { ...prev, active: false, url: "", provider: "", loading: false };
                }
                return prev;
              });
            }
          }
        }
      } catch (e) { }
    };
    syncWithDaemonTunnel();
    const daemonSyncInterval = setInterval(syncWithDaemonTunnel, 3000);
    return () => clearInterval(daemonSyncInterval);
  }, []);

  // Multi-device synchronization: listen to companion actions pushed from any connected phone or browser
  useEffect(() => {
    let unsub = null;
    if (window.electronAPI?.app?.onCompanionAction) {
      unsub = window.electronAPI.app.onCompanionAction((action) => {
        if (action) {
          if (action.isOn) {
            if (setLiveLedToggle) setLiveLedToggle(true);
            setWidgets((prev) =>
              prev.map((w) =>
                w.id === "w-led" || w.type === "switch" || /led|light/i.test(w.title || "")
                  ? { ...w, state: true, value: true }
                  : w
              )
            );
          } else if (action.isOff) {
            if (setLiveLedToggle) setLiveLedToggle(false);
            setWidgets((prev) =>
              prev.map((w) =>
                w.id === "w-led" || w.type === "switch" || /led|light/i.test(w.title || "")
                  ? { ...w, state: false, value: false }
                  : w
              )
            );
          }

          if (action.hostLocation && action.hostLocation.lat && setDeviceDetectedLocation) {
            setDeviceDetectedLocation((prev) => {
              if (
                prev &&
                prev.lat === action.hostLocation.lat &&
                prev.lng === action.hostLocation.lng &&
                prev.city === action.hostLocation.city &&
                prev.address === action.hostLocation.address
              ) {
                return prev;
              }
              return action.hostLocation;
            });
          }

          if (action.clearGeologs) {
            setWidgets((prev) =>
              prev.map((w) => (w.type === "location" ? { ...w, locationHistory: [], lastLocation: null } : w))
            );
          }
          if (action.clearFormResponses) {
            setWidgets((prev) => prev.map((w) => (w.type === "textfield" ? { ...w, responses: [] } : w)));
          }

          if (action.switchLocations && Array.isArray(action.switchLocations) && action.switchLocations.length > 0) {
            setWidgets((prev) => {
              const isCleanLoc = (item) => Boolean(item && item.lat && !isStaleTestGeolog(item));
              const isMatch = (a, b) =>
                (a.id && b.id && a.id === b.id) ||
                (Math.abs(getLogTimestampMs(a) - getLogTimestampMs(b)) < 2000 && a.event === b.event);
              const updated = prev.map((w) => {
                if (w.type === "location") {
                  const existing = (Array.isArray(w.locationHistory) ? w.locationHistory : []).filter(isCleanLoc);
                  const incoming = action.switchLocations.filter(isCleanLoc);
                  const merged = [...incoming];
                  existing.forEach((ex) => {
                    if (!merged.some((m) => isMatch(m, ex))) {
                      merged.push(ex);
                    }
                  });
                  merged.sort((a, b) => getLogTimestampMs(b) - getLogTimestampMs(a));
                  const validLast = action.location && isCleanLoc(action.location) ? action.location : merged[0] || null;
                  return {
                    ...w,
                    lastLocation: validLast,
                    locationHistory: merged.slice(0, 50)
                  };
                }
                return w;
              });
              if (autoPersistApp) autoPersistApp(updated);
              return updated;
            });
          } else if (action.location) {
            const isCleanLoc = (item) => Boolean(item && item.lat && !isStaleTestGeolog(item));
            if (isCleanLoc(action.location)) {
              setWidgets((prev) => {
                const isMatch = (a, b) =>
                  (a.id && b.id && a.id === b.id) ||
                  (Math.abs(getLogTimestampMs(a) - getLogTimestampMs(b)) < 2000 && a.event === b.event);
                const updated = prev.map((w) => {
                  if (w.type === "location") {
                    const existing = (Array.isArray(w.locationHistory) ? w.locationHistory : []).filter(isCleanLoc);
                    const hist = [action.location, ...existing.filter((h) => !isMatch(h, action.location)).slice(0, 49)];
                    hist.sort((a, b) => getLogTimestampMs(b) - getLogTimestampMs(a));
                    return { ...w, lastLocation: action.location, locationHistory: hist };
                  }
                  return w;
                });
                if (autoPersistApp) autoPersistApp(updated);
                return updated;
              });
            }
          }

          if (action.formResponse) {
            const fResp = action.formResponse;
            if (!isHardcodedTextFieldResponse(fResp)) {
              setWidgets((prev) =>
                prev.map((w) => {
                  const isTarget = fResp.widgetId ? w.id === fResp.widgetId : w.type === "textfield";
                  if (isTarget) {
                    const currentResponses = Array.isArray(w.responses) ? w.responses : [];
                    if (currentResponses.some((r) => r.id === fResp.id)) return w;
                    return { ...w, responses: [fResp, ...currentResponses.slice(0, 99)] };
                  }
                  return w;
                })
              );
              if (toast) {
                toast({
                  title: "📝 Mobile Form Answer Received",
                  description: `"${fResp.answer}" → "${fResp.questionText || fResp.question || "Question"}"`,
                  status: "success",
                  duration: 3500,
                  isClosable: true
                });
              }
            }
          }
        }
      });
    }

    // Secondary listener: SSE stream from companion server (port 5055)
    let evtSource = null;
    try {
      if (typeof window !== "undefined" && window.EventSource) {
        evtSource = new EventSource("http://localhost:5055/api/events");
        evtSource.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.hostLocation && data.hostLocation.lat && setDeviceDetectedLocation) {
              setDeviceDetectedLocation((prev) => {
                if (
                  prev &&
                  prev.lat === data.hostLocation.lat &&
                  prev.lng === data.hostLocation.lng &&
                  prev.city === data.hostLocation.city &&
                  prev.address === data.hostLocation.address
                ) {
                  return prev;
                }
                return data.hostLocation;
              });
            }
            if (data.switchLocations && Array.isArray(data.switchLocations) && data.switchLocations.length > 0) {
              setWidgets((prev) => {
                const isCleanLoc = (item) => Boolean(item && item.lat && !isStaleTestGeolog(item));
                const isMatch = (a, b) =>
                  (a.id && b.id && a.id === b.id) ||
                  (Math.abs(getLogTimestampMs(a) - getLogTimestampMs(b)) < 2000 && a.event === b.event);
                const updated = prev.map((w) => {
                  if (w.type === "location") {
                    const existing = (Array.isArray(w.locationHistory) ? w.locationHistory : []).filter(isCleanLoc);
                    const incoming = data.switchLocations.filter(isCleanLoc);
                    const merged = [...incoming];
                    existing.forEach((ex) => {
                      if (!merged.some((m) => isMatch(m, ex))) {
                        merged.push(ex);
                      }
                    });
                    merged.sort((a, b) => getLogTimestampMs(b) - getLogTimestampMs(a));
                    const validLast =
                      data.lastLocation && isCleanLoc(data.lastLocation) ? data.lastLocation : merged[0] || null;
                    return {
                      ...w,
                      lastLocation: validLast,
                      locationHistory: merged.slice(0, 50)
                    };
                  }
                  return w;
                });
                if (autoPersistApp) autoPersistApp(updated);
                return updated;
              });
            } else if (data.lastLocation) {
              const isCleanLoc = (item) => Boolean(item && item.lat && !isStaleTestGeolog(item));
              if (isCleanLoc(data.lastLocation)) {
                setWidgets((prev) => {
                  const isMatch = (a, b) =>
                    (a.id && b.id && a.id === b.id) ||
                    (Math.abs(getLogTimestampMs(a) - getLogTimestampMs(b)) < 2000 && a.event === b.event);
                  const updated = prev.map((w) => {
                    if (w.type === "location") {
                      const existing = (Array.isArray(w.locationHistory) ? w.locationHistory : []).filter(isCleanLoc);
                      const hist = [data.lastLocation, ...existing.filter((h) => !isMatch(h, data.lastLocation)).slice(0, 49)];
                      hist.sort((a, b) => getLogTimestampMs(b) - getLogTimestampMs(a));
                      return { ...w, lastLocation: data.lastLocation, locationHistory: hist };
                    }
                    return w;
                  });
                  if (autoPersistApp) autoPersistApp(updated);
                  return updated;
                });
              }
            }
            if (data.formResponse) {
              const fResp = data.formResponse;
              if (!isHardcodedTextFieldResponse(fResp)) {
                setWidgets((prev) =>
                  prev.map((w) => {
                    const isTarget = fResp.widgetId ? w.id === fResp.widgetId : w.type === "textfield";
                    if (isTarget) {
                      const currentResponses = Array.isArray(w.responses) ? w.responses : [];
                      if (currentResponses.some((r) => r.id === fResp.id)) return w;
                      return { ...w, responses: [fResp, ...currentResponses.slice(0, 99)] };
                    }
                    return w;
                  })
                );
              }
            }
          } catch { }
        };
      }
    } catch { }

    return () => {
      if (unsub) unsub();
      if (evtSource) evtSource.close();
    };
  }, [setWidgets, setLiveLedToggle, setDeviceDetectedLocation, autoPersistApp, toast]);

  // Listen to background cloud tunnel status events from Electron
  useEffect(() => {
    if (window.electronAPI?.app?.onTunnelStatus) {
      const unsub = window.electronAPI.app.onTunnelStatus((status) => {
        if (status) {
          if (status.active && status.url) {
            setRemoteTunnelState({
              active: true,
              url: status.url,
              provider: status.provider,
              loading: false,
              error: null
            });
          } else if (status.status === "disconnected" || status.status === "failed") {
            setRemoteTunnelState((prev) => ({
              ...prev,
              active: false,
              url: "",
              provider: "",
              loading: false,
              error: status.status === "failed" ? "Failed to connect" : "Tunnel disconnected"
            }));
          }
        }
      });
      return unsub;
    }
  }, []);

  // Toggle Cloud Remote Tunnel (HTTPS relay for cellular / WAN / non-local network access)
  const handleToggleCloudRemote = async (enable, forceRestart = false) => {
    if (enable) {
      setRemoteTunnelState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        if (forceRestart && window.electronAPI?.app?.stopRemoteTunnel) {
          try {
            await window.electronAPI.app.stopRemoteTunnel();
          } catch { }
        }
        let activeUrl = "";
        let activeProvider = "localhost.run";
        if (window.electronAPI?.app?.startRemoteTunnel) {
          const res = await window.electronAPI.app.startRemoteTunnel(5055, forceRestart);
          if (res && res.success && res.url) {
            activeUrl = res.url;
            activeProvider = res.provider || "localhost.run";
          }
        }
        // Fallback to reading daemon tunnel status
        if (!activeUrl && window.electronAPI?.filesystem?.readFile) {
          try {
            const content = await window.electronAPI.filesystem.readFile(
              "d:/ide-desktop-app/scratch/active_tunnel.json",
              "utf8"
            );
            if (content) {
              const data = JSON.parse(content);
              const isFresh = data?.timestamp && Date.now() - data.timestamp < 1000 * 60 * 15;
              if (data?.active && data?.url && isFresh) {
                activeUrl = data.url;
                activeProvider = data.provider || "localhost.run";
              }
            }
          } catch { }
        }

        if (activeUrl) {
          setRemoteTunnelState({ active: true, url: activeUrl, provider: activeProvider, loading: false, error: null });
          setCompanionNetworkMode("cloud");
          if (toast) {
            toast({
              title: forceRestart ? "🔄 Cloud Tunnel Refreshed" : "🌐 Cloud Remote Active",
              description: `Live HTTPS Relay: ${activeUrl}. Ready for mobile 4G/5G data.`,
              status: "success",
              duration: 4500
            });
          }
          return;
        }
        throw new Error("Could not establish cloud tunnel");
      } catch (err) {
        setRemoteTunnelState((prev) => ({ ...prev, loading: false, error: err.message, active: false }));
        if (toast) {
          toast({
            title: "Cloud Remote Notice",
            description: err.message || "Could not establish cloud tunnel",
            status: "warning",
            duration: 4000
          });
        }
      }
    } else {
      setRemoteTunnelState((prev) => ({ ...prev, loading: true }));
      try {
        if (window.electronAPI?.app?.stopRemoteTunnel) {
          await window.electronAPI.app.stopRemoteTunnel();
        }
        setRemoteTunnelState({ active: false, url: "", provider: "", loading: false, error: null });
        setCompanionNetworkMode("local");
        if (toast) {
          toast({
            title: "Local Wi-Fi Mode Active",
            description: "Companion app switched to local Wi-Fi IP.",
            status: "info",
            duration: 2500
          });
        }
      } catch (err) {
        setRemoteTunnelState((prev) => ({ ...prev, loading: false }));
      }
    }
  };

  const resolvedHostIp = companionServerInfo?.ip || "192.168.0.2";

  // Generate Standalone Single-File Web App HTML (Full UI + Functional Logic)
  const getStandaloneHtmlContent = useCallback(() => {
    return generateCompanionHtml({
      projectName,
      widgets,
      logicBlocks,
      activePort,
      companionServerInfo,
      resolvedHostIp,
      deviceDetectedLocation
    });
  }, [projectName, widgets, logicBlocks, activePort, companionServerInfo, resolvedHostIp, deviceDetectedLocation]);

  // Export Standalone Single-File Web App HTML
  const handleExportHtmlWebApp = () => {
    const htmlContent = getStandaloneHtmlContent();
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, "-")}-companion.html`;
    a.click();
    URL.revokeObjectURL(url);
    if (toast) {
      toast({
        title: "Standalone Web App Downloaded",
        description: "Includes complete interactive UI controls, functional logic automation engine, and telemetry.",
        status: "success",
        duration: 3000
      });
    }
  };

  // Start or update Local Companion Server (for instant camera scan over Wi-Fi)
  const startLocalCompanionServer = async () => {
    try {
      const html = getStandaloneHtmlContent();

      const locWidget = (widgets || []).find((w) => w.type === "location");
      const existingLocs = (Array.isArray(locWidget?.locationHistory) ? locWidget.locationHistory : [])
        .filter((g) => !isStaleTestGeolog(g))
        .sort((a, b) => getLogTimestampMs(b) - getLogTimestampMs(a));
      const lastLoc =
        locWidget?.lastLocation && !isStaleTestGeolog(locWidget.lastLocation)
          ? locWidget.lastLocation
          : existingLocs.length > 0
          ? existingLocs[0]
          : null;
      const hostLoc =
        deviceDetectedLocation && !isStaleTestGeolog(deviceDetectedLocation) ? deviceDetectedLocation : null;

      // Seed companion server state
      try {
        await fetch("http://localhost:5055/api/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            initSync: true,
            switchLocations: existingLocs,
            lastLocation: lastLoc,
            hostLocation: hostLoc
          })
        });
      } catch (e) { }

      // Push updated HTML to both possible companion servers
      try {
        await fetch("http://localhost:5055/api/update-html", {
          method: "POST",
          headers: { "Content-Type": "text/html; charset=utf-8" },
          body: html
        });
      } catch (e) { }
      try {
        await fetch("http://localhost:5056/api/update-html", {
          method: "POST",
          headers: { "Content-Type": "text/html; charset=utf-8" },
          body: html
        });
      } catch (e) { }

      if (window.electronAPI?.app?.startCompanionServer) {
        try {
          const res = await window.electronAPI.app.startCompanionServer({
            html,
            port: 5055,
            switchLocations: existingLocs,
            lastLocation: lastLoc,
            hostLocation: hostLoc
          });
          if (res?.success) {
            if (res.url) setLocalCompanionUrl((prev) => (prev === res.url ? prev : res.url));
            if (res.ip) {
              const newPort = res.port || 5055;
              setCompanionServerInfo((prev) =>
                prev?.ip === res.ip && prev?.port === newPort ? prev : { ip: res.ip, port: newPort }
              );
            }
            return res.url;
          }
        } catch (err) {
          console.warn("Local companion server start warning:", err);
        }
      }
    } catch (err) {
      console.warn("Companion server sync error:", err);
    }
    return localCompanionUrl;
  };

  // Generate React Native Expo App.js Code — Full UI + Functional Logic
  const generateReactNativeAppCode = useCallback(
    (targetSdk = expoSdkVersion) => {
      return generateReactNativeAppCodeBase({
        projectName,
        widgets,
        logicBlocks,
        targetSdk,
        activePort,
        companionServerInfo
      });
    },
    [projectName, widgets, logicBlocks, expoSdkVersion, activePort, companionServerInfo]
  );

  // Export React Native Project as Zip (Expo Go Format)
  const handleExportExpoZip = useCallback(async () => {
    await exportExpoProjectZip({
      projectName,
      widgets,
      logicBlocks,
      expoSdkVersion,
      toast
    });
  }, [projectName, widgets, logicBlocks, expoSdkVersion, toast]);

  // Sync live project session with Expo Snack API via Electron IPC or Direct Fetch
  const syncSnackSession = async (showToasts = false, targetSdk = expoSdkVersion) => {
    setIsSnackSyncing(true);
    if (showToasts && toast) {
      toast({
        title: "Connecting to Expo Cloud...",
        description: `Creating live Snack session for SDK ${targetSdk}...`,
        status: "info",
        duration: 2000
      });
    }
    try {
      const code = generateReactNativeAppCode(targetSdk);
      let sessionId = null;
      let expUrl = null;

      if (window.electronAPI?.app?.createExpoSnack) {
        try {
          const res = await window.electronAPI.app.createExpoSnack({
            name: projectName,
            code,
            description: `IoT Companion app for ${projectName}`,
            sdkVersion: targetSdk
          });
          if (res?.success && res?.id) {
            sessionId = res.id;
            expUrl =
              res.snackChannelUrl ||
              res.expoGoUrl ||
              `exp://u.expo.dev/933fd9c0-1666-11e7-afcb-d9a0723853cd?snack=${res.id}`;
          }
        } catch (ipcErr) {
          console.warn("Electron IPC createExpoSnack error:", ipcErr);
        }
      }

      if (!sessionId) {
        try {
          const payload = {
            manifest: {
              name: projectName,
              description: `IoT Companion app for ${projectName}`,
              sdkVersion: targetSdk
            },
            code: {
              "App.js": { type: "CODE", contents: code }
            },
            dependencies: {}
          };

          const res = await fetch("https://exp.host/--/api/v2/snack/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          sessionId = data?.id || data?.snackId || data?.hashId;
          if (sessionId) {
            expUrl = `exp://u.expo.dev/933fd9c0-1666-11e7-afcb-d9a0723853cd?snack=${sessionId}`;
          }
        } catch (directErr) {
          console.warn("Direct snack fetch failed:", directErr);
        }
      }

      if (sessionId) {
        setSnackSessionId(sessionId);
        setSnackSessionMap((prev) => ({ ...prev, [targetSdk]: sessionId }));
        const resolvedExpUrl =
          expUrl || `exp://u.expo.dev/933fd9c0-1666-11e7-afcb-d9a0723853cd?snack=${sessionId}`;
        setExpoGoUrlMap((prev) => ({ ...prev, [targetSdk]: resolvedExpUrl }));

        if (showToasts && toast) {
          toast({
            title: `Expo (SDK ${targetSdk}) Ready!`,
            description: `Session synchronized. Ready to scan in Expo Go app.`,
            status: "success",
            duration: 2500
          });
        }
        return sessionId;
      }
    } catch (err) {
      console.warn("Snack sync error:", err);
    } finally {
      setIsSnackSyncing(false);
    }
    return null;
  };

  // Helper to switch SDK versions and update session
  const handleSelectSdkVersion = (newSdk) => {
    setExpoSdkVersion(newSdk);
    if (snackSessionMap[newSdk]) {
      setSnackSessionId(snackSessionMap[newSdk]);
    } else {
      setSnackSessionId(null);
      syncSnackSession(true, newSdk);
    }
  };

  // Copy generated React Native App.js code to clipboard
  const handleCopyAppJsCode = () => {
    try {
      const code = generateReactNativeAppCode();
      navigator.clipboard.writeText(code);
      if (toast) {
        toast({
          title: "Copied Updated App.js Code!",
          description: "Paste directly into App.js in your Expo Snack tab to run immediately.",
          status: "success",
          duration: 3000
        });
      }
    } catch (e) {
      if (toast) {
        toast({
          title: "Copy Failed",
          description: e.message,
          status: "error",
          duration: 2000
        });
      }
    }
  };

  // Open in Expo Snack Web Simulator (Fresh session with latest code & hardware bridge)
  const handleOpenExpoSnack = async () => {
    if (toast) {
      toast({
        title: "Syncing with Expo Cloud...",
        description: "Uploading updated App.js with hardware bridge controls...",
        status: "info",
        duration: 2000
      });
    }
    const freshId = await syncSnackSession(false, expoSdkVersion);
    const targetId = freshId || snackSessionId || snackSessionMap[expoSdkVersion];
    if (targetId) {
      const liveSnackUrl = `https://snack.expo.dev/${targetId}?platform=web&preview=true&sdkVersion=${expoSdkVersion}`;
      window.open(liveSnackUrl, "_blank");
      if (toast) {
        toast({
          title: `Opening Expo Snack (SDK ${expoSdkVersion})`,
          description: `Loaded fresh session ${targetId} without syntax errors.`,
          status: "success",
          duration: 3500
        });
      }
    } else {
      window.open("https://snack.expo.dev", "_blank");
      if (toast) {
        toast({
          title: "Opened Expo Snack",
          description: "Use 'Copy App.js' to paste the latest code into Snack.",
          status: "info",
          duration: 3000
        });
      }
    }
  };

  // Pre-sync Snack session & auto-tunnel when Publish modal is open
  useEffect(() => {
    if (isPublishOpen) {
      startLocalCompanionServer();
      if (window.electronAPI?.app?.startRemoteTunnel && !remoteTunnelState.active && !remoteTunnelState.loading) {
        handleToggleCloudRemote(true);
      }
      if (!snackSessionId || !snackSessionMap[expoSdkVersion]) {
        syncSnackSession(false, expoSdkVersion);
      }
    }
  }, [isPublishOpen]);

  // Auto-start Companion Server on mount and when structure changes
  useEffect(() => {
    startLocalCompanionServer();
  }, [widgets.length, logicBlocks.length, projectName]);

  const resolvedHostPort = companionServerInfo?.port || 5055;

  return {
    companionServerInfo,
    setCompanionServerInfo,
    localCompanionUrl,
    setLocalCompanionUrl,
    companionNetworkMode,
    setCompanionNetworkMode,
    remoteTunnelState,
    setRemoteTunnelState,
    snackSessionId,
    snackSessionMap,
    isSnackSyncing,
    expoSdkVersion,
    setExpoSdkVersion,
    expoGoUrlMap,
    resolvedHostIp,
    resolvedHostPort,
    handleToggleCloudRemote,
    getStandaloneHtmlContent,
    handleExportHtmlWebApp,
    startLocalCompanionServer,
    generateReactNativeAppCode,
    handleExportExpoZip,
    syncSnackSession,
    handleSelectSdkVersion,
    handleCopyAppJsCode,
    handleOpenExpoSnack
  };
}
