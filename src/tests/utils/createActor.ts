import {
  Actor,
  HttpAgent,
  HttpAgentOptions,
  ActorConfig,
} from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { IDL } from '@dfinity/candid';

export function curriedCreateActor<T>(idlFactory: IDL.InterfaceFactory) {
  return (canisterId: string | Principal) => {
    return (options: {
      agentOptions?: HttpAgentOptions;
      actorOptions?: ActorConfig;
    }) => {
      const agent = new HttpAgent({ ...options?.agentOptions });

      // Fetch root key for certificate validation during development
      if (process.env.NODE_ENV !== 'production') {
        agent.fetchRootKey().catch((err) => {
          console.warn(
            'Unable to fetch root key. Check to ensure that your local replica is running'
          );
          console.error(err);
        });
      }

      // Creates an actor with using the candid interface and the HttpAgent
      return Actor.createActor<T>(idlFactory, {
        agent,
        canisterId,
        ...options?.actorOptions,
      });
    };
  };
}

export function createActor<T>(
  idlFactory: IDL.InterfaceFactory,
  canisterId: string | Principal,
  options: { agentOptions?: HttpAgentOptions; actorOptions?: ActorConfig }
) {
  return curriedCreateActor<T>(idlFactory)(canisterId)(options);
}
