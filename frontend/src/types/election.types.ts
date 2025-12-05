/**
 * Election Data Type Definitions
 * Local copy for frontend - valasztas.hu 2022 adatokhoz
 */

// ============================================================================
// ALAPVETŐ TÍPUSOK
// ============================================================================

export interface PartyVotingResult {
  partyId: string;
  partyName?: string;
  votes: number;
  percentage: number;
  listVotes?: number;        // Pártlistás szavazatok
  individualVotes?: number;  // Egyéni szavazatok (OEVK)
}

export interface CandidateResult {
  candidateId: string;
  candidateName: string;
  partyId: string;
  partyName: string;
  votes: number;
  percentage: number;
  isWinner: boolean;
}

// ============================================================================
// VÁLASZTÓKÖRZET (OEVK) TÍPUSOK - valasztas.hu 2022
// ============================================================================

export type CountyId = 
  | 'budapest'
  | 'baranya' | 'bacs-kiskun' | 'bekes' | 'borsod-abauj-zemplen'
  | 'csongrad-csanad' | 'fejer' | 'gyor-moson-sopron' | 'hajdu-bihar'
  | 'heves' | 'jasz-nagykun-szolnok' | 'komarom-esztergom' | 'nograd'
  | 'pest' | 'somogy' | 'szabolcs-szatmar-bereg' | 'tolna' | 'vas'
  | 'veszprem' | 'zala';

export const COUNTY_NAMES: Record<CountyId, string> = {
  'budapest': 'Budapest',
  'baranya': 'Baranya',
  'bacs-kiskun': 'Bács-Kiskun',
  'bekes': 'Békés',
  'borsod-abauj-zemplen': 'Borsod-Abaúj-Zemplén',
  'csongrad-csanad': 'Csongrád-Csanád',
  'fejer': 'Fejér',
  'gyor-moson-sopron': 'Győr-Moson-Sopron',
  'hajdu-bihar': 'Hajdú-Bihar',
  'heves': 'Heves',
  'jasz-nagykun-szolnok': 'Jász-Nagykun-Szolnok',
  'komarom-esztergom': 'Komárom-Esztergom',
  'nograd': 'Nógrád',
  'pest': 'Pest',
  'somogy': 'Somogy',
  'szabolcs-szatmar-bereg': 'Szabolcs-Szatmár-Bereg',
  'tolna': 'Tolna',
  'vas': 'Vas',
  'veszprem': 'Veszprém',
  'zala': 'Zala'
};

export interface ConstituencyData {
  constituencyId: string;      // OEVK azonosító: pl. "budapest-01", "pest-05"
  constituencyNumber: number;  // OEVK szám: 1-106
  constituencyName: string;    // Körzet neve: pl. "Budapest 01. sz. OEVK"
  countyId: CountyId;
  countyName: string;
  
  // Választási adatok
  registeredVoters: number;
  totalVoters: number;
  participationRate: number;
  validVotes: number;
  invalidVotes: number;
  
  // Egyéni jelöltek eredményei
  candidateResults: CandidateResult[];
  winnerCandidateId: string;
  winnerPartyId: string;
  marginOfVictory: number;    // Győzelem mértéke %-ban
  isCompetitive: boolean;     // Szoros eredmény (< 5%)
  
  // Települések a körzetben
  settlements: string[];
}

// ============================================================================
// TELEPÜLÉS TÍPUSOK
// ============================================================================

export interface SettlementElectionData {
  settlementId: string;
  settlementName: string;
  countyId?: CountyId;
  constituencyId?: string;
  
  // Alap választási adatok
  registeredVoters: number;
  totalVoters: number;
  participationRate: number;
  validVotes: number;
  invalidVotes: number;
  
  // Párteredmények
  partyResults: PartyVotingResult[];
  
  // Kiegészítő mezők
  electionId?: string;
  electionDate?: string;
  electionType?: string;
  leadVotes?: number;
}

// ============================================================================
// MEGYE/RÉGIÓ TÍPUSOK
// ============================================================================

export interface RegionElectionData {
  regionId: string;
  regionName: string;
  countyId?: CountyId;
  
  // Összesített adatok
  totalRegisteredVoters: number;
  totalVoters: number;
  participationRate: number;
  
  // Aggregált párteredmények
  aggregatedPartyResults?: PartyVotingResult[];
  
  // Választókörzetek a megyében
  constituencies?: ConstituencyData[];
  constituencyCount?: number;
  
  // Települések
  settlementResults: SettlementElectionData[];
}

// ============================================================================
// ORSZÁGOS VÁLASZTÁSI ADATHALMAZ
// ============================================================================

export interface ElectionDataSet {
  electionId: string;
  electionDate: string;
  electionType: 'parliament' | 'local' | 'european';
  electionName: string;
  
  // Országos összesítés
  totalRegisteredVoters: number;
  totalParticipation: number;
  participationRate: number;
  totalValidVotes: number;
  totalInvalidVotes: number;
  
  // Pártlistás eredmények
  nationalPartyResults: PartyVotingResult[];
  
  // Mandátumok
  mandateDistribution?: {
    partyId: string;
    partyName: string;
    listMandates: number;
    individualMandates: number;
    totalMandates: number;
  }[];
  
  // Megyei bontás
  regionResults: RegionElectionData[];
  
  // 106 egyéni választókörzet
  constituencies?: ConstituencyData[];
}

// ============================================================================
// SZŰRŐ TÍPUSOK
// ============================================================================

export type FilterLevel = 'orszagos' | 'megye' | 'varos' | 'valasztokorzet';

export interface ElectionFilter {
  level: FilterLevel;
  electionId: string;
  countyId?: CountyId;
  settlementId?: string;
  constituencyId?: string;
  partyIds?: string[];
  compareToElectionId?: string;  // Összehasonlítás másik választással
}

// ============================================================================
// ELEMZÉSI TÍPUSOK
// ============================================================================

export interface ElectionComparison {
  election1Id: string;
  election2Id: string;
  election1Name: string;
  election2Name: string;
  
  participationChange: number;  // + / - %
  partyChanges: {
    partyId: string;
    partyName: string;
    votes1: number;
    votes2: number;
    percentage1: number;
    percentage2: number;
    change: number;
  }[];
  
  swingConstituencies: {
    constituencyId: string;
    constituencyName: string;
    previousWinner: string;
    currentWinner: string;
  }[];
}

export interface MobilizationPotential {
  settlementId: string;
  settlementName: string;
  constituencyId: string;
  
  currentParticipation: number;
  nationalAverage: number;
  participationGap: number;        // Mennyivel alacsonyabb az átlagnál
  
  platformActivityScore: number;  // A platform tagjainak aktivitása
  correlationScore: number;       // Aktivitás-részvétel korreláció
  
  mobilizationPriority: 'high' | 'medium' | 'low';
}
