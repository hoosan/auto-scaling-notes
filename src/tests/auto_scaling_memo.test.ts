import { jest } from '@jest/globals';
import { Secp256k1KeyIdentity } from '@dfinity/identity';
import { Principal } from '@dfinity/principal';
import fetch from 'isomorphic-fetch';

// @ts-ignore
import { idlFactory as idlFactoryAutoScalingMemo } from '../declarations/AutoScalingMemo/AutoScalingMemo.did.js';
// @ts-ignore
import { idlFactory as idlFactoryDatastore } from '../declarations/Datastore/Datastore.did.js';

import { Self as IAutoScalingMemo } from '../declarations/AutoScalingMemo/AutoScalingMemo.did';
import {
  Self as IDatastore,
  DefiniteMemo,
} from '../declarations/Datastore/Datastore.did';
import { curriedCreateActor } from './utils/createActor';
import localCanisterIds from '../../.dfx/local/canister_ids.json';
const canisterId = localCanisterIds.AutoScalingMemo.local;

const autoScalingMemoActor = curriedCreateActor<IAutoScalingMemo>(
  idlFactoryAutoScalingMemo
)(canisterId);
const datastoreActor = curriedCreateActor<IDatastore>(idlFactoryDatastore);

const identityOptionOfAlice = {
  agentOptions: {
    identity: Secp256k1KeyIdentity.generate(),
    fetch,
    host: 'http://localhost:8000',
  },
};
const actorOfAlice = autoScalingMemoActor(identityOptionOfAlice);

const identityOptionOfBob = {
  agentOptions: {
    identity: Secp256k1KeyIdentity.generate(),
    fetch,
    host: 'http://localhost:8000',
  },
};
const actorOfBob = autoScalingMemoActor(identityOptionOfBob);

jest.setTimeout(60000);

describe('User registration tests', () => {
  it('should check that Alice is not registered yet.', async () => {
    expect(await actorOfAlice.isRegistered()).toBe(false);
  });

  it('should check Alice can be registered.', async () => {
    const response = await actorOfAlice.register();
    if ('ok' in response) {
      expect(response.ok._isPrincipal).toBe(true);
    } else {
      throw new Error(response.err);
    }
  });

  it('should check Alice is already registered.', async () => {
    expect(await actorOfAlice.isRegistered()).toBe(true);
  });
});

describe('CRUD tests', () => {
  const firstMemo = {
    title: 'First test memo',
    tags: ['tagA', 'tagB'],
    content: 'This is a test memo',
  };

  const secondMemo = {
    title: 'Second test memo',
    tags: ['tagC', 'tagD'],
    content: 'This is a second test memo',
  };

  let memos: DefiniteMemo[];

  it('should check that Alice can create her fist memo.', async () => {
    const { title, tags, content } = firstMemo;
    const response = await actorOfAlice.createMemo(title, tags, content);
    if ('ok' in response) {
      expect(response.ok.title).toBe(title);
      expect(response.ok.tags).toEqual(tags);
      expect(response.ok.content).toBe(content);
    } else {
      throw new Error(response.err);
    }
  });

  it('should check that Alice can create her second memo.', async () => {
    const { title, tags, content } = secondMemo;
    const response = await actorOfAlice.createMemo(title, tags, content);
    if ('ok' in response) {
      expect(response.ok.title).toBe(title);
      expect(response.ok.tags).toEqual(tags);
      expect(response.ok.content).toBe(content);
    } else {
      throw new Error(response.err);
    }
  });

  it('should check that Alice can get her memos.', async () => {
    const { title, tags, content } = secondMemo;

    const response = await actorOfAlice.datastoreCanisterIds();
    if ('ok' in response) {
      const canisterIds = response.ok;
      const memosOnCanisters = await Promise.all(
        canisterIds.map(async (canisterId: Principal) => {
          const datastore = datastoreActor(canisterId)(identityOptionOfAlice);
          return await datastore.getAllMemos();
        })
      );
      memos = memosOnCanisters
        .reduce((acc, v) => acc.concat(v), [])
        .sort((a, b) => {
          if (a.createdAt < b.createdAt) {
            return 1;
          } else if (a.createdAt > b.createdAt) {
            return -1;
          }
          return 0;
        });
      const memo = memos[0];
      expect(memo.title).toBe(title);
      expect(memo.tags).toEqual(tags);
      expect(memo.content).toBe(content);
    } else {
      throw new Error(response.err);
    }
  });

  it('should check that Alice can update her memo.', async () => {
    const memoToUpdate = memos[0];
    const newTitie = 'This is updated title.';
    const { id, canisterId } = memoToUpdate;
    const datastore = datastoreActor(canisterId)(identityOptionOfAlice);
    const response = await datastore.updateMemo(id, [newTitie], [], []);
    if ('ok' in response) {
      const updatedMemo = response.ok;
      expect(updatedMemo.title).toBe(newTitie);
    } else {
      throw new Error(response.err);
    }
  });

  it('should check that Alice can delete her memo.', async () => {
    const memoToDellete = memos[0];
    const { id, canisterId } = memoToDellete;
    const datastore = datastoreActor(canisterId)(identityOptionOfAlice);
    const response = await datastore.deleteMemo(id);
    if ('ok' in response) {
      const expectErrorResponse = await datastore.getMemoById(id);
      if ('ok' in expectErrorResponse) {
        const memoId = expectErrorResponse.ok.id;
        throw new Error(
          `Memo (ID: ${memoId}) still exits on this database canister.`
        );
      } else {
        expect(expectErrorResponse.err).toBe(
          `A memo does not exist for ID: ${id}`
        );
      }
    } else {
      throw new Error(response.err);
    }
  });
});

