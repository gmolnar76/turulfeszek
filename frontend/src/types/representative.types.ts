/**
 * Képviselői Dashboard és Esélykalkulátor típusok
 * Mi Hazánk fókusz - valasztas.hu 2022 adatokhoz
 */

import type { CountyId, ConstituencyData, PartyVotingResult } from './election.types';

// ============================================================================
// ESÉLYKALKULÁTOR TÍPUSOK
// ============================================================================

export interface ChanceCalculation {
  constituencyId: string;
  constituencyName: string;
  countyId: CountyId;
  
  // 2022-es eredmények
  currentPosition: number;           // Hányadik helyen végzett (1-n)
  currentVotes: number;              // Kapott szavazatok
  currentPercentage: number;         // Elért százalék
  totalValidVotes: number;           // Összes érvényes szavazat
  
  // Versenytársak
  competitors: CompetitorResult[];
  
  // Számított értékek
  gapToSecond: number;               // Távolság a 2. helyhez (szavazat)
  gapToFirst: number;                // Távolság az 1. helyhez (szavazat)
  gapToThird: number;                // Távolság a 3. helyhez (ha nem ott van)
  
  // Mobilizációs potenciál
  registeredVoters: number;          // Névjegyzékben szereplők
  actualVoters: number;              // Ténylegesen szavazók
  nonVoters: number;                 // Nem szavazók (potenciál)
  participationRate: number;         // Részvételi arány %
  
  // Célszámok
  targetVotes2026: number;           // Reális cél 2026-ra
  requiredGrowthPercent: number;     // Szükséges növekedés %
  mobilizationTargetPercent: number; // Nem szavazók hány %-át kell meggyőzni
  
  // Platform adatok
  platformMembers: number;           // Regisztrált tagok a körzetben
  platformCoverage: number;          // Tagok / Mi Hazánk szavazók %
  
  // Minősítés
  competitiveness: 'safe' | 'competitive' | 'challenging' | 'difficult';
  priorityLevel: 'high' | 'medium' | 'low';
}

export interface CompetitorResult {
  position: number;
  partyId: string;
  partyName: string;
  candidateName?: string;
  votes: number;
  percentage: number;
  isWinner: boolean;
}

// ============================================================================
// GENERÁCIÓS ELÉRÉS TÍPUSOK
// ============================================================================

export type AgeGroupCategory = 
  | 'toddler'    // 0-5 év
  | 'child'      // 6-13 év
  | 'teen'       // 14-17 év
  | 'young'      // 18-24 év
  | 'adult'      // 25-39 év
  | 'middle'     // 40-59 év
  | 'senior';    // 60+ év

export interface GenerationalStats {
  ageGroup: AgeGroupCategory;
  label: string;
  ageRange: string;
  emoji: string;
  memberCount: number;
  percentage: number;
  canVote: boolean;
  canRegisterSelf: boolean;
  requiresParentApproval: boolean;
}

export interface FamilyStats {
  totalFamilies: number;
  multiGenerationalFamilies: number;  // 3+ generáció
  averageFamilySize: number;
  familiesWithChildren: number;
  childrenCount: number;
  
  // Célok
  targetChildrenByNextCamp: number;
  currentProgress: number;
}

export const AGE_GROUP_CONFIG: Record<AgeGroupCategory, Omit<GenerationalStats, 'memberCount' | 'percentage'>> = {
  toddler: {
    ageGroup: 'toddler',
    label: 'Kisgyermek',
    ageRange: '0-5 év',
    emoji: '👶',
    canVote: false,
    canRegisterSelf: false,
    requiresParentApproval: true
  },
  child: {
    ageGroup: 'child',
    label: 'Gyermek',
    ageRange: '6-13 év',
    emoji: '👧',
    canVote: false,
    canRegisterSelf: false,
    requiresParentApproval: true
  },
  teen: {
    ageGroup: 'teen',
    label: 'Kamasz',
    ageRange: '14-17 év',
    emoji: '👦',
    canVote: false,
    canRegisterSelf: false,
    requiresParentApproval: true
  },
  young: {
    ageGroup: 'young',
    label: 'Fiatal felnőtt',
    ageRange: '18-24 év',
    emoji: '🧑',
    canVote: true,
    canRegisterSelf: true,
    requiresParentApproval: false
  },
  adult: {
    ageGroup: 'adult',
    label: 'Felnőtt',
    ageRange: '25-39 év',
    emoji: '👩',
    canVote: true,
    canRegisterSelf: true,
    requiresParentApproval: false
  },
  middle: {
    ageGroup: 'middle',
    label: 'Középkorú',
    ageRange: '40-59 év',
    emoji: '👨',
    canVote: true,
    canRegisterSelf: true,
    requiresParentApproval: false
  },
  senior: {
    ageGroup: 'senior',
    label: 'Szenior',
    ageRange: '60+ év',
    emoji: '👴',
    canVote: true,
    canRegisterSelf: true,
    requiresParentApproval: false
  }
};

// ============================================================================
// MEGHÍVÓ RENDSZER TÍPUSOK - E-MAIL ALAPÚ
// ============================================================================

export type InviteType = 
  | 'adult'           // Felnőtt meghívó (18+) → meghívott e-mail címére
  | 'family'          // Családi meghívó (szülő → saját gyermek) → nincs e-mail
  | 'buddy'           // Pajtás meghívó (gyerek → gyerek) → SZÜLŐ e-mail címére
  | 'representative'; // Képviselői meghívó (körzeti) → e-mail + körzeti kód

