import React from "react";
import { API } from '@/config';
import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Text,
  IconButton,
  Collapse,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Tooltip,
  Button,
} from "@chakra-ui/react";
import { FaFile, FaFolder, FaFolderOpen, FaPlus } from "react-icons/fa";
import { CloseIcon } from "@chakra-ui/icons";
import { getUserInfo, productAPIBase, baseURL } from "../../utilities";
import axios from "axios";
import { FaFolderPlus } from "react-icons/fa6";
import { AiFillFileAdd } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import CreateProductDefintionModal from "../Product/ProductDefinitionModal/CreateProductDefintionModal";
import ProductEditModal from "../Product/ProductEdit/ProductEditModal";
import CreateNewProjectModal from "../MenuSidebar/CreateNewProjectModal";
import { useDisclosure } from "@chakra-ui/react";
import { FaChevronRight, FaChevronDown } from "react-icons/fa";
import Navbar from "./Navbar";
import Footer from "../Footer";
import CodeEditor from "../CodeEditor/CodeEditor";
import { useProject } from "../../ProjectContext.jsx";
import { useDispatch } from "react-redux";
import { setProjectFiles } from "../../features/workspace/store/workspaceSlice";

export const checkProductDefinition = async (
  activeProductId,
  setIsProductDefined,
  activeProjectId = null
) => {
  if (!activeProductId) {
    setIsProductDefined(null); // Reset if no active project
    return;
  }

  // Construct URL with optional projectId as query param
  const url = `${productAPIBase}/product/${activeProductId}/definitionNew${activeProjectId ? `?projectId=${activeProjectId}` : ''}`;
  
  console.log(`[checkProductDefinition] Checking: ${url}`);

  try {
    let response;
    try {
      console.log(`[checkProductDefinition] Attempting local check: ${url}`);
      response = await axios.get(url, { timeout: 3000 }); // Short timeout for local check
    } catch (localError) {
      console.warn("[checkProductDefinition] Local check failed/timed out, falling back to Eureka...");
      // Use definitionNew for fallback as requested
      const fallbackUrl = `${baseURL}/product/${activeProductId}/definitionNew${activeProjectId ? `?projectId=${activeProjectId}` : ''}`;
      response = await axios.get(fallbackUrl);
    }

    console.log("[checkProductDefinition] RAW Response:", response.data);

    // Check if components exist in the response (either components key or data.components)
    const components = response.data?.components || response.data?.data?.components;
    const hasComponents = components && Object.keys(components).length > 0;
    
    // Legacy check: If response itself has some core fields like name or productId
    const hasIdentity = response.data?.productId || response.data?.productID || response.data?.status === "success";
    
    console.log(`[checkProductDefinition] Result: hasComponents=${hasComponents}, hasIdentity=${hasIdentity}`);
    
    setIsProductDefined(hasComponents);
  } catch (error) {
    console.error("Error fetching product definition (All servers failed):", error);
    setIsProductDefined(false); // Assume false if error occurs
  }
};


export const buildTree = (flatArray) => {
  const idMap = {};
  let root = null;
  const orphans = [];

  // First pass: create a map of all nodes and include the path if available
  flatArray.forEach((item) => {
    idMap[item._id] = {
      _id: item._id,
      name: item.name,
      type: item.type,
      content: item.content || null,
      productId: item.productId || null,
      path: item.path || "", // Include the path if it exists
      children: [],
    };
  });

  // Helper to recursively compute paths if they are missing from the API
  const computePaths = (node, parentPath = "") => {
    const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
    if (!node.path) node.path = currentPath;
    if (node.children) {
      node.children.forEach(child => computePaths(child, node.path));
    }
  };

  // Second pass: Assign children to their parents
  flatArray.forEach((item) => {
    if (item.parentId && idMap[item.parentId]) {
      idMap[item.parentId].children.push(idMap[item._id]);
    } else {
      if (item.name === "root") {
        root = idMap[item._id]; // The explicit root node
      } else if (!item.parentId) {
        orphans.push(idMap[item._id]); // Only true top-level items without parentId
      }
    }
  });

  // Attach orphaned items to root if possible
  if (root) {
    orphans.forEach((orphan) => {
      root.children.push(orphan);
    });
  } else if (orphans.length > 0) {
    // Fallback: create a virtual root if "root" wasn't found
    root = {
      _id: "virtual_root",
      name: "root",
      type: "folder",
      path: "root",
      children: orphans,
    };
  }

  // Compute paths recursively for the whole tree if needed
  if (root) {
    computePaths(root, "");
  }

  return root || { _id: "empty", name: "root", type: "folder", path: "root", children: [] };
};

