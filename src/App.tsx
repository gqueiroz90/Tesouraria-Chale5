import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Routers from './Routers';

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Routers />
      </Router>
    </ChakraProvider>
  );
}

export default App;
