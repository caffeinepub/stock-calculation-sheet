import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Text "mo:core/Text";
import List "mo:core/List";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  // Authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // New backend-side date selection tracking
  let selectedDateMap = Map.empty<Principal, Text>(); // Tracks last selected date per user

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Character Data Types
  type AbilityScores = {
    strength : Nat;
    dexterity : Nat;
    constitution : Nat;
    intelligence : Nat;
    wisdom : Nat;
    charisma : Nat;
  };

  module AbilityScores {
    public func default() : AbilityScores {
      {
        strength = 10;
        dexterity = 10;
        constitution = 10;
        intelligence = 10;
        wisdom = 10;
        charisma = 10;
      };
    };
  };

  type Skill = {
    name : Text;
    associatedAbility : Text;
    isProficient : Bool;
    modifier : Int;
  };

  module Skill {
    public func default(name : Text, ability : Text) : Skill {
      {
        name;
        associatedAbility = ability;
        isProficient = false;
        modifier = 0;
      };
    };
  };

  type CombatStats = {
    baseArmorClass : Nat;
    initiative : Int;
    speed : Nat;
    hitPoints : Nat;
    hitDice : Text;
  };

  module CombatStats {
    public func default() : CombatStats {
      {
        baseArmorClass = 10;
        initiative = 0;
        speed = 30;
        hitPoints = 8;
        hitDice = "1d8";
      };
    };
  };

  type Item = {
    name : Text;
    description : Text;
    weight : ?Float;
    quantity : Nat;
  };

  type CharacterSheet = {
    abilities : AbilityScores;
    skills : [Skill];
    combatStats : CombatStats;
    inventory : [Item];
  };

  module CharacterSheet {
    public func default() : CharacterSheet {
      {
        abilities = AbilityScores.default();
        skills = Array.tabulate<Skill>(4, func(i) { Skill.default("Skill " # i.toText(), "Ability " # i.toText()) });
        combatStats = CombatStats.default();
        inventory = [];
      };
    };
  };

  // Persistence
  let sheets = Map.empty<Principal, CharacterSheet>();
  let snapshots = Map.empty<Principal, Map.Map<Text, CharacterSheet>>();

  public shared ({ caller }) func saveSheet(sheet : CharacterSheet) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can save sheets");
    };
    sheets.add(caller, sheet);
  };

  public query ({ caller }) func loadSheet() : async CharacterSheet {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can load sheets");
    };
    switch (sheets.get(caller)) {
      case (?sheet) { sheet };
      case (null) { CharacterSheet.default() };
    };
  };

  public query ({ caller }) func isCharacterSheetSaved() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can check sheet status");
    };
    sheets.containsKey(caller);
  };

  public shared ({ caller }) func updateSelectedDate(date : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can select a date");
    };
    selectedDateMap.add(caller, date);
  };

  public query ({ caller }) func getSelectedDate() : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can get selected date");
    };
    selectedDateMap.get(caller);
  };

  public shared ({ caller }) func saveSnapshot(date : Text, sheet : CharacterSheet) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can manage snapshots");
    };

    let userSnapshots = switch (snapshots.get(caller)) {
      case (?existing) { existing };
      case (null) { Map.empty<Text, CharacterSheet>() };
    };

    userSnapshots.add(date, sheet);
    snapshots.add(caller, userSnapshots);
  };

  public shared ({ caller }) func saveSnapshotForSelectedDate(sheet : CharacterSheet) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can save snapshots");
    };

    let date = switch (selectedDateMap.get(caller)) {
      case (?d) { d };
      case (null) { Runtime.trap("No date selected for current user") };
    };

    let userSnapshots = switch (snapshots.get(caller)) {
      case (?existing) { existing };
      case (null) { Map.empty<Text, CharacterSheet>() };
    };

    userSnapshots.add(date, sheet);
    snapshots.add(caller, userSnapshots);
  };

  public query ({ caller }) func loadSnapshot(date : Text) : async ?CharacterSheet {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can load snapshots");
    };
    switch (snapshots.get(caller)) {
      case (?userSnapshots) { userSnapshots.get(date) };
      case (null) { null };
    };
  };

  public query ({ caller }) func getSnapshotDates() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can list snapshots");
    };
    switch (snapshots.get(caller)) {
      case (?userSnapshots) {
        userSnapshots.keys().toArray();
      };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getAllSheets() : async [(Principal, CharacterSheet)] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all sheets");
    };
    sheets.toArray();
  };

  public query ({ caller }) func getAllSnapshots() : async [(Principal, [(Text, CharacterSheet)])] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all snapshots");
    };

    let result = List.empty<(Principal, [(Text, CharacterSheet)])>();

    snapshots.forEach(
      func(principal, snapshotMap) {
        let snapshotArray = snapshotMap.toArray();
        result.add((principal, snapshotArray));
      }
    );

    result.toArray();
  };
};
