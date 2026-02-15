import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CombatStats {
    hitPoints: bigint;
    speed: bigint;
    hitDice: string;
    baseArmorClass: bigint;
    initiative: bigint;
}
export interface Item {
    weight?: number;
    name: string;
    description: string;
    quantity: bigint;
}
export interface Skill {
    modifier: bigint;
    name: string;
    associatedAbility: string;
    isProficient: boolean;
}
export interface AbilityScores {
    dexterity: bigint;
    wisdom: bigint;
    strength: bigint;
    charisma: bigint;
    constitution: bigint;
    intelligence: bigint;
}
export interface UserProfile {
    name: string;
}
export interface CharacterSheet {
    combatStats: CombatStats;
    inventory: Array<Item>;
    abilities: AbilityScores;
    skills: Array<Skill>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllSheets(): Promise<Array<[Principal, CharacterSheet]>>;
    getAllSnapshots(): Promise<Array<[Principal, Array<[string, CharacterSheet]>]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getSelectedDate(): Promise<string | null>;
    getSnapshotDates(): Promise<Array<string>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isCharacterSheetSaved(): Promise<boolean>;
    loadSheet(): Promise<CharacterSheet>;
    loadSnapshot(date: string): Promise<CharacterSheet | null>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveSheet(sheet: CharacterSheet): Promise<void>;
    saveSnapshot(date: string, sheet: CharacterSheet): Promise<void>;
    saveSnapshotForSelectedDate(sheet: CharacterSheet): Promise<void>;
    updateSelectedDate(date: string): Promise<void>;
}
