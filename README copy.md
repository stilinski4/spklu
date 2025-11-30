# SPKLU

Backend quickstart
- Copy backend/.env.example to backend/.env and adjust if needed.
- Create DB schema (MySQL):
  - mysql -u root -p < backend/db.sql
- Import data:
  - cd backend
  - npm run import:csv
- Run API:
  - npm start
- Endpoints:
  - GET /api/health
  - GET /api/spklu/all
  - POST /api/spklu/nearest { "latitude": -6.2, "longitude": 106.8, "limit": 5 }

## Backend
1. Masuk folder backend
2. Jalankan: `npm install`
3. Salin `.env.example` ke `.env` (sesuaikan PORT bila perlu)
4. Start server: `npm start`
5. Endpoint: `GET /api/spklu`

Opsional import ke MySQL:
```
npm run import
```

## Frontend
```
cd frontend
npm install
npm run dev
```

Pastikan backend berjalan di port yang sama dengan yang dipakai fetch (default 4000).

1. MySQL

Start MySQL server.

From terminal: cd backend then mysql -u root -p < db.sql (or run queries di admin tool).

Copy .env.example → .env dan isi credential.

2. Import CSV

Letakkan CSV (named e.g. data.csv) di backend/.

cd backend && npm install

node import_csv.js data.csv (or npm run import)

3. Start backend

cd backend

npm start (server runs on http://localhost:4000)

4. Start frontend

cd frontend && npm install

npm run dev

Open URL dari Vite (default http://localhost:5173)

5. API Endpoints

- `GET /api/spklu`: Fetch all SPKLU data.
- `POST /api/spklu`: Add new SPKLU data (requires JSON payload).
- `DELETE /api/spklu/:id`: Delete SPKLU by ID.