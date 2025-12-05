export interface NationalHoliday {
  id: string;
  name: string;
  date: string; // ISO date
  description: string;
  icon: string;
  region?: 'helyi' | 'megyei' | 'regionalis' | 'orszagos';
}

export interface FamousHungarian {
  id: string;
  name: string;
  category: 'kolto_iro' | 'tudos' | 'sportolo' | 'tortenelmi';
  birthYear: number;
  deathYear?: number;
  description: string;
  achievements: string[];
  imageUrl?: string;
}

export interface EventNotification {
  id: string;
  eventId: string;
  title: string;
  message: string;
  targetAudience: 'helyi' | 'megyei' | 'regionalis' | 'orszagos';
  sentAt: string;
  readCount: number;
  totalRecipients: number;
}

export interface CommunityEvent {
  id: string;
  holidayId: string;
  city: string;
  location: {
    name: string;
    address?: string;
    coordinates: [number, number]; // [lat, lon]
  };
  region: 'helyi' | 'megyei' | 'regionalis' | 'orszagos';
  participationStartDate: string; // ISO date
  participationEndDate: string; // ISO date
  organizer?: string;
  maxParticipants?: number;
}

export interface CommunityParticipant {
  id: string;
  eventId: string;
  coordinates: [number, number]; // [lat, lon]
  joinedTime: string; // ISO timestamp
  activityScore: number; // 0-100
  recognitionType?: 'standard' | 'dedicated' | 'outstanding';
}

export interface CommunityParticipationStats {
  eventId: string;
  totalParticipants: number;
  recognizedCount: number;
  averageActivityScore: number;
  participationRate: number;
}
