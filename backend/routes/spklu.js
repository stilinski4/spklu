import 'dotenv/config';
import express from 'express';
import mysql from 'mysql2/promise';

const router = express.Router();

// MySQL pool (promise)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD === 'empty' ? '' : process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Haversine distance function
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// GET all SPKLU
router.get('/all', async (_req, res) => {
  try {
    const conn = await pool.getConnection();
    console.log('DB connected: /all');

    const [rows] = await conn.query('SELECT * FROM spklu');
    conn.release();

    res.json(rows);
  } catch (err) {
    console.error('DB error /all:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST nearest SPKLU
router.post('/nearest', async (req, res) => {
  try {
    const { latitude, longitude, limit = 5 } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const conn = await pool.getConnection();
    console.log('DB connected: /nearest');

    const [rows] = await conn.query('SELECT * FROM spklu');
    conn.release();

    const withDistance = rows.map(row => ({
      ...row,
      distance: calculateDistance(
        latitude,
        longitude,
        row.latitude,
        row.longitude
      )
    }));

    const nearest = withDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, parseInt(limit));

    res.json(nearest);
  } catch (err) {
    console.error('DB error /nearest:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
