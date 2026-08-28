// import React, { useState } from 'react';
import { API } from '@/config';
// import {
//   Button,
//   HStack,
//   useToast,
//   Box,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   FormControl,
//   FormLabel,
//   Input,
// } from '@chakra-ui/react';
// import { useProject } from "../ProjectContext";

// const DeviceControlButtons = () => {
//   const [isRunning, setIsRunning] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalAction, setModalAction] = useState('start');
//   const [deviceId, setDeviceId] = useState('');
//   const toast = useToast();

//   // Get activeProductId from the project context
//   const { activeProductId } = useProject();

//   const handleStartClick = () => {
//     if (!activeProductId) {
//       toast({
//         title: 'Error',
//         description: 'No active product selected',
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }

//     setModalAction('start');
//     setIsModalOpen(true);
//   };

//   const handleStopClick = () => {
//     if (!activeProductId) {
//       toast({
//         title: 'Error',
//         description: 'No active product selected',
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }

//     if (!deviceId) {
//       toast({
//         title: 'Error',
//         description: 'No active device to stop',
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }

//     setModalAction('stop');
//     setIsModalOpen(true);
//   };

//   const handleSubmit = async () => {
//     if (!activeProductId) {
//       toast({
//         title: 'Error',
//         description: 'No active product selected',
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }

//     try {
//       if (modalAction === 'start') {
//         const createdDeviceId = await createDevices(activeProductId);
//         if (createdDeviceId) {
//           setDeviceId(createdDeviceId);
//           await controlDevices('start', activeProductId, createdDeviceId);
//           setIsRunning(true);
//         }
//       } else if (modalAction === 'stop') {
//         if (deviceId) {
//           await controlDevices('stop', activeProductId, deviceId);
//           setIsRunning(false);
//         }
//       }
//       setIsModalOpen(false);
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: error.message || `Failed to ${modalAction} device`,
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//     }
//   };

//   const createDevices = async (productId) => {
//     try {
//       const response = await fetch(
//         `${API.MAIN}/product/${productId}/devices`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ deviceCount: 1 }),
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Failed to create device: ${response.statusText}`);
//       }

//       const data = await response.json();
//       const createdDeviceId = data.addedDevices[0];

//       toast({
//         title: 'Device Created Successfully',
//         description: `Device ID: ${createdDeviceId}`,
//         status: 'success',
//         duration: 3000,
//         isClosable: true,
//       });

//       return createdDeviceId;
//     } catch (error) {
//       console.error('Error creating device:', error);
//       throw error;
//     }
//   };

//   const controlDevices = async (action, productId, devId) => {
//     try {
//       const response = await fetch(
//         `${API.MAIN}/product/${productId}/devices/control`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ 
//             devices: [{ deviceID: devId, action }] 
//           }),
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Failed to ${action} device: ${response.statusText}`);
//       }

//       const data = await response.json();

//       toast({
//         title: `Device ${action === 'start' ? 'Started' : 'Stopped'}`,
//         description: data.message || `Device ${action} command sent`,
//         status: 'info',
//         duration: 3000,
//         isClosable: true,
//       });

//       return data;
//     } catch (error) {
//       console.error(`Error ${action}ing device:`, error);
//       throw error;
//     }
//   };

//   return (
//     <Box>
//       <HStack spacing={2}>
//         <Button 
//           colorScheme="green" 
//           size="sm" 
//           onClick={handleStartClick}
//           isDisabled={isRunning || !activeProductId}
//         >
//           Start
//         </Button>
//         <Button 
//           colorScheme="red" 
//           size="sm" 
//           onClick={handleStopClick}
//           isDisabled={!isRunning || !deviceId}
//         >
//           Stop
//         </Button>
//         <Button size="sm" colorScheme={isRunning ? 'teal' : 'gray'}>
//           {isRunning ? 'Running' : 'Paused'}
//         </Button>
//       </HStack>

