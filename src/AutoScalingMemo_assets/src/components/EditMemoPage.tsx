import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, VStack, Flex, Input, Textarea, Spacer } from '@chakra-ui/react';
import { Principal } from '@dfinity/principal';
import { MemoId } from '../../../declarations/Datastore/Datastore.did';

import { useAuthentication } from '../hooks/useAuthentication';
import { Button } from './Button';
import { Layout } from './Layout';

export interface Props {
  memoId: MemoId;
}

export const EditMemoPage: React.VFC<Props> = ({ memoId }) => {
  const { isLogin, getMainActor, getDatastoreActor } = useAuthentication();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [canisterId, setCanisterId] = useState<Principal>();
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [content, setContent] = useState('');

  const handleClick = async () => {
    if (!canisterId) {
      alert('A canister ID is not available.');
      return;
    }

    setIsLoading(true);

    const datastore = getDatastoreActor(canisterId);

    await datastore
      .updateMemo(
        memoId,
        [title || 'Untitled Memo'],
        [tags],
        [content || '...']
      )
      .then((res) => {
        if ('ok' in res) {
          navigate('/');
        } else {
          throw new Error('Failed to update a memo.');
        }
      })
      .catch((err: Error) => {
        alert(err);
      });
    setIsLoading(false);
  };

  const fetchMemo = async () => {
    if (!isLogin) {
      return;
    }

    setIsLoading(true);
    await getMainActor()
      .getCanisterIdByMemoId(memoId)
      .then((res) => {
        if ('ok' in res) {
          return res.ok;
        } else {
          throw new Error(res.err);
        }
      })
      .then((canisterId) => {
        setCanisterId(canisterId);
        return getDatastoreActor(canisterId).getMemoById(memoId);
      })
      .then((res) => {
        if ('ok' in res) {
          const { title, tags, content } = res.ok;
          setTitle(title);
          setTags(tags);
          setContent(content);
        } else {
          throw new Error(res.err);
        }
      })
      .catch((err: Error) => {
        alert(err);
        navigate('/');
      });
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMemo();
  }, [isLogin]);

  return (
    <Layout>
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
    </Layout>
  );
};
