import pg from 'pg';
import { requireEnv } from './env.js';

// Keep the pool small: on Vercel every function instance opens its own connections.
// The local PGlite database (npm run db:local) needs PG_POOL_MAX=1.
export const pool = new pg.Pool({
  connectionString: requireEnv('DATABASE_URL'),
  max: Number(process.env.PG_POOL_MAX || 3),
});

export const query = (text, params) => pool.query(text, params);

/** Runs `fn(client)` inside BEGIN/COMMIT; rolls back if it throws. */
export async function transaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
