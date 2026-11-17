import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/auth.js'
import { usePolling } from '../hooks/usePolling.js'
import { joinInvite, previewInvite } from '../services/bookings.js'
import { formatDate, slotLabel } from '../utils/format.js'

export default function JoinGroupPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: booking, error } = usePolling(() => previewInvite(token), 5_000, token)
  const [joinError, setJoinError] = useState('')
  const [busy, setBusy] = useState(false)

  if (error && !booking) {
    return (
      <section>
        <h1>เข้าร่วมกลุ่มไม่ได้</h1>
        <p className="error-message" role="alert">{error.message}</p>
        <Link className="text-link" to="/">กลับหน้าหลัก</Link>
      </section>
    )
  }
  if (!booking) return <p>กำลังโหลดคำเชิญ…</p>

  const alreadyIn = booking.participants.includes(user?.id)
  const needed = booking.space?.minGroupSize ?? 3

  async function join() {
    setBusy(true)
    setJoinError('')
    try {
      const joined = await joinInvite(token)
      const flash = joined.status === 'confirmed' ? 'เข้าร่วมแล้ว — สมาชิกครบ การจองได้รับการยืนยัน!' : 'เข้าร่วมกลุ่มแล้ว'
      navigate(`/bookings/${joined.id}`, { state: { flash } })
    } catch (err) {
      setJoinError(err.message)
      setBusy(false)
    }
  }

  return (
    <section>
      <p className="space-category">คำเชิญเข้าร่วมห้องประชุม</p>
      <h1>{booking.space?.name}</h1>
      <dl>
        <dt>สถานที่</dt><dd>{booking.space?.building} · {booking.space?.floor}</dd>
        <dt>วันที่</dt><dd>{formatDate(booking.date)}</dd>
        <dt>เวลา</dt><dd>{slotLabel(booking.slot)}</dd>
        <dt>สมาชิก</dt><dd>{booking.participants.length}/{needed} คน · {booking.participantEmails.join(', ')}</dd>
      </dl>
      {joinError && <p className="error-message" role="alert">{joinError}</p>}
      {alreadyIn ? (
        <Link className="button-link" to={`/bookings/${booking.id}`}>คุณอยู่ในกลุ่มนี้แล้ว — ดูการจอง</Link>
      ) : (
        <button type="button" disabled={busy} onClick={join}>{busy ? 'กำลังเข้าร่วม…' : 'เข้าร่วมกลุ่ม'}</button>
      )}
    </section>
  )
}
