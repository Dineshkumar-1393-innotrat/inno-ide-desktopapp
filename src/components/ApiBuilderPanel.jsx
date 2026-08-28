import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Input,
  Select,
  Textarea,
  VStack,
  HStack,
  Badge,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Checkbox,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  useColorMode,
  Spinner,
  Divider,
  Tag,
  TagLabel,
} from '@chakra-ui/react';
import { Plus, Trash2, RefreshCw, Send, Play, Radio, Layers, Code, CheckCircle, Database } from 'lucide-react';
import axios from 'axios';

const BASE_URL = 'http://localhost:5004';

export default function ApiBuilderPanel({ onOpenPostman }) {
  const { colorMode } = useColorMode();
  const toast = useToast();

  const [apiList, setApiList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState('');
  
  // Modal state for creating a new API
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiName, setApiName] = useState('');
  const [apiDescription, setApiDescription] = useState('');
  const [inputFields, setInputFields] = useState([
    { fieldName: 'title', type: 'string', required: true },
    { fieldName: 'priority', type: 'number', required: false },
  ]);
  const [outputFields, setOutputFields] = useState([
    { fieldName: 'status', type: 'string', default: 'open' },
  ]);
  const [creatingApi, setCreatingApi] = useState(false);

  // Endpoint Runner state
  const [selectedAction, setSelectedAction] = useState('createRecord'); // createRecord, listRecords, getRecord, updateRecord, deleteRecord, deleteApi
  const [runnerMethod, setRunnerMethod] = useState('POST');
  const [runnerUrl, setRunnerUrl] = useState('');
  const [runnerRecordId, setRunnerRecordId] = useState('');
  const [runnerBody, setRunnerBody] = useState('');
  const [runnerLoading, setRunnerLoading] = useState(false);
  const [runnerResponse, setRunnerResponse] = useState(null);

  // Records state
  const [recordsList, setRecordsList] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Fetch list of defined APIs
  const fetchApiList = async () => {
    setLoadingList(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/apiBuilder/list`);
      if (res.data && res.data.data) {
        setApiList(res.data.data);
        if (res.data.data.length > 0 && !selectedSlug) {
          setSelectedSlug(res.data.data[0].slug);
        }
      }
    } catch (err) {
      console.error('Error fetching API list:', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchApiList();
  }, []);

  // Update runner when selectedSlug or selectedAction changes
  useEffect(() => {
    if (!selectedSlug) return;
    const currentApi = apiList.find((a) => a.slug === selectedSlug);

    let method = 'GET';
    let url = `${BASE_URL}/api/generated/${selectedSlug}`;
    let sampleBody = '';

    if (selectedAction === 'createRecord') {
      method = 'POST';
      url = `${BASE_URL}/api/generated/${selectedSlug}`;
      const bodyObj = {};
      if (currentApi?.inputSchema) {
        currentApi.inputSchema.forEach((f) => {
          if (f.type === 'number') bodyObj[f.fieldName] = 1;
          else if (f.type === 'boolean') bodyObj[f.fieldName] = true;
          else if (f.type === 'date') bodyObj[f.fieldName] = new Date().toISOString();
          else bodyObj[f.fieldName] = `test ${f.fieldName}`;
        });
      } else {
        bodyObj.title = 'test record';
      }
      sampleBody = JSON.stringify(bodyObj, null, 2);
    } else if (selectedAction === 'listRecords') {
      method = 'GET';
      url = `${BASE_URL}/api/generated/${selectedSlug}`;
    } else if (selectedAction === 'getRecord') {
      method = 'GET';
      url = `${BASE_URL}/api/generated/${selectedSlug}/${runnerRecordId || ':recordId'}`;
    } else if (selectedAction === 'updateRecord') {
      method = 'PUT';
      url = `${BASE_URL}/api/generated/${selectedSlug}/${runnerRecordId || ':recordId'}`;
      sampleBody = JSON.stringify({ status: 'closed' }, null, 2);
    } else if (selectedAction === 'deleteRecord') {
      method = 'DELETE';
      url = `${BASE_URL}/api/generated/${selectedSlug}/${runnerRecordId || ':recordId'}`;
    } else if (selectedAction === 'deleteApi') {
      method = 'DELETE';
      url = `${BASE_URL}/api/v1/apiBuilder/${selectedSlug}`;
    }

    setRunnerMethod(method);
    setRunnerUrl(url);
    setRunnerBody(sampleBody);
    fetchRecords(selectedSlug);
  }, [selectedSlug, selectedAction, apiList]);

  // Update URL when recordId changes
  useEffect(() => {
    if (!selectedSlug) return;
    if (['getRecord', 'updateRecord', 'deleteRecord'].includes(selectedAction)) {
      const recId = runnerRecordId.trim() || ':recordId';
      setRunnerUrl(`${BASE_URL}/api/generated/${selectedSlug}/${recId}`);
    }
  }, [runnerRecordId]);

  // Fetch records for active slug
  const fetchRecords = async (slug) => {
    if (!slug) return;
    setLoadingRecords(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/generated/${slug}`);
      if (res.data && res.data.data) {
        setRecordsList(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching records:', err);
    } finally {
      setLoadingRecords(false);
    }
  };

  // Add input schema field
  const addInputField = () => {
    setInputFields([...inputFields, { fieldName: '', type: 'string', required: false }]);
  };

  const removeInputField = (index) => {
    setInputFields(inputFields.filter((_, i) => i !== index));
  };

  const updateInputField = (index, key, value) => {
    const updated = [...inputFields];
    updated[index][key] = value;
    setInputFields(updated);
  };

  // Add output schema field
  const addOutputField = () => {
    setOutputFields([...outputFields, { fieldName: '', type: 'string', default: '' }]);
  };

  const removeOutputField = (index) => {
    setOutputFields(outputFields.filter((_, i) => i !== index));
  };

  const updateOutputField = (index, key, value) => {
    const updated = [...outputFields];
    updated[index][key] = value;
    setOutputFields(updated);
  };

  // Handle Create API submit
  const handleCreateApi = async () => {
    if (!apiName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'API Name is required',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setCreatingApi(true);
    try {
      const payload = {
        name: apiName.trim(),
        description: apiDescription.trim(),
        inputSchema: inputFields.filter((f) => f.fieldName.trim()),
        outputSchema: outputFields.filter((f) => f.fieldName.trim()),
      };

      const res = await axios.post(`${BASE_URL}/api/v1/apiBuilder/create`, payload);
      if (res.data && res.data.status === 'success') {
        toast({
          title: 'API Created!',
          description: `Generated CRUD endpoints for "${res.data.data.slug}"`,
          status: 'success',
          duration: 4000,
          isClosable: true,
        });

        setIsModalOpen(false);
        setApiName('');
        setApiDescription('');
        await fetchApiList();
        setSelectedSlug(res.data.data.slug);
      }
    } catch (err) {
      toast({
        title: 'Creation Failed',
        description: err.response?.data?.message || err.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setCreatingApi(false);
    }
  };

  // Delete an API schema definition
  const handleDeleteApi = async (slug) => {
    if (!window.confirm(`Are you sure you want to delete the API "${slug}"?`)) return;
    try {
      await axios.delete(`${BASE_URL}/api/v1/apiBuilder/${slug}`);
      toast({
        title: 'API Deleted',
        description: `Removed API schema for ${slug}`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      if (selectedSlug === slug) {
        setSelectedSlug('');
      }
      fetchApiList();
    } catch (err) {
      toast({
        title: 'Delete Failed',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Send request in runner
  const handleRunRequest = async () => {
    setRunnerLoading(true);
    setRunnerResponse(null);
    const startTime = Date.now();
    try {
      const options = {
        method: runnerMethod,
        url: runnerUrl,
        headers: { 'Content-Type': 'application/json' },
      };

      if (['POST', 'PUT'].includes(runnerMethod) && runnerBody) {
        options.data = JSON.parse(runnerBody);
      }

      const res = await axios(options);
      const timeMs = Date.now() - startTime;

      setRunnerResponse({
        status: res.status,
        statusText: res.statusText,
        timeMs,
        data: res.data,
      });

      // If created/updated/deleted record, refresh records table and collection var if needed
      if (['createRecord', 'updateRecord', 'deleteRecord'].includes(selectedAction)) {
        fetchRecords(selectedSlug);
      }

      if (selectedAction === 'deleteApi') {
        fetchApiList();
        setSelectedSlug('');
      }

      // If record created, auto populate recordId for convenience
      if (res.data?.data?._id) {
        setRunnerRecordId(res.data.data._id);
      }
    } catch (err) {
      const timeMs = Date.now() - startTime;
      setRunnerResponse({
        error: true,
        status: err.response?.status || 500,
        statusText: err.response?.statusText || 'Error',
        timeMs,
        message: err.message,
        data: err.response?.data,
      });
    } finally {
      setRunnerLoading(false);
    }
  };

  // Preset quick ticket API generator if empty
  const handleCreateSampleTicket = async () => {
    try {
      const payload = {
        name: 'ticket',
        inputSchema: [
          { fieldName: 'title', type: 'string', required: true },
          { fieldName: 'priority', type: 'number', required: false },
        ],
        outputSchema: [
          { fieldName: 'status', type: 'string', default: 'open' },
        ],
      };
      const res = await axios.post(`${BASE_URL}/api/v1/apiBuilder/create`, payload);
      if (res.data?.data?.slug) {
        await fetchApiList();
        setSelectedSlug(res.data.data.slug);
        toast({
          title: 'Sample "ticket" API created!',
          status: 'success',
          duration: 3000,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Send current runner config to Postman tab
  const handleSendToPostman = () => {
    if (typeof onOpenPostman === 'function') {
      onOpenPostman({
        method: runnerMethod,
        url: runnerUrl,
        body: runnerBody,
      });
    } else {
      window.dispatchEvent(
        new CustomEvent('innoide:postman', {
          detail: {
            method: runnerMethod,
            url: runnerUrl,
            body: runnerBody,
          },
        })
      );
    }
    toast({
      title: 'Sent to Postman',
      description: 'Opened request configuration in Postman panel',
      status: 'info',
      duration: 2500,
    });
  };

  const currentApi = apiList.find((a) => a.slug === selectedSlug);

  return (
    <VStack spacing={6} align="stretch" w="100%">
      {/* Top Header & Toolbar */}
      <Flex
        justifyContent="space-between"
        alignItems="center"
        p={4}
        bg={colorMode === 'dark' ? 'gray.800' : 'blue.50'}
        borderRadius="md"
        border="1px solid"
        borderColor={colorMode === 'dark' ? 'gray.700' : 'blue.200'}
        flexWrap="wrap"
        gap={4}
      >
        <HStack spacing={3}>
          <Box p={2} bg="blue.500" color="white" borderRadius="md">
            <Database size={20} />
          </Box>
          <Box>
            <Heading size="md" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
              REST API Builder
            </Heading>
            <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
              Auto-generate dynamic CRUD REST endpoints with schemas
            </Text>
          </Box>
          <Tag colorScheme="blue" size="sm">
            <TagLabel>{BASE_URL}</TagLabel>
          </Tag>
        </HStack>

        <HStack spacing={3}>
          <Button
            leftIcon={<RefreshCw size={14} />}
            size="sm"
            variant="outline"
            onClick={fetchApiList}
            isLoading={loadingList}
          >
            Refresh APIs
          </Button>

          {/* New REST API button - opens modal popup */}
          <Button
            leftIcon={<Plus size={16} />}
            colorScheme="blue"
            size="sm"
            px={5}
            onClick={() => setIsModalOpen(true)}
            boxShadow="md"
          >
            + New REST API
          </Button>
        </HStack>
      </Flex>

      {/* Main Content Split: APIs List & Endpoint Tester */}
      <Flex gap={6} flexDirection={{ base: 'column', lg: 'row' }}>
        {/* Left Side: Defined APIs Cards List */}
        <Box
          w={{ base: '100%', lg: '350px' }}
          bg={colorMode === 'dark' ? 'gray.800' : 'white'}
          p={4}
          borderRadius="md"
          border="1px solid"
          borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
        >
          <Flex justify="space-between" align="center" mb={3}>
            <Heading size="xs" textTransform="uppercase" color="gray.500" letterSpacing="wider">
              Defined APIs ({apiList.length})
            </Heading>
          </Flex>

          {apiList.length === 0 ? (
            <VStack py={8} spacing={3} textStyle="center">
              <Text fontSize="sm" color="gray.500">
                No custom REST APIs defined yet.
              </Text>
              <Button size="xs" colorScheme="blue" onClick={handleCreateSampleTicket}>
                Create Sample "ticket" API
              </Button>
            </VStack>
          ) : (
            <VStack spacing={3} align="stretch" maxH="500px" overflowY="auto">
              {apiList.map((api) => {
                const isSelected = api.slug === selectedSlug;
                return (
                  <Box
                    key={api.slug}
                    p={3}
                    borderRadius="md"
                    border="1px solid"
                    borderColor={
                      isSelected
                        ? 'blue.400'
                        : colorMode === 'dark'
                        ? 'gray.700'
                        : 'gray.200'
                    }
                    bg={
                      isSelected
                        ? colorMode === 'dark'
                          ? 'blue.900'
                          : 'blue.50'
                        : colorMode === 'dark'
                        ? 'gray.900'
                        : 'gray.50'
                    }
                    cursor="pointer"
                    onClick={() => setSelectedSlug(api.slug)}
                    transition="all 0.2s"
                    _hover={{ borderColor: 'blue.300' }}
                  >
                    <Flex justify="space-between" align="center" mb={2}>
                      <HStack spacing={2}>
                        <Badge colorScheme={isSelected ? 'blue' : 'gray'} fontSize="0.8em">
                          /{api.slug}
                        </Badge>
                        <Text fontWeight="bold" fontSize="sm">
                          {api.name}
                        </Text>
                      </HStack>
                      <IconButton
                        icon={<Trash2 size={13} />}
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        title="Delete API definition"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteApi(api.slug);
                        }}
                      />
                    </Flex>

                    {/* Input Schema Preview */}
                    <Box mb={1}>
                      <Text fontSize="xs" color="gray.500" fontWeight="600">
                        Input Schema:
                      </Text>
                      <HStack flexWrap="wrap" spacing={1} mt={1}>
                        {api.inputSchema?.map((f, i) => (
                          <Tag key={i} size="sm" colorScheme="teal" variant="subtle" fontSize="10px">
                            {f.fieldName} ({f.type}){f.required ? '*' : ''}
                          </Tag>
                        ))}
                      </HStack>
                    </Box>

                    {/* Output Schema Preview */}
                    {api.outputSchema?.length > 0 && (
                      <Box mt={1}>
                        <Text fontSize="xs" color="gray.500" fontWeight="600">
                          Output Schema:
                        </Text>
                        <HStack flexWrap="wrap" spacing={1} mt={1}>
                          {api.outputSchema.map((f, i) => (
                            <Tag key={i} size="sm" colorScheme="purple" variant="subtle" fontSize="10px">
                              {f.fieldName}: default "{f.default}"
                            </Tag>
                          ))}
                        </HStack>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </VStack>
          )}
        </Box>

        {/* Right Side: Interactive Endpoint Tester & Records */}
        <Box
          flex={1}
          bg={colorMode === 'dark' ? 'gray.800' : 'white'}
          p={5}
          borderRadius="md"
          border="1px solid"
          borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
        >
          {selectedSlug ? (
            <VStack spacing={5} align="stretch">
              <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
                <HStack spacing={2}>
                  <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
                    {selectedSlug}
                  </Badge>
                  <Text fontSize="sm" color="gray.500">
                    Auto-generated Endpoints
                  </Text>
                </HStack>

                <Button
                  leftIcon={<Radio size={14} />}
                  size="xs"
                  colorScheme="purple"
                  variant="outline"
                  onClick={handleSendToPostman}
                >
                  Send to Postman Tab
                </Button>
              </Flex>

              {/* Action Selector */}
              <Box>
                <Text fontSize="xs" fontWeight="bold" mb={2} color="gray.500" textTransform="uppercase">
                  Select Action / Endpoint:
                </Text>
                <HStack flexWrap="wrap" spacing={2}>
                  {[
                    { id: 'createRecord', label: '1. Create Record (POST)', color: 'green', disabled: false },
                    { id: 'listRecords', label: '2. List All Records (GET)', color: 'blue', disabled: false },
                    { id: 'getRecord', label: '3. Get One Record (GET)', color: 'teal', disabled: false },
                    { id: 'updateRecord', label: '4. Update Record (PUT)', color: 'orange', disabled: true },
                    { id: 'deleteRecord', label: '5. Delete Record (DELETE)', color: 'red', disabled: true },
                    { id: 'deleteApi', label: '6. Delete API Definition', color: 'pink', disabled: true },
                  ].map((act) => (
                    <Button
                      key={act.id}
                      size="xs"
                      variant={selectedAction === act.id ? 'solid' : 'outline'}
                      colorScheme={act.color}
                      isDisabled={act.disabled}
                      onClick={() => !act.disabled && setSelectedAction(act.id)}
                    >
                      {act.label}
                    </Button>
                  ))}
                </HStack>
              </Box>

              {/* URL & Method Bar */}
              <HStack spacing={3}>
                <Select
                  w="110px"
                  size="sm"
                  value={runnerMethod}
                  onChange={(e) => setRunnerMethod(e.target.value)}
                  fontWeight="bold"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </Select>
                <Input
                  size="sm"
                  value={runnerUrl}
                  onChange={(e) => setRunnerUrl(e.target.value)}
                  fontFamily="monospace"
                  fontSize="xs"
                />
                <Button
                  colorScheme="blue"
                  size="sm"
                  px={6}
                  leftIcon={<Play size={13} />}
                  onClick={handleRunRequest}
                  isLoading={runnerLoading}
                >
                  Send
                </Button>
              </HStack>

              {/* Record ID Input for Get/Update/Delete One */}
              {['getRecord', 'updateRecord', 'deleteRecord'].includes(selectedAction) && (
                <HStack spacing={3} bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'} p={2} borderRadius="md">
                  <Text fontSize="xs" fontWeight="600" w="100px">
                    Record ID:
                  </Text>
                  <Input
                    size="xs"
                    placeholder="Enter _id (or click a record from table below)"
                    value={runnerRecordId}
                    onChange={(e) => setRunnerRecordId(e.target.value)}
                    bg={colorMode === 'dark' ? 'gray.800' : 'white'}
                  />
                </HStack>
              )}

              {/* Request Body Textarea */}
              {['POST', 'PUT'].includes(runnerMethod) && (
                <Box>
                  <Flex justify="space-between" align="center" mb={1}>
                    <Text fontSize="xs" fontWeight="bold" color="gray.500">
                      Request Body (JSON)
                    </Text>
                    {currentApi && (
                      <Button
                        size="xs"
                        variant="link"
                        colorScheme="blue"
                        onClick={() => {
                          const bodyObj = {};
                          currentApi.inputSchema?.forEach((f) => {
                            if (f.type === 'number') bodyObj[f.fieldName] = 1;
                            else if (f.type === 'boolean') bodyObj[f.fieldName] = true;
                            else bodyObj[f.fieldName] = `test ${f.fieldName}`;
                          });
                          setRunnerBody(JSON.stringify(bodyObj, null, 2));
                        }}
                      >
                        Reset Schema Template
                      </Button>
                    )}
                  </Flex>
                  <Textarea
                    size="sm"
                    rows={4}
                    value={runnerBody}
                    onChange={(e) => setRunnerBody(e.target.value)}
                    fontFamily="monospace"
                    fontSize="xs"
                    placeholder='{"title": "test ticket", "priority": 1}'
                  />
                </Box>
              )}

              {/* Response Output Box */}
              {runnerResponse && (
                <Box
                  p={4}
                  borderRadius="md"
                  bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'}
                  border="1px solid"
                  borderColor={
                    runnerResponse.error
                      ? 'red.300'
                      : colorMode === 'dark'
                      ? 'gray.700'
                      : 'gray.200'
                  }
                >
                  <Flex justify="space-between" align="center" mb={2}>
                    <HStack spacing={2}>
                      <Badge
                        colorScheme={
                          runnerResponse.status >= 200 && runnerResponse.status < 300
                            ? 'green'
                            : 'red'
                        }
                        fontSize="0.8em"
                        px={2}
                      >
                        {runnerResponse.status || 'ERROR'} {runnerResponse.statusText}
                      </Badge>
                      <Text fontSize="xs" color="gray.500">
                        Time: {runnerResponse.timeMs}ms
                      </Text>
                    </HStack>

                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => setRunnerResponse(null)}
                    >
                      Clear Response
                    </Button>
                  </Flex>

                  <pre
                    style={{
                      fontSize: '12px',
                      maxHeight: '220px',
                      overflowY: 'auto',
                      color: colorMode === 'dark' ? '#e2e8f0' : '#1a202c',
                      fontFamily: 'monospace',
                    }}
                  >
                    {JSON.stringify(runnerResponse.data || runnerResponse.message, null, 2)}
                  </pre>
                </Box>
              )}

              <Divider />

              {/* Stored Records Data Table */}
              <Box>
                <Flex justify="space-between" align="center" mb={2}>
                  <HStack spacing={2}>
                    <Heading size="xs" textTransform="uppercase" color="gray.500">
                      Stored Records ({recordsList.length})
                    </Heading>
                    {loadingRecords && <Spinner size="xs" color="blue.500" />}
                  </HStack>
                  <Button
                    size="xs"
                    variant="outline"
                    leftIcon={<RefreshCw size={12} />}
                    onClick={() => fetchRecords(selectedSlug)}
                  >
                    Refresh Records
                  </Button>
                </Flex>

                {recordsList.length === 0 ? (
                  <Text fontSize="xs" color="gray.400" py={3}>
                    No records created for this API yet. Click "Send" with POST /api/generated/{selectedSlug} above to create one.
                  </Text>
                ) : (
                  <Box maxH="200px" overflowY="auto" border="1px solid" borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'} borderRadius="md">
                    <Table size="sm" variant="simple">
                      <Thead bg={colorMode === 'dark' ? 'gray.900' : 'gray.100'}>
                        <Tr>
                          <Th fontSize="10px">_id</Th>
                          {currentApi?.inputSchema?.map((f) => (
                            <Th key={f.fieldName} fontSize="10px">
                              {f.fieldName}
                            </Th>
                          ))}
                          {currentApi?.outputSchema?.map((f) => (
                            <Th key={f.fieldName} fontSize="10px" color="purple.400">
                              {f.fieldName}
                            </Th>
                          ))}
                          <Th fontSize="10px">Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {recordsList.map((rec) => (
                          <Tr key={rec._id}>
                            <Td fontSize="11px" fontFamily="monospace">
                              <Badge
                                cursor="pointer"
                                colorScheme="blue"
                                variant="subtle"
                                onClick={() => setRunnerRecordId(rec._id)}
                                title="Click to copy into Record ID field"
                              >
                                {rec._id.substring(0, 8)}...
                              </Badge>
                            </Td>
                            {currentApi?.inputSchema?.map((f) => (
                              <Td key={f.fieldName} fontSize="11px">
                                {String(rec[f.fieldName] ?? '-')}
                              </Td>
                            ))}
                            {currentApi?.outputSchema?.map((f) => (
                              <Td key={f.fieldName} fontSize="11px" fontWeight="600" color="purple.500">
                                {String(rec[f.fieldName] ?? '-')}
                              </Td>
                            ))}
                            <Td fontSize="11px">
                              <HStack spacing={1}>
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="blue"
                                  onClick={() => {
                                    setRunnerRecordId(rec._id);
                                    setSelectedAction('getRecord');
                                  }}
                                >
                                  Select
                                </Button>
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </Box>
            </VStack>
          ) : (
            <VStack py={12} spacing={3} textStyle="center">
              <Text color="gray.500">Select an API from the left or create a new one to test endpoints.</Text>
            </VStack>
          )}
        </Box>
      </Flex>

      {/* POPUP MODAL FOR CREATING NEW REST API ("on popup need to show above in ui") */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl" isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg={colorMode === 'dark' ? 'gray.800' : 'white'} borderRadius="lg" border="1px solid" borderColor="blue.400">
          <ModalHeader borderBottom="1px solid" borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}>
            <HStack spacing={2}>
              <Box p={1.5} bg="blue.500" color="white" borderRadius="md">
                <Plus size={16} />
              </Box>
              <Text fontSize="lg" fontWeight="bold">
                Create New Custom REST API
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody py={5}>
            <VStack spacing={5} align="stretch">
              {/* API Name */}
              <Box>
                <Text fontSize="xs" fontWeight="bold" mb={1} color="gray.500">
                  API Name (Slug will be auto-generated) *
                </Text>
                <Input
                  placeholder="e.g. ticket, user, product, order"
                  value={apiName}
                  onChange={(e) => setApiName(e.target.value)}
                  autoFocus
                />
              </Box>

              {/* Description */}
              <Box>
                <Text fontSize="xs" fontWeight="bold" mb={1} color="gray.500">
                  Description (Optional)
                </Text>
                <Input
                  placeholder="e.g. Ticket management system CRUD API"
                  value={apiDescription}
                  onChange={(e) => setApiDescription(e.target.value)}
                />
              </Box>

              <Divider />

              {/* Input Schema Builder */}
              <Box>
                <Flex justify="space-between" align="center" mb={2}>
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" color="blue.500">
                      Input Schema Fields
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Fields expected when submitting/creating records
                    </Text>
                  </Box>
                  <Button size="xs" leftIcon={<Plus size={12} />} colorScheme="blue" variant="outline" onClick={addInputField}>
                    Add Input Field
                  </Button>
                </Flex>

                <VStack spacing={2} align="stretch">
                  {inputFields.map((field, index) => (
                    <HStack key={index} spacing={3} bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'} p={2} borderRadius="md">
                      <Input
                        size="sm"
                        placeholder="Field Name (e.g. title)"
                        value={field.fieldName}
                        onChange={(e) => updateInputField(index, 'fieldName', e.target.value)}
                        flex={2}
                      />
                      <Select
                        size="sm"
                        w="120px"
                        value={field.type}
                        onChange={(e) => updateInputField(index, 'type', e.target.value)}
                      >
                        <option value="string">string</option>
                        <option value="number">number</option>
                        <option value="boolean">boolean</option>
                        <option value="date">date</option>
                      </Select>
                      <Checkbox
                        size="sm"
                        isChecked={field.required}
                        onChange={(e) => updateInputField(index, 'required', e.target.checked)}
                      >
                        Required
                      </Checkbox>
                      <IconButton
                        icon={<Trash2 size={14} />}
                        size="xs"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => removeInputField(index)}
                      />
                    </HStack>
                  ))}
                </VStack>
              </Box>

              <Divider />

              {/* Output Schema Builder */}
              <Box>
                <Flex justify="space-between" align="center" mb={2}>
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" color="purple.500">
                      Output Schema Fields (Auto-added / Default values)
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Extra fields added to every record on top of submitted fields
                    </Text>
                  </Box>
                  <Button size="xs" leftIcon={<Plus size={12} />} colorScheme="purple" variant="outline" onClick={addOutputField}>
                    Add Output Field
                  </Button>
                </Flex>

                <VStack spacing={2} align="stretch">
                  {outputFields.map((field, index) => (
                    <HStack key={index} spacing={3} bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'} p={2} borderRadius="md">
                      <Input
                        size="sm"
                        placeholder="Field Name (e.g. status)"
                        value={field.fieldName}
                        onChange={(e) => updateOutputField(index, 'fieldName', e.target.value)}
                        flex={2}
                      />
                      <Select
                        size="sm"
                        w="120px"
                        value={field.type}
                        onChange={(e) => updateOutputField(index, 'type', e.target.value)}
                      >
                        <option value="string">string</option>
                        <option value="number">number</option>
                        <option value="boolean">boolean</option>
                        <option value="date">date</option>
                      </Select>
                      <Input
                        size="sm"
                        placeholder="Default Value (e.g. open)"
                        value={field.default}
                        onChange={(e) => updateOutputField(index, 'default', e.target.value)}
                        flex={2}
                      />
                      <IconButton
                        icon={<Trash2 size={14} />}
                        size="xs"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => removeOutputField(index)}
                      />
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}>
            <Button variant="ghost" mr={3} onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleCreateApi} isLoading={creatingApi} px={6}>
              Create REST API
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
