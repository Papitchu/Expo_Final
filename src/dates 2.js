// All booking times are Thailand time, regardless of the server's own timezone
// (Vercel runs in UTC). Thailand has no daylight saving, so the offset is fixed.
const TIME_ZONE = 'Asia/Bangkok';
const UTC_OFFSET = '+07:00';

/** One-hour slots identified by start time: 08:00 … 19:00 (last one ends 20:00). */
export const SLOTS = Array.from({ length: 12 }, (_, i) => `${String(8 + i).padStart(2, '0')}:00`);
export const BOOKING_WINDOW_DAYS = 7;
export const CHECKIN_EARLY_MINUTES = 10;

/** Today's date (YYYY-MM-DD) in Thailand. */
export function todayBangkok(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(now);
}

/** True only for real calendar dates in YYYY-MM-DD form. */
export function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function addDays(date, days) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function slotStart(date, slot) {
  return new Date(`${date}T${slot}:00${UTC_OFFSET}`);
}

export function slotEnd(date, slot) {
  return new Date(slotStart(date, slot).getTime() + 60 * 60 * 1000);
}

/** The slot covering `now` in Thailand, or null outside opening hours. */
export function currentSlot(now = new Date()) {
  const hour = new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, hour: '2-digit', hourCycle: 'h23' }).format(now);
  const slot = `${hour}:00`;
  return SLOTS.includes(slot) ? slot : null;
}
