import React, { useState } from 'react';
import { API } from '@/config';
import {
    Box,
    VStack,
    Text,
    Input,
    Button,
    useToast,
} from '@chakra-ui/react';
import axios from 'axios';

const VariableOnlyForm = ({ onSubmit }) => {
    const [variables, setVariables] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const inputStyles = {
        bg: "#D9D9D9",
        border: "none",
        borderRadius: "md",
        h: "40px",
        _focus: {
            bg: "#C0C0C0",
        }
    };

    const labelStyles = {
        fontSize: "lg",
        fontWeight: "normal",
        mb: 2,
        color: "black",
    };

    const handleSubmit = async () => {
        if (!variables.trim()) {
            toast({
                title: "Missing Variable Name",
                description: "Please enter a variable name.",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                variableName: variables.trim()
            };

            const resp = await axios.post(`${API.MAIN}/api/v2/parameterVariables`, payload);

            toast({
                title: "Variable Added",
                description: "Successfully registered variable with the server.",
                status: "success",
                duration: 3000,
            });

            if (onSubmit) {
                onSubmit({ variables: variables.trim(), apiResponse: resp.data });
            }

            setVariables('');
        } catch (error) {
            console.error("API Error (parameterVariables):", error);
            toast({
                title: "Failed to Add Variable",
                description: error.response?.data?.message || error.message,
                status: "error",
                duration: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p={6} border="1px solid #7D7D7D" borderRadius="none" w="full" maxW="350px" bg="white">
            <VStack align="stretch" spacing={6}>
                <Box>
                    <Text sx={labelStyles}>Add Variables</Text>
                    <Input
                        sx={inputStyles}
                        value={variables}
                        onChange={(e) => setVariables(e.target.value)}
                        placeholder="e.g. onConstant"
                        id="test-var-only-variables"
                    />
                </Box>
                <Box textAlign="center">
                    <Button
                        bg="#0E428E"
                        color="white"
                        borderRadius="md"
                        px={8}
                        _hover={{ bg: "#0A3370" }}
                        isLoading={loading}
                        onClick={handleSubmit}
                        id="test-var-only-submit"
                    >
                        Submit
                    </Button>
                </Box>
            </VStack>
        </Box>
    );
};

export default VariableOnlyForm;
