import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { connectDB } from './db.js';
import chatRoutes from './routes/chat.js';
import uploadRoutes from './routes/upload.js';
import authRoutes from './routes/auth.js';
import imagineRoutes from './routes/imagine.js';
import gistRoutes from './routes/gist.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB (non-blocking — app works without it)
connectDB();

// CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
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

// Routes
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

// Error handling
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(port, () => {
  console.log(`\n⚡ Amulya AI Backend running on http://localhost:${port}`);
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
