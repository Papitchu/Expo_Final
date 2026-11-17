import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import QRInvite from '../components/QRInvite.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { useAuth } from '../context/auth.js'
import { usePolling } from '../hooks/usePolling.js'
import { cancelBooking, checkInBooking, getBooking } from '../services/bookings.js'
import { formatDate, formatTimestamp, slotLabel } from '../utils/format.js'
export default function BookingDetailPage() {
  const { id } = useParams()
  const { state } = useLocation()
  const { user } = useAuth()
  const [interval, setIntervalMs] = useState(5_000)
  const { data: booking, error, refresh } = usePolling(() => getBooking(id), interval, id)
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)

  // Poll fast only while waiting for group members to join.
  const wanted = booking?.status === 'pending_group' ? 5_000 : 30_000
  if (booking && wanted !== interval) setIntervalMs(wanted)

  if (error && !booking) return <p className="error-message" role="alert">{error.message}</p>
  if (!booking) return <p>กำลังโหลด…</p>

  const isOwner = booking.ownerId === user?.id
  const canCancel = isOwner && ['pending_group', 'confirmed'].includes(booking.status)

  async function run(action) {
    setBusy(true)
    setActionError('')
    try {
      await action(booking.id)
      await refresh()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section>
      <Link className="text-link" to="/bookings">← การจองของฉัน</Link>
      {state?.flash && <p className="flash" role="status">{state.flash}</p>}
      <StatusBadge status={booking.status} />
      <h1>{booking.space?.name}</h1>
      <dl>
        <dt>รหัสการจอง</dt><dd>{booking.id}</dd>
        <dt>สถานที่</dt><dd>{booking.space?.building} · {booking.space?.floor}</dd>
        <dt>วันที่</dt><dd>{formatDate(booking.date)}</dd>
        <dt>เวลา</dt><dd>{slotLabel(booking.slot)}</dd>
        {booking.seatId && <><dt>ที่นั่ง</dt><dd>{booking.seatId}</dd></>}
        <dt>จองเมื่อ</dt><dd>{formatTimestamp(booking.createdAt)}</dd>
        {booking.checkedInAt && <><dt>เช็กอินเมื่อ</dt><dd>{formatTimestamp(booking.checkedInAt)}</dd></>}
        {booking.category === 'meeting' && (
          <><dt>สมาชิก</dt><dd>{booking.participantEmails.join(', ')}</dd></>
        )}
      </dl>

      {booking.status === 'pending_group' && booking.inviteToken && <QRInvite booking={booking} />}
      {booking.status === 'expired' && (
        <p className="error-message">สมาชิกไม่ครบ {booking.space?.minGroupSize} คนภายในเวลาที่กำหนด ห้องถูกปล่อยคืนแล้ว</p>
      )}

      {actionError && <p className="error-message" role="alert">{actionError}</p>}
      <div className="actions">
        {booking.status === 'confirmed' && (
          <button type="button" disabled={busy} onClick={() => run(checkInBooking)}>เช็กอิน</button>
        )}
        {canCancel && (
          <button
            type="button"
            className="secondary danger"
            disabled={busy}
            onClick={() => window.confirm('ยืนยันการยกเลิกการจองนี้?') && run(cancelBooking)}
          >
            ยกเลิกการจอง
          </button>
        )}
      </div>
    </section>
  )
}
