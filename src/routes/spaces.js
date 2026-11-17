import { Router } from 'express';
import { query } from '../db.js';
import { wrap } from '../http.js';
import { SLOTS } from '../slots.js';
import { isValidDate, todayBangkok } from '../dates.js';

export const spacesRouter = Router();

// A space counts as "available" if at least one seat/slot combination is still free that day.
const LIST_SQL = `
  SELECT sp.*,
         COALESCE(seat_counts.n, 0) * $1::int > COALESCE(booked.n, 0) AS available
  FROM spaces sp
  LEFT JOIN (
    SELECT space_id, COUNT(*)::int AS n FROM seats GROUP BY space_id
  ) seat_counts ON seat_counts.space_id = sp.id
  LEFT JOIN (
    SELECT s.space_id, COUNT(*)::int AS n
    FROM bookings b JOIN seats s ON s.id = b.seat_id
    WHERE b.booking_date = $2::date AND b.status <> 'cancelled'
    GROUP BY s.space_id
  ) booked ON booked.space_id = sp.id
  ORDER BY sp.distance`;

spacesRouter.get('/', wrap(async (req, res) => {
  const date = isValidDate(req.query.date) ? req.query.date : todayBangkok();
  const { rows } = await query(LIST_SQL, [SLOTS.length, date]);
  res.json(rows);
}));

// Seats that are still free for one day + slot.
spacesRouter.get('/:id/availability', wrap(async (req, res) => {
  const { date, slot } = req.query;
  if (!isValidDate(date) || !SLOTS.includes(slot)) {
    return res.status(400).json({ error: 'กรุณาเลือกวันที่และช่วงเวลาให้ถูกต้อง' });
  }
  const { rows } = await query(
    `SELECT s.id, s.label
     FROM seats s
     WHERE s.space_id = $1
       AND NOT EXISTS (
         SELECT 1 FROM bookings b
         WHERE b.seat_id = s.id AND b.booking_date = $2::date
           AND b.slot = $3 AND b.status <> 'cancelled')
     ORDER BY s.id`,
    [req.params.id, date, slot],
  );
  res.json(rows);
}));

spacesRouter.get('/:id', wrap(async (req, res) => {
  const space = await query('SELECT * FROM spaces WHERE id = $1', [req.params.id]);
  if (!space.rowCount) return res.status(404).json({ error: 'ไม่พบพื้นที่ที่ต้องการ' });
  const seats = await query('SELECT id, label FROM seats WHERE space_id = $1 ORDER BY id', [req.params.id]);
  res.json({ ...space.rows[0], seats: seats.rows });
}));
