import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import api from './routes/api.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';   // ⭐ 必须加入

dotenv.config();

// -------------------------------------------------------
// Environment Variable Validation
// -------------------------------------------------------
const requiredEnvVars = ['JWT_SECRET', 'DB_FILE', 'FRONTEND_ORIGIN'];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    throw new Error(`❌ Missing required environment variable: ${varName}`);
  }
}

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------------------------------------------
// Security Headers
// -------------------------------------------------------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// -------------------------------------------------------
// CORS Configuration
// -------------------------------------------------------
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    const allowedOrigins = process.env.FRONTEND_ORIGIN.split(',');
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// -------------------------------------------------------
// Logging (Development)
// -------------------------------------------------------
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// -------------------------------------------------------
// ⭐ 添加 Cookie Parser —— 登录才能正常工作
// -------------------------------------------------------
app.use(cookieParser());

// -------------------------------------------------------
// Body Parsers
// -------------------------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// -------------------------------------------------------
// Static File Hosting
// -------------------------------------------------------
const uploadsPath = path.resolve(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

console.log('📁 Serving uploads from:', uploadsPath);

// -------------------------------------------------------
// Health Check
// -------------------------------------------------------
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// -------------------------------------------------------
// API Routes
// -------------------------------------------------------
app.use('/api', api);

// -------------------------------------------------------
// 404
// -------------------------------------------------------
app.use(notFoundHandler);

// -------------------------------------------------------
// Global Error Handler
// -------------------------------------------------------
app.use(errorHandler);

export default app;
