import { useState } from "react";
import { Box, Button, FormControl, FormLabel, Input, Textarea, useToast, Heading, useColorMode } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom"; 

const Feedback = () => {
  const { colorMode } = useColorMode();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const toast = useToast();
  const navigate = useNavigate(); 

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "Feedback submitted.",
      description: "Thank you for your feedback!",
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    setName("");
    setEmail("");
    setFeedback("");
  };

  const handleReturnHome = () => {
    navigate("/template"); 
  };

  return (
    <Box
      p={6}
      borderRadius="md"
      boxShadow="lg"
      bg={colorMode === "dark" ? "gray.800" : "white"}
      border="1px solid"
      borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
      maxWidth="500px"
      mx="auto" 
      mt={8} 
    >
      <Heading as="h2" size="lg" mb={4} textAlign="center" color={colorMode === "dark" ? "white" : "gray.800"}>
        We Value Your Feedback
      </Heading>
      <form onSubmit={handleSubmit}>
        <FormControl id="name" mb={4}>
          <FormLabel fontWeight="semibold" color={colorMode === "dark" ? "white" : "gray.800"}>Name</FormLabel>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
            _hover={{ borderColor: "teal.400" }}
            _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.300" }}
            color={colorMode === "dark" ? "white" : "gray.800"}
            bg={colorMode === "dark" ? "gray.700" : "white"}
          />
        </FormControl>

        <FormControl id="email" mb={4}>
          <FormLabel fontWeight="semibold" color={colorMode === "dark" ? "white" : "gray.800"}>Email</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            required
            borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
            _hover={{ borderColor: "teal.400" }}
            _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.300" }}
            color={colorMode === "dark" ? "white" : "gray.800"}
            bg={colorMode === "dark" ? "gray.700" : "white"}
          />
        </FormControl>

        <FormControl id="feedback" mb={4}>
          <FormLabel fontWeight="semibold" color={colorMode === "dark" ? "white" : "gray.800"}>Feedback</FormLabel>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your thoughts here"
            required
            borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
            _hover={{ borderColor: "teal.400" }}
            _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.300" }}
            color={colorMode === "dark" ? "white" : "gray.800"}
            bg={colorMode === "dark" ? "gray.700" : "white"}
          />
        </FormControl>

        <Button type="submit" colorScheme="teal" width="full" mt={4}>
          Submit Feedback
        </Button>
      </form>

      <Button 
        onClick={handleReturnHome} 
        colorScheme="gray" 
        variant="outline" 
        width="full" 
        mt={4}
        borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
        _hover={{ borderColor: "teal.400" }}
        _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.300" }}
      >
        Return to Home
      </Button>
    </Box>
  );
};

export default Feedback;
