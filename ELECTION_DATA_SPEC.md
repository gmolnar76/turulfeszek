# Választási Adatok Specifikáció

## 1. Szükséges Adatforrások

### 1.1 Elsődleges Adatok
- **KöztársaságiVálasztások (2022, 2023)**
  - Szavazókörzetek száma településenként
  - Szavazási részvétel (%)
  - Leadott szavazatok száma
  - Érvényes szavazatok száma
  
- **Pártonkénti Szavazatok**
  - Minden regisztrált párt szavazatszáma
  - Különösen: **Mi Hazánk** szavazatai
  - Százalékos megoszlás

### 1.2 Településadatok
- Településnév (magyar teljes név)
  - Budapest + kerületek
  - Vidéki városok
  - Községek
- Koordináták (szélesség, hosszúság)
- Népesség
- Szavazókorú népesség

## 2. Adatszerkezet

### 2.1 Település Entitás
```typescript
interface Settlement {
  id: string;                    // 'budapest', 'budapest-01', 'szeged', stb.
  name: string;                  // "Budapest", "Budapest - I. kerület", "Szeged"
  regionId: string;              // régió azonosító
  coordinates: [number, number]; // [lng, lat]
  population: number;            // teljes lakosság
  eligibleVoters: number;        // szavazókorú lakosság
  
  election?: ElectionData;       // választási adatok
}

interface ElectionData {
  electionId: string;            // '2022-parliament', '2023-local'
  electionDate: string;          // "2022-04-03"
  electionType: 'parliament' | 'local' | 'european';
  
  totalVoters: number;           // szavazáson megjelent
  registeredVoters: number;      // szavazásra jogosultak
  participationRate: number;     // 0-100
  validVotes: number;            // érvényes szavazatok
  
  results: PartyResult[];        // pártok eredményei
}

interface PartyResult {
  partyId: string;               // 'fidesz', 'mi-hazank', 'jobbik', stb.
  partyName: string;             // "Fidesz-KDNP", "Mi Hazánk", stb.
  votes: number;                 // szavazatok száma
  percentage: number;            // 0-100
}
```

### 2.2 Régió Entitás
```typescript
interface Region {
  id: string;
  name: string;                  // "Közép-Magyarország", "Csongrád-Csanád"
  settlements: string[];         // település ID-k
  totalPopulation: number;
  totalEligibleVoters: number;
  aggregatedElectionData?: ElectionAggregated;
}

interface ElectionAggregated {
  totalVoters: number;
  totalRegisteredVoters: number;
  participationRate: number;
  byParty: {
    [partyId: string]: {
      votes: number;
      percentage: number;
    }
  }
}
```

## 3. Adatforrások - Honnan szerzem az Adatokat?

### 3.1 Hivatalos Forrás
- **Nemzeti Választási Iroda (NVI)** - `valasztas.hu`
  - PDF-ben: szavazatszámlálási eredmények
  - Település szintű bontás
  - Szavazókörzeti adatok

### 3.2 Nyílt Adat Portál
- **data.hu** - Magyar Statisztikai Központ
  - Település azonosítók
  - Adminisztratív határok
  - Népességi adatok

### 3.3 OpenData Projektek
- **mapzen/whosonfirst** - világtérképadatok
- **Kézben Társ Közhasznú Egyesület** - választási adatok
  - GitHub: `election-data-hungary`
  - CSV formátum

## 4. Mock → Valós Adatok Migráció

### 4.1 Jelenlegi Mock Szerkezet
```typescript
// Jelenleg: 6 város + mock adatok
cities = [
  { id: 'budapest', name: 'Budapest', ... },
  { id: 'debrecen', name: 'Debrecen', ... },
  // ...
]
```

### 4.2 Szükséges Kiterjesztés
```typescript
// Kiterjesztett: Összes település + választási adatok
interface SettlementWithElections extends Settlement {
  elections: Map<string, ElectionData>; // többszöröző: 2022, 2023, 2026
  activityLevel: 'low' | 'medium' | 'high';
  culturalMovements: CulturalMovement[];
}
```

