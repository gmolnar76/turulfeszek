<script lang="ts">
  import { onMount } from 'svelte';
  import { generateMockUserProfile, sortAchievementsByDate, getRecognitionTypeLabel, getRecognitionTypeColor } from '../data/userMockData';
  import type { UserProfile, UserAchievement } from '../types/user.types';

  interface Skill { id: number; name: string; category: string; level: 'kezdo' | 'halado' | 'mester' | 'oktato'; description: string; canTeach: boolean; availableForCamps: boolean; }

  const SKILL_CATEGORIES = [
    { id: 'kezmuves', name: 'Kézművesség', icon: '🎨' },
    { id: 'zene', name: 'Zene', icon: '🎵' },
    { id: 'sport', name: 'Sport', icon: '⚽' },
    { id: 'termeszet', name: 'Természet', icon: '🌿' },
    { id: 'tech', name: 'Technológia', icon: '💻' },
    { id: 'egyeb', name: 'Egyéb', icon: '✨' }
  ];

  const SKILL_LEVELS = [
    { id: 'kezdo', name: 'Kezdő', color: '#10B981', desc: 'Alapismeretek' },
    { id: 'halado', name: 'Haladó', color: '#3B82F6', desc: 'Gyakorlott' },
    { id: 'mester', name: 'Mester', color: '#8B5CF6', desc: 'Szakértő' },
    { id: 'oktato', name: 'Oktatói', color: '#F59E0B', desc: 'Képzett oktató' }
  ];

  let userProfile: UserProfile | null = null;
  let sortedAchievements: UserAchievement[] = [];
  let didCopied = false;

  let skills: Skill[] = [
    { id: 1, name: 'Fafaragás', category: 'kezmuves', level: 'mester', description: 'Magyar motívumok', canTeach: true, availableForCamps: true },
    { id: 2, name: 'Gitár', category: 'zene', level: 'halado', description: 'Népzene', canTeach: false, availableForCamps: true },
    { id: 3, name: 'Íjászat', category: 'sport', level: 'oktato', description: 'Lovas íjászat', canTeach: true, availableForCamps: true },
    { id: 4, name: 'Hangszerkészítés', category: 'kezmuves', level: 'mester', description: 'Népi hangszerek', canTeach: true, availableForCamps: false }
  ];

  let showSkillForm = false;
  let newSkill = { name: '', category: 'kezmuves', level: 'kezdo' as const, description: '', canTeach: false, availableForCamps: false };

  function addSkill() {
    if (newSkill.name) {
      skills = [...skills, { id: Date.now(), ...newSkill }];
      newSkill = { name: '', category: 'kezmuves', level: 'kezdo', description: '', canTeach: false, availableForCamps: false };
      showSkillForm = false;
    }
  }

  function deleteSkill(id: number) { skills = skills.filter(s => s.id !== id); }
  function getLevelData(id: string) { return SKILL_LEVELS.find(l => l.id === id) || SKILL_LEVELS[0]; }
  function getCategoryData(id: string) { return SKILL_CATEGORIES.find(c => c.id === id) || SKILL_CATEGORIES[5]; }

  onMount(() => {
    userProfile = generateMockUserProfile();
    sortedAchievements = sortAchievementsByDate(userProfile?.achievements || []);
  });

  function copyDID() {
    if (userProfile?.did) {
      navigator.clipboard.writeText(userProfile.did);
      didCopied = true;
      setTimeout(() => {
        didCopied = false;
      }, 2000);
    }
  }

  function getAchievementEmoji(holidayId: string): string {
    const emojiMap: Record<string, string> = {
      march15: '🎖️',
      istvan: '👑',
      october23: '🇭🇺',
    };
    return emojiMap[holidayId] || '🏆';
  }

  function getHolidayName(holidayId: string): string {
    const nameMap: Record<string, string> = {
      march15: 'Március 15.',
      istvan: 'Szent István Nap',
      october23: 'Október 23.',
    };
    return nameMap[holidayId] || 'Nemzeti Ünnep';
  }

  function getMonthYear(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long' });
  }
