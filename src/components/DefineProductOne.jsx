// import React, { useState } from "react";
import { API } from '@/config';
// import {
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalCloseButton,
//   ModalBody,
//   ModalFooter,
//   Button,
//   Input,
//   useDisclosure,
//   FormControl,
//   FormLabel,
//   useToast
// } from "@chakra-ui/react";
// import axios from "axios";

// const DeviceInputModal = () => {
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const [deviceName, setDeviceName] = useState("");
//   const [productID, setProductID] = useState(null);
//   const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
//   const [propId, setPropId] = useState("");
//   const toast = useToast();

//   const handleNext = async () => {
//     if (!deviceName.trim()) {
//       toast({
//         title: "Device name is required.",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }

//     try {
//       const response = await axios.post(`${API.MAIN}/product`, {
//         name: deviceName,
//       });

//       toast({
//         title: "Product created successfully!",
//         description: `Product ID: ${response.data.productID}`,
//         status: "success",
//         duration: 4000,
//         isClosable: true,
//       });

//       setProductID(response.data.productID);
//       setPropId(response.data.productID); // Set Prop ID from the created Product ID
//       setIsSecondModalOpen(true);

//     } catch (error) {
//       toast({
//         title: "Error creating product.",
//         description: error.response?.data?.message || "Something went wrong.",
//         status: "error",
//         duration: 4000,
//         isClosable: true,
//       });
//     }
//   };

//   const handleSecondNext = async () => {
//     if (!propId.trim()) {
//       toast({
//         title: "Prop ID is required.",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }

//     try {
//       const response = await axios.post(
//         `${API.MAIN}/product/:productID/definitionNewNew`,
//         {
//           productID,
//           productName: deviceName,
//           components: {},
//         }
//       );

//       toast({
//         title: "Product definition updated successfully!",
//         description: response.data.message,
//         status: "success",
//         duration: 4000,
//         isClosable: true,
//       });

//       setIsSecondModalOpen(false);
//       setDeviceName("");
//       setPropId("");
//     } catch (error) {
//       toast({
//         title: "Error updating product definition.",
//         description: error.response?.data?.message || "Something went wrong.",
//         status: "error",
//         duration: 4000,
//         isClosable: true,
//       });
//     }
//   };

//   return (
//     <>
//       <Button colorScheme="blue" onClick={onOpen} mt={4}>
//         Add Device
//       </Button>

//       {/* First Modal */}
//       <Modal isOpen={isOpen} onClose={onClose} isCentered>
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>Add Device Name</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             <FormControl>
//               <FormLabel>Device Name</FormLabel>
//               <Input
//                 placeholder="Enter device name"
//                 value={deviceName}
//                 onChange={(e) => setDeviceName(e.target.value)}
//               />
//             </FormControl>
//           </ModalBody>

//           <ModalFooter>
//             <Button variant="ghost" onClick={onClose} mr={3}>
//               Cancel
//             </Button>
//             <Button colorScheme="blue" onClick={handleNext}>
//               Next
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>

//       {/* Second Modal */}
//       <Modal isOpen={isSecondModalOpen} onClose={() => setIsSecondModalOpen(false)} isCentered>
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>Define Product Components</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             <FormControl>
//               <FormLabel>Prop ID</FormLabel>
//               <Input
//                 placeholder="Enter Prop ID"
//                 value={propId}
//                 onChange={(e) => setPropId(e.target.value)}
//               />
//             </FormControl>
//           </ModalBody>

//           <ModalFooter>
//             <Button variant="ghost" onClick={() => setIsSecondModalOpen(false)} mr={3}>
//               Cancel
//             </Button>
//             <Button colorScheme="blue" onClick={handleSecondNext}>
//               Next
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </>
//   );
// };

// export default DeviceInputModal;





