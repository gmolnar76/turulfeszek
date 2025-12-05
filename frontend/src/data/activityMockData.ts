// Activity Mock Data - Mock adatok az 5 aktivitás kategóriához
import type {
  ActivityCategory,
  PajtasTaborEvent,
  PajtasTaborYearlyData,
  Book,
  OlvasokorSession,
  OlvasokorYearlyData,
  VideoEloadas,
  EloadasYearlyData,
  FakultacioKor,
  FakultacioYearlyData,
  FakultacioType,
  VideoTopic,
  AgeGroup
} from '../types/activity.types';

// === CITIES for mock data ===
export const ACTIVITY_CITIES = [
  { id: 'budapest', name: 'Budapest' },
  { id: 'debrecen', name: 'Debrecen' },
  { id: 'szeged', name: 'Szeged' },
  { id: 'miskolc', name: 'Miskolc' },
  { id: 'pecs', name: 'Pécs' },
  { id: 'gyor', name: 'Győr' },
  { id: 'nyiregyhaza', name: 'Nyíregyháza' },
  { id: 'kecskemet', name: 'Kecskemét' },
  { id: 'szekesfehervar', name: 'Székesfehérvár' },
  { id: 'szombathely', name: 'Szombathely' }
];

// Keep CITIES for internal use
const CITIES = ACTIVITY_CITIES;

// === PAJTÁS TÁBOR DATA ===
const CAMP_NAMES = [
  'Hősök Tábora', 'Árpád Nyári Tábor', 'Hunnia Kalandtábor', 
  'Turán Ifjúsági Tábor', 'Attila Tábor', 'Magyar Szív Tábor',
  'Kárpátia Tábor', 'Erdélyi Nyár', 'Balaton Kaland', 'Tisza-parti Tábor'
];

const CAMP_ACTIVITIES = [
  'Íjászat', 'Lovaglás', 'Néptánc', 'Kézművesség', 'Túrázás',
  'Úszás', 'Tábortűz', 'Hagyományőrzés', 'Sportversenyek', 'Éneklés'
];

export function generatePajtasTaborData(): {
  events: PajtasTaborEvent[];
  yearlyData: PajtasTaborYearlyData[];
} {
  const events: PajtasTaborEvent[] = [];
  let eventId = 1;
  
  const years = [2020, 2021, 2022, 2023, 2024];
  const seasons: ('tavasz' | 'nyár' | 'ősz')[] = ['tavasz', 'nyár', 'ősz'];
  const ageGroups: AgeGroup[] = ['6-10', '10-14', '14-18'];
  
  for (const year of years) {
    for (const city of CITIES) {
      // 1-3 camps per city per year
      const campCount = 1 + Math.floor(seededRandom(`camp-${city.id}-${year}`) * 3);
      
      for (let i = 0; i < campCount; i++) {
        const season = seasons[Math.floor(seededRandom(`season-${city.id}-${year}-${i}`) * 3)];
        const ageGroup = ageGroups[Math.floor(seededRandom(`age-${city.id}-${year}-${i}`) * 3)];
        const maxCapacity = 30 + Math.floor(seededRandom(`cap-${city.id}-${year}-${i}`) * 50);
        const enrolled = Math.floor(maxCapacity * (0.6 + seededRandom(`enroll-${city.id}-${year}-${i}`) * 0.4));
        
        events.push({
          id: `camp-${eventId++}`,
          name: CAMP_NAMES[Math.floor(seededRandom(`name-${city.id}-${year}-${i}`) * CAMP_NAMES.length)],
          city: city.name,
          cityId: city.id,
          year,
          season,
          ageGroup,
          enrolledChildren: enrolled,
          maxCapacity,
          activities: shuffleArray(CAMP_ACTIVITIES, `act-${city.id}-${year}-${i}`).slice(0, 4)
        });
      }
    }
  }
  
  // Aggregate yearly data
  const yearlyData: PajtasTaborYearlyData[] = years.map(year => {
    const yearEvents = events.filter(e => e.year === year);
    return {
      year,
      totalCamps: yearEvents.length,
      totalEnrolled: yearEvents.reduce((sum, e) => sum + e.enrolledChildren, 0),
      byAgeGroup: {
        '6-10': yearEvents.filter(e => e.ageGroup === '6-10').reduce((sum, e) => sum + e.enrolledChildren, 0),
        '10-14': yearEvents.filter(e => e.ageGroup === '10-14').reduce((sum, e) => sum + e.enrolledChildren, 0),
        '14-18': yearEvents.filter(e => e.ageGroup === '14-18').reduce((sum, e) => sum + e.enrolledChildren, 0)
      }
    };
  });
  
  return { events, yearlyData };
}

