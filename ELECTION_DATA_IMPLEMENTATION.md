# Választási Adatgyűjtési Útmutató

## 1. Az NVI Adatok Letöltése

### 1.1 Ahol Megtaláljuk
- **Nemzeti Választási Iroda**: https://valasztas.hu
- Szavazókörzeti eredmények (PDF, XLS)
- 2022 Parlamentválasztás
- 2023 Önkormányzati választások

### 1.2 Szükséges Adatmezők
```
Település/Szavazókörzet
├── Szavazásra jogosultak száma
├── Szavazaton megjelent
├── Leadott szavazatok
├── Érvényes szavazatok
└── Pártok szerinti szavazatok (minden párt)
    ├── Fidesz-KDNP
    ├── Mi Hazánk
    ├── Jobbik
    ├── DK
    ├── MSZP-Párbeszéd
    ├── LMP
    ├── Gyurcsány Ferenc (függetlenül)
    └── ...
```

---

## 2. Szükséges TypeScript Fájlok Elkészítése

### 2.1 `backend/types/election.types.ts`

```typescript
// Párt azonosítók
export enum PartyId {
  FIDESZ = 'fidesz-kdnp',
  MI_HAZANK = 'mi-hazank',
  JOBBIK = 'jobbik',
  DK = 'dk',
  MSZP_PARBESZED = 'mszp-parbeszed',
  LMP = 'lmp',
  MOMENTUM = 'momentum',
  INDEPENDENT = 'independent',
  EGYEB = 'other'
}

// Választás típusok
export enum ElectionType {
  PARLIAMENT = 'parliament',
  LOCAL = 'local',
  EUROPEAN = 'european'
}

// Település típusok
export enum SettlementType {
  CAPITAL = 'capital',
  COUNTY_SEAT = 'county-seat',
  CITY = 'city',
  TOWN = 'town',
  VILLAGE = 'village',
  DISTRICT = 'district' // Budapest kerületek
}

// Régió (megye-szintű)
export type RegionId = 
  | 'budapest'
  | 'baranya'
  | 'bacs-kiskun'
  | 'bekes'
  | 'borsod-abauj-zemplen'
  | 'csongrad-csanad'
  | 'fejer'
  | 'gyor-moson-sopron'
  | 'hajdu-bihar'
  | 'heves'
  | 'jasz-nagykun-szolnok'
  | 'komarom-esztergom'
  | 'nograd'
  | 'pest'
  | 'somogy'
  | 'szabolcs-szatmar-bereg'
  | 'tolna'
  | 'vas'
  | 'veszprem'
  | 'zala';

// Egy település adatai
export interface Settlement {
  id: string;
  name: string;
  nameWithRegion?: string; // "Budapest - I. kerület"
  type: SettlementType;
  regionId: RegionId;
  coordinates: [number, number]; // [lng, lat]
  population: number;
  eligibleVoters: number;
  parentSettlementId?: string; // Budapest kerületekhez
}

// Egy párt egy településen elért eredménye
export interface PartyVotingResult {
  partyId: PartyId;
  partyName: string;
  votes: number;
  percentage: number;
}

// Egy település választási adatai
export interface SettlementElectionData {
  settlementId: string;
  settlementName: string;
  electionId: string;
  electionDate: string; // "2022-04-03"
  electionType: ElectionType;
  
  registeredVoters: number; // szavazásra jogosultak
  totalVoters: number; // megjelent szavazók
  participationRate: number; // 0-100
  
  leadVotes: number; // leadott szavazatok
  validVotes: number; // érvényes szavazatok
  invalidVotes: number; // érvénytelen szavazatok
  
  partyResults: PartyVotingResult[];
}

// Régió szintű aggregált adatok
export interface RegionElectionData {
  regionId: RegionId;
  regionName: string;
  electionId: string;
  
  totalRegisteredVoters: number;
  totalVoters: number;
  participationRate: number;
  
  aggregatedPartyResults: PartyVotingResult[];
  settlementResults: SettlementElectionData[];
}

// Teljes választás adatai
export interface ElectionDataSet {
  electionId: string; // "2022-parliament"
  electionDate: string;
  electionType: ElectionType;
  electionName: string; // "2022. április 3. - Országgyűlési választások"
  
  totalRegisteredVoters: number;
  totalParticipation: number; // szavazók száma
  participationRate: number;
  
  regionResults: RegionElectionData[];
  nationalPartyResults: PartyVotingResult[];
}

// Query interfészek az adatbázishoz
export interface ElectionQuery {
  settlementId?: string;
  regionId?: RegionId;
  electionId?: string;
  partyId?: PartyId;
  minParticipationRate?: number;
  maxParticipationRate?: number;
}

export interface ElectionResult extends SettlementElectionData {
  rank?: number; // pártok közötti hely
  trend?: {
    previousElection: PartyVotingResult;
    change: number; // szavazat változás
    percentageChange: number; // % változás
  };
}
```

