/**
 * Voting API Routes
 * Express.js routes for representative voting management
 * 
 * Képviselői szavazás kezelés - bizalmi szint alapú jogosultsággal
 */

import { Router, Request, Response } from 'express';

const router = Router();

// Simple ID generator (no external dependency)
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// ============================================================================
// TÍPUSOK
// ============================================================================

export type VoteStatus = 'upcoming' | 'active' | 'closed';
export type VoteEligibility = 'all' | 'trusted';

// Bizalmi jelvény kategóriák
export const TRUSTED_BADGE_CATEGORIES = ['participation', 'community', 'activity'];

export interface VoteOption {
  id: string;
  label: string;
  votes: number;
  trustedVotes: number;
  newMemberVotes: number;
}

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
  transactionHash?: string;
}

export interface UserBadge {
  id: string;
  category: string;
  name: string;
}

export interface CreateVoteRequest {
  title: string;
  description: string;
  options: string[];
  eligibilityType: VoteEligibility;
  startsAt: string;
  endsAt: string;
  constituencyId: string;
}

export interface CastVoteRequest {
  optionId: string;
  userBadges: UserBadge[];
}

// ============================================================================
// IN-MEMORY ADATTÁR (demo célra)
// ============================================================================

const votes = new Map<string, Vote>();
const userVotes = new Map<string, Map<string, string>>(); // userId -> voteId -> optionId

// Mock szavazások inicializálása
function initializeMockVotes(): void {
  const mockVotes: Vote[] = [
    {
      id: 'vote-1',
      title: 'Nyári tábor időpontja 2025',
      description: 'Szavazz a 2025-ös nyári tábor időpontjára! A közösség döntése alapján kerül meghatározásra a pontos időpont.',
      status: 'active',
      eligibilityType: 'all',
      options: [
        { id: 'opt-1', label: 'Június 15-20', votes: 42, trustedVotes: 35, newMemberVotes: 7 },
        { id: 'opt-2', label: 'Július 1-6', votes: 58, trustedVotes: 45, newMemberVotes: 13 },
        { id: 'opt-3', label: 'Július 20-25', votes: 20, trustedVotes: 18, newMemberVotes: 2 },
      ],
      totalVotes: 120,
      totalTrustedVotes: 98,
      totalNewMemberVotes: 22,
      startsAt: '2024-12-01T00:00:00Z',
      endsAt: '2024-12-31T23:59:59Z',
      createdBy: 'rep-1',
      creatorName: 'Kovács János',
      constituencyId: 'budapest-01',
      createdAt: '2024-11-25T10:00:00Z',
    },
    {
      id: 'vote-2',
      title: 'Körzeti rendezvény helyszíne',
      description: 'Hol tartsuk a következő körzeti találkozót? Ez a szavazás csak a bizalmi jelvénnyel rendelkező tagok számára elérhető.',
      status: 'active',
      eligibilityType: 'trusted',
      options: [
        { id: 'opt-1', label: 'Közösségi Ház', votes: 35, trustedVotes: 35, newMemberVotes: 0 },
        { id: 'opt-2', label: 'Szabadtéri Park', votes: 25, trustedVotes: 25, newMemberVotes: 0 },
        { id: 'opt-3', label: 'Étterem', votes: 10, trustedVotes: 10, newMemberVotes: 0 },
      ],
      totalVotes: 70,
      totalTrustedVotes: 70,
      totalNewMemberVotes: 0,
      startsAt: '2024-12-03T00:00:00Z',
      endsAt: '2024-12-20T23:59:59Z',
      createdBy: 'rep-1',
      creatorName: 'Kovács János',
      constituencyId: 'budapest-01',
      createdAt: '2024-12-01T14:00:00Z',
    },
    {
      id: 'vote-3',
      title: 'Logó választás',
      description: 'Melyik legyen az új körzeti logó? Minden tag szavazhat.',
      status: 'closed',
      eligibilityType: 'all',
      options: [
        { id: 'opt-1', label: 'A verzió - Modern', votes: 89, trustedVotes: 72, newMemberVotes: 17 },
        { id: 'opt-2', label: 'B verzió - Klasszikus', votes: 45, trustedVotes: 38, newMemberVotes: 7 },
        { id: 'opt-3', label: 'C verzió - Minimalista', votes: 10, trustedVotes: 8, newMemberVotes: 2 },
      ],
      totalVotes: 144,
      totalTrustedVotes: 118,
      totalNewMemberVotes: 26,
      startsAt: '2024-11-01T00:00:00Z',
      endsAt: '2024-11-15T23:59:59Z',
      createdBy: 'rep-1',
      creatorName: 'Kovács János',
      constituencyId: 'budapest-01',
      createdAt: '2024-10-25T09:00:00Z',
      transactionHash: '0xabc123def456789...',
    },
  ];

  mockVotes.forEach(vote => votes.set(vote.id, vote));
}

