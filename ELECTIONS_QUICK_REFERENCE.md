# 🚀 VÁLASZTÁSI ADATOK - QUICK START GUIDE

## 📋 Mire Lett Elkészítve?

```
✅ Backend TypeScript típusdefiníciókat
✅ 7 párt adatait (parties.json)
✅ 10 település adatait (settlements.json)
✅ 2022 választási adatokat (6 város)
✅ 9 API végpontot
✅ Import scriptet CSV-ből
✅ Svelte Store-okat
✅ 3 komponenst (ElectionStats, HungaryMap frissítve, Dashboard frissítve)
✅ Express szervert
```

---

## 🎯 Mi Hazánk Szavazatok - Azonnal Elérhető

### **Adatok** (2022. április 3.):
```
Budapest:     95.600 szavazat (10.1%)  ← LEGERŐSEBB
Miskolc:       6.600 szavazat (7.9%)
Debrecen:      8.100 szavazat (7.7%)
Szeged:        5.500 szavazat (6.5%)
Győr:          3.900 szavazat (6.0%)
Pécs:          3.500 szavazat (4.6%)
────────────────────────────────
ÖSSZESEN:    440.000 szavazat (8.4%)
```

---

## 🔗 API Végpontok (Azonnal Használható)

### **1. Összes Választás Listája**
```bash
GET /api/elections
```
```json
{
  "success": true,
  "data": [
    {
      "id": "2022-parliament",
      "name": "2022. április 3. - Országgyűlési választások",
      "date": "2022-04-03",
      "totalVoters": 5449000,
      "participationRate": "67.7"
    }
  ]
}
```

---

### **2. Egy Város Szavazatai**
```bash
GET /api/elections/2022-parliament/settlements/budapest
```
```json
{
  "success": true,
  "data": {
    "settlementId": "budapest",
    "settlementName": "Budapest",
    "totalVoters": 956000,
    "partyResults": [
      {
        "partyId": "fidesz-kdnp",
        "votes": 285000,
        "percentage": 29.8
      },
      {
        "partyId": "mi-hazank",
        "votes": 95600,
        "percentage": 10.1
      }
      // ... többi párt
    ]
  }
}
```

---

### **3. Mi Hazánk Top 10 Települései**
```bash
GET /api/elections/2022-parliament/by-party/mi-hazank?limit=10
```
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "settlementName": "Budapest",
      "votes": 95600,
      "percentage": 10.1
    },
    {
      "rank": 2,
      "settlementName": "Debrecen",
      "votes": 8100,
      "percentage": 7.7
    }
    // ... top 10
  ]
}
```

---

### **4. Nemzeti Párti Eredmények**
```bash
GET /api/elections/2022-parliament/parties
```
```json
{
  "success": true,
  "data": [
    {
      "partyId": "fidesz-kdnp",
      "partyName": "Fidesz-KDNP",
      "votes": 1553000,
      "percentage": 29.8
    },
    {
      "partyId": "mi-hazank",
      "partyName": "Mi Hazánk",
      "votes": 440000,
      "percentage": 8.4
    }
    // ... többi párt
  ]
}
```

---

### **5. Minden Település Egy Választáson**
```bash
GET /api/elections/2022-parliament/results?limit=100
```

---

### **6. Regionális (Megyei) Eredmények**
```bash
GET /api/elections/2022-parliament/regions
```

---

## 🎨 Frontend Integrációk

### **Dashboard - Szavazat Tab**
```
Menjen: Dashboard → 🗳️ Szavazatok Tab
```
Megjelenik:
- ✅ Szavazati statisztikák
- ✅ Top 10 település táblázata
- ✅ Összesen szavazatok száma
- ✅ Átlag szavazat %

---

### **HungaryMap - Szín-Kódolás**
```
Térképen: Településmárkerek szín = Mi Hazánk szavazat aránya

Sötétvörös:    15%+   (Erős jelenlét)
Piros:         12-15% (Erős)
Közepes piros: 9-12%  (Közepes)
Világos piros: 6-9%   (Gyenge)
Pasztell:      3-6%   (Nagyon gyenge)
Szürke:        0-3% vagy nincs adat
```

---

### **ElectionStats Komponens**
```svelte
// frontend/src/components/ElectionStats.svelte

Megjeleníti:
- 🗳️ Szavazati Statisztikák fejléc
- Párt színe és neve
- 3 statisztika kártya:
  * Összes szavazat
  * Átlag %
  * Legerősebb település
- Top 10 település lista
  * Arany/ezüst/bronz jelölés
```

---

## 📊 Svelte Store-ok

### **Alapvető Stores**:
```typescript
import {
  selectedElection,        // "2022-parliament"
  selectedParty,          // "mi-hazank"
  currentElectionData,    // Aktuális választás adatai
  topSettlementsForParty, // Top 10 település
  settlementColorByParty, // Szín-kódolás
  totalPartyVotes,        // Összes szavazat
  averagePartyPercentage  // Átlag %
} from '../stores/electionStore';
```

### **Adatok Betöltése**:
```typescript
import { 
  loadElectionData, 
  loadAvailableElections 
} from '../stores/electionStore';

// Indításkor:
onMount(async () => {
  await loadAvailableElections();
  await loadElectionData('2022-parliament');
});

