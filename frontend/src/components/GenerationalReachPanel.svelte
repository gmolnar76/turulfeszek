<script lang="ts">
  import { onMount } from 'svelte';
  import type { 
    GenerationalStats, 
    FamilyStats, 
    AgeGroupCategory
  } from '../types/representative.types';

  // Props
  export let constituencyId: string = '';
  export let constituencyName: string = '';

  // Generációs statisztikák mock adatokkal
  let generationalStats: GenerationalStats[] = [];
  let familyStats: FamilyStats | null = null;
  let isLoading = true;

  // Reactive - ha a körzet változik, újratöltjük az adatokat
  $: if (constituencyId) {
    loadGenerationalData();
  }

  onMount(() => {
    loadGenerationalData();
  });

  function loadGenerationalData() {
    isLoading = true;
    console.log('Loading data for constituency:', constituencyId);
    
    // Mock adatok - API-val kell helyettesíteni
    setTimeout(() => {
      generationalStats = [
        {
          ageGroup: 'toddler',
          label: 'Kisgyermek',
          ageRange: '0-5 év',
          emoji: '👶',
          memberCount: 45,
          percentage: 4.2,
          canVote: false,
          canRegisterSelf: false,
          requiresParentApproval: true
        },
        {
          ageGroup: 'child',
          label: 'Gyermek',
          ageRange: '6-13 év',
          emoji: '👧',
          memberCount: 128,
          percentage: 11.9,
          canVote: false,
          canRegisterSelf: false,
          requiresParentApproval: true
        },
        {
          ageGroup: 'teen',
          label: 'Kamasz',
          ageRange: '14-17 év',
          emoji: '👦',
          memberCount: 89,
          percentage: 8.3,
          canVote: false,
          canRegisterSelf: false,
          requiresParentApproval: true
        },
        {
          ageGroup: 'young',
          label: 'Fiatal felnőtt',
          ageRange: '18-24 év',
          emoji: '🧑',
          memberCount: 156,
          percentage: 14.5,
          canVote: true,
          canRegisterSelf: true,
          requiresParentApproval: false
        },
        {
          ageGroup: 'adult',
          label: 'Felnőtt',
          ageRange: '25-39 év',
          emoji: '👩',
          memberCount: 287,
          percentage: 26.7,
          canVote: true,
          canRegisterSelf: true,
          requiresParentApproval: false
        },
        {
          ageGroup: 'middle',
          label: 'Középkorú',
          ageRange: '40-59 év',
          emoji: '👨',
          memberCount: 245,
          percentage: 22.8,
          canVote: true,
          canRegisterSelf: true,
          requiresParentApproval: false
        },
        {
          ageGroup: 'senior',
          label: 'Szenior',
          ageRange: '60+ év',
          emoji: '👴',
          memberCount: 125,
          percentage: 11.6,
          canVote: true,
          canRegisterSelf: true,
          requiresParentApproval: false
        }
      ];

      familyStats = {
        totalFamilies: 312,
        multiGenerationalFamilies: 87,
        averageFamilySize: 3.4,
        familiesWithChildren: 178,
        childrenCount: 262,
        targetChildrenByNextCamp: 400,
        currentProgress: 65.5
      };

      isLoading = false;
    }, 300);
  }

  // Számítások
  $: totalMembers = generationalStats.reduce((sum, g) => sum + g.memberCount, 0);
  $: votingAgeMembers = generationalStats
    .filter(g => g.canVote)
    .reduce((sum, g) => sum + g.memberCount, 0);
  $: underageMembers = generationalStats
    .filter(g => !g.canVote)
    .reduce((sum, g) => sum + g.memberCount, 0);
  $: futureVoters2026 = generationalStats
    .filter(g => g.ageGroup === 'teen')
    .reduce((sum, g) => sum + g.memberCount, 0);

  function getBarWidth(memberCount: number): number {
    const maxCount = Math.max(...generationalStats.map(g => g.memberCount));
    return (memberCount / maxCount) * 100;
  }

  function getAgeGroupColor(ageGroup: AgeGroupCategory): string {
    const colors: Record<AgeGroupCategory, string> = {
      toddler: '#fde68a',
      child: '#fbbf24',
      teen: '#f59e0b',
      young: '#84cc16',
      adult: '#22c55e',
      middle: '#14b8a6',
      senior: '#06b6d4'
    };
    return colors[ageGroup];
  }

  function formatNumber(n: number): string {
    return n.toLocaleString('hu-HU');
  }
