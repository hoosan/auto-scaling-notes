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

shared ({ caller }) actor class Self(_dataSize: Types.Byte) {

  type UserId = Types.UserId;
  type NoteId = Types.NoteId;
  type User = Types.User;

  type DatastoreCanisterId = Types.DatastoreCanisterId;
  type Byte = Types.Byte;
  type Note = Types.Note;
  type DefiniteNote = Types.DefiniteNote;
  
  let IC : ICType.Self = actor "aaaaa-aa";
  let _capacity : Byte = 4_000_000_000;
  let _numberOfDataPerCanister : Nat = _capacity / _dataSize;
  let _admin : Principal = caller;
  
  stable var _count = 0;
  stable var _currentDatastoreCanisterId : ?DatastoreCanisterId = null;
  stable var _stableUsers : [(UserId, User)] = [];
  stable var _stableDatastoreCanisterIds : [DatastoreCanisterId] = [];
  
  let _users = HashMap.fromIter<UserId, User>(
    _stableUsers.vals(), 10, Principal.equal, Principal.hash
  );
  var _datastoreCanisterIds = List.fromArray(_stableDatastoreCanisterIds);
  var _dataStoreCanister : ?Types.Datastore = null;
  
  public query func count() : async Nat {
    _count;
  };

  public query func numberOfDataPerCanister() : async Nat {
    _numberOfDataPerCanister;
  };

  public query func sizeOfDatastoreCanisterIds() : async Nat {
    List.size(_datastoreCanisterIds);
  };

  public query func balance() : async Nat {
    Cycles.balance()
  };

  public query ({ caller }) func currentDatastoreCanisterId(): async Result.Result<DatastoreCanisterId,Text> {
    switch _currentDatastoreCanisterId {
      case null { #err "A datastore canister is currently null." };
      case (?canisterId_) { #ok canisterId_ };
    }
  };

  public query ({ caller }) func getCanisterIdByNoteId(noteId: NoteId) : async Result.Result<DatastoreCanisterId, Text> {
    if (not (_isUserRegistered caller)) { return #err "You are not registered." };
    if (noteId >= _count) { return #err "Out of bounds error."};
    let index = noteId / _numberOfDataPerCanister;
    switch (List.get(List.reverse(_datastoreCanisterIds), index)){
      case null { #err ("Canister ID is not found. index: " # Nat.toText(index) # " size: " # Nat.toText(List.size(_datastoreCanisterIds)))  };
      case (?id) { #ok id };
    }
  };

  public query ({ caller }) func userId(): async Result.Result<UserId,Text> {
    switch (_users.get(caller)) {
      case (?user_) { #ok (user_.id) };
      case null { #err "You are not registered." };
    }
  };

  public query ({ caller }) func datastoreCanisterIds(): async Result.Result<[DatastoreCanisterId],Text> {
    if (not (_isUserRegistered caller)) { return #err "You are not registered." };
    #ok (List.toArray(_datastoreCanisterIds))
  };

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

  public shared ({ caller }) func createNote(title: Text, tags: [Text], content: Text) : async Result.Result<DefiniteNote, Text> {
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
        await dataStoreCanister.createNote(caller, canisterId_, noteId, title, tags, content);
      }
    }

  };

  public shared query ({ caller }) func isRegistered(): async Bool {
    _isUserRegistered(caller)
  };

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

  private func _generateDataStoreCanister(): async Result.Result<DatastoreCanisterId,Text>{
    try {
      Cycles.add(4_000_000_000_000);
      let noteStoreCanister = await Datastore.Self(_dataSize);
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

  private func _isUserRegistered(principal: Principal): Bool {
    Option.isSome(_users.get(principal))
  };

  system func preupgrade() {
    Debug.print("Starting pre-upgrade hook...");
    _stableUsers := Iter.toArray(_users.entries());
    _stableDatastoreCanisterIds := List.toArray(_datastoreCanisterIds);
    Debug.print("pre-upgrade finished.");
  };

  system func postupgrade() {
    Debug.print("Starting post-upgrade hook...");
    _stableUsers := [];
    _stableDatastoreCanisterIds := [];
    Debug.print("post-upgrade finished.");
  };

};
