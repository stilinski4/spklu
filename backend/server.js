import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

// Debug: cek apakah file .env ada dan terbaca
const envPath = path.resolve(process.cwd(), '.env');
console.log('.env path:', envPath, 'exists:', fs.existsSync(envPath));
console.log('Loaded env:', {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME
});

import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';

import spkluRoutes from './routes/spklu.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug env vars
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : '(empty)');
console.log('DB_NAME:', process.env.DB_NAME);

// Cek env vars (pakai DB_PASSWORD, bukan DB_PASS)
if (
  !process.env.DB_HOST ||
  !process.env.DB_USER ||
  process.env.DB_PASSWORD === undefined ||
  process.env.DB_PASSWORD === null ||
  !process.env.DB_NAME
) {
  console.error('One or more required DB environment variables are missing.');
  process.exit(1);
}

// DB Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD === 'empty' ? '' : process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

console.log('Attempting to connect to database...');

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }

  console.log('Database connected');

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/spklu', spkluRoutes);

export default app;
