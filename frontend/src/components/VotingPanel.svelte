<!--
  VotingPanel.svelte
  Képviselői szavazás panel - szavazások listázása, létrehozása és szavazat leadása
-->
<script lang="ts">
  import type { Vote, VoteOption, VoteEligibility, VoteFilterStatus, CreateVotePayload } from '../types/voting.types';
  import { ELIGIBILITY_LABELS, STATUS_LABELS, STATUS_COLORS } from '../types/voting.types';

  // Props
  export let constituencyId: string = 'csongrad-01';
  export let constituencyName: string = 'Csongrád 01 (Szeged)';
  export let isRepresentative: boolean = true;

  // State
  let votes: Vote[] = [];
  let filterStatus: VoteFilterStatus = 'all';
  let showCreateModal = false;
  let showDetailsModal = false;
  let selectedVote: Vote | null = null;
  let isLoading = false;

  // Create form state
  let newVoteTitle = '';
  let newVoteDescription = '';
  let newVoteOptions: string[] = ['', ''];
  let newVoteEligibility: VoteEligibility = 'all';
  let newVoteDuration = 7;

  // Mock felhasználó (a valóságban store-ból jönne)
  const currentUser = {
    id: 'user-rep-1',
    name: 'Kovács István',
    isTrusted: true,
    isRepresentative: true
  };

  // Mock adatok betöltése
  function loadMockData() {
    votes = [
      {
        id: 'vote-1',
        title: 'Közösségi kert létrehozása',
        description: 'Szavazzunk arról, hogy hozzunk-e létre közösségi kertet a Tisza-parton. A projekt kb. 2M Ft költséggel járna.',
        status: 'active',
        eligibilityType: 'all',
        options: [
          { id: 'opt-1a', label: 'Igen, támogatom', votes: 45, trustedVotes: 32, newMemberVotes: 13 },
          { id: 'opt-1b', label: 'Nem támogatom', votes: 12, trustedVotes: 8, newMemberVotes: 4 },
          { id: 'opt-1c', label: 'Tartózkodom', votes: 8, trustedVotes: 5, newMemberVotes: 3 }
        ],
        totalVotes: 65,
        totalTrustedVotes: 45,
        totalNewMemberVotes: 20,
        startsAt: '2024-12-01T00:00:00Z',
        endsAt: '2024-12-15T23:59:59Z',
        createdBy: 'user-rep-1',
        creatorName: 'Kovács István',
        constituencyId: 'csongrad-01',
        createdAt: '2024-11-28T10:00:00Z',
        transactionHash: '0x1234...abcd'
      },
      {
        id: 'vote-2',
        title: 'Képviselői beszámoló időpontja',
        description: 'Mikor tartsuk a következő képviselői beszámolót? Csak bizalmas tagok szavazhatnak.',
        status: 'active',
        eligibilityType: 'trusted',
        options: [
          { id: 'opt-2a', label: 'December 20. (péntek) 18:00', votes: 28, trustedVotes: 28, newMemberVotes: 0 },
          { id: 'opt-2b', label: 'December 21. (szombat) 10:00', votes: 15, trustedVotes: 15, newMemberVotes: 0 },
          { id: 'opt-2c', label: 'December 22. (vasárnap) 15:00', votes: 22, trustedVotes: 22, newMemberVotes: 0 }
        ],
        totalVotes: 65,
        totalTrustedVotes: 65,
        totalNewMemberVotes: 0,
        startsAt: '2024-12-05T00:00:00Z',
        endsAt: '2024-12-12T23:59:59Z',
        createdBy: 'user-rep-1',
        creatorName: 'Kovács István',
        constituencyId: 'csongrad-01',
        createdAt: '2024-12-04T14:00:00Z',
        transactionHash: '0x5678...efgh'
      },
      {
        id: 'vote-3',
        title: 'Helyi rendezvény támogatása',
        description: 'Támogassuk-e anyagilag a helyi futóversenyt 500.000 Ft-tal?',
        status: 'closed',
        eligibilityType: 'all',
        options: [
          { id: 'opt-3a', label: 'Igen', votes: 89, trustedVotes: 62, newMemberVotes: 27 },
          { id: 'opt-3b', label: 'Nem', votes: 34, trustedVotes: 25, newMemberVotes: 9 }
        ],
        totalVotes: 123,
        totalTrustedVotes: 87,
        totalNewMemberVotes: 36,
        startsAt: '2024-11-01T00:00:00Z',
        endsAt: '2024-11-15T23:59:59Z',
        createdBy: 'user-rep-1',
        creatorName: 'Kovács István',
        constituencyId: 'csongrad-01',
        createdAt: '2024-10-28T09:00:00Z',
        transactionHash: '0x9abc...ijkl',
        userVotedOptionId: 'opt-3a'
      },
      {
        id: 'vote-4',
        title: 'Januári közgyűlés témái',
        description: 'Milyen témákat tárgyaljunk a januári közgyűlésen?',
        status: 'upcoming',
        eligibilityType: 'trusted',
        options: [
          { id: 'opt-4a', label: '2025-ös költségvetés', votes: 0, trustedVotes: 0, newMemberVotes: 0 },
          { id: 'opt-4b', label: 'Új projektek indítása', votes: 0, trustedVotes: 0, newMemberVotes: 0 },
          { id: 'opt-4c', label: 'Tagfelvételi szabályok', votes: 0, trustedVotes: 0, newMemberVotes: 0 }
        ],
        totalVotes: 0,
        totalTrustedVotes: 0,
        totalNewMemberVotes: 0,
        startsAt: '2025-01-01T00:00:00Z',
        endsAt: '2025-01-07T23:59:59Z',
        createdBy: 'user-rep-1',
        creatorName: 'Kovács István',
        constituencyId: 'csongrad-01',
        createdAt: '2024-12-05T11:00:00Z'
      }
    ];
  }

  // Komponens mount
  loadMockData();

  // Szűrt szavazások
  $: filteredVotes = filterStatus === 'all' 
    ? votes 
    : votes.filter(v => v.status === filterStatus);

  // Dátum formázás
  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Hátralévő idő
  function getTimeRemaining(endsAt: string): string {
    const now = new Date();
    const end = new Date(endsAt);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Lejárt';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} nap ${hours} óra`;
    return `${hours} óra`;
  }

  // Százalék számítás
  function getPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  // Nyertes opció meghatározása
  function getWinningOption(vote: Vote): VoteOption | null {
    if (vote.totalVotes === 0) return null;
    return vote.options.reduce((max, opt) => opt.votes > max.votes ? opt : max);
  }

  // Szavazhat-e a felhasználó
  function canUserVote(vote: Vote): boolean {
    if (vote.status !== 'active') return false;
    if (vote.userVotedOptionId) return false;
    if (vote.eligibilityType === 'trusted' && !currentUser.isTrusted) return false;
    return true;
  }

  // Szavazat leadása
  function castVote(vote: Vote, optionId: string) {
    const voteIndex = votes.findIndex(v => v.id === vote.id);
    if (voteIndex === -1) return;

    const optionIndex = votes[voteIndex].options.findIndex(o => o.id === optionId);
    if (optionIndex === -1) return;

    // Update mock data
    votes[voteIndex].options[optionIndex].votes += 1;
    if (currentUser.isTrusted) {
      votes[voteIndex].options[optionIndex].trustedVotes += 1;
      votes[voteIndex].totalTrustedVotes += 1;
    } else {
      votes[voteIndex].options[optionIndex].newMemberVotes += 1;
      votes[voteIndex].totalNewMemberVotes += 1;
    }
    votes[voteIndex].totalVotes += 1;
    votes[voteIndex].userVotedOptionId = optionId;
    
    // Trigger reactivity
    votes = [...votes];
    
    // Close modal
    showDetailsModal = false;
    selectedVote = null;
  }

  // Új opció hozzáadása
  function addOption() {
    if (newVoteOptions.length < 6) {
      newVoteOptions = [...newVoteOptions, ''];
    }
  }

  // Opció eltávolítása
  function removeOption(index: number) {
    if (newVoteOptions.length > 2) {
      newVoteOptions = newVoteOptions.filter((_, i) => i !== index);
    }
  }

  // Új szavazás létrehozása
  function createVote() {
    const validOptions = newVoteOptions.filter(o => o.trim() !== '');
    if (!newVoteTitle.trim() || validOptions.length < 2) {
      alert('Kérlek add meg a címet és legalább 2 opciót!');
      return;
    }

    const now = new Date();
    const endDate = new Date(now.getTime() + newVoteDuration * 24 * 60 * 60 * 1000);

    const newVote: Vote = {
      id: `vote-${Date.now()}`,
      title: newVoteTitle.trim(),
      description: newVoteDescription.trim(),
      status: 'active',
      eligibilityType: newVoteEligibility,
      options: validOptions.map((label, i) => ({
        id: `opt-new-${i}`,
        label,
        votes: 0,
        trustedVotes: 0,
        newMemberVotes: 0
      })),
      totalVotes: 0,
      totalTrustedVotes: 0,
      totalNewMemberVotes: 0,
      startsAt: now.toISOString(),
      endsAt: endDate.toISOString(),
      createdBy: currentUser.id,
      creatorName: currentUser.name,
      constituencyId,
      createdAt: now.toISOString()
    };

    votes = [newVote, ...votes];
    
    // Reset form
    newVoteTitle = '';
    newVoteDescription = '';
    newVoteOptions = ['', ''];
    newVoteEligibility = 'all';
    newVoteDuration = 7;
    showCreateModal = false;
  }

  // Részletek megnyitása
  function openDetails(vote: Vote) {
    selectedVote = vote;
    showDetailsModal = true;
  }
