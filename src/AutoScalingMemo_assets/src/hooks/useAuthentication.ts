import { useState, useEffect } from 'react';
import { atom, useRecoilState } from 'recoil';
import { AuthClient } from '@dfinity/auth-client';

import { User } from '../models/User';

const userState = atom<User | null>({
  key: 'user',
  default: null,
});

const days = BigInt(1);
const hours = BigInt(24);
const nanoseconds = BigInt(3600000000000);

export function useAuthentication() {
  const [user, setUser] = useRecoilState(userState);
  const [authClient, setAuthClient] = useState<AuthClient>();
  const [isLogin, setIsLogin] = useState(false);

  const handleAuthenticated = async (authClient: AuthClient) => {
    const identity = await authClient.getIdentity();

    // TODO: get user info from canister
    // createActor(canisterId as string, {
    //   agentOptions: {
    //     identity,
    //   },
    // });
    // setUser(***);

    setIsLogin(true);
  };

  const handleLoginClick = async () => {
    if (!authClient) {
      throw new Error('Failed to use auth client.');
    }
    await authClient.login({
      onSuccess: async () => {
        handleAuthenticated(authClient);
      },
      identityProvider:
        process.env.DFX_NETWORK === 'ic'
          ? 'https://identity.ic0.app/#authorize'
          : process.env.LOCAL_II_CANISTER,
      // Maximum authorization expiration is 8 days
      maxTimeToLive: days * hours * nanoseconds,
    });
  };

  const init = async () => {
    const authClient = await AuthClient.create();
    setAuthClient(authClient);
    if (await authClient.isAuthenticated()) {
      handleAuthenticated(authClient);
    }
  };

  useEffect(() => {
    init();
  }, []);

  return { user, handleLoginClick, isLogin };
}
