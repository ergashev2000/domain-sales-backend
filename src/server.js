import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from './middlewares/authMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
// import domainRoutes from './routes/domainRoutes.js';
// import categoryRoutes from './routes/categoryRoutes.js';
import googleAuthRoutes from './routes/googleAuthRoutes.js';
import dotenv from 'dotenv';
import { SECRET_KEY } from './environments/auth_env.js';
import pool from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:5500', 
    'https://yourdomain.com'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({ 
  secret: SECRET_KEY, 
  resave: false, 
  saveUninitialized: true 
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// app.use('/api/domains', domainRoutes);
// app.use('/api/categories', categoryRoutes);
app.use('/api/auth/google', googleAuthRoutes);

// Database connection test
const testDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Database connection successful');
    client.release();
  } catch (error) {
    console.error('Database connection error:', error);
  }
};

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await testDatabaseConnection();
});

export { pool };
