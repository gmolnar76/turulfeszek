<script lang="ts">
  import { onMount } from 'svelte';
  import type { 
    FilterLevel, 
    ElectionFilter, 
    CountyId, 
    ConstituencyData,
    SettlementElectionData,
    PartyVotingResult,
    RegionElectionData
  } from '../types/election.types';
  import { COUNTY_NAMES } from '../types/election.types';
  import { 
    selectedElection, 
    selectedParty, 
    partyColors, 
    partyNames,
    loadElectionData,
    currentElectionData
  } from '../stores/electionStore';

  // ============================================================================
  // STATE VÁLTOZÓK
  // ============================================================================
  
  let filterLevel: FilterLevel = 'orszagos';
  let selectedCounty: CountyId | '' = '';
  let selectedSettlement: string = '';
  let selectedConstituency: string = '';
  let compareElection: string = '';
  
  let electionData: any = null;
  let filteredData: any = null;
  let constituencies: ConstituencyData[] = [];
  let isLoading = true;
  let error: string | null = null;

  // Párt színek és nevek
  let partyColorMap: Record<string, string> = {};
  let partyNameMap: Record<string, string> = {};
  
  partyColors.subscribe(v => { partyColorMap = v; });
  partyNames.subscribe(v => { partyNameMap = v; });

  // Aktív választás
  let currentElectionId = '';
  selectedElection.subscribe(v => { currentElectionId = v; });

  // ============================================================================
  // ADATBETÖLTÉS
  // ============================================================================

  onMount(async () => {
    await loadFullElectionData();
  });

  async function loadFullElectionData() {
    isLoading = true;
    error = null;
    
    try {
      // Betöltjük a teljes 2022-es adatokat
      const response = await fetch('/api/elections/2022-parliament-full');
      
      if (!response.ok) {
        // Ha nincs API, próbáljuk a lokális JSON-t
        const localData = await import('../../../backend/data/elections/2022-parliament-full.json');
        electionData = localData.default || localData;
      } else {
        const result = await response.json();
        electionData = result.data || result;
      }
      
      constituencies = electionData?.constituencies || [];
      applyFilters();
    } catch (err) {
      console.error('Hiba az adatok betöltésekor:', err);
      error = 'Nem sikerült betölteni a választási adatokat';
      
      // Fallback: mock adatok
      electionData = getMockElectionData();
      constituencies = electionData.constituencies || [];
      applyFilters();
    } finally {
      isLoading = false;
    }
  }

  // ============================================================================
  // SZŰRÉS
  // ============================================================================

  function applyFilters() {
    if (!electionData) return;
    
    filteredData = { ...electionData };
    
    if (filterLevel === 'orszagos') {
      // Országos szint - minden adat
      filteredData = electionData;
    } else if (filterLevel === 'megye' && selectedCounty) {
      // Megye szűrés
      const region = electionData.regionResults?.find(
        (r: RegionElectionData) => r.countyId === selectedCounty
      );
      filteredData = {
        ...electionData,
        regionResults: region ? [region] : [],
        constituencies: constituencies.filter(c => c.countyId === selectedCounty)
      };
    } else if (filterLevel === 'varos' && selectedSettlement) {
      // Település szűrés
      const settlement = findSettlement(selectedSettlement);
      filteredData = {
        ...electionData,
        selectedSettlement: settlement
      };
    } else if (filterLevel === 'valasztokorzet' && selectedConstituency) {
      // OEVK szűrés
      const constituency = constituencies.find(c => c.constituencyId === selectedConstituency);
      filteredData = {
        ...electionData,
        selectedConstituency: constituency
      };
    }
  }

  function findSettlement(settlementId: string): SettlementElectionData | null {
    for (const region of electionData?.regionResults || []) {
      const settlement = region.settlementResults?.find(
        (s: SettlementElectionData) => s.settlementId === settlementId
      );
      if (settlement) return settlement;
    }
    return null;
  }

  // Reaktív szűrés
  $: if (filterLevel || selectedCounty || selectedSettlement || selectedConstituency) {
    applyFilters();
  }

  // ============================================================================
  // SZÁMÍTOTT ÉRTÉKEK
  // ============================================================================

  $: availableCounties = Object.entries(COUNTY_NAMES) as [CountyId, string][];
  
  $: availableSettlements = electionData?.regionResults?.flatMap(
    (r: RegionElectionData) => r.settlementResults?.map((s: SettlementElectionData) => ({
      id: s.settlementId,
      name: s.settlementName,
      countyId: r.countyId
    })) || []
  ).filter((s: any) => !selectedCounty || s.countyId === selectedCounty) || [];

  $: availableConstituencies = constituencies
    .filter(c => !selectedCounty || c.countyId === selectedCounty)
    .sort((a, b) => a.constituencyNumber - b.constituencyNumber);

  $: competitiveConstituencies = constituencies.filter(c => c.isCompetitive);
  
  $: totalMandates = electionData?.mandateDistribution?.reduce(
    (sum: number, m: any) => sum + m.totalMandates, 0
  ) || 199;

  // ============================================================================
  // HELPER FUNKCIÓK
  // ============================================================================

  function formatNumber(num: number): string {
    return num?.toLocaleString('hu-HU') || '0';
  }

  function formatPercent(num: number): string {
    return `${(num || 0).toFixed(1)}%`;
  }

  function getPartyColor(partyId: string): string {
    const colors: Record<string, string> = {
      'fidesz-kdnp': '#FF6600',
      'ellenzek': '#0066CC',
      'mi-hazank': '#006600',
      'mkkp': '#999999',
      ...partyColorMap
    };
    return colors[partyId] || '#888888';
  }

  function getMockElectionData() {
    return {
      electionId: '2022-parliament',
      electionName: '2022. április 3. - Országgyűlési választások',
      totalRegisteredVoters: 8220473,
      totalParticipation: 5598037,
      participationRate: 68.1,
      nationalPartyResults: [
        { partyId: 'fidesz-kdnp', partyName: 'FIDESZ-KDNP', votes: 3060706, percentage: 54.13 },
        { partyId: 'ellenzek', partyName: 'Egységben Magyarországért', votes: 1942696, percentage: 34.37 },
        { partyId: 'mi-hazank', partyName: 'Mi Hazánk Mozgalom', votes: 339986, percentage: 6.02 },
        { partyId: 'mkkp', partyName: 'MKKP', votes: 180139, percentage: 3.19 }
      ],
      mandateDistribution: [
        { partyId: 'fidesz-kdnp', partyName: 'FIDESZ-KDNP', listMandates: 53, individualMandates: 88, totalMandates: 135 },
        { partyId: 'ellenzek', partyName: 'Egységben Magyarországért', listMandates: 38, individualMandates: 18, totalMandates: 56 },
        { partyId: 'mi-hazank', partyName: 'Mi Hazánk Mozgalom', listMandates: 6, individualMandates: 0, totalMandates: 6 }
      ],
      constituencies: [],
      regionResults: []
    };
  }

  // Helper: legmagasabb százalékú párt megtalálása
  function getWinnerParty(partyResults: PartyVotingResult[] | undefined): PartyVotingResult | null {
    if (!partyResults || partyResults.length === 0) return null;
    return partyResults.reduce((max, p) => p.percentage > max.percentage ? p : max, partyResults[0]);
  }
