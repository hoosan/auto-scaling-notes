import { jest } from '@jest/globals';
import { Secp256k1KeyIdentity } from '@dfinity/identity';
import { Principal } from '@dfinity/principal';
import fetch from 'isomorphic-fetch';

// @ts-ignore
import { idlFactory as idlFactoryAutoScalingNote } from '../declarations/AutoScalingNote/AutoScalingNote.did.js';
// @ts-ignore
import { idlFactory as idlFactoryDatastore } from '../declarations/Datastore/Datastore.did.js';

import { Self as IAutoScalingNote } from '../declarations/AutoScalingNote/AutoScalingNote.did';
import {
  Self as IDatastore,
  DefiniteNote,
} from '../declarations/Datastore/Datastore.did';
import { curriedCreateActor } from '../AutoScalingNote_assets/src/utils/createActor';
import localCanisterIds from '../../.dfx/local/canister_ids.json';
const canisterId = localCanisterIds.AutoScalingNote.local;

const autoScalingNoteActor = curriedCreateActor<IAutoScalingNote>(
  idlFactoryAutoScalingNote
)(canisterId);
const datastoreActor = curriedCreateActor<IDatastore>(idlFactoryDatastore);

const identityOptionOfAlice = {
  agentOptions: {
    identity: Secp256k1KeyIdentity.generate(),
    fetch,
    host: 'http://localhost:8000',
  },
};
const actorOfAlice = autoScalingNoteActor(identityOptionOfAlice);

const identityOptionOfBob = {
  agentOptions: {
    identity: Secp256k1KeyIdentity.generate(),
    fetch,
    host: 'http://localhost:8000',
  },
};
const actorOfBob = autoScalingNoteActor(identityOptionOfBob);

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

  it('should check Alice has a user id.', async () => {
    const response = await actorOfAlice.userId();
    if ('ok' in response) {
      expect(response.ok._isPrincipal).toBe(true);
    } else {
      throw new Error(response.err);
    }
  });
});

describe('CRUD tests', () => {
  const firstNote = {
    title: 'First test note',
    content: 'This is a test note',
  };

  const secondNote = {
    title: 'Second test note',
    content: 'This is a second test note',
  };

  let notes: DefiniteNote[];

  let returnedNote1: DefiniteNote;
  let returnedNote2: DefiniteNote;

  it('should check that Alice can create her fist note.', async () => {
    const { title, content } = firstNote;
    const response = await actorOfAlice.createNote(title, content);
    if ('ok' in response) {
      returnedNote1 = response.ok;
      expect(returnedNote1.title).toBe(title);
      expect(returnedNote1.content).toBe(content);
    } else {
      throw new Error(response.err);
    }
  });

  it('should check that Alice can create her second note.', async () => {
    const { title, content } = secondNote;
    const response = await actorOfAlice.createNote(title, content);
    if ('ok' in response) {
      returnedNote2 = response.ok;
      expect(returnedNote2.title).toBe(title);
      expect(returnedNote2.content).toBe(content);
    } else {
      throw new Error(response.err);
    }
  });

  it('should check that Alice can get her notes.', async () => {
    const { title, content } = secondNote;

    const response = await actorOfAlice.datastoreCanisterIds();
    if ('ok' in response) {
      const canisterIds = response.ok;
      const notesOnCanisters = await Promise.all(
        canisterIds.map(async (canisterId: Principal) => {
          const datastore = datastoreActor(canisterId)(identityOptionOfAlice);
          return await datastore.getAllNotes();
        })
      );
      notes = notesOnCanisters
        .reduce((acc, v) => acc.concat(v), [])
        .sort((a, b) => {
          if (a.createdAt < b.createdAt) {
            return 1;
          } else if (a.createdAt > b.createdAt) {
            return -1;
          }
          return 0;
        });
      const note = notes[0];
      expect(note.title).toBe(title);
      expect(note.content).toBe(content);
    } else {
      throw new Error(response.err);
    }
  });

  it('should check that Alice can update her note.', async () => {
    const noteToUpdate = notes[0];
    const newTitie = 'This is updated title.';
    const { id, canisterId } = noteToUpdate;
    const datastore = datastoreActor(canisterId)(identityOptionOfAlice);
    const response = await datastore.updateNote(id, [newTitie], []);
    if ('ok' in response) {
      const updatedNote = response.ok;
      expect(updatedNote.title).toBe(newTitie);
    } else {
      throw new Error(response.err);
    }
  });

  it('should check that Alice can delete her note.', async () => {
    const noteToDellete = notes[0];
    const { id, canisterId } = noteToDellete;
    const datastore = datastoreActor(canisterId)(identityOptionOfAlice);
    const response = await datastore.deleteNote(id);
    if ('ok' in response) {
      const expectErrorResponse = await datastore.getNoteById(id);
      if ('ok' in expectErrorResponse) {
        const noteId = expectErrorResponse.ok.id;
        throw new Error(
          `Note (ID: ${noteId}) still exits on this database canister.`
        );
      } else {
        expect(expectErrorResponse.err).toBe(
          `A note does not exist for ID: ${id}`
        );
      }
    } else {
      throw new Error(response.err);
    }
  });

  it('should check a canister ID can be accessed by using a note ID (1).', async () => {
    const { id, canisterId } = returnedNote1;
    const response = await actorOfAlice.getCanisterIdByNoteId(id);
    if ('ok' in response) {
      expect(response.ok).toEqual(canisterId);
    } else {
      throw new Error(response.err);
    }
  });

  it('should check a canister ID can be accessed by using a note ID (2).', async () => {
    const { id, canisterId } = returnedNote2;
    const response = await actorOfAlice.getCanisterIdByNoteId(id);
    if ('ok' in response) {
      expect(response.ok).toEqual(canisterId);
    } else {
      throw new Error(response.err);
    }
  });
});

