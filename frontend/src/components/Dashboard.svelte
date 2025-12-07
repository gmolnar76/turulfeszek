<script lang="ts">
  import HungaryMap from './HungaryMap.svelte';
  import ActivityChart from './ActivityChart.svelte';
  import CityPanel from './CityPanel.svelte';
  import ElectionAnalysisPage from './ElectionAnalysisPage.svelte';
  import CommunityParticipation from './CommunityParticipation.svelte';
  import UserProfile from './UserProfile.svelte';
  import IdeasPage from './IdeasPage.svelte';
  import RepresentativeDashboard from './RepresentativeDashboard.svelte';
  import MarketplaceDashboard from './MarketplaceDashboard.svelte';
  import AboutPage from './AboutPage.svelte';
  import { loadElectionData, loadAvailableElections, selectedElection } from '../stores/electionStore';
  import { onMount } from 'svelte';

  let selectedElectionId = '2022-parliament';
  let tabView: 'about' | 'activity' | 'election-analysis' | 'representative' | 'community' | 'ideas' | 'marketplace' | 'profile' = 'about';

  selectedElection.subscribe(v => {
    selectedElectionId = v;
  });

  onMount(async () => {
    try {
      await loadAvailableElections();
      await loadElectionData('2022-parliament');
    } catch (error) {
      console.error('Error loading election data:', error);
    }
  });

  async function handleElectionChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    const electionId = target.value;
    try {
      await loadElectionData(electionId);
      selectedElection.set(electionId);
    } catch (error) {
      console.error('Error loading election data:', error);
    }
  }
</script>

