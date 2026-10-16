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
]);

export function useRouteRestoration() {
  const location = useLocation();
  const navigate = useNavigate();
  const hasRestored = useRef(false);

  // ── Step 1: Save current route on every navigation ─────────────────────────
  useEffect(() => {
    const path = location.pathname;
    if (EXCLUDED_ROUTES.has(path)) return;

    try {
      localStorage.setItem(
        ROUTE_KEY,
        JSON.stringify({ path, ts: Date.now() })
      );
      const rawUser = localStorage.getItem("userData");
      if (rawUser) {
        try {
          const uid = JSON.parse(rawUser)?.userId;
          if (uid) {
            localStorage.setItem(`innoide:last_active_route:${uid}`, path);
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

    // Only restore if we're at the hash root (haven't navigated anywhere yet)
    if (location.pathname !== "/") return;

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
      let targetAge = 0;

      if (userData) {
        try {
          const uid = JSON.parse(userData)?.userId;
          if (uid) {
            const userRoute = localStorage.getItem(`innoide:last_active_route:${uid}`);
            if (userRoute && !EXCLUDED_ROUTES.has(userRoute) && userRoute !== "/") {
              targetPath = userRoute;
            }
          }
        } catch (e) {}
      }

      if (!targetPath) {
        const raw = localStorage.getItem(ROUTE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const { path, ts } = parsed;
          const age = Date.now() - (ts || 0);
          if (path && typeof path === "string" && !EXCLUDED_ROUTES.has(path) && path !== "/" && age < ROUTE_TTL_MS) {
            targetPath = path;
            targetAge = age;
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
