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
    getCallerUserRole(): Promise<UserRole>;
    isCallerAdmin(): Promise<boolean>;
    isCharacterSheetSaved(): Promise<boolean>;
    loadSheet(): Promise<CharacterSheet>;
    saveSheet(sheet: CharacterSheet): Promise<void>;
}
