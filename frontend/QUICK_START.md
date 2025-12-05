# Társadalom Dashboard - Quick Start Guide

## 🎯 What You're Seeing

The Társadalom Community Activity Dashboard is an interactive visualization of community cultural engagement across Hungary.

---

## 📍 The Three Main Sections

### 1. LEFT: Interactive Hungary Map
```
┌─────────────────────────────┐
│                             │
│    🗺️ HUNGARY MAP            │
│                             │
│  • Purple outline = Hungary │
│  • Colored circles = Cities │
│  • Numbers = Event count    │
│                             │
│  Color Legend:              │
│  🟢 Very High Activity       │
│  🟡 High Activity            │
│  🟠 Moderate Activity        │
│  🔴 Low Activity             │
│                             │
└─────────────────────────────┘
```

**6 Major Cities:**
- 🏛️ **Budapest** (Center) - Capital, highest activity
- 📍 **Debrecen** (East) - Second largest
- 📍 **Szeged** (South) - Cultural hub
- 📍 **Pécs** (Southwest) - Historical city
- 📍 **Miskolc** (North) - Industrial center
- 📍 **Győr** (West) - Gateway city

---

### 2. TOP-RIGHT: 14-Day Activity Chart
```
┌────────────────────────────────┐
│  14-Day Activity Trend        │
├────────────────────────────────┤
│                                │
│  📊 STACKED BARS               │
│  (5 Cultural Movement Types)   │
│                                │
│  📈 LINE #1 (Purple)           │
│  = Total Events/Day            │
│                                │
│  📈 LINE #2 (Pink)             │
│  = Active Participants/Day     │
│                                │
│  🖱️ Interactive:               │
│  • Click legend to toggle      │
│  • Hover for exact numbers     │
│  • Responsive resize           │
│                                │
└────────────────────────────────┘
```

---

### 3. BOTTOM-RIGHT: City Details Panel
```
┌────────────────────────────────┐
│ 📍 Budapest                    │
│ Central Hungary                │
├────────────────────────────────┤
│ Overview:                      │
│ • Population: 1,685,342        │
│ • Events (30d): 47             │
│ • Participation: 65%           │
│ • Total Participants: 2,845    │
│                                │
│ Engagement: 🟢 Very High       │
│                                │
│ Cultural Movements (14 days):  │
│ 🔴 Arts & Culture: 43 events   │
│    Theater, music, arts        │
│                                │
│ 🔵 Civic Engagement: 31 events │
│    Community organizing        │
│                                │
│ 🟢 Educational: 52 events      │
│    Workshops, seminars         │
│                                │
│ 🟣 Wellness: 38 events         │
│    Sports, health, meditation  │
│                                │
│ 🟡 Environmental: 24 events    │
│    Green initiatives           │
│                                │
└────────────────────────────────┘
```

---

## 🎮 How to Interact

### Select a City
**Option 1:** Click city marker on map
```
Map → Click colored circle → Popup appears
→ Click "View Details" button
```

**Option 2:** Click marker directly
```
Map → Click any city marker
→ Chart and panel auto-update
```

### Explore the Chart
```
Chart → Hover over bars/lines
      → See exact numbers in tooltip
      
Chart Legend → Click any movement type
            → Toggle visibility on/off
```

### Zoom and Pan Map
```
Map → Scroll wheel = Zoom in/out
   → Click + drag = Pan around
   → Use controls = Reset view
```

---

## 📊 Understanding the Data

### What Each City Shows

**Population**: How many people live in the city

**Events (30 days)**: Number of cultural/community events organized in the past month

**Participation Rate**: Percentage of population actively engaged (20-80%)

**Engagement Level**: Overall activity classification
- 🟢 **Very High** (75%+): Thriving community
- 🟡 **High** (50-75%): Strong engagement
- 🟠 **Moderate** (25-50%): Developing activity
- 🔴 **Low** (<25%): Need for growth

**Participants**: Sum of people across all 14 days of events

### The 5 Movement Categories

1. **Arts & Culture** 🎭
   - Theater productions, concerts, art exhibitions
   - Visual arts workshops and performances

2. **Civic Engagement** 🤝
   - Community organizing meetings
   - Volunteering and activism events
   - Local governance participation

3. **Educational** 📚
   - Seminars and workshops
   - Learning circles
   - Skill-building activities

