<script lang="ts">
  import {
    selectedElection,
    selectedParty,
    topSettlementsForParty,
    totalPartyVotes,
    averagePartyPercentage,
    strongestSettlementForParty,
    partyNames,
    partyColors
  } from '../stores/electionStore';

  let currentStats: any = {};

  // Subscribe to derived stores
  let topSettlements: any[] = [];
  let totalVotes = 0;
  let avgPercentage = 0;
  let strongestSettlement: any = null;

  topSettlementsForParty.subscribe(v => { topSettlements = v; });
  totalPartyVotes.subscribe(v => { totalVotes = v; });
  averagePartyPercentage.subscribe(v => { avgPercentage = v; });
  strongestSettlementForParty.subscribe(v => { strongestSettlement = v; });

  let partyColorMap: any = {};
  let partyNameMap: any = {};

  partyColors.subscribe(v => { partyColorMap = v; });
  partyNames.subscribe(v => { partyNameMap = v; });

  let electionId = '';
  let partyId = '';

  selectedElection.subscribe(v => { electionId = v; });
  selectedParty.subscribe(v => { partyId = v; });
</script>

<div class="election-stats">
  <div class="header">
    <h2>🗳️ Szavazati Statisztikák</h2>
    <p class="election-name">{electionId}</p>
  </div>

  <div class="party-indicator">
    <div class="party-color" style="background-color: {partyColorMap[partyId] || '#999'}"></div>
    <span class="party-name">{partyNameMap[partyId] || partyId}</span>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Összes szavazat</div>
      <div class="stat-value">{totalVotes.toLocaleString('hu-HU')}</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Átlag szavazat %</div>
      <div class="stat-value">{avgPercentage.toFixed(1)}%</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Legerősebb település</div>
      <div class="stat-value">
        {#if strongestSettlement && strongestSettlement.partyResults}
          {@const partyVoteObj = strongestSettlement.partyResults.find((pv) => pv.partyId === partyId)}
          <div class="settlement-name">{strongestSettlement.settlementName}</div>
          <div class="settlement-percentage">{partyVoteObj ? partyVoteObj.percentage.toFixed(1) : '0'}%</div>
        {:else}
          <span>Nincs adat</span>
        {/if}
      </div>
    </div>
  </div>

  <div class="top-settlements">
    <h3>🏆 Top 10 Település</h3>
    <div class="settlements-list">
      {#each topSettlements as settlement, idx (settlement.settlementId)}
        <div class="settlement-row">
          <span class="rank">{settlement.rank}.</span>
          <span class="name">{settlement.settlementName}</span>
          <span class="votes">{settlement.votes.toLocaleString('hu-HU')}</span>
          <span class="percentage">{settlement.percentage.toFixed(1)}%</span>
        </div>
      {/each}

      {#if topSettlements.length === 0}
        <div class="no-data">Nincs szavazati adat</div>
      {/if}
    </div>
  </div>

  <div class="participation-note">
    <small>💡 Az adatok a 2022. április 3-i országgyűlési választásokból származnak.</small>
  </div>
</div>

<style>
  .election-stats {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .header {
    margin: 0;
    padding-bottom: 12px;
    border-bottom: 3px solid rgba(0, 0, 0, 0.1);
  }

  .header h2 {
    margin: 0 0 8px 0;
    font-size: 1.5rem;
    color: #2c3e50;
  }

  .election-name {
    margin: 0;
    font-size: 0.9rem;
    color: #666;
    font-style: italic;
  }

  .party-indicator {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: white;
    border-radius: 8px;
    border-left: 4px solid #999;
  }

  .party-color {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid rgba(0, 0, 0, 0.2);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .party-name {
    font-weight: 600;
    color: #2c3e50;
    font-size: 1.1rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }

  .stat-card {
    background: white;
    border-radius: 8px;
    padding: 16px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border-top: 3px solid #f0f0f0;
  }

  .stat-label {
    font-size: 0.85rem;
    color: #666;
    font-weight: 500;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .stat-value {
    font-size: 1.4rem;
    font-weight: bold;
    color: #2c3e50;
  }

  .settlement-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: #2c3e50;
  }

  .settlement-percentage {
    font-size: 0.8rem;
    color: #666;
    margin-top: 4px;
  }

  .top-settlements {
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .top-settlements h3 {
    margin: 0 0 16px 0;
    font-size: 1.1rem;
    color: #2c3e50;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .settlements-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 300px;
    overflow-y: auto;
  }

  .settlement-row {
    display: grid;
    grid-template-columns: 30px 1fr 100px 70px;
    gap: 12px;
    padding: 10px;
    background: #f9f9f9;
    border-radius: 6px;
    align-items: center;
    transition: background-color 0.2s ease;
  }

  .settlement-row:hover {
    background-color: #f0f0f0;
  }

  .settlement-row:nth-child(1) {
    background: linear-gradient(90deg, #ffd700 0%, #f9f9f9 50%);
    font-weight: 600;
  }

  .settlement-row:nth-child(2) {
    background: linear-gradient(90deg, #c0c0c0 0%, #f9f9f9 50%);
    font-weight: 500;
  }

  .settlement-row:nth-child(3) {
    background: linear-gradient(90deg, #cd7f32 0%, #f9f9f9 50%);
    font-weight: 500;
  }

  .rank {
    font-weight: bold;
    text-align: center;
    font-size: 0.95rem;
  }

  .name {
    font-weight: 500;
    color: #2c3e50;
    text-align: left;
  }

  .votes {
    text-align: right;
    font-family: 'Courier New', monospace;
    color: #555;
    font-size: 0.9rem;
  }

  .percentage {
    text-align: right;
    font-family: 'Courier New', monospace;
    font-weight: 600;
    color: #2c3e50;
  }

  .no-data {
    padding: 24px;
    text-align: center;
    color: #999;
    font-style: italic;
  }

  .participation-note {
    text-align: center;
    padding: 12px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 6px;
    font-size: 0.85rem;
    color: #666;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .election-stats {
      padding: 16px;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .settlement-row {
      grid-template-columns: 25px 1fr 80px 60px;
      font-size: 0.9rem;
    }

    .stat-value {
      font-size: 1.2rem;
    }

    .header h2 {
      font-size: 1.2rem;
    }
  }
</style>