// import React, { useState } from "react";
// import {
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalCloseButton,
//   ModalBody,
//   ModalFooter,
//   Button,
//   Input,
//   useDisclosure,
//   FormControl,
//   FormLabel,
//   useToast,
//   Flex,
// } from "@chakra-ui/react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom"; // Import useNavigate
// import Footer from './Footer';
// // import DefineProductTwo from './DefineProductTwo'
// const DeviceInputModal = () => {
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const [deviceName, setDeviceName] = useState("");
//   const [productID, setProductID] = useState(null);
//   const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
//   const [propId, setPropId] = useState("");
//   const toast = useToast();
//   const navigate = useNavigate(); // Initialize navigate function

//   const handleNext = async () => {
//     if (!deviceName.trim()) {
//       toast({
//         title: "Device name is required.",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }

//     try {
//       const response = await axios.post(`${API.MAIN}/product`, {
//         name: deviceName,
//       });

//       toast({
//         title: "Product created successfully!",
//         description: `Product ID: ${response.data.productID}`,
//         status: "success",
//         duration: 4000,
//         isClosable: true,
//       });

//       setProductID(response.data.productID);
//       setPropId(response.data.productID);
//       setIsSecondModalOpen(true);
//     } catch (error) {
//       toast({
//         title: "Error creating product.",
//         description: error.response?.data?.message || "Something went wrong.",
//         status: "error",
//         duration: 4000,
//         isClosable: true,
//       });
//     }
//   };

//   const handleSecondNext = async () => {
//     if (!propId.trim()) {
//       toast({
//         title: "Prop ID is required.",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }

//     try {
//       const response = await axios.post(
//         `${API.MAIN}/product/:productID/definitionNewNew`,
//         {
//           productID,
//           productName: deviceName,
//           components: {},
//         }
//       );

//       toast({
//         title: "Product definition updated successfully!",
//         description: response.data.message,
//         status: "success",
//         duration: 4000,
//         isClosable: true,
//       });

//       setIsSecondModalOpen(false);
//       setDeviceName("");
//       setPropId("");

//       // Redirect to DefineProduct.jsx page
//       navigate("/defineproduct");
//     } catch (error) {
//       toast({
//         title: "Error updating product definition.",
//         description: error.response?.data?.message || "Something went wrong.",
//         status: "error",
//         duration: 4000,
//         isClosable: true,
//       });
//     }
//   };

//   return (
//     <>
//        <Flex minH="10vh" alignItems="center" justifyContent="center">
//       {/* <Button colorScheme="purple" onClick={onOpen}>
//         Create
//       </Button> */}
//       <Button
//   onClick={onOpen}
//   size="lg"
//   sx={{
//     background: "linear-gradient(0deg, #AA2CCB 0%, #B817B8 42%, #6306D7 100%)",
//     color: "white",
//     _hover: {
//       opacity: 0.9,
//     },
//   }}
// >
//   Create
// </Button>
//     </Flex>

//       {/* First Modal */}
//       <Modal isOpen={isOpen} onClose={onClose} isCentered>
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>Add Product Name</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             <FormControl>
//               <FormLabel>Product Name</FormLabel>
//               <Input
//                 placeholder="Enter device name"
//                 value={deviceName}
//                 onChange={(e) => setDeviceName(e.target.value)}
//               />
//             </FormControl>
//           </ModalBody>
//           <ModalFooter>
//             <Button variant="ghost" onClick={onClose} mr={3}>
//               Cancel
//             </Button>
//             <Button colorScheme="blue" onClick={handleNext}>
//               Next
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>

//       {/* Second Modal */}
//       <Modal
//         isOpen={isSecondModalOpen}
//         onClose={() => setIsSecondModalOpen(false)}
//         isCentered
//       >
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>Product ID Generated</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             <FormControl>
//               <FormLabel>Product ID</FormLabel>
//               <Input
//                 placeholder="Enter Prop ID"
//                 value={propId}
//                 onChange={(e) => setPropId(e.target.value)}
//               />
//             </FormControl>
//           </ModalBody>
//           <ModalFooter>
//             <Button
//               variant="ghost"
//               onClick={() => setIsSecondModalOpen(false)}
//               mr={3}
//             >
//               Cancel
//             </Button>
//             <Button colorScheme="blue" onClick={handleSecondNext}>
//               Next
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//       {/* <Footer/> */}
//     </>
//   );
// };

// export default DeviceInputModal;






