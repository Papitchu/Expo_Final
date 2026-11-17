import { BLOCKING, bookingsInSlot } from './availability.js'
import { SLOTS, isValidDate, isWithinBookingWindow, slotEnd } from './time.js'

export class RuleError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

/** Human-readable rule summary shown on the space detail page. */
export function describeRules(space) {
  const byCategory = {
    library: 'จองได้ 1 คนต่อ 1 ที่นั่ง ต้องเลือกที่นั่งก่อนยืนยัน',
    coworking: 'จองแบบรายบุคคล ไม่ต้องเลือกที่นั่ง รับได้ตามความจุของพื้นที่',
    meeting: `ต้องมีผู้ใช้อย่างน้อย ${space.minGroupSize ?? 3} คน ผู้จองจะได้ QR code ให้เพื่อนสแกนเข้าร่วมภายในเวลาที่กำหนด`,
  }
  return [byCategory[space.category], ...(space.rules ?? [])]
}

function userHasBookingInSlot(bookings, userId, date, slot) {
  return bookings.some(
    (b) => b.date === date && b.slot === slot && BLOCKING.includes(b.status) && b.participants.includes(userId),
  )
}

/** Throws RuleError if the user may not book this space/slot. */
export function validateNewBooking({ space, date, slot, seatId, userId, bookings, now = new Date() }) {
  if (!space) throw new RuleError(404, 'ไม่พบพื้นที่')
  if (!isValidDate(date) || !SLOTS.includes(slot)) throw new RuleError(400, 'วันที่หรือช่วงเวลาไม่ถูกต้อง')
  if (!isWithinBookingWindow(date, now)) throw new RuleError(400, 'จองล่วงหน้าได้ไม่เกิน 7 วัน')
  if (slotEnd(date, slot) <= now) throw new RuleError(400, 'ช่วงเวลานี้ผ่านไปแล้ว')
  if (userHasBookingInSlot(bookings, userId, date, slot)) {
    throw new RuleError(409, 'คุณมีการจองอื่นในช่วงเวลานี้แล้ว')
  }

  const taken = bookingsInSlot(bookings, space.id, date, slot)

  if (space.category === 'library') {
    if (!seatId || !space.seats.includes(seatId)) throw new RuleError(400, 'กรุณาเลือกที่นั่ง')
    if (taken.some((b) => b.seatId === seatId)) throw new RuleError(409, 'ที่นั่งนี้ถูกจองแล้ว')
  } else if (space.category === 'coworking') {
    if (taken.length >= space.capacity) throw new RuleError(409, 'พื้นที่เต็มในช่วงเวลานี้')
  } else if (space.category === 'meeting') {
    if (taken.length) throw new RuleError(409, 'ห้องถูกจองแล้วในช่วงเวลานี้')
  }
}

/** Throws RuleError if the user may not join this group booking. */
export function validateJoin({ booking, space, userId, bookings, now = new Date() }) {
  if (!booking || booking.status !== 'pending_group') throw new RuleError(404, 'ลิงก์เชิญไม่ถูกต้องหรือหมดอายุแล้ว')
  if (new Date(booking.inviteExpiresAt) < now) throw new RuleError(410, 'ลิงก์เชิญหมดอายุแล้ว')
  if (booking.participants.includes(userId)) throw new RuleError(409, 'คุณอยู่ในกลุ่มนี้แล้ว')
  if (booking.participants.length >= space.capacity) throw new RuleError(409, 'ห้องเต็มแล้ว')
  if (userHasBookingInSlot(bookings, userId, booking.date, booking.slot)) {
    throw new RuleError(409, 'คุณมีการจองอื่นในช่วงเวลานี้แล้ว')
  }
}
