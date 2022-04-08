import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthentication } from '../../hooks/useAuthentication';

export const PrivateRoute = () => {
  const { isLogin } = useAuthentication();
  return isLogin ? <Outlet /> : <p>You are not logged in.</p>;
};