### 2.2 `backend/data/raw/parties.json`

```json
{
  "parties": [
    {
      "id": "fidesz-kdnp",
      "name": "Fidesz-KDNP",
      "fullName": "Fidesz-Magyar Polgári Unió - Keresztény Demokrata Néppárt",
      "color": "#0066CC",
      "established": 1988,
      "leaderName": "Orbán Viktor",
      "ideology": "conservative, christian-democratic"
    },
    {
      "id": "mi-hazank",
      "name": "Mi Hazánk",
      "fullName": "Mi Hazánk Mozgalom",
      "color": "#FF0000",
      "established": 2018,
      "leaderName": "Toroczkai László",
      "ideology": "nationalist, conservative"
    },
    {
      "id": "jobbik",
      "name": "Jobbik",
      "fullName": "Jobbik Magyarországért Mozgalom",
      "color": "#00CC00",
      "established": 2003,
      "leaderName": "Jakab Péter",
      "ideology": "right-wing, conservative"
    },
    {
      "id": "dk",
      "name": "DK",
      "fullName": "Demokratikus Koalíció",
      "color": "#FF6600",
      "established": 2010,
      "leaderName": "Gyurcsány Ferenc",
      "ideology": "liberal, center-left"
    },
    {
      "id": "mszp-parbeszed",
      "name": "MSZP-Párbeszéd",
      "fullName": "Magyar Szocialista Párt - Párbeszéd",
      "color": "#FF0066",
      "established": 1989,
      "leaderName": "Molnár Ildikó",
      "ideology": "social-democratic, left"
    },
    {
      "id": "lmp",
      "name": "LMP",
      "fullName": "Lehet Másképp - A Politikai Mozgalom",
      "color": "#66FF00",
      "established": 2009,
      "leaderName": "Atkári Gábor",
      "ideology": "green, progressive"
    },
    {
      "id": "momentum",
      "name": "Momentum",
      "fullName": "Momentum Mozgalom",
      "color": "#FF00FF",
      "established": 2015,
      "leaderName": "Fekete-Győr András",
      "ideology": "centrist, progressive"
    }
  ]
}
```

### 2.3 `backend/data/raw/settlements.json` (Minta)

```json
{
  "settlements": [
    {
      "id": "budapest",
      "name": "Budapest",
      "type": "capital",
      "regionId": "budapest",
      "coordinates": [19.0402, 47.4979],
      "population": 1752286,
      "eligibleVoters": 1410000,
      "note": "Főváros"
    },
    {
      "id": "budapest-01",
      "name": "Budapest - I. kerület",
      "nameWithRegion": "Budapest - I. kerület (Várnegyed)",
      "type": "district",
      "regionId": "budapest",
      "coordinates": [19.0335, 47.5007],
      "population": 24567,
      "eligibleVoters": 19800,
      "parentSettlementId": "budapest",
      "note": "Várnegyed"
    },
    {
      "id": "debrecen",
      "name": "Debrecen",
      "type": "county-seat",
      "regionId": "hajdu-bihar",
      "coordinates": [21.6348, 47.5301],
      "population": 201432,
      "eligibleVoters": 162000,
      "note": "Hajdú-Bihar megye székhelye"
    },
    {
      "id": "szeged",
      "name": "Szeged",
      "type": "county-seat",
      "regionId": "csongrad-csanad",
      "coordinates": [20.1452, 46.2530],
      "population": 160099,
      "eligibleVoters": 128000,
      "note": "Csongrád-Csanád megye székhelye"
    }
  ]
}
```

