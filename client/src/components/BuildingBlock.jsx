import { useId } from 'react'
import { formatDistance } from '../utils/distance.js'
import DensityBadge from './DensityBadge.jsx'
import SpaceCard from './SpaceCard.jsx'

/** One building: its overall occupancy, distance, and the places inside it. */
export default function BuildingBlock({ building }) {
  const { name, spaces, activeCount, capacity, distance } = building
  const density = capacity ? Math.min(activeCount / capacity, 1) : 0
  const headingId = useId() // building names contain spaces, so they can't be used as ids

  return (
    <section className="building-block" aria-labelledby={headingId}>
      <header className="building-header">
        <div>
          <h2 id={headingId}><span aria-hidden="true">🏢 </span>{name}</h2>
          <p>
            {spaces.length} พื้นที่
            {distance != null && <> · {formatDistance(distance)}</>}
          </p>
        </div>
        <div className="building-density">
          <DensityBadge activeCount={activeCount} capacity={capacity} density={density} />
        </div>
      </header>
      <div className="records building-spaces">
        {spaces.map((space) => <SpaceCard key={space.id} space={space} hideBuilding />)}
      </div>
    </section>
  )
}
