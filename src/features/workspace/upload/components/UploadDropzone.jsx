import React, { useRef, useState } from "react";
import { Box, VStack, Text, Icon, useColorModeValue } from "@chakra-ui/react";
import { UploadCloud, FileArchive } from "lucide-react";

const UploadDropzone = ({ onFileSelected, selectedFile, error }) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const borderColor = useColorModeValue(isDragging ? "blue.400" : "gray.300", isDragging ? "blue.400" : "gray.600");
  const bgColor = useColorModeValue(isDragging ? "blue.50" : "gray.50", isDragging ? "blue.900" : "gray.800");
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };
  
  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <VStack align="stretch" spacing={2}>
      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        border="2px dashed"
        borderColor={error ? "red.400" : borderColor}
        bg={bgColor}
        borderRadius="md"
        p={8}
        textAlign="center"
        cursor="pointer"
        transition="all 0.2s"
        _hover={{ bg: useColorModeValue("gray.100", "gray.700") }}
      >
        <input
          id="zip-upload-input"
          type="file"
          ref={inputRef}
          onChange={handleChange}
          accept=".zip"
          style={{ display: "none" }}
        />
        
        <VStack spacing={3}>
          {selectedFile ? (
             <>
               <Icon as={FileArchive} w={10} h={10} color="blue.500" />
               <Text fontWeight="semibold" color="blue.600">{selectedFile.name}</Text>
               <Text fontSize="sm" color="gray.500">
                 {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
               </Text>
             </>
          ) : (
            <>
              <Icon as={UploadCloud} w={10} h={10} color="gray.400" />
              <Text fontWeight="semibold">Click or drag ZIP file here to upload</Text>
              <Text fontSize="sm" color="gray.500">Max size 100MB</Text>
            </>
          )}
        </VStack>
      </Box>
      
      {error && (
        <Text color="red.500" fontSize="sm" textAlign="center">
          {error}
        </Text>
      )}
    </VStack>
  );
};

export default UploadDropzone;
