import React, { useState } from 'react';

import {
  Box,
  VStack,
  Flex,
  Input,
  Textarea,
  Spacer,
  Center,
  Text,
} from '@chakra-ui/react';

import { checkSize } from '../utils/validation';
import { Button } from './Button';

export interface Props {
  isLoading: boolean;
  title: string;
  content: string;
  setTitle: (t: string) => void;
  setContent: (t: string) => void;
  handleClick: () => Promise<void>;
}

export const Editor: React.VFC<Props> = ({
  isLoading,
  title,
  content,
  setTitle,
  setContent,
  handleClick,
}) => {
  const isValid = checkSize(title, content);

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
        >
          <Spacer />
          <Box>
            <Input
              disabled={isLoading}
              value={title}
              placeholder='Untitled Note'
              size='lg'
              maxLength={100}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTitle(e.target.value)
              }
            />
          </Box>
          <Box>
            <Textarea
              disabled={isLoading}
              placeholder='...'
              bg='#EAF0F6'
              size='md'
              rows={10}
              value={content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setContent(e.target.value)
              }
            />
          </Box>
          <Flex justifyContent='flex-end'>
            {!isValid && (
              <Text fontSize='sm' color='red.500'>
                The size exceeds the limit (1 MB)
              </Text>
            )}
          </Flex>
          <Flex justifyContent='flex-end'>
            <Spacer />
            <Button disabled={!isValid} onClick={handleClick} text='Save' />
          </Flex>
          <Spacer />
        </VStack>
      </Box>
    </Center>
  );
};
