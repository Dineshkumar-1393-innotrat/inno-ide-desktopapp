/**
 * resetAction.js
 *
 * Defines the global RESET_WORKSPACE Redux action.
 *
 * When dispatched:
 *   - All workspace slices (blockDiagram, flowchart, editor, blockProgramming,
 *     simulation, mathEditor) reset to their initialState.
 *   - The workspaceSlice is NOT affected (it holds runtime metadata, not user data).
 *   - No localStorage data is deleted — only the in-memory Redux state is cleared.
 *
 * Must be dispatched AFTER flushing pending saves (to avoid losing data) and
 * BEFORE loading the new project's persisted state.
 */

export const RESET_WORKSPACE = 'workspace/RESET_WORKSPACE';

export const resetWorkspace = () => ({ type: RESET_WORKSPACE });

export default resetWorkspace;
