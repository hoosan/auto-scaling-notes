import React from 'react';

import { useAuthentication } from '../hooks/useAuthentication';
import { Layout } from './Layout';
import { NoteList } from './NoteList';
import { LPNote } from './LPNote';

export const TopPage = () => {
  const { isLogin } = useAuthentication();

  return <Layout>{isLogin ? <NoteList /> : <LPNote />}</Layout>;
};
