import { UserProfile, UserBadge, UserAchievement } from '../types/user.types';

// Hungarian fantasy names for users
const FANTASY_NAMES = [
  'Sólyom', 'Tölgy', 'Csillag', 'Villám', 'Szélvész', 'Vadász', 'Árnyék', 'Fény',
  'Mennydörgés', 'Holló', 'Párduc', 'Sas', 'Vihar', 'Hajnal', 'Alkony', 'Hullám',
  'Szikla', 'Erdő', 'Folyó', 'Hegy', 'Napsugár', 'Holdtölte', 'Csendes', 'Bölcs',
  'Bátor', 'Hűséges', 'Őrző', 'Vezér', 'Harcos', 'Lovag', 'Dalia', 'Vitéz'
];

// Get random fantasy name
export function getRandomFantasyName(): string {
  return FANTASY_NAMES[Math.floor(Math.random() * FANTASY_NAMES.length)];
}

// Generate a DID (Decentralized Identifier) in elliptic curve format
function generateDID(): string {
  const randomBytes = Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
  return `did:ethr:0x${randomBytes.slice(0, 40)}`;
}

// Sample badges - National holidays only
const SAMPLE_BADGES: UserBadge[] = [
  {
    id: 'badge-march15-2024',
    name: 'Petőfi Követője',
    description: 'Aktív részvétel a Március 15-i megemlékezésen',
    icon: '🎖️',
    acquiredDate: '2024-03-15',
  },
  {
    id: 'badge-istvan-2024',
    name: 'Szent István Tanítványa',
    description: 'Elkötelezettség a Szent István Napi ünnepségen',
    icon: '👑',
    acquiredDate: '2024-08-20',
  },
  {
    id: 'badge-oct23-2024',
    name: '56-os Hős Emlékezője',
    description: 'Részvétel az Október 23-i megemlékezésen',
    icon: '🇭🇺',
    acquiredDate: '2024-10-23',
  },
  {
    id: 'badge-community-builder',
    name: 'Nemzeti Közösség Építője',
    description: 'Minden nemzeti ünnepen aktív részvétel',
    icon: '🏆',
    acquiredDate: '2024-10-24',
  },
];

// Sample achievements - National holidays only
const SAMPLE_ACHIEVEMENTS: UserAchievement[] = [
  {
    id: 'achievement-march15-budapest-2024',
    holidayId: 'march15',
    city: 'Budapest',
    date: '2024-03-15',
    activityScore: 92,
    recognitionType: 'outstanding',
    points: 92,
  },
  {
    id: 'achievement-march15-debrecen-2024',
    holidayId: 'march15',
    city: 'Debrecen',
    date: '2024-03-15',
    activityScore: 78,
    recognitionType: 'dedicated',
    points: 78,
  },
  {
    id: 'achievement-istvan-budapest-2024',
    holidayId: 'istvan',
    city: 'Budapest',
    date: '2024-08-20',
    activityScore: 95,
    recognitionType: 'outstanding',
    points: 95,
  },
  {
    id: 'achievement-oct23-szeged-2024',
    holidayId: 'october23',
    city: 'Szeged',
    date: '2024-10-23',
    activityScore: 88,
    recognitionType: 'dedicated',
    points: 88,
  },
];

// Generate mock user profile
export function generateMockUserProfile(): UserProfile {
  const achievements = SAMPLE_ACHIEVEMENTS;
  const totalPoints = achievements.reduce((sum, ach) => sum + ach.points, 0);
  
  // Determine badges based on achievements
  const qualifiedBadges = SAMPLE_BADGES.filter(badge => {
    if (badge.id === 'badge-community-builder') {
      return achievements.length >= 3;
    }
    return achievements.some(ach => ach.date === badge.acquiredDate);
  });

  // Use fantasy name instead of real name
  const fantasyName = getRandomFantasyName();

  return {
    id: 'user-demo-001',
    did: generateDID(),
    name: fantasyName,
    avatar: '🦅',
    joinDate: '2023-01-15',
    totalPoints,
    achievements,
    badges: qualifiedBadges,
    bio: `"${fantasyName}" - Aktív közösségi tag, magyar tradíciókat értékelő, helyi közösségért elkötelezett.`,
  };
}

// Get recognition type label in Hungarian
export function getRecognitionTypeLabel(type: 'standard' | 'dedicated' | 'outstanding'): string {
  const labels: Record<string, string> = {
    standard: 'Szabványos',
    dedicated: 'Elkötelezett',
    outstanding: 'Kimagasló',
  };
  return labels[type] || type;
}

// Get recognition type color
export function getRecognitionTypeColor(type: 'standard' | 'dedicated' | 'outstanding'): string {
  const colors: Record<string, string> = {
    standard: '#3b82f6', // blue
    dedicated: '#8b5cf6', // purple
    outstanding: '#fbbf24', // amber
  };
  return colors[type] || '#3b82f6';
}

// Sort achievements by date (newest first)
export function sortAchievementsByDate(achievements: UserAchievement[]): UserAchievement[] {
  return [...achievements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
