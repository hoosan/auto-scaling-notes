import type { Principal } from '@dfinity/principal';
export type Byte = bigint;
export type DatastoreCanisterId = Principal;
export interface DefiniteNote {
  'id' : NoteId__1,
  'title' : string,
  'content' : string,
  'userId' : UserId,
  'createdAt' : bigint,
  'tags' : Array<string>,
  'updatedAt' : bigint,
  'canisterId' : DatastoreCanisterId,
}
export type NoteId = bigint;
export type NoteId__1 = bigint;
export type Result = { 'ok' : DefiniteNote } |
  { 'err' : string };
export type Result_1 = { 'ok' : NoteId } |
  { 'err' : string };
export interface Self {
  'createNote' : (
      arg_0: UserId__1,
      arg_1: Principal,
      arg_2: NoteId,
      arg_3: string,
      arg_4: Array<string>,
      arg_5: string,
    ) => Promise<Result>,
  'deleteNote' : (arg_0: NoteId) => Promise<Result_1>,
  'getAllNotes' : () => Promise<Array<DefiniteNote>>,
  'getNoteById' : (arg_0: NoteId) => Promise<Result>,
  'updateNote' : (
      arg_0: NoteId,
      arg_1: [] | [string],
      arg_2: [] | [Array<string>],
      arg_3: [] | [string],
    ) => Promise<Result>,
}
export type UserId = Principal;
export type UserId__1 = Principal;
export interface _SERVICE extends Self {}
