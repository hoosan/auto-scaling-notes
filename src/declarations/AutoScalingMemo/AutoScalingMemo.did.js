export const idlFactory = ({ IDL }) => {
  const Byte = IDL.Nat;
  const MemoId = IDL.Nat;
  const UserId__1 = IDL.Principal;
  const DatastoreCanisterId__1 = IDL.Principal;
  const DefiniteMemo = IDL.Record({
    'id' : MemoId,
    'title' : IDL.Text,
    'content' : IDL.Text,
    'userId' : UserId__1,
    'createdAt' : IDL.Int,
    'tags' : IDL.Vec(IDL.Text),
    'updatedAt' : IDL.Int,
    'canisterId' : DatastoreCanisterId__1,
  });
  const Result_3 = IDL.Variant({ 'ok' : DefiniteMemo, 'err' : IDL.Text });
  const DatastoreCanisterId = IDL.Principal;
  const Result_1 = IDL.Variant({
    'ok' : DatastoreCanisterId,
    'err' : IDL.Text,
  });
  const Result_2 = IDL.Variant({
    'ok' : IDL.Vec(DatastoreCanisterId),
    'err' : IDL.Text,
  });
  const UserId = IDL.Principal;
  const Result = IDL.Variant({ 'ok' : UserId, 'err' : IDL.Text });
  const Self = IDL.Service({
    'balance' : IDL.Func([], [IDL.Nat], ['query']),
    'createMemo' : IDL.Func(
        [IDL.Text, IDL.Vec(IDL.Text), IDL.Text],
        [Result_3],
        [],
      ),
    'currentDatastoreCanisterId' : IDL.Func([], [Result_1], ['query']),
    'datastoreCanisterIds' : IDL.Func([], [Result_2], ['query']),
    'initDataStoreCanister' : IDL.Func([], [Result_1], []),
    'isRegistered' : IDL.Func([], [IDL.Bool], ['query']),
    'register' : IDL.Func([], [Result], []),
    'userId' : IDL.Func([], [Result], ['query']),
  });
  return Self;
};
export const init = ({ IDL }) => {
  const Byte = IDL.Nat;
  return [Byte];
};
