// import React from "react";
// import {
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalFooter,
//   ModalBody,
//   ModalCloseButton,
//   useDisclosure,
//   Button,
//   Center,
// } from "@chakra-ui/react";
// import CreateProductDefinition from "../ProductDefinition/CreateProductDefinition";
// import { useProject } from "../../../ProjectContext";

// const CreateProductDefintionModal = ({
//   // activeProductId,
//   // activeProjectName,
//   setIsProductDefined,

//   fetchFileSystem,
// }) => {
//   const { isOpen, onOpen, onClose } = useDisclosure();

//   const { activeProductId, activeProjectName } = useProject();

//   return (
//     <>
//       <Button
//         onClick={onOpen}
//         size={"sm"}
//         colorScheme="teal"
//         float={"inline-end"}
//         zIndex={999}
//       >
//         Define Product
//       </Button>

//       <Modal isOpen={isOpen} onClose={onClose} size={"xl"}>
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader textAlign="center">{activeProjectName}</ModalHeader>

//           <ModalCloseButton />
//           <ModalBody>
//             <CreateProductDefinition
//               setIsProductDefined={setIsProductDefined}
//               productID={activeProductId}
//               productName={activeProjectName}
//               onClose={onClose}
//               fetchFileSystem={fetchFileSystem}
//             />
//           </ModalBody>
//         </ModalContent>
//       </Modal>
//     </>
//   );
// };

// export default CreateProductDefintionModal;


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
import CreateProductDefinition from "../ProductDefinition/CreateProductDefinition";
import { useProject } from "../../../ProjectContext";

const CreateProductDefintionModal = ({
  // activeProductId,
  // activeProjectName,
  setIsProductDefined,

  fetchFileSystem,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { activeProductId, activeProjectName, activeProjectId } = useProject();

  if (!activeProjectId || !activeProductId || !activeProjectName || activeProjectName === "Untitled Project") {
    return null;
  }

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
        + Define Product
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size={"xl"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center">{activeProjectName}</ModalHeader>

          <ModalCloseButton />
          <ModalBody>
            <CreateProductDefinition
              setIsProductDefined={setIsProductDefined}
              productID={activeProductId}
              productName={activeProjectName}
              onClose={onClose}
              fetchFileSystem={fetchFileSystem}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreateProductDefintionModal;