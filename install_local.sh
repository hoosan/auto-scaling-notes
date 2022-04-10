#!/bin/bash

# For the testing purpose, a data size is set to 1 GB.
# Use a smaller number for productions.
dfx canister create Datastore
dfx build Datastore
dfx deploy --with-cycles 80000000000000 AutoScalingNote
dfx deploy AutoScalingNote_assets
# dfx canister call AutoScalingNote initDataStoreCanister '()'