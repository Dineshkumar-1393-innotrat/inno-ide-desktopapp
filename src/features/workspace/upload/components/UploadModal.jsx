import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  useToast,
  Divider,
} from "@chakra-ui/react";
import UploadDropzone from "./UploadDropzone";
import UploadProgress from "./UploadProgress";
import { importProjectZip } from "../../store/workspaceSlice";
import { FolderOpen, Github, DownloadCloud, Blocks } from "lucide-react";
import { getUserInfo } from "../../../../utilities";

const UploadModal = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { runtimeState, progress } = useSelector((state) => state.workspace);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (file) => {
    setError(null);
    if (!file) {
      setSelectedFile(null);
      return;
    }
    
    // Validation
    if (!file.name.endsWith(".zip")) {
      setError("Only .zip files are allowed.");
      setSelectedFile(null);
      return;
    }
    
    if (file.size > 100 * 1024 * 1024) {
      setError("Maximum file size is 100MB.");
      setSelectedFile(null);
      return;
    }
    
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    
    let userId = null;
    try {
      const userInfo = getUserInfo();
      userId = userInfo?.userId;
    } catch (e) {
      console.error("Failed to parse userInfo", e);
    }

    dispatch(importProjectZip({ 
      file: selectedFile, 
      userId,
      projectName: selectedFile.name.replace(".zip", "")
    })).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        toast({
          title: "Upload Successful",
          description: "Project uploaded successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        const rootFolderId = result.payload?.rootFolderId;
        const finalProjectName = selectedFile.name.replace(".zip", "");
        if (rootFolderId) {
          try {
            localStorage.setItem("activeProjectId", rootFolderId);
            localStorage.setItem("activeProjectName", finalProjectName);
          } catch (e) {
            console.error("Failed to save active project to local storage", e);
          }
        }

        if (onSuccess) onSuccess(rootFolderId, finalProjectName); // Notify parent to refresh File System
        onClose(); // Close modal after successful upload
      } else {
        toast({
          title: "Upload Failed",
          description: result.payload || "Something went wrong.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent>
        <ModalHeader>Import Project</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <HStack spacing={3} pb={2} align="center">
              <Button 
                size="sm" 
                variant="solid" 
                colorScheme="blue" 
                leftIcon={<DownloadCloud size={16} />}
                onClick={() => document.getElementById("zip-upload-input")?.click()}
              >
                Upload ZIP
              </Button>
              <Text fontSize="xs" color="gray.500" fontStyle="italic">
                Note: Git clone, local folder import, and templates are coming soon.
              </Text>
            </HStack>

            <Divider />
            
            {runtimeState === "uploading" ? (
              <UploadProgress progress={progress} fileName={selectedFile?.name} />
            ) : (
              <UploadDropzone 
                onFileSelected={handleFileChange} 
                selectedFile={selectedFile} 
                error={error} 
              />
            )}
            
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={runtimeState === "uploading"}>
            Cancel
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleUpload} 
            isDisabled={!selectedFile || runtimeState === "uploading"}
            isLoading={runtimeState === "uploading"}
            loadingText="Uploading..."
          >
            Import
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UploadModal;
