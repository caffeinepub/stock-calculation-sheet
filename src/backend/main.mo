import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Text "mo:core/Text";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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

  public shared ({ caller }) func saveSheet(sheet : CharacterSheet) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can save sheets");
    };
    sheets.add(caller, sheet);
  };

  public query ({ caller }) func loadSheet() : async CharacterSheet {
    switch (sheets.get(caller)) {
      case (?sheet) { sheet };
      case (null) { CharacterSheet.default() };
    };
  };

  public query ({ caller }) func isCharacterSheetSaved() : async Bool {
    sheets.containsKey(caller);
  };

  public query ({ caller }) func getAllSheets() : async [(Principal, CharacterSheet)] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all sheets");
    };
    sheets.toArray();
  };
};