</script>

<div class="election-analysis-page">
  <!-- FEJLÉC -->
  <header class="page-header">
    <h1>📊 Választási Elemzés</h1>
    <p class="subtitle">valasztas.hu - 2022. április 3. Országgyűlési választások</p>
  </header>

  <!-- SZŰRŐ PANEL -->
  <section class="filter-panel">
    <h2>🔍 Szűrés</h2>
    
    <div class="filter-controls">
      <div class="filter-group">
        <label for="filter-level">Szint:</label>
        <select id="filter-level" bind:value={filterLevel}>
          <option value="orszagos">🇭🇺 Országos</option>
          <option value="megye">🏛️ Megye</option>
          <option value="varos">🏙️ Város/Település</option>
          <option value="valasztokorzet">📍 Választókörzet (OEVK)</option>
        </select>
      </div>

      {#if filterLevel === 'megye' || filterLevel === 'varos' || filterLevel === 'valasztokorzet'}
        <div class="filter-group">
          <label for="county-select">Megye:</label>
          <select id="county-select" bind:value={selectedCounty}>
            <option value="">-- Válassz megyét --</option>
            {#each availableCounties as [id, name]}
              <option value={id}>{name}</option>
            {/each}
          </select>
        </div>
      {/if}

      {#if filterLevel === 'varos'}
        <div class="filter-group">
          <label for="settlement-select">Település:</label>
          <select id="settlement-select" bind:value={selectedSettlement}>
            <option value="">-- Válassz települést --</option>
            {#each availableSettlements as settlement}
              <option value={settlement.id}>{settlement.name}</option>
            {/each}
          </select>
        </div>
      {/if}

      {#if filterLevel === 'valasztokorzet'}
        <div class="filter-group">
          <label for="constituency-select">OEVK:</label>
          <select id="constituency-select" bind:value={selectedConstituency}>
            <option value="">-- Válassz körzetet --</option>
            {#each availableConstituencies as constituency}
              <option value={constituency.constituencyId}>
                {constituency.constituencyNumber}. {constituency.constituencyName}
              </option>
            {/each}
          </select>
        </div>
      {/if}
    </div>
  </section>

  {#if isLoading}
    <div class="loading">
      <span class="spinner">⏳</span>
      <p>Adatok betöltése...</p>
    </div>
  {:else if error}
    <div class="error">
      <span>❌</span>
      <p>{error}</p>
    </div>
  {:else}
    <!-- ORSZÁGOS ÖSSZESÍTÉS -->
    {#if filterLevel === 'orszagos' && electionData}
      <section class="national-summary">
        <h2>🗳️ Országos Eredmények</h2>
        
        <div class="summary-cards">
          <div class="summary-card">
            <div class="card-icon">👥</div>
            <div class="card-content">
              <span class="card-value">{formatNumber(electionData.totalRegisteredVoters)}</span>
              <span class="card-label">Névjegyzékben szereplő</span>
            </div>
          </div>
          
          <div class="summary-card">
            <div class="card-icon">✅</div>
            <div class="card-content">
              <span class="card-value">{formatNumber(electionData.totalParticipation)}</span>
              <span class="card-label">Szavazott</span>
            </div>
          </div>
          
          <div class="summary-card highlight">
            <div class="card-icon">📈</div>
            <div class="card-content">
              <span class="card-value">{formatPercent(electionData.participationRate)}</span>
              <span class="card-label">Részvételi arány</span>
            </div>
          </div>
          
          <div class="summary-card">
            <div class="card-icon">🏛️</div>
            <div class="card-content">
              <span class="card-value">{totalMandates}</span>
              <span class="card-label">Mandátum összesen</span>
            </div>
          </div>
        </div>

        <!-- PÁRTEREDMÉNYEK -->
        <div class="party-results">
          <h3>📊 Pártlistás eredmények</h3>
          
          <div class="party-bars">
            {#each electionData.nationalPartyResults || [] as party}
              <div class="party-bar-row">
                <div class="party-info">
                  <span class="party-color" style="background-color: {getPartyColor(party.partyId)}"></span>
                  <span class="party-name">{party.partyName}</span>
                </div>
                <div class="party-bar-container">
                  <div 
                    class="party-bar" 
                    style="width: {party.percentage}%; background-color: {getPartyColor(party.partyId)}"
                  ></div>
                </div>
                <div class="party-stats">
                  <span class="party-votes">{formatNumber(party.votes || party.listVotes)}</span>
                  <span class="party-percent">{formatPercent(party.percentage)}</span>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- MANDÁTUM ELOSZLÁS -->
        {#if electionData.mandateDistribution}
          <div class="mandate-distribution">
            <h3>🏛️ Mandátum eloszlás</h3>
            
            <div class="mandate-chart">
              {#each electionData.mandateDistribution as mandate}
                <div class="mandate-row">
                  <span class="mandate-party">{mandate.partyName}</span>
                  <div class="mandate-bars">
                    <div class="mandate-bar individual" style="width: {(mandate.individualMandates / 106) * 100}%">
                      <span>{mandate.individualMandates}</span>
                    </div>
                    <div class="mandate-bar list" style="width: {(mandate.listMandates / 93) * 100}%">
                      <span>{mandate.listMandates}</span>
                    </div>
                  </div>
                  <span class="mandate-total">{mandate.totalMandates}</span>
                </div>
              {/each}
            </div>
            
            <div class="mandate-legend">
              <span class="legend-item"><span class="legend-color individual"></span> Egyéni (106)</span>
              <span class="legend-item"><span class="legend-color list"></span> Listás (93)</span>
            </div>
          </div>
        {/if}
      </section>

      <!-- SZOROS KÖRZETEK -->
      {#if competitiveConstituencies.length > 0}
        <section class="competitive-constituencies">
          <h2>⚡ Szoros Körzetek (&lt; 5% különbség)</h2>
          
          <div class="constituency-list">
            {#each competitiveConstituencies as constituency}
              <div class="constituency-card competitive">
                <div class="constituency-header">
                  <span class="constituency-number">{constituency.constituencyNumber}.</span>
                  <span class="constituency-name">{constituency.constituencyName}</span>
                </div>
                <div class="constituency-result">
                  <span class="winner" style="color: {getPartyColor(constituency.winnerPartyId)}">
                    {constituency.candidateResults?.find(c => c.isWinner)?.candidateName || 'N/A'}
                  </span>
                  <span class="margin">+{formatPercent(constituency.marginOfVictory)}</span>
                </div>
                <div class="constituency-participation">
                  Részvétel: {formatPercent(constituency.participationRate)}
                </div>
              </div>
            {/each}
          </div>
        </section>
      {/if}
    {/if}

    <!-- MEGYE NÉZET -->
    {#if filterLevel === 'megye' && selectedCounty && filteredData}
      <section class="county-view">
        <h2>🏛️ {COUNTY_NAMES[selectedCounty]} eredményei</h2>
        
        {#if filteredData.regionResults?.[0]}
          {@const region = filteredData.regionResults[0]}
          
          <div class="summary-cards">
            <div class="summary-card">
              <div class="card-content">
                <span class="card-value">{formatNumber(region.totalRegisteredVoters)}</span>
                <span class="card-label">Névjegyzékben</span>
              </div>
            </div>
            <div class="summary-card">
              <div class="card-content">
                <span class="card-value">{formatNumber(region.totalVoters)}</span>
                <span class="card-label">Szavazott</span>
              </div>
            </div>
            <div class="summary-card highlight">
              <div class="card-content">
                <span class="card-value">{formatPercent(region.participationRate)}</span>
                <span class="card-label">Részvétel</span>
              </div>
            </div>
            <div class="summary-card">
              <div class="card-content">
                <span class="card-value">{region.constituencyCount || filteredData.constituencies?.length || 0}</span>
                <span class="card-label">OEVK</span>
              </div>
            </div>
          </div>

          <!-- Megyei párteredmények -->
          {#if region.aggregatedPartyResults}
            <div class="party-results">
              <h3>Párteredmények</h3>
              <div class="party-bars">
                {#each region.aggregatedPartyResults as party}
                  <div class="party-bar-row">
                    <div class="party-info">
                      <span class="party-color" style="background-color: {getPartyColor(party.partyId)}"></span>
                      <span class="party-name">{party.partyName}</span>
                    </div>
                    <div class="party-bar-container">
                      <div 
                        class="party-bar" 
                        style="width: {party.percentage}%; background-color: {getPartyColor(party.partyId)}"
                      ></div>
                    </div>
                    <div class="party-stats">
                      <span class="party-votes">{formatNumber(party.votes)}</span>
                      <span class="party-percent">{formatPercent(party.percentage)}</span>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Települések listája -->
          {#if region.settlementResults?.length > 0}
            <div class="settlements-list-section">
              <h3>📍 Települések</h3>
              <div class="settlements-table">
                {#each region.settlementResults as settlement}
                  {@const winnerParty = getWinnerParty(settlement.partyResults)}
                  <div class="settlement-row-data">
                    <span class="settlement-name">{settlement.settlementName}</span>
                    <span class="settlement-participation">{formatPercent(settlement.participationRate)}</span>
                    <span class="settlement-winner">
                      {#if winnerParty}
                        <span style="color: {getPartyColor(winnerParty.partyId)}">
                          {winnerParty.partyName}
                        </span>
                      {/if}
                    </span>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        {:else}
          <p class="no-data">Nincs adat a kiválasztott megyéhez.</p>
        {/if}
      </section>
    {/if}

    <!-- VÁLASZTÓKÖRZET NÉZET -->
    {#if filterLevel === 'valasztokorzet' && selectedConstituency && filteredData?.selectedConstituency}
      {@const constituency = filteredData.selectedConstituency}
      
      <section class="constituency-view">
        <h2>📍 {constituency.constituencyName}</h2>
        
        <div class="summary-cards">
          <div class="summary-card">
            <div class="card-content">
              <span class="card-value">{formatNumber(constituency.registeredVoters)}</span>
              <span class="card-label">Névjegyzékben</span>
            </div>
          </div>
          <div class="summary-card">
            <div class="card-content">
              <span class="card-value">{formatNumber(constituency.totalVoters)}</span>
              <span class="card-label">Szavazott</span>
            </div>
          </div>
          <div class="summary-card highlight">
            <div class="card-content">
              <span class="card-value">{formatPercent(constituency.participationRate)}</span>
              <span class="card-label">Részvétel</span>
            </div>
          </div>
          <div class="summary-card" class:competitive={constituency.isCompetitive}>
            <div class="card-content">
              <span class="card-value">{formatPercent(constituency.marginOfVictory)}</span>
              <span class="card-label">{constituency.isCompetitive ? '⚡ Szoros!' : 'Különbség'}</span>
            </div>
          </div>
        </div>

        <!-- Jelöltek eredményei -->
        <div class="candidates-results">
          <h3>👥 Egyéni jelöltek</h3>
          
          <div class="candidates-list">
            {#each constituency.candidateResults || [] as candidate, idx}
              <div class="candidate-card" class:winner={candidate.isWinner}>
                <div class="candidate-rank">
                  {#if candidate.isWinner}
                    🏆
                  {:else}
                    {idx + 1}.
                  {/if}
                </div>
                <div class="candidate-info">
                  <span class="candidate-name">{candidate.candidateName}</span>
                  <span class="candidate-party" style="color: {getPartyColor(candidate.partyId)}">
                    {candidate.partyName}
                  </span>
                </div>
                <div class="candidate-result">
                  <span class="candidate-votes">{formatNumber(candidate.votes)}</span>
                  <span class="candidate-percent">{formatPercent(candidate.percentage)}</span>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Települések a körzetben -->
        {#if constituency.settlements?.length > 0}
          <div class="constituency-settlements">
            <h3>🏘️ Települések a körzetben</h3>
            <div class="settlement-chips">
              {#each constituency.settlements as settlement}
                <span class="settlement-chip">{settlement}</span>
              {/each}
            </div>
          </div>
        {/if}
      </section>
    {/if}

    <!-- PLATFORM AKTIVITÁS KORRELÁCIÓ -->
    <section class="platform-activity">
      <h2>🎯 Platform Aktivitás & Választási Részvétel</h2>
      
      <div class="activity-correlation">
        <div class="correlation-card">
          <h4>📊 Mobilizációs Potenciál</h4>
          <p>A platform tagjainak aktivitása és a választási részvétel közötti korreláció elemzése segít azonosítani azokat a területeket, ahol a közösségi tevékenység növelésével javítható a részvételi arány.</p>
          
          <div class="insight-boxes">
            <div class="insight-box">
              <span class="insight-icon">🎯</span>
              <span class="insight-text">Magas aktivitás + Alacsony részvétel = Mobilizációs fókusz</span>
            </div>
            <div class="insight-box">
              <span class="insight-icon">✅</span>
              <span class="insight-text">Magas aktivitás + Magas részvétel = Sikeres területek</span>
            </div>
            <div class="insight-box">
              <span class="insight-icon">⚠️</span>
              <span class="insight-text">Alacsony aktivitás + Szoros körzet = Prioritás</span>
            </div>
          </div>
        </div>
        
        <div class="correlation-card">
          <h4>📈 Hatékonyság Mérése</h4>
          <ul class="effectiveness-list">
            <li>Nemzeti ünnep résztvevők → Választási részvétel</li>
            <li>Pajtás táborok → Fiatal szavazók mobilizációja</li>
            <li>Olvasókörök → Közösségi kohézió erősítése</li>
            <li>Előadások → Tájékozott szavazók aránya</li>
            <li>Fakultációk → Hosszútávú elköteleződés</li>
          </ul>
        </div>
      </div>
    </section>
  {/if}

  <!-- LÁBJEGYZET -->
  <footer class="page-footer">
    <p>📌 Adatforrás: Nemzeti Választási Iroda (valasztas.hu) - 2022. április 3.</p>
    <p>💡 A platform aktivitási adatok a regisztrált tagság tevékenységéből származnak.</p>
  </footer>
</div>

<style>
  .election-analysis-page {
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  /* Fejléc */
  .page-header {
    text-align: center;
    margin-bottom: 24px;
    padding: 20px;
    background: linear-gradient(135deg, #1a365d 0%, #2d3748 100%);
    border-radius: 12px;
    color: white;
  }

  .page-header h1 {
    margin: 0 0 8px 0;
    font-size: 1.8rem;
  }

  .subtitle {
    margin: 0;
    opacity: 0.8;
    font-size: 0.95rem;
  }

  /* Szűrő panel */
  .filter-panel {
    background: white;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .filter-panel h2 {
    margin: 0 0 16px 0;
    font-size: 1.2rem;
    color: #2d3748;
  }

  .filter-controls {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .filter-group label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #4a5568;
  }

  .filter-group select {
    padding: 8px 12px;
    border: 2px solid #e2e8f0;
    border-radius: 6px;
    font-size: 0.95rem;
    min-width: 200px;
    cursor: pointer;
  }

  .filter-group select:focus {
    outline: none;
    border-color: #4299e1;
  }

  /* Loading & Error */
  .loading, .error {
    text-align: center;
    padding: 40px;
    background: white;
    border-radius: 12px;
  }

  .spinner {
    font-size: 2rem;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .error {
    color: #e53e3e;
  }

  /* Összesítő kártyák */
  .summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .summary-card {
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .summary-card.highlight {
    background: linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%);
    border: 2px solid #4299e1;
  }

  .summary-card.competitive {
    background: linear-gradient(135deg, #fffaf0 0%, #feebc8 100%);
    border: 2px solid #ed8936;
  }

  .card-icon {
    font-size: 2rem;
  }

  .card-content {
    display: flex;
    flex-direction: column;
  }

  .card-value {
    font-size: 1.4rem;
    font-weight: 700;
    color: #1a202c;
  }

  .card-label {
    font-size: 0.85rem;
    color: #718096;
  }

  /* Section headers */
  section {
    background: white;
    padding: 24px;
    border-radius: 12px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  section h2 {
    margin: 0 0 20px 0;
    font-size: 1.3rem;
    color: #2d3748;
    padding-bottom: 12px;
    border-bottom: 2px solid #e2e8f0;
  }

  section h3 {
    margin: 20px 0 12px 0;
    font-size: 1.1rem;
    color: #4a5568;
  }

  /* Párteredmények */
  .party-results {
    margin-top: 24px;
  }

  .party-bars {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .party-bar-row {
    display: grid;
    grid-template-columns: 200px 1fr 150px;
    gap: 12px;
    align-items: center;
  }

  .party-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .party-color {
    width: 16px;
    height: 16px;
    border-radius: 4px;
  }

  .party-name {
    font-weight: 600;
    font-size: 0.9rem;
  }

  .party-bar-container {
    background: #e2e8f0;
    border-radius: 4px;
    height: 24px;
    overflow: hidden;
  }

  .party-bar {
    height: 100%;
    border-radius: 4px;
    transition: width 0.5s ease;
  }

  .party-stats {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .party-votes {
    font-size: 0.85rem;
    color: #718096;
  }

  .party-percent {
    font-weight: 700;
    min-width: 50px;
    text-align: right;
  }

  /* Mandátum eloszlás */
  .mandate-distribution {
    margin-top: 24px;
  }

  .mandate-chart {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .mandate-row {
    display: grid;
    grid-template-columns: 200px 1fr 60px;
    gap: 12px;
    align-items: center;
  }

  .mandate-party {
    font-weight: 600;
    font-size: 0.9rem;
  }

  .mandate-bars {
    display: flex;
    gap: 4px;
    height: 28px;
  }

  .mandate-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.8rem;
    font-weight: 600;
    border-radius: 4px;
  }

  .mandate-bar.individual {
    background: #ed8936;
  }

  .mandate-bar.list {
    background: #4299e1;
  }

  .mandate-total {
    font-weight: 700;
    text-align: right;
  }

  .mandate-legend {
    display: flex;
    gap: 20px;
    margin-top: 12px;
    font-size: 0.85rem;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .legend-color {
    width: 16px;
    height: 16px;
    border-radius: 4px;
  }

  .legend-color.individual {
    background: #ed8936;
  }

  .legend-color.list {
    background: #4299e1;
  }

  /* Szoros körzetek */
  .constituency-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }

  .constituency-card {
    background: #f7fafc;
    padding: 16px;
    border-radius: 8px;
    border-left: 4px solid #e2e8f0;
  }

  .constituency-card.competitive {
    border-left-color: #ed8936;
    background: #fffaf0;
  }

  .constituency-header {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  }

  .constituency-number {
    font-weight: 700;
    color: #4a5568;
  }

  .constituency-name {
    font-weight: 600;
  }

  .constituency-result {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .winner {
    font-weight: 600;
  }

  .margin {
    color: #718096;
  }

  .constituency-participation {
    font-size: 0.85rem;
    color: #718096;
  }

  /* Jelöltek */
  .candidates-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .candidate-card {
    display: grid;
    grid-template-columns: 50px 1fr 120px;
    gap: 12px;
    padding: 12px;
    background: #f7fafc;
    border-radius: 8px;
    align-items: center;
  }

  .candidate-card.winner {
    background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%);
    border: 2px solid #48bb78;
  }

  .candidate-rank {
    font-size: 1.2rem;
    font-weight: 700;
    text-align: center;
  }

  .candidate-info {
    display: flex;
    flex-direction: column;
  }

  .candidate-name {
    font-weight: 600;
  }

  .candidate-party {
    font-size: 0.85rem;
  }

  .candidate-result {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .candidate-votes {
    font-size: 0.85rem;
    color: #718096;
  }

  .candidate-percent {
    font-weight: 700;
    font-size: 1.1rem;
  }

  /* Települések */
  .settlement-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .settlement-chip {
    padding: 6px 12px;
    background: #edf2f7;
    border-radius: 16px;
    font-size: 0.85rem;
  }

  .settlements-table {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .settlement-row-data {
    display: grid;
    grid-template-columns: 1fr 100px 150px;
    gap: 12px;
    padding: 8px 12px;
    background: #f7fafc;
    border-radius: 6px;
  }

  .no-data {
    text-align: center;
    color: #718096;
    padding: 20px;
  }

  /* Platform aktivitás */
  .activity-correlation {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }

  .correlation-card {
    padding: 20px;
    background: #f7fafc;
    border-radius: 8px;
  }

  .correlation-card h4 {
    margin: 0 0 12px 0;
    color: #2d3748;
  }

  .correlation-card p {
    color: #4a5568;
    line-height: 1.6;
  }

  .insight-boxes {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 12px;
  }

  .insight-box {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: white;
    border-radius: 6px;
    font-size: 0.9rem;
  }

  .insight-icon {
    font-size: 1.2rem;
  }

  .effectiveness-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .effectiveness-list li {
    padding: 8px 0;
    border-bottom: 1px solid #e2e8f0;
    color: #4a5568;
  }

  .effectiveness-list li:last-child {
    border-bottom: none;
  }

  /* Lábjegyzet */
  .page-footer {
    text-align: center;
    padding: 16px;
    color: #718096;
    font-size: 0.85rem;
  }

  .page-footer p {
    margin: 4px 0;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .party-bar-row {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .mandate-row {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .candidate-card {
      grid-template-columns: 40px 1fr;
    }

    .candidate-result {
      grid-column: span 2;
      flex-direction: row;
      justify-content: space-between;
    }

    .filter-controls {
      flex-direction: column;
    }

    .filter-group select {
      width: 100%;
    }
  }
</style>
