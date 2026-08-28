// import React, { useState } from "react";
import { API } from '@/config';
// import {
//   Box,
//   Button,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalCloseButton,
//   ModalBody,
//   ModalFooter,
//   useDisclosure,
//   Text,
//   Input,
//   HStack,
//   VStack,
//   FormControl,
//   FormLabel,
// } from "@chakra-ui/react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// const DeviceDefinitionPopup = () => {
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const [productDetails, setProductDetails] = useState(null);
//   const [productID, setProductID] = useState("");
//   const [updateData, setUpdateData] = useState({});
//   const [showProductIDInput, setShowProductIDInput] = useState(false);
//   const navigate = useNavigate();

//   // Fetch product definition
//   const getProductDefinition = async () => {
//     try {
//       const response = await axios.get(`${API.MAIN}/product/:productID/definitionNewNew`);
//       setProductDetails(response.data);
//       onOpen();
//     } catch (error) {
//       console.error("Error fetching product definition:", error);
//       alert("Failed to fetch product definition. Please check the product ID.");
//     }
//   };

//   // Update product components
//   const handleUpdateComponents = async () => {
//     try {
//       await axios.patch(`${API.MAIN}/product/${productID}/components`, {
//         updates: updateData,
//       });
//       alert("Components updated successfully!");
//       navigate("/defineproduct"); // Updated navigation path
//     } catch (error) {
//       console.error("Error updating components:", error);
//       alert("Failed to update components. Please try again.");
//     }
//   };

//   // Delete product definition
//   const handleDeleteDefinition = async () => {
//     try {
//       await axios.delete(`${API.MAIN}/product/:productID/definitionNewNew`);
//       alert("Product definition deleted successfully!");
//       setProductDetails(null);
//       onClose();
//     } catch (error) {
//       console.error("Error deleting product definition:", error);
//       alert("Failed to delete product definition. Please try again.");
//     }
//   };

//   return (
//     <Box p={0}>
//       {!showProductIDInput && (
//         <Button colorScheme="teal" size="sm"  onClick={() => setShowProductIDInput(true)}>
//         <h1> Definition of Device</h1> 
//         </Button>
//       )}

//       {showProductIDInput && (
//         <VStack spacing={4} mt={4}>
//           <FormControl>
//             <FormLabel>Enter Product ID</FormLabel>
//             <Input
//               placeholder="Product ID"
//               value={productID}
//               onChange={(e) => setProductID(e.target.value)}
//             />
//           </FormControl>
//           <Button colorScheme="teal" onClick={getProductDefinition}>
//             Submit Product ID
//           </Button>
//         </VStack>
//       )}

