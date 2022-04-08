import React from 'react';

import { useAuthentication } from '../hooks/useAuthentication';

import { Button } from './Button';

export const LoginButton = () => {
  const { handleLoginClick } = useAuthentication();

  return <Button onClick={handleLoginClick} text={'Login'} />;
};
