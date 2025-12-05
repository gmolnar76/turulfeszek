export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  acquiredDate: string; // ISO date
}

export interface UserAchievement {
  id: string;
  holidayId: string;
  city: string;
  date: string; // ISO date
  activityScore: number;
  recognitionType: 'standard' | 'dedicated' | 'outstanding';
  points: number;
}

export interface UserProfile {
  id: string;
  did: string; // Decentralized Identifier
  name: string;
  avatar: string;
  joinDate: string; // ISO date
  totalPoints: number;
  achievements: UserAchievement[];
  badges: UserBadge[];
  bio?: string;
}
