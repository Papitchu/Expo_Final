import { densityStatus } from '../utils/density.js'

export default function DensityBadge({ activeCount, capacity, density }) {
  const { level, label } = densityStatus(density)
  return (
    <div className={`density density-${level}`}>
      <span className="density-label">
        <i aria-hidden="true" /> {label}
        <span className="density-count">{activeCount}/{capacity} คนตอนนี้</span>
      </span>
      <span className="density-bar" aria-hidden="true">
        <span style={{ width: `${Math.round(density * 100)}%` }} />
      </span>
    </div>
  )
}
