import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import List "mo:base/List";
import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";
import Option "mo:base/Option";
import Principal "mo:base/Principal";

import Types "./Types";
import Memo "./Memo";

shared ({ caller }) actor class Self(_dataSize: Types.Byte): async Types.Datastore {

  type UserId = Types.UserId;
  type MemoId = Types.MemoId;
  type Memo = Types.Memo;
  type DefiniteMemo = Types.DefiniteMemo;
  type Byte = Types.Byte;

  stable var _stableDatastores : [(MemoId, Memo)] = [];
  
  let _main : Principal = caller;
  let _datastores = HashMap.fromIter<MemoId, Memo>(_stableDatastores.vals(), 10, Nat.equal, Hash.hash);
  
  public shared ({ caller }) func createMemo(userId: UserId, canisterId: Principal, memoId: MemoId, title: Text, tags: [Text], content: Text) : async Result.Result<DefiniteMemo,Text> {
    if (_main != caller) { return #err "You can only create a memo by calling the main canister." };
    let memo = Memo.create(memoId, canisterId, userId, title, tags, content);
    _datastores.put(memoId, memo);
    #ok (Memo.freeze(memo))
  };

  public query ({ caller }) func getMemoById(memoId: MemoId) : async Result.Result<DefiniteMemo,Text> {
    switch (_datastores.get(memoId)) {
      case null {
        #err ("A memo does not exist for ID: " # Nat.toText(memoId))
      };
      case (?memo_){
        if (not _isAuthenticated(memo_, caller)) { return #err "You are not authenticated." };
        #ok (Memo.freeze(memo_))
      };
    }
  };

  public query ({ caller }) func getAllMemos() : async [DefiniteMemo] {
    let memos: HashMap.HashMap<MemoId, DefiniteMemo> = HashMap.mapFilter<MemoId, Memo, DefiniteMemo>(_datastores, Nat.equal, Hash.hash, func (_: MemoId, memo: Memo) {
      if (memo.userId == caller){
        return ?Memo.freeze(memo);
      } else {
        return null;
      };
    });
    Iter.toArray(memos.vals())
  };

  public shared ({ caller }) func updateMemo(memoId: MemoId, title: ?Text, tags: ?[Text], content: ?Text) : async Result.Result<DefiniteMemo, Text> {
    switch (_datastores.get(memoId)) {
      case null {
        #err ("A memo does not exist for ID: " # Nat.toText(memoId))
      };
      case (?memo_){
        if (not _isAuthenticated(memo_, caller)) { return #err "You are not authenticated." };
        let updatedMemo = Memo.update(memo_, title, tags, content);
        _datastores.put(memoId, updatedMemo);
        #ok (Memo.freeze(updatedMemo))
      };
    }
  };

  public shared ({ caller }) func deleteMemo(memoId: MemoId) : async Result.Result<MemoId, Text> {
    switch (_datastores.get(memoId)) {
      case null {
        #err ("A memo does not exist for ID: " # Nat.toText(memoId))
      };
      case (?memo_){
        if (not _isAuthenticated(memo_, caller)) { return #err "You are not authenticated." };
        _datastores.delete(memoId);
        #ok (memo_.id)
      };
    }
  };

  private func _isAuthenticated(memo: Memo, userId: UserId) : Bool {
    memo.userId == userId
  };

  system func preupgrade() {
    Debug.print("Starting pre-upgrade hook...");
    _stableDatastores := Iter.toArray(_datastores.entries());
    Debug.print("pre-upgrade finished.");
  };

  system func postupgrade() {
    Debug.print("Starting post-upgrade hook...");
    _stableDatastores := [];
    Debug.print("post-upgrade finished.");
  };

}