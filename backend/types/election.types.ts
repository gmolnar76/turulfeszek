/**
 * Election Data Type Definitions
 * Definitions for Hungarian election voting data, parties, and settlements
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Hungarian Political Party Identifiers
 */
export enum PartyId {
  FIDESZ = 'fidesz-kdnp',
  MI_HAZANK = 'mi-hazank',
  JOBBIK = 'jobbik',
  DK = 'dk',
  MSZP_PARBESZED = 'mszp-parbeszed',
  LMP = 'lmp',
  MOMENTUM = 'momentum',
  INDEPENDENT = 'independent',
  OTHER = 'other'
}

/**
 * Types of elections
 */
export enum ElectionType {
  PARLIAMENT = 'parliament',
  LOCAL = 'local',
  EUROPEAN = 'european'
}

/**
 * Settlement administrative types
 */
export enum SettlementType {
  CAPITAL = 'capital',
  COUNTY_SEAT = 'county-seat',
  CITY = 'city',
  TOWN = 'town',
  VILLAGE = 'village',
  DISTRICT = 'district' // Budapest districts
}

/**
 * Hungarian regions (counties/provinces)
 */
export type RegionId =
  | 'budapest'
  | 'baranya'
  | 'bacs-kiskun'
  | 'bekes'
  | 'borsod-abauj-zemplen'
  | 'csongrad-csanad'
  | 'fejer'
  | 'gyor-moson-sopron'
  | 'hajdu-bihar'
  | 'heves'
  | 'jasz-nagykun-szolnok'
  | 'komarom-esztergom'
  | 'nograd'
  | 'pest'
  | 'somogy'
  | 'szabolcs-szatmar-bereg'
  | 'tolna'
  | 'vas'
  | 'veszprem'
  | 'zala';

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Political party metadata
 */
export interface Party {
  id: PartyId | string;
  name: string;
  fullName: string;
  color: string; // Hex color code
  established: number;
  leaderName: string;
  ideology: string;
}

/**
 * A settlement/municipality in Hungary
 */
export interface Settlement {
  id: string;
  name: string;
  nameWithRegion?: string; // e.g., "Budapest - I. kerület"
  type: SettlementType;
  regionId: RegionId;
  coordinates: [number, number]; // [longitude, latitude]
  population: number;
  eligibleVoters: number;
  parentSettlementId?: string; // For districts: parent city ID
  note?: string;
}

/**
 * Voting results for a single party in a settlement
 */
export interface PartyVotingResult {
  partyId: PartyId | string;
  partyName: string;
  votes: number;
  percentage: number; // 0-100
}

/**
 * Complete voting data for a settlement in one election
 */
export interface SettlementElectionData {
  settlementId: string;
  settlementName: string;
  electionId: string;
  electionDate: string; // "YYYY-MM-DD"
  electionType: ElectionType;

  registeredVoters: number; // szavazásra jogosultak
  totalVoters: number; // megjelent szavazók
  participationRate: number; // 0-100

  leadVotes: number; // leadott szavazatok
  validVotes: number; // érvényes szavazatok
  invalidVotes: number; // érvénytelen szavazatok

  partyResults: PartyVotingResult[];
}

/**
 * Aggregated election data for a region
 */
export interface RegionElectionData {
  regionId: RegionId;
  regionName: string;
  electionId: string;

  totalRegisteredVoters: number;
  totalVoters: number;
  participationRate: number;

  aggregatedPartyResults: PartyVotingResult[];
  settlementResults: SettlementElectionData[];
}

/**
 * Complete election dataset for a specific election
 */
export interface ElectionDataSet {
  electionId: string; // "2022-parliament"
  electionDate: string; // "YYYY-MM-DD"
  electionType: ElectionType;
  electionName: string; // "2022. április 3. - Országgyűlési választások"

  totalRegisteredVoters: number;
  totalParticipation: number; // total voters
  participationRate: number; // 0-100

  regionResults: RegionElectionData[];
  nationalPartyResults: PartyVotingResult[];
}

/**
 * Query parameters for election data searches
 */
export interface ElectionQuery {
  settlementId?: string;
  regionId?: RegionId;
  electionId?: string;
  partyId?: PartyId | string;
  minParticipationRate?: number;
  maxParticipationRate?: number;
  limit?: number;
  offset?: number;
}

/**
 * Election result with ranking
 */
export interface ElectionResult extends SettlementElectionData {
  rank?: number;
  trend?: {
    previousElection: PartyVotingResult;
    change: number; // vote count change
    percentageChange: number; // percentage point change
  };
}

/**
 * Response format for API endpoints
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    count: number;
    limit?: number;
    offset?: number;
    total?: number;
  };
}

/**
 * Settlement with all election data across multiple years
 */
export interface SettlementWithElections extends Settlement {
  elections: Map<string, SettlementElectionData>;
  activityLevel?: 'low' | 'medium' | 'high';
  culturalMovements?: Array<{
    name: string;
    count: number;
  }>;
}

// ============================================================================
// RAW DATA IMPORT TYPES
// ============================================================================

/**
 * Raw row from CSV/Excel election data import
 */
export interface RawElectionRow {
  settlementId: string;
  settlementName: string;
  registeredVoters: number;
  totalVoters: number;
  validVotes: number;
  [partyId: string]: number | string; // fidesz-kdnp, mi-hazank, etc.
}

/**
 * State for in-progress data import
 */
export interface ElectionImportState {
  file: string;
  electionId: string;
  processedRows: number;
  errorRows: number;
  errors: Array<{
    row: number;
    settlement: string;
    error: string;
  }>;
}
