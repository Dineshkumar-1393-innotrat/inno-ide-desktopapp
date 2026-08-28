// import React, { useState } from "react";
// import {
//   Box,
//   Button,
//   Checkbox,
//   Grid,
//   IconButton,
//   Input,
//   Modal,
//   ModalBody,
//   ModalCloseButton,
//   ModalContent,
//   ModalFooter,
//   ModalHeader,
//   ModalOverlay,
//   Select,
//   Text,
//   useColorMode,
//   useDisclosure,
// } from "@chakra-ui/react";
// import { MoonIcon, SunIcon } from "@chakra-ui/icons";
// import Footer from "./Footer";
// import { useNavigate } from 'react-router-dom';
// import DefineProductTwo from './DefineProductTwo';

// const DefineProduct = () => {
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const { colorMode, toggleColorMode } = useColorMode();
//   const [selectedRequirements, setSelectedRequirements] = useState([]);
//   const [currentScreen, setCurrentScreen] = useState("requirements"); // Manages screens

//   const requirements = [
//     "Sensors",
//     "Actuators",
//     "Microcontroller",
//     "Communication Module",
//     "Power Consumption",
//     "GPS Tracker",
//     "Amplifier",
//     "Medication Pods",
//     "Medication Lids",
//     "Speaker",
//     "Objects",
//     "Display",
//     "Light",
//     "Switch",
//   ];

//   const handleNext = () => {
//     setCurrentScreen("details"); // Navigate to details screen
//     onClose(); // Close the modal
//   };

//   const handleCheckboxChange = (requirement) => {
//     if (selectedRequirements.includes(requirement)) {
//       setSelectedRequirements(
//         selectedRequirements.filter((item) => item !== requirement)
//       );
//     } else {
//       setSelectedRequirements([...selectedRequirements, requirement]);
//     }
//   };

//   const navigate = useNavigate();

//   const handleFileUpload = () => {
//     // Navigate to the FileExplorer component
//     navigate('/fileupload');
//   };

//   // Component for rendering configuration based on the selected requirement
//   const renderConfiguration = (requirement) => {
//     switch (requirement) {
//       case "Sensors":
//         return (



//           <Box mb={6}>
//             <Text fontWeight="bold">Sensors:</Text>
//             <Box mt={4} p={4} borderWidth={1} borderRadius="md">
//               <Text>ID:</Text>
//               <Input placeholder="Enter ID" mb={4} />

//               <Text>Type:</Text>
//               <Input placeholder="Enter the type of Sensor" mb={4} />

//               <Text>Range:</Text>
//               <Input placeholder="Enter Range (min, max, unit)" mb={4} />

//               <Text>Resolution:</Text>
//               <Input placeholder="Enter Resolution" mb={4} />

//               <Text>Accuracy:</Text>
//               <Input placeholder="Enter Accuracy" mb={4} />

//               <Text>Update Rate:</Text>
//               <Input placeholder="Enter Update Rate" mb={4} />

//               <Button 
//       colorScheme="blue" 
//       size="sm" 
//       onClick={handleFileUpload}
//     >
//       Upload Image/Video of the Device
//     </Button>
//             </Box>
//           </Box>
//         );





//       case "Actuators":
//         return (
//           <Box mb={6}>
//             <Text fontWeight="bold">Actuators:</Text>
//             <Box mt={4} p={4} borderWidth={1} borderRadius="md">
//               <Text>ID:</Text>
//               <Input placeholder="Enter ID" mb={4} />

//               <Text>Type:</Text>
//               <Input placeholder="Enter the type of Actuators" mb={4} />

//               <Text>Range:</Text>
//               <Input placeholder="Enter Range (min, max, unit)" mb={4} />

//               <Text>Torque:</Text>
//               <Input placeholder="Enter Torque" mb={4} />

//               <Text>Response Time:</Text>
//               <Input placeholder="Enter Response Time" mb={4} />


//               <Text>Speed :</Text>
//               <Input placeholder="Enter Speed" mb={4} />

//               <Button 
//       colorScheme="blue" 
//       size="sm" 
//       onClick={handleFileUpload}
//     >
//       Upload Image/Video of the Device
//     </Button>
//             </Box>
//           </Box>
//         );




//         case "Microcontroller":
//     return (
//       <Box mb={6}>
//         <Text fontWeight="bold">Microcontroller:</Text>
//         <Box mt={4} p={4} borderWidth={1} borderRadius="md">
//         <Text>ID:</Text>
//               <Input placeholder="Enter ID" mb={4} />

//               <Text>Type:</Text>
//               <Input placeholder="Enter the type of Microcontroller" mb={4} />

//               <Text>Processor:</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Memory:</Text>
//               <Input placeholder="" mb={4} />
//               <Text>GPIO:</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Interfaces:</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Power Supply:</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Dimensions:</Text>
//               <Input placeholder="" mb={4} />


//           <Button 
//       colorScheme="blue" 
//       size="sm" 
//       onClick={handleFileUpload}
//     >
//       Upload Image/Video of the Device
//     </Button>
//         </Box>
//       </Box>
//     );





//     case "Communication Module":
//         return (
//           <Box mb={6}>
//             <Text fontWeight="bold">Communication Module:</Text>
//             <Box mt={4} p={4} borderWidth={1} borderRadius="md">
//             <Text>ID:</Text>
//               <Input placeholder="Enter ID" mb={4} />

//               <Text>Type:</Text>
//               <Input placeholder="Enter the type of Communication Module " mb={4} />

//               <Text>Range:</Text>
//               <Input placeholder="Enter Range (min, max, unit)" mb={4} />

//               <Text>Power Supply:</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Date Rate:</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Speed:</Text>
//               <Input placeholder="" mb={4} />

