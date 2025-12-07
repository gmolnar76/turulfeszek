// Marketplace / Helyi Piactér típusdefiníciók

/**
 * Hirdetés kategóriák
 */
export type ListingCategory = 
  | 'garden_produce'    // Kerti termények (zöldség, gyümölcs)
  | 'homemade_goods'    // Házi készítésű termékek (lekvár, befőtt, sütemény)
  | 'plants'            // Növények, palánták, magok
  | 'eggs_dairy'        // Tojás, tejtermékek
  | 'meat'              // Hús, baromfi
  | 'honey'             // Méz, méhészeti termékek
  | 'tools'             // Kerti szerszámok, gépek
  | 'secondhand'        // Használt cikkek, bútorok
  | 'clothing'          // Ruházat, textil
  | 'services'          // Szolgáltatások (kertrrendezés, favágás, stb.)
  | 'childcare'         // Gyermekfelügyelet, bébiszitter
  | 'tutoring';         // Magánórák, korrepetálás

/**
 * Hirdetés típusa
 */
export type ListingType = 
  | 'sell'              // Eladás (HUF vagy pont)
  | 'trade'             // Csere más termékre
  | 'give_away';        // Ingyen elvihető

/**
 * Hirdetés állapota
 */
export type ListingStatus = 
  | 'active'            // Aktív, elérhető
  | 'reserved'          // Lefoglalva
  | 'sold'              // Elkelt/elcserélve
  | 'expired';          // Lejárt

/**
 * Mértékegységek
 */
export type ListingUnit = 
  | 'kg' | 'g' | 'dkg'           // Súly
  | 'l' | 'dl' | 'ml'            // Űrmérték
  | 'db'                          // Darab
  | 'csomag' | 'doboz' | 'zsák'  // Csomagolás
  | 'üveg' | 'köteg' | 'tálca'   // Speciális
  | 'óra' | 'alkalom';           // Szolgáltatásokhoz

/**
 * Pénznem típus
 */
export type ListingCurrency = 'HUF' | 'turul_pont';

/**
 * Helyszín információ
 */
export interface ListingLocation {
  cityId: string;
  cityName: string;
  constituencyId?: string;      // OEVK azonosító
  constituencyName?: string;
  coordinates?: [number, number]; // [lat, lng]
}

/**
 * Eladó információ
 */
export interface SellerInfo {
  userId: string;
  userName: string;
  avatarUrl?: string;
  trustLevel: number;           // 0-5, jelvények alapján
  memberSince: string;          // ISO date
  completedTransactions: number;
  rating: number;               // 1-5
  badges: string[];             // Jelvény azonosítók
}

/**
 * Piactéri hirdetés
 */
export interface MarketplaceListing {
  id: string;
  
  // Eladó adatok
  seller: SellerInfo;
  
  // Hirdetés alapadatok
  title: string;
  description: string;
  category: ListingCategory;
  type: ListingType;
  status: ListingStatus;
  
  // Ár/csere információ
  price?: number;               // null ha csere vagy ingyen
  currency?: ListingCurrency;
  tradeFor?: string;            // Mit kér cserébe
  
  // Termék részletek
  images: string[];
  quantity: number;
  unit: ListingUnit;
  isOrganic?: boolean;          // Bio/permetszermentes
  harvestDate?: string;         // Szüret/készítés dátuma
  
  // Helyszín
  location: ListingLocation;
  deliveryOptions: DeliveryOption[];
  
  // Időbélyegek
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  
  // Statisztika
  viewCount: number;
  favoriteCount: number;
  inquiryCount: number;
}

/**
 * Szállítási/átvételi opciók
 */
export type DeliveryOption = 
  | 'pickup'            // Személyes átvétel
  | 'local_delivery'    // Helyi kiszállítás
  | 'shipping';         // Postai szállítás

/**
 * Tranzakció (sikeres adás-vétel)
 */
export interface MarketplaceTransaction {
  id: string;
  listingId: string;
  sellerId: string;
  buyerId: string;
  
  type: ListingType;
  category: ListingCategory;
  
  amount?: number;
  currency?: ListingCurrency;
  quantity: number;
  unit: ListingUnit;
  
  completedAt: string;
  rating?: number;              // Vevő értékelése
  review?: string;
  
  location: ListingLocation;
}

/**
 * Városszintű piactér statisztika
 */
export interface CityMarketStats {
  cityId: string;
  cityName: string;
  constituencyId: string;
  
  // Összesített adatok
  activeListings: number;
  totalSellers: number;
  totalBuyers: number;
  
  // Heti/havi aktivitás
  weeklyNewListings: number;
  weeklyTransactions: number;
  monthlyTransactions: number;
  
  // Top kategóriák
  topCategories: CategoryStat[];
  
  // Aktivitási trend (utolsó 30 nap)
  activityTrend: DailyMarketActivity[];
  
