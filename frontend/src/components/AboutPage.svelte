<script lang="ts">
  /**
   * AboutPage - Bemutatkozó prezentációs oldal
   * A Turul Platform filozófiája és víziója
   */

  import { onMount, onDestroy } from 'svelte';
  import * as echarts from 'echarts';

  // Chart referenciák
  let pillarsChartEl: HTMLDivElement;
  let generationsChartEl: HTMLDivElement;
  let networkChartEl: HTMLDivElement;
  let growthChartEl: HTMLDivElement;
  let marketplaceChartEl: HTMLDivElement;

  let pillarsChart: echarts.ECharts;
  let generationsChart: echarts.ECharts;
  let networkChart: echarts.ECharts;
  let growthChart: echarts.ECharts;
  let marketplaceChart: echarts.ECharts;

  // Aktív szekció animációhoz
  let visibleSections: Set<string> = new Set();

  onMount(() => {
    initCharts();
    setupIntersectionObserver();

    // Resize handler
    window.addEventListener('resize', handleResize);
  });

  onDestroy(() => {
    pillarsChart?.dispose();
    generationsChart?.dispose();
    networkChart?.dispose();
    growthChart?.dispose();
    marketplaceChart?.dispose();
    window.removeEventListener('resize', handleResize);
  });

  function handleResize() {
    pillarsChart?.resize();
    generationsChart?.resize();
    networkChart?.resize();
    growthChart?.resize();
    marketplaceChart?.resize();
  }

  function setupIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSections.add(entry.target.id);
            visibleSections = visibleSections;
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll('.about-section').forEach((section) => {
      observer.observe(section);
    });
  }

  function initCharts() {
    // 1. Három pillér - Radar chart
    if (pillarsChartEl) {
      pillarsChart = echarts.init(pillarsChartEl);
      pillarsChart.setOption({
        tooltip: {
          trigger: 'item'
        },
        legend: {
          bottom: 10,
          textStyle: { color: '#666' }
        },
        radar: {
          indicator: [
            { name: 'Család', max: 100 },
            { name: 'Generáció', max: 100 },
            { name: 'Helyi közösség', max: 100 },
            { name: 'Kultúra', max: 100 },
            { name: 'Gazdaság', max: 100 }
          ],
          shape: 'polygon',
          splitArea: {
            areaStyle: {
              color: ['rgba(139, 92, 246, 0.05)', 'rgba(139, 92, 246, 0.1)']
            }
          },
          axisLine: { lineStyle: { color: '#e0e0e0' } },
          splitLine: { lineStyle: { color: '#e0e0e0' } }
        },
        series: [{
          type: 'radar',
          data: [
            {
              value: [95, 85, 90, 75, 80],
              name: 'Jelenlegi fókusz',
              areaStyle: {
                color: 'rgba(139, 92, 246, 0.3)'
              },
              lineStyle: { color: '#8B5CF6', width: 2 },
              itemStyle: { color: '#8B5CF6' }
            },
            {
              value: [100, 100, 100, 95, 95],
              name: 'Célállapot',
              areaStyle: {
                color: 'rgba(16, 185, 129, 0.2)'
              },
              lineStyle: { color: '#10b981', width: 2, type: 'dashed' },
              itemStyle: { color: '#10b981' }
            }
          ]
        }]
      });
    }

    // 2. Generációs összetétel - Pyramid chart
    if (generationsChartEl) {
      generationsChart = echarts.init(generationsChartEl);
      generationsChart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        grid: {
          left: '15%',
          right: '15%',
          top: '10%',
          bottom: '10%'
        },
        xAxis: {
          type: 'value',
          position: 'top',
          axisLabel: { show: false },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false }
        },
        yAxis: {
          type: 'category',
          data: ['70+ Bölcsek', '50-70 Építők', '30-50 Aktívak', '18-30 Fiatalok', '0-18 Gyermekek'],
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            fontSize: 13,
            fontWeight: 'bold',
            color: '#374151'
          }
        },
        series: [
          {
            name: 'Bal oldal',
            type: 'bar',
            stack: 'total',
            barWidth: 30,
            label: {
              show: true,
              position: 'left',
              formatter: (params: any) => {
                const labels = ['Tapasztalat', 'Stabilitás', 'Energia', 'Innováció', 'Jövő'];
                return labels[params.dataIndex];
              },
              fontSize: 11,
              color: '#666'
            },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#8B5CF6' },
                { offset: 1, color: '#A78BFA' }
              ]),
              borderRadius: [15, 0, 0, 15]
            },
            data: [-25, -35, -50, -40, -30]
          },
          {
            name: 'Jobb oldal',
            type: 'bar',
            stack: 'total',
            barWidth: 30,
            label: {
              show: true,
              position: 'right',
              formatter: (params: any) => {
                const labels = ['Bölcsesség', 'Kapcsolatok', 'Vezetés', 'Digitális', 'Remény'];
                return labels[params.dataIndex];
              },
              fontSize: 11,
              color: '#666'
            },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#10b981' },
                { offset: 1, color: '#34d399' }
              ]),
              borderRadius: [0, 15, 15, 0]
            },
            data: [25, 35, 50, 40, 30]
          }
        ]
      });
    }

    // 3. Közösségi hálózat - Graph/Force directed
    if (networkChartEl) {
      networkChart = echarts.init(networkChartEl);
      
      const nodes = [
        { id: '0', name: 'Közösség', symbolSize: 60, category: 0 },
        { id: '1', name: 'Család 1', symbolSize: 40, category: 1 },
        { id: '2', name: 'Család 2', symbolSize: 40, category: 1 },
        { id: '3', name: 'Család 3', symbolSize: 40, category: 1 },
        { id: '4', name: 'Nagyszülő', symbolSize: 25, category: 2 },
        { id: '5', name: 'Szülő', symbolSize: 25, category: 3 },
        { id: '6', name: 'Gyermek', symbolSize: 25, category: 4 },
        { id: '7', name: 'Nagyszülő', symbolSize: 25, category: 2 },
        { id: '8', name: 'Szülő', symbolSize: 25, category: 3 },
        { id: '9', name: 'Gyermek', symbolSize: 25, category: 4 },
        { id: '10', name: 'Szülő', symbolSize: 25, category: 3 },
        { id: '11', name: 'Gyermek', symbolSize: 25, category: 4 },
        { id: '12', name: 'Termelő', symbolSize: 30, category: 5 },
        { id: '13', name: 'Tanár', symbolSize: 30, category: 5 }
      ];

      const links = [
        { source: '0', target: '1' },
        { source: '0', target: '2' },
        { source: '0', target: '3' },
        { source: '1', target: '4' },
        { source: '1', target: '5' },
        { source: '1', target: '6' },
        { source: '4', target: '5' },
        { source: '5', target: '6' },
        { source: '2', target: '7' },
        { source: '2', target: '8' },
        { source: '2', target: '9' },
        { source: '7', target: '8' },
        { source: '8', target: '9' },
        { source: '3', target: '10' },
        { source: '3', target: '11' },
        { source: '10', target: '11' },
        { source: '0', target: '12' },
        { source: '0', target: '13' },
        { source: '6', target: '13' },
        { source: '9', target: '13' },
        { source: '1', target: '12' }
      ];

      networkChart.setOption({
        tooltip: {},
        legend: {
          data: ['Központ', 'Család', 'Nagyszülő', 'Szülő', 'Gyermek', 'Szolgáltató'],
          bottom: 10,
          textStyle: { fontSize: 11 }
        },
        series: [{
          type: 'graph',
          layout: 'force',
          roam: true,
          label: {
            show: true,
            position: 'bottom',
            fontSize: 10
          },
          categories: [
            { name: 'Központ', itemStyle: { color: '#8B5CF6' } },
            { name: 'Család', itemStyle: { color: '#3B82F6' } },
            { name: 'Nagyszülő', itemStyle: { color: '#6B7280' } },
            { name: 'Szülő', itemStyle: { color: '#10b981' } },
            { name: 'Gyermek', itemStyle: { color: '#F59E0B' } },
            { name: 'Szolgáltató', itemStyle: { color: '#EC4899' } }
          ],
          force: {
            repulsion: 300,
            edgeLength: 80
          },
          data: nodes,
          links: links,
          lineStyle: {
            color: '#ccc',
            width: 2,
            curveness: 0.1
          }
        }]
      });
    }

    // 4. Növekedési modell - Line chart
    if (growthChartEl) {
      growthChart = echarts.init(growthChartEl);
      growthChart.setOption({
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['Tagok', 'Aktív családok', 'Generációs kapcsolatok'],
          bottom: 10,
          textStyle: { fontSize: 11 }
        },
        grid: {
          left: '10%',
          right: '5%',
          top: '15%',
          bottom: '20%'
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['Indulás', '3 hónap', '6 hónap', '1 év', '2 év', '3 év'],
          axisLabel: { fontSize: 11 }
        },
        yAxis: {
          type: 'value',
          name: 'Szám',
          axisLabel: { fontSize: 11 }
        },
        series: [
          {
            name: 'Tagok',
            type: 'line',
            smooth: true,
            data: [50, 200, 500, 1500, 5000, 15000],
            lineStyle: { color: '#8B5CF6', width: 3 },
            itemStyle: { color: '#8B5CF6' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(139, 92, 246, 0.3)' },
                { offset: 1, color: 'rgba(139, 92, 246, 0.05)' }
              ])
            }
          },
          {
            name: 'Aktív családok',
            type: 'line',
            smooth: true,
            data: [15, 60, 180, 600, 2000, 6000],
            lineStyle: { color: '#10b981', width: 3 },
            itemStyle: { color: '#10b981' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
                { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
              ])
            }
          },
          {
            name: 'Generációs kapcsolatok',
            type: 'line',
            smooth: true,
            data: [10, 50, 150, 500, 2500, 10000],
            lineStyle: { color: '#F59E0B', width: 3 },
            itemStyle: { color: '#F59E0B' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(245, 158, 11, 0.3)' },
                { offset: 1, color: 'rgba(245, 158, 11, 0.05)' }
              ])
            }
          }
        ]
      });
    }

    // 5. Piactér kategóriák - Pie chart (egyszerűbb, olvashatóbb)
    if (marketplaceChartEl) {
      marketplaceChart = echarts.init(marketplaceChartEl);
      marketplaceChart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}%'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          textStyle: { 
            fontSize: 12,
            color: '#374151'
          },
          itemGap: 12
        },
        series: [
          {
            name: 'Kategóriák',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['35%', '50%'],
            avoidLabelOverlap: true,
            itemStyle: {
              borderRadius: 8,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: true,
              position: 'outside',
              formatter: '{b}',
              fontSize: 11,
              color: '#374151'
            },
            labelLine: {
              show: true,
              length: 10,
              length2: 15
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 13,
                fontWeight: 'bold'
              },
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.3)'
              }
            },
            data: [
              { value: 25, name: '🥬 Kerti termény', itemStyle: { color: '#4CAF50' } },
              { value: 15, name: '🥚 Tojás, tej', itemStyle: { color: '#FFC107' } },
              { value: 10, name: '🍯 Méz', itemStyle: { color: '#FFB300' } },
              { value: 8, name: '🍖 Hús', itemStyle: { color: '#F44336' } },
              { value: 12, name: '🫙 Házi készítésű', itemStyle: { color: '#FF9800' } },
              { value: 8, name: '🌱 Palánták', itemStyle: { color: '#8BC34A' } },
              { value: 10, name: '👶 Gyermekfelügy.', itemStyle: { color: '#EC407A' } },
              { value: 12, name: '📚 Magánórák', itemStyle: { color: '#673AB7' } },
              { value: 8, name: '📦 Használt cikk', itemStyle: { color: '#9E9E9E' } },
              { value: 5, name: '🔧 Eszközök', itemStyle: { color: '#607D8B' } }
            ]
          }
        ]
      });
    }
  }
