import React from 'react';
import { RecoilRoot } from 'recoil';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';

import { PrivateRoute } from './components/lib/PrivateRoute';
import { TopPage } from './components/TopPage';
import { NewNotePage } from './components/NewNotePage';
import { EditNotePage } from './components/EditNotePage';
import { NotFound } from './components/NotFound';

const ValidatedEditNotePage = () => {
  const params = useParams();
  const noteId = params.noteId;
  if (!noteId?.match(/\d+/)) {
    return <NotFound />;
  } else {
    return <EditNotePage noteId={BigInt(parseInt(noteId))} />;
  }
};

const App = () => (
  <RecoilRoot>
    <ChakraProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<TopPage />} />
          <Route path='/new' element={<PrivateRoute />}>
            <Route path='' element={<NewNotePage />} />
          </Route>
          <Route path='/note' element={<PrivateRoute />}>
            <Route path=':noteId' element={<ValidatedEditNotePage />} />
          </Route>
          <Route path='*' element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  </RecoilRoot>
);

export default App;
