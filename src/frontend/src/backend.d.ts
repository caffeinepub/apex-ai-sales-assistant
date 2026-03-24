import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Lead {
    id: bigint;
    status: LeadStatus;
    owner: Principal;
    name: string;
    createdAt: bigint;
    email: string;
    updatedAt: bigint;
    company: string;
    notes: Array<Note>;
    dealValue: number;
    phone: string;
}
export interface LeadUpdateInput {
    id: bigint;
    email?: string;
    company?: string;
    dealValue?: number;
    phone?: string;
}
export interface Stats {
    closedWon: bigint;
    activeDeals: bigint;
    totalPipelineValue: number;
    recentActivity: Array<Lead>;
    totalLeads: bigint;
    conversionRate: number;
    closedLost: bigint;
}
export interface LeadInput {
    name: string;
    email: string;
    company: string;
    dealValue: number;
    phone: string;
}
export interface UserProfile {
    name: string;
}
export interface Note {
    text: string;
    timestamp: bigint;
}
export enum LeadStatus {
    new_ = "new",
    closedWon = "closedWon",
    proposal = "proposal",
    contacted = "contacted",
    qualified = "qualified",
    closedLost = "closedLost"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addLeadNote(leadId: bigint, noteText: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createLead(leadInput: LeadInput): Promise<bigint>;
    deleteLead(leadId: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLead(leadId: bigint): Promise<Lead>;
    getLeadsByOwner(owner: Principal): Promise<Array<Lead>>;
    getStats(): Promise<Stats>;
    getSuggestions(leadId: bigint): Promise<Array<string>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listLeads(): Promise<Array<Lead>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateLead(input: LeadUpdateInput): Promise<void>;
    updateLeadStatus(leadId: bigint, newStatus: LeadStatus): Promise<void>;
}
