import React from 'react';
import {
    Box,
    SimpleGrid,
    Text,
    VStack,
    Heading,
} from '@chakra-ui/react';
import CommonParameterForm from './CommonParameterForm';
import VariableOnlyForm from './VariableOnlyForm';
import SensorActuatorForm from './SensorActuatorForm';

const ParameterShowcase = () => {
    return (
        <Box p={10} bg="white" minH="100vh">
            <SimpleGrid columns={3} spacing={10} alignItems="start">
                {/* Left Column */}
                <VStack align="stretch" spacing={4}>
                    <Heading size="md" fontWeight="medium">Add Parameter (Common For All)</Heading>
                    <CommonParameterForm onSubmit={() => console.log('Common Form Submitted')} />
                </VStack>

                {/* Middle Column */}
                <VStack align="stretch" spacing={4}>
                    <Box h="40px" /> {/* Spacer to align with header height */}
                    <VariableOnlyForm onSubmit={() => console.log('Variable Form Submitted')} />
                </VStack>

                {/* Right Column */}
                <VStack align="stretch" spacing={4}>
                    <Heading size="md" fontWeight="medium">
                        Add Parameter<br />
                        For Sensor And Actuator Only
                    </Heading>
                    <SensorActuatorForm onSubmit={() => console.log('Sensor/Actuator Form Submitted')} />
                </VStack>
            </SimpleGrid>
        </Box>
    );
};

export default ParameterShowcase;