</script>

<div class="about-page">
  <!-- Hero szekció -->
  <section class="hero-section">
    <div class="hero-content">
      <div class="hero-badge">🦅 TURUL PLATFORM</div>
      <h1>Közösségépítés a 21. században</h1>
      <p class="hero-subtitle">
        Családok, generációk és helyi közösségek összekapcsolása 
        modern technológiával, hagyományos értékekkel
      </p>
      <div class="hero-stats">
        <div class="stat-item">
          <span class="stat-number">👨‍👩‍👧‍👦</span>
          <span class="stat-label">Családközpontú</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">🔗</span>
          <span class="stat-label">Generációs híd</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">🏘️</span>
          <span class="stat-label">Helyi fókusz</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">⛓️</span>
          <span class="stat-label">Blockchain alapú</span>
        </div>
      </div>
    </div>
    <div class="hero-visual">
      <div class="floating-icons">
        <span class="icon i1">👨‍👩‍👧</span>
        <span class="icon i2">🏠</span>
        <span class="icon i3">🗳️</span>
        <span class="icon i4">🌾</span>
        <span class="icon i5">📚</span>
        <span class="icon i6">🤝</span>
      </div>
    </div>
  </section>

  <!-- Filozófia szekció -->
  <section id="philosophy" class="about-section philosophy-section">
    <div class="section-header">
      <span class="section-number">01</span>
      <h2>Alapfilozófia</h2>
      <p>A közösségszervezés nem emberek összegyűjtése, hanem élő hálózat építése</p>
    </div>

    <div class="philosophy-content">
      <div class="philosophy-text">
        <div class="philosophy-card">
          <div class="card-icon">🎯</div>
          <h3>Küldetésünk</h3>
          <p>A szétszórt egyénekből összehangolt közösséget formálni, ahol minden tag értékes, minden kapcsolat számít.</p>
        </div>
        <div class="philosophy-card">
          <div class="card-icon">💡</div>
          <h3>Megközelítésünk</h3>
          <p>A digitális eszközök nem helyettesítik, hanem <strong>felerősítik</strong> a valós kapcsolatokat.</p>
        </div>
        <div class="philosophy-card">
          <div class="card-icon">🔄</div>
          <h3>Irányunk</h3>
          <p>Alulról felfelé építkezés, ahol a kezdeményezések a közösségből fakadnak.</p>
        </div>
      </div>
      <div class="philosophy-chart">
        <h4>Közösségi pillérek</h4>
        <div bind:this={pillarsChartEl} class="chart-container"></div>
      </div>
    </div>
  </section>

  <!-- Három pillér szekció -->
  <section id="pillars" class="about-section pillars-section">
    <div class="section-header">
      <span class="section-number">02</span>
      <h2>Három pillér</h2>
      <p>A közösségépítés alapjai</p>
    </div>

    <div class="pillars-grid">
      <div class="pillar-card family">
        <div class="pillar-icon">👨‍👩‍👧‍👦</div>
        <h3>CSALÁD</h3>
        <p class="pillar-subtitle">A társadalom alapegysége</p>
        <ul class="pillar-features">
          <li>Családfa összekapcsolás a wallet-ben</li>
          <li>Közös családi jelvények</li>
          <li>Családi aktivitás összesítő</li>
          <li>Generációk közötti tudásátadás</li>
        </ul>
        <div class="pillar-badge">🏠 "Család ereje" jelvény</div>
      </div>

      <div class="pillar-card generation">
        <div class="pillar-icon">🔗</div>
        <h3>GENERÁCIÓ</h3>
        <p class="pillar-subtitle">Időbeli kontinuitás</p>
        <ul class="pillar-features">
          <li>Bölcsek tapasztalata (70+)</li>
          <li>Építők stabilitása (50-70)</li>
          <li>Aktívak energiája (30-50)</li>
          <li>Fiatalok innovációja (18-30)</li>
        </ul>
        <div class="pillar-badge">👴 "Három generáció" jelvény</div>
      </div>

      <div class="pillar-card community">
        <div class="pillar-icon">🏘️</div>
        <h3>HELYI KÖZÖSSÉG</h3>
        <p class="pillar-subtitle">Területi összetartozás</p>
        <ul class="pillar-features">
          <li>Körzeti szervezettség</li>
          <li>Helyi ügyek prioritása</li>
          <li>Szemtől szembeni találkozók</li>
          <li>Közösségi események</li>
        </ul>
        <div class="pillar-badge">🗳️ Körzeti szavazások</div>
      </div>
    </div>
  </section>

  <!-- Generációk szekció -->
  <section id="generations" class="about-section generations-section">
    <div class="section-header">
      <span class="section-number">03</span>
      <h2>Generációs struktúra</h2>
      <p>Minden korosztály hozzájárulása</p>
    </div>

    <div class="generations-content">
      <div class="generations-chart">
        <div bind:this={generationsChartEl} class="chart-container tall"></div>
      </div>
      <div class="generations-description">
        <div class="gen-item">
          <div class="gen-badge bölcsek">70+</div>
          <div class="gen-text">
            <h4>Bölcsek</h4>
            <p>Tapasztalat, történelmi emlékezet, értékek átadása a fiatalabb generációknak.</p>
          </div>
        </div>
        <div class="gen-item">
          <div class="gen-badge építők">50-70</div>
          <div class="gen-text">
            <h4>Építők</h4>
            <p>Stabilitás, erőforrások és kapcsolati tőke, amely megalapozza a közösséget.</p>
          </div>
        </div>
        <div class="gen-item">
          <div class="gen-badge aktívak">30-50</div>
          <div class="gen-text">
            <h4>Aktívak</h4>
            <p>Energia, kreativitás és vezetés - a közösség motorjai.</p>
          </div>
        </div>
        <div class="gen-item">
          <div class="gen-badge fiatalok">18-30</div>
          <div class="gen-text">
            <h4>Fiatalok</h4>
            <p>Innováció, digitális készségek, friss szemlélet.</p>
          </div>
        </div>
        <div class="gen-item">
          <div class="gen-badge gyermekek">0-18</div>
          <div class="gen-text">
            <h4>Gyermekek</h4>
            <p>A jövő, akikért dolgozunk - aktív résztvevők, nem passzív célcsoport.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Hálózat szekció -->
  <section id="network" class="about-section network-section">
    <div class="section-header">
      <span class="section-number">04</span>
      <h2>Közösségi hálózat</h2>
      <p>Családok és generációk összekapcsolása</p>
    </div>

    <div class="network-content">
      <div class="network-chart">
        <div bind:this={networkChartEl} class="chart-container wide"></div>
      </div>
      <div class="network-legend">
        <h4>A hálózat elemei</h4>
        <div class="legend-items">
          <div class="legend-item">
            <span class="dot" style="background: #8B5CF6;"></span>
            <span>Közösség központ</span>
          </div>
          <div class="legend-item">
            <span class="dot" style="background: #3B82F6;"></span>
            <span>Családi egységek</span>
          </div>
          <div class="legend-item">
            <span class="dot" style="background: #10b981;"></span>
            <span>Szülők - összekötők</span>
          </div>
          <div class="legend-item">
            <span class="dot" style="background: #F59E0B;"></span>
            <span>Gyermekek - jövő</span>
          </div>
          <div class="legend-item">
            <span class="dot" style="background: #EC4899;"></span>
            <span>Szolgáltatók</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Platform eszközök szekció -->
  <section id="tools" class="about-section tools-section">
    <div class="section-header">
      <span class="section-number">05</span>
      <h2>Platform eszközök</h2>
      <p>Web és mobil alkalmazás egyben</p>
    </div>

    <div class="tools-grid">
      <div class="tool-card web">
        <div class="tool-header">
          <span class="tool-icon">🖥️</span>
          <h3>Web Dashboard</h3>
          <span class="tool-badge">Képviselőknek</span>
        </div>
        <ul class="tool-features">
          <li>📊 Körzeti statisztikák</li>
          <li>🎯 Esélykalkulátor</li>
          <li>👨‍👩‍👧‍👦 Generációs elemzés</li>
          <li>📨 Meghívó rendszer</li>
          <li>🗳️ Szavazások kezelése</li>
          <li>🛒 Piactér áttekintés</li>
        </ul>
      </div>

      <div class="tool-card mobile">
        <div class="tool-header">
          <span class="tool-icon">📱</span>
          <h3>Turul Wallet</h3>
          <span class="tool-badge">Tagoknak</span>
        </div>
        <ul class="tool-features">
          <li>🦅 Soulbound Token identitás</li>
          <li>🏅 Jelvények gyűjtése</li>
          <li>👨‍👩‍👧‍👦 Családfa kezelése</li>
          <li>🗳️ Szavazáson részvétel</li>
          <li>🎫 Események kezelése</li>
          <li>🛒 Piactér hirdetések</li>
        </ul>
      </div>

      <div class="tool-card blockchain">
        <div class="tool-header">
          <span class="tool-icon">⛓️</span>
          <h3>Blockchain</h3>
          <span class="tool-badge">Háttérben</span>
        </div>
        <ul class="tool-features">
          <li>🔐 Hamisíthatatlan szavazatok</li>
          <li>📜 Jelvények tanúsítása</li>
          <li>🔍 Átlátható működés</li>
          <li>🏛️ Decentralizált tárolás</li>
          <li>✅ Utólagos ellenőrzés</li>
          <li>🛡️ Manipulációvédelem</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Piactér szekció -->
  <section id="marketplace" class="about-section marketplace-section">
    <div class="section-header">
      <span class="section-number">06</span>
      <h2>Helyi Piactér</h2>
      <p>Közösségi gazdaság és önellátás</p>
    </div>

    <div class="marketplace-content">
      <div class="marketplace-info">
        <p class="marketplace-intro">
          A vidéki közösségek összeszervezése terményeik és szolgáltatásaik 
          belső piacon való értékesítésére. <strong>Nem csak kereskedelem - 
          közösségi szolidaritás.</strong>
        </p>

        <div class="marketplace-types">
          <div class="type-card">
            <span class="type-icon">💰</span>
            <span class="type-name">Eladó</span>
          </div>
          <div class="type-card">
            <span class="type-icon">🔄</span>
            <span class="type-name">Csere</span>
          </div>
          <div class="type-card">
            <span class="type-icon">🎁</span>
            <span class="type-name">Ingyen</span>
          </div>
        </div>

        <div class="marketplace-benefits">
          <div class="benefit">
            <span class="benefit-icon">🥬</span>
            <div>
              <h4>Önellátás</h4>
              <p>Helyi termékek helyi fogyasztása</p>
            </div>
          </div>
          <div class="benefit">
            <span class="benefit-icon">💪</span>
            <div>
              <h4>Összetartás</h4>
              <p>A pénz a közösségben marad</p>
            </div>
          </div>
          <div class="benefit">
            <span class="benefit-icon">🤝</span>
            <div>
              <h4>Bizalom</h4>
              <p>"Tudom, kitől veszem"</p>
            </div>
          </div>
          <div class="benefit">
            <span class="benefit-icon">👶</span>
            <div>
              <h4>Szolgáltatások</h4>
              <p>Gyermekfelügyelet, oktatás</p>
            </div>
          </div>
        </div>
      </div>

      <div class="marketplace-chart">
        <h4>Piactér kategóriák</h4>
        <div bind:this={marketplaceChartEl} class="chart-container"></div>
      </div>
    </div>
  </section>

  <!-- Növekedés szekció -->
  <section id="growth" class="about-section growth-section">
    <div class="section-header">
      <span class="section-number">07</span>
      <h2>Növekedési modell</h2>
      <p>Organikus közösségépítés idővel</p>
    </div>

    <div class="growth-content">
      <div class="growth-chart">
        <div bind:this={growthChartEl} class="chart-container wide"></div>
      </div>
      <div class="growth-milestones">
        <div class="milestone">
          <div class="milestone-marker">🌱</div>
          <h4>Indulás</h4>
          <p>Mag csapat, első családok</p>
        </div>
        <div class="milestone">
          <div class="milestone-marker">🌿</div>
          <h4>6 hónap</h4>
          <p>Első rendezvények, bizalom építés</p>
        </div>
        <div class="milestone">
          <div class="milestone-marker">🌳</div>
          <h4>1 év</h4>
          <p>Stabil közösség, rendszeres aktivitás</p>
        </div>
        <div class="milestone">
          <div class="milestone-marker">🌲</div>
          <h4>3 év</h4>
          <p>Érett közösség, önfenntartó működés</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Lelki élet szekció -->
  <section id="spiritual" class="about-section spiritual-section">
    <div class="section-header">
      <span class="section-number">08</span>
      <h2>Lelki élet és erkölcsi nevelés</h2>
      <p>Diszkrét, finoman integrált spirituális tartalmak</p>
    </div>

    <div class="spiritual-content">
      <div class="spiritual-intro">
        <p class="spiritual-lead">
          A platform <strong>nem túlhangsúlyozottan</strong>, hanem finoman, 
          természetes módon integrálja a lelki tartalmakat. A cél nem az erőltetett 
          vallásosság, hanem az erkölcsi alapok és a transzcendencia iránti 
          nyitottság megőrzése a közösségben.
        </p>
      </div>

      <div class="spiritual-features">
        <div class="spiritual-card daily">
          <div class="spiritual-icon">📖</div>
          <h3>Napi üzenet</h3>
          <p>Rövid bibliai idézet vagy erkölcsi tanítás minden nap - egy egyszerű gondolat, ami elindítja a napot.</p>
          <div class="spiritual-example">
            <em>"Szeresd felebarátodat, mint önmagadat."</em>
            <span>— Máté 22:39</span>
          </div>
        </div>

        <div class="spiritual-card children">
          <div class="spiritual-icon">👶</div>
          <h3>Gyermekek erkölcsi nevelése</h3>
          <p>Egyszerű történetek, példázatok és énekek, amelyek az alapvető értékeket közvetítik.</p>
          <ul class="spiritual-list">
            <li>🎵 Gyermek énekkar szervezése</li>
            <li>📚 Korosztálynak megfelelő mesék</li>
            <li>🎭 Közös előadások ünnepekre</li>
          </ul>
        </div>

        <div class="spiritual-card prayer">
          <div class="spiritual-icon">🙏</div>
          <h3>Imamódszerek elsajátítása</h3>
          <p>Megfelelő oktatók vezetésével az ima különböző formáinak megismerése.</p>
          <ul class="spiritual-list">
            <li>Reggeli és esti ima</li>
            <li>Családi ima gyakorlata</li>
            <li>Csöndes elmélkedés</li>
          </ul>
        </div>

        <div class="spiritual-card podcast">
          <div class="spiritual-icon">🎙️</div>
          <h3>Szakrális időszakok - Podcast</h3>
          <p>Liturgikus naptárhoz igazodó beszélgetések, amelyek ráhangolnak az ünnepekre.</p>
          <div class="liturgical-seasons">
            <span class="season advent">🕯️ Advent</span>
            <span class="season christmas">⭐ Karácsony</span>
            <span class="season lent">✝️ Nagyböjt</span>
            <span class="season easter">🐣 Húsvét</span>
            <span class="season pentecost">🕊️ Pünkösd</span>
          </div>
        </div>
      </div>

      <div class="spiritual-philosophy">
        <h4>🌿 Keresztény és ősi bölcsesség</h4>
        <p>
          A platform nemcsak a keresztény tanításokat, hanem a kereszténység előtti 
          gnosztikus és természetfilozófiai bölcsességeket is megismerteti - 
          korcsoporthoz és érettséghez igazítva, megfelelő kontextusban.
        </p>
        <div class="philosophy-tracks">
          <div class="track">
            <span class="track-icon">👶</span>
            <span class="track-label">Gyermekek</span>
            <span class="track-content">Egyszerű mesék, énekek</span>
          </div>
          <div class="track">
            <span class="track-icon">🧑</span>
            <span class="track-label">Fiatalok</span>
            <span class="track-content">Erkölcsi kérdések, identitás</span>
          </div>
          <div class="track">
            <span class="track-icon">👨‍👩‍👧</span>
            <span class="track-label">Felnőttek</span>
            <span class="track-content">Filozófia, teológia, gnózis</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Közösségi ötletek szekció -->
  <section id="ideas" class="about-section ideas-section">
    <div class="section-header">
      <span class="section-number">09</span>
      <h2>Közösségi ötletek</h2>
      <p>Mintaötletek a közösség aktivitásaihoz</p>
    </div>

    <div class="ideas-showcase">
      <div class="ideas-category culture">
        <h3>🎭 Kultúra</h3>
        <div class="idea-items">
          <div class="idea-item">
            <strong>Kárpátok Hangja</strong>
            <span>Magyar népzenei együttes fiataloknak</span>
          </div>
          <div class="idea-item">
            <strong>Árpád Népe Társulat</strong>
            <span>Történelmi színjátszó csoport</span>
          </div>
          <div class="idea-item">
            <strong>Turulmadár Együttes</strong>
            <span>Hagyományőrző folk zenekar</span>
          </div>
        </div>
      </div>

      <div class="ideas-category science">
        <h3>🔬 Tudomány</h3>
        <div class="idea-items">
          <div class="idea-item">
            <strong>Arduino robot építés</strong>
            <span>Robottechnika kezdőknek</span>
          </div>
          <div class="idea-item">
            <strong>Python alapok</strong>
            <span>Programozás játékos feladatokkal</span>
          </div>
          <div class="idea-item">
            <strong>Napelemes töltő</strong>
            <span>Kis napelemes telefontöltő készítés</span>
          </div>
        </div>
      </div>

      <div class="ideas-category literature">
        <h3>📚 Irodalom</h3>
        <div class="idea-items">
          <div class="idea-item">
            <strong>Egri csillagok</strong>
            <span>Gárdonyi Géza</span>
          </div>
          <div class="idea-item">
            <strong>A Pál utcai fiúk</strong>
            <span>Molnár Ferenc</span>
          </div>
          <div class="idea-item">
            <strong>Tüskevár</strong>
            <span>Fekete István</span>
          </div>
        </div>
      </div>

      <div class="ideas-category craft">
        <h3>🎨 Kézművesség</h3>
        <div class="idea-items">
          <div class="idea-item">
            <strong>Fazekasműhely</strong>
            <span>Hagyományos kerámia tanfolyam</span>
          </div>
          <div class="idea-item">
            <strong>Kovács Műhely</strong>
            <span>Kovácsoltvas dísztárgyak</span>
          </div>
          <div class="idea-item">
            <strong>Szövőház</strong>
            <span>Hagyományos szövési technikák</span>
          </div>
        </div>
      </div>

      <div class="ideas-category videos">
        <h3>🎬 Videók</h3>
        <div class="idea-items">
          <div class="idea-item">
            <strong>Magyar történelem</strong>
            <span>Animációs sorozat gyerekeknek</span>
          </div>
          <div class="idea-item">
            <strong>Hagyományos receptek</strong>
            <span>Magyar ételek készítése</span>
          </div>
          <div class="idea-item">
            <strong>Néptánc oktatóvideók</strong>
            <span>Különböző táji táncok</span>
          </div>
        </div>
      </div>

      <div class="ideas-category camp">
        <h3>🏕️ Táborok</h3>
        <div class="idea-items">
          <div class="idea-item">
            <strong>Bükki Sátorhely</strong>
            <span>Erdei tisztás, 50 fő</span>
          </div>
          <div class="idea-item">
            <strong>Balatoni Tábor</strong>
            <span>Vízparti kemping, 100 fő</span>
          </div>
          <div class="idea-item">
            <strong>Hortobágyi Jurta</strong>
            <span>Pusztai szállás lovaglással</span>
          </div>
        </div>
      </div>
    </div>

    <div class="ideas-note">
      <span class="note-icon">💡</span>
      <p>Az ötletek a teljes listát az <strong>Ötletek</strong> fülön találod, ahol te is hozzáadhatsz újakat!</p>
    </div>
  </section>

  <!-- Összegzés szekció -->
  <section id="summary" class="about-section summary-section">
    <div class="summary-content">
      <h2>A Turul Platform nem "politikai app"</h2>
      <p class="summary-subtitle">Ez egy <strong>közösségépítő eszközrendszer</strong></p>
      
      <div class="summary-goals">
        <div class="goal-item">
          <span class="goal-icon">👨‍👩‍👧‍👦</span>
          <p>Képessé tenni a <strong>családokat</strong> a közös cselekvésre</p>
        </div>
        <div class="goal-item">
          <span class="goal-icon">🔗</span>
          <p>Képessé tenni a <strong>generációkat</strong> az együttműködésre</p>
        </div>
        <div class="goal-item">
          <span class="goal-icon">🏛️</span>
          <p>Képessé tenni a <strong>képviselőket</strong> a valós szolgálatra</p>
        </div>
        <div class="goal-item">
          <span class="goal-icon">🌾</span>
          <p>Képessé tenni a <strong>termelőket</strong> a helyi értékesítésre</p>
        </div>
      </div>

      <blockquote class="summary-quote">
        "Nem az a kérdés, hogy hány tagunk van, hanem hogy hány 
        <strong>aktív családunk</strong> van, akik generációkon átívelően 
        építik a közösséget."
      </blockquote>

      <div class="summary-tagline">
        <span class="tagline-icon">🦅</span>
        <span>Családok • Generációk • Közösség • Piactér</span>
      </div>
    </div>
  </section>
