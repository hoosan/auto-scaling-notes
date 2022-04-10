import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { Principal } from '@dfinity/principal';
import { NoteId } from '../../../declarations/Datastore/Datastore.did';

import { useAuthentication } from '../hooks/useAuthentication';

import { Layout } from './Layout';
import { Editor } from './Editor';

export interface Props {
  noteId: NoteId;
}

export const EditNotePage: React.VFC<Props> = ({ noteId }) => {
  const { isLogin, getMainActor, getDatastoreActor } = useAuthentication();
  const navigate = useNavigate();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [canisterId, setCanisterId] = useState<Principal>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleClick = async () => {
    if (!canisterId) {
      alert('A canister ID is not available.');
      return;
    }

    setIsLoading(true);

    const datastore = getDatastoreActor(canisterId);

    await datastore
      .updateNote(noteId, [title || 'Untitled Note'], [content || '...'])
      .then((res) => {
        if ('ok' in res) {
          toast({
            description: "We've saved your note.",
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        } else {
          throw new Error('Failed to update a note.');
        }
      })
      .catch((err: Error) => {
        toast({
          description: `${err}`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      });
    setIsLoading(false);
  };

  const fetchNote = async () => {
    if (!isLogin) {
      return;
    }

    setIsLoading(true);
    await getMainActor()
      .getCanisterIdByNoteId(noteId)
      .then((res) => {
        if ('ok' in res) {
          return res.ok;
        } else {
          throw new Error(res.err);
        }
      })
      .then((canisterId) => {
        setCanisterId(canisterId);
        return getDatastoreActor(canisterId).getNoteById(noteId);
      })
      .then((res) => {
        if ('ok' in res) {
          const { title, content } = res.ok;
          setTitle(title);
          setContent(content);
        } else {
          throw new Error(res.err);
        }
      })
      .catch((err: Error) => {
        toast({
          description: `${err}`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        navigate('/');
      });
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNote();
  }, [isLogin]);

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
