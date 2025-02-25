const { Pool } = require('pg');
require('dotenv').config();

console.log('DATABASE_URL:', process.env.DATABASE_URL); // Debugging

// Database connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Test the connection
pool.connect()
    .then(() => console.log('✅ Connected to PostgreSQL'))
    .catch(err => console.error('❌ Database connection error:', err));

module.exports = pool;
