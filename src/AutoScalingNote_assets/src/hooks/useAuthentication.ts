import { useEffect } from 'react';
import { atom, useRecoilState } from 'recoil';
import { AuthClient } from '@dfinity/auth-client';
import { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { useToast } from '@chakra-ui/react';
import {
  canisterId as autoScalingNoteCanisterId,
  idlFactory as idlFactoryAutoScalingNote,
} from '../../../declarations/AutoScalingNote';
import { idlFactory as idlFactoryDatastore } from '../../../declarations/Datastore';
import { Self as IAutoScalingNote } from '../../../declarations/AutoScalingNote/AutoScalingNote.did';
import { Self as IDatastore } from '../../../declarations/Datastore/Datastore.did';

import { curriedCreateActor } from '../utils/createActor';
import { User } from '../models/User';

const userState = atom<User>({
  key: 'user',
  default: {
    isLogin: false,
  },
});

const days = BigInt(1);
const hours = BigInt(24);
const nanoseconds = BigInt(3600000000000);

if (!autoScalingNoteCanisterId) {
  throw new Error('Canister id is not found.');
}

const autoScalingNoteActor = curriedCreateActor<IAutoScalingNote>(
  idlFactoryAutoScalingNote
)(autoScalingNoteCanisterId);

export function useAuthentication() {
  const [user, setUser] = useRecoilState(userState);
  const toast = useToast();

  const logout = () => {
    setUser({ isLogin: false });
  };

  const handleAuthenticated = async (authClient: AuthClient) => {
    await getUser(await authClient.getIdentity());
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
    logout();
  };

  const isAuth = async () => {
    if (user?.isLogin) {
      return;
    }

    const authClient = await AuthClient.create();
    const identity = await authClient.getIdentity();
    const isAnonymous = identity.getPrincipal().isAnonymous();
    if (!isAnonymous && (await authClient.isAuthenticated())) {
      await getUser(identity);
    }
  };

  const getUser = async (identity: Identity) => {
    const actor = autoScalingNoteActor({ agentOptions: { identity } });
    const isRegistered = await actor.isRegistered();

    const res = isRegistered ? await actor.userId() : await actor.register();

    if ('ok' in res) {
      setUser((prev) => ({ ...prev, identity, isLogin: true }));
    } else {
      toast({
        description: `${res.err}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getDatastoreActor = (canisterId: Principal) => {
    return curriedCreateActor<IDatastore>(idlFactoryDatastore)(canisterId)({
      agentOptions: { identity: user?.identity },
    });
  };

  const getMainActor = () => {
    return autoScalingNoteActor({
      agentOptions: { identity: user?.identity },
    });
  };

  useEffect(() => {
    isAuth();
  }, []);

  return {
    user,
    isLogin: user.isLogin,
    handleLoginClick,
    handleLogoutClick,
    getMainActor,
    getDatastoreActor,
  };
}