// === OLVASÓKÖR DATA ===
export const SAMPLE_BOOKS: Book[] = [
  { id: 'book-1', title: 'Egri csillagok', author: 'Gárdonyi Géza', genre: 'történelem', pages: 540, recommended: true },
  { id: 'book-2', title: 'A Pál utcai fiúk', author: 'Molnár Ferenc', genre: 'ifjúsági', pages: 200, recommended: true },
  { id: 'book-3', title: 'Tüskevár', author: 'Fekete István', genre: 'ifjúsági', pages: 280, recommended: true },
  { id: 'book-4', title: 'Kele', author: 'Fekete István', genre: 'ifjúsági', pages: 220, recommended: true },
  { id: 'book-5', title: 'A magyar nemzet története', author: 'Szekfű Gyula', genre: 'történelem', pages: 680, recommended: true },
  { id: 'book-6', title: 'Vuk', author: 'Fekete István', genre: 'ifjúsági', pages: 180, recommended: true },
  { id: 'book-7', title: 'Az ember tragédiája', author: 'Madách Imre', genre: 'szépirodalom', pages: 320, recommended: true },
  { id: 'book-8', title: 'János vitéz', author: 'Petőfi Sándor', genre: 'szépirodalom', pages: 120, recommended: true },
  { id: 'book-9', title: 'Toldi', author: 'Arany János', genre: 'szépirodalom', pages: 150, recommended: true },
  { id: 'book-10', title: 'Magyar népmesék', author: 'Illyés Gyula (szerk.)', genre: 'népmese', pages: 400, recommended: true },
  { id: 'book-11', title: 'A kőszívű ember fiai', author: 'Jókai Mór', genre: 'történelem', pages: 620, recommended: true },
  { id: 'book-12', title: 'Légy jó mindhalálig', author: 'Móricz Zsigmond', genre: 'ifjúsági', pages: 240, recommended: false },
  { id: 'book-13', title: 'Abigél', author: 'Szabó Magda', genre: 'ifjúsági', pages: 380, recommended: false },
  { id: 'book-14', title: 'A láthatatlan ember', author: 'Gárdonyi Géza', genre: 'történelem', pages: 420, recommended: false },
  { id: 'book-15', title: 'Honfoglalás', author: 'Bánffy Miklós', genre: 'történelem', pages: 580, recommended: false }
];

export function generateOlvasokorData(): {
  sessions: OlvasokorSession[];
  yearlyData: OlvasokorYearlyData[];
} {
  const sessions: OlvasokorSession[] = [];
  let sessionId = 1;
  const years = [2020, 2021, 2022, 2023, 2024];
  
  for (const year of years) {
    for (const city of CITIES) {
      // 4-12 sessions per city per year
      const sessionCount = 4 + Math.floor(seededRandom(`session-${city.id}-${year}`) * 9);
      
      for (let i = 0; i < sessionCount; i++) {
        const book = SAMPLE_BOOKS[Math.floor(seededRandom(`book-${city.id}-${year}-${i}`) * SAMPLE_BOOKS.length)];
        const month = 1 + Math.floor(seededRandom(`month-${city.id}-${year}-${i}`) * 12);
        const day = 1 + Math.floor(seededRandom(`day-${city.id}-${year}-${i}`) * 28);
        
        sessions.push({
          id: `session-${sessionId++}`,
          bookId: book.id,
          city: city.name,
          cityId: city.id,
          date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          participants: 5 + Math.floor(seededRandom(`part-${city.id}-${year}-${i}`) * 20),
          discussionTopics: [
            'Karakterelemzés',
            'Történelmi háttér',
            'Mai tanulságok',
            'Nemzeti értékek'
          ].slice(0, 2 + Math.floor(seededRandom(`topics-${city.id}-${year}-${i}`) * 3))
        });
      }
    }
  }
  
  const yearlyData: OlvasokorYearlyData[] = years.map(year => {
    const yearSessions = sessions.filter(s => s.date.startsWith(String(year)));
    const bookCounts = new Map<string, number>();
    
    yearSessions.forEach(s => {
      const count = bookCounts.get(s.bookId) || 0;
      bookCounts.set(s.bookId, count + s.participants);
    });
    
    const topBooks = Array.from(bookCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([bookId, readers]) => ({ bookId, readers }));
    
    return {
      year,
      totalSessions: yearSessions.length,
      totalReaders: yearSessions.reduce((sum, s) => sum + s.participants, 0),
      booksRead: new Set(yearSessions.map(s => s.bookId)).size,
      topBooks
    };
  });
  
  return { sessions, yearlyData };
}

