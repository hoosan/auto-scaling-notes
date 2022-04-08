import React from 'react';

import { useAuthentication } from '../hooks/useAuthentication';

import { LoginButton } from './LoginButton';

export const LoginPage = () => {
  const { user, isLogin, handleLoginClick, handleLogoutClick } =
    useAuthentication();

  return (
    <>
      <h1>Login page</h1>
      <p>{isLogin ? `User ID: ${user?.uid}` : 'Not logged in.'}</p>
      {isLogin ? (
        <LoginButton onClick={handleLogoutClick} text={'Logout'} />
      ) : (
        <LoginButton onClick={handleLoginClick} text={'Login'} />
      )}
    </>
  );
};
