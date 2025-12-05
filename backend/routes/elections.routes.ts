/**
 * Election Data API Routes
 * Express.js routes for querying Hungarian election voting data
 */

import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import {
  SettlementElectionData,
  PartyVotingResult,
  ElectionDataSet,
  ApiResponse,
  ElectionQuery
} from '../types/election.types';

const router = Router();

// In-memory storage for election data
const elections = new Map<string, ElectionDataSet>();

/**
 * Initialize elections data from JSON files in data/elections directory
 */
export function initializeElectionData(): void {
  // Handle both ts-node and compiled js execution
  const isCompiledJs = __dirname.includes('dist');
  const electionsDir = isCompiledJs 
    ? path.join(__dirname, '../../data/elections')
    : path.join(__dirname, '../data/elections');

  if (!fs.existsSync(electionsDir)) {
    console.warn(`Elections directory not found: ${electionsDir}`);
    return;
  }

  try {
    fs.readdirSync(electionsDir).forEach(file => {
      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(electionsDir, file);
          const rawData = fs.readFileSync(filePath, 'utf-8');
          const data: ElectionDataSet = JSON.parse(rawData);
          elections.set(data.electionId, data);
          console.log(`Loaded election data: ${data.electionId}`);
        } catch (error) {
          console.error(`Error loading election file ${file}:`, error);
        }
      }
    });
  } catch (error) {
    console.error('Error initializing election data:', error);
  }
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * GET /api/elections
 * Get list of available elections
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const electionsList = Array.from(elections.values()).map(e => ({
      id: e.electionId,
      name: e.electionName,
      date: e.electionDate,
      type: e.electionType,
      totalVoters: e.totalParticipation,
      participationRate: e.participationRate.toFixed(1)
    }));

    const response: ApiResponse<typeof electionsList> = {
      success: true,
      data: electionsList,
      meta: { count: electionsList.length }
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve elections'
    });
  }
});

/**
 * GET /api/elections/:electionId
 * Get full election dataset
 */
router.get('/:electionId', (req: Request, res: Response) => {
  try {
    const election = elections.get(req.params.electionId);

    if (!election) {
      return res.status(404).json({
        success: false,
        error: `Election not found: ${req.params.electionId}`
      });
    }

    const response: ApiResponse<ElectionDataSet> = {
      success: true,
      data: election
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve election data'
    });
  }
});

/**
 * GET /api/elections/:electionId/results
 * Get all settlement results for an election
 * Query params: regionId, partyId, limit, offset
 */
router.get('/:electionId/results', (req: Request, res: Response) => {
  try {
    const election = elections.get(req.params.electionId);

    if (!election) {
      return res.status(404).json({
        success: false,
        error: `Election not found: ${req.params.electionId}`
      });
    }

    let results: SettlementElectionData[] = [];

    // Flatten all settlement results
    for (const region of election.regionResults) {
      results.push(...region.settlementResults);
    }

    // Filter by region if specified
    if (req.query.regionId) {
      const regionData = election.regionResults.find(
        r => r.regionId === req.query.regionId
      );
      if (regionData) {
        results = regionData.settlementResults;
      }
    }

    // Filter by party if specified - keep only that party's result
    if (req.query.partyId) {
      results = results.map(settlement => ({
        ...settlement,
        partyResults: settlement.partyResults.filter(
          p => p.partyId === req.query.partyId
        )
      }));
    }

    // Apply limit and offset
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
    const offset = parseInt(req.query.offset as string) || 0;
    const paginatedResults = results.slice(offset, offset + limit);

    const response: ApiResponse<SettlementElectionData[]> = {
      success: true,
      data: paginatedResults,
      meta: {
        count: paginatedResults.length,
        limit,
        offset,
        total: results.length
      }
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve election results'
    });
  }
});

/**
 * GET /api/elections/:electionId/settlements/:settlementId
 * Get voting results for a specific settlement in a specific election
 */
