/**
 * Express Backend Server
 * Serves election data APIs
 */

import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import electionRoutes, { initializeElectionData } from './routes/elections.routes';
import votingRoutes from './routes/voting.routes';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// CORS support
app.use(cors());

// JSON parsing
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.use('/geojson', express.static(path.join(__dirname, '../frontend/public/geojson')));

// ============================================================================
// ROUTES
// ============================================================================

// Initialize election data
initializeElectionData();

// API routes
app.use('/api/elections', electionRoutes);
app.use('/api/votes', votingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Serve React/Svelte frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api/elections`);
  console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
});

export default app;
