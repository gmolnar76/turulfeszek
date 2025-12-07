/**
 * Marketplace Store - Svelte
 * Piactér állapotkezelés a web dashboard-hoz
 */

import { writable, derived } from 'svelte/store';
import type {
  CityMarketStats,
  ConstituencyMarketStats,
  ListingCategory,
  CategoryStat
} from '../types/marketplace.types';
import {
  MOCK_CITY_STATS,
  MOCK_CONSTITUENCY_STATS,
  getCategoryBreakdown
} from '../data/marketplaceMockData';

// Kiválasztott város
export const selectedMarketCity = writable<string>('kecskemet');

// Kiválasztott körzet
export const selectedMarketConstituency = writable<string>('OEVK-01');

// Város statisztika
export const cityMarketStats = derived(
  selectedMarketCity,
  ($cityId) => {
    return MOCK_CITY_STATS.find(s => s.cityId === $cityId) || MOCK_CITY_STATS[0];
  }
);

// Körzeti statisztika
export const constituencyMarketStats = derived(
  selectedMarketConstituency,
  ($constituencyId) => {
    return MOCK_CONSTITUENCY_STATS.find(s => s.constituencyId === $constituencyId) || MOCK_CONSTITUENCY_STATS[0];
  }
);

// Összes kategória statisztika
export const categoryStats = writable<CategoryStat[]>(getCategoryBreakdown());

// Elérhető városok
export const availableCities = writable([
  { id: 'kecskemet', name: 'Kecskemét', constituencyId: 'OEVK-01' },
  { id: 'kiskunfelegyhaza', name: 'Kiskunfélegyháza', constituencyId: 'OEVK-01' },
  { id: 'szeged', name: 'Szeged', constituencyId: 'OEVK-02' },
  { id: 'hodmezovasarhely', name: 'Hódmezővásárhely', constituencyId: 'OEVK-02' }
]);

// Elérhető körzetek
export const availableConstituencies = writable([
  { id: 'OEVK-01', name: 'Bács-Kiskun 1.' },
  { id: 'OEVK-02', name: 'Csongrád 1.' }
]);

// Időszak szűrő
export type TimePeriod = 'week' | 'month' | 'quarter';
export const selectedTimePeriod = writable<TimePeriod>('month');

// Összesített statisztikák (az összes körzetre)
export const overallStats = derived(
  [categoryStats],
  ([$categoryStats]) => {
    const totalListings = $categoryStats.reduce((sum, c) => sum + c.listingCount, 0);
    const totalTransactions = $categoryStats.reduce((sum, c) => sum + c.transactionCount, 0);
    const totalSellers = MOCK_CITY_STATS.reduce((sum, c) => sum + c.totalSellers, 0);
    const totalBuyers = MOCK_CITY_STATS.reduce((sum, c) => sum + c.totalBuyers, 0);
    
    return {
      totalActiveListings: totalListings,
      totalSellers,
      totalBuyers,
      weeklyTransactions: Math.round(totalTransactions * 0.25),
      monthlyTransactions: totalTransactions,
      averageRating: 4.6,
      topCategories: $categoryStats.slice(0, 5)
    };
  }
);
