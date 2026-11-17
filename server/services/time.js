// One-hour booking slots, identified by their start time.
export const SLOTS = Array.from({ length: 12 }, (_, i) => `${String(8 + i).padStart(2, '0')}:00`)
export const BOOKING_WINDOW_DAYS = 7
export const CHECKIN_EARLY_MINUTES = 10

export function toDateString(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function slotWindow(date, slot) {
  const start = new Date(`${date}T${slot}:00`)
  const end = new Date(start.getTime() + 60 * 60 * 1000)
  return { start, end }
}

export function slotEnd(date, slot) {
  return slotWindow(date, slot).end
}

export function isValidDate(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(new Date(`${date}T00:00:00`).getTime())
}

export function isWithinBookingWindow(date, now = new Date()) {
  const today = new Date(`${toDateString(now)}T00:00:00`)
  const target = new Date(`${date}T00:00:00`)
  const diffDays = Math.round((target - today) / 86_400_000)
  return diffDays >= 0 && diffDays <= BOOKING_WINDOW_DAYS
}

/** The slot covering `now`, or null outside opening hours. */
export function currentSlot(now = new Date()) {
  const slot = `${String(now.getHours()).padStart(2, '0')}:00`
  return SLOTS.includes(slot) ? slot : null
}
