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
import HardwareImage from "../images/motherboard.avif";
import SoftwareImage from "../images/testyouridea.svg";
import BgTemp from "../images/bgtemp.avif";

const InnovationCards = () => {
  const navigate = useNavigate();

  return (
    <Box minH="100vh" bgImage={ BgTemp } p={8}>
      <Container maxW="7xl">
        <Heading 
          textAlign="center" 
          color="black" 
          fontSize="3xl" 
          mb={8}
          fontWeight="bold"
        >
          "Experience Innovation Your Way !"
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
  src={HardwareImage}
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
                  Write, Flash Code & Manage{'\n'}Your Hardware
                </Text>
                <Button
                  onClick={() =>     navigate('/templatetwo')}
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
  src={SoftwareImage}
  alt="Software Development"
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
                  Test Your Ideal By Creating{'\n'}Virtual Device
                </Text>
                <Button
                  onClick={() =>     navigate('/embedded') }
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