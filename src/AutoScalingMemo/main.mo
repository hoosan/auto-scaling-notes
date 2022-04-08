import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";
import Option "mo:base/Option";
import List "mo:base/List";
import Principal "mo:base/Principal";
import Result "mo:base/Result";

import ICType "./IC";
import Types "./Types";
import Datastore "./Datastore";

shared ({ caller }) actor class Self(_dataSize: Types.Byte) {

  type UserId = Types.UserId;
  type MemoId = Types.MemoId;
  type User = Types.User;

  type DatastoreCanisterId = Types.DatastoreCanisterId;
  type Byte = Types.Byte;
  type Memo = Types.Memo;
  type DefiniteMemo = Types.DefiniteMemo;
  
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

  public shared ({ caller }) func initDataStoreCanister() : async Result.Result<DatastoreCanisterId,Text>{
    if (_admin != caller) { return #err "You are not authenticated." };
    switch _currentDatastoreCanisterId {
      case null { await _generateDataStoreCanister() };
      case (?_) { #err "A datastore canister is already running." };
    }
  };

  public query ({ caller }) func currentDatastoreCanisterId(): async Result.Result<DatastoreCanisterId,Text> {
    switch _currentDatastoreCanisterId {
      case null { #err "A datastore canister is currently null." };
      case (?canisterId_) { #ok canisterId_ };
    }
  };

  public query func balance() : async Nat {
    Cycles.balance()
  };

  public query ({ caller }) func datastoreCanisterIds(): async Result.Result<[DatastoreCanisterId],Text> {
    if (Principal.isAnonymous(caller)) { return #err "You need to be authenticated." };
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

  public shared ({ caller }) func createMemo(title: Text, tags: [Text], content: Text) : async Result.Result<DefiniteMemo, Text> {
    if (not (_isUserRegistered caller)) { return #err "You are not registered." };

    _count += 1;

    // Check the current datastore has reached its limit.
    if (_numberOfDataPerCanister % _count == 0){
      // Generate a new datastore canister
      switch (await _generateDataStoreCanister()){
        case (#err m) { return #err m };
        case (#ok canisterId_){
          _currentDatastoreCanisterId := ?canisterId_;
        };
      }
    };
    
    switch _currentDatastoreCanisterId {
      case null { #err "A datastore canister is currently null." };
      case (?canisterId_){
        let dataStoreCanister = _getDatastoreCanister(canisterId_);
        await dataStoreCanister.createMemo(caller, canisterId_, _count, title, tags, content);
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
      let memoStoreCanister = await Datastore.Self(_dataSize);
      let canisterId = Principal.fromActor(memoStoreCanister);

      _currentDatastoreCanisterId := ?canisterId;
      _dataStoreCanister := ?memoStoreCanister;
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
