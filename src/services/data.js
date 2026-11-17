// SQL for spaces and bookings. Every function takes `db`: the pool or a transaction client.
import { SLOTS, currentSlot, slotEnd, todayBangkok } from '../dates.js';
import { describeRules } from './rules.js';

/** Statuses that hold a seat/room for their slot. */
export const BLOCKING = ['pending_group', 'confirmed', 'checked_in'];

/**
 * Advance time-based statuses (no cron needed): unfilled meeting groups expire and
 * finished slots complete. Cheap enough to run before each API request.
 */
export async function sweepStatuses(db) {
  await db.query(
    `UPDATE bookings SET status = 'expired', invite_token = NULL, updated_at = now()
     WHERE status = 'pending_group' AND invite_expires_at < now()`,
  );
  await db.query(
    `UPDATE bookings SET status = 'completed', updated_at = now()
     WHERE status IN ('confirmed', 'checked_in')
       AND ((booking_date + slot::time + interval '1 hour') AT TIME ZONE 'Asia/Bangkok') < now()`,
  );
}

// ---------- spaces ----------

const SPACE_SQL = `
  SELECT sp.*,
         COALESCE(st.labels, '{}') AS seat_labels,
         COALESCE(active.n, 0) AS active_count
  FROM spaces sp
  LEFT JOIN (
    SELECT space_id, array_agg(label ORDER BY label) AS labels FROM seats GROUP BY space_id
  ) st ON st.space_id = sp.id
  LEFT JOIN (
    SELECT b.space_id, COUNT(*)::int AS n
    FROM bookings b JOIN booking_participants p ON p.booking_id = b.id
    WHERE b.booking_date = $1::date AND b.slot = $2 AND b.status IN ('confirmed', 'checked_in')
    GROUP BY b.space_id
  ) active ON active.space_id = sp.id`;

function toSpace(row) {
  const space = {
    id: row.id,
    name: row.name,
    category: row.category,
    building: row.building,
    floor: row.floor,
    lat: row.lat,
    lng: row.lng,
    capacity: row.capacity,
    minGroupSize: row.min_group_size,
    seats: row.seat_labels,
    amenities: row.amenities,
    rules: row.rules,
    activeCount: row.active_count,
  };
  // Live density: people in active bookings for the current slot / capacity.
  space.density = Math.min(space.activeCount / space.capacity, 1);
  space.ruleSummary = describeRules(space);
  return space;
}

function liveParams(now = new Date()) {
  return [todayBangkok(now), currentSlot(now) ?? ''];
}

export async function listSpaces(db) {
  const { rows } = await db.query(`${SPACE_SQL} ORDER BY sp.id`, liveParams());
  return rows.map(toSpace);
}

/** One space; pass `{ lock: true }` inside a transaction to serialize bookings for it. */
export async function findSpace(db, id, { lock = false } = {}) {
  if (lock) await db.query('SELECT 1 FROM spaces WHERE id = $1 FOR UPDATE', [id]);
  const { rows } = await db.query(`${SPACE_SQL} WHERE sp.id = $3`, [...liveParams(), id]);
  return rows[0] ? toSpace(rows[0]) : null;
}

/** Active bookings in one space/slot: [{ id, seatLabel }]. */
export async function takenInSlot(db, spaceId, date, slot) {
  const { rows } = await db.query(
    `SELECT b.id, st.label AS "seatLabel"
     FROM bookings b LEFT JOIN seats st ON st.id = b.seat_id
     WHERE b.space_id = $1 AND b.booking_date = $2::date AND b.slot = $3 AND b.status = ANY($4::text[])`,
    [spaceId, date, slot, BLOCKING],
  );
  return rows;
}

