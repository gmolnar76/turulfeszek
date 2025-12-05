<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as echarts from 'echarts';

  interface Idea { id: number; title: string; description: string; addedBy: string; addedDate: string; subcategory?: string; }
  interface Book { id: number; title: string; author: string; excerpt: string; addedBy: string; addedDate: string; }
  interface UserWriting { id: number; title: string; content: string; author: string; date: string; }
  interface CampSite { id: number; name: string; county: string; description: string; imageUrl: string; capacity: number; addedBy: string; }
  interface IdeaCategory { id: string; name: string; icon: string; color: string; count: number; description: string; }

  const COUNTIES = ['Budapest', 'Bács-Kiskun', 'Baranya', 'Békés', 'Borsod-Abaúj-Zemplén', 'Csongrád-Csanád', 'Fejér', 'Győr-Moson-Sopron', 'Hajdú-Bihar', 'Heves', 'Jász-Nagykun-Szolnok', 'Komárom-Esztergom', 'Nógrád', 'Pest', 'Somogy', 'Szabolcs-Szatmár-Bereg', 'Tolna', 'Vas', 'Veszprém', 'Zala'];
  const SCIENCE_SUBCATEGORIES = [{ id: 'minfjart', name: 'Minfjárt', icon: '🔧' }, { id: 'robottechnika', name: 'Robottechnika', icon: '🤖' }, { id: 'elektronika', name: 'Elektronika', icon: '⚡' }, { id: 'programozas', name: 'Programozás', icon: '💻' }, { id: 'energia', name: 'Energiaátalakítók', icon: '🔋' }, { id: 'magneses', name: 'Mágneses játékok', icon: '🧲' }, { id: 'radiotechnika', name: 'Rádiótechnika', icon: '📻' }];
  const WORKSHOP_TYPES = [{ id: 'fazekas', name: 'Fazekasműhely', icon: '🏺' }, { id: 'kovacs', name: 'Kovácsműhely', icon: '⚒️' }, { id: 'fem', name: 'Fémmegmunkálás', icon: '🔩' }, { id: 'bor', name: 'Bőrműves', icon: '👜' }, { id: 'szovo', name: 'Szövőműhely', icon: '🧵' }];

  const categories: IdeaCategory[] = [
    { id: 'kultura', name: 'Kultúra', icon: '🎭', color: '#8B5CF6', count: 45, description: 'Zenekarok, színjátszó csoportok szervezése' },
    { id: 'videok', name: 'Ajánlott Videók', icon: '🎬', color: '#EC4899', count: 78, description: 'Oktató és ismeretterjesztő videók' },
    { id: 'tudomany', name: 'Tudomány', icon: '🔬', color: '#10B981', count: 32, description: 'Robottechnika, elektronika, programozás' },
    { id: 'irodalom', name: 'Irodalom', icon: '📚', color: '#F59E0B', count: 56, description: 'Könyvek, szemelvények, saját írások' },
    { id: 'kezművesseg', name: 'Kézművesség', icon: '🎨', color: '#3B82F6', count: 23, description: 'Helyi műhelyek: fazekas, kovács, szövő' },
    { id: 'tabor', name: 'Táborhely', icon: '🏕️', color: '#F97316', count: 15, description: 'Táborhelyek szervezése megyénként' }
  ];

  let cultureIdeas: Idea[] = [
    { id: 1, title: 'Kárpátok Hangja', description: 'Magyar népzenei együttes fiataloknak', addedBy: 'Kiss Péter', addedDate: '2024-02-10', subcategory: 'zenekar' },
    { id: 2, title: 'Tisza Vonósok', description: 'Klasszikus kamaraegyüttes Szegeden', addedBy: 'Nagy Anna', addedDate: '2024-02-15', subcategory: 'zenekar' },
    { id: 3, title: 'Honfoglalók', description: 'Rock zenekar történelmi témákkal', addedBy: 'Szabó Gábor', addedDate: '2024-03-01', subcategory: 'zenekar' },
    { id: 4, title: 'Turulmadár Együttes', description: 'Hagyományőrző folk zenekar', addedBy: 'Kovács László', addedDate: '2024-03-05', subcategory: 'zenekar' },
    { id: 5, title: 'Árpád Népe Társulat', description: 'Történelmi színjátszó csoport', addedBy: 'Tóth Mária', addedDate: '2024-02-20', subcategory: 'szinjatszo' },
    { id: 6, title: 'Mezőségi Komédiások', description: 'Vígjáték társulat népi humorral', addedBy: 'Horváth Éva', addedDate: '2024-03-10', subcategory: 'szinjatszo' },
    { id: 7, title: 'Hét Vezér Stúdió', description: 'Filmes és színházi produkciók', addedBy: 'Balogh István', addedDate: '2024-03-15', subcategory: 'szinjatszo' }
  ];

  let videoIdeas: Idea[] = [
    { id: 1, title: 'Magyar történelem sorozat', description: 'Animációs oktatóvideók gyerekeknek', addedBy: 'Varga Zsolt', addedDate: '2024-01-20' },
    { id: 2, title: 'Hagyományos receptek', description: 'Magyar ételek készítése', addedBy: 'Kiss Eszter', addedDate: '2024-02-05' },
    { id: 3, title: 'Néptánc oktatóvideók', description: 'Különböző táji táncok', addedBy: 'Nagy Katalin', addedDate: '2024-02-25' }
  ];

  let scienceIdeas: Idea[] = [
    { id: 1, title: 'Arduino robot építés', description: 'Robot készítése kezdőknek', addedBy: 'Molnár Béla', addedDate: '2024-02-01', subcategory: 'robottechnika' },
    { id: 2, title: 'LED kocka projekt', description: '3x3x3 LED kocka forrasztás', addedBy: 'Fekete Ádám', addedDate: '2024-02-10', subcategory: 'elektronika' },
    { id: 3, title: 'Python alapok', description: 'Programozás játékos feladatokkal', addedBy: 'Szűcs Dániel', addedDate: '2024-02-15', subcategory: 'programozas' },
    { id: 4, title: 'Napelemes töltő', description: 'Kis napelemes telefontöltő', addedBy: 'Papp Gergő', addedDate: '2024-03-01', subcategory: 'energia' },
    { id: 5, title: 'Mágneses lebegtetés', description: 'Lebegő mágnes kísérlet', addedBy: 'Németh Zsolt', addedDate: '2024-03-05', subcategory: 'magneses' },
    { id: 6, title: 'FM rádió építés', description: 'Egyszerű FM vevő készítése', addedBy: 'Takács Imre', addedDate: '2024-03-10', subcategory: 'radiotechnika' },
    { id: 7, title: 'Fapolc készítés', description: 'Bútorkészítés kéziszerszámokkal', addedBy: 'Farkas Zoltán', addedDate: '2024-03-12', subcategory: 'minfjart' }
  ];

  let books: Book[] = [
    { id: 1, title: 'Egri csillagok', author: 'Gárdonyi Géza', excerpt: 'Az ostrom napjai rettenetesek voltak...', addedBy: 'Nagy József', addedDate: '2024-01-15' },
    { id: 2, title: 'A Pál utcai fiúk', author: 'Molnár Ferenc', excerpt: 'A grund volt a fiúk birodalma...', addedBy: 'Kovács Anna', addedDate: '2024-01-20' },
    { id: 3, title: 'Tüskevár', author: 'Fekete István', excerpt: 'A természet még szabad volt...', addedBy: 'Szabó Péter', addedDate: '2024-02-01' }
  ];

  let userWritings: UserWriting[] = [
    { id: 1, title: 'Hazám, hazám', author: 'Balogh István', date: '2024-03-01', content: 'A Kárpátok ölelésében...' },
    { id: 2, title: 'Falum emléke', author: 'Kis Mária', date: '2024-03-05', content: 'A kis falusi templomtorony...' }
  ];

  let craftIdeas: Idea[] = [
    { id: 1, title: 'Kecskeméti Fazekasműhely', description: 'Hagyományos kerámia tanfolyam', addedBy: 'Varga Imre', addedDate: '2024-02-20', subcategory: 'fazekas' },
    { id: 2, title: 'Ősi Kovács Műhely', description: 'Kovácsoltvas dísztárgyak', addedBy: 'Horváth Ferenc', addedDate: '2024-03-01', subcategory: 'kovacs' },
    { id: 3, title: 'Réz és Bronz Stúdió', description: 'Fémöntés és díszítés', addedBy: 'Tóth Sándor', addedDate: '2024-03-10', subcategory: 'fem' },
    { id: 4, title: 'Bőrműves Kör', description: 'Táskák, övek készítése', addedBy: 'Kiss Judit', addedDate: '2024-03-15', subcategory: 'bor' },
    { id: 5, title: 'Szövőház Egyesület', description: 'Hagyományos szövési technikák', addedBy: 'Nagy Erzsébet', addedDate: '2024-03-20', subcategory: 'szovo' }
  ];

  let campSites: CampSite[] = [
    { id: 1, name: 'Bükki Sátorhely', county: 'Borsod-Abaúj-Zemplén', description: 'Erdei tisztás a Bükk szívében', imageUrl: '', capacity: 50, addedBy: 'Molnár Péter' },
    { id: 2, name: 'Balatoni Tábor', county: 'Veszprém', description: 'Vízparti kemping vízi sportokkal', imageUrl: '', capacity: 100, addedBy: 'Szabó Anna' },
    { id: 3, name: 'Hortobágyi Jurtatábor', county: 'Hajdú-Bihar', description: 'Pusztai szállás lovaglással', imageUrl: '', capacity: 30, addedBy: 'Kiss László' }
  ];

  let selectedCategory = 'kultura';
  let selectedScienceSubcat = 'all';
  let selectedWorkshopType = 'all';
  let selectedCounty = 'all';
  let chartContainer: HTMLDivElement | undefined;
  let pieChartContainer: HTMLDivElement | undefined;
  let chart: echarts.ECharts | null = null;
  let pieChart: echarts.ECharts | null = null;

  let showAddForm: boolean | string = false;
  let newIdea = { title: '', description: '', subcategory: '' };
  let newBook = { title: '', author: '', excerpt: '' };
  let newWriting = { title: '', content: '' };
  let newCampSite = { name: '', county: 'Budapest', description: '', imageUrl: '', capacity: 20 };

  function selectCategory(id: string) { selectedCategory = id; showAddForm = false; }

  function addCultureIdea() {
    if (newIdea.title && newIdea.description) {
      cultureIdeas = [...cultureIdeas, { id: cultureIdeas.length + 1, title: newIdea.title, description: newIdea.description, addedBy: 'Felhasználó', addedDate: new Date().toISOString().split('T')[0], subcategory: newIdea.subcategory || 'zenekar' }];
      newIdea = { title: '', description: '', subcategory: '' }; showAddForm = false;
    }
  }
  function addVideoIdea() {
    if (newIdea.title && newIdea.description) {
      videoIdeas = [...videoIdeas, { id: videoIdeas.length + 1, title: newIdea.title, description: newIdea.description, addedBy: 'Felhasználó', addedDate: new Date().toISOString().split('T')[0] }];
      newIdea = { title: '', description: '', subcategory: '' }; showAddForm = false;
    }
  }
  function addScienceIdea() {
    if (newIdea.title && newIdea.description) {
      scienceIdeas = [...scienceIdeas, { id: scienceIdeas.length + 1, title: newIdea.title, description: newIdea.description, addedBy: 'Felhasználó', addedDate: new Date().toISOString().split('T')[0], subcategory: newIdea.subcategory || 'minfjart' }];
      newIdea = { title: '', description: '', subcategory: '' }; showAddForm = false;
    }
  }
  function addCraftIdea() {
    if (newIdea.title && newIdea.description) {
      craftIdeas = [...craftIdeas, { id: craftIdeas.length + 1, title: newIdea.title, description: newIdea.description, addedBy: 'Felhasználó', addedDate: new Date().toISOString().split('T')[0], subcategory: newIdea.subcategory || 'fazekas' }];
      newIdea = { title: '', description: '', subcategory: '' }; showAddForm = false;
    }
  }
  function addBook() {
    if (newBook.title && newBook.author) {
      books = [...books, { id: books.length + 1, title: newBook.title, author: newBook.author, excerpt: newBook.excerpt || '', addedBy: 'Felhasználó', addedDate: new Date().toISOString().split('T')[0] }];
      newBook = { title: '', author: '', excerpt: '' }; showAddForm = false;
    }
  }
  function addWriting() {
    if (newWriting.title && newWriting.content) {
      userWritings = [...userWritings, { id: userWritings.length + 1, title: newWriting.title, content: newWriting.content, author: 'Felhasználó', date: new Date().toISOString().split('T')[0] }];
      newWriting = { title: '', content: '' }; showAddForm = false;
    }
  }
  function addCampSite() {
    if (newCampSite.name && newCampSite.description) {
      campSites = [...campSites, { id: campSites.length + 1, name: newCampSite.name, county: newCampSite.county, description: newCampSite.description, imageUrl: newCampSite.imageUrl, capacity: newCampSite.capacity, addedBy: 'Felhasználó' }];
      newCampSite = { name: '', county: 'Budapest', description: '', imageUrl: '', capacity: 20 }; showAddForm = false;
    }
  }

  function deleteCultureIdea(id: number) { cultureIdeas = cultureIdeas.filter(i => i.id !== id); }
  function deleteVideoIdea(id: number) { videoIdeas = videoIdeas.filter(i => i.id !== id); }
  function deleteScienceIdea(id: number) { scienceIdeas = scienceIdeas.filter(i => i.id !== id); }
  function deleteCraftIdea(id: number) { craftIdeas = craftIdeas.filter(i => i.id !== id); }
  function deleteBook(id: number) { books = books.filter(b => b.id !== id); }
  function deleteWriting(id: number) { userWritings = userWritings.filter(w => w.id !== id); }
  function deleteCampSite(id: number) { campSites = campSites.filter(c => c.id !== id); }

  $: filteredScienceIdeas = selectedScienceSubcat === 'all' ? scienceIdeas : scienceIdeas.filter(i => i.subcategory === selectedScienceSubcat);
  $: filteredCraftIdeas = selectedWorkshopType === 'all' ? craftIdeas : craftIdeas.filter(i => i.subcategory === selectedWorkshopType);
  $: filteredCampSites = selectedCounty === 'all' ? campSites : campSites.filter(c => c.county === selectedCounty);

  function initCharts() {
    if (chartContainer) {
      chart = echarts.init(chartContainer);
      chart.setOption({ title: { text: 'Ötletek kategóriánként', left: 'center' }, xAxis: { type: 'category', data: categories.map(c => c.name), axisLabel: { rotate: 15, fontSize: 10 } }, yAxis: { type: 'value' }, series: [{ type: 'bar', data: categories.map(c => ({ value: c.count, itemStyle: { color: c.color } })) }] });
    }
    if (pieChartContainer) {
      pieChart = echarts.init(pieChartContainer);
      pieChart.setOption({ title: { text: 'Megoszlás', left: 'center' }, series: [{ type: 'pie', radius: ['40%', '70%'], data: categories.map(c => ({ value: c.count, name: c.name, itemStyle: { color: c.color } })) }] });
    }
  }

  function handleResize() { chart?.resize(); pieChart?.resize(); }

  onMount(() => { setTimeout(initCharts, 100); window.addEventListener('resize', handleResize); });
  onDestroy(() => { window.removeEventListener('resize', handleResize); chart?.dispose(); pieChart?.dispose(); });

  $: selectedCategoryData = categories.find(c => c.id === selectedCategory);
