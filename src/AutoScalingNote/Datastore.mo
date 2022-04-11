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
import Note "./Note";

shared ({ caller }) actor class Self(_noteDataSize: Types.Byte): async Types.Datastore {

  type UserId = Types.UserId;
  type NoteId = Types.NoteId;
  type Note = Types.Note;
  type DefiniteNote = Types.DefiniteNote;
  type Byte = Types.Byte;

  // Stable variables
  stable var _stableDatastores : [(NoteId, Note)] = [];
  
  // Bind [caller] and [_main]
  let _main : Principal = caller;

  let _datastores = HashMap.fromIter<NoteId, Note>(_stableDatastores.vals(), 10, Nat.equal, Hash.hash);
  
  // Creates a new note in a canister.
  // Returns a created note.
  // Traps if:
  //   - [caller] is not [_main]. (Design choice: one cannot directly access a secondary (datastore) canister.)
  //   - the data size exceeds the limit.
  public shared ({ caller }) func createNote(userId: UserId, canisterId: Principal, noteId: NoteId, title: Text, content: Text) : async Result.Result<DefiniteNote,Text> {
    if (_main != caller) { return #err "You can only create a note by calling the main canister." };
    if (_isLimit (title # content)) { return #err "The data size exceeded the limit." };
    let note = Note.create(noteId, canisterId, userId, title, content);
    _datastores.put(noteId, note);
    #ok (Note.freeze(note))
  };

  // Returns a note of [noteId].
  // Traps if:
  //   - a note does not exist for a given [noteId].
  //   - [caller] is not the owner of a note.
  public query ({ caller }) func getNoteById(noteId: NoteId) : async Result.Result<DefiniteNote,Text> {
    switch (_datastores.get(noteId)) {
      case null {
        #err ("A note does not exist for ID: " # Nat.toText(noteId))
      };
      case (?note_){
        if (not _isAuthenticated(note_, caller)) { return #err "You are not authenticated." };
        #ok (Note.freeze(note_))
      };
    }
  };

  // Returns all notes of [caller].
  // Returns an empty array if [caller] does not have any note in a canister.
  public query ({ caller }) func getAllNotes() : async [DefiniteNote] {
    let notes: HashMap.HashMap<NoteId, DefiniteNote> = HashMap.mapFilter<NoteId, Note, DefiniteNote>(_datastores, Nat.equal, Hash.hash, func (_: NoteId, note: Note) {
      if (note.userId == caller){
        return ?Note.freeze(note);
      } else {
        return null;
      };
    });
    Iter.toArray(notes.vals())
  };

  // Updates a note of the [caller].
  // Returns an updated note.
  // Traps if:
  //   - there is no note associated with a given [noteId].
  //   - [caller] is not the owner of a note.
  //   - the data size exceeds the limit.
  public shared ({ caller }) func updateNote(noteId: NoteId, title: ?Text, content: ?Text) : async Result.Result<DefiniteNote, Text> {
    switch (_datastores.get(noteId)) {
      case null {
        #err ("A note does not exist for ID: " # Nat.toText(noteId))
      };
      case (?note_){
        if (not _isAuthenticated(note_, caller)) { return #err "You are not authenticated." };
        if (_hasUpdateReachedLimit(note_, title, content)) { return #err "The data size exceeded the limit." };   

        let updatedNote = Note.update(note_, title, content);
        _datastores.put(noteId, updatedNote);
        #ok (Note.freeze(updatedNote))
      };
    }
  };

  // Deletes a note of [noteId]
  // Returns [noteId] of a deleted note.
  // Traps if:
  //   - there is no note associated with a given [noteId].
  //   - [caller] is not the owner of a note.
  public shared ({ caller }) func deleteNote(noteId: NoteId) : async Result.Result<NoteId, Text> {
    switch (_datastores.get(noteId)) {
      case null {
        #err ("A note does not exist for ID: " # Nat.toText(noteId))
      };
      case (?note_){
        if (not _isAuthenticated(note_, caller)) { return #err "You are not authenticated." };
        _datastores.delete(noteId);
        #ok (note_.id)
      };
    }
  };

  // Returns `true` if the owner of [note] is [userId].
  private func _isAuthenticated(note: Note, userId: UserId) : Bool {
    note.userId == userId
  };

  // Returns `true` if the data size exceeds the limit.
  private func _isLimit(t: Text) : Bool {
    Text.encodeUtf8(t).size() > _noteDataSize
  };

  // Returns `true` if the data size of an updated note exceeds the limit.
  private func _hasUpdateReachedLimit(note: Note, title: ?Text, content: ?Text) : Bool {
    switch(title, content){
      case (?t, ?c){
        _isLimit(t # c)
      };
      case (?t, null){
        _isLimit(t # note.content)
      };
      case (null, ?c){
        _isLimit(note.title # c)
      };
      case (null, null){
        false
      };
    }
  };

  // Below, we implement the upgrade hooks for our canister.
  // See https://smartcontracts.org/docs/language-guide/upgrades.html

  // The work required before a canister upgrade begins.
  system func preupgrade() {
    Debug.print("Starting pre-upgrade hook...");
    _stableDatastores := Iter.toArray(_datastores.entries());
    Debug.print("pre-upgrade finished.");
  };

  // The work required after a canister upgrade ends.
  system func postupgrade() {
    Debug.print("Starting post-upgrade hook...");
    _stableDatastores := [];
    Debug.print("post-upgrade finished.");
  };

}