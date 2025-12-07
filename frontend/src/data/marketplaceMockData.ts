// Piactér Mock Adatok - Helyi terménykereskedés és használt cikkek

import type {
  MarketplaceListing,
  MarketplaceTransaction,
  CityMarketStats,
  ConstituencyMarketStats,
  ListingCategory,
  DailyMarketActivity,
  CategoryStat,
  SeasonalProduct,
  CityMarketSummary
} from '../types/marketplace.types';

// ============================================================================
// MOCK ELADÓK
// ============================================================================

const MOCK_SELLERS = [
  {
    userId: 'user-001',
    userName: 'Kovács János',
    avatarUrl: undefined,
    trustLevel: 4,
    memberSince: '2024-03-15',
    completedTransactions: 23,
    rating: 4.8,
    badges: ['trusted_seller', 'organic_farmer', 'active_member']
  },
  {
    userId: 'user-002',
    userName: 'Nagy Erzsébet',
    avatarUrl: undefined,
    trustLevel: 5,
    memberSince: '2023-11-20',
    completedTransactions: 67,
    rating: 4.9,
    badges: ['trusted_seller', 'top_seller', 'community_builder']
  },
  {
    userId: 'user-003',
    userName: 'Szabó Péter',
    avatarUrl: undefined,
    trustLevel: 3,
    memberSince: '2024-06-01',
    completedTransactions: 8,
    rating: 4.5,
    badges: ['active_member']
  },
  {
    userId: 'user-004',
    userName: 'Horváth Mária',
    avatarUrl: undefined,
    trustLevel: 4,
    memberSince: '2024-01-10',
    completedTransactions: 34,
    rating: 4.7,
    badges: ['trusted_seller', 'honey_producer']
  },
  {
    userId: 'user-005',
    userName: 'Tóth László',
    avatarUrl: undefined,
    trustLevel: 3,
    memberSince: '2024-08-20',
    completedTransactions: 5,
    rating: 4.3,
    badges: ['new_seller']
  },
  {
    userId: 'user-006',
    userName: 'Kiss Katalin',
    avatarUrl: undefined,
    trustLevel: 4,
    memberSince: '2024-02-28',
    completedTransactions: 45,
    rating: 4.8,
    badges: ['trusted_seller', 'homemade_specialist']
  },
  {
    userId: 'user-007',
    userName: 'Varga István',
    avatarUrl: undefined,
    trustLevel: 2,
    memberSince: '2024-10-01',
    completedTransactions: 2,
    rating: 4.0,
    badges: []
  },
  {
    userId: 'user-008',
    userName: 'Molnár Anna',
    avatarUrl: undefined,
    trustLevel: 5,
    memberSince: '2023-09-15',
    completedTransactions: 89,
    rating: 5.0,
    badges: ['trusted_seller', 'top_seller', 'organic_farmer', 'community_leader']
  }
];

// ============================================================================
// MOCK HIRDETÉSEK
// ============================================================================

