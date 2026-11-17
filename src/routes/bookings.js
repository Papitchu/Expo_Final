import { Router } from 'express';
import { query } from '../db.js';
import { wrap } from '../http.js';
import { SLOTS } from '../slots.js';
import { isValidDate, todayBangkok } from '../dates.js';
import { currentUserId, ensureUser } from '../session.js';

export const bookingsRouter = Router();

const SELECT_BOOKING = `
  SELECT b.id, to_char(b.booking_date, 'YYYY-MM-DD') AS date, b.slot, b.attendees, b.status,
         s.id AS "seatId", s.label AS seat, sp.id AS "spaceId", sp.name AS "spaceName"
  FROM bookings b
  JOIN seats s ON s.id = b.seat_id
  JOIN spaces sp ON sp.id = s.space_id`;

async function findBooking(id, userId) {
  const { rows } = await query(`${SELECT_BOOKING} WHERE b.id = $1 AND b.user_id = $2`, [id, userId]);
  return rows[0] || null;
}

bookingsRouter.get('/', wrap(async (req, res) => {
  const userId = currentUserId(req);
  if (!userId) return res.json([]);
  const { rows } = await query(
    `${SELECT_BOOKING} WHERE b.user_id = $1 ORDER BY b.booking_date DESC, b.slot, b.id DESC`,
    [userId],
  );
  res.json(rows);
}));

bookingsRouter.post('/', wrap(async (req, res) => {
  const { seatId, date, slot } = req.body ?? {};
  const attendees = typeof req.body?.attendees === 'string' ? req.body.attendees.trim().slice(0, 200) : '';

  if (!Number.isInteger(seatId) || !isValidDate(date) || !SLOTS.includes(slot)) {
    return res.status(400).json({ error: 'ข้อมูลการจองไม่ถูกต้อง' });
  }
  if (date < todayBangkok()) {
    return res.status(400).json({ error: 'ไม่สามารถจองวันที่ผ่านมาแล้วได้' });
  }
  const seat = await query('SELECT 1 FROM seats WHERE id = $1', [seatId]);
  if (!seat.rowCount) return res.status(404).json({ error: 'ไม่พบที่นั่งหรือห้องที่เลือก' });

  const userId = await ensureUser(req);
  try {
    const { rows } = await query(
      `INSERT INTO bookings (user_id, seat_id, booking_date, slot, attendees)
       VALUES ($1, $2, $3::date, $4, $5) RETURNING id`,
      [userId, seatId, date, slot, attendees],
    );
    res.status(201).json(await findBooking(rows[0].id, userId));
  } catch (error) {
    if (error.code === '23505') {  // the unique index: someone else holds this seat/slot
      return res.status(409).json({ error: 'ช่วงเวลานี้ถูกจองแล้ว' });
    }
    throw error;
  }
}));

// Changes the status of one of the CURRENT user's bookings.
function changeStatus(allowedFrom, to) {
  return wrap(async (req, res) => {
    const id = Number(req.params.id);
    const userId = currentUserId(req);
    if (!Number.isInteger(id) || !userId) return res.status(404).json({ error: 'ไม่พบรายการจอง' });

    const { rowCount } = await query(
      `UPDATE bookings SET status = $3
       WHERE id = $1 AND user_id = $2 AND status = ANY($4::text[])`,
      [id, userId, to, allowedFrom],
    );
    if (!rowCount) return res.status(404).json({ error: 'ไม่พบรายการจอง หรือไม่สามารถเปลี่ยนสถานะได้' });
    res.json(await findBooking(id, userId));
  });
}

// TODO: restrict check-in to the booking date / QR code once that flow exists.
bookingsRouter.post('/:id/checkin', changeStatus(['confirmed'], 'checked_in'));
bookingsRouter.post('/:id/cancel', changeStatus(['confirmed', 'checked_in'], 'cancelled'));
