import { NationalHoliday, CommunityEvent, CommunityParticipant, CommunityParticipationStats, FamousHungarian, EventNotification } from '../types/community.types';

// Hungarian National Holidays (official) with event locations
export const HUNGARIAN_HOLIDAYS: NationalHoliday[] = [
  {
    id: 'march15',
    name: 'Március 15.',
    date: '2024-03-15',
    description: '1848-as forradalom és szabadságharc emléknapja',
    icon: '🎖️',
    region: 'orszagos',
  },
  {
    id: 'istvan',
    name: 'Szent István Nap',
    date: '2024-08-20',
    description: 'Az államalapítás ünnepe - Szent István király emlékére',
    icon: '👑',
    region: 'orszagos',
  },
  {
    id: 'october23',
    name: 'Október 23.',
    date: '2024-10-23',
    description: '1956-os forradalom és szabadságharc emléknapja',
    icon: '🇭🇺',
    region: 'orszagos',
  },
  {
    id: 'trianon',
    name: 'Trianon Emléknap',
    date: '2024-06-04',
    description: 'A nemzeti összetartozás napja - Trianoni békeszerződés évfordulója',
    icon: '🕯️',
    region: 'orszagos',
  },
  {
    id: 'aradi',
    name: 'Aradi Vértanúk',
    date: '2024-10-06',
    description: 'Az aradi vértanúk emléknapja - 13 honvédtábornok kivégzése',
    icon: '⚔️',
    region: 'orszagos',
  },
  {
    id: 'kulturanap',
    name: 'Magyar Kultúra Napja',
    date: '2024-01-22',
    description: 'A magyar kultúra ünnepe - Kölcsey Ferenc Himnusz befejezésének napja',
    icon: '📚',
    region: 'orszagos',
  },
];

