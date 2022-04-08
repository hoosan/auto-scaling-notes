import React, { useState, useEffect } from 'react';
import { Principal } from '@dfinity/principal';
import { Box, List, ListItem, Text } from '@chakra-ui/react';

import { curriedCreateActor } from '../utils/createActor';
import { idlFactory as idlFactoryDatastore } from '../../../declarations/Datastore';
import {
  Self as IDatastore,
  DefiniteMemo,
} from '../../../declarations/Datastore/Datastore.did';

import { useAuthentication } from '../hooks/useAuthentication';
import { MemoCard } from './MemoCard';

const datastoreActor = curriedCreateActor<IDatastore>(idlFactoryDatastore);

export const MemoList = () => {
  const { identity, mainActor } = useAuthentication();
  const [memos, setMemos] = useState<DefiniteMemo[]>([]);

  const fetchMemos = async () => {
    if (!mainActor || !identity) {
      return;
    }

    const response = await mainActor.datastoreCanisterIds();
    if (!('ok' in response)) {
      return;
    }

    const canisterIds = response.ok;
    const memosOnCanisters = await Promise.all(
      canisterIds.map(async (canisterId: Principal) => {
        const datastore = datastoreActor(canisterId)({
          agentOptions: { identity },
        });
        return await datastore.getAllMemos();
      })
    );
    console.log(memosOnCanisters);

    const memos = memosOnCanisters
      .reduce((acc, v) => acc.concat(v), [])
      .sort((a, b) => {
        if (a.createdAt < b.createdAt) {
          return 1;
        } else if (a.createdAt > b.createdAt) {
          return -1;
        }
        return 0;
      });
    setMemos(memos);
  };

  useEffect(() => {
    fetchMemos();
  }, [mainActor]);

  return (
    <Box bg='white' mx='10px' borderRadius='lg' mt='20px' py='4px'>
      <List>
        {memos.map((memo, index) => {
          const { title, updatedAt, content } = memo;
          const props =
            index == memos.length - 1
              ? {}
              : {
                  borderBottom: '2px',
                  borderColor: '#EAF0F6',
                };
          return (
            <ListItem key={index} {...props}>
              <MemoCard title={title} updatedAt={updatedAt} content={content} />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};
