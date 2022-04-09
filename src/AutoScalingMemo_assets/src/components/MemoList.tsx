import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Principal } from '@dfinity/principal';
import { Box, List, ListItem } from '@chakra-ui/react';

import { DefiniteMemo } from '../../../declarations/Datastore/Datastore.did';

import { useAuthentication } from '../hooks/useAuthentication';
import { MemoCard } from './MemoCard';

export const MemoList = () => {
  const { isLogin, getMainActor, getDatastoreActor } = useAuthentication();
  const [memos, setMemos] = useState<DefiniteMemo[]>([]);

  const fetchMemos = async () => {
    const response = await getMainActor().datastoreCanisterIds();
    if (!('ok' in response)) {
      return;
    }

    const canisterIds = response.ok;
    const memosOnCanisters = await Promise.all(
      canisterIds.map(async (canisterId: Principal) => {
        const datastore = getDatastoreActor(canisterId);
        return await datastore.getAllMemos();
      })
    );

    const memos = memosOnCanisters
      .reduce((acc, v) => acc.concat(v), [])
      .sort((a, b) => {
        if (a.updatedAt < b.updatedAt) {
          return 1;
        } else if (a.updatedAt > b.updatedAt) {
          return -1;
        }
        return 0;
      });
    setMemos(memos);
  };

  useEffect(() => {
    fetchMemos();
  }, [isLogin]);

  return (
    <Box bg='white' mx='10px' borderRadius='lg' mt='20px' py='4px'>
      <List>
        {memos.map((memo, index) => {
          const { id, title, updatedAt, content } = memo;
          const props =
            index == memos.length - 1
              ? {}
              : {
                  borderBottom: '2px',
                  borderColor: '#EAF0F6',
                };
          return (
            <ListItem key={index} {...props}>
              <Link to={`/memo/${Number(id)}`}>
                <MemoCard
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
  );
};