---

## 3. Adatimport Szkript

### 3.1 `backend/scripts/import-elections.ts`

```typescript
import fs from 'fs';
import path from 'path';
import {
  Settlement,
  SettlementElectionData,
  PartyVotingResult,
  ElectionDataSet
} from '../types/election.types';

interface RawElectionRow {
  settlementId: string;
  settlementName: string;
  registeredVoters: number;
  totalVoters: number;
  validVotes: number;
  [partyId: string]: number | string; // fidesz-kdnp, mi-hazank, stb.
}

/**
 * CSV vagy XLS fájlt beolvas és feldolgozza
 * Az NVI eredmények importálásához
 */
export async function importElectionData(
  filePath: string,
  electionId: string
): Promise<ElectionDataSet> {
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const rows = parseCSV(rawData);
  
  const settlementResults: SettlementElectionData[] = [];
  let totalVoters = 0;
  let totalRegisteredVoters = 0;
  
  for (const row of rows) {
    const settlement = settlements.find(s => s.id === row.settlementId);
    if (!settlement) {
      console.warn(`Settlement not found: ${row.settlementId}`);
      continue;
    }
    
    const partyResults: PartyVotingResult[] = [];
    
    // Kiolvassuk minden párt szavazatait
    for (const party of parties) {
      const votes = parseInt(row[party.id] as string) || 0;
      partyResults.push({
        partyId: party.id,
        partyName: party.name,
        votes,
        percentage: (votes / row.validVotes) * 100
      });
    }
    
    // Szavazatok alapján rendezzük
    partyResults.sort((a, b) => b.votes - a.votes);
    
    settlementResults.push({
      settlementId: row.settlementId,
      settlementName: row.settlementName,
      electionId,
      electionDate: '', // TODO: electionId alapján
      electionType: 'parliament', // TODO: electionId alapján
      registeredVoters: row.registeredVoters,
      totalVoters: row.totalVoters,
      participationRate: (row.totalVoters / row.registeredVoters) * 100,
      leadVotes: row.totalVoters,
      validVotes: row.validVotes,
      invalidVotes: row.totalVoters - row.validVotes,
      partyResults
    });
    
    totalVoters += row.totalVoters;
    totalRegisteredVoters += row.registeredVoters;
  }
  
  return {
    electionId,
    electionDate: '',
    electionType: 'parliament',
    electionName: '', // TODO
    totalRegisteredVoters,
    totalParticipation: totalVoters,
    participationRate: (totalVoters / totalRegisteredVoters) * 100,
    regionResults: [], // TODO: aggregate by region
    nationalPartyResults: [] // TODO: aggregate nationally
  };
}

/**
 * Egyszerű CSV parser
 */
function parseCSV(content: string): RawElectionRow[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const row: any = {};
    headers.forEach((header, idx) => {
      row[header.trim()] = values[idx]?.trim();
    });
    return row as RawElectionRow;
  });
}

/**
 * Adatok JSON-ba mentése
 */
export async function saveElectionData(
  data: ElectionDataSet,
  outputPath: string
): Promise<void> {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Election data saved to ${outputPath}`);
}

// Futtatás
const electionFile = process.argv[2];
const electionId = process.argv[3];

if (!electionFile || !electionId) {
  console.error('Usage: npx ts-node import-elections.ts <filePath> <electionId>');
  process.exit(1);
}

importElectionData(electionFile, electionId)
  .then(data => saveElectionData(data, `backend/data/elections/${electionId}.json`))
  .catch(console.error);
```

---

## 4. Backend API Endpointok

### 4.1 `backend/routes/elections.routes.ts`

```typescript
import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import {
  SettlementElectionData,
  PartyVotingResult,
  ElectionDataSet
} from '../types/election.types';

const router = Router();

// Összes választás betöltése
const electionsDir = path.join(__dirname, '../data/elections');
const elections = new Map<string, ElectionDataSet>();