export const MOCK_LISTINGS: MarketplaceListing[] = [
  // Kerti termények
  {
    id: 'listing-001',
    seller: MOCK_SELLERS[0],
    title: 'Friss házi paradicsom',
    description: 'Saját kertben termesztett, permetszermentes paradicsom. Több fajtából válogathat: cherry, húsparadicsom, koktélparadicsom. Déli fekvésű kertben, szeretettel gondozva.',
    category: 'garden_produce',
    type: 'sell',
    status: 'active',
    price: 800,
    currency: 'HUF',
    images: [],
    quantity: 15,
    unit: 'kg',
    isOrganic: true,
    harvestDate: '2024-12-05',
    location: {
      cityId: 'kecskemet',
      cityName: 'Kecskemét',
      constituencyId: 'OEVK-01',
      constituencyName: 'Bács-Kiskun 1.'
    },
    deliveryOptions: ['pickup', 'local_delivery'],
    createdAt: '2024-12-01T08:00:00Z',
    updatedAt: '2024-12-01T08:00:00Z',
    expiresAt: '2024-12-15T23:59:59Z',
    viewCount: 156,
    favoriteCount: 23,
    inquiryCount: 8
  },
  {
    id: 'listing-002',
    seller: MOCK_SELLERS[7],
    title: 'Bio sárgarépa',
    description: 'Vegyszermentes sárgarépa, ideális levesbe és főzelékhez. Téli tárolásra is kiváló.',
    category: 'garden_produce',
    type: 'sell',
    status: 'active',
    price: 500,
    currency: 'HUF',
    images: [],
    quantity: 30,
    unit: 'kg',
    isOrganic: true,
    harvestDate: '2024-11-28',
    location: {
      cityId: 'kiskunfelegyhaza',
      cityName: 'Kiskunfélegyháza',
      constituencyId: 'OEVK-01',
      constituencyName: 'Bács-Kiskun 1.'
    },
    deliveryOptions: ['pickup'],
    createdAt: '2024-12-02T10:30:00Z',
    updatedAt: '2024-12-02T10:30:00Z',
    expiresAt: '2024-12-20T23:59:59Z',
    viewCount: 89,
    favoriteCount: 12,
    inquiryCount: 4
  },
  {
    id: 'listing-003',
    seller: MOCK_SELLERS[2],
    title: 'Téli alma - Jonathan és Golden',
    description: 'Saját gyümölcsösből, 50+ éves fákról. Kétféle fajta kapható: Jonathan (savanykás) és Golden (édes). Kiváló tárolhatóság.',
    category: 'garden_produce',
    type: 'sell',
    status: 'active',
    price: 400,
    currency: 'HUF',
    images: [],
    quantity: 100,
    unit: 'kg',
    isOrganic: false,
    harvestDate: '2024-10-15',
    location: {
      cityId: 'szeged',
      cityName: 'Szeged',
      constituencyId: 'OEVK-02',
      constituencyName: 'Csongrád 1.'
    },
    deliveryOptions: ['pickup', 'local_delivery'],
    createdAt: '2024-11-20T14:00:00Z',
    updatedAt: '2024-12-01T09:00:00Z',
    expiresAt: '2024-12-31T23:59:59Z',
    viewCount: 234,
    favoriteCount: 45,
    inquiryCount: 15
  },

  // Házi készítésű termékek
  {
    id: 'listing-004',
    seller: MOCK_SELLERS[5],
    title: 'Házi szilvalekvár',
    description: 'Hagyományos recept szerint, réz üstben főzve. Csak cukor és szilva, semmi adalékanyag. Üvegben, sterilizálva.',
    category: 'homemade_goods',
    type: 'sell',
    status: 'active',
    price: 1500,
    currency: 'HUF',
    images: [],
    quantity: 20,
    unit: 'üveg',
    isOrganic: true,
    location: {
      cityId: 'kecskemet',
      cityName: 'Kecskemét',
      constituencyId: 'OEVK-01',
      constituencyName: 'Bács-Kiskun 1.'
    },
    deliveryOptions: ['pickup', 'shipping'],
    createdAt: '2024-11-25T16:00:00Z',
    updatedAt: '2024-11-25T16:00:00Z',
    expiresAt: '2025-02-28T23:59:59Z',
    viewCount: 178,
    favoriteCount: 34,
    inquiryCount: 12
  },
  {
    id: 'listing-005',
    seller: MOCK_SELLERS[1],
    title: 'Savanyú káposzta - házi',
    description: 'Hagyományos módon, fahordóban erjesztett savanyú káposzta. Élőflórás, probiotikus. Kilóra vagy egész fejben is.',
    category: 'homemade_goods',
    type: 'sell',
    status: 'active',
    price: 600,
    currency: 'HUF',
    images: [],
    quantity: 50,
    unit: 'kg',
    isOrganic: true,
    location: {
      cityId: 'kiskunfelegyhaza',
      cityName: 'Kiskunfélegyháza',
      constituencyId: 'OEVK-01',
      constituencyName: 'Bács-Kiskun 1.'
    },
    deliveryOptions: ['pickup'],
    createdAt: '2024-12-03T08:00:00Z',
    updatedAt: '2024-12-03T08:00:00Z',
    expiresAt: '2025-01-31T23:59:59Z',
    viewCount: 67,
    favoriteCount: 8,
    inquiryCount: 3
  },

  // Tojás, tejtermék
  {
    id: 'listing-006',
    seller: MOCK_SELLERS[0],
    title: 'Friss házi tojás',
    description: 'Szabadtartású tyúkok tojása. Naponta friss, garantáltan 3 napon belüli. M és L méret vegyes.',
    category: 'eggs_dairy',
    type: 'sell',
    status: 'active',
    price: 100,
    currency: 'HUF',
    images: [],
    quantity: 100,
    unit: 'db',
    isOrganic: true,
    location: {
      cityId: 'kecskemet',
      cityName: 'Kecskemét',
      constituencyId: 'OEVK-01',
      constituencyName: 'Bács-Kiskun 1.'
    },
    deliveryOptions: ['pickup'],
    createdAt: '2024-12-05T06:00:00Z',
    updatedAt: '2024-12-05T06:00:00Z',
    expiresAt: '2024-12-12T23:59:59Z',
    viewCount: 89,
    favoriteCount: 15,
    inquiryCount: 6
  },
  {
    id: 'listing-007',
    seller: MOCK_SELLERS[4],
    title: 'Friss tehéntej',
    description: 'Saját tehénből, naponta frissen fejve. Pasztörizálatlan, nyers tej. Sajtnak, túrónak kiváló.',
    category: 'eggs_dairy',
    type: 'sell',
    status: 'active',
    price: 400,
    currency: 'HUF',
    images: [],
    quantity: 20,
    unit: 'l',
    isOrganic: false,
    location: {
      cityId: 'szeged',
      cityName: 'Szeged',
      constituencyId: 'OEVK-02',
      constituencyName: 'Csongrád 1.'
    },
    deliveryOptions: ['pickup'],
    createdAt: '2024-12-06T05:30:00Z',
    updatedAt: '2024-12-06T05:30:00Z',
    expiresAt: '2024-12-08T23:59:59Z',
    viewCount: 34,
    favoriteCount: 5,
    inquiryCount: 2
  },

  // Méz
  {
    id: 'listing-008',
    seller: MOCK_SELLERS[3],
    title: 'Akácméz 2024',
    description: 'Idei gyűjtésű, tiszta akácméz. Világos, folyékony állagú. 1 kg-os üvegekben.',
    category: 'honey',
    type: 'sell',
    status: 'active',
    price: 4500,
    currency: 'HUF',
    images: [],
    quantity: 30,
    unit: 'üveg',
    isOrganic: true,
    location: {
      cityId: 'kecskemet',
      cityName: 'Kecskemét',
      constituencyId: 'OEVK-01',
      constituencyName: 'Bács-Kiskun 1.'
    },
    deliveryOptions: ['pickup', 'local_delivery', 'shipping'],
    createdAt: '2024-11-15T10:00:00Z',
    updatedAt: '2024-11-15T10:00:00Z',
    expiresAt: '2025-06-30T23:59:59Z',
    viewCount: 312,
    favoriteCount: 56,
    inquiryCount: 18
  },
  {
    id: 'listing-009',
    seller: MOCK_SELLERS[3],
    title: 'Vegyes virágméz',
    description: 'Keverék méz, erős ízvilág. Süteményekhez, teához kiváló. 0.5 kg-os üvegek.',
    category: 'honey',
    type: 'sell',
    status: 'active',
    price: 2000,
    currency: 'HUF',
    images: [],
    quantity: 45,
    unit: 'üveg',
    isOrganic: true,
    location: {
      cityId: 'kecskemet',
      cityName: 'Kecskemét',
      constituencyId: 'OEVK-01',
      constituencyName: 'Bács-Kiskun 1.'
    },
    deliveryOptions: ['pickup', 'shipping'],
    createdAt: '2024-11-15T10:30:00Z',
    updatedAt: '2024-11-15T10:30:00Z',
    expiresAt: '2025-06-30T23:59:59Z',
    viewCount: 198,
    favoriteCount: 28,
    inquiryCount: 9
  },

  // Növények, palánták
  {
    id: 'listing-010',
    seller: MOCK_SELLERS[7],
    title: 'Eper palánták - tavaszi',
    description: 'Erős, termő eperpalánták. Cambridge Favourite és Honeoye fajták. Jövő tavaszra előjegyezhető.',
    category: 'plants',
    type: 'sell',
    status: 'active',
    price: 300,
    currency: 'HUF',
    images: [],
    quantity: 200,
    unit: 'db',
    isOrganic: true,
    location: {
      cityId: 'kiskunfelegyhaza',
      cityName: 'Kiskunfélegyháza',
      constituencyId: 'OEVK-01',
      constituencyName: 'Bács-Kiskun 1.'
    },
    deliveryOptions: ['pickup'],
    createdAt: '2024-12-01T09:00:00Z',
    updatedAt: '2024-12-01T09:00:00Z',
    expiresAt: '2025-04-30T23:59:59Z',
    viewCount: 145,
    favoriteCount: 32,
    inquiryCount: 14
  },

  // Használt cikkek
  {
    id: 'listing-011',
    seller: MOCK_SELLERS[6],
    title: 'Kerti asztal + 4 szék',
    description: 'Fém kerti bútor garnitúra. Használt, de jó állapotú. Párnák nélkül.',
    category: 'secondhand',
    type: 'sell',
    status: 'active',
    price: 25000,
    currency: 'HUF',
    images: [],
    quantity: 1,
    unit: 'db',
    location: {
      cityId: 'szeged',
      cityName: 'Szeged',
      constituencyId: 'OEVK-02',
      constituencyName: 'Csongrád 1.'
    },
    deliveryOptions: ['pickup'],
    createdAt: '2024-12-04T14:00:00Z',
    updatedAt: '2024-12-04T14:00:00Z',
    expiresAt: '2025-01-04T23:59:59Z',
    viewCount: 78,
    favoriteCount: 6,
    inquiryCount: 3
  },
  {
    id: 'listing-012',
    seller: MOCK_SELLERS[1],
    title: 'Gyerek bicikli (16")',
    description: 'Használt, de kiváló állapotú gyerek kerékpár. 4-7 éves korig ideális. Támasztó kerekek mellékelve.',
    category: 'secondhand',
    type: 'give_away',
    status: 'active',
    images: [],
    quantity: 1,
    unit: 'db',
    location: {
      cityId: 'kiskunfelegyhaza',
      cityName: 'Kiskunfélegyháza',
      constituencyId: 'OEVK-01',
      constituencyName: 'Bács-Kiskun 1.'
    },
    deliveryOptions: ['pickup'],
    createdAt: '2024-12-05T11:00:00Z',
    updatedAt: '2024-12-05T11:00:00Z',
    expiresAt: '2024-12-20T23:59:59Z',
    viewCount: 234,
    favoriteCount: 45,
    inquiryCount: 12
  },

  // Csere típusú hirdetés
  {
    id: 'listing-013',
    seller: MOCK_SELLERS[2],
    title: 'Dió - cserélném almára',
    description: 'Idei termésű, házi dió. Almára vagy körtére cserélném, kg-ra kg.',
    category: 'garden_produce',
    type: 'trade',
    status: 'active',
    tradeFor: 'Alma vagy körte',
    images: [],
    quantity: 20,
    unit: 'kg',
    isOrganic: true,
    harvestDate: '2024-10-01',
    location: {
      cityId: 'szeged',
      cityName: 'Szeged',
      constituencyId: 'OEVK-02',
      constituencyName: 'Csongrád 1.'
    },
    deliveryOptions: ['pickup'],
    createdAt: '2024-12-02T15:00:00Z',
    updatedAt: '2024-12-02T15:00:00Z',
    expiresAt: '2024-12-31T23:59:59Z',
    viewCount: 56,
    favoriteCount: 8,
    inquiryCount: 4
  },

  // Szolgáltatás
  {
    id: 'listing-014',
    seller: MOCK_SELLERS[4],
    title: 'Gyümölcsfa metszés',
    description: 'Szakszerű gyümölcsfa metszést vállalok. 15 év tapasztalat. Almafa, körtefa, szilvafa, cseresznyefa.',
    category: 'services',
    type: 'sell',
    status: 'active',
    price: 3000,
    currency: 'HUF',
    images: [],
    quantity: 20,
    unit: 'óra',
    location: {
      cityId: 'szeged',
      cityName: 'Szeged',
      constituencyId: 'OEVK-02',
      constituencyName: 'Csongrád 1.'
    },
    deliveryOptions: ['local_delivery'],
    createdAt: '2024-11-28T08:00:00Z',
    updatedAt: '2024-11-28T08:00:00Z',
    expiresAt: '2025-03-31T23:59:59Z',
    viewCount: 123,
    favoriteCount: 18,
    inquiryCount: 7
  },

  // Szerszám
  {
    id: 'listing-015',
    seller: MOCK_SELLERS[6],
    title: 'Rotációs kapa',
    description: 'Elektromos rotációs kapa, 1400W. Alig használt, 2 éve vásárolt. Garanciával.',
    category: 'tools',
    type: 'sell',
    status: 'active',
    price: 45000,
    currency: 'HUF',
    images: [],
    quantity: 1,
    unit: 'db',
    location: {
      cityId: 'kecskemet',
      cityName: 'Kecskemét',
      constituencyId: 'OEVK-01',
      constituencyName: 'Bács-Kiskun 1.'
    },
    deliveryOptions: ['pickup'],
    createdAt: '2024-12-03T16:00:00Z',
    updatedAt: '2024-12-03T16:00:00Z',
    expiresAt: '2025-01-15T23:59:59Z',
    viewCount: 89,
    favoriteCount: 12,
    inquiryCount: 5
  },

  // Gyermekfelügyelet
  {
    id: 'listing-016',
    seller: MOCK_SELLERS[1],
    title: 'Gyermekfelügyelet hétvégén',
    description: 'Tapasztalt óvónő vállal gyermekfelügyeletet hétvégén és ünnepnapokon. 2-10 éves korig. Játékos foglalkozások, kreatív tevékenységek.',
    category: 'childcare',
    type: 'sell',
    status: 'active',
    price: 2500,
    currency: 'HUF',
    images: [],
    quantity: 8,
    unit: 'óra',
    location: {
      cityId: 'kecskemet',
      cityName: 'Kecskemét',
      constituencyId: 'OEVK-01',
      constituencyName: 'Bács-Kiskun 1.'
    },
    deliveryOptions: ['local_delivery'],
    createdAt: '2024-12-04T09:00:00Z',
    updatedAt: '2024-12-04T09:00:00Z',
    expiresAt: '2025-02-28T23:59:59Z',
    viewCount: 234,
    favoriteCount: 45,
    inquiryCount: 12
  },
  {
    id: 'listing-017',
    seller: MOCK_SELLERS[5],
    title: 'Bébiszitter szolgáltatás',
    description: 'Megbízható bébiszitter, 5 év tapasztalattal. Esténként és hétvégén elérhető. Elsősegélynyújtó tanfolyammal rendelkezem.',
    category: 'childcare',
    type: 'sell',
    status: 'active',
    price: 2000,
    currency: 'HUF',
    images: [],
    quantity: 20,
    unit: 'óra',
    location: {
      cityId: 'szeged',
      cityName: 'Szeged',
      constituencyId: 'OEVK-02',
      constituencyName: 'Csongrád 1.'
    },
    deliveryOptions: ['local_delivery'],
    createdAt: '2024-12-03T14:00:00Z',
    updatedAt: '2024-12-03T14:00:00Z',
    expiresAt: '2025-03-31T23:59:59Z',
    viewCount: 178,
    favoriteCount: 32,
    inquiryCount: 9
  },

  // Magánórák
  {
    id: 'listing-018',
    seller: MOCK_SELLERS[2],
    title: 'Matematika korrepetálás',
    description: 'Általános és középiskolás tanulóknak vállalok matematika korrepetálást. Érettségire felkészítés. 10 év tanítási tapasztalat.',
    category: 'tutoring',
    type: 'sell',
    status: 'active',
    price: 4000,
    currency: 'HUF',
    images: [],
    quantity: 10,
    unit: 'óra',
    location: {
      cityId: 'kecskemet',
      cityName: 'Kecskemét',
      constituencyId: 'OEVK-01',
      constituencyName: 'Bács-Kiskun 1.'
    },
    deliveryOptions: ['pickup', 'local_delivery'],
    createdAt: '2024-12-01T11:00:00Z',
    updatedAt: '2024-12-01T11:00:00Z',
    expiresAt: '2025-06-30T23:59:59Z',
    viewCount: 312,
    favoriteCount: 56,
    inquiryCount: 18
  },
  {
    id: 'listing-019',
    seller: MOCK_SELLERS[3],
    title: 'Angol nyelvoktatás',
    description: 'Angol nyelvtanár vállal magánórákat kezdő és haladó szinten. Nyelvvizsga felkészítés, üzleti angol. Online óra is lehetséges.',
    category: 'tutoring',
    type: 'sell',
    status: 'active',
    price: 5000,
    currency: 'HUF',
    images: [],
    quantity: 15,
    unit: 'óra',
    location: {
      cityId: 'kiskunfelegyhaza',
      cityName: 'Kiskunfélegyháza',
      constituencyId: 'OEVK-01',
      constituencyName: 'Bács-Kiskun 1.'
    },
    deliveryOptions: ['pickup', 'local_delivery'],
    createdAt: '2024-11-25T10:00:00Z',
    updatedAt: '2024-11-25T10:00:00Z',
    expiresAt: '2025-05-31T23:59:59Z',
    viewCount: 267,
    favoriteCount: 41,
    inquiryCount: 15
  },
  {
    id: 'listing-020',
    seller: MOCK_SELLERS[6],
    title: 'Zeneoktatás - gitár és zongora',
    description: 'Konzervatóriumot végzett zenész vállal gitár és zongora oktatást. Minden korosztály számára, kezdőtől haladóig.',
    category: 'tutoring',
    type: 'sell',
    status: 'active',
    price: 4500,
    currency: 'HUF',
    images: [],
    quantity: 12,
    unit: 'óra',
    location: {
      cityId: 'szeged',
      cityName: 'Szeged',
      constituencyId: 'OEVK-02',
      constituencyName: 'Csongrád 1.'
    },
    deliveryOptions: ['pickup'],
    createdAt: '2024-12-02T15:00:00Z',
    updatedAt: '2024-12-02T15:00:00Z',
    expiresAt: '2025-04-30T23:59:59Z',
    viewCount: 145,
    favoriteCount: 28,
    inquiryCount: 8
  }
];

