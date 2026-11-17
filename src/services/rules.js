// Booking rules per space category. Pure functions: callers load the data.
import { HttpError } from '../http.js';
import { BOOKING_WINDOW_DAYS, SLOTS, addDays, isValidDate, slotEnd, todayBangkok } from '../dates.js';

/** Human-readable rule summary shown on the space detail page. */
export function describeRules(space) {
  const byCategory = {
    library: 'จองได้ 1 คนต่อ 1 ที่นั่ง ต้องเลือกที่นั่งก่อนยืนยัน',
    coworking: 'จองแบบรายบุคคล ไม่ต้องเลือกที่นั่ง รับได้ตามความจุของพื้นที่',
    meeting: `ต้องมีผู้ใช้อย่างน้อย ${space.minGroupSize ?? 3} คน ผู้จองจะได้ QR code ให้เพื่อนสแกนเข้าร่วมภายในเวลาที่กำหนด`,
  };
  return [byCategory[space.category], ...(space.rules ?? [])];
}

/** Date/slot checks that don't need the database. */
export function validateDateAndSlot(date, slot, now = new Date()) {
  if (!isValidDate(date) || !SLOTS.includes(slot)) throw new HttpError(400, 'วันที่หรือช่วงเวลาไม่ถูกต้อง');
  const today = todayBangkok(now);
  if (date < today || date > addDays(today, BOOKING_WINDOW_DAYS)) {
    throw new HttpError(400, `จองล่วงหน้าได้ไม่เกิน ${BOOKING_WINDOW_DAYS} วัน`);
  }
  if (slotEnd(date, slot) <= now) throw new HttpError(400, 'ช่วงเวลานี้ผ่านไปแล้ว');
}

/**
 * Capacity checks for a new booking.
 * `taken` = active bookings in this space/slot, each { seatLabel }.
 */
export function validateCapacity(space, taken, seatLabel) {
  if (space.category === 'library') {
    if (!seatLabel || !space.seats.includes(seatLabel)) throw new HttpError(400, 'กรุณาเลือกที่นั่ง');
    if (taken.some((b) => b.seatLabel === seatLabel)) throw new HttpError(409, 'ที่นั่งนี้ถูกจองแล้ว');
  } else if (space.category === 'coworking') {
    if (taken.length >= space.capacity) throw new HttpError(409, 'พื้นที่เต็มในช่วงเวลานี้');
  } else if (space.category === 'meeting') {
    if (taken.length) throw new HttpError(409, 'ห้องถูกจองแล้วในช่วงเวลานี้');
  }
}

/** Checks for joining a pending meeting-room group. */
export function validateJoin(booking, userId, now = new Date()) {
  if (!booking || booking.status !== 'pending_group') throw new HttpError(404, 'ลิงก์เชิญไม่ถูกต้องหรือหมดอายุแล้ว');
  if (new Date(booking.inviteExpiresAt) < now) throw new HttpError(410, 'ลิงก์เชิญหมดอายุแล้ว');
  if (booking.participants.includes(userId)) throw new HttpError(409, 'คุณอยู่ในกลุ่มนี้แล้ว');
  if (booking.participants.length >= booking.space.capacity) throw new HttpError(409, 'ห้องเต็มแล้ว');
}