//               <Button 
//       colorScheme="blue" 
//       size="sm" 
//       onClick={handleFileUpload}
//     >
//       Upload Image/Video of the Device
//     </Button>
//             </Box>
//           </Box>
//         );




//         case "Power Consumption":
//             return (
//               <Box mb={6}>
//                 <Text fontWeight="bold">Power Consumption:</Text>
//                 <Box mt={4} p={4} borderWidth={1} borderRadius="md">
//                 <Text>ID:</Text>
//               <Input placeholder="Enter ID" mb={4} />

//               <Text>Type:</Text>
//               <Input placeholder="Enter the type of Power Consumption " mb={4} />

//               <Text>Supply Voltage:</Text>
//               <Input placeholder="" mb={2} /> <Input placeholder="" mb={2} />
//               <Text>Active Mode:</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Idle Mode:</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Deep Sleep Mode:</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Peek Power Consumption:</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Quiescent Current:</Text>
//               <Input placeholder="" mb={4} />

//                   <Button 
//       colorScheme="blue" 
//       size="sm" 
//       onClick={handleFileUpload}
//     >
//       Upload Image/Video of the Device
//     </Button>
//                 </Box>
//               </Box>
//             );





//             case "GPS Tracker":
//                 return (
//                   <Box mb={6}>
//                     <Text fontWeight="bold">GPS Tracker:</Text>
//                     <Box mt={4} p={4} borderWidth={1} borderRadius="md">
//                     <Text>ID:</Text>
//               <Input placeholder="Enter ID" mb={4} />

//               <Text>Type:</Text>
//               <Input placeholder="Enter the type of GPS Tracker" mb={4} />

//               <Text>Latitude:</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Longitude:</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Altitude:</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Speed:</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Time Stamp:</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Satellite Count:</Text>
//               <Input placeholder="" mb={4} />

//                       <Button 
//       colorScheme="blue" 
//       size="sm" 
//       onClick={handleFileUpload}
//     >
//       Upload Image/Video of the Device
//     </Button>
//                     </Box>
//                   </Box>
//                 );






//                 case "Amplifier":
//                     return (
//                       <Box mb={6}>
//                         <Text fontWeight="bold">Amplifier:</Text>
//                         <Box mt={4} p={4} borderWidth={1} borderRadius="md">
//                         <Text>ID:</Text>
//               <Input placeholder="Enter ID" mb={4} />

//               <Text>Type:</Text>
//               <Input placeholder="Enter the type of Amplifier " mb={4} />

//             <Text>Supply Voltage:</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Output Power :</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Gain:</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Frequency Response:</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Input Impedance:</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Output Impedance:</Text>
//               <Input placeholder="" mb={4} />

//                           <Button 
//       colorScheme="blue" 
//       size="sm" 
//       onClick={handleFileUpload}
//     >
//       Upload Image/Video of the Device
//     </Button>
//                         </Box>
//                       </Box>
//                     );




//                     case "Medication Pods":
//                         return (
//                           <Box mb={6}>
//                             <Text fontWeight="bold">Medication Pods:</Text>
//                             <Box mt={4} p={4} borderWidth={1} borderRadius="md">
//                             <Text>ID:</Text>
//               <Input placeholder="Enter ID" mb={4} />

//               <Text>Type:</Text>
//               <Input placeholder="Enter the type of Amplifier " mb={4} />

//             <Text>Dosage:</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Frequency:</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Time:</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Routes:</Text>
//               <Input placeholder="" mb={4} />

//                                       <Button 
//       colorScheme="blue" 
//       size="sm" 
//       onClick={handleFileUpload}
//     >
//       Upload Image/Video of the Device
//     </Button>
//                             </Box>
//                           </Box>
//                         );





//                         case "Objects":
//                             return (
//                               <Box mb={6}>
//                                 <Text fontWeight="bold">Objects:</Text>
//                                 <Box mt={4} p={4} borderWidth={1} borderRadius="md">
//                                 <Input placeholder="Enter ID" mb={4} />

// <Text>Type:</Text>
// <Input placeholder="Enter the type of Amplifier " mb={4} />

// <Text>Dimension:</Text>
// <Input placeholder="" mb={2} /> <Input placeholder="" mb={2} /> <Input placeholder="" mb={2} />
// <Text>Shape:</Text>
// <Input placeholder="" mb={4} />
// <Text>Size:</Text>
// <Input placeholder="" mb={4} />
// <Text>Weight Material:</Text>
// <Input placeholder="" mb={4} />
// <Text>Mechanical Strength:</Text>
// <Input placeholder="" mb={4} />
// <Text>Flexibility:</Text>
// <Input placeholder="" mb={4} />
// <Text>Texture :</Text>
// <Input placeholder="" mb={4} />
// <Text>Enviromental Factor:</Text>
// <Input placeholder="" mb={4} />


//                                   <Button 
//       colorScheme="blue" 
//       size="sm" 
//       onClick={handleFileUpload}
//     >
//       Upload Image/Video of the Device
//     </Button>
//                                 </Box>
//                               </Box>
//                             );






//                             case "Medication Lids":
//                                 return (
//                                   <Box mb={6}>
//                                     <Text fontWeight="bold">Medication Lids:</Text>
//                                     <Box mt={4} p={4} borderWidth={1} borderRadius="md">
//                                     <Input placeholder="Enter ID" mb={4} />

// <Text>Type:</Text>
// <Input placeholder="Enter the type of Amplifier " mb={4} />

// <Text>Dosage:</Text>
// <Input placeholder="" mb={4} />
// <Text>Frequency:</Text>
// <Input placeholder="" mb={4} />
// <Text>Time:</Text>
// <Input placeholder="" mb={4} />
// <Text>Routes:</Text>
// <Input placeholder="" mb={4} />

