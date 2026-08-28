import React, { useState, useEffect } from 'react';
import { ChakraProvider, Switch, FormControl, FormLabel } from '@chakra-ui/react';

export function ToggleSwitch() {
  const [isOn, setIsOn] = useState(false);

  const handleToggle = () => {
    setIsOn(!isOn);
  };

  useEffect(() => {
    console.log(`The switch is ${isOn ? 'ON' : 'OFF'}`);
  }, [isOn]);

  return (
    <FormControl display="flex" alignItems="center">
      <FormLabel htmlFor="switch" mb="0">
        Toggle Switch
      </FormLabel>
      <Switch id="switch" isChecked={isOn} onChange={handleToggle} />
    </FormControl>
  );
}

function App() {
  return (
    <ChakraProvider>
      <ToggleSwitch />
    </ChakraProvider>
  );
}

export default App;
