<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    select: { name: string; category: string };
  }>();

  // Props
  export let birthYear: number | null = null;
  export let gender: 'male' | 'female' | 'neutral' = 'neutral';

  // Névkategóriák
  type NameCategory = 'hungarian' | 'hun' | 'scythian' | 'fantasy';

  let selectedCategory: NameCategory = 'hungarian';
  let generatedNames: string[] = [];
  let selectedName = '';
  let customName = '';

  // Magyar nevek (hagyományos)
  const HUNGARIAN_NAMES = {
    male: [
      'Álmos', 'Árpád', 'Attila', 'Béla', 'Botond', 'Csaba', 'Előd', 'Géza', 
      'Gyula', 'Huba', 'Koppány', 'Lehel', 'Levente', 'Tas', 'Töhötöm', 'Vajk',
      'Zoltán', 'Zsolt', 'Bence', 'Bendegúz', 'Bulcsú', 'Csanád', 'Elemér',
      'Farkas', 'Hunor', 'Jenő', 'Kende', 'Magor', 'Ond', 'Szabolcs', 'Tétény'
    ],
    female: [
      'Emese', 'Etelka', 'Gyöngyvér', 'Hajnalka', 'Ildikó', 'Jolán', 'Kinga',
      'Piroska', 'Réka', 'Sarolt', 'Tünde', 'Virág', 'Zelma', 'Csenge', 'Dalma',
      'Emőke', 'Enéh', 'Enikő', 'Fruzsina', 'Ibolya', 'Kamilla', 'Lilla',
      'Napfény', 'Orsolya', 'Panna', 'Szellő', 'Tímea', 'Villő', 'Zselyke'
    ],
    neutral: [
      'Hanga', 'Kende', 'Napraforgó', 'Csillag', 'Szellő', 'Patak', 'Erdő',
      'Tűz', 'Vihar', 'Hajnal', 'Alkony', 'Sólyom', 'Turul', 'Mennydörgés'
    ]
  };

  // HUN kori nevek (történelmi)
  const HUN_NAMES = {
    male: [
      'Attila', 'Buda', 'Bleda', 'Ellák', 'Dengizik', 'Ernak', 'Mundzuk',
      'Ruga', 'Oktar', 'Uldin', 'Charaton', 'Balamber', 'Kursich', 'Basich',
      'Uldinus', 'Scottas', 'Onegesius', 'Edikon', 'Orestes', 'Eskam'
    ],
    female: [
      'Arékán', 'Ildikó', 'Kréka', 'Eskam', 'Herkja', 'Gudrun', 'Sváva',
      'Grimhild', 'Oddrun', 'Bekkhild', 'Brynhild', 'Sigrun', 'Skuld'
    ],
    neutral: [
      'Turán', 'Turul', 'Napisten', 'Hadúr', 'Ármány', 'Égi', 'Villám'
    ]
  };

  // Szkíta / szittya nevek
  const SCYTHIAN_NAMES = {
    male: [
      'Targitaosz', 'Kolaxaisz', 'Lipoxaisz', 'Arpoxaisz', 'Idanthürszosz',
      'Szkülész', 'Ariapeithész', 'Oktamaszadész', 'Ariántasz', 'Szpargapeithész',
      'Taxakisz', 'Szkunxa', 'Madüész', 'Protothüész', 'Szaulosz', 'Papar'
    ],
    female: [
      'Tabiti', 'Api', 'Artimpasza', 'Papaiosz', 'Oitoszürosz', 'Thamimarasz',
      'Szágara', 'Tomürísz', 'Zarina', 'Amage', 'Szparetha', 'Tirgatao'
    ],
    neutral: [
      'Akinak', 'Gorytos', 'Enarei', 'Arima', 'Saka', 'Pard', 'Kurgán'
    ]
  };

  // Fantasy nevek (kitalált)
  const FANTASY_NAMES = {
    male: [
      'Tűzszárny', 'Viharlovag', 'Sárkányvér', 'Vasököl', 'Farkasszem',
      'Villámkard', 'Holdsugár', 'Naptűz', 'Árnyékvadász', 'Szélvész',
      'Jégszív', 'Lánglélek', 'Kőszikla', 'Sasszem', 'Medveerő',
      'Csillagfény', 'Éjvándor', 'Hajnalcsillag', 'Viharszem', 'Tűzlélek'
    ],
    female: [
      'Holdfény', 'Csillagszem', 'Hajnalpír', 'Virágszirmok', 'Ezüstpatak',
      'Aranyhaj', 'Kristályköny', 'Rózsaharmat', 'Napvirág', 'Szivárványszárny',
      'Tündérfény', 'Gyöngykönny', 'Napsugár', 'Lótuszvirág', 'Holdtánc',
      'Tavaszszellő', 'Őszilomb', 'Téltündér', 'Nyárfény', 'Örökvirág'
    ],
    neutral: [
      'Végtelen', 'Örökmozgó', 'Időtlen', 'Ködfátyol', 'Árnyék', 'Rúna',
      'Mitosz', 'Legenda', 'Titok', 'Varázs', 'Ősi', 'Halhatatlan', 'Ébredő'
    ]
  };

  // Vezetéknevek (minden kategóriához)
  const SURNAMES = {
    hungarian: ['Tölgyesi', 'Pusztai', 'Halasi', 'Szilágyi', 'Bátori', 'Nádasi', 
                'Árpási', 'Vereckei', 'Badacsonyi', 'Tisza', 'Duna', 'Balaton'],
    hun: ['Attilafi', 'Hunfi', 'Turulfi', 'Hadúrfi', 'Napfi', 'Égi', 'Szkíta'],
    scythian: ['Szaka', 'Pard', 'Tarkan', 'Kurgán', 'Ariosz', 'Roxolán'],
    fantasy: ['Sárkányszív', 'Őrző', 'Hagyomány', 'Örökség', 'Fényhozó', 'Árnyvadász']
  };

  // Név generálás
  function generateNames() {
    const names = getNamesByCategory();
    const genderNames = names[gender] || names.neutral;
    const surnames = SURNAMES[selectedCategory];
    
    // Keverés és kiválasztás
    const shuffledNames = [...genderNames].sort(() => Math.random() - 0.5);
    const shuffledSurnames = [...surnames].sort(() => Math.random() - 0.5);
    
    generatedNames = [];
    
    for (let i = 0; i < 6; i++) {
      const firstName = shuffledNames[i % shuffledNames.length];
      const surname = shuffledSurnames[i % shuffledSurnames.length];
      
      // Születési év hozzáadása ha meg van adva
      if (birthYear) {
        const yearSuffix = birthYear.toString().slice(-2);
        generatedNames.push(`${surname} ${firstName}${yearSuffix}`);
      } else {
        generatedNames.push(`${surname} ${firstName}`);
      }
    }
  }

  function getNamesByCategory() {
    switch (selectedCategory) {
      case 'hungarian': return HUNGARIAN_NAMES;
      case 'hun': return HUN_NAMES;
      case 'scythian': return SCYTHIAN_NAMES;
      case 'fantasy': return FANTASY_NAMES;
      default: return HUNGARIAN_NAMES;
    }
  }

  function getCategoryLabel(cat: NameCategory): string {
    switch (cat) {
      case 'hungarian': return '🇭🇺 Magyar';
      case 'hun': return '⚔️ HUN kori';
      case 'scythian': return '🏹 Szkíta/Szittya';
      case 'fantasy': return '✨ Fantasy';
      default: return '';
    }
  }

  function getCategoryDescription(cat: NameCategory): string {
    switch (cat) {
      case 'hungarian': return 'Hagyományos magyar ősi nevek';
      case 'hun': return 'Hun birodalom kori történelmi nevek';
      case 'scythian': return 'Ősi szkíta/szittya harcos nevek';
      case 'fantasy': return 'Kitalált, misztikus fantasy nevek';
      default: return '';
    }
  }

  function selectName(name: string) {
    selectedName = name;
    customName = '';
  }

  function confirmSelection() {
    const finalName = customName.trim() || selectedName;
    if (finalName) {
      dispatch('select', { 
        name: finalName, 
        category: customName.trim() ? 'custom' : selectedCategory 
      });
    }
  }

  function generateEmailSuggestion(name: string): string {
    // Ékezetek eltávolítása és kisbetűsítés
    const normalized = name
      .toLowerCase()
      .replace(/á/g, 'a')
      .replace(/é/g, 'e')
      .replace(/í/g, 'i')
      .replace(/ó|ö|ő/g, 'o')
      .replace(/ú|ü|ű/g, 'u')
      .replace(/\s+/g, '.')
      .replace(/[^a-z0-9.]/g, '');
    
    return `${normalized}@fantazia.hu`;
  }

  // Kezdeti generálás
  $: if (selectedCategory) {
    generateNames();
  }
