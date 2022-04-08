import React, { useState } from 'react';
import { Box, VStack, Flex, Input, Textarea, Spacer } from '@chakra-ui/react';
import { Button } from './Button';

import { useAuthentication } from '../hooks/useAuthentication';

export const NewMemoPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState([]);
  const [content, setContent] = useState('');

  const { mainActor } = useAuthentication();

  const handleClick = async () => {
    setIsLoading(true);
    if (!mainActor) {
      return;
    }
    const res = await mainActor.createMemo(title, tags, content);
    if ('ok' in res) {
    } else {
    }
    setIsLoading(false);
  };

  return (
    <>
      <VStack
        align='stretch'
        bg='white'
        mx='10px'
        px='20px'
        spacing='20px'
        borderRadius='lg'
      >
        <Spacer />
        <Box>
          <Input
            disabled={isLoading}
            value={title}
            placeholder='Untitled Memo'
            size='lg'
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
          <Spacer />
          <Button onClick={handleClick} text='Save' />
        </Flex>
        <Spacer />
      </VStack>
    </>
  );
};