// import React, { useState } from "react";
// import {
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalCloseButton,
//   ModalBody,
//   ModalFooter,
//   Button,
//   Input,
//   useDisclosure,
//   FormControl,
//   FormLabel,
//   useToast,
//   Flex,
// } from "@chakra-ui/react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const DefineProductOne = () => {
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const [deviceName, setDeviceName] = useState("");
//   const [productID, setProductID] = useState(null);
//   const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
//   const [propId, setPropId] = useState("");
//   const toast = useToast();
//   const navigate = useNavigate();

//   const handleNext = async () => {
//     if (!deviceName.trim()) {
//       toast({
//         title: "Device name is required.",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }

//     try {
//       const response = await axios.post(`${API.MAIN}/product`, {
//         name: deviceName,
//       });

//       toast({
//         title: "Product created successfully!",
//         description: `Product ID: ${response.data.productID}`,
//         status: "success",
//         duration: 4000,
//         isClosable: true,
//       });

//       setProductID(response.data.productID);
//       setPropId(response.data.productID);
//       setIsSecondModalOpen(true);
//     } catch (error) {
//       toast({
//         title: "Error creating product.",
//         description: error.response?.data?.message || "Something went wrong.",
//         status: "error",
//         duration: 4000,
//         isClosable: true,
//       });
//     }
//   };

//   const handleSecondNext = async () => {
//     if (!propId.trim()) {
//       toast({
//         title: "Prop ID is required.",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }

//     try {
//       const response = await axios.post(
//         `${API.MAIN}/product/:productID/definitionNewNew`,
//         {
//           productID,
//           productName: deviceName,
//           components: {},
//         }
//       );

//       toast({
//         title: "Product definition updated successfully!",
//         description: response.data.message,
//         status: "success",
//         duration: 4000,
//         isClosable: true,
//       });

//       setIsSecondModalOpen(false);
//       setDeviceName("");
//       setPropId("");

//       // Navigate to DefineProductTwo with the product data
//       navigate("/defineproduct", {
//         state: {
//           productID: productID,
//           deviceName: deviceName
//         }
//       });
//     } catch (error) {
//       toast({
//         title: "Error updating product definition.",
//         description: error.response?.data?.message || "Something went wrong.",
//         status: "error",
//         duration: 4000,
//         isClosable: true,
//       });
//     }
//   };

//   return (
//     <>
//       <Flex minH="10vh" alignItems="center" justifyContent="center">
//         <Button
//           onClick={onOpen}
//           size="lg"
//           sx={{
//             background: "linear-gradient(0deg, #AA2CCB 0%, #B817B8 42%, #6306D7 100%)",
//             color: "white",
//             _hover: {
//               opacity: 0.9,
//             },
//           }}
//         >
//           Create Product
//         </Button>
//       </Flex>

//       {/* First Modal */}
//       <Modal isOpen={isOpen} onClose={onClose} isCentered>
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>Add Product Name</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             <FormControl>
//               <FormLabel>Product Name</FormLabel>
//               <Input
//                 placeholder="Enter device name"
//                 value={deviceName}
//                 onChange={(e) => setDeviceName(e.target.value)}
//               />
//             </FormControl>
//           </ModalBody>
//           <ModalFooter>
//             <Button variant="ghost" onClick={onClose} mr={3}>
//               Cancel
//             </Button>
//             <Button colorScheme="blue" onClick={handleNext}>
//               Next
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>

//       {/* Second Modal */}
//       <Modal
//         isOpen={isSecondModalOpen}
//         onClose={() => setIsSecondModalOpen(false)}
//         isCentered
//       >
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>Product ID Generated</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             <FormControl>
//               <FormLabel>Product ID</FormLabel>
//               <Input
//                 placeholder="Enter Prop ID"
//                 value={propId}
//                 onChange={(e) => setPropId(e.target.value)}
//               />
//             </FormControl>
//           </ModalBody>
//           <ModalFooter>
//             <Button
//               variant="ghost"
//               onClick={() => setIsSecondModalOpen(false)}
//               mr={3}
//             >
//               Cancel
//             </Button>
//             <Button colorScheme="blue" onClick={handleSecondNext}>
//               Next
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </>
//   );
// };

