import { useEffect, useState } from "react";
import { API } from '@/config';
import { Button, IconButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Text, Spinner, useDisclosure } from "@chakra-ui/react";
import { FaUser } from "react-icons/fa";
import axios from "axios";

const UserButton = () => {
    const [userId, setUserId] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        const storedUserId = sessionStorage.getItem("userId");
        if (storedUserId) {
            setUserId(storedUserId);
        }
    }, []);

    const fetchUserDetails = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const response = await axios.get(`${API.MAIN}/api/v1/getAllUserDetails/${userId}`);
            if (response.data.status === "success") {
                setUserData(response.data.data);
                onOpen();
            }
        } catch (error) {
            console.error("Error fetching user details:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!userId) return null;

    return (
        <>
            <IconButton
                icon={<FaUser />}
                aria-label="User Details"
                onClick={fetchUserDetails}
                colorScheme="blue"
                size = "sm"
            />

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>User Details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {loading ? (
                            <Spinner size="lg" />
                        ) : userData ? (
                            <>
                                <Text><b>Name:</b> {userData.name}</Text>
                                <Text><b>Mobile:</b> {userData.countryCode} {userData.mobileNumber}</Text>
                                <Text><b>Created At:</b> {new Date(userData.createdAt).toLocaleString()}</Text>
                            </>
                        ) : (
                            <Text>No user data found.</Text>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="red" onClick={onClose}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default UserButton;
