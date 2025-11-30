require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2'); // ganti dari mongoose ke mysql2

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,      // contoh: 'localhost'
  user: process.env.DB_USER,      // contoh: 'root'
  password: process.env.DB_PASS,  // contoh: ''
  database: process.env.DB_NAME   // contoh: 'spklu'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('Database connected');
  // start server only after DB is connected
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
});

// health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// routes
const spkluRoutes = require('./routes/spklu');
app.use('/api/spklu', spkluRoutes);

// start server
// (moved inside db.connect)
