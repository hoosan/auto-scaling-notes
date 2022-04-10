#!/bin/bash

dfx canister create Datastore
dfx build Datastore
echo "yes" | dfx deploy --with-cycles 80000000000000 AutoScalingNote
echo "yes" | dfx deploy AutoScalingNote_assets
