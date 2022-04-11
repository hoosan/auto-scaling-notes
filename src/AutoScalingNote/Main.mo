import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";
import Option "mo:base/Option";
import List "mo:base/List";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Nat "mo:base/Nat";

import ICType "./IC";
import Types "./Types";
import Datastore "./Datastore";

shared ({ caller }) actor class Self() {

  type UserId = Types.UserId;
  type NoteId = Types.NoteId;
  type User = Types.User;
  type DatastoreCanisterId = Types.DatastoreCanisterId;
  type Byte = Types.Byte;
  type Note = Types.Note;
  type DefiniteNote = Types.DefiniteNote;
  
  // Bind the caller and the admin
  let _admin : Principal = caller;

  // The IC management canister.
  // See https://smartcontracts.org/docs/interface-spec/index.html#ic-management-canister
  let IC : ICType.Self = actor "aaaaa-aa";

  // Currently, a single canister smart contract is limited to 4 GB of storage due to WebAssembly limitations.
  // To ensure that our datastore canister does not exceed this limit, we restrict memory usage to at most 2 GB because 
  // up to 2x memory may be needed for data serialization during canister upgrades. 
  let DATASTORE_CANISTER_CAPACITY : Byte = 2_000_000_000;

  // Size limit of each note is 1 MB.
  let NOTE_DATA_SIZE = 1_000_000;

  // The number of notes on a single datastore canister can be calculated as:
  // DATASTORE_CANISTER_CAPACITY / NOTE_DATA_SIZE
  let _numberOfDataPerCanister : Nat = DATASTORE_CANISTER_CAPACITY / NOTE_DATA_SIZE;

  // Stable variables
  stable var _count = 0;
  stable var _currentDatastoreCanisterId : ?DatastoreCanisterId = null;
  stable var _stableUsers : [(UserId, User)] = [];
  stable var _stableDatastoreCanisterIds : [DatastoreCanisterId] = [];
  
  let _users = HashMap.fromIter<UserId, User>(
    _stableUsers.vals(), 10, Principal.equal, Principal.hash
  );
  var _datastoreCanisterIds = List.fromArray(_stableDatastoreCanisterIds);
  var _dataStoreCanister : ?Types.Datastore = null;
  
  // Returns the current number of notes.
  public query func count() : async Nat {
    _count;
  };

  // Returns the number of notes on a single datastore canister.
  public query func numberOfDataPerCanister() : async Nat {
    _numberOfDataPerCanister;
  };

  // Returns the number of secondary (datastore) canisters
  public query func sizeOfDatastoreCanisterIds() : async Nat {
    List.size(_datastoreCanisterIds);
  };

  // Returns the cycle balance. Useful for monitoring.
  public query func balance() : async Nat {
    Cycles.balance()
  };

  // Returns a canister id of the current secondary (datastore) canister. 
  // Traps if there is no secondary canister.
  public query ({ caller }) func currentDatastoreCanisterId(): async Result.Result<DatastoreCanisterId,Text> {
    switch _currentDatastoreCanisterId {
      case null { #err "A datastore canister is currently null." };
      case (?canisterId_) { #ok canisterId_ };
    }
  };

  // Returns a canister id of the canister containing a note of [noteId]
  // Traps if:
  //   - [caller] is not a registered user.
  //   - [noteId] exceeds [_count].
  //   - [index] exceeds the size of [_datastoreCanisterIds] list.
  public query ({ caller }) func getCanisterIdByNoteId(noteId: NoteId) : async Result.Result<DatastoreCanisterId, Text> {
    if (not (_isUserRegistered caller)) { return #err "You are not registered." };
    if (noteId >= _count) { return #err "Out of bounds error."};
    let index = noteId / _numberOfDataPerCanister;
    switch (List.get(List.reverse(_datastoreCanisterIds), index)){
      case null { #err ("Canister ID is not found. index: " # Nat.toText(index) # " size: " # Nat.toText(List.size(_datastoreCanisterIds)))  };
      case (?id) { #ok id };
    }
  };

  // Returns [user_.id].
  // Traps if [caller] is not a registered user.
  public query ({ caller }) func userId(): async Result.Result<UserId,Text> {
    switch (_users.get(caller)) {
      case (?user_) { #ok (user_.id) };
      case null { #err "You are not registered." };
    }
  };

  // Returns [_datastoreCanisterIds] as a array.
  // Traps if [caller] is not a registered user.
  public query ({ caller }) func datastoreCanisterIds(): async Result.Result<[DatastoreCanisterId],Text> {
    if (not (_isUserRegistered caller)) { return #err "You are not registered." };
    #ok (List.toArray(_datastoreCanisterIds))
  };

  // Register [caller] as a new user.
  // Returns [caller] if the registration process successfully finishes.
  // Traps if:
  //   - [caller] is not a registered user.
  //   - [caller] is the anonymous identity.
  public shared ({ caller }) func register(): async Result.Result<UserId,Text>{
    if (Principal.isAnonymous(caller)) { return #err "You need to be authenticated." };
    switch (_users.get(caller)) {
      case (?_) {
        #err "This principal id is already in use."
      };
      case null {
        let user = {
          id = caller;
          var name = "";
        };
        _users.put(caller, user);
        #ok caller
      };
    }
  };

  // Creates a new note in the current datastore caller.
  // Returns a created note.
  // Traps if:
  //   - [caller] is not a registered user.
  //   - there is no datastore canister.
  //   - it fails to generate a new datastore canister.
  public shared ({ caller }) func createNote(title: Text, content: Text) : async Result.Result<DefiniteNote, Text> {
    if (not (_isUserRegistered caller)) { return #err "You are not registered." };

    // Check the current datastore has reached its limit.
    if (_count % _numberOfDataPerCanister == 0){
      // Generate a new datastore canister
      switch (await _generateDataStoreCanister()){
        case (#err m) { return #err m };
        case (#ok canisterId_){
          _currentDatastoreCanisterId := ?canisterId_;
        };
      }
    };

    let noteId = _count;
    _count += 1;

    switch _currentDatastoreCanisterId {
      case null { #err "A datastore canister is currently null." };
      case (?canisterId_){
        let dataStoreCanister = _getDatastoreCanister(canisterId_);
        await dataStoreCanister.createNote(caller, canisterId_, noteId, title, content);
      }
    }
  };

  // Returns `true` if [caller] is a registered user.
  public shared query ({ caller }) func isRegistered(): async Bool {
    _isUserRegistered(caller)
  };

  // Sets [_dataStoreCanister] to an actor of a datastore canister.
  // Returns an actor of a datastore canister.
  private func _getDatastoreCanister(canisterId: Principal) : Types.Datastore {
    switch _dataStoreCanister {
      case null {
        let canister = actor (Principal.toText(canisterId)) : Types.Datastore;
        _dataStoreCanister := ?canister;
        canister
      };
      case (?d) { return d }
    }
  };

  // Generates a new datastore canister.
  // Returns a canister id of the generated canister.
  // Traps if it fails to generate a new canister.
  private func _generateDataStoreCanister(): async Result.Result<DatastoreCanisterId,Text>{
    try {
      Cycles.add(4_000_000_000_000);
      let noteStoreCanister = await Datastore.Self(NOTE_DATA_SIZE);
      let canisterId = Principal.fromActor(noteStoreCanister);

      _currentDatastoreCanisterId := ?canisterId;
      _dataStoreCanister := ?noteStoreCanister;
      _datastoreCanisterIds := List.push(canisterId, _datastoreCanisterIds);

      let settings: ICType.CanisterSettings = { 
        controllers = [_admin];
      };
      let params: ICType.UpdateSettings = {
        canister_id = canisterId;
        settings = settings;
      };
      await IC.update_settings(params);

      #ok (canisterId)
    } catch (e) {
      #err "An error occurred in generating a datastore canister."
    }
  };

  // Returns `true` if [principal] is a registered user.
  private func _isUserRegistered(principal: Principal): Bool {
    Option.isSome(_users.get(principal))
  };

  // Below, we implement the upgrade hooks for our canister.
  // See https://smartcontracts.org/docs/language-guide/upgrades.html

  // The work required before a canister upgrade begins.
  system func preupgrade() {
    Debug.print("Starting pre-upgrade hook...");
    _stableUsers := Iter.toArray(_users.entries());
    _stableDatastoreCanisterIds := List.toArray(_datastoreCanisterIds);
    Debug.print("pre-upgrade finished.");
  };

  // The work required after a canister upgrade ends.
  system func postupgrade() {
    Debug.print("Starting post-upgrade hook...");
    _stableUsers := [];
    _stableDatastoreCanisterIds := [];
    Debug.print("post-upgrade finished.");
  };

};
