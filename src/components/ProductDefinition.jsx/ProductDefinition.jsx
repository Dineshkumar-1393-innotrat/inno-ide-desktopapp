import React, { useState } from "react";
import {
    Box,
    VStack,
    HStack,
    Text,
    Input,
    Textarea,
    Button,
    Select,
    IconButton,
    useToast,
    Grid,
    GridItem,
    FormControl,
    FormLabel,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";

export default function ProductDefinition() {
    const toast = useToast();

    // Step 1 (popup) or Step 2 (full form)
    const [step, setStep] = useState(1);

    // Basic Info
    const [productName, setProductName] = useState("");
    const [description, setDescription] = useState("");

    // Full Form Data
    const [numDevices, setNumDevices] = useState("");
    const [components, setComponents] = useState([
        {
            name: "Flame Sensor",
            type: "Sensor",
            parameters: [
                {
                    type: "inconstant", // "inconstant" or "constant"
                    name: "Flame Intensity",
                    min: "",
                    max: "",
                    unit: "",
                    value: "",
                },
            ],
        },
    ]);
    const [urlLink, setUrlLink] = useState("");
    const [note, setNote] = useState("");
    const [deviceInfo, setDeviceInfo] = useState({
        imei: "",
        iccid: "",
        phone: "",
    });

    // popup for adding a new component from "Component" +
    const [showComponentPopup, setShowComponentPopup] = useState(false);
    const [newComponent, setNewComponent] = useState({
        name: "",
        type: "Sensor",
    });

    const inputStyles = {
        bg: "white",
        color: "black",
        _placeholder: { color: "gray.400" },
    };

    // --- handlers ---

    const handleInitialSubmit = () => {
        if (!productName.trim()) {
            toast({
                title: "Product Name Required",
                description: "Please enter a product name",
                status: "warning",
                duration: 2000,
            });
            return;
        }
        setStep(2);
    };

    const addComponent = (compData) => {
        setComponents((prev) => [
            ...prev,
            {
                ...compData,
                name: compData.name || "",
                type: compData.type || "Sensor",
                parameters: compData.parameters || []
            }
        ]);
        toast({
            title: "Component added successfully !",
            status: "success",
            duration: 2000,
        });
    };

    const updateComponent = (index, field, value) => {
        const updated = [...components];
        updated[index][field] = value;
        setComponents(updated);
    };

    const deleteComponent = (index) => {
        setComponents((prev) => prev.filter((_, i) => i !== index));
    };

    const addParameter = (compIndex, type) => {
        const updated = [...components];
        updated[compIndex].parameters.push({
            type: type === "constant" ? "constant" : "inconstant",
            name: "",
            min: "",
            max: "",
            unit: "",
            value: "",
        });
        setComponents(updated);
    };

    const updateParameter = (compIndex, paramIndex, field, value) => {
        const updated = [...components];
        updated[compIndex].parameters[paramIndex][field] = value;
        setComponents(updated);
    };

    const deleteParameter = (compIndex, paramIndex) => {
        const updated = [...components];
        updated[compIndex].parameters = updated[compIndex].parameters.filter(
            (_, i) => i !== paramIndex
        );
        setComponents(updated);
    };

    // change Constant / Inconstant from Variables dropdown
    const handleVariableChange = (compIndex, paramIndex, newValue) => {
        const updated = [...components];
        const param = updated[compIndex].parameters[paramIndex];
        param.type = newValue === "Constant" ? "constant" : "inconstant";
        updated[compIndex].parameters[paramIndex] = param;
        setComponents(updated);
    };

    const handleFinalSubmit = () => {
        if (!productName.trim()) {
            toast({
                title: "Product Name Required",
                description: "Please enter a product name",
                status: "warning",
                duration: 2000,
            });
            return;
        }
        if (!urlLink.trim()) {
            toast({
                title: "URL Required",
                description: "Please enter the URL link",
                status: "warning",
                duration: 2000,
            });
            return;
        }

        const payload = {
            productName,
            description,
            numDevices,
            components,
            urlLink,
            note,
            deviceInfo,
        };

        console.log("FINAL FORM SUBMIT:", payload);

        toast({
            title: "Product Created",
            description: "Your product has been configured successfully.",
            status: "success",
            duration: 3000,
        });
    };

    const handleCancel = () => {
        setProductName("");
        setDescription("");
        setNumDevices("");
        setComponents([
            {
                name: "Flame Sensor",
                type: "Sensor",
                parameters: [
                    {
                        type: "inconstant",
                        name: "Flame Intensity",
                        min: "",
                        max: "",
                        unit: "",
                        value: "",
                    },
                ],
            },
        ]);
        setUrlLink("");
        setNote("");
        setDeviceInfo({ imei: "", iccid: "", phone: "" });
        setStep(1);
    };

    // popup handlers
    const openComponentPopup = () => {
        setNewComponent({ name: "", type: "Sensor" });
        setShowComponentPopup(true);
    };

    const handleComponentPopupCancel = () => {
        setShowComponentPopup(false);
        setNewComponent({ name: "", type: "Sensor" });
    };

    const handleComponentPopupSubmit = () => {
        if (!newComponent.name.trim()) {
            toast({
                title: "Component Name Required",
                description: "Please enter a component name",
                status: "warning",
                duration: 2000,
            });
            return;
        }
        addComponent({
            name: newComponent.name,
            type: newComponent.type,
            parameters: [],
        });
        setShowComponentPopup(false);
        setNewComponent({ name: "", type: "Sensor" });
    };

    // ---------- STEP 1: POPUP ---------- //
    if (step === 1) {
        return (
            <Box
                width="100%"
                minH="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg="gray.100"
                py={10}
            >
                <Box
                    bg="#f5f5f5"
                    borderRadius="md"
                    borderWidth="1px"
                    maxW="600px"
                    w="100%"
                    p={8}
                >
                    <VStack align="stretch" spacing={4}>
                        <Box>
                            <Text fontSize="sm" mb={2}>
                                Product Name{" "}
                                <Text as="span" color="red.500">
                                    *
                                </Text>
                            </Text>
                            <Input
                                size="sm"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                sx={inputStyles}
                            />
                        </Box>

                        <Box>
                            <Text fontSize="sm" mb={2}>
                                Product Descriptions
                            </Text>
                            <Textarea
                                size="sm"
                                minH="120px"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                sx={inputStyles}
                            />
                        </Box>
                    </VStack>

                    <Box textAlign="center" mt={8}>
                        <Button
                            colorScheme="blue"
                            size="sm"
                            px={10}
                            onClick={handleInitialSubmit}
                        >
                            Submit
                        </Button>
                    </Box>
                </Box>
            </Box>
        );
    }

    // ---------- STEP 2: FULL PAGE ---------- //
    return (
        <Box width="100%" bg="gray.100" py={8}>
            <Box
                maxW="1100px"
                mx="auto"
                bg="#f5f5f5"
                borderRadius="md"
                borderWidth="1px"
                p={6}
            >
                {/* Product Name */}
                <Box mb={6}>
                    <Text fontSize="md" fontWeight="bold" mb={1}>
                        Product Name
                    </Text>
                    <Input
                        size="sm"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        sx={inputStyles}
                        placeholder="Enter product name"
                    />
                </Box>

                <VStack align="stretch" spacing={6}>
                    {/* Basic Information */}
                    <Box>
                        <Text fontSize="md" fontWeight="bold" mb={3}>
                            Basic Information
                        </Text>

                        <Grid templateColumns="repeat(3, 1fr)" gap={4} mb={3}>
                            <GridItem>
                                <Text fontSize="sm" mb={1} fontWeight="medium">
                                    No. Of Devices{" "}
                                    <Text as="span" color="red.500">
                                        *
                                    </Text>
                                </Text>
                                <Select
                                    size="sm"
                                    placeholder="Select"
                                    value={numDevices}
                                    onChange={(e) => setNumDevices(e.target.value)}
                                    sx={inputStyles}
                                >
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                </Select>
                            </GridItem>

                            {/* COMPONENT COLUMN WITH + BUTTON AND POPUP */}
                            <GridItem>
                                <HStack justify="space-between" mb={1}>
                                    <Text fontSize="sm" fontWeight="medium">Component</Text>
                                    <IconButton
                                        aria-label="Add component"
                                        icon={<AddIcon boxSize={3} />}
                                        size="xs"
                                        variant="ghost"
                                        onClick={openComponentPopup}
                                    />
                                </HStack>
                                <Select
                                    size="sm"
                                    value={components[0]?.name || ""}  // Show component name
                                    onChange={(e) => {
                                        const selectedName = e.target.value;
                                        const selectedComponent = components.find(comp => comp.name === selectedName);
                                        if (selectedComponent) {
                                            // Update the first component with selected component's data
                                            const updated = [...components];
                                            updated[0] = {
                                                ...selectedComponent,
                                                name: selectedName // Ensure name is preserved
                                            };
                                            setComponents(updated);
                                        }
                                    }}
                                    sx={inputStyles}
                                >
                                    {/* List all components as options */}
                                    {components.map((comp, idx) => (
                                        <option key={idx} value={comp.name}>
                                            {comp.name}
                                        </option>
                                    ))}
                                </Select>
                            </GridItem>

                            <GridItem>
                                <Text fontSize="sm" mb={1} fontWeight="medium">
                                    Component Name{" "}
                                    <Text as="span" color="red.500">
                                        *
                                    </Text>
                                </Text>
                                <Input
                                    size="sm"
                                    value={components[0]?.name || ""}
                                    onChange={(e) => updateComponent(0, "name", e.target.value)}
                                    sx={inputStyles}
                                    placeholder="Flame Sensor"
                                />
                            </GridItem>
                        </Grid>

                        {/* Add Parameters Button */}
                        <Button
                            size="xs"
                            colorScheme="blue"
                            variant="outline"
                            leftIcon={<AddIcon />}
                            onClick={() => addParameter(0, "inconstant")}
                        >
                            Add Parameters
                        </Button>
                    </Box>

                    {/* Specific Parameters */}
                    <Box>
                        <Text fontSize="md" fontWeight="bold" mb={3}>
                            Specific Parameters
                        </Text>

                        {components[0]?.parameters?.filter(p => p.type === "inconstant").map((param, paramIndex) => (
                            <Grid key={paramIndex} templateColumns="repeat(4, 1fr)" gap={4} mb={3}>
                                <GridItem>
                                    <Text fontSize="sm" mb={1} fontWeight="medium">
                                        Specific Parameter
                                    </Text>
                                    <Input
                                        size="sm"
                                        value={param.name}
                                        onChange={(e) => updateParameter(0, paramIndex, "name", e.target.value)}
                                        sx={inputStyles}
                                        placeholder="Flame Intensity"
                                    />
                                </GridItem>

                                <GridItem>
                                    <Text fontSize="sm" mb={1} fontWeight="medium">
                                        Variables
                                    </Text>
                                    <Select
                                        size="sm"
                                        value={param.type === "constant" ? "Constant" : "Inconstant"}
                                        onChange={(e) => handleVariableChange(0, paramIndex, e.target.value)}
                                        sx={inputStyles}
                                    >
                                        <option value="Inconstant">Inconstant</option>
                                        <option value="Constant">Constant</option>
                                    </Select>
                                </GridItem>

                                <GridItem>
                                    <Text fontSize="sm" mb={1} fontWeight="medium">
                                        Range
                                    </Text>
                                    <HStack spacing={2}>
                                        <Input
                                            size="sm"
                                            placeholder="Min Value"
                                            value={param.min}
                                            onChange={(e) => updateParameter(0, paramIndex, "min", e.target.value)}
                                            sx={inputStyles}
                                        />
                                        <Text fontSize="xs">to</Text>
                                        <Input
                                            size="sm"
                                            placeholder="Max Value"
                                            value={param.max}
                                            onChange={(e) => updateParameter(0, paramIndex, "max", e.target.value)}
                                            sx={inputStyles}
                                        />
                                    </HStack>
                                </GridItem>

                                <GridItem>
                                    <Text fontSize="sm" mb={1} fontWeight="medium">
                                        Unit
                                    </Text>
                                    <Select
                                        size="sm"
                                        value={param.unit}
                                        onChange={(e) => updateParameter(0, paramIndex, "unit", e.target.value)}
                                        sx={inputStyles}
                                    >
                                        <option value="">Select Unit</option>
                                        <option value="Celsius">Celsius</option>
                                        <option value="Lux">Lux</option>
                                        <option value="PPM">PPM</option>
                                    </Select>
                                </GridItem>
                            </Grid>
                        ))}
                    </Box>

                    {/* Add Parameters Specification */}
                    <Box>
                        <Text fontSize="md" fontWeight="bold" mb={3}>
                            Add Parameters Specification
                        </Text>

                        {components[0]?.parameters?.filter(p => p.type === "constant").map((param, paramIndex) => {
                            // Find the index of constant parameter in the original array
                            const originalIndex = components[0].parameters.findIndex(p =>
                                p.type === "constant" &&
                                p.name === param.name
                            );

                            return (
                                <Grid key={paramIndex} templateColumns="repeat(3, 1fr)" gap={4} mb={3}>
                                    <GridItem>
                                        <Text fontSize="sm" mb={1} fontWeight="medium">
                                            Component Name
                                        </Text>
                                        <Select
                                            size="sm"
                                            value={components[0]?.name || ""}
                                            sx={inputStyles}
                                        >
                                            <option value={components[0]?.name || ""}>
                                                {components[0]?.name || "Select Component"}
                                            </option>
                                        </Select>
                                    </GridItem>

                                    <GridItem>
                                        <Text fontSize="sm" mb={1} fontWeight="medium">
                                            Variables
                                        </Text>
                                        <Select
                                            size="sm"
                                            value="Constant"
                                            sx={inputStyles}
                                        >
                                            <option value="Constant">Constant</option>
                                            <option value="Inconstant">Inconstant</option>
                                        </Select>
                                    </GridItem>

                                    <GridItem>
                                        <Text fontSize="sm" mb={1} fontWeight="medium">
                                            Constant Values
                                        </Text>
                                        <Input
                                            size="sm"
                                            placeholder="Select Unit"
                                            value={param.value}
                                            onChange={(e) => updateParameter(0, originalIndex, "value", e.target.value)}
                                            sx={inputStyles}
                                        />
                                    </GridItem>
                                </Grid>
                            );
                        })}

                        <Button
                            size="xs"
                            colorScheme="blue"
                            variant="outline"
                            leftIcon={<AddIcon />}
                            onClick={() => addParameter(0, "constant")}
                        >
                            Add Parameters
                        </Button>
                    </Box>

                    {/* URL Link */}
                    <Box>
                        <Text fontSize="md" fontWeight="bold" mb={2}>
                            Url Link{" "}
                            <Text as="span" color="red.500">
                                *
                            </Text>
                        </Text>
                        <Input
                            size="sm"
                            value={urlLink}
                            onChange={(e) => setUrlLink(e.target.value)}
                            sx={inputStyles}
                            placeholder="Enter URL"
                        />
                    </Box>

                    {/* Note */}
                    <Box>
                        <Text fontSize="md" fontWeight="bold" mb={2}>
                            Note (Optional)
                        </Text>
                        <Textarea
                            size="sm"
                            minH="80px"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            sx={inputStyles}
                            placeholder="Add notes here..."
                        />
                    </Box>

                    {/* Identity of Device */}
                    <Box>
                        <Text fontSize="md" fontWeight="bold" mb={3}>
                            Identity Of Device
                        </Text>

                        <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                            <GridItem>
                                <Text fontSize="sm" mb={1} fontWeight="medium">
                                    IMEI
                                </Text>
                                <Select
                                    size="sm"
                                    value={deviceInfo.imei}
                                    onChange={(e) =>
                                        setDeviceInfo({ ...deviceInfo, imei: e.target.value })
                                    }
                                    sx={inputStyles}
                                >
                                    <option value="">Select</option>
                                </Select>
                            </GridItem>

                            <GridItem>
                                <Text fontSize="sm" mb={1} fontWeight="medium">
                                    ICCID{" "}
                                    <Text as="span" color="red.500">
                                        *
                                    </Text>
                                </Text>
                                <Select
                                    size="sm"
                                    value={deviceInfo.iccid}
                                    onChange={(e) =>
                                        setDeviceInfo({ ...deviceInfo, iccid: e.target.value })
                                    }
                                    sx={inputStyles}
                                >
                                    <option value="">Select</option>
                                </Select>
                            </GridItem>

                            <GridItem>
                                <Text fontSize="sm" mb={1} fontWeight="medium">
                                    Phone No.{" "}
                                    <Text as="span" color="red.500">
                                        *
                                    </Text>
                                </Text>
                                <Select
                                    size="sm"
                                    value={deviceInfo.phone}
                                    onChange={(e) =>
                                        setDeviceInfo({ ...deviceInfo, phone: e.target.value })
                                    }
                                    sx={inputStyles}
                                >
                                    <option value="">0987654321</option>
                                </Select>
                            </GridItem>
                        </Grid>
                    </Box>

                    {/* Cancel and Create Product Buttons */}
                    <HStack justify="center" spacing={6} mt={8} pt={4} borderTop="1px" borderColor="gray.300">
                        <Button
                            variant="outline"
                            size="md"
                            borderColor="blue.500"
                            color="blue.500"
                            onClick={handleCancel}
                            px={10}
                        >
                            Cancel
                        </Button>
                        <Button
                            colorScheme="blue"
                            size="md"
                            px={10}
                            onClick={handleFinalSubmit}
                        >
                            Create Product
                        </Button>
                    </HStack>
                </VStack>
            </Box>

            {/* POPUP FOR ADDING COMPONENT FROM + BUTTON */}
            {showComponentPopup && (
                <Box
                    position="fixed"
                    top={0}
                    left={0}
                    w="100vw"
                    h="100vh"
                    bg="blackAlpha.400"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    zIndex={1000}
                >
                    <Box
                        bg="#f5f5f5"
                        borderRadius="md"
                        borderWidth="1px"
                        maxW="400px"
                        w="100%"
                        p={6}
                    >
                        <HStack justify="space-between" mb={4}>
                            <Text fontSize="sm" fontWeight="semibold">
                                Add Component
                            </Text>
                            <Button
                                variant="ghost"
                                size="sm"
                                fontSize="sm"
                                onClick={handleComponentPopupCancel}
                                px={2}
                            >
                                ✕
                            </Button>
                        </HStack>

                        <VStack align="stretch" spacing={4}>
                            <Box>
                                <Text fontSize="xs" mb={1}>
                                    Component Type
                                </Text>
                                <Select
                                    size="sm"
                                    value={newComponent.type}
                                    onChange={(e) =>
                                        setNewComponent((prev) => ({
                                            ...prev,
                                            type: e.target.value,
                                        }))
                                    }
                                    sx={inputStyles}
                                >
                                    <option value="Sensor">Sensor</option>
                                    <option value="Actuator">Actuator</option>
                                </Select>
                            </Box>

                            <Box>
                                <Text fontSize="xs" mb={1}>
                                    Component Name{" "}
                                    <Text as="span" color="red.500">
                                        *
                                    </Text>
                                </Text>
                                <Input
                                    size="sm"
                                    value={newComponent.name}
                                    onChange={(e) =>
                                        setNewComponent((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    sx={inputStyles}
                                    placeholder="Enter component name"
                                />
                            </Box>
                        </VStack>

                        <Box textAlign="center" mt={6}>
                            <Button
                                colorScheme="blue"
                                size="sm"
                                px={8}
                                onClick={handleComponentPopupSubmit}
                            >
                                Submit
                            </Button>
                        </Box>
                    </Box>
                </Box>
            )}
        </Box>
    );
}