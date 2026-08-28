import React, { useState } from "react";
import { API } from '@/config';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  RadioGroup,
  Stack,
  Radio,
  VStack,
  Checkbox,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useProject } from "../../ProjectContext";
import axios from "axios";
import { baseURL, productAPIBase } from "../../utilities";
import { fetchFileSystem } from "../EmbeddedFileManagement/EmbeddedFileManagement";
import { buildTree } from "../EmbeddedFileManagement/EmbeddedFileManagement";

const CreateNewProjectModal = ({
  isOpen,
  onClose,
  fileSystem,
  folder,
  userId,
  setFileSystem,
}) => {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [projectCategory, setProjectCategory] = useState("Logistics");
  const [boardType, setBoardType] = useState("STM32 U5");
  const [projectType, setProjectType] = useState("bare metal");
  const [feature, setFeature] = useState("writeCode");
  const [isCreating, setIsCreating] = useState(false); // prevent double-submit

  const {
    setActiveProductId,
    setActiveProjectId,
    setActiveProductName,
    setActiveProjectName,
    switchProject
  } = useProject();

  const navigate = useNavigate();

  const handleCreateProject = async (
    parentFileSystem,
    type,
    userId,
    projectName,
    projectType,
    boardType,
    feature,
    projDesc,
    category
  ) => {
    try {
      // 1. Create Project in the file system first to get a projectId
      const { data } = await axios.post(
        `${baseURL}/api/v1/createFileAndFolder`,
        {
          parentId: parentFileSystem?._id,
          name: projectName,
          type,
          userId,
          projectType,
          boardType,
          features: feature,
          description: projDesc,
          category: category,
        }
      );

      console.log("Created File/Folder Response:", data);

      if (!data?.success || !data?.file) {
        throw new Error("File/Folder creation failed.");
      }

      const createdFile = data.file;
      const generatedProjectId = createdFile._id;

      // 2. Create Product in the microservice and link the projectId
      const prodResponse = await axios.post(`${productAPIBase}/productNew`, {
        name: projectName,
        userId,
        projectId: generatedProjectId, // Pass projectId to satisfy backend validation
        productDesc: projDesc || "Testing",
        category: category || "Logistics"
      });

      const productId = prodResponse.data.productID || prodResponse.data.productId;
      if (!productId) throw new Error("Product ID generation failed.");

      console.log(`[CreateNewProjectModal] Product created: ${productId}`);

      // Switch to the new project globally
      await switchProject({
        projectId: generatedProjectId,
        projectName: createdFile?.name ?? projectName,
        productId: productId,
        productName: createdFile?.name ?? projectName
      });

      // Refresh filesystem
      await fetchFileSystem(userId, setFileSystem, buildTree);

      // Navigation mapping
      const routeMap = {
        writeCode: "/editor",
        flowChart: "/FlowchartTest",
        blockDiagram: "/BlockDiagram",
        simulation: "/simulation",
      };

      navigate(routeMap[feature] || "/editor");

      onClose();
    } catch (error) {
      console.error(
        "Error creating project:",
        error?.response?.data || error
      );

      alert(
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred."
      );
    }
  };

  const initialRef = React.useRef(null);
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={initialRef} size="xl">
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent maxW="520px" borderRadius="2xl" overflow="hidden">
        <ModalHeader borderBottom="1px solid" borderColor={borderColor}>
          Create New Project
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody maxH="65vh" overflowY="auto" py={5} sx={{
          '&::-webkit-scrollbar': { width: '7px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: '#555', borderRadius: '8px' },
          '&::-webkit-scrollbar-thumb:hover': { background: '#333' },
        }}>
          <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="bold">Project Name</FormLabel>
                <Input
                  ref={initialRef}
                  autoFocus
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  onKeyUp={(e) => e.stopPropagation()}
                  placeholder="e.g. Smart Factory Monitor"
                  color="gray.850"
                  bg="white"
                  _selection={{ bg: "blue.200", color: "gray.800" }}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="bold">Description</FormLabel>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  onKeyUp={(e) => e.stopPropagation()}
                  placeholder="Describe what this project monitors..."
                  color="gray.850"
                  bg="white"
                  rows={3}
                  resize="none"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="bold">Project Category</FormLabel>
                <Select
                  value={projectCategory}
                  onChange={(e) => setProjectCategory(e.target.value)}

                  color="gray.850"
                  bg="white"
                >
                  <option value="Logistics">Logistics</option>
                  <option value="Industrial IoT">Industrial IoT</option>
                  <option value="Environmental">Environmental</option>
                  <option value="Energy">Energy</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Smart Building">Smart Building</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="bold">Project Type</FormLabel>
                <RadioGroup value={projectType} onChange={setProjectType}>
                  <Stack direction="row">
                    <Radio value="bare metal">Bare Metal</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="bold">Board</FormLabel>
                <RadioGroup value={boardType} onChange={setBoardType}>
                  <Stack direction="row">
                    <Radio value="STM32 U5">STM32 U5</Radio>
                    <Radio value="NRF52840">NRF52840</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="bold">Additional Options</FormLabel>
                <RadioGroup value={feature} onChange={setFeature}>
                  <VStack align="start">
                    <Radio value="writeCode">Write Code</Radio>
                    <Radio value="flowChart">Flow Chart</Radio>
                    <Radio value="blockDiagram">Block Diagram</Radio>
                    <Radio value="simulation">Simulation</Radio>
                  </VStack>
                </RadioGroup>
              </FormControl>

          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px solid" borderColor={borderColor}>
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancel
          </Button>

          <Button
            colorScheme="blue"
            isLoading={isCreating}
            loadingText="Creating…"
            isDisabled={isCreating || !projectName.trim()}
            onClick={async () => {
              if (isCreating) return; // extra guard
              setIsCreating(true);
              try {
                await handleCreateProject(
                  fileSystem, // parent (folder) object
                  folder, // type (e.g. "folder")
                  userId,
                  projectName,
                  projectType,
                  boardType,
                  feature, // string like "writeCode", "flowChart", etc.
                  description,
                  projectCategory
                );
              } catch (error) {
                console.error("Create project error:", error);
              } finally {
                setIsCreating(false);
              }
            }}
          >
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateNewProjectModal;
