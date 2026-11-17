export const CATEGORIES = [
  { id: 'library', label: 'ห้องสมุด' },
  { id: 'coworking', label: 'Co-working' },
  { id: 'meeting', label: 'ห้องประชุม' },
]

export const categoryLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label ?? id

export const STATUS_LABELS = {
  pending_group: 'รอสมาชิกเข้าร่วม',
  confirmed: 'ยืนยันแล้ว',
  checked_in: 'เช็กอินแล้ว',
  cancelled: 'ยกเลิกแล้ว',
  expired: 'หมดอายุ',
  completed: 'เสร็จสิ้น',
}

export const UPCOMING_STATUSES = ['pending_group', 'confirmed', 'checked_in']

/** Today's date (YYYY-MM-DD) in Thailand, matching the server, whatever the device's timezone. */
export function toDateString(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(date)
}

export function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function slotLabel(slot) {
  const end = `${String(Number(slot.slice(0, 2)) + 1).padStart(2, '0')}:00`
  return `${slot}–${end}`
}

export function formatDate(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('th-TH', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function formatTimestamp(iso) {
  return new Date(iso).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })
}
