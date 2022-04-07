import React from 'react';

import { useAuthentication } from '../hooks/useAuthentication';

import { LoginButton } from './LoginButton';

export const LoginPage = () => {
  const { user, isLogin, handleLoginClick } = useAuthentication();

  return (
    <>
      <h1>Login page</h1>
      <p>{isLogin ? 'Logged in.' : 'Not logged in.'}</p>
      <LoginButton onClick={handleLoginClick} />
    </>
  );
};
