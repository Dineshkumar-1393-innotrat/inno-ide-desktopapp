import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Heading,
  Image,
  VStack,
  Text
} from '@chakra-ui/react';
import HardwareoneImage from "../images/writecode.svg";
import SoftwareoneImage from "../images/flowchart.svg";
import BgTemp from "../images/bgtemp.avif";

const InnovationCards = () => {
  const navigate = useNavigate();

  return (
    <Box minH="100vh" bgImage={ BgTemp } p={8}>
      <Container maxW="6xl">
        <Heading 
          textAlign="center" 
          color="black" 
          fontSize="3xl" 
          mb={8}
          fontWeight="bold"
        >
          "Your Canvas is Here Choose One !"
        </Heading>
        
        <Grid templateColumns={{base: '1fr', md: 'repeat(2, 1fr)'}} gap={6}>
          {/* Hardware Card */}
          <Box 
            bg="gray.800" 
            borderRadius="lg" 
            overflow="hidden"
            boxShadow="lg"
          >
            <VStack spacing={0}>
           <Image
             src={SoftwareoneImage }
             alt="Hardware Development"
             objectFit="contain" // This will make the image fit without cropping
             objectPosition="center"
             h="350px"
             w="full"
             bg="gray.300" // Change this to any background color you prefer
             p="2" // Optional padding for better appearance
           />
              <Box p={6} textAlign="center" w="full">
                <Text 
                  color="white" 
                  fontSize="xl" 
                  mb={6}
                  whiteSpace="pre-line"
                >
Draw block diagram, flow
chart and generate code                  </Text>
                <Button
                  onClick={() =>     navigate('/blockdiagram')}
                  bg="black"
                  color="white"
                  px={6}
                  _hover={{ bg: 'gray.900' }}
                >
                  Try Out
                </Button>
              </Box>
            </VStack>
          </Box>

          {/* Virtual Device Card */}
          <Box 
            bg="gray.800" 
            borderRadius="lg" 
            overflow="hidden"
            boxShadow="lg"
          >
            <VStack spacing={0}>
            <Image
             src={HardwareoneImage }
             alt="Hardware Development"
             objectFit="contain" // This will make the image fit without cropping
             objectPosition="center"
             h="350px"
             w="full"
             bg="gray.300" // Change this to any background color you prefer
             p="2" // Optional padding for better appearance
           />
              <Box p={6} textAlign="center" w="full">
                <Text 
                  color="white" 
                  fontSize="xl" 
                  mb={6}
                  whiteSpace="pre-line"
                >
write your code and flash               </Text>
                <Button
                  onClick={() =>     navigate('/editor') }
                  bg="black"
                  color="white"
                  px={6}
                  _hover={{ bg: 'gray.900' }}
                >
                  Try Out
                </Button>
              </Box>
            </VStack>
          </Box>
        </Grid>
      </Container>
    </Box>
  );
};

export default InnovationCards;