/**
 * Voting Types - Frontend
 * Szavazás típusok a képviselői dashboard-hoz
 */

// Szavazás státusz
export type VoteStatus = 'upcoming' | 'active' | 'closed';

// Jogosultság típus
export type VoteEligibility = 'all' | 'trusted';

// Bizalmi kategóriák - csak ezek számítanak "megbízható" tagnak
export const TRUSTED_BADGE_CATEGORIES = ['participation', 'community', 'activity'] as const;
export type TrustedBadgeCategory = typeof TRUSTED_BADGE_CATEGORIES[number];

// Szavazási opció
export interface VoteOption {
  id: string;
  label: string;
  votes: number;
  trustedVotes: number;      // Bizalmas tagok szavazatai
  newMemberVotes: number;    // Új tagok szavazatai
}

// Szavazás
export interface Vote {
  id: string;
  title: string;
  description: string;
  status: VoteStatus;
  eligibilityType: VoteEligibility;
  options: VoteOption[];
  totalVotes: number;
  totalTrustedVotes: number;
  totalNewMemberVotes: number;
  startsAt: string;
  endsAt: string;
  createdBy: string;
  creatorName: string;
  constituencyId: string;
  createdAt: string;
  transactionHash?: string;  // Blockchain hash
  userVotedOptionId?: string; // Ha a felhasználó már szavazott
}

// Új szavazás létrehozása
export interface CreateVotePayload {
  title: string;
  description: string;
  options: string[];
  eligibilityType: VoteEligibility;
  durationDays: number;
  constituencyId: string;
}

// Szavazat leadása
export interface CastVotePayload {
  voteId: string;
  optionId: string;
  userId: string;
  isTrusted: boolean;
}

// Szavazás eredmény összesítő
export interface VoteResults {
  voteId: string;
  options: VoteOption[];
  totalVotes: number;
  totalTrustedVotes: number;
  totalNewMemberVotes: number;
  winningOptionId: string;
  winningOptionLabel: string;
}

// Szűrő opciók
export type VoteFilterStatus = 'all' | 'active' | 'closed' | 'upcoming';

// Eligibilitás címkék
export const ELIGIBILITY_LABELS: Record<VoteEligibility, string> = {
  all: '👥 Minden tag',
  trusted: '🛡️ Csak bizalmasok'
};

// Státusz címkék
export const STATUS_LABELS: Record<VoteStatus, string> = {
  upcoming: '⏳ Hamarosan',
  active: '🟢 Aktív',
  closed: '🔴 Lezárt'
};

// Státusz színek
export const STATUS_COLORS: Record<VoteStatus, string> = {
  upcoming: '#f59e0b',
  active: '#22c55e',
  closed: '#ef4444'
};
