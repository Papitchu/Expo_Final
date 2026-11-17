import { Link, useParams } from 'react-router-dom'
import DensityBadge from '../components/DensityBadge.jsx'
import SlotPicker from '../components/SlotPicker.jsx'
import { usePolling } from '../hooks/usePolling.js'
import { getAvailability, getSpace } from '../services/spaces.js'
import { categoryLabel, toDateString } from '../utils/format.js'

export default function SpaceDetailPage() {
  const { id } = useParams()
  const space = usePolling(() => getSpace(id), 20_000, id)
  const slots = usePolling(() => getAvailability(id, toDateString()), 20_000, id)

  if (space.error) return <p className="error-message" role="alert">{space.error.message}</p>
  if (!space.data) return <p>กำลังโหลด…</p>
  const s = space.data

  return (
    <section>
      <Link className="text-link" to="/">← กลับหน้าหลัก</Link>
      <p className="space-category">{categoryLabel(s.category)}</p>
      <h1>{s.name}</h1>
      <p>{s.building} · {s.floor} · ความจุ {s.capacity} {s.category === 'library' ? 'ที่นั่ง' : 'คน'}</p>
      <DensityBadge activeCount={s.activeCount} capacity={s.capacity} density={s.density} />

      <h2>สิ่งอำนวยความสะดวก</h2>
      <ul className="tag-list">{s.amenities.map((a) => <li key={a}>{a}</li>)}</ul>

      <h2>กฎการใช้พื้นที่</h2>
      <ul>{s.ruleSummary.map((rule) => <li key={rule}>{rule}</li>)}</ul>

      <h2>ช่วงเวลาวันนี้</h2>
      {slots.data ? <SlotPicker slots={slots.data} category={s.category} /> : <p>กำลังโหลดช่วงเวลา…</p>}

      <Link className="button-link" to={`/spaces/${s.id}/book`}>เลือกวันและเวลาจอง</Link>
    </section>
  )
}
