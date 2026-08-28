import React, { useState, useRef, useEffect } from "react";
import { API } from '@/config';
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
import Navbartwo from "../Navbartwo";
import CodeEditor from "../CodeEditor/CodeEditor"; // Use VS Code-style editor
import Footer from "../Footer";
import { getUserInfo, productAPIBase } from "../../utilities";
import { useProject } from "../../ProjectContext";
import axios from "axios";
import { FaFolderPlus } from "react-icons/fa6";
import { AiFillFileAdd } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import CreateProductDefintionModal from "../Product/ProductDefinitionModal/CreateProductDefintionModal";
import ProductEditModal from "../Product/ProductEdit/ProductEditModal";
import CreateNewProjectModal from "./CreateNewProjectModal";
import { useDisclosure } from "@chakra-ui/react";
import { FaChevronRight, FaChevronDown } from "react-icons/fa";

const initialFileSystem = {
  name: "root",
  type: "folder",
  children: [
    {
      name: "src",
      type: "folder",
      children: [
        {
          name: "App.js",
          type: "file",
          content: "console.log('Hello World');",
        },
        {
          name: "index.js",
          type: "file",
          content: "import React from 'react';",
        },
      ],
    },
    {
      name: "public",
      type: "folder",
      children: [
        { name: "index.html", type: "file", content: "<html></html>" },
      ],
    },
  ],
};