describe('User authentication tests', () => {
  let memoOfAlice: DefiniteMemo;

  const memo = {
    title: 'First test memo',
    tags: ['tagA', 'tagB'],
    content: 'This is a test memo',
  };

  beforeAll(async () => {
    const response = await actorOfAlice.datastoreCanisterIds();
    if ('ok' in response) {
      const canisterIds = response.ok;
      const memosOnCanisters = await Promise.all(
        canisterIds.map(async (canisterId: Principal) => {
          const datastore = datastoreActor(canisterId)(identityOptionOfAlice);
          return await datastore.getAllMemos();
        })
      );
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
      memoOfAlice = memos[0];
    } else {
      throw new Error(response.err);
    }
  });

  it("should check Bob cannot read Alice's memo.", async () => {
    const { id, canisterId } = memoOfAlice;
    const datastore = datastoreActor(canisterId)(identityOptionOfBob);
    const response = await datastore.getMemoById(id);
    if ('ok' in response) {
      throw new Error(`Bob should not read this memo (ID: ${id})`);
    } else {
      expect(response.err).toBe('You are not authenticated.');
    }
  });

  it("should check Bob cannot update Alice's memo", async () => {
    const { id, canisterId } = memoOfAlice;
    const datastore = datastoreActor(canisterId)(identityOptionOfBob);
    const response = await datastore.updateMemo(
      id,
      ['Hello this is Bob.'],
      [],
      []
    );
    if ('ok' in response) {
      throw new Error(`Bob should not update this memo (ID: ${id})`);
    } else {
      expect(response.err).toBe('You are not authenticated.');
    }
  });

  it("should check Bob cannot delete Alice's memo", async () => {
    const { id, canisterId } = memoOfAlice;
    const datastore = datastoreActor(canisterId)(identityOptionOfBob);
    const response = await datastore.deleteMemo(id);
    if ('ok' in response) {
      throw new Error(`Bob should not update this memo (ID: ${id})`);
    } else {
      expect(response.err).toBe('You are not authenticated.');
    }
  });

  it('should check Bob cannot create his memo because he is not registered.', async () => {
    const { title, tags, content } = memo;
    const response = await actorOfBob.createMemo(title, tags, content);
    if ('ok' in response) {
      throw new Error(`Bob should not create his memo.`);
    } else {
      expect(response.err).toBe('You are not registered.');
    }
  });

  it('should check Alice cannot create her memo by directly calling a secondary canister.', async () => {
    const { userId, canisterId } = memoOfAlice;
    const { title, tags, content } = memo;
    const datastore = datastoreActor(canisterId)(identityOptionOfAlice);
    const response = await datastore.createMemo(
      userId,
      canisterId,
      BigInt(1),
      title,
      tags,
      content
    );
    if ('ok' in response) {
      throw new Error(`Alice should not create her memo.`);
    } else {
      expect(response.err).toBe(
        'You can only create a memo by calling the main canister.'
      );
    }
  });
});