// ============================================================================
// MOCK TRANZAKCIÓK
// ============================================================================

export const MOCK_TRANSACTIONS: MarketplaceTransaction[] = [
  {
    id: 'trans-001',
    listingId: 'listing-old-001',
    sellerId: 'user-001',
    buyerId: 'user-003',
    type: 'sell',
    category: 'garden_produce',
    amount: 2400,
    currency: 'HUF',
    quantity: 3,
    unit: 'kg',
    completedAt: '2024-12-01T14:30:00Z',
    rating: 5,
    review: 'Kiváló minőségű paradicsom, nagyon finom!',
    location: { cityId: 'kecskemet', cityName: 'Kecskemét', constituencyId: 'OEVK-01' }
  },
  {
    id: 'trans-002',
    listingId: 'listing-old-002',
    sellerId: 'user-002',
    buyerId: 'user-005',
    type: 'sell',
    category: 'homemade_goods',
    amount: 4500,
    currency: 'HUF',
    quantity: 3,
    unit: 'üveg',
    completedAt: '2024-12-02T10:00:00Z',
    rating: 5,
    review: 'A legjobb lekvár amit valaha ettem!',
    location: { cityId: 'kiskunfelegyhaza', cityName: 'Kiskunfélegyháza', constituencyId: 'OEVK-01' }
  },
  {
    id: 'trans-003',
    listingId: 'listing-old-003',
    sellerId: 'user-004',
    buyerId: 'user-001',
    type: 'sell',
    category: 'honey',
    amount: 9000,
    currency: 'HUF',
    quantity: 2,
    unit: 'üveg',
    completedAt: '2024-12-03T16:00:00Z',
    rating: 5,
    review: 'Tiszta, finom akácméz. Ajánlom!',
    location: { cityId: 'kecskemet', cityName: 'Kecskemét', constituencyId: 'OEVK-01' }
  },
  {
    id: 'trans-004',
    listingId: 'listing-old-004',
    sellerId: 'user-008',
    buyerId: 'user-006',
    type: 'trade',
    category: 'garden_produce',
    quantity: 5,
    unit: 'kg',
    completedAt: '2024-12-04T11:00:00Z',
    rating: 4,
    review: 'Jó csere volt, a dió nagyon finom.',
    location: { cityId: 'kiskunfelegyhaza', cityName: 'Kiskunfélegyháza', constituencyId: 'OEVK-01' }
  },
  {
    id: 'trans-005',
    listingId: 'listing-old-005',
    sellerId: 'user-001',
    buyerId: 'user-007',
    type: 'sell',
    category: 'eggs_dairy',
    amount: 3000,
    currency: 'HUF',
    quantity: 30,
    unit: 'db',
    completedAt: '2024-12-05T08:30:00Z',
    rating: 5,
    review: 'Friss, finom tojás. Rendszeres vevő leszek!',
    location: { cityId: 'kecskemet', cityName: 'Kecskemét', constituencyId: 'OEVK-01' }
  },
  {
    id: 'trans-006',
    listingId: 'listing-old-006',
    sellerId: 'user-002',
    buyerId: 'user-004',
    type: 'give_away',
    category: 'secondhand',
    quantity: 1,
    unit: 'db',
    completedAt: '2024-12-05T15:00:00Z',
    rating: 5,
    review: 'Köszönjük szépen, a gyerek nagyon örült!',
    location: { cityId: 'kiskunfelegyhaza', cityName: 'Kiskunfélegyháza', constituencyId: 'OEVK-01' }
  },
  {
    id: 'trans-007',
    listingId: 'listing-old-007',
    sellerId: 'user-003',
    buyerId: 'user-008',
    type: 'sell',
    category: 'garden_produce',
    amount: 4000,
    currency: 'HUF',
    quantity: 10,
    unit: 'kg',
    completedAt: '2024-12-06T09:00:00Z',
    rating: 4,
    review: 'Finom almák, köszi!',
    location: { cityId: 'szeged', cityName: 'Szeged', constituencyId: 'OEVK-02' }
  }
];

