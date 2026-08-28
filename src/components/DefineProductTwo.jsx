// import React, { useState } from "react";
import { API } from '@/config';
// import { Button, useToast } from "@chakra-ui/react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const ProductDefinitionButton = () => {
//   const [formData] = useState({}); // Assuming this is your form data object
//   const navigate = useNavigate();
//   const toast = useToast();

//   const handleSubmit = async () => {
//     const productID = prompt("Please enter the Product ID:");

//     if (!productID) {
//       toast({
//         title: "Product ID is required.",
//         status: "warning",
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }

//     try {
//       const url = `${API.MAIN}/product/:productID/definitionNewNew`;

//       const response = await axios.post(url, formData);

//       toast({
//         title: "Product defined successfully.",
//         description: "Redirecting to block diagram...",
//         status: "success",
//         duration: 3000,
//         isClosable: true,
//       });

//       // Redirect after API call success
//       navigate("/blockdiagram");
//     } catch (error) {
//       toast({
//         title: "Failed to define product.",
//         description: error.response?.data?.message || "Something went wrong.",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//     }
//   };

//   return (
//     <Button colorScheme="green" onClick={handleSubmit}>
//       Submit
//     </Button>
//   );
// };

// export default ProductDefinitionButton;

// import React, { useState } from "react";
// import { Button, useToast, Input, VStack } from "@chakra-ui/react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const ProductDefinitionButton = () => {
//   const [productID, setProductID] = useState("");
//   const [productName, setProductName] = useState("");
//   const navigate = useNavigate();
//   const toast = useToast();

//   const handleSubmit = async () => {
//     if (!productID || !productName) {
//       toast({
//         title: "Missing Required Information",
//         description: "Both Product ID and Product Name are required.",
//         status: "warning",
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }

//     try {
//       const url = `${API.MAIN}/product/:productID/definitionNewNew`;

//       const payload = {
//         productID,
//         productName,
//       };

//       const response = await axios.post(url, payload);

//       toast({
//         title: "Product defined successfully.",
//         description: "Redirecting to block diagram...",
//         status: "success",
//         duration: 3000,
//         isClosable: true,
//       });

//       navigate("/blockdiagram");
//     } catch (error) {
//       toast({
//         title: "Failed to define product.",
//         description: error.response?.data?.message || "Something went wrong.",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//     }
//   };

//   return (
//     <VStack spacing={4} align="stretch">
//       <Input
//         placeholder="Enter Product ID"
//         value={productID}
//         onChange={(e) => setProductID(e.target.value)}
//       />
//       <Input
//         placeholder="Enter Product Name"
//         value={productName}
//         onChange={(e) => setProductName(e.target.value)}
//       />
//       <Button colorScheme="green" onClick={handleSubmit}>
//         Submit
//       </Button>
//     </VStack>
//   );
// };

// export default ProductDefinitionButton;





// import React, { useState } from "react";
// import { Button, useToast, Input, VStack, FormLabel, Textarea } from "@chakra-ui/react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const ProductDefinitionButton = () => {
//   const [productID, setProductID] = useState("");
//   const [productName, setProductName] = useState("");
//   const [components, setComponents] = useState("");
//   const navigate = useNavigate();
//   const toast = useToast();

//   const handleSubmit = async () => {
//     if (!productID || !productName || !components) {
//       toast({
//         title: "Missing Required Information",
//         description: "Product ID, Product Name, and Components are required.",
//         status: "warning",
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }

//     try {
//       const url = `${API.MAIN}/product/:productID/definitionNewNew`;

//       const payload = {
//         productID,
//         productName,
//         components: JSON.parse(components),
//       };

//       await axios.post(url, payload);

//       toast({
//         title: "Product defined successfully.",
//         description: "Redirecting to block diagram...",
//         status: "success",
//         duration: 3000,
//         isClosable: true,
//       });

