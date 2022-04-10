import Time "mo:base/Time";

import Types "./Types";

module {

  type UserId = Types.UserId;
  type NoteId = Types.NoteId;
  type Note = Types.Note;
  type DefiniteNote = Types.DefiniteNote;

  public func create(id: NoteId, canisterId: Principal, userId: UserId, title: Text, tags: [Text], content: Text): Note {
    let note : Note = {
      id = id;
      userId = userId;
      canisterId = canisterId;
      var title = title;
      var tags = tags;
      var content = content;
      createdAt = Time.now();
      var updatedAt = Time.now();
    };
    note
  };

  public func freeze(note: Note) : DefiniteNote {
    let definiteNote : DefiniteNote = {
      id = note.id;
      userId = note.userId;
      canisterId = note.canisterId;
      title = note.title;
      tags = note.tags;
      content = note.content;
      createdAt = note.createdAt;
      updatedAt = note.updatedAt;
    };
    definiteNote
  };

  public func update(note: Note, title: ?Text, tags: ?[Text], content: ?Text) : Note {
    switch title {
      case null {};
      case (?title_) { note.title := title_ };
    };
    switch tags {
      case null {};
      case (?tags_) { note.tags := tags_ };
    };
    switch content {
      case null {};
      case (?content_) { note.content := content_ };
    };
    note.updatedAt := Time.now();
    note
  }

}