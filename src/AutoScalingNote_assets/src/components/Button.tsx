import React, { useState } from 'react';
import { Button as ChButton } from '@chakra-ui/react';

export interface ButtonProps {
  onClick: () => Promise<void>;
  text: string;
  disabled?: boolean;
}

export const Button: React.VFC<ButtonProps> = ({
  onClick,
  text,
  disabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    await onClick();
    setIsLoading(false);
  };

  return (
    <ChButton
      color='white'
      px='1em'
      fontSize='md'
      height='2.5em'
      bg='blue.300'
      borderRadius='lg'
      _hover={{ bg: 'blue.400' }}
      disabled={isLoading || disabled}
      onClick={handleClick}
    >
      {text}
    </ChButton>
  );
};
