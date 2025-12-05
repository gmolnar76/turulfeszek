import { writable, derived } from 'svelte/store';
import type { City, MovementCategory } from '../types/models';
import { allCities, movementCategories as initialCategories } from '../data/mockDataGenerator';

// Primary store: selected city ID
export const selectedCityId = writable<string>('budapest');

// Store all cities data
export const allCitiesData = writable<City[]>(allCities);

// Store movement categories
export const movementCategories = writable<MovementCategory[]>(initialCategories);

// Derived store: get selected city data
export const selectedCityData = derived(
  [selectedCityId, allCitiesData],
  ([$selectedId, $cities]) => {
    return $cities.find((c) => c.id === $selectedId);
  }
);

// Derived store: get activity trend data for selected city
export const activityTrendData = derived(
  selectedCityData,
  ($selectedCity) => {
    return $selectedCity?.activityTrend || [];
  }
);

// Derived store: get participation rate for selected city
export const selectedCityParticipation = derived(
  selectedCityData,
  ($selectedCity) => {
    return $selectedCity?.participationRate || 0;
  }
);

// Derived store: get engagement level for selected city
export const selectedCityEngagement = derived(
  selectedCityData,
  ($selectedCity) => {
    return $selectedCity?.engagementLevel || 'low';
  }
);

// Derived store: get event count for selected city
export const selectedCityEventCount = derived(
  selectedCityData,
  ($selectedCity) => {
    return $selectedCity?.eventCount || 0;
  }
);
