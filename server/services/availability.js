import { store } from './store.js'
import { SLOTS, currentSlot, slotEnd, toDateString } from './time.js'

/** Statuses that hold a seat/room for their slot. */
export const BLOCKING = ['pending_group', 'confirmed', 'checked_in']
/** Statuses that count as people physically present. */
export const ACTIVE = ['confirmed', 'checked_in']

/**
 * Lazily advance time-based statuses (no cron): expired invites and finished slots.
 * Returns all bookings after the sweep.
 */
export function sweepBookings(now = new Date()) {
  const bookings = store.bookings()
  let changed = false
  for (const booking of bookings) {
    let next = null
    if (booking.status === 'pending_group' && new Date(booking.inviteExpiresAt) < now) next = 'expired'
    else if (ACTIVE.includes(booking.status) && slotEnd(booking.date, booking.slot) < now) next = 'completed'
    if (!next) continue
    booking.status = next
    booking.inviteToken = null
    booking.updatedAt = now.toISOString()
    changed = true
  }
  if (changed) store.saveBookings(bookings)
  return bookings
}

function occupants(booking) {
  return booking.category === 'meeting' ? booking.participants.length : 1
}

/** Live density: people in active bookings for the current slot / capacity. */
export function liveDensity(space, bookings, now = new Date()) {
  const slot = currentSlot(now)
  if (!slot) return { activeCount: 0, density: 0 }
  const date = toDateString(now)
  const activeCount = bookings
    .filter((b) => b.spaceId === space.id && b.date === date && b.slot === slot && ACTIVE.includes(b.status))
    .reduce((sum, b) => sum + occupants(b), 0)
  return { activeCount, density: Math.min(activeCount / space.capacity, 1) }
}

export function bookingsInSlot(bookings, spaceId, date, slot) {
  return bookings.filter(
    (b) => b.spaceId === spaceId && b.date === date && b.slot === slot && BLOCKING.includes(b.status),
  )
}

/** Per-slot availability for a space on a date. */
export function slotAvailability(space, bookings, date, now = new Date()) {
  return SLOTS.map((slot) => {
    const taken = bookingsInSlot(bookings, space.id, date, slot)
    const past = slotEnd(date, slot) <= now
    if (space.category === 'library') {
      const takenSeats = taken.map((b) => b.seatId)
      return { slot, past, remaining: space.capacity - takenSeats.length, takenSeats }
    }
    if (space.category === 'coworking') {
      return { slot, past, remaining: space.capacity - taken.length }
    }
    return { slot, past, remaining: taken.length ? 0 : 1 }
  })
}
