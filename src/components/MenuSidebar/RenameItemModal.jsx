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
    Button,
    useToast,
} from "@chakra-ui/react";
import axios from "axios";

const RenameItemModal = ({ isOpen, onClose, item, onSuccess }) => {
    const [newName, setNewName] = useState("");
    const toast = useToast();

    useEffect(() => {
        if (isOpen && item) {
            setNewName(item.name || "");
        }
    }, [isOpen, item]);

    const handleRename = async () => {
        try {
            if (!newName.trim()) {
                toast({
                    title: "Name required",
                    description: "Please enter a new name.",
                    status: "warning",
                    duration: 3000,
                    isClosable: true,
                });
                return;
            }

            if (newName === item.name) {
                onClose();
                return;
            }

            const payload = {
                fileId: item._id,
                newName: newName,
            };

            // If it's a file, we should preserve its content during rename
            if (item.type === "file") {
                payload.newContent = item.content || "";
            }

            const { data } = await axios.put(
                `${API.MAIN}/api/v1/updateFileAndFolder`,
                payload
            );

            if (data.success) {
                toast({
                    title: "Success",
                    description: "Item renamed successfully.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                if (onSuccess) onSuccess();
                onClose();
            } else {
                throw new Error(data.message || "Rename failed");
            }
        } catch (error) {
            console.error("Error renaming item:", error);
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
                <ModalHeader>Rename {item?.type === "folder" ? "Folder" : "File"}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <FormControl isRequired>
                        <FormLabel>New Name</FormLabel>
                        <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Enter new name"
                            autoFocus
                            color="black"
                            _placeholder={{ color: "gray.500" }}
                        />
                    </FormControl>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button colorScheme="blue" onClick={handleRename}>
                        Rename
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default RenameItemModal;
