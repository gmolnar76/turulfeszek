<script lang="ts">
  import type { VoterDemographics, NationalHolidayParticipation, ElectionAnalysis } from '../types/analysis.types';
  import { selectedElection, currentElectionData } from '../stores/electionStore';
  import { onMount } from 'svelte';

  let electionAnalysis: ElectionAnalysis = {
    electionId: '2022-parliament',
    electionName: '2022. április 3. - Országgyűlési választások',
    analysisDate: new Date().toISOString(),
    totalRegisteredVoters: 8045000,
    totalParticipants: 5449000,
    nationalParticipationRate: 67.7,
    partyResults: [
      { partyId: 'fidesz-kdnp', partyName: 'Fidesz-KDNP', votes: 1553000, percentage: 29.8 },
      { partyId: 'mi-hazank', partyName: 'Mi Hazánk', votes: 440000, percentage: 8.4 },
      { partyId: 'dk', partyName: 'DK', votes: 325000, percentage: 6.2 }
    ],
    demographicAnalysis: {
      byAgeGroup: [
        { ageGroup: '18-29', label: 'Fiatal (18-29)', population: 1200000, registeredVoters: 950000, votingParticipants: 580000, participationRate: 61.1, activityScore: 45, color: '#FF6B6B' },
        { ageGroup: '30-44', label: 'Dolgozó (30-44)', population: 1800000, registeredVoters: 1650000, votingParticipants: 1210000, participationRate: 73.3, activityScore: 72, color: '#4ECDC4' },
        { ageGroup: '45-59', label: 'Középkorú (45-59)', population: 1600000, registeredVoters: 1550000, votingParticipants: 1150000, participationRate: 74.2, activityScore: 68, color: '#45B7D1' },
        { ageGroup: '60-74', label: 'Szenior (60-74)', population: 1300000, registeredVoters: 1280000, votingParticipants: 930000, participationRate: 72.7, activityScore: 52, color: '#96CEB4' },
        { ageGroup: '75+', label: 'Idős (75+)', population: 700000, registeredVoters: 635000, votingParticipants: 400000, participationRate: 63.0, activityScore: 28, color: '#FFEAA7' }
      ],
      ageGroupWithHighestTurnout: '45-59',
      ageGroupWithLowestTurnout: '18-29',
      averageActivityByAge: 53
    },
    settlementData: [],
    holidayConnectionData: []
  };

  // Subscribe to election store
  let currentElection = '';
  let electionDataMap: Map<string, any> = new Map();

  selectedElection.subscribe(v => {
    currentElection = v;
  });

  currentElectionData.subscribe(v => {
    electionDataMap = v;
  });

  onMount(() => {
    // Update electionAnalysis when currentElectionData changes
    if (electionDataMap.size > 0) {
      // Calculate totals from settlement data
      let totalRegistered = 0;
      let totalVoting = 0;

      for (const settlement of electionDataMap.values()) {
        totalRegistered += settlement.registeredVoters || 0;
        totalVoting += settlement.votingParticipants || 0;
      }

      if (totalRegistered > 0) {
        const participationRate = ((totalVoting / totalRegistered) * 100).toFixed(1);
        
        electionAnalysis.totalRegisteredVoters = totalRegistered;
        electionAnalysis.totalParticipants = totalVoting;
        electionAnalysis.nationalParticipationRate = parseFloat(participationRate as string);
      }
    }
  });

  let holidayParticipation: NationalHolidayParticipation[] = [
    {
      holidayId: 'easter-2022',
      holidayName: 'Húsvét',
      date: '2022-04-10',
      settlementId: 'budapest',
      settlementName: 'Budapest',
      coordinates: [19.04, 47.50],
      detectedParticipants: 125000,
      participationRadius: 500,
      recognitionIssued: 12500,
      ceremonyType: 'közösségi'
    },
    {
      holidayId: 'labour-day-2022',
      holidayName: 'Munka Ünnepe',
      date: '2022-05-01',
      settlementId: 'budapest',
      settlementName: 'Budapest',
      coordinates: [19.04, 47.50],
      detectedParticipants: 98000,
      participationRadius: 400,
      recognitionIssued: 9800,
      ceremonyType: 'közösségi'
    }
  ];

  // Számított értékek
  let registrationToParticipationRatio = 0;
  let highestTurnoutAgeGroup: VoterDemographics | null = null;
  let lowestTurnoutAgeGroup: VoterDemographics | null = null;

  $: if (electionAnalysis) {
    registrationToParticipationRatio = (electionAnalysis.totalParticipants / electionAnalysis.totalRegisteredVoters) * 100;
    
    highestTurnoutAgeGroup = electionAnalysis.demographicAnalysis.byAgeGroup.find(
      g => g.ageGroup === electionAnalysis.demographicAnalysis.ageGroupWithHighestTurnout
    ) || null;
    
    lowestTurnoutAgeGroup = electionAnalysis.demographicAnalysis.byAgeGroup.find(
      g => g.ageGroup === electionAnalysis.demographicAnalysis.ageGroupWithLowestTurnout
    ) || null;
  }

  // Nemzeti ünnep elismerés statisztika
  let totalHolidayRecognitions = 0;
  let totalHolidayParticipants = 0;
  
  $: {
    totalHolidayRecognitions = holidayParticipation.reduce((sum, h) => sum + h.recognitionIssued, 0);
    totalHolidayParticipants = holidayParticipation.reduce((sum, h) => sum + h.detectedParticipants, 0);
  }