export type InviteStatus = 
  | 'pending'         // Várakozik küldésre
  | 'sent'            // Elküldve
  | 'opened'          // Megnyitotta a linket
  | 'registered'      // Regisztrált
  | 'expired'         // Lejárt
  | 'cancelled';      // Visszavonva

export interface EmailInvite {
  id: string;
  type: InviteType;
  
  // Küldő adatai
  inviterId: string;
  inviterName: string;
  
  // Címzett adatai
  targetEmail: string;
  targetName: string;
  
  // Státusz és időpontok
  status: InviteStatus;
  createdAt: Date;
  emailSentAt?: Date;
  emailOpenedAt?: Date;
  registeredAt?: Date;
  expiresAt?: Date;
  
  // Regisztrált felhasználó
  registeredUserId?: string;
  
  // Körzet
  constituencyId?: string;
  
  // Családtag azonosító (family meghívónál)
  familyMemberId?: string;
  
  // Személyes üzenet
  personalMessage?: string;
}

// Régi kód kompatibilitás - deprecated
export interface InviteCode {
  code: string;
  type: InviteType;
  
  // Generáló
  createdBy: string;           // Felhasználó ID
  createdByName: string;       // Fantasy név
  createdAt: string;           // ISO date
  
  // Érvényesség
  expiresAt: string;           // ISO date
  isActive: boolean;
  
  // Használat
  usedBy?: string;             // Felhasználó ID aki használta
  usedAt?: string;             // ISO date
  
  // Korlátozások
  constituencyId?: string;     // Képviselői meghívónál kötelező
  maxAge?: number;             // Pajtás meghívónál: max 17
  requiresParentApproval: boolean;
}

// Pajtás meghívó kérelem (gyerek → szülő jóváhagyásra)
export interface BuddyInviteRequest {
  id: string;
  requesterId: string;        // Kérelmező családtag ID
  requesterName: string;      // Kérelmező gyerek neve
  buddyName: string;          // Barát neve
  buddyParentEmail: string;   // Barát szülőjének e-mail címe
  message?: string;           // Opcionális üzenet
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  parentApprovedAt?: Date;
  sentAt?: Date;
}

export interface InviteStats {
  totalSent: number;
  totalOpened: number;
  totalRegistered: number;
  conversionRate: number;
  
  byType: {
    adult: { sent: number; opened: number; registered: number };
    family: { sent: number; opened: number; registered: number };
    buddy: { sent: number; opened: number; registered: number };
    representative: { sent: number; opened: number; registered: number };
  };
  
  // Státusz összesítés
  byStatus: {
    pending: number;
    opened: number;
    registered: number;
    expired: number;
    cancelled: number;
  };
  
  // Top meghívók
  topInviters: {
    oderId: string;
    name: string;
    successfulInvites: number;
    points: number;
  }[];
}

// E-mail sablon típusok
export interface EmailTemplate {
  type: InviteType;
  subject: string;
  previewText: string;
  bodyTemplate: string;
}

// ============================================================================
// CSALÁDTAG KEZELÉS
// ============================================================================

export interface FamilyMember {
  id: string;
  parentId: string;             // Szülő/gondviselő user ID
  
  // Alapadatok
  name: string;
  birthYear: number;
  ageGroup: AgeGroupCategory;
  relation: 'child' | 'spouse' | 'parent' | 'sibling';
  
  // Státusz
  addedAt: Date;
  linkedUserId?: string;        // Ha össze van kötve felhasználói fiókkal
  
  // Pajtás meghívó jogosultság
  canInviteBuddies: boolean;    // Csak 10-17 évesek
  buddyInviteQuota: number;     // Max 3
  buddyInvitesSent: number;
}

export interface FamilyUnit {
  familyId: string;
  headOfFamily: string;       // Fő szülő user ID
  
  members: FamilyMember[];
  
  // Összesített adatok
  totalMembers: number;
  adultMembers: number;
  childMembers: number;
  generationCount: number;    // Hány generáció (1-4)
  
  // Település
  settlementId: string;
  constituencyId?: string;
  
  // Családi pontok
  familyActivityScore: number;
  familyBadges: string[];
}

// ============================================================================
// KÉPVISELŐI DASHBOARD
// ============================================================================

export interface RepresentativeDashboardData {
  // Képviselő adatai
  representativeId: string;
  representativeName: string;
  constituencyId: string;
  constituencyName: string;
  
  // Esélykalkulátor
  chanceCalculation: ChanceCalculation;
  
  // Generációs elérés
  generationalStats: GenerationalStats[];
  familyStats: FamilyStats;
  
  // Meghívó statisztika
  inviteStats: InviteStats;
  
  // Platform aktivitás
  platformStats: {
    totalMembers: number;
    activeLastMonth: number;
    newThisMonth: number;
    growthRate: number;
  };
  
  // Akció javaslatok
  recommendations: ActionRecommendation[];
}

export interface ActionRecommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: 'mobilization' | 'youth' | 'family' | 'event' | 'outreach';
  title: string;
  description: string;
  targetMetric: string;
  currentValue: number;
  targetValue: number;
  estimatedImpact: string;
}
