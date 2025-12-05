/**
 * Election Data Import Script
 * Converts CSV/Excel election data to JSON format
 * Usage: npx ts-node import-elections.ts <csvFile> <electionId>
 * Example: npx ts-node import-elections.ts ./2022-parliament.csv 2022-parliament
 */

import fs from 'fs';
import path from 'path';
import {
  SettlementElectionData,
  PartyVotingResult,
  ElectionDataSet,
  RegionElectionData,
  RawElectionRow,
  ElectionType
} from '../types/election.types';

interface ProcessingResult {
  success: boolean;
  electionId: string;
  processedSettlements: number;
  errors: Array<{
    row: number;
    settlement: string;
    error: string;
  }>;
}

/**
 * Parse CSV content into rows
 * Expected CSV format:
 * settlementId,settlementName,registeredVoters,totalVoters,validVotes,fidesz-kdnp,mi-hazank,jobbik,dk,mszp-parbeszed,lmp,momentum
 */
function parseCSV(content: string): RawElectionRow[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file is empty or has no data rows');
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const rows: RawElectionRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());

    if (values.length !== headers.length) {
      console.warn(`Row ${i + 1} has incorrect number of columns, skipping`);
      continue;
    }

    const row: any = {};
    headers.forEach((header, idx) => {
      const value = values[idx];

      // Parse numeric columns
      if (['registeredVoters', 'totalVoters', 'validVotes'].includes(header)) {
        row[header] = parseInt(value) || 0;
      } else {
        // Party vote columns are also numeric
        row[header] = isNaN(parseInt(value)) ? value : parseInt(value);
      }
    });

    rows.push(row as RawElectionRow);
  }

  return rows;
}

/**
 * Aggregate settlement data to regional level
 */
function aggregateByRegion(
  settlements: SettlementElectionData[],
  regionId: string,
  regionName: string,
  electionId: string
): RegionElectionData {
  const regionSettlements = settlements.filter(s => s.settlementId.startsWith(regionId));

  const totalRegisteredVoters = regionSettlements.reduce((sum, s) => sum + s.registeredVoters, 0);
  const totalVoters = regionSettlements.reduce((sum, s) => sum + s.totalVoters, 0);

  // Aggregate party results
  const partyVotes: Map<string, { votes: number; partyName: string }> = new Map();

  for (const settlement of regionSettlements) {
    for (const party of settlement.partyResults) {
      if (!partyVotes.has(party.partyId)) {
        partyVotes.set(party.partyId, {
          votes: 0,
          partyName: party.partyName
        });
      }
      const current = partyVotes.get(party.partyId)!;
      current.votes += party.votes;
    }
  }

  // Convert to array and calculate percentages
  const aggregatedPartyResults: PartyVotingResult[] = Array.from(partyVotes.entries())
    .map(([partyId, data]) => ({
      partyId,
      partyName: data.partyName,
      votes: data.votes,
      percentage: totalVoters > 0 ? (data.votes / totalVoters) * 100 : 0
    }))
    .sort((a, b) => b.votes - a.votes);

  return {
    regionId: regionId as any,
    regionName,
    electionId,
    totalRegisteredVoters,
    totalVoters,
    participationRate: totalRegisteredVoters > 0 ? (totalVoters / totalRegisteredVoters) * 100 : 0,
    aggregatedPartyResults,
    settlementResults: regionSettlements
  };
}

/**
 * Main import function
 */
