import type { City, ActivityDataPoint, MovementType, MovementCategory, Coordinate, EngagementLevel } from '../types/models';
import { MovementType as MT } from '../types/models';

// Mock city data with coordinates
const citiesData = [
  {
    id: 'budapest',
    name: 'Budapest',
    coordinates: [19.04, 47.50] as Coordinate,
    population: 1685342,
    region: 'Central Hungary',
    type: 'capital'
  },
  {
    id: 'debrecen',
    name: 'Debrecen',
    coordinates: [21.63, 47.53] as Coordinate,
    population: 199858,
    region: 'Northern Great Plain',
    type: 'major_city'
  },
  {
    id: 'szeged',
    name: 'Szeged',
    coordinates: [20.15, 46.25] as Coordinate,
    population: 158797,
    region: 'Southern Great Plain',
    type: 'major_city'
  },
  {
    id: 'pecs',
    name: 'Pécs',
    coordinates: [18.23, 46.07] as Coordinate,
    population: 139330,
    region: 'Southern Transdanubia',
    type: 'major_city'
  },
  {
    id: 'miskolc',
    name: 'Miskolc',
    coordinates: [20.79, 48.10] as Coordinate,
    population: 147533,
    region: 'Northern Hungary',
    type: 'major_city'
  },
  {
    id: 'gyor',
    name: 'Győr',
    coordinates: [17.64, 47.69] as Coordinate,
    population: 127599,
    region: 'Western Transdanubia',
    type: 'major_city'
  }
];

// Engagement level distribution
const getEngagementLevel = (participationRate: number): EngagementLevel => {
  if (participationRate >= 75) return 'very_high';
  if (participationRate >= 50) return 'high';
  if (participationRate >= 25) return 'medium';
  return 'low';
};

// Generate activity data for a city for past 14 days
export function generateActivityTrend(cityId: string, days: number = 14): ActivityDataPoint[] {
  const data: ActivityDataPoint[] = [];
  const today = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Vary activity by city - Budapest has more activity
    const baseMultiplier = cityId === 'budapest' ? 1.5 : 1.0;

    const eventCount = Math.floor((Math.random() * 10 + 5) * baseMultiplier);
    const activeParticipants = Math.floor((Math.random() * 300 + 100) * baseMultiplier);

    const movementCategories: Record<MovementType, number> = {
      [MT.ARTS_CULTURE]: Math.floor(Math.random() * 5 + 1),
      [MT.CIVIC_ENGAGEMENT]: Math.floor(Math.random() * 4 + 1),
      [MT.EDUCATIONAL]: Math.floor(Math.random() * 6 + 2),
      [MT.WELLNESS]: Math.floor(Math.random() * 4 + 1),
      [MT.ENVIRONMENTAL]: Math.floor(Math.random() * 3 + 1)
    };

    data.push({
      date: dateStr,
      eventCount,
      activeParticipants,
      movementCategories
    });
  }

  return data;
}

// Generate mock city data
export function generateMockCities(): City[] {
  return citiesData.map((cityBase) => {
    const participationRate = Math.floor(Math.random() * 60 + 20); // 20-80%
    const eventCount = Math.floor(Math.random() * 50 + 10);
    const activityTrend = generateActivityTrend(cityBase.id);

    return {
      id: cityBase.id,
      name: cityBase.name,
      coordinates: cityBase.coordinates,
      population: cityBase.population,
      region: cityBase.region,
      eventCount,
      participationRate,
      engagementLevel: getEngagementLevel(participationRate),
      activityTrend
    };
  });
}

// Get movement categories
export function getMovementCategories(): MovementCategory[] {
  return [
    {
      id: MT.ARTS_CULTURE,
      name: 'Művészet & Kultúra',
      color: '#FF6B6B',
      description: 'Színház, zene, képzőművészeti események'
    },
    {
      id: MT.CIVIC_ENGAGEMENT,
      name: 'Közösségi Részvétel',
      color: '#4ECDC4',
      description: 'Közösségszervezés, önkéntesség'
    },
    {
      id: MT.EDUCATIONAL,
      name: 'Oktatás',
      color: '#45B7D1',
      description: 'Workshopok, szemináriumok, tanulási aktivitások'
    },
    {
      id: MT.WELLNESS,
      name: 'Wellness',
      color: '#96CEB4',
      description: 'Sport, egészség, meditációs tevékenységek'
    },
    {
      id: MT.ENVIRONMENTAL,
      name: 'Környezetvédelem',
      color: '#FFEAA7',
      description: 'Zöld kezdeményezések, fenntarthatóság'
    }
  ];
}

// Get all cities data
export const allCities = generateMockCities();
export const movementCategories = getMovementCategories();