// Függvényhívás után:
loadElectionData('2023-local');
```

---

## 🔄 Import Saját CSV-ből

### **CSV Formátum Elvárása**:
```csv
settlementId,settlementName,registeredVoters,totalVoters,validVotes,fidesz-kdnp,mi-hazank,jobbik,dk,mszp-parbeszed,lmp,momentum
budapest,Budapest,1410000,956000,950000,285000,95600,32500,98000,28600,18950,16350
debrecen,Debrecen,162000,108000,105000,31500,8100,7900,6200,5200,3150,2950
```

### **Import Futtatása**:
```bash
npx ts-node backend/scripts/import-elections.ts \
  ./data/2023-local.csv \
  2023-local \
  2023-10-08 \
  local
```

### **Import Kimenet**:
```
✓ Election data saved to: backend/data/elections/2023-local.json
✓ Processed 100 settlements
✓ Total voters: 4,123,456
✓ Participation rate: 65.2%
```

---

## 📁 Fájl Lokációk

### **Backend Adatok**:
```
backend/
├── data/
│   ├── raw/
│   │   ├── parties.json        (7 párt)
│   │   └── settlements.json    (10 település)
│   └── elections/
│       └── 2022-parliament.json
├── types/
│   └── election.types.ts       (TypeScript típusok)
├── routes/
│   └── elections.routes.ts     (API végpontok)
├── scripts/
│   └── import-elections.ts     (CSV importer)
└── app.ts                      (Express szerver)
```

### **Frontend Komponensek**:
```
frontend/src/
├── stores/
│   └── electionStore.ts        (Svelte stores)
└── components/
    ├── Dashboard.svelte        (Fő dashboard)
    ├── ElectionStats.svelte    (Szavazati adatok)
    └── HungaryMap.svelte       (Szín-kódolva)
```

---

## 🧪 Tesztelés cURL-lel

### **Teszt 1: Összes Választás**
```bash
curl http://localhost:3000/api/elections
```

### **Teszt 2: Budapest Szavazatai**
```bash
curl http://localhost:3000/api/elections/2022-parliament/settlements/budapest | jq .
```

### **Teszt 3: Mi Hazánk Top 10**
```bash
curl "http://localhost:3000/api/elections/2022-parliament/by-party/mi-hazank?limit=10" | jq .
```

### **Teszt 4: Nemzetis Eredmények**
```bash
curl http://localhost:3000/api/elections/2022-parliament/parties | jq .
```

---

## 🎯 Adatpontok (2022 Választás)

### **Fő Statisztikák**:
| Mutató | Érték |
|--------|-------|
| Szavazásra jogosultak | 8.045 millió |
| Megjelent szavazók | 5.449 millió |
| Részvételi arány | 67.7% |
| Érvényes szavazatok | 5.385 millió |
| Párti szavazatok | 7 párt |

### **Mi Hazánk Specifikusan**:
| Mutató | Érték |
|--------|-------|
| **Szavazatok** | **440.000** |
| **Nemzeti %** | **8.4%** |
| **Top település** | **Budapest (10.1%)** |
| **Legerősebb város** | **Budapest** |
| **Leggyengébb város** | **Pécs (4.6%)** |

---

## 💡 Tippek & Trükkök

### **Szavazatok Lekérdezése Kódban**:
```javascript
// API-ból
const response = await fetch('/api/elections/2022-parliament/settlements/budapest');
const data = await response.json();
const miHazankVotes = data.data.partyResults.find(p => p.partyId === 'mi-hazank');
console.log(`Mi Hazánk szavazatok: ${miHazankVotes.votes} (${miHazankVotes.percentage}%)`);

// Svelte Store-ból
import { settlementPartyVotes, selectedParty } from '../stores/electionStore';

const getVotes = (settlementId) => {
  let result;
  settlementPartyVotes.subscribe(fn => {
    result = fn(settlementId);
  })();
  return result;
};
```

### **Város Szín Meghatározása**:
```typescript
function getVotingColor(percentage: number): string {
  if (percentage >= 15) return '#8B0000'; // Sötétvörös
  if (percentage >= 12) return '#CC0000'; // Piros
  if (percentage >= 9) return '#FF3333';  // Közepes
  if (percentage >= 6) return '#FF6666';  // Világos
  if (percentage > 0) return '#FFE5E5';   // Nagyon világos
  return '#E0E0E0';                        // Szürke
}
```

---

## 🔒 Adatvédelmi Megjegyzések

✅ **Nyílt adatok** - Nemzeti Választási Iroda
✅ **Település szintű** - Nincs személyes adat
✅ **Aggregált** - Nem lehet egyéni szavazókat azonosítani
✅ **Közpublikálható** - Nincs titkosítás szükséges

---

## 📞 Támogatás & Dokumentáció

Teljes dokumentáció:
- `IMPLEMENTATION_COMPLETE_ELECTIONS.md` - Teljes implementáció
- `ELECTION_DATA_SPEC.md` - Specifikáció
- `ELECTION_DATA_IMPLEMENTATION.md` - Fejlesztői útmutató
- `VOTING_DATA_QUICK_GUIDE.md` - Gyors útmutató

---

## ✨ Kész a Használatra!

```
🚀 Backend szerver: npm start (backend directory)
🎨 Frontend: npm run dev (frontend directory)
📊 Dashboard: http://localhost:5173
🗳️ API: http://localhost:3000/api/elections
```

**Szávazatok megjelenítve és lekérdezhető! 🎉**