/** Per-slot availability for a space on a date. */
export async function slotAvailability(db, space, date, now = new Date()) {
  const { rows } = await db.query(
    `SELECT b.slot, st.label AS "seatLabel"
     FROM bookings b LEFT JOIN seats st ON st.id = b.seat_id
     WHERE b.space_id = $1 AND b.booking_date = $2::date AND b.status = ANY($3::text[])`,
    [space.id, date, BLOCKING],
  );
  return SLOTS.map((slot) => {
    const taken = rows.filter((r) => r.slot === slot);
    const past = slotEnd(date, slot) <= now;
    if (space.category === 'library') {
      const takenSeats = taken.map((r) => r.seatLabel);
      return { slot, past, remaining: space.capacity - takenSeats.length, takenSeats };
    }
    if (space.category === 'coworking') return { slot, past, remaining: space.capacity - taken.length };
    return { slot, past, remaining: taken.length ? 0 : 1 };
  });
}

// ---------- bookings ----------

const BOOKING_SQL = `
  SELECT b.id, b.owner_id, b.space_id, b.slot, b.status, b.invite_token, b.invite_expires_at,
         b.checked_in_at, b.created_at, b.updated_at,
         to_char(b.booking_date, 'YYYY-MM-DD') AS date,
         st.label AS seat_label,
         sp.name, sp.category, sp.building, sp.floor, sp.capacity, sp.min_group_size,
         (SELECT json_agg(json_build_object('id', u.id, 'email', u.email) ORDER BY p.joined_at)
          FROM booking_participants p JOIN users u ON u.id = p.user_id
          WHERE p.booking_id = b.id) AS people
  FROM bookings b
  JOIN spaces sp ON sp.id = b.space_id
  LEFT JOIN seats st ON st.id = b.seat_id`;

function toBooking(row) {
  const people = row.people ?? [];
  return {
    id: row.id,
    ownerId: row.owner_id,
    spaceId: row.space_id,
    category: row.category,
    date: row.date,
    slot: row.slot,
    seatId: row.seat_label,
    status: row.status,
    inviteToken: row.invite_token,
    inviteExpiresAt: row.invite_expires_at,
    checkedInAt: row.checked_in_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    participants: people.map((p) => p.id),
    participantEmails: people.map((p) => p.email),
    space: {
      id: row.space_id,
      name: row.name,
      category: row.category,
      building: row.building,
      floor: row.floor,
      capacity: row.capacity,
      minGroupSize: row.min_group_size,
    },
  };
}

const IS_PARTICIPANT = 'EXISTS (SELECT 1 FROM booking_participants p WHERE p.booking_id = b.id AND p.user_id = $1)';

export async function bookingsForUser(db, userId) {
  const { rows } = await db.query(`${BOOKING_SQL} WHERE ${IS_PARTICIPANT} ORDER BY b.created_at DESC`, [userId]);
  return rows.map(toBooking);
}

/** A booking the user takes part in, or null. */
export async function findBookingForUser(db, id, userId, { lock = false } = {}) {
  if (lock) await db.query('SELECT 1 FROM bookings WHERE id = $1 FOR UPDATE', [id]);
  const { rows } = await db.query(`${BOOKING_SQL} WHERE b.id = $2 AND ${IS_PARTICIPANT}`, [userId, id]);
  return rows[0] ? toBooking(rows[0]) : null;
}

export async function findBookingByInvite(db, token, { lock = false } = {}) {
  if (lock) await db.query('SELECT 1 FROM bookings WHERE invite_token = $1 FOR UPDATE', [token]);
  const { rows } = await db.query(`${BOOKING_SQL} WHERE b.invite_token = $1`, [token]);
  return rows[0] ? toBooking(rows[0]) : null;
}

export async function userHasBookingInSlot(db, userId, date, slot) {
  const { rowCount } = await db.query(
    `SELECT 1 FROM bookings b
     WHERE b.booking_date = $2::date AND b.slot = $3 AND b.status = ANY($4::text[]) AND ${IS_PARTICIPANT}`,
    [userId, date, slot, BLOCKING],
  );
  return rowCount > 0;
}

/** Lock the user row so one person's parallel requests can't double-book a slot. */
export async function lockUser(db, userId) {
  await db.query('SELECT 1 FROM users WHERE id = $1 FOR UPDATE', [userId]);
}