</script>

<div class="name-generator">
  <div class="header">
    <h3>✨ Fantázianév Generátor</h3>
    <p class="subtitle">Válassz egyedi nevet a közösségi azonosításhoz!</p>
    <p class="privacy-note">🔒 A személyes adataid védelmében fantázianeveket használunk</p>
  </div>

  <!-- Opciók -->
  <div class="options">
    <div class="option-group">
      <span id="gender-label">Nem:</span>
      <div class="gender-buttons" role="group" aria-labelledby="gender-label">
        <button 
          class:selected={gender === 'male'} 
          on:click={() => gender = 'male'}
        >
          👨 Férfi
        </button>
        <button 
          class:selected={gender === 'female'} 
          on:click={() => gender = 'female'}
        >
          👩 Női
        </button>
        <button 
          class:selected={gender === 'neutral'} 
          on:click={() => gender = 'neutral'}
        >
          ⚪ Semleges
        </button>
      </div>
    </div>

    <div class="option-group">
      <label for="birth-year-input">Születési év (ajánlott):</label>
      <input 
        id="birth-year-input"
        type="number" 
        bind:value={birthYear}
        placeholder="pl. 1990"
        min="1920"
        max={new Date().getFullYear()}
      />
      <span class="hint">A névben megjelenik (pl. Árpási Levente90)</span>
    </div>
  </div>

  <!-- Kategória választó -->
  <div class="category-selector">
    <span id="style-label">Névstílus:</span>
    <div class="categories" role="group" aria-labelledby="style-label">
      <button
        class="category-btn"
        class:selected={selectedCategory === 'hungarian'}
        on:click={() => selectedCategory = 'hungarian'}
      >
        <span class="cat-label">🇭🇺 Magyar</span>
        <span class="cat-desc">Hagyományos magyar ősi nevek</span>
      </button>
      <button
        class="category-btn"
        class:selected={selectedCategory === 'hun'}
        on:click={() => selectedCategory = 'hun'}
      >
        <span class="cat-label">⚔️ HUN kori</span>
        <span class="cat-desc">Hun birodalom kori történelmi nevek</span>
      </button>
      <button
        class="category-btn"
        class:selected={selectedCategory === 'scythian'}
        on:click={() => selectedCategory = 'scythian'}
      >
        <span class="cat-label">🏹 Szkíta/Szittya</span>
        <span class="cat-desc">Ősi szkíta/szittya harcos nevek</span>
      </button>
      <button
        class="category-btn"
        class:selected={selectedCategory === 'fantasy'}
        on:click={() => selectedCategory = 'fantasy'}
      >
        <span class="cat-label">✨ Fantasy</span>
        <span class="cat-desc">Kitalált, misztikus fantasy nevek</span>
      </button>
    </div>
  </div>

  <!-- Generált nevek -->
  <div class="generated-names">
    <div class="names-header">
      <h4>Javasolt nevek:</h4>
      <button class="refresh-btn" on:click={generateNames}>
        🔄 Új nevek
      </button>
    </div>
    
    <div class="names-grid">
      {#each generatedNames as name}
        <button
          class="name-option"
          class:selected={selectedName === name}
          on:click={() => selectName(name)}
        >
          <span class="name-text">{name}</span>
          <span class="email-preview">{generateEmailSuggestion(name)}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Egyéni név -->
  <div class="custom-name">
    <label for="custom-name-input">Vagy adj meg saját fantázianevet:</label>
    <input
      id="custom-name-input"
      type="text"
      bind:value={customName}
      placeholder="pl. Turulmadár Bendegúz"
      on:input={() => selectedName = ''}
    />
    {#if customName.trim()}
      <span class="email-preview">📧 {generateEmailSuggestion(customName)}</span>
    {/if}
  </div>

  <!-- Kiválasztott név -->
  {#if selectedName || customName.trim()}
    <div class="selection-preview">
      <div class="preview-content">
        <span class="preview-label">Kiválasztott név:</span>
        <span class="preview-name">{customName.trim() || selectedName}</span>
        <span class="preview-email">
          📧 Ajánlott e-mail: {generateEmailSuggestion(customName.trim() || selectedName)}
        </span>
      </div>
      <button class="confirm-btn" on:click={confirmSelection}>
        ✅ Név kiválasztása
      </button>
    </div>
  {/if}

  <!-- Tippek -->
  <div class="tips">
    <h4>💡 Tippek a névválasztáshoz:</h4>
    <ul>
      <li>A fantázianévvel létrehozott e-mail címmel regisztrálj (pl. Gmail alias)</li>
      <li>A baráti körödben úgyis tudni fogják, ki vagy valójában</li>
      <li>A születési év segít megkülönböztetni az azonos nevűeket</li>
      <li>Válassz olyan nevet, ami tetszik és könnyen megjegyezhető</li>
    </ul>
  </div>
</div>

<style>
  .name-generator {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 16px;
    padding: 24px;
    color: #e4e4e7;
  }

  .header {
    text-align: center;
    margin-bottom: 24px;
  }

  .header h3 {
    color: #fff;
    margin: 0 0 8px 0;
    font-size: 1.4rem;
  }

  .subtitle {
    color: #a1a1aa;
    margin: 0 0 8px 0;
  }

  .privacy-note {
    color: #10b981;
    font-size: 0.85rem;
    margin: 0;
    padding: 8px 16px;
    background: rgba(16, 185, 129, 0.1);
    border-radius: 8px;
    display: inline-block;
  }

  /* Options */
  .options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
  }

  .option-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .option-group > label {
    color: #d4d4d8;
    font-size: 0.9rem;
  }

  .gender-buttons {
    display: flex;
    gap: 8px;
  }

  .gender-buttons button {
    flex: 1;
    padding: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    color: #a1a1aa;
    cursor: pointer;
    transition: all 0.2s;
  }

  .gender-buttons button:hover {
    border-color: rgba(255, 255, 255, 0.3);
    color: #fff;
  }

  .gender-buttons button.selected {
    border-color: #3b82f6;
    background: rgba(59, 130, 246, 0.2);
    color: #fff;
  }

  .option-group input {
    padding: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
    font-size: 1rem;
  }

  .option-group input:focus {
    outline: none;
    border-color: #3b82f6;
  }

  .hint {
    font-size: 0.75rem;
    color: #71717a;
  }

  /* Category selector */
  .category-selector {
    margin-bottom: 24px;
  }

  #style-label, #gender-label {
    display: block;
    margin-bottom: 12px;
    color: #d4d4d8;
  }

  .categories {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }

  .category-btn {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    background: transparent;
    color: #a1a1aa;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }

  .category-btn:hover {
    border-color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.05);
  }

  .category-btn.selected {
    border-color: #f59e0b;
    background: rgba(245, 158, 11, 0.1);
    color: #fff;
  }

  .cat-label {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .cat-desc {
    font-size: 0.8rem;
    color: #71717a;
  }

  .category-btn.selected .cat-desc {
    color: #a1a1aa;
  }

  /* Generated names */
  .generated-names {
    margin-bottom: 24px;
  }

  .names-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .names-header h4 {
    margin: 0;
    color: #fff;
  }

  .refresh-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    cursor: pointer;
    transition: all 0.2s;
  }

  .refresh-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .names-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
  }

  .name-option {
    display: flex;
    flex-direction: column;
    padding: 16px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    background: transparent;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }

  .name-option:hover {
    border-color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.05);
  }

  .name-option.selected {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.1);
  }

  .name-text {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .email-preview {
    font-size: 0.75rem;
    color: #71717a;
  }

  .name-option.selected .email-preview {
    color: #10b981;
  }

  /* Custom name */
  .custom-name {
    margin-bottom: 24px;
  }

  .custom-name label {
    display: block;
    margin-bottom: 8px;
    color: #d4d4d8;
  }

  .custom-name input {
    width: 100%;
    padding: 14px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
    font-size: 1rem;
    margin-bottom: 8px;
  }

  .custom-name input:focus {
    outline: none;
    border-color: #3b82f6;
  }

  .custom-name .email-preview {
    display: block;
    color: #10b981;
  }

  /* Selection preview */
  .selection-preview {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid #10b981;
    border-radius: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .preview-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .preview-label {
    font-size: 0.85rem;
    color: #a1a1aa;
  }

  .preview-name {
    font-size: 1.3rem;
    font-weight: bold;
    color: #fff;
  }

  .preview-email {
    font-size: 0.9rem;
    color: #10b981;
  }

  .confirm-btn {
    padding: 14px 28px;
    border: none;
    border-radius: 8px;
    background: #10b981;
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .confirm-btn:hover {
    background: #059669;
  }

  /* Tips */
  .tips {
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 12px;
    padding: 16px;
  }

  .tips h4 {
    margin: 0 0 12px 0;
    color: #f59e0b;
  }

  .tips ul {
    margin: 0;
    padding-left: 20px;
  }

  .tips li {
    color: #a1a1aa;
    margin-bottom: 6px;
    font-size: 0.9rem;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .selection-preview {
      flex-direction: column;
      text-align: center;
    }

    .preview-content {
      align-items: center;
    }

    .confirm-btn {
      width: 100%;
    }
  }
</style>
