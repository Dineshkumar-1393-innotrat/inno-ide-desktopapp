import React from "react";
import { Box } from "@chakra-ui/react";
import CreateProductButton from "./CreateProductButton";

/**
 * DefineProductButton - Positioned wrapper for CreateProductButton.
 * Displays either "Define Product" or "View Product" based on product definition status.
 */
const DefineProductButton = ({ 
  position = 'inline', 
  zIndex = 999, 
  containerStyle = {} 
}) => {
  const getPositionStyles = () => {
    switch (position) {
      case 'fixed-top-right':
        return {
          position: 'fixed',
          top: '80px',
          right: '20px',
          zIndex: zIndex,
        };
      case 'flex-end':
        return {
          display: 'flex',
          justifyContent: 'flex-end',
          width: '100%',
          zIndex: zIndex,
        };
      case 'inline':
      default:
        return {
          zIndex: zIndex,
        };
    }
  };

  return (
    <Box
      style={{
        ...getPositionStyles(),
        ...containerStyle,
      }}
    >
      <CreateProductButton />
    </Box>
  );
};

export default DefineProductButton;