// Fetch file system and ensure root folder exists
export const fetchFileSystem = async (userId, setFileSystem, buildTree) => {
  if (!userId) return { success: false, error: "No User ID provided" };

  try {
    const { data } = await axios.get(
      `${API.MAIN}/api/v1/rootStatus/${userId}`
    );

    if (!data.isRootCreated) {
      await axios.post(
        `${API.MAIN}/api/v1/filesystem/createRoot`,
        {
          userId,
          name: "root",
          type: "folder",
        }
      );
    }

    // Fetch the full file system after ensuring root exists
    const fileResponse = await axios.get(
      `${API.MAIN}/api/v1/files/${userId}`
    );

    if (fileResponse.data.success) {
      console.log("[EmbeddedFileManagement] Raw Files Received:", fileResponse.data.files?.length);
      const anyFolders = fileResponse.data.files?.filter(f => f.type === 'folder');
      if (anyFolders && anyFolders.length > 0) {
        console.log("[EmbeddedFileManagement] Folder Metadata Sample:", anyFolders.slice(0, 5));
      }

      const structuredData = buildTree(fileResponse.data.files);
      setFileSystem(structuredData);
      return { success: true };
    } else {
      return { success: false, error: "Failed to fetch files" };
    }
  } catch (error) {
    console.error("Error fetching file system:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
};

const EmbeddedFileManagement = () => {
  const [fileSystem, setFileSystem] = useState({});
  const [openFiles, setOpenFiles] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [user, setUser] = useState({});
  // const [activeProjectId, setActiveProjectId] = useState(null);
  const [isProductDefined, setIsProductDefined] = useState(null);
  // const [activeProjectName, setActiveProjectName] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    setActiveProductId,
    setActiveProductName,
    setActiveProjectName,
    setActiveProjectId,
    activeProjectId,
    activeProjectName,
    activeProductId,
  } = useProject();

  const dispatch = useDispatch();

  useEffect(() => {
    if (fileSystem && fileSystem._id) {
      // The old flow expected an array with one root item for static projects
      dispatch(setProjectFiles([fileSystem]));
    }
  }, [fileSystem, dispatch]);

  const addItem = async (parentFolder, type, userId) => {
    try {
      const newItemName = prompt(`Enter ${type} name:`);
      if (!newItemName) return;

      if (type === "file") {
        const fileNameArray = newItemName.split(".");
        const fileExtensionType = fileNameArray[fileNameArray.length - 1];

        if (!fileExtensionType || fileNameArray.length < 2) {
          throw new Error("File extension required");
        }

        if (fileExtensionType !== "c") {
          throw new Error("Only file extension type .c  allowed");
        }

        // 🚨 Restrict "main.c" or "Main.c"
        if (newItemName.toLowerCase() === "main.c") {
          throw new Error(
            'File name "main.c" is not allowed. Please use a different name.'
          );
        }
      }

      const { data } = await axios.post(
        `${API.MAIN}/api/v1/createFileAndFolder`,
        {
          parentId: parentFolder._id,
          name: newItemName,
          type,
          userId,
        }
      );

      if (data.success) {
        fetchFileSystem(user.userId, setFileSystem, buildTree); // Refresh the file system
      }
    } catch (error) {
      console.error(`Error creating ${type}:`, error);

      // Handle both validation errors & API errors
      alert(
        error.message || error.response?.data?.message || "An error occurred."
      );
    }
  };

  console.log("file system from embedded page:", fileSystem);

  // //   handle create project
  // const handleCreateProject = async (
  //   fileSystem,
  //   type,
  //   userId,
  //   projectName,
  //   projectType,
  //   boardType,
  //   features
  // ) => {
  //   try {
  //     // First API request to create a product
  //     const response = await axios.post(`${API.MAIN}/product`, {
  //       name: projectName,
  //       userId,
  //     });

  //     console.log("Product Response:", response.data); // Debugging

  //     const productId = response.data.productID;
  //     if (!productId) throw new Error("Product ID not received.");

  //     alert(`${projectName} project created successfully`);

  //     // Second API request to create a file/folder
  //     const { data } = await axios.post(
  //       `${API.MAIN}/api/v1/createFileAndFolder`,
  //       {
  //         parentId: fileSystem?._id,
  //         name: projectName,
  //         type,
  //         userId,
  //         productId,
  //         projectType,
  //         boardType,
  //         features,
  //       }
  //     );

  //     console.log("Created File/Folder Response:", data); // Debugging

  //     setActiveProductId(data?.file?.productId);
  //     setActiveProjectId(data?.file?._id);
  //     setActiveProductName(data?.file?.name);
  //     setActiveProjectName(dats?.file?.name);

  //     await axios.post(
  //       `${API.MAIN}/api/v1/createFileAndFolder`,
  //       {
  //         parentId: data?.file?._id,
  //         name: "simulation.c",
  //         type: "file",
  //         userId,
  //       }
  //     );

  //     console.log("default file created successfully!");

  //     // Refresh the file system if creation was successful
  //     if (data.success) {
  //       fetchFileSystem(userId, setFileSystem, buildTree);
  //     } else {
  //       throw new Error("File/Folder creation failed.");
  //     }

  //     onClose();

  //     return true
  //   } catch (error) {
  //     console.error("Error creating project:", error.response.data.message);
  //     alert(
  //       error.response?.data?.message || error.message || "An error occurred."
  //     );
  //   }
  // };

  //   handle delete folder

  const handleFolderDelete = async (id) => {
    try {
      const response = await axios.delete(
        `${API.MAIN}/api/v1/deleteFileAndFolder`,
        {
          data: { fileId: id }, // Correct way to send data in DELETE request
        }
      );

      console.log("Folder deleted successfully:", response.data);

      alert("Folder deleted successfuly!");

      window.dispatchEvent(new CustomEvent("project-deleted", { detail: { projectId: id } }));

      await fetchFileSystem(user.userId, setFileSystem, buildTree);
      // You can add state update logic here if needed
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  //   toggle folder
  const toggleFolder = (folder, parent = null) => {
    console.log("toggle folder:", folder);

    const updateFolderState = (node) => {
      if (node._id === folder._id) {
        return { ...node, isOpen: !node.isOpen };
      }
      if (node.children) {
        return { ...node, children: node.children.map(updateFolderState) };
      }
      return node;
    };

    let updatedFileSystem = { ...fileSystem };
    updatedFileSystem.children = fileSystem.children.map(updateFolderState);

    // Check if it's a top-level folder
    const isTopLevelFolder = fileSystem.children.some(
      (child) => child._id === folder._id
    );

    // Only update active project & product when a different top-level folder is selected
    if (isTopLevelFolder && activeProjectId !== folder._id) {
      setActiveProjectId(folder._id);
      setActiveProjectName(folder.name);
      setActiveProductId(folder.productId);
      setActiveProductName(folder.name);
    }

    setFileSystem(updatedFileSystem);
  };

  // Open file in editor
  const openFile = (file) => {
    if (!openFiles.some((f) => f.name === file.name)) {
      setOpenFiles([...openFiles, { ...file, content: file.content || "" }]);
    }
    setActiveTab(file.name);
  };

  // Close file tab
  const closeTab = (fileName) => {
    const updatedFiles = openFiles.filter((file) => file.name !== fileName);
    setOpenFiles(updatedFiles);

    if (fileName === activeTab) {
      setActiveTab(updatedFiles.length > 0 ? updatedFiles[0].name : null);
    }
  };

  // Handle file content update
  const updateFileContent = async (fileName, newContent, fileId) => {
    if (!fileName || !fileId) {
      console.warn("Invalid file update: missing fileName or fileId.");
      return;
    }

    try {
      // Optimized state update using functional updates
      setOpenFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.name === fileName ? { ...file, content: newContent } : file
        )
      );

      // Update active tab content if it's the edited file
      setActiveTab((prev) =>
        prev?.name === fileName ? { ...prev, content: newContent } : prev
      );

      // Send API request to update file content

      const response = await axios.put(
        `${API.MAIN}/api/v1/updateFileAndFolder`,
        { fileId, newName: fileName, newContent }
      );

      console.log(`File "${fileName}" updated successfully:`, response.data);
    } catch (error) {
      console.error("Error updating file:", error);
    }
  };

  const renderFileSystem = (node) => (
    <VStack align="start" spacing={1} key={node.name} width="100%">
      {node.type === "folder" ? (
        <>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            width="100%"
            px={2}
            py={1}
            borderRadius="md"
            bg={
              node.isOpen || node._id === activeProjectId
                ? "teal.600"
                : "transparent"
            } // Highlight open folder
            _hover={{ bg: "gray.700" }}
            cursor="pointer"
            onClick={() => toggleFolder(node)}
          >
            <Box display="flex" alignItems="center" gap={2} flex="1">
              {/* Chevron Icon for Folder Expand/Collapse */}
              {node.isOpen ? (
                <FaChevronDown color="white" />
              ) : (
                <FaChevronRight color="white" />
              )}

              {/* Folder Icon */}
              {node.isOpen ? (
                <FaFolderOpen color="yellow" />
              ) : (
                <FaFolder color="yellow" />
              )}

              <Text color="white" margin={0} flex="1">
                {node.name}
              </Text>
            </Box>

            <Box display="flex" ml="4" alignItems="center">
              <Tooltip
                label={
                  node.name === "root" ? "Create Project" : "Create Folder"
                }
                hasArrow
              >
                <IconButton
                  aria-label={
                    node.name === "root" ? "Create Project" : "Create Folder"
                  }
                  icon={<FaFolderPlus />}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    addItem(node, "folder", user?.userId);
                  }}
                  variant="ghost"
                  color="white"
                  sx={{
                    transition: "0.2s",
                    _hover: { bg: "gray.700", color: "teal.300" },
                    _active: { bg: "gray.600" },
                  }}
                />
              </Tooltip>

              <Tooltip label="Create File" hasArrow>
                <IconButton
                  aria-label="Create File"
                  icon={<AiFillFileAdd />}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    addItem(node, "file", user?.userId);
                  }}
                  variant="ghost"
                  color="white"
                  sx={{
                    transition: "0.2s",
                    _hover: { bg: "gray.700", color: "teal.300" },
                    _active: { bg: "gray.600" },
                  }}
                />
              </Tooltip>

              <Tooltip label="Delete Folder" hasArrow>
                <IconButton
                  aria-label="Delete Folder"
                  icon={<MdDelete />}
                  size="sm"
                  variant="ghost"
                  color="white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFolderDelete(node._id);
                  }}
                  sx={{
                    transition: "0.2s",
                    _hover: { bg: "red.600", color: "white" },
                    _active: { bg: "red.700" },
                  }}
                />
              </Tooltip>
            </Box>
          </Box>

          <Collapse in={node.isOpen}>
            <Box pl={4}>
              {node.children.map((child) => renderFileSystem(child))}
            </Box>
          </Collapse>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          px={2}
          py={1}
          borderRadius="md"
          cursor="pointer"
          bg={node.name === activeTab ? "teal.700" : "transparent"}
          _hover={{ bg: "gray.700" }}
          onClick={() => openFile(node)}
        >
          <FaFile color="white" />
          <Text color="white" margin={0} ml={2}>
            {node.name}
          </Text>

          <Tooltip label="Delete File" hasArrow>
            <IconButton
              aria-label="Delete File"
              icon={<MdDelete />}
              ml={4}
              size="sm"
              variant="ghost"
              color="white"
              onClick={(e) => {
                e.stopPropagation();
                handleFolderDelete(node._id);
              }}
              sx={{
                transition: "0.2s",
                _hover: { bg: "red.600", color: "white" },
                _active: { bg: "red.700" },
              }}
            />
          </Tooltip>
        </Box>
      )}
    </VStack>
  );

  // fetch user information local storage
  useEffect(() => {
    const userInfo = getUserInfo();
    if (userInfo) {
      setUser(userInfo);
      fetchFileSystem(userInfo?.userId, setFileSystem, buildTree);
    }

    console.log(console.log("Open files", openFiles));
    console.log("file system", fileSystem);
  }, []);

  useEffect(() => {
    checkProductDefinition(activeProductId, setIsProductDefined, activeProjectId);
  }, [activeProjectId]);

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Navbar />

      <Box
          display="flex"
          flex="1"
          minHeight="100vh"
          overflow="hidden"
          flexDirection={{ base: "column", md: "row" }}
        >
        <Box
          width={{ base: "280px", md: "240px" }}
          flexShrink={0}
          bg="gray.800"
          mt={16}
          p={4}
          maxH={{ base: "auto", md: "100vh" }}
          boxShadow="lg"
          overflowY="auto"
        >
          <Tooltip label="Create New Project" hasArrow>
            <Button
              leftIcon={<FaPlus />} // Add icon to the left
              size="sm"
              colorScheme="blue"
              width="100%" // Make it full width
              mb={4}
              // onClick={() => {
              //   handleCreateProject(fileSystem, "folder", user?.userId);
              // }}
              onClick={onOpen}
            >
              Create New Project
            </Button>
          </Tooltip>

          {/* {renderFileSystem(fileSystem)} */}

          {/* Render only root's children */}
          {fileSystem.children &&
            fileSystem.children.map((child) => renderFileSystem(child))}
        </Box>

        <Box flex="1" mt={{ base: 0, md: 16 }} p={4} bg="gray.900" minHeight="100vh" overflowX="auto">
          {activeProjectId && activeProductId && activeProjectName && activeProjectName !== "Untitled Project" && (
            <Box>
              {isProductDefined && (
                <ProductEditModal
                  productID={activeProductId}
                  productName={activeProjectName}
                  fetchFileSystem={() =>
                    fetchFileSystem(user?.userId, setFileSystem, buildTree)
                  }
                />
              )}

              {!isProductDefined && (
                <CreateProductDefintionModal
                  setIsProductDefined={setIsProductDefined}
                  // activeProjectId={activeProductId}
                  // activeProjectName={activeProjectName}
                  fetchFileSystem={() =>
                    fetchFileSystem(user?.userId, setFileSystem, buildTree)
                  }
                />
              )}
            </Box>
          )}

          {/* Tabs for Open Files */}
          <Tabs
            variant="soft-rounded"
            colorScheme="blue"
            size={"sm"}
            index={openFiles.findIndex((f) => f.name === activeTab)}
          >
            <TabList>
              {openFiles.map((file) => (
                <Tab key={file.name} onClick={() => setActiveTab(file.name)}>
                  {file.name}
                  <IconButton
                    icon={<CloseIcon />}
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(file.name);
                    }}
                    variant="ghost"
                    ml={2}
                  />
                </Tab>
              ))}
            </TabList>

            <TabPanels>
              {openFiles.map((file) => (
                <TabPanel key={file.name} p={0}>
                  <CodeEditor
                    options={{ minimap: { enabled: false } }}
                    height="calc(100vh - 60vh)"
                    language="javascript"
                    value={file}
                    updateFileContent={updateFileContent}

                  // onChange={(newValue) =>
                  //   updateFileContent(file.name, newValue)
                  // }
                  />
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </Box>
      </Box>

      <CreateNewProjectModal
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        // handleCreateProject={handleCreateProject}
        fileSystem={fileSystem}
        folder={"folder"}
        userId={user?.userId}
        setFileSystem={setFileSystem}
      />

      <Footer />
    </Box>
  );
};

export default EmbeddedFileManagement;
