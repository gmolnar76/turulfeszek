# 🎯 Társadalom - Community Cohesion Platform
## Interactive Community Activity Dashboard for Hungary

---

## ✨ What This Is

A modern, interactive web dashboard that visualizes community cultural engagement and activity levels across Hungarian cities. Built with the latest web technologies (Svelte, Vite, Leaflet, ECharts), it provides real-time insights into community movements, participation rates, and cultural events.

**Status**: ✅ **LIVE** at `http://localhost:5173`

---

## 🎨 Visual Overview

```
┌─ HUNGARY MAP ────────────┬─ ACTIVITY CHART ──────┐
│                          │                        │
│  🟢 Budapest (capital)   │  📊 14-Day Trend      │
│  🟠 Debrecen (east)      │  📈 Events/Day        │
│  🟡 Szeged (south)       │  📈 Participants/Day  │
│  🟠 Pécs (southwest)     │  🏆 Movement Types    │
│  🔴 Miskolc (north)      │  🎨 Interactive       │
│  🟠 Győr (west)          ├─────────────────────┤
│                          │ CITY DETAILS PANEL    │
│  Click any city marker   │ • Population          │
│  to view details →       │ • Engagement Level    │
│                          │ • Participation Rate  │
│                          │ • Event Breakdown     │
└──────────────────────────┴─────────────────────┘
```

---

## 🚀 Quick Start

### Requirements
- Node.js 16+ 
- npm or yarn

### Installation & Running
```bash
cd frontend
npm install          # Already complete
npm run dev         # Starts development server
```

### Access
Open browser to: **http://localhost:5173**

---

## 📁 Project Structure

```
frontend/
├── 📄 package.json              # Dependencies
├── 📄 vite.config.ts           # Vite configuration  
├── 📄 svelte.config.js         # Svelte settings
├── 📄 tsconfig.json            # TypeScript config
├── 📄 index.html               # HTML entry
├── 📚 IMPLEMENTATION.md         # Full documentation
├── 📚 QUICK_START.md           # User guide
│
├── 🗂️ public/
│   └── 📂 geojson/
│       ├── hungary-boundary.geojson
│       ├── carpathian-basin.geojson
│       └── cities-data.geojson
│
└── 🗂️ src/
    ├── 📄 main.ts              # Vite entry point
    ├── 📄 App.svelte           # Root component
    │
    ├── 📂 components/
    │   ├── Dashboard.svelte    # Main layout (3-panel)
    │   ├── HungaryMap.svelte   # Leaflet map
    │   ├── ActivityChart.svelte # ECharts visualization
    │   └── CityPanel.svelte    # City details panel
    │
    ├── 📂 stores/
    │   └── mockDataStore.ts    # Svelte reactive stores
    │
    ├── 📂 data/
    │   └── mockDataGenerator.ts # Mock data generation
    │
    └── 📂 types/
        └── models.ts           # TypeScript interfaces
```

---

## 🎯 Core Features

### 1. Interactive Hungary Map 🗺️
- Real coordinates for 6 major Hungarian cities
- Color-coded engagement levels:
  - 🟢 Very high activity
  - 🟡 High activity  
  - 🟠 Moderate activity
  - 🔴 Low activity
- Event count badges on each city
- Clickable markers with detailed popups
- OpenStreetMap tiles with Leaflet
- Zoom and pan controls

### 2. 14-Day Activity Chart 📊
- Apache ECharts visualization
- Stacked bar chart for 5 movement categories
- Dual-axis line charts (events + participants)
- Interactive legend (click to toggle)
- Hover tooltips with precise values
- Auto-resizes with window
- Canvas renderer for performance

### 3. City Details Panel 📍
- Population statistics
- Engagement metrics
- Participation rates (0-100%)
- Cultural movement breakdown
- Event counts per category
- Color-coded category indicators
- Scrollable for mobile

