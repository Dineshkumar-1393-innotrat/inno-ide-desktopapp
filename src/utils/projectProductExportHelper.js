/**
 * projectProductExportHelper.js
 * 
 * Synchronously retrieves, normalizes, and packages:
 * 1. Project Creation Details (from "Create New Project" modal, Image 2)
 * 2. Product Creation Details (from "Create Product" modal, Image 3)
 * 3. Canvas Elements (nodes, edges, viewport)
 * 
 * Runs synchronously without blocking network calls to guarantee instant file downloads
 * and ensure browser user-gesture download permissions are preserved.
 */

/**
 * Synchronously normalizes and retrieves project creation details.
 */
export function getProjectCreationDetails(projectId, projectName) {
  const resolvedProjectId = projectId || localStorage.getItem('activeProjectId') || '';
  const resolvedProjectName = projectName || localStorage.getItem('activeProjectName') || 'Untitled Project';

  let cachedDetails = null;

  // 1. Try localStorage keys
  try {
    if (resolvedProjectId) {
      const stored = localStorage.getItem(`innoide:project_details_${resolvedProjectId}`);
      if (stored) cachedDetails = JSON.parse(stored);
    }
    if (!cachedDetails && resolvedProjectName) {
      const stored = localStorage.getItem(`innoide:project_details_${resolvedProjectName}`);
      if (stored) cachedDetails = JSON.parse(stored);
    }
    if (!cachedDetails) {
      const stored = localStorage.getItem('innoide:last_project_details');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.projectName === resolvedProjectName || parsed.projectId === resolvedProjectId) {
          cachedDetails = parsed;
        } else if (!resolvedProjectName || resolvedProjectName === 'Untitled Project') {
          cachedDetails = parsed;
        }
      }
    }
  } catch (e) {
    console.warn('[projectProductExportHelper] Error reading cached project details:', e);
  }

  // 2. Try innoide_projects in localStorage (from projectFileManager)
  if (!cachedDetails) {
    try {
      const storedProjects = localStorage.getItem('innoide_projects');
      if (storedProjects) {
        const projects = JSON.parse(storedProjects);
        const match = Object.values(projects).find(
          (p) => p && (p.id === resolvedProjectId || p.name === resolvedProjectName)
        );
        if (match) {
          cachedDetails = {
            projectId: match.id || resolvedProjectId,
            projectName: match.name || resolvedProjectName,
            description: match.description || '',
            projectCategory: match.category || 'Logistics',
            projectType: match.type || 'Bare Metal',
            board: match.board || 'STM32 U5',
            boardType: match.board || 'STM32 U5',
            features: match.selectedFeature || 'blockDiagram',
            createdAt: match.createdAt || new Date().toISOString()
          };
        }
      }
    } catch (e) {
      console.warn('[projectProductExportHelper] Error reading from innoide_projects:', e);
    }
  }

  // 3. Fallback matching "Create New Project" modal fields (Image 2)
  return {
    projectId: resolvedProjectId || cachedDetails?.projectId || `proj_${Date.now()}`,
    projectName: resolvedProjectName || cachedDetails?.projectName || 'Untitled Project',
    description: cachedDetails?.description || '',
    projectCategory: cachedDetails?.projectCategory || 'Logistics',
    projectType: cachedDetails?.projectType || 'Bare Metal',
    board: cachedDetails?.board || cachedDetails?.boardType || 'STM32 U5',
    boardType: cachedDetails?.boardType || cachedDetails?.board || 'STM32 U5',
    features: cachedDetails?.features || cachedDetails?.feature || 'blockDiagram',
    createdAt: cachedDetails?.createdAt || new Date().toISOString()
  };
}

/**
 * Synchronously normalizes and retrieves product creation details.
 */