</script>

<div class="ideas-page">
  <div class="header"><h2>💡 Közösségi Ötletek</h2><p>Oszd meg és fedezd fel a közösség ötleteit</p></div>

  <div class="charts"><div class="chart-card"><div bind:this={chartContainer} class="chart-box"></div></div><div class="chart-card"><div bind:this={pieChartContainer} class="chart-box"></div></div></div>

  <div class="cats"><h3>📂 Kategóriák</h3>
    <div class="cat-grid">{#each categories as cat}<button class="cat-btn" class:active={selectedCategory === cat.id} style="--c:{cat.color}" on:click={() => selectCategory(cat.id)}><span class="icon">{cat.icon}</span><span class="name">{cat.name}</span><span class="count">{cat.count}</span></button>{/each}</div>
  </div>

  {#if selectedCategory === 'kultura'}
    <div class="section" style="--sc:#8B5CF6">
      <div class="sec-head"><h3>🎭 {selectedCategoryData?.name}</h3><p>{selectedCategoryData?.description}</p><button class="add-btn" on:click={() => showAddForm = !showAddForm}>{showAddForm ? '✕' : '+ Hozzáadás'}</button></div>
      {#if showAddForm}<div class="form"><input placeholder="Név" bind:value={newIdea.title}/><input placeholder="Leírás" bind:value={newIdea.description}/><select bind:value={newIdea.subcategory}><option value="zenekar">🎸 Zenekar</option><option value="szinjatszo">🎭 Színjátszó</option></select><button class="submit" on:click={addCultureIdea}>Mentés</button></div>{/if}
      <div class="sub"><h4>🎸 Zenekarok</h4><div class="grid">{#each cultureIdeas.filter(i => i.subcategory === 'zenekar') as idea}<div class="card"><div class="card-head"><h5>{idea.title}</h5><button class="del" on:click={() => deleteCultureIdea(idea.id)}>🗑️</button></div><p>{idea.description}</p><div class="meta"><span>{idea.addedBy}</span><span>{idea.addedDate}</span></div></div>{/each}</div></div>
      <div class="sub"><h4>🎭 Színjátszók</h4><div class="grid">{#each cultureIdeas.filter(i => i.subcategory === 'szinjatszo') as idea}<div class="card"><div class="card-head"><h5>{idea.title}</h5><button class="del" on:click={() => deleteCultureIdea(idea.id)}>🗑️</button></div><p>{idea.description}</p><div class="meta"><span>{idea.addedBy}</span><span>{idea.addedDate}</span></div></div>{/each}</div></div>
    </div>

  {:else if selectedCategory === 'videok'}
    <div class="section" style="--sc:#EC4899">
      <div class="sec-head"><h3>🎬 {selectedCategoryData?.name}</h3><p>{selectedCategoryData?.description}</p><button class="add-btn" on:click={() => showAddForm = !showAddForm}>{showAddForm ? '✕' : '+ Hozzáadás'}</button></div>
      {#if showAddForm}<div class="form"><input placeholder="Cím" bind:value={newIdea.title}/><input placeholder="Leírás" bind:value={newIdea.description}/><button class="submit" on:click={addVideoIdea}>Mentés</button></div>{/if}
      <div class="grid">{#each videoIdeas as idea}<div class="card video"><div class="card-head"><h5>{idea.title}</h5><button class="del" on:click={() => deleteVideoIdea(idea.id)}>🗑️</button></div><p>{idea.description}</p><div class="meta"><span>{idea.addedBy}</span><span>{idea.addedDate}</span></div></div>{/each}</div>
    </div>

  {:else if selectedCategory === 'tudomany'}
    <div class="section" style="--sc:#10B981">
      <div class="sec-head"><h3>🔬 {selectedCategoryData?.name}</h3><p>{selectedCategoryData?.description}</p><button class="add-btn" on:click={() => showAddForm = !showAddForm}>{showAddForm ? '✕' : '+ Hozzáadás'}</button></div>
      <div class="tabs"><button class:active={selectedScienceSubcat === 'all'} on:click={() => selectedScienceSubcat = 'all'}>Összes</button>{#each SCIENCE_SUBCATEGORIES as sub}<button class:active={selectedScienceSubcat === sub.id} on:click={() => selectedScienceSubcat = sub.id}>{sub.icon} {sub.name}</button>{/each}</div>
      {#if showAddForm}<div class="form"><input placeholder="Projekt neve" bind:value={newIdea.title}/><input placeholder="Leírás" bind:value={newIdea.description}/><select bind:value={newIdea.subcategory}>{#each SCIENCE_SUBCATEGORIES as sub}<option value={sub.id}>{sub.icon} {sub.name}</option>{/each}</select><button class="submit" on:click={addScienceIdea}>Mentés</button></div>{/if}
      <div class="grid">{#each filteredScienceIdeas as idea}<div class="card sci"><div class="card-head"><h5>{SCIENCE_SUBCATEGORIES.find(s => s.id === idea.subcategory)?.icon} {idea.title}</h5><button class="del" on:click={() => deleteScienceIdea(idea.id)}>🗑️</button></div><p>{idea.description}</p><div class="meta"><span>{idea.addedBy}</span><span>{idea.addedDate}</span></div></div>{/each}</div>
    </div>

  {:else if selectedCategory === 'irodalom'}
    <div class="section" style="--sc:#F59E0B">
      <div class="sec-head"><h3>📚 {selectedCategoryData?.name}</h3><p>{selectedCategoryData?.description}</p></div>
      <div class="sub"><div class="sub-head"><h4>📖 Könyvek</h4><button class="add-btn" on:click={() => showAddForm = showAddForm === 'book' ? false : 'book'}>{showAddForm === 'book' ? '✕' : '+ Könyv'}</button></div>
        {#if showAddForm === 'book'}<div class="form"><input placeholder="Cím" bind:value={newBook.title}/><input placeholder="Szerző" bind:value={newBook.author}/><textarea placeholder="Szemelvény" bind:value={newBook.excerpt} rows="2"></textarea><button class="submit" on:click={addBook}>Mentés</button></div>{/if}
        <div class="grid">{#each books as book}<div class="card book"><div class="card-head"><h5>{book.title}</h5><button class="del" on:click={() => deleteBook(book.id)}>🗑️</button></div><p class="author">✍️ {book.author}</p><p class="excerpt">"{book.excerpt}"</p><div class="meta"><span>{book.addedBy}</span><span>{book.addedDate}</span></div></div>{/each}</div>
      </div>
      <div class="sub"><div class="sub-head"><h4>✏️ Írások</h4><button class="add-btn" on:click={() => showAddForm = showAddForm === 'writing' ? false : 'writing'}>{showAddForm === 'writing' ? '✕' : '+ Írás'}</button></div>
        {#if showAddForm === 'writing'}<div class="form"><input placeholder="Cím" bind:value={newWriting.title}/><textarea placeholder="Tartalom" bind:value={newWriting.content} rows="3"></textarea><button class="submit" on:click={addWriting}>Mentés</button></div>{/if}
        <div class="grid">{#each userWritings as w}<div class="card writing"><div class="card-head"><h5>{w.title}</h5><button class="del" on:click={() => deleteWriting(w.id)}>🗑️</button></div><p>{w.content}</p><div class="meta"><span>{w.author}</span><span>{w.date}</span></div></div>{/each}</div>
      </div>
    </div>

  {:else if selectedCategory === 'kezművesseg'}
    <div class="section" style="--sc:#3B82F6">
      <div class="sec-head"><h3>🎨 {selectedCategoryData?.name}</h3><p>{selectedCategoryData?.description}</p><button class="add-btn" on:click={() => showAddForm = !showAddForm}>{showAddForm ? '✕' : '+ Hozzáadás'}</button></div>
      <div class="tabs"><button class:active={selectedWorkshopType === 'all'} on:click={() => selectedWorkshopType = 'all'}>Összes</button>{#each WORKSHOP_TYPES as type}<button class:active={selectedWorkshopType === type.id} on:click={() => selectedWorkshopType = type.id}>{type.icon} {type.name}</button>{/each}</div>
      {#if showAddForm}<div class="form"><input placeholder="Műhely neve" bind:value={newIdea.title}/><input placeholder="Leírás" bind:value={newIdea.description}/><select bind:value={newIdea.subcategory}>{#each WORKSHOP_TYPES as type}<option value={type.id}>{type.icon} {type.name}</option>{/each}</select><button class="submit" on:click={addCraftIdea}>Mentés</button></div>{/if}
      <div class="grid">{#each filteredCraftIdeas as idea}<div class="card craft"><div class="card-head"><h5>{WORKSHOP_TYPES.find(t => t.id === idea.subcategory)?.icon} {idea.title}</h5><button class="del" on:click={() => deleteCraftIdea(idea.id)}>🗑️</button></div><p>{idea.description}</p><div class="meta"><span>{idea.addedBy}</span><span>{idea.addedDate}</span></div></div>{/each}</div>
    </div>

  {:else if selectedCategory === 'tabor'}
    <div class="section" style="--sc:#F97316">
      <div class="sec-head"><h3>🏕️ {selectedCategoryData?.name}</h3><p>{selectedCategoryData?.description}</p><button class="add-btn" on:click={() => showAddForm = !showAddForm}>{showAddForm ? '✕' : '+ Hozzáadás'}</button></div>
      <div class="county-filter"><label>📍 Megye:</label><select bind:value={selectedCounty}><option value="all">Összes</option>{#each COUNTIES as c}<option value={c}>{c}</option>{/each}</select></div>
      {#if showAddForm}<div class="form"><input placeholder="Táborhely neve" bind:value={newCampSite.name}/><select bind:value={newCampSite.county}>{#each COUNTIES as c}<option value={c}>{c}</option>{/each}</select><input placeholder="Leírás" bind:value={newCampSite.description}/><input placeholder="Kép URL" bind:value={newCampSite.imageUrl}/><input type="number" placeholder="Kapacitás" bind:value={newCampSite.capacity}/><button class="submit" on:click={addCampSite}>Mentés</button></div>{/if}
      <div class="camp-grid">{#each filteredCampSites as camp}<div class="camp-card"><div class="camp-img">{#if camp.imageUrl}<img src={camp.imageUrl} alt={camp.name}/>{:else}<span>🏕️</span>{/if}</div><div class="camp-content"><div class="card-head"><h5>{camp.name}</h5><button class="del" on:click={() => deleteCampSite(camp.id)}>🗑️</button></div><p class="county">📍 {camp.county}</p><p>{camp.description}</p><div class="meta"><span>👥 {camp.capacity} fő</span><span>{camp.addedBy}</span></div></div></div>{/each}</div>
    </div>
  {/if}
</div>

<style>
  .ideas-page{padding:20px;max-height:calc(100vh - 250px);overflow-y:auto}
  .header{text-align:center;margin-bottom:20px}.header h2{margin:0 0 8px;font-size:1.6rem;color:#1f2937}.header p{margin:0;color:#6b7280}
  .charts{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}.chart-card{background:#f9fafb;border-radius:10px;padding:12px}.chart-box{width:100%;height:220px}
  .cats{margin-bottom:20px}.cats h3{margin:0 0 12px;font-size:1.1rem;color:#374151}
  .cat-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}
  .cat-btn{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 6px;border:2px solid #e5e7eb;border-radius:10px;background:#fff;cursor:pointer;transition:all .2s}
  .cat-btn:hover{border-color:var(--c);transform:translateY(-2px)}.cat-btn.active{border-color:var(--c);background:color-mix(in srgb,var(--c) 10%,white)}
  .cat-btn .icon{font-size:1.4rem}.cat-btn .name{font-weight:600;color:#374151;font-size:.75rem;text-align:center}.cat-btn .count{font-size:.65rem;color:#6b7280;background:#f3f4f6;padding:2px 6px;border-radius:10px}
  .section{background:#f9fafb;border-radius:10px;padding:16px}
  .sec-head{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:16px}.sec-head h3{margin:0;color:#1f2937;font-size:1.2rem;flex:1}.sec-head p{width:100%;margin:0;color:#6b7280;font-size:.85rem}
  .tabs{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}.tabs button{padding:5px 10px;border:1px solid #e5e7eb;border-radius:5px;background:#fff;cursor:pointer;font-size:.75rem}.tabs button:hover{border-color:var(--sc)}.tabs button.active{background:var(--sc);color:#fff;border-color:var(--sc)}
  .county-filter{display:flex;align-items:center;gap:8px;margin-bottom:14px}.county-filter select{padding:6px 10px;border:2px solid #e5e7eb;border-radius:5px}
  .add-btn{padding:6px 12px;background:var(--sc);color:#fff;border:none;border-radius:5px;cursor:pointer;font-weight:500;font-size:.8rem}.add-btn:hover{filter:brightness(.9)}
  .form{display:flex;flex-direction:column;gap:8px;padding:12px;background:#fff;border-radius:6px;margin-bottom:14px;border:1px solid #e5e7eb}
  .form input,.form textarea,.form select{padding:8px;border:2px solid #e5e7eb;border-radius:5px;font-size:.85rem}.form input:focus,.form textarea:focus{outline:none;border-color:var(--sc)}
  .submit{padding:8px 14px;background:#10B981;color:#fff;border:none;border-radius:5px;cursor:pointer;font-weight:600;align-self:flex-start}.submit:hover{background:#059669}
  .sub{background:#fff;border-radius:6px;padding:12px;margin-bottom:12px}.sub-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #e5e7eb}.sub-head h4{margin:0;color:#374151;font-size:.95rem}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
  .card{background:#fff;border:1px solid #e5e7eb;border-radius:6px;padding:12px;transition:transform .2s}.card:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,.08)}
  .card.video{border-left:3px solid #EC4899}.card.sci{border-left:3px solid #10B981}.card.book{background:#fefce8;border-color:#fde047}.card.writing{background:#f0fdf4;border-color:#86efac}.card.craft{border-left:3px solid #3B82F6}
  .card-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px}.card-head h5{margin:0;color:#1f2937;font-size:.9rem}
  .del{background:none;border:none;cursor:pointer;opacity:.5;transition:opacity .2s}.del:hover{opacity:1}
  .card p{margin:0 0 8px;color:#6b7280;font-size:.8rem;line-height:1.4}.card .author{color:#b45309}.card .excerpt{font-style:italic;color:#78716c}
  .meta{display:flex;justify-content:space-between;font-size:.65rem;color:#9ca3af}
  .camp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}
  .camp-card{background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb}
  .camp-img{height:100px;background:#fed7aa;display:flex;align-items:center;justify-content:center;font-size:2.5rem}.camp-img img{width:100%;height:100%;object-fit:cover}
  .camp-content{padding:12px}.camp-content .county{color:#ea580c!important;font-weight:500}
  @media(max-width:1200px){.charts{grid-template-columns:1fr}.cat-grid{grid-template-columns:repeat(3,1fr)}}
  @media(max-width:768px){.cat-grid{grid-template-columns:repeat(2,1fr)}.grid,.camp-grid{grid-template-columns:1fr}}
</style>