// ============================================================================
// NAPI AKTIVITÁS GENERÁLÁSA
// ============================================================================

function generateDailyActivity(days: number, baseListings: number, baseTransactions: number): DailyMarketActivity[] {
  const result: DailyMarketActivity[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Hétvégén több aktivitás
    const dayOfWeek = date.getDay();
    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.5 : 1;
    
    // Véletlenszerű variáció
    const variation = 0.7 + Math.random() * 0.6;
    
    result.push({
      date: date.toISOString().split('T')[0],
      newListings: Math.round(baseListings * weekendMultiplier * variation),
      transactions: Math.round(baseTransactions * weekendMultiplier * variation),
      activeUsers: Math.round((baseListings + baseTransactions) * 2 * weekendMultiplier * variation)
    });
  }
  
  return result;
}

// ============================================================================
// SZEZONÁLIS TERMÉKEK
// ============================================================================

const SEASONAL_PRODUCTS: SeasonalProduct[] = [
  { name: 'Paradicsom', category: 'garden_produce', availableFrom: '06', availableTo: '10', currentAvailability: 'out_of_season', listingCount: 3 },
  { name: 'Paprika', category: 'garden_produce', availableFrom: '06', availableTo: '10', currentAvailability: 'out_of_season', listingCount: 2 },
  { name: 'Alma', category: 'garden_produce', availableFrom: '08', availableTo: '02', currentAvailability: 'in_season', listingCount: 8 },
  { name: 'Dió', category: 'garden_produce', availableFrom: '09', availableTo: '12', currentAvailability: 'ending_soon', listingCount: 5 },
  { name: 'Savanyú káposzta', category: 'homemade_goods', availableFrom: '10', availableTo: '03', currentAvailability: 'in_season', listingCount: 12 },
  { name: 'Szilvalekvár', category: 'homemade_goods', availableFrom: '08', availableTo: '12', currentAvailability: 'in_season', listingCount: 7 },
  { name: 'Akácméz', category: 'honey', availableFrom: '05', availableTo: '12', currentAvailability: 'in_season', listingCount: 15 },
  { name: 'Házi tojás', category: 'eggs_dairy', availableFrom: '01', availableTo: '12', currentAvailability: 'in_season', listingCount: 20 },
  { name: 'Eper palánta', category: 'plants', availableFrom: '03', availableTo: '05', currentAvailability: 'out_of_season', listingCount: 4 }
];

