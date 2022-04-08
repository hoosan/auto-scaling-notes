import { useState, useEffect } from 'react';
import { atom, useRecoilState, useRecoilTransaction_UNSTABLE } from 'recoil';
import { AuthClient } from '@dfinity/auth-client';
import { HttpAgentOptions, Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

import {
  canisterId,
  idlFactory as idlFactoryAutoScalingMemo,
} from '../../../declarations/AutoScalingMemo';
import { Self as IAutoScalingMemo } from '../../../declarations/AutoScalingMemo/AutoScalingMemo.did';
import { curriedCreateActor } from '../utils/createActor';
import { User } from '../models/User';

const userState = atom<User | null>({
  key: 'user',
  default: null,
});

const days = BigInt(1);
const hours = BigInt(24);
const nanoseconds = BigInt(3600000000000);

if (!canisterId) {
  throw new Error('Canister id is not found.');
}

const autoScalingMemoActor = curriedCreateActor<IAutoScalingMemo>(
  idlFactoryAutoScalingMemo
)(canisterId);

export function useAuthentication() {
  const [user, setUser] = useRecoilState(userState);
  const [identity, setIdentity] = useState<Identity>();
  const [isLogin, setIsLogin] = useState(false);

  const handleAuthenticated = async (authClient: AuthClient) => {
    await getUser(await authClient.getIdentity());
    setIsLogin(true);
  };

  const handleLoginClick = async () => {
    const authClient = await AuthClient.create();

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

  const handleLogoutClick = async () => {
    const authClient = await AuthClient.create();
    await authClient.logout();
    setUser(null);
    setIdentity(undefined);
    setIsLogin(false);
  };

  const isAuth = async () => {
    const authClient = await AuthClient.create();
    if (await authClient.isAuthenticated()) {
      setIsLogin(true);
    }
    const identity = await authClient.getIdentity();
    const isAnonymous = identity.getPrincipal().isAnonymous();
    if (!isAnonymous) {
      await getUser(identity);
    }
  };

  const getUser = async (identity: Identity) => {
    const actor = autoScalingMemoActor({ agentOptions: { identity } });
    const isRegistered = await actor.isRegistered();
    let res = isRegistered ? await actor.userId() : await actor.register();

    let userId: Principal;
    if ('ok' in res) {
      userId = res.ok;
    } else {
      throw new Error(res.err);
    }
    setUser((prev) => ({ ...prev, uid: userId }));
  };

  useEffect(() => {
    isAuth();
  }, []);

  return {
    user,
    handleLoginClick,
    handleLogoutClick,
    isLogin,
  };
}