<div class="dashboard">
  <div class="dashboard-header">
    <h1>🇭🇺 Magyarország - Közösségi Adatelemzés</h1>
    <div class="controls">
      <label for="election-select">Választás:</label>
      <select id="election-select" value={selectedElectionId} on:change={handleElectionChange}>
        <option value="2022-parliament">2022 - Országgyűlési</option>
        <option value="2023-local">2023 - Önkormányzati</option>
      </select>
    </div>
  </div>

  <div class="tab-buttons">
    <button
      class="tab-btn"
      class:active={tabView === 'about'}
      on:click={() => (tabView = 'about')}
    >
      🦅 Bemutatkozás
    </button>
    <button
      class="tab-btn"
      class:active={tabView === 'activity'}
      on:click={() => (tabView = 'activity')}
    >
      📊 Aktivitás
    </button>
    <button
      class="tab-btn"
      class:active={tabView === 'election-analysis'}
      on:click={() => (tabView = 'election-analysis')}
    >
      🗳️ Választási Elemzés
    </button>
    <button
      class="tab-btn"
      class:active={tabView === 'representative'}
      on:click={() => (tabView = 'representative')}
    >
      🏛️ Képviselői
    </button>
    <button
      class="tab-btn"
      class:active={tabView === 'community'}
      on:click={() => (tabView = 'community')}
    >
      🇭🇺 Nemzeti Ünnep
    </button>
    <button
      class="tab-btn"
      class:active={tabView === 'ideas'}
      on:click={() => (tabView = 'ideas')}
    >
      💡 Ötletek
    </button>
    <button
      class="tab-btn"
      class:active={tabView === 'marketplace'}
      on:click={() => (tabView = 'marketplace')}
    >
      🛒 Piactér
    </button>
    <button
      class="tab-btn"
      class:active={tabView === 'profile'}
      on:click={() => (tabView = 'profile')}
    >
      👤 Profil
    </button>
  </div>

  <div class="dashboard-container">
    {#if tabView === 'about'}
      <div class="about-section">
        <AboutPage />
      </div>
    {:else if tabView === 'activity'}
      <div class="map-section">
        <HungaryMap />
      </div>

      <div class="right-column">
        <div class="chart-section">
          <ActivityChart />
        </div>

        <div class="panel-section">
          <CityPanel />
        </div>
      </div>
    {:else if tabView === 'election-analysis'}
      <div class="election-analysis-section">
        <ElectionAnalysisPage />
      </div>
    {:else if tabView === 'representative'}
      <div class="representative-section">
        <RepresentativeDashboard />
      </div>
    {:else if tabView === 'community'}
      <div class="community-section">
        <CommunityParticipation />
      </div>
    {:else if tabView === 'ideas'}
      <div class="ideas-section">
        <IdeasPage />
      </div>
    {:else if tabView === 'marketplace'}
      <div class="marketplace-section">
        <MarketplaceDashboard />
      </div>
    {:else if tabView === 'profile'}
      <div class="profile-section">
        <UserProfile />
      </div>
    {/if}
  </div>
</div>

<style>
  .dashboard {
    width: 100%;
    min-height: 100vh;
    background-color: #f3f4f6;
    padding: 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
      Cantarell, 'Helvetica Neue', sans-serif;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .dashboard-header {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
  }

  .dashboard-header h1 {
    margin: 0;
    font-size: 1.8rem;
    color: #2c3e50;
    flex: 1;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .controls label {
    font-weight: 600;
    color: #555;
  }

  .controls select {
    padding: 8px 12px;
    border: 2px solid #ddd;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  .controls select:hover {
    border-color: #8B5CF6;
  }

  .controls select:focus {
    outline: none;
    border-color: #8B5CF6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }

  .tab-buttons {
    display: flex;
    gap: 12px;
    background: white;
    padding: 12px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .tab-btn {
    padding: 10px 20px;
    border: 2px solid #ddd;
    background: white;
    color: #555;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
  }

  .tab-btn:hover {
    border-color: #8B5CF6;
    color: #8B5CF6;
  }

  .tab-btn.active {
    background: #8B5CF6;
    border-color: #8B5CF6;
    color: white;
  }

  .dashboard-container {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 16px;
    min-height: 500px;
    height: calc(100vh - 300px);
  }

  .election-analysis-section {
    grid-column: 1 / -1;
    overflow-y: auto;
    max-height: calc(100vh - 200px);
    background: #f3f4f6;
    border-radius: 8px;
  }

  .representative-section {
    grid-column: 1 / -1;
    overflow-y: auto;
    max-height: calc(100vh - 200px);
    background: #f8fafc;
    border-radius: 8px;
  }

  .community-section {
    grid-column: 1 / -1;
    overflow: auto;
    background: white;
    border-radius: 8px;
  }

  .ideas-section {
    grid-column: 1 / -1;
    overflow: auto;
    background: white;
    border-radius: 8px;
  }

  .profile-section {
    grid-column: 1 / -1;
    overflow: auto;
    background: white;
    border-radius: 8px;
  }

  .marketplace-section {
    grid-column: 1 / -1;
    overflow: auto;
    background: #f3f4f6;
    border-radius: 8px;
  }

  .about-section {
    grid-column: 1 / -1;
    overflow: auto;
    background: #f3f4f6;
    border-radius: 8px;
    padding: 24px;
  }

  .map-section {
    width: 100%;
    height: 100%;
    min-height: 0;
    grid-row: 1 / 2;
    grid-column: 1 / 2;
  }

  .right-column {
    display: grid;
    grid-template-rows: 1fr 1fr;
    gap: 16px;
    min-height: 0;
    grid-row: 1 / 3;
    grid-column: 2 / 3;
  }

  .chart-section {
    width: 100%;
    height: 100%;
    min-height: 0;
  }

  .panel-section {
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  @media (max-width: 1200px) {
    .dashboard-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .dashboard-header h1 {
      width: 100%;
    }

    .dashboard-container {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
    }

    .right-column {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto;
    }

    .election-analysis-section {
      grid-column: 1;
    }
  }

  @media (max-width: 768px) {
    .dashboard {
      padding: 8px;
      gap: 8px;
    }

    .dashboard-header {
      padding: 12px;
    }

    .dashboard-header h1 {
      font-size: 1.3rem;
    }

    .tab-buttons {
      padding: 8px;
    }

    .tab-btn {
      padding: 8px 16px;
      font-size: 0.9rem;
    }
  }
</style>
