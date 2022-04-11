# Auto Scaling Notes

Auto Scaling Notes is an experimental Dapp for demonstrating how scalability works using inter-canister calls.
Internet Computer's canister has a limit of 4GB of usable memory.
Still, this limit can scale according to the number of users and notes by automatically adding canisters that store notes as needed.

# Approach

The back-end consists of two main types of canisters.
(1) a primary canister with index information of secondary canisters (2) a secondary canister that stores private notes for multiple users and returns the information to the authorized requester.

Users register through interaction with the primary canister, and users can access the Dapp by authenticating using Internet Identity.
Secondary canisters store note data in a hash map keyed by the note ID, with the note information as a value.
A single canister stores multiple users' notes, and only the creator can access them (read, update, delete).

When the capacity of the current secondary canister fills up, the primary canister automatically creates a next secondary canister.
This behavior provides scalability when the number of users or notes increases.

> You can find an alternative approach in, for example, [IC-Drive](https://github.com/IC-Drive/ic-drive), which also consists of primary and secondary canisters; the primary canister creates a secondary canister for each user, which the user occupies and uses.

In this application, the limit for a single canister is 2 GB.
This number is half of the 4GB limit mentioned above because double the memory of data may be needed when upgrading a canister.
See [Encryoted Notes App's comments](https://github.com/dfinity/examples/blob/master/motoko/encrypted-notes-dapp/src/encrypted_notes_motoko/main.mo#L25-L28) on this.
Also, the capacity per note is fixed at 1MB, which means that one canister can store 2GB/1MB = 2000 notes.
The total number of notes is stored in the primary canister, and a new canister is automatically created when the number of notes becomes a multiple of 2000.
For this reason, new memos must always be created through the primary canister.

Because the notes are stored in multiple canisters, access to them requires some ingenuity.
First, access the primary canister to obtain a list of secondary canisters.
Next, access the secondary canisters in parallel to retrieve the notes stored in the canisters.
Since multiple users' notes are stored in a canister, we check that the caller's principal ID and the creator of the note match, so that other users' notes cannot be viewed.

# Disclaimer

This code is an example of Dapp that demonstrates the scalability of canisters for the Internet Computer.
Please do not use this code in production and scenarios in which sensitive data could be involved.

The biggest security concern is data encryption.
Since text data is stored in a canister in the current implementation, its controller can view the data.
The solution is to provide end-to-end encryption, for example, solutions such as [IC-Vault](https://github.com/timohanke/icvault).
In the official Dfinity example, [Encrypted Notes App](https://github.com/dfinity/examples/tree/master/motoko/encrypted-notes-dapp) also takes the same approach.

# Deployment

## Local deployment

1. Install DFX. Please keep in mind that the CLI currently runs on Linux and Apple-based PCs.
   Install npm packages from the project root:

```
npm install
```

2. In case DFX was already started before, run the following:

```
dfx stop
rm -rm .dfx
```

3. Run in a separate shell (it blocks the shell):

```
dfx start --clean
```

4. Install a local Internet Identity (II) canister.

(i) Clone the internet Identity repo locally, adjacent to this project.

```
cd ../internet-identity
rm -rf .dfx/local
II_FETCH_ROOT_KEY=1 II_DUMMY_CAPTCHA=1  dfx deploy --argument '(null)'
```

(ii) To check the canister ID of local II, run:

```
dfx canister id internet_identity
```

(iii) Visit the local II on your browser and create at least one local internet identity. The URL is the combination of the canister ID and `.localhost:8000`, for example:

```
http://rkp4c-7iaaa-aaaaa-aaaca-cai.localhost:8000/
```

Replace `rkp4c-7iaaa-aaaaa-aaaca-cai` with the canister ID of your local II canister in (ii).

(iv) Copy the canister ID of the local II canister and paste it into webpack.config.cjs in this project on the LOCAL_II_CANISTER variable on line 13.

5. Deploy the canisters locally:

```
sh ./install_local.sh
```

6. To get the front-end with hot-reloading, run:

```
npm run start
```

# E2E testing

This project demonstrates how one can write e2e tests.
The tests are implemented in `auto_scaling_note.test.ts` with the jest library.

One can run tests locally via:

```
npm run test
```

# Further Reading

To learn more before you start working with Dapps on the Internet Computer, see the following documentation available online:

- [Quick Start](https://sdk.dfinity.org/docs/quickstart/quickstart-intro.html)
- [SDK Developer Tools](https://sdk.dfinity.org/docs/developers-guide/sdk-guide.html)
- [Motoko Programming Language Guide](https://sdk.dfinity.org/docs/language-guide/motoko.html)
- [Motoko Language Quick Reference](https://sdk.dfinity.org/docs/language-guide/language-manual.html)
- [JavaScript API Reference](https://erxue-5aaaa-aaaab-qaagq-cai.raw.ic0.app)

# Acknowledgements

This project was developed for the [ICDevs.org Bounty #20 - QuickStart Dapp - Scaling With Canisters](https://forum.dfinity.org/t/icdevs-org-bounty-20-quickstart-dapp-scaling-with-canisters-200-icp-100-icp-50-icp-multiple-winners/11756)

I thank [@krpeacoke](https://github.com/krpeacock), the author of [Auth-Client Demo](https://github.com/krpeacock/auth-client-demo), whose code was the starting point for this project's webpack configuration working with the internet identity.

I thank the authors of [IC-Drive](https://github.com/IC-Drive/ic-drive), whose code was the starting point for this project's back-end.