</script>

{#if userProfile}
  <div class="user-profile">
    <div class="header">
      <h2>👤 Felhasználó Profil</h2>
      <p>Közösségi tevékenységek, érdemek és blockchain azonosítás</p>
    </div>

    <!-- Profile Card -->
    <div class="profile-card">
      <div class="avatar-section">
        <div class="avatar">{userProfile.avatar}</div>
        <div class="user-info">
          <h3>{userProfile.name}</h3>
          <p class="join-date">Csatlakozás: {new Date(userProfile.joinDate).toLocaleDateString('hu-HU')}</p>
          <p class="bio">{userProfile.bio}</p>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat">
          <div class="value">{userProfile.totalPoints}</div>
          <div class="label">Össz. Pont</div>
        </div>
        <div class="stat">
          <div class="value">{userProfile.achievements.length}</div>
          <div class="label">Érdemek</div>
        </div>
        <div class="stat">
          <div class="value">{userProfile.badges.length}</div>
          <div class="label">Kitüntetések</div>
        </div>
      </div>
    </div>

    <!-- DID Section -->
    <div class="did-section">
      <h3>🔐 Blockchain Azonosítás (DID)</h3>
      <div class="did-container">
        <div class="did-label">Decentralized Identifier (Elliptic Curve)</div>
        <div class="did-value">
          <code>{userProfile.did}</code>
          <button class="copy-btn" on:click={copyDID} title="Másolás vágólapra">
            {didCopied ? '✓ Másolva' : '📋 Másolás'}
          </button>
        </div>
        <div class="did-note">
          Ez az azonosító önmagát irányított, blockchain alapú identitás. Képviseleti felhasználói adatok nélkül működik, megőrizve az adatvédelmet.
        </div>
      </div>
    </div>

    <!-- Badges Section -->
    {#if userProfile.badges.length > 0}
      <div class="badges-section">
        <h3>🏅 Kitüntetések és Jelvények</h3>
        <div class="badges-grid">
          {#each userProfile.badges as badge (badge.id)}
            <div class="badge-card" title={badge.description}>
              <div class="badge-icon">{badge.icon}</div>
              <div class="badge-name">{badge.name}</div>
              <div class="badge-date">{new Date(badge.acquiredDate).toLocaleDateString('hu-HU')}</div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Achievements Section -->
    {#if sortedAchievements.length > 0}
      <div class="achievements-section">
        <h3>🎯 Közösségi Érdemek és Felismerések</h3>
        <div class="achievements-list">
          {#each sortedAchievements as achievement (achievement.id)}
            <div class="achievement-item">
              <div class="achievement-header">
                <span class="holiday-emoji">{getAchievementEmoji(achievement.holidayId)}</span>
                <div class="achievement-meta">
                  <div class="achievement-title">
                    <span class="city">{achievement.city}</span>
                    <span class="date">{new Date(achievement.date).toLocaleDateString('hu-HU')}</span>
                  </div>
                  <div class="recognition-badge" style="background-color: {getRecognitionTypeColor(achievement.recognitionType)};">
                    {getRecognitionTypeLabel(achievement.recognitionType)}
                  </div>
                </div>
              </div>
              <div class="activity-bar">
                <div class="activity-fill" style="width: {achievement.activityScore}%; background-color: {getRecognitionTypeColor(achievement.recognitionType)};"></div>
              </div>
              <div class="achievement-stats">
                <span class="score">Aktivitás: <strong>{achievement.activityScore}</strong></span>
                <span class="points">Pont: <strong>{achievement.points}</strong></span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Skills Section -->
    <div class="skills-section">
      <div class="skills-header">
        <h3>🛠️ Képességek és Tudásmegosztás</h3>
        <button class="add-skill-btn" on:click={() => showSkillForm = !showSkillForm}>
          {showSkillForm ? '✕ Mégse' : '+ Képesség'}
        </button>
      </div>
      <p class="skills-intro">Add meg képességeidet, amiket a közösség javára felajánlhatsz.</p>

      {#if showSkillForm}
        <div class="skill-form">
          <input type="text" placeholder="Képesség neve" bind:value={newSkill.name} />
          <select bind:value={newSkill.category}>
            {#each SKILL_CATEGORIES as cat}<option value={cat.id}>{cat.icon} {cat.name}</option>{/each}
          </select>
          <select bind:value={newSkill.level}>
            {#each SKILL_LEVELS as lvl}<option value={lvl.id}>{lvl.name}</option>{/each}
          </select>
          <input type="text" placeholder="Rövid leírás" bind:value={newSkill.description} />
          <div class="skill-checks">
            <label><input type="checkbox" bind:checked={newSkill.canTeach}/> Oktatható</label>
            <label><input type="checkbox" bind:checked={newSkill.availableForCamps}/> Táborban</label>
          </div>
          <button class="submit-skill" on:click={addSkill}>Mentés</button>
        </div>
      {/if}

      <div class="skills-grid">
        {#each skills as skill}
          <div class="skill-card">
            <div class="skill-top">
              <span class="skill-icon">{getCategoryData(skill.category).icon}</span>
              <h4>{skill.name}</h4>
              <button class="del-btn" on:click={() => deleteSkill(skill.id)}>🗑️</button>
            </div>
            <p>{skill.description}</p>
            <span class="skill-level" style="background:{getLevelData(skill.level).color}">{getLevelData(skill.level).name}</span>
            <div class="skill-badges">
              {#if skill.canTeach}<span class="badge teach">👨‍🏫 Oktat</span>{/if}
              {#if skill.availableForCamps}<span class="badge camp">🏕️ Tábor</span>{/if}
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Activity Summary -->
    <div class="summary-section">
      <h3>📊 Tevékenység Összefoglalása</h3>
      <div class="summary-stats">
        <div class="summary-row">
          <span class="label">Átl. Aktivitási Pontszám:</span>
          <span class="value">
            {(userProfile.achievements.reduce((sum, a) => sum + a.activityScore, 0) / (userProfile.achievements.length || 1)).toFixed(1)}
          </span>
        </div>
        <div class="summary-row">
          <span class="label">Kimagasló Érdemek:</span>
          <span class="value">{userProfile.achievements.filter(a => a.recognitionType === 'outstanding').length}</span>
        </div>
        <div class="summary-row">
          <span class="label">Elkötelezett Érdemek:</span>
          <span class="value">{userProfile.achievements.filter(a => a.recognitionType === 'dedicated').length}</span>
        </div>
        <div class="summary-row">
          <span class="label">Utolsó Aktivitás:</span>
          <span class="value">
            {#if sortedAchievements.length > 0}
              {getMonthYear(sortedAchievements[0].date)}
            {:else}
              Nincs
            {/if}
          </span>
        </div>
      </div>
    </div>
  </div>
{:else}
  <div class="loading">Profil betöltése...</div>
{/if}

<style>
  .user-profile {
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

  .profile-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px;
    padding: 24px;
    color: white;
    margin-bottom: 24px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .avatar-section {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
  }

  .avatar {
    font-size: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 100px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    flex-shrink: 0;
  }

  .user-info h3 {
    margin: 0 0 8px 0;
    font-size: 22px;
    font-weight: 600;
  }

  .join-date {
    margin: 0 0 8px 0;
    font-size: 13px;
    opacity: 0.9;
  }

  .bio {
    margin: 0;
    font-size: 13px;
    opacity: 0.85;
    line-height: 1.4;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.3);
  }

  .stat {
    text-align: center;
  }

  .stat .value {
    font-size: 28px;
    font-weight: 700;
  }

  .stat .label {
    font-size: 12px;
    opacity: 0.8;
    margin-top: 4px;
  }

  .did-section {
    background: #f0f4ff;
    border: 1px solid #e0e7ff;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 24px;
  }

  .did-section h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
  }

  .did-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .did-label {
    font-size: 12px;
    color: #6b7280;
    font-weight: 500;
  }

  .did-value {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .did-value code {
    flex: 1;
    background: white;
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    font-size: 11px;
    font-family: 'Monaco', 'Courier New', monospace;
    color: #374151;
    overflow-x: auto;
    white-space: nowrap;
  }

  .copy-btn {
    padding: 8px 12px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .copy-btn:hover {
    background: #5568d3;
  }

  .did-note {
    font-size: 12px;
    color: #6b7280;
    background: white;
    padding: 8px;
    border-radius: 4px;
    line-height: 1.4;
  }

  .badges-section {
    margin-bottom: 24px;
  }

  .badges-section h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
  }

  .badges-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  .badge-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 12px;
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    border-radius: 8px;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .badge-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .badge-icon {
    font-size: 32px;
    margin-bottom: 4px;
  }

  .badge-name {
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .badge-date {
    font-size: 10px;
    opacity: 0.9;
  }

  .achievements-section {
    margin-bottom: 24px;
  }

  .achievements-section h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
  }

  .achievements-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .achievement-item {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 12px;
    transition: all 0.2s;
  }

  .achievement-item:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
  }

  .achievement-header {
    display: flex;
    gap: 12px;
    margin-bottom: 8px;
  }

  .holiday-emoji {
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: white;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .achievement-meta {
    flex: 1;
  }

  .achievement-title {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 4px;
  }

  .city {
    font-weight: 600;
    color: #1f2937;
    font-size: 14px;
  }

  .date {
    font-size: 12px;
    color: #6b7280;
  }

  .recognition-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    color: white;
    font-size: 11px;
    font-weight: 600;
    text-transform: capitalize;
  }

  .activity-bar {
    height: 6px;
    background: #e5e7eb;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .activity-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .achievement-stats {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #6b7280;
  }

  .summary-section {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 8px;
    padding: 16px;
    margin-top: 24px;
  }

  .summary-section h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
  }

  .summary-stats {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #bbf7d0;
  }

  .summary-row:last-child {
    border-bottom: none;
  }

  .summary-row .label {
    font-size: 13px;
    color: #374151;
  }

  .summary-row .value {
    font-size: 14px;
    font-weight: 600;
    color: #16a34a;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #6b7280;
  }

  .skills-section { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
  .skills-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .skills-header h3 { margin: 0; font-size: 16px; font-weight: 600; color: #1f2937; }
  .add-skill-btn { padding: 6px 12px; background: #f59e0b; color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer; }
  .add-skill-btn:hover { background: #d97706; }
  .skills-intro { margin: 0 0 12px; font-size: 12px; color: #92400e; }
  .skill-form { background: white; border-radius: 6px; padding: 12px; margin-bottom: 12px; display: grid; gap: 8px; }
  .skill-form input, .skill-form select { padding: 8px; border: 1px solid #e5e7eb; border-radius: 4px; font-size: 13px; }
  .skill-checks { display: flex; gap: 16px; font-size: 12px; }
  .skill-checks label { display: flex; align-items: center; gap: 4px; }
  .submit-skill { padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; }
  .skills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px; }
  .skill-card { background: white; border-radius: 6px; padding: 10px; border: 1px solid #fcd34d; }
  .skill-top { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
  .skill-icon { font-size: 18px; }
  .skill-top h4 { flex: 1; margin: 0; font-size: 13px; color: #1f2937; }
  .del-btn { background: none; border: none; cursor: pointer; opacity: 0.5; font-size: 12px; }
  .del-btn:hover { opacity: 1; }
  .skill-card p { margin: 0 0 6px; font-size: 11px; color: #6b7280; }
  .skill-level { display: inline-block; padding: 2px 6px; border-radius: 3px; color: white; font-size: 10px; font-weight: 600; }
  .skill-badges { display: flex; gap: 4px; margin-top: 6px; }
  .badge { font-size: 9px; padding: 2px 5px; border-radius: 3px; }
  .badge.teach { background: #dbeafe; color: #1e40af; }
  .badge.camp { background: #dcfce7; color: #166534; }

  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .badges-grid {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    }
  }
</style>
