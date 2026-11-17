import { randomBytes } from 'node:crypto';
import { Router } from 'express';
import { query, transaction } from '../db.js';
import { CHECKIN_EARLY_MINUTES, slotEnd, slotStart } from '../dates.js';
import { HttpError, wrap } from '../http.js';
import { currentUserId, requireLogin } from '../session.js';
import {
  bookingsForUser,
  findBookingByInvite,
  findBookingForUser,
  findSpace,
  lockUser,
  takenInSlot,
  userHasBookingInSlot,
} from '../services/data.js';
import { validateCapacity, validateDateAndSlot, validateJoin } from '../services/rules.js';

export const bookingsRouter = Router();
bookingsRouter.use(requireLogin);

const db = { query };
const INVITE_TTL_MS = Number(process.env.INVITE_TTL_MINUTES || 15) * 60 * 1000;
const newBookingId = () => `BK-${randomBytes(4).toString('hex').toUpperCase()}`;

async function requireOwnBooking(client, id, userId, options) {
  const booking = await findBookingForUser(client, id, userId, options);
  if (!booking) throw new HttpError(404, 'ไม่พบรายการจอง');
  return booking;
}

bookingsRouter.get('/', wrap(async (req, res) => {
  res.json({ bookings: await bookingsForUser(db, currentUserId(req)) });
}));

// Preview a meeting-room invite before joining (QR code target).
bookingsRouter.get('/invite/:token', wrap(async (req, res) => {
  const booking = await findBookingByInvite(db, req.params.token);
  if (!booking) return res.status(404).json({ error: 'ลิงก์เชิญไม่ถูกต้องหรือหมดอายุแล้ว' });
  res.json({ booking });
}));

bookingsRouter.post('/join/:token', wrap(async (req, res) => {
  const userId = currentUserId(req);
  const booking = await transaction(async (client) => {
    await lockUser(client, userId);
    const pending = await findBookingByInvite(client, req.params.token, { lock: true });
    validateJoin(pending, userId);
    if (await userHasBookingInSlot(client, userId, pending.date, pending.slot)) {
      throw new HttpError(409, 'คุณมีการจองอื่นในช่วงเวลานี้แล้ว');
    }
    await client.query('INSERT INTO booking_participants (booking_id, user_id) VALUES ($1, $2)', [pending.id, userId]);
    // Enough people: confirm the room and retire the invite.
    if (pending.participants.length + 1 >= (pending.space.minGroupSize ?? 3)) {
      await client.query(
        `UPDATE bookings SET status = 'confirmed', invite_token = NULL, updated_at = now() WHERE id = $1`,
        [pending.id],
      );
    }
    return findBookingForUser(client, pending.id, userId);
  });
  res.json({ booking });
}));

bookingsRouter.post('/', wrap(async (req, res) => {
  const userId = currentUserId(req);
  const { spaceId, date, slot, seatId } = req.body ?? {};
  validateDateAndSlot(date, slot);

  const booking = await transaction(async (client) => {
    // Lock order user → space, everywhere, so parallel requests queue instead of deadlocking.
    await lockUser(client, userId);
    const space = await findSpace(client, String(spaceId ?? ''), { lock: true });
    if (!space) throw new HttpError(404, 'ไม่พบพื้นที่');
    if (await userHasBookingInSlot(client, userId, date, slot)) {
      throw new HttpError(409, 'คุณมีการจองอื่นในช่วงเวลานี้แล้ว');
    }
    validateCapacity(space, await takenInSlot(client, space.id, date, slot), seatId);

    let seatRowId = null;
    if (space.category === 'library') {
      const seat = await client.query('SELECT id FROM seats WHERE space_id = $1 AND label = $2', [space.id, seatId]);
      seatRowId = seat.rows[0].id;
    }
    const isMeeting = space.category === 'meeting';
    const id = newBookingId();
    await client.query(
      `INSERT INTO bookings (id, owner_id, space_id, seat_id, booking_date, slot, status, invite_token, invite_expires_at)
       VALUES ($1, $2, $3, $4, $5::date, $6, $7, $8, $9)`,
      [
        id, userId, space.id, seatRowId, date, slot,
        isMeeting ? 'pending_group' : 'confirmed',
        isMeeting ? randomBytes(12).toString('base64url') : null,
        isMeeting ? new Date(Date.now() + INVITE_TTL_MS) : null,
      ],
    );
    await client.query('INSERT INTO booking_participants (booking_id, user_id) VALUES ($1, $2)', [id, userId]);
    return findBookingForUser(client, id, userId);
  }).catch((error) => {
    // Backstop: the unique index caught a seat taken at the same instant.
    if (error.code === '23505') throw new HttpError(409, 'ที่นั่งนี้ถูกจองแล้ว');
    throw error;
  });
  res.status(201).json({ booking });
}));

bookingsRouter.get('/:id', wrap(async (req, res) => {
  res.json({ booking: await requireOwnBooking(db, req.params.id, currentUserId(req)) });
}));

bookingsRouter.post('/:id/cancel', wrap(async (req, res) => {
  const userId = currentUserId(req);
  const booking = await transaction(async (client) => {
    const current = await requireOwnBooking(client, req.params.id, userId, { lock: true });
    if (current.ownerId !== userId) throw new HttpError(403, 'เฉพาะผู้จองเท่านั้นที่ยกเลิกได้');
    if (!['pending_group', 'confirmed'].includes(current.status)) throw new HttpError(409, 'ยกเลิกรายการนี้ไม่ได้');
    await client.query(
      `UPDATE bookings SET status = 'cancelled', invite_token = NULL, updated_at = now() WHERE id = $1`,
      [current.id],
    );
    return findBookingForUser(client, current.id, userId);
  });
  res.json({ booking });
}));

bookingsRouter.post('/:id/checkin', wrap(async (req, res) => {
  const userId = currentUserId(req);
  const booking = await transaction(async (client) => {
    const current = await requireOwnBooking(client, req.params.id, userId, { lock: true });
    if (current.status !== 'confirmed') throw new HttpError(409, 'เช็กอินได้เฉพาะรายการที่ยืนยันแล้ว');
    const now = Date.now();
    const opens = slotStart(current.date, current.slot).getTime() - CHECKIN_EARLY_MINUTES * 60 * 1000;
    if (now < opens || now >= slotEnd(current.date, current.slot).getTime()) {
      throw new HttpError(409, `เช็กอินได้ตั้งแต่ ${CHECKIN_EARLY_MINUTES} นาทีก่อนเริ่มจนจบช่วงเวลา`);
    }
    await client.query(
      `UPDATE bookings SET status = 'checked_in', checked_in_at = now(), updated_at = now() WHERE id = $1`,
      [current.id],
    );
    return findBookingForUser(client, current.id, userId);
  });
  res.json({ booking });
}));
