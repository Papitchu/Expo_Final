import { useMemo, useState } from 'react'
import BuildingBlock from '../components/BuildingBlock.jsx'
import CategoryFilter from '../components/CategoryFilter.jsx'
import NearestAlert from '../components/NearestAlert.jsx'
import { useAuth } from '../context/auth.js'
import { useGeolocation } from '../hooks/useGeolocation.js'
import { usePolling } from '../hooks/usePolling.js'
import { listSpaces } from '../services/spaces.js'
import { haversine } from '../utils/distance.js'

const LIVE_REFRESH_MS = 20_000

function matchesQuery(space, query) {
  if (!query) return true
  const text = [space.name, space.building, ...space.amenities].join(' ').toLocaleLowerCase()
  return text.includes(query.toLocaleLowerCase())
}

export default function HomePage() {
  const { user } = useAuth()
  const { data: spaces, error, loading } = usePolling(listSpaces, LIVE_REFRESH_MS)
  const geo = useGeolocation()
  const [category, setCategory] = useState('')
  const [query, setQuery] = useState('')
  const [manualBuilding, setManualBuilding] = useState('')

  const buildings = useMemo(() => [...new Set((spaces ?? []).map((s) => s.building))], [spaces])

  const origin = useMemo(() => {
    if (geo.status === 'ok') return geo.coords
    const ref = manualBuilding && spaces?.find((s) => s.building === manualBuilding)
    return ref ? { lat: ref.lat, lng: ref.lng } : null
  }, [geo.status, geo.coords, manualBuilding, spaces])

  const visible = useMemo(() => {
    const rows = (spaces ?? [])
      .map((s) => ({ ...s, distance: origin ? haversine(origin, s) : null }))
      .filter((s) => !category || s.category === category)
      .filter((s) => matchesQuery(s, query.trim()))
    return rows.sort((a, b) => (origin ? a.distance - b.distance : a.density - b.density))
  }, [spaces, origin, category, query])

  // Group the filtered places into one block per building, keeping the sort order:
  // the building with the nearest (or emptiest) place comes first.
  const buildingBlocks = useMemo(() => {
    const groups = new Map()
    for (const space of visible) {
      const group = groups.get(space.building) ?? {
        name: space.building, spaces: [], activeCount: 0, capacity: 0, distance: null,
      }
      group.spaces.push(space)
      group.activeCount += space.activeCount
      group.capacity += space.capacity
      if (space.distance != null) group.distance = Math.min(group.distance ?? Infinity, space.distance)
      groups.set(space.building, group)
    }
    return [...groups.values()]
  }, [visible])

  const nearest = origin ? visible.find((s) => s.density < 1) : null

  return (
    <section>
      <h1>สวัสดี {user?.name}</h1>

      <NearestAlert
        geo={geo}
        nearest={nearest}
        buildings={buildings}
        manualBuilding={manualBuilding}
        onManualBuilding={setManualBuilding}
      />

      <div className="filters">
        <CategoryFilter value={category} onChange={setCategory} />
        <input
          type="search"
          className="search"
          placeholder="ค้นหาชื่อพื้นที่ อาคาร หรือสิ่งอำนวยความสะดวก"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="ค้นหาพื้นที่"
        />
      </div>

      {error && <p className="error-message" role="alert">{error.message}</p>}
      {loading && !spaces && <p>กำลังโหลดพื้นที่…</p>}

      <div className="building-list">
        {buildingBlocks.map((building) => <BuildingBlock key={building.name} building={building} />)}
      </div>
      {spaces && !visible.length && <p>ไม่พบพื้นที่ตามเงื่อนไข</p>}
    </section>
  )
}
