// Backend Marketplace típusdefiníciók

/**
 * Hirdetés kategóriák
 */
export type ListingCategory =
  | 'garden_produce'
  | 'homemade_goods'
  | 'plants'
  | 'eggs_dairy'
  | 'meat'
  | 'honey'
  | 'tools'
  | 'secondhand'
  | 'clothing'
  | 'services'
  | 'childcare'
  | 'tutoring';export type ListingType = 'sell' | 'trade' | 'give_away';
export type ListingStatus = 'active' | 'reserved' | 'sold' | 'expired';
export type ListingUnit = 'kg' | 'g' | 'dkg' | 'l' | 'dl' | 'ml' | 'db' | 'csomag' | 'doboz' | 'zsák' | 'üveg' | 'köteg' | 'tálca' | 'óra' | 'alkalom';
export type ListingCurrency = 'HUF' | 'turul_pont';
export type DeliveryOption = 'pickup' | 'local_delivery' | 'shipping';

export interface ListingLocation {
  cityId: string;
  cityName: string;
  constituencyId?: string;
  constituencyName?: string;
  coordinates?: [number, number];
}

export interface SellerInfo {
  userId: string;
  userName: string;
  avatarUrl?: string;
  trustLevel: number;
  memberSince: string;
  completedTransactions: number;
  rating: number;
  badges: string[];
}

export interface MarketplaceListing {
  id: string;
  seller: SellerInfo;
  title: string;
  description: string;
  category: ListingCategory;
  type: ListingType;
  status: ListingStatus;
  price?: number;
  currency?: ListingCurrency;
  tradeFor?: string;
  images: string[];
  quantity: number;
  unit: ListingUnit;
  isOrganic?: boolean;
  harvestDate?: string;
  location: ListingLocation;
  deliveryOptions: DeliveryOption[];
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  viewCount: number;
  favoriteCount: number;
  inquiryCount: number;
}

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
  rating?: number;
  review?: string;
  location: ListingLocation;
}

export interface CityMarketStats {
  cityId: string;
  cityName: string;
  constituencyId: string;
  activeListings: number;
  totalSellers: number;
  totalBuyers: number;
  weeklyNewListings: number;
  weeklyTransactions: number;
  monthlyTransactions: number;
  topCategories: CategoryStat[];
  activityTrend: DailyMarketActivity[];
  seasonalProducts: SeasonalProduct[];
}

export interface CategoryStat {
  category: ListingCategory;
  categoryLabel: string;
  listingCount: number;
  transactionCount: number;
  percentageOfTotal: number;
}

export interface DailyMarketActivity {
  date: string;
  newListings: number;
  transactions: number;
  activeUsers: number;
}

export interface SeasonalProduct {
  name: string;
  category: ListingCategory;
  availableFrom: string;
  availableTo: string;
  currentAvailability: 'in_season' | 'ending_soon' | 'out_of_season';
  listingCount: number;
}

export interface ConstituencyMarketStats {
  constituencyId: string;
  constituencyName: string;
  totalCities: number;
  totalActiveListings: number;
  totalWeeklyTransactions: number;
  cityRanking: CityMarketSummary[];
  weeklyTrend: DailyMarketActivity[];
}

export interface CityMarketSummary {
  cityId: string;
  cityName: string;
  activeListings: number;
  weeklyTransactions: number;
  activityScore: number;
}

// API Request/Response típusok

export interface CreateListingRequest {
  title: string;
  description: string;
  category: ListingCategory;
  type: ListingType;
  price?: number;
  currency?: ListingCurrency;
  tradeFor?: string;
  images?: string[];
  quantity: number;
  unit: ListingUnit;
  isOrganic?: boolean;
  harvestDate?: string;
  cityId: string;
  deliveryOptions: DeliveryOption[];
  expiresInDays?: number;
}

export interface UpdateListingRequest {
  title?: string;
  description?: string;
  price?: number;
  quantity?: number;
  status?: ListingStatus;
  tradeFor?: string;
}

export interface ListingsQueryParams {
  category?: ListingCategory;
  type?: ListingType;
  status?: ListingStatus;
  cityId?: string;
  constituencyId?: string;
  sellerId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isOrganic?: boolean;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popularity';
  limit?: number;
  offset?: number;
}

export interface ListingsResponse {
  listings: MarketplaceListing[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateTransactionRequest {
  listingId: string;
  buyerId: string;
  quantity: number;
}

export interface RateTransactionRequest {
  rating: number;
  review?: string;
}
