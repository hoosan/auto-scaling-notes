export const idlFactory = ({ IDL }) => {
  const Byte = IDL.Nat;
  const UserId__1 = IDL.Principal;
  const MemoId = IDL.Nat;
  const MemoId__1 = IDL.Nat;
  const UserId = IDL.Principal;
  const DatastoreCanisterId = IDL.Principal;
  const DefiniteMemo = IDL.Record({
    'id' : MemoId__1,
    'title' : IDL.Text,
    'content' : IDL.Text,
    'userId' : UserId,
    'createdAt' : IDL.Int,
    'tags' : IDL.Vec(IDL.Text),
    'updatedAt' : IDL.Int,
    'canisterId' : DatastoreCanisterId,
  });
  const Result = IDL.Variant({ 'ok' : DefiniteMemo, 'err' : IDL.Text });
  const Result_1 = IDL.Variant({ 'ok' : MemoId, 'err' : IDL.Text });
  const Self = IDL.Service({
    'createMemo' : IDL.Func(
        [
          UserId__1,
          IDL.Principal,
          MemoId,
          IDL.Text,
          IDL.Vec(IDL.Text),
          IDL.Text,
        ],
        [Result],
        [],
      ),
    'deleteMemo' : IDL.Func([MemoId], [Result_1], []),
    'getAllMemos' : IDL.Func([], [IDL.Vec(DefiniteMemo)], ['query']),
    'getMemoById' : IDL.Func([MemoId], [Result], ['query']),
    'updateMemo' : IDL.Func(
        [
          MemoId,
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Vec(IDL.Text)),
          IDL.Opt(IDL.Text),
        ],
        [Result],
        [],
      ),
  });
  return Self;
};
export const init = ({ IDL }) => {
  const Byte = IDL.Nat;
  return [Byte];
};
