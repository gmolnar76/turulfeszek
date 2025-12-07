<script lang="ts">
  /**
   * Marketplace Dashboard
   * Piactér áttekintő a web dashboard-on
   * Helyi adok-veszek aktivitás és statisztikák
   */

  import { onMount } from 'svelte';
  import {
    selectedMarketCity,
    selectedMarketConstituency,
    cityMarketStats,
    constituencyMarketStats,
    categoryStats,
    availableCities,
    availableConstituencies,
    selectedTimePeriod,
    overallStats,
    type TimePeriod
  } from '../stores/marketplaceStore';
  import { CATEGORY_INFO } from '../types/marketplace.types';
  import type { CityMarketStats, CategoryStat, DailyMarketActivity } from '../types/marketplace.types';

  // Reaktív változók
  let currentCityStats: CityMarketStats;
  let currentConstituencyStats: any;
  let currentOverallStats: any;
  let currentCategories: CategoryStat[];

  // Feliratkozás a store-okra
  $: currentCityStats = $cityMarketStats;
  $: currentConstituencyStats = $constituencyMarketStats;
  $: currentOverallStats = $overallStats;
  $: currentCategories = $categoryStats;

  // Chart adatok generálása
  function getActivityChartData(trend: DailyMarketActivity[]): string {
    if (!trend || trend.length === 0) return '';
    
    const maxTransactions = Math.max(...trend.map(d => d.transactions));
    const width = 100;
    const height = 40;
    
    const points = trend.map((d, i) => {
      const x = (i / (trend.length - 1)) * width;
      const y = height - (d.transactions / maxTransactions) * height;
      return `${x},${y}`;
    }).join(' ');
    
    return points;
  }

  // Városváltás
  function handleCityChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    selectedMarketCity.set(target.value);
    
    // Körzet automatikus váltása
    const city = $availableCities.find(c => c.id === target.value);
    if (city) {
      selectedMarketConstituency.set(city.constituencyId);
    }
  }

  // Körzetváltás
  function handleConstituencyChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    selectedMarketConstituency.set(target.value);
  }

  // Időszak váltás
  function handleTimePeriodChange(period: TimePeriod) {
    selectedTimePeriod.set(period);
  }

  // Kategória szín lekérése
  function getCategoryColor(category: string): string {
    return CATEGORY_INFO[category as keyof typeof CATEGORY_INFO]?.color || '#9E9E9E';
  }

  // Kategória emoji lekérése
  function getCategoryEmoji(category: string): string {
    return CATEGORY_INFO[category as keyof typeof CATEGORY_INFO]?.emoji || '📦';
  }
</script>

