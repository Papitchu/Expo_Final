import { liveDensity, slotAvailability, sweepBookings } from '../services/availability.js'
import { describeRules } from '../services/rules.js'
import { store } from '../services/store.js'
import { isValidDate, toDateString } from '../services/time.js'

function withLiveStats(space, bookings) {
  return { ...space, ...liveDensity(space, bookings), ruleSummary: describeRules(space) }
}

export function listSpaces(req, res) {
  const bookings = sweepBookings()
  res.json({ spaces: store.spaces().map((space) => withLiveStats(space, bookings)) })
}

export function getSpace(req, res) {
  const space = store.findSpace(req.params.id)
  if (!space) return res.status(404).json({ error: 'ไม่พบพื้นที่' })
  res.json({ space: withLiveStats(space, sweepBookings()) })
}

export function getAvailability(req, res) {
  const space = store.findSpace(req.params.id)
  if (!space) return res.status(404).json({ error: 'ไม่พบพื้นที่' })
  const date = req.query.date || toDateString()
  if (!isValidDate(date)) return res.status(400).json({ error: 'วันที่ไม่ถูกต้อง' })
  res.json({ date, slots: slotAvailability(space, sweepBookings(), date) })
}
