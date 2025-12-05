<script lang="ts">
  import { onMount } from 'svelte';
  import type { 
    ChanceCalculation, 
    CompetitorResult,
    ActionRecommendation 
  } from '../types/representative.types';
  import type { CountyId, ConstituencyData } from '../types/election.types';
  import { COUNTY_NAMES } from '../types/election.types';
  import { constituenciesData, selectedConstituency } from '../stores/electionStore';

  // Mock adat a kalkulátorhoz - később API-ból
  let calculation: ChanceCalculation | null = null;
  let isLoading = false;
  let selectedConstituencyId = '';

  // Mock constituencies listából válogatás
  let availableConstituencies: { id: string; name: string; county: string }[] = [];

  onMount(() => {
    // Mock constituencies betöltése
    availableConstituencies = [
      { id: 'OEVK-01', name: 'Budapest 01', county: 'Budapest' },
      { id: 'OEVK-02', name: 'Budapest 02', county: 'Budapest' },
      { id: 'OEVK-03', name: 'Budapest 03', county: 'Budapest' },
      { id: 'OEVK-04', name: 'Budapest 04', county: 'Budapest' },
      { id: 'OEVK-05', name: 'Budapest 05', county: 'Budapest' },
      { id: 'OEVK-07', name: 'Pest megye 07', county: 'Pest' },
      { id: 'OEVK-12', name: 'Pest megye 12', county: 'Pest' },
      { id: 'OEVK-19', name: 'Bács-Kiskun 01', county: 'Bács-Kiskun' },
      { id: 'OEVK-22', name: 'Bács-Kiskun 04', county: 'Bács-Kiskun' },
      { id: 'OEVK-26', name: 'Baranya 01', county: 'Baranya' },
      { id: 'OEVK-30', name: 'Békés 01', county: 'Békés' },
      { id: 'OEVK-35', name: 'Borsod 01', county: 'Borsod-Abaúj-Zemplén' },
      { id: 'OEVK-42', name: 'Csongrád 01', county: 'Csongrád-Csanád' },
      { id: 'OEVK-106', name: 'Zala 02', county: 'Zala' }
    ];
  });

  function calculateChance(constituencyId: string) {
    isLoading = true;
    selectedConstituencyId = constituencyId;

    // Szimulált API hívás
    setTimeout(() => {
      // Mock számítás - valós adatokkal kell feltölteni
      const mockData = getMockCalculation(constituencyId);
      calculation = mockData;
      isLoading = false;
    }, 500);
  }

  function getMockCalculation(constituencyId: string): ChanceCalculation {
    // Mock adatok különböző körzetekhez
    const baseData: Record<string, Partial<ChanceCalculation>> = {
      'OEVK-01': {
        constituencyName: 'Budapest 01. számú OEVK',
        currentPosition: 4,
        currentVotes: 3245,
        currentPercentage: 6.2,
        totalValidVotes: 52339,
        registeredVoters: 76500,
        actualVoters: 52339,
        competitiveness: 'difficult'
      },
      'OEVK-19': {
        constituencyName: 'Bács-Kiskun 01. OEVK (Kecskemét)',
        currentPosition: 3,
        currentVotes: 4892,
        currentPercentage: 8.9,
        totalValidVotes: 54966,
        registeredVoters: 78000,
        actualVoters: 54966,
        competitiveness: 'challenging'
      },
      'OEVK-30': {
        constituencyName: 'Békés 01. OEVK',
        currentPosition: 2,
        currentVotes: 8234,
        currentPercentage: 15.8,
        totalValidVotes: 52113,
        registeredVoters: 74000,
        actualVoters: 52113,
        competitiveness: 'competitive'
      }
    };

    const base = baseData[constituencyId] || {
      constituencyName: `${constituencyId} körzet`,
      currentPosition: 4,
      currentVotes: 3500,
      currentPercentage: 7.2,
      totalValidVotes: 48611,
      registeredVoters: 70000,
      actualVoters: 48611,
      competitiveness: 'challenging' as const
    };

    const registeredVoters = base.registeredVoters || 70000;
    const actualVoters = base.actualVoters || 48000;
    const nonVoters = registeredVoters - actualVoters;
    const participationRate = (actualVoters / registeredVoters) * 100;
    
    // Versenytársak
    const competitors: CompetitorResult[] = [
      { position: 1, partyId: 'fidesz', partyName: 'Fidesz-KDNP', votes: 24500, percentage: 50.4, isWinner: true },
      { position: 2, partyId: 'egyutt', partyName: 'Egységben Mo.', votes: 18200, percentage: 37.4, isWinner: false },
      { position: 3, partyId: 'mihazank', partyName: 'Mi Hazánk', votes: base.currentVotes || 3500, percentage: base.currentPercentage || 7.2, isWinner: false },
      { position: 4, partyId: 'mkkp', partyName: 'MKKP', votes: 1800, percentage: 3.7, isWinner: false }
    ].sort((a, b) => b.votes - a.votes).map((c, i) => ({ ...c, position: i + 1 }));

    const miHazank = competitors.find(c => c.partyId === 'mihazank')!;
    const first = competitors[0];
    const second = competitors[1];
    const third = competitors[2];

    const gapToFirst = first.votes - miHazank.votes;
    const gapToSecond = second.votes - miHazank.votes;
    const gapToThird = miHazank.position > 3 ? third.votes - miHazank.votes : 0;

    // Reális célszám: dobogóra kerülés
    const targetVotes2026 = second.votes + 500; // 2. hely + buffer
    const requiredGrowthPercent = ((targetVotes2026 - miHazank.votes) / miHazank.votes) * 100;
    const mobilizationTargetPercent = ((targetVotes2026 - miHazank.votes) / nonVoters) * 100;

    return {
      constituencyId,
      constituencyName: base.constituencyName!,
      countyId: 'pest' as CountyId,
      currentPosition: miHazank.position,
      currentVotes: miHazank.votes,
      currentPercentage: miHazank.percentage,
      totalValidVotes: base.totalValidVotes!,
      competitors,
      gapToFirst,
      gapToSecond,
      gapToThird,
      registeredVoters,
      actualVoters,
      nonVoters,
      participationRate,
      targetVotes2026,
      requiredGrowthPercent,
      mobilizationTargetPercent,
      platformMembers: Math.floor(miHazank.votes * 0.15), // 15% platform tag
      platformCoverage: 15,
      competitiveness: base.competitiveness as any,
      priorityLevel: base.competitiveness === 'competitive' ? 'high' : 
                     base.competitiveness === 'challenging' ? 'medium' : 'low'
    };
  }

  function getPositionIcon(position: number): string {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${position}.`;
    }
  }

  function getCompetitivenessLabel(c: ChanceCalculation['competitiveness']): string {
    switch (c) {
      case 'safe': return 'Biztos körzet';
      case 'competitive': return 'Versenyképes';
      case 'challenging': return 'Kihívás';
      case 'difficult': return 'Nehéz terep';
    }
  }

  function getCompetitivenessColor(c: ChanceCalculation['competitiveness']): string {
    switch (c) {
      case 'safe': return '#10b981';
      case 'competitive': return '#22c55e';
      case 'challenging': return '#f59e0b';
      case 'difficult': return '#ef4444';
    }
  }

  function formatNumber(n: number): string {
    return n.toLocaleString('hu-HU');
  }

  // Akció javaslatok generálása
  function getRecommendations(calc: ChanceCalculation): ActionRecommendation[] {
    const recommendations: ActionRecommendation[] = [];

    // Platform lefedettség növelése
    if (calc.platformCoverage < 30) {
      recommendations.push({
        id: 'platform-growth',
        priority: 'high',
        category: 'mobilization',
        title: 'Platform tagszerzés',
        description: `A körzeti Mi Hazánk szavazók ${calc.platformCoverage}%-a regisztrált. Cél: 30%`,
        targetMetric: 'Platform lefedettség',
        currentValue: calc.platformCoverage,
        targetValue: 30,
        estimatedImpact: `+${Math.floor(calc.currentVotes * 0.15)} potenciális aktív tag`
      });
    }

    // Mobilizáció
    if (calc.mobilizationTargetPercent < 10) {
      recommendations.push({
        id: 'mobilization',
        priority: 'high',
        category: 'mobilization',
        title: 'Nem szavazók megszólítása',
        description: `A nem szavazók ${calc.mobilizationTargetPercent.toFixed(1)}%-a elég a dobogóhoz`,
        targetMetric: 'Új szavazók',
        currentValue: 0,
        targetValue: calc.targetVotes2026 - calc.currentVotes,
        estimatedImpact: `Dobogós helyezés 2026-ban`
      });
    }

    // Családi program
    recommendations.push({
      id: 'family-program',
      priority: 'medium',
      category: 'family',
      title: 'Családos események',
      description: 'Hozz létre családbarát programokat a fiatal szavazók eléréséhez',
      targetMetric: 'Családok száma',
      currentValue: Math.floor(calc.platformMembers * 0.3),
      targetValue: Math.floor(calc.platformMembers * 0.5),
      estimatedImpact: '+20% generációs elérés'
    });

    // Ifjúsági program
    recommendations.push({
      id: 'youth-program',
      priority: 'medium',
      category: 'youth',
      title: 'Ifjúsági táborok',
      description: 'Pajtás meghívók a körzet fiataljainak',
      targetMetric: '18 alatti tagok',
      currentValue: Math.floor(calc.platformMembers * 0.1),
      targetValue: Math.floor(calc.platformMembers * 0.25),
      estimatedImpact: 'Jövő generáció lojalitása'
    });

    return recommendations;
  }
</script>

<div class="chance-calculator">
  <div class="calculator-header">
    <h2>🎯 Esélykalkulátor</h2>
    <p class="subtitle">Mi Hazánk képviselői esélyek 2026-ra</p>
  </div>

  <!-- Körzet választó -->
  <div class="constituency-selector">
    <label for="constituency">Válassz körzetet:</label>
    <select 
      id="constituency" 
      bind:value={selectedConstituencyId}
      on:change={() => calculateChance(selectedConstituencyId)}
    >
      <option value="">-- Körzet kiválasztása --</option>
      {#each availableConstituencies as c}
        <option value={c.id}>{c.name} ({c.county})</option>
      {/each}
    </select>
  </div>

  {#if isLoading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Számítás folyamatban...</p>
    </div>
  {:else if calculation}
    <div class="results">
      <!-- Jelenlegi helyzet -->
      <div class="result-card position-card">
        <h3>📊 2022-es eredmény</h3>
        <div class="position-display">
          <span class="position-number">{getPositionIcon(calculation.currentPosition)}</span>
          <span class="position-label">helyezés</span>
        </div>
        <div class="stats-grid">
          <div class="stat">
            <span class="stat-value">{formatNumber(calculation.currentVotes)}</span>
            <span class="stat-label">szavazat</span>
          </div>
          <div class="stat">
            <span class="stat-value">{calculation.currentPercentage.toFixed(1)}%</span>
            <span class="stat-label">eredmény</span>
          </div>
          <div class="stat competitiveness" style="--comp-color: {getCompetitivenessColor(calculation.competitiveness)}">
            <span class="stat-value">{getCompetitivenessLabel(calculation.competitiveness)}</span>
            <span class="stat-label">körzet típus</span>
          </div>
        </div>
      </div>

      <!-- Versenytársak -->
      <div class="result-card competitors-card">
        <h3>🏆 Versenytársak</h3>
        <div class="competitors-list">
          {#each calculation.competitors as competitor}
            <div class="competitor" class:is-mihazank={competitor.partyId === 'mihazank'}>
              <span class="comp-position">{getPositionIcon(competitor.position)}</span>
              <span class="comp-party">{competitor.partyName}</span>
              <span class="comp-votes">{formatNumber(competitor.votes)}</span>
              <span class="comp-percent">{competitor.percentage.toFixed(1)}%</span>
            </div>
          {/each}
        </div>
      </div>

      <!-- Távolságok -->
      <div class="result-card gaps-card">
        <h3>📏 Távolság a dobogóhoz</h3>
        <div class="gaps-visual">
          {#if calculation.currentPosition > 1}
            <div class="gap-item">
              <span class="gap-label">🥇 1. helyhez:</span>
              <span class="gap-value negative">-{formatNumber(calculation.gapToFirst)} szavazat</span>
              <div class="gap-bar" style="width: {Math.min(100, (calculation.gapToFirst / calculation.totalValidVotes) * 300)}%"></div>
            </div>
          {/if}
          {#if calculation.currentPosition > 2}
            <div class="gap-item">
              <span class="gap-label">🥈 2. helyhez:</span>
              <span class="gap-value negative">-{formatNumber(calculation.gapToSecond)} szavazat</span>
              <div class="gap-bar silver" style="width: {Math.min(100, (calculation.gapToSecond / calculation.totalValidVotes) * 300)}%"></div>
            </div>
          {/if}
          {#if calculation.currentPosition > 3}
            <div class="gap-item">
              <span class="gap-label">🥉 3. helyhez:</span>
              <span class="gap-value negative">-{formatNumber(calculation.gapToThird)} szavazat</span>
              <div class="gap-bar bronze" style="width: {Math.min(100, (calculation.gapToThird / calculation.totalValidVotes) * 300)}%"></div>
            </div>
          {/if}
          {#if calculation.currentPosition <= 3}
            <div class="gap-item success">
              <span class="gap-label">✅ Dobogós pozíció!</span>
              <span class="gap-value positive">Tartsd meg!</span>
            </div>
          {/if}
        </div>
      </div>

      <!-- Mobilizációs potenciál -->
      <div class="result-card mobilization-card">
        <h3>🚀 Mobilizációs potenciál</h3>
        <div class="mobilization-stats">
          <div class="mob-stat">
            <span class="mob-icon">👥</span>
            <span class="mob-value">{formatNumber(calculation.registeredVoters)}</span>
            <span class="mob-label">névjegyzékben</span>
          </div>
          <div class="mob-stat">
            <span class="mob-icon">🗳️</span>
            <span class="mob-value">{formatNumber(calculation.actualVoters)}</span>
            <span class="mob-label">szavazott</span>
          </div>
          <div class="mob-stat highlight">
            <span class="mob-icon">💤</span>
            <span class="mob-value">{formatNumber(calculation.nonVoters)}</span>
            <span class="mob-label">nem szavazott</span>
          </div>
          <div class="mob-stat">
            <span class="mob-icon">📈</span>
            <span class="mob-value">{calculation.participationRate.toFixed(1)}%</span>
            <span class="mob-label">részvétel</span>
          </div>
        </div>

        <div class="target-section">
          <h4>🎯 2026-os cél: Dobogó</h4>
          <div class="target-info">
            <p>Szükséges szavazat: <strong>{formatNumber(calculation.targetVotes2026)}</strong></p>
            <p>Növekedés: <strong>+{calculation.requiredGrowthPercent.toFixed(0)}%</strong></p>
            <p>Nem szavazók <strong>{calculation.mobilizationTargetPercent.toFixed(1)}%</strong>-át kell meggyőzni</p>
          </div>
        </div>
      </div>

      <!-- Platform jelenlét -->
      <div class="result-card platform-card">
        <h3>📱 Platform jelenlét</h3>
        <div class="platform-stats">
          <div class="platform-stat">
            <span class="platform-value">{formatNumber(calculation.platformMembers)}</span>
            <span class="platform-label">regisztrált tag</span>
          </div>
          <div class="platform-coverage">
            <div class="coverage-bar">
              <div class="coverage-fill" style="width: {calculation.platformCoverage}%"></div>
            </div>
            <span class="coverage-text">{calculation.platformCoverage}% lefedettség</span>
          </div>
        </div>
      </div>

      <!-- Akció javaslatok -->
      <div class="result-card recommendations-card">
        <h3>💡 Javasolt akciók</h3>
        <div class="recommendations-list">
          {#each getRecommendations(calculation) as rec}
            <div class="recommendation" class:high={rec.priority === 'high'}>
              <div class="rec-header">
                <span class="rec-priority">{rec.priority === 'high' ? '🔥' : rec.priority === 'medium' ? '⚡' : '📌'}</span>
                <span class="rec-title">{rec.title}</span>
              </div>
              <p class="rec-desc">{rec.description}</p>
              <div class="rec-impact">
                <span class="impact-label">Várható hatás:</span>
                <span class="impact-value">{rec.estimatedImpact}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {:else}
    <div class="empty-state">
      <span class="empty-icon">🗺️</span>
      <p>Válassz egy választókörzetet az esélyek kiszámításához</p>
    </div>
  {/if}
</div>

<style>
  .chance-calculator {
    padding: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .calculator-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .calculator-header h2 {
    font-size: 1.75rem;
    color: #1e293b;
    margin: 0;
  }

  .subtitle {
    color: #64748b;
    margin-top: 0.5rem;
  }

  .constituency-selector {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 12px;
  }

  .constituency-selector label {
    font-weight: 600;
    color: #334155;
  }

  .constituency-selector select {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    background: white;
    cursor: pointer;
  }

  .constituency-selector select:focus {
    outline: none;
    border-color: #2d5016;
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

  .empty-state {
    text-align: center;
    padding: 4rem;
    color: #64748b;
  }

  .empty-icon {
    font-size: 4rem;
    display: block;
    margin-bottom: 1rem;
  }

  .results {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
  }

  .result-card {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .result-card h3 {
    font-size: 1.1rem;
    color: #1e293b;
    margin: 0 0 1rem 0;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #f1f5f9;
  }

  /* Position Card */
  .position-card {
    background: linear-gradient(135deg, #2d5016 0%, #3d6b1f 100%);
    color: white;
  }

  .position-card h3 {
    color: white;
    border-bottom-color: rgba(255,255,255,0.2);
  }

  .position-display {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .position-number {
    font-size: 3rem;
    display: block;
  }

  .position-label {
    font-size: 1rem;
    opacity: 0.9;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .stat {
    text-align: center;
    padding: 0.75rem;
    background: rgba(255,255,255,0.1);
    border-radius: 8px;
  }

  .stat-value {
    display: block;
    font-size: 1.25rem;
    font-weight: 700;
  }

  .stat-label {
    font-size: 0.75rem;
    opacity: 0.8;
  }

  .stat.competitiveness {
    background: var(--comp-color, #64748b);
  }

  /* Competitors */
  .competitors-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .competitor {
    display: grid;
    grid-template-columns: 2rem 1fr auto auto;
    gap: 0.5rem;
    padding: 0.75rem;
    background: #f8fafc;
    border-radius: 8px;
    align-items: center;
  }

  .competitor.is-mihazank {
    background: #dcfce7;
    border: 2px solid #2d5016;
  }

  .comp-position {
    font-size: 1.1rem;
  }

  .comp-party {
    font-weight: 500;
  }

  .comp-votes {
    font-weight: 600;
    color: #1e293b;
  }

  .comp-percent {
    color: #64748b;
    font-size: 0.9rem;
  }

  /* Gaps */
  .gaps-visual {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .gap-item {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  .gap-label {
    width: 120px;
    font-weight: 500;
  }

  .gap-value {
    font-weight: 700;
    width: 120px;
  }

  .gap-value.negative {
    color: #dc2626;
  }

  .gap-value.positive {
    color: #16a34a;
  }

  .gap-bar {
    height: 8px;
    background: #fca5a5;
    border-radius: 4px;
    flex: 1;
    min-width: 50px;
  }

  .gap-bar.silver {
    background: #cbd5e1;
  }

  .gap-bar.bronze {
    background: #fdba74;
  }

  .gap-item.success {
    background: #dcfce7;
    padding: 0.75rem;
    border-radius: 8px;
  }

  /* Mobilization */
  .mobilization-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .mob-stat {
    text-align: center;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
  }

  .mob-stat.highlight {
    background: #fef3c7;
    border: 2px solid #f59e0b;
  }

  .mob-icon {
    font-size: 1.5rem;
    display: block;
    margin-bottom: 0.25rem;
  }

  .mob-value {
    display: block;
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
  }

  .mob-label {
    font-size: 0.75rem;
    color: #64748b;
  }

  .target-section {
    padding: 1rem;
    background: #dcfce7;
    border-radius: 8px;
  }

  .target-section h4 {
    margin: 0 0 0.75rem 0;
    color: #166534;
  }

  .target-info p {
    margin: 0.25rem 0;
    color: #15803d;
  }

  /* Platform */
  .platform-stats {
    text-align: center;
  }

  .platform-value {
    display: block;
    font-size: 2rem;
    font-weight: 700;
    color: #2d5016;
  }

  .platform-label {
    color: #64748b;
  }

  .platform-coverage {
    margin-top: 1rem;
  }

  .coverage-bar {
    height: 12px;
    background: #e2e8f0;
    border-radius: 6px;
    overflow: hidden;
  }

  .coverage-fill {
    height: 100%;
    background: linear-gradient(90deg, #2d5016, #4ade80);
    border-radius: 6px;
    transition: width 0.5s ease;
  }

  .coverage-text {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: #64748b;
  }

  /* Recommendations */
  .recommendations-card {
    grid-column: 1 / -1;
  }

  .recommendations-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
  }

  .recommendation {
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
    border-left: 4px solid #64748b;
  }

  .recommendation.high {
    border-left-color: #dc2626;
    background: #fef2f2;
  }

  .rec-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .rec-priority {
    font-size: 1.25rem;
  }

  .rec-title {
    font-weight: 600;
    color: #1e293b;
  }

  .rec-desc {
    margin: 0;
    color: #64748b;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .rec-impact {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid #e2e8f0;
    font-size: 0.85rem;
  }

  .impact-label {
    color: #64748b;
  }

  .impact-value {
    color: #16a34a;
    font-weight: 600;
  }
</style>