// Inicializálás
initializeMockVotes();

// ============================================================================
// SEGÉDFÜGGVÉNYEK
// ============================================================================

/**
 * Ellenőrzi, hogy a felhasználó rendelkezik-e bizalmi jelvénnyel
 */
function hasTrustedBadge(userBadges: UserBadge[]): boolean {
  return userBadges.some(badge => 
    TRUSTED_BADGE_CATEGORIES.includes(badge.category.toLowerCase())
  );
}

/**
 * Ellenőrzi, hogy a felhasználó képviselő-e
 */
function isRepresentative(userBadges: UserBadge[]): boolean {
  return userBadges.some(badge => 
    badge.id === 'representative' || 
    badge.name.toLowerCase().includes('képviselő')
  );
}

/**
 * Szavazás státusz frissítése időpontok alapján
 */
function updateVoteStatus(vote: Vote): Vote {
  const now = new Date();
  const startsAt = new Date(vote.startsAt);
  const endsAt = new Date(vote.endsAt);

  if (now < startsAt) {
    vote.status = 'upcoming';
  } else if (now > endsAt) {
    vote.status = 'closed';
  } else {
    vote.status = 'active';
  }

  return vote;
}

// ============================================================================
// API VÉGPONTOK
// ============================================================================

/**
 * GET /api/votes
 * Szavazások listázása - szűrés jogosultság alapján
 */
router.get('/', (req: Request, res: Response) => {
  try {
    // Query paraméterek
    const status = req.query.status as VoteStatus | undefined;
    const constituencyId = req.query.constituencyId as string | undefined;
    
    // Felhasználó badge-ei (normál esetben auth middleware-ből jönne)
    const userBadgesHeader = req.headers['x-user-badges'] as string;
    const userBadges: UserBadge[] = userBadgesHeader 
      ? JSON.parse(userBadgesHeader) 
      : [];

    const isTrusted = hasTrustedBadge(userBadges);

    let votesList = Array.from(votes.values())
      .map(updateVoteStatus)
      .filter(vote => {
        // Ha 'trusted' típusú szavazás és a user nem bizalmas, ne jelenjen meg
        if (vote.eligibilityType === 'trusted' && !isTrusted) {
          return false;
        }
        
        // Státusz szűrés
        if (status && vote.status !== status) {
          return false;
        }
        
        // Választókerület szűrés
        if (constituencyId && vote.constituencyId !== constituencyId) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      success: true,
      data: votesList,
      meta: {
        count: votesList.length,
        userIsTrusted: isTrusted,
      },
    });
  } catch (error) {
    console.error('Error fetching votes:', error);
    res.status(500).json({
      success: false,
      error: 'Hiba a szavazások lekérdezésekor',
    });
  }
});

