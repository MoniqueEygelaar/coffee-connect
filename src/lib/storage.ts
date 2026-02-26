// storage.ts — powered by Lovable Cloud

import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface TimeSlot {
  day: string;
  hour: number;
}

export interface UserAvailability {
  userId: string;
  slots: TimeSlot[];
}

export interface Match {
  id: string;
  user1_email: string;
  user2_email: string;
  matched_at: string;
  shared_slot: TimeSlot;
  week: string;
}

const STORAGE_KEYS = {
  CURRENT_USER_EMAIL: "watercooler_current_user",
};

// ==================== USERS ====================

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as any[]) || [];
}

export async function addUser(
  user: Omit<User, "id" | "created_at">
): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .insert({ name: user.name, email: user.email })
    .select()
    .single();
  if (error) throw error;
  return data as any;
}

export async function getUserByEmail(
  email: string
): Promise<User | undefined> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  if (error) throw error;
  return (data as any) || undefined;
}

export function getCurrentUserEmail(): string | null {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_EMAIL);
}

export function setCurrentUserEmail(email: string): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_EMAIL, email);
}

// ==================== AVAILABILITY ====================

export async function getUserAvailabilityByEmail(
  email: string
): Promise<UserAvailability> {
  const { data, error } = await supabase
    .from("availability")
    .select("*")
    .eq("user_email", email)
    .maybeSingle();
  if (error) throw error;
  if (!data) return { userId: email, slots: [] };
  return { userId: email, slots: (data as any).slots || [] };
}

export async function setUserAvailabilityByEmail(
  email: string,
  slots: TimeSlot[]
): Promise<UserAvailability> {
  const { data: existing } = await supabase
    .from("availability")
    .select("id")
    .eq("user_email", email)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("availability")
      .update({ slots: slots as any, updated_at: new Date().toISOString() })
      .eq("user_email", email);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("availability")
      .insert({ user_email: email, slots: slots as any });
    if (error) throw error;
  }

  return { userId: email, slots };
}

export async function getAllAvailability(): Promise<UserAvailability[]> {
  const { data, error } = await supabase.from("availability").select("*");
  if (error) throw error;
  return (data as any[])?.map((a) => ({
    userId: a.user_email,
    slots: a.slots || [],
  })) || [];
}

// ==================== MATCHES ====================

export async function getMatches(): Promise<Match[]> {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .order("matched_at", { ascending: false });
  if (error) throw error;
  return (data as any[]) || [];
}

export async function runMatchingAlgorithm(): Promise<Match[]> {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const res = await fetch(
    `https://${projectId}.supabase.co/functions/v1/run-matching`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${anonKey}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || "Matching failed");
  }

  const result = await res.json();
  return result.matches || [];
}

// ==================== STATS ====================

export async function getStats() {
  const users = await getUsers();
  const matches = await getMatches();
  const availability = await getAllAvailability();

  const usersWithAvailability = availability.filter(
    (a) => a.slots.length > 0
  ).length;

  const participationRate =
    users.length > 0
      ? Math.round((usersWithAvailability / users.length) * 100)
      : 0;

  return {
    totalUsers: users.length,
    totalMatches: matches.length,
    participationRate,
    usersWithAvailability,
  };
}

// ==================== WEEK HELPER ====================

export function getCurrentWeek(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor(
    (now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
  );
  const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week.toString().padStart(2, "0")}`;
}
