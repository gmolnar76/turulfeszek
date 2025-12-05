<script lang="ts">
  import { writable } from 'svelte/store';
  import type { 
    EmailInvite, 
    BuddyInviteRequest, 
    InviteStatus, 
    FamilyMember,
    AgeGroupCategory 
  } from '../types/representative.types';
  import FantasyNameGenerator from './FantasyNameGenerator.svelte';

  // Props
  export let constituencyId: string = 'OEVK-01';

  // Meghívó típusok
  type InviteType = 'adult' | 'family' | 'buddy' | 'representative';

  // State
  let activeTab: 'send' | 'pending' | 'history' | 'family' | 'name-generator' = 'send';
  let selectedInviteType: InviteType = 'adult';
  let targetEmail = '';
  let targetName = '';
  let personalMessage = '';
  let isLoading = false;
  let successMessage = '';
  let errorMessage = '';

  // Fantázianév
  let showNameGenerator = false;
  let selectedFantasyName = '';

  // Családtag hozzáadás
  let newFamilyMemberName = '';
  let newFamilyMemberBirthYear = '';
  let newFamilyMemberRelation: 'child' | 'spouse' | 'parent' | 'sibling' = 'child';

  // Mock adatok - Elküldött meghívók
  let sentInvites: EmailInvite[] = [
    {
      id: 'inv-001',
      inviterId: 'user-123',
      inviterName: 'Kovács János',
      targetEmail: 'peter.kiss@email.hu',
      targetName: 'Kiss Péter',
      type: 'adult',
      status: 'registered',
      createdAt: new Date('2024-01-15'),
      emailSentAt: new Date('2024-01-15'),
      emailOpenedAt: new Date('2024-01-16'),
      registeredAt: new Date('2024-01-17'),
      registeredUserId: 'user-456',
      constituencyId: 'OEVK-01'
    },
    {
      id: 'inv-002',
      inviterId: 'user-123',
      inviterName: 'Kovács János',
      targetEmail: 'anna.nagy@email.hu',
      targetName: 'Nagy Anna',
      type: 'adult',
      status: 'opened',
      createdAt: new Date('2024-01-20'),
      emailSentAt: new Date('2024-01-20'),
      emailOpenedAt: new Date('2024-01-21'),
      constituencyId: 'OEVK-01'
    },
    {
      id: 'inv-003',
      inviterId: 'user-123',
      inviterName: 'Kovács János',
      targetEmail: 'bela.szabo@email.hu',
      targetName: 'Szabó Béla',
      type: 'family',
      status: 'sent',
      createdAt: new Date('2024-01-25'),
      emailSentAt: new Date('2024-01-25'),
      constituencyId: 'OEVK-01',
      familyMemberId: 'fm-001'
    },
    {
      id: 'inv-004',
      inviterId: 'user-123',
      inviterName: 'Kovács János',
      targetEmail: 'expired@email.hu',
      targetName: 'Lejárt Meghívó',
      type: 'adult',
      status: 'expired',
      createdAt: new Date('2023-12-01'),
      emailSentAt: new Date('2023-12-01'),
      expiresAt: new Date('2024-01-01'),
      constituencyId: 'OEVK-01'
    }
  ];

  // Mock adatok - Családtagok
  let familyMembers: FamilyMember[] = [
    {
      id: 'fm-001',
      parentId: 'user-123',
      name: 'Kovács Bence',
      birthYear: 2010,
      relation: 'child',
      ageGroup: 'teen',
      canInviteBuddies: true,
      buddyInviteQuota: 3,
      buddyInvitesSent: 1,
      addedAt: new Date('2024-01-10')
    },
    {
      id: 'fm-002',
      parentId: 'user-123',
      name: 'Kovács Emma',
      birthYear: 2015,
      relation: 'child',
      ageGroup: 'child',
      canInviteBuddies: false,
      buddyInviteQuota: 0,
      buddyInvitesSent: 0,
      addedAt: new Date('2024-01-10')
    },
    {
      id: 'fm-003',
      parentId: 'user-123',
      name: 'Kovácsné Nagy Mária',
      birthYear: 1985,
      relation: 'spouse',
      ageGroup: 'adult',
      canInviteBuddies: false,
      buddyInviteQuota: 0,
      buddyInvitesSent: 0,
      addedAt: new Date('2024-01-10'),
      linkedUserId: 'user-789'
    }
  ];

  // Mock adatok - Haveri meghívó kérelmek (gyerek -> szülőnek)
  let buddyRequests: BuddyInviteRequest[] = [
    {
      id: 'br-001',
      requesterId: 'fm-001',
      requesterName: 'Kovács Bence',
      buddyName: 'Tóth Márk',
      buddyParentEmail: 'toth.szulok@email.hu',
      message: 'Márk a legjobb barátom az iskolából, ő is szeretne csatlakozni!',
      status: 'pending',
      createdAt: new Date('2024-01-28')
    }
  ];

  // Statisztikák
  $: inviteStats = {
    total: sentInvites.length,
    registered: sentInvites.filter(i => i.status === 'registered').length,
    opened: sentInvites.filter(i => i.status === 'opened').length,
    sent: sentInvites.filter(i => i.status === 'sent').length,
    expired: sentInvites.filter(i => i.status === 'expired').length,
    pending: buddyRequests.filter(r => r.status === 'pending').length,
    conversionRate: sentInvites.length > 0 
      ? Math.round((sentInvites.filter(i => i.status === 'registered').length / sentInvites.length) * 100)
      : 0
  };

  // Segédfüggvények
  function getStatusIcon(status: InviteStatus): string {
    switch (status) {
      case 'pending': return '⏳';
      case 'sent': return '📧';
      case 'opened': return '👁️';
      case 'registered': return '✅';
      case 'expired': return '⏰';
      default: return '❓';
    }
  }

  function getStatusLabel(status: InviteStatus): string {
    switch (status) {
      case 'pending': return 'Függőben';
      case 'sent': return 'Elküldve';
      case 'opened': return 'Megnyitva';
      case 'registered': return 'Regisztrált';
      case 'expired': return 'Lejárt';
      default: return 'Ismeretlen';
    }
  }

  function getStatusColor(status: InviteStatus): string {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'sent': return '#3b82f6';
      case 'opened': return '#8b5cf6';
      case 'registered': return '#10b981';
      case 'expired': return '#ef4444';
      default: return '#6b7280';
    }
  }

  function getInviteTypeLabel(type: InviteType): string {
    switch (type) {
      case 'adult': return '🧑 Felnőtt meghívó';
      case 'family': return '👨‍👩‍👧‍👦 Családi meghívó';
      case 'buddy': return '🤝 Haveri meghívó';
      case 'representative': return '🏛️ Képviselői meghívó';
      default: return 'Meghívó';
    }
  }

  function getInviteTypeDescription(type: InviteType): string {
    switch (type) {
      case 'adult': return 'Felnőtt (18+) személy meghívása a közösségbe';
      case 'family': return 'Családtag (18+) meghívása, kapcsolódik a családi fiókodhoz';
      case 'buddy': return 'Gyermeked barátjának meghívása (a szülő email címére megy)';
      case 'representative': return 'Közvetlen meghívó képviselőtől - különleges státusz';
      default: return '';
    }
  }

  function getAgeGroup(birthYear: number): AgeGroupCategory {
    const age = new Date().getFullYear() - birthYear;
    if (age < 6) return 'toddler';
    if (age < 14) return 'child';
    if (age < 18) return 'teen';
    if (age < 25) return 'young';
    if (age < 40) return 'adult';
    if (age < 60) return 'middle';
    return 'senior';
  }

  function getAgeGroupLabel(ageGroup: AgeGroupCategory): string {
    switch (ageGroup) {
      case 'toddler': return '👶 Kisgyermek (0-5)';
      case 'child': return '👧 Gyermek (6-13)';
      case 'teen': return '👦 Kamasz (14-17)';
      case 'young': return '🧑 Fiatal felnőtt (18-24)';
      case 'adult': return '👩 Felnőtt (25-39)';
      case 'middle': return '👨 Középkorú (40-59)';
      case 'senior': return '👴 Idős (60+)';
      default: return 'Ismeretlen';
    }
  }

  function formatDate(date: Date | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // E-mail meghívó küldése
  async function sendEmailInvite() {
    if (!targetEmail || !targetEmail.includes('@')) {
      errorMessage = 'Kérlek adj meg egy érvényes e-mail címet!';
      return;
    }

    if (!targetName.trim()) {
      errorMessage = 'Kérlek add meg a meghívott nevét!';
      return;
    }

    isLoading = true;
    errorMessage = '';
    successMessage = '';

    try {
      // Szimulált API hívás
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newInvite: EmailInvite = {
        id: `inv-${Date.now()}`,
        inviterId: 'user-123',
        inviterName: 'Kovács János',
        targetEmail: targetEmail.trim(),
        targetName: targetName.trim(),
        type: selectedInviteType,
        status: 'sent',
        createdAt: new Date(),
        emailSentAt: new Date(),
        constituencyId,
        personalMessage: personalMessage.trim() || undefined
      };

      sentInvites = [newInvite, ...sentInvites];
      
      successMessage = `Meghívó sikeresen elküldve: ${targetEmail}`;
      targetEmail = '';
      targetName = '';
      personalMessage = '';
    } catch (error) {
      errorMessage = 'Hiba történt a meghívó küldése közben. Próbáld újra később.';
    } finally {
      isLoading = false;
    }
  }

  // Meghívó újraküldése
  async function resendInvite(invite: EmailInvite) {
    if (invite.status === 'registered') {
      errorMessage = 'Ez a meghívó már felhasználásra került.';
      return;
    }

    isLoading = true;
    errorMessage = '';

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      sentInvites = sentInvites.map(i => {
        if (i.id === invite.id) {
          return {
            ...i,
            status: 'sent' as InviteStatus,
            emailSentAt: new Date(),
            emailOpenedAt: undefined
          };
        }
        return i;
      });

      successMessage = `Meghívó újraküldve: ${invite.targetEmail}`;
    } catch (error) {
      errorMessage = 'Hiba történt az újraküldés közben.';
    } finally {
      isLoading = false;
    }
  }

  // Családtag hozzáadása
  function addFamilyMember() {
    if (!newFamilyMemberName.trim()) {
      errorMessage = 'Kérlek add meg a családtag nevét!';
      return;
    }

    const birthYear = parseInt(newFamilyMemberBirthYear);
    if (isNaN(birthYear) || birthYear < 1900 || birthYear > new Date().getFullYear()) {
      errorMessage = 'Kérlek adj meg egy érvényes születési évet!';
      return;
    }

    const ageGroup = getAgeGroup(birthYear);
    const age = new Date().getFullYear() - birthYear;
    const canInviteBuddies = age >= 10 && age < 18;

    const newMember: FamilyMember = {
      id: `fm-${Date.now()}`,
      parentId: 'user-123',
      name: newFamilyMemberName.trim(),
      birthYear,
      relation: newFamilyMemberRelation,
      ageGroup,
      canInviteBuddies,
      buddyInviteQuota: canInviteBuddies ? 3 : 0,
      buddyInvitesSent: 0,
      addedAt: new Date()
    };

    familyMembers = [...familyMembers, newMember];
    newFamilyMemberName = '';
    newFamilyMemberBirthYear = '';
    successMessage = `${newMember.name} hozzáadva a családhoz!`;
    errorMessage = '';
  }

  // Családtag törlése
  function removeFamilyMember(memberId: string) {
    const member = familyMembers.find(m => m.id === memberId);
    if (member && confirm(`Biztosan törölni szeretnéd ${member.name} adatait?`)) {
      familyMembers = familyMembers.filter(m => m.id !== memberId);
      successMessage = `${member.name} eltávolítva a családból.`;
    }
  }

  // Haveri meghívó kérelem jóváhagyása
  async function approveBuddyRequest(request: BuddyInviteRequest) {
    isLoading = true;
    errorMessage = '';

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Létrehozunk egy új meghívót
      const newInvite: EmailInvite = {
        id: `inv-${Date.now()}`,
        inviterId: 'user-123',
        inviterName: 'Kovács János',
        targetEmail: request.buddyParentEmail,
        targetName: `${request.buddyName} szülője`,
        type: 'buddy',
        status: 'sent',
        createdAt: new Date(),
        emailSentAt: new Date(),
        constituencyId,
        personalMessage: `${request.requesterName} szeretné meghívni ${request.buddyName} barátját a közösségbe. "${request.message}"`
      };

      sentInvites = [newInvite, ...sentInvites];

      // Frissítjük a kérelem státuszát
      buddyRequests = buddyRequests.map(r => {
        if (r.id === request.id) {
          return { ...r, status: 'approved' as const, parentApprovedAt: new Date() };
        }
        return r;
      });

      // Frissítjük a gyerek meghívó számlálóját
      const requester = familyMembers.find(m => m.id === request.requesterId);
      if (requester) {
        familyMembers = familyMembers.map(m => {
          if (m.id === request.requesterId) {
            return { ...m, buddyInvitesSent: m.buddyInvitesSent + 1 };
          }
          return m;
        });
      }

      successMessage = `Haveri meghívó jóváhagyva és elküldve: ${request.buddyParentEmail}`;
    } catch (error) {
      errorMessage = 'Hiba történt a jóváhagyás közben.';
    } finally {
      isLoading = false;
    }
  }

  // Haveri meghívó kérelem elutasítása
  function rejectBuddyRequest(request: BuddyInviteRequest) {
    if (confirm(`Biztosan elutasítod ${request.requesterName} kérelmét ${request.buddyName} meghívására?`)) {
      buddyRequests = buddyRequests.map(r => {
        if (r.id === request.id) {
          return { ...r, status: 'rejected' as const };
        }
        return r;
      });
      successMessage = 'Kérelem elutasítva.';
    }
  }

  // Haveri meghívó kérelem (gyerek nevében)
  let selectedChildId = '';
  let buddyName = '';
  let buddyParentEmail = '';
  let buddyMessage = '';

  function submitBuddyRequest() {
    if (!selectedChildId) {
      errorMessage = 'Kérlek válassz ki egy gyermeket!';
      return;
    }

    const child = familyMembers.find(m => m.id === selectedChildId);
    if (!child) {
      errorMessage = 'Gyermek nem található.';
      return;
    }

    if (!child.canInviteBuddies) {
      errorMessage = 'Ez a gyermek még nem küldhet haveri meghívókat.';
      return;
    }

    if (child.buddyInvitesSent >= child.buddyInviteQuota) {
      errorMessage = `${child.name} már elérte a haveri meghívók limitjét (${child.buddyInviteQuota}).`;
      return;
    }

    if (!buddyName.trim()) {
      errorMessage = 'Kérlek add meg a barát nevét!';
      return;
    }

    if (!buddyParentEmail.includes('@')) {
      errorMessage = 'Kérlek adj meg egy érvényes e-mail címet!';
      return;
    }

    const newRequest: BuddyInviteRequest = {
      id: `br-${Date.now()}`,
      requesterId: child.id,
      requesterName: child.name,
      buddyName: buddyName.trim(),
      buddyParentEmail: buddyParentEmail.trim(),
      message: buddyMessage.trim(),
      status: 'pending',
      createdAt: new Date()
    };

    buddyRequests = [newRequest, ...buddyRequests];
    selectedChildId = '';
    buddyName = '';
    buddyParentEmail = '';
    buddyMessage = '';
    successMessage = `Haveri meghívó kérelem létrehozva ${child.name} nevében. Jóváhagyás után lesz elküldve.`;
    errorMessage = '';
  }

  // Tab tartalom tisztítása váltáskor
  function switchTab(tab: typeof activeTab) {
    activeTab = tab;
    errorMessage = '';
    successMessage = '';
  }

  // Fantázianév kiválasztás kezelése
  function handleFantasyNameSelect(event: CustomEvent<{ name: string; category: string }>) {
    selectedFantasyName = event.detail.name;
    targetName = event.detail.name;
    
    // E-mail javaslat generálása
    const normalized = event.detail.name
      .toLowerCase()
      .replace(/á/g, 'a')
      .replace(/é/g, 'e')
      .replace(/í/g, 'i')
      .replace(/ó|ö|ő/g, 'o')
      .replace(/ú|ü|ű/g, 'u')
      .replace(/\s+/g, '.')
      .replace(/[^a-z0-9.]/g, '');
    
    targetEmail = `${normalized}@fantazia.hu`;
    successMessage = `Fantázianév kiválasztva: ${event.detail.name}`;
    showNameGenerator = false;
    activeTab = 'send';
  }