</script>

<div class="analysis-container">
  <!-- Fő mutatók: Szavazatok vs. Regisztráltak -->
  <section class="primary-metrics">
    <h2>📊 Szavazati Elemzés - Főbb Mutatók</h2>
    
    <div class="metrics-grid">
      <div class="metric-card primary">
        <div class="metric-label">Regisztrált Szavazók</div>
        <div class="metric-value">{(electionAnalysis.totalRegisteredVoters / 1000000).toFixed(1)}M</div>
        <div class="metric-subtext">összen szavazásra jogosult</div>
      </div>

      <div class="metric-card primary">
        <div class="metric-label">Szavazatot Adók</div>
        <div class="metric-value">{(electionAnalysis.totalParticipants / 1000000).toFixed(1)}M</div>
        <div class="metric-subtext">szavazatot leadott</div>
      </div>

      <div class="metric-card highlight">
        <div class="metric-label">Részvételi Arány</div>
        <div class="metric-value">{registrationToParticipationRatio.toFixed(1)}%</div>
        <div class="metric-subtext">regisztráltak közül</div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Választás Dátuma</div>
        <div class="metric-value">{new Date(electionAnalysis.analysisDate).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <div class="metric-subtext">elemzés dátuma</div>
      </div>
    </div>
  </section>

  <!-- Kor-demográfia análízis -->
  <section class="demographic-analysis">
    <h2>👥 Kor Szerinti Elemzés</h2>
    
    <div class="age-groups-container">
      {#each electionAnalysis.demographicAnalysis.byAgeGroup as ageGroup (ageGroup.ageGroup)}
        <div class="age-group-card">
          <div class="age-group-header">
            <h3>{ageGroup.label}</h3>
            <span class="age-badge" style="background-color: {ageGroup.color}">{ageGroup.ageGroup}</span>
          </div>

          <div class="age-group-stats">
            <div class="stat-row">
              <span class="stat-label">Regisztráltak:</span>
              <span class="stat-value">{(ageGroup.registeredVoters / 1000).toFixed(0)}K</span>
            </div>

            <div class="stat-row">
              <span class="stat-label">Szavazatok:</span>
              <span class="stat-value">{(ageGroup.votingParticipants / 1000).toFixed(0)}K</span>
            </div>

            <div class="stat-row highlight">
              <span class="stat-label">Részvételi Arány:</span>
              <span class="stat-value">{ageGroup.participationRate.toFixed(1)}%</span>
            </div>

            <div class="stat-row">
              <span class="stat-label">Aktivitási Pontszám:</span>
              <div class="activity-bar">
                <div class="activity-fill" style="width: {ageGroup.activityScore}%; background-color: {ageGroup.color};"></div>
              </div>
              <span class="stat-value">{ageGroup.activityScore}/100</span>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <div class="demographic-insights">
      <div class="insight-card">
        <h4>📈 Legmagasabb Részvétel</h4>
        {#if highestTurnoutAgeGroup}
          <p><strong>{highestTurnoutAgeGroup.label}</strong></p>
          <p class="insight-detail">{highestTurnoutAgeGroup.participationRate.toFixed(1)}% részvételi arány</p>
        {/if}
      </div>

      <div class="insight-card">
        <h4>📉 Legalacsonyabb Részvétel</h4>
        {#if lowestTurnoutAgeGroup}
          <p><strong>{lowestTurnoutAgeGroup.label}</strong></p>
          <p class="insight-detail">{lowestTurnoutAgeGroup.participationRate.toFixed(1)}% részvételi arány</p>
        {/if}
      </div>

      <div class="insight-card">
        <h4>⚖️ Átlagos Aktivitás</h4>
        <p class="insight-detail">{electionAnalysis.demographicAnalysis.averageActivityByAge.toFixed(0)} pont</p>
      </div>
    </div>
  </section>

  <!-- Nemzeti ünnep részvétel -->
  <section class="holiday-participation">
    <h2>🎉 Nemzeti Ünnepek - Részvételi Elismerés</h2>

    <div class="holiday-stats">
      <div class="holiday-card">
        <div class="stat-label">Detektált Részvételezők</div>
        <div class="stat-value">{(totalHolidayParticipants / 1000).toFixed(0)}K</div>
      </div>

      <div class="holiday-card highlight">
        <div class="stat-label">Adott Elismerések</div>
        <div class="stat-value">{(totalHolidayRecognitions / 1000).toFixed(1)}K</div>
      </div>

      <div class="holiday-card">
        <div class="stat-label">Elismerési Arány</div>
        <div class="stat-value">{totalHolidayParticipants > 0 ? ((totalHolidayRecognitions / totalHolidayParticipants) * 100).toFixed(1) : 0}%</div>
      </div>
    </div>

    <div class="holiday-events">
      {#each holidayParticipation as holiday (holiday.holidayId)}
        <div class="holiday-event">
          <div class="holiday-name">{holiday.holidayName}</div>
          <div class="holiday-details">
            <span>📍 {holiday.settlementName}</span>
            <span>📅 {new Date(holiday.date).toLocaleDateString('hu-HU')}</span>
            <span>👥 {(holiday.detectedParticipants / 1000).toFixed(0)}K résztvevő</span>
            <span>✅ {(holiday.recognitionIssued / 1000).toFixed(1)}K elismerés</span>
          </div>
          <div class="ceremony-type">Forma: {holiday.ceremonyType}</div>
        </div>
      {/each}
    </div>
  </section>
</div>

<style>
  .analysis-container {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 30px;
    border-radius: 12px;
    max-width: 1200px;
    margin: 0 auto;
    color: #333;
  }

  section {
    margin-bottom: 40px;
  }

  h2 {
    color: #2c3e50;
    margin-bottom: 20px;
    font-size: 1.5em;
    border-bottom: 3px solid #8B5CF6;
    padding-bottom: 10px;
  }

  h3, h4 {
    color: #34495e;
    margin: 10px 0;
  }

  /* Metrics Grid */
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
  }

  .metric-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
    border-left: 4px solid #999;
  }

  .metric-card.primary {
    border-left-color: #3498db;
    background: linear-gradient(135deg, #f8f9fa 0%, #e8f4f8 100%);
  }

  .metric-card.highlight {
    border-left-color: #e74c3c;
    background: linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%);
  }

  .metric-label {
    font-size: 0.9em;
    color: #7f8c8d;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .metric-value {
    font-size: 2em;
    font-weight: bold;
    color: #2c3e50;
    margin: 10px 0;
  }

  .metric-subtext {
    font-size: 0.85em;
    color: #95a5a6;
  }

  /* Age Groups */
  .age-groups-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
  }

  .age-group-card {
    background: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .age-group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .age-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8em;
    font-weight: bold;
    color: white;
  }

  .age-group-stats {
    font-size: 0.9em;
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    border-bottom: 1px solid #ecf0f1;
  }

  .stat-row.highlight {
    font-weight: bold;
    background-color: #f8f9fa;
  }

  .stat-label {
    color: #7f8c8d;
  }

  .stat-value {
    font-weight: bold;
    color: #2c3e50;
  }

  .activity-bar {
    flex: 1;
    height: 6px;
    background-color: #ecf0f1;
    border-radius: 3px;
    margin: 0 10px;
    overflow: hidden;
  }

  .activity-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  /* Demographic Insights */
  .demographic-insights {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }

  .insight-card {
    background: white;
    padding: 15px;
    border-radius: 8px;
    border-left: 4px solid #8B5CF6;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .insight-detail {
    font-size: 0.95em;
    color: #7f8c8d;
    margin: 8px 0 0 0;
  }

  /* Holiday Participation */
  .holiday-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
    margin-bottom: 20px;
  }

  .holiday-card {
    background: white;
    padding: 15px;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-top: 3px solid #27ae60;
  }

  .holiday-card.highlight {
    border-top-color: #e74c3c;
  }

  .holiday-events {
    display: grid;
    gap: 12px;
  }

  .holiday-event {
    background: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #27ae60;
  }

  .holiday-name {
    font-size: 1.1em;
    font-weight: bold;
    color: #2c3e50;
    margin-bottom: 8px;
  }

  .holiday-details {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
    font-size: 0.9em;
    color: #7f8c8d;
    margin-bottom: 8px;
  }

  .ceremony-type {
    font-size: 0.85em;
    color: #95a5a6;
    font-style: italic;
  }

  @media (max-width: 768px) {
    .metrics-grid,
    .age-groups-container,
    .holiday-stats {
      grid-template-columns: 1fr;
    }
  }
</style>
