# Piactér (Marketplace) Implementáció

## Áttekintés

A Piactér funkció lehetővé teszi a közösség tagjai számára, hogy kerti terményeiket, házi készítésű termékeiket és használt tárgyaikat kínálják fel egymásnak. A rendszer támogatja az eladást, cserét és az ingyen elvihető tárgyak meghirdetését.

## Kategóriák

| Kategória | Kód | Emoji | Szín |
|-----------|-----|-------|------|
| Kerti termény | `garden_produce` | 🥬 | #4CAF50 |
| Házi készítésű | `homemade_goods` | 🍯 | #FF9800 |
| Növények | `plants` | 🌱 | #8BC34A |
| Tojás és tejtermékek | `eggs_dairy` | 🥚 | #FFC107 |
| Hús | `meat` | 🥩 | #F44336 |
| Méz és méhészet | `honey` | 🐝 | #FFB300 |
| Kerti eszközök | `tools` | 🔧 | #607D8B |
| Használt cikkek | `secondhand` | 📦 | #9E9E9E |
| Ruházat | `clothing` | 👕 | #E91E63 |
| Szolgáltatások | `services` | 🛠️ | #2196F3 |

## Típusok

- **Eladó** (`sell`): HUF árral
- **Csere** (`trade`): Barter, mit kér cserébe
- **Elvihető** (`give_away`): Ingyen

## Implementált fájlok

### Backend

```
backend/
├── types/
│   └── marketplace.types.ts     # Backend típusdefiníciók
└── routes/
    └── marketplace.routes.ts    # REST API végpontok
```

#### API Végpontok

| Metódus | Végpont | Leírás |
|---------|---------|--------|
| GET | `/api/marketplace/listings` | Hirdetések listázása (szűrőkkel) |
| GET | `/api/marketplace/listings/:id` | Hirdetés részletei |
| POST | `/api/marketplace/listings` | Új hirdetés létrehozása |
| PATCH | `/api/marketplace/listings/:id` | Hirdetés módosítása |
| DELETE | `/api/marketplace/listings/:id` | Hirdetés törlése |
| GET | `/api/marketplace/transactions` | Tranzakciók listázása |
| POST | `/api/marketplace/transactions` | Új tranzakció rögzítése |
| GET | `/api/marketplace/stats/city/:cityId` | Város statisztikák |
| GET | `/api/marketplace/stats/constituency/:id` | Körzet statisztikák |
| GET | `/api/marketplace/stats/overview` | Átfogó statisztikák |
| GET | `/api/marketplace/categories` | Kategóriák listája |

### Frontend (Web Dashboard)

```
frontend/src/
├── types/
│   └── marketplace.types.ts     # Típusdefiníciók és konstansok
├── data/
│   └── marketplaceMockData.ts   # Mock adatok fejlesztéshez
├── stores/
│   └── marketplaceStore.ts      # Svelte store-ok
└── components/
    ├── MarketplaceDashboard.svelte  # Piactér dashboard komponens
    └── Dashboard.svelte             # Módosítva: új "Piactér" fül
```

### Mobile (React Native)

```
mobile/src/
├── types/
│   ├── marketplace.types.ts     # Típusdefiníciók
│   └── index.ts                 # Módosítva: navigáció típusok
├── stores/
│   └── marketplaceStore.ts      # Zustand store
├── screens/
│   ├── MarketplaceScreen.tsx    # Főképernyő hirdetésekkel
│   ├── CreateListingScreen.tsx  # Hirdetés feladása
│   └── ListingDetailsScreen.tsx # Hirdetés részletek
└── navigation/
    ├── TabNavigator.tsx         # Módosítva: Piactér fül
    └── RootNavigator.tsx        # Módosítva: új screen-ek
```

## Web Dashboard funkciók

A `MarketplaceDashboard.svelte` komponens:

1. **Összefoglaló kártyák**
   - Aktív hirdetések száma
   - Aktív eladók száma
   - Heti tranzakciók
   - Havi tranzakciók

2. **Aktivitás trend**
   - SVG alapú vonaldiagram
   - Időszak váltó (hét/hónap/negyedév)
   - Legaktívabb nap és átlag

3. **Népszerű kategóriák**
   - Kategóriánkénti hirdetésszám
   - Vizuális sáv a részarányhoz

4. **Körzeti rangsor**
   - Települések rangsorolása aktivitás szerint
   - Hirdetések és tranzakciók száma

5. **Szezonális termékek**
   - Aktuális szezonban elérhető termékek
   - Szezon státusz jelzése

## Mobile app funkciók

### MarketplaceScreen
- Kategória szűrő chips
- Kereső mező
- Hirdetés kártyák grid nézetben
- FAB gomb új hirdetéshez

### CreateListingScreen
- Kategória választó
- Típus választó (eladó/csere/elvihető)
- Ár vagy csere tárgy megadása
- Mennyiség és mértékegység
- Bio/organikus jelölő
- Szállítási opciók

### ListingDetailsScreen
- Termék kép placeholder
- Eladó információk
- Kapcsolatfelvétel gomb
- Megosztás és kedvencekhez

## Adatmodell

### MarketplaceListing
```typescript
interface MarketplaceListing {
  id: string;
  userId: string;
  userName: string;
  cityId: string;
  cityName: string;
  constituencyId: string;
  
  title: string;
  description: string;
  category: ListingCategory;
  type: ListingType;
  
  price?: number;
  currency?: 'HUF';
  tradeFor?: string;
  
  quantity: number;
  unit: ListingUnit;
  isOrganic: boolean;
  
  images: string[];
  deliveryOptions: DeliveryOption[];
  
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  viewCount: number;
  favoriteCount: number;
}
```

## Mock adatok

A fejlesztéshez és teszteléshez mock adatok állnak rendelkezésre:

- **15 hirdetés** különböző kategóriákból
- **7 tranzakció** múltbeli eseményként
- **4 város statisztika** (Martonvásár, Baracska, Tordas, Ráckeresztúr)
- **2 körzet statisztika** (Fejér 01, Fejér 02)

## Használat

### Backend indítása
```bash
cd backend
npm install
npm run dev
```

### Frontend indítása
```bash
cd frontend
npm install
npm run dev
```

### Mobile app indítása
```bash
cd mobile
npm install
npx expo start
```

## Következő lépések

1. **Backend API integráció** - HTTP kliensek a mock adatok helyett
2. **Képfeltöltés** - Cloudinary vagy hasonló szolgáltatás
3. **Értesítések** - Push notification új hirdetésekről
4. **Térkép nézet** - Hirdetések megjelenítése térképen
5. **Chat funkció** - Közvetlen kommunikáció vevő-eladó között
6. **Értékelési rendszer** - Eladók és vásárlók értékelése
