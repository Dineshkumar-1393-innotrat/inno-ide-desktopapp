import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  useDisclosure,
} from "@chakra-ui/react";
import { useProject } from "../../ProjectContext";

const ProjectSelectionModal = ({ onProjectSelect, fileSystem }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProject, setSelectedProject] = useState(null);

  const {
    setActiveProjectId,
    setActiveProductId,
    setActiveProjectName,
    activeProjectId,
    activeProductId,
  } = useProject();

  useEffect(() => {
    onOpen(); // Open modal automatically on component load
  }, []);

  const handleSelect = () => {
    if (selectedProject) {
      onProjectSelect(selectedProject);
      onClose(); // Close modal after selection
    }
  };

  console.log("@project selection modal", activeProductId, activeProjectId);

  return (
    <Modal isOpen={isOpen} onClose={() => {}} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select a Project</ModalHeader>
        <ModalBody>
          <Select
            placeholder="Choose a project"
            onChange={(e) => {
              const selectedName = e.target.value; // Get selected project name as a string
              const projectObj = fileSystem?.children?.find(
                (p) => p.name === selectedName
              );

              console.log("projectObj", projectObj);
              setSelectedProject(projectObj); // Store the full project object
              setActiveProductId(projectObj.productId);
              setActiveProjectId(projectObj._id);
              setActiveProjectName(projectObj.name);
            }}
          >
            {fileSystem?.children?.map((project) => (
              <option key={project.name} value={project.name}>
                {project.name}
              </option>
            ))}
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            onClick={handleSelect}
            isDisabled={!selectedProject}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProjectSelectionModal;