// ============================================================================
// VÁROS STATISZTIKÁK
// ============================================================================

export const MOCK_CITY_STATS: CityMarketStats[] = [
  {
    cityId: 'kecskemet',
    cityName: 'Kecskemét',
    constituencyId: 'OEVK-01',
    activeListings: 45,
    totalSellers: 28,
    totalBuyers: 156,
    weeklyNewListings: 12,
    weeklyTransactions: 34,
    monthlyTransactions: 145,
    topCategories: [
      { category: 'garden_produce', categoryLabel: 'Kerti termények', listingCount: 15, transactionCount: 45, percentageOfTotal: 33 },
      { category: 'honey', categoryLabel: 'Méz, méhészet', listingCount: 8, transactionCount: 23, percentageOfTotal: 18 },
      { category: 'eggs_dairy', categoryLabel: 'Tojás, tejtermékek', listingCount: 7, transactionCount: 28, percentageOfTotal: 16 },
      { category: 'homemade_goods', categoryLabel: 'Házi készítésű', listingCount: 6, transactionCount: 18, percentageOfTotal: 13 },
      { category: 'secondhand', categoryLabel: 'Használt cikkek', listingCount: 5, transactionCount: 8, percentageOfTotal: 11 }
    ],
    activityTrend: generateDailyActivity(30, 3, 5),
    seasonalProducts: SEASONAL_PRODUCTS.filter(p => ['garden_produce', 'honey', 'eggs_dairy'].includes(p.category))
  },
  {
    cityId: 'kiskunfelegyhaza',
    cityName: 'Kiskunfélegyháza',
    constituencyId: 'OEVK-01',
    activeListings: 32,
    totalSellers: 19,
    totalBuyers: 89,
    weeklyNewListings: 8,
    weeklyTransactions: 21,
    monthlyTransactions: 87,
    topCategories: [
      { category: 'garden_produce', categoryLabel: 'Kerti termények', listingCount: 12, transactionCount: 32, percentageOfTotal: 38 },
      { category: 'homemade_goods', categoryLabel: 'Házi készítésű', listingCount: 8, transactionCount: 24, percentageOfTotal: 25 },
      { category: 'plants', categoryLabel: 'Növények, palánták', listingCount: 5, transactionCount: 12, percentageOfTotal: 16 },
      { category: 'eggs_dairy', categoryLabel: 'Tojás, tejtermékek', listingCount: 4, transactionCount: 11, percentageOfTotal: 13 }
    ],
    activityTrend: generateDailyActivity(30, 2, 3),
    seasonalProducts: SEASONAL_PRODUCTS.filter(p => ['garden_produce', 'homemade_goods', 'plants'].includes(p.category))
  },
  {
    cityId: 'szeged',
    cityName: 'Szeged',
    constituencyId: 'OEVK-02',
    activeListings: 67,
    totalSellers: 42,
    totalBuyers: 234,
    weeklyNewListings: 18,
    weeklyTransactions: 52,
    monthlyTransactions: 215,
    topCategories: [
      { category: 'garden_produce', categoryLabel: 'Kerti termények', listingCount: 22, transactionCount: 68, percentageOfTotal: 33 },
      { category: 'secondhand', categoryLabel: 'Használt cikkek', listingCount: 15, transactionCount: 34, percentageOfTotal: 22 },
      { category: 'services', categoryLabel: 'Szolgáltatások', listingCount: 10, transactionCount: 28, percentageOfTotal: 15 },
      { category: 'tools', categoryLabel: 'Szerszámok, gépek', listingCount: 8, transactionCount: 15, percentageOfTotal: 12 },
      { category: 'homemade_goods', categoryLabel: 'Házi készítésű', listingCount: 7, transactionCount: 22, percentageOfTotal: 10 }
    ],
    activityTrend: generateDailyActivity(30, 5, 8),
    seasonalProducts: SEASONAL_PRODUCTS
  },
  {
    cityId: 'hodmezovasarhely',
    cityName: 'Hódmezővásárhely',
    constituencyId: 'OEVK-02',
    activeListings: 28,
    totalSellers: 16,
    totalBuyers: 78,
    weeklyNewListings: 6,
    weeklyTransactions: 15,
    monthlyTransactions: 62,
    topCategories: [
      { category: 'garden_produce', categoryLabel: 'Kerti termények', listingCount: 10, transactionCount: 25, percentageOfTotal: 36 },
      { category: 'meat', categoryLabel: 'Hús, baromfi', listingCount: 6, transactionCount: 14, percentageOfTotal: 21 },
      { category: 'eggs_dairy', categoryLabel: 'Tojás, tejtermékek', listingCount: 5, transactionCount: 12, percentageOfTotal: 18 },
      { category: 'honey', categoryLabel: 'Méz, méhészet', listingCount: 4, transactionCount: 8, percentageOfTotal: 14 }
    ],
    activityTrend: generateDailyActivity(30, 2, 2),
    seasonalProducts: SEASONAL_PRODUCTS.filter(p => ['garden_produce', 'meat', 'eggs_dairy', 'honey'].includes(p.category))
  }
];

