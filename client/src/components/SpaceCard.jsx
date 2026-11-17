import { Link } from 'react-router-dom'
import { formatDistance } from '../utils/distance.js'
import { categoryLabel } from '../utils/format.js'
import DensityBadge from './DensityBadge.jsx'

export default function SpaceCard({ space, hideBuilding = false }) {
  return (
    <article className="record space-card">
      <p className="space-category">{categoryLabel(space.category)}</p>
      <h3>{space.name}</h3>
      <p>
        {hideBuilding ? space.floor : <>{space.building} · {space.floor}</>}
        {!hideBuilding && space.distance != null && <> · {formatDistance(space.distance)}</>}
      </p>
      <DensityBadge activeCount={space.activeCount} capacity={space.capacity} density={space.density} />
      <Link className="card-link" to={`/spaces/${space.id}`}>ดูรายละเอียด →</Link>
    </article>
  )
}
