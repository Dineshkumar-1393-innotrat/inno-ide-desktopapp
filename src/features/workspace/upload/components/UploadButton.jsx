import React from "react";
import { Button, useDisclosure } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import UploadModal from "./UploadModal";

const UploadButton = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button
        leftIcon={<Plus size={16} />}
        size="sm"
        width="100%"
        onClick={onOpen}
        colorScheme="teal"
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
        Import Project
      </Button>
      
      <UploadModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default UploadButton;
