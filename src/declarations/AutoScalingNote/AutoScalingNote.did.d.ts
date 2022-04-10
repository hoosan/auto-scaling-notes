import type { Principal } from '@dfinity/principal';
export type DatastoreCanisterId = Principal;
export type DatastoreCanisterId__1 = Principal;
export interface DefiniteNote {
  'id' : NoteId__1,
  'title' : string,
  'content' : string,
  'userId' : UserId__1,
  'createdAt' : bigint,
  'updatedAt' : bigint,
  'canisterId' : DatastoreCanisterId__1,
}
export type NoteId = bigint;
export type NoteId__1 = bigint;
export type Result = { 'ok' : UserId } |
  { 'err' : string };
export type Result_1 = { 'ok' : DatastoreCanisterId } |
  { 'err' : string };
export type Result_2 = { 'ok' : Array<DatastoreCanisterId> } |
  { 'err' : string };
export type Result_3 = { 'ok' : DefiniteNote } |
  { 'err' : string };
export interface Self {
  'balance' : () => Promise<bigint>,
  'count' : () => Promise<bigint>,
  'createNote' : (arg_0: string, arg_1: string) => Promise<Result_3>,
  'currentDatastoreCanisterId' : () => Promise<Result_1>,
  'datastoreCanisterIds' : () => Promise<Result_2>,
  'getCanisterIdByNoteId' : (arg_0: NoteId) => Promise<Result_1>,
  'isRegistered' : () => Promise<boolean>,
  'numberOfDataPerCanister' : () => Promise<bigint>,
  'register' : () => Promise<Result>,
  'sizeOfDatastoreCanisterIds' : () => Promise<bigint>,
  'userId' : () => Promise<Result>,
}
export type UserId = Principal;
export type UserId__1 = Principal;
export interface _SERVICE extends Self {}
