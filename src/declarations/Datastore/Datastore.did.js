export const idlFactory = ({ IDL }) => {
  const Byte = IDL.Nat;
  const UserId__1 = IDL.Principal;
  const NoteId = IDL.Nat;
  const NoteId__1 = IDL.Nat;
  const UserId = IDL.Principal;
  const DatastoreCanisterId = IDL.Principal;
  const DefiniteNote = IDL.Record({
    'id' : NoteId__1,
    'title' : IDL.Text,
    'content' : IDL.Text,
    'userId' : UserId,
    'createdAt' : IDL.Int,
    'tags' : IDL.Vec(IDL.Text),
    'updatedAt' : IDL.Int,
    'canisterId' : DatastoreCanisterId,
  });
  const Result = IDL.Variant({ 'ok' : DefiniteNote, 'err' : IDL.Text });
  const Result_1 = IDL.Variant({ 'ok' : NoteId, 'err' : IDL.Text });
  const Self = IDL.Service({
    'createNote' : IDL.Func(
        [
          UserId__1,
          IDL.Principal,
          NoteId,
          IDL.Text,
          IDL.Vec(IDL.Text),
          IDL.Text,
        ],
        [Result],
        [],
      ),
    'deleteNote' : IDL.Func([NoteId], [Result_1], []),
    'getAllNotes' : IDL.Func([], [IDL.Vec(DefiniteNote)], ['query']),
    'getNoteById' : IDL.Func([NoteId], [Result], ['query']),
    'updateNote' : IDL.Func(
        [
          NoteId,
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
