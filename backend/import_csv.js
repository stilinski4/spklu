const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const DATA_FILE = path.join(process.cwd(), 'backend', 'data_spklu.csv');

const cityToProvince = {
  'Anyar': 'Banten',
  'Atambua': 'Nusa Tenggara Timur',
  'Bagan Batu': 'Riau',
  'Bajawa': 'Nusa Tenggara Timur',
  'Balige': 'Sumatera Utara',
  'Banda Aceh': 'Aceh',
  'Bandar Lampung': 'Lampung',
  'Bandung': 'Jawa Barat'
};

function parseCSVLine(line) {
  const parts = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; continue; }
    if (ch === ',' && !inQuotes) { parts.push(current.trim()); current = ''; }
    else current += ch;
  }
  parts.push(current.trim());
  return parts;
}

function toNumberOrNull(v) {
  if (v == null) return null;
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

(async function run() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error('CSV tidak ditemukan:', DATA_FILE);
    process.exit(1);
  }

  const lines = fs.readFileSync(DATA_FILE, 'utf-8')
    .split(/\r?\n/)
    .filter(l => l.trim() !== '');
  const header = parseCSVLine(lines[0]);

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'spklu_db'
  });

  await conn.execute(`CREATE TABLE spklu (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama VARCHAR(255),
    kota VARCHAR(255),
    latitude DOUBLE,
    longitude DOUBLE,
    alamat TEXT,
    tipe_charger_1 VARCHAR(255),
    power_1_kw FLOAT,
    tipe_charger_2 VARCHAR(255),
    power_2_kw FLOAT,
    tipe_charger_3 VARCHAR(255),
    power_3_kw FLOAT,
    tipe_charger_4 VARCHAR(255),
    power_4_kw FLOAT,
    tipe_charger_5 VARCHAR(255),
    power_5_kw FLOAT,
    tipe_charger_6 VARCHAR(255),
    power_6_kw FLOAT,
    tipe_charger_7 VARCHAR(255),
    power_7_kw FLOAT,
    created_at DATETIME
)`);

  await conn.execute('TRUNCATE TABLE spklu');

  let inserted = 0;
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const row = {};
    header.forEach((h, idx) => { row[h] = cols[idx] ?? ''; });

    // Map up to 7 charger types and power columns from CSV
    // Adjust these keys if your CSV uses different headers
    const chargerTypes = [];
    const chargerPowers = [];
    for (let j = 1; j <= 7; j++) {
      chargerTypes.push((row[`Tipe Charger ${j}`] || '').trim());
      chargerPowers.push(toNumberOrNull(row[`Power ${j} (kW)`]));
    }

    await conn.execute(
      'INSERT INTO spklu (nama, kota, latitude, longitude, alamat, tipe_charger_1, power_1_kw, tipe_charger_2, power_2_kw, tipe_charger_3, power_3_kw, tipe_charger_4, power_4_kw, tipe_charger_5, power_5_kw, tipe_charger_6, power_6_kw, tipe_charger_7, power_7_kw, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [
        row['Nama'] || '',
        row['Kota'] || '',
        toNumberOrNull(row['Latitude']),
        toNumberOrNull(row['Longitude']),
        row['Alamat'] || '',
        chargerTypes[0] || '',
        chargerPowers[0],
        chargerTypes[1] || '',
        chargerPowers[1],
        chargerTypes[2] || '',
        chargerPowers[2],
        chargerTypes[3] || '',
        chargerPowers[3],
        chargerTypes[4] || '',
        chargerPowers[4],
        chargerTypes[5] || '',
        chargerPowers[5],
        chargerTypes[6] || '',
        chargerPowers[6],
        new Date()
      ]
    );
    inserted++;
  }

  console.log(`Imported ${inserted} rows.`);
  await conn.end();
})().catch(err => {
  console.error(err);
  process.exit(1);
});