</div>

<style>
  .about-page {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  /* Hero Section */
  .hero-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    padding: 60px 40px;
    background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
    border-radius: 16px;
    margin-bottom: 40px;
    position: relative;
    overflow: hidden;
  }

  .hero-content {
    color: white;
    z-index: 1;
  }

  .hero-badge {
    display: inline-block;
    background: rgba(139, 92, 246, 0.3);
    color: #A78BFA;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 20px;
    letter-spacing: 1px;
  }

  .hero-content h1 {
    font-size: 42px;
    font-weight: 800;
    margin: 0 0 16px 0;
    line-height: 1.2;
  }

  .hero-subtitle {
    font-size: 18px;
    color: #9CA3AF;
    line-height: 1.6;
    margin-bottom: 32px;
  }

  .hero-stats {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .stat-number {
    font-size: 32px;
  }

  .stat-label {
    font-size: 12px;
    color: #9CA3AF;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .hero-visual {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .floating-icons {
    position: relative;
    width: 300px;
    height: 300px;
  }

  .floating-icons .icon {
    position: absolute;
    font-size: 40px;
    animation: float 6s ease-in-out infinite;
  }

  .icon.i1 { top: 10%; left: 20%; animation-delay: 0s; }
  .icon.i2 { top: 5%; right: 25%; animation-delay: 1s; }
  .icon.i3 { top: 40%; left: 5%; animation-delay: 2s; }
  .icon.i4 { top: 45%; right: 10%; animation-delay: 3s; }
  .icon.i5 { bottom: 20%; left: 25%; animation-delay: 4s; }
  .icon.i6 { bottom: 15%; right: 20%; animation-delay: 5s; }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }

  /* Section Styles */
  .about-section {
    background: white;
    border-radius: 16px;
    padding: 40px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .section-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .section-number {
    display: inline-block;
    background: linear-gradient(135deg, #8B5CF6, #A78BFA);
    color: white;
    font-size: 12px;
    font-weight: 700;
    padding: 6px 14px;
    border-radius: 12px;
    margin-bottom: 12px;
  }

  .section-header h2 {
    font-size: 32px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 8px 0;
  }

  .section-header p {
    font-size: 16px;
    color: #6B7280;
    margin: 0;
  }

  /* Philosophy Section */
  .philosophy-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    align-items: start;
  }

  .philosophy-text {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .philosophy-card {
    background: #F9FAFB;
    border-radius: 12px;
    padding: 24px;
    border-left: 4px solid #8B5CF6;
  }

  .card-icon {
    font-size: 28px;
    margin-bottom: 12px;
  }

  .philosophy-card h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 8px 0;
  }

  .philosophy-card p {
    font-size: 14px;
    color: #4B5563;
    margin: 0;
    line-height: 1.6;
  }

  .philosophy-chart h4 {
    font-size: 16px;
    font-weight: 600;
    color: #374151;
    margin: 0 0 16px 0;
    text-align: center;
  }

  .chart-container {
    width: 100%;
    height: 300px;
  }

  .chart-container.tall {
    height: 350px;
  }

  .chart-container.wide {
    height: 320px;
  }

  /* Pillars Section */
  .pillars-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }

  .pillar-card {
    background: #F9FAFB;
    border-radius: 16px;
    padding: 32px 24px;
    text-align: center;
    transition: transform 0.3s, box-shadow 0.3s;
  }

  .pillar-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }

  .pillar-card.family { border-top: 4px solid #8B5CF6; }
  .pillar-card.generation { border-top: 4px solid #10b981; }
  .pillar-card.community { border-top: 4px solid #3B82F6; }

  .pillar-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .pillar-card h3 {
    font-size: 20px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 8px 0;
    letter-spacing: 1px;
  }

  .pillar-subtitle {
    font-size: 14px;
    color: #6B7280;
    margin: 0 0 20px 0;
  }

  .pillar-features {
    list-style: none;
    padding: 0;
    margin: 0 0 20px 0;
    text-align: left;
  }

  .pillar-features li {
    font-size: 13px;
    color: #4B5563;
    padding: 8px 0;
    border-bottom: 1px solid #E5E7EB;
  }

  .pillar-features li:last-child {
    border-bottom: none;
  }

  .pillar-badge {
    display: inline-block;
    background: rgba(139, 92, 246, 0.1);
    color: #7C3AED;
    font-size: 12px;
    padding: 8px 16px;
    border-radius: 20px;
  }

  /* Generations Section */
  .generations-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    align-items: center;
  }

  .generations-description {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .gen-item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }

  .gen-badge {
    min-width: 60px;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
    color: white;
    text-align: center;
  }

  .gen-badge.bölcsek { background: #6B7280; }
  .gen-badge.építők { background: #8B5CF6; }
  .gen-badge.aktívak { background: #10b981; }
  .gen-badge.fiatalok { background: #3B82F6; }
  .gen-badge.gyermekek { background: #F59E0B; }

  .gen-text h4 {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 4px 0;
  }

  .gen-text p {
    font-size: 13px;
    color: #6B7280;
    margin: 0;
    line-height: 1.5;
  }

  /* Network Section */
  .network-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 40px;
    align-items: center;
  }

  .network-legend h4 {
    font-size: 16px;
    font-weight: 600;
    color: #374151;
    margin: 0 0 16px 0;
  }

  .legend-items {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    color: #4B5563;
  }

  .legend-item .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  /* Tools Section */
  .tools-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }

  .tool-card {
    background: #F9FAFB;
    border-radius: 16px;
    padding: 24px;
    transition: transform 0.3s;
  }

  .tool-card:hover {
    transform: translateY(-4px);
  }

  .tool-card.web { border-top: 4px solid #8B5CF6; }
  .tool-card.mobile { border-top: 4px solid #10b981; }
  .tool-card.blockchain { border-top: 4px solid #F59E0B; }

  .tool-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .tool-icon {
    font-size: 32px;
  }

  .tool-header h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
    flex: 1;
  }

  .tool-badge {
    font-size: 11px;
    background: rgba(139, 92, 246, 0.1);
    color: #7C3AED;
    padding: 4px 10px;
    border-radius: 12px;
  }

  .tool-features {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .tool-features li {
    font-size: 14px;
    color: #4B5563;
    padding: 10px 0;
    border-bottom: 1px solid #E5E7EB;
  }

  .tool-features li:last-child {
    border-bottom: none;
  }

  /* Marketplace Section */
  .marketplace-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }

  .marketplace-intro {
    font-size: 16px;
    color: #4B5563;
    line-height: 1.7;
    margin: 0 0 24px 0;
  }

  .marketplace-types {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
  }

  .type-card {
    flex: 1;
    background: #F9FAFB;
    border-radius: 12px;
    padding: 16px;
    text-align: center;
  }

  .type-icon {
    font-size: 28px;
    display: block;
    margin-bottom: 8px;
  }

  .type-name {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
  }

  .marketplace-benefits {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .benefit {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    background: #F0FDF4;
    border-radius: 12px;
  }

  .benefit-icon {
    font-size: 24px;
  }

  .benefit h4 {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 4px 0;
  }

  .benefit p {
    font-size: 12px;
    color: #6B7280;
    margin: 0;
  }

  .marketplace-chart h4 {
    font-size: 16px;
    font-weight: 600;
    color: #374151;
    margin: 0 0 16px 0;
    text-align: center;
  }

  /* Growth Section */
  .growth-content {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .growth-milestones {
    display: flex;
    justify-content: space-between;
    gap: 20px;
  }

  .milestone {
    flex: 1;
    text-align: center;
    position: relative;
  }

  .milestone::after {
    content: '';
    position: absolute;
    top: 24px;
    right: -50%;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, #8B5CF6, #A78BFA);
  }

  .milestone:last-child::after {
    display: none;
  }

  .milestone-marker {
    width: 48px;
    height: 48px;
    background: white;
    border: 3px solid #8B5CF6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin: 0 auto 12px;
    position: relative;
    z-index: 1;
  }

  .milestone h4 {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 4px 0;
  }

  .milestone p {
    font-size: 12px;
    color: #6B7280;
    margin: 0;
  }

  /* Spiritual Section */
  .spiritual-section {
    background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
  }

  .spiritual-content {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .spiritual-intro {
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
  }

  .spiritual-lead {
    font-size: 16px;
    color: #4B5563;
    line-height: 1.8;
    margin: 0;
  }

  .spiritual-features {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  .spiritual-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .spiritual-card.daily { border-left: 4px solid #F59E0B; }
  .spiritual-card.children { border-left: 4px solid #EC4899; }
  .spiritual-card.prayer { border-left: 4px solid #8B5CF6; }
  .spiritual-card.podcast { border-left: 4px solid #10B981; }

  .spiritual-icon {
    font-size: 32px;
    margin-bottom: 12px;
  }

  .spiritual-card h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 8px 0;
  }

  .spiritual-card p {
    font-size: 14px;
    color: #4B5563;
    line-height: 1.6;
    margin: 0 0 16px 0;
  }

  .spiritual-example {
    background: #FFFBEB;
    border-radius: 8px;
    padding: 12px;
    font-size: 14px;
    color: #92400E;
  }

  .spiritual-example em {
    display: block;
    margin-bottom: 4px;
  }

  .spiritual-example span {
    font-size: 12px;
    color: #B45309;
  }

  .spiritual-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .spiritual-list li {
    padding: 8px 0;
    font-size: 14px;
    color: #4B5563;
    border-bottom: 1px solid #F3F4F6;
  }

  .spiritual-list li:last-child {
    border-bottom: none;
  }

  .liturgical-seasons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .season {
    font-size: 12px;
    padding: 6px 12px;
    border-radius: 16px;
    background: #F3F4F6;
    color: #374151;
  }

  .season.advent { background: #EDE9FE; color: #5B21B6; }
  .season.christmas { background: #FEF3C7; color: #92400E; }
  .season.lent { background: #FCE7F3; color: #9D174D; }
  .season.easter { background: #ECFDF5; color: #065F46; }
  .season.pentecost { background: #DBEAFE; color: #1E40AF; }

  .spiritual-philosophy {
    background: white;
    border-radius: 16px;
    padding: 24px;
    text-align: center;
  }

  .spiritual-philosophy h4 {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 12px 0;
  }

  .spiritual-philosophy > p {
    font-size: 14px;
    color: #4B5563;
    line-height: 1.7;
    max-width: 700px;
    margin: 0 auto 24px;
  }

  .philosophy-tracks {
    display: flex;
    justify-content: center;
    gap: 24px;
    flex-wrap: wrap;
  }

  .track {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 16px 24px;
    background: #F9FAFB;
    border-radius: 12px;
  }

  .track-icon {
    font-size: 24px;
  }

  .track-label {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
  }

  .track-content {
    font-size: 12px;
    color: #6B7280;
  }

  /* Ideas Section */
  .ideas-section {
    background: #F9FAFB;
  }

  .ideas-showcase {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 24px;
  }

  .ideas-category {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  }

  .ideas-category.culture { border-top: 3px solid #8B5CF6; }
  .ideas-category.science { border-top: 3px solid #10B981; }
  .ideas-category.literature { border-top: 3px solid #F59E0B; }
  .ideas-category.craft { border-top: 3px solid #3B82F6; }
  .ideas-category.videos { border-top: 3px solid #EC4899; }
  .ideas-category.camp { border-top: 3px solid #F97316; }

  .ideas-category h3 {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 16px 0;
  }

  .idea-items {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .idea-item {
    padding: 12px;
    background: #F9FAFB;
    border-radius: 8px;
  }

  .idea-item strong {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 4px;
  }

  .idea-item span {
    font-size: 12px;
    color: #6B7280;
  }

  .ideas-note {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 16px;
    background: #EFF6FF;
    border-radius: 12px;
    text-align: center;
  }

  .note-icon {
    font-size: 24px;
  }

  .ideas-note p {
    font-size: 14px;
    color: #1E40AF;
    margin: 0;
  }

  /* Summary Section */
  .summary-section {
    background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
    color: white;
    text-align: center;
  }

  .summary-content h2 {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 8px 0;
  }

  .summary-subtitle {
    font-size: 18px;
    opacity: 0.9;
    margin: 0 0 40px 0;
  }

  .summary-goals {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 40px;
  }

  .goal-item {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 24px 16px;
  }

  .goal-icon {
    font-size: 36px;
    display: block;
    margin-bottom: 12px;
  }

  .goal-item p {
    font-size: 14px;
    margin: 0;
    line-height: 1.5;
  }

  .summary-quote {
    font-size: 18px;
    font-style: italic;
    max-width: 700px;
    margin: 0 auto 32px;
    padding: 24px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    line-height: 1.6;
  }

  .summary-tagline {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 1px;
  }

  .tagline-icon {
    font-size: 28px;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .hero-section {
      grid-template-columns: 1fr;
      text-align: center;
    }

    .hero-visual {
      display: none;
    }

    .philosophy-content,
    .generations-content,
    .network-content,
    .marketplace-content {
      grid-template-columns: 1fr;
    }

    .pillars-grid,
    .tools-grid {
      grid-template-columns: 1fr;
    }

    .summary-goals {
      grid-template-columns: repeat(2, 1fr);
    }

    .spiritual-features {
      grid-template-columns: 1fr;
    }

    .ideas-showcase {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 640px) {
    .hero-section {
      padding: 40px 20px;
    }

    .hero-content h1 {
      font-size: 28px;
    }

    .about-section {
      padding: 24px 16px;
    }

    .section-header h2 {
      font-size: 24px;
    }

    .growth-milestones {
      flex-direction: column;
    }

    .milestone::after {
      display: none;
    }

    .summary-goals {
      grid-template-columns: 1fr;
    }

    .marketplace-benefits {
      grid-template-columns: 1fr;
    }

    .ideas-showcase {
      grid-template-columns: 1fr;
    }

    .philosophy-tracks {
      flex-direction: column;
    }
  }
</style>