// Famous Hungarians data
export const FAMOUS_HUNGARIANS: FamousHungarian[] = [
  // Költők és Írók
  { id: 'petofi', name: 'Petőfi Sándor', category: 'kolto_iro', birthYear: 1823, deathYear: 1849, description: 'A magyar romantika egyik legnagyobb költője, a forradalom szimbóluma', achievements: ['Nemzeti dal', 'János vitéz', 'Az apostol'] },
  { id: 'arany', name: 'Arany János', category: 'kolto_iro', birthYear: 1817, deathYear: 1882, description: 'A magyar irodalom klasszikusa, az epika nagymestere', achievements: ['Toldi trilógia', 'A walesi bárdok', 'Balladák'] },
  { id: 'jokai', name: 'Jókai Mór', category: 'kolto_iro', birthYear: 1825, deathYear: 1904, description: 'A magyar regényirodalom legolvasottabb klasszikusa', achievements: ['Az arany ember', 'A kőszívű ember fiai', 'Fekete gyémántok'] },
  { id: 'ady', name: 'Ady Endre', category: 'kolto_iro', birthYear: 1877, deathYear: 1919, description: 'A modern magyar líra megteremtője', achievements: ['Új versek', 'Vér és arany', 'A halottak élén'] },
  { id: 'moricz', name: 'Móricz Zsigmond', category: 'kolto_iro', birthYear: 1879, deathYear: 1942, description: 'A magyar realista próza nagymestere', achievements: ['Légy jó mindhalálig', 'Rokonok', 'Erdély trilógia'] },
  // Tudósok
  { id: 'neumann', name: 'Neumann János', category: 'tudos', birthYear: 1903, deathYear: 1957, description: 'A számítógép atyja, matematikus és fizikus', achievements: ['Neumann-architektúra', 'Játékelmélet', 'Manhattan Project'] },
  { id: 'szentgyorgyi', name: 'Szent-Györgyi Albert', category: 'tudos', birthYear: 1893, deathYear: 1986, description: 'Nobel-díjas biokémikus, a C-vitamin felfedezője', achievements: ['C-vitamin izolálása', 'Nobel-díj (1937)', 'Izomkutatás'] },
  { id: 'teller', name: 'Teller Ede', category: 'tudos', birthYear: 1908, deathYear: 2003, description: 'Atomfizikus, a hidrogénbomba atyja', achievements: ['Hidrogénbomba', 'Manhattan Project', 'Elméleti fizika'] },
  { id: 'rubik', name: 'Rubik Ernő', category: 'tudos', birthYear: 1944, description: 'Feltaláló, építész, a Rubik-kocka megalkotója', achievements: ['Rubik-kocka', 'Rubik-kígyó', 'Magic puzzle'] },
  { id: 'semmelweis', name: 'Semmelweis Ignác', category: 'tudos', birthYear: 1818, deathYear: 1865, description: 'Az anyák megmentője, a fertőtlenítés úttörője', achievements: ['Kézmosás fontossága', 'Gyermekágyi láz megelőzése'] },
  // Sportolók
  { id: 'puskas', name: 'Puskás Ferenc', category: 'sportolo', birthYear: 1927, deathYear: 2006, description: 'Az Aranycsapat kapitánya, minden idők egyik legjobb labdarúgója', achievements: ['Aranycsapat', 'Real Madrid', '84 válogatott gól'] },
  { id: 'egerszegi', name: 'Egerszegi Krisztina', category: 'sportolo', birthYear: 1974, description: 'Háromszoros olimpiai bajnok úszónő', achievements: ['5 olimpiai arany', 'Világcsúcsok', 'Minden idők legfiatalabb olimpiai bajnoka'] },
  { id: 'hosszu', name: 'Hosszú Katinka', category: 'sportolo', birthYear: 1989, description: 'Olimpiai bajnok úszónő, a Vasladynő', achievements: ['3 olimpiai arany', 'Világbajnoki címek', 'Világcsúcsok'] },
  { id: 'szilágyi', name: 'Szilágyi Áron', category: 'sportolo', birthYear: 1990, description: 'Háromszoros olimpiai bajnok kardvívó', achievements: ['3 egyéni olimpiai arany', 'Világbajnoki címek'] },
  // Történelmi alakok
  { id: 'matyas', name: 'Hunyadi Mátyás', category: 'tortenelmi', birthYear: 1443, deathYear: 1490, description: 'Magyarország reneszánsz királya', achievements: ['Fekete Sereg', 'Corvinák', 'Bécsi udvar elfoglalása'] },
  { id: 'kossuth', name: 'Kossuth Lajos', category: 'tortenelmi', birthYear: 1802, deathYear: 1894, description: 'A magyar függetlenségi mozgalom vezére', achievements: ['1848-as forradalom', 'Függetlenségi nyilatkozat', 'Kormányzóelnök'] },
  { id: 'szechenyi', name: 'Széchenyi István', category: 'tortenelmi', birthYear: 1791, deathYear: 1860, description: 'A legnagyobb magyar, reformer és államférfi', achievements: ['Lánchíd', 'MTA alapítása', 'Vasút fejlesztés'] },
  { id: 'deak', name: 'Deák Ferenc', category: 'tortenelmi', birthYear: 1803, deathYear: 1876, description: 'A haza bölcse, a kiegyezés létrehozója', achievements: ['Kiegyezés (1867)', 'Alkotmányos politika'] },
];

// Famous Hungarians category labels
export const FAMOUS_HUNGARIAN_CATEGORIES = {
  kolto_iro: { name: 'Költők és Írók', icon: '✍️' },
  tudos: { name: 'Tudósok', icon: '🔬' },
  sportolo: { name: 'Sportolók', icon: '🏅' },
  tortenelmi: { name: 'Történelmi Alakok', icon: '👑' },
};

// Region labels
export const REGION_LABELS = {
  helyi: 'Helyi',
  megyei: 'Megyei',
  regionalis: 'Regionális',
  orszagos: 'Országos',
};

// City coordinates (centers for event locations)
const CITY_COORDS: Record<string, [number, number]> = {
  Budapest: [47.4979, 19.0402],
  Debrecen: [47.5316, 21.6273],
  Szeged: [46.2530, 20.1414],
  Pécs: [46.0727, 18.2308],
  Győr: [47.6875, 17.6458],
  Kecskemét: [46.9041, 19.6884],
  Miskolc: [48.1035, 20.7784],
  Nyíregyháza: [47.9495, 21.7244],
  Székesfehérvár: [47.1896, 18.4108],
  Szombathely: [47.2306, 16.6218],
  Eger: [47.9025, 20.3772],
  Veszprém: [47.0930, 17.9093],
};

// Mock notifications
export const MOCK_NOTIFICATIONS: EventNotification[] = [
  { id: 'n1', eventId: 'event-march15-Budapest-0', title: 'Közelgő rendezvény', message: 'Március 15-i megemlékezés Budapesten holnap!', targetAudience: 'orszagos', sentAt: '2024-03-14T10:00:00Z', readCount: 1250, totalRecipients: 2000 },
  { id: 'n2', eventId: 'event-istvan-Debrecen-0', title: 'Szent István napi ünnepség', message: 'Várjuk Önt a debreceni ünnepségen!', targetAudience: 'regionalis', sentAt: '2024-08-18T08:00:00Z', readCount: 450, totalRecipients: 600 },
];

