import React from 'react';
import { Box } from '@chakra-ui/react';

export type Props = {
  children: React.ReactNode;
};

export const Layout: React.VFC<Props> = ({ children }) => {
  return (
    <>
      <Box bg='#EAF0F6' height='100vh'>
        {children}
      </Box>
    </>
  );
};