// === ELŐADÁSOK DATA ===
const VIDEO_TITLES: { title: string; topic: VideoTopic; presenter: string }[] = [
  { title: 'A magyarság őstörténete', topic: 'történelem', presenter: 'Dr. Bakay Kornél' },
  { title: 'Hunok és magyarok', topic: 'történelem', presenter: 'Dr. Szörényi Levente' },
  { title: 'Nemzeti identitásunk alapjai', topic: 'identitás', presenter: 'Prof. Bogár László' },
  { title: 'Magyar hagyományok átadása', topic: 'hagyomány', presenter: 'Kocsis István' },
  { title: 'Közösségépítés a XXI. században', topic: 'közösség', presenter: 'Fábián Attila' },
  { title: 'Család és nemzet', topic: 'család', presenter: 'Dr. Matolcsy György' },
  { title: 'A Trianon-trauma feldolgozása', topic: 'történelem', presenter: 'Dr. Raffay Ernő' },
  { title: 'Magyar nyelv mint identitás', topic: 'identitás', presenter: 'Dr. Pusztay János' },
  { title: 'Népi kultúránk értékei', topic: 'hagyomány', presenter: 'Sebő Ferenc' },
  { title: 'Helyi közösségek ereje', topic: 'közösség', presenter: 'Bíró András' },
  { title: 'Családi értékek megőrzése', topic: 'család', presenter: 'Dr. Kopp Mária' },
  { title: '1956 hősei', topic: 'történelem', presenter: 'Wittner Mária' },
  { title: 'Keresztény magyarság', topic: 'identitás', presenter: 'Böjte Csaba' },
  { title: 'Kézművesség és hagyomány', topic: 'hagyomány', presenter: 'Magyar Zoltán' },
  { title: 'Fiatalok és közösség', topic: 'közösség', presenter: 'Novák Előd' }
];

export function generateEloadasokData(): {
  videos: VideoEloadas[];
  yearlyData: EloadasYearlyData[];
} {
  const videos: VideoEloadas[] = [];
  let videoId = 1;
  const years = [2020, 2021, 2022, 2023, 2024];
  const platforms: ('youtube' | 'rumble' | 'facebook')[] = ['youtube', 'rumble', 'facebook'];
  
  for (const year of years) {
    // 15-25 videos per year
    const videoCount = 15 + Math.floor(seededRandom(`video-count-${year}`) * 11);
    
    for (let i = 0; i < videoCount; i++) {
      const videoInfo = VIDEO_TITLES[Math.floor(seededRandom(`video-${year}-${i}`) * VIDEO_TITLES.length)];
      const month = 1 + Math.floor(seededRandom(`vmonth-${year}-${i}`) * 12);
      const day = 1 + Math.floor(seededRandom(`vday-${year}-${i}`) * 28);
      const platform = platforms[Math.floor(seededRandom(`platform-${year}-${i}`) * platforms.length)];
      const views = 500 + Math.floor(seededRandom(`views-${year}-${i}`) * 50000);
      
      videos.push({
        id: `video-${videoId++}`,
        title: `${videoInfo.title} (${year})`,
        topic: videoInfo.topic,
        platform,
        uploadDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        duration: 20 + Math.floor(seededRandom(`dur-${year}-${i}`) * 100),
        views,
        likes: Math.floor(views * (0.02 + seededRandom(`likes-${year}-${i}`) * 0.08)),
        presenter: videoInfo.presenter
      });
    }
  }
  
  const yearlyData: EloadasYearlyData[] = years.map(year => {
    const yearVideos = videos.filter(v => v.uploadDate.startsWith(String(year)));
    
    const byTopic: Record<VideoTopic, number> = {
      történelem: 0,
      identitás: 0,
      hagyomány: 0,
      közösség: 0,
      család: 0
    };
    
    yearVideos.forEach(v => {
      byTopic[v.topic] += v.views;
    });
    
    const topVideos = yearVideos
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map(v => ({ videoId: v.id, views: v.views }));
    
    return {
      year,
      totalVideos: yearVideos.length,
      totalViews: yearVideos.reduce((sum, v) => sum + v.views, 0),
      byTopic,
      topVideos
    };
  });
  
  return { videos, yearlyData };
}