4. **Wellness** 💪
   - Sports and fitness classes
   - Health seminars
   - Meditation and wellness circles

5. **Environmental** 🌱
   - Green initiatives
   - Sustainability projects
   - Environmental education

---

## 💡 Key Insights You Can Derive

### By City
- Which city has the most cultural activity?
- Which cities are underperforming?
- What types of events dominate each area?

### By Movement Category
- Which cultural movement is most popular?
- How do patterns differ across cities?
- Where are people most engaged?

### Trends
- Is activity increasing day-by-day?
- Which days have peak participation?
- Are certain categories growing?

---

## 🔄 How Reactivity Works

1. **Click a city** on the map
2. **Stored value updates** - which city is selected
3. **All connected displays update automatically**:
   - Chart redraws with new city's data
   - Panel refreshes with new metrics
   - No page reload needed!

---

## 🛠️ Technical Stack

**What makes this fast:**
- ⚡ **Svelte** - Reactive UI framework
- 🚀 **Vite** - Lightning-fast development
- 🗺️ **Leaflet** - Lightweight mapping
- 📊 **ECharts** - Powerful visualization
- 🔷 **TypeScript** - Type safety

**Running locally:**
- Development Server: `http://localhost:5173`
- Auto-reload on code changes
- Browser DevTools for debugging

---

## 📱 Responsive Design

### Desktop (Large Screens)
```
┌──────────────┬──────────────┐
│              │              │
│              ├──────────────┤
│   Map        │ Chart        │
│              ├──────────────┤
│              │ Panel        │
│              │              │
└──────────────┴──────────────┘
```

### Tablet/Mobile (Small Screens)
```
┌──────────────┐
│              │
│   Map        │
│              │
├──────────────┤
│              │
│ Chart        │
│              │
├──────────────┤
│              │
│ Panel        │
│              │
└──────────────┘
```

---

## 🎨 Color Scheme

| Element | Color | Meaning |
|---------|-------|---------|
| 🟢 Green Badge | #22C55E | Very high engagement |
| 🟡 Yellow Badge | #FBBF24 | High engagement |
| 🟠 Orange Badge | #F97316 | Moderate engagement |
| 🔴 Red Badge | #EF4444 | Low engagement |
| 🟣 Purple Outline | #8B5CF6 | Hungary boundary |
| Chart Background | White | Clean interface |
| Page Background | Light Gray | Professional look |

---

## 🚀 Getting Started

### If Server is Running
1. Open browser: `http://localhost:5173`
2. Start interacting immediately
3. No login required (demo mode)

### If Server Stopped
```bash
cd frontend
npm run dev
# Opens automatically in browser
```

---

## 📝 Sample Scenarios

### Scenario 1: Compare Cities
1. Click **Budapest** on map
2. Note chart and engagement level
3. Click **Szeged** on map
4. Compare the two cities' activity patterns

### Scenario 2: Find Low Activity Areas
1. Look at map - identify 🔴 red markers
2. Click red marker
3. Review why engagement is low
4. Explore event types in panel

### Scenario 3: Analyze Movement Types
1. Open chart
2. Click "Environmental" in legend to hide others
3. See which cities focus on environmental activities
4. Notice daily trends for this category

---

## ❓ FAQ

**Q: Where does the data come from?**
A: Mock data generated randomly for demonstration purposes. Real deployment would connect to a backend database.

**Q: Can I change the cities?**
A: Yes! Modify `src/data/mockDataGenerator.ts` to add/remove/modify cities.

**Q: How often does data update?**
A: Currently static. Real version would implement real-time updates from backend.

**Q: Is this mobile-friendly?**
A: Yes! The dashboard is responsive and works on tablets and phones.

**Q: Can I export the data?**
A: Currently view-only. Export feature could be added to future version.

---

## 🔮 What's Coming Next

### Phase 2 Enhancements
- ✨ Backend API integration (Node.js/Python)
- ✨ DID-based user authentication
- ✨ Blockchain wallet integration
- ✨ Real event data synchronization
- ✨ User account and preferences
- ✨ More detailed analytics
- ✨ Mobile native app

---

## 📞 Support

For issues or questions:
1. Check browser console for errors (F12)
2. Ensure dev server is running on port 5173
3. Try clearing browser cache (Ctrl+Shift+Delete)
4. Restart development server if needed

---

**Enjoy exploring the Társadalom Community Activity Dashboard! 🎉**
