import JSZip from "jszip";

// Helper to determine if file is binary
const isBinaryFile = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const binaryExtensions = [
    'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp',
    'pdf', 'zip', 'rar', 'tar', 'gz', '7z',
    'woff', 'woff2', 'ttf', 'eot', 'otf',
    'mp3', 'mp4', 'webm', 'ogg', 'wav'
  ];
  return binaryExtensions.includes(ext);
};

// Helper to identify project framework
const identifyProjectMetadata = (filePaths, packageJsonContent) => {
  const metadata = {
    framework: "Unknown",
    packageManager: "npm", // default
    projectType: "unknown",
    hasDocker: false,
    hasReadme: false,
    scripts: {}
  };

  // Check files
  filePaths.forEach(path => {
    const filename = path.split('/').pop().toLowerCase();
    if (filename === 'dockerfile' || filename === 'docker-compose.yml') metadata.hasDocker = true;
    if (filename === 'readme.md') metadata.hasReadme = true;
    if (filename === 'yarn.lock') metadata.packageManager = "yarn";
    if (filename === 'pnpm-lock.yaml') metadata.packageManager = "pnpm";
    if (filename === 'bun.lockb') metadata.packageManager = "bun";
    if (filename === 'vite.config.js' || filename === 'vite.config.ts') {
      metadata.framework = "Vite";
      metadata.projectType = "vite";
    }
    if (filename === 'next.config.js') {
      metadata.framework = "Next.js";
      metadata.projectType = "nextjs";
    }
    if (filename === 'angular.json') {
      metadata.framework = "Angular";
      metadata.projectType = "angular";
    }
    if (filename === 'vue.config.js') {
      metadata.framework = "Vue";
      metadata.projectType = "vue";
    }
    if (filename === 'tsconfig.json') metadata.isTypeScript = true;
  });

  // Parse package.json
  if (packageJsonContent) {
    try {
      const pkg = JSON.parse(packageJsonContent);
      metadata.scripts = pkg.scripts || {};
      
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      if (deps['react'] && metadata.framework === "Unknown") {
        metadata.framework = "React (Create React App)";
        metadata.projectType = "react";
      }
      if (deps['express'] && metadata.framework === "Unknown") {
        metadata.framework = "Express.js";
        metadata.projectType = "express";
      }
      if (deps['@nestjs/core']) {
        metadata.framework = "NestJS";
        metadata.projectType = "nest";
      }
    } catch (e) {
      console.warn("Failed to parse package.json");
    }
  }

  // Refine if we found vite + react
  if (metadata.framework === "Vite") {
    if (packageJsonContent && packageJsonContent.includes('"react"')) {
      metadata.framework = "React + Vite";
      metadata.projectType = "vite-react";
    }
  }

  return metadata;
};

export const parseZipFile = async (file) => {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);
  
  const filePaths = [];
  let packageJsonContent = null;
  const rawNodes = {};
  
  const rootId = `root_${Date.now()}`;
  let baseFolder = null;

  // 1. Identify common base folder if everything is wrapped in one root folder
  const paths = Object.keys(loadedZip.files);
  const topLevelDirs = new Set();
  paths.forEach(p => {
    if (!p.includes('/')) topLevelDirs.add(p);
    else topLevelDirs.add(p.split('/')[0] + '/');
  });

  // If there's exactly one top-level directory and it contains all files, we use it as base
  if (topLevelDirs.size === 1) {
    const onlyDir = Array.from(topLevelDirs)[0];
    if (onlyDir.endsWith('/')) {
      baseFolder = onlyDir;
    }
  }

  // 2. Extract files
  for (const relativePath in loadedZip.files) {
    const zipEntry = loadedZip.files[relativePath];
    
    // Skip OSX metadata
    if (relativePath.includes('__MACOSX') || relativePath.includes('.DS_Store')) continue;
    
    // Normalize path by stripping baseFolder if it exists
    let normalizedPath = relativePath;
    if (baseFolder && normalizedPath.startsWith(baseFolder)) {
      normalizedPath = normalizedPath.substring(baseFolder.length);
    }
    
    if (!normalizedPath) continue;
    
    const parts = normalizedPath.split('/').filter(Boolean);
    const fileName = parts[parts.length - 1];
    const isDir = zipEntry.dir || relativePath.endsWith('/');
    
    filePaths.push(normalizedPath);
    
    let content = null;
    let type = isDir ? 'folder' : 'file';
    
    if (!isDir) {
      if (isBinaryFile(fileName)) {
        type = 'file_binary';
        // Do not load content for binary, or load as base64 if needed later
      } else {
        content = await zipEntry.async("text");
        if (fileName === 'package.json') {
          packageJsonContent = content;
        }
      }
    }
    
    // Add to raw nodes to build tree
    rawNodes[normalizedPath] = {
      _id: `id_${normalizedPath.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: fileName,
      type: type,
      path: normalizedPath,
      content: content,
      isOpen: false,
      children: []
    };
  }

  // 3. Build tree
  const tree = [];
  
  // Create a root node for the workspace
  const workspaceRoot = {
    _id: rootId,
    name: file.name.replace('.zip', ''),
    type: 'folder',
    isOpen: true,
    children: []
  };

  Object.keys(rawNodes).sort().forEach(path => {
    const parts = path.split('/');
    const node = rawNodes[path];
    
    if (parts.length === 1) {
      workspaceRoot.children.push(node);
    } else {
      parts.pop(); // remove file/folder name
      const parentPath = parts.join('/');
      if (rawNodes[parentPath]) {
        rawNodes[parentPath].children.push(node);
      } else {
        // Fallback if parent directory entry didn't exist in zip
        workspaceRoot.children.push(node);
      }
    }
  });
  
  tree.push(workspaceRoot);

  // 4. Extract metadata
  const metadata = identifyProjectMetadata(filePaths, packageJsonContent);
  metadata.workspaceId = rootId;
  metadata.projectName = workspaceRoot.name;
  metadata.packageJsonContent = packageJsonContent;

  return { tree, metadata };
};
