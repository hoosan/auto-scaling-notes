import React from 'react';
import { RecoilRoot } from 'recoil';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';

import { PrivateRoute } from './components/lib/PrivateRoute';
import { TopPage } from './components/TopPage';
import { NewMemoPage } from './components/NewMemoPage';
import { EditMemoPage } from './components/EditMemoPage';
import { NotFound } from './components/NotFound';

const ValidatedEditMemoPage = () => {
  const params = useParams();
  const memoId = params.memoId;
  if (!memoId?.match(/\d+/)) {
    return <NotFound />;
  } else {
    return <EditMemoPage memoId={BigInt(parseInt(memoId))} />;
  }
};

const App = () => (
  <RecoilRoot>
    <ChakraProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<TopPage />} />
          <Route path='/new' element={<PrivateRoute />}>
            <Route path='' element={<NewMemoPage />} />
          </Route>
          <Route path='/memo' element={<PrivateRoute />}>
            <Route path=':memoId' element={<ValidatedEditMemoPage />} />
          </Route>
          <Route path='*' element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  </RecoilRoot>
);

export default App;
