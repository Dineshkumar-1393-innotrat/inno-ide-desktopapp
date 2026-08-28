import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { uploadProject } from "../upload/services/UploadService";
import { executeRuntimeLifecycle } from "../runtime/services/MockRuntimeService";

import { API } from "../../../config/api";
import axios from "axios";

const USE_BACKEND_IMPORT = true;

export const importProjectZip = createAsyncThunk(
  "workspace/importProjectZip",
  async ({ file, userId, projectName }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setRuntimeState("uploading"));
      
      if (USE_BACKEND_IMPORT) {
        if (!userId) {
          throw new Error("userId is required for backend import.");
        }
        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("projectName", projectName || file.name.replace(".zip", ""));
        formData.append("file", file);

        const response = await axios.post(`${API.MAIN}/api/v1/childapp/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              dispatch(setUploadProgress(progress));
            }
          }
        });

        const data = response.data;
        if (data.status !== "success") {
          throw new Error(data.message || "Upload failed");
        }

        const rootFolderId = data.data.rootFolderId;
        const subApps = data.data.subApps || [];
        const isStatic = subApps.length === 0;
        const activeSubApp = subApps.length > 0 ? subApps[0].name : "_root";

        dispatch(setWorkspaceMetadata({
          rootFolderId,
          subApps,
          activeSubApp,
          projectName: projectName || file.name.replace(".zip", ""),
          projectType: isStatic ? "static" : "node",
          framework: isStatic ? "html" : "node",
        }));

        if (isStatic) {
          dispatch(setRuntimeState("running"));
        } else {
          dispatch(setRuntimeState("ready"));
        }
        dispatch(setUploadProgress(100));

        return { rootFolderId, subApps };
      } else {
        const result = await uploadProject(file, (progress) => {
          dispatch(setUploadProgress(progress));
        });
        
        dispatch(setWorkspaceMetadata({
          workspaceId: result.workspaceId,
          projectName: result.projectName,
          uploadedFileName: result.uploadedFileName,
          framework: result.metadata.framework,
          packageManager: result.metadata.packageManager,
          projectType: result.metadata.projectType,
          scripts: result.metadata.scripts
        }));
        dispatch(setProjectFiles(result.projectFiles));

        dispatch(runProjectLifecycle({
          workspaceId: result.workspaceId,
          metadata: result.metadata
        }));

        return result;
      }
    } catch (error) {
      dispatch(setRuntimeState("failed"));
      return rejectWithValue(error.response?.data?.message || error.message || "Upload failed");
    }
  }
);

export const startChildApp = createAsyncThunk(
  "workspace/startChildApp",
  async ({ rootFolderId, subAppName }, { dispatch, rejectWithValue }) => {
    try {
      const targetFolderId = rootFolderId || localStorage.getItem("activeProjectId");
      if (!targetFolderId) {
        throw new Error("No active project or rootFolderId found.");
      }

      let appName = subAppName;
      if (!appName || appName === "_root") {
        try {
          const appsRes = await axios.get(`${API.MAIN}/api/v1/childapp/${targetFolderId}/apps`);
          if (appsRes.data?.data && appsRes.data.data.length > 0) {
            appName = appsRes.data.data[0].subAppName;
          }
        } catch (e) {}
      }
      appName = appName || "_root";

      dispatch(setRuntimeState("starting"));
      dispatch(clearTerminalLogs());
      dispatch(appendTerminalLog(`> Initializing child application runtime (${appName})...`));

      const startRes = await axios.post(
        `${API.MAIN}/api/v1/childapp/${targetFolderId}/${encodeURIComponent(appName)}/start`
      );

      if (startRes.data?.status !== "success") {
        throw new Error(startRes.data?.message || "Failed to start application");
      }

      dispatch(appendTerminalLog(`> Application started, waiting for server port...`));

      let attempts = 0;
      const maxAttempts = 35;
      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts++;

        try {
          const statusRes = await axios.get(
            `${API.MAIN}/api/v1/childapp/${targetFolderId}/${encodeURIComponent(appName)}/status`
          );
          const statusData = statusRes.data?.data;

          try {
            const logsRes = await axios.get(
              `${API.MAIN}/api/v1/childapp/${targetFolderId}/${encodeURIComponent(appName)}/logs`
            );
            if (logsRes.data?.data?.logs) {
              const logs = logsRes.data.data.logs.split("\n");
              dispatch(clearTerminalLogs());
              logs.forEach((l) => dispatch(appendTerminalLog(l)));
            }
          } catch (e) {}

          if (statusData?.status === "running") {
            const previewUrl = `${API.MAIN}/preview/${targetFolderId}/${encodeURIComponent(appName)}`;
            dispatch(setWorkspaceMetadata({
              previewUrl,
              runtimeState: "running",
              rootFolderId: targetFolderId,
              activeSubApp: appName
            }));
            dispatch(appendTerminalLog(`> Live Preview available at: ${previewUrl}`));
            return { previewUrl, port: statusData.port };
          } else if (statusData?.status === "error") {
            throw new Error(statusData.lastError || "Application process exited with an error.");
          }
        } catch (pollErr) {
          if (pollErr.message && (pollErr.message.includes("exited") || pollErr.message.includes("error"))) {
            throw pollErr;
          }
        }
      }

      const fallbackPreviewUrl = `${API.MAIN}/preview/${targetFolderId}/${encodeURIComponent(appName)}`;
      dispatch(setWorkspaceMetadata({
        previewUrl: fallbackPreviewUrl,
        runtimeState: "running",
        rootFolderId: targetFolderId,
        activeSubApp: appName
      }));
      return { previewUrl: fallbackPreviewUrl };
    } catch (error) {
      dispatch(setRuntimeState("failed"));
      const msg = error.response?.data?.message || error.message || "Failed to start project";
      dispatch(appendTerminalLog(`> Error starting app: ${msg}`));
      return rejectWithValue(msg);
    }
  }
);

export const stopChildApp = createAsyncThunk(
  "workspace/stopChildApp",
  async ({ rootFolderId, subAppName = "_root" }, { dispatch, rejectWithValue }) => {
    try {
      const targetFolderId = rootFolderId || localStorage.getItem("activeProjectId");
      const appName = subAppName || "_root";
      await axios.post(
        `${API.MAIN}/api/v1/childapp/${targetFolderId}/${encodeURIComponent(appName)}/stop`
      );
      dispatch(setRuntimeState("stopped"));
      dispatch(appendTerminalLog("> Child application stopped."));
      return true;
    } catch (error) {
      dispatch(setRuntimeState("stopped"));
      dispatch(appendTerminalLog(`> Error stopping app: ${error.message}`));
      return rejectWithValue(error.message);
    }
  }
);

export const installChildApp = createAsyncThunk(
  "workspace/installChildApp",
  async ({ rootFolderId, subAppName = "_root" }, { dispatch, rejectWithValue }) => {
    try {
      const targetFolderId = rootFolderId || localStorage.getItem("activeProjectId");
      if (!targetFolderId) throw new Error("No project selected");
      const appName = subAppName || "_root";

      dispatch(setRuntimeState("installing"));
      dispatch(clearTerminalLogs());
      dispatch(appendTerminalLog(`> Running npm install for ${appName}...`));

      await axios.post(
        `${API.MAIN}/api/v1/childapp/${targetFolderId}/${encodeURIComponent(appName)}/install`
      );

      let attempts = 0;
      while (attempts < 45) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        attempts++;

        try {
          const logsRes = await axios.get(
            `${API.MAIN}/api/v1/childapp/${targetFolderId}/${encodeURIComponent(appName)}/logs`
          );
          if (logsRes.data?.data?.logs) {
            const logs = logsRes.data.data.logs.split("\n");
            dispatch(clearTerminalLogs());
            logs.forEach((l) => dispatch(appendTerminalLog(l)));
          }

          const statusRes = await axios.get(
            `${API.MAIN}/api/v1/childapp/${targetFolderId}/${encodeURIComponent(appName)}/status`
          );
          if (statusRes.data?.data?.status !== "installing") {
            dispatch(appendTerminalLog("> Installation complete. Launching server..."));
            dispatch(startChildApp({ rootFolderId: targetFolderId, subAppName: appName }));
            return true;
          }
        } catch (e) {}
      }
      dispatch(appendTerminalLog("> Installation complete. Launching server..."));
      dispatch(startChildApp({ rootFolderId: targetFolderId, subAppName: appName }));
    } catch (error) {
      dispatch(setRuntimeState("failed"));
      const msg = error.response?.data?.message || error.message || "Install failed";
      dispatch(appendTerminalLog(`> Install error: ${msg}`));
      return rejectWithValue(msg);
    }
  }
);

export const fetchChildAppLogs = createAsyncThunk(
  "workspace/fetchChildAppLogs",
  async ({ rootFolderId, subAppName }, { dispatch, rejectWithValue }) => {
    try {
      const targetFolderId = rootFolderId || localStorage.getItem("activeProjectId");
      const appName = subAppName || "_root";
      const logsRes = await axios.get(
        `${API.MAIN}/api/v1/childapp/${targetFolderId}/${encodeURIComponent(appName)}/logs`
      );
      if (logsRes.data?.data?.logs) {
        const logs = logsRes.data.data.logs.split("\n");
        dispatch(clearTerminalLogs());
        logs.forEach((l) => dispatch(appendTerminalLog(l)));
        return logsRes.data.data.logs;
      }
      return "";
    } catch (error) {
      dispatch(appendTerminalLog(`> Error fetching logs: ${error.message}`));
      return rejectWithValue(error.message);
    }
  }
);

export const runProjectLifecycle = createAsyncThunk(
  "workspace/runProjectLifecycle",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      await executeRuntimeLifecycle(payload, {
        onStateChange: (state) => {
          dispatch(setRuntimeState(state));
        },
        onLog: (log) => {
          dispatch(appendTerminalLog(log));
        },
        onMetadataUpdate: (metadata) => {
          dispatch(setWorkspaceMetadata(metadata));
        },
        onFilesReady: (files) => {
          dispatch(setProjectFiles(files));
        }
      });
      return true;
    } catch (error) {
      dispatch(setRuntimeState("failed"));
      dispatch(appendTerminalLog(`> Error: ${error.message}`));
      return rejectWithValue(error.message || "Lifecycle failed");
    }
  }
);

const initialState = {
  rootFolderId: null,
  subApps: [],
  activeSubApp: "_root",
  workspaceId: null,
  projectName: "",
  uploadedFileName: "",
  framework: "",
  packageManager: "",
  projectType: "",
  scripts: {},
  runtimeState: "idle",
  previewUrl: "",
  terminalLogs: [],
  projectFiles: [],
  progress: 0,
  error: null,
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setRuntimeState(state, action) {
      state.runtimeState = action.payload;
    },
    setUploadProgress(state, action) {
      state.progress = action.payload;
    },
    setWorkspaceMetadata(state, action) {
      Object.assign(state, action.payload);
    },
    appendTerminalLog(state, action) {
      state.terminalLogs.push(action.payload);
    },
    clearTerminalLogs(state) {
      state.terminalLogs = [];
    },
    setProjectFiles(state, action) {
      state.projectFiles = action.payload;
    },
    resetWorkspace(state) {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(importProjectZip.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(runProjectLifecycle.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { 
  setRuntimeState, 
  setUploadProgress, 
  setWorkspaceMetadata, 
  appendTerminalLog, 
  clearTerminalLogs, 
  setProjectFiles, 
  resetWorkspace 
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
