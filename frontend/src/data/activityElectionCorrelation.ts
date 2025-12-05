/**
 * Aktivitás-Választás Korreláció Adatok
 * Platform tagsági aktivitás és választási részvétel kapcsolata
 */

import { ACTIVITY_CITIES } from './activityMockData';
import type { CountyId } from '../types/election.types';

// ============================================================================
// TÍPUSOK
// ============================================================================

export interface ActivityElectionCorrelation {
  settlementId: string;
  settlementName: string;
  countyId: CountyId;
  constituencyId?: string;
  
  // Platform aktivitási metrikák
  platformMembers: number;
  activeMembers: number;          // Legalább 1 eseményen részt vett
  activityScore: number;          // 0-100
  
  // Aktivitás típusonként
  activityBreakdown: {
    nationalHolidays: number;     // Nemzeti ünnep résztvevők
    camps: number;                // Pajtás tábor résztvevők
    readingCircles: number;       // Olvasókör résztvevők
    lectures: number;             // Előadás résztvevők
    facultations: number;         // Fakultáció résztvevők
  };
  
  // Választási metrikák (2022)
  registeredVoters: number;
  actualVoters: number;
  participationRate: number;
  
  // Korreláció
  platformVsPopulationRatio: number;  // Platform tagok / lakosság %
  activityVsParticipation: number;    // Korreláció score (-1 to 1)
  
  // Mobilizációs potenciál
  mobilizationPotential: 'high' | 'medium' | 'low';
  mobilizationPriority: number;       // 1-10 prioritás
}

export interface MobilizationInsight {
  type: 'opportunity' | 'success' | 'attention';
  settlementId: string;
  settlementName: string;
  message: string;
  metric: number;
  recommendation: string;
}

// ============================================================================
// MOCK ADAT GENERÁLÁS
// ============================================================================

const COUNTY_MAPPING: Record<string, CountyId> = {
  'budapest': 'budapest',
  'debrecen': 'hajdu-bihar',
  'szeged': 'csongrad-csanad',
  'miskolc': 'borsod-abauj-zemplen',
  'pecs': 'baranya',
  'gyor': 'gyor-moson-sopron',
  'nyiregyhaza': 'szabolcs-szatmar-bereg',
  'kecskemet': 'bacs-kiskun',
  'szekesfehervar': 'fejer',
  'szombathely': 'vas'
};

const CONSTITUENCY_MAPPING: Record<string, string> = {
  'budapest': 'budapest-01',
  'debrecen': 'hajdu-bihar-01',
  'szeged': 'csongrad-csanad-01',
  'miskolc': 'borsod-abauj-zemplen-01',
  'pecs': 'baranya-01',
  'gyor': 'gyor-moson-sopron-01',
  'nyiregyhaza': 'szabolcs-szatmar-bereg-01',
  'kecskemet': 'bacs-kiskun-01',
  'szekesfehervar': 'fejer-01',
  'szombathely': 'vas-01'
};

// Valós 2022-es részvételi adatok (közelítő)
const PARTICIPATION_DATA_2022: Record<string, { registered: number; voters: number; rate: number }> = {
  'budapest': { registered: 1412567, voters: 984234, rate: 69.68 },
  'debrecen': { registered: 162345, voters: 102234, rate: 62.97 },
  'szeged': { registered: 128345, voters: 89234, rate: 69.53 },
  'miskolc': { registered: 126345, voters: 78234, rate: 61.92 },
  'pecs': { registered: 115234, voters: 78234, rate: 67.89 },
  'gyor': { registered: 99234, voters: 68234, rate: 68.76 },
  'nyiregyhaza': { registered: 89234, voters: 52234, rate: 58.54 },
  'kecskemet': { registered: 85234, voters: 56234, rate: 65.98 },
  'szekesfehervar': { registered: 78234, voters: 53234, rate: 68.05 },
  'szombathely': { registered: 62345, voters: 43234, rate: 69.34 }
};

