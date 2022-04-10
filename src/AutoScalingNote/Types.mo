module {

  public type DatastoreCanisterId = Principal;
  public type UserId = Principal;
  public type NoteId = Nat;
  public type NoteContent = Text;
  public type Byte = Nat;

  public type User = {
    id: UserId;
    var name: Text;
  };

  public type DefiniteUser = {
    id: UserId;
    name: Text;
  };

  public type Note = {
    id: NoteId;
    canisterId: DatastoreCanisterId;
    userId: UserId;
    var title: Text;
    var tags: [Text];
    var content: Text;
    createdAt: Int;
    var updatedAt: Int;
  };

  public type DefiniteNote = {
    id: NoteId;
    canisterId: DatastoreCanisterId;
    userId: UserId;
    title: Text;
    tags: [Text];
    content: Text;
    createdAt: Int;
    updatedAt: Int;
  };

  public type Datastore = actor {
    createNote : shared (
      userId: UserId,
      canisterId: Principal,
      noteId: NoteId,
      title: Text,
      tags: [Text],
      content: Text
    ) -> async { #ok : DefiniteNote; #err : Text; };
    getAllNotes : shared query () -> async [DefiniteNote];
    updateNote : shared (
      noteId: NoteId,
      title: ?Text,
      tags: ?[Text],
      content: ?Text
    ) -> async { #ok : DefiniteNote; #err : Text; };
    deleteNote : shared (noteId: NoteId) -> async { #ok : NoteId; #err : Text };
  }

}