<div class="marketplace-dashboard">
  <!-- Fejléc -->
  <div class="dashboard-header">
    <div class="header-title">
      <h2>🛒 Helyi Piactér</h2>
      <p class="subtitle">Kerti termények, házi készítésű termékek és használt cikkek a közösségben</p>
    </div>
    
    <div class="header-controls">
      <select class="control-select" on:change={handleConstituencyChange} value={$selectedMarketConstituency}>
        {#each $availableConstituencies as constituency}
          <option value={constituency.id}>{constituency.name}</option>
        {/each}
      </select>
      
      <select class="control-select" on:change={handleCityChange} value={$selectedMarketCity}>
        {#each $availableCities as city}
          <option value={city.id}>{city.name}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Összefoglaló kártyák -->
  <div class="stats-cards">
    <div class="stat-card">
      <div class="stat-icon" style="background-color: #4CAF5020;">📦</div>
      <div class="stat-content">
        <span class="stat-value">{currentCityStats?.activeListings || 0}</span>
        <span class="stat-label">Aktív hirdetés</span>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon" style="background-color: #2196F320;">👥</div>
      <div class="stat-content">
        <span class="stat-value">{currentCityStats?.totalSellers || 0}</span>
        <span class="stat-label">Aktív eladó</span>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon" style="background-color: #FF980020;">🔄</div>
      <div class="stat-content">
        <span class="stat-value">{currentCityStats?.weeklyTransactions || 0}</span>
        <span class="stat-label">Heti tranzakció</span>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon" style="background-color: #9C27B020;">📈</div>
      <div class="stat-content">
        <span class="stat-value">{currentCityStats?.monthlyTransactions || 0}</span>
        <span class="stat-label">Havi tranzakció</span>
      </div>
    </div>
  </div>

  <!-- Fő tartalom -->
  <div class="main-content">
    <!-- Bal oldal: Aktivitás trend -->
    <div class="content-section activity-section">
      <div class="section-header">
        <h3>📊 Aktivitás trend</h3>
        <div class="time-period-buttons">
          <button 
            class="period-btn" 
            class:active={$selectedTimePeriod === 'week'}
            on:click={() => handleTimePeriodChange('week')}
          >
            Hét
          </button>
          <button 
            class="period-btn" 
            class:active={$selectedTimePeriod === 'month'}
            on:click={() => handleTimePeriodChange('month')}
          >
            Hónap
          </button>
          <button 
            class="period-btn" 
            class:active={$selectedTimePeriod === 'quarter'}
            on:click={() => handleTimePeriodChange('quarter')}
          >
            Negyedév
          </button>
        </div>
      </div>
      
      <div class="activity-chart">
        {#if currentCityStats?.activityTrend}
          <svg viewBox="0 0 100 50" class="trend-chart">
            <!-- Háttér vonalak -->
            <line x1="0" y1="12.5" x2="100" y2="12.5" stroke="#e0e0e0" stroke-width="0.5" />
            <line x1="0" y1="25" x2="100" y2="25" stroke="#e0e0e0" stroke-width="0.5" />
            <line x1="0" y1="37.5" x2="100" y2="37.5" stroke="#e0e0e0" stroke-width="0.5" />
            
            <!-- Tranzakciók vonal -->
            <polyline 
              points={getActivityChartData(currentCityStats.activityTrend)}
              fill="none"
              stroke="#2196F3"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          
          <div class="chart-legend">
            <span class="legend-item">
              <span class="legend-color" style="background-color: #2196F3;"></span>
              Tranzakciók
            </span>
          </div>
        {/if}
      </div>
      
      <div class="activity-summary">
        <div class="summary-item">
          <span class="summary-label">Legaktívabb nap:</span>
          <span class="summary-value">Szombat</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Átlagos napi aktivitás:</span>
          <span class="summary-value">{Math.round((currentCityStats?.weeklyTransactions || 0) / 7)} tranzakció</span>
        </div>
      </div>
    </div>

    <!-- Jobb oldal: Kategóriák -->
    <div class="content-section categories-section">
      <div class="section-header">
        <h3>🏷️ Népszerű kategóriák</h3>
      </div>
      
      <div class="categories-list">
        {#each currentCityStats?.topCategories || [] as category}
          <div class="category-item">
            <div class="category-info">
              <span class="category-emoji">{getCategoryEmoji(category.category)}</span>
              <span class="category-name">{category.categoryLabel}</span>
            </div>
            <div class="category-stats">
              <div class="category-bar-wrapper">
                <div 
                  class="category-bar" 
                  style="width: {category.percentageOfTotal}%; background-color: {getCategoryColor(category.category)};"
                ></div>
              </div>
              <span class="category-count">{category.listingCount} hirdetés</span>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Körzeti rangsor -->
  <div class="content-section ranking-section">
    <div class="section-header">
      <h3>🏆 Körzeti rangsor</h3>
      <span class="constituency-name">{currentConstituencyStats?.constituencyName}</span>
    </div>
    
    <div class="ranking-table">
      <div class="ranking-header">
        <span class="rank-col">#</span>
        <span class="city-col">Település</span>
        <span class="listings-col">Hirdetések</span>
        <span class="transactions-col">Heti tranzakció</span>
        <span class="score-col">Aktivitás</span>
      </div>
      
      {#each currentConstituencyStats?.cityRanking || [] as city, index}
        <div class="ranking-row" class:highlighted={city.cityId === $selectedMarketCity}>
          <span class="rank-col">
            {#if index === 0}🥇
            {:else if index === 1}🥈
            {:else if index === 2}🥉
            {:else}{index + 1}
            {/if}
          </span>
          <span class="city-col">{city.cityName}</span>
          <span class="listings-col">{city.activeListings}</span>
          <span class="transactions-col">{city.weeklyTransactions}</span>
          <span class="score-col">
            <div class="score-bar-wrapper">
              <div 
                class="score-bar" 
                style="width: {city.activityScore}%;"
              ></div>
            </div>
            <span class="score-value">{city.activityScore}</span>
          </span>
        </div>
      {/each}
    </div>
  </div>

  <!-- Szezonális termékek -->
  <div class="content-section seasonal-section">
    <div class="section-header">
      <h3>🌿 Szezonális termékek</h3>
      <span class="season-label">December</span>
    </div>
    
    <div class="seasonal-products">
      {#each currentCityStats?.seasonalProducts || [] as product}
        <div class="seasonal-item" class:in-season={product.currentAvailability === 'in_season'} class:ending-soon={product.currentAvailability === 'ending_soon'}>
          <span class="seasonal-emoji">{getCategoryEmoji(product.category)}</span>
          <span class="seasonal-name">{product.name}</span>
          <span class="seasonal-badge" class:available={product.currentAvailability === 'in_season'} class:warning={product.currentAvailability === 'ending_soon'}>
            {#if product.currentAvailability === 'in_season'}
              Szezonban
            {:else if product.currentAvailability === 'ending_soon'}
              Hamarosan véget ér
            {:else}
              Szezonon kívül
            {/if}
          </span>
          <span class="seasonal-count">{product.listingCount} hirdetés</span>
        </div>
      {/each}
    </div>
  </div>

  <!-- Info kártya -->
  <div class="info-card">
    <div class="info-icon">💡</div>
    <div class="info-content">
      <h4>Közösségi Piactér</h4>
      <p>
        A helyi piactér lehetővé teszi a közösség tagjai számára, hogy kerti terményeiket, 
        házi készítésű termékeiket és használt tárgyaikat kínálják fel egymásnak. 
        A rendszer támogatja az eladást, cserét és az ingyen elvihető tárgyak meghirdetését.
      </p>
      <p class="info-note">
        📱 A Turul Wallet mobilalkalmazásban hirdetéseket adhatsz fel és böngészheted a kínálatot.
      </p>
    </div>
  </div>
</div>

<style>
  .marketplace-dashboard {
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
  }

  /* Fejléc */
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    gap: 20px;
    flex-wrap: wrap;
  }

  .header-title h2 {
    margin: 0 0 4px 0;
    font-size: 24px;
    font-weight: 700;
    color: #1a1a2e;
  }

  .subtitle {
    margin: 0;
    font-size: 14px;
    color: #666;
  }

  .header-controls {
    display: flex;
    gap: 12px;
  }

  .control-select {
    padding: 10px 16px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    background: white;
    cursor: pointer;
    min-width: 160px;
  }

  .control-select:focus {
    outline: none;
    border-color: #2196F3;
  }

  /* Statisztika kártyák */
  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #1a1a2e;
    line-height: 1.2;
  }

  .stat-label {
    font-size: 13px;
    color: #666;
  }

  /* Fő tartalom */
  .main-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 24px;
  }

  @media (max-width: 900px) {
    .main-content {
      grid-template-columns: 1fr;
    }
  }

  .content-section {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .section-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #1a1a2e;
  }

  /* Időszak gombok */
  .time-period-buttons {
    display: flex;
    gap: 4px;
    background: #f5f5f5;
    padding: 4px;
    border-radius: 8px;
  }

  .period-btn {
    padding: 6px 12px;
    border: none;
    background: transparent;
    border-radius: 6px;
    font-size: 12px;
    color: #666;
    cursor: pointer;
    transition: all 0.2s;
  }

  .period-btn.active {
    background: white;
    color: #2196F3;
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  /* Aktivitás chart */
  .activity-chart {
    margin-bottom: 16px;
  }

  .trend-chart {
    width: 100%;
    height: 120px;
  }

  .chart-legend {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 8px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #666;
  }

  .legend-color {
    width: 12px;
    height: 3px;
    border-radius: 2px;
  }

  .activity-summary {
    display: flex;
    justify-content: space-around;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
  }

  .summary-item {
    text-align: center;
  }

  .summary-label {
    display: block;
    font-size: 12px;
    color: #999;
    margin-bottom: 4px;
  }

  .summary-value {
    font-size: 14px;
    font-weight: 600;
    color: #1a1a2e;
  }

  /* Kategóriák */
  .categories-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .category-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f5f5f5;
  }

  .category-item:last-child {
    border-bottom: none;
  }

  .category-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .category-emoji {
    font-size: 20px;
  }

  .category-name {
    font-size: 14px;
    color: #333;
  }

  .category-stats {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .category-bar-wrapper {
    width: 80px;
    height: 6px;
    background: #f0f0f0;
    border-radius: 3px;
    overflow: hidden;
  }

  .category-bar {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s;
  }

  .category-count {
    font-size: 12px;
    color: #666;
    min-width: 70px;
    text-align: right;
  }

  /* Rangsor tábla */
  .ranking-section {
    margin-bottom: 24px;
  }

  .constituency-name {
    font-size: 13px;
    color: #666;
    background: #f5f5f5;
    padding: 4px 10px;
    border-radius: 12px;
  }

  .ranking-table {
    margin-top: 8px;
  }

  .ranking-header,
  .ranking-row {
    display: grid;
    grid-template-columns: 50px 1fr 100px 120px 150px;
    padding: 12px 8px;
    align-items: center;
  }

  .ranking-header {
    font-size: 12px;
    color: #999;
    font-weight: 600;
    text-transform: uppercase;
    border-bottom: 1px solid #f0f0f0;
  }

  .ranking-row {
    font-size: 14px;
    color: #333;
    border-bottom: 1px solid #f5f5f5;
    transition: background 0.2s;
  }

  .ranking-row:hover {
    background: #f9f9f9;
  }

  .ranking-row.highlighted {
    background: #e3f2fd;
  }

  .score-col {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .score-bar-wrapper {
    flex: 1;
    height: 6px;
    background: #f0f0f0;
    border-radius: 3px;
    overflow: hidden;
  }

  .score-bar {
    height: 100%;
    background: linear-gradient(90deg, #4CAF50, #8BC34A);
    border-radius: 3px;
  }

  .score-value {
    font-size: 12px;
    font-weight: 600;
    color: #4CAF50;
    min-width: 30px;
    text-align: right;
  }

  /* Szezonális termékek */
  .season-label {
    font-size: 13px;
    color: #4CAF50;
    background: #e8f5e9;
    padding: 4px 10px;
    border-radius: 12px;
  }

  .seasonal-products {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }

  .seasonal-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    background: #f9f9f9;
    border-radius: 10px;
    border: 1px solid #f0f0f0;
  }

  .seasonal-item.in-season {
    background: #e8f5e9;
    border-color: #c8e6c9;
  }

  .seasonal-item.ending-soon {
    background: #fff8e1;
    border-color: #ffecb3;
  }

  .seasonal-emoji {
    font-size: 24px;
  }

  .seasonal-name {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }

  .seasonal-badge {
    font-size: 10px;
    padding: 3px 8px;
    border-radius: 10px;
    background: #e0e0e0;
    color: #666;
  }

  .seasonal-badge.available {
    background: #4CAF50;
    color: white;
  }

  .seasonal-badge.warning {
    background: #FF9800;
    color: white;
  }

  .seasonal-count {
    font-size: 12px;
    color: #999;
  }

  /* Info kártya */
  .info-card {
    display: flex;
    gap: 16px;
    padding: 20px;
    background: linear-gradient(135deg, #e3f2fd, #e8f5e9);
    border-radius: 12px;
    margin-top: 24px;
  }

  .info-icon {
    font-size: 32px;
    flex-shrink: 0;
  }

  .info-content h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: #1a1a2e;
  }

  .info-content p {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: #555;
    line-height: 1.6;
  }

  .info-note {
    font-size: 13px;
    color: #2196F3;
    font-weight: 500;
    margin-top: 12px !important;
  }

  /* Mobil */
  @media (max-width: 768px) {
    .marketplace-dashboard {
      padding: 16px;
    }

    .dashboard-header {
      flex-direction: column;
    }

    .header-controls {
      width: 100%;
      flex-direction: column;
    }

    .control-select {
      width: 100%;
    }

    .ranking-header,
    .ranking-row {
      grid-template-columns: 40px 1fr 60px 80px;
    }

    .score-col {
      display: none;
    }
  }
</style>