### 4.3 Adatkonverzió

#### Mi Hazánk Szavazatok Lekérdezése
```typescript
function getVotesForMiHazank(
  electionId: string,
  settlementId: string
): PartyResult | undefined {
  const settlement = settlements.find(s => s.id === settlementId);
  if (!settlement?.election) return undefined;
  
  return settlement.election.results.find(
    r => r.partyId === 'mi-hazank'
  );
}

// Felhasználás:
const miHazankVotes = getVotesForMiHazank('2022-parliament', 'budapest');
console.log(`Mi Hazánk szavazatok: ${miHazankVotes?.votes}`);
console.log(`Százalék: ${miHazankVotes?.percentage}%`);
```

## 5. Implementációs Lépések

### 5.1 Phase 1: Adatgyűjtés (1-2 hét)
- [ ] NVI webhelyről adatok letöltése
- [ ] CSV formátumra konvertálás
- [ ] Településazonosítók standarizálása
- [ ] Adatvalidálás

### 5.2 Phase 2: Adatstruktúra (1 hét)
- [ ] TypeScript típusdefiníciók
- [ ] Adatmodell készítés
- [ ] JSON séma validálás

### 5.3 Phase 3: Integráció (1-2 hét)
- [ ] Mock adatok → Valós adatok
- [ ] Backend API: `/api/settlements`
- [ ] Backend API: `/api/elections/:electionId`
- [ ] Backend API: `/api/party/:partyId/settlements`

### 5.4 Phase 4: Frontend (1 hét)
- [ ] Szavazatok megjelenítése térképen
- [ ] Szavazati arányzat vizualizáció
- [ ] Mi Hazánk szavazatok highlight
- [ ] Szűrés és keresés

## 6. Térképvisualizáció

### 6.1 Szavazatok Alapján Színezés
```typescript
function getSettlementColor(settlement: Settlement): string {
  const miHazankPercentage = settlement.election?.results
    .find(r => r.partyId === 'mi-hazank')?.percentage || 0;
  
  if (miHazankPercentage >= 15) return '#FF4444'; // erős jelenlét
  if (miHazankPercentage >= 10) return '#FF8800';
  if (miHazankPercentage >= 5) return '#FFBB00';
  if (miHazankPercentage > 0) return '#FFFF00';
  return '#CCCCCC'; // nincs adat
}
```

### 6.2 Márkerszöveg
```
Város neve
─────────
Szavazók: 145,234
Részvétel: 68.5%
Mi Hazánk: 12,450 szavazat (8.6%)
```

## 7. Adatfájlok Szerkezete

### 7.1 Javasolt Könyvtárszerkezet
```
backend/
  data/
    elections/
      2022-parliament.json
      2023-local.json
      2026-parliament.json (tervezett)
    settlements/
      all-settlements.json
      budapest-districts.json
      counties.json
    parties/
      parties.json
    aggregated/
      by-county/
        2022-parliament-county-stats.json
      by-region/
        2022-parliament-region-stats.json
  
  migrations/
    001-import-elections.ts
    002-import-settlements.ts
```

### 7.2 Minta Fájlformát: `settlements.json`
```json
{
  "settlements": [
    {
      "id": "budapest",
      "name": "Budapest",
      "type": "city",
      "coordinates": [19.0402, 47.4979],
      "population": 1752286,
      "eligibleVoters": 1410000,
      "countySeatOf": null,
      "districtOf": null
    },
    {
      "id": "budapest-01",
      "name": "Budapest - I. kerület (Várnegyed)",
      "type": "district",
      "coordinates": [19.0335, 47.5007],
      "population": 24567,
      "eligibleVoters": 19800,
      "countySeatOf": null,
      "districtOf": "budapest"
    }
  ]
}
```

