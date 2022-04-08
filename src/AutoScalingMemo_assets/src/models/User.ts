import { Principal } from '@dfinity/principal';

export interface User {
  uid: string | Principal;
  username?: string;
}
