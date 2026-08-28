import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Text,
  IconButton,
  Collapse,
  Tooltip,
  Button,
  useDisclosure,
  useColorModeValue,
  HStack,
  Spacer,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
} from "@chakra-ui/react";
import {
  File,
  FileCode,
  FileJson,
  FileText,
  FileImage,
  Folder,
  FolderOpen,
  Plus,
  ChevronRight,
  ChevronDown,
  Trash2,
  FolderPlus,
  FilePlus,
  MoreVertical,
  Pencil,
  Lock,
  Archive
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getUserInfo, baseURL } from "../utilities";
import { useProject } from "../ProjectContext";
import CreateNewProjectModal from "./MenuSidebar/CreateNewProjectModal";
import CreateItemModal from "./MenuSidebar/CreateItemModal";
import RenameItemModal from "./MenuSidebar/RenameItemModal";
import {
  fetchFileSystem,
  buildTree,
} from "./EmbeddedFileManagement/EmbeddedFileManagement";
import UploadModal from "../features/workspace/upload/components/UploadModal";
import { setWorkspaceMetadata } from "../features/workspace/store/workspaceSlice";

const FileExplorer = ({ variant }) => {
  const dispatch = useDispatch();
  const [fileSystem, setFileSystem] = useState({});
  const [user, setUser] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  // State for new modals
  const [createItemType, setCreateItemType] = useState(null); // "file" or "folder"
  const [createItemParent, setCreateItemParent] = useState(null);
  const [renameItem, setRenameItem] = useState(null);
  const {
    isOpen: isCreateItemOpen,
    onOpen: onCreateItemOpen,
    onClose: onCreateItemClose
  } = useDisclosure();
  const {
    isOpen: isRenameItemOpen,
    onOpen: onRenameItemOpen,
    onClose: onRenameItemClose
  } = useDisclosure();
  const {
    isOpen: isUploadModalOpen,
    onOpen: onUploadModalOpen,
    onClose: onUploadModalClose
  } = useDisclosure();

  const {
    activeProjectId,
    setActiveProjectId,
    setActiveProjectName,
    setActiveProductId,
    setActiveProductName,
  } = useProject();

  const textColor = useColorModeValue("gray.800", "gray.100");
  const iconColor = useColorModeValue("gray.600", "gray.300");
  const actionIconColor = useColorModeValue("gray.500", "gray.400");
  const hoverBg = useColorModeValue("gray.100", "whiteAlpha.100");
  const activeBg = useColorModeValue("blue.50", "whiteAlpha.200");
  const activeBorder = useColorModeValue("blue.200", "blue.500");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const cancelRef = React.useRef();
  const [itemToDelete, setItemToDelete] = useState(null);
  const { 
    isOpen: isDeleteAlertOpen, 
    onOpen: onDeleteAlertOpen, 
    onClose: onDeleteAlertClose 
  } = useDisclosure();

  // Fetch user info and file system on mount
  useEffect(() => {
    const userInfo = getUserInfo();
    if (userInfo) {
      setUser(userInfo);
      loadFileSystem(userInfo.userId);
    } else {
      setError("User not logged in");
    }
  }, []);

  const { runtimeState, projectFiles } = useSelector((state) => state.workspace || {});

  useEffect(() => {
    if (runtimeState && runtimeState !== 'idle' && projectFiles && projectFiles.length > 0) {
      setFileSystem(projectFiles);
    }
  }, [runtimeState, projectFiles]);

  useEffect(() => {
    const handleRefreshEvent = () => {
      if (user?.userId) {
        loadFileSystem(user.userId);
      } else {
        const userInfo = getUserInfo();
        if (userInfo) loadFileSystem(userInfo.userId);
      }
    };
    window.addEventListener('file-system-refresh', handleRefreshEvent);
    return () => window.removeEventListener('file-system-refresh', handleRefreshEvent);
  }, [user]);

  const loadFileSystem = async (userId) => {
    setIsLoading(true);
    setError(null);
    const result = await fetchFileSystem(userId, setFileSystem, buildTree);
    if (result && !result.success) {
      setError(result.error);
    }
    setIsLoading(false);
  };

  const openCreateModal = (parent, type) => {
    setCreateItemParent(parent);
    setCreateItemType(type);
    onCreateItemOpen();
  };

  const openRenameModal = (item) => {
    setRenameItem(item);
    onRenameItemOpen();
  };

  const handleRefresh = () => {
    if (user?.userId) {
      loadFileSystem(user.userId);
    }
  };

  const isProtected = (node, parent) => {
    if (!node) return false;
    const protectedFiles = ["system_diagram.json"];
    const protectedFolders = ["BlockDiagram", "Flowchart"];
    
    // Protect core diagram files inside their dedicated folders
    if (node.type === "file" && protectedFiles.includes(node.name)) {
      if (parent && protectedFolders.includes(parent.name)) return true;
    }
    
    // Optional: Protect the folders themselves if they contain specialized content
    // if (node.type === "folder" && protectedFolders.includes(node.name)) return true;
    
    return false;
  };

  const getFileIcon = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    switch (ext) {
      case 'c':
      case 'cpp':
      case 'h':
        return <FileCode size={13} color="#3b82f6" />;
      case 'json':
        return <FileJson size={13} color="#f59e0b" />;
      case 'txt':
      case 'md':
        return <FileText size={13} color="#6b7280" />;
      case 'png':
      case 'jpg':
      case 'svg':
        return <FileImage size={13} color="#ec4899" />;
      default:
        return <File size={13} />;
    }
  };

  const isActiveProjectInFolder = (node, activeId, activeName) => {
    if (!node) return false;
    if (activeId && node._id && String(node._id) === String(activeId)) {
      return true;
    }
    if (activeName && node.name && node.name === activeName) {
      return true;
    }
    if (Array.isArray(node.children) && node.children.length > 0) {
      return node.children.some((child) => isActiveProjectInFolder(child, activeId, activeName));
    }
    return false;
  };

  const deleteNodeFromTree = (nodes, nodeId) => {
    if (!nodes || !Array.isArray(nodes)) return [];
    return nodes
      .filter((node) => node && node._id !== nodeId && node.id !== nodeId)
      .map((node) => ({
        ...node,
        children: Array.isArray(node.children) ? deleteNodeFromTree(node.children, nodeId) : [],
      }));
  };

  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  const confirmDelete = async () => {
    if (!itemToDelete?.node) return;
    const { node } = itemToDelete;
    const id = node._id || node.id;

    if (!id) {
      console.error("No valid ID found for deletion", node);
      toast({
        title: "Deletion failed.",
        description: "Invalid file or folder ID.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom-right",
      });
      onDeleteAlertClose();
      return;
    }
    
    setIsDeleting(true);

    try {
      await axios.delete(
        `${baseURL}/api/v1/deleteFileAndFolder`,
        { data: { fileId: id } }
      );
    } catch (error) {
      console.error("Error deleting item from server:", error);
      onDeleteAlertClose();
      toast({
        title: "Deletion failed.",
        description: error.response?.data?.message || error.message || "An error occurred while deleting the item.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
      handleRefresh();
      setIsDeleting(false);
      return;
    }

    try {
      console.log("Deleted item successfully:", node.name, id);
      onDeleteAlertClose();
      
      if (isActiveProjectInFolder(node, activeProjectId, activeProjectName)) {
        setActiveProjectId(null);
        setActiveProjectName(null);
        setActiveProductId(null);
        setActiveProductName(null);
        localStorage.removeItem("activeProjectId");
        localStorage.removeItem("activeProjectName");
        localStorage.removeItem("activeProductId");
        localStorage.removeItem("activeProductName");
      }

      setFileSystem((prev) => {
        if (!prev) return prev;
        if (Array.isArray(prev)) {
          return deleteNodeFromTree(prev, id);
        }
        return {
          ...prev,
          children: deleteNodeFromTree(prev.children || [], id),
        };
      });

      toast({
        title: "Successfully deleted.",
        description: `${node.name || "Item"} has been removed.`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-right",
      });

      window.dispatchEvent(new Event('file-system-refresh'));
    } catch (err) {
      console.error("Error updating UI after deletion:", err);
      handleRefresh();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFolderDelete = (node, parent) => {
    if (isProtected(node, parent)) {
      alert("This is a system-protected file and cannot be deleted.");
      return;
    }
    setItemToDelete({ node, parent });
    onDeleteAlertOpen();
  };

  const toggleFolder = (folder) => {
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

    const isTopLevelFolder = fileSystem.children.some(
      (child) => child._id === folder._id
    );

    if (isTopLevelFolder && activeProjectId !== folder._id) {
      setActiveProjectId(folder._id);
      setActiveProjectName(folder.name);
      setActiveProductId(folder.productId);
      setActiveProductName(folder.name);
      dispatch(setWorkspaceMetadata({
        rootFolderId: folder._id,
        projectName: folder.name,
        runtimeState: "ready"
      }));
    }

    setFileSystem(updatedFileSystem);
  };

   const handleFileClick = (file, project) => {
    if (project && activeProjectId !== project._id) {
      setActiveProjectId(project._id);
      setActiveProjectName(project.name);
      setActiveProductId(project.productId);
      setActiveProductName(project.name);
      dispatch(setWorkspaceMetadata({
        rootFolderId: project._id,
        projectName: project.name,
        runtimeState: "ready"
      }));

      try {
        localStorage.setItem("activeProjectId", project._id);
      } catch (err) {
        console.warn("Failed to save to localStorage:", err);
      }
    }

    const lowerName = file.name.toLowerCase();
    const filePath = file.path || "";
    const lowerPath = filePath.toLowerCase();

    console.log("[FileExplorer] Clicking file:", { name: file.name, path: filePath, lowerPath });

    // Context-aware navigation based on path and filename
    const isSimulation = lowerName.includes("simulation") || lowerPath.includes("simulation/") || lowerPath.endsWith("simulation");
    const isFlowchart = lowerName.includes("flowchart") || lowerName.includes("flow chart") || lowerName.includes("flow_chart") || lowerPath.includes("flowchart/") || lowerPath.includes("/flowchart");
    const isBlockDiagram = lowerName.includes("block diagram") || lowerName.includes("block_diagram") || lowerName.includes("blockdiagram") || lowerPath.includes("blockdiagram/") || lowerPath.includes("/blockdiagram");
    const isBlockProgramming = lowerName.includes("block programming") || lowerName.includes("block_programming") || lowerName.includes("blockprogramming") || lowerPath.includes("blockprogramming/") || lowerPath.includes("/blockprogramming");

    if (isSimulation) {
      navigate("/simulation", { state: { filePath, fileContent: file.content } });
    } else if (isFlowchart) {
      navigate("/FlowchartTest", { state: { filePath, fileContent: file.content } });
    } else if (isBlockDiagram) {
      navigate("/BlockDiagram", { state: { filePath, fileContent: file.content } });
    } else if (isBlockProgramming) {
      navigate("/blockprogramming", { state: { filePath, fileContent: file.content } });
    } else {
      navigate("/editor", { state: { filePath, fileContent: file.content } });
    }
  };

  const FileNode = React.memo(({ 
    node, 
    parent,
    currentProject, 
    activeProjectId, 
    activeBg, 
    activeBorder, 
    hoverBg, 
    iconColor, 
    actionIconColor,
    textColor, 
    toggleFolder, 
    handleFileClick, 
    openCreateModal, 
    openRenameModal, 
    handleFolderDelete, 
    isProtected,
    getFileIcon,
    borderColor, 
    renderFileSystem 
  }) => {
    const isNodeProtected = isProtected(node, parent);
    return (
      <VStack align="start" spacing={0} key={node._id || node.name} width="100%">
        {node.type === "folder" ? (
          <>
            <Box
              display="flex"
              alignItems="center"
              width="100%"
              px={2}
              py={0.5}
              minH="28px"
              borderRadius="md"
              bg={node._id === activeProjectId ? activeBg : "transparent"}
              position="relative"
              _hover={{
                bg: hoverBg,
                "& .action-buttons": { opacity: 1, visibility: "visible" }
              }}
              cursor="pointer"
              onClick={() => toggleFolder(node)}
              transition="all 0.2s"
              role="group"
            >
              {node._id === activeProjectId && (
                <Box
                  position="absolute"
                  left={0}
                  top="4px"
                  bottom="4px"
                  width="3px"
                  bg={activeBorder}
                  borderRightRadius="full"
                  zIndex={2}
                />
              )}
              <Box mr={1.5} display="flex" alignItems="center">
                {node.isOpen ? (
                  <ChevronDown size={12} color={iconColor} />
                ) : (
                  <ChevronRight size={12} color={iconColor} />
                )}
              </Box>

              <Box mr={1.5} color="#f59e0b">
                {node.isOpen ? <FolderOpen size={14} /> : <Folder size={14} />}
              </Box>

              <Tooltip label={node.name} placement="top-start" openDelay={500} hasArrow>
                <Text
                  color={textColor}
                  fontSize="12px"
                  lineHeight="1.2"
                  fontWeight={node._id === activeProjectId ? "600" : "500"}
                  flex="1"
                  wordBreak="break-word"
                >
                  {node.name}
                </Text>
              </Tooltip>
              <HStack
                className="action-buttons"
                spacing={0}
                opacity={0}
                visibility="hidden"
                transition="all 0.2s"
              >
                <Tooltip label="New Folder" hasArrow>
                  <IconButton
                    aria-label="New Folder"
                    icon={<FolderPlus size={14} />}
                    size="xs"
                    width="22px"
                    height="22px"
                    variant="ghost"
                    color="blue.500"
                    onClick={(e) => {
                      e.stopPropagation();
                      openCreateModal(node, "folder");
                    }}
                    _hover={{ color: "blue.600", bg: "blue.50" }}
                  />
                </Tooltip>
                <Tooltip label="New File" hasArrow>
                  <IconButton
                    aria-label="New File"
                    icon={<FilePlus size={14} />}
                    size="xs"
                    width="22px"
                    height="22px"
                    variant="ghost"
                    color="green.500"
                    onClick={(e) => {
                      e.stopPropagation();
                      openCreateModal(node, "file");
                    }}
                    _hover={{ color: "green.600", bg: "green.50" }}
                  />
                </Tooltip>
                <Tooltip label={isNodeProtected ? "Protected" : "Rename"} hasArrow>
                  <IconButton
                    aria-label="Rename"
                    icon={isNodeProtected ? <Lock size={14} /> : <Pencil size={14} />}
                    size="xs"
                    width="22px"
                    height="22px"
                    variant="ghost"
                    color={isNodeProtected ? actionIconColor : "orange.500"}
                    isDisabled={isNodeProtected}
                    onClick={(e) => {
                      e.stopPropagation();
                      openRenameModal(node);
                    }}
                    _hover={{ color: "orange.600", bg: "orange.50" }}
                  />
                </Tooltip>
                <Tooltip label={isNodeProtected ? "Protected" : "Import Project"} hasArrow>
                  <IconButton
                    aria-label="Import Project"
                    icon={isNodeProtected ? <Lock size={14} /> : <Archive size={14} />}
                    size="xs"
                    width="22px"
                    height="22px"
                    variant="ghost"
                    color={isNodeProtected ? actionIconColor : "teal.500"}
                    isDisabled={isNodeProtected}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUploadModalOpen();
                    }}
                    _hover={{ color: "teal.600", bg: "teal.50" }}
                  />
                </Tooltip>
                <Tooltip label={isNodeProtected ? "Protected" : "Delete"} hasArrow>
                  <IconButton
                    aria-label="Delete"
                    icon={isNodeProtected ? <Lock size={14} /> : <Trash2 size={14} />}
                    size="xs"
                    width="22px"
                    height="22px"
                    variant="ghost"
                    color={isNodeProtected ? actionIconColor : "red.500"}
                    isDisabled={isNodeProtected}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFolderDelete(node, parent);
                    }}
                    _hover={{ color: "red.600", bg: "red.50" }}
                  />
                </Tooltip>
              </HStack>
            </Box>

            <Collapse in={node.isOpen} animateOpacity style={{ width: "100%" }}>
              <Box pl={3} borderLeft="1px solid" borderColor={borderColor} ml={3}>
                {node.children.map((child) => renderFileSystem(child, currentProject, node))}
              </Box>
            </Collapse>
          </>
        ) : (
          <Box
            display="flex"
            alignItems="center"
            px={2}
            py={0.5}
            minH="28px"
            borderRadius="md"
            cursor="pointer"
            width="100%"
            _hover={{
              bg: hoverBg,
              "& .file-actions": { opacity: 1, visibility: "visible" }
            }}
            transition="all 0.2s"
            role="group"
            onClick={() => handleFileClick(node, currentProject)}
          >
            <Box mr={1.5} ml={3.5} color={iconColor}>
              {getFileIcon(node.name)}
            </Box>

            <Tooltip label={node.name} placement="top-start" openDelay={500} hasArrow>
              <Text color={textColor} fontSize="12px" lineHeight="1.2" flex="1" wordBreak="break-word">
                {node.name}
              </Text>
            </Tooltip>

            <HStack
              className="file-actions"
              spacing={0}
              opacity={0}
              visibility="hidden"
              transition="all 0.2s"
            >
              <Tooltip label={isNodeProtected ? "Protected" : "Rename"} hasArrow>
                <IconButton
                  aria-label="Rename"
                  icon={isNodeProtected ? <Lock size={14} /> : <Pencil size={14} />}
                  size="xs"
                  width="22px"
                  height="22px"
                  variant="ghost"
                  color={isNodeProtected ? actionIconColor : "orange.500"}
                  isDisabled={isNodeProtected}
                  onClick={(e) => {
                    e.stopPropagation();
                    openRenameModal(node);
                  }}
                  _hover={{ color: "orange.600", bg: "orange.50" }}
                />
              </Tooltip>
              <Tooltip label={isNodeProtected ? "Protected" : "Delete File"} hasArrow>
                <IconButton
                  aria-label="Delete File"
                  icon={isNodeProtected ? <Lock size={14} /> : <Trash2 size={14} />}
                  size="xs"
                  width="22px"
                  height="22px"
                  variant="ghost"
                  color={isNodeProtected ? actionIconColor : "red.500"}
                  isDisabled={isNodeProtected}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFolderDelete(node, parent);
                  }}
                  _hover={{ color: "red.600", bg: "red.50" }}
                />
              </Tooltip>
            </HStack>
          </Box>
        )}
      </VStack>
    );
  });

  const renderFileSystem = (node, topLevelProject = null, parent = null) => {
    const isTopLevel = fileSystem.children?.some(c => c._id === node._id);
    const currentProject = isTopLevel ? node : topLevelProject;

    return (
      <FileNode
        key={node._id || node.name}
        node={node}
        parent={parent}
        currentProject={currentProject}
        activeProjectId={activeProjectId}
        activeBg={activeBg}
        activeBorder={activeBorder}
        hoverBg={hoverBg}
        iconColor={iconColor}
        actionIconColor={actionIconColor}
        textColor={textColor}
        toggleFolder={toggleFolder}
        handleFileClick={handleFileClick}
        openCreateModal={openCreateModal}
        openRenameModal={openRenameModal}
        handleFolderDelete={handleFolderDelete}
        isProtected={isProtected}
        getFileIcon={getFileIcon}
        borderColor={borderColor}
        renderFileSystem={renderFileSystem}
      />
    );
  };

  return (
    <Box width="100%" height="100%" display="flex" flexDirection="column" bg={useColorModeValue("white", "gray.900")}>
      <VStack spacing={2} mb={2} px={1}>
        <Button
          leftIcon={<Plus size={16} />}
          size="sm"
          width="100%"
          onClick={onOpen}
          colorScheme="blue"
          variant="solid"
          fontSize="xs"
          fontWeight="600"
          borderRadius="md"
          boxShadow="sm"
          _hover={{
            transform: "translateY(-1px)",
            boxShadow: "md"
          }}
        >
          Create New Project
        </Button>
      </VStack>

      {error && (
        <Box px={2} py={2} mb={2} bg="red.50" color="red.500" borderRadius="md" fontSize="xs">
          <Text fontWeight="bold">Error loading files:</Text>
          <Text>{error}</Text>
          <Button size="xs" mt={2} colorScheme="red" variant="outline" onClick={handleRefresh} isLoading={isLoading}>
            Retry
          </Button>
        </Box>
      )}



      <Box flex="1" overflowY="auto" className="custom-scrollbar" px={1}>
        {fileSystem.children &&
          fileSystem.children.map((child) => renderFileSystem(child))}
      </Box>

      <CreateNewProjectModal
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        fileSystem={fileSystem}
        folder={"folder"}
        userId={user?.userId}
        setFileSystem={setFileSystem}
      />

      <CreateItemModal
        isOpen={isCreateItemOpen}
        onClose={onCreateItemClose}
        type={createItemType}
        parentFolder={createItemParent}
        userId={user?.userId}
        onSuccess={handleRefresh}
      />

      <RenameItemModal
        isOpen={isRenameItemOpen}
        onClose={onRenameItemClose}
        item={renameItem}
        onSuccess={handleRefresh}
      />

      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteAlertClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Item
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete <strong>{itemToDelete?.node?.name}</strong>? 
              This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteAlertClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3} isLoading={isDeleting}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={onUploadModalClose} 
        onSuccess={(newProjectId, newProjectName) => {
          if (newProjectId && newProjectName) {
            setActiveProjectId(newProjectId);
            setActiveProjectName(newProjectName);
          }
          handleRefresh();
        }} 
      />
    </Box>
  );
};

export default FileExplorer;