export function generateActivityElectionCorrelations(): ActivityElectionCorrelation[] {
  return ACTIVITY_CITIES.map(city => {
    const electionData = PARTICIPATION_DATA_2022[city.id] || {
      registered: 50000,
      voters: 32000,
      rate: 64.0
    };
    
    // Platform tagok száma (szimulált - a nagyobb városokban több tag)
    const platformMembers = Math.floor(electionData.registered * (0.001 + Math.random() * 0.004));
    const activeMembers = Math.floor(platformMembers * (0.4 + Math.random() * 0.4));
    
    // Aktivitási pontszám
    const activityScore = Math.floor(30 + Math.random() * 60);
    
    // Aktivitás típusonként
    const activityBreakdown = {
      nationalHolidays: Math.floor(activeMembers * (0.5 + Math.random() * 0.4)),
      camps: Math.floor(activeMembers * (0.1 + Math.random() * 0.15)),
      readingCircles: Math.floor(activeMembers * (0.15 + Math.random() * 0.2)),
      lectures: Math.floor(activeMembers * (0.2 + Math.random() * 0.25)),
      facultations: Math.floor(activeMembers * (0.08 + Math.random() * 0.12))
    };
    
    // Platform tagok / lakosság arány
    const platformVsPopulationRatio = (platformMembers / electionData.registered) * 100;
    
    // Szimulált korreláció: magas aktivitás → kissé magasabb részvétel
    // De ez nem lineáris, sok más faktor is befolyásolja
    const baseCorrelation = 0.2 + Math.random() * 0.5;
    const activityVsParticipation = activityScore > 60 ? baseCorrelation : baseCorrelation * 0.7;
    
    // Mobilizációs potenciál meghatározása
    let mobilizationPotential: 'high' | 'medium' | 'low';
    let mobilizationPriority: number;
    
    if (activityScore > 50 && electionData.rate < 65) {
      // Magas aktivitás, de alacsony részvétel → nagy potenciál
      mobilizationPotential = 'high';
      mobilizationPriority = 9 - Math.floor((electionData.rate - 55) / 2);
    } else if (activityScore > 40 && electionData.rate < 68) {
      mobilizationPotential = 'medium';
      mobilizationPriority = 5 + Math.floor(Math.random() * 3);
    } else {
      mobilizationPotential = 'low';
      mobilizationPriority = Math.floor(1 + Math.random() * 4);
    }
    
    return {
      settlementId: city.id,
      settlementName: city.name,
      countyId: COUNTY_MAPPING[city.id],
      constituencyId: CONSTITUENCY_MAPPING[city.id],
      platformMembers,
      activeMembers,
      activityScore,
      activityBreakdown,
      registeredVoters: electionData.registered,
      actualVoters: electionData.voters,
      participationRate: electionData.rate,
      platformVsPopulationRatio,
      activityVsParticipation,
      mobilizationPotential,
      mobilizationPriority
    };
  });
}

// ============================================================================
// INSIGHT GENERÁLÁS
// ============================================================================

