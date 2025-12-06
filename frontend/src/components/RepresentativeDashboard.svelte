<script lang="ts">
  import { onMount } from 'svelte';
  import RepresentativeChanceCalculator from './RepresentativeChanceCalculator.svelte';
  import GenerationalReachPanel from './GenerationalReachPanel.svelte';
  import InviteSystem from './InviteSystem.svelte';
  import VotingPanel from './VotingPanel.svelte';
  import type { RepresentativeDashboardData } from '../types/representative.types';

  // Aktív nézet kezelés
  type ViewType = 'overview' | 'chance' | 'generation' | 'invite' | 'voting';
  let activeView: ViewType = 'overview';

  // Dashboard adatok
  let dashboardData: Partial<RepresentativeDashboardData> | null = null;
  let selectedConstituencyId = '';
  let isLoading = true;

  // Mock körzetek
  const constituencies = [
    { id: 'OEVK-19', name: 'Bács-Kiskun 01 (Kecskemét)', county: 'Bács-Kiskun' },
    { id: 'OEVK-30', name: 'Békés 01', county: 'Békés' },
    { id: 'OEVK-35', name: 'Borsod 01', county: 'Borsod-Abaúj-Zemplén' },
    { id: 'OEVK-01', name: 'Budapest 01', county: 'Budapest' },
    { id: 'OEVK-42', name: 'Csongrád 01 (Szeged)', county: 'Csongrád-Csanád' },
    { id: 'OEVK-07', name: 'Pest 07', county: 'Pest' }
  ];

  onMount(() => {
    // Alapértelmezett körzet
    selectedConstituencyId = 'OEVK-19';
    loadDashboardData();
  });

  function loadDashboardData() {
    isLoading = true;
    
    // Mock adat betöltés
    setTimeout(() => {
      dashboardData = {
        representativeId: 'rep-001',
        representativeName: 'Dr. Kovács Miklós',
        constituencyId: selectedConstituencyId,
        constituencyName: constituencies.find(c => c.id === selectedConstituencyId)?.name || '',
        platformStats: {
          totalMembers: 523,
          activeLastMonth: 312,
          newThisMonth: 45,
          growthRate: 8.6
        },
        recommendations: [
          {
            id: 'rec-1',
            priority: 'high',
            category: 'mobilization',
            title: 'Platform tagszerzés',
            description: 'A körzeti szavazók 15%-a van a platformon. Cél: 30%',
            targetMetric: 'Platform lefedettség',
            currentValue: 15,
            targetValue: 30,
            estimatedImpact: '+780 potenciális aktív tag'
          },
          {
            id: 'rec-2',
            priority: 'high',
            category: 'youth',
            title: 'Ifjúsági program',
            description: '89 kamasz tag 2026-ra szavazókorú lesz',
            targetMetric: 'Első szavazók',
            currentValue: 89,
            targetValue: 150,
            estimatedImpact: '+89 biztos szavazó 2026-ban'
          },
          {
            id: 'rec-3',
            priority: 'medium',
            category: 'family',
            title: 'Családi napok',
            description: 'Többgenerációs események a családok elérésére',
            targetMetric: 'Családok száma',
            currentValue: 156,
            targetValue: 250,
            estimatedImpact: '+94 új család'
          }
        ]
      };
      isLoading = false;
    }, 500);
  }

  function handleConstituencyChange() {
    loadDashboardData();
  }

  function formatNumber(n: number): string {
    return n.toLocaleString('hu-HU');
  }

  function getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return '#dc2626';
      case 'medium': return '#f59e0b';
      case 'low': return '#64748b';
      default: return '#64748b';
    }
  }

  function getCategoryIcon(category: string): string {
    switch (category) {
      case 'mobilization': return '📢';
      case 'youth': return '🌱';
      case 'family': return '👨‍👩‍👧';
      case 'event': return '🎪';
      case 'outreach': return '🤝';
      default: return '💡';
    }
  }
</script>

