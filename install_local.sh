#!/bin/bash

# For the testing purpose, a data size is set to 1 GB.
# Use a smaller number for productions.
dfx deploy --with-cycles 80000000000000 --argument '(1_000_000_000)' AutoScalingMemo
dfx deploy --argument '(1_000_000_000)' AutoScalingMemo_assets
dfx canister create Datastore
dfx build Datastore
dfx canister call AutoScalingMemo initDataStoreCanister '()'