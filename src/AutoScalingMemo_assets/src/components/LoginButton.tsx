import React, { useState } from 'react';
import { Button } from '@chakra-ui/react';

export interface LoginButtonProps {
  onClick: () => Promise<void>;
}

export const LoginButton: React.FC<LoginButtonProps> = ({ onClick }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    await onClick();
    setIsLoading(false);
  };

  return (
    <Button
      color='white'
      px='1em'
      fontSize='md'
      height='2.5em'
      bg='blue.300'
      borderRadius='lg'
      _hover={{ bg: 'blue.400' }}
      disabled={isLoading}
      onClick={handleClick}
    >
      Login
    </Button>
  );
};
