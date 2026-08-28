import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { 
  Download, 
  Upload, 
  FolderOpen, 
  FileText, 
  Clock, 
  HardDrive,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import projectFileManager from '../utils/projectFileManager';
import projectImportExport from '../utils/projectImportExport';

const ProjectManagementModal = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  
  const toast = useToast();

  // Load stats when modal opens
  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen]);

  const loadStats = () => {
    const backupStats = projectImportExport.getBackupStats();
    setStats(backupStats);
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      const result = await projectImportExport.triggerFullBackup();
      
      toast({
        title: "Backup Created Successfully!",
        description: `Exported ${result.projectCount} projects with ${result.fileCount} files`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportProject = async (projectId) => {
    setIsExporting(true);
    try {
      const result = await projectImportExport.triggerProjectBackup(projectId);
      
      toast({
        title: "Project Exported Successfully!",
        description: `"${result.projectName}" exported with ${result.fileCount} files`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    setImportResults(null);
    
    try {
      const result = await projectImportExport.handleFileImport(null, {
        overwriteExisting: false,
        renameConflicts: true
      });
      
      setImportResults(result);
      loadStats(); // Refresh stats
      
      toast({
        title: "Import Successful!",
        description: `Imported ${result.imported} project(s)`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString() + ' ' + new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <FolderOpen size={24} />
            <Text>Project Management</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            
            {/* Statistics Section */}
            {stats && (
              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={3}>
                  Project Overview
                </Text>
                <SimpleGrid columns={3} spacing={4}>
                  <Stat>
                    <StatLabel>Projects</StatLabel>
                    <StatNumber>{stats.totalProjects}</StatNumber>
                    <StatHelpText>Total projects</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Files</StatLabel>
                    <StatNumber>{stats.totalFiles}</StatNumber>
                    <StatHelpText>Total files</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Storage</StatLabel>
                    <StatNumber>{formatFileSize(stats.totalSize)}</StatNumber>
                    <StatHelpText>Used space</StatHelpText>
                  </Stat>
                </SimpleGrid>
              </Box>
            )}

            <Divider />

            {/* Export Section */}
            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={3}>
                Export & Backup
              </Text>
              
              <VStack spacing={3} align="stretch">
                <Box p={4} borderWidth={1} borderRadius="md">
                  <HStack justify="space-between" mb={2}>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium">Full Backup</Text>
                      <Text fontSize="sm" color="gray.600">
                        Export all projects and files as a single backup file
                      </Text>
                    </VStack>
                    <Button
                      leftIcon={<Download size={16} />}
                      colorScheme="blue"
                      isLoading={isExporting}
                      loadingText="Exporting..."
                      onClick={handleExportAll}
                      size="sm"
                    >
                      Export All
                    </Button>
                  </HStack>
                </Box>

                {/* Individual Project Export */}
                {stats && stats.projects.length > 0 && (
                  <Box p={4} borderWidth={1} borderRadius="md">
                    <Text fontWeight="medium" mb={3}>Individual Projects</Text>
                    <List spacing={2}>
                      {stats.projects.map(project => (
                        <ListItem key={project.id}>
                          <HStack justify="space-between">
                            <HStack>
                              <ListIcon as={FileText} color="blue.500" />
                              <VStack align="start" spacing={0}>
                                <Text fontSize="sm" fontWeight="medium">
                                  {project.name}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {project.fileCount} files
                                </Text>
                              </VStack>
                            </HStack>
                            <Button
                              leftIcon={<Download size={14} />}
                              size="xs"
                              variant="outline"
                              isLoading={isExporting}
                              onClick={() => handleExportProject(project.id)}
                            >
                              Export
                            </Button>
                          </HStack>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </VStack>
            </Box>

            <Divider />

            {/* Import Section */}
            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={3}>
                Import & Restore
              </Text>
              
              <Box p={4} borderWidth={1} borderRadius="md">
                <VStack spacing={3}>
                  <HStack justify="space-between" w="full">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium">Import Projects</Text>
                      <Text fontSize="sm" color="gray.600">
                        Restore projects from backup files (.json)
                      </Text>
                    </VStack>
                    <Button
                      leftIcon={<Upload size={16} />}
                      colorScheme="green"
                      isLoading={isImporting}
                      loadingText="Importing..."
                      onClick={handleImport}
                      size="sm"
                    >
                      Import
                    </Button>
                  </HStack>

                  <Alert status="info" size="sm">
                    <AlertIcon />
                    <Box fontSize="sm">
                      <AlertTitle>Import Notes:</AlertTitle>
                      <AlertDescription>
                        Existing projects with the same name will be renamed automatically.
                        All files and project structure will be preserved.
                      </AlertDescription>
                    </Box>
                  </Alert>
                </VStack>
              </Box>

              {/* Import Results */}
              {importResults && (
                <Box mt={4} p={4} borderWidth={1} borderRadius="md" bg="green.50">
                  <Text fontWeight="medium" mb={2} color="green.800">
                    Import Results
                  </Text>
                  <List spacing={1}>
                    {importResults.results.map((result, index) => (
                      <ListItem key={index} fontSize="sm">
                        <HStack>
                          <ListIcon 
                            as={result.success ? CheckCircle : AlertCircle} 
                            color={result.success ? "green.500" : "red.500"} 
                          />
                          <Text>
                            {result.success 
                              ? `"${result.importedName}" imported successfully (${result.fileCount} files)`
                              : `"${result.originalName}" failed: ${result.error}`
                            }
                          </Text>
                          {result.renamed && (
                            <Badge colorScheme="orange" size="sm">Renamed</Badge>
                          )}
                        </HStack>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>

            {/* Storage Info */}
            {stats && stats.lastModified && (
              <Box p={3} bg="gray.50" borderRadius="md">
                <HStack>
                  <Clock size={16} />
                  <Text fontSize="sm" color="gray.600">
                    Last modified: {formatDate(stats.lastModified)}
                  </Text>
                </HStack>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProjectManagementModal;
