import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Principal } from '@dfinity/principal';
import { Box, List, ListItem, Center } from '@chakra-ui/react';

import { DefiniteNote } from '../../../declarations/Datastore/Datastore.did';

import { useAuthentication } from '../hooks/useAuthentication';
import { NoteCard } from './NoteCard';

export const NoteList = () => {
  const { isLogin, getMainActor, getDatastoreActor } = useAuthentication();
  const [notes, setNotes] = useState<DefiniteNote[]>([]);

  const fetchNotes = async () => {
    if (!isLogin) {
      return;
    }

    const response = await getMainActor().datastoreCanisterIds();
    if (!('ok' in response)) {
      return;
    }

    const canisterIds = response.ok;
    const notesOnCanisters = await Promise.all(
      canisterIds.map(async (canisterId: Principal) => {
        const datastore = getDatastoreActor(canisterId);
        return await datastore.getAllNotes();
      })
    );

    const notes = notesOnCanisters
      .reduce((acc, v) => acc.concat(v), [])
      .sort((a, b) => {
        if (a.updatedAt < b.updatedAt) {
          return 1;
        } else if (a.updatedAt > b.updatedAt) {
          return -1;
        }
        return 0;
      });
    setNotes(notes);
  };

  useEffect(() => {
    fetchNotes();
  }, [isLogin]);

  return (
    <Center>
      <Box
        bg='white'
        mx='10px'
        borderRadius='lg'
        mt='20px'
        py='4px'
        w='full'
        maxW='3xl'
      >
        <List>
          {notes.map((note, index) => {
            const { id, title, updatedAt, content } = note;
            const props =
              index == notes.length - 1
                ? {}
                : {
                    borderBottom: '2px',
                    borderColor: '#EAF0F6',
                  };
            return (
              <ListItem key={index} {...props}>
                <Link to={`/note/${Number(id)}`}>
                  <NoteCard
                    title={title}
                    updatedAt={updatedAt}
                    content={content}
                  />
                </Link>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Center>
  );
};
