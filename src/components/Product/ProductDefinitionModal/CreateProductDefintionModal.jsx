
//22-11-25
import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  Center,
} from "@chakra-ui/react";
import ProductDefinition from "../../CreateProduct";
import { useProject } from "../../../ProjectContext";

const CreateProductDefintionModal = ({
  // activeProductId,
  // activeProjectName,
  setIsProductDefined,

  fetchFileSystem,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { activeProductId, activeProjectName, activeProjectId } = useProject();

  const currentProjectId = activeProjectId || localStorage.getItem("activeProjectId") || "";
  const currentProductId = activeProductId || localStorage.getItem("activeProductId") || currentProjectId;
  const currentProductName = activeProjectName || localStorage.getItem("activeProjectName") || "Product";

  const isMissed = localStorage.getItem(`innoide:product_create_missed_${currentProjectId}`) === "true";
  const projectStatus = localStorage.getItem(`innoide:project_status_${currentProjectId}`);
  const isNew = (projectStatus === "new" || !projectStatus) && !isMissed;

  const handleClose = () => {
    if (isNew && currentProjectId) {
      localStorage.setItem(`innoide:product_create_missed_${currentProjectId}`, "true");
      localStorage.setItem(`innoide:project_status_${currentProjectId}`, "missed");
      window.dispatchEvent(new CustomEvent("product-definition-changed"));
    }
    onClose();
  };

  return (
    <>
      <Button
        onClick={onOpen}
        size={"sm"}
        bg="#2563eb"
        color="#ffffff"
        _hover={{ bg: "#1d4ed8" }}
        borderRadius="full"
        height="32px"
        px={5}
        zIndex={999}
      >
        {isNew ? "+ Create Product" : "+ Define Product"}
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose} size={"6xl"} scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent bg="#f8fafc" maxW="1150px" borderRadius="xl" overflow="hidden">
          <ModalHeader bg="white" borderBottom="1px solid" borderColor="gray.200" py={3} px={6} fontSize="md" fontWeight="bold">
            {isNew ? "Create Product" : "Define Product"}
          </ModalHeader>

          <ModalCloseButton top="10px" right="16px" />
          <ModalBody p={0}>
            <ProductDefinition
              initialStep={2}
              onClose={handleClose}
              onSuccess={() => {
                if (typeof setIsProductDefined === "function") {
                  setIsProductDefined(true);
                }
                handleClose();
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreateProductDefintionModal;