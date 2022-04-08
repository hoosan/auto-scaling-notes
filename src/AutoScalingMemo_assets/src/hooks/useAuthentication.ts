import { useState, useEffect } from 'react';
import { atom, useRecoilState } from 'recoil';
import { AuthClient } from '@dfinity/auth-client';
import { HttpAgentOptions } from '@dfinity/agent';
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
  const [authClient, setAuthClient] = useState<AuthClient>();
  const [agentOptions, setAgentOptions] = useState<HttpAgentOptions>();
  const [isLogin, setIsLogin] = useState(false);

  const handleAuthenticated = async (authClient: AuthClient) => {
    const identity = await authClient.getIdentity();
    setAgentOptions({ identity });
    const actor = autoScalingMemoActor({ agentOptions });
    const isRegistered = await actor.isRegistered();
    let res = isRegistered ? await actor.userId() : await actor.register();

    let userId: Principal;
    if ('ok' in res) {
      userId = res.ok;
    } else {
      throw new Error();
    }
    setUser((prev) => ({ ...prev, uid: userId }));
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

  const handleLogoutClick = async () => {
    if (!authClient) {
      throw new Error('Failed to use auth client.');
    }
    await authClient.logout();
    setUser(null);
    setAgentOptions(undefined);
    setIsLogin(false);
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

  return {
    user,
    handleLoginClick,
    handleLogoutClick,
    isLogin,
    agentOptions,
    authClient,
  };
}