async function importElectionData(
  csvFilePath: string,
  electionId: string,
  electionDate: string = '2022-04-03',
  electionType: ElectionType = ElectionType.PARLIAMENT
): Promise<ProcessingResult> {
  const result: ProcessingResult = {
    success: false,
    electionId,
    processedSettlements: 0,
    errors: []
  };

  try {
    // Read CSV file
    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`CSV file not found: ${csvFilePath}`);
    }

    console.log(`Reading CSV file: ${csvFilePath}`);
    const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
    const rawRows = parseCSV(csvContent);

    console.log(`Processing ${rawRows.length} rows...`);

    // Load party definitions
    const partiesPath = path.join(__dirname, '../data/raw/parties.json');
    const partiesData = JSON.parse(fs.readFileSync(partiesPath, 'utf-8'));
    const partyIds = partiesData.parties.map((p: any) => p.id);

    const settlements: SettlementElectionData[] = [];
    let totalRegisteredVoters = 0;
    let totalVoters = 0;
    let totalValidVotes = 0;

    // Process each row
    for (let i = 0; i < rawRows.length; i++) {
      try {
        const row = rawRows[i];

        if (!row.settlementId || !row.settlementName) {
          result.errors.push({
            row: i + 2,
            settlement: 'Unknown',
            error: 'Missing settlementId or settlementName'
          });
          continue;
        }

        // Parse voting data
        const registeredVoters = row.registeredVoters as number;
        const totalVotersValue = row.totalVoters as number;
        const validVotes = row.validVotes as number;

        if (totalVotersValue > registeredVoters) {
          result.errors.push({
            row: i + 2,
            settlement: row.settlementName,
            error: `Total voters (${totalVotersValue}) exceeds registered voters (${registeredVoters})`
          });
          continue;
        }

        // Build party results
        const partyResults: PartyVotingResult[] = [];

        for (const partyId of partyIds) {
          const votes = (row[partyId] as number) || 0;

          partyResults.push({
            partyId,
            partyName: partiesData.parties.find((p: any) => p.id === partyId)?.name || partyId,
            votes,
            percentage: validVotes > 0 ? (votes / validVotes) * 100 : 0
          });
        }

        // Sort by votes descending
        partyResults.sort((a, b) => b.votes - a.votes);

        // Create settlement record
        const settlement: SettlementElectionData = {
          settlementId: row.settlementId,
          settlementName: row.settlementName,
          electionId,
          electionDate,
          electionType,
          registeredVoters,
          totalVoters: totalVotersValue,
          participationRate:
            registeredVoters > 0 ? (totalVotersValue / registeredVoters) * 100 : 0,
          leadVotes: totalVotersValue,
          validVotes,
          invalidVotes: totalVotersValue - validVotes,
          partyResults
        };

        settlements.push(settlement);

        totalRegisteredVoters += registeredVoters;
        totalVoters += totalVotersValue;
        totalValidVotes += validVotes;
        result.processedSettlements++;
      } catch (error) {
        result.errors.push({
          row: i + 2,
          settlement: rawRows[i].settlementName || 'Unknown',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Aggregate to national level
    const nationalPartyVotes: Map<string, { votes: number; partyName: string }> = new Map();

    for (const settlement of settlements) {
      for (const party of settlement.partyResults) {
        if (!nationalPartyVotes.has(party.partyId)) {
          nationalPartyVotes.set(party.partyId, {
            votes: 0,
            partyName: party.partyName
          });
        }
        const current = nationalPartyVotes.get(party.partyId)!;
        current.votes += party.votes;
      }
    }

    const nationalPartyResults: PartyVotingResult[] = Array.from(
      nationalPartyVotes.entries()
    )
      .map(([partyId, data]) => ({
        partyId,
        partyName: data.partyName,
        votes: data.votes,
        percentage: totalValidVotes > 0 ? (data.votes / totalValidVotes) * 100 : 0
      }))
      .sort((a, b) => b.votes - a.votes);

    // Group settlements by region
    const regionMap = new Map<string, SettlementElectionData[]>();

    for (const settlement of settlements) {
      // Extract region from settlementId (e.g., "budapest" from "budapest" or "budapest-01")
      const regionId = settlement.settlementId.split('-')[0];

      if (!regionMap.has(regionId)) {
        regionMap.set(regionId, []);
      }
      regionMap.get(regionId)!.push(settlement);
    }

    // Create election dataset
    const dataset: ElectionDataSet = {
      electionId,
      electionDate,
      electionType,
      electionName: `${new Date(electionDate).toLocaleDateString('hu-HU')} - ${
        electionType === ElectionType.PARLIAMENT
          ? 'Országgyűlési választások'
          : 'Önkormányzati választások'
      }`,
      totalRegisteredVoters,
      totalParticipation: totalVoters,
      participationRate: totalRegisteredVoters > 0 ? (totalVoters / totalRegisteredVoters) * 100 : 0,
      regionResults: Array.from(regionMap.entries())
        .map(([regionId, regionSettlements]) => {
          // Get region name (simplified - in production, use a lookup table)
          const regionNames: { [key: string]: string } = {
            budapest: 'Budapest',
            'hajdu-bihar': 'Hajdú-Bihar',
            'csongrad-csanad': 'Csongrád-Csanád',
            baranya: 'Baranya',
            'borsod-abauj-zemplen': 'Borsod-Abaúj-Zemplén',
            'gyor-moson-sopron': 'Győr-Moson-Sopron'
          };

          const regionName = regionNames[regionId] || regionId;

          return aggregateByRegion(
            regionSettlements,
            regionId,
            regionName,
            electionId
          );
        }),
      nationalPartyResults
    };

    result.success = true;

    // Save to JSON file
    const outputDir = path.join(__dirname, '../data/elections');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `${electionId}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(dataset, null, 2), 'utf-8');

    console.log(`✓ Election data saved to: ${outputPath}`);
    console.log(`✓ Processed ${result.processedSettlements} settlements`);
    console.log(`✓ Total voters: ${totalVoters.toLocaleString('hu-HU')}`);
    console.log(`✓ Participation rate: ${dataset.participationRate.toFixed(1)}%`);

    if (result.errors.length > 0) {
      console.log(`⚠ ${result.errors.length} errors encountered during import`);
      result.errors.slice(0, 5).forEach(err => {
        console.log(`  - Row ${err.row} (${err.settlement}): ${err.error}`);
      });
    }

    return result;
  } catch (error) {
    result.success = false;
    result.errors = [
      {
        row: 0,
        settlement: 'N/A',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    ];
    console.error('Import failed:', error);
    return result;
  }
}

// ============================================================================
// CLI EXECUTION
// ============================================================================

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: npx ts-node import-elections.ts <csvFile> <electionId> [electionDate] [electionType]');
    console.error('Example: npx ts-node import-elections.ts ./2022-parliament.csv 2022-parliament 2022-04-03 parliament');
    process.exit(1);
  }

  const csvFile = args[0];
  const electionId = args[1];
  const electionDate = args[2] || '2022-04-03';
  const electionType = (args[3] || 'parliament') as ElectionType;

  importElectionData(csvFile, electionId, electionDate, electionType)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { importElectionData };
