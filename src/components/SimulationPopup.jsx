// import React, { useState, useEffect } from 'react';
import { API } from '@/config';
// import {
//   Button,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalFooter,
//   ModalBody,
//   ModalCloseButton,
//   Textarea,
//   useDisclosure,
//   Box,
//   FormControl,
//   FormLabel,
//   Input,
//   VStack,
//   useToast,
//   Text,
//   Flex,
//   Progress,
//   Stack
// } from '@chakra-ui/react';
// import { FaExpand, FaCompress } from 'react-icons/fa';

// const SimulationPopup = ({ children }) => {
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const [isFullScreen, setIsFullScreen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const toast = useToast();

//   // Form state
//   const [formData, setFormData] = useState({
//     userId: '',
//     projectName: '',
//     description: '',
//     folderName: '',
//     fileName: '',
//     code: ''
//   });

//   // Step state
//   const [currentStep, setCurrentStep] = useState(1);
//   const totalSteps = 3;

//   // Load user data on mount
//   useEffect(() => {
//     const userId = sessionStorage.getItem('userId');
//     if (!userId) {
//       toast({
//         title: 'Missing Data',
//         description: 'User ID is missing. Please ensure you are properly logged in.',
//         status: 'error',
//         duration: 5000,
//         isClosable: true,
//       });
//       return;
//     }
//     setFormData(prev => ({ ...prev, userId }));
//   }, [toast]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const createProject = async () => {
//     if (!formData.projectName.trim() || !formData.description.trim()) {
//       toast({
//         title: 'Error',
//         description: 'Please fill in all project details',
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//       return false;
//     }

//     try {
//       const response = await fetch(`${API.MAIN}/api/v1/addProjects`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           projectName: formData.projectName,
//           description: formData.description,
//           userId: formData.userId
//         }),
//       });

//       const data = await response.json();
//       if (data.status === 'success') {
//         sessionStorage.setItem('projectId', data.projectData.projectId);
//         return true;
//       }
//       throw new Error(data.message || 'Failed to create project');
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: error.message,
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//       return false;
//     }
//   };

//   const createFolder = async () => {
//     if (!formData.folderName.trim()) {
//       toast({
//         title: 'Error',
//         description: 'Please enter a folder name',
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//       return false;
//     }

//     const projectId = sessionStorage.getItem('projectId');
//     try {
//       const response = await fetch(`${API.MAIN}/api/v1/createFolders`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           folderName: formData.folderName,
//           projectId,
//           parentFolderId: null
//         }),
//       });

//       const data = await response.json();
//       if (data.status === 'success') {
//         sessionStorage.setItem('folderId', data.folderData.folderId);
//         return true;
//       }
//       throw new Error(data.message || 'Failed to create folder');
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: error.message,
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//       return false;
//     }
//   };

//   const createFile = async () => {
//     if (!formData.fileName.trim() || !formData.code.trim()) {
//       toast({
//         title: 'Error',
//         description: 'Please enter both file name and code',
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//       return false;
//     }

//     const projectId = sessionStorage.getItem('projectId');
//     const folderId = sessionStorage.getItem('folderId');

//     try {
//       const response = await fetch(`${API.MAIN}/api/v1/createFiles`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           fileName: `${formData.fileName}.json`,
//           content: formData.code,
//           folderId,
//           projectId,
//         }),
//       });

//       const data = await response.json();
//       if (data.status === 'success') {
//         sessionStorage.setItem('fileId', data.fileData.fileId);
//         return true;
//       }
//       throw new Error(data.message || 'Failed to create file');
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: error.message,
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//       return false;
//     }
//   };

//   const handleNext = async () => {
//     setIsLoading(true);
//     let success = false;

//     switch (currentStep) {
//       case 1:
//         success = await createProject();
//         break;
//       case 2:
//         success = await createFolder();
//         break;
//       case 3:
//         success = await createFile();
//         if (success) {
//           toast({
//             title: 'Success',
//             description: 'File created successfully',
//             status: 'success',
//             duration: 3000,
//             isClosable: true,
//           });
//           onClose();
//         }
//         break;
//       default:
//         break;
//     }

//     if (success && currentStep < totalSteps) {
//       setCurrentStep(prev => prev + 1);
//     }
//     setIsLoading(false);
//   };

//   const renderStepContent = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <VStack spacing={4}>
//             <FormControl isRequired>
//               <FormLabel>Project Name</FormLabel>
//               <Input
//                 name="projectName"
//                 value={formData.projectName}
//                 onChange={handleInputChange}
//                 placeholder="Enter project name"
//               />
//             </FormControl>
//             <FormControl isRequired>
//               <FormLabel>Description</FormLabel>
//               <Textarea
//                 name="description"
//                 value={formData.description}
//                 onChange={handleInputChange}
//                 placeholder="Enter project description"
//               />
//             </FormControl>
//           </VStack>
//         );
//       case 2:
//         return (
//           <FormControl isRequired>
//             <FormLabel>Folder Name</FormLabel>
//             <Input
//               name="folderName"
//               value={formData.folderName}
//               onChange={handleInputChange}
//               placeholder="Enter folder name"
//             />
//           </FormControl>
//         );
//       case 3:
//         return (
//           <VStack spacing={4}>
//             <FormControl isRequired>
//               <FormLabel>File Name</FormLabel>
//               <Input
//                 name="fileName"
//                 value={formData.fileName}
//                 onChange={handleInputChange}
//                 placeholder="Enter file name (without .js extension)"
//               />
//             </FormControl>
//             <FormControl isRequired>
//               <FormLabel>Code</FormLabel>
//               <Textarea
//                 name="code"
//                 value={formData.code}
//                 onChange={handleInputChange}
//                 placeholder="Write your code here..."
//                 height="400px"
//                 fontFamily="mono"
//               />
//             </FormControl>
//           </VStack>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       <Box onClick={onOpen} display="inline-block">
//         {children}
//       </Box>

//       <Modal
//         isOpen={isOpen}
//         onClose={onClose}
//         size={isFullScreen ? 'full' : 'xl'}
//         motionPreset="slideInRight"
//       >
//         <ModalOverlay />
//         <ModalContent
//           ml="auto"
//           h="105vh"
//           borderRadius={isFullScreen ? 0 : 'md'}
//         >
//           <ModalHeader
//             display="flex"
//             justifyContent="space-between"
//             alignItems="center"
//             borderBottomWidth="1px"
//           >
//             <Stack spacing={2} flex={1}>
//               <Flex justify="space-between" align="center">
//                 <Text>Step {currentStep} of {totalSteps}</Text>
//                 <Button
//                   variant="ghost"
//                   onClick={() => setIsFullScreen(!isFullScreen)}
//                   leftIcon={isFullScreen ? <FaCompress /> : <FaExpand />}
//                 >
//                   {isFullScreen ? 'Minimize' : 'Fullscreen'}
//                 </Button>
//               </Flex>
//               <Progress value={(currentStep / totalSteps) * 100} size="sm" colorScheme="green" />
//             </Stack>
//           </ModalHeader>
//           <ModalCloseButton />

//           <ModalBody>
//             <Box my={4}>
//               {renderStepContent()}
//             </Box>
//           </ModalBody>

//           <ModalFooter borderTopWidth="1px">
//             <Button
//               colorScheme="green"
//               mr={3}
//               onClick={handleNext}
//               isLoading={isLoading}
//               loadingText="Processing..."
//             >
//               {currentStep === totalSteps ? 'Finish' : 'Next'}
//             </Button>
//             <Button variant="ghost" onClick={onClose} isDisabled={isLoading}>
//               Cancel
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </>
//   );
// };

// export default SimulationPopup;

// import React, { useState, useEffect } from 'react';
// import {
//   Button,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalFooter,
//   ModalBody,
//   ModalCloseButton,
//   Textarea,
//   useDisclosure,
//   Box,
//   FormControl,
//   FormLabel,
//   Input,
//   VStack,
//   useToast,
//   Text,
//   Flex,
//   Progress,
//   Stack,
//   IconButton,
//   HStack,
//   Spinner,
//   Center,
//   Container
// } from '@chakra-ui/react';
// import { FaExpand, FaCompress, FaEdit, FaSave } from 'react-icons/fa';

// const SimulationPopup = ({ children }) => {
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const loadingModal = useDisclosure();
//   const [isFullScreen, setIsFullScreen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [loadingMessage, setLoadingMessage] = useState('');
//   const toast = useToast();

//   const [formData, setFormData] = useState({
//     userId: '',
//     projectName: '',
//     description: '',
//     folderName: '',
//     fileName: '',
//     code: ''
//   });

//   const [fileOperation, setFileOperation] = useState('create');
//   const [currentStep, setCurrentStep] = useState(1);
//   const totalSteps = 3;

//   useEffect(() => {
//     const loadInitialData = async () => {
//       const userId = sessionStorage.getItem('userId');
//       const projectId = sessionStorage.getItem('projectId');
//       const folderId = sessionStorage.getItem('folderId');
//       const fileName = sessionStorage.getItem('fileName');

//       if (!userId) {
//         toast({
//           title: 'Missing Data',
//           description: 'User ID is missing. Please ensure you are properly logged in.',
//           status: 'error',
//           duration: 5000,
//           isClosable: true,
//         });
//         return;
//       }

//       setFormData(prev => ({ ...prev, userId }));

//       if (projectId && folderId && fileName) {
//         await loadExistingFile(projectId, folderId, fileName);
//       }
//     };

//     loadInitialData();
//   }, [toast]);

//   const showLoadingModal = (message) => {
//     setLoadingMessage(message);
//     loadingModal.onOpen();
//   };

//   const hideLoadingModal = () => {
//     loadingModal.onClose();
//     setLoadingMessage('');
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const loadExistingFile = async (projectId, folderId, fileName) => {
//     showLoadingModal('Loading file...');
//     try {
//       const response = await fetch(
//         `${API.MAIN}/api/v1/loadFile/${projectId}/${folderId}/${fileName}`,
//         {
//           method: 'GET',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );

//       const data = await response.json();
//       if (data.status === 'success') {
//         setFormData(prev => ({
//           ...prev,
//           code: data.content,
//           fileName: fileName.replace('.js', '')
//         }));
//         setFileOperation('update');
//         setCurrentStep(3);
//         toast({
//           title: 'Success',
//           description: 'File loaded successfully',
//           status: 'success',
//           duration: 3000,
//           isClosable: true,
//         });
//       }
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Failed to load file',
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//     } finally {
//       hideLoadingModal();
//     }
//   };

//   const handleUpdate = async () => {
//     showLoadingModal('Updating file...');
//     const success = await updateFile();
//     hideLoadingModal();
//     return success;
//   };

//   const updateFile = async () => {
//     const fileId = sessionStorage.getItem('fileId');
//     if (!fileId) {
//       toast({
//         title: 'Error',
//         description: 'File ID not found',
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//       return false;
//     }

//     try {
//       const response = await fetch(`${API.MAIN}/api/v1/updateFiles/${fileId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           newFileName: `${formData.fileName}.js`,
//           content: formData.code
//         }),
//       });

//       const data = await response.json();
//       if (data.status === 'success') {
//         sessionStorage.setItem('fileName', `${formData.fileName}.js`);
//         toast({
//           title: 'Success',
//           description: 'File updated successfully',
//           status: 'success',
//           duration: 3000,
//           isClosable: true,
//         });
//         setIsEditing(false);
//         return true;
//       }
//       throw new Error(data.message || 'Failed to update file');
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: error.message,
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//       return false;
//     }
//   };

//   const handleNext = async () => {
//     setIsLoading(true);
//     let success = false;

//     switch (currentStep) {
//       case 1:
//         success = await createProject();
//         break;
//       case 2:
//         success = await createFolder();
//         break;
//       case 3:
//         if (fileOperation === 'create') {
//           success = await createFile();
//         } else {
//           success = await handleUpdate();
//         }
//         if (success) {
//           onClose();
//         }
//         break;
//       default:
//         break;
//     }

//     if (success && currentStep < totalSteps) {
//       setCurrentStep(prev => prev + 1);
//     }
//     setIsLoading(false);
//   };

//   const renderStepContent = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <VStack spacing={4}>
//             <FormControl isRequired>
//               <FormLabel>Project Name</FormLabel>
//               <Input
//                 name="projectName"
//                 value={formData.projectName}
//                 onChange={handleInputChange}
//                 placeholder="Enter project name"
//                 size="md"
//                 variant="filled"
//               />
//             </FormControl>
//             <FormControl isRequired>
//               <FormLabel>Description</FormLabel>
//               <Textarea
//                 name="description"
//                 value={formData.description}
//                 onChange={handleInputChange}
//                 placeholder="Enter project description"
//                 size="md"
//                 variant="filled"
//               />
//             </FormControl>
//           </VStack>
//         );
//       case 2:
//         return (
//           <FormControl isRequired>
//             <FormLabel>Folder Name</FormLabel>
//             <Input
//               name="folderName"
//               value={formData.folderName}
//               onChange={handleInputChange}
//               placeholder="Enter folder name"
//               size="md"
//               variant="filled"
//             />
//           </FormControl>
//         );
//       case 3:
//         return (
//           <VStack spacing={4}>
//             <FormControl isRequired>
//               <FormLabel>File Name</FormLabel>
//               <Input
//                 name="fileName"
//                 value={formData.fileName}
//                 onChange={handleInputChange}
//                 placeholder="Enter file name (without .js extension)"
//                 isDisabled={!isEditing && fileOperation === 'update'}
//                 size="md"
//                 variant="filled"
//               />
//             </FormControl>
//             <FormControl isRequired>
//               <FormLabel>Code</FormLabel>
//               <Textarea
//                 name="code"
//                 value={formData.code}
//                 onChange={handleInputChange}
//                 placeholder="Write your code here..."
//                 height="400px"
//                 fontFamily="mono"
//                 size="md"
//                 variant="filled"
//               />
//             </FormControl>
//           </VStack>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <Box>
//       <Box onClick={onOpen} display="inline-block">
//         {children}
//       </Box>

//       <Modal
//         isOpen={loadingModal.isOpen}
//         onClose={loadingModal.onClose}
//         isCentered
//         closeOnOverlayClick={false}
//       >
//         <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
//         <ModalContent w="300px">
//           <ModalBody>
//             <Center p={6}>
//               <VStack spacing={4}>
//                 <Spinner
//                   size="xl"
//                   color="blue.500"
//                   thickness="4px"
//                   speed="0.65s"
//                   emptyColor="gray.200"
//                 />
//                 <Text fontWeight="medium">{loadingMessage}</Text>
//               </VStack>
//             </Center>
//           </ModalBody>
//         </ModalContent>
//       </Modal>

//       <Modal
//         isOpen={isOpen}
//         onClose={onClose}
//         size={isFullScreen ? 'full' : 'xl'}
//         motionPreset="slideInRight"
//       >
//         <ModalOverlay />
//         <ModalContent
//           ml="auto"
//           h="100vh"
//           maxH="100vh"
//           borderRadius={isFullScreen ? 0 : 'md'}
//         >
//           <ModalHeader
//             display="flex"
//             justifyContent="space-between"
//             alignItems="center"
//             borderBottomWidth="1px"
//             bg="gray.50"
//           >
//             <Stack spacing={2} flex={1}>
//               <Flex justify="space-between" align="center">
//                 <Text fontSize="lg" fontWeight="bold">Step {currentStep} of {totalSteps}</Text>
//                 <HStack>
//                   {fileOperation === 'update' && (
//                     <>
//                       <IconButton
//                         icon={isEditing ? <FaSave /> : <FaEdit />}
//                         onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}
//                         aria-label={isEditing ? "Save changes" : "Edit file"}
//                         colorScheme={isEditing ? "blue" : "gray"}
//                         size="sm"
//                       />
//                       {isEditing && (
//                         <Button
//                           variant="ghost"
//                           onClick={() => setIsEditing(false)}
//                           size="sm"
//                           colorScheme="gray"
//                         >
//                           Cancel
//                         </Button>
//                       )}
//                     </>
//                   )}
//                   <IconButton
//                     icon={isFullScreen ? <FaCompress /> : <FaExpand />}
//                     onClick={() => setIsFullScreen(!isFullScreen)}
//                     aria-label={isFullScreen ? "Minimize" : "Fullscreen"}
//                     variant="ghost"
//                     size="sm"
//                   />
//                 </HStack>
//               </Flex>
//               <Progress
//                 value={(currentStep / totalSteps) * 100}
//                 size="sm"
//                 colorScheme="blue"
//                 borderRadius="full"
//               />
//             </Stack>
//           </ModalHeader>
//           <ModalCloseButton />

//           <ModalBody bg="white">
//             <Container maxW="container.md" py={4}>
//               {renderStepContent()}
//             </Container>
//           </ModalBody>

//           <ModalFooter borderTopWidth="1px" bg="gray.50">
//             <Button
//               colorScheme="blue"
//               mr={3}
//               onClick={handleNext}
//               isLoading={isLoading}
//               loadingText="Processing..."
//               size="md"
//             >
//               {currentStep === totalSteps ? 'Finish' : 'Next'}
//             </Button>
//             <Button
//               variant="ghost"
//               onClick={onClose}
//               isDisabled={isLoading}
//               size="md"
//             >
//               Cancel
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </Box>
//   );
// };

// export default SimulationPopup;

// import React, { useState, useEffect } from 'react';
// import {
//   Button,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalFooter,
//   ModalBody,
//   ModalCloseButton,
//   Textarea,
//   useDisclosure,
//   Box,
//   FormControl,
//   FormLabel,
//   Input,
//   VStack,
//   useToast,
//   Text,
//   Flex,
//   Progress,
//   Stack,
//   Alert,
//   AlertIcon,
//   AlertTitle,
//   AlertDescription,
// } from '@chakra-ui/react';
// import { FaExpand, FaCompress } from 'react-icons/fa';

// const SimulationPopup = ({ children }) => {
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const {
//     isOpen: isFlashOpen,
//     onOpen: onFlashOpen,
//     onClose: onFlashClose
//   } = useDisclosure();
//   const [isFullScreen, setIsFullScreen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isFlashing, setIsFlashing] = useState(false);
//   const [flashStatus, setFlashStatus] = useState(null);
//   const toast = useToast();

//   // Form state
//   const [formData, setFormData] = useState({
//     userId: '',
//     projectName: '',
//     description: '',
//     folderName: '',
//     fileName: '',
//     code: ''
//   });

//   // Step state
//   const [currentStep, setCurrentStep] = useState(1);
//   const totalSteps = 3;

//   // Load user data on mount
//   useEffect(() => {
//     const userId = sessionStorage.getItem('userId');
//     if (!userId) {
//       toast({
//         title: 'Missing Data',
//         description: 'User ID is missing. Please ensure you are properly logged in.',
//         status: 'error',
//         duration: 5000,
//         isClosable: true,
//       });
//       return;
//     }
//     setFormData(prev => ({ ...prev, userId }));
//   }, [toast]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const createProject = async () => {
//     if (!formData.projectName.trim() || !formData.description.trim()) {
//       toast({
//         title: 'Error',
//         description: 'Please fill in all project details',
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//       return false;
//     }

//     try {
//       const response = await fetch(`${API.MAIN}/api/v1/addProjects`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           projectName: formData.projectName,
//           description: formData.description,
//           userId: formData.userId
//         }),
//       });

//       const data = await response.json();
//       if (data.status === 'success') {
//         sessionStorage.setItem('projectId', data.projectData.projectId);
//         return true;
//       }
//       throw new Error(data.message || 'Failed to create project');
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: error.message,
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//       return false;
//     }
//   };

//   const createFolder = async () => {
//     if (!formData.folderName.trim()) {
//       toast({
//         title: 'Error',
//         description: 'Please enter a folder name',
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//       return false;
//     }

//     const projectId = sessionStorage.getItem('projectId');
//     try {
//       const response = await fetch(`${API.MAIN}/api/v1/createFolders`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           folderName: formData.folderName,
//           projectId,
//           parentFolderId: null
//         }),
//       });

//       const data = await response.json();
//       if (data.status === 'success') {
//         sessionStorage.setItem('folderId', data.folderData.folderId);
//         return true;
//       }
//       throw new Error(data.message || 'Failed to create folder');
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: error.message,
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//       return false;
//     }
//   };

//   const createFile = async () => {
//     if (!formData.fileName.trim() || !formData.code.trim()) {
//       toast({
//         title: 'Error',
//         description: 'Please enter both file name and code',
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//       return false;
//     }

//     const projectId = sessionStorage.getItem('projectId');
//     const folderId = sessionStorage.getItem('folderId');

//     try {
//       const response = await fetch(`${API.MAIN}/api/v1/createFiles`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           fileName: `${formData.fileName}.json`,
//           content: formData.code,
//           folderId,
//           projectId,
//         }),
//       });

//       const data = await response.json();
//       if (data.status === 'success') {
//         sessionStorage.setItem('fileId', data.fileData.fileId);
//         return true;
//       }
//       throw new Error(data.message || 'Failed to create file');
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: error.message,
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//       return false;
//     }
//   };

//   const flashCode = async () => {
//     setIsFlashing(true);
//     setFlashStatus(null);

//     try {
//       const response = await fetch(`${API.ADMIN}/submit-code`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ code: formData.code })
//       });

//       const data = await response.json();
//       if (response.ok) {
//         setFlashStatus('success');
//         toast({
//           title: 'Success',
//           description: 'Code flashed successfully',
//           status: 'success',
//           duration: 3000,
//           isClosable: true,
//         });
//       } else {
//         throw new Error(data.message || 'Failed to flash code');
//       }
//     } catch (error) {
//       setFlashStatus('error');
//       toast({
//         title: 'Error',
//         description: error.message || 'Failed to flash code',
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//     } finally {
//       setIsFlashing(false);
//     }
//   };

//   const handleNext = async () => {
//     setIsLoading(true);
//     let success = false;

//     switch (currentStep) {
//       case 1:
//         success = await createProject();
//         break;
//       case 2:
//         success = await createFolder();
//         break;
//       case 3:
//         success = await createFile();
//         if (success) {
//           onFlashOpen();
//           onClose();
//         }
//         break;
//       default:
//         break;
//     }

//     if (success && currentStep < totalSteps) {
//       setCurrentStep(prev => prev + 1);
//     }
//     setIsLoading(false);
//   };

//   const renderStepContent = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <VStack spacing={4}>
//             <FormControl isRequired>
//               <FormLabel>Project Name</FormLabel>
//               <Input
//                 name="projectName"
//                 value={formData.projectName}
//                 onChange={handleInputChange}
//                 placeholder="Enter project name"
//               />
//             </FormControl>
//             <FormControl isRequired>
//               <FormLabel>Description</FormLabel>
//               <Textarea
//                 name="description"
//                 value={formData.description}
//                 onChange={handleInputChange}
//                 placeholder="Enter project description"
//               />
//             </FormControl>
//           </VStack>
//         );
//       case 2:
//         return (
//           <FormControl isRequired>
//             <FormLabel>Folder Name</FormLabel>
//             <Input
//               name="folderName"
//               value={formData.folderName}
//               onChange={handleInputChange}
//               placeholder="Enter folder name"
//             />
//           </FormControl>
//         );
//       case 3:
//         return (
//           <VStack spacing={4}>
//             <FormControl isRequired>
//               <FormLabel>File Name</FormLabel>
//               <Input
//                 name="fileName"
//                 value={formData.fileName}
//                 onChange={handleInputChange}
//                 placeholder="Enter file name (without .extension)"
//               />
//             </FormControl>
//             <FormControl isRequired>
//               <FormLabel size="sm">Code</FormLabel>
//               <Textarea
//                 name="code"
//                 value={formData.code}
//                 onChange={handleInputChange}
//                 placeholder="Write your code here..."
//                 height="400px"
//                 fontFamily="mono"
//               />
//             </FormControl>
//           </VStack>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       <Box onClick={onOpen} display="inline-block">
//         {children}
//       </Box>

//       {/* Main Modal */}
//       <Modal
//         isOpen={isOpen}
//         onClose={onClose}
//         size={isFullScreen ? 'full' : 'xl'}
//         motionPreset="slideInRight"
//       >
//         <ModalOverlay />
//         <ModalContent
//           ml="auto"
//           h="105vh"
//           borderRadius={isFullScreen ? 0 : 'md'}
//         >
//           <ModalHeader
//             display="flex"
//             justifyContent="space-between"
//             alignItems="center"
//             borderBottomWidth="1px"
//           >
//             <Stack spacing={2} flex={1}>
//               <Flex justify="space-between" align="center">
//                 <Text>Step {currentStep} of {totalSteps}</Text>
//                 <Button
//                   variant="ghost"
//                   onClick={() => setIsFullScreen(!isFullScreen)}
//                   leftIcon={isFullScreen ? <FaCompress /> : <FaExpand />}
//                 >
//                   {isFullScreen ? 'Minimize' : 'Fullscreen'}
//                 </Button>
//               </Flex>
//               <Progress value={(currentStep / totalSteps) * 100} size="sm" colorScheme="green" />
//             </Stack>
//           </ModalHeader>
//           <ModalCloseButton />

//           <ModalBody>
//             <Box my={4}>
//               {renderStepContent()}
//             </Box>
//           </ModalBody>

//           <ModalFooter borderTopWidth="1px">
//             <Button
//               colorScheme="green"
//               mr={3}
//               onClick={handleNext}
//               isLoading={isLoading}
//               loadingText="Processing..."
//             >
//               {currentStep === totalSteps ? 'Create' : 'Next'}
//             </Button>
//             <Button variant="ghost" onClick={onClose} isDisabled={isLoading}>
//               Cancel
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>

//       {/* Flash Code Modal */}
//       <Modal isOpen={isFlashOpen} onClose={onFlashClose}>
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>Flash Code</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             <VStack spacing={4}>
//               <Text>Your file has been created successfully! Would you like to flash the code now?</Text>
//               {flashStatus && (
//                 <Alert status={flashStatus}>
//                   <AlertIcon />
//                   <AlertTitle>
//                     {flashStatus === 'success' ? 'Success!' : 'Error!'}
//                   </AlertTitle>
//                   <AlertDescription>
//                     {flashStatus === 'success'
//                       ? 'Code has been flashed successfully.'
//                       : 'Failed to flash code. Please try again.'}
//                   </AlertDescription>
//                 </Alert>
//               )}
//             </VStack>
//           </ModalBody>
//           <ModalFooter>
//             <Button
//               colorScheme="blue"
//               mr={3}
//               onClick={flashCode}
//               isLoading={isFlashing}
//               loadingText="Flashing..."
//             >
//               Flash Code
//             </Button>
//             <Button variant="ghost" onClick={onFlashClose}>
//               Close
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </>
//   );
// };

// export default SimulationPopup;

import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Textarea,
  useDisclosure,
  Box,
  FormControl,
  FormLabel,
  useToast,
  Heading,
  Stack,
} from "@chakra-ui/react";
import { useProject } from "../ProjectContext";
import axios from "axios";
import { Editor } from "@monaco-editor/react";
import { useNavigate } from "react-router-dom";

const SimulationPopup = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [code, setCode] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileId, setFileId] = useState("");
  const toast = useToast();

  const [isSaving, setIsSaving] = useState(false);

  // active projectId and productId
  const { activeProjectId, activeProductId, activeProjectName, user } =
    useProject();

  useEffect(() => {
    const fetchActiveProjectCodeFile = async () => {
      try {
        const response = await axios.get(
          `${API.MAIN}/api/v1/files/${user?.userId}`
        );

        console.log("response from popup", response.data);

        const activeFile = response?.data?.files.find(
          (obj) => obj.parentId === activeProjectId
        );

        console.log("active file:", activeFile);

        setCode(activeFile?.content);

        setFileName(activeFile?.name);

        setFileId(activeFile?._id);
      } catch (error) {
        console.log(error);
      }
    };

    fetchActiveProjectCodeFile();
  }, [activeProductId, activeProductId]);

  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  const handleCodeSave = async () => {
    setIsSaving(true); // Start loading animation

    try {
      await axios.put(`${API.MAIN}/api/v1/updateFileAndFolder`, {
        fileId,
        newName: fileName,
        newContent: code,
      });

      toast({
        title: "Save Code",
        description: "Your code has been saved successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose(); // Close the modal after saving the code
    } catch (error) {
      console.log("Error saving code.", error);
      toast({
        title: "Error Code Save",
        description: "An error occurred while saving code.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false); // Stop loading animation
    }
  };

  // const handleFlash = async () => {
  //   try {
  //     const response = await fetch(`${API.ADMIN}/submit-code`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ code }),
  //     });

  //     if (response.ok) {
  //       toast({
  //         title: "Flashing Successful",
  //         description: "Your code has been flashed successfully.",
  //         status: "success",
  //         duration: 3000,
  //         isClosable: true,
  //       });
  //     } else {
  //       throw new Error("Failed to flash code");
  //     }
  //   } catch (error) {
  //     toast({
  //       title: "Flashing Failed",
  //       description: "An error occurred while flashing the code.",
  //       status: "error",
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //   }
  // };

  return (
    <>
      <Box onClick={onOpen} display="inline-block">
        {children}
      </Box>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="3xl"
        motionPreset="slideInRight"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Project Name: {activeProjectName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Heading size={"sm"}>{fileName}</Heading>
            <Box w="100%" h="400px">
              <Editor
                height="100%"
                language="c"
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value)}
              />
            </Box>
          </ModalBody>
          <ModalFooter>
            <Stack spacing={4} direction={"row"}>
              <Button
                size={"sm"}
                colorScheme="green"
                variant={"outline"}
                mr={3}
                onClick={handleCodeSave}
                isLoading={isSaving} // Show loading animation
                isDisabled={isSaving} // Disable button while saving
              >
                Save
              </Button>
            </Stack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SimulationPopup;