const MenuSidebar = () => {
  const [fileSystem, setFileSystem] = useState({});
  const [openFiles, setOpenFiles] = useState([]); // Opened files
  const [activeTab, setActiveTab] = useState(null); // Active file tab
  const [user, setUser] = useState({});
  const [projectName, setProjectName] = useState("");
  const {
    activeProjectId,
    activeProjectName,
    activeProductId,
    switchProject
  } = useProject();

  const [isProductDefined, setIsProductDefined] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // fetch user information local storage
  useEffect(() => {
    const userInfo = getUserInfo();
    if (userInfo) {
      setUser(userInfo);
      fetchFileSystem(userInfo?.userId);
    }
    const handleRefresh = () => {
      if (user?.userId) {
        console.log("[MenuSidebar] Refreshing file system via global event...");
        fetchFileSystem(user.userId);
      }
    };
    window.addEventListener("innoide:refresh-filesystem", handleRefresh);

    return () => {
      window.removeEventListener("innoide:refresh-filesystem", handleRefresh);
    };
  }, [user]);

  useEffect(() => {
    const checkProductDefinition = async () => {
      if (!activeProductId) {
        setIsProductDefined(null); // Reset if no active project
        return;
      }

      try {
        const response = await axios.get(
          `${productAPIBase}/product/${activeProductId}/definitionNew`
        );

        // Check if components exist in the response
        const hasComponents =
          Object.keys(response.data.components || {}).length > 0;
        setIsProductDefined(hasComponents);
      } catch (error) {
        console.error("Error fetching product definition:", error);
        setIsProductDefined(false); // Assume false if error occurs
      }
    };

    checkProductDefinition();
  }, [activeProductId]);

  const buildTree = (flatArray) => {
    const idMap = {};
    let root = null;
    const orphans = [];

    // First pass: create a map of all nodes
    flatArray.forEach((item) => {
      idMap[item._id] = {
        _id: item._id,
        name: item.name,
        type: item.type,
        content: item.content || null,
        productId: item.productId || null,
        children: [],
      };
    });

    // Second pass: Assign children to their parents
    flatArray.forEach((item) => {
      if (item.parentId && idMap[item.parentId]) {
        idMap[item.parentId].children.push(idMap[item._id]);
      } else {
        if (item.name === "root") {
          root = idMap[item._id]; // The explicit root node
        } else {
          orphans.push(idMap[item._id]); // Items without parentId that are not "root"
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
        children: orphans,
      };
    }

    return root || { _id: "empty", name: "root", type: "folder", children: [] };
  };

  // Fetch file system and ensure root folder exists
  const fetchFileSystem = async (userId) => {
    if (!userId) return;

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
        const structuredData = buildTree(fileResponse.data.files);
        setFileSystem(structuredData);
      }
    } catch (error) {
      console.error("Error fetching file system:", error);
    }
  };

  // Add new folder or file
  const addItem = async (parentFolder, type, userId) => {
    const newItemName = prompt(`Enter ${type} name:`);
    if (!newItemName) return;

    setProjectName(newItemName);

    try {
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
        fetchFileSystem(user.userId); // Refresh the file system
      }
    } catch (error) {
      console.error(`Error creating ${type}:`, error);
    }
  };

  const handleCreateProject = async (
    fileSystem,
    type,
    userId,
    projectName,
    projectType,
    boardType,
    features
  ) => {
    // const newItemName = prompt("Enter project name:");
    // if (!newItemName) return;

    console.log({
      fileSystem,
      type,
      userId,
      projectName,
      projectType,
      boardType,
      features,
    });

    try {
      // First API request to create a product
      const response = await axios.post(`${API.MAIN}/product`, {
        name: projectName,
        userId,
      });

      console.log("Product Response:", response.data); // Debugging

      const productId = response.data.productID;
      if (!productId) throw new Error("Product ID not received.");

      alert(`${projectName} product created successfully`);

      // Second API request to create a file/folder
      const { data } = await axios.post(
        `${API.MAIN}/api/v1/createFileAndFolder`,
        {
          parentId: fileSystem?._id,
          name: projectName,
          type,
          userId,
          productId,
          projectType,
          boardType,
          features,
        }
      );

      console.log("Created File/Folder Response:", data); // Debugging

      // Refresh the file system if creation was successful
      if (data.success) {
        fetchFileSystem(userId);
      } else {
        throw new Error("File/Folder creation failed.");
      }

      onClose();
    } catch (error) {
      console.error("Error creating project:", error.response.data.message);
      alert(
        error.response?.data?.message || error.message || "An error occurred."
      );
    }
  };

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

      await fetchFileSystem(user.userId);
      // You can add state update logic here if needed
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  const toggleFolder = (folder, parent = fileSystem) => {
    // If the folder is a direct child of root, handle top-level toggle
    if (fileSystem.children.some((child) => child._id === folder._id)) {
      const updatedChildren = fileSystem.children.map((child) => ({
        ...child,
        isOpen: child._id === folder._id ? !child.isOpen : false, // Ensures only one top-level folder is open at a time
      }));
      setFileSystem({ ...fileSystem, children: updatedChildren });

      // Set active project when opening a top-level folder
      if (!folder.isOpen) {
        switchProject({
          projectId: folder._id,
          projectName: folder.name,
          productId: folder.productId,
          productName: folder.name
        });
      } else {
        // Optionally clear or keep. Usually we keep the active project even if folder is closed in sidebar.
      }
    } else {
      // Recursive function to update nested folders
      const updateFolderState = (node) => {
        if (node._id === folder._id) {
          return { ...node, isOpen: !node.isOpen }; // Toggle the specific folder
        }
        if (node.children) {
          return { ...node, children: node.children.map(updateFolderState) };
        }
        return node;
      };

      setFileSystem({
        ...fileSystem,
        children: fileSystem.children.map(updateFolderState),
      });
    }
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
            bg={node.isOpen ? "teal.600" : "transparent"} // Highlight open folder
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
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Navbartwo />

      <Box display="flex" flex="1" minHeight="100vh" overflow="hidden" flexDirection={{ base: "column", md: "row" }}>
        <Box
          width={{ base: "100%", md: "240px" }}
          flexShrink={0}
          bg="gray.800"
          mt={16}
          p={4}
          boxShadow="lg"
          overflowY="auto"
        >
          <Tooltip label="Create New Project" hasArrow>
            <Button
              leftIcon={<FaPlus />}
              size="sm"
              colorScheme="blue"
              width="100%"
              mb={4}
              onClick={onOpen}
            >
              Create New Project
            </Button>
          </Tooltip>

          {fileSystem.children &&
            fileSystem.children.map((child) => renderFileSystem(child))}
        </Box>

        <Box flex="1" mt={{ base: 0, md: 16 }} p={4} bg="gray.900" minHeight="100vh" overflowX="auto">
          {activeProductId && isProductDefined !== null && (
            <Box>
              {isProductDefined ? (
                <ProductEditModal
                  productID={activeProductId}
                  productName={activeProjectName}
                  fetchFileSystem={fetchFileSystem}
                />
              ) : (
                <CreateProductDefintionModal
                  activeProjectId={activeProductId}
                  activeProjectName={activeProjectName}
                  fetchFileSystem={fetchFileSystem}
                />
              )}
            </Box>
          )}

          {/* Tabs for Open Files */}
          <Tabs
            variant="soft-rounded"
            colorScheme="blue"
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
                    height="calc(100vh - 60px)"
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
        handleCreateProject={handleCreateProject}
        fileSystem={fileSystem}
        folder={"folder"}
        userId={user?.userId}
      />

      <Footer />
    </Box>
  );
};

export default MenuSidebar;
