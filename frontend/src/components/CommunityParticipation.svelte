<script lang="ts">
  import L from 'leaflet';
  import { onMount } from 'svelte';
  import { initializeCommunityData, HUNGARIAN_HOLIDAYS, calculateEventStats, FAMOUS_HUNGARIANS, FAMOUS_HUNGARIAN_CATEGORIES, REGION_LABELS, MOCK_NOTIFICATIONS } from '../data/communityMockData';
  import type { CommunityEvent, CommunityParticipant, NationalHoliday, FamousHungarian, EventNotification } from '../types/community.types';

  let mapContainer: HTMLDivElement;
  let map: L.Map;
  let selectedHolidayId = 'march15';
  let selectedCity: string | null = null;
  let selectedRegion: string = 'all';
  let activeTab: 'events' | 'famous' | 'notifications' = 'events';
  let selectedFamousCategory: string = 'all';

  let holidays: NationalHoliday[] = HUNGARIAN_HOLIDAYS;
  let events: CommunityEvent[] = [];
  let participants: CommunityParticipant[] = [];
  let notifications: EventNotification[] = MOCK_NOTIFICATIONS;

  let filteredEvents: CommunityEvent[] = [];
  let filteredParticipants: CommunityParticipant[] = [];
  let selectedEvent: CommunityEvent | null = null;
  let eventStats: any = null;

  // New event form
  let showNewEventForm = false;
  let newEvent = {
    city: '',
    locationName: '',
    address: '',
    region: 'helyi' as 'helyi' | 'megyei' | 'regionalis' | 'orszagos',
    organizer: '',
    maxParticipants: 100,
  };

  // Track locally created events (active events with blinking markers)
  let locallyCreatedEventIds: Set<string> = new Set();

  // Notification form
  let showNotificationForm = false;
  let newNotification = {
    title: '',
    message: '',
    targetAudience: 'helyi' as 'helyi' | 'megyei' | 'regionalis' | 'orszagos',
  };

  onMount(async () => {
    const data = initializeCommunityData();
    events = data.events;
    participants = data.participants;

    // Initialize map
    map = L.map(mapContainer).setView([46.2, 20.5], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    updateDisplay();
  });

  function updateDisplay() {
    // Filter events by selected holiday
    filteredEvents = events.filter((e) => e.holidayId === selectedHolidayId);

    // Filter by region if selected
    if (selectedRegion !== 'all') {
      filteredEvents = filteredEvents.filter((e) => e.region === selectedRegion);
    }

    // Filter by city if selected
    if (selectedCity) {
      filteredEvents = filteredEvents.filter((e) => e.city === selectedCity);
    }

    // Update map
    updateMap();

    // Update participant list
    updateParticipants();
  }

  function updateMap() {
    // Remove existing markers and layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || (layer as any).isParticipantLayer) {
        map.removeLayer(layer);
      }
    });

    // Add event markers
    filteredEvents.forEach((event) => {
      const [lat, lon] = event.location.coordinates;
      const isLocallyCreated = locallyCreatedEventIds.has(event.id);
      
      // Use different icon for locally created (active) events
      const iconUrl = isLocallyCreated 
        ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'
        : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';
      
      const marker = L.marker([lat, lon], {
        icon: L.icon({
          iconUrl: iconUrl,
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
          className: isLocallyCreated ? 'blinking-marker' : '',
        }),
      })
        .bindPopup(`<strong>${event.location.name}</strong><br>${event.city}${isLocallyCreated ? '<br><span style="color: #10b981; font-weight: bold;">🟢 Aktív esemény</span>' : ''}`)
        .addTo(map);
      
      // Add pulsating circle for locally created events
      if (isLocallyCreated) {
        const pulsingCircle = L.circleMarker([lat, lon], {
          radius: 20,
          fillColor: '#10b981',
          color: '#10b981',
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.3,
          className: 'pulse-circle',
        }).addTo(map);
        (pulsingCircle as any).isParticipantLayer = true;
      }

      marker.on('click', () => {
        selectedEvent = event;
        selectedCity = event.city;
        eventStats = calculateEventStats(event.id, participants);
        updateParticipants();
      });
    });

    // Add participant dots
    filteredParticipants.forEach((participant) => {
      const [lat, lon] = participant.coordinates;
      const layer = L.circleMarker([lat, lon], {
        radius: 4,
        fillColor: getActivityColor(participant.activityScore),
        color: '#333',
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.7,
      })
        .bindPopup(
          `Aktivitás: ${participant.activityScore}<br>Típus: ${participant.recognitionType}`
        )
        .addTo(map);

      (layer as any).isParticipantLayer = true;
    });

    // Fit map to show all events
    if (filteredEvents.length > 0) {
      const bounds = L.latLngBounds(
        filteredEvents.map((e) => L.latLng(e.location.coordinates[0], e.location.coordinates[1]))
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  function updateParticipants() {
    if (selectedEvent) {
      filteredParticipants = participants.filter((p) => p.eventId === selectedEvent!.id);
    } else {
      filteredParticipants = participants.filter((p) =>
        filteredEvents.some((e) => e.id === p.eventId)
      );
    }
  }

  function getActivityColor(score: number): string {
    if (score > 80) return '#fbbf24'; // outstanding - amber
    if (score > 60) return '#8b5cf6'; // dedicated - purple
    return '#3b82f6'; // standard - blue
  }

  function selectHoliday(holidayId: string) {
    selectedHolidayId = holidayId;
    selectedCity = null;
    selectedEvent = null;
    eventStats = null;
    updateDisplay();
  }

  function selectCity(city: string) {
    if (selectedCity === city) {
      selectedCity = null;
      selectedEvent = null;
      eventStats = null;
    } else {
      selectedCity = city;
      selectedEvent = null;
      eventStats = null;
    }
    updateDisplay();
  }

  function selectRegion(region: string) {
    selectedRegion = region;
    selectedCity = null;
    selectedEvent = null;
    eventStats = null;
    updateDisplay();
  }

  function clearSelection() {
    selectedCity = null;
    selectedEvent = null;
    eventStats = null;
    selectedRegion = 'all';
    updateDisplay();
  }

  function getFilteredFamousHungarians(): FamousHungarian[] {
    if (selectedFamousCategory === 'all') return FAMOUS_HUNGARIANS;
    return FAMOUS_HUNGARIANS.filter(h => h.category === selectedFamousCategory);
  }

  function createEvent() {
    if (!newEvent.city || !newEvent.locationName) return;
    const holiday = holidays.find(h => h.id === selectedHolidayId);
    if (!holiday) return;
    
    const cityCoords: Record<string, [number, number]> = {
      Budapest: [47.4979, 19.0402], Debrecen: [47.5316, 21.6273], Szeged: [46.2530, 20.1414],
      Pécs: [46.0727, 18.2308], Győr: [47.6875, 17.6458], Miskolc: [48.1035, 20.7784],
    };
    const coords = cityCoords[newEvent.city] || [47.0, 19.5];
    
    const eventId = `event-${Date.now()}`;
    const event: CommunityEvent = {
      id: eventId,
      holidayId: selectedHolidayId,
      city: newEvent.city,
      location: { name: newEvent.locationName, address: newEvent.address, coordinates: coords },
      region: newEvent.region,
      participationStartDate: holiday.date,
      participationEndDate: holiday.date,
      organizer: newEvent.organizer,
      maxParticipants: newEvent.maxParticipants,
    };
    events = [...events, event];
    
    // Mark as locally created (active) event - will show blinking marker
    locallyCreatedEventIds.add(eventId);
    locallyCreatedEventIds = locallyCreatedEventIds; // Trigger reactivity
    
    showNewEventForm = false;
    newEvent = { city: '', locationName: '', address: '', region: 'helyi', organizer: '', maxParticipants: 100 };
    updateDisplay();
  }

  // Function to end event activity (stop blinking)
  function endEventActivity(eventId: string) {
    locallyCreatedEventIds.delete(eventId);
    locallyCreatedEventIds = locallyCreatedEventIds; // Trigger reactivity
    updateDisplay();
  }

  function sendNotification() {
    if (!newNotification.title || !newNotification.message || !selectedEvent) return;
    const notification: EventNotification = {
      id: `n-${Date.now()}`,
      eventId: selectedEvent.id,
      title: newNotification.title,
      message: newNotification.message,
      targetAudience: newNotification.targetAudience,
      sentAt: new Date().toISOString(),
      readCount: 0,
      totalRecipients: Math.floor(Math.random() * 500) + 100,
    };
    notifications = [...notifications, notification];
    showNotificationForm = false;
    newNotification = { title: '', message: '', targetAudience: 'helyi' };
  }
</script>

<div class="community-participation">
  <div class="header">
    <h2>🇭🇺 Magyar Nemzeti Ünnepek</h2>
    <p>Nemzeti ünnepi közösségi rendezvények és részvételi statisztikák</p>
  </div>

  <!-- Tab Navigation -->
  <div class="tabs">
    <button class="tab-btn {activeTab === 'events' ? 'active' : ''}" on:click={() => activeTab = 'events'}>📅 Rendezvények</button>
    <button class="tab-btn {activeTab === 'famous' ? 'active' : ''}" on:click={() => activeTab = 'famous'}>⭐ Híres Magyarok</button>
    <button class="tab-btn {activeTab === 'notifications' ? 'active' : ''}" on:click={() => activeTab = 'notifications'}>🔔 Értesítések</button>
  </div>

  {#if activeTab === 'events'}
  <div class="content-container">
    <div class="left-panel">
      <!-- Holiday Selection -->
      <div class="holidays-section">
        <h3>Magyar Nemzeti Ünnepek</h3>
        <div class="holidays-grid">
          {#each holidays as holiday (holiday.id)}
            <button
              class="holiday-btn {selectedHolidayId === holiday.id ? 'active' : ''}"
              on:click={() => selectHoliday(holiday.id)}
              title={holiday.description}
            >
              <span class="icon">{holiday.icon}</span>
              <span class="name">{holiday.name}</span>
              <span class="date">{new Date(holiday.date).toLocaleDateString('hu-HU')}</span>
            </button>
          {/each}
        </div>
      </div>

      <!-- Region Filter -->
      <div class="region-section">
        <h3>Régió Szűrő</h3>
        <div class="region-buttons">
          <button class="region-btn {selectedRegion === 'all' ? 'active' : ''}" on:click={() => selectRegion('all')}>Mind</button>
          <button class="region-btn {selectedRegion === 'helyi' ? 'active' : ''}" on:click={() => selectRegion('helyi')}>Helyi</button>
          <button class="region-btn {selectedRegion === 'megyei' ? 'active' : ''}" on:click={() => selectRegion('megyei')}>Megyei</button>
          <button class="region-btn {selectedRegion === 'regionalis' ? 'active' : ''}" on:click={() => selectRegion('regionalis')}>Regionális</button>
          <button class="region-btn {selectedRegion === 'orszagos' ? 'active' : ''}" on:click={() => selectRegion('orszagos')}>Országos</button>
        </div>
      </div>

      <!-- Cities for Selected Holiday -->
      {#if filteredEvents.length > 0}
        <div class="cities-section">
          <h3>Helyszínek ({filteredEvents.length})</h3>
          <div class="cities-list">
            {#each [...new Set(filteredEvents.map(e => e.city))] as city (city)}
              {@const cityEventCount = filteredEvents.filter(e => e.city === city).length}
              <button
                class="city-btn {selectedCity === city ? 'active' : ''}"
                on:click={() => selectCity(city)}
              >
                <span class="city-name">{city}</span>
                <span class="event-count">{cityEventCount} esemény</span>
              </button>
            {/each}
          </div>
          {#if selectedCity || selectedRegion !== 'all'}
            <button class="clear-btn" on:click={clearSelection}>Szűrés törlése</button>
          {/if}
        </div>
      {/if}

      <!-- New Event Button -->
      <button class="add-event-btn" on:click={() => showNewEventForm = true}>+ Új Esemény Létrehozása</button>

      <!-- Event Statistics -->
      {#if eventStats}
        <div class="stats-section">
          <h3>Esemény Statisztikái</h3>
          <div class="stat-item">
            <span class="label">Összes Résztvevő:</span>
            <span class="value">{eventStats.totalParticipants}</span>
          </div>
          <div class="stat-item">
            <span class="label">Felismert Tagok:</span>
            <span class="value">{eventStats.recognizedCount}</span>
          </div>
          <div class="stat-item">
            <span class="label">Átl. Aktivitás:</span>
            <span class="value">{eventStats.averageActivityScore.toFixed(1)}</span>
          </div>
          <div class="stat-item">
            <span class="label">Felismerési Arány:</span>
            <span class="value">{(eventStats.participationRate * 100).toFixed(1)}%</span>
          </div>
          <button class="notify-btn" on:click={() => showNotificationForm = true}>🔔 Értesítés Küldése</button>
        </div>
      {/if}
    </div>

    <!-- Map -->
    <div class="map-section">
      <div class="map-container" bind:this={mapContainer}></div>
      <div class="map-legend">
        <div class="legend-item">
          <span class="dot" style="background-color: #fbbf24;"></span>
          <span>Kimagasló Aktivitás (80+)</span>
        </div>
        <div class="legend-item">
          <span class="dot" style="background-color: #8b5cf6;"></span>
          <span>Elkötelezett (60-79)</span>
        </div>
        <div class="legend-item">
          <span class="dot" style="background-color: #3b82f6;"></span>
          <span>Szabványos (&lt;60)</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Selected Event Details -->
  {#if selectedEvent}
    <div class="event-details-section {locallyCreatedEventIds.has(selectedEvent.id) ? 'active-event' : ''}">
      <div class="event-header">
        <h3>📍 {selectedEvent.location.name}</h3>
        {#if locallyCreatedEventIds.has(selectedEvent.id)}
          <span class="active-badge">🟢 Aktív Esemény</span>
        {/if}
      </div>
      <div class="event-details-grid">
        <div class="detail-item"><span class="label">Város:</span> <span class="value">{selectedEvent.city}</span></div>
        <div class="detail-item"><span class="label">Cím:</span> <span class="value">{selectedEvent.location.address || 'N/A'}</span></div>
        <div class="detail-item"><span class="label">Régió:</span> <span class="value region-badge {selectedEvent.region}">{REGION_LABELS[selectedEvent.region]}</span></div>
        <div class="detail-item"><span class="label">Szervező:</span> <span class="value">{selectedEvent.organizer || 'N/A'}</span></div>
        <div class="detail-item"><span class="label">Max. résztvevő:</span> <span class="value">{selectedEvent.maxParticipants || 'N/A'}</span></div>
        <div class="detail-item"><span class="label">GPS:</span> <span class="value">{selectedEvent.location.coordinates[0].toFixed(4)}, {selectedEvent.location.coordinates[1].toFixed(4)}</span></div>
      </div>
      {#if locallyCreatedEventIds.has(selectedEvent.id)}
        <button class="end-activity-btn" on:click={() => selectedEvent && endEventActivity(selectedEvent.id)}>
          ⏹️ Aktivitás Befejezése
        </button>
      {/if}
    </div>
  {/if}

  <!-- Participants List -->
  {#if filteredParticipants.length > 0}
    <div class="participants-section">
      <h3>Résztvevők ({filteredParticipants.length})</h3>
      <div class="participants-grid">
        {#each filteredParticipants.slice(0, 12) as participant (participant.id)}
          <div class="participant-card">
            <div class="activity-badge" style="background-color: {getActivityColor(participant.activityScore)};">
              {participant.activityScore}
            </div>
            <div class="participant-info">
              <div class="type">{participant.recognitionType}</div>
              <div class="time">{new Date(participant.joinedTime).toLocaleString('hu-HU', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}</div>
            </div>
          </div>
        {/each}
      </div>
      {#if filteredParticipants.length > 12}
        <p class="more-text">... és még {filteredParticipants.length - 12} résztvevő</p>
      {/if}
    </div>
  {/if}
  {/if}

  <!-- Famous Hungarians Tab -->
  {#if activeTab === 'famous'}
  <div class="famous-section">
    <div class="category-filter">
      <button class="cat-btn {selectedFamousCategory === 'all' ? 'active' : ''}" on:click={() => selectedFamousCategory = 'all'}>Mind</button>
      {#each Object.entries(FAMOUS_HUNGARIAN_CATEGORIES) as [key, cat]}
        <button class="cat-btn {selectedFamousCategory === key ? 'active' : ''}" on:click={() => selectedFamousCategory = key}>{cat.icon} {cat.name}</button>
      {/each}
    </div>
    <div class="famous-grid">
      {#each getFilteredFamousHungarians() as person (person.id)}
        <div class="famous-card">
          <div class="famous-header">
            <span class="famous-icon">{FAMOUS_HUNGARIAN_CATEGORIES[person.category].icon}</span>
            <h4>{person.name}</h4>
          </div>
          <p class="years">{person.birthYear} - {person.deathYear || 'él'}</p>
          <p class="description">{person.description}</p>
          <div class="achievements">
            {#each person.achievements.slice(0, 3) as achievement}
              <span class="achievement-tag">{achievement}</span>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
  {/if}

  <!-- Notifications Tab -->
  {#if activeTab === 'notifications'}
  <div class="notifications-section">
    <h3>Küldött Értesítések</h3>
    {#if notifications.length === 0}
      <p class="empty-text">Még nincs küldött értesítés.</p>
    {:else}
      <div class="notifications-list">
        {#each notifications as notif (notif.id)}
          <div class="notification-card">
            <div class="notif-header">
              <h4>{notif.title}</h4>
              <span class="audience-badge {notif.targetAudience}">{REGION_LABELS[notif.targetAudience]}</span>
            </div>
            <p class="notif-message">{notif.message}</p>
            <div class="notif-stats">
              <span>📤 {new Date(notif.sentAt).toLocaleDateString('hu-HU')}</span>
              <span>👁 {notif.readCount} / {notif.totalRecipients} olvasva</span>
              <span class="read-rate">{((notif.readCount / notif.totalRecipients) * 100).toFixed(0)}%</span>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
  {/if}

  <!-- New Event Modal -->
  {#if showNewEventForm}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div class="modal-overlay" on:click={() => showNewEventForm = false}>
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div class="modal" on:click|stopPropagation>
      <h3>Új Esemény Létrehozása</h3>
      <div class="form-group">
        <label for="city-select">Város</label>
        <select id="city-select" bind:value={newEvent.city}>
          <option value="">Válasszon várost...</option>
          <option value="Budapest">Budapest</option>
          <option value="Debrecen">Debrecen</option>
          <option value="Szeged">Szeged</option>
          <option value="Pécs">Pécs</option>
          <option value="Győr">Győr</option>
          <option value="Miskolc">Miskolc</option>
        </select>
      </div>
      <div class="form-group">
        <label for="location-name">Helyszín neve</label>
        <input id="location-name" type="text" bind:value={newEvent.locationName} placeholder="pl. Városháza téri ünnepség" />
      </div>
      <div class="form-group">
        <label for="address">Cím</label>
        <input id="address" type="text" bind:value={newEvent.address} placeholder="pl. Fő tér 1." />
      </div>
      <div class="form-group">
        <label for="region-select">Régió</label>
        <select id="region-select" bind:value={newEvent.region}>
          <option value="helyi">Helyi</option>
          <option value="megyei">Megyei</option>
          <option value="regionalis">Regionális</option>
          <option value="orszagos">Országos</option>
        </select>
      </div>
      <div class="form-group">
        <label for="organizer">Szervező</label>
        <input id="organizer" type="text" bind:value={newEvent.organizer} placeholder="Szervező neve" />
      </div>
      <div class="form-group">
        <label for="max-participants">Max. résztvevő</label>
        <input id="max-participants" type="number" bind:value={newEvent.maxParticipants} min="10" max="10000" />
      </div>
      <div class="modal-buttons">
        <button class="cancel-btn" on:click={() => showNewEventForm = false}>Mégse</button>
        <button class="save-btn" on:click={createEvent}>Létrehozás</button>
      </div>
    </div>
  </div>
  {/if}

  <!-- Notification Modal -->
  {#if showNotificationForm}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div class="modal-overlay" on:click={() => showNotificationForm = false}>
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div class="modal" on:click|stopPropagation>
      <h3>🔔 Értesítés Küldése</h3>
      <p class="modal-subtitle">Esemény: {selectedEvent?.location.name}</p>
      <div class="form-group">
        <label for="notif-title">Értesítés címe</label>
        <input id="notif-title" type="text" bind:value={newNotification.title} placeholder="pl. Közelgő rendezvény" />
      </div>
      <div class="form-group">
        <label for="notif-message">Üzenet</label>
        <textarea id="notif-message" bind:value={newNotification.message} rows="3" placeholder="Az értesítés szövege..."></textarea>
      </div>
      <div class="form-group">
        <label for="target-audience">Célközönség</label>
        <select id="target-audience" bind:value={newNotification.targetAudience}>
          <option value="helyi">Helyi tagok</option>
          <option value="megyei">Megyei tagok</option>
          <option value="regionalis">Regionális tagok</option>
          <option value="orszagos">Országos (mindenki)</option>
        </select>
      </div>
      <div class="modal-buttons">
        <button class="cancel-btn" on:click={() => showNotificationForm = false}>Mégse</button>
        <button class="save-btn" on:click={sendNotification}>Küldés</button>
      </div>
    </div>
  </div>
  {/if}
</div>

<style>
  /* Blinking marker animation */
  :global(.blinking-marker) {
    animation: blink 1s ease-in-out infinite;
  }
  
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  
  /* Pulsating circle animation */
  :global(.pulse-circle) {
    animation: pulse 2s ease-out infinite;
  }
  
  @keyframes pulse {
    0% {
      transform: scale(0.5);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.5);
      opacity: 0.3;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }

  .community-participation {
    padding: 16px;
    background: white;
    border-radius: 8px;
    height: 100%;
    overflow-y: auto;
  }

  .header {
    margin-bottom: 20px;
  }

  .header h2 {
    margin: 0 0 8px 0;
    font-size: 20px;
    color: #1f2937;
  }

  .header p {
    margin: 0;
    font-size: 14px;
    color: #6b7280;
  }

  .content-container {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }

  .left-panel {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .holidays-section,
  .cities-section,
  .stats-section {
    background: #f9fafb;
    border-radius: 6px;
    padding: 12px;
    border: 1px solid #e5e7eb;
  }

  .holidays-section h3,
  .cities-section h3,
  .stats-section h3 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
  }

  .holidays-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .holiday-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 12px 8px;
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 12px;
  }

  .holiday-btn:hover {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .holiday-btn.active {
    background: #3b82f6;
    border-color: #3b82f6;
    color: white;
  }

  .holiday-btn .icon {
    font-size: 24px;
  }

  .holiday-btn .name {
    font-weight: 600;
  }

  .holiday-btn .date {
    font-size: 11px;
    opacity: 0.7;
  }

  .cities-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .city-btn {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;
  }

  .city-btn:hover {
    background: #f3f4f6;
    border-color: #3b82f6;
  }

  .city-btn.active {
    background: #dbeafe;
    border-color: #3b82f6;
    font-weight: 600;
  }

  .city-name {
    font-weight: 500;
  }

  .event-count {
    font-size: 11px;
    color: #6b7280;
  }

  .clear-btn {
    width: 100%;
    margin-top: 8px;
    padding: 8px 12px;
    background: #fee2e2;
    border: 1px solid #fecaca;
    border-radius: 4px;
    color: #991b1b;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.2s;
  }

  .clear-btn:hover {
    background: #fca5a5;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #e5e7eb;
  }

  .stat-item:last-child {
    border-bottom: none;
  }

  .stat-item .label {
    font-size: 13px;
    color: #6b7280;
  }

  .stat-item .value {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
  }

  .map-section {
    position: relative;
    background: #f9fafb;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
    min-height: 500px;
  }

  .map-container {
    width: 100%;
    height: 100%;
    border-radius: 6px;
  }

  .map-legend {
    position: absolute;
    bottom: 12px;
    right: 12px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    padding: 8px 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    font-size: 12px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .legend-item:last-child {
    margin-bottom: 0;
  }

  .dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1px solid #333;
  }

  .participants-section {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
  }

  .participants-section h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
  }

  .participants-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
  }

  .participant-card {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
  }

  .activity-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: white;
    font-weight: 600;
    font-size: 12px;
    flex-shrink: 0;
  }

  .participant-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .participant-info .type {
    font-size: 11px;
    font-weight: 500;
    color: #374151;
    text-transform: capitalize;
  }

  .participant-info .time {
    font-size: 10px;
    color: #9ca3af;
  }

  .more-text {
    margin-top: 8px;
    font-size: 13px;
    color: #6b7280;
  }

  @media (max-width: 1200px) {
    .content-container {
      grid-template-columns: 1fr;
    }

    .map-section {
      min-height: 400px;
    }
  }

  /* Tabs */
  .tabs { display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
  .tab-btn { padding: 10px 16px; background: none; border: none; border-radius: 6px 6px 0 0; cursor: pointer; font-size: 14px; font-weight: 500; color: #6b7280; transition: all 0.2s; }
  .tab-btn:hover { background: #f3f4f6; color: #374151; }
  .tab-btn.active { background: #3b82f6; color: white; }

  /* Region Section */
  .region-section { background: #f9fafb; border-radius: 6px; padding: 12px; border: 1px solid #e5e7eb; }
  .region-section h3 { margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #374151; }
  .region-buttons { display: flex; flex-wrap: wrap; gap: 6px; }
  .region-btn { padding: 6px 12px; background: white; border: 1px solid #e5e7eb; border-radius: 4px; cursor: pointer; font-size: 12px; transition: all 0.2s; }
  .region-btn:hover { border-color: #3b82f6; }
  .region-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; }

  /* Add Event Button */
  .add-event-btn { width: 100%; padding: 12px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s; }
  .add-event-btn:hover { background: #059669; }

  /* Notify Button */
  .notify-btn { width: 100%; margin-top: 12px; padding: 10px; background: #f59e0b; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 500; }
  .notify-btn:hover { background: #d97706; }

  /* Event Details */
  .event-details-section { background: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 16px; margin-top: 16px; }
  .event-details-section h3 { margin: 0 0 12px 0; font-size: 16px; color: #166534; }
  .event-details-section.active-event { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 2px solid #10b981; animation: glow 2s ease-in-out infinite; }
  @keyframes glow { 0%, 100% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.3); } 50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.6); } }
  .event-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .event-header h3 { margin: 0; }
  .active-badge { background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; animation: pulse-badge 1.5s ease-in-out infinite; }
  @keyframes pulse-badge { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
  .end-activity-btn { margin-top: 16px; width: 100%; padding: 12px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s; }
  .end-activity-btn:hover { background: #dc2626; }
  .event-details-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
  .detail-item { display: flex; gap: 8px; font-size: 13px; }
  .detail-item .label { color: #6b7280; }
  .detail-item .value { font-weight: 500; color: #1f2937; }
  .region-badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; }
  .region-badge.helyi { background: #dbeafe; color: #1e40af; }
  .region-badge.megyei { background: #fef3c7; color: #92400e; }
  .region-badge.regionalis { background: #e0e7ff; color: #3730a3; }
  .region-badge.orszagos { background: #dcfce7; color: #166534; }

  /* Famous Section */
  .famous-section { padding: 16px 0; }
  .category-filter { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
  .cat-btn { padding: 8px 14px; background: white; border: 1px solid #e5e7eb; border-radius: 20px; cursor: pointer; font-size: 13px; transition: all 0.2s; }
  .cat-btn:hover { border-color: #3b82f6; }
  .cat-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; }
  .famous-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
  .famous-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; transition: all 0.2s; }
  .famous-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
  .famous-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .famous-icon { font-size: 24px; }
  .famous-header h4 { margin: 0; font-size: 16px; color: #1f2937; }
  .famous-card .years { margin: 0 0 8px 0; font-size: 13px; color: #6b7280; }
  .famous-card .description { margin: 0 0 12px 0; font-size: 13px; color: #374151; line-height: 1.4; }
  .achievements { display: flex; flex-wrap: wrap; gap: 6px; }
  .achievement-tag { padding: 3px 8px; background: #f3f4f6; border-radius: 4px; font-size: 11px; color: #4b5563; }

  /* Notifications Section */
  .notifications-section { padding: 16px 0; }
  .notifications-section h3 { margin: 0 0 16px 0; font-size: 18px; color: #1f2937; }
  .empty-text { color: #6b7280; font-size: 14px; }
  .notifications-list { display: flex; flex-direction: column; gap: 12px; }
  .notification-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
  .notif-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .notif-header h4 { margin: 0; font-size: 15px; color: #1f2937; }
  .audience-badge { padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; }
  .audience-badge.helyi { background: #dbeafe; color: #1e40af; }
  .audience-badge.megyei { background: #fef3c7; color: #92400e; }
  .audience-badge.regionalis { background: #e0e7ff; color: #3730a3; }
  .audience-badge.orszagos { background: #dcfce7; color: #166534; }
  .notif-message { margin: 0 0 12px 0; font-size: 13px; color: #4b5563; }
  .notif-stats { display: flex; gap: 16px; font-size: 12px; color: #6b7280; }
  .read-rate { font-weight: 600; color: #10b981; }

  /* Modal */
  .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
  .modal { background: white; border-radius: 12px; padding: 24px; width: 90%; max-width: 480px; max-height: 90vh; overflow-y: auto; }
  .modal h3 { margin: 0 0 16px 0; font-size: 18px; color: #1f2937; }
  .modal-subtitle { margin: -8px 0 16px 0; font-size: 13px; color: #6b7280; }
  .form-group { margin-bottom: 16px; }
  .form-group label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; color: #374151; }
  .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box; }
  .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .modal-buttons { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
  .cancel-btn { padding: 10px 20px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; font-size: 14px; }
  .cancel-btn:hover { background: #e5e7eb; }
  .save-btn { padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; }
  .save-btn:hover { background: #2563eb; }
</style>