<div class="representative-dashboard">
  <!-- Header -->
  <div class="dashboard-header">
    <div class="header-left">
      <h1>🏛️ Képviselői Dashboard</h1>
      <p class="subtitle">Mi Hazánk - Körzeti eszközök és elemzések</p>
    </div>
    <div class="header-right">
      <label class="constituency-select">
        <span>Körzet:</span>
        <select 
          bind:value={selectedConstituencyId}
          on:change={handleConstituencyChange}
        >
          {#each constituencies as c}
            <option value={c.id}>{c.name}</option>
          {/each}
        </select>
      </label>
    </div>
  </div>

  <!-- Navigáció -->
  <nav class="dashboard-nav">
    <button 
      class="nav-btn" 
      class:active={activeView === 'overview'}
      on:click={() => activeView = 'overview'}
    >
      📊 Áttekintés
    </button>
    <button 
      class="nav-btn" 
      class:active={activeView === 'chance'}
      on:click={() => activeView = 'chance'}
    >
      🎯 Esélykalkulátor
    </button>
    <button 
      class="nav-btn" 
      class:active={activeView === 'generation'}
      on:click={() => activeView = 'generation'}
    >
      👨‍👩‍👧‍👦 Generációs elérés
    </button>
    <button 
      class="nav-btn" 
      class:active={activeView === 'invite'}
      on:click={() => activeView = 'invite'}
    >
      📨 Meghívó rendszer
    </button>
    <button 
      class="nav-btn" 
      class:active={activeView === 'voting'}
      on:click={() => activeView = 'voting'}
    >
      🗳️ Szavazások
    </button>
  </nav>

  <!-- Tartalom -->
  <div class="dashboard-content">
    {#if isLoading}
      <div class="loading">
        <div class="spinner"></div>
        <p>Adatok betöltése...</p>
      </div>
    {:else if activeView === 'overview' && dashboardData}
      <!-- Áttekintés nézet -->
      <div class="overview-view">
        <!-- Gyors statisztikák -->
        <div class="quick-stats">
          <div class="stat-card green">
            <span class="stat-icon">👥</span>
            <div class="stat-content">
              <span class="stat-value">{formatNumber(dashboardData.platformStats?.totalMembers || 0)}</span>
              <span class="stat-label">Platform tag</span>
            </div>
          </div>
          <div class="stat-card blue">
            <span class="stat-icon">🔥</span>
            <div class="stat-content">
              <span class="stat-value">{formatNumber(dashboardData.platformStats?.activeLastMonth || 0)}</span>
              <span class="stat-label">Aktív (30 nap)</span>
            </div>
          </div>
          <div class="stat-card orange">
            <span class="stat-icon">✨</span>
            <div class="stat-content">
              <span class="stat-value">+{formatNumber(dashboardData.platformStats?.newThisMonth || 0)}</span>
              <span class="stat-label">Új tag (hónap)</span>
            </div>
          </div>
          <div class="stat-card purple">
            <span class="stat-icon">📈</span>
            <div class="stat-content">
              <span class="stat-value">+{dashboardData.platformStats?.growthRate || 0}%</span>
              <span class="stat-label">Növekedés</span>
            </div>
          </div>
        </div>

        <!-- Körzet info -->
        <div class="constituency-info">
          <h2>📍 {dashboardData.constituencyName}</h2>
          <p>Képviselő: <strong>{dashboardData.representativeName}</strong></p>
        </div>

        <!-- Gyors elérés kártyák -->
        <div class="quick-access">
          <button class="access-card" on:click={() => activeView = 'chance'}>
            <span class="access-icon">🎯</span>
            <span class="access-title">Esélykalkulátor</span>
            <span class="access-desc">2022 eredmények és 2026 célok</span>
          </button>
          <button class="access-card" on:click={() => activeView = 'generation'}>
            <span class="access-icon">👨‍👩‍👧‍👦</span>
            <span class="access-title">Generációs elérés</span>
            <span class="access-desc">Korosztály elemzés és családok</span>
          </button>
          <button class="access-card" on:click={() => activeView = 'invite'}>
            <span class="access-icon">📨</span>
            <span class="access-title">Meghívó rendszer</span>
            <span class="access-desc">Tagszerzés és családi meghívók</span>
          </button>
        </div>

        <!-- Prioritásos javaslatok -->
        {#if dashboardData.recommendations && dashboardData.recommendations.length > 0}
          <div class="recommendations-section">
            <h3>💡 Prioritásos akciók</h3>
            <div class="recommendations-grid">
              {#each dashboardData.recommendations as rec}
                <div class="recommendation-card" style="border-left-color: {getPriorityColor(rec.priority)}">
                  <div class="rec-header">
                    <span class="rec-category">{getCategoryIcon(rec.category)}</span>
                    <span class="rec-title">{rec.title}</span>
                    <span class="rec-priority" style="background: {getPriorityColor(rec.priority)}">
                      {rec.priority === 'high' ? 'Sürgős' : rec.priority === 'medium' ? 'Fontos' : 'Opcionális'}
                    </span>
                  </div>
                  <p class="rec-desc">{rec.description}</p>
                  <div class="rec-progress">
                    <div class="progress-label">
                      <span>{rec.targetMetric}</span>
                      <span>{rec.currentValue} / {rec.targetValue}</span>
                    </div>
                    <div class="progress-bar">
                      <div 
                        class="progress-fill" 
                        style="width: {Math.min(100, (rec.currentValue / rec.targetValue) * 100)}%"
                      ></div>
                    </div>
                  </div>
                  <div class="rec-impact">
                    <span>📊 Várható hatás:</span>
                    <strong>{rec.estimatedImpact}</strong>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <!-- 2026 countdown -->
        <div class="countdown-section">
          <h3>⏳ Visszaszámlálás 2026-ig</h3>
          <div class="countdown-display">
            <div class="countdown-item">
              <span class="countdown-value" id="days">---</span>
              <span class="countdown-label">nap</span>
            </div>
            <div class="countdown-item">
              <span class="countdown-value" id="months">---</span>
              <span class="countdown-label">hónap</span>
            </div>
          </div>
          <p class="countdown-message">Minden nap számít a felkészülésben!</p>
        </div>
      </div>

    {:else if activeView === 'chance'}
      <RepresentativeChanceCalculator />

    {:else if activeView === 'generation'}
      <GenerationalReachPanel 
        constituencyId={selectedConstituencyId}
        constituencyName={dashboardData?.constituencyName || ''}
      />

    {:else if activeView === 'invite'}
      <InviteSystem />

    {:else if activeView === 'voting'}
      <VotingPanel 
        constituencyId={selectedConstituencyId}
        constituencyName={dashboardData?.constituencyName || constituencies.find(c => c.id === selectedConstituencyId)?.name || ''}
        isRepresentative={true}
      />
    {/if}
  </div>
</div>

<style>
  .representative-dashboard {
    min-height: 100vh;
    background: #f8fafc;
  }

  /* Header */
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    background: linear-gradient(135deg, #2d5016 0%, #3d6b1f 100%);
    color: white;
  }

  .header-left h1 {
    margin: 0;
    font-size: 1.75rem;
  }

  .subtitle {
    margin: 0.25rem 0 0 0;
    opacity: 0.9;
  }

  .constituency-select {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .constituency-select span {
    font-weight: 500;
  }

  .constituency-select select {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    background: white;
    color: #1e293b;
    cursor: pointer;
  }

  /* Navigation */
  .dashboard-nav {
    display: flex;
    gap: 0.25rem;
    padding: 0.5rem 2rem;
    background: white;
    border-bottom: 2px solid #e2e8f0;
  }

  .nav-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1rem;
    color: #64748b;
    border-radius: 8px 8px 0 0;
    transition: all 0.2s;
  }

  .nav-btn:hover {
    background: #f1f5f9;
    color: #1e293b;
  }

  .nav-btn.active {
    background: #2d5016;
    color: white;
  }

  /* Content */
  .dashboard-content {
    padding: 2rem;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #e2e8f0;
    border-top-color: #2d5016;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Overview View */
  .overview-view {
    max-width: 1200px;
    margin: 0 auto;
  }

  .quick-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .stat-card.green {
    border-left: 4px solid #22c55e;
  }

  .stat-card.blue {
    border-left: 4px solid #3b82f6;
  }

  .stat-card.orange {
    border-left: 4px solid #f59e0b;
  }

  .stat-card.purple {
    border-left: 4px solid #8b5cf6;
  }

  .stat-icon {
    font-size: 2rem;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
  }

  .stat-label {
    font-size: 0.85rem;
    color: #64748b;
  }

  .constituency-info {
    padding: 1.5rem;
    background: white;
    border-radius: 12px;
    margin-bottom: 2rem;
    text-align: center;
  }

  .constituency-info h2 {
    margin: 0;
    color: #1e293b;
  }

  .constituency-info p {
    margin: 0.5rem 0 0 0;
    color: #64748b;
  }

  /* Quick Access Cards */
  .quick-access {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .access-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
  }

  .access-card:hover {
    border-color: #2d5016;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .access-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .access-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.25rem;
  }

  .access-desc {
    font-size: 0.85rem;
    color: #64748b;
  }

  /* Recommendations */
  .recommendations-section {
    margin-bottom: 2rem;
  }

  .recommendations-section h3 {
    margin: 0 0 1rem 0;
    color: #1e293b;
  }

  .recommendations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1rem;
  }

  .recommendation-card {
    padding: 1.25rem;
    background: white;
    border-radius: 12px;
    border-left: 4px solid;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .rec-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .rec-category {
    font-size: 1.25rem;
  }

  .rec-title {
    flex: 1;
    font-weight: 600;
    color: #1e293b;
  }

  .rec-priority {
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    color: white;
    text-transform: uppercase;
    font-weight: 600;
  }

  .rec-desc {
    margin: 0 0 1rem 0;
    color: #64748b;
    font-size: 0.9rem;
  }

  .rec-progress {
    margin-bottom: 0.75rem;
  }

  .progress-label {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: #64748b;
    margin-bottom: 0.25rem;
  }

  .progress-bar {
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #2d5016, #4ade80);
    border-radius: 4px;
    transition: width 0.5s ease;
  }

  .rec-impact {
    font-size: 0.85rem;
    color: #475569;
    padding-top: 0.75rem;
    border-top: 1px solid #e2e8f0;
  }

  .rec-impact strong {
    color: #22c55e;
  }

  /* Countdown */
  .countdown-section {
    padding: 2rem;
    background: linear-gradient(135deg, #2d5016 0%, #3d6b1f 100%);
    border-radius: 12px;
    color: white;
    text-align: center;
  }

  .countdown-section h3 {
    margin: 0 0 1.5rem 0;
  }

  .countdown-display {
    display: flex;
    justify-content: center;
    gap: 3rem;
    margin-bottom: 1rem;
  }

  .countdown-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .countdown-value {
    font-size: 3rem;
    font-weight: 700;
    font-family: monospace;
  }

  .countdown-label {
    font-size: 1rem;
    opacity: 0.9;
  }

  .countdown-message {
    margin: 0;
    opacity: 0.9;
    font-size: 1.1rem;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .dashboard-header {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }

    .dashboard-nav {
      flex-wrap: wrap;
      padding: 0.5rem 1rem;
    }

    .nav-btn {
      flex: 1;
      min-width: 120px;
    }

    .quick-stats {
      grid-template-columns: repeat(2, 1fr);
    }

    .quick-access {
      grid-template-columns: 1fr;
    }

    .countdown-display {
      gap: 2rem;
    }

    .countdown-value {
      font-size: 2rem;
    }
  }
</style>
