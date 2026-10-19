import { useState, useEffect, useCallback, useRef } from "react";
import {
  isHardcodedTextFieldQuestion,
  isHardcodedTextFieldResponse,
  isStaleTestGeolog,
  getLogTimestampMs,
  sanitizeWidgets
} from "./geologHelpers.js";

/**
 * Custom hook to manage GPS, network geolocation, user calibration,
 * and switch event geotagging for IoT telemetry.
 */
export default function useDeviceLocation({ widgets, setWidgets, autoPersistApp, onLocationUpdated }) {
  const onLocationUpdatedRef = useRef(onLocationUpdated);
  useEffect(() => {
    onLocationUpdatedRef.current = onLocationUpdated;
  }, [onLocationUpdated]);

  const lastBroadcastLocationRef = useRef(null);

  const syncHostLocationWithCompanion = useCallback((loc) => {
    if (!loc || !loc.lat) return;
    const last = lastBroadcastLocationRef.current;
    if (
      last &&
      last.lat === loc.lat &&
      last.lng === loc.lng &&
      last.city === loc.city &&
      last.address === loc.address
    ) {
      return;
    }
    lastBroadcastLocationRef.current = loc;
    fetch("http://localhost:5055/api/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostLocation: loc, syncOnly: true })
    }).catch(() => { });
  }, []);

  const [locationPermissionStatus, setLocationPermissionStatus] = useState(() => {
    return localStorage.getItem("innoide:location_permission_granted") === "true"
      ? "granted"
      : (localStorage.getItem("innoide:location_permission_granted") === "false" ? "denied" : "prompt");
  });

  const [deviceDetectedLocation, setDeviceDetectedLocation] = useState(() => {
    try {
      const isGranted = localStorage.getItem("innoide:location_permission_granted") === "true";
      const raw = localStorage.getItem("innoide:calibrated_device_location");
      if (isGranted && raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.lat && parsed.city !== "Ambattur" && parsed.city !== "Chennai") {
          return parsed;
        }
      }
    } catch { }
    return {
      lat: null,
      lng: null,
      city: "Permission Required",
      address: "Grant location access permission to detect location",
      country: "",
      source: "Pending Permission",
      permissionRequired: true,
      timestamp: new Date().toLocaleTimeString()
    };
  });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const fetchCurrentDeviceLocation = useCallback(async (forcedQuery = null) => {
    setIsDetectingLocation(true);
    try {
      // 0. Manual explicit calibration search by user query
      if (forcedQuery) {
        const q = String(forcedQuery).trim();
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&addressdetails=1&accept-language=en`,
            { headers: { "Accept-Language": "en" } }
          );
          if (res.ok) {
            const list = await res.json();
            if (list && list.length > 0) {
              const item = list[0];
              const specific =
                item.name ||
                item.address?.railway ||
                item.address?.suburb ||
                item.address?.neighbourhood ||
                (item.display_name ? item.display_name.split(",")[0].trim() : "") ||
                item.address?.city ||
                q;
              const resolved = {
                lat: parseFloat(Number(item.lat).toFixed(5)),
                lng: parseFloat(Number(item.lon).toFixed(5)),
                city: specific,
                address: item.display_name || `${item.lat}°, ${item.lon}°`,
                country: item.address?.country || "India",
                source: `Calibrated Location (${specific})`,
                timestamp: new Date().toLocaleTimeString()
              };
              localStorage.setItem("innoide:calibrated_device_location", JSON.stringify(resolved));
              setDeviceDetectedLocation(resolved);
              syncHostLocationWithCompanion(resolved);
              return resolved;
            }
          }
        } catch { }
      }

      // Check browser permission status if query API is supported
      let permState = "prompt";
      if (typeof navigator !== "undefined" && navigator.permissions?.query) {
        try {
          const p = await navigator.permissions.query({ name: "geolocation" });
          permState = p.state;
          setLocationPermissionStatus(p.state);
        } catch (e) {}
      } else {
        permState = localStorage.getItem("innoide:location_permission_granted") === "true" ? "granted" : "prompt";
      }

      // If user previously denied permission, do not detect location without user enabling it
      if (permState === "denied") {
        setLocationPermissionStatus("denied");
        localStorage.setItem("innoide:location_permission_granted", "false");
        console.warn("[DeviceLocation] Geolocation permission is denied in browser/system settings.");
        const deniedLoc = {
          lat: null,
          lng: null,
          city: "Permission Denied",
          address: "Location access denied. Please enable location permissions in browser settings.",
          country: "",
          source: "Permission Denied",
          permissionRequired: true,
          timestamp: new Date().toLocaleTimeString()
        };
        setDeviceDetectedLocation(deniedLoc);
        return null;
      }

      // 1. Try browser navigator.geolocation (GPS — strictly requested and detected after access permission)
      const tryNavigatorGeolocation = () => {
        return new Promise((resolve) => {
          if (typeof navigator === "undefined" || !navigator.geolocation) {
            return resolve(null);
          }
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              setLocationPermissionStatus("granted");
              localStorage.setItem("innoide:location_permission_granted", "true");
              const lat = parseFloat(pos.coords.latitude.toFixed(5));
              const lng = parseFloat(pos.coords.longitude.toFixed(5));
              let city = "Local Area";
              let address = `${lat}°N, ${lng}°E`;
              let country = "India";
              try {
                const controller = new AbortController();
                const tid = setTimeout(() => controller.abort(), 3500);
                const r = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&accept-language=en`,
                  { signal: controller.signal, headers: { "Accept-Language": "en" } }
                );
                clearTimeout(tid);
                if (r.ok) {
                  const d = await r.json();
                  city =
                    d.name ||
                    d.address?.railway ||
                    d.address?.neighbourhood ||
                    d.address?.suburb ||
                    (d.display_name ? d.display_name.split(",")[0].trim() : "") ||
                    d.address?.city ||
                    "Local Area";
                  country = d.address?.country || "India";
                  address = d.display_name?.split(",").slice(0, 4).join(",").trim() || address;
                }
              } catch { }
              resolve({
                lat,
                lng,
                city,
                address,
                country,
                accuracy: Math.round(pos.coords.accuracy || 10),
                source: "GPS (after access permission)",
                timestamp: new Date().toLocaleTimeString()
              });
            },
            (err) => {
              if (err.code === 1) { // PERMISSION_DENIED
                setLocationPermissionStatus("denied");
                localStorage.setItem("innoide:location_permission_granted", "false");
                console.warn("[DeviceLocation] User denied location access permission.");
              }
              resolve(null);
            },
            { timeout: 8000, maximumAge: 30000, enableHighAccuracy: true }
          );
        });
      };

      const navLoc = await tryNavigatorGeolocation();
      if (navLoc && navLoc.lat) {
        localStorage.setItem("innoide:calibrated_device_location", JSON.stringify(navLoc));
        setDeviceDetectedLocation(navLoc);
        syncHostLocationWithCompanion(navLoc);
        return navLoc;
      }

      // If permission was denied or not granted, do not set false coordinates
      const currentPerm = localStorage.getItem("innoide:location_permission_granted");
      if (currentPerm === "false") {
        const deniedLoc = {
          lat: null,
          lng: null,
          city: "Permission Denied",
          address: "Location access denied. Please enable location permissions in browser settings.",
          country: "",
          source: "Permission Denied",
          permissionRequired: true,
          timestamp: new Date().toLocaleTimeString()
        };
        setDeviceDetectedLocation(deniedLoc);
        return null;
      }

      // Priority fallback: only use calibrated location if explicitly saved
      try {
        const raw = localStorage.getItem("innoide:calibrated_device_location");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.lat) {
            setDeviceDetectedLocation(parsed);
            syncHostLocationWithCompanion(parsed);
            return parsed;
          }
        }
      } catch {}

      return null;
    } finally {
      setIsDetectingLocation(false);
    }
  }, [syncHostLocationWithCompanion]);

  const handleCalibrateLocation = useCallback(
    async (query = "Little Mount, Chennai") => {
      setIsDetectingLocation(true);
      try {
        const q = String(query || "Little Mount, Chennai").trim();
        let resolved = null;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&addressdetails=1&accept-language=en`,
            { headers: { "Accept-Language": "en" } }
          );
          if (res.ok) {
            const list = await res.json();
            if (list && list.length > 0) {
              const item = list[0];
              const specific =
                item.name ||
                item.address?.railway ||
                item.address?.suburb ||
                item.address?.neighbourhood ||
                (item.display_name ? item.display_name.split(",")[0].trim() : "") ||
                item.address?.city ||
                q;
              resolved = {
                lat: parseFloat(Number(item.lat).toFixed(5)),
                lng: parseFloat(Number(item.lon).toFixed(5)),
                city: specific,
                address: item.display_name || `${item.lat}°, ${item.lon}°`,
                country: item.address?.country || "India",
                source: `Calibrated Location (${specific})`,
                timestamp: new Date().toLocaleTimeString()
              };
            }
          }
        } catch { }

        if (!resolved) {
          resolved = {
            lat: 13.0147,
            lng: 80.2242,
            city: "Little Mount",
            address: "Little Mount, Anna Salai (Mount Road), Chennai, Tamil Nadu, 600015, India",
            country: "India",
            source: "Calibrated Location (Little Mount)",
            timestamp: new Date().toLocaleTimeString()
          };
        }

        localStorage.setItem("innoide:calibrated_device_location", JSON.stringify(resolved));
        setDeviceDetectedLocation(resolved);

        setWidgets((prev) =>
          prev.map((w) => {
            if (w.type === "location") {
              const hist = Array.isArray(w.locationHistory) ? w.locationHistory : [];
              const updatedHist = hist.map((h) => {
                if (h.city === "Ambattur" || h.city === "Chennai" || !h.lat) {
                  return { ...h, lat: resolved.lat, lng: resolved.lng, city: resolved.city, address: resolved.address };
                }
                return h;
              });
              return {
                ...w,
                lastLocation: {
                  ...(w.lastLocation || {}),
                  lat: resolved.lat,
                  lng: resolved.lng,
                  city: resolved.city,
                  address: resolved.address,
                  country: resolved.country,
                  source: resolved.source,
                  timestamp: resolved.timestamp,
                  time: resolved.timestamp
                },
                locationHistory: updatedHist
              };
            }
            return w;
          })
        );

        syncHostLocationWithCompanion(resolved);

        return resolved;
      } catch (err) {
        console.error("Calibration error:", err);
      } finally {
        setIsDetectingLocation(false);
      }
    },
    [setWidgets, syncHostLocationWithCompanion]
  );

  // Automatically detect device location ONCE on mount and refresh location widgets ONLY if permission was already granted
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (hasMountedRef.current) return;
    hasMountedRef.current = true;

    // Requirement: location should be detected strictly after access permission
    const isGranted = localStorage.getItem("innoide:location_permission_granted") === "true";
    if (!isGranted) {
      return;
    }

    fetchCurrentDeviceLocation().then((loc) => {
      if (loc && loc.city && loc.city !== "Location Detecting...") {
        setWidgets((prev) =>
          prev.map((w) => {
            if (w.type === "location") {
              const prevCity = w.lastLocation?.city || "";
              const isStale =
                !w.lastLocation ||
                !w.lastLocation.lat ||
                prevCity === "Bangalore" ||
                prevCity === "Chennai" ||
                prevCity === "Ambattur" ||
                prevCity === "Detecting Location..." ||
                prevCity === "Location Detecting..." ||
                prevCity === "Local Area" ||
                prevCity === "Device Location" ||
                prevCity === "Current Device Location" ||
                (typeof w.lastLocation.lat === "number" && Math.abs(w.lastLocation.lat - 13.0879) < 0.001);
              if (isStale && loc.lat && loc.lng) {
                const updatedLast = {
                  ...(w.lastLocation || {}),
                  lat: loc.lat,
                  lng: loc.lng,
                  city: loc.city,
                  address: loc.address,
                  country: loc.country || "",
                  source: loc.source || "Network",
                  timestamp: loc.timestamp || new Date().toLocaleTimeString()
                };
                const hist =
                  Array.isArray(w.locationHistory) && w.locationHistory.length > 0
                    ? w.locationHistory.map((h) => {
                        const isItemStale =
                          !h.lat ||
                          h.city === "Chennai" ||
                          h.city === "Ambattur" ||
                          h.city === "Bangalore" ||
                          h.city === "Detecting..." ||
                          (typeof h.lat === "number" && Math.abs(h.lat - 13.0879) < 0.001);
                        return isItemStale
                          ? {
                              ...h,
                              lat: loc.lat,
                              lng: loc.lng,
                              city: loc.city,
                              address: loc.address,
                              timestamp: h.timestamp || loc.timestamp
                            }
                          : h;
                      })
                    : [updatedLast];
                return {
                  ...w,
                  lastLocation: updatedLast,
                  locationHistory: hist
                };
              }
            }
            return w;
          })
        );
        if (onLocationUpdatedRef.current) {
          setTimeout(() => {
            onLocationUpdatedRef.current?.();
          }, 150);
        }
      }
    });
  }, [fetchCurrentDeviceLocation, setWidgets]);

  // Automatically sanitize hardcoded textfield questions/responses and stale geologs from current session
  useEffect(() => {
    const hasAnyHardcoded = (widgets || []).some(
      (w) =>
        (w.type === "textfield" &&
          ((w.questions || []).some(isHardcodedTextFieldQuestion) ||
            (w.responses || []).some(isHardcodedTextFieldResponse))) ||
        (w.type === "location" &&
          ((w.locationHistory || []).some(isStaleTestGeolog) ||
            (w.lastLocation && isStaleTestGeolog(w.lastLocation))))
    );
    if (hasAnyHardcoded) {
      setWidgets((prev) => {
        const cleaned = sanitizeWidgets(prev);
        if (autoPersistApp) autoPersistApp(cleaned);
        return cleaned;
      });
    }
  }, [widgets, setWidgets, autoPersistApp]);

  const getAccurateLocationForSwitch = useCallback(async ({ maxAccuracy = 5000, timeoutMs = 10000 } = {}) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      const err = new Error("Location services unavailable on this device");
      err.errorType = "SERVICES_DISABLED";
      throw err;
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setLocationPermissionStatus("granted");
          localStorage.setItem("innoide:location_permission_granted", "true");
          const rawAcc = pos?.coords?.accuracy;
          const acc = (typeof rawAcc === "number" && !isNaN(rawAcc)) ? Math.round(rawAcc) : 15;
          const lat = parseFloat(pos.coords.latitude.toFixed(5));
          const lng = parseFloat(pos.coords.longitude.toFixed(5));
          let city = "Local Area";
          let address = `${lat}° N, ${lng}° E`;

          try {
            const controller = new AbortController();
            const tid = setTimeout(() => controller.abort(), 2500);
            const r = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&accept-language=en`,
              { signal: controller.signal, headers: { "Accept-Language": "en" } }
            );
            clearTimeout(tid);
            if (r.ok) {
              const d = await r.json();
              city =
                d.name ||
                d.address?.railway ||
                d.address?.neighbourhood ||
                d.address?.suburb ||
                (d.display_name ? d.display_name.split(",")[0].trim() : "") ||
                d.address?.city ||
                "Local Area";
              address = d.display_name?.split(",").slice(0, 4).join(",").trim() || address;
            }
          } catch (e) {
            // Reverse geocoding failed, fallback to defaults
          }

          resolve({
            lat,
            lng,
            accuracy: acc,
            city,
            address,
            source: "GPS",
            timestamp: new Date().toLocaleTimeString()
          });
        },
        async (err) => {
          if (err.code === 1) {
            setLocationPermissionStatus("denied");
            localStorage.setItem("innoide:location_permission_granted", "false");
            const e = new Error("Location permission denied by user.");
            e.errorType = "PERMISSION_DENIED";
            return reject(e);
          }

          // Fallback to IP positioning if GPS times out indoors
          try {
            const ipRes = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3500) });
            if (ipRes.ok) {
              const ipData = await ipRes.json();
              if (ipData && ipData.latitude && ipData.longitude) {
                return resolve({
                  lat: parseFloat(Number(ipData.latitude).toFixed(5)),
                  lng: parseFloat(Number(ipData.longitude).toFixed(5)),
                  accuracy: 100,
                  city: ipData.city || "Local Area",
                  address: `${ipData.city || ""}, ${ipData.region || ""}, ${ipData.country_name || ""}`.replace(/^, |, $/g, '') || "Local Area",
                  source: "Network",
                  timestamp: new Date().toLocaleTimeString()
                });
              }
            }
          } catch (e) {}

          let errorType = "UNKNOWN";
          if (err.code === 2) errorType = "SERVICES_DISABLED";
          else if (err.code === 3) errorType = "TIMEOUT";
          const e = new Error(err.message || "Failed to acquire accurate GPS");
          e.errorType = errorType;
          reject(e);
        },
        { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 30000 }
      );
    });
  }, []);

  const recordSwitchLocation = useCallback(
    async (isOn, switchTitle = "Device Switch", providedLoc = null) => {
      try {
        const loc = providedLoc || (await fetchCurrentDeviceLocation());
        const eventLabel = isOn ? "ON" : "OFF";
        const record = {
          id: `loc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          event: eventLabel,
          switchTitle: switchTitle || "Device Switch",
          lat: loc.lat != null ? parseFloat(Number(loc.lat).toFixed(5)) : null,
          lng: loc.lng != null ? parseFloat(Number(loc.lng).toFixed(5)) : null,
          accuracy: loc.accuracy != null ? loc.accuracy : (isOn ? 12 : 10),
          city: loc.city || "Current Location",
          address: loc.address || (loc.lat != null ? `${Number(loc.lat).toFixed(4)}°, ${Number(loc.lng).toFixed(4)}°` : ""),
          time: loc.timestamp || new Date().toLocaleTimeString(),
          timestamp: Date.now()
        };

        let updatedList = null;
        let newHist = [record];
        setWidgets((prev) => {
          const isMatch = (a, b) =>
            (a.id && b.id && a.id === b.id) ||
            (Math.abs(getLogTimestampMs(a) - getLogTimestampMs(b)) < 2000 && a.event === b.event);

          const next = prev.map((w) => {
            if (w.type === "location") {
              const filtered = (Array.isArray(w.locationHistory) ? w.locationHistory : []).filter((h) => !isMatch(h, record));
              const hist = [record, ...filtered.slice(0, 49)];
              hist.sort((a, b) => getLogTimestampMs(b) - getLogTimestampMs(a));
              newHist = hist;
              return {
                ...w,
                lastLocation: record,
                lastOnLocation: isOn ? record : (w.lastOnLocation || (hist.find(h => h.event === "ON") || null)),
                lastOffLocation: !isOn ? record : (w.lastOffLocation || (hist.find(h => h.event === "OFF") || null)),
                locationHistory: hist
              };
            }
            if (w.type === "switch" || w.id === "w-led") {
              return {
                ...w,
                lastLocation: record,
                lastOnLocation: isOn ? record : (w.lastOnLocation || null),
                lastOffLocation: !isOn ? record : (w.lastOffLocation || null)
              };
            }
            return w;
          });
          updatedList = next;
          return next;
        });

        if (updatedList && autoPersistApp) {
          autoPersistApp(updatedList);
        }

        // Synchronize with companion server
        fetch("http://localhost:5055/api/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: record,
            lastLocation: record,
            switchLocations: newHist,
            syncOnly: true
          })
        }).catch(() => { });

        if (onLocationUpdatedRef.current) {
          setTimeout(() => {
            onLocationUpdatedRef.current?.();
          }, 100);
        }

        return record;
      } catch (e) {
        console.warn("Location capture warning:", e);
      }
    },
    [fetchCurrentDeviceLocation, setWidgets, autoPersistApp]
  );

  return {
    deviceDetectedLocation,
    setDeviceDetectedLocation,
    isDetectingLocation,
    fetchCurrentDeviceLocation,
    handleCalibrateLocation,
    recordSwitchLocation,
    getAccurateLocationForSwitch
  };
}
