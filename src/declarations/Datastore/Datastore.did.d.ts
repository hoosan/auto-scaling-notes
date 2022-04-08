import type { Principal } from '@dfinity/principal';
export type Byte = bigint;
export type DatastoreCanisterId = Principal;
export interface DefiniteMemo {
  'id' : MemoId__1,
  'title' : string,
  'content' : string,
  'userId' : UserId,
  'createdAt' : bigint,
  'tags' : Array<string>,
  'updatedAt' : bigint,
  'canisterId' : DatastoreCanisterId,
}
export type MemoId = bigint;
export type MemoId__1 = bigint;
export type Result = { 'ok' : DefiniteMemo } |
  { 'err' : string };
export type Result_1 = { 'ok' : MemoId } |
  { 'err' : string };
export interface Self {
  'createMemo' : (
      arg_0: UserId__1,
      arg_1: Principal,
      arg_2: MemoId,
      arg_3: string,
      arg_4: Array<string>,
      arg_5: string,
    ) => Promise<Result>,
  'deleteMemo' : (arg_0: MemoId) => Promise<Result_1>,
  'getAllMemos' : () => Promise<Array<DefiniteMemo>>,
  'getMemoById' : (arg_0: MemoId) => Promise<Result>,
  'updateMemo' : (
      arg_0: MemoId,
      arg_1: [] | [string],
      arg_2: [] | [Array<string>],
      arg_3: [] | [string],
    ) => Promise<Result>,
}
export type UserId = Principal;
export type UserId__1 = Principal;
export interface _SERVICE extends Self {}
