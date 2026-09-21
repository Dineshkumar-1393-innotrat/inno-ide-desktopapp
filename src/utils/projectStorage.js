/**
 * projectStorage.js
 *
 * A project-aware localStorage adapter for redux-persist.
 *
 * Design goals:
 * - Each (userId, projectId) pair has its own isolated persistence bucket.
 * - Switching projects switches the bucket. The old bucket is NOT deleted.
 * - The adapter wraps the standard redux-persist storage interface.
 * - updateProjectContext(userId, projectId) is the ONLY way to change the active bucket.
 *   It must be called by ProjectContext.switchProject() before persist rehydrates.
 *
 * Storage key format:
 *   persist:ide:{userId}:{projectId}:{key}
 *
 * Saving: uses the current context captured at the moment of updateProjectContext().
 * Debounced saves use the context captured at the time they were scheduled, NOT at
 * the time they fire. This prevents a delayed save from Project A from writing to
 * Project B's bucket after a project switch.
 */

// ─── Internal state ───────────────────────────────────────────────────────────

let _currentUserId = 'anonymous';
let _currentProjectId = 'default';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build the namespaced storage key for redux-persist.
 * @param {string} userId
 * @param {string} projectId
 * @param {string} key  – the redux-persist slice key (e.g. "blockDiagram")
 */
export const buildPersistKey = (userId, projectId, key) => {
  const safeUser = userId || 'anonymous';
  const safeProject = projectId || 'default';
  return `persist:ide:${safeUser}:${safeProject}:${key}`;
};

/**
 * Returns the current active (userId, projectId) context.
 */
export const getCurrentContext = () => ({
  userId: _currentUserId,
  projectId: _currentProjectId,
});

// ─── Context update ───────────────────────────────────────────────────────────

/**
 * Set the active project context for the storage adapter.
 * Called by ProjectContext.switchProject() BEFORE persist rehydration.
 * @param {string} userId
 * @param {string} projectId
 */
export const updateProjectContext = (userId, projectId) => {
  const prevUser = _currentUserId;
  const prevProject = _currentProjectId;
  _currentUserId = userId || 'anonymous';
  _currentProjectId = projectId || 'default';
  console.log(
    `[ProjectStorage] Context updated: ${prevUser}:${prevProject} → ${_currentUserId}:${_currentProjectId}`
  );
};

// ─── redux-persist storage adapter ───────────────────────────────────────────

/**
 * A storage adapter that delegates to localStorage using the currently active
 * project context. Implements the redux-persist storage interface:
 * { getItem, setItem, removeItem }
 *
 * IMPORTANT: All reads/writes use the context that was active when the call is made.
 * Since redux-persist calls getItem during rehydration (right after we call
 * updateProjectContext), and setItem during saves, this is safe as long as
 * updateProjectContext is called before pausing PersistGate / triggering rehydration.
 */
export const projectAwareStorage = {
  /**
   * Read a value. Used by redux-persist during rehydration.
   * @param {string} key  – e.g. "root" (the top-level persist key)
   */
  getItem: (key) => {
    try {
      const storageKey = buildPersistKey(_currentUserId, _currentProjectId, key);
      const value = localStorage.getItem(storageKey);
      console.log(`[ProjectStorage] getItem "${storageKey}" → ${value ? 'found' : 'null'}`);
      return Promise.resolve(value);
    } catch (e) {
      console.error('[ProjectStorage] getItem failed:', e);
      return Promise.resolve(null);
    }
  },

  /**
   * Write a value. Used by redux-persist when state changes.
   */
  setItem: (key, value) => {
    try {
      const storageKey = buildPersistKey(_currentUserId, _currentProjectId, key);
      localStorage.setItem(storageKey, value);
      return Promise.resolve();
    } catch (e) {
      console.error('[ProjectStorage] setItem failed:', e);
      return Promise.resolve();
    }
  },

  /**
   * Remove a value. Used by redux-persist on purge.
   * IMPORTANT: purge() only removes the CURRENT project bucket's keys.
   * Other projects' buckets are untouched.
   */
  removeItem: (key) => {
    try {
      const storageKey = buildPersistKey(_currentUserId, _currentProjectId, key);
      localStorage.removeItem(storageKey);
      console.log(`[ProjectStorage] removeItem "${storageKey}"`);
      return Promise.resolve();
    } catch (e) {
      console.error('[ProjectStorage] removeItem failed:', e);
      return Promise.resolve();
    }
  },
};

// ─── Utility: list all project buckets in localStorage ────────────────────────

/**
 * List all project buckets currently in localStorage.
 * Returns an array of { userId, projectId, key, storageKey } objects.
 */
export const listProjectBuckets = () => {
  const buckets = [];
  const prefix = 'persist:ide:';
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix)) {
      // persist:ide:{userId}:{projectId}:{key}
      const rest = k.slice(prefix.length);
      const parts = rest.split(':');
      if (parts.length >= 3) {
        buckets.push({
          userId: parts[0],
          projectId: parts[1],
          key: parts.slice(2).join(':'),
          storageKey: k,
        });
      }
    }
  }
  return buckets;
};

/**
 * Purge ALL keys belonging to a specific project bucket.
 * Safe to call when a project is deleted.
 * @param {string} userId
 * @param {string} projectId
 */
export const purgeProjectBucket = (userId, projectId) => {
  const prefix = `persist:ide:${userId || 'anonymous'}:${projectId || 'default'}:`;
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix)) {
      keysToRemove.push(k);
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
  console.log(`[ProjectStorage] Purged ${keysToRemove.length} keys for ${userId}:${projectId}`);
};

export default projectAwareStorage;