// === FAKULTÁCIÓ DATA ===
const INSTRUCTOR_NAMES = [
  'Kovács István', 'Nagy Péter', 'Tóth Mária', 'Szabó Anna', 'Horváth Gábor',
  'Kiss Zsolt', 'Molnár Éva', 'Varga Tibor', 'Balogh Katalin', 'Fekete László'
];

export function generateFakultacioData(): {
  circles: FakultacioKor[];
  yearlyData: FakultacioYearlyData[];
} {
  const circles: FakultacioKor[] = [];
  let circleId = 1;
  const years = [2020, 2021, 2022, 2023, 2024];
  const types: FakultacioType[] = [
    'kuzdosport', 'tanchaz', 'tudomanyos_klub', 'zongora', 'hegedu', 
    'furulya', 'fuvos', 'enek', 'egyeb_zene'
  ];
  
  const schedules = ['Hétfő 17:00', 'Kedd 18:00', 'Szerda 16:00', 'Csütörtök 17:30', 'Péntek 15:00', 'Szombat 10:00'];
  
  const typeNames: Record<FakultacioType, string[]> = {
    kuzdosport: ['Judo szakkör', 'Karate kör', 'Birkózás', 'Íjász kör'],
    tanchaz: ['Néptánc kör', 'Magyar táncház', 'Hagyományőrző tánc'],
    tudomanyos_klub: ['Természetismeret', 'Történelem kör', 'Környezetvédelem'],
    zongora: ['Zongora kezdő', 'Zongora haladó'],
    hegedu: ['Hegedű szakkör', 'Vonós együttes'],
    furulya: ['Furulya kezdő', 'Furulya haladó'],
    fuvos: ['Fúvós zenekar', 'Rézfúvós kör'],
    enek: ['Kórus', 'Népdaléneklés', 'Szólóének'],
    egyeb_zene: ['Gitár kör', 'Citera szakkör', 'Népi hangszerek']
  };
  
  // Generate circles - varying by city and year
  for (const year of years) {
    for (const city of CITIES) {
      // Each city has 3-7 active circles
      const circleCount = 3 + Math.floor(seededRandom(`circle-${city.id}-${year}`) * 5);
      const selectedTypes = shuffleArray([...types], `types-${city.id}-${year}`).slice(0, circleCount);
      
      for (const type of selectedTypes) {
        const names = typeNames[type];
        const name = names[Math.floor(seededRandom(`name-${city.id}-${year}-${type}`) * names.length)];
        const schedule = schedules[Math.floor(seededRandom(`sched-${city.id}-${year}-${type}`) * schedules.length)];
        const instructor = INSTRUCTOR_NAMES[Math.floor(seededRandom(`inst-${city.id}-${year}-${type}`) * INSTRUCTOR_NAMES.length)];
        
        circles.push({
          id: `circle-${circleId++}`,
          type,
          city: city.name,
          cityId: city.id,
          name,
          participants: 5 + Math.floor(seededRandom(`part-${city.id}-${year}-${type}`) * 25),
          schedule,
          instructor
        });
      }
    }
  }
  
  const yearlyData: FakultacioYearlyData[] = years.map(year => {
    // Since circles don't have year, we calculate based on year index for mock growth
    const yearIndex = year - 2020;
    const yearCircles = circles.slice(yearIndex * 50, (yearIndex + 1) * 50 + 10);
    
    const byType: Record<FakultacioType, number> = {} as Record<FakultacioType, number>;
    types.forEach(t => { byType[t] = 0; });
    
    const cityParticipants = new Map<string, { cityId: string; city: string; participants: number }>();
    
    yearCircles.forEach(c => {
      byType[c.type] += c.participants;
      
      const existing = cityParticipants.get(c.cityId) || { cityId: c.cityId, city: c.city, participants: 0 };
      existing.participants += c.participants;
      cityParticipants.set(c.cityId, existing);
    });
    
    const byCityTop5 = Array.from(cityParticipants.values())
      .sort((a, b) => b.participants - a.participants)
      .slice(0, 5);
    
    return {
      year,
      totalCircles: yearCircles.length,
      totalParticipants: yearCircles.reduce((sum, c) => sum + c.participants, 0),
      byType,
      byCityTop5
    };
  });
  
  return { circles, yearlyData };
}

