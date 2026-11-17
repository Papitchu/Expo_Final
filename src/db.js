import pg from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set (see .env.example)');
}

// Keep the pool small: on Vercel every function instance opens its own connections.
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3,
});

export const query = (text, params) => pool.query(text, params);
