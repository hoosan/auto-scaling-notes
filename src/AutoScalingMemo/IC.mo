// This is a generated Motoko binding.
module {
  public type CanisterId = Principal;
  public type CanisterSettings = {
    controllers : [Principal];
  };
  public type UpdateSettings = {
    canister_id : Principal;
    settings : CanisterSettings;
  };
  public type DefiniteCanisterSettings = {
    controllers : [Principal];
    freezing_threshold : Nat;
    memory_allocation : Nat;
    compute_allocation : Nat;
  };
  public type WasmModule = Blob;
  public type Self = actor {
    canister_status : shared query { canister_id : CanisterId } -> async {
      status : { #stopped; #stopping; #running };
      memory_size : Nat;
      cycles : Nat;
      settings : DefiniteCanisterSettings;
      module_hash : ?Blob;
    };
    create_canister : shared { settings : ?CanisterSettings } -> async {
      canister_id : CanisterId;
    };
    delete_canister : shared { canister_id : CanisterId } -> async ();
    deposit_cycles : shared { canister_id : CanisterId } -> async ();
    install_code : shared {
      arg : Blob;
      wasm_module : WasmModule;
      mode : { #reinstall; #upgrade; #install };
      canister_id : CanisterId;
    } -> async ();
    provisional_create_canister_with_cycles : shared {
      settings : ?CanisterSettings;
      amount : ?Nat;
    } -> async { canister_id : CanisterId };
    provisional_top_up_canister : shared {
      canister_id : CanisterId;
      amount : Nat;
    } -> async ();
    raw_rand : shared () -> async Blob;
    start_canister : shared { canister_id : CanisterId } -> async ();
    stop_canister : shared { canister_id : CanisterId } -> async ();
    uninstall_code : shared { canister_id : CanisterId } -> async ();
    update_settings : shared {
      canister_id : Principal;
      settings : CanisterSettings;
    } -> async ();
  };
}