// === ÜNNEP DATA (from communityMockData - re-exported with yearly format) ===
export interface UnnepYearlyData {
  year: number;
  holidays: {
    name: string;
    key: string;
    color: string;
    participants: number;
    events: number;
  }[];
}

export function generateUnnepData(): UnnepYearlyData[] {
  const years = [2020, 2021, 2022, 2023, 2024];
  const holidays = [
    { name: '🎖️ Március 15.', key: 'march15', color: '#dc2626' },
    { name: '👑 Szent István Nap', key: 'istvan', color: '#f97316' },
    { name: '🇭🇺 Október 23.', key: 'october23', color: '#16a34a' }
  ];
  
  return years.map(year => ({
    year,
    holidays: holidays.map(h => ({
      ...h,
      participants: 5000 + Math.floor(seededRandom(`unnep-${h.key}-${year}`) * 15000),
      events: 20 + Math.floor(seededRandom(`unnep-events-${h.key}-${year}`) * 80)
    }))
  }));
}

// Filter and aggregate ünnep data by city
export function getUnnepDataForCity(cityId: string | null): UnnepYearlyData[] {
  const years = [2020, 2021, 2022, 2023, 2024];
  const holidays = [
    { name: '🎖️ Március 15.', key: 'march15', color: '#dc2626' },
    { name: '👑 Szent István Nap', key: 'istvan', color: '#f97316' },
    { name: '🇭🇺 Október 23.', key: 'october23', color: '#16a34a' }
  ];
  
  if (!cityId) {
    // Return aggregated national data
    return generateUnnepData();
  }
  
  // Return city-specific data
  return years.map(year => ({
    year,
    holidays: holidays.map(h => ({
      ...h,
      participants: 200 + Math.floor(seededRandom(`unnep-${h.key}-${year}-${cityId}`) * 2000),
      events: 2 + Math.floor(seededRandom(`unnep-events-${h.key}-${year}-${cityId}`) * 15)
    }))
  }));
}

// Get Pajtás Tábor data filtered by city
export function getPajtasTaborDataForCity(cityId: string | null): PajtasTaborYearlyData[] {
  const { events } = generatePajtasTaborData();
  const years = [2020, 2021, 2022, 2023, 2024];
  
  const filteredEvents = cityId 
    ? events.filter(e => e.cityId === cityId)
    : events;
  
  return years.map(year => {
    const yearEvents = filteredEvents.filter(e => e.year === year);
    return {
      year,
      totalCamps: yearEvents.length,
      totalEnrolled: yearEvents.reduce((sum, e) => sum + e.enrolledChildren, 0),
      byAgeGroup: {
        '6-10': yearEvents.filter(e => e.ageGroup === '6-10').reduce((sum, e) => sum + e.enrolledChildren, 0),
        '10-14': yearEvents.filter(e => e.ageGroup === '10-14').reduce((sum, e) => sum + e.enrolledChildren, 0),
        '14-18': yearEvents.filter(e => e.ageGroup === '14-18').reduce((sum, e) => sum + e.enrolledChildren, 0)
      }
    };
  });
}