fs.readdirSync(electionsDir).forEach(file => {
  if (file.endsWith('.json')) {
    const data = JSON.parse(fs.readFileSync(path.join(electionsDir, file), 'utf-8'));
    elections.set(data.electionId, data);
  }
});

/**
 * GET /api/elections
 * Elérhető választások listája
 */
router.get('/', (req, res) => {
  const electionsList = Array.from(elections.values()).map(e => ({
    id: e.electionId,
    name: e.electionName,
    date: e.electionDate,
    type: e.electionType,
    totalVoters: e.totalParticipation,
    participationRate: e.participationRate
  }));
  
  res.json(electionsList);
});

/**
 * GET /api/elections/:electionId/results
 * Egy választás összes eredménye
 */
router.get('/:electionId/results', (req, res) => {
  const election = elections.get(req.params.electionId);
  
  if (!election) {
    return res.status(404).json({ error: 'Election not found' });
  }
  
  // Szűrés pl. régió vagy párt alapján
  let results = election.regionResults;
  
  if (req.query.regionId) {
    results = results.filter(r => r.regionId === req.query.regionId);
  }
  
  if (req.query.partyId) {
    results = results.map(r => ({
      ...r,
      aggregatedPartyResults: r.aggregatedPartyResults.filter(
        p => p.partyId === req.query.partyId
      )
    }));
  }
  
  res.json(results);
});

/**
 * GET /api/elections/:electionId/settlements/:settlementId
 * Egy település egy választásának adatai
 */
router.get('/:electionId/settlements/:settlementId', (req, res) => {
  const election = elections.get(req.params.electionId);
  
  if (!election) {
    return res.status(404).json({ error: 'Election not found' });
  }
  
  // Keressük meg a település adatait
  let settlement: SettlementElectionData | undefined;
  
  for (const region of election.regionResults) {
    settlement = region.settlementResults.find(
      s => s.settlementId === req.params.settlementId
    );
    if (settlement) break;
  }
  
  if (!settlement) {
    return res.status(404).json({ error: 'Settlement not found' });
  }
  
  res.json(settlement);
});

/**
 * GET /api/elections/:electionId/by-party/:partyId
 * Egy párt egy választásának adatai (Top 20 településen)
 */
router.get('/:electionId/by-party/:partyId', (req, res) => {
  const election = elections.get(req.params.electionId);
  
  if (!election) {
    return res.status(404).json({ error: 'Election not found' });
  }
  
  const results: Array<{
    settlementId: string;
    settlementName: string;
    votes: number;
    percentage: number;
    rank: number;
  }> = [];
  
  for (const region of election.regionResults) {
    for (const settlement of region.settlementResults) {
      const partyResult = settlement.partyResults.find(
        p => p.partyId === req.params.partyId
      );
      
      if (partyResult && partyResult.votes > 0) {
        results.push({
          settlementId: settlement.settlementId,
          settlementName: settlement.settlementName,
          votes: partyResult.votes,
          percentage: partyResult.percentage,
          rank: 0
        });
      }
    }
  }
  
  // Szavazatok alapján csökkenő sorrendbe rendezzük
  results.sort((a, b) => b.votes - a.votes);
  
  // Sorszámok beállítása
  results.forEach((r, idx) => {
    r.rank = idx + 1;
  });
  
  // Top 20 visszaadása
  res.json(results.slice(0, 20));
});

export default router;
```

---

## 5. Frontend Integration - Mi Hazánk Szavazatok

### 5.1 `frontend/src/stores/electionStore.ts`

```typescript
import { writable, derived } from 'svelte/store';
import type { SettlementElectionData, PartyVotingResult } from '../../types';

export const selectedElection = writable<string>('2022-parliament');
export const selectedParty = writable<string>('mi-hazank');

export const electionResults = writable<Map<string, SettlementElectionData>>(new Map());

/**
 * Egy város szavazati adatainak lekérdezése
 */
export const settlementVotes = derived(
  [electionResults, selectedElection],
  ([$electionResults]) => (settlementId: string): PartyVotingResult | undefined => {
    return $electionResults.get(settlementId)?.partyResults.find(
      p => p.partyId === 'mi-hazank'
    );
  }
);

