import { Link } from 'react-router-dom'
import { formatDistance } from '../utils/distance.js'

const FALLBACK_MESSAGES = {
  denied: 'ไม่ได้รับอนุญาตให้เข้าถึงตำแหน่ง',
  error: 'ระบุตำแหน่งไม่สำเร็จ',
  unavailable: 'เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง',
}

/**
 * Nearest-workspace banner. With GPS it names the closest open space;
 * otherwise the user picks the building they're in as a manual fallback.
 */
export default function NearestAlert({ geo, nearest, buildings, manualBuilding, onManualBuilding }) {
  const usingGps = geo.status === 'ok'
  const hasLocation = usingGps || manualBuilding

  return (
    <aside className="nearest-alert" aria-live="polite">
      {geo.status === 'locating' && <p>📍 กำลังหาตำแหน่งของคุณ…</p>}

      {!usingGps && geo.status !== 'locating' && (
        <div className="nearest-fallback">
          <p>📍 {FALLBACK_MESSAGES[geo.status]} — เลือกอาคารที่คุณอยู่แทน</p>
          <div className="nearest-controls">
            <select value={manualBuilding} onChange={(e) => onManualBuilding(e.target.value)} aria-label="อาคารที่คุณอยู่">
              <option value="">เลือกอาคาร</option>
              {buildings.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            {geo.status !== 'unavailable' && (
              <button type="button" className="secondary" onClick={geo.retry}>ลองระบุตำแหน่งอีกครั้ง</button>
            )}
          </div>
        </div>
      )}

      {hasLocation && nearest && (
        <p className="nearest-result">
          พื้นที่ว่างใกล้คุณที่สุด: <strong>{nearest.name}</strong> ({nearest.building}
          {nearest.distance != null && nearest.distance > 0 && <> · {formatDistance(nearest.distance)}</>})
          <Link className="card-link" to={`/spaces/${nearest.id}/book`}>จองเลย →</Link>
        </p>
      )}
      {hasLocation && !nearest && <p>ไม่มีพื้นที่ว่างในหมวดที่เลือกตอนนี้</p>}
    </aside>
  )
}
