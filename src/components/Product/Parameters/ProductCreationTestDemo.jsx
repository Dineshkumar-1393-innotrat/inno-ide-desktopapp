import React, { useState, useEffect } from 'react';
import { API } from '@/config';
import {
    Box,
    VStack,
    HStack,
    Text,
    Input,
    Textarea,
    Button,
    Heading,
    useToast,
    Step,
    StepDescription,
    StepIcon,
    StepIndicator,
    StepNumber,
    StepSeparator,
    StepStatus,
    StepTitle,
    Stepper,
    useSteps,
    Divider,
    SimpleGrid,
    Code,
    Badge,
    Select,
} from '@chakra-ui/react';
import axios from 'axios';
import CommonParameterForm from './CommonParameterForm';
import VariableOnlyForm from './VariableOnlyForm';
import SensorActuatorForm from './SensorActuatorForm';

const steps = [
    { title: 'Identity', description: 'Product Basics' },
    { title: 'Configuration', description: 'Parameter Entry' },
    { title: 'Verification', description: 'Data Check' },
];

const ProductCreationTestDemo = () => {
    const { activeStep, setActiveStep } = useSteps({
        index: 0,
        count: steps.length,
    });
    const toast = useToast();

    const [productData, setProductData] = useState({
        name: '',
        description: '',
        config: [], // Array of { type, data, componentId }
    });

    const [componentTypes, setComponentTypes] = useState([]);
    const [selectedComponentId, setSelectedComponentId] = useState('');
    const [loadingComponents, setLoadingComponents] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch component types on mount
    useEffect(() => {
        const fetchComponents = async () => {
            setLoadingComponents(true);
            try {
                const resp = await axios.get(`${API.MAIN}/api/v2/componentTypes`);
                if (resp.data.status === "success") {
                    setComponentTypes(resp.data.data);
                    if (resp.data.data.length > 0) {
                        setSelectedComponentId(resp.data.data[0]._id);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch component types:", error);
            } finally {
                setLoadingComponents(false);
            }
        };
        fetchComponents();
    }, []);

    const handleUpdateConfig = (type, data) => {
        setProductData(prev => ({
            ...prev,
            config: [...prev.config, {
                type,
                data,
                componentId: selectedComponentId,
                componentName: componentTypes.find(c => c._id === selectedComponentId)?.componentName || 'Unknown',
                timestamp: new Date().toISOString()
            }]
        }));
        toast({
            title: `${type} added to test state`,
            description: `Component: ${selectedComponentId}`,
            status: "info",
            duration: 1500,
            isClosable: true,
            position: "top-right",
        });
    };

    const handleFinalSubmit = async () => {
        const productId = localStorage.getItem("activeProjectIds") || "692fbd91395897b3537b69de"; // Fallback for test

        setIsSubmitting(true);
        try {
            // Build the nested components structure as required by API 9
            const componentsPayload = {};

            productData.config.forEach(item => {
                const compName = item.componentName;
                if (!componentsPayload[compName]) {
                    componentsPayload[compName] = {
                        componentID: item.componentId,
                        type: "sensors", // Simplified for demo
                        urls: ["https://example.com/sensor-info"],
                        note: productData.description || "Demo product definition"
                    };
                }

                // Logic to Map parameter names to min/max/unit as per payload 9
                if (item.data.params) {
                    item.data.params.forEach(paramName => {
                        componentsPayload[compName][paramName] = {
                            min: 20.0, // Mocked values
                            max: 40.0,
                            unit: "N/A"
                        };
                    });
                }
            });

            const payload = {
                productID: productId,
                productName: productData.name,
                components: componentsPayload
            };

            const resp = await axios.post(`${API.MAIN}/product/${productId}/definitionNew`, payload);

            toast({
                title: "Product Definition Saved",
                description: resp.data.message || "Successfully created product definition.",
                status: "success",
                duration: 5000,
            });

            // Cleanup
            setProductData({ name: '', description: '', config: [] });
            setActiveStep(0);
        } catch (error) {
            console.error("Final Submit Error:", error);
            toast({
                title: "Submission Failed",
                description: error.response?.data?.message || error.message,
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputStyles = {
        bg: "white",
        border: "1px solid",
        borderColor: "gray.300",
        color: "black",
    };

    const renderStep1 = () => (
        <VStack align="stretch" spacing={6} p={6} bg="white" borderRadius="md" boxShadow="sm" border="1px solid" borderColor="gray.200">
            <Heading size="md">Step 1: Product Identity</Heading>
            <Box>
                <Text fontWeight="bold" mb={2}>Product Name*</Text>
                <Input
                    id="test-input-name"
                    value={productData.name}
                    onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                    placeholder="e.g. Test Device 001"
                    sx={inputStyles}
                />
            </Box>
            <Box>
                <Text fontWeight="bold" mb={2}>Product Description</Text>
                <Textarea
                    id="test-input-desc"
                    value={productData.description}
                    onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                    placeholder="Brief description for testing..."
                    sx={inputStyles}
                    rows={4}
                />
            </Box>
            <Box textAlign="right">
                <Button
                    id="test-btn-next-1"
                    colorScheme="blue"
                    isDisabled={!productData.name}
                    onClick={() => setActiveStep(1)}
                >
                    Proceed to Configuration
                </Button>
            </Box>
        </VStack>
    );

    const renderStep2 = () => (
        <VStack align="stretch" spacing={8}>
            <HStack justify="space-between" align="center" bg="blue.50" p={4} borderRadius="md" border="1px solid" borderColor="blue.100">
                <VStack align="left" spacing={2} flex={1}>
                    <Text fontWeight="bold">Active Component Context</Text>
                    <Select
                        bg="white"
                        value={selectedComponentId}
                        onChange={(e) => setSelectedComponentId(e.target.value)}
                        isDisabled={loadingComponents}
                    >
                        {componentTypes.map(c => (
                            <option key={c._id} value={c._id}>{c.componentName}</option>
                        ))}
                    </Select>
                    <Text fontSize="xs" color="gray.600">This ID will be used for parameter API calls.</Text>
                </VStack>
                <Badge colorScheme="purple" fontSize="1em" p={3} borderRadius="md">
                    Config Items: {productData.config.length}
                </Badge>
            </HStack>

            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={10} alignItems="start">
                <VStack align="stretch" spacing={4}>
                    <Text fontWeight="bold" color="blue.700" textAlign="center">Common Form</Text>
                    <CommonParameterForm
                        componentId={selectedComponentId}
                        onSubmit={(data) => handleUpdateConfig('Common', data)}
                    />
                </VStack>

                <VStack align="stretch" spacing={4}>
                    <Text fontWeight="bold" color="green.700" textAlign="center">Variable Only</Text>
                    <VariableOnlyForm onSubmit={(data) => handleUpdateConfig('Variable', data)} />
                </VStack>

                <VStack align="stretch" spacing={4}>
                    <Text fontWeight="bold" color="red.700" textAlign="center">Sensor/Actuator</Text>
                    <SensorActuatorForm
                        componentId={selectedComponentId}
                        onSubmit={(data) => handleUpdateConfig('Sensor/Actuator', data)}
                    />
                </VStack>
            </SimpleGrid>

            <HStack justify="space-between" pt={10}>
                <Button variant="ghost" onClick={() => setActiveStep(0)}>Back</Button>
                <Button colorScheme="blue" onClick={() => setActiveStep(2)}>Next: Final Verification</Button>
            </HStack>
        </VStack>
    );

    const renderStep3 = () => (
        <VStack align="stretch" spacing={6} p={6} bg="white" borderRadius="md" boxShadow="sm" border="1px solid" borderColor="gray.200">
            <Heading size="md">Step 3: Verification & Test Output</Heading>
            <Divider />

            <SimpleGrid columns={2} spacing={10}>
                <Box>
                    <Text fontWeight="bold" color="gray.500" mb={1}>Core Identity</Text>
                    <VStack align="stretch" bg="gray.50" p={4} borderRadius="md" border="1px solid" borderColor="gray.100">
                        <HStack><Text fontWeight="bold">Name:</Text><Text>{productData.name}</Text></HStack>
                        <HStack align="top"><Text fontWeight="bold">Desc:</Text><Text fontSize="sm">{productData.description || 'N/A'}</Text></HStack>
                    </VStack>
                </Box>

                <Box>
                    <Text fontWeight="bold" color="gray.500" mb={1}>Configuration Log</Text>
                    <VStack align="stretch" maxH="300px" overflowY="auto" spacing={2}>
                        {productData.config.length === 0 ? (
                            <Text color="gray.400" italic>No items added.</Text>
                        ) : (
                            productData.config.map((item, idx) => (
                                <Box key={idx} p={2} bg="blue.50" borderRadius="md" borderLeft="4px solid" borderColor="blue.400" fontSize="xs">
                                    <Text fontWeight="bold">{item.type} Submission ({item.componentName})</Text>
                                    <Code fontSize="xs" variant="transparent">{JSON.stringify(item.data)}</Code>
                                </Box>
                            ))
                        )}
                    </VStack>
                </Box>
            </SimpleGrid>

            <Box bg="gray.900" p={6} borderRadius="md">
                <Text color="green.400" fontWeight="bold" mb={2}>Final Product Definition Payload (API 9)</Text>
                <Code colorScheme="whatsapp" p={2} borderRadius="sm" w="100%" bg="transparent" whiteSpace="pre">
                    {JSON.stringify(productData, null, 2)}
                </Code>
            </Box>

            <HStack justify="space-between" pt={8}>
                <Button variant="ghost" onClick={() => setActiveStep(1)}>Back to Config</Button>
                <Button
                    colorScheme="green"
                    px={10}
                    isLoading={isSubmitting}
                    onClick={handleFinalSubmit}
                >
                    Submit Product Definition
                </Button>
            </HStack>
        </VStack>
    );

    return (
        <Box p={10} bg="#F7FAFC" minH="100vh">
            <Box maxW="1300px" mx="auto">
                <VStack align="stretch" spacing={12}>
                    <Box borderBottom="2px solid" borderColor="blue.500" pb={4}>
                        <Heading size="xl" color="blue.800">Product Creation Testing Demo</Heading>
                        <Text color="gray.500" mt={1}>Testing the modular parameter components and data collection flow.</Text>
                    </Box>

                    <Stepper index={activeStep} colorScheme="blue" size="lg">
                        {steps.map((step, index) => (
                            <Step key={index}>
                                <StepIndicator>
                                    <StepStatus
                                        complete={<StepIcon />}
                                        incomplete={<StepNumber />}
                                        active={<StepNumber />}
                                    />
                                </StepIndicator>

                                <Box flexShrink='0'>
                                    <StepTitle>{step.title}</StepTitle>
                                    <StepDescription>{step.description}</StepDescription>
                                </Box>

                                <StepSeparator />
                            </Step>
                        ))}
                    </Stepper>

                    <Box>
                        {activeStep === 0 && renderStep1()}
                        {activeStep === 1 && renderStep2()}
                        {activeStep === 2 && renderStep3()}
                    </Box>
                </VStack>
            </Box>
        </Box>
    );
};

export default ProductCreationTestDemo;
