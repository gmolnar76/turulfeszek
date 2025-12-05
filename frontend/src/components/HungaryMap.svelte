<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import { selectedCityId, allCitiesData } from '../stores/mockDataStore';
  import { 
    settlementColorByParty,
    settlementPartyVotes,
  } from '../stores/electionStore';
  import type { City } from '../types/models';

  const dispatch = createEventDispatcher();

  let mapContainer: HTMLDivElement;
  let map: L.Map;
  let cities: City[] = [];
  let hungaryBoundary: any = null;
  let markers: Map<string, L.LayerGroup> = new Map();
  let selectedCity: string | null = null;

  // Filter state
  let minPopulation = 50000; // Default to show only large cities
  let showActiveOnly = true;
  let selectedCityDropdown = '';

  // Kárpát-medence határok (szigorú)
  const CARPATHIAN_BOUNDS: L.LatLngBoundsExpression = [
    [45.7, 16.0], // SW corner
    [48.6, 22.9]  // NE corner
  ];
  const MAP_CENTER: L.LatLngExpression = [47.1, 19.5];
  const DEFAULT_ZOOM = 7;

  // Fix: Registered members = 10% of Mi Hazánk voters (deterministic based on city)
  // Using a seed-based approach for consistent values
  const cityRegisteredCache: Map<string, number> = new Map();
  
  function getRegisteredMembers(cityId: string, miHazankVotes: number): number {
    if (cityRegisteredCache.has(cityId)) {
      return cityRegisteredCache.get(cityId)!;
    }
    // 10% of Mi Hazánk voters as registered members
    const registered = Math.floor(miHazankVotes * 0.10);
    cityRegisteredCache.set(cityId, registered);
    return registered;
  }

  // Subscribe to selected city
  selectedCityId.subscribe((id) => {
    selectedCity = id;
    updateMarkerStyles();
  });

  async function loadGeoJson(path: string) {
    try {
      const response = await fetch(path);
      return response.json();
    } catch (e) {
      console.warn('GeoJSON load failed:', e);
      return null;
    }
  }

  const engagementColors: Record<string, string> = {
    low: '#EF4444',
    medium: '#F97316',
    high: '#FBBF24',
    very_high: '#22C55E'
  };

  function getSettlementColor(settlementId: string): string {
    let color: string = '#E0E0E0';
    settlementColorByParty.subscribe(fn => {
      color = fn(settlementId) || '#E0E0E0';
    })();
    return color;
  }

  function getSettlementVoteInfo(settlementId: string): { votes: number; percentage: number } | null {
    let result: { votes: number; percentage: number } | null = null;
    settlementPartyVotes.subscribe(fn => {
      const votes = fn(settlementId);
      if (votes) {
        result = { votes: votes.votes, percentage: votes.percentage };
      }
    })();
    return result;
  }

  function updateMarkerStyles() {
    markers.forEach((layerGroup, cityId) => {
      const isSelected = cityId === selectedCity;
      layerGroup.eachLayer((layer: any) => {
        if (layer._icon) {
          if (isSelected) {
            layer._icon.style.zIndex = '1000';
            layer._icon.style.filter = 'drop-shadow(0 0 10px rgba(139, 92, 246, 1))';
          } else {
            layer._icon.style.zIndex = '500';
            layer._icon.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))';
          }
        }
      });
    });
  }

  // Filter cities based on criteria
  function getFilteredCities(): City[] {
    return cities.filter(city => {
      const passesPopulation = city.population >= minPopulation;
      const passesActivity = !showActiveOnly || city.engagementLevel === 'high' || city.engagementLevel === 'very_high' || city.population > 100000;
      return passesPopulation && passesActivity;
    });
  }

  // Create donut chart SVG for city marker
  // Piros = Mi Hazánk szavazók, Zöld = Regisztrált tagok (10% of Mi Hazánk voters)
  // Csak ez a két kategória jelenik meg (többi párt nincs)
  function createDonutChart(miHazankVotes: number, registeredMembers: number, totalVoters: number): string {
    // Calculate percentages relative to Mi Hazánk voters ONLY (not total voters)
    // Mi Hazánk voters = 100%, Registered = 10% of Mi Hazánk
    const total = miHazankVotes + registeredMembers;
    const miHazankPercent = total > 0 ? (miHazankVotes / total) * 100 : 90;
    const registeredPercent = total > 0 ? (registeredMembers / total) * 100 : 10;
    
    // SVG donut chart
    const size = 56;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    
    // Strokes for each segment (only 2 colors now)
    const miHazankStroke = (miHazankPercent / 100) * circumference;
    const registeredStroke = (registeredPercent / 100) * circumference;

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <!-- Mi Hazánk voters (red) - base circle -->
        <circle 
          cx="${size/2}" cy="${size/2}" r="${radius}"
          fill="none" 
          stroke="#DC2626" 
          stroke-width="${strokeWidth}"
        />
        <!-- Registered members (green) - overlaid segment -->
        <circle 
          cx="${size/2}" cy="${size/2}" r="${radius}"
          fill="none" 
          stroke="#16a34a" 
          stroke-width="${strokeWidth}"
          stroke-dasharray="${registeredStroke} ${circumference}"
          stroke-dashoffset="${-miHazankStroke}"
          transform="rotate(-90 ${size/2} ${size/2})"
        />
        <!-- Center hole -->
        <circle cx="${size/2}" cy="${size/2}" r="${radius - strokeWidth}" fill="white"/>
      </svg>
    `;
  }

  function updateMapMarkers() {
    if (!map) return;

    // Clear existing markers
    markers.forEach(layerGroup => layerGroup.clearLayers());
    markers.clear();

    const filteredCities = getFilteredCities();

    filteredCities.forEach((city) => {
      const voteData = getSettlementVoteInfo(city.id);
      
      // Mi Hazánk szavazatok (piros) - valós választási adatokból
      const miHazankVotes = voteData?.votes || Math.floor(city.population * 0.05);
      // Total city voters (approx 60% of population voted)
      const totalVoters = Math.floor(city.population * 0.6);
      // Regisztrált tagok (zöld) = 10% of Mi Hazánk voters
      const registeredMembers = getRegisteredMembers(city.id, miHazankVotes);
      
      const donutSvg = createDonutChart(miHazankVotes, registeredMembers, totalVoters);

      const html = `
        <div class="city-marker-container" style="
          position: relative;
          width: 60px;
          height: 60px;
          cursor: pointer;
          transition: transform 0.2s ease;
        ">
          <div style="position: absolute; top: 0; left: 0;">
            ${donutSvg}
          </div>
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 9px;
            font-weight: bold;
            color: #374151;
            text-align: center;
            line-height: 1.1;
          ">
            <div style="font-size: 10px;">${formatNumber(registeredMembers)}</div>
            <div style="font-size: 7px; color: #16a34a;">tag</div>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        html,
        iconSize: [60, 60],
        iconAnchor: [30, 30],
        className: 'city-donut-marker'
      });

      const miHazankPercent = voteData?.percentage || ((miHazankVotes / totalVoters) * 100);
      
      const popupContent = `
        <div style="font-family: Arial; width: 280px;">
          <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px;">${city.name}</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
            <div style="background: #f3f4f6; padding: 8px; border-radius: 4px; text-align: center;">
              <div style="font-size: 11px; color: #6b7280;">Lakosság</div>
              <div style="font-size: 14px; font-weight: bold; color: #1f2937;">${city.population.toLocaleString('hu-HU')}</div>
            </div>
            <div style="background: #dcfce7; padding: 8px; border-radius: 4px; text-align: center;">
              <div style="font-size: 11px; color: #16a34a;">Regisztrált Tagok</div>
              <div style="font-size: 14px; font-weight: bold; color: #16a34a;">${registeredMembers.toLocaleString('hu-HU')}</div>
            </div>
          </div>
          
          <div style="background: #fee2e2; padding: 10px; border-radius: 4px; border-left: 3px solid #DC2626; margin-bottom: 8px;">
            <div style="font-size: 11px; color: #991b1b;">🗳️ Mi Hazánk szavazók</div>
            <div style="font-size: 15px; font-weight: bold; color: #DC2626;">${miHazankVotes.toLocaleString('hu-HU')} (${miHazankPercent.toFixed(1)}%)</div>
          </div>
          
          <div style="background: #dcfce7; padding: 10px; border-radius: 4px; border-left: 3px solid #16a34a;">
            <div style="font-size: 11px; color: #166534;">✅ Regisztrált tagok (10% MH)</div>
            <div style="font-size: 15px; font-weight: bold; color: #16a34a;">${registeredMembers.toLocaleString('hu-HU')}</div>
          </div>
        </div>
      `;

      const layerGroup = L.layerGroup();
      const marker = L.marker([city.coordinates[1], city.coordinates[0]], { icon })
        .bindPopup(popupContent)
        .on('click', () => {
          selectedCityId.set(city.id);
        });
      
      layerGroup.addLayer(marker);
      layerGroup.addTo(map);
      markers.set(city.id, layerGroup);
    });

    updateMarkerStyles();
  }

  function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
  }

  function handlePopulationChange(event: Event) {
    const target = event.target as HTMLInputElement;
    minPopulation = parseInt(target.value);
    updateMapMarkers();
  }

  function handleCitySelect(event: Event) {
    const target = event.target as HTMLSelectElement;
    const cityId = target.value;
    if (cityId && map) {
      const city = cities.find(c => c.id === cityId);
      if (city) {
        selectedCityId.set(cityId);
        map.flyTo([city.coordinates[1], city.coordinates[0]], 12, {
          duration: 1.5
        });
      }
    }
  }

  function resetView() {
    if (map) {
      selectedCityDropdown = '';
      map.flyTo(MAP_CENTER, DEFAULT_ZOOM, { duration: 1 });
    }
  }

  onMount(async () => {
    if (!mapContainer) {
      console.error('Map container not available');
      return;
    }

    // Load Hungary boundary
    hungaryBoundary = await loadGeoJson('/geojson/hungary-boundary.geojson');

    // Initialize map - strictly Carpathian Basin focused
    map = L.map(mapContainer, {
      center: MAP_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: 7,
      maxZoom: 18,
      maxBounds: CARPATHIAN_BOUNDS,
      maxBoundsViscosity: 1.0
    });

    // Add base tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19
    }).addTo(map);

    // Add Hungary boundary
    if (hungaryBoundary) {
      L.geoJSON(hungaryBoundary, {
        style: {
          color: '#8B5CF6',
          weight: 3,
          opacity: 0.8,
          fillOpacity: 0.05,
          fillColor: '#8B5CF6'
        }
      }).addTo(map);
    }

    // Subscribe to cities data
    allCitiesData.subscribe((citiesData) => {
      cities = citiesData;
      updateMapMarkers();
    });
  });