### 7.3 Minta Fájlformát: `elections/2022-parliament.json`
```json
{
  "electionId": "2022-parliament",
  "electionDate": "2022-04-03",
  "electionType": "parliament",
  "results": [
    {
      "settlementId": "budapest",
      "settlementName": "Budapest",
      "registeredVoters": 1410000,
      "totalVoters": 956000,
      "validVotes": 950000,
      "participationRate": 67.8,
      "partyResults": [
        {
          "partyId": "fidesz",
          "partyName": "Fidesz-KDNP",
          "votes": 285000,
          "percentage": 30.0
        },
        {
          "partyId": "mi-hazank",
          "partyName": "Mi Hazánk",
          "votes": 95600,
          "percentage": 10.1
        }
      ]
    }
  ]
}
```

## 8. Backend API Endpointok

### 8.1 Települések
```
GET /api/settlements
  → Összes település listája

GET /api/settlements/:id
  → Egy település adatai

GET /api/settlements/search?q=Budapest
  → Szövegkeresés településre

GET /api/settlements?type=city
  → Szűrés típus alapján
```

### 8.2 Választások
```
GET /api/elections
  → Elérhető választások listája

GET /api/elections/:electionId/results
  → Egy választás összes eredménye

GET /api/elections/:electionId/settlements/:settlementId
  → Egy település egy választásának adatai

GET /api/elections/:electionId/by-party/:partyId
  → Egy párt egy választásának adatai
```

### 8.3 Elemzés
```
GET /api/analysis/party-distribution/:partyId
  → Párt szavazat eloszlása térképen

GET /api/analysis/participation-rates
  → Szavazási részvétel elemzése

GET /api/analysis/settlement-comparison
  → Települések összehasonlítása
```

## 9. Frontend Szükségletek

### 9.1 Új Komponensek
- `ElectionSelector.svelte` - Választás kiválasztása
- `PartyFilter.svelte` - Párt szűrés
- `VotingStatistics.svelte` - Szavazati statisztikák
- `SettlementCard.svelte` - Település kártya választási adatokkal

### 9.2 Módosult Komponensek
- `HungaryMap.svelte` - Szavazatok alapján színezés
- `CityPanel.svelte` - Szavazati adatok megjelenítése
- `ActivityChart.svelte` - Választási trend vizualizáció

### 9.3 Új Tárolók
```typescript
export const selectedElection = writable<string>('2022-parliament');
export const selectedParty = writable<string>('mi-hazank');
export const settlementVotingData = writable<Map<string, PartyResult>>();
export const electionResults = writable<ElectionData[]>();
```

## 10. Adatkezelés & Adatvédelem

### 10.1 Nyílt Adatok
- Választási adatok → Nyiltán elérhető (NVI)
- Település adatok → Nyiltán elérhető (KSH)
- Koordináták → Nyiltán elérhető

### 10.2 Személyes Adatok: NINCS
- **Nem** tároljuk: Személyi azonosító
- **Nem** tároljuk: Lakóhelyadatok
- **Nem** tároljuk: Egyéni szavazók adatai
- **Csak** aggregált adatok (település szint)

## 11. Mérföldkövek

| Mérföldkő | Dátum | Státusz |
|-----------|-------|--------|
| Adatspecifikáció véglegesítése | Dec 4 | ✓ |
| Adatgyűjtés megkezdése | Dec 5 | ⏳ |
| Első adatimport (2022 választások) | Dec 10 | ⏳ |
| Backend API megírása | Dec 15 | ⏳ |
| Frontend integráció | Dec 20 | ⏳ |
| Teszt és validálás | Dec 27 | ⏳ |
| Produkcióba vétel | Jan 2 | ⏳ |

---

## Következő Lépések

1. **Azonnal**: Ez a specifikáció alapján kezdjük az adatgyűjtést
2. **Holnap**: Letöltjük az NVI adatokat PDF-ből
3. **Majd**: CSV-re konvertáljuk és validáljuk
4. **Végül**: Integrálva az alkalmazásba

Ez a strukturált megközelítés biztosítja, hogy:
- ✅ Valós adatok
- ✅ Adatvédelmi megfelelőség
- ✅ Könnyű bővítés
- ✅ Skálázható szerkezet
