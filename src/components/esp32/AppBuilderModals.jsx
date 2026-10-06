import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Select,
  FormControl,
  FormLabel
} from "@chakra-ui/react";
import {
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaTable
} from "react-icons/fa";

export default function AppBuilderModals({
  // New App Modal
  isNewAppModalOpen,
  onNewAppModalClose,
  newAppNameInput,
  setNewAppNameInput,
  handleCreateNewApp,

  // Rename App Modal
  isRenameAppModalOpen,
  onRenameAppModalClose,
  renameAppNameInput,
  setRenameAppNameInput,
  projectName,
  handleRenameApp,

  // Clear Canvas Modal
  isClearCanvasModalOpen,
  onClearCanvasModalClose,
  widgets = [],
  handleClearAllWidgets,

  // CRUD Record Modal
  isCrudModalOpen,
  onCrudModalClose,
  editingCrudRecord,
  crudRecordForm,
  setCrudRecordForm,
  handleSaveCrudRecord
}) {
  return (
    <>
      {/* ========================================== */}
      {/* MODAL: CREATE NEW APP SCREEN (PROJECT C) */}
      {/* ========================================== */}
      <Modal isOpen={isNewAppModalOpen} onClose={onNewAppModalClose} isCentered size="md">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" p={2}>
          <ModalHeader fontSize="md" fontWeight="bold">
            <HStack spacing={2}>
              <Box p={2} bg="blue.50" color="blue.500" borderRadius="lg">
                <FaPlus size={14} />
              </Box>
              <Text>Create New App Screen</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3} align="stretch">
              <Text fontSize="xs" color="gray.500">
                Create a fresh companion app canvas for this device. Your current screen will be saved in your project list.
              </Text>
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold">App Screen Name</FormLabel>
                <Input
                  size="sm"
                  borderRadius="lg"
                  placeholder="e.g. greenhouse_app or motor_dashboard"
                  value={newAppNameInput}
                  onChange={(e) => setNewAppNameInput(e.target.value)}
                  autoFocus
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" variant="ghost" mr={2} onClick={onNewAppModalClose}>Cancel</Button>
            <Button
              size="sm"
              colorScheme="blue"
              borderRadius="lg"
              isDisabled={!newAppNameInput.trim()}
              onClick={() => {
                handleCreateNewApp(newAppNameInput);
                onNewAppModalClose();
              }}
            >
              Create App
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ========================================== */}
      {/* MODAL: RENAME APP SCREEN (PROJECT U) */}
      {/* ========================================== */}
      <Modal isOpen={isRenameAppModalOpen} onClose={onRenameAppModalClose} isCentered size="md">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" p={2}>
          <ModalHeader fontSize="md" fontWeight="bold">
            <HStack spacing={2}>
              <Box p={2} bg="purple.50" color="purple.500" borderRadius="lg">
                <FaEdit size={14} />
              </Box>
              <Text>Rename App Screen</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3} align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold">New App Name</FormLabel>
                <Input
                  size="sm"
                  borderRadius="lg"
                  value={renameAppNameInput}
                  onChange={(e) => setRenameAppNameInput(e.target.value)}
                  autoFocus
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" variant="ghost" mr={2} onClick={onRenameAppModalClose}>Cancel</Button>
            <Button
              size="sm"
              colorScheme="purple"
              borderRadius="lg"
              isDisabled={!renameAppNameInput.trim() || renameAppNameInput === projectName}
              onClick={() => {
                handleRenameApp(projectName, renameAppNameInput);
                onRenameAppModalClose();
              }}
            >
              Rename
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ========================================== */}
      {/* MODAL: CLEAR CANVAS CONFIRMATION */}
      {/* ========================================== */}
      <Modal isOpen={isClearCanvasModalOpen} onClose={onClearCanvasModalClose} isCentered size="sm">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" p={2}>
          <ModalHeader fontSize="md" fontWeight="bold" color="red.500">
            <HStack spacing={2}>
              <Box p={2} bg="red.50" color="red.500" borderRadius="lg">
                <FaTrashAlt size={14} />
              </Box>
              <Text>Clear Canvas?</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="xs" color="gray.600">
              Are you sure you want to remove all <b>{widgets.length}</b> components from this screen? You can restore them using Undo (Ctrl+Z).
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" variant="ghost" mr={2} onClick={onClearCanvasModalClose}>Cancel</Button>
            <Button
              size="sm"
              colorScheme="red"
              borderRadius="lg"
              onClick={() => {
                handleClearAllWidgets();
                onClearCanvasModalClose();
              }}
            >
              Clear All
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ========================================== */}
      {/* MODAL: ADD / EDIT CRUD RECORD (IN-APP CRUD) */}
      {/* ========================================== */}
      <Modal isOpen={isCrudModalOpen} onClose={onCrudModalClose} isCentered size="md">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" p={2}>
          <ModalHeader fontSize="md" fontWeight="bold">
            <HStack spacing={2}>
              <Box p={2} bg="blue.50" color="blue.500" borderRadius="lg">
                <FaTable size={14} />
              </Box>
              <Text>{editingCrudRecord ? "Edit Data Record" : "Add New Data Record"}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3} align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold">Record Name / Title</FormLabel>
                <Input
                  size="sm"
                  borderRadius="lg"
                  placeholder="e.g. Device Status or Relay State"
                  value={crudRecordForm.name}
                  onChange={(e) => setCrudRecordForm((prev) => ({ ...prev, name: e.target.value }))}
                  autoFocus
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold">Reading / Value</FormLabel>
                <Input
                  size="sm"
                  borderRadius="lg"
                  placeholder="e.g. 24.5°C, Active, or GPIO 18 High"
                  value={crudRecordForm.value}
                  onChange={(e) => setCrudRecordForm((prev) => ({ ...prev, value: e.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold">Status Tag</FormLabel>
                <Select
                  size="sm"
                  borderRadius="lg"
                  value={crudRecordForm.status}
                  onChange={(e) => setCrudRecordForm((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option value="Active">Active (Green)</option>
                  <option value="Normal">Normal (Blue)</option>
                  <option value="Alert">Alert (Red)</option>
                  <option value="Standby">Standby (Yellow)</option>
                  <option value="Offline">Offline (Gray)</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" variant="ghost" mr={2} onClick={onCrudModalClose}>Cancel</Button>
            <Button
              size="sm"
              colorScheme="blue"
              borderRadius="lg"
              isDisabled={!crudRecordForm.name.trim()}
              onClick={handleSaveCrudRecord}
            >
              {editingCrudRecord ? "Update Record" : "Create Record"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