</script>

<div class="invite-system">
  <div class="header">
    <h2>📧 E-mail Meghívó Rendszer</h2>
    <p class="subtitle">Hívd meg ismerőseidet és családtagjaidat a közösségbe</p>
  </div>

  <!-- Statisztikák -->
  <div class="stats-bar">
    <div class="stat">
      <span class="stat-value">{inviteStats.total}</span>
      <span class="stat-label">Összes meghívó</span>
    </div>
    <div class="stat registered">
      <span class="stat-value">{inviteStats.registered}</span>
      <span class="stat-label">Regisztrált</span>
    </div>
    <div class="stat opened">
      <span class="stat-value">{inviteStats.opened}</span>
      <span class="stat-label">Megnyitva</span>
    </div>
    <div class="stat sent">
      <span class="stat-value">{inviteStats.sent}</span>
      <span class="stat-label">Elküldve</span>
    </div>
    <div class="stat conversion">
      <span class="stat-value">{inviteStats.conversionRate}%</span>
      <span class="stat-label">Konverzió</span>
    </div>
  </div>

  <!-- Tab navigáció -->
  <div class="tabs">
    <button 
      class="tab" 
      class:active={activeTab === 'send'}
      on:click={() => switchTab('send')}
    >
      📤 Meghívó küldése
    </button>
    <button 
      class="tab" 
      class:active={activeTab === 'pending'}
      on:click={() => switchTab('pending')}
    >
      ⏳ Függő kérelmek
      {#if inviteStats.pending > 0}
        <span class="badge">{inviteStats.pending}</span>
      {/if}
    </button>
    <button 
      class="tab" 
      class:active={activeTab === 'history'}
      on:click={() => switchTab('history')}
    >
      📋 Előzmények
    </button>
    <button 
      class="tab" 
      class:active={activeTab === 'family'}
      on:click={() => switchTab('family')}
    >
      👨‍👩‍👧‍👦 Családtagok
    </button>
    <button 
      class="tab highlight" 
      class:active={activeTab === 'name-generator'}
      on:click={() => switchTab('name-generator')}
    >
      ✨ Fantázianév
    </button>
  </div>

  <!-- Üzenetek -->
  {#if successMessage}
    <div class="message success">
      ✅ {successMessage}
      <button class="close-btn" on:click={() => successMessage = ''}>×</button>
    </div>
  {/if}

  {#if errorMessage}
    <div class="message error">
      ❌ {errorMessage}
      <button class="close-btn" on:click={() => errorMessage = ''}>×</button>
    </div>
  {/if}

  <!-- Tab tartalom -->
  <div class="tab-content">
    <!-- Meghívó küldése -->
    {#if activeTab === 'send'}
      <div class="send-invite-panel">
        <h3>Új meghívó küldése</h3>

        <!-- Meghívó típus választó -->
        <div class="invite-type-selector">
          <span id="invite-type-label">Meghívó típusa:</span>
          <div class="type-options" role="group" aria-labelledby="invite-type-label">
            <button
              class="type-option"
              class:selected={selectedInviteType === 'adult'}
              on:click={() => selectedInviteType = 'adult'}
            >
              <span class="type-icon">🧑</span>
              <span class="type-name">Felnőtt</span>
            </button>
            <button
              class="type-option"
              class:selected={selectedInviteType === 'family'}
              on:click={() => selectedInviteType = 'family'}
            >
              <span class="type-icon">👨‍👩‍👧‍👦</span>
              <span class="type-name">Családi</span>
            </button>
            <button
              class="type-option"
              class:selected={selectedInviteType === 'buddy'}
              on:click={() => selectedInviteType = 'buddy'}
            >
              <span class="type-icon">🤝</span>
              <span class="type-name">Haveri</span>
            </button>
            <button
              class="type-option"
              class:selected={selectedInviteType === 'representative'}
              on:click={() => selectedInviteType = 'representative'}
              disabled
            >
              <span class="type-icon">🏛️</span>
              <span class="type-name">Képviselői</span>
            </button>
          </div>
          <p class="type-description">{getInviteTypeDescription(selectedInviteType)}</p>
        </div>

        <!-- Haveri meghívó űrlap -->
        {#if selectedInviteType === 'buddy'}
          <div class="buddy-invite-form">
            <div class="form-group">
              <label for="child-select">Melyik gyermeked barátját hívod meg?</label>
              <select id="child-select" bind:value={selectedChildId}>
                <option value="">-- Válassz gyermeket --</option>
                {#each familyMembers.filter(m => m.canInviteBuddies) as child}
                  <option value={child.id}>
                    {child.name} ({child.buddyInvitesSent}/{child.buddyInviteQuota} haveri meghívó)
                  </option>
                {/each}
              </select>
              {#if familyMembers.filter(m => m.canInviteBuddies).length === 0}
                <p class="hint">Nincs olyan családtag, aki küldhet haveri meghívókat. Tinédzser (10-17 éves) családtagok küldhetnek.</p>
              {/if}
            </div>

            <div class="form-group">
              <label for="buddy-name">Barát neve:</label>
              <input 
                type="text" 
                id="buddy-name" 
                bind:value={buddyName}
                placeholder="pl. Tóth Márk"
              />
            </div>

            <div class="form-group">
              <label for="buddy-parent-email">Barát szülőjének e-mail címe:</label>
              <input 
                type="email" 
                id="buddy-parent-email" 
                bind:value={buddyParentEmail}
                placeholder="pl. szulo@email.hu"
              />
              <p class="hint">A meghívó a szülő e-mail címére érkezik jóváhagyásra.</p>
            </div>

            <div class="form-group">
              <label for="buddy-message">Üzenet (opcionális):</label>
              <textarea 
                id="buddy-message" 
                bind:value={buddyMessage}
                placeholder="pl. Ő az osztálytársam, együtt sportolunk..."
                rows="2"
              ></textarea>
            </div>

            <button 
              class="send-btn"
              on:click={submitBuddyRequest}
              disabled={isLoading}
            >
              {isLoading ? '⏳ Küldés...' : '🤝 Haveri meghívó kérelem létrehozása'}
            </button>
          </div>

        <!-- Standard meghívó űrlap -->
        {:else}
          <div class="invite-form">
            <div class="form-group">
              <label for="target-name">Meghívott neve:</label>
              <input 
                type="text" 
                id="target-name" 
                bind:value={targetName}
                placeholder="pl. Kiss Péter"
              />
            </div>

            <div class="form-group">
              <label for="target-email">E-mail cím:</label>
              <input 
                type="email" 
                id="target-email" 
                bind:value={targetEmail}
                placeholder="pl. pelda@email.hu"
              />
            </div>

            <div class="form-group">
              <label for="personal-message">Személyes üzenet (opcionális):</label>
              <textarea 
                id="personal-message" 
                bind:value={personalMessage}
                placeholder="Írhatsz pár személyes sort a meghívóhoz..."
                rows="3"
              ></textarea>
            </div>

            <button 
              class="send-btn"
              on:click={sendEmailInvite}
              disabled={isLoading || !targetEmail || !targetName}
            >
              {isLoading ? '⏳ Küldés...' : '📧 Meghívó küldése'}
            </button>
          </div>
        {/if}
      </div>

    <!-- Függő kérelmek -->
    {:else if activeTab === 'pending'}
      <div class="pending-panel">
        <h3>⏳ Jóváhagyásra váró haveri meghívók</h3>
        
        {#if buddyRequests.filter(r => r.status === 'pending').length === 0}
          <div class="empty-state">
            <p>🎉 Nincs jóváhagyásra váró kérelem!</p>
          </div>
        {:else}
          <div class="requests-list">
            {#each buddyRequests.filter(r => r.status === 'pending') as request}
              <div class="request-card">
                <div class="request-header">
                  <span class="requester">🧒 {request.requesterName}</span>
                  <span class="date">{formatDate(request.createdAt)}</span>
                </div>
                <div class="request-body">
                  <p><strong>Barát neve:</strong> {request.buddyName}</p>
                  <p><strong>Szülő e-mail:</strong> {request.buddyParentEmail}</p>
                  {#if request.message}
                    <p class="message-text">"{request.message}"</p>
                  {/if}
                </div>
                <div class="request-actions">
                  <button 
                    class="approve-btn"
                    on:click={() => approveBuddyRequest(request)}
                    disabled={isLoading}
                  >
                    ✅ Jóváhagyás és küldés
                  </button>
                  <button 
                    class="reject-btn"
                    on:click={() => rejectBuddyRequest(request)}
                    disabled={isLoading}
                  >
                    ❌ Elutasítás
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

    <!-- Előzmények -->
    {:else if activeTab === 'history'}
      <div class="history-panel">
        <h3>📋 Meghívó előzmények</h3>
        
        {#if sentInvites.length === 0}
          <div class="empty-state">
            <p>Még nem küldtél meghívókat.</p>
          </div>
        {:else}
          <div class="invites-table">
            <div class="table-header">
              <span class="col-status">Státusz</span>
              <span class="col-name">Név</span>
              <span class="col-email">E-mail</span>
              <span class="col-type">Típus</span>
              <span class="col-date">Dátum</span>
              <span class="col-actions">Műveletek</span>
            </div>
            {#each sentInvites as invite}
              <div class="table-row">
                <span class="col-status">
                  <span 
                    class="status-badge"
                    style="background-color: {getStatusColor(invite.status)}"
                  >
                    {getStatusIcon(invite.status)} {getStatusLabel(invite.status)}
                  </span>
                </span>
                <span class="col-name">{invite.targetName}</span>
                <span class="col-email">{invite.targetEmail}</span>
                <span class="col-type">
                  {invite.type === 'adult' ? '🧑' : invite.type === 'family' ? '👨‍👩‍👧‍👦' : invite.type === 'buddy' ? '🤝' : '🏛️'}
                </span>
                <span class="col-date">{formatDate(invite.emailSentAt)}</span>
                <span class="col-actions">
                  {#if invite.status !== 'registered' && invite.status !== 'expired'}
                    <button 
                      class="resend-btn"
                      on:click={() => resendInvite(invite)}
                      disabled={isLoading}
                      title="Újraküldés"
                    >
                      🔄
                    </button>
                  {/if}
                </span>
              </div>
            {/each}
          </div>
        {/if}
      </div>

    <!-- Családtagok -->
    {:else if activeTab === 'family'}
      <div class="family-panel">
        <h3>👨‍👩‍👧‍👦 Családtagok kezelése</h3>
        
        <!-- Családtagok listája -->
        <div class="family-list">
          {#if familyMembers.length === 0}
            <div class="empty-state">
              <p>Még nem adtál hozzá családtagokat.</p>
            </div>
          {:else}
            {#each familyMembers as member}
              <div class="family-card">
                <div class="member-info">
                  <span class="member-name">{member.name}</span>
                  <span class="member-details">
                    {getAgeGroupLabel(member.ageGroup)} • {member.relation === 'child' ? 'Gyermek' : member.relation === 'spouse' ? 'Házastárs' : member.relation === 'parent' ? 'Szülő' : 'Testvér'}
                  </span>
                  {#if member.canInviteBuddies}
                    <span class="buddy-quota">
                      🤝 Haveri meghívók: {member.buddyInvitesSent}/{member.buddyInviteQuota}
                    </span>
                  {/if}
                  {#if member.linkedUserId}
                    <span class="linked-badge">✅ Összekapcsolt fiók</span>
                  {/if}
                </div>
                <button 
                  class="remove-btn"
                  on:click={() => removeFamilyMember(member.id)}
                  title="Eltávolítás"
                >
                  🗑️
                </button>
              </div>
            {/each}
          {/if}
        </div>

        <!-- Új családtag hozzáadása -->
        <div class="add-family-form">
          <h4>➕ Új családtag hozzáadása</h4>
          <div class="form-row">
            <div class="form-group">
              <label for="member-name">Név:</label>
              <input 
                type="text" 
                id="member-name" 
                bind:value={newFamilyMemberName}
                placeholder="pl. Kovács Bence"
              />
            </div>
            <div class="form-group">
              <label for="member-birth-year">Születési év:</label>
              <input 
                type="number" 
                id="member-birth-year" 
                bind:value={newFamilyMemberBirthYear}
                placeholder="pl. 2010"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
            <div class="form-group">
              <label for="member-relation">Kapcsolat:</label>
              <select id="member-relation" bind:value={newFamilyMemberRelation}>
                <option value="child">Gyermek</option>
                <option value="spouse">Házastárs</option>
                <option value="parent">Szülő</option>
                <option value="sibling">Testvér</option>
              </select>
            </div>
          </div>
          <button 
            class="add-btn"
            on:click={addFamilyMember}
          >
            ➕ Családtag hozzáadása
          </button>
        </div>
      </div>

    <!-- Fantázianév generátor -->
    {:else if activeTab === 'name-generator'}
      <FantasyNameGenerator on:select={handleFantasyNameSelect} />
    {/if}
  </div>
</div>

<style>
  .invite-system {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 16px;
    padding: 24px;
    color: #e4e4e7;
  }

  .header {
    text-align: center;
    margin-bottom: 24px;
  }

  .header h2 {
    color: #fff;
    margin: 0 0 8px 0;
    font-size: 1.5rem;
  }

  .subtitle {
    color: #a1a1aa;
    margin: 0;
  }

  /* Statisztikák */
  .stats-bar {
    display: flex;
    justify-content: space-around;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .stat {
    text-align: center;
    padding: 8px 16px;
  }

  .stat-value {
    display: block;
    font-size: 1.5rem;
    font-weight: bold;
    color: #fff;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #a1a1aa;
    text-transform: uppercase;
  }

  .stat.registered .stat-value { color: #10b981; }
  .stat.opened .stat-value { color: #8b5cf6; }
  .stat.sent .stat-value { color: #3b82f6; }
  .stat.conversion .stat-value { color: #f59e0b; }

  /* Tabs */
  .tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .tab {
    padding: 12px 20px;
    border: none;
    background: rgba(255, 255, 255, 0.05);
    color: #a1a1aa;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tab:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  .tab.active {
    background: #3b82f6;
    color: #fff;
  }

  .tab.highlight {
    border: 1px solid #f59e0b;
    background: rgba(245, 158, 11, 0.1);
  }

  .tab.highlight:hover {
    background: rgba(245, 158, 11, 0.2);
  }

  .tab.highlight.active {
    background: #f59e0b;
    border-color: #f59e0b;
  }

  .badge {
    background: #ef4444;
    color: white;
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 10px;
    font-weight: bold;
  }

  /* Messages */
  .message {
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .message.success {
    background: rgba(16, 185, 129, 0.2);
    border: 1px solid #10b981;
  }

  .message.error {
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid #ef4444;
  }

  .close-btn {
    background: none;
    border: none;
    color: inherit;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0 4px;
  }

  /* Tab content */
  .tab-content {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    padding: 24px;
  }

  .tab-content h3 {
    margin: 0 0 20px 0;
    color: #fff;
  }

  /* Form styles */
  .form-group {
    margin-bottom: 16px;
  }

  .form-group label {
    display: block;
    margin-bottom: 6px;
    color: #d4d4d8;
    font-size: 0.9rem;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
    font-size: 1rem;
  }

  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #3b82f6;
  }

  .form-group input::placeholder,
  .form-group textarea::placeholder {
    color: #71717a;
  }

  .hint {
    font-size: 0.8rem;
    color: #71717a;
    margin-top: 4px;
  }

  /* Invite type selector */
  .invite-type-selector {
    margin-bottom: 24px;
  }

  #invite-type-label {
    display: block;
    margin-bottom: 12px;
    color: #d4d4d8;
  }

  .type-options {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .type-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 24px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    background: transparent;
    color: #a1a1aa;
    cursor: pointer;
    transition: all 0.2s;
  }

  .type-option:hover:not(:disabled) {
    border-color: rgba(255, 255, 255, 0.3);
    color: #fff;
  }

  .type-option.selected {
    border-color: #3b82f6;
    background: rgba(59, 130, 246, 0.1);
    color: #fff;
  }

  .type-option:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .type-icon {
    font-size: 1.5rem;
    margin-bottom: 4px;
  }

  .type-name {
    font-size: 0.85rem;
  }

  .type-description {
    color: #71717a;
    font-size: 0.85rem;
    margin-top: 12px;
    font-style: italic;
  }

  /* Buttons */
  .send-btn, .add-btn {
    width: 100%;
    padding: 14px;
    border: none;
    border-radius: 8px;
    background: #3b82f6;
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .send-btn:hover:not(:disabled),
  .add-btn:hover:not(:disabled) {
    background: #2563eb;
  }

  .send-btn:disabled,
  .add-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Empty state */
  .empty-state {
    text-align: center;
    padding: 40px;
    color: #71717a;
  }

  /* Requests list */
  .requests-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .request-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 16px;
  }

  .request-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .requester {
    font-weight: 600;
    color: #fff;
  }

  .date {
    color: #71717a;
    font-size: 0.85rem;
  }

  .request-body p {
    margin: 4px 0;
    font-size: 0.9rem;
  }

  .message-text {
    color: #a1a1aa;
    font-style: italic;
    margin-top: 8px !important;
  }

  .request-actions {
    display: flex;
    gap: 12px;
    margin-top: 16px;
  }

  .approve-btn, .reject-btn {
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
  }

  .approve-btn {
    background: #10b981;
    color: white;
  }

  .approve-btn:hover:not(:disabled) {
    background: #059669;
  }

  .reject-btn {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
  }

  .reject-btn:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.3);
  }

  /* History table */
  .invites-table {
    overflow-x: auto;
  }

  .table-header, .table-row {
    display: grid;
    grid-template-columns: 120px 1fr 1fr 60px 140px 80px;
    gap: 12px;
    padding: 12px;
    align-items: center;
  }

  .table-header {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    font-weight: 600;
    color: #a1a1aa;
    font-size: 0.8rem;
    text-transform: uppercase;
  }

  .table-row {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .table-row:last-child {
    border-bottom: none;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.75rem;
    color: white;
  }

  .col-email {
    font-size: 0.9rem;
    color: #a1a1aa;
  }

  .resend-btn {
    padding: 6px 12px;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .resend-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
  }

  /* Family panel */
  .family-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
  }

  .family-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 16px;
  }

  .member-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .member-name {
    font-weight: 600;
    color: #fff;
    font-size: 1.1rem;
  }

  .member-details {
    color: #a1a1aa;
    font-size: 0.85rem;
  }

  .buddy-quota {
    color: #3b82f6;
    font-size: 0.85rem;
  }

  .linked-badge {
    color: #10b981;
    font-size: 0.8rem;
  }

  .remove-btn {
    padding: 8px 12px;
    border: none;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .remove-btn:hover {
    background: rgba(239, 68, 68, 0.2);
  }

  /* Add family form */
  .add-family-form {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    padding: 20px;
    border: 1px dashed rgba(255, 255, 255, 0.1);
  }

  .add-family-form h4 {
    margin: 0 0 16px 0;
    color: #fff;
  }

  .form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .stats-bar {
      justify-content: center;
    }

    .table-header, .table-row {
      grid-template-columns: 100px 1fr 60px;
    }

    .col-email, .col-date {
      display: none;
    }

    .type-options {
      flex-direction: column;
    }

    .type-option {
      flex-direction: row;
      justify-content: flex-start;
      gap: 12px;
    }

    .form-row {
      grid-template-columns: 1fr;
    }
  }
</style>
