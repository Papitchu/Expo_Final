import crypto from 'node:crypto'
import { sweepBookings } from '../services/availability.js'
import { validateJoin, validateNewBooking } from '../services/rules.js'
import { store } from '../services/store.js'
import { CHECKIN_EARLY_MINUTES, slotWindow } from '../services/time.js'

const INVITE_TTL_MS = Number(process.env.INVITE_TTL_MINUTES || 15) * 60 * 1000

function present(booking) {
  const space = store.findSpace(booking.spaceId)
  const emails = new Map(store.users().map((u) => [u.id, u.email]))
  return {
    ...booking,
    space: space && { id: space.id, name: space.name, category: space.category, building: space.building, floor: space.floor, minGroupSize: space.minGroupSize },
    participantEmails: booking.participants.map((id) => emails.get(id) ?? 'unknown'),
  }
}

function findOwnBooking(bookings, id, userId) {
  return bookings.find((b) => b.id === id && b.participants.includes(userId))
}

export function myBookings(req, res) {
  const mine = sweepBookings()
    .filter((b) => b.participants.includes(req.user.id))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  res.json({ bookings: mine.map(present) })
}

export function getBooking(req, res) {
  const booking = findOwnBooking(sweepBookings(), req.params.id, req.user.id)
  if (!booking) return res.status(404).json({ error: 'ไม่พบรายการจอง' })
  res.json({ booking: present(booking) })
}

export function createBooking(req, res) {
  const { spaceId, date, slot, seatId } = req.body ?? {}
  const space = store.findSpace(spaceId)
  const bookings = sweepBookings()
  validateNewBooking({ space, date, slot, seatId, userId: req.user.id, bookings })

  const now = new Date()
  const isMeeting = space.category === 'meeting'
  const booking = {
    id: `BK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
    ownerId: req.user.id,
    participants: [req.user.id],
    spaceId: space.id,
    category: space.category,
    date,
    slot,
    seatId: space.category === 'library' ? seatId : null,
    status: isMeeting ? 'pending_group' : 'confirmed',
    inviteToken: isMeeting ? crypto.randomBytes(12).toString('base64url') : null,
    inviteExpiresAt: isMeeting ? new Date(now.getTime() + INVITE_TTL_MS).toISOString() : null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    checkedInAt: null,
  }
  bookings.push(booking)
  store.saveBookings(bookings)
  res.status(201).json({ booking: present(booking) })
}

export function previewInvite(req, res) {
  const booking = sweepBookings().find((b) => b.inviteToken === req.params.token)
  if (!booking) return res.status(404).json({ error: 'ลิงก์เชิญไม่ถูกต้องหรือหมดอายุแล้ว' })
  res.json({ booking: present(booking) })
}

export function joinInvite(req, res) {
  const bookings = sweepBookings()
  const booking = bookings.find((b) => b.inviteToken && b.inviteToken === req.params.token)
  const space = booking && store.findSpace(booking.spaceId)
  validateJoin({ booking, space, userId: req.user.id, bookings })

  booking.participants.push(req.user.id)
  if (booking.participants.length >= (space.minGroupSize ?? 3)) {
    booking.status = 'confirmed'
    booking.inviteToken = null
  }
  booking.updatedAt = new Date().toISOString()
  store.saveBookings(bookings)
  res.json({ booking: present(booking) })
}

/** PATCH { action: 'cancel' | 'checkin' } */
export function updateBooking(req, res) {
  const bookings = sweepBookings()
  const booking = findOwnBooking(bookings, req.params.id, req.user.id)
  if (!booking) return res.status(404).json({ error: 'ไม่พบรายการจอง' })
  const now = new Date()

  if (req.body?.action === 'cancel') {
    if (booking.ownerId !== req.user.id) return res.status(403).json({ error: 'เฉพาะผู้จองเท่านั้นที่ยกเลิกได้' })
    if (!['pending_group', 'confirmed'].includes(booking.status)) {
      return res.status(409).json({ error: 'ยกเลิกรายการนี้ไม่ได้' })
    }
    booking.status = 'cancelled'
    booking.inviteToken = null
  } else if (req.body?.action === 'checkin') {
    const { start, end } = slotWindow(booking.date, booking.slot)
    const opens = new Date(start.getTime() - CHECKIN_EARLY_MINUTES * 60 * 1000)
    if (booking.status !== 'confirmed') return res.status(409).json({ error: 'เช็กอินได้เฉพาะรายการที่ยืนยันแล้ว' })
    if (now < opens || now >= end) {
      return res.status(409).json({ error: `เช็กอินได้ตั้งแต่ ${CHECKIN_EARLY_MINUTES} นาทีก่อนเริ่มจนจบช่วงเวลา` })
    }
    booking.status = 'checked_in'
    booking.checkedInAt = now.toISOString()
  } else {
    return res.status(400).json({ error: 'คำสั่งไม่ถูกต้อง' })
  }

  booking.updatedAt = now.toISOString()
  store.saveBookings(bookings)
  res.json({ booking: present(booking) })
}