// Get Olvasókör data filtered by city
export function getOlvasokorDataForCity(cityId: string | null): OlvasokorYearlyData[] {
  const { sessions } = generateOlvasokorData();
  const years = [2020, 2021, 2022, 2023, 2024];
  
  const filteredSessions = cityId 
    ? sessions.filter(s => s.cityId === cityId)
    : sessions;
  
  return years.map(year => {
    const yearSessions = filteredSessions.filter(s => s.date.startsWith(String(year)));
    const bookCounts = new Map<string, number>();
    
    yearSessions.forEach(s => {
      const count = bookCounts.get(s.bookId) || 0;
      bookCounts.set(s.bookId, count + s.participants);
    });
    
    const topBooks = Array.from(bookCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([bookId, readers]) => ({ bookId, readers }));
    
    return {
      year,
      totalSessions: yearSessions.length,
      totalReaders: yearSessions.reduce((sum, s) => sum + s.participants, 0),
      booksRead: new Set(yearSessions.map(s => s.bookId)).size,
      topBooks
    };
  });
}

// Get Előadások data - videos are national, but we can filter views by city
export function getEloadasokDataForCity(cityId: string | null): EloadasYearlyData[] {
  const { yearlyData } = generateEloadasokData();
  
  if (!cityId) {
    return yearlyData;
  }
  
  // For city-specific, scale down national data based on city population factor
  const cityFactors: Record<string, number> = {
    budapest: 0.25,
    debrecen: 0.08,
    szeged: 0.07,
    miskolc: 0.06,
    pecs: 0.06,
    gyor: 0.06,
    nyiregyhaza: 0.05,
    kecskemet: 0.05,
    szekesfehervar: 0.05,
    szombathely: 0.04
  };
  
  const factor = cityFactors[cityId] || 0.05;
  
  return yearlyData.map(d => ({
    ...d,
    totalViews: Math.floor(d.totalViews * factor),
    byTopic: {
      történelem: Math.floor(d.byTopic.történelem * factor),
      identitás: Math.floor(d.byTopic.identitás * factor),
      hagyomány: Math.floor(d.byTopic.hagyomány * factor),
      közösség: Math.floor(d.byTopic.közösség * factor),
      család: Math.floor(d.byTopic.család * factor)
    },
    topVideos: d.topVideos.map(v => ({ ...v, views: Math.floor(v.views * factor) }))
  }));
}

// Get Fakultáció data filtered by city
export function getFakultacioDataForCity(cityId: string | null): FakultacioYearlyData[] {
  const { circles } = generateFakultacioData();
  const years = [2020, 2021, 2022, 2023, 2024];
  const types: FakultacioType[] = [
    'kuzdosport', 'tanchaz', 'tudomanyos_klub', 'zongora', 'hegedu', 
    'furulya', 'fuvos', 'enek', 'egyeb_zene'
  ];
  
  const filteredCircles = cityId 
    ? circles.filter(c => c.cityId === cityId)
    : circles;
  
  return years.map(year => {
    const yearIndex = year - 2020;
    // Each year has approximately 50 circles total
    const yearCircles = filteredCircles.slice(
      Math.floor(yearIndex * filteredCircles.length / 5), 
      Math.floor((yearIndex + 1) * filteredCircles.length / 5) + (filteredCircles.length > 50 ? 10 : 2)
    );
    
    const byType: Record<FakultacioType, number> = {} as Record<FakultacioType, number>;
    types.forEach(t => { byType[t] = 0; });
    
    const cityParticipants = new Map<string, { cityId: string; city: string; participants: number }>();
    
    yearCircles.forEach(c => {
      byType[c.type] += c.participants;
      
      const existing = cityParticipants.get(c.cityId) || { cityId: c.cityId, city: c.city, participants: 0 };
      existing.participants += c.participants;
      cityParticipants.set(c.cityId, existing);
    });
    
    const byCityTop5 = Array.from(cityParticipants.values())
      .sort((a, b) => b.participants - a.participants)
      .slice(0, 5);
    
    return {
      year,
      totalCircles: yearCircles.length,
      totalParticipants: yearCircles.reduce((sum, c) => sum + c.participants, 0),
      byType,
      byCityTop5
    };
  });
}

// === HELPER FUNCTIONS ===
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
}

function shuffleArray<T>(array: T[], seed: string): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(`${seed}-${i}`) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// === EXPORT ALL DATA GENERATORS ===
export function getAllActivityData() {
  return {
    unnep: generateUnnepData(),
    pajtas_tabor: generatePajtasTaborData(),
    olvasokor: generateOlvasokorData(),
    eloadasok: generateEloadasokData(),
    fakultacio: generateFakultacioData()
  };
}