/**
 * GET /api/votes/:id
 * Egy szavazás részletei - jogosultság ellenőrzéssel
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vote = votes.get(id);

    if (!vote) {
      return res.status(404).json({
        success: false,
        error: 'Szavazás nem található',
      });
    }

    // Felhasználó badge-ei
    const userBadgesHeader = req.headers['x-user-badges'] as string;
    const userBadges: UserBadge[] = userBadgesHeader 
      ? JSON.parse(userBadgesHeader) 
      : [];

    const isTrusted = hasTrustedBadge(userBadges);

    // Ha 'trusted' típusú és a user nem bizalmas -> 403
    if (vote.eligibilityType === 'trusted' && !isTrusted) {
      return res.status(403).json({
        success: false,
        error: 'Ez a szavazás csak bizalmi jelvénnyel rendelkező tagok számára érhető el',
        requiredTrust: true,
      });
    }

    // Felhasználó saját szavazata
    const userId = req.headers['x-user-id'] as string || 'anonymous';
    const userVoteMap = userVotes.get(userId);
    const myVote = userVoteMap?.get(id);

    res.json({
      success: true,
      data: {
        ...updateVoteStatus(vote),
        myVote,
        canVote: vote.status === 'active' && !myVote,
        userIsTrusted: isTrusted,
      },
    });
  } catch (error) {
    console.error('Error fetching vote:', error);
    res.status(500).json({
      success: false,
      error: 'Hiba a szavazás lekérdezésekor',
    });
  }
});

/**
 * POST /api/votes
 * Új szavazás létrehozása - csak képviselőknek
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const body: CreateVoteRequest = req.body;
    
    // Felhasználó adatai (normál esetben auth middleware-ből)
    const userBadgesHeader = req.headers['x-user-badges'] as string;
    const userBadges: UserBadge[] = userBadgesHeader 
      ? JSON.parse(userBadgesHeader) 
      : [];
    const userId = req.headers['x-user-id'] as string || 'anonymous';
    const userName = req.headers['x-user-name'] as string || 'Ismeretlen';

    // Képviselői jogosultság ellenőrzés
    if (!isRepresentative(userBadges)) {
      return res.status(403).json({
        success: false,
        error: 'Csak képviselők hozhatnak létre szavazást',
        requiredBadge: 'representative',
      });
    }

    // Validáció
    if (!body.title || !body.description || !body.options || body.options.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Hiányzó vagy érvénytelen mezők (title, description, legalább 2 option szükséges)',
      });
    }

    // Új szavazás létrehozása
    const newVote: Vote = {
      id: `vote-${generateId()}`,
      title: body.title,
      description: body.description,
      status: 'upcoming',
      eligibilityType: body.eligibilityType || 'all',
      options: body.options.map((label, index) => ({
        id: `opt-${index + 1}`,
        label,
        votes: 0,
        trustedVotes: 0,
        newMemberVotes: 0,
      })),
      totalVotes: 0,
      totalTrustedVotes: 0,
      totalNewMemberVotes: 0,
      startsAt: body.startsAt,
      endsAt: body.endsAt,
      createdBy: userId,
      creatorName: userName,
      constituencyId: body.constituencyId,
      createdAt: new Date().toISOString(),
    };

    votes.set(newVote.id, updateVoteStatus(newVote));

    res.status(201).json({
      success: true,
      data: newVote,
      message: 'Szavazás sikeresen létrehozva',
    });
  } catch (error) {
    console.error('Error creating vote:', error);
    res.status(500).json({
      success: false,
      error: 'Hiba a szavazás létrehozásakor',
    });
  }
});

/**
 * POST /api/votes/:id/cast
 * Szavazat leadása - jogosultság ellenőrzéssel
 */
router.post('/:id/cast', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body: CastVoteRequest = req.body;
    
    const vote = votes.get(id);
    if (!vote) {
      return res.status(404).json({
        success: false,
        error: 'Szavazás nem található',
      });
    }

    // Státusz ellenőrzés
    const updatedVote = updateVoteStatus(vote);
    if (updatedVote.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: updatedVote.status === 'upcoming' 
          ? 'A szavazás még nem kezdődött el' 
          : 'A szavazás már lezárult',
      });
    }

    // Felhasználó adatai
    const userBadges = body.userBadges || [];
    const userId = req.headers['x-user-id'] as string || 'anonymous';
    const isTrusted = hasTrustedBadge(userBadges);

    // Jogosultság ellenőrzés 'trusted' típusú szavazásnál
    if (vote.eligibilityType === 'trusted' && !isTrusted) {
      return res.status(403).json({
        success: false,
        error: 'Ez a szavazás csak bizalmi jelvénnyel rendelkező tagok számára érhető el',
        requiredTrust: true,
      });
    }

    // Már szavazott-e?
    const userVoteMap = userVotes.get(userId) || new Map<string, string>();
    if (userVoteMap.has(id)) {
      return res.status(400).json({
        success: false,
        error: 'Már leadtad a szavazatodat erre a kérdésre',
        existingVote: userVoteMap.get(id),
      });
    }

    // Opció ellenőrzés
    const optionIndex = vote.options.findIndex(opt => opt.id === body.optionId);
    if (optionIndex === -1) {
      return res.status(400).json({
        success: false,
        error: 'Érvénytelen szavazási opció',
      });
    }

    // Szavazat rögzítése
    vote.options[optionIndex].votes += 1;
    if (isTrusted) {
      vote.options[optionIndex].trustedVotes += 1;
      vote.totalTrustedVotes += 1;
    } else {
      vote.options[optionIndex].newMemberVotes += 1;
      vote.totalNewMemberVotes += 1;
    }
    vote.totalVotes += 1;

    // Felhasználó szavazatának rögzítése
    userVoteMap.set(id, body.optionId);
    userVotes.set(userId, userVoteMap);

    // Mock blockchain transaction hash
    const transactionHash = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;

    res.json({
      success: true,
      data: {
        voteId: id,
        optionId: body.optionId,
        isTrustedVote: isTrusted,
        transactionHash,
      },
      message: 'Szavazat sikeresen rögzítve',
    });
  } catch (error) {
    console.error('Error casting vote:', error);
    res.status(500).json({
      success: false,
      error: 'Hiba a szavazat leadásakor',
    });
  }
});

