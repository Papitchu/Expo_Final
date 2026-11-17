import { CATEGORIES } from '../utils/format.js'

const OPTIONS = [{ id: '', label: 'ทั้งหมด' }, ...CATEGORIES]

export default function CategoryFilter({ value, onChange }) {
  return (
    <div className="chips" role="group" aria-label="ประเภทพื้นที่">
      {OPTIONS.map((option) => (
        <button
          key={option.id || 'all'}
          type="button"
          className="chip"
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
