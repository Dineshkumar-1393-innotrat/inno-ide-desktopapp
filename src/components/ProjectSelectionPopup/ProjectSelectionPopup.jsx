import { Box, Select } from "@chakra-ui/react";
import { useProject } from "../../ProjectContext";

const ProjectChangePopup = ({
  selectedProject,
  onProjectChange,
  fileSystem,
}) => {
  const { setActiveProjectId, setActiveProductId, setActiveProjectName } =
    useProject();

  console.log("fileSystem:", fileSystem);

  return (
    <Box position="absolute" zIndex="modal" mr={"32"}>
      <Select
        width={"auto"}
        placeholder="Select Project"
        value={selectedProject?.name || ""}
        onChange={(e) => {
          const selected = fileSystem?.children?.find(
            (project) => project.name === e.target.value
          );

          if (selected) {
            onProjectChange(selected);
            setActiveProductId(selected.productId);
            setActiveProjectId(selected._id);
            setActiveProjectName(selected.name);

            console.log("selected at popup:", selected);
          }
        }}
        size="sm"
        bg="teal.500"
        color="white" // This applies only when an option is selected
        border="none"
        borderRadius={6}
        _hover={{ bg: "teal.600" }}
        _focus={{ bg: "teal.700", outline: "none" }}
        sx={{
          option: {
            backgroundColor: "white",
            color: "black",
          },
        }}
      >
        {/* ✅ Ensures placeholder doesn't get overridden */}
        <option value="" disabled hidden style={{ color: "gray" }}>
          Select Project
        </option>

        {fileSystem?.children?.map((project) => (
          <option key={project.name} value={project.name}>
            {project.name}
          </option>
        ))}
      </Select>
    </Box>
  );
};

export default ProjectChangePopup;
