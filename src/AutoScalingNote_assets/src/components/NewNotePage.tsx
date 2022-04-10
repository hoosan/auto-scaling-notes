import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  Flex,
  Input,
  Textarea,
  Spacer,
  Center,
} from '@chakra-ui/react';

import { useAuthentication } from '../hooks/useAuthentication';
import { Layout } from './Layout';
import { Button } from './Button';

export const NewNotePage = () => {
  const { getMainActor } = useAuthentication();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState([]);
  const [content, setContent] = useState('');

  const handleClick = async () => {
    setIsLoading(true);

    const res = await getMainActor().createNote(title, tags, content);
    if ('ok' in res) {
      console.log(res.ok);
      navigate('/');
    } else {
      console.log(res.err);
    }
    setIsLoading(false);
  };

  return (
    <Layout>
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
        </Box>
      </Center>
    </Layout>
  );
};