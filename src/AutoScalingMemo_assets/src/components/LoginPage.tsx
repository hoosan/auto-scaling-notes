import React from 'react';

import { useAuthentication } from '../hooks/useAuthentication';

import { Button } from './Button';

export const LoginPage = () => {
  const { user, isLogin, handleLoginClick, handleLogoutClick } =
    useAuthentication();

  return (
    <>
      <h1>Login page</h1>
      <p>{isLogin ? `User ID: ${user?.uid}` : 'Not logged in.'}</p>
      {isLogin ? (
        <Button onClick={handleLogoutClick} text={'Logout'} />
      ) : (
        <Button onClick={handleLoginClick} text={'Login'} />
      )}
    </>
  );
};
