import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import { quizRouter } from './routes/quizRoutes';
import { reportRouter } from './routes/reportRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

// Cloud Performance & Middleware Plugins
app.use(compression());
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/quiz', quizRouter);
app.use('/api/reports', reportRouter);

// Health check endpoint for Cloud monitors (Render, AWS, Railway, Cloud Run)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'QuizQuake: BrainStorm Arena Adaptive Engine',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Cloud Static Client Hosting: Serve React Single Page Application in Production
const CANDIDATE_CLIENT_PATHS = [
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
  path.resolve(__dirname, 'client'),
  path.resolve(process.cwd(), 'dist/client')
];

let clientDistPath: string | null = null;
for (const p of CANDIDATE_CLIENT_PATHS) {
  if (fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html'))) {
    clientDistPath = p;
    break;
  }
}

if (clientDistPath) {
  console.log(`🌐 Cloud Hosting active: serving frontend from ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  // SPA fallback for all non-API GET requests
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath!, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 QuizQuake Backend Server running on port ${PORT}`);
  console.log(`📡 Endpoints active: /api/quiz, /api/reports, /api/health`);
  if (clientDistPath) {
    console.log(`🌍 Cloud Web UI accessible at root URL`);
  }
});
