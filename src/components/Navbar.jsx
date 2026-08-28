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
  HStack,
  IconButton,
  Collapse,
  useDisclosure,
  Menu,           
  MenuButton,
  MenuList,
  MenuItem
} from "@chakra-ui/react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";  // Import useNavigate
import MenuOptions from "./MenuOptions";  
import BackToHome from "./BackToHome";
import Ellipse521 from '../images/Ellipse 521.svg';
import DefineProductOne from "./DefineProductOne";
import Logout from "./Logout";
import UserButton from "./UserButton";

const Navbar = () => {
  const { loginWithRedirect, isAuthenticated, logout, user } = useAuth0();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();  
  const navigate = useNavigate();  // Initialize the navigate hook

  const bgColor = colorMode === "dark" ? "gray.800" : "gray.200";
  const textColor = colorMode === "dark" ? "white" : "gray.800";

  const [projectName, setProjectName] = useState('');
  const [boardType, setBoardType] = useState('STM32 U5');
  const [projectType, setProjectType] = useState('bare metal');
  const [features, setFeatures] = useState({
    writeCode: false,
    flowChart: false
  });
  const { isOpen: isMobileOpen, onOpen: onMobileOpen, onClose: onMobileClose } = useDisclosure();

  const handleCreate = () => {
    console.log({
      projectName,
      projectType,
      boardType,
      features
    });
    onClose(); 
  };

  // Handle the click on the "Embedded" button
  const handleEmbeddedClick = () => {
    navigate("/embedded");  // Redirect to the /embedded route
  };

  const handleSimulationClick = () => {
    navigate("/simulation");  // Redirect to the /embedded route
  };

  return (
    <Box>
      {/* Responsive Navbar */}
      <Box
        position="fixed"
        top={0}
        left={0}
        width="100%"
        height={{ base: "60px", md: "70px" }}
        bg={bgColor}
        color={textColor}
        borderBottom="1px solid"
        borderColor={colorMode === "dark" ? "whiteAlpha.200" : "gray.300"}
        display="flex"
        alignItems="center"
        px={{ base: 4, md: 8 }}
        zIndex={1100}
        backdropFilter="blur(10px)"
      >
        <HStack w="100%" justify="space-between">
          <HStack spacing={4}>
            <Box onClick={() => navigate("/")} cursor="pointer">
              <img src={Ellipse521} alt="Innoide" style={{ height: "30px", width: "auto" }} />
            </Box>
            <Box display={{ base: "none", md: "block" }}>
              <BackToHome />
            </Box>
          </HStack>

          <HStack spacing={6} display={{ base: "none", lg: "flex" }}>
            <MenuOptions onOpen={onOpen} />
            <Button variant="ghost" size="sm" onClick={handleEmbeddedClick}>Embedded</Button>
            <Button variant="ghost" size="sm" onClick={handleSimulationClick}>▶ Simulation</Button>
            <DefineProductOne />
          </HStack>

          <HStack spacing={4}>
            {isAuthenticated ? (
              <Menu>
                <MenuButton as={Box} cursor="pointer">
                  <Avatar name={user.name} src={user.picture} size="sm" />
                </MenuButton>
                <MenuList zIndex={1200}>
                  <MenuItem>My Profile</MenuItem>
                  <MenuItem onClick={() => logout({ returnTo: window.location.origin })}>Log Out</MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Button display={{ base: "none", md: "inline-flex" }} onClick={() => loginWithRedirect()} size="sm" colorScheme="blue">
                Log In
              </Button>
            )}
            <IconButton
              display={{ base: "flex", lg: "none" }}
              icon={<span>☰</span>}
              variant="ghost"
              onClick={onMobileOpen}
              aria-label="Open Menu"
            />
          </HStack>
        </HStack>
      </Box>

      {/* Spacer to push content below fixed navbar */}
      <Box height={{ base: "60px", md: "70px" }} />

      {/* Mobile Menu Drawer */}
      <Modal isOpen={isMobileOpen} onClose={onMobileClose} size="full">
        <ModalOverlay />
        <ModalContent bg={bgColor} color={textColor}>
          <ModalHeader borderBottomWidth="1px">Menu</ModalHeader>
          <ModalCloseButton />
          <ModalBody p={6}>
            <VStack spacing={6} align="stretch">
              <BackToHome />
              <Box borderBottomWidth="1px" pb={4}>
                <Text fontWeight="bold" mb={2}>Projects</Text>
                <MenuOptions onOpen={onOpen} />
              </Box>
              <VStack align="stretch" spacing={4}>
                <Button w="full" justifyContent="flex-start" variant="ghost" onClick={() => { handleEmbeddedClick(); onMobileClose(); }}>Embedded</Button>
                <Button w="full" justifyContent="flex-start" variant="ghost" onClick={() => { handleSimulationClick(); onMobileClose(); }}>▶ Simulation</Button>
                <DefineProductOne />
              </VStack>
              {!isAuthenticated && (
                <Button colorScheme="blue" onClick={() => loginWithRedirect()}>Log In</Button>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>





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
                onKeyDown={(e) => e.stopPropagation()}
                onKeyUp={(e) => e.stopPropagation()}
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
              <VStack align="start">
                <Checkbox
                  isChecked={features.writeCode}
                  onChange={(e) => setFeatures({ ...features, writeCode: e.target.checked })}
                >
                  Write Code
                </Checkbox>
                <Checkbox
                  isChecked={features.flowChart}
                  onChange={(e) => setFeatures({ ...features, flowChart: e.target.checked })}
                >
                  FlowChartTest
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
