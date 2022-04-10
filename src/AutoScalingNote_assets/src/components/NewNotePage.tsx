import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';

import { useAuthentication } from '../hooks/useAuthentication';
import { Layout } from './Layout';
import { Editor } from './Editor';

export const NewNotePage = () => {
  const { getMainActor } = useAuthentication();
  const navigate = useNavigate();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleClick = async () => {
    setIsLoading(true);

    const res = await getMainActor().createNote(title, content);
    if ('ok' in res) {
      toast({
        description: "We've saved your note.",
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
    } else {
      toast({
        description: `${res.err}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    setIsLoading(false);
  };

  return (
    <Layout>
      <Editor
        isLoading={isLoading}
        title={title}
        content={content}
        setTitle={setTitle}
        setContent={setContent}
        handleClick={handleClick}
      />
    </Layout>
  );
};
