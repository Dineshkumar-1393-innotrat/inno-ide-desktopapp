import { Tabs, TabList, TabPanels, Tab, TabPanel, Box, Button, HStack, Text } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { LuFolder, LuSquareCheck, LuUser } from "react-icons/lu";
import SelectProduct from "./SelectProduct";
import { useEffect } from "react";
import EditorNavbar from "../EditorNavbar";
import { useNavigate } from "react-router-dom";


const VisualizeData = () => {
  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    const routes = {
      Simulation: "/simulation",
      Flowchart: "/FlowchartTest",
      "Block Diagram": "/BlockDiagram",
      "Block Programming": "/blockprogramming",
      "Code Editor": "/editor",
      MathCodeEditor: "/mathcodeeditor",
    };
    const next = routes[tab];
    if (next) {
      navigate(next);
    }
  };

  return (
    <>
      <EditorNavbar onTabChange={handleTabChange} />
      <Box
        style={{
          marginTop: "70px",
          minHeight: "calc(100vh - 70px)",
          padding: "20px",
        }}
      >
        <HStack justifyContent="space-between" mb={6}>
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            onClick={() => navigate(-1)}
            _hover={{
              bg: "whiteAlpha.200",
              transform: "translateX(-2px)",
              color: "blue.400"
            }}
            transition="all 0.2s"
            fontSize="sm"
            fontWeight="medium"
          >
            Back
          </Button>
          <Text fontSize="xl" fontWeight="bold" bgGradient="linear(to-r, blue.400, teal.400)" bgClip="text">
            Visualize Data
          </Text>
          <Box w="100px" /> {/* Spacer */}
        </HStack>

        <Tabs variant="enclosed-colored" colorScheme="blue" defaultIndex={0}>
          <TabList>
            <Tab _selected={{ color: "white", bg: "blue.500" }}>Virtual Device</Tab>
            {/* <Tab>Actual Device</Tab> */}
          </TabList>

          <TabPanels>
            <TabPanel>
              <SelectProduct />
            </TabPanel>
            {/* <TabPanel>Manage your projects</TabPanel> */}
            {/* <TabPanel>Manage your tasks for freelancers</TabPanel> */}
          </TabPanels>
        </Tabs>
      </Box>

    </>
  );
};

export default VisualizeData;
