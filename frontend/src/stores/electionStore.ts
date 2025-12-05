/**
 * Election Data Store
 * Svelte stores for managing election voting data state
 * Bővített verzió: OEVK, megye, település szűrés támogatással
 */

import { writable, derived, readable } from 'svelte/store';
import type {
  SettlementElectionData,
  PartyVotingResult,
  ElectionDataSet,
  ConstituencyData,
  CountyId,
  FilterLevel,
  ElectionFilter
} from '../types/election.types';

// ============================================================================
// WRITABLE STORES
// ============================================================================

/**
 * Selected election ID
 */
export const selectedElection = writable<string>('2022-parliament');

/**
 * Selected party for highlighting/filtering
 */
export const selectedParty = writable<string>('fidesz-kdnp');

/**
 * All settlement election data (election ID → Map of settlement data)
 */
export const allElectionData = writable<Map<string, Map<string, SettlementElectionData>>>(
  new Map()
);

/**
 * All available elections metadata
 */
export const availableElections = writable<
  Array<{
    id: string;
    name: string;
    date: string;
    type: string;
    totalVoters: number;
    participationRate: string;
  }>
>([]);

/**
 * API base URL for election endpoints
 */
export const apiBaseUrl = readable<string>('/api');

// ============================================================================
// SZŰRŐ STORES - ÚJ
// ============================================================================

/**
 * Aktív szűrési szint
 */
export const filterLevel = writable<FilterLevel>('orszagos');

/**
 * Kiválasztott megye
 */
export const selectedCounty = writable<CountyId | ''>('');

/**
 * Kiválasztott település
 */
export const selectedSettlement = writable<string>('');

/**
 * Kiválasztott választókörzet (OEVK)
 */
export const selectedConstituency = writable<string>('');

/**
 * Összehasonlítandó választás
 */
export const compareElectionId = writable<string>('');

/**
 * Választókörzetek adatai (OEVK)
 */
export const constituenciesData = writable<ConstituencyData[]>([]);

/**
 * Teljes választási adathalmaz (JSON)
 */
export const fullElectionData = writable<ElectionDataSet | null>(null);

// ============================================================================
// DERIVED STORES
// ============================================================================

/**
 * Election data for currently selected election
 */
export const currentElectionData = derived(
  [allElectionData, selectedElection],
  ([$allElectionData, $selectedElection]) => {
    return $allElectionData.get($selectedElection) || new Map();
  }
);

/**
 * Get voting data for a specific settlement
 */
export const settlementVotingData = derived(
  [currentElectionData],
  ([$currentElectionData]) => {
    return (settlementId: string): SettlementElectionData | undefined => {
      return $currentElectionData.get(settlementId);
    };
  }
);

/**
 * Get party voting data for a specific settlement
 */
export const settlementPartyVotes = derived(
  [settlementVotingData, selectedParty],
  ([$settlementVotingData, $selectedParty]) => {
    return (settlementId: string): PartyVotingResult | undefined => {
      const settlement = $settlementVotingData(settlementId);
      if (!settlement) return undefined;

      return settlement.partyResults.find((p: PartyVotingResult) => p.partyId === $selectedParty);
    };
  }
);

/**
 * Top 10 settlements for selected party by vote count
 */
export const topSettlementsForParty = derived(
  [currentElectionData, selectedParty],
  ([$currentElectionData, $selectedParty]) => {
    const results: Array<{
      rank: number;
      settlementId: string;
      settlementName: string;
      votes: number;
      percentage: number;
    }> = [];

    for (const settlement of $currentElectionData.values()) {
      const partyResult = settlement.partyResults.find((p: PartyVotingResult) => p.partyId === $selectedParty);

      if (partyResult && partyResult.votes > 0) {
        results.push({
          rank: 0,
          settlementId: settlement.settlementId,
          settlementName: settlement.settlementName,
          votes: partyResult.votes,
          percentage: partyResult.percentage
        });
      }
    }

    // Sort by votes descending
    results.sort((a, b) => b.votes - a.votes);

    // Assign ranks
    results.forEach((r, idx) => {
      r.rank = idx + 1;
    });

    return results.slice(0, 10);
  }
);