</script>

<div class="generational-panel">
  <div class="panel-header">
    <h2>👨‍👩‍👧‍👦 Generációs elérés</h2>
    {#if constituencyName}
      <p class="subtitle">{constituencyName}</p>
    {/if}
  </div>

  {#if isLoading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Adatok betöltése...</p>
    </div>
  {:else}
    <!-- Összefoglaló kártyák -->
    <div class="summary-cards">
      <div class="summary-card total">
        <span class="card-icon">👥</span>
        <span class="card-value">{formatNumber(totalMembers)}</span>
        <span class="card-label">Összes tag</span>
      </div>
      <div class="summary-card voters">
        <span class="card-icon">🗳️</span>
        <span class="card-value">{formatNumber(votingAgeMembers)}</span>
        <span class="card-label">Szavazókorú</span>
      </div>
      <div class="summary-card youth">
        <span class="card-icon">🌱</span>
        <span class="card-value">{formatNumber(underageMembers)}</span>
        <span class="card-label">Kiskorú tag</span>
      </div>
      <div class="summary-card future">
        <span class="card-icon">⏳</span>
        <span class="card-value">{formatNumber(futureVoters2026)}</span>
        <span class="card-label">2026-ra nagykorú</span>
      </div>
    </div>

    <!-- Korosztály eloszlás -->
    <div class="age-distribution">
      <h3>📊 Korosztály eloszlás</h3>
      <div class="age-bars">
        {#each generationalStats as group}
          <div class="age-row">
            <div class="age-info">
              <span class="age-emoji">{group.emoji}</span>
              <span class="age-label">{group.label}</span>
              <span class="age-range">({group.ageRange})</span>
            </div>
            <div class="age-bar-container">
              <div 
                class="age-bar" 
                style="width: {getBarWidth(group.memberCount)}%; background-color: {getAgeGroupColor(group.ageGroup)}"
              >
                <span class="age-count">{group.memberCount}</span>
              </div>
            </div>
            <div class="age-meta">
              <span class="age-percent">{group.percentage.toFixed(1)}%</span>
              {#if group.canVote}
                <span class="vote-badge">🗳️</span>
              {:else}
                <span class="no-vote-badge">🔒</span>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Családi statisztikák -->
    {#if familyStats}
      <div class="family-stats">
        <h3>👨‍👩‍👧 Családi adatok</h3>
        <div class="family-grid">
          <div class="family-stat">
            <span class="family-value">{formatNumber(familyStats.totalFamilies)}</span>
            <span class="family-label">Család</span>
          </div>
          <div class="family-stat">
            <span class="family-value">{familyStats.averageFamilySize.toFixed(1)}</span>
            <span class="family-label">Átlagos családméret</span>
          </div>
          <div class="family-stat highlight">
            <span class="family-value">{formatNumber(familyStats.multiGenerationalFamilies)}</span>
            <span class="family-label">Többgenerációs család</span>
          </div>
          <div class="family-stat">
            <span class="family-value">{formatNumber(familyStats.familiesWithChildren)}</span>
            <span class="family-label">Gyermekes család</span>
          </div>
        </div>

        <!-- Cél: következő tábor -->
        <div class="camp-target">
          <h4>🏕️ Cél: Következő gyermektábor</h4>
          <div class="target-progress">
            <div class="progress-info">
              <span>Jelenlegi: {formatNumber(familyStats.childrenCount)} gyermek</span>
              <span>Cél: {formatNumber(familyStats.targetChildrenByNextCamp)} gyermek</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                style="width: {familyStats.currentProgress}%"
              ></div>
            </div>
            <span class="progress-percent">{familyStats.currentProgress.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    {/if}

    <!-- Generációs piramis vizualizáció -->
    <div class="generation-pyramid">
      <h3>🔺 Generációs piramis</h3>
      <div class="pyramid-container">
        {#each [...generationalStats].reverse() as group}
          <div 
            class="pyramid-level"
            style="--level-width: {50 + (group.percentage * 0.5)}%; --level-color: {getAgeGroupColor(group.ageGroup)}"
          >
            <span class="pyramid-emoji">{group.emoji}</span>
            <span class="pyramid-label">{group.ageRange}</span>
            <span class="pyramid-count">{group.memberCount}</span>
          </div>
        {/each}
      </div>
    </div>

    <!-- Fiatal generáció fókusz -->
    <div class="youth-focus">
      <h3>🌟 Jövő generáció</h3>
      <div class="youth-cards">
        <div class="youth-card">
          <div class="youth-header">
            <span>👦 Kamaszok (14-17)</span>
            <span class="youth-highlight">2026-os szavazók!</span>
          </div>
          <div class="youth-stat">
            <span class="youth-number">{generationalStats.find(g => g.ageGroup === 'teen')?.memberCount || 0}</span>
            <span class="youth-label">tag</span>
          </div>
          <p class="youth-tip">
            🎯 Ők már 2026-ban szavazhatnak! Pajtás meghívó programmal érhetők el.
          </p>
        </div>
        
        <div class="youth-card">
          <div class="youth-header">
            <span>👧 Gyermekek (6-13)</span>
            <span class="youth-highlight">Táborok résztvevői</span>
          </div>
          <div class="youth-stat">
            <span class="youth-number">{generationalStats.find(g => g.ageGroup === 'child')?.memberCount || 0}</span>
            <span class="youth-label">tag</span>
          </div>
          <p class="youth-tip">
            🏕️ Nyári táborok, családi napok fő célcsoportja. Szülői meghívóval csatlakoznak.
          </p>
        </div>

        <div class="youth-card">
          <div class="youth-header">
            <span>👶 Kisgyermekek (0-5)</span>
            <span class="youth-highlight">Családi események</span>
          </div>
          <div class="youth-stat">
            <span class="youth-number">{generationalStats.find(g => g.ageGroup === 'toddler')?.memberCount || 0}</span>
            <span class="youth-label">tag</span>
          </div>
          <p class="youth-tip">
            👨‍👩‍👧 Családbarát programokon vesznek részt. Szülő regisztrálja őket.
          </p>
        </div>
      </div>
    </div>

    <!-- Akció javaslatok -->
    <div class="generation-actions">
      <h3>💡 Generációs akciók</h3>
      <div class="action-list">
        <div class="action-item">
          <span class="action-icon">🎓</span>
          <div class="action-content">
            <span class="action-title">Ifjúsági táborok szervezése</span>
            <span class="action-desc">Célcsoport: 6-17 évesek, cél: +50 résztvevő</span>
          </div>
        </div>
        <div class="action-item">
          <span class="action-icon">👨‍👩‍👧‍👦</span>
          <div class="action-content">
            <span class="action-title">Családi nap a körzetben</span>
            <span class="action-desc">Többgenerációs részvétel, meghívó generálás</span>
          </div>
        </div>
        <div class="action-item">
          <span class="action-icon">🤝</span>
          <div class="action-content">
            <span class="action-title">Pajtás meghívó kampány</span>
            <span class="action-desc">Kamaszok hívják meg barátaikat (szülő jóváhagyással)</span>
          </div>
        </div>
        <div class="action-item">
          <span class="action-icon">🗳️</span>
          <div class="action-content">
            <span class="action-title">Első szavazók programja</span>
            <span class="action-desc">14-17 évesek felkészítése a 2026-os választásra</span>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .generational-panel {
    padding: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .panel-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .panel-header h2 {
    font-size: 1.75rem;
    color: #1e293b;
    margin: 0;
  }

  .subtitle {
    color: #64748b;
    margin-top: 0.5rem;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 3rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e2e8f0;
    border-top-color: #2d5016;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Summary Cards */
  .summary-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .summary-card {
    background: white;
    border-radius: 12px;
    padding: 1.25rem;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    border: 2px solid transparent;
  }

  .summary-card.total {
    border-color: #2d5016;
    background: #f0fdf4;
  }

  .summary-card.voters {
    border-color: #0ea5e9;
    background: #f0f9ff;
  }

  .summary-card.youth {
    border-color: #f59e0b;
    background: #fffbeb;
  }

  .summary-card.future {
    border-color: #8b5cf6;
    background: #faf5ff;
  }

  .card-icon {
    font-size: 2rem;
    display: block;
    margin-bottom: 0.5rem;
  }

  .card-value {
    display: block;
    font-size: 1.75rem;
    font-weight: 700;
    color: #1e293b;
  }

  .card-label {
    display: block;
    font-size: 0.85rem;
    color: #64748b;
  }

  /* Age Distribution */
  .age-distribution {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .age-distribution h3 {
    margin: 0 0 1.5rem 0;
    color: #1e293b;
  }

  .age-bars {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .age-row {
    display: grid;
    grid-template-columns: 180px 1fr 100px;
    gap: 1rem;
    align-items: center;
  }

  .age-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .age-emoji {
    font-size: 1.25rem;
  }

  .age-label {
    font-weight: 500;
    color: #1e293b;
  }

  .age-range {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .age-bar-container {
    height: 32px;
    background: #f1f5f9;
    border-radius: 8px;
    overflow: hidden;
  }

  .age-bar {
    height: 100%;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 0.75rem;
    transition: width 0.5s ease;
  }

  .age-count {
    font-weight: 600;
    color: rgba(0,0,0,0.7);
    font-size: 0.9rem;
  }

  .age-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .age-percent {
    font-weight: 600;
    color: #64748b;
  }

  .vote-badge, .no-vote-badge {
    font-size: 0.9rem;
  }

  /* Family Stats */
  .family-stats {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .family-stats h3 {
    margin: 0 0 1.5rem 0;
    color: #1e293b;
  }

  .family-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .family-stat {
    text-align: center;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
  }

  .family-stat.highlight {
    background: #dcfce7;
    border: 2px solid #22c55e;
  }

  .family-value {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
  }

  .family-label {
    display: block;
    font-size: 0.8rem;
    color: #64748b;
    margin-top: 0.25rem;
  }

  .camp-target {
    padding: 1rem;
    background: #fef3c7;
    border-radius: 8px;
  }

  .camp-target h4 {
    margin: 0 0 1rem 0;
    color: #92400e;
  }

  .target-progress {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: #78350f;
  }

  .progress-bar {
    height: 12px;
    background: rgba(255,255,255,0.8);
    border-radius: 6px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #f59e0b, #eab308);
    border-radius: 6px;
    transition: width 0.5s ease;
  }

  .progress-percent {
    text-align: center;
    font-weight: 600;
    color: #92400e;
  }

  /* Generation Pyramid */
  .generation-pyramid {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .generation-pyramid h3 {
    margin: 0 0 1.5rem 0;
    color: #1e293b;
    text-align: center;
  }

  .pyramid-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .pyramid-level {
    width: var(--level-width);
    background: var(--level-color);
    padding: 0.5rem 1rem;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: width 0.3s ease;
  }

  .pyramid-emoji {
    font-size: 1.1rem;
  }

  .pyramid-label {
    font-size: 0.85rem;
    color: rgba(0,0,0,0.7);
  }

  .pyramid-count {
    font-weight: 600;
    color: rgba(0,0,0,0.8);
  }

  /* Youth Focus */
  .youth-focus {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .youth-focus h3 {
    margin: 0 0 1.5rem 0;
    color: #1e293b;
  }

  .youth-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .youth-card {
    padding: 1rem;
    background: #f8fafc;
    border-radius: 12px;
    border: 2px solid #e2e8f0;
  }

  .youth-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    font-weight: 500;
  }

  .youth-highlight {
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
    background: #fef3c7;
    color: #92400e;
    border-radius: 4px;
  }

  .youth-stat {
    text-align: center;
    margin: 1rem 0;
  }

  .youth-number {
    display: block;
    font-size: 2rem;
    font-weight: 700;
    color: #2d5016;
  }

  .youth-label {
    color: #64748b;
  }

  .youth-tip {
    margin: 0;
    font-size: 0.85rem;
    color: #64748b;
    line-height: 1.5;
    padding: 0.75rem;
    background: white;
    border-radius: 8px;
  }

  /* Generation Actions */
  .generation-actions {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .generation-actions h3 {
    margin: 0 0 1.5rem 0;
    color: #1e293b;
  }

  .action-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .action-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
    border-left: 4px solid #2d5016;
  }

  .action-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .action-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .action-title {
    font-weight: 600;
    color: #1e293b;
  }

  .action-desc {
    font-size: 0.85rem;
    color: #64748b;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .summary-cards {
      grid-template-columns: repeat(2, 1fr);
    }

    .family-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .age-row {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }

    .youth-cards {
      grid-template-columns: 1fr;
    }

    .action-list {
      grid-template-columns: 1fr;
    }
  }
</style>
