/**
 * Enhanced Election Analysis & Voter Demographics
 * Szavazatok, regisztráltak, kor-demográfia, nemzeti ünnep részvétel
 */

export interface VoterDemographics {
  ageGroup: '18-29' | '30-44' | '45-59' | '60-74' | '75+';
  label: string; // "Fiatal", "Dolgozó", "Közép", "Szenior", "Idős"
  population: number;
  registeredVoters: number;
  votingParticipants: number;
  participationRate: number; // szavazatok / regisztráltak %
  activityScore: number; // 0-100, korcsoportra specifikus aktivitás
  color: string; // demográfia vizualizáláshoz
}

export interface NationalHolidayParticipation {
  holidayId: string;
  holidayName: string; // "Nemzeti Ünnep", "Húsvét", stb.
  date: string; // ISO date
  settlementId: string;
  settlementName: string;
  coordinates: [number, number]; // [lon, lat]
  detectedParticipants: number; // GPS-ből szűrt anonimizált
  participationRadius: number; // méter
  recognitionIssued: number; // dicséret/elismerés kapott felhasználók
  ceremonyType: string; // "közösségi", "egyéni", "online"
}

export interface ElectionAnalysis {
  electionId: string;
  electionName: string;
  analysisDate: string;
  
  // Elsőrendű mutatók: szavazatok vs. regisztráltak
  totalRegisteredVoters: number;
  totalParticipants: number;
  nationalParticipationRate: number; // %
  
  // Szavazat eloszlás
  partyResults: Array<{
    partyId: string;
    partyName: string;
    votes: number;
    percentage: number;
    changeFromLastElection?: number; // + / - %
  }>;
  
  // Demográfia análízis
  demographicAnalysis: {
    byAgeGroup: VoterDemographics[];
    ageGroupWithHighestTurnout: string; // ageGroup kulcs
    ageGroupWithLowestTurnout: string;
    averageActivityByAge: number;
  };
  
  // Településszintű elemzés
  settlementData: Array<{
    settlementId: string;
    settlementName: string;
    registeredVoters: number;
    participants: number;
    turnoutRate: number; // %
    dominantParty: string;
    trendFromLastElection: 'up' | 'down' | 'stable';
  }>;
  
  // Nemzeti ünnep aktivitás kapcsolódás
  holidayConnectionData: Array<{
    holidayName: string;
    nearestToPollDate: boolean;
    estimatedImpactOnTurnout: number; // -5 to +15 %
  }>;
}

export interface UserVotingProfile {
  userId: string; // anonimizált
  settlementId: string;
  ageGroup: string;
  registeredSince: string; // ISO date
  votingHistory: Array<{
    electionId: string;
    participated: boolean;
    estimatedLocation?: 'home' | 'workplace' | 'holiday_location';
  }>;
  holidayParticipationEvents: Array<{
    holidayId: string;
    detectedAtLocation: boolean;
    recognitionReceived: boolean;
    recognitionCount: number; // kumulatív
  }>;
  engagementScore: number; // 0-100
  reliabilityScore: number; // anonim adatok konzisztenciája
}
