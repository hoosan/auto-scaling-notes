import React from 'react';
import { Box, VStack, Flex, Text, Spacer, Center } from '@chakra-ui/react';

import { useAuthentication } from '../hooks/useAuthentication';
import { Button } from './Button';

export const LPNote = () => {
  const { handleLoginClick } = useAuthentication();

  return (
    <Center>
      <Box w='full' maxW='3xl'>
        <VStack
          align='stretch'
          bg='white'
          mx='10px'
          px='20px'
          spacing='20px'
          borderRadius='lg'
          mt='20px'
          textAlign='left'
        >
          <Spacer />
          <Box>
            <Text>Hello there 😄</Text>
          </Box>
          <Box bg='#EAF0F6' borderRadius='lg'>
            <Box p='20px' fontSize='md'>
              <Text>
                Auto Scaling Note is an experimental Dapp for demonstrating how
                scalability works using inter-canister calls.
              </Text>
              <br />
              <br />
              <Text>DISCLAIMER</Text>
              <Text>==========</Text>
              <Text>
                This is an example of Dapp. Please do not store your critical
                data such as keys or passwords.
              </Text>
            </Box>
          </Box>
          <Flex justifyContent='flex-end'>
            <Spacer />
            <Button onClick={handleLoginClick} text='Login' />
          </Flex>
          <Spacer />
        </VStack>
      </Box>
    </Center>
  );
};
