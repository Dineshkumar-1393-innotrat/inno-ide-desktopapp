import React, { useState, useCallback } from 'react';
import {
  Box,
  Heading,
  Input,
  FormControl,
  FormLabel,
  Button,
  VStack,
  HStack,
  FormErrorMessage,
  useToast,
  useColorModeValue,
  Container,
  InputGroup,
  InputRightElement,
  IconButton,
  Text,
  Flex,
  Image,
  Link as ChakraLink
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { signup } from '../services/authService';
import { motion } from 'framer-motion';
import loginImage from '../images/image.jpg';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const NAME_REGEX = /^[a-zA-Z0-9_]+(?:\s[a-zA-Z0-9_]+)*$/;

const CreateAccount = () => {
  const [formData, setFormData] = useState({
    name: '',
    countryCode: '+91',
    mobileNumber: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  const validateForm = useCallback(() => {
    const newErrors = {};

    const trimmedName = (formData.name || '').trim();
    // White spaces should not be considered as characters when counting length
    const nameCharCount = trimmedName.replace(/\s+/g, '').length;

    if (!trimmedName || nameCharCount === 0) {
      newErrors.name = 'Full Name is required';
    } else if (nameCharCount < 3 || nameCharCount > 20) {
      newErrors.name = 'Name must be 3-20 characters (excluding spaces)';
    } else if (!NAME_REGEX.test(trimmedName)) {
      newErrors.name = 'Name can only contain letters, numbers, underscores, and single spaces between words';
    }

    const cleanMobile = (formData.mobileNumber || '').replace(/\s+/g, '');
    if (!cleanMobile) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(cleanMobile)) {
      newErrors.mobileNumber = 'Mobile number must be 10 digits';
    }

    const cleanPassword = (formData.password || '').replace(/\s+/g, '');
    if (!cleanPassword) {
      newErrors.password = 'Password is required';
    } else if (cleanPassword.length < 8) {
      newErrors.password = 'Password must be at least 8 characters (excluding spaces)';
    } else if (!PASSWORD_REGEX.test(cleanPassword)) {
      newErrors.password =
        'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character';
    }

    const cleanConfirm = (formData.confirmPassword || '').replace(/\s+/g, '');
    if (!cleanConfirm) {
      newErrors.confirmPassword = 'Confirm Password is required';
    } else if (cleanPassword !== cleanConfirm) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    let cleanValue = value;

    if (name === 'mobileNumber') {
      // White spaces are not considered as characters: strip spaces and non-digits, max 10
      cleanValue = value.replace(/\s+/g, '').replace(/\D/g, '').slice(0, 10);
    } else if (name === 'password' || name === 'confirmPassword') {
      // White spaces are not considered as characters in password fields
      cleanValue = value.replace(/\s+/g, '');
    } else if (name === 'name') {
      // White spaces are not considered as characters: prevent leading spaces and collapse multiple spaces
      cleanValue = value.replace(/^\s+/, '').replace(/\s{2,}/g, ' ');
    }

    setFormData(prev => ({ ...prev, [name]: cleanValue }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  const handleKeyDownNoSpaces = (e) => {
    if (e.key === ' ') {
      e.preventDefault();
    }
  };

  const handleNameKeyDown = (e) => {
    if (e.key === ' ' && (!formData.name || formData.name.endsWith(' '))) {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        name: (formData.name || '').trim(),
        countryCode: (formData.countryCode || '').trim() || '+91',
        mobileNumber: (formData.mobileNumber || '').replace(/\s+/g, ''),
        password: (formData.password || '').replace(/\s+/g, '')
      };

      const response = await signup(payload);

      if (response.status === 'success') {
        toast({
          title: 'Account created successfully',
          status: 'success',
          duration: 3000
        });
        navigate('/');
      } else {
        throw new Error(response.message || 'Failed to create account');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      countryCode: '+91',
      mobileNumber: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  return (
    <Box position="relative" width="100vw" height="100vh" overflow="hidden" bg="gray.50">
      {/* Full-Screen Background Image */}
      

      <Flex position="relative" zIndex={10} width="100%" height="100%" align="center" justify="center" pt={{ base: "20px", md: "0" }}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} style={{ width: '100%', maxWidth: '400px' }}>
          <Box
            p={{ base: 5, md: 6 }}
            borderRadius="2xl"
            bg="white"
            border="1px solid"
            borderColor="gray.100"
            boxShadow="xl"
            mx={{ base: 2, md: 4 }}
          >
            <VStack spacing={1} mb={4} textAlign="center">
              <Heading as="h2" size="lg" color="gray.800" fontWeight="extrabold" >
                Create Account
              </Heading>
              <Text color="gray.600" fontSize="sm" fontWeight="medium">
                Join Innotrat Labs IDE today
              </Text>
            </VStack>

            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isInvalid={!!errors.name} isRequired>
                  <FormLabel fontWeight="semibold" color="gray.700" mb={1}>Full Name</FormLabel>
                  <Input type="text" name="name" placeholder="Enter your full name" value={formData.name} onChange={handleChange} onKeyDown={handleNameKeyDown} autoComplete="name" size="md" height="42px" borderRadius="lg" bg="white" color="gray.800" border="1px solid" borderColor="gray.200" _placeholder={{ color: 'gray.400' }} _focus={{ borderColor: "purple.400", boxShadow: "0 0 0 1px #9F7AEA" }} sx={{ '&:-webkit-autofill': { WebkitBoxShadow: '0 0 0 30px white inset !important', WebkitTextFillColor: '#1A202C !important', transition: 'background-color 5000s ease-in-out 0s' } }} />
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>

                <HStack spacing={4} width="full">
                  <FormControl isRequired width="30%">
                    <FormLabel fontWeight="semibold" color="gray.700" mb={1}>Code</FormLabel>
                    <Input type="text" name="countryCode" value={formData.countryCode} isReadOnly size="md" height="42px" borderRadius="lg" bg="gray.100" color="gray.600" border="1px solid" borderColor="gray.200" _hover={{ borderColor: "rgba(255, 255, 255, 0.1)" }} />
                  </FormControl>

                  <FormControl isInvalid={!!errors.mobileNumber} isRequired width="70%">
                    <FormLabel fontWeight="semibold" color="gray.700" mb={1}>Mobile Number</FormLabel>
                    <Input type="tel" name="mobileNumber" placeholder="10-digit number" value={formData.mobileNumber} onChange={handleChange} onKeyDown={handleKeyDownNoSpaces} autoComplete="tel" size="md" height="42px" borderRadius="lg" bg="white" color="gray.800" border="1px solid" borderColor="gray.200" _placeholder={{ color: 'gray.400' }} _focus={{ borderColor: "purple.400", boxShadow: "0 0 0 1px #9F7AEA" }} sx={{ '&:-webkit-autofill': { WebkitBoxShadow: '0 0 0 30px white inset !important', WebkitTextFillColor: '#1A202C !important', transition: 'background-color 5000s ease-in-out 0s' } }} />
                    <FormErrorMessage>{errors.mobileNumber}</FormErrorMessage>
                  </FormControl>
                </HStack>

                <FormControl isInvalid={!!errors.password} isRequired>
                  <FormLabel fontWeight="semibold" color="gray.700" mb={1}>Password</FormLabel>
                  <InputGroup size="md" width="100%">
                    <Input type={showPassword ? 'text' : 'password'} name="password" placeholder="Create a strong password" value={formData.password} onChange={handleChange} onKeyDown={handleKeyDownNoSpaces} autoComplete="new-password" size="md" height="42px" borderRadius="lg" w="100%" pr="3rem" bg="white" color="gray.800" border="1px solid" borderColor="gray.200" _placeholder={{ color: 'gray.400' }} _focus={{ borderColor: "purple.400", boxShadow: "0 0 0 1px #9F7AEA" }} sx={{ '&:-webkit-autofill': { WebkitBoxShadow: '0 0 0 30px white inset !important', WebkitTextFillColor: '#1A202C !important', transition: 'background-color 5000s ease-in-out 0s' } }} />
                    <InputRightElement h="42px" width="3rem" right="0">
                      <IconButton aria-label={showPassword ? 'Hide password' : 'Show password'} icon={showPassword ? <ViewOffIcon /> : <ViewIcon />} onClick={() => setShowPassword(!showPassword)} variant="ghost" color="gray.500" _hover={{ bg: 'gray.100', color: 'gray.800' }} size="sm" />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.confirmPassword} isRequired>
                  <FormLabel fontWeight="semibold" color="gray.700" mb={1}>Confirm Password</FormLabel>
                  <InputGroup size="md" width="100%">
                    <Input type={showPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Re-enter your password" value={formData.confirmPassword} onChange={handleChange} onKeyDown={handleKeyDownNoSpaces} autoComplete="new-password" size="md" height="42px" borderRadius="lg" w="100%" pr="3rem" bg="white" color="gray.800" border="1px solid" borderColor="gray.200" _placeholder={{ color: 'gray.400' }} _focus={{ borderColor: "purple.400", boxShadow: "0 0 0 1px #9F7AEA" }} sx={{ '&:-webkit-autofill': { WebkitBoxShadow: '0 0 0 30px white inset !important', WebkitTextFillColor: '#1A202C !important', transition: 'background-color 5000s ease-in-out 0s' } }} />
                    <InputRightElement h="42px" width="3rem" right="0">
                      <IconButton aria-label={showPassword ? 'Hide password' : 'Show password'} icon={showPassword ? <ViewOffIcon /> : <ViewIcon />} onClick={() => setShowPassword(!showPassword)} variant="ghost" color="gray.500" _hover={{ bg: 'gray.100', color: 'gray.800' }} size="sm" />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                </FormControl>

                <VStack spacing={3} w="100%" pt={4}>
                  <Button type="submit" width="full" height="42px" isLoading={loading} loadingText="Creating Account..." bgGradient="linear(to-r, purple.500, blue.500)" color="white" fontSize="md" fontWeight="bold" _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)", transform: "translateY(-1px)", boxShadow: "0 10px 20px -10px rgba(102, 126, 234, 0.6)" }} _active={{ transform: "translateY(0)" }} transition="all 0.2s" borderRadius="lg">
                    Create Account
                  </Button>

                  <Button type="button" variant="ghost" size="md" onClick={resetForm} width="full" color="gray.500" fontWeight="medium" _hover={{ color: "gray.800", bg: "gray.100" }}>
                    Reset Form
                  </Button>

                  <HStack pt={2}>
                    <Text fontSize="sm" color="gray.600">Already have an account?</Text>
                    <ChakraLink color="purple.500" fontWeight="bold" fontSize="sm" onClick={() => navigate('/')} _hover={{ textDecoration: 'underline', color: 'purple.600' }}>
                      Sign In
                    </ChakraLink>
                  </HStack>
                </VStack>
              </VStack>
            </form>
          </Box>
        </motion.div>
      </Flex>
    </Box>
  );
};

export default CreateAccount;