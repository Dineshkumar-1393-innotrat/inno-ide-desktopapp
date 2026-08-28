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
import { useState, useRef, useEffect } from "react";
import EditProductDefinition from "./EditProductDefinition";
import { Tabs, TabList, TabPanels, Tab, TabPanel, Box } from "@chakra-ui/react";
import ViewProductDefinition from "./ViewProductDefinition";
import AddProductComponent from "./AddProductComponent";
import RemoveProductComponent from "./RemoveProductComponent";
import axios from "axios";
import { getUserInfo } from "../../../utilities";
import { baseURL } from "../../../utilities";

function ProductEditModal({
  productID,
  productName,
  fetchFileSystem,
  setIsProductDefined,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [userId, setUserId] = useState(null);
  const [removeRefreshKey, setRemoveRefreshKey] = useState(0);

  const btnRef = useRef(null);

  const handleRemoveAllComponent = async () => {
    // const storedValues = sessionStorage.getItem("productDefinition");
    // const productID = storedValues ? JSON.parse(storedValues).productID : null;

    if (!productID) {
      alert("No product selected. Please try again.");
      return;
    }

    try {
      await axios.delete(`${baseURL}/product/${productID}/definitionNew`);

      alert("All components removed successfully");
      
      if (setIsProductDefined) {
        setIsProductDefined(false);
      }
    } catch (error) {
      console.error("Error removing all components:", error);
      alert("Failed to remove all components. Please try again.");
    }
  };

  useEffect(() => {
    return () => {
      const userInfo = getUserInfo();
      if (userInfo && typeof fetchFileSystem === 'function') {
        fetchFileSystem(userInfo.userId);
      }
    };
  }, [fetchFileSystem]);

  return (
    <>
      <Button
        size="sm"
        colorScheme="teal"
        borderRadius="full"
        height="32px"
        px={6}
        ref={btnRef}
        onClick={onOpen}
        zIndex={999}
      >
        View Product
      </Button>

      <Modal
        onClose={onClose}
        finalFocusRef={btnRef}
        isOpen={isOpen}
        scrollBehavior={"inside"}
        size={"6xl"}
      >
        <ModalOverlay
          backdropFilter="blur(20px) saturate(180%)"
          bg="rgba(0,0,0,0.6)"
        />
        <ModalContent
          borderRadius="3xl"
          boxShadow="0 30px 60px -15px rgba(0,0,0,0.4)"
          overflow="hidden"
          bg="transparent"
          border="1px solid rgba(255,255,255,0.1)"
        >
          <ModalCloseButton
            zIndex={10}
            top={6}
            right={6}
            borderRadius="full"
            bg="whiteAlpha.200"
            color="white"
            backdropFilter="blur(10px)"
            _hover={{
              bg: "whiteAlpha.300",
              transform: "rotate(90deg)"
            }}
            transition="all 0.3s"
            size="lg"
          />
          <ModalBody p={0}>
            <Box
              bgGradient="linear(to-br, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
              position="relative"
              overflow="hidden"
            >
              {/* Decorative background elements */}
              <Box
                position="absolute"
                top="-50%"
                right="-10%"
                w="400px"
                h="400px"
                borderRadius="full"
                bgGradient="radial(circle, rgba(99,102,241,0.3), transparent)"
                filter="blur(60px)"
                pointerEvents="none"
              />
              <Box
                position="absolute"
                bottom="-30%"
                left="-5%"
                w="300px"
                h="300px"
                borderRadius="full"
                bgGradient="radial(circle, rgba(168,85,247,0.3), transparent)"
                filter="blur(60px)"
                pointerEvents="none"
              />

              <Box px={10} py={8} position="relative" zIndex={1}>
                <Tabs
                  variant="unstyled"
                  defaultIndex={0}
                  onChange={(index) => {
                    // Re-fetch components list every time Remove Component tab is activated
                    if (index === 2) {
                      setRemoveRefreshKey((k) => k + 1);
                    }
                  }}
                >
                  <TabList
                    gap={3}
                    borderBottom="none"
                    mb={6}
                    flexWrap="wrap"
                  >
                    <Tab
                      color="whiteAlpha.600"
                      fontWeight="700"
                      fontSize="sm"
                      letterSpacing="wide"
                      px={8}
                      py={4}
                      borderRadius="2xl"
                      border="1px solid"
                      borderColor="whiteAlpha.100"
                      bg="whiteAlpha.50"
                      backdropFilter="blur(10px)"
                      _selected={{
                        color: "white",
                        bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        borderColor: "transparent",
                        boxShadow: "0 8px 20px -4px rgba(102,126,234,0.5)",
                        transform: "translateY(-2px)",
                      }}
                      _hover={{
                        borderColor: "whiteAlpha.300",
                        bg: "whiteAlpha.100",
                      }}
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    >
                      VIEW PRODUCT
                    </Tab>
                    <Tab
                      color="whiteAlpha.600"
                      fontWeight="700"
                      fontSize="sm"
                      letterSpacing="wide"
                      px={8}
                      py={4}
                      borderRadius="2xl"
                      border="1px solid"
                      borderColor="whiteAlpha.100"
                      bg="whiteAlpha.50"
                      backdropFilter="blur(10px)"
                      _selected={{
                        color: "white",
                        bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        borderColor: "transparent",
                        boxShadow: "0 8px 20px -4px rgba(102,126,234,0.5)",
                        transform: "translateY(-2px)",
                      }}
                      _hover={{
                        borderColor: "whiteAlpha.300",
                        bg: "whiteAlpha.100",
                      }}
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    >
                      ADD COMPONENT
                    </Tab>
                    <Tab
                      color="whiteAlpha.600"
                      fontWeight="700"
                      fontSize="sm"
                      letterSpacing="wide"
                      px={8}
                      py={4}
                      borderRadius="2xl"
                      border="1px solid"
                      borderColor="whiteAlpha.100"
                      bg="whiteAlpha.50"
                      backdropFilter="blur(10px)"
                      _selected={{
                        color: "white",
                        bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        borderColor: "transparent",
                        boxShadow: "0 8px 20px -4px rgba(102,126,234,0.5)",
                        transform: "translateY(-2px)",
                      }}
                      _hover={{
                        borderColor: "whiteAlpha.300",
                        bg: "whiteAlpha.100",
                      }}
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    >
                      REMOVE COMPONENT
                    </Tab>
                    <Tab
                      color="whiteAlpha.600"
                      fontWeight="700"
                      fontSize="sm"
                      letterSpacing="wide"
                      px={8}
                      py={4}
                      borderRadius="2xl"
                      border="1px solid"
                      borderColor="whiteAlpha.100"
                      bg="whiteAlpha.50"
                      backdropFilter="blur(10px)"
                      _selected={{
                        color: "white",
                        bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        borderColor: "transparent",
                        boxShadow: "0 8px 20px -4px rgba(102,126,234,0.5)",
                        transform: "translateY(-2px)",
                      }}
                      _hover={{
                        borderColor: "whiteAlpha.300",
                        bg: "whiteAlpha.100",
                      }}
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    >
                      REMOVE ALL
                    </Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel
                      p={0}
                    >
                      <Box
                        bg="rgba(255,255,255,0.98)"
                        borderRadius="2xl"
                        p={10}
                        minH="550px"
                        maxH="600px"
                        overflowY="auto"
                        boxShadow="0 20px 40px -10px rgba(0,0,0,0.3)"
                        border="1px solid"
                        borderColor="whiteAlpha.300"
                        css={{
                          '&::-webkit-scrollbar': {
                            width: '10px',
                          },
                          '&::-webkit-scrollbar-track': {
                            background: 'rgba(0,0,0,0.05)',
                            borderRadius: '10px',
                          },
                          '&::-webkit-scrollbar-thumb': {
                            background: 'linear-gradient(180deg, #667eea, #764ba2)',
                            borderRadius: '10px',
                          },
                          '&::-webkit-scrollbar-thumb:hover': {
                            background: 'linear-gradient(180deg, #764ba2, #667eea)',
                          },
                        }}
                      >
                        <ViewProductDefinition
                          productID={productID}
                          productName={productName}
                        />
                      </Box>
                    </TabPanel>
                    <TabPanel
                      p={0}
                    >
                      <Box
                        bg="rgba(255,255,255,0.98)"
                        borderRadius="2xl"
                        p={10}
                        minH="550px"
                        maxH="600px"
                        overflowY="auto"
                        boxShadow="0 20px 40px -10px rgba(0,0,0,0.3)"
                        border="1px solid"
                        borderColor="whiteAlpha.300"
                        css={{
                          '&::-webkit-scrollbar': {
                            width: '10px',
                          },
                          '&::-webkit-scrollbar-track': {
                            background: 'rgba(0,0,0,0.05)',
                            borderRadius: '10px',
                          },
                          '&::-webkit-scrollbar-thumb': {
                            background: 'linear-gradient(180deg, #667eea, #764ba2)',
                            borderRadius: '10px',
                          },
                          '&::-webkit-scrollbar-thumb:hover': {
                            background: 'linear-gradient(180deg, #764ba2, #667eea)',
                          },
                        }}
                      >
                        <AddProductComponent
                          setIsProductDefined={setIsProductDefined}
                          productID={productID}
                          productName={productName}
                        />
                      </Box>
                    </TabPanel>
                    <TabPanel p={0}>
                      <Box
                        bg="rgba(255,255,255,0.98)"
                        borderRadius="2xl"
                        p={10}
                        minH="550px"
                        boxShadow="0 20px 40px -10px rgba(0,0,0,0.3)"
                        border="1px solid"
                        borderColor="whiteAlpha.300"
                      >
                        <RemoveProductComponent
                          setIsProductDefined={setIsProductDefined}
                          productID={productID}
                          productName={productName}
                          refreshKey={removeRefreshKey}
                        />
                      </Box>
                    </TabPanel>
                    <TabPanel p={0}>
                      <Box
                        bg="rgba(255,255,255,0.98)"
                        borderRadius="2xl"
                        p={10}
                        minH="550px"
                        boxShadow="0 20px 40px -10px rgba(0,0,0,0.3)"
                        border="1px solid"
                        borderColor="whiteAlpha.300"
                      >
                        <Center h="100%">
                          <Button
                            onClick={() => handleRemoveAllComponent()}
                            size="xl"
                            px={12}
                            py={8}
                            borderRadius="2xl"
                            bgGradient="linear(to-r, red.500, pink.500)"
                            color="white"
                            fontWeight="700"
                            fontSize="lg"
                            boxShadow="0 10px 30px -5px rgba(239,68,68,0.4)"
                            _hover={{
                              transform: "translateY(-4px) scale(1.02)",
                              boxShadow: "0 15px 40px -5px rgba(239,68,68,0.6)",
                              bgGradient: "linear(to-r, red.600, pink.600)",
                            }}
                            _active={{
                              transform: "translateY(-2px) scale(0.98)",
                            }}
                            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                          >
                            🗑️ Remove All Components
                          </Button>
                        </Center>
                      </Box>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
            </Box>
          </ModalBody>
          <ModalFooter
            bgGradient="linear(to-r, #1a1a2e, #16213e)"
            borderTop="1px solid"
            borderColor="whiteAlpha.200"
            py={6}
          >
            <Button
              onClick={onClose}
              borderRadius="xl"
              px={8}
              py={6}
              bg="whiteAlpha.200"
              color="white"
              fontWeight="600"
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor="whiteAlpha.300"
              _hover={{
                bg: "whiteAlpha.300",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 20px -4px rgba(255,255,255,0.2)",
              }}
              transition="all 0.3s"
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default ProductEditModal;
