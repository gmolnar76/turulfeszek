// Activity Types - 5 kategória az aktivitás követéshez

export type ActivityCategory = 'unnep' | 'pajtas_tabor' | 'olvasokor' | 'eloadasok' | 'fakultacio';

export interface ActivityCategoryInfo {
  id: ActivityCategory;
  name: string;
  emoji: string;
  description: string;
}

export const ACTIVITY_CATEGORIES: ActivityCategoryInfo[] = [
  { id: 'unnep', name: 'Ünnep', emoji: '🇭🇺', description: 'Nemzeti ünnepek és megemlékezések' },
  { id: 'pajtas_tabor', name: 'Pajtás tábor', emoji: '⛺', description: 'Gyermektáborok és ifjúsági programok' },
  { id: 'olvasokor', name: 'Olvasókör', emoji: '📚', description: 'Irodalmi körök és könyvolvasás' },
  { id: 'eloadasok', name: 'Előadások', emoji: '🎬', description: 'Videó előadások és online tartalmak' },
  { id: 'fakultacio', name: 'Fakultáció', emoji: '🎓', description: 'Önképzőkörök és szakkörök' }
];

// === PAJTÁS TÁBOR ===
export type AgeGroup = '6-10' | '10-14' | '14-18';

export interface PajtasTaborEvent {
  id: string;
  name: string;
  city: string;
  cityId: string;
  year: number;
  season: 'tavasz' | 'nyár' | 'ősz';
  ageGroup: AgeGroup;
  enrolledChildren: number;
  maxCapacity: number;
  activities: string[];
}

export interface PajtasTaborYearlyData {
  year: number;
  totalCamps: number;
  totalEnrolled: number;
  byAgeGroup: {
    '6-10': number;
    '10-14': number;
    '14-18': number;
  };
}

// === OLVASÓKÖR ===
export interface Book {
  id: string;
  title: string;
  author: string;
  genre: 'történelem' | 'szépirodalom' | 'filozófia' | 'ifjúsági' | 'népmese';
  pages: number;
  recommended: boolean;
}

export interface OlvasokorSession {
  id: string;
  bookId: string;
  city: string;
  cityId: string;
  date: string;
  participants: number;
  discussionTopics: string[];
}

export interface OlvasokorYearlyData {
  year: number;
  totalSessions: number;
  totalReaders: number;
  booksRead: number;
  topBooks: { bookId: string; readers: number }[];
}

// === ELŐADÁSOK ===
export type VideoTopic = 'történelem' | 'identitás' | 'hagyomány' | 'közösség' | 'család';
export type VideoPlatform = 'youtube' | 'rumble' | 'facebook' | 'egyéb';

export interface VideoEloadas {
  id: string;
  title: string;
  topic: VideoTopic;
  platform: VideoPlatform;
  uploadDate: string;
  duration: number; // percben
  views: number;
  likes: number;
  presenter: string;
}

export interface EloadasYearlyData {
  year: number;
  totalVideos: number;
  totalViews: number;
  byTopic: Record<VideoTopic, number>;
  topVideos: { videoId: string; views: number }[];
}

// === FAKULTÁCIÓ ===
export type FakultacioType = 
  | 'kuzdosport'
  | 'tanchaz'
  | 'tudomanyos_klub'
  | 'zongora'
  | 'hegedu'
  | 'furulya'
  | 'fuvos'
  | 'enek'
  | 'egyeb_zene';

export interface FakultacioInfo {
  type: FakultacioType;
  name: string;
  emoji: string;
  category: 'sport' | 'tánc' | 'tudomány' | 'zene';
}

export const FAKULTACIO_TYPES: FakultacioInfo[] = [
  { type: 'kuzdosport', name: 'Küzdősport', emoji: '🥋', category: 'sport' },
  { type: 'tanchaz', name: 'Táncház', emoji: '💃', category: 'tánc' },
  { type: 'tudomanyos_klub', name: 'Tudományos klub', emoji: '🔬', category: 'tudomány' },
  { type: 'zongora', name: 'Zongora', emoji: '🎹', category: 'zene' },
  { type: 'hegedu', name: 'Hegedű', emoji: '🎻', category: 'zene' },
  { type: 'furulya', name: 'Furulya', emoji: '🪈', category: 'zene' },
  { type: 'fuvos', name: 'Fúvós', emoji: '🎺', category: 'zene' },
  { type: 'enek', name: 'Ének', emoji: '🎤', category: 'zene' },
  { type: 'egyeb_zene', name: 'Egyéb zene', emoji: '🎵', category: 'zene' }
];

export interface FakultacioKor {
  id: string;
  type: FakultacioType;
  city: string;
  cityId: string;
  name: string;
  participants: number;
  schedule: string; // pl. "Hétfő 18:00"
  instructor: string;
}

export interface FakultacioYearlyData {
  year: number;
  totalCircles: number;
  totalParticipants: number;
  byType: Record<FakultacioType, number>;
  byCityTop5: { cityId: string; city: string; participants: number }[];
}
