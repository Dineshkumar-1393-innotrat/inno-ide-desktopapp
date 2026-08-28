import { parseZipFile } from "./ZipParserService";

export const uploadProject = (file, onProgress) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error("No file selected."));
    }
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(async () => {
      progress += Math.floor(Math.random() * 20) + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        onProgress(progress);
        
        try {
          // Parse ZIP natively in the browser
          const { tree, metadata } = await parseZipFile(file);
          
          resolve({
            workspaceId: metadata.workspaceId,
            projectName: metadata.projectName,
            uploadedFileName: file.name,
            projectFiles: tree,
            metadata
          });
        } catch (error) {
          reject(new Error(`Failed to parse ZIP file: ${error.message}`));
        }
      } else {
        onProgress(progress);
      }
    }, 300);
  });
};
