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

export function toDateString(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`)
  date.setDate(date.getDate() + days)
  return toDateString(date)
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
