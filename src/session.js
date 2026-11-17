import { randomUUID } from 'node:crypto';
import { query } from './db.js';

/** The logged-in user's id, or null. Read-only: never creates anything. */
export function currentUserId(req) {
  return req.session?.userId ?? null;
}

/**
 * TEMPORARY until real sign-in exists: the first booking from a browser creates an
 * anonymous guest user and remembers it in the signed session cookie. Each visitor
 * only ever sees their own bookings. Replace this with the real login in the auth step.
 */
export async function ensureUser(req) {
  const existing = currentUserId(req);
  if (existing) {
    const { rowCount } = await query('SELECT 1 FROM users WHERE id = $1', [existing]);
    if (rowCount) return existing;
  }
  const { rows } = await query(
    'INSERT INTO users (email, is_guest) VALUES ($1, true) RETURNING id',
    [`guest-${randomUUID()}@guest.invalid`],
  );
  req.session.userId = rows[0].id;
  return rows[0].id;
}