//       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>Confirm Device {modalAction === 'start' ? 'Start' : 'Stop'}</ModalHeader>
//           <ModalBody>
//             <FormControl>
//               <FormLabel>Product ID</FormLabel>
//               <Input
//                 type="text"
//                 value={activeProductId || ''}
//                 isReadOnly
//                 placeholder="Active Product ID"
//               />
//             </FormControl>
//             {deviceId && (
//               <FormControl mt={4}>
//                 <FormLabel>Device ID</FormLabel>
//                 <Input
//                   type="text"
//                   value={deviceId}
//                   isReadOnly
//                   placeholder="Device ID"
//                 />
//               </FormControl>
//             )}
//           </ModalBody>
//           <ModalFooter>
//             <Button colorScheme={modalAction === 'start' ? 'green' : 'red'} onClick={handleSubmit}>
//               {modalAction === 'start' ? 'Start Device' : 'Stop Device'}
//             </Button>
//             <Button onClick={() => setIsModalOpen(false)} ml={3}>
//               Cancel
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </Box>
//   );
// };

// export default DeviceControlButtons;











// import React, { useState, useEffect } from 'react';
// import {
//   Button,
//   HStack,
//   useToast,
//   Box,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   FormControl,
//   FormLabel,
//   Input,
// } from '@chakra-ui/react';
// import { useProject } from "../ProjectContext";

// const DeviceControlButtons = () => {
//   const [isRunning, setIsRunning] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalAction, setModalAction] = useState('start');
//   const [deviceId, setDeviceId] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const toast = useToast();

//   // Get activeProductId from the project context
//   const { activeProductId } = useProject();

//   // Check for running devices when product ID changes
//   useEffect(() => {
//     if (activeProductId) {
//       checkForExistingDevices(activeProductId);
//     } else {
//       // Reset device state when no product is selected
//       setDeviceId('');
//       setIsRunning(false);
//     }
//   }, [activeProductId]);

//   // Check if there are any existing devices for this product
//   const checkForExistingDevices = async (productId) => {
//     setIsLoading(true);
//     try {
//       const { needToCreateDevice, existingDeviceId, isDeviceRunning } = await checkRunningDevices(productId);

//       if (!needToCreateDevice && existingDeviceId) {
//         setDeviceId(existingDeviceId);
//         setIsRunning(isDeviceRunning);
//       } else {
//         setDeviceId('');
//         setIsRunning(false);
//       }
//     } catch (error) {
//       console.error('Error checking for existing devices:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleStartClick = () => {
//     if (!activeProductId) {
//       toast({
//         title: 'Error',
//         description: 'No active product selected',
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }

//     setModalAction('start');
//     setIsModalOpen(true);
//   };

//   const handleStopClick = () => {
//     if (!activeProductId) {
//       toast({
//         title: 'Error',
//         description: 'No active product selected',
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }

//     if (!deviceId) {
//       toast({
//         title: 'Error',
//         description: 'No active device to stop',
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }

//     setModalAction('stop');
//     setIsModalOpen(true);
//   };

//   const checkRunningDevices = async (productId) => {
//     try {
//       const response = await fetch(
//         `${API.MAIN}/devices/running?productId=${productId}`,
//         {
//           method: 'GET',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );

//       // Handle non-JSON responses
//       const contentType = response.headers.get("content-type");
//       if (!contentType || !contentType.includes("application/json")) {
//         console.error("Received non-JSON response:", await response.text());
//         return { needToCreateDevice: true, error: "Received non-JSON response" };
//       }

//       const data = await response.json();

//       if (!response.ok) {
//         // If we get an error with specific message, we need to create a device
//         if (data.message === "please create device for this product") {
//           return { needToCreateDevice: true };
//         }
//         throw new Error(data.message || `Failed to check running devices`);
//       }

//       // If we have running devices, get the first one
//       if (data.devices && data.devices.length > 0) {
//         return { 
//           needToCreateDevice: false, 
//           existingDeviceId: data.devices[0].deviceID,
//           isDeviceRunning: true
//         };
//       }

