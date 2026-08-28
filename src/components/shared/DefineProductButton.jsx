import React from "react";
import { Box } from "@chakra-ui/react";
import { useProject } from "../../ProjectContext";
import CreateProductDefintionModal from "../Product/ProductDefinitionModal/CreateProductDefintionModal";
import ProductEditModal from "../Product/ProductEdit/ProductEditModal";
import { checkProductDefinition } from "../EmbeddedFileManagement/EmbeddedFileManagement";
import { useState, useEffect } from "react";
import { fetchFileSystem, buildTree } from "../EmbeddedFileManagement/EmbeddedFileManagement";

/**
 * DefineProductButton - A reusable component that displays either 
 * "Define Product" or "View Product" button based on product definition status
 * 
 * @param {Object} props - Component props
 * @param {string} props.position - Position style: 'fixed-top-right', 'inline', 'flex-end' (default: 'inline')
 * @param {string} props.zIndex - z-index for positioning (default: 999)
 * @param {Object} props.containerStyle - Additional styles for the container
 */
const DefineProductButton = ({ 
  position = 'inline', 
  zIndex = 999, 
  containerStyle = {} 
}) => {
  const [isProductDefined, setIsProductDefined] = useState(null);
  const [fileSystem, setFileSystem] = useState({});
  
  const {
    activeProjectName,
    activeProjectId,
    activeProductId,
    user,
  } = useProject();

  // Fetch product definition status
  const fetchProductDefinition = async (activeProductId, setIsProductDefined) => {
    if (!activeProductId) {
      setIsProductDefined(false); // Set to false to show "Define Product"
      return;
    }

    try {
      await checkProductDefinition(activeProductId, setIsProductDefined);
    } catch (error) {
      console.error("Error fetching product definition:", error);
      setIsProductDefined(false);
    }
  };

  useEffect(() => {
    fetchProductDefinition(activeProductId, setIsProductDefined);
  }, [activeProductId]);

  useEffect(() => {
    try {
      if (user?.userId) {
        fetchFileSystem(user.userId, setFileSystem, buildTree);
      }
    } catch (error) {
      console.log(error);
    }
  }, [user?.userId]);

  // Get position-specific styles
  const getPositionStyles = () => {
    switch (position) {
      case 'fixed-top-right':
        return {
          position: 'fixed',
          top: '80px', // Below navbar
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

  // Always render the button to allow users to create/view products IF a valid project is active
  if (!activeProjectId || !activeProductId || !activeProjectName || activeProjectName === "Untitled Project") {
    return null;
  }

  return (
    <Box
      style={{
        ...getPositionStyles(),
        ...containerStyle,
      }}
    >
      {isProductDefined ? (
        <ProductEditModal
          setIsProductDefined={setIsProductDefined}
          productID={activeProductId || 'new-product'}
          productName={activeProjectName || 'New Product'}
          fetchFileSystem={() =>
            fetchFileSystem(user?.userId, setFileSystem, buildTree)
          }
        />
      ) : (
        <CreateProductDefintionModal
          setIsProductDefined={setIsProductDefined}
          productID={activeProductId || 'new-product'}
          productName={activeProjectName || 'New Product'}
          fetchFileSystem={() =>
            fetchFileSystem(user?.userId, setFileSystem, buildTree)
          }
        />
      )}
    </Box>
  );
};

export default DefineProductButton;
