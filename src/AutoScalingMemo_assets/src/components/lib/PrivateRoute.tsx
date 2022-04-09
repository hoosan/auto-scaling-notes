import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthentication } from '../../hooks/useAuthentication';
import { Layout } from '../Layout';

export const PrivateRoute = () => {
  const { isLogin } = useAuthentication();

  return isLogin ? (
    <Outlet />
  ) : (
    <Layout>
      <p>You are not logged in.</p>
    </Layout>
  );
};
