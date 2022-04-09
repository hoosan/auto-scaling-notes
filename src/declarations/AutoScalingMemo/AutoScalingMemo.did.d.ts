import type { Principal } from '@dfinity/principal';
export type Byte = bigint;
export type DatastoreCanisterId = Principal;
export type DatastoreCanisterId__1 = Principal;
export interface DefiniteMemo {
  'id' : MemoId__1,
  'title' : string,
  'content' : string,
  'userId' : UserId__1,
  'createdAt' : bigint,
  'tags' : Array<string>,
  'updatedAt' : bigint,
  'canisterId' : DatastoreCanisterId__1,
}
export type MemoId = bigint;
export type MemoId__1 = bigint;
export type Result = { 'ok' : UserId } |
  { 'err' : string };
export type Result_1 = { 'ok' : DatastoreCanisterId } |
  { 'err' : string };
export type Result_2 = { 'ok' : Array<DatastoreCanisterId> } |
  { 'err' : string };
export type Result_3 = { 'ok' : DefiniteMemo } |
  { 'err' : string };
export interface Self {
  'balance' : () => Promise<bigint>,
  'count' : () => Promise<bigint>,
  'createMemo' : (
      arg_0: string,
      arg_1: Array<string>,
      arg_2: string,
    ) => Promise<Result_3>,
  'currentDatastoreCanisterId' : () => Promise<Result_1>,
  'datastoreCanisterIds' : () => Promise<Result_2>,
  'getCanisterIdByMemoId' : (arg_0: MemoId) => Promise<Result_1>,
  'isRegistered' : () => Promise<boolean>,
  'numberOfDataPerCanister' : () => Promise<bigint>,
  'register' : () => Promise<Result>,
  'sizeOfDatastoreCanisterIds' : () => Promise<bigint>,
  'userId' : () => Promise<Result>,
}
export type UserId = Principal;
export type UserId__1 = Principal;
export interface _SERVICE extends Self {}