describe('User authentication tests', () => {
  let noteOfAlice: DefiniteNote;

  const note = {
    title: 'First test note',
    content: 'This is a test note',
  };

  beforeAll(async () => {
    const response = await actorOfAlice.datastoreCanisterIds();
    if ('ok' in response) {
      const canisterIds = response.ok;
      const notesOnCanisters = await Promise.all(
        canisterIds.map(async (canisterId: Principal) => {
          const datastore = datastoreActor(canisterId)(identityOptionOfAlice);
          return await datastore.getAllNotes();
        })
      );
      const notes = notesOnCanisters
        .reduce((acc, v) => acc.concat(v), [])
        .sort((a, b) => {
          if (a.createdAt < b.createdAt) {
            return 1;
          } else if (a.createdAt > b.createdAt) {
            return -1;
          }
          return 0;
        });
      noteOfAlice = notes[0];
    } else {
      throw new Error(response.err);
    }
  });

  it("should check Bob cannot read Alice's note.", async () => {
    const { id, canisterId } = noteOfAlice;
    const datastore = datastoreActor(canisterId)(identityOptionOfBob);
    const response = await datastore.getNoteById(id);
    if ('ok' in response) {
      throw new Error(`Bob should not read this note (ID: ${id})`);
    } else {
      expect(response.err).toBe('You are not authenticated.');
    }
  });

  it("should check Bob cannot update Alice's note", async () => {
    const { id, canisterId } = noteOfAlice;
    const datastore = datastoreActor(canisterId)(identityOptionOfBob);
    const response = await datastore.updateNote(id, ['Hello this is Bob.'], []);
    if ('ok' in response) {
      throw new Error(`Bob should not update this note (ID: ${id})`);
    } else {
      expect(response.err).toBe('You are not authenticated.');
    }
  });

  it("should check Bob cannot delete Alice's note", async () => {
    const { id, canisterId } = noteOfAlice;
    const datastore = datastoreActor(canisterId)(identityOptionOfBob);
    const response = await datastore.deleteNote(id);
    if ('ok' in response) {
      throw new Error(`Bob should not update this note (ID: ${id})`);
    } else {
      expect(response.err).toBe('You are not authenticated.');
    }
  });

  it('should check Bob cannot create his note because he is not registered.', async () => {
    const { title, content } = note;
    const response = await actorOfBob.createNote(title, content);
    if ('ok' in response) {
      throw new Error(`Bob should not create his note.`);
    } else {
      expect(response.err).toBe('You are not registered.');
    }
  });

  it("should check Bob doesn't have a user id.", async () => {
    const response = await actorOfBob.userId();
    if ('ok' in response) {
      throw new Error('Bob should not have a user id.');
    } else {
      expect(response.err).toBe('You are not registered.');
    }
  });

  it('should check Alice cannot create her note by directly calling a secondary canister.', async () => {
    const { userId, canisterId } = noteOfAlice;
    const { title, content } = note;
    const datastore = datastoreActor(canisterId)(identityOptionOfAlice);
    const response = await datastore.createNote(
      userId,
      canisterId,
      BigInt(1),
      title,
      content
    );
    if ('ok' in response) {
      throw new Error(`Alice should not create her note.`);
    } else {
      expect(response.err).toBe(
        'You can only create a note by calling the main canister.'
      );
    }
  });
});