  // Szezonális termékek
  seasonalProducts: SeasonalProduct[];
}

/**
 * Kategória statisztika
 */
export interface CategoryStat {
  category: ListingCategory;
  categoryLabel: string;        // Magyar név
  listingCount: number;
  transactionCount: number;
  percentageOfTotal: number;
}

/**
 * Napi piactér aktivitás
 */
export interface DailyMarketActivity {
  date: string;                 // ISO date
  newListings: number;
  transactions: number;
  activeUsers: number;
}

/**
 * Szezonális termék
 */
export interface SeasonalProduct {
  name: string;
  category: ListingCategory;
  availableFrom: string;        // Hónap (01-12)
  availableTo: string;
  currentAvailability: 'in_season' | 'ending_soon' | 'out_of_season';
  listingCount: number;
}

/**
 * Körzeti (OEVK) piactér statisztika
 */
export interface ConstituencyMarketStats {
  constituencyId: string;
  constituencyName: string;
  
  // Aggregált adatok
  totalCities: number;
  totalActiveListings: number;
  totalWeeklyTransactions: number;
  
  // Városok rangsora
  cityRanking: CityMarketSummary[];
  
  // Körzeti trendek
  weeklyTrend: DailyMarketActivity[];
}

/**
 * Város összefoglaló a rangsorhoz
 */
export interface CityMarketSummary {
  cityId: string;
  cityName: string;
  activeListings: number;
  weeklyTransactions: number;
  activityScore: number;        // Számított aktivitási pontszám
}

/**
 * Keresési/szűrési paraméterek
 */
export interface MarketplaceFilters {
  searchQuery?: string;
  categories?: ListingCategory[];
  types?: ListingType[];
  status?: ListingStatus[];
  
  cityId?: string;
  constituencyId?: string;
  maxDistance?: number;         // km-ben
  
  priceMin?: number;
  priceMax?: number;
  currency?: ListingCurrency;
  
  isOrganic?: boolean;
  hasDelivery?: boolean;
  
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'distance' | 'popularity';
}

/**
 * Kategória megjelenítési információ
 */
export const CATEGORY_INFO: Record<ListingCategory, { label: string; emoji: string; color: string }> = {
  garden_produce: { label: 'Kerti termények', emoji: '🥬', color: '#4CAF50' },
  homemade_goods: { label: 'Házi készítésű', emoji: '🫙', color: '#FF9800' },
  plants: { label: 'Növények, palánták', emoji: '🌱', color: '#8BC34A' },
  eggs_dairy: { label: 'Tojás, tejtermékek', emoji: '🥚', color: '#FFC107' },
  meat: { label: 'Hús, baromfi', emoji: '🍖', color: '#F44336' },
  honey: { label: 'Méz, méhészet', emoji: '🍯', color: '#FFB300' },
  tools: { label: 'Szerszámok, gépek', emoji: '🔧', color: '#607D8B' },
  secondhand: { label: 'Használt cikkek', emoji: '📦', color: '#9E9E9E' },
  clothing: { label: 'Ruházat, textil', emoji: '👕', color: '#E91E63' },
  services: { label: 'Szolgáltatások', emoji: '🛠️', color: '#2196F3' },
  childcare: { label: 'Gyermekfelügyelet', emoji: '👶', color: '#EC407A' },
  tutoring: { label: 'Magánórák', emoji: '📚', color: '#673AB7' }
};

/**
 * Típus megjelenítési információ
 */
export const TYPE_INFO: Record<ListingType, { label: string; emoji: string }> = {
  sell: { label: 'Eladó', emoji: '💰' },
  trade: { label: 'Cserélhető', emoji: '🔄' },
  give_away: { label: 'Ingyen elvihető', emoji: '🎁' }
};

/**
 * Mértékegység megjelenítési információ
 */
export const UNIT_INFO: Record<ListingUnit, { label: string; shortLabel: string }> = {
  kg: { label: 'kilogramm', shortLabel: 'kg' },
  g: { label: 'gramm', shortLabel: 'g' },
  dkg: { label: 'dekagramm', shortLabel: 'dkg' },
  l: { label: 'liter', shortLabel: 'l' },
  dl: { label: 'deciliter', shortLabel: 'dl' },
  ml: { label: 'milliliter', shortLabel: 'ml' },
  db: { label: 'darab', shortLabel: 'db' },
  csomag: { label: 'csomag', shortLabel: 'csomag' },
  doboz: { label: 'doboz', shortLabel: 'doboz' },
  zsák: { label: 'zsák', shortLabel: 'zsák' },
  üveg: { label: 'üveg', shortLabel: 'üveg' },
  köteg: { label: 'köteg', shortLabel: 'köteg' },
  tálca: { label: 'tálca', shortLabel: 'tálca' },
  óra: { label: 'óra', shortLabel: 'óra' },
  alkalom: { label: 'alkalom', shortLabel: 'alk.' }
};