// export default DefineProductOne;



// import React, { useState, useEffect } from "react";
// import {
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalCloseButton,
//   ModalBody,
//   ModalFooter,
//   Button,
//   Input,
//   useDisclosure,
//   FormControl,
//   FormLabel,
//   useToast,
//   Flex,
// } from "@chakra-ui/react";
// import axios from "axios";
// import { useNavigate, useLocation } from "react-router-dom";

// const DefineProductOne = () => {
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const [deviceName, setDeviceName] = useState("");
//   const [productID, setProductID] = useState(null);
//   const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
//   const [propId, setPropId] = useState("");
//   const [userId, setUserId] = useState(""); // Added state for userId
//   const toast = useToast();
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Fetch userId from location state (if available)
//   useEffect(() => {
//     if (location.state?.userId) {
//       setUserId(location.state.userId);
//     }
//   }, [location.state]);

//   const handleNext = async () => {
//     if (!deviceName.trim()) {
//       toast({
//         title: "Device name is required.",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }

//     try {
//       const response = await axios.post(`${API.MAIN}/product`, {
//         name: deviceName,
//         userId, // Send userId along with product creation request
//       });

//       toast({
//         title: "Product created successfully!",
//         description: `Product ID: ${response.data.productID}`,
//         status: "success",
//         duration: 4000,
//         isClosable: true,
//       });

//       setProductID(response.data.productID);
//       setPropId(response.data.productID);
//       setIsSecondModalOpen(true);
//     } catch (error) {
//       toast({
//         title: "Error creating product.",
//         description: error.response?.data?.message || "Something went wrong.",
//         status: "error",
//         duration: 4000,
//         isClosable: true,
//       });
//     }
//   };

//   const handleSecondNext = async () => {
//     if (!propId.trim()) {
//       toast({
//         title: "Prop ID is required.",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }

//     try {
//       const response = await axios.post(
//         `${API.MAIN}/product/:productID/definitionNewNew`,
//         {
//           productID,
//           productName: deviceName,
//           userId, // Send userId with product definition
//           components: {},
//         }
//       );

//       toast({
//         title: "Product definition updated successfully!",
//         description: response.data.message,
//         status: "success",
//         duration: 4000,
//         isClosable: true,
//       });

//       setIsSecondModalOpen(false);
//       setDeviceName("");
//       setPropId("");

//       // Navigate to DefineProductTwo with the product data
//       navigate("/defineproduct", {
//         state: {
//           productID: productID,
//           deviceName: deviceName,
//         },
//       });
//     } catch (error) {
//       toast({
//         title: "Error updating product definition.",
//         description: error.response?.data?.message || "Something went wrong.",
//         status: "error",
//         duration: 4000,
//         isClosable: true,
//       });
//     }
//   };

//   return (
//     <>
//       <Flex minH="10vh" alignItems="center" justifyContent="center">
//         <Button
//           onClick={onOpen}
//           size="lg"
//           sx={{
//             background: "linear-gradient(0deg, #AA2CCB 0%, #B817B8 42%, #6306D7 100%)",
//             color: "white",
//             _hover: {
//               opacity: 0.9,
//             },
//           }}
//         >
//           Create Product
//         </Button>
//       </Flex>

//       {/* First Modal */}
//       <Modal isOpen={isOpen} onClose={onClose} isCentered>
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>Add Product Details</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             <FormControl>
//               <FormLabel>Product Name</FormLabel>
//               <Input
//                 placeholder="Enter device name"
//                 value={deviceName}
//                 onChange={(e) => setDeviceName(e.target.value)}
//               />
//             </FormControl>
//             <FormControl mt={4}>
//               <FormLabel>User ID</FormLabel>
//               <Input
//                 value={userId}
//                 isReadOnly // Makes userId field non-editable
//               />
//             </FormControl>
//           </ModalBody>
//           <ModalFooter>
//             <Button variant="ghost" onClick={onClose} mr={3}>
//               Cancel
//             </Button>
//             <Button colorScheme="blue" onClick={handleNext}>
//               Next
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>

