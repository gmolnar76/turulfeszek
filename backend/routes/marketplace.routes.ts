/**
 * Marketplace API Routes
 * Express.js routes for community marketplace management
 * 
 * Helyi Piactér - kerti termények, házi készítésű termékek, használt cikkek
 */

import { Router, Request, Response } from 'express';
import type {
  MarketplaceListing,
  MarketplaceTransaction,
  CityMarketStats,
  ConstituencyMarketStats,
  CreateListingRequest,
  UpdateListingRequest,
  ListingsQueryParams,
  ListingsResponse,
  CreateTransactionRequest,
  RateTransactionRequest,
  ListingCategory,
  ListingStatus,
  DailyMarketActivity,
  CategoryStat,
  SeasonalProduct,
  CityMarketSummary
} from '../types/marketplace.types';

const router = Router();

// Simple ID generator
function generateId(): string {
  return 'listing-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function generateTransactionId(): string {
  return 'trans-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// ============================================================================
// IN-MEMORY ADATTÁR (demo célra)
// ============================================================================

const listings = new Map<string, MarketplaceListing>();
const transactions = new Map<string, MarketplaceTransaction>();
const userFavorites = new Map<string, Set<string>>(); // userId -> listingIds

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
// MOCK ADATOK INICIALIZÁLÁSA
// ============================================================================

function initializeMockData(): void {
  const mockListings: MarketplaceListing[] = [
    // Kerti termények
    {
      id: 'listing-001',
      seller: MOCK_SELLERS[0],
      title: 'Friss házi paradicsom',
      description: 'Saját kertben termesztett, permetszermentes paradicsom. Több fajtából válogathat: cherry, húsparadicsom, koktélparadicsom.',
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
      description: 'Saját gyümölcsösből, 50+ éves fákról. Kétféle fajta kapható.',
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
    // Házi készítésű
    {
      id: 'listing-004',
      seller: MOCK_SELLERS[5],
      title: 'Házi szilvalekvár',
      description: 'Hagyományos recept szerint, réz üstben főzve. Csak cukor és szilva.',
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
      description: 'Hagyományos módon, fahordóban erjesztett savanyú káposzta. Élőflórás.',
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
    // Tojás
    {
      id: 'listing-006',
      seller: MOCK_SELLERS[0],
      title: 'Friss házi tojás',
      description: 'Szabadtartású tyúkok tojása. Naponta friss.',
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
    // Méz
    {
      id: 'listing-007',
      seller: MOCK_SELLERS[3],
      title: 'Akácméz 2024',
      description: 'Idei gyűjtésű, tiszta akácméz. 1 kg-os üvegekben.',
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
    // Használt cikk - ingyen
    {
      id: 'listing-008',
      seller: MOCK_SELLERS[1],
      title: 'Gyerek bicikli (16")',
      description: 'Használt, de kiváló állapotú gyerek kerékpár. 4-7 éves korig ideális.',
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
    // Csere
    {
      id: 'listing-009',
      seller: MOCK_SELLERS[2],
      title: 'Dió - cserélném almára',
      description: 'Idei termésű, házi dió. Almára vagy körtére cserélném.',
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
      id: 'listing-010',
      seller: MOCK_SELLERS[4],
      title: 'Gyümölcsfa metszés',
      description: 'Szakszerű gyümölcsfa metszést vállalok. 15 év tapasztalat.',
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
    }
  ];

  // Initialize listings
  mockListings.forEach(listing => {
    listings.set(listing.id, listing);
  });

  // Initialize some transactions
  const mockTransactions: MarketplaceTransaction[] = [
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
      review: 'Kiváló minőségű paradicsom!',
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
      review: 'A legjobb lekvár!',
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
      review: 'Tiszta, finom akácméz!',
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
      review: 'Jó csere volt.',
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
      review: 'Friss, finom tojás!',
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
      review: 'Köszönjük szépen!',
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
      review: 'Finom almák!',
      location: { cityId: 'szeged', cityName: 'Szeged', constituencyId: 'OEVK-02' }
    }
  ];

  mockTransactions.forEach(trans => {
    transactions.set(trans.id, trans);
  });
}

// Initialize on module load
initializeMockData();

// ============================================================================
// HELPER FÜGGVÉNYEK
// ============================================================================

function generateDailyActivity(days: number, baseListings: number, baseTransactions: number): DailyMarketActivity[] {
  const result: DailyMarketActivity[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const dayOfWeek = date.getDay();
    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.5 : 1;
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

function getCategoryStats(): CategoryStat[] {
  const categoryCounts: Record<string, { listings: number; transactions: number }> = {};
  
  listings.forEach(listing => {
    if (!categoryCounts[listing.category]) {
      categoryCounts[listing.category] = { listings: 0, transactions: 0 };
    }
    categoryCounts[listing.category].listings++;
  });
  
  transactions.forEach(trans => {
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
      percentageOfTotal: total > 0 ? Math.round((counts.listings / total) * 100) : 0
    }))
    .sort((a, b) => b.listingCount - a.listingCount);
}

// ============================================================================
// ROUTES - HIRDETÉSEK
// ============================================================================

/**
 * GET /api/marketplace/listings
 * Összes hirdetés lekérése szűrőkkel
 */
router.get('/listings', (req: Request, res: Response) => {
  try {
    const {
      category,
      type,
      status = 'active',
      cityId,
      constituencyId,
      sellerId,
      search,
      minPrice,
      maxPrice,
      isOrganic,
      sortBy = 'newest',
      limit = 50,
      offset = 0
    } = req.query as Record<string, string>;

    let result = Array.from(listings.values());

    // Szűrések
    if (category) {
      result = result.filter(l => l.category === category);
    }
    if (type) {
      result = result.filter(l => l.type === type);
    }
    if (status) {
      result = result.filter(l => l.status === status);
    }
    if (cityId) {
      result = result.filter(l => l.location.cityId === cityId);
    }
    if (constituencyId) {
      result = result.filter(l => l.location.constituencyId === constituencyId);
    }
    if (sellerId) {
      result = result.filter(l => l.seller.userId === sellerId);
    }
    if (search) {
      const query = search.toLowerCase();
      result = result.filter(l =>
        l.title.toLowerCase().includes(query) ||
        l.description.toLowerCase().includes(query)
      );
    }
    if (minPrice) {
      result = result.filter(l => l.price && l.price >= parseInt(minPrice));
    }
    if (maxPrice) {
      result = result.filter(l => l.price && l.price <= parseInt(maxPrice));
    }
    if (isOrganic === 'true') {
      result = result.filter(l => l.isOrganic === true);
    }

    // Rendezés
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_desc':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'popularity':
        result.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = result.length;
    const limitNum = parseInt(limit as string) || 50;
    const offsetNum = parseInt(offset as string) || 0;
    result = result.slice(offsetNum, offsetNum + limitNum);

    const response: ListingsResponse = {
      listings: result,
      total,
      limit: limitNum,
      offset: offsetNum
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

/**
 * GET /api/marketplace/listings/:id
 * Egy hirdetés részletei
 */
router.get('/listings/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const listing = listings.get(id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Növeljük a megtekintések számát
    listing.viewCount++;
    listings.set(id, listing);

    res.json(listing);
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

/**
 * POST /api/marketplace/listings
 * Új hirdetés létrehozása
 */
router.post('/listings', (req: Request, res: Response) => {
  try {
    const body = req.body as CreateListingRequest;
    const userId = req.headers['x-user-id'] as string || 'user-001';
    
    // Eladó adatok lekérése (mock)
    const seller = MOCK_SELLERS.find(s => s.userId === userId) || MOCK_SELLERS[0];
    
    // Város adatok (mock)
    const cityData: Record<string, { cityName: string; constituencyId: string; constituencyName: string }> = {
      'kecskemet': { cityName: 'Kecskemét', constituencyId: 'OEVK-01', constituencyName: 'Bács-Kiskun 1.' },
      'kiskunfelegyhaza': { cityName: 'Kiskunfélegyháza', constituencyId: 'OEVK-01', constituencyName: 'Bács-Kiskun 1.' },
      'szeged': { cityName: 'Szeged', constituencyId: 'OEVK-02', constituencyName: 'Csongrád 1.' },
      'hodmezovasarhely': { cityName: 'Hódmezővásárhely', constituencyId: 'OEVK-02', constituencyName: 'Csongrád 1.' }
    };
    
    const city = cityData[body.cityId] || cityData['kecskemet'];
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + (body.expiresInDays || 30));

    const newListing: MarketplaceListing = {
      id: generateId(),
      seller,
      title: body.title,
      description: body.description,
      category: body.category,
      type: body.type,
      status: 'active',
      price: body.price,
      currency: body.currency,
      tradeFor: body.tradeFor,
      images: body.images || [],
      quantity: body.quantity,
      unit: body.unit,
      isOrganic: body.isOrganic,
      harvestDate: body.harvestDate,
      location: {
        cityId: body.cityId,
        cityName: city.cityName,
        constituencyId: city.constituencyId,
        constituencyName: city.constituencyName
      },
      deliveryOptions: body.deliveryOptions,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      viewCount: 0,
      favoriteCount: 0,
      inquiryCount: 0
    };

    listings.set(newListing.id, newListing);
    res.status(201).json(newListing);
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

/**
 * PATCH /api/marketplace/listings/:id
 * Hirdetés módosítása
 */
router.patch('/listings/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body as UpdateListingRequest;
    const listing = listings.get(id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Frissítés
    if (updates.title) listing.title = updates.title;
    if (updates.description) listing.description = updates.description;
    if (updates.price !== undefined) listing.price = updates.price;
    if (updates.quantity !== undefined) listing.quantity = updates.quantity;
    if (updates.status) listing.status = updates.status;
    if (updates.tradeFor) listing.tradeFor = updates.tradeFor;
    
    listing.updatedAt = new Date().toISOString();
    listings.set(id, listing);

    res.json(listing);
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

/**
 * DELETE /api/marketplace/listings/:id
 * Hirdetés törlése
 */
router.delete('/listings/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!listings.has(id)) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    listings.delete(id);
    res.json({ success: true, message: 'Listing deleted' });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

// ============================================================================
// ROUTES - TRANZAKCIÓK
// ============================================================================

/**
 * POST /api/marketplace/transactions
 * Tranzakció létrehozása (vásárlás/csere)
 */
router.post('/transactions', (req: Request, res: Response) => {
  try {
    const body = req.body as CreateTransactionRequest;
    const buyerId = req.headers['x-user-id'] as string || 'user-003';
    
    const listing = listings.get(body.listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.status !== 'active') {
      return res.status(400).json({ error: 'Listing is not available' });
    }

    const transaction: MarketplaceTransaction = {
      id: generateTransactionId(),
      listingId: listing.id,
      sellerId: listing.seller.userId,
      buyerId,
      type: listing.type,
      category: listing.category,
      amount: listing.price ? listing.price * body.quantity : undefined,
      currency: listing.currency,
      quantity: body.quantity,
      unit: listing.unit,
      completedAt: new Date().toISOString(),
      location: listing.location
    };

    transactions.set(transaction.id, transaction);

    // Mennyiség csökkentése vagy hirdetés lezárása
    listing.quantity -= body.quantity;
    if (listing.quantity <= 0) {
      listing.status = 'sold';
    }
    listing.updatedAt = new Date().toISOString();
    listings.set(listing.id, listing);

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

/**
 * GET /api/marketplace/transactions
 * Tranzakciók listázása
 */
router.get('/transactions', (req: Request, res: Response) => {
  try {
    const { userId, cityId, constituencyId, limit = '50' } = req.query as Record<string, string>;
    
    let result = Array.from(transactions.values());
    
    if (userId) {
      result = result.filter(t => t.sellerId === userId || t.buyerId === userId);
    }
    if (cityId) {
      result = result.filter(t => t.location.cityId === cityId);
    }
    if (constituencyId) {
      result = result.filter(t => t.location.constituencyId === constituencyId);
    }
    
    result.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    result = result.slice(0, parseInt(limit));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * PATCH /api/marketplace/transactions/:id/rate
 * Tranzakció értékelése
 */
router.patch('/transactions/:id/rate', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body as RateTransactionRequest;
    
    const transaction = transactions.get(id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    transaction.rating = rating;
    transaction.review = review;
    transactions.set(id, transaction);

    res.json(transaction);
  } catch (error) {
    console.error('Error rating transaction:', error);
    res.status(500).json({ error: 'Failed to rate transaction' });
  }
});

// ============================================================================
// ROUTES - STATISZTIKÁK
// ============================================================================

/**
 * GET /api/marketplace/stats/city/:cityId
 * Város szintű statisztikák
 */
router.get('/stats/city/:cityId', (req: Request, res: Response) => {
  try {
    const { cityId } = req.params;
    
    const cityListings = Array.from(listings.values()).filter(l => l.location.cityId === cityId);
    const cityTransactions = Array.from(transactions.values()).filter(t => t.location.cityId === cityId);
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const weeklyTransactions = cityTransactions.filter(t => new Date(t.completedAt) >= oneWeekAgo);
    const monthlyTransactions = cityTransactions.filter(t => new Date(t.completedAt) >= oneMonthAgo);
    const weeklyNewListings = cityListings.filter(l => new Date(l.createdAt) >= oneWeekAgo);
    
    const sellers = new Set(cityListings.map(l => l.seller.userId));
    const buyers = new Set(cityTransactions.map(t => t.buyerId));
    
    // Város információ
    const cityNames: Record<string, string> = {
      'kecskemet': 'Kecskemét',
      'kiskunfelegyhaza': 'Kiskunfélegyháza',
      'szeged': 'Szeged',
      'hodmezovasarhely': 'Hódmezővásárhely'
    };
    
    const constituencyIds: Record<string, string> = {
      'kecskemet': 'OEVK-01',
      'kiskunfelegyhaza': 'OEVK-01',
      'szeged': 'OEVK-02',
      'hodmezovasarhely': 'OEVK-02'
    };

    const stats: CityMarketStats = {
      cityId,
      cityName: cityNames[cityId] || cityId,
      constituencyId: constituencyIds[cityId] || 'OEVK-01',
      activeListings: cityListings.filter(l => l.status === 'active').length,
      totalSellers: sellers.size,
      totalBuyers: buyers.size,
      weeklyNewListings: weeklyNewListings.length,
      weeklyTransactions: weeklyTransactions.length,
      monthlyTransactions: monthlyTransactions.length,
      topCategories: getCategoryStats().slice(0, 5),
      activityTrend: generateDailyActivity(30, 3, 5),
      seasonalProducts: [
        { name: 'Alma', category: 'garden_produce', availableFrom: '08', availableTo: '02', currentAvailability: 'in_season', listingCount: 8 },
        { name: 'Savanyú káposzta', category: 'homemade_goods', availableFrom: '10', availableTo: '03', currentAvailability: 'in_season', listingCount: 12 },
        { name: 'Akácméz', category: 'honey', availableFrom: '05', availableTo: '12', currentAvailability: 'in_season', listingCount: 15 }
      ]
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching city stats:', error);
    res.status(500).json({ error: 'Failed to fetch city stats' });
  }
});

/**
 * GET /api/marketplace/stats/constituency/:constituencyId
 * Körzeti statisztikák
 */
router.get('/stats/constituency/:constituencyId', (req: Request, res: Response) => {
  try {
    const { constituencyId } = req.params;
    
    const constituencyListings = Array.from(listings.values())
      .filter(l => l.location.constituencyId === constituencyId);
    const constituencyTransactions = Array.from(transactions.values())
      .filter(t => t.location.constituencyId === constituencyId);
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyTransactions = constituencyTransactions.filter(t => new Date(t.completedAt) >= oneWeekAgo);
    
    // Városok összesítése
    const cityStats: Record<string, { listings: number; transactions: number }> = {};
    constituencyListings.forEach(l => {
      if (!cityStats[l.location.cityId]) {
        cityStats[l.location.cityId] = { listings: 0, transactions: 0 };
      }
      cityStats[l.location.cityId].listings++;
    });
    constituencyTransactions.forEach(t => {
      if (!cityStats[t.location.cityId]) {
        cityStats[t.location.cityId] = { listings: 0, transactions: 0 };
      }
      cityStats[t.location.cityId].transactions++;
    });
    
    const cityNames: Record<string, string> = {
      'kecskemet': 'Kecskemét',
      'kiskunfelegyhaza': 'Kiskunfélegyháza',
      'szeged': 'Szeged',
      'hodmezovasarhely': 'Hódmezővásárhely'
    };
    
    const constituencyNames: Record<string, string> = {
      'OEVK-01': 'Bács-Kiskun 1.',
      'OEVK-02': 'Csongrád 1.'
    };
    
    const cityRanking: CityMarketSummary[] = Object.entries(cityStats)
      .map(([cityId, stats]) => ({
        cityId,
        cityName: cityNames[cityId] || cityId,
        activeListings: stats.listings,
        weeklyTransactions: stats.transactions,
        activityScore: stats.listings * 2 + stats.transactions * 3
      }))
      .sort((a, b) => b.activityScore - a.activityScore);

    const stats: ConstituencyMarketStats = {
      constituencyId,
      constituencyName: constituencyNames[constituencyId] || constituencyId,
      totalCities: Object.keys(cityStats).length,
      totalActiveListings: constituencyListings.filter(l => l.status === 'active').length,
      totalWeeklyTransactions: weeklyTransactions.length,
      cityRanking,
      weeklyTrend: generateDailyActivity(7, 5, 8)
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching constituency stats:', error);
    res.status(500).json({ error: 'Failed to fetch constituency stats' });
  }
});

/**
 * GET /api/marketplace/stats/overview
 * Összesített piactér statisztikák
 */
router.get('/stats/overview', (req: Request, res: Response) => {
  try {
    const allListings = Array.from(listings.values());
    const allTransactions = Array.from(transactions.values());
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const weeklyTransactions = allTransactions.filter(t => new Date(t.completedAt) >= oneWeekAgo);
    const monthlyTransactions = allTransactions.filter(t => new Date(t.completedAt) >= oneMonthAgo);
    
    const sellers = new Set(allListings.map(l => l.seller.userId));
    const buyers = new Set(allTransactions.map(t => t.buyerId));

    res.json({
      totalActiveListings: allListings.filter(l => l.status === 'active').length,
      totalSellers: sellers.size,
      totalBuyers: buyers.size,
      weeklyTransactions: weeklyTransactions.length,
      monthlyTransactions: monthlyTransactions.length,
      topCategories: getCategoryStats().slice(0, 5),
      activityTrend: generateDailyActivity(30, 8, 12),
      averageRating: 4.6
    });
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    res.status(500).json({ error: 'Failed to fetch overview stats' });
  }
});

/**
 * GET /api/marketplace/categories
 * Kategóriák listája statisztikákkal
 */
router.get('/categories', (req: Request, res: Response) => {
  try {
    res.json(getCategoryStats());
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;
