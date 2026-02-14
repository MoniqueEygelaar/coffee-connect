// storage.ts — fully backend-powered

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
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
  user1Id: string;
  user2Id: string;
  matchedAt: string;
  sharedSlot: TimeSlot;
  week: string;
}

const BASE_URL = "http://localhost:4000";
const STORAGE_KEYS = {
  CURRENT_USER_EMAIL: 'watercooler_current_user',
};

//
// ====================
// USERS (API)
// ====================
//

export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${BASE_URL}/users`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function addUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  const res = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || "Failed to create user");
  }

  return res.json();
}

export async function getUserById(id: string): Promise<User | undefined> {
  const users = await getUsers();
  return users.find(u => u.email === id);
}

export function getCurrentUserEmail(): string | null {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_EMAIL);
}

export function setCurrentUserEmail(email: string): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_EMAIL, email);
}

// Lookup a user by email instead of ID
export async function getUserByEmail(email: string): Promise<User | undefined> {
  const users = await getUsers();
  return users.find(u => u.email === email);
}

// Availability functions now also use email
export async function getUserAvailabilityByEmail(email: string): Promise<UserAvailability> {
  const res = await fetch(`${BASE_URL}/availability/${email}`);
  if (!res.ok) throw new Error("Failed to fetch user availability");
  return res.json();
}

export async function setUserAvailabilityByEmail(email: string, slots: TimeSlot[]): Promise<UserAvailability> {
  const res = await fetch(`${BASE_URL}/availability`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: email, slots }), // still send `userId` to backend, but it's the email
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || "Failed to save availability");
  }

  return res.json();
}

//
// ====================
// AVAILABILITY (API)
// ====================
//

export async function getAllAvailability(): Promise<UserAvailability[]> {
  const res = await fetch(`${BASE_URL}/availability`);
  if (!res.ok) throw new Error("Failed to fetch availability");
  return res.json();
}

export async function getUserAvailability(userId: string): Promise<UserAvailability> {
  const res = await fetch(`${BASE_URL}/availability/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch user availability");
  return res.json();
}

export async function setUserAvailability(userId: string, slots: TimeSlot[]): Promise<UserAvailability> {
  const res = await fetch(`${BASE_URL}/availability`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, slots }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || "Failed to save availability");
  }

  return res.json();
}

//
// ====================
// MATCHES (API)
// ====================
//

export async function getMatches(): Promise<Match[]> {
  const res = await fetch(`${BASE_URL}/matches`);
  if (!res.ok) return [];
  return res.json();
}

export async function addMatch(match: Omit<Match, 'id'>): Promise<Match> {
  const res = await fetch(`${BASE_URL}/matches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(match),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || "Failed to create match");
  }

  return res.json();
}

export async function getRecentMatches(userId: string, weeksBack: number = 4): Promise<Match[]> {
  const matches = await getMatches();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - weeksBack * 7);

  return matches.filter(
    m => (m.user1Id === userId || m.user2Id === userId) &&
         new Date(m.matchedAt) >= cutoff
  );
}

//
// ====================
// WEEK HELPER
// ====================
//

export function getCurrentWeek(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24*60*60*1000));
  const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week.toString().padStart(2, '0')}`;
}

//
// ====================
// MATCHING ALGORITHM
// ====================
//

export async function runMatchingAlgorithm(): Promise<Match[]> {
  const users = await getUsers();
  const availabilities = await getAllAvailability();
  const existingMatches = await getMatches();
  const currentWeek = getCurrentWeek();

  // Skip if matches already exist this week
  const thisWeekMatches = existingMatches.filter(m => m.week === currentWeek);
  if (thisWeekMatches.length > 0) return thisWeekMatches;

  const newMatches: Match[] = [];
  const matchedThisWeek = new Set<string>();
  const shuffledUsers = [...users].sort(() => Math.random() - 0.5);

  for (let i = 0; i < shuffledUsers.length; i++) {
    const user1 = shuffledUsers[i];
    if (matchedThisWeek.has(user1.email)) continue;

    const user1Availability = availabilities.find(a => a.userId === user1.email);
    if (!user1Availability?.slots.length) continue;

    for (let j = i + 1; j < shuffledUsers.length; j++) {
      const user2 = shuffledUsers[j];
      if (matchedThisWeek.has(user2.email)) continue;

      const user2Availability = availabilities.find(a => a.userId === user2.email);
      if (!user2Availability?.slots.length) continue;

      // Overlapping slots
      const overlappingSlots = user1Availability.slots.filter(slot1 =>
        user2Availability.slots.some(slot2 =>
          slot1.day === slot2.day && slot1.hour === slot2.hour
        )
      );

      if (overlappingSlots.length > 0) {
        const sharedSlot = overlappingSlots[Math.floor(Math.random() * overlappingSlots.length)];

        const match = await addMatch({
          user1Id: user1.email,
          user2Id: user2.email,
          matchedAt: new Date().toISOString(),
          sharedSlot,
          week: currentWeek,
        });

        newMatches.push(match);
        matchedThisWeek.add(user1.email);
        matchedThisWeek.add(user2.email);
        break;
      }
    }
  }

  return newMatches;
}

//
// ====================
// STATS
// ====================
//

export async function getStats() {
  const users = await getUsers();
  const matches = await getMatches();

  let usersWithAvailability = 0;

  await Promise.all(
    users.map(async (user) => {
      try {
        const availability = await getUserAvailabilityByEmail(user.email);
        if (availability?.slots?.length) usersWithAvailability++;
      } catch {
        // if user has no availability, just skip
      }
    })
  );

  const participationRate = users.length > 0
    ? Math.round((usersWithAvailability / users.length) * 100)
    : 0;

  return {
    totalUsers: users.length,
    totalMatches: matches.length,
    participationRate,
    usersWithAvailability,
  };
}