// ============================================================================
// KÖRZETI STATISZTIKÁK
// ============================================================================

export const MOCK_CONSTITUENCY_STATS: ConstituencyMarketStats[] = [
  {
    constituencyId: 'OEVK-01',
    constituencyName: 'Bács-Kiskun 1.',
    totalCities: 2,
    totalActiveListings: 77,
    totalWeeklyTransactions: 55,
    cityRanking: [
      { cityId: 'kecskemet', cityName: 'Kecskemét', activeListings: 45, weeklyTransactions: 34, activityScore: 89 },
      { cityId: 'kiskunfelegyhaza', cityName: 'Kiskunfélegyháza', activeListings: 32, weeklyTransactions: 21, activityScore: 72 }
    ],
    weeklyTrend: generateDailyActivity(7, 5, 8)
  },
  {
    constituencyId: 'OEVK-02',
    constituencyName: 'Csongrád 1.',
    totalCities: 2,
    totalActiveListings: 95,
    totalWeeklyTransactions: 67,
    cityRanking: [
      { cityId: 'szeged', cityName: 'Szeged', activeListings: 67, weeklyTransactions: 52, activityScore: 95 },
      { cityId: 'hodmezovasarhely', cityName: 'Hódmezővásárhely', activeListings: 28, weeklyTransactions: 15, activityScore: 58 }
    ],
    weeklyTrend: generateDailyActivity(7, 7, 10)
  }
];

