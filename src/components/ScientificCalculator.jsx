import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Text,
  VStack,
  useColorMode,
  IconButton,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  FormControl,
  FormLabel,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Divider,
} from '@chakra-ui/react';
import { 
  DeleteIcon, 
  ArrowBackIcon, 
  ChevronDownIcon, 
  CheckIcon,
  AddIcon
} from '@chakra-ui/icons';
import { useEffect } from 'react';
import { calculatorService } from '../services/calculatorService';
import { getUserInfo } from '../utils/platformUtils';

const ScientificCalculator = ({ onSaveEquation, onInsertResult }) => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [memory, setMemory] = useState(0);
  const [isRadians, setIsRadians] = useState(true);

  const handleMemory = (action) => {
    const val = parseFloat(display);
    if (isNaN(val) && action !== 'MC' && action !== 'MR') return;
    switch (action) {
      case 'MC': setMemory(0); break;
      case 'MR': setDisplay(memory.toString()); break;
      case 'M+': setMemory(memory + val); break;
      case 'M-': setMemory(memory - val); break;
      case 'MS': setMemory(val); break;
    }
  };

  const factorial = (n) => {
    if (n < 0) return 'Error';
    if (n === 0) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  };

  const toRadians = (deg) => (deg * Math.PI) / 180;
  const toDegrees = (rad) => (rad * 180) / Math.PI;
  const [savedEquations, setSavedEquations] = useState([]);
  const [loadingEquations, setLoadingEquations] = useState(false);
  
  const { colorMode } = useColorMode();
  const toast = useToast();

  const fetchHistory = useCallback(async () => {
    const raw = getUserInfo();
    const userId  = raw?.userId || raw?._id || "6926c69500610847a79be7eb";
    const isAdmin = raw?.isAdmin ?? 1;

    setLoadingEquations(true);
    try {
      const response = await calculatorService.getEquations(userId, isAdmin);
      const list = response?.data ?? response ?? [];
      if (Array.isArray(list)) {
        const normalised = list.map((eq) => ({
          id:         eq._id        || eq.id,
          name:       eq.equationName || eq.name || 'Equation',
          expression: eq.equation     || eq.expression || '',
          result:     eq.result       || '',
          timestamp:  eq.createdAt
                          ? new Date(eq.createdAt).toLocaleString()
                          : (eq.timestamp || ''),
        }));
        setSavedEquations(normalised);
      }
    } catch (error) {
      toast({ title: "Failed to fetch history", status: "error", duration: 3000 });
    } finally {
      setLoadingEquations(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);
  
  // Modals disclosure
  const saveModal = useDisclosure();
  const calculusModal = useDisclosure();
  const [calcMode, setCalcMode] = useState('derivative'); // 'derivative' or 'integral'
  const [calcExpr, setCalcExpr] = useState('x^2');
  const [calcValA, setCalcValA] = useState('1');
  const [calcValB, setCalcValB] = useState('10');
  const [eqName, setEqName] = useState('');

  const handleNumber = (num) => {
    if (display === '0' || display === 'Error') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op) => {
    setExpression(expression + display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
  };

  const handleClearEntry = () => {
    setDisplay('0');
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };


  const handleScientific = (func) => {
    try {
      const value = parseFloat(display);
      let result;

      switch (func) {
        case 'sin': result = Math.sin(isRadians ? value : toRadians(value)); break;
        case 'cos': result = Math.cos(isRadians ? value : toRadians(value)); break;
        case 'tan': result = Math.tan(isRadians ? value : toRadians(value)); break;
        case 'asin': result = isRadians ? Math.asin(value) : toDegrees(Math.asin(value)); break;
        case 'acos': result = isRadians ? Math.acos(value) : toDegrees(Math.acos(value)); break;
        case 'atan': result = isRadians ? Math.atan(value) : toDegrees(Math.atan(value)); break;
        case 'sec': result = 1 / Math.cos(isRadians ? value : toRadians(value)); break;
        case 'csc': result = 1 / Math.sin(isRadians ? value : toRadians(value)); break;
        case 'cot': result = 1 / Math.tan(isRadians ? value : toRadians(value)); break;
        case 'sinh': result = Math.sinh(value); break;
        case 'cosh': result = Math.cosh(value); break;
        case 'tanh': result = Math.tanh(value); break;
        case 'log': result = Math.log10(value); break;
        case 'ln': result = Math.log(value); break;
        case 'sqrt': result = Math.sqrt(value); break;
        case 'sqr': result = value * value; break;
        case 'cube': result = value * value * value; break;
        case 'exp': result = Math.exp(value); break;
        case 'abs': result = Math.abs(value); break;
        case 'inv': result = 1 / value; break;
        case 'fact': result = factorial(value); break;
        case 'pi': result = Math.PI; break;
        case 'e': result = Math.E; break;
        case 'neg': result = -value; break;
        case 'pow':
          setExpression(expression + display + ' ^ ');
          setDisplay('0');
          return;
        default: return;
      }

      setDisplay(Number(result.toFixed(8)).toString());
      setExpression('');
    } catch (error) {
      setDisplay('Error');
    }
  };


  const handleEquals = () => {
    try {
      if (expression) {
        const fullExpression = expression + display;
        const jsExpression = fullExpression.replace(/\^/g, '**');
        const result = eval(jsExpression);
        setDisplay(Number(result.toFixed(8)).toString());
        setExpression('');
      }
    } catch (error) { setDisplay('Error'); }
  };

  const handleCalculusSubmit = () => {
    try {
      if (calcMode === 'derivative') {
        const result = calculateDerivative(calcExpr, calcValA);
        setExpression(`d/dx(${calcExpr}) @ x=${calcValA}`);
        setDisplay(Number(result.toFixed(8)).toString());
      } else {
        const result = calculateIntegral(calcExpr, calcValA, calcValB);
        setExpression(`∫(${calcExpr})dx [${calcValA}, ${calcValB}]`);
        setDisplay(Number(result.toFixed(8)).toString());
      }
      calculusModal.onClose();
    } catch (e) { setDisplay('Error'); }
  };

  const calculateDerivative = (func, x, h = 0.0001) => {
    const f = (val) => {
      const expr = func.replace(/x/g, `(${val})`).replace(/\^/g, '**');
      return eval(expr);
    };
    return (f(parseFloat(x) + h) - f(parseFloat(x) - h)) / (2 * h);
  };

  const calculateIntegral = (func, a, b, n = 1000) => {
    const f = (val) => {
      const expr = func.replace(/x/g, `(${val})`).replace(/\^/g, '**');
      return eval(expr);
    };
    const start = parseFloat(a);
    const end = parseFloat(b);
    const h = (end - start) / n;
    let sum = f(start) + f(end);
    for (let i = 1; i < n; i++) {
      const x = start + i * h;
      sum += i % 2 === 0 ? 2 * f(x) : 4 * f(x);
    }
    return (h / 3) * sum;
  };

  const saveToHistory = async () => {
    const raw = getUserInfo();
    const userId  = raw?.userId || raw?._id || "6926c69500610847a79be7eb";
    const isAdmin = raw?.isAdmin ?? 1;

    const currentEq = expression || display;
    if (!currentEq || currentEq === '0') return;

    const payload = {
      equationName: eqName || `Equation ${savedEquations.length + 1}`,
      equation: currentEq,
      userId,
      isAdmin,
    };

    setLoadingEquations(true);
    try {
      await calculatorService.saveEquation(payload);
      toast({ title: "Equation Saved", status: "success", duration: 2000 });
      saveModal.onClose();
      fetchHistory(); // Refresh the list
      onSaveEquation?.(payload);
    } catch (error) {
      toast({ title: "Failed to save", status: "error", duration: 3000 });
    } finally {
      setLoadingEquations(false);
    }
  };

  const handleInsert = () => {
    onInsertResult?.(display);
    toast({ title: "Inserted into Editor", status: "info", duration: 1500 });
  };

  const loadEquation = (eq) => {
    setExpression(eq.expression || eq.equation || '');
    setDisplay(eq.result || '0');
  };

  const buttonStyle = {
    bg: "white",
    color: "black",
    _hover: { bg: "gray.100" },
    fontSize: "xs",
    fontWeight: "bold",
    h: "10",
    borderRadius: "lg",
    transition: "all 0.2s",
    _active: { transform: "scale(0.95)" },
    border: "1px solid",
    borderColor: "gray.200"
  };

  const memStyle = buttonStyle;
  const opStyle = buttonStyle;
  const funcStyle = buttonStyle;
  const orangeStyle = buttonStyle;
  const numStyle = buttonStyle;

  return (
    <Box 
      w="100%" 
      p={4} 
      bg={colorMode === "dark" ? "gray.800" : "white"} 
      borderRadius="2xl" 
      boxShadow="xl"
      display="flex"
      flexDirection="column"
      gap={4}
    >
      <VStack align="stretch" spacing={4}>
        <Flex justify="space-between" align="center">
          <Text fontWeight="bold" fontSize="lg" color={colorMode === "dark" ? "white" : "black"}>
            Calculator
          </Text>
          <HStack spacing={2}>
            <Button size="xs" colorScheme={isRadians ? "blue" : "gray"} onClick={() => setIsRadians(true)}>RAD</Button>
            <Button size="xs" colorScheme={!isRadians ? "blue" : "gray"} onClick={() => setIsRadians(false)}>DEG</Button>
            <Menu>
              <MenuButton as={Button} size="xs" rightIcon={<ChevronDownIcon />}>
                {loadingEquations ? 'Loading…' : 'History'}
              </MenuButton>
              <MenuList maxH="300px" overflowY="auto">
                {savedEquations.length === 0 && !loadingEquations && (
                  <MenuItem isDisabled fontSize="xs" color="gray.500">No saved equations</MenuItem>
                )}
                {savedEquations.map(eq => (
                  <MenuItem key={eq.id} onClick={() => loadEquation(eq)} flexDirection="column" align="start">
                    <Text fontWeight="bold" fontSize="xs">{eq.name}</Text>
                    <Text fontSize="2xs" color="gray.500">{eq.expression} {eq.result ? `= ${eq.result}` : ''}</Text>
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </HStack>
        </Flex>

        <Box 
          bg={colorMode === "dark" ? "blackAlpha.400" : "gray.50"} 
          p={4} 
          borderRadius="xl" 
          textAlign="right"
          border="1px solid"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        >
          <Text fontSize="xs" color={colorMode === "dark" ? "gray.500" : "black"} h="4" mb={1}>{expression}</Text>
          <Text fontSize="3xl" fontWeight="bold" color={colorMode === "dark" ? "white" : "black"}>{display}</Text>
        </Box>        <Grid templateColumns="repeat(6, 1fr)" gap={1.5}>
          {/* Row 1: Memory & Clear */}
          <Button {...memStyle} onClick={() => handleMemory('MC')}>MC</Button>
          <Button {...memStyle} onClick={() => handleMemory('MR')}>MR</Button>
          <Button {...memStyle} onClick={() => handleMemory('M+')}>M+</Button>
          <Button {...memStyle} onClick={() => handleMemory('M-')}>M-</Button>
          <Button {...memStyle} onClick={() => handleMemory('MS')}>MS</Button>
          <Button {...orangeStyle} onClick={handleClear}>C</Button>

          {/* Row 2: Basic Scientific */}
          <Button {...orangeStyle} onClick={handleClearEntry}>CE</Button>
          <Button {...buttonStyle} onClick={handleBackspace}><ArrowBackIcon /></Button>
          <Button {...buttonStyle} onClick={() => { setCalcMode('derivative'); calculusModal.onOpen(); }}>d/dx</Button>
          <Button {...buttonStyle} onClick={() => { setCalcMode('integral'); calculusModal.onOpen(); }}>∫dx</Button>
          <Button {...funcStyle} onClick={() => handleScientific('sqrt')}>√</Button>
          <Button {...funcStyle} onClick={() => handleScientific('sqr')}>x²</Button>

          {/* Row 3: Powers & Basic Ops */}
          <Button {...funcStyle} onClick={() => handleScientific('cube')}>x³</Button>
          <Button {...funcStyle} onClick={() => handleOperator('**')}>xʸ</Button>
          <Button {...funcStyle} onClick={() => handleScientific('fact')}>n!</Button>
          <Button {...opStyle} onClick={() => handleOperator('/')}>÷</Button>
          <Button {...funcStyle} onClick={() => handleScientific('sin')}>sin</Button>
          <Button {...funcStyle} onClick={() => handleScientific('cos')}>cos</Button>

          {/* Row 4: Advanced Trig */}
          <Button {...funcStyle} onClick={() => handleScientific('tan')}>tan</Button>
          <Button {...funcStyle} onClick={() => handleScientific('sec')}>sec</Button>
          <Button {...funcStyle} onClick={() => handleScientific('csc')}>csc</Button>
          <Button {...funcStyle} onClick={() => handleScientific('cot')}>cot</Button>
          <Button {...funcStyle} onClick={() => handleScientific('pi')}>π</Button>
          <Button {...opStyle} onClick={() => handleOperator('*')}>×</Button>

          {/* Row 5: Inverse & Logs */}
          <Button {...funcStyle} onClick={() => handleScientific('asin')}>sin⁻¹</Button>
          <Button {...funcStyle} onClick={() => handleScientific('acos')}>cos⁻¹</Button>
          <Button {...funcStyle} onClick={() => handleScientific('atan')}>tan⁻¹</Button>
          <Button {...funcStyle} onClick={() => handleScientific('log')}>log</Button>
          <Button {...funcStyle} onClick={() => handleScientific('ln')}>ln</Button>
          <Button {...funcStyle} onClick={() => handleScientific('exp')}>eˣ</Button>

          {/* Row 6: Constants & Hyperbolics */}
          <Button {...funcStyle} onClick={() => handleScientific('e')}>e</Button>
          <Button {...opStyle} onClick={() => handleOperator('−')}>−</Button>
          <Button {...funcStyle} onClick={() => handleScientific('sinh')}>sinh</Button>
          <Button {...funcStyle} onClick={() => handleScientific('cosh')}>cosh</Button>
          <Button {...funcStyle} onClick={() => handleScientific('tanh')}>tanh</Button>
          <Button {...funcStyle} onClick={() => handleScientific('abs')}>|x|</Button>

          {/* Row 7: Extras & Numbers */}
          <Button {...funcStyle} onClick={() => handleScientific('inv')}>1/x</Button>
          <Button {...funcStyle} onClick={() => handleOperator('%')}>%</Button>
          <Button {...funcStyle} onClick={() => handleScientific('neg')}>±</Button>
          <Button {...opStyle} onClick={() => handleOperator('+')}>+</Button>
          <Button {...numStyle} onClick={() => handleNumber('7')}>7</Button>
          <Button {...numStyle} onClick={() => handleNumber('8')}>8</Button>

          {/* Row 8: Numbers & Parentheses */}
          <Button {...numStyle} onClick={() => handleNumber('9')}>9</Button>
          <Button {...opStyle} onClick={() => handleNumber('(')}>(</Button>
          <Button {...opStyle} onClick={() => handleNumber(')')}>)</Button>
          <Button {...numStyle} onClick={() => handleNumber('4')}>4</Button>
          <Button {...numStyle} onClick={() => handleNumber('5')}>5</Button>
          <Button {...numStyle} onClick={() => handleNumber('6')}>6</Button>

          {/* Row 9: Row 3 Numbers */}
          <Button {...numStyle} onClick={() => handleNumber('1')}>1</Button>
          <Button {...numStyle} onClick={() => handleNumber('2')}>2</Button>
          <Button {...numStyle} onClick={() => handleNumber('3')}>3</Button>
          <Button {...numStyle} onClick={() => handleNumber('.')}>.</Button>
          <Button {...numStyle} onClick={() => handleNumber('0')} gridColumn="span 2">0</Button>

          {/* Row 10: Equal */}
          <Button 
            gridColumn="span 6" 
            h="12" 
            borderRadius="xl" 
            bg="white" 
            color="black" 
            fontSize="xl" 
            fontWeight="bold"
            border="1px solid"
            borderColor="gray.200"
            _hover={{ bg: "gray.100" }}
            onClick={handleEquals}
          >
            =
          </Button>
        </Grid>

        <HStack spacing={4} mt={2}>
          <Button 
            flex={1} 
            bg="white"
            color="black"
            border="1px solid"
            borderColor="gray.200"
            _hover={{ bg: "gray.100" }}
            onClick={() => {
              setEqName('');
              saveModal.onOpen();
            }}
          >
            Save
          </Button>
          <Button 
            flex={1} 
            bg="white"
            color="black"
            border="1px solid"
            borderColor="gray.200"
            _hover={{ bg: "gray.100" }}
            onClick={() => onInsertResult && onInsertResult(display)}
          >
            Insert
          </Button>
        </HStack>
      </VStack>

      {/* Save Modal */}
      <Modal isOpen={saveModal.isOpen} onClose={saveModal.onClose} isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader>Save Equation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel fontSize="sm" color="black">Name</FormLabel>
              <Input value={eqName} onChange={(e) => setEqName(e.target.value)} placeholder="e.g. Force" color="black" />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={saveToHistory}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Calculus Modal */}
      <Modal isOpen={calculusModal.isOpen} onClose={calculusModal.onClose} isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader>{calcMode === 'derivative' ? 'Differentiate' : 'Integrate'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel color="black">Function f(x)</FormLabel>
                <Input value={calcExpr} onChange={(e) => setCalcExpr(e.target.value)} placeholder="x^2" color="black" />
              </FormControl>
              <HStack w="100%">
                <FormControl>
                  <FormLabel color="black">{calcMode === 'derivative' ? 'At x =' : 'Lower Limit (a)'}</FormLabel>
                  <Input value={calcValA} onChange={(e) => setCalcValA(e.target.value)} color="black" />
                </FormControl>
                {calcMode === 'integral' && (
                  <FormControl>
                    <FormLabel color="black">Upper Limit (b)</FormLabel>
                    <Input value={calcValB} onChange={(e) => setCalcValB(e.target.value)} color="black" />
                  </FormControl>
                )}
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleCalculusSubmit}>Calculate</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ScientificCalculator;