router.get('/:electionId/settlements/:settlementId', (req: Request, res: Response) => {
  try {
    const election = elections.get(req.params.electionId);

    if (!election) {
      return res.status(404).json({
        success: false,
        error: `Election not found: ${req.params.electionId}`
      });
    }

    // Search for settlement in all regions
    let settlement: SettlementElectionData | undefined;

    for (const region of election.regionResults) {
      settlement = region.settlementResults.find(
        s => s.settlementId === req.params.settlementId
      );
      if (settlement) break;
    }

    if (!settlement) {
      return res.status(404).json({
        success: false,
        error: `Settlement not found: ${req.params.settlementId}`
      });
    }

    const response: ApiResponse<SettlementElectionData> = {
      success: true,
      data: settlement
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve settlement election data'
    });
  }
});

/**
 * GET /api/elections/:electionId/by-party/:partyId
 * Get top settlements for a specific party in an election
 * Query params: limit (default 20), regionId
 */
router.get('/:electionId/by-party/:partyId', (req: Request, res: Response) => {
  try {
    const election = elections.get(req.params.electionId);

    if (!election) {
      return res.status(404).json({
        success: false,
        error: `Election not found: ${req.params.electionId}`
      });
    }

    const results: Array<{
      settlementId: string;
      settlementName: string;
      votes: number;
      percentage: number;
      rank: number;
    }> = [];

    // Collect party results from all settlements
    for (const region of election.regionResults) {
      // Filter by region if specified
      if (req.query.regionId && region.regionId !== req.query.regionId) {
        continue;
      }

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
            rank: 0 // Will be set after sorting
          });
        }
      }
    }

    // Sort by votes descending
    results.sort((a, b) => b.votes - a.votes);

    // Assign ranks
    results.forEach((r, idx) => {
      r.rank = idx + 1;
    });

    // Apply limit
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const limitedResults = results.slice(0, limit);

    const response: ApiResponse<typeof limitedResults> = {
      success: true,
      data: limitedResults,
      meta: {
        count: limitedResults.length,
        total: results.length
      }
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve party results'
    });
  }
});

/**
 * GET /api/elections/:electionId/regions
 * Get regional aggregated results
 */
router.get('/:electionId/regions', (req: Request, res: Response) => {
  try {
    const election = elections.get(req.params.electionId);

    if (!election) {
      return res.status(404).json({
        success: false,
        error: `Election not found: ${req.params.electionId}`
      });
    }

    const regions = election.regionResults.map(r => ({
      regionId: r.regionId,
      regionName: r.regionName,
      totalVoters: r.totalVoters,
      participationRate: r.participationRate.toFixed(1),
      settlementCount: r.settlementResults.length,
      topParty: r.aggregatedPartyResults[0] // Highest vote party
    }));

    const response: ApiResponse<typeof regions> = {
      success: true,
      data: regions,
      meta: { count: regions.length }
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve regional data'
    });
  }
});

/**
 * GET /api/elections/:electionId/parties
 * Get national party results
 */
router.get('/:electionId/parties', (req: Request, res: Response) => {
  try {
    const election = elections.get(req.params.electionId);

    if (!election) {
      return res.status(404).json({
        success: false,
        error: `Election not found: ${req.params.electionId}`
      });
    }

    const response: ApiResponse<PartyVotingResult[]> = {
      success: true,
      data: election.nationalPartyResults,
      meta: { count: election.nationalPartyResults.length }
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve party results'
    });
  }
});

/**
 * POST /api/elections/import
 * Import election data from file (admin endpoint)
 * Body: { filePath: string, electionId: string }
 */
router.post('/import', (req: Request, res: Response) => {
  try {
    const { filePath, electionId } = req.body;

    if (!filePath || !electionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: filePath, electionId'
      });
    }

    // Security: validate file path to prevent directory traversal
    const normalizedPath = path.normalize(filePath);
    if (normalizedPath.includes('..')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file path'
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: `File not found: ${filePath}`
      });
    }

    try {
      const rawData = fs.readFileSync(filePath, 'utf-8');
      const data: ElectionDataSet = JSON.parse(rawData);

      // Validate data structure
      if (!data.electionId || !data.electionDate || !data.regionResults) {
        return res.status(400).json({
          success: false,
          error: 'Invalid election data structure'
        });
      }

      // Store in memory
      elections.set(electionId, data);

      const response: ApiResponse<{ electionId: string }> = {
        success: true,
        data: { electionId }
      };

      res.json(response);
    } catch (parseError) {
      res.status(400).json({
        success: false,
        error: 'Invalid JSON file'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to import election data'
    });
  }
});

export default router;