//                                       <Button 
//       colorScheme="blue" 
//       size="sm" 
//       onClick={handleFileUpload}
//     >
//       Upload Image/Video of the Device
//     </Button>
//                                     </Box>
//                                   </Box>
//                                 );







//                                 case "Speaker":
//                                     return (
//                                       <Box mb={6}>
//                                         <Text fontWeight="bold">Speaker:</Text>
//                                         <Box mt={4} p={4} borderWidth={1} borderRadius="md">
//                                         <Text>ID:</Text>
//               <Input placeholder="Enter ID" mb={4} />

//               <Text>Type:</Text>
//               <Input placeholder="Enter the type of GPS Tracker" mb={4} />

//               <Text>Impedance:</Text>
//               <Input placeholder="" mb={4} />
//               <Text>RMS Power :</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Peak Power :</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Sensitivity:</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Cone Material:</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Enviromental Rating:</Text>
//               <Input placeholder="" mb={4} />
//                                           <Button 
//       colorScheme="blue" 
//       size="sm" 
//       onClick={handleFileUpload}
//     >
//       Upload Image/Video of the Device
//     </Button>
//                                         </Box>
//                                       </Box>
//                                     );






//                                     case "Display":
//                                         return (
//                                           <Box mb={6}>
//                                             <Text fontWeight="bold">Display:</Text>
//                                             <Box mt={4} p={4} borderWidth={1} borderRadius="md">
//                                             <Text>ID:</Text>
//               <Input placeholder="Enter ID" mb={4} />

//               <Text>Type:</Text>
//               <Input placeholder="Enter the type of Power Consumption " mb={4} />

//               <Text>Supply Voltage:</Text>
//               <Input placeholder="" mb={2} /> <Input placeholder="" mb={2} />
//               <Text>Active Mode:</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Idle Mode:</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Deep Sleep Mode:</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Peek Power Consumption:</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Quiescent Current:</Text>
//               <Input placeholder="" mb={4} />


//                                               <Button 
//       colorScheme="blue" 
//       size="sm" 
//       onClick={handleFileUpload}
//     >
//       Upload Image/Video of the Device
//     </Button>
//                                             </Box>
//                                           </Box>
//                                         );







//                                         case "Light":
//                                             return (
//                                               <Box mb={6}>
//                                                 <Text fontWeight="bold">Light:</Text>
//                                                 <Box mt={4} p={4} borderWidth={1} borderRadius="md">
//                                                 <Text>ID:</Text>
//               <Input placeholder="Enter ID" mb={4} />

//               <Text>Type:</Text>
//               <Input placeholder="Enter the type of Light" mb={4} />

//               <Text>On(1) || Off(0):</Text>
//               <Input placeholder="" mb={4} />
//               <Text>Voltage:</Text>
//               <Input placeholder="" mb={4} />

//                                                   <Button 
//       colorScheme="blue" 
//       size="sm" 
//       onClick={handleFileUpload}
//     >
//       Upload Image/Video of the Device
//     </Button>
//                                                 </Box>
//                                               </Box>
//                                             );




//                                         case "Switch":
//                                             return (
//                                               <Box mb={6}>
//                                                 <Text fontWeight="bold">Switch:</Text>
//                                                 <Box mt={4} p={4} borderWidth={1} borderRadius="md">
//                                                 <Input placeholder="Enter ID" mb={4} />

// <Text>Type:</Text>
// <Input placeholder="Enter the type of Light" mb={4} />

// <Text>On(1) || Off(0):</Text>
// <Input placeholder="" mb={4} />
// <Text>Voltage:</Text>
// <Input placeholder="" mb={4} />

//                                                   <Button 
//       colorScheme="blue" 
//       size="sm" 
//       onClick={handleFileUpload}
//     >
//       Upload Image/Video of the Device
//     </Button>
//                                                 </Box>
//                                               </Box>
//                                             );

//       // Add more cases for other requirements
//       default:
//         return null;
//     }
//   };





//   return (
//     <Box display="flex" flexDirection="column" minH="110vh">
//       <Box flex="1" p={4}>
//         {/* Theme Toggle Button */}
//         <IconButton
//           aria-label="Toggle Theme"
//           icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
//           onClick={toggleColorMode}
//           position="absolute"
//           top="1rem"
//           right="1rem"
//         />

//         {/* Conditional Rendering */}
//         {currentScreen === "requirements" ? (
//           <>
//             {/* Define Product Requirements Button */}
//             <Box textAlign="center" mt={12}>
//               <Button onClick={onOpen} colorScheme="blue">
//                 Define Product Requirements
//               </Button>
//             </Box>

//             {/* Modal */}
//             <Modal isOpen={isOpen} onClose={onClose}>
//               <ModalOverlay />
//               <ModalContent>
//                 <ModalHeader>Choose Your Product Requirements</ModalHeader>
//                 <ModalCloseButton />
//                 <ModalBody>
//                   <Grid templateColumns="repeat(2, 1fr)" gap={4}>
//                     {requirements.map((requirement, index) => (
//                       <Checkbox
//                         key={index}
//                         isChecked={selectedRequirements.includes(requirement)}
//                         onChange={() => handleCheckboxChange(requirement)}
//                       >
//                         {requirement}
//                       </Checkbox>
//                     ))}
//                   </Grid>
//                 </ModalBody>
//                 <ModalFooter>
//                   <Button variant="ghost" mr={3} onClick={onClose}>
//                     Cancel
//                   </Button>
//                   <Button
//                     colorScheme="blue"
//                     onClick={handleNext}
//                     isDisabled={selectedRequirements.length === 0}
//                   >
//                     Next
//                   </Button>
//                 </ModalFooter>
//               </ModalContent>
//             </Modal>
//           </>
//         ) : (
//           // Details Screen
//           <Box>
//             <Text fontSize="2xl" mb={4}>
//               Configure Details for: {selectedRequirements.join(", ")}
//             </Text>
//             {selectedRequirements.map((requirement) =>
//               renderConfiguration(requirement)
//             )}
//             <Button
//               colorScheme="gray"
//               onClick={() => setCurrentScreen("requirements")}
//               mr={3}
//             >
//               Back
//             </Button>
//             {/* <Button colorScheme="blue">Submit</Button> */}
//                         <DefineProductTwo/>

