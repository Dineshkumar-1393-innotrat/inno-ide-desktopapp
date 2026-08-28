import {
  Box,
  HStack,
  VStack,
  Text,
  Link as ChakraLink,
  Icon,
  useColorMode,
} from "@chakra-ui/react";
import {
  FaFacebook,
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";
import { Link } from "react-router-dom"; // Import Link from react-router-dom

const Footer = () => {
  const { colorMode } = useColorMode();

  const bgColor = colorMode === "dark" ? "#0f0a19" : "gray.200";
  const textColor = colorMode === "dark" ? "gray.500" : "gray.1000";
  const borderColor = colorMode === "dark" ? "gray.600" : "gray.300";

  return (
    <Box as="footer" bg={bgColor} color={textColor} py={12} px={8}>
      <HStack spacing={12} justify="space-between">
        {/* Company Info is in this part sir  */}
        <VStack align="start" spacing={4}>
          <Text fontSize="2xl" fontWeight="bold">
            Innotrat Labs
          </Text>
          <Text maxW="300px">
            At Innotrat, we blend expertise and creativity to drive
            technological advancements.
          </Text>
          <HStack spacing={6} mt={6}>
            {/* Social Media Icons is palced here sir  */}
            <ChakraLink
              href="https://www.facebook.com/InnotratLabs/"
              aria-label="Facebook"
              isExternal
            >
              <Icon as={FaFacebook} boxSize={7} />
            </ChakraLink>
            <ChakraLink
              href="https://x.com/i/flow/login?redirect_after_login=%2FInnotrat_Labs"
              aria-label="Twitter"
              isExternal
            >
              <Icon as={FaTwitter} boxSize={7} />
            </ChakraLink>
            <ChakraLink
              href="https://www.linkedin.com/company/innotrat-labs/"
              aria-label="LinkedIn"
              isExternal
            >
              <Icon as={FaLinkedin} boxSize={7} />
            </ChakraLink>
            <ChakraLink
              href="https://www.instagram.com/innotrat.labs/"
              aria-label="Instagram"
              isExternal
            >
              <Icon as={FaInstagram} boxSize={7} />
            </ChakraLink>
            <ChakraLink
              href="https://www.youtube.com/@innotratlabs"
              aria-label="YouTube"
              isExternal
            >
              <Icon as={FaYoutube} boxSize={7} />
            </ChakraLink>
          </HStack>
        </VStack>

        {/* Quick Links are done at this part sir  */}
        <VStack align="start" spacing={3}>
          <Text fontSize="xl" fontWeight="bold">
            Quick Links
          </Text>
          <ChakraLink as={Link} to="/">
            Home
          </ChakraLink>
          <ChakraLink as={Link} to="/feedback">
            Feedback
          </ChakraLink>
        </VStack>

        {/* Information part is this  */}
        <VStack align="start" spacing={3}>
          <Text fontSize="xl" fontWeight="bold">
            Information
          </Text>
          <Text>Contact</Text>
          <Text>Email: contact@innotrat.in</Text>
          <Text>Phone: +91 9777013904</Text>
          <Text>Sales: sales@innotrat.in</Text>
          <Text>Phone: +91 8970035093</Text>
        </VStack>

        {/* Location part is this  */}
        <VStack align="start" spacing={3}>
          <Text fontSize="xl" fontWeight="bold">
            Our Location
          </Text>
          <Text>Innotrat Labs, Chennai</Text>
          <Text>New No.7, Old No.147, Anna Salai, Little Mount, Saidapet</Text>
          <Text>Chennai, Tamil Nadu 600015</Text>
          <Text>Odisha Location:</Text>
          <Text>INNOVEX, CIPET Incubation, Patia, Bhubaneswar</Text>
          <Text>Odisha 751024</Text>
        </VStack>
      </HStack>

      {/* Footer Bottom Links here i have given */}
      <HStack
        justify="space-between"
        mt={16}
        pt={8}
        borderTop="1px solid"
        borderColor={borderColor}
      >
        <Text fontSize="md">
          Copyright © 2024 All rights reserved V1Rev1_19March2025-Dibyanshu
        </Text>
        <HStack spacing={6}>
          <ChakraLink as={Link} to="/feedback">
            Feedback
          </ChakraLink>{" "}
          {/* Link to feedback page */}
        </HStack>
      </HStack>
    </Box>
  );
};

export default Footer;
