import { useState, useEffect } from 'react';
import { atom, useRecoilState } from 'recoil';
import { AuthClient } from '@dfinity/auth-client';
import { Identity, ActorSubclass } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

import {
  canisterId as autoScalingMemoCanisterId,
  idlFactory as idlFactoryAutoScalingMemo,
} from '../../../declarations/AutoScalingMemo';
import { idlFactory as idlFactoryDatastore } from '../../../declarations/Datastore';
import { Self as IAutoScalingMemo } from '../../../declarations/AutoScalingMemo/AutoScalingMemo.did';
import { Self as IDatastore } from '../../../declarations/Datastore/Datastore.did';

import { curriedCreateActor } from '../utils/createActor';
import { User } from '../models/User';

const userState = atom<User | null>({
  key: 'user',
  default: null,
});

const days = BigInt(1);
const hours = BigInt(24);
const nanoseconds = BigInt(3600000000000);

if (!autoScalingMemoCanisterId) {
  throw new Error('Canister id is not found.');
}

const autoScalingMemoActor = curriedCreateActor<IAutoScalingMemo>(
  idlFactoryAutoScalingMemo
)(autoScalingMemoCanisterId);

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
    setIsLogin(true);
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
    const identity = await authClient.getIdentity();
    setIdentity(identity);
    const isAnonymous = identity.getPrincipal().isAnonymous();
    if (!isAnonymous) {
      await getUser(identity);
    }

    if (await authClient.isAuthenticated()) {
      setIsLogin(true);
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

  const getDatastoreActor = (canisterId: Principal) => {
    return curriedCreateActor<IDatastore>(idlFactoryDatastore)(canisterId)({
      agentOptions: { identity },
    });
  };

  const getMainActor = () => {
    return autoScalingMemoActor({
      agentOptions: { identity },
    });
  };

  useEffect(() => {
    isAuth();
  }, []);

  return {
    user,
    isLogin,
    handleLoginClick,
    handleLogoutClick,
    getMainActor,
    getDatastoreActor,
  };
}
