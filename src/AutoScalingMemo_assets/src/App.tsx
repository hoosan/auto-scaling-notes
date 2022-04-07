import React from 'react';
import { RecoilRoot } from 'recoil';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';

import { LoginPage } from './components/LoginPage';

const App = () => (
  <RecoilRoot>
    <ChakraProvider>
      <BrowserRouter>
        <h1>Hello world</h1>
        <Routes>
          <Route path='/' element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  </RecoilRoot>
);

export default App;