</script>

<div class="map-wrapper">
  <!-- Controls Panel -->
  <div class="map-controls">
    <div class="control-group">
      <label for="city-select">🏙️ Város:</label>
      <select id="city-select" bind:value={selectedCityDropdown} on:change={handleCitySelect}>
        <option value="">-- Válassz várost --</option>
        {#each cities.sort((a, b) => b.population - a.population) as city (city.id)}
          <option value={city.id}>{city.name} ({(city.population / 1000).toFixed(0)}K)</option>
        {/each}
      </select>
      <button class="reset-btn" on:click={resetView} title="Visszaállítás">🔄</button>
    </div>

    <div class="control-group population-slider">
      <label for="population-slider">👥 Min. lakosság: <strong>{minPopulation.toLocaleString('hu-HU')}</strong></label>
      <input 
        type="range" 
        id="population-slider"
        min="0" 
        max="200000" 
        step="5000" 
        bind:value={minPopulation}
        on:input={handlePopulationChange}
      />
      <div class="slider-labels">
        <span>0</span>
        <span>50K</span>
        <span>100K</span>
        <span>150K</span>
        <span>200K</span>
      </div>
    </div>

    <div class="control-group">
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={showActiveOnly} on:change={updateMapMarkers} />
        <span>Csak aktív városok</span>
      </label>
    </div>
  </div>

  <!-- Legend -->
  <div class="map-legend">
    <div class="legend-title">Jelmagyarázat</div>
    <div class="legend-item">
      <div class="legend-donut">
        <svg width="28" height="28" viewBox="0 0 28 28">
          <circle cx="14" cy="14" r="10" fill="none" stroke="#DC2626" stroke-width="3"/>
          <circle cx="14" cy="14" r="10" fill="none" stroke="#16a34a" stroke-width="3" stroke-dasharray="6 57" stroke-dashoffset="-57" transform="rotate(-90 14 14)"/>
          <circle cx="14" cy="14" r="7" fill="white"/>
        </svg>
      </div>
      <span>Kördiagram</span>
    </div>
    <div class="legend-colors">
      <div class="color-item"><span class="color-dot" style="background: #DC2626;"></span> Mi Hazánk szavazók</div>
      <div class="color-item"><span class="color-dot" style="background: #16a34a;"></span> Regisztrált tagok (10%)</div>
    </div>
  </div>

  <div bind:this={mapContainer} class="map-container"></div>
</div>

<style>
  .map-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
  }

  .map-container {
    width: 100%;
    height: 100%;
    background-color: #e8f4f8;
  }

  .map-controls {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 1000;
    background: white;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 220px;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .control-group label {
    font-size: 12px;
    font-weight: 600;
    color: #374151;
  }

  .control-group select {
    padding: 6px 8px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 12px;
    background: white;
    cursor: pointer;
  }

  .control-group select:focus {
    outline: none;
    border-color: #8B5CF6;
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
  }

  .reset-btn {
    margin-top: 4px;
    padding: 4px 8px;
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
  }

  .reset-btn:hover {
    background: #e5e7eb;
  }

  .population-slider input[type="range"] {
    width: 100%;
    height: 6px;
    -webkit-appearance: none;
    background: #e5e7eb;
    border-radius: 3px;
    outline: none;
  }

  .population-slider input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: #8B5CF6;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  .slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 9px;
    color: #9ca3af;
    margin-top: 2px;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    font-size: 12px;
  }

  .checkbox-label input {
    width: 14px;
    height: 14px;
    accent-color: #8B5CF6;
  }

  .map-legend {
    position: absolute;
    bottom: 10px;
    right: 10px;
    z-index: 1000;
    background: white;
    border-radius: 8px;
    padding: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    font-size: 11px;
  }

  .legend-title {
    font-weight: 600;
    margin-bottom: 8px;
    color: #374151;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
    color: #6b7280;
  }

  .legend-donut {
    width: 24px;
    height: 24px;
  }

  .legend-colors {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #e5e7eb;
  }

  .color-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    color: #6b7280;
  }

  .color-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  :global(.city-donut-marker) {
    background: transparent !important;
    border: none !important;
  }

  :global(.leaflet-container) {
    background-color: #e8f4f8;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
</style>
