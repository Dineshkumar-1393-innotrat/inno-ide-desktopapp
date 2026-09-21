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
    switchProject,
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
      if (typeof switchProject === 'function') {
        switchProject({
          projectId: selectedProject._id,
          projectName: selectedProject.name,
          productId: selectedProject.productId,
          productName: selectedProject.name,
        });
      } else {
        if (setActiveProductId) setActiveProductId(selectedProject.productId);
        if (setActiveProjectId) setActiveProjectId(selectedProject._id);
        if (setActiveProjectName) setActiveProjectName(selectedProject.name);
      }
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
