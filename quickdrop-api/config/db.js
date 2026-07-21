const { Pool } = require('pg');
require('dotenv').config();

// Render (and most hosts) provide one DATABASE_URL connection string.
// Locally, we keep using the separate PGHOST/PGUSER/etc variables from .env.
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // required for Render's managed Postgres
    })
  : new Pool({
      host: process.env.PGHOST,
      port: process.env.PGPORT,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
    });

// Quick sanity check on startup so connection issues are obvious immediately
pool.connect()
  .then((client) => {
    console.log('✅ Connected to PostgreSQL database');
    client.release();
  })
  .catch((err) => {
    console.error('❌ Failed to connect to PostgreSQL:', err.message);
  });

module.exports = pool;