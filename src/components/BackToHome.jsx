import { IconButton } from "@chakra-ui/react";
import { ArrowLeftIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const BackButton = () => {
  const navigate = useNavigate();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, []);

  const handleBack = () => {
    if (canGoBack) {
      navigate(-1);
    }
  };

  return (
    <IconButton
      icon={<ArrowLeftIcon />}
      onClick={handleBack}
      aria-label="Back"
      isDisabled={!canGoBack}
      size="sm"
      variant="ghost"
      _hover={{ bg: "gray.200" }}
      _active={{ bg: "gray.300" }}
    />
  );
};

export default BackButton;