// Generate events for each holiday in 2-3 cities
export function generateCommunityEvents(): CommunityEvent[] {
  const events: CommunityEvent[] = [];
  const cities = Object.keys(CITY_COORDS);
  const regions: Array<'helyi' | 'megyei' | 'regionalis' | 'orszagos'> = ['helyi', 'megyei', 'regionalis', 'orszagos'];

  HUNGARIAN_HOLIDAYS.forEach((holiday) => {
    const numCities = Math.random() > 0.5 ? 3 : 4;
    const selectedCities = cities.sort(() => Math.random() - 0.5).slice(0, numCities);

    selectedCities.forEach((city, index) => {
      const [lat, lon] = CITY_COORDS[city];
      events.push({
        id: `event-${holiday.id}-${city}-${index}`,
        holidayId: holiday.id,
        city,
        location: {
          name: `${city} - Közösségi Gyűlés`,
          address: `${city}, Fő tér 1.`,
          coordinates: [lat, lon],
        },
        region: city === 'Budapest' ? 'orszagos' : regions[Math.floor(Math.random() * 3)],
        participationStartDate: holiday.date,
        participationEndDate: new Date(new Date(holiday.date).getTime() + 3 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        organizer: 'Helyi Közösség',
        maxParticipants: Math.floor(Math.random() * 500) + 100,
      });
    });
  });

  return events;
}

// Generate random coordinates within 500m radius of event location
function getRandomCoordinateNear(center: [number, number], radiusKm = 0.5): [number, number] {
  const lat = center[0];
  const lon = center[1];
  
  // 1 degree latitude ≈ 111 km
  const latOffset = (Math.random() - 0.5) * (radiusKm / 111);
  // 1 degree longitude ≈ 111 km * cos(latitude)
  const lonOffset = (Math.random() - 0.5) * (radiusKm / (111 * Math.cos((lat * Math.PI) / 180)));

  return [lat + latOffset, lon + lonOffset];
}

// Generate mock participants for each event
export function generateCommunityParticipants(events: CommunityEvent[]): CommunityParticipant[] {
  const participants: CommunityParticipant[] = [];
  let participantId = 0;

  events.forEach((event) => {
    const participantCount = Math.floor(Math.random() * 150) + 50; // 50-200 participants

    for (let i = 0; i < participantCount; i++) {
      const activityScore = Math.floor(Math.random() * 75) + 20; // 20-95
      const recognitionTypes: Array<'standard' | 'dedicated' | 'outstanding'> = [
        'standard',
        'dedicated',
        'outstanding',
      ];
      const recognitionType =
        activityScore > 80 ? recognitionTypes[2] : activityScore > 60 ? recognitionTypes[1] : recognitionTypes[0];

      participants.push({
        id: `participant-${participantId++}`,
        eventId: event.id,
        coordinates: getRandomCoordinateNear(event.location.coordinates),
        joinedTime: new Date(new Date(event.participationStartDate).getTime() + Math.random() * 24 * 60 * 60 * 1000)
          .toISOString(),
        activityScore,
        recognitionType,
      });
    }
  });

  return participants;
}

// Calculate statistics for an event
export function calculateEventStats(
  eventId: string,
  participants: CommunityParticipant[]
): CommunityParticipationStats {
  const eventParticipants = participants.filter((p) => p.eventId === eventId);
  const recognizedCount = eventParticipants.filter((p) => p.activityScore > 60).length;
  const avgActivityScore =
    eventParticipants.length > 0
      ? eventParticipants.reduce((sum, p) => sum + p.activityScore, 0) / eventParticipants.length
      : 0;

  return {
    eventId,
    totalParticipants: eventParticipants.length,
    recognizedCount,
    averageActivityScore: Math.round(avgActivityScore * 10) / 10,
    participationRate: Math.round((recognizedCount / eventParticipants.length) * 100) / 100 || 0,
  };
}

// Initialize all mock data
export function initializeCommunityData() {
  const events = generateCommunityEvents();
  const participants = generateCommunityParticipants(events);

  return {
    holidays: HUNGARIAN_HOLIDAYS,
    events,
    participants,
    stats: events.map((event) => calculateEventStats(event.id, participants)),
  };
}