//       // No running devices, but we need to check if there are any devices at all
//       // This is a new addition to check for stopped devices too
//       const allDevicesResponse = await fetch(
//         `${API.MAIN}/product/${productId}/devices`,
//         {
//           method: 'GET',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );

//       if (allDevicesResponse.ok) {
//         const allDevicesData = await allDevicesResponse.json();
//         if (allDevicesData.devices && allDevicesData.devices.length > 0) {
//           return {
//             needToCreateDevice: false,
//             existingDeviceId: allDevicesData.devices[0].deviceID,
//             isDeviceRunning: false
//           };
//         }
//       }

//       // No devices found, need to create one
//       return { needToCreateDevice: true };
//     } catch (error) {
//       console.error('Error checking running devices:', error);
//       // Assume we need to create a device if there's an error
//       return { needToCreateDevice: true, error: error.message };
//     }
//   };

//   const handleSubmit = async () => {
//     if (!activeProductId) {
//       toast({
//         title: 'Error',
//         description: 'No active product selected',
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }

//     setIsLoading(true);
//     try {
//       if (modalAction === 'start') {
//         let deviceToUse = deviceId;

//         // If we don't have a device ID yet, check if there are existing devices
//         if (!deviceToUse) {
//           const { needToCreateDevice, existingDeviceId, error } = await checkRunningDevices(activeProductId);

//           if (error) {
//             toast({
//               title: 'Warning',
//               description: `Error checking running devices: ${error}. Proceeding with device creation.`,
//               status: 'warning',
//               duration: 3000,
//               isClosable: true,
//             });
//           }

//           if (!needToCreateDevice && existingDeviceId) {
//             // Use existing device
//             deviceToUse = existingDeviceId;
//             setDeviceId(existingDeviceId);

//             toast({
//               title: 'Using Existing Device',
//               description: `Device ID: ${existingDeviceId}`,
//               status: 'info',
//               duration: 3000,
//               isClosable: true,
//             });
//           } else {
//             // Create new device only if one doesn't exist
//             deviceToUse = await createDevices(activeProductId);
//             if (deviceToUse) {
//               setDeviceId(deviceToUse);
//             } else {
//               throw new Error('Failed to create device');
//             }
//           }
//         }

//         // Start the device
//         if (deviceToUse) {
//           await controlDevices('start', activeProductId, deviceToUse);
//           setIsRunning(true);
//         }
//       } else if (modalAction === 'stop') {
//         if (deviceId) {
//           await controlDevices('stop', activeProductId, deviceId);
//           setIsRunning(false);
//         }
//       }
//       setIsModalOpen(false);
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: error.message || `Failed to ${modalAction} device`,
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const createDevices = async (productId) => {
//     try {
//       const response = await fetch(
//         `${API.MAIN}/product/${productId}/devices`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ deviceCount: 1 }),
//         }
//       );

//       // Check if the response is valid JSON
//       const contentType = response.headers.get("content-type");
//       if (!contentType || !contentType.includes("application/json")) {
//         const responseText = await response.text();
//         console.error("Received non-JSON response:", responseText);
//         throw new Error("Received non-JSON response from server");
//       }

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || `Failed to create device: ${response.statusText}`);
//       }

//       const createdDeviceId = data.addedDevices[0];

//       toast({
//         title: 'Device Created Successfully',
//         description: `Device ID: ${createdDeviceId}`,
//         status: 'success',
//         duration: 3000,
//         isClosable: true,
//       });

//       return createdDeviceId;
//     } catch (error) {
//       console.error('Error creating device:', error);
//       throw error;
//     }
//   };

//   const controlDevices = async (action, productId, devId) => {
//     try {
//       const response = await fetch(
//         `${API.MAIN}/product/${productId}/devices/control`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ 
//             devices: [{ deviceID: devId, action }] 
//           }),
//         }
//       );