### 4. Reactive State Management ⚡
- Svelte stores for centralized state
- Writable stores: selectedCityId, allCitiesData, movementCategories
- Derived stores: auto-compute when dependencies change
- Full TypeScript type safety
- Zero boilerplate reactivity

### 5. Mock Data System 🎲
- 6 pre-configured Hungarian cities
- Realistic coordinates and demographics
- 14-day historical activity trends
- 5 cultural movement categories
- Randomized but consistent data
- Regenerated on each app load

---

## 🔄 How It Works

### Data Flow
```
1. User clicks city marker on map
   ↓
2. selectedCityId store updates
   ↓
3. Derived stores auto-recompute:
   - selectedCityData
   - activityTrendData
   - selectedCityEngagement
   ↓
4. Connected components re-render:
   - ActivityChart updates with new trend
   - CityPanel refreshes with new metrics
```

### Component Hierarchy
```
App.svelte
  └─ Dashboard.svelte (layout)
     ├─ HungaryMap.svelte (map + markers)
     ├─ ActivityChart.svelte (chart visualization)
     └─ CityPanel.svelte (city details)
```

---

## 🛠️ Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Svelte | 4.2.0 | Reactive UI |
| **Build** | Vite | 5.0.0 | Fast dev/build |
| **Language** | TypeScript | 5.3.0 | Type safety |
| **Mapping** | Leaflet | 1.9.4 | Interactive maps |
| **Charts** | Apache ECharts | 6.0.0 | Data viz |
| **State** | Svelte Stores | Built-in | Reactivity |
| **Tiles** | OpenStreetMap | Latest | Map background |

---

## 🎮 User Interactions

### Select a City
```
Option 1: Click city marker on map
          → Popup appears
          → Click "View Details"

Option 2: Click marker directly
          → Updates immediately
```

### Explore Chart
```
Hover over bars → See exact numbers
Click legend items → Toggle visibility
Scroll → Zoom in/out
Drag → Pan map
```

### Responsive Design
```
Desktop: 3-panel grid (map left, chart/panel right)
Tablet:  Stacked layout (map, then chart, then panel)
Mobile:  Single column (vertical stack)
```

---

## 📊 Data Structure

### Cities (6 Total)
```typescript
interface City {
  id: string                    // 'budapest', 'debrecen', etc.
  name: string                  // Display name
  coordinates: [number, number] // [longitude, latitude]
  population: number            // Actual population
  region: string               // Regional classification
  eventCount: number           // Events in past 30 days
  participationRate: number    // 0-100 percentage
  engagementLevel: string      // 'low'|'medium'|'high'|'very_high'
  activityTrend: ActivityDataPoint[] // 14-day history
}
```

### Activity Data Points
```typescript
interface ActivityDataPoint {
  date: string                         // ISO date YYYY-MM-DD
  eventCount: number                   // Events that day
  activeParticipants: number          // Total participants
  movementCategories: Record<string, number> // Count per category
}
```

### Movement Categories (5 Types)
1. Arts & Culture (🎭 Red)
2. Civic Engagement (🤝 Teal)
3. Educational (📚 Blue)
4. Wellness (💪 Green)
5. Environmental (🌱 Yellow)

---

## 🔧 Configuration

### Port
Default: `5173`
Change in `vite.config.ts`:
```typescript
server: {
  port: 3000  // Change here
}
```

### Mock Data
Edit `src/data/mockDataGenerator.ts` to:
- Add/remove cities
- Adjust activity ranges
- Modify movement categories
- Change engagement distributions

### Styling
Component styles are scoped in `<style>` blocks:
- Global styles in `App.svelte`
- Component-specific in each `.svelte` file
- CSS variables for theming
- Tailwind-ready structure

---

## 📈 Performance Optimizations

✅ **Canvas Renderer** - ECharts uses canvas for speed
✅ **Lazy Initialization** - Map loads on first render
✅ **Efficient Stores** - Subscriptions cleaned up automatically
✅ **Tree-shakeable Deps** - Only import what's used
✅ **Responsive Resize** - Debounced window handlers
✅ **Vite Optimization** - Fast HMR and dev builds