//       navigate("/blockdiagram");
//     } catch (error) {
//       toast({
//         title: "Failed to define product.",
//         description: error.response?.data?.message || "Something went wrong. Ensure JSON format for components.",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//     }
//   };

//   return (
//     <VStack spacing={4} align="stretch">
//       <FormLabel>Product ID</FormLabel>
//       <Input
//         placeholder="Enter Product ID"
//         value={productID}
//         onChange={(e) => setProductID(e.target.value)}
//       />
//       <FormLabel>Product Name</FormLabel>
//       <Input
//         placeholder="Enter Product Name"
//         value={productName}
//         onChange={(e) => setProductName(e.target.value)}
//       />
//       <FormLabel>Components (JSON Format)</FormLabel>
//       <Textarea
//         placeholder='{"accelerometer": {"type": "sensor", "unit": "°C", "range": {"min": 150, "max": 350}}}'
//         value={components}
//         onChange={(e) => setComponents(e.target.value)}
//       />
//       <Button colorScheme="green" onClick={handleSubmit}>
//         Submit
//       </Button>
//     </VStack>
//   );
// };

// export default ProductDefinitionButton;



import React, { useState, useEffect } from "react";
import {
  Button,
  useToast,
  Input,
  VStack,
  FormLabel,
  Textarea,
  Box,
  Container,
  Heading,
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { productAPIBase } from "../utilities";

const DefineProductTwo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  // Get the state passed from DefineProductOne
  const [productID, setProductID] = useState("");
  const [productName, setProductName] = useState("");
  const [components, setComponents] = useState("");

  useEffect(() => {
    // Check if we have state data and update the fields
    if (location.state) {
      setProductID(location.state.productID || "");
      setProductName(location.state.deviceName || "");
    } else {
      // If no state is present, show error and redirect
      toast({
        title: "No product data found",
        description: "Please create a product first",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate("/defineproductone");
    }
  }, [location.state, navigate, toast]);

  const handleSubmit = async () => {
    if (!components) {
      toast({
        title: "Missing Required Information",
        description: "Components are required.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Validate JSON format before submitting
      const parsedComponents = JSON.parse(components);

      const url = `${productAPIBase}/product/${productID}/definitionNew`;
      const payload = {
        productID,
        productName,
        components: parsedComponents,
      };

      await axios.post(url, payload);

      toast({
        title: "Product defined successfully.",
        description: "Redirecting to block diagram...",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Navigate to BlockDiagramOne and pass productID and productName
      navigate("/blockdiagram", { state: { productID, productName } });

    } catch (error) {
      if (error instanceof SyntaxError) {
        toast({
          title: "Invalid JSON format",
          description: "Please check your components JSON format",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Failed to define product.",
          description: error.response?.data?.message || "Something went wrong.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };


  return (
    <Container maxW="container.md" py={8}>
      <Box boxShadow="lg" p={8} borderRadius="md" bg="white">
        <Heading size="lg" mb={6} textAlign="center">
          Define Product Components
        </Heading>
        <VStack spacing={4} align="stretch">
          <FormLabel>Product ID</FormLabel>
          <Input
            value={productID}
            isReadOnly
            bg="gray.100"
          />

          <FormLabel>Product Name</FormLabel>
          <Input
            value={productName}
            isReadOnly
            bg="gray.100"
          />

          <FormLabel>Components (JSON Format)</FormLabel>
          <Textarea
            placeholder={`{
  "accelerometer": {
    "type": "sensor",
    "unit": "°C",
    "range": {
      "min": 150,
      "max": 350
    }
  }
}`}
            value={components}
            onChange={(e) => setComponents(e.target.value)}
            minH="200px"
            p={4}
          />

          <Button
            colorScheme="blue"
            size="lg"
            onClick={handleSubmit}
            mt={4}
          >
            Submit
          </Button>
        </VStack>
      </Box>
    </Container>
  );
};

export default DefineProductTwo;