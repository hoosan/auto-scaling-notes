import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Flex, Spacer, HStack, Text } from '@chakra-ui/react';

import { useAuthentication } from '../hooks/useAuthentication';
import { LoginButton } from './LoginButton';
import { Menu } from './Menu';

export const Header = () => {
  const { isLogin } = useAuthentication();

  return (
    <Box as='header' bg='white' boxShadow='md'>
      <Flex
        h={{ base: '14', sm: '16' }}
        mx='auto'
        alignItems='center'
        justifyContent='between'
      >
        <Flex ml='10px' alignItems='center'>
          <Menu />
          <Link to='/'>
            <Text fontSize='xl'>Auto Scaling Note</Text>
          </Link>
        </Flex>
        <Spacer />
        <Box as='nav'>
          <HStack mr='10px' spacing={{ base: '20px', sm: '20px' }}>
            {isLogin ? <Spacer /> : <LoginButton />}
          </HStack>
        </Box>
      </Flex>
    </Box>
  );
};
