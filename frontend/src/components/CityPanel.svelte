<script lang="ts">
  import { selectedCityData, movementCategories } from '../stores/mockDataStore';
  import type { City, MovementType } from '../types/models';

  let city: City | undefined;
  let categories: any[] = [];

  selectedCityData.subscribe((data) => {
    city = data;
  });

  movementCategories.subscribe((data) => {
    categories = data;
  });

  const engagementColors: Record<string, string> = {
    low: '#EF4444',
    medium: '#F97316',
    high: '#FBBF24',
    very_high: '#22C55E'
  };

  const engagementLabels: Record<string, string> = {
    low: 'Low Activity',
    medium: 'Moderate Activity',
    high: 'High Activity',
    very_high: 'Very High Activity'
  };

  function getTotalEventsInCategory(categoryId: string): number {
    if (!city) return 0;
    return city.activityTrend.reduce((sum, day) => {
      return sum + (day.movementCategories[categoryId as MovementType] || 0);
    }, 0);
  }

  function getTotalParticipants(): number {
    if (!city) return 0;
    return city.activityTrend.reduce((sum, day) => sum + day.activeParticipants, 0);
  }
</script>

<div class="panel">
  {#if city}
    <div class="header">
      <h2>{city.name}</h2>
      <p class="region">{city.region}</p>
    </div>

    <div class="section">
      <h3>Overview</h3>
      <div class="metrics-grid">
        <div class="metric">
          <span class="label">Population</span>
          <span class="value">{city.population.toLocaleString()}</span>
        </div>
        <div class="metric">
          <span class="label">Events (30d)</span>
          <span class="value">{city.eventCount}</span>
        </div>
        <div class="metric">
          <span class="label">Participation Rate</span>
          <span class="value">{city.participationRate}%</span>
        </div>
        <div class="metric">
          <span class="label">Total Participants (14d)</span>
          <span class="value">{getTotalParticipants().toLocaleString()}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <h3>Engagement Level</h3>
      <div class="engagement-indicator">
        <div
          class="engagement-badge"
          style="background-color: {engagementColors[city.engagementLevel]}"
        >
          {engagementLabels[city.engagementLevel]}
        </div>
      </div>
    </div>

    <div class="section">
      <h3>Cultural Movement Activity (14 days)</h3>
      <div class="categories-list">
        {#each categories as category}
          <div class="category-item">
            <div class="category-header">
              <div class="category-name">
                <span
                  class="color-dot"
                  style="background-color: {category.color}"
                ></span>
                <span>{category.name}</span>
              </div>
              <span class="event-count">{getTotalEventsInCategory(category.id)} events</span>
            </div>
            <p class="category-desc">{category.description}</p>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="empty-state">
      <p>No city selected</p>
    </div>
  {/if}
</div>

<style>
  .panel {
    width: 100%;
    height: 100%;
    background-color: white;
    border-radius: 8px;
    overflow-y: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
  }

  .header {
    padding: 20px;
    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
    color: white;
    border-radius: 8px 8px 0 0;
  }

  .header h2 {
    margin: 0 0 5px 0;
    font-size: 24px;
    font-weight: 700;
  }

  .region {
    margin: 0;
    font-size: 14px;
    opacity: 0.9;
  }

  .section {
    padding: 20px;
    border-bottom: 1px solid #e5e7eb;
  }

  .section:last-child {
    border-bottom: none;
  }

  .section h3 {
    margin: 0 0 15px 0;
    font-size: 16px;
    font-weight: 600;
    color: #374151;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .metric {
    display: flex;
    flex-direction: column;
    padding: 10px;
    background-color: #f9fafb;
    border-radius: 6px;
  }

  .metric .label {
    font-size: 12px;
    color: #9ca3af;
    margin-bottom: 4px;
    font-weight: 500;
  }

  .metric .value {
    font-size: 18px;
    font-weight: 700;
    color: #8b5cf6;
  }

  .engagement-indicator {
    display: flex;
    gap: 8px;
  }

  .engagement-badge {
    padding: 8px 16px;
    border-radius: 20px;
    color: white;
    font-weight: 600;
    font-size: 14px;
    display: inline-block;
  }

  .categories-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .category-item {
    padding: 10px;
    background-color: #f9fafb;
    border-radius: 6px;
    border-left: 3px solid #e5e7eb;
  }

  .category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .category-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: #374151;
  }

  .color-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: inline-block;
  }

  .event-count {
    font-size: 12px;
    color: #9ca3af;
    font-weight: 500;
  }

  .category-desc {
    margin: 0;
    font-size: 12px;
    color: #9ca3af;
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #9ca3af;
    font-size: 14px;
  }
</style>
