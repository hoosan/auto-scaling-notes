import React from 'react';
import { RecoilRoot } from 'recoil';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';

import { Layout } from './components/Layout';
import { PrivateRoute } from './components/lib/PrivateRoute';
import { LoginPage } from './components/LoginPage';
import { NewMemoPage } from './components/NewMemoPage';

const App = () => (
  <RecoilRoot>
    <ChakraProvider>
      <Layout>
        <BrowserRouter>
          <Routes>
            {/* <Route path='/' element={<LoginPage />} /> */}
            <Route path='/' element={<NewMemoPage />} />
            <Route path='/new' element={<PrivateRoute />}>
              <Route path='' element={<NewMemoPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </Layout>
    </ChakraProvider>
  </RecoilRoot>
);

export default App;