export function generateMobilizationInsights(
  correlations: ActivityElectionCorrelation[]
): MobilizationInsight[] {
  const insights: MobilizationInsight[] = [];
  
  // Magas potenciálú területek
  const highPotential = correlations.filter(c => c.mobilizationPotential === 'high');
  highPotential.forEach(c => {
    insights.push({
      type: 'opportunity',
      settlementId: c.settlementId,
      settlementName: c.settlementName,
      message: `Magas aktivitás (${c.activityScore}/100), de ${c.participationRate.toFixed(1)}% részvétel`,
      metric: c.mobilizationPriority,
      recommendation: 'Fókuszált közösségi események szervezése választás előtt'
    });
  });
  
  // Sikeres területek (magas aktivitás + magas részvétel)
  const successful = correlations.filter(
    c => c.activityScore > 55 && c.participationRate > 68
  );
  successful.forEach(c => {
    insights.push({
      type: 'success',
      settlementId: c.settlementId,
      settlementName: c.settlementName,
      message: `Sikeres együttműködés: ${c.activityScore}/100 aktivitás, ${c.participationRate.toFixed(1)}% részvétel`,
      metric: c.activityVsParticipation,
      recommendation: 'Best practice megosztása más területekkel'
    });
  });
  
  // Figyelmet igénylő területek (alacsony aktivitás)
  const needsAttention = correlations.filter(
    c => c.activityScore < 40 && c.participationRate < 65
  );
  needsAttention.forEach(c => {
    insights.push({
      type: 'attention',
      settlementId: c.settlementId,
      settlementName: c.settlementName,
      message: `Alacsony aktivitás (${c.activityScore}/100) és részvétel (${c.participationRate.toFixed(1)}%)`,
      metric: 10 - c.mobilizationPriority,
      recommendation: 'Közösségépítő programok indítása, helyi vezetők bevonása'
    });
  });
  
  return insights.sort((a, b) => b.metric - a.metric);
}

// ============================================================================
// ÖSSZESÍTETT STATISZTIKÁK
// ============================================================================

export interface ActivityElectionSummary {
  totalPlatformMembers: number;
  totalActiveMembers: number;
  averageActivityScore: number;
  averageParticipationRate: number;
  correlationStrength: number;
  highPotentialAreas: number;
  
  activityTypeEffectiveness: {
    type: string;
    participants: number;
    estimatedImpact: number;  // Becsült hatás a részvételre
  }[];
}

export function calculateActivityElectionSummary(
  correlations: ActivityElectionCorrelation[]
): ActivityElectionSummary {
  const totalPlatformMembers = correlations.reduce((sum, c) => sum + c.platformMembers, 0);
  const totalActiveMembers = correlations.reduce((sum, c) => sum + c.activeMembers, 0);
  const averageActivityScore = correlations.reduce((sum, c) => sum + c.activityScore, 0) / correlations.length;
  const averageParticipationRate = correlations.reduce((sum, c) => sum + c.participationRate, 0) / correlations.length;
  const correlationStrength = correlations.reduce((sum, c) => sum + c.activityVsParticipation, 0) / correlations.length;
  const highPotentialAreas = correlations.filter(c => c.mobilizationPotential === 'high').length;
  
  // Aktivitás típusok hatékonysága
  const activityTypeEffectiveness = [
    {
      type: 'Nemzeti ünnepek',
      participants: correlations.reduce((sum, c) => sum + c.activityBreakdown.nationalHolidays, 0),
      estimatedImpact: 2.5  // +2.5% részvétel növekedés becsülve
    },
    {
      type: 'Pajtás táborok',
      participants: correlations.reduce((sum, c) => sum + c.activityBreakdown.camps, 0),
      estimatedImpact: 1.8  // Fiatal szavazók mobilizációja
    },
    {
      type: 'Olvasókörök',
      participants: correlations.reduce((sum, c) => sum + c.activityBreakdown.readingCircles, 0),
      estimatedImpact: 1.2
    },
    {
      type: 'Előadások',
      participants: correlations.reduce((sum, c) => sum + c.activityBreakdown.lectures, 0),
      estimatedImpact: 1.5
    },
    {
      type: 'Fakultációk',
      participants: correlations.reduce((sum, c) => sum + c.activityBreakdown.facultations, 0),
      estimatedImpact: 2.0  // Hosszútávú elköteleződés
    }
  ];
  
  return {
    totalPlatformMembers,
    totalActiveMembers,
    averageActivityScore,
    averageParticipationRate,
    correlationStrength,
    highPotentialAreas,
    activityTypeEffectiveness
  };
}

// ============================================================================
// EXPORT - Előgenerált adatok
// ============================================================================

export const activityElectionCorrelations = generateActivityElectionCorrelations();
export const mobilizationInsights = generateMobilizationInsights(activityElectionCorrelations);
export const activityElectionSummary = calculateActivityElectionSummary(activityElectionCorrelations);