---

## 🧪 Available Scripts

```bash
# Start development server (running)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check all files
npm run check
```

---

## 🚢 Deployment

### Build Production
```bash
npm run build
# Creates optimized dist/ folder
```

### Deploy to
- Vercel: `vercel deploy`
- Netlify: Connect GitHub repo
- Any static host: Use `dist/` folder

### Environment Variables
- Currently none needed for demo
- Add to `.env` for production API endpoints

---

## 🔐 Security & Privacy

### Current Implementation
- No backend connections (demo only)
- No user data storage
- No external API calls except map tiles
- Client-side only processing

### For Production
- Implement DID-based authentication
- Use encrypted APIs
- Store qualified IDs, not personal data
- Blockchain wallet integration
- End-to-end encryption

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
npx kill-port 5173
npm run dev
```

### Chart Not Rendering
- Clear browser cache (Ctrl+Shift+Delete)
- Restart dev server
- Check console for errors (F12)

### Map Not Loading
- Ensure internet connection (needs OSM tiles)
- Check network tab for failed requests
- Verify geojson files in public/geojson/

### TypeScript Errors
```bash
npm run check
# Shows all type errors
```

---

## 📚 Documentation

- **`IMPLEMENTATION.md`** - Technical deep dive
- **`QUICK_START.md`** - User interaction guide
- **`README.md`** - This file

---

## 🎯 Future Enhancements

### Phase 2 (Backend Integration)
- [ ] Node.js/Python backend
- [ ] Database (PostgreSQL/MongoDB)
- [ ] Real API endpoints
- [ ] DID authentication
- [ ] Blockchain wallet

### Phase 3 (Features)
- [ ] Event creation and management
- [ ] User profiles and qualifications
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Export data to CSV/PDF

### Phase 4 (Expansion)
- [ ] Mobile native app
- [ ] Wider geographic coverage
- [ ] Multi-language support
- [ ] Advanced search
- [ ] Predictive analytics

---

## 📞 Getting Help

1. **Browser Console** - F12 to see errors
2. **Check Docs** - Read IMPLEMENTATION.md
3. **Verify Setup** - npm run check
4. **Restart** - Kill process, npm run dev
5. **Clear Cache** - Ctrl+Shift+Delete then reload

---

## 📄 License

Part of the Társadalom Community Cohesion Platform
Contact: [organization details]

---

## ✅ Checklist: What's Implemented

### Frontend ✅
- [x] Svelte 4.2 + Vite 5.0 setup
- [x] TypeScript with strict mode
- [x] Responsive 3-panel dashboard layout
- [x] Interactive Leaflet map with 6 cities
- [x] Apache ECharts visualization
- [x] City details panel
- [x] Mock data generation system
- [x] Svelte reactive stores
- [x] HMR during development

### Data ✅
- [x] GeoJSON boundaries (Hungary, Carpathian Basin)
- [x] 6 city coordinates with metadata
- [x] 14-day activity trends per city
- [x] 5 cultural movement categories
- [x] Realistic engagement metrics
- [x] TypeScript type definitions

### UX/UI ✅
- [x] Color-coded engagement levels
- [x] Interactive tooltips and popups
- [x] Responsive mobile design
- [x] Smooth animations
- [x] Professional styling
- [x] Accessible contrast ratios

### DevOps ✅
- [x] Development server (port 5173)
- [x] Hot module reloading (HMR)
- [x] Production build configuration
- [x] Environment setup (.gitignore)
- [x] Type checking
- [x] Documentation

---

## 🎉 You're All Set!

The dashboard is **fully functional** and running. Start by:

1. Opening http://localhost:5173 in your browser
2. Clicking on different cities to explore
3. Hovering over chart elements for details
4. Reading QUICK_START.md for detailed usage

**Enjoy! 🚀**

---

**Built with ❤️ using Svelte, Vite, Leaflet, and ECharts**

*Társadalom Platform - Community Cohesion in Action*