</script>

<div class="voting-panel">
  <!-- Header -->
  <div class="panel-header">
    <div class="header-info">
      <h2>🗳️ Szavazások</h2>
      <p class="subtitle">{constituencyName} - Közösségi döntéshozatal</p>
    </div>
    {#if isRepresentative}
      <button class="create-btn" on:click={() => showCreateModal = true}>
        ➕ Új szavazás
      </button>
    {/if}
  </div>

  <!-- Filter tabs -->
  <div class="filter-tabs">
    <button 
      class="filter-tab" 
      class:active={filterStatus === 'all'}
      on:click={() => filterStatus = 'all'}
    >
      Összes ({votes.length})
    </button>
    <button 
      class="filter-tab" 
      class:active={filterStatus === 'active'}
      on:click={() => filterStatus = 'active'}
    >
      🟢 Aktív ({votes.filter(v => v.status === 'active').length})
    </button>
    <button 
      class="filter-tab" 
      class:active={filterStatus === 'closed'}
      on:click={() => filterStatus = 'closed'}
    >
      🔴 Lezárt ({votes.filter(v => v.status === 'closed').length})
    </button>
    <button 
      class="filter-tab" 
      class:active={filterStatus === 'upcoming'}
      on:click={() => filterStatus = 'upcoming'}
    >
      ⏳ Hamarosan ({votes.filter(v => v.status === 'upcoming').length})
    </button>
  </div>

  <!-- Votes list -->
  <div class="votes-list">
    {#if filteredVotes.length === 0}
      <div class="empty-state">
        <span class="empty-icon">📭</span>
        <p>Nincs {filterStatus === 'all' ? '' : STATUS_LABELS[filterStatus]} szavazás</p>
      </div>
    {:else}
      {#each filteredVotes as vote (vote.id)}
        <div class="vote-card" class:closed={vote.status === 'closed'}>
          <!-- Card header -->
          <div class="vote-header">
            <div class="vote-badges">
              <span class="status-badge" style="background-color: {STATUS_COLORS[vote.status]}">
                {STATUS_LABELS[vote.status]}
              </span>
              <span class="eligibility-badge" class:trusted={vote.eligibilityType === 'trusted'}>
                {ELIGIBILITY_LABELS[vote.eligibilityType]}
              </span>
            </div>
            {#if vote.status === 'active'}
              <span class="time-remaining">⏰ {getTimeRemaining(vote.endsAt)}</span>
            {/if}
          </div>

          <!-- Card body -->
          <h3 class="vote-title">{vote.title}</h3>
          <p class="vote-description">{vote.description}</p>

          <!-- Quick results preview -->
          <div class="quick-results">
            {#each vote.options.slice(0, 3) as option}
              <div class="quick-option">
                <div class="option-header">
                  <span class="option-label">{option.label}</span>
                  <span class="option-percentage">{getPercentage(option.votes, vote.totalVotes)}%</span>
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar">
                    <div 
                      class="progress-fill trusted" 
                      style="width: {getPercentage(option.trustedVotes, vote.totalVotes)}%"
                    ></div>
                    <div 
                      class="progress-fill new-member" 
                      style="width: {getPercentage(option.newMemberVotes, vote.totalVotes)}%; left: {getPercentage(option.trustedVotes, vote.totalVotes)}%"
                    ></div>
                  </div>
                </div>
              </div>
            {/each}
          </div>

          <!-- Vote stats -->
          <div class="vote-stats">
            <span class="stat">
              📊 {vote.totalVotes} szavazat
            </span>
            <span class="stat trusted-stat">
              🛡️ {vote.totalTrustedVotes} bizalmas
            </span>
            <span class="stat new-stat">
              🆕 {vote.totalNewMemberVotes} új tag
            </span>
          </div>

          <!-- Card footer -->
          <div class="vote-footer">
            <span class="creator">Létrehozta: {vote.creatorName}</span>
            <button class="details-btn" on:click={() => openDetails(vote)}>
              {#if canUserVote(vote)}
                ✅ Szavazok
              {:else if vote.userVotedOptionId}
                👁️ Részletek (szavaztál)
              {:else}
                👁️ Részletek
              {/if}
            </button>
          </div>

          <!-- Blockchain badge -->
          {#if vote.transactionHash}
            <div class="blockchain-badge">
              🔗 Blockchain: {vote.transactionHash}
            </div>
          {/if}
        </div>
      {/each}
    {/if}
  </div>
</div>

<!-- Create Vote Modal -->
{#if showCreateModal}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div class="modal-overlay" on:click={() => showCreateModal = false}>
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div class="modal" on:click|stopPropagation>
      <div class="modal-header">
        <h3>➕ Új szavazás létrehozása</h3>
        <button class="close-btn" on:click={() => showCreateModal = false}>✕</button>
      </div>
      
      <div class="modal-body">
        <div class="form-group">
          <label for="vote-title">Szavazás címe *</label>
          <input 
            id="vote-title"
            type="text" 
            bind:value={newVoteTitle}
            placeholder="Pl.: Közösségi kert létrehozása"
            maxlength="100"
          />
        </div>

        <div class="form-group">
          <label for="vote-desc">Leírás</label>
          <textarea 
            id="vote-desc"
            bind:value={newVoteDescription}
            placeholder="Részletes leírás a szavazásról..."
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label>Opciók * (min. 2)</label>
          {#each newVoteOptions as option, i}
            <div class="option-input-row">
              <input 
                type="text" 
                bind:value={newVoteOptions[i]}
                placeholder="Opció {i + 1}"
              />
              {#if newVoteOptions.length > 2}
                <button class="remove-option-btn" on:click={() => removeOption(i)}>✕</button>
              {/if}
            </div>
          {/each}
          {#if newVoteOptions.length < 6}
            <button class="add-option-btn" on:click={addOption}>+ Opció hozzáadása</button>
          {/if}
        </div>

        <div class="form-group">
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label>Jogosultság</label>
          <div class="eligibility-selector">
            <button 
              class="eligibility-option" 
              class:selected={newVoteEligibility === 'all'}
              on:click={() => newVoteEligibility = 'all'}
            >
              👥 Minden tag
            </button>
            <button 
              class="eligibility-option" 
              class:selected={newVoteEligibility === 'trusted'}
              on:click={() => newVoteEligibility = 'trusted'}
            >
              🛡️ Csak bizalmasok
            </button>
          </div>
          {#if newVoteEligibility === 'trusted'}
            <p class="eligibility-hint">
              Csak participation, community vagy activity jelvénnyel rendelkező tagok szavazhatnak.
            </p>
          {/if}
        </div>

        <div class="form-group">
          <label for="vote-duration">Időtartam</label>
          <select id="vote-duration" bind:value={newVoteDuration}>
            <option value={1}>1 nap</option>
            <option value={3}>3 nap</option>
            <option value={7}>7 nap (ajánlott)</option>
            <option value={14}>14 nap</option>
            <option value={30}>30 nap</option>
          </select>
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-btn" on:click={() => showCreateModal = false}>Mégse</button>
        <button class="submit-btn" on:click={createVote}>🗳️ Szavazás létrehozása</button>
      </div>
    </div>
  </div>
{/if}

<!-- Vote Details Modal -->
{#if showDetailsModal && selectedVote}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div class="modal-overlay" on:click={() => { showDetailsModal = false; selectedVote = null; }}>
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div class="modal large" on:click|stopPropagation>
      <div class="modal-header">
        <div>
          <h3>{selectedVote.title}</h3>
          <div class="modal-badges">
            <span class="status-badge" style="background-color: {STATUS_COLORS[selectedVote.status]}">
              {STATUS_LABELS[selectedVote.status]}
            </span>
            <span class="eligibility-badge" class:trusted={selectedVote.eligibilityType === 'trusted'}>
              {ELIGIBILITY_LABELS[selectedVote.eligibilityType]}
            </span>
          </div>
        </div>
        <button class="close-btn" on:click={() => { showDetailsModal = false; selectedVote = null; }}>✕</button>
      </div>
      
      <div class="modal-body">
        <p class="detail-description">{selectedVote.description}</p>

        <div class="detail-meta">
          <div class="meta-item">
            <span class="meta-label">Létrehozta:</span>
            <span class="meta-value">{selectedVote.creatorName}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Kezdet:</span>
            <span class="meta-value">{formatDate(selectedVote.startsAt)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Vége:</span>
            <span class="meta-value">{formatDate(selectedVote.endsAt)}</span>
          </div>
          {#if selectedVote.status === 'active'}
            <div class="meta-item highlight">
              <span class="meta-label">Hátralévő:</span>
              <span class="meta-value">{getTimeRemaining(selectedVote.endsAt)}</span>
            </div>
          {/if}
        </div>

        <!-- Options with detailed breakdown -->
        <div class="detail-options">
          <h4>Opciók és eredmények</h4>
          
          {#each selectedVote.options as option}
            {@const isWinner = getWinningOption(selectedVote)?.id === option.id && selectedVote.status === 'closed'}
            {@const isUserVote = selectedVote.userVotedOptionId === option.id}
            <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
            <div 
              class="detail-option" 
              class:winner={isWinner}
              class:user-voted={isUserVote}
              class:clickable={canUserVote(selectedVote)}
              on:click={() => selectedVote && canUserVote(selectedVote) && castVote(selectedVote, option.id)}
            >
              <div class="option-main">
                <span class="option-label">
                  {#if isWinner}🏆{/if}
                  {#if isUserVote}✓{/if}
                  {option.label}
                </span>
                <span class="option-votes">{option.votes} szavazat ({getPercentage(option.votes, selectedVote.totalVotes)}%)</span>
              </div>
              
              <!-- Dual progress bar -->
              <div class="detail-progress-container">
                <div class="detail-progress-bar">
                  <div 
                    class="detail-progress trusted" 
                    style="width: {getPercentage(option.trustedVotes, selectedVote.totalVotes)}%"
                    title="Bizalmas tagok: {option.trustedVotes}"
                  ></div>
                  <div 
                    class="detail-progress new-member" 
                    style="width: {getPercentage(option.newMemberVotes, selectedVote.totalVotes)}%; left: {getPercentage(option.trustedVotes, selectedVote.totalVotes)}%"
                    title="Új tagok: {option.newMemberVotes}"
                  ></div>
                </div>
              </div>
              
              <!-- Vote breakdown -->
              <div class="option-breakdown">
                <span class="breakdown-item trusted">🛡️ {option.trustedVotes} bizalmas</span>
                <span class="breakdown-item new">🆕 {option.newMemberVotes} új tag</span>
              </div>
            </div>
          {/each}
        </div>

        <!-- Summary stats -->
        <div class="detail-summary">
          <div class="summary-card">
            <span class="summary-value">{selectedVote.totalVotes}</span>
            <span class="summary-label">Összes szavazat</span>
          </div>
          <div class="summary-card trusted">
            <span class="summary-value">{selectedVote.totalTrustedVotes}</span>
            <span class="summary-label">Bizalmas tagok</span>
          </div>
          <div class="summary-card new">
            <span class="summary-value">{selectedVote.totalNewMemberVotes}</span>
            <span class="summary-label">Új tagok</span>
          </div>
          {#if selectedVote.totalVotes > 0}
            <div class="summary-card ratio">
              <span class="summary-value">{getPercentage(selectedVote.totalTrustedVotes, selectedVote.totalVotes)}%</span>
              <span class="summary-label">Bizalmi arány</span>
            </div>
          {/if}
        </div>

        <!-- Blockchain info -->
        {#if selectedVote.transactionHash}
          <div class="blockchain-info">
            <h4>🔗 Blockchain hitelesítés</h4>
            <p>Ez a szavazás a Polygon blockchain-on van rögzítve.</p>
            <code>{selectedVote.transactionHash}</code>
            <button class="verify-btn">Ellenőrzés a blockchain-on →</button>
          </div>
        {/if}

        <!-- User action -->
        {#if canUserVote(selectedVote)}
          <div class="vote-action-hint">
            <p>👆 Kattints egy opcióra a szavazáshoz!</p>
            {#if !currentUser.isTrusted && selectedVote.eligibilityType === 'all'}
              <p class="new-member-hint">🆕 Új tagként a szavazatod külön lesz jelölve.</p>
            {/if}
          </div>
        {:else if selectedVote.userVotedOptionId}
          <div class="already-voted">
            ✅ Már leadtad a szavazatodat erre a kérdésre.
          </div>
        {:else if selectedVote.eligibilityType === 'trusted' && !currentUser.isTrusted}
          <div class="not-eligible">
            🔒 Ez a szavazás csak bizalmas tagoknak érhető el.
            <br/>
            <small>Szerezz participation, community vagy activity jelvényt a jogosultsághoz!</small>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .voting-panel {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }

  .header-info h2 {
    margin: 0;
    color: #1f2937;
    font-size: 1.5rem;
  }

  .subtitle {
    margin: 4px 0 0;
    color: #6b7280;
    font-size: 0.9rem;
  }

  .create-btn {
    background: #4a7c59;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .create-btn:hover {
    background: #3d6a4a;
  }

  /* Filter tabs */
  .filter-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e7eb;
    flex-wrap: wrap;
  }

  .filter-tab {
    background: #f3f4f6;
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .filter-tab:hover {
    background: #e5e7eb;
  }

  .filter-tab.active {
    background: #4a7c59;
    color: white;
  }

  /* Votes list */
  .votes-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .empty-state {
    text-align: center;
    padding: 48px;
    color: #9ca3af;
  }

  .empty-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: 12px;
  }

  /* Vote card */
  .vote-card {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px;
    transition: box-shadow 0.2s;
  }

  .vote-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .vote-card.closed {
    opacity: 0.8;
  }

  .vote-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .vote-badges {
    display: flex;
    gap: 8px;
  }

  .status-badge {
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    color: white;
  }

  .eligibility-badge {
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.75rem;
    background: #e0e7ff;
    color: #4338ca;
  }

  .eligibility-badge.trusted {
    background: #dcfce7;
    color: #166534;
  }

  .time-remaining {
    font-size: 0.85rem;
    color: #f59e0b;
    font-weight: 500;
  }

  .vote-title {
    margin: 0 0 8px;
    font-size: 1.1rem;
    color: #1f2937;
  }

  .vote-description {
    margin: 0 0 16px;
    color: #6b7280;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  /* Quick results */
  .quick-results {
    margin-bottom: 16px;
  }

  .quick-option {
    margin-bottom: 8px;
  }

  .option-header {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    margin-bottom: 4px;
  }

  .option-label {
    color: #374151;
  }

  .option-percentage {
    color: #6b7280;
    font-weight: 600;
  }

  .progress-bar-container {
    position: relative;
  }

  .progress-bar {
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
  }

  .progress-fill {
    height: 100%;
    position: absolute;
    top: 0;
    transition: width 0.3s;
  }

  .progress-fill.trusted {
    background: #22c55e;
    left: 0;
  }

  .progress-fill.new-member {
    background: #9ca3af;
  }

  /* Vote stats */
  .vote-stats {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
    font-size: 0.85rem;
  }

  .stat {
    color: #6b7280;
  }

  .trusted-stat {
    color: #16a34a;
  }

  .new-stat {
    color: #6b7280;
  }

  /* Vote footer */
  .vote-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid #e5e7eb;
  }

  .creator {
    font-size: 0.8rem;
    color: #9ca3af;
  }

  .details-btn {
    background: #4a7c59;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .details-btn:hover {
    background: #3d6a4a;
  }

  .blockchain-badge {
    margin-top: 12px;
    padding: 8px 12px;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 6px;
    font-size: 0.75rem;
    color: #166534;
    font-family: monospace;
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal {
    background: white;
    border-radius: 16px;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal.large {
    max-width: 700px;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 20px;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-header h3 {
    margin: 0;
    color: #1f2937;
  }

  .modal-badges {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #9ca3af;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }

  .close-btn:hover {
    color: #6b7280;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 20px;
    border-top: 1px solid #e5e7eb;
  }

  /* Form */
  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    color: #374151;
    font-size: 0.9rem;
  }

  .form-group input,
  .form-group textarea,
  .form-group select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.95rem;
  }

  .form-group input:focus,
  .form-group textarea:focus,
  .form-group select:focus {
    outline: none;
    border-color: #4a7c59;
    box-shadow: 0 0 0 3px rgba(74, 124, 89, 0.1);
  }

  .option-input-row {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  }

  .option-input-row input {
    flex: 1;
  }

  .remove-option-btn {
    background: #fee2e2;
    color: #dc2626;
    border: none;
    width: 36px;
    border-radius: 6px;
    cursor: pointer;
  }

  .add-option-btn {
    background: #f3f4f6;
    border: 1px dashed #d1d5db;
    padding: 8px;
    border-radius: 6px;
    width: 100%;
    cursor: pointer;
    color: #6b7280;
  }

  .add-option-btn:hover {
    background: #e5e7eb;
  }

  .eligibility-selector {
    display: flex;
    gap: 12px;
  }

  .eligibility-option {
    flex: 1;
    padding: 12px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .eligibility-option:hover {
    border-color: #4a7c59;
  }

  .eligibility-option.selected {
    border-color: #4a7c59;
    background: #f0fdf4;
  }

  .eligibility-hint {
    margin: 8px 0 0;
    font-size: 0.8rem;
    color: #16a34a;
  }

  .cancel-btn {
    background: #f3f4f6;
    color: #374151;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
  }

  .submit-btn {
    background: #4a7c59;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }

  .submit-btn:hover {
    background: #3d6a4a;
  }

  /* Detail modal */
  .detail-description {
    margin: 0 0 20px;
    color: #4b5563;
    line-height: 1.6;
  }

  .detail-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
    margin-bottom: 24px;
    padding: 16px;
    background: #f9fafb;
    border-radius: 8px;
  }

  .meta-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .meta-item.highlight {
    color: #f59e0b;
  }

  .meta-label {
    font-size: 0.75rem;
    color: #9ca3af;
  }

  .meta-value {
    font-weight: 500;
    color: #374151;
  }

  .detail-options h4 {
    margin: 0 0 16px;
    color: #1f2937;
  }

  .detail-option {
    padding: 16px;
    background: #f9fafb;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    margin-bottom: 12px;
    transition: all 0.2s;
  }

  .detail-option.clickable {
    cursor: pointer;
  }

  .detail-option.clickable:hover {
    border-color: #4a7c59;
    background: #f0fdf4;
  }

  .detail-option.winner {
    border-color: #22c55e;
    background: #f0fdf4;
  }

  .detail-option.user-voted {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .option-main {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .option-votes {
    font-weight: 600;
    color: #4a7c59;
  }

  .detail-progress-container {
    margin-bottom: 8px;
  }

  .detail-progress-bar {
    height: 12px;
    background: #e5e7eb;
    border-radius: 6px;
    overflow: hidden;
    position: relative;
  }

  .detail-progress {
    height: 100%;
    position: absolute;
    top: 0;
    transition: width 0.3s;
  }

  .detail-progress.trusted {
    background: linear-gradient(90deg, #22c55e, #16a34a);
    left: 0;
    border-radius: 6px 0 0 6px;
  }

  .detail-progress.new-member {
    background: #9ca3af;
    border-radius: 0 6px 6px 0;
  }

  .option-breakdown {
    display: flex;
    gap: 16px;
    font-size: 0.8rem;
  }

  .breakdown-item {
    color: #6b7280;
  }

  .breakdown-item.trusted {
    color: #16a34a;
  }

  /* Summary */
  .detail-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
    margin: 24px 0;
  }

  .summary-card {
    text-align: center;
    padding: 16px;
    background: #f3f4f6;
    border-radius: 10px;
  }

  .summary-card.trusted {
    background: #dcfce7;
  }

  .summary-card.new {
    background: #f3f4f6;
  }

  .summary-card.ratio {
    background: #fef3c7;
  }

  .summary-value {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
  }

  .summary-label {
    font-size: 0.8rem;
    color: #6b7280;
  }

  /* Blockchain info */
  .blockchain-info {
    margin-top: 24px;
    padding: 16px;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 10px;
  }

  .blockchain-info h4 {
    margin: 0 0 8px;
    color: #166534;
  }

  .blockchain-info p {
    margin: 0 0 12px;
    color: #4b5563;
    font-size: 0.9rem;
  }

  .blockchain-info code {
    display: block;
    padding: 8px 12px;
    background: white;
    border-radius: 6px;
    font-size: 0.85rem;
    color: #166534;
    margin-bottom: 12px;
    word-break: break-all;
  }

  .verify-btn {
    background: none;
    border: none;
    color: #16a34a;
    font-weight: 500;
    cursor: pointer;
    padding: 0;
  }

  .verify-btn:hover {
    text-decoration: underline;
  }

  /* Action hints */
  .vote-action-hint {
    margin-top: 20px;
    padding: 16px;
    background: #eff6ff;
    border-radius: 10px;
    text-align: center;
  }

  .vote-action-hint p {
    margin: 0;
    color: #1d4ed8;
    font-weight: 500;
  }

  .new-member-hint {
    margin-top: 8px !important;
    font-size: 0.85rem;
    color: #6b7280 !important;
    font-weight: 400 !important;
  }

  .already-voted {
    margin-top: 20px;
    padding: 16px;
    background: #dcfce7;
    border-radius: 10px;
    text-align: center;
    color: #166534;
    font-weight: 500;
  }

  .not-eligible {
    margin-top: 20px;
    padding: 16px;
    background: #fef3c7;
    border-radius: 10px;
    text-align: center;
    color: #92400e;
  }

  .not-eligible small {
    opacity: 0.8;
  }
</style>
