import React from 'react';

import { useAuthentication } from '../hooks/useAuthentication';
import { Layout } from './Layout';
import { NoteList } from './NoteList';

export const TopPage = () => {
  const { isLogin } = useAuthentication();

  return (
    <Layout>{isLogin ? <NoteList /> : <p>You are not logged in.</p>}</Layout>
  );
};
