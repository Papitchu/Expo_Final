import { slotLabel } from '../utils/format.js'

function remainingText(slot, category) {
  if (slot.past) return 'ผ่านไปแล้ว'
  if (slot.remaining <= 0) return 'เต็ม'
  return category === 'meeting' ? 'ว่าง' : `ว่าง ${slot.remaining}`
}

/** Slot grid. Read-only when `onSelect` is omitted. */
export default function SlotPicker({ slots, category, value, onSelect }) {
  return (
    <div className="slot-grid">
      {slots.map((slot) => {
        const disabled = slot.past || slot.remaining <= 0
        return (
          <button
            key={slot.slot}
            type="button"
            className={`slot ${disabled ? 'slot-full' : ''}`}
            aria-pressed={value === slot.slot}
            disabled={!onSelect || disabled}
            onClick={() => onSelect?.(slot.slot)}
          >
            <strong>{slotLabel(slot.slot)}</strong>
            <span>{remainingText(slot, category)}</span>
          </button>
        )
      })}
    </div>
  )
}
