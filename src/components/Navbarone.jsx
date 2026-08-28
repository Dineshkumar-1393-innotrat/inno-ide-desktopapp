import React, { useState } from "react";
import {
  Box,
  Button,
  useColorMode,
  Text,
  Avatar,
  Switch,
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
  Checkbox,
  VStack,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useNavigate
import MenuOptions from "./MenuOptions";
import BackToHome from "./BackToHome";
import Ellipse521 from "../images/Ellipse 521.svg";
import DefineProductOne from "./DefineProductOne";
// import NavbarProductId from './NavbarProductId';
import Logout from "./Logout";
import UserButton from "./UserButton";

const Navbar = () => {
  const { loginWithRedirect, isAuthenticated, logout, user } = useAuth0();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate(); // Initialize the navigate hook

  const location = useLocation();

  const bgColor = colorMode === "dark" ? "gray.800" : "gray.200";
  const textColor = colorMode === "dark" ? "white" : "gray.800";

  const [projectName, setProjectName] = useState("");
  const [boardType, setBoardType] = useState("STM32 U5");
  const [projectType, setProjectType] = useState("bare metal");
  const [features, setFeatures] = useState({
    writeCode: false,
    flowChart: false,
    blockDiagram: false,
    simulation: false,
    blockProgramming: false,
  });

  // Debug: Log features state to verify it includes all options
  console.log('Features state:', features);

  const handleCreate = () => {
    console.log({
      projectName,
      projectType,
      boardType,
      features,
    });

    // Show creation success message
    console.log(`Project "${projectName}" created successfully!`);

    // Automatically redirect to the first selected feature screen
    // Priority order: Block Programming > Block Diagram > Flow Chart > Simulation > Write Code
    let redirectTarget = '';
    if (features.blockProgramming) {
      redirectTarget = 'BlockProgramming';
      navigate("/blockprogramming");
    } else if (features.blockDiagram) {
      redirectTarget = 'BlockDiagram';
      navigate("/blockdiagram");
    } else if (features.flowChart) {
      redirectTarget = 'FlowChart';
      navigate("/FlowchartTTest");
    } else if (features.simulation) {
      redirectTarget = 'Simulation';
      navigate("/simulation");
    } else if (features.writeCode) {
      redirectTarget = 'CodeEditor';
      navigate("/editor");
    } else if (features.mathCodeEditor) {
      redirectTarget = 'MathCodeEditor';
      navigate("/mathcodeeditor");
    }

    if (redirectTarget) {
      console.log(`Redirecting to ${redirectTarget} workspace`);
    }
    
    // Trigger project creation event for the integration system
    window.dispatchEvent(new CustomEvent('project:created', {
      detail: {
        projectName,
        projectType,
        boardType,
        features,
        redirectTarget
      }
    }));
    
    onClose();
  };

  // Handle the click on the "Embedded" button
  const handleEmbeddedClick = () => {
    navigate("/embedded"); // Redirect to the /embedded route
  };

  const handleSimulationClick = () => {
    navigate("/simulation"); // Redirect to the /embedded route
  };

  const handleFlowchartClick = () => {
    navigate("/flowcharttest");
  };

  const handleBlockDiagramClick = () => {
    navigate("/blockdiagram");
  };

  const handleBlockProgrammingClick = () => {
    navigate("/blockprogramming");
  };
  const handleMathCodeEditorClick = () => {
    navigate("/mathcodeeditor");
  };
  return (
    <Box>
      {/* First Navbar */}
      <Box
        position="fixed"
        top={0}
        left={0}
        width="100%"
        height="35px"
        bg={bgColor}
        color={textColor}
        borderBottom="1px solid gray"
        display="flex"
        alignItems="center"
        padding="0 20px"
        zIndex={1000}
      >
        <Text fontWeight="bold" fontSize="lg">
          {/* INNOIDE */}
          <img
            src={Ellipse521}
            alt="Innoide"
            style={{ maxWidth: "20%", height: "auto" }}
          />
        </Text>
      </Box>

      {/* Second Navbar */}
      <Box
        position="fixed"
        top="35px"
        left={0}
        width="100%"
        height="35px"
        bg={bgColor}
        color={textColor}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        padding="0 10px"
        borderBottom="1px solid gray"
        zIndex={999}
      >
        {/* Back to Home and Menu Options */}
        <Box display="flex" alignItems="center" gap="20px">
          <BackToHome />
          <MenuOptions onOpen={onOpen} />
        </Box>

        {/* Right Side: Settings, Dark Mode Toggle, Profile, and Log In/Out */}
        <Box display="flex" alignItems="center" gap={4}>
          <Box display="flex" alignItems="center">
            <Text mr={2}>Theme</Text>
            <Switch
              isChecked={colorMode === "dark"}
              onChange={toggleColorMode}
              colorScheme="purple"
            />
          </Box>

          {isAuthenticated ? (
            <Menu>
              <MenuButton as={Box} display="flex" alignItems="center">
                <Avatar
                  name={user.name}
                  src={user.picture}
                  boxSize="24px"
                  mr={2}
                />
              </MenuButton>
              <MenuList>
                <MenuItem>My Profile</MenuItem>
                <MenuItem
                  onClick={() => logout({ returnTo: window.location.origin })}
                >
                  Log Out
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <>
              {/* <Button
                onClick={() => loginWithRedirect()}
                size="sm"
                bg={bgColor}
                color={textColor}
                _hover={{
                  bg: "gray.300",
                  color: "gray.900",
                }}
              >
                Log In
              </Button> */}
              <Logout />
              <UserButton />
              {/* <NavbarProductId/> */}

              {/* Embedded Button: This will redirect to /embedded */}

              <Button
                onClick={handleEmbeddedClick} // Attach the redirect handler
                size="sm"
                bg={bgColor}
                color={textColor}
                _hover={{
                  bg: "gray.300",
                  color: "gray.900",
                }}
              >
                Embedded
              </Button>

              {location.pathname === "/blockdiagram" && (
                <Button
                  onClick={handleSimulationClick} // Attach the redirect handler
                  size="sm"
                  bg={bgColor}
                  color={textColor}
                  _hover={{
                    bg: "gray.300",
                    color: "gray.900",
                  }}
                >
                  ▶ Simulation
                </Button>
              )}

              {location.pathname === "/simulation" && (
                <Button
                  onClick={() => {
                    navigate("/blockdiagram");
                  }} // Attach the redirect handler
                  size="sm"
                  bg={bgColor}
                  color={textColor}
                  _hover={{
                    bg: "gray.300",
                    color: "gray.900",
                  }}
                >
                  Block Diagram
                </Button>
              )}

              <Button
                onClick={handleFlowchartClick} // Attach the redirect handler
                size="sm"
                bg={bgColor}
                color={textColor}
                _hover={{
                  bg: "gray.300",
                  color: "gray.900",
                }}
              >
                Flowchart
              </Button>

              {/* for simulation  */}

              {/* Embedded Button: This will redirect to /embedded */}
            </>
          )}
        </Box>
      </Box>

      {/* Modal for creating a new project */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Project</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Project Name</FormLabel>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Project Type</FormLabel>
              <RadioGroup value={projectType} onChange={setProjectType}>
                <Stack direction="row">
                  <Radio value="bare metal">Bare Metal</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Board</FormLabel>
              <RadioGroup value={boardType} onChange={setBoardType}>
                <Stack direction="row">
                  <Radio value="STM32 U5">STM32 U5</Radio>
                  <Radio value="NRF52840">NRF52840</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Additional Options</FormLabel>
              <VStack align="start" spacing={2} key="additional-options-list">
                <Checkbox
                  isChecked={features.writeCode}
                  onChange={(e) =>
                    setFeatures({ ...features, writeCode: e.target.checked })
                  }
                >
                  Write Code
                </Checkbox>
                <Checkbox
                  isChecked={features.flowChart}
                  onChange={(e) =>
                    setFeatures({ ...features, flowChart: e.target.checked })
                  }
                >
                  Flow Chart
                </Checkbox>
                <Checkbox
                  isChecked={features.blockDiagram}
                  onChange={(e) =>
                    setFeatures({ ...features, blockDiagram: e.target.checked })
                  }
                >
                  Block Diagram
                </Checkbox>
                <Checkbox
                  isChecked={features.simulation}
                  onChange={(e) =>
                    setFeatures({ ...features, simulation: e.target.checked })
                  }
                >
                  Simulation
                </Checkbox>
                <Checkbox
                  isChecked={features.blockProgramming}
                  onChange={(e) =>
                    setFeatures({ ...features, blockProgramming: e.target.checked })
                  }
                >
                  Block Programming
                </Checkbox>
                <Checkbox
                  isChecked={features.mathCodeEditor}
                  onChange={(e) =>
                    setFeatures({ ...features, mathCodeEditor: e.target.checked })
                  }
                >
                  Math Code Editor
                </Checkbox>
              </VStack>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleCreate}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Navbar;
