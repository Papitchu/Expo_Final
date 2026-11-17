import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge.jsx'
import { usePolling } from '../hooks/usePolling.js'
import { myBookings } from '../services/bookings.js'
import { UPCOMING_STATUSES, formatDate, formatTimestamp, slotLabel } from '../utils/format.js'

export default function MyBookingsPage() {
  const { state } = useLocation()
  const [tab, setTab] = useState('upcoming')
  const { data, error, loading } = usePolling(myBookings, 30_000)

  const rows = (data ?? []).filter((b) => UPCOMING_STATUSES.includes(b.status) === (tab === 'upcoming'))

  return (
    <section>
      <h1>การจองของฉัน</h1>
      {state?.flash && <p className="flash" role="status">{state.flash}</p>}

      <div className="chips" role="tablist">
        {[['upcoming', 'กำลังจะมาถึง'], ['past', 'ประวัติ']].map(([key, label]) => (
          <button key={key} type="button" role="tab" className="chip" aria-selected={tab === key} aria-pressed={tab === key} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {error && <p className="error-message" role="alert">{error.message}</p>}
      {loading && !data && <p>กำลังโหลด…</p>}

      <div className="records">
        {rows.map((b) => (
          <article key={b.id} className={`record ${state?.highlight === b.id ? 'record-highlight' : ''}`}>
            <StatusBadge status={b.status} />
            <h3>{b.space?.name}</h3>
            <p>
              {formatDate(b.date)} · {slotLabel(b.slot)}
              {b.seatId && <> · ที่นั่ง {b.seatId}</>}
              {b.category === 'meeting' && <> · {b.participants.length} คน</>}
            </p>
            <p className="timestamp">จองเมื่อ {formatTimestamp(b.createdAt)} · {b.id}</p>
            <Link className="card-link" to={`/bookings/${b.id}`}>รายละเอียด →</Link>
          </article>
        ))}
      </div>
      {data && !rows.length && (
        <p>
          {tab === 'upcoming' ? 'ยังไม่มีการจองที่กำลังจะมาถึง' : 'ยังไม่มีประวัติการจอง'} ·{' '}
          <Link className="text-link" to="/">ค้นหาพื้นที่</Link>
        </p>
      )}
    </section>
  )
}