/**
 * Party color mapping - bővített 2022-es választásokhoz
 */
export const partyColors = readable<{ [key: string]: string }>({
  'fidesz-kdnp': '#FF6600',
  'ellenzek': '#0066CC',
  'mi-hazank': '#006600',
  'mkkp': '#999999',
  'jobbik': '#00CC00',
  'dk': '#FF6600',
  'mszp-parbeszed': '#FF0066',
  'lmp': '#66FF00',
  'momentum': '#9933FF'
});

/**
 * Party names mapping - bővített 2022-es választásokhoz
 */
export const partyNames = readable<{ [key: string]: string }>({
  'fidesz-kdnp': 'FIDESZ-KDNP',
  'ellenzek': 'Egységben Magyarországért',
  'mi-hazank': 'Mi Hazánk Mozgalom',
  'mkkp': 'Magyar Kétfarkú Kutya Párt',
  'jobbik': 'Jobbik',
  'dk': 'Demokratikus Koalíció',
  'mszp-parbeszed': 'MSZP-Párbeszéd',
  'lmp': 'LMP',
  'momentum': 'Momentum'
});

/**
 * Color code for settlement based on party vote percentage
 */
export const settlementColorByParty = derived(
  [settlementPartyVotes, selectedParty],
  ([$settlementPartyVotes]) => {
    return (settlementId: string): string => {
      const partyVotes = $settlementPartyVotes(settlementId);

      if (!partyVotes) {
        return '#E0E0E0'; // Gray - no data
      }

      const percentage = partyVotes.percentage;

      // Color scale for Mi Hazánk (typically 0-15%)
      if (percentage >= 15) return '#8B0000'; // Dark red - very strong
      if (percentage >= 12) return '#CC0000'; // Strong red
      if (percentage >= 9) return '#FF3333'; // Medium red
      if (percentage >= 6) return '#FF6666'; // Light red
      if (percentage >= 3) return '#FFAAAA'; // Very light red
      if (percentage > 0) return '#FFE5E5'; // Extremely light red
      return '#E0E0E0'; // Gray - no votes
    };
  }
);

/**
 * Total votes for selected party across all settlements
 */
export const totalPartyVotes = derived(
  [currentElectionData, selectedParty],
  ([$currentElectionData, $selectedParty]) => {
    let total = 0;

    for (const settlement of $currentElectionData.values()) {
      const partyResult = settlement.partyResults.find((p: PartyVotingResult) => p.partyId === $selectedParty);
      if (partyResult) {
        total += partyResult.votes;
      }
    }

    return total;
  }
);

/**
 * Average party vote percentage across all settlements
 */
export const averagePartyPercentage = derived(
  [currentElectionData, selectedParty],
  ([$currentElectionData, $selectedParty]) => {
    if ($currentElectionData.size === 0) return 0;

    let sum = 0;

    for (const settlement of $currentElectionData.values()) {
      const partyResult = settlement.partyResults.find((p: PartyVotingResult) => p.partyId === $selectedParty);
      if (partyResult) {
        sum += partyResult.percentage;
      }
    }

    return sum / $currentElectionData.size;
  }
);

/**
 * Settlement with highest party vote percentage
 */
