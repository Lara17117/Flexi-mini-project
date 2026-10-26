import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedInitialData } from './utils/seedData.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import wardrobeRoutes from './routes/wardrobeRoutes.js';
import scrapbookRoutes from './routes/scrapbookRoutes.js';
import skincareRoutes from './routes/skincareRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false
}));

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Dev friendly
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limit on authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});

// Health Checks
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'VibeVault Backend',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wardrobe', wardrobeRoutes);
app.use('/api/scrapbook', scrapbookRoutes);
app.use('/api/skincare', skincareRoutes);
app.use('/api/workouts', workoutRoutes);

// 404 Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`
  });
});

// Global Error Handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    await seedInitialData();

    app.listen(PORT, () => {
      console.log(`🌸 VibeVault Server running on http://localhost:${PORT}`);
      console.log(`🌸 Ready for your little universe!`);
    });
  } catch (err) {
    console.error('Fatal server boot error:', err);
    process.exit(1);
  }
};

startServer();
