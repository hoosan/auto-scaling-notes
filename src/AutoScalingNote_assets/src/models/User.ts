import { Identity } from '@dfinity/agent';

export interface User {
  identity?: Identity;
  isLogin: boolean;
}