/**
 * Mi Hazánk szavazatok Top 10 települése
 */
export const topMiHazankSettlements = derived(
  [electionResults, selectedElection],
  ([$electionResults]) => {
    const results = Array.from($electionResults.values())
      .map(settlement => ({
        name: settlement.settlementName,
        votes: settlement.partyResults.find(p => p.partyId === 'mi-hazank')?.votes || 0,
        percentage: settlement.partyResults.find(p => p.partyId === 'mi-hazank')?.percentage || 0
      }))
      .filter(r => r.votes > 0)
      .sort((a, b) => b.votes - a.votes);
    
    return results.slice(0, 10);
  }
);
```

### 5.2 `frontend/src/components/ElectionStats.svelte`

```svelte
<script lang="ts">
  import { selectedElection, topMiHazankSettlements } from '../stores/electionStore';
  
  let stats: typeof $topMiHazankSettlements = [];
  
  topMiHazankSettlements.subscribe(v => { stats = v; });
</script>

<div class="election-stats">
  <h2>Mi Hazánk - Top 10 Településen</h2>
  
  <div class="stats-container">
    {#each stats as stat, idx (idx)}
      <div class="stat-row">
        <span class="rank">{idx + 1}.</span>
        <span class="name">{stat.name}</span>
        <span class="votes">{stat.votes.toLocaleString('hu-HU')}</span>
        <span class="percentage">{stat.percentage.toFixed(1)}%</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .election-stats {
    padding: 20px;
    background: #f5f5f5;
    border-radius: 8px;
  }
  
  .stats-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .stat-row {
    display: grid;
    grid-template-columns: 30px 1fr 100px 80px;
    gap: 10px;
    padding: 10px;
    background: white;
    border-radius: 4px;
  }
  
  .rank {
    font-weight: bold;
    text-align: center;
  }
  
  .votes, .percentage {
    text-align: right;
    font-family: monospace;
  }
</style>
```

---

## 6. Adatforrások a Gyakorlatban

### 6.1 Mi Hazánk szavazatok lekérdezésének módja

```typescript
// 1. Egy város szavazatai
const miHazankInBudapest = await fetch(
  '/api/elections/2022-parliament/settlements/budapest'
).then(r => r.json());

console.log(miHazankInBudapest.partyResults.find(p => p.partyId === 'mi-hazank'));
// { partyId: 'mi-hazank', partyName: 'Mi Hazánk', votes: 95600, percentage: 10.1 }

// 2. Mi Hazánk Top 20 települése
const topMiHazank = await fetch(
  '/api/elections/2022-parliament/by-party/mi-hazank'
).then(r => r.json());

// 3. Szűrés: Debrecen összes pártja
const debrecenParties = await fetch(
  '/api/elections/2022-parliament/settlements/debrecen?detailed=true'
).then(r => r.json());

// 4. Részletezés: Mi Hazánk összes szavazata Csongrád-Csanád megyében
const regionResults = await fetch(
  '/api/elections/2022-parliament/results?partyId=mi-hazank&regionId=csongrad-csanad'
).then(r => r.json());
```

---

## 7. Következő Lépések

### Phase 1: Adatgyűjtés (This Week)
- [ ] NVI webhelyről a 2022-es és 2023-as adatok letöltése
- [ ] CSV formátumra konvertálás (ha kell)
- [ ] Az összes település azonosítóhoz rendelése

### Phase 2: Integrációs előkészítés (Next Week)
- [ ] TypeScript fájlok elkészítése
- [ ] Backend API endpointok megírása
- [ ] Import skriptek futtatása

### Phase 3: Frontend integráció (Following Week)
- [ ] ElectionStats komponens
- [ ] Térkép szavazatok alapján történő szín-kódolása
- [ ] Szavazati statisztikák megjelenítése

---

**Megjegyzés**: Az összes fent leírt fájl képes lesz kezelni a teljes magyar szavazóbázist, beleértve Budapest 23 kerületét és az összes községet, városját.