//       // Check if the response is valid JSON
//       const contentType = response.headers.get("content-type");
//       if (!contentType || !contentType.includes("application/json")) {
//         const responseText = await response.text();
//         console.error("Received non-JSON response:", responseText);
//         throw new Error("Received non-JSON response from server");
//       }

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || `Failed to ${action} device: ${response.statusText}`);
//       }

//       toast({
//         title: `Device ${action === 'start' ? 'Started' : 'Stopped'}`,
//         description: data.message || `Device ${action} command sent`,
//         status: 'info',
//         duration: 3000,
//         isClosable: true,
//       });

//       return data;
//     } catch (error) {
//       console.error(`Error ${action}ing device:`, error);
//       throw error;
//     }
//   };

//   return (
//     <Box>
//       <HStack spacing={2}>
//         <Button 
//           colorScheme="green" 
//           size="sm" 
//           onClick={handleStartClick}
//           isDisabled={isRunning || !activeProductId || isLoading}
//           isLoading={isLoading && modalAction === 'start'}
//         >
//           Start
//         </Button>
//         <Button 
//           colorScheme="red" 
//           size="sm" 
//           onClick={handleStopClick}
//           isDisabled={!isRunning || !deviceId || isLoading}
//           isLoading={isLoading && modalAction === 'stop'}
//         >
//           Stop
//         </Button>
//         <Button size="sm" colorScheme={isRunning ? 'teal' : 'gray'}>
//           {isRunning ? 'Running' : 'Paused'}
//         </Button>
//       </HStack>

//       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>Confirm Device {modalAction === 'start' ? 'Start' : 'Stop'}</ModalHeader>
//           <ModalBody>
//             <FormControl>
//               <FormLabel>Product ID</FormLabel>
//               <Input
//                 type="text"
//                 value={activeProductId || ''}
//                 isReadOnly
//                 placeholder="Active Product ID"
//               />
//             </FormControl>
//             {deviceId && (
//               <FormControl mt={4}>
//                 <FormLabel>Device ID</FormLabel>
//                 <Input
//                   type="text"
//                   value={deviceId}
//                   isReadOnly
//                   placeholder="Device ID"
//                 />
//               </FormControl>
//             )}
//           </ModalBody>
//           <ModalFooter>
//             <Button 
//               colorScheme={modalAction === 'start' ? 'green' : 'red'} 
//               onClick={handleSubmit}
//               isLoading={isLoading}
//             >
//               {modalAction === 'start' ? 'Start Device' : 'Stop Device'}
//             </Button>
//             <Button onClick={() => setIsModalOpen(false)} ml={3}>
//               Cancel
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </Box>
//   );
// };

// export default DeviceControlButtons;





// import React, { useState, useEffect } from 'react';
// import {
//   Button,
//   HStack,
//   useToast,
//   Box,
// } from '@chakra-ui/react';
// import { useProject } from "../ProjectContext";

// const DeviceControlButtons = () => {
//   const [isRunning, setIsRunning] = useState(false);
//   const [deviceId, setDeviceId] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const toast = useToast();

//   // Get activeProductId from the project context
//   const { activeProductId } = useProject();

//   // Check for running devices when product ID changes
//   useEffect(() => {
//     if (activeProductId) {
//       checkForExistingDevices(activeProductId);
//     } else {
//       // Reset device state when no product is selected
//       setDeviceId('');
//       setIsRunning(false);
//     }
//   }, [activeProductId]);

//   // Check if there are any existing devices for this product
//   const checkForExistingDevices = async (productId) => {
//     setIsLoading(true);
//     try {
//       const { needToCreateDevice, existingDeviceId, isDeviceRunning } = await checkRunningDevices(productId);