//       {/* Second Modal */}
//       <Modal
//         isOpen={isSecondModalOpen}
//         onClose={() => setIsSecondModalOpen(false)}
//         isCentered
//       >
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>Product ID Generated</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             <FormControl>
//               <FormLabel>Product ID</FormLabel>
//               <Input
//                 placeholder="Enter Prop ID"
//                 value={propId}
//                 onChange={(e) => setPropId(e.target.value)}
//               />
//             </FormControl>
//           </ModalBody>
//           <ModalFooter>
//             <Button
//               variant="ghost"
//               onClick={() => setIsSecondModalOpen(false)}
//               mr={3}
//             >
//               Cancel
//             </Button>
//             <Button colorScheme="blue" onClick={handleSecondNext}>
//               Next
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </>
//   );
// };

// export default DefineProductOne;






import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  useDisclosure,
  FormControl,
  FormLabel,
  useToast,
  Flex,
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { productAPIBase } from "../utilities";

const DefineProductOne = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deviceName, setDeviceName] = useState("");
  const [productID, setProductID] = useState(null);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [propId, setPropId] = useState("");
  const [userId, setUserId] = useState("");
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Load data from sessionStorage on component mount
  useEffect(() => {
    const storedProductID = sessionStorage.getItem("productID");
    const storedDeviceName = sessionStorage.getItem("deviceName");

    if (storedProductID) setProductID(storedProductID);
    if (storedDeviceName) setDeviceName(storedDeviceName);

    if (location.state?.userId) {
      setUserId(location.state.userId);
    }
  }, [location.state]);

  const handleNext = async () => {
    if (!deviceName.trim()) {
      toast({
        title: "Device name is required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axios.post(`${API.MAIN}/product`, {
        name: deviceName,
        userId,
      });

      // Store in sessionStorage
      sessionStorage.setItem("productID", response.data.productID);
      sessionStorage.setItem("deviceName", deviceName);

      toast({
        title: "Product created successfully!",
        description: `Product ID: ${response.data.productID}`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      setProductID(response.data.productID);
      setPropId(response.data.productID);
      setIsSecondModalOpen(true);
    } catch (error) {
      toast({
        title: "Error creating product.",
        description: error.response?.data?.message || "Something went wrong.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleSecondNext = async () => {
    if (!propId.trim()) {
      toast({
        title: "Prop ID is required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axios.post(
        `${productAPIBase}/product/${productID}/definitionNew`,
        {
          productID,
          productName: deviceName,
          userId,
          components: {},
        }
      );

      toast({
        title: "Product definition updated successfully!",
        description: response.data.message,
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      setIsSecondModalOpen(false);
      setDeviceName("");
      setPropId("");

      // Navigate to DefineProductTwo with the product data
      navigate("/createproductdefination", {
        state: {
          productID: productID,
          deviceName: deviceName,
        },
      });
    } catch (error) {
      toast({
        title: "Error updating product definition.",
        description: error.response?.data?.message || "Something went wrong.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Flex minH="10vh" alignItems="center" justifyContent="center">
        <Button
          onClick={onOpen}
          size="sm"
          sx={{
            background: "linear-gradient(0deg, #AA2CCB 0%, #B817B8 42%, #6306D7 100%)",
            color: "white",
            _hover: {
              opacity: 0.9,
            },
          }}
        >
          Create Product
        </Button>
      </Flex>

      {/* First Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Product Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Product Name</FormLabel>
              <Input
                placeholder="Enter device name"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>User ID</FormLabel>
              <Input
                value={userId}
                isReadOnly
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose} mr={3}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleNext}>
              Next
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Second Modal */}
      <Modal
        isOpen={isSecondModalOpen}
        onClose={() => setIsSecondModalOpen(false)}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Product ID Generated</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Product ID</FormLabel>
              <Input
                placeholder="Enter Prop ID"
                value={propId}
                onChange={(e) => setPropId(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              onClick={() => setIsSecondModalOpen(false)}
              mr={3}
            >
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSecondNext}>
              Next
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default DefineProductOne;