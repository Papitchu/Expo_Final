import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import SlotPicker from '../components/SlotPicker.jsx'
import { usePolling } from '../hooks/usePolling.js'
import { createBooking } from '../services/bookings.js'
import { getAvailability, getSpace } from '../services/spaces.js'
import { addDays, categoryLabel, formatDate, slotLabel, toDateString } from '../utils/format.js'

const BOOKING_WINDOW_DAYS = 7

export default function BookingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const today = toDateString()
  const maxDate = addDays(today, BOOKING_WINDOW_DAYS)

  const [date, setDate] = useState(today)
  const [slot, setSlot] = useState('')
  const [seat, setSeat] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const space = usePolling(() => getSpace(id), 0, id)
  const slots = usePolling(() => getAvailability(id, date), 15_000, `${id}|${date}`)

  if (space.error) return <p className="error-message" role="alert">{space.error.message}</p>
  if (!space.data) return <p>กำลังโหลด…</p>
  const s = space.data
  const isLibrary = s.category === 'library'
  const isMeeting = s.category === 'meeting'
  const selected = slots.data?.find((x) => x.slot === slot)
  const takenSeats = selected?.takenSeats ?? []
  const dayFull = slots.data?.every((x) => x.past || x.remaining <= 0)
  const ready = slot && (!isLibrary || seat)

  function changeDate(value) {
    setDate(value)
    setSlot('')
    setSeat('')
  }

  async function confirm(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const booking = await createBooking({ spaceId: s.id, date, slot, seatId: isLibrary ? seat : undefined })
      if (isMeeting) {
        navigate(`/bookings/${booking.id}`, { state: { flash: 'ล็อกห้องไว้ให้แล้ว ชวนเพื่อนสแกน QR ให้ครบก่อนหมดเวลา' } })
      } else {
        navigate('/bookings', { state: { flash: `จองสำเร็จ (${booking.id})`, highlight: booking.id } })
      }
    } catch (err) {
      setError(err.message)
      setBusy(false)
      slots.refresh()
    }
  }

  return (
    <section>
      <Link className="text-link" to={`/spaces/${s.id}`}>← {s.name}</Link>
      <h1>จอง{categoryLabel(s.category)}</h1>
      <p>{s.name} · {s.building} {s.floor}</p>

      <form onSubmit={confirm} className="booking-form">
        <label>
          วันที่
          <input type="date" value={date} min={today} max={maxDate} required onChange={(e) => changeDate(e.target.value)} />
        </label>

        <h2>เลือกช่วงเวลา</h2>
        {slots.data ? (
          <SlotPicker slots={slots.data} category={s.category} value={slot} onSelect={(v) => { setSlot(v); setSeat('') }} />
        ) : <p>กำลังโหลดช่วงเวลา…</p>}

        {dayFull && (
          <div className="alternatives">
            <p>วันนี้ไม่มีช่วงเวลาว่างแล้ว</p>
            {date < maxDate && (
              <button type="button" className="secondary" onClick={() => changeDate(addDays(date, 1))}>ดูวันถัดไป</button>
            )}
            <Link className="text-link" to="/">ดูพื้นที่อื่น</Link>
          </div>
        )}

        {isLibrary && slot && (
          <>
            <h2>เลือกที่นั่ง</h2>
            <div className="seat-grid">
              {s.seats.map((seatId) => {
                const taken = takenSeats.includes(seatId)
                return (
                  <button
                    key={seatId}
                    type="button"
                    className="seat"
                    disabled={taken}
                    aria-pressed={seat === seatId}
                    aria-label={`ที่นั่ง ${seatId}${taken ? ' (ไม่ว่าง)' : ''}`}
                    onClick={() => setSeat(seatId)}
                  >
                    {seatId}
                  </button>
                )
              })}
            </div>
          </>
        )}

        {ready && (
          <div className="summary">
            <h2>สรุปการจอง</h2>
            <dl>
              <dt>สถานที่</dt><dd>{s.name}</dd>
              <dt>วันที่</dt><dd>{formatDate(date)}</dd>
              <dt>เวลา</dt><dd>{slotLabel(slot)}</dd>
              {isLibrary && <><dt>ที่นั่ง</dt><dd>{seat}</dd></>}
            </dl>
            {isMeeting && (
              <p className="hint">
                ห้องประชุมต้องมีอย่างน้อย {s.minGroupSize} คน หลังยืนยันคุณจะได้ QR code ให้เพื่อนสแกนเข้าร่วม
              </p>
            )}
          </div>
        )}

        {error && <p className="error-message" role="alert">{error}</p>}
        <button type="submit" disabled={!ready || busy}>
          {busy ? 'กำลังจอง…' : isMeeting ? 'ยืนยันและสร้าง QR เชิญเพื่อน' : 'ยืนยันการจอง'}
        </button>
      </form>
    </section>
  )
}