//           </Box>
//         )}
//       </Box>

//       <Footer />
//     </Box>
//   );
// };

// export default DefineProduct;


import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Grid,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useColorMode,
  useDisclosure,
  VStack,
  HStack
} from "@chakra-ui/react";
import { MoonIcon, SunIcon, AddIcon } from "@chakra-ui/icons";
import { useNavigate } from 'react-router-dom';
import Footer from "./Footer";
import DefineProductTwo from './DefineProductTwo';

const DefineProduct = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();

  const [selectedRequirements, setSelectedRequirements] = useState([]);
  const [currentScreen, setCurrentScreen] = useState("requirements");
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

  const requirements = [
    "Sensors", "Actuators", "Microcontroller", "Communication Module",
    "Power Consumption", "GPS Tracker", "Amplifier", "Medication Pods",
    "Medication Lids", "Speaker", "Objects", "Display", "Light", "Switch"
  ];

  const handleFileUpload = () => {
    navigate('/fileupload');
  };

  const handleNext = () => {
    if (currentScreen === "requirements") {
      setCurrentScreen("details");
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      setCurrentScreen("requirements");
    }
  };

  const handleCheckboxChange = (requirement) => {
    setSelectedRequirements(
      selectedRequirements.includes(requirement)
        ? selectedRequirements.filter(item => item !== requirement)
        : [...selectedRequirements, requirement]
    );
  };

  const handleAddMore = (requirement) => {
    const currentRequirementData = formData[requirement] || [];
    setFormData({
      ...formData,
      [requirement]: [...currentRequirementData, {}]
    });
  };

  const handleInputChange = (requirement, index, field, value) => {
    const currentRequirementData = [...(formData[requirement] || [])];
    currentRequirementData[index] = {
      ...currentRequirementData[index],
      [field]: value
    };
    setFormData({
      ...formData,
      [requirement]: currentRequirementData
    });
  };

  const renderRequirementForm = (requirement, index) => {
    const forms = {
      "Sensors": (
        <Box key={index} mt={4} p={4} borderWidth={1} borderRadius="md">
          <Text fontWeight="bold">Sensor {index + 1}:</Text>
          <Text>ID:</Text>
          <Input placeholder="Enter ID" mb={4} onChange={(e) => handleInputChange("Sensor", index, "id", e.target.value)} />
          <Text>Type:</Text>
          <Input placeholder="Enter the type of Sensor" mb={4} onChange={(e) => handleInputChange("Sensor", index, "type", e.target.value)} />
          <Text>Range:</Text>
          <Input placeholder="Enter Range (min, max, unit)" mb={4} onChange={(e) => handleInputChange("Sensor", index, "range", e.target.value)} />
          <Text>Resolution:</Text>
          <Input placeholder="Enter Resolution" mb={4} onChange={(e) => handleInputChange("Sensor", index, "resolution", e.target.value)} />
          <Text>Accuracy:</Text>
          <Input placeholder="Enter Accuracy" mb={4} onChange={(e) => handleInputChange("Sensor", index, "accuracy", e.target.value)} />
          <Text>Update Rate:</Text>
          <Input placeholder="Enter Update Rate" mb={4} onChange={(e) => handleInputChange("Sensor", index, "updateRate", e.target.value)} />
          <Button colorScheme="blue" size="sm" onClick={handleFileUpload}>Upload Image/Video of the Device</Button>
        </Box>
      ),

      "Actuators": (
        <Box key={index} mt={4} p={4} borderWidth={1} borderRadius="md">
          <Text fontWeight="bold">Actuator {index + 1}:</Text>
          <Text>ID:</Text>
          <Input placeholder="Enter ID" mb={4} onChange={(e) => handleInputChange("Actuators", index, "id", e.target.value)} />
          <Text>Type:</Text>
          <Input placeholder="Enter the type of Actuators" mb={4} onChange={(e) => handleInputChange("Actuators", index, "type", e.target.value)} />
          <Text>Range:</Text>
          <Input placeholder="Enter Range (min, max, unit)" mb={4} onChange={(e) => handleInputChange("Actuators", index, "range", e.target.value)} />
          <Text>Torque:</Text>
          <Input placeholder="Enter Torque" mb={4} onChange={(e) => handleInputChange("Actuators", index, "torque", e.target.value)} />
          <Text>Response Time:</Text>
          <Input placeholder="Enter Response Time" mb={4} onChange={(e) => handleInputChange("Actuators", index, "responseTime", e.target.value)} />
          <Text>Speed:</Text>
          <Input placeholder="Enter Speed" mb={4} onChange={(e) => handleInputChange("Actuators", index, "speed", e.target.value)} />
          <Button colorScheme="blue" size="sm" onClick={handleFileUpload}>Upload Image/Video of the Device</Button>
        </Box>
      ),

      "Microcontroller": (
        <Box key={index} mt={4} p={4} borderWidth={1} borderRadius="md">
          <Text fontWeight="bold">Microcontroller {index + 1}:</Text>
          <Text>ID:</Text>
          <Input placeholder="Enter ID" mb={4} onChange={(e) => handleInputChange("Microcontroller", index, "id", e.target.value)} />
          <Text>Type:</Text>
          <Input placeholder="Enter the type of Microcontroller" mb={4} onChange={(e) => handleInputChange("Microcontroller", index, "type", e.target.value)} />
          <Text>Processor:</Text>
          <Input placeholder="Enter Processor" mb={4} onChange={(e) => handleInputChange("Microcontroller", index, "processor", e.target.value)} />
          <Text>Memory:</Text>
          <Input placeholder="Enter Memory" mb={4} onChange={(e) => handleInputChange("Microcontroller", index, "memory", e.target.value)} />
          <Text>GPIO:</Text>
          <Input placeholder="Enter GPIO" mb={4} onChange={(e) => handleInputChange("Microcontroller", index, "gpio", e.target.value)} />
          <Text>Interfaces:</Text>
          <Input placeholder="Enter Interfaces" mb={4} onChange={(e) => handleInputChange("Microcontroller", index, "interfaces", e.target.value)} />
          <Text>Power Supply:</Text>
          <Input placeholder="Enter Power Supply" mb={4} onChange={(e) => handleInputChange("Microcontroller", index, "powerSupply", e.target.value)} />
          <Text>Dimensions:</Text>
          <Input placeholder="Enter Dimensions" mb={4} onChange={(e) => handleInputChange("Microcontroller", index, "dimensions", e.target.value)} />
          <Button colorScheme="blue" size="sm" onClick={handleFileUpload}>Upload Image/Video of the Device</Button>
        </Box>
      ),

      "Communication Module": (
        <Box key={index} mt={4} p={4} borderWidth={1} borderRadius="md">
          <Text fontWeight="bold">Communication Module {index + 1}:</Text>
          <Text>ID:</Text>
          <Input placeholder="Enter ID" mb={4} onChange={(e) => handleInputChange("Communication Module", index, "id", e.target.value)} />
          <Text>Type:</Text>
          <Input placeholder="Enter the type of Communication Module" mb={4} onChange={(e) => handleInputChange("Communication Module", index, "type", e.target.value)} />
          <Text>Range:</Text>
          <Input placeholder="Enter Range (min, max, unit)" mb={4} onChange={(e) => handleInputChange("Communication Module", index, "range", e.target.value)} />
          <Text>Power Supply:</Text>
          <Input placeholder="Enter Power Supply" mb={4} onChange={(e) => handleInputChange("Communication Module", index, "powerSupply", e.target.value)} />
          <Text>Data Rate:</Text>
          <Input placeholder="Enter Data Rate" mb={4} onChange={(e) => handleInputChange("Communication Module", index, "dataRate", e.target.value)} />
          <Text>Speed:</Text>
          <Input placeholder="Enter Speed" mb={4} onChange={(e) => handleInputChange("Communication Module", index, "speed", e.target.value)} />
          <Button colorScheme="blue" size="sm" onClick={handleFileUpload}>Upload Image/Video of the Device</Button>
        </Box>
      ),

      "Power Consumption": (
        <Box key={index} mt={4} p={4} borderWidth={1} borderRadius="md">
          <Text fontWeight="bold">Power Consumption {index + 1}:</Text>
          <Text>ID:</Text>
          <Input placeholder="Enter ID" mb={4} onChange={(e) => handleInputChange("Power Consumption", index, "id", e.target.value)} />
          <Text>Type:</Text>
          <Input placeholder="Enter the type of Power Consumption" mb={4} onChange={(e) => handleInputChange("Power Consumption", index, "type", e.target.value)} />
          <Text>Supply Voltage:</Text>
          <Input placeholder="Enter Supply Voltage" mb={2} onChange={(e) => handleInputChange("Power Consumption", index, "supplyVoltage1", e.target.value)} />
          <Input placeholder="Enter Supply Voltage" mb={2} onChange={(e) => handleInputChange("Power Consumption", index, "supplyVoltage2", e.target.value)} />
          <Text>Active Mode:</Text>
          <Input placeholder="Enter Active Mode" mb={4} onChange={(e) => handleInputChange("Power Consumption", index, "activeMode", e.target.value)} />
          <Text>Idle Mode:</Text>
          <Input placeholder="Enter Idle Mode" mb={4} onChange={(e) => handleInputChange("Power Consumption", index, "idleMode", e.target.value)} />
          <Text>Deep Sleep Mode:</Text>
          <Input placeholder="Enter Deep Sleep Mode" mb={4} onChange={(e) => handleInputChange("Power Consumption", index, "deepSleepMode", e.target.value)} />
          <Text>Peak Power Consumption:</Text>
          <Input placeholder="Enter Peak Power Consumption" mb={4} onChange={(e) => handleInputChange("Power Consumption", index, "peakPowerConsumption", e.target.value)} />
          <Text>Quiescent Current:</Text>
          <Input placeholder="Enter Quiescent Current" mb={4} onChange={(e) => handleInputChange("Power Consumption", index, "quiescentCurrent", e.target.value)} />
          <Button colorScheme="blue" size="sm" onClick={handleFileUpload}>Upload Image/Video of the Device</Button>
        </Box>
      ),

      "GPS Tracker": (
        <Box key={index} mt={4} p={4} borderWidth={1} borderRadius="md">
          <Text fontWeight="bold">GPS Tracker {index + 1}:</Text>
          <Text>ID:</Text>
          <Input placeholder="Enter ID" mb={4} onChange={(e) => handleInputChange("GPS Tracker", index, "id", e.target.value)} />
          <Text>Type:</Text>
          <Input placeholder="Enter the type of GPS Tracker" mb={4} onChange={(e) => handleInputChange("GPS Tracker", index, "type", e.target.value)} />
          <Text>Latitude:</Text>
          <Input placeholder="Enter Latitude" mb={4} onChange={(e) => handleInputChange("GPS Tracker", index, "latitude", e.target.value)} />
          <Text>Longitude:</Text>
          <Input placeholder="Enter Longitude" mb={4} onChange={(e) => handleInputChange("GPS Tracker", index, "longitude", e.target.value)} />
          <Text>Altitude:</Text>
          <Input placeholder="Enter Altitude" mb={4} onChange={(e) => handleInputChange("GPS Tracker", index, "altitude", e.target.value)} />
          <Text>Speed:</Text>
          <Input placeholder="Enter Speed" mb={4} onChange={(e) => handleInputChange("GPS Tracker", index, "speed", e.target.value)} />
          <Text>Time Stamp:</Text>
          <Input placeholder="Enter Time Stamp" mb={4} onChange={(e) => handleInputChange("GPS Tracker", index, "timeStamp", e.target.value)} />
          <Text>Satellite Count:</Text>
          <Input placeholder="Enter Satellite Count" mb={4} onChange={(e) => handleInputChange("GPS Tracker", index, "satelliteCount", e.target.value)} />
          <Button colorScheme="blue" size="sm" onClick={handleFileUpload}>Upload Image/Video of the Device</Button>
        </Box>
      ),

      "Amplifier": (
        <Box key={index} mt={4} p={4} borderWidth={1} borderRadius="md">
          <Text fontWeight="bold">Amplifier {index + 1}:</Text>
          <Text>ID:</Text>
          <Input placeholder="Enter ID" mb={4} onChange={(e) => handleInputChange("Amplifier", index, "id", e.target.value)} />
          <Text>Type:</Text>
          <Input placeholder="Enter the type of Amplifier" mb={4} onChange={(e) => handleInputChange("Amplifier", index, "type", e.target.value)} />
          <Text>Supply Voltage:</Text>
          <Input placeholder="Enter Supply Voltage" mb={4} onChange={(e) => handleInputChange("Amplifier", index, "supplyVoltage", e.target.value)} />
          <Text>Output Power:</Text>
          <Input placeholder="Enter Output Power" mb={4} onChange={(e) => handleInputChange("Amplifier", index, "outputPower", e.target.value)} />
          <Text>Gain:</Text>
          <Input placeholder="Enter Gain" mb={4} onChange={(e) => handleInputChange("Amplifier", index, "gain", e.target.value)} />
          <Text>Frequency Response:</Text>
          <Input placeholder="Enter Frequency Response" mb={4} onChange={(e) => handleInputChange("Amplifier", index, "frequencyResponse", e.target.value)} />
          <Text>Input Impedance:</Text>
          <Input placeholder="Enter Input Impedance" mb={4} onChange={(e) => handleInputChange("Amplifier", index, "inputImpedance", e.target.value)} />
          <Text>Output Impedance:</Text>
          <Input placeholder="Enter Output Impedance" mb={4} onChange={(e) => handleInputChange("Amplifier", index, "outputImpedance", e.target.value)} />
          <Button colorScheme="blue" size="sm" onClick={handleFileUpload}>Upload Image/Video of the Device</Button>
        </Box>
      ),

      "Medication Pods": (
        <Box key={index} mt={4} p={4} borderWidth={1} borderRadius="md">
          <Text fontWeight="bold">Medication Pod {index + 1}:</Text>
          <Text>ID:</Text>
          <Input placeholder="Enter ID" mb={4} onChange={(e) => handleInputChange("Medication Pods", index, "id", e.target.value)} />
          <Text>Type:</Text>
          <Input placeholder="Enter the type of Medication Pod" mb={4} onChange={(e) => handleInputChange("Medication Pods", index, "type", e.target.value)} />
          <Text>Dosage:</Text>
          <Input placeholder="Enter Dosage" mb={4} onChange={(e) => handleInputChange("Medication Pods", index, "dosage", e.target.value)} />
          <Text>Frequency:</Text>
          <Input placeholder="Enter Frequency" mb={4} onChange={(e) => handleInputChange("Medication Pods", index, "frequency", e.target.value)} />
          <Text>Time:</Text>
          <Input placeholder="Enter Time" mb={4} onChange={(e) => handleInputChange("Medication Pods", index, "time", e.target.value)} />
          <Text>Routes:</Text>
          <Input placeholder="Enter Routes" mb={4} onChange={(e) => handleInputChange("Medication Pods", index, "routes", e.target.value)} />
          <Button colorScheme="blue" size="sm" onClick={handleFileUpload}>Upload Image/Video of the Device</Button>
        </Box>
      ),
      // Add similar forms for other requirements...
      "Objects":
        (
          <Box key={index} mt={4} p={4} borderWidth={1} borderRadius="md">
            <Text fontWeight="bold">Object {index + 1}:</Text>
            <Input placeholder="Enter ID" mb={4} onChange={(e) => handleInputChange("Objects", index, "id", e.target.value)} />
            <Input placeholder="Enter the type of Object" mb={4} onChange={(e) => handleInputChange("Objects", index, "type", e.target.value)} />
            <Input placeholder="Enter Dimensions" mb={4} onChange={(e) => handleInputChange("Objects", index, "dimensions", e.target.value)} />
            <Input placeholder="Enter Shape" mb={4} onChange={(e) => handleInputChange("Objects", index, "shape", e.target.value)} />
            <Input placeholder="Enter Size" mb={4} onChange={(e) => handleInputChange("Objects", index, "size", e.target.value)} />
            <Input placeholder="Enter Weight Material" mb={4} onChange={(e) => handleInputChange("Objects", index, "weightMaterial", e.target.value)} />
            <Input placeholder="Enter Mechanical Strength" mb={4} onChange={(e) => handleInputChange("Objects", index, "mechanicalStrength", e.target.value)} />
            <Input placeholder="Enter Flexibility" mb={4} onChange={(e) => handleInputChange("Objects", index, "flexibility", e.target.value)} />
            <Input placeholder="Enter Texture" mb={4} onChange={(e) => handleInputChange("Objects", index, "texture", e.target.value)} />
            <Input placeholder="Enter Environmental Factor" mb={4} onChange={(e) => handleInputChange("Objects", index, "environmentalFactor", e.target.value)} />
            <Button colorScheme="blue" size="sm" onClick={handleFileUpload}>
              Upload Image/Video of the Device
            </Button>
          </Box>
        ),

      "Medication Lids": (
        <Box key={index} mt={4} p={4} borderWidth={1} borderRadius="md">
          <Text fontWeight="bold">Medication Lid {index + 1}:</Text>
          <Input placeholder="Enter ID" mb={4} onChange={(e) => handleInputChange("MedicationLids", index, "id", e.target.value)} />
          <Input placeholder="Enter the type of Medication Lid" mb={4} onChange={(e) => handleInputChange("MedicationLids", index, "type", e.target.value)} />
          <Input placeholder="Enter Dosage" mb={4} onChange={(e) => handleInputChange("MedicationLids", index, "dosage", e.target.value)} />
          <Input placeholder="Enter Frequency" mb={4} onChange={(e) => handleInputChange("MedicationLids", index, "frequency", e.target.value)} />
          <Input placeholder="Enter Time" mb={4} onChange={(e) => handleInputChange("MedicationLids", index, "time", e.target.value)} />
          <Input placeholder="Enter Routes" mb={4} onChange={(e) => handleInputChange("MedicationLids", index, "routes", e.target.value)} />
          <Button colorScheme="blue" size="sm" onClick={handleFileUpload}>
            Upload Image/Video of the Device
          </Button>
        </Box>
      ),

      "Speaker":
        (
          <Box key={index} mt={4} p={4} borderWidth={1} borderRadius="md">
            <Text fontWeight="bold">Speaker {index + 1}:</Text>
            <Input placeholder="Enter ID" mb={4} onChange={(e) => handleInputChange("Speaker", index, "id", e.target.value)} />
            <Input placeholder="Enter the type of Speaker" mb={4} onChange={(e) => handleInputChange("Speaker", index, "type", e.target.value)} />
            <Input placeholder="Enter Impedance" mb={4} onChange={(e) => handleInputChange("Speaker", index, "impedance", e.target.value)} />
            <Input placeholder="Enter RMS Power" mb={4} onChange={(e) => handleInputChange("Speaker", index, "rmsPower", e.target.value)} />
            <Input placeholder="Enter Peak Power" mb={4} onChange={(e) => handleInputChange("Speaker", index, "peakPower", e.target.value)} />
            <Input placeholder="Enter Sensitivity" mb={4} onChange={(e) => handleInputChange("Speaker", index, "sensitivity", e.target.value)} />
            <Input placeholder="Enter Cone Material" mb={4} onChange={(e) => handleInputChange("Speaker", index, "coneMaterial", e.target.value)} />
            <Input placeholder="Enter Environmental Rating" mb={4} onChange={(e) => handleInputChange("Speaker", index, "environmentalRating", e.target.value)} />
            <Button colorScheme="blue" size="sm" onClick={handleFileUpload}>
              Upload Image/Video of the Device
            </Button>
          </Box>
        ),

      "Display":
        (
          <Box key={index} mt={4} p={4} borderWidth={1} borderRadius="md">
            <Text fontWeight="bold">Display {index + 1}:</Text>
            <Input placeholder="Enter ID" mb={4} onChange={(e) => handleInputChange("Display", index, "id", e.target.value)} />
            <Input placeholder="Enter the type of Display" mb={4} onChange={(e) => handleInputChange("Display", index, "type", e.target.value)} />
            <Input placeholder="Enter Supply Voltage" mb={4} onChange={(e) => handleInputChange("Display", index, "supplyVoltage", e.target.value)} />
            <Input placeholder="Enter Active Mode" mb={4} onChange={(e) => handleInputChange("Display", index, "activeMode", e.target.value)} />
            <Input placeholder="Enter Idle Mode" mb={4} onChange={(e) => handleInputChange("Display", index, "idleMode", e.target.value)} />
            <Input placeholder="Enter Deep Sleep Mode" mb={4} onChange={(e) => handleInputChange("Display", index, "deepSleepMode", e.target.value)} />
            <Input placeholder="Enter Peak Power Consumption" mb={4} onChange={(e) => handleInputChange("Display", index, "peakPowerConsumption", e.target.value)} />
            <Input placeholder="Enter Quiescent Current" mb={4} onChange={(e) => handleInputChange("Display", index, "quiescentCurrent", e.target.value)} />
            <Button colorScheme="blue" size="sm" onClick={handleFileUpload}>
              Upload Image/Video of the Device
            </Button>
          </Box>
        ),

      "Light":
        (
          <Box key={index} mt={4} p={4} borderWidth={1} borderRadius="md">
            <Text fontWeight="bold">Light {index + 1}:</Text>
            <Input placeholder="Enter ID" mb={4} onChange={(e) => handleInputChange("Light", index, "id", e.target.value)} />
            <Input placeholder="Enter the type of Light" mb={4} onChange={(e) => handleInputChange("Light", index, "type", e.target.value)} />
            <Input placeholder="Enter On(1) || Off(0)" mb={4} onChange={(e) => handleInputChange("Light", index, "status", e.target.value)} />
            <Input placeholder="Enter Voltage" mb={4} onChange={(e) => handleInputChange("Light", index, "voltage", e.target.value)} />
            <Button colorScheme="blue" size="sm" onClick={handleFileUpload}>
              Upload Image/Video of the Device
            </Button>
          </Box>
        ),

      "Switch":
        (
          <Box key={index} mt={4} p={4} borderWidth={1} borderRadius="md">
            <Text fontWeight="bold">Light {index + 1}:</Text>
            <Input placeholder="Enter ID" mb={4} onChange={(e) => handleInputChange("Light", index, "id", e.target.value)} />
            <Input placeholder="Enter the type of Light" mb={4} onChange={(e) => handleInputChange("Light", index, "type", e.target.value)} />
            <Input placeholder="Enter On(1) || Off(0)" mb={4} onChange={(e) => handleInputChange("Light", index, "status", e.target.value)} />
            <Input placeholder="Enter Voltage" mb={4} onChange={(e) => handleInputChange("Light", index, "voltage", e.target.value)} />
            <Button colorScheme="blue" size="sm" onClick={handleFileUpload}>
              Upload Image/Video of the Device
            </Button>
          </Box>
        ),
      // ends..... 
    };

    return forms[requirement] || null;
  };

  const renderCurrentStep = () => {
    const currentRequirement = selectedRequirements[currentStep];
    const requirementData = formData[currentRequirement] || [{}];

    return (
      <Box>
        <Text fontSize="2xl" mb={4}>{currentRequirement}</Text>
        <VStack spacing={4} align="stretch">
          {requirementData.map((_, index) => renderRequirementForm(currentRequirement, index))}
          <Button leftIcon={<AddIcon />} onClick={() => handleAddMore(currentRequirement)}>
            Add Another {currentRequirement}
          </Button>
        </VStack>
      </Box>
    );
  };

  //   return (
  //     <Box display="flex" flexDirection="column" minH="110vh">
  //       <Box flex="1" p={4}>
  //         <IconButton
  //           aria-label="Toggle Theme"
  //           icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
  //           onClick={toggleColorMode}
  //           position="absolute"
  //           top="1rem"
  //           right="1rem"
  //         />

  //         {currentScreen === "requirements" ? (
  //           <Box textAlign="center" mt={12}>
  //             <Button onClick={onOpen} colorScheme="blue">Define Product Requirements</Button>
  //             <Modal isOpen={isOpen} onClose={onClose}>
  //               <ModalOverlay />
  //               <ModalContent>
  //                 <ModalHeader>Choose Your Product Requirements</ModalHeader>
  //                 <ModalCloseButton />
  //                 <ModalBody>
  //                   <Grid templateColumns="repeat(2, 1fr)" gap={4}>
  //                     {requirements.map((requirement, index) => (
  //                       <Checkbox
  //                         key={index}
  //                         isChecked={selectedRequirements.includes(requirement)}
  //                         onChange={() => handleCheckboxChange(requirement)}
  //                       >
  //                         {requirement}
  //                       </Checkbox>
  //                     ))}
  //                   </Grid>
  //                 </ModalBody>
  //                 <ModalFooter>
  //                   <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
  //                   <Button
  //                     colorScheme="blue"
  //                     onClick={handleNext}
  //                     isDisabled={selectedRequirements.length === 0}
  //                   >
  //                     Next
  //                   </Button>
  //                 </ModalFooter>
  //               </ModalContent>
  //             </Modal>
  //           </Box>
  //         ) : (
  //           <Box>
  //             {renderCurrentStep()}
  //             <HStack mt={4} spacing={4}>
  //               <Button colorScheme="gray" onClick={handleBack}>Back</Button>
  //               {currentStep < selectedRequirements.length - 1 ? (
  //                 <Button colorScheme="blue" onClick={handleNext}>Next</Button>
  //               ) : (
  //                 // <Button colorScheme="green" onClick={() => console.log(formData)}>Submit</Button>
  //                 <DefineProductTwo/>
  //               )}
  //             </HStack>
  //           </Box>
  //         )}
  //       </Box>
  //       <Footer />

  //     </Box>
  //   );
  // };

  // export default DefineProduct;

  return (
    <Box display="flex" flexDirection="column" minH="110vh">
      <Box flex="1" p={4}>
        <IconButton
          aria-label="Toggle Theme"
          icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          onClick={toggleColorMode}
          position="absolute"
          top="1rem"
          right="1rem"
        />

        {currentScreen === "requirements" ? (
          <Box textAlign="center" mt={12}>
            <Modal isOpen={true} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Choose Your Product Requirements</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                    {requirements.map((requirement, index) => (
                      <Checkbox
                        key={index}
                        isChecked={selectedRequirements.includes(requirement)}
                        onChange={() => handleCheckboxChange(requirement)}
                      >
                        {requirement}
                      </Checkbox>
                    ))}
                  </Grid>
                </ModalBody>
                <ModalFooter>
                  <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                  <Button
                    colorScheme="blue"
                    onClick={handleNext}
                    isDisabled={selectedRequirements.length === 0}
                  >
                    Next
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </Box>
        ) : (
          <Box>
            {renderCurrentStep()}
            <HStack mt={4} spacing={4}>
              <Button colorScheme="gray" onClick={handleBack}>Back</Button>
              {currentStep < selectedRequirements.length - 1 ? (
                <Button colorScheme="blue" onClick={handleNext}>Next</Button>
              ) : (
                <DefineProductTwo />
              )}
            </HStack>
          </Box>
        )}
      </Box>
      <Footer />
    </Box>
  );
};

export default DefineProduct;