/**
 * GET /api/votes/:id/results
 * Szavazás eredményei részletes bontással
 */
router.get('/:id/results', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vote = votes.get(id);

    if (!vote) {
      return res.status(404).json({
        success: false,
        error: 'Szavazás nem található',
      });
    }

    // Százalékok számítása
    const optionsWithPercentage = vote.options.map(opt => ({
      ...opt,
      percentage: vote.totalVotes > 0 
        ? Math.round((opt.votes / vote.totalVotes) * 100) 
        : 0,
      trustedPercentage: opt.votes > 0 
        ? Math.round((opt.trustedVotes / opt.votes) * 100) 
        : 0,
      newMemberPercentage: opt.votes > 0 
        ? Math.round((opt.newMemberVotes / opt.votes) * 100) 
        : 0,
    }));

    res.json({
      success: true,
      data: {
        voteId: id,
        title: vote.title,
        status: updateVoteStatus(vote).status,
        eligibilityType: vote.eligibilityType,
        options: optionsWithPercentage,
        summary: {
          totalVotes: vote.totalVotes,
          totalTrustedVotes: vote.totalTrustedVotes,
          totalNewMemberVotes: vote.totalNewMemberVotes,
          trustedPercentage: vote.totalVotes > 0 
            ? Math.round((vote.totalTrustedVotes / vote.totalVotes) * 100) 
            : 0,
          newMemberPercentage: vote.totalVotes > 0 
            ? Math.round((vote.totalNewMemberVotes / vote.totalVotes) * 100) 
            : 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching vote results:', error);
    res.status(500).json({
      success: false,
      error: 'Hiba az eredmények lekérdezésekor',
    });
  }
});

/**
 * GET /api/votes/:id/eligibility
 * Ellenőrzi a felhasználó jogosultságát egy szavazásra
 */
router.get('/:id/eligibility', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vote = votes.get(id);

    if (!vote) {
      return res.status(404).json({
        success: false,
        error: 'Szavazás nem található',
      });
    }

    // Felhasználó badge-ei
    const userBadgesHeader = req.headers['x-user-badges'] as string;
    const userBadges: UserBadge[] = userBadgesHeader 
      ? JSON.parse(userBadgesHeader) 
      : [];

    const isTrusted = hasTrustedBadge(userBadges);
    const canVote = vote.eligibilityType === 'all' || isTrusted;

    res.json({
      success: true,
      data: {
        voteId: id,
        eligibilityType: vote.eligibilityType,
        userIsTrusted: isTrusted,
        canVote,
        reason: !canVote 
          ? 'Bizalmi jelvény szükséges a szavazáshoz (participation, community vagy activity kategória)' 
          : undefined,
        trustedCategories: TRUSTED_BADGE_CATEGORIES,
      },
    });
  } catch (error) {
    console.error('Error checking eligibility:', error);
    res.status(500).json({
      success: false,
      error: 'Hiba a jogosultság ellenőrzésekor',
    });
  }
});

export default router;