//       if (!needToCreateDevice && existingDeviceId) {
//         setDeviceId(existingDeviceId);
//         setIsRunning(isDeviceRunning);
//       } else {
//         setDeviceId('');
//         setIsRunning(false);
//       }
//     } catch (error) {
//       console.error('Error checking for existing devices:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleStartClick = async () => {
//     if (!activeProductId) {
//       toast({
//         title: 'Error',
//         description: 'No active product selected',
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }

//     setIsLoading(true);
//     try {
//       let deviceToUse = deviceId;

//       // If we don't have a device ID yet, check if there are existing devices
//       if (!deviceToUse) {
//         const { needToCreateDevice, existingDeviceId } = await checkRunningDevices(activeProductId);

//         if (!needToCreateDevice && existingDeviceId) {
//           // Use existing device
//           deviceToUse = existingDeviceId;
//           setDeviceId(existingDeviceId);

//           toast({
//             title: 'Using Existing Device',
//             description: `Device ID: ${existingDeviceId}`,
//             status: 'info',
//             duration: 3000,
//             isClosable: true,
//           });
//         } else {
//           // Create new device only if one doesn't exist
//           deviceToUse = await createDevices(activeProductId);
//           if (deviceToUse) {
//             setDeviceId(deviceToUse);
//           } else {
//             throw new Error('Failed to create device');
//           }
//         }
//       }

//       // Start the device
//       if (deviceToUse) {
//         await controlDevices('start', activeProductId, deviceToUse);
//         setIsRunning(true);
//       }
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: error.message || 'Failed to start device',
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleStopClick = async () => {
//     if (!activeProductId) {
//       toast({
//         title: 'Error',
//         description: 'No active product selected',
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }

//     if (!deviceId) {
//       toast({
//         title: 'Error',
//         description: 'No active device to stop',
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }

//     setIsLoading(true);
//     try {
//       await controlDevices('stop', activeProductId, deviceId);
//       setIsRunning(false);
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: error.message || 'Failed to stop device',
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const checkRunningDevices = async (productId) => {
//     try {
//       const response = await fetch(
//         `${API.MAIN}/devices/running?productId=${productId}`,
//         {
//           method: 'GET',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         // If we get an error with specific message, we need to create a device
//         if (data.message === "please create device for this product") {
//           return { needToCreateDevice: true };
//         }
//         throw new Error(data.message || `Failed to check running devices`);
//       }

//       // If we have running devices, get the first one
//       if (data.devices && data.devices.length > 0) {
//         return { 
//           needToCreateDevice: false, 
//           existingDeviceId: data.devices[0].deviceID,
//           isDeviceRunning: true
//         };
//       }

//       // No running devices, but we need to check if there are any devices at all
//       const allDevicesResponse = await fetch(
//         `${API.MAIN}/product/${productId}/devices`,
//         {
//           method: 'GET',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );

//       if (allDevicesResponse.ok) {
//         const allDevicesData = await allDevicesResponse.json();
//         if (allDevicesData.devices && allDevicesData.devices.length > 0) {
//           return {
//             needToCreateDevice: false,
//             existingDeviceId: allDevicesData.devices[0].deviceID,
//             isDeviceRunning: false
//           };
//         }
//       }

//       // No devices found, need to create one
//       return { needToCreateDevice: true };
//     } catch (error) {
//       console.error('Error checking running devices:', error);
//       // Assume we need to create a device if there's an error
//       return { needToCreateDevice: true, error: error.message };
//     }
//   };

//   const createDevices = async (productId) => {
//     try {
//       const response = await fetch(
//         `${API.MAIN}/product/${productId}/devices`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ deviceCount: 1 }),
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || `Failed to create device: ${response.statusText}`);
//       }

//       const createdDeviceId = data.addedDevices[0];

//       toast({
//         title: 'Device Created Successfully',
//         description: `Device ID: ${createdDeviceId}`,
//         status: 'success',
//         duration: 3000,
//         isClosable: true,
//       });

//       return createdDeviceId;
//     } catch (error) {
//       console.error('Error creating device:', error);
//       throw error;
//     }
//   };

