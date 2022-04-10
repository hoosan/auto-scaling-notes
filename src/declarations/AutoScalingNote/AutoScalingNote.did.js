export const idlFactory = ({ IDL }) => {
  const NoteId__1 = IDL.Nat;
  const UserId__1 = IDL.Principal;
  const DatastoreCanisterId__1 = IDL.Principal;
  const DefiniteNote = IDL.Record({
    'id' : NoteId__1,
    'title' : IDL.Text,
    'content' : IDL.Text,
    'userId' : UserId__1,
    'createdAt' : IDL.Int,
    'updatedAt' : IDL.Int,
    'canisterId' : DatastoreCanisterId__1,
  });
  const Result_3 = IDL.Variant({ 'ok' : DefiniteNote, 'err' : IDL.Text });
  const DatastoreCanisterId = IDL.Principal;
  const Result_1 = IDL.Variant({
    'ok' : DatastoreCanisterId,
    'err' : IDL.Text,
  });
  const Result_2 = IDL.Variant({
    'ok' : IDL.Vec(DatastoreCanisterId),
    'err' : IDL.Text,
  });
  const NoteId = IDL.Nat;
  const UserId = IDL.Principal;
  const Result = IDL.Variant({ 'ok' : UserId, 'err' : IDL.Text });
  const Self = IDL.Service({
    'balance' : IDL.Func([], [IDL.Nat], ['query']),
    'count' : IDL.Func([], [IDL.Nat], ['query']),
    'createNote' : IDL.Func([IDL.Text, IDL.Text], [Result_3], []),
    'currentDatastoreCanisterId' : IDL.Func([], [Result_1], ['query']),
    'datastoreCanisterIds' : IDL.Func([], [Result_2], ['query']),
    'getCanisterIdByNoteId' : IDL.Func([NoteId], [Result_1], ['query']),
    'isRegistered' : IDL.Func([], [IDL.Bool], ['query']),
    'numberOfDataPerCanister' : IDL.Func([], [IDL.Nat], ['query']),
    'register' : IDL.Func([], [Result], []),
    'sizeOfDatastoreCanisterIds' : IDL.Func([], [IDL.Nat], ['query']),
    'userId' : IDL.Func([], [Result], ['query']),
  });
  return Self;
};
export const init = ({ IDL }) => { return []; };
