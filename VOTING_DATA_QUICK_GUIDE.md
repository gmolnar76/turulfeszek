# 🗳️ VÁLASZTÁSI ADATOK INTEGRÁCIÓ - RÖVID ÚTMUTATÓ

## Mit Szeretnénk Megoldani?

Az alkalmazás jelenleg **mock adatokkal** működik. Szükség van **valós magyar választási adatokra**, hogy:

1. Minden településhez (város, község, Budapest kerület) hozzárendeljük az ott leadott szavazatokat
2. Megjelenítjük a **Mi Hazánk párt** szavazatait
3. Összehasonlíthatjuk az egyes városok szavazati viselkedését
4. Térképen vizualizáljuk a szavazatok eloszlását

---

## Adatszerkezet (Egyszerűsítve)

```
Település
├── Név: "Budapest"
├── Koordináták: [19.04, 47.49]
├── 2022 Parlamentválasztás
│   ├── Szavazatok száma: 956,000
│   ├── Szavazási részvétel: 67.8%
│   └── Pártok:
│       ├── Fidesz-KDNP: 285,000 szavazat (30%)
│       ├── Mi Hazánk: 95,600 szavazat (10.1%) ← FONTOS!
│       ├── Jobbik: 45,200 szavazat (4.8%)
│       └── Többi párt...
│
└── 2023 Önkormányzati választás
    ├── Szavazatok száma: 712,000
    ├── Szavazási részvétel: 54.2%
    └── Pártok: ...
```

---

## Adatforrások - Hol Szerzed az Adatokat?

### 1. **Nemzeti Választási Iroda (NVI)** - 📋 HIVATALOS
- Website: https://valasztas.hu
- Tartalom: Szavazókörzeti eredmények PDF/Excel formátumban
- Szintek: Teljes Magyarország → Megye → Város → Szavazókörzet

**Adatok letöltése**:
1. Menj a https://valasztas.hu -re
2. Válaszd ki az év választásait (2022, 2023)
3. Töltsd le az Excel-táblázatokat
4. Formázd meg CSV-vé

### 2. **Kézben Társ Közhasznú Egyesület** - 🔓 OPEN DATA
- GitHub: https://github.com/kezbentars/election-data-hungary
- Tartalom: Előre feldolgozott JSON és CSV adatok
- Előny: Már feldolgozva, könnyen integrálható

### 3. **Saját Adat-Szintézis** - ⚙️ MI KÉSZÍTJÜK
Ha szükséges: PDF → Excel → CSV → JSON konverzió

---

## Fájl Felépítése

```
backend/
  data/
    elections/
      2022-parliament.json      ← 2022 parlamentválasztás
      2023-local.json           ← 2023 önkormányzati
    raw/
      settlements.json          ← Összes település lista
      parties.json              ← Pártok metaadatai
    
  types/
    election.types.ts           ← TypeScript típusdefiníciók
  
  routes/
    elections.routes.ts         ← API végpontok
  
  scripts/
    import-elections.ts         ← CSV → JSON konverter
```

---

## Gyakorlati Implementáció

### 1. **2022-es Parlamentválasztás Adatai** (EXEMPLO)

**Fájl**: `backend/data/elections/2022-parliament.json`

```json
{
  "electionId": "2022-parliament",
  "electionDate": "2022-04-03",
  "electionName": "2022. április 3. - Országgyűlési választások",
  "results": [
    {
      "settlementId": "budapest",
      "settlementName": "Budapest",
      "registeredVoters": 1410000,
      "totalVoters": 956000,
      "participationRate": 67.8,
      "validVotes": 950000,
      "partyResults": [
        {
          "partyId": "fidesz-kdnp",
          "partyName": "Fidesz-KDNP",
          "votes": 285000,
          "percentage": 30.0
        },
        {
          "partyId": "mi-hazank",
          "partyName": "Mi Hazánk",
          "votes": 95600,
          "percentage": 10.1
        },
        {
          "partyId": "jobbik",
          "partyName": "Jobbik",
          "votes": 45200,
          "percentage": 4.8
        }
      ]
    },
    {
      "settlementId": "debrecen",
      "settlementName": "Debrecen",
      "registeredVoters": 162000,
      "totalVoters": 108000,
      "participationRate": 66.7,
      "validVotes": 105000,
      "partyResults": [
        {
          "partyId": "fidesz-kdnp",
          "partyName": "Fidesz-KDNP",
          "votes": 31500,
          "percentage": 30.0
        },
        {
          "partyId": "mi-hazank",
          "partyName": "Mi Hazánk",
          "votes": 8100,
          "percentage": 7.7
        }
      ]
    }
  ]
}
```

### 2. **Backend API - Mi Hazánk Szavazatok Lekérdezése**

**Végpont 1**: Egy város szavazatai

```bash
GET /api/elections/2022-parliament/settlements/budapest
```

**Válasz**:
```json
{
  "settlementId": "budapest",
  "settlementName": "Budapest",
  "partyResults": [
    {
      "partyId": "fidesz-kdnp",
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
```

**Végpont 2**: Mi Hazánk Top 10 települése

```bash
GET /api/elections/2022-parliament/by-party/mi-hazank?limit=10
```

**Válasz**:
```json
[
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
  },
  {
    "rank": 3,
    "settlementName": "Szeged",
    "votes": 7200,
    "percentage": 6.5
  }
]
```