//   const controlDevices = async (action, productId, devId) => {
//     try {
//       const response = await fetch(
//         `${API.MAIN}/product/${productId}/devices/control`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ 
//             devices: [{ deviceID: devId, action }] 
//           }),
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || `Failed to ${action} device: ${response.statusText}`);
//       }

//       toast({
//         title: `Device ${action === 'start' ? 'Started' : 'Stopped'}`,
//         description: data.message || `Device ${action} command sent`,
//         status: 'info',
//         duration: 3000,
//         isClosable: true,
//       });

//       return data;
//     } catch (error) {
//       console.error(`Error ${action}ing device:`, error);
//       throw error;
//     }
//   };

//   return (
//     <Box>
//       <HStack spacing={2}>
//         <Button 
//           colorScheme="green" 
//           size="sm" 
//           onClick={handleStartClick}
//           isDisabled={isRunning || !activeProductId || isLoading}
//           isLoading={isLoading && !isRunning}
//         >
//           Start
//         </Button>
//         <Button 
//           colorScheme="red" 
//           size="sm" 
//           onClick={handleStopClick}
//           isDisabled={!isRunning || !deviceId || isLoading}
//           isLoading={isLoading && isRunning}
//         >
//           Stop
//         </Button>
//         <Button size="sm" colorScheme={isRunning ? 'teal' : 'gray'}>
//           {isRunning ? 'Running' : 'Paused'}
//         </Button>
//       </HStack>
//     </Box>
//   );
// };

// export default DeviceControlButtons;




import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Stack,
  useToast,
  Box,
  Button,
} from '@chakra-ui/react';
import { FaPlay, FaStop } from 'react-icons/fa';
import { useProject } from "../ProjectContext";
import { baseURL, productAPIBase } from "../utilities";