export const strongestSettlementForParty = derived(
  [currentElectionData, selectedParty],
  ([$currentElectionData, $selectedParty]) => {
    let strongest: SettlementElectionData | undefined;
    let maxPercentage = 0;

    for (const settlement of $currentElectionData.values()) {
      const partyResult = settlement.partyResults.find((p: PartyVotingResult) => p.partyId === $selectedParty);
      if (partyResult && partyResult.percentage > maxPercentage) {
        maxPercentage = partyResult.percentage;
        strongest = settlement;
      }
    }

    return strongest;
  }
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Load election data from API
 */
export async function loadElectionData(electionId: string): Promise<void> {
  try {
    const response = await fetch(`/api/elections/${electionId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch election data: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      throw new Error('Invalid election data response');
    }

    const electionData: ElectionDataSet = result.data;

    // Convert region results to flat settlement map
    const settlementMap = new Map<string, SettlementElectionData>();

    for (const region of electionData.regionResults) {
      for (const settlement of region.settlementResults) {
        settlementMap.set(settlement.settlementId, settlement);
      }
    }

    // Update store
    allElectionData.update(data => {
      const newData = new Map(data);
      newData.set(electionId, settlementMap);
      return newData;
    });

    console.log(`Loaded election data: ${electionId} (${settlementMap.size} settlements)`);
  } catch (error) {
    console.error('Error loading election data:', error);
    throw error;
  }
}

/**
 * Load list of available elections
 */
export async function loadAvailableElections(): Promise<void> {
  try {
    const response = await fetch('/api/elections');

    if (!response.ok) {
      throw new Error(`Failed to fetch elections: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      throw new Error('Invalid elections response');
    }

    availableElections.set(result.data);
    console.log(`Loaded ${result.data.length} available elections`);
  } catch (error) {
    console.error('Error loading available elections:', error);
    throw error;
  }
}

/**
 * Get top settlements for a specific party
 */
export async function fetchTopSettlementsForParty(
  electionId: string,
  partyId: string,
  limit: number = 20
): Promise<Array<{ rank: number; settlementName: string; votes: number; percentage: number }>> {
  try {
    const response = await fetch(
      `/api/elections/${electionId}/by-party/${partyId}?limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch party settlements: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      throw new Error('Invalid party data response');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching party settlements:', error);
    throw error;
  }
}

/**
 * Get settlement voting data for specific election
 */
export async function fetchSettlementData(
  electionId: string,
  settlementId: string
): Promise<SettlementElectionData | null> {
  try {
    const response = await fetch(
      `/api/elections/${electionId}/settlements/${settlementId}`
    );

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch settlement data: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      throw new Error('Invalid settlement data response');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching settlement data:', error);
    throw error;
  }
}

// ============================================================================
// ÚJ HELPER FUNKCIÓK - 2022 VÁLASZTÁSI ELEMZÉS
// ============================================================================

/**
 * Teljes választási adatok betöltése (OEVK-kal együtt)
 */
export async function loadFullElectionData(electionId: string = '2022-parliament-full'): Promise<ElectionDataSet | null> {
  try {
    const response = await fetch(`/api/elections/${electionId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch full election data: ${response.statusText}`);
    }

    const result = await response.json();
    const data = result.data || result;
    
    fullElectionData.set(data);
    
    if (data.constituencies) {
      constituenciesData.set(data.constituencies);
    }
    
    return data;
  } catch (error) {
    console.error('Error loading full election data:', error);
    return null;
  }
}

/**
 * Szűrők alaphelyzetbe állítása
 */
export function resetFilters(): void {
  filterLevel.set('orszagos');
  selectedCounty.set('');
  selectedSettlement.set('');
  selectedConstituency.set('');
  compareElectionId.set('');
}

/**
 * Szoros körzetek lekérdezése (< 5% különbség)
 */
export const competitiveConstituencies = derived(
  [constituenciesData],
  ([$constituenciesData]) => {
    return $constituenciesData.filter(c => c.isCompetitive);
  }
);

/**
 * Körzetszám szerinti rendezés
 */
export const sortedConstituencies = derived(
  [constituenciesData],
  ([$constituenciesData]) => {
    return [...$constituenciesData].sort((a, b) => a.constituencyNumber - b.constituencyNumber);
  }
);

/**
 * Megye szerinti szűrt körzetek
 */
export const constituenciesByCounty = derived(
  [constituenciesData, selectedCounty],
  ([$constituenciesData, $selectedCounty]) => {
    if (!$selectedCounty) return $constituenciesData;
    return $constituenciesData.filter(c => c.countyId === $selectedCounty);
  }
);

/**
 * Országos részvételi arány számítása
 */
export const nationalParticipationRate = derived(
  [fullElectionData],
  ([$fullElectionData]) => {
    if (!$fullElectionData) return 0;
    return $fullElectionData.participationRate || 0;
  }
);

/**
 * Mandátum összesítés
 */
export const mandateSummary = derived(
  [fullElectionData],
  ([$fullElectionData]) => {
    if (!$fullElectionData?.mandateDistribution) return [];
    return $fullElectionData.mandateDistribution;
  }
);
