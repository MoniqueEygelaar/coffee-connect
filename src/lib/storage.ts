// Local storage utilities for the Watercooler app

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface TimeSlot {
  day: string; // 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'
  hour: number; // 9-16 (9am to 4pm, representing 9-10, 10-11, etc.)
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
  week: string; // ISO week identifier
}

const STORAGE_KEYS = {
  USERS: 'watercooler_users',
  AVAILABILITY: 'watercooler_availability',
  MATCHES: 'watercooler_matches',
  CURRENT_USER: 'watercooler_current_user',
};

// User operations
export function getUsers(): User[] {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
}

export function addUser(user: Omit<User, 'id' | 'createdAt'>): User {
  const users = getUsers();
  const newUser: User = {
    ...user,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, newUser.id);
  return newUser;
}

export function getUserById(id: string): User | undefined {
  return getUsers().find(u => u.id === id);
}

export function getCurrentUserId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
}

export function setCurrentUserId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, id);
}

// Availability operations
export function getAllAvailability(): UserAvailability[] {
  const data = localStorage.getItem(STORAGE_KEYS.AVAILABILITY);
  return data ? JSON.parse(data) : [];
}

export function getUserAvailability(userId: string): UserAvailability | undefined {
  return getAllAvailability().find(a => a.userId === userId);
}

export function setUserAvailability(userId: string, slots: TimeSlot[]): void {
  const all = getAllAvailability();
  const existingIndex = all.findIndex(a => a.userId === userId);
  
  if (existingIndex >= 0) {
    all[existingIndex].slots = slots;
  } else {
    all.push({ userId, slots });
  }
  
  localStorage.setItem(STORAGE_KEYS.AVAILABILITY, JSON.stringify(all));
}

// Match operations
export function getMatches(): Match[] {
  const data = localStorage.getItem(STORAGE_KEYS.MATCHES);
  return data ? JSON.parse(data) : [];
}

export function addMatch(match: Omit<Match, 'id'>): Match {
  const matches = getMatches();
  const newMatch: Match = {
    ...match,
    id: crypto.randomUUID(),
  };
  matches.push(newMatch);
  localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  return newMatch;
}

export function getRecentMatches(userId: string, weeksBack: number = 4): Match[] {
  const matches = getMatches();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (weeksBack * 7));
  
  return matches.filter(m => 
    (m.user1Id === userId || m.user2Id === userId) &&
    new Date(m.matchedAt) >= cutoff
  );
}

// Get current ISO week string
export function getCurrentWeek(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week.toString().padStart(2, '0')}`;
}

// Matching algorithm
export function runMatchingAlgorithm(): Match[] {
  const users = getUsers();
  const availabilities = getAllAvailability();
  const currentWeek = getCurrentWeek();
  const existingMatches = getMatches();
  
  // Check if matching was already run this week
  const thisWeekMatches = existingMatches.filter(m => m.week === currentWeek);
  if (thisWeekMatches.length > 0) {
    return thisWeekMatches;
  }
  
  // Find overlapping slots for each pair
  const newMatches: Match[] = [];
  const matchedThisWeek = new Set<string>();
  
  // Shuffle users for randomness
  const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < shuffledUsers.length; i++) {
    const user1 = shuffledUsers[i];
    if (matchedThisWeek.has(user1.id)) continue;
    
    const user1Availability = availabilities.find(a => a.userId === user1.id);
    if (!user1Availability || user1Availability.slots.length === 0) continue;
    
    // Find best match for user1
    for (let j = i + 1; j < shuffledUsers.length; j++) {
      const user2 = shuffledUsers[j];
      if (matchedThisWeek.has(user2.id)) continue;
      
      const user2Availability = availabilities.find(a => a.userId === user2.id);
      if (!user2Availability || user2Availability.slots.length === 0) continue;
      
      // Check for recent matches (avoid pairing same people)
      const recentMatches = existingMatches.filter(m => 
        (m.user1Id === user1.id && m.user2Id === user2.id) ||
        (m.user1Id === user2.id && m.user2Id === user1.id)
      );
      
      const lastMatch = recentMatches.sort((a, b) => 
        new Date(b.matchedAt).getTime() - new Date(a.matchedAt).getTime()
      )[0];
      
      // Skip if matched in last 4 weeks (unless no other options)
      if (lastMatch) {
        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
        if (new Date(lastMatch.matchedAt) > fourWeeksAgo) continue;
      }
      
      // Find overlapping slots
      const overlappingSlots = user1Availability.slots.filter(slot1 =>
        user2Availability.slots.some(slot2 =>
          slot1.day === slot2.day && slot1.hour === slot2.hour
        )
      );
      
      if (overlappingSlots.length > 0) {
        // Pick a random overlapping slot
        const sharedSlot = overlappingSlots[Math.floor(Math.random() * overlappingSlots.length)];
        
        const match = addMatch({
          user1Id: user1.id,
          user2Id: user2.id,
          matchedAt: new Date().toISOString(),
          sharedSlot,
          week: currentWeek,
        });
        
        newMatches.push(match);
        matchedThisWeek.add(user1.id);
        matchedThisWeek.add(user2.id);
        break;
      }
    }
  }
  
  return newMatches;
}

// Stats helpers
export function getStats() {
  const users = getUsers();
  const matches = getMatches();
  const availabilities = getAllAvailability();
  
  const usersWithAvailability = availabilities.filter(a => a.slots.length > 0).length;
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
