<script lang="ts">
  import { onMount } from 'svelte';
  import * as echarts from 'echarts';
  import { 
    ACTIVITY_CATEGORIES, 
    FAKULTACIO_TYPES,
    type ActivityCategory 
  } from '../types/activity.types';
  import { 
    generateUnnepData,
    generatePajtasTaborData,
    generateOlvasokorData,
    generateEloadasokData,
    generateFakultacioData,
    getUnnepDataForCity,
    getPajtasTaborDataForCity,
    getOlvasokorDataForCity,
    getEloadasokDataForCity,
    getFakultacioDataForCity,
    ACTIVITY_CITIES,
    SAMPLE_BOOKS
  } from '../data/activityMockData';
  import { selectedCityId } from '../stores/mockDataStore';

  let chartContainer: HTMLDivElement;
  let chart: echarts.ECharts;
  let selectedCategory: ActivityCategory = 'unnep';
  let currentCityId: string | null = null;

  // Subscribe to city selection from map
  selectedCityId.subscribe((cityId) => {
    currentCityId = cityId || null;
    if (chart) {
      updateChart();
    }
  });

  // Get city name for display
  function getCityName(cityId: string | null): string {
    if (!cityId) return 'Országos összesítés';
    const city = ACTIVITY_CITIES.find(c => c.id === cityId);
    return city ? city.name : 'Ismeretlen város';
  }

  // Handle city selection change from dropdown
  function handleCityChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    currentCityId = value === '' ? null : value;
    selectedCityId.set(value || 'budapest');
    updateChart();
  }

  function getChartOption(): echarts.EChartsOption {
    switch (selectedCategory) {
      case 'unnep':
        return getUnnepOption();
      case 'pajtas_tabor':
        return getPajtasTaborOption();
      case 'olvasokor':
        return getOlvasokorOption();
      case 'eloadasok':
        return getEloadasokOption();
      case 'fakultacio':
        return getFakultacioOption();
      default:
        return getUnnepOption();
    }
  }

  function getUnnepOption(): echarts.EChartsOption {
    const unnepData = getUnnepDataForCity(currentCityId);
    const years = unnepData.map(d => String(d.year));
    const holidays = [
      { name: '🎖️ Március 15.', key: 'march15', color: '#dc2626' },
      { name: '👑 Szent István Nap', key: 'istvan', color: '#f97316' },
      { name: '🇭🇺 Október 23.', key: 'october23', color: '#16a34a' }
    ];

    const series = holidays.map((h, idx) => ({
      name: h.name,
      type: 'bar' as const,
      data: unnepData.map(d => d.holidays[idx].participants),
      itemStyle: { color: h.color, borderRadius: [4, 4, 0, 0] }
    }));

    const eventLine = {
      name: '📊 Összes esemény',
      type: 'line' as const,
      yAxisIndex: 1,
      data: unnepData.map(d => d.holidays.reduce((sum, h) => sum + h.events, 0)),
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: { color: '#8B5CF6' },
      lineStyle: { width: 3, color: '#8B5CF6' }
    };

    const locationText = getCityName(currentCityId);

    return {
      title: {
        text: '🇭🇺 Nemzeti Ünnepek - Éves Részvétel',
        subtext: locationText,
        left: 'center',
        textStyle: { color: '#1f2937', fontSize: 16, fontWeight: 'bold' },
        subtextStyle: { color: '#6b7280', fontSize: 12 }
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          let result = `<strong>${params[0].axisValue}</strong><br/>`;
          params.forEach((p: any) => {
            if (p.seriesType === 'bar') {
              result += `${p.seriesName}: <strong>${p.value.toLocaleString('hu-HU')}</strong> résztvevő<br/>`;
            } else {
              result += `${p.seriesName}: <strong>${p.value}</strong> esemény<br/>`;
            }
          });
          return result;
        }
      },
      legend: { data: [...holidays.map(h => h.name), '📊 Összes esemény'], top: 55 },
      grid: { left: '3%', right: '4%', bottom: '10%', top: '28%', containLabel: true },
      xAxis: { type: 'category', data: years },
      yAxis: [
        { type: 'value', name: 'Résztvevők', axisLabel: { formatter: (v: number) => v >= 1000 ? (v/1000).toFixed(0) + 'K' : v.toString() }},
        { type: 'value', name: 'Események', position: 'right', splitLine: { show: false }}
      ],
      series: [...series, eventLine]
    };
  }

  function getPajtasTaborOption(): echarts.EChartsOption {
    const yearlyData = getPajtasTaborDataForCity(currentCityId);
    const years = yearlyData.map(d => String(d.year));
    const ageGroups = [
      { name: '👶 6-10 éves', key: '6-10', color: '#22c55e' },
      { name: '🧒 10-14 éves', key: '10-14', color: '#3b82f6' },
      { name: '👦 14-18 éves', key: '14-18', color: '#f97316' }
    ];

    const series = ageGroups.map(ag => ({
      name: ag.name,
      type: 'bar' as const,
      stack: 'total',
      data: yearlyData.map(d => d.byAgeGroup[ag.key as '6-10' | '10-14' | '14-18']),
      itemStyle: { color: ag.color }
    }));

    const campLine = {
      name: '⛺ Táborok száma',
      type: 'line' as const,
      yAxisIndex: 1,
      data: yearlyData.map(d => d.totalCamps),
      smooth: true,
      symbol: 'diamond',
      symbolSize: 10,
      itemStyle: { color: '#8b5cf6' },
      lineStyle: { width: 3, color: '#8b5cf6' }
    };

    const locationText = getCityName(currentCityId);

    return {
      title: {
        text: '⛺ Pajtás Tábor - Gyermek Beiratkozások',
        subtext: locationText,
        left: 'center',
        textStyle: { color: '#1f2937', fontSize: 16, fontWeight: 'bold' },
        subtextStyle: { color: '#6b7280', fontSize: 12 }
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          let result = `<strong>${params[0].axisValue}</strong><br/>`;
          let total = 0;
          params.forEach((p: any) => {
            if (p.seriesType === 'bar') {
              result += `${p.seriesName}: <strong>${p.value.toLocaleString('hu-HU')}</strong> gyermek<br/>`;
              total += p.value;
            } else {
              result += `${p.seriesName}: <strong>${p.value}</strong><br/>`;
            }
          });
          result += `<strong>Összesen: ${total.toLocaleString('hu-HU')} gyermek</strong>`;
          return result;
        }
      },
      legend: { data: [...ageGroups.map(a => a.name), '⛺ Táborok száma'], top: 55 },
      grid: { left: '3%', right: '4%', bottom: '10%', top: '28%', containLabel: true },
      xAxis: { type: 'category', data: years },
      yAxis: [
        { type: 'value', name: 'Beiratkozott gyermekek' },
        { type: 'value', name: 'Táborok', position: 'right', splitLine: { show: false }}
      ],
      series: [...series, campLine]
    };
  }

  function getOlvasokorOption(): echarts.EChartsOption {
    const yearlyData = getOlvasokorDataForCity(currentCityId);
    const years = yearlyData.map(d => String(d.year));
    const locationText = getCityName(currentCityId);

    return {
      title: {
        text: '📚 Olvasókör - Irodalmi Részvétel',
        subtext: locationText,
        left: 'center',
        textStyle: { color: '#1f2937', fontSize: 16, fontWeight: 'bold' },
        subtextStyle: { color: '#6b7280', fontSize: 12 }
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          let result = `<strong>${params[0].axisValue}</strong><br/>`;
          params.forEach((p: any) => {
            const unit = p.seriesName.includes('Olvasók') ? ' fő' : 
                        p.seriesName.includes('könyv') ? ' könyv' : '';
            result += `${p.seriesName}: <strong>${p.value.toLocaleString('hu-HU')}${unit}</strong><br/>`;
          });
          return result;
        }
      },
      legend: { data: ['📖 Olvasók', '📕 Olvasott könyvek', '🗓️ Foglalkozások'], top: 55 },
      grid: { left: '3%', right: '4%', bottom: '10%', top: '28%', containLabel: true },
      xAxis: { type: 'category', data: years },
      yAxis: [
        { type: 'value', name: 'Személyek / Könyvek' },
        { type: 'value', name: 'Foglalkozások', position: 'right', splitLine: { show: false }}
      ],
      series: [
        {
          name: '📖 Olvasók',
          type: 'bar',
          data: yearlyData.map(d => d.totalReaders),
          itemStyle: { color: '#10b981', borderRadius: [4, 4, 0, 0] }
        },
        {
          name: '📕 Olvasott könyvek',
          type: 'bar',
          data: yearlyData.map(d => d.booksRead),
          itemStyle: { color: '#f59e0b', borderRadius: [4, 4, 0, 0] }
        },
        {
          name: '🗓️ Foglalkozások',
          type: 'line',
          yAxisIndex: 1,
          data: yearlyData.map(d => d.totalSessions),
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: { color: '#8b5cf6' },
          lineStyle: { width: 3 }
        }
      ]
    };
  }

  function getEloadasokOption(): echarts.EChartsOption {
    const yearlyData = getEloadasokDataForCity(currentCityId);
    const years = yearlyData.map(d => String(d.year));
    const topics = [
      { name: '📜 Történelem', key: 'történelem', color: '#dc2626' },
      { name: '🎭 Identitás', key: 'identitás', color: '#3b82f6' },
      { name: '🎪 Hagyomány', key: 'hagyomány', color: '#22c55e' },
      { name: '🤝 Közösség', key: 'közösség', color: '#f97316' },
      { name: '👨‍👩‍👧 Család', key: 'család', color: '#8b5cf6' }
    ];

    const series = topics.map(t => ({
      name: t.name,
      type: 'bar' as const,
      stack: 'views',
      data: yearlyData.map(d => d.byTopic[t.key as keyof typeof d.byTopic]),
      itemStyle: { color: t.color }
    }));

    const videoLine = {
      name: '🎬 Videók száma',
      type: 'line' as const,
      yAxisIndex: 1,
      data: yearlyData.map(d => d.totalVideos),
      smooth: true,
      symbol: 'rect',
      symbolSize: 10,
      itemStyle: { color: '#1f2937' },
      lineStyle: { width: 3, color: '#1f2937' }
    };

    const locationText = getCityName(currentCityId);

    return {
      title: {
        text: '🎬 Előadások - Videó Megtekintések',
        subtext: locationText,
        left: 'center',
        textStyle: { color: '#1f2937', fontSize: 16, fontWeight: 'bold' },
        subtextStyle: { color: '#6b7280', fontSize: 12 }
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          let result = `<strong>${params[0].axisValue}</strong><br/>`;
          let totalViews = 0;
          params.forEach((p: any) => {
            if (p.seriesType === 'bar') {
              result += `${p.seriesName}: <strong>${p.value.toLocaleString('hu-HU')}</strong> megtekintés<br/>`;
              totalViews += p.value;
            } else {
              result += `${p.seriesName}: <strong>${p.value}</strong><br/>`;
            }
          });
          result += `<strong>Összes megtekintés: ${totalViews.toLocaleString('hu-HU')}</strong>`;
          return result;
        }
      },
      legend: { data: [...topics.map(t => t.name), '🎬 Videók száma'], top: 55 },
      grid: { left: '3%', right: '4%', bottom: '10%', top: '28%', containLabel: true },
      xAxis: { type: 'category', data: years },
      yAxis: [
        { type: 'value', name: 'Megtekintések', axisLabel: { formatter: (v: number) => v >= 1000 ? (v/1000).toFixed(0) + 'K' : v.toString() }},
        { type: 'value', name: 'Videók', position: 'right', splitLine: { show: false }}
      ],
      series: [...series, videoLine]
    };
  }

  function getFakultacioOption(): echarts.EChartsOption {
    const yearlyData = getFakultacioDataForCity(currentCityId);
    const years = yearlyData.map(d => String(d.year));
    
    // Group by category: sport, tánc, tudomány, zene
    const categories = [
      { name: '🥋 Küzdősport', types: ['kuzdosport'], color: '#ef4444' },
      { name: '💃 Táncház', types: ['tanchaz'], color: '#f97316' },
      { name: '🔬 Tudomány', types: ['tudomanyos_klub'], color: '#3b82f6' },
      { name: '🎵 Zenei képzés', types: ['zongora', 'hegedu', 'furulya', 'fuvos', 'enek', 'egyeb_zene'], color: '#8b5cf6' }
    ];

    const series = categories.map(cat => ({
      name: cat.name,
      type: 'bar' as const,
      stack: 'total',
      data: yearlyData.map(d => {
        return cat.types.reduce((sum, t) => sum + (d.byType[t as keyof typeof d.byType] || 0), 0);
      }),
      itemStyle: { color: cat.color }
    }));

    const circleLine = {
      name: '🎓 Szakkörök száma',
      type: 'line' as const,
      yAxisIndex: 1,
      data: yearlyData.map(d => d.totalCircles),
      smooth: true,
      symbol: 'circle',
      symbolSize: 10,
      itemStyle: { color: '#16a34a' },
      lineStyle: { width: 3, color: '#16a34a' }
    };

    const locationText = getCityName(currentCityId);

    return {
      title: {
        text: '🎓 Fakultáció - Önképzőkörök',
        subtext: locationText,
        left: 'center',
        textStyle: { color: '#1f2937', fontSize: 16, fontWeight: 'bold' },
        subtextStyle: { color: '#6b7280', fontSize: 12 }
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          let result = `<strong>${params[0].axisValue}</strong><br/>`;
          let total = 0;
          params.forEach((p: any) => {
            if (p.seriesType === 'bar') {
              result += `${p.seriesName}: <strong>${p.value.toLocaleString('hu-HU')}</strong> résztvevő<br/>`;
              total += p.value;
            } else {
              result += `${p.seriesName}: <strong>${p.value}</strong><br/>`;
            }
          });
          result += `<strong>Összesen: ${total.toLocaleString('hu-HU')} résztvevő</strong>`;
          return result;
        }
      },
      legend: { data: [...categories.map(c => c.name), '🎓 Szakkörök száma'], top: 55 },
      grid: { left: '3%', right: '4%', bottom: '10%', top: '28%', containLabel: true },
      xAxis: { type: 'category', data: years },
      yAxis: [
        { type: 'value', name: 'Résztvevők' },
        { type: 'value', name: 'Szakkörök', position: 'right', splitLine: { show: false }}
      ],
      series: [...series, circleLine]
    };
  }

  function updateChart() {
    if (!chart) return;
    chart.setOption(getChartOption(), true);
  }

  function selectCategory(category: ActivityCategory) {
    selectedCategory = category;
    updateChart();
  }

  onMount(() => {
    chart = echarts.init(chartContainer, null, {
      renderer: 'canvas',
      useDirtyRect: true
    });
    updateChart();

    const handleResize = () => {
      chart?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
</script>

<div class="activity-chart-wrapper">
  <!-- Header with Category Switcher and City Filter -->
  <div class="chart-header">
    <!-- Category Switcher -->
    <div class="category-switcher">
      {#each ACTIVITY_CATEGORIES as cat}
        <button 
          class="category-btn" 
          class:active={selectedCategory === cat.id}
          on:click={() => selectCategory(cat.id)}
          title={cat.description}
        >
          <span class="emoji">{cat.emoji}</span>
          <span class="name">{cat.name}</span>
        </button>
      {/each}
    </div>

    <!-- City Filter -->
    <div class="city-filter">
      <label for="city-filter-select">📍 Város:</label>
      <select 
        id="city-filter-select" 
        value={currentCityId || ''}
        on:change={handleCityChange}
      >
        <option value="">🗺️ Országos összesítés</option>
        {#each ACTIVITY_CITIES as city}
          <option value={city.id}>{city.name}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Chart Container -->
  <div bind:this={chartContainer} class="chart-container"></div>
</div>

<style>
  .activity-chart-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .chart-header {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 16px;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-bottom: 1px solid #e5e7eb;
  }

  .category-switcher {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .city-filter {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding-top: 8px;
    border-top: 1px solid #e5e7eb;
  }

  .city-filter label {
    font-size: 14px;
    font-weight: 500;
    color: #4b5563;
  }

  .city-filter select {
    padding: 6px 12px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    font-size: 14px;
    color: #1f2937;
    cursor: pointer;
    min-width: 180px;
  }

  .city-filter select:hover {
    border-color: #3b82f6;
  }

  .city-filter select:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .category-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: 2px solid #e5e7eb;
    border-radius: 24px;
    background: white;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    font-weight: 500;
    color: #4b5563;
  }

  .category-btn:hover {
    border-color: #3b82f6;
    background: #eff6ff;
    transform: translateY(-1px);
  }

  .category-btn.active {
    border-color: #2563eb;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
  }

  .category-btn .emoji {
    font-size: 18px;
  }

  .category-btn .name {
    white-space: nowrap;
  }

  .chart-container {
    flex: 1;
    width: 100%;
    min-height: 400px;
  }
</style>
