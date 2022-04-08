import React from 'react';
import { RecoilRoot } from 'recoil';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';

import { PrivateRoute } from './components/lib/PrivateRoute';
import { TopPage } from './components/TopPage';
import { NewMemoPage } from './components/NewMemoPage';

const App = () => (
  <RecoilRoot>
    <ChakraProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<TopPage />} />
          <Route path='/new' element={<PrivateRoute />}>
            <Route path='' element={<NewMemoPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  </RecoilRoot>
);

export default App;
