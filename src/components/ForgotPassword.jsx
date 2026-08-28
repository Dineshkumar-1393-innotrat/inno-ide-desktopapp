// import React, { useState } from "react";
import { API } from '@/config';
// import {
//   Box,
//   Heading,
//   Input,
//   FormControl,
//   FormLabel,
//   Button,
//   VStack,
//   Text,
//   Alert,
//   AlertIcon,
//   useColorModeValue,
// } from "@chakra-ui/react";
// import { useNavigate } from "react-router-dom";

// const ForgotPassword = () => {
//   const [email, setEmail] = useState("");
//   const [alert, setAlert] = useState({ type: "", message: "" });
//   const navigate = useNavigate();

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (!email) {
//       setAlert({ type: "error", message: "Please enter your email address." });
//       return;
//     }

//     setAlert({
//       type: "success",
//       message: "Password reset instructions have been sent to your email.",
//     });
//     setEmail("");
//   };

//   return (
//     <Box
//       bg={useColorModeValue("gray.50", "gray.800")}
//       p={6}
//       maxW="400px"
//       borderRadius="lg"
//       shadow="md"
//       mx="auto"
//       mt={10}
//     >
//       <Heading as="h2" size="lg" mb={4} textAlign="center">
//         Forgot Password
//       </Heading>

//       {alert.message && (
//         <Alert status={alert.type} mb={4} borderRadius="md">
//           <AlertIcon />
//           {alert.message}
//         </Alert>
//       )}

//       <form onSubmit={handleSubmit}>
//         <VStack spacing={4}>
//           <FormControl id="email" isRequired>
//             <FormLabel>Email Address</FormLabel>
//             <Input
//               type="email"
//               name="email"
//               placeholder="Enter your email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               size="sm"
//             />
//           </FormControl>

//           <Button type="submit" colorScheme="blue" size="sm" w="100%">
//             Reset Password
//           </Button>
//         </VStack>
//       </form>

//       <Text fontSize="sm" color="gray.600" mt={4} textAlign="center">
//         Remember your password?{" "}
//         <Text
//           as="span"
//           color="blue.500"
//           cursor="pointer"
//           onClick={() => navigate("/")}
//         >
//           Log In
//         </Text>
//       </Text>
//     </Box>
//   );
// };

// export default ForgotPassword;
import React, { useState } from "react";
import {
  Box,
  Heading,
  Input,
  FormControl,
  FormLabel,
  Button,
  VStack,
  Text,
  Alert,
  AlertIcon,
  useColorModeValue,
  InputGroup,
  InputLeftAddon,
  InputRightElement,
  IconButton,
  HStack,
  Image,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import loginImage from '../images/image.jpg';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Forgot Password, 2: Reset Password
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const navigate = useNavigate();

  const validateMobileNumber = (number) => {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(number);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: "", message: "" });

    if (!mobileNumber) {
      setAlert({ type: "error", message: "Please enter your mobile number." });
      return;
    }

    if (!validateMobileNumber(mobileNumber)) {
      setAlert({ type: "error", message: "Please enter a valid 10-digit mobile number." });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API.MAIN}/api/v1/auth/forgotPassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobileNumber,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setAlert({
          type: "success",
          message: data.message || "OTP sent successfully.",
        });
        setStep(2);
      } else {
        throw new Error(data.message || 'Forgot password request failed');
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: error.message || "Failed to process your request. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: "", message: "" });

    if (!otp || !newPassword || !confirmPassword) {
      setAlert({ type: "error", message: "All fields are required." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlert({ type: "error", message: "Passwords do not match." });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API.MAIN}/api/v1/auth/resetPassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobileNumber,
          otp,
          newPassword,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setAlert({
          type: "success",
          message: data.message || "Password reset successful.",
        });
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        throw new Error(data.message || 'Password reset failed');
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: error.message || "Failed to reset password. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box position="relative" width="100vw" height="100vh" overflow="hidden" bg="gray.50">
      {/* Full-Screen Background Image */}
      

      <Box
        position="relative"
        zIndex={10}
        minHeight="100vh"
        width="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
        pt={{ base: "20px", md: "0" }}
      >
        <Box
          p={{ base: 6, md: 8 }}
          maxW="450px"
          width="full"
          borderRadius="2xl"
          bg="white"
          border="1px solid"
          borderColor="gray.100"
          boxShadow="xl"
          mx={{ base: 2, md: 4 }}
        >
          <VStack spacing={2} mb={8}>
            <Heading as="h2" size={{ base: "lg", md: "xl" }} color="gray.800" fontWeight="extrabold" textAlign="center" >
              {step === 1 ? "Forgot Password" : "Reset Password"}
            </Heading>
            <Text color="gray.600" fontSize={{ base: "sm", md: "md" }} textAlign="center" fontWeight="medium">
              {step === 1
                ? "Enter your mobile number to receive an OTP"
                : "Enter the OTP sent to your phone and choose a new password"}
            </Text>
          </VStack>

          {alert.message && (
            <Alert status={alert.type} mb={6} borderRadius="lg" bg={alert.type === 'error' ? 'rgba(229, 62, 62, 0.2)' : 'rgba(56, 161, 105, 0.2)'} color="gray.800" border={`1px solid ${alert.type === 'error' ? 'rgba(229, 62, 62, 0.5)' : 'rgba(56, 161, 105, 0.5)'}`}>
              <AlertIcon color={alert.type === 'error' ? 'red.300' : 'green.300'} />
              {alert.message}
            </Alert>
          )}

          {step === 1 ? (
            <form onSubmit={handleForgotSubmit} style={{ width: '100%' }}>
              <VStack spacing={5}>
                <FormControl id="mobileNumber" isRequired>
                  <FormLabel fontWeight="semibold" color="gray.700" mb={1}>Mobile Number</FormLabel>
                  <InputGroup size="lg">
                    <InputLeftAddon children="+91" borderRadius="lg" bg="rgba(0,0,0,0.4)" color="gray.600" border="1px solid rgba(255,255,255,0.1)" borderRight="none" />
                    <Input type="tel" placeholder="10-digit number" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))} maxLength={10} borderRadius="lg" borderLeftRadius="0" bg="white" color="gray.800" border="1px solid" borderColor="gray.200" _placeholder={{ color: 'gray.400' }} _focus={{ borderColor: "purple.400", boxShadow: "0 0 0 1px #9F7AEA" }} sx={{ '&:-webkit-autofill': { WebkitBoxShadow: '0 0 0 30px white inset !important', WebkitTextFillColor: '#1A202C !important', transition: 'background-color 5000s ease-in-out 0s' } }} />
                  </InputGroup>
                </FormControl>

                <Button type="submit" width="full" height="50px" isLoading={isLoading} loadingText="Sending OTP..." bgGradient="linear(to-r, purple.500, blue.500)" color="white" fontSize="md" fontWeight="bold" _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)", transform: "translateY(-1px)", boxShadow: "0 10px 20px -10px rgba(102, 126, 234, 0.6)" }} _active={{ transform: "translateY(0)" }} transition="all 0.2s" borderRadius="lg" mt={2}>
                  Send OTP
                </Button>
              </VStack>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} style={{ width: '100%' }}>
              <VStack spacing={4}>
                <FormControl id="otp" isRequired>
                  <FormLabel fontWeight="semibold" color="gray.700" mb={1}>OTP</FormLabel>
                  <Input type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} size="lg" borderRadius="lg" bg="white" color="gray.800" border="1px solid" borderColor="gray.200" _placeholder={{ color: 'gray.400' }} _focus={{ borderColor: "purple.400", boxShadow: "0 0 0 1px #9F7AEA" }} sx={{ '&:-webkit-autofill': { WebkitBoxShadow: '0 0 0 30px white inset !important', WebkitTextFillColor: '#1A202C !important', transition: 'background-color 5000s ease-in-out 0s' } }} />
                </FormControl>

                <FormControl id="newPassword" isRequired>
                  <FormLabel fontWeight="semibold" color="gray.700" mb={1}>New Password</FormLabel>
                  <InputGroup size="lg" width="100%">
                    <Input type={showPassword ? "text" : "password"} placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} borderRadius="lg" w="100%" pr="3rem" bg="white" color="gray.800" border="1px solid" borderColor="gray.200" _placeholder={{ color: 'gray.400' }} _focus={{ borderColor: "purple.400", boxShadow: "0 0 0 1px #9F7AEA" }} sx={{ '&:-webkit-autofill': { WebkitBoxShadow: '0 0 0 30px white inset !important', WebkitTextFillColor: '#1A202C !important', transition: 'background-color 5000s ease-in-out 0s' } }} />
                    <InputRightElement h="full" width="3rem" right="0">
                      <IconButton aria-label={showPassword ? "Hide password" : "Show password"} icon={showPassword ? <FaEyeSlash /> : <FaEye />} onClick={() => setShowPassword(!showPassword)} variant="ghost" color="gray.500" _hover={{ bg: 'whiteAlpha.200', color: 'black' }} size="sm" />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <FormControl id="confirmPassword" isRequired>
                  <FormLabel fontWeight="semibold" color="gray.700" mb={1}>Confirm Password</FormLabel>
                  <InputGroup size="lg" width="100%">
                    <Input type={showPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} size="lg" borderRadius="lg" w="100%" pr="3rem" bg="white" color="gray.800" border="1px solid" borderColor="gray.200" _placeholder={{ color: 'gray.400' }} _focus={{ borderColor: "purple.400", boxShadow: "0 0 0 1px #9F7AEA" }} sx={{ '&:-webkit-autofill': { WebkitBoxShadow: '0 0 0 30px white inset !important', WebkitTextFillColor: '#1A202C !important', transition: 'background-color 5000s ease-in-out 0s' } }} />
                    <InputRightElement h="full" width="3rem" right="0">
                      <IconButton aria-label={showPassword ? "Hide password" : "Show password"} icon={showPassword ? <FaEyeSlash /> : <FaEye />} onClick={() => setShowPassword(!showPassword)} variant="ghost" color="gray.500" _hover={{ bg: 'whiteAlpha.200', color: 'black' }} size="sm" />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <VStack spacing={3} w="100%" pt={4}>
                  <Button type="submit" width="full" height="50px" isLoading={isLoading} loadingText="Resetting..." bgGradient="linear(to-r, purple.500, blue.500)" color="white" fontSize="md" fontWeight="bold" _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)", transform: "translateY(-1px)", boxShadow: "0 10px 20px -10px rgba(102, 126, 234, 0.6)" }} _active={{ transform: "translateY(0)" }} transition="all 0.2s" borderRadius="lg">
                    Reset Password
                  </Button>

                  <Button variant="ghost" onClick={() => setStep(1)} color="gray.500" size="md" _hover={{ color: "white", bg: "whiteAlpha.200" }} width="full">
                    Back to Mobile Number
                  </Button>
                </VStack>
              </VStack>
            </form>
          )}

          <HStack pt={6} justify="center">
            <Text fontSize="sm" color="gray.600">Remember your password?</Text>
            <Text as="span" color="purple.300" fontWeight="bold" fontSize="sm" cursor="pointer" onClick={() => navigate("/")} _hover={{ color: "purple.200", textDecoration: "none" }}>
              Log In
            </Text>
          </HStack>
        </Box>
      </Box>
    </Box>
  );
};

export default ForgotPassword;