### 3. **Frontend - Szavazatok Megjelenítése**

#### 3.1 Térképen - Település Szín-Kódolása

```typescript
// HungaryMap.svelte-ben

function getVoteColor(settlementId: string): string {
  const election = electionData.get(settlementId);
  const miHazank = election?.partyResults.find(p => p.partyId === 'mi-hazank');
  const percentage = miHazank?.percentage || 0;
  
  // Szín az Mi Hazánk szavazat-aránya alapján
  if (percentage >= 15) return '#DD0000'; // Sötétvörös - ERŐS
  if (percentage >= 10) return '#FF3333'; // Piros - Közepes-erős
  if (percentage >= 7) return '#FF6666';  // Világosabb piros - Közepes
  if (percentage >= 5) return '#FFAAAA';  // Pasztell piros - Gyenge
  if (percentage > 0) return '#FFE5E5';   // Nagyon világos piros - Nagyon gyenge
  return '#E0E0E0';                        // Szürke - Nincs adat
}

// Település marker-hez tooltip
const tooltip = `
  ${settlementName}
  ─────────────────
  Szavazók: ${totalVoters.toLocaleString('hu-HU')}
  Részvétel: ${participationRate.toFixed(1)}%
  Mi Hazánk: ${miHazankVotes.toLocaleString('hu-HU')} szavazat (${miHazankPercentage.toFixed(1)}%)
`;
```

#### 3.2 Statisztika Panel

```svelte
<!-- ElectionStats.svelte -->
<div class="election-stats">
  <h2>Mi Hazánk - 2022 Parlamentválasztás</h2>
  
  <div class="top-settlements">
    <h3>Top 10 Településen</h3>
    {#each topSettlements as settlement, idx}
      <div class="stat-row">
        <span class="rank">{idx + 1}.</span>
        <span class="name">{settlement.name}</span>
        <span class="votes">{settlement.votes.toLocaleString('hu-HU')}</span>
        <span class="percentage">{settlement.percentage.toFixed(1)}%</span>
      </div>
    {/each}
  </div>
  
  <div class="summary">
    <p>Teljes szavazatok: <strong>456,200</strong></p>
    <p>Átlagos részvétel: <strong>8.2%</strong></p>
    <p>Legmagasabb: <strong>Budapest (10.1%)</strong></p>
  </div>
</div>
```

---

## Ütemezés

| Fázis | Feladat | Időtartam | Teljesítés |
|-------|--------|----------|-----------|
| 1. | NVI adatok letöltése + feldolgozás | 2 nap | ⏳ |
| 2. | TypeScript tipos + Backend API | 3 nap | ⏳ |
| 3. | Frontend komponensek | 3 nap | ⏳ |
| 4. | Tesztelés + Dokumentáció | 2 nap | ⏳ |
| **Összesen** | | **10 nap** | |

---

## Ellenőrzési Checklist

Mielőtt befejezzük az integrációt:

- [ ] Összes település azonosítójának tisztázása
- [ ] NVI adatok formátumának validálása
- [ ] TypeScript hibák nélkül fordul
- [ ] Backend API tesztelve a `curl`-lel
- [ ] Frontend megjelenít szavazatokat a térképen
- [ ] Szavazatok TOP 10 lista generálódik
- [ ] Szavazási részvétel számít helyesen
- [ ] Mi Hazánk szavazatok jelölve/szín-kódolva
- [ ] Dokumentáció frissítve
- [ ] Teszt adatokkal ellenőrizve

---

## Gyors Tesztelés - Manuális Adatpélda

**Ha saját adatok nélkül szeretnél tesztelni**, használd ezt az alapadatot:

```typescript
const testSettlements = [
  {
    id: "budapest",
    name: "Budapest",
    votes: 956000,
    miHazank: 95600,
    percentage: 10.1
  },
  {
    id: "debrecen",
    name: "Debrecen",
    votes: 108000,
    miHazank: 8100,
    percentage: 7.7
  },
  {
    id: "szeged",
    name: "Szeged",
    votes: 110000,
    miHazank: 7150,
    percentage: 6.5
  },
  {
    id: "pecs",
    name: "Pécs",
    votes: 78000,
    miHazank: 3510,
    percentage: 4.5
  },
  {
    id: "miskolc",
    name: "Miskolc",
    votes: 85000,
    miHazank: 6800,
    percentage: 8.0
  },
  {
    id: "gyor",
    name: "Győr",
    votes: 72000,
    miHazank: 4320,
    percentage: 6.0
  }
];
```

---

## Összegzés

**Amit elvégzünk**:
1. ✅ Valós választási adatok szerzése az NVI-ből
2. ✅ Adatok TypeScript objektummá alakítása
3. ✅ Backend API végpontok a szavazatok lekérdezésére
4. ✅ Frontend komponensek a megjelenítéshez
5. ✅ Térképen szavazatok szerinti szín-kódolás
6. ✅ Statisztikai panel a Mi Hazánk szavazatokkal

**Eredmény**: Egy interaktív térkép, amely mutatja, hogy hol és mennyien szavaztak a Mi Hazánk párti 2022-ben.

---

**Kérdés**: Szeretnéd, hogy elkezdjem az NVI adatok gyűjtésé és feldolgozásá?
