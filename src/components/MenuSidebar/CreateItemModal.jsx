import React, { useState, useEffect } from "react";
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
    RadioGroup,
    Stack,
    Radio,
    VStack,
    Button,
    useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useProject } from "../../ProjectContext";

const CreateItemModal = ({
    isOpen,
    onClose,
    type, // "file" or "folder"
    parentFolder,
    userId,
    onSuccess,
}) => {
    const [itemName, setItemName] = useState("");
    const [feature, setFeature] = useState("writeCode");
    const navigate = useNavigate();
    const toast = useToast();
    const {
        setActiveProductId,
        setActiveProjectId,
        setActiveProductName,
        setActiveProjectName,
    } = useProject();

    useEffect(() => {
        if (isOpen) {
            setItemName("");
            setFeature("writeCode");
        }
    }, [isOpen]);

    useEffect(() => {
        const lowerName = itemName.toLowerCase();
        if (lowerName.includes("flowchart") || lowerName.includes("flow chart")) {
            setFeature("flowChart");
        } else if (lowerName.includes("block diagram")) {
            setFeature("blockDiagram");
        } else if (lowerName.includes("simulation")) {
            setFeature("simulation");
        } else if (lowerName.includes("block programming")) {
            setFeature("blockProgramming");
        }
    }, [itemName]);

    const handleCreate = async () => {
        try {
            let finalName = itemName.trim();
            
            // Auto-append appropriate extensions if missing
            if (type === "file" && !finalName.includes(".")) {
                const extensionMap = {
                    writeCode: ".c",
                    flowChart: ".json",
                    blockDiagram: ".json",
                    simulation: ".c",
                    blockProgramming: ".json"
                };
                finalName += extensionMap[feature] || ".c";
            }

            const { data } = await axios.post(
                `${API.MAIN}/api/v1/createFileAndFolder`,
                {
                    parentId: parentFolder._id,
                    name: finalName,
                    type,
                    userId,
                }
            );

            if (data.success) {
                toast({
                    title: "Success",
                    description: `${type === "folder" ? "Folder" : "File"} created successfully.`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });

                // Update active project context if it's a top-level folder or relevant
                // This mimics logic from FileExplorer toggleFolder or CreateNewProjectModal
                if (data.file) {
                    // If the API returns the created file/folder object
                    // We might want to set it as active if it's a project-like folder
                }

                if (onSuccess) onSuccess();
                onClose();

                // Redirect based on selection
                // Redirect based on selection with the newly created file in state for Smooth Loading
                const navigationState = { 
                    state: { 
                        filePath: data.file?.path || finalName, 
                        fileContent: data.file?.content || (type === "file" ? "" : null)
                    } 
                };

                switch (feature) {
                    case "writeCode":
                        navigate("/editor", navigationState);
                        break;
                    case "flowChart":
                        navigate("/flowcharttest", navigationState);
                        break;
                    case "blockDiagram":
                        navigate("/BlockDiagram", navigationState);
                        break;
                    case "simulation":
                        navigate("/simulation", navigationState);
                        break;
                    case "blockProgramming":
                        navigate("/blockprogramming", navigationState);
                        break;
                    default:
                        navigate("/editor", navigationState);
                }
            } else {
                throw new Error(data.message || "Creation failed");
            }
        } catch (error) {
            console.error(`Error creating ${type}:`, error);
            toast({
                title: "Error",
                description: error.response?.data?.message || error.message || "An error occurred.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Create New {type === "folder" ? "Folder" : "File"}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <FormControl isRequired>
                        <FormLabel>{type === "folder" ? "Folder" : "File"} Name</FormLabel>
                        <Input
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            placeholder={`Enter ${type} name`}
                            autoFocus
                            color="black"
                            _placeholder={{ color: "gray.500" }}
                        />
                    </FormControl>

                    <FormControl mt={4}>
                        <FormLabel>Open In</FormLabel>
                        <RadioGroup value={feature} onChange={setFeature}>
                            <VStack align="start">
                                <Radio value="writeCode">Write Code (Editor)</Radio>
                                <Radio value="flowChart">Flow Chart</Radio>
                                <Radio value="blockDiagram">Block Diagram</Radio>
                                <Radio value="simulation">Simulation</Radio>
                                <Radio value="blockProgramming">Block Programming</Radio>
                            </VStack>
                        </RadioGroup>
                    </FormControl>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button colorScheme="blue" onClick={handleCreate}>
                        Create & Open
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CreateItemModal;
