// Geospatial types
export type Coordinate = [longitude: number, latitude: number];

export interface GeoJsonFeature {
  type: 'Feature';
  geometry: {
    type: 'Point' | 'Polygon' | 'LineString';
    coordinates: Coordinate | Coordinate[] | Coordinate[][];
  };
  properties: Record<string, any>;
}

// Movement types for cultural activities
export enum MovementType {
  ARTS_CULTURE = 'arts_culture',
  CIVIC_ENGAGEMENT = 'civic_engagement',
  EDUCATIONAL = 'educational',
  WELLNESS = 'wellness',
  ENVIRONMENTAL = 'environmental'
}

// Activity engagement level
export type EngagementLevel = 'low' | 'medium' | 'high' | 'very_high';

// City & Activity interfaces
export interface City {
  id: string;
  name: string;
  coordinates: Coordinate;
  population: number;
  region: string;
  eventCount: number;
  participationRate: number; // 0-100
  engagementLevel: EngagementLevel;
  activityTrend: ActivityDataPoint[];
}

export interface ActivityDataPoint {
  date: string; // ISO date YYYY-MM-DD
  eventCount: number;
  activeParticipants: number;
  movementCategories: Record<MovementType, number>;
}

export interface MovementCategory {
  id: MovementType;
  name: string;
  color: string;
  description: string;
}

// Chart data interface
export interface ChartDataSeries {
  name: string;
  data: number[];
  type: 'line' | 'bar';
  color?: string;
}

export interface ChartData {
  dates: string[];
  series: ChartDataSeries[];
}
