import React, { useState } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
} from '@chakra-ui/react';
import ScientificCalculator from '../ScientificCalculator';

const MathWidgetButton = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button
        onClick={onOpen}
        size="sm"
        colorScheme="purple"
        variant="solid"
        leftIcon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 2H17C18.1046 2 19 2.89543 19 4V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V4C5 2.89543 5.89543 2 7 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 6H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M9 10H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M9 14H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 18H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        }
      >
        Math Widget
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent maxW="650px" bg="transparent" boxShadow="none">
          <ModalHeader></ModalHeader>
          <ModalCloseButton 
            color="white" 
            _hover={{ bg: 'rgba(255,255,255,0.2)' }}
            size="lg"
            zIndex={10}
          />
          <ModalBody p={0}>
            <ScientificCalculator />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MathWidgetButton;
