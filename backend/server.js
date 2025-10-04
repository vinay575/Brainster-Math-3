const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { initializeFirebase } = require('./config/firebase');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const videoRoutes = require('./routes/videos');
const levelRequestRoutes = require('./routes/levelRequests');

const app = express();
const PORT = process.env.PORT || 5000;

// Allow multiple origins from .env (comma-separated)
const allowedOrigins = (process.env.FRONTEND_URLS || 'http://localhost:3000,https://sprightly-cuchufli-5a381c.netlify.app').split(',');

// Add debugging
console.log('Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman or curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`CORS allowing origin: ${origin}`);
      return callback(null, true);
    }
    
    // Log the blocked origin for debugging
    console.log(`CORS blocked origin: ${origin}`);
    console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
    
    return callback(new Error(`CORS policy: Origin ${origin} not allowed`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/level-requests', levelRequestRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'BrainsterMath API is running' });
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({ 
    status: 'CORS OK', 
    origin: req.headers.origin,
    message: 'CORS is working correctly' 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message || err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
async function startServer() {
  try {
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database. Check your configuration.');
      process.exit(1);
    }

    initializeFirebase();

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`   Allowed Origins: ${allowedOrigins.join(', ')}`);
      console.log(`   API Health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
