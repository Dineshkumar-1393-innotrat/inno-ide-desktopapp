import { streamLogs } from "../../terminal/services/MockTerminalService";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const executeRuntimeLifecycle = async (payload, callbacks) => {
  const { workspaceId, metadata } = payload;
  const { onStateChange, onLog, onMetadataUpdate } = callbacks;

  // 1. Upload Complete (Simulated as immediate since uploadProject finished)
  onLog(`> Uploading project.zip...`);
  onLog(`> Upload completed.`);

  // 2. Extracting
  onStateChange("extracting");
  onLog(`> Extracting archive...`);
  await delay(1500);

  // 3. Detecting Framework
  onStateChange("detecting");
  onLog(`> Scanning project structure...`);
  await delay(1000);
  
  const actualFramework = metadata.framework === "Unknown" ? "Static HTML/JS" : metadata.framework;
  
  onLog(`> Framework: ${actualFramework}`);
  if (metadata.packageManager && metadata.packageJsonContent) {
    onLog(`> Package Manager: ${metadata.packageManager}`);
  }
  
  if (metadata.framework === "Unknown") {
    onMetadataUpdate({ framework: "Static HTML/JS", projectType: "static" });
  }

  // 4. Installing Dependencies
  if (metadata.packageJsonContent) {
    onStateChange("installing");
    onLog(`> Running ${metadata.packageManager || "npm"} install...`);
    
    const installLogs = [
      "> Installing dependencies...",
      "> added 234 packages...",
      "> Done."
    ];
    await streamLogs(installLogs, onLog, 400);
  } else {
    onStateChange("installing"); // just skip through
    onLog(`> No package.json found. Skipping installation.`);
    await delay(500);
  }

  // 5. Starting Server
  onStateChange("starting");
  if (metadata.packageJsonContent) {
    onLog(`> Starting development server...`);
    const startLogs = [
      "> Local: http://localhost:5173",
      "> Ready in 2.3s"
    ];
    await streamLogs(startLogs, onLog, 500);
  } else {
    onLog(`> Starting static file server...`);
    await streamLogs(["> Serving files at http://localhost:5173", "> Ready"], onLog, 500);
  }

  // 6. Running
  onStateChange("running");
  onMetadataUpdate({
    previewUrl: "http://localhost:5173"
  });
};
