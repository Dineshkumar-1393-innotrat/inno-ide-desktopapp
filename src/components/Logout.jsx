// import { Button, useToast } from "@chakra-ui/react";
import { API } from '@/config';
// import { useEffect, useState } from "react";
// import axios from "axios";

// const LogoutButton = () => {
//   const [token, setToken] = useState(null);
//   const toast = useToast();

//   useEffect(() => {
//     // Check if token exists in local session
//     const storedToken = sessionStorage.getItem("token");
//     if (storedToken) {
//       setToken(storedToken);
//     }
//   }, []);

//   const handleLogout = async () => {
//     if (!token) return;

//     try {
//       await axios.post(`${API.MAIN}/api/v1/auth/logout`, { token });

//       // Remove token from session storage
//       sessionStorage.removeItem("token");
//       setToken(null);

//       toast({
//         title: "Logged out successfully",
//         status: "success",
//         duration: 3000,
//         isClosable: true,
//       });
//     } catch (error) {
//       toast({
//         title: "Logout failed",
//         description: error.response?.data?.message || "Something went wrong",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//     }
//   };

//   // Hide button if no token exists
//   if (!token) return null;

//   return (
//     <Button colorScheme="red" onClick={handleLogout}>
//       Logout
//     </Button>
//   );
// };

// export default LogoutButton;

import { Button, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthButton = () => {
  const [token, setToken] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve token from session storage
    const storedToken = sessionStorage.getItem("token");
    if (storedToken) setToken(storedToken);
  }, []);

  const handleLogout = async () => {
    if (!token || isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await axios.post(`${API.MAIN}/api/v1/auth/logout`, { token });

      // On successful logout, clear session storage and navigate
      sessionStorage.removeItem("token");
      setToken(null);

      toast({
        title: "Logged out successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate("/"); // Secure redirect after API call
    } catch (error) {
      toast({
        title: "Logout failed",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return token ? (
    <Button colorScheme="red" size="sm" onClick={handleLogout} isLoading={isLoggingOut}>
      Logout
    </Button>
  ) : (
    <Button colorScheme="blue" onClick={() => navigate("/")}>
      Login
    </Button>
  );
};

export default AuthButton;