export function getProductCreationDetails(productId, projectId, productName) {
  const resolvedProductId = productId || localStorage.getItem('activeProductId') || '';
  const resolvedProjectId = projectId || localStorage.getItem('activeProjectId') || '';
  const resolvedProductName = productName || localStorage.getItem('activeProductName') || localStorage.getItem('activeProjectName') || 'demo-06';

  let cachedDetails = null;

  // 1. Try localStorage keys
  try {
    if (resolvedProductId) {
      const stored = localStorage.getItem(`innoide:product_details_${resolvedProductId}`);
      if (stored) cachedDetails = JSON.parse(stored);
    }
    if (!cachedDetails && resolvedProjectId) {
      const stored = localStorage.getItem(`innoide:product_details_${resolvedProjectId}`);
      if (stored) cachedDetails = JSON.parse(stored);
    }
    if (!cachedDetails && resolvedProductName) {
      const stored = localStorage.getItem(`innoide:product_details_${resolvedProductName}`);
      if (stored) cachedDetails = JSON.parse(stored);
    }
    if (!cachedDetails) {
      const stored = localStorage.getItem('innoide:last_product_details');
      if (stored) cachedDetails = JSON.parse(stored);
    }
  } catch (e) {
    console.warn('[projectProductExportHelper] Error reading cached product details:', e);
  }

  const noOfDevices = cachedDetails?.noOfDevices ?? (cachedDetails?.basicInformation?.noOfDevices || 1);
  const noOfComponents = cachedDetails?.noOfComponents ?? (cachedDetails?.components?.length || 1);

  // Default component definition matching Image 3 if not yet defined
  const componentsList = cachedDetails?.components && cachedDetails.components.length > 0
    ? cachedDetails.components
    : [
        {
          componentType: 'Sensor',
          componentName: 'Switch ON /OFF',
          parameters: {
            State: {
              parameterType: 'state',
              states: ['ON', 'OFF']
            }
          }
        },
        {
          componentType: 'Actuator',
          componentName: 'LED ON',
          parameters: {
            State: {
              parameterType: 'state',
              states: ['ON', 'OFF']
            }
          }
        }
      ];

  return {
    productId: resolvedProductId || cachedDetails?.productId || `prod_${Date.now()}`,
    productName: resolvedProductName || cachedDetails?.productName || 'demo-06',
    basicInformation: {
      noOfDevices: Number(noOfDevices) || 1,
      noOfComponents: Number(noOfComponents) || componentsList.length,
    },
    noOfDevices: Number(noOfDevices) || 1,
    noOfComponents: Number(noOfComponents) || componentsList.length,
    components: componentsList,
    devices: cachedDetails?.devices || [],
    note: cachedDetails?.note || '',
    urls: cachedDetails?.urls || [],
    createdAt: cachedDetails?.createdAt || new Date().toISOString()
  };
}

/**
 * Synchronously packages the complete export JSON payload containing:
 * - projectDetails (from Project Creation, Image 2)
 * - productDetails (from Product Creation, Image 3)
 * - canvas: { nodes, edges, viewport }
 * - top-level nodes, edges, viewport for backwards compatibility
 */
export function buildDiagramExportPayload({
  nodes = [],
  edges = [],
  viewport = null,
  projectId = null,
  projectName = null,
  productId = null,
  productName = null,
}) {
  const projectDetails = getProjectCreationDetails(projectId, projectName);
  const productDetails = getProductCreationDetails(productId, projectId, projectName || productName);

  return {
    projectDetails,
    productDetails,
    canvas: {
      nodes: Array.isArray(nodes) ? nodes : [],
      edges: Array.isArray(edges) ? edges : [],
      viewport: viewport || { x: 0, y: 0, zoom: 1 }
    },
    // Top-level properties preserved for 100% backward compatibility with existing readers
    nodes: Array.isArray(nodes) ? nodes : [],
    edges: Array.isArray(edges) ? edges : [],
    viewport: viewport || { x: 0, y: 0, zoom: 1 }
  };
}
