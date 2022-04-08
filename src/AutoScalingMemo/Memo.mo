import Time "mo:base/Time";

import Types "./Types";

module {

  type UserId = Types.UserId;
  type MemoId = Types.MemoId;
  type Memo = Types.Memo;
  type DefiniteMemo = Types.DefiniteMemo;

  public func create(id: MemoId, canisterId: Principal, userId: UserId, title: Text, tags: [Text], content: Text): Memo {
    let memo : Memo = {
      id = id;
      userId = userId;
      canisterId = canisterId;
      var title = title;
      var tags = tags;
      var content = content;
      createdAt = Time.now();
      var updatedAt = Time.now();
    };
    memo
  };

  public func freeze(memo: Memo) : DefiniteMemo {
    let definiteMemo : DefiniteMemo = {
      id = memo.id;
      userId = memo.userId;
      canisterId = memo.canisterId;
      title = memo.title;
      tags = memo.tags;
      content = memo.content;
      createdAt = memo.createdAt;
      updatedAt = memo.updatedAt;
    };
    definiteMemo
  };

  public func update(memo: Memo, title: ?Text, tags: ?[Text], content: ?Text) : Memo {
    switch title {
      case null {};
      case (?title_) { memo.title := title_ };
    };
    switch tags {
      case null {};
      case (?tags_) { memo.tags := tags_ };
    };
    switch content {
      case null {};
      case (?content_) { memo.content := content_ };
    };
    memo.updatedAt := Time.now();
    memo
  }

}