//       <Modal isOpen={isOpen} onClose={onClose} size="xl">
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>Product Definition</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             {productDetails ? (
//          <Box mt={4}>
//   <Text fontSize="lg" mb={2}>Components:</Text>
//   {productDetails?.components &&
//     Object.entries(productDetails.components).map(([componentName, componentData]) => (
//       <Box key={componentName} mb={2} p={2} border="1px solid #ddd" borderRadius="md">
//         <Text><strong>Component:</strong> {componentName}</Text>
//         {Object.entries(componentData).map(([key, value]) => (
//           <Text key={key}>
//             <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
//              {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
//           </Text>
//         ))}
//       </Box>
//     ))
//   }

//             <Box mt={4}>
//               <Text><strong>Device ID:</strong> {productDetails?.productID || "N/A"}</Text>
//               <Text><strong>Device Name:</strong> {productDetails?.name || "N/A"}</Text>
//             </Box>
//           </Box>

//             ) : (
//               <Text>No product details available.</Text>
//             )}
//           </ModalBody>
//           <ModalFooter>
//             <Button colorScheme="blue" mr={3} onClick={handleUpdateComponents}>
//               Update the Details
//             </Button>
//             <Button colorScheme="red" onClick={handleDeleteDefinition}>
//               Delete the Component
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </Box>
//   );
// };

// export default DeviceDefinitionPopup;




// import React, { useState } from "react";
// import {
//   Box,
//   Button,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalCloseButton,
//   ModalBody,
//   ModalFooter,
//   useDisclosure,
//   Text,
//   Input,
//   VStack,
//   FormControl,
//   FormLabel,
//   Divider,
// } from "@chakra-ui/react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// const DeviceDefinitionPopup = () => {
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const [productDetails, setProductDetails] = useState(null);
//   const [productID, setProductID] = useState("");
//   const [updateData, setUpdateData] = useState({});
//   const [showProductIDInput, setShowProductIDInput] = useState(false);
//   const navigate = useNavigate();

//   // Fetch product definition
//   const getProductDefinition = async () => {
//     try {
//       const response = await axios.get(`${API.MAIN}/product/:productID/definitionNewNew`);
//       setProductDetails(response.data);
//       onOpen();
//     } catch (error) {
//       console.error("Error fetching product definition:", error);
//       alert("Failed to fetch product definition. Please check the product ID.");
//     }
//   };

//   // Update product components
//   const handleUpdateComponents = async () => {
//     try {
//       await axios.patch(`${API.MAIN}/product/${productID}/components`, {
//         updates: updateData,
//       });
//       alert("Components updated successfully!");
//       navigate("/defineproductone");
//     } catch (error) {
//       console.error("Error updating components:", error);
//       alert("Failed to update components. Please try again.");
//     }
//   };

//   // Delete product definition
//   const handleDeleteDefinition = async () => {
//     try {
//       await axios.delete(`${API.MAIN}/product/:productID/definitionNewNew`);
//       alert("Product definition deleted successfully!");
//       setProductDetails(null);
//       onClose();
//     } catch (error) {
//       console.error("Error deleting product definition:", error);
//       alert("Failed to delete product definition. Please try again.");
//     }
//   };

//   return (
//     <Box p={4}>
//       {!showProductIDInput && (
//         <Button colorScheme="teal" size="md" onClick={() => setShowProductIDInput(true)}>
//           Definition of Device
//         </Button>
//       )}

//       {showProductIDInput && (
//         <VStack spacing={4} mt={4} align="start">
//           <FormControl>
//             <FormLabel>Enter Product ID</FormLabel>
//             <Input
//               placeholder="Product ID"
//               value={productID}
//               onChange={(e) => setProductID(e.target.value)}
//             />
//           </FormControl>
//           <Button colorScheme="teal" onClick={getProductDefinition}>
//             Submit Product ID
//           </Button>
//         </VStack>
//       )}

//       <Modal isOpen={isOpen} onClose={onClose} size="xl">
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>Product Definition</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             {productDetails ? (
//               <VStack spacing={4} align="stretch">
//                 {productDetails?.components &&
//                   Object.entries(productDetails.components).map(([componentName, componentData]) => (
//                     <Box key={componentName} p={4} borderWidth="1px" borderRadius="md" shadow="sm" bg="gray.50">
//                       <Text fontSize="lg" fontWeight="bold" color="teal.600" mb={2}>{componentName}</Text>
//                       <Divider mb={2} />
//                       <VStack align="start" spacing={1}>
//                         {Object.entries(componentData).map(([key, value]) => (
//                           <Text key={key} fontSize="sm">
//                             <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
//                           </Text>
//                         ))}
//                       </VStack>
//                     </Box>
//                   ))}
//                 <Box p={4} borderWidth="1px" borderRadius="md" shadow="sm" bg="gray.100">
//                   <Text><strong>Device ID:</strong> {productDetails?.productID || "N/A"}</Text>
//                   <Text><strong>Device Name:</strong> {productDetails?.name || "N/A"}</Text>
//                 </Box>
//               </VStack>
//             ) : (
//               <Text>No product details available.</Text>
//             )}
//           </ModalBody>
//           <ModalFooter>
//             <Button colorScheme="blue" mr={3} onClick={handleUpdateComponents}>
//               Update Details
//             </Button>
//             <Button colorScheme="red" onClick={handleDeleteDefinition}>
//               Delete Definition
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </Box>
//   );
// };

// export default DeviceDefinitionPopup;





// This code is when product ID and Product Name is automatically filled 

// import { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   Box,
//   Button,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalCloseButton,
//   ModalBody,
//   ModalFooter,
//   useDisclosure,  // ✅ Add this import
//   Text,
//   Input,
//   VStack,
//   FormControl,
//   FormLabel,
//   Divider,
//   Card,
//   CardBody,
//   CardHeader,
//   Heading,
// } from "@chakra-ui/react";
// import axios from "axios";

// const BlockDiagramOne = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   // Get productID and productName from state
//   const [productID, setProductID] = useState(location.state?.productID || "");
//   const [productName, setProductName] = useState(location.state?.productName || "");

//   const [updateData, setUpdateData] = useState({});
//   const [productDetails, setProductDetails] = useState(null);
//   const [showProductIDInput, setShowProductIDInput] = useState(false);
//   const { isOpen, onOpen, onClose } = useDisclosure();

//   // Fetch product definition
//   const getProductDefinition = async () => {
//     try {
//       const response = await axios.get(`${API.MAIN}/product/:productID/definitionNewNew`);
//       setProductDetails(response.data);
//       onOpen();
//     } catch (error) {
//       console.error("Error fetching product definition:", error);
//       alert("Failed to fetch product definition. Please check the product ID.");
//     }
//   };

//   return (
//     <Box p={1}>
//       {!showProductIDInput && (
//         <Button colorScheme="teal" size="sm" onClick={() => setShowProductIDInput(true)}>
//           View Define Product
//         </Button>
//       )}

//       {showProductIDInput && (
//         <Card maxW="md" mx="auto" mt={4} bg="white" boxShadow="lg" borderRadius="md">
//           <CardHeader>
//             <Heading size="md">Enter Product ID</Heading>
//           </CardHeader>
//           <CardBody>
//             <VStack spacing={4}>
//               <FormControl>
//                 <FormLabel>Product ID</FormLabel>
//                 <Input
//                   placeholder="Enter Product ID"
//                   value={productID}
//                   onChange={(e) => setProductID(e.target.value)}
//                   bg="white"
//                   borderColor="gray.300"
//                   isReadOnly // Make it read-only as we are passing it from DefineProductTwo
//                 />
//               </FormControl>
//               <FormControl>
//                 <FormLabel>Product Name</FormLabel>
//                 <Input
//                   value={productName}
//                   bg="gray.100"
//                   isReadOnly
//                 />
//               </FormControl>
//               <Button colorScheme="teal" width="full" onClick={getProductDefinition}>
//                 Submit Product ID
//               </Button>
//             </VStack>
//           </CardBody>
//         </Card>
//       )}

//       {/* Rest of your modal and UI */}
//     </Box>
//   );
// };

// export default BlockDiagramOne;






// This code is when product ID and Product Name is automatically filled with details modal 

// import { useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   Box,
//   Button,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalCloseButton,
//   ModalBody,
//   ModalFooter,
//   useDisclosure,
//   Text,
//   Input,
//   VStack,
//   FormControl,
//   FormLabel,
//   Card,
//   CardBody,
//   CardHeader,
//   Heading,
// } from "@chakra-ui/react";
// import axios from "axios";

// const BlockDiagramOne = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   // Extracting product details from location state
//   const [productID, setProductID] = useState(location.state?.productID || "");
//   const [productName, setProductName] = useState(location.state?.productName || "");

//   const [productDetails, setProductDetails] = useState(null);
//   const [showProductIDInput, setShowProductIDInput] = useState(false);
//   const { isOpen, onOpen, onClose } = useDisclosure();

//   // Fetch product definition
//   const getProductDefinition = async () => {
//     if (!productID) {
//       alert("Please enter a valid Product ID");
//       return;
//     }

//     try {
//       const response = await axios.get(`${API.MAIN}/product/:productID/definitionNewNew`);
//       setProductDetails(response.data);
//       onOpen();
//     } catch (error) {
//       console.error("Error fetching product definition:", error);
//       alert("Failed to fetch product definition. Please check the product ID.");
//     }
//   };

//   return (
//     <Box p={4}>
//       {!showProductIDInput && (
//         <Button colorScheme="teal" size="sm" onClick={() => setShowProductIDInput(true)}>
//           View Define Product
//         </Button>
//       )}

//       {showProductIDInput && (
//         <Card maxW="md" mx="auto" mt={4} bg="white" boxShadow="lg" borderRadius="md">
//           <CardHeader>
//             <Heading size="md">Enter Product ID</Heading>
//           </CardHeader>
//           <CardBody>
//             <VStack spacing={4}>
//               <FormControl>
//                 <FormLabel>Product ID</FormLabel>
//                 <Input
//                   placeholder="Enter Product ID"
//                   value={productID}
//                   onChange={(e) => setProductID(e.target.value)}
//                   bg="white"
//                   borderColor="gray.300"
//                   isReadOnly
//                 />
//               </FormControl>
//               <FormControl>
//                 <FormLabel>Product Name</FormLabel>
//                 <Input value={productName} bg="gray.100" isReadOnly />
//               </FormControl>
//               <Button colorScheme="teal" width="full" onClick={getProductDefinition}>
//                 Submit Product ID
//               </Button>
//             </VStack>
//           </CardBody>
//         </Card>
//       )}

//       {/* Modal to display product details */}
//       <Modal isOpen={isOpen} onClose={onClose} size="lg">
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>Product Definition</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             {productDetails ? (
//               <Box>
//                 <Text fontWeight="bold">Product ID: {productDetails.productID}</Text>
//                 <Text fontWeight="bold">Name: {productDetails.name}</Text>
//                 <Heading size="sm" mt={4}>Components:</Heading>
//                 <Box mt={2}>
//                   {Object.entries(productDetails.components).map(([key, value]) => (
//                     <Box key={key} p={2} border="1px solid #ccc" borderRadius="md" mt={2}>
//                       <Text fontWeight="bold">{key}</Text>
//                       <Text>Type: {value.type}</Text>
//                       {value.unit && <Text>Unit: {value.unit}</Text>}
//                       {value.range && (
//                         <Text>
//                           Range: {value.range.min} - {value.range.max}
//                         </Text>
//                       )}
//                       {value.state && (
//                         <Text>State: {value.state.join(", ")}</Text>
//                       )}
//                     </Box>
//                   ))}
//                 </Box>
//               </Box>
//             ) : (
//               <Text>No product details available.</Text>
//             )}
//           </ModalBody>
//           <ModalFooter>
//             <Button colorScheme="blue" onClick={onClose}>
//               Close
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </Box>
//   );
// };

// export default BlockDiagramOne;




// import { useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   Box,
//   Button,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalCloseButton,
//   ModalBody,
//   ModalFooter,
//   useDisclosure,
//   Text,
//   Input,
//   VStack,
//   FormControl,
//   FormLabel,
//   Divider,
//   Card,
//   CardBody,
//   CardHeader,
//   Heading,
// } from "@chakra-ui/react";
// import axios from "axios";

// const BlockDiagramOne = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   // Extracting product details from location state
//   const [productID, setProductID] = useState(location.state?.productID || "");
//   const [productName, setProductName] = useState(location.state?.productName || "");
//   const [productDetails, setProductDetails] = useState(null);
//   const [updateData, setUpdateData] = useState({});
//   const [showProductIDInput, setShowProductIDInput] = useState(false);
//   const { isOpen, onOpen, onClose } = useDisclosure();

//   // Fetch product definition
//   const getProductDefinition = async () => {
//     if (!productID) {
//       alert("Please enter a valid Product ID");
//       return;
//     }

//     try {
//       const response = await axios.get(`${API.MAIN}/product/:productID/definitionNewNew`);
//       setProductDetails(response.data);
//       onOpen();
//     } catch (error) {
//       console.error("Error fetching product definition:", error);
//       alert("Failed to fetch product definition. Please check the product ID.");
//     }
//   };

//   // Update product details
//   const handleUpdateDetails = async () => {
//     try {
//       await axios.patch(`${API.MAIN}/product/${productID}/components`, {
//         updates: updateData,
//       });
//       alert("Product details updated successfully!");
//       navigate("/createproductdefination");
//     } catch (error) {
//       console.error("Error updating product details:", error);
//       alert("Failed to update product details. Please try again.");
//     }
//   };

//   // Delete product definition
//   const handleDeleteDefinition = async () => {
//     try {
//       await axios.delete(`${API.MAIN}/product/:productID/definitionNewNew`);
//       alert("Product definition deleted successfully!");
//       setProductDetails(null);
//       onClose();
//     } catch (error) {
//       console.error("Error deleting product definition:", error);
//       alert("Failed to delete product definition. Please try again.");
//     }
//   };

//   return (
//     <Box p={1}>
//       {!showProductIDInput && (
//         <Button colorScheme="teal" size="sm" onClick={() => setShowProductIDInput(true)}>
//           View Define Product
//         </Button>
//       )}

//       {showProductIDInput && (
//         <Card maxW="md" mx="auto" mt={4} bg="white" boxShadow="lg" borderRadius="md">
//           <CardHeader>
//             <Heading size="md">Enter Product ID</Heading>
//           </CardHeader>
//           <CardBody>
//             <VStack spacing={4}>
//               <FormControl>
//                 <FormLabel>Product ID</FormLabel>
//                 <Input
//                   placeholder="Enter Product ID"
//                   value={productID}
//                   onChange={(e) => setProductID(e.target.value)}
//                   bg="white"
//                   borderColor="gray.300"
//                   isReadOnly
//                 />
//               </FormControl>
//               <FormControl>
//                 <FormLabel>Product Name</FormLabel>
//                 <Input value={productName} bg="white" isReadOnly />
//               </FormControl>
//               <Button colorScheme="teal" width="full" onClick={getProductDefinition}>
//                 Submit Product ID
//               </Button>
//             </VStack>
//           </CardBody>
//         </Card>
//       )}

//       {/* Modal to display product details */}
//       <Modal isOpen={isOpen} onClose={onClose} size="xl">
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>Product Definition</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             {productDetails ? (
//               <VStack spacing={4} align="stretch">
//                 <Box p={4} borderWidth="1px" borderRadius="md" shadow="sm" bg="gray.100">
//                   <Text>
//                     <strong>Product ID:</strong> {productDetails?.productID || "N/A"}
//                   </Text>
//                   <Text>
//                     <strong>Product Name:</strong> {productDetails?.name || "N/A"}
//                   </Text>
//                 </Box>

//                 {productDetails?.components &&
//                   Object.entries(productDetails.components).map(([componentName, componentData]) => (
//                     <Box
//                       key={componentName}
//                       p={4}
//                       borderWidth="1px"
//                       borderRadius="md"
//                       shadow="sm"
//                       bg="gray.50"
//                     >
//                       <Text fontSize="lg" fontWeight="bold" color="teal.600" mb={2}>
//                         {componentName}
//                       </Text>
//                       <Divider mb={2} />
//                       <VStack align="start" spacing={1}>
//                         {Object.entries(componentData).map(([key, value]) => (
//                           <Text key={key} fontSize="sm">
//                             <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>{" "}
//                             {typeof value === "object"
//                               ? JSON.stringify(value, null, 2)
//                               : value}
//                           </Text>
//                         ))}
//                       </VStack>
//                     </Box>
//                   ))}
//               </VStack>
//             ) : (
//               <Text>No product details available.</Text>
//             )}
//           </ModalBody>
//           <ModalFooter>
//             <Button colorScheme="blue" mr={3} onClick={handleUpdateDetails}>
//               Update Details
//             </Button>
//             <Button colorScheme="red" onClick={handleDeleteDefinition}>
//               Delete Definition
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </Box>
//   );
// };

// export default BlockDiagramOne;






// import { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   Box,
//   Button,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalCloseButton,
//   ModalBody,
//   ModalFooter,
//   useDisclosure,
//   Text,
//   Input,
//   VStack,
//   FormControl,
//   FormLabel,
//   Divider,
//   Card,
//   CardBody,
//   CardHeader,
//   Heading,
//   useToast
// } from "@chakra-ui/react";
// import axios from "axios";

// const BlockDiagramOne = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const toast = useToast();

//   // Initialize state with session storage values
//   const [productID, setProductID] = useState(() => sessionStorage.getItem("productID") || "");
//   const [productName, setProductName] = useState(() => sessionStorage.getItem("deviceName") || "");
//   const [productDetails, setProductDetails] = useState(null);
//   const [updateData, setUpdateData] = useState({});
//   const [showProductIDInput, setShowProductIDInput] = useState(false);
//   const { isOpen, onOpen, onClose } = useDisclosure();

//   // Effect to update state when session storage changes
//   useEffect(() => {
//     const storedProductID = sessionStorage.getItem("productID");
//     const storedDeviceName = sessionStorage.getItem("deviceName");

//     if (storedProductID) {
//       setProductID(storedProductID);
//     }
//     if (storedDeviceName) {
//       setProductName(storedDeviceName);
//     }
//   }, []);

//   // Fetch product definition
//   const getProductDefinition = async () => {
//     if (!productID) {
//       toast({
//         title: "Error",
//         description: "Please enter a valid Product ID",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }

//     try {
//       const response = await axios.get(`${API.MAIN}/product/:productID/definitionNewNew`);
//       setProductDetails(response.data);
//       onOpen();
//     } catch (error) {
//       console.error("Error fetching product definition:", error);
//       toast({
//         title: "Error",
//         description: "Failed to fetch product definition. Please check the product ID.",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//     }
//   };

//   // Update product details
//   const handleUpdateDetails = async () => {
//     try {
//       await axios.patch(`${API.MAIN}/product/${productID}/components`, {
//         updates: updateData,
//       });
//       toast({
//         title: "Success",
//         description: "Product details updated successfully!",
//         status: "success",
//         duration: 3000,
//         isClosable: true,
//       });
//       navigate("/createproductdefination");
//     } catch (error) {
//       console.error("Error updating product details:", error);
//       toast({
//         title: "Error",
//         description: "Failed to update product details. Please try again.",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//     }
//   };

//   // Delete product definition
//   const handleDeleteDefinition = async () => {
//     try {
//       await axios.delete(`${API.MAIN}/product/:productID/definitionNewNew`);
//       toast({
//         title: "Success",
//         description: "Product definition deleted successfully!",
//         status: "success",
//         duration: 3000,
//         isClosable: true,
//       });
//       setProductDetails(null);
//       onClose();
//     } catch (error) {
//       console.error("Error deleting product definition:", error);
//       toast({
//         title: "Error",
//         description: "Failed to delete product definition. Please try again.",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//     }
//   };

//   return (
//     <Box p={1}  minH="100vh">
//       {!showProductIDInput && (
//         <Button 
//           colorScheme="teal" 
//           size="sm" 
//           onClick={() => setShowProductIDInput(true)}
//           boxShadow="sm"
//           _hover={{ boxShadow: "sm" }}
//         >
//           View Define Product
//         </Button>


//       )}

//       {showProductIDInput && (
//         <Card maxW="md" mx="auto" mt={4} bg="white" boxShadow="lg" borderRadius="md">
//           <CardHeader bg="teal.50" borderTopRadius="md">
//             <Heading size="md" color="teal.700">Product Details</Heading>
//           </CardHeader>
//           <CardBody>
//             <VStack spacing={4}>
//               <FormControl>
//                 <FormLabel color="teal.700">Product ID</FormLabel>
//                 <Input
//                   value={productID}
//                   bg="white"
//                   borderColor="teal.200"
//                   _hover={{ borderColor: "teal.300" }}
//                   isReadOnly
//                 />
//               </FormControl>
//               <FormControl>
//                 <FormLabel color="teal.700">Product Name</FormLabel>
//                 <Input
//                   value={productName}
//                   bg="white"
//                   borderColor="teal.200"
//                   _hover={{ borderColor: "teal.300" }}
//                   isReadOnly
//                 />
//               </FormControl>
//               <Button 
//                 colorScheme="teal" 
//                 width="full" 
//                 onClick={getProductDefinition}
//                 _hover={{ transform: "translateY(-1px)" }}
//                 transition="all 0.2s"
//               >
//                 View Product Definition
//               </Button>
//             </VStack>
//           </CardBody>
//         </Card>
//       )}

//       <Modal isOpen={isOpen} onClose={onClose} size="xl">
//         <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
//         <ModalContent>
//           <ModalHeader bg="teal.50" borderTopRadius="md">Product Definition</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             {productDetails ? (
//               <VStack spacing={4} align="stretch">
//                 <Box p={4} borderWidth="1px" borderRadius="md" shadow="sm" bg="gray.50">
//                   <Text>
//                     <strong>Product ID:</strong> {productDetails?.productID || "N/A"}
//                   </Text>
//                   <Text>
//                     <strong>Product Name:</strong> {productName || "N/A"}
//                   </Text>
//                 </Box>

//                 {productDetails?.components &&
//                   Object.entries(productDetails.components).map(([componentName, componentData]) => (
//                     <Box
//                       key={componentName}
//                       p={4}
//                       borderWidth="1px"
//                       borderRadius="md"
//                       shadow="sm"
//                       bg="gray.50"
//                       _hover={{ shadow: "md" }}
//                       transition="all 0.2s"
//                     >
//                       <Text fontSize="lg" fontWeight="bold" color="teal.600" mb={2}>
//                         {componentName}
//                       </Text>
//                       <Divider mb={2} />
//                       <VStack align="start" spacing={1}>
//                         {Object.entries(componentData).map(([key, value]) => (
//                           <Text key={key} fontSize="sm">
//                             <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>{" "}
//                             {typeof value === "object"
//                               ? JSON.stringify(value, null, 2)
//                               : value}
//                           </Text>
//                         ))}
//                       </VStack>
//                     </Box>
//                   ))}
//               </VStack>
//             ) : (
//               <Text>No product details available.</Text>
//             )}
//           </ModalBody>
//           <ModalFooter>
//             <Button 
//               colorScheme="blue" 
//               mr={3} 
//               onClick={handleUpdateDetails}
//               _hover={{ transform: "translateY(-1px)" }}
//             >
//               Update Details
//             </Button>
//             <Button 
//               colorScheme="red" 
//               onClick={handleDeleteDefinition}
//               _hover={{ transform: "translateY(-1px)" }}
//             >
//               Delete Definition
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </Box>
//   );
// };

// export default BlockDiagramOne;




// Jeeva code 

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Text,
  Input,
  VStack,
  FormControl,
  FormLabel,
  Divider,
  Card,
  CardBody,
  CardHeader,
  Heading,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import ProductEditModal from "./Product/ProductEdit/ProductEditModal";

const BlockDiagramOne = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  // Initialize state with session storage values
  const [productID, setProductID] = useState(
    () => sessionStorage.getItem("productID") || ""
  );
  const [productName, setProductName] = useState(
    () => sessionStorage.getItem("deviceName") || ""
  );
  const [productDetails, setProductDetails] = useState(null);
  const [updateData, setUpdateData] = useState({});
  const [showProductIDInput, setShowProductIDInput] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Effect to update state when session storage changes
  useEffect(() => {
    const storedProductID = sessionStorage.getItem("productID");
    const storedDeviceName = sessionStorage.getItem("deviceName");

    if (storedProductID) {
      setProductID(storedProductID);
    }
    if (storedDeviceName) {
      setProductName(storedDeviceName);
    }
  }, []);

  // Fetch product definition
  const getProductDefinition = async () => {
    if (!productID) {
      toast({
        title: "Error",
        description: "Please enter a valid Product ID",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axios.get(
        `${API.MAIN}/product/:productID/definitionNewNew`
      );
      setProductDetails(response.data);
      onOpen();
    } catch (error) {
      console.error("Error fetching product definition:", error);
      toast({
        title: "Error",
        description:
          "Failed to fetch product definition. Please check the product ID.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Update product details
  const handleUpdateDetails = async () => {
    try {
      await axios.patch(
        `${API.MAIN}/product/${productID}/components`,
        {
          updates: updateData,
        }
      );
      toast({
        title: "Success",
        description: "Product details updated successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/createproductdefination");
    } catch (error) {
      console.error("Error updating product details:", error);
      toast({
        title: "Error",
        description: "Failed to update product details. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Delete product definition
  const handleDeleteDefinition = async () => {
    try {
      await axios.delete(
        `${API.MAIN}/product/:productID/definitionNewNew`
      );
      toast({
        title: "Success",
        description: "Product definition deleted successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setProductDetails(null);
      onClose();
    } catch (error) {
      console.error("Error deleting product definition:", error);
      toast({
        title: "Error",
        description: "Failed to delete product definition. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <ProductEditModal />
    // <Box p={1}  minH="100vh">
    //   {!showProductIDInput && (
    //     <Button
    //       colorScheme="teal"
    //       size="md"
    //       onClick={() => setShowProductIDInput(true)}
    //       boxShadow="sm"
    //       _hover={{ boxShadow: "md" }}
    //     >
    //       View Define Product
    //     </Button>

    //   )}

    //   {showProductIDInput && (
    //     <Card maxW="md" mx="auto" mt={4} bg="white" boxShadow="lg" borderRadius="md">
    //       <CardHeader bg="teal.50" borderTopRadius="md">
    //         <Heading size="md" color="teal.700">Product Details</Heading>
    //       </CardHeader>
    //       <CardBody>
    //         <VStack spacing={4}>
    //           <FormControl>
    //             <FormLabel color="teal.700">Product ID</FormLabel>
    //             <Input
    //               value={productID}
    //               bg="white"
    //               borderColor="teal.200"
    //               _hover={{ borderColor: "teal.300" }}
    //               isReadOnly
    //             />
    //           </FormControl>
    //           <FormControl>
    //             <FormLabel color="teal.700">Product Name</FormLabel>
    //             <Input
    //               value={productName}
    //               bg="white"
    //               borderColor="teal.200"
    //               _hover={{ borderColor: "teal.300" }}
    //               isReadOnly
    //             />
    //           </FormControl>
    //           <Button
    //             colorScheme="teal"
    //             width="full"
    //             onClick={getProductDefinition}
    //             _hover={{ transform: "translateY(-1px)" }}
    //             transition="all 0.2s"
    //           >
    //             View Product Definition
    //           </Button>
    //         </VStack>
    //       </CardBody>
    //     </Card>
    //   )}

    //   <Modal isOpen={isOpen} onClose={onClose} size="xl">
    //     <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
    //     <ModalContent>
    //       <ModalHeader bg="teal.50" borderTopRadius="md">Product Definition</ModalHeader>
    //       <ModalCloseButton />
    //       <ModalBody>
    //         {productDetails ? (
    //           <VStack spacing={4} align="stretch">
    //             <Box p={4} borderWidth="1px" borderRadius="md" shadow="sm" bg="gray.50">
    //               <Text>
    //                 <strong>Product ID:</strong> {productDetails?.productID || "N/A"}
    //               </Text>
    //               <Text>
    //                 <strong>Product Name:</strong> {productName || "N/A"}
    //               </Text>
    //             </Box>

    //             {productDetails?.components &&
    //               Object.entries(productDetails.components).map(([componentName, componentData]) => (
    //                 <Box
    //                   key={componentName}
    //                   p={4}
    //                   borderWidth="1px"
    //                   borderRadius="md"
    //                   shadow="sm"
    //                   bg="gray.50"
    //                   _hover={{ shadow: "md" }}
    //                   transition="all 0.2s"
    //                 >
    //                   <Text fontSize="lg" fontWeight="bold" color="teal.600" mb={2}>
    //                     {componentName}
    //                   </Text>
    //                   <Divider mb={2} />
    //                   <VStack align="start" spacing={1}>
    //                     {Object.entries(componentData).map(([key, value]) => (
    //                       <Text key={key} fontSize="sm">
    //                         <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>{" "}
    //                         {typeof value === "object"
    //                           ? JSON.stringify(value, null, 2)
    //                           : value}
    //                       </Text>
    //                     ))}
    //                   </VStack>
    //                 </Box>
    //               ))}
    //           </VStack>
    //         ) : (
    //           <Text>No product details available.</Text>
    //         )}
    //       </ModalBody>
    //       <ModalFooter>
    //         <Button
    //           colorScheme="blue"
    //           mr={3}
    //           onClick={handleUpdateDetails}
    //           _hover={{ transform: "translateY(-1px)" }}
    //         >
    //           Update Details
    //         </Button>
    //         <Button
    //           colorScheme="red"
    //           onClick={handleDeleteDefinition}
    //           _hover={{ transform: "translateY(-1px)" }}
    //         >
    //           Delete Definition
    //         </Button>
    //       </ModalFooter>
    //     </ModalContent>
    //   </Modal>
    // </Box>
  );
};

export default BlockDiagramOne;