// ============================================================================
// SEGÉDFÜGGVÉNYEK
// ============================================================================

/**
 * Szűrt hirdetések lekérése
 */
export function getFilteredListings(filters: {
  category?: ListingCategory;
  type?: string;
  cityId?: string;
  constituencyId?: string;
  searchQuery?: string;
  status?: string;
}): MarketplaceListing[] {
  let result = [...MOCK_LISTINGS];
  
  if (filters.category) {
    result = result.filter(l => l.category === filters.category);
  }
  
  if (filters.type) {
    result = result.filter(l => l.type === filters.type);
  }
  
  if (filters.cityId) {
    result = result.filter(l => l.location.cityId === filters.cityId);
  }
  
  if (filters.constituencyId) {
    result = result.filter(l => l.location.constituencyId === filters.constituencyId);
  }
  
  if (filters.status) {
    result = result.filter(l => l.status === filters.status);
  }
  
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    result = result.filter(l => 
      l.title.toLowerCase().includes(query) ||
      l.description.toLowerCase().includes(query)
    );
  }
  
  return result;
}

/**
 * Város statisztika lekérése
 */
export function getCityStats(cityId: string): CityMarketStats | undefined {
  return MOCK_CITY_STATS.find(s => s.cityId === cityId);
}

/**
 * Körzeti statisztika lekérése
 */
