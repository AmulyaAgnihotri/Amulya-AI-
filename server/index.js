import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { connectDB } from './db.js';
import chatRoutes from './routes/chat.js';
import uploadRoutes from './routes/upload.js';
import authRoutes from './routes/auth.js';
import imagineRoutes from './routes/imagine.js';
import gistRoutes from './routes/gist.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Connect to MongoDB (non-blocking — app works without it)
connectDB();

// CORS — allow all origins in production (API is protected by auth)
app.use(cors({
  origin: isProduction
    ? (origin, callback) => callback(null, true)
    : ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/imagine', imagineRoutes);
app.use('/api/gist', gistRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Amulya AI Backend',
    timestamp: new Date().toISOString(),
  });
});

// ─── Production: Serve the built React frontend ───
if (isProduction) {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));

  // SPA fallback — all non-API routes serve index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Error handling
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(port, () => {
  console.log(`\n⚡ Amulya AI Backend running on http://localhost:${port}`);
  console.log(`🌍 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  console.log(`📡 API endpoints:`);
  console.log(`   POST /api/auth/register — Register`);
  console.log(`   POST /api/auth/login    — Login`);
  console.log(`   GET  /api/auth/me       — Profile`);
  console.log(`   POST /api/chat          — Streaming chat`);
  console.log(`   GET  /api/chat/history  — Chat history`);
  console.log(`   POST /api/upload        — File analysis`);
  console.log(`   POST /api/imagine       — Image generation`);
  console.log(`   POST /api/gist          — GitHub Gist`);
  console.log(`   GET  /api/health        — Health check\n`);
});
