import {
  Button,
  CloseButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Stack,
  Text,
  useDisclosure,
  VStack,
  HStack,
  Input,
  Box,
  IconButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  Heading,
  Center,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon, CheckIcon } from "@chakra-ui/icons";
import { API } from '@/config';
import { useEffect, useState } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";
import { useProject } from "../../ProjectContext";

const CodeDrawer = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [files, setFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [newFileName, setNewFileName] = useState("");
  const [code, setCode] = useState("// Write your C code here\n");
  const [output, setOutput] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [editedFileName, setEditedFileName] = useState("");
  const [error, setError] = useState("");

  const { activeProjectId, activeProductId, activeProjectName, user } =
    useProject();

  useEffect(() => {
    if (!activeProjectId || !user?.userId) return;

    const fetchFiles = async () => {
      // setLoading(true);
      try {
        const response = await axios.get(
          `${API.MAIN}/api/v1/files/${user?.userId}`
        );

        console.log("file response:", response.data);
        const filteredFiles = response.data.files.filter(
          (file) => file.parentId === activeProjectId
        );

        console.log("filterd files:", filteredFiles);
        // setFiles(filteredFiles);
      } catch (err) {
        // setError(err.response?.data?.message || "Failed to fetch files");
        console.log(err.response?.data?.message);
      } finally {
        // setLoading(false);
      }
    };

    fetchFiles();
  }, [user?.userId, activeProjectId]);

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(""), 3000);
  };

  const formatFileName = (name) => {
    if (!name.endsWith(".c")) return name + ".c";
    return name;
  };

  const createFile = () => {
    let trimmedName = newFileName.trim();
    if (!trimmedName) return showError("File name cannot be empty!");
    if (trimmedName.includes(" "))
      return showError("File name cannot contain spaces!");

    trimmedName = formatFileName(trimmedName);
    if (trimmedName.toLowerCase() === "main.c")
      return showError("Cannot create 'main.c'!");
    if (files.includes(trimmedName))
      return showError("File name must be unique!");

    setFiles([...files, trimmedName]);
    setNewFileName("");
    setShowInput(false);
  };

  const deleteFile = (file) => {
    setFiles(files.filter((f) => f !== file));
    if (currentFile === file) setCurrentFile(null);
  };

  const startEditing = (file) => {
    setEditingFile(file);
    setEditedFileName(file.replace(".c", ""));
  };

  const renameFile = () => {
    let trimmedName = editedFileName.trim();
    if (!trimmedName) return showError("File name cannot be empty!");
    if (trimmedName.includes(" "))
      return showError("File name cannot contain spaces!");

    trimmedName = formatFileName(trimmedName);
    if (trimmedName.toLowerCase() === "main.c")
      return showError("Cannot rename to 'main.c'!");
    if (files.includes(trimmedName) && trimmedName !== editingFile)
      return showError("File name must be unique!");

    setFiles(files.map((file) => (file === editingFile ? trimmedName : file)));
    if (currentFile === editingFile) setCurrentFile(trimmedName);
    setEditingFile(null);
  };

  const handleFileClick = (file) => {
    setCurrentFile((prev) => (prev === file ? null : file));
  };

  const runSimulation = () => {
    setOutput(`Simulated output for ${currentFile}\nCompiled successfully!`);
  };

  return (
    <Stack>
      <Button size="sm" onClick={onOpen}>
        Code
      </Button>

      <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="xl">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader display="flex" justifyContent="space-between">
            <Text>Simulation Code</Text>
            <CloseButton onClick={onClose} size="sm" />
          </DrawerHeader>

          <DrawerBody>
            <Center>
              <Heading size={"xl"}>{activeProjectName}</Heading>
            </Center>
            <VStack spacing={4} align="start">
              {/* File Management Panel */}
              <VStack align="start" spacing={4} w="100%">
                <HStack w="100%">
                  {showInput ? (
                    <>
                      <Input
                        placeholder="Enter file name"
                        size="sm"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                      />
                      <Button colorScheme="blue" size="sm" onClick={createFile}>
                        Create
                      </Button>
                      <Button
                        variant="outline"
                        colorScheme="red"
                        size="sm"
                        onClick={() => setShowInput(false)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Box display="flex" justifyContent="flex-end" w="100%">
                      <Button
                        variant="outline"
                        colorScheme="blue"
                        size="sm"
                        onClick={() => setShowInput(true)}
                      >
                        Create New File
                      </Button>
                    </Box>
                  )}
                </HStack>

                {error && (
                  <Text color="red.500" fontSize="sm">
                    {error}
                  </Text>
                )}

                {/* Accordion for Files */}
                <Accordion
                  allowToggle
                  defaultIndex={files.length > 0 ? [0] : []}
                  w="100%"
                >
                  <AccordionItem>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        <Text fontSize="lg" fontWeight="bold">
                          Files ({files.length})
                        </Text>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>

                    <AccordionPanel>
                      {files.length === 0 ? (
                        <Text fontSize="sm" color="gray.500">
                          No files created. Please create a new file.
                        </Text>
                      ) : (
                        <List spacing={2} w="100%">
                          {files.map((file) => (
                            <ListItem
                              key={file}
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                              p={2}
                              bg={
                                currentFile === file
                                  ? "blue.100"
                                  : "transparent"
                              }
                              cursor="pointer"
                              borderRadius="md"
                              _hover={{ bg: "gray.100" }}
                              onClick={() => handleFileClick(file)}
                              onDoubleClick={() => startEditing(file)}
                            >
                              {editingFile === file ? (
                                <HStack w="100%">
                                  <Input
                                    value={editedFileName}
                                    onChange={(e) =>
                                      setEditedFileName(e.target.value)
                                    }
                                    autoFocus
                                    size="sm"
                                  />
                                  <IconButton
                                    icon={<CheckIcon />}
                                    colorScheme="green"
                                    onClick={renameFile}
                                    size="sm"
                                  />
                                </HStack>
                              ) : (
                                <>
                                  {file}
                                  <HStack>
                                    <IconButton
                                      variant="ghost"
                                      colorScheme="blue"
                                      icon={<EditIcon />}
                                      size="sm"
                                      onClick={() => startEditing(file)}
                                    />
                                    <IconButton
                                      variant="ghost"
                                      icon={<DeleteIcon />}
                                      colorScheme="red"
                                      size="sm"
                                      onClick={() => deleteFile(file)}
                                    />
                                  </HStack>
                                </>
                              )}
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </VStack>

              {/* Code Editor & Output Panel */}
              {files.length > 0 && currentFile && (
                <>
                  <VStack align="start" spacing={4} w="100%">
                    <Text fontSize="lg" fontWeight="bold">
                      Editor - {currentFile}
                    </Text>
                    <Box w="100%" h="400px">
                      <Editor
                        height="100%"
                        language="c"
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value)}
                      />
                    </Box>
                    <Button colorScheme="green" onClick={runSimulation}>
                      Run
                    </Button>

                    {/* Output Box */}
                    {/* <Box
                      w="100%"
                      p={3}
                      bg="gray.800"
                      color="white"
                      borderRadius="md"
                    >
                      <Text fontSize="md" fontWeight="bold">
                        Output:
                      </Text>
                      <Text fontSize="sm">{output || "No output yet."}</Text>
                    </Box> */}
                  </VStack>
                </>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Stack>
  );
};

export default CodeDrawer;