export function getConstituencyStats(constituencyId: string): ConstituencyMarketStats | undefined {
  return MOCK_CONSTITUENCY_STATS.find(s => s.constituencyId === constituencyId);
}

/**
 * Összes aktív hirdetés száma
 */
export function getTotalActiveListings(): number {
  return MOCK_LISTINGS.filter(l => l.status === 'active').length;
}

/**
 * Heti tranzakciók száma
 */
export function getWeeklyTransactionCount(): number {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return MOCK_TRANSACTIONS.filter(t => 
    new Date(t.completedAt) >= oneWeekAgo
  ).length;
}

/**
 * Kategória összesítés az összes hirdetésből
 */
export function getCategoryBreakdown(): CategoryStat[] {
  const categoryCounts: Record<string, { listings: number; transactions: number }> = {};
  
  // Hirdetések számlálása
  MOCK_LISTINGS.forEach(listing => {
    if (!categoryCounts[listing.category]) {
      categoryCounts[listing.category] = { listings: 0, transactions: 0 };
    }
    categoryCounts[listing.category].listings++;
  });
  
  // Tranzakciók számlálása
  MOCK_TRANSACTIONS.forEach(trans => {
    if (!categoryCounts[trans.category]) {
      categoryCounts[trans.category] = { listings: 0, transactions: 0 };
    }
    categoryCounts[trans.category].transactions++;
  });
  
  const total = Object.values(categoryCounts).reduce((sum, c) => sum + c.listings, 0);
  
  const categoryLabels: Record<string, string> = {
    garden_produce: 'Kerti termények',
    homemade_goods: 'Házi készítésű',
    plants: 'Növények, palánták',
    eggs_dairy: 'Tojás, tejtermékek',
    meat: 'Hús, baromfi',
    honey: 'Méz, méhészet',
    tools: 'Szerszámok, gépek',
    secondhand: 'Használt cikkek',
    clothing: 'Ruházat, textil',
    services: 'Szolgáltatások'
  };
  
  return Object.entries(categoryCounts)
    .map(([category, counts]) => ({
      category: category as ListingCategory,
      categoryLabel: categoryLabels[category] || category,
      listingCount: counts.listings,
      transactionCount: counts.transactions,
      percentageOfTotal: Math.round((counts.listings / total) * 100)
    }))
    .sort((a, b) => b.listingCount - a.listingCount);
}