const DeviceControlButtons = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Get activeProductId from the project context
  const { activeProductId, activeDeviceId } = useProject();

  // Check for running devices when product ID changes
  useEffect(() => {
    if (activeProductId) {
      if (activeDeviceId) {
        setDeviceId(activeDeviceId);
        // Optionally check if it's running, but for now we assume it's available
      }
      checkForExistingDevices(activeProductId);
    } else {
      // Reset device state when no product is selected
      setDeviceId('');
      setIsRunning(false);
    }
  }, [activeProductId, activeDeviceId]);

  // Check if there are any existing devices for this product
  const checkForExistingDevices = async (productId) => {
    setIsLoading(true);
    try {
      const { needToCreateDevice, existingDeviceId, isDeviceRunning } = await checkRunningDevices(productId);

      if (!needToCreateDevice && existingDeviceId) {
        setDeviceId(existingDeviceId);
        setIsRunning(isDeviceRunning);
      } else {
        // If no running device found, fall back to activeDeviceId from context if available
        if (activeDeviceId) {
          setDeviceId(activeDeviceId);
          setIsRunning(false);
        } else {
          setDeviceId('');
          setIsRunning(false);
        }
      }
    } catch (error) {
      console.error('Error checking for existing devices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartClick = async () => {
    if (!activeProductId) {
      toast({
        title: 'Error',
        description: 'No active product selected',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      let deviceToUse = deviceId;

      // If we don't have a device ID yet, check if there are existing devices
      if (!deviceToUse) {
        const { needToCreateDevice, existingDeviceId } = await checkRunningDevices(activeProductId);

        if (!needToCreateDevice && existingDeviceId) {
          // Use existing device
          deviceToUse = existingDeviceId;
          setDeviceId(existingDeviceId);

          toast({
            title: 'Using Existing Device',
            description: `Device ID: ${existingDeviceId}`,
            status: 'info',
            duration: 3000,
            isClosable: true,
          });
        } else {
          // Create new device only if one doesn't exist
          // Device creation is disabled as API was removed
          throw new Error('No available device found and creation is disabled');
        }
      }

      // Start the device
      if (deviceToUse) {
        await controlDevices('start', activeProductId, deviceToUse);
        setIsRunning(true);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start device',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopClick = async () => {
    if (!activeProductId) {
      toast({
        title: 'Error',
        description: 'No active product selected',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!deviceId) {
      toast({
        title: 'Error',
        description: 'No active device to stop',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      await controlDevices('stop', activeProductId, deviceId);
      setIsRunning(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to stop device',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkRunningDevices = async (productId) => {
    try {
      const response = await fetch(
        `${baseURL}/devices/running`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productID: productId })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // If we get an error with specific message, we need to create a device
        if (data.message === "please create device for this product" || data.message === "please created device for this product") {
          return { needToCreateDevice: true };
        }
        throw new Error(data.message || `Failed to check running devices`);
      }

      // If we have running devices, get the first one
      if (data.devices && data.devices.length > 0) {
        return {
          needToCreateDevice: false,
          existingDeviceId: data.devices[0].deviceID,
          isDeviceRunning: true
        };
      }

      // Check if there are any devices at all (including stopped)
      try {
        const allDevicesResponse = await fetch(
          `${baseURL}/product/${productId}/devices`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (allDevicesResponse.ok) {
          const allDevicesData = await allDevicesResponse.json();
          // Extract devices array handling different possible API response structures
          let devicesList = [];
          if (Array.isArray(allDevicesData)) devicesList = allDevicesData;
          else if (allDevicesData.devices) devicesList = allDevicesData.devices;
          else if (allDevicesData.data) devicesList = allDevicesData.data;

          if (devicesList && devicesList.length > 0) {
            return {
              needToCreateDevice: false,
              existingDeviceId: typeof devicesList[0] === 'string' ? devicesList[0] : devicesList[0].deviceID || devicesList[0].id,
              isDeviceRunning: false
            };
          }
        }
      } catch (err) {
        console.warn("Failed to fetch all devices fallback:", err);
      }


      // No devices found, need to create one
      return { needToCreateDevice: true };
    } catch (error) {
      console.error('Error checking running devices:', error);
      // Assume we need to create a device if there's an error
      return { needToCreateDevice: true, error: error.message };
    }
  };



  const controlDevices = async (action, productId, devId) => {
    try {
      const response = await fetch(
        `${baseURL}/product/${productId}/devices/control`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            devices: [{ deviceID: devId, action }]
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${action} device: ${response.statusText}`);
      }

      toast({
        title: `Device ${action === 'start' ? 'Started' : 'Stopped'}`,
        description: data.message || `Device ${action} command sent`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });

      return data;
    } catch (error) {
      console.error(`Error ${action}ing device:`, error);
      throw error;
    }
  };

  return (
    <Box>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={3} alignItems="center">
        <IconButton
          icon={<FaPlay />}
          bg="#2F855A"
          _hover={{ bg: "#276749" }}
          color="white"
          size="sm"
          borderRadius="md"
          aria-label="Start device"
          onClick={handleStartClick}
          isDisabled={isRunning || !activeProductId || isLoading}
          isLoading={isLoading && !isRunning}
        />
        <IconButton
          icon={<FaStop />}
          bg="#C53030"
          _hover={{ bg: "#9B2C2C" }}
          color="white"
          size="sm"
          borderRadius="md"
          aria-label="Stop device"
          onClick={handleStopClick}
          isDisabled={!isRunning || !deviceId || isLoading}
          isLoading={isLoading && isRunning}
        />
        <Button
          size="sm"
          bg="white"
          color="black"
          borderRadius="full"
          height="32px"
          px={4}
          fontSize="xs"
          fontWeight="bold"
          _hover={{ bg: "gray.100" }}
          boxShadow="sm"
        >
          {isRunning ? 'Running' : 'Paused'}
        </Button>
      </Stack>
    </Box>
  );
};

export default DeviceControlButtons;