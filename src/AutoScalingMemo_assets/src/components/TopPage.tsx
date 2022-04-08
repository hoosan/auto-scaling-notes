import React from 'react';

import { useAuthentication } from '../hooks/useAuthentication';
import { Layout } from './Layout';
import { MemoList } from './MemoList';

export const TopPage = () => {
  const { isLogin } = useAuthentication();

  return (
    <Layout>{isLogin ? <MemoList /> : <p>You are not logged in.</p>}</Layout>
  );
};
