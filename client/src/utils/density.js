/** Map an occupancy ratio (0–1) to a colour level and Thai label. */
export function densityStatus(density) {
  if (density >= 0.8) return { level: 'high', label: density >= 1 ? 'เต็ม' : 'ใกล้เต็ม' }
  if (density >= 0.5) return { level: 'medium', label: 'ค่อนข้างแน่น' }
  return { level: 'low', label: 'ว่าง' }
}
