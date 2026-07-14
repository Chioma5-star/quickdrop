const { Pool } = require('pg');
require('dotenv').config();

// Pool manages multiple client connections for us automatically
const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

// Quick sanity check on startup so connection issues are obvious immediately
pool.connect()
  .then((client) => {
    console.log(' Connected to PostgreSQL database');
    client.release();
  })
  .catch((err) => {
    console.error(' Failed to connect to PostgreSQL:', err.message);
  });

module.exports = pool;