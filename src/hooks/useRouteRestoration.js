/**
 * useRouteRestoration
 *
 * Persists the currently active route path to localStorage on every navigation,
 * and restores it automatically when the app first mounts (e.g. after a hot-reload
 * or an Electron app restart).
 *
 * Why this is needed:
 *  - The app uses createHashRouter in Electron, so the initial URL is always `#/`.
 *  - Without restoration, idle reloads or HMR always land the user on the Home/Login
 *    screen instead of the screen they were on (e.g. /flasher, /rule-engine, /BlockDiagram).
 *
 * TTL: 30 minutes — routes older than that are NOT restored (safe default for cold restarts).
 */
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ROUTE_KEY = "innoide:last_active_route";
const ROUTE_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Routes that should NEVER be restored on reload.
 * Includes auth flows, the home/login screen, and utility pages.
 */
const EXCLUDED_ROUTES = new Set([
  "/",
  "/createaccount",
  "/forgotpassword",
  "/logout",
  "/autosave-demo",
  "/userbutton",
  "/defineproductone",
  "/defineproducttwo",
  "/defineproduct",
  "/index.html",
]);

/**
 * Known valid application routes that can be safely restored.
 */
const KNOWN_VALID_ROUTES = new Set([
  "/editor",
  "/flowcharttest",
  "/feedback",
  "/textbox",
  "/fileupload",
  "/simulation",
  "/simulationpopup",
  "/blockdiagram",
  "/blockprogramming",
  "/fileexplorerone",
  "/createproductdefination",
  "/view-data",
  "/embedded",
  "/embedded/manage",
  "/toggle",
  "/mathcodeeditor",
  "/meet",
  "/rule-engine",
  "/flasher",
  "/template",
]);

/**
 * Sanitizes and validates a route candidate.
 * Returns a valid route string (e.g. "/editor") or null if invalid/corrupt.
 */
export function sanitizeRoute(rawRoute) {
  if (!rawRoute || typeof rawRoute !== "string") return null;

  let cleaned = rawRoute.trim();

  // If raw string is JSON, attempt to extract the path property
  if (cleaned.startsWith("{")) {
    try {
      const parsed = JSON.parse(cleaned);
      cleaned = parsed?.path || "";
    } catch {
      return null;
    }
  }

  // Reject malformed, encoded JSON remnants or bad characters
  if (
    !cleaned ||
    cleaned.startsWith("/%7B") ||
    cleaned.startsWith("/%7b") ||
    cleaned.startsWith("/{") ||
    cleaned.includes("%22") ||
    cleaned.includes('"') ||
    cleaned.includes("}") ||
    cleaned.includes("%7D") ||
    cleaned.includes("%7d") ||
    cleaned.includes("<") ||
    cleaned.includes(">")
  ) {
    return null;
  }

  // Must begin with a single slash
  if (!cleaned.startsWith("/")) return null;

  // Check excluded routes
  if (EXCLUDED_ROUTES.has(cleaned)) return null;

  // Check against known valid routes
  const normalizedPath = cleaned.split("?")[0].split("#")[0].toLowerCase();
  const isValid =
    KNOWN_VALID_ROUTES.has(normalizedPath) ||
    normalizedPath.startsWith("/meet/");

  return isValid ? cleaned : null;
}

export function useRouteRestoration() {
  const location = useLocation();
  const navigate = useNavigate();
  const hasRestored = useRef(false);

  // Proactive cleanup of any corrupt or JSON-encoded routes in localStorage
  useEffect(() => {
    try {
      const checkAndCleanKey = (k) => {
        const val = localStorage.getItem(k);
        if (
          val &&
          (val.includes("%7B") ||
            val.includes("%7b") ||
            val.includes("/%7B") ||
            val.includes('{"path":"/%7B'))
        ) {
          localStorage.removeItem(k);
        }
      };

      checkAndCleanKey(ROUTE_KEY);
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("innoide:last_active_route")) {
          checkAndCleanKey(k);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  // ── Step 1: Save current route on every navigation ─────────────────────────
  useEffect(() => {
    const path = location.pathname;
    const sanitized = sanitizeRoute(path);
    if (!sanitized) return;

    try {
      localStorage.setItem(
        ROUTE_KEY,
        JSON.stringify({ path: sanitized, ts: Date.now() })
      );
      const rawUser = localStorage.getItem("userData");
      if (rawUser) {
        try {
          const uid = JSON.parse(rawUser)?.userId;
          if (uid) {
            localStorage.setItem(`innoide:last_active_route:${uid}`, sanitized);
          }
        } catch (e) {}
      }
    } catch {
      // localStorage might be full or unavailable; fail silently
    }
  }, [location.pathname]);

  // ── Step 2: Restore route on first mount only ───────────────────────────────
  // Only navigates if the current path is "/" (the hash-router starting point),
  // user is authenticated, and the stored route is valid & within TTL window.
  useEffect(() => {
    if (hasRestored.current) return;
    hasRestored.current = true;

    // Check if the current location is already corrupted in the URL bar
    const currentPath = location.pathname;
    if (
      currentPath.startsWith("/%7B") ||
      currentPath.startsWith("/%7b") ||
      currentPath.startsWith("/{") ||
      currentPath.includes("%22")
    ) {
      console.warn(
        `[RouteRestoration] Corrupted route in address bar detected (${currentPath}), redirecting to /editor`
      );
      try {
        localStorage.removeItem(ROUTE_KEY);
      } catch {}
      navigate("/editor", { replace: true });
      return;
    }

    // Only restore if we're at the hash root (haven't navigated anywhere yet)
    if (currentPath !== "/") return;

    // Check authentication: If user is not logged in, stay on the Login screen
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const userData =
      localStorage.getItem("userData") || sessionStorage.getItem("userData");

    if (!token && !userData) {
      return;
    }

    try {
      let targetPath = null;

      if (userData) {
        try {
          const uid = JSON.parse(userData)?.userId;
          if (uid) {
            const userRoute = localStorage.getItem(
              `innoide:last_active_route:${uid}`
            );
            const valid = sanitizeRoute(userRoute);
            if (valid) {
              targetPath = valid;
            } else if (userRoute) {
              localStorage.removeItem(`innoide:last_active_route:${uid}`);
            }
          }
        } catch (e) {}
      }

      if (!targetPath) {
        const raw = localStorage.getItem(ROUTE_KEY);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            const { path, ts } = parsed || {};
            const age = Date.now() - (ts || 0);
            const valid = sanitizeRoute(path);
            if (valid && age < ROUTE_TTL_MS) {
              targetPath = valid;
            } else {
              localStorage.removeItem(ROUTE_KEY);
            }
          } catch {
            localStorage.removeItem(ROUTE_KEY);
          }
        }
      }

      if (targetPath) {
        console.log(`[RouteRestoration] Restoring route: ${targetPath}`);
        navigate(targetPath, { replace: true });
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
