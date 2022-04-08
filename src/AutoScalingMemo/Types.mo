module {

  public type DatastoreCanisterId = Principal;
  public type UserId = Principal;
  public type MemoId = Nat;
  public type MemoContent = Text;
  public type Byte = Nat;

  public type User = {
    id: UserId;
    var name: Text;
  };

  public type DefiniteUser = {
    id: UserId;
    name: Text;
  };

  public type Memo = {
    id: MemoId;
    canisterId: DatastoreCanisterId;
    userId: UserId;
    var title: Text;
    var tags: [Text];
    var content: Text;
    createdAt: Int;
    var updatedAt: Int;
  };

  public type DefiniteMemo = {
    id: MemoId;
    canisterId: DatastoreCanisterId;
    userId: UserId;
    title: Text;
    tags: [Text];
    content: Text;
    createdAt: Int;
    updatedAt: Int;
  };

  public type Datastore = actor {
    createMemo : shared (
      userId: UserId,
      canisterId: Principal,
      memoId: MemoId,
      title: Text,
      tags: [Text],
      content: Text
    ) -> async { #ok : DefiniteMemo; #err : Text; };
    getAllMemos : shared query () -> async [DefiniteMemo];
    updateMemo : shared (
      memoId: MemoId,
      title: ?Text,
      tags: ?[Text],
      content: ?Text
    ) -> async { #ok : DefiniteMemo; #err : Text; };
    deleteMemo : shared (memoId: MemoId) -> async { #ok : MemoId; #err : Text };
  }

}