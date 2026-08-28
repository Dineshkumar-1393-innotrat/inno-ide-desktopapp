import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  VStack,
} from "@chakra-ui/react";

const Erase = ({ isOpen, onClose }) => {
  const [isConfirmOpen, setConfirmOpen] = useState(false);

  const handleErase = () => {
    setConfirmOpen(true); // Open confirmation modal
  };

  const handleFinalErase = () => {
    alert("Existing data erased successfully!");
    setConfirmOpen(false); // Close confirmation modal
    onClose(); // Close the main modal as well after erase
  };

  return (
    <>
      {/* First Modal for Target Device Flash */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Erase Device Data</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>This will erase all data on the device. Are you sure?</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" onClick={handleErase}>
              Erase Data
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Second Modal for Confirmation */}
      <Modal isOpen={isConfirmOpen} onClose={() => setConfirmOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Erase</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to erase this? This action cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" onClick={handleFinalErase}>
              Confirm Erase
            </Button>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};


